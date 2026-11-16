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
  const p=code.trim().match(/^L100\.1\.([A-Za-z0-9_-]+)\.([a-f0-9]{8})$/);
  if(!p)throw Error('Mã bị thiếu ký tự hoặc sai định dạng L100.1.');
  let bytes;try{bytes=Uint8Array.from(atob(p[1].replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}catch{throw Error('Mã base64 bị hỏng.');}
  if(b64(bytes)!==p[1]||crc32(bytes)!==p[2])throw Error('Checksum không khớp: mã đã bị sửa, cắt hoặc dán thiếu.');
  try{return unpack(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await transform(bytes,new DecompressionStream('deflate')))));}catch{throw Error('Không giải nén được hoặc dữ liệu trong mã không hợp lệ.');}
}
export function validateSet(r,sets){const set=sets.find(s=>s.id===r.setId);if(!set)throw Error('Không tìm thấy chặng trong bộ 100 câu này.');if(r.tong!==set.questions.length||r.cauSai.some(n=>!set.questions.some(q=>q.number===n)))throw Error('Số câu hoặc câu sai không khớp với chặng.');return {...r,setTitle:set.title};}
export function summarize(records){
  const students=new Map();
  for(const r of records){const key=r.mssv.normalize('NFC').trim().toUpperCase();if(!students.has(key))students.set(key,{latest:r,sets:new Map()});const s=students.get(key),old=s.sets.get(r.setId);if(r.time>=s.latest.time)s.latest=r;if(!old||r.time>=old.time)s.sets.set(r.setId,r);}
  return [...students.values()].map(s=>({...s.latest,dung:[...s.sets.values()].reduce((n,r)=>n+r.dung,0),done:[...s.sets.values()].reduce((n,r)=>n+r.tong,0),sets:s.sets.size}));
}
export function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>{let t=String(v??'');if(/^\s*[=+@-]/.test(t)||/^[\t\r\n]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
