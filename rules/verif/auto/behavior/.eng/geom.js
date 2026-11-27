// Geometría 2D para bloques de unidad (rectángulos orientados). Unidades: pulgadas.
export let TAU = Math.PI * 2;
export let normAng = (a) => { a %= TAU; if (a > Math.PI) a -= TAU; if (a <= -Math.PI) a += TAU; return a; };
export let angDiff = (a, b) => normAng(a - b);

// Dimensiones del bloque de una unidad
export let lanceK = (n) => { let k = 1; while (k * (k + 1) / 2 < n) k++; return k; }; // nº de rangos de una Lanza de n modelos
// Modelos por rango de una Lanza de n modelos (FoF p.110): 1, 2, 3… y el último rango con los que quedan
export let lanceRanks = (n) => { const k = lanceK(n), out = []; for (let j = 1; j < k; j++) out.push(j); out.push(n - (k - 1) * k / 2); return out; };
export function dims(u) {
  if (u.gW) return { w: u.gW, d: u.gD, ranks: 1, files: Math.min(u.files, u.models) }; // guarnición de edificio (Core p.273)
  if (u.lance && u.models >= 3) { // Formación en Lanza (FoF p.110): rangos de 1, 2, 3… modelos; el bloque abarca el rango más ancho
    const k = lanceK(u.models), wide = Math.max(k - 1, u.models - (k - 1) * k / 2);
    return { w: wide * u.baseW / 25.4, d: k * u.baseD / 25.4, ranks: k, files: wide, lance: true };
  }
  const files = u.files;
  const ranks = Math.max(1, Math.ceil(u.models / files));
  const perRank = Math.min(files, u.models);
  // Escaramuzadores (Core p.184): los modelos no están en contacto de peana; cada uno a ≤1" de otro (≤3" con Formación Extendida). u.sp = separación entre modelos contiguos.
  const sp = u.sp > 0 ? u.sp : 0;
  const w = Math.max(perRank, 1) * u.baseW / 25.4 + (perRank > 1 ? (perRank - 1) * sp : 0);
  const d = ranks * u.baseD / 25.4 + (ranks > 1 ? (ranks - 1) * sp : 0);
  return { w, d, ranks, files: perRank, sp };
}

export function corners(u) {
  const { w, d, lance } = dims(u);
  const c = Math.cos(u.face), s = Math.sin(u.face);
  // eje "adelante" = (c,s); eje "lateral" = (-s,c)
  if (lance) { // FoF p.110 (Fig. 110.1): la Lanza es un triángulo escalonado (1, 2, 3… modelos por rango): su huella es el casco convexo de los rangos, no el bloque que abarca el rango más ancho
    const bw = u.baseW / 25.4, bd = u.baseD / 25.4, k = dims(u).ranks, rk = lanceRanks(u.models), loc = [];
    for (let j = 1; j <= k; j++) { const hw = rk[j - 1] * bw / 2, f0 = d / 2 - (j - 1) * bd, f1 = f0 - bd; loc.push([f0, -hw], [f0, hw], [f1, -hw], [f1, hw]); }
    const P = loc.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), H = [];
    for (const q of P) { while (H.length >= 2 && cr(H[H.length - 2], H[H.length - 1], q) <= 1e-9) H.pop(); H.push(q); }
    const nL = H.length; for (let i = P.length - 2; i >= 0; i--) { const q = P[i]; while (H.length > nL && cr(H[H.length - 2], H[H.length - 1], q) <= 1e-9) H.pop(); H.push(q); }
    H.pop(); // sentido horario en el marco local; se devuelve desde la esquina delantera izquierda
    const out = H.map(([f, l]) => ({ x: u.x + c * f + -s * l, y: u.y + s * f + c * l })); return out;
  }
  const pts = [];
  for (const [fx, lx] of [[1, -1], [1, 1], [-1, 1], [-1, -1]]) {
    pts.push({
      x: u.x + c * fx * d / 2 + -s * lx * w / 2,
      y: u.y + s * fx * d / 2 + c * lx * w / 2,
    });
  }
  return pts; // frente-izq, frente-der, atrás-der, atrás-izq
}

function axes(pts) {
  const out = [], n = pts.length === 4 ? 2 : pts.length; // rectángulo: dos ejes; polígono convexo (Lanza): todas las aristas
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ex = b.x - a.x, ey = b.y - a.y, l = Math.hypot(ex, ey) || 1;
    out.push({ x: -ey / l, y: ex / l });
  }
  return out;
}
function project(pts, ax) {
  let mn = Infinity, mx = -Infinity;
  for (const p of pts) { const v = p.x * ax.x + p.y * ax.y; if (v < mn) mn = v; if (v > mx) mx = v; }
  return [mn, mx];
}
export function polysOverlap(A, B, eps = 0) {
  for (const ax of [...axes(A), ...axes(B)]) {
    const [a0, a1] = project(A, ax), [b0, b1] = project(B, ax);
    if (a1 <= b0 + eps || b1 <= a0 + eps) return false;
  }
  return true;
}
function segDist(p, q, r, s) {
  // distancia mínima entre segmentos pq y rs
  const d = (a, b, c) => {
    const vx = c.x - b.x, vy = c.y - b.y, l2 = vx * vx + vy * vy;
    let t = l2 ? ((a.x - b.x) * vx + (a.y - b.y) * vy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(a.x - (b.x + vx * t), a.y - (b.y + vy * t));
  };
  // intersección
  const o = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (o(p, q, r) * o(p, q, s) < 0 && o(r, s, p) * o(r, s, q) < 0) return 0;
  return Math.min(d(p, r, s), d(q, r, s), d(r, p, q), d(s, p, q));
}
export function polyDist(A, B) {
  if (polysOverlap(A, B, 1e-6)) return 0;
  let m = Infinity;
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) {
    m = Math.min(m, segDist(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length]));
  }
  return m;
}
export let unitDist = (a, b) => polyDist(corners(a), corners(b));

// Terreno rectangular con giro opcional t.rot (radianes, sobre su centro): el eje local x es el lado w
let rotP = (t, p) => { const c = Math.cos(t.rot), s = Math.sin(t.rot), dx = p.x - t.x, dy = p.y - t.y; return { x: t.x + dx * c + dy * s, y: t.y - dx * s + dy * c }; }; // al marco local (giro -rot)
export function terrainPoly(t) {
  const hw = t.w / 2, hh = t.h / 2;
  if (!t.rot) return [{ x: t.x - hw, y: t.y - hh }, { x: t.x + hw, y: t.y - hh }, { x: t.x + hw, y: t.y + hh }, { x: t.x - hw, y: t.y + hh }];
  const c = Math.cos(t.rot), s = Math.sin(t.rot);
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([lx, ly]) => ({ x: t.x + lx * c - ly * s, y: t.y + lx * s + ly * c }));
}
export function inRect(p, t) { if (t.rot) p = rotP(t, p); return Math.abs(p.x - t.x) <= t.w / 2 && Math.abs(p.y - t.y) <= t.h / 2; }
// Distancia de un punto a un rectángulo de terreno (0 si está dentro)
export function pointRectDist(p, t) { if (t.rot) p = rotP(t, p); return Math.hypot(Math.max(0, Math.abs(p.x - t.x) - t.w / 2), Math.max(0, Math.abs(p.y - t.y) - t.h / 2)); }
// Distancia entre dos rectángulos de terreno (cualquiera puede ir girado)
export function rectRectDist(a, b) {
  if (!a.rot && !b.rot) { const dx = Math.max(0, Math.abs(a.x - b.x) - (a.w + b.w) / 2), dy = Math.max(0, Math.abs(a.y - b.y) - (a.h + b.h) / 2); return Math.hypot(dx, dy); }
  return polyDist(terrainPoly(a), terrainPoly(b));
}

export function inTable(u, W = 72, H = 48) {
  return corners(u).every((p) => p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H);
}

// Esquinas de las que parten los arcos (Core p.100: «extend out from the corners of its base at 45° angles»). Bloque normal: las cuatro esquinas del bloque.
// Lanza (FoF p.110, «Lance Facings»: «The front, flank and rear arcs of a unit in Lance formation are determined by the models in the second rank and the last rank»):
// el arco frontal parte de las esquinas delanteras exteriores de los dos modelos del segundo rango y el trasero de las esquinas traseras exteriores del último rango.
// Devuelve las coordenadas locales (adelante f, lateral |l|) de ambas parejas de esquinas.
export function arcFrame(u) {
  const dm = dims(u);
  if (dm.lance && dm.ranks >= 2) {
    const bw = u.baseW / 25.4, bd = u.baseD / 25.4, rk = lanceRanks(u.models);
    return { fF: dm.d / 2 - bd, hF: rk[1] * bw / 2, fR: -dm.d / 2, hR: rk[rk.length - 1] * bw / 2 };
  }
  return { fF: dm.d / 2, hF: dm.w / 2, fR: -dm.d / 2, hR: dm.w / 2 };
}
// Lado por el que se contacta con "target" desde el punto "from": 'front' | 'flank' | 'rear'
export function sideOf(target, from) {
  { // Core p.100: los arcos parten de las esquinas de la peana a 45° (en una Lanza, de las del segundo rango y del último: FoF p.110)
    const dm = dims(target), A = arcFrame(target), dx = from.x - target.x, dy = from.y - target.y, c = Math.cos(target.face), sn = Math.sin(target.face), f = dx * c + dy * sn, lat = Math.abs(-dx * sn + dy * c);
    const inBlock = !dm.lance && Math.abs(f) <= dm.d / 2 && lat <= dm.w / 2; // la Lanza no es un bloque: sus arcos salen siempre de las esquinas del segundo y último rango
    if (!inBlock) {
      if (f >= A.fF && f - A.fF >= lat - A.hF) return 'front';
      if (f <= A.fR && A.fR - f >= lat - A.hR) return 'rear';
      return 'flank';
    }
  }
  const a = Math.abs(angDiff(Math.atan2(from.y - target.y, from.x - target.x), target.face));
  if (a <= Math.PI / 4) return 'front';
  if (a >= 3 * Math.PI / 4) return 'rear';
  return 'flank';
}
// Posiciones locales (adelante f, lateral l) de los modelos en el orden de fila delantera → trasera, de izquierda a derecha (Lanza: 1, 2, 3… por rango)
export function modelLocal(u) {
  const dm = dims(u), bw = u.baseW / 25.4, bd = u.baseD / 25.4, out = [];
  if (dm.lance) { const rk = lanceRanks(u.models); rk.forEach((n, j) => { for (let i = 0; i < n; i++) out.push({ f: dm.d / 2 - (j + 0.5) * bd, l: (i - (n - 1) / 2) * bw }); }); return out.slice(0, u.models); }
  const sp = dm.sp || 0;
  // Core p.102: las bajas se retiran de la última fila por uno de sus extremos; u.rrOff = huecos libres a la izquierda de la última fila incompleta (los modelos restantes quedan contiguos)
  const lastRk = Math.ceil(u.models / dm.files) - 1, cL = u.models - lastRk * dm.files, rO = u.rrOff > 0 && cL < dm.files && u.rrOff + cL <= dm.files && lastRk > 0 ? u.rrOff : 0;
  for (let i = 0; i < u.models; i++) { const rk = Math.floor(i / dm.files), fi = (i % dm.files) + (rk === lastRk ? rO : 0); out.push({ f: dm.d / 2 - (rk + 0.5) * bd - rk * sp, l: -dm.w / 2 + (fi + 0.5) * bw + fi * sp }); }
  return out;
}

// Segmento intersecta rectángulo de terreno (LOS)
export function segHitsRect(a, b, t) {
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const p = { x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n };
    if (inRect(p, t)) return true;
  }
  return false;
}

// ---------- Maniobra «Girar de ala» (Core p.124 y FAQ): el borde delantero avanza pivotando sobre una de sus esquinas delanteras;
// cada modelo cuenta como si hubiera movido lo que el modelo exterior (el giro de ala cuesta ancho × ángulo) y se puede alternar avanzar y girar.
// Se modela con el centro del borde delantero F: un giro sobre una esquina describe un arco de radio w/2 (coste w·ángulo), y avanzar cuesta su longitud.
let m2p = (a) => { a %= TAU; return a < 0 ? a + TAU : a; };
function wpSim(a, segs, r) { // integra una lista de tramos [tipo, valor]: 'S' longitud (en r), 'L'/'R' ángulo
  let x = a.x, y = a.y, f = a.f;
  for (const [k, v] of segs) {
    if (k === 'S') { x += v * r * Math.cos(f); y += v * r * Math.sin(f); }
    else if (k === 'L') { const cx = x - r * Math.sin(f), cy = y + r * Math.cos(f); f += v; x = cx + r * Math.sin(f); y = cy - r * Math.cos(f); }
    else { const cx = x + r * Math.sin(f), cy = y - r * Math.cos(f); f -= v; x = cx - r * Math.sin(f); y = cy + r * Math.cos(f); }
  }
  return { x, y, f };
}
// Mejor secuencia avanzar/girar de ala entre dos poses del centro del borde delantero {x,y,f}. Devuelve { cost, segs, r } o null.
export function wheelPath(a, b, w) {
  const r = w / 2, EP = 1e-6;
  const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), dF = Math.abs(angDiff(b.f, a.f));
  if (dist < 1e-4 && dF < 1e-4) return { cost: 0, segs: [], r };
  if (dF < 1e-4 && dist > 1e-4 && Math.abs(angDiff(Math.atan2(dy, dx), a.f)) < 1e-4) return { cost: dist, segs: [['S', dist / r]], r };
  const cen = (p, s) => (s === 'L' ? { x: p.x - r * Math.sin(p.f), y: p.y + r * Math.cos(p.f) } : { x: p.x + r * Math.sin(p.f), y: p.y - r * Math.cos(p.f) });
  const W = (segs) => segs.reduce((t, [k, v]) => t + (k === 'S' ? v * r : v * w), 0);
  let best = null;
  const ok = (segs) => {
    if (segs.some(([, v]) => !(v >= -EP) || !isFinite(v))) return;
    const e = wpSim(a, segs, r); if (Math.hypot(e.x - b.x, e.y - b.y) > 1e-3 * Math.max(1, r) || Math.abs(angDiff(e.f, b.f)) > 1e-4) return;
    const c = W(segs); if (!best || c < best.cost) best = { cost: c, segs, r };
  };
  for (const s of ['L', 'R']) for (const e of ['L', 'R']) { // CSC
    const c0 = cen(a, s), c1 = cen(b, e), vx = c1.x - c0.x, vy = c1.y - c0.y, D = Math.hypot(vx, vy), ang = D < 1e-6 ? a.f : Math.atan2(vy, vx); // v835: giro de ala puro (mismo centro, D = 0): la dirección del tramo recto es el rumbo inicial; antes atan2(0,0)=0 hacía dar una vuelta completa de más para giros de ~8°-26° (coste ~30")
    const arc = (k, from, to) => (k === 'L' ? m2p(to - from) : m2p(from - to));
    if (s === e) { const t1 = arc(s, a.f, ang), t2 = arc(e, ang, b.f); ok([[s, t1], ['S', D / r], [e, t2]]); }
    else if (D >= 2 * r - 1e-9) {
      const al = Math.asin(Math.min(1, 2 * r / Math.max(D, 1e-9))), sl = Math.sqrt(Math.max(0, D * D - 4 * r * r)) / r;
      for (const sg of [1, -1]) { const dir = ang + sg * al; ok([[s, arc(s, a.f, dir)], ['S', sl], [e, arc(e, dir, b.f)]]); }
    }
  }
  for (const s of ['L', 'R']) { // CCC (LRL / RLR)
    const m = s === 'L' ? 'R' : 'L', c0 = cen(a, s), c2 = cen(b, s), vx = c2.x - c0.x, vy = c2.y - c0.y, D = Math.hypot(vx, vy);
    if (D > 4 * r + 1e-9 || D < 1e-9) continue;
    const ang = Math.atan2(vy, vx), h = Math.acos(Math.min(1, D / (4 * r)));
    for (const sg of [1, -1]) {
      const da = ang + sg * h, cm = { x: c0.x + 2 * r * Math.cos(da), y: c0.y + 2 * r * Math.sin(da) };
      const h1 = Math.atan2(cm.y - c0.y, cm.x - c0.x) + (s === 'L' ? Math.PI / 2 : -Math.PI / 2), h2 = Math.atan2(c2.y - cm.y, c2.x - cm.x) + (m === 'L' ? Math.PI / 2 : -Math.PI / 2) + 0;
      const a1 = s === 'L' ? m2p(h1 - a.f) : m2p(a.f - h1), a2 = m === 'L' ? m2p(h2 - h1) : m2p(h1 - h2), a3 = s === 'L' ? m2p(b.f - h2) : m2p(h2 - b.f);
      ok([[s, a1], [m, a2], [s, a3]]);
    }
  }
  return best;
}
// Poses del centro del borde delantero a lo largo de un camino (cada `step` pulgadas aprox., incluidos extremos)
export function wheelPoses(a, path, step = 0.75) {
  const out = [{ ...a }]; let cur = { ...a }; const r = path.r;
  for (const [k, v] of path.segs) {
    const len = k === 'S' ? v * r : v * r, n = Math.max(1, Math.ceil(len / step));
    for (let i = 1; i <= n; i++) out.push(wpSim(cur, [[k, v * i / n]], r));
    cur = wpSim(cur, [[k, v]], r);
  }
  return out;
}

// v843s: giro de ala de 15° (Core p.124): el borde delantero pivota sobre su esquina delantera izquierda ('L') o derecha ('R'). IZQUIERDA = antihorario visto desde arriba con la unidad mirando al frente (la izquierda de la unidad, no de la pantalla): con el eje y de la mesa hacia abajo, el rumbo DISMINUYE. Devuelve la nueva pose y el pivote.
export let WHEEL_STEP = 0.2618;
export function wheelPivot(g, dm, side) {
  const c = Math.cos(g.face), sn = Math.sin(g.face), lx = side === 'L' ? -1 : 1;
  const C = { x: g.x + c * dm.d / 2 - sn * lx * dm.w / 2, y: g.y + sn * dm.d / 2 + c * lx * dm.w / 2 };
  const a = (side === 'L' ? -1 : 1) * WHEEL_STEP, ca = Math.cos(a), sa = Math.sin(a), vx = g.x - C.x, vy = g.y - C.y;
  return { C, a, x: C.x + vx * ca - vy * sa, y: C.y + vx * sa + vy * ca, face: g.face + a };
}

// ---------- v843u — LÍNEA DE VISIÓN EXACTA (barrido angular desde un punto) ----------
// Core p.103: «If a straight, uninterrupted line can be drawn from within the model's vision arc to any part of the other model, there is a line of sight.
// If no such line can be drawn … without crossing over or through another model, there is no line of sight».
// losSweep decide, para UN punto de origen `a` (en el borde delantero de un modelo), si existe alguna dirección en la que el primer obstáculo que corta el rayo es un modelo del objetivo
// (y, si hay arco de visión, el punto alcanzado cae dentro del arco). Es exacto (no se muestrea el ángulo): se parte el abanico en los intervalos que delimitan las esquinas de todas las peanas
// y en cada intervalo se comprueba el primer obstáculo. obs = [{c: 4 esquinas, tg: es del objetivo, u: referencia de unidad, in: Set de ids de terreno que contienen al modelo}],
// terr = [{c, id, solid}] (solid: bloquea siempre; si no, solo si el modelo alcanzado no está dentro). arc = {px,py,fx,fy,lx,ly,f0,hw} o null (360°).
let LP = Math.PI, L2 = Math.PI * 2;
let relA = (th, r) => { let d = (th - r) % L2; if (d > LP) d -= L2; else if (d <= -LP) d += L2; return d; };
function cone(a, c, r) { // intervalo angular [lo, hi] (relativo a r, continuo) que abarca la peana vista desde a; null si a está dentro
  let cx = 0, cy = 0; for (const p of c) { cx += p.x; cy += p.y; } cx = cx / 4 - a.x; cy = cy / 4 - a.y;
  const th0 = Math.atan2(cy, cx), base = relA(th0, r); let lo = Infinity, hi = -Infinity, n = 0, rad = 0;
  for (const p of c) { const dx = p.x - a.x, dy = p.y - a.y; rad = Math.max(rad, Math.hypot(p.x - (cx + a.x), p.y - (cy + a.y))); if (dx * dx + dy * dy < 1e-14) continue; const t = relA(Math.atan2(dy, dx), th0); if (t < lo) lo = t; if (t > hi) hi = t; n++; }
  return n ? [base + lo, base + hi, Math.hypot(cx, cy), rad] : null;
}
function coneCirc(a, C, r) { // peana/terreno circular: intervalo angular de las dos tangentes desde a (null si a está dentro)
  const dx = C.x - a.x, dy = C.y - a.y, d = Math.hypot(dx, dy); if (d <= C.r + 1e-12) return null;
  const h = Math.asin(Math.min(1, C.r / d)), b = relA(Math.atan2(dy, dx), r); return [b - h, b + h, d, C.r];
}
function rayCirc(ax, ay, dx, dy, C) { // primera distancia positiva a la que el rayo (dirección unitaria) entra en el círculo
  const fx = ax - C.x, fy = ay - C.y, b = fx * dx + fy * dy, c = fx * fx + fy * fy - C.r * C.r, D = b * b - c; if (D < 0) return null;
  const t = -b - Math.sqrt(D); return t > 1e-9 ? t : null;
}
export function circPolyDist(poly, C) { // distancia del centro del círculo al polígono convexo (0 si está dentro) menos el radio: <0 = se solapan
  let inside = true, best = Infinity;
  for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length], ex = q.x - p.x, ey = q.y - p.y, l2 = ex * ex + ey * ey, t = l2 ? Math.max(0, Math.min(1, ((C.x - p.x) * ex + (C.y - p.y) * ey) / l2)) : 0; best = Math.min(best, Math.hypot(C.x - p.x - t * ex, C.y - p.y - t * ey)); if ((q.x - p.x) * (C.y - p.y) - (q.y - p.y) * (C.x - p.x) < 0) inside = false; }
  return (inside ? 0 : best) - C.r;
}
function rayPoly(ax, ay, dx, dy, c) { // primera distancia positiva t a la que el rayo entra en el polígono (null si no)
  let best = Infinity;
  for (let i = 0; i < c.length; i++) {
    const p = c[i], q = c[(i + 1) % c.length], ex = q.x - p.x, ey = q.y - p.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-14) continue;
    const wx = p.x - ax, wy = p.y - ay, t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
    if (t > 1e-9 && u >= -1e-9 && u <= 1 + 1e-9 && t < best) best = t;
  }
  return best === Infinity ? null : best;
}
let arcOK = (arc, p) => { if (!arc) return true; const dx = p.x - arc.px, dy = p.y - arc.py, f = dx * arc.fx + dy * arc.fy, l = dx * arc.lx + dy * arc.ly; return f >= arc.f0 - 1e-6 && Math.abs(l) <= arc.hw + (f - arc.f0) + 1e-6; };
export function losSweep(a, obs, terr, arc, wantBlk = false) {
  const tg = obs.filter((o) => o.tg); if (!tg.length) return { vis: false, blk: null };
  let r = 0; { let sx = 0, sy = 0; for (const o of tg) for (const p of o.c) { sx += p.x; sy += p.y; } r = Math.atan2(sy / (4 * tg.length) - a.y, sx / (4 * tg.length) - a.x); }
  let tLo = Infinity, tHi = -Infinity, far = 0;
  for (const o of tg) { const k = cone(a, o.c, r); if (!k) return { vis: true, blk: null }; o._k = k; if (k[0] < tLo) tLo = k[0]; if (k[1] > tHi) tHi = k[1]; if (k[2] + k[3] > far) far = k[2] + k[3]; }
  if (tHi - tLo >= LP) { /* el objetivo abarca ≥180° (contacto): visible si el primer golpe es suyo en alguna dirección; se resuelve igual con el barrido */ }
  const rel = [];
  for (const o of obs) { if (o.tg) { rel.push(o); continue; } const k = cone(a, o.c, r); if (!k) continue; if (k[1] <= tLo + 1e-9 || k[0] >= tHi - 1e-9 || k[2] - k[3] > far) continue; o._k = k; rel.push(o); }
  const tr = [];
  for (const o of terr) { const k = o.circ ? coneCirc(a, o.circ, r) : cone(a, o.c, r); if (!k) continue; if (k[1] <= tLo + 1e-9 || k[0] >= tHi - 1e-9) continue; o._k = k; tr.push(o); }
  { // descarte rápido: si las peanas que están enteras por delante del objetivo cubren todo su abanico sin huecos, no hay visión (sin trazar rayos)
    let tMin = Infinity; for (const o of tg) for (let i = 0; i < 4; i++) { const p = o.c[i], q = o.c[(i + 1) % 4], ex = q.x - p.x, ey = q.y - p.y, l2 = ex * ex + ey * ey, u = l2 ? Math.max(0, Math.min(1, ((a.x - p.x) * ex + (a.y - p.y) * ey) / l2)) : 0, d = Math.hypot(p.x + ex * u - a.x, p.y + ey * u - a.y); if (d < tMin) tMin = d; }
    const occ = []; for (const o of rel) if (!o.tg && o._k[2] + o._k[3] < tMin - 1e-9) occ.push(o);
    if (occ.length) { occ.sort((x, y) => x._k[0] - y._k[0]); const gap = 1e-9; let cover = tLo, mid = null;
      for (const o of occ) { if (o._k[1] <= cover) continue; if (o._k[0] > cover + gap) { mid = false; break; } if (!mid && o._k[0] <= (tLo + tHi) / 2 && o._k[1] >= (tLo + tHi) / 2) mid = o; cover = o._k[1]; if (cover >= tHi - gap) break; }
      if (mid !== false && cover >= tHi - gap) return { vis: false, blk: wantBlk ? ((mid && mid.u) || occ[0].u) : null }; }
  }
  const ev = [tLo, tHi];
  for (const o of rel) { if (o._k[0] > tLo && o._k[0] < tHi) ev.push(o._k[0]); if (o._k[1] > tLo && o._k[1] < tHi) ev.push(o._k[1]); }
  for (const o of tr) { if (o._k[0] > tLo && o._k[0] < tHi) ev.push(o._k[0]); if (o._k[1] > tLo && o._k[1] < tHi) ev.push(o._k[1]); }
  if (arc) { // el punto alcanzado cambia de dentro a fuera del arco donde el rayo cruza sus tres fronteras por un borde de una peana objetivo
    const lines = [[arc.px + arc.fx * arc.f0 - arc.lx * arc.hw, arc.py + arc.fy * arc.f0 - arc.ly * arc.hw, arc.lx, arc.ly], [arc.px + arc.fx * arc.f0 - arc.lx * arc.hw, arc.py + arc.fy * arc.f0 - arc.ly * arc.hw, arc.fx - arc.lx, arc.fy - arc.ly], [arc.px + arc.fx * arc.f0 + arc.lx * arc.hw, arc.py + arc.fy * arc.f0 + arc.ly * arc.hw, arc.fx + arc.lx, arc.fy + arc.ly]];
    for (const o of tg) for (let i = 0; i < 4; i++) { const p = o.c[i], q = o.c[(i + 1) % 4], ex = q.x - p.x, ey = q.y - p.y;
      for (const [lx0, ly0, ldx, ldy] of lines) { const den = ex * ldy - ey * ldx; if (Math.abs(den) < 1e-14) continue; const wx = lx0 - p.x, wy = ly0 - p.y, t = (wx * ldy - wy * ldx) / den; if (t < 0 || t > 1) continue; const X = p.x + ex * t, Y = p.y + ey * t, dx = X - a.x, dy = Y - a.y; if (dx * dx + dy * dy < 1e-14) continue; const e = relA(Math.atan2(dy, dx), r); if (e > tLo && e < tHi) ev.push(e); } }
  }
  ev.sort((x, y) => x - y);
  const blkW = wantBlk ? new Map() : null;
  for (let i = 0; i + 1 < ev.length; i++) {
    const e0 = ev[i], e1 = ev[i + 1]; if (e1 - e0 < 1e-11) continue;
    const mid = (e0 + e1) / 2, th = r + mid, dx = Math.cos(th), dy = Math.sin(th);
    let inT = false; for (const o of tg) if (o._k[0] < mid && mid < o._k[1]) { inT = true; break; }
    if (!inT) continue;
    const hits = [];
    for (const o of rel) if (o._k[0] < mid && mid < o._k[1]) { const t = rayPoly(a.x, a.y, dx, dy, o.c); if (t != null) hits.push([t, o, 0]); }
    for (const o of tr) if (o._k[0] < mid && mid < o._k[1]) { const t = o.circ ? rayCirc(a.x, a.y, dx, dy, o.circ) : rayPoly(a.x, a.y, dx, dy, o.c); if (t != null) hits.push([t, o, 1]); }
    hits.sort((x, y) => x[0] - y[0] || (x[1].tg ? 1 : 0) - (y[1].tg ? 1 : 0));
    let pend = null, blocked = null;
    for (const h of hits) {
      if (h[2] === 1) { if (h[1].solid) { blocked = h[1]; break; } (pend ||= []).push(h[1]); continue; }
      const o = h[1];
      if (o.tg) { if (pend && pend.some((p) => !(o.in && o.in.has(p.id)))) { blocked = pend.find((p) => !(o.in && o.in.has(p.id))); break; } const X = { x: a.x + dx * h[0], y: a.y + dy * h[0] }; if (arcOK(arc, X) && e1 - e0 > 1e-9) return { vis: true, blk: null, th, hit: X, w: (e1 - e0) * h[0] }; /* una rendija de menos de 0,5 mm de ancho en el objetivo (roce exacto de dos peanas) no es una línea de visión */ blocked = false; break; }
      blocked = o; break;
    }
    if (wantBlk && blocked) { const k = blocked.u || blocked; blkW.set(k, (blkW.get(k) || 0) + (e1 - e0)); }
  }
  let blk = null; if (wantBlk) { let w = 0; for (const [k, v] of blkW) if (v > w) { w = v; blk = k; } }
  return { vis: false, blk };
}

// ---------- v843v — VISIBILIDAD EXACTA DESDE UN SEGMENTO (borde delantero entero) ----------
// Core p.103: «If a straight, uninterrupted line can be drawn from within the model's vision arc to any part of the other model». El origen puede ser CUALQUIER punto del borde delantero S0-S1.
// El conjunto de orígenes desde los que existe un hueco libre es una unión finita de intervalos abiertos de S cuyos extremos son los puntos donde S corta una recta que pasa por dos «vértices»
// (esquinas de peanas/terreno, extremos del arco de visión sobre el objetivo, tangentes de un círculo): dentro de cada intervalo la estructura de la visibilidad no cambia, así que basta evaluar
// (con losSweep, que es exacto para un origen) el punto medio de cada intervalo. Sin muestreo ni umbrales: si existe algún rayo libre desde algún punto del borde, devuelve true.
export function losEdge(S0, S1, obs, terr, arc) {
  const tg = obs.filter((o) => o.tg); if (!tg.length) return false;
  let x0 = Math.min(S0.x, S1.x), x1 = Math.max(S0.x, S1.x), y0 = Math.min(S0.y, S1.y), y1 = Math.max(S0.y, S1.y);
  for (const o of tg) for (const p of o.c) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  const bb = (c) => { for (const p of c) if (p.x >= x0 - 1e-9 && p.x <= x1 + 1e-9 && p.y >= y0 - 1e-9 && p.y <= y1 + 1e-9) return true; let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity; for (const p of c) { a0 = Math.min(a0, p.x); a1 = Math.max(a1, p.x); b0 = Math.min(b0, p.y); b1 = Math.max(b1, p.y); } return !(a1 < x0 || a0 > x1 || b1 < y0 || b0 > y1); };
  const ro = obs.filter((o) => o.tg || bb(o.c)), rt = terr.filter((o) => (o.circ ? !(o.circ.x + o.circ.r < x0 || o.circ.x - o.circ.r > x1 || o.circ.y + o.circ.r < y0 || o.circ.y - o.circ.r > y1) : bb(o.c)));
  const V = []; for (const o of ro) for (const p of o.c) V.push(p); for (const o of rt) if (!o.circ) for (const p of o.c) V.push(p);
  if (arc) { const A = [arc.px + arc.fx * arc.f0 - arc.lx * arc.hw, arc.py + arc.fy * arc.f0 - arc.ly * arc.hw], B = [arc.px + arc.fx * arc.f0 + arc.lx * arc.hw, arc.py + arc.fy * arc.f0 + arc.ly * arc.hw];
    const lines = [[A[0], A[1], arc.lx, arc.ly], [A[0], A[1], arc.fx - arc.lx, arc.fy - arc.ly], [B[0], B[1], arc.fx + arc.lx, arc.fy + arc.ly]];
    for (const o of tg) for (let i = 0; i < o.c.length; i++) { const p = o.c[i], q = o.c[(i + 1) % o.c.length], ex = q.x - p.x, ey = q.y - p.y;
      for (const [lx0, ly0, ldx, ldy] of lines) { const den = ex * ldy - ey * ldx; if (Math.abs(den) < 1e-14) continue; const t = ((lx0 - p.x) * ldy - (ly0 - p.y) * ldx) / den; if (t > 0 && t < 1) V.push({ x: p.x + ex * t, y: p.y + ey * t }); } } }
  const sx = S1.x - S0.x, sy = S1.y - S0.y, T = [0, 1];
  const addLine = (px, py, dx, dy) => { const den = sx * dy - sy * dx; if (Math.abs(den) < 1e-14) return; const t = ((px - S0.x) * dy - (py - S0.y) * dx) / den; if (t > 1e-9 && t < 1 - 1e-9) T.push(t); };
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) { const dx = V[j].x - V[i].x, dy = V[j].y - V[i].y; if (dx * dx + dy * dy > 1e-18) addLine(V[i].x, V[i].y, dx, dy); }
  for (const o of rt) if (o.circ) { const C = o.circ; for (const p of V) { const dx = C.x - p.x, dy = C.y - p.y, d = Math.hypot(dx, dy); if (d <= C.r) continue; const b = Math.atan2(dy, dx), h = Math.asin(C.r / d); addLine(p.x, p.y, Math.cos(b + h), Math.sin(b + h)); addLine(p.x, p.y, Math.cos(b - h), Math.sin(b - h)); } }
  T.sort((a, b) => a - b);
  for (let i = 0; i + 1 < T.length; i++) { if (T[i + 1] - T[i] < 1e-12) continue; const tm = (T[i] + T[i + 1]) / 2; if (losSweep({ x: S0.x + sx * tm, y: S0.y + sy * tm }, obs, terr, arc, false).vis) return true; }
  return false;
}

export const __ev = (s) => eval(s);
