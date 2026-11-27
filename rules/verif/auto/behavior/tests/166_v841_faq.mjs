// v841 — Las 8 entradas de FAQ que quedaban «sin automatizar»: ahora con prueba que ejecuta el motor
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { T, R, DATA, GEOM, ok, eq, cur, put, game, U, dice, diceAll, msgs, asks, join, by } from '../lib3.mjs';
const { UNITS, ITEMS, PRESETS } = DATA;
const HERE = path.dirname(fileURLToPath(import.meta.url)), RULES = path.resolve(HERE, '../../../../'); // rules/
const rd = (f) => fs.readFileSync(path.join(RULES, f), 'utf8');
const FC = 'rules/new/faq_core.txt', FF = 'rules/new/faq_fof.txt', FR = 'rules/new/faq_rh.txt', FK = 'rules/new/faq_cathay.txt';
const PI = Math.PI;

// ---------- Notas del asterisco ----------
// «Designers' Note: Errata marked with an asterisk (*) have been corrected in a later printing of the publication and may not apply.»
// Consecuencia en el motor: una errata con asterisco puede estar ya aplicada en la edición del libro; da igual: el valor que usa el motor es el corregido, coincida o no el libro con la errata.
const starred = (f) => rd(f).split('\n').slice(13).filter((l) => /\*/.test(l) && !/Delete the asterisk/.test(l)).flatMap((l) => [...l.matchAll(/([A-Z][A-Za-z' ]+)\*\s*:/g)].map((m) => m[1].trim()));
T('core-note-001', FC + ':12', 'Nota del asterisco (FAQ Core): no hay erratas marcadas con asterisco en esta FAQ, así que ninguna errata del motor queda a medio aplicar', () => {
  eq(starred('new/faq_core.txt'), [], 'erratas con asterisco en la FAQ Core'); ok(/Errata marked with an asterisk/.test(rd('new/faq_core.txt')), 'montaje: la nota existe');
});
T('cathay-note-001', FK + ':12', 'Nota del asterisco (FAQ Cathay): ninguna errata de la FAQ de Cathay lleva asterisco de «corregida en una reimpresión»; el único asterisco de la FAQ es el del Anillo de Azabache, que ordena borrarlo', () => {
  eq(starred('new/faq_cathay.txt'), [], 'erratas con asterisco en la FAQ Cathay'); ok(/Ring of Jet: Delete the asterisk/.test(rd('new/faq_cathay.txt')), 'montaje: el asterisco del Anillo de Azabache');
});
T('fof-note-001', FF + ':12', 'Nota del asterisco (FAQ FoF): la única errata con asterisco es «The Axe of Dargo*» (S+2); el libro de la edición ya dice «Combat S+2», y el motor aplica S+2 y Perforación −3 con ambas lecturas', () => {
  eq(starred('new/faq_fof.txt'), ['The Axe Of Dargo'], 'erratas con asterisco en la FAQ FoF');
  ok(/The Axe of Dargo Combat S\+2\s+-3/.test(rd('new/aj_dwarfs2.txt')), 'el AJ ya trae S+2 y FP −3 (impresión corregida: la errata «no aplica» pero da el mismo valor)');
  const s = game([{ type: 'dw_ungrim', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'], phase: 'combat' }); const a = U(s, 'dw_ungrim', 0), e = U(s, 'orc_boyz', 1); put(a, 36, 24, -PI / 2); put(e, 36, 21, PI / 2); cur(s);
  const p = R.attackProfile(a, e); eq(p.S, UNITS.dw_ungrim.S + 2, 'F = F base + 2 («S+2»)'); eq(p.ap, 3, 'Perforación −3'); ok(p.slayM, 'Matamonstruos aplicable'); ok(R.D(a).sr.includes('monsterSlayer'), 'Matamonstruos');
});
T('rh-note-001', FR + ':12', 'Nota del asterisco (FAQ RH): la única errata con asterisco es «Badlands Ogre Bulls*» (Crusher +7); el perfil del libro ya dice +7 aunque las Opciones digan +6, y el motor cobra +7', () => {
  eq(starred('new/faq_rh.txt'), ['Badlands Ogre Bulls'], 'erratas con asterisco en la FAQ RH');
  const bk = rd('new/aj_orcs2.txt'); ok(/Crusher\s+6\s+3\s+2\s+4\s+4\s+3\s+2\s+4\s+7\s+\+7/.test(bk), 'el perfil del AJ ya trae «+7»'); ok(/Upgrade one model to a Crusher \(champion\)\.+\+6 points per unit/.test(bk), 'las Opciones del AJ siguen diciendo +6 (la errata las corrige a +7)');
  const c = (champ) => DATA.unitCost('orc_ogre_bulls', 5, false, false, champ, [], null, null, null, null, []); eq(c(true) - c(false), 7, 'el coste de mejorar un modelo a Crusher en el motor');
});

// ---------- core-qa-002: deshacer movimientos ----------
T('core-qa-002', FC + ':345-349 + rules/core.txt:2682-2694 (Take-backs & Changing One\'s Mind)', 'Marcar la posición, mover, devolver la unidad y volver a moverla es una retractación: una vez hecho el movimiento (o tirados los dados) no se puede deshacer; cambiar de idea ANTES de confirmar es libre (la vista previa no toca la partida)', () => {
  const mk = () => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move', active: 0 }); const u = put(U(s, 'state_troops', 0), 36, 40, -PI / 2); cur(s); return { s, u }; };
  // 1) antes de confirmar se puede cambiar de idea cuantas veces se quiera: la vista previa no modifica el estado
  { const { s, u } = mk(), snap = JSON.stringify(s); const p1 = R.previewMove(s, u.id, { x: 36, y: 36, face: -PI / 2 }), p2 = R.previewMove(s, u.id, { x: 36, y: 38, face: -PI / 2 }), p3 = R.previewMove(s, u.id, { x: 36, y: 36, face: -PI / 2 }); ok(p1.ok && p2.ok, 'montaje: las vistas previas son válidas'); eq(JSON.stringify(s), snap, 'ninguna vista previa altera el estado'); eq(p1.cost, p3.cost, 'medir de nuevo da lo mismo'); }
  // 2) mover es comprometerse: no se puede deshacer, y mover «otra vez» la misma unidad no se admite
  { const { s, u } = mk(), a = { t: 'move', id: u.id, x: 36, y: 36, face: -PI / 2 }; const tb = R.takeBackAllowed(s, a); eq(tb.ok, false, 'deshacer un movimiento no está permitido'); ok(tb.moved && /Core p\.20/.test(tb.reason), 'motivo: movimiento comprometido (' + tb.reason + ')');
    const r1 = R.apply(s, a); ok(r1.ok, 'el movimiento se hace: ' + r1.error); const x1 = u.x, y1 = u.y; const r2 = R.apply(s, { t: 'move', id: u.id, x: 36, y: 40, face: -PI / 2 }); eq(r2.ok, false, 'devolverla a su sitio y moverla otra vez no se admite (ya ha movido)'); eq([u.x, u.y], [x1, y1], 'la unidad se queda donde la dejó el primer movimiento'); }
  // 3) tirar dados también compromete
  { const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'move', active: 0 }); const k = put(U(s, 'empire_knights', 0), 36, 40, -PI / 2); put(U(s, 'state_troops', 1), 36, 30, PI / 2); cur(s); const tb = R.takeBackAllowed(s, { t: 'charge', id: k.id, target: U(s, 'state_troops', 1).id }); eq(tb.ok, false, 'una carga (mueve y tira dados) no se puede deshacer'); ok(tb.rolled, 'se han tirado dados'); }
  // 4) lo que ni mueve ni tira dados no es una retractación
  { const { s, u } = mk(); const tb = R.takeBackAllowed(s, { t: 'pref', id: u.id, k: 'champFile', v: 0 }); eq(tb.ok, true, 'una preferencia que no mueve ni tira dados sí se puede revertir'); }
  // 5) v843t: petición expresa del usuario (modo solitario contra la IA): la interfaz SÍ ofrece «Deshacer», pero solo mientras la acción no haya dado información ni consumido azar (el motor sigue sin admitir retractaciones: takeBackAllowed no cambia). Conflicto documentado en VERIFICACION.md (v843t, punto C)
  const html = fs.readFileSync(path.resolve(RULES, '../app/index.html'), 'utf8'), main = fs.readFileSync(path.resolve(RULES, '../app/js/main.js'), 'utf8');
  ok(/id="zUndo"/.test(html), 'v843t: index.html con el botón Deshacer'); ok(/function undoLast/.test(main) && /No se puede deshacer: ya se tiraron dados/.test(main), 'v843t: main.js con la función de deshacer y su motivo');
});

// ---------- core-qa-073: Contracarga ----------
T('core-qa-073', FC + ':608-611', 'Contracarga es una regla del jinete, no de la montura: dos unidades con la misma montura (misma categoría y peana) solo ofrecen Contracarga la que tiene la regla; y si un personaje sin la regla se une, la unidad pierde la opción', () => {
  const offer = (type, extra = {}) => { const s = game([{ type: 'empire_knights', models: 5 }], [{ type, models: 5 }, ...(extra.join ? [{ type: extra.join, models: 1 }] : [])], { f: ['empire', 'empire'], phase: 'move' }); put(U(s, 'empire_knights', 0), 36, 40); const t = put(U(s, type, 1), 36, 28, PI / 2); if (extra.join) join(s, U(s, extra.join, 1), t); cur(s); dice(2, 6, 6); diceAll(6);
    const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'empire_knights', 0).id, target: U(c, type, 1).id }), [0, 1], (n) => (n.title === 'Contracarga' ? 'y' : undefined)); return { asked: o.needs.some((n) => n.title === 'Contracarga'), y: o.s.units.find((u) => u.type === type).y }; };
  const A = UNITS.pistoliers, B = UNITS.outriders; ok(A.tt === B.tt && A.cat === B.cat && A.baseW === B.baseW && A.baseD === B.baseD && A.M === B.M, 'montaje: misma montura (categoría, peana y Movimiento) — Pistoleros y Batidores'); ok(A.sr.includes('counterCharge') && !B.sr.includes('counterCharge'), 'montaje: solo los Pistoleros tienen la regla');
  const a = offer('pistoliers'), b = offer('outriders'); eq(a.asked, true, 'los Pistoleros (con la regla) ofrecen Contracarga'); eq(b.asked, false, 'los Batidores (misma montura, sin la regla) no la ofrecen'); ok(a.y > 28, 'la Contracarga mueve la unidad hacia el enemigo (' + a.y.toFixed(2) + ')');
  ok(UNITS.empire_captain.sr.includes('counterCharge') === false, 'montaje: el Capitán a pie no tiene la regla'); const c = offer('pistoliers', { join: 'empire_captain' }); eq(c.asked, false, 'una unidad con la regla a la que se une un personaje sin ella no puede Contracargar («units that consist entirely of models with this special rule»)');
});

// ---------- core-qa-098: Zancada veloz ----------
T('core-qa-098', FC + ':723-726 + rules/core.txt:3702-3730 (Determine Charge Range / Maximum Possible Charge Range)', 'Zancada veloz permite mover más que el alcance máximo posible de carga: contra una unidad que huye la unidad mueve todo su alcance de carga (M + tirada + D6 = 19") aunque el máximo posible sea 16"; sin la regla se queda en 13"', () => {
  const run = (swift) => { const sr0 = UNITS.empire_knights.sr; if (!swift) UNITS.empire_knights.sr = sr0.filter((x) => x !== 'swiftstride');
    try { const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'move' }); const k = put(U(s, 'empire_knights', 0), 36, 44, -PI / 2), t = put(U(s, 'state_troops', 1), 36, 44 - 3 - 14, PI / 2); cur(s); const y0 = k.y, M = R.D(k).M, reach = R.chargeReach(s, k); diceAll(6);
      const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'empire_knights', 0).id, target: U(c, 'state_troops', 1).id }), [0, 1], (n) => (/Reacci/.test(n.title) ? 'flee' : n.title.includes('Zancada') ? 'y' : undefined)); const kk = U(o.s, 'empire_knights', 0);
      return { moved: Math.hypot(kk.x - 36, kk.y - y0), M, reach, m: msgs(o.r.events), log: o.needs.map((n) => n.title) }; } finally { UNITS.empire_knights.sr = sr0; } };
  const w = run(true), c = run(false);
  eq(w.reach, w.M + 6 + 3, 'alcance máximo posible con Zancada veloz: M + 6 + 3'); eq(c.reach, c.M + 6, 'alcance máximo posible sin la regla: M + 6');
  ok(w.log.includes('Zancada veloz'), 'el +D6 es opcional y se pregunta (popup)'); ok(/alcance 19"/.test(w.m), 'el alcance de carga con 6, +D6 = 6 es 7 + 6 + 6 = 19": ' + w.m.split('\n').slice(-1)); ok(Math.abs(w.moved - 19) <= 0.5, 'mueve todo su alcance de carga (19"): ' + w.moved); ok(w.moved > w.reach + 2, 'más que su alcance máximo posible (' + w.reach + '")');
  eq(c.moved, 0, 'sin Zancada veloz la carga ni se declara: 16" de alcance máximo no existen, solo ' + c.reach + '"');
});

// ---------- fof-qa-037: partidas de dobles ----------
const mk = (type, models, o = {}) => ({ type, models, items: [], opts: [], reg: null, ...o });
const pts = (a) => a.reduce((t, e) => t + DATA.unitCost(e.type, e.models, e.std, e.mus, e.champ, e.items, e.banner, e.arrows, e.mark, e.mix, e.opts), 0);
const RC = [mk('rc_prince', 1), mk('rc_sellswords', 40), mk('rc_sellswords', 40), mk('rc_vsellswords', 15)];
const asAlly = (a, key) => a.map((e) => ({ ...e, ally: key }));
const issues = (army, limit, list, fac, dbl, key) => DATA.armyIssues(army, limit, 'open', list, key ? DATA.allyXo('glory', 0, fac, list, key, dbl) : null);
T('fof-qa-037', FF + ':346-349 + rules/matched.txt:1539-1595 (Doubles Events)', 'Dobles: Coronas Renegadas puede ir como aliada de confianza si la fuerza primaria es Coronas Renegadas, Imperio de los Hombres o Reino de Bretonia (y no con otras); fuera de dobles, Bretonia no admite ese contingente', () => {
  const rcKey = 'empire:renegade';
  for (const [fac, list] of [['empire', 'renegade'], ['empire', 'grand'], ['bret', 'grand']]) { const o = DATA.doublesOptions(fac, list).find((x) => x.key === rcKey); ok(o, `${fac}:${list}: Coronas Renegadas es una secundaria posible`); eq(o.kind, 'trusted', `${fac}:${list}: de confianza`); eq(DATA.allyKindOf(fac, list, rcKey, 'glory', 0, true), 'trusted', `${fac}:${list}: alianza de confianza`); }
  for (const [fac, list] of [['dw', 'grand'], ['he', 'grand'], ['orcs', 'grand'], ['woc', 'grand'], ['wood', 'grand'], ['bret', 'exiles']]) ok(!DATA.doublesOptions(fac, list).some((x) => x.key === rcKey), `${fac}:${list}: Coronas Renegadas NO es una secundaria posible`);
  // la misma lista y la sección «Allies» de la primaria también valen (matched.txt:1563-1567)
  ok(DATA.doublesOptions('dw', 'grand').some((x) => x.key === 'dw:grand'), 'la misma lista de composición'); ok(DATA.doublesOptions('orcs', 'grand').some((x) => x.key === 'woc:grand' && x.kind === 'uneasy'), 'Aliados incómodos de la sección «Allies» (Orcos → Caos: Incómodo)'); ok(!DATA.doublesOptions('orcs', 'grand').some((x) => x.key === 'he:grand'), 'una lista que no está en «Allies» no vale');
  // listas completas: primaria Bretonia (mitad de los puntos) + secundaria Coronas Renegadas
  const B = PRESETS.bret[1000], A = [...B, ...asAlly(RC, rcKey)];
  ok(pts(B) <= 1000 && pts(RC) <= 1000, 'montaje: cada lista cabe en la mitad de 2.000 (' + pts(B) + ' / ' + pts(RC) + ')');
  eq(issues(A, 2000, 'grand', 'bret', true, rcKey), [], 'doubles: Bretonia + Coronas Renegadas: lista válida');
  ok(issues(A, 2000, 'grand', 'bret', false, rcKey).some((z) => /no admite este contingente aliado/.test(z)), 'fuera de dobles, Bretonia no admite a las Coronas Renegadas como aliadas');
  // con un contingente de la facción equivocada (Elfos Altos) para una primaria Enana: no es de su sección «Allies»... pero sí lo es; usar Orcos + Altos Elfos
  const O = [...PRESETS.orcs[1000], ...asAlly(PRESETS.he[1000], 'he:grand')]; ok(issues(O, 2000, 'grand', 'orcs', true, 'he:grand').some((z) => /no admite esta lista como secundaria/.test(z)), 'Orcos + Altos Elfos: no es de la sección «Allies» ni la misma lista');
});

T('fof-qa-037:construccion', 'rules/matched.txt:1551-1581', 'Dobles: cada lista como mucho la mitad de los puntos y sin traspasar los no gastados; personajes con nombre únicos entre ambas; el segundo jugador debe aportar su lista', () => {
  const key = 'empire:renegade', B = PRESETS.bret[1000];
  const big = [...B, mk('br_paladin', 1), mk('br_realm', 12)]; ok(pts(big) > 1000, 'montaje: la primaria pasa de 1.000 (' + pts(big) + ')');
  ok(issues([...big, ...asAlly(RC, key)], 2000, 'grand', 'bret', true, key).some((z) => /fuerza primaria gasta .* solo puede gastar la mitad/.test(z)), 'la primaria no puede pasar de la mitad (2.000/2)');
  const bigRC = [...RC, mk('rc_sellswords', 40), mk('rc_sellswords', 40), mk('rc_vsellswords', 40), mk('rc_sellswords', 40)]; ok(pts(bigRC) > 1000, 'montaje: la secundaria pasa de 1.000 (' + pts(bigRC) + ')');
  ok(issues([...B, ...asAlly(bigRC, key)], 2000, 'grand', 'bret', true, key).some((z) => /fuerza secundaria gasta .* solo puede gastar la mitad/.test(z)), 'la secundaria no puede pasar de la mitad');
  ok(issues(B, 2000, 'grand', 'bret', true, 'x:grand').some((z) => /falta la lista de la fuerza secundaria/.test(z)), 'sin secundaria: aviso');
  // personajes con nombre: uno solo en todo el ejército de dobles
  const named = Object.keys(UNITS).find((k) => UNITS[k].unique && UNITS[k].faction === 'bret' && UNITS[k].cat === 'char' && UNITS[k].general); ok(named, 'montaje: un personaje con nombre de Bretonia'); const dupB = [mk(named, 1), ...B.filter((e) => UNITS[e.type].cat !== 'char' || UNITS[e.type].general !== true)].slice(0, 6);
  const D2 = [...B.map((e) => ({ ...e })), ...asAlly([mk(named, 1), mk('br_realm', 6), mk('br_errant', 6)], 'bret:grand')].map((e, i) => (i === 0 ? e : e)); D2.unshift(mk(named, 1));
  ok(issues(D2, 2000, 'grand', 'bret', true, 'bret:grand').some((z) => /solo uno en un ejército de dobles/.test(z)), 'el mismo personaje con nombre en las dos listas: aviso'); void dupB;
});

T('fof-qa-037:herdstone', FR + ':246-250 (FAQ RH: «if two players partnered for a doubles game … they could each take a Herdstone») + ' + FF + ':346', 'Dobles: cada jugador puede llevar su Piedra de las Manadas; con un contingente aliado normal solo una por ejército', () => {
  const bm = [...PRESETS.bm[1000], mk('bm_herdstone', 1)]; ok(pts(bm) <= 1000, 'montaje: la lista con Piedra cabe en 1.000 pts (' + pts(bm) + ')');
  const A = [...bm, ...asAlly(bm, 'bm:grand')];
  eq(issues(A, 2000, 'grand', 'bm', true, 'bm:grand'), [], 'dobles: dos Piedras (una por jugador) sin avisos');
  ok(issues(A, 2000, 'grand', 'bm', false, 'bm:grand').some((z) => /Piedra de Manada: 0-1 por ejército/.test(z)), 'ejército normal con aliado: 0-1 Piedra por ejército');
});

T('fof-qa-037:partida', 'rules/matched.txt:1583-1595 (Alliances) + 1617-1655 (Rules Considerations)', 'Partida de dobles en el motor: la lista del compañero es un contingente aliado (alianza según la sección «Allies»), «El Rey ha muerto» da 100 PV por el General de la primaria y 50 por el de la secundaria, «Trofeos de guerra» 50/25 por el Portaestandarte, y el punto de ruptura suma la Fuerza de Unidad de las dos fuerzas', () => {
  const sec0 = asAlly(PRESETS.bret[1000], 'bret:grand'), main0 = PRESETS.empire[1000], foe = [...PRESETS.orcs[1000], ...asAlly(PRESETS.woc[1000], 'woc:grand')];
  const mkG = (dbl) => R.createGame({ seed: 5, armies: [[...main0, ...sec0], foe], factions: ['empire', 'orcs'], limit: 2000, scn: 'glory', doubles: dbl });
  const s = mkG(true), n = mkG(false); s.rolloff = false; s.rollW = 0; R.firstRoll(s, []);
  eq(!!s.doubles, true, 's.doubles'); eq(s.allyInfo[0].kind, 'trusted', 'Imperio + Bretonia: alianza de confianza'); eq(s.allyInfo[1].kind, 'uneasy', 'Orcos + Caos: alianza incómoda (sección «Allies» de los Orcos)');
  const mine = s.units.filter((u) => u.owner === 0); ok(mine.some((u) => u.force === 0) && mine.some((u) => u.force === 1), 'dos fuerzas por bando'); ok(mine.filter((u) => u.ally).every((u) => u.force === 1) && mine.filter((u) => !u.ally).every((u) => u.force === 0), 'la secundaria es la fuerza 1');
  ok(mine.filter((u) => u.ally).every((u) => u.allyKind === 'trusted'), 'las unidades de la secundaria llevan la alianza'); ok(n.units.every((u) => u.force == null), 'control: sin dobles no hay fuerzas');
  const gen = (g, ally) => [...g.units, ...g.units.flatMap((h) => h.joined || [])].find((u) => u.owner === 0 && !!u.ally === ally && R.D(u).general); ok(gen(s, false) && gen(s, true), 'cada fuerza tiene su General');
  const kill = (g, who) => { for (const h of g.units) { if (h === who || (h.joined || []).includes(who)) { who.models = 0; if (h !== who && h.models <= 0) h.models = 0; } } };
  const vpOf = (g) => { cur(g); g.phase = 'over'; return R.scoreVP(g, 1); }, base = vpOf(mkG(true));
  { const g = mkG(true); kill(g, gen(g, false)); const v = vpOf(g) - base, c = gen(g, false); ok(v >= 100 + Math.ceil(R.unitPts ? 0 : 0), 'El Rey ha muerto: el General de la primaria da +100 PV al rival sobre sus puntos: ' + v); const g2 = mkG(true); kill(g2, gen(g2, true)); const v2 = vpOf(g2) - base; ok(v2 >= 50, 'General de la secundaria: +50 PV (' + v2 + ')'); const pt = (gg, ally) => R.unitPts(gen(gg, ally)); eq(v - pt(g, false), 100, 'prima: 100 PV de bonificación exactos'); eq(v2 - pt(g2, true), 50, 'secundaria: 50 PV de bonificación exactos'); void c; }
  { const sn = mkG(false); const gn = (gg) => [...gg.units, ...gg.units.flatMap((h) => h.joined || [])].find((u) => u.owner === 0 && u.ally && R.D(u).general); const b0 = (cur(sn), sn.phase = 'over', R.scoreVP(sn, 1)); kill(sn, gn(sn)); const dn = (cur(sn), R.scoreVP(sn, 1)) - b0; eq(dn, R.unitPts(gn(sn)), 'control sin dobles: el General de un contingente aliado no da bonificación'); }
  // punto de ruptura: UST combinada de las dos fuerzas
  const us = (g, o) => g.units.filter((u) => u.owner === o).reduce((t, u) => t + R.usOf(u), 0) + (g.reserves || []).filter((u) => u.owner === o).reduce((t, u) => t + R.usOf(u), 0); eq(s.initUs[0], us(s, 0), 'UST inicial del bando = suma de las dos fuerzas'); ok(us(s, 0) > R.usOf(s.units.filter((u) => u.owner === 0 && !u.ally)[0]) * 3, 'incluye también las unidades de la secundaria');
  const prim = s.units.filter((u) => u.owner === 0 && !u.ally).reduce((t, u) => t + R.usOf(u), 0); ok(s.initUs[0] > prim, 'la UST de la secundaria cuenta para el punto de ruptura (' + s.initUs[0] + ' > ' + prim + ')');
  // los personajes de una fuerza no se unen a unidades de la otra (alianza)
  const ch = s.units.find((u) => u.owner === 0 && u.ally && R.D(u).cat === 'char'), host = s.units.find((u) => u.owner === 0 && !u.ally && R.D(u).cat !== 'char' && u.models > 0); cur(s);
  if (ch && host) { const r = R.apply(s, { t: 'join', id: ch.id, host: host.id }); ok(r.ok === false || /fuerza|Contingentes/.test(JSON.stringify(r)), 'un personaje de la secundaria no se une a la primaria: ' + JSON.stringify(r).slice(0, 120)); }
});

T('fof-qa-037:ui', 'rules/matched.txt:1539-1545', 'La interfaz de partida ofrece el modo dobles y lo pasa al motor (setup → createGame)', () => {
  const main = fs.readFileSync(path.resolve(RULES, '../app/js/main.js'), 'utf8');
  ok(/id="sDoubles"/.test(main) && /bind\('sDoubles'/.test(main), 'selector de dobles en el menú'); ok(/doubles: !!setup\.doubles/.test(main), 'la configuración se pasa a createGame'); ok(/doublesOptions/.test(main), 'las opciones de secundaria son las de dobles');
});
