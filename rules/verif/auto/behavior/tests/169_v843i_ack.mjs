// v843i — avisos y tablas ANTES de la acción (popup + OK): la acción se interrumpe antes de tirar/aplicar (s.askMode.ack), muestra la tabla del libro con tu celda resaltada y, tras el OK, se resuelve igual que sin aviso.
import { T, R, DATA, game, U, ok, eq, bout, cur, put, diceAll, dlog, resetDice, msgs } from '../lib2.mjs';
const CORE = 'rules/core.txt';
// ejecuta f(c) sobre copias del estado confirmando cada aviso con OK (como la interfaz: restaura, responde y repite); devuelve los avisos en orden y el estado final
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 400; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    const n0 = dlog().length; const log0 = dlog().slice();
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) {
      if (!e.need) throw e; ok(e.need.ack === true && e.need.opts[0][0] === 'ok', 'el aviso debe ser de tipo ack con botón OK');
      needs.push({ ...e.need, rolled: dlog().length - n0 }); ans[e.need.k] = 'ok'; globalThis.__DLOG = log0;
    }
  }
  throw new Error('demasiados avisos');
}
const mk = (o = {}) => bout('state_troops', {}, 'orc_boyz', {}, { noFight: true, charge: 4, fa: 'empire', fb: 'orcs', ...o });
const stateSig = (s) => JSON.stringify([s.rng, s.units.map((u) => [u.id, u.x, u.y, u.models, u.wounds, u.fleeing])]);
T('v843i-melee-seq', CORE + ' (Combat phase: 1.2 To Hit chart, 1.3 To Wound chart)', 'Combate cuerpo a cuerpo: primero la tabla de impactar (HA 3 contra HA 3 → 4+, celda [3][3] resaltada), luego la de herir (F3 contra R4 → 5+); ningún dado se ha tirado antes del primer aviso; el resultado es idéntico al de sin avisos', () => {
  const r = mk(); const s = r.s; cur(s);
  const a = ackRun(s, (c) => { cur(c); const ev = []; R.resolveCombats(c, ev); return ev; });
  const h = a.needs[0], w = a.needs[1];
  eq(h.title, 'Tirada para impactar'); eq(a.needs[0].rolled, 0, 'dados antes del primer aviso');
  eq([h.tbls[0].hr, h.tbls[0].hc, h.tbls[0].need], [2, 2, '4+']); eq(h.tbls[0].rows[2][2], '4+', 'la celda resaltada contiene el objetivo');
  eq(w.title, 'Tirada para herir'); eq([w.tbls[0].hr, w.tbls[0].hc, w.tbls[0].need], [2, 3, '5+']); eq(w.tbls[0].rows[2][3], '5+');
  ok(a.needs.findIndex((n) => n.title === 'Tirada para impactar') < a.needs.findIndex((n) => n.title === 'Tirada para herir'), 'orden hit → wound');
  const c2 = structuredClone(s); c2.askMode = null; cur(c2); R.resolveCombats(c2, []);
  eq(stateSig(a.s), stateSig(c2), 'mismo resultado con y sin avisos');
});
T('v843i-wound-saves', CORE + ' (To Wound chart; Armour Saves)', 'Herir: la ventana incluye la salvación de armadura del objetivo con su modificador de FP y el número final', () => {
  const r = mk(); cur(r.s);
  const a = ackRun(r.s, (c) => { cur(c); R.resolveCombats(c, []); });
  const w = a.needs.find((n) => n.title === 'Tirada para herir' && /Orcos →/.test(n.msg)); const kv = w.tbls.find((t) => t.k === 'kv' && /Salvaciones/.test(t.cap));
  ok(kv && /armadura/i.test(kv.rows[0][0]) && /^[2-6]\+$|imposible/.test(kv.rows[0][1]), 'sin fila de armadura: ' + JSON.stringify(kv));
});
T('v843i-wound-table', CORE + ' (To Wound Chart)', 'La tabla de herir mostrada coincide con la del libro en todas sus celdas (S1-R7 y superiores "-", S4-R4 3+, S10-R10 4+)', () => {
  const r = mk(); cur(r.s);
  const a = ackRun(r.s, (c) => { cur(c); R.resolveCombats(c, []); }); const t = a.needs.find((n) => n.title === 'Tirada para herir').tbls[0];
  eq(t.rows[0], ['4+', '5+', '6+', '6+', '6+', '6+', '-', '-', '-', '-']); eq(t.rows[3][3], '4+'); eq(t.rows[9], ['2+', '2+', '2+', '2+', '2+', '2+', '2+', '2+', '3+', '4+']); eq(t.rows[6][5], '3+');
});
T('v843i-break', CORE + ' (3.3 Break Test, p.154)', 'Prueba de Rotura: el aviso da los tres resultados con los números exactos (Ld 7, perdida por 4: rompe con 8–12, retrocede con 4–7, cede con 2–3 o doble 1) antes de tirar', () => {
  const r = mk(); cur(r.s);
  const a = ackRun(r.s, (c) => { cur(c); R.resolveCombats(c, []); }); const b = a.needs.find((n) => n.title === 'Prueba de Rotura');
  ok(b, 'sin aviso de rotura'); const rows = b.tbls[0].rows; eq(rows[0][0], '8–12'); eq(rows[1][0], '4–7'); eq(rows[2][0], '2–3 (y doble 1)'); eq(b.tbls[1].need, 'Natural ≤ 7 para no romper');
  const i = (t) => a.needs.findIndex((n) => n.title === t); ok(i('Prueba de Rotura') < i('Retroceso en buen orden') && i('Retroceso en buen orden') < i('Seguimiento'), 'orden rotura → retroceso → seguimiento');
});
T('v843i-ld-table', CORE + ' (Leadership tests, p.97)', 'Chequeo de Liderazgo: tabla de 2D6 con la columna de tu Liderazgo resaltada; doble 1 supera y doble 6 falla', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const u = U(s, 'state_troops', 0); cur(s);
  const a = ackRun(s, (c) => { cur(c); return R.passPanic(c, c.units.find((x) => x.id === u.id)); });
  const n = a.needs[0]; eq(n.title, 'Chequeo de Pánico'); const t = n.tbls[0]; const ld = Math.floor(R.psyLd(s, u));
  eq(t.cols[t.hc], ld); eq(t.rows[0][0], 'Supera (doble 1)'); eq(t.rows[0][10], 'Falla (doble 6)'); eq(t.rows[0][t.hc], 'Supera'); eq(t.need, `2D6 ≤ ${ld}`);
  if (ld < 11) eq(t.rows[0][t.hc + 1], 'Falla');
});
T('v843i-shoot', CORE + ' (Shooting: 2. Roll To Hit, p.138)', 'Disparo: tabla de Habilidad de Proyectiles con tu BS resaltada y el objetivo con modificadores', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a0 = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 30, Math.PI / 2); cur(s); diceAll(1);
  const a = ackRun(s, (c) => { cur(c); const ev = []; R.resolveShot(c, c.units.find((x) => x.id === a0.id), c.units.find((x) => x.id === t.id), ev); return ev; });
  const n = a.needs.find((x) => /impactar/.test(x.title)); ok(n, 'sin aviso de disparo'); const tb = n.tbls[0], bs = DATA.UNITS.emp_archers.BS;
  eq(tb.hc, bs - 1); eq(tb.rows[0][bs - 1], tb.need); eq(n.rolled, 0, 'dados antes del aviso');
  const c2 = structuredClone(s); c2.askMode = null; cur(c2); diceAll(1); R.resolveShot(c2, c2.units.find((x) => x.id === a0.id), c2.units.find((x) => x.id === t.id), []); eq(stateSig(a.s), stateSig(c2), 'igual sin avisos');
});
T('v843i-miscast-art', CORE + ' (Miscast Table p.109; Artillery dice; Misfire tables p.225/229)', 'Tabla de Pifias, dado de Artillería y tablas de Avería: se muestran con sus filas reales antes de tirar', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const u = U(s, 'state_troops', 0); cur(s); diceAll(6);
  const m = ackRun(s, (c) => { cur(c); return R.miscast(c, c.units.find((x) => x.id === u.id), []); }); eq(m.needs[0].title, 'Tabla de Pifias'); eq(m.needs[0].tbls[0].rows.map((r) => r[0]), ['2-4', '5-6', '7', '8-9', '10-12']); eq(m.needs[0].rolled, 0);
  const d = ackRun(s, (c) => { cur(c); return R.artDieM(c, c.units.find((x) => x.id === u.id)); }); eq(d.needs[0].title, 'Dado de Artillería'); eq(d.needs[0].tbls[0].rows.map((r) => r[1]).slice(0, 5), ['2', '4', '6', '8', '10']); eq(d.needs[0].tbls[1].rows.map((r) => r[0]), ['1', '2-4', '5-6']);
});
T('v843i-auto-announce', 'rules/VERIFICACION.md v843i (acciones automáticas del motor)', 'Acción automática (announce): con ack el aviso sale ANTES (la acción se interrumpe sin efecto) y no se repite después; sin ack se encola como antes', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); s.manualReloc = [true, false]; cur(s);
  const a = ackRun(s, (c) => { cur(c); R.announce(c, [], 'Prueba de aviso', { owner: 0 }); }, [0]);
  eq(a.needs.length, 1); eq(a.needs[0].title, 'Va a suceder'); ok(/Prueba de aviso/.test(a.needs[0].msg)); eq((a.s.notices || []).length, 0, 'no debe haber aviso posterior');
  const c = structuredClone(s); c.askMode = null; cur(c); R.announce(c, [], 'Prueba de aviso', { owner: 0 }); eq(c.notices.length, 1, 'sin ack se encola como antes');
  const c3 = structuredClone(s); c3.askMode = { 0: true }; cur(c3); R.announce(c3, [], 'Otra', { owner: 0 }); eq((c3.notices || []).length, 1, 'askMode sin ack: comportamiento anterior');
});
T('v843i-ai-no-ack', 'rules/VERIFICACION.md v843i', 'Sin ack para el bando (IA o rival remoto) no hay avisos: la acción se ejecuta de una vez', () => {
  const r = mk(); cur(r.s); diceAll(1); const c = structuredClone(r.s); c.askMode = { ack: { 1: true } }; cur(c);
  let n = 0; try { R.resolveCombats(c, []); } catch (e) { n = e.need ? 1 : 0; } eq(n, 1, 'el bando 1 sí es humano con ack');
  const c2 = structuredClone(r.s); c2.askMode = { ack: {} }; cur(c2); R.resolveCombats(c2, []); eq(c2.units.length, 2);
});
T('v843i-cast-dispel', CORE + ' (Casting p.108-110: casting value, dispel)', 'Lanzamiento: aviso con el valor de lanzamiento exacto (bola de fuego 5+... el del hechizo) y bonificador de Nivel/2 antes de tirar; el resultado es idéntico sin avisos', () => {
  const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'magic' }); const w = put(U(s, 'empire_mage', 0), 36, 44), e = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2); w.spells = ['fireball']; w.casted = []; cur(s);
  const lv = Math.ceil(R.D(w).wizard.level / 2), cv = DATA.SPELLS.fireball.cv; diceAll(4);
  const a = ackRun(s, (c) => { cur(c); const x = c.units.find((q) => q.id === w.id); R.doCast(c, x, 'fireball', c.units.find((q) => q.id === e.id), []); });
  const n = a.needs[0]; eq(n.title, 'Tirada de lanzamiento'); eq(n.tbls[0].rows[0], ['Valor de lanzamiento', cv + '+']); eq(n.tbls[0].need, `≥ ${cv}`); ok(n.tbls[0].rows[1][1].includes('+ ' + lv), 'bonificador de Nivel'); eq(n.rolled, 0); eq(n.tbls[1].rows.length, 5, 'tabla de Pifias de referencia');
  const c2 = structuredClone(s); c2.askMode = null; cur(c2); diceAll(4); R.doCast(c2, c2.units.find((q) => q.id === w.id), 'fireball', c2.units.find((q) => q.id === e.id), []); eq(stateSig(a.s), stateSig(c2), 'mismo resultado');
});
T('v843i-flee-pursuit-auto', CORE + ' (Flee p.132, Fall Back p.134, Pursuit p.156)', 'Acciones automáticas tras perder el combate: aviso antes de huir/retroceder (con la regla y qué dados se tiran) y antes de perseguir; la unidad no se ha movido cuando sale el aviso', () => {
  const r = mk(); cur(r.s); const a = ackRun(r.s, (c) => { cur(c); R.resolveCombats(c, []); });
  const f = a.needs.find((n) => /Retroceso|Huida/.test(n.title)); ok(f && /Core p\.1[0-9]{2}/.test(f.msg) && /dos D6|2D6/.test(f.msg), 'aviso de huida: ' + (f && f.msg)); const p = a.needs.find((n) => /Persecución|Seguimiento/.test(n.title)); ok(p && /2D6/.test(p.msg));
});
T('v843i-danger-terrain', CORE + ' (Dangerous Terrain, p.130)', 'Terreno peligroso: la tabla D6 (1 = baja) con el nº de dados se muestra antes de tirar', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const u = U(s, 'state_troops', 0); cur(s); diceAll(6);
  const a = ackRun(s, (c) => { cur(c); R.dangerTest(c, c.units.find((x) => x.id === u.id), ['trampas'], []); });
  eq(a.needs[0].title, 'Terreno peligroso'); eq(a.needs[0].tbls[0].rows[0], ['1', 'El modelo es una baja (se retira)']); ok(/10 dados/.test(a.needs[0].msg), a.needs[0].msg);
});
