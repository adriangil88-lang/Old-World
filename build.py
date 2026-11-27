import re, json, os, zipfile, sys
A='/home/claude/tow/app'
order=['geom','data','rulesrc','rules','ai','models','terrain','scenery','hdmap','gl3d','audio','render','main']
seen={}
bundle=[]
for m in order:
    src=open(f'{A}/js/{m}.js',encoding='utf8').read()
    # quita imports (una o varias líneas)
    src=re.sub(r"^import\s[^;]*?from\s+'[^']+';\s*$", "", src, flags=re.M|re.S)
    src=re.sub(r"^export\s+(?=(const|let|function|async|class))", "", src, flags=re.M)
    for mm in re.finditer(r"^(?:async\s+)?(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)", src, flags=re.M):
        n=mm.group(1)
        if n in seen: print('DUPLICADO', n, seen[n], m, file=sys.stderr)
        seen[n]=m
    bundle.append(f'// ===== {m}.js =====\n'+src)
js='\n'.join(bundle)
w=json.load(open(f'{A}/weights.json'))
js=f"window.__TOW_WEIGHTS__={json.dumps(w)};\n"+js
# Deduplica texturas data: repetidas (reduce ~2 MB el artefacto)
_cnt={}
for _m in re.finditer(r'"t":"(data:[^"]+)"', js): _cnt[_m.group(1)]=_cnt.get(_m.group(1),0)+1
_dup=[k for k,v in _cnt.items() if v>1]
_idx={k:i for i,k in enumerate(_dup)}
js=re.sub(r'"t":"(data:[^"]+)"', lambda m: f'"t":__T[{_idx[m.group(1)]}]' if m.group(1) in _idx else m.group(0), js)
js='const __T='+json.dumps(_dup)+';\n'+js
css=open(f'{A}/css/app.css',encoding='utf8').read()
html=open(f'{A}/index.html',encoding='utf8').read()
body=re.search(r'<body>(.*)</body>',html,re.S).group(1)
body=re.sub(r'<script type="module" src="js/main.js"></script>','',body)
frag=f'''<title>El Viejo Mundo</title>
<meta name="description" content="Batalla de regimientos para dos jugadores, con IA que aprende.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&family=IM+Fell+English+SC&display=swap" rel="stylesheet">
<style>
{css}
</style>
{body}
<script type="module">
{js}
</script>
'''
open('/home/claude/tow/dist/artifact.html','w',encoding='utf8').write(frag)
# versión autónoma (un solo archivo con doctype) para abrir en local
full=html
full=full.replace('<link rel="stylesheet" href="css/app.css">',f'<style>\n{css}\n</style>')
full=full.replace('<script type="module" src="js/main.js"></script>',f'<script type="module">\n{js}\n</script>')
open('/home/claude/tow/dist/viejo-mundo-single.html','w',encoding='utf8').write(full)
# zip PWA
zp='/home/claude/tow/dist/viejo-mundo-pwa.zip'
with zipfile.ZipFile(zp,'w',zipfile.ZIP_DEFLATED) as z:
    for root,_,files in os.walk(A):
        for f in files:
            p=os.path.join(root,f); rel=os.path.relpath(p,A)
            if rel in ('train.mjs','package.json') or rel.startswith('node_modules'): 
                if rel=='train.mjs': z.write(p,'train.mjs')
                elif rel=='package.json': z.write(p,'package.json')
                continue
            if rel=='LEEME.txt' and os.path.exists('/home/claude/tow/LEEME.txt'): continue  # v843l: un solo LEEME.txt en el zip (el de la raíz del proyecto manda)
            z.write(p,rel)
    if os.path.exists('/home/claude/tow/LEEME.txt'): z.writestr('LEEME.txt',open('/home/claude/tow/LEEME.txt',encoding='utf8').read())
print('ok', len(js)//1024,'KB js', os.path.getsize('/home/claude/tow/dist/artifact.html')//1024,'KB artifact')

# ficheros de soporte del artefacto (calidad adecuada: figuras ligeras xp + mallas altas xh + texturas 1536 xt); el zip lleva TODO (incl. xu 4096 px y mallas completas)
import shutil, glob
AF='/home/claude/tow/dist/artifact-files/hd'
shutil.rmtree('/home/claude/tow/dist/artifact-files', ignore_errors=True); os.makedirs(AF)
n=0; sz=0
for pat in ('xp_*.json','xh_*.dat.wasm','xt_*.avif'):
    for f in sorted(glob.glob(f'{A}/hd/{pat}')):
        if f.endswith('xp_terrain.json') and False: continue
        dst=os.path.join(AF,os.path.basename(f))
        # v843e: SOLO en el artefacto (el zip conserva el original de máxima calidad), las texturas xt grandes (>260 KB) se recodifican a AVIF calidad 52 para mantener >=20 MB de margen bajo el límite de 256 MiB por versión
        if pat=='xt_*.avif' and os.path.getsize(f)>150000:
            ck='/tmp/xt44/'+os.path.basename(f)+'.%d'%os.path.getsize(f)
            if not os.path.exists(ck):
                from PIL import Image
                os.makedirs('/tmp/xt44',exist_ok=True)
                Image.open(f).convert('RGB').save(ck,'AVIF',quality=44,speed=6)
            if os.path.getsize(ck)<os.path.getsize(f)*0.97: shutil.copy(ck,dst); n+=1; sz+=os.path.getsize(ck); continue
        shutil.copy(f, dst); n+=1; sz+=os.path.getsize(f)
print('artifact-files/hd', n, 'ficheros', sz//1048576, 'MB')
