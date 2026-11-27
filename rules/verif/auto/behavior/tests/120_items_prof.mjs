// v838 — Objetos, Mutaciones, Dones, Tatuajes y Runas: modificadores de característica del portador comparados con el texto
import { T, N, R, DATA, ok, eq, cur } from '../lib3.mjs';
import { wearItem, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
const KEY = { Fuerza: 'S', Resistencia: 'T', Iniciativa: 'I', 'Habilidad de [Aa]rmas': 'WS', HA: 'WS', Movimiento: 'M', Liderazgo: 'Ld', Heridas: 'W', Herida: 'W', Ataques: 'A', Ataque: 'A' };
for (const key of UNC()) {
  const it = ITEMS[key]; if (!['m', 'g2', 'k', 'x', 'e', 't', 's', 'h', 'o', 'w', 'a'].includes(it.cat) || it.cat === 'w' && !it.prof) continue;
  const txt = it.text || '', pre = txt.split(/(?<=\.)\s/)[0]; const ms = [...pre.matchAll(/\+(\d) (Fuerza|Resistencia|Iniciativa|Habilidad de [Aa]rmas|HA|Movimiento|Liderazgo|Heridas?|Ataques?)\b/g)];
  const chk = ms.map((m) => { const k = KEY[Object.keys(KEY).find((x) => new RegExp('^' + x).test(m[2]))]; const have = (it.prof && it.prof[k] === +m[1]) || (k === 'S' && it.S === +m[1] && !it.ap && it.cat !== 'w') || (k === 'A' && it.A === +m[1] && it.cat !== 'w'); return have ? [k, +m[1]] : null; }).filter(Boolean);
  if (!chk.length || /Solo|Si |Contra |Mientras|Una vez|Un solo/.test(pre.slice(0, 12))) continue;
  T('v838-it-pr-' + key, FILE, `${it.name}: ${chk.map(([k, n]) => '+' + n + ' ' + k).join(', ')}`, () => { const w = wearItem(key), b = wearItem(null, { like: w }); for (const [k, n] of chk) { const g = k === 'S' ? w.P.S - b.P.S : k === 'A' ? w.P.atk - b.P.atk : R.D(w.u)[k] - R.D(b.u)[k]; ok(g === n || (k === 'A' && R.D(w.u).A - R.D(b.u).A === n) || (k === 'S' && R.D(w.u).S - R.D(b.u).S === n), `${k}: ${g} (esperado +${n})`); } });
}
