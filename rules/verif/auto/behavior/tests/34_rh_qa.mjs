// v835 — Q/A de la FAQ de Ravening Hordes (rules/new/faq_rh.txt) y de Catay (rules/new/faq_cathay.txt)
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const F = 'rules/new/faq_rh.txt', FC = 'rules/new/faq_cathay.txt';
const issues = (army, list = 'grand', lim = 2000) => DATA.armyIssues(army, lim, 'open', list);
T('rh-qa-001', F, 'Fanáticos: se pueden soltar estando la unidad trabada (si caben a 3" sin tocar peanas)', () => {
  const s = game([{ type: 'night_gobs', models: 20, opts: ['f1'] }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy', active: 0 }); const u = U(s, 'night_gobs'), e = U(s, 'state_troops', 1); u.files = 5; engage(s, e, u); cur(s);
  const o = asks(s, (c) => { const ev = []; R.beginStrategy(c, ev); return ev; }, [0, 1]); ok(o.needs.some((n) => /Fan[áa]tic/.test(n.title) && n.p === 0), 'no se pueden soltar trabados');
});
T('rh-qa-003', F, 'Puntos de victoria: el coste de los Fanáticos va en la unidad; un Fanático muerto no da puntos', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'night_gobs', models: 20, opts: ['f1'] }], { f: ['empire', 'orcs'] }); const u = U(s, 'night_gobs', 1); const p = R.unitPts(u); ok(p >= UNITS.night_gobs.ppm * 20 + 25, 'el coste del Fanático no está en la unidad: ' + p);
});
T('rh-qa-006', F, 'Big ’Uns en Jinetes de Jabalí: sus jabalíes también se benefician; los Impactos usan la F sin modificar', () => {
  const pr = (o) => { const s = game([{ type: 'boar_riders', models: 5, opts: o }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'boar_riders'), d = U(s, 'state_troops'); engage(s, a, d); cur(s); const p = R.attackProfile(a, d); return { c: [p.S, p.mS, p.ab], base: R.D(a).S }; };
  eq(pr([]), { c: [3, 1, 0], base: 3 }, 'sin Big ’Uns'); eq(pr(['big']), { c: [4, 2, 1], base: 3 }, 'con Big ’Uns: jinete y jabalí +1 F en combate; la F base (la de los Impactos) no cambia');
});
T('rh-qa-008', F, 'Todos los Goblins temen a los Elfos: si una unidad de Elfos causa Miedo, no por ello causa Terror a los Goblins', () => {
  for (const type of ['he_spearmen', 'he_skycutter']) { const s = game([{ type, models: 5 }], [{ type: 'goblins', models: 20 }], { f: ['he', 'orcs'] }); const e = U(s, type, 0), g = U(s, 'goblins', 1); cur(s); ok(R.fearsFrom(g, e), `${type}: los Goblins le temen`); ok(!R.terrorTo(e, g), `${type}: no les causa Terror (con Miedo propio: ${R.causesFear(e)})`); }
});
T('rh-qa-009', F, 'Amuleto Verde Brillante: lo puede llevar un personaje que no es Mago; se usa en lugar de la dispersión de Mago', () => {
  eq(DATA.itemIssues('orc_bigboss', ['glowy']), [], 'un no-Mago puede llevarlo');
  const run = (g) => { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'empire_captain', models: 1, items: ['glowy'] }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 40); put(U(s, 'empire_captain', 1), 36, 20, Math.PI / 2); w.spells = ['fireball']; w.casted = []; w.wizLevel = 1; cur(s); dice(5, 5, g); diceAll(1); const o = asks(s, (c) => R.apply(c, { t: 'cast', id: w.id, spell: 'fireball', target: U(c, 'empire_captain', 1).id }), [0, 1], () => 'y'); return { n: o.needs.map((x) => x.title), m: msgs(o.r.events || []) }; };
  const a = run(3), b = run(1); eq(a.n, ['Amuleto Verde Brillante'], 'se ofrece el Amuleto'); ok(/Capitán del Imperio dispersa Bola de Fuego/.test(a.m), 'con 2+ dispersa: ' + a.m); ok(/explota/.test(b.m) && !/dispersa/.test(b.m), 'con 1 explota: ' + b.m);
});
T('rh-qa-010', F, 'Ogdruz Swampdigga elige sus hechizos de Elementalismo y Magia Troll a la vez', () => { const d = UNITS.orc_ogdruz, LO = DATA.LORES, pool = [...LO.troll.pool, ...LO.elementalism.pool, LO.troll.sig, LO.elementalism.sig];
  eq(d.lores, ['elementalism', 'troll'], 'saberes'); const s = game([{ type: 'orc_ogdruz', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['orcs', 'orcs'] }); const sp = U(s, 'orc_ogdruz').spells; eq(sp.length, 3, 'Nivel 3: tres hechizos'); ok(sp.every((k) => pool.includes(k)), 'solo de los dos saberes: ' + sp); });
T('rh-qa-011', F, 'Waaagh! Nómada: Jinetes de Jabalí como Básica solo si el General es un Jefe de Guerra Orco (no Orco Negro)', () => {
  const A = (g) => issues([{ type: g, models: 1 }, { type: 'wolf_riders', models: 10 }, { type: 'wolf_riders', models: 10 }, { type: 'boar_riders', models: 5 }, { type: 'orc_boar_chariot', models: 1 }], 'nomad', 1000).filter((x) => /básicas/.test(x));
  eq(A('orc_warboss_boar'), [], 'con un Jefe de Guerra Orco los 75 pts de Jinetes de Jabalí completan las Básicas (100+100+75 ≥ 250)'); eq(A('black_warboss_boar'), ['Unidades básicas: al menos 250 pts'], 'con un Jefe de Guerra Orco Negro no cuentan como Básica (200 < 250)');
});
T('rh-qa-012', F, 'Waaagh! Nómada: un Jefe Orco Negro por Carro de Orcos Negros (Básica o Singular); da igual en qué vaya montado el Jefe', () => {
  const base = [{ type: 'orc_warboss_boar', models: 1 }, { type: 'wolf_riders', models: 10 }, { type: 'wolf_riders', models: 10 }, { type: 'boar_riders', models: 5 }, { type: 'black_chariot', models: 1 }];
  const F2 = (more) => issues([...base, ...more], 'nomad', 1000).filter((x) => /Nómada: 0-1/.test(x)); const MSG = (n) => `¡Waaagh! Nómada: 0-1 Jefe de Guerra o Gran Jefe Orco Negro por cada Carro de Jabalíes de Orcos Negros (${n} personajes para 1 carros)`;
  eq(F2([{ type: 'black_bigboss_boar', models: 1 }]), [], 'un Jefe por carro'); eq(F2([{ type: 'black_bigboss_boar', models: 1 }, { type: 'black_bigboss_boar', models: 1 }]), [MSG(2)], 'dos Jefes con un carro');
  eq(F2([{ type: 'black_bigboss_chariot', models: 1 }]), [], 'un Jefe montado en carro cuenta como uno solo, vaya montado en lo que vaya'); eq(F2([{ type: 'black_bigboss_chariot', models: 1 }, { type: 'black_bigboss_boar', models: 1 }]), [MSG(2)], 'el que va en carro no añade un carro');
});
T('rh-qa-013', F, 'Ejército Grande: un Jefe Orco Negro no puede montar en Carro de Orcos Negros', () => {
  const G = (k) => issues([{ type: 'orc_warboss', models: 1 }, { type: k, models: 1 }, { type: 'orc_boyz', models: 20 }, { type: 'black_orcs', models: 20 }, { type: 'orc_boyz', models: 20 }], 'grand', 1000).filter((x) => /Gran Ejército/.test(x));
  eq(G('black_warboss_chariot'), ['Jefe de Guerra Orco Negro en Carro de Jabalíes: no disponible en Gran Ejército'], 'Jefe de Guerra en carro'); eq(G('black_bigboss_chariot'), ['Gran Jefe Orco Negro en Carro de Jabalíes: no disponible en Gran Ejército'], 'Gran Jefe en carro'); eq(G('black_bigboss'), [], 'control: a pie sí');
});
T('rh-qa-014', F, 'Ejército Grande de Orcos y Goblins: la Bruja Troll no puede ser el General (sí en la Horda Troll)', () => {
  const X = (l, gen, more) => DATA.armyIssues([{ type: 'troll_hag', models: 1, ...(gen ? { gen: true } : {}) }, { type: 'trolls', models: 3 }, { type: 'orc_boyz', models: 20 }, { type: 'orc_boyz', models: 20 }, ...more], 1000, 'open', l).filter((x) => !/básicas|Mínimo/.test(x));
  eq(X('grand', false, []), ['Necesitas un General'], 'sola, en el Ejército Grande: no hay General'); eq(X('grand', true, []).slice(0, 1), ['Bruja Troll: no puede ser el General de un ejército hecho con la lista del Ejército Grande (es una opción Rara; solo puede serlo de una Horda Troll; faq_rh.txt:225-228)'], 'marcada como General en el Ejército Grande');
  eq(X('trollh', false, []), [], 'en la Horda Troll sí puede ser la General'); eq(X('grand', false, [{ type: 'orc_warboss', models: 1 }]), [], 'con un Jefe de Guerra en el Ejército Grande, él es el General');
  const g = (l) => { const s = R.createGame({ seed: 3, armies: [[{ type: 'troll_hag', models: 1 }, { type: 'trolls', models: 3 }, { type: 'orc_boyz', models: 20 }], [{ type: 'empire_general', models: 1 }, { type: 'state_troops', models: 20 }]], factions: ['orcs', 'empire'], limit: 1000, scn: 'glory', lists: [l, 'grand'] }); return R.D(s.units.find((u) => u.type === 'troll_hag')).general === true; };
  eq([g('trollh'), g('grand')], [true, false], 'en la partida: General solo en la Horda Troll');
});
T('rh-qa-018', F, 'Personaje con Marca sobre carro: el carro no se beneficia de la Marca del jinete salvo que se pague la Marca del carro (+10): sus Aurigas y Corceles solo tienen Ataques flamígeros (Tzeentch) con ella; no se admite pagarla sin Marca del jinete', () => {
  const run = (opts, mark = 'tzeentch', charge = false) => { const s = game([{ type: 'woc_lord_chariot', models: 1, mark, opts }], [{ type: 'state_troops', models: 20 }], { f: ['woc', 'empire'] }); const a = U(s, 'woc_lord_chariot', 0), d = U(s, 'state_troops', 1); engage(s, a, d); if (charge) { charged(s, a, d, 6); a.impactPend = { t: d.id, dist: 6 }; } cur(s); diceAll(6); globalThis.__WSL = []; fight(s); const W = globalThis.__WSL.filter((x) => x.def?.type !== 'woc_lord_chariot').map((x) => ({ S: x.S, ap: x.ap, fl: !!x.o.flaming, h: x.hits })); return { W, a, pts: R.unitPts(a) }; };
  const none = run([]), paid = run(['chm']), und = run([], 'undivided'), crew = (r) => r.W.filter((x) => x.S === 4), rider = (r) => r.W.filter((x) => x.S === 5 && x.ap === 1);
  ok(crew(none).length >= 2 && rider(none).length >= 1, 'montaje: se separan las tiradas de Aurigas/Corceles (F4) y del Señor (F5 FP −1)');
  ok(rider(none).every((x) => x.fl), 'el jinete con la Marca de Tzeentch: Ataques flamígeros'); ok(crew(none).every((x) => !x.fl), 'el carro NO se beneficia: sus Aurigas y Corceles no son flamígeros: ' + JSON.stringify(crew(none)));
  ok(crew(paid).every((x) => x.fl) && rider(paid).every((x) => x.fl), 'pagando la Marca del carro, todo es flamígero'); ok(crew(und).every((x) => !x.fl) && rider(und).every((x) => !x.fl), 'control: Marca Indivisa, nada es flamígero');
  eq([none.pts - und.pts, paid.pts - none.pts], [10, 10], 'coste: Marca del jinete +10 y Marca del carro +10 aparte');
  // validación: la Marca del carro solo si el jinete tiene una Marca distinta de la Indivisa
  const bad = DATA.armyIssues([{ type: 'woc_lord_chariot', models: 1, mark: 'undivided', opts: ['chm'] }], 1000, 'grand', 'grand'); ok(bad.some((x) => /Marca del carro/.test(x)), 'la Marca del carro sin Marca del jinete no es válida: ' + bad.join('; ')); ok(!DATA.armyIssues([{ type: 'woc_lord_chariot', models: 1, mark: 'tzeentch', opts: ['chm'] }], 1000, 'grand', 'grand').some((x) => /Marca del carro/.test(x)), 'con Marca distinta de la Indivisa sí');
  // Impactos de carga del carro: flamígeros solo con la Marca del carro
  const im = (r) => r.W.filter((x) => x.S === 5 && x.ap === 2); const c0 = run([], 'tzeentch', true), c1 = run(['chm'], 'tzeentch', true); ok(im(c0).length && im(c0).every((x) => !x.fl) && im(c1).every((x) => x.fl), 'Impactos de carga: flamígeros solo si el carro tiene la Marca: ' + JSON.stringify([im(c0), im(c1)]));
});
T('rh-qa-024', F, 'Hombres Bestia: 0-1 Piedra de las Manadas por ejército (incluido el contingente aliado)', () => {
  const MSG = 'Piedra de Manada: 0-1 por ejército, también con un contingente aliado de Hombres Bestia (FAQ RH)'; const H = (n) => issues([{ type: 'bm_beastlord', models: 1, gen: true }, { type: 'bm_gor', models: 20 }, ...Array.from({ length: n }, () => ({ type: 'bm_herdstone', models: 1 }))], 'grand', 2000).filter((x) => /Piedra/.test(x));
  eq([H(1), H(2)], [[], [MSG]], 'dentro del ejército principal');
  const A = (a) => issues([{ type: 'woc_lord', models: 1, gen: true }, { type: 'woc_warriors', models: 10 }, { type: 'bm_beastlord', models: 1, ally: 'bm:grand' }, { type: 'bm_gor', models: 20, ally: 'bm:grand' }, ...Array.from({ length: a }, () => ({ type: 'bm_herdstone', models: 1, ally: 'bm:grand' }))], 'grand', 3000).filter((x) => /Piedra/.test(x));
  eq([A(1), A(2)], [[], ['Aliados (Hombres Bestia · Gran Ejército): ' + MSG]], 'en el contingente aliado');
});
T('rh-qa-027', F, 'Necroesfinge: el Golpe decapitador es UN ataque adicional por turno', () => {
  const s = game([{ type: 'tk_necrosphinx', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['tk', 'empire'] }); const a = U(s, 'tk_necrosphinx'), d = U(s, 'state_troops', 1); d.files = 5; engage(s, a, d); cur(s);
  diceAll(4); const o = asks(s, (q) => fight(q), [0, 1], (n) => (/Aguij/.test(n.title) ? 'n' : undefined)); const b = blows(o.r, 'Necroesfinge'); ok(b.some((x) => x.n === 1), 'sin el ataque decapitador'); eq(b.reduce((t, x) => t + x.n, 0), UNITS.tk_necrosphinx.A + 1, 'ataques totales (A + 1)');
});
T('rh-qa-029', F, 'Ataúd de las Almas: puede hacer el Movimiento de reserva al final de la fase de Disparo si tiene la regla', () => {
  const s = game([{ type: 'tk_casket', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'tk_casket'), 36, 40); cur(s);
  withSr('tk_casket', ['reserveMove'], () => { const r = R.previewMove(s, c.id, { x: 36, y: 38, face: c.face }, false, true); ok(r.ok, 'no puede hacer el Movimiento de reserva: ' + r.reason); });
});
T('rh-qa-030', F, 'Resucitar modelos en una unidad de Escaramuzadores: los modelos resucitados vuelven a la unidad y quedan en coherencia (a ≤ 1" de otro modelo)', () => {
  const k = 'vc_risen'; ok(UNITS[k].sr.includes('skirmish'), 'montaje: unidad de Escaramuzadores (' + k + ')');
  const mk = (lost) => { const s = game([{ type: 'vc_necromancer', models: 1 }, { type: k, models: UNITS[k].max }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'], phase: 'strategy' }); const n = U(s, 'vc_necromancer', 0), t = U(s, k, 0); put(n, 36, 40); put(t, 36, 34, -Math.PI / 2); t.sp = 1; cur(s); R.applyWounds(t, lost); return { s, n, t }; };
  const coh = (t) => { const P = R.modelPts(t), bw = t.baseW / 25.4; return P.length < 2 || P.every((p, i) => P.some((q, j) => i !== j && Math.hypot(p.x - q.x, p.y - q.y) - bw <= 1 + 1e-6)); };
  const { s, n, t } = mk(4); const before = t.models; ok(coh(t), 'montaje: coherente tras las bajas (' + t.models + ' modelos)'); dice(1, 1); diceAll(6); const r = R.apply(s, { t: 'nehek', id: n.id, target: t.id }); ok(r.ok, r.error);
  ok(t.models > before && t.models <= UNITS[k].max, `los modelos resucitados vuelven: ${before} → ${t.models} (máx. ${UNITS[k].max})`); ok(coh(t), 'tras resucitar siguen en coherencia: cada modelo a ≤ 1" de otro'); ok(GEOM.dims(t).sp <= 1, 'separación entre modelos ≤ 1": ' + GEOM.dims(t).sp);
  const full = mk(0); dice(1, 1); diceAll(6); R.apply(full.s, { t: 'nehek', id: full.n.id, target: full.t.id }); ok(full.t.models <= UNITS[k].max, 'nunca supera el tamaño máximo/inicial');
});
T('rh-qa-032', F, 'Carros de la Guardia de la Tumba: armadura 4+ (los escudos de la dotación ya están incluidos)', () => { const s = game([{ type: 'tk_guardchariot', models: 3 }], [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'] }); const u = U(s, 'tk_guardchariot'); cur(s); eq(R.svOf(u), 4, 'armadura'); });
// Catay
T('cathay-qa-001', FC, 'Baliza celestial: +1/−1 a la llegada de Emboscadores, no acumulable con dos Linternas', () => {
  const s = game([{ type: 'ct_lanterns', models: 1 }, { type: 'ct_lanterns', models: 1 }, { type: 'ct_lanterns_amb', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['ct', 'orcs'], phase: 'strategy', turn: 2, keepRes: true }); cur(s);
  const w = (s.reserves || []).find((x) => x.ambusher); ok(w, 'montaje: sin Emboscadores en reserva'); w.ambushOK = false; dice(2); diceAll(1); const ev = []; const o = asks(s, (c) => { const e2 = []; R.beginStrategy(c, e2); return e2; }, [0, 1]); const m = msgs(o.r); ok(!/\+2/.test(m), 'la Baliza se acumula: ' + m.slice(0, 200));
});
T('cathay-qa-002', FC, 'Impacto atronador del Gran Cañón: no acumulable (dos puntos de impacto = −1 M, no −2)', () => {
  const s = game([{ type: 'ct_cannon', models: 1 }], [{ type: 'orc_boyz', models: 20 }], { f: ['ct', 'orcs'] }); const e = U(s, 'orc_boyz', 1); cur(s); e.fx.push({ k: 'thund', by: 0 }, { k: 'thund', by: 0 }); const M0 = UNITS.orc_boyz.M; ok(R.previewMove ? true : true, '');
  s.phase = 'move'; s.active = 1; put(e, 36, 30); cur(s); const lim = () => { for (let d = 12; d > 0; d -= 0.25) if (R.previewMove(s, e.id, { x: 36, y: 30 - d, face: e.face }).ok) return d; return 0; }; ok(lim() >= M0 - 1 - 0.3, `dos marcadores restan más de 1 (${lim()}" con M${M0})`);
});
