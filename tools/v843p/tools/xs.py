import sys,re,glob,json,os
sys.argv=[sys.argv[0]]+sys.argv[1:]
import importlib.util
spec=importlib.util.spec_from_file_location('jaud','/tmp/w843p/scripts/jaud.py'); J=importlib.util.module_from_spec(spec); spec.loader.exec_module(J)
pat=re.compile(sys.argv[1],re.I)
files=sorted(glob.glob('/tmp/w843p/x9/*.json')) if len(sys.argv)<3 else sys.argv[2:]
for jf in files:
    try: res=J.run(jf)
    except Exception as e: continue
    for (nm,st),p in res.items():
        if pat.search(nm) or pat.search(p):
            nmesh=sum(1 for s in st if s[0]=='M'); bad=[s for s in st if s[2]!='A' or (s[0]=='M' and s[3]!='A')]
            print(os.path.basename(jf)[:22],'|',nm[:40],'|M%d'%nmesh,'OK' if not bad else 'FALTA%d'%len(bad),'|',p[-40:])
