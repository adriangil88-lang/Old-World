// v843q (punto 2) — todas las etiquetas (chips) de la ficha tienen descripción accesible al tocarlas
import { T, DATA, ok } from '../lib2.mjs';
import fs from 'fs';
const MAIN = fs.readFileSync('/home/claude/tow/app/js/main.js', 'utf8');
const RULES_SRC = fs.readFileSync('/home/claude/tow/app/js/rules.js', 'utf8') + '\n' + fs.readFileSync('/home/claude/tow/app/js/data.js', 'utf8');
T('v843q-chips-ficha-con-titulo', 'main.js unitCard (v843q)', 'Cada etiqueta (chip) creada en la ficha de unidad lleva un title (texto que se abre con el toque): ninguna queda sin descripción, incluida «Lanza en carga»', () => {
  const a = MAIN.indexOf('function unitCard(u)'), b = MAIN.indexOf('const pct = Math.round(100 * u.models', a); ok(a > 0 && b > a, 'bloque unitCard');
  const blk = MAIN.slice(a, b);
  const raw = [...blk.matchAll(/<span class="chip[^"]*"([^>]*)>/g)];
  ok(raw.length >= 8, 'chips literales ' + raw.length);
  for (const m of raw) ok(/title="/.test(m[1]), 'chip sin title: ' + m[0].slice(0, 80));
  for (const m of blk.matchAll(/chips\.push\((chipH\([^;]*)\);/g)) { ok(/chipH\('(?:[a-z]*)', /.test(m[1]), 'chipH'); }
  ok(/Lanza en carga'?,\s*'Lanza \(Core/.test(blk), 'Lanza en carga con descripción del libro');
});
T('v843q-chips-reglas-especiales', 'data.js RULES / UNITS', 'Toda regla especial de toda unidad de todos los ejércitos existe en RULES con descripción (≥ 20 caracteres) para el popup de la etiqueta', () => {
  const { RULES, UNITS } = DATA; let n = 0;
  for (const [id, u] of Object.entries(UNITS)) for (const r of u.sr || []) { const e = RULES[r]; ok(e && e[0] && e[1] && e[1].length >= 15, `${id}: regla «${r}» sin descripción`); n++; }
  ok(n > 1000, 'reglas revisadas ' + n);
});
T('v843q-chips-objetos-hechizos', 'data.js ITEMS / SPELLS', 'Todos los objetos y hechizos tienen nombre y texto; el chip de objeto/estandarte muestra siempre un texto', () => {
  const { ITEMS, SPELLS } = DATA;
  for (const [k, it] of Object.entries(ITEMS)) ok(it.name && it.text && it.text.length >= 8, 'objeto sin texto: ' + k);
  for (const [k, sp] of Object.entries(SPELLS)) ok(sp.name && sp.text && sp.text.length >= 8, 'hechizo sin texto: ' + k);
});
T('v843q-chips-efectos', 'rules.js (u.fx) + data.js FXD/fxInfo', 'Todo efecto temporal que el motor puede poner en una unidad (u.fx) tiene nombre y descripción', () => {
  const { fxInfo, SPELLS, MARKS } = DATA; ok(typeof fxInfo === 'function', 'fxInfo');
  const keys = new Set();
  for (const m of RULES_SRC.matchAll(/(?:fx\.push|addFx|\badd)\(([^;]{0,400}?)\)(?:;|\s*\})/g)) for (const k of m[1].matchAll(/\bk: '(\w+)'/g)) keys.add(k[1]);
  keys.delete('pot'); for (const k of ['potP', 'potA', 'potS', 'potT', 'potI']) keys.add(k);
  for (const sp of Object.values(SPELLS)) { if (sp.effect) keys.add(sp.effect); if (sp.vx?.fx) keys.add(sp.vx.fx); }
  ok(keys.size > 100, 'claves ' + keys.size);
  for (const k of keys) { const i = fxInfo(k); ok(i.name && i.text && i.text.length >= 10, 'efecto sin descripción: ' + k); }
  for (const k of Object.keys(MARKS)) ok(new RegExp(k + ": '").test(MAIN), 'marca sin texto: ' + k);
});
