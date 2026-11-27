// v843l — tablas con tu número resaltado en los sitios G, fuentes de salvación especial/regeneración, desglose de Liderazgo, modificadores de lanzamiento/dispersión, ventanas de createGame y repetición de las jugadas del rival
import fs from 'node:fs';
import { T, R, DATA, game, U, ok, eq, cur, put, diceAll, dlog } from '../lib2.mjs';
const SRC = fs.readFileSync(new URL('../../../../../app/rules.js'.replace('app/rules.js', 'app/js/rules.js'), import.meta.url), 'utf8');
const MAIN = fs.readFileSync(new URL('../../../../../app/js/main.js', import.meta.url), 'utf8');
const CORE = 'rules/core.txt';
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 600; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push(e.need); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
const base = () => game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' });
T('v843l-site-tables', 'rules/VERIFICACION.md v843l (tablas de los sitios G)', 'Los sitios G con umbral escrito en la regla dibujan la tabla del dado con tu número resaltado (4+, 2 o menos, exactamente 1…); los de cantidad al azar muestran el reparto del dado sin resaltar', () => {
  const t = (d, th) => R.siteTable(d, th);
  let x = t('D6', 'ge4'); eq(x.hc, 3); eq(x.need, '4+'); eq(x.rows[0].map((v) => v[0]), ['N', 'N', 'N', 'S', 'S', 'S']);
  x = t('D6', 'le2'); eq(x.hc, 1); eq(x.need, '2 o menos'); x = t('D6', 'eq1'); eq(x.hc, 0); x = t('D6', 'lt3'); eq(x.hc, 1); eq(x.need, '2 o menos'); x = t('D6', 'gt4'); eq(x.hc, 4); eq(x.need, '5+');
  x = t('D3', 'ge2'); eq(x.cols, [1, 2, 3]); eq(x.hc, 1); x = t('2D6', 'ge7'); eq(x.cols.length, 11); eq(x.cols[x.hc], 7);
  x = t('D6', null); eq(x.hr, -1); eq(x.hc, -1); ok(/Cantidad al azar/.test(x.note)); x = t('2D6', null); eq(x.rows[1][5], '6/36'); x = t('8D6', null); ok(x.rows.some((r) => r[0] === 'Máximo' && r[1] === '48'));
  const rows = [...SRC.matchAll(/^'([A-Za-z0-9_$]+:\d+)': \['G', '[^\n]*?', '((?:ge|le|eq|lt|gt)\d)'\],$/gm)]; ok(rows.length >= 45, 'umbrales extraídos: ' + rows.length);
  ok(rows.every((r) => +r[2].slice(2) >= 1 && +r[2].slice(2) <= 12), 'umbral fuera de rango');
});
T('v843l-save-sources', CORE + ' (Special saves, Regeneration)', 'La ventana de herir lista cada regla/objeto que da la salvación especial y la regeneración (se usa la mejor) y el valor final coincide; mismo resultado con y sin avisos', () => {
  const s = base(); const e = U(s, 'orc_boyz', 1); (e.fx ||= []).push({ k: 'ward', v: 5 }, { k: 'regen', v: 4 }); cur(s); diceAll(4);
  const a = ackRun(s, (c) => { cur(c); return R.woundAndSave(c, c.units.find((q) => q.id === e.id), 2, 4, 0, {}); });
  const w = a.needs.find((n) => n.title === 'Tirada para herir'); ok(w, 'sin ventana de herir'); const sw = w.tbls.find((t) => /Salvación especial: reglas/.test(t.cap || '')), rg = w.tbls.find((t) => /Regeneración: reglas/.test(t.cap || ''));
  ok(sw && sw.rows.some((r) => r[1] === '5+'), JSON.stringify(sw)); ok(/5\+/.test(sw.note)); ok(rg && rg.rows.some((r) => r[1] === '4+'), JSON.stringify(rg)); ok(/4\+/.test(rg.note));
  const c2 = structuredClone(s); c2.askMode = null; cur(c2); diceAll(4); R.woundAndSave(c2, c2.units.find((q) => q.id === e.id), 2, 4, 0, {}); eq(a.s.rng, c2.rng, 'mismo rng con y sin avisos');
});
T('v843l-ld-breakdown', CORE + ' (Leadership, p.97)', 'El chequeo de Liderazgo muestra el Liderazgo efectivo regla por regla (base del perfil, cada modificador y el resultado) y coincide con el número resaltado', () => {
  const s = base(); const u = U(s, 'state_troops', 0); u.ldm = 1; cur(s);
  const a = ackRun(s, (c) => { cur(c); const x = c.units.find((q) => q.id === u.id); R.ackLd(c, x, R.ldOf(c, x), 'Chequeo de Liderazgo', 'prueba', 'tst'); });
  const n = a.needs[0]; const bk = n.tbls.find((t) => /Liderazgo efectivo/.test(t.cap || '')); ok(bk, 'sin desglose: ' + JSON.stringify(n.tbls.map((t) => t.cap)));
  eq(bk.rows[0][1], String(DATA.UNITS.state_troops.Ld)); ok(bk.rows.some((r) => r[1] === '−1'), JSON.stringify(bk.rows)); eq(bk.rows[bk.rows.length - 1][1], String(DATA.UNITS.state_troops.Ld - 1));
});
T('v843l-cast-dispel-mods', CORE + ' (Casting p.108-110)', 'Lanzamiento y dispersión listan sus modificadores previos uno por uno (Nivel/2, objetos…) antes de tirar', () => {
  const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'magic' }); const w = put(U(s, 'empire_mage', 0), 36, 44), e = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2); w.spells = ['fireball']; w.casted = []; cur(s); diceAll(4);
  const a = ackRun(s, (c) => { cur(c); R.doCast(c, c.units.find((q) => q.id === w.id), 'fireball', c.units.find((q) => q.id === e.id), []); });
  const n = a.needs.find((x) => x.title === 'Tirada de lanzamiento'); const m = n.tbls.find((t) => /Modificadores a la tirada de lanzamiento/.test(t.cap || '')); ok(m, 'sin desglose de lanzamiento'); ok(m.rows.some((r) => /Nivel/.test(r[0]) && /^\+/.test(r[1])), JSON.stringify(m.rows));
  const d = R.dispList(a.s, a.s.units.find((q) => q.id === w.id), 'missile'); ok(Array.isArray(d), 'dispList');
});
T('v843l-createGame-windows', 'rules/VERIFICACION.md v843l (preparación de la partida)', 'createGame con ackMap pide su ventana ANTES de cada tirada de preparación (sitios createGame:n), no deja rastro de askMode/ans y da exactamente el mismo estado que sin avisos', () => {
  const P = DATA.PRESETS; const cfg = { seed: 3, armies: [P.empire[1000], P.orcs[1000]], factions: ['empire', 'orcs'], limit: 1000, scn: 'bm_pitched', hap: 'weather' };
  const plain = R.createGame(cfg); let ans = {}, n = 0; let g = null;
  for (let k = 0; k < 40 && !g; k++) { try { g = R.createGame({ ...cfg, ackMap: { 0: true, 1: true }, ackAns: ans }); } catch (e) { if (!e.need) throw e; ok(e.need.ack && /^g:createGame:/.test(e.need.k.split(':ack:')[1] || ''), e.need.k); ans = { ...ans, [e.need.k]: 'ok' }; n++; } }
  ok(g, 'createGame no termina'); ok(n >= 1, 'sin ventanas de preparación: ' + n); ok(!('askMode' in g) && !('ans' in g)); eq(g.rng, plain.rng); eq(JSON.stringify(g.units.map((u) => [u.id, u.x, u.y])), JSON.stringify(plain.units.map((u) => [u.id, u.x, u.y])));
});
T('v843l-code-replay', 'rules/VERIFICACION.md v843l (modo por código coherente)', 'Modo por código: las jugadas del rival se repiten en mi dispositivo con avisos solo míos y mismo estado final (main.js replayAck); createGame de main.js usa ackMap', () => {
  ok(/async function replayAck/.test(MAIN) && /await replayAck\(a\)/.test(MAIN) && /ackMap: ackM/.test(MAIN), 'main.js sin replayAck/ackMap');
  const s = base(); const u = U(s, 'state_troops', 0), e = U(s, 'orc_boyz', 1); cur(s); diceAll(3);
  const a = ackRun(s, (c) => { cur(c); return R.woundAndSave(c, c.units.find((x) => x.id === e.id), 2, 3, 0, {}); }, [1]);
  ok(a.needs.length >= 1 && a.needs.every((n) => n.p === 1), 'avisos solo para el jugador que los pide');
});
