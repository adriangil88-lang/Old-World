# Copia desde los .7z subidos los .obj y texturas que faltan para las figuras indicadas (por apodo del mod)
import json, re, glob, os, sys, hashlib, collections, shutil, subprocess
S = glob.glob('/tmp/claude-0/-home-claude/*/scratchpad')[0]
MODELS = S + '/models/Models'; IMG = '/home/claude/tow/images_raw'
clean = lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]', '', s or '').strip().replace('\n', ' ')
key = lambda u: re.sub(r'[^A-Za-z0-9]', '', u or '')
names = set(sys.argv[1:])
d = json.load(open('/home/claude/tow/ws/Workshop/3477087013.json'))
need = set()
def walk(o):
    if isinstance(o, dict):
        if 'CustomMesh' in o and clean(o.get('Nickname')) in names:
            for c in [o] + [c for c in o.get('ChildObjects', []) if c.get('CustomMesh')]:
                m = c['CustomMesh']
                for k in ('MeshURL', 'DiffuseURL'):
                    if m.get(k): need.add(key(m[k]))
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(d)
have = {os.path.splitext(f)[0] for f in os.listdir(MODELS) if os.path.getsize(MODELS + '/' + f) > 0} | {os.path.splitext(f)[0] for f in os.listdir(IMG)}
need -= have
loc = collections.defaultdict(list)
for f in glob.glob('/mnt/user-data/uploads/*.7z') + glob.glob('/mnt/user-data/attachments/*/*.7z'):
    h = hashlib.md5((os.path.basename(f) + '\n').encode()).hexdigest()[:8]; t = '/tmp/lst/%s.txt' % h
    if not os.path.exists(t): continue
    for l in open(t):
        p = l.split()
        if len(p) == 2 and int(p[0]) > 0 and os.path.splitext(p[1].split('/')[-1])[0] in need: loc[f].append(p[1])
print('faltan', len(need), 'en', len(loc), 'archivos')
for f, v in loc.items():
    tmp = '/tmp/ex_tmp'; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    subprocess.run(['python3', '-I', S + '/un7z.py', f, tmp], capture_output=True)
    for x in v:
        src = tmp + '/' + x
        if not os.path.exists(src):
            c = glob.glob(tmp + '/**/' + os.path.basename(x), recursive=True); src = c[0] if c else None
        if not src: continue
        shutil.copy(src, (MODELS if x.endswith('.obj') else IMG) + '/' + os.path.basename(x)); print('ok', os.path.basename(x)[-24:])
    shutil.rmtree(tmp, ignore_errors=True)
