// v834 — utilidades del arnés de comportamiento (situaciones mínimas sobre el motor real)
import { R, DATA, GEOM } from './engine.mjs';
export { R, DATA, GEOM };
export const TESTS = [], NA = [];
let CUR_SRC = null;
// T(id, fuente, descripción, fn): una prueba; fn(h) lanza un error (o h.fail) si el motor no hace lo que dice el texto
export const T = (id, src, desc, fn) => TESTS.push({ id, src, desc, fn });
// N(id, motivo): entrada que no se puede automatizar (motivo exacto)
export const N = (id, why, src = null, pend = false) => NA.push({ id, why, src, pend }); // pend: automatizable en principio, no hecho en esta pasada (se cuenta aparte)

export class Fail extends Error {}
export const AC = { n: 0 }; // v841: nº de aserciones ejecutadas por la prueba en curso (una prueba sin aserciones es vacía)
export const ok = (c, msg) => { AC.n++; if (!c) throw new Fail(msg || 'condición falsa'); };
export const eq = (a, b, msg) => { AC.n++; const A = JSON.stringify(a), B = JSON.stringify(b); if (A !== B) throw new Fail(`${msg || ''}: esperado ${B}, obtenido ${A}`); };
export const has = (arr, x, msg) => { AC.n++; if (!arr || !arr.includes(x)) throw new Fail(`${msg || ''}: falta ${JSON.stringify(x)} en ${JSON.stringify(arr)?.slice(0, 200)}`); };
export const no = (arr, x, msg) => { AC.n++; if (arr && arr.includes(x)) throw new Fail(`${msg || ''}: sobra ${JSON.stringify(x)}`); };

// dados: cola de valores fijados (se consumen en orden por d6/d3) o función que da el valor de cada dado
export function dice(...v) { globalThis.__DQ = v.flat(); }
export function diceRest() { return (globalThis.__DQ || []).length; }
export function resetDice() { globalThis.__DQ = []; globalThis.__DLOG = []; globalThis.__DF = null; globalThis.__WSL = []; }
// todos los dados (tras la cola) con un valor fijo o una función (n caras) → valor
export function diceAll(v) { globalThis.__DF = typeof v === 'function' ? v : () => v; }
export const dlog = () => globalThis.__DLOG || [];

// partida mínima: los dos ejércitos, sin despliegue (todas las unidades lejos unas de otras), fase y jugador activo dados
export function game(a, b, o = {}) {
  if (globalThis.__MUTITEM) { const k = globalThis.__MUTITEM, strip = (arr) => arr.map((e) => { const r = { ...e }; if (r.items) r.items = r.items.filter((x) => x !== k); if (r.banner === k) { delete r.banner; } return r; }); a = strip(a); b = strip(b); } // v842 --mutation: objeto ausente
  const f = o.f || ['empire', 'orcs'];
  const s = R.createGame({ seed: o.seed || 7, armies: [a, b], factions: f, limit: o.limit || 4000, scn: o.scn || 'glory', lists: o.lists || null, ...(o.cg || {}) });
  s.noDecide = true; // sin búsqueda de la IA: las decisiones toman la opción por defecto del motor (salvo que la prueba responda el popup)
  s.ready = [true, true]; s.preDone = true; s.first = 0;
  s.phase = o.phase || 'combat'; s.active = o.active ?? 0; s.turn = o.turn ?? 2; s.round = s.turn;
  s.terrain = o.terrain || [];
  // por defecto los personajes van sueltos (como unidades de un modelo); con o.join se respetan las uniones automáticas del despliegue
  if (!o.join) for (const h of [...s.units]) if ((h.joined || []).length) { for (const j of h.joined) { delete j.hostId; s.units.push(j); } h.joined = []; }
  // v835: las unidades que el despliegue dejó en reserva (Emboscadores, Exploradores…) vuelven a la mesa salvo o.keepRes
  if (!o.keepRes && (s.reserves || []).length) { for (const u of s.reserves) { u.reserved = false; u.ambushing = false; s.units.push(u); } s.reserves = []; }
  // aparta todas las unidades (las pruebas colocan las que usan)
  let k = 0; for (const u of s.units) { u.x = 4 + (k % 8) * 9; u.y = k < 8 ? 4 : 44; u.face = k < 8 ? Math.PI / 2 : -Math.PI / 2; u.moved = false; k++; }
  for (const u of s.units) { u.fx = u.fx || []; u.used = u.used || {}; }
  R.syncJoined(s);
  globalThis.__DQ = []; globalThis.__DLOG = [];
  (globalThis.__STATES ||= []).push(s); // v842: el modo --mutation inspecciona los estados que crea cada prueba
  R.__setCUR(s);
  return s;
}
// todas las unidades y personajes (unidos incluidos)
export const all = (s) => [...s.units, ...s.units.flatMap((h) => h.joined || []), ...(s.reserves || [])];
export const U = (s, type, owner) => { const x = all(s).find((u) => u.type === type && (owner == null || u.owner === owner)); if (!x) throw new Fail('no hay unidad ' + type); return x; };
export const Us = (s, type, owner) => all(s).filter((u) => u.type === type && (owner == null || u.owner === owner));
export function put(u, x, y, face = -Math.PI / 2) { u.x = x; u.y = y; u.face = face; return u; }
// une el personaje c a la unidad h (como al desplegar)
export function join(s, c, h) { s.units = s.units.filter((x) => x !== c); (h.joined ||= []).push(c); c.hostId = h.id; R.syncJoined(s); return c; }
// coloca a `a` trabado con `d` (lado del defensor: front/flank/rear), a mitad de mesa
export function engage(s, a, d, side = 'front', o = {}) {
  const dd = GEOM.dims(d), da = GEOM.dims(a);
  put(d, o.x ?? 36, o.y ?? 24, o.face ?? -Math.PI / 2);
  const f = d.face;
  if (side === 'front') { const r = dd.d / 2 + da.d / 2; put(a, d.x + Math.cos(f) * r, d.y + Math.sin(f) * r, f + Math.PI); }
  else if (side === 'rear') { const r = dd.d / 2 + da.d / 2; put(a, d.x - Math.cos(f) * r, d.y - Math.sin(f) * r, f); }
  else { const g = f + Math.PI / 2, r = dd.w / 2 + da.d / 2; put(a, d.x + Math.cos(g) * r, d.y + Math.sin(g) * r, g + Math.PI); }
  R.syncJoined(s);
  ok(R.engagedWith(s, a).includes(d), `engage: ${a.name} no queda trabado con ${d.name}`);
  return a;
}
// marca a `a` como unidad que ha cargado a `d` este turno (lo que deja doCharge al llegar)
export function charged(s, a, d, dist = 5) {
  a.charged = true; a.moved = true; a.chargeOK = true; a.chargeTarget = d.id; a.chargedIds = [d.id]; a.chargeSide = R.sideOfC ? R.sideOfC(d, a) : 'front'; a.chargeDist = dist; a.hasCharged = true;
  d.wasCharged = s.turn; d.wasChargedK = s.turn + ':' + s.active;
}
// ejecuta f(s) con el bando p en modo popup; devuelve los popups que el motor pide (título, quién, opciones) y el resultado con las respuestas dadas
export function asks(s, f, p = [0, 1], pick = null, max = 40) {
  const needs = []; let ans = {};
  for (let k = 0; k < max; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = Object.fromEntries(p.map((x) => [x, true]));
    const dq = [...(globalThis.__DQ || [])];
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) {
      globalThis.__DQ = dq;
      if (!e.need) throw e;
      needs.push(e.need);
      const v = pick ? pick(e.need, needs.length - 1) : e.need.opts?.[0]?.[0];
      ans[e.need.k] = v === undefined ? e.need.dflt ?? e.need.opts?.[0]?.[0] : v;
    }
  }
  throw new Fail('asks: demasiados popups');
}
export const ev0 = () => [];
export const msgs = (ev) => ev.map((e) => e.msg).join('\n');
// prepara el estado global del motor (CUR) como lo hace apply()
export function cur(s) { R.__setCUR(s); if (s.tw) R.setTable(s.tw, s.th); return s; }
// resuelve la fase de Combate entera (todos los combates) con el código del motor
export function fight(s, ev = []) { cur(s); s.phase = 'combat'; R.resolveCombats(s, ev); return ev; }
// una unidad de `n` modelos (o un personaje) en una partida mínima: atajos
export const E = (type, models = 1, x = {}) => ({ type, models, ...x });
// añade temporalmente reglas especiales al perfil de un tipo de unidad (y las retira al acabar)
export function withSr(type, rules, fn) { const d = DATA.UNITS[type], add = [rules].flat().filter((r) => r !== globalThis.__MUTR && !d.sr.includes(r)); d.sr.push(...add); try { return fn(); } finally { d.sr = d.sr.filter((r) => !add.includes(r)); } }
// resultado de un golpe: "X golpea a Y (n ataques, h impactos): w heridas"
export function blows(ev, who) { return ev.map((e) => e.msg).map((m) => /^(.+?) golpea a (.+?) \((\d+) ataques?, (\d+) impactos?\): (\d+) heridas?/.exec(m)).filter((m) => m && (!who || m[1].startsWith(who))).map((m) => ({ who: m[1], to: m[2], n: +m[3], h: +m[4], w: +m[5] })); }
