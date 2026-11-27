// v843o — peanas «sin dato» y «dudosas» de v843n resueltas con libros locales + web (tow.whfb.app = Arcane Journal, GW Legacy PDF): ninguna dudosa; solo quedan las que el libro marca N/A / marcador
import { T, DATA, ok, eq } from '../lib2.mjs';
import fs from 'fs';
const U0 = DATA.UNITS;
const SUM = JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/out/base_summary_v843o.json', 'utf8'));
const rows = fs.readFileSync('/home/claude/tow/rules/verif/auto/out/base_table_v843o.tsv', 'utf8').split('\n').slice(1).filter(Boolean).map((l) => l.split('\t'));
const B = (id) => [U0[id].baseW, U0[id].baseD];
T('v843o-peana-zombie-dragon', 'leg_vampires.txt:858 (Zombie Dragon «Base Size: 100 x 150 mm»); GW Legacy PDF Vampire Counts 24.09', 'El personaje montado en Dragón Zombi usa la peana de la montura (100x150), igual que el Terrorgheist; el Terror Abisal sigue en 50x100', () => {
  eq(B('vc_count_dragon'), [100, 150]); eq(B('vc_necro_dragon'), [100, 150]); eq(B('vc_terrorgheist'), [100, 150]);
  eq(B('vc_count_terror'), [50, 100]); eq(B('vc_necro_terror'), [50, 100]);
});
T('v843o-peana-dudosas', 'fof.txt:416 (Shieldbearers 50x50), rh.txt:743 (Gigantic Spider 50x50) + rh.txt:696 (Warboss/Bigboss pueden montarla)', 'Las 3 dudosas de v843n quedan resueltas por el libro: Rey con Escoltas de escudo 50x50; Warboss/Bigboss goblin sobre Araña gigante 50x50', () => {
  eq(B('dw_king_shield'), [50, 50]); eq(B('gob_warboss_spider'), [50, 50]); eq(B('gob_bigboss_spider'), [50, 50]);
  eq(SUM.sum.dudosa, 0, 'no quedan dudosas');
});
T('v843o-peana-sin-dato-reales', 'libros (N/A) + GW Legacy PDF Chaos Dwarfs (N/A) + tow.whfb.app', 'Solo quedan sin dato oficial las peanas que el libro declara N/A (Anvil of Doom, Casket of Souls, Dreadquake Mortar x2), el marcador Herdstone y el Gran Maestro de Bestias («as mount»): 6 unidades, todas explicadas, con su huella de convención', () => {
  const sin = Object.entries(SUM.out).filter(([, o]) => o.cat === 'sin_dato').map(([id]) => id).sort();
  eq(sin, ['bm_herdstone', 'cd_mortar', 'cd_mortar_hb', 'de_beastmaster', 'dw_anvil', 'tk_casket']);
  for (const id of ['dw_anvil', 'tk_casket', 'cd_mortar', 'cd_mortar_hb']) ok(/N\/A/.test(SUM.out[id].src + SUM.out[id].act), 'N/A: ' + id);
  eq(B('dw_anvil'), [60, 60]); eq(B('tk_casket'), [60, 60]); eq(B('cd_mortar'), [50, 75]); eq(B('cd_mortar_hb'), [50, 75]);
});
T('v843o-peana-renegade', 'tow.whfb.app (AJ War of Settra\'s Fury p.38-42, 2025-10-30 / 2026-04-13; AJ Bretonnia p.42/45)', 'Las 19 unidades de Renegade Crowns tienen ya fuente oficial con página y fecha y su peana coincide con la del Arcane Journal', () => {
  const W = { rc_prince: [25, 25], rc_prince_h: [30, 60], rc_captain: [25, 25], rc_captain_h: [30, 60], rc_wizard2: [25, 25], rc_wizard3: [25, 25], rc_wizard1_h: [30, 60], rc_wizard2_h: [30, 60], rc_wizard3_h: [30, 60], rc_sellswords: [25, 25], rc_vsellswords: [25, 25], rc_sellswords_ph: [25, 25], rc_vsellswords_ph: [25, 25], rc_freeblades: [30, 60], rc_vfreeblades: [30, 60], rc_outriders: [30, 60], rc_mortar: [50, 75], rc_organ: [50, 50], rc_bombard: [50, 50] };
  for (const [id, wd] of Object.entries(W)) { eq(B(id), wd, id); const r = rows.find((x) => x[0] === id); ok(r && /tow\.whfb\.app|Warhorse/.test(r[3]) && /20(24|25|26)/.test(r[3]), 'fuente web con fecha: ' + id); }
});
