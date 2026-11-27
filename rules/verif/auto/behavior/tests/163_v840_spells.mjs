// v840 — Los 8 hechizos compuestos (antes «no automatizables» por el filtro genérico de v836): cada rama del texto y cada caso límite, ejecutando el motor con dados fijados.
// Convención de la cola de dados de `cast`: [lanzamiento, lanzamiento, destino/Ld.., ...impactos]; Chamán Orco de Nivel 1 (+1 al lanzar) contra 20 Tropas Estatales a 14".
import { T, R, DATA, GEOM, game, U, ok, eq, dice, diceAll, engage, cur, put, msgs, join, withoutSr, withSr, fight, asks } from '../lib3.mjs';
const { SPELLS, UNITS, ITEMS } = DATA;
const SRC = 'app/js/data.js (SPELLS, texto del hechizo)';
const TS = (key, desc, fn) => T('v840-sp-' + key, SRC, `${SPELLS[key].name}: ${desc}`, fn);
const mkS = (key, o = {}) => { const s = game([{ type: o.wT || 'orc_weirdboy', models: 1, ...(o.wX || {}) }, ...(o.extra || [])], [{ type: 'state_troops', models: 20 }, ...(o.foe || [])], { f: [o.f || 'orcs', 'empire'], phase: o.phase || 'shoot' }); const w = put(U(s, o.wT || 'orc_weirdboy', 0), 36, o.wy ?? 40), t = put(U(s, 'state_troops', 1), 36, o.ty ?? 26, Math.PI / 2); w.spells = [key]; w.casted = []; if (o.pre) o.pre(s, w, t); cur(s); return { s, w, t }; };
const cast = (key, d, o = {}) => { const m = mkS(key, o); globalThis.__WSL = []; dice(d); diceAll(o.all ?? 1); const r = R.apply(m.s, { t: 'cast', id: m.w.id, spell: key, target: (o.tgt ? o.tgt(m) : m.t).id }); return { ...m, r, m: msgs(r.events || []), W: globalThis.__WSL.map((x) => ({ hits: x.hits, S: x.S, ap: x.ap, o: x.o, def: x.def })) }; };
const cast0 = (x) => x.r.ok && !/no logra/.test(x.m) && x.W.length > 0;

// ——— Constelación del Dragón (Yang): 7+ D6+1 F4; 11+ 2D6+2 F4 FP −1 (cathay_aj.txt:2887-2902) ———
TS('yang_constellation', 'umbrales 7 / 10 / 11 / 12, mínimos y máximos de los dados, alcance 18"', () => {
  const sp = SPELLS.yang_constellation; ok(sp.cv === 7 && sp.range === 18 && sp.type === 'missile' && sp.boost.cv === 11, 'montaje');
  const at = (a, b, hit) => cast('yang_constellation', [a, b, 1, 1, ...hit]); // el Chamán suma +1 (nivel 1): total = a+b+1
  ok(!cast0(at(2, 3, [4])), 'total 6 (< 7): no se lanza'); const r7 = at(3, 3, [4]); ok(cast0(r7), 'total 7: se lanza'); eq([r7.W[0].hits, r7.W[0].S, r7.W[0].ap], [5, 4, 0], 'total 7: D6+1 (4+1 = 5) F4 sin FP');
  const r10 = at(4, 5, [4, 6]); eq([r10.W[0].hits, r10.W[0].ap], [5, 0], 'total 10 (< 11): sigue siendo D6+1 y sin FP (no hay segunda rama)'); eq(r10.W.length, 1, 'una sola tirada de heridas');
  const r11 = at(5, 5, [3, 4]); eq([r11.W[0].hits, r11.W[0].S, r11.W[0].ap], [9, 4, 1], 'total 11: 2D6+2 (3+4+2 = 9) F4 FP −1'); const r12 = at(6, 5, [6, 6]); eq([r12.W[0].hits, r12.W[0].ap], [14, 1], 'total 12: 2D6+2 máximo = 14, FP −1');
  eq(cast('yang_constellation', [3, 3, 1, 1, 1]).W[0].hits, 2, 'D6+1 mínimo = 2'); eq(cast('yang_constellation', [3, 3, 1, 1, 6]).W[0].hits, 7, 'D6+1 máximo = 7'); eq(at(5, 5, [1, 1]).W[0].hits, 4, '2D6+2 mínimo = 4');
  ok(r11.W[0].o.magical && r11.W[0].o.missile && !r11.W[0].o.noArmour, 'impactos de proyectil mágico con salvación de armadura (el texto no la anula)');
  // alcance 18": a 18" se puede lanzar, a más no
  const near = mkS('yang_constellation', { ty: 40 - 18 - 1.2 }), far = mkS('yang_constellation', { ty: 40 - 18 - 4 }); const dN = GEOM.unitDist(near.w, near.t), dF = GEOM.unitDist(far.w, far.t);
  ok(dN <= 18 && dF > 18, `montaje: ${dN.toFixed(1)}" / ${dF.toFixed(1)}"`); eq(R.castCheck(near.s, near.w, 'yang_constellation', near.t), null, 'a ≤ 18" se puede lanzar'); ok(R.castCheck(far.s, far.w, 'yang_constellation', far.t), 'a más de 18" no: ' + R.castCheck(far.s, far.w, 'yang_constellation', far.t));
});
// ——— Guerreros Ancestrales (Yin): Asalto 7+ 2D3 F2; 11+ 2D6 F4 FP −1; siempre Perforante (2) ———
TS('yin_ancestral', 'umbrales 7 / 10 / 11, Perforante (2) en ambas ramas, solo contra la unidad enemiga trabada', () => {
  const run = (d, o = {}) => { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'], phase: 'combat' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 30), t = put(U(s, 'state_troops', 1), 36, 27, Math.PI / 2); w.spells = ['yin_ancestral']; w.casted = []; if (!o.free) engage(s, w, t, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); globalThis.__WSL = []; dice(d); diceAll(1); const ev = []; R.autoAssail(s, ev, [w], 4, () => 4); return { m: msgs(ev), W: globalThis.__WSL.map((x) => ({ hits: x.hits, S: x.S, ap: x.ap, ab: x.o.ab, def: x.def })), t }; };
  const a = run([3, 3, 1, 1, 2, 2]); eq([a.W[0].hits, a.W[0].S, a.W[0].ap, a.W[0].ab], [4, 2, 0, 2], 'total 7: 2D3 (2+2) F2 sin FP, Perforante (2): ' + a.m);
  const b = run([4, 5, 1, 1, 3, 3]); eq([b.W[0].hits, b.W[0].S, b.W[0].ap, b.W[0].ab], [6, 2, 0, 2], 'total 10: sigue la rama de 7+ (2D3), Perforante (2)');
  const c = run([5, 5, 1, 1, 3, 4]); eq([c.W[0].hits, c.W[0].S, c.W[0].ap, c.W[0].ab], [7, 4, 1, 2], 'total 11: 2D6 (3+4) F4 FP −1 y también Perforante (2)');
  eq(run([3, 3, 1, 1, 1, 1]).W[0].hits, 2, '2D3 mínimo = 2'); eq(run([3, 3, 1, 1, 3, 3]).W[0].hits, 6, '2D3 máximo = 6'); eq(run([5, 5, 1, 1, 6, 6]).W[0].hits, 12, '2D6 máximo = 12');
  ok(run([2, 3, 1, 1, 2, 2]).W.length === 0, 'total 6 (< 7): no se lanza'); const f = run([3, 3, 1, 1, 2, 2], { free: true }); ok(f.W.length === 0, 'sin estar trabado no hay a quién asaltar: ' + f.m);
  eq([SPELLS.yin_ancestral.type, SPELLS.yin_ancestral.range], ['assail', 0], 'Asalto, alcance Combate');
});
// ——— Maldición de Hashut (leg_chaosdwarfs.txt:858-870) ———
TS('curse_hashut', 'solo personajes enemigos (también unidos o trabados); chequeo de R: superado D3 F2, fallado D3+2 F5 sin armadura ni regeneración (sí salvación especial); R propia del personaje', () => {
  const mk = (ch, foe = 'empire_captain', o = {}) => { const m = mkS('curse_hashut', { foe: [{ type: foe, models: 1 }], pre: (s, w, t) => { const c = U(s, foe, 1); if (ch === 'joined') join(s, c, t); else put(c, 46, 24, Math.PI / 2); if (o.pre) o.pre(s, w, t, c); } }); m.c = U(m.s, foe, 1); return m; };
  const tg = (m) => R.spellTargets(m.s, m.w, 'curse_hashut').map((x) => x.id);
  const alone = mk('alone'); ok(tg(alone).includes(alone.c.id), 'personaje solitario: objetivo'); ok(!tg(alone).includes(alone.t.id), 'unidad sin personajes: no es objetivo');
  const joined = mk('joined'); ok(tg(joined).includes(joined.t.id), 'personaje unido a una unidad: objetivo (se apunta al personaje)');
  const far = mk('alone', 'empire_captain', { pre: (s, w, t, c) => put(c, 36, 12, Math.PI / 2) }); ok(!tg(far).includes(far.c.id), 'a más de 18": fuera de alcance');
  // R propia: el Capitán (R4) unido a tropas de R3: pasa con 4, falla con 5, y con 6 natural siempre falla
  const T4 = UNITS.empire_captain.T, T3 = UNITS.state_troops.T; ok(T4 > T3, 'montaje: R del personaje (' + T4 + ') > R de la tropa (' + T3 + ')');
  const go = (tr, hd, o = {}) => { const m = mk('joined', 'empire_captain', o); globalThis.__WSL = []; dice([6, 6, tr, hd]); diceAll(1); const r = R.apply(m.s, { t: 'cast', id: m.w.id, spell: 'curse_hashut', target: m.t.id }); ok(r.ok, r.error); return { m, msg: msgs(r.events), W: globalThis.__WSL.map((x) => ({ hits: x.hits, S: x.S, ap: x.ap, o: x.o, def: x.def.type })) }; };
  const p1 = go(1, 1); eq([p1.W[0].hits, p1.W[0].S, !!p1.W[0].o.noArmour, !!p1.W[0].o.noRegen], [1, 2, false, false], 'un 1 supera el chequeo: D3 (=1) F2, con armadura y regeneración'); eq(go(1, 3).W[0].hits, 3, 'D3 máximo = 3');
  const pT = go(T4, 2); eq([pT.W[0].hits, pT.W[0].S], [2, 2], 'R = ' + T4 + ' (R del personaje, no de la tropa): superado'); eq(pT.W[0].def, 'empire_captain', 'los impactos van al personaje');
  const fT = go(T4 + 1, 1); eq([fT.W[0].hits, fT.W[0].S, !!fT.W[0].o.noArmour, !!fT.W[0].o.noRegen, fT.W[0].ap], [3, 5, true, true, 0], 'R+1: fallado: D3+2 (1+2 = 3) F5 sin armadura ni regeneración'); eq(go(T4 + 1, 3).W[0].hits, 5, 'D3+2 máximo = 5');
  const f6 = go(6, 1); eq(f6.W[0].S, 5, 'un 6 natural siempre falla'); ok(!f6.W[0].o.noWard, 'las salvaciones especiales (Ward) se pueden intentar: no se anulan');
  // personaje trabado en combate: objetivo válido aunque esté en melé
  const eg = game([{ type: 'orc_weirdboy', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: 'empire_captain', models: 1 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w2 = put(U(eg, 'orc_weirdboy', 0), 36, 46), bz = U(eg, 'orc_boyz', 0), c2 = U(eg, 'empire_captain', 1); w2.spells = ['curse_hashut']; w2.casted = []; engage(eg, bz, c2, 'front', { x: 36, y: 30, face: Math.PI / 2 }); put(w2, 50, 30, Math.PI); cur(eg);
  ok(R.engagedWith(eg, c2).length > 0, 'montaje: el personaje está trabado'); ok(R.spellTargets(eg, w2, 'curse_hashut').some((x) => x.id === c2.id), 'personaje enemigo trabado en combate: objetivo válido');
  // varios personajes en la unidad: el jugador elige a cuál se dirige (ventana emergente); sin respuesta, el de mayor coste
  const two = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 20 }, { type: 'empire_captain', models: 1 }, { type: 'empire_mage', models: 1 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w3 = put(U(two, 'orc_weirdboy', 0), 36, 40), t3 = put(U(two, 'state_troops', 1), 36, 26, Math.PI / 2); w3.spells = ['curse_hashut']; w3.casted = []; join(two, U(two, 'empire_captain', 1), t3); join(two, U(two, 'empire_mage', 1), t3); cur(two);
  const pick = (id) => { globalThis.__WSL = []; dice([6, 6, 1, 1]); diceAll(1); const o = asks(two, (c) => R.apply(c, { t: 'cast', id: w3.id, spell: 'curse_hashut', target: t3.id }), [0, 1], (n) => n.title.includes('Hashut') ? id : undefined); return { o, defs: globalThis.__WSL.map((x) => x.def.type) }; };
  const m1 = pick(U(two, 'empire_mage', 1).id), m2 = pick(U(two, 'empire_captain', 1).id); ok(m1.o.needs.some((n) => /Hashut/.test(n.title)) && m1.o.needs[0].opts.length === 2, 'con dos personajes se pregunta a cuál: ' + JSON.stringify(m1.o.needs.map((n) => n.opts)));
  ok(m1.defs.includes('empire_mage') && !m1.defs.includes('empire_captain'), 'elegido el Mago: sus impactos van al Mago (' + m1.defs + ')'); ok(m2.defs.includes('empire_captain') && !m2.defs.includes('empire_mage'), 'elegido el Capitán: sus impactos van al Capitán (' + m2.defs + ')');
});
// ——— Involucionar (Devolver, Saber de las Bestias): chequeo de Ld; pierde tantas Heridas como lo falle por (rh.txt:5093-5096) ———
TS('devolve', 'Ld superado = nada; fallado por N = N Heridas (también a modelos de varias Heridas); doble 1 supera; doble 6 falla; puede destruir la unidad', () => {
  const go = (x1, x2, tT = 'state_troops', n = 20) => { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: tT, models: n }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 36), t = put(U(s, tT, 1), 36, 26, Math.PI / 2); w.spells = ['devolve']; w.casted = []; cur(s); const ld = R.ldOf(s, t), w0 = t.wounds, m0 = t.models; dice([6, 6, x1, x2]); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'devolve', target: t.id }); ok(r.ok, r.error); return { ld, lost: w0 - t.wounds, models: m0 - t.models, m: msgs(r.events), t }; };
  const ld = go(1, 2).ld, sum = (v) => { const a = Math.min(6, Math.max(1, v - 6)), b = v - a; return go(a, b); };
  eq(sum(ld).lost, 0, 'Ld exacto: lo supera'); eq(sum(ld - 1).lost, 0, 'por debajo del Ld: lo supera'); eq(sum(ld + 1).lost, 1, 'falla por 1: 1 Herida'); eq(sum(ld + 2).lost, 2, 'falla por 2: 2 Heridas'); eq(sum(12).lost, 12 - ld, 'doble 6 (12): falla por 12 − Ld');
  eq(go(1, 1).lost, 0, 'doble 1: siempre lo supera');
  // modelos de varias Heridas: las Heridas se restan de las del modelo/unidad (Heridas totales)
  const big = go(5, 6, 'ok_bulls', 6); ok(big.ld < 11, 'montaje: Ld ' + big.ld); eq(big.lost, 11 - big.ld, 'unidad de modelos de varias Heridas: pierde la diferencia en Heridas'); ok(UNITS.ok_bulls.W >= 2 && big.models <= big.lost / UNITS.ok_bulls.W + 1, 'las Heridas perdidas retiran modelos de varias Heridas (' + big.models + ' bajas por ' + big.lost + ' Heridas)');
  // pérdida mayor que las Heridas de la unidad: se destruye y no quedan heridas negativas
  { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 36), t = put(U(s, 'state_troops', 1), 36, 26, Math.PI / 2); w.spells = ['devolve']; w.casted = []; t.models = 3; t.wounds = 3; cur(s); const ld = R.ldOf(s, t); ok(12 - ld >= 3, 'montaje: Ld ' + ld); dice([6, 6, 6, 6]); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'devolve', target: t.id }); ok(r.ok, r.error); ok(t.models <= 0 && !R.alive(s, 1).includes(t), 'pierde más Heridas de las que tiene: la unidad queda destruida'); ok(t.wounds >= 0, 'sin Heridas negativas'); }
  // Ld propio de la unidad objetivo (Ld alto = menos Heridas): Enanos (Ld 9) frente a Tropas Estatales (Ld 7)
  const d1 = go(5, 6, 'dw_warriors'), d2 = go(5, 6, 'state_troops'); ok(d1.ld !== d2.ld && d1.lost !== d2.lost, 'el Ld usado es el de la unidad objetivo (' + d1.ld + ' frente a ' + d2.ld + ')'); eq(d1.lost, Math.max(0, 11 - d1.ld), 'Enanos: 11 − Ld'); eq(d2.lost, Math.max(0, 11 - d2.ld), 'Estatales: 11 − Ld');
});
// ——— Doble Espectral (Ilusión): 2D6 impactos con las características y reglas especiales del lanzador y de su arma (core_rulebook.txt:10611-10616; FAQ Core p.17) ———
TS('doppelganger', 'F/FP/Perforante/Flamígero/Heridas múltiples del arma, Golpe mortal, arma de un solo ataque = 1 impacto, arma de Golpea último a I 1, sin estar trabado no se lanza', () => {
  const run = (items, o = {}) => { const s = game([{ type: 'orc_weirdboy', models: 1, items }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'], phase: 'combat' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 30), t = put(U(s, 'state_troops', 1), 36, 27, Math.PI / 2); w.spells = ['doppelganger']; w.casted = []; if (o.pick) { w.dualK = R.turnKey(s); w.dualPick = o.pick; } if (o.free !== true) engage(s, w, t, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); const P = R.attackProfile(w, t); globalThis.__WSL = []; dice(o.q || [6, 6, 4, 5]); diceAll(1); const ev = []; R.autoAssail(s, ev, [w], o.step ?? 4, () => 4); return { P, m: msgs(ev), W: globalThis.__WSL.map((x) => ({ hits: x.hits, S: x.S, ap: x.ap, o: x.o })) }; };
  const base = run([]); eq(base.W[0].hits, 9, '2D6 = 4+5 impactos automáticos'); eq([base.W[0].S, base.W[0].ap], [base.P.S, base.P.ap], 'Fuerza y FP del lanzador'); ok(base.W[0].o.magical, 'son impactos de un hechizo: mágicos');
  eq(run([], { q: [6, 6, 1, 1] }).W[0].hits, 2, '2D6 mínimo = 2'); eq(run([], { q: [6, 6, 6, 6] }).W[0].hits, 12, '2D6 máximo = 12');
  // reglas del arma: Heridas múltiples, Perforante, flamígero, Golpe mortal (tk_destroyer: kb + golpea último), Fuerza fija
  const kb = run(['tk_destroyer'], { step: 1 }); ok(kb.W.length, 'arma de Golpea último: se lanza a I 1: ' + kb.m); eq([kb.W[0].S, kb.W[0].ap], [kb.P.S, kb.P.ap], 'Fuerza y FP del Destructor de Eternidades'); ok(kb.W[0].o.kb, 'Golpe mortal del arma se aplica a los impactos del hechizo');
  const mw = run(['helsturm'], { step: 4 }); ok(mw.W.length, 'Maza de Helsturm'); eq(String(mw.W[0].o.dmg || 0), String(mw.P.mw || 0), 'Heridas múltiples del arma');
  const ab = run(['wocaj_glaive'], { step: 1 }); ok(ab.W.length && ab.W[0].o.ab === (ab.P.ab || 0) && ab.W[0].o.kb, 'Perforante (' + (ab.P.ab || 0) + ') y Golpe mortal de la guadaña');
  // arma limitada a un solo ataque (FAQ Core p.17): un solo impacto
  ok(ITEMS.helsturm.dual && ITEMS.helsturm.dual.oneAttack, 'datos: la Maza de Helsturm limita su modo a dos manos a un solo ataque');
  const two = run(['helsturm'], { pick: 'two' }), one = run(['helsturm'], { pick: 'one' }); eq(two.W[0].hits, 1, 'a dos manos (un solo ataque): un único impacto (FAQ Core p.17)'); eq(two.W[0].S, 10, 'con la Fuerza 10 del modo a dos manos'); eq(one.W[0].hits, 9, 'a una mano (ataques normales): 2D6 impactos');
  const qs = run(['quest_sword'], { pick: 'two', step: 1 }), qo = run(['quest_sword'], { pick: 'one', step: 4 }); ok(qs.W.length && qs.P.S === qs.W[0].S && qs.P.S >= 1, 'Espada de la Búsqueda a dos manos (golpea último): se lanza a I 1: ' + qs.m); ok(qo.W.length, 'a una mano (golpea primero): se lanza a la I del Mago');
  // el paso en que se lanza: golpea último → I 1; si no, la Iniciativa del Mago (FAQ Core p.17)
  const stepOf = (items, pick) => { const s0 = game([{ type: 'orc_weirdboy', models: 1, items }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'], phase: 'combat' }); const w0 = put(U(s0, 'orc_weirdboy', 0), 36, 30), t0 = put(U(s0, 'state_troops', 1), 36, 27, Math.PI / 2); w0.spells = ['doppelganger']; w0.casted = []; engage(s0, w0, t0, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); if (pick) { w0.dualK = R.turnKey(s0); w0.dualPick = pick; } cur(s0); return R.doppelLast(w0, 'doppelganger'); };
  ok(!stepOf([]), 'sin arma especial: a la Iniciativa del Mago'); ok(stepOf(['tk_destroyer']), 'arma de Golpea último: I 1'); ok(stepOf(['quest_sword'], 'two') && !stepOf(['quest_sword'], 'one'), 'arma de dos modos: Golpea último solo en el modo a dos manos');
  // sin estar trabado: no se lanza
  ok(run([], { free: true }).W.length === 0, 'sin unidad enemiga trabada no hay impactos');
});
// ——— Mirada Ardiente / Mirada de Gork: línea de 5D6" desde el borde de la peana (fof.txt:4423-4433; rh.txt:2046-2053; FAQ FoF: VL 9+) ———
const gz = (key, d5, o = {}) => {
  const s = game([{ type: o.wT || 'orc_weirdboy', models: 1 }, ...(o.fr ? [{ type: 'orc_boyz', models: 5 }] : []), ...(o.host ? [{ type: 'orc_boyz', models: 10 }] : [])], [{ type: 'state_troops', models: o.n || 20 }], { f: ['orcs', 'empire'], phase: 'shoot' });
  const w = put(U(s, o.wT || 'orc_weirdboy', 0), 36, 36), t = U(s, 'state_troops', 1); t.files = o.files || 1; w.spells = [key]; w.casted = [];
  if (o.host) { const h = put(U(s, 'orc_boyz', 0), 36, 36, -Math.PI / 2); h.files = o.hostFiles || 5; join(s, w, h); R.syncJoined(s); }
  const wd = GEOM.dims(o.host ? U(s, 'orc_boyz', 0) : w).d, td = GEOM.dims(t).d; put(t, o.tx ?? 36, 36 - wd / 2 - (o.gap ?? 1) - td / 2, Math.PI / 2);
  if (o.fr) { const f = put(U(s, 'orc_boyz', 0), 36, 36 - wd / 2 - (o.gap ?? 1) - td - 6, -Math.PI / 2); f.files = 5; }
  cur(s); globalThis.__WSL = []; dice([6, 6, ...d5]); diceAll(1); const L = d5.reduce((a, b) => a + b, 0); const r = R.apply(s, { t: 'cast', id: w.id, spell: key, target: t.id });
  return { s, w, t, L, r, m: msgs(r.events || []), W: globalThis.__WSL.map((x) => ({ hits: x.hits, S: x.S, ap: x.ap, o: x.o, def: x.def })) };
};
for (const key of ['burning_gaze', 'gaze_gork']) {
  const sp = SPELLS[key], G = key === 'gaze_gork';
  TS(key, `${G ? 'F5 FP −3 a todo modelo (amigo o enemigo)' : 'F4 sin armadura (Ward y Regeneración sí) a los enemigos'} bajo la línea de 5D6"; longitud, geometría, VL 9+, lanzador unido`, () => {
    const hitsOn = (x, type) => x.W.filter((w) => w.def.type === type).reduce((a, w) => a + w.hits, 0);
    ok(sp.cv === 9 && sp.type === 'missile' && sp.hitsFn === 'gaze', 'montaje: VL 9+ (' + (G ? 'rh.txt:2043' : 'FAQ FoF: de 10+ a 9+') + ')');
    // 1) longitud de la línea: impactos = modelos de una columna de 1 modelo de ancho bajo la línea (cada modelo mide el diámetro de su peana)
    const long = gz(key, [6, 6, 6, 6, 6]), short = gz(key, [1, 1, 1, 1, 1]); ok(long.r.ok && long.W.length, 'sin heridas: ' + long.m);
    const bd = long.t.baseD / 25.4, expectCol = (Ln, gap = 1) => Ln < gap ? 0 : Math.min(20, Math.floor((Ln - gap) / bd) + 1);
    eq(hitsOn(long, 'state_troops'), expectCol(30), 'línea de 30": todos los modelos de la columna (20) bajo la línea'); eq(hitsOn(short, 'state_troops'), expectCol(5), 'línea de 5": un modelo cada ' + bd.toFixed(3) + '" desde el borde de la peana (' + expectCol(5) + ')');
    const w0 = long.W.find((w) => w.def.type === 'state_troops'); eq([w0.S, w0.ap], G ? [5, 3] : [4, 0], 'F y FP'); eq(!!w0.o.noArmour, !G, G ? 'con salvación de armadura (modificada por FP −3)' : 'sin salvación de armadura'); ok(!w0.o.noRegen && !w0.o.noWard, 'las salvaciones especiales y la Regeneración se pueden intentar');
    ok(hitsOn(gz(key, [1, 1, 1, 1, 1], { gap: 10 }), 'state_troops') === 0, 'una línea de 5" no alcanza a un blanco a 10"'); eq(hitsOn(gz(key, [2, 2, 2, 2, 2], { gap: 9.5 }), 'state_troops'), 1, 'una línea de 10" apenas alcanza (1 modelo) a un blanco a 9.5"'); eq(hitsOn(gz(key, [2, 2, 2, 2, 2], { gap: 10.5 }), 'state_troops'), 0, 'una línea de 10" no alcanza a un blanco a 10.5"');
    for (const [d5, gap] of [[[3, 3, 3, 3, 3], 8], [[2, 3, 4, 3, 2], 6], [[4, 4, 4, 4, 4], 3]]) { const Ln = d5.reduce((a, b) => a + b, 0); eq(hitsOn(gz(key, d5, { gap }), 'state_troops'), expectCol(Ln, gap), `línea de ${Ln}" a un blanco a ${gap}": ${expectCol(Ln, gap)} modelos`); }
    // 2) desvío lateral: un blanco fuera de la línea (a un lado, sin modelos bajo ella) no sufre impactos
    ok(hitsOn(gz(key, [6, 6, 6, 6, 6], { files: 1 }), 'state_troops') > 0, 'columna bajo la línea: sufre impactos');
    // 3) amigos bajo la línea
    const friends = hitsOn(gz(key, [6, 6, 6, 6, 6], { fr: true, n: 10 }), 'orc_boyz'); if (G) ok(friends > 0, 'fuego amigo: los modelos amigos bajo la línea sufren un impacto'); else eq(friends, 0, 'los modelos amigos bajo la línea no sufren impactos');
    // 4) lanzador unido a una unidad: la línea parte de la peana del lanzador (su ranura en la fila delantera)
    const j = gz(key, [6, 6, 6, 6, 6], { host: true }); ok(j.r.ok, j.r.error); ok(hitsOn(j, 'state_troops') > 0, 'lanzador unido: la línea parte de su peana y alcanza al enemigo: ' + j.m);
    // geometría independiente: muestreo de puntos de la recta (desde el borde de la peana del lanzador, hacia el centro del blanco) contra los rectángulos de peana de los modelos del blanco
    const inRect = (pt, q, face, bw, bd) => { const dx = pt.x - q.x, dy = pt.y - q.y, c = Math.cos(face), sn = Math.sin(face), a = dx * c + dy * sn, b = -dx * sn + dy * c; return Math.abs(a) <= bd / 2 && Math.abs(b) <= bw / 2; };
    const sampled = (m) => { const { w, t } = m, ang = Math.atan2(t.y - w.y, t.x - w.x), bw = w.baseW / 25.4, bd = w.baseD / 25.4; let e0 = 0; while (inRect({ x: w.x + Math.cos(ang) * e0, y: w.y + Math.sin(ang) * e0 }, w, w.face, bw, bd)) e0 += 0.001; const pts = R.modelPts(t), hit = new Set(); for (let r = e0; r <= e0 + m.L; r += 0.005) { const pt = { x: w.x + Math.cos(ang) * r, y: w.y + Math.sin(ang) * r }; pts.forEach((q, i) => { if (inRect(pt, q, t.face, t.baseW / 25.4, t.baseD / 25.4)) hit.add(i); }); } return hit.size; };
    for (const [tx, d5, gap] of [[36, [6, 6, 6, 6, 6], 1], [36 + 16, [6, 6, 6, 6, 6], 1], [36 + 3, [4, 4, 4, 4, 4], 2], [36 - 5, [3, 3, 3, 3, 3], 4], [36 + 30, [6, 6, 6, 6, 6], 1]]) { const m = gz(key, d5, { tx, gap, files: 1 }); eq(hitsOn(m, 'state_troops'), sampled(m), `blanco desplazado ${tx - 36}" lateralmente: los impactos coinciden con los modelos bajo la recta (${sampled(m)})`); }
  });
}
// ——— Bola de Fuego del Aquelarre (Sisters of the Thorn): Fireball de Magia de Batalla (core_rulebook.txt:10142-10151) como hechizo LIGADO (core.txt:3345-3360) con Nivel de Poder 0/1/2 (fof.txt:5373-5381) ———
TS('coven_fireball', 'ligado: sin Miscast ni Invocación perfecta, se puede dispersar (sin riesgo de Superado), RM del objetivo resta, un hechizo ligado por fase; 2D6 F4 flamígeros; PL 0/1/2 y sus umbrales', () => {
  const sp = SPELLS.coven_fireball; ok(sp.cv === 8 && sp.range === 24 && sp.hits === '2D6' && sp.s === 4 && sp.ap === 0 && sp.flaming && sp.type === 'missile', 'montaje: 8+, 24", 2D6 F4 FP -, flamígero, proyectil');
  const go = (d, o = {}) => { const s = game([{ type: 'we_sisters', models: 6, champ: o.champ ?? true, std: o.std ?? true }], [{ type: o.foeT || 'state_troops', models: 20 }, ...(o.mage ? [{ type: 'empire_mage', models: 1 }] : [])], { f: ['wood', 'empire'], phase: 'shoot' }); const c = put(U(s, 'we_sisters', 0), 36, 40), t = put(U(s, o.foeT || 'state_troops', 1), 36, 40 - 14, Math.PI / 2); c.champ = o.champ ?? true; c.std = o.std ?? true; c.spells = ['coven_fireball']; c.casted = []; if (o.mage) { const mg = U(s, 'empire_mage', 1); put(mg, 36, 14); mg.spells = mg.spells || []; } cur(s); globalThis.__WSL = []; dice(d); diceAll(1); const r = R.apply(s, { t: 'cast', id: c.id, spell: 'coven_fireball', target: t.id }); return { s, c, t, r, m: msgs(r.events || []), W: globalThis.__WSL.map((x) => ({ hits: x.hits, S: x.S, ap: x.ap, fl: !!x.o.flaming })), hp: c.wounds, mod: c.models }; };
  // sin Miscast: doble 1 con PL 2 falla (2+2 = 4 < 8) pero el lanzador no sufre nada ni se anuncia percance
  const m1 = go([1, 1]); ok(m1.r.ok && m1.W.length === 0 && /no logra/.test(m1.m), 'doble 1: el hechizo falla (1+1+2 = 4 < 8): ' + m1.m); ok(!/percance|miscast|Percance/i.test(m1.m) && m1.c.models === 6 && m1.hp === m1.c.models * UNITS.we_sisters.W, 'sin Percance al lanzar un hechizo ligado: el lanzador intacto');
  // sin Invocación perfecta: doble 6 no cuenta como tal → se puede dispersar (enemigo Mago de Nivel 1+ en rango)
  const p = go([6, 6, 1, 1, 2, 2], { mage: true, champ: false, std: false }); const dsp = (g) => /dispers/i.test(g.m);
  ok(p.r.ok, p.r.error);
  // una tirada de dispersión mayor que 12 (PL 0: 6+6 = 12) dispersa; doble 6 de lanzamiento no es Invocación perfecta
  const pd = go([6, 6, 6, 6, 1, 1], { mage: true, champ: false, std: false }); ok(dsp(pd) && pd.W.length === 0, 'doble 6 ligado con PL 0 = 12: un dispersor con 6+6 (+Nivel/2) lo dispersa (no hay Invocación perfecta): ' + pd.m);
  const pn = go([6, 6, 1, 1, 2, 2], { mage: true, champ: false, std: false }); ok(pn.W.length >= 1 && !dsp(pn), 'la misma tirada con dispersión 1+1 no se dispersa: se lanza: ' + pn.m);
  // resultado de lanzamiento por PL (con dados 4+4, 3+4 …): PL 0 → 8 necesario; PL 1 → 7; PL 2 → 6
  const thr = (champ, std) => { for (let tot = 2; tot <= 12; tot++) { const a = Math.min(6, tot - 1), b = tot - a; const r = go([a, b, 1, 1, 3, 3], { champ, std }); if (r.W.length) return tot; } return 99; };
  eq([thr(false, false), thr(true, false), thr(true, true)], [8, 7, 6], 'umbral de lanzamiento mínimo con 2D6: PL 0 → 8, PL 1 → 7, PL 2 → 6');
  ok(thr(false, true) === 8, 'portaestandarte sin Doncella: PL 0 (fof.txt:5379 «Otherwise»)');
  // Resistencia mágica del objetivo: se resta del resultado de lanzamiento (un objetivo enemigo)
  const dw = go([4, 4, 1, 1, 3, 3], { champ: false, std: false, foeT: 'dw_warriors' }), mrDw = R.mrOf(dw.t); ok(mrDw >= 1, 'montaje: RM del objetivo ' + mrDw);
  eq(dw.W.length, 0, `RM ${mrDw}: 4+4 = 8 − ${mrDw} < 8: no se lanza`); const dw2 = go([4 + (mrDw > 0 ? 1 : 0), 4, 1, 1, 3, 3].slice(0, 6), { champ: false, std: false, foeT: 'dw_warriors' }); eq(mrDw, 1, 'montaje: RM 1'); ok(dw2.W.length > 0, 'con +1 sobre el umbral y RM 1: se lanza');
  // efecto
  const e = go([6, 6, 1, 1, 6, 5], { champ: true, std: true }); eq([e.W[0].hits, e.W[0].S, e.W[0].ap, e.W[0].fl], [11, 4, 0, true], '2D6 = 11 impactos F4 sin FP, flamígeros'); eq(go([6, 6, 1, 1, 1, 1]).W[0].hits, 2, '2D6 mínimo = 2'); eq(go([6, 6, 1, 1, 6, 6]).W[0].hits, 12, '2D6 máximo = 12');
  // alcance 24": a >24" no
  const far = go([6, 6, 1, 1, 3, 3]); far.t.y = far.c.y - 24 - 6; ok(R.castCheck(far.s, far.c, 'coven_fireball', far.t), 'a más de 24" no se puede lanzar: ' + R.castCheck(far.s, far.c, 'coven_fireball', far.t));
  // un hechizo ligado por modelo y fase / un hechizo por fase: no se puede lanzar dos veces
  const twice = go([6, 6, 1, 1, 3, 3]); twice.c.casted = ['coven_fireball']; ok(R.castCheck(twice.s, twice.c, 'coven_fireball', twice.t), 'ya lanzado esta fase: no se puede repetir');
});
