import json,re,os,sys,math,glob,numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
def rotm(rx,ry,rz):
    rx,ry,rz=map(math.radians,(rx,ry,rz)); cx,sx,cy,sy,cz,sz=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
    Rx=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]]);Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]);Rz=np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]])
    return Ry@Rx@Rz
MIRROR=True  # TTS/Unity es de mano izquierda y los OBJ se importan con X invertida: se compone en el espacio de Unity y se devuelve a OBJ (conjugación por diag(-1,1,1))
F=np.diag([-1.0,1,1,1])
def mat(T):
    M=np.eye(4); M[:3,:3]=rotm(T['rotX'],T['rotY'],T['rotZ'])@np.diag([T['scaleX'],T['scaleY'],T['scaleZ']]); M[:3,3]=[T['posX'],T['posY'],T['posZ']]
    return F@M@F if MIRROR else M
def load_obj(path):
    V=[];VT=[];F=[]
    for l in open(path,errors='ignore'):
        if l.startswith('v '): V.append(l.split()[1:4])
        elif l.startswith('vt '): VT.append(l.split()[1:3])
        elif l.startswith('f '):
            idx=[]
            for t in l.split()[1:]:
                p=t.split('/'); a=int(p[0]); b=int(p[1]) if len(p)>1 and p[1] else 0
                idx.append((a-1 if a>0 else len(V)+a, (b-1 if b>0 else len(VT)+b) if b else -1))
            for i in range(1,len(idx)-1): F.append((idx[0],idx[i],idx[i+1]))
    return np.array(V,float).reshape(-1,3),(np.array(VT,float).reshape(-1,2) if VT else np.zeros((1,2))),F
def obj_geom(path,M):
    V,VT,F=load_obj(path)
    if V.size==0 or not F: return None
    W=V@M[:3,:3].T+M[:3,3]
    verts={};pos=[];uv=[];tri=[]
    for a,b,c in F:
        ids=[]
        for vi,ti in (a,b,c):
            k=(vi,ti)
            if k not in verts: verts[k]=len(pos); pos.append(W[vi]); uv.append(VT[ti] if 0<=ti<len(VT) else (0,0))
            ids.append(verts[k])
        tri.append(ids)
    return np.array(pos),np.array(uv),np.array(tri)
def find_file(d,k,exts):
    for f in os.listdir(d):
        b,e=os.path.splitext(f)
        if e in exts and (b==k or b.endswith(k[-24:])): 
            if b.endswith(k[-24:]) or b==k: return os.path.join(d,f)
    return None
def collect(o,M,out,depth=0,top=True):
    """lista de dicts: kind('mesh'|'ab'), key, tex, M (4x4 mundo), nick, depth"""
    cm=o.get('CustomMesh'); ab=o.get('CustomAssetbundle')
    if not top:
        pass
    for c in o.get('ChildObjects') or []:
        if not isinstance(c,dict): continue
        Mc=M@mat(c['Transform'])
        cm=c.get('CustomMesh'); ab=c.get('CustomAssetbundle')
        if cm and cm.get('MeshURL'): out.append(dict(kind='mesh',key=key(cm['MeshURL']),tex=key(cm.get('DiffuseURL')),M=Mc,nick=clean(c.get('Nickname')),depth=depth+1))
        if ab and ab.get('AssetbundleURL'): out.append(dict(kind='ab',key=key(ab['AssetbundleURL']),tex=key(ab.get('AssetbundleSecondaryURL')),M=Mc,nick=clean(c.get('Nickname')),depth=depth+1))
        collect(c,Mc,out,depth+1,False)
def root_matrix(o):
    T=o['Transform']; S=np.eye(4); S[0,0],S[1,1],S[2,2]=T['scaleX'],T['scaleY'],T['scaleZ']; return S
def parts_of(o,which=None):
    out=[]
    cm=o.get('CustomMesh'); ab=o.get('CustomAssetbundle'); S=root_matrix(o)
    if cm and cm.get('MeshURL') and which!='children': out.append(dict(kind='mesh',key=key(cm['MeshURL']),tex=key(cm.get('DiffuseURL')),M=S,nick=clean(o.get('Nickname')),depth=0))
    if ab and ab.get('AssetbundleURL'): out.append(dict(kind='ab',key=key(ab['AssetbundleURL']),tex=key(ab.get('AssetbundleSecondaryURL')),M=S,nick='',depth=0))
    collect(o,S,out); return out
