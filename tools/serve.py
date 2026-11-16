"""Local static server with byte ranges, matching GitHub Pages audio seeking."""
import http.server,argparse,os,re
from pathlib import Path
class Handler(http.server.SimpleHTTPRequestHandler):
 def send_head(self):
  path=Path(self.translate_path(self.path));self.remaining=None
  if path.is_file() and self.headers.get('Range'):
   size=path.stat().st_size;m=re.fullmatch(r'bytes=(\d*)-(\d*)',self.headers['Range'])
   if m:
    start=int(m[1]) if m[1] else max(0,size-int(m[2]));end=min(size-1,int(m[2])) if m[1] and m[2] else size-1
    if start>=size or start>end:self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return None
    f=path.open('rb');f.seek(start);self.remaining=end-start+1;self.send_response(206);self.send_header('Content-Type',self.guess_type(str(path)));self.send_header('Content-Length',str(self.remaining));self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Accept-Ranges','bytes');self.end_headers();return f
  return super().send_head()
 def copyfile(self,source,output):
  if self.remaining is None:return super().copyfile(source,output)
  while self.remaining:
   b=source.read(min(65536,self.remaining))
   if not b:break
   output.write(b);self.remaining-=len(b)
 def end_headers(self):
  self.send_header('Cache-Control','no-cache');super().end_headers()
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8765);p.add_argument('--directory',default=str(Path(__file__).resolve().parents[2]));a=p.parse_args();os.chdir(a.directory);http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
