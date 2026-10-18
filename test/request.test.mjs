import test from 'node:test';
import assert from 'node:assert/strict';
import {requestJson} from '../public/request.js';

test('hosting HTML is a recoverable error without exposing the body or retrying',async()=>{
  let calls=0;
  await assert.rejects(requestJson('/api/config',{}, {fetcher:async()=>{calls++;return new Response('<html>private platform diagnostics</html>',{status:503});}}),error=>/server.*waking up/.test(error.message)&&!error.message.includes('diagnostics'));
  assert.equal(calls,1);
});
test('authentication status survives transport parsing for access recovery',async()=>{
  await assert.rejects(requestJson('/api/access',{}, {fetcher:async()=>Response.json({error:'Enter the desk token.'},{status:401})}),error=>error.status===401&&error.message==='Enter the desk token.');
  assert.deepEqual(await requestJson('/api/config',{}, {fetcher:async()=>Response.json({liveAvailable:true})}),{liveAvailable:true});
});
test('offline failure explains recovery without repeating a live request',async()=>{
  let calls=0;
  await assert.rejects(requestJson('/api/analyze',{method:'POST'}, {fetcher:async()=>{calls++;throw new TypeError('fetch failed');}}),/Check your connection/);
  assert.equal(calls,1);
});
const interrupted=async(_path,{signal})=>new Promise((resolve,reject)=>{
  if(signal.aborted)return reject(signal.reason);
  signal.addEventListener('abort',()=>reject(signal.reason),{once:true});
});
test('an unresponsive request times out and external dialog cancellation still propagates',async()=>{
  await assert.rejects(requestJson('/api/analyze',{}, {fetcher:interrupted,timeoutMs:5}),/took too long/);
  const controller=new AbortController();controller.abort();
  await assert.rejects(requestJson('/api/search',{signal:controller.signal},{fetcher:interrupted}),error=>error.name==='AbortError');
});
