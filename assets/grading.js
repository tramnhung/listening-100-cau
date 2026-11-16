export function normalize(value) {
  return String(value ?? '').normalize('NFC').trim().toLocaleLowerCase('en').replace(/[.,!?;:]+$/u, '').trim().replace(/\s+/g, ' ');
}
export function distance(a,b) {
  let row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++) {let next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}
  return row[b.length];
}
export function grade(q,value) {
  const text=normalize(value);
  if(!text)return {correct:false,typo:false};
  if(q.type!=='gap_fill')return {correct:text===normalize(q.answer),typo:false};
  if(q.answers.some(a=>normalize(a)===text))return {correct:true,typo:false};
  const close=q.answers.find(a=>distance(text,normalize(a))===1);
  return {correct:!!close,typo:!!close,expected:close};
}
