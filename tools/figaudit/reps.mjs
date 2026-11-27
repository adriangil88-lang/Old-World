// v843n: unidad representante por malla (rid) + todas las procedurales. Salida: JSON {fac:[ids]} y {id: representante}
import fs from 'fs';
const a = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/figaudit_n.json')).filter(r => !r.rear);
const seen = new Map(), reps = {}, repOf = {};
for (const r of a) { const k = r.rid || ('proc:' + r.id); if (!seen.has(k)) { seen.set(k, r.id); (reps[r.fac] ||= []).push(r.id); } repOf[r.id] = seen.get(k); }
fs.writeFileSync(process.argv[3] || '/tmp/fr/reps.json', JSON.stringify({ reps, repOf }));
console.log(Object.values(reps).flat().length, 'representantes de', a.length);
