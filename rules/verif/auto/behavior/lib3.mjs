// v838 — utilidades de combate multi-ronda / posición por modelo para las pruebas de reglas especiales
import { R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, blows, join, withSr, Fail, all, Us } from './lib2.mjs';
export * from './lib2.mjs';
export const F = (t) => (DATA.UNITS[t].faction === 'merc' ? 'empire' : DATA.UNITS[t].faction);
export const FOE = (t) => (F(t) === 'empire' ? 'orcs' : 'empire');
// ejército mínimo: w (jugador 0) trabado con l (jugador 1); w ha cargado a l si o.charge !== false
export function pair(wT, wX, lT, lX, o = {}) {
  const fa = o.fa || F(wT), fb = o.fb || (F(lT) === fa ? FOE(wT) : F(lT));
  const s = game([{ type: wT, models: DATA.UNITS[wT].min > 1 ? DATA.UNITS[wT].min : 1, ...(wX || {}) }, ...(o.extra0 || [])], [{ type: lT, models: DATA.UNITS[lT].min > 1 ? DATA.UNITS[lT].min : 1, ...(lX || {}) }], { f: [fa, fb], ...(o.g || {}) });
  const U2 = (t, ow) => all(s).find((x) => x.type === t && x.owner === ow) || all(s).filter((x) => x.owner === ow && !x.hostId)[0]; const w = U2(wT, 0), l = U2(lT, 1);
  engage(s, w, l, o.side || 'front'); if (o.charge !== false) charged(s, w, l, 5);
  o.setup?.(s, w, l); cur(s); return { s, w, l };
}
// Ld temporal de un tipo (para forzar «cede terreno» / «retrocede» / «huye» con dados a 2: tirada 2+2=4)
export function withLd(type, ld, fn) { const d = DATA.UNITS[type], old = d.Ld; d.Ld = ld; try { return fn(); } finally { d.Ld = old; } }
// resuelve la fase de combate con popups; ans: {fragmento del título → respuesta}
export function resolve(s, ans = {}, who = [0, 1]) {
  return asks(s, (c) => { const ev = []; cur(c); c.phase = 'combat'; R.resolveCombats(c, ev); return ev; }, who, (n) => { for (const [k, v] of Object.entries(ans)) if (n.title.includes(k) || n.k.includes(k)) return v; return undefined; });
}
export const asked = (o, frag) => o.needs.some((n) => n.title.includes(frag));
export const msg = (o) => msgs(o.r);
export const D = (u) => R.D(u);
// la unidad (por id) en el estado clonado
export const by = (s, u) => all(s).find((x) => x.id === u.id);
// umbral de lanzamiento: menor suma de 2D6 (sin dobles 1/6) con la que el hechizo se lanza; mk() → { s, w (mago), t (blanco) }
export function castThr(mk, spell = 'fireball', rest = [1, 1, 3, 3, 3]) {
  for (let sum = 3; sum <= 12; sum++) { const { s, w, t } = mk(); const a = Math.ceil(sum / 2), b = sum - a; if (a === b && (a === 1 || a === 6)) continue; dice(a, b, ...rest); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell, target: t.id }); if (!/no logra/.test(msgs(r.events || []))) return sum; }
  return 99;
}
// mago (jugador 0) a 14" de un blanco (jugador 1) en fase de Disparo
export function caster(wT, tT = 'state_troops', o = {}) {
  const s = game([{ type: wT, models: 1, ...(o.wX || {}) }, ...(o.extra || [])], [{ type: tT, models: 20 }, ...(o.foe || [])], { f: [F(wT), F(tT) === F(wT) ? FOE(wT) : F(tT)], phase: 'shoot' }); const w = U(s, wT, 0), t = U(s, tT, 1); put(w, 36, 40); put(t, 36, 26, Math.PI / 2); w.spells = [o.spell || 'fireball']; w.casted = []; cur(s); return { s, w, t };
}
// quita temporalmente una regla de un tipo (control A/B)
export function withoutSr(type, rule, fn) { const d = DATA.UNITS[type], old = d.sr; d.sr = old.filter((r) => r !== rule); try { return fn(); } finally { d.sr = old; } }
// registro de woundAndSave del atacante w contra el defensor l durante una función
export function wsl(fn) { globalThis.__WSL = []; const r = fn(); return { r, log: globalThis.__WSL.slice() }; }
export const prof = (s, a, e) => { cur(s); return R.attackProfile(a, e); };
// menor tirada con la que `def` salva 1 herida (armadura/especial según ctx) contra F3 PA0 ; null si no salva con ninguna
export function saveThr(s, def, ctx = {}, S = 3, ap = 0) { cur(s); for (let v = 1; v <= 6; v++) { diceAll(v); const r = R.woundAndSave(s, def, 1, S, ap, { noRegen: true, noWard: true, auto: true, ...ctx }); if (r.through === 0) return v; } return null; }
// Inicio de turno del jugador p (subfase de Mando): ejecuta beginStrategy con popups; ans: {fragmento: respuesta}
export function strategy(s, ans = {}, p = 0) {
  return asks(s, (c) => { const ev = []; cur(c); c.phase = 'strategy'; c.active = p; R.beginStrategy(c, ev); return ev; }, [0, 1], (n) => { for (const [k, v] of Object.entries(ans)) if (n.title.includes(k) || n.k.includes(k)) return v; return undefined; });
}
// Inicio de la fase de Movimiento (Potencia de vapor, Estupidez…): beginMove con popups
export function moveStart(s, ans = {}, p = 0) {
  return asks(s, (c) => { const ev = []; cur(c); c.phase = 'move'; c.active = p; R.beginMove(c, ev); return ev; }, [0, 1], (n) => { for (const [k, v] of Object.entries(ans)) if (n.title.includes(k) || n.k.includes(k)) return v; return undefined; });
}
// resuelve un disparo de a contra t y devuelve { n tiros, need (dado), m }
export function shotOf(s, a, t, o = {}) { cur(s); const ev = []; const r = R.resolveShot(s, a, t, ev, o); const m = msgs(ev); const x = /(\d+) tiros?, (\d)\+/.exec(m); return { n: x ? +x[1] : null, need: x ? +x[2] : null, m }; }
// los dos jugadores pulsan «listo» en el despliegue: ejecuta la nominación previa, los atrincheramientos, etc. (pn = respuestas previas de las nominaciones)
export function deployReady(s, pn = {}) { s.ready = [false, false]; s.preDone = false; s.firstAsked = false; s.phase = 'deploy'; s.turn = 0; s.pnNom = { ...(s.pnNom || {}), ...pn }; cur(s); const out = []; for (let k = 0; k < 6 && s.phase === 'deploy'; k++) { for (const p of [0, 1]) if (!s.ready[p]) out.push(R.apply(s, { t: 'ready', player: p })); else if (!s.preDone) out.push(R.apply(s, { t: 'ready', player: p })); if (s.preDone) break; } return out; }
