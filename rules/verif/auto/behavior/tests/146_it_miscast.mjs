// v839 — Objetos que cambian los percances mágicos (R.miscast con popups respondidos)
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, asks, by } from '../lib3.mjs';
import { FILE } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
// percance del Mago con el objeto (o sin él): q = cola de dados; ans = título → respuesta
function mis(key, q, ans = {}, o = {}) {
  const wt = o.type || (ITEMS[key || o.like].slann ? 'lm_slann' : carrierOf(ITEMS[key || o.like])); const foe = o.foe || 'orc_boyz'; const f = F2(wt) === 'orcs' ? 'empire' : 'orcs';
  const s = game([{ type: wt, models: 1, items: key ? [key] : [] }], [{ type: foe, models: 10 }, ...(o.chars || []).map((c) => ({ type: c, models: 1 }))], { f: [F2(wt), f], phase: 'shoot' });
  const w = put(U(s, wt, 0), 36, 40); put(U(s, foe, 1), 36, 20, Math.PI / 2); (o.chars || []).forEach((c, i) => put(U(s, c, 1), 20 + i * 24, 20)); (o.setup || (() => {}))(s, w); cur(s); dice(...q); diceAll(o.all ?? 1);
  const r = asks(s, (c) => { const ev = []; cur(c); const rr = R.miscast(c, by(c, w), ev); return { rr, ev }; }, [0, 1], (n) => { for (const [k, v] of Object.entries(ans)) if (n.title.includes(k)) return v; return undefined; });
  return { ...r, m: msgs(r.r.ev), w: by(r.s, w), asked: r.needs.map((n) => n.title), ev: r.r.ev };
}
const DIS = /¡Desastre mágico!/;
TT('earthing_rod', 'una vez: repite la tirada de la tabla de Desastre mágico (popup)', () => {
  const a = mis('earthing_rod', [1, 1, 6, 6], { 'Vara': 'y' }); ok(a.asked.includes('Vara de Toma de Tierra'), 'se pregunta: ' + a.asked); ok(!DIS.test(a.m), 'repite 2 → 12: sin detonación: ' + a.m.slice(0, 150));
  const b = mis('earthing_rod', [1, 1, 6, 6], { 'Vara': 'n' }); ok(DIS.test(b.m), 'rehúsa: detonación con el 2: ' + b.m.slice(0, 150)); const c = mis(null, [1, 1, 6, 6], {}, { like: 'earthing_rod' }); ok(DIS.test(c.m), 'control');
});
TT('heaj_solidity', 'una vez por partida, al tirar en la tabla de percances puede elegir no hacerlo', () => {
  const a = mis('heaj_solidity', [1, 1], { 'Solidez': 'y' }); ok(a.asked.includes('Bastón de Solidez'), 'popup en el momento'); ok(!DIS.test(a.m) && /Solidez/.test(a.m), 'no tira: ' + a.m.slice(0, 160)); ok(a.w.used?.solid, 'queda gastado');
  const b = mis('heaj_solidity', [1, 1], { 'Solidez': 'n' }); ok(DIS.test(b.m), 'rehúsa: tira (2 = detonación)');
  const c = mis('heaj_solidity', [1, 1], { 'Solidez': 'y' }, { setup: (s, w) => { w.used = { ...(w.used || {}), solid: 1 }; } }); ok(DIS.test(c.m) && !c.asked.includes('Bastón de Solidez'), 'ya usado: tira sin preguntar');
});
TT('lml_d_soul', 'solo Slann: modifica ±1 la tirada de la tabla de percances (mín. 2, máx. 12)', () => {
  const up = mis('lml_d_soul', [3, 3], { 'Alma de Piedra': '1' }), same = mis('lml_d_soul', [3, 3], { 'Alma de Piedra': '0' }), dn = mis('lml_d_soul', [4, 3], { 'Alma de Piedra': '-1' }); ok(up.asked.includes('Alma de Piedra'), 'popup');
  ok(DIS.test(same.m), '3+3=6 sin cambio: detonación'); ok(!DIS.test(up.m), '+1 → 7: ya no es detonación: ' + up.m.slice(0, 120)); ok(DIS.test(dn.m), '4+3=7 con −1 → 6: detonación: ' + dn.m.slice(0, 120));
  const lo = mis('lml_d_soul', [1, 1], { 'Alma de Piedra': '-1' }); ok(DIS.test(lo.m), 'mínimo 2'); const hi = mis('lml_d_soul', [6, 6], { 'Alma de Piedra': '1' }); ok(!DIS.test(hi.m), 'máximo 12');
});
TT('lml_cupped', 'con 1 tira en la tabla; con 2+ designa un personaje enemigo y centra una plantilla de 3" (F6 FP −2)', () => {
  const ch = ['empire_captain', 'empire_general'].filter((k) => UNITS[k]); const o = { chars: ch.length > 1 ? ch : ['empire_captain', 'empire_captain'], type: 'lm_skpriest' };
  const a = mis('lml_cupped', [1, 1, 1], {}, o); ok(DIS.test(a.m), 'con 1: tabla normal: ' + a.m.slice(0, 120));
  const b = mis('lml_cupped', [3], { 'Manos': o.chars[1] }, o); ok(/Manos Ahuecadas/.test(b.m) && !DIS.test(b.m), 'con 3: desvía: ' + b.m.slice(0, 160)); ok(b.asked.some((x) => /Manos/.test(x)), 'popup para designar al personaje: ' + b.asked);
});
TT('empaj_twin', 'si sufre un percance, en lugar de la tabla sufre D3 heridas sin salvación de armadura ni regeneración', () => {
  const a = mis('empaj_twin', [2], {}, { all: 1 }); ok(/Dos Colas/.test(a.m) && !DIS.test(a.m), 'D3 heridas en lugar de la tabla: ' + a.m.slice(0, 160)); ok(a.w.wounds < UNITS.empire_mage.W * 1 || a.w.models < 1, `pierde heridas: ${a.w.wounds}`);
});
