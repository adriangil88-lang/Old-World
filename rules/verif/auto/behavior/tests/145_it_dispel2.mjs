// v839 — Objetos de dispersión con efecto propio (R.tryDispel con dados fijados y popup de objeto respondido por askMode)
import { T, N, R, DATA, ok, eq, cur, diceAll, dice, put, msgs } from '../lib3.mjs';
import { dispel, wlvl, FILE } from './_it2.mjs';
const { ITEMS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const TY = { r_spellbreak: 'dw_runesmith', r_balance: 'dw_runesmith' };
const dm = (k) => Math.ceil(wlvl(dispel(k, { type: TY[k] }).t) / 2);
const dsp = (k, o) => dispel(k, { type: TY[k], ...o });
// respuestas a los popups: dispersar con el Mago portador (dp), usar el objeto automático (di), declarar Espejo/Colgante (mi/tr)
const ask = (pick = 'ad', yes = true) => (b) => { b.s.ans = new Proxy({}, { has: () => true, get: (_, k) => { k = String(k); return /:dp\d+$/.test(k) ? b.t.id : /:di/.test(k) ? pick : /:(mi|tr)/.test(k) ? (yes ? 'y' : 'n') : undefined; } }); };
// objetos que dispersan automáticamente en lugar de intentar disipar (popup «Objeto de dispersión»)
for (const k of ['r_spellbreak', 'he_sigil', 'bmaj_shadowgave', 'cdl_blood']) TT(k, 'un solo uso: en lugar de disipar, dispersa automáticamente el hechizo (no una invocación perfecta)', () => {
  const pk = ITEMS[k].spellbreak ? 'sb' : 'ad'; const t = 30; const a = dsp(k, { q: [1, 1], total: t, setup: ask(pk) }); eq(a.r, true, 'total 30 con 1+1: dispersa sin tirada'); ok(/autom/.test(a.m), 'anuncia el uso: ' + a.m.slice(-120));
  const b = dispel(null, { type: TY[k], like: k, q: [1, 1], total: t, setup: ask(pk) }); eq(b.r, false, 'control sin objeto: no dispersa (1+1)');
  const c = dsp(k, { q: [1, 1], total: t, perfect: true, setup: ask(pk) }); eq(c.r, false, 'una invocación perfecta no se puede dispersar');
  const d = dsp(k, { q: [1, 1], total: t, setup: (x) => { ask(pk)(x); const w = x.t; w.used = { ...(w.used || {}), ['ad_' + (ITEMS[k].autoDisp || '')]: 1, spellbreak: 1 }; } }); eq(d.r, false, 'ya usado: no vuelve a dispersar');
});
TT('silver_mirror', 'una vez, al dispersar: D6 extra y se descarta el menor; con dos 1 falla', () => {
  const T0 = 6 + dm('silver_mirror') + 1; // 2+2 no supera; con 6 extra: 6+2
  const a = dispel('silver_mirror', { q: [2, 2, 6], total: 4 + dm('silver_mirror') + 1, setup: ask() }); eq(a.r, true, '[2,2,6] → 6+2 supera');
  const c = dispel(null, { like: 'silver_mirror', q: [2, 2, 6], total: 4 + dm('silver_mirror') + 1 }); eq(c.r, false, 'control: 2+2 no supera');
  const f = dispel('silver_mirror', { q: [1, 1, 6], total: 2, setup: ask() }); eq(f.r, false, 'dos 1 entre los tres dados: falla'); 
});
TT('heaj_trickster', 'un solo uso al disipar: D6 extra y se descarta el más bajo; con dos 1 el portador es superado en el Arte', () => {
  const t = 4 + dm('heaj_trickster') + 1; const a = dispel('heaj_trickster', { q: [2, 2, 6], total: t, setup: ask() }); eq(a.r, true, 'D6 extra (6) sustituye al menor'); eq(dispel(null, { like: 'heaj_trickster', q: [2, 2, 6], total: t }).r, false, 'control');
  const b = dispel('heaj_trickster', { q: [1, 1, 6], total: 20, setup: ask() }); eq(b.r, false, 'dos 1: superado en el Arte'); ok(/Arte/.test(b.m), 'lo anuncia: ' + b.m.slice(-150));
});
TT('r_balance', 'solo Herreros rúnicos: una vez por turno, tira un dado extra al dispersar y descarta el menor', () => { const t = 4 + dm('r_balance') + 1; eq(dsp('r_balance', { q: [2, 2, 6], total: t }).r, true, 'dado extra'); eq(dispel(null, { type: TY.r_balance, like: 'r_balance', q: [2, 2, 6], total: t }).r, false, 'control'); const b = dsp('r_balance', { q: [2, 2, 6, 2, 2, 6], total: t }); eq(b.r, true, 'primer intento'); });
TT('lml_d_becalm', 'solo Slann: una vez por turno repite un D6 al disipar; +3" al alcance de disipación', () => { const tt = dm('lml_d_becalm') + 7; const a = dispel('lml_d_becalm', { q: [1, 2, 6], total: tt }); ok(a.r === true, 'repite el D6 más bajo (1→6): 6+2'); eq(dispel(null, { like: 'lml_d_becalm', q: [1, 2, 6], total: tt }).r, false, 'control'); });
TT('aj_disruption', 'una vez por turno el portador puede repetir una tirada de dispersión (todos los dados)', () => { const t = 8 + dm('aj_disruption'); const a = dispel('aj_disruption', { q: [1, 2, 6, 6], total: t }); eq(a.r, true, 'repite 1+1 por 6+6'); eq(dispel(null, { like: 'aj_disruption', q: [1, 2, 6, 6], total: t }).r, false, 'control'); });
TT('oaken_stave', 'a 3" de un bosque: +3" de alcance de dispersión y tira un D6 extra descartando el menor', () => {
  const forest = (b) => { b.s.terrain = [{ id: 'f1', kind: 'forest', x: b.t.x, y: b.t.y, w: 6, h: 6, rot: 0 }]; };
  const t = 4 + dm('oaken_stave') + 1;
  eq(dispel('oaken_stave', { q: [2, 2, 6], total: t, setup: forest }).r, true, 'en el bosque: [2,2,6] → 6+2');
  eq(dispel('oaken_stave', { q: [2, 2, 6], total: t }).r, false, 'sin bosque cerca: 2+2');
  eq(dispel(null, { like: 'oaken_stave', q: [2, 2, 6], total: t, setup: forest }).r, false, 'control sin Bastón');
  eq(dispel('oaken_stave', { q: [1, 1, 1], total: 2, setup: forest }).r, false, 'sin regla de dobles 1 propia: [1,1,1] sigue siendo 1+1 (superado en el Arte)');
});
