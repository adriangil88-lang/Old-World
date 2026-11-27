// v838 — Reglas de Caos, Daemons y artillería (lote 12)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, resolve, shotOf, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
T('rule-gaze', RS('gaze'), 'Mirada de los Dioses: tabla de D6: 1 Estupidez (o −1 Ld), 2 +1 I, 3 +1 R hasta su próximo turno; 4 +1 HA, 5 +1 A, 6 +1 F y +1 Ld el resto de la partida', () => {
  const g = (d, type = 'bm_wargor') => { const s = game([{ type, models: 1 }], [{ type: 'state_troops', models: 10 }], { f: [F(type), 'empire'], phase: 'strategy' }); const u = put(U(s, type, 0), 36, 40); cur(s); dice(d); const ev = []; R.gazeRoll(s, u, ev); return u; };
  ok(g(1).gz?.stupid === true, '1: Estupidez'); ok(g(2).fx.some((f) => f.k === 'potI' && f.v === 1), '2: +1 I'); ok(g(3).fx.some((f) => f.k === 'potT' && f.v === 1), '3: +1 R'); eq(g(4).gz.WS, 1, '4: +1 HA'); eq(g(5).gz.A, 1, '5: +1 A'); const six = g(6); ok(six.gz.S === 1 && six.gz.Ld === 1, '6: +1 F y +1 Ld');
  const dd = withSr('bm_wargor', 'stupidity', () => g(1)); ok(dd.gz?.Ld === -1 && !dd.gz?.stupid, 'con Estupidez previa: −1 Ld en su lugar');
});
T('rule-reliquary', RS('reliquary'), 'Relicario maldito: las unidades amigas con Muertos Vivientes necrománticos en el alcance de mando de este modelo tienen +1 a Movimiento e Iniciativa', () => {
  const f = (near) => { const s = game([{ type: 'vc_mortis', models: 1 }, { type: 'vc_zombies', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['vc', 'orcs'], phase: 'move' }); put(U(s, 'vc_mortis', 0), 36, 40); const z = put(U(s, 'vc_zombies', 0), 36, near ? 46 : 70); cur(s); return { m: R.mvOf(z), i: R.effI(z, []) }; };
  const a = f(true), b = f(false); eq(a.m, b.m + 1, '+1 Movimiento'); eq(a.i, b.i + 1, '+1 Iniciativa');
});
T('rule-warpedForm', RS('warpedForm'), 'Forma deformada: al combatir elige hasta tu siguiente turno Garras agrandadas (FP+1, Perforante 2), Protuberancias (+1 Ataque) o Carne endurecida (+1 Resistencia y +2 armadura)', () => {
  const mk = () => { const { s, w, l } = pair('woc_skinwolves', {}, 'state_troops', {}); cur(s); return { s, w, l }; };
  const a = mk(); const o = resolve(a.s, { 'Forma deformada': 'wfClaws' }); ok(asked(o, 'Forma deformada'), 'se elige en el momento (popup)'); ok(by(o.s, a.w).fx.some((f) => f.k === 'wfClaws'), 'la Transfiguración queda aplicada');
  const p0 = prof(a.s, a.w, a.l); const a1 = mk(); a1.w.fx = [{ k: 'wfClaws' }]; const p1 = prof(a1.s, a1.w, a1.l); eq(p1.ap, p0.ap + 1, 'Garras: FP +1'); ok(p1.ab >= 2, 'Garras: Perforante 2');
  const a2 = mk(); a2.w.fx = [{ k: 'wfBarb' }]; ok(prof(a2.s, a2.w, a2.l).atk > p0.atk, 'Protuberancias: +1 Ataque por modelo');
  const a3 = mk(); const sv0 = R.svOf(a3.w); a3.w.fx = [{ k: 'wfFlesh' }]; ok(R.svOf(a3.w) < sv0, 'Carne endurecida: armadura +2 (' + sv0 + '+ → ' + R.svOf(a3.w) + '+)');
});
T('rule-thunderous', RS('thunderous'), 'Impacto atronador: hasta tu próximo turno, las unidades a 2D6" del punto de impacto sufren −1 M y no pueden usar Zancada', () => {
  const run = (strip) => { const f = () => { const s = game([{ type: 'ct_cannon_ogre', models: 1 }], [{ type: 'orc_boyz', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['ct', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'ct_cannon_ogre', 0), 36, 44), t = put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2), near = put(U(s, 'state_troops', 1), 40, 20, Math.PI / 2); cur(s); diceAll(3); const ev = []; R.resolveShot(s, a, t, ev); return { m0: R.mvOf(t), near: R.mvOf(near), fx: !!by(s, t).fx?.some((x) => x.k === 'thund') }; }; return strip ? withoutSr('ct_cannon_ogre', 'thunderous', f) : f(); };
  const a = run(false), b = run(true); ok(a.fx && !b.fx, 'las unidades próximas quedan marcadas'); eq(a.m0, b.m0 - 1, '−1 Movimiento');
});
