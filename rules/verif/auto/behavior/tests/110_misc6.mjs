// v838 — Reglas de movimiento, disparo y miedo (lote 11)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, moveStart, shotOf, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
T('rule-stupidity', RS('stupidity'), 'Estupidez: al empezar el turno, si no huye ni está trabada, chequeo de Liderazgo; si falla, no puede mover, disparar, lanzar ni dispersar y debe Aguantar si la cargan', () => {
  const run = (d, mod) => { const s = game([{ type: 'trolls', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy', active: 0 }); const u = put(U(s, 'trolls', 0), 36, 40); if (mod) mod(u, s); cur(s); dice(d); diceAll(3); const o = strategy(s); return { u: by(o.s, u), s: o.s }; };
  const a = run([6, 5]); ok(a.u.stupid === true, 'si falla el chequeo sucumbe a la Estupidez'); 
  ok(run([1, 2]).u.stupid !== true, 'si lo supera no'); ok(run([1, 1]).u.stupid !== true, 'doble 1 siempre supera'); ok(run([6, 5], (u) => { u.fleeing = true; }).u.stupid !== true, 'huyendo no chequea'); ok(run([6, 5], (u, s) => { engage(s, u, U(s, 'state_troops', 1)); }).u.stupid !== true, 'trabada no chequea');
  const mv = game([{ type: 'trolls', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 }); const tu = put(U(mv, 'trolls', 0), 36, 40); tu.stupid = true; cur(mv); ok(/Estúpida/.test(R.previewMove(mv, tu.id, { x: 36, y: 38, face: tu.face }, false).reason || ''), 'no puede mover');
  const cc = (stupid) => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'trolls', models: 5 }], { f: ['empire', 'orcs'], phase: 'move', active: 0 }); put(U(s, 'state_troops', 0), 36, 40); const t = put(U(s, 'trolls', 1), 36, 33, Math.PI / 2); t.stupid = stupid; cur(s); diceAll(3); return asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'state_troops', 0).id, target: U(c, 'trolls', 1).id }), [1], () => 'hold').needs.some((n) => /Reacción/.test(n.title)); };
  ok(!cc(true) && cc(false), 'si la cargan debe Aguantar (no elige reacción)');
});
T('rule-randMove', RS('randMove'), 'Movimiento aleatorio: se mueve en la subfase de movimientos obligatorios hasta la distancia de los dados, hacia el enemigo; si contacta cuenta como carga; no marcha ni declara cargas', () => {
  const run = (d, y) => { const s = game([{ type: 'squig_hoppers', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 }); const u = put(U(s, 'squig_hoppers', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, y, Math.PI / 2); cur(s); dice(d); diceAll(2); const ev = []; R.randomMoves(s, ev); return { u: by(s, u), m: msgs(ev), y0: 50 }; };
  const a = run([2, 2, 2, 2, 2], 6); ok(/dando tumbos/.test(a.m) && a.u.y < 40 && a.u.noCharge === true, 'avanza hacia el enemigo sin declarar cargas: ' + a.m.slice(0, 120)); const b = run([6, 6, 6, 6, 6], 30); ok(/sin control contra/.test(b.m), 'si alcanza al enemigo cuenta como carga: ' + b.m.slice(0, 160));
});
T('rule-volley', RS('volley'), 'Fuego de volea: si no se ha movido este turno, además de la primera fila dispara la mitad (redondeando hacia arriba) de los modelos de cada fila restante', () => {
  const n = (moved, strip) => { const f = () => { const s = game([{ type: 'we_glade_guard', models: 20 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'we_glade_guard', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2); a.moved = moved; cur(s); diceAll(1); return shotOf(s, a, t).n; }; return strip ? withoutSr('we_glade_guard', 'volley', f) : f(); };
  ok(n(false) > n(true), `sin moverse dispara más (${n(true)} → ${n(false)} tiros)`);
});
T('rule-steadfastDisc', RS('steadfastDisc'), 'Disciplina firme: puede Disparar en Salva (Volley Fire) en un turno en que se movió o al hacer la reacción de carga Aguantar y Disparar', () => {
  const n = (strip) => { const f = () => { const s = game([{ type: 'tk_cohort_a', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'tk_cohort_a', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2); a.models = a.wounds = 20; a.startModels = 20; a.moved = true; cur(s); diceAll(1); return shotOf(s, a, t).n; }; return strip ? withoutSr('tk_cohort_a', 'steadfastDisc', f) : f(); };
  ok(n(false) > n(true), `tras mover conserva el fuego en salva (${n(true)} → ${n(false)} tiros)`);
});
T('rule-dispersedFormation', RS('dispersedFormation'), 'Formación dispersa: en formación de escaramuza, cada modelo debe estar a 2" de otro de su unidad (en vez de 1")', () => { eq(R.spMaxOf({ type: 'br_pegasus' }), 2, 'separación máxima 2"'); eq(R.spMaxOf({ type: 'lm_skirmishers' }), 1, 'control: escaramuza normal 1"'); });
T('rule-extendedFormation', RS('extendedFormation'), 'Formación extendida: en formación de escaramuza, cada modelo debe estar a 3" de otro de su unidad (en vez de 1")', () => { eq(R.spMaxOf({ type: 'dw_scoutgyro' }), 3, 'separación máxima 3"'); });
T('rule-terror', RS('terror'), 'Causa Terror: como Miedo, pero al declarar la carga el objetivo debe superar Liderazgo o huye; el bando que gana pone −1 Ld al perdedor', () => {
  const ch = (d) => { const s = game([{ type: 'steam_tank', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); put(U(s, 'steam_tank', 0), 36, 40); put(U(s, 'orc_boyz', 1), 36, 32, Math.PI / 2); cur(s); dice(d); diceAll(3); const r = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'steam_tank', 0).id, target: U(c, 'orc_boyz', 1).id }), [0, 1]); return msgs(r.r.events || []); };
  ok(/huye aterrorizado/.test(ch([6, 5])), 'si falla el Liderazgo el objetivo huye'); ok(!/huye aterrorizado/.test(ch([1, 2])), 'si lo supera no');
  const ld = (rule) => withSr('woc_marauders', rule, () => { const { s } = pair('woc_marauders', { models: 20 }, 'state_troops', { models: 10 }); cur(s); dice(1, 6); diceAll(4); return /contra Ld (\d+)/.exec(msgs(fight(s)))?.[1]; });
  const a = ld('terror'), b = ld([]); ok(a && b && +a === +b - 1, `el perdedor sufre −1 Ld en la ruptura (${b} → ${a})`);
});
T('rule-stomp', RS('stomp'), 'Pisotón: solo en contacto de peana con el enemigo: X impactos automáticos con la Fuerza sin modificar, resueltos los últimos; un behemot pisotea con FP −2 salvo contra otro monstruo', () => {
  const run = (strip) => { const f = () => { const { s, w, l } = pair('emp_general_griffon', {}, 'state_troops', { models: 10 }); cur(s); diceAll(1); const ev = fight(s); return msgs(ev); }; return strip ? withoutSr('emp_general_griffon', 'stomp', f) : f(); };
  ok(/[Pp]isot/.test(run(false)) && !/[Pp]isot/.test(run(true)), 'el pisotón añade impactos solo con la regla: ' + run(false).slice(0, 200));
});
