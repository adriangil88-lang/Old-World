// v843n: genera FRONT_TABLE (render.js) a partir de la auditoría (figaudit.json), la tabla de representantes (reps.json) y el juicio de la revisión (front_judgement.json).
// Uso: node gen_front.mjs <audit.json> <reps.json> <front_judgement.json>   (reescribe el bloque entre // <FRONT_TABLE> y // </FRONT_TABLE> de app/js/render.js y escribe out/front_table_v843n.tsv)
import fs from 'fs';
const [aj, rj, jj] = process.argv.slice(2);
const audit = JSON.parse(fs.readFileSync(aj)); const { repOf } = JSON.parse(fs.readFileSync(rj)); const J = JSON.parse(fs.readFileSync(jj));
const { UNITS } = await import('/home/claude/tow/app/js/data.js');
const byId = {}; for (const r of audit) if (!r.rear) byId[r.id] = r;
const typeNote = (d, r) => d.cat === 'mach' ? 'boca del arma/máquina hacia el frente' : /Char$/.test(d.tt) || d.tt === 'heavyChar' ? 'bestias de tiro delante, tripulación detrás' : d.mount || d.cat === 'cav' || ['monCreature', 'behemoth', 'monCav', 'warBeasts', 'monInf'].includes(d.tt) ? 'cabeza de la montura/monstruo (y jinete) hacia el frente' : 'cara del modelo hacia el frente';
const lines = [], tsv = ['id\tmalla\tyaw\tfuente\tmedida_en\tnota'];
const cnt = { M: 0, G: 0, C: 0 };
const missing = [];
for (const id of Object.keys(UNITS)) {
  const d = UNITS[id]; const r = byId[id]; if (!r) { missing.push(id); continue; }
  const key = r.rid || 'proc:' + id; const rep = repOf[id] || id; const j = (J.unit && J.unit[id]) || (J.rid && J.rid[key]) || {};
  let src = j.v || 'M'; const yaw = Math.round((j.yaw != null ? j.yaw : r.yaw) * 10000) / 10000;
  let by = rep;
  if (!r.rid) { src = 'C'; by = 'proc'; }
  else if (src === 'M' && rep !== id) { src = 'G'; }
  else if (src === 'C') by = 'convención';
  const note = (j.note || typeNote(d, r)).replace(/'/g, '’');
  cnt[src]++;
  lines.push(`  ${/^[A-Za-z_$][\w$]*$/.test(id) ? id : `'${id}'`}: [${yaw}, '${src}', '${by}', '${note}'],`);
  tsv.push([id, r.rid || 'procedural', yaw, src, by, note].join('\t'));
}
if (missing.length) console.log('SIN AUDITORÍA:', missing.join(','));
const P = '/home/claude/tow/app/js/render.js'; let s = fs.readFileSync(P, 'utf8');
const a = s.indexOf('// <FRONT_TABLE>'), b = s.indexOf('// </FRONT_TABLE>'); if (a < 0 || b < 0) throw new Error('marcadores');
s = s.slice(0, a) + '// <FRONT_TABLE>\nexport const FRONT_TABLE = {\n' + lines.join('\n') + '\n};\n' + s.slice(b);
fs.writeFileSync(P, s);
fs.writeFileSync('/home/claude/tow/rules/verif/auto/out/front_table_v843n.tsv', tsv.join('\n') + '\n');
console.log('unidades', lines.length, JSON.stringify(cnt));
