# Miniaturas que en el mod son paquetes Unity (CustomAssetbundle): uid=apodo ...  -> /tmp/ab_partial.js (formato de models.js)
import sys, json, re, os
sys.path.insert(0, '/home/claude/tow/tools')
import numpy as np
import export_scenery as X
from ub_index import nick_map
pairs = [a.split('=', 1) for a in sys.argv[1:]]
NM = nick_map(('3477087013',))
out = {}
for uid, nick in pairs:
    if nick not in NM: print('sin apodo', nick); continue
    p = X.find_bundle(NM[nick][0])
    if not p or os.path.getsize(p) == 0: print('sin paquete', nick); continue
    try: parts = [q for q in X.extract(p) if len(q['tri'])]
    except Exception as e: print('ERR', nick, repr(e)[:120]); continue
    if not parts: print('vacío', nick); continue
    allp = np.concatenate([q['pos'] for q in parts]); mn = allp.min(0); mx = allp.max(0); tot = sum(len(q['tri']) for q in parts)
    res = []
    for q in parts:
        npos, nuv, nt = X.decimate(q['pos'], q['uv'], q['tri'], max(150, int(2600 * len(q['tri']) / tot)))
        used = np.unique(nt); rm = -np.ones(len(npos), dtype=np.int64); rm[used] = np.arange(len(used))
        res.append({'pos': npos[used], 'uv': nuv[used], 'tri': rm[nt], 'tex': X.b64tex(q['tex']) if q['tex'] is not None else None})
    out[uid] = {'parts': res, 'min': mn, 'max': mx}
    print(uid, nick, 'tri', sum(len(r['tri']) for r in res), 'bbox', (mx - mn).round(2), [bool(r['tex']) for r in res])
open('/tmp/ab_partial.js', 'w').write('export const MODELS = ' + json.dumps(X.pack(out), separators=(',', ':')) + ';\n')
