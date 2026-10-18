import { createRequire } from 'node:module';
import { mkdir,readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const output=new URL('../artifacts/',import.meta.url);await mkdir(output,{recursive:true});
try{
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4318');await page.locator('#export-button:enabled').waitFor();
 await page.getByRole('button',{name:'Connect live evidence',exact:true}).click();
 if(await page.locator('#token-input').isVisible()){assert.ok(process.env.ACCESS_TOKEN,'Set the desk ACCESS_TOKEN for this browser check.');await page.locator('#token-input').fill(process.env.ACCESS_TOKEN);await page.getByRole('button',{name:'Unlock',exact:true}).click();}
 await page.locator('#editor').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-id="khruangbin"] [data-field="fee"]').inputValue(),'');
 async function resolve(button,name){await button.click();await page.getByRole('button',{name:'Search',exact:true}).click();const choice=page.locator('.search-result').filter({has:page.getByText(name,{exact:true})});await choice.waitFor();await choice.click();}
 await resolve(page.locator('#resolve-brand'),'Patagonia');
 await resolve(page.locator('[data-resolve="khruangbin"]'),'Khruangbin');
 await resolve(page.locator('[data-resolve="outside"]'),'Outside Podcast');
 const row=page.locator('[data-id="khruangbin"]');
 await row.locator('[data-field="fee"]').fill('4500');
 await row.locator('[data-field="markets"]').fill('United States');
 await row.locator('[data-field="format"]').selectOption('Sponsored content');
 await row.locator('[data-field="notes"]').fill('Test quote only. Live interface validation; not a commercial offer.');
 await row.locator('.quote-context summary').click();
 await row.locator('[data-field="quoteBasis"]').selectOption('package');
 await row.locator('[data-field="quoteChannel"]').selectOption('artist');
 await page.getByRole('button',{name:/Compare candidates/}).click();await page.locator('#editor').waitFor({state:'hidden'});
 const artist=page.locator('#candidate-rows tr').filter({has:page.getByRole('button',{name:'Khruangbin',exact:true})});assert.match(await artist.innerText(),/Qloo affinity/);assert.match(await artist.innerText(),/Worth a conversation/);
 const podcast=page.locator('#candidate-rows tr').filter({has:page.getByRole('button',{name:'Outside Podcast',exact:true})});assert.match(await podcast.innerText(),/Qloo affinity/);assert.match(await podcast.innerText(),/Needs information/);
 await page.locator('#toast').waitFor({state:'hidden'});
 await page.screenshot({path:new URL('live-desktop.png',output).pathname,fullPage:true});
 await page.getByRole('button',{name:'Khruangbin',exact:true}).click();await page.getByText('Live Qloo evidence',{exact:true}).waitFor();await page.locator('#detail-dialog summary').click();assert.match(await page.locator('#detail-content pre').innerText(),/qloo-live/);assert.ok(!await page.locator('#detail-content pre').innerText().then(x=>x.includes('X-Api-Key')));await page.screenshot({path:new URL('live-evidence.png',output).pathname,fullPage:true});await page.getByRole('button',{name:'Close partner details'}).click();
 await page.getByRole('button',{name:'Pin Khruangbin',exact:true}).click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export brief',exact:true}).click();const download=await pending;const md=await readFile(await download.path(),'utf8');assert.match(md,/LIVE QLOO/);assert.ok(!md.includes('synthetic-demo'));assert.match(md,/Test quote only/);
 assert.deepEqual(errors,[]);
 console.log('Live browser checks passed: demo terms cleared, explicit identities confirmed, both categories scored, commercial unknowns retained, live provenance and export verified.');
}finally{await browser.close();}
