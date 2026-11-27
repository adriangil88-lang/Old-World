# dedupe por contenido de imagen (misma textura fuente codificada por separado): repunta XTEX/XTEXU a la existente
import sys,os,re,json,numpy as np
sys.path.insert(0,'/tmp/w843p/k'); import figkit
from PIL import Image
newkeys=sys.argv[1:]
t,XM,XT,XU=figkit.hm_load()
A='/home/claude/tow/app/'
def sig(p):
    im=Image.open(A+p).convert('RGB'); return im.size,np.asarray(im.resize((48,48),Image.BILINEAR),float)
for name,M in (('xt',XT),('xu',XU)):
    cache={}
    for k in newkeys:
        if k not in M: continue
        v=M[k]
        if not os.path.exists(A+v): continue
        s0,a0=sig(v); best=None
        for k2,v2 in M.items():
            if k2 in newkeys or v2==v or not os.path.exists(A+v2): continue
            if v2 not in cache: cache[v2]=sig(v2)
            s2,a2=cache[v2]
            if s2!=s0: continue
            d=float(np.abs(a0-a2).mean())
            if d<1.2 and (best is None or d<best[0]): best=(d,k2,v2)
        if best:
            print(name,k,'->',best[1],round(best[0],3))
            old=v; M[k]=best[2]
            if not any(x==old for x in M.values()): os.remove(A+old)
figkit.hm_save(t,XM,XT,XU)
