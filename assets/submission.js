import {encodeResult} from './result-code.js';
export const DISCLOSURE='Họ tên, mã số sinh viên, lớp và kết quả bài này nằm trong mã em tạo và tự gửi cho cô. Trang không tự gửi thông tin đi đâu cả. Mã không che giấu thông tin cá nhân; chỉ gửi mã cho giảng viên.';
const KEY='listening100-codes-v1';
export function setupSubmission(main){
  let state={profile:null,results:[]},saving=true;
  try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored&&Array.isArray(stored.results))state=stored;else{const old=JSON.parse(localStorage.getItem('listening100-submission-v1'));if(old?.profile)state.profile=old.profile;}}catch{saving=false;}
  const node=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const info=node('section');info.className='student-info';const pending=node('section');pending.className='teacher-submissions';main.prepend(info);main.append(pending);
  const warning=node('p','Không lưu được vào trình duyệt. Em giữ trang mở và copy mã trước khi rời trang.');warning.className='storage-note';warning.hidden=saving;
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{saving=false;}warning.hidden=saving;}
  function valid(p){return p&&['hoTen','mssv','lop'].every(k=>typeof p[k]==='string'&&p[k].trim());}
  function profileView(edit=!valid(state.profile)){
    info.replaceChildren(node('h2','Thông tin sinh viên'),node('p',DISCLOSURE),warning);
    if(!edit){info.append(node('p',`${state.profile.hoTen} · ${state.profile.mssv} · ${state.profile.lop}`));const b=node('button','Sửa lại thông tin');b.type='button';b.onclick=()=>profileView(true);info.append(b);return;}
    const form=node('form');for(const [key,label,max] of [['hoTen','Họ tên',100],['mssv','Mã số sinh viên',30],['lop','Lớp',50]]){const wrap=node('label',label),input=node('input');input.name=key;input.type='text';input.required=true;input.maxLength=max;input.value=state.profile?.[key]||'';input.autocomplete=key==='hoTen'?'name':'off';wrap.append(input);form.append(wrap);}
    const save=node('button','Lưu thông tin');save.type='submit';form.append(save);form.onsubmit=e=>{e.preventDefault();const values=new FormData(form),profile=Object.fromEntries(['hoTen','mssv','lop'].map(k=>[k,String(values.get(k)).trim()]));if(!valid(profile)){form.querySelector('input').focus();return;}state.profile=profile;persist();profileView(false);};info.append(form);
  }
  function render(){
    pending.replaceChildren();if(!state.results.length)return;pending.append(node('h2','Mã nộp bài gửi cho cô'));
    for(const item of [...state.results].reverse()){
      const card=node('article');card.className='teacher-result';card.append(node('h3',item.result.setTitle),node('p',`Kết quả chặng: ${item.result.dung} / ${item.result.tong} câu đúng`),node('p',DISCLOSURE));
      const status=node('p');status.setAttribute('role','status');const button=node('button',item.code?'Tạo lại với thông tin hiện tại':'Tạo mã nộp bài');button.type='button';button.className='primary';
      button.onclick=async()=>{if(!valid(state.profile)){profileView(true);info.querySelector('input')?.focus();status.textContent='Em nhập và lưu đủ thông tin trước khi tạo mã nhé.';return;}button.disabled=true;status.textContent='Đang tạo mã trên máy…';try{item.code=await encodeResult({...state.profile,...item.result});persist();render();}catch{status.textContent='Chưa tạo được mã. Em kiểm tra thông tin và thử bằng Chrome, Edge hoặc Safari phiên bản mới.';button.disabled=false;}};card.append(button,status);
      if(item.code){card.append(node('p','Mã đã tạo. Em copy toàn bộ mã, gửi cho cô qua Zalo. Chưa có thông tin nào được gửi tự động.'));const label=node('label','Mã nộp bài'),area=node('textarea');area.readOnly=true;area.value=item.code;area.rows=3;area.spellcheck=false;label.append(area);const copy=node('button','Copy mã');copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(item.code);status.textContent='Đã copy mã. Em dán vào Zalo gửi cô nhé.';}catch{area.focus();area.select();status.textContent='Trình duyệt chặn copy tự động. Mã đã được chọn; em copy thủ công nhé.';}};card.append(label,copy);}pending.append(card);
    }
  }
  profileView();render();return {record(set,questions,responses){
    // Full-set snapshot after review, so the teacher replaces rather than adds attempts.
    const all=set.questions;state.results.push({result:{setId:set.id,setTitle:set.title,tong:all.length,dung:all.filter(q=>responses[q.id]?.correct).length,cauSai:all.filter(q=>!responses[q.id]?.correct).map(q=>q.number),time:Math.floor(Date.now()/1000)}});persist();render();
  }};
}
