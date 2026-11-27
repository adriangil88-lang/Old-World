import json,sys,re,glob,pickle,os
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
M=pickle.load(open('/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad/k/namemap.pkl','rb'))
def av(k,exts=('.obj','.unity3d')):
    if not k: return '-'
    l=[x for x in M.get(k,[]) if x[2] in exts]
    if not l: return 'X'
    return 'A' if any(s>0 for _,s,_ in l) else '0'
def avi(k):
    l=[x for x in M.get(k,[]) if x[2] in ('.jpg','.png','.webp')]
    return 'A' if any(s>0 for _,s,_ in l) else 'X' if not k else 'x'
TOW=('2425685369','2425690763','2425700399','2425755930','2426060468','2426103195','2426430616','2426463361','2426561655','2426756148','2427016876','2427854955','2428746683','2430383879','3141810581','3243779874','3477087013','3798253482','3506729242')
def load(j):
    f=glob.glob('/home/claude/tow/ws/Workshop/%s.json'%j)+glob.glob('/mnt/user-data/*/*/*%s.json'%j)+glob.glob('/mnt/user-data/uploads/*%s.json'%j)
    return json.load(open(f[0]))
def desc(o):
    cm=o.get('CustomMesh') or {}; ab=o.get('CustomAssetbundle') or {}
    t=o.get('Transform',{})
    s=''
    if cm.get('MeshURL'): s+=f" MESH={key(cm['MeshURL'])[-10:]}[{av(key(cm['MeshURL']))}] tex[{avi(key(cm.get('DiffuseURL')))}]"
    if ab.get('AssetbundleURL'): s+=f" AB={key(ab['AssetbundleURL'])[-10:]}[{av(key(ab['AssetbundleURL']))}]"+(f" AB2={key(ab['AssetbundleSecondaryURL'])[-10:]}[{av(key(ab['AssetbundleSecondaryURL']))}]" if ab.get('AssetbundleSecondaryURL') else '')
    return s+f" sc=({t.get('scaleX',0):.2f},{t.get('scaleY',0):.2f},{t.get('scaleZ',0):.2f})"
def show(o,ind=0):
    print('  '*ind+(clean(o.get('Nickname')) or o.get('Name',''))+desc(o))
    for c in (o.get('ChildObjects') or []): show(c,ind+1)
def find(o,pat,res):
    if isinstance(o,dict):
        if re.search(pat,clean(o.get('Nickname')),re.I) and (o.get('CustomMesh') or o.get('CustomAssetbundle') or o.get('ChildObjects')): res.append(o)
        for v in o.values(): find(v,pat,res)
    elif isinstance(o,list):
        for v in o: find(v,pat,res)
def search(pat,jsons=TOW,lim=2):
    seen={}
    for j in jsons:
        try:d=load(j)
        except Exception: continue
        res=[]; find(d,pat,res)
        for o in res:
            nm=clean(o.get('Nickname'))
            sig=json.dumps(o,sort_keys=True)
            # firma sin posición
            sg=re.sub(r'"(pos|rot)[XYZ]": [-0-9.e]+','',sig)
            if (nm,sg) in seen: continue
            seen[(nm,sg)]=j
            if sum(1 for k in seen if k[0]==nm)>lim: continue
            print('##',j); show(o)
if __name__=='__main__': search(sys.argv[1],lim=int(sys.argv[2]) if len(sys.argv)>2 else 2)
