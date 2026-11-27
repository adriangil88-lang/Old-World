# Extrae las miniaturas reales del mod de TTS (Workshop JSON + OBJ + texturas), las simplifica y las empaqueta en app/js/models.js
import json, re, os, sys, math, base64, io
import numpy as np
from PIL import Image
ROOT = '/home/claude/tow'
S = '/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad'
MODELS = S + '/models/Models'
IMG = ROOT + '/images_raw'
key = lambda u: re.sub(r'[^A-Za-z0-9]', '', u or '')
clean = lambda s: re.sub(r'\[[0-9A-Fa-f\-]+\]', '', s or '').strip().replace('\n', ' ')
MAP = {
 'tk_king_dragon': 'Tomb King on Necrolith Bone Dragon', 'tk_hpriest_dragon': 'High Priest on Necrolith Bone Dragon', 'he_noble_sun': 'Noble on Sun Dragon', 'he_prince_sun': 'Prince on Sun Dragon',
 'he_archmage_star': 'Archmage on Star Dragon', 'he_prince_star': 'Prince Star Dragon', 'he_skycutter': 'Lothern Skycutter', 'he_mage_eagle': 'Mage on Great Eagle', 'he_noble_eagle': 'Noble on Great Eagle', 'he_noble_griffon': 'Noble on Griffon',
 'we_lord_dragon': 'Glade Lord on Forest Dragon', 'we_lord_eagle': 'Glade Lord on Great Eagle', 'we_lord_stag': 'Glade Lord on Great Stag', 'we_captain_stag': 'Glade Captain on Great Stag', 'we_eagle': 'Great Eagle', 'we_waywatchers': 'Waywatcher', 'we_waystalker': 'Waystalker', 'we_shadowdancer': 'Shadowdancer', 'we_sisters': 'Sisters of the Thorn ST', 'we_scouts': 'Deepwood Stout ST', 'we_weaver_unicorn': 'Spellweaver on Unicorn', 'we_lord_hawk': 'Glade Lord on Warhawk',
 'br_baron_pegasus': 'Baron on Royal Pegasus', 'emp_chaptermaster': 'Chapter Master on Horse', 'emp_grandmaster': 'Grand Master on Horse', 'demigryph_knights': 'Demigryph Knights', 'emp_archers': 'Empire Archers', 'emp_engineer': 'Empire Engineer', 'flagellants': 'Flagellants', 'free_company': 'Free Company Militia',
 'emp_general_griffon': 'General of the Empire on Griffon', 'helblaster': 'Helblaster Volley Gun', 'inner_circle': 'Inner Circle Knights', 'br_realm_foot': 'Knights of the Realm on Foot', 'emp_lector': 'Lector of Sigmar', 'emp_lector_altar': 'Lector of Sigmar on War Alter of Sigmar', 'mortar': 'Mortar', 'br_yeomen': 'Mounted Yeomen',
 'outriders': 'Outriders', 'pistoliers': 'Pistoliers', 'emp_priest': 'Priest of Sigmar', 'emp_ulric': 'Priest of Ulric', 'steam_tank': 'Steam Tank', 'emp_witchhunter': 'Witch Hunter', 'br_duke_hippo': 'Duke on Hippogryph',
 'arachnarok': 'Arachnarok Spider', 'doom_diver': 'Doom Diver Catapult', 'orc_giant': 'Giant', 'gob_oddgit': 'Goblin Oddgit', 'gob_oddnob': 'Goblin Oddnob', 'gob_warboss': 'Goblin Warboss', 'wolf_chariot': 'Goblin Wolf Chariots', 'mangler_squig': 'Mangler Squigs', 'ng_bigboss': 'Night Goblin Bigboss', 'ng_warboss': 'Night Goblin Warboss',
 'orc_boar_chariot': 'Orc Boar Chariots', 'orc_warboss_wyvern': 'Orc Warboss on Wyvern', 'river_trolls': 'River Troll', 'snotlings': 'Snotling Mobs', 'pump_wagon': 'Snotling Pump Wagons', 'squig_herd': 'Squig', 'squig_hoppers': 'Squighoppaz', 'stone_trolls': 'Stone Troll',
 'tk_casket': 'Casket of Souls', 'tk_catapult': 'Screaming Skull Catapult', 'tk_necrotect': 'Necrotect', 'tk_swarm': 'Tomb Swarm', 'tk_stalkers': 'Sepulchral Stalkers',
 'dw_anvil': 'Anvil of Doom', 'dw_gyrobomber': 'Gyrobombers', 'dw_king_shield': 'King on Shieldbearers', 'bm_giant': 'Chaos Giant',
 'he_prince_griffon': 'Prince on Griffon', 'he_prince_moon': 'Prince on Moon Dragon', 'he_archmage_moon': 'Archmage on Moon Dragon', 'he_dragonmage': 'Dragon Mage on Sun Dragon', 'he_flamespyre': 'Flamespyre Phoenix', 'he_frostheart': 'Frostheart Phoenix',
 'woc_lord_manticore': 'Chaos Lord on Manticore', 'woc_lord_dragon': 'Chaos Lord on Chaos Dragon', 'woc_sorc_manticore': 'Sorcerer Lord on Manticore', 'woc_chimera': 'Chimera', 'tk_warsphinx': 'Khemrian Warsphinx', 'tk_scorpion': 'Tomb Scorpion', 'tk_colossus': 'Necrolith Colossus', 'tk_necrosphinx': 'Necrosphinx',
 'bm_shaggoth': 'Dragon Ogre Shaggoth', 'bm_jabberslythe': 'Jabberslythe', 'bm_cockatrice': 'Cockatrice', 'bm_cygor': 'Cygor',
 'he_tiranoc': 'Prince on Tiranoc Chariot', 'he_lionchariot': 'Prince Lion Chariot of Chrace', 'tk_chariot': 'Tomb King on Skeleton Chariot', 'woc_chariot': 'Chaos Chariot', 'woc_gorechariot': 'Gorebeast Chariot', 'bm_tuskchariot': 'Beastlord on Tuskgor Chariot', 'bm_razorchariot': 'Beastlord on Razorgor Chariot',
 'he_prince': 'Prince', 'he_prince_h': 'Prince on Elven Steed', 'he_noble': 'Noble', 'he_archmage': 'Archmage', 'he_handmaiden': 'Handmaiden of the Everqueen', 'he_spearmen': 'Elven Spearmen', 'he_archers': 'Elven Archers', 'he_seaguard': 'Lothern Sea Guard',
 'he_whitelions': 'White Lions', 'he_swordmasters': 'Swordmasters', 'he_phoenix': 'Phoenix Guard', 'he_shadow': 'Shadow Warriors', 'he_sisters': 'Sisters of Avelorn', 'he_reavers': 'Ellyrian Reavers', 'he_silverhelms': 'Silver Helms', 'he_dragonprinces': 'Dragon Princes', 'he_eagle': 'Great Eagle', 'he_boltthrower': 'Eagle Claw Bolt Thrower',
 'dw_warriors': 'Dwarf Warrior', 'dw_warriors_gw': 'Dwarf Warrior ST', 'dw_quarrellers': 'Quarrellers', 'dw_thunderers': 'Thunderer', 'dw_hammerers': 'Hammerer', 'dw_ironbreakers': 'Ironbreakers', 'dw_irondrakes': 'Irondrakes', 'dw_miners': 'Miners', 'dw_slayers': 'Slayers', 'dw_rangers': 'Rangers',
 'dw_longbeards': 'Longbeard w/ Ancestral Hammer', 'dw_king': 'King', 'dw_thane': 'Thane', 'dw_runesmith': 'Runesmith', 'dw_dslayer': 'Daemon Slayer', 'dw_drslayer': 'Dragon Slayer', 'dw_gyro': 'Gyrocopters', 'dw_grudge': 'Grudge Throwers', 'dw_organ': 'Organ Guns',
 'empire_general': 'General of the Empire', 'empire_general_h': 'General of the Empire on Horse', 'empire_captain': 'Captain of the Empire',
 'empire_mage': 'Master Mage', 'empire_lord': 'Wizard Lord', 'state_halberds': 'State Troops with Halberds ST', 'state_spears': 'State Troops with Spears ST',
 'state_swords': 'State Troops ST', 'crossbowmen': 'State Missile Troops with Crossbows ST', 'handgunners': 'State Missile Troops with Handguns ST',
 'greatswords': 'Empire Greatsword ST', 'empire_knights': 'Captain of the Empire on Horse', 'great_cannon': 'Cannon',
 'orc_warboss': 'Orc Warboss', 'orc_warboss_boar': 'Orc Warboss on War Boar', 'black_warboss': 'Black Orc Warboss', 'orc_weirdboy': 'Maniak Weirdnob',
 'orc_weirdnob': 'Maniak Weirdnob', 'gob_bigboss': 'Goblin Bigboss', 'orc_boyz': 'Orc Mobs ST', 'orc_twin': 'Orc Mobs ST', 'orc_arrers': 'Orc Mobs ST', 'goblins': 'Goblinmob ST',
 'night_goblins': 'Night Goblin Mobs (Spears) ST', 'wolf_riders': 'Goblin Wolf Rider', 'black_orcs': 'Black Orc Mobs ST', 'boar_boyz': 'Orc Boar Boy Mobs ST',
 'trolls': 'Troll Mobs', 'rock_lobber': 'Goblin Rock Lobbers', 'bolt_throwa': 'Bolt Throwers',
 'br_duke': 'Duke on Warhorse', 'br_baron': 'Baron on Bretonnian Warhorse', 'br_paladin': 'Paladin Bretonnian on Bretonnian Warhorse', 'br_damsel': 'Damsel', 'br_prophetess': 'Prophetess',
 'br_men_at_arms': 'Ment at Arms (Polearms) ST', 'br_bowmen': 'Peasant Bowmen ST', 'br_squires': 'Squires MU', 'br_pilgrims': 'Ment at Arms(Handweapon+Shield) ST',
 'br_errant': 'Knights Errant ST', 'br_realm': 'Knights of the Realm ST', 'br_questing': 'Questing Knights ST', 'br_grail': 'Grail Knights ST',
 'br_pegasus': 'Pegasus Knight ST', 'br_trebuchet': 'Field Trebuchet',
 'we_lord': 'Glade Lord', 'we_lord_h': 'Glade Riders', 'we_captain': 'Glade Captain', 'we_spellsinger': 'Spellsinger', 'we_spellweaver': 'Spellweaver',
 'we_branchwraith': 'Branchwraiths', 'we_ancient': 'Treeman Ancient', 'we_glade_guard': 'Glade Guard ST', 'we_eternal': 'Eternal Guard ST', 'we_dryads': 'Dryads',
 'we_glade_riders': 'Glade Riders ST', 'we_rangers': 'Wildwood Rangers ST', 'we_wardancers': 'Wardancer', 'we_wild_riders': 'Wild Rider ST', 'we_warhawks': 'Warhawk Rider',
 'we_treekin': 'Tree Kin', 'we_treeman': 'Treeman',
 'tk_king': 'Tomb King (Shield)', 'tk_prince': 'Gruftprinz', 'tk_herald': 'Tomb Herald (Shield)', 'tk_hpriest': 'Liche High Priest (Nehekhara)', 'tk_mpriest': 'Liche Priest (Nehekhara)', 'tk_warriors': 'Skeleton Warriors', 'tk_archers': 'Skeleton Archers ST', 'tk_guard': 'Tomb Guard ST', 'tk_ushabti': 'Ushabti (Great Weapon)', 'tk_ushabti_bow': 'Ushabti (Bow)', 'tk_horsemen': 'Skeleton Horsemen', 'tk_horse_archers': 'Skeleton Horse Archers ST',
 'woc_lord': 'Chaos Lord', 'woc_lord_steed': 'Chaos Lord on Chaos Steed', 'woc_exalted': 'Exalted Hero of Chaos', 'woc_sorc_lord': 'Sorcerer Lord', 'woc_ex_sorc': 'Sorcerer', 'woc_dprince': 'Daemon Prince', 'woc_warriors': 'Chaos Warriors ST', 'woc_chosen': 'Chosen Chaos Warriors ST', 'woc_marauders': 'Chaos Marauders ST', 'woc_forsaken': 'Forsaken', 'woc_knights': 'Chaos Knights ST', 'woc_chosen_knights': 'Chosen Chaos Knights ST', 'woc_ogres': 'Chaos Ogre', 'woc_trolls': 'Chaos Trolls', 'woc_hounds': 'Chaos Warhounds',
 'bm_beastlord': 'Beastlord', 'bm_wargor': 'Wargor', 'bm_gbs': 'Great Bray-Shaman', 'bm_bs': 'Bray-Shaman', 'bm_doombull': 'Doombull', 'bm_gorebull': 'Gorebull', 'bm_centigors': 'Centigor Herds', 'bm_harpies': 'Harpies', 'bm_hounds': 'Chaos Warhounds', 'bm_dragon_ogres': 'Dragon Ogre', 'bm_ghorgon': 'Ghorgon',
}
only = set(sys.argv[1:])
d = json.load(open(ROOT + '/ws/Workshop/3477087013.json'))
objs = {}
def walk(o):
    if isinstance(o, dict):
        if 'CustomMesh' in o and ('ChildObjects' in o or o['CustomMesh'].get('MeshURL')):
            n_ = clean(o.get('Nickname')); okf = lambda m: os.path.exists(MODELS + '/' + key(m.get('MeshURL')) + '.obj') and os.path.getsize(MODELS + '/' + key(m.get('MeshURL')) + '.obj') > 0
            kids_ = [c for c in o.get('ChildObjects', []) if c.get('CustomMesh')]
            sc_ = sum(1 for c in kids_ if okf(c['CustomMesh'])) if kids_ else (1 if okf(o['CustomMesh']) else 0)
            if kids_ and sc_ < len(kids_): sc_ = sc_ - 0.5 * (len(kids_) - sc_)
            if n_ not in objs or sc_ > objs[n_][1]: objs[n_] = (o, sc_)
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(d)
def rotm(rx, ry, rz):  # Unity: Z, luego X, luego Y
    rx, ry, rz = map(math.radians, (rx, ry, rz))
    cx, sx, cy, sy, cz, sz = math.cos(rx), math.sin(rx), math.cos(ry), math.sin(ry), math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]]); Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Ry @ Rx @ Rz
def load_obj(path):
    V, VT, F = [], [], []
    for l in open(path, errors='ignore'):
        if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
        elif l.startswith('vt '): VT.append([float(x) for x in l.split()[1:3]])
        elif l.startswith('f '):
            idx = []
            for t in l.split()[1:]:
                p = t.split('/'); idx.append((int(p[0]) - 1, int(p[1]) - 1 if len(p) > 1 and p[1] else 0))
            for i in range(1, len(idx) - 1): F.append((idx[0], idx[i], idx[i + 1]))
    return np.array(V, dtype=np.float64), (np.array(VT, dtype=np.float64) if VT else np.zeros((1, 2))), F
def part_mesh(c, par_scale):
    cm = c['CustomMesh']; p = MODELS + '/' + key(cm['MeshURL']) + '.obj'
    if not os.path.exists(p): return None
    V, VT, F = load_obj(p)
    if V.size == 0 or not F: print('  malla vacía', p[-30:], os.path.getsize(p)); return None
    t = c['Transform']
    R = rotm(t['rotX'], t['rotY'], t['rotZ'])
    S_ = np.array([t['scaleX'], t['scaleY'], t['scaleZ']])
    W = (V * S_) @ R.T + np.array([t['posX'], t['posY'], t['posZ']])
    W = W * np.array(par_scale)
    verts = {}; pos = []; uv = []; tri = []
    for a, b, cc in F:
        ids = []
        for vi, ti in (a, b, cc):
            k = (vi, ti)
            if k not in verts: verts[k] = len(pos); pos.append(W[vi]); uv.append(VT[ti] if ti < len(VT) else (0, 0))
            ids.append(verts[k])
        tri.append(ids)
    return np.array(pos), np.array(uv), np.array(tri), cm.get('DiffuseURL', '')
def decimate(pos, uv, tri, target):
    if len(tri) <= target: return pos, uv, tri
    lo, hi = 0.002, 0.5
    ext = pos.max(0) - pos.min(0); diag = float(np.linalg.norm(ext)); best = None
    for _ in range(16):
        cell = math.sqrt(lo * hi) * diag
        cp = np.floor(pos / cell).astype(np.int64)
        _, inv = np.unique(cp, axis=0, return_inverse=True); inv = inv.reshape(-1)
        n = inv.max() + 1
        npos = np.zeros((n, 3)); cnt = np.zeros(n)
        np.add.at(npos, inv, pos); np.add.at(cnt, inv, 1); npos /= cnt[:, None]
        d2 = ((pos - npos[inv]) ** 2).sum(1)
        order = np.lexsort((d2, inv)); first = np.ones(len(order), bool); first[1:] = inv[order][1:] != inv[order][:-1]
        rep = order[first]; nuv = np.zeros((n, 2)); nuv[inv[rep]] = uv[rep]
        nt = inv[tri]; ok = (nt[:, 0] != nt[:, 1]) & (nt[:, 1] != nt[:, 2]) & (nt[:, 0] != nt[:, 2]); nt = nt[ok]
        if len(nt) > target: lo = math.sqrt(lo * hi)
        else: hi = math.sqrt(lo * hi); best = (npos, nuv, nt)
    if best is None: best = (npos, nuv, nt)
    return best
def tex_b64(url, size):
    p = None
    for f in os.listdir(IMG) if not hasattr(tex_b64, 'idx') else []:
        pass
    if not hasattr(tex_b64, 'idx'): tex_b64.idx = {os.path.splitext(f)[0]: f for f in os.listdir(IMG)}
    k = key(url)
    f = tex_b64.idx.get(k) or next((v for kk, v in tex_b64.idx.items() if kk.endswith(k) or k.endswith(kk)), None)
    if not f: return None
    try: im = Image.open(IMG + '/' + f).convert('RGB').resize((size, size), Image.LANCZOS)
    except Exception: return None
    b = io.BytesIO(); im.save(b, 'JPEG', quality=72, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
# Alternativas cuando la malla original es un archivo vacío en la caché del mod
FB = {'we_sisters': ['Sisters of the Thorn', 'Sisters of the Thorn CH'], 'we_scouts': ['Deepwood Stout', 'Deepwood Stout CH'], 'we_waywatchers': ['Waywatcher CH'], 'we_weaver_unicorn': ['Spellsinger on Unicorn'], 'we_lord_hawk': ['Glade Captain Warhawk'], 'we_lord_eagle': ['Glade Captain on Great Eagle'], 'flagellants': ['Flagellanten', 'Flagellant', 'Flagellants CH'], 'emp_engineer': ['Engineer'], 'demigryph_knights': ['Demigryph Knights CH', 'Demigryph Knights MU'], 'inner_circle': ['Inner Circle Knights CH', 'Inner Circle Knights MU'], 'pistoliers': ['Pistoliers CH'], 'outriders': ['Outriders CH'], 'emp_archers': ['Empire Archers CH'], 'free_company': ['Free Company Militia CH'], 'br_yeomen': ['Mounted Yeomen CH'], 'br_realm_foot': ['Knights of the Realm on Foot CH'], 'dw_gyrobomber': ['Gyrobomber'], 'bm_giant': ['Giant', 'Giants'], 'he_spearmen': ['Elven Spearmen CH', 'Spearmen', 'Elven Spearmen MU'], 'he_archers': ['Elven Archers CH', 'Elven Archers MU'], 'he_seaguard': ['Lothern Sea Guard CH', 'Lothern Sea Guard MU'], 'he_whitelions': ['White Lions CH', 'White Lions MU'], 'he_swordmasters': ['Swordmasters CH', 'Swordmasters MU'], 'he_phoenix': ['Phoenix Guard CH', 'Phoenix Guard MU'], 'he_shadow': ['Shadow Warriors CH'], 'he_sisters': ['Sisters of Avelorn CH', 'Sisters of Avelorn MU'], 'he_reavers': ['Ellyrian Reavers CH', 'Ellyrian Reavers MU'], 'he_silverhelms': ['Silver Helms CH', 'Silver Helms MU'], 'he_dragonprinces': ['Dragon Princes MU', 'Dragon Princes ST'], 'he_prince_h': ['Noble on Steed'], 'empire_general_h': ['General of the Empire on Horse', 'Captain of the Empire on Horse'], 'empire_knights': ['Empire Knights MU', 'Empire Knights CH'],
      'orc_weirdboy': ['Orc Weirdnob', 'Maniak Weirdnob'], 'we_lord_h': ['Glade Lord on Elven Steed', 'Glade Captain on Elven Steed']}
out = {}; texcache = {}
for uid, nick in MAP.items():
    if only and uid not in only: continue
    if not (objs.get(nick) and objs[nick][1] > 0):
        for alt in FB.get(uid, []):
            if objs.get(alt) and objs[alt][1] > 0: print('  alternativa', uid, '->', alt); nick = alt; break
    o = objs.get(nick); o = o[0] if o else None
    if not o: print('FALTA', uid, nick); continue
    ps = [o['Transform']['scaleX'], o['Transform']['scaleY'], o['Transform']['scaleZ']]
    kids = [c for c in o.get('ChildObjects', []) if c.get('CustomMesh')]
    main = [c for c in kids if not clean(c.get('Nickname'))] or kids
    if not kids and o['CustomMesh'].get('MeshURL'):
        main = [dict(o, Transform=dict(posX=0, posY=0, posZ=0, rotX=0, rotY=0, rotZ=0, scaleX=1, scaleY=1, scaleZ=1))]; ps = [o['Transform']['scaleX']] * 3
    if uid in ('state_halberds', 'state_spears', 'state_swords', 'greatswords'): main = main[:1] if len(main) > 1 and False else main
    parts = []; allp = []
    for c in main:
        r = part_mesh(c, ps)
        if r is None: continue
        allp.append(r)
    if not allp: print('SIN MALLA', uid); continue
    mn = np.min([p[0].min(0) for p in allp], 0); mx = np.max([p[0].max(0) for p in allp], 0)
    tot = sum(len(p[2]) for p in allp)
    budget = int(os.environ.get('BUDGET', 0)) or (4200 if uid.startswith(('great_', 'rock', 'bolt', 'br_treb')) else 2600)
    for pos, uv, tri, dif in allp:
        tgt = max(200, int(budget * len(tri) / tot))
        npos, nuv, nt = decimate(pos, uv, tri, tgt)
        used = np.unique(nt); remap = -np.ones(len(npos), dtype=np.int64); remap[used] = np.arange(len(used))
        npos = npos[used]; nuv = nuv[used]; nt = remap[nt]
        if dif not in texcache: texcache[dif] = tex_b64(dif, 256)
        parts.append({'pos': npos, 'uv': nuv, 'tri': nt, 'tex': texcache[dif]})
    ext = mx - mn
    if ext[0] < 0.2 and ext[1] > 1.2:  # sólo hay estandarte: se exporta como bandera
        out['flag_' + uid] = {'parts': parts, 'min': mn, 'max': mx}; print('  -> bandera', uid); continue
    out[uid] = {'parts': parts, 'min': mn, 'max': mx}
    print(uid, nick, 'tri', sum(len(p['tri']) for p in parts), 'bbox', (mx - mn).round(2), 'tex', [bool(p['tex']) for p in parts])
# empaquetar
js = {}
for uid, m in out.items():
    mn, mx = m['min'], m['max']
    parts = []
    for p in m['parts']:
        q = np.clip(((p['pos'] - mn) / np.maximum(mx - mn, 1e-9) * 65535).round(), 0, 65535).astype('<u2')
        uvq = np.clip((np.mod(p['uv'], 1.0) if False else p['uv']) , -8, 8)
        uvq = ((uvq + 8) / 16 * 65535).round().astype('<u2')
        idx = p['tri'].astype('<u2').reshape(-1)
        parts.append({'p': base64.b64encode(q.tobytes()).decode(), 'u': base64.b64encode(uvq.tobytes()).decode(), 'i': base64.b64encode(idx.tobytes()).decode(), 'n': int(len(p['pos'])), 't': p['tex']})
    js[uid] = {'min': mn.round(4).tolist(), 'max': mx.round(4).tolist(), 'parts': parts}
txt = 'export const MODELS = ' + json.dumps(js, separators=(',', ':')) + ';\n'
open(ROOT + '/app/js/models.js' if not only else '/tmp/models_partial.js', 'w').write(txt)
print('KB', len(txt) // 1024)
