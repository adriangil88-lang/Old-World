// v843q (puntos 5, 6, 7) — popups de disparo/combate con tablas del libro y origen de cada número; atacante nombrado; tirada del primer turno explicada
import { T, R, game, U, ok, eq, cur, put, diceAll, bout } from '../lib2.mjs';
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 600; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push(e.need); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
T('v843q-disparo-origen', 'Core p.138-140 (To Hit / Long Range / To Wound)', 'Disparo: el aviso nombra al ATACANTE y al objetivo (need.hl), muestra la tabla del libro (Core p.138), explica de dónde salen HP y disparos y cada modificador (largo alcance con su distancia y página)', () => {
  const sh = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const s0 = put(U(sh, 'emp_archers'), 36, 44), t0 = put(U(sh, 'orc_boyz', 1), 36, 22, Math.PI / 2); cur(sh); diceAll(1);
  const b = ackRun(sh, (c) => { cur(c); R.resolveShot(c, c.units.find((x) => x.id === s0.id), c.units.find((x) => x.id === t0.id), []); });
  const n = b.needs.find((x) => /impactar/.test(x.title)); ok(n, 'aviso de impactar');
  eq([n.hl.atk, n.hl.tgt, n.hl.role], [s0.id, t0.id, 'Atacante'], 'atacante y objetivo');
  ok(/Core p\.138/.test(n.tbls[0].cap), 'tabla del libro con página');
  const o = n.tbls.find((t) => /¿De dónde sale/.test(t.cap)); ok(o, 'tabla de origen');
  ok(o.rows.some((r) => /Habilidad de Proyectiles/.test(r[0]) && /atributo HP de/.test(r[1])), 'HP explicada');
  ok(o.rows.some((r) => /disparo/.test(r[0]) && /modelos? que pueden disparar ×/.test(r[1])), 'disparos: fórmula');
  const w = n.tbls.find((t) => /Explicación de cada ajuste/.test(t.cap)); ok(w && w.rows.some((r) => /largo alcance/i.test(r[0]) && /Core p\.139/.test(r[1]) && /mitad del alcance/.test(r[1])), 'largo alcance explicado');
});
T('v843q-melee-herir-origen', 'Core p.148-149 (To Hit Chart / To Wound Chart)', 'Cuerpo a cuerpo: las tablas llevan su página (Core p.148 / p.149), el aviso nombra atacante y objetivo y explica HA, ataques, Fuerza y Resistencia (celda resaltada)', () => {
  const r = bout('state_troops', {}, 'orc_boyz', {}, { noFight: true, charge: 4, fa: 'empire', fb: 'orcs' }); const s = r.s; const a = U(s, 'state_troops', 0), e = U(s, 'orc_boyz', 1); cur(s);
  const b = ackRun(s, (c) => { cur(c); R.resolveCombats(c, []); });
  const h = b.needs.find((x) => x.title === 'Tirada para impactar'), w = b.needs.find((x) => x.title === 'Tirada para herir'); ok(h && w, 'avisos de impactar y herir');
  ok(/Core p\.148/.test(h.tbls[0].cap) && /Core p\.140/.test(w.tbls[0].cap), 'páginas en las tablas');
  ok(h.hl && h.hl.atk === a.id && w.hl && w.hl.tgt === e.id, 'atacante/objetivo nombrados');
  ok(h.tbls.some((t) => /¿De dónde sale/.test(t.cap) && t.rows.some((r) => /Habilidad de Armas \(HA\)/.test(r[0]) && /Es la HA de/.test(r[1]))), 'HA explicada');
  ok(w.tbls.some((t) => /¿De dónde sale/.test(t.cap) && t.rows.some((r) => /^Fuerza \d/.test(r[0])) && t.rows.some((r) => /^Resistencia \d/.test(r[0]))), 'Fuerza y Resistencia explicadas');
});
T('v843q-primer-turno', 'Core p.285-286 «First Turn» + «Rolling Off»', 'Tirada del primer turno: ventana previa con la regla del libro, tabla de resultados/empate, modificadores y los nombres reales de los ejércitos (sin «…»)', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.rolloff = true; s.preFirst = null; s.firstReady = 0; s.scn = 'glory'; s.kurnous = [0, 0]; cur(s);
  const b = ackRun(s, (c) => { cur(c); c.rollW = null; c.rollWinner = null; R.firstRoll(c, []); });
  const n = b.needs.find((x) => x.k.includes('firstRollWhy')); ok(n, 'ventana previa de la tirada'); ok(/Imperio/.test(n.title) && /Orcos/.test(n.title), 'nombres reales en el título: ' + n.title);
  ok(/Una vez completado el despliegue, el ganador de una tirada enfrentada juega el primer turno/.test(n.msg), 'cita del libro'); ok(/empate/.test(JSON.stringify(n.tbls)), 'empate explicado');
  ok(!b.needs.some((x) => /… …|contra …/.test(x.msg) || /Tirada de dados: .*primer turno/.test(x.title)), 'sin texto con huecos');
});
T('v843q-despliegue-frontal', 'v843q punto 4; app/js/rules.js deployFace', 'La primera colocación de una unidad en el despliegue queda siempre en posición frontal (u.face = frente de su zona) y deployFace da el frente de cada jugador', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); cur(s);
  const a = U(s, 'state_troops', 0), e = U(s, 'orc_boyz', 1);
  eq(R.deployFace(s, a), s.fwd[0], 'frente jugador 1'); eq(R.deployFace(s, e), s.fwd[1], 'frente jugador 2'); ok(Math.abs(R.deployFace(s, a) - R.deployFace(s, e)) > 1, 'los frentes miran en sentidos opuestos');
});
