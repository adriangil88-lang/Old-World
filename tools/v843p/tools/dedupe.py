import sys,os,re,json,hashlib,glob
sys.path.insert(0,'/tmp/w843p/k'); import figkit
H=figkit.H
t,XM,XT,XU=figkit.hm_load()
byh={}
for name,M in (('xt',XT),('xu',XU)):
    for k,v in M.items():
        p='/home/claude/tow/app/'+v
        if not os.path.exists(p): continue
        h=hashlib.md5(open(p,'rb').read()).hexdigest(); byh.setdefault((name,h),[]).append((k,v))
n=0
for (name,h),L in byh.items():
    files={v for k,v in L}
    if len(files)>1:
        keep=sorted(files)[0] if False else min(files,key=lambda f:(os.path.getmtime('/home/claude/tow/app/'+f)))  # el más antiguo
        for k,v in L:
            if v!=keep:
                (XT if name=='xt' else XU)[k]=keep
        for f in files:
            if f!=keep and not any(v==f for M in (XT,XU) for v in M.values()):
                os.remove('/home/claude/tow/app/'+f); n+=1
figkit.hm_save(t,XM,XT,XU); print('eliminados',n)
