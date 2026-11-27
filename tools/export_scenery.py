# Extrae escenografía de los paquetes Unity (.unity3d) del mod de TTS -> app/js/scenery.js
import sys, os, re, io, math, glob, json, base64, struct, shutil, subprocess
sys.path.insert(0, '/home/claude/tow/tools')
import numpy as np
from PIL import Image
from ufs import open_bundle
import usf
from ub_index import nick_map, key
S = glob.glob('/tmp/claude-0/-home-claude/*/scratchpad')[0]
LST = {}
for t in glob.glob('/tmp/lst/*.txt'):
    idx = open('/tmp/lst/index.txt').read()
for line in open('/tmp/lst/index.txt'):
    nm, h = line.rsplit(' ', 1); LST[h.strip()] = nm.strip()
ARCH = {}
for f in glob.glob('/mnt/user-data/uploads/*.7z') + glob.glob('/mnt/user-data/attachments/*/*.7z'):
    import hashlib
    h = hashlib.md5((os.path.basename(f) + '\n').encode()).hexdigest()[:8]
    for l in open('/tmp/lst/%s.txt' % h) if os.path.exists('/tmp/lst/%s.txt' % h) else []:
        p = l.split()
        if len(p) == 2 and p[1].endswith('.unity3d'): ARCH[p[1][:-8]] = f
def find_bundle(u):
    g = glob.glob('/tmp/ub/%s.unity3d' % u)
    if g: return g[0]
    if u not in ARCH: return None
    tmp = '/tmp/ub_tmp'; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    subprocess.run(['python3', '-I', S + '/un7z.py', ARCH[u], tmp], check=True, capture_output=True)
    src = tmp + '/' + u + '.unity3d'
    if not os.path.exists(src): return None
    shutil.move(src, '/tmp/ub/' + u + '.unity3d'); shutil.rmtree(tmp, ignore_errors=True)
    return '/tmp/ub/' + u + '.unity3d'
FSZ = {0: 4, 1: 2, 2: 1, 3: 1, 4: 2, 5: 2, 6: 1, 7: 1, 8: 2, 9: 2, 10: 4, 11: 4}
def read_channel(buf, ch, stride, off, count, nstream_off):
    f, dim = ch['format'], ch['dimension'] & 0xF
    if dim == 0: return None
    sz = FSZ.get(f, 4); out = np.zeros((count, dim))
    dt = {0: '<f4', 1: '<f2', 2: 'u1', 3: 'i1', 4: '<u2', 5: '<i2'}.get(f)
    if dt is None: return None
    raw = np.frombuffer(buf, dtype=np.uint8)
    for k in range(dim):
        o = nstream_off + off + k * sz
        idx = o + np.arange(count) * stride
        col = np.frombuffer(b''.join(bytes(raw[i:i + sz]) for i in idx[:0]), dtype=dt) if False else None
        a = np.lib.stride_tricks.as_strided(raw[o:], shape=(count, sz), strides=(stride, 1)).copy().view(dt).reshape(count)
        if f == 2: a = a / 255.0
        elif f == 3: a = np.maximum(a / 127.0, -1)
        elif f == 4: a = a / 65535.0
        elif f == 5: a = np.maximum(a / 32767.0, -1)
        out[:, k] = a
    return out
def mesh_arrays(m, resS):
    vd = m['m_VertexData']; n = vd['m_VertexCount']; chs = vd['m_Channels']
    buf = vd['m_DataSize']
    sd = m.get('m_StreamData') or {}
    if (not buf or len(buf) == 0) and sd.get('size'): buf = resS[sd['offset']:sd['offset'] + sd['size']]
    if not n or not buf: return None
    streams = {}
    for c in chs:
        if (c['dimension'] & 0xF): streams[c['stream']] = streams.get(c['stream'], 0) + (c['dimension'] & 0xF) * FSZ.get(c['format'], 4)
    soff = {}; o = 0
    for s in sorted(streams):
        soff[s] = o; o += n * streams[s]; o = (o + 15) & ~15
    pos = read_channel(buf, chs[0], streams[chs[0]['stream']], chs[0]['offset'], n, soff[chs[0]['stream']])
    uv = None
    if len(chs) > 4 and (chs[4]['dimension'] & 0xF):
        uv = read_channel(buf, chs[4], streams[chs[4]['stream']], chs[4]['offset'], n, soff[chs[4]['stream']])
        if uv is not None: uv = uv[:, :2]
    ib = m['m_IndexBuffer']
    idx = np.frombuffer(bytes(ib), dtype='<u2' if m['m_IndexFormat'] == 0 else '<u4').astype(np.int64)
    subs = []
    for sm in m['m_SubMeshes']:
        isz = 2 if m['m_IndexFormat'] == 0 else 4
        a = sm['firstByte'] // isz; ids = idx[a:a + sm['indexCount']]
        if sm['topology'] == 0: tri = ids.reshape(-1, 3)
        elif sm['topology'] == 1:  # tiras
            tri = []
            for i in range(len(ids) - 2):
                t = (ids[i], ids[i + 1], ids[i + 2]) if i % 2 == 0 else (ids[i + 1], ids[i], ids[i + 2])
                if t[0] != t[1] and t[1] != t[2] and t[0] != t[2]: tri.append(t)
            tri = np.array(tri).reshape(-1, 3)
        else: continue
        subs.append(tri + sm['baseVertex'])
    return pos, uv, subs
def dds_img(w, h, fmt, data):
    fourcc = {10: b'DXT1', 12: b'DXT5', 11: b'DXT3'}[fmt]
    hd = struct.pack('<4sIIIIIII', b'DDS ', 124, 0x81007, h, w, 0, 0, 1) + b'\0' * 44 + struct.pack('<II4sIIIII', 32, 4, fourcc, 0, 0, 0, 0, 0) + struct.pack('<IIIII', 0x1000, 0, 0, 0, 0)
    return Image.open(io.BytesIO(hd + data)).convert('RGB')
def tex_image(t, resS):
    w, h, f = t['m_Width'], t['m_Height'], t['m_TextureFormat']
    data = t['image data']; sd = t.get('m_StreamData') or {}
    if (not data or len(data) == 0) and sd.get('size'): data = resS[sd['offset']:sd['offset'] + sd['size']]
    mips = t.get('m_MipCount', 1)
    if f in (10, 11, 12):
        full = ((w + 3) // 4) * ((h + 3) // 4) * (8 if f == 10 else 16)
        return dds_img(w, h, f, bytes(data[:full])).transpose(Image.FLIP_TOP_BOTTOM)
    if f == 4: return Image.frombytes('RGBA', (w, h), bytes(data[:w * h * 4])).convert('RGB').transpose(Image.FLIP_TOP_BOTTOM)
    if f == 3: return Image.frombytes('RGB', (w, h), bytes(data[:w * h * 3])).transpose(Image.FLIP_TOP_BOTTOM)
    return None
def quat_m(q):
    x, y, z, w = q; return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
def load_bundle(path):
    B = open_bundle(path)
    cab = [k for k in B if not k.endswith('.resS')][0]; resS = next((v for k, v in B.items() if k.endswith('.resS')), b'')
    sf = B[cab]; d = usf.parse(sf); O = {}
    for pid, off, sz, t in d['objs']:
        if t['nodes'] and t['cid'] in (1, 4, 21, 23, 28, 33, 43):
            try: O[pid] = (t['cid'], usf.read_tree(t['nodes'], sf, off, 0)[0])
            except Exception as e: pass
    return O, resS
def world(O, tid):
    M = np.eye(4); cur = tid; guard = 0
    while cur and cur in O and guard < 20:
        t = O[cur][1]; L = np.eye(4)
        s = t['m_LocalScale']; r = t['m_LocalRotation']; p = t['m_LocalPosition']
        L[:3, :3] = quat_m((r['x'], r['y'], r['z'], r['w'])) @ np.diag([s['x'], s['y'], s['z']]); L[:3, 3] = [p['x'], p['y'], p['z']]
        M = L @ M; cur = t['m_Father']['m_PathID']; guard += 1
    return M
def extract(path):
    O, resS = load_bundle(path)
    go2tr = {v['m_GameObject']['m_PathID']: pid for pid, (c, v) in O.items() if c == 4}
    parts = []
    for pid, (c, mf) in O.items():
        if c != 33: continue
        go = mf['m_GameObject']['m_PathID']; mesh = O.get(mf['m_Mesh']['m_PathID'])
        if not mesh: continue
        rend = next((v for q, (cc, v) in O.items() if cc == 23 and v['m_GameObject']['m_PathID'] == go), None)
        ma = mesh_arrays(mesh[1], resS)
        if ma is None: continue
        pos, uv, subs = ma
        W = world(O, go2tr.get(go))
        wp = (np.c_[pos, np.ones(len(pos))] @ W.T)[:, :3]
        wp[:, 0] *= -1  # Unity (mano izquierda) -> mano derecha, como los OBJ de TTS
        mats = [m['m_PathID'] for m in (rend['m_Materials'] if rend else [])]
        for si, tri in enumerate(subs):
            tex = None
            if si < len(mats) and mats[si] in O:
                mat = O[mats[si]][1]
                try:
                    for e in mat['m_SavedProperties']['m_TexEnvs']:
                        if e['first'] == '_MainTex' or e['first'] == '_BaseMap' or e['first'] == '_BaseColorMap':
                            tp = e['second']['m_Texture']['m_PathID']
                            if tp in O and O[tp][0] == 28: tex = O[tp][1]
                    if tex is None:
                        for e in mat['m_SavedProperties']['m_TexEnvs']:
                            tp = e['second']['m_Texture']['m_PathID']
                            if tp in O and O[tp][0] == 28: tex = O[tp][1]; break
                except Exception: pass
            parts.append({'pos': wp, 'uv': uv if uv is not None else np.zeros((len(pos), 2)), 'tri': tri, 'tex': tex_image(tex, resS) if tex else None})
    return parts
def decimate(pos, uv, tri, target):
    if len(tri) <= target: return pos, uv, tri
    lo, hi = 0.002, 0.5; diag = float(np.linalg.norm(pos.max(0) - pos.min(0))); best = None
    for _ in range(16):
        cell = math.sqrt(lo * hi) * diag
        cp = np.floor(pos / cell).astype(np.int64)
        _, inv = np.unique(cp, axis=0, return_inverse=True); inv = inv.reshape(-1); n = inv.max() + 1
        npos = np.zeros((n, 3)); cnt = np.zeros(n); np.add.at(npos, inv, pos); np.add.at(cnt, inv, 1); npos /= cnt[:, None]
        d2 = ((pos - npos[inv]) ** 2).sum(1); order = np.lexsort((d2, inv)); first = np.ones(len(order), bool); first[1:] = inv[order][1:] != inv[order][:-1]
        rep = order[first]; nuv = np.zeros((n, 2)); nuv[inv[rep]] = uv[rep]
        nt = inv[tri]; ok = (nt[:, 0] != nt[:, 1]) & (nt[:, 1] != nt[:, 2]) & (nt[:, 0] != nt[:, 2]); nt = nt[ok]
        if len(nt) > target: lo = math.sqrt(lo * hi)
        else: hi = math.sqrt(lo * hi); best = (npos, nuv, nt)
    return best or (npos, nuv, nt)
def b64tex(im, size=256):
    b = io.BytesIO(); im.resize((size, size), Image.LANCZOS).save(b, 'JPEG', quality=70, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def pack(out):
    js = {}
    for uid, m in out.items():
        mn, mx = m['min'], m['max']; parts = []
        for p in m['parts']:
            q = np.clip(((p['pos'] - mn) / np.maximum(mx - mn, 1e-9) * 65535).round(), 0, 65535).astype('<u2')
            uvq = ((np.clip(p['uv'], -8, 8) + 8) / 16 * 65535).round().astype('<u2')
            parts.append({'p': base64.b64encode(q.tobytes()).decode(), 'u': base64.b64encode(uvq.tobytes()).decode(), 'i': base64.b64encode(p['tri'].astype('<u2').reshape(-1).tobytes()).decode(), 'n': int(len(p['pos'])), 't': p['tex']})
        js[uid] = {'min': mn.round(4).tolist(), 'max': mx.round(4).tolist(), 'parts': parts}
    return js
if __name__ == '__main__':
    want = json.loads(sys.argv[1]); budget = int(sys.argv[2]) if len(sys.argv) > 2 else 2200
    NM = nick_map(); out = {}
    for oid, nick in want.items():
        if nick not in NM: print('sin nick', nick); continue
        p = find_bundle(NM[nick][0])
        if not p: print('sin paquete', nick); continue
        try: parts = extract(p)
        except Exception as e: print('ERR', nick, repr(e)[:150]); continue
        parts = [q for q in parts if len(q['tri'])]
        if not parts: print('vacío', nick); continue
        allp = np.concatenate([q['pos'] for q in parts]); mn = allp.min(0); mx = allp.max(0); tot = sum(len(q['tri']) for q in parts)
        res = []; tc = {}
        for q in parts:
            tgt = max(120, int(budget * len(q['tri']) / tot))
            npos, nuv, nt = decimate(q['pos'], q['uv'], q['tri'], tgt)
            used = np.unique(nt); rm = -np.ones(len(npos), dtype=np.int64); rm[used] = np.arange(len(used))
            tx = b64tex(q['tex']) if q['tex'] is not None else None
            res.append({'pos': npos[used], 'uv': nuv[used], 'tri': rm[nt], 'tex': tx})
        out[oid] = {'parts': res, 'min': mn, 'max': mx}
        print(oid, nick, 'tri', sum(len(r['tri']) for r in res), 'partes', len(res), 'bbox', (mx - mn).round(2), 'tex', [bool(r['tex']) for r in res])
    js = pack(out)
    dst = os.environ.get('OUT', '/tmp/scenery_partial.js')
    old = {}
    if os.path.exists(dst):
        t = open(dst).read(); old = json.loads(t[t.index('{'):t.rindex('}') + 1])
    old.update(js)
    open(dst, 'w').write('export const SCENERY = ' + json.dumps(old, separators=(',', ':')) + ';\n'); print('KB', os.path.getsize(dst) // 1024)
