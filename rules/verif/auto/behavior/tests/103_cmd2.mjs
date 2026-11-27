// v838 — Reglas de Mando y hechizos (lote 4): Caldero, ¡Atrincheraos!, Borrachos, Cuerno, Skaryn, Plegarias, La Sed, Hekarti, Lileath, Furia primigenia
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, strategy, asked, msg, asks, caster, fight } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const G = (A, B, f, o = {}) => game(A, B, { f, phase: 'strategy', active: 0, ...o });
T('rule-cauldron', RS('cauldron'), 'Caldero de Carnicero: en Mando, sin trabar, chequeo de Liderazgo; si lo supera, el personaje y su unidad ganan Regeneración (5+) hasta tu siguiente turno; si falla, pierde 1 Herida', () => {
  const mk = (d) => { const s = G([{ type: 'ok_butcher', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], ['ogres', 'empire']); const b = U(s, 'ok_butcher_cauldron', 0) || U(s, 'ok_butcher', 0); return { s, b }; };
  const s = G([{ type: 'ok_butcher_cauldron', models: 1 }, { type: 'ok_bulls', models: 4 }], [{ type: 'state_troops', models: 10 }], ['ogres', 'empire']); const c = U(s, 'ok_butcher_cauldron', 0), h = U(s, 'ok_bulls', 0); put(c, 36, 40); put(h, 36, 44); join(s, c, h); cur(s); dice(1, 2); const r = R.apply(s, { t: 'cauldron', id: c.id }); ok(r.ok && /Regeneración/.test(msgs(r.events)), msgs(r.events || []));
  ok((by(s, c).fx || []).some((f) => f.k === 'regen' && f.v === 5) && (by(s, h).fx || []).some((f) => f.k === 'regen' && f.v === 5), 'el personaje y su unidad ganan Regeneración (5+)'); ok(!R.apply(s, { t: 'cauldron', id: c.id }).ok, 'solo una vez por turno');
  const s2 = G([{ type: 'ok_butcher_cauldron', models: 1 }, { type: 'ok_bulls', models: 4 }], [{ type: 'state_troops', models: 10 }], ['ogres', 'empire']); const c2 = U(s2, 'ok_butcher_cauldron', 0), h2 = U(s2, 'ok_bulls', 0); put(c2, 36, 40); put(h2, 36, 44); join(s2, c2, h2); cur(s2); dice(6, 5); R.apply(s2, { t: 'cauldron', id: c2.id }); eq(by(s2, c2).wounds, D(c2).W - 1, 'si falla el chequeo pierde 1 Herida'); ok(!(by(s2, h2).fx || []).some((f) => f.k === 'regen'), 'y no hay Regeneración');
  const s3 = G([{ type: 'ok_butcher_cauldron', models: 1 }, { type: 'ok_bulls', models: 4 }], [{ type: 'state_troops', models: 10 }], ['ogres', 'empire']); const c3 = U(s3, 'ok_butcher_cauldron', 0), h3 = U(s3, 'ok_bulls', 0); put(c3, 36, 40); put(h3, 36, 44); join(s3, c3, h3); engage(s3, h3, U(s3, 'state_troops', 1)); cur(s3); ok(!R.apply(s3, { t: 'cauldron', id: c3.id }).ok, 'trabado no puede');
});
T('rule-digIn', RS('digIn'), '¡Atrincheraos!: en Mando, sin trabar, chequeo de Liderazgo propio; si lo supera, él y su unidad quedan Atrincherados', () => {
  const mk = () => { const s = G([{ type: 'dw_sapper', models: 1 }, { type: 'dw_warriors', models: 10 }], [{ type: 'orc_boyz', models: 10 }], ['dwarfs', 'orcs']); const c = U(s, 'dw_sapper', 0), h = U(s, 'dw_warriors', 0); put(c, 36, 40); put(h, 36, 44); join(s, c, h); cur(s); return { s, c, h }; };
  const a = mk(); dice(1, 2); const r = R.apply(a.s, { t: 'digin', id: a.c.id }); ok(r.ok && by(a.s, a.h).entrenched === true, 'si supera el chequeo la unidad queda Atrincherada: ' + msgs(r.events || [])); ok(!R.apply(a.s, { t: 'digin', id: a.c.id }).ok, 'una vez por turno / ya atrincherada');
  const b = mk(); dice(6, 5); R.apply(b.s, { t: 'digin', id: b.c.id }); ok(!by(b.s, b.h).entrenched, 'si falla no queda Atrincherada');
  const c = mk(); engage(c.s, c.h, U(c.s, 'orc_boyz', 1)); cur(c.s); ok(!R.apply(c.s, { t: 'digin', id: c.c.id }).ok, 'trabado no puede');
});
T('rule-drunken', RS('drunken'), 'Borrachos: al inicio de cada turno (sin Frenesí, sin trabarse ni huir) 1D6: 1 Movimiento aleatorio D6+2 sin marchar; 2-5 nada; 6 Frenesí hasta tu próximo turno', () => {
  const run = (v, mod) => { const s = G([{ type: 'bm_centigors', models: 5 }], [{ type: 'empire_general', models: 1 }, { type: 'state_troops', models: 10 }], ['beasts', 'empire']); const u = U(s, 'bm_centigors', 0); put(u, 36, 40); if (mod) mod(u, s); diceAll(v); return { u, o: strategy(s) }; };
  const a = run(1), b = run(3), c = run(6);
  ok(by(a.o.s, a.u).fx.some((f) => f.k === 'randMove'), 'con 1: Movimiento aleatorio'); ok(!(by(b.o.s, b.u).fx || []).some((f) => ['randMove', 'drunkFrenzy'].includes(f.k)), 'con 3: nada'); ok(by(c.o.s, c.u).fx.some((f) => f.k === 'drunkFrenzy'), 'con 6: Frenesí');
  const f = run(1, (u) => { u.fleeing = true; }); ok(!(by(f.o.s, f.u).fx || []).some((x) => x.k === 'randMove'), 'huyendo no tira');
  const e = run(1, (u, s) => { engage(s, u, U(s, 'state_troops', 1)); }); ok(!(by(e.o.s, e.u).fx || []).some((x) => x.k === 'randMove'), 'trabada no tira');
});
T('rule-fatherBeasts', RS('fatherBeasts'), 'Padre de Bestias: los Centigors amigos en su alcance de mando pueden repetir el D6 de la tabla de Borrachos (se pregunta)', () => {
  const mk = (near) => { const s = G([{ type: 'bm_ghorros', models: 1 }, { type: 'bm_centigors', models: 5 }], [{ type: 'empire_general', models: 1 }, { type: 'state_troops', models: 10 }], ['beasts', 'empire']); const g = U(s, 'bm_ghorros', 0), c = U(s, 'bm_centigors', 0); put(g, 36, 40); put(c, 36, near ? 46 : 70); cur(s); dice(1, 6); diceAll(3); return { s, g, c }; };
  const a = mk(true); const oa = strategy(a.s, { 'Padre de Bestias': 'y' }); ok(asked(oa, 'Padre de Bestias'), 'se pregunta si repite'); ok(by(oa.s, a.c).fx.some((f) => f.k === 'drunkFrenzy'), 'repite el 1 y obtiene 6: Frenesí');
  const b = mk(false); const ob = strategy(b.s); ok(!asked(ob, 'Padre de Bestias'), 'fuera de su alcance de mando no hay repetición');
});
T('rule-hornHunt', RS('hornHunt'), 'Cuerno de la Cacería Salvaje: una vez por partida, en Mando, las unidades amigas en su alcance de mando ganan Frenesí hasta el final del turno', () => {
  const s = G([{ type: 'we_orion', models: 1 }, { type: 'we_glade_guard', models: 10 }], [{ type: 'orc_boyz', models: 10 }], ['wood', 'orcs']); const o = U(s, 'we_orion', 0), g = U(s, 'we_glade_guard', 0); put(o, 36, 40); put(g, 36, 44); const far = U(s, 'orc_boyz', 1); cur(s);
  const r = R.apply(s, { t: 'horn', id: o.id }); ok(r.ok && by(s, g).fx.some((f) => f.k === 'hornF'), 'las unidades en el alcance de mando ganan Frenesí: ' + msgs(r.events || [])); ok(!R.apply(s, { t: 'horn', id: o.id }).ok, 'una vez por partida');
  const s2 = G([{ type: 'we_orion', models: 1 }, { type: 'we_glade_guard', models: 10 }], [{ type: 'orc_boyz', models: 10 }], ['wood', 'orcs']); const o2 = U(s2, 'we_orion', 0), g2 = U(s2, 'we_glade_guard', 0); put(o2, 36, 40); put(g2, 36, 10); cur(s2); R.apply(s2, { t: 'horn', id: o2.id }); ok(!by(s2, g2).fx?.some((f) => f.k === 'hornF'), 'fuera de su alcance de mando no');
});
T('rule-skaryn', RS('skaryn'), 'Skaryn: en cada Mando, con 3+: un modelo enemigo a 18" sufre un impacto de F4, FP −1; si sufre una herida pierde D3 de HA e Iniciativa el resto de la partida', () => {
  const mk = () => { const s = G([{ type: 'we_araloth', models: 1 }], [{ type: 'empire_general', models: 1 }, { type: 'state_troops', models: 10 }], ['wood', 'empire']); const a = U(s, 'we_araloth', 0), t = U(s, 'state_troops', 1); put(a, 36, 40); put(t, 36, 26, Math.PI / 2); cur(s); return { s, a, t }; };
  const a = mk(); dice(2); const r = R.apply(a.s, { t: 'skaryn', id: a.a.id, target: a.t.id }); ok(r.ok && /no llega/.test(msgs(r.events)), 'con 2 no llega'); 
  const b = mk(); dice(4); dice(4, 6, 1); diceAll(1); const m0 = by(b.s, b.t).models; R.apply(b.s, { t: 'skaryn', id: b.a.id, target: b.t.id }); eq(by(b.s, b.t).models, m0 - 1, 'con 4+ y herida sin salvar cae un modelo'); ok(by(b.s, b.t).fx.some((f) => f.k === 'skaryn' && f.v >= 1 && f.v <= 3 && f.perm), 'pierde D3 de HA e Iniciativa el resto de la partida');
  ok(!R.apply(b.s, { t: 'skaryn', id: b.a.id, target: b.t.id }).ok, 'una vez por Mando');
  const c = mk(); put(by(c.s, c.t), 36, 5); ok(!R.apply(c.s, { t: 'skaryn', id: c.a.id, target: c.t.id }).ok, 'a más de 18" no puede');
  const d = mk(); dice(4, 6, 6); diceAll(6); R.apply(d.s, { t: 'skaryn', id: d.a.id, target: d.t.id }); ok(!(by(d.s, d.t).fx || []).some((f) => f.k === 'skaryn'), 'si se salva no pierde HA ni I');
});
T('rule-prayerSigmar', RS('prayerSigmar'), 'Plegarias de Sigmar: en Mando, chequeo de Liderazgo; Martillo (repetir 1 al impactar/herir), Escudo de la Fe (especial 5+ en Disparo) o Fuego del Alma (D6 impactos F3 FP −2 flamígeros y mágicos a una unidad trabada); se elige en el momento', () => {
  const mk = () => { const s = G([{ type: 'emp_lector', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], ['empire', 'orcs']); const l = U(s, 'emp_lector', 0), h = U(s, 'state_troops', 0); put(l, 36, 40); put(h, 36, 44); join(s, l, h); cur(s); return { s, l, h }; };
  const a = mk(); diceAll(1); const oa = strategy(a.s, { 'Plegarias': 'hammerS' }); ok(asked(oa, 'Plegarias de Sigmar'), 'se pregunta la plegaria'); ok(by(oa.s, a.h).fx.some((f) => f.k === 'hammerS'), 'Martillo de Sigmar: la unidad lo recibe');
  const b = mk(); diceAll(1); const ob = strategy(b.s, { 'Plegarias': 'shieldFaith' }); ok(by(ob.s, b.h).fx.some((f) => f.k === 'shieldFaith'), 'Escudo de la Fe');
  const c = mk(); diceAll(6); const oc = strategy(c.s, { 'Plegarias': 'hammerS' }); ok(!(by(oc.s, c.h).fx || []).some((f) => f.k === 'hammerS'), 'si falla el chequeo de Liderazgo no se obtiene');
  const d = mk(); diceAll(1); const oD = strategy(d.s, { 'Plegarias': 'none' }); ok(!(by(oD.s, d.h).fx || []).some((f) => f.k === 'hammerS'), 'No rezar');
  const e = mk(); const foe = U(e.s, 'orc_boyz', 1); engage(e.s, by(e.s, e.h), foe); cur(e.s); dice(1, 1); diceAll(6); const oe = strategy(e.s, { 'Plegarias': 'soul' }); ok(by(oe.s, foe).models < foe.models, 'Fuego del Alma: la unidad trabada sufre impactos'); 
});
T('rule-prayerUlric', RS('prayerUlric'), 'Plegarias de Ulric: en Mando, chequeo de Liderazgo; Aullido de batalla (+D3 a la carga), Frío Invernal (los enemigos repiten los 6 al impactar), Ira del Invierno (Heridas múltiples (2))', () => {
  const mk = () => { const s = G([{ type: 'emp_ulric', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], ['empire', 'orcs']); const l = U(s, 'emp_ulric', 0), h = U(s, 'state_troops', 0); put(l, 36, 40); put(h, 36, 44); join(s, l, h); cur(s); return { s, l, h }; };
  const a = mk(); diceAll(1); const oa = strategy(a.s, { 'Plegarias': 'chill' }); ok(asked(oa, 'Plegarias de Ulric'), 'se pregunta'); ok(by(oa.s, a.h).fx.some((f) => f.k === 'chill'), 'Frío Invernal sobre la unidad');
  const b = mk(); diceAll(1); const ob = strategy(b.s, { 'Plegarias': 'wrathW' }); ok(by(ob.s, b.h).fx.some((f) => f.k === 'wrathW'), 'Ira del Invierno'); 
  const c = mk(); diceAll(6); const oc = strategy(c.s, { 'Plegarias': 'chill' }); ok(!(by(oc.s, c.h).fx || []).some((f) => f.k === 'chill'), 'si falla el chequeo, nada');
});
T('rule-hunger', RS('hunger'), 'La Sed: al final de la fase de Combate en la que inflija heridas sin salvar, con 6 en un D6 recupera 1 Herida', () => {
  // el D6 de La Sed es la última tirada de la fase: se mide cuántas tiradas hay y se fuerza un 6 solo en la última
  const run = (last, strip) => { const f = () => { const { s, w } = pair('vc_ghoulking', { models: 1 }, 'state_troops', { models: 10 }); w.wounds = D(w).W - 2; let n = 0; diceAll(() => { n++; return last && n === last ? 6 : 4; }); fight(s); return { n, wd: by(s, w).wounds }; }; return strip ? withoutSr('vc_ghoulking', 'hunger', f) : f(); };
  const a = run(0), b = run(a.n), c = run(a.n, true);
  eq(b.wd, a.wd + 1, 'con 6 en el D6 de La Sed recupera 1 Herida'); eq(a.wd, c.wd, 'sin 6 (o sin la regla) no recupera'); ok(a.n === c.n + 1, 'La Sed añade una sola tirada de D6');
});
T('rule-hekarti', RS('hekarti'), 'Bendición de Hekarti: una vez por partida repite una tirada de lanzamiento fallida (se pregunta en el momento)', () => {
  const mk = () => caster('de_sorceress', 'state_troops');
  const a = mk(); dice(1, 2, 6, 5, 3, 3, 3); diceAll(1); const oa = asks(a.s, (c) => R.apply(c, { t: 'cast', id: U(c, 'de_sorceress', 0).id, spell: 'fireball', target: U(c, 'state_troops', 1).id }), [0, 1], (n) => (n.title === 'Bendición de Hekarti' ? 'y' : undefined));
  ok(oa.needs.some((n) => n.title === 'Bendición de Hekarti'), 'tras fallar se pregunta si repite'); ok(/Bendición de Hekarti/.test(msgs(oa.r.events || [])) && !/no logra/.test(msgs(oa.r.events || [])), 'repite y supera: ' + msgs(oa.r.events || []).slice(0, 200)); ok(by(oa.s, U(oa.s, 'de_sorceress', 0)).hekDone === true, 'queda gastada para la partida');
  const b = mk(); dice(1, 2); diceAll(1); const ob = asks(b.s, (c) => R.apply(c, { t: 'cast', id: U(c, 'de_sorceress', 0).id, spell: 'fireball', target: U(c, 'state_troops', 1).id }), [0, 1], (n) => (n.title === 'Bendición de Hekarti' ? 'n' : undefined)); ok(/no logra/.test(msgs(ob.r.events || [])), 'si no repite el lanzamiento falla');
  const c = mk(); c.w.hekDone = true; dice(1, 2); diceAll(1); const oc = asks(c.s, (cc) => R.apply(cc, { t: 'cast', id: U(cc, 'de_sorceress', 0).id, spell: 'fireball', target: U(cc, 'state_troops', 1).id }), [0, 1]); ok(!oc.needs.some((n) => n.title === 'Bendición de Hekarti'), 'una sola vez por partida');
});
T('rule-lileath', RS('lileath'), 'Bendición de Lileath: una vez por turno puede repetir una tirada de lanzamiento fallida (se pregunta)', () => {
  const mk = () => caster('he_archmage_star', 'state_troops');
  const a = mk(); dice(1, 2, 6, 5, 3, 3, 3); diceAll(1); const oa = asks(a.s, (c) => R.apply(c, { t: 'cast', id: U(c, 'he_archmage_star', 0).id, spell: 'fireball', target: U(c, 'state_troops', 1).id }), [0, 1], (n) => (n.title === 'Bendición de Lileath' ? 'y' : undefined));
  ok(oa.needs.some((n) => n.title === 'Bendición de Lileath'), 'se pregunta tras fallar'); ok(/Bendición de Lileath/.test(msgs(oa.r.events || [])), 'repite el lanzamiento: ' + msgs(oa.r.events || []).slice(0, 200)); ok(by(oa.s, U(oa.s, 'he_archmage_star', 0)).lilK, 'una vez por turno');
  const b = mk(); b.w.lilK = b.s.turn + ':' + b.s.active; dice(1, 2); diceAll(1); const ob = asks(b.s, (c) => R.apply(c, { t: 'cast', id: U(c, 'he_archmage_star', 0).id, spell: 'fireball', target: U(c, 'state_troops', 1).id }), [0, 1]); ok(!ob.needs.some((n) => n.title === 'Bendición de Lileath'), 'ya usada este turno: no se ofrece');
});
T('rule-primalFury', RS('primalFury'), 'Furia primigenia: al elegir su combate, chequeo de Liderazgo; si lo supera, repite los 1 naturales al impactar hasta el final de la fase de Combate', () => {
  const run = (d, strip) => { const f = () => { const { s, w, l } = pair('bm_wargor', { models: 1 }, 'state_troops', { models: 10 }); cur(s); dice(d); diceAll(3); s.phase = 'combat'; const ev = []; R.resolveCombats(s, ev); return { s, w, m: msgs(ev) }; }; return strip ? withoutSr('bm_wargor', 'primalFury', f) : f(); };
  const a = run([1, 2]); ok(/Furia primigenia/.test(a.m), 'supera el chequeo: ' + a.m.slice(0, 160)); const b = run([6, 5]); ok(!/Furia primigenia \(/.test(b.m), 'si falla el chequeo no se aplica');
  const { s, w } = pair('bm_wargor', { models: 1 }, 'state_troops', { models: 10 }); cur(s); w.pfK = s.turn + ':' + s.active; const p1 = R.attackProfile(w, U(s, 'state_troops', 1)); ok(p1.pf === true, 'con la Furia activa el perfil repite los 1 al impactar'); w.pfK = null; ok(!R.attackProfile(w, U(s, 'state_troops', 1)).pf, 'sin la Furia no los repite');
});
T('rule-bloodRage', RS('bloodRage'), 'Rabia de sangre: si supera el chequeo de Furia primigenia con un doble natural, queda además Frenética (aunque hubiera perdido el Frenesí)', () => {
  const run = (d) => { const { s, w, l } = pair('bm_doombull', { models: 1 }, 'state_troops', { models: 10 }); cur(s); dice(d); diceAll(3); w.frenzyLost = true; s.phase = 'combat'; const ev = []; R.resolveCombats(s, ev); return { s, w, m: msgs(ev) }; };
  const a = run([2, 2]); ok(by(a.s, a.w).brage === true && /Rabia de sangre/.test(a.m), 'con doble natural: ' + a.m.slice(0, 200)); const b = run([1, 2]); ok(!by(b.s, b.w).brage, 'sin doble: no hay Rabia de sangre');
});
