# Hojas de contacto: sheet.py <tiledir> <fac> <outprefix> [cell=190] [ncols=2] [nrows=4]
import sys, glob, json, os
from PIL import Image, ImageDraw
d, fac, out = sys.argv[1:4]
C = int(sys.argv[4]) if len(sys.argv) > 4 else 190
NC = int(sys.argv[5]) if len(sys.argv) > 5 else 2
NR = int(sys.argv[6]) if len(sys.argv) > 6 else 4
A = {r['id']: r for r in json.load(open(os.environ.get('AUDIT','/tmp/fa_new.json'))) if not r.get('rear')}
ids = []
for f in sorted(glob.glob(f'{d}/{fac}__*__3q.jpg')):
    ids.append(os.path.basename(f).split('__')[1])
views = [v for v in ('3q', 'side', 'top') if glob.glob(f'{d}/{fac}__*__{v}.jpg')]
cw = C * len(views); ch = C + 12
per = NC * NR
for si in range(0, len(ids), per):
    im = Image.new('RGB', (cw * NC, ch * NR), (30, 30, 30)); dr = ImageDraw.Draw(im)
    for k, uid in enumerate(ids[si:si + per]):
        x0 = (k % NC) * cw; y0 = (k // NC) * ch
        for j, v in enumerate(views):
            fn = f'{d}/{fac}__{uid}__{v}.jpg'
            if os.path.exists(fn): im.paste(Image.open(fn).convert('RGB').resize((C, C)), (x0 + j * C, y0 + 12))
        r = A.get(uid); t = uid + (f" Hb{r.get('Hb', r['H']):.2f} b{r['bwI']:.2f}x{r['bdI']:.2f} k{r['kk']:.2f}" if r and r.get('H') else ' proc')
        dr.rectangle((x0, y0, x0 + cw, y0 + 11), fill=(0, 0, 0)); dr.text((x0 + 2, y0 + 1), t, fill=(255, 255, 0))
    im.save(f'{out}_{fac}_{si // per}.jpg', quality=62)
print(len(ids), 'unidades')
