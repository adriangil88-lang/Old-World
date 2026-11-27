import json,glob,re,sys,os
key=lambda u: re.sub(r'[^A-Za-z0-9]','',u or '')
clean=lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]','',s or '').strip().replace('\n',' ')
files=glob.glob('/home/claude/tow/ws/Workshop/*.json')+glob.glob('/mnt/user-data/attachments/*/*.json')+glob.glob('/mnt/user-data/uploads/*.json')
rows=[]
def walk(o,path,jf):
    if isinstance(o,dict):
        nm=clean(o.get('Nickname')); 
        cm=o.get('CustomMesh'); ab=o.get('CustomAssetbundle')
        if cm and cm.get('MeshURL'): rows.append((jf,path,nm,'mesh',key(cm['MeshURL']),key(cm.get('DiffuseURL')),len(o.get('ChildObjects') or [])))
        if ab and ab.get('AssetbundleURL'): rows.append((jf,path,nm,'ab',key(ab['AssetbundleURL']),key(ab.get('AssetbundleSecondaryURL')),0))
        for kk,v in o.items(): walk(v,path+'/'+(nm or o.get('Name','')) if kk in('ObjectStates','ChildObjects','ContainedObjects') else path,jf)
    elif isinstance(o,list):
        for v in o: walk(v,path,jf)
seen=set()
for jf in files:
    try: d=json.load(open(jf))
    except Exception as e: continue
    t=(os.path.getsize(jf),os.path.basename(jf).split('-',1)[-1])
    if t in seen: continue
    seen.add(t)
    walk(d,'',os.path.basename(jf))
import pickle; pickle.dump(rows,open('rows.pkl','wb'))
print(len(files),len(seen),len(rows))
with open('rows.tsv','w') as f:
    for r in rows: f.write('\t'.join(map(str,r))+'\n')
