import sys; sys.path.insert(0,'.')
import compose, figkit
jobs=[('br_sergeant','bret','2426103195','^Sergeant At Arms$',0),
('woc_hhandler','woc','2427016876','^Warhound Handler$',0),
('imp_ogres','ok','2426060468','^Imperial Ogre$',0),
('dm_burning','dm','2430383879','^Burning Chariot of Tzeentch$',0)]
for uid,pack,j,pat,idx in jobs:
    try:
        parts,g,ps=compose.gather(j,pat,idx)
        figkit.add_figure(uid,pack,compose.split_big(compose.merge_by_tex(parts)),xp_cap=4500 if 'burn' in uid else 2600,xh_exact=60000)
        print('OK',uid)
    except Exception as e:
        import traceback; traceback.print_exc(); print('FAIL',uid)
