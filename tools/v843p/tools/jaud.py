import json,sys,re,os,pickle,glob,collections
K='/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad/k/'
M=pickle.load(open(K+'namemap.pkl','rb'))
for f in glob.glob('/mnt/user-data/attachments/*/*.unity3d'):
    st=os.path.basename(f).split('-',1)[1][:-8]; M.setdefault(st,[]).append((f,os.path.getsize(f),'.unity3d'))
M.setdefault('httpspasteeersBYp4',[]).append(('new',43569,'.obj'))
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
def avail(k,exts):
    l=[x for x in M.get(k,[]) if x[2] in exts]
    return 'A' if any(s>0 for _,s,_ in l) else ('0' if l else 'X')
def leaves(o,out):
    cm=o.get('CustomMesh'); ab=o.get('CustomAssetbundle')
    if cm and cm.get('MeshURL'): out.append(('M',key(cm['MeshURL']),key(cm.get('DiffuseURL'))))
    if ab and ab.get('AssetbundleURL'): out.append(('B',key(ab['AssetbundleURL']),key(ab.get('AssetbundleSecondaryURL'))))
    for c in o.get('ChildObjects') or []: leaves(c,out)
def run(jf,pat=None):
    d=json.load(open(jf)); d=d if isinstance(d,dict) else {'ObjectStates':d}
    res={}
    def walk(o,path):
        if isinstance(o,dict):
            nm=clean(o.get('Nickname'))
            if nm and not re.fullmatch(r'\d+x\d+',nm):
                L=[]; leaves(o,L)
                L=[l for l in L if l[1]]
                if L and not (len(L)==1 and L[0][1].endswith('31477121') and False):
                    # descartar bases: solo la malla base de peana
                    st=[]
                    for t,m,tx in L:
                        a=avail(m,('.obj',) if t=='M' else ('.unity3d',)); b=avail(tx,('.jpg','.png','.webp','.jpeg')) if t=='M' else '-'
                        st.append((t,m[-8:],a,b))
                    sg=(nm,tuple(sorted(set(st))))
                    if sg not in res: res[sg]=path
            for kk,v in o.items():
                if isinstance(v,(dict,list)): walk(v,path+'/'+nm if kk in('ObjectStates','ChildObjects','ContainedObjects') and nm else path)
        elif isinstance(o,list):
            for v in o: walk(v,path)
    walk(d,'')
    return res
if __name__=='__main__':
    res=run(sys.argv[1])
    byn=collections.defaultdict(list)
    for (nm,st),p in res.items(): byn[nm].append((st,p))
    for nm in sorted(byn):
        for st,p in byn[nm]:
            nmesh=sum(1 for s in st if s[0]=='M'); nab=sum(1 for s in st if s[0]=='B')
            bad=[s for s in st if s[2]!='A' or (s[0]=='M' and s[3]!='A')]
            print(f"{nm[:45]:45} M{nmesh} B{nab} {'OK' if not bad else 'FALTA '+str(bad[:3])} | {p[-40:]}")
