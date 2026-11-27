# v843k: utilidades para añadir/sustituir una figura en los paquetes xp / xh / xu / xt / xu-avif del juego
import json,base64,io,os,re,zlib,struct,math,hashlib,sys
import numpy as np
from PIL import Image
H='/home/claude/tow/app/hd/'
HM='/home/claude/tow/app/js/hdmap.js'
# ---------- decimación (agrupa por celdas 5D: posición + UV, para no corromper costuras de textura) ----------
def islands(n,tri):
    """isla de UV de cada vértice: componentes conexas del grafo de triángulos (las costuras de textura duplican vértices)"""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    a=np.r_[tri[:,0],tri[:,1],tri[:,2]]; b=np.r_[tri[:,1],tri[:,2],tri[:,0]]
    g=coo_matrix((np.ones(len(a)),(a,b)),shape=(n,n)); return connected_components(g,directed=False)[1]
def _area(pos,tri):
    a=pos[tri[:,1]]-pos[tri[:,0]]; b=pos[tri[:,2]]-pos[tri[:,0]]; return float(np.linalg.norm(np.cross(a,b),axis=1).sum()/2)
def _cluster(pos,uv,tri,target,isl):
    lo,hi=0.001,0.5; diag=float(np.linalg.norm(pos.max(0)-pos.min(0))); best=None
    for _ in range(18):
        cell=math.sqrt(lo*hi)*diag
        key=np.floor(pos/cell).astype(np.int64)
        if isl is not None: key=np.c_[key,isl]
        _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); n=inv.max()+1
        npos=np.zeros((n,3)); cnt=np.zeros(n); np.add.at(npos,inv,pos); np.add.at(cnt,inv,1); npos/=cnt[:,None]
        d2=((pos-npos[inv])**2).sum(1); order=np.lexsort((d2,inv)); first=np.ones(len(order),bool); first[1:]=inv[order][1:]!=inv[order][:-1]
        rep=order[first]; nuv=np.zeros((n,2)); nuv[inv[rep]]=uv[rep]   # UV del vértice más cercano al centroide (no se promedian UV de costuras)
        nt=inv[tri]; ok=(nt[:,0]!=nt[:,1])&(nt[:,1]!=nt[:,2])&(nt[:,0]!=nt[:,2]); nt=nt[ok]
        if len(nt)>target: lo=math.sqrt(lo*hi)
        else: hi=math.sqrt(lo*hi); best=(npos,nuv,nt)
    if best is None: best=(npos,nuv,nt)
    return best
def decimate(pos,uv,tri,target):
    """agrupación por celdas de posición. Si la malla tiene islas UV grandes se agrupa dentro de cada isla (los UV no se mezclan); si es una sopa de miles de islas diminutas
    (foto-escaneo) se agrupa solo por posición. Se elige el resultado que conserva más superficie."""
    if len(tri)<=target: return pos,uv,tri
    tri=np.asarray(tri); isl=islands(len(pos),tri); a0=_area(pos,tri)
    r1=_cluster(pos,uv,tri,target,isl); c1=_area(r1[0],r1[2])/a0
    r2=_cluster(pos,uv,tri,target,None); c2=_area(r2[0],r2[2])/a0
    return r1 if c1>=0.8*c2 else r2
def compact(pos,uv,tri):
    used=np.unique(tri); rm=-np.ones(len(pos),dtype=np.int64); rm[used]=np.arange(len(used)); return pos[used],uv[used],rm[tri]
def prepare(parts,cap):
    """parts: [(pos,uv,tri,tex)] -> lista (pos,uv,tri,tex) con un total <= cap triángulos y <=65000 vértices por parte"""
    tot=sum(len(p[2]) for p in parts); out=[]
    for pos,uv,tri,tex in parts:
        tgt=max(200,int(cap*len(tri)/max(tot,1)))
        if tot<=cap and len(pos)<=65000: out.append((pos,uv,np.asarray(tri),tex)); continue
        n,u,t=decimate(pos,uv,np.asarray(tri),tgt if tot>cap else len(tri))
        n,u,t=compact(n,u,t)
        k=0
        while len(n)>65000 and k<8: tgt=int(tgt*0.85); n,u,t=compact(*decimate(pos,uv,np.asarray(tri),tgt)); k+=1
        out.append((n,u,t,tex))
    return out
def quant(parts,mn,mx):
    res=[]
    for pos,uv,tri,tex in parts:
        q=np.clip(((pos-mn)/np.maximum(mx-mn,1e-9)*65535).round(),0,65535).astype('<u2')
        uq=((np.clip(uv,-8,8)+8)/16*65535).round().astype('<u2')
        res.append((q,uq,np.asarray(tri).astype('<u2').reshape(-1)))
    return res
def pack_json(parts_q,tkeys):
    return [{'p':base64.b64encode(q.tobytes()).decode(),'u':base64.b64encode(u.tobytes()).decode(),'i':base64.b64encode(i.tobytes()).decode(),'n':int(len(q)),**({'t':tk} if tk else {})} for (q,u,i),tk in zip(parts_q,tkeys)]
# ---------- binario xh/xu ----------
def enc(arr):
    a=arr.astype(np.int32); dl=((np.diff(a,prepend=0)+32768)&65535)-32768; z=((dl<<1)^(dl>>31)).astype(np.uint16)
    return (z&255).astype(np.uint8).tobytes()+(z>>8).astype(np.uint8).tobytes()
def dec(buf,off,n):
    lo=np.frombuffer(buf,np.uint8,n,off).astype(np.int32); hi=np.frombuffer(buf,np.uint8,n,off+n).astype(np.int32)
    z=lo|(hi<<8); dl=(z>>1)^(-(z&1)); return (np.cumsum(dl)&65535).astype(np.int64),off+2*n
def read_bin(path):
    raw=zlib.decompress(open(path,'rb').read()); hl=struct.unpack('<I',raw[:4])[0]; h=json.loads(raw[4:4+hl]); off=4+hl; D={}
    for u,m in h.items():
        ps=[]
        for n,ni in m['parts']:
            P=[];U=[]
            for c in range(3): a,off=dec(raw,off,n);P.append(a)
            for c in range(2): a,off=dec(raw,off,n);U.append(a)
            I,off=dec(raw,off,ni); ps.append((np.stack(P,1).astype('<u2'),np.stack(U,1).astype('<u2'),I.astype('<u2')))
        D[u]={'min':m['min'],'max':m['max'],'parts':ps}
    return D
def write_bin(path,D):
    hdr={};blob=bytearray()
    for uid,m in D.items():
        ps=[]
        for P,U,I in m['parts']:
            n=len(P);ni=len(I)
            for c in range(3): blob+=enc(P[:,c])
            for c in range(2): blob+=enc(U[:,c])
            blob+=enc(I); ps.append([n,ni])
        hdr[uid]={'min':m['min'],'max':m['max'],'parts':ps}
    h=json.dumps(hdr,separators=(',',':')).encode(); raw=struct.pack('<I',len(h))+h+bytes(blob)
    open(path,'wb').write(zlib.compress(raw,9))
    # verificación
    D2=read_bin(path)
    for u in D:
        for (a,b,c),(a2,b2,c2) in zip(D[u]['parts'],D2[u]['parts']): assert (a==a2).all() and (b==b2).all() and (c==c2).all()
# ---------- texturas ----------
def avif_b64(im,size,q):
    b=io.BytesIO(); im.convert('RGB').resize((size,size),Image.LANCZOS).save(b,'AVIF',quality=q,speed=6); return 'data:image/avif;base64,'+base64.b64encode(b.getvalue()).decode()
def tex_key(uid,i): return 'k_%s_%d'%(uid,i)
# ---------- hdmap.js ----------
def hm_load():
    t=open(HM).read()
    def g(name):
        m=re.search(r'export const %s = (\{.*?\});\n'%name,t,re.S); return json.loads(m.group(1))
    return t,g('XMODELS'),g('XTEX'),g('XTEXU')
def hm_save(t,XM,XT,XU):
    def sub(name,obj):
        nonlocal t
        t=re.sub(r'(export const %s = )\{.*?\};\n'%name,lambda m:m.group(1)+json.dumps(obj,separators=(',',':'))+';\n',t,count=1,flags=re.S)
    sub('XMODELS',XM);sub('XTEX',XT);sub('XTEXU',XU); open(HM,'w').write(t)
def add_figure(uid,pack,parts,*,xp_cap=2600,xh_cap=40000,xu_cap=120000,xh_exact=52000,tex_q=(50,56,62),verbose=True):
    """parts: [(pos,uv,tri,PIL|None)] en el espacio de la figura (como lo guarda xp: sin recentrar). Escribe xp, xh, xu, xt, xu-avif y hdmap.js"""
    allp=np.vstack([p[0] for p in parts]); mn=allp.min(0); mx=allp.max(0)
    mn=np.round(mn-1e-4,4); mx=np.round(mx+1e-4,4)
    tkeys=[tex_key(uid,i) if p[3] is not None else None for i,p in enumerate(parts)]
    # xp
    xpp=prepare(parts,xp_cap); xhp=prepare(parts,max(xh_cap,sum(len(p[2]) for p in parts)) if sum(len(p[2]) for p in parts)<=xh_exact else xh_cap); xup=prepare(parts,xu_cap)
    xpj=json.load(open(H+'xp_%s.json'%pack))
    for i,tk in enumerate(tkeys):
        if tk: xpj['t'][tk]=avif_b64(parts[i][3],256,tex_q[0])
    xpj['m'][uid]={'min':[float(x) for x in mn],'max':[float(x) for x in mx],'parts':pack_json(quant(xpp,mn,mx),tkeys)}
    json.dump(xpj,open(H+'xp_%s.json'%pack,'w'),separators=(',',':'))
    for kind,pp in (('xh',xhp),('xu',xup)):
        pth=H+'%s_%s.dat.wasm'%(kind,pack)
        D=read_bin(pth) if os.path.exists(pth) else {}
        D[uid]={'min':[float(x) for x in mn],'max':[float(x) for x in mx],'parts':quant(pp,mn,mx)}
        write_bin(pth,D)
    # texturas xt (1536) y xu (nativa hasta 4096)
    t,XM,XT,XU=hm_load()
    for i,tk in enumerate(tkeys):
        if not tk: continue
        im=parts[i][3].convert('RGB'); n=im.size[0]
        im.resize((min(1536,max(n,256)),)*2,Image.LANCZOS).save(H+'xt_%s.avif'%tk,'AVIF',quality=tex_q[1],speed=6); XT[tk]='hd/xt_%s.avif'%tk
        if n>1536: im.resize((min(4096,n),)*2,Image.LANCZOS).save(H+'xu_%s.avif'%tk,'AVIF',quality=tex_q[2],speed=6); XU[tk]='hd/xu_%s.avif'%tk
    XM[uid]=pack; hm_save(t,XM,XT,XU)
    if verbose: print('OK',uid,pack,'tri xp/xh/xu',sum(len(p[2]) for p in xpp),sum(len(p[2]) for p in xhp),sum(len(p[2]) for p in xup),'bbox',(mx-mn).round(2))
