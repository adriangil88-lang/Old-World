import sys,os
sys.path.insert(0,'/tmp/a'); sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import lib,rast,numpy as np
from PIL import Image
def chk(pack,uid,out,size=300):
    md=lib.getmodel('xp:'+pack,uid)
    rows=[]
    for label,parts in (('xp',md.get('xp_parts',md['parts'])),('xh',md['parts'])):
        P=np.vstack([p[0] for p in parts]); mn=P.min(0); mx=P.max(0); c=(mn+mx)/2
        pl=[(p[0]-np.array([c[0],mn[1],c[2]]),p[1],p[2],p[3]) for p in parts]; E=float(max(mx-mn))*1.4
        row=Image.new('RGB',(size*4,size))
        for i,az in enumerate((0,1.57,3.14,4.7)): row.paste(rast.raster(pl,size,E,az=az,pitch=0.35),(i*size,0))
        rows.append(row)
    W=Image.new('RGB',(size*4,size*2)); [W.paste(r,(0,i*size)) for i,r in enumerate(rows)]; W.save(out)
if __name__=='__main__': chk(sys.argv[1],sys.argv[2],sys.argv[3])
