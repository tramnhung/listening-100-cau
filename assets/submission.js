import {SUBMIT_ENDPOINT, MA_LOP} from './config.js';

export const DISCLOSURE = 'Khi em bấm Nộp cho cô, họ tên, mã số sinh viên, lớp và kết quả bài này sẽ được gửi cho giảng viên.';
const KEY = 'listening100-submission-v1';

export function payloadFor(profile, result, maLop) {
  return {maLop, hoTen:profile.hoTen, mssv:profile.mssv, lop:profile.lop,
    setId:result.setId, setTitle:result.setTitle, tong:result.tong,
    dung:result.dung, cauSai:result.cauSai};
}

export async function sendResult(endpoint, payload, fetcher = fetch, timeoutMs = 15000) {
  async function post(mode) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetcher(endpoint, {method:'POST', mode, credentials:'omit',
        headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload), signal:controller.signal});
    } finally { clearTimeout(timer); }
  }
  let response;
  try { response = await post('cors'); }
  catch (error) {
    // Browsers do not distinguish a CORS rejection from other network TypeErrors.
    // Do not fall back on explicit HTTP/application errors or timed-out requests.
    if (!(error instanceof TypeError)) throw new Error('Gửi hỏng hoặc quá thời gian chờ. Em thử lại nhé.');
    try {
      response = await post('no-cors');
      if (response.type === 'opaque') return 'unverified';
    } catch { throw new Error('Gửi hỏng. Em kiểm tra kết nối rồi thử lại nhé.'); }
  }
  if (!response.ok) throw new Error('Gửi hỏng. Máy chủ chưa nhận được kết quả.');
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Chưa xác nhận được kết quả từ máy chủ. Em thử lại nhé.'); }
  if (data.ok !== true) throw new Error(data.error === 'sai ma lop'
    ? 'Gửi hỏng: mã lớp chưa đúng. Em báo cô kiểm tra cấu hình rồi thử lại.'
    : 'Gửi hỏng: máy chủ từ chối kết quả. Em thử lại nhé.');
  return 'sent';
}

export function setupSubmission(main) {
  if (!SUBMIT_ENDPOINT.trim()) return {record(){}};
  let state = {profile:null, results:[]}, saving = true;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored && Array.isArray(stored.results)) state = stored;
  } catch { saving = false; }
  for (const item of state.results) if(item.status==='sending') {
    item.status='failed';item.error='Lần gửi trước bị gián đoạn. Em kiểm tra với cô trước khi thử lại để tránh nộp trùng.';
  }
  const node = (tag,text) => {const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const info=node('section'); info.className='student-info';
  const pending=node('section'); pending.className='teacher-submissions';
  main.prepend(info); main.append(pending);
  function persist() {
    try { localStorage.setItem(KEY,JSON.stringify(state)); }
    catch { saving=false; }
    warning.hidden=saving;
  }
  const warning=node('p','Trình duyệt không lưu được thông tin và kết quả chờ nộp. Em giữ trang này mở để thử lại; tải lại hoặc rời trang sẽ mất dữ liệu chờ nộp.');
  warning.className='storage-note';warning.hidden=saving;
  function valid(p) {return p && ['hoTen','mssv','lop'].every(k=>typeof p[k]==='string' && p[k].trim());}
  function profileView(edit=!valid(state.profile)) {
    info.replaceChildren(node('h2','Thông tin sinh viên'),node('p',DISCLOSURE),warning);
    if (!edit) {
      info.append(node('p',`${state.profile.hoTen} · ${state.profile.mssv} · ${state.profile.lop}`));
      const button=node('button','Sửa lại thông tin');button.type='button';button.onclick=()=>profileView(true);info.append(button);return;
    }
    const form=node('form');
    for (const [key,label,max] of [['hoTen','Họ tên',100],['mssv','Mã số sinh viên',30],['lop','Lớp',50]]) {
      const wrapper=node('label',label),input=node('input');input.name=key;input.type='text';input.required=true;input.maxLength=max;
      input.value=state.profile?.[key]||'';input.autocomplete=key==='hoTen'?'name':'off';wrapper.append(input);form.append(wrapper);
    }
    const save=node('button','Lưu thông tin');save.type='submit';form.append(save);
    form.onsubmit=e=>{e.preventDefault();const values=new FormData(form);const profile=Object.fromEntries(['hoTen','mssv','lop'].map(k=>[k,String(values.get(k)).trim()]));
      if(!valid(profile)){form.querySelector('input').focus();return;}
      state.profile=profile;persist();profileView(false);render();};info.append(form);
  }
  function render() {
    pending.replaceChildren();
    if (!state.results.length) return;
    pending.append(node('h2','Nộp kết quả cho giảng viên'));
    for (const item of state.results) {
      const card=node('article');card.className='teacher-result';
      card.append(node('h3',item.result.setTitle),node('p',`Kết quả lượt làm: ${item.result.dung} / ${item.result.tong} câu đúng`),node('p',DISCLOSURE));
      const status=node('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      const button=node('button',item.status==='failed'?'Thử lại':'Nộp cho cô');button.type='button';button.className='primary';
      function update() {
        button.disabled=['sending','sent','unverified'].includes(item.status);
        button.textContent=item.status==='failed'?'Thử lại':item.status==='sending'?'Đang gửi…':item.status==='sent'?'Đã nộp':item.status==='unverified'?'Đã gửi, chờ cô kiểm tra':'Nộp cho cô';
        status.textContent=item.status==='sending'?'Đang gửi kết quả…':item.status==='sent'?'Gửi xong. Giảng viên đã nhận được kết quả.':item.status==='unverified'?'Đã gửi, cô kiểm tra giúp. Trình duyệt không đọc được phản hồi để xác nhận.':item.status==='failed'?item.error:'Kết quả được giữ lại để em nộp khi sẵn sàng. Chưa có dữ liệu nào được gửi.';
      }
      button.onclick=async()=>{
        if(button.disabled)return;
        if(!valid(state.profile)){profileView(true);info.querySelector('input')?.focus();status.textContent='Em nhập và lưu đầy đủ thông tin sinh viên trước khi nộp nhé.';return;}
        item.status='sending';item.error='';persist();update();
        try { item.status=await sendResult(SUBMIT_ENDPOINT,payloadFor(state.profile,item.result,MA_LOP)); }
        catch(error){item.status='failed';item.error=error.message;}
        persist();render();
      };
      update();card.append(button,status);pending.append(card);
    }
  }
  profileView();render();
  return {record(set,questions,responses) {
    state.results.push({result:{setId:set.id,setTitle:set.title,tong:questions.length,
      dung:questions.filter(q=>responses[q.id]?.correct).length,
      cauSai:questions.filter(q=>!responses[q.id]?.correct).map(q=>q.number).join(',')},status:'pending'});
    persist();render();
  }};
}
