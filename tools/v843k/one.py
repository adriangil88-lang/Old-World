import sys; sys.path.insert(0,'/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad/k')
import fig,view,src,numpy as np
def run(j,pat,dirs,out,which='children',idx=0):
    d=src.load(j); res=[]; src.find(d,pat,res)
    o=res[idx]; parts=fig.parts_of(o,which); print([(p['kind'],p['key'][-10:],p['nick']) for p in parts])
    g=view.parts_geom(parts,dirs)
    for p in g: print(len(p[2]),p[0].min(0).round(2),p[0].max(0).round(2))
    view.sheet(g,out); return g
if __name__=='__main__':
    run(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],*(sys.argv[5:6] or ['children']))
