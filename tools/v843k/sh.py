import sys; sys.path.insert(0,'/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad/k')
import compose,view,numpy as np
def sh(j,pat,out,idx=0,dest='/tmp/kw/w',skip=()):
    parts,g,ps=compose.gather(j,pat,idx,dest,skip)
    print([(len(p[2]),p[3].size if p[3] else None,p[0].min(0).round(2).tolist(),p[0].max(0).round(2).tolist()) for p in parts])
    view.sheet([x[:4] for x in g],out); return parts
if __name__=='__main__': sh(sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]) if len(sys.argv)>4 else 0)
