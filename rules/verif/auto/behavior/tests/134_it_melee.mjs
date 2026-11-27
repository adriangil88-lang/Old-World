// v839 — Objetos que alteran los ataques en combate contra el portador o del portador
import { T, N, R, DATA, ok, eq, cur, diceAll, dice, put, engage, fight, msgs } from '../lib3.mjs';
import { bearer, meleeHits, meleeThr, FILE } from './_it2.mjs';
const { ITEMS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
TT('mu_slug', '−1 para impactar en combate contra el portador y su unidad', () => { const a = meleeThr('mu_slug'), b = meleeThr(null, { like: 'mu_slug' }); eq(a - b, 1, `umbral ${b}+ → ${a}+`); });
TT('collar_zorga', 'las bestias de carga enemigas (montura, no el jinete) que atacan al portador o su unidad tienen −1 para impactar', () => {
  // Caballeros imperiales (jinete + caballo) contra el portador: con tirada igual al umbral del jinete, el caballo (−1) falla y el jinete impacta
  const need = (() => { for (let v = 2; v <= 6; v++) { const r = meleeHits(null, { like: 'collar_zorga', foe: 'empire_knights', foeN: 5, v }); if (r.h > 0) return v; } return 7; })();
  const c = meleeHits(null, { like: 'collar_zorga', foe: 'empire_knights', foeN: 5, v: need }), w = meleeHits('collar_zorga', { foe: 'empire_knights', foeN: 5, v: need });
  eq(c.h, c.n, 'control: todos los ataques impactan en el umbral'); ok(w.h < w.n && w.h > 0, `con el collar: ${w.h} de ${w.n} (los del jinete impactan, los del caballo no)`);
  const g = meleeHits('collar_zorga', { foe: 'state_troops', foeN: 5, v: meleeThr('collar_zorga', { foe: 'state_troops' }) }); ok(g.h === g.n, 'infantería: sin penalización');
  let less = 0; for (let v = 2; v <= 6; v++) { const c2 = meleeHits(null, { like: 'collar_zorga', foe: 'tk_chariot', foeN: 3, v }), w2 = meleeHits('collar_zorga', { foe: 'tk_chariot', foeN: 3, v }); ok(w2.h <= c2.h, 'nunca más impactos con el collar'); if (w2.h < c2.h) less++; } ok(less > 0, 'las bestias de tiro del carro sufren el −1'); });
