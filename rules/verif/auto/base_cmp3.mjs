// v843n: contraste de la peana de las unidades que v843l/m no pudieron equiparar por bloque de estadísticas.
// Método: cada id se enlaza (tabla RULES: regex de id -> nombre de fila del libro, rol y fichero) con su entrada en el índice de «Base Size» de los libros (blocks.json + rawidx.json);
// se compara con la peana del motor. Orden de autoridad: FAQ/erratas (FAQ_BASE) > Legends/Arcane Journal > libro base.
// Salida: out/base_table_v843n.tsv (todas las unidades) y out/base_summary_v843n.json. Uso: node base_cmp3.mjs
import { UNITS, BASE_RANGE } from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const R = '/home/claude/tow/rules/verif/auto/out/';
const blocks = JSON.parse(fs.readFileSync(R + 'blocks.json'));
const raw = JSON.parse(fs.readFileSync(R + 'rawidx.json'));
const prev = fs.readFileSync(R + 'base_table_v843m.tsv', 'utf8').split('\n').slice(1).filter(Boolean).map(l => l.split('\t'));
const prevMap = Object.fromEntries(prev.map(r => [r[0], r]));
const parseBases = (s) => { const out = []; const re = /(\d+)\s*(?:mm)?\s*x\s*(\d+)\s*(?:mm)?\s*(\(([^)]*)\))?/gi; let m; while ((m = re.exec(s || ''))) out.push({ v: m[1] + 'x' + m[2], label: (m[4] || '').toLowerCase() }); return out; };
// índice unificado
const IDX = [];
for (const b of blocks) IDX.push({ names: b.rows.map(r => r.name), bases: parseBases(b.base), src: `${b.f.replace('new/', '')}:${b.ln}`, ln: b.ln, f: b.f.replace('new/', '') });
for (const r of raw) IDX.push({ names: r.names, bases: r.bases, src: `${r.f.replace('new/', '')}:${r.ln}`, ln: r.ln, f: r.f.replace('new/', '') });
const pick = (vs, role) => {
  if (!vs.length) return [];
  if (vs.length === 1 || role === 'all') return vs;
  if (role === 'hound') return vs.filter(x => /hound/.test(x.label)).slice(0, 1);
  if (role === 'crew') return vs.filter(x => /crew|handler|gunner/.test(x.label)).slice(0, 1);
  if (role === 'min') return vs.filter(x => /min/.test(x.label)).slice(0, 1);
  if (role === 'max') return vs.filter(x => /max/.test(x.label)).slice(0, 1);
  const nc = vs.filter(x => !/crew|handler/.test(x.label)); return nc.length ? nc.slice(0, 1) : vs.slice(0, 1);
};
function find(nameRe, role, fileRe) {
  const rx = new RegExp(nameRe, 'i'), fr = fileRe && new RegExp(fileRe); const got = new Map();
  for (const e of IDX) { if (fr && !fr.test(e.f)) continue; if (!e.names.some(n => rx.test(n)) && !rx.test(e.names.join('/'))) continue; for (const v of pick(e.bases, role)) { const k = v.v + '|' + e.src; if (!got.has(k)) got.set(k, { v: v.v, src: e.src, range: /min|max/.test(v.label) }); } }
  return [...got.values()];
}
const lit = (v, src) => [{ v, src }];
const N = (re, role, f) => () => find(re, role, f);
const L = (v, src) => () => lit(v, src);
const NONE = (why) => () => [{ none: why }];
// FAQ (mandan sobre el libro)
const FAQ_BASE = { woc_hellcannon: ['100x150', 'FAQ RH p.46 «Hellcannon»'], woc_skinwolves: ['50x50', 'FAQ RH «Skin Wolves»'], woc_chieftain: ['30x30', 'FAQ RH «Marauder Tribe Chieftain»'], dw_hewer: ['50x75', 'FAQ FoF AJ Dwarfen Mountain Holds p.46 «Goblin Hewers»'] };
// v843n: correcciones INEQUÍVOCAS aplicadas en data.js (bloque «v843n peanas»): id -> [peana anterior, peana oficial, fuente]
export const FIX = {
  tk_catapult: ['25x25', '60x100', 'rh.txt:6348 (Screaming Skull Catapult: 60 x 100 mm máquina, 25 x 25 dotación)'],
  dm_pinkhorrors: ['25x25', '30x30', 'leg_daemons.txt:772 (Pink Horror / Iridescent Horror: 30 x 30 mm)'],
  dm_plaguedrones: ['40x40', '50x75', 'leg_daemons.txt:461 (Plaguebearer/Plagueridden sobre Rot Fly: 50 x 75 mm, caballería monstruosa)'],
  dm_soulgrinder: ['100x150', '150x100', 'leg_daemons.txt:1017 (Soul Grinder: 150 x 100 mm, literal del libro)'],
  dm_herald_khorne_jug: ['30x60', '50x75', 'leg_daemons.txt:162 y :219 (Juggernaut of Khorne: 50 x 75 mm; personaje montado = peana de la montura)'],
  dm_herald_tzeentch_disc: ['40x40', '50x50', 'leg_daemons.txt:761 (Disc of Tzeentch: 50 x 50 mm; personaje montado = peana de la montura)'],
  we_weaver_unicorn: ['25x25', '40x60', 'fof.txt:4975 (Unicorn: 40 x 60 mm; personaje montado = peana de la montura)'],
  we_singer_unicorn: ['25x25', '40x60', 'fof.txt:4975 (Unicorn: 40 x 60 mm; personaje montado = peana de la montura)'],
  he_stormweaver_uni: ['25x25', '40x60', 'fof.txt:3579 / :4975 (Unicorn: 40 x 60 mm; personaje montado = peana de la montura)'],
};
const RULES = [
  // ---- Imperio
  [/^(empire_general|empire_captain|empire_lord)$/, N('General of the Empire', 'first', 'fof')], [/^empire_mage$/, N('Wizard Lord')], [/^emp_witchhunter$/, N('^Witch Hunter')], [/^emp_priest$/, N('Lector of Sigmar')], [/^emp_(ulric|hulric)$/, N('High Priest of Ulric')],
  [/^(empire_general_h|emp_grandmaster|emp_chaptermaster)$/, N('^Barded Warhorse$', 'first', 'fof')], [/^empire_(general|captain|lord)_peg$/, N('Pegasus', 'first', 'fof')], [/^state_troops$/, L("25x25", "fof.txt:2236 (State Troops: 25 x 25 mm)")], [/^empire_(general|captain|lord)_demi$/, N('^Demigryph Knight')],
  [/^emp_general_griffon$/, L('50x50', 'fof.txt:2845 (Griffon: 50 x 50 mm)')], [/^emp_general_igriffon$/, L('60x100', 'fof.txt:2845 (Imperial Griffon: 60 x 100 mm)')],
  [/^(crossbowmen|handgunners)$/, N('State Missile Trooper')], [/^free_company$/, N('Militia Fighter')], [/^empire_knights(_ww)?$/, N('^Empire Knight')], [/^pistoliers$/, N('^Outrider')], [/^inner_circle(_ww)?$/, N('^Inner Circle Knight')],
  [/^steam_tank$/, N('Steam Tank', 'first', 'fof')], [/^mortar$/, N('^Mortar', 'first', 'fof')], [/^helblaster$/, N('Helblaster')], [/^helstorm$/, N('Helstorm')], [/^great_cannon$/, N('^Great Cannon')], [/^(war_wagon|emp_engineer_wagon)$/, N('^War Wagon')],
  [/^emp_lector_altar$/, N('^War Altar')], [/^road_wardens_p$/, N('^Road Warden')],
  // ---- Orcos y goblins
  [/^orc_warboss_boar$|^orc_bigboss_boar$|^black_(warboss|bigboss)_boar$|^orc_weird(boy|nob)_boar$/, N('^War Boar$', 'first', 'rh')], [/^orc_bigboss$/, N('^Orc Warboss', 'first', 'rh')], [/^orc_weirdboy$/, N('Orc Weirdnob', 'first', 'rh')], [/^black_bigboss$/, N('Black Orc Warboss')], [/^gob_bigboss$/, N('^Goblin Warboss')], [/^gob_(oddgit|oddnob)$/, N('Goblin Oddnob')], [/^ng_bigboss$/, N('Night Goblin Warboss')], [/^ng_oddgit$/, N('Night Goblin Oddnob')],
  [/^gob_(warboss|bigboss)_spider$/, N('^Giant Spider$|^Spider Rider', 'first', 'rh')], [/^gob_(warboss|bigboss|oddnob|oddgit)_wolf(_amb)?$/, N('^Giant Wolf$', 'first', 'rh')],
  [/^orc_warboss_wyvern$/, N('Wyvern', 'first', 'rh')],
  [/^orc_(twin|arrers|bigs|frenzy)$/, N('^Orc Boy', 'first', 'rh')], [/^night_goblins(_net|_fan)?$/, N('^Night Goblin/Boss', 'first', 'rh')], [/^snotlings$/, N('Snotling', 'first', 'rh')], [/^squig_herd$/, N('Squig Herder')], [/^(river|stone)_trolls$/, N('Stone Troll', 'first', 'rh')],
  [/^wolf_riders_amb(_hp)?$/, N('^Wolf Rider')], [/^boar_(boyz|bigs)$/, N('^Boar Boy')], [/^(black_chariot|orc_boar_chariot|black_(warboss|bigboss)_chariot)$/, N('^Chariot/Black Orc Crew', 'first', 'aj_orcs')], [/^wolf_chariot$/, N('^Chariot/Goblin Crew', 'first', 'rh')],
  [/^rock_lobber$/, N('^Rock Lobber', 'first', 'rh')], [/^bolt_throwa$/, N('^Bolt Throwa', 'first', 'rh')], [/^goods_cart$/, N('Goods Cart', 'first')], [/^arachnarok$/, N('^Arachnarok')], [/^doom_diver/, NONE('el Doom Diver Catapult no tiene entrada en los libros extraídos (solo en el Legends original, no entregado)')],
  [/^bm_herdstone$/, NONE('la Herdstone no es un modelo con peana de unidad en los libros extraídos (marcador)')],
  // ---- Elfos silvanos
  [/^we_(lord|captain)$/, N('Glade Lord', 'first', 'fof')], [/^we_(lord|captain)_h$/, N('Elven Steed|Steed of Kurnous', 'first', 'fof')], [/^we_spellsinger$/, N('Spellweaver')], [/^we_(glade_guard|scouts)$/, N('Eternal Guard|Wildwood Ranger|Deepwood Scout', 'first', 'fof')], [/^we_eternal$/, N('Eternal Guard')],
  [/^we_glade_riders(_sk)?$/, N('Cavalry Glade Rider')], [/^we_wild_riders$/, N('^Wild Rider')], [/^we_treekin(_amb)?$/, N('Tree Kin')], [/^we_(lord|captain)_stag$/, N('Great Stag|Stag', 'first', 'fof')],
  [/^we_lord_dragon$/, N('Forest Dragon|Dragon', 'first', 'fof')], [/^we_lord_eagle$/, N('Great Eagle', 'first', 'fof')], [/^we_captain_hawk$/, N('Warhawk')], [/^we_(weaver|singer)_unicorn$/, N('Unicorn', 'first', 'fof')],
  [/^we_shadowdancer_w$/, N('Shadowdancer')], [/^we_araloth$/, N('Araloth')], [/^we_sisters$/, N('Sister of the Thorn')], [/^we_orion_hounds$/, N('Orion', 'hound')], [/^we_pack_(cats|boars|bears)(_sk)?$/, N('Deepwood Hound')], [/^we_beastkeeper$/, N('Beast Keeper')], [/^we_dryads_amb$/, N('Dryad')],
  // ---- Bretonia
  [/^br_(duke|baron|paladin)$/, N('Bretonnian Warhorse', 'first', 'fof')], [/^br_(duke|baron|paladin)_foot$/, N('Character Duke|Duke/Baron', 'first', 'fof')], [/^br_(duke|baron|paladin)_peg$/, N('Barded Pegasus', 'first', 'fof')], [/^br_(duke|baron|paladin|prophetess)_(rpeg|pegasus)$|^br_baron_pegasus$/, N('Royal Pegasus', 'first', 'fof')], [/^br_(duke|baron)_hippo$/, N('Hippogryph|Royal Pegasus|Pegasus', 'first', 'fof')],
  [/^br_yeomen$/, N('Mounted Yeoman')], [/^br_damsel$/, N('Prophetess|Damsel', 'first', 'fof')], [/^br_elisse$/, N('Élisse')], [/^br_outcast[23]?$/, N('Outcast Wizard')], [/^br_pilgrims(_rel)?$/, N('Battle Pilgrims', 'first', 'fof')], [/^br_pegasus$/, N('Pegasus Knight')],
  [/^br_bombard$/, N('^Bombard')], [/^br_brigands_bb$/, N('^Brigand')], [/^br_trebuchet$/, N('Field Trebuchet')], [/^br_prophetess_war16$/, N('Warhorse', 'first', 'fof')], [/^br_(damsel|prophetess)_war16$/, N('Bretonnian Warhorse', 'first', 'fof')], [/^br_(damsel|prophetess)_war12$/, N('^Warhorse$', 'first', 'fof')], [/^br_(damsel|prophetess)_uni$/, N('Unicorn', 'first', 'fof')], [/^br_prophetess_rpeg$/, N('Pegasus', 'first', 'fof')], [/^br_sergeant_mtd$/, N('^Warhorse$', 'first', 'fof')], [/^br_outcast(2|3)?_h$/, N('^Warhorse$', 'first', 'fof')],
  // ---- Hombres bestia
  [/^bm_centigor_chief$/, N('Centigor')], [/^bm_(doombull|gorebull)$/, N('Doombull')], [/^bm_(hounds|primalhounds)$/, N('Chaos Warhound|Primal Warhound', 'first', 'rh')], [/^bm_minotaurs(_gw)?$/, N('^Minotaur', 'first', 'rh')], [/^bm_centigors(_sons)?$/, N('^Centigor')], [/^bm_harpies$/, N('Harpy', 'first', 'leg_dark')], [/^bm_dragon_ogres$/, N('Dragon Ogre')],
  [/^bm_warherd/, N('^Gor/|Warped Gor|Ungor', 'first')], [/^bm_(gor|ungor)(_bow)?(_aw)?_amb$/, N('^Gor/True|^Ungor/Half', 'first', 'rh')], [/^bm_preyton/, N('Preyton')], [/^(bm|woc)_gspawn[knst]?$/, N('Gigantic Spawn', 'first', 'aj_chaos')],
  [/^bm_beastlord_tusk$/, N('^Chariot/Bestigor Crew', 'first', 'rh')], [/^bm_tuskchariot$/, N('Tuskgor', 'first', 'rh')], [/^bm_razorchariot$/, N('Razorgor', 'first', 'rh')],
  // ---- Caos
  [/^woc_lord_steed$/, N('Chaos Steed', 'first', 'rh')], [/^woc_exalted$|^woc_aspiring(_amb)?$/, N('Chaos Lord/Exalted')], [/^woc_ex_sorc$/, N('Sorcerer Lord')], [/^woc_dprince$/, N('Daemon Prince', 'first', 'rh')], [/^woc_warriors_(hb|gw)$/, N('^Chaos Warrior/', 'first', 'rh')], [/^woc_marauders_gw(_amb|_famb)?$|^woc_marauders_amb$/, N('Chaos Marauder', 'first', 'faq')],
  [/^woc_knights_l$/, N('^Chaos Knight', 'first', 'rh')], [/^woc_horsemen(_amb|_famb)?$/, N('Marauder Horseman', 'first', 'faq')], [/^woc_hounds$/, N('Chaos Warhound', 'first', 'rh')], [/^woc_lord_(manticore)$|^woc_sorc_manticore$|^woc_exalted_manticore$/, N('Manticore', 'first')], [/^woc_(lord|exalted)_dragon$/, N('Chaos Dragon', 'first', 'rh')],
  [/^woc_(lord|chariot|chosen_chariot|exalted_cchariot|lord_cchariot|aspiring_cchariot|lord_cchariot)$|^woc_chariot$/, N('^Chariot/Chaos Charioteer', 'first', 'rh')], [/^woc_gorechariot$/, N('Gorebeast', 'first', 'rh')], [/^woc_chosen_chariot$|^woc_(lord|exalted|aspiring)_cchariot$/, N('Chosen Chaos Chariots', 'first')], [/^woc_lord_chariot$/, N('^Chariot/Chaos Charioteer', 'first', 'rh')],
  [/^woc_spawn_(khorne|nurgle|slaanesh|tzeentch)$/, N('Chaos Spawn', 'first', 'rh')], [/^woc_chieftain_horse$/, N('Warhorse', 'first', 'faq')], [/^woc_spawn_[kn st]+$/, N('Chaos Spawn', 'first', 'rh')], [/^woc_warpfire(_w1|_w2)?$/, N('Warpfire Dragon', 'first', 'aj_chaos')],
  // ---- Reyes sepulcrales
  [/^tk_(king|hpriest)_dragon$/, L('100x150', 'aj_tk.txt:874 (Settra, Carro de los Dioses; el Dragón/Behemoth 100x150): sin bloque propio')], [/^tk_swarm_amb$/, N('Tomb Swarm')], [/^tk_(prince|hpriest|mpriest)$/, N('Tomb King/Tomb Prince|High Priest')], [/^tk_summoned$|^tk_(skirmishers|skirmishers_amb)$/, N('Skeleton Warrior', 'first', 'rh')],
  [/^tk_(horsemen|horse_archers_cr)$/, N('Skeleton Horseman', 'first', 'rh')], [/^tk_necroknights$/, N('Necropolis Knight')], [/^tk_carrion$/, NONE('Carrion no tiene entrada en los libros extraídos (Legends)')], [/^tk_stalkers_amb$/, N('Sepulchral Stalker')], [/^tk_catapult$/, N('Screaming Skull', 'first', 'rh')],
  [/^tk_casket$/, NONE('Casket of Souls: «Base Size: N/A» en el libro (RH p.138 aprox.)')], [/^tk_warsphinx$/, N('Warsphinx')], [/^tk_(king_chariot|guardchariot|chariot)$/, N('^Chariot/Skeleton Crew|^Chariot/Skeletal Steed', 'first', 'rh')], [/^tk_archnecro$/, N('Arch Necrotect')], [/^tk_vushabti$/, N('Venerable Ushabti')], [/^tk_necroserpent$/, N('Necroserpent|Necropolis Knight')], [/^tk_cohort(_ph|_a)?$/, N('Royal Host WarriorCohorts|Royal Host Archer', 'first', 'aj_tk2')], [/^tk_cohort_(cav|ca)(_cc)?$/, N('Royal Host Horseman', 'first', 'aj_tk2')],
  // ---- Altos elfos
  [/^he_prince_griffon$|^he_noble_griffon$|^he_garrison_griffon$/, N('^Griffon', 'first', 'fof')], [/^he_(prince|archmage)_(moon|star|sun)$|^he_noble_sun$|^he_dragonmage$/, N('Dragon Mage|Sun Dragon|Star Dragon|Moon Dragon', 'first', 'fof')], [/^he_skycutter(_bt)?(_amb)?$|^he_garrison_skycutter(_amb)?$|^he_skycutter_bt_amb$/, N('^Skycutter')],
  [/^he_(noble|mage)_eagle$|^he_garrison_eagle$/, N('^Great Eagle', 'first', 'fof')], [/^he_prince_tiranoc$|^he_noble_tiranoc$|^he_tiranoc$/, N('Tiranoc Chariot')], [/^he_lionchariot$|^he_(chieftain|korhil)_chariot$/, N('Lion Chariot')], [/^he_prince$|^he_noble$|^he_mage$/, N('^Prince/Noble|Archmage/Mage', 'first', 'fof')],
  [/^he_prince_h$/, N('Barded Elven Steed', 'first', 'fof')], [/^he_(spearmen|archers)(_lc|_mc|_lcmc)?$/, N('Sea Guard|Spearmen|Archer', 'first', 'fof')], [/^he_seaguard(_g|_dr)?$/, N('Sea Guard', 'first', 'fof')], [/^he_lionguard$/, N('Lion Guard')], [/^he_woodsmen$/, N('Chracian Woodsman')],
  [/^he_stormweaver$/, N('Storm Weaver')], [/^he_stormweaver_uni$/, N('Unicorn', 'first', 'fof')], [/^he_warlions$/, N('War Lion')], [/^he_whitelions$/, N('White Lion')], [/^he_reavers(_bow)?$/, N('Reaver|Cavalry Glade|Elven Steed', 'first', 'fof')], [/^he_silverhelms$/, N('Silver Helm')], [/^he_dragonprinces$/, N('Dragon Prince')], [/^he_boltthrower$/, N('Eagle-claw')],
  // ---- Enanos
  [/^dw_thane$/, N('King/Thane')], [/^dw_runesmith$/, N('Runelord')], [/^dw_(dslayer|drslayer)$/, N('Daemon Slayer')], [/^dw_king_shield$/, N('King/Thane')], [/^dw_anvil$/, NONE('Anvil of Doom: el libro dice «Base Size: N/A» (fof.txt:444)')], [/^dw_quarrellers$/, N('Thunderer', 'first', 'fof')], [/^dw_thunderers(_em)?$/, N('Thunderer')],
  [/^dw_scoutgyro$/, N('Scout Gyrocopter')], [/^dw_royalwarriors(_ga)?$/, N('Royal Clan Warrior')], [/^dw_gyro$/, N('Gyrobomber')], [/^dw_cart(_miner)?$/, N('Dwarf Cart')], [/^dw_hewer$/, N('Goblin-Hewer')], [/^dw_bolt$/, N('Bolt Thrower', 'first', 'fof')], [/^dw_grudge$/, N('Grudge|Flame Cannon', 'first', 'fof')], [/^dw_cannon(_ff)?$/, N('^Cannon', 'first', 'fof')], [/^dw_organ(_ff)?$/, N('Organ Gun', 'first', 'fof')], [/^dw_flame(_ff)?$/, N('Flame Cannon', 'first', 'fof')], [/^dw_slayers_g$/, N('Troll Slayer')], [/^dw_impmerc/, NONE('mercenarios imperiales enanos: sin entrada propia en los libros extraídos (se usan como Warrior 25x25)')],
  // ---- Elfos oscuros
  [/^de_dreadlord_(steed|cold)$|^de_(master|sorceress|supreme)_(steed|cold)$/, N('Dark Steed|Cold One', 'first', 'leg_dark')], [/^de_dreadlord_dragon$|^de_supreme_dragon$/, NONE('Dragón negro: sin entrada en los libros extraídos (Legends)')], [/^de_(master|sorceress)$/, N('Dark Elf Dreadlord|Supreme Sorceress')], [/^de_(dreadlord|master)$/, N('Dark Elf Dreadlord')], [/^de_deathhag$/, N('Death Hag')], [/^de_beastmaster$/, NONE('High Beastmaster: «Base Size: (as mount)» (leg_darkelves.txt:164): sin peana propia a pie')],
  [/^de_warriors$|^de_crossbows$/, N('Corsair|Reaver', 'first', 'leg_dark')], [/^de_blackguard$/, N('Black Guard')], [/^de_sisters$/, N('Executioner|Witch Elf|Sister', 'first', 'leg_dark')], [/^de_witchelves$/, N('Witch Elf|Executioner', 'first', 'leg_dark')], [/^de_coldones$/, N('Cold One Knight')], [/^de_darkriders$/, N('Dark Rider')], [/^de_harpies$/, N('^Harpy', 'first', 'leg_dark')], [/^de_boltthrower$/, N('Reaper Bolt Thrower')],
  [/^de_deathhag_cauldron$/, N('Cauldron of Blood')], [/^de_(dreadlord|master)_chariot$|^de_beastmaster_chariot$|^de_scourge$/, N('Chariot/Beastmaster Crew')], [/^de_coldchariot$/, N('Chariot/Knight Charioteer')], [/^de_(dreadlord|beastmaster)_manticore$/, N('Manticore', 'first')], [/^de_(sorceress|supreme)_pegasus$/, N('Pegasus', 'first', 'leg_dark')], [/^de_shrine$/, N('Bloodwrack Shrine')],
  // ---- Hombres lagarto
  [/^lm_oldblood_cold$|^lm_scar_cold$|^lm_coldones$/, N('^Cold One', 'first', 'leg_liz')], [/^lm_scar$/, N('Saurus Oldblood')], [/^lm_skchief$|^lm_skpriest$/, N('Skink Priest')], [/^lm_skchief_(terra|ripper)$/, N('Terradon|Ripperdactyl')], [/^lm_skchief_steg$|^lm_skpriest_ancient$|^lm_stegadon$/, N('^Stegadon')], [/^lm_skirmishers$|^lm_skinkhandler$/, N('Chameleon Skink|^Skink/')], [/^lm_salamander$/, N('Salamander')], [/^lm_razordon$/, N('Razordon')], [/^lm_bastiladon$/, N('Bastiladon')], [/^lm_(oldblood|scar)_carno$/, NONE('Carnosaurio: sin entrada «Base Size» en los libros extraídos')],
  // ---- Skaven
  [/^sk_chieftain$/, N('Skaven Warlord')], [/^sk_greyseer$/, N('Grey Seer')], [/^sk_greyseer_bell$|^sk_plaguepriest_furnace$/, N('Screaming Bell|Plague Furnace')], [/^sk_plaguepriest$/, N('Plague Priest')], [/^sk_giantrats$/, N('Giant Rat')], [/^sk_nightrunners$/, N('Night Runner')], [/^sk_plaguemonks$/, N('Plague Monk')], [/^sk_ratogres$/, N('Rat Ogre')], [/^sk_ratlinggun$|^sk_warpfire$|^sk_windmortar$/, N('Weapon Team Crew')],
  [/^sk_warplightning$/, N('Warp Lightning Cannon')], [/^sk_plagueclaw$/, N('Plagueclaw')], [/^sk_(warpgrinder|doomflayer)$/, N('Jezzail|Weapon Team Crew')], [/^sk_doomwheel$/, N('Doomwheel')], [/^sk_hellpit$/, NONE('Hell Pit Abomination: sin entrada «Base Size» en los libros extraídos')], [/^sk_thingscatcher$/, N('Packmaster')],
  // ---- Condes vampiro
  [/^vc_ghoulking$/, N('Ghoul King')], [/^vc_(count_nightmare|thrall_nightmare|necro_nightmare|acolyte_nightmare)$/, N('^Nightmare$', 'first', 'leg_vamp')], [/^vc_count_dragon$|^vc_necro_dragon$/, NONE('Zombie Dragon: sin entrada en los libros extraídos (Legends)')], [/^vc_(count_terror|necro_terror)$/, NONE('Terror Abisal (Legacy Vampiros): sin entrada «Base Size» en los libros extraídos (no es el Terrorgheist de Legends)')], [/^vc_ghoulking_terror$/, N('Terrorgheist')], [/^vc_(count_coven|thrall_coven)$/, N('Coven Throne')],
  [/^vc_(thrall|acolyte)$/, N('Vampire Count|Master Necromancer')], [/^vc_(wightking|wightlord)$/, N('Wight King')], [/^vc_(wightking|wightlord)_steed$|^vc_knightshrouds_steed$/, N('^Skeletal Steed', 'first', 'leg_vamp')], [/^vc_knightshrouds$/, N('Wight King|Cairn Wraith|Tomb Banshee')], [/^vc_direwolves$/, N('Dire Wolf')], [/^vc_fellbats$/, N('Fell Bat')], [/^vc_graveguard$/, N('Grave Guard')], [/^vc_blackknights$/, N('Black Knight')], [/^vc_spirithosts$/, N('Spirit Host')], [/^vc_cairnwraith$/, N('Cairn Wraith')], [/^vc_bloodknights$/, N('Blood Knight')], [/^vc_blackcoach$/, N('Black Coach')], [/^vc_batswarm$/, N('Bat Swarm')], [/^vc_corpsecart$/, N('Corpse Cart')], [/^vc_(mortis|necro_mortis|acolyte_mortis)$/, N('Mortis Engine')], [/^vc_risen$/, N('Zombie|Skeleton Warrior', 'first', 'leg_vamp')],
  // ---- Demonios
  [/^dm_herald_khorne_jug$|^dm_bloodcrushers$/, N('Juggernaut')], [/^dm_herald_nurgle_pal$/, N('Palanquin', 'first', 'leg_daem')], [/^dm_herald_slaanesh(_w1|_w2)?$/, N('Herald of Slaanesh')], [/^dm_herald_slaanesh_steed(_w1|_w2)?$/, N('Steed of Slaanesh', 'first', 'leg_daem')], [/^dm_herald_tzeentch_disc$/, N('Disc of Tzeentch')], [/^dm_herald_tzeentch_chariot$/, N('Chariot of Tzeentch')],
  [/^dm_pinkhorrors$/, N('Pink Horror')], [/^dm_nurglings$/, N('Brimstone|Nurgling')], [/^dm_bluehorrors$/, N('Blue Horror')], [/^dm_fleshhounds$/, N('Flesh Hound')], [/^dm_plaguedrones$/, N('Rot Fly|Plaguebearer/Plagueridden/Rot')], [/^dm_furies$/, N('Chaos Fury')], [/^dm_beast$/, N('Fiend of Slaanesh')], [/^dm_skullcannon$/, N('Skull Cannon')], [/^dm_hellflayer$/, N('Hellflayer')], [/^dm_seekerchariot$|^dm_herald_slaanesh_chariot(_w1|_w2)?$/, N('Seeker Chariot')], [/^dm_soulgrinder$/, N('Soul Grinder')], [/^dm_herald_khorne_throne$/, N('Blood Throne')],
  [/^dm_herald_slaanesh_exalted(_w1|_w2)?$/, N('Exalted Seeker Chariot')], [/^dm_(burning|burningchariot)$/, N('Burning Chariot')],
  // ---- Ogros
  [/^ok_tyrant_(stone|thunder)$|^ok_bruiser_(stone|thunder)$|^ok_hunter_(stone|thunder)$/, N('^Stonehorn|^Thundertusk', 'first', 'leg_ogres')], [/^ok_bruiser$/, N('Tyrant/Bruiser')], [/^ok_butcher$/, N('Slaughtermaster')], [/^ok_(butcher|slaughter)_cauldron$/, L('50x100', 'leg_ogres.txt:138 («50x100 mm with Butcher’s Cauldron»)')], [/^ok_bulls$/, N('^Ogre/Crusher', 'first', 'leg_ogres')], [/^ok_mournfang$/, N('Mournfang')], [/^ok_ironblaster$/, N('Ironblaster')], [/^ok_scraplauncher$/, N('Scraplauncher')], [/^ok_stonehorn$/, N('^Stonehorn')], [/^ok_thundertusk$/, N('^Thundertusk')],
  // ---- Enanos del Caos
  [/^cd_seneschal$/, N('Infernal Castellan')], [/^cd_daemonsmith$/, N('Daemonsmith Sorcerer')], [/^cd_(daemonsmith|prophet)_taurus$|^cd_taurus$/, N('Great Taurus', 'first', 'leg_chaosd')], [/^cd_(daemonsmith|prophet)_lammasu$/, N('Lammasu', 'first', 'leg_chaosd')], [/^cd_prophet_bale$/, NONE('Bale Taurus: sin entrada «Base Size» en los libros extraídos')], [/^cd_khan_wolf$/, N('Giant Wolf', 'first', 'leg_chaosd')], [/^cd_taruk$/, N('Taur’ruk')], [/^cd_hobgoblins$/, N('Cutthroat')],
  [/^cd_wolfriders$/, N('Hobgoblin Wolf Rider')], [/^cd_blunderbuss$|^cd_hailshot$/, N('Infernal Guard|Infernal Ironsworn')], [/^cd_centaurs$/, N('Bull Centaur')], [/^cd_(kdaai|manburner)$/, N('K’daai')], [/^cd_mortar(_hb)?$/, NONE('Dreadquake Mortar: el libro dice «Base Size: N/A» (leg_chaosdwarfs.txt:612)')], [/^cd_rocket(_hb)?$/, N('Deathshrieker')], [/^cd_magma(_hb)?$/, N('Magma Cannon')], [/^cd_bolt$/, N('Bolt Thrower', 'first', 'leg_chaosd')], [/^cd_ironDaemon$/, N('Iron Daemon')], [/^cd_(blackboss|blackorcs)$/, N('Black Orc')], [/^cd_sneakygits$/, N('Sneaky Git')],
  // ---- Cathay (cathay_aj.txt, cathay_notes.md)
  [/^ct_(gatekeeper|gatemaster)$/, L('25x25', 'cathay_aj.txt:1578 (Gate Master/Gate Keeper)')], [/^ct_(gatekeeper|gatemaster)_horse$/, L('30x60', 'cathay_aj.txt:1612 (Cathayan Warhorse)')], [/^ct_(magistrate|strategist)$/, L('25x25', 'cathay_notes.md (Lord Magistrate/Strategist: infantería regular, 25x25 por tipo; el bloque de peana no se leyó del OCR)')],
  [/^ct_(magistrate|strategist)_lantern$|^ct_lanterns.*$/, L('100x100', 'cathay_aj.txt:1919 (Sky Lantern 100 x 100)')], [/^ct_shugengan(_gen)?$/, L('60x100', 'cathay_aj.txt:1448 (Great Spirit Longma)')], [/^ct_miaoying$/, L('100x150', 'cathay_aj.txt:1215 (forma Dragón)')], [/^ct_miaoying_h$/, L('50x50', 'cathay_aj.txt:1215 (forma Humana)')],
  [/^ct_jade(_spear|_cdg)?$/, L('25x25', 'cathay_aj.txt:1768 (Jade Warriors)')], [/^ct_lancers(_cdg)?$/, L('30x60', 'cathay_aj.txt:1816 (Jade Lancers)')], [/^ct_(cannon|rockets)(_ogre|_ogre_gp)?(_gp)?$/, L('60x100', 'cathay_aj.txt:2341 (máquina 60x100; dotación 25x25)')], [/^ct_sentinel(_.*)?$/, L('100x150', 'cathay_aj.txt:2116 (Cathayan Sentinel)')],
  // ---- Renegade Crowns (sin bloque de peana en renegade_web.txt)
  [/^rc_/, NONE('Renegade Crowns (renegade_web.txt) no trae «Base Size»; se usa el tipo de tropa')],
  // ---- Genéricos de personaje a pie sin mapa más específico
];
// tipo de tropa -> peana estándar (Core, «Base Size»: solo como referencia de coherencia, NUNCA para corregir)
const rows = ['id\tpeana motor\tpeana oficial\tfuente\tacción'];
const res = {}; const sum = { coincide: 0, corregido: 0, faq: 0, rango: 0, dudosa: 0, sin_dato: 0, heredada: 0, previa_coincide: 0 };
const eng = (d) => d.baseW + 'x' + d.baseD;
const ids = Object.keys(UNITS).filter(k => UNITS[k].baseW && !UNITS[k].hidden);
const out = {};
for (const id of ids) {
  const d = UNITS[id], e = eng(d); let off = '—', src = '—', act = '', cat = '';
  const pr = prevMap[id];
  const FAQ = FAQ_BASE[id]; const FX = FIX[id];
  if (pr && pr[2] !== '—') { off = pr[2]; src = pr[3]; act = pr[4]; cat = /HORQUILLA/.test(act) ? 'rango' : /corregido/.test(act) ? 'previa_corregido' : /FAQ/.test(act) ? 'faq' : /coincide/.test(act) ? 'previa_coincide' : 'dudosa'; if (/montura|no aplica|personaje montado/i.test(act) && !/coincide/.test(act)) cat = 'previa_montura'; }
  else {
    const rule = RULES.find(([re]) => re.test(id));
    let cands = rule ? rule[1]() : [];
    const none = cands.find(c => c.none);
    if (FX) { off = FX[1]; src = FX[2]; cat = e === FX[1] ? 'corregido' : 'dudosa'; act = e === FX[1] ? 'CORREGIDO v843n: ' + FX[0] + ' → ' + FX[1] : 'pendiente de aplicar ' + FX[1]; }
    else if (FAQ) { off = FAQ[0]; src = FAQ[1]; cat = FAQ[0] === e ? 'faq' : 'faq_dif'; act = FAQ[0] === e ? 'FAQ manda sobre el libro (motor = FAQ)' : 'CORREGIR (FAQ): ' + e + ' → ' + FAQ[0]; }
    else if (d.legacy && UNITS[d.legacy.to] && UNITS[d.legacy.to].baseW) { const t = UNITS[d.legacy.to]; off = 'hereda de ' + d.legacy.to + ' (' + eng(t) + ')'; src = 'legacy.to → ' + d.legacy.to; cat = eng(t) === e ? 'heredada' : 'dudosa'; act = eng(t) === e ? 'coincide con la unidad a la que se redirige (variante de equipo/opción)' : 'DISTINTA de la unidad destino ' + d.legacy.to; }
    else if (!rule) { cat = 'sin_dato'; act = 'sin regla de enlace: no se encontró entrada equiparable en los libros'; }
    else if (none) { cat = 'sin_dato'; act = 'sin dato: ' + none.none; }
    else if (!cands.length) { cat = 'sin_dato'; act = 'sin dato: la entrada enlazada no trae «Base Size» legible en el texto extraído'; }
    else {
      const vals = [...new Set(cands.map(c => c.v))]; off = vals.join(' / '); src = cands.slice(0, 3).map(c => c.src).join(' ; ');
      const isRange = cands.some(c => c.range) || !!BASE_RANGE[id];
      if (vals.includes(e)) { cat = isRange ? 'rango' : 'coincide'; act = isRange ? 'dentro de la horquilla oficial (v843m: peana elegible)' : 'coincide'; }
      else if (d.mount || /^(.*)_(h|peg|rpeg|demi|steed|cold|boar|wolf|spider|stag|dragon|eagle|manticore|hippo|uni|lammasu|taurus|carno|throne|chariot|cchariot)(_.*)?$/.test(id) || d.cat === 'char') { cat = 'dudosa'; act = 'DUDOSA: personaje/montura; la peana oficial es la de la montura o la del personaje a pie según la opción elegida; no se toca'; }
      else if (vals.length === 1 && !isRange && cands.length >= 1) { cat = 'dudosa'; act = 'DUDOSA (distinta del libro; enlace por nombre aproximado, no por perfil): no se toca'; }
      else { cat = 'dudosa'; act = 'DUDOSA: varias peanas posibles en el libro'; }
    }
  }
  out[id] = { e, off, src, act, cat };
  rows.push([id, e, off, src, act].join('\t'));
  const k = cat.replace('previa_', ''); sum[k] = (sum[k] || 0) + 1;
}
fs.writeFileSync(R + 'base_table_v843n.tsv', rows.join('\n') + '\n');
fs.writeFileSync(R + 'base_summary_v843n.json', JSON.stringify({ total: ids.length, sum, out }, null, 0));
console.log(ids.length, JSON.stringify(sum));
const show = process.argv[2]; if (show) for (const [id, o] of Object.entries(out)) if (o.cat === show) console.log(id, '|', o.e, '|', o.off, '|', o.src.slice(0, 60), '|', o.act.slice(0, 50));
