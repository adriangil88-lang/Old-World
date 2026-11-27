import sys,json,glob,os; sys.path.insert(0,'/tmp/w843p/k'); import figkit
t,XM,XT,XU=figkit.hm_load()
used=set()
for f in glob.glob('/home/claude/tow/app/hd/xp_*.json'):
    for u,m in json.load(open(f))['m'].items():
        for p in m['parts']:
            if p.get('t'): used.add(p['t'])
n=0
for M in (XT,XU):
    for k in [k for k in M if k not in used]: del M[k]
for pre,M in (('xt',XT),('xu',XU)):
    live=set(M.values())
    for f in glob.glob('/home/claude/tow/app/hd/%s_*.avif'%pre):
        if 'hd/'+os.path.basename(f) not in live: os.remove(f); n+=1
figkit.hm_save(t,XM,XT,XU); print('ficheros huérfanos eliminados',n)
