# Hojas densas de una sola vista. Uso: sheet2.py <tiledir> <view 3q|side> <outprefix> <fac,fac|all> [cell=150] [cols=7] [rows=7]
# Las unidades con la misma malla, escala y peana que otra (variantes) reutilizan su baldosa («=id»); lee /tmp/scr/plan.json (dup) y /tmp/fa_new.json
import sys, glob, os, json
from PIL import Image, ImageDraw
d, view, out, facs = sys.argv[1:5]
C = int(sys.argv[5]) if len(sys.argv) > 5 else 150
NC = int(sys.argv[6]) if len(sys.argv) > 6 else 7
NR = int(sys.argv[7]) if len(sys.argv) > 7 else 7
facs = None if facs == 'all' else facs.split(',')
dup = json.load(open(os.environ.get('PLAN', '/tmp/scr/plan.json')))['dup']
au = [r for r in json.load(open(os.environ.get('AUDIT', '/tmp/fa_new.json'))) if not r['rear']]
items = []
for r in au:
    if facs and r['fac'] not in facs: continue
    f = f"{d}/{r['fac']}__{r['id']}__{view}.jpg"; lab = r['id']
    if not os.path.exists(f) and r['id'] in dup:
        f = f"{d}/{r['fac']}__{dup[r['id']]}__{view}.jpg"; lab = r['id'] + ' =' + dup[r['id']]
    items.append((f, lab, r))
per = NC * NR
for si in range(0, len(items), per):
    im = Image.new('RGB', (C * NC, (C + 10) * NR), (30, 30, 30)); dr = ImageDraw.Draw(im)
    for k, (f, lab, r) in enumerate(items[si:si + per]):
        x0 = (k % NC) * C; y0 = (k // NC) * (C + 10)
        if os.path.exists(f): im.paste(Image.open(f).convert('RGB').resize((C, C)), (x0, y0 + 10))
        dr.text((x0 + 1, y0), lab[:30] + (' H%.1f' % r['Hb'] if r.get('Hb') else ' proc'), fill=(255, 255, 0))
    im.save(f'{out}_{si // per}.jpg', quality=60)
print(len(items), 'celdas', (len(items) + per - 1) // per, 'hojas')
