"""Reproduce approved clips; source audio stays outside the repository.
Usage: python tools/build_audio.py --source-root PATH [--ffmpeg PATH]
Requires ffmpeg with libmp3lame. Uses the exact two-pass filter from brief 4.2.
"""
import argparse,json,subprocess,re,shutil,tempfile
from pathlib import Path

SIL='silenceremove=start_periods=1:start_silence=0.3:start_threshold=-45dB:stop_periods=-1:stop_duration=1.2:stop_threshold=-45dB:detection=peak'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--source-root',type=Path,required=True);ap.add_argument('--ffmpeg',default='ffmpeg');ap.add_argument('--only',nargs='*');args=ap.parse_args()
 root=Path(__file__).resolve().parents[1];manifest=json.loads((root/'tools/audio-manifest.json').read_text(encoding='utf-8'))
 temp=root/'tools/.audio-work';temp.mkdir(exist_ok=True);(root/'audio').mkdir(exist_ok=True)
 def run(cmd):
  p=subprocess.run([args.ffmpeg,'-hide_banner','-nostats','-y']+cmd,capture_output=True,text=True,encoding='utf-8',errors='replace')
  if p.returncode:raise RuntimeError(p.stderr)
  return p.stderr
 report=[]
 for j in manifest['jobs']:
  if args.only and j['id'] not in args.only:continue
  target=temp/(j['id']+'.mp3')
  if 'concat' in j:
   silence=temp/'sil.mp3'
   if not silence.exists():run(['-f','lavfi','-i','anullsrc=r=22050:cl=mono','-t','1.5','-c:a','libmp3lame','-b:a','64k','-write_xing','1',str(silence)])
   paths=[]
   for id in j['concat']:
    if paths:paths.append(silence)
    piece=temp/(id+'.mp3')
    # Keep the required 1.5-second join; remove only extra edge silence from pieces.
    log=run(['-i',str(piece),'-af','silencedetect=noise=-45dB:d=0.05','-f','null','-'])
    durmatch=re.search(r'Duration: (\d+):(\d+):([\d.]+)',log)
    duration=int(durmatch[1])*3600+int(durmatch[2])*60+float(durmatch[3])
    intervals=[(float(a),float(b)) for a,b in re.findall(r'silence_start: ([\d.]+).*?silence_end: ([\d.]+)',log,re.S)]
    begin=0;end=duration
    for a,b in intervals:
     if a<0.06:begin=max(0,b-.05)
     if b>duration-.12:end=a+.05
    clipped=temp/(id+'-join.mp3')
    run(['-ss',str(begin),'-to',str(end),'-i',str(piece),'-c','copy','-write_xing','1',str(clipped)])
    paths.append(clipped)
   concat=temp/'concat.txt';concat.write_text('\n'.join("file '"+p.resolve().as_posix().replace("'","'\\''")+"'" for p in paths),encoding='utf-8')
   run(['-f','concat','-safe','0','-i',str(concat),'-c','copy','-write_xing','1',str(target)])
  else:
   src=args.source_root/j['source'];cmd=['-ss',str(j.get('start',0))]
   if j.get('end') is not None:cmd+=['-to',str(j['end'])]
   cmd+=['-i',str(src)]
   if j.get('alreadyClean') and not j.get('normalizeCut'):
    run(cmd+['-c:a','copy','-write_xing','1',str(target)])
   else:
    log=run(cmd+['-af',SIL+',loudnorm=I=-16:TP=-3.0:LRA=11:print_format=json','-f','null','-'])
    m=json.loads(log[log.rfind('{'):log.rfind('}')+1]);report.append({'id':j['id'],'measurement':m})
    filt=SIL+f",loudnorm=I=-16:TP=-3.0:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']},alimiter=limit=0.708:level=false,afade=t=in:st=0:d=0.15"
    run(cmd+['-af',filt,'-ac','1','-ar','22050','-c:a','libmp3lame','-b:a','64k','-write_xing','1',str(target)])
  if j['id'] in manifest['outputs']:shutil.copyfile(target,root/'audio'/target.name)
  print(j['id'],flush=True)
 (temp/'measurements.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
if __name__=='__main__':main()
