// v838 — Objetos que penalizan el impacto a quien ataca al portador en combate (−1 para impactar): umbral real de impacto con y sin objeto
import { T, N, R, DATA, ok, eq, cur, diceAll, pair, msgs, fight } from '../lib3.mjs';
import { carrierOf, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
const hitThr = (key, type) => { for (let v = 1; v <= 6; v++) { const { s } = pair('state_troops', { models: 10 }, type, { models: 1, ...(key ? { items: [key] } : {}) }, { charge: false }); cur(s); diceAll(v); const x = /Tropas Estatales golpea a [^(]*\((\d+) ataques, (\d+) impactos/.exec(msgs(fight(s))); if (x && +x[2] > 0) return v; } return 7; };
for (const key of UNC()) {
  const it = ITEMS[key], txt = it.text || '';
  if (!(it.bedaz || it.parry) || !/−1 para impactar/.test(txt) || /mientras|Si |si /.test(txt) || it.cat === 's') continue;
  const type = carrierOf(it); T('v838-it-ht-' + key, FILE, `${it.name}: los enemigos que atacan al portador tienen −1 para impactar`, () => { eq(hitThr(key, type) - hitThr(null, type), 1, 'el umbral para impactar sube 1'); });
}
