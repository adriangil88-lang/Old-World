import sys,json,re,io,base64,os,numpy as np
sys.path.insert(0,'/tmp/w843p/k')
import figkit,rast
from PIL import Image,ImageDraw
H='/home/claude/tow/app/'
t,XM,XT,XU=figkit.hm_load()
HD=json.loads(re.search(r'export const HDMAP = (\{.*?\});\n',t,re.S).group(1))
OLD=json.loads(re.match(r'export const MODELS = (\{.*?\});\n',open(H+'js/models.js').read(),re.S).group(1))
def dec_parts(m,texfn):
    mn=np.array(m['min']);mx=np.array(m['max']);out=[]
    for i,p in enumerate(m['parts']):
        q=np.frombuffer(base64.b64decode(p['p']),'<u2').reshape(-1,3)/65535*(mx-mn)+mn
        u=np.frombuffer(base64.b64decode(p['u']),'<u2').reshape(-1,2)/65535*16-8
        ix=np.frombuffer(base64.b64decode(p['i']),'<u2').reshape(-1,3).astype(int)
        out.append((q,u,ix,texfn(i,p)))
    return out
def old_parts(uid):
    m=OLD[uid]
    def tf(i,p):
        f=HD.get('%s:%d'%(uid,i))
        if f and os.path.exists(H+f): return np.asarray(Image.open(H+f).convert('RGB').resize((384,384)))
        return (160,160,160)
    return dec_parts(m,tf)
def new_parts(uid,pack):
    D=figkit.read_bin(H+'hd/xh_%s.dat.wasm'%pack)[uid]
    mn=np.array(D['min']);mx=np.array(D['max']); xp=json.load(open(H+'hd/xp_%s.json'%pack))['m'][uid]; out=[]
    # las partes de xh pueden diferir en número de xp; texturas por clave 't' de xp (mismo orden de unión)
    for i,(P,U,I) in enumerate(D['parts']):
        q=P.astype(float)/65535*(mx-mn)+mn; u=U.astype(float)/65535*16-8; ix=I.reshape(-1,3).astype(int)
        tk=xp['parts'][min(i,len(xp['parts'])-1)].get('t'); tex=(160,160,160)
        if tk and tk in XT and os.path.exists(H+XT[tk]): tex=np.asarray(Image.open(H+XT[tk]).convert('RGB').resize((512,512)))
        out.append((q,u,ix,tex))
    return out
def view(parts,az,size=300,pitch=0.35):
    A=np.vstack([p[0] for p in parts]); mn,mx=A.min(0),A.max(0); E=float(max(mx-mn))*1.45; c=(mn+mx)/2
    pl=[(p[0]-np.array([c[0],mn[1],c[2]]),p[1],p[2],p[3]) for p in parts]
    return rast.raster(pl,size,E,az=az,pitch=pitch)
def row(uid,pack,old=True):
    ims=[]
    for lab,fn in ((('antes (old 2600 tri)',lambda:old_parts(uid)),) if old else ())+(('ahora (xh máx.)',lambda:new_parts(uid,pack)),):
        P=fn()
        for az in (0.6,1.57): 
            im=view(P,az); d=ImageDraw.Draw(im); d.text((4,4),'%s %s az%.1f'%(uid,lab,az),fill=(30,30,30)); ims.append(im)
    return ims
def sheet(rows,path,cols=4,size=300):
    W=Image.new('RGB',(cols*size,len(rows)*size),(238,236,230))
    for r,ims in enumerate(rows):
        for c,im in enumerate(ims[:cols]): W.paste(im,(c*size,r*size))
    W.save(path,quality=82)
if __name__=='__main__':
    UP=[('woc_forsaken','woc'),('woc_lord_steed','woc'),('woc_sorc_lord','woc'),('woc_ex_sorc','woc'),('woc_dprince','woc'),('woc_lord_manticore','woc'),('woc_gorechariot','woc'),('he_skycutter','he'),('emp_general_griffon','empire')]
    rows=[row(u,p) for u,p in UP[:5]]; sheet(rows,'/home/claude/tow/shots/v843p/hoja_v843p_a_antes_despues.jpg')
    rows=[row(u,p) for u,p in UP[5:]]+[row('br_prophetess_uni','bret',old=False)]; sheet(rows,'/home/claude/tow/shots/v843p/hoja_v843p_b_antes_despues.jpg')
