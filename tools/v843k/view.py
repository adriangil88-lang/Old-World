import sys,os,json,numpy as np
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import fig,rast,get
from PIL import Image
def parts_geom(parts,dirs):
    """-> lista (pos,uv,tri,tex ndarray|color) mundo"""
    out=[]
    import abx
    for p in parts:
        if p['kind']=='ab':
            f=fig.find_file(dirs,p['key'],('.unity3d',))
            if not f: print('falta ab',p['key'][-10:]); continue
            for pos,uv,tri,tex in abx.ab_parts(f):
                W=pos@p['M'][:3,:3].T+p['M'][:3,3]
                out.append((W,uv,tri,np.asarray(tex.convert('RGB').resize((512,512))) if tex is not None else (160,160,160),p,tex.convert('RGB') if tex is not None else None))
            continue
        f=fig.find_file(dirs,p['key'],('.obj',))
        if not f: print('falta obj',p['key'][-10:]); continue
        g=fig.obj_geom(f,p['M'])
        if g is None: print('vacío',p['key'][-10:]); continue
        tf=fig.find_file(dirs,p['tex'],('.jpg','.png','.webp')) if p['tex'] else None
        tex=np.asarray(Image.open(tf).convert('RGB').resize((512,512))) if tf else (160,160,160)
        out.append((g[0],g[1],g[2],tex,p,Image.open(tf).convert('RGB') if tf else None))
    return out
def sheet(parts_list,path,size=420,E=None):
    imgs=[]
    parts_list=[p[:4] for p in parts_list]
    allp=np.vstack([p[0] for p in parts_list]); mn,mx=allp.min(0),allp.max(0); ext=float(max(mx-mn)); E=E or ext*1.5
    cx=(mn+mx)/2
    pl=[(p[0]-np.array([cx[0],mn[1],cx[2]]),p[1],p[2],p[3]) for p in parts_list]
    for az in (0.0,1.57,3.14,4.7):
        imgs.append(rast.raster(pl,size,E,az=az,pitch=0.35,base=None))
    W=Image.new('RGB',(size*4,size)); [W.paste(im,(i*size,0)) for i,im in enumerate(imgs)]; W.save(path); return mn,mx
