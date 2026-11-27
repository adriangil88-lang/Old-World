// v839 — Objetos que modifican el impacto de los disparos contra el portador / del portador
import { T, N, R, DATA, ok, eq, cur, diceAll, shotOf, put, U } from '../lib3.mjs';
import { bearer, needOf, needCtl, joinedShooter, FILE } from './_it2.mjs';
const { ITEMS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
for (const k of ['ct_sigil', 'mu_pelt', 'tkaj_orb', 'heaj_incense', 'skl_magnet', 'dml_corona', 'aj_swirl'])
  TT(k, 'los enemigos que disparan contra el portador o su unidad sufren −1 adicional para impactar', () => { const a = needOf(k), b = needCtl(k); eq(a - b, 1, `umbral con objeto ${a}+ frente a ${b}+ sin él`); });
TT('empaj_magnifier', 'el portador y la unidad a la que se une no sufren el −1 para impactar a larga distancia', () => { const run = (key) => { const { s, h, t } = joinedShooter(key, { like: 'empaj_magnifier' }); diceAll(1); return shotOf(s, h, t).need; }; eq(run(null) - run('empaj_magnifier'), 1, 'sin el objeto +1 por largo alcance; con él no'); });
