// v838 — Objetos de hechicero: bonificadores a la tirada de lanzamiento comparados con el umbral real de lanzamiento del motor
import { T, N, R, DATA, ok, eq, cur, put, U, castThr, caster, dice, diceAll, msgs } from '../lib3.mjs';
import { carrierOf, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
for (const key of UNC()) {
  const it = ITEMS[key], txt = it.text || ''; const m = /(?:^|\. |; )\+(\d) (?:a las tiradas de lanzamiento|a lanzar(?! Maleficios)|a cualquier tirada de lanzamiento|a una tirada de lanzamiento|a tiradas de lanzamiento|a cualquier tirada de lanzar)/.exec(txt) || /Una vez: \+(\d) a una tirada de lanzamiento|Un solo uso: \+(\d) a una tirada de lanzamiento/.exec(txt);
  if (key === 'ashur' || !m || /mientras|Mientras|A 3"|Si |si el|proyectiles|Maleficios|Daemonología/.test(txt.replace(/\(sin causar[^)]*\)/, '')) || !it.wiz) continue;
  const n = +(m[1] || m[2]); const type = carrierOf(it);
  T('v838-it-cs-' + key, FILE, `${it.name}: +${n} a lanzar`, () => { const thr = (k) => castThr(() => caster(type, 'state_troops', { wX: k ? { items: [k] } : {} })); const a = thr(key), b = thr(null); eq(b - a, n, `umbral de lanzamiento ${b} → ${a}`); });
}
T('v838-it-cs-ashur', FILE, 'Libro de Ashur: +1 a lanzar salvo que se saque un doble natural', () => {
  const cast = (k, a, b) => { const { s, w, t } = caster(carrierOf(ITEMS.ashur), 'state_troops', { wX: k ? { items: [k] } : {} }); dice(a, b, 3, 3, 3); diceAll(1); return !/no logra/.test(msgs(R.apply(s, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }).events || [])); };
  const thr = (k) => castThr(() => caster(carrierOf(ITEMS.ashur), 'state_troops', { wX: k ? { items: [k] } : {} }));
  const base = thr(null); const a = 4, b = (base - 1) - 4; ok(a !== b, 'montaje: suma no doble'); ok(!cast(null, a, b) && cast('ashur', a, b), `con ${a}+${b}=${base - 1} no lanza sin el libro y sí con él`);
  const d = (base - 1) / 2; ok(Number.isInteger(d) && d > 1 && d < 6 && !cast('ashur', d, d), `con un doble natural (${d}+${d}) no suma el +1`);
});
