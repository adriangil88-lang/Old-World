import sys,os,glob
sys.path.insert(0,'/home/claude/tow/tools'); sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np, export_scenery as X
def ab_parts(path):
    """-> lista (pos,uv,tri,PIL|None) en espacio de OBJ (x ya invertido por extract), en coordenadas propias del paquete"""
    out=[]
    for q in X.extract(path):
        if len(q['tri']): out.append((q['pos'],q['uv'],np.asarray(q['tri']),q['tex']))
    return out
if __name__=='__main__':
    for f in sys.argv[1:]:
        ps=ab_parts(f)
        print(os.path.basename(f)[-14:],len(ps),[(len(p[2]),p[3].size if p[3] else None) for p in ps])
        allp=np.vstack([p[0] for p in ps]); print(allp.min(0).round(3),allp.max(0).round(3))
