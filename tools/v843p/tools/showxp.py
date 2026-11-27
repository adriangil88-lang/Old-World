import sys,json,base64,io,glob,os,numpy as np
sys.path.insert(0,'/tmp/w843p/k')
from PIL import Image
import view,rast
def load(uid):
    for f in glob.glob('/home/claude/tow/app/hd/xp_*.json'):
        if f.endswith('terrain.json'): continue
        d=json.load(open(f))
        if uid in d['m']: return d,d['m'][uid]
    return None,None
def parts(uid):
    d,m=load(uid)
    mn=np.array(m['min']);mx=np.array(m['max']);out=[]
    for p in m['parts']:
        q=np.frombuffer(base64.b64decode(p['p']),'<u2').reshape(-1,3)/65535*(mx-mn)+mn
        u=np.frombuffer(base64.b64decode(p['u']),'<u2').reshape(-1,2)/65535*16-8
        i=np.frombuffer(base64.b64decode(p['i']),'<u2').reshape(-1,3).astype(int)
        tex=None
        if p.get('t') and p['t'] in d['t']:
            tex=np.asarray(Image.open(io.BytesIO(base64.b64decode(d['t'][p['t']].split(',',1)[1]))).convert('RGB').resize((256,256)))
        out.append((q,u,i,tex if tex is not None else (160,160,160)))
    return out
def sheet(uid,path,**k):
    return view.sheet(parts(uid),path,**k)
if __name__=='__main__':
    for u in sys.argv[2:]: print(u,sheet(u,sys.argv[1]%u))
