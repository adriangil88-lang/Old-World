// v838 — Reglas de disparo, unión, desafío y persecución (lote 8)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, resolve, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const shotNeed = (ev) => { const m = / tiros?, (\d)\+/.exec(msgs(ev)); return m ? +m[1] : null; };
T('rule-settraChamp', RS('settraChamp'), 'Campeón de Settra: siempre emite y acepta desafíos (si puede); los suyos no pueden rechazarse; en desafío Golpe mortal con 5+ al herir', () => {
  const { s, w } = pair('tk_nekaph', {}, 'state_troops', {}); cur(s); ok(R.mustDuel({ k: 'j', m: w }), 'el desafío de Nekaph no puede rechazarse'); const o = pair('state_troops', {}, 'state_troops', {}); ok(!R.mustDuel({ k: 'j', m: o.w }), 'control: una unidad corriente sí puede rechazar');
});
T('rule-noKneel', RS('noKneel'), '¡Settra no se arrodilla!: debe aceptar siempre un desafío salvo que Nekaph esté trabado en el mismo combate (entonces lo acepta Nekaph)', () => {
  const { s, w } = pair('tk_settra', {}, 'state_troops', {}); cur(s); ok(R.mustDuel({ k: 'j', m: w }), 'Settra no puede rechazar un desafío'); const o = pair('state_troops', {}, 'state_troops', {}); ok(!R.mustDuel({ k: 'j', m: o.w }), 'control');
});
T('rule-sworn', RS('sworn'), 'Protector jurado: si un Monarca de Nehekhara a 3" sufre un impacto, el Heraldo puede recibirlo en su lugar', () => {
  const mk = (withHerald) => { const s = game([{ type: 'tk_settra', models: 1 }, { type: 'tk_warriors_ph', models: 10 }, ...(withHerald ? [{ type: 'tk_herald', models: 1 }] : [])], [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'], phase: 'combat', active: 1 }); const st = put(U(s, 'tk_settra', 0), 36, 40), w = put(U(s, 'tk_warriors_ph', 0), 36, 44); join(s, st, w); const h = withHerald ? put(U(s, 'tk_herald', 0), 36, 42) : null; if (h) join(s, h, w); cur(s); return { s, st, h }; };
  const a = mk(true); diceAll(6); const r = R.woundAndSave(a.s, a.st, 3, 4, 0, { noArmour: true, noRegen: true, noWard: true }); eq(r.through, 0, 'el Monarca no sufre los impactos'); ok(a.h.wounds < D(a.h).W, 'el Heraldo los recibe en su lugar (' + a.h.wounds + '/' + D(a.h).W + ')');
  const b = mk(false); diceAll(6); ok(R.woundAndSave(b.s, b.st, 3, 4, 0, { noArmour: true, noRegen: true, noWard: true }).through > 0, 'control: sin Heraldo el Monarca sufre las heridas');
});
T('rule-itRun', RS('itRun'), 'Golpear y huir: si gana una ronda de combate puede retroceder en buen orden en lugar de seguir o perseguir (se pregunta)', () => {
  const run = (ans, strip) => { const f = () => { const { s, w, l } = pair('gob_kiknik', {}, 'state_troops', {}); cur(s); diceAll(4); return resolve(s, { 'Golpear y huir': ans }); }; return strip ? withoutSr('gob_kiknik', 'itRun', f) : f(); };
  const a = run('y'), b = run('n'), c = run('y', true); ok(asked(a, 'Golpear y huir') && !asked(c, 'Golpear y huir'), 'se pregunta solo con la regla'); ok(/¡Golpea y huye!/.test(msgs(a.r)), 'si acepta se retira en buen orden: ' + msgs(a.r).slice(-160)); ok(!/¡Golpea y huye!/.test(msgs(b.r)), 'si rechaza, no');
});
T('rule-loner', RS('loner'), 'Solitario: un personaje Solitario solo se une a unidades Solitarias y una unidad Solitaria no admite personajes sin la regla', () => {
  const j = (ch, host, fac) => { const s = game([{ type: ch, models: 1 }, { type: host, models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: [fac, 'orcs'], phase: 'move' }); const c = put(U(s, ch, 0), 36, 40), h = put(U(s, host, 0), 36, 44); cur(s); return R.joinCheck(s, c, h); };
  ok(!j('we_shadowdancer', 'we_wardancers', 'wood'), 'el Solitario se une a una unidad Solitaria'); ok(/Solitario/.test(j('we_shadowdancer', 'we_glade_guard', 'wood') || ''), 'no a una no Solitaria'); ok(/Solitario/.test(j('we_lord', 'we_wardancers', 'wood') || ''), 'ni un personaje normal a una Solitaria');
});
T('rule-immovable', RS('immovable'), 'Objeto inamovible: una vez desplegado, su dotación no puede moverlo (solo pivotar)', () => {
  const s = game([{ type: 'dw_anvil', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dwarfs', 'orcs'], phase: 'move' }); const u = put(U(s, 'dw_anvil', 0), 36, 30); cur(s); ok(!R.previewMove(s, u.id, { x: 36, y: 28, face: u.face }, false).ok, 'no puede avanzar'); ok(R.previewMove(s, u.id, { x: 36, y: 30, face: u.face + 0.5 }, false).ok, 'sí puede pivotar');
});
T('rule-stableFP', RS('stableFP'), 'Plataforma de tiro estable: las armas de proyectil de la dotación pueden disparar aunque el carro haya marchado', () => {
  const chk = (strip) => { const f = () => { const s = game([{ type: 'war_wagon', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dwarfs', 'orcs'], phase: 'shoot' }); const u = put(U(s, 'war_wagon', 0), 36, 50), t = put(U(s, 'orc_boyz', 1), 36, 36, Math.PI / 2); u.marched = true; u.moved = true; cur(s); return R.shootCheck(s, u, t); }; return strip ? withoutSr('war_wagon', 'stableFP', f) : f(); };
  ok(!/marchado/.test(chk(false) || ''), 'tras marchar puede disparar: ' + chk(false)); ok(/marchado/.test(chk(true) || ''), 'control: sin la regla no puede');
});
T('rule-ignoresCover', RS('ignoresCover'), 'Ignora la cobertura: al disparar ignora los modificadores de cobertura parcial o total', () => {
  const need = (strip) => { const f = () => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'we_glade_guard', models: 10 }], { f: ['empire', 'wood'], phase: 'shoot' }); const a = put(U(s, 'emp_archers', 0), 36, 40), t = put(U(s, 'we_glade_guard', 1), 36, 22, Math.PI / 2); s.terrain.push({ kind: 'forest', x: 36, y: 22, w: 12, h: 8 }); cur(s); const ev = []; R.resolveShot(s, a, t, ev); return shotNeed(ev); }; return strip === 'add' ? withSr('emp_archers', 'ignoresCover', f) : f(); };
  const a = need('add'), b = need(false); ok(a < b, `con la regla no hay penalización por cobertura (${b}+ → ${a}+)`);
});
T('rule-soot', RS('soot'), 'Nubes de hollín y humo: salvo si va montado, cobertura completa a 3" de una unidad amiga de máquina de guerra', () => {
  const need = (near, strip) => { const f = () => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'emp_engineer', models: 1 }, { type: 'great_cannon', models: 1 }], { f: ['empire', 'empire'], phase: 'shoot' }); const a = put(U(s, 'emp_archers', 0), 36, 40), t = put(U(s, 'emp_engineer', 1), 36, 24, Math.PI / 2), m = put(U(s, 'great_cannon', 1), near ? 36 : 60, near ? 21 : 10, Math.PI / 2); cur(s); const ev = []; R.resolveShot(s, a, t, ev); return shotNeed(ev); }; return strip ? withoutSr('emp_engineer', 'soot', f) : f(); };
  const a = need(true), b = need(false), c = need(true, true); ok(a >= b + 2 || a >= 6, `cobertura completa cerca de una máquina (${b}+ → ${a}+)`); ok(c < a || c === b, 'sin la regla no hay cobertura');
});
T('rule-standBack', RS('standBack'), '«¡Atrás, jefe!»: no puede ser objetivo de disparos ni hechizos enemigos a 3" o menos de una máquina de guerra amiga', () => {
  const chk = (near) => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'dw_engineer', models: 1 }, { type: 'dw_cannon', models: 1 }], { f: ['empire', 'dwarfs'], phase: 'shoot' }); const a = put(U(s, 'emp_archers', 0), 36, 40), t = put(U(s, 'dw_engineer', 1), 36, 24, Math.PI / 2), m = put(U(s, 'dw_cannon', 1), near ? 36 : 60, near ? 21 : 10, Math.PI / 2); cur(s); return R.shootCheck(s, a, t); };
  ok(/Atrás, jefe/.test(chk(true) || ''), 'a 3" de una máquina: ' + chk(true)); ok(!/Atrás, jefe/.test(chk(false) || ''), 'lejos de una máquina sí puede ser objetivo');
});
