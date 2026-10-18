import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readdir,readFile} from 'node:fs/promises';
import {compareCampaign,exportMarkdown} from '../lib/domain.mjs';
import {example} from '../lib/example.mjs';

test('commercial mode never requests Qloo or reuses demo evidence',async()=>{
  const campaign={...structuredClone(example),mode:'commercial'};
  const report=await compareCampaign(campaign,{score(){throw new Error('Must not call Qloo');}});
  assert.ok(report.rows.every(row=>row.evidence===null));
  assert.equal(report.rows.find(row=>row.id==='bon-iver').decision,'does-not-fit');
  assert.equal(report.rows.find(row=>row.id==='khruangbin').decision,'needs-information');
  assert.match(exportMarkdown(report),/COMMERCIAL ONLY — NO QLOO EVIDENCE/);
  assert.doesNotMatch(exportMarkdown(report),/LIVE QLOO\*\*/);
});
test('Pages bundle is allowlisted, supports project subpaths and shares decision rules',async()=>{
  execFileSync(process.execPath,['scripts/build-pages.mjs'],{cwd:new URL('../',import.meta.url)});
  const output=new URL('../_site/',import.meta.url);
  const files=(await readdir(output,{recursive:true})).sort();
  assert.deepEqual(files,['.nojekyll','app.js','icon.svg','index.html','input-tools.js','lib','lib/domain.mjs','lib/example.mjs','lib/public-case.mjs','runtime-config.js','static-api.js','styles.css'].sort());
  const html=await readFile(new URL('index.html',output),'utf8');
  assert.doesNotMatch(html,/(?:src|href)="\/(?!\/)/);
  const {staticApi}=await import(new URL('static-api.js',output));
  assert.equal((await staticApi('/api/config')).liveAvailable,false);
  const input={...structuredClone(example),mode:'commercial'};
  const report=await staticApi('/api/analyze',{body:JSON.stringify(input)});
  const serverReport=await compareCampaign(input);
  assert.deepEqual(report.rows,serverReport.rows);
  const result=await staticApi('/api/export',{body:JSON.stringify({campaign:input,pinnedIds:['bon-iver']})});
  assert.match(result.markdown,/## Bon Iver/);assert.doesNotMatch(result.markdown,/## Khruangbin/);
  await assert.rejects(staticApi('/api/analyze',{body:JSON.stringify({...input,mode:'live'})}),/Live Qloo needs/);
  assert.equal((await staticApi('/api/public-case')).mode,'commercial');
});
