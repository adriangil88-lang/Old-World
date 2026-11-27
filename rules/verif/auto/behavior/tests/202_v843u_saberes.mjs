// v843u (punto 2) — los Saberes que ofrece el juego a cada Mago son EXACTAMENTE los de su «Magic:» del libro (+ las ampliaciones expresas); lista de hechizos de cada Saber completa
import { T, R, DATA, game, U, ok, eq } from '../lib2.mjs';
const { UNITS, LORES, SPELLS } = DATA;
const S6 = ['battle', 'daemonology', 'dark', 'elementalism', 'illusion', 'necro'];
// [ids (prefijo o lista), Saberes, fuente]
export const SRC = [
  [['empire_lord', 'empire_mage', 'rc_wizard'], S6, 'FoF p.? (Wizard Lord / Master Mage) y AJ Renegade Crowns (Outcast Wizard)'],
  [['br_outcast'], S6, 'AJ Bretonnia (Outcast Wizard)'],
  [['br_damsel', 'br_prophetess'], ['battle', 'elementalism', 'illusion'], 'FoF (Handmaiden of the Lady)'],
  [['br_elisse'], ['elementalism'], 'AJ Bretonnia (Lady Élisse: Lore of Elementalism)'],
  [['he_archmage', 'he_mage'], ['high', 'battle', 'elementalism', 'illusion'], 'FoF p.? (High Elf Mage)'],
  [['he_dragonmage'], ['battle', 'elementalism'], 'FoF (Dragon Mage)'],
  [['he_stormweaver'], ['dark', 'elementalism', 'illusion'], 'AJ Altos Elfos (Storm Weaver)'],
  [['we_spellsinger', 'we_spellweaver', 'we_singer_unicorn', 'we_weaver_unicorn'], ['battle', 'elementalism', 'high', 'illusion'], 'FoF (Wood Elf Mage)'],
  [['we_branchwraith'], ['battle', 'elementalism', 'illusion'], 'FoF (Branchwraith)'],
  [['we_ancient'], ['battle', 'elementalism'], 'FoF (Treeman Ancient)'],
  [['we_shadowdancer_w'], ['battle', 'illusion'], 'FoF (Shadowdancer)'],
  [['we_sisters'], ['battle', 'elementalism'], 'FoF (Sisters of the Thorn: Bound de Batalla o Elementalismo)'],
  [['orc_weirdboy', 'orc_weirdnob'], ['battle', 'elementalism', 'waaagh'], 'RH (Orc Shaman)'],
  [['gob_odd'], ['elementalism', 'waaagh'], 'RH (Goblin Shaman)'],
  [['ng_odd'], ['illusion', 'waaagh'], 'RH (Night Goblin Shaman)'],
  [['troll_hag'], ['battle', 'troll'], 'AJ Orcos (Troll Hag)'],
  [['orc_ogdruz'], ['elementalism', 'troll'], 'AJ Orcos (Ogdruz)'],
  [['bm_bs', 'bm_gbs'], ['daemonology', 'dark', 'elementalism'], 'RH (Beastman Shaman)'],
  [['bm_kralmaw'], ['dark', 'primal'], 'AJ Bestias (Kralmaw)'],
  [['woc_sorc_lord', 'woc_ex_sorc', 'woc_sorc_manticore', 'woc_sorc_daemon', 'woc_exsorc_daemon'], ['battle', 'daemonology', 'dark', 'shadowlands'], 'RH (Sorcerer of Chaos) + AJ Westerland (Shadowlands)'],
  [['woc_dprince'], ['battle', 'daemonology', 'dark'], 'RH (Daemon Prince)'],
  [['woc_galrauch'], ['dark'], 'AJ Caos (Galrauch)'],
  [['tk_hpriest', 'tk_mpriest'], ['elementalism', 'illusion', 'necro'], 'RH (Liche Priest)'],
  [['tk_settra'], ['necro'], 'AJ TK (Settra: Lore of Necromancy)'],
  [['vc_count', 'vc_thrall', 'vc_necro', 'vc_acolyte'], ['dark', 'illusion', 'necro'], 'Legends Vampire Counts (Vampire / Necromancer)'],
  [['vc_ghoulking'], ['battle', 'dark', 'necro'], 'Legends Vampire Counts (Strigoi Ghoul King)'],
  [['vc_corpsecart'], ['necro'], 'Legends Vampire Counts (Corpsemaster: «a spell from the Necromancy Lore»)'],
  [['lm_slann'], ['battle', 'elementalism', 'high', 'illusion', 'necro'], 'Legends Lizardmen (Slann)'],
  [['lm_skpriest'], ['battle', 'elementalism', 'illusion'], 'Legends Lizardmen (Skink Priest)'],
  [['lm_troglodon'], ['battle', 'illusion'], 'Legends Lizardmen (Skink Oracle)'],
  [['ok_butcher', 'ok_slaughter'], ['battle', 'elementalism', 'illusion'], 'Legends Ogres (Slaughtermaster / Butcher)'],
  [['ok_firebelly'], ['battle', 'elementalism'], 'Legends Ogres (Firebelly)'],
  [['sk_greyseer'], ['battle', 'daemonology', 'dark', 'elementalism', 'illusion'], 'Legends Skaven (Grey Seer)'],
  [['sk_engineer'], ['battle', 'elementalism'], 'Legends Skaven (Warlock Engineer)'],
  [['sk_plaguepriest'], ['battle', 'daemonology', 'dark'], 'Legends Skaven (Plague Priest)'],
  [['de_sorceress', 'de_supreme'], ['battle', 'daemonology', 'dark', 'elementalism', 'illusion'], 'Legends Dark Elves (Sorceress)'],
  [['de_warlocks'], ['dark', 'daemonology'], 'Legends Dark Elves (Doomfire Warlocks: Bound de Oscura o Demonología)'],
  [['cd_daemonsmith', 'cd_prophet'], ['daemonology', 'dark', 'elementalism'], 'Legends Chaos Dwarfs (Sorcerer of Hashut)'],
  [['dm_gud', 'dm_herald_nurgle', 'dm_prince'], ['battle', 'daemonology', 'dark'], 'Legends Daemons (Great Unclean One / Herald of Nurgle / Daemon Prince)'],
  [['dm_herald_tzeentch', 'dm_lordchange'], ['battle', 'daemonology', 'dark', 'elementalism', 'illusion'], 'Legends Daemons (Herald of Tzeentch / Lord of Change)'],
  [['dm_keeper', 'dm_herald_slaanesh'], ['daemonology', 'dark', 'illusion'], 'Legends Daemons (Keeper / Herald of Slaanesh)'],
  [['dm_flamers', 'dm_burning'], ['daemonology', 'dark', 'elementalism', 'illusion'], 'Legends Daemons (Exalted Flamer)'],
  [['ct_shugengan'], ['battle', 'elementalism', 'illusion', 'high'], 'AJ Cathay (Shugengan)'],
  [['vc_knightshrouds'], ['necro'], 'sin fuente local (Caballero de las Mortajas: reglas reconstruidas; se deja su Saber propio)'],
  [['woc_warpfire'], ['battle', 'daemonology', 'dark'], 'sin fuente local (Dragón Warpfire)'],
  [['ct_miaoying'], ['battle', 'elementalism', 'high'], 'AJ Cathay (Miao Ying)'],
];
T('v843u-saberes-segun-libro', 'rules.js loresForWiz + data.js', 'Cada Mago ofrece SOLO los Saberes de su «Magic:» del libro (ni más ni menos): se compara con una tabla fuente por unidad', () => {
  const s = { lists: ['grand', 'grand'] }; let n = 0; const fails = [];
  for (const [ids, lores, src] of SRC) for (const id of Object.keys(UNITS).filter((k) => ids.some((p) => k === p || k.startsWith(p)))) {
    const d = UNITS[id]; if (!d.wizard) continue; n++;
    const got = R.loresForWiz(s, 0, d, []).slice().sort().join(','), want = lores.slice().sort().join(',');
    if (got !== want) fails.push(`${id}: ofrece [${got}] y el libro (${src}) dice [${want}]`);
  }
  ok(n > 100, 'unidades comprobadas: ' + n); ok(!fails.length, fails.join(' | '));
});
T('v843u-saberes-ninguno-inexistente', 'rules.js loresForWiz', 'Todos los Saberes que ofrece un Mago existen (con firma y seis hechizos); nunca una clave sin tabla', () => {
  const s = { lists: ['grand', 'grand'] }; const bad = [];
  for (const [id, d] of Object.entries(UNITS)) if (d.wizard && !(d.boundSpells && !d.lores)) for (const l of R.loresForWiz(s, 0, d, [])) { const L = LORES[l]; if (!L || !SPELLS[L.sig] || L.pool.slice(0, 6).length < 6 || !L.pool.slice(0, 6).every((k) => SPELLS[k])) bad.push(id + ':' + l); }
  ok(!bad.length, bad.slice(0, 8).join(', '));
});
T('v843u-saberes-ampliaciones', 'rules.js loresForWiz', 'Ampliaciones expresas: Saber de los Salvajes (Hueste de Talsyn / Colgante de Duramen), Magia Troll (Horda de Trolls: Chamanes Orcos y Goblins; Brebaje de la Bruja), Primigenia (Manada Salvaje / Diente Sangriento)', () => {
  const sp = UNITS.we_spellsinger, ng = UNITS.ng_oddgit, go = UNITS.gob_oddgit, ow = UNITS.orc_weirdboy, bs = UNITS.bm_bs;
  const L = (st, d, it = [], o = 0) => R.loresForWiz({ lists: st }, o, d, it);
  ok(!L(['grand', 'grand'], sp).includes('wilds'), 'sin Talsyn no hay Salvajes'); ok(L(['talsyn', 'grand'], sp).includes('wilds'), 'Talsyn sí'); ok(L(['grand', 'grand'], sp, ['heartwood']).includes('wilds'), 'Colgante de Duramen');
  ok(!L(['talsyn', 'grand'], UNITS.we_shadowdancer_w).includes('wilds'), 'el Danzante de las Sombras no (el libro nombra Magos, Ancianos y Hechiceras Rama)');
  ok(!L(['grand', 'grand'], go).includes('troll') && L(['trollh', 'grand'], go).includes('troll') && L(['trollh', 'grand'], ow).includes('troll') && !L(['trollh', 'grand'], ng).includes('troll'), 'Troll: Chamanes Orcos y Goblins en Horda de Trolls');
  ok(L(['grand', 'grand'], go, ['aj_hagbrew']).includes('troll'), 'Brebaje');
  ok(!L(['grand', 'grand'], bs).includes('primal') && L(['wild', 'grand'], bs).includes('primal') && L(['grand', 'grand'], bs, ['bmaj_goretooth']).includes('primal'), 'Primigenia');
});
T('v843u-saber-humano-solo-ofrecidos', 'rules.js createGame (loreAlt)', 'El selector de Saber de la partida (loreAlt.opts) sólo contiene Saberes que el Mago puede elegir', () => {
  for (const [k, f, f2] of [['empire_mage', 'empire', 'orcs'], ['he_mage', 'he', 'orcs'], ['we_spellsinger', 'wood', 'orcs'], ['woc_sorc_lord', 'woc', 'orcs'], ['sk_greyseer', 'sk', 'orcs'], ['orc_weirdnob', 'orcs', 'empire'], ['vc_necromancer', 'vc', 'orcs'], ['lm_slann', 'lm', 'orcs']]) {
    if (!UNITS[k]) continue;
    const s = game([{ type: k, models: 1 }], [{ type: f2 === 'orcs' ? 'orc_boyz' : 'state_troops', models: 10 }], { f: [f, f2], phase: 'deploy' }); const u = U(s, k, 0);
    const al = R.loresForWiz(s, 0, UNITS[k], u.items || []);
    ok(al.includes(u.lore), k + ': Saber actual permitido');
    if (u.loreAlt) ok(u.loreAlt.opts.every((l) => al.includes(l)) && u.loreAlt.opts.includes(u.lore), `${k}: opts [${u.loreAlt.opts}] ⊆ [${al}]`);
    if (k === 'empire_mage') eq(al.slice().sort(), S6.slice().sort(), 'Maestro Mago del Imperio: 6 Saberes (FoF)');
    if (k === 'vc_necromancer') eq(al.slice().sort(), ['dark', 'illusion', 'necro'], 'Nigromante: Oscura, Ilusión, Nigromancia (antes la clave «necromancy» no existía y sólo salían 2)');
  }
});
T('v843u-hechizos-saber-completos', 'data.js LORES/SPELLS', 'Cada Saber tiene seis hechizos numerados + firma, con VL, tipo y efecto en español (lo que muestra «ⓘ Hechizos»)', () => {
  const bad = [];
  for (const [ln, L] of Object.entries(LORES)) { if ((L.pool || []).length < 6) continue; for (const k of [L.sig, ...L.pool.slice(0, 6)]) { const sp = SPELLS[k]; if (!sp) { bad.push(ln + ':' + k); continue; } if (!(sp.cv > 0) && !sp.bound) bad.push(ln + ':' + k + ' sin VL'); if (!sp.type) bad.push(ln + ':' + k + ' sin tipo'); if ((sp.text || '').length < 25) bad.push(ln + ':' + k + ' sin efecto'); if (/\b(the|your|until|target)\b/i.test(sp.text || '')) bad.push(ln + ':' + k + ' en inglés'); } }
  ok(!bad.length, bad.slice(0, 8).join(', '));
});
