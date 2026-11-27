import numpy as np
from PIL import Image
def raster(parts,size,E,az=0.6,pitch=0.5,base=None,bg=(238,236,230)):
    """parts: lista (pos,uv,tri,tex|color). E: pulgadas visibles."""
    cy,sy,cp,sp=np.cos(np.pi+az),np.sin(np.pi+az),np.cos(pitch),np.sin(pitch)
    Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]);Rx=np.array([[1,0,0],[0,cp,sp],[0,-sp,cp]])
    img=np.full((size,size,3),bg,np.uint8); zb=np.full((size,size),1e9)
    allp=list(parts)
    if base:
        bw,bd=base; y=0.0; hw,hd=bw/2,bd/2
        # losa de la peana (grosor 0.12") + marca de frente
        def box(x0,x1,y0,y1,z0,z1):
            V=np.array([[x,yy,z] for x in (x0,x1) for yy in (y0,y1) for z in (z0,z1)],float)
            F=[(0,1,3),(0,3,2),(4,6,7),(4,7,5),(0,4,5),(0,5,1),(2,3,7),(2,7,6),(0,2,6),(0,6,4),(1,5,7),(1,7,3)]
            return V,np.array(F)
        V,F=box(-hw,hw,-0.12,0,-hd,hd); allp.append((V,None,F,(120,110,95)))
        V,F=box(-hw*0.15,hw*0.15,0,0.03,hd*0.7,hd*1.0); allp.append((V,None,F,(220,40,40)))  # marca roja = frente
    for pos,uv,tri,tex in allp:
        p=((pos-np.array([0,0.35*E*0.5,0]))@Ry.T)@Rx.T
        X=(p[:,0]/E+0.5)*size; Y=(0.62-p[:,1]/E)*size; Z=p[:,2]
        if not isinstance(tex,tuple) and tex is not None: th,tw=tex.shape[:2]
        for t in tri:
            x=X[t];y=Y[t];z=Z[t]
            x0,x1=int(max(x.min(),0)),int(min(x.max(),size-1));y0,y1=int(max(y.min(),0)),int(min(y.max(),size-1))
            if x1<x0 or y1<y0: continue
            d=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2])
            if abs(d)<1e-9: continue
            gx,gy=np.meshgrid(np.arange(x0,x1+1)+0.5,np.arange(y0,y1+1)+0.5)
            a=((y[1]-y[2])*(gx-x[2])+(x[2]-x[1])*(gy-y[2]))/d; b=((y[2]-y[0])*(gx-x[2])+(x[0]-x[2])*(gy-y[2]))/d; c=1-a-b
            m=(a>=0)&(b>=0)&(c>=0)
            if not m.any(): continue
            zz=a*z[0]+b*z[1]+c*z[2]
            sub=zb[y0:y1+1,x0:x1+1]; ok=m&(zz<sub)
            if not ok.any(): continue
            if isinstance(tex,tuple) or tex is None:
                img[y0:y1+1,x0:x1+1][ok]=tex if tex is not None else (150,150,150)
            else:
                u=a*uv[t[0],0]+b*uv[t[1],0]+c*uv[t[2],0]; v=a*uv[t[0],1]+b*uv[t[1],1]+c*uv[t[2],1]
                tx=((u%1)*(tw-1)).astype(int); ty=((1-(v%1))*(th-1)).astype(int)
                img[y0:y1+1,x0:x1+1][ok]=tex[ty[ok],tx[ok]]
            sub[ok]=zz[ok]
    return Image.fromarray(img)
