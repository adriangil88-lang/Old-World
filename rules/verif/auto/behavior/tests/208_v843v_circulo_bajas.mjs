// v843v (punto 1a y 1d) — formas redondas (círculo analítico) y bajas según Core p.102
import { T, R, GEOM, game, put, U, ok, eq } from '../lib2.mjs';
const rect = (x0, y0, x1, y1) => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
T('v843v-circulo-vision', 'Libro de Karak (Forja del herrero: peana redonda de 100 mm); Core p.103', 'La vista contra un obstáculo circular se calcula con el círculo real (tangentes y rayo-círculo): un rayo que pasa por la esquina del cuadrado circunscrito pero fuera del círculo SÍ ve; con un cuadrado (aproximación antigua) se tapaba', () => {
  const C = { x: 10, y: 0, r: 1.97 }, o = [{ c: rect(5.9, -7, 6.1, -6.8), tg: true, u: 'T', in: new Set() }], a = { x: 14, y: 1.1 };
  const circ = [{ circ: C, c: rect(8.03, -1.97, 11.97, 1.97), id: 'k', solid: true }], sq = [{ c: rect(8.03, -1.97, 11.97, 1.97), id: 'k', solid: true }];
  ok(GEOM.losSweep(a, o, circ, null, false).vis, 'con el círculo real hay visión');
  ok(!GEOM.losSweep(a, o, sq, null, false).vis, 'con el cuadrado circunscrito (antes) se tapaba');
  ok(!GEOM.losSweep({ x: 14, y: 0 }, [{ c: rect(5.9, -0.1, 6.1, 0.1), tg: true, u: 'T', in: new Set() }], circ, null, false).vis, 'por el centro del círculo se tapa');
  ok(GEOM.circPolyDist(rect(11, 1.5, 12, 3), C) < 0 && GEOM.circPolyDist(rect(11.9, 1.9, 13, 3), C) > 0, 'distancia exacta círculo-polígono: la esquina del cuadrado no toca el círculo');
});
const mk = (n, F) => { const s = game([{ type: 'crossbowmen', models: n }], [{ type: 'orc_boyz', models: 10 }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'] }); const A = U(s, 'crossbowmen', 0); A.files = F; A.models = n; A.wounds = n; put(A, 20, 24, 0); R.__setCUR(s); return { s, A }; };
T('v843v-bajas-ultima-fila', 'Core p.102 «Removing Casualties From Units»: se retiran de la última fila por uno de sus extremos, dejando a los restantes contiguos', 'Con la última fila incompleta y bajas por la izquierda, los modelos quedan contiguos desplazados (u.rrOff); por la derecha quedan pegados a la izquierda; nunca hay huecos', () => {
  const { A } = mk(13, 5); // 5+5+3
  const base = GEOM.modelLocal(A).slice(10).map((q) => q.l);
  A.models = 2; A.rrOff = 0; const r0 = GEOM.modelLocal(A); ok(r0.length === 2, 'sin desplazamiento: 2 modelos');
  A.models = 12; A.rrOff = 1; const L = GEOM.modelLocal(A).slice(10).map((q) => q.l); ok(Math.abs(L[0] - base[0] - GEOM.dims(A).w / 5) < 1e-9 || L.length === 2, 'último rango desplazado una casilla');
  const bw = A.baseW / 25.4; ok(Math.abs(L[1] - L[0] - bw) < 1e-9, 'contiguos (sin hueco): ' + L.map((x) => x.toFixed(3)));
  A.rrOff = 5; ok(GEOM.modelLocal(A).slice(10).map((q) => q.l)[0] === base[0], 'un desplazamiento imposible se ignora');
});
T('v843v-bajas-popup-extremo', 'Core p.102 («either left to right or from right to left, as the owning player prefers»)', 'Para un humano la elección del extremo es un popup; la fila única retira a partes iguales de ambos extremos (si es impar, el jugador elige el extremo de la sobrante)', () => {
  const { s, A } = mk(13, 5); s.askMode = { 0: true }; let need = null; try { R.applyWounds(A, 2); } catch (e) { need = e.need; }
  ok(need && /Retirar bajas/.test(need.title) && need.opts.length === 2, 'popup de extremo para el jugador humano: ' + JSON.stringify(need && need.title));
  const m = mk(13, 5); m.s.ans = {}; m.s.ans[m.s.turn + ':' + m.s.phase + ':casEnd' + m.A.id + ':1'] = 'L'; m.s.askMode = { 0: true }; R.applyWounds(m.A, 2); eq(m.A.models, 11, '11 modelos'); eq(m.A.rrOff, 2, 'bajas por la izquierda: 2 casillas libres a la izquierda');
  const one = mk(5, 5); const x0 = one.A.x, y0 = one.A.y; one.s.askMode = { 0: true }; one.s.ans = {}; one.s.ans[one.s.turn + ':' + one.s.phase + ':casEnd' + one.A.id + ':1'] = 'L'; R.applyWounds(one.A, 1);
  ok(Math.abs(Math.hypot(one.A.x - x0, one.A.y - y0) - one.A.baseW / 25.4 / 2) < 1e-9, 'fila única, baja impar por la izquierda: el centro se desplaza media peana');
  const ev = mk(5, 5); ev.s.askMode = { 0: true }; R.applyWounds(ev.A, 2); eq(ev.A.models, 3, 'fila única con 2 bajas (par): sin popup, a partes iguales de ambos extremos');
});
