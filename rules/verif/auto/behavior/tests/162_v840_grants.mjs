// v840 — Las 28 concesiones de regla condicionadas (antes «no automatizables»): cada una se prueba con la condición CUMPLIDA y NO cumplida,
// ejecutando el motor (reglas efectivas con R.has, perfil de ataque, salvaciones y dados, validación con itemIssues/armyIssues) contra el texto del libro.
import { T, R, DATA, GEOM, ok, eq, cur, put, dice, diceAll, game, U, join, withSr, withoutSr, engage, fight, msgs, asks, wsl } from '../lib3.mjs';
import { bearer, profOf, meleeHits, thr, needOf, needCtl, FILE } from './_it2.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v840-it-grant-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const iss = (type, items, banner, list = 'grand', opts = []) => DATA.itemIssues(type, items, banner, false, list, opts);
const armyI = (arr, list = 'grand', frag) => DATA.armyIssues(arr, 3000, 'open', list).filter((x) => x.includes(frag));
const has = (key, rule, o = {}) => { const b = bearer(key, { phase: 'combat', ...o }); cur(b.s); return R.has(b.t, rule); };
const ctl = (key, rule, o = {}) => { const b = bearer(null, { like: key, phase: 'combat', ...o }); cur(b.s); return R.has(b.t, rule); };
const nm = (k) => ITEMS[k].name;
// regla concedida: con el objeto sí; sin él (control con el mismo portador) no
const gr = (key, rule, o = {}) => { ok(has(key, rule, o), `${nm(key)}: concede ${rule}`); if (!R.D(bearer(null, { like: key, phase: 'combat', ...o }).t).sr.includes(rule)) ok(!ctl(key, rule, o), `control sin objeto: sin ${rule}`); };
// restricción de lista: se rechaza fuera de su lista y se admite en ella
const listRule = (k, good, bad, type, o = {}) => {
  const slot = { type, models: o.models || 20, ...(o.e || {}), ...(ITEMS[k].cat === 's' ? { banner: k } : { items: [k] }) };
  const rej = armyI([slot], bad, nm(k)), acc = armyI([slot], good, nm(k));
  ok(rej.length >= 1 && /solo en/.test(rej[0]), `fuera de su lista («${bad}») se rechaza: ${JSON.stringify(rej)}`); eq(acc, [], `en su lista («${good}») sin incidencia del objeto`);
};
const noIss = (type, items, banner, frag, msg, list = 'grand', opts = []) => eq(iss(type, items, banner, list, opts).filter((x) => x.includes(frag)), [], msg);
const yesIss = (type, items, banner, frag, re, msg, list = 'grand', opts = []) => { const r = iss(type, items, banner, list, opts).filter((x) => x.includes(frag)); ok(r.length >= 1 && re.test(r.join('|')), `${msg}: ${JSON.stringify(r)}`); };

// ——— «Miedo (Terror si ya lo tenía)»: Mortaja de Shiyama (cathay_dawn.txt:1302-1306), Icono de Morr (aj_empire2.txt:1658-1663), Emblema del Asaltante Marino (aj_chaos2.txt:1660-1663) ———
for (const [k, stdType, list, otherList] of [['ct_shroud', 'ct_jade', 'grand', null], ['empaj_morr', 'state_troops', 'grand', null], ['wocaj_crest', 'woc_warriors', 'wolves', 'grand']]) {
  TT(k, 'Miedo; Terror si la unidad ya tiene Miedo (condición cumplida y no cumplida)' + (otherList ? '; solo en Lobos del Mar' : ''), () => {
    ok(!UNITS[stdType].sr.includes('fear') && !UNITS[stdType].sr.includes('terror'), 'montaje: la unidad base no causa Miedo ni Terror');
    ok(has(k, 'fear', { stdType }), 'sin Miedo previo: gana Miedo'); ok(!has(k, 'terror', { stdType }), 'sin Miedo previo: NO gana Terror'); ok(!ctl(k, 'fear', { stdType }), 'control sin estandarte: sin Miedo');
    withSr(stdType, 'fear', () => { ok(has(k, 'terror', { stdType }), 'con Miedo previo: gana Terror'); ok(!ctl(k, 'terror', { stdType }), 'control (con Miedo, sin estandarte): sin Terror'); ok(ctl(k, 'fear', { stdType }), 'control: conserva su Miedo'); });
    withSr(stdType, 'terror', () => ok(has(k, 'terror', { stdType }), 'con Terror previo: sigue con Terror'));
    if (otherList) listRule(k, list, otherList, stdType); else eq(armyI([{ type: stdType, models: 20, banner: k }], 'grand', nm(k)), [], 'sin restricción de lista');
  });
}
// ——— Linterna Espiritual (cathay_aj.txt:2762-2767) ———
TT('ct_spiritlantern', 'el portador causa Terror (no la unidad a la que se une); repite los 1 naturales para herir contra Demoníacos y No muertos, no contra el resto', () => {
  const type = 'ct_magistrate';
  ok(has('ct_spiritlantern', 'terror', { type }) && !ctl('ct_spiritlantern', 'terror', { type }), 'el portador causa Terror (el control no)');
  for (const foe of ['vc_skeletons', 'dm_plaguebearers', 'vc_zombies']) { const a = profOf('ct_spiritlantern', { type, foe }), c = profOf(null, { like: 'ct_spiritlantern', type, foe }); ok(R.has(a.a, 'undead') || R.has(a.a, 'daemonic') || /dm_|vc_/.test(foe), 'montaje'); ok(a.P.rr1 && !c.P.rr1, `contra ${foe} repite los 1 para herir`); }
  for (const foe of ['state_troops', 'orc_boyz', 'we_glade_guard']) ok(!profOf('ct_spiritlantern', { type, foe }).P.rr1, `contra ${foe} (ni Demoníaco ni No muerto) no repite`);
  // la repetición actúa en la tirada de herir: un 1 natural se repite (6 → hiere); sin repetición un 1 falla
  const b = profOf('ct_spiritlantern', { type, foe: 'vc_skeletons' }); cur(b.s); dice([1, 6]); diceAll(1); const w1 = R.woundAndSave(b.s, b.a, 1, 10, 10, { rerollOnes: b.P.rr1, auto: false, noRegen: true }); dice([1]); diceAll(1); const w0 = R.woundAndSave(b.s, b.a, 1, 10, 10, { rerollOnes: false, noRegen: true });
  ok(w1.through >= 1 && w0.through === 0, `con repetición el 1 natural se repite y hiere (${w1.through}); sin ella falla (${w0.through})`);
  // personaje unido: la unidad no gana Terror (Core p.168: Miedo y Terror no pasan a la unidad)
  const s = game([{ type: 'ct_jade', models: 10 }, { type: 'ct_magistrate', models: 1, items: ['ct_spiritlantern'] }], [{ type: 'vc_skeletons', models: 10 }], { f: ['ct', 'vc'] }); const h = U(s, 'ct_jade', 0), c = U(s, 'ct_magistrate', 0); join(s, c, h); cur(s); ok(R.has(c, 'terror') && !R.has(h, 'terror'), 'el personaje causa Terror y la unidad no');
});
// ——— El Lenguaje de los Sacerdotes (aj_tk2.txt:681-692) ———
TT('tk_language', 'solo el General Rey/Príncipe: ¡Levantaos! y Mago de nivel 1 del Saber de la Nigromancia; es el Hierofante aunque no tenga el nivel más alto; armadura sin penalización', () => {
  const mk = (items, o = {}) => { const s = game([{ type: 'tk_king', models: 1, items }, { type: 'tk_hpriest', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'], phase: 'shoot' }); const k = U(s, 'tk_king', 0), p = U(s, 'tk_hpriest', 0); put(k, 36, 40); put(p, 20, 44); cur(s); return { s, k, p }; };
  const w = mk(['tk_language']), c = mk([]);
  ok(R.has(w.k, 'arise') && !R.has(c.k, 'arise'), '¡Levantaos! (Arise!) solo con el objeto'); eq(R.D(w.k).wizard?.level, 1, 'Mago de nivel 1'); eq(R.D(w.k).wizard?.lore, 'necro', 'Saber de la Nigromancia'); ok(!R.D(c.k).wizard, 'control: el Rey no es mago');
  ok(R.D(w.p).wizard.level > 1, 'montaje: el Sumo Sacerdote tiene un nivel mayor (' + R.D(w.p).wizard.level + ')');
  cur(w.s); R.hieroInit(w.s); eq(w.s.hiero[0], w.k.id, 'el Rey con el Lenguaje es el Hierofante aunque el Sumo Sacerdote tenga mayor nivel'); cur(c.s); R.hieroInit(c.s); eq(c.s.hiero[0], c.p.id, 'control: sin el objeto el Hierofante es el de mayor nivel (el Sumo Sacerdote)');
  // armadura sin penalización: con armadura mágica el Rey (nivel 1) puede lanzar; un mago normal con armadura no
  const arm = Object.keys(ITEMS).find((k) => ITEMS[k].fac === 'tk' && ITEMS[k].cat === 'a' && ITEMS[k].sv);
  const wa = mk(['tk_language', arm]); wa.k.spells = R.D(wa.k).wizard.spells.length ? wa.k.spells : ['deathly_cabal']; wa.k.casted = []; cur(wa.s);
  const msg = R.castCheck(wa.s, wa.k, wa.k.spells[0], U(wa.s, 'state_troops', 1)); ok(!/armadura/i.test(String(msg || '')), 'con armadura (' + arm + ') no hay penalización: ' + msg);
  const en = game([{ type: 'empire_mage', models: 1, items: Object.keys(ITEMS).filter((k) => ITEMS[k].fac === 'empire' && ITEMS[k].cat === 'a' && ITEMS[k].sv).slice(0, 1) }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const m = U(en, 'empire_mage', 0); put(m, 36, 40); m.casted = []; cur(en); ok(/armadura/i.test(String(R.castCheck(en, m, (R.D(m).wizard.spells || [])[0] || (m.spells || [])[0] || 'fireball', U(en, 'state_troops', 1)) || '')), 'control: un Mago ordinario con armadura sí tiene la penalización');
  // restricción: solo Rey o Príncipe Funerario (también en carro); no Sacerdotes ni otros
  noIss('tk_king', ['tk_language'], null, 'Lenguaje', 'Rey: permitido'); noIss('tk_prince', ['tk_language'], null, 'Lenguaje', 'Príncipe: permitido'); noIss('tk_king_chariot', ['tk_language'], null, 'Lenguaje', 'Rey en carro: permitido');
  for (const t of ['tk_hpriest', 'tk_mpriest', 'tk_herald']) yesIss(t, ['tk_language'], null, 'Lenguaje', /no está disponible/, `${t}: rechazado`);
  ok(armyI([{ type: 'tk_king', models: 1, items: ['tk_language'] }], 'grand', 'Lenguaje').some((x) => /solo en Hueste Real/.test(x)) && armyI([{ type: 'tk_king', models: 1, items: ['tk_language'] }], 'royalhost', 'Lenguaje').length === 0, 'solo en la Hueste Real (Army of Infamy)');
});
// ——— Gran Nombre: Mawseeker (leg_ogres.txt:787-792) ———
TT('bn_mawseeker', 'solo infantería: +1 Resistencia y Estupidez (también a la unidad a la que se une)', () => {
  const b = bearer('bn_mawseeker', { type: 'ok_tyrant', phase: 'combat' }), c = bearer(null, { like: 'bn_mawseeker', type: 'ok_tyrant', phase: 'combat' }); cur(b.s); const t1 = R.D(b.t).T; cur(c.s); const t0 = R.D(c.t).T; eq(t1 - t0, 1, 'Resistencia +1');
  ok(has('bn_mawseeker', 'stupidity', { type: 'ok_tyrant' }) && !ctl('bn_mawseeker', 'stupidity', { type: 'ok_tyrant' }), 'sufre Estupidez');
  const s = game([{ type: 'ok_bulls', models: 6 }, { type: 'ok_tyrant', models: 1, items: ['bn_mawseeker'] }], [{ type: 'state_troops', models: 10 }], { f: ['ok', 'empire'] }); const h = U(s, 'ok_bulls', 0), ch = U(s, 'ok_tyrant', 0); join(s, ch, h); cur(s); ok(R.has(h, 'stupidity'), 'la unidad a la que se une también tiene Estupidez (Core p.168)');
  noIss('ok_tyrant', ['bn_mawseeker'], null, 'Mawseeker', 'infantería: permitido'); for (const t of ['ok_tyrant_stone', 'ok_tyrant_thunder']) yesIss(t, ['bn_mawseeker'], null, 'Mawseeker', /solo para infantería/, `${t} (no infantería): rechazado`);
});
// ——— Mangelder (rh.txt:4848-4854) ———
TT('bm_mangelder', 'F+1, FP −1, Terror del portador; la unidad enemiga con heridas sin salvar sufre −1 Ld (mín. 2) hasta el final del turno; sin heridas sin salvar, nada', () => {
  const type = 'bm_beastlord'; const a = profOf('bm_mangelder', { type, foe: 'state_troops' }), c = profOf(null, { like: 'bm_mangelder', type, foe: 'state_troops' });
  eq([a.P.S - c.P.S, a.P.ap - c.P.ap], [1, 1], 'F+1 y FP −1'); ok(R.has(a.t, 'terror') && !R.has(c.t, 'terror'), 'el portador causa Terror');
  const run = (v, q) => { const b = bearer('bm_mangelder', { type, foe: 'state_troops', foeN: 10, phase: 'combat' }); put(b.t, 36, 24, -Math.PI / 2); engage(b.s, b.a, b.t); b.s.phase = 'combat'; b.s.active = 1; b.t.chargeOK = true; cur(b.s); const ld0 = R.ldOf(b.s, b.a); diceAll(v); const ev = fight(b.s); return { b, ld0, ld1: R.ldOf(b.s, b.a), m: msgs(ev) }; };
  const hurt = run(4), none = run(1);
  ok(/golpea/.test(hurt.m) && hurt.ld1 === Math.max(2, hurt.ld0 - 1), `con heridas sin salvar: −1 Ld (${hurt.ld0} → ${hurt.ld1}): ${hurt.m.slice(0, 160)}`);
  ok(none.ld1 === none.ld0, `sin heridas sin salvar no hay −1 Ld (${none.ld0} → ${none.ld1})`);
  // mínimo 2: una unidad de Ld 3 queda en 2, una de Ld 2 sigue en 2
  const lo = bearer('bm_mangelder', { type, foe: 'state_troops', phase: 'combat' }); cur(lo.s); lo.a.fx = [{ k: 'mangel', by: 1 }]; const base = R.ldOf(lo.s, lo.a); lo.a.fx = []; const base0 = R.ldOf(lo.s, lo.a); ok(base === Math.max(2, base0 - 1), 'el modificador respeta el mínimo de 2');
  const f2 = withLdLocal('state_troops', 2, () => { const z = bearer('bm_mangelder', { type, foe: 'state_troops', phase: 'combat' }); cur(z.s); z.a.fx = [{ k: 'mangel', by: 1 }]; return R.ldOf(z.s, z.a); }); eq(f2, 2, 'Ld 2: sigue en 2 (mínimo)');
  // hasta el final del turno: al acabar el turno el efecto desaparece
  const e = run(4); ok(R.ldOf(e.b.s, e.b.a) === Math.max(2, e.ld0 - 1), 'montaje: efecto activo'); const ev2 = []; R.endPlayerTurn(e.b.s, ev2); cur(e.b.s); const aa = e.b.s.units.find((u) => u.id === e.b.a.id); eq(R.ldOf(e.b.s, aa), e.ld0, 'al acabar el turno el −1 Ld ha terminado');
});
const withLdLocal = (type, ld, fn) => { const d = UNITS[type], old = d.Ld; d.Ld = ld; try { return fn(); } finally { d.Ld = old; } };
// ——— Báculo Serpiente (rh.txt:6539-6546) ———
TT('tk_serpent', 'solo Sacerdotes Liche: F+2, FP −2, ataques envenenados y mágicos, dos manos', () => {
  const type = 'tk_hpriest'; const a = profOf('tk_serpent', { type, foe: 'state_troops' }), c = profOf(null, { like: 'tk_serpent', type, foe: 'state_troops' });
  eq([a.P.S - c.P.S, a.P.ap - c.P.ap], [2, 2], 'F+2 y FP −2'); ok(R.has(a.t, 'poisoned') && !R.has(c.t, 'poisoned'), 'Ataques envenenados'); ok(ITEMS.tk_serpent.twoH, 'Requiere dos manos');
    for (const t of ['tk_hpriest', 'tk_mpriest']) noIss(t, ['tk_serpent'], null, 'Serpiente', t + ': Sacerdote permitido'); for (const t of ['tk_king', 'tk_prince', 'tk_herald']) yesIss(t, ['tk_serpent'], null, 'Serpiente', /solo para Sacerdotes/, t + ': rechazado');
  yesIss('tk_hpriest', ['tk_serpent'], null, 'Serpiente', /dos manos/, 'con escudo (opción sh) se rechaza: requiere dos manos', 'grand', ['sh']);
});
// ——— Capa de las Dunas (rh.txt:6598-6606) ———
TT('tk_dunes', 'solo infantería: Volar (9); cada unidad enemiga sobre la que mueve en Movimientos restantes sufre D6 impactos F2 FP −1; sin el objeto no hay impactos; las unidades amigas no', () => {
  const mk = (items) => { const s = game([{ type: 'tk_king', models: 1, items }, { type: 'tk_warriors', models: 10 }], [{ type: 'state_troops', models: 10 }, { type: 'orc_boyz', models: 10 }], { f: ['tk', 'empire'], phase: 'move' }); const u = U(s, 'tk_king', 0), fr = U(s, 'tk_warriors', 0), e1 = U(s, 'state_troops', 1), e2 = U(s, 'orc_boyz', 1); put(u, 36, 38.5, -Math.PI / 2); put(e1, 36, 34, Math.PI / 2); put(fr, 28, 30, Math.PI / 2); put(e2, 60, 34, Math.PI / 2); cur(s); return { s, u, e1, e2, fr }; };
  const go = (items, dest) => { const x = mk(items); diceAll(4); const w = wsl(() => R.apply(x.s, { t: 'move', id: x.u.id, x: 36, y: dest, face: -Math.PI / 2 })); return { ...x, r: w.r, log: w.log.filter((e) => e.def.id === x.e1.id || e.def.id === x.fr.id || e.def.id === x.e2.id) }; };
  const a = go(['tk_dunes'], 30); ok(a.r.ok, a.r.error); ok(R.has(a.u, 'flyer'), 'Volar'); eq(R.D(a.u).M, 9, 'Volar (9): Movimiento 9'); const l = a.log.find((e) => e.def.id === a.e1.id); ok(l && l.hits === 4 && l.S === 2 && l.ap === 1, 'D6 (=4) impactos F2 FP −1: ' + JSON.stringify(a.log.map((e) => [e.def.type, e.hits, e.S, e.ap])));
  ok(!a.log.some((e) => e.def.id === a.e2.id), 'la unidad enemiga no sobrevolada no sufre impactos'); const b = go([], 30); ok(b.r.ok === false || !b.log.some((e) => e.def.id === b.e1.id), 'sin el objeto no hay impactos'); const s2 = go(['tk_dunes'], 36.5); ok(!s2.log.some((e) => e.def.id === s2.e1.id), 'sin pasar por encima (se queda antes) no hay impactos');
  const fr = go(['tk_dunes'], 30); ok(!fr.log.some((e) => e.def.id === fr.fr.id), 'las unidades amigas no sufren impactos');
  noIss('tk_king', ['tk_dunes'], null, 'Dunas', 'infantería: permitido'); yesIss('tk_king_chariot', ['tk_dunes'], null, 'Dunas', /solo para infantería/, 'carro: rechazado');
});
// ——— Estandarte Real de Settra (aj_tk2.txt:1407-1411) ———
TT('tkaj_settra', 'solo en una lista con Settra o Nekaph: la unidad gana Odio (personajes enemigos) y Terror', () => {
  ok(has('tkaj_settra', 'terror') && !ctl('tkaj_settra', 'terror'), 'Terror');
  const ch = profOf('tkaj_settra', { foe: 'empire_captain' }), no = profOf('tkaj_settra', { foe: 'state_troops' }), cc = profOf(null, { like: 'tkaj_settra', foe: 'empire_captain' }); ok(ch.P.hatred && !no.P.hatred && !cc.P.hatred, 'Odio solo contra personajes enemigos (' + [ch.P.hatred, no.P.hatred, cc.P.hatred] + ')');
  const mk = (extra) => [{ type: 'tk_warriors', models: 20, banner: 'tkaj_settra' }, ...extra];
  ok(armyI(mk([{ type: 'tk_king', models: 1 }]), 'grand', 'Settra').length >= 1, 'sin Settra ni Nekaph se rechaza'); eq(armyI(mk([{ type: 'tk_settra', models: 1 }]), 'grand', 'Settra'), [], 'con Settra se admite'); eq(armyI(mk([{ type: 'tk_nekaph', models: 1 }]), 'grand', 'Settra'), [], 'con Nekaph se admite');
});
// ——— Estandarte de los Vientos del Desierto (aj_tk2.txt:1436-1438) ———
TT('tkaj_winds', 'solo infantería: la unidad gana Vanguardia y Movimiento de reserva', () => {
  gr('tkaj_winds', 'vanguard'); gr('tkaj_winds', 'reserveMove');
  for (const t of ['tk_warriors', 'tk_necroknights']) eq(iss(t, [], 'tkaj_winds').filter((x) => /Vientos/.test(x)), [], t + ' (infantería, también monstruosa: subcategoría de infantería, core.txt:3118): permitido'); for (const t of ['tk_horsemen', 'tk_chariot']) ok(iss(t, [], 'tkaj_winds').some((x) => /solo para unidades de infantería/.test(x)), `${t}: rechazado`);
});
// ——— Escamas de la Serpiente Poderosa (aj_chaos2.txt:1649-1657) ———
TT('wocaj_scalemail', 'solo Lobos del Mar: armadura pesada y Ataca primero', () => {
  const type = 'woc_chieftain'; const b = bearer('wocaj_scalemail', { type, phase: 'combat' }), c = bearer(null, { like: 'wocaj_scalemail', type, phase: 'combat' }); cur(b.s); const s1 = R.svOf(b.t); cur(c.s); const s0 = R.svOf(c.t); ok(s1 === 5 || s1 < s0, `armadura pesada (5+): ${s1} (control ${s0})`);
  const bl = bearer('wocaj_scalemail', { type: 'woc_exalted', phase: 'combat' }); cur(bl.s); const ex = UNITS.woc_exalted; ok(R.svOf(bl.t) <= 5, 'armadura pesada o mejor');
  ok(has('wocaj_scalemail', 'strikeFirst', { type }) && !ctl('wocaj_scalemail', 'strikeFirst', { type }), 'Ataca primero');
  listRule('wocaj_scalemail', 'wolves', 'grand', type, { models: 1 });
});
// ——— Estandarte del Sabueso Aullador (aj_chaos2.txt:1652-1655) ———
TT('wocaj_hound', 'solo Heraldos de la Oscuridad: Vanguardia', () => { gr('wocaj_hound', 'vanguard'); listRule('wocaj_hound', 'heralds', 'grand', 'woc_knights', { models: 5 }); });
// ——— Estandarte de los Caballeros Pantera (aj_empire2.txt:1645-1648) ———
TT('empaj_panther', 'solo Portaestandarte de batalla de la Orden Pantera: la unidad gana Inquebrantable', () => {
  gr('empaj_panther', 'unbreakable');
  const mk = (ord) => [{ type: 'emp_chaptermaster', models: 1, gen: true, opts: ['ord_pan'] }, { type: 'empire_knights', models: 5, banner: 'empaj_panther', opts: ord ? [ord] : [] }];
  const withOrd = armyI(mk('ord_pan'), 'knights_pan', 'Pantera').filter((x) => /solo para un portaestandarte de la Orden Pantera/.test(x)), noOrd = armyI(mk(null), 'knights_pan', 'Pantera').filter((x) => /solo para un portaestandarte de la Orden Pantera/.test(x));
  ok(noOrd.length >= 1, 'sin la Orden Pantera se rechaza: ' + JSON.stringify(noOrd)); eq(withOrd, [], 'con la Orden Pantera sin incidencia de Orden');
  const noBsb = DATA.itemIssues('empire_knights', [], 'empaj_panther', false, 'knights_pan', ['ord_pan']).filter((x) => /Estandarte mágico/.test(x)), asBsb = DATA.itemIssues('empire_knights', [], 'empaj_panther', true, 'knights_pan', ['ord_pan']).filter((x) => /Estandarte mágico/.test(x));
  ok(ITEMS.empaj_panther.cost > 50 && noBsb.length === 1, 'sin ser Portaestandarte de batalla supera el tope de estandarte (80 > 50): ' + JSON.stringify(noBsb)); eq(asBsb, [], 'como Portaestandarte de batalla (sin tope) se admite');
});
// ——— Banner del Estado Libre de Nuln (aj_empire2.txt:1666-1673) ———
TT('empaj_nuln', 'solo Ciudad-Estado de Nuln: la unidad gana Tozudos', () => { gr('empaj_nuln', 'stubborn'); listRule('empaj_nuln', 'nuln', 'grand', 'state_troops'); });
// ——— Tapiz del Cruzado y Estandarte del Caballero Celoso (aj_bretonnia.txt:1674-1676, 1683-1686) ———
TT('brsaj_tapestry', 'solo Cruzada Errante: la unidad gana Frenesí', () => { gr('brsaj_tapestry', 'frenzy', { stdType: 'br_errant' }); listRule('brsaj_tapestry', 'crusade', 'grand', 'br_errant', { models: 5 }); });
TT('brsaj_zealous', 'solo Exiliados: la unidad gana Vanguardia', () => { gr('brsaj_zealous', 'vanguard', { stdType: 'br_errant' }); listRule('brsaj_zealous', 'exiles', 'grand', 'br_errant', { models: 5 }); });
// ——— Barba del Lammasu (leg_chaosdwarfs.txt:733-739) ———
TT('cdl_beard', 'salvación especial 6+ y Resistencia a la magia (−2) de la unidad; amigos a 6": 5+ contra heridas de la fase de Disparo y Resistencia a la magia (−1); lejos o en el combate: nada', () => {
  const mk = (d, items) => { const s = game([{ type: 'cd_guard', models: 20, banner: 'cdl_beard', std: true }, { type: 'cd_hobgoblins', models: 10 }, { type: 'cd_blackorcs', models: 10 }], [{ type: 'handgunners', models: 10 }], { f: ['cd', 'empire'], phase: 'shoot' }); const g = U(s, 'cd_guard', 0), n = U(s, 'cd_hobgoblins', 0), far = U(s, 'cd_blackorcs', 0); g.banner = 'cdl_beard'; put(g, 36, 40); put(n, 36, 40 - (R.dims ? 0 : 0) - 4 - d, Math.PI / 2); put(far, 8, 40); cur(s); return { s, g, n, far }; };
  const x = mk(1), save = (s, def, ctx, v) => { cur(s); diceAll(v); return R.woundAndSave(s, def, 1, 10, 10, { noRegen: true, auto: true, ...ctx }).through; };
  // la unidad que lleva el estandarte
  eq(save(x.s, x.g, {}, 5), 1, 'la unidad: con 5 no salva (6+)'); eq(save(x.s, x.g, {}, 6), 0, 'la unidad: con 6 salva (6+ contra cualquier herida)'); eq(R.mrOf(x.g), 2, 'Resistencia a la magia (−2)');
  eq(save(x.s, x.g, { ranged: true }, 5), 0, 'la unidad que lo lleva también está a 6" del portador: 5+ contra disparos'); eq(save(x.s, x.g, { ranged: true }, 4), 1, 'la unidad: con 4 no salva ni disparos (5+)');
  // unidad amiga a 6" (hueco 1")
  ok(GEOM.unitDist(x.g, x.n) <= 6, 'montaje: a ≤ 6" (' + GEOM.unitDist(x.g, x.n).toFixed(2) + ')'); eq(save(x.s, x.n, { ranged: true }, 5), 0, 'amiga a 6": 5+ contra disparos'); eq(save(x.s, x.n, { ranged: true }, 4), 1, 'amiga a 6": con 4 no salva'); eq(save(x.s, x.n, {}, 6), 1, 'amiga: contra heridas de combate no tiene salvación especial (solo en la fase de Disparo)'); eq(R.mrOf(x.n), 1, 'amiga a 6": Resistencia a la magia (−1)');
  eq(save(x.s, x.far, { ranged: true }, 6), 1, 'amiga lejos (>6"): sin salvación especial'); eq(R.mrOf(x.far), 0, 'amiga lejos: sin Resistencia a la magia');
  ok(!R.D(R.has ? x.n : x.n).sr.includes('magRes'), 'montaje');
});
// ——— Tótem de Calaveras (leg_daemons.txt:1116-1118) ———
TT('dml_skull', 'solo Khorne: la unidad (no sus monturas) gana Carga furiosa', () => {
  gr('dml_skull', 'furiousCharge', { stdType: 'dm_bloodletters' });
  const a = profOf('dml_skull', { stdType: 'dm_bloodletters', foe: 'state_troops', charge: true }), c = profOf(null, { like: 'dml_skull', stdType: 'dm_bloodletters', foe: 'state_troops', charge: true }); ok(a.P.atk > c.P.atk, `+1 Ataque al cargar (${c.P.atk} → ${a.P.atk})`);
  const n = profOf('dml_skull', { stdType: 'dm_bloodletters', foe: 'state_troops' }); const n0 = profOf(null, { like: 'dml_skull', stdType: 'dm_bloodletters', foe: 'state_troops' }); eq(n.P.atk, n0.P.atk, 'sin cargar no hay Ataque extra');
  // monturas: el Ataque extra es de los jinetes, no de la montura
  const sk = profOf('dml_skull', { stdType: 'dm_skullcannon', foe: 'state_troops', charge: true }), sk0 = profOf(null, { like: 'dml_skull', stdType: 'dm_skullcannon', foe: 'state_troops', charge: true }); const mAtk = (p) => Math.round((p.P.mountFrac || 0) * p.P.atk); eq(mAtk(sk), mAtk(sk0), 'los Ataques de la montura no aumentan');
  noIss('dm_bloodletters', [], 'dml_skull', 'Calaveras', 'Khorne: permitido'); for (const t of ['dm_plaguebearers', 'dm_daemonettes', 'dm_pinkhorrors']) ok(iss(t, [], 'dml_skull').some((x) => /Calaveras.*otra alineación/.test(x)), `${t}: rechazado`);
});
// ——— Atractivo de Slaanesh (leg_daemons.txt:1212-1216) y Poder vampírico Embaucar (leg_vampires.txt:986-989) ———
for (const [k, type, ok1, bad1] of [['dml_allure', 'dm_herald_slaanesh', ['dm_herald_slaanesh'], ['dm_herald_khorne', 'dm_herald_nurgle', 'dm_herald_tzeentch']], ['vcl_p_beguile', 'vc_count', ['vc_count', 'vc_thrall'], ['vc_wightking', 'vc_necromancer']]]) {
  TT(k, 'los enemigos pasan un chequeo de Ld antes de impactar en combate: si lo fallan solo impactan con 6; con Ld superado, normal; no afecta a disparos; ' + (k === 'dml_allure' ? 'solo Daemons de Slaanesh' : 'solo Vampiros'), () => {
    const eff = k === 'dml_allure' ? undefined : type; /* el efecto no depende de la alineación: el Heraldo de Slaanesh ataca con dados antes del chequeo de Ld y desordena la cola de dados; se usa el portador por defecto */ gr(k, 'beguile', { type: eff }); gr(k, 'beguile', { type }); const F = 'dw_warriors'; return withoutSr(eff || bearer(k, { phase: 'combat' }).type, 'fear', () => withoutSr(eff || bearer(k, { phase: 'combat' }).type, 'terror', () => { let t0 = 7; for (let v = 2; v <= 6; v++) { if (meleeHits(null, { like: k, type: eff, foe: F, foeN: 5, v, mute: true }).h > 0) { t0 = v; break; } } ok(t0 <= 5, 'umbral base ' + t0 + '+');
    eq(meleeHits(k, { type: eff, foe: F, foeN: 5, v: t0, q: [6, 5], mute: true }).h, 0, 'Ld fallado (11 > Ld): solo con 6'); ok(meleeHits(k, { type: eff, foe: F, foeN: 5, v: 6, q: [6, 5], mute: true }).h > 0, 'Ld fallado: un 6 sí impacta'); ok(meleeHits(k, { type: eff, foe: F, foeN: 5, v: t0, q: [1, 2], mute: true }).h > 0, 'Ld superado: impacta normalmente');
    eq(meleeHits(k, { type: eff, foe: F, foeN: 5, v: t0, q: [1, 1], mute: true }).h > 0, true, 'doble 1: supera el chequeo'); ok(meleeHits(k, { type: eff, foe: F, foeN: 5, v: t0 - 0, q: [6, 6], mute: true }).h === 0 || t0 === 6, 'doble 6: falla el chequeo');
    eq(needOf(k, { type: eff }), needCtl(k, { type: eff }), 'contra disparos no cambia el valor necesario para impactar');
    if (k === 'dml_allure') { for (const t of ok1) noIss(t, [k], null, 'Atractivo', t + ': permitido'); for (const t of bad1) yesIss(t, [k], null, 'Atractivo', /solo para Daemons de Slaanesh/, t + ': rechazado'); }
    else { for (const t of ok1) noIss(t, [k], null, 'poderes vampíricos', t + ': Vampiro permitido'); for (const t of bad1) yesIss(t, [k], null, 'poderes vampíricos', /poderes vampíricos/, t + ': no Vampiro (sin presupuesto)'); }
  })); });
}
// ——— Estandarte de la Discordia (leg_daemons.txt:1254-1257) ———
TT('dml_discord', 'solo Tzeentch: Resistencia a la magia (−3) a la unidad; amigas a 6": (−1); lejos: nada', () => {
  gr('dml_discord', 'magRes3', { stdType: 'dm_pinkhorrors' });
  const s = game([{ type: 'dm_pinkhorrors', models: 10, banner: 'dml_discord', std: true }, { type: 'dm_bluehorrors', models: 10 }, { type: 'dm_flamers', models: 3 }, { type: 'dm_fleshhounds', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'] }); const g = U(s, 'dm_pinkhorrors', 0), n = U(s, 'dm_bluehorrors', 0), far = U(s, 'dm_flamers', 0); g.banner = 'dml_discord'; put(g, 36, 40); put(n, 36, 40 - 6 - 1, Math.PI / 2); put(far, 8, 40); cur(s);
  ok(GEOM.unitDist(g, n) <= 6 && GEOM.unitDist(g, far) > 6, 'montaje'); eq(R.mrOf(g), 3, 'la unidad: Resistencia a la magia (−3)'); eq(R.mrOf(n), 1, 'amiga a 6": (−1)'); eq(R.mrOf(far), 0, 'lejos: nada');
  noIss('dm_pinkhorrors', [], 'dml_discord', 'Discordia', 'Tzeentch: permitido (solo falla el tope de estandarte)'.replace('permitido', 'permitido'));
  for (const t of ['dm_bloodletters', 'dm_plaguebearers', 'dm_daemonettes']) ok(iss(t, [], 'dml_discord').some((x) => /Discordia.*otra alineación/.test(x)), `${t}: rechazado`);
});
// ——— Capa de Plumas (leg_lizardmen.txt:800-802) ———
TT('lml_feathers', 'solo Héroes Skink de infantería: Volar (10) y Zancada veloz', () => {
  const type = 'lm_skchief'; gr('lml_feathers', 'flyer', { type }); gr('lml_feathers', 'swiftstride', { type }); const b = bearer('lml_feathers', { type, phase: 'combat' }); cur(b.s); eq(R.D(b.t).M, 10, 'Volar (10): Movimiento 10');
  for (const t of ['lm_skchief', 'lm_skpriest']) noIss(t, ['lml_feathers'], null, 'Plumas', t + ': Héroe Skink de infantería permitido'); for (const t of ['lm_oldblood', 'lm_scar', 'lm_slann', 'lm_skchief_steg', 'lm_skpriest_ancient']) yesIss(t, ['lml_feathers'], null, 'Plumas', /no está disponible|solo para infantería/, t + ': rechazado');
});
// ——— Disciplinas del Slann (leg_lizardmen.txt:690-707) ———
for (const [k, rule, line] of [['lml_d_higher', 'ethereal', '690-692'], ['lml_d_scrutiny', 'terror', '703-707']]) TT(k, `solo Slann: gana ${rule === 'ethereal' ? 'Etéreo' : 'Terror'} (leg_lizardmen.txt:${line})`, () => {
  gr(k, rule, { type: 'lm_slann' }); noIss('lm_slann', [k], null, ITEMS[k].name, 'Slann: permitido'); for (const t of ['lm_oldblood', 'lm_scar', 'lm_skchief', 'lm_skpriest']) yesIss(t, [k], null, ITEMS[k].name, /solo para el Slann|solo para magos|no está disponible|no puede/, t + ': rechazado');
  // un mago que no es Slann (Sacerdote Skink) no puede: el objeto exige el atributo slann y mago
  ok(ITEMS[k].slann && ITEMS[k].wiz, 'datos: solo Slann y mago');
});
// ——— Horror Volador (leg_vampires.txt:994-998) ———
TT('vcl_p_flying', 'solo infantería: Volar (10); no puede unirse a una unidad; solo Vampiros', () => {
  const type = 'vc_count'; gr('vcl_p_flying', 'flyer', { type }); const b = bearer('vcl_p_flying', { type, phase: 'combat' }); cur(b.s); eq(R.D(b.t).M, 10, 'Volar (10)');
  noIss('vc_count', ['vcl_p_flying'], null, 'Horror', 'infantería: permitido'); for (const t of ['vc_count_nightmare', 'vc_count_dragon', 'vc_count_terror']) yesIss(t, ['vcl_p_flying'], null, 'Horror', /solo para infantería/, t + ': rechazado');
  // no puede unirse a unidades: la unión se rechaza al desplegar
  const s = game([{ type: 'vc_zombies', models: 10 }, { type: 'vc_count', models: 1, items: ['vcl_p_flying'] }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'], join: true }); const c = U(s, 'vc_count', 0), z = U(s, 'vc_zombies', 0); cur(s);
  ok(!(z.joined || []).includes(c) && !c.hostId, 'tras el despliegue automático no se ha unido a ninguna unidad'); const r = R.apply(s, { t: 'join', id: c.id, host: z.id }); ok(!r.ok, 'unirse a una unidad se rechaza: ' + (r.error || msgs(r.events || [])));
});
// ——— Capa de Niebla y Sombras (leg_vampires.txt:1126-1131) ———
TT('vcl_mist', 'solo Nigromantes de infantería: gana Etéreo', () => {
  gr('vcl_mist', 'ethereal', { type: 'vc_necromancer' });
  noIss('vc_necromancer', ['vcl_mist'], null, 'Niebla', 'Nigromante de infantería: permitido'); noIss('vc_acolyte', ['vcl_mist'], null, 'Niebla', 'Acólito (Nigromante) permitido: ' + UNITS.vc_acolyte.name);
  for (const t of ['vc_count', 'vc_thrall', 'vc_wightking']) yesIss(t, ['vcl_mist'], null, 'Niebla', /no está disponible/, t + ': rechazado'); yesIss('vc_necro_nightmare', ['vcl_mist'], null, 'Niebla', /solo para infantería/, 'Nigromante en Pesadilla: rechazado');
});
// ——— Cota del Explorador (aj_westerland_ocr300.txt:2534-2541) ———
TT('aj_hauberk', 'solo infantería: armadura pesada, Moverse entre la maleza y Exploradores', () => {
  const type = 'empire_captain'; gr('aj_hauberk', 'mtCover', { type }); gr('aj_hauberk', 'scouts', { type });
  const b = bearer('aj_hauberk', { type, phase: 'combat' }), c = bearer(null, { like: 'aj_hauberk', type, phase: 'combat' }); cur(b.s); const s1 = R.svOf(b.t); cur(c.s); const s0 = R.svOf(c.t); ok(s1 === 5 || s1 < s0, `armadura pesada (5+): ${s1} (control ${s0})`);
  noIss('empire_captain', ['aj_hauberk'], null, 'Cota del Explorador', 'infantería: permitido'); for (const t of ['empire_captain_peg', 'empire_captain_demi']) yesIss(t, ['aj_hauberk'], null, 'Cota del Explorador', /solo para infantería/, t + ': rechazado');
});
