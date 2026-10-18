import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const output=new URL('../artifacts/',import.meta.url);await mkdir(output,{recursive:true});
try{
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4318');await page.locator('#export-button:enabled').waitFor();
 await page.getByRole('button',{name:'Edit campaign',exact:true}).click();
 await page.getByRole('button',{name:'Paste names',exact:true}).click();
 await page.locator('#paste-text').fill('New podcast\nKhruangbin | artist');await page.getByRole('button',{name:'Add names',exact:true}).click();
 assert.match(await page.locator('#paste-error').innerText(),/Duplicate/);assert.equal(await page.locator('.candidate-input').count(),6);
 await page.locator('#paste-text').fill('The Pen Addict\nAccidental Tech Podcast');await page.getByRole('button',{name:'Add names',exact:true}).click();
 await page.locator('#paste-dialog').waitFor({state:'hidden'});assert.equal(await page.locator('.candidate-input').count(),8);
 await page.getByLabel('Budget per partner',{exact:true}).fill('500');
 const quote=page.locator('[data-id="khruangbin"]');await quote.locator('[data-field="fee"]').fill('200');await quote.locator('.quote-context summary').click();await quote.locator('[data-field="quoteBasis"]').selectOption('episode');await quote.locator('[data-field="quoteUnits"]').fill('3');
 await page.getByRole('button',{name:/Compare candidates/}).click();await page.locator('#editor').waitFor({state:'hidden'});
 const result=page.locator('#candidate-rows tr').filter({has:page.getByRole('button',{name:'Khruangbin',exact:true})});assert.match(await result.innerText(),/\$600/);assert.match(await result.innerText(),/Does not fit/);
 await page.getByRole('button',{name:'Try public research case',exact:true}).click();await page.getByRole('button',{name:'Load research case',exact:true}).click();
 await page.locator('#editor').waitFor({state:'visible'});
 if(await page.locator('#token-input').isVisible()){assert.ok(process.env.ACCESS_TOKEN);await page.locator('#token-input').fill(process.env.ACCESS_TOKEN);await page.getByRole('button',{name:'Unlock',exact:true}).click();}
 assert.equal(await page.locator('.candidate-input').count(),2);
 await page.getByRole('button',{name:'Review identities',exact:true}).click();
 await page.getByText('Searched 3 names. Select only identities you can confirm.',{exact:true}).waitFor({timeout:60000});
 assert.equal(await page.locator('#apply-identities').isDisabled(),true);
 for(const name of ['Field Notes','The Pen Addict','Accidental Tech Podcast']){const choice=page.locator('.identity-choice').filter({has:page.getByText(name,{exact:true})});assert.equal(await choice.count(),1);await choice.click();}
 await page.getByRole('button',{name:'Apply 3 selected identities',exact:true}).click();await page.locator('#identities-dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:/Compare candidates/}).click();await page.locator('#editor').waitFor({state:'hidden',timeout:60000});
 const pen=page.locator('#candidate-rows tr').filter({has:page.getByRole('button',{name:'The Pen Addict',exact:true})});
 assert.match(await pen.innerText(),/Qloo affinity/);assert.match(await pen.innerText(),/Does not fit/);assert.match(await pen.innerText(),/website, not a podcast/);
 const atp=page.locator('#candidate-rows tr').filter({has:page.getByRole('button',{name:'Accidental Tech Podcast',exact:true})});assert.match(await atp.innerText(),/Needs information/);assert.match(await atp.innerText(),/Not comparable/);
 const displayedScores=await page.locator('#candidate-rows .signal-number').allTextContents();if(new Set(displayedScores).size===1){assert.equal(await page.locator('#signal-notes').isVisible(),true);assert.match(await page.locator('#signal-notes').innerText(),/same cultural score/);}
 await page.locator('#toast').waitFor({state:'hidden'});await page.locator('h1').click();
 await page.screenshot({path:new URL('public-case.png',output).pathname,fullPage:true});
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export brief',exact:true}).click();const downloaded=await pending;const md=await readFile(await downloaded.path(),'utf8');assert.match(md,/planning assumptions/);assert.match(md,/Placement: website/);assert.match(md,/Basis: week/);assert.match(md,/LIVE QLOO/);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.getByRole('button',{name:'Edit campaign',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:new URL('public-case-mobile.png',output).pathname,fullPage:true});
 assert.deepEqual(errors,[]);console.log('Workflow checks passed: atomic paste, per-unit cost, explicit batch identity confirmation, sourced placement mismatch, live export and mobile layout.');
}finally{await browser.close();}
