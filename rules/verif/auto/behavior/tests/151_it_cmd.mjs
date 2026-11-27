// v839 — Objetos de la subfase de Mando (R.beginStrategy con popups respondidos)
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, asks, by, strategy } from '../lib3.mjs';
import { FILE } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
// el portador (jugador 0) en fase de estrategia con aliados/rivales indicados
function cmd(key, o = {}) {
  const ct = o.type || carrierOf(ITEMS[key]); const s = game([{ type: ct, models: 1, items: key ? [key] : [] }, ...(o.mine || [])], [{ type: o.foe || 'orc_boyz', models: 10 }, ...(o.theirs || [])], { f: [F2(ct), F2(ct) === 'orcs' ? 'empire' : 'orcs'], phase: 'strategy', active: 0, turn: 2 });
  const c = put(U(s, ct, 0), 36, 40); put(U(s, o.foe || 'orc_boyz', 1), 36, 20, Math.PI / 2); (o.setup || (() => {}))(s, c); cur(s); return { s, c, ct };
}
const run = (x, ans) => strategy(x.s, ans, 0);
TT('stone_spite', 'un solo uso, sin estar trabado: hasta tu siguiente inicio de turno todos los magos tienen −2 a sus tiradas de lanzamiento (popup)', () => {
  const mk = () => cmd('stone_spite', { theirs: [{ type: 'empire_mage', models: 1 }], foe: 'orc_boyz', type: carrierOf(ITEMS.stone_spite) });
  const a = mk(), y = run(a, { 'Piedra': 'y' }); ok(y.needs.some((n) => n.title.includes('Piedra')), 'se pregunta en el momento'); ok(y.s.spiteStone && y.s.spiteStone.by === 0, 'efecto activo'); ok(!by(y.s, a.c).items.includes('stone_spite'), 'objeto gastado');
  const b = mk(), n = run(b, { 'Piedra': 'n' }); ok(!n.s.spiteStone && by(n.s, b.c).items.includes('stone_spite'), 'si el jugador rehúsa no se usa y se conserva');
  const c = cmd('stone_spite', { type: carrierOf(ITEMS.stone_spite), setup: (s, u) => { const e = s.units.find((x) => x.owner === 1); e.x = u.x; e.y = u.y - 3; s.units.forEach(() => {}); } }); const base = c.s;
});
TT('kanopi', 'un solo uso, sin estar trabado: chequeo de Ld (sin modificar); si lo supera, se dispersan todos los hechizos que permanecen en juego (popup)', () => {
  const mk = () => cmd('kanopi', { setup: (s, c) => { const e = s.units.find((x) => x.owner === 1); const m = s.units.find((x) => x.owner === 0 && x !== c) || c; (c.fx ||= []).push({ k: 'ripT', rip: true, src: e.id, v: 1 }); } });
  const a = mk(); dice(1, 2); const y = run(a, { 'Kanopi': 'y' }); ok(y.needs.some((n) => n.title.includes('Kanopi')), 'se pregunta'); ok(!(by(y.s, a.c).fx || []).some((f) => f.rip), 'Ld superado: hechizo dispersado'); ok(!by(y.s, a.c).items.includes('kanopi'), 'gastado');
  const b = mk(); dice(6, 5); const f = run(b, { 'Kanopi': 'y' }); ok((by(f.s, b.c).fx || []).some((x) => x.rip), 'Ld fallado: no se dispersa'); const n = mk(), r = run(n, { 'Kanopi': 'n' }); ok(by(r.s, n.c).items.includes('kanopi'), 'si rehúsa se conserva');
});
TT('crown_kings', 'solo Monarca de Nehekhara: en Mando, chequeo de Ld; si lo supera, una unidad de Esqueletos en su alcance de mando recupera D3+1 Heridas', () => {
  const mk = () => cmd('crown_kings', { type: 'tk_king', mine: [{ type: 'tk_warriors', models: 20 }], setup: (s, c) => { const w = s.units.find((x) => x.type === 'tk_warriors'); put(w, 36, 44); w.wounds -= 6; w.models = Math.ceil(w.wounds / UNITS.tk_warriors.W); } });
  const a = mk(), w0 = a.s.units.find((x) => x.type === 'tk_warriors').wounds; dice(1, 2, 2); diceAll(1); const r = run(a, {}); ok(by(r.s, a.s.units.find((x) => x.type === 'tk_warriors')).wounds >= w0 + 2, `recupera D3+1 (${w0} → ${by(r.s, a.s.units.find((x) => x.type === 'tk_warriors')).wounds})`);
});
TT('hieratic_jar', 'un solo uso, en Mando: usa ¡Levantaos! dos veces en vez de una (popup)', () => {
  const mk = () => cmd('hieratic_jar', { type: 'tk_hpriest', mine: [{ type: 'tk_warriors', models: 20 }], setup: (s, c) => { const w = s.units.find((x) => x.type === 'tk_warriors'); put(w, 36, 46); w.wounds = Math.floor(w.wounds * 0.4); w.models = Math.ceil(w.wounds / UNITS.tk_warriors.W); } });
  const a = mk(); diceAll(5); const y = run(a, { 'Vasija': 'y', 'Levant': 'y' }); ok(y.needs.some((n) => n.title.includes('Vasija')), 'se pregunta'); ok(!by(y.s, a.c).items.includes('hieratic_jar'), 'gastada'); ok(/dos veces/.test(msgs(y.r)), 'anunciada: ' + msgs(y.r).slice(0, 160));
  const b = mk(); diceAll(5); const n = run(b, { 'Vasija': 'n', 'Levant': 'y' }); ok(by(n.s, b.c).items.includes('hieratic_jar'), 'si rehúsa se conserva');
});
