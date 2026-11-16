export const MAX_ATTEMPT_MS=3600000;
export const durationText=seconds=>Number.isInteger(seconds)&&seconds>=0?`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'';
export const durationWords=seconds=>`${Math.floor(seconds/60)} phút ${seconds%60} giây`;
export function clearAttemptTimers(){try{for(const key of Object.keys(localStorage))if(key.startsWith('listening100-timer-v1:'))localStorage.removeItem(key);}catch{}}
// Monotonic elapsed time only; a stored timestamp is never used to count time offline.
export class VisibleClock {
  constructor(saved,now,visible){this.ms=Number.isFinite(saved?.ms)?Math.max(0,Math.min(MAX_ATTEMPT_MS,saved.ms)):0;this.started=saved?.started===true;this.done=false;this.at=now;this.visible=visible;}
  checkpoint(now){if(this.started&&!this.done&&this.visible)this.ms=Math.min(MAX_ATTEMPT_MS,this.ms+Math.max(0,now-this.at));this.at=now;return this.seconds;}
  start(now){this.checkpoint(now);if(!this.done)this.started=true;}
  visibility(visible,now){this.checkpoint(now);this.visible=visible;}
  stop(now){this.checkpoint(now);this.done=true;return this.seconds;}
  get seconds(){return Math.min(3600,Math.floor(this.ms/1000));}
  snapshot(){return {ms:this.ms,started:this.started,done:this.done};}
}
export function createAttemptTimer(main,setId){
  const key='listening100-timer-v1:'+setId;let saved;
  try{saved=JSON.parse(localStorage.getItem(key));}catch{}
  const clock=new VisibleClock(saved?.done?null:saved,performance.now(),!document.hidden);
  const display=document.createElement('p');display.className='attempt-time';main.append(display);
  function persist(){try{localStorage.setItem(key,JSON.stringify(clock.snapshot()));}catch{const note=document.querySelector('#storage-note');if(note)note.hidden=false;}}
  function update(){display.textContent=clock.started?`Thời gian làm: ${durationText(clock.seconds)}${clock.seconds===3600?' · Đã chạm giới hạn 60 phút':clock.done?'':document.hidden?' · Tạm dừng':' · Chỉ tính khi tab đang hiện'}`:'Thời gian làm: bắt đầu từ thao tác đầu tiên, tối đa 60 phút.';}
  function checkpoint(){clock.checkpoint(performance.now());if(clock.started)persist();update();}
  function start(){clock.start(performance.now());persist();update();}
  function visibility(){clock.visibility(!document.hidden,performance.now());if(clock.started)persist();update();}
  function leave(){clock.visibility(false,performance.now());if(clock.started)persist();}
  function returnPage(){visibility();}
  for(const event of ['pointerdown','keydown','input'])main.addEventListener(event,start,{capture:true});
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);window.addEventListener('pageshow',returnPage);
  const interval=setInterval(checkpoint,1000);update();
  return {stop(){const seconds=clock.stop(performance.now());persist();clearInterval(interval);for(const event of ['pointerdown','keydown','input'])main.removeEventListener(event,start,{capture:true});update();return seconds;}};
}
