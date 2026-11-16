"""Local-only QA: web at :8766, mock endpoint at :8767. Never contacts Google.
GET :8767/scenario?value=success|reject|cors|fail-once|disabled switches config.
GET :8767/requests returns received fake payloads; POST /reset clears QA records.
All profile data used with this tool must be fictitious.
"""
import http.server,json,threading,urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
state={'scenario':'success','requests':[],'failed':False}
class Mock(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def reply(self,data,status=200,cors=True):
  body=json.dumps(data).encode();self.send_response(status)
  if cors:self.send_header('Access-Control-Allow-Origin','*')
  self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
 def do_GET(self):
  u=urllib.parse.urlparse(self.path)
  if u.path=='/scenario':
   value=urllib.parse.parse_qs(u.query).get('value',['success'])[0]
   if value not in ['success','reject','cors','fail-once','disabled']:return self.reply({},400)
   state['scenario']=value;state['failed']=False;return self.reply({'scenario':value})
  self.reply(state)
 def do_OPTIONS(self):self.reply({'error':'preflight is not supported'},405)
 def do_POST(self):
  data=self.rfile.read(int(self.headers.get('Content-Length',0)))
  if self.path=='/reset':state['requests']=[];state['failed']=False;return self.reply({'ok':True})
  try:payload=json.loads(data)
  except:return self.reply({'ok':False},400)
  state['requests'].append({'payload':payload,'contentType':self.headers.get('Content-Type'),'mode':self.headers.get('Sec-Fetch-Mode')})
  scenario=self.path.strip('/') if self.path!='/submit' else state['scenario']
  if scenario=='reject':return self.reply({'ok':False,'error':'sai ma lop'})
  if scenario=='fail-once' and not state['failed']:state['failed']=True;return self.reply({'ok':False},503)
  self.reply({'ok':True},cors=scenario!='cors')
class Web(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
 def do_GET(self):
  if self.path.split('?')[0]=='/qa-no-storage.html':
   data=(ROOT/'lam-bai.html').read_text(encoding='utf-8').replace('<head>','<head><script>Storage.prototype.getItem=function(){throw Error("QA blocked")};Storage.prototype.setItem=function(){throw Error("QA blocked")};</script>').encode()
   self.send_response(200);self.send_header('Content-Type','text/html;charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  if self.path.split('?')[0]=='/assets/config.js':
   endpoint='' if state['scenario']=='disabled' else 'http://127.0.0.1:8767/submit'
   data=f'export const SUBMIT_ENDPOINT = {json.dumps(endpoint)};\nexport const MA_LOP = "qa-class";'.encode()
   self.send_response(200);self.send_header('Content-Type','text/javascript');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
  else:super().do_GET()
if __name__=='__main__':
 threading.Thread(target=http.server.ThreadingHTTPServer(('127.0.0.1',8767),Mock).serve_forever,daemon=True).start()
 print('QA web http://127.0.0.1:8766 — mock http://127.0.0.1:8767',flush=True)
 http.server.ThreadingHTTPServer(('127.0.0.1',8766),Web).serve_forever()
