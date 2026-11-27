import sys,os,hashlib,numpy as np
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import fig,view,src,abx,get
from PIL import Image
PLACEHOLDER='2E31477121'
def keys_of(o):
    ps=fig.parts_of(o,'children'); ks=[]
    for p in ps:
        if p['key'].endswith(PLACEHOLDER): continue
        ks.append(p['key'])
        if p['tex']: ks.append(p['tex'])
    return ks,ps
def gather(j,pat,idx=0,dest='/tmp/kw/w',skip=(),only_kind=None):
    d=src.load(j); res=[]; src.find(d,pat,res)
    o=res[idx]; ks,ps=keys_of(o)
    ps=[p for p in ps if not p['key'].endswith(PLACEHOLDER) and p['key'][-10:] not in skip]
    miss=get.get(dest,[p['key'] for p in ps]+[p['tex'] for p in ps if p['tex'] and p['kind']=='mesh'])
    if miss: print('FALTAN',miss)
    g=view.parts_geom(ps,dest)
    return [(p[0],p[1],p[2],p[5]) for p in g], g, ps
def fulltex(ps,dest):
    pass
def merge_by_tex(parts):
    """parts: [(pos,uv,tri,PIL)] -> une las que comparten textura (misma imagen) mientras <=65000 vértices"""
    out=[]; idx={}
    for pos,uv,tri,tex in parts:
        h=hashlib.md5(tex.tobytes()).hexdigest() if tex is not None else None
        if h in idx and len(out[idx[h]][0])+len(pos)<=64000 and h is not None:
            i=idx[h]; p0,u0,t0,x0=out[i]; out[i]=(np.vstack([p0,pos]),np.vstack([u0,uv]),np.vstack([t0,tri+len(p0)]),x0)
        else:
            idx[h]=len(out); out.append((pos,uv,np.asarray(tri),tex))
    return out
def split_big(parts,limit=60000):
    out=[]
    for pos,uv,tri,tex in parts:
        if len(pos)<=limit: out.append((pos,uv,np.asarray(tri),tex)); continue
        tri=np.asarray(tri); k=int(np.ceil(len(pos)/limit*1.15)); cen=pos[tri].mean(1)[:,1]  # troceo por altura
        order=np.argsort(cen); chunks=np.array_split(order,k)
        for ch in chunks:
            t=tri[ch]; used=np.unique(t); rm=-np.ones(len(pos),dtype=np.int64); rm[used]=np.arange(len(used)); out.append((pos[used],uv[used],rm[t],tex))
    return out
