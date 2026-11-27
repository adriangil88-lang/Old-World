// v843o: resuelve las peanas «sin dato» y «dudosas» de v843n con (1) los libros ya locales (el índice rawidx no enlazó esas entradas) y (2) la web (tow.whfb.app, que reproduce el Arcane Journal con página y fecha).
// Entrada: out/base_table_v843n.tsv + out/base_summary_v843n.json (+ data.js actual). Salida: out/base_table_v843o.tsv + out/base_summary_v843o.json
import fs from 'fs';
const O = '/home/claude/tow/rules/verif/auto/out/';
const { UNITS } = await import('/home/claude/tow/app/js/data.js');
const eng = (id) => UNITS[id].baseW + 'x' + UNITS[id].baseD;
const RES = [
  // [ids, oficial, fuente, cat, accion]
  [['vc_count_dragon', 'vc_necro_dragon'], '100x150', 'leg_vampires.txt:858 (Zombie Dragon «Base Size: 100 x 150 mm»); GW Legacy PDF Vampire Counts 24.09 (assets.warhammer-community.com, consultado 2026-11-23)', 'corregido', 'CORREGIDO v843o: 60x100 → 100x150 (personaje montado = peana de la montura; mismo tamaño que el Terrorgheist del mismo libro)'],
  [['vc_count_terror', 'vc_necro_terror'], '50x100', 'leg_vampires.txt:928 (Abyssal Terror «Base Size: 50 x 100 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local; la v843n no la enlazó)'],
  [['de_dreadlord_dragon', 'de_supreme_dragon'], '60x100', 'leg_darkelves.txt:754 (Black Dragon «Base Size: 60 x 100 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['sk_hellpit'], '60x100', 'leg_skaven.txt:760 (Hell Pit Abomination «Base Size: 60 x 100 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['lm_oldblood_carno', 'lm_scar_carno'], '50x100', 'leg_lizardmen.txt:511 (Carnosaur «Base Size: 50 x 100 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['cd_prophet_bale'], '60x100', 'leg_chaosdwarfs.txt:502 (Bale Taurus «Base Size: 60 x 100 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['doom_diver'], '50x75', 'rh.txt:1715 (Doom Diver Catapult «50 x 75 mm (war machine), 25 x 25 mm (crew)»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['tk_carrion'], '40x40', 'rh.txt:5807 (Carrion «Base Size: 40 x 40 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['dw_impmerc'], '25x25', 'aj_dwarfs.txt:1215 (Imperial Dwarf Mercenaries «Base Size: 25 x 25 mm»)', 'coincide', 'coincide (v843o: entrada hallada en el libro local)'],
  [['dw_king_shield'], '50x50', 'fof.txt:416 (Shieldbearers «Base Size: 50 x 50 mm»; «un modelo con Shieldbearers ... ocupa una única peana»)', 'coincide', 'coincide (v843o: la DUDOSA de v843n enlazaba Dwarf King 25x25; la regla Shieldbearers fija 50x50 para el modelo completo)'],
  [['gob_warboss_spider', 'gob_bigboss_spider'], '50x50', 'rh.txt:743 (Gigantic Spider «Base Size: 50 x 50 mm»; rh.txt:696 «A Goblin Warboss or Bigboss may be mounted on a Gigantic Spider»)', 'coincide', 'coincide (v843o: la DUDOSA de v843n enlazaba la Giant Spider de los Spider Riders 25x50; el libro sí permite Gigantic Spider a Warboss/Bigboss goblin)'],
  [['rc_prince'], '25x25', 'tow.whfb.app/unit/renegade-prince (AJ The War of Settra\'s Fury p.38, «Last update: 2025 October 30»)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_prince_h', 'rc_captain_h'], '30x60', 'Barded Warhorse «Base Size: 30 x 60 mm» (tow.whfb.app/unit/barded-warhorse: FoF p.55 y AJ War of Settra\'s Fury p.38, 2025-10-30); rh/fof Warhorse 30x60', 'coincide', 'coincide (v843o: montura = peana de la montura)'],
  [['rc_captain'], '25x25', 'tow.whfb.app/unit/renegade-captain (AJ War of Settra\'s Fury, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_wizard2', 'rc_wizard3'], '25x25', 'tow.whfb.app/unit/outcast-wizard (AJ Kingdom of Bretonnia p.42, «Last update: 2024 February 23»)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_wizard1_h', 'rc_wizard2_h', 'rc_wizard3_h'], '30x60', 'tow.whfb.app Outcast Wizard «mounted on a Warhorse» (AJ Bretonnia p.42, 2024-02-23) + Warhorse 30x60 (FoF p.55 / AJ Settra p.38, 2025-10-30)', 'coincide', 'coincide (v843o: montura = peana de la montura)'],
  [['rc_sellswords', 'rc_sellswords_ph'], '25x25', 'tow.whfb.app/unit/sellsword-infantry (AJ War of Settra\'s Fury p.39, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_vsellswords', 'rc_vsellswords_ph'], '25x25', 'tow.whfb.app/unit/veteran-sellswords (AJ War of Settra\'s Fury p.39, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_freeblades'], '30x60', 'tow.whfb.app/unit/freeblade-knights (AJ War of Settra\'s Fury p.40, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_vfreeblades'], '30x60', 'tow.whfb.app/unit/veteran-freeblades (AJ War of Settra\'s Fury p.40, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_outriders'], '30x60', 'tow.whfb.app/unit/hireling-outriders (AJ War of Settra\'s Fury p.41, «Last update: 2026 April 13»)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_mortar'], '50x75', 'tow.whfb.app/unit/border-princes-mortar (AJ War of Settra\'s Fury p.42, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_organ'], '50x50', 'tow.whfb.app/unit/border-princes-organ-gun (AJ War of Settra\'s Fury p.42, 2025-10-30)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['rc_bombard'], '50x50', 'tow.whfb.app/unit/border-princes-bombard (AJ Kingdom of Bretonnia p.45, «Last update: 2024 August 11»)', 'coincide', 'coincide (v843o: dato web = Arcane Journal)'],
  [['dw_anvil'], 'N/A', 'fof.txt:445 «Base Size: N/A»; también «Base not stated in the book» (impriwars.com/en/pages/peanas-the-old-world, 2026)', 'sin_dato', 'sin dato OFICIAL (N/A): ni libro ni FAQ fijan peana; el motor conserva 60x60 como huella de convención (necesaria para movimiento, LdV y colisión)'],
  [['tk_casket'], 'N/A', 'rh.txt:6398 «Base Size: N/A»; tow.whfb.app/army/tomb-kings-of-khemri/reference «N/A» (2026-11-23)', 'sin_dato', 'sin dato OFICIAL (N/A): el motor conserva 60x60 como huella de convención'],
  [['cd_mortar', 'cd_mortar_hb'], 'N/A', 'leg_chaosdwarfs.txt:613 «Base Size: N/A»; GW Legacy PDF Chaos Dwarfs (warhammer-community.com/wp-content/uploads/2024/01/lh5Vwam4VMzKMRgg.pdf, © 2024) «Base Size: N/A»; foro chaos-dwarfs.com (2024-02-02, 2025-10-12): comunidad 60x100 o 50x100, no oficial', 'sin_dato', 'sin dato OFICIAL (N/A): el motor conserva 50x75 como huella de convención; la comunidad propone 50x100/60x100 (no oficial, no se aplica)'],
  [['bm_herdstone'], '—', 'aj_beasts.txt (la Herdstone es un marcador/icono, sin perfil ni «Base Size»)', 'sin_dato', 'sin dato: marcador de escenografía, no unidad con perfil; 6x6 es una huella interna'],
  [['de_beastmaster'], '(as mount)', 'leg_darkelves.txt:164 «Base Size: (as mount)»; Scourgerunner Chariot 50x100 (leg_darkelves.txt:677); Manticore: peana de la montura', 'sin_dato', 'sin dato propio: el libro dice «as mount» (siempre va montado); las variantes montadas ya usan la peana de la montura; la entrada a pie 25x25 es solo huella interna'],
];
const rows = fs.readFileSync(O + 'base_table_v843n.tsv', 'utf8').split('\n'); const head = rows[0], body = rows.slice(1).filter(Boolean).map((l) => l.split('\t'));
const sum = JSON.parse(fs.readFileSync(O + 'base_summary_v843n.json', 'utf8'));
const map = new Map(); for (const [ids, off, src, cat, act] of RES) for (const id of ids) map.set(id, { off, src, cat, act });
let n = 0;
for (const r of body) { const m = map.get(r[0]); if (!m) continue; r[1] = eng(r[0]); r[2] = m.off; r[3] = m.src; r[4] = m.act; const o = sum.out[r[0]]; sum.sum[o.cat]--; o.e = r[1]; o.off = m.off; o.src = m.src; o.act = m.act; o.cat = m.cat; sum.sum[m.cat]++; n++; map.delete(r[0]); }
for (const r of body) { const o = sum.out[r[0]]; if (o) o.e = r[1] = eng(r[0]); }
if (map.size) throw new Error('ids sin fila: ' + [...map.keys()]);
fs.writeFileSync(O + 'base_table_v843o.tsv', [head, ...body.map((r) => r.join('\t'))].join('\n') + '\n');
fs.writeFileSync(O + 'base_summary_v843o.json', JSON.stringify(sum));
console.log(n, 'filas resueltas', JSON.stringify(sum.sum));
