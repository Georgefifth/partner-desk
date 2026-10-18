import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from '../server.mjs';
import { example } from '../lib/example.mjs';

test('HTTP flow: private config, demo, validation, export and origin checks',async t=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base=`http://127.0.0.1:${server.address().port}`;
 const config=await(await fetch(`${base}/api/config`)).json();assert.equal(config.liveAvailable,false);assert.ok(!JSON.stringify(config).includes('apiKey'));
 const post=(path,data,headers={})=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
 const campaign={...structuredClone(example),mode:'demo'};let response=await post('/api/analyze',campaign);assert.equal(response.status,200);assert.equal((await response.json()).rows.length,6);
 response=await post('/api/analyze',{...campaign,budget:-1});assert.equal(response.status,400);
 response=await post('/api/analyze',campaign,{Origin:'https://untrusted.example'});assert.equal(response.status,403);
 response=await post('/api/export',{campaign,pinnedIds:['outside']});assert.match((await response.json()).markdown,/ILLUSTRATIVE DEMO/);
 response=await fetch(`${base}/api/search?query=Patagonia&type=brand`);assert.equal(response.status,503);
 response=await fetch(`${base}/.env`);assert.equal(response.status,404);
 response=await fetch(base);assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
});
test('live routes require a shared access token when configured',async t=>{const server=createServer({qloo:{search:async()=>[]},accessToken:'server-only'});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const url=`http://127.0.0.1:${server.address().port}/api/search?query=Brand&type=brand`;assert.equal((await fetch(url)).status,401);assert.equal((await fetch(url,{headers:{Authorization:'Bearer server-only'}})).status,200);});
test('MCP initializes and compares a campaign without writing logs to stdout',async()=>{
 const child=spawn(process.execPath,['mcp.mjs'],{cwd:new URL('..',import.meta.url),env:{PATH:process.env.PATH}});let output='';let stderr='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
 child.stdin.end([{jsonrpc:'2.0',id:1,method:'initialize',params:{}},{jsonrpc:'2.0',id:2,method:'tools/list'},{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'compare_campaign',arguments:{...structuredClone(example),mode:'demo'}}}].map(x=>JSON.stringify(x)).join('\n')+'\n');
 const code=await new Promise(r=>child.on('close',r));assert.equal(code,0);assert.equal(stderr,'');const messages=output.trim().split('\n').map(JSON.parse);assert.equal(messages.length,3);assert.equal(messages[1].result.tools.length,2);const result=JSON.parse(messages[2].result.content[0].text);assert.equal(result.report.rows.length,6);assert.match(result.markdown,/ILLUSTRATIVE DEMO/);
});

test('public health and token validation do not spend upstream requests',async t=>{
 let calls=0;const server=createServer({qloo:{search:async()=>{calls++;return [];}},accessToken:'private-pilot-token'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const base=`http://127.0.0.1:${server.address().port}`;
 for(let i=0;i<65;i++)assert.equal((await fetch(base+'/healthz')).status,200);
 const health=await(await fetch(base+'/healthz')).json();assert.equal(health.status,'ok');assert.deepEqual(Object.keys(health).sort(),['status','version']);
 assert.equal((await fetch(base+'/api/access')).status,401);
 assert.equal((await fetch(base+'/api/access',{headers:{Authorization:'Bearer incorrect'}})).status,401);
 const response=await fetch(base+'/api/access',{headers:{Authorization:'Bearer private-pilot-token'}});
 assert.deepEqual(await response.json(),{authorized:true});assert.equal(calls,0);
 assert.equal((await fetch(base+'/api/search?query=Patagonia&type=brand',{headers:{Authorization:'Bearer private-pilot-token'}})).status,200);assert.equal(calls,1);
});
