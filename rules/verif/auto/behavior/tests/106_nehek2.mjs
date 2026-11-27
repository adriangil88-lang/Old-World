// v838 — Reglas de Reyes Funerarios y personajes (lote 7)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const G = (A, B, f, o = {}) => game(A, B, { f, phase: 'strategy', active: 0, ...o });
const priestGame = (hostType, who = 'tk_hpriest', ex = []) => { const s = G([{ type: who, models: 1 }, { type: hostType, models: 10 }, ...ex], [{ type: 'orc_boyz', models: 10 }], ['tk', 'orcs']); const c = U(s, who, 0), h = U(s, hostType, 0); put(c, 36, 40); put(h, 36, 44); join(s, c, h); h.wounds = Math.max(1, h.wounds - 6); h.models = Math.ceil(h.wounds / D(h).W); cur(s); return { s, c, h }; };
T('rule-arise', RS('arise'), '¡Levantaos!: en Mando, sin trabarse y con chequeo de Liderazgo, una unidad No muerta a 12" recupera Heridas (infantería: nivel + D3; caballería: nivel + 1; monstruosa: nivel; otros: 1)', () => {
  const run = (host, d, mod) => { const x = priestGame(host); if (mod) mod(x); dice(d); diceAll(3); const w0 = x.h.wounds; const o = strategy(x.s); return { w: by(o.s, x.h).wounds - w0, lvl: D(x.c).wizard.level, o, x }; };
  const a = run('tk_warriors_ph', [1, 2, 2]); eq(a.w, a.lvl + 2, 'infantería: nivel + D3 (' + a.lvl + ' + 2)');
  const b = run('tk_warriors_ph', [6, 5]); eq(b.w, 0, 'si falla el chequeo de Liderazgo no recupera');
  const c = run('tk_horsemen', [1, 2]); eq(c.w, c.lvl + 1, 'caballería: nivel + 1');
  const d = run('tk_warriors_ph', [1, 2, 2], (x) => { engage(x.s, x.h, U(x.s, 'orc_boyz', 1)); cur(x.s); }); eq(d.w, 0, 'trabado no puede');
  });
T('rule-settraGreat', RS('settraGreat'), 'Settra el Grande: debe ser el General y el Hierofante; Alcance de mando 18"; Hágase mi voluntad afecta a todas las unidades Nehekharanas a 6"', () => {
  const s = G([{ type: 'tk_settra', models: 1 }, { type: 'tk_warriors_ph', models: 10 }, { type: 'tk_hpriest', models: 1 }], [{ type: 'orc_boyz', models: 10 }], ['tk', 'orcs']); const st = U(s, 'tk_settra', 0); cur(s); R.hieroInit(s); eq(R.commandRange(st), 18, 'alcance de mando 18"'); eq(s.hiero[0], st.id, 'es el Hierofante aunque haya un Sacerdote de mayor nivel');
  const x = G([{ type: 'tk_settra', models: 1 }, { type: 'tk_warriors_ph', models: 10 }, { type: 'tk_horsemen', models: 5 }], [{ type: 'orc_boyz', models: 10 }], ['tk', 'orcs']); const st2 = U(x, 'tk_settra', 0), w = U(x, 'tk_warriors_ph', 0), hm = U(x, 'tk_horsemen', 0); put(st2, 36, 40); put(w, 36, 44); join(x, st2, w); put(hm, 36, 50); cur(x); dice(1, 2); diceAll(1); const o = strategy(x, { mwk: 'mwWS', mw: 'y' }); ok((by(o.s, hm).fx || []).some((f) => f.k === 'mwWS'), 'afecta a las otras unidades Nehekharanas a 6"'); 
});
T('rule-crownNeh', RS('crownNeh'), 'Corona de Nehekhara: las unidades amigas No muertas a 6" de Settra reciben también la curación de Hágase mi voluntad', () => {
  const x = G([{ type: 'tk_settra', models: 1 }, { type: 'tk_warriors_ph', models: 10 }, { type: 'tk_horsemen', models: 5 }], [{ type: 'orc_boyz', models: 10 }], ['tk', 'orcs']); const st = U(x, 'tk_settra', 0), w = U(x, 'tk_warriors_ph', 0), hm = U(x, 'tk_horsemen', 0); put(st, 36, 40); put(w, 36, 44); join(x, st, w); put(hm, 36, 50); cur(x); dice(1, 2); diceAll(1);
  const a = strategy(x, { mwk: 'mwM', mw: 'y' }); ok((by(a.s, hm).fx || []).some((f) => f.k === 'mwM'), 'la Corona extiende el efecto a la unidad No muerta a 6"');
});
T('rule-indom3', RS('indom3'), 'Indómito (3): reduce en 3 las Heridas perdidas por Inestable', () => {
  const run = (who) => { const { s, w, l } = pair('tk_warriors_ph', { models: 10 }, 'state_troops', { models: 40, std: true, mus: true }, { charge: false, extra0: who ? [{ type: who, models: 1 }] : [] }); if (who) { const c = U(s, who, 0); put(c, w.x, w.y); join(s, c, w); } charged(s, l, w); cur(s); diceAll(1); const ev = fight(s); const m = msgs(ev); const x = /Inestable: pierde (\d+) Heridas/.exec(m); return x ? +x[1] : -1; };
  const a = run(null), b = run('tk_settra'), c = run('tk_hpriest'); ok(a > 3, 'sin personajes pierde ' + a + ' Heridas'); eq(b, a - 3, 'con Settra (Indómito 3) pierde 3 menos'); eq(c, a - 1, 'control: el Sacerdote (Indómito 1) pierde 1 menos');
});
