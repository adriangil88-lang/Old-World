// v843u (punto 3 y 4) — línea de visión exacta POR MODELO (Core p.103 y p.136-137, FAQ): sólo disparan los modelos que ven; los huecos entre peanas de los Escaramuzadores se respetan; arco de 90° por modelo, 360° para escaramuzadores
import { T, R, GEOM, game, put, U, ok, eq } from '../lib2.mjs';
const PI = Math.PI;
const mk = (kM, sp, extra = {}) => {
  const s = game([{ type: 'crossbowmen', models: 10 }, { type: 'emp_archers', models: kM }], [{ type: 'orc_boyz', models: 1 }, { type: 'orc_boyz', models: kM }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'], ...extra });
  const B = U(s, 'crossbowmen', 0), K = U(s, 'emp_archers', 0), [O, E2] = s.units.filter((u) => u.owner === 1); K.files = kM; K.sp = sp; O.models = 1; O.files = 1;
  put(B, 10, 24, 0); put(K, 10 + GEOM.dims(B).d / 2 + 2 + GEOM.dims(K).d / 2, 24, 0); put(O, 30, 24, PI); put(E2, 80, 5, PI); R.__setCUR(s); return { s, B, K, O, E2 };
};
const tag = (s, u) => R.unitTag(s, u);
// oráculo independiente: rayos desde los 7 puntos del borde delantero de cada modelo hasta puntos densos del objetivo; segmento contra rectángulos reales
const segHit = (a, b, c) => { let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y; let area = 0; for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; area += p.x * q.y - q.x * p.y; } const sg = area > 0 ? 1 : -1;
  for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; const nx = -(q.y - p.y) * sg, ny = (q.x - p.x) * sg; const den = nx * dx + ny * dy, num = nx * (a.x - p.x) + ny * (a.y - p.y);
    if (Math.abs(den) < 1e-12) { if (num < 0) return false; continue; } const t = -num / den; if (den > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t); if (t0 >= t1) return false; } return t1 - t0 > 1e-6; };
function oracle(RA, RK, RO, i) {
  const q = RA.rects[i], f = { x: Math.cos(q.face), y: Math.sin(q.face) }, l = { x: -f.y, y: f.x };
  for (let kk = 0; kk <= 6; kk++) { const a = { x: q.x + f.x * q.bd / 2 + l.x * (kk / 3 - 1) * q.bw / 2, y: q.y + f.y * q.bd / 2 + l.y * (kk / 3 - 1) * q.bw / 2 };
    for (const tq of RO.rects) for (let j = 0; j < 4 * 100; j++) { const p = tq.c[j % 4], p2 = tq.c[(j % 4 + 1) % 4], u = Math.floor(j / 4) / 100, b = { x: p.x + (p2.x - p.x) * u, y: p.y + (p2.y - p.y) * u };
      const dx = b.x - q.x, dy = b.y - q.y, ff = dx * f.x + dy * f.y, ll = dx * l.x + dy * l.y; if (!(ff >= q.bd / 2 - 1e-6 && Math.abs(ll) <= q.bw / 2 + (ff - q.bd / 2) + 1e-6)) continue;
      if (!RK.rects.some((r) => segHit(a, b, r.c)) && !RA.rects.some((r, ii) => ii !== i && segHit(a, b, r.c)) && !RO.rects.some((r) => r !== tq && segHit(a, b, r.c))) return true; } }
  return false;
}
T('v843u-vision-oraculo', 'Core p.103 («a straight, uninterrupted line … from within the model\'s vision arc to any part of the other model»)', 'Contra un oráculo independiente (rayos reales contra las peanas), la visibilidad de cada modelo de la 1.ª fila coincide en 300 montajes con Escaramuzadores de huecos 0 / ½" / 1" delante', () => {
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; let n = 0, vis = 0, bad = [];
  for (let it = 0; it < 120; it++) {
    const sp = [0, 0.5, 1][Math.floor(rnd() * 3)], kM = 3 + Math.floor(rnd() * 6), oM = 1 + Math.floor(rnd() * 5), kx = 1.5 + rnd() * 4, ky = (rnd() - 0.5) * 6, dist = 14 + rnd() * 8, oy = (rnd() - 0.5) * 3;
    const { s, B, K, O } = mk(kM, sp); K.models = kM; K.files = kM; O.models = oM; O.files = oM; put(K, 10 + 0.98 + kx, 24 + ky, 0); put(O, 12 + dist, 24 + oy, PI); R.__setCUR(s);
    const RA = R.unitModelRects(B), RK = R.unitModelRects(K), RO = R.unitModelRects(O), idx = RA.rects.map((q, i) => i).filter((i) => RA.rects[i].rank === 0), eng = R.losModels(s, B, O, idx);
    idx.forEach((i, k) => { const v = oracle(RA, RK, RO, i); n++; if (v) vis++; if (v !== eng[k]) bad.push({ it, sp, kM, oM, i, eng: eng[k], oraculo: v }); });
  }
  ok(n >= 500 && vis > 100 && vis < n - 100, `montajes variados (${vis}/${n} ven)`); ok(!bad.length, 'discrepancias: ' + JSON.stringify(bad.slice(0, 3)));
});
T('v843u-vision-huecos-escaramuzadores', 'Core p.103 + p.184-186 (Skirmishers) — los huecos entre peanas dejan pasar la vista', 'Una línea de Escaramuzadores pegados (hueco 0) tapa al objetivo estrecho; con hueco de 1" los modelos de la 1.ª fila ven entre las peanas y el objetivo es legal (antes: toda la unidad contaba como un rectángulo)', () => {
  const w = mk(10, 0); ok(/^Sin línea de visión: .*\(unidad amiga\) tapa la vista \(Core p\.103/.test(w.s && R.shootCheck(w.s, w.B, w.O) || ''), 'pegados: bloquea → ' + R.shootCheck(w.s, w.B, w.O));
  eq(R.losBlocker(w.s, w.B, w.O)?.id, w.K.id, 'señala a la unidad que tapa'); eq(R.frontShooters(w.s, w.B, w.O, 24), null, 'ningún modelo ve');
  const g = mk(10, 1); eq(R.shootCheck(g.s, g.B, g.O), null, 'con hueco de 1" se ve entre las peanas'); eq(R.frontShooters(g.s, g.B, g.O, 24), 5, 'ven los 5 modelos de la 1.ª fila');
  const wide = mk(10, 1); wide.K.sp = 0; R.__setCUR(wide.s); ok(R.shootCheck(wide.s, wide.B, wide.O), 'volver a pegarlos vuelve a taparlo (memoria de visibilidad invalidada)');
});
T('v843u-vision-solo-primera-fila', 'Core p.136-137 («We Can\'t All Shoot!»: sólo la primera fila) + p.103', 'Sólo los modelos de la 1.ª fila pueden ser tiradores (la 2.ª fila nunca cuenta aunque vea al objetivo); el nº de tiradores = modelos de la 1.ª fila con visión', () => {
  const g = mk(10, 1); const m = R.shooterMask(g.s, g.B, g.O, 24); eq(m.idx.length, 5, '5 modelos en la 1.ª fila de 10'); ok(m.idx.every((i) => R.unitModelRects(g.B).rects[i].rank === 0), 'todos de la 1.ª fila');
  const f = mk(2, 0); f.K.models = 2; f.K.files = 2; put(f.K, 13.5, 24, 0); R.__setCUR(f.s); const c = R.frontShooters(f.s, f.B, f.O, 24); ok(c === null || c < 5, 'una unidad delante tapa a los modelos centrales; salen menos de 5: ' + c);
});
T('v843u-vision-blanco-parcial', 'Core p.103 («at least one model in a unit has a line of sight to at least one model»)', 'Si una peana amiga tapa sólo parte de un objetivo ancho, éste sigue siendo legal; si lo tapa entero, no', () => {
  const a = mk(4, 0); a.O.models = 5; a.O.files = 5; R.__setCUR(a.s); eq(R.shootCheck(a.s, a.B, a.O), null, 'objetivo de 5 peanas tapado sólo en el centro: visible');
  const b = mk(10, 0); ok(/tapa la vista/.test(R.shootCheck(b.s, b.B, b.O)), 'objetivo estrecho totalmente tapado');
});
T('v843u-vision-enemigo-adyacente', 'Core p.103 («models and units always block line of sight»)', 'Una unidad ENEMIGA delante (a 0,3") también tapa; el aviso dice «unidad enemiga» y la unidad tapadora sí es objetivo legal', () => {
  const s = game([{ type: 'crossbowmen', models: 10 }], [{ type: 'orc_boyz', models: 1 }, { type: 'orc_boyz', models: 10 }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'] });
  const B = U(s, 'crossbowmen', 0), [O, E2] = s.units.filter((u) => u.owner === 1); O.models = 1; O.files = 1; E2.files = 10; put(B, 10, 24, 0); put(E2, 11.3 + GEOM.dims(E2).d / 2, 24, PI); put(O, 30, 24, PI); R.__setCUR(s);
  ok(/Sin línea de visión: .*\(unidad enemiga\) tapa la vista/.test(R.shootCheck(s, B, O)), R.shootCheck(s, B, O)); eq(R.shootCheck(s, B, E2), null, 'la unidad que tapa es visible'); eq(R.losBlocker(s, B, O)?.id, E2.id);
});
T('v843u-vision-escaramuzador-360', 'Core p.103 + p.184 (Skirmishers: visión de 360°) y arco de 90° por modelo del resto', 'Los Escaramuzadores ven en todas direcciones; la unidad que no lo es sólo ve por su arco frontal; una unidad amiga en medio tapa también a los escaramuzadores', () => {
  const { s, B, K, O } = mk(5, 1); put(K, 30, 24, 0); put(O, 12, 30, 0); put(B, 20, 20, 0); R.__setCUR(s);
  eq(R.shootCheck(s, K, O), null, 'el escaramuzador ve al objetivo que tiene a su espalda'); ok(/Fuera del arco frontal/.test(R.shootCheck(s, B, O) || ''), 'la unidad normal no ve hacia atrás');
  put(B, 21, 27.1, 0); R.__setCUR(s); ok(/\(unidad amiga\) tapa la vista/.test(R.shootCheck(s, K, O) || ''), 'una unidad amiga justo en medio tapa: ' + R.shootCheck(s, K, O));
});
T('v843u-vision-cache-moves', 'rules.js memoria de visibilidad (LMEMO)', 'Mover o quitar una unidad invalida la memoria: el mismo disparo cambia de ilegal a legal sin resto de la caché', () => {
  const { s, B, K, O } = mk(10, 0); ok(R.shootCheck(s, B, O), 'tapado'); K.y += 30; R.__setCUR(s); eq(R.shootCheck(s, B, O), null, 'la unidad tapadora se aparta: visible'); K.y -= 30; R.__setCUR(s); ok(R.shootCheck(s, B, O), 'vuelve: tapado otra vez'); K.models = 0; R.__setCUR(s); eq(R.shootCheck(s, B, O), null, 'destruida: ya no tapa');
});
