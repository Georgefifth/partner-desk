import { demoAffinity } from './example.mjs';

export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const entityId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const amount = value => value === null || value === '' || value === undefined ? null : value;
export function safeUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}

export function validateCampaign(raw) {
  if (!raw || typeof raw !== 'object') throw new AppError('Enter a campaign.');
  if (!['demo', 'live', 'commercial'].includes(raw.mode)) throw new AppError('Choose demo, live or commercial mode.');
  const campaign = {
    mode: raw.mode, title: clean(raw.title, 100), brand: clean(raw.brand, 100), objective: clean(raw.objective, 1000),
    market: clean(raw.market, 80), format: clean(raw.format, 80), currency: clean(raw.currency, 3).toUpperCase(), budget: amount(raw.budget),
    brandEntity: raw.brandEntity, candidates: []
  };
  campaign.scenarioNotice=clean(raw.scenarioNotice,500);
  if (!campaign.title || !campaign.brand || !campaign.market || !campaign.format) throw new AppError('Add a campaign name, brand, target market and partnership format.');
  if (!['USD', 'GBP', 'EUR', 'MYR'].includes(campaign.currency)) throw new AppError('Choose a supported campaign currency.');
  if (typeof campaign.budget !== 'number' || !Number.isFinite(campaign.budget) || campaign.budget < 0 || campaign.budget > 1e9) throw new AppError('Enter a valid per-partner budget from 0 to 1 billion.');
  if (!Array.isArray(raw.candidates) || raw.candidates.length < 1 || raw.candidates.length > 12) throw new AppError('Add between 1 and 12 candidates.');
  if (campaign.mode === 'live' && (!entityId(raw.brandEntity?.entity_id) || raw.brandEntity?.subtype !== 'urn:entity:brand' || raw.brandEntity?.confirmed !== true)) throw new AppError('Search for and confirm the brand in Qloo before comparing.');
  const ids = new Set(); const mappedIds = new Set();
  for (const input of raw.candidates) {
    const c = {
      id: clean(input?.id, 80), name: clean(input?.name, 100), type: input?.type,
      fee: amount(input?.fee), markets: Array.isArray(input?.markets) ? input.markets.map(x => clean(x, 80)).filter(Boolean).slice(0, 20) : [],
      format: clean(input?.format, 80), source: safeUrl(input?.source), notes: clean(input?.notes, 1000), excluded: input?.excluded === true,
      entity: input?.entity
    };
    c.quoteBasis=input?.quoteBasis ?? 'unknown';
    c.quoteUnits=amount(input?.quoteUnits);
    c.quoteChannel=input?.quoteChannel ?? 'unknown';
    if(!['package','episode','week','cpm','unknown'].includes(c.quoteBasis))throw new AppError(`Choose a supported quote basis for ${c.name}.`);
    if(!['artist','podcast','website','newsletter','unknown'].includes(c.quoteChannel))throw new AppError(`Confirm what placement the quote covers for ${c.name}.`);
    if(c.quoteUnits!==null&&(!Number.isInteger(c.quoteUnits)||c.quoteUnits<1||c.quoteUnits>10000))throw new AppError(`Enter a whole number of episodes or weeks for ${c.name}, or leave it blank.`);
    if (!/^[a-zA-Z0-9_-]+$/.test(c.id) || ids.has(c.id)) throw new AppError('Each candidate needs a unique ID.');
    if (!c.name || !['artist', 'podcast'].includes(c.type)) throw new AppError('Each candidate needs a name and an artist or podcast category.');
    if (c.fee !== null && (typeof c.fee !== 'number' || !Number.isFinite(c.fee) || c.fee < 0 || c.fee > 1e9)) throw new AppError(`Enter a valid fee for ${c.name}, or leave it blank.`);
    if (c.entity) {
      if (!entityId(c.entity.entity_id) || c.entity.subtype !== `urn:entity:${c.type}` || c.entity.confirmed !== true) throw new AppError(`Confirm the correct Qloo identity for ${c.name}.`);
      if (mappedIds.has(c.entity.entity_id.toLowerCase())) throw new AppError('Two candidates map to the same Qloo identity. Keep one entry.');
      mappedIds.add(c.entity.entity_id.toLowerCase());
    }
    ids.add(c.id); campaign.candidates.push(c);
  }
  return campaign;
}

export function quoteCost(c){
  if(c.fee===null)return {amount:null,detail:'Request a quote.'};
  if(c.quoteBasis==='unknown')return {amount:null,detail:'Confirm whether this is a package, weekly, episode or CPM rate.'};
  if(c.quoteBasis==='cpm')return {amount:null,detail:'A CPM rate is not a package cost. Request a package quote or a delivery estimate before comparing budget.'};
  const unit=c.quoteBasis==='episode'?'episodes':'weeks';
  if(c.quoteBasis!=='package'&&c.quoteUnits===null)return {amount:null,detail:`Confirm how many ${unit} the campaign will buy.`};
  const quantity=c.quoteBasis==='package'?1:c.quoteUnits;
  return {amount:Math.round(c.fee*100)*quantity/100,detail:c.quoteBasis==='package'?'Whole-package quote.':`${c.fee} × ${quantity} ${unit}; calculated from your supplied rate.`};
}

export function commercialChecks(c, campaign) {
  const same = (a, b) => a.toLowerCase() === b.toLowerCase();
  const cost=quoteCost(c);
  return [
    { label: 'Budget', state: cost.amount === null ? 'unknown' : cost.amount <= campaign.budget ? 'pass' : 'fail', detail: cost.amount === null ? cost.detail : `${cost.amount <= campaign.budget ? 'Within' : 'Above'} the per-partner budget. ${cost.detail}` },
    { label: 'Placement', state:c.quoteChannel==='unknown'?'unknown':c.quoteChannel===c.type?'pass':'fail',detail:c.quoteChannel==='unknown'?'Confirm which channel this quote or offer covers.':c.quoteChannel===c.type?`Supplied offer covers ${c.type==='artist'?'an artist collaboration':'a podcast placement'}.`:`This offer covers ${c.quoteChannel}, not ${c.type==='artist'?'an artist collaboration':'a podcast placement'}. Do not reuse its rate for another channel.` },
    { label: 'Market', state: !c.markets.length ? 'unknown' : c.markets.some(m => same(m, campaign.market) || same(m, 'Global')) ? 'pass' : 'fail', detail: !c.markets.length ? 'Confirm campaign delivery in the target market.' : `Supplied delivery markets: ${c.markets.join(', ')}. Audience geography is not verified.` },
    { label: 'Format', state: !c.format ? 'unknown' : same(c.format, campaign.format) ? 'pass' : 'fail', detail: !c.format ? 'Confirm the partnership format.' : `Supplied format: ${c.format}.` },
    ...(c.excluded ? [{ label: 'Team exclusion', state: 'fail', detail: 'Excluded by your team.' }] : [])
  ];
}

export async function compareCampaign(raw, qloo) {
  const campaign = validateCampaign(raw);
  const trace = [{ tool: 'Check campaign', detail: `Validated ${campaign.candidates.length} candidates and per-partner terms.` }];
  const culture = new Map(); const warnings = [];
  if (campaign.mode === 'demo') {
    trace.push({ tool: 'Load illustrative evidence', detail: 'Synthetic example values. No Qloo request was made.' });
    for (const c of campaign.candidates) {
      const known = Object.hasOwn(demoAffinity, c.id);
      // Only bind fixtures to their known example identity; a renamed candidate must not inherit a score.
      const names = { 'bon-iver': 'Bon Iver', outside: 'Outside Podcast', khruangbin: 'Khruangbin', national: 'The National', daily: 'The Daily' };
      if (known && names[c.id] === c.name && campaign.brand === 'Patagonia' && ((['outside','daily'].includes(c.id) && c.type === 'podcast') || (!['outside','daily'].includes(c.id) && c.type === 'artist'))) {
        culture.set(c.id, { affinity: demoAffinity[c.id], origin: 'synthetic-demo', entity_id: `illustrative-${c.id}`, request: null, observedAt: null, response: { affinity: demoAffinity[c.id], note: 'Invented example, not observed Qloo evidence.' } });
      }
    }
  } else if (campaign.mode === 'live') {
    if (!qloo) throw new AppError('Live Qloo access is not configured on this server.', 503);
    for (const type of ['artist', 'podcast']) {
      const candidates = campaign.candidates.filter(c => c.type === type && c.entity && !c.excluded);
      if (!candidates.length) continue;
      try {
        const scored = await qloo.score(campaign.brandEntity.entity_id, type, candidates.map(c => c.entity.entity_id));
        trace.push({ tool: 'Compare Qloo candidates', detail: `${type}: ${scored.size} of ${candidates.length} confirmed candidates returned evidence.` });
        for (const c of candidates) if (scored.has(c.entity.entity_id.toLowerCase())) culture.set(c.id, scored.get(c.entity.entity_id.toLowerCase()));
      } catch (error) {
        warnings.push(`${type === 'artist' ? 'Artist' : 'Podcast'} evidence unavailable: ${error instanceof AppError ? error.message : 'Qloo could not be reached. Try again.'}`);
      }
    }
  } else trace.push({tool:'Commercial review only',detail:'No cultural evidence was requested or inferred. Commercial terms are user-supplied.'});
  const rows = campaign.candidates.map(c => {
    const evidence = culture.get(c.id) ?? null;
    const checks = commercialChecks(c, campaign);
    const failed = checks.filter(x => x.state === 'fail');
    const unknown = checks.filter(x => x.state === 'unknown');
    const weakSignal = evidence && evidence.affinity <= 0;
    const decision = failed.length ? 'does-not-fit' : unknown.length || !evidence || weakSignal ? 'needs-information' : 'worth-a-conversation';
    const questions = [
      ...unknown.map(x => x.detail),
      ...failed.map(x => `Resolve ${x.label.toLowerCase()}: ${x.detail}`),
      ...(!evidence ? ['Confirm the Qloo identity and obtain cultural evidence; missing data is not a negative signal.'] : []),
      ...(weakSignal ? ['No positive cultural signal was returned. Investigate the audience fit before prioritizing this partner.'] : []),
      'Confirm actual audience geography, deliverables, availability and usage rights before committing.'
    ];
    return { ...c, quoteCost:quoteCost(c), evidence, checks, decision, questions, reason: failed.length ? failed.map(x => x.detail).join(' ') : unknown.length ? 'Commercial terms still need confirmation.' : !evidence ? 'Cultural evidence is not available.' : weakSignal ? 'No positive cultural signal in this query. Investigate audience fit.' : 'Supplied terms fit. Use the cultural signal to guide a conversation.' };
  });
  const order = { 'worth-a-conversation': 0, 'needs-information': 1, 'does-not-fit': 2 };
  const displayedAffinity = row => row.evidence ? Number(row.evidence.affinity.toFixed(2)) : -Infinity;
  rows.sort((a,b) => order[a.decision] - order[b.decision] || a.type.localeCompare(b.type) || (displayedAffinity(b) - displayedAffinity(a)) || a.name.localeCompare(b.name));
  const signalNotes=[];
  for(const type of ['artist','podcast']){
    const observed=rows.filter(c=>c.type===type&&c.evidence);
    if(observed.length>1&&new Set(observed.map(c=>c.evidence.affinity.toFixed(2))).size===1)signalNotes.push(`The ${observed.length} ${type} candidates with evidence round to the same cultural score. No preference is shown at this precision; use the commercial checks and source details.`);
  }
  trace.push({ tool: 'Apply commercial constraints', detail: 'Known mismatches take precedence over cultural affinity. Unknowns remain unresolved.' });
  trace.push({ tool: 'Prepare decision brief', detail: 'Evidence, user-supplied facts and follow-up questions remain separate.' });
  const report = { version: 2, mode: campaign.mode, createdAt: new Date().toISOString(), campaign, rows, warnings, signalNotes, trace,
    disclaimer: campaign.mode === 'demo' ? 'Illustrative example. All affinity values and commercial terms are invented unless edited by you. No real partnership, quote or Qloo result is implied.' : campaign.mode === 'commercial' ? 'Commercial review only. No Qloo evidence was requested. Commercial terms are user-supplied and unverified; a cultural decision remains unresolved.' : 'Qloo affinity is an aggregate cultural signal, not a conversion forecast or proof of a partnership opportunity. Commercial terms are user-supplied and unverified.' };
  return report;
}

export const decisionLabels = { 'worth-a-conversation': 'Worth a conversation', 'needs-information': 'Needs information', 'does-not-fit': 'Does not fit' };
const plain = x => String(x ?? '').replace(/[\r\n]+/g, ' ').replace(/[\\`*_{}\[\]<>#|]/g, '\\$&');
export function exportMarkdown(report, pinnedIds = []) {
  const money = n => n === null ? 'Not supplied' : new Intl.NumberFormat('en-US', { style: 'currency', currency: report.campaign.currency }).format(n);
  const selected = new Set(pinnedIds);
  const rows = selected.size ? report.rows.filter(c => selected.has(c.id)) : report.rows;
  return [
    `# ${plain(report.campaign.title)} — decision brief`, '', `**Evidence mode: ${report.mode === 'demo' ? 'ILLUSTRATIVE DEMO' : report.mode === 'commercial' ? 'COMMERCIAL ONLY — NO QLOO EVIDENCE' : 'LIVE QLOO'}**`, report.disclaimer, '',
    `Brand: ${plain(report.campaign.brand)} | Market: ${plain(report.campaign.market)} | Per-partner budget: ${money(report.campaign.budget)}`,
    `Objective (context only): ${plain(report.campaign.objective)}`, `Prepared: ${report.createdAt}`, '',
    ...(report.campaign.scenarioNotice?[`Scenario: ${plain(report.campaign.scenarioNotice)}`,'']:[]),
    ...(report.signalNotes??[]).map(note=>`Cultural signal note: ${plain(note)}`), '',
    'Commercial terms are user-supplied, not independently verified. Scores are not comparable across artists and podcasts. This is not a total budget allocation.', '',
    ...rows.flatMap(c => [
      `## ${plain(c.name)} (${c.type})`, `Decision: ${decisionLabels[c.decision]}`, `Reason: ${plain(c.reason)}`,
      `User-supplied rate: ${money(c.fee)} | Basis: ${c.quoteBasis} | Units: ${c.quoteUnits??'Not supplied'} | Placement: ${c.quoteChannel}`,
      `Comparable package cost: ${money(c.quoteCost.amount)} — ${plain(c.quoteCost.detail)}`, `Cultural affinity: ${c.evidence ? String(c.evidence.affinity) : 'Unknown — not zero'}`,
      `Evidence origin: ${c.evidence?.origin ?? 'No cultural evidence'}`, ...(c.source ? [`User-provided source: ${c.source}`] : []),
      ...c.checks.map(x => `- ${x.label}: ${x.state} — ${plain(x.detail)}`),
      ...(c.notes ? [`Notes: ${plain(c.notes)}`] : []), '', 'Questions before committing:', ...c.questions.map(x => `- ${plain(x)}`),
      ...(c.evidence ? ['', 'Cultural evidence:', '```json', JSON.stringify(c.evidence, null, 2), '```'] : []), ''
    ]), ...report.warnings.map(x => `Warning: ${plain(x)}`)
  ].join('\n');
}
