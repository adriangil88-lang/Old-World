# get.py destdir clave1 clave2 ... (clave = sufijo de >=8 caracteres del nombre de fichero, o clave completa) -> extrae a destdir
import sys,os,pickle,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import ex7
M=pickle.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'namemap.pkl'),'rb'))
def resolve(k):
    out=[]
    for n,v in M.items():
        if n.endswith(k) or n==k:
            c=[(a,s) for a,s,e in v if s>0]
            if c: out.append((n,c))
    return out
def get(dest,keys):
    os.makedirs(dest,exist_ok=True); byarc=collections.defaultdict(set); miss=[]
    for k in keys:
        if any(f.startswith(k) or os.path.splitext(f)[0].endswith(k) for f in os.listdir(dest)): continue
        r=resolve(k)
        if not r: miss.append(k); continue
        n,c=r[0]
        # prefiere el archivo .7z mas pequeño que lo contenga
        a=min(c,key=lambda x:os.path.getsize(x[0]))[0]; byarc[a].add(n)
    for a,ns in byarc.items(): ex7.extract(a,dest,ns)
    return miss
if __name__=='__main__':
    print('faltan',get(sys.argv[1],sys.argv[2:]))
