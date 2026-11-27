// v839 — Armas a distancia y flechas especiales de objeto (R.rangedOf / R.resolveShot con popups)
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, asks, by, shotOf } from '../lib3.mjs';
import { FILE } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
// tirador (jugador 0) con el objeto frente a 10 Orcos a distancia d
function sh(key, o = {}) {
  const wt = o.type || carrierOf(ITEMS[key || o.like]); const ft = o.foe || 'orc_boyz'; const f = F2(wt) === 'orcs' ? 'empire' : 'orcs';
  const s = game([{ type: wt, models: o.n || 1, items: key ? [key] : [], ...(o.e || {}) }], [{ type: ft, models: o.fn || 10 }], { f: [F2(wt), f], phase: 'shoot' });
  const a = put(U(s, wt, 0), 36, 40), t = put(U(s, ft, 1), 36, 40 - (o.d || 14), Math.PI / 2); (o.setup || (() => {}))(s, a, t); cur(s); return { s, a, t, wt };
}
const AS = 'we_waystalker';
TT('bow_loren', 'cuenta como arco asrai (32", Perforante 1, mágico); dispara tantas veces como su Ataques, sin penalizador', () => {
  const x = sh('bow_loren', { type: carrierOf(ITEMS.bow_loren) }); const g = R.rangedOf(x.a); ok(g && g.range === 32 || x.a, 'perfil: ' + JSON.stringify(g)); diceAll(6); globalThis.__WSL = []; const r = shotOf(x.s, x.a, x.t); eq(r.n, UNITS[x.wt].A, 'tantos disparos como Ataques: ' + r.m.slice(0, 100)); const wo = (globalThis.__WSL || [])[0]; ok(wo && wo.o.magical, 'Ataques mágicos en la herida: ' + JSON.stringify(wo?.o)); eq(wo.o.ab, 1, 'Perforante (1)');
  const g2 = R.rangedOf(x.a) || {}; eq(g2.range, 32, '32"'); eq(g2.ab ?? 1, 1, 'Perforante 1');
});
TT('asyendi', 'arco asrai mágico, Perforante 1, Disparo rápido. Repite un fallo al disparar; si también falla, el portador sufre un impacto de F3', () => {
  const x = sh('asyendi'); const g = R.rangedOf(x.a); eq(g.range, 32, '32"'); ok(g.magical && g.sr.includes('quickShot'), 'Ataques mágicos y Disparo rápido: ' + JSON.stringify(g)); diceAll(1); const w0 = x.a.wounds; const r = shotOf(x.s, x.a, x.t); ok(by(x.s, x.a).wounds < w0 || by(x.s, x.a).models < 1 || /Asyendi|F3|impacto/i.test(r.m), 'con 1 natural dos veces: el portador se hiere: ' + r.m.slice(0, 160));
  const c = sh('asyendi'); diceAll(6); const w1 = c.a.wounds; shotOf(c.s, c.a, c.t); eq(by(c.s, c.a).wounds, w1, 'si acierta no sufre nada');
});
TT('vaul_wrath', 'arco 32", F+1, FP −2, flamígero, mágico, Heridas múltiples (2)', () => { const x = sh('vaul_wrath'); diceAll(6); globalThis.__WSL = []; shotOf(x.s, x.a, x.t); const wo = (globalThis.__WSL || [])[0]; ok(wo && wo.o.magical && wo.o.flaming && String(wo.o.dmg) === '2', 'en la herida: mágico, flamígero, Heridas múltiples (2): ' + JSON.stringify(wo?.o)); const g = R.rangedOf(x.a); eq(g.range, 32, '32"'); eq(g.s, UNITS[x.wt].S + 1, 'F+1'); eq(g.ap, 2, 'FP −2'); ok(g.flaming && g.magical, 'flamígero y mágico'); eq(String(g.dmg), '2', 'Heridas múltiples (2)'); });
TT('del_tooth', 'arma arrojadiza 9", F propia, FP −3, mágica, Mover y disparar, Disparo rápido', () => { const x = sh('del_tooth', { d: 8 }); const g = R.rangedOf(x.a); eq(g.range, 9, '9"'); eq(g.s, UNITS[x.wt].S, 'F propia'); eq(g.ap, 3, 'FP −3'); ok(g.magical && g.sr.includes('moveShoot') && g.sr.includes('quickShot'), 'mágica, mover y disparar, disparo rápido'); });
TT('r_flight', 'una vez por turno, en la fase de disparo, el arma se lanza: 12", F del portador, mágica, Mover y disparar, Disparo rápido', () => { const x = sh('r_flight', { d: 10 }); const g = R.rangedOf(x.a); eq(g.range, 12, '12"'); eq(g.s, UNITS[x.wt].S, 'F del portador'); ok(g.magical && g.sr.includes('moveShoot') && g.sr.includes('quickShot'), 'mágica, mover y disparar, disparo rápido'); });
// flechas de un solo uso del Arco asrai: popup antes de disparar
function arrow(key, pick) { const x = sh(key, { type: 'we_glade_guard', n: 10, d: 14, fn: 10 }); diceAll(6); const r = asks(x.s, (c) => { cur(c); const ev = []; R.resolveShot(c, by(c, x.a), by(c, x.t), ev, {}); return ev; }, [0, 1], (n) => (n.title.includes(ITEMS[key].name.replace('*', '').split(' ')[0]) ? pick : undefined)); return { ...r, a: by(r.s, x.a), t: by(r.s, x.t), t0: x.t, m: msgs(r.r), asked: r.needs.map((n) => n.title) }; }
TT('hail_doom', 'un solo uso: si impacta, plantilla de 3" sobre la unidad: cada modelo cubierto sufre un impacto de F4, FP −1, mágico (popup antes de disparar)', () => { const y = arrow('hail_doom', 'y'), n = arrow('hail_doom', 'n'); ok(y.asked.length > 0 && /Fatalidad/.test(y.asked.join()), 'se pregunta: ' + y.asked); ok(y.t.models < n.t.models, `con la flecha caen más modelos (${y.t.models} < ${n.t.models})`); ok(/Fatalidad/.test(y.m) && !/Fatalidad/.test(n.m), 'solo si la dispara'); ok(y.a.used?.hail && !n.a.used?.hail, 'se gasta solo si se usa'); });
TT('wailing_arrow', 'un solo uso: la unidad que sufra una herida no salvada chequea Pánico como si hubiera sufrido muchas bajas', () => { const y = arrow('wailing_arrow', 'y'), n = arrow('wailing_arrow', 'n'); ok(/Gemebunda/.test(y.asked.join()), 'se pregunta'); ok(y.t.skullPanic === true || y.t.fleeing, 'la unidad herida chequea Pánico'); ok(!n.t.skullPanic, 'sin usarla no'); });
TT('blight_arrows', 'un solo uso: el modelo herido chequea Resistencia al inicio de cada turno; si falla, pierde una Herida sin salvación', () => { const y = arrow('blight_arrows', 'y'), n = arrow('blight_arrows', 'n'); ok(/Plaga/.test(y.asked.join()), 'se pregunta'); ok((y.t.fx || []).some((f) => f.k === 'blightA'), 'marca la plaga en la unidad herida'); ok(!(n.t.fx || []).some((f) => f.k === 'blightA'), 'sin usarla no'); });
