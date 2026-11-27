// v840 — Casos límite de objetos antes comprobados solo por su efecto principal
import { T, R, DATA, GEOM, ok, eq, cur, put, game, U } from '../lib3.mjs';
const { ITEMS, UNITS } = DATA;
const F = 'rules/rh.txt:4893-4900 (Runa de la Verdadera Bestia); rules/new/aj_highelves.txt:1699-1707 (Estandarte del Equilibrio)';
const ws = (foeType, gap, mine = ['bm_rune_beast'], second = false) => {
  const s = game([{ type: foeType, models: 3 }], [{ type: 'bm_beastlord', models: 1, items: mine }, ...(second ? [{ type: 'bm_beastlord', models: 1, items: mine }] : [])]);
  const a = U(s, foeType, 0), t = U(s, 'bm_beastlord', 1);
  put(a, 36, 10, Math.PI / 2); const hh = R.D(a); put(t, 36, 10 + 1, -Math.PI / 2);
  // separar por el hueco exacto entre bordes (unitDist)
  let y = 10 + 1; for (let i = 0; i < 400 && Math.abs(GEOM.unitDist ? GEOM.unitDist(a, t) - gap : 0) > 0.001; i++) { y += (gap - GEOM.unitDist(a, t)) * 0.9; put(t, 36, y, -Math.PI / 2); }
  cur(s); return { s, a, t, FP: R.attackProfile(a, t), d: GEOM.unitDist(a, t) };
};
const base = (foeType) => { const s = game([{ type: foeType, models: 3 }], [{ type: 'bm_beastlord', models: 1 }]); const a = U(s, foeType, 0), t = U(s, 'bm_beastlord', 1); put(a, 36, 10, Math.PI / 2); put(t, 36, 20, -Math.PI / 2); cur(s); return R.attackProfile(a, t).ws; };
T('v840-edge-bm_rune_beast', F, 'Runa de la Verdadera Bestia: solo monstruos, solo a 6" o menos, sin acumular, mínimo HA 1', () => {
  ok(GEOM.unitDist, 'unitDist exportada');
  const w0 = base('trolls');
  const n = ws('trolls', 5.5); ok(n.d <= 6, 'gap ' + n.d); eq(n.FP.ws, w0 - 1, 'monstruo a ≤6": −1 HA');
  const f = ws('trolls', 6.5); ok(f.d > 6, 'gap ' + f.d); eq(f.FP.ws, w0, 'monstruo a >6": sin penalización');
  const wn = base('orc_boyz'); const nm = ws('orc_boyz', 3); eq(nm.FP.ws, wn, 'no monstruo: sin penalización');
  const two = ws('trolls', 5.5, ['bm_rune_beast'], true); eq(two.FP.ws, w0 - 1, 'dos runas: el −1 no se acumula (misma regla, una sola penalización)');
  ok(w0 >= 1, 'HA base ≥ 1'); ok(n.FP.ws >= 1, 'HA modificada nunca < 1');
});
T('v840-edge-heaj_balance', F, 'Estandarte del Equilibrio: nadie repite (control con repetición real); solo en contacto con el portador', () => {
  const mk = (banner) => { const s = game([{ type: 'flagellants', models: 10 }, { type: 'flagellants', models: 10 }], [{ type: 'he_spearmen', models: 10, std: true }, { type: 'he_spearmen', models: 10 }]);
    const A = s.units.filter((u) => u.type === 'flagellants' && u.owner === 0), Tt = s.units.filter((u) => u.type === 'he_spearmen' && u.owner === 1); const [a1, a2] = A, [t1, t2] = Tt;
    if (banner) t1.banner = banner; put(a1, 20, 20, Math.PI / 2); put(t1, 20, 20 + 1.0 + 0, -Math.PI / 2); put(a2, 50, 20, Math.PI / 2); put(t2, 50, 21, -Math.PI / 2); cur(s); return { s, a1, a2, t1, t2 }; };
  const c = mk(null), b = mk('heaj_balance');
  const cp = R.attackProfile(c.a1, c.t1), bp = R.attackProfile(b.a1, b.t1);
  const rep = (p) => !!(p.rrHit || p.rr1 || p.rrw || p.hatred || p.pf || p.djaf || p.grudge > 0);
  ok(rep(cp), 'control: sin estandarte el rival sí repite ' + JSON.stringify({ g: cp.grudge, h: cp.hatred, r1: cp.rr1 }));
  ok(!rep(bp), 'con el estandarte el rival no repite');
  const own = R.attackProfile(b.t1, b.a1); ok(!own.rrHit && !own.rr1 && !own.rrw && !(own.grudge > 0), 'el portador tampoco repite');
  const other = R.attackProfile(b.a2, b.t2); eq(rep(other), rep(R.attackProfile(c.a2, c.t2)), 'otra unidad sin contacto con el portador conserva sus repeticiones');
});
