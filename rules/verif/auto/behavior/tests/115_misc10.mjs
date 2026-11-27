// v838 — Reglas de Skaven, Catay, Bretonia y otras (lote 16)
import { GEOM, T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, resolve, shotOf, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const skaven = (teams = true) => { const s = game([{ type: 'sk_clanrats', models: 20 }, ...(teams ? [{ type: 'sk_ratlinggun', models: 1, reg: 'sk_clanrats' }] : [])], [{ type: 'emp_archers', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['skaven', 'empire'], phase: 'shoot' }); return s; };
T('rule-wtParent', RS('wtParent'), 'Equipo de armas adjunto: la unidad matriz puede llevar un equipo de armas (Ametralladora Ratling, Lanzallamas, Mortero, Perforadora o Segadora)', () => {
  const s = skaven(true); const par = U(s, 'sk_clanrats', 0), wt = U(s, 'sk_ratlinggun', 0); eq(wt.wtOf, par.id, 'el equipo queda adjunto a su unidad matriz'); const s2 = skaven(false); ok(!s2.units.some((u) => u.wtOf), 'control: sin equipo no hay vínculo');
  const s3 = game([{ type: 'state_troops', models: 20 }, { type: 'sk_ratlinggun', models: 1, reg: 'state_troops' }], [{ type: 'orc_boyz', models: 10 }], { f: ['skaven', 'orcs'], phase: 'shoot' }); ok(!U(s3, 'sk_ratlinggun', 0).wtOf, 'una unidad sin la regla no admite el equipo');
});
T('rule-wteam', RS('wteam'), 'Equipo de armas: +Ld igual al bonus de filas de su unidad matriz a 3" (máx. 10); no puede ser blanco de disparos a 3" de su matriz de 5+ modelos salvo que sea el más cercano', () => {
  const s = skaven(true); const par = put(U(s, 'sk_clanrats', 0), 36, 40), wt = put(U(s, 'sk_ratlinggun', 0), 36, 40 - GEOM.dims(par).d / 2 - GEOM.dims(wt0(s)).d / 2 - 0.5); cur(s); const l0 = D(wt).Ld, lw = R.ldOf(s, wt); ok(lw > l0 && lw <= 10, `Ld ${l0} → ${lw} con el bonus de filas de la matriz`); eq(lw, Math.min(10, l0 + R.rankBonus(par)), 'Ld base + bonus de filas');
  put(wt, 36, 70); cur(s); eq(R.ldOf(s, wt), l0, 'lejos de su matriz no hay bonificación');
  const t = skaven(true); const p2 = put(U(t, 'sk_clanrats', 0), 36, 20, Math.PI / 2), w2 = put(U(t, 'sk_ratlinggun', 0), 36, 20 - GEOM.dims(p2).d / 2 - 1.5, Math.PI / 2); const sh = put(U(t, 'emp_archers', 1), 36, 44), near = put(U(t, 'state_troops', 1), 36, 70); cur(t); void near;
  ok(/protegido por su unidad matriz/.test(R.shootCheck(t, sh, w2) || ''), 'a 3" de una matriz de 5+ modelos y habiendo un blanco más próximo no puede ser objetivo');
});
const wt0 = (s) => U(s, 'sk_ratlinggun', 0);
T('rule-chainmaker', RS('chainmaker'), 'Forjadora de Cadenas: todo estandarte enemigo capturado por ella o su unidad vale 100 puntos de victoria', () => {
  const run = (strip) => { const f = () => { const { s, w, l } = pair('woc_marauders', { models: 20 }, 'state_troops', { models: 3, std: true }, { extra0: [{ type: 'woc_frydaal', models: 1 }] }); const c = U(s, 'woc_frydaal', 0); put(c, w.x, w.y); join(s, c, w); cur(s); diceAll(6); fight(s); return { tr: l.trophy, er: !!l.trophyErrant, vp: R.scoreVP(s, 0) }; }; return strip ? withoutSr('woc_frydaal', 'chainmaker', f) : f(); };
  const a = run(false), b = run(true); ok(a.tr && a.er && !b.er, 'el estandarte capturado cuenta como de valor doble'); eq(a.vp - b.vp, 50, '+50 PV sobre los 50 normales (100 en total)');
});
