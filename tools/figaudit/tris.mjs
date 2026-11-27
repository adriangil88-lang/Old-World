// Triángulos por unidad en iPhone (xh) y PC (xu): node tris.mjs > /tmp/tris.json ; imprime las unidades más pesadas y escenas de 4 unidades grandes
import fs from 'fs'; import zlib from 'zlib';
const A = '/home/claude/tow/app';
const { UNITS, ARMIES, FIG_ALIAS } = await import(A + '/js/data.js');
const { XMODELS } = await import(A + '/js/hdmap.js');
const audit = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/figaudit3.json'));
const hdr = (fn) => { if (!fs.existsSync(fn)) return {}; const raw = zlib.inflateSync(fs.readFileSync(fn)); const hl = raw[0] | raw[1] << 8 | raw[2] << 16 | raw[3] << 24; return JSON.parse(raw.subarray(4, 4 + hl).toString()); };
const tri = (h, uid) => (h[uid] ? h[uid].parts.reduce((t, p) => t + p[1] / 3, 0) : 0);
const H = {}, U = {}; const packs = [...new Set(Object.values(XMODELS))];
for (const p of packs) { H[p] = hdr(`${A}/hd/xh_${p}.dat.wasm`); U[p] = hdr(`${A}/hd/xu_${p}.dat.wasm`); }
const xp = {}; const trixp = (p, uid) => { xp[p] = xp[p] || JSON.parse(fs.readFileSync(`${A}/hd/xp_${p}.json`)).m; const m = xp[p][uid]; return m ? m.parts.reduce((t, q) => t + (q.i.length * 3 / 4 / 6), 0) : 0; };
const out = [];
for (const r of audit) { if (r.rear || !r.rid || !/^x_/.test(r.rid)) continue; const uid = r.rid.slice(2), p = XMODELS[uid]; const d = UNITS[r.id];
  const xh = tri(H[p], uid) || trixp(p, uid), xu = tri(U[p], uid) || xh;
  const n = d.cat === 'inf' || d.cat === 'cav' ? Math.min(d.max || 10, 40) : 1; // peor caso razonable
  out.push({ id: r.id, uid, xh, xu, n, unitXh: xh * n, unitXu: xu * n }); }
fs.writeFileSync('/tmp/tris.json', JSON.stringify(out));
out.sort((a, b) => b.unitXh - a.unitXh);
console.log('unidad (iPhone xh)'); for (const o of out.slice(0, 8)) console.log(o.id.padEnd(24), o.n + ' x ' + Math.round(o.xh), '=', Math.round(o.unitXh));
console.log('4 unidades mas pesadas en pantalla (iPhone):', Math.round(out.slice(0, 4).reduce((t, o) => t + o.unitXh, 0)), ' PC xu:', Math.round(out.slice().sort((a, b) => b.unitXu - a.unitXu).slice(0, 4).reduce((t, o) => t + o.unitXu, 0)));
