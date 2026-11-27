// v843m — descripciones propias en todos los sitios G, tablas «si sale X ocurrirá Y» antes de tirar y umbrales dinámicos con TU número resaltado; mismo resultado con y sin avisos
import fs from 'node:fs';
import { T, R, DATA, game, U, ok, eq, cur, put, diceAll, dlog, dice } from '../lib2.mjs';
const SRC = fs.readFileSync(new URL('../../../../../app/js/rules.js', import.meta.url), 'utf8');
const POL = JSON.parse(fs.readFileSync(new URL('../sites_policy.json', import.meta.url), 'utf8'));
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 600; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    const n0 = dlog().length;
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push({ ...e.need, rolled: dlog().length - n0 }); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
T('v843m-desc-todos', 'rules/VERIFICACION.md v843m (sitios G)', 'Todo sitio de tirada G tiene descripción propia (qué se tira, contra qué, modificadores / efecto condicional), no el texto genérico; las tablas condicionales apuntan a sitios G', () => {
  const rows = [...SRC.matchAll(/^'([A-Za-z0-9_$]+:\d+)': \['G', '([^\n]*?)'(?:, '\w+')?\],$/gm)];
  ok(rows.length > 300, 'sitios G: ' + rows.length);
  const vacios = rows.filter((r) => r[2].trim().length < 20).map((r) => r[1]); eq(vacios, [], 'sitios G sin descripción propia');
  const gset = new Set(rows.map((r) => r[1]));
  const tb = [...SRC.matchAll(/^'([A-Za-z0-9_$]+:\d+)': \["([^"]+)",(\[\[.*\]\])\],$/gm)]; ok(tb.length >= 18, 'tablas condicionales: ' + tb.length);
  for (const t of tb) { ok(gset.has(t[1]), t[1] + ' no es un sitio G'); const r = JSON.parse(t[3]); ok(r.length >= 2 && r.every((x) => x[0] && x[1].length > 4), t[1]); }
  eq(Object.keys(POL.tbl).sort(), tb.map((t) => t[1]).sort());
});
T('v843m-pigeon-tbl', 'FoF p.77 (Bombas de paloma)', 'La bomba de paloma enseña la tabla D6 completa (1 / 2-3 / 4-5 / 6) ANTES de tirar; mismo resultado con y sin avisos', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
  const u = put(U(s, 'state_troops', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2); cur(s); diceAll(5);
  const a = ackRun(s, (c) => { cur(c); const ev = []; R.pigeonBomb(c, c.units.find((q) => q.id === u.id), c.units.find((q) => q.id === t.id), ev); return ev; });
  const n = a.needs.find((x) => /Bomba|paloma|Tirada de dados/.test(x.title)); ok(n, 'sin ventana'); eq(n.rolled, 0, 'dados antes del aviso');
  const tb = n.tbls.find((x) => /Bomba de paloma/.test(x.cap || '')); ok(tb, JSON.stringify(n.tbls.map((x) => x.cap))); eq(tb.rows.map((r) => r[0]), ['1', '2-3', '4-5', '6']); ok(/Petardo/.test(tb.rows[2][1]));
  const c2 = structuredClone(s); c2.askMode = null; cur(c2); diceAll(5); R.pigeonBomb(c2, c2.units.find((q) => q.id === u.id), c2.units.find((q) => q.id === t.id), []); eq(a.s.rng, c2.rng, 'mismo rng con y sin avisos');
  eq(JSON.stringify(a.s.units.map((q) => [q.id, q.models, q.wounds])), JSON.stringify(c2.units.map((q) => [q.id, q.models, q.wounds])));
});
T('v843m-falcon-ld', 'Core p.97 + FAQ (Cuerno de Halcón)', 'Umbral dinámico: el chequeo de Liderazgo del Cuerno de Halcón muestra la tabla 2D6 con TU Liderazgo resaltado (el del portador) antes de tirar; mismo resultado con y sin avisos', () => {
  const s = game([{ type: 'br_paladin', models: 1, items: ['falcon_horn'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'command' }); const p = put(U(s, 'br_paladin'), 36, 40); cur(s); diceAll(4);
  const L = R.D(p).Ld;
  const a = ackRun(s, (c) => { cur(c); return R.falconUse(c, c.units.find((q) => q.id === p.id), []); });
  const n = a.needs.find((x) => /Cuerno|Halc|falcon|Tirada de dados/i.test(x.title + x.msg)); ok(n, 'sin ventana: ' + JSON.stringify(a.needs.map((x) => x.title))); eq(n.rolled, 0);
  const g = n.tbls.find((t) => t.k === 'grid' && /Liderazgo/.test(t.cap || '')); ok(g, JSON.stringify(n.tbls.map((t) => t.cap))); eq(g.cols[g.hc], Math.min(12, L), 'resalta tu Liderazgo'); ok(g.rows[0][g.hc] === 'Supera' || /Supera/.test(g.rows[0][g.hc]));
  const c2 = structuredClone(s); c2.askMode = null; cur(c2); diceAll(4); R.falconUse(c2, c2.units.find((q) => q.id === p.id), []); eq(a.s.rng, c2.rng, 'mismo rng');
});
T('v843m-cfail-thr', 'Core (chequeo de Iniciativa/Resistencia: un 6 natural siempre falla)', 'Umbral dinámico thCF/thLd: devuelven «le N» (máx. 5) o «ld N» y la tabla del sitio resalta ese número', () => {
  const th = R.thCF, tl = R.thLd; ok(th && tl, 'helpers no exportados');
  eq(th(3)(), 'le3'); eq(th(8)(), 'le5'); eq(th(0)(), null); eq(tl(() => 8)(), 'ld8'); eq(tl(() => 14)(), 'ld12'); eq(tl(() => 1)(), null);
  const t = R.siteTable('D6', 'le3', ''); eq(t.cols[t.hc], 3); const t2 = R.siteTable('2D6', 'ld8', ''); eq(t2.cols[t2.hc], 8); ok(/Liderazgo/.test(t2.cap));
});
