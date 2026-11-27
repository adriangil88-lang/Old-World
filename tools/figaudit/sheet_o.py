# v843o: hojas de <=12 figuras (4x3), celda grande, con id/fuente/yaw. Uso: sheet_o.py <tiledir> <view> <outprefix> [cell=400] [ncols=4] [nrows=3]
import sys, glob, os
from PIL import Image, ImageDraw
d, view, out = sys.argv[1:4]
C = int(sys.argv[4]) if len(sys.argv) > 4 else 400
NC = int(sys.argv[5]) if len(sys.argv) > 5 else 4
NR = int(sys.argv[6]) if len(sys.argv) > 6 else 3
FT = {}
for l in open('/home/claude/tow/rules/verif/auto/out/front_table_v843n.tsv').read().split('\n')[1:]:
    p = l.split('\t')
    if len(p) > 4: FT[p[0]] = p
tiles = sorted(glob.glob(f'{d}/*__{view}.jpg'), key=lambda f: (os.path.basename(f).split('__')[0], os.path.basename(f).split('__')[1]))
per = NC * NR; n = 0
for si in range(0, len(tiles), per):
    im = Image.new('RGB', (C * NC, (C + 14) * NR), (24, 24, 24)); dr = ImageDraw.Draw(im)
    for k, f in enumerate(tiles[si:si + per]):
        uid = os.path.basename(f).split('__')[1]
        x = (k % NC) * C; y = (k // NC) * (C + 14)
        im.paste(Image.open(f).convert('RGB').resize((C, C)), (x, y + 14))
        t = FT.get(uid); lab = uid + (f' [{t[3]} yaw={float(t[2]):.2f}]' if t else '')
        dr.rectangle((x, y, x + C, y + 13), fill=(0, 0, 0)); dr.text((x + 3, y + 1), lab, fill=(255, 255, 0))
    im.save(f'{out}_{si // per:02d}.jpg', quality=80); n += 1
print(len(tiles), 'tiles', n, 'hojas')
