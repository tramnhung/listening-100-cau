"""Validate authored data and every decoded MP3. No external Python packages required."""
import argparse,json,re,subprocess,array,sys,collections,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def validate_audio(ffmpeg):
 report=[]
 for p in sorted((ROOT/'audio').glob('*.mp3')):
  def run(extra):return subprocess.run([ffmpeg,'-hide_banner','-nostats','-i',str(p)]+extra,capture_output=True)
  clean=subprocess.run([ffmpeg,'-v','error','-i',str(p),'-f','null','-'],capture_output=True)
  log=run(['-af','volumedetect,silencedetect=noise=-45dB:d=2','-f','null','-']).stderr.decode(errors='replace')
  raw=run(['-f','s16le','-ac','1','-']);samples=array.array('h');samples.frombytes(raw.stdout)
  if sys.byteorder!='little':samples.byteswap()
  count=sum(x>=32767 or x<=-32768 for x in samples)
  duration=len(samples)/22050
  mean=float(re.search(r'mean_volume: ([-\d.]+)',log)[1])
  format_ok=bool(re.search(r'Audio: mp3(?: \([^)]*\))?, 22050 Hz, mono, .*64 kb/s',log))
  blob=p.read_bytes()[:4096];xing=b'Xing' in blob or b'Info' in blob
  errors=[]
  if clean.returncode or clean.stderr:errors.append('decode')
  if not 45<=duration<=180:errors.append('duration')
  if count*100000>=len(samples):errors.append('clipping')
  if not -18<=mean<=-14:errors.append('mean_volume')
  if 'silence_start:' in log:errors.append('silence >=2s')
  if not format_ok:errors.append('format')
  if not xing:errors.append('Xing/Info')
  row={'file':p.name,'durationSec':round(duration,3),'meanVolumeDb':mean,'clippedSamples':count,'samples':len(samples),'bytes':p.stat().st_size,'formatOk':format_ok,'xing':xing,'errors':errors}
  report.append(row);print(p.name,round(duration,2),mean,count,errors,flush=True)
 return report
def validate_questions(d,audio):
 errors=[];sets=d['sets'];qs=[q for s in sets for q in s['questions']];counts=collections.Counter(q['type'] for q in qs)
 def need(ok,msg):
  if not ok:errors.append(msg)
 need(len(qs)==100 and d['totalQuestions']==100,'100 questions')
 need(counts=={'mcq':50,'true_false':20,'gap_fill':30},'type counts')
 need([q['number'] for q in qs]==list(range(1,101)),'numbering')
 need(len({q['id'] for q in qs})==100,'unique IDs')
 need(len({s['id'] for s in sets})==len(sets),'unique set IDs')
 tf=[q for q in qs if q['type']=='true_false'];need(collections.Counter(q['answer'] for q in tf)=={'TRUE':10,'FALSE':10},'TF balance');need(all(a['answer']!=b['answer'] for a,b in zip(tf,tf[1:])),'TF alternating')
 need(sum(q.get('quoteSource')=='asr' for q in qs)<=3,'ASR maximum')
 known={x['file']:x for x in audio}
 need(set(known)=={Path(s['audio']).name for s in sets},'audio files exactly match sets')
 for s in sets:
  need(5<=len(s['questions'])<=10,s['id']+' set size')
  need(all(k in s['source'] for k in ['book','test','items']),s['id']+' source')
  row=known.get(Path(s['audio']).name)
  need(row is not None,s['id']+' missing audio')
  if row:need(abs(row['durationSec']-s['audioDurationSec'])<.1,s['id']+' duration mismatch')
  for q in s['questions']:
   id=q['id'];need(q.get('status')!='needs_review',id+' needs_review')
   need(q.get('explanation') and q.get('transcriptQuote') and len(q['transcriptQuote'].split())<=25,id+' explanation/quote')
   need(q.get('quoteSource') in ['pdf','asr'],id+' quoteSource')
   if q.get('quoteSource')=='asr':need(bool(q.get('quoteNote')),id+' quoteNote')
   need(isinstance(q.get('audioStartSec'),(int,float)) and math.isfinite(q.get('audioStartSec',float('nan'))) and 0<=q.get('audioStartSec',-1)<s['audioDurationSec'],id+' timestamp')
   if q['type']=='mcq':need(2<=len(q['options'])<=5 and q['answer'] in [o['key'] for o in q['options']],id+' MCQ')
   if q['type']=='gap_fill':
    need(bool(q['answers']) and q['maxWords']==len(q['answers'][0].split()),id+' gap length')
    need(q['answers'][0].casefold() in q['transcriptQuote'].casefold(),id+' answer in quote')
    need(q['source']['book']=='Cambridge IELTS 13',id+' source Cambridge')
   else:need(q['source']['book']=='Bộ bổ sung Nghe VSTEP',id+' source VSTEP')
   if q['type']=='true_false':
    need(8<=len(q['prompt'].split())<=20,id+' TF length')
    need(not re.search(r'\b(always|never|all|only|everyone)\b',q['prompt'],re.I),id+' TF banned words')
 return errors
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--ffmpeg',default='ffmpeg');ap.add_argument('--audio-only',action='store_true');args=ap.parse_args()
 audio=validate_audio(args.ffmpeg);errors=[f"{x['file']}: {e}" for x in audio for e in x['errors']]
 if sum(x['bytes'] for x in audio)>=80_000_000:errors.append('80 MB budget')
 if not args.audio_only:errors+=validate_questions(json.loads((ROOT/'data/questions.json').read_text(encoding='utf-8')),audio)
 result={'audio':audio,'totalAudioBytes':sum(x['bytes'] for x in audio),'errors':errors,'pass':not errors}
 (ROOT/'tools/validation-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'pass':not errors,'errors':errors},ensure_ascii=True));return 1 if errors else 0
if __name__=='__main__':sys.exit(main())
