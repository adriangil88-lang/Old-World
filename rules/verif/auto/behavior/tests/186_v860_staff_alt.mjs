// v860 — Báculo de los Elementos con despliegue alterno: la unidad está en s.pend (no en units/reserves)
import { T, R, game, ok, eq, U, cur, by, asks, asked } from '../lib3.mjs';
T('rule-staffElem-alt', 'app/js/rules.js (staffResolve, v860)', 'Báculo de los Elementos con despliegue alterno: Élisse en s.pend también recibe el popup y aplica la elección', () => {
  const s = game([{ type: 'br_elisse', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'deploy' }); s.ready = [false, false]; cur(s);
  const u = U(s, 'br_elisse', 0); ok(u.staffAlt?.pend === true, 'pendiente'); const sigs = u.staffAlt.sigs.slice();
  s.units = s.units.filter((x) => x.id !== u.id); s.pend = [...(s.pend || []), u];
  const o = asks(s, (c) => { R.staffResolve(c, 0); return null; }, [0, 1], (n) => (n.title === 'Báculo de los Elementos' && /¿Usa el Báculo/.test(n.msg) ? 'y' : undefined));
  ok(asked(o, 'Báculo de los Elementos'), 'se pregunta aunque esté en s.pend');
  const w = o.s.pend.find((x) => x.id === u.id); eq(w.spells.length, 3, 'dos firmas y un hechizo generado'); ok(w.spells.slice(0, 2).every((k) => sigs.includes(k)), 'firmas válidas: ' + w.spells.join()); ok(!w.staffAlt.pend, 'ya no pendiente');
});
