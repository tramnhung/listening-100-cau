import {encodeSummary} from './result-code.js';
const DISCLOSURE='Họ tên, MSSV, lớp và kết quả tất cả các chặng đã làm nằm trong mã em tự gửi cho cô. Trang không tự gửi thông tin đi đâu. Mã không che giấu thông tin cá nhân.';
export function setupSubmission(main,data,memory){
  if(document.body.dataset.page!=='results')return;
  const node=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const section=node('section');section.className='student-info';section.append(node('h2','Tạo mã nộp bài'),node('p','Làm xong các chặng rồi tạo một mã tổng kết duy nhất để gửi cô.'),node('p',DISCLOSURE));
  const form=node('form'),warning=node('p');warning.className='storage-note';warning.hidden=true;
  let profile={};try{profile=JSON.parse(localStorage.getItem('listening100-profile-v2'))||JSON.parse(localStorage.getItem('listening100-codes-v1'))?.profile||JSON.parse(localStorage.getItem('listening100-submission-v1'))?.profile||{};}catch{warning.textContent='Không đọc được thông tin đã lưu. Em có thể nhập lại và tạo mã trong trang này.';warning.hidden=false;}
  for(const [key,label,max] of [['hoTen','Họ tên',100],['mssv','MSSV',30],['lop','Lớp',50]]){const wrap=node('label',label),input=node('input');input.type='text';input.name=key;input.required=true;input.maxLength=max;input.value=profile[key]||'';wrap.append(input);form.append(wrap);}
  const attempts=data.sets.filter(s=>memory.sets[s.id]&&s.questions.every(q=>memory.responses[q.id]));
  const results=attempts.map(s=>({setId:s.id,tong:s.questions.length,dung:s.questions.filter(q=>memory.responses[q.id].correct).length,cauSai:s.questions.filter(q=>!memory.responses[q.id].correct).map(q=>q.number),time:Math.floor(Date.parse(memory.sets[s.id].completedAt)/1000)}));
  const correct=results.reduce((n,r)=>n+r.dung,0),done=results.reduce((n,r)=>n+r.tong,0);
  section.append(node('p',`${attempts.length} chặng · ${correct}/100 câu đúng · ${done}/100 câu đã làm`));
  const create=node('button','Tạo mã');create.type='submit';create.className='primary';create.disabled=!results.length;form.append(create);
  const status=node('p');status.setAttribute('role','status');if(!results.length)status.textContent='Em cần làm và nộp ít nhất một chặng trước khi tạo mã.';
  const output=node('div');output.hidden=true;const label=node('label','Mã nộp bài tổng kết'),area=node('textarea');area.readOnly=true;area.rows=4;label.append(area);const count=node('p'),copy=node('button','Copy mã');copy.type='button';output.append(label,count,copy);
  form.oninput=()=>{output.hidden=true;status.textContent='Thông tin đã thay đổi. Bấm Tạo mã để cập nhật.';};
  form.onsubmit=async e=>{e.preventDefault();const values=new FormData(form);profile=Object.fromEntries(['hoTen','mssv','lop'].map(k=>[k,String(values.get(k)).trim()]));if(Object.values(profile).some(v=>!v)){status.textContent='Em nhập đủ họ tên, MSSV và lớp nhé.';return;}
    create.disabled=true;status.textContent='Đang tạo mã tổng kết…';try{area.value=await encodeSummary(profile,results);count.textContent=`Độ dài mã: ${area.value.length} ký tự`;output.hidden=false;status.textContent='Đã tạo một mã cho toàn bộ chặng đã làm. Em copy gửi cô qua Zalo.';try{localStorage.setItem('listening100-profile-v2',JSON.stringify(profile));}catch{warning.hidden=false;warning.textContent='Không lưu được thông tin. Em copy mã trước khi rời trang.';}}catch{status.textContent='Không tạo được mã. Em kiểm tra dữ liệu bài làm và dùng trình duyệt phiên bản mới.';}finally{create.disabled=false;}};
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(area.value);status.textContent='Đã copy mã tổng kết.';}catch{area.focus();area.select();status.textContent='Mã đã được chọn. Em copy thủ công nhé.';}};
  section.append(form,warning,status,output);main.insertBefore(section,main.querySelector('.total-score')?.nextSibling||null);
}
