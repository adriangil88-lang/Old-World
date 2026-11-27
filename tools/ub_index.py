import json, re, glob, os, sys, subprocess
sys.path.insert(0, '/home/claude/tow/tools')
key = lambda u: re.sub(r'[^A-Za-z0-9]', '', u or '')
clean = lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]', '', s or '').strip().replace('\n', ' ')
def nick_map(files=('3477087013', '3141810581', '3243779874', '3798253482')):
    m = {}
    for fn in files:
        d = json.load(open('/home/claude/tow/ws/Workshop/%s.json' % fn))
        def walk(o):
            if isinstance(o, dict):
                if 'CustomAssetbundle' in o:
                    n = clean(o.get('Nickname')) or clean(o.get('Name')); u = key(o['CustomAssetbundle'].get('AssetbundleURL'))
                    t = o.get('Transform', {})
                    m.setdefault(n, (u, (t.get('scaleX', 1), t.get('scaleY', 1), t.get('scaleZ', 1))))
                for v in o.values(): walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
        walk(d)
    return m
