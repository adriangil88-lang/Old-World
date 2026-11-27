import json,sys,re,glob
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
def load(j):
    f=glob.glob('/home/claude/tow/ws/Workshop/%s.json'%j)+glob.glob('/mnt/user-data/*/*/*%s.json'%j)+glob.glob('/mnt/user-data/uploads/*%s.json'%j)
    return json.load(open(f[0]))
def show(o,ind=0,maxd=6):
    nm=clean(o.get('Nickname')) or o.get('Name','')
    cm=o.get('CustomMesh') or {}; ab=o.get('CustomAssetbundle') or {}
    t=o.get('Transform',{})
    s='  '*ind+f"{nm} [{o.get('Name')}]"
    if cm.get('MeshURL'): s+=f" MESH={key(cm['MeshURL'])[-10:]} DIFF={key(cm.get('DiffuseURL'))[-10:]}"
    if ab.get('AssetbundleURL'): s+=f" AB={key(ab['AssetbundleURL'])[-10:]} AB2={key(ab.get('AssetbundleSecondaryURL'))[-10:]}"
    s+=f" sc=({t.get('scaleX',0):.2f},{t.get('scaleY',0):.2f},{t.get('scaleZ',0):.2f}) pos=({t.get('posX',0):.2f},{t.get('posY',0):.2f},{t.get('posZ',0):.2f})"
    print(s)
    if ind<maxd:
        for c in (o.get('ChildObjects') or [])+(o.get('ContainedObjects') or []): show(c,ind+1,maxd)
def find(o,pat,res):
    if isinstance(o,dict):
        if re.search(pat,clean(o.get('Nickname')),re.I) and (o.get('CustomMesh') or o.get('CustomAssetbundle') or o.get('ChildObjects')): res.append(o)
        for v in o.values(): find(v,pat,res)
    elif isinstance(o,list):
        for v in o: find(v,pat,res)
if __name__=='__main__':
    d=load(sys.argv[1]); res=[]; find(d,sys.argv[2],res)
    lim=int(sys.argv[3]) if len(sys.argv)>3 else 3
    seen=set()
    for o in res:
        sig=json.dumps(o,sort_keys=True)[:3000]
        if sig in seen: continue
        seen.add(sig)
        if len(seen)>lim: break
        show(o)
