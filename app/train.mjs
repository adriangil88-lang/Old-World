if (process.env.OPT_FAST) globalThis.OPT_FAST = 1;
// Entrenamiento por autojuego (estrategia evolutiva). Uso: node train.mjs [generaciones] [partidas]
import fs from 'node:fs';
import { createGame, apply, scoreVP, SCN_IDS, altRun } from './js/rules.js';
import { PRESETS } from './js/data.js';
import { playAITurn, mkRng, LEVELS, DEFAULT_WEIGHTS, NF } from './js/ai.js';

export function playGame({ wA, wB, lvA = 'medium', lvB = 'medium', seed = 1, limit = 500, aIsEmpire = true, maxPlies = 40, facs = null, armiesOv = null, onPly = null, onStart = null }) {
  const emp = PRESETS.empire[limit], orc = PRESETS.orcs[limit];
  // A juega con el Imperio si aIsEmpire; el jugador 0 es siempre el primero en la lista
  let armies = aIsEmpire ? [emp, orc] : [orc, emp];
  let factions = aIsEmpire ? ['empire', 'orcs'] : ['orcs', 'empire'];
  if (facs) { factions = facs; armies = facs.map((f) => PRESETS[f][limit]); }
  if (armiesOv) armies = armiesOv;
  const mixCfg = globalThis.MIX ? { scn: SCN_IDS[seed % SCN_IDS.length], tmode: seed % 3 === 0 ? 'classic' : 'random', sec: ['none', 'loc', 'feat', 'dom', 'bag', 'loc2', 'loc4', 'none'][(seed >> 3) % 8] } : { scn: globalThis.SCN, tmode: globalThis.TMODE, sec: globalThis.SEC };
  const s = createGame({ seed, armies, factions, limit, ...mixCfg, secret: globalThis.SECRET || null, lists: globalThis.LISTS || null, ...(globalThis.TERR ? { terrain: globalThis.TERR(seed), tmode: 'custom' } : {}), gend: globalThis.GEND || (globalThis.MIX ? ['fixed', 'random', 'break'][seed % 3] : null) });
  for (let g = 0; s.stirDep && s.stirDep.phase !== 'done' && g < 20; g++) apply(s, { t: 'stirAuto', player: s.stirDep.turn });
  if (s.alt && s.alt.phase !== 'done') altRun(s); // despliegue alterno (Shores, Waystones, Leonen, Hollum, Last Stand...): se resuelve automáticamente en partidas IA vs IA
  apply(s, { t: 'ready', player: 0 }); apply(s, { t: 'ready', player: 1 });
  if (onStart) onStart(s);
  const aPlayer = 0;
  const cfgs = [
    { weights: wA, level: LEVELS[lvA], rng: mkRng(seed * 7 + 1) },
    { weights: wB, level: LEVELS[lvB], rng: mkRng(seed * 13 + 5) },
  ];
  let plies = 0;
  while (s.phase !== 'over' && plies++ < maxPlies) { playAITurn(s, cfgs[s.active]); if (onPly) onPly(s, plies); }
  if (s.phase !== 'over') apply(s, { t: 'endPhase' });
  const vp0 = scoreVP(s, 0), vp1 = scoreVP(s, 1);
  return { winner: s.winner, vpA: vp0, vpB: vp1, s, plies };
}

// puntuación de A (jugador 0) en [0,1] con ventaja de VP
function score(res) { return res.winner === 0 ? 1 : res.winner === 'draw' ? 0.5 : 0; }

const ALLF = Object.keys(PRESETS);
const PAIRS = ALLF.flatMap((a) => ALLF.map((b) => [a, b]));
export function match(wA, wB, games, baseSeed, opts = {}) {
  let sc = 0, margin = 0;
  for (let g = 0; g < games; g++) {
    // alterna lado (quién es jugador 0/Imperio) para anular ventajas de facción
    const swap = g % 2 === 1;
    const r = playGame({ wA: swap ? wB : wA, wB: swap ? wA : wB, seed: baseSeed + g, aIsEmpire: g % 4 < 2, facs: PAIRS[(baseSeed + g) % PAIRS.length], ...opts, lvA: swap ? (opts.lvB || 'medium') : (opts.lvA || 'medium'), lvB: swap ? (opts.lvA || 'medium') : (opts.lvB || 'medium') });
    const aWon = swap ? (r.winner === 1 ? 1 : r.winner === 'draw' ? 0.5 : 0) : score(r);
    sc += aWon; margin += (swap ? r.vpB - r.vpA : r.vpA - r.vpB) / 500;
  }
  return { score: sc / games, margin: margin / games };
}

const FLOOR = { 1: 0.4, 7: 0.6, 8: 0.2 }; // la IA debe presionar: evita políticas pasivas que sólo ganan esperando
const clampW = (w) => w.map((x, i) => (FLOOR[i] !== undefined ? Math.max(FLOOR[i], x) : x));

if (process.argv[1].endsWith('train.mjs')) {
  globalThis.MIX = true;
  const gens = +process.argv[2] || 10, games = +process.argv[3] || 8;
  let mean = clampW(fs.existsSync('./weights.json') ? JSON.parse(fs.readFileSync('./weights.json', 'utf8')).weights : DEFAULT_WEIGHTS.slice());
  while (mean.length < NF) mean.push(DEFAULT_WEIGHTS[mean.length]);
  const sigma0 = 0.35;
  const rngN = mkRng(12345);
  const gauss = () => Math.sqrt(-2 * Math.log(rngN() + 1e-9)) * Math.cos(2 * Math.PI * rngN());
  const pop = 8;
  const t0 = Date.now();
  for (let g = 0; g < gens; g++) {
    const sigma = sigma0 * (1 - g / (gens * 1.3));
    const cands = [];
    for (let k = 0; k < pop; k++) {
      const eps = Array.from({ length: NF }, gauss);
      const w = clampW(mean.map((m, i) => m + sigma * eps[i]));
      const r = match(w, mean, games, 1000 * (g + 1) + k * 31);
      cands.push({ w, eps, fit: r.score + 0.15 * r.margin });
    }
    cands.sort((a, b) => b.fit - a.fit);
    const top = cands.slice(0, 3);
    const newMean = clampW(mean.map((_, i) => top.reduce((t, c) => t + c.w[i], 0) / top.length));
    const vs = match(newMean, mean, games, 777 + g);
    if (vs.score >= 0.5) mean = newMean;
    console.log(`gen ${g + 1}/${gens} mejor=${top[0].fit.toFixed(3)} nueva-vs-anterior=${vs.score.toFixed(2)} ${(Date.now() - t0) / 1000 | 0}s w=[${mean.map((x) => x.toFixed(2)).join(', ')}]`);
    fs.writeFileSync('./weights.json', JSON.stringify({ weights: mean, generations: g + 1, trainedAt: new Date().toISOString() }, null, 1));
  }
}
