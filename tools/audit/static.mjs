// Auditoría estática: cada regla especial (sr), objeto y hechizo debe tener efecto en el motor (referencia en rules.js/ai.js/geom.js, o campos de datos consumidos).
import { UNITS, ITEMS, SPELLS } from '../../app/js/data.js';
import fs from 'node:fs';
const src = ['rules.js', 'ai.js', 'geom.js'].map((f) => fs.readFileSync(new URL('../../app/js/' + f, import.meta.url), 'utf8')).join('\n');
const dsrc = fs.readFileSync(new URL('../../app/js/data.js', import.meta.url), 'utf8');
const srs = {};
for (const [k, u] of Object.entries(UNITS)) for (const r of u.sr || []) (srs[r] ||= []).push(k);
const miss = Object.keys(srs).filter((r) => !new RegExp(`['"\`]${r.replace(/[^\w]/g, '.')}['"\`]|\\.${r}\\b|\\b${r}:|\\b${r}\\b`).test(src));
console.log('SR totales', Object.keys(srs).length, 'sin referencia en el motor', miss.length); console.log(miss.map((r) => `${r}(${srs[r].length}: ${srs[r].slice(0, 2)})`).join('  '));
const im = Object.keys(ITEMS).filter((k) => { const it = ITEMS[k]; const fields = Object.keys(it).filter((f) => !['name', 'cost', 'fac', 'desc', 'txt', 'blurb', 'bn', 'type', 'slot', 'pts', 'cat', 'unique', 'only', 'mundane', 'onlyT', 'list'].includes(f)); const keyUsed = new RegExp(`['"\`]${k}['"\`]`).test(src); return !keyUsed && fields.length === 0; });
console.log('Objetos', Object.keys(ITEMS).length, 'sin referencia ni campos efectivos', im.length); console.log(im.join(' '));
const sm = Object.keys(SPELLS).filter((k) => { const sp = SPELLS[k]; const fields = Object.keys(sp).filter((f) => !['name', 'cv', 'lore', 'type', 'desc', 'txt', 'range', 'fac'].includes(f)); return !new RegExp(`['"\`]${k}['"\`]`).test(src) && fields.length === 0; });
console.log('Hechizos', Object.keys(SPELLS).length, 'sin referencia ni campos', sm.length, sm.join(' '));
