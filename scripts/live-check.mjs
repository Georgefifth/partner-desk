// Opt-in live smoke check. Commercial terms are synthetic test inputs.
// Never logs credentials or stores proprietary Qloo responses.
import assert from 'node:assert/strict';
const base=process.env.APP_URL || 'http://127.0.0.1:4318';
const headers=process.env.ACCESS_TOKEN?{Authorization:`Bearer ${process.env.ACCESS_TOKEN}`}:{ };
async function request(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw new Error(data.error || `HTTP ${r.status}`);return data;}
const config=await request('/api/config');assert.ok(config.liveAvailable,'Configure a Qloo key before running the live check.');
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
async function identity(name,type){const {entities}=await request(`/api/search?query=${encodeURIComponent(name)}&type=${type}`);const exact=entities.filter(e=>normalize(e.name)===normalize(name));if(exact.length!==1)throw new Error(`Expected one unambiguous exact match for ${name}; received ${exact.length}. Confirm manually in the UI.`);console.log(`Resolved ${name} as ${type}.`);return {...exact[0],confirmed:true};}
const brandEntity=await identity('Patagonia','brand');
const artist=await identity('Khruangbin','artist');
const podcast=await identity('Outside Podcast','podcast');
const campaign={mode:'live',title:'Live integration check',brand:'Patagonia',brandEntity,objective:'Integration validation only; not an actual campaign.',market:'United States',format:'Sponsored content',currency:'USD',budget:5000,candidates:[{id:'artist',name:artist.name,type:'artist',entity:artist,fee:4500,markets:['United States'],format:'Sponsored content',notes:'Synthetic commercial terms for integration testing.'},{id:'podcast',name:podcast.name,type:'podcast',entity:podcast,fee:null,markets:[],format:'',notes:'Synthetic incomplete commercial terms.'}]};
campaign.candidates[0].quoteBasis='package';campaign.candidates[0].quoteChannel='artist';
const report=await request('/api/analyze',campaign);
assert.equal(report.mode,'live');
console.log(JSON.stringify({categories:report.rows.map(c=>({type:c.type,evidenceAvailable:Boolean(c.evidence),decision:c.decision,origin:c.evidence?.origin??null})),warnings:report.warnings},null,2));
assert.ok(report.rows.every(c=>!c.evidence||c.evidence.origin==='qloo-live'));
assert.ok(report.rows.some(c=>c.evidence),'No recognizable cultural evidence returned. Inspect adapter shapes before declaring integration verified.');
assert.ok(!report.warnings.length,'A category failed during the live check.');
const {markdown}=await request('/api/export',{campaign,pinnedIds:['artist']});assert.match(markdown,/LIVE QLOO/);assert.ok(!markdown.includes('synthetic-demo'));
console.log('Live check passed. Real cultural evidence and provenance verified; commercial terms were synthetic inputs.');
