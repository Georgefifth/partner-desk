import { AppError } from './domain.mjs';

const bases = new Set(['https://hackathon.api.qloo.com', 'https://api.qloo.com']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hasType = (entity, type) => entity.subtype === type || entity.type === type || (Array.isArray(entity.types) && entity.types.includes(type));
export function extractEntities(payload, search = false) {
  const entities = search && Array.isArray(payload?.results) ? payload.results : payload?.results?.entities;
  if (!Array.isArray(entities) || payload?.success === false) throw new AppError('Qloo returned an unexpected response shape.', 502);
  return entities;
}
export function readAffinity(entity) {
  const candidates = [entity?.query?.affinity, entity?.query?.affinity?.score, entity?.query?.measurements?.affinity, entity?.affinity];
  return candidates.find(n => typeof n === 'number' && Number.isFinite(n) && n >= -1 && n <= 1) ?? null;
}

export class QlooClient {
  constructor({ apiKey, baseUrl = 'https://hackathon.api.qloo.com', fetchImpl = fetch, wait = sleep, timeout = 10000, dailyLimit = 1000 }) {
    if (!bases.has(baseUrl)) throw new Error('QLOO_BASE_URL must be an approved Qloo HTTPS origin.');
    if (!Number.isInteger(dailyLimit) || dailyLimit < 0 || dailyLimit > 1000) throw new Error('QLOO_DAILY_LIMIT must be a whole number from 0 to 1000.');
    this.apiKey = apiKey; this.baseUrl = baseUrl; this.fetch = fetchImpl; this.wait = wait; this.timeout = timeout;
    this.cache = new Map(); this.queue = Promise.resolve(); this.dailyLimit = dailyLimit; this.calls = 0; this.day = '';
  }
  async request(path, params) {
    if (!this.apiKey) throw new AppError('The server needs a QLOO_API_KEY for live evidence.', 503);
    const url = new URL(path, this.baseUrl); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
    const cached = this.cache.get(url.href);
    if (cached && Date.now() - cached.at < 15 * 60 * 1000) return cached;
    const job = this.queue.then(async () => {
      await this.wait(260);
      const day = new Date().toISOString().slice(0,10);
      if (day !== this.day) { this.day = day; this.calls = 0; }
      for (let attempt = 0; attempt < 2; attempt++) {
        if (this.calls >= this.dailyLimit) throw new AppError('The server live-data daily limit has been reached.', 429);
        this.calls++;
        let response;
        try { response = await this.fetch(url, { headers: { 'X-Api-Key': this.apiKey, Accept: 'application/json' }, signal: AbortSignal.timeout(this.timeout), redirect: 'error' }); }
        catch { throw new AppError('Qloo could not be reached before the request timed out. Try again.', 502); }
        if (response.status === 429 && attempt === 0) { await this.wait(1000); continue; }
        if (!response.ok) {
          const message = { 401: 'Qloo rejected the API key. Check its environment and expiry.', 403: 'Qloo access is not enabled for this request.', 429: 'Qloo is rate-limiting requests. Wait and try again.' }[response.status] ?? 'Qloo could not complete the request. Try again.';
          throw new AppError(message, 502);
        }
        let data;
        try { data = await response.json(); } catch { throw new AppError('Qloo returned unreadable data.', 502); }
        const entry = { data, at: Date.now(), observedAt: new Date().toISOString(), request: { path, parameters: params } };
        this.cache.set(url.href, entry);
        if (this.cache.size > 300) this.cache.delete(this.cache.keys().next().value);
        return entry;
      }
    });
    this.queue = job.catch(() => {});
    return job;
  }
  async search(query, type) {
    if (!['brand','artist','podcast'].includes(type) || typeof query !== 'string' || query.trim().length < 2 || query.length > 100) throw new AppError('Enter 2–100 characters and a supported category.');
    const result = await this.request('/search', { query: query.trim(), types: `urn:entity:${type}`, take: 5 });
    return extractEntities(result.data, true).filter(e => hasType(e,`urn:entity:${type}`)).filter(e => typeof e.entity_id === 'string' && typeof e.name === 'string').map(e => ({ entity_id: e.entity_id, name: e.name, subtype: `urn:entity:${type}`, description: typeof e.properties?.description === 'string' ? e.properties.description.slice(0,500) : typeof e.disambiguation === 'string' ? e.disambiguation : '', website: Array.isArray(e.properties?.websites) ? e.properties.websites.find(x => typeof x === 'string' && x.startsWith('https://')) ?? '' : '' }));
  }
  async score(brandId, type, ids) {
    const params = { 'filter.type': `urn:entity:${type}`, 'signal.interests.entities': brandId, 'filter.results.entities': ids.join(','), take: ids.length };
    const result = await this.request('/v2/insights', params);
    const wanted = new Set(ids.map(x => x.toLowerCase())); const mapped = new Map();
    for (const e of extractEntities(result.data)) {
      const id = e.entity_id?.toLowerCase();
      if (!wanted.has(id) || !hasType(e,`urn:entity:${type}`)) continue;
      const affinity = readAffinity(e);
      if (affinity === null) continue;
      mapped.set(id, { origin: 'qloo-live', entity_id: e.entity_id, affinity, observedAt: result.observedAt, request: result.request, response: { entity_id: e.entity_id, name: e.name, subtype: e.subtype ?? e.type ?? null, types: e.types ?? null, query: e.query ?? null, affinity: e.affinity ?? null } });
    }
    return mapped;
  }
}
