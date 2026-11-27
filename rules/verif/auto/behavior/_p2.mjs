import { R, GEOM, game, put, U } from './lib2.mjs';
const PI = Math.PI;
const segHit = (a, b, c) => { let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y; let area = 0; for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; area += p.x * q.y - q.x * p.y; } const sg = area > 0 ? 1 : -1;
  for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; const nx = -(q.y - p.y) * sg, ny = (q.x - p.x) * sg; const den = nx * dx + ny * dy, num = nx * (a.x - p.x) + ny * (a.y - p.y);
    if (Math.abs(den) < 1e-12) { if (num < 0) return false; continue; } const t = -num / den; if (den > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t); if (t0 >= t1) return false; } return t1 - t0 > 1e-6; };
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
let n = 0, agree = 0, engOnly = 0, bruOnly = 0, vis = 0;
for (let it = 0; it < 300; it++) {
  const sp = [0, 0.5, 1][Math.floor(rnd() * 3)], kM = 3 + Math.floor(rnd() * 6), oM = 1 + Math.floor(rnd() * 5), kx = 1.5 + rnd() * 4, ky = (rnd() - 0.5) * 6, dist = 14 + rnd() * 8, oy = (rnd() - 0.5) * 3;
  const s = game([{ type: 'crossbowmen', models: 10 }, { type: 'emp_archers', models: kM }], [{ type: 'orc_boyz', models: oM }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'] });
  const B = U(s, 'crossbowmen', 0), K = U(s, 'emp_archers', 0), O = U(s, 'orc_boyz', 1); K.files = kM; K.sp = sp; O.models = oM; O.files = oM;
  put(B, 10, 24, 0); put(K, 10 + 0.98 + kx, 24 + ky, 0); put(O, 12 + dist, 24 + oy, PI); R.__setCUR(s);
  const RA = R.unitModelRects(B), RK = R.unitModelRects(K), RO = R.unitModelRects(O); const idx = RA.rects.map((q, i) => i).filter((i) => RA.rects[i].rank === 0);
  const eng = R.losModels(s, B, O, idx);
  idx.forEach((i, k) => { const q = RA.rects[i]; const f = { x: Math.cos(q.face), y: Math.sin(q.face) }, l = { x: -f.y, y: f.x }; let v = false;
    for (let kk = 0; kk <= 6 && !v; kk++) { const a = { x: q.x + f.x * q.bd / 2 + l.x * (kk / 3 - 1) * q.bw / 2, y: q.y + f.y * q.bd / 2 + l.y * (kk / 3 - 1) * q.bw / 2 };
      for (const tq of RO.rects) for (let j = 0; j < 4 * 150 && !v; j++) { const p = tq.c[j % 4], p2 = tq.c[(j % 4 + 1) % 4], u = Math.floor(j / 4) / 150; const b = { x: p.x + (p2.x - p.x) * u, y: p.y + (p2.y - p.y) * u };
        // arco 90° del modelo
        const dx = b.x - q.x, dy = b.y - q.y, ff = dx * f.x + dy * f.y, ll = dx * l.x + dy * l.y; if (!(ff >= q.bd / 2 - 1e-6 && Math.abs(ll) <= q.bw / 2 + (ff - q.bd / 2) + 1e-6)) continue;
        if (!RK.rects.some((r) => segHit(a, b, r.c)) && !RA.rects.some((r, ii) => ii !== i && segHit(a, b, r.c)) && !RO.rects.some((r) => r !== tq && segHit(a, b, r.c))) v = true; } }
    n++; if (v) vis++; if (v === eng[k]) agree++; else if (eng[k]) { engOnly++; console.log('engine-only', { it, sp, kM, oM, kx: +kx.toFixed(2), ky: +ky.toFixed(2), dist: +dist.toFixed(1), oy: +oy.toFixed(2), i }); } else { bruOnly++; console.log('brute-only', { it, sp, kM, oM, kx: +kx.toFixed(2), ky: +ky.toFixed(2), dist: +dist.toFixed(1), oy: +oy.toFixed(2), i }); } });
}
console.log({ n, vis, agree, engOnly, bruOnly });
