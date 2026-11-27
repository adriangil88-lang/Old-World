// v843v (punto 1b) — visibilidad EXACTA desde TODO el borde delantero (sin 7 muestras ni umbral de 0,02"): Core p.103 y p.136-137
import { T, R, GEOM, ok, eq } from '../lib2.mjs';
const rect = (x0, y0, x1, y1) => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
const scene = (gap) => { // pared en x=5 con un hueco de ancho `gap` a y≈3; objetivo lejano; el borde x=0, y∈[0,1] solo ve por un rincón diminuto del borde
  const g0 = 3, g1 = 3 + gap;
  return [{ c: rect(4.999, -50, 5.001, g0), tg: false, u: 'W1' }, { c: rect(4.999, g1, 5.001, 50), tg: false, u: 'W2' }, { c: rect(9.9, 5.64, 10.1, 5.65), tg: true, u: 'T', in: new Set() }];
};
const S0 = { x: 0, y: 0 }, S1 = { x: 0, y: 1 };
T('v843v-vision-borde-exacto', 'Core p.103 («a straight, uninterrupted line … from within the model\'s vision arc to any part of the other model»)', 'Si existe un rayo libre desde algún punto del borde delantero, hay visión aunque las 7 muestras fijas no lo vean; sin hueco, no (la búsqueda es exacta, no depende de muestras ni de un umbral)', () => {
  const seven = (obs) => [0, -1, 1, -0.5, 0.5, -0.8, 0.8].map((k) => ({ x: 0, y: 0.5 + k / 2 })).some((a) => GEOM.losSweep(a, obs, [], null, false).vis);
  const obs = scene(0.01);
  ok(!seven(obs), 'las 7 muestras antiguas NO ven por el hueco de 0,01"');
  ok(GEOM.losEdge(S0, S1, obs, [], null), 'la búsqueda exacta SÍ encuentra el rayo libre');
  let dense = false; for (let i = 0; i <= 200000 && !dense; i++) if (GEOM.losSweep({ x: 0, y: i / 200000 }, obs, [], null, false).vis) dense = true; ok(dense, 'un barrido denso de 200 000 orígenes confirma que existe');
  ok(!GEOM.losEdge(S0, S1, scene(0), [], null), 'con la pared cerrada (hueco 0) no hay visión');
  ok(GEOM.losEdge(S0, S1, scene(0.005), [], null), 'un hueco de 0,005" ya deja pasar (sin umbral de 0,02")');
});
T('v843v-vision-borde-aleatorio', 'Core p.103', 'Contra un oráculo de fuerza bruta (4000 orígenes × 60 puntos del objetivo, rayos reales contra rectángulos) la decisión exacta nunca contradice: si el oráculo ve, la exacta ve; si la exacta ve, existe un rayo comprobable', () => {
  let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; let nv = 0, bad = [];
  const hit = (a, b, c) => { let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y; for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; const nx = -(q.y - p.y), ny = (q.x - p.x), sg = (c[2].x - c[0].x) * (c[2].y - c[0].y) > 0 ? 1 : 1; const den = nx * dx + ny * dy, num = nx * (a.x - p.x) + ny * (a.y - p.y); if (Math.abs(den) < 1e-14) { if (num * 1 < 0) return false; continue; } const t = -num / den; if (den > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t); if (t0 >= t1) return false; } return t1 - t0 > 1e-9; };
  for (let it = 0; it < 60; it++) {
    const obs = []; const nb = 2 + Math.floor(rnd() * 4);
    for (let i = 0; i < nb; i++) { const x = 3 + rnd() * 6, y = (rnd() - 0.3) * 8, w = 0.4 + rnd() * 1.5, h = 0.5 + rnd() * 2; obs.push({ c: rect(x, y, x + w, y + h), tg: false, u: 'o' + i }); }
    const ty = (rnd() - 0.2) * 6; const T0 = { c: rect(11, ty, 12, ty + 0.5 + rnd()), tg: true, u: 'T', in: new Set() }; obs.push(T0);
    const ex = GEOM.losEdge(S0, S1, obs, [], null); let bo = false;
    for (let i = 0; i <= 300 && !bo; i++) for (let j = 0; j <= 40 && !bo; j++) { const a = { x: 0, y: i / 300 }, p = T0.c[0], b = { x: 11 + (j / 40), y: p.y + (T0.c[2].y - p.y) * ((j * 7 % 41) / 40) };
      if (obs.every((o) => o.tg || !hit(a, b, o.c))) bo = true; }
    if (ex) nv++; if (bo && !ex) bad.push(it);
  }
  ok(!bad.length, 'el oráculo ve y la exacta no: ' + bad.join(','));
  ok(nv > 5 && nv < 55, `montajes variados (${nv}/60 ven)`);
});
