# Añade al pack hd/xp_terrain.json piezas de escenografía extra del mod (rocas, templo de calaveras) a partir de los OBJ ya extraídos
import json, re, os, sys, math, base64, io, hashlib
import numpy as np
from PIL import Image
sys.argv = sys.argv[:1]
ROOT = '/home/claude/tow'
S = '/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad'
MODELS = S + '/models/Models'; IMG = ROOT + '/images_raw'
key = lambda u: re.sub(r'[^A-Za-z0-9]', '', u or '')
clean = lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]', '', s or '').strip()
src = open(ROOT + '/tools/export_terrain.py').read().split("TERR = {")[0]
exec(src)  # load_obj, part_mesh, decimate, rotm
WANT = {  # id -> (apodo, presupuesto de triángulos, textura px)
 't_rockA': ('p_aeg004_006 RedStoneRocks', 2200, 512), 't_rockB': ('p_aeg003_146 StoneRocks', 2200, 512),
 't_rockC': ('Telema_Fractured_Stone_Debris', 2200, 512), 't_rockD': ('Telema_Oiled_Stone_A', 2200, 512),
 't_rockE': ('JAIL_Pushable_Stone_A', 1800, 512), 't_rockF': ('ORC_STR_Ground_Shattered_C', 2200, 512),
 't_skulltemple': ('Temple of Skulls', 7000, 1024), 't_snowpile': ('tesv_whsnowpiles1', 2000, 512),
}
found = {}
for fn in ['3243779874', '3141810581', '3798253482']:
    d = json.load(open(ROOT + '/ws/Workshop/%s.json' % fn))
    def w(o):
        if isinstance(o, dict):
            n = clean(o.get('Nickname'))
            if 'CustomMesh' in o and n in [v[0] for v in WANT.values()] and n not in found and os.path.exists(MODELS + '/' + key(o['CustomMesh']['MeshURL']) + '.obj'): found[n] = o
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(d)
pk = json.load(open(ROOT + '/app/hd/xp_terrain.json'))
idx = {os.path.splitext(f)[0]: f for f in os.listdir(IMG)}
for uid, (nick, budget, tsz) in WANT.items():
    o = found.get(nick)
    if not o: print('FALTA', uid, nick); continue
    t = o['Transform']
    r = part_mesh({'CustomMesh': o['CustomMesh'], 'Transform': {'posX': 0, 'posY': 0, 'posZ': 0, 'rotX': 0, 'rotY': 0, 'rotZ': 0, 'scaleX': t['scaleX'], 'scaleY': t['scaleY'], 'scaleZ': t['scaleZ']}}, [1, 1, 1])
    if r is None: print('SIN MALLA', uid); continue
    pos, uv, tri, dif = r
    npos, nuv, nt = decimate(pos, uv, tri, budget)
    used = np.unique(nt); remap = -np.ones(len(npos), dtype=np.int64); remap[used] = np.arange(len(used))
    npos = npos[used]; nuv = nuv[used]; nt = remap[nt]
    mn = npos.min(0); mx = npos.max(0)
    k = key(dif); f = idx.get(k) or next((v for kk, v in idx.items() if kk.endswith(k) or k.endswith(kk)), None)
    tk = None
    try: im = Image.open(IMG + '/' + f).convert('RGB').resize((tsz, tsz), Image.LANCZOS) if f else None
    except Exception: im = None; print('textura ilegible', uid)
    if im is None: print('sin textura, se omite', uid); continue
    if im is not None:
        b = io.BytesIO(); im.save(b, 'WEBP', quality=72)
        tk = hashlib.md5(k.encode()).hexdigest()[:10]; pk['t'][tk] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    q = np.clip(((npos - mn) / np.maximum(mx - mn, 1e-9) * 65535).round(), 0, 65535).astype('<u2')
    uvq = ((np.clip(nuv, -8, 8) + 8) / 16 * 65535).round().astype('<u2')
    pk['m'][uid] = {'min': mn.round(4).tolist(), 'max': mx.round(4).tolist(), 'parts': [{'p': base64.b64encode(q.tobytes()).decode(), 'u': base64.b64encode(uvq.tobytes()).decode(), 'i': base64.b64encode(nt.astype('<u2').reshape(-1).tobytes()).decode(), 'n': int(len(npos)), 't': tk}]}
    print(uid, 'tri', len(nt), 'bbox', (mx - mn).round(2), 'tex', bool(tk))
json.dump(pk, open(ROOT + '/app/hd/xp_terrain.json', 'w'), separators=(',', ':'))
print(os.path.getsize(ROOT + '/app/hd/xp_terrain.json') // 1024, 'KB')
