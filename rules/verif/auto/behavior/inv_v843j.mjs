// v843j — genera el inventario de tiradas (por función) para rules/VERIFICACION.md a partir de app/js/rules.js y sites_policy.json
import fs from 'fs';
const ROOT = new URL('../../../../', import.meta.url).pathname;
const SRC = fs.readFileSync(ROOT + 'app/js/rules.js', 'utf8'), POL = JSON.parse(fs.readFileSync(ROOT + 'rules/verif/auto/behavior/sites_policy.json', 'utf8'));
const site = [...SRC.matchAll(/^'([A-Za-z0-9_$]+):(\d+)': \['([CGN])', '([^\n]*)'\],$/gm)].map((m) => ({ fn: m[1], n: +m[2], c: m[3], d: m[4] }));
const by = {}; for (const s of site) { (by[s.fn] ||= { C: 0, G: 0, N: 0 })[s.c]++; }
const body = SRC.slice(0, SRC.indexOf('// <<SITES'));
const ld = {}; for (const m of body.matchAll(/rollLd\(/g)) { /* recuento global */ }
const nLd = (body.match(/rollLd\(s,/g) || []).length - 0;
const motiv = (fn) => POL.fnN?.[fn] ? 'N: ' + POL.fnN[fn] : POL.fnC.includes(fn) ? 'C: todas sus tiradas llevan ventana propia con tabla' : [...new Set(Object.entries(POL.idC).filter(([k]) => k.startsWith(fn + ':')).map(([, v]) => v))].join('; ');
const rows = Object.entries(by).sort((a, b) => (b[1].G + b[1].C + b[1].N) - (a[1].G + a[1].C + a[1].N)).map(([fn, c]) => `| \`${fn}\` | ${POL.lab[fn] || ''} | ${c.C} | ${c.G} | ${c.N} | ${motiv(fn).slice(0, 190)} |`);
const tot = { C: 0, G: 0, N: 0 }; for (const s of site) tot[s.c]++;
console.log(`Sitios de tirada: ${site.length} (C ${tot.C} · G ${tot.G} · N ${tot.N}); llamadas a rollLd (chequeo de Liderazgo suelto): ${nLd}\n`);
console.log('| Función | Regla | C | G | N | Cobertura / motivo |\n|---|---|---|---|---|---|\n' + rows.join('\n'));
