# uso: match.py faccionJSON meshdir  -> para cada modelo del JSON: bbox compuesta y mejor coincidencia en xp_*.json
import json,sys,re,os,glob,math,pickle,collections
import numpy as np
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
def rotm(rx,ry,rz):
    rx,ry,rz=map(math.radians,(rx,ry,rz)); cx,sx,cy,sy,cz,sz=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
    Rx=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]]);Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]);Rz=np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]])
    return Ry@Rx@Rz
jf,MD=sys.argv[1],sys.argv[2]
XP={}
for f in glob.glob('/home/claude/tow/app/hd/xp_*.json'):
    if f.endswith('terrain.json'): continue
    d=json.load(open(f))
    for uid,m in d['m'].items(): XP[uid]=(np.array(m['min']),np.array(m['max']),len(m['parts']),os.path.basename(f))
_t=open('/home/claude/tow/app/js/models.js').read()
_m=re.match(r'export const MODELS = (\{.*?\});\n',_t,re.S)
for uid,m in json.loads(_m.group(1)).items(): XP['old:'+uid]=(np.array(m['min']),np.array(m['max']),len(m['parts']),'models.js')
uids=list(XP); MN=np.array([XP[u][0] for u in uids]); MX=np.array([XP[u][1] for u in uids]); NP=np.array([XP[u][2] for u in uids])
bbc={}
def verts(k):
    if k in bbc: return bbc[k]
    p=os.path.join(MD,k+'.obj'); 
    if not os.path.exists(p) or os.path.getsize(p)==0: bbc[k]=None; return None
    V=[l.split()[1:4] for l in open(p,errors='ignore') if l.startswith('v ')]
    bbc[k]=np.array(V,float) if V else None; return bbc[k]
def bbox(kids,ps):
    A=[]; miss=0
    for c in kids:
        cm=c['CustomMesh']; k=key(cm['MeshURL'])
        if k.endswith('2E31477121') or k.endswith('31477121') and len(k)<40 and False: pass
        V=verts(k)
        if V is None: miss+=1; continue
        t=c['Transform']; R=rotm(t['rotX'],t['rotY'],t['rotZ'])
        A.append(((V*np.array([t['scaleX'],t['scaleY'],t['scaleZ']]))@R.T+np.array([t['posX'],t['posY'],t['posZ']]))*np.array(ps))
    if not A: return None,miss
    A=np.vstack(A); return (A.min(0),A.max(0)),miss
d=json.load(open(jf)); d=d if isinstance(d,dict) else {'ObjectStates':d}
cands=[]
def walk(o):
    if isinstance(o,dict):
        if 'CustomMesh' in o and o['CustomMesh'].get('MeshURL'):
            kids=[c for c in (o.get('ChildObjects') or []) if c.get('CustomMesh') and c['CustomMesh'].get('MeshURL')]
            if kids: cands.append((o,kids,[o['Transform'][k] for k in('scaleX','scaleY','scaleZ')]))
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(d)
seen=set(); out=[]; CANDS=[]
for o,kids,ps in cands:
    for variant in (0,1):
        kk=[c for c in kids if not clean(c.get('Nickname'))] if variant==0 else kids
        if variant==0 and (not kk or len(kk)==len(kids)): continue
        sig=(clean(o.get('Nickname')),tuple(sorted(key(c['CustomMesh']['MeshURL'])[-8:] for c in kk)),tuple(np.round(ps,2)))
        if sig in seen: continue
        seen.add(sig)
        bb,miss=bbox(kk,ps)
        CANDS.append((sig[0],'|'.join(k[-8:] for k in sig[1]),bb,miss))
        if bb is None: out.append((sig[0],len(kk),'SINMALLA',miss,None,None,None)); continue
        e=np.abs(MN-bb[0]).max(1)+np.abs(MX-bb[1]).max(1)
        e=np.where(NP==len(kk),e,9)
        j=int(e.argmin())
        # forma: dimensiones relativas (escala uniforme)
        dj=bb[1]-bb[0]; D=MX-MN; ok=(NP==len(kk))
        c=D[:,1]/np.maximum(dj[1],1e-6); rel=np.abs(D-dj*c[:,None]).max(1)/np.maximum(D[:,1],1e-6)
        rel=np.where(ok,rel,9); js=int(rel.argmin())
        shp=(uids[js],float(rel[js]),float(c[js]))
        out.append((sig[0],len(kk),'OK' if miss==0 else 'PARCIAL',miss,uids[j],float(e[j]),'|'.join(k[-8:] for k in sig[1])+' SHAPE %s %.3f x%.2f'%(shp[0],shp[1],shp[2])))
for r in sorted(out,key=lambda r:(r[0],r[1])):
    st='TENEMOS' if r[5] is not None and r[5]<0.02 else ('~' if r[5] is not None and r[5]<0.1 else '--')
    print(f"{r[0][:40]:40} k{r[1]} {r[2]:8} miss{r[3]} {st:7} {r[4]} {r[5] if r[5] is None else round(r[5],3)} {r[6]}")

pickle.dump(CANDS,open(sys.argv[3] if len(sys.argv)>3 else '/tmp/w843p/cands.pkl','wb'))
