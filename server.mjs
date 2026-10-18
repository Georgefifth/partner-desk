import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { AppError, compareCampaign, exportMarkdown } from './lib/domain.mjs';
import { QlooClient } from './lib/qloo.mjs';
import { example } from './lib/example.mjs';
import { publicCase } from './lib/public-case.mjs';

const publicFiles = { '/lib/assessment.mjs':['../lib/assessment.mjs','text/javascript'], '/lib/report.mjs':['../lib/report.mjs','text/javascript'], '/': ['index.html','text/html'], '/app.js': ['app.js','text/javascript'], '/input-tools.js':['input-tools.js','text/javascript'], '/runtime-config.js':['runtime-config.js','text/javascript'], '/styles.css': ['styles.css','text/css'], '/icon.svg': ['icon.svg','image/svg+xml'] };
export function createServer({ apiKey = '', baseUrl, accessToken = '', qloo = apiKey ? new QlooClient({ apiKey, baseUrl }) : null } = {}) {
  const limits = new Map();
  const server = http.createServer(async (req,res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const json = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && publicFiles[url.pathname]) {
        const [file,type] = publicFiles[url.pathname];
        res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
        return res.end(await readFile(new URL(`./public/${file}`, import.meta.url)));
      }
      if (!url.pathname.startsWith('/api/')) return json(404, { error: 'Page not found.' });
      if (req.headers.origin) {
        let origin; try { origin = new URL(req.headers.origin); } catch { throw new AppError('Invalid request origin.', 403); }
        if (origin.host !== req.headers.host) throw new AppError('Cross-origin requests are not allowed.', 403);
      }
      const ip = req.socket.remoteAddress;
      const window = limits.get(ip);
      if (!window || Date.now() > window.until) limits.set(ip, { count: 1, until: Date.now() + 60000 });
      else if (++window.count > 60) throw new AppError('Too many requests. Try again in a minute.', 429);
      if (limits.size > 1000) for (const [key,value] of limits) if (Date.now() > value.until) limits.delete(key);
      if (req.method === 'GET' && url.pathname === '/api/config') return json(200, { liveAvailable: Boolean(qloo), tokenRequired: Boolean(accessToken), version: '0.4.0' });
      if (req.method === 'GET' && url.pathname === '/api/example') return json(200, example);
      if (req.method === 'GET' && url.pathname === '/api/public-case') return json(200, publicCase);
      const authorize = () => {
        if (!qloo) throw new AppError('Live evidence is not configured. Use the illustrative example, or configure QLOO_API_KEY on the server.',503);
        if (accessToken) {
          const given = Buffer.from(req.headers.authorization?.replace(/^Bearer /,'') ?? ''); const expected = Buffer.from(accessToken);
          if (given.length !== expected.length || !timingSafeEqual(given,expected)) throw new AppError('Enter the access token for this desk to use live evidence.',401);
        }
      };
      if (req.method === 'GET' && url.pathname === '/api/search') { authorize(); return json(200, { entities: await qloo.search(url.searchParams.get('query'),url.searchParams.get('type')) }); }
      if (req.method !== 'POST' || !['/api/analyze','/api/export'].includes(url.pathname)) return json(404, { error: 'Endpoint not found.' });
      if (!req.headers['content-type']?.includes('application/json')) throw new AppError('Send JSON data.',415);
      let body = ''; let bytes = 0;
      for await (const chunk of req) { bytes += chunk.length; if (bytes > 65536) throw new AppError('The campaign is too large. Keep notes shorter.',413); body += chunk; }
      let payload; try { payload = JSON.parse(body); } catch { throw new AppError('The campaign contains invalid JSON.'); }
      if (url.pathname === '/api/export') {
        // Recompute from the original campaign, rather than trusting a fabricated client report.
        if (payload.campaign?.mode === 'live') authorize();
        const report = await compareCampaign(payload.campaign,qloo);
        return json(200, { markdown: exportMarkdown(report,Array.isArray(payload.pinnedIds) ? payload.pinnedIds : []) });
      }
      if (payload?.mode === 'live') authorize();
      return json(200, await compareCampaign(payload,qloo));
    } catch (error) {
      if (!res.headersSent) json(error instanceof AppError ? error.status : 500, { error: error instanceof AppError ? error.message : 'The desk could not complete this request. Try again.' });
      else res.end();
    }
  });
  server.requestTimeout = 30000; server.headersTimeout = 10000;
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const host = process.env.HOST || '127.0.0.1';
  if (!['127.0.0.1','localhost','::1'].includes(host) && process.env.QLOO_API_KEY && !process.env.ACCESS_TOKEN) {
    console.error('Set ACCESS_TOKEN before exposing live evidence on a public interface.'); process.exit(1);
  }
  const server = createServer({ apiKey: process.env.QLOO_API_KEY, baseUrl: process.env.QLOO_BASE_URL, accessToken: process.env.ACCESS_TOKEN });
  server.listen(Number(process.env.PORT || 4318),host,() => console.log(`Partner Desk is running at http://${host}:${process.env.PORT || 4318}`));
}
