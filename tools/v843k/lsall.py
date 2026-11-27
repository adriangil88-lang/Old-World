import sys,glob,io,contextlib,os,json,hashlib
sys.path.insert(0,'..')
import importlib.util
spec=importlib.util.spec_from_file_location('un7z','../un7z.py'); u=importlib.util.module_from_spec(spec); spec.loader.exec_module(u)
fs=sorted(glob.glob('/mnt/user-data/uploads/*.7z')+glob.glob('/mnt/user-data/attachments/*/*.7z'))
out={}
for f in fs:
    buf=io.StringIO()
    try:
        with contextlib.redirect_stdout(buf): u.main(f,None,True)
    except Exception as e: out[f]={'err':str(e)}; continue
    L=[]
    for l in buf.getvalue().splitlines():
        s,n=l.split(' ',1); L.append((int(s),n))
    out[f]={'files':L}
json.dump(out,open('arc.json','w'))
print(len(out),sum(len(v.get('files',[])) for v in out.values()),[os.path.basename(k) for k,v in out.items() if 'err' in v])
