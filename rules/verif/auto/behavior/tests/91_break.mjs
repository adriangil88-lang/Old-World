// v838 — Reglas de la Prueba de Rotura / Ceder terreno: escenarios de combate real (dados a 2: 2+2=4 en la tirada de ruptura)
import { T, N, R, DATA, game, pair, withLd, resolve, asked, msg, diceAll, dice, ok, eq, withSr, join, U, put, engage, cur, fight, msgs, by, all } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const last = (o) => msg(o).split('\n').filter((l) => /chequeo de ruptura/.test(l)).pop() || '';
// resultado de la ruptura del defensor (p1): 'cede terreno' | 'retrocede en buen orden' | 'huye'
const verdict = (o) => (/→ (cede terreno|retrocede en buen orden|huye)/.exec(last(o)) || [])[1];

T('rule-shieldwall', RS('shieldwall'), 'Muro de escudos: una vez por partida, cargada, en formación cerrada con escudos, cede terreno en vez de retroceder en buen orden', () => {
  withLd('br_men_at_arms', 4, () => {
    const run = (ans, o = {}) => { const { s, w, l } = pair('orc_boyz', { models: 20 }, 'br_men_at_arms', { models: 10 }, o); diceAll(2); const r = resolve(s, ans); return { r, s, l }; };
    const base = run({ Muro: 'n' }); eq(verdict(base.r), 'retrocede en buen orden', 'control: sin usarlo retrocede en buen orden'); ok(asked(base.r, 'Muro de escudos'), 'se pregunta en el momento');
    const y = run({ Muro: 'y' }); eq(verdict(y.r), 'cede terreno', 'con el muro cede terreno'); ok(by(y.r.s, y.l).used.shieldwall === 1, 'se marca como usado (1/partida)');
    const nc = run({ Muro: 'y' }, { charge: false }); ok(!asked(nc.r, 'Muro de escudos'), 'si no fue cargada en este turno no se ofrece');
    // segunda vez en la misma partida: ya usado
    const { s, w, l } = pair('orc_boyz', { models: 20 }, 'br_men_at_arms', { models: 10 }); l.used.shieldwall = 1; diceAll(2); ok(!asked(resolve(s, { Muro: 'y' }), 'Muro de escudos'), 'una vez por partida');
  });
});
const phx = (type, rule, title) => {
  withLd(type, 5, () => {
    const run = (ans, wm = 20, lm = 10) => { const { s, w, l } = pair('orc_boyz', { models: wm }, type, { models: lm }); if (rule && !DATA.UNITS[type].sr.includes(rule)) throw new Error('montaje'); diceAll(2); const r = resolve(s, ans); return { r, s, l }; };
    const y = run({ [title]: 'y' }, 12, 10); ok(asked(y.r, title), 'se pregunta: ' + y.r.needs.map((n) => n.title)); ok(!/→ (huye)/.test(last(y.r)), 'no huye'); const l0 = y.l, l1 = by(y.r.s, l0); ok(Math.hypot(l1.x - l0.x, l1.y - l0.y) < 0.01, 'elige no ceder terreno: no se mueve (' + last(y.r) + ')');
    const n = run({ [title]: 'n' }, 12, 10); ok(Math.hypot(by(n.r.s, n.l).x - n.l.x, by(n.r.s, n.l).y - n.l.y) > 1, 'si no lo elige, cede terreno');
    // la Fuerza de Unidad del bando ganador más del doble: no puede
    const big = run({ [title]: 'y' }, 40, 5); ok(!asked(big.r, title), 'si la FU del ganador es más del doble no se ofrece');
  });
};
T('rule-phalanx', RS('phalanx'), 'Falange nehekharita: en formación cerrada y con escudos puede no Ceder terreno al perder (salvo FU rival más del doble)', () => phx('tk_warriors_ph', 'phalanx', 'Falange nehekharita'));
T('rule-implacDef', RS('implacDef'), 'Defensa implacable (misma regla que la Falange): no ceder terreno en formación cerrada y con escudos, salvo FU rival más del doble', () => withSr('br_men_at_arms', 'implacDef', () => phx('br_men_at_arms', 'implacDef', 'Defensa implacable')));
T('rule-implacable', RS('implacable'), 'Implacable: una vez por partida, en el turno en que fue cargado, puede no Ceder terreno si pierde una ronda de combate', () => {
  const run = (ans, o = {}, pre) => { const { s, w, l } = pair('orc_boyz', { models: 20 }, 'ct_sentinel', {}, o); pre?.(l); diceAll(2); const r = resolve(s, ans); return { r, s, l }; };
  const y = run({ Implacable: 'y' }); ok(asked(y.r, 'Implacable'), 'se pregunta al perder'); const l1 = by(y.r.s, y.l); ok(/no cede terreno/.test(msg(y.r)) && Math.hypot(l1.x - y.l.x, l1.y - y.l.y) < 0.01, 'no cede terreno: ' + msg(y.r).slice(-200)); ok(l1.used.implac === 1, '1/partida');
  const n = run({ Implacable: 'n' }); ok(Math.hypot(by(n.r.s, n.l).x - n.l.x, by(n.r.s, n.l).y - n.l.y) > 1, 'si no lo usa cede terreno (Inquebrantable)');
  ok(!asked(run({ Implacable: 'y' }, { charge: false }).r, 'Implacable'), 'solo en el turno en que fue cargado');
  ok(!asked(run({ Implacable: 'y' }, {}, (l) => { l.used.implac = 1; }).r, 'Implacable'), 'una vez por partida');
});
T('rule-stubborn', RS('stubborn'), 'Tozudos: la primera Prueba de Rotura puede no hacerse y retroceder en buen orden automáticamente (aunque la FU rival sea más del doble); solo la primera', () => {
  const mk = (ans, o = {}, wm = 20, pre) => { const { s, w, l } = pair('orc_boyz', { models: wm }, 'greatswords', { models: 10 }, o); pre?.(l); diceAll(2); return { r: resolve(s, ans), s, l }; };
  const y = mk({ Tozudos: 'y' }); ok(asked(y.r, 'Tozudos'), 'se pregunta antes de tirar'); ok(/no hace la Prueba de Rotura y retrocede en buen orden/.test(msg(y.r)), msg(y.r).slice(-300));
  const big = mk({ Tozudos: 'y' }, {}, 60); ok(/Tozuda: no hace la Prueba/.test(msg(big.r)), 'aunque la FU del ganador sea más del doble no huye: ' + msg(big.r).slice(-200));
  ok(!asked(mk({ Tozudos: 'y' }, {}, 20, (l) => { l.hadBreak = true; }).r, 'Tozudos'), 'solo la primera prueba');
  const n = mk({ Tozudos: 'n' }); ok(/chequeo de ruptura/.test(msg(n.r)), 'si renuncia a la opción hace la prueba');
});
T('rule-tileanStoic', RS('tileanStoic'), 'Estoicismo tileano: el personaje unido antes de la primera Prueba de Rotura da Tozudo a la unidad; si se va antes de esa prueba, la pierde; tras la prueba ya no', () => {
  withSr('empire_captain', 'tileanStoic', () => {
    const s = game([{ type: 'state_troops', models: 20 }, { type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = U(s, 'state_troops', 0), c = U(s, 'empire_captain', 0); cur(s);
    ok(!R.has(u, 'stubborn'), 'control: la unidad no es Tozuda por sí sola'); join(s, c, u); cur(s); ok(R.has(u, 'stubborn'), 'con el personaje unido es Tozuda');
    u.hadBreak = true; ok(!R.has(u, 'stubborn'), 'tras su primera Prueba de Rotura ya no la gana');
    u.hadBreak = false; s.units.push(c); u.joined = []; delete c.hostId; cur(s); ok(!R.has(u, 'stubborn'), 'si el personaje abandona la unidad antes de esa prueba, la pierde');
  });
});
