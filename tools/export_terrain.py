# Extrae las miniaturas reales del mod de TTS (Workshop JSON + OBJ + texturas), las simplifica y las empaqueta en app/js/models.js
import json, re, os, sys, math, base64, io
import numpy as np
from PIL import Image
ROOT = '/home/claude/tow'
S = '/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad'
MODELS = S + '/models/Models'
IMG = ROOT + '/images_raw'
key = lambda u: re.sub(r'[^A-Za-z0-9]', '', u or '')
clean = lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]', '', s or '').strip().replace('\n', ' ')
def rotm(rx, ry, rz):  # Unity: Z, luego X, luego Y
    rx, ry, rz = map(math.radians, (rx, ry, rz))
    cx, sx, cy, sy, cz, sz = math.cos(rx), math.sin(rx), math.cos(ry), math.sin(ry), math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]]); Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Ry @ Rx @ Rz
def load_obj(path):
    V, VT, F = [], [], []
    for l in open(path, errors='ignore'):
        if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
        elif l.startswith('vt '): VT.append([float(x) for x in l.split()[1:3]])
        elif l.startswith('f '):
            idx = []
            for t in l.split()[1:]:
                p = t.split('/'); idx.append((int(p[0]) - 1, int(p[1]) - 1 if len(p) > 1 and p[1] else 0))
            for i in range(1, len(idx) - 1): F.append((idx[0], idx[i], idx[i + 1]))
    return np.array(V, dtype=np.float64), (np.array(VT, dtype=np.float64) if VT else np.zeros((1, 2))), F
def part_mesh(c, par_scale):
    cm = c['CustomMesh']; p = MODELS + '/' + key(cm['MeshURL']) + '.obj'
    if not os.path.exists(p): return None
    V, VT, F = load_obj(p)
    if V.size == 0 or not F: print('  malla vacía', p[-30:], os.path.getsize(p)); return None
    t = c['Transform']
    R = rotm(t['rotX'], t['rotY'], t['rotZ'])
    S_ = np.array([t['scaleX'], t['scaleY'], t['scaleZ']])
    W = (V * S_) @ R.T + np.array([t['posX'], t['posY'], t['posZ']])
    W = W * np.array(par_scale)
    verts = {}; pos = []; uv = []; tri = []
    for a, b, cc in F:
        ids = []
        for vi, ti in (a, b, cc):
            k = (vi, ti)
            if k not in verts: verts[k] = len(pos); pos.append(W[vi]); uv.append(VT[ti] if ti < len(VT) else (0, 0))
            ids.append(verts[k])
        tri.append(ids)
    return np.array(pos), np.array(uv), np.array(tri), cm.get('DiffuseURL', '')
def decimate(pos, uv, tri, target):
    if len(tri) <= target: return pos, uv, tri
    lo, hi = 0.002, 0.5
    ext = pos.max(0) - pos.min(0); diag = float(np.linalg.norm(ext)); best = None
    for _ in range(16):
        cell = math.sqrt(lo * hi) * diag
        cp = np.floor(pos / cell).astype(np.int64)
        _, inv = np.unique(cp, axis=0, return_inverse=True); inv = inv.reshape(-1)
        n = inv.max() + 1
        npos = np.zeros((n, 3)); cnt = np.zeros(n)
        np.add.at(npos, inv, pos); np.add.at(cnt, inv, 1); npos /= cnt[:, None]
        d2 = ((pos - npos[inv]) ** 2).sum(1)
        order = np.lexsort((d2, inv)); first = np.ones(len(order), bool); first[1:] = inv[order][1:] != inv[order][:-1]
        rep = order[first]; nuv = np.zeros((n, 2)); nuv[inv[rep]] = uv[rep]
        nt = inv[tri]; ok = (nt[:, 0] != nt[:, 1]) & (nt[:, 1] != nt[:, 2]) & (nt[:, 0] != nt[:, 2]); nt = nt[ok]
        if len(nt) > target: lo = math.sqrt(lo * hi)
        else: hi = math.sqrt(lo * hi); best = (npos, nuv, nt)
    if best is None: best = (npos, nuv, nt)
    return best
def tex_b64(url, size):
    p = None
    for f in os.listdir(IMG) if not hasattr(tex_b64, 'idx') else []:
        pass
    if not hasattr(tex_b64, 'idx'): tex_b64.idx = {os.path.splitext(f)[0]: f for f in os.listdir(IMG)}
    k = key(url)
    f = tex_b64.idx.get(k) or next((v for kk, v in tex_b64.idx.items() if kk.endswith(k) or k.endswith(kk)), None)
    if not f: return None
    try: im = Image.open(IMG + '/' + f).convert('RGB').resize((size, size), Image.LANCZOS)
    except Exception: return None
    b = io.BytesIO(); im.save(b, 'JPEG', quality=72, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

TERR = {  # id -> (nickname, tri budget, texture size (w,h))
 'ground': ('ground', 200, (1536, 1024)),
 'hill': ('Hill + Cliffs', 9000, (1536, 1024)),
 'wood': ('Jungle Wood', 9000, (1536, 1024)),
 'swamp': ('Swamp', 3000, (512, 512)),
 'river': ('River', 3000, (512, 512)),
 'grass': ('Fresh Grass', 2500, (1024, 1024)),
 'tower': ('tower jungle', 12000, (1024, 1024)),
 'pyramid': ('Pyramid', 12000, (1024, 1024)),
 'road': ('p_aeg004_390 StoneRoadRuined', 8000, (1024, 1024)),
 'anomaly': ('Anomaly', 8000, (1024, 1024)),
 'loon': ('Bad Moon Loonshrine', 9000, (1024, 1024)),
}
only = set(sys.argv[1:])
d = json.load(open(ROOT + '/ws/Workshop/3141810581.json'))
found = {}
def walk2(o):
    if isinstance(o, dict):
        n = clean(o.get('Nickname'))
        if 'CustomMesh' in o and n not in found: found[n] = o
        for v in o.values(): walk2(v)
    elif isinstance(o, list):
        for v in o: walk2(v)
walk2(d)
def tex_wh(url, wh):
    tex_b64.idx = getattr(tex_b64, 'idx', None) or {os.path.splitext(f)[0]: f for f in os.listdir(IMG)}
    k = key(url); f = tex_b64.idx.get(k) or next((v for kk, v in tex_b64.idx.items() if kk.endswith(k) or k.endswith(kk)), None)
    if not f: return None
    try: im = Image.open(IMG + '/' + f).convert('RGB').resize(wh, Image.LANCZOS)
    except Exception: return None
    b = io.BytesIO(); im.save(b, 'JPEG', quality=74, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
out = {}
for uid, (nick, budget, wh) in TERR.items():
    if only and uid not in only: continue
    o = found.get(nick)
    if not o: print('FALTA', uid); continue
    c = o; ps = [1, 1, 1]
    t = c['Transform']
    r = part_mesh({'CustomMesh': c['CustomMesh'], 'Transform': {'posX': 0, 'posY': 0, 'posZ': 0, 'rotX': 0, 'rotY': 0, 'rotZ': 0, 'scaleX': t['scaleX'], 'scaleY': t['scaleY'], 'scaleZ': t['scaleZ']}}, ps)
    if r is None: print('SIN MALLA', uid); continue
    pos, uv, tri, dif = r
    npos, nuv, nt = decimate(pos, uv, tri, budget)
    used = np.unique(nt); remap = -np.ones(len(npos), dtype=np.int64); remap[used] = np.arange(len(used))
    npos = npos[used]; nuv = nuv[used]; nt = remap[nt]
    mn = npos.min(0); mx = npos.max(0)
    out[uid] = {'parts': [{'pos': npos, 'uv': nuv, 'tri': nt, 'tex': tex_wh(dif, wh)}], 'min': mn, 'max': mx}
    print(uid, 'tri', len(nt), 'bbox', (mx - mn).round(2), 'tex', bool(out[uid]['parts'][0]['tex']))
js = {}
for uid, m in out.items():
    mn, mx = m['min'], m['max']; parts = []
    for p in m['parts']:
        q = np.clip(((p['pos'] - mn) / np.maximum(mx - mn, 1e-9) * 65535).round(), 0, 65535).astype('<u2')
        uvq = np.clip(p['uv'], -8, 8); uvq = ((uvq + 8) / 16 * 65535).round().astype('<u2')
        idx = p['tri'].astype('<u2').reshape(-1)
        parts.append({'p': base64.b64encode(q.tobytes()).decode(), 'u': base64.b64encode(uvq.tobytes()).decode(), 'i': base64.b64encode(idx.tobytes()).decode(), 'n': int(len(p['pos'])), 't': p['tex']})
    js[uid] = {'min': mn.round(4).tolist(), 'max': mx.round(4).tolist(), 'parts': parts}
open('/tmp/terrain_models.js', 'w').write('export const MODELS = ' + json.dumps(js, separators=(',', ':')) + ';\n')
print('KB', os.path.getsize('/tmp/terrain_models.js') // 1024)
