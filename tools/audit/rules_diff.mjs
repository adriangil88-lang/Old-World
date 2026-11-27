// Prueba diferencial por regla especial: la misma partida (misma semilla, mismos ejércitos) con y sin la regla en la unidad representante.
// Si en N semillas nunca cambia nada (ni el registro ni los PV), la regla no tiene efecto observable (no implementada o no ejercitada).
// Uso: node tools/audit/rules_diff.mjs <shard> <nshards> [semillas]  -> /tmp/rdiff_<shard>.json
import { playGame } from '../../app/train.mjs';
import { UNITS, PRESETS } from '../../app/js/data.js';
import fs from 'node:fs';
import { dims } from '../../app/js/geom.js';
const w = JSON.parse(fs.readFileSync(new URL('../../app/weights.json', import.meta.url))).weights;
const [shard, nsh, N] = [+process.argv[2] || 0, +process.argv[3] || 1, +process.argv[4] || 6];
globalThis.MIX = true; globalThis.LISTS = ['grand', 'grand'];
const FAC = Object.keys(PRESETS);
const byFac = {}; for (const [k, u] of Object.entries(UNITS)) { const F = (byFac[u.faction] ||= { gen: null, core: [] }); if (u.general && u.cat === 'char' && !u.mount && !F.gen) F.gen = k; if (u.cat === 'inf' && u.comp === 'core' && u.min >= 10 && F.core.length < 2) F.core.push(k); }
const reps = {}; // regla -> unidades (hasta 2)
for (const [k, u] of Object.entries(UNITS)) { if (u.hidden || k === 'goods_cart') continue; for (const r of u.sr || []) { (reps[r] ||= []); if (reps[r].length < 2) reps[r].push(k); } }
const ONLY = process.env.RULES ? new Set(fs.readFileSync(process.env.RULES, 'utf8').trim().split(/\s+/)) : null;
const rules = Object.keys(reps).sort().filter((r) => !ONLY || ONLY.has(r)).filter((_, i) => i % nsh === shard);
const res = {};
const run = (k, seed, opp, strip) => {
  const u = UNITS[k], F = u.faction, b = byFac[F]; const saved = u.sr;
  if (strip) u.sr = saved.filter((x) => x !== strip);
  try {
    const A = []; if (b.gen && k !== b.gen && !u.general) A.push({ type: b.gen, models: 1 });
    A.push({ type: k, models: Math.max(u.min || 1, 1) + (u.cat === 'inf' ? 5 : 0) }); for (const c of b.core) if (c !== k) A.push({ type: c, models: 20 });
    const r = playGame({ wA: w, wB: w, seed, limit: 2000, facs: [F, opp], armiesOv: [A, PRESETS[opp][2000]], maxPlies: 140, onStart: process.env.DUEL ? (s) => {
      const R = s.units.find((x) => x.owner === 0 && x.type === k); const E = s.units.filter((x) => x.owner === 1 && x.models > 0 && x.cat !== 'char').sort((a, b) => b.models - a.models)[0] || s.units.find((x) => x.owner === 1);
      if (!R || !E) return; const f = R.face, dr = dims(R), de = dims(E);
      const gap = (dr.d + de.d) / 2 + 0.05; E.x = R.x + Math.cos(f) * gap; E.y = R.y + Math.sin(f) * gap; E.face = f + Math.PI;
    } : null });
    return r.vpA + '|' + r.vpB + '|' + r.s.log.length + '|' + r.s.log.join('\n').length + '|' + r.s.units.map((x) => x.models).join(',');
  } finally { u.sr = saved; }
};
globalThis.__hc = {};
for (const r of rules) {
  let diff = 0, n = 0, err = null; const hc0 = globalThis.__hc[r] || 0;
  for (const k of reps[r]) for (let i = 0; i < N; i++) {
    const seed = 3000 + (process.env.SEEDOFF ? 500 : 0) + i * 7, opp = FAC[(seed + k.length) % FAC.length];
    try { const a = run(k, seed, opp, null), c = run(k, seed, opp, r); n++; if (a !== c) diff++; } catch (e) { err = String(e.message).slice(0, 100); }
  }
  res[r] = { units: reps[r], n, diff, err, hits: (globalThis.__hc[r] || 0) - hc0 };
}
fs.writeFileSync(`/tmp/rdiff_${shard}.json`, JSON.stringify(res));
console.log('shard', shard, 'reglas', rules.length, 'sin efecto', Object.values(res).filter((x) => x.n && !x.diff).length);
