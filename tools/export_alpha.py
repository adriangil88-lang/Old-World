# Recupera el canal alfa (recorte) de las texturas reales del mod para follaje y pantano, y exporta las mallas completas de los árboles
# Uso: python3 export_alpha.py  -> /tmp/gx/out/{alpha.json, *.webp, m_s_*.json}
import sys, os, io, json, base64, hashlib, re
sys.path.insert(0, '/home/claude/tow/tools')
import numpy as np
from PIL import Image
import export_scenery as E
from ub_index import nick_map
OUT = '/tmp/gx/out'; NM = nick_map()
def tex_rgba(t, resS):
    w, h, f = t['m_Width'], t['m_Height'], t['m_TextureFormat']
    data = t['image data']; sd = t.get('m_StreamData') or {}
    if (not data or len(data) == 0) and sd.get('size'): data = resS[sd['offset']:sd['offset'] + sd['size']]
    if f in (10, 11, 12):
        import struct
        full = ((w + 3) // 4) * ((h + 3) // 4) * (8 if f == 10 else 16)
        fourcc = {10: b'DXT1', 12: b'DXT5', 11: b'DXT3'}[f]
        hd = struct.pack('<4sIIIIIII', b'DDS ', 124, 0x81007, h, w, 0, 0, 1) + b'\0' * 44 + struct.pack('<II4sIIIII', 32, 4, fourcc, 0, 0, 0, 0, 0) + struct.pack('<IIIII', 0x1000, 0, 0, 0, 0)
        return Image.open(io.BytesIO(hd + bytes(data[:full]))).convert('RGBA').transpose(Image.FLIP_TOP_BOTTOM)
    if f == 4: return Image.frombytes('RGBA', (w, h), bytes(data[:w * h * 4])).transpose(Image.FLIP_TOP_BOTTOM)
    return None
E.tex_image = tex_rgba
def has_alpha(im):
    a = np.asarray(im.getchannel('A')); return (a < 128).mean() > 0.02
def bleed(im):  # extiende el color de los píxeles opacos sobre los transparentes para que el filtrado no deje halos
    a = np.asarray(im).astype(np.float32); rgb = a[..., :3].copy(); al = a[..., 3] > 100
    filled = al.copy(); acc = rgb * al[..., None]
    for _ in range(24):
        if filled.all(): break
        s = np.zeros_like(acc); c = np.zeros(filled.shape, np.float32)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            s += np.roll(acc * filled[..., None], (dy, dx), (0, 1)); c += np.roll(filled, (dy, dx), (0, 1))
        new = (~filled) & (c > 0); acc[new] = s[new] / c[new][:, None]; filled |= new
    acc[~filled] = acc[filled].mean(0) if filled.any() else 0
    out = np.dstack([acc, a[..., 3]]).clip(0, 255).astype(np.uint8); return Image.fromarray(out, 'RGBA')
def webp(im, size, q):
    w, h = im.size; k = min(1, size / max(w, h)); im2 = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS) if k < 1 else im
    b = io.BytesIO(); im2.save(b, 'WEBP', quality=q, method=6); return b.getvalue()
SCN = {'oak': 'Live Oak', 'elm': 'Elm', 'broad': 'Broadleaf', 'shrub': 'ESO_W12_Shrubs1', 'bush': 'Z_L3_Bush_2', 'bush2': 'eso_gu2_bush1', 'swamptree': 'eso_m1_swamptree1_1', 'swgrass': 'eso_m1_swampgrass1_1', 'swplant': 'eso_m4_swampplant7'}
res = {'scn': {}, 'ter': {}, 'hdmesh': []}
cache = {}
for sid, nick in SCN.items():
    p = E.find_bundle(NM[nick][0])
    if not p: print('sin paquete', sid); continue
    parts = [q for q in E.extract(p) if len(q['tri'])]
    lst = []
    for k, q in enumerate(parts):
        im = q['tex']
        if im is None or not has_alpha(im): lst.append(None); continue
        hk = hashlib.md5(im.tobytes()).hexdigest()[:10]
        if hk not in cache:
            b = bleed(im); hd = webp(b, 1024, 82); open(f'{OUT}/{hk}.webp', 'wb').write(hd)
            cache[hk] = 'data:image/webp;base64,' + base64.b64encode(webp(b, 256, 70)).decode()
        lst.append({'t': cache[hk], 'hd': f'hd/{hk}.webp'})
    res['scn'][sid] = lst
    tot = sum(len(q['tri']) for q in parts); print(sid, 'partes', len(parts), 'alfa', [bool(x) for x in lst], 'tri', tot)
    if sid in ('oak', 'elm', 'broad'):  # malla completa (la ligera está decimada y deforma las láminas de hojas)
        allp = np.concatenate([q['pos'] for q in parts]); mn = allp.min(0); mx = allp.max(0); out = []
        for q in parts:
            used = np.unique(q['tri']); assert len(used) < 65536, 'demasiados vértices'
            rm = -np.ones(len(q['pos']), dtype=np.int64); rm[used] = np.arange(len(used))
            out.append({'pos': q['pos'][used], 'uv': q['uv'][used], 'tri': rm[q['tri']], 'tex': None})
        js = E.pack({sid: {'parts': out, 'min': mn, 'max': mx}})[sid]
        for pp in js['parts']: pp.pop('t', None)
        open(f'{OUT}/m_s_{sid}.json', 'w').write(json.dumps(js, separators=(',', ':'))); res['hdmesh'].append('s_' + sid)
        print('  malla HD', os.path.getsize(f'{OUT}/m_s_{sid}.json') // 1024, 'KB')
# terreno con recorte: pantano y hierba (texturas PNG del mod)
key = lambda u: re.sub(r'[^A-Za-z0-9]', '', u or '')
clean = lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]', '', s or '').strip().replace('\n', ' ')
d = json.load(open('/home/claude/tow/ws/Workshop/3141810581.json')); found = {}
def walk(o):
    if isinstance(o, dict):
        n = clean(o.get('Nickname'))
        if 'CustomMesh' in o and n not in found: found[n] = o
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(d)
IMG = '/home/claude/tow/images_raw'; idx = {os.path.splitext(f)[0]: f for f in os.listdir(IMG)}
for tid, nick, lsz in (('swamp', 'Swamp', 512), ('grass', 'Fresh Grass', 512)):
    k = key(found[nick]['CustomMesh']['DiffuseURL']); f = idx.get(k) or next((v for kk, v in idx.items() if kk.endswith(k) or k.endswith(kk)), None)
    im = Image.open(IMG + '/' + f).convert('RGBA'); b = bleed(im); hk = hashlib.md5(im.tobytes()).hexdigest()[:10]
    open(f'{OUT}/{hk}.webp', 'wb').write(webp(b, 1024, 84))
    res['ter'][tid] = [{'t': 'data:image/webp;base64,' + base64.b64encode(webp(b, lsz, 72)).decode(), 'hd': f'hd/{hk}.webp'}]
    print(tid, im.size, 'ligera KB', len(res['ter'][tid][0]['t']) // 1024)
json.dump(res, open(f'{OUT}/alpha.json', 'w'))
