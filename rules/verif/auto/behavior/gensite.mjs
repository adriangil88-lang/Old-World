// v843j — genera el bloque SITE de app/js/rules.js (clase y descripción de cada tirada de dados del motor) a partir de sites_desc.json y de la política de clases de abajo.
// Uso: node rules/verif/auto/behavior/gensite.mjs   (reescribe el bloque entre «// <<SITES» y «// SITES>>»)
import fs from 'fs';
const ROOT = new URL('../../../../', import.meta.url).pathname;
const F = ROOT + 'app/js/rules.js', D = JSON.parse(fs.readFileSync(ROOT + 'rules/verif/auto/behavior/sites_desc.json', 'utf8'));
const POL = JSON.parse(fs.readFileSync(ROOT + 'rules/verif/auto/behavior/sites_policy.json', 'utf8'));
// POL = { fnC: [funciones cuyas tiradas están todas cubiertas], idC: { id: motivo }, idN: { id: motivo }, lab: { fn: nombre de la regla } }
const src = fs.readFileSync(F, 'utf8');
const ids = [...src.matchAll(/\b(?:rzD6|rzD3|rzD2|rzD3b)\((?:s|CUR), '([A-Za-z0-9_$]+:\d+)'(?:\)|, )|\brzExpr\((?:s|CUR), '([A-Za-z0-9_$]+:\d+)'/g)].map((m) => m[1] || m[2]);
// v843l: umbral escrito en línea junto a la llamada («rzD6(…) >= 4», o «const r = rzD6(…)» seguido de una única comparación de r con un literal): la ventana previa dibuja la tabla del dado con tu número resaltado
const THR = {};
{
  const re = /\b(?:rzD6|rzD3|rzD2|rzD3b)\((?:s|CUR), '([A-Za-z0-9_$]+:\d+)'\)/g; let m;
  while ((m = re.exec(src))) {
    const id = m[1], end = m.index + m[0].length, after = src.slice(end, end + 40);
    let c = /^\s*(>=|<=|===|==|<|>)\s*(\d+)\b(?!\s*[*+\/-])/.exec(after);
    if (!c) {
      const pre = src.slice(Math.max(0, m.index - 40), m.index), vm = /(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*$/.exec(pre);
      if (vm && !/^\s*[+*\/-]/.test(after) && !/^\s*[,)]/.test(after)) {
        const win = src.slice(end, end + 160), bad = new RegExp('(?<![\\w$.])' + vm[1].replace(/\$/g, '\\$') + '\\s*(?:!==|!=|>=|<=|===|<|>)\\s*(?![\\d\\s])', 'g'), vr = new RegExp('(?<![\\w$.])' + vm[1].replace(/\$/g, '\\$') + '\\s*(>=|<=|===|==|<|>)\\s*(\\d+)\\b', 'g'); const set = new Set(); let q;
        while ((q = vr.exec(win))) set.add(q[1] + q[2]);
        if (set.size === 1 && !bad.test(win) && !POL.noThr?.includes(id)) c = /^(>=|<=|===|==|<|>)(\d+)$/.exec([...set][0]);
      }
    }
    if (c && /^(?:gt|<|>)/.test('') ) c = null;
    if (c && +c[2] < 1) c = null;
    if (c) THR[id] = ({ '>=': 'ge', '<=': 'le', '===': 'eq', '==': 'eq', '<': 'lt', '>': 'gt' })[c[1]] + c[2];
  }
}
const rows = []; const cls = { C: 0, G: 0 }; let nThr = 0;
for (const id of ids) {
  const d = D[id] || { desc: '', loop: false, fn: id.split(':')[0] };
  const c = POL.fnN?.[d.fn] ? 'N' : POL.idC[id] !== undefined || POL.fnC.includes(d.fn) ? 'C' : 'G'; cls[c] = (cls[c] || 0) + 1;
  const raw = POL.desc?.[id] ?? d.desc ?? '';
  const ok = POL.desc?.[id] !== undefined || (/^[^\[\]{}=&|;<>]{10,}$/.test(raw) && !/\(s,|\.name|\?\./.test(raw) && (raw.match(/[a-záéíóúñ]{3,}/gi) || []).length >= 3);
  const t = (ok ? raw : '').replace(/\\/g, '').replace(/'/g, '’');
  const th = c === 'G' && (POL.thr?.[id] ?? THR[id]); if (th) nThr++;
  rows.push(`'${id}': ['${c}', '${c !== 'G' ? '' : t}'${th ? `, '${th}'` : ''}],`);
}
const lab = Object.entries(POL.lab).map(([k, v]) => `'${k}': '${v.replace(/'/g, '’')}',`).join('\n');
// v843m: tablas «si sale X ocurrirá Y» que se enseñan antes de tirar (POL.tbl[id] = [título, [[resultado, efecto], …]]); solo en sitios G
const tblRows = Object.entries(POL.tbl || {}).map(([id, [cap, rs]]) => { if (!ids.includes(id)) throw new Error('tbl sin sitio: ' + id); return `'${id}': ${JSON.stringify([cap, rs]).replace(/'/g, '’')},`; });
const block = `// <<SITES (generado por rules/verif/auto/behavior/gensite.mjs; no editar a mano)\nObject.assign(SITE, {\n${rows.join('\n')}\n});\nObject.assign(FNLAB, {\n${lab}\n});\nObject.assign(SITETBL, {\n${tblRows.join('\n')}\n});\n// SITES>>`;
let out;
if (src.includes('// <<SITES')) out = src.replace(/\/\/ <<SITES[\s\S]*?\/\/ SITES>>/, () => block); else out = src.replace(/\n$/, '') + '\n' + block + '\n';
fs.writeFileSync(F, out); console.log('sitios', ids.length, JSON.stringify(cls), 'con umbral', nThr);
