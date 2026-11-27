// v837 — FAQ pendientes (54 entradas automatizables): pruebas que ejecutan el motor. Lote B: Core (magia, listas, objetivos) y Reglas hermanas
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const FQ = 'rules/new/faq_rh.txt', FC = 'rules/new/faq_core.txt', FF = 'rules/new/faq_fof.txt';
T('core-qa-104', FC, 'Escaramuzadores: las bajas nunca rompen la coherencia (≤ 1" de otro modelo)', () => {
  const k = 'bm_ungor'; ok(UNITS[k].sr.includes('skirmish'), 'montaje: Escaramuzadores');
  const coh = (t) => { const P = R.modelPts(t), bw = t.baseW / 25.4; return P.length < 2 || P.every((p, i) => P.some((q, j) => i !== j && Math.hypot(p.x - q.x, p.y - q.y) - bw <= 1 + 1e-6)); };
  const mk = () => { const s = game([{ type: k, models: 20, champ: true }], [{ type: 'state_troops', models: 10 }], { f: ['bm', 'empire'], phase: 'combat' }); const u = put(U(s, k, 0), 36, 30); u.sp = 1; cur(s); return { s, u }; };
  for (const n of [1, 3, 7, 12, 18]) { const { u } = mk(); const m0 = u.models; R.applyWounds(u, n); ok(u.models === m0 - n && coh(u), `${n} bajas: ${u.models} modelos y la unidad sigue en coherencia`); }
  { const { s, u } = mk(); ok(u.champ, 'montaje: con campeón'); const m0 = u.models; R.applyWounds(u, 1); ok(u.models === m0 - 1 && coh(u), 'una baja: se retira un modelo y no se rompe la coherencia'); }
});
T('core-qa-124', FC, 'Los modelos del grupo de mando siempre van en la fila delantera: un personaje sin hueco no los desplaza a la segunda fila, se retira a la retaguardia', () => {
  const mk = (cmd) => { const s = game([{ type: 'state_troops', models: 12, champ: cmd, std: cmd, mus: cmd }, { type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const h = put(U(s, 'state_troops', 0), 36, 40); h.files = 3; const c = U(s, 'empire_captain', 0); put(c, 36, 46); cur(s); eq(R.joinCheck(s, c, h), null, 'montaje'); join(s, c, h); R.syncJoined(s); return { s, h, c, L: R.frontLayout(h), rc: R.rearChars(h) }; };
  const a = mk(true); eq([a.L.nF, [a.L.champ, a.L.std, a.L.mus].every((f) => f >= 0 && f < a.L.nF), new Set([a.L.champ, a.L.std, a.L.mus]).size], [3, true, 3], 'campeón, portaestandarte y músico ocupan las 3 casillas de la fila delantera'); ok(a.rc.includes(a.c) && !(a.c.id in a.L.chars && a.L.chars[a.c.id] >= 0), 'el personaje sin hueco no desplaza al grupo de mando ni pasa a la segunda fila: se retira a la retaguardia');
  const b = mk(false); ok(!b.rc.includes(b.c) && b.L.chars[b.c.id] >= 0, 'control: sin grupo de mando, el personaje ocupa un hueco de la fila delantera');
});
T('core-qa-125', FC, 'Un personaje en la última fila (sin hueco delante) no confiere bonificaciones: su Liderazgo no cuenta para la unidad', () => {
  const mk = (cmd) => { const s = game([{ type: 'state_troops', models: 12, champ: cmd, std: cmd, mus: cmd }, { type: 'empire_general', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const h = put(U(s, 'state_troops', 0), 36, 40); h.files = 3; const c = U(s, 'empire_general', 0); put(c, 36, 46); cur(s); join(s, c, h); R.syncJoined(s); return { h, c, rc: R.rearChars(h), ld: R.ldOf(s, h) }; };
  const a = mk(true), b = mk(false); ok(R.D(a.c).Ld > UNITS.state_troops.Ld, 'montaje: el personaje tiene más Ld (' + R.D(a.c).Ld + ' > ' + UNITS.state_troops.Ld + ')'); ok(a.rc.includes(a.c) && !b.rc.includes(b.c), 'montaje: atrás / delante'); eq(a.ld, UNITS.state_troops.Ld, 'atrás: la unidad usa su propio Ld'); eq(b.ld, R.D(b.c).Ld, 'delante: la unidad usa el Ld del personaje');
});
T('core-qa-145', FC, 'Un modelo con dos armas de mano puede elegir combatir con una sola (renunciando al +1 Ataque); los mercenarios no reciben las reglas de ejército', () => {
  const s = game([{ type: 'orc_twin', models: UNITS.orc_twin.min || 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boyz', 0), t = U(s, 'state_troops', 1); cur(s);
  const A2 = R.attackProfile(a, t).atk; a.oneHand = true; const A1 = R.attackProfile(a, t).atk; a.oneHand = false;
  ok(A2 - A1 === 1, `con una sola arma pierde exactamente el +1 Ataque (${A2} -> ${A1})`);
  const sm = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_ogre_bulls', models: 3 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'] });
  const m = U(sm, 'orc_ogre_bulls', 0); ok(m.merc, 'unidad de otra facción incluida en la lista: mercenaria'); ok(!R.bsbNear(sm, m), 'las reglas de ejército (Mantened la posición del BSB) no se extienden a los mercenarios');
});
const wiz = (u, lvl, spells) => { u.spells = spells; u.casted = []; u.wizLevel = lvl; return u; };
T('core-qa-152', FC, 'Urgencia Arcana sobre una unidad con Movimiento aleatorio: el movimiento extra es un movimiento normal y no puede terminar en contacto con el enemigo', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 });
  const a = put(U(s, 'orc_boyz', 0), 36, 30, -Math.PI / 2), w = wiz(put(U(s, 'orc_weirdboy', 0), 36, 40), 1, ['arcane_urgency']), t = put(U(s, 'state_troops', 1), 36, 22, Math.PI / 2);
  const dm = GEOM.dims(a), dt = GEOM.dims(t), yc = t.y + dt.d / 2 + dm.d / 2; a.y = yc + 3.5; a.fx.push({ k: 'randMove', e: 'D6', by: 1 }); a.moved = true; cur(s); dice(6, 6); diceAll(6);
  const c = R.apply(s, { t: 'cast', id: w.id, spell: 'arcane_urgency', target: a.id }); ok(c.ok, c.error); ok(a.moved === false, 'Urgencia debe permitirle mover de nuevo (montaje): ' + msgs(c.events));
  const r = R.apply(s, { t: 'move', id: a.id, x: 36, y: yc, face: -Math.PI / 2 }); const r0 = R.apply(structuredClone(s), { t: 'move', id: a.id, x: 36, y: yc + 1.5, face: -Math.PI / 2 }); ok(r0.ok, 'control: un movimiento corto sin contacto es legal: ' + r0.error); ok(!r.ok, 'el movimiento de Urgencia no puede terminar en contacto con el enemigo (se movió ' + msgs(r.events) + ')');
  ok(!R.engagedWith(s, a).includes(t), 'no debe quedar trabada');
});
T('core-qa-155', FC, 'Cargar a una unidad con Murallas de Tierra equivale a cargar contra un obstáculo lineal bajo defendido (sin terreno físico)', () => {
  const run = (ramp) => { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 }); const a = put(U(s, 'orc_boyz', 0), 36, 36), t = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2); if (ramp) t.fx.push({ k: 'ramparts' }); cur(s); diceAll(6); const ev = []; R.doCharge(s, a, t, ev); return { a, m: msgs(ev), obs: a.chargeObsK, dis: a.chargeDisordered }; };
  const r1 = run(true), r0 = run(false); ok(r1.dis, 'con Murallas de Tierra la unidad cargada cuenta como tras obstáculo defendido (desorden/obstáculo): ' + r1.m); ok(!r0.dis, 'control: sin el hechizo no hay efecto');
  ok(r1.a.chargeDisordered && !r0.a.chargeDisordered, '');
});
T('core-qa-157', FC, 'Doble Espectral con Golpea primero/último: se lanza a la Iniciativa del Mago; con un arma de Golpea último, a Iniciativa 1', () => {
  const at = (items, st) => { const s = game([{ type: 'orc_weirdboy', models: 1, items }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'combat' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 30), t = put(U(s, 'state_troops', 1), 36, 27, Math.PI / 2); w.spells = ['doppelganger']; w.casted = []; w.wizLevel = 1; engage(s, w, t, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); diceAll(6); const ev = []; R.autoAssail(s, ev, [w], st, () => 4); return /Doble Espectral/.test(msgs(ev)); };
  eq(at([], 4), true, 'sin arma de Golpea último: se lanza a la I del Mago (4)'); eq(at([], 1), false, 'sin arma de Golpea último: no a I 1');
  ok(ITEMS.last_waaagh.slow, 'montaje: arma con Golpea último'); eq(at(['last_waaagh'], 1), true, 'con arma de Golpea último: a I 1'); eq(at(['last_waaagh'], 4), false, 'con arma de Golpea último: no a su I');
});
const tmTry = (cT, boundPL, roll) => { const s = game([{ type: cT, models: 1 }], [{ type: 'empire_mage', models: 1, items: ['transmog_scroll'] }], { f: [UNITS[cT].faction, 'empire'], phase: 'move' }); const c = put(U(s, cT, 0), 36, 30), d = put(U(s, 'empire_mage', 1), 36, 36); cur(s); dice(roll); diceAll(1);
  const o = asks(s, (x) => { const ev = []; const cc = U(x, cT, 0); const r = R.tryDispel(x, cc, 9, false, ev, 'magic', boundPL, false); return { r, ev, cc }; }, [1], (n) => (/^di/.test(n.k) ? 'tm' : n.opts?.[0]?.[0])); return { ...o.r, s: o.s }; };
T('core-qa-164', FC, 'Pergamino de Transmogrificación contra un Mago montado en monstruo: se transforma el Mago, no su montura (rana sobre un Dragón)', () => {
  const T0 = 'vc_necro_dragon'; ok(UNITS[T0].wizard && UNITS[T0].mountAtk, 'montaje: Mago montado en monstruo');
  const o = tmTry(T0, 0, 6); ok(o.cc.frog === true, 'el Mago falla la tirada (6 > Nivel) y se convierte en rana: ' + msgs(o.ev)); ok(!o.cc.frogItem, 'no es el objeto');
  const s = o.s, c = U(s, T0, 0), t = U(s, 'empire_mage', 1); cur(s); const P = R.attackProfile(c, t); ok(P.mountFrac > 0 && P.mS >= 4, `la montura sigue atacando con su Fuerza (mountFrac ${P.mountFrac}, F ${P.mS})`); eq(P.S, 1, 'el jinete rana ataca con Fuerza 1');
  const ok2 = tmTry(T0, 0, 1); ok(!ok2.cc.frog, 'con un resultado <= Nivel de Magia se libra');
});
T('core-qa-165', FC, 'Pergamino de Transmogrificación contra un hechizo ligado: se tira contra el Nivel de poder del objeto; si falla, el objeto se vuelve una rana inanimada (no el portador)', () => {
  const o = tmTry('orc_weirdboy', 3, 4); ok(o.cc.frogItem === true && !o.cc.frog, 'con 4 > Nivel de poder 3 el objeto se convierte en rana: ' + msgs(o.ev)); ok(/el objeto de/.test(msgs(o.ev)), 'mensaje de objeto');
  const o2 = tmTry('orc_weirdboy', 3, 3); ok(!o2.cc.frogItem && !o2.cc.frog, 'con 3 (= Nivel de poder) se libra');
  const o3 = tmTry('orc_weirdboy', 5, 4); ok(!o3.cc.frogItem, 'la tirada es contra el Nivel de poder, no contra el Nivel de Magia del portador (4 <= 5)');
});
T('core-qa-166', FC, 'Un Mago con Familiar de Saber no puede elegir una firma de su facción en lugar de la firma de su Saber', () => {
  const mk = (it) => { const s = game([{ type: 'orc_weirdnob', models: 1, items: it }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'deploy' }); s.ready = [false, false]; return { s, u: U(s, 'orc_weirdnob', 0) }; };
  const b = mk([]); ok(b.u.spellAlt && b.u.spellAlt.neh.length, 'montaje: sin Familiar el Mago de Gork puede cambiar la firma'); const alt = b.u.spellAlt.neh[0];
  const r0 = R.apply(b.s, { t: 'spellPick', id: b.u.id, drop: b.u.spellAlt.rolls[0], take: alt }); ok(r0.ok, 'control: sin Familiar la sustitución es válida: ' + r0.error);
  const f = mk(['lore_familiar']); ok(!f.u.spellAlt, 'con Familiar de Saber no hay tirada que descartar'); ok(f.u.spells[0] === DATA.LORES[f.u.lore].sig, 'conoce la firma de su Saber'); const r1 = R.apply(f.s, { t: 'spellPick', id: f.u.id, drop: f.u.spells[1], take: alt }); ok(!r1.ok, 'con Familiar de Saber no puede tomar la firma de la facción');
  ok(f.u.spells.every((k) => DATA.LORES[f.u.lore].pool.includes(k) || k === DATA.LORES[f.u.lore].sig), 'todos los hechizos son del Saber elegido');
});
T('core-qa-167', FC, 'Familiar Arcano: no aumenta el número de hechizos conocidos; un Mago de Nivel 3 conoce tres hechizos repartidos entre dos Saberes', () => {
  for (const t of ['empire_lord', 'rc_wizard3']) { const get = (it) => { const s = game([{ type: t, models: 1, lore: 'fire', items: it }], [{ type: 'state_troops', models: 10 }]); return U(s, t, 0).spells; };
    const base = get([]), fam = get(['arcane_familiar']); eq(base.length, 3, t + ': Nivel 3 conoce 3'); eq(fam.length, 3, t + ': con Familiar Arcano sigue conociendo 3 (no 6 ni 4)'); eq(new Set(fam.map((k) => DATA.SPELLS[k].lore)).size, 2, t + ': de dos Saberes'); }
});
T('core-qa-170', FC, 'Una unidad no puede controlar más de un objeto: si está en posición de controlar varios, puntúa solo uno (el elegido)', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const a = put(U(s, 'orc_boyz', 0), 36, 30); cur(s);
  s.locs = [{ bm: true, x: 31, y: 30, vp: 10 }, { bm: true, x: 41, y: 30, vp: 30 }, { bm: true, x: 36, y: 33, vp: 20 }]; s.scn = 'bm';
  const l = R.objsAt(s, 'turn').filter((x) => x.unit === a); ok(l.length >= 2, 'montaje: la unidad está en posición de controlar varios objetos: ' + l.length);
  const asked = asks(s, (c) => { const u = c.units.find((x) => x.id === a.id); return l.map((x) => R.objOK(c, u, x.key, 'turn')); }, [0], (n) => n.opts[n.opts.length - 1][0]);
  eq(asked.r.filter(Boolean).length, 1, 'puntúa exactamente un objeto de los que podría controlar'); ok(asked.needs.length >= 1, 'el jugador elige (popup)');
  const dflt = R.objOK(s, a, l.slice().sort((x, y) => y.vp - x.vp)[0].key, 'turn'); ok(dflt, 'por defecto (sin respuesta) puntúa el de mayor valor');
});
T('rh-qa-023', FQ, 'Avidez de sangre: persigue con un solo D6 únicamente mientras está Frenética (si perdió el Frenesí, 2D6)', () => {
  const run = (lost) => withSr('bm_minotaurs', ['frenzy'], () => { const s = game([{ type: 'bm_minotaurs', models: 3 }], [{ type: 'we_scouts', models: 20 }], { f: ['bm', 'wood'], phase: 'combat' }); const a = put(U(s, 'bm_minotaurs', 0), 36, 30), d = put(U(s, 'we_scouts', 1), 36, 26, Math.PI / 2); engage(s, a, d, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); a.frenzyLost = lost; diceAll(6); const ev = fight(s); return { m: msgs(ev), a, d }; });
  const fr = run(false), nf = run(true); ok(/huye/.test(fr.m) && fr.d.models > 0 && !/aniquila/.test(fr.m), 'Frenética: persigue 1D6 (6") y no alcanza al que huyó 12": ' + fr.m); ok(/aniquila/.test(nf.m), 'sin Frenesí persigue 2D6 (12") y lo alcanza: ' + nf.m); ok(nf.a.y - fr.a.y >= 5.9, `la persecución sin Frenesí avanza el doble (${fr.a.y.toFixed(1)} vs ${nf.a.y.toFixed(1)})`);
});
T('rh-qa-017', FQ, 'Títere Infernal: también afecta a los hechizos ligados (el mago enemigo tira un D6 extra y descarta el mayor)', () => {
  const run = (puppet, dist = 12) => { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); w.spells = ['ring_fireball']; w.casted = []; w.wizLevel = 1; t.items = puppet ? ['infernal_puppet'] : []; if (puppet) put(t, 36, 40 - dist - GEOM.dims(t).d / 2 - GEOM.dims(w).d / 2, Math.PI / 2); cur(s); dice(5, 5, 1); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'ring_fireball', target: t.id }); return { r, m: msgs(r.events || []) }; };
  const a = run(false), b = run(true), c = run(true, 20); ok(!/no logra/.test(a.m) && !/Títere/.test(a.m), 'sin Títere, 5+5+1 (Nivel de poder) lanza: ' + a.m); ok(/Títere Infernal/.test(b.m) && /no logra/.test(b.m), 'con Títere a 12" descarta un 5: 1+5+1 = 7 no logra el 8+: ' + b.m); ok(!/Títere/.test(c.m), 'a más de 15" no actúa');
});
T('rh-qa-022', FQ, 'Fetiche del Árbol Bruja: no repite las tiradas para herir de un hechizo ligado (solo de los hechizos del portador)', () => {
  const run = (key) => { const s = game([{ type: 'orc_weirdboy', models: 1, items: ['hagtree'] }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 26, Math.PI / 2); w.spells = [key]; w.casted = []; w.wizLevel = 2; cur(s); globalThis.__WSL = []; dice(6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: key, target: t.id }); ok(r.ok, r.error); return globalThis.__WSL.slice(); };
  const a = run('fireball'), b = run('ring_fireball'); ok(a.length && b.length, 'montaje: ambos hechizos hieren: ' + a.length + '/' + b.length);
  const rr = (l) => l.some((x) => JSON.stringify(x).includes('"rrw":true'));
  ok(rr(a), 'hechizo propio: repite para herir'); ok(!rr(b), 'hechizo ligado: no repite para herir');
});
T('rh-qa-031', FQ, 'Terrores de las profundidades: el número de chequeos de Iniciativa es la Fuerza de Unidad de quien usa la regla, no la de la unidad enemiga', () => {
  const s = game([{ type: 'tk_hpriest', models: 1 }, { type: 'tk_scorpion', models: 1, opts: ['tb'] }], [{ type: 'state_troops', models: 20 }], { f: ['tk', 'empire'], phase: 'strategy', active: 0 });
  const pr = put(U(s, 'tk_hpriest', 0), 36, 40), sc = U(s, 'tk_scorpion', 0), t = put(U(s, 'state_troops', 1), 36, 33, Math.PI / 2); s.units = s.units.filter((u) => u !== sc); sc.ambusher = true; sc.reserved = true; (s.reserves ||= []).push(sc); cur(s);
  const usA = R.usOf(sc), usT = R.usOf(t); ok(usA !== usT && usA >= 1, `montaje: US distintas (${usA} vs ${usT})`); dice(1, 1); diceAll(6); const ev = []; R.beginStrategy(s, ev); const m = /\((\d+) chequeos de Iniciativa fallidos\)/.exec(msgs(ev)); ok(m, 'sin chequeos: ' + msgs(ev)); eq(+m[1], usA, 'los chequeos son los de la US del Escorpión');
});
T('rh-qa-021', FQ, 'Forma deformada: un personaje unido a Lobos de Piel no se transfigura (solo la unidad)', () => {
  const s = game([{ type: 'woc_skinwolves', models: 4 }, { type: 'woc_lord', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'], phase: 'combat' });
  const w = U(s, 'woc_skinwolves', 0), c = U(s, 'woc_lord', 0), t = U(s, 'state_troops', 1); join(s, c, w); put(w, 36, 30); engage(s, w, put(t, 36, 26, Math.PI / 2), 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); diceAll(1);
  const o = asks(s, (x) => fight(x), [0], (n) => (/wfClaws/.test(JSON.stringify(n.opts)) ? 'wfClaws' : n.opts?.[0]?.[0])); const ww = U(o.s, 'woc_skinwolves', 0), cc = ww.joined.find((j) => j.type === 'woc_lord');
  ok(o.needs.some((n) => /Forma deformada/.test(n.title)), 'el jugador elige la Transfiguración (popup)'); ok(ww.fx.some((f) => f.k === 'wfClaws'), 'la unidad se transfigura: ' + JSON.stringify(ww.fx)); ok(cc && !(cc.fx || []).some((f) => /^wf/.test(f.k)), 'el personaje unido no se transfigura');
  cur(o.s); const tt = U(o.s, 'state_troops', 1); const pw = R.attackProfile(ww, tt), pc = R.attackProfile(cc, tt); ok(pw.ap >= 1 && pw.ab >= 2, 'los Lobos sí tienen Garras (AP+1, Perforante 2)'); ok(pc.ap === R.attackProfile({ ...cc, fx: [] }, tt).ap, 'el personaje conserva su perfil');
});
T('rh-qa-007', FQ, 'Goblins voladores: la plantilla se mueve la distancia completa del D3 y, si así alcanza a un personaje enemigo que no podía ser objetivo, este recibe el impacto', () => {
  const run = (pick) => { const s = game([{ type: 'doom_diver', models: 1 }], [{ type: 'state_troops', models: 20 }, { type: 'empire_lord', models: 1 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const a = put(U(s, 'doom_diver', 0), 36, 60), t = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2), ch = U(s, 'empire_lord', 1); cur(s);
    const probe = structuredClone(s); const ang = R.rnd(probe) * Math.PI * 2, tc = R.tplCenter(t); put(ch, tc.x + Math.cos(ang) * 6 + 2, tc.y + Math.sin(ang) * 6, Math.PI / 2); ch.wounds0 = ch.wounds; cur(s);
    dice(3, 5, 2, 2, 2, 2, 2, 2); diceAll(2); const o = asks(s, (c) => R.apply(c, { t: 'shoot', id: U(c, 'doom_diver', 0).id, target: U(c, 'state_troops', 1).id }), [0], (n) => (/Goblin volador/.test(n.title) ? pick : n.opts?.[0]?.[0])); return { o, m: msgs(o.r.events || []), ch: U(o.s, 'empire_lord', 1), w0: ch.wounds }; };
  const r = run('char'), c = run('auto'); ok(r.o.needs.some((n) => /Goblin volador/.test(n.title)), 'el jugador decide la dirección (popup)'); ok(/plantilla se mueve \d" \(hacia/.test(r.m), 'la plantilla se orienta hacia el personaje: ' + r.m);
  ok(/la plantilla alcanza a/.test(r.m), 'el personaje que no podía ser objetivo recibe el impacto: ' + r.m); ok(!/la plantilla alcanza a/.test(c.m), 'control: con la dirección automática (sin personaje en la trayectoria) no lo alcanza');
});
T('fof-qa-019', FF, 'Duelista experto: en el segundo desafío luchan Harald y su rival (el rival también ataca); la montura no combate en él', () => {
  const s = game([{ type: 'empire_knights', models: 5, opts: ['ord_pan'] }, { type: 'emp_harald', models: 1 }], [{ type: 'orc_boyz', models: 20 }, { type: 'orc_weirdboy', models: 1 }, { type: 'orc_warboss', models: 1 }], { f: ['empire', 'orcs'], phase: 'combat' });
  const k = U(s, 'empire_knights', 0), h = U(s, 'emp_harald', 0), o = U(s, 'orc_boyz', 1), weak = U(s, 'orc_weirdboy', 1), big = U(s, 'orc_warboss', 1); join(s, h, k); join(s, weak, o); join(s, big, o); weak.wounds = 1; k.files = o.files = 5; engage(s, k, o); charged(s, k, o); cur(s); diceAll(6);
  const q = asks(s, (x) => fight(x), [0, 1], (n) => (n.title === 'Desafío' ? (n.opts.find((x) => x[0] === 'j:' + weak.id) || n.opts.find((x) => x[0] !== 'no'))?.[0] : undefined)); const m = msgs(q.r);
  ok(/Duelista experto\) lanza un segundo desafío contra .*, que acepta/.test(m), 'montaje: sin segundo desafío: ' + m); const L = m.split('\n').filter((x) => /en el segundo desafío/.test(x));
  eq(L.length, 2, 'en el segundo desafío golpean Harald y su rival'); ok(/^Harald/.test(L[0]) && /golpea a Harald/.test(L[1]), 'el rival también combate: ' + L.join(' | ')); ok(!L.some((x) => /Caballeros del Imperio|Pegaso|montura/i.test(x)), 'la montura no combate en el segundo desafío');
  eq(q.needs.filter((n) => n.title === 'Desafío').length, 3, 'popups: lanzar, aceptar (primer desafío) y aceptar el segundo');
});
T('core-qa-156', FC, 'Doble Espectral con un arma limitada a un solo ataque: solo un impacto', () => {
  const run = (items, pick) => { const s = game([{ type: 'empire_mage', models: 1, items }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'], phase: 'combat' }); const w = put(U(s, 'empire_mage', 0), 36, 30), t = put(U(s, 'state_troops', 1), 36, 27, Math.PI / 2); w.spells = ['doppelganger']; w.casted = []; w.wizLevel = 1; engage(s, w, t, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); if (pick) { w.dualK = R.turnKey(s); w.dualPick = pick; } diceAll(6); globalThis.__WSL = []; const ev = []; R.autoAssail(s, ev, [w], 4, () => 4); const l = globalThis.__WSL.filter((x) => x.o?.spellDmg !== undefined || x.o?.magical); return { m: msgs(ev), hits: l.length ? l[0].hits : null }; };
  ok(DATA.ITEMS.helsturm.dual.oneAttack, 'montaje: Maza de Helsturm (un solo ataque a dos manos)'); const n = run([]), h = run(['helsturm'], 'two'), h1 = run(['helsturm'], 'one');
  ok(n.hits === 12, 'sin arma de un solo ataque: 2D6 impactos (con 6+6): ' + JSON.stringify(n)); ok(h.hits === 1, 'con el arma de un solo ataque a dos manos: un único impacto: ' + JSON.stringify(h)); ok(h1.hits === 12, 'a una mano (perfil sin la limitación): 2D6 impactos: ' + JSON.stringify(h1));
});
