import {commercialAssessment,commercialLabels,compareCommercialRows} from './assessment.mjs';
export const decisionLabels = { 'worth-a-conversation': 'Worth a conversation', 'needs-information': 'Needs information', 'does-not-fit': 'Does not fit' };
const plain = x => String(x ?? '').replace(/[\r\n]+/g, ' ').replace(/[\\`*_{}\[\]<>#|]/g, '\\$&');
export function exportMarkdown(report, pinnedIds = []) {
  const money = n => n === null ? 'Not supplied' : new Intl.NumberFormat('en-US', { style: 'currency', currency: report.campaign.currency }).format(n);
  const selected = new Set(pinnedIds);
  const rows = report.rows.filter(c=>!selected.size||selected.has(c.id));
  if(report.mode==='commercial')rows.sort(compareCommercialRows);
  return [
    `# ${plain(report.campaign.title)} — decision brief`, '', `**Evidence mode: ${report.mode === 'demo' ? 'ILLUSTRATIVE DEMO' : report.mode === 'commercial' ? 'COMMERCIAL ONLY — NO QLOO EVIDENCE' : 'LIVE QLOO'}**`, report.disclaimer, '',
    `Brand: ${plain(report.campaign.brand)} | Market: ${plain(report.campaign.market)} | Per-partner budget: ${money(report.campaign.budget)}`,
    `Objective (context only): ${plain(report.campaign.objective)}`, `Prepared: ${report.createdAt}`, '',
    ...(report.campaign.scenarioNotice?[`Scenario: ${plain(report.campaign.scenarioNotice)}`,'']:[]),
    ...(report.signalNotes??[]).map(note=>`Cultural signal note: ${plain(note)}`), '',
    'Commercial terms are user-supplied, not independently verified. Scores are not comparable across artists and podcasts. This is not a total budget allocation.', '',
    ...rows.flatMap(c => [
      `## ${plain(c.name)} (${c.type})`, `Decision: ${report.mode==='commercial'?commercialLabels[commercialAssessment(c).decision]+' — commercial terms only':decisionLabels[c.decision]}`, `Reason: ${plain(report.mode==='commercial'?commercialAssessment(c).reason:c.reason)}`,
      `User-supplied rate: ${money(c.fee)} | Basis: ${c.quoteBasis} | Units: ${c.quoteUnits??'Not supplied'} | Placement: ${c.quoteChannel}`,
      `Comparable package cost: ${money(c.quoteCost.amount)} — ${plain(c.quoteCost.detail)}`, `Cultural affinity: ${report.mode==='commercial'?'Not assessed — no Qloo evidence requested':c.evidence?String(c.evidence.affinity):'Unknown — not zero'}`,
      `Evidence origin: ${c.evidence?.origin ?? 'No cultural evidence'}`, ...(c.source ? [`User-provided source: ${c.source}`] : []),
      ...c.checks.map(x => `- ${x.label}: ${x.state} — ${plain(x.detail)}`),
      ...(c.notes ? [`Notes: ${plain(c.notes)}`] : []), '', 'Questions before committing:', ...c.questions.map(x => `- ${plain(x)}`),
      ...(c.evidence ? ['', 'Cultural evidence:', '```json', JSON.stringify(c.evidence, null, 2), '```'] : []), ''
    ]), ...report.warnings.map(x => `Warning: ${plain(x)}`)
  ].join('\n');
}
