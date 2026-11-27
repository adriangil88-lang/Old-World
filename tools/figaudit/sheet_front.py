# v843n: hojas de contacto con flecha de frente. Uso: sheet_front.py <tiledir> <outprefix> <reps.json> [cell=170] [ncols=6] [nrows=6] [fac]
import sys, glob, json, os
from PIL import Image, ImageDraw
d, out, rj = sys.argv[1:4]
C = int(sys.argv[4]) if len(sys.argv) > 4 else 170
NC = int(sys.argv[5]) if len(sys.argv) > 5 else 6
NR = int(sys.argv[6]) if len(sys.argv) > 6 else 6
R = json.load(open(rj))
share = {}
for k, v in R.get('repOf', {}).items(): share.setdefault(v, []).append(k)
tiles = sorted(glob.glob(f'{d}/*__' + os.environ.get('VIEW','side') + '.jpg'), key=lambda f: (os.path.basename(f).split('__')[0], os.path.basename(f).split('__')[1]))
per = NC * NR
ch = C + 11
for si in range(0, len(tiles), per):
    im = Image.new('RGB', (C * NC, ch * NR), (24, 24, 24)); dr = ImageDraw.Draw(im)
    for k, f in enumerate(tiles[si:si + per]):
        fac, uid = os.path.basename(f).split('__')[:2]
        x = (k % NC) * C; y = (k // NC) * ch
        im.paste(Image.open(f).convert('RGB').resize((C, C)), (x, y + 11))
        n = len(share.get(uid, [])) if share else 0
        dr.rectangle((x, y, x + C, y + 10), fill=(0, 0, 0)); dr.text((x + 2, y), (uid[:24] + (f' +{n-1}' if n > 1 else '')), fill=(255, 255, 0))
    im.save(f'{out}_{si // per:02d}.jpg', quality=60)
print(len(tiles), 'tiles', (len(tiles) + per - 1) // per, 'hojas')
