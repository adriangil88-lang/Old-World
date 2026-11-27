import sys,io,contextlib,os,json
import importlib.util
spec=importlib.util.spec_from_file_location('un7z','/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad/un7z.py'); u=importlib.util.module_from_spec(spec); spec.loader.exec_module(u)
f=sys.argv[1]
buf=io.StringIO()
with contextlib.redirect_stdout(buf): u.main(f,None,True)
L=[]
for l in buf.getvalue().splitlines():
    s,n=l.split(' ',1); L.append((int(s),n))
json.dump(L,open(sys.argv[2],'w'))
import collections
c=collections.Counter(os.path.splitext(n)[1].lower() for s,n in L)
print(os.path.basename(f)[-24:],len(L),sum(s for s,n in L)//1000000,'MB',dict(c))
