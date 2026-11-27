// Tabla antes/después: node table.mjs old.json new.json > tabla.md
import fs from 'fs';
const { UNITS } = await import('/home/claude/tow/app/js/data.js');
const O = Object.fromEntries(JSON.parse(fs.readFileSync(process.argv[2])).filter((r) => !r.rear).map((r) => [r.id, r]));
const N = Object.fromEntries(JSON.parse(fs.readFileSync(process.argv[3])).filter((r) => !r.rear).map((r) => [r.id, r]));
const f = (x) => (x == null ? '—' : x.toFixed(2));
const rows = [];
const row = (id, tag, goal) => { const a = O[id], b = N[id]; if (!a || !b) return; rows.push(`| ${id} | ${tag} | ${a.bwI.toFixed(2)}x${a.bdI.toFixed(2)} | ${a.H ? f(a.H) : 'proc'} | ${b.Hb ? f(b.Hb) : 'proc'} | ${goal} | ${a.H ? f(a.bodyW) + 'x' + f(a.bodyD) : '—'} | ${b.Hb ? f(b.bodyW) + 'x' + f(b.bodyD) : '—'} | ${b.fl ? f(b.fl) : (a.p1 > 0.045 ? '0' : '')} |`); };
const G = JSON.parse(process.argv[4] || '{}');
for (const [tag, ids] of Object.entries(G)) for (const [id, goal] of ids) row(id, tag, goal);
console.log('| unidad | grupo | peana (") | H antes (") | H después (") | objetivo | cuerpo antes | cuerpo después | apoyo (") |\n|---|---|---|---|---|---|---|---|---|');
console.log(rows.join('\n'));
