// v839 — utilidades para las pruebas de los objetos restantes (portador contra un tirador / atacante estándar)
import { GEOM, R, DATA, game, U, cur, put, engage, charged, F, FOE, diceAll, dice, asks, shotOf, join, all, fight, msgs, Fail } from '../lib3.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const STD = { empire: 'state_troops', orcs: 'orc_boyz', wood: 'we_glade_guard', bm: 'bm_gor', bret: 'br_men_at_arms', woc: 'woc_warriors', tk: 'tk_warriors', he: 'he_spearmen', dw: 'dw_warriors', de: 'de_warriors', lm: 'lm_saurus', sk: 'sk_clanrats', vc: 'vc_skeletons', dm: 'dm_plaguebearers', ok: 'ok_gnoblars', cd: 'cd_guard', ct: 'ct_jade' };
export const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
// el portador (objeto o estandarte) como jugador 1 frente a un rival estándar del jugador 0
export function bearer(key, o = {}) {
  const it = key ? ITEMS[key] : ITEMS[o.like]; const std = it.cat === 's' || !!it.bn; const type = o.type || (std ? (o.stdType || STD[it.fac || 'empire'] || 'state_troops') : carrierOf(it)); const fac = UNITS[type].faction === 'merc' ? 'empire' : UNITS[type].faction;
  const sh = (o.phase ?? 'shoot') === 'shoot'; const foe = o.foe || (sh ? (fac === 'empire' ? 'we_glade_guard' : 'handgunners') : (fac === 'empire' ? 'orc_boyz' : 'handgunners')); const ff = F(foe);
  const s = game([{ type: foe, models: o.foeN || 10 }], [std ? { type, models: o.n || 20, std: true } : { type, models: 1, items: key ? [key] : [] }], { f: [ff, fac], phase: o.phase || 'shoot', ...(o.g || {}) });
  const t = U(s, type, 1), a = U(s, foe, 0); if (std && key) t.banner = key; put(a, 36, 40); put(t, 36, 26, Math.PI / 2); if (o.near) { put(t, 36, 24, Math.PI / 2); put(a, 36, 24 + (o.near)); }
  cur(s); return { s, a, t, type, foe };
}
export const needOf = (key, o = {}) => { const { s, a, t } = bearer(key, o); if (o.mv) a.moved = true; diceAll(1); return shotOf(s, a, t).need; };
export const needCtl = (key, o = {}) => { const { s, a, t } = bearer(null, { like: key, ...o }); if (o.mv) a.moved = true; diceAll(1); return shotOf(s, a, t).need; };
// ataque cuerpo a cuerpo del jugador 0 (estándar) contra el portador (jugador 1): umbral mínimo para impactar
// el portador (personaje) unido a una unidad de tiradores del jugador 0; blanco a distancia d
export function joinedShooter(key, o = {}) {
  const it = ITEMS[key || o.like]; const c = o.type || carrierOf(it); const fac = UNITS[c].faction === 'merc' ? 'empire' : UNITS[c].faction; const shooter = o.shooter || (fac === 'empire' ? 'handgunners' : null);
  if (!shooter) throw new Fail('sin tirador para ' + fac);
  const s = game([{ type: shooter, models: 10 }, { type: c, models: 1, items: key ? [key] : [] }], [{ type: 'orc_boyz', models: 10 }], { f: [fac, FOE(c)], phase: 'shoot' });
  const h = U(s, shooter, 0), ch = U(s, c, 0), t = U(s, 'orc_boyz', 1); join(s, ch, h); put(h, 36, 40 + (o.d || 0)); put(t, 36, 40 - (o.dist || 20), Math.PI / 2); R.syncJoined(s); cur(s); return { s, h, ch, t };
}
// salvaciones del portador (jugador 1) frente a una herida (F, FP) con opciones del motor; devuelve «heridas que pasan»
export function hurt(key, o = {}) {
  const b = bearer(key, { like: o.like, type: o.type, phase: o.phase || 'combat', ...(o.b || {}) }); cur(b.s); const def = o.items ? (o.items.forEach((k) => def0(b, k)), b.t) : b.t; if (o.setup) o.setup(b);
  if (o.q) dice(...o.q); if (o.all != null) diceAll(o.all);
  const r = R.woundAndSave(b.s, b.t, o.hits || 1, o.S ?? 10, o.ap ?? 0, o.ctx || {}); return { ...b, r, through: r.through };
}
const def0 = (b, k) => { (b.t.items ||= []).push(k); };
// menor tirada del D6 de salvación (armadura | especial | regeneración) con la que el portador salva una herida; 7 = ninguna
export function thr(kind, key, o = {}) {
  for (let v = 2; v <= 6; v++) { const ctx = { ...(o.ctx || {}) }; if (kind === 'arm') { ctx.noWard = true; ctx.noRegen = true; } if (kind === 'ward') { ctx.noArmour = true; ctx.noRegen = true; } if (kind === 'regen') { ctx.noArmour = true; ctx.noWard = true; }
    const h = hurt(key, { ...o, all: v, ctx: { auto: true, ...ctx }, S: o.S ?? 10, ap: o.ap ?? 0 }); if (h.through === 0) return v; } return 7;
}
// combate: atacante del jugador 0 (foeT) contra el portador; devuelve {n ataques, h impactos, wd heridas} del primer golpe del atacante con todos los dados a v
export function muted(type) { const id = type + '_a0'; DATA.UNITS[id] = { ...DATA.UNITS[type], id, A: 0, sr: [...DATA.UNITS[type].sr] }; return id; }
export function meleeHits(key, o = {}) {
  const b = bearer(key, { like: o.like, type: o.mute ? muted(o.type || carrierOf(ITEMS[key || o.like])) : o.type, foe: o.foe, foeN: o.foeN || 5, phase: 'combat' }); put(b.t, 36, 24, -Math.PI / 2); engage(b.s, b.a, b.t); if (o.setup) o.setup(b); b.s.phase = 'combat'; cur(b.s);
  if (o.q) dice(...o.q); diceAll(o.v ?? 4); const ev = fight(b.s); const m = msgs(ev); const x = new RegExp(`^${b.a.name.replace(/[()*]/g, '\\$&')} golpea a [^(]*\\((\\d+) ataques?, (\\d+) impactos?\\): (\\d+) heridas?`, 'm').exec(m);
  return { ...b, m, n: x ? +x[1] : null, h: x ? +x[2] : null, wd: x ? +x[3] : null };
}

export const meleeThr = (key, o = {}) => { for (let v = 2; v <= 6; v++) { const r = meleeHits(key, { ...o, v }); if (r.h > 0) return v; } return 7; };
// perfil de ataque (attackProfile) del portador contra un rival estándar; o.charge: el portador ha cargado este turno; o.foe: tipo del rival; o.like: control sin objeto
export function profOf(key, o = {}) {
  const b = bearer(key, { like: o.like, type: o.type, foe: o.foe, stdType: o.stdType, foeN: o.foeN || 5, phase: 'combat' }); put(b.t, 36, 24, -Math.PI / 2); engage(b.s, b.a, b.t); b.s.phase = 'combat'; b.s.active = 1; if (o.charge) { b.t.chargeOK = true; b.t.charged = true; b.t.chargeTarget = b.a.id; b.t.chargeSide = 'front'; b.t.chargeDist = 5; b.t.hasCharged = true; b.t.moved = true; }
  if (o.setup) o.setup(b); cur(b.s); return { ...b, P: R.attackProfile(b.t, b.a) };
}
// impactos de carga del portador (chargeImpacts) contra el rival estándar; devuelve {n impactos, w llamada a woundAndSave}
export function impactsOf(key, o = {}) {
  const b = profOf(key, { ...o, charge: true }); globalThis.__WSL = []; const ev = []; diceAll(o.v ?? 4); if (o.q) dice(...o.q); R.chargeImpacts(b.s, b.t, b.a, 5, ev); const m = msgs(ev); const x = /Impactos de carga de [^:]*: (\d+) impactos/.exec(m);
  return { ...b, n: x ? +x[1] : 0, w: (globalThis.__WSL || [])[0] || null, m };
}

// el portador ataca solo (el rival no tiene Ataques): dados ciclando por la lista v (p. ej. [1,6]); devuelve {n,h,wd,m}
let _z = 0;
export function holderFight(key, o = {}) {
  const base = o.foe || 'orc_boyz'; const id = base + '_a0'; DATA.UNITS[id] = { ...DATA.UNITS[base], id, A: 0, sr: [...DATA.UNITS[base].sr] };
  const b = bearer(key, { like: o.like, type: o.type, foe: id, foeN: o.foeN || 5, phase: 'combat', stdType: o.stdType }); put(b.t, 36, 24, -Math.PI / 2); engage(b.s, b.a, b.t); b.s.phase = 'combat'; b.s.active = o.active ?? 1;
  if (o.charge) { charged(b.s, b.t, b.a, 5); }
  if (o.setup) o.setup(b); cur(b.s); let i = 0; const L = o.v || [4]; diceAll(() => L[i++ % L.length]); const ev = fight(b.s); const m = msgs(ev);
  const nm = b.t.name.replace(/[()*+.]/g, '\\$&'); const x = new RegExp(`^${nm} golpea a [^(]*\\((\\d+) ataques?, (\\d+) impactos?\\): (\\d+) heridas?`, 'm').exec(m);
  return { ...b, m, n: x ? +x[1] : null, h: x ? +x[2] : null, wd: x ? +x[3] : null, ev };
}
// intento de dispersar (tryDispel) por el portador (Mago del jugador 1) un hechizo del jugador 0 con total `total`; dados q (cola); d: distancia entre ambos
export function dispel(key, o = {}) {
  const b = bearer(key, { like: o.like, type: o.type, phase: 'shoot' }); const w = b.t; put(w, 36, 20, Math.PI / 2); put(b.a, 36, 30); const off = 10 - GEOM.unitDist(w, b.a); put(b.a, 36, 20 + (o.ud != null ? o.ud + off : (o.d ?? 10))); (o.items || []).forEach((k) => (w.items ||= []).push(k)); if (o.setup) o.setup(b); cur(b.s);
  if (o.q) dice(...o.q); diceAll(o.all ?? 1); const ev = []; const r = R.tryDispel(b.s, b.a, o.total ?? 10, !!o.perfect, ev, o.spType || null, o.bound || 0); return { ...b, r, ev, m: msgs(ev) };
}
export const wlvl = (u) => R.D(u).wizard?.level || 0;
// lanzador (Mago del jugador 0) con el objeto frente a un blanco del jugador 1 a 14"; control sin objeto (key null → o.like)
import { caster, castThr } from '../lib3.mjs';
export function mkCast(key, o = {}) { const it = ITEMS[key || o.like]; const wt = o.type || (it.slann ? 'lm_slann' : it.wiz ? 'empire_mage' : carrierOf(it)); const { s, w, t } = caster(wt, o.tT || 'state_troops', { wX: { items: [...(key ? [key] : []), ...(o.extra || [])] }, spell: o.spell || 'fireball' }); const ty = DATA.SPELLS[o.spell || 'fireball'].type; if (['hex', 'enchant'].includes(ty)) s.phase = 'strategy'; if (ty === 'assail') { engage(s, w, t); s.phase = 'combat'; } if (o.setup) o.setup(s, w, t); cur(s); return { s, w, t }; }
export const cthr = (key, o = {}) => castThr(() => mkCast(key, o), o.spell || 'fireball', o.rest || [1, 1, 3, 3, 3]);
export const hexSpell = () => Object.keys(DATA.SPELLS).find((k) => DATA.SPELLS[k].type === 'hex' && !DATA.SPELLS[k].bound);
// total de lanzamiento que muestra el motor con una cola de dados q (si el hechizo falla: «(T vs N+)»); null si no lo muestra
export function ctot(key, q, o = {}) { const { s, w, t } = mkCast(key, o); dice(...q); diceAll(o.all ?? 1); const r = R.apply(s, { t: 'cast', id: w.id, spell: o.spell || 'fireball', target: t.id }); const m = msgs(r.events || []); const x = /\((-?\d+) vs (\d+)\+\)/.exec(m); return x ? +x[1] : null; }

// lanzador del jugador 0 con un portador (jugador 1 si o.foe, si no jugador 0) de la clave k cerca; devuelve {s,w,t,c}
export function mkAura(k, o = {}) {
  const it = ITEMS[k]; const ct = o.ctype || (it.cat === 's' ? (STD[it.fac || 'empire'] || 'state_troops') : carrierOf(it)); const std = it.cat === 's' || !!it.bn; const cfac = UNITS[ct].faction === 'merc' ? 'empire' : UNITS[ct].faction;
  const s = game([{ type: 'empire_mage', models: 1, items: o.wItems || [] }, ...(o.friend ? [std ? { type: ct, models: 10, std: true } : { type: ct, models: 1, items: [k] }] : [])], [{ type: 'state_troops', models: 20 }, ...(o.friend ? [] : [std ? { type: ct, models: 10, std: true } : { type: ct, models: 1, items: [k] }])], { f: ['empire', o.friend ? 'orcs' : cfac === 'empire' ? 'orcs' : cfac], phase: 'shoot' });
  const w = U(s, 'empire_mage', 0), t = U(s, 'state_troops', 1), c = U(s, ct, o.friend ? 0 : 1); if (std) c.banner = k; w.spells = [o.spell || 'storm_fury']; w.casted = [];
  put(w, 36, 40); put(t, 36, 26, Math.PI / 2); put(c, 36 + (o.cx ?? 6), 40 + (o.cy ?? 0), -Math.PI / 2); cur(s); return { s, w, t, c };
}
export function ctotA(k, q, o = {}) { const { s, w, t } = mkAura(k, o); dice(...q); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: o.spell || 'storm_fury', target: t.id }); const m = msgs(r.events || []); const x = /\((-?\d+) vs (\d+)\+\)/.exec(m); return x ? +x[1] : null; }

// como ctot pero respondiendo popups (título → respuesta)
export function ctotAsk(key, q, o = {}, ans = {}) {
  const { s, w, t } = mkCast(key, o); dice(...q); diceAll(o.all ?? 1);
  const out = asks(s, (c) => { cur(c); return R.apply(c, { t: 'cast', id: w.id, spell: o.spell || 'fireball', target: t.id }); }, [0, 1], (n) => { for (const [k, v] of Object.entries(ans)) if (n.title.includes(k)) return v; return undefined; });
  const m = msgs(out.r.events || []); const x = /\((-?\d+) vs (\d+)\+\)/.exec(m); return { tot: x ? +x[1] : null, m, asked: out.needs.map((n) => n.title), s: out.s, w: by0(out.s, w) };
}
const by0 = (s, u) => [...s.units, ...s.units.flatMap((h) => h.joined || [])].find((x) => x.id === u.id);
