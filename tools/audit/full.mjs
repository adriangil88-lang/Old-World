globalThis.OPT_FAST = 1;
// Auditoría IA vs IA: cada unidad (y cada objeto) juega partidas contra las 17 facciones; se comprueban invariantes del estado en cada jugada.
// Uso: node tools/audit/full.mjs <shard> <nshards> [juegos_por_unidad]  -> escribe /tmp/audit_<shard>.json
import { playGame } from '../../app/train.mjs';
import { UNITS, ITEMS, PRESETS, SPELLS } from '../../app/js/data.js';
import { alive } from '../../app/js/rules.js';
import fs from 'node:fs';
const w = JSON.parse(fs.readFileSync(new URL('../../app/weights.json', import.meta.url))).weights;
const [shard, nsh, gpu] = [+process.argv[2] || 0, +process.argv[3] || 1, +process.argv[4] || 2];
globalThis.MIX = true;
const FAC = Object.keys(PRESETS);
const byFac = {};
for (const [k, u] of Object.entries(UNITS)) { const F = (byFac[u.faction] ||= { gen: null, core: [] }); if (u.general && u.cat === 'char' && !u.mount && !F.gen) F.gen = k; if (u.cat === 'inf' && u.comp === 'core' && u.min >= 10 && F.core.length < 2) F.core.push(k); }
const jobs = [];
for (const [k, u] of Object.entries(UNITS)) { if (u.hidden || k === 'goods_cart') continue; jobs.push({ kind: 'unit', id: k }); }
for (const k of Object.keys(ITEMS)) jobs.push({ kind: 'item', id: k });
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const mine = jobs.filter((j, i) => i % nsh === shard && (!ONLY || ONLY.has(j.kind + ':' + j.id)));
const rep = { errors: [], inv: [], idle: [], logs: {}, games: 0, unfinished: [], spellsSeen: {}, itemsSeen: {}, unitsSeen: {} };
const normal = (m) => m.replace(/\d+(\.\d+)?/g, '#').slice(0, 90);
function check(s, tag, seen) {
  const ids = new Set();
  const all = [...s.units, ...(s.reserves || [])];
  for (const u of all) {
    for (const m of [u, ...(u.joined || [])]) {
      if (ids.has(m.id)) seen.add(`id duplicado ${m.id}`); ids.add(m.id);
      for (const k of ['x', 'y', 'face', 'models']) if (m[k] !== undefined && !Number.isFinite(m[k])) seen.add(`${m.type}.${k} no finito (${m[k]})`);
      if (m.models < 0) seen.add(`${m.type} models<0`);
      if (m.models > (m._im0 ??= m.models) * 3 + 3) seen.add(`${m.type} models crece (${m._im0}→${m.models})`);
    }
  }
  for (const u of s.units) if (u.models > 0 && !u.flank && Number.isFinite(u.x) && (u.x < -6 || u.x > 78 || u.y < -6 || u.y > 54) && !u.fleeing) seen.add(`${u.type} fuera de mesa (${u.x.toFixed(1)},${u.y.toFixed(1)})`);
}
for (const j of mine) {
  let F, A, tag = j.kind + ':' + j.id;
  if (j.kind === 'unit') { const u = UNITS[j.id]; F = u.faction; const b = byFac[F]; A = []; if (b.gen && j.id !== b.gen && !u.general) A.push({ type: b.gen, models: 1 }); A.push({ type: j.id, models: Math.max(u.min || 1, 1) }); for (const c of b.core) if (c !== j.id) A.push({ type: c, models: 20 }); }
  else { const it = ITEMS[j.id]; F = it.fac; if (!F || !byFac[F]) continue; const b = byFac[F]; const chars = Object.entries(UNITS).filter(([, u]) => u.faction === F && u.cat === 'char' && !u.mount && u.max === 1 && !u.hidden).map(([k]) => ({ id: k })); if (!chars.length || !b.core.length) continue; A = [{ type: chars[0].id, models: 1, items: it.bn ? [] : [j.id], std: false }, { type: b.core[0], models: 20, std: true, banner: it.bn ? j.id : null, mus: true }, { type: b.core[0], models: 15 }]; }
  for (let g = 0; g < (j.kind === 'unit' ? gpu : 1); g++) {
    const opp = FAC[(j.id.length * 7 + g * 5 + rep.games) % FAC.length];
    const seed = 1000 + rep.games * 13 + shard;
    const seen = new Set(); let st = null;
    try {
      globalThis.LISTS = ['grand', 'grand'];
      for (const e of A) { const os = UNITS[e.type]?.opts; if (os) { const used = new Set(); e.opts = os.filter((x, q) => ((seed + q * 7 + e.type.length) % 3 === 0) && (!x.group || !used.has(x.group)) && (used.add(x.group), true)); } } // opciones de unidad aleatorias
      const r = playGame({ wA: w, wB: w, seed, limit: 2000, facs: [F, opp], armiesOv: [A, PRESETS[opp][2000]], maxPlies: 140, onPly: (s) => { st = s; check(s, tag, seen); } });
      rep.games++;
      const s = r.s; const logTxt = s.log.join('\n');
      if (s.phase !== 'over') rep.unfinished.push(tag + ' vs ' + opp + ` [t${s.turn} ${s.phase} act${s.active} plies${r.plies} ${s.scn}]`);
      for (const m of s.log) { const k = normal(m); rep.logs[k] = (rep.logs[k] || 0) + 1; }
      if (j.kind === 'unit') { const nm = UNITS[j.id].name; rep.unitsSeen[j.id] = (rep.unitsSeen[j.id] || 0) + (logTxt.includes(nm) ? 1 : 0); }
      else { const nm = ITEMS[j.id].name; rep.itemsSeen[j.id] = (rep.itemsSeen[j.id] || 0) + (nm && logTxt.includes(nm) ? 1 : 0); }
      for (const [k, sp] of Object.entries(SPELLS)) if (sp.name && logTxt.includes(sp.name)) rep.spellsSeen[k] = (rep.spellsSeen[k] || 0) + 1;
      for (const m of seen) rep.inv.push(tag + ' vs ' + opp + ': ' + m);
    } catch (e) { rep.errors.push({ tag, opp, seed, msg: String(e.message).slice(0, 200), stack: String(e.stack).split('\n').slice(1, 4).join(' | ') }); }
  }
}
fs.writeFileSync(`/tmp/audit_${shard}.json`, JSON.stringify(rep));
console.log('shard', shard, 'juegos', rep.games, 'errores', rep.errors.length, 'invariantes', rep.inv.length, 'sin terminar', rep.unfinished.length);
