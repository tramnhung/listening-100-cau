import assert from 'node:assert/strict';
import {sendResult,payloadFor,setupSubmission} from '../assets/submission.js';
const base='http://127.0.0.1:8767';
const result={setId:'qa-set',setTitle:'Chặng kiểm thử',tong:5,dung:3,cauSai:'12,15'};
const payload=payloadFor({hoTen:'Sinh viên kiểm thử',mssv:'TEST001',lop:'Lớp giả',extra:'never send'},result,'qa-class');
assert.deepEqual(Object.keys(payload),['maLop','hoTen','mssv','lop','setId','setTitle','tong','dung','cauSai']);
assert.doesNotThrow(()=>setupSubmission(null).record()); // Blank production config: no DOM/storage/network.
await fetch(base+'/reset',{method:'POST'});
assert.equal(await sendResult(base+'/success',payload),'sent');
await assert.rejects(sendResult(base+'/reject',payload),/mã lớp/);
await assert.rejects(sendResult(base+'/fail-once',payload),/Gửi hỏng/);
assert.equal(await sendResult(base+'/fail-once',payload),'sent');
const requests=(await (await fetch(base+'/requests')).json()).requests;
assert.equal(requests.length,4); // HTTP and app errors must not cause no-cors retries.
for(const r of requests){assert.deepEqual(r.payload,payload);assert.equal(r.contentType,'text/plain;charset=utf-8');}
const modes=[];
assert.equal(await sendResult(base,payload,async(url,init)=>{modes.push(init.mode);if(init.mode==='cors')throw new TypeError('CORS');return {type:'opaque'};}),'unverified');
assert.deepEqual(modes,['cors','no-cors']);
await assert.rejects(sendResult(base,payload,async()=>{throw new TypeError('offline');}),/Gửi hỏng/);
await assert.rejects(sendResult(base,payload,(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('timeout','AbortError')))),10),/quá thời gian/);
console.log('PASS: real HTTP payload/content-type, success, rejection, retry; CORS fallback, offline, timeout; disabled config.');
