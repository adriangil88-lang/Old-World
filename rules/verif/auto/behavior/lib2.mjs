// v836 — utilidades adicionales para las pruebas por regla/hechizo/objeto (situaciones sobre el motor real)
import { R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, blows, join, withSr, Fail, all, Us } from './lib.mjs';
export * from './lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
export const fac = (k) => (UNITS[k].faction === 'merc' ? 'empire' : UNITS[k].faction);
export const foeFac = (k) => (fac(k) === 'empire' ? 'orcs' : 'empire');
export const n0 = (k) => Math.max(1, UNITS[k].min || 1);
// una unidad aislada (jugador 0) frente a un blanco estándar (jugador 1)
export function one(k, x = {}, foe = null, o = {}) {
  const f = fac(k), ff = o.ff || (f === 'empire' ? 'orcs' : 'empire'), fk = foe?.type || (ff === 'orcs' ? 'orc_boyz' : 'state_troops');
  const s = game([{ type: k, models: n0(k), ...x }], [{ type: fk, models: 10, ...(foe || {}) }], { f: [f, ff], ...o });
  return { s, u: U(s, k, 0), e: U(s, fk, 1) };
}
// combate: a (jugador 0) trabado con b (jugador 1) por el lado `side` del defensor; o.charge = distancia de carga; o.dice = valor fijo de todos los dados
export function bout(aT, aX, bT, bX, o = {}) {
  const s = game([{ type: aT, models: n0(aT), ...(aX || {}) }], [{ type: bT, models: n0(bT) === 1 ? 1 : 10, ...(bX || {}) }], { f: [o.fa || fac(aT), o.fb || (fac(bT) === fac(aT) ? (fac(aT) === 'empire' ? 'orcs' : 'empire') : fac(bT))], ...(o.g || {}) });
  const a = U(s, aT, 0), b = U(s, bT, 1);
  engage(s, a, b, o.side || 'front'); if (o.charge) { charged(s, a, b, o.charge); a.impactPend = { t: b.id, dist: o.charge }; } if (o.bcharge) charged(s, b, a, o.bcharge);
  o.setup?.(s, a, b); cur(s);
  if (o.dice != null) diceAll(o.dice); if (o.q) dice(o.q);
  const ev = o.noFight ? [] : fight(s);
  return { s, a, b, ev, bl: blows(ev, a.name), br: blows(ev, b.name), m: msgs(ev) };
}
export const sum = (bl, k) => bl.reduce((t, x) => t + x[k], 0);
export { withSr };
// copia de un perfil con otro id (sin las reglas que el motor liga al id: p. ej. la alineación daemónica por expresión regular): control exacto de una prueba A/B
export function cloneType(base, id, patch = {}) { DATA.UNITS[id] = { ...DATA.UNITS[base], id, sr: [...DATA.UNITS[base].sr], ...patch }; return id; }
export const nDice = () => (globalThis.__DLOG || []).length;
