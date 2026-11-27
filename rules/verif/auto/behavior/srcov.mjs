// v835 — cobertura estática de las reglas especiales: reglas que aparecen en los perfiles (sr) y no se leen en rules.js/ai.js (pueden estar resueltas en data.js o sin efecto): out/sr_coverage.txt
globalThis.OPT_FAST=1;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const {DATA}=await import('./engine.mjs');
const src = fs.readFileSync(path.join(HERE, '../../../../app/js/rules.js'),'utf8') + fs.readFileSync(path.join(HERE, '../../../../app/js/ai.js'),'utf8');
const dsrc = fs.readFileSync(path.join(HERE, '../../../../app/js/data.js'),'utf8');
const used = new Map();
for (const [k,u] of Object.entries(DATA.UNITS)) for (const r of (u.sr||[])) { if (!used.has(r)) used.set(r, []); used.get(r).push(k); }
for (const u of Object.values(DATA.UNITS)) for (const o of (u.opts||[])) for (const r of (o.patch?.addSr||[])) if (!used.has(r)) used.set(r, ['(opción)']);
const none = [];
for (const [r, us] of used) { const re = new RegExp("['\"]" + r.replace(/[$]/g,'\\$') + "['\"]"); if (!re.test(src)) { const inData = (dsrc.match(new RegExp("['\"]" + r + "['\"]", 'g'))||[]).length; none.push([r, us.length, us.slice(0,3).join(','), inData]); } }
const txt = [`reglas en sr: ${used.size}; sin referencia en rules.js/ai.js: ${none.length}`, 'regla | nº perfiles | ejemplos | apariciones en data.js', ...none.map((x) => x.join(' | '))].join('\n');
fs.writeFileSync(path.join(HERE, 'out', 'sr_coverage.txt'), txt + '\n'); console.log(`Cobertura estática de reglas: ${used.size} reglas en los perfiles, ${none.length} sin referencia directa en el motor (out/sr_coverage.txt)`);
