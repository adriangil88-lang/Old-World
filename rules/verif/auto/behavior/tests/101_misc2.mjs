// v838 — Reglas de combate y de unidad (lote 2): efectos al herir, al impactar y de movimiento
import { T, N, R, DATA, game, pair, resolve, asked, msg, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, wsl, prof, saveThr, GEOM } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
// dado: los primeros n valores a `first`, el resto a `rest`
const seq = (first, n, rest) => { let c = 0; diceAll(() => (c++ < n ? first : rest)); };
T('rule-gorefeast', RS('gorefeast'), 'Banquete de sangre: por cada Herida que un enemigo pierde por sus Impactos, tira un D6: con 6 recupera una Herida perdida', () => {
  const { s, w, l } = pair('dm_herald_khorne_throne', {}, 'state_troops', { models: 10 }); w.impactPend = { t: l.id, dist: 6 }; w.wounds = D(w).W - 2; diceAll(6); const o = resolve(s); ok(/Banquete de sangre, recupera \d+ Heridas/.test(msg(o)), 'recupera Heridas por sus Impactos: ' + msg(o).slice(0, 300)); ok(by(o.s, w).wounds > D(w).W - 2 || /Banquete/.test(msg(o)), 'Heridas recuperadas');
  const c = pair('dm_herald_khorne_throne', {}, 'state_troops', { models: 10 }); c.w.impactPend = { t: c.l.id, dist: 6 }; diceAll(5); ok(!/Banquete de sangre/.test(msg(resolve(c.s))), 'sin 6 no recupera');
});
T('rule-treeWhack', RS('treeWhack'), 'Golpe de árbol: una vez por turno, uno de sus ataques es un Golpe de árbol: el objetivo hace un test de Iniciativa; si falla sufre D3 impactos de la Fuerza del modelo sin salvación de armadura', () => {
  const run = (v) => { const { s, w, l } = pair('we_treeman', {}, 'state_troops', { models: 10 }); diceAll(v); const x = wsl(() => resolve(s)); return { x, w, l }; };
  const a = run(6); const h = a.x.log.filter((e) => e.def.id === a.l.id && e.o.noArmour && e.hits > 0); ok(h.length >= 1 && h[0].hits === 3 && h[0].S === D(a.w).S, 'con el test de Iniciativa fallido (6): D3 (=3) impactos F' + D(a.w).S + ' sin armadura: ' + JSON.stringify(a.x.log.map((e) => [e.S, e.hits, e.o.noArmour]))); const b = run(1); ok(!b.x.log.some((e) => e.def.id === b.l.id && e.o.noArmour && e.hits > 0), 'con un 1 supera el test: sin impactos');
});
T('rule-beguile', RS('beguile'), 'Aura cautivadora: los enemigos deben superar un chequeo de Liderazgo antes de impactar a este modelo en combate; si fallan, solo impactan con 6', () => {
  const hits = (strip, v) => { const f = () => { const { s, w, l } = pair('orc_boyz', { models: 10 }, 'we_weaver_unicorn', {}); w.ldm = 0; diceAll(v); const x = wsl(() => resolve(s)); return x.log.filter((e) => e.def.id === l.id).reduce((t, e) => t + e.hits, 0); }; return strip ? withoutSr('we_weaver_unicorn', 'beguile', f) : f(); };
  ok(hits(true, 5) > 0, 'montaje: sin el aura impactan con 5'); ok(hits(false, 5) === 0, 'con el aura y el chequeo fallido (5+5=10 > Ld) solo impactan con 6');
});
T('rule-mathIre', RS('mathIre'), 'Ira de Mathlann: en la fase de Combate, los modelos enemigos deben repetir una tirada para impactar con éxito contra el portador (una vez)', () => {
  const { s, w, l } = pair('orc_boyz', { models: 10 }, 'he_ishaya', {}); const d = by(s, l); cur(s); ok(R.mathIre(s, d, 5, 4) === true, 'una tirada con éxito se repite'); ok(R.mathIre(s, d, 5, 4) === false, 'solo una vez en la fase'); const e = pair('orc_boyz', { models: 10 }, 'he_ishaya', {}); cur(e.s); ok(R.mathIre(e.s, e.l, 3, 4) === false, 'una tirada fallada no se repite'); const n = pair('orc_boyz', { models: 10 }, 'state_troops', { models: 10 }); cur(n.s); ok(R.mathIre(n.s, n.l, 5, 4) === false, 'sin el arma no hay repetición');
});
T('rule-bestialFury', RS('bestialFury'), 'Furia bestial: las unidades enemigas no pueden reclamar puntos de resultado de combate adicionales por trabar su flanco o retaguardia', () => {
  const score = (type, side) => { const { s, w, l } = pair('state_troops', { models: 20 }, type, { models: 10 }, { side }); diceAll(2); const o = resolve(s); const m = /Combate: .* (\d+) – (\d+) /.exec(msg(o)); return +m[1]; };
  ok(score('orc_boyz', 'rear') > score('orc_boyz', 'front'), 'montaje: contra otros el flanco/retaguardia suma'); eq(score('vc_varghulf', 'rear'), score('vc_varghulf', 'front'), 'contra el Varghulf no suma por retaguardia'); eq(score('vc_varghulf', 'flank'), score('vc_varghulf', 'front'), 'ni por flanco');
});
T('rule-boldest', RS('boldest'), 'El más audaz de los audaces: ignora todos los modificadores negativos a su Liderazgo', () => {
  const ld = (type, pen) => { const s = game([{ type, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: [F(type), FOE(type)] }); const u = U(s, type, 0); cur(s); u.ldm = pen; return R.ldOf(s, u); };
  ok(DATA.UNITS.we_araloth.sr.includes('boldest'), 'montaje'); const base = ld('we_araloth', 0), pen = ld('we_araloth', 2), nb = ld('we_captain', 0), npen = ld('we_captain', 2); ok(npen < nb, 'montaje: otro personaje sí pierde Ld con la penalización'); eq(pen, base, 'con la regla no baja con la penalización');
});
T('rule-reaverBM', RS('reaverBM'), 'Destructor de Bestias: repite los fallos para herir contra Manadas de Bestias', () => {
  const rr = (foe) => { const { s, w, l } = pair('emp_harald', {}, foe, { models: foe === 'state_troops' ? 10 : 10 }); return R.attackProfile(w, l).rrw; };
  ok(rr('bm_ungor') === true, 'contra Hombres Bestia repite los fallos al herir'); ok(rr('state_troops') !== true, 'contra otros no');
});
T('rule-panther1', RS('panther1'), 'Orden Pantera: puede repetir un único dado que saque 1 natural en la tirada de carga, antes de descartar dados', () => {
  const run = (rule) => { const f = () => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 28.85, Math.PI / 2); cur(s); dice(1, 1, 6); diceAll(2); const r = R.apply(s, { t: 'charge', id: a.id, target: t.id }); const A = by(s, a); const m = msgs(r.events || []); return { ok: /carga contra/.test(m) && !/falla la carga/.test(m), m }; }; return rule ? withSr('state_troops', 'panther1', f) : f(); };
  const a = run(true), b = run(false); ok(a.ok && !b.ok, `con 1 y 1 la carga falla (${b.ok}); con la Orden Pantera se repite un 1 (6) y llega (${a.ok}): ` + a.m.slice(-200) + ' || ' + b.m.slice(-200));
});
