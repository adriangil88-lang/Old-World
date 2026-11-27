// Dawn of the Storm Dragon (Storm in the Wasteland): generadores de terreno de la Wasteland y de las Shadowlands (p.26-27),
// terreno lineal (p.24: secciones de 12", puentes, vados, agua rápida, caminos bien mantenidos) y mapa de «Un Arribo Oportuno» (p.34).
// Módulo puro (sin estado de partida): recibe un RNG (() => [0,1)) y devuelve piezas de terreno rectangulares (con giro opcional rot).
// Banderas de pieza que entiende el motor (rules.js): diff (difícil), danger (peligroso; incluye difícil), mishap (umbral del contratiempo, 1 por defecto),
// imp (impasable que no bloquea la visión), nolos (bloquea la visión), road (camino bien mantenido), river (río), look (aspecto), lin (id del rasgo lineal).
import { terrainPoly, rectRectDist, polysOverlap } from './geom.js';

export const WASTE = { 2: 'stream', 3: 'track', 4: 'woods', 5: 'hill', 6: 'marsh', 7: 'bog', 8: 'fen', 9: 'scrub', 10: 'sruins', 11: 'village', 12: 'dune' };
export const SHADOW = { 2: 'road', 3: 'dwoods', 4: 'hill', 5: 'ravine', 6: 'stones', 7: 'scrub', 8: 'rocky', 9: 'hruins', 10: 'shard', 11: 'chasm', 12: 'pit' };
export const TABLES = { waste: WASTE, shadow: SHADOW };
export const TABLE_NAME = { waste: 'Wasteland', shadow: 'Shadowlands' };
export const FEAT_NAME = {
  stream: 'Arroyo', track: 'Sendero', woods: 'Bosque', hill: 'Colina', marsh: 'Marisma', bog: 'Cenagal salado', fen: 'Pantano', scrub: 'Matorral', sruins: 'Ruinas en pie', village: 'Aldea de pescadores', dune: 'Duna de arena',
  road: 'Camino', dwoods: 'Bosque denso', ravine: 'Barranco', stones: 'Piedras erguidas', rocky: 'Terreno rocoso', hruins: 'Ruinas encantadas', shard: 'Tierras fracturadas', chasm: 'Sima', pit: 'Pozo sin fondo',
};
// Aspecto (render) de las piezas «ground» y de los puentes: [relleno, trazo]
export const LOOKS = {
  stream: ['rgba(70,132,180,.88)', 'rgba(170,215,240,.6)'], ford: ['rgba(120,170,190,.85)', 'rgba(210,235,245,.6)'], rapids: ['rgba(30,70,130,.92)', 'rgba(235,245,255,.8)'],
  road: ['rgba(178,148,98,.92)', 'rgba(224,200,150,.6)'], rut: ['rgba(120,92,58,.92)', 'rgba(170,140,96,.6)'],
  marsh: ['rgba(64,112,86,.88)', 'rgba(140,200,160,.55)'], fen: ['rgba(96,104,58,.9)', 'rgba(170,180,110,.55)'], bog: ['rgba(52,66,50,.94)', 'rgba(150,170,140,.55)'],
  rubble: ['rgba(126,120,104,.82)', 'rgba(190,184,164,.55)'], stones: ['rgba(138,138,150,.92)', 'rgba(210,210,225,.6)'], rocky: ['rgba(112,100,88,.9)', 'rgba(180,165,145,.55)'],
  shard: ['rgba(150,58,36,.92)', 'rgba(255,170,90,.8)'], chasm: ['rgba(22,16,28,.96)', 'rgba(120,90,70,.7)'], ravine: ['rgba(70,52,38,.94)', 'rgba(150,120,90,.6)'], pit: ['rgba(8,6,12,.98)', 'rgba(110,80,60,.8)'],
  bridge: ['rgba(142,102,62,.98)', 'rgba(70,46,24,.9)'], slope: ['rgba(110,98,84,.9)', 'rgba(185,170,150,.6)'],
};

// Banderas de pieza que se conservan al copiar/guardar el terreno (editor personalizado)
export const TFLAGS = ['diff', 'danger', 'imp', 'nolos', 'mishap', 'road', 'look', 'lin', 'label', 'river', 'fast', 'slope', 'ford', 'bridge', 'fork', 'taper', 'special', 'piece'];
export const pickFlags = (t) => { const o = {}; for (const k of TFLAGS) if (t[k] !== undefined && t[k] !== false) o[k] = t[k]; return o; };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const q2 = (v) => Math.round(v * 2) / 2;
const centerR = (W) => (W < 72 ? 6 : 12); // «a 12" o más del centro» (mesa reducida: 6", como el generador del Core del motor)

// ---------- geometría ----------
const bbox = (ps) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of ps) for (const c of terrainPoly(p)) { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x); y1 = Math.max(y1, c.y); } return { x0, y0, x1, y1 }; };
const gapPS = (A, B) => { let m = 1e9; for (const a of A) for (const b of B) { const d = polysOverlap(terrainPoly(a), terrainPoly(b), 1e-6) ? 0 : rectRectDist(a, b); if (d < m) m = d; if (m <= 0) return 0; } return m; };
const centerGap = (ps, W, H) => { let m = 1e9; const c = { x: W / 2, y: H / 2, w: 0, h: 0 }; for (const p of ps) m = Math.min(m, rectRectDist(p, c)); return m; };
const isImp = (p) => p.kind === 'building' || p.imp;
const zoneGapPS = (ps, zones) => { let m = 1e9; for (const z of zones) { const zr = { x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2, w: z.x1 - z.x0, h: z.y1 - z.y0 }; for (const p of ps) m = Math.min(m, rectRectDist(p, zr)); } return m; };
const insideTable = (ps, W, H, tol = 0.05) => ps.every((p) => terrainPoly(p).every((c) => c.x >= -tol && c.x <= W + tol && c.y >= -tol && c.y <= H + tol));
const shift = (ps, dx, dy) => ps.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));

// ---------- constructores de rasgos no lineales (piezas en coordenadas locales centradas en 0,0) ----------
const sz = (rng, big, lo = 2, hi = 8) => { // dimensión mayor 2"-8" (o 8"-12" si se sustituye por la versión mayor); la menor entre 2" y la mayor
  const L = big ? q2(8 + rng() * 4) : q2(Math.max(lo + 1, lo + 1 + rng() * (hi - lo - 1))), S = q2(Math.max(2, Math.min(L, 2 + rng() * (L - 2)))), ver = rng() < 0.5;
  return ver ? { w: S, h: L } : { w: L, h: S };
};
const P = (kind, x, y, w, h, extra = {}) => ({ kind, x, y, w, h, ...extra });
const MK = {
  woods: (rng, c, big) => { const d = sz(rng, big); return [P('forest', 0, 0, d.w, d.h, c.tdd === 'danger' ? { danger: true, diff: true } : {})]; },
  dwoods: (rng, c, big) => { const d = sz(rng, big); return [P('forest', 0, 0, d.w, d.h, { danger: true, diff: true, mishap: 2 })]; },
  scrub: (rng, c, big) => { const d = sz(rng, big); return [P('forest', 0, 0, d.w, d.h, c.tdd === 'danger' ? { danger: true, diff: true } : {})]; },
  marsh: (rng, c, big) => { const d = sz(rng, big); return [P('ground', 0, 0, d.w, d.h, { diff: true, look: 'marsh' })]; },
  fen: (rng, c, big) => { const d = sz(rng, big); return [P('ground', 0, 0, d.w, d.h, { diff: true, look: 'fen' })]; },
  bog: (rng, c, big) => { const d = sz(rng, big); return [P('ground', 0, 0, d.w, d.h, { danger: true, diff: true, mishap: 2, look: 'bog' })]; },
  shard: (rng, c, big) => { const d = sz(rng, big); return [P('ground', 0, 0, d.w, d.h, { danger: true, diff: true, mishap: 3, look: 'shard' })]; },
  rocky: (rng, c, big) => { const d = sz(rng, big); return [P('ground', 0, 0, d.w, d.h, { diff: true, look: 'rocky', ...(c.tdd === 'danger' ? { danger: true } : {}) })]; },
  stones: (rng, c, big) => { const d = sz(rng, big); return [P('ground', 0, 0, d.w, d.h, { diff: true, nolos: true, look: 'stones' })]; },
  dune: (rng, c, big) => { const d = sz(rng, big); return [P('hill', 0, 0, d.w, d.h, { diff: true })]; }, // «gently sloping hills of wind-blown sand»: colina, difícil entera
  pit: (rng) => { const L = q2(3 + rng() * 3), S = q2(3 + rng() * (L - 3)); return [rng() < 0.5 ? P('ground', 0, 0, L, S, { imp: true, look: 'pit' }) : P('ground', 0, 0, S, L, { imp: true, look: 'pit' })]; }, // impasable de 3"-6"
  hill: (rng, c, big) => { // una ladera rocosa, difícil o peligrosa
    const d = sz(rng, big), th = Math.min(3, Math.max(1.5, Math.min(d.w, d.h) / 2)), side = Math.floor(rng() * 4), sl = c.tdd === 'danger' ? { danger: true, diff: true } : { diff: true };
    const sp = side < 2 ? P('ground', 0, (side ? 1 : -1) * (d.h / 2 - th / 2), d.w, th, { look: 'slope', slope: true, ...sl }) : P('ground', (side === 2 ? 1 : -1) * (d.w / 2 - th / 2), 0, th, d.h, { look: 'slope', slope: true, ...sl });
    return [P('hill', 0, 0, d.w, d.h), sp];
  },
  sruins: (rng, c, big) => { // recinto de hasta 12" con ≥2 bordes con obstáculo lineal bajo; terreno difícil dentro
    const L = big ? q2(10 + rng() * 2) : q2(5 + rng() * 7), S = q2(Math.max(4, L * (0.6 + rng() * 0.4))), d = rng() < 0.5 ? { w: L, h: S } : { w: S, h: L };
    return [P('ground', 0, 0, d.w, d.h, { diff: true, look: 'rubble' }), ...walls(rng, d.w, d.h, 2 + (rng() < 0.4 ? 1 : 0))];
  },
  hruins: (rng, c, big, extra) => { // un edificio de hasta 6" y un recinto de hasta 12" con ≥2 bordes con obstáculo lineal bajo
    const L = q2(8 + rng() * 4), S = q2(Math.max(6, L * (0.6 + rng() * 0.4))), d = rng() < 0.5 ? { w: L, h: S } : { w: S, h: L };
    return [...walls(rng, d.w, d.h, 2 + (rng() < 0.4 ? 1 : 0)), ...buildings(rng, d, 1 + (extra || 0))];
  },
  village: (rng, c, big, extra) => { // un edificio de hasta 6" y un recinto de hasta 9" con ≥3 bordes con obstáculo lineal bajo
    const L = q2(7 + rng() * 2), S = q2(Math.max(5.5, L * (0.65 + rng() * 0.35))), d = rng() < 0.5 ? { w: L, h: S } : { w: S, h: L };
    return [...walls(rng, d.w, d.h, 3 + (rng() < 0.3 ? 1 : 0)), ...buildings(rng, d, 1 + (extra || 0))];
  },
};
// Obstáculos lineales bajos (muros) en k bordes del recinto w×h (centrado en 0,0); grosor 0,6"
function walls(rng, w, h, k) {
  const edges = [0, 1, 2, 3].sort(() => rng() - 0.5).slice(0, k), t = 0.6, out = [];
  for (const e of edges) out.push(e < 2 ? P('wall', 0, (e ? 1 : -1) * (h / 2 - t / 2), w, t, { enc: true }) : P('wall', (e === 2 ? 1 : -1) * (w / 2 - t / 2), 0, t, h, { enc: true }));
  return out;
}
// n edificios de hasta 6" por su lado mayor dentro del recinto w×h (a 1" de los muros; si no caben todos, los últimos quedan fuera pegados al recinto)
function buildings(rng, d, n) {
  const out = [], inw = d.w - 2.4, inh = d.h - 2.4;
  for (let i = 0; i < n; i++) {
    const L = q2(3 + rng() * 3), S = q2(Math.max(2.5, Math.min(L, 2.5 + rng() * 2))), bw = rng() < 0.5 ? L : S, bh = bw === L ? S : L;
    let ok = false;
    for (let t = 0; t < 60 && !ok; t++) {
      const x = (rng() - 0.5) * Math.max(0, inw - bw), y = (rng() - 0.5) * Math.max(0, inh - bh), b = P('building', q2(x), q2(y), bw, bh);
      if (bw <= inw && bh <= inh && out.every((o) => rectRectDist(o, b) >= 1)) { out.push(b); ok = true; }
    }
    if (!ok) out.push(P('building', q2(d.w / 2 + 1 + bw / 2 + 0.5), q2((i - 1) * 3), bw, bh)); // no cabe: junto al recinto
  }
  return out;
}

// ---------- rasgos lineales ----------
// narrow: ancho hasta 4"; wide: entre 4" y 8". hazard: peligroso/impasable (longitud máxima = mitad del borde largo). Cada sección mide 12".
const LIN = {
  stream: { w: 'narrow', hazard: false, look: 'stream', body: { diff: true }, el: 'rapidsFord' }, // difícil; cada 12": 3" de rápidos (peligroso) o un vado
  track: { w: 'narrow', hazard: false, look: 'road', body: { road: true }, el: 'rutted' }, // camino bien mantenido con 3" de terreno difícil cada 12"
  road: { w: 'pick', hazard: false, look: 'road', body: null, el: 'rutted' }, // ancho: bien mantenido; estrecho: mal mantenido con 3" difíciles cada 12"
  ravine: { w: 'pick', hazard: null, look: 'ravine', body: null, el: 'bridgeOpt' }, // estrecho: difícil; ancho: peligroso
  chasm: { w: 'wide', hazard: true, look: 'chasm', body: { imp: true }, el: 'bridge' }, // ancho e impasable; cada 12" un puente
};
const LIN_KEYS = new Set(Object.keys(LIN));
export const isLinearKey = (k) => LIN_KEYS.has(k);

let GID = 0;
function pathPieces(a, b, w, extra0, extra1) { // rectángulo girado entre los puntos a y b (se alarga en los extremos de unión para cubrir la esquina)
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) + extra0 + extra1, ang = Math.atan2(dy, dx), mid = (extra1 - extra0) / 2, ux = Math.cos(ang), uy = Math.sin(ang);
  return { x: (a.x + b.x) / 2 + ux * mid, y: (a.y + b.y) / 2 + uy * mid, w: Math.max(0.2, len), h: w, rot: Math.abs(ang) < 1e-9 ? 0 : ang };
}
const polyPoint = (pt, ang, d) => ({ x: pt.x + Math.cos(ang) * d, y: pt.y + Math.sin(ang) * d });

// Construye un rasgo lineal de n secciones (cada una de 12"); devuelve piezas con coordenadas de mesa o null si no encuentra sitio
function buildLinear(rng, key, n, ctx, tries = 400) {
  const def = LIN[key], W = ctx.W, H = ctx.H;
  for (let attempt = 0; attempt < tries; attempt++) {
    const wide = def.w === 'wide' || (def.w === 'pick' && rng() < 0.5), width = wide ? q2(4.5 + rng() * 2.5) : q2(2.5 + rng() * 1.5);
    const hazard = def.hazard === null ? wide : def.hazard;
    const maxSec = hazard ? Math.max(1, Math.floor(Math.max(W, H) / 2 / 12)) : 99;
    const nSec = Math.min(n, maxSec);
    const body = key === 'road' ? (wide ? { road: true } : {}) : key === 'ravine' ? (wide ? { danger: true, diff: true } : { diff: true }) : def.body;
    const look = key === 'ravine' ? 'ravine' : def.look;
    const edge = Math.floor(rng() * 4);
    let ang = edge === 0 ? Math.PI / 2 : edge === 1 ? -Math.PI / 2 : edge === 2 ? 0 : Math.PI;
    ang += (rng() - 0.5) * 1.1;
    let p = { x: edge === 2 ? 0 : edge === 3 ? W : 3 + rng() * (W - 6), y: edge === 0 ? 0 : edge === 1 ? H : 3 + rng() * (H - 6) };
    if (edge >= 2) p.y = 3 + rng() * (H - 6);
    p = polyPoint(p, ang, width / 2 * Math.abs(Math.sin((edge < 2 ? ang - Math.PI / 2 : ang) * 1)) + 0.15); // entra lo justo para que el rectángulo no sobresalga
    const id = 'L' + (++GID), pieces = [];
    let ok = true, sub = 0;
    const brLog = [];
    for (let i = 0; i < nSec && ok; i++) {
      const bend = rng() < 0.55, f = 0.3 + rng() * 0.4, turn = (rng() < 0.5 ? -1 : 1) * (0.35 + rng() * (Math.PI / 2 - 0.35)); // un solo giro de hasta 90°
      const segs = bend ? [{ L: 12 * f, a: ang }, { L: 12 * (1 - f), a: ang + turn }] : [{ L: 12, a: ang }];
      const pts = [p];
      for (const sg of segs) pts.push(polyPoint(pts[pts.length - 1], sg.a, sg.L));
      const secPieces = [];
      // elemento especial de la sección (3") en el tramo recto más largo
      let host = 0; segs.forEach((sg, k) => { if (sg.L > segs[host].L) host = k; });
      const hL = segs[host].L, off = hL > 5 ? 1 + rng() * (hL - 5) : 0.5; // el elemento de 3" empieza a «off» del inicio del tramo
      const el = def.el, specials = [];
      if (el === 'rapidsFord') { specials.push(rng() < 0.5 ? { t: 'rapids' } : { t: 'ford' }); if (specials[0].t === 'rapids' && rng() < 0.4) specials.push({ t: rng() < 0.5 ? 'bridge' : 'ford', second: true }); }
      else if (el === 'rutted') specials.push({ t: 'rut' });
      else if (el === 'bridge') specials.push({ t: 'bridge' });
      else if (el === 'bridgeOpt' && rng() < 0.5) specials.push({ t: 'bridge' });
      // 1 solo elemento de 3" por tramo (el segundo, si lo hay, va en el otro tramo si existe; si no, se omite)
      const placeAt = []; specials.forEach((sp, k) => { const h2 = k === 0 ? host : (segs.length > 1 ? 1 - host : -1); if (h2 >= 0) placeAt.push({ sp, h: h2, off: k === 0 ? off : (segs[h2].L > 5 ? 1 + rng() * (segs[h2].L - 5) : 0.5) }); });
      segs.forEach((sg, k) => {
        const a = pts[k], b = pts[k + 1], ux = Math.cos(sg.a), uy = Math.sin(sg.a), here = placeAt.filter((pa) => pa.h === k).sort((x, y) => x.off - y.off);
        const e0 = k > 0 ? width * 0.35 : 0, e1 = k < segs.length - 1 ? width * 0.35 : 0;
        let cur = 0; const push = (from, to, flags, idx, deco) => {
          if (to - from < 0.05) return;
          const A = { x: a.x + ux * from, y: a.y + uy * from }, B = { x: a.x + ux * to, y: a.y + uy * to };
          const r = pathPieces(A, B, width, from === 0 ? e0 : 0, to === sg.L ? e1 : 0);
          secPieces.push({ kind: deco ? 'deco' : 'ground', ...r, ...flags, ...(deco ? { piece: 'bridge', look: 'bridge' } : { look: flags.look || look }), lin: id, ...(idx ? { sid: idx } : {}) });
        };
        for (const pa of here) {
          const t = pa.sp.t, L3 = 3;
          push(cur, pa.off, { ...body, ...(body && body.road ? { road: true } : {}) }, 0);
          if (t === 'rapids') push(pa.off, pa.off + L3, { danger: true, diff: true, look: 'rapids', road: false }, `${id}x${++sub}`);
          else if (t === 'ford') push(pa.off, pa.off + L3, { diff: true, look: 'ford', ford: true }, `${id}x${++sub}`);
          else if (t === 'rut') push(pa.off, pa.off + L3, { diff: true, look: 'rut' }, `${id}x${++sub}`);
          else if (t === 'bridge') { // el puente (≤3" de ancho, terreno abierto): hueco en el rasgo + pieza decorativa
            const A = { x: a.x + ux * pa.off, y: a.y + uy * pa.off }, B = { x: a.x + ux * (pa.off + L3), y: a.y + uy * (pa.off + L3) }, r = pathPieces(A, B, width + 0.6, 0, 0);
            secPieces.push({ kind: 'deco', piece: 'bridge', look: 'bridge', ...r, lin: id, bridge: true });
            brLog.push(1);
          }
          cur = pa.off + L3;
        }
        push(cur, sg.L, { ...body }, 0);
        void b;
      });
      pieces.push(...secPieces);
      p = pts[pts.length - 1]; ang = segs[segs.length - 1].a;
      // bifurcación o cruce (una sola por sección): ramal de hasta 6" desde la mitad de la sección
      if (rng() < 0.25) {
        const mid = { x: (pts[0].x + p.x) / 2, y: (pts[0].y + p.y) / 2 }, ba = ang + (rng() < 0.5 ? -1 : 1) * (0.5 + rng() * 1.0), bp = polyPoint(mid, ba, 6);
        const r = pathPieces(mid, bp, Math.max(1.5, width * 0.7), 0, 0);
        pieces.push({ kind: 'ground', ...r, ...(body || {}), look, lin: id, fork: true });
      }
    }
    if (!pieces.length) continue;
    // el otro extremo: toca otro borde, o acaba en punta (se estrecha en dos escalones)
    const endTouch = p.x <= 1 || p.x >= W - 1 || p.y <= 1 || p.y >= H - 1;
    if (!endTouch) {
      for (const [from, ww] of [[0, 0.66], [2, 0.33]]) {
        const A = polyPoint(p, ang, from), B = polyPoint(p, ang, from + 2), r = pathPieces(A, B, Math.max(0.8, width * ww), 0, 0);
        pieces.push({ kind: 'ground', ...r, ...(body || {}), look, lin: id, taper: true });
      }
    }
    // el rasgo debe caber en la mesa, respetar el centro y no solaparse con otros rasgos
    const ps = pieces.filter((x) => x.kind !== 'deco');
    if (!insideTable(pieces, W, H, 0.6)) continue;
    if (centerGap(ps, W, H) < centerR(W) - 1e-6) continue;
    if (ctx.groups.some((g) => gapPS(g.pieces.filter((x) => x.kind !== 'deco'), ps) < 1.5)) continue;
    if (ps.some(isImp) && zoneGapPS(ps.filter(isImp), ctx.zones) < 0.5) continue;
    const dang = body && (body.danger || body.imp);
    const tag = (x) => (x.kind === 'deco' ? x : { ...x, ...(x.sid ? {} : { id: id }), ...(x.sid ? { id: x.sid } : {}) });
    const out = pieces.map(tag).map((x) => { const y = { ...x }; delete y.sid; if (!y.id) y.id = id + 'b'; return y; });
    return { pieces: out, sections: nSec, hazard: !!dang, wide, width, rolled: n, linKey: key, bridges: brLog.length };
  }
  return null;
}

// ---------- generador ----------
const d6 = (rng) => 1 + Math.floor(rng() * 6);
const roll2d6 = (rng) => d6(rng) + d6(rng);
// Coloca un rasgo no lineal (piezas locales) en una posición aleatoria válida; devuelve el grupo o null
function placeGroup(rng, local, ctx, relax = 0) {
  const bb = bbox(local), hx = (bb.x1 - bb.x0) / 2, hy = (bb.y1 - bb.y0) / 2, ox = -(bb.x0 + bb.x1) / 2, oy = -(bb.y0 + bb.y1) / 2;
  const base = shift(local, ox, oy), W = ctx.W, H = ctx.H, gap = [3, 2, 1, 0.5][Math.min(relax, 3)];
  for (let t = 0; t < 500; t++) {
    const cx = hx + 0.05 + rng() * Math.max(0, W - 2 * hx - 0.1), cy = hy + 0.05 + rng() * Math.max(0, H - 2 * hy - 0.1);
    const ps = shift(base, q2(cx), q2(cy));
    if (!insideTable(ps, W, H)) continue;
    if (centerGap(ps, W, H) < centerR(W) - 1e-6) continue;
    if (ctx.groups.some((g) => gapPS(g.pieces, ps) < gap)) continue;
    if (ps.some(isImp) && zoneGapPS(ps.filter(isImp), ctx.zones) < 0.5) continue; // el terreno impasable no ocupa la zona de despliegue
    return ps;
  }
  return null;
}
function nameOf(key) { return FEAT_NAME[key] || key; }

// opts: { W, H, zones, table: 'waste'|'shadow', tdd: 'diff'|'danger', feat, extra, count }
// Devuelve { terrain, log }: el ganador de la tirada coloca los rasgos y el perdedor dispersa D3 (aquí, según el texto, de forma automática; el jugador puede retocar el resultado en el editor)
export function genDawn(rng, opts) {
  const W = opts.W, H = opts.H, table = TABLES[opts.table] || WASTE, tname = TABLE_NAME[opts.table] || 'Wasteland';
  const ctx = { W, H, zones: opts.zones || [], tdd: opts.tdd === 'danger' ? 'danger' : 'diff', groups: [] };
  const log = [];
  const nFeat = opts.count || Math.max(2, Math.round(W / 12)); // nº de rasgos según el tamaño de la mesa (1 por cada 12" del borde largo)
  let gid = 0;
  // rasgos especificados por el escenario: no dispersan y quedan fuera de la regla de los 12" del centro
  for (const f of [opts.feat, ...(opts.extra || [])].filter(Boolean)) ctx.groups.push({ key: 'scn', pieces: [{ ...f, id: f.id || 'sc' + ++gid }], fixed: true });
  // 1. tiradas: cada sección de un rasgo lineal cuenta como un rasgo
  const rolls = [];
  for (let i = 0; i < nFeat; i++) { const r = roll2d6(rng), key = table[r]; rolls.push({ r, key }); log.push(`${tname}: 2D6 = ${r} → ${nameOf(key)}`); }
  const order = [], cnt = {};
  for (const { key } of rolls) { cnt[key] = (cnt[key] || 0) + 1; }
  const seen = {};
  for (const { key } of rolls) { if (!seen[key]) { seen[key] = 1; order.push(key); } }
  // 2. construcción y colocación
  for (const key of order) {
    const n = cnt[key];
    if (isLinearKey(key)) { // los lineales repetidos se suman alargando el primero
      let left = n, first = true;
      while (left > 0) {
        const g = buildLinear(rng, key, left, ctx);
        if (!g) { log.push(`${nameOf(key)}: no se encontró sitio válido`); break; }
        ctx.groups.push({ key, pieces: g.pieces, lin: true, sections: g.sections, fixed: false });
        log.push(`${nameOf(key)}: ${g.sections} sección(es) de 12"${g.wide ? ', ancho' : ', estrecho'} (${g.width}")${first ? '' : ' (otro rasgo: se superó el máximo del peligroso)'}${g.bridges ? ', con puente' : ''}`);
        left -= g.sections; first = false;
      }
      continue;
    }
    const mk = MK[key];
    const groups = []; let bigDone = false, extraB = 0;
    for (let i = 0; i < n; i++) {
      const rep = i > 0;
      if (rep && (key === 'village' || key === 'hruins')) { // edificios repetidos: más edificios (hasta 6") o sustituir un rasgo por un edificio de 6"-12"
        if (rng() < 0.5 && groups.length) { // otro edificio en el mismo rasgo
          const g0 = groups[groups.length - 1]; extraB++;
          const loc = mk(rng, ctx, false, extraB), ok = placeGroup(rng, loc, ctx) || null;
          const idx = ctx.groups.indexOf(g0);
          if (idx >= 0) ctx.groups.splice(idx, 1);
          const pl = ok || placeGroup(rng, loc, ctx, 3) || g0.pieces;
          g0.pieces = pl; ctx.groups.push(g0); log.push(`${nameOf(key)}: otro edificio de hasta 6"`);
          continue;
        }
        // sustituir un rasgo existente por un edificio mayor de 6"-12"
        const cand = ctx.groups.filter((g) => !g.fixed && !g.lin);
        const L = q2(6.5 + rng() * 5.5), S = q2(Math.max(3, Math.min(L, 3 + rng() * (L - 3)))), loc = [P('building', 0, 0, rng() < 0.5 ? L : S, 0)];
        loc[0].h = loc[0].w === L ? S : L;
        if (cand.length) { const victim = cand[Math.floor(rng() * cand.length)]; ctx.groups.splice(ctx.groups.indexOf(victim), 1); log.push(`${nameOf(key)}: un rasgo (${nameOf(victim.key)}) se sustituye por un edificio de 6"-12"`); }
        const ps = placeGroup(rng, loc, ctx) || placeGroup(rng, loc, ctx, 3);
        if (ps) ctx.groups.push({ key: 'bld', pieces: ps, fixed: false });
        continue;
      }
      const big = rep && !bigDone && rng() < 0.5; // repetido: segundo rasgo igual, o la versión mayor (8"-12") sustituye al primero
      if (big) {
        bigDone = true;
        const g0 = groups[0]; if (g0) { const idx = ctx.groups.indexOf(g0); if (idx >= 0) ctx.groups.splice(idx, 1); }
        const loc = mk(rng, ctx, true), ps = placeGroup(rng, loc, ctx) || placeGroup(rng, loc, ctx, 3) || (g0 && g0.pieces) || null;
        if (ps) { const ng = { key, pieces: ps, fixed: false }; if (g0) groups[0] = ng; else groups.push(ng); ctx.groups.push(ng); log.push(`${nameOf(key)}: repetido, versión mayor (8"-12")`); }
        continue;
      }
      let loc = mk(rng, ctx, false, 0);
      if (rep && groups[0] && groups[0].local) loc = groups[0].local.map((p) => ({ ...p })); // «un segundo rasgo del mismo tipo y tamaño»
      const ps = placeGroup(rng, loc, ctx) || placeGroup(rng, loc, ctx, 3);
      if (!ps) { log.push(`${nameOf(key)}: no se encontró sitio válido`); continue; }
      const g = { key, pieces: ps, local: loc, fixed: false }; groups.push(g); ctx.groups.push(g);
      if (rep) log.push(`${nameOf(key)}: repetido, segundo rasgo del mismo tipo y tamaño`);
    }
  }
  // 3. el perdedor elige D3 rasgos y los dispersa: 2D6" en la dirección de la flecha del dado de dispersión (Impacto: no se mueve); se detienen al tocar otro rasgo, el borde, o al llegar a 12" del centro
  const movable = ctx.groups.filter((g) => !g.fixed && !g.lin);
  const nScat = Math.min(movable.length, 1 + Math.floor(rng() * 3));
  const pool = movable.slice().sort(() => rng() - 0.5).slice(0, nScat);
  for (const g of pool) {
    const dist = roll2d6(rng), hit = d6(rng) <= 2, ang = rng() * Math.PI * 2;
    if (hit) { log.push(`Dispersión: ${nameOf(g.key)} — ¡Impacto!, no se mueve`); continue; }
    const others = ctx.groups.filter((o) => o !== g);
    let dx = 0, dy = 0, moved = 0;
    for (let st = 0.25; st <= dist + 1e-9; st += 0.25) {
      const tx = Math.cos(ang) * st, ty = Math.sin(ang) * st, ps = shift(g.pieces, tx, ty);
      if (!insideTable(ps, W, H, 0) || centerGap(ps, W, H) < centerR(W) - 1e-6 || others.some((o) => gapPS(o.pieces, ps) < 0.05) || (ps.some(isImp) && zoneGapPS(ps.filter(isImp), ctx.zones) < 0.5)) break;
      dx = tx; dy = ty; moved = st;
    }
    g.pieces = shift(g.pieces, dx, dy);
    log.push(`Dispersión: ${nameOf(g.key)} — flecha, ${dist}" (se desplaza ${moved.toFixed(1)}")`);
  }
  // 4. salida: piezas con id y etiqueta
  const out = [];
  ctx.groups.forEach((g, gi) => g.pieces.forEach((p, pi) => {
    const o = { ...p }; delete o.enc; if (!o.rot) delete o.rot;
    if (!o.id) o.id = `d${gi + 1}_${pi + 1}`;
    if (g.key !== 'scn') o.label = nameOf(g.key);
    out.push(o);
  }));
  return { terrain: out, log };
}

// ---------- Un Arribo Oportuno: mapa impreso (p.34), mesa de 72"x48" ----------
// Atacante abajo (y 36-48), zona B del defensor arriba (y 0-12); zona A (24"x9") centrada, a 12" de la zona del atacante.
export const TIMELY_ZONE_A = (W, H, zA, zB) => {
  const cx = W / 2, w = Math.min(24, W - 4);
  if (H >= 40) return { x0: cx - w / 2, x1: cx + w / 2, y0: H - 33, y1: H - 24 }; // 12" por encima de la zona del atacante (y 36), 9" de fondo
  const y0 = zB ? zB.y1 : 0; return { x0: cx - w / 2, x1: cx + w / 2, y0, y1: Math.min(y0 + 9, zA ? zA.y0 - 3 : H) };
};
export function timelyTents(W, H, za0) {
  const za = za0 || TIMELY_ZONE_A(W, H), T = [];
  [[0.15, 0.3], [0.38, 0.7], [0.62, 0.3], [0.85, 0.7]].forEach(([fx, fy], i) => T.push({ id: 'ta_tent' + i, kind: 'deco', piece: i % 2 ? 'bazaar2' : 'bazaar1', x: q2(za.x0 + fx * (za.x1 - za.x0)), y: q2(za.y0 + fy * (za.y1 - za.y0)), w: 3, h: 3, label: 'Campamento imperial' }));
  return T;
}
export function timelyMap(rng, W, H, tdd) {
  void rng;
  const my = (y) => H - y; // la ilustración tiene al atacante arriba; el motor, abajo
  const T = [];
  const add = (p) => T.push({ ...p });
  const dd = tdd === 'danger' ? { danger: true, diff: true } : {};
  add({ id: 'ta_bog', kind: 'ground', x: 9.5, y: my(13), w: 8, h: 5, danger: true, diff: true, mishap: 2, look: 'bog', label: 'Cenagal salado' });
  add({ id: 'ta_scrub', kind: 'forest', x: 24.5, y: my(21.5), w: 7, h: 3.5, ...dd, label: 'Matorral' });
  add({ id: 'ta_dunes', kind: 'hill', x: 60, y: my(10.5), w: 12, h: 8, diff: true, label: 'Duna de arena' });
  // Arroyo poco profundo: de arriba a la izquierda hacia la zona de despliegue B (tres secciones de 12")
  const id = 'ta_stream', w = 3.4, pts = [{ x: 1.2, y: my(9.8) }, { x: 10, y: my(18) }, { x: 17.5, y: my(26.5) }, { x: 25.5, y: my(35.5) }];
  pts.slice(0, -1).forEach((a, i) => {
    const b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), ux = Math.cos(ang), uy = Math.sin(ang);
    const e0 = i ? w * 0.35 : 0, e1 = i < pts.length - 2 ? w * 0.35 : 0;
    const mk = (f, t, fl, sid) => { const A = { x: a.x + ux * f, y: a.y + uy * f }, B = { x: a.x + ux * t, y: a.y + uy * t }, r = pathPieces(A, B, w, f === 0 ? e0 : 0, t === len ? e1 : 0); add({ id: sid || id, kind: 'ground', ...r, lin: id, label: 'Arroyo poco profundo', look: 'stream', diff: true, ...fl }); };
    if (i === 1) { mk(0, len * 0.4, {}); mk(len * 0.4, len * 0.4 + 3, { danger: true, look: 'rapids' }, id + 'x' + i); mk(len * 0.4 + 3, len, {}); } // rápidos rocosos (3", peligroso)
    else if (i === 2) { mk(0, len * 0.5, {}); mk(len * 0.5, len * 0.5 + 3, { look: 'ford', ford: true }, id + 'x' + i); mk(len * 0.5 + 3, len, {}); } // vado (3", difícil)
    else mk(0, len, {});
  });
  // aldea de pescadores: recinto de 9" con tres bordes con muro bajo y un edificio de hasta 6"
  const vx = 33, vy = my(34.5);
  T.push(P('building', vx, vy, 4.5, 3, { id: 'ta_house', label: 'Aldea de pescadores' }));
  T.push(P('wall', vx, vy - 2.7, 9, 0.6, { id: 'ta_w1', label: 'Aldea de pescadores' }), P('wall', vx, vy + 2.7, 9, 0.6, { id: 'ta_w2', label: 'Aldea de pescadores' }), P('wall', vx - 4.2, vy, 0.6, 5.4, { id: 'ta_w3', label: 'Aldea de pescadores' }));
  T.push(...timelyTents(W, H));
  return T;
}
