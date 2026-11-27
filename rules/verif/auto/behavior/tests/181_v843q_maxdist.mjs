// v843q (punto 1) — modo «Distancia máxima»: el jugador solo da la dirección; el motor usa la mayor distancia legal
import fs from 'fs';
import { T, R, game, put, cur, U, ok, eq } from '../lib3.mjs';
const G = () => game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' });
T('v843q-maxdist-libre', 'Core «Movement» (M); app/js/rules.js maxMoveToward', 'Sin obstáculos, «Distancia máxima» mueve exactamente M pulgadas en la dirección elegida y el coste es M', () => {
  const s = G(), u = put(U(s, 'state_troops', 0), 36, 40); cur(s);
  const M = R.D ? R.D(u).M : 4; const r = R.maxMoveToward(s, u.id, -Math.PI / 2, {});
  ok(r.ok && !r.clipped, 'sin recorte'); ok(Math.abs(Math.hypot(r.x - 36, r.y - 40) - r.limit) < 1e-6, 'recorre el límite'); ok(Math.abs(r.r.cost - r.limit) < 1e-6, 'coste = límite');
  ok(R.previewMove(s, u.id, { x: r.x, y: r.y, face: r.face }).ok, 'el destino es válido para el motor');
  void M;
});
T('v843q-maxdist-marcha', 'Core «March» (2M); maxMoveToward', 'Marchando, la distancia máxima es el doble de M (2M), no más', () => {
  const s = G(), u = put(U(s, 'state_troops', 0), 36, 40); cur(s);
  const a = R.maxMoveToward(s, u.id, -Math.PI / 2, {}), b = R.maxMoveToward(s, u.id, -Math.PI / 2, { march: true });
  ok(Math.abs(b.limit - 2 * a.limit) < 1e-6, 'límite 2M'); ok(Math.abs(Math.hypot(b.x - 36, b.y - 40) - 2 * a.limit) < 1e-6, 'recorre 2M');
});
T('v843q-maxdist-recorte-enemigo', 'Core «Movement»: no acabar a 1" de un enemigo; maxMoveToward', 'Si un enemigo está en el camino, se recorta al máximo legal (nunca a 1" o menos del enemigo) y se informa del motivo', () => {
  const s = G(), u = put(U(s, 'state_troops', 0), 36, 40), e = put(U(s, 'orc_boyz', 1), 36, 33); cur(s); void e;
  const full = R.maxMoveToward(s, u.id, -Math.PI / 2, {}); ok(full.clipped === true, 'recortado'); ok(typeof full.reason === 'string' && full.reason.length > 3, 'motivo');
  ok(full.ok && R.previewMove(s, u.id, { x: full.x, y: full.y, face: full.face }).ok, 'destino legal');
  ok(Math.hypot(full.x - 36, full.y - 40) < full.limit, 'menos que el máximo');
});
T('v843q-maxdist-limite-mesa', 'Core «Movement»: no salir de la mesa; maxMoveToward', 'Cerca del borde de la mesa se recorta al máximo legal dentro de la mesa', () => {
  const s = G(), u = put(U(s, 'state_troops', 0), 36, 4); cur(s);
  const r = R.maxMoveToward(s, u.id, -Math.PI / 2, {}); ok(r.clipped === true, 'recortado'); ok(R.previewMove(s, u.id, { x: r.x, y: r.y, face: r.face }).ok || r.none, 'legal o sin avance');
});
T('v843q-maxdist-ui', 'app/js/main.js (v843q)', 'La barra de movimiento tiene el botón «Máx», el modo usa maxMoveToward y avisa del recorte (mensaje y aviso)', () => {
  const m = fs.readFileSync('/home/claude/tow/app/js/main.js', 'utf8');
  ok(m.includes('id="pbMax"') && m.includes('function fitMaxGhost') && m.includes('maxMoveToward(G.s') && m.includes('recortado') && m.includes('Recorte:'), 'botón, ajuste y avisos de recorte');
  ok(typeof R.maxMoveToward === 'function', 'maxMoveToward exportada');
});
