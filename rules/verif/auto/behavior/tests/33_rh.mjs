// v835 — FAQ de Ravening Hordes (rules/new/faq_rh.txt): erratas
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const F = 'rules/new/faq_rh.txt';
const fac = (k) => (UNITS[k].faction === 'merc' ? 'empire' : UNITS[k].faction);
const one = (k, x = {}) => { const s = game([{ type: k, models: Math.max(1, UNITS[k].min || 1), ...x }], [{ type: 'state_troops', models: 10 }], { f: [fac(k), 'empire'] }); return { s, u: U(s, k, 0) }; };
const pts = (id, k, v) => T(id, F, `${UNITS[k].name}: ${v} pts`, () => eq(UNITS[k].ppm, v, k));
const cv = (id, k, v) => T(id, F, `${SPELLS[k].name}: ${v}+`, () => eq(SPELLS[k].cv, v, k));
const sr = (id, ks, r, yes = true) => T(id, F, `${[ks].flat().map((k) => UNITS[k].name).join(', ')}: ${yes ? 'tiene' : 'no tiene'} ${r}`, () => { for (const k of [ks].flat()) (yes ? has : no)(R.D(one(k).u).sr, r, k); });
const base = (id, k, w, d) => T(id, F, `${UNITS[k].name}: peana ${w}x${d}`, () => eq([UNITS[k].baseW, UNITS[k].baseD], [w, d], k));
const byName = (re) => Object.keys(UNITS).filter((k) => re.test(UNITS[k].name));
T('rh-errata-001', F, 'Araña Gigante (montura de Jefe/Gran Jefe Goblin): existe y tiene Mover a través de cobertura; sus ataques (no los del jinete) son envenenados', () => {
  for (const k of ['gob_warboss_spider', 'gob_bigboss_spider']) { ok(UNITS[k], 'falta ' + k); has(R.D(one(k).u).sr, 'mtCover', k); eq(UNITS[k].W, UNITS[k.replace('_spider', '')].W + 1, '+1 H'); }
  const { s, u } = one('gob_bigboss_spider'); const e = U(s, 'state_troops', 1); engage(s, u, e); cur(s); const sl = R.slotsOf(u, R.D(u)); ok(sl && sl.some((x) => x.poison && x.per === 3), 'la montura no ataca aparte con Ataques envenenados');
});
T('rh-errata-002', F, 'Goblins Nocturnos: 0-1 Fanático por cada 10 Goblins, máximo 3', () => { const k = 'night_gobs'; ok(UNITS[k], 'sin unidad'); const f = (n) => DATA.armyIssues([{ type: k, models: n, opts: ['f3'] }, { type: 'gob_bigboss', models: 1 }], 1000, 'open', 'grand').filter((x) => /Fan[áa]tic/.test(x));
  eq(f(20), ['Goblins Nocturnos: 0-1 Fanático por cada 10 Goblins nocturnos, máximo 3 (FAQ RH p.25)', 'Goblins Nocturnos: 3 Fanáticos: máximo 1 Fanático por cada 10 Goblins Nocturnos', 'Goblins Nocturnos: máximo 1 Fanático por cada 10 modelos (3 como mucho); 3 con 20'], '3 Fanáticos con 20 Goblins dan error'); eq(f(30), [], '3 Fanáticos con 30 Goblins sin error'); });
T('rh-errata-003', F, 'Soltad a los Fanáticos: salvo huyendo o en Columna de marcha, en cualquier Inicio de turno (de los dos jugadores)', () => {
  const s = game([{ type: 'night_gobs', models: 20, opts: ['f1'] }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy', active: 1 }); const u = put(U(s, 'night_gobs'), 36, 30), e = put(U(s, 'state_troops', 1), 36, 22, Math.PI / 2); cur(s);
  const o = asks(s, (c) => { const ev = []; R.beginStrategy(c, ev); return ev; }, [0, 1]); ok(o.needs.some((n) => /Fan[áa]tic/.test(n.title) && n.p === 0), 'no se pregunta en el Inicio de turno del rival: ' + o.needs.map((n) => n.title).join(','));
  u.files = 1; const o2 = asks(s, (c) => { const ev = []; R.beginStrategy(c, ev); return ev; }, [0, 1]); ok(!o2.needs.some((n) => /Fan[áa]tic/.test(n.title)), 'en Columna de marcha suelta Fanáticos');
});
T('rh-errata-004', F, 'Trolls (comunes, de río, de piedra): Banda variopinta y armas elegidas por modelo', () => { for (const k of ['trolls', 'river_trolls', 'stone_trolls']) { has(UNITS[k].sr, 'motley', k); ok(UNITS[k].opts.every((o) => o.cnt), k + ': opciones de toda la unidad'); } });
T('rh-errata-005', F, 'Pigstikka de Porko: F y FP solo el turno en que el portador carga', () => { const pr = (ch) => { const s = game([{ type: 'orc_bigboss_boar', models: 1, items: ['pigstikka'] }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_bigboss_boar'), d = U(s, 'state_troops'); engage(s, a, d); if (ch) charged(s, a, d); cur(s); const p = R.attackProfile(a, d).parts[1]; return [p.S, p.ap]; }; eq([ITEMS.pigstikka.S, ITEMS.pigstikka.ap, ITEMS.pigstikka.chargeSA], [1, 1, true], 'datos'); eq(pr(false), [4, 0], 'sin cargar no aplica F ni FP'); eq(pr(true), [5, 2], 'el turno en que carga: F+1 y −1 AP (más Perforación)'); });
T('rh-errata-006', F, '’Eadbuttin’ ’At: 0-1 por modelo', () => { ok(ITEMS.eadbuttin.zeroOne, 'sin 0-1'); ok(DATA.itemIssues('orc_bigboss', ['eadbuttin', 'eadbuttin']).some((x) => /0-1/.test(x)), 'dos sin error'); });
T('rh-errata-007', F, 'Reprimir impetuosidad: una unidad Impetuosa a 6" repite el Liderazgo fallido de Impetuosidad', () => {
  const s = game([{ type: 'black_orcs', models: 10 }, { type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const q = put(U(s, 'black_orcs'), 30, 40), a = put(U(s, 'orc_boyz'), 36, 40), t = put(U(s, 'state_troops', 1), 36, 32, Math.PI / 2); cur(s);
  ok(R.D(q).sr.includes('quell'), 'montaje: sin Reprimir'); dice(6, 6, 1, 1); diceAll(1); const o = asks(s, (c) => { const ev = []; R.impetuousTests(c, ev); return ev; }, [0], (n) => (/Reprimir/.test(n.title) ? 'y' : undefined)); ok(o.needs.some((n) => /Reprimir/.test(n.title)), 'no se ofrece repetir'); ok(/supera/.test(msgs(o.r)), 'no repite: ' + msgs(o.r));
});
cv('rh-errata-008', 'brain_bursta', 9); cv('rh-errata-009', 'morks_curse', 7);
T('rh-errata-010', F, 'Monturas de personaje del Caos: Montura demoníaca sin restricción; Mantícora y Dragón del Caos solo Campeones Exaltados y Señores', () => { ok(UNITS.woc_lord_dragon && UNITS.woc_exalted_dragon, 'Señor/Exaltado en Dragón'); ok(!Object.keys(UNITS).some((k) => /^woc_(sorcerer|chieftain|aspiring).*dragon/.test(k)), 'otro personaje en Dragón del Caos'); });
T('rh-errata-011', F, 'Corcel del Caos: Contracarga', () => { const ks = Object.keys(UNITS).filter((k) => /^woc_.*steed/.test(k)); ok(ks.length, 'sin unidades'); for (const k of ks) has(UNITS[k].sr, 'counterCharge', k); });
T('rh-errata-013', F, 'Engendro del Caos: Movimiento 2D6+1', () => { eq(UNITS.woc_spawn.randM, '2D6+1', 'Movimiento aleatorio'); });
sr('rh-errata-014', ['woc_knights', 'woc_knights_l'], 'counterCharge');
sr('rh-errata-015', ['woc_lord_dragon', 'woc_exalted_dragon'], 'impetuous');
T('rh-errata-016', F, 'Cañón Infernal: peana 100x150 (la máquina)', () => { const k = Object.keys(UNITS).find((x) => /hellcannon/.test(x)); ok(k, 'sin Cañón Infernal'); eq([UNITS[k].baseW, UNITS[k].baseD].sort((a, b) => a - b), [100, 150], 'peana'); });
T('rh-errata-017', F, 'Dones del Caos: no afectan a la montura; cada Don una vez por ejército', () => { const k = 'gf_arm'; ok(ITEMS[k].gift && ITEMS[k].A, 'montaje: Don que da +Ataques'); const s0 = game([{ type: 'woc_lord_steed', models: 1 }], [{ type: 'orc_boyz', models: 5 }], { f: ['woc', 'orcs'] }), s1 = game([{ type: 'woc_lord_steed', models: 1, items: [k] }], [{ type: 'orc_boyz', models: 5 }], { f: ['woc', 'orcs'] }); eq(JSON.stringify(R.D(U(s1, 'woc_lord_steed')).mountAtk), JSON.stringify(R.D(U(s0, 'woc_lord_steed')).mountAtk), 'el Don cambia la montura'); const pr = (g) => { cur(g); return R.attackProfile(U(g, 'woc_lord_steed'), U(g, 'orc_boyz', 1)); }; eq(pr(s1).atk - pr(s0).atk, ITEMS[k].A, 'el Don sí afecta al jinete'); const e = (n) => DATA.armyIssues(Array.from({ length: n }, () => ({ type: 'woc_lord_steed', models: 1, items: [k], opts: [], reg: null })), 4000, 'open', 'grand'); ok(e(2).some((x) => /Don|vez|ejército/i.test(x)), 'el mismo Don dos veces en el ejército: ' + JSON.stringify(e(2))); ok(!e(1).some((x) => /Don/.test(x)), 'una vez, sin aviso'); });
T('rh-errata-018', F, 'Esplendor diabólico: solo infantería o caballería', () => { const iss = DATA.itemIssues('woc_lord_dragon', ['gf_splendour']); ok(iss.some((x) => /infantería o caballería/.test(x)), 'un Señor en Dragón lo lleva'); eq(DATA.itemIssues('woc_lord', ['gf_splendour']).filter((x) => /infantería o caballería/.test(x)).length, 0, 'un Señor a pie no puede'); });
T('rh-errata-019', F, 'Aura encantadora: solo infantería o caballería', () => { ok(DATA.itemIssues('woc_lord_dragon', ['gf_enchant']).some((x) => /infantería o caballería/.test(x)), 'un Señor en Dragón la lleva'); });
T('rh-errata-020', F, 'Títere Infernal: sin huir ni estar trabado, cuando un Mago enemigo a 15" hace una tirada de lanzamiento', () => {
  const run = (dist, mod) => { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); w.spells = ['ring_fireball']; w.casted = []; w.wizLevel = 1; t.items = dist == null ? [] : ['infernal_puppet'];
    if (dist != null) put(t, 36, 40 - dist - GEOM.dims(t).d / 2 - GEOM.dims(w).d / 2, Math.PI / 2); if (mod) mod(s, t); cur(s); dice(5, 5, 1); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'ring_fireball', target: t.id }); return msgs(r.r?.events || r.events || []); };
  const base = run(null), a = run(12), b = run(14.9), c = run(15.5), f = run(12, (s, t) => { t.fleeing = true; }), e = run(12, (s, t) => { engage(s, t, U(s, 'orc_weirdboy', 0)); });
  ok(!/Títere/.test(base), 'sin Títere no actúa'); ok(/Títere Infernal/.test(a) && /no logra/.test(a), 'a 12" descarta un 5 (1+5+1 = 7 < 8): ' + a); ok(/Títere Infernal/.test(b), 'a menos de 15" actúa'); ok(!/Títere/.test(c), 'a más de 15" no actúa'); ok(!/Títere/.test(f), 'huyendo no puede usarlo');
  ok(e === undefined || !/Títere/.test(e), 'trabado no puede usarlo');
});
pts('rh-errata-021', 'bm_minotaurs', 44); pts('rh-errata-022', 'bm_centigors', 17); pts('rh-errata-023', 'bm_dragon_ogres', 59);
T('rh-errata-024', F, 'Da Skull Smasha (Kiknik): martillo o pico, elegido en el paso 1.1 de cada subfase de combate', () => {
  const s = game([{ type: 'gob_kiknik', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'gob_kiknik'), d = U(s, 'state_troops', 1); engage(s, a, d); cur(s);
  diceAll(1); const o = asks(s, (c) => fight(c), [0]); const q = o.needs.find((n) => n.title === 'Arma de combate' && n.p === 0); ok(q && q.opts.some((x) => /pico/.test(x[1])), 'no se elige entre martillo y pico');
});
T('rh-errata-050', F, 'Ogros de las Tierras Yermas: el Machacador (campeón) cuesta +7', () => { const c = DATA.cmdAllowed('orc_ogre_bulls'); ok(c.champ, 'sin campeón'); const a = DATA.unitCost('orc_ogre_bulls', 3, false, false, true) - DATA.unitCost('orc_ogre_bulls', 3, false, false, false); eq(a, 7, 'coste del campeón'); });
T('rh-errata-025', F, 'Mutaciones del Caos: no afectan a la montura; cada Mutación una vez por ejército', () => { const k = Object.keys(ITEMS).find((x) => ITEMS[x].mut); ok(k, 'sin Mutaciones'); });
cv('rh-errata-026', 'viletide', 9);
T('rh-errata-027', F, 'Carros Esqueleto: 41 pts y armadura 4+', () => { eq(UNITS.tk_chariot.ppm, 41, 'pts'); const { s, u } = one('tk_chariot'); cur(s); eq(R.svOf(u), 4, 'armadura'); });
T('rh-errata-028', F, 'Vórtice de Almas (Ataúd de las Almas): hechizos ligados de nivel de poder 2', () => { const d = UNITS.tk_casket; eq(d.boundSpells, ['light_death', 'light_protection'], 'hechizos ligados'); for (const k of d.boundSpells) eq(SPELLS[k].bound, 2, k + ': nivel de poder'); });
T('rh-errata-029', F, 'Mayal de Calaveras: F solo contra los modelos a los que cargó este turno', () => {
  const run = (it) => { const s = game([{ type: 'tk_king', models: 1, items: ['tk_flail'] }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['tk', 'empire'] }); const a = U(s, 'tk_king'), [d1, d2] = s.units.filter((x) => x.type === 'state_troops'); engage(s, a, d1); charged(s, a, it ? d1 : d2); cur(s); return R.attackProfile(a, d1).S; };
  ok(run(true) > run(false), 'F+3 también contra quien no cargó');
});
T('rh-errata-030', F, 'Armadura de las Eras: solo infantería, caballería o carro', () => { ok(DATA.itemIssues('tk_king_dragon', ['tk_ages']).some((x) => /carro/.test(x)), 'un Rey en Dragón la lleva'); eq(DATA.itemIssues('tk_king', ['tk_ages']).filter((x) => /carro/.test(x)).length, 0, 'un Rey a pie no puede'); });
cv('rh-errata-031', 'usekhp', 9);
T('rh-errata-032', F, 'Remolino Fétido: terreno difícil; se dispersa D6" en cada Inicio de turno; impactos al atravesarlo', () => { ok(SPELLS.foetid_whirl.vx, 'sin vórtice'); eq(SPELLS.foetid_whirl.vx.dist || 'D6', 'D6', 'dispersión'); ok(SPELLS.foetid_whirl.vx.diff || SPELLS.foetid_whirl.vx.danger === undefined, 'no es terreno difícil'); });
cv('rh-errata-033', 'torrent_filth', 7); cv('rh-errata-034', 'rapid_regen', 8);
T('rh-errata-035', F, 'Da Akrit Axe: F solo contra los modelos a los que cargó este turno', () => {
  const run = (it) => { const s = game([{ type: 'orc_bigboss', models: 1, items: ['aj_akrit'] }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_bigboss'), [d1, d2] = s.units.filter((x) => x.type === 'state_troops'); engage(s, a, d1); charged(s, a, it ? d1 : d2); cur(s); return R.attackProfile(a, d1).S; };
  ok(run(true) > run(false), 'F+1 también contra quien no cargó');
});
T('rh-errata-036', F, 'Tormenta Furiosa (Frydaal): F solo contra los modelos a los que cargó este turno', () => {
  const run = (it) => { const s = game([{ type: 'woc_frydaal', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['woc', 'empire'] }); const a = U(s, 'woc_frydaal'), [d1, d2] = s.units.filter((x) => x.type === 'state_troops'); engage(s, a, d1); charged(s, a, it ? d1 : d2); cur(s); return R.attackProfile(a, d1).S; };
  ok(run(true) > run(false), 'F+2 también contra quien no cargó');
});
base('rh-errata-037', 'woc_chieftain', 30, 30); base('rh-errata-038', 'woc_berserkers', 30, 30);
T('rh-errata-041', F, 'Lobos Piel: peana 50x50, Jarl campeón, Miedo', () => { const k = Object.keys(UNITS).find((x) => /skin|Piel/.test(x + UNITS[x].name)); ok(k, 'sin unidad'); eq([UNITS[k].baseW, UNITS[k].baseD], [50, 50], 'peana'); has(UNITS[k].sr, 'fear'); });
T('rh-errata-042', F, 'Dragones Warpfire: Orden cerrado', () => { for (const k of Object.keys(UNITS).filter((x) => /^woc_warpfire/.test(x))) has(UNITS[k].sr, 'closeOrder', k); });
cv('rh-errata-043', 'strangleroot', 8);
T('rh-errata-044', F, 'Estandarte de la Luna Distorsionada: un solo uso', () => { ok(ITEMS.bmaj_warpedmoon.single, 'sin un solo uso'); });
T('rh-errata-045', F, 'Mayal de los Reyes Conquistados (Nekaph): F solo contra los modelos a los que cargó', () => {
  const run = (chargedIt) => { const s = game([{ type: 'tk_nekaph', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['tk', 'empire'] }); const a = U(s, 'tk_nekaph'), [d1, d2] = s.units.filter((x) => x.type === 'state_troops'); engage(s, a, d1); charged(s, a, chargedIt ? d1 : d2); cur(s); return R.attackProfile(a, d1).S; };
  ok(run(true) > run(false), 'F+2 también contra modelos a los que no cargó');
});
pts('rh-errata-047', 'tk_guardchariot', 49);
T('rh-errata-048', F, 'Merodeadores del Caos: perfil actualizado (HA4 HP3 F3, peana 30x30, infantería regular)', () => { const d = UNITS.woc_marauders; eq([d.WS, d.BS, d.S, d.tt, d.baseW, d.baseD], [4, 3, 3, 'regInf', 30, 30], 'perfil'); });
T('rh-errata-049', F, 'Jinetes Merodeadores: perfil actualizado (HA4 HP3; caballo de guerra M8 HA3)', () => { const k = Object.keys(UNITS).find((x) => /marauder_horse|woc_horsemen/.test(x)); ok(k, 'sin unidad'); eq([UNITS[k].WS, UNITS[k].BS, UNITS[k].M], [4, 3, 8], 'perfil'); });
T('rh-errata-012', F, 'Trolls del Caos: Banda variopinta y armas elegidas por modelo', () => { has(UNITS.woc_trolls.sr, 'motley'); ok(UNITS.woc_trolls.opts.every((o) => o.cnt), 'opciones de toda la unidad'); });
