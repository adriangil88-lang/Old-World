# composición estilo gen_ultra (sin conjugación; mismo espacio que las figuras "old"/x ya empaquetadas) + ajuste afín a la bbox del modelo objetivo
import sys,os,json,re,numpy as np
sys.path.insert(0,'/tmp/w843p/k')
import src,fig,compose,figkit,ux
from PIL import Image
def find_objs(j,pat,kidsig):
    d=src.load(j); res=[]; src.find(d,pat,res); out=[]
    for o in res:
        kids=[c for c in (o.get('ChildObjects') or []) if c.get('CustomMesh') and c['CustomMesh'].get('MeshURL')]
        for variant in (0,1):
            kk=[c for c in kids if not src.clean(c.get('Nickname'))] if variant==0 else kids
            if variant==0 and (not kk or len(kk)==len(kids)): continue
            sig='|'.join(sorted(src.key(c['CustomMesh']['MeshURL'])[-8:] for c in kk))
            if sig==kidsig: out.append((o,kk))
    return out
def parts_old(o,kk,dest):
    ps=[o['Transform'][k] for k in ('scaleX','scaleY','scaleZ')]
    parts=[]
    for c in kk:
        t=c['Transform']; R=fig.rotm(t['rotX'],t['rotY'],t['rotZ']); S=np.diag([t['scaleX'],t['scaleY'],t['scaleZ']])
        M=np.eye(4); M[:3,:3]=np.diag(ps)@R@S; M[:3,3]=np.diag(ps)@np.array([t['posX'],t['posY'],t['posZ']])
        cm=c['CustomMesh']; k=src.key(cm['MeshURL']); f=fig.find_file(dest,k,('.obj',))
        if not f: raise Exception('falta obj '+k[-10:])
        g=fig.obj_geom(f,M)
        if g is None: continue
        tk=src.key(cm.get('DiffuseURL')); tf=fig.find_file(dest,tk,('.jpg','.png','.webp','.jpeg')) if tk else None
        parts.append([g[0],g[1],g[2],Image.open(tf).convert('RGB') if tf else None])
    return parts
def fit(parts,uid):
    T=ux.target(uid)
    A=np.vstack([p[0] for p in parts]); mn,mx=A.min(0),A.max(0)
    if T is None: return parts,None
    D=T[1]-T[0]; d=mx-mn; c=D[1]/d[1]; e=float(np.abs(D-d*c).max()/D[1])
    t=T[0]-c*mn
    for p in parts: p[0]=p[0]*c+t
    return parts,(c,e)
def apply(j,pat,kidsig,uid,pack,dest,idx=0,exact=True,**kw):
    objs=find_objs(j,pat,kidsig)
    if not objs: print('SIN OBJETO',pat,kidsig); return False
    o,kk=objs[idx]
    parts=parts_old(o,kk,dest)
    parts,r=fit(parts,uid)
    print(uid,'ajuste',r,'partes',len(parts),'tri',sum(len(p[2]) for p in parts))
    if r is not None and r[1]>0.006: print('  RECHAZADO error de forma',r[1]); return False
    pp=compose.split_big(compose.merge_by_tex([tuple(p) for p in parts]))
    figkit.add_figure(uid,pack,pp,**kw)
    return True
