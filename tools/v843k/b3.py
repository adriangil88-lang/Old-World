import sys; sys.path.insert(0,'.')
import compose, figkit, src, fig, get, view
for uid,pat in (('empire_general_peg','^General of the Empire on Pegasus$'),('empire_lord_peg','^Wizard Lord on Pegasus$')):
    res=[]
    for j in ('2426060468',):
        d=src.load(j); src.find(d,pat,res)
    print(uid,len(res))
    o=res[0]
    ps=[p for p in fig.parts_of(o,None) if not p['key'].endswith(compose.PLACEHOLDER)]
    print([(p['key'][-10:],p['kind']) for p in ps])
    get.get('/tmp/kw/w',[p['key'] for p in ps]+[p['tex'] for p in ps if p['tex']])
    g=view.parts_geom(ps,'/tmp/kw/w')
    parts=[(p[0],p[1],p[2],p[5]) for p in g]
    figkit.add_figure(uid,'empire',compose.split_big(compose.merge_by_tex(parts)),xp_cap=4500,xh_exact=60000)
