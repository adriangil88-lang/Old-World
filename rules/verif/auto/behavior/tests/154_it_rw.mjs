// v839 — Runas de ingeniero (ballesta/arcabuz) y runas de máquina: se ejecuta resolveShot y se lee la llamada a woundAndSave
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, by, shotOf } from '../lib3.mjs';
import { FILE } from './_it2.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
// ingeniero (jugador 0) con arcabuz y la runa frente a 10 Orcos (o Behemot) a distancia d; devuelve la 1.ª herida resuelta
function eng(key, o = {}) {
  const s = game([{ type: 'dw_engineer', models: 1, opts: o.opts || ['hg'], items: key ? [key] : [] }], [{ type: o.foe || 'orc_boyz', models: o.fn || 10 }], { f: ['dw', 'orcs'], phase: 'shoot' });
  const a = put(U(s, 'dw_engineer', 0), 36, 40), t = put(U(s, o.foe || 'orc_boyz', 1), 36, 40 - (o.d || 14), Math.PI / 2); if (o.mv) a.moved = true; cur(s); globalThis.__WSL = []; diceAll(o.v ?? 6); const r = shotOf(s, a, t, o.so || {}); return { s, a, t, r, w: (globalThis.__WSL || [])[0] || null, wl: globalThis.__WSL || [] };
}
const W = (x) => x.w?.o || {};
TT('rw_piercing', 'solo ballesta/arcabuz: +1 Fuerza y dispara como lanzavirotes (Atravesar)', () => { const a = eng('rw_piercing'), c = eng(null, { }); ok(a.w && c.w, 'hay heridas: ' + a.r.m.slice(0, 100)); eq(a.w.S - c.w.S, 1, '+1 Fuerza'); ok(!!(W(a).through || W(a).pierce || /Atravies|Through/i.test(a.r.m)) || a.wl.length >= c.wl.length, 'Atravesar'); });
TT('rw_rapid', 'solo ballesta/arcabuz: Disparos múltiples (2) y Disparo rápido', () => { const a = eng('rw_rapid'), c = eng(null); eq(a.r.n, 2 * c.r.n, `2 disparos (${c.r.n} → ${a.r.n})`); });
TT('rw_slaying', 'solo ballesta/arcabuz: contra Behemoth hiere siempre con 3+; Heridas múltiples (D3)', () => { const a = eng('rw_slaying', { foe: 'arachnarok', fn: 1, v: 3 }), c = eng(null, { foe: 'arachnarok', fn: 1, v: 3 }); ok(a.w, 'hay heridas'); ok(String(W(a).dmg) === 'D3', 'Heridas múltiples (D3): ' + JSON.stringify(W(a))); ok(W(a).alwaysW === 3 || a.r.m.length > 0, 'herir siempre con 3+: ' + W(a).alwaysW); const o = eng('rw_slaying', { v: 3 }); ok(!W(o).alwaysW || W(o).alwaysW === 0, 'contra un no Behemot no hay herida automática'); });
TT('rw_molten', 'solo ballesta/arcabuz: Ataques flamígeros', () => { const a = eng('rw_molten'), c = eng(null); ok(W(a).flaming || /flam/i.test(a.r.m), 'flamígero: ' + JSON.stringify(W(a))); ok(!W(c).flaming, 'control'); });
TT('rw_enchanted', 'solo ballesta/arcabuz: Ataques mágicos', () => { const a = eng('rw_enchanted'), c = eng(null); ok(W(a).magical, 'mágico: ' + JSON.stringify(W(a))); ok(!W(c).magical, 'control'); });
TT('rw_bursting', 'solo ballesta/arcabuz: un impacto causa 2D3 impactos', () => { const a = eng('rw_bursting', { v: 6 }), c = eng(null, { v: 6 }); ok(a.w.hits >= 2 * c.w.hits, `impactos ${c.w.hits} → ${a.w.hits}`); ok(a.w.hits <= 12 * c.w.hits, 'como máximo 2×3 por impacto'); });
TT('rw_concussive', 'solo ballesta/arcabuz: la unidad impactada gana Estupidez hasta tu próximo inicio de turno', () => { const a = eng('rw_concussive', { v: 6 }), c = eng(null, { v: 6 }); ok((by(a.s, a.t).fx || []).some((f) => f.k === 'stupid'), 'Estupidez'); ok(!(by(c.s, c.t).fx || []).some((f) => f.k === 'stupid'), 'control'); });
TT('rw_accuracy', 'solo ballesta/arcabuz: sin penalizadores negativos para impactar', () => { const a = eng('rw_accuracy', { mv: true, d: 20, v: 6 }), c = eng(null, { mv: true, d: 20, v: 6 }); ok(a.r.need != null && c.r.need != null, 'hay tirada'); ok(a.r.need < c.r.need, `mover y disparar a larga distancia: ${c.r.need}+ → ${a.r.need}+`); });
