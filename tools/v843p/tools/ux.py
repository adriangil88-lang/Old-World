import sys,os,json,re,glob,numpy as np,pickle
sys.path.insert(0,'/tmp/w843p/k')
import src,fig,compose,get,view
DEST='/tmp/w843p/dest'
def target(uid):
    for f in glob.glob('/home/claude/tow/app/hd/xp_*.json'):
        if f.endswith('terrain.json'): continue
        d=json.load(open(f))
        if uid in d['m']: return np.array(d['m'][uid]['min']),np.array(d['m'][uid]['max']),'xp:'+os.path.basename(f)
    t=open('/home/claude/tow/app/js/models.js').read()
    m=re.match(r'export const MODELS = (\{.*?\});\n',t,re.S); d=json.loads(m.group(1))
    if uid in d: return np.array(d[uid]['min']),np.array(d[uid]['max']),'old'
    return None
def cands(j,pat):
    d=src.load(j); res=[]; src.find(d,pat,res)
    out=[];seen={}
    for i,o in enumerate(res):
        ks,ps=compose.keys_of(o)
        sig=(src.clean(o.get('Nickname')),tuple(sorted(ks)),tuple(round(o['Transform'][k],3) for k in('scaleX','scaleY','scaleZ')))
        if sig in seen: seen[sig][1]+=1; continue
        seen[sig]=[i,1,o,ks,ps]
    return list(seen.values())
def bbox(parts):
    A=np.vstack([p[0] for p in parts]); return A.min(0),A.max(0)
def explore(j,pat,uid=None,dest=DEST,apply=None):
    T=target(uid) if uid else None
    cs=cands(j,pat)
    print('# candidatos',len(cs),'objetivo',None if T is None else (T[2],T[0].round(3).tolist(),T[1].round(3).tolist()))
    for i,n,o,ks,ps in cs:
        try:
            parts,g,ps2=compose.gather(j,pat,i,dest)
        except Exception as e: print(i,n,'ERROR',e); continue
        if not parts: print(i,src.clean(o.get('Nickname')),'sin partes'); continue
        mn,mx=bbox(parts); tri=sum(len(p[2]) for p in parts)
        e=None if T is None else float(np.abs(mn-T[0]).max()+np.abs(mx-T[1]).max())
        dm=mx-mn
        shp=None
        if T is not None:
            D=T[1]-T[0]; c=D[1]/max(dm[1],1e-9); shp=float(np.abs(D-dm*c).max()/D[1]); 
        print(f"idx{i} x{n} {src.clean(o.get('Nickname'))[:34]} parts{len(parts)} tri{tri} keys{[k[-6:] for k in ks if not k.startswith('http') or True][:4]} bbox{mn.round(2).tolist()}{mx.round(2).tolist()} err={e if e is None else round(e,4)} shape={shp if shp is None else round(shp,4)}")
    return cs
if __name__=='__main__':
    explore(sys.argv[1],sys.argv[2],sys.argv[3] if len(sys.argv)>3 else None)
