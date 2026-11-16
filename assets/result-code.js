// Compact JSON -> DEFLATE -> base64url; CRC32 detects damage, not forgery.
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return ((c^0xffffffff)>>>0).toString(16).padStart(8,'0');}
function b64(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function transform(bytes,stream){
  const reader=new Blob([bytes]).stream().pipeThrough(stream).getReader(),chunks=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();throw Error('Mã quá dài.');}chunks.push(value);}}finally{reader.releaseLock();}
  const out=new Uint8Array(length);let at=0;for(const c of chunks){out.set(c,at);at+=c.length;}return out;
}
function unpack(a){
  if(!Array.isArray(a)||a.length!==8)throw Error('Dữ liệu trong mã không đúng định dạng.');
  const [hoTen,mssv,lop,setId,tong,dung,cauSai,time]=a;
  for(const [v,max] of [[hoTen,100],[mssv,30],[lop,50],[setId,100]])if(typeof v!=='string'||!v.trim()||v.length>max||/[\u0000-\u001f]/.test(v))throw Error('Thông tin trong mã không hợp lệ.');
  if(!Number.isInteger(tong)||tong<1||tong>100||!Number.isInteger(dung)||dung<0||dung>tong||!Array.isArray(cauSai)||cauSai.length!==tong-dung||new Set(cauSai).size!==cauSai.length||cauSai.some(n=>!Number.isInteger(n)||n<1||n>100)||!Number.isInteger(time)||time<1577836800||time>4102444800)throw Error('Điểm hoặc thời gian trong mã không hợp lệ.');
  return {hoTen,mssv,lop,setId,tong,dung,cauSai,time};
}
export async function encodeResult(r){
  const a=[r.hoTen.trim(),r.mssv.trim(),r.lop.trim(),r.setId,r.tong,r.dung,r.cauSai,r.time];unpack(a);
  const bytes=await transform(new TextEncoder().encode(JSON.stringify(a)),new CompressionStream('deflate'));
  return `L100.1.${b64(bytes)}.${crc32(bytes)}`;
}
export async function decodeResult(code){
  if(typeof code!=='string'||code.length>12000)throw Error('Mã quá dài hoặc không hợp lệ.');
  const p=code.trim().match(/^L100\.([123])\.([A-Za-z0-9_-]+)\.([a-f0-9]{8})$/);
  if(!p)throw Error('Mã bị cắt, thiếu checksum hoặc sai định dạng L100.1/L100.2/L100.3.');
  let bytes;try{bytes=Uint8Array.from(atob(p[2].replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}catch{throw Error('Mã base64 bị hỏng.');}
  if(b64(bytes)!==p[2]||crc32(bytes)!==p[3])throw Error('Checksum không khớp: mã đã bị sửa, cắt hoặc dán thiếu.');
  try{const a=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await transform(bytes,new DecompressionStream('deflate'))));return p[1]==='1'?unpack(a):unpackSummary(a,Number(p[1]));}catch{throw Error('Không giải nén được hoặc dữ liệu trong mã không hợp lệ.');}
}
export function validateSet(r,sets){const set=sets.find(s=>s.id===r.setId);if(!set)throw Error('Không tìm thấy chặng trong bộ 100 câu này.');if(r.tong!==set.questions.length||r.cauSai.some(n=>!set.questions.some(q=>q.number===n)))throw Error('Số câu hoặc câu sai không khớp với chặng.');return {...r,setTitle:set.title};}
export function summarize(records){
  const students=new Map();
  for(const r of records){const key=r.mssv.normalize('NFC').trim().toUpperCase();if(!students.has(key))students.set(key,{latest:r,sets:new Map()});const s=students.get(key),old=s.sets.get(r.setId);if(r.time>=s.latest.time)s.latest=r;if(!old||r.time>=old.time)s.sets.set(r.setId,r);}
  return [...students.values()].map(s=>({...s.latest,dung:[...s.sets.values()].reduce((n,r)=>n+r.dung,0),done:[...s.sets.values()].reduce((n,r)=>n+r.tong,0),sets:s.sets.size,totalDurationSec:[...s.sets.values()].every(r=>Number.isInteger(r.durationSec))?[...s.sets.values()].reduce((n,r)=>n+r.durationSec,0):null}));
}
export function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>{let t=String(v??'');if(/^\s*[=+@-]/.test(t)||/^[\t\r\n]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}

function unpackSummary(a,version=2){
  if(!Array.isArray(a)||a.length!==7)throw Error('Mã tổng kết sai định dạng.');
  const [hoTen,mssv,lop,base,totalRight,totalDone,rows]=a;
  if(!Number.isInteger(base)||!Array.isArray(rows)||!rows.length||rows.length>CODE_SETS.length)throw Error('Thiếu chặng hoặc thời gian.');
  const seen=new Set(),results=[];
  for(const row of rows){
    if(!Array.isArray(row)||row.length!==(version===3?4:3))throw Error('Chặng sai định dạng.');
    const [index,mask,delta]=row,set=CODE_SETS[index];
    if(!Number.isInteger(index)||!set||seen.has(index)||!Number.isInteger(mask)||mask<0||mask>=2**set.numbers.length||!Number.isInteger(delta)||delta<0)throw Error('Chặng trùng hoặc dữ liệu không hợp lệ.');
    seen.add(index);const cauSai=set.numbers.filter((n,i)=>mask&(1<<i));
    const result=unpack([hoTen,mssv,lop,set.id,set.numbers.length,set.numbers.length-cauSai.length,cauSai,base+delta]);
    if(version===3){const seconds=row[3];if(seconds!==null&&(!Number.isInteger(seconds)||seconds<0||seconds>3600))throw Error('Thời gian làm không hợp lệ.');result.durationSec=seconds;}results.push(result);
  }
  if(totalRight!==results.reduce((n,r)=>n+r.dung,0)||totalDone!==results.reduce((n,r)=>n+r.tong,0))throw Error('Tổng điểm không khớp.');
  return {version,hoTen,mssv,lop,totalRight,totalDone,results};
}
export async function encodeSummary(profile,results,version=3){
  if(![2,3].includes(version))throw Error('Phiên bản không hợp lệ.');
  if(!results.length)throw Error('Chưa có chặng đã làm.');
  const base=Math.min(...results.map(r=>r.time));
  const rows=results.map(r=>{
    unpack([profile.hoTen.trim(),profile.mssv.trim(),profile.lop.trim(),r.setId,r.tong,r.dung,r.cauSai,r.time]);
    const index=CODE_SETS.findIndex(s=>s.id===r.setId),set=CODE_SETS[index];
    if(!set||r.tong!==set.numbers.length||r.cauSai.some(n=>!set.numbers.includes(n)))throw Error('Chặng không hợp lệ.');
    const row=[index,r.cauSai.reduce((mask,n)=>mask|(1<<set.numbers.indexOf(n)),0),r.time-base];if(version===3)row.push(r.durationSec??null);return row;
  }).sort((a,b)=>a[0]-b[0]);
  const a=[profile.hoTen.trim(),profile.mssv.trim(),profile.lop.trim(),base,results.reduce((n,r)=>n+r.dung,0),results.reduce((n,r)=>n+r.tong,0),rows];
  unpackSummary(a,version);const bytes=await transform(new TextEncoder().encode(JSON.stringify(a)),new CompressionStream('deflate'));
  return `L100.${version}.${b64(bytes)}.${crc32(bytes)}`;
}
export function expandResult(decoded,sets){return (decoded.version>=2?decoded.results:[decoded]).map(r=>validateSet(r,sets));}

// Frozen v2 catalog: never reorder or reuse an index for a different set.
export const CODE_SETS=[{"id":"vstep-p1-announcements-a","numbers":[1,2,3,4,5]},{"id":"vstep-p1-announcements-b","numbers":[6,7,8,9,10]},{"id":"vstep-p2-t01","numbers":[11,12,13,14,15]},{"id":"vstep-p2-t02","numbers":[16,17,18,19,20]},{"id":"vstep-p2-t06-vstep-p2-t08","numbers":[21,22,23,24,25,26,27,28,29,30]},{"id":"vstep-p2-t11","numbers":[31,32,33,34,35]},{"id":"vstep-p2-t14","numbers":[36,37,38,39,40]},{"id":"vstep-p3-t04-vstep-p3-t05","numbers":[41,42,43,44,45,46,47,48,49,50]},{"id":"vstep-p3-t06-vstep-p3-t18","numbers":[51,52,53,54,55,56,57,58,59,60]},{"id":"vstep-p3-t29","numbers":[61,62,63,64,65]},{"id":"vstep-p3-t31","numbers":[66,67,68,69,70]},{"id":"cam13-t1-s1-q01-05","numbers":[71,72,73,74,75]},{"id":"cam13-t1-s1-q06-10","numbers":[76,77,78,79,80]},{"id":"cam13-t2-s1-q01-05","numbers":[81,82,83,84,85]},{"id":"cam13-t2-s1-q06-10","numbers":[86,87,88,89,90]},{"id":"cam13-t3-s1-q01-05","numbers":[91,92,93,94,95]},{"id":"cam13-t3-s1-q06-10","numbers":[96,97,98,99,100]}];
