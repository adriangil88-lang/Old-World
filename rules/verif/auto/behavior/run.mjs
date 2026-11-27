// v834 — ejecuta todas las pruebas de comportamiento (tests/*.mjs) sobre el motor real y escribe out/results.json
// Uso: node run.mjs [filtro]   (filtro: subcadena del id)
globalThis.OPT_FAST = 1;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const L = await import('./lib.mjs');
const filt = process.argv[2] || '';
for (const f of fs.readdirSync(path.join(HERE, 'tests')).sort()) if (f.endsWith('.mjs')) await import(pathToFileURL(path.join(HERE, 'tests', f)).href);
// v841: aserciones vacías prohibidas (nunca pueden fallar): «|| true», ok(true…), «true &&», «>= 0» sobre longitudes/contadores, catch vacío, eq(x, x)
const VAC = [[/\|\|\s*true\s*[,)]/, '«|| true»'], [/\bok\(\s*(true|1|!0)\s*[,)&|]/, 'ok(true…)'], [/\bok\([^;]{0,80}&&\s*true\b/, '«&& true»'], [/\b(?:length|size)\s*>=\s*0\b/, 'longitud >= 0'], [/catch\s*(\([^)]*\))?\s*\{\s*\}\s*(?:\)|;)?\s*ok\(/, 'catch vacío antes de ok'], [/if\s*\(\s*!\w[\w.]*\s*\)\s*return\s*;/, 'salto silencioso «if (!x) return»'], [/\beq\(\s*([A-Za-z_$][\w$.]*)\s*,\s*\1\s*[,)]/, 'eq(x, x)'], [/\bok\(\s*[^;]{0,200}\|\|\s*1\s*[,)]/, '«|| 1» en ok']];
const vac = [];
for (const f of fs.readdirSync(path.join(HERE, 'tests')).sort()) if (f.endsWith('.mjs')) fs.readFileSync(path.join(HERE, 'tests', f), 'utf8').split('\n').forEach((ln, i) => { for (const [rx, nm] of VAC) if (rx.test(ln)) vac.push(`${f}:${i + 1} ${nm}`); });
if (vac.length) { console.log('ASERCIONES VACÍAS (' + vac.length + '):\n  ' + vac.join('\n  ')); process.exitCode = 1; }
const inv = JSON.parse(fs.readFileSync(path.resolve(HERE, '../out/qa_inventory.json'), 'utf8'));
const invBy = new Map(inv.map((x) => [x.id, x]));
const res = []; let pass = 0, fail = 0;
const t0 = Date.now();
for (const t of L.TESTS) {
  if (filt && !(process.env.RX ? new RegExp(filt).test(t.id) : t.id.includes(filt))) continue;
  L.resetDice();
  const r = { id: t.id, src: invBy.get(t.id.split(':')[0])?.src || t.src, desc: t.desc };
  // v835: una prueba debe ejecutar el motor, no leer su código fuente
  if (/String\((R|DATA|GEOM|AI)\.[A-Za-z0-9_$]+\)/.test(String(t.fn))) { r.st = 'fail'; r.err = 'la prueba inspecciona el código fuente en lugar del comportamiento'; fail++; res.push(r); continue; }
  if (process.env.TRACE) console.error('>', t.id); const tt0 = Date.now(); try { L.AC.n = 0; await t.fn(L); if (L.AC.n === 0) throw new L.Fail('prueba vacía: no ejecuta ninguna aserción'); r.st = 'pass'; pass++; } catch (e) { r.st = 'fail'; r.err = (e instanceof L.Fail ? '' : 'ERROR ') + (e.message || String(e)) + (e instanceof L.Fail ? '' : ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')); fail++; }
  L.resetDice(); r.ms = Date.now() - tt0; if (process.env.SLOW && r.ms > +process.env.SLOW) console.log('LENTA', r.id, r.ms + 'ms');
  res.push(r);
}
// cobertura del inventario de FAQ: cada entrada debe tener prueba (id igual o con sufijo ':') o motivo de no automatizable
const tested = new Set(L.TESTS.map((t) => t.id.split(':')[0])), naIds = new Map(L.NA.map((n) => [n.id, n]));
const uncovered = inv.filter((x) => !tested.has(x.id) && !naIds.has(x.id)).map((x) => x.id);
const ids = new Set(); const dup = L.TESTS.filter((t) => ids.has(t.id) || !ids.add(t.id)).map((t) => t.id);
const out = { when: new Date().toISOString(), ms: Date.now() - t0, total: res.length, pass, fail, na: L.NA.filter((n) => !n.pend).length, pend: L.NA.filter((n) => n.pend).length, faqEntries: inv.length, faqTested: inv.filter((x) => tested.has(x.id)).length, faqNA: inv.filter((x) => naIds.has(x.id) && !tested.has(x.id)).length, uncovered, dup, results: res, notAutomatable: L.NA };
if (!filt) fs.writeFileSync(path.join(HERE, 'out', 'results.json'), JSON.stringify(out, null, 1));
for (const r of res) if (r.st !== 'pass') console.log(`FALLA ${r.id} — ${r.desc}\n   ${r.err}\n   fuente: ${r.src}`);
console.log(`\nPruebas: ${res.length} · pasan ${pass} · fallan ${fail} · no automatizables ${out.na} · pendientes ${out.pend} · FAQ ${out.faqTested}/${inv.length} con prueba, ${out.faqNA} listadas sin automatizar, ${uncovered.length} sin cubrir${dup.length ? ' · ids duplicados: ' + dup.join(',') : ''} · ${out.ms} ms`);
if (uncovered.length && !filt) console.log('Sin cubrir (' + uncovered.length + '):', uncovered.slice(0, 40).join(' ') + (uncovered.length > 40 ? ' …' : ''));
process.exitCode = vac.length || fail || (!filt && uncovered.length) ? 1 : 0;
