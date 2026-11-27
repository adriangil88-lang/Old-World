// v838 — Reglas de la subfase de Mando (inicio de turno): beginStrategy con dados fijados
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, strategy, asked, msg, asks } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const G = (A, B, f, o = {}) => game(A, B, { f, phase: 'strategy', active: 0, ...o });
const M = (o) => msgs(o.r);
T('rule-rally', RS('rally'), 'Grito de reagrupamiento: en Mando, sin estar trabado, nomina una unidad amiga en huida dentro de su alcance de mando: chequeo de Reagrupamiento inmediato (acción «rallycry»)', () => {
  const mk = (d, dist = 6) => { const s = G([{ type: 'empire_general', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], ['empire', 'orcs']); const g = U(s, 'empire_general', 0), t = U(s, 'state_troops', 0); put(g, 36, 40); put(t, 36, 40 - dist - 2, Math.PI / 2); t.fleeing = true; cur(s); dice(d); diceAll(1); return { s, g, t }; };
  const a = mk([1, 1]); const r = R.apply(a.s, { t: 'rallycry', id: a.g.id, target: a.t.id }); ok(r.ok && /Grito de reagrupamiento/.test(msgs(r.events)), msgs(r.events || [])); ok(by(a.s, a.t).fleeing === false, 'con un Reagrupamiento superado la unidad se reagrupa');
  const f = mk([6, 6], 6); const r2 = R.apply(f.s, { t: 'rallycry', id: f.g.id, target: f.t.id }); ok(r2.ok && by(f.s, f.t).fleeing === true, 'si falla el chequeo sigue huyendo (podrá reintentar en la subfase de Reagrupamiento)'); ok(!R.apply(f.s, { t: 'rallycry', id: f.g.id, target: f.t.id }).ok, 'una vez por turno');
  const far = mk([1, 1], 40); ok(!R.apply(far.s, { t: 'rallycry', id: far.g.id, target: far.t.id }).ok, 'fuera del alcance de mando no se puede nominar');
  const eng = mk([1, 1]); const foe = U(eng.s, 'orc_boyz', 1); engage(eng.s, eng.g, foe); cur(eng.s); ok(!R.apply(eng.s, { t: 'rallycry', id: eng.g.id, target: eng.t.id }).ok, 'trabado no puede');
});
T('rule-cloakIsha', RS('cloakIsha'), 'Capa de Isha: salvación especial 5+; al inicio de cada turno propio, con 5+ recupera una Herida', () => {
  const run = (v) => { const s = G([{ type: 'we_orion', models: 1 }], [{ type: 'orc_boyz', models: 10 }], ['wood', 'orcs']); const u = U(s, 'we_orion', 0); u.wounds = D(u).W - 1; diceAll(v); return { u, o: strategy(s) }; };
  const a = run(5); const b = run(4); eq(by(a.o.s, a.u).wounds, D(a.u).W, 'con 5 recupera una Herida'); eq(by(b.o.s, b.u).wounds, D(b.u).W - 1, 'con 4 no');
  const s = G([{ type: 'we_orion', models: 1 }], [{ type: 'orc_boyz', models: 10 }], ['wood', 'orcs']); const u = U(s, 'we_orion', 0); cur(s); diceAll(4); const r = R.woundAndSave(s, u, 4, 10, 5, { noArmour: true, noRegen: true }); ok(r.through < 4, 'tiene salvación especial 5+: con un 5 salva'); diceAll(5); ok(R.woundAndSave(s, u, 4, 10, 5, { noArmour: true, noRegen: true }).through === 0, 'con 5 salva todas');
});
T('rule-stoneShaper', RS('stoneShaper'), 'Escultor de piedra: en Mando, sin estar trabado, un Coloso Necrolito, Necroesfinge o unidad de Ushabti en su alcance de mando mejora en 1 su Regeneración hasta el final del turno', () => {
  const mk = (type) => { const s = G([{ type: 'tk_archnecro', models: 1 }, { type, models: type === 'tk_ushabti' ? 2 : 1 }], [{ type: 'orc_boyz', models: 10 }], ['tk', 'orcs']); put(U(s, 'tk_archnecro', 0), 36, 40); put(U(s, type, 0), 36, 34); return { s, t: U(s, type, 0) }; };
  const a = mk('tk_ushabti'); const o = strategy(a.s, { 'Escultor de piedra': a.t.id }); ok(asked(o, 'Escultor de piedra'), 'se pregunta el objetivo'); ok(by(o.s, a.t).fx.some((f) => f.k === 'ssReg'), 'efecto de Regeneración mejorada'); ok(/Escultor de piedra/.test(M(o)), M(o).slice(0, 200));
  const b = mk('tk_warriors'); ok(!asked(strategy(b.s), 'Escultor de piedra'), 'solo constructos');
});
T('rule-myWill', RS('myWill'), 'Hágase mi voluntad: en Mando chequeo de Ld propio; si lo supera, el jugador elige +D3 Movimiento, +1 HA o +D3 Iniciativa para él, su montura y su unidad hasta tu siguiente Inicio de turno', () => {
  const mk = (d) => { const s = G([{ type: 'tk_king', models: 1 }, { type: 'tk_warriors', models: 20 }], [{ type: 'orc_boyz', models: 10 }], ['tk', 'orcs']); const k = U(s, 'tk_king', 0), w = U(s, 'tk_warriors', 0); join(s, k, w); put(w, 36, 40); dice(d); diceAll(2); return { s, k, w }; };
  const a = mk([1, 2]); const o = strategy(a.s, { 'Hágase mi voluntad': 'y' }); ok(asked(o, 'Hágase mi voluntad'), 'se pregunta'); ok(by(o.s, a.w).fx.some((f) => f.mw) || all(o.s).find((q) => q.id === a.k.id).fx.some((f) => f.mw), 'efecto aplicado a la unidad / personaje: ' + M(o).slice(0, 200));
  const b = mk([6, 5]); ok(!by(b.s, b.w).fx.some((f) => f.mw) && !(() => { const o2 = strategy(b.s, { 'Hágase mi voluntad': 'y' }); return by(o2.s, b.w).fx.some((f) => f.mw); })(), 'si falla el chequeo de Ld, nada');
});
T('rule-indisHunger', RS('indisHunger'), 'Hambre indiscriminada: en Mando, trabada: una unidad enemiga trabada hace un chequeo de Iniciativa; si falla pierde 1 Herida y la Bruja recupera 1', () => {
  const mk = (v) => { const { s, w: u, l: e } = pair('troll_hag', {}, 'state_troops', { models: 10 }, { charge: false }); s.phase = 'strategy'; s.active = 0; u.wounds = D(u).W - 1; diceAll(v); return { s, u, e }; };
  const a = mk(6); const oa = strategy(a.s); const b = mk(1); const ob = strategy(b.s); ok(/pierde 1 Herida; .* recupera 1/.test(M(oa)), M(oa).slice(0, 300)); eq(by(oa.s, a.u).wounds, D(a.u).W, 'la Bruja recupera 1 Herida'); ok(/supera el chequeo de Iniciativa/.test(M(ob)), 'con un 1 el enemigo supera'); eq(by(ob.s, b.u).wounds, D(b.u).W - 1, 'sin cambios');
});
T('rule-galrSpirit', RS('galrSpirit'), 'Espíritu de Galrauch: al inicio de tu turno, chequeo de Liderazgo; si lo falla su espíritu se rebela (Nivel 1, un hechizo, Movimiento aleatorio, ataca a sí mismo)', () => {
  const mk = (d) => { const s = G([{ type: 'woc_galrauch', models: 1 }], [{ type: 'orc_boyz', models: 10 }], ['woc', 'orcs']); dice(d); diceAll(1); return { s, u: U(s, 'woc_galrauch', 0) }; };
  const a = mk([6, 5]); a.u.ldm = 10; const oa = strategy(a.s); const b = mk([1, 2]); const ob = strategy(b.s); eq(by(oa.s, a.u).galrReb, true, 'falla el Ld: se rebela'); ok(/se rebela/.test(M(oa)), M(oa).slice(0, 200)); eq(by(ob.s, b.u).galrReb, false, 'supera: domina');
});
T('rule-cagedFury', RS('cagedFury'), 'Furia enjaulada: al inicio de tu turno chequeo de Liderazgo; si falla, tabla: 1 estalla (D6 impactos F5 FP−1 a 3D6" y se retira), 2-4 pierde un Sirviente, 5-6 se mueve 3D6"', () => {
  const mk = (d, near = true) => { const s = G([{ type: 'woc_hellcannon', models: 1 }], [{ type: 'orc_boyz', models: 10 }], ['woc', 'orcs']); const h = U(s, 'woc_hellcannon', 0), e = U(s, 'orc_boyz', 1); put(h, 36, 30); put(e, 36, near ? 24 : 4, Math.PI / 2); dice(d); diceAll(2); return { s, h, e }; };
  const ok0 = strategy(mk([1, 2]).s); ok(!/Furia|Liberado|Ñam|Sangre/.test(M(ok0)), 'supera el Ld: nada'); const a = mk([6, 5, 1, 2, 2, 2, 3, 3]); const oa = strategy(a.s); ok(/Liberado al fin/.test(M(oa)), M(oa).slice(0, 300)); ok(!by(oa.s, a.h) || by(oa.s, a.h).models <= 0, 'estalla y se retira');
  const b = mk([6, 5, 3]); const ob = strategy(b.s); ok(/pierde un Sirviente/.test(M(ob)), M(ob).slice(0, 200)); const c = mk([6, 5, 6]); const oc = strategy(c.s); eq(by(oc.s, c.h).cagedMove, true, '5-6: movimiento de 3D6"');
});
