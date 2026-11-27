// IA: valoración lineal de estados (pesos aprendidos) + búsqueda de una jugada con muestreo de dados.
// Aprende por autojuego (entrenamiento ES en Node) y online tras cada partida (regresión logística sobre el resultado).
import { nearWall, vgStep, gsFor, ripPairs, animusSources, altRun, setAIDecider, firstRoll, gkJumpSpot, gkCanJump, engagedWith, commandRange, TABLE_W, TABLE_H, garrisonOpts, reinforcePos, ambushPos, checkPlacement, rangedOf, centerController, alive, clone, apply, previewMove, chargeTargets, legalShootTargets, spellTargets, castCheck, D, unitPts, curPts, isEngaged, canAct, scoreVP, usOf, spellKeys } from './rules.js';
import { unitDist, sideOf, dims, inRect } from './geom.js';
import { SPELLS, ITEMS, UNITS, LORES } from './data.js';
import { frydGen, FRYD_RE, ctlObjects, ctAll, setReplay, PREF_ASK } from './rules.js';
import { optList } from './data.js';
const cloneS = (s) => { const c = clone(s); c.noDecide = true; return c; }; // copias de la búsqueda: sin decisiones aprendidas anidadas (primera opción)
const rangedOfD = (d) => d.ranged;

// Animus sepulcral: la IA lo nomina ANTES de lanzar (como exige la FAQ) cuando el hechizo es difícil (VL 8+), sacrificando la Herida de la unidad más sana
function withAnimus(s, a) {
  const u = s.units.find((x) => x.id === a.id); if (!u) return a;
  const src = animusSources(s, u).sort((x, y) => y.wounds - x.wounds)[0]; const sp = SPELLS[a.spell];
  return src && src.wounds > 1 && sp && (sp.cv || 0) >= 8 ? { ...a, animus: src.id } : a;
}
export const NF = 20;
export const FEATURE_NAMES = ['material', 'agresividad', 'disparo', 'flancos', 'huidas', 'seguridad general', 'nº unidades', 'avance', 'amenaza de carga', 'fuerza restante', 'objetivos', 'inmovilizar enemigos caros con unidades baratas (sacrificio)', 'heridos a salvo (retirada)', 'pantalla de unidades baratas', 'alcance a flancos y retaguardia', 'control de objetivos (fuerza que los mantiene)', 'objetivos amenazados (defensa/ataque)', 'terreno defendible (colinas y cobertura)', 'objetivos de fin de partida si acabara ahora', 'equipo de la fila de combate (Banda variopinta)'];
export const DEFAULT_WEIGHTS = [3.0, 0.4, 0.5, 0.6, 1.5, 0.2, 0.3, 0.2, 0.4, 1.4, 1.0, 0.3, 0.3, 0.2, 0.3, 0.3, 0.3, 0.2, 0.3, 0.3];

export const LEVELS = {
  // idle: prob. de no actuar con una unidad; shoot: prob. de disparar; cast: prob. de lanzar hechizos
  easy: { name: 'Fácil', opt: 0, samples: 1, eps: 0.8, march: false, headings: [0, 1.5, -1.5], fracs: [0.35, 0.7], charge: 0.2, idle: 0.5, shoot: 0.4, cast: 0.3, ply2: 0 },
  medium: { name: 'Medio', optN: 2, optSeeds: 1, samples: 3, eps: 0.04, march: true, headings: [0, 0.6, -0.6], fracs: [0.5, 1], charge: 1, idle: 0, shoot: 1, cast: 1, ply2: 0 },
  hard: { name: 'Difícil', optN: 4, optSeeds: 2, samples: 4, eps: 0, march: true, headings: [0, 0.6, -0.6, 1.1, -1.1], fracs: [0.35, 0.7, 1], charge: 1, idle: 0, shoot: 1, cast: 1, ply2: 3 },
};

const armyPts = (s, p) => s.units.filter((u) => u.owner === p).reduce((t, u) => t + unitPts(u), 0);

export function features(s, p) {
  const q = 1 - p;
  const me = alive(s, p), en = alive(s, q);
  const tot = armyPts(s, p) + armyPts(s, q) || 1;
  const val = (list) => list.reduce((t, u) => t + curPts(u) * (u.fleeing ? 0.5 : 1), 0);
  const f = new Array(NF).fill(0);
  f[0] = (val(me) - val(en)) / tot * 2;
  const melee = me.filter((u) => !rangedOf(u) && D(u).cat !== 'mach');
  if (melee.length && en.length) {
    let w = 0, a = 0;
    for (const u of melee) {
      let m = 99; for (const e of en) m = Math.min(m, unitDist(u, e));
      const pts = curPts(u); w += pts; a += pts * (1 - Math.min(m, 36) / 36);
    }
    f[1] = a / w;
  }
  const shooters = me.filter((u) => rangedOf(u));
  if (shooters.length) {
    let w = 0, a = 0;
    for (const u of shooters) {
      const r = rangedOf(u).range; let inr = 0;
      for (const e of en) if (unitDist(u, e) <= r) inr = 1;
      w += curPts(u); a += curPts(u) * inr;
    }
    f[2] = a / w;
  }
  let flank = 0;
  for (const u of me) for (const e of en) {
    if (unitDist(u, e) < 0.12) {
      const sa = sideOf(e, u); if (sa !== 'front') flank += sa === 'rear' ? 1.5 : 1;
      const sb = sideOf(u, e); if (sb !== 'front') flank -= sb === 'rear' ? 1.5 : 1;
    }
  }
  f[3] = Math.max(-2, Math.min(2, flank / 2));
  f[4] = (en.filter((u) => u.fleeing).reduce((t, u) => t + curPts(u), 0) - me.filter((u) => u.fleeing).reduce((t, u) => t + curPts(u), 0)) / tot * 2;
  const gen = me.find((u) => D(u).general);
  if (gen && en.length) { let m = 99; for (const e of en) m = Math.min(m, unitDist(gen, e)); f[5] = Math.min(m, 24) / 24 - 0.5; }
  else if (!gen) f[5] = -1;
  f[6] = (me.length - en.length) / 8;
  const prog = (list, owner) => {
    if (!list.length) return 0;
    const fa = s.fwd ? s.fwd[owner] : (owner === 0 ? -Math.PI / 2 : Math.PI / 2), fx = Math.round(Math.cos(fa)), fy = Math.round(Math.sin(fa));
    return list.reduce((t, u) => t + (fx ? (fx > 0 ? u.x / TABLE_W : (TABLE_W - u.x) / TABLE_W) : (fy > 0 ? u.y / TABLE_H : (TABLE_H - u.y) / TABLE_H)), 0) / list.length;
  };
  f[7] = prog(me, p) - (1 - prog(en, q));
  const threat = (list, foes) => { let t = 0, w = 0; for (const u of list) { if (D(u).cat === 'mach') continue; w += curPts(u); for (const e of foes) { if (unitDist(u, e) <= D(u).M + 7) { t += curPts(u); break; } } } return w ? t / w : 0; };
  f[8] = threat(me, en) - threat(en, me);
  const usSum = (pl) => alive(s, pl).reduce((x, u) => x + usOf(u), 0);
  const init = s.initUs || [usSum(0) || 1, usSum(1) || 1];
  f[9] = usSum(p) / (init[p] || 1) - usSum(q) / (init[q] || 1);
  const pts = (s.locs || []).slice(); if (s.obj) pts.push({ x: 36, y: 24 });
  if (pts.length || s.sec === 'dom') {
    const near = (list, pt) => { let m = 60; for (const u of list) if (D(u).cat !== 'char' && D(u).cat !== 'mach') m = Math.min(m, Math.hypot(u.x - pt.x, u.y - pt.y)); return m; };
    let o = 0;
    for (const pt of pts) o += Math.max(-1, Math.min(1, (near(en, pt) - near(me, pt)) / 24));
    if (s.sec === 'dom') for (const pt of [{ x: 18, y: 12 }, { x: 54, y: 12 }, { x: 18, y: 36 }, { x: 54, y: 36 }]) o += Math.max(-1, Math.min(1, (near(en, pt) - near(me, pt)) / 24));
    f[10] = o / Math.max(1, pts.length + (s.sec === 'dom' ? 4 : 0)) + (s.objVP ? (s.objVP[p] - s.objVP[q]) / 300 : 0);
  }
  // --- Rasgos tácticos aprendidos: sacrificio/inmovilización, retirada, pantalla y flancos ---
  const fr = (u) => Math.max(0, Math.min(1, u.wounds / Math.max(1, u.startModels * D(u).W)));
  const reach = (u) => (D(u).M || 4) + 7;
  const nearest = (u, foes) => { let b = null, m = 99; for (const e of foes) { const d = unitDist(u, e); if (d < m) { m = d; b = e; } } return { e: b, d: m }; };
  const pin = (list, foes) => { let v = 0; for (const u of list) { if (D(u).cat === 'mach') continue; let best = 0; for (const e of foes) if (unitDist(u, e) < 0.12) best = Math.max(best, curPts(e) - curPts(u)); v += best; } return v; };
  f[11] = Math.max(-2, Math.min(2, (pin(me, en) - pin(en, me)) / tot * 4)); // unidades baratas que traban a enemigas más caras valen más que su coste
  const safeHurt = (list, foes) => { let v = 0; for (const u of list) { const h = fr(u); if (h >= 0.6 || D(u).cat === 'mach') continue; const { d } = nearest(u, foes); v += curPts(u) * (1 - h) * (d > 14 ? 1 : d < 0.12 ? -0.3 : -1); } return v; };
  f[12] = Math.max(-2, Math.min(2, (safeHurt(me, en) - safeHurt(en, me)) / tot * 4));
  const screen = (list, foes) => { let v = 0; if (list.length < 2) return 0; for (const u of list) { if (D(u).cat === 'mach' || curPts(u) < 80) continue; const { e, d } = nearest(u, foes); if (!e) continue; if (list.some((w2) => w2 !== u && curPts(w2) <= 0.5 * curPts(u) && unitDist(u, w2) <= 10 && unitDist(w2, e) < d)) v += curPts(u); } return v; };
  f[13] = Math.max(-2, Math.min(2, (screen(me, en) - screen(en, me)) / tot * 3));
  const flankReach = (list, foes) => { let v = 0; for (const e of foes) { if (D(e).cat === 'mach') continue; for (const u of list) { if (D(u).cat === 'mach' || D(u).cat === 'char' || unitDist(u, e) > reach(u) || unitDist(u, e) < 0.12) continue; if (sideOf(e, u) !== 'front') { v += curPts(e); break; } } } return v; };
  f[14] = Math.max(-2, Math.min(2, (flankReach(me, en) - flankReach(en, me)) / tot * 2));
  // --- Objetivos (ataque y defensa) y terreno defendible ---
  { const op = objPts(s, p);
    if (op.length) {
      const wt = op.reduce((v, o) => v + o.w, 0) || 1;
      const holders = (list, pt) => list.filter((u) => D(u).cat !== 'char' && D(u).cat !== 'mach' && !u.fleeing && Math.hypot(u.x - pt.x, u.y - pt.y) <= pt.r + 1);
      const reach = (list, pt) => list.filter((e) => D(e).cat !== 'mach' && !e.fleeing && Math.hypot(e.x - pt.x, e.y - pt.y) <= (D(e).M || 4) * 2 + pt.r).reduce((v, e) => v + curPts(e), 0);
      let ctl = 0, thr = 0;
      for (const pt of op) {
        const hm = holders(me, pt), he = holders(en, pt);
        const a1 = hm.reduce((v, u) => v + curPts(u), 0), b1 = he.reduce((v, u) => v + curPts(u), 0);
        ctl += pt.w * Math.tanh((a1 - b1) / (tot * 0.12));
        const myAtk = reach(me, pt), enAtk = reach(en, pt);
        thr += pt.w * Math.tanh(((hm.length && !he.length ? -enAtk : 0) + (he.length && !hm.length ? myAtk : 0) + (!hm.length && !he.length ? myAtk - enAtk : 0)) / (tot * 0.25));
      }
      f[15] = ctl / wt; f[16] = thr / wt;
    }
  // Objetivos que sólo puntúan al terminar (secretos, zonas, escenario concreto): se valoran con la propia puntuación del motor como si la partida acabara ahora
  { const ph = s.phase, zg = s.units.map((h) => h.zgen); let a1 = 0, b1 = 0, a0 = 0, b0 = 0;
    try { a0 = scoreVP(s, p); b0 = scoreVP(s, 1 - p); s.phase = 'over'; a1 = scoreVP(s, p); b1 = scoreVP(s, 1 - p); } catch (e) { a1 = a0; b1 = b0; } finally { s.phase = ph; s.units.forEach((h, i) => { h.zgen = zg[i]; if (h.zgen === undefined) delete h.zgen; }); }
    f[18] = Math.max(-2, Math.min(2, ((a1 - a0) - (b1 - b0)) / Math.max(1, tot) * 3)); }
    const cov = (list) => list.reduce((v, u) => { if (D(u).cat === 'mach') return v; let c = 0; for (const T of s.terrain || []) { if (T.kind === 'deco' || !inRect({ x: u.x, y: u.y }, T)) continue; c = Math.max(c, T.kind === 'hill' ? 1 : ['wood', 'ruin', 'building', 'tower'].includes(T.kind) ? 0.8 : 0.3); } return v + c * curPts(u); }, 0);
    f[17] = Math.max(-2, Math.min(2, (cov(me) - cov(en)) / tot * 3)); }
  // v830: Banda variopinta: valor (coste del equipo por modelo, del libro de ejércitos) de los modelos colocados en la fila delantera frente a la media de la unidad; el peso aprendido decide cuánto importa
  { let g = 0; const mv = (u) => { const L = u.mgP, n = L.length, F = Math.max(1, Math.min(u.files || 1, n)), os = optList(u.type), c = {}; const v = (k) => (c[k] ??= k === '_b' ? 0 : (os.find((o) => o.id === k)?.cost || 0)); let a = 0, fr = 0; for (let i = 0; i < n; i++) { a += v(L[i]); if (i < F) fr += v(L[i]); } return fr - (F * a) / n; };
    for (const u of me) if (u.mgP && u.mgP.length > 1) g += mv(u); for (const u of en) if (u.mgP && u.mgP.length > 1) g -= mv(u);
    f[19] = Math.max(-2, Math.min(2, g / tot * 10)); }
  return f;
}
export const valueOf = (w, f) => { let v = 0; for (let i = 0; i < NF; i++) v += (w[i] ?? DEFAULT_WEIGHTS[i]) * f[i]; return v; };

// ---------- Búsqueda de acción ----------
function sim(s, p, action, samples, w, rng) {
  let tot = 0;
  for (let i = 0; i < samples; i++) {
    const c = cloneS(s);
    c.rng = Math.floor(rng() * 4294967296) | 0;
    const r = apply(c, action);
    if (!r.ok) return -Infinity;
    tot += valueOf(w, features(c, p));
  }
  return tot / samples;
}

// Igual que sim pero con semillas fijas (comparación justa entre variantes de una misma acción)
function simSeed(s, p, action, samples, w, seed) {
  let tot = 0;
  for (let i = 0; i < samples; i++) { const c = cloneS(s); c.rng = (seed + i * 7919) | 0; const r = apply(c, action); if (!r.ok) return -Infinity; tot += valueOf(w, features(c, p)); }
  return tot / samples;
}
// Búsqueda a 2 capas: tras la jugada se cierra mi turno y responde el rival con la política "media".
function sim2(s, p, action, samples, w, rng) {
  let tot = 0;
  const oppCfg = { weights: w, level: LEVELS.medium_fast, rng };
  for (let i = 0; i < samples; i++) {
    const c = cloneS(s);
    c.rng = Math.floor(rng() * 4294967296) | 0;
    if (action) { const r = apply(c, action); if (!r.ok) return -Infinity; }
    let g = 0;
    while (c.active === p && c.phase !== 'over' && g++ < 5) apply(c, { t: 'endPhase' });
    if (c.phase !== 'over') {
      const st = { done: new Set() }; const q = c.active; g = 0;
      while (c.active === q && c.phase !== 'over' && g++ < 200) {
        const a = nextAction(c, oppCfg, st);
        const rr = apply(c, a);
        if (!rr.ok) apply(c, { t: 'endPhase' });
        if (a.t === 'endPhase') st.done.clear();
      }
    }
    tot += valueOf(w, features(c, p));
  }
  return tot / samples;
}
LEVELS.medium_fast = { name: 'interno', opt: 0, samples: 1, eps: 0, march: true, headings: [0, 0.6, -0.6], fracs: [0.5, 1], charge: 1, idle: 0, shoot: 1, cast: 1, ply2: 0 };

// Todos los objetivos puntuables de la mesa, de cualquier escenario (marcadores, centro/colina/torre, Piedra de las Manadas, bagajes, graneros, aldea, zona llana): punto, radio de influencia y valor en PV
function objPts(s, p) {
  const o = [];
  for (const L of s.locs || []) if (!L.gone) o.push({ x: L.x, y: L.y, r: (L.rad || 3) + 1, w: L.vp || 10 });
  if (s.obj) o.push({ x: (s.tw || TABLE_W) / 2, y: (s.th || TABLE_H) / 2, r: (s.obj.rad || 6) + 1, w: s.scn === 'koth' ? 100 : (s.obj.vp || 100) });
  for (const H of (s.terrain || []).filter((q) => q.herd)) o.push({ x: H.x, y: H.y, r: 6 + (H.w || 0) / 2, w: 200 });
  for (const b of s.bags || []) if (!b.dead) o.push({ x: b.x, y: b.y, r: 8, w: 100 });
  if (s.axe === 'raid' && p === s.atk) for (const b of s.barns || []) o.push({ x: b.x, y: b.y, r: 4, w: 30 });
  if (s.lootT) o.push(p === s.atk ? { x: s.lootT.x, y: s.lootT.y, r: 3.5, w: 60 } : { x: s.lootT.x, y: s.lootT.y, r: 6, w: 100 }); // Looting & Pillaging: saquear / defender el tren de bagaje
  if (s.hlm) o.push({ x: s.hlm.x, y: s.hlm.y, r: 3, w: 100 }); // Hallowed Ground: el hito
  if (s.village) o.push({ x: (s.village.x0 + s.village.x1) / 2, y: (s.village.y0 + s.village.y1) / 2, r: Math.min(s.village.x1 - s.village.x0, s.village.y1 - s.village.y0) / 2, w: 50 });
  if (s.flat) o.push({ x: s.flat.x, y: s.flat.y, r: 5, w: 250 });
  return o;
}
function moveCandidates(s, u, cfg) {
  const d = D(u);
  const en = alive(s, 1 - u.owner);
  if (!en.length) return [];
  const near = en.slice().sort((a, b) => unitDist(u, a) - unitDist(u, b))[0];
  if (u.garrison) return [{ t: 'ungarrison', id: u.id }];
  const gar = garrisonOpts(s, u).map((b) => ({ t: 'garrison', id: u.id, bid: b.id }));
  let base = Math.atan2(near.y - u.y, near.x - u.x);
  if (D(u).sr.includes('fleeSafe')) { // Carro de equipaje: huye hacia el borde de la mesa dentro de la zona de despliegue enemiga
    const Zn = s.zones[1 - u.owner], W = s.tw || 72, H = s.th || 48, c = [];
    if (Zn) { if (Zn.x0 <= 0.5) c.push({ x: 0, y: (Zn.y0 + Zn.y1) / 2 }); if (Zn.x1 >= W - 0.5) c.push({ x: W, y: (Zn.y0 + Zn.y1) / 2 }); if (Zn.y0 <= 0.5) c.push({ x: (Zn.x0 + Zn.x1) / 2, y: 0 }); if (Zn.y1 >= H - 0.5) c.push({ x: (Zn.x0 + Zn.x1) / 2, y: H }); }
    c.sort((a1, b1) => Math.hypot(a1.x - u.x, a1.y - u.y) - Math.hypot(b1.x - u.x, b1.y - u.y)); if (c[0]) base = Math.atan2(c[0].y - u.y, c[0].x - u.x);
  }
  const out = [];
  const tryDest = (ang, dist, march) => {
    let k = 1;
    for (let i = 0; i < 4; i++, k *= 0.75) {
      const dst = { x: u.x + Math.cos(ang) * dist * k, y: u.y + Math.sin(ang) * dist * k, face: ang };
      const r = previewMove(s, u.id, dst, march);
      if (r.ok) { out.push({ t: 'move', id: u.id, x: dst.x, y: dst.y, face: dst.face, march }); return; }
      if (!/Excede|Solapa|Camino|Fuera/.test(r.reason || '')) return;
    }
  };
  for (const h of cfg.headings) for (const fr of cfg.fracs) {
    tryDest(base + h, d.M * fr, false);
    if (cfg.march && fr === 1 && d.cat !== 'mach') tryDest(base + h, d.M * 2, true);
  }
  // Retirada, desbordamiento y maniobra lateral: la valoración aprendida decide si conviene (replegar heridos, rodear, ceder terreno, atraer al rival)
  for (const h of [Math.PI, Math.PI * 0.75, -Math.PI * 0.75, Math.PI / 2, -Math.PI / 2]) for (const fr of [0.5, 1]) tryDest(base + h, d.M * fr, false);
  if (d.cat !== 'mach' && near) { const dn = dims(near), sgn = [1, -1]; for (const sg of sgn) { const px = near.x + (-Math.sin(near.face)) * sg * (dn.w / 2 + 6) - Math.cos(near.face) * (dn.d / 2 + 2), py = near.y + Math.cos(near.face) * sg * (dn.w / 2 + 6) - Math.sin(near.face) * (dn.d / 2 + 2); tryDest(Math.atan2(py - u.y, px - u.x), Math.min(d.M, Math.hypot(px - u.x, py - u.y)), false); } }
  // Tomar o defender marcadores: la valoración aprendida compara avanzar hacia cada objetivo con el resto de opciones
  if (d.cat !== 'mach') for (const L0 of objPts(s, u.owner).sort((a1, b1) => Math.hypot(a1.x - u.x, a1.y - u.y) - Math.hypot(b1.x - u.x, b1.y - u.y)).slice(0, 2)) {
    const ao = Math.atan2(L0.y - u.y, L0.x - u.x), dd = Math.hypot(L0.x - u.x, L0.y - u.y);
    for (const [mul, march] of [[1, false], [2, true]]) if (!march || cfg.march) tryDest(ao, Math.max(0.5, Math.min(d.M * mul, dd - (L0.r || 3) * 0.5)), march);
  }
  // reorientarse sin avanzar
  out.push({ t: 'move', id: u.id, x: u.x, y: u.y, face: base, march: false });
  out.push(...gar);
  return out;
}

// Reparto de objetivos: cada punto (marcadores / centro) se asigna a la unidad apta más cercana que no esté trabada.
function objectiveMove(s, u, p, L, st) {
  const pts = (s.locs || []).map((pt) => ({ pt, rad: 6 })); if (s.obj) pts.push({ pt: { x: 36, y: 24 }, rad: s.obj.rad });
  if (s.axe === 'raid' && p === s.atk) for (const b of s.barns || []) pts.push({ pt: { x: b.x, y: b.y }, rad: 3, barn: b });
  if (!pts.length) return null;
  if (!st.assign) {
    st.assign = new Map();
    const elig = alive(s, p).filter((e) => !e.fleeing && D(e).cat !== 'char' && D(e).cat !== 'mach' && usOf(e) >= 10 && !isEngaged(s, e));
    const used = new Set();
    for (const o of pts) {
      const c = elig.filter((e) => !used.has(e.id)).sort((x, y) => Math.hypot(x.x - o.pt.x, x.y - o.pt.y) - Math.hypot(y.x - o.pt.x, y.y - o.pt.y))[0];
      if (c) { used.add(c.id); st.assign.set(c.id, o); }
    }
  }
  const o = st.assign.get(u.id); if (!o) return null;
  if (o.barn) { // Saquear el granero: llegar a contacto de peana con él (por la normal de su lado más cercano)
    const b = o.barn, dm = dims(u), dxo = u.x - b.x, dyo = u.y - b.y, horiz = Math.abs(dxo) / (b.w / 2) > Math.abs(dyo) / (b.h / 2);
    if (alive(s, 1 - p).some((e) => unitDist(u, e) < 6)) return null;
    const dst = horiz ? { x: b.x + Math.sign(dxo || 1) * (b.w / 2 + dm.d / 2 + 0.02), y: b.y, face: dxo > 0 ? Math.PI : 0 } : { x: b.x, y: b.y + Math.sign(dyo || 1) * (b.h / 2 + dm.d / 2 + 0.02), face: dyo > 0 ? -Math.PI / 2 : Math.PI / 2 };
    const d0 = Math.hypot(dst.x - u.x, dst.y - u.y); if (d0 < 0.03) return { hold: true };
    for (const [mul, march] of [[1, false], [2, true]]) {
      const k = Math.min(1, D(u).M * mul / Math.max(d0, 1e-9)), q = k >= 1 ? dst : { x: u.x + (dst.x - u.x) * k, y: u.y + (dst.y - u.y) * k, face: Math.atan2(dst.y - u.y, dst.x - u.x) };
      if (previewMove(s, u.id, q, march).ok) return { t: 'move', id: u.id, x: q.x, y: q.y, face: q.face, march };
    }
    return null;
  }
  if (centerController(s, o.rad, o.pt) === p) return { hold: true };
  const en = alive(s, 1 - p);
  if (en.some((e) => unitDist(u, e) < 10)) return null;
  if (Math.hypot(o.pt.x - u.x, o.pt.y - u.y) > D(u).M * 2 + 8) return null;
  const dist = Math.hypot(o.pt.x - u.x, o.pt.y - u.y), ang = Math.atan2(o.pt.y - u.y, o.pt.x - u.x), M = D(u).M;
  for (const [mul, march] of [[1, false], [2, true]]) {
    for (const off of [0, 0.5, -0.5, 1, -1]) {
      const run = Math.min(M * mul, Math.max(0.5, dist - o.rad * 0.5));
      const dst = { x: u.x + Math.cos(ang + off) * run, y: u.y + Math.sin(ang + off) * run, face: ang + off };
      if (previewMove(s, u.id, dst, march).ok) return { t: 'move', id: u.id, x: dst.x, y: dst.y, face: dst.face, march };
    }
  }
  return null;
}


// ---------- Decisiones opcionales («puede…») con valoración aprendida ----------
// Toda regla opcional que antes decidía una heurística fija se decide ahora simulando cada opción (y «no hacerlo») durante una ronda completa
// con la política interna y puntuando con los pesos aprendidos; las semillas se comparten entre opciones para que la comparación sea justa.
function simRound(s, p, action, w, rng, seeds) {
  let tot = 0, n = 0;
  for (const seed of seeds) {
    const c = cloneS(s); c.rng = seed | 0;
    if (action) { const r = apply(c, action); if (!r.ok) return -Infinity; }
    const cfg = { weights: w, level: LEVELS.medium_fast, rng: mkRng(seed ^ 0x9e3779b9) }, st = { done: new Set() };
    let q = c.active, sw = 0, g = 0;
    try {
      while (c.phase !== 'over' && sw < 2 && g++ < 500) {
        const a = nextAction(c, cfg, st), rr = apply(c, a);
        if (!rr.ok) apply(c, { t: 'endPhase' });
        if (a.t === 'endPhase') st.done.clear();
        if (c.active !== q) { sw++; q = c.active; st.done.clear(); }
      }
    } catch (e) { return -Infinity; }
    tot += valueOf(w, features(c, p)); n++;
  }
  return n ? tot / n : -Infinity;
}
function optionGroups(s, p) {
  const G = [], near = (u, d) => alive(s, 1 - p).some((e) => unitDist(u, e) <= d), allC = (h) => [h, ...(h.joined || []).filter((j) => j.models > 0)];
  const ok = (a) => apply(cloneS(s), a).ok;
  if (s.phase === 'strategy') for (const r of s.reserves || []) if (r.owner === p && r.models > 0 && (r.type === 'ct_lanterns_amb' || r.type === 'ct_lanterns_amb_hail') && !r.rrUsed) G.push({ key: 'bw' + r.id, alts: [{ t: 'pref', id: r.id, k: 'noBalloonRR', v: !r.noBalloonRR }] }); // Globos de guerra: repetir o no la llegada (autoaprendizaje)
  // v833: frydMod — se decide en el momento (aiPick en la regla), sin alternativa previa
  // v833: wwHand — se decide en el momento (aiPick en la regla), sin alternativa previa
  if (s.phase === 'strategy') { const hb = alive(s, p).find((h) => [h, ...(h.joined || [])].some((m) => m.models > 0 && (m.items || []).some((k) => ITEMS[k]?.hunthorn))); if (hb) { const cur = (s.hornPref || {})[p] ?? 1; for (const x of [1, -1, 0]) if (x !== cur) G.push({ key: 'hh' + x, alts: [{ t: 'pref', id: hb.id, k: 'hornPref', v: x }] }); } } // Cuerno de la Gran Cacería: +1 propio / −1 rival / no usar, decidido por valoración aprendida
  if (s.phase === 'strategy' && s.lists?.[p] === 'chracia' && !(s.trailsUsed || {})[p]) { const h0 = alive(s, p)[0], cur = (s.trailsPref || {})[p] || 0; if (h0) for (const x of [1, -1, 0]) if (x !== cur) G.push({ key: 'tp' + x, alts: [{ t: 'pref', id: h0.id, k: 'trailsPref', v: x }] }); } // Sendas ocultas (Chracia): +1 propio / −1 rival / no usar, decidido por valoración aprendida
  // v833: compPri — el orden de los movimientos obligatorios se decide en el momento (ask:cp → aiPick)
  // v833: charTgt — se decide en el momento (aiPick en la regla), sin alternativa previa
  // v833: defObst — se decide en el momento (aiPick en la regla), sin alternativa previa
  // v833: suppMode — se decide en el momento (aiPick en la regla), sin alternativa previa
  // v833: chalRetire — a quién se nomina al rechazar un desafío se decide en el momento (ask:cr → aiPick)
  if (s.phase === 'strategy') for (const h of alive(s, p)) {
    for (const c of allC(h)) {
      const sr = D(c).sr;
      if (sr.includes('waaagh') && !(s.waaagh || {})[c.id]) G.push({ key: 'wg' + c.id, alts: [{ t: 'waaagh', id: c.id }] });
      for (const k of c.items || []) if ((ITEMS[k]?.potion || ITEMS[k]?.darkHeart) && !(c.used && c.used[k])) G.push({ key: 'dr' + c.id + k, alts: [{ t: 'drink', id: c.id, k }] });
      if ((c.items || []).some((k) => ITEMS[k]?.nullStone) && c.nullK !== s.turn + ':' + s.active && !isEngaged(s, h)) G.push({ key: 'ns' + c.id, alts: [{ t: 'nullStone', id: c.id }] }); // Piedra Nula: «may attempt» → decisión por valoración aprendida
      if (sr.includes('rally') && !h.fleeing && !isEngaged(s, h)) for (const f of alive(s, p).filter((x) => x.fleeing && x.id !== h.id && unitDist(h, x) <= commandRange(c))) G.push({ key: 'rc' + c.id + ':' + f.id, alts: [{ t: 'rallycry', id: c.id, target: f.id }] });
      if (sr.includes('khaineBless') && !h.fleeing) G.push({ key: 'kb' + c.id, alts: ['fury', 'cleave', 'ward'].map((v) => ({ t: 'khaine', id: c.id, v })) }); // Bendiciones de Khaine: bendición elegida por valoración aprendida
      if (sr.includes('goadBeast') && !h.fleeing) for (const t of alive(s, p).filter((x) => ['monCreature', 'behemoth'].includes(D(x).tt) && (x.id === h.id || unitDist(h, x) <= commandRange(c)))) G.push({ key: 'gd' + c.id + ':' + t.id, alts: [{ t: 'goad', id: c.id, target: t.id }] }); // Aguijonear a la bestia: objetivo elegido por valoración aprendida
      if ((c.items || []).some((k) => ITEMS[k]?.bigboss)) G.push({ key: 'bb' + h.id, alts: [{ t: 'bigboss', id: h.id }] });
      if (sr.includes('digIn') && !h.fleeing && !isEngaged(s, h) && !h.entrenched && c.digK !== s.turn + ':' + s.active) G.push({ key: 'di' + c.id, alts: [{ t: 'digin', id: c.id }] }); // ¡Atrincheraos! (Zapador): intentarlo o no, autoaprendizaje
      if (sr.includes('grudgestone') && !c.stoneSet && !h.fleeing) G.push({ key: 'gs' + c.id, alts: [{ t: 'grudgestone', id: c.id }] }); // Piedra del Rencor (Thorgrim): colocarla o no, autoaprendizaje
      if (D(c).id === 'sk_greyseer_bell' && c.tollK !== s.turn + ':' + s.active) G.push({ key: 'tb' + c.id, alts: [{ t: 'toll', id: c.id }] }); // Campana Aullante: tañer o no, valoración aprendida
      if (sr.includes('cauldron')) G.push({ key: 'ca' + c.id, alts: [{ t: 'cauldron', id: c.id }] });
      if (sr.includes('nehek') || (c.items || []).includes('vc_dark_acolyte')) {
        const tg = alive(s, p).filter((f) => D(f).cat !== 'char' && D(f).sr.includes('undead') && unitDist(h, f) <= 12 && f.wounds < f.startModels * D(f).W).sort((a, b) => (b.startModels * D(b).W - b.wounds) - (a.startModels * D(a).W - a.wounds))[0];
        if (tg) G.push({ key: 'ne' + c.id, alts: [{ t: 'nehek', id: c.id, target: tg.id }] });
      }
      if (c.covenAlt && s.turn === 1 && !(c.casted || []).length) G.push({ key: 'cv' + c.id, alts: ['rolled', ...c.covenAlt.sigs].map((k) => ({ t: 'covenPick', id: c.id, pick: k })) }); // Aquelarre del Bosque Profundo: conservar la tirada o la firma (autoaprendizaje)
      if (c.legAlt?.orig && s.turn === 1 && !(c.casted || []).length) G.push({ key: 'lg' + c.id, alts: [...c.legAlt.orig.filter((k) => k !== c.legAlt.repl).map((k) => ({ t: 'legPick', id: c.id, drop: k })), { t: 'legPick', id: c.id, drop: 'none' }] }); // Lore Legacy: qué hechizo tirado se sustituye (o ninguno), aprendido
      if (c.loreAlt && c.spellAlt && s.turn === 1 && !(c.casted || []).length) G.push({ key: 'lo' + c.id, alts: c.loreAlt.opts.filter((l) => l !== c.lore).map((l) => ({ t: 'loreSet', id: c.id, lore: l, blind: 1 })) }); // v843r: Saber del Mago (Core p.106-107, se elige al escribir la lista): decisión del decisor aprendido, a ciegas (no conoce las caras tiradas; las valora con tiradas nuevas en la simulación)
      if (c.spellAlt && s.turn === 1 && !(c.casted || []).length) { const A = c.spellAlt, sigOn = c.spells.includes(A.sig); G.push({ key: 'sa' + c.id, alts: [...A.rolls.filter((k) => !sigOn || c.spells.includes(k)).map((k) => ({ t: 'spellPick', id: c.id, drop: k })), ...(sigOn ? [{ t: 'spellPick', id: c.id, drop: 'sig' }] : []), ...(A.neh || []).flatMap((n) => A.rolls.map((k) => ({ t: 'spellPick', id: c.id, drop: k, take: n })))] }); } // Core p.110: descartar un hechizo tirado por la firma, o conservar todos (autoaprendizaje)
      if (c.tomeAlt && s.turn === 1 && !(c.casted || []).length) for (const k of c.spells.filter((x) => x !== LORES[c.lore]?.sig)) G.push({ key: 'tm' + c.id + k, alts: [{ t: 'tomePick', id: c.id, drop: k, take: 'none' }, ...c.tomeAlt.pool.filter((x) => !c.spells.includes(x)).map((n) => ({ t: 'tomePick', id: c.id, drop: k, take: n }))] }); // Tomo de los Dioses Oscuros: qué hechizos tirados se sustituyen (autoaprendizaje)
      // v833: wpnPick — se decide en el momento (aiPick en la regla), sin alternativa previa
      if (D(c).cult && !c.cultUsed && !c.fleeing) G.push({ key: 'cu' + c.id, alts: [{ t: 'cult', id: c.id }] }); // Cultos Caóticos: alabar a los dioses (una vez por partida), momento elegido por la valoración aprendida
      if (sr.includes('primRoar') && !c.roarUsed && !c.fleeing && !isEngaged(s, c)) G.push({ key: 'pr' + c.id, alts: [{ t: 'roar', id: c.id }] }); // Rugido Primigenio: opcional, valoración aprendida
      // v833: soulDir — se decide en el momento (aiPick en la regla), sin alternativa previa
      if (c.type === 'lm_temple') G.push({ key: 'ng' + c.id, alts: [{ t: 'pref', id: c.id, k: 'noGuard', v: !c.noGuard }] }); // Guardianes: transferir o no los impactos al Slann, valoración aprendida
      if (sr.includes('hornHunt') && !(c.used && c.used.horn)) G.push({ key: 'hn' + c.id, alts: [{ t: 'horn', id: c.id }] });
      if (sr.includes('skaryn')) G.push({ key: 'sk' + c.id, alts: alive(s, 1 - p).filter((e) => unitDist(h, e) <= 18).map((e) => ({ t: 'skaryn', id: c.id, target: e.id })) });
      if ((c.items || []).includes('power_scroll') && !c.used?.power) G.push({ key: 'pw' + c.id, alts: [{ t: 'pref', id: c.id, k: 'pwOn', v: !c.pwOn }] }); // Pergamino de Poder: cuándo usarlo (autoaprendizaje)
      if ((c.items || []).includes('dispel_scroll') && !c.used?.dispel) G.push({ key: 'ds' + c.id, alts: [{ t: 'pref', id: c.id, k: 'dsOn', v: !c.dsOn }] }); // Pergamino de Dispersión: cuándo usarlo (autoaprendizaje)
      if ((c.items || []).includes('skl_tokens') || c.tokN) G.push({ key: 'tk' + c.id, alts: [{ t: 'pref', id: c.id, k: 'tokOn', v: !c.tokOn }] }); // Fichas de Piedra Bruja: opcional, valoración aprendida
      if (sr.includes('verminValour') && h !== c) G.push({ key: 'vv' + c.id, alts: [{ t: 'pref', id: c.id, k: 'vvOn', v: !c.vvOn }] }); // Valor verminoso: opcional, valoración aprendida
      if (sr.includes('gaze')) G.push({ key: 'gz' + c.id, alts: [{ t: 'gaze', id: c.id }] });
      // v833: gazeRR — se decide en el momento (aiPick en la regla), sin alternativa previa
      if (c === h && s.lists?.[p] === 'wolves' && D(h).cat !== 'char') G.push({ key: 'gt' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noGazeTrophy', v: !h.noGazeTrophy }] }); // Favor de los Dioses: tirar o no en la Mirada al capturar un estandarte
      for (const k of [...(c.items || []), ...(c.banner ? [c.banner] : [])]) if (ITEMS[k]?.cmdUse) G.push({ key: 'ui' + c.id + k, alts: [{ t: 'useItem', id: c.id, item: k }] });
    }
    G.push({ key: 'fa' + h.id, alts: [{ t: 'falcon', id: h.id }] });
    if (near(h, 26) && !h.fleeing) {
      const d = D(h);
      if ((h.items || []).some((k) => ITEMS[k]?.glowy) && !(h.used && h.used.glowy)) G.push({ key: 'gg' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noGlowy', v: !h.noGlowy }] }); // Amuleto Verde Brillante: usarlo o dejar dispersar al Mago
      if (h.banner === 'bm_renown' && !(h.used && h.used.renown)) G.push({ key: 'rn' + h.id, alts: [{ t: 'pref', id: h.id, k: 'renownOn', v: !h.renownOn }] }); // Estandarte del Renombre (Battle March)
      if (allC(h).some((c) => (c.items || []).some((k) => ITEMS[k]?.helmRR) && !(c.used && c.used.helmRR))) G.push({ key: 'hm' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noHelm', v: !h.noHelm }] }); // Yelmo del Valor
      if (allC(h).some((c) => (c.items || []).some((k) => ITEMS[k]?.wyrdShard) && !(c.used && c.used.wyrd))) for (const wk of ['wyrdC', 'wyrdD']) G.push({ key: wk + h.id, alts: [{ t: 'pref', id: h.id, k: wk, v: !h[wk] }] }); // Fragmento de Piedra Bruja
      // v833: almaRR — se decide en el momento (aiPick en la regla)
      if (d.sr.includes('counterCharge')) G.push({ key: 'cc' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noCounter', v: !h.noCounter }] }); // Contracarga: usarla o no (autoaprendizaje)
      if (d.sr.includes('quell')) G.push({ key: 'qu' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noQuell', v: !h.noQuell }] }); // Reprimir Impetuosidad: opcional
      if (d.sr.includes('feintDodge') && !h.feintUsed) G.push({ key: 'fd' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noFeint', v: !h.noFeint }] }); // Finta y esquiva: usarla o reservarla (autoaprendizaje)
      // v833: objPick — se decide en el momento (aiPick en la regla), sin alternativa previa
      if (D(h).mountSv != null) G.push({ key: 'ap' + h.id, alts: ['auto', 'own', 'mount'].filter((v) => v !== (h.armPick || 'auto')).map((v) => ({ t: 'armPick', id: h.id, v })) }); // Armadura propia o de la montura (FAQ): elección del jugador; la IA la aprende
      // v829: el arma del Ingeniero Comandante (Tanque de Vapor) ya no es una preferencia: se decide al disparar (aiPick 'crewWpn')
      if (alive(s, p).some((o) => o !== h && !o.fleeing && unitDist(o, h) <= 6)) G.push({ key: 'pk' + h.id, alts: [1, 50, 99].filter((v) => v !== (h.panicRank ?? 50)).map((v) => ({ t: 'pref', id: h.id, k: 'panicRank', v })) }); // Pánico simultáneo (Core p.160): orden de los chequeos
      // v833: flameAim — se decide en el momento (aiPick en la regla), sin alternativa previa
      // v833: formation — se decide en el momento (aiPick en la regla), sin alternativa previa
      // v833: focus — se decide en el momento (aiPick en la regla), sin alternativa previa
      if (d.sr.includes('evasive')) G.push({ key: 'ev' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noEvade', v: !h.noEvade }] });
      if (((s.lists?.[p] === 'jadefleet' && ['handgunners', 'crossbowmen'].includes(h.type)) || (s.lists?.[p] === 'nuln' && h.type === 'handgunners')) && !h.drillUsed) G.push({ key: 'dd' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noDrill', v: !h.noDrill }] }); // Instrucción de arcabuceros: usar o reservar (autoaprendizaje)
      // v833: ovTgt/ssTgt — la unidad del Capataz inmortal / Escultor de piedra se elige en el momento (ask:ov / ask:ss → aiPick)
      if (D(h).ogreLoader && !h.ogreUsed) for (const v of ['twice', 'reroll', 'off']) if ((h.ogreMode || 'twice') !== v) G.push({ key: 'og' + h.id + v, alts: [{ t: 'pref', id: h.id, k: 'ogreMode', v }] }); // Tripulación mercenaria: disparar dos veces / repetir dado de Artillería / no usar (autoaprendizaje)
      // v833: rocketBat — se decide en el momento (aiPick en la regla)
      // v833: gbDeadly — se decide en el momento (aiPick en la regla)
      if (gsFor(s, h)) G.push({ key: 'gs' + h.id, alts: [{ t: 'pref', id: h.id, k: 'gsFallOn', v: !h.gsFallOn }] }); // Gran Estratega: retirarse en buen orden al ganar (opcional, autoaprendizaje)
      if ([h, ...(h.joined || [])].some((m) => m.type === 'gob_kiknik' && m.models > 0)) for (const x of [1, 0, -1]) if ((h.sneakyMod ?? 1) !== x) G.push({ key: 'sn' + h.id + x, alts: [{ t: 'pref', id: h.id, k: 'sneakyMod', v: x }] }); // Todos sigilosos: +1/−1 a la llegada, lo decide la IA por valoración aprendida
      if (h.type === 'gob_kiknik' && !h.fought) for (const x of ['hammer', 'pick']) if ((h.smasha || 'hammer') !== x) G.push({ key: 'sm' + h.id + x, alts: [{ t: 'pref', id: h.id, k: 'smasha', v: x }] }); // Da Skull Smasha: perfil elegido por la IA con valoración aprendida
      // v832: Segadores Espectrales: el objetivo (o no usarlos) se decide al sobrevolar (aiPick 'flyAtk')
      if (d.sr.includes('motherly')) G.push({ key: 'mo' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noMother', v: !h.noMother }] }); // Amor Maternal: opcional, autoaprendizaje
      if (d.sr.includes('indisHunger')) G.push({ key: 'ih' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noHunger', v: !h.noHunger }] }); // Hambre Indiscriminada: opcional, autoaprendizaje
      if (d.sr.includes('itRun')) G.push({ key: 'hr' + h.id, alts: [{ t: 'pref', id: h.id, k: 'hitRunOn', v: !h.hitRunOn }] }); // Golpear y huir: opcional, lo decide la IA por valoración aprendida
      if (d.sr.includes('disengage')) { G.push({ key: 'dl' + h.id, alts: [{ t: 'pref', id: h.id, k: 'noDisLose', v: !h.noDisLose }] }); G.push({ key: 'dw' + h.id, alts: [{ t: 'pref', id: h.id, k: 'disWinOn', v: !h.disWinOn }] }); }
      // v833: fanRel — se decide en el momento (aiPick en la regla), sin alternativa previa
      for (const c of allC(h)) {
        // v833: scrollThr — se decide en el momento (aiPick en la regla), sin alternativa previa
        if (D(c).wizard && D(c).sr.includes('sorcCurse')) { const fo = alive(s, 1 - p).flatMap((e) => [e, ...(e.joined || [])]).filter((m) => m.models > 0 && D(m).cat === 'char'); if (fo.length) G.push({ key: 'hp' + c.id, alts: [null, ...fo.map((m) => m.id)].filter((v) => v !== (c.hashutPick || null)).map((v) => ({ t: 'pref', id: c.id, k: 'hashutPick', v })) }); } // Maldición de Hashut: personaje objetivo (autoaprendizaje)
        // v833: thunderMode — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: luckPref — se decide en el momento (aiPick en la regla), sin alternativa previa
        if ((c.items || []).some((k) => ITEMS[k]?.eyeG) && !(c.used || {}).eye) G.push({ key: 'ey' + c.id, alts: [{ t: 'pref', id: c.id, k: 'eyeHold', v: !c.eyeHold }] }); // Ojo Guía: usarlo o reservarlo (autoaprendizaje)
        if (D(c).sr.includes('hekarti') && !c.hekDone) G.push({ key: 'hk' + c.id, alts: [{ t: 'pref', id: c.id, k: 'hekHold', v: !c.hekHold }] }); // Bendición de Hekarti: usarla o reservarla (autoaprendizaje)
        if ((c.items || []).some((k) => ITEMS[k]?.luck)) G.push({ key: 'ls' + c.id, alts: [{ t: 'pref', id: c.id, k: 'lkHold', v: !c.lkHold }] }); // Piedra/Runa de la Suerte: usarla o reservarla (autoaprendizaje)
        // v833: condPol — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: abomMode — se decide en el momento (aiPick en la regla)
        // v833: multiPref — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: whipOn — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: oneHand — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: diverPref — se decide en el momento (aiPick en la regla), sin alternativa previa
        if (D(c).ranged?.dsRockets) { const rp = c.rocketPref || 'auto'; G.push({ key: 'rk' + c.id, alts: ['auto', 'demo', 'inc'].filter((v) => v !== rp).map((v) => ({ t: 'pref', id: c.id, k: 'rocketPref', v })) }); } // Deathshrieker: tipo de cohete (autoaprendizaje)
        if (D(c).sr.includes('lumberDest')) G.push({ key: 'lb' + c.id, alts: [{ t: 'pref', id: c.id, k: 'lumberOn', v: !c.lumberOn }] }); // Destrucción desmedida: tirar o no el D6 (autoaprendizaje)
        // v833: vialPref — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: skullMode — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: mawOff — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: drunkRR — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: dispPref — se decide en el momento (aiPick en la regla), sin alternativa previa
        // v833: arma de combate (mwPref) — se decide en el paso 1.1 (aiPick 'meleeAlt'), sin alternativa previa
      }
      if (d.cat !== 'mach') {
        const cr = h.react || 'auto'; G.push({ key: 're' + h.id, alts: ['auto', 'hold', 'flee', ...(rangedOf(h) ? ['shoot'] : []), ...(D(h).sr.includes('fireFlee') && rangedOf(h) ? ['fireflee'] : [])].filter((v) => v !== cr).map((v) => ({ t: 'react', id: h.id, v })) });
        // v833: assailTgt — se decide en el momento (aiPick en la regla), sin alternativa previa
        { const en = engagedWith(s, h); if (h.models > 0 && en.some((e) => e.champ && e.models > 1)) G.push({ key: 'dc' + h.id, alts: [{ t: 'pref', id: h.id, k: 'dirChamp', v: !h.dirChamp }] }); } // Campeones en combate: dirigir ataques al campeón enemigo (autoaprendizaje)
        // v833: focus — se decide en el momento (aiPick en la regla), sin alternativa previa
        { const en = engagedWith(s, h); if (en.length > 1) G.push({ key: 'pk' + h.id, alts: [null, ...en.map((e) => e.id)].filter((v) => v !== (h.pursuitPick || null)).map((v) => ({ t: 'pref', id: h.id, k: 'pursuitPick', v })) }); } // Persecución: qué unidad perdedora perseguir (autoaprendizaje)
        const rp = h.restrainPref === undefined ? 'auto' : h.restrainPref ? 'try' : 'pursue'; G.push({ key: 'rs' + h.id, alts: ['auto', 'try', 'pursue'].filter((v) => v !== rp).map((v) => ({ t: 'restrain', id: h.id, v })) });
      }
    }
  }
  if (s.phase === 'move' && s.active === p) for (const h of alive(s, p)) if (h.models > 1 && D(h).sr.includes('openOrder') && D(h).sr.includes('skirmish') && !h.moved && !h.charged && !h.fleeing && !isEngaged(s, h)) G.push({ key: 'rf' + h.id, alts: [{ t: 'pref', id: h.id, k: 'formation', v: h.skirm === false ? 'skirm' : 'open' }] }); // v833: reformar (Orden abierto ↔ Escaramuza) es una acción del movimiento (core.txt:2976-2978), valorada por la IA en ese momento
  if (s.phase === 'strategy') for (const r of ripPairs(s)) G.push({ key: 'rp' + r.src + r.spell, alts: [r.owner === p ? { t: 'endRip', src: r.src, spell: r.spell } : { t: 'dispelRip', src: r.src, spell: r.spell }] }); // Core p.111: dispersar un hechizo rival que permanece en juego / terminar el propio
  // v833: cmbOrd — se decide en el momento (aiPick en la regla), sin alternativa previa
  if (s.phase === 'shoot') for (const u of alive(s, p)) if (D(u).sr.includes('wailing') && !u.marched && !u.fleeing && u.dirgeK !== s.turn + ':' + s.active) G.push({ key: 'dg' + u.id, alts: alive(s, 1 - p).filter((e) => unitDist(u, e) <= 8).map((e) => ({ t: 'dirge', id: u.id, target: e.id })) });
  if (s.phase === 'combat') for (const h of alive(s, p)) if (!h.orionOn && [h, ...(h.joined || [])].some((m) => m.models > 0 && (m.items || []).some((k) => ITEMS[k]?.orionF) && !(m.used && m.used.orion))) G.push({ key: 'of' + h.id, alts: [{ t: 'pref', id: h.id, k: 'orionOn', v: true }] });
  if (s.phase === 'combat') for (const h of alive(s, p)) for (const j of (h.joined || []).filter((q) => q.models > 0 && (q.items || []).includes('skl_orb'))) {
    const foes = isEngaged(s, h) ? engagedWith(s, h).filter((e) => e.models > 0) : []; for (const e of foes) G.push({ key: 'orb' + j.id + ':' + e.id, alts: [{ t: 'orb', id: j.id, target: e.id }] });
  }
  if (s.phase === 'strategy') for (const h of alive(s, p)) { // Edificios (Dawn): salir al perseguir/seguir y tomar un edificio que quede vacío son decisiones del jugador; la IA las aprende
    if (h.garrison) G.push({ key: 'bl' + h.id, alts: [{ t: 'pref', id: h.id, k: 'bLeave', v: !h.bLeave }] });
    else if (D(h).cat === 'inf' && s.units.some((o) => o.models > 0 && o.garrison && o.owner !== p && unitDist(h, o) <= 12)) G.push({ key: 'oc' + h.id, alts: [{ t: 'pref', id: h.id, k: 'occW', v: !h.occW }] });
  }
  // v832: las decisiones que el motor pregunta en el momento (reacción a la carga, persecución, «may» de useNeg/usePos, etc.) ya no son preferencias previas: la IA las toma con aiPick (decisor aprendido) cuando surgen
  const noop = (a) => a && ((a.t === 'pref' && PREF_ASK.has(a.k)) || a.t === 'react' || a.t === 'restrain');
  return G.map((g) => ({ ...g, alts: g.alts.filter((a) => !noop(a) && ok(a)) })).filter((g) => g.alts.length);
}
// Devuelve la mejor opción opcional (si supera a «no hacerlo»), o null. Cada grupo se estudia una vez por turno.
function learnedOptions(s, p, cfg, st) {
  const L = cfg.level; if (L.opt === 0 || (L.opt ?? 1) <= 0) return null;
  st.optN = st.optN || 0; const cap = L.optN ?? 6;
  const groups = optionGroups(s, p).filter((g) => !st.done.has('opt:' + g.key)).map((g) => ({ g, r: cfg.rng() })).sort((x, y) => x.r - y.r).map((x) => x.g); // orden aleatorio: todas las reglas opcionales se estudian con el tiempo
  if (!groups.length) return null;
  const rng = cfg.rng, fast = !!globalThis.OPT_FAST, seeds = Array.from({ length: fast ? 1 : (L.optSeeds ?? 2) }, () => Math.floor(rng() * 4294967296));
  const ev1 = (a) => fast ? simSeed(s, p, a, 1, cfg.weights, seeds[0]) : simRound(s, p, a, cfg.weights, rng, seeds); // modo rápido (auditorías): sin ronda completa
  let hold = null;
  for (const g of groups) {
    if (st.optN >= cap) break;
    st.done.add('opt:' + g.key); st.optN++;
    if (hold === null) hold = fast ? valueOf(cfg.weights, features(s, p)) : simRound(s, p, null, cfg.weights, rng, seeds);
    let best = null, bv = hold + 0.02;
    for (const a of g.alts) { const v = ev1(a); if (v > bv) { bv = v; best = a; } }
    if (fast && !best && rng() < 0.35) best = g.alts[Math.floor(rng() * g.alts.length)]; // cobertura de las auditorías: ejercita también las opciones no preferidas
    if (best && rng() >= (L.eps || 0)) return best.blind ? { ...best, blind: undefined } : best; // v843r: loreSet real usa las caras ya tiradas (blind solo en la valoración)
  }
  return null;
}

export function nextAction(s, cfg, st) {
  LAST_W = cfg.weights;
  // st: estado interno del turno de la IA {done:Set}
  const p = s.active, w = cfg.weights, rng = cfg.rng, L = cfg.level;
  if (s.phase === 'strategy' || s.phase === 'combat' || s.phase === 'shoot') { const lo = learnedOptions(s, p, cfg, st); if (lo) return lo; }
  if (s.phase === 'strategy') {
    for (const u of [...alive(s, p), ...alive(s, p).flatMap((h) => (h.joined || []).filter((j) => j.models > 0 && !h.fleeing))]) {
      if ((!D(u).wizard && !spellKeys(u).length) || u.fleeing || st.done.has(u.id)) continue;
      st.done.add(u.id);
      const base = valueOf(w, features(s, p));
      let best = null, bv = base - 0.02;
      for (const key of spellKeys(u)) for (const t of spellTargets(s, u, key)) {
        if (castCheck(s, u, key, t)) continue;
        const a = { t: 'cast', id: u.id, spell: key, target: t.id };
        const v = sim(s, p, a, L.samples, w, rng);
        if (v > bv) { bv = v; best = a; }
      }
      if (best && rng() > L.eps && rng() < L.cast) return withAnimus(s, best);
    }
    return { t: 'endPhase' };
  }
  if (s.phase === 'strategy' || s.phase === 'combat') { // Oculto: revelar al Asesino al llegar el enemigo o al empezar el combate
    const hid = (s.reserves || []).find((x) => x.owner === p && x.hiddenIn);
    if (hid) { const host = s.units.find((h) => h.id === hid.hiddenIn && h.models > 0 && !h.fleeing); if (host && (s.phase === 'combat' ? isEngaged(s, host) : s.units.some((e) => e.owner !== p && e.models > 0 && unitDist(host, e) <= 14))) { const t0 = { t: 'reveal', id: hid.id }; if (apply(cloneS(s), t0).ok) return t0; } }
  }
  if (s.phase === 'move') {
    for (const g of alive(s, p).filter((x) => x.type === 'br_green_knight')) { // Guardián de los Lugares Sagrados: salta a otro terreno natural si queda claramente más cerca del enemigo
      if (st.done.has('gk' + g.id) || !gkCanJump(s, g)) continue; st.done.add('gk' + g.id);
      const en = alive(s, 1 - p).sort((a1, b1) => unitDist(g, a1) - unitDist(g, b1))[0], pos = gkJumpSpot(s, g);
      if (en && pos && Math.hypot(en.x - pos.x, en.y - pos.y) + 6 < unitDist(g, en)) return { t: 'gkjump', id: g.id, auto: true };
    }
    if (s.turn >= 2 || s.stir) for (const ru of (s.reserves || []).filter((x) => x.owner === p && !x.hiddenIn && !x.detRes)) {
      if (st.done.has('rsv' + ru.id)) continue;
      if (s.stir) { // Stirhügel: refuerzos escalonados (mitad en el turno 1, el resto en el 2); la zona de entrada la sortea el motor (D3)
        const idx = (s.reserves || []).filter((x) => x.owner === p).indexOf(ru);
        if (s.turn < 1 + (idx % 2)) continue;
        st.done.add('rsv' + ru.id);
        for (const dx of [0, 8, -8, 12, -12, 4, -4]) { const t0 = { t: 'enter', id: ru.id, x: 12 + ((dx + 12) % 24) }; if (apply(cloneS(s), t0).ok) return t0; }
        st.done.delete('rsv' + ru.id); if (s.turn >= 6) st.done.add('rsv' + ru.id); continue;
      }
      st.done.add('rsv' + ru.id);
      if (ru.ambusher && !ru.ambushOK) { st.done.delete('rsv' + ru.id); continue; }
      const gap = ru.ambusher ? (alive(s, 1 - p).some((f) => ctAll(f, 'ctProp')) ? 12 : 8) : 1; // Presciencia profética del rival: 12"
      if (ru.ambusher && ru.type === 'sk_gutter') { const as = alive(s, p).flatMap((h) => [h, ...(h.joined || [])]).find((x) => x.models > 0 && x.type === 'sk_assassin'); if (as) { const t0 = { t: 'enter', id: ru.id, near: as.id }; if (apply(cloneS(s), t0).ok) return t0; } }
      if (ru.mineAmb) for (let i = 0; i < (s.mines?.[ru.owner] || []).length; i++) { const mk = s.mines[ru.owner][i], pos = { x: mk.x, y: mk.y, face: s.zones[ru.owner].y1 >= TABLE_H - 0.01 ? -Math.PI / 2 : Math.PI / 2, files: ru.files }; if (!checkPlacement(s, ru, pos, { enemyGap: 6 })) return { t: 'enter', id: ru.id, mine: i }; }
      if (ru.bmAmb) { for (const edge of ['top', 'bottom']) for (const xx of [22, 10, 34, 16, 28, 6, 38]) { const pos = ambushPos(ru, edge, xx); if (!checkPlacement(s, ru, pos, { enemyGap: 4 })) return { t: 'enter', id: ru.id, edge, x: xx }; } st.done.delete('rsv' + ru.id); if (s.turn >= 6) st.done.add('rsv' + ru.id); continue; }
      if (!ru.rescue) for (const dx of [0, 8, -8, 16, -16, 24, -24, 30, -30]) { const pos = reinforcePos(s, ru, 36 + dx); if (pos && !checkPlacement(s, ru, pos, { enemyGap: gap })) return { t: 'enter', id: ru.id, x: pos.x }; }
      if (ru.ambusher) for (const edge of ru.rescue ? ['left'] : ['left', 'right', 'top', 'bottom']) for (const y of (edge === 'top' || edge === 'bottom' ? [36, 20, 52, 10, 62] : [24, 16, 32, 8, 40])) { const pos = ambushPos(ru, edge, y); if (!checkPlacement(s, ru, { ...pos, files: ru.files }, { enemyGap: 8 })) return { t: 'enter', id: ru.id, edge, y }; }
    }
    if (s.winter && p === 1 && s.phase === 'move') for (const u of alive(s, p)) {
      if (st.done.has(u.id) || !canAct(s, u) || !(u.type === 'goods_cart' || D(u).general)) continue;
      st.done.add(u.id);
      const hx = dims(u).d / 2; for (const run of [D(u).M, D(u).M * 0.7, D(u).M * 0.4]) { const dst = { x: Math.min(TABLE_W - hx, u.x + run), y: u.y, face: 0 }; if (previewMove(s, u.id, dst, false).ok) return { t: 'move', id: u.id, x: dst.x, y: dst.y, face: 0, march: false }; }
    }
    const units = alive(s, p).filter((u) => canAct(s, u) && !st.done.has(u.id)).sort((a, b) => curPts(b) - curPts(a));
    // primero cargas: se declaran todas y se resuelven juntas (Core p.117-121)
    const decl = [];
    for (const u of units) {
      const cts = chargeTargets(s, u);
      if (!cts.length || rng() > L.charge) continue;
      let best = null, bv = valueOf(w, features(s, p)) + 0.01;
      const vars = (t) => { // Opciones de la carga que elige el jugador (Zancada +D6, cierre de paso, redirigir): cada variante se valora y gana la mejor
        const base = { t: 'charge', id: u.id, target: t.id }, out = [base];
        // v832: Zancada veloz: se decide en el momento (aiPick vía askH), ya no como variante previa de la carga
        // v832: Hambre de batalla: se decide en el momento (aiPick vía askH), ya no como variante previa de la carga
        // v832: carga bloqueada / redirigir: se decide en el momento (aiPick vía askH), ya no como variante previa de la carga
        // v832: nuevo objetivo al redirigir: se decide en el momento (aiPick vía askH), ya no como variante previa de la carga
        return out;
      };
      const scored = cts.flatMap((t) => { const sd = Math.floor(rng() * 4294967296); return vars(t).map((a) => ({ a, v: simSeed(s, p, a, Math.max(2, L.samples), w, sd) })); }).sort((x, y) => y.v - x.v);
      if (L.ply2 && scored.length) {
        // 2 capas: compara la mejor carga con no cargar, mirando la respuesta del rival
        let b2 = -Infinity;
        for (const c of scored.slice(0, 3)) { const v = sim2(s, p, c.a, 2, w, rng); if (v > b2) { b2 = v; best = c.a; } }
        // referencia: no mover la unidad
        const ref = sim2Hold(s, p, w, rng);
        if (b2 < ref - 0.02) best = null;
      } else for (const c of scored) if (c.v > bv) { bv = c.v; best = c.a; }
      if (best) { st.done.add(u.id); decl.push(best); }
    }
    if (decl.length) return decl.length === 1 ? decl[0] : { t: 'chargeAll', id: decl[0].id, list: decl.map((x) => ({ id: x.id, target: x.target, prefs: x.prefs })) };
    for (const u of units) {
      if (st.done.has(u.id)) continue;
      st.done.add(u.id);
      if (rng() < L.idle) continue;
      if (rng() < (L.obj ?? 0)) { const om = objectiveMove(s, u, p, L, st); if (om && om.hold) continue; if (om) return om; }
      const cands = moveCandidates(s, u, L);
      if (!cands.length) continue;
      if (rng() < L.eps) return cands[Math.floor(rng() * cands.length)];
      let best = null, bv = valueOf(w, features(s, p));
      const scored = cands.map((a) => ({ a, v: sim(s, p, a, 1, w, rng) })).sort((x, y) => y.v - x.v);
      if (L.ply2) {
        const top = scored.slice(0, L.ply2);
        let b2 = sim2Hold(s, p, w, rng); let pick = null;
        for (const c of top) { const v = sim2(s, p, c.a, 2, w, rng); if (v > b2 + 0.005) { b2 = v; pick = c.a; } }
        best = pick;
      } else if (scored.length && scored[0].v > bv) best = scored[0].a;
      if (best) return best;
    }
    for (const u of [...alive(s, p), ...alive(s, p).flatMap((h) => (h.joined || []).filter((j) => j.models > 0 && !h.fleeing))]) { // Traslado: Movimientos restantes, tras mover las demás unidades
      if ((!D(u).wizard && !spellKeys(u).length) || u.fleeing || st.done.has(u.id + ':v')) continue;
      st.done.add(u.id + ':v');
      const base = valueOf(w, features(s, p));
      let best = null, bv = base - 0.02;
      for (const key of spellKeys(u)) { if (SPELLS[key]?.type !== 'conveyance') continue; for (const t of spellTargets(s, u, key)) {
        if (castCheck(s, u, key, t)) continue;
        const a = { t: 'cast', id: u.id, spell: key, target: t.id };
        const v = sim(s, p, a, L.samples, w, rng);
        if (v > bv) { bv = v; best = a; }
      } }
      if (best && rng() > L.eps && rng() < L.cast) return withAnimus(s, best);
    }
    return { t: 'endPhase' };
  }
  if (s.phase === 'shoot') {
    for (const u of [...alive(s, p), ...alive(s, p).flatMap((h) => (h.joined || []).filter((j) => j.models > 0 && !h.fleeing))]) {
      if ((!D(u).wizard && !spellKeys(u).length) || u.fleeing || st.done.has(u.id + ':m')) continue;
      st.done.add(u.id + ':m');
      const base = valueOf(w, features(s, p));
      let best = null, bv = base - 0.02;
      for (const key of spellKeys(u)) for (const t of spellTargets(s, u, key)) {
        if (castCheck(s, u, key, t)) continue;
        const a = { t: 'cast', id: u.id, spell: key, target: t.id };
        const v = sim(s, p, a, L.samples, w, rng);
        if (v > bv) { bv = v; best = a; }
      }
      if (best && rng() > L.eps && rng() < L.cast) return withAnimus(s, best);
    }
    for (const u of alive(s, p)) {
      if (st.done.has(u.id) || u.shot) continue;
      const ts = legalShootTargets(s, u);
      if (!ts.length) continue;
      st.done.add(u.id);
      if (rng() > L.shoot) continue;
      let best = null, bv = valueOf(w, features(s, p)) - 0.02; // «no disparar» también es una opción (p. ej. si el disparo empeora la valoración)
      const aimVars = (t) => { // Cañón: el punto de puntería lo elige la IA por autoaprendizaje (cada variante se valora por simulación)
        const rg = rangedOf(u); if (!rg?.cannon) return []; const dd = Math.hypot(t.x - u.x, t.y - u.y), an = Math.atan2(t.y - u.y, t.x - u.x), nx = -Math.sin(an), ny = Math.cos(an), out = [];
        for (const [k, lat] of [[-3, 0], [-1, 0], [1, 0], [-1, 1.5], [-1, -1.5]]) { const L0 = Math.max(dims(u).d / 2 + 1, Math.min(rg.range, dd + k)); out.push({ t: 'shoot', id: u.id, target: t.id, aim: { x: u.x + Math.cos(an) * L0 + nx * lat, y: u.y + Math.sin(an) * L0 + ny * lat } }); }
        return out;
      };
      for (const t of ts) for (const a of [{ t: 'shoot', id: u.id, target: t.id }, ...aimVars(t), ...(rangedOf(u)?.rapid ? [{ t: 'shoot', id: u.id, target: t.id, rapid: true }, { t: 'shoot', id: u.id, target: t.id, rapid: false }] : [])]) { // Ráfaga (Core p.223): elección del jugador; la IA la decide con la valoración aprendida
        const v = sim(s, p, a, L.samples, w, rng) + (rng() < L.eps ? rng() : 0);
        if (v > bv) { bv = v; best = a; }
      }
      if (best) return best;
    }
    return { t: 'endPhase' };
  }
  return { t: 'endPhase' };
}

// valor de dejar la unidad quieta con respuesta del rival
function sim2Hold(s, p, w, rng) { return sim2(s, p, null, 2, w, rng); }

export function mkRng(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Juega todo el turno de la IA (devuelve eventos). onStep(action,result) para animación.

// ---------- Decisiones previas a la batalla (rezar, Duelo del Guerrero, primer/segundo turno, Maestría estratégica) ----------
// La IA las decide con su propia valoración aprendida: simula cada opción en copias del estado, juega una ronda con la política interna y puntúa con los pesos aprendidos.
let LAST_W = null, WGET = () => DEFAULT_WEIGHTS;
export const setWeightsGetter = (f) => { WGET = f; };
// ---------- v830: decisiones a mitad de turno (y cualquier decisión dentro de una acción) ----------
// La regla pregunta en mitad de una acción (bajas y huecos Variopintos, arco del Stegadón, lanzavirotes, arma del Ingeniero, repeticiones, desafíos, objetivos de los ataques, colocación…).
// El decisor re-simula la ACCIÓN COMPLETA desde el estado previo (ctx.pre) con las decisiones anteriores forzadas y cada opción candidata en la decisión actual; desde ese punto cambia la semilla
// (no conoce los dados que aún no se han tirado; mismas semillas para todas las opciones), termina la acción, sigue el turno con un horizonte corto (fin del turno en curso: la política
// interna hace 1 acción en la fase de Disparo; el resto de fases se cierran, lo que resuelve los combates) y puntúa con los pesos aprendidos (valueOf/features), como el resto de la IA.
// Presupuesto (iPhone 14 Pro): ≤ MID.cand candidatas (orden del motor: su opción por defecto primero; en empate se queda con ella) × MID.samples muestras; despliegue: 1 muestra y sin horizonte.
export const MID = { cand: 4, candLay: 5, samples: 2, shootSteps: 1, phaseSteps: 8 };
export const DSTAT = { n: 0, ms: 0, max: 0, sims: 0, miss: 0, div: 0, byKind: {} };
const LEGACY = (k) => ['bless', 'wchal', 'wacc', 'wnom', 'gzd', 'reap', 'prey', 'mists', 'first', 'hans', 'zone'].includes(k) || /^(pn:|mg:|toad:|vg:)/.test(String(k));
const hashK = (k) => { let h = 2166136261; for (const ch of String(k)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
function midRollout(c, w) {
  const a0 = c.active, t0 = c.turn, st = { done: new Set() }, cfg = { weights: w, level: LEVELS.medium_fast, rng: mkRng((c.rng ^ 0x27d4eb2d) >>> 0) };
  let g = 0, sh = 0;
  while (c.phase !== 'over' && c.phase !== 'deploy' && c.active === a0 && c.turn === t0 && g++ < MID.phaseSteps) {
    if (c.phase === 'shoot' && sh < MID.shootSteps) { sh++; const a = nextAction(c, cfg, st); if (a.t !== 'endPhase') { const r = apply(c, a); if (!r.ok) apply(c, { t: 'endPhase' }); continue; } }
    apply(c, { t: 'endPhase' });
  }
}
function midDecide(s, p, kind, opts, ctx) {
  const t0 = nowMs(), w = LAST_W || WGET(), deploy = ctx.pre.phase === 'deploy';
  const C = opts.slice(0, kind === 'motleyLay' ? MID.candLay : MID.cand), S = deploy ? 1 : MID.samples;
  const rng = mkRng((ctx.rng ^ hashK(kind) ^ Math.imul(ctx.idx + 1, 0x9e3779b1)) >>> 0), seeds = Array.from({ length: S }, () => Math.floor(rng() * 4294967296) | 0);
  let best = C[0], bv = -Infinity;
  for (const o of C) {
    let tot = 0, n = 0;
    for (let i = 0; i < S; i++) {
      const c = clone(ctx.pre), R = { forced: [...ctx.picks, o], n: 0, seed: seeds[i], chk: ctx.rng, hit: false, same: false, g: ctx.g };
      c.askMode = null; setReplay(c, R); DSTAT.sims++; // sin interrupciones: las preguntas humanas ya contestadas salen de s.ans; las futuras, con el valor por defecto (igual en vivo y al reproducir)
      try {
        apply(c, ctx.act);
        if (!R.hit) { DSTAT.miss++; if (globalThis.DBG_MID) console.log('miss', kind, ctx.act.t, ctx.idx, R.n); continue; } if (!R.same) { DSTAT.div++; if (globalThis.DBG_MID) console.log('div', kind, ctx.act.t, ctx.idx); }
        if (!deploy) midRollout(c, w);
        tot += valueOf(w, features(c, p)); n++;
      } catch (e) { /* opción no simulable */ }
    }
    const v = n ? tot / n : -Infinity;
    if (v > bv + 1e-9) { bv = v; best = o; }
  }
  const dt = nowMs() - t0; DSTAT.n++; DSTAT.ms += dt; DSTAT.max = Math.max(DSTAT.max, dt); const bk = (DSTAT.byKind[kind] ||= { n: 0, ms: 0, alt: 0 }); bk.n++; bk.ms += dt; if (best !== opts[0]) bk.alt++;
  return best;
}
setAIDecider((s, p, kind, opts, fn, ctx) => {
  if (opts.length <= 1) return opts[0];
  if (ctx?.legacy) { if (!LEGACY(kind) && !fn) return opts[0]; if (!LEGACY(kind) && s.phase !== 'deploy') return opts[0]; ctx = null; } // partidas guardadas antes de v830: como entonces
  else if (ctx && !LEGACY(kind)) return midDecide(s, p, kind, opts, ctx);
  if (!ctx) (DSTAT.noCtx ||= {})[kind] = (DSTAT.noCtx[kind] || 0) + 1; else (DSTAT.legacy ||= {})[kind] = (DSTAT.legacy[kind] || 0) + 1;
  if (!ctx && fn && s.phase !== 'deploy' && !LEGACY(kind)) { // fuera de una acción: se valora la opción aplicada sobre la copia (sin horizonte)
    const w = LAST_W || WGET(); let best = opts[0], bv = -Infinity;
    for (const o of opts.slice(0, MID.cand)) { try { const c = cloneS(s); fn(c, o); const v = valueOf(w, features(c, p)); if (v > bv + 1e-9) { bv = v; best = o; } } catch (e) { /* */ } }
    return best;
  }
  const w = LAST_W || WGET(), rng = mkRng((s.rng ^ 0x5bd1e995) >>> 0), rounds = kind === 'wnom' ? 0 : 1, samples = kind === 'wnom' ? 2 : 3;
  const cfg = { weights: w, level: LEVELS.medium_fast, rng };
  let best = opts[0], bv = -Infinity;
  for (const o of opts) {
    let tot = 0, n = 0;
    for (let i = 0; i < samples; i++) {
      const c = clone(s); c.noDecide = true; c.rng = Math.floor(rng() * 4294967296) | 0;
      if (kind === 'bless') c.pre.ans.bless[p] = o; else if (kind === 'wchal') c.pre.ans.wchal = o; else if (kind === 'wacc') c.pre.ans.wacc = o; else if (kind === 'wnom') c.pre.ans.nom[p] = o; else if (kind === 'gzd') c.pre.ans.gzd = o;
      else if (fn) fn(c, o); // v829: la regla aplica ella misma la opción sobre la copia (Báculo, colocación Variopinta…)
      else if (String(kind).startsWith('pn:amb')) { const uu = c.units.find((x) => x.id === kind.slice(6)); if (uu) uu.scnAmb = o === 'yes'; c.ambDone = false; c.ambSim = true; } else if (String(kind).startsWith('pn:')) (c.pnNom ||= {})[kind.slice(3)] = o; else if (kind === 'reap') (c.reapNom ||= [null, null])[p] = o; else if (kind === 'prey') (c.preyNom ||= [null, null])[p] = o; else if (kind === 'mists') (c.mistsNom ||= [null, null])[p] = o; else if (String(kind).startsWith('mg:')) (c.mgNom ||= {})[kind.slice(3)] = o; else if (kind === 'first') c.firstPick = o; else if (String(kind).startsWith('toad:')) (c.toadNom ||= {})[kind.slice(5)] = o; else if (kind === 'hans') (c.hansMod ||= [null, null])[p] = o;
      try {
        if (String(kind).startsWith('vg:')) { const uu = c.units.find((x) => x.id === kind.slice(3)); if (uu) vgStep(c, uu, o); tot += valueOf(w, features(c, p)); n++; continue; } // Vanguardia: se valora la posición resultante de cada opción
        if (kind === 'zone') { const r0 = apply(c, c.scn === 'chance' ? { t: 'altZone', player: p, zone: o } : { t: 'altZone', player: p, swap: o === 'swap' }); if (!r0.ok) continue; altRun(c); apply(c, { t: 'ready', player: 1 }); const r = apply(c, { t: 'ready', player: 0 }); if (!r.ok) continue; }
        else if (kind === 'first' || kind === 'hans') firstRoll(c, []); else if (String(kind).startsWith('pn:amb')) { const r = apply(c, { t: 'ready', player: 1 }); if (!r.ok) continue; } else { const r = apply(c, { t: 'ready', player: c.firstReady ?? 0 }); if (!r.ok) continue; }
        const t0 = c.turn; let g = 0; const st = { done: new Set() };
        while (c.phase !== 'over' && c.phase !== 'deploy' && c.turn < t0 + rounds && g++ < 500) {
          const q = c.active, a = nextAction(c, cfg, st), rr = apply(c, a);
          if (!rr.ok) apply(c, { t: 'endPhase' });
          if (a.t === 'endPhase' || c.active !== q) st.done.clear();
        }
        tot += valueOf(w, features(c, p)); n++;
      } catch (e) { /* opción no simulable */ }
    }
    const v = n ? tot / n : -Infinity;
    if (v > bv) { bv = v; best = o; }
  }
  return best;
});
export function playAITurn(s, cfg, onStep) {
  const p = s.active;
  const st = { done: new Set() };
  const events = [];
  let guard = 0;
  while (s.active === p && s.phase !== 'over' && guard++ < 400) {
    const phaseBefore = s.phase;
    const a = nextAction(s, cfg, st);
    const r = apply(s, a);
    if (!r.ok) { // evita bucles: marca y cierra fase
      const r2 = apply(s, { t: 'endPhase' }); if (onStep) onStep({ t: 'endPhase' }, r2); events.push(...r2.events); continue;
    }
    events.push(...r.events);
    if (onStep) onStep(a, r);
    if (a.t === 'endPhase' && phaseBefore !== s.phase) st.done.clear();
  }
  cfg.record?.push(features(s, p));
  return events;
}

// ---------- Aprendizaje ----------
export function learn(weights, records, outcome, lr = 0.03) {
  const w = weights.slice();
  for (const f of records) {
    const z = valueOf(w, f);
    const pred = Math.tanh(z * 0.5);
    const g = (outcome - pred) * (1 - pred * pred);
    for (let i = 0; i < NF; i++) w[i] = (w[i] ?? DEFAULT_WEIGHTS[i]) + lr * g * (f[i] || 0);
  }
  return w;
}
export function outcomeFor(s, p) {
  if (s.winner === 'draw' || s.winner === null) return 0;
  const vp = scoreVP(s, p) - scoreVP(s, 1 - p);
  const m = Math.max(-1, Math.min(1, vp / (s.limit * 0.5)));
  return (s.winner === p ? 1 : -1) * Math.max(0.3, Math.abs(m));
}
