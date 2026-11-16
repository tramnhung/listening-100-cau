import {decodeResult,validateSet,summarize,csv} from './result-code.js';
const KEY='listening100-gradebook-v1',main=document.querySelector('main');
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const time=r=>new Date(r.time*1000).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
const detailHeaders=['Họ tên','MSSV','Lớp','Chặng','Đúng/Tổng','Phần trăm','Câu sai','Thời gian (Việt Nam)'];
const detailRow=r=>[r.hoTen,r.mssv,r.lop,r.setTitle,`${r.dung}/${r.tong}`,`${Math.round(1000*r.dung/r.tong)/10}%`,r.cauSai.join(', '),time(r)];
const sumHeaders=['Họ tên','MSSV','Lớp','Đúng / 100','Đã làm / 100','Số chặng','Phần trăm trên 100 câu'];
const sumRow=r=>[r.hoTen,r.mssv,r.lop,`${r.dung}/100`,`${r.done}/100`,r.sets,`${r.dung}%`];
function table(headers,rows,label){const wrap=node('div');wrap.className='table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',label);const t=node('table'),head=node('thead'),tr=node('tr');for(const h of headers){const th=node('th',h);th.scope='col';tr.append(th);}head.append(tr);const body=node('tbody');for(const row of rows){const tr=node('tr');for(const value of row)tr.append(node('td',value));body.append(tr);}t.append(head,body);wrap.append(t);return wrap;}
function download(name,rows){const blob=new Blob([csv(rows)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function init(){
  let sets;try{const response=await fetch('./data/questions.json');if(!response.ok)throw Error();sets=(await response.json()).sets;}catch{main.append(node('p','Không tải được danh sách chặng. Vui lòng tải lại trang.'));return;}
  let records=[],codes=[];
  main.append(node('p','DÀNH CHO GIẢNG VIÊN'),node('h1','Bảng điểm lớp'),node('p','Mã này không chống gian lận. Sinh viên biết kỹ thuật có thể sửa điểm trước khi tạo mã, nên dùng làm sổ theo dõi luyện tập, không phải điểm chính thức.'),node('p','Mã chứa thông tin cá nhân, không được mã hóa bảo mật. Dữ liệu chỉ được xử lý và lưu trên trình duyệt này, không tự gửi lên dịch vụ nào. Giữ riêng mã và file CSV của lớp.'));
  main.append(node('p','Tổng hợp theo MSSV, lấy lần mới nhất của từng chặng theo thời gian trong mã. Nếu cùng thời gian, lấy mã nhập sau. Mã trùng hệt được bỏ qua và báo số lượng. Câu chưa làm không được tính đúng; tổng điểm tính trên 100 câu.'));
  const label=node('label','Dán mã nộp bài — mỗi dòng một mã'),input=node('textarea');input.rows=7;input.id='codes';input.spellcheck=false;label.htmlFor='codes';main.append(label,input);
  const add=node('button','Nhập mã vào bảng');add.className='primary';
  const exportDetail=node('button','Xuất CSV chi tiết'),exportSum=node('button','Xuất CSV tổng hợp'),clear=node('button','Xóa hết bảng điểm');
  const actions=node('div');actions.className='actions';actions.append(add,exportDetail,exportSum,clear);main.append(actions);
  const status=node('p');status.setAttribute('role','status');const errors=node('ul');errors.className='code-errors';errors.setAttribute('aria-live','polite');
  const storage=node('p');storage.className='storage-note';storage.hidden=true;
  const tables=node('section');main.append(status,errors,storage,tables);
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(codes));storage.hidden=true;}catch{storage.textContent='Không lưu được bảng điểm trong trình duyệt. Hãy xuất CSV và giữ lại mã gốc trước khi đóng trang.';storage.hidden=false;}}
  function render(){tables.replaceChildren();exportDetail.disabled=exportSum.disabled=!records.length;clear.disabled=!records.length;
    const summary=summarize(records);tables.append(node('h2',`Tổng hợp · ${summary.length} sinh viên`),table(sumHeaders,summary.map(sumRow),'Bảng tổng hợp'),node('h2',`Chi tiết · ${records.length} mã`),table(detailHeaders,records.map(detailRow),'Bảng chi tiết'));
  }
  async function accept(lines,restoring=false){let added=0,duplicate=0;errors.replaceChildren();
    for(let i=0;i<lines.length;i++){const code=lines[i].trim();if(!code)continue;
      if(codes.includes(code)){duplicate++;continue;}
      try{const record=validateSet(await decodeResult(code),sets);codes.push(code);records.push(record);added++;}
      catch(e){errors.append(node('li',`${restoring?'Mã đã lưu':'Dòng'} ${i+1}: ${e.message}`));}
    }
    status.textContent=`${restoring?'Đã khôi phục':'Đã nhập'} ${added} mã; ${duplicate} mã trùng; ${errors.childElementCount} mã hỏng.`;render();
  }
  add.onclick=async()=>{add.disabled=true;status.textContent='Đang kiểm tra mã…';try{await accept(input.value.split(/\r?\n/));persist();if(!errors.childElementCount)input.value='';}finally{add.disabled=false;}};
  exportDetail.onclick=()=>download('bang-diem-chi-tiet.csv',[detailHeaders,...records.map(detailRow)]);
  exportSum.onclick=()=>download('bang-diem-tong-hop.csv',[sumHeaders,...summarize(records).map(sumRow)]);
  clear.onclick=()=>{if(!confirm('Xóa toàn bộ mã và bảng điểm đã lưu trên trình duyệt này? Hãy xuất CSV trước nếu cần giữ lại.'))return;records=[];codes=[];input.value='';errors.replaceChildren();persist();render();status.textContent='Đã xóa bảng điểm trên trình duyệt này.';};
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(saved))throw Error();await accept(saved,true);}catch{storage.textContent='Không đọc được dữ liệu đã lưu. Bạn vẫn có thể nhập mã và xuất CSV trong phiên này.';storage.hidden=false;render();}
}
init();
