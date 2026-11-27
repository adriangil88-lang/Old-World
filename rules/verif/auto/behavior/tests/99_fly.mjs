// v838 — Ataques al sobrevolar (Remaining Moves): flyAttacks/flyHit con el motor real
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, asks, wsl } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
// u (vuela) en (36,40) mirando al norte; el blanco enemigo en (36,30); destino (36,16)
const fly = (type, o = {}) => { const s = game([{ type, models: o.models || DATA.UNITS[type].min || 1 }], [{ type: o.foe || 'state_troops', models: 10 }], { f: [F(type), FOE(type)], phase: 'move' }); const u = U(s, type, 0), t = U(s, o.foe || 'state_troops', 1); put(u, 36, 40); put(t, 36, 30, Math.PI / 2); cur(s); return { s, u, t }; };
const hit = (type, k, n, o = {}) => { const x = fly(type, o); if (o.q) dice(o.q); if (o.all != null) diceAll(o.all); const ev = []; const w = wsl(() => R.flyHit(x.s, x.u, k, x.t, n, ev)); return { ...x, ev, log: w.log.filter((e) => e.def.id === x.t.id), m: msgs(ev) }; };
T('rule-diveBomb', RS('diveBomb'), 'Bombardeo en picado: una vez por partida, al volar sobre una unidad no trabada: D6 impactos de F3, FP −1 por modelo (cada 1 cuesta una herida)', () => {
  const a = hit('dw_gyro', 'dive', 2, { q: [4, 1] }); const e = a.log[0]; ok(e && e.hits === 5 && e.S === 3 && e.ap === 1, `2 modelos con 4 y 1: 5 impactos F3 FP−1: ` + JSON.stringify(a.log.map((x) => [x.S, x.ap, x.hits]))); ok(by(a.s, a.u).wounds < DATA.UNITS.dw_gyro.W * a.u.models || /pierde 1 herida/.test(a.m), 'el 1 natural cuesta una herida: ' + a.m.slice(-160)); ok(a.u.used.dive === 1, 'una vez por partida');
  const x = fly('dw_gyro'); x.u.used.dive = 1; const o = asks(x.s, (c) => { const ev = []; R.flyAttacks(c, U(c, 'dw_gyro', 0), { x: 36, y: 40, face: -Math.PI / 2 }, { x: 36, y: 16, face: -Math.PI / 2 }, ev); return ev; }, [0, 1]); ok(!o.needs.some((n) => /picado/.test(n.title)), 'ya usado: no se ofrece');
  const y = fly('dw_gyro'); const o2 = asks(y.s, (c) => { const ev = []; R.flyAttacks(c, U(c, 'dw_gyro', 0), { x: 36, y: 40, face: -Math.PI / 2 }, { x: 36, y: 16, face: -Math.PI / 2 }, ev); return ev; }, [0, 1]); ok(o2.needs.some((n) => /picado/.test(n.title)), 'al sobrevolar a una unidad no trabada se ofrece el ataque: ' + o2.needs.map((n) => n.title));
});
T('rule-wakeFire', RS('wakeFire'), 'Estela de fuego: al volar sobre una unidad enemiga no trabada, esta sufre D6 impactos de F4, FP −1, flamígeros', () => {
  const a = hit('he_flamespyre', 'wake', 1, { all: 5 }); const e = a.log[0]; ok(e && e.hits === 5 && e.S === 4 && e.ap === 1 && e.o.flaming, 'D6 (=5) impactos F4 FP−1 flamígeros: ' + JSON.stringify(a.log.map((x) => [x.S, x.ap, x.hits, x.o.flaming])));
});
T('rule-dropRocks', RS('dropRocks'), 'Lluvia de rocas: una vez por partida, al volar sobre una unidad no trabada: D3 impactos de F4, sin FP, por modelo que la sobrevuele', () => {
  const a = hit('lm_terradons', 'rocks', 3, { all: 2 }); const e = a.log[0]; ok(e && e.hits === 6 && e.S === 4 && e.ap === 0, '3 modelos × D3 (=2) = 6 impactos F4 sin FP: ' + JSON.stringify(a.log.map((x) => [x.S, x.ap, x.hits]))); ok(a.u.used.rocks === 1, 'una vez por partida');
});
T('rule-slashAtk', RS('slashAtk'), 'Ataque de cuchillas: una vez por turno, al sobrevolar una unidad enemiga no trabada: D3 impactos de F4 por modelo que la sobrevuele', () => {
  const a = hit('dm_screamers', 'slash', 3, { all: 3 }); const e = a.log[0]; ok(e && e.hits === 9 && e.S === 4, '3 modelos × D3 (=3) = 9 impactos F4: ' + JSON.stringify(a.log.map((x) => [x.S, x.ap, x.hits])));
});
T('rule-bombRun', RS('bombRun'), 'Bombardeo: al sobrevolar una unidad enemiga no trabada tira 1D6: 1 pierde una Herida; 2 el enemigo pierde una Herida; 3-4 plantilla de 5"; 5-6 dos plantillas de 3"; F4, FP −1', () => {
  const r1 = hit('dw_gyrobomber', 'bomb', 1, { q: [1] }); ok(/detonación prematura/.test(r1.m), '1: pierde una herida propia: ' + r1.m); const r2 = hit('dw_gyrobomber', 'bomb', 1, { q: [2] }); ok(/bomba defectuosa/.test(r2.m) && r2.log.length === 0, '2: el enemigo pierde 1 Herida (sin tirada de herir)');
  const r3 = hit('dw_gyrobomber', 'bomb', 1, { q: [3], all: 4 }); ok(r3.log.some((e) => e.S === 4 && e.ap === 1), '3-4: impactos F4 FP−1: ' + JSON.stringify(r3.log.map((x) => [x.S, x.ap, x.hits]))); const r5 = hit('dw_gyrobomber', 'bomb', 1, { q: [5], all: 4 }); ok(r5.log.some((e) => e.S === 4 && e.ap === 1), '5-6: dos plantillas de 3"');
});
T('rule-spectralReapers', RS('spectralReapers'), 'Segadores Espectrales: al sobrevolar una unidad enemiga no trabada: un impacto de F4 por modelo que pasó sobre ella, sin salvación de armadura, flamígero y mágico', () => {
  const a = hit('vc_hexwraith', 'reap', 3); const e = a.log[0]; ok(e && e.hits === 3 && e.S === 4 && e.o.noArmour && e.o.flaming && e.o.magical, '3 impactos F4 sin armadura, flamígeros y mágicos: ' + JSON.stringify(a.log.map((x) => [x.S, x.hits, x.o.noArmour, x.o.flaming, x.o.magical])));
});
