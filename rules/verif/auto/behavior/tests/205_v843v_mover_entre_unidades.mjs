// v843v (punto 3) — «no me deja mover entre dos unidades»: causa exacta. El único criterio de bloqueo es geométrico (peanas reales que se solapan > 0,01" durante el recorrido: Core p.21 «Moving Through Units»); el «círculo de movimiento» es sólo dibujo y no interviene. Mensaje: nombra a la unidad y la regla, y si hay un hueco entre dos unidades dice cuánto mide el hueco y cuánto la unidad.
import { T, R, GEOM, game, put, U, ok, eq } from '../lib2.mjs';
const PI = Math.PI;
function run(extra, dest = 4, front = 0.5) {
  const s = game([{ type: 'state_troops', models: 20 }, { type: 'crossbowmen', models: 10 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { phase: 'move', active: 0, turn: 2, f: ['empire', 'orcs'] });
  const [M, F1, F2] = s.units.filter((u) => u.owner === 0); const wM = GEOM.dims(M).w, w1 = GEOM.dims(F1).w, w2 = GEOM.dims(F2).w, d1 = GEOM.dims(F1).d, dM = GEOM.dims(M).d, gapW = wM + extra;
  put(F1, 30, 24 - gapW / 2 - w1 / 2, 0); put(F2, 30, 24 + gapW / 2 + w2 / 2, 0); put(M, 30 - d1 / 2 - dM / 2 - front, 24, 0); put(s.units.find((u) => u.owner === 1), 70, 5, PI); R.__setCUR(s);
  return { s, M, F1, F2, wM, r: R.previewMove(s, M.id, { x: M.x + dest, y: M.y, face: 0 }) };
}
T('v843v-mover-hueco-estrecho', 'Core p.21 «Moving Through Units»: «no unit can move through another unit»', 'Pasar entre dos unidades por un hueco MÁS ESTRECHO que la unidad se rechaza; el mensaje nombra a la unidad, cita Core p.21 y dice cuánto mide el hueco y cuánto la unidad', () => {
  for (const extra of [-0.5, -0.1]) { const { r, F1, F2, M } = run(extra); ok(!r.ok, 'hueco ' + extra + ': debería rechazar'); ok(/no puede atravesar a «/.test(r.reason) && /Core p\.21/.test(r.reason), r.reason); ok(/El hueco entre .* mide \d+\.\d" y .* mide \d+\.\d" de frente: no cabe/.test(r.reason), 'hueco explicado: ' + r.reason); ok([F1.id, F2.id].includes(r.blocker), 'señala la unidad que bloquea'); }
});
T('v843v-mover-hueco-justo', 'Core p.21 + tolerancia de contacto (0,01")', 'Con el hueco igual o mayor que el frente (incluso de 0,00" a 0,02" de holgura) la unidad PASA: el «círculo» o la cercanía de otra peana no bloquean', () => {
  for (const extra of [0.5, 0.02, 0.0]) { const { r } = run(extra); ok(r.ok, 'hueco ' + extra + ': ' + r.reason); }
  const { s, M, F1 } = run(0.5); put(M, M.x, M.y + 0.2, 0); R.__setCUR(s); ok(R.previewMove(s, M.id, { x: M.x + 4, y: M.y, face: 0 }).ok, 'rozando una peana amiga por el lado (a 0,0"–0,3") también pasa'); void F1;
});
T('v843v-mover-esquina-trasera', 'FAQ Core p.21: «el borde delantero no puede atravesar otra unidad al maniobrar, pero una esquina trasera sí al girar de ala»', 'Al girar de ala, una esquina trasera que barre otra unidad NO bloquea; el borde delantero sí (barrido cada 0,1", antes cada 0,75")', () => {
  const s = game([{ type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move', active: 0, turn: 2 });
  const a = put(U(s, 'state_troops'), 36, 40, -PI / 2), b = U(s, 'emp_archers'); a.files = 5; b.files = 5; put(U(s, 'orc_boyz'), 70, 4, 0); R.__setCUR(s);
  const P = GEOM.corners(a)[1], rot = (t) => { const cx = a.x - P.x, cy = a.y - P.y, c = Math.cos(t), sn = Math.sin(t); return { x: P.x + c * cx - sn * cy, y: P.y + sn * cx + c * cy, face: a.face + t }; }, th = 0.8, dest = rot(th);
  let tot = 0, rear = 0, front = 0, bad = [];
  for (let x = 26; x <= 48; x += 0.5) for (let y = 30; y <= 50; y += 0.5) {
    put(b, x, y, a.face); const pb = GEOM.corners(b); R.__setCUR(s); if (GEOM.polysOverlap(GEOM.corners(a), pb, 0.01) || GEOM.polysOverlap(GEOM.corners({ ...a, ...dest }), pb, 0.01)) continue;
    let fr = false, rr = false; for (let t = 0.01; t < th; t += 0.01) { const q = { ...a, ...rot(t) }, fp = GEOM.corners(q); if (!GEOM.polysOverlap(fp, pb, 0.01)) continue; const fx = Math.cos(q.face) * 0.1, fy = Math.sin(q.face) * 0.1, edge = [fp[0], fp[1], { x: fp[1].x - fx, y: fp[1].y - fy }, { x: fp[0].x - fx, y: fp[0].y - fy }]; if (GEOM.polysOverlap(edge, pb, 0.01)) fr = true; else rr = true; }
    const r = R.previewMove(s, a.id, dest); if (!r.ok && !/Camino bloqueado|Solapa/.test(r.reason || '')) continue; tot++; if (fr) front++; else if (rr) rear++;
    if (r.ok === fr) bad.push({ x, y, fr, rr, why: r.reason }); }
  ok(tot > 100 && front > 0 && rear > 0, `montajes ${tot} (borde delantero ${front}, sólo esquina trasera ${rear})`); ok(!bad.length, 'veredictos distintos al barrido fino: ' + JSON.stringify(bad.slice(0, 3)));
});
T('v843v-mover-a-1-del-enemigo', 'Core p.123 («no unit can end its movement within 1" of an enemy unit», salvo cargar)', 'Acabar a menos de 1" de un enemigo se rechaza nombrando al enemigo y la regla; pasar a 0" de él durante el recorrido (sin acabar ahí) no se mide', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { phase: 'move', active: 0, turn: 2, f: ['empire', 'orcs'] }); const a = put(U(s, 'state_troops'), 20, 24, 0), o = put(U(s, 'orc_boyz'), 20 + GEOM.dims(a).d / 2 + GEOM.dims(U(s, 'orc_boyz')).d / 2 + 3.5, 24, PI); R.__setCUR(s);
  const r = R.previewMove(s, a.id, { x: 23, y: 24, face: 0 }); ok(!r.ok && /a menos de 1" de «Orcos» \(unidad enemiga\)/.test(r.reason) && /Core p\.123/.test(r.reason), r.reason); eq(r.blocker, o.id, 'señala al enemigo');
});
