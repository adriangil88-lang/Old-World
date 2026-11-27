// v839 — Armas de aliento de objeto, Ld de Furia primigenia y otros efectos simples ejecutando el motor
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, asks, by, join, engage, shotOf } from '../lib3.mjs';
import { FILE, bearer, meleeHits } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
function sh(key, o = {}) { const wt = o.type || carrierOf(ITEMS[key]); const s = game([{ type: wt, models: 1, items: [key] }], [{ type: 'orc_boyz', models: 10 }], { f: [F2(wt), F2(wt) === 'orcs' ? 'empire' : 'orcs'], phase: 'shoot' }); const a = put(U(s, wt, 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 40 - (o.d || 6), Math.PI / 2); cur(s); globalThis.__WSL = []; diceAll(o.v ?? 6); const g = R.rangedOf(a); const r = shotOf(s, a, t); return { s, a, t, r, w: (globalThis.__WSL || [])[0] || null, g }; }
for (const [k, S, AP, once] of [['cdl_breath', 4, 2, 'una vez'], ['brsaj_wyrm', 4, 1, 'una vez'], ['dml_contagion', 3, 2, 'ronda']]) TT(k, `arma de aliento F${S} FP −${AP}, flamígera y mágica (${once})`, () => {
  const x = sh(k); ok(x.g && x.g.breath, 'perfil de aliento: ' + JSON.stringify(x.g)); eq(x.g.s, S, `F${S}`); eq(x.g.ap, AP, `FP −${AP}`); ok(x.w, 'dispara: ' + x.r.m.slice(0, 100)); ok(x.w.o.magical, 'mágica'); if (k !== 'dml_contagion') ok(x.w.o.flaming, 'flamígera'); else ok(!x.w.o.flaming, 'Torrente de Contagio no es flamígero (solo mágico)');
  if (k !== 'dml_contagion') { ok(x.a.used?.breathW, 'un solo uso: queda gastado'); const again = R.rangedOf(x.a); ok(!again || !again.breath || x.a.used.breathW, 'no se repite'); } else ok(x.a.used?.bwK, 'una vez por ronda');
});
TT('bm_authority', 'un solo uso: los modelos enemigos que quieran atacar al portador en la Fase de Combate hacen antes un chequeo de Liderazgo (el suyo); si lo fallan, no pueden atacar este turno', () => {
  const a = meleeHits('bm_authority', { foe: 'state_troops', foeN: 5, v: 6, q: [6, 5], mute: true }), c = meleeHits(null, { like: 'bm_authority', foe: 'state_troops', foeN: 5, v: 6, mute: true });
  ok(c.h > 0, 'control: impacta'); ok(/falla el chequeo de Liderazgo \(11/.test(a.m) && !(a.h > 0), 'con el chequeo de Ld fallado (11 > Ld) no ataca: ' + a.m.slice(0, 150)); const b = meleeHits('bm_authority', { foe: 'state_troops', foeN: 5, v: 6, q: [1, 2], mute: true }); ok(b.h > 0, 'con el chequeo superado ataca');
});
