import {commercialAssessment,commercialLabels,quoteCost,compareCommercialRows} from './lib/assessment.mjs';
import {exportMarkdown} from './lib/report.mjs';
import {staticHosting} from './runtime-config.js';
import {requestJson} from './request.js';
import {basisLabels,channelLabels,parseCandidateLines} from './input-tools.js';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const labels = { 'worth-a-conversation':'Worth a conversation', 'needs-information':'Needs information', 'does-not-fit':'Does not fit' };
let campaign, report, config = {}, dirty = false, filter = 'all', baseline = false, pinnedOnly = false, running = false, searchTarget = null, token = '';
const pins = new Set();
let identityReview=null;
const money = value => value === null ? 'Not supplied' : new Intl.NumberFormat('en-US',{style:'currency',currency:campaign.currency,minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
const initials = name => name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('');
const commercialView=()=>baseline||report?.mode==='commercial';
const badge = (decision,commercial=false) => `<span class="decision-badge ${decision}">${decision === 'worth-a-conversation' ? '✓' : decision === 'needs-information' ? '?' : '−'} ${(commercial?commercialLabels:labels)[decision]}</span>`;
async function api(path,options = {}) {
  if(staticHosting){const {staticApi}=await import('./static-api.js');return staticApi(path,options);}
  try{return await requestJson(path,{...options,headers:{ ...(options.body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:`Bearer ${token}`} : {}), ...options.headers }});}
  catch(error){if(error.status===401)token='';throw error;}
}
function toast(text) { $('toast').textContent=text; $('toast').hidden=false; clearTimeout(toast.timer); toast.timer=setTimeout(() => $('toast').hidden=true,4000); }
function showError(text) { $('error').textContent=text; $('error').hidden=!text; }
function markDirty() { dirty=true;for(const b of document.querySelectorAll('[data-terms]'))b.disabled=true; $('stale').hidden=false; $('export-button').disabled=true; updateNextStep(); }
function setBusy(button,busy,text) { button.disabled=busy; button.setAttribute('aria-busy',String(busy)); if (text) button.textContent=text; }
function showInfo(title,html) { $('info-content').innerHTML=`<h2 id="info-title">${esc(title)}</h2>${html}`; $('info-dialog').showModal(); }
function closeDialog(id) { $(id).close(); }
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click',() => closeDialog(button.dataset.close));
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click',event => { if(event.target === dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close();} });

function updateHeading() {
  $('campaign-title').textContent=campaign.title || 'Untitled campaign'; $('crumb-title').textContent=campaign.title || 'Your comparison';
  $('campaign-objective').textContent=campaign.objective;
  $('campaign-strip').innerHTML=[['Brand',campaign.brand],['Target market',campaign.market],['Partnership',campaign.format],['Per-partner budget',money(campaign.budget)],['Candidates',`${campaign.candidates.length} to compare`]].map(([name,value])=>`<div class="campaign-fact"><span>${esc(name)}</span><strong>${esc(value)}</strong></div>`).join('');
  $('mode-select').value=campaign.mode;
  $('edition-label').textContent=config.staticHosting?'Browser edition / no live Qloo':'Server edition / v0.4';
  $('mode-banner').classList.toggle('live',campaign.mode==='live');
  $('mode-banner').querySelector('p').innerHTML=campaign.mode==='demo' ? '<strong>Illustrative example</strong> — cultural values are invented; example quotes can be edited. No real partnership is implied.' : '<strong>Live Qloo mode</strong> — cultural evidence comes from Qloo. Commercial terms are your unverified input.';
  if(campaign.mode==='commercial')$('mode-banner').querySelector('p').innerHTML='<strong>Commercial review</strong> — your supplied terms only. No Qloo evidence is requested or inferred.';
  if(config.staticHosting)$('mode-banner').querySelector('p').innerHTML+='<br>GitHub Pages edition · calculations stay in this browser · live Qloo requires the server edition.';
  if(campaign.scenarioNotice)$('mode-banner').querySelector('p').textContent=campaign.scenarioNotice+(campaign.mode==='commercial'?' No live Qloo evidence on this site.':'');
  else if(dirty&&report&&campaign.mode!==report.mode)$('mode-banner').querySelector('p').innerHTML='<strong>Evidence source changed.</strong> Rerun the comparison. The previous results have not been refreshed.';
  $('live-button').textContent=config.staticHosting?'About live evidence':campaign.mode==='live'?'Live connection details':'Connect live evidence';
  $('resolve-brand').disabled=campaign.mode!=='live' || !config.liveAvailable;
  $('review-identities').disabled=campaign.mode!=='live'||!config.liveAvailable;
  $('review-identities').closest('.identity-toolbar').hidden=campaign.mode!=='live';
  $('brand-match').textContent=campaign.mode==='commercial'?'Name for your brief. No Qloo identity is required in commercial mode.':campaign.mode==='demo' ? 'Example brand. No live identity has been resolved.' : campaign.brandEntity ? `Confirmed: ${campaign.brandEntity.name}` : 'Search and confirm a brand before comparing.';
  $('live-status').textContent=campaign.mode==='live' ? config.liveAvailable ? 'Confirm each identity. Unresolved partners stay unknown.' : 'Live access needs a server-side QLOO_API_KEY.' : campaign.mode==='commercial' ? 'Commercial terms are checked without Qloo. Cultural fit remains unresolved.' : 'Synthetic cultural values are available for the original example candidates only.';
  updateNextStep();
}
function updateNextStep(){
  if(!campaign)return;
  const unresolved=campaign.mode==='live'&&(!campaign.brandEntity||campaign.candidates.some(c=>!c.excluded&&!c.entity));
  let text,action,label;
  if(campaign.mode==='demo'){text='Explore the example, or bring your own brand and shortlist.';action='new';label='Start your comparison';}
  else if(!campaign.title||!campaign.brand||!campaign.market||campaign.budget===null||!campaign.candidates.length){text='Set your brand, budget and target market, then add the artists or podcasts you want to compare.';action='edit';label='Complete the brief';}
  else if(unresolved){text='Confirm the brand and candidate identities before requesting cultural evidence. Unselected names stay unresolved.';action='identities';label='Review identities';}
  else if(dirty||!report){text='Your brief is ready to compare. Missing commercial terms will stay unknown.';action='compare';label='Compare candidates';}
  else{text='Open a partner to inspect the evidence. Update supplied terms, then pin the partners you want in your exported brief.';action='results';label='Review comparison';}
  $('next-description').textContent=text;$('next-action').textContent=label;$('next-action').dataset.action=action;$('next-step').hidden=false;
}
$('next-action').addEventListener('click',()=>{
  if(running)return;
  const action=$('next-action').dataset.action;
  if(action==='new')$('new-campaign').click();
  else if(action==='edit'){openEditor();$('campaign-form').elements.title.focus();}
  else if(action==='identities'){if(config.tokenRequired&&!token)connectLive();else $('review-identities').click();}
  else if(action==='compare')runComparison();
  else{$('comparison').scrollIntoView({behavior:'smooth'});$('candidate-rows').querySelector('button')?.focus();}
});
function populateForm() {
  const form=$('campaign-form');
  for (const field of ['title','brand','objective','market','format','currency','budget']) form.elements[field].value=campaign[field] ?? '';
  renderCandidateInputs(); updateHeading();
}
function renderCandidateInputs() {
  $('candidate-inputs').innerHTML=campaign.candidates.map((c,i)=>`<section class="candidate-input" data-id="${esc(c.id)}" aria-label="Edit ${esc(c.name || `candidate ${i+1}`)}"><div class="candidate-input-grid">
    <label>Partner name<input data-field="name" value="${esc(c.name)}" maxlength="100" required></label>
    <label>Category<select data-field="type"><option value="artist" ${c.type==='artist'?'selected':''}>Artist</option><option value="podcast" ${c.type==='podcast'?'selected':''}>Podcast</option></select></label>
    <label>Fee (${esc(campaign.currency)})<input data-field="fee" type="number" min="0" max="1000000000" step="0.01" value="${c.fee ?? ''}" placeholder="Unknown"></label>
    <label class="market-input">Delivery markets<input data-field="markets" value="${esc(c.markets.join(', '))}" maxlength="200" placeholder="Unknown, or Global"></label>
    <label class="format-input">Offered format<select data-field="format"><option value="" ${!c.format?'selected':''}>Not confirmed</option>${['Sponsored content','Live event','Product collaboration'].map(f=>`<option ${f===c.format?'selected':''}>${f}</option>`).join('')}</select></label>
    <button class="icon-button remove-input" type="button" data-remove="${esc(c.id)}" aria-label="Remove ${esc(c.name || 'candidate')}">×</button></div>
    <details class="quote-context"><summary>Quote details: ${esc(basisLabels[c.quoteBasis]||basisLabels.unknown)} / ${esc(channelLabels[c.quoteChannel]||channelLabels.unknown)}</summary><div class="quote-fields"><label>Rate basis<select data-field="quoteBasis">${Object.entries(basisLabels).map(([value,label])=>`<option value="${value}" ${(c.quoteBasis??'unknown')===value?'selected':''}>${label}</option>`).join('')}</select></label><label data-quantity-field ${['episode','week'].includes(c.quoteBasis)?'':'hidden'}>${c.quoteBasis==='week'?'Number of weeks':'Number of episodes'}<input ${['episode','week'].includes(c.quoteBasis)?'':'disabled'} data-field="quoteUnits" type="number" min="1" max="10000" step="1" value="${c.quoteUnits??''}" placeholder="If billed per unit"></label><label>What the offer covers<select data-field="quoteChannel">${Object.entries(channelLabels).map(([value,label])=>`<option value="${value}" ${(c.quoteChannel??'unknown')===value?'selected':''}>${label}</option>`).join('')}</select></label></div><p>CPM rates need a delivery estimate or package quote. A website rate cannot stand in for a podcast rate.</p></details>
    <div class="candidate-notes"><label>Team notes<input data-field="notes" value="${esc(c.notes)}" maxlength="1000" placeholder="What needs checking?"></label><label>Source link (optional)<input data-field="source" type="url" value="${esc(c.source)}" placeholder="https://…"></label><label class="exclude-label"><input data-field="excluded" type="checkbox" ${c.excluded?'checked':''}> Exclude from campaign</label></div>
    ${campaign.mode==='live'?`<div class="candidate-identity"><button class="small-button" type="button" data-resolve="${esc(c.id)}" ${config.liveAvailable?'':'disabled'}>Find in Qloo</button><span>${esc(c.entity ? `Confirmed: ${c.entity.name}` : 'Identity not confirmed. Cultural evidence will remain unknown.')}</span></div>`:''}
    </section>`).join('');
  $('add-candidate').disabled=campaign.candidates.length>=12;
}
function openEditor() { $('editor').hidden=false; populateForm(); $('editor').scrollIntoView({behavior:'smooth',block:'start'}); }
function renderReport() {
  if(!report) return;
  const reportMoney = value => value === null ? 'Not supplied' : new Intl.NumberFormat('en-US',{style:'currency',currency:report.campaign.currency,minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
  const commercial=commercialView();
  $('comparison-heading').textContent=report.mode==='commercial'?'Commercial review':'Your decision desk';
  $('comparison').querySelector('.comparison-header p').textContent=report.mode==='commercial'?'Check the supplied quote and delivery terms. Assess cultural suitability separately.':'Commercial fit comes first. Cultural signals guide the next conversation.';
  const displayRows=commercial?report.rows.map(c=>({...c,...commercialAssessment(c)})):report.rows;
  const filterLabels=commercial?commercialLabels:labels;
  for(const b of document.querySelectorAll('[data-filter]'))if(b.dataset.filter!=='all')b.firstChild.textContent=filterLabels[b.dataset.filter]+' ';
  $('commercial-only').closest('label').hidden=report.mode==='commercial';
  const counts=Object.fromEntries(Object.keys(labels).map(s=>[s,displayRows.filter(r=>r.decision===s).length]));
  $('count-all').textContent=report.rows.length; $('count-worth').textContent=counts['worth-a-conversation']; $('count-needs').textContent=counts['needs-information']; $('count-no').textContent=counts['does-not-fit'];
  let rows=displayRows.filter(r=>(filter==='all'||r.decision===filter)&&(!pinnedOnly||pins.has(r.id)));
  if(commercial)rows.sort(compareCommercialRows);
  $('candidate-rows').innerHTML=rows.length ? rows.map((c,i)=>`<tr><td><div class="partner-cell"><div class="partner-avatar avatar-${i%5}" aria-hidden="true">${esc(initials(c.name))}</div><div><button class="partner-name" data-detail="${esc(c.id)}">${esc(c.name)}</button><span class="partner-type">${c.type==='artist'?'Music / artist':'Podcast'}${pins.has(c.id)?' / pinned':''}</span></div></div></td>
    <td><div class="signal">${report.mode==='commercial'?'<span class="signal-number">—</span><span class="signal-label">Not assessed</span>':baseline?'<span class="signal-number">Hidden</span><span class="signal-label">Commercial view</span>':c.evidence?`<span class="signal-number">${c.evidence.affinity.toFixed(2)}</span><progress class="signal-track" max="200" value="${Math.round((c.evidence.affinity+1)*100)}" aria-label="Cultural affinity ${c.evidence.affinity.toFixed(2)}"></progress><span class="signal-label">${c.evidence.origin==='synthetic-demo'?'Illustrative value':'Qloo affinity'}</span>`:'<span class="signal-number">—</span><span class="signal-label">No evidence yet</span>'}</div></td>
    <td><span class="fee">${c.quoteCost?.amount===null?(c.fee===null?'Quote missing':'Confirm rate basis'):esc(reportMoney(c.quoteCost?.amount??c.fee))}</span><span class="fee-note">${c.fee===null?'Request a quote':`${esc(reportMoney(c.fee))} / ${esc(basisLabels[c.quoteBasis]||'Unconfirmed basis')}`}</span><button class="row-action" data-terms="${esc(c.id)}" ${dirty||running?'disabled':''}>Update terms</button></td>
    <td><div class="check-list">${c.checks.map(x=>`<span class="check-pill ${x.state}" title="${esc(x.detail)}">${x.state==='pass'?'✓':x.state==='fail'?'×':'?'} ${esc(x.label)}</span>`).join('')}</div></td>
    <td>${badge(c.decision,commercial)}<span class="decision-detail">${esc(c.reason)}</span></td>
    <td><button class="pin-button ${pins.has(c.id)?'pinned':''}" data-pin="${esc(c.id)}" aria-pressed="${pins.has(c.id)}" aria-label="${pins.has(c.id)?'Unpin':'Pin'} ${esc(c.name)}">${pins.has(c.id)?'★':'☆'}</button></td></tr>`).join('') : '<tr><td class="empty-state" colspan="6">No partners in this view. <button class="text-button" data-show-all>Show all candidates</button></td></tr>';
  $('result-summary').textContent=`${rows.length} of ${report.rows.length} candidates${pinnedOnly?' / pinned only':''}. Artists and podcasts are evaluated separately.`;
  $('pin-count').textContent=pins.size; $('shortlist-button').firstChild.textContent=pinnedOnly?'Show all partners ':'View pinned partners ';
  $('baseline-note').hidden=!commercial;
  $('baseline-note').textContent=report.mode==='commercial'?'Terms fit means your supplied commercial conditions pass. Cultural fit, audience suitability and availability have not been established.':'This view shows commercial checks only. Exports retain the full assessment and cultural evidence.';
  $('signal-notes').textContent=(report.signalNotes??[]).join(' ');$('signal-notes').hidden=commercial||!report.signalNotes?.length;
  $('export-button').disabled=dirty||running;
  if(report.warnings.length) showError(report.warnings.join(' '));
  for(const b of document.querySelectorAll('[data-filter]'))b.setAttribute('aria-pressed',String(b.dataset.filter===filter&&!pinnedOnly));
}
async function runComparison() {
  if(running)return;
  if(!$('campaign-form').checkValidity()){openEditor();$('campaign-form').reportValidity();return;}
  running=true; $('run-status').hidden=false;$('run-status').classList.remove('sr-only');$('run-status').textContent=campaign.mode==='live'?'Requesting Qloo evidence. Missing commercial terms remain unknown…':'Checking supplied terms…'; showError(''); $('export-button').disabled=true; setBusy($('run-button'),true,'Comparing candidates…');$('rerun-button').disabled=true;$('next-action').disabled=true;
  const snapshot=structuredClone(campaign);
  // Lock edits during a request so returned decisions cannot silently refer to newer inputs.
  $('campaign-form').inert=true;
  try {
    report=await api('/api/analyze',{method:'POST',body:JSON.stringify(snapshot)});
    dirty=false; $('run-status').textContent=`Comparison updated: ${report.rows.length} candidates.`;$('run-status').classList.add('sr-only'); $('stale').hidden=true; updateHeading(); renderReport();
    if(!report.warnings.length) $('editor').hidden=true;
  } catch(error){showError(error.message);markDirty();$('run-status').textContent='Comparison not updated. Your brief is preserved. Use Update comparison to retry.';}
  finally{running=false;for(const b of document.querySelectorAll('[data-terms]'))b.disabled=dirty;$('campaign-form').inert=false;setBusy($('run-button'),false,'Compare candidates ↗');$('export-button').disabled=dirty||!report;$('rerun-button').disabled=false;$('next-action').disabled=false;}
}
function showDetail(id) {
  const c=report.rows.find(r=>r.id===id); if(!c)return;
  const assessment=commercialView()?commercialAssessment(c):c;
  const origin=c.evidence?.origin==='synthetic-demo'?'Synthetic demonstration':c.evidence?'Live Qloo evidence':'No cultural evidence';
  $('detail-content').innerHTML=`<div class="detail-hero"><div class="partner-avatar">${esc(initials(c.name))}</div><div><p class="section-label">${c.type==='artist'?'Music / artist':'Podcast'}</p><h2 id="detail-title">${esc(c.name)}</h2></div></div>${badge(assessment.decision,commercialView())}<p class="field-hint">${esc(assessment.reason)}</p><button class="button secondary" id="detail-update-terms" ${dirty?'disabled':''}>Update terms</button>${dirty?'<div class="notice stale">These results belong to the previous brief. Rerun the comparison.</div>':''}
    <section class="detail-section"><h3>Commercial checks</h3><span class="source-label">${report.mode==='demo'?'Example / user-edited terms':'Your input / unverified'}</span><p>Quoted rate: <strong>${esc(c.fee===null?'Not supplied':new Intl.NumberFormat('en-US',{style:'currency',currency:report.campaign.currency}).format(c.fee))}</strong> / ${esc(basisLabels[c.quoteBasis])}</p><p>Package cost: ${esc(c.quoteCost?.amount===null?'Not comparable':new Intl.NumberFormat('en-US',{style:'currency',currency:report.campaign.currency}).format(c.quoteCost?.amount??c.fee))}<br>${esc(c.quoteCost?.detail??'')}</p>${c.checks.map(x=>`<div class="check-row"><span class="check-pill ${x.state}">${esc(x.label)}</span><span>${esc(x.detail)}</span></div>`).join('')}${c.source?`<p><a href="${esc(c.source)}" target="_blank" rel="noopener noreferrer">Open supplied source</a> — availability and applicability still need confirmation.</p>`:''}${c.notes?`<p>Team note: ${esc(c.notes)}</p>`:''}</section>
    <section class="detail-section"><h3>Cultural evidence</h3><span class="source-label">${origin}</span><p>${c.evidence?`Affinity ${c.evidence.affinity.toFixed(2)} for this campaign's brand signal. Compare only with other ${c.type==='artist'?'artists':'podcasts'} in this run.`:'No supported cultural signal is available. This does not mean the partner is a poor match.'}</p>${c.entity?`<p>Confirmed identity: ${esc(c.entity.name)}<br><small>${esc(c.entity.entity_id)}</small></p>`:''}${c.evidence?`<details><summary>Inspect the evidence</summary><pre>${esc(JSON.stringify(c.evidence,null,2))}</pre></details>`:''}<p>Affinity is not audience share, guaranteed reach, willingness to collaborate or predicted sales.</p></section>
    <section class="detail-section"><h3>Before the next conversation</h3><ul>${c.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></section>`;
  $('detail-dialog').showModal();
  $('detail-update-terms').addEventListener('click',()=>{closeDialog('detail-dialog');openTerms(id);});
}
function openSearch(id) {
  if(campaign.mode!=='live'||!config.liveAvailable)return;
  searchTarget=id; const c=id==='brand'?{name:campaign.brand}:campaign.candidates.find(c=>c.id===id);
  $('search-title').textContent=`Find ${c.name || 'the partner'} in Qloo`; $('search-query').value=c.name; $('search-results').textContent='Search, then select an identity to confirm.'; $('search-dialog').showModal();
}
async function connectLive() {
  if(running)return;
  if(!config.liveAvailable) {
    if(config.staticHosting){showInfo('Live evidence needs a server','<p>This GitHub Pages edition runs commercial checks, draft storage and exports in your browser. The example uses invented cultural values. It cannot protect an API key or call the Node backend.</p><p><a class="button primary" href="https://partner-desk.onrender.com/" target="_blank" rel="noopener noreferrer">Open live server edition</a></p><p>Live access requires a desk access token. The free server may take about a minute to wake after inactivity.</p><p>Drafts stay on the site where you saved them. Do not paste a Qloo API key into either browser edition.</p>');return;}
    showInfo('Connect live Qloo evidence','<p>The current desk runs with an illustrative example. A real Qloo API key must be configured on the server.</p><pre>QLOO_API_KEY=your_key npm start</pre><p>Use the hackathon key with <code>https://hackathon.api.qloo.com</code>. Keep the key out of browser code and shared briefs.</p><p>Restart the server, reload this page, choose Live Qloo in the campaign editor, then confirm each entity. Live failures never become demo results.</p>');return;
  }
  if(config.tokenRequired&&!token){
    showInfo('Unlock live evidence','<p>Enter this desk’s shared access token, not the Qloo API key. It stays in this tab’s memory.</p><form id="token-form"><div class="search-field"><input type="password" id="token-input" autocomplete="off" aria-label="Desk access token" required><button class="button primary" id="token-submit">Unlock</button></div><p id="token-error" role="alert"></p></form>');
    $('token-form').addEventListener('submit',async e=>{
      e.preventDefault();token=$('token-input').value;setBusy($('token-submit'),true,'Checking…');$('token-error').textContent='';
      try{await api('/api/access');closeDialog('info-dialog');activateLive();}
      catch(error){token='';$('token-error').textContent=error.message;}
      finally{setBusy($('token-submit'),false,'Unlock');}
    });return;
  }
  activateLive();
}
function activateLive(){if(running)return;chooseMode('live');markDirty();updateHeading();openEditor();}
function chooseMode(mode){
  const hadExampleTerms=mode!=='demo'&&campaign.exampleTerms;
  if(hadExampleTerms){for(const c of campaign.candidates){c.fee=null;c.quoteBasis='unknown';c.quoteUnits=null;c.quoteChannel='unknown';c.markets=[];c.format='';c.source='';c.notes='';}campaign.exampleTerms=false;}
  campaign.mode=mode;
  if(hadExampleTerms)toast('Example commercial terms cleared. Add your own quotes and delivery terms.');
}

$('rerun-button').addEventListener('click',runComparison);
$('campaign-form').addEventListener('submit',e=>{e.preventDefault();runComparison();});
$('campaign-form').addEventListener('input',e=>{
  const input=e.target; const section=input.closest('.candidate-input');
  if(section&&input.dataset.field){const c=campaign.candidates.find(c=>c.id===section.dataset.id);const field=input.dataset.field;
    c[field]=['fee','quoteUnits'].includes(field)?(input.value===''?null:Number(input.value)):field==='markets'?input.value.split(',').map(x=>x.trim()).filter(Boolean):field==='excluded'?input.checked:input.value;
    if(field==='quoteBasis'){const quantity=section.querySelector('[data-quantity-field]');const perUnit=['episode','week'].includes(c.quoteBasis);quantity.hidden=!perUnit;quantity.querySelector('input').disabled=!perUnit;quantity.firstChild.textContent=c.quoteBasis==='week'?'Number of weeks':'Number of episodes';if(!perUnit){c.quoteUnits=null;quantity.querySelector('input').value='';}}
    if(['quoteBasis','quoteChannel'].includes(field))section.querySelector('.quote-context summary').textContent=`Quote details: ${basisLabels[c.quoteBasis]||basisLabels.unknown} / ${channelLabels[c.quoteChannel]||channelLabels.unknown}`;
    if(['name','type'].includes(field)){delete c.entity;const identity=section.querySelector('.candidate-identity span');if(identity)identity.textContent='Identity changed. Search and confirm again.';}
  } else if(input.name){campaign[input.name]=input.name==='budget'?(input.value===''?null:Number(input.value)):input.value;if(input.name==='brand')delete campaign.brandEntity;}
  if(input.id!=='mode-select') {markDirty();updateHeading();}
});
$('mode-select').addEventListener('change',()=>{if($('mode-select').value==='live'&&config.tokenRequired&&!token){$('mode-select').value=campaign.mode;connectLive();return;}chooseMode($('mode-select').value);markDirty();populateForm();if(campaign.mode==='live'&&config.tokenRequired&&!token)connectLive();});
$('candidate-inputs').addEventListener('click',e=>{const remove=e.target.closest('[data-remove]');const resolve=e.target.closest('[data-resolve]');if(remove){campaign.candidates=campaign.candidates.filter(c=>c.id!==remove.dataset.remove);pins.delete(remove.dataset.remove);markDirty();renderCandidateInputs();updateHeading();}if(resolve)openSearch(resolve.dataset.resolve);});
$('add-candidate').addEventListener('click',()=>{if(campaign.candidates.length>=12)return;campaign.candidates.push({id:crypto.randomUUID(),name:'',type:'artist',fee:null,quoteBasis:'unknown',quoteUnits:null,quoteChannel:'unknown',markets:[],format:'',notes:'',source:'',excluded:false});markDirty();renderCandidateInputs();updateHeading();$('candidate-inputs').lastElementChild.querySelector('input').focus();});
$('resolve-brand').addEventListener('click',()=>openSearch('brand'));
$('paste-candidates').addEventListener('click',()=>{$('paste-text').value='';$('paste-error').textContent='';$('paste-dialog').showModal();});
$('paste-form').addEventListener('submit',event=>{
  event.preventDefault();
  try{const candidates=parseCandidateLines($('paste-text').value,$('paste-type').value,campaign.candidates);campaign.candidates.push(...candidates.map(c=>({...c,id:crypto.randomUUID()})));markDirty();renderCandidateInputs();updateHeading();closeDialog('paste-dialog');toast(`${candidates.length} candidates added. Commercial terms remain unknown.`);}
  catch(error){$('paste-error').textContent=error.message;}
});
$('identities-dialog').addEventListener('close',()=>{identityReview?.controller.abort();});
$('review-identities').addEventListener('click',async()=>{
  if(running||campaign.mode!=='live'||!config.liveAvailable)return;
  identityReview?.controller.abort();
  const items=[...(!campaign.brandEntity?[{id:'brand',name:campaign.brand,type:'brand'}]:[]),...campaign.candidates.filter(c=>!c.entity&&!c.excluded).map(c=>({id:c.id,name:c.name,type:c.type}))];
  if(!items.length)return toast('All active identities have already been confirmed.');
  const session={items,selected:new Map(),controller:new AbortController(),completed:0};identityReview=session;
  $('apply-identities').disabled=true;$('apply-identities').textContent='Apply selected identities';
  $('identity-results').innerHTML=items.map((item,i)=>`<section class="identity-item" id="identity-item-${i}"><h3>${esc(item.name||'Unnamed candidate')} <span>${esc(item.type)}</span></h3><div class="identity-choices"><p>Waiting to search…</p></div></section>`).join('');
  $('identity-progress').textContent=`Searching 0 of ${items.length} names…`;$('identities-dialog').showModal();
  for(let i=0;i<items.length;i++){
    if(session.controller.signal.aborted)break;
    const item=items[i];const container=$(`identity-item-${i}`).querySelector('.identity-choices');
    container.textContent='Searching Qloo…';
    try{
      if(item.name.trim().length<2)throw new Error('Add a full name in the campaign editor, then search again.');
      const data=await api(`/api/search?query=${encodeURIComponent(item.name)}&type=${item.type}`,{signal:session.controller.signal});
      if(session.controller.signal.aborted)break;
      item.choices=data.entities;
      container.innerHTML=data.entities.length?`<label class="identity-choice"><input type="radio" name="identity-${i}" value="" data-item-index="${i}" checked><span>Leave unresolved</span></label>${data.entities.map((entity,j)=>`<label class="identity-choice"><input type="radio" name="identity-${i}" value="${j}" data-item-index="${i}"><span><strong>${esc(entity.name)}</strong><small>${esc(entity.description||entity.entity_id)}</small></span></label>`).join('')}`:'<p>No matching identities returned. Keep this item unresolved or try another name individually.</p>';
    }catch(error){if(session.controller.signal.aborted)break;container.textContent=error.message;}
    session.completed++;$('identity-progress').textContent=session.completed===items.length?`Searched ${items.length} names. Select only identities you can confirm.`:`Searched ${session.completed} of ${items.length} names…`;
  }
});
$('identity-results').addEventListener('change',event=>{
  const input=event.target;if(!input.matches('[data-item-index]')||!identityReview)return;
  const item=identityReview.items[Number(input.dataset.itemIndex)];
  if(input.value==='')identityReview.selected.delete(item.id);else identityReview.selected.set(item.id,item.choices[Number(input.value)]);
  const count=identityReview.selected.size;$('apply-identities').disabled=count===0;$('apply-identities').textContent=`Apply ${count} selected ${count===1?'identity':'identities'}`;
});
$('apply-identities').addEventListener('click',()=>{
  if(!identityReview)return;
  for(const [id,result]of identityReview.selected){const entity={...result,confirmed:true};if(id==='brand')campaign.brandEntity=entity;else{const candidate=campaign.candidates.find(c=>c.id===id);if(candidate)candidate.entity=entity;}}
  const count=identityReview.selected.size;closeDialog('identities-dialog');markDirty();populateForm();toast(`${count} identities confirmed. Unselected names remain unresolved.`);
});
$('search-form').addEventListener('submit',async e=>{
  e.preventDefault(); const target=searchTarget; const type=target==='brand'?'brand':campaign.candidates.find(c=>c.id===target)?.type;
  setBusy($('search-submit'),true,'Searching…');$('search-results').textContent='Looking up identities…';
  try{const data=await api(`/api/search?query=${encodeURIComponent($('search-query').value)}&type=${encodeURIComponent(type)}`);
    if(target!==searchTarget)return;
    $('search-results').innerHTML=data.entities.length?data.entities.map((entity,i)=>`<button class="search-result" type="button" data-search-index="${i}"><strong>${esc(entity.name)}</strong><span>${esc(entity.description||entity.entity_id)}</span><span>Select this identity</span></button>`).join(''):'No matching entities returned. Try an exact name. Unresolved partners can remain in your comparison.';
    $('search-results').onclick=event=>{const button=event.target.closest('[data-search-index]');if(!button)return;const entity={...data.entities[Number(button.dataset.searchIndex)],confirmed:true};if(target==='brand')campaign.brandEntity=entity;else{const c=campaign.candidates.find(c=>c.id===target);if(c)c.entity=entity;}markDirty();populateForm();closeDialog('search-dialog');toast(`Confirmed ${entity.name}.`);};
  }catch(error){$('search-results').textContent=error.message;}
  finally{setBusy($('search-submit'),false,'Search');}
});
$('candidate-rows').addEventListener('click',e=>{const detail=e.target.closest('[data-detail]');const pin=e.target.closest('[data-pin]');if(e.target.closest('[data-show-all]')){document.querySelector('[data-filter=all]').click();return;}const terms=e.target.closest('[data-terms]');if(terms)openTerms(terms.dataset.terms);if(detail)showDetail(detail.dataset.detail);if(pin){const id=pin.dataset.pin;pins.has(id)?pins.delete(id):pins.add(id);renderReport();}});
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{filter=button.dataset.filter;pinnedOnly=false;for(const b of document.querySelectorAll('[data-filter]'))b.classList.toggle('active',b===button);renderReport();});
$('commercial-only').addEventListener('change',e=>{baseline=e.target.checked;renderReport();});
$('shortlist-button').addEventListener('click',()=>{pinnedOnly=!pinnedOnly;filter='all';for(const b of document.querySelectorAll('[data-filter]'))b.classList.toggle('active',b.dataset.filter==='all');renderReport();$('comparison').scrollIntoView({behavior:'smooth'});});
for(const id of ['edit-button','nav-brief'])$(id).addEventListener('click',openEditor);
$('close-editor').addEventListener('click',()=>{$('editor').hidden=true;});
$('nav-comparison').addEventListener('click',()=>$('comparison').scrollIntoView({behavior:'smooth'}));
$('live-button').addEventListener('click',connectLive);
$('workflow-button').addEventListener('click',()=>{showInfo('How this comparison was prepared',`${report?`<ol>${report.trace.map(t=>`<li><strong>${esc(t.tool)}</strong><p>${esc(t.detail)}</p></li>`).join('')}</ol><p>${esc(report.disclaimer)}</p>`:'<p>Run a comparison first.</p>'}<p>The workflow is bounded and deterministic. The same checks are available as MCP tools for an external agent. This version does not use an LLM to infer missing facts.</p>`);});
$('about-button').addEventListener('click',()=>showInfo('A more useful shortlist','<p>Partner Desk compares artists and podcasts you already have in mind. Your commercial conditions come first; Qloo adds a cultural signal.</p><ul><li>“Worth a conversation” means supplied terms fit, not that a deal is verified.</li><li>Missing information stays unknown. No combined match percentage or ROI is invented.</li><li>Compare affinity within a category. Artist and podcast values are not treated as interchangeable.</li><li>All example quotes and affinity values are invented.</li></ul><p>Drafts are saved in this browser only when you choose Save draft. Exports download to your device. The desk does not send outreach.</p>'));
$('save-draft').addEventListener('click',()=>{try{localStorage.setItem('partner-desk-draft-v1',JSON.stringify({campaign,pins:[...pins]}));toast('Draft saved in this browser. Reports and access tokens are not saved.');}catch{toast('Browser storage is unavailable. Export a brief after comparing.');}});
$('restore-draft').addEventListener('click',()=>{if(running)return;try{const raw=localStorage.getItem('partner-desk-draft-v1');if(!raw)return toast('No saved draft in this browser yet.');const saved=JSON.parse(raw);if(!saved.campaign||!Array.isArray(saved.campaign.candidates)||saved.campaign.candidates.length>12)throw new Error();campaign=saved.campaign;pins.clear();for(const id of saved.pins??[])pins.add(id);markDirty();openEditor();toast('Draft restored. Run the comparison to refresh evidence.');}catch{toast('The saved draft could not be restored. Reset the example to start again.');}});
async function loadExample(){campaign={...await api('/api/example'),mode:'demo',exampleTerms:true};pins.clear();filter='all';pinnedOnly=false;baseline=false;$('commercial-only').checked=false;for(const b of document.querySelectorAll('[data-filter]'))b.classList.toggle('active',b.dataset.filter==='all');populateForm();await runComparison();}
$('reset-example').addEventListener('click',()=>{if(running)return;showInfo('Reset this campaign?','<p>This replaces the current working campaign with the illustrative example. Your saved browser draft will remain.</p><button class="button primary" id="confirm-reset">Reset example</button>');$('confirm-reset').addEventListener('click',()=>{closeDialog('info-dialog');loadExample().catch(e=>showError(e.message));});});
$('public-case-button').addEventListener('click',()=>{
  if(running)return;
  showInfo('A real rate, a different placement','<p>This independent research case uses Field Notes as a possible advertiser and two publicly documented sponsorship offers. It is not a commissioned campaign.</p><p>The Pen Addict lists a website sponsorship rate; ATP describes podcast placements without a public rate. The $1,000 budget and US target market are planning assumptions.</p><p>Loading replaces the working campaign. Your saved draft remains. In the server edition, confirm identities to obtain live Qloo evidence. The Pages edition checks commercial terms only.</p><button class="button primary" id="load-public-case">Load research case</button>');
  $('load-public-case').addEventListener('click',async()=>{
    try{campaign={...await api('/api/public-case'),exampleTerms:false};pins.clear();filter='all';pinnedOnly=false;baseline=false;report=null;$('commercial-only').checked=false;for(const b of document.querySelectorAll('[data-filter]'))b.classList.toggle('active',b.dataset.filter==='all');for(const id of ['count-all','count-worth','count-needs','count-no','pin-count'])$(id).textContent='0';$('candidate-rows').innerHTML='<tr><td colspan="6" class="empty-state">Review the supplied terms, then compare this research case.</td></tr>';$('result-summary').textContent='Public-source case. Comparison has not run yet.';closeDialog('info-dialog');markDirty();openEditor();if(config.tokenRequired&&!token)connectLive();}
    catch(error){closeDialog('info-dialog');showError(error.message);}
  });
});
$('export-button').addEventListener('click',async()=>{
  if(dirty||!report||running)return;
  setBusy($('export-button'),true,'Preparing…');
  try{const markdown=exportMarkdown(structuredClone(report),[...pins]);const url=URL.createObjectURL(new Blob([markdown],{type:'text/markdown;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`partner-desk-${report.mode==='demo'?'DEMO-':''}brief.md`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(pins.size?'Pinned partner brief downloaded.':'Full comparison brief downloaded.');}
  catch(error){showError(error.message);}
  finally{setBusy($('export-button'),dirty,'⇩ Export brief');}
});
let termsTarget=null;
function openTerms(id){
  if(dirty||running)return;
  const c=campaign.candidates.find(c=>c.id===id);if(!c)return;
  termsTarget=id;$('terms-title').textContent=`Update ${c.name}`;
  const select=(field,options)=>`<select name="${field}" aria-label="${{quoteBasis:'Rate basis',quoteChannel:'What the offer covers',format:'Offered format'}[field]}">${Object.entries(options).map(([v,t])=>`<option value="${v}" ${c[field]===v?'selected':''}>${esc(t)}</option>`).join('')}</select>`;
  $('terms-fields').innerHTML=`<label>Fee (${esc(campaign.currency)})<input name="fee" type="number" min="0" max="1000000000" step="0.01" value="${c.fee??''}" placeholder="Unknown"></label><label>Rate basis${select('quoteBasis',basisLabels)}</label><label data-unit-control><span id="terms-quantity-label">Episodes or weeks</span><input name="quoteUnits" type="number" min="1" max="10000" step="1" value="${c.quoteUnits??''}" placeholder="Only for unit rates"></label><label>What the offer covers${select('quoteChannel',channelLabels)}</label><label>Delivery markets<input name="markets" maxlength="200" value="${esc(c.markets.join(', '))}" placeholder="Unknown, or Global"></label><label>Offered format${select('format',{'':'Not confirmed','Sponsored content':'Sponsored content','Live event':'Live event','Product collaboration':'Product collaboration'})}</label><label class="full-field">Source link (optional)<input name="source" type="url" value="${esc(c.source)}" placeholder="https://…"></label><label class="full-field">Team notes<textarea name="notes" aria-label="Team notes" maxlength="1000" rows="3">${esc(c.notes)}</textarea></label>`;
  updateTermsCost();$('terms-dialog').showModal();
}
function updateTermsCost(){
  const form=$('terms-form');const basis=form.elements.quoteBasis.value;const unit=form.elements.quoteUnits;
  const perUnit=['episode','week'].includes(basis);unit.disabled=!perUnit;unit.closest('label').hidden=!perUnit;
  $('terms-quantity-label').textContent=basis==='week'?'Number of weeks':'Number of episodes';
  const fee=form.elements.fee;
  if(!fee.validity.valid||(perUnit&&!unit.validity.valid)){$('terms-cost').textContent='Enter a valid rate and a positive whole unit count, or leave unknown values blank.';return;}
  const cost=quoteCost({fee:fee.value===''?null:Number(fee.value),quoteBasis:basis,quoteUnits:perUnit&&unit.value!==''?Number(unit.value):null});
  $('terms-cost').textContent=cost.amount===null?cost.detail:`Package cost: ${money(cost.amount)}. ${cost.detail}`;
}
$('terms-form').addEventListener('input',updateTermsCost);
$('terms-form').addEventListener('change',updateTermsCost);
$('terms-form').addEventListener('submit',async event=>{
  event.preventDefault();const c=campaign.candidates.find(c=>c.id===termsTarget);if(!c||running)return;
  const values=Object.fromEntries(new FormData(event.target));
  Object.assign(c,values,{fee:values.fee===''?null:Number(values.fee),quoteUnits:!['episode','week'].includes(values.quoteBasis)||!values.quoteUnits?null:Number(values.quoteUnits),markets:values.markets.split(',').map(s=>s.trim()).filter(Boolean)});
  closeDialog('terms-dialog');markDirty();populateForm();await runComparison();
  document.querySelector(`[data-terms="${CSS.escape(c.id)}"]`)?.focus();
});
$('new-campaign').addEventListener('click',()=>{
  if(running)return;
  showInfo('Start your own comparison','<p>This replaces the working campaign with an empty brief. Your saved browser draft remains. Save the current draft first if you need it.</p><button class="button primary" id="confirm-new">Start blank campaign</button>');
  $('confirm-new').addEventListener('click',()=>{
    campaign={mode:'commercial',title:'',brand:'',objective:'',market:'',format:'Sponsored content',currency:'USD',budget:null,candidates:[],exampleTerms:false};
    report=null;$('run-status').textContent='New campaign. Add a brief and candidate names.';pins.clear();filter='all';pinnedOnly=false;baseline=false;$('commercial-only').checked=false;
    for(const b of document.querySelectorAll('[data-filter]')){b.classList.toggle('active',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'));}
    for(const id of ['count-all','count-worth','count-needs','count-no','pin-count'])$(id).textContent='0';
    $('candidate-rows').innerHTML='<tr><td colspan="6" class="empty-state">Add a campaign brief and paste your candidate names to begin. No example terms will be carried over.</td></tr>';
    $('result-summary').textContent='Your own shortlist. No comparison yet.';$('baseline-note').hidden=true;$('signal-notes').hidden=true;showError('');
    closeDialog('info-dialog');markDirty();openEditor();$('campaign-form').elements.title.focus();
  });
});
async function initialize(){
  const controls=['new-campaign','save-draft','restore-draft','edit-button','nav-brief','workflow-button','live-button','reset-example','public-case-button'];
  for(const id of controls)$(id).disabled=true;
  $('retry-load').hidden=true;showError('');
  try{config=await api('/api/config');$('mode-select').querySelector('[value=live]').disabled=Boolean(config.staticHosting);await loadExample();for(const id of controls)$(id).disabled=false;}
  catch(error){showError(`Could not load the desk. ${error.message}`);$('retry-load').hidden=false;}
}
$('retry-load').addEventListener('click',initialize);
await initialize();
