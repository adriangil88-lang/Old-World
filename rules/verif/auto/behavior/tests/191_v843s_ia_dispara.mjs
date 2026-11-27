// v843s (punto 13) — la IA dispara contra el humano: el humano ve ANTES de las tiradas la tabla de impactar, de herir y las salvaciones (armadura/especial/regeneración)
import { T, R, game, U, ok, eq, cur, put, diceAll } from '../lib2.mjs';
function ackRun(s, f, p) {
  const needs = []; const ans = {};
  for (let k = 0; k < 600; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push(e.need); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
T('v843s-ia-dispara-humano', 'Core p.138-142 (impactar, herir, salvaciones); app/js/rules.js ackWound', 'Disparo de la IA (jugador 2) contra el humano (jugador 1): avisos de impactar y de herir con la tabla de salvaciones, en ese orden y uno por paso', () => {
  const sh = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'emp_archers', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot', active: 1 });
  const shooter = U(sh, 'emp_archers', 1), tgt = U(sh, 'orc_boyz', 0); put(shooter, 36, 22, Math.PI / 2); put(tgt, 36, 40, -Math.PI / 2); cur(sh); diceAll(6);
  const b = ackRun(sh, (c) => { cur(c); R.resolveShot(c, c.units.find((x) => x.id === shooter.id), c.units.find((x) => x.id === tgt.id), []); }, [0]);
  const t = b.needs.map((n) => n.title); if (process.env.DBG) console.log(t, JSON.stringify(b.r)?.slice(0,300), b.s.units.map((x)=>x.type+x.models));
  const ih = t.findIndex((x) => /impactar/.test(x)), iw = t.findIndex((x) => /herir/.test(x));
  ok(ih >= 0 && iw > ih, 'aviso de impactar y después de herir: ' + t.join(' | '));
  const w = b.needs[iw]; ok(w.tbls.some((x) => /Salvaciones del objetivo/.test(x.cap || '')) || w.tbls.some((x) => /herir/i.test(x.cap || '')), 'tabla de herir y salvaciones');
  ok(new Set(b.needs.map((n) => n.k)).size === b.needs.length, 'ningún aviso repetido');
});
