#!/usr/bin/env python3
# v834 — Inventario de TODAS las Q/A de aclaración y de TODAS las erratas de las FAQ (rules/new/faq_*.txt)
# Reconstruye las dos columnas de cada página (límite de columna calculado por página), y extrae:
#   - kind 'qa'     : «Q: … A: …» (pregunta + respuesta completas)
#   - kind 'errata' : «Nombre: Change/Add/Delete/Replace/… » bajo una cabecera «Page N»
#   - kind 'note'   : «Designers’ Note» / notas sueltas que cambian reglas
# Salida: rules/verif/auto/out/qa_inventory.json  (id, src 'archivo:línea', kind, section, page, text, affects[])
import re, json, os, glob, sys
from collections import Counter
ROOT = '/home/claude/tow'
NEW = ROOT + '/rules/new'
OUT = ROOT + '/rules/verif/auto/out/qa_inventory.json'

def pages(lines):
    cur = []
    for n, l in enumerate(lines, 1):
        cur.append((n, l))
        if 'Permission to download/print' in l:
            yield cur; cur = []
    if cur: yield cur

def segs(l):
    return [(m.start(), m.group().rstrip()) for m in re.finditer(r'\S.*?(?=\s{3,}|$)', l)]

def columns(page):
    starts = Counter()
    for n, l in page:
        for st, t in segs(l):
            if st >= 45: starts[st] += 1
    if not starts: return [[(n, l.strip()) for n, l in page if l.strip()], []]
    # el inicio de columna derecha más frecuente (con tolerancia de ±2)
    best = max(starts, key=lambda k: sum(v for kk, v in starts.items() if abs(kk - k) <= 2))
    bound = best - 3
    L, R = [], []
    for n, l in page:
        if 'Permission to download' in l or re.fullmatch(r'\s*\d+\s*', l): continue
        lt, rt = [], []
        for st, t in segs(l):
            (rt if st >= bound else lt).append(t)
        if lt: L.append((n, ' '.join(lt)))
        if rt: R.append((n, ' '.join(rt)))
    return [L, R]

ERR = re.compile(r"^(?:\*\s*)?(?!Notes:|Warhammer:)([’'A-Z0-9][^:]{0,80}?):\s+(?:Under [‘'][^’']+[’'],\s+)?(Change|Add|Delete|Remove|Replace|Insert|Amend|This|Should|change|add|delete)\b")
HEAD_PAGE = re.compile(r'^Pages? \d+')

def parse(fname):
    lines = open(f'{NEW}/{fname}', encoding='utf8').read().split('\n')
    stream = []
    for pg in pages(lines):
        L, R = columns(pg)
        stream += L + R
    items = []; cur = None; page = None; section = None; prev = None
    def close():
        nonlocal cur
        if cur:
            cur['text'] = re.sub(r'\s+', ' ', cur['text']).strip()
            items.append(cur)
        cur = None
    for i, (n, t) in enumerate(stream):
        nxt = stream[i + 1][1] if i + 1 < len(stream) else ''
        if HEAD_PAGE.match(t) and len(t) < 30:
            close(); page = t; continue
        mp = re.search(r'This page updates the profile for ([^,]+?), found in', t)
        if mp:
            if cur and cur['text'].endswith(stream[i-1][1]): cur['text'] = cur['text'][:-len(stream[i-1][1])]
            close(); cur = {'kind': 'errata', 'ln': n, 'page': 'Profile update', 'section': section, 'name': mp.group(1), 'text': t}; continue
        if t.startswith('Q:'):
            close(); cur = {'kind': 'qa', 'ln': n, 'page': page, 'section': section, 'text': t}; continue
        m = ERR.match(t)
        if m and (cur is None or cur['kind'] != 'qa' or 'A:' in cur['text']) and not t.startswith('A:'):
            close(); cur = {'kind': 'errata', 'ln': n, 'page': page, 'section': section, 'name': m.group(1).strip('*‘’ '), 'text': t}; continue
        if re.match(r"^Designers?[’'] Note", t) and cur is None or (re.match(r"^Designers?[’'] Note", t) and cur and cur['kind'] == 'errata' and False):
            close(); cur = {'kind': 'note', 'ln': n, 'page': page, 'section': section, 'text': t}; continue
        # cabecera de sección (línea corta, sin punto final, seguida de Q: o de Page)
        if (len(t) < 60 and not t.endswith(('.', ',', ':', '’', '?')) and re.match(r'^[A-Z]', t)
                and (nxt.startswith('Q:') or HEAD_PAGE.match(nxt)) and (cur is None or cur['kind'] != 'qa' or 'A:' in cur['text'])):
            close(); section = t; continue
        if re.match(r'^(Arcane Journal|Ravening Hordes|Forces of Fantasy|Warhammer: [Tt]he Old World$|Armies of Grand Cathay|Below you will find|This document collects|Frequently Asked Questions|Errata$|.*Errata$|.*FAQ & Errata)', t) and len(t) < 140:
            close(); section = t; continue
        if cur: cur['text'] += ' ' + t
    close()
    return items

# Para «affects»: nombres ingleses de unidades/reglas/objetos/hechizos (dict.json del comparador, si existe) y palabras clave
def load_names():
    names = set()
    try:
        d = json.load(open(ROOT + '/rules/verif/auto/dict.json', encoding='utf8'))
        if isinstance(d, dict):
            for k, v in d.items():
                names.add(k)
    except Exception:
        pass
    return names

def main():
    files = sorted(os.path.basename(p) for p in glob.glob(NEW + '/faq_*.txt'))
    # v835: conserva los ids de un inventario anterior (las pruebas los citan); las entradas nuevas toman el siguiente número de su clase
    old = {}
    if os.path.exists(OUT):
        for x in json.load(open(OUT, encoding='utf8')): old[(x['src'], x['text'][:80])] = x['id']
    names = load_names()
    out = []
    for f in files:
        its = parse(f)
        tag = f[4:-4]
        c = Counter(); used = set(old.values())
        mx = Counter()
        for v in used:
            if v.startswith(tag + '-'): k, n = v[len(tag) + 1:].rsplit('-', 1); mx[k] = max(mx[k], int(n))
        for it in its:
            c[it['kind']] += 1
            key = (f'rules/new/{f}:{it["ln"]}', re.sub(r'\s+', ' ', it['text']).strip()[:80])
            if old: 
                if key in old: iid = old[key]
                else: mx[it['kind']] += 1; iid = f"{tag}-{it['kind']}-{mx[it['kind']]:03d}"
            else: iid = f"{tag}-{it['kind']}-{c[it['kind']]:03d}"
            aff = []
            if it['kind'] == 'errata':
                aff.append(it['name'])
                if it.get('section'): pass
            if it['page']: aff.append(it['page'])
            if it['kind'] == 'qa':
                q = it['text'].split(' A:')[0]
                # términos con mayúscula/comillas en la pregunta (nombres de reglas/unidades/objetos)
                for m in re.finditer(r"[‘'“\"]([^’'”\"]{3,40})[’'”\"]", q): aff.append(m.group(1))
                for m in re.finditer(r"\b((?:[A-Z][a-z’']+(?:\s(?:of|the|&|de)\s|\s)?){1,4}[A-Z][a-z’']+|[A-Z][a-z]{3,})\b", q):
                    w = m.group(1).strip()
                    if w not in ('Can', 'Does', 'When', 'If', 'What', 'How', 'Are', 'Is', 'Do', 'Should', 'Which', 'Would', 'For', 'Some', 'The', 'This', 'That', 'Will', 'Could', 'Must', 'May', 'Where', 'Whilst', 'After', 'Page', 'Also', 'However', 'Yes', 'Many', 'Most', 'Our'):
                        aff.append(w)
            seen = []
            for a in aff:
                if a and a not in seen: seen.append(a)
            out.append({'id': iid, 'src': f'rules/new/{f}:{it["ln"]}', 'kind': it['kind'], 'section': it.get('section'), 'page': it.get('page') if it['kind'] != 'qa' else None,
                        'name': it.get('name'), 'text': it['text'], 'affects': seen})
        print(f, dict(c), file=sys.stderr)
    json.dump(out, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(len(out), 'entradas ->', OUT, file=sys.stderr)

if __name__ == '__main__':
    main()
