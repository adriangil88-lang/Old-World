# audita composiciones multi-pieza: relación entre piezas con la regla antigua (gen_ultra, sin conjugar) vs la regla v843k (conjugada F·M·F)
import json,sys,re,os,glob,math,itertools
import numpy as np
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
def rotm(rx,ry,rz):
    rx,ry,rz=map(math.radians,(rx,ry,rz)); cx,sx,cy,sy,cz,sz=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
    Rx=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]]);Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]);Rz=np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]])
    return Ry@Rx@Rz
F3=np.diag([-1.0,1,1])
jf,MD=sys.argv[1],sys.argv[2]
XP={}
for f in glob.glob('/home/claude/tow/app/hd/xp_*.json'):
    if f.endswith('terrain.json'): continue
    for uid,m in json.load(open(f))['m'].items(): XP[uid]=(np.array(m['min']),np.array(m['max']),len(m['parts']))
bbc={}
def verts(k):
    if k in bbc: return bbc[k]
    p=os.path.join(MD,k+'.obj')
    if not os.path.exists(p) or os.path.getsize(p)==0: bbc[k]=None; return None
    V=[l.split()[1:4] for l in open(p,errors='ignore') if l.startswith('v ')]
    bbc[k]=np.array(V,float) if V else None; return bbc[k]
d=json.load(open(jf)); d=d if isinstance(d,dict) else {'ObjectStates':d}
cands=[]
def walk(o):
    if isinstance(o,dict):
        if 'CustomMesh' in o and o['CustomMesh'].get('MeshURL'):
            kids=[c for c in (o.get('ChildObjects') or []) if c.get('CustomMesh') and c['CustomMesh'].get('MeshURL')]
            if len(kids)>=1: cands.append((o,kids))
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(d)
SYM=[np.diag([a,1,b]) for a in (1,-1) for b in (1,-1)]
seen=set(); res=[]
for o,kids in cands:
    ps=np.array([o['Transform'][k] for k in('scaleX','scaleY','scaleZ')])
    for variant in (0,1):
        kk=[c for c in kids if not clean(c.get('Nickname'))] if variant==0 else kids
        if variant==0 and (not kk or len(kk)==len(kids)): continue
        if len(kk)<2: continue
        sig=(clean(o.get('Nickname')),tuple(sorted(key(c['CustomMesh']['MeshURL'])[-8:] for c in kk)),tuple(np.round(ps,2)))
        if sig in seen: continue
        seen.add(sig)
        old=[];new=[];ok=True; oldall=[]
        for c in kk:
            V=verts(key(c['CustomMesh']['MeshURL']))
            if V is None: ok=False; break
            t=c['Transform']; R=rotm(t['rotX'],t['rotY'],t['rotZ']); S=np.diag([t['scaleX'],t['scaleY'],t['scaleZ']]); P=np.array([t['posX'],t['posY'],t['posZ']])
            Wo=((V@(R@S).T)+P)*ps
            Wn=(V@(np.diag(ps)@F3@R@S@F3).T)+np.diag(ps)@(F3@P)
            old.append(Wo.mean(0)); new.append(Wn.mean(0)); oldall.append(Wo)
        if not ok: continue
        old=np.array(old);new=np.array(new)
        ro=old-old[0]; rn=new-new[0]
        best=min(np.abs(rn-ro@S.T).max() for S in SYM)
        A=np.vstack(oldall); mn,mx=A.min(0),A.max(0)
        # ¿existe modelo x con bbox antigua exacta y mismo nº de partes?
        have=None
        for u,(a,b,n) in XP.items():
            if n==len(kk) and np.abs(a-mn).max()+np.abs(b-mx).max()<1e-3: have=u;break
        res.append((best,sig[0],'|'.join(sig[1]),len(kk),have))
for r in sorted(res,key=lambda r:-r[0]):
    print(f"{'DISTINTA' if r[0]>0.05 else 'igual   '} {r[0]:.3f} {r[1][:38]:38} k{r[3]} {r[2]} have={r[4]}")
