// Dibujo de la mesa en canvas (coordenadas del mundo en pulgadas).
import { dims } from './geom.js';
import { LOOKS as DLOOKS } from './dawn.js';
import { D, alive, byId, rangedOf, shortName, labelName, unitTag } from './rules.js';
import { FACTIONS, FIG_ALIAS, SPELLS, UNITS } from './data.js';
const CAST_COL = { missile: '#ff7ad9', hex: '#9b6bff', assail: '#ff9b4a', vortex: '#5ac8ff', enchant: '#7be38a', conveyance: '#ffd75a' }; // color del proyectil de magia según el tipo de hechizo
const fxCol = (e) => (e.k === 'cast' ? CAST_COL[SPELLS[e.spell]?.type] || '#c79bff' : '#ff8a5a');
import { unitDist } from './geom.js';
import { gl3, glDraw, glFig, glHas, glExt, gfxHi } from './gl3d.js';
import { XMODELS } from './hdmap.js';

export let TW = 72, TH = 48;
// Tamaño de mesa de la partida en curso (normal 72"x48" o reducida)
export function syncTable(s) { const w = (s && s.tw) || 72, h = (s && s.th) || 48; if (w === TW && h === TH) return; TW = w; TH = h; C0.x = w / 2; C0.y = h / 2; }
export const view = { k: 0, scale: 10, px: 0, py: 0, w: 0, h: 0, dpr: 1, m3: (typeof window !== 'undefined' && window.__TOW_2D) ? 0 : 1, yaw: (typeof window !== 'undefined' && window.__TOW_2D) ? 0 : 0.42, pitch: (typeof window !== 'undefined' && window.__TOW_2D) ? 0.85 : 0.62 }; // v843s: la vista de juego es SIEMPRE 3D; window.__TOW_2D (solo pruebas internas) conserva el dibujo plano
const dcam = () => view.dcam || 110; // distancia de la cámara (menor = más perspectiva)
const C0 = { x: 36, y: 24 };
const cs = () => [Math.cos(view.k * Math.PI / 2), Math.sin(view.k * Math.PI / 2)];

function fxIcons(u) {
  const m = { storm: '⛈', rust: '🔩', ramparts: '⛰', robe: '✨', mirage: '🌫', attract: '☠', badmoon: '☠' };
  const out = new Set(); if (u.frog) out.add('🐸');
  for (const f of u.fx || []) out.add(m[f.k] || '✦');
  return [...out].slice(0, 3).join('');
}
function t3cam() {
  const a = view.k * Math.PI / 2 + (view.m3 ? view.yaw : 0), th = view.pitch;
  return { c: Math.cos(a), s: Math.sin(a), sp: Math.sin(th), cp: Math.cos(th) };
}
// proyección 3D: punto del mundo (x,y) a altura z → pantalla; d = profundidad (mayor = más lejos)
export function t3p(x, y, z = 0) {
  const { c, s, sp, cp } = t3cam();
  const ox = x - C0.x, oy = y - C0.y;
  const rx = c * ox - s * oy, ry = s * ox + c * oy;
  const dep = -ry * cp - z * sp;
  const k = dcam() / Math.max(8, dcam() + dep);
  return { x: view.scale * rx * k + view.w / 2 + view.px, y: view.scale * (ry * sp - z * cp) * k + view.h / 2 + view.py, d: dep, k };
}
function t3inv(p) {
  const { c, s, sp, cp } = t3cam();
  const X = (p.x - view.w / 2 - view.px) / view.scale;
  let Y = (p.y - view.h / 2 - view.py) / view.scale;
  const lim = sp * dcam() / cp * 0.97; if (cp > 0.01 && Y < -lim) Y = -lim;
  const ry = Y * dcam() / (sp * dcam() + Y * cp);
  const k = dcam() / (dcam() - ry * cp), rx = X / k;
  return { x: c * rx + s * ry + C0.x, y: -s * rx + c * ry + C0.y };
}
export function w2s(p) {
  if (view.m3) return t3p(p.x, p.y, 0);
  const [c, s] = cs();
  const x = p.x - C0.x, y = p.y - C0.y;
  return { x: view.scale * (c * x - s * y) + view.w / 2 + view.px, y: view.scale * (s * x + c * y) + view.h / 2 + view.py };
}
export function s2w(p) {
  if (view.m3) return t3inv(p);
  const [c, s] = cs();
  const x = (p.x - view.w / 2 - view.px) / view.scale, y = (p.y - view.h / 2 - view.py) / view.scale;
  return { x: c * x + s * y + C0.x, y: -s * x + c * y + C0.y };
}
export function fit() {
  view.dcam = 110;
  const odd = view.k % 2 === 1;
  const tw = odd ? TH : TW, th = odd ? TW : TH;
  view.scale = Math.max(2, Math.min((view.w - 16) / tw, (view.h - 16) / th));
  view.px = 0; view.py = 0;
  if (view.m3) {
    view.scale = Math.max(2, Math.min((view.w - 16) / (tw * 1.2), (view.h - 16) / (th * Math.sin(view.pitch) + 9)));
    view.py = 2.5 * view.scale;
    // móvil en vertical: la mesa entera deja las miniaturas diminutas; se acerca la cámara a tu lado del tablero (como al sentarse a la mesa en Tabletop)
    const narrow = view.w < 760; view.dcam = view.close ? (narrow ? 52 : 80) : 95; // con la mesa entera, cámara más lejos (evita recortar la esquina cercana)
    if (view.close) { const z = narrow ? 2.6 : 1.6; view.scale *= z; /* v843l: móvil 2,0 → 2,6 (figura ≈10 → ≈13,5 px) */ view.py = -th * Math.sin(view.pitch) * view.scale * 0.11; } // «acercar a tu lado»
    else { // mesa entera en diagonal (como en Tabletop/Kill Team)
      const cy = Math.abs(Math.cos(view.yaw || 0)), sy = Math.abs(Math.sin(view.yaw || 0)), pw = tw * cy + th * sy, ph = tw * sy + th * cy;
      view.scale = Math.max(2, Math.min((view.w - 8) / (pw * 1.02), (view.h - 8) / (ph * Math.sin(view.pitch) + 14))) * (narrow ? 0.98 : 1.0); view.py = 0.5 * view.scale;
      // encaje exacto: se proyectan las esquinas de la mesa (y la altura de las miniaturas) y se ajusta escala y centro al hueco libre
      const mT = 30, mB = narrow ? 54 : 10, box = () => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of [[0, 0], [TW, 0], [TW, TH], [0, TH]]) for (const z of [0, 2.5]) { const p = t3p(x, y, z); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); } return { x0, x1, y0, y1 }; };
      view.px = 0; view.py = 0;
      if (view.w > 50 && view.h > mT + mB + 50) {
        for (let i = 0; i < 2; i++) { const q = box(); view.scale = Math.max(2, view.scale * Math.min((view.w - 6) / (q.x1 - q.x0), (view.h - mT - mB) / (q.y1 - q.y0))); }
        const q = box(); view.px = view.w / 2 - (q.x0 + q.x1) / 2; view.py = mT + (view.h - mT - mB) / 2 - (q.y0 + q.y1) / 2;
      }
    }
  }
}
// v843s: lupa: encuadra la unidad ENTERA y DE FRENTE (la cámara se sitúa delante de ella según su orientación) con el zoom justo para que quepa en pantalla
export function camUnit(pts, face, h = 2.6) {
  if (!view.m3 || !view.w || !pts.length) return false;
  const TAU = Math.PI * 2; let y = Math.PI / 2 - face - view.k * Math.PI / 2; y = ((y + Math.PI) % TAU + TAU) % TAU - Math.PI;
  view.yaw = y; view.pitch = 0.5; view.dcam = view.w < 760 ? 60 : 85;
  const cx = pts.reduce((t, p) => t + p[0], 0) / pts.length, cy = pts.reduce((t, p) => t + p[1], 0) / pts.length;
  const narrow = view.w < 760, mT = 36, mB = narrow ? 64 : 24;
  const box = () => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, yy] of pts) for (const z of [0, h]) { const p = t3p(x, yy, z); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); } return { x0, x1, y0, y1 }; };
  view.px = 0; view.py = 0; view.scale = Math.max(view.scale, 20);
  for (let i = 0; i < 4; i++) { const q = box(); view.scale = Math.max(3, Math.min(170, view.scale * Math.min((view.w - 24) / Math.max(1, q.x1 - q.x0), (view.h - mT - mB) / Math.max(1, q.y1 - q.y0)))); }
  const q = box(); view.px = view.w / 2 - (q.x0 + q.x1) / 2; view.py = mT + (view.h - mT - mB) / 2 - (q.y0 + q.y1) / 2;
  return true;
}
// v843s: cámara de despliegue: encuadra la zona de despliegue de quien coloca, mirando desde su lado de la mesa (yaw 0 = su borde abajo; view.k lo fija orient())
export function camZone(z) {
  if (!view.m3 || !z || !view.w) return false;
  const pts = z.poly ? z.poly.map((p) => [p.x, p.y]) : [[z.x0, z.y0], [z.x1, z.y0], [z.x1, z.y1], [z.x0, z.y1]];
  view.yaw = 0; view.pitch = 0.62; view.close = false; fit();
  const narrow = view.w < 760, mT = 30, mB = narrow ? 54 : 10;
  const box = () => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) for (const zz of [0, 2.5]) { const p = t3p(x, y, zz); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); } return { x0, x1, y0, y1 }; };
  view.px = 0; view.py = 0; view.dcam = narrow ? 70 : 90;
  for (let i = 0; i < 3; i++) { const q = box(); view.scale = Math.max(3, Math.min(60, view.scale * Math.min((view.w - 16) / Math.max(1, q.x1 - q.x0), (view.h - mT - mB) / Math.max(1, q.y1 - q.y0)))); }
  const q = box(); view.px = view.w / 2 - (q.x0 + q.x1) / 2; view.py = mT + (view.h - mT - mB) / 2 - (q.y0 + q.y1) / 2;
  return true;
}
export function resize(canvas) {
  const r = canvas.parentElement.getBoundingClientRect();
  view.dpr = Math.max(1, Math.min(gfxHi() ? 3 : 2.5, window.devicePixelRatio || 1) * resScale);
  view.w = r.width; view.h = r.height;
  canvas.width = Math.round(r.width * view.dpr); canvas.height = Math.round(r.height * view.dpr);
}
// Resolución dinámica: si los fotogramas tardan demasiado baja la resolución del lienzo (móvil/iPad/PC flojo); si sobra potencia la sube
let resScale = 1, slow = 0, fast = 0;
export function adaptRes(ms) {
  if (ms > 30) { slow++; fast = 0; } else if (ms < 17) { fast++; slow = 0; } else { slow = fast = 0; }
  if (slow >= 12 && resScale > 0.55) { resScale = Math.max(0.55, resScale - 0.15); slow = 0; return true; }
  if (fast >= 240 && resScale < 1) { resScale = Math.min(1, resScale + 0.15); fast = 0; return true; }
  return false;
}
export function zoomAt(sx, sy, f) {
  const before = s2w({ x: sx, y: sy });
  view.scale = Math.max(3, Math.min(170, view.scale * f)); // tope alto: permite ver las miniaturas de cerca
  const after = w2s(before);
  view.px += sx - after.x; view.py += sy - after.y;
}
export function focus(p, minScale = 14) {
  view.scale = Math.max(view.scale, minScale);
  const s = w2s(p);
  view.px += view.w / 2 - s.x; view.py += view.h / 2 - s.y;
}

export function unitAt(s, p, filter = () => true) {
  const list = hideFl(s).units.filter((u) => u.models > 0 && filter(u));
  for (let i = list.length - 1; i >= 0; i--) {
    const u = list[i]; const { w, d } = dims(u);
    const dx = p.x - u.x, dy = p.y - u.y, c = Math.cos(u.face), sn = Math.sin(u.face);
    const lx = dx * c + dy * sn, ly = -dx * sn + dy * c;
    const pad = Math.max(0, (2.2 - Math.min(w, d)) / 2);
    if (Math.abs(lx) <= d / 2 + pad && Math.abs(ly) <= w / 2 + pad) return u;
  }
  return null;
}

const col = (s, owner) => FACTIONS[s.factions[owner]];
function hash(n) { let x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawTable(ctx, s, UI) {
  const g = ctx.createLinearGradient(0, 0, 0, TH); g.addColorStop(0, '#34452a'); g.addColorStop(1, '#2a3a22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, TW, TH);
  ctx.strokeStyle = 'rgba(255,255,255,.045)'; ctx.lineWidth = 0.06;
  ctx.beginPath();
  for (let x = 6; x < TW; x += 6) { ctx.moveTo(x, 0); ctx.lineTo(x, TH); }
  for (let y = 6; y < TH; y += 6) { ctx.moveTo(0, y); ctx.lineTo(TW, y); }
  ctx.stroke();
  // zonas de despliegue
  const zone = (owner) => {
    const c = col(s, owner), z = s.zones[owner];
    ctx.fillStyle = c.color + (s.phase === 'deploy' ? '33' : '14'); ctx.strokeStyle = c.color + '99'; ctx.setLineDash([0.8, 0.8]); ctx.lineWidth = 0.1;
    if (z.poly || z.excl) {
      ctx.save(); ctx.beginPath();
      if (z.poly) z.poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))), ctx.closePath(); else ctx.rect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0);
      if (z.excl) { ctx.moveTo(z.excl.x + z.excl.r, z.excl.y); ctx.arc(z.excl.x, z.excl.y, z.excl.r, 0, Math.PI * 2, true); }
      ctx.fill('evenodd'); ctx.stroke(); ctx.restore();
    } else { ctx.fillRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0); ctx.strokeRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0); }
    ctx.setLineDash([]);
  };
  if (s.winter) { ctx.fillStyle = 'rgba(160,135,95,0.3)'; ctx.fillRect(0, TH / 2 - 3, TW, 6); }
  zone(0); zone(1);
  if (s.flankZ && s.phase === 'deploy') for (const o of [0, 1]) for (const z of Object.values(s.flankZ[o])) { const c = col(s, o); ctx.fillStyle = c.color + '22'; ctx.fillRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0); ctx.strokeStyle = c.color + '99'; ctx.setLineDash([0.4, 0.6]); ctx.lineWidth = 0.1; ctx.strokeRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0); ctx.setLineDash([]); }
  for (const V of s.vortex || []) { ctx.strokeStyle = '#c79bff'; ctx.lineWidth = 0.2; ctx.fillStyle = 'rgba(199,155,255,.28)'; ctx.beginPath(); ctx.arc(V.x, V.y, 1.5, 0, 7); ctx.fill(); ctx.stroke(); }
  for (const F of s.fanatics || []) { ctx.fillStyle = '#5a4b2a'; ctx.strokeStyle = '#d9c26a'; ctx.lineWidth = 0.15; ctx.beginPath(); ctx.arc(F.x, F.y, 0.5, 0, 7); ctx.fill(); ctx.stroke(); }
  if (s.dust) { ctx.fillStyle = 'rgba(190,160,110,.45)'; ctx.strokeStyle = '#b8955a'; ctx.lineWidth = 0.15; ctx.beginPath(); ctx.arc(s.dust.x, s.dust.y, s.dust.r, 0, 7); ctx.fill(); ctx.stroke(); }
  for (const L of s.locs || []) { ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = 0.2; ctx.fillStyle = 'rgba(255,215,106,.18)'; ctx.beginPath(); ctx.arc(L.x, L.y, 1.6, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(L.x, L.y, 0.4, 0, 7); ctx.fillStyle = '#ffd76a'; ctx.fill(); }
  for (const b of s.bags || []) if (!b.dead) { ctx.save(); ctx.translate(b.x, b.y); ctx.fillStyle = col(s, b.owner).color; ctx.globalAlpha = 0.85; ctx.fillRect(-2, -1, 4, 2); ctx.globalAlpha = 1; ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 0.15; ctx.strokeRect(-2, -1, 4, 2); ctx.fillStyle = '#2a1a0a'; ctx.beginPath(); ctx.arc(-1, 1.1, 0.4, 0, 7); ctx.arc(1, 1.1, 0.4, 0, 7); ctx.fill(); ctx.restore(); }
  if (s.sec === 'dom') { ctx.strokeStyle = 'rgba(255,215,106,.4)'; ctx.setLineDash([1, 1]); ctx.lineWidth = 0.12; ctx.beginPath(); ctx.moveTo(TW / 2, 0); ctx.lineTo(TW / 2, TH); ctx.moveTo(0, TH / 2); ctx.lineTo(TW, TH / 2); ctx.stroke(); ctx.setLineDash([]); }
  ctx.strokeStyle = '#cfa94a'; ctx.lineWidth = 0.22; ctx.strokeRect(0, 0, TW, TH);
}

function drawTerrain(ctx, t) {
  if (t.kind === 'vortex') return;
  if (t.kind === 'deco' && t.piece === 'road') { ctx.fillStyle = 'rgba(160,128,86,.45)'; ctx.fillRect(t.x - t.w / 2, t.y - t.h / 2, t.w, t.h); return; }
  ctx.save(); ctx.translate(t.x, t.y); if (t.rot) ctx.rotate(t.rot);
  if (t.kind === 'forest') {
    ctx.fillStyle = 'rgba(20,46,22,.78)'; rr(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 1.6); ctx.fill();
    ctx.strokeStyle = 'rgba(120,180,90,.55)'; ctx.lineWidth = 0.12; ctx.setLineDash([0.5, 0.4]); ctx.stroke(); ctx.setLineDash([]);
    const n = Math.round(t.w * t.h / 4.2);
    for (let i = 0; i < n; i++) {
      const x = (hash(i * 3 + t.x) - 0.5) * (t.w - 1.2), y = (hash(i * 7 + t.y) - 0.5) * (t.h - 1.2), r = 0.45 + hash(i) * 0.4;
      ctx.fillStyle = `rgba(${40 + hash(i + 2) * 30 | 0},${96 + hash(i + 5) * 40 | 0},${40 + hash(i + 9) * 20 | 0},.95)`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
  } else if (t.look && DLOOKS[t.look]) {
    const lk = DLOOKS[t.look]; ctx.fillStyle = lk[0]; rr(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 0.6); ctx.fill();
    ctx.strokeStyle = lk[1]; ctx.lineWidth = 0.12; ctx.setLineDash([0.5, 0.4]); ctx.stroke(); ctx.setLineDash([]);
  } else if (t.kind === 'hill' || t.kind === 'swamp') {
    const hl = t.kind === 'hill';
    ctx.fillStyle = hl ? 'rgba(122,98,62,.85)' : 'rgba(48,86,84,.85)'; rr(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 2); ctx.fill();
    ctx.strokeStyle = hl ? 'rgba(200,170,110,.6)' : 'rgba(120,200,190,.55)'; ctx.lineWidth = 0.12; ctx.setLineDash([0.5, 0.4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = hl ? 'rgba(60,45,25,.6)' : 'rgba(150,220,210,.45)'; ctx.lineWidth = 0.1;
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); if (hl) ctx.ellipse(0, 0, t.w / 2 - k * 0.7, t.h / 2 - k * 0.55, 0, 0, 7); else { ctx.moveTo(-t.w / 2 + 0.8, -t.h / 2 + k * 1.1); ctx.quadraticCurveTo(0, -t.h / 2 + k * 1.1 + 0.7, t.w / 2 - 0.8, -t.h / 2 + k * 1.1); } ctx.stroke(); }
  } else {
    ctx.fillStyle = '#6d6a60'; ctx.fillRect(-t.w / 2, -t.h / 2, t.w, t.h);
    ctx.fillStyle = '#85816f'; ctx.fillRect(-t.w / 2 + .25, -t.h / 2 + .25, t.w - .5, t.h - .5);
    ctx.strokeStyle = '#4b483f'; ctx.lineWidth = 0.1;
    for (let x = -t.w / 2; x < t.w / 2; x += 1.2) { ctx.beginPath(); ctx.moveTo(x, -t.h / 2); ctx.lineTo(x, t.h / 2); ctx.stroke(); }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-t.w / 2, t.h / 2 - .35, t.w, .35);
  }
  ctx.restore();
}

function unitRectPath(ctx, u) { const { w, d } = dims(u); ctx.rect(-d / 2, -w / 2, d, w); }

function drawUnitBody(ctx, s, u, { alpha = 1, ghost = false, ok = true, bad = false } = {}) {
  const f = col(s, u.owner), { w, d, ranks, files, sp: sp2 } = dims(u), data = D(u), spc = sp2 || 0;
  ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(u.face); ctx.globalAlpha = alpha;
  // sombra
  if (!ghost) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-d / 2 + .15, -w / 2 + .2, d, w); }
  const base = ghost ? (ok ? '#6cbf5a' : '#c24a3f') : f.color;
  ctx.fillStyle = ghost ? base + '55' : base + (u.fleeing ? '88' : 'cc');
  ctx.beginPath(); unitRectPath(ctx, u); ctx.fill();
  // modelos
  const bw = u.baseW / 25.4, bd = u.baseD / 25.4, r = Math.min(bw, bd) * 0.38;
  ctx.fillStyle = ghost ? 'rgba(255,255,255,.5)' : data.cat === 'cav' ? '#f2ead0' : data.cat === 'mach' ? '#d9c08a' : 'rgba(10,12,6,.55)';
  let placed = 0;
  for (let rk = 0; rk < ranks && placed < u.models; rk++) {
    const inRank = Math.min(files, u.models - placed);
    for (let i = 0; i < inRank; i++) {
      const x = d / 2 - (rk + 0.5) * bd - rk * spc, y = (i - (inRank - 1) / 2) * (bw + spc);
      if (data.cat === 'cav') { ctx.beginPath(); ctx.ellipse(x, y, bd * .36, bw * .3, 0, 0, 7); ctx.fill(); }
      else if (data.cat === 'mach') { ctx.fillRect(x - bd * .3, y - bw * .3, bd * .6, bw * .6); }
      else { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      placed++;
    }
  }
  // borde y frente
  ctx.lineWidth = 0.16; ctx.strokeStyle = ghost ? base : f.accent; ctx.beginPath(); unitRectPath(ctx, u); ctx.stroke();
  ctx.lineWidth = 0.42; ctx.strokeStyle = ghost ? base : f.accent; ctx.beginPath(); ctx.moveTo(d / 2, -w / 2); ctx.lineTo(d / 2, w / 2); ctx.stroke();
  // flecha
  ctx.fillStyle = f.accent; ctx.beginPath(); ctx.moveTo(d / 2 + 0.9, 0); ctx.lineTo(d / 2 + 0.1, -0.55); ctx.lineTo(d / 2 + 0.1, 0.55); ctx.closePath(); ctx.globalAlpha = alpha * 0.9; ctx.fill();
  ctx.restore();
}

// v843q (punto 5): etiquetas de papel «Atacante» / «Objetivo» (selección y resolución de disparo, hechizo, carga)
function roleTag(ctx, x, y, txt, fill, fs) {
  ctx.save(); ctx.font = `800 ${fs * 1.05}px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(txt).width + 14, h = fs * 1.6; ctx.fillStyle = fill; rr(ctx, x - tw / 2, y - h / 2, tw, h, h / 2); ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = '#fff6d6'; ctx.stroke(); ctx.fillStyle = '#1b1306'; ctx.fillText(txt, x, y + 0.5); ctx.restore();
}
const ROLE_ATK = { shoot: 'Atacante', cast: 'Lanzador', charge: 'Cargador' };
function atkInfo(UI) { // atacante y objetivos a resaltar: modo de selección o resolución en curso (ventana de tiradas)
  const m = UI.mode; if (m && ROLE_ATK[m.k] && m.id != null) return { id: m.id, role: ROLE_ATK[m.k], tg: UI.targets || [] };
  if (UI.atkHi && UI.atkHi.atk != null) return { id: UI.atkHi.atk, role: UI.atkHi.role || 'Atacante', tg: UI.atkHi.tgt != null ? [UI.atkHi.tgt] : [], res: true, tgRole: UI.atkHi.tgRole };
  return null;
}
function drawRing(ctx, u, color, width = 0.28, pad = 0.5, dash = null) {
  const { w, d } = dims(u);
  ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(u.face); ctx.lineWidth = width; ctx.strokeStyle = color;
  if (dash) ctx.setLineDash(dash);
  rr(ctx, -d / 2 - pad, -w / 2 - pad, d + pad * 2, w + pad * 2, 0.7); ctx.stroke(); ctx.restore();
}

// Puntos intermedios del recorrido del fantasma (giros de ala: la línea sigue el arco del pivote)
const viaOf = (g, b) => { const v = (g && g.path) || []; return v.length && Math.hypot(v[v.length - 1].x - b.x, v[v.length - 1].y - b.y) < 0.02 ? v.slice(0, -1) : v; };
function arrow(ctx, a, b, color, width = 0.28, dash = null, head = 1.1, via = []) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); for (const q of via) ctx.lineTo(q.x, q.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
  if (via.length) a = via[via.length - 1];
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - Math.cos(ang - .4) * head, b.y - Math.sin(ang - .4) * head); ctx.lineTo(b.x - Math.cos(ang + .4) * head, b.y - Math.sin(ang + .4) * head); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawRival(ctx, s, UI, t) {
  if (!UI.showRival || !UI.rival) return;
  const pulse = 0.55 + 0.25 * Math.sin(t / 350);
  const amber = '#ffcf5a', rc = col(s, UI.rival.owner).color;
  const touched = new Set();
  UI.rival.events.forEach((e, idx) => {
    const hot = UI.focusEv === idx;
    const lw = hot ? 0.5 : 0.3;
    if (e.k === 'move' || e.k === 'charge') {
      const u = byId(s, e.id); if (!u) return;
      touched.add(u.id);
      ctx.save(); ctx.globalAlpha = 0.35; ctx.setLineDash([0.6, 0.5]);
      ctx.translate(e.from.x, e.from.y); ctx.rotate(e.from.face ?? u.face); const { w, d } = dims(u);
      ctx.strokeStyle = rc; ctx.lineWidth = 0.2; ctx.fillStyle = rc + '33'; ctx.beginPath(); ctx.rect(-d / 2, -w / 2, d, w); ctx.fill(); ctx.stroke(); ctx.restore();
      arrow(ctx, e.from, e.to, e.k === 'charge' ? (e.ok ? '#ff6a5a' : '#ff9a8f') : amber, lw, e.k === 'charge' && !e.ok ? [0.5, 0.5] : null);
    } else if (e.k === 'shoot' || (e.k === 'cast')) {
      if (!e.from) return;
      const c = fxCol(e);
      arrow(ctx, e.from, e.to, c, lw, [0.7, 0.5]);
      const tu = byId(s, e.target); if (tu) touched.add(tu.id);
      ctx.fillStyle = c; ctx.globalAlpha = pulse; ctx.beginPath(); ctx.arc(e.to.x, e.to.y, 1.1, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    } else if (e.k === 'combat') {
      ctx.strokeStyle = '#ff6a5a'; ctx.lineWidth = lw; ctx.globalAlpha = pulse + 0.2; ctx.beginPath(); ctx.arc(e.at.x, e.at.y, 2.4, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    } else if (e.k === 'flee') {
      const u = byId(s, e.id); if (u && e.from) { arrow(ctx, e.from, { x: u.x, y: u.y }, '#9fb4ff', lw, [0.4, 0.4]); touched.add(u.id); }
    } else if (e.k === 'destroy') {
      ctx.strokeStyle = '#ff6a5a'; ctx.lineWidth = 0.45; const p = { x: e.x, y: e.y };
      ctx.beginPath(); ctx.moveTo(p.x - 1.4, p.y - 1.4); ctx.lineTo(p.x + 1.4, p.y + 1.4); ctx.moveTo(p.x + 1.4, p.y - 1.4); ctx.lineTo(p.x - 1.4, p.y + 1.4); ctx.stroke();
    }
  });
  for (const id of touched) { const u = byId(s, id); if (u && u.models > 0) drawRing(ctx, u, amber, 0.3, 0.45, [0.9, 0.5]); }
}

const hex3 = (h) => { const n = parseInt(h.slice(1, 7), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
function t3gl(s, UI, t) {
  const B = new Map();
  const add = (id, x, y, z, yaw, sx, sy, sz, a, tint, mix) => { let o = B.get(id); if (!o) { o = []; B.set(id, o); } o.push(x, y, z, yaw, sx, sy, sz, a, tint[0], tint[1], tint[2], mix); };
  const W1 = [1, 1, 1];
  add('table', TW / 2, TH / 2, 0, 0, TH, 1, TW, 1, W1, 0);
  // mesa de madera maciza bajo el tapete y canto oscuro del tapete (como en Tabletop Simulator)
  add('woodtable', TW / 2, TH / 2, -4.8, 0, TH + 26, 4.0, TW + 30, 1, W1, 0);
  const rim = [0.07, 0.075, 0.085];
  add('boxteam', TW / 2, -0.35, -0.4, 0, 0.7, 0.42, TW + 1.4, 1, rim, 2); add('boxteam', TW / 2, TH + 0.35, -0.4, 0, 0.7, 0.42, TW + 1.4, 1, rim, 2);
  add('boxteam', -0.35, TH / 2, -0.4, 0, TH, 0.42, 0.7, 1, rim, 2); add('boxteam', TW + 0.35, TH / 2, -0.4, 0, TH, 0.42, 0.7, 1, rim, 2);
  const alphaB = new Map(); const addA = (id, ...r) => { let o = alphaB.get(id); if (!o) { o = []; alphaB.set(id, o); } o.push(...r); };
  const lateB = new Map(); const addL = (id, ...r) => { let o = lateB.get(id); if (!o) { o = []; lateB.set(id, o); } o.push(...r); }; // v843h: translúcidos (etéreos) que se dibujan DESPUÉS de lo sólido: antes iban con las sombras, antes de las peanas, y la peana (opaca, sin que la figura escribiera profundidad) tapaba su mitad inferior
  const solid0 = [];
  const zone = (owner) => { const c = hex3(col(s, owner).color), z = s.zones[owner];
    if (z.poly || z.excl) { for (let y = z.y0; y < z.y1 - 1e-6; y += 1) { const ym = y + 0.5; let xs = [z.x0, z.x1]; if (z.poly) { const V = z.poly, X = []; V.forEach((a, i) => { const b = V[(i + 1) % V.length]; if ((a.y > ym) !== (b.y > ym)) X.push(a.x + (ym - a.y) * (b.x - a.x) / (b.y - a.y)); }); if (X.length < 2) continue; xs = [Math.min(...X), Math.max(...X)]; } const segs = [xs]; if (z.excl) { const dy = ym - z.excl.y; if (Math.abs(dy) < z.excl.r) { const h = Math.sqrt(z.excl.r ** 2 - dy * dy), l = z.excl.x - h, r = z.excl.x + h; segs.length = 0; if (l > xs[0]) segs.push([xs[0], Math.min(l, xs[1])]); if (r < xs[1]) segs.push([Math.max(r, xs[0]), xs[1]]); } } for (const [a, b] of segs) if (b - a > 0.05) addA('boxteam', (a + b) / 2, ym, 0.03, 0, 1, 0.02, b - a, s.phase === 'deploy' ? 0.17 : 0.06, c[0], c[1], c[2], 2); } return; }
    addA('boxteam', (z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, 0.03, 0, z.y1 - z.y0, 0.02, z.x1 - z.x0, s.phase === 'deploy' ? 0.17 : 0.06, c[0], c[1], c[2], 2); };
  if (s.stirDep) { for (let z = 0; z < 6; z++) { const o = s.stirDep.occ[z], c = o === undefined ? [0.75, 0.75, 0.75] : hex3(col(s, o).color), cx = (z % 3) * 24 + 12, cy = Math.floor(z / 3) * 24 + 12; addA('boxteam', cx, cy, 0.03, 0, 23.6, 0.02, 23.6, s.stirDep.phase === 'units' ? 0.16 : 0.07, c[0], c[1], c[2], 2); } } else { zone(0); zone(1); }
  if (s.winter) addA('boxteam', TW / 2, TH / 2, 0.025, 0, 6, 0.02, TW, 0.4, 0.62, 0.5, 0.35, 2);
  if (s.flankZ && s.phase === 'deploy') for (const o of [0, 1]) for (const z of Object.values(s.flankZ[o])) { const c = hex3(col(s, o).color); addA('boxteam', (z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, 0.03, 0, z.y1 - z.y0, 0.02, z.x1 - z.x0, 0.2, c[0], c[1], c[2], 2); }
  for (const V of s.vortex || []) addA('boxteam', V.x, V.y, 0.07, 0, 3, 0.3, 3, 0.6, 0.78, 0.6, 1, 2);
  for (const F of s.fanatics || []) addA('boxteam', F.x, F.y, 0.5, 0, 1, 1.0, 1, 0.35, 0.3, 0.2, 1, 2);
  for (const L of s.locs || []) addA('boxteam', L.x, L.y, 0.06, 0, 2.6, 0.25, 2.6, 0.85, 1, 0.84, 0.4, 2);
  for (const b of s.bags || []) if (!b.dead) { const c = hex3(col(s, b.owner).color); solid0.push(['boxteam', b.x, b.y, 0.05, 0, 2, 0.9, 4, 1, c[0], c[1], c[2], 2]); }
  if (s.sec === 'dom') { addA('boxteam', TW / 2, TH / 2, 0.06, 0, TH, 0.02, 0.15, 0.5, 1, 0.84, 0.4, 2); addA('boxteam', TW / 2, TH / 2, 0.06, 0, 0.15, 0.02, TW, 0.5, 1, 0.84, 0.4, 2); }
  const solid = solid0;
  // escenografía real del mod (paquetes Unity): encaja el modelo en una caja alto x ancho (pulgadas)
  const scn = (id, x, y, hh, ww, yaw) => { const r = gl3.reg['m:s_' + id]; if (!r) return false; const k = Math.min(hh / Math.max(r.h, 1e-6), ww / Math.max(r.w, 1e-6)); solid.push(['m:s_' + id, x, y, 0.02, yaw, k, k, k, 1, 1, 1, 1, 0]); return true; };
  const hasScn = glHas('s_oak');
  // piezas extra del mod (paquete 'terrain'): ruinas A/C/D/E, escombros, santuarios, mercado, cristal, etc.
  const scnx = (id, x, y, hh, ww, yaw) => { glExt(id, 'terrain'); const r = gl3.reg['m:x_' + id]; if (!r) return false; const k = Math.min(hh / Math.max(r.h, 1e-6), ww / Math.max(r.w, 1e-6)); solid.push(['m:x_' + id, x, y, 0.02, yaw, k, k, k, 1, 1, 1, 1, 0]); return true; };
  const DECO = { bazaar1: ['t_bazaar1', 4.2], bazaar2: ['t_bazaar2', 3.6], bazaar3: ['t_bazaar3', 2.6], loonshrine: ['t_loonshrine', 6], crystal: ['t_crystal', 6], dais: ['t_dais', 3], dragondais: ['t_dragondais', 6], stormvault: ['t_stormvault', 3], cairn: ['t_cairn1', 1.6], wyldwood: ['t_wyldwood', 7], rubble: ['t_rubble', 0.5], venom: ['t_venom', 3] };
  // Emboscada subterránea: marcadores de Mina (solo los ve su dueño): montón de escombros y anillo de tierra
  if (s.mines && UI.viewer != null) for (const mk of s.mines[UI.viewer] || []) {
    if (!scnx('t_rubble', mk.x, mk.y, 1.1, 3.2, 0.7)) solid.push(['boxteam', mk.x, mk.y, 0, 0.3, 2.2, 0.5, 2.2, 1, 0.35, 0.27, 0.2, 2]);
    addA('shadow', mk.x, mk.y, 0.05, 0, 3.4, 1, 3.4, 0.5, 0.9, 0.7, 0.2, 2);
  }
  for (const lu of s.units.flatMap((h) => [h, ...(h.joined || [])])) if (lu.leerPos && lu.models > 0) { addA('shadow', lu.leerPos.x, lu.leerPos.y, 0.05, 0, 3, 1, 3, 0.7, 0.3, 0.9, 0.5, 2); solid.push(['boxteam', lu.leerPos.x, lu.leerPos.y, 0, 0.3, 0.8, 2.4, 0.8, 0.7, 0.3, 0.9, 1, 2]); } // Espíritu Mirón (marcador de Kralmaw)
  for (const tr of s.terrain) {
    if (tr.kind === 'vortex') { addA('boxteam', tr.x, tr.y, 0.08, 0, 3, 0.4, 3, 0.55, 0.55, 0.85, 1, 2); continue; }
    if (tr.column) { solid.push(['boxteam', tr.x, tr.y, 0, 0.6, 2.2, 3.2, 2.2, 1, 0.75, 0.9, 1, 2]); solid.push(['boxteam', tr.x + 0.9, tr.y + 0.6, 0, 0.2, 1.4, 2.2, 1.4, 1, 0.7, 0.85, 1, 2]); continue; }
    if (tr.kind === 'deco' && tr.piece === 'road') { addA('boxteam', tr.x, tr.y, 0.06, 0, tr.h, 0.04, tr.w, 0.62, 0.5, 0.34, 0.6, 2); continue; }
    if (tr.pillar) { if (!scn('obelisk', tr.x, tr.y, 6.5, 2.2, 0)) solid.push(['box', tr.x, tr.y, 0, 0, tr.h, 6, tr.w, 0.8, 0.75, 0.7, 1, 0]); continue; }
    if (tr.kind === 'deco') { const dd = DECO[tr.piece] || DECO.rubble; scnx(dd[0], tr.x, tr.y, dd[1], Math.max(tr.w, tr.h), tr.rot || 0); continue; }
    if (tr.kind === 'forest') {
      if (glHas('t_wood')) {
        const nx = Math.max(1, Math.round(tr.w / 6)), ny = Math.max(1, Math.round(tr.h / 6)), cw = tr.w / nx, ch = tr.h / ny;
        for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) solid.push(['m:t_wood', tr.x - tr.w / 2 + (a + 0.5) * cw, tr.y - tr.h / 2 + (b + 0.5) * ch, 0.02, 0, cw / 10.13, 1, ch / 9.99, 1, 1, 1, 1, 0]);
      } else
      addA('boxteam', tr.x, tr.y, 0.05, 0, tr.h, 0.03, tr.w, 0.85, 0.1, 0.24, 0.1, 2);
      if (hasScn) {
        const n = Math.max(3, Math.round(tr.w * tr.h / 7)), TREES = ['oak', 'elm', 'broad', 'elm'], BUSH = ['shrub', 'bush', 'bush2'];
        for (let i = 0; i < n; i++) { const x = tr.x + (hash(i * 3 + tr.x) - 0.5) * (tr.w - 1.6), y = tr.y + (hash(i * 7 + tr.y) - 0.5) * (tr.h - 1.6), k = 0.85 + hash(i) * 0.35; scn(TREES[Math.floor(hash(i * 11 + tr.y) * TREES.length)], x, y, 4.2 * k, 3.4 * k, hash(i + 3) * 6.28); }
        if (tr.w * tr.h >= 36) scnx('t_wyldwood', tr.x, tr.y, 6.5, Math.min(tr.w, tr.h) * 0.8, hash(tr.x) * 6.28);
        const nb = Math.round(n * 0.8);
        for (let i = 0; i < nb; i++) { const x = tr.x + (hash(i * 13 + tr.x + 1) - 0.5) * (tr.w - 0.8), y = tr.y + (hash(i * 17 + tr.y + 1) - 0.5) * (tr.h - 0.8); scn(BUSH[i % 3], x, y, 0.9, 1.6, hash(i + 9) * 6.28); }
        continue;
      }
      const n = Math.round(tr.w * tr.h / 3.2);
      for (let i = 0; i < n; i++) { const x = tr.x + (hash(i * 3 + tr.x) - 0.5) * (tr.w - 1.2), y = tr.y + (hash(i * 7 + tr.y) - 0.5) * (tr.h - 1.2), k = 0.85 + hash(i) * 0.7; solid.push(['tree', x, y, 0, hash(i + 3) * 6, k, k * (0.9 + hash(i + 8) * 0.5), k, 1, 1, 1, 1, 0]); }
    } else if (tr.kind === 'hill' || tr.kind === 'swamp') {
      const id = 't_' + tr.kind;
      if (hasScn) {
        if (tr.kind === 'hill') { const RK = ['t_rockA', 't_rockB', 't_rockC', 't_rockD', 't_rockE', 't_rockF']; for (let i = 0; i < 4; i++) scnx(RK[Math.floor(hash(i * 7 + tr.x * 3 + tr.y) * RK.length)], tr.x + (hash(i * 11 + tr.x) - 0.5) * tr.w * 0.7, tr.y + (hash(i * 13 + tr.y) - 0.5) * tr.h * 0.7, 0.9, 1.2 + hash(i + tr.y) * 1.2, hash(i + tr.x) * 6.28); }
        if (tr.kind === 'hill') { scnx('t_cairn1', tr.x + tr.w * 0.18, tr.y - tr.h * 0.12, 1.5, 1.5, hash(tr.y)); scnx('t_cairn2', tr.x - tr.w * 0.2, tr.y + tr.h * 0.15, 1.2, 1.6, hash(tr.x)); } else for (let i = 0; i < 2; i++) scnx('t_venom', tr.x + (hash(i * 4 + tr.x) - 0.5) * tr.w * 0.6, tr.y + (hash(i * 6 + tr.y) - 0.5) * tr.h * 0.6, 1.6, 2.4, hash(i + tr.x) * 6.28);
        if (tr.kind === 'hill') for (let i = 0; i < 2; i++) scn(i ? 'rock2' : 'rock1', tr.x + (hash(i * 5 + tr.x) - 0.5) * tr.w * 0.5, tr.y + (hash(i * 9 + tr.y) - 0.5) * tr.h * 0.5, i ? 0.9 : 1.4, 1.6, hash(i + tr.x) * 6.28);
        else { const P = ['swplant', 'swgrass', 'swamptree', 'swgrass', 'swplant']; for (let i = 0; i < 5; i++) scn(P[i], tr.x + (hash(i * 5 + tr.x) - 0.5) * (tr.w - 1), tr.y + (hash(i * 9 + tr.y) - 0.5) * (tr.h - 1), P[i] === 'swamptree' ? 2.2 : 1.1, 2, hash(i + tr.y) * 6.28); }
      }
      if (glHas(id)) { const rg = gl3.reg['m:' + id]; solid.push(['m:' + id, tr.x, tr.y, 0.02, 0, tr.w / (tr.kind === 'hill' ? 7.62 : 5.34) * 1.15, 1, tr.h / (tr.kind === 'hill' ? 8.74 : 8.3) * 1.15, 1, 1, 1, 1, 0]); }
      else addA('boxteam', tr.x, tr.y, 0.05, 0, tr.h, 0.05, tr.w, 0.85, tr.kind === 'hill' ? 0.45 : 0.2, tr.kind === 'hill' ? 0.36 : 0.4, tr.kind === 'hill' ? 0.22 : 0.38, 2);
    } else if (tr.kind === 'building' && (!tr.special || tr.tower || tr.dark)) {
      if (!(glHas('s_houses2') && scn('houses2', tr.x, tr.y, 3.6, Math.max(tr.w, tr.h) * 1.1, tr.rot || 0))) solid.push(['house', tr.x, tr.y, 0, tr.rot || 0, tr.h, 3.4, tr.w, 1, 1, 1, 1, 0]);
      const gu = s.units.find((v) => v.garrison === tr.id && v.models > 0); // guarnición: estandarte con el color del ocupante en el tejado
      if (gu) { const c = hex3(col(s, gu.owner).color); solid.push(['box', tr.x, tr.y, 3.3, 0, 0.08, 1.6, 0.08, 1, 0.3, 0.22, 0.14, 0]); solid.push(['boxteam', tr.x, tr.y + 0.35, 4.3, 0, 0.04, 0.5, 0.7, 1, c[0], c[1], c[2], 2]); }
    } else if (tr.kind === 'wall') {
      solid.push([tr.w >= tr.h ? 'stonewall' : 'stonewall', tr.x, tr.y, 0, tr.w >= tr.h ? 0 : Math.PI / 2, Math.min(tr.w, tr.h), 0.8, Math.max(tr.w, tr.h), 1, 1, 1, 1, 0]);
    } else {
      if (tr.special && scnx('t_ruinE', tr.x, tr.y, 4, tr.w * 1.1, 0)) { scnx('t_crystal', tr.x, tr.y, 3.4, 2.6, 0); scnx('t_rubble', tr.x - tr.w * 0.35, tr.y + 0.8, 0.5, 1.4, 1); scnx('t_rubble', tr.x + tr.w * 0.3, tr.y - 0.8, 0.5, 1.4, 2); continue; }
      if (tr.kind === 'ruin' && !tr.special) {
        const V = ['t_ruinA', 't_ruinD', 't_ruinE', 't_ruinA2', 't_ruinAf'], vi = Math.floor(hash(tr.x * 3 + tr.y) * V.length), yw = tr.w >= tr.h ? 0 : Math.PI / 2;
        if (scnx(V[vi], tr.x, tr.y, 4, Math.max(tr.w, tr.h) * 0.95, yw)) { scnx(vi % 2 ? 't_rockB' : 't_rockF', tr.x + (hash(tr.x) - 0.5) * tr.w * 0.6, tr.y + 1.1, 0.5, 1.2, hash(tr.y) * 6.28); scnx('t_rubble', tr.x + Math.max(tr.w, tr.h) * 0.4, tr.y + 0.7, 0.4, 1.3, hash(tr.x)); scnx('t_rubble', tr.x - Math.max(tr.w, tr.h) * 0.4, tr.y - 0.7, 0.4, 1.3, hash(tr.y) * 3); if (vi % 2) scnx('t_ruinC', tr.x, tr.y + 1.2, 2.2, 1.8, yw); continue; }
      }
      if (hasScn && tr.special) { scn('ruinen', tr.x, tr.y, 0.4, tr.w * 1.1, 0); scn('obelisk', tr.x, tr.y, 5.5, tr.w * 0.8, 0); continue; }
      if (hasScn && tr.kind === 'ruin') { const v = Math.floor(hash(tr.x * 3 + tr.y) * 3); const yaw = Math.atan2(0, 1) + (tr.w >= tr.h ? 0 : Math.PI / 2);
        scn('ruinen', tr.x, tr.y, 0.4, Math.max(tr.w, tr.h) * 0.95, yaw);
        if (v === 0) scn('obelisk', tr.x, tr.y, 3.2, 2, yaw); else if (v === 1) scn('bud', tr.x, tr.y, 3.6, Math.min(tr.w, 4), yaw); else { scn('obelisk', tr.x - tr.w * 0.3, tr.y, 2.4, 1.6, yaw); scn('rock2', tr.x + tr.w * 0.3, tr.y, 0.8, 1.4, yaw); }
        continue; }
      if (glHas('t_tower')) { const k = Math.min(tr.w, 7) / 7.57; solid.push(['m:t_tower', tr.x, tr.y, 0, 0, k * 1.1, k * 0.9, k * 1.1, 1, 1, 1, 1, 0]); continue; }
      solid.push(['ruin', tr.x, tr.y, 0, 0, tr.h, 1.5, tr.w, 1, 1, 1, 1, 0]);
      const nn = Math.max(2, Math.round(tr.w / 1.4));
      for (let i = 0; i < nn; i += 2) solid.push(['ruin', tr.x - tr.w / 2 + (i + 0.5) * (tr.w / nn), tr.y - tr.h / 2 + 0.2, 1.5, 0, 0.4, 0.5, tr.w / nn * 0.8, 1, 1, 1, 1, 0]);
    }
  }
  const act = alive(s);
  const flagFor = (u) => { for (const t of [u.type, FIG_ALIAS[u.type]]) if (t && glHas('flag_' + t)) return 'm:flag_' + t; return u.owner >= 0 && s.factions[u.owner] === 'empire' ? 'm:flag_state_halberds' : 'm:flag_orc_boyz'; }; // estandartes propios del mod por unidad; si no hay, genérico del ejército
  for (const u of act) {
    const f = col(s, u.owner), tint = hex3(f.color), data0 = D(u); const data = data0; let { d, ranks, files, sp } = dims(u); sp = sp || 0;
    const bw = u.baseW / 25.4, bd = u.baseD / 25.4, c = Math.cos(u.face), sn = Math.sin(u.face);
    if (u.garrison) continue; // dentro del edificio: sólo se ve su estandarte en el tejado
    const fid0 = glFig(data), rtype = u.mix > 0 ? UNITS[u.type].mixRear.type : null, dataR = rtype ? D({ ...u, view: 'rear' }) : null, fidR = dataR ? glFig(dataR) : null;
    let placed = 0;
    for (let rk = 0; rk < ranks && placed < u.models; rk++) {
      const inRank = Math.min(files, u.models - placed);
      for (let i = 0; i < inRank; i++) {
        const lx = d / 2 - (rk + 0.5) * bd - rk * sp, ly = (i - (inRank - 1) / 2) * (bw + sp);
        const x = u.x + c * lx - sn * ly, y = u.y + sn * lx + c * ly, j = hash(placed * 5 + u.id.length * 17 + u.x);
        solid.push(['base_sq', x, y, 0, u.face, bw * 0.98, 1, bd * 0.98, 1, tint[0], tint[1], tint[2], 1]);
        addA('shadow', x, y, 0.13, u.face, bw * 0.9, 1, bd * 0.9, 0.35, 0, 0, 0, 0);
        const rearM = !!rtype && placed >= u.models - u.mix, ut = rearM ? rtype : u.type, data = rearM ? dataR : data0, fid = rearM ? fidR : fid0;
        const k = (0.97 + j * 0.08) * 1.3 * (FIG_SCALE[ut] || 1);
        const XID = XMODELS[ut] ? ut : XMODELS[FIG_ALIAS[ut]] ? FIG_ALIAS[ut] : null;
        let RM = rmOf(ut) || (XMODELS[ut] ? xRealm(ut, data) : null);
        if (!RM) { RM = rmOf(FIG_ALIAS[ut]) || (XID ? xRealm(XID, data) : null); if (RM) RM = lendRM(ut, data, RM); } // figura prestada por otra unidad (alias): ver lendRM
        const rm = RM && glHas(RM.id) ? gl3.reg['m:' + RM.id] : null;
        if (RM && !rm && /^x_/.test(RM.id) && XMODELS[RM.id.slice(2)]) glExt(RM.id.slice(2), XMODELS[RM.id.slice(2)]);
        // Etéreos (p.ej. el Caballero Verde): figura translúcida y espectral, de color verdoso
        let figH = 1.15; // altura de la figura ya escalada (para dimensionar el estandarte)
        const eth = data.sr.includes('ethereal'), putF = (id, ...r) => { if (eth) { r[7] = 0.55; r[8] = 0.5; r[9] = 1; r[10] = 0.6; r[11] = 2; addL(id, ...r); } else solid.push([id, ...r]); };
        if (rm) {
          // la figura nunca sobresale de su peana más de 1,5 veces su lado mayor (alas, armas, estandartes); la peana no se toca
          const kk = figK(RM, rm, ut, bw, bd); figH = kk * hEff(rm);
          const ya = u.face + figYaw(ut, RM), of = rm.off && data.cat !== 'mach' ? rm.off : null; // centra el cuerpo en la peana (sin tocar el tamaño de la peana ni de la figura)
          const ox = of ? -kk * (of[0] * -Math.sin(ya) + of[1] * Math.cos(ya)) : 0, oy = of ? -kk * (of[0] * Math.cos(ya) + of[1] * Math.sin(ya)) : 0;
          putF('m:' + RM.id, x + ox, y + oy, 0.13 - kk * groundOf(rm), ya, kk, kk, kk, 1, tint[0], tint[1], tint[2], 0);
        } else
        putF(fid, x, y, 0.13, u.face + figYaw(ut, null) + (data.cat === 'mach' ? 0 : (j - 0.5) * 0.25), k, k, k, 1, tint[0], tint[1], tint[2], 1);
        if (eth) addA('shadow', x, y, 0.15, u.face, bw * 1.6, 1, bd * 1.6, 0.3, 0.3, 1, 0.4, 2); // halo verde
        // portaestandarte: bandera en el centro de la primera fila
        if (rk === 0 && i === Math.floor(inRank / 2) && data.cat !== 'mach' && data.cat !== 'char' && u.startModels >= 8 && glHas(flagFor(u).slice(2))) {
          const emp = !/orc|gob|wolf|boar|night/.test(flagFor(u));
          const fk = Math.max(0.7, Math.min(1.8, figH / 1.15)); // v843h: el asta guarda la proporción con la figura (enanos/goblins no llevan un estandarte el doble de alto que ellos; ogros/caballería, uno acorde)
          solid.push([flagFor(u), x - sn * bw * 0.3, y + c * bw * 0.3, 0.13, u.face - Math.PI / 2, fk, 1.1 * fk, fk, 1, tint[0], tint[1], tint[2], emp ? 0 : 2]);
        }
        placed++;
      }
    }
  }
  const draws = [];
  const push = (id, arr, alpha) => { if (arr.length) draws.push({ id, list: new Float32Array(arr), n: arr.length / 12, alpha }); };
  push('woodtable', B.get('woodtable'), false); push('table', B.get('table'), false); push('boxteam', B.get('boxteam'), false);
  for (const [id, arr] of alphaB) push(id, arr, true);
  const sb = new Map(); for (const r of solid) { const id = r[0]; if (!sb.has(id)) sb.set(id, []); sb.get(id).push(...r.slice(1)); }
  for (const [id, arr] of sb) push(id, arr, false);
  for (const [id, arr] of lateB) push(id, arr, true);
  const cam = t3cam();
  glDraw(cam, view, C0, draws, view.dpr);
  void UI; void t;
}
// v843h: medidas de escala de una figura. wEff: lado mayor SIN alas/lanzas (a lo sumo 1,4 veces el cuerpo; así un pegaso/grifo/águila con las alas abiertas no encoge el cuerpo hasta la mitad); hEff: altura sin la punta de astas/estandartes finos (percentil 98 de los vértices, como mucho 1,3 veces)
const wEff = (rm) => (rm.core ? Math.min(rm.w, Math.max(rm.core * 1.4, 1e-6)) : rm.w);
const hEff = (rm) => (rm.h98 ? Math.min(rm.h, Math.max(rm.h98 * 1.3, 1e-6)) : rm.h);
// apoyo: si el 1 % inferior de los vértices cuelga más de un 4,5 % de la altura por debajo del cuerpo (arañas, linternas, caballero verde), la figura se baja para que el cuerpo toque la peana
const groundOf = (rm) => (rm.p1 && rm.h && rm.p1 / rm.h > 0.045 ? rm.p1 * 0.9 : 0);
// escala final de una figura: por altura o por cuerpo, sin pasar de 1,5 veces el lado mayor de su peana (anchura) ni de su altura máxima HMAX
const figK = (RM, rm, ut, bw, bd) => {
  const base = Math.max(bw, bd); let kk = Math.min(RM.size / Math.max(RM.by === 'h' ? hEff(rm) : wEff(rm), 1e-6) * (FIG_SCALE[ut] || 1), 1.5 * base / Math.max(rm.w, 1e-6));
  const hm = HMAX[ut] || HMAX[FIG_ALIAS[ut]]; if (hm) kk = Math.min(kk, hm / Math.max(hEff(rm), 1e-6));
  return kk;
};
const rmOf = (k) => (REALM[k] ? (XMODELS[k] ? { ...REALM[k], id: 'x_' + k } : XMODELS[REALM[k].id] ? { ...REALM[k], id: 'x_' + REALM[k].id } : REALM[k]) : null);
// v843h: una unidad que PRESTA la figura de otra (FIG_ALIAS) cuya peana es más de 2,2 veces mayor (1,3 si va montada) que la de una figura a pie (un mago a caballo, un carro, un personaje sobre montura; un personaje a pie con peana mayor conserva la figura, con su altura máxima en HMAX) no escala esa figura a pie hasta la peana grande (saldría gigante): se dibuja con la figura procedural de la unidad. En los demás casos (el prestamista no es una figura a pie) la figura se escala por la peana de la unidad, como siempre.
function lendRM(ut, d, RM) {
  const lid = FIG_ALIAS[ut], L = lid && UNITS[lid]; if (!L || !d.baseW || !L.baseW) return RM;
  const ratio = (d.baseW * d.baseD) / (L.baseW * L.baseD);
  const foot = (L.cat === 'char' || L.cat === 'inf') && !L.mount && Math.max(L.baseW, L.baseD) <= 40 && ['char', 'regInf', 'heavyInf'].includes(L.tt);
  return ratio > (d.mount ? 1.3 : 2.2) && foot && d.cat !== 'inf' && (d.mount || d.cat !== 'char') ? null : RM;
}
// tamaño de las miniaturas externas: infantería por altura según raza; el resto por su lado mayor ajustado a la peana
const xRealm = (id, d) => {
  const inf = ['regInf', 'heavyInf'].includes(d.tt) && d.cat !== 'cav' && !d.mount;
  if (inf) { const h = /goblin|snotling|gob_|ng_|gnoblar|trapper/.test(id) ? 0.8 : /^dw_/.test(id) ? 0.85 : /orc|black/.test(id) ? 1.25 : /ungor/.test(id) ? 1.05 : /bm_gor|bestigor/.test(id) ? 1.35 : 1.15; return { id: 'x_' + id, size: h, by: 'h' }; }
  // personajes a pie (peana de 30 mm o menos): misma lógica que la infantería, por altura (algo mayor que la tropa) y no por la anchura de la pose
  if (d.cat === 'char' && d.tt === 'char' && !d.mount && d.baseW <= 40) { const h = /^ok_/.test(id) ? 2.2 : d.baseW > 30 ? 1.35 : /goblin|snotling|gob_|ng_/.test(id) ? 0.95 : /^dw_|^cd_/.test(id) ? 1.0 : /orc|black/.test(id) ? 1.5 : /ungor/.test(id) ? 1.25 : /bm_gor|bestigor|^bm_/.test(id) ? 1.6 : 1.35; return { id: 'x_' + id, size: h, by: 'h' }; }
  if (/^ct_(lanterns|magistrate_lantern|strategist_lantern)$/.test(id)) return { id: 'x_' + id, size: 5.0, by: 'h' };
  if (id === 'de_hydra' || id === 'de_kharibdyss') return { id: 'x_' + id, size: 3.3 };
  if (id === 'tk_necroknights') return { id: 'x_' + id, size: 3.7 }; // v843e: caballería monstruosa de peana 50x100: la figura rellena la peana (antes, por altura, ocupaba menos de la mitad)
  if (d.tt === 'monInf') return { id: 'x_' + id, size: 2.0, by: 'h' };
  return { id: 'x_' + id, size: Math.max(d.baseW, d.baseD) / 25.4 * 1.05 };
};
// escala extra de figura por tipo (unidades que comparten malla con otras más pequeñas)
const FIG_SCALE = { br_green_knight: 1.1 };
// v843h: altura máxima (pulgadas) de figuras cuya malla es mucho más alta que ancha (altares, linternas, carros con dotación)
// v843h: giro (radianes) de mallas cuyo eje largo no queda a lo largo de la peana (montura/monstruo de lado); por id de malla
export const YAWFIX = { x_dm_bloodcrushers: Math.PI / 2, x_br_elisse: Math.PI / 2, x_ct_shugengan_gen: -Math.PI / 2 };
// v843n: FRONT_TABLE: frente de la figura de CADA unidad (840), explícito y verificable, no «lo que salga de la malla».
//   id -> [yaw, fuente, medida, nota]. yaw = giro (rad) que se aplica a la figura sobre u.face para que su frente (cabeza/jinete, bestias de tiro, boca del arma, cara del modelo)
//   coincida con el frente de la peana/unidad (u.face: el eje que usan arcos frontal/flanco/retaguardia, carga y línea de visión; geom.sideOf, inFrontArc).
//   fuente: 'M' medido en captura WebGL (shots/v843n, flecha de frente) · 'G' la misma malla ya medida en otra unidad (medida = id de la unidad medida) · 'C' convención (figura procedural construida mirando a +x,
//   o malla sin rasgo de frente inequívoco: frente de diseño = frente de la peana). La unidad 2D (drawUnitBody) dibuja su frente en +x local de u.face por construcción.
// <FRONT_TABLE>
export const FRONT_TABLE = {
  empire_general: [0, 'M', 'empire_general', 'cara del modelo hacia el frente'],
  empire_general_h: [0, 'M', 'empire_general_h', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  empire_general_peg: [0, 'M', 'empire_general_peg', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  empire_general_demi: [0, 'M', 'empire_general_demi', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  empire_captain_peg: [0, 'M', 'empire_captain_peg', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  empire_captain_demi: [0, 'C', 'convención', 'convención: demigrifo: perfil ambiguo'],
  empire_lord_peg: [0, 'M', 'empire_lord_peg', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  empire_captain: [0, 'M', 'empire_captain', 'cara del modelo hacia el frente'],
  empire_mage: [0, 'M', 'empire_mage', 'cara del modelo hacia el frente'],
  empire_lord: [0, 'M', 'empire_lord', 'cara del modelo hacia el frente'],
  state_halberds: [0, 'M', 'state_halberds', 'cara del modelo hacia el frente'],
  state_spears: [0, 'M', 'state_spears', 'cara del modelo hacia el frente'],
  state_swords: [0, 'G', 'state_troops', 'cara del modelo hacia el frente'],
  crossbowmen: [0, 'M', 'crossbowmen', 'cara del modelo hacia el frente'],
  handgunners: [0, 'M', 'handgunners', 'cara del modelo hacia el frente'],
  greatswords: [0, 'M', 'greatswords', 'cara del modelo hacia el frente'],
  empire_knights: [0, 'M', 'empire_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  emp_grandmaster: [0, 'M', 'emp_grandmaster', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  emp_chaptermaster: [0, 'M', 'emp_chaptermaster', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  emp_general_griffon: [0, 'C', 'convención', 'convención: grifo: perfil ambiguo'],
  emp_witchhunter: [0, 'M', 'emp_witchhunter', 'cara del modelo hacia el frente'],
  emp_lector: [0, 'M', 'emp_lector', 'cara del modelo hacia el frente'],
  emp_priest: [0, 'M', 'emp_priest', 'cara del modelo hacia el frente'],
  emp_ulric: [0, 'M', 'emp_ulric', 'cara del modelo hacia el frente'],
  emp_hulric: [0, 'G', 'emp_ulric', 'cara del modelo hacia el frente'],
  emp_lector_altar: [0, 'C', 'convención', 'convención: Altar de Sigmar: la malla no lleva bestias de tiro; con la flecha hacia la cámara se ve el arco abierto, pero no es inequívoco; frente de diseño'],
  emp_engineer: [0, 'M', 'emp_engineer', 'cara del modelo hacia el frente'],
  state_veterans: [0, 'G', 'state_vets', 'cara del modelo hacia el frente'],
  free_company: [0, 'M', 'free_company', 'cara del modelo hacia el frente'],
  emp_archers: [0, 'M', 'emp_archers', 'cara del modelo hacia el frente'],
  flagellants: [0, 'M', 'flagellants', 'cara del modelo hacia el frente'],
  pistoliers: [0, 'M', 'pistoliers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  outriders: [0, 'M', 'outriders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  inner_circle: [0, 'M', 'inner_circle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  demigryph_knights: [0, 'M', 'demigryph_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  steam_tank: [0, 'M', 'steam_tank', 'bestias de tiro delante, tripulación detrás'],
  mortar: [0, 'M', 'mortar', 'boca del arma/máquina hacia el frente'],
  helblaster: [0, 'C', 'convención', 'convención: cañón de salvas: perfil ambiguo'],
  helstorm: [0, 'M', 'helstorm', 'boca del arma/máquina hacia el frente'],
  great_cannon: [0, 'C', 'convención', 'convención: cañón: perfil ambiguo'],
  orc_warboss: [0, 'M', 'orc_warboss', 'cara del modelo hacia el frente'],
  orc_warboss_boar: [0, 'M', 'orc_warboss_boar', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  black_warboss: [0, 'M', 'black_warboss', 'cara del modelo hacia el frente'],
  orc_bigboss: [0, 'M', 'orc_bigboss', 'cara del modelo hacia el frente'],
  black_bigboss: [0, 'G', 'cd_blackboss', 'cara del modelo hacia el frente'],
  gob_bigboss: [0, 'M', 'gob_bigboss', 'cara del modelo hacia el frente'],
  orc_weirdboy: [0, 'M', 'orc_weirdboy', 'cara del modelo hacia el frente'],
  orc_weirdnob: [0, 'M', 'orc_weirdnob', 'cara del modelo hacia el frente'],
  orc_boyz: [0, 'M', 'orc_boyz', 'cara del modelo hacia el frente'],
  orc_twin: [0, 'M', 'orc_twin', 'cara del modelo hacia el frente'],
  orc_arrers: [0, 'M', 'orc_arrers', 'cara del modelo hacia el frente'],
  black_orcs: [0, 'G', 'cd_blackorcs', 'cara del modelo hacia el frente'],
  goblins: [0, 'M', 'goblins', 'cara del modelo hacia el frente'],
  orc_bigs: [0, 'M', 'orc_bigs', 'cara del modelo hacia el frente'],
  orc_frenzy: [0, 'M', 'orc_frenzy', 'cara del modelo hacia el frente'],
  goblins_sk: [0, 'M', 'goblins_sk', 'cara del modelo hacia el frente'],
  night_goblins: [0, 'G', 'night_gobs', 'cara del modelo hacia el frente'],
  night_goblins_net: [0, 'M', 'night_goblins_net', 'cara del modelo hacia el frente'],
  night_goblins_fan: [0, 'M', 'night_goblins_fan', 'cara del modelo hacia el frente'],
  wolf_riders: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  wolf_riders_amb: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  boar_boyz: [0, 'G', 'boar_riders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  boar_bigs: [0, 'M', 'boar_bigs', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  trolls: [0, 'M', 'trolls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rock_lobber: [0, 'C', 'convención', 'convención: máquina de lanzamiento: frente de diseño'],
  bolt_throwa: [0, 'M', 'bolt_throwa', 'boca del arma/máquina hacia el frente'],
  we_lord: [0, 'M', 'we_lord', 'cara del modelo hacia el frente'],
  we_lord_h: [0, 'M', 'we_lord_h', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_captain: [0, 'M', 'we_captain', 'cara del modelo hacia el frente'],
  we_spellsinger: [0, 'M', 'we_spellsinger', 'cara del modelo hacia el frente'],
  we_spellweaver: [0, 'M', 'we_spellweaver', 'cara del modelo hacia el frente'],
  we_branchwraith: [0, 'M', 'we_branchwraith', 'cara del modelo hacia el frente'],
  we_ancient: [0, 'M', 'we_ancient', 'cara del modelo hacia el frente'],
  we_glade_guard: [0, 'M', 'we_glade_guard', 'cara del modelo hacia el frente'],
  we_eternal: [0, 'M', 'we_eternal', 'cara del modelo hacia el frente'],
  we_dryads: [0, 'M', 'we_dryads', 'cara del modelo hacia el frente'],
  we_glade_riders: [0, 'M', 'we_glade_riders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_rangers: [0, 'M', 'we_rangers', 'cara del modelo hacia el frente'],
  we_wardancers: [0, 'M', 'we_wardancers', 'cara del modelo hacia el frente'],
  we_wild_riders: [0, 'M', 'we_wild_riders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_warhawks: [0, 'M', 'we_warhawks', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_treekin: [0, 'M', 'we_treekin', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_treeman: [0, 'M', 'we_treeman', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_lord_stag: [0, 'M', 'we_lord_stag', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_captain_stag: [0, 'M', 'we_captain_stag', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_lord_dragon: [0, 'M', 'we_lord_dragon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_lord_eagle: [0, 'M', 'we_lord_eagle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_captain_hawk: [0, 'M', 'we_captain_hawk', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_weaver_unicorn: [0, 'M', 'we_weaver_unicorn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_singer_unicorn: [0, 'G', 'we_weaver_unicorn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_shadowdancer: [3.1416, 'M', 'we_shadowdancer', 'Bailarina de sombras: con la flecha alejándose se ve de frente (rostro, espadas); con la flecha hacia la cámara se ve la capa -> giro 180°'],
  we_shadowdancer_w: [3.1416, 'G', 'we_shadowdancer', 'Bailarina de sombras: con la flecha alejándose se ve de frente (rostro, espadas); con la flecha hacia la cámara se ve la capa -> giro 180°'],
  we_waystalker: [3.1416, 'M', 'we_waystalker', 'Waystalker: con la flecha alejándose se ve de frente (cara bajo la capucha, arco al frente); con la flecha hacia la cámara se ve la espalda y el carcaj -> giro 180°'],
  we_araloth: [0, 'M', 'we_araloth', 'cara del modelo hacia el frente'],
  we_orion: [0, 'M', 'we_orion', 'cara del modelo hacia el frente'],
  we_scouts: [0, 'M', 'we_scouts', 'cara del modelo hacia el frente'],
  we_waywatchers: [0, 'M', 'we_waywatchers', 'cara del modelo hacia el frente'],
  we_sisters: [0, 'M', 'we_sisters', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_eagle: [0, 'M', 'we_eagle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_pack_hounds: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  we_orion_hounds: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  we_pack_cats: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_pack_boars: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_pack_bears: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_warden: [0, 'M', 'we_warden', 'cara del modelo hacia el frente'],
  we_guardians: [0, 'M', 'we_guardians', 'cara del modelo hacia el frente'],
  gob_warboss: [0, 'M', 'gob_warboss', 'cara del modelo hacia el frente'],
  ng_warboss: [0, 'G', 'gob_warboss', 'cara del modelo hacia el frente'],
  ng_bigboss: [0, 'G', 'gob_bigboss', 'cara del modelo hacia el frente'],
  gob_oddnob: [0, 'M', 'gob_oddnob', 'cara del modelo hacia el frente'],
  gob_oddgit: [0, 'G', 'gob_oddnob', 'cara del modelo hacia el frente'],
  ng_oddnob: [0, 'G', 'gob_oddnob', 'cara del modelo hacia el frente'],
  ng_oddgit: [0, 'G', 'gob_oddnob', 'cara del modelo hacia el frente'],
  orc_warboss_wyvern: [0, 'M', 'orc_warboss_wyvern', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  snotlings: [0, 'M', 'snotlings', 'cara del modelo hacia el frente'],
  spider_riders: [0, 'M', 'spider_riders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  squig_herd: [0, 'M', 'squig_herd', 'cara del modelo hacia el frente'],
  squig_hoppers: [0, 'M', 'squig_hoppers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  river_trolls: [0, 'M', 'river_trolls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  stone_trolls: [0, 'G', 'river_trolls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  black_chariot: [0, 'M', 'black_chariot', 'bestias de tiro delante, tripulación detrás'],
  orc_boar_chariot: [0, 'G', 'black_warboss_chariot', 'bestias de tiro delante, tripulación detrás'],
  bm_herdstone: [0, 'C', 'proc', 'boca del arma/máquina hacia el frente'],
  goods_cart: [0, 'C', 'proc', 'bestias de tiro delante, tripulación detrás'],
  wolf_chariot: [0, 'M', 'wolf_chariot', 'bestias de tiro delante, tripulación detrás'],
  pump_wagon: [0, 'M', 'pump_wagon', 'bestias de tiro delante, tripulación detrás'],
  arachnarok: [0, 'M', 'arachnarok', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  mangler_squig: [0, 'M', 'mangler_squig', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_kiknik: [0, 'M', 'gob_kiknik', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  orc_ogdruz: [0, 'M', 'orc_ogdruz', 'cara del modelo hacia el frente'],
  troll_hag: [0, 'M', 'troll_hag', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  orc_ogre_bulls: [3.1416, 'G', 'woc_ogres', 'Ogros del Caos: con la flecha hacia la cámara se ven las espaldas lisas; con la flecha alejándose se ve el vientre y la cara -> giro 180°'],
  orc_bonegrinder: [0, 'M', 'orc_bonegrinder', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  orc_giant: [0, 'M', 'orc_giant', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  doom_diver: [0, 'C', 'convención', 'convención: máquina de lanzamiento: frente de diseño'],
  br_duke: [0, 'C', 'convención', 'convención: montura acorazada: perfil ambiguo'],
  br_baron: [0, 'M', 'br_baron', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_paladin: [0, 'M', 'br_paladin', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_duke_hippo: [0, 'G', 'br_baron_hippo', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_baron_pegasus: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_sergeant: [0, 'M', 'br_sergeant', 'cara del modelo hacia el frente'],
  br_realm_foot: [0, 'G', 'br_duke_foot', 'cara del modelo hacia el frente'],
  br_yeomen: [0, 'M', 'br_yeomen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_damsel: [0, 'M', 'br_damsel', 'cara del modelo hacia el frente'],
  br_prophetess: [0, 'M', 'br_prophetess', 'cara del modelo hacia el frente'],
  br_cecil: [0, 'M', 'br_cecil', 'cara del modelo hacia el frente'],
  br_green_knight: [0, 'M', 'br_green_knight', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_elisse: [-1.5708, 'M', 'br_elisse', 'Élisse: caballo encabritado con la cabeza a la izquierda (tras YAWFIX +π/2) -> giro 180° adicional'],
  br_outcast: [0, 'M', 'br_outcast', 'cara del modelo hacia el frente'],
  br_outcast3: [0, 'M', 'br_outcast3', 'cara del modelo hacia el frente'],
  br_yeoman_guard: [0, 'M', 'br_yeoman_guard', 'cara del modelo hacia el frente'],
  br_men_at_arms: [0, 'G', 'rc_brigands', 'cara del modelo hacia el frente'],
  br_bowmen: [0, 'G', 'br_brigands_bb', 'cara del modelo hacia el frente'],
  br_squires: [0, 'M', 'br_squires', 'cara del modelo hacia el frente'],
  br_bowmen_fire: [0, 'G', 'br_brigands_bb', 'cara del modelo hacia el frente'],
  br_bowmen_stakes: [0, 'G', 'br_brigands_bb', 'cara del modelo hacia el frente'],
  br_pilgrims: [0, 'M', 'br_pilgrims', 'cara del modelo hacia el frente'],
  br_pilgrims_rel: [0, 'G', 'br_pilgrims', 'cara del modelo hacia el frente'],
  br_errant: [0, 'M', 'br_errant', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_realm: [0, 'M', 'br_realm', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_questing: [0, 'M', 'br_questing', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_grail: [0, 'M', 'br_grail', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_pegasus: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_bombard: [0, 'C', 'convención', 'convención: cañón: perfil ambiguo'],
  br_brigands: [0, 'G', 'rc_brigands', 'cara del modelo hacia el frente'],
  br_brigands_bb: [0, 'M', 'br_brigands_bb', 'cara del modelo hacia el frente'],
  br_trebuchet: [0, 'C', 'convención', 'convención: máquina de lanzamiento: sin boca de arma; frente de diseño'],
  bm_beastlord: [0, 'M', 'bm_beastlord', 'cara del modelo hacia el frente'],
  bm_wargor: [3.1416, 'M', 'bm_wargor', 'Wargor: con la flecha alejándose se ve el pecho y el rostro cornudo; con la flecha hacia la cámara se ve la espalda -> giro 180°'],
  bm_centigor_chief: [0, 'M', 'bm_centigor_chief', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_gbs: [0, 'M', 'bm_gbs', 'cara del modelo hacia el frente'],
  bm_bs: [0, 'M', 'bm_bs', 'cara del modelo hacia el frente'],
  bm_doombull: [0, 'M', 'bm_doombull', 'cara del modelo hacia el frente'],
  bm_gorebull: [0, 'M', 'bm_gorebull', 'cara del modelo hacia el frente'],
  bm_gor: [0, 'M', 'bm_gor', 'cara del modelo hacia el frente'],
  bm_gor_aw: [0, 'M', 'bm_gor_aw', 'cara del modelo hacia el frente'],
  bm_ungor: [0, 'M', 'bm_ungor', 'cara del modelo hacia el frente'],
  bm_ungor_bow: [0, 'M', 'bm_ungor_bow', 'cara del modelo hacia el frente'],
  bm_warped: [0, 'G', 'bm_gor', 'cara del modelo hacia el frente'],
  bm_hounds: [0, 'M', 'bm_hounds', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_bestigor: [0, 'M', 'bm_bestigor', 'cara del modelo hacia el frente'],
  bm_minotaurs: [0, 'M', 'bm_minotaurs', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_minotaurs_gw: [0, 'M', 'bm_minotaurs_gw', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_centigors: [0, 'M', 'bm_centigors', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_harpies: [0, 'C', 'proc', 'cara del modelo hacia el frente'],
  bm_dragon_ogres: [0, 'M', 'bm_dragon_ogres', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_ghorgon: [0, 'M', 'bm_ghorgon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_lord: [0, 'M', 'woc_lord', 'cara del modelo hacia el frente'],
  woc_lord_steed: [0, 'M', 'woc_lord_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_exalted: [3.1416, 'M', 'woc_exalted', 'Exaltado del Caos: con la flecha alejándose se ve el escudo y el rostro; con la flecha hacia la cámara se ven las espaldas -> giro 180°'],
  woc_aspiring: [0, 'M', 'woc_aspiring', 'cara del modelo hacia el frente'],
  woc_sorc_lord: [0, 'M', 'woc_sorc_lord', 'cara del modelo hacia el frente'],
  woc_ex_sorc: [0, 'M', 'woc_ex_sorc', 'cara del modelo hacia el frente'],
  woc_dprince: [0, 'M', 'woc_dprince', 'cara del modelo hacia el frente'],
  woc_warriors: [0, 'M', 'woc_warriors', 'cara del modelo hacia el frente'],
  woc_warriors_hb: [0, 'M', 'woc_warriors_hb', 'cara del modelo hacia el frente'],
  woc_warriors_gw: [0, 'M', 'woc_warriors_gw', 'cara del modelo hacia el frente'],
  woc_marauders: [0, 'M', 'woc_marauders', 'cara del modelo hacia el frente'],
  woc_marauders_gw: [0, 'M', 'woc_marauders_gw', 'cara del modelo hacia el frente'],
  woc_forsaken: [0, 'M', 'woc_forsaken', 'cara del modelo hacia el frente'],
  woc_knights: [0, 'M', 'woc_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_knights_l: [0, 'M', 'woc_knights_l', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_horsemen: [0, 'M', 'woc_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_hounds: [0, 'M', 'woc_hounds', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_chosen: [0, 'M', 'woc_chosen', 'cara del modelo hacia el frente'],
  woc_chosen_knights: [0, 'M', 'woc_chosen_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_ogres: [3.1416, 'M', 'woc_ogres', 'Ogros del Caos: con la flecha hacia la cámara se ven las espaldas lisas; con la flecha alejándose se ve el vientre y la cara -> giro 180°'],
  woc_trolls: [0, 'M', 'woc_trolls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_king_dragon: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  tk_hpriest_dragon: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  tk_warriors_ph: [0, 'G', 'tk_warriors', 'cara del modelo hacia el frente'],
  tk_guard_ph: [0, 'M', 'tk_guard_ph', 'cara del modelo hacia el frente'],
  tk_swarm_amb: [0, 'G', 'tk_swarm', 'cara del modelo hacia el frente'],
  tk_king: [0, 'M', 'tk_king', 'cara del modelo hacia el frente'],
  tk_prince: [0, 'M', 'tk_prince', 'cara del modelo hacia el frente'],
  tk_herald: [0, 'M', 'tk_herald', 'cara del modelo hacia el frente'],
  tk_hpriest: [0, 'M', 'tk_hpriest', 'cara del modelo hacia el frente'],
  tk_mpriest: [0, 'M', 'tk_mpriest', 'cara del modelo hacia el frente'],
  tk_warriors: [0, 'M', 'tk_warriors', 'cara del modelo hacia el frente'],
  tk_summoned: [0, 'G', 'tk_warriors', 'cara del modelo hacia el frente'],
  tk_warriors_sp: [0, 'G', 'tk_warriors', 'cara del modelo hacia el frente'],
  tk_archers: [0, 'M', 'tk_archers', 'cara del modelo hacia el frente'],
  tk_horsemen: [0, 'M', 'tk_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_horse_archers: [0, 'M', 'tk_horse_archers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_guard: [0, 'M', 'tk_guard', 'cara del modelo hacia el frente'],
  tk_guard_hb: [0, 'M', 'tk_guard_hb', 'cara del modelo hacia el frente'],
  tk_ushabti: [0, 'M', 'tk_ushabti', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_ushabti_bow: [0, 'M', 'tk_ushabti_bow', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_necroknights: [0, 'C', 'convención', 'convención: serpiente: perfil ambiguo'],
  tk_carrion: [0, 'M', 'tk_carrion', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_prince_griffon: [0, 'M', 'he_prince_griffon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_prince_moon: [0, 'M', 'he_prince_moon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_skycutter: [0, 'M', 'he_skycutter', 'bestias de tiro delante, tripulación detrás'],
  he_skycutter_bt: [0, 'G', 'he_skycutter', 'bestias de tiro delante, tripulación detrás'],
  he_prince_star: [0, 'M', 'he_prince_star', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_archmage_star: [0, 'M', 'he_archmage_star', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_noble_eagle: [0, 'M', 'he_noble_eagle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_mage_eagle: [0, 'M', 'he_mage_eagle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_noble_griffon: [0, 'M', 'he_noble_griffon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_prince_sun: [0, 'M', 'he_prince_sun', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_noble_sun: [0, 'M', 'he_noble_sun', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_archmage_moon: [0, 'M', 'he_archmage_moon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_dragonmage: [0, 'M', 'he_dragonmage', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_flamespyre: [0, 'C', 'convención', 'convención: fénix: silueta fina, sin rasgo inequívoco en perfil'],
  he_frostheart: [0, 'M', 'he_frostheart', 'Frostheart Phoenix: pico y cabeza sobre la flecha en las vistas cenitales a135 y a225 (yaw 0)'],
  woc_lord_manticore: [0, 'M', 'woc_lord_manticore', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_lord_dragon: [0, 'G', 'woc_galrauch', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_sorc_manticore: [0, 'M', 'woc_sorc_manticore', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_spawn: [0, 'M', 'woc_spawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_hellcannon: [0, 'M', 'woc_hellcannon', 'boca del arma/máquina hacia el frente'],
  woc_chimera: [0, 'M', 'woc_chimera', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_galrauch: [0, 'M', 'woc_galrauch', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_necrotect: [0, 'M', 'tk_necrotect', 'cara del modelo hacia el frente'],
  tk_skirmishers: [0, 'M', 'tk_skirmishers', 'cara del modelo hacia el frente'],
  tk_swarm: [0, 'M', 'tk_swarm', 'cara del modelo hacia el frente'],
  tk_stalkers: [0, 'C', 'convención', 'convención: serpiente: capucha de perfil ambiguo'],
  tk_stalkers_amb: [0, 'M', 'tk_stalkers_amb', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_catapult: [0, 'M', 'tk_catapult', 'boca del arma/máquina hacia el frente'],
  tk_casket: [0, 'C', 'convención', 'convención: Ataúd de las Almas: malla sin eje de frente; frente de diseño'],
  tk_warsphinx: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  tk_scorpion: [3.1416, 'M', 'tk_scorpion', 'Escorpión: aguijón (cola) a la derecha, cabeza a la izquierda -> giro 180°'],
  tk_colossus: [0, 'M', 'tk_colossus', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_necrosphinx: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  bm_giant: [0, 'M', 'bm_giant', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_shaggoth: [0, 'M', 'bm_shaggoth', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_jabberslythe: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  bm_cockatrice: [0, 'M', 'bm_cockatrice', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_cygor: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  he_prince_tiranoc: [0, 'M', 'he_prince_tiranoc', 'bestias de tiro delante, tripulación detrás'],
  tk_king_chariot: [3.1416, 'M', 'tk_king_chariot', 'carro del rey: bestias de tiro a la izquierda -> giro 180°'],
  woc_lord_chariot: [3.1416, 'M', 'woc_lord_chariot', 'carro del Caos: bestia de tiro a la izquierda, tripulación a la derecha -> giro 180°'],
  bm_beastlord_tusk: [0, 'M', 'bm_beastlord_tusk', 'bestias de tiro delante, tripulación detrás'],
  he_tiranoc: [0, 'M', 'he_tiranoc', 'bestias de tiro delante, tripulación detrás'],
  he_lionchariot: [0, 'G', 'he_chieftain_chariot', 'bestias de tiro delante, tripulación detrás'],
  tk_chariot: [3.1416, 'M', 'tk_chariot', 'carro esqueleto: bestias de tiro a la izquierda del eje (captura de perfil) -> giro 180°'],
  woc_chariot: [0, 'M', 'woc_chariot', 'bestias de tiro delante, tripulación detrás'],
  woc_gorechariot: [0, 'M', 'woc_gorechariot', 'gorebestia delante (derecha), tripulación detrás: frente = flecha'],
  bm_tuskchariot: [0, 'M', 'bm_tuskchariot', 'bestias de tiro delante, tripulación detrás'],
  bm_razorchariot: [0, 'M', 'bm_razorchariot', 'bestias de tiro delante, tripulación detrás'],
  dw_king: [0, 'M', 'dw_king', 'cara del modelo hacia el frente'],
  dw_thane: [0, 'M', 'dw_thane', 'cara del modelo hacia el frente'],
  dw_runelord: [0, 'M', 'dw_runelord', 'cara del modelo hacia el frente'],
  dw_runesmith: [0, 'M', 'dw_runesmith', 'cara del modelo hacia el frente'],
  dw_doomseeker: [0, 'G', 'dw_dslayer', 'cara del modelo hacia el frente'],
  dw_dslayer: [0, 'M', 'dw_dslayer', 'cara del modelo hacia el frente'],
  dw_drslayer: [0, 'M', 'dw_drslayer', 'cara del modelo hacia el frente'],
  dw_engineer: [0, 'M', 'dw_engineer', 'cara del modelo hacia el frente'],
  dw_king_shield: [0, 'M', 'dw_king_shield', 'cara del modelo hacia el frente'],
  dw_anvil: [0, 'M', 'dw_anvil', 'boca del arma/máquina hacia el frente'],
  dw_gyrobomber: [0, 'M', 'dw_gyrobomber', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dw_warriors: [0, 'M', 'dw_warriors', 'cara del modelo hacia el frente'],
  dw_warriors_gw: [0, 'M', 'dw_warriors_gw', 'cara del modelo hacia el frente'],
  dw_quarrellers: [0, 'M', 'dw_quarrellers', 'cara del modelo hacia el frente'],
  dw_thunderers: [0, 'M', 'dw_thunderers', 'cara del modelo hacia el frente'],
  dw_longbeards: [0, 'M', 'dw_longbeards', 'cara del modelo hacia el frente'],
  dw_hammerers: [0, 'M', 'dw_hammerers', 'cara del modelo hacia el frente'],
  dw_ironbreakers: [0, 'M', 'dw_ironbreakers', 'cara del modelo hacia el frente'],
  dw_slayers: [0, 'M', 'dw_slayers', 'cara del modelo hacia el frente'],
  dw_slayers_ahw: [0, 'G', 'dw_drslayer', 'cara del modelo hacia el frente'],
  dw_miners: [0, 'M', 'dw_miners', 'cara del modelo hacia el frente'],
  dw_scoutgyro: [0, 'G', 'dw_gyro', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dw_royalwarriors: [0, 'G', 'dw_longbeards', 'cara del modelo hacia el frente'],
  dw_gyro: [0, 'M', 'dw_gyro', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dw_rangers: [0, 'M', 'dw_rangers', 'cara del modelo hacia el frente'],
  dw_irondrakes: [3.1416, 'M', 'dw_irondrakes', 'Drakes de Hierro: con la flecha alejándose se ve de frente (rostros y cañones de drakefire apuntando a la cámara); con la flecha hacia la cámara se ven los tanques de la espalda -> giro 180°'],
  dw_cart: [0, 'M', 'dw_cart', 'bestias de tiro delante, tripulación detrás'],
  dw_cart_miner: [0, 'C', 'proc', 'bestias de tiro delante, tripulación detrás'],
  dw_hewer: [0, 'G', 'dw_bolt', 'boca del arma/máquina hacia el frente'],
  dw_bolt: [0, 'M', 'dw_bolt', 'boca del arma/máquina hacia el frente'],
  dw_grudge: [0, 'M', 'dw_grudge', 'boca del arma/máquina hacia el frente'],
  dw_cannon: [0, 'M', 'dw_cannon', 'boca del arma/máquina hacia el frente'],
  dw_organ: [0, 'G', 'rc_organ', 'boca del arma/máquina hacia el frente'],
  dw_flame: [0, 'M', 'dw_flame', 'boca del arma/máquina hacia el frente'],
  he_prince: [0, 'M', 'he_prince', 'cara del modelo hacia el frente'],
  he_prince_h: [0, 'M', 'he_prince_h', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_noble: [0, 'M', 'he_noble', 'cara del modelo hacia el frente'],
  he_archmage: [0, 'M', 'he_archmage', 'cara del modelo hacia el frente'],
  he_mage: [0, 'G', 'he_stormweaver', 'cara del modelo hacia el frente'],
  he_handmaiden: [0, 'M', 'he_handmaiden', 'cara del modelo hacia el frente'],
  he_spearmen: [0, 'M', 'he_spearmen', 'cara del modelo hacia el frente'],
  he_archers: [0, 'M', 'he_archers', 'cara del modelo hacia el frente'],
  he_seaguard: [0, 'G', 'he_ship', 'cara del modelo hacia el frente'],
  he_chieftain: [0, 'G', 'he_noble', 'cara del modelo hacia el frente'],
  he_korhil: [0, 'G', 'he_noble', 'cara del modelo hacia el frente'],
  he_lionguard: [0, 'M', 'he_lionguard', 'cara del modelo hacia el frente'],
  he_woodsmen: [0, 'G', 'he_lionguard', 'cara del modelo hacia el frente'],
  he_chieftain_chariot: [0, 'M', 'he_chieftain_chariot', 'bestias de tiro delante, tripulación detrás'],
  he_korhil_chariot: [0, 'G', 'he_chieftain_chariot', 'bestias de tiro delante, tripulación detrás'],
  he_garrison: [0, 'G', 'he_noble', 'cara del modelo hacia el frente'],
  he_ishaya: [0, 'C', 'proc', 'cara del modelo hacia el frente'],
  he_stormweaver: [0, 'M', 'he_stormweaver', 'cara del modelo hacia el frente'],
  he_stormweaver_uni: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_ship: [0, 'M', 'he_ship', 'cara del modelo hacia el frente'],
  he_warlions: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_merwyrm: [0, 'C', 'convención', 'convención: Merwyrm: perfil ambiguo'],
  he_whitelions: [0, 'G', 'he_lionguard', 'cara del modelo hacia el frente'],
  he_swordmasters: [0, 'M', 'he_swordmasters', 'cara del modelo hacia el frente'],
  he_phoenix: [0, 'M', 'he_phoenix', 'cara del modelo hacia el frente'],
  he_shadow: [0, 'M', 'he_shadow', 'cara del modelo hacia el frente'],
  he_sisters: [0, 'M', 'he_sisters', 'cara del modelo hacia el frente'],
  he_reavers: [0, 'M', 'he_reavers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_reavers_bow: [0, 'M', 'he_reavers_bow', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_silverhelms: [0, 'M', 'he_silverhelms', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_dragonprinces: [0, 'M', 'he_dragonprinces', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_eagle: [0, 'M', 'he_eagle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_boltthrower: [0, 'M', 'he_boltthrower', 'boca del arma/máquina hacia el frente'],
  de_dreadlord: [0, 'M', 'de_dreadlord', 'cara del modelo hacia el frente'],
  de_dreadlord_steed: [0, 'M', 'de_dreadlord_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_dreadlord_cold: [0, 'M', 'de_dreadlord_cold', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_dreadlord_dragon: [0, 'M', 'de_dreadlord_dragon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_master: [0, 'M', 'de_master', 'cara del modelo hacia el frente'],
  de_master_steed: [0, 'M', 'de_master_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_master_cold: [3.1416, 'M', 'de_master_cold', 'Cold One: cabeza (mandíbulas) a la izquierda, cola a la derecha -> giro 180°'],
  de_sorceress: [0, 'M', 'de_sorceress', 'cara del modelo hacia el frente'],
  de_supreme: [0, 'M', 'de_supreme', 'cara del modelo hacia el frente'],
  de_supreme_cold: [0, 'G', 'de_sorceress_cold', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_deathhag: [0, 'M', 'de_deathhag', 'cara del modelo hacia el frente'],
  de_assassin: [0, 'M', 'de_assassin', 'cara del modelo hacia el frente'],
  de_beastmaster: [0, 'M', 'de_beastmaster', 'cara del modelo hacia el frente'],
  de_warriors: [0, 'M', 'de_warriors', 'cara del modelo hacia el frente'],
  de_crossbows: [0, 'M', 'de_crossbows', 'cara del modelo hacia el frente'],
  de_shades: [0, 'M', 'de_shades', 'cara del modelo hacia el frente'],
  de_corsairs: [0, 'M', 'de_corsairs', 'cara del modelo hacia el frente'],
  de_executioners: [0, 'M', 'de_executioners', 'cara del modelo hacia el frente'],
  de_blackguard: [0, 'M', 'de_blackguard', 'cara del modelo hacia el frente'],
  de_sisters: [0, 'M', 'de_sisters', 'cara del modelo hacia el frente'],
  de_coldones: [0, 'M', 'de_coldones', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_warlocks: [0, 'M', 'de_warlocks', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_witchelves: [0, 'G', 'de_sisters', 'cara del modelo hacia el frente'],
  de_darkriders: [0, 'G', 'he_reavers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_medusa: [0, 'M', 'de_medusa', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_harpies: [0, 'M', 'de_harpies', 'cara del modelo hacia el frente'],
  de_boltthrower: [0, 'M', 'de_boltthrower', 'boca del arma/máquina hacia el frente'],
  de_hydra: [3.1416, 'M', 'de_hydra', 'Hidra: cabezas a la izquierda, manejadores detrás (derecha) -> giro 180°'],
  de_kharibdyss: [3.1416, 'M', 'de_kharibdyss', 'Kharibdyss: cabezas a la izquierda, manejadores detrás -> giro 180°'],
  lm_slann: [0, 'M', 'lm_slann', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_oldblood: [0, 'M', 'lm_oldblood', 'cara del modelo hacia el frente'],
  lm_oldblood_cold: [0, 'M', 'lm_oldblood_cold', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_scar: [0, 'M', 'lm_scar', 'cara del modelo hacia el frente'],
  lm_scar_cold: [0, 'M', 'lm_scar_cold', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_skchief: [0, 'M', 'lm_skchief', 'cara del modelo hacia el frente'],
  lm_skchief_terra: [0, 'M', 'lm_skchief_terra', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_skchief_ripper: [0, 'M', 'lm_skchief_ripper', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_skchief_steg: [0, 'M', 'lm_skchief_steg', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_skpriest: [0, 'M', 'lm_skpriest', 'cara del modelo hacia el frente'],
  lm_skpriest_ancient: [0, 'M', 'lm_skpriest_ancient', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_saurus: [0, 'M', 'lm_saurus', 'cara del modelo hacia el frente'],
  lm_skirmishers: [0, 'M', 'lm_skirmishers', 'cara del modelo hacia el frente'],
  lm_swarm: [0, 'M', 'lm_swarm', 'cara del modelo hacia el frente'],
  lm_temple: [0, 'M', 'lm_temple', 'cara del modelo hacia el frente'],
  lm_chameleon: [0, 'M', 'lm_chameleon', 'cara del modelo hacia el frente'],
  lm_coldones: [0, 'M', 'lm_coldones', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_terradons: [0, 'M', 'lm_terradons', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_ripperdactyls: [0, 'M', 'lm_ripperdactyls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_kroxigor: [0, 'M', 'lm_kroxigor', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_salamander: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  lm_razordon: [0, 'M', 'lm_razordon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_stegadon: [0, 'M', 'lm_stegadon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_bastiladon: [0, 'M', 'lm_bastiladon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_troglodon: [3.1416, 'M', 'lm_troglodon', 'Troglodon: cresta/cabeza a la izquierda, cola larga a la derecha -> giro 180°'],
  sk_warlord: [0, 'M', 'sk_warlord', 'cara del modelo hacia el frente'],
  sk_chieftain: [0, 'M', 'sk_chieftain', 'cara del modelo hacia el frente'],
  sk_greyseer: [0, 'M', 'sk_greyseer', 'cara del modelo hacia el frente'],
  sk_greyseer_bell: [0, 'M', 'sk_greyseer_bell', 'bestias de tiro delante, tripulación detrás'],
  sk_plaguepriest: [0, 'M', 'sk_plaguepriest', 'cara del modelo hacia el frente'],
  sk_assassin: [0, 'M', 'sk_assassin', 'cara del modelo hacia el frente'],
  sk_engineer: [0, 'M', 'sk_engineer', 'cara del modelo hacia el frente'],
  sk_clanrats: [0, 'M', 'sk_clanrats', 'cara del modelo hacia el frente'],
  sk_giantrats: [0, 'M', 'sk_giantrats', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  sk_swarms: [0, 'M', 'sk_swarms', 'cara del modelo hacia el frente'],
  sk_gutter: [0, 'M', 'sk_gutter', 'cara del modelo hacia el frente'],
  sk_nightrunners: [0, 'M', 'sk_nightrunners', 'cara del modelo hacia el frente'],
  sk_plaguemonks: [0, 'M', 'sk_plaguemonks', 'cara del modelo hacia el frente'],
  sk_censer: [0, 'M', 'sk_censer', 'cara del modelo hacia el frente'],
  sk_stormvermin: [0, 'M', 'sk_stormvermin', 'cara del modelo hacia el frente'],
  sk_jezzail: [0, 'M', 'sk_jezzail', 'cara del modelo hacia el frente'],
  sk_globadiers: [0, 'M', 'sk_globadiers', 'cara del modelo hacia el frente'],
  sk_ratogres: [0, 'M', 'sk_ratogres', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  sk_ratlinggun: [0, 'M', 'sk_ratlinggun', 'cara del modelo hacia el frente'],
  sk_warplightning: [0, 'M', 'sk_warplightning', 'boca del arma/máquina hacia el frente'],
  sk_plagueclaw: [0, 'M', 'sk_plagueclaw', 'boca del arma/máquina hacia el frente'],
  sk_warpfire: [0, 'G', 'sk_ratlinggun', 'cara del modelo hacia el frente'],
  sk_windmortar: [0, 'G', 'sk_plagueclaw', 'cara del modelo hacia el frente'],
  sk_warpgrinder: [0, 'M', 'sk_warpgrinder', 'cara del modelo hacia el frente'],
  sk_doomflayer: [0, 'M', 'sk_doomflayer', 'cara del modelo hacia el frente'],
  sk_plaguepriest_furnace: [0, 'G', 'sk_greyseer_bell', 'bestias de tiro delante, tripulación detrás'],
  sk_doomwheel: [0, 'M', 'sk_doomwheel', 'bestias de tiro delante, tripulación detrás'],
  sk_hellpit: [0, 'M', 'sk_hellpit', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_count: [0, 'M', 'vc_count', 'cara del modelo hacia el frente'],
  vc_ghoulking: [0, 'M', 'vc_ghoulking', 'cara del modelo hacia el frente'],
  vc_count_nightmare: [0, 'M', 'vc_count_nightmare', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_count_dragon: [0, 'M', 'vc_count_dragon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_count_terror: [0, 'C', 'convención', 'convención: Terror: perfil ambiguo'],
  vc_count_coven: [0, 'M', 'vc_count_coven', 'bestias de tiro delante, tripulación detrás'],
  vc_thrall: [0, 'M', 'vc_thrall', 'cara del modelo hacia el frente'],
  vc_thrall_nightmare: [0, 'M', 'vc_thrall_nightmare', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_necromancer: [0, 'M', 'vc_necromancer', 'cara del modelo hacia el frente'],
  vc_necro_nightmare: [0, 'M', 'vc_necro_nightmare', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_acolyte: [0, 'M', 'vc_acolyte', 'cara del modelo hacia el frente'],
  vc_wightking: [0, 'G', 'vc_wightlord', 'cara del modelo hacia el frente'],
  vc_wightlord: [0, 'M', 'vc_wightlord', 'cara del modelo hacia el frente'],
  vc_wightking_steed: [0, 'G', 'vc_wightlord_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_wightlord_steed: [0, 'M', 'vc_wightlord_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_knightshrouds: [0, 'M', 'vc_knightshrouds', 'cara del modelo hacia el frente'],
  vc_knightshrouds_steed: [0, 'M', 'vc_knightshrouds_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_zombies: [0, 'M', 'vc_zombies', 'cara del modelo hacia el frente'],
  vc_skeletons: [0, 'M', 'vc_skeletons', 'cara del modelo hacia el frente'],
  vc_ghouls: [0, 'M', 'vc_ghouls', 'cara del modelo hacia el frente'],
  vc_direwolves: [0, 'M', 'vc_direwolves', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_fellbats: [0, 'M', 'vc_fellbats', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_graveguard: [0, 'M', 'vc_graveguard', 'cara del modelo hacia el frente'],
  vc_blackknights: [0, 'M', 'vc_blackknights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_spirithosts: [0, 'M', 'vc_spirithosts', 'cara del modelo hacia el frente'],
  vc_banshee: [0, 'M', 'vc_banshee', 'cara del modelo hacia el frente'],
  vc_cairnwraith: [0, 'M', 'vc_cairnwraith', 'cara del modelo hacia el frente'],
  vc_hexwraith: [0, 'M', 'vc_hexwraith', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_bloodknights: [0, 'M', 'vc_bloodknights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_vargheists: [0, 'M', 'vc_vargheists', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_terrorgheist: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  vc_blackcoach: [3.1416, 'M', 'vc_blackcoach', 'Carruaje Negro: pesadillas a la izquierda -> giro 180°'],
  vc_batswarm: [0, 'M', 'vc_batswarm', 'cara del modelo hacia el frente'],
  vc_horrors: [0, 'M', 'vc_horrors', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_varghulf: [0, 'M', 'vc_varghulf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_corpsecart: [3.1416, 'G', 'vc_blackcoach', 'Carruaje Negro: pesadillas a la izquierda -> giro 180°'],
  vc_mortis: [0, 'G', 'vc_necro_mortis', 'boca del arma/máquina hacia el frente'],
  dm_herald_khorne: [0, 'M', 'dm_herald_khorne', 'cara del modelo hacia el frente'],
  dm_herald_khorne_jug: [0, 'M', 'dm_herald_khorne_jug', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_nurgle: [0, 'M', 'dm_herald_nurgle', 'cara del modelo hacia el frente'],
  dm_herald_nurgle_pal: [0, 'M', 'dm_herald_nurgle_pal', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_slaanesh: [0, 'M', 'dm_herald_slaanesh', 'cara del modelo hacia el frente'],
  dm_herald_slaanesh_steed: [0, 'M', 'dm_herald_slaanesh_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_tzeentch: [0, 'M', 'dm_herald_tzeentch', 'cara del modelo hacia el frente'],
  dm_herald_tzeentch_disc: [0, 'M', 'dm_herald_tzeentch_disc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_tzeentch_chariot: [0, 'M', 'dm_herald_tzeentch_chariot', 'bestias de tiro delante, tripulación detrás'],
  dm_bloodthirster: [0, 'M', 'dm_bloodthirster', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_gud: [0, 'M', 'dm_gud', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_keeper: [0, 'C', 'convención', 'convención: Keeper of Secrets: malla simétrica de tentáculos, sin rasgo de frente inequívoco ni en vista de perfil ni frontal; frente de diseño = frente de la peana'],
  dm_lordchange: [0, 'M', 'dm_lordchange', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_prince: [0, 'M', 'dm_prince', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_bloodletters: [0, 'M', 'dm_bloodletters', 'cara del modelo hacia el frente'],
  dm_plaguebearers: [0, 'M', 'dm_plaguebearers', 'cara del modelo hacia el frente'],
  dm_daemonettes: [0, 'M', 'dm_daemonettes', 'cara del modelo hacia el frente'],
  dm_pinkhorrors: [0, 'M', 'dm_pinkhorrors', 'cara del modelo hacia el frente'],
  dm_nurglings: [0, 'M', 'dm_nurglings', 'cara del modelo hacia el frente'],
  dm_bluehorrors: [0, 'M', 'dm_bluehorrors', 'cara del modelo hacia el frente'],
  dm_fleshhounds: [0, 'M', 'dm_fleshhounds', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_bloodcrushers: [1.5708, 'M', 'dm_bloodcrushers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_plaguedrones: [0, 'M', 'dm_plaguedrones', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_seekers: [0, 'M', 'dm_seekers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_screamers: [0, 'M', 'dm_screamers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_flamers: [0, 'M', 'dm_flamers', 'cara del modelo hacia el frente'],
  dm_furies: [0, 'M', 'dm_furies', 'cara del modelo hacia el frente'],
  dm_beast: [0, 'M', 'dm_beast', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_fiends: [0, 'M', 'dm_fiends', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_skullcannon: [0, 'M', 'dm_skullcannon', 'boca del arma/máquina hacia el frente'],
  dm_hellflayer: [0, 'G', 'dm_herald_slaanesh_exalted', 'bestias de tiro delante, tripulación detrás'],
  dm_brimstone: [0, 'M', 'dm_brimstone', 'cara del modelo hacia el frente'],
  dm_seekerchariot: [0, 'G', 'dm_herald_slaanesh_exalted', 'bestias de tiro delante, tripulación detrás'],
  dm_soulgrinder: [0, 'M', 'dm_soulgrinder', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_tyrant: [0, 'M', 'ok_tyrant', 'cara del modelo hacia el frente'],
  ok_tyrant_stone: [3.1416, 'M', 'ok_tyrant_stone', 'familia Stonehorn -> giro 180°'],
  ok_tyrant_thunder: [3.1416, 'M', 'ok_tyrant_thunder', 'colmillos a la izquierda (misma familia Thundertusk) -> giro 180°'],
  ok_bruiser: [0, 'G', 'ok_tyrant', 'cara del modelo hacia el frente'],
  ok_bruiser_stone: [3.1416, 'M', 'ok_bruiser_stone', 'familia Stonehorn -> giro 180°'],
  ok_bruiser_thunder: [3.1416, 'M', 'ok_bruiser_thunder', 'colmillos a la izquierda (familia Thundertusk) -> giro 180°'],
  ok_hunter: [0, 'M', 'ok_hunter', 'cara del modelo hacia el frente'],
  ok_hunter_stone: [3.1416, 'M', 'ok_hunter_stone', 'familia Stonehorn -> giro 180°'],
  ok_hunter_thunder: [3.1416, 'M', 'ok_hunter_thunder', 'colmillos a la izquierda (familia Thundertusk) -> giro 180°'],
  ok_butcher: [0, 'M', 'ok_butcher', 'cara del modelo hacia el frente'],
  ok_butcher_cauldron: [0, 'C', 'convención', 'convención: carga el caldero: sin eje inequívoco'],
  ok_slaughtermaster: [0, 'M', 'ok_slaughtermaster', 'cara del modelo hacia el frente'],
  ok_slaughter_cauldron: [0, 'C', 'convención', 'convención: carga el caldero: sin eje inequívoco'],
  ok_firebelly: [0, 'M', 'ok_firebelly', 'cara del modelo hacia el frente'],
  ok_bulls: [0, 'M', 'ok_bulls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_gnoblars: [0, 'M', 'ok_gnoblars', 'cara del modelo hacia el frente'],
  ok_trappers: [0, 'M', 'ok_trappers', 'cara del modelo hacia el frente'],
  ok_sabretusks: [0, 'M', 'ok_sabretusks', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_ironguts: [0, 'M', 'ok_ironguts', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_leadbelchers: [3.1416, 'M', 'ok_leadbelchers', 'Leadbelchers: con la flecha hacia la cámara se ven las espaldas (gnoblars en los hombros); con la flecha alejándose se ven de frente con los brazos adelante -> giro 180°'],
  ok_maneaters: [0, 'M', 'ok_maneaters', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_mournfang: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  ok_yhetees: [0, 'M', 'ok_yhetees', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_gorgers: [0, 'M', 'ok_gorgers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_giants: [0, 'M', 'ok_giants', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ok_ironblaster: [3.1416, 'M', 'ok_ironblaster', 'Ironblaster: cabeza del rinox y boca del cañón a la izquierda -> giro 180°'],
  ok_scraplauncher: [0, 'M', 'ok_scraplauncher', 'bestias de tiro delante, tripulación detrás'],
  ok_stonehorn: [3.1416, 'M', 'ok_stonehorn', 'Stonehorn: con la flecha alejándose se ve de frente (cara y colmillos hacia la cámara) -> giro 180°'],
  ok_thundertusk: [3.1416, 'M', 'ok_thundertusk', 'Thundertusk: colmillos curvados hacia la izquierda -> giro 180°'],
  cd_castellan: [3.1416, 'M', 'cd_castellan', 'Castellano de Chaos Dwarfs: con la flecha alejándose se ve la barba y el rostro; con la flecha hacia la cámara se ve la joroba/espalda -> giro 180°'],
  cd_seneschal: [0, 'M', 'cd_seneschal', 'cara del modelo hacia el frente'],
  cd_daemonsmith: [0, 'M', 'cd_daemonsmith', 'cara del modelo hacia el frente'],
  cd_prophet: [0, 'M', 'cd_prophet', 'cara del modelo hacia el frente'],
  cd_daemonsmith_taurus: [0, 'M', 'cd_daemonsmith_taurus', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_prophet_taurus: [0, 'G', 'cd_daemonsmith_lammasu', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_khan: [0, 'M', 'cd_khan', 'cara del modelo hacia el frente'],
  cd_khan_wolf: [0, 'M', 'cd_khan_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_taruk: [0, 'M', 'cd_taruk', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_guard: [0, 'M', 'cd_guard', 'cara del modelo hacia el frente'],
  cd_hobgoblins: [0, 'M', 'cd_hobgoblins', 'cara del modelo hacia el frente'],
  cd_wolfriders: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  cd_blunderbuss: [0, 'M', 'cd_blunderbuss', 'cara del modelo hacia el frente'],
  cd_ironsworn: [0, 'M', 'cd_ironsworn', 'cara del modelo hacia el frente'],
  cd_hailshot: [0, 'M', 'cd_hailshot', 'cara del modelo hacia el frente'],
  cd_render: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  cd_centaurs: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  cd_kdaai: [0, 'M', 'cd_kdaai', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_manburner: [0, 'M', 'cd_manburner', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_taurus: [0, 'M', 'cd_taurus', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_mortar: [0, 'M', 'cd_mortar', 'boca del arma/máquina hacia el frente'],
  cd_rocket: [0, 'M', 'cd_rocket', 'boca del arma/máquina hacia el frente'],
  cd_magma: [0, 'M', 'cd_magma', 'boca del arma/máquina hacia el frente'],
  cd_bolt: [0, 'M', 'cd_bolt', 'boca del arma/máquina hacia el frente'],
  cd_ironDaemon: [0, 'M', 'cd_ironDaemon', 'bestias de tiro delante, tripulación detrás'],
  ct_gatekeeper: [0, 'M', 'ct_gatekeeper', 'cara del modelo hacia el frente'],
  ct_gatekeeper_horse: [0, 'M', 'ct_gatekeeper_horse', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_gatemaster: [0, 'G', 'ct_miaoying_h', 'cara del modelo hacia el frente'],
  ct_gatemaster_horse: [0, 'M', 'ct_gatemaster_horse', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_magistrate: [0, 'M', 'ct_magistrate', 'cara del modelo hacia el frente'],
  ct_magistrate_lantern: [0, 'M', 'ct_magistrate_lantern', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_strategist: [0, 'M', 'ct_strategist', 'cara del modelo hacia el frente'],
  ct_strategist_lantern: [0, 'M', 'ct_strategist_lantern', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_shugengan: [0, 'M', 'ct_shugengan', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_shugengan_gen: [-1.5708, 'M', 'ct_shugengan_gen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_miaoying: [0, 'C', 'convención', 'convención: forma humana, pose torcida: perfil ambiguo'],
  ct_miaoying_h: [0, 'M', 'ct_miaoying_h', 'cara del modelo hacia el frente'],
  ct_jade: [0, 'M', 'ct_jade', 'cara del modelo hacia el frente'],
  ct_jade_spear: [0, 'M', 'ct_jade_spear', 'cara del modelo hacia el frente'],
  ct_lancers: [0, 'M', 'ct_lancers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_cannon: [0, 'M', 'ct_cannon', 'boca del arma/máquina hacia el frente'],
  ct_rockets: [0, 'M', 'ct_rockets', 'boca del arma/máquina hacia el frente'],
  ct_lanterns: [0, 'M', 'ct_lanterns', 'bestias de tiro delante, tripulación detrás'],
  ct_lanterns_amb: [0, 'G', 'ct_lanterns', 'bestias de tiro delante, tripulación detrás'],
  ct_sentinel: [0, 'G', 'ct_sentinel_jade', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_sentinel_jade: [0, 'M', 'ct_sentinel_jade', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_sentinel_obsidian: [0, 'G', 'ct_sentinel_jade', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_sentinel_granite: [0, 'G', 'ct_sentinel_jade', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_sentinel_warpstone: [0, 'G', 'ct_sentinel_jade', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_glade_riders_sk: [0, 'G', 'we_glade_riders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_warhawks_sk: [0, 'G', 'we_warhawks', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_pack_hounds_sk: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  we_pack_cats_sk: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_pack_boars_sk: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_pack_bears_sk: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_khorne_throne: [0, 'M', 'dm_herald_khorne_throne', 'bestias de tiro delante, tripulación detrás'],
  dm_herald_slaanesh_chariot: [0, 'M', 'dm_herald_slaanesh_chariot', 'bestias de tiro delante, tripulación detrás'],
  dm_herald_slaanesh_exalted: [0, 'M', 'dm_herald_slaanesh_exalted', 'bestias de tiro delante, tripulación detrás'],
  de_deathhag_cauldron: [0, 'M', 'de_deathhag_cauldron', 'bestias de tiro delante, tripulación detrás'],
  de_dreadlord_chariot: [0, 'C', 'proc', 'bestias de tiro delante, tripulación detrás'],
  de_master_chariot: [0, 'C', 'proc', 'bestias de tiro delante, tripulación detrás'],
  de_dreadlord_manticore: [0, 'G', 'woc_lord_manticore', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_sorceress_pegasus: [0, 'M', 'de_sorceress_pegasus', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_supreme_pegasus: [0, 'M', 'de_supreme_pegasus', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_sorceress_steed: [0, 'G', 'de_dreadlord_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_supreme_steed: [0, 'G', 'de_dreadlord_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_sorceress_cold: [0, 'M', 'de_sorceress_cold', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_beastmaster_manticore: [0, 'G', 'woc_lord_manticore', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  de_beastmaster_chariot: [0, 'M', 'de_beastmaster_chariot', 'bestias de tiro delante, tripulación detrás'],
  de_shrine: [0, 'G', 'de_medusa', 'bestias de tiro delante, tripulación detrás'],
  de_supreme_dragon: [0, 'G', 'de_dreadlord_dragon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_burningchariot: [0, 'M', 'dm_burningchariot', 'bestias de tiro delante, tripulación detrás'],
  wolf_riders_snk: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  orc_bigboss_boar: [0, 'G', 'orc_warboss_boar', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  black_warboss_boar: [0, 'G', 'orc_warboss_boar', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  black_bigboss_boar: [0, 'G', 'orc_warboss_boar', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  orc_weirdboy_boar: [0, 'M', 'orc_weirdboy_boar', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  orc_weirdnob_boar: [0, 'M', 'orc_weirdnob_boar', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_warboss_spider: [0, 'M', 'gob_warboss_spider', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_bigboss_spider: [0, 'M', 'gob_bigboss_spider', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_warboss_wolf: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_warboss_wolf_amb: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_bigboss_wolf: [0, 'M', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_bigboss_wolf_amb: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_oddnob_wolf: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_oddnob_wolf_amb: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_oddgit_wolf: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  gob_oddgit_wolf_amb: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  black_warboss_chariot: [0, 'M', 'black_warboss_chariot', 'bestias de tiro delante, tripulación detrás'],
  black_bigboss_chariot: [0, 'G', 'black_warboss_chariot', 'bestias de tiro delante, tripulación detrás'],
  wolf_riders_hp: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  wolf_riders_amb_hp: [0, 'G', 'gob_bigboss_wolf', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_cannon_ogre: [0, 'G', 'ct_cannon', 'boca del arma/máquina hacia el frente'],
  ct_cannon_ogre_gp: [0, 'G', 'ct_cannon', 'boca del arma/máquina hacia el frente'],
  ct_rockets_ogre: [0, 'G', 'ct_rockets', 'boca del arma/máquina hacia el frente'],
  ct_rockets_ogre_gp: [0, 'G', 'ct_rockets', 'boca del arma/máquina hacia el frente'],
  ct_jade_cdg: [0, 'G', 'ct_jade', 'cara del modelo hacia el frente'],
  ct_lancers_cdg: [0, 'G', 'ct_lancers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_seaguard_g: [0, 'G', 'he_ship', 'cara del modelo hacia el frente'],
  he_seaguard_dr: [0, 'G', 'he_ship', 'cara del modelo hacia el frente'],
  he_spearmen_lc: [0, 'G', 'he_spearmen', 'cara del modelo hacia el frente'],
  he_spearmen_mc: [0, 'G', 'he_spearmen', 'cara del modelo hacia el frente'],
  he_spearmen_lcmc: [0, 'G', 'he_spearmen', 'cara del modelo hacia el frente'],
  he_archers_lc: [0, 'G', 'he_archers', 'cara del modelo hacia el frente'],
  he_archers_mc: [0, 'G', 'he_archers', 'cara del modelo hacia el frente'],
  he_archers_lcmc: [0, 'G', 'he_archers', 'cara del modelo hacia el frente'],
  he_shadow_amb: [0, 'G', 'he_shadow', 'cara del modelo hacia el frente'],
  he_skycutter_amb: [0, 'G', 'he_skycutter', 'bestias de tiro delante, tripulación detrás'],
  he_skycutter_bt_amb: [0, 'G', 'he_skycutter', 'bestias de tiro delante, tripulación detrás'],
  we_dryads_amb: [0, 'G', 'we_dryads', 'cara del modelo hacia el frente'],
  we_treekin_amb: [0, 'G', 'we_treekin', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_treeman_amb: [0, 'G', 'we_treeman', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  we_ancient_amb: [0, 'G', 'we_ancient', 'cara del modelo hacia el frente'],
  road_wardens: [0, 'G', 'outriders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  road_wardens_p: [0, 'G', 'outriders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  teutogen: [0, 'M', 'teutogen', 'cara del modelo hacia el frente'],
  emp_harbinger: [0, 'G', 'emp_priest', 'cara del modelo hacia el frente'],
  imp_ogres: [0, 'M', 'imp_ogres', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dw_impmerc: [0, 'G', 'dw_warriors', 'cara del modelo hacia el frente'],
  dw_impmerc_gw: [0, 'G', 'dw_warriors', 'cara del modelo hacia el frente'],
  dw_impmerc_sp: [0, 'G', 'dw_warriors', 'cara del modelo hacia el frente'],
  dw_impmerc_xb: [0, 'G', 'dw_warriors', 'cara del modelo hacia el frente'],
  dw_impmerc_hg: [0, 'G', 'dw_warriors', 'cara del modelo hacia el frente'],
  empire_knights_ww: [0, 'G', 'empire_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  inner_circle_ww: [0, 'G', 'inner_circle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dw_royalwarriors_ga: [0, 'G', 'dw_longbeards', 'cara del modelo hacia el frente'],
  dw_sapper: [0, 'G', 'dw_engineer', 'cara del modelo hacia el frente'],
  dw_thunderers_em: [0, 'G', 'dw_thunderers', 'cara del modelo hacia el frente'],
  woc_chieftain: [0, 'G', 'woc_aspiring', 'cara del modelo hacia el frente'],
  woc_berserkers: [0, 'G', 'woc_marauders', 'cara del modelo hacia el frente'],
  woc_chieftain_horse: [0, 'M', 'woc_chieftain_horse', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_huscarls: [0, 'G', 'woc_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_centigors_sons: [0, 'G', 'bm_centigors', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_skinwolves: [0, 'G', 'woc_trolls', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_chosen_chariot: [0, 'M', 'woc_chosen_chariot', 'cabeza del caballo de tiro a la derecha en perfil: frente = flecha'],
  woc_marauders_amb: [0, 'G', 'woc_marauders', 'cara del modelo hacia el frente'],
  woc_marauders_gw_amb: [0, 'G', 'woc_marauders', 'cara del modelo hacia el frente'],
  woc_horsemen_amb: [0, 'G', 'woc_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_aspiring_amb: [0, 'G', 'woc_aspiring', 'cara del modelo hacia el frente'],
  woc_marauders_famb: [0, 'G', 'woc_marauders', 'cara del modelo hacia el frente'],
  woc_marauders_gw_famb: [0, 'G', 'woc_marauders', 'cara del modelo hacia el frente'],
  woc_horsemen_famb: [0, 'G', 'woc_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_guardchariot: [3.1416, 'G', 'tk_chariot', 'carro esqueleto: bestias de tiro a la izquierda del eje (captura de perfil) -> giro 180°'],
  tk_archnecro: [0, 'G', 'tk_necrotect', 'cara del modelo hacia el frente'],
  tk_vushabti: [0, 'G', 'tk_ushabti', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_necroserpent: [0, 'C', 'convención', 'convención: serpiente: perfil ambiguo'],
  bm_primalhounds: [0, 'G', 'bm_hounds', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_hhandler: [0, 'M', 'woc_hhandler', 'cara del modelo hacia el frente'],
  bm_ravager: [0, 'G', 'bm_ungor', 'cara del modelo hacia el frente'],
  lm_skinkhandler: [0, 'M', 'lm_skinkhandler', 'cara del modelo hacia el frente'],
  we_beastkeeper: [0, 'C', 'proc', 'cara del modelo hacia el frente'],
  squig_herder: [0, 'G', 'squig_herd', 'cara del modelo hacia el frente'],
  sk_packmaster: [0, 'M', 'sk_packmaster', 'cara del modelo hacia el frente'],
  sk_thingscatcher: [0, 'C', 'proc', 'cara del modelo hacia el frente'],
  bm_warherd: [0, 'G', 'bm_gor', 'cara del modelo hacia el frente'],
  bm_warherd_u: [0, 'G', 'bm_ungor', 'cara del modelo hacia el frente'],
  bm_warherd_shtw: [0, 'G', 'bm_gor', 'cara del modelo hacia el frente'],
  bm_warherd_shtw_u: [0, 'G', 'bm_ungor', 'cara del modelo hacia el frente'],
  bm_warherd_awth: [0, 'G', 'bm_gor_aw', 'cara del modelo hacia el frente'],
  bm_warherd_awth_u: [0, 'G', 'bm_ungor', 'cara del modelo hacia el frente'],
  bm_warherd_awtw: [0, 'G', 'bm_gor_aw', 'cara del modelo hacia el frente'],
  bm_warherd_awtw_u: [0, 'G', 'bm_ungor', 'cara del modelo hacia el frente'],
  lm_oldblood_carno: [0, 'M', 'lm_oldblood_carno', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  lm_scar_carno: [2.3562, 'M', 'lm_scar_carno', 'Carnosaurio (Scar-Veteran): la malla está posada a 45° respecto al eje de la peana; con yaw 3π/4 la cabeza queda sobre la flecha en las vistas cenitales a135 y a225 (comprobadas yaw 0, ±π/2, π, 2.0, 2.36, 2.7)'],
  woc_spawn_khorne: [0, 'G', 'woc_spawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_spawn_nurgle: [0, 'G', 'woc_spawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_spawn_slaanesh: [0, 'G', 'woc_spawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_spawn_tzeentch: [0, 'G', 'woc_spawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_prophet_lammasu: [0, 'G', 'cd_daemonsmith_lammasu', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_prophet_bale: [0, 'G', 'cd_daemonsmith_lammasu', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_daemonsmith_lammasu: [0, 'M', 'cd_daemonsmith_lammasu', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  cd_mortar_hb: [0, 'G', 'cd_mortar', 'boca del arma/máquina hacia el frente'],
  cd_rocket_hb: [0, 'G', 'cd_rocket', 'boca del arma/máquina hacia el frente'],
  cd_magma_hb: [0, 'G', 'cd_magma', 'boca del arma/máquina hacia el frente'],
  bm_gor_amb: [0, 'G', 'bm_gor', 'cara del modelo hacia el frente'],
  bm_gor_aw_amb: [0, 'G', 'bm_gor_aw', 'cara del modelo hacia el frente'],
  bm_ungor_amb: [0, 'G', 'bm_ungor', 'cara del modelo hacia el frente'],
  bm_ungor_bow_amb: [0, 'G', 'bm_ungor_bow', 'cara del modelo hacia el frente'],
  dw_cannon_ff: [0, 'G', 'dw_cannon', 'boca del arma/máquina hacia el frente'],
  dw_organ_ff: [0, 'G', 'rc_organ', 'boca del arma/máquina hacia el frente'],
  dw_flame_ff: [0, 'G', 'dw_flame', 'boca del arma/máquina hacia el frente'],
  tk_skirmishers_amb: [0, 'G', 'tk_skirmishers', 'cara del modelo hacia el frente'],
  tk_horse_archers_cr: [0, 'G', 'tk_horse_archers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_horse_archers_mo: [0, 'G', 'tk_horse_archers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dw_slayers_g: [0, 'G', 'dw_slayers', 'cara del modelo hacia el frente'],
  state_troops: [0, 'M', 'state_troops', 'cara del modelo hacia el frente'],
  state_vets: [0, 'M', 'state_vets', 'cara del modelo hacia el frente'],
  night_gobs: [0, 'M', 'night_gobs', 'cara del modelo hacia el frente'],
  boar_riders: [0, 'M', 'boar_riders', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_duke_foot: [0, 'M', 'br_duke_foot', 'cara del modelo hacia el frente'],
  br_duke_peg: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_duke_rpeg: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_baron_foot: [0, 'G', 'br_duke_foot', 'cara del modelo hacia el frente'],
  br_baron_peg: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_baron_hippo: [0, 'M', 'br_baron_hippo', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_paladin_foot: [0, 'G', 'br_duke_foot', 'cara del modelo hacia el frente'],
  br_paladin_peg: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_paladin_rpeg: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_prophetess_war16: [0, 'G', 'br_damsel_war12', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_damsel_war16: [0, 'G', 'br_damsel_war12', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_prophetess_war12: [0, 'G', 'br_damsel_war12', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_damsel_war12: [0, 'M', 'br_damsel_war12', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_prophetess_uni: [0, 'M', 'br_prophetess_uni', 'cabeza del unicornio hacia +z de la malla (yaw 0): v843p, vista rasterizada de la malla compuesta, misma convención que we_weaver_unicorn'],
  br_damsel_uni: [0, 'G', 'br_prophetess_uni', 'malla compartida (v843p): el mod solo trae «Profetisa en unicornio»'],
  br_prophetess_rpeg: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  br_sergeant_mtd: [0, 'G', 'br_baron', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_garrison_eagle: [0, 'G', 'he_noble_eagle', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_garrison_griffon: [0, 'G', 'he_noble_griffon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  he_garrison_skycutter: [0, 'G', 'he_skycutter', 'bestias de tiro delante, tripulación detrás'],
  he_garrison_skycutter_amb: [0, 'G', 'he_skycutter', 'bestias de tiro delante, tripulación detrás'],
  woc_lord_cchariot: [3.1416, 'G', 'woc_lord_chariot', 'carro del Caos: bestia de tiro a la izquierda, tripulación a la derecha -> giro 180°'],
  woc_exalted_cchariot: [3.1416, 'G', 'woc_lord_chariot', 'carro del Caos: bestia de tiro a la izquierda, tripulación a la derecha -> giro 180°'],
  woc_aspiring_cchariot: [3.1416, 'M', 'woc_aspiring_cchariot', 'carro (Chosen): bestias a la izquierda -> giro 180°'],
  tk_cohort: [0, 'G', 'tk_warriors', 'cara del modelo hacia el frente'],
  tk_cohort_ph: [0, 'G', 'tk_warriors', 'cara del modelo hacia el frente'],
  tk_cohort_a: [0, 'G', 'tk_archers', 'cara del modelo hacia el frente'],
  tk_cohort_cav: [0, 'G', 'tk_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_cohort_cav_cc: [0, 'G', 'tk_horsemen', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_cohort_ca: [0, 'G', 'tk_horse_archers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_cohort_ca_cc: [0, 'G', 'tk_horse_archers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  emp_harald: [0, 'G', 'emp_grandmaster', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  emp_hans: [0, 'G', 'emp_grandmaster', 'cara del modelo hacia el frente'],
  dw_thorgrim: [0, 'G', 'dw_king', 'cara del modelo hacia el frente'],
  dw_ungrim: [0, 'G', 'dw_king', 'cara del modelo hacia el frente'],
  dw_burlok: [0, 'G', 'dw_king', 'cara del modelo hacia el frente'],
  woc_frydaal: [0, 'G', 'woc_lord', 'cara del modelo hacia el frente'],
  tk_apophas: [0, 'G', 'tk_king', 'cara del modelo hacia el frente'],
  tk_nekaph: [0, 'G', 'tk_king', 'cara del modelo hacia el frente'],
  bm_kralmaw: [0, 'G', 'bm_gbs', 'cara del modelo hacia el frente'],
  bm_ghorros: [0, 'M', 'bm_ghorros', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  tk_settra: [3.1416, 'G', 'tk_king_chariot', 'carro del rey: bestias de tiro a la izquierda -> giro 180°'],
  woc_gspawn: [0, 'M', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_gspawnk: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_gspawnn: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_gspawns: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_gspawnt: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_gspawn: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_gspawnk: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_gspawnn: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_gspawns: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_gspawnt: [0, 'G', 'woc_gspawn', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_preyton: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  bm_preyton_amb: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  bm_preyton_fr: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  woc_warpfire: [0, 'G', 'woc_galrauch', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_warpfire_w1: [0, 'G', 'woc_galrauch', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_warpfire_w2: [0, 'G', 'woc_galrauch', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  war_wagon: [0, 'G', 'steam_tank', 'bestias de tiro delante, tripulación detrás'],
  emp_engineer_wagon: [0, 'G', 'steam_tank', 'bestias de tiro delante, tripulación detrás'],
  dm_herald_slaanesh_w1: [0, 'G', 'dm_herald_slaanesh', 'cara del modelo hacia el frente'],
  dm_herald_slaanesh_w2: [0, 'G', 'dm_herald_slaanesh', 'cara del modelo hacia el frente'],
  dm_herald_slaanesh_steed_w1: [0, 'G', 'dm_herald_slaanesh_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_slaanesh_steed_w2: [0, 'G', 'dm_herald_slaanesh_steed', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  ct_lanterns_hail: [0, 'M', 'ct_lanterns_hail', 'bestias de tiro delante, tripulación detrás'],
  ct_lanterns_amb_hail: [0, 'G', 'ct_lanterns_hail', 'bestias de tiro delante, tripulación detrás'],
  cd_blackboss: [0, 'M', 'cd_blackboss', 'cara del modelo hacia el frente'],
  cd_blackorcs: [0, 'M', 'cd_blackorcs', 'cara del modelo hacia el frente'],
  cd_hellcannon: [0, 'G', 'woc_hellcannon', 'boca del arma/máquina hacia el frente'],
  vc_risen: [0, 'G', 'vc_zombies', 'cara del modelo hacia el frente'],
  dm_burning: [0, 'G', 'dm_burningchariot', 'bestias de tiro delante, tripulación detrás'],
  de_scourge: [0, 'M', 'de_scourge', 'bestias de tiro delante, tripulación detrás'],
  de_coldchariot: [0, 'G', 'woc_gorechariot', 'gorebestia delante (derecha), tripulación detrás: frente = flecha'],
  cd_sneakygits: [0, 'M', 'cd_sneakygits', 'cara del modelo hacia el frente'],
  vc_necro_terror: [0, 'C', 'convención', 'convención: Terror: perfil ambiguo'],
  vc_necro_dragon: [0, 'G', 'vc_count_dragon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  vc_thrall_coven: [0, 'M', 'vc_thrall_coven', 'bestias de tiro delante, tripulación detrás'],
  vc_ghoulking_terror: [0, 'C', 'convención', 'convención: perfil ambiguo'],
  vc_necro_mortis: [0, 'M', 'vc_necro_mortis', 'bestias de tiro delante, tripulación detrás'],
  vc_acolyte_mortis: [0, 'G', 'vc_necro_mortis', 'bestias de tiro delante, tripulación detrás'],
  vc_acolyte_nightmare: [0, 'G', 'vc_necro_nightmare', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_wtroll: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  bm_wmerc_hw: [0, 'C', 'proc', 'cara del modelo hacia el frente'],
  bm_wmerc_sb: [0, 'C', 'proc', 'cara del modelo hacia el frente'],
  bm_cart: [0, 'C', 'proc', 'bestias de tiro delante, tripulación detrás'],
  rc_prince: [0, 'G', 'empire_captain', 'cara del modelo hacia el frente'],
  rc_prince_h: [0, 'G', 'empire_general_h', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_captain: [0, 'G', 'empire_captain', 'cara del modelo hacia el frente'],
  rc_captain_h: [0, 'G', 'empire_general_h', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_wizard1: [0, 'G', 'empire_mage', 'cara del modelo hacia el frente'],
  rc_wizard1_h: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_wizard2: [0, 'G', 'empire_mage', 'cara del modelo hacia el frente'],
  rc_wizard2_h: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_wizard3: [0, 'G', 'empire_mage', 'cara del modelo hacia el frente'],
  rc_wizard3_h: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_sellswords: [0, 'G', 'state_troops', 'cara del modelo hacia el frente'],
  rc_vsellswords: [0, 'G', 'state_vets', 'cara del modelo hacia el frente'],
  rc_sellswords_ph: [0, 'G', 'state_troops', 'cara del modelo hacia el frente'],
  rc_vsellswords_ph: [0, 'G', 'state_vets', 'cara del modelo hacia el frente'],
  rc_freeblades: [0, 'G', 'empire_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_vfreeblades: [0, 'G', 'empire_knights', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_outriders: [0, 'G', 'pistoliers', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  rc_mortar: [0, 'G', 'mortar', 'boca del arma/máquina hacia el frente'],
  rc_organ: [0, 'M', 'rc_organ', 'boca del arma/máquina hacia el frente'],
  rc_bombard: [0, 'C', 'convención', 'convención: cañón: perfil ambiguo'],
  rc_brigands: [0, 'M', 'rc_brigands', 'cara del modelo hacia el frente'],
  br_outcast2: [0, 'G', 'br_outcast', 'cara del modelo hacia el frente'],
  br_outcast_h: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_outcast2_h: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  br_outcast3_h: [0, 'C', 'proc', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  emp_general_igriffon: [0, 'M', 'emp_general_igriffon', 'Grifo imperial: cabeza blanca sobre la flecha en las vistas cenitales a135 y a225 (yaw 0)'],
  woc_exalted_manticore: [0, 'G', 'woc_lord_manticore', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_exalted_dragon: [0, 'G', 'woc_galrauch', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_lord_daemon: [0, 'M', 'woc_lord_daemon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_exalted_daemon: [0, 'M', 'woc_exalted_daemon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_aspiring_daemon: [0, 'M', 'woc_aspiring_daemon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_sorc_daemon: [0, 'M', 'woc_sorc_daemon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  woc_exsorc_daemon: [0, 'M', 'woc_exsorc_daemon', 'cabeza de la montura/monstruo (y jinete) hacia el frente'],
  dm_herald_slaanesh_chariot_w1: [0, 'G', 'dm_herald_slaanesh_chariot', 'bestias de tiro delante, tripulación detrás'],
  dm_herald_slaanesh_chariot_w2: [0, 'G', 'dm_herald_slaanesh_chariot', 'bestias de tiro delante, tripulación detrás'],
  dm_herald_slaanesh_exalted_w1: [0, 'G', 'dm_herald_slaanesh_exalted', 'bestias de tiro delante, tripulación detrás'],
  dm_herald_slaanesh_exalted_w2: [0, 'G', 'dm_herald_slaanesh_exalted', 'bestias de tiro delante, tripulación detrás'],
  he_noble_tiranoc: [0, 'G', 'he_prince_tiranoc', 'bestias de tiro delante, tripulación detrás'],
};
// </FRONT_TABLE>
export const figYaw = (ut, RM) => { const f = FRONT_TABLE[ut]; return f ? f[0] : RM ? (RM.yaw || 0) + (YAWFIX[RM.id] || 0) : 0; };
const HMAX = { emp_lector_altar: 6.2, ct_shugengan: 3.4, ct_shugengan_gen: 3.4, dm_herald_slaanesh_chariot: 3.6, de_shrine: 3.4, ct_miaoying_h: 2.6, br_green_knight: 3.2 };
// modelos reales del mod de TTS (los únicos con malla utilizable): tamaño en pulgadas del lado mayor y giro
const REALM = { de_deathhag_cauldron: { id: 'de_deathhag_cauldron', size: 3.3 }, he_archmage_star: { id: 'he_archmage_star', size: 5.2 }, he_prince_star: { id: 'he_prince_star', size: 5.2 }, he_skycutter: { id: 'he_skycutter', size: 4.0 }, he_skycutter_bt: { id: 'he_skycutter', size: 4.0 }, we_lord_dragon: { id: 'we_lord_dragon', size: 5.2 }, we_lord_stag: { id: 'we_lord_stag', size: 2.6, by: 'h' }, we_captain_stag: { id: 'we_captain_stag', size: 2.6, by: 'h' }, we_eagle: { id: 'we_eagle', size: 3.0 }, we_waywatchers: { id: 'we_waywatchers', size: 1.1, by: 'h' }, we_waystalker: { id: 'we_waystalker', size: 1.2, by: 'h' }, we_shadowdancer: { id: 'we_shadowdancer', size: 1.2, by: 'h' }, we_shadowdancer_w: { id: 'we_shadowdancer', size: 1.2, by: 'h' }, we_sisters: { id: 'we_sisters', size: 2.0, by: 'h' }, emp_general_griffon: { id: 'emp_general_griffon', size: 3.6 }, br_realm_foot: { id: 'br_realm_foot', size: 1.1, by: 'h' }, emp_archers: { id: 'emp_archers', size: 1.1, by: 'h' }, emp_engineer: { id: 'emp_engineer', size: 1.15, by: 'h' }, river_trolls: { id: 'river_trolls', size: 2.0, by: 'h' }, stone_trolls: { id: 'river_trolls', size: 2.0, by: 'h' }, squig_herd: { id: 'squig_herd', size: 1.0 }, tk_swarm: { id: 'tk_swarm', size: 1.5 }, dw_anvil: { id: 'dw_anvil', size: 2.3 }, dw_gyrobomber: { id: 'dw_gyrobomber', size: 2.0 }, dw_king_shield: { id: 'dw_king_shield', size: 2.0 }, he_dragonmage: { id: 'he_dragonmage', size: 4.2 }, 
  he_flamespyre: { id: 'he_flamespyre', size: 4.0 }, he_frostheart: { id: 'he_frostheart', size: 4.0 }, woc_lord_manticore: { id: 'woc_lord_manticore', size: 3.6 }, 
  woc_chimera: { id: 'woc_chimera', size: 3.4 }, bm_shaggoth: { id: 'bm_shaggoth', size: 2.6, by: 'h' }, bm_cygor: { id: 'bm_cygor', size: 3.2 },
  woc_gorechariot: { id: 'woc_gorechariot', size: 3.6 }, he_archmage: { id: 'he_archmage', size: 1.3, by: 'h' }, he_spearmen: { id: 'he_spearmen', size: 1.15, by: 'h' }, he_archers: { id: 'he_archers', size: 1.15, by: 'h' },
  he_whitelions: { id: 'he_whitelions', size: 1.2, by: 'h' }, he_phoenix: { id: 'he_phoenix', size: 1.2, by: 'h' }, he_shadow: { id: 'he_shadow', size: 1.15, by: 'h' }, he_sisters: { id: 'he_sisters', size: 1.15, by: 'h' },
  he_reavers: { id: 'he_reavers', size: 2.0, by: 'h' }, he_dragonprinces: { id: 'he_dragonprinces', size: 2.1 }, he_eagle: { id: 'he_eagle', size: 3.0 }, he_boltthrower: { id: 'he_boltthrower', size: 2.2 },
  dw_warriors_gw: { id: 'dw_warriors_gw', size: 2.0, by: 'h' } /* v843e: la altura incluye el asta del arma a dos manos (mide ~2x el enano): se escala para que el cuerpo mida como el resto de la infantería enana (0,85") */, dw_quarrellers: { id: 'dw_quarrellers', size: 0.85, by: 'h' }, dw_thunderers: { id: 'dw_thunderers', size: 0.85, by: 'h' },
  dw_irondrakes: { id: 'dw_irondrakes', size: 0.85, by: 'h' }, dw_miners: { id: 'dw_miners', size: 0.85, by: 'h' }, dw_rangers: { id: 'dw_rangers', size: 0.85, by: 'h' },
  dw_longbeards: { id: 'dw_longbeards', size: 0.9, by: 'h' }, dw_slayers_ahw: { id: 'dw_drslayer', size: 0.9, by: 'h' },
  dw_king: { id: 'dw_king', size: 1.0, by: 'h' }, dw_thane: { id: 'dw_thane', size: 1.0, by: 'h' }, dw_runelord: { id: 'dw_runesmith', size: 1.0, by: 'h' }, dw_runesmith: { id: 'dw_runesmith', size: 1.0, by: 'h' },
  dw_dslayer: { id: 'dw_dslayer', size: 1.0, by: 'h' }, dw_drslayer: { id: 'dw_drslayer', size: 1.0, by: 'h' }, dw_gyro: { id: 'dw_gyro', size: 2.0 }, dw_grudge: { id: 'dw_grudge', size: 2.2 }, dw_organ: { id: 'dw_organ', size: 2.2 },
  trolls: { id: 'trolls', size: 3.0 }, br_errant: { id: 'br_errant', size: 2.0 }, br_realm: { id: 'br_realm', size: 2.0 }, br_questing: { id: 'br_questing', size: 2.0 }, br_grail: { id: 'br_grail', size: 2.0 }, br_pegasus: { id: 'br_pegasus', size: 2.0, by: 'h' },
  br_men_at_arms: { id: 'br_men_at_arms', size: 1.15, by: 'h' }, br_pilgrims: { id: 'br_pilgrims', size: 1.15, by: 'h' }, br_bowmen: { id: 'br_bowmen', size: 1.15, by: 'h' }, br_damsel: { id: 'br_damsel', size: 1.15, by: 'h' },
  br_trebuchet: { id: 'br_trebuchet', size: 3.6 },
  we_lord: { id: 'we_lord', size: 1.35, by: 'h' }, we_captain: { id: 'we_captain', size: 1.3, by: 'h' }, we_spellsinger: { id: 'we_spellsinger', size: 1.3, by: 'h' }, we_spellweaver: { id: 'we_spellweaver', size: 1.3, by: 'h' },
  we_glade_guard: { id: 'we_glade_guard', size: 1.15, by: 'h' }, we_eternal: { id: 'we_eternal', size: 1.2, by: 'h' }, we_dryads: { id: 'we_dryads', size: 1.4, by: 'h' }, we_rangers: { id: 'we_rangers', size: 1.15, by: 'h' },
  we_wardancers: { id: 'we_wardancers', size: 1.2, by: 'h' }, we_glade_riders: { id: 'we_glade_riders', size: 2.6 }, we_wild_riders: { id: 'we_wild_riders', size: 2.6 },
  great_cannon: { id: 'great_cannon', size: 2.2 }, bolt_throwa: { id: 'bolt_throwa', size: 3.0 }, br_squires: { id: 'br_squires', size: 1.15, by: 'h' }, br_prophetess: { id: 'br_prophetess', size: 1.15, by: 'h' },
  we_warhawks: { id: 'we_warhawks', size: 3.4 }, we_treekin: { id: 'we_treekin', size: 2.4, by: 'h' },
  we_treeman: { id: 'we_treeman', size: 3.6, by: 'h' }, we_ancient: { id: 'we_ancient', size: 3.9, by: 'h' }, we_branchwraith: { id: 'we_branchwraith', size: 1.6, by: 'h' }, we_lord_h: { id: 'we_lord_h', size: 2.6 },
  empire_general_h: { id: 'empire_general_h', size: 2.4 }, empire_knights: { id: 'empire_knights', size: 2.2 }, br_duke: { id: 'br_duke', size: 2.4 }, br_baron: { id: 'br_baron', size: 2.3 }, br_paladin: { id: 'br_paladin', size: 2.3 },
  tk_warriors: { id: 'tk_warriors', size: 1.15, by: 'h' }, tk_warriors_sp: { id: 'tk_warriors', size: 1.15, by: 'h' }, 
  woc_lord: { id: 'woc_lord', size: 1.6, by: 'h' }, woc_lord_steed: { id: 'woc_lord_steed', size: 2.5 }, woc_exalted: { id: 'woc_exalted', size: 1.6, by: 'h' }, woc_sorc_lord: { id: 'woc_sorc_lord', size: 1.6, by: 'h' }, woc_ex_sorc: { id: 'woc_ex_sorc', size: 1.8, by: 'h' }, woc_dprince: { id: 'woc_dprince', size: 2.8, by: 'h' },
  woc_warriors: { id: 'woc_warriors', size: 1.3, by: 'h' }, woc_warriors_hb: { id: 'woc_warriors', size: 1.3, by: 'h' }, woc_warriors_gw: { id: 'woc_warriors', size: 1.3, by: 'h' }, woc_chosen: { id: 'woc_chosen', size: 1.4, by: 'h' }, woc_marauders: { id: 'woc_marauders', size: 1.25, by: 'h' }, woc_marauders_gw: { id: 'woc_marauders', size: 1.25, by: 'h' }, woc_forsaken: { id: 'woc_forsaken', size: 1.3 },
  woc_ogres: { id: 'woc_ogres', size: 1.8, by: 'h' }, woc_trolls: { id: 'woc_trolls', size: 2.2 },
  bm_beastlord: { id: 'bm_beastlord', size: 1.5, by: 'h' }, bm_wargor: { id: 'bm_wargor', size: 1.4, by: 'h' }, bm_gbs: { id: 'bm_gbs', size: 1.6, by: 'h' }, bm_doombull: { id: 'bm_doombull', size: 2.4, by: 'h' }, bm_dragon_ogres: { id: 'bm_dragon_ogres', size: 2.6, by: 'h' }, bm_ghorgon: { id: 'bm_ghorgon', size: 3.6, by: 'h' },
  orc_weirdboy: { id: 'orc_weirdboy', size: 1.5, by: 'h' }, orc_weirdnob: { id: 'orc_weirdnob', size: 1.6, by: 'h' }, gob_bigboss: { id: 'gob_bigboss', size: 1.3, by: 'h' }, wolf_riders: { id: 'wolf_riders', size: 1.9 } };
const ANIM = new Map(); let animOwner = null; let animOn = false;
export const animActive = () => animOn;
// animación suave de las unidades: se dibuja una copia con la posición mostrada acercándose a la real
function animate(s) {
  if (animOwner !== s) { ANIM.clear(); animOwner = s; }
  animOn = false;
  const units = s.units.map((u) => {
    let a = ANIM.get(u.id);
    if (!a) { a = { x: u.x, y: u.y, f: u.face }; ANIM.set(u.id, a); }
    const dx = u.x - a.x, dy = u.y - a.y; let df = u.face - a.f; df = Math.atan2(Math.sin(df), Math.cos(df));
    if (Math.hypot(dx, dy) < 0.04 && Math.abs(df) < 0.01) { a.x = u.x; a.y = u.y; a.f = u.face; }
    else { const k = Math.hypot(dx, dy) > 14 ? 0.3 : 0.18; a.x += dx * k; a.y += dy * k; a.f += df * 0.22; animOn = true; }
    return a.x === u.x && a.y === u.y && a.f === u.face ? u : { ...u, x: a.x, y: a.y, face: a.f };
  });
  return animOn ? { ...s, units } : s;
}
// Flank Attack: mientras cada bando decide en secreto su fuerza de flanqueo, el rival no ve sus unidades de flanco
const hideFl = (s) => (s.hideFlank != null && s.alt && s.alt.phase === 'fsel' ? { ...s, units: s.units.filter((u) => !(u.flank && u.owner !== s.hideFlank)) } : s);
export function draw(canvas, s00, UI, G) {
  const s0 = hideFl(s00);
  syncTable(s0);
  const s = animate(s0);
  if (view.m3) return t3draw(canvas, s, UI);
  const ctx = canvas.getContext('2d'); const t = performance.now();
  const [c, sn] = cs(); const sc = view.scale * view.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(sc * c, sc * sn, -sc * sn, sc * c,
    view.dpr * (view.w / 2 + view.px) - sc * (c * C0.x - sn * C0.y), view.dpr * (view.h / 2 + view.py) - sc * (sn * C0.x + c * C0.y));
  drawTable(ctx, s, UI);
  for (const tr of s.terrain) drawTerrain(ctx, tr);
  drawRival(ctx, s, UI, t);
  const act = alive(s);
  // alcance de movimiento / disparo
  const sel = UI.sel ? byId(s, UI.sel) : null;
  if (sel && sel.models > 0) {
    if (UI.mode?.k === 'place' || (!UI.mode && UI.prev === 'move')) {
      const m = D(sel).M;
      ctx.lineWidth = 0.14; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([0.5, 0.4]);
      ctx.beginPath(); ctx.arc(sel.x, sel.y, m, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(207,169,74,.6)'; ctx.beginPath(); ctx.arc(sel.x, sel.y, m * 2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    if ((UI.mode?.k === 'shoot' || (!UI.mode && UI.prev === 'shoot')) && rangedOf(sel)) {
      const r = rangedOf(sel).range;
      ctx.lineWidth = 0.14; ctx.strokeStyle = 'rgba(255,138,90,.7)'; ctx.setLineDash([0.6, 0.5]); ctx.beginPath(); ctx.arc(sel.x, sel.y, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,138,90,.35)'; ctx.beginPath(); ctx.arc(sel.x, sel.y, r / 2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  for (const u of act) drawUnitBody(ctx, s, u);
  // anillos de estado
  for (const u of act) {
    if (u.fleeing) drawRing(ctx, u, '#9fb4ff', 0.2, 0.3, [0.3, 0.3]);
    if (u.id === UI.sel) drawRing(ctx, u, '#fff3c4', 0.34, 0.5);
    else if (UI.hover === u.id) drawRing(ctx, u, 'rgba(255,255,255,.5)', 0.2, 0.4);
    if (UI.targets && UI.targets.includes(u.id)) drawRing(ctx, u, UI.mode.k === 'cast' && UI.mode.friend ? '#8be28b' : '#ff5a4a', 0.4 + 0.12 * Math.sin(t / 220), 0.6);
    { const ai = atkInfo(UI); if (ai) { if (ai.id === u.id) { drawRing(ctx, u, '#ffb347', 0.5, 0.75); drawRing(ctx, u, '#fff6d6', 0.12, 1.05, [0.5, 0.4]); } else if (ai.res && ai.tg.includes(u.id)) drawRing(ctx, u, '#ff5a4a', 0.4 + 0.12 * Math.sin(t / 220), 0.6); } }
    if (s.phase !== 'deploy' && s.phase !== 'over' && u.owner === s.active && UI.canActIds?.has(u.id) && u.id !== UI.sel && UI.hints) drawRing(ctx, u, 'rgba(207,169,74,.75)', 0.16, 0.35, [0.5, 0.4]);
  }
  // fantasma de movimiento
  if (UI.aimMark && UI.mode?.k === 'shoot') { // punto de puntería del cañón
    const p = w2s(UI.aimMark), q = Math.max(8, view.scale * 0.8);
    ctx.save(); ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, q, 0, 6.2832); ctx.moveTo(p.x - q * 1.4, p.y); ctx.lineTo(p.x + q * 1.4, p.y); ctx.moveTo(p.x, p.y - q * 1.4); ctx.lineTo(p.x, p.y + q * 1.4); ctx.stroke(); ctx.restore();
  }
  if (UI.mode?.k === 'place' && UI.ghost && sel) {
    const gu = { ...sel, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face, files: UI.ghost.files ?? sel.files };
    arrow(ctx, { x: sel.x, y: sel.y }, { x: gu.x, y: gu.y }, 'rgba(255,255,255,.55)', 0.14, [0.4, 0.4], 0.8, viaOf(UI.ghost, gu));
    drawUnitBody(ctx, s, gu, { alpha: 0.9, ghost: true, ok: UI.ghostOk });
  }
  if (UI.mode?.k === 'deploy' && UI.ghost && sel) {
    drawUnitBody(ctx, s, { ...sel, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face }, { alpha: 0.85, ghost: true, ok: UI.ghostOk });
  }
  // efectos
  UI.fx = (UI.fx || []).filter((f) => t - f.t0 < f.ttl);
  for (const f of UI.fx) {
    const a = 1 - (t - f.t0) / f.ttl; ctx.globalAlpha = Math.max(0, a);
    if (f.a && f.b) arrow(ctx, f.a, f.b, f.color, 0.4, null, 1.3);
    if (f.at) { ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(f.at.x, f.at.y, 0.8 + (1 - a) * 2.2, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // etiquetas (espacio pantalla)
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  const fs = Math.max(9.5, Math.min(13, view.scale * 0.95));
  ctx.font = `700 ${fs}px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  {
    const selU = UI.sel != null ? byId(s, UI.sel) : null;
    const lab = act.map((u) => { const { w, d } = dims(u), p = w2s({ x: u.x, y: u.y }); return { u, ax: p.x, ay: p.y, px: p.x, py: p.y - (Math.hypot(w, d) / 2 * view.scale + fs * 1.0), d: -p.y }; });
    drawLabels(ctx, s, selU, lab, fs, view.scale >= 6.5);
    ctx.font = `700 ${fs}px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  }
  floatTxt(ctx, UI, t, (p) => w2s(p));
  // distancias a objetivos
  if (sel && UI.targets) {
    ctx.font = `700 ${fs}px "Alegreya Sans", sans-serif`;
    for (const id of UI.targets) {
      const tu = byId(s, id); if (!tu) continue; const dist = unitDist(sel, tu);
      const p = w2s({ x: tu.x, y: tu.y }); ctx.fillStyle = 'rgba(194,74,63,.92)'; const txt = dist.toFixed(1) + '"'; const tw = ctx.measureText(txt).width + 8;
      rr(ctx, p.x - tw / 2, p.y + fs * 0.9, tw, fs * 1.35, 5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(txt, p.x, p.y + fs * 1.6);
    }
  }
  { const ai = atkInfo(UI); if (ai) { const au = byId(s, ai.id); if (au && au.models > 0) { const { w, d } = dims(au), p = w2s({ x: au.x, y: au.y }); roleTag(ctx, p.x, p.y - (Math.hypot(w, d) / 2 * view.scale + fs * 2.9), ai.role, '#ffb347', fs); }
    for (const id of ai.tg) { if (!ai.res && UI.mode?.k === 'shoot' && ai.tg.length > 3) break; const tu = byId(s, id); if (tu && tu.models > 0) { const { w, d } = dims(tu), p = w2s({ x: tu.x, y: tu.y }); roleTag(ctx, p.x, p.y - (Math.hypot(w, d) / 2 * view.scale + fs * 2.9), 'Objetivo', '#ff7b6b', fs); } } } }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
export { shortName, labelName, unitTag };
// tipo de tropa para el icono de la etiqueta
function unitKind(u) {
  const d = D(u);
  if (d.cat === 'char') return 'char';
  if (d.cat === 'mach') return 'mach';
  if (/^mon|behemoth/i.test(d.tt || '') || /^mon/i.test(d.mtt || '')) return 'mon';
  if (d.cat === 'cav') return 'cav';
  if (d.ranged) return 'bow';
  if (d.melee?.thrust || d.spear || d.lance) return 'spear';
  if (d.melee?.twoHands) return 'axe';
  return 'sword';
}
// iconos vectoriales (se dibujan en un cuadrado de lado 2r centrado en x,y)
function unitIcon(ctx, kind, x, y, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(1.2, r * 0.26); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const L = (...p) => { ctx.beginPath(); ctx.moveTo(p[0] * r, p[1] * r); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * r, p[i + 1] * r); ctx.stroke(); };
  if (kind === 'sword') { L(-0.75, 0.75, 0.7, -0.7); L(-0.7, 0.05, -0.05, 0.7); }
  else if (kind === 'spear') { L(-0.75, 0.8, 0.45, -0.4); ctx.beginPath(); ctx.moveTo(0.9 * r, -0.9 * r); ctx.lineTo(0.72 * r, -0.2 * r); ctx.lineTo(0.2 * r, -0.72 * r); ctx.closePath(); ctx.fill(); }
  else if (kind === 'axe') { L(-0.7, 0.85, 0.5, -0.65); ctx.beginPath(); ctx.moveTo(0.1 * r, -0.25 * r); ctx.quadraticCurveTo(0.05 * r, -1.0 * r, 0.8 * r, -0.95 * r); ctx.lineTo(0.55 * r, -0.6 * r); ctx.closePath(); ctx.fill(); }
  else if (kind === 'bow') { ctx.beginPath(); ctx.arc(-0.25 * r, 0, 0.85 * r, -1.15, 1.15); ctx.stroke(); L(-0.8, 0, 0.85, 0); ctx.beginPath(); ctx.moveTo(0.95 * r, 0); ctx.lineTo(0.5 * r, -0.32 * r); ctx.lineTo(0.5 * r, 0.32 * r); ctx.closePath(); ctx.fill(); }
  else if (kind === 'cav') { ctx.lineWidth = Math.max(1.6, r * 0.38); ctx.beginPath(); ctx.arc(0, -0.1 * r, 0.62 * r, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke(); }
  else if (kind === 'mach') { ctx.beginPath(); ctx.arc(0, 0, 0.72 * r, 0, 7); ctx.stroke(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; L(Math.cos(a) * 0.72, Math.sin(a) * 0.72, -Math.cos(a) * 0.72, -Math.sin(a) * 0.72); } }
  else if (kind === 'mon') { for (const o of [-0.55, 0, 0.55]) L(o - 0.2, -0.8, o + 0.2, 0.8); }
  else { ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? 0.42 : 0.95; ctx.lineTo(Math.cos(a) * q * r, Math.sin(a) * q * r); } ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// v843t: icono + color de la etiqueta del mapa para los selectores HTML (misma función unitIcon y mismo color de ejército que el mapa)
const _chipCache = new Map();
export function unitChipURL(s, u) {
  const c = col(s, u.owner).color, kind = unitKind(u), key = kind + c;
  if (_chipCache.has(key)) return _chipCache.get(key);
  let url = '';
  try { const cv = document.createElement('canvas'), n = 44; cv.width = cv.height = n; const g = cv.getContext('2d'); g.fillStyle = c; g.beginPath(); g.arc(n / 2, n / 2, n / 2 - 1, 0, 7); g.fill(); unitIcon(g, kind, n / 2, n / 2, n * 0.31, '#10130b'); url = cv.toDataURL('image/png'); } catch (e) { url = ''; }
  _chipCache.set(key, url); return url;
}
// HTML de una unidad en un selector: «[icono] Orcos B 15 ★» (opts.peers = las unidades del mismo selector, para el ordinal si aun así empatan)
export function unitChip(s, u, o = {}) {
  const url = unitChipURL(s, u), esc = (t) => String(t).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  return `${url ? `<img class="uic" alt="" src="${url}">` : `<i class="uic" style="background:${col(s, u.owner).color}"></i>`}${esc(unitTag(s, u, o))}`;
}
// Etiquetas de unidad: placa con icono de tipo, nombre y nº de modelos, unida a su unidad por un vástago; evita solapes
// list: [{ u, ax, ay (ancla en pantalla), px, py (centro deseado), d (profundidad) }]
function drawLabels(ctx, s, sel, list, fs, wantName) {
  ctx.font = `700 ${fs}px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const h = fs * 1.5, ic = h, placed = [];
  const hit = (b) => placed.some((q) => b.x < q.x + q.w + 2 && b.x + b.w + 2 > q.x && b.y < q.y + q.h + 2 && b.y + b.h + 2 > q.y);
  const isSel = (u) => !!sel && sel.id === u.id;
  const order = list.slice().sort((a, b) => (isSel(b.u) - isSel(a.u)) || a.d - b.d);
  for (const it of order) {
    const u = it.u, extra = `${u.joined && u.joined.some((j) => j.models > 0) ? ' ★' : ''}${u.fleeing ? ' ⚑' : ''}${u.merc ? ' ¤' : ''}${u.ally ? ' ◈' : ''}${u.garrison ? ' ⌂' : ''}`;
    const full = unitTag(s, u), small = `${u.models}${extra}`;
    const box = (txt, dy = 0) => { const w = ic + ctx.measureText(txt).width + fs * 0.75; return { x: it.px - w / 2, y: it.py - h / 2 - dy, w, h, txt }; };
    let b = null;
    for (const txt of (wantName || isSel(u) ? [full, small] : [small])) { for (let k = 0; k < 4 && !b; k++) { const c = box(txt, k * (h + 3)); if (!hit(c)) b = c; } if (b) break; }
    if (!b) b = box(small, 0);
    placed.push(b); it.b = b;
  }
  for (const it of list.slice().sort((a, b) => (isSel(a.u) - isSel(b.u)) || b.d - a.d)) {
    const u = it.u, b = it.b, c = col(s, u.owner).color, on = isSel(u);
    ctx.globalAlpha = on ? 1 : 0.94;
    // vástago hasta la unidad
    ctx.strokeStyle = c; ctx.lineWidth = on ? 2 : 1.4; ctx.beginPath(); ctx.moveTo(b.x + b.w / 2, b.y + b.h); ctx.lineTo(it.ax, it.ay); ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(it.ax, it.ay, on ? 3 : 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(14,17,10,.9)'; rr(ctx, b.x, b.y, b.w, b.h, h / 2); ctx.fill();
    ctx.strokeStyle = on ? '#ffe9a6' : c; ctx.lineWidth = on ? 2 : 1.3; ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(b.x + h / 2, b.y + h / 2, h / 2 - 1.5, 0, 7); ctx.fill();
    unitIcon(ctx, unitKind(u), b.x + h / 2, b.y + h / 2, h * 0.31, '#10130b');
    ctx.fillStyle = '#f3eedd'; ctx.fillText(b.txt, b.x + ic + fs * 0.1, b.y + h / 2 + 0.5);
    if ((u.fx && u.fx.length) || u.frog) { ctx.fillStyle = '#c79bff'; ctx.fillText(fxIcons(u), b.x + b.w + 4, b.y + h / 2); }
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'center';
}

// =====================  VISTA 3D (proyección en perspectiva por software, sin dependencias)  =====================
const t3sh = (hex, f) => {
  const n = parseInt(hex.slice(1, 7), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, r * f)) | 0; g = Math.max(0, Math.min(255, g * f)) | 0; b = Math.max(0, Math.min(255, b * f)) | 0;
  return `rgb(${r},${g},${b})`;
};
function t3poly(ctx, pts, fill, stroke, lw = 1, dash = null) {
  ctx.beginPath();
  pts.forEach((q, i) => { const p = t3p(q[0], q[1], q[2] || 0); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
}
function t3line(ctx, pts, color, lw, dash = null) {
  ctx.beginPath(); pts.forEach((q, i) => { const p = t3p(q[0], q[1], q[2] || 0); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
}
function t3circle(ctx, x, y, r, color, lw, dash = null, fill = null, z = 0.02) {
  const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * 7; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]); }
  const q = []; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; q.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]); }
  void pts; t3poly(ctx, q, fill, color, lw, dash);
}
function t3rect(u, pad = 0, dw = null) {
  const { w, d } = dw || dims(u); const c = Math.cos(u.face), s = Math.sin(u.face);
  return [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(([f, l]) => [u.x + c * f * (d / 2 + pad) - s * l * (w / 2 + pad), u.y + s * f * (d / 2 + pad) + c * l * (w / 2 + pad), 0.03]);
}
function t3arrow(ctx, a, b, color, lw, dash = null, z = 0.5, via = []) {
  let pa = t3p(a.x, a.y, z); const pb = t3p(b.x, b.y, z), pv = via.map((q) => t3p(q.x, q.y, z));
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(1.5, lw * view.scale); ctx.setLineDash(dash ? dash.map((v) => v * view.scale) : []);
  ctx.beginPath(); ctx.moveTo(pa.x, pa.y); for (const q of pv) ctx.lineTo(q.x, q.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); ctx.setLineDash([]);
  if (pv.length) pa = pv[pv.length - 1];
  const ang = Math.atan2(pb.y - pa.y, pb.x - pa.x), h = Math.max(8, view.scale * 1.1);
  ctx.beginPath(); ctx.moveTo(pb.x, pb.y); ctx.lineTo(pb.x - Math.cos(ang - .4) * h, pb.y - Math.sin(ang - .4) * h); ctx.lineTo(pb.x - Math.cos(ang + .4) * h, pb.y - Math.sin(ang + .4) * h); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// prisma orientado (caja): ctx, centro, longitud (eje face), anchura, altura inferior/superior
function t3box(ctx, cx, cy, face, len, wid, z0, z1, top, side) {
  const c = Math.cos(face), s = Math.sin(face);
  const cr = [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(([f, l]) => [cx + c * f * len / 2 - s * l * wid / 2, cy + s * f * len / 2 + c * l * wid / 2]);
  const faces = [];
  for (let i = 0; i < 4; i++) { const a = cr[i], b = cr[(i + 1) % 4]; const m = t3p((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (z0 + z1) / 2); faces.push({ a, b, d: m.d, i }); }
  faces.sort((p, q) => q.d - p.d);
  const base = t3p(cx, cy, 0);
  for (const f of faces) {
    const nx = (f.a[1] - f.b[1]), ny = (f.b[0] - f.a[0]); // normal hacia fuera (aprox.)
    const mid = { x: (f.a[0] + f.b[0]) / 2, y: (f.a[1] + f.b[1]) / 2 };
    const out = (mid.x - cx) * nx + (mid.y - cy) * ny;
    const o = out > 0 ? 1 : -1, nnx = nx * o, nny = ny * o;
    const pm = t3p(mid.x, mid.y, z0), pc = t3p(mid.x + nnx * 0.01, mid.y + nny * 0.01, z0);
    if (pc.d > pm.d + 1e-4 && view.pitch < 1.45) continue; // cara trasera
    const lit = 0.72 + 0.28 * Math.max(0, (nnx * -0.5 + nny * -0.8) / Math.hypot(nnx, nny));
    t3poly(ctx, [[f.a[0], f.a[1], z0], [f.b[0], f.b[1], z0], [f.b[0], f.b[1], z1], [f.a[0], f.a[1], z1]], t3sh(side, lit), 'rgba(0,0,0,.35)', 0.7);
  }
  t3poly(ctx, cr.map((q) => [q[0], q[1], z1]), top, 'rgba(0,0,0,.35)', 0.7);
  void base;
}
function t3figure(ctx, x, y, face, o) {
  // soldado: peana, cuerpo y cabeza
  const b = t3p(x, y, 0), tp = t3p(x, y, o.h), r = o.r * view.scale * b.k;
  ctx.globalAlpha = o.alpha;
  ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.beginPath(); ctx.ellipse(b.x + r * 0.2, b.y + r * 0.1, r * 1.05, r * 0.55 * Math.max(0.35, Math.sin(view.pitch)), 0, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(b.x - r, 0, b.x + r, 0); g.addColorStop(0, t3sh(o.color, 0.62)); g.addColorStop(0.5, t3sh(o.color, 1.15)); g.addColorStop(1, t3sh(o.color, 0.7));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - r, b.y); ctx.lineTo(tp.x - r * 0.75, tp.y + r * 0.6); ctx.lineTo(tp.x + r * 0.75, tp.y + r * 0.6); ctx.lineTo(b.x + r, b.y); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(b.x, b.y, r, r * 0.4 * Math.max(0.5, Math.sin(view.pitch)), 0, 0, 7); ctx.fill();
  ctx.fillStyle = o.accent; ctx.fillRect(b.x - r * 0.8, b.y + (tp.y - b.y) * 0.45, r * 1.6, Math.max(1, r * 0.22));
  ctx.fillStyle = o.head; ctx.beginPath(); ctx.arc(tp.x, tp.y, r * 0.62, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 0.8; ctx.stroke();
  if (o.spear) { const t2 = t3p(x, y, o.h + 1.7); ctx.strokeStyle = '#d8cfae'; ctx.lineWidth = Math.max(1, r * 0.16); ctx.beginPath(); ctx.moveTo(tp.x + r * 0.9, tp.y + r * 0.7); ctx.lineTo(t2.x + r * 0.9, t2.y); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function t3tree(ctx, x, y, h, shade) {
  const b = t3p(x, y, 0), tp = t3p(x, y, h), r = h * 0.32 * view.scale * b.k;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(b.x + r * 0.3, b.y, r * 0.9, r * 0.35, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4a3622'; ctx.fillRect(b.x - r * 0.12, b.y - (b.y - tp.y) * 0.28, r * 0.24, (b.y - tp.y) * 0.28);
  for (let i = 0; i < 3; i++) {
    const yb = b.y - (b.y - tp.y) * (0.18 + i * 0.22), yt = b.y - (b.y - tp.y) * (0.55 + i * 0.22), rr2 = r * (1 - i * 0.28);
    ctx.fillStyle = t3sh('#2d6a34', shade * (0.85 + i * 0.12)); ctx.beginPath(); ctx.moveTo(b.x - rr2, yb); ctx.lineTo(b.x, yt); ctx.lineTo(b.x + rr2, yb); ctx.closePath(); ctx.fill();
  }
}
function t3horse(ctx, x, y, face, bd, bw, color, accent, alpha, u) {
  ctx.globalAlpha = alpha;
  const len = bd * 0.86, wid = bw * 0.42;
  t3box(ctx, x, y, face, len, wid, 0.22, 0.95, t3sh('#7a5a3c', 1.1), '#6b4d33');
  const c = Math.cos(face), s = Math.sin(face);
  // manta de color y cabeza
  t3box(ctx, x - c * len * 0.05, y - s * len * 0.05, face, len * 0.5, wid * 1.08, 0.7, 0.98, t3sh(color, 1.1), color);
  const hx = x + c * len * 0.55, hy = y + s * len * 0.55; t3box(ctx, hx, hy, face, len * 0.28, wid * 0.5, 0.75, 1.35, '#80603f', '#6b4d33');
  ctx.globalAlpha = 1;
  void accent; void u;
}
function t3rivalG(ctx, s, UI, t) {
  if (!UI.showRival || !UI.rival) return;
  const amber = '#ffcf5a', rc = col(s, UI.rival.owner).color, touched = new Set();
  UI.rival.events.forEach((e) => {
    if (e.k === 'move' || e.k === 'charge') {
      const u = byId(s, e.id); if (!u) return; touched.add(u.id);
      t3poly(ctx, t3rect({ ...u, x: e.from.x, y: e.from.y, face: e.from.face ?? u.face }), rc + '33', rc + 'aa', 1.2, [5, 4]);
    } else if (e.k === 'shoot' || e.k === 'cast') { const tu = byId(s, e.target); if (tu) touched.add(tu.id); }
    else if (e.k === 'flee') { const u = byId(s, e.id); if (u) touched.add(u.id); }
    else if (e.k === 'combat') t3circle(ctx, e.at.x, e.at.y, 2.4, '#ff6a5a', 2.2);
  });
  for (const id of touched) { const u = byId(s, id); if (u && u.models > 0) t3poly(ctx, t3rect(u, 0.5), null, amber, 2, [7, 5]); }
  void t;
}
function t3rivalA(ctx, s, UI) {
  if (!UI.showRival || !UI.rival) return;
  const amber = '#ffcf5a';
  UI.rival.events.forEach((e, idx) => {
    const lw = UI.focusEv === idx ? 0.5 : 0.3;
    if (e.k === 'move' || e.k === 'charge') t3arrow(ctx, e.from, e.to, e.k === 'charge' ? (e.ok ? '#ff6a5a' : '#ff9a8f') : amber, lw, e.k === 'charge' && !e.ok ? [0.5, 0.5] : null);
    else if (e.k === 'shoot' || e.k === 'cast') { if (e.from) t3arrow(ctx, e.from, e.to, fxCol(e), lw, [0.7, 0.5], 1.2); }
    else if (e.k === 'flee') { const u = byId(s, e.id); if (u && e.from) t3arrow(ctx, e.from, { x: u.x, y: u.y }, '#9fb4ff', lw, [0.4, 0.4]); }
    else if (e.k === 'destroy') t3line(ctx, [[e.x - 1.4, e.y - 1.4, 0.1], [e.x + 1.4, e.y + 1.4, 0.1]], '#ff6a5a', 3), t3line(ctx, [[e.x + 1.4, e.y - 1.4, 0.1], [e.x - 1.4, e.y + 1.4, 0.1]], '#ff6a5a', 3);
  });
}

function t3draw(canvas, s, UI) {
  const ctx = canvas.getContext('2d'); const t = performance.now();
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); ctx.clearRect(0, 0, view.w, view.h);
  const useGL = gl3.ok && view.glOn;
  if (useGL) t3gl(s, UI, t);
  if (!useGL) {
  const sky = ctx.createLinearGradient(0, 0, 0, view.h); sky.addColorStop(0, '#0d1110'); sky.addColorStop(1, '#1b231a'); ctx.fillStyle = sky; ctx.fillRect(0, 0, view.w, view.h);
  // mesa con canto de madera
  const T = [[0, 0], [TW, 0], [TW, TH], [0, TH]];
  for (let i = 0; i < 4; i++) { const a = T[i], b = T[(i + 1) % 4]; t3poly(ctx, [[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], -2.2], [a[0], a[1], -2.2]], '#4a3321', 'rgba(0,0,0,.4)', 1); }
  const tp = T.map(([x, y]) => [x, y, 0]);
  const g = ctx.createLinearGradient(0, t3p(0, 0).y, 0, t3p(0, TH).y); g.addColorStop(0, '#3a4d2e'); g.addColorStop(1, '#2c3d24');
  t3poly(ctx, tp, g, null);
  const gl = (a, b, c2, d2) => t3line(ctx, [[a, b, 0.01], [c2, d2, 0.01]], 'rgba(255,255,255,.05)', 1);
  for (let x = 6; x < TW; x += 6) gl(x, 0, x, TH); for (let y = 6; y < TH; y += 6) gl(0, y, TW, y);
  const zone = (owner) => { const c = col(s, owner), z = s.zones[owner]; if (z.poly) { t3poly(ctx, z.poly.map((p) => [p.x, p.y, 0.02]), c.color + (s.phase === 'deploy' ? '44' : '1c'), c.color + 'cc', 1.5, [6, 5]); return; } const P = [[z.x0, z.y0, 0.02], [z.x1, z.y0, 0.02], [z.x1, z.y1, 0.02], [z.x0, z.y1, 0.02]]; t3poly(ctx, P, c.color + (s.phase === 'deploy' ? '44' : '1c'), c.color + 'cc', 1.5, [6, 5]); };
  if (s.stirDep) { for (let z = 0; z < 6; z++) { const o = s.stirDep.occ[z], c = o === undefined ? '#bbbbbb' : col(s, o).color, x0 = (z % 3) * 24, y0 = Math.floor(z / 3) * 24; t3poly(ctx, [[x0, y0, 0.02], [x0 + 24, y0, 0.02], [x0 + 24, y0 + 24, 0.02], [x0, y0 + 24, 0.02]], c + (s.stirDep.phase === 'units' ? '33' : '14'), c + 'cc', 1.5, [6, 5]); } } else { zone(0); zone(1); }
  for (const V of s.vortex || []) t3poly(ctx, [[V.x - 1.5, V.y - 1.5, 0.05], [V.x + 1.5, V.y - 1.5, 0.05], [V.x + 1.5, V.y + 1.5, 0.05], [V.x - 1.5, V.y + 1.5, 0.05]], 'rgba(199,155,255,.4)', '#c79bff', 1.5);
  for (const F of s.fanatics || []) t3poly(ctx, [[F.x - 0.5, F.y - 0.5, 0.05], [F.x + 0.5, F.y - 0.5, 0.05], [F.x + 0.5, F.y + 0.5, 0.05], [F.x - 0.5, F.y + 0.5, 0.05]], 'rgba(90,75,42,.8)', '#d9c26a', 1.5);
  if (s.dust) { const d = s.dust, P = []; for (let k = 0; k < 16; k++) P.push([d.x + Math.cos(k / 16 * 6.2832) * d.r, d.y + Math.sin(k / 16 * 6.2832) * d.r, 0.05]); t3poly(ctx, P, 'rgba(190,160,110,.5)', '#b8955a', 1.5); }
  for (const L of s.locs || []) t3poly(ctx, [[L.x - 1.4, L.y - 1.4, 0.04], [L.x + 1.4, L.y - 1.4, 0.04], [L.x + 1.4, L.y + 1.4, 0.04], [L.x - 1.4, L.y + 1.4, 0.04]], 'rgba(255,215,106,.35)', '#ffd76a', 1.5);
  for (const b of s.bags || []) if (!b.dead) t3poly(ctx, [[b.x - 2, b.y - 1, 0.05], [b.x + 2, b.y - 1, 0.05], [b.x + 2, b.y + 1, 0.05], [b.x - 2, b.y + 1, 0.05]], col(s, b.owner).color, '#2a1a0a', 1.5);
  if (s.sec === 'dom') { t3line(ctx, [[TW / 2, 0, 0.04], [TW / 2, TH, 0.04]], 'rgba(255,215,106,.5)', 1.2, [5, 5]); t3line(ctx, [[0, TH / 2, 0.04], [TW, TH / 2, 0.04]], 'rgba(255,215,106,.5)', 1.2, [5, 5]); }
  t3poly(ctx, tp, null, '#cfa94a', 2.5);
  }
  const items = [];
  if (!useGL) for (const tr of s.terrain) {
    if (tr.kind === 'forest') {
      t3poly(ctx, [[tr.x - tr.w / 2, tr.y - tr.h / 2, 0.03], [tr.x + tr.w / 2, tr.y - tr.h / 2, 0.03], [tr.x + tr.w / 2, tr.y + tr.h / 2, 0.03], [tr.x - tr.w / 2, tr.y + tr.h / 2, 0.03]], 'rgba(18,40,20,.8)', 'rgba(120,180,90,.5)', 1.2, [6, 4]);
      const n = Math.round(tr.w * tr.h / 3.4);
      for (let i = 0; i < n; i++) {
        const x = tr.x + (hash(i * 3 + tr.x) - 0.5) * (tr.w - 1.2), y = tr.y + (hash(i * 7 + tr.y) - 0.5) * (tr.h - 1.2), h = 1.9 + hash(i) * 1.6, sh = 0.8 + hash(i + 4) * 0.35;
        items.push({ d: t3p(x, y, 0).d, f: () => t3tree(ctx, x, y, h, sh) });
      }
    } else if (tr.kind === 'hill' || tr.kind === 'swamp') {
      const hl = tr.kind === 'hill', z = hl ? 0.6 : 0.03;
      t3poly(ctx, [[tr.x - tr.w / 2, tr.y - tr.h / 2, z], [tr.x + tr.w / 2, tr.y - tr.h / 2, z], [tr.x + tr.w / 2, tr.y + tr.h / 2, z], [tr.x - tr.w / 2, tr.y + tr.h / 2, z]], hl ? 'rgba(122,98,62,.9)' : 'rgba(48,86,84,.85)', hl ? 'rgba(200,170,110,.7)' : 'rgba(120,200,190,.5)', 1.2, [6, 4]);
    } else {
      items.push({ d: t3p(tr.x, tr.y, 0).d, f: () => {
        const rr = tr.rot || 0, rc = Math.cos(rr), rs = Math.sin(rr); // edificio rotado (Sturdham, Gemelwald): todo en el sistema local de la pieza
        t3box(ctx, tr.x, tr.y, rr, tr.w, tr.h, 0, 1.5, '#8b8672', '#77735f');
        const nn = Math.max(2, Math.round(tr.w / 1.4)); // almenas
        for (let i = 0; i < nn; i += 2) { const lx = -tr.w / 2 + (i + 0.5) * (tr.w / nn), ly = -tr.h / 2 + 0.2; t3box(ctx, tr.x + rc * lx - rs * ly, tr.y + rs * lx + rc * ly, rr, tr.w / nn * 0.8, 0.4, 1.5, 2.0, '#8b8672', '#6f6b58'); }
      } });
    }
  }
  t3rivalG(ctx, s, UI, t);
  const act = alive(s);
  const sel = UI.sel ? byId(s, UI.sel) : null;
  if (sel && sel.models > 0) {
    if (UI.mode?.k === 'place' || (!UI.mode && UI.prev === 'move')) { const m = D(sel).M; t3circle(ctx, sel.x, sel.y, m, 'rgba(255,255,255,.55)', 1.2, [5, 4]); t3circle(ctx, sel.x, sel.y, m * 2, 'rgba(207,169,74,.65)', 1.2, [5, 4]); }
    if ((UI.mode?.k === 'shoot' || (!UI.mode && UI.prev === 'shoot')) && rangedOf(sel)) { const r = rangedOf(sel).range; t3circle(ctx, sel.x, sel.y, r, 'rgba(255,138,90,.75)', 1.4, [6, 5]); t3circle(ctx, sel.x, sel.y, r / 2, 'rgba(255,138,90,.35)', 1.2, [6, 5]); }
  }
  // huellas de unidad
  for (const u of act) {
    const f = col(s, u.owner);
    t3poly(ctx, t3rect(u), f.color + (useGL ? (u.fleeing ? '14' : '1e') : (u.fleeing ? '30' : '48')), f.accent, 1.4);
    const r = t3rect(u); t3line(ctx, [r[0], r[1]], f.accent, 3.5);
    const fw = { x: u.x + Math.cos(u.face) * (dims(u).d / 2 + 1.1), y: u.y + Math.sin(u.face) * (dims(u).d / 2 + 1.1) };
    t3line(ctx, [[u.x + Math.cos(u.face) * dims(u).d / 2, u.y + Math.sin(u.face) * dims(u).d / 2, 0.04], [fw.x, fw.y, 0.04]], f.accent, 2);
  }
  // anillos
  for (const u of act) {
    if (u.fleeing) t3poly(ctx, t3rect(u, 0.3), null, '#9fb4ff', 1.5, [3, 3]);
    if (u.id === UI.sel) t3poly(ctx, t3rect(u, 0.5), null, '#fff3c4', 3);
    else if (UI.hover === u.id) t3poly(ctx, t3rect(u, 0.4), null, 'rgba(255,255,255,.55)', 1.6);
    if (UI.targets && UI.targets.includes(u.id)) t3poly(ctx, t3rect(u, 0.6), null, UI.mode.k === 'cast' && UI.mode.friend ? '#8be28b' : '#ff5a4a', 3 + 1.2 * Math.sin(t / 220));
    { const ai = atkInfo(UI); if (ai) { if (ai.id === u.id) { t3poly(ctx, t3rect(u, 0.8), null, '#ffb347', 5); t3poly(ctx, t3rect(u, 1.1), null, '#fff6d6', 1.6, [5, 4]); } else if (ai.res && ai.tg.includes(u.id)) t3poly(ctx, t3rect(u, 0.6), null, '#ff5a4a', 3 + 1.2 * Math.sin(t / 220)); } }
    if (s.phase !== 'deploy' && s.phase !== 'over' && u.owner === s.active && UI.canActIds?.has(u.id) && u.id !== UI.sel && UI.hints) t3poly(ctx, t3rect(u, 0.35), null, 'rgba(207,169,74,.8)', 1.4, [5, 4]);
  }
  // fantasmas de colocación
  const ghostBlock = (gu, ok) => { const c = ok ? '#6cbf5a' : '#c24a3f'; t3poly(ctx, t3rect(gu), c + '66', c, 2.2); const r = t3rect(gu); t3line(ctx, [r[0], r[1]], c, 4); };
  if (UI.mode?.k === 'place' && UI.ghost && sel) ghostBlock({ ...sel, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face, files: UI.ghost.files ?? sel.files }, UI.ghostOk);
  if (UI.mode?.k === 'deploy' && UI.ghost && sel) ghostBlock({ ...sel, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face }, UI.ghostOk);
  // figuras
  if (!useGL) for (const u of act) {
    const f = col(s, u.owner), data = D(u), { w, d, ranks, files } = dims(u);
    const bw = u.baseW / 25.4, bd = u.baseD / 25.4, c = Math.cos(u.face), sn = Math.sin(u.face);
    const alpha = u.fleeing ? 0.6 : 1;
    let placed = 0;
    for (let rk = 0; rk < ranks && placed < u.models; rk++) {
      const inRank = Math.min(files, u.models - placed);
      for (let i = 0; i < inRank; i++) {
        const lx = d / 2 - (rk + 0.5) * bd, ly = (i - (inRank - 1) / 2) * bw;
        const x = u.x + c * lx - sn * ly, y = u.y + sn * lx + c * ly;
        const shade = placed % 5 === 0 ? 1.12 : 1;
        const o = { r: Math.min(bw, bd) * 0.36, h: data.cat === 'char' ? 1.5 : data.tt === 'monInf' ? 2.1 : data.cat === 'cav' ? 1.9 : 1.1, color: shade > 1 ? t3sh(f.color, 1.2) : f.color, accent: f.accent, head: data.cat === 'cav' ? '#e3d5b0' : '#d9bfa0', alpha, spear: data.cat !== 'mach' && (data.melee?.thrust || data.lance || data.spear) };
        if (data.cat === 'mach') items.push({ d: t3p(x, y, 0).d, f: () => { ctx.globalAlpha = alpha; t3box(ctx, x, y, u.face, bd * 0.9, bw * 0.8, 0.3, 1.1, '#9a7d4e', '#7d6440'); t3box(ctx, x + c * bd * 0.3, y + sn * bd * 0.3, u.face, bd * 0.7, bw * 0.28, 1.1, 1.5, '#5a5a5e', '#46464a'); ctx.globalAlpha = 1; } });
        else if (data.cat === 'cav') items.push({ d: t3p(x, y, 0).d, f: () => { t3horse(ctx, x, y, u.face, bd, bw, f.color, f.accent, alpha, u); t3figure(ctx, x - c * bd * 0.05, y - sn * bd * 0.05, u.face, { ...o, r: Math.min(bw, bd) * 0.24, h: 2.0, color: f.color }); } });
        else if (data.tt === 'monInf') items.push({ d: t3p(x, y, 0).d, f: () => t3figure(ctx, x, y, u.face, { ...o, r: Math.min(bw, bd) * 0.4, color: '#6e8f4e' }) });
        else items.push({ d: t3p(x, y, 0).d, f: () => t3figure(ctx, x, y, u.face, o) });
        placed++;
      }
    }
  }
  items.sort((a, b) => b.d - a.d);
  for (const it of items) it.f();
  // flechas / efectos
  t3rivalA(ctx, s, UI);
  if (UI.mode?.k === 'place' && UI.ghost && sel) t3arrow(ctx, { x: sel.x, y: sel.y }, { x: UI.ghost.x, y: UI.ghost.y }, 'rgba(255,255,255,.7)', 0.14, [0.4, 0.4], 0.5, viaOf(UI.ghost, UI.ghost));
  UI.fx = (UI.fx || []).filter((f) => t - f.t0 < f.ttl);
  for (const f of UI.fx) {
    if (t < f.t0) continue;
    const a = 1 - (t - f.t0) / f.ttl; ctx.globalAlpha = Math.max(0, a);
    if (f.puff) {
      const k = 1 - a, p = t3p(f.pos.x, f.pos.y, 0.4 + k * 2.4), rr2 = view.scale * f.size * (0.5 + k * 1.3) * p.k;
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr2); gr.addColorStop(0, `rgba(${f.puff},${0.55 * a})`); gr.addColorStop(1, `rgba(${f.puff},0)`);
      ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, rr2, 0, 7); ctx.fill(); continue;
    }
    if (f.a && f.b) t3arrow(ctx, f.a, f.b, f.color, 0.4, null, 1.2);
    if (f.at) t3circle(ctx, f.at.x, f.at.y, 0.8 + (1 - a) * 2.2, f.color, 3, null, f.color + '66', 0.1);
    ctx.globalAlpha = 1;
  }
  // etiquetas
  const fs = Math.max(10, Math.min(12.5, view.scale * 0.85));
  {
    const lab = act.map((u) => { const tall = ['cav', 'char', 'mach'].includes(D(u).cat) || /^mon/.test(D(u).tt || ''); const a0 = t3p(u.x, u.y, 0.15), p = t3p(u.x, u.y, tall ? 2.6 : 1.9); return { u, ax: a0.x, ay: a0.y, px: p.x, py: p.y - fs * 1.2, d: p.d }; });
    drawLabels(ctx, s, sel, lab, fs, view.scale >= 6.5);
    ctx.font = `700 ${fs}px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  }
  floatTxt(ctx, UI, t, (p, k) => { const q = t3p(p.x, p.y, 1.2 + k * 2.2); return { x: q.x, y: q.y }; });
  if (sel && UI.targets) {
    for (const id of UI.targets) {
      const tu = byId(s, id); if (!tu) continue; const dist = unitDist(sel, tu);
      const p = t3p(tu.x, tu.y, 0); ctx.fillStyle = 'rgba(194,74,63,.92)'; const txt = dist.toFixed(1) + '"'; const tw = ctx.measureText(txt).width + 8;
      rr(ctx, p.x - tw / 2, p.y + fs * 0.9, tw, fs * 1.35, 5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(txt, p.x, p.y + fs * 1.6);
    }
  }
  { const ai = atkInfo(UI); if (ai) { const au = byId(s, ai.id); if (au && au.models > 0) { const p = t3p(au.x, au.y, 3.4); roleTag(ctx, p.x, p.y, ai.role, '#ffb347', fs); }
    for (const id of ai.tg) { if (!ai.res && UI.mode?.k === 'shoot' && ai.tg.length > 3) break; const tu = byId(s, id); if (tu && tu.models > 0) { const p = t3p(tu.x, tu.y, 3.4); roleTag(ctx, p.x, p.y, ai.tgRole || 'Objetivo', '#ff7b6b', fs); } } } }
}

// Números flotantes (bajas, fallos, desastres): se dibujan en espacio pantalla
function floatTxt(ctx, UI, t, proj) {
  for (const f of UI.fx || []) {
    if (!f.txt || t < f.t0) continue;
    const k = (t - f.t0) / f.ttl; if (k >= 1) continue;
    const p = proj(f.pos, k); const fs = Math.max(16, Math.min(30, view.scale * 1.7));
    ctx.save(); ctx.globalAlpha = Math.min(1, (1 - k) * 2); ctx.font = `800 ${fs}px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y = p.y - 6 - k * fs * 2.2; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.strokeText(f.txt, p.x, y); ctx.fillStyle = f.color; ctx.fillText(f.txt, p.x, y); ctx.restore();
  }
}
