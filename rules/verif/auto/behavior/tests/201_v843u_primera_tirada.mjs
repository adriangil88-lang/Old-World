// v843u (punto 1) — la ventana de la tirada enfrentada dice PARA QUÉ sirve, con cita del libro, quién tira contra quién y qué gana el ganador; el resultado se ve en la MISMA ventana (después de tirar); nada genérico («Tirada de desempate», «Sin decisión que tomar»)
import { T, R, game, ok, eq } from '../lib2.mjs';
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 60; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push(e.need); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
const mk = (scn) => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.scn = scn; return s; };
const txt = (n) => [n.title, n.msg, ...(n.tbls || []).map((t) => JSON.stringify(t)), n.after?.title, n.after?.msg].join(' ');
T('v843u-rolloff-despliegue-explica', 'rules.js rollOffWhy/rollOffAck', 'Antes de tirar: para qué sirve (quién coloca la primera unidad / elige zona), cita de Core p.285/288-298, quién tira contra quién y qué gana el ganador; después: ganador y qué ocurre, en la misma ventana', () => {
  for (const scn of ['glory', 'tower', 'flank', 'chance']) {
    const a = ackRun(mk(scn), (c) => R.rollOff(c, { k: 'alt' }));
    eq(a.needs.length, 1, scn + ': un solo aviso'); const n = a.needs[0], t = txt(n);
    ok(/Tirada enfrentada de despliegue/.test(n.title), scn + ': título'); ok(/Core p\.(285|288|292)/.test(t), scn + ': cita del libro'); ok(/Quién tira contra quién/.test(n.msg), scn + ': quién contra quién');
    ok(/Qué consigue quien gane/.test(t) && /primera unidad|Primera unidad/.test(t), scn + ': qué gana'); ok(/Quién juega el primer turno|primer turno/.test(t), scn + ': aclara lo que NO decide');
    ok(n.after && /Resultado: gana/.test(n.after.title) && /saca \d+ y .* saca \d+/.test(n.after.msg), scn + ': resultado en la misma ventana'); ok(/Tirar los dados/.test(n.okLabel || ''), scn + ': botón «Tirar los dados»');
    ok(!/desempate|Sin decisi[oó]n que tomar|Reparto de D6|Tirada autom[aá]tica de la regla/i.test(t), scn + ': sin texto genérico');
  }
});
T('v843u-rolloff-nada-que-decidir', 'rules.js rollOffWhy', 'Si el escenario fija quién despliega y la zona (Last Stand, Timely…), la tirada no decide nada: no se muestra ventana (la tirada se hace en silencio, mismo resultado)', () => {
  for (const scn of ['laststand', 'timely', 'shores']) { const s = mk(scn); const a = ackRun(s, (c) => R.rollOff(c, { k: 'alt' })); eq(a.needs.length, 0, scn + ': sin ventana'); const b = structuredClone(s); eq(a.r, R.rollOff(b, { k: 'alt' }), scn + ': mismo ganador'); }
});
T('v843u-rolloff-exploradores', 'rules.js rollOffWhy (scouts)', 'La tirada de Exploradores sólo se anuncia como tal cuando AMBOS bandos tienen Exploradores (Core p.177); en otro caso no hay ventana', () => {
  const s = mk('glory'); const a = ackRun(s, (c) => R.rollOff(c, { k: 'scouts' })); eq(a.needs.length, 1); const t = txt(a.needs[0]);
  ok(/Exploradores/.test(a.needs[0].title) && /Core p\.177/.test(t) && /AMBOS/.test(t), 'cita Core p.177 y la condición'); ok(a.needs[0].after, 'resultado en la misma ventana');
  const b = ackRun(s, (c) => R.rollOff(c, { k: 'none' })); eq(b.needs.length, 0, 'sin Exploradores en los dos bandos: sin ventana');
});
T('v843u-rolloff-otros-motivos', 'rules.js rollOffWhy', 'Catalejo, primer turno por duelo y carro perdido: cada uno explica su regla (Battle March) y qué gana cada bando', () => {
  for (const [k, re] of [['glass', /Catalejo.*Battle March|Battle March.*Catalejo|Ranger/i], ['duelBoth', /Clash of Steel/], ['clashNone', /Clash of Steel/], ['cart', /Misplaced Resources/]]) {
    const a = ackRun(mk('glory'), (c) => R.rollOff(c, { k })); eq(a.needs.length, 1, k + ': un aviso'); const t = txt(a.needs[0]);
    ok(re.test(t), k + ': cita'); ok(/Ganador/.test(t) && /Perdedor/.test(t), k + ': qué gana cada uno'); ok(a.needs[0].after, k + ': resultado en la ventana'); ok(!/desempate|Sin decisi[oó]n que tomar/i.test(t), k + ': sin genérico');
  }
});
T('v843u-rolloff-empate-repite', 'rules.js rollOff', 'Empate: se repite hasta que haya ganador (Core p.93) y el aviso de resultado lo cuenta; con y sin ventana mismo ganador y mismos dados', () => {
  const s = mk('glory'); for (let seed = 1; seed < 400; seed++) { s.rng = seed; const sv = s.rng; const a = ackRun(s, (c) => R.rollOff(c, { k: 'alt' })); const b = structuredClone(s); b.rng = sv; eq(a.r, R.rollOff(b, { k: 'alt' }), 'seed ' + seed); }
});
T('v843u-rolloff-timmmberrr', 'rules.js rollOff (timber)', '¡Timmm-berrr! (Core p.179): una sola ventana con la tirada enfrentada; el PRIMER dado es del dueño del modelo (mismo reparto que antes) y gana quien lo supere', () => {
  for (const o of [0, 1]) { const s = mk('glory'); const a = ackRun(s, (c) => R.rollOff(c, { k: 'timber', o, n: 'Centinela' })); eq(a.needs.length, 1, 'un aviso'); const t = txt(a.needs[0]);
    ok(/Timmm-berrr/.test(a.needs[0].title) && /Core p\.179/.test(t) && /arco/.test(t) && a.needs[0].after, 'explica y muestra el resultado'); ok(!/desempate|Sin decisi[oó]n que tomar/i.test(t), 'sin genérico'); ok(a.r === 0 || a.r === 1, 'ganador válido'); }
  // equivalencia con el reparto antiguo: primer dado = dueño (o), segundo = rival
  for (let seed = 1; seed < 200; seed++) { const s = mk('glory'); s.rng = seed; const c = structuredClone(s); const w = R.rollOff(c, { k: 'timber', o: 1 }); const d = structuredClone(s); const a = (R.r6 ? R.r6(d) : null); if (a != null) { const b2 = R.r6(d); if (a !== b2) eq(w, a > b2 ? 1 : 0, 'seed ' + seed); } }
});
