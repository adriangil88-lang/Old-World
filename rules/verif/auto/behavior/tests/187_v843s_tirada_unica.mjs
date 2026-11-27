// v843s (punto 1) — la tirada enfrentada (D6 contra D6) se avisa UNA sola vez (antes salían dos popups casi iguales, uno por dado)
import { T, R, game, ok, eq } from '../lib2.mjs';
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 60; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push(e.need); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
T('v843s-rolloff-un-popup', 'rules.js rollSite (PAIR_SKIP)', 'rollOff: un único aviso con la tabla «Reparto de D6» y «Tirada automática de la regla»; mismo ganador con y sin avisos', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' });
  s.scn = 'glory'; // v843u: la ventana explica PARA QUÉ sirve (ver 201): ya no hay tablas genéricas «Reparto de D6» / «Tirada automática de la regla»
  const a = ackRun(s, (c) => R.rollOff(c, { k: 'alt' }));
  eq(a.needs.length, 1, 'avisos: ' + a.needs.map((n) => n.k).join(','));
  ok(/Tirada enfrentada de despliegue/.test(a.needs[0].title) && /1D6/.test(a.needs[0].msg) && a.needs[0].after, a.needs[0].title);
  const b = structuredClone(s); const w = R.rollOff(b, { k: 'alt' }); eq(a.r, w, 'mismo resultado con la misma semilla');
});
