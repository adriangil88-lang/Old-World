import json,glob,re,os,pickle,sys
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
rows=[]
def walk(o,path,jf):
    if isinstance(o,dict):
        nm=clean(o.get('Nickname'))
        cm=o.get('CustomMesh'); ab=o.get('CustomAssetbundle')
        if cm and cm.get('MeshURL'): rows.append((jf,path,nm,'mesh',key(cm['MeshURL']),key(cm.get('DiffuseURL')),len(o.get('ChildObjects') or []),key(cm.get('NormalURL')) ))
        if ab and ab.get('AssetbundleURL'): rows.append((jf,path,nm,'ab',key(ab['AssetbundleURL']),key(ab.get('AssetbundleSecondaryURL')),0,''))
        if o.get('CustomImage') and o['CustomImage'].get('ImageURL'): rows.append((jf,path,nm,'img',key(o['CustomImage']['ImageURL']),'',0,''))
        for kk,v in o.items(): walk(v,path+'/'+(nm or o.get('Name','')) if kk in('ObjectStates','ChildObjects','ContainedObjects') else path,jf)
    elif isinstance(o,list):
        for v in o: walk(v,path,jf)
for jf in sorted(glob.glob('/tmp/w843p/x9/*.json')):
    d=json.load(open(jf)); d=d if isinstance(d,dict) else {"ObjectStates":d}; 
    r0=len(rows); walk(d,'',os.path.basename(jf))
    print(os.path.basename(jf),(d.get('SaveName') or '')[:50],len(rows)-r0)
pickle.dump(rows,open('/tmp/w843p/rows9.pkl','wb'))
