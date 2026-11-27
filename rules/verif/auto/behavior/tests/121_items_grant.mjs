// v838 — Objetos que conceden reglas: el portador (o la unidad con el estandarte) tiene la regla; el control sin objeto no
import { T, N, R, DATA, ok, eq, cur } from '../lib3.mjs';
import { wearAny, UNC } from './_items.mjs';
const { ITEMS, RULES } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
const COND = /\b(si |Si |una vez|Una vez|Un solo uso|contra |Contra |mientras|Mientras|hasta |Hasta |cada |Cada )/;
for (const key of UNC()) {
  const it = ITEMS[key]; if (!Array.isArray(it.grant) || !it.grant.length) continue;
  const rest = (it.text || '').replace(/^Solo [^.:]*[.:]\s*/, '');
  if (COND.test(rest.replace(/\(Terror si ya lo tenía\)/g, ''))) continue;
  T('v838-it-gr-' + key, FILE, `${it.name}: concede ${it.grant.join(', ')}`, () => { const w = wearAny(key), c = wearAny(null, { type: w.type, stdType: w.type, likeKey: key }); for (const r of it.grant) { ok(R.has(w.u, r), `con el objeto: ${r}`); if (!R.D(c.u).sr.includes(r)) ok(!R.has(c.u, r), `control sin objeto no tiene ${r}`); } });
}
