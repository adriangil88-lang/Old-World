// v838 — Objetos mágicos: armas (perfil de ataque del portador comparado con el texto del objeto)
import { T, N, R, DATA, game, U, ok, eq, cur, put, engage, charged, diceAll, dice } from '../lib3.mjs';
import { carrierOf, wearItem, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
const PRE = (t) => t;
for (const key of UNC('w')) {
  const it = ITEMS[key], txt = it.text || ''; const checks = [];
  const mS = /F\+(\d)/.exec(txt), mAp = /FP −(\d)/.exec(txt), mAb = /(?:Perforación|Penetración de armadura) \((\d)\)/.exec(txt), mA = /Ataques (?:extra|adicionales) \((?:\+)?(\d)\)|\+(\d) Ataques?\b/.exec(txt), mW = /[Hh]ier[ea] (?:siempre )?(?:a |con )(\d)\+/.exec(txt) || /herir con (\d)\+ siempre/.exec(txt), mH = /\+1 para impactar/.test(txt), mMw = /Heridas múltiples \((\d|D3|D6)\)/.exec(txt);
  const chg = /(?:solo el turno|el turno) (?:de carga|que carga|en que carga)|al cargar/i.test(txt) || it.chS || it.chAp;
  const flags = []; if (mS && it.S) flags.push(['S', +mS[1], (P, P0) => P.S - P0.S]); if (mAp && it.ap) flags.push(['ap', +mAp[1], (P, P0) => P.ap - P0.ap]); if (mAb && it.ab) flags.push(['ab', +mAb[1], (P) => P.ab]);
  if (it.A && mA && !/D3|D6/.test(txt)) flags.push(['A', +(mA[1] || mA[2]), (P, P0) => P.atk - P0.atk]); if (mW && it.wnd) flags.push(['wnd', +mW[1], (P) => P.wnd]); if (mH && it.hit) flags.push(['hit', 1, (P, P0) => P.hit - P0.hit]);
  if (/Golpe (?:mortal|letal)/.test(txt) && it.kb) flags.push(['kb', true, (P) => P.kb]); if (/flamígera|flamígeros/.test(txt) && it.flaming) flags.push(['flam', true, (P) => P.flaming]); if (/Matamonstruos/.test(txt) && it.slay) flags.push(['slay', true, (P) => P.slayM]); if (mMw && it.mw) flags.push(['mw', String(mMw[1]), (P) => String(P.mw)]);
  if (!flags.length) continue;
  T('v838-it-w-' + key, FILE, `${it.name}: ${flags.map((f) => f[0] + '=' + f[1]).join(', ')}`, () => { const w = wearItem(key, { charge: !!chg }), b = wearItem(null, { charge: !!chg, like: w }); for (const [n, v, f] of flags) { const got = f(w.P, b.P); if (n === 'ab') ok(got >= v, `Perforación (${v}) en el perfil (${got})`); else if (typeof v === 'number' && n !== 'wnd') eq(got, v, `${n} del perfil`); else if (n === 'wnd') ok(got <= v, `herir con ${v}+ siempre (${got})`); else eq(got, v, n); } });
}
