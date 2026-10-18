import test from 'node:test';
import assert from 'node:assert/strict';
import {compareCampaign,exportMarkdown} from '../lib/domain.mjs';
import {commercialAssessment,commercialLabels} from '../lib/assessment.mjs';
import {example} from '../lib/example.mjs';

test('commercial completion is separate from unresolved cultural suitability',async()=>{
  const report=await compareCampaign({...structuredClone(example),mode:'commercial'});
  const fits=report.rows.find(row=>row.id==='khruangbin');
  assert.equal(fits.decision,'needs-information');assert.equal(fits.evidence,null);
  assert.equal(commercialLabels[commercialAssessment(fits).decision],'Terms fit');
  assert.equal(commercialAssessment(report.rows.find(row=>row.id==='national')).decision,'needs-information');
  assert.equal(commercialAssessment(report.rows.find(row=>row.id==='bon-iver')).decision,'does-not-fit');
  const markdown=exportMarkdown(report,['khruangbin']);
  assert.match(markdown,/Decision: Terms fit — commercial terms only/);
  assert.match(markdown,/Cultural affinity: Not assessed/);
  assert.doesNotMatch(markdown,/Decision: Worth a conversation/);
  assert.ok(fits.questions.every(question=>!question.includes('Qloo identity')));
});
test('snapshot export retains original live evidence, timestamp and selected rows without new queries',async()=>{
  const brand='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',partner='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const campaign={...structuredClone(example),mode:'live',brandEntity:{entity_id:brand,subtype:'urn:entity:brand',confirmed:true}};
  campaign.candidates=[{...campaign.candidates[2],entity:{entity_id:partner,subtype:'urn:entity:artist',confirmed:true}}];
  let calls=0;
  const report=await compareCampaign(campaign,{async score(){calls++;return new Map([[partner,{affinity:.75,origin:'qloo-live',observedAt:'2026-10-18T00:00:00Z'}]]);}});
  const before=structuredClone(report);
  const markdown=exportMarkdown(report,['khruangbin']);
  assert.equal(calls,1);assert.deepEqual(report,before);
  assert.ok(markdown.includes(`Prepared: ${report.createdAt}`));assert.match(markdown,/Cultural affinity: 0.75/);
  assert.match(markdown,/LIVE QLOO/);assert.doesNotMatch(markdown,/## Bon Iver/);
});
