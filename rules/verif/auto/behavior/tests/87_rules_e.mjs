// v837 — Reglas especiales sin prueba propia (lote E): habilidades de la fase de Mando (beginStrategy)
import { T, N, R, DATA, GEOM, game, U, ok, eq, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, join, blows } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const RS = (k) => `app/js/data.js (regla «${k}»)`;
// Capitán (Ld 9) con la regla, solo, frente a 10 Orcos a `dist`; ejecuta la fase de Mando del jugador 0 con los dados dados (pasa: [1,1] / falla: [6,6])
const cmd = (rule, pass, o = {}) => withSr('empire_captain', [rule], () => { const s = game([{ type: 'empire_captain', models: 1 }, ...(o.extra || [])], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy', active: 0, turn: 2 }); const c = put(U(s, 'empire_captain', 0), 36, 40), e = put(U(s, 'orc_boyz', 1), 36, o.dist ?? 20, Math.PI / 2); o.pre?.(s, c, e); cur(s); if (o.q) dice(o.q); diceAll(pass ? 1 : 6); const ev = []; const q = asks(s, (x) => { const e2 = []; R.beginStrategy(x, e2); return e2; }, [0], o.pick); return { s: q.s, c: U(q.s, 'empire_captain', 0), e: U(q.s, 'orc_boyz', 1), m: msgs(q.r), needs: q.needs }; });
T('rule-prayerDamned', RS('prayerDamned'), 'Plegaria de los Condenados: Fase de Mando, chequeo de Liderazgo; si lo pasa, él y su unidad tienen Salvación especial 6+', () => {
  const a = cmd('prayerDamned', true), b = cmd('prayerDamned', false); ok(a.c.fx.some((f) => f.k === 'prayerD'), 'al pasar el chequeo: Salvación especial 6+: ' + a.m); ok(!b.c.fx.some((f) => f.k === 'prayerD'), 'al fallarlo no');
  cur(a.s); diceAll(6); eq(R.woundAndSave(a.s, a.c, 4, 4, 0, { noArmour: true }).through, 0, 'con 6 en el dado, la Salvación 6+ salva todas'); cur(b.s); diceAll(5); ok(R.woundAndSave(b.s, b.c, 4, 4, 0, { noArmour: true }).through > 0, 'sin plegaria, un 5 no salva');
});
T('rule-taskmaster', RS('taskmaster'), 'Capataz eterno: en la fase de Mando, con un chequeo de Liderazgo, él y su unidad ganan +1 Ataque y Odio hasta tu próximo turno', () => {
  const a = cmd('taskmaster', true), b = cmd('taskmaster', false); ok(/Capataz eterno/.test(a.m) && a.c.fx.some((f) => f.k === 'taskK') && !b.c.fx.some((f) => f.k === 'taskK'), 'efecto solo al superar el chequeo');
  const pa = (x) => { cur(x.s); return R.attackProfile(x.c, x.e); }; const A = pa(a), B = pa(b); eq(A.atk, B.atk + 1, '+1 Ataque'); ok(A.hatred && !B.hatred, 'Odio');
});
T('rule-overseer', RS('overseer'), 'Capataz inmortal (Gran Nigromante/Necrotecto): chequeo de Ld en Mando; si lo supera, una unidad amiga en su alcance gana +D3 Iniciativa (máx. 10)', () => {
  const ext = [{ type: 'state_troops', models: 10 }], pre = (s) => { put(U(s, 'state_troops', 0), 36, 36); }; const a = cmd('overseer', true, { extra: ext, pre, q: [2], pick: (n) => n.opts.find((x) => x[0] !== 'none')?.[0] }), b = cmd('overseer', false, { extra: ext, pre });
  const f = a.s.units.flatMap((u) => u.fx || []).find((x) => x.k === 'ovI'); ok(f && f.v >= 1 && f.v <= 3, '+D3 Iniciativa: ' + a.m); ok(!b.s.units.flatMap((u) => u.fx || []).some((x) => x.k === 'ovI'), 'si falla el chequeo no hay efecto');
  const t = U(a.s, 'state_troops', 0); cur(a.s); const base = R.effI(t, []) - f.v; ok(R.effI(t, []) >= base + f.v - 0 && R.effI(t, []) <= 10, 'su Iniciativa efectiva sube (máx. 10)');
});
T('rule-madAura', RS('madAura'), 'Aura enloquecedora: en tu Mando cada unidad enemiga a 8" chequea Liderazgo; si falla sufre D3 impactos F3 sin armadura ni Regeneración', () => {
  const a = cmd('madAura', false, { dist: 32 }), far = cmd('madAura', false, { dist: 20 }), pass = cmd('madAura', true, { dist: 32 });
  ok(/Aura enloquecedora/.test(a.m), 'la unidad enemiga a 8" que falla el Ld sufre impactos: ' + a.m); ok(a.e.models < 10, 'pierde modelos'); ok(!/Aura enloquecedora/.test(far.m), 'a más de 8" no se ve afectada'); ok(!/Aura enloquecedora/.test(pass.m) && pass.e.models === 10, 'si supera el chequeo, nada');
});
T('rule-wilful', RS('wilful'), 'Bestia obstinada: al inicio de cada turno chequea Liderazgo (sin modificar); si falla, la montura está sujeta a Frenesí hasta tu próximo turno', () => {
  const a = cmd('wilful', false), b = cmd('wilful', true); ok(a.c.fx.some((f) => f.k === 'drunkFrenzy'), 'al fallar el Ld la montura se descontrola (Frenesí): ' + a.m); ok(!b.c.fx.some((f) => f.k === 'drunkFrenzy'), 'al superarlo no');
});
T('rule-arkSotek', RS('arkSotek'), 'Arca de Sotek: Fase de Mando: cada unidad enemiga a D6" o menos sufre 2D6 impactos de F2', () => {
  const a = cmd('arkSotek', true, { dist: 34, q: [6, 3, 3, 1] }), far = cmd('arkSotek', true, { dist: 20, q: [6, 3, 3, 1] }); ok(/Serpientes reptantes: .* sufre 6 impactos F2/.test(a.m), '6" alcanza (D6 = 6) y 2D6 = 3+3 = 6 impactos F2: ' + a.m); ok(!/Serpientes reptantes/.test(far.m), 'fuera de D6" no');
});
