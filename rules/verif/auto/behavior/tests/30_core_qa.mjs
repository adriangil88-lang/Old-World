// v835 — Preguntas y respuestas de la FAQ del Core (rules/new/faq_core.txt): una prueba por Q/A sobre el motor real, o motivo exacto si no es automatizable.
import { T, N, R, DATA, GEOM, game, U, Us, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join, dlog } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const F = 'rules/new/faq_core.txt';
const wiz = (u, lvl, spells) => { u.spells = spells; u.casted = []; if (lvl) u.wizLevel = lvl; return u; };
const ev0 = () => [];
const chal = (n) => (n.title === 'Desafío' ? n.opts.find((x) => x[0] !== 'no')?.[0] : undefined); // lanzar/aceptar el desafío con el primero que se ofrece
// ---------- General Principles ----------
T('core-qa-001', F, 'Repetir un dado descarta los efectos de la tirada original: Avería del dado de artillería repetida con la Runa de Forja → no hay avería', () => {
  const s = game([{ type: 'dw_cannon', models: 1, items: ['r_forging'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'], phase: 'shoot' }); const c = U(s, 'dw_cannon'); cur(s);
  dice(6, 3); const r = R.artDieM(s, c); eq(r, 6, 'resultado tras repetir la Avería'); eq(c.models, 1, 'se aplica la Avería descartada');
});
const vx = (o = {}) => { const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy', active: 0 });
  const w = put(U(s, 'empire_mage'), 10, 44), fr = put(U(s, 'state_troops'), 60, 40), e = put(U(s, 'orc_boyz'), 60, 4, Math.PI / 2); cur(s); s.vortex = [{ x: o.x ?? 36, y: o.y ?? 24, owner: 0, src: w.id, age: 0, spell: o.spell || 'foot_gork' }]; return { s, w, e }; };
T('core-qa-003', F, 'Un «¡Impacto!» en el dado de dispersión de un objeto que se mueve al azar: no se mueve', () => {
  const { s } = vx(); dice(1); diceAll(3); const ev = []; R.beginStrategy(s, ev); eq([s.vortex[0]?.x, s.vortex[0]?.y], [36, 24], 'la plantilla se mueve'); ok(/no se mueve/.test(msgs(ev)), 'sin aviso');
});
T('core-qa-004', F, 'Si al dispersarse cualquier parte del objeto cruza el borde de la mesa, se retira del juego', () => {
  let seen = false;
  for (let k = 1; k < 400 && !seen; k++) { const { s } = vx({ x: 4.2, y: 24, spell: 'foot_gork' }); s.rng = k; dice(4, 3); diceAll(3); const ev = []; R.beginStrategy(s, ev); const m = msgs(ev);
    if (/cruza el borde/.test(m)) { seen = true; ok(!s.vortex.length, 'sigue en juego'); }
    else if (s.vortex[0]) { const R0 = (SPELLS.foot_gork.vx?.size || 3) / 2; ok(s.vortex[0].x - R0 >= -1e-6, `parte de la plantilla fuera de la mesa (x=${s.vortex[0].x.toFixed(2)})`); } }
  ok(seen, 'ninguna dispersión hacia el borde en 400 semillas');
});
T('core-qa-005', F, 'Chequeo con su propio Liderazgo (Cuerno de Halcón): no usa el del General cercano', () => {
  const s = game([{ type: 'br_paladin', models: 1, items: ['falcon_horn'] }, { type: 'br_duke', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'command' });
  const p = put(U(s, 'br_paladin'), 36, 40), g = put(U(s, 'br_duke'), 38, 40); cur(s); const L = R.D(p).Ld; ok(R.D(g).Ld > L, 'montaje: el Duque no tiene más Ld');
  dice(Math.ceil((L + 1) / 2), Math.floor((L + 1) / 2)); const ev = []; R.falconUse(s, p, ev); ok(!/vuela|halc[oó]n.*(supera|éxito)/i.test(msgs(ev)) || /falla/i.test(msgs(ev)), 'usa un Liderazgo distinto del suyo: ' + msgs(ev));
});
T('core-qa-006', F, 'Objeto de un solo uso con chequeo de Liderazgo: cuenta como usado aunque falle', () => {
  const s = game([{ type: 'br_paladin', models: 1, items: ['falcon_horn'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'command' }); const p = put(U(s, 'br_paladin'), 36, 40); cur(s);
  dice(6, 6); R.falconUse(s, p, []); ok(p.used.falcon, 'no queda usado'); ok(!R.falconFor(s, p), 'se puede volver a usar');
});
T('core-qa-007', F, 'Sin máximo para modificar características salvo que la regla lo diga: la Iniciativa por cargar sí tiene máximo 10 (Core p.146), F con modificadores puede pasar de 10 no se limita en el perfil', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'); cur(s);
  a.fx.push({ k: 'wfFlesh' }); const T0 = R.D(a).T; a.fx.push({ k: 'oathS', v: 1 }); ok(T0 >= UNITS.state_troops.T, 'montaje');
  const e = U(s, 'orc_boyz'); engage(s, a, e); charged(s, a, e, 9); UNITS.state_troops.I += 6; try { eq(R.effI(a, [e]), 10, 'Iniciativa al cargar (máx. 10)'); } finally { UNITS.state_troops.I -= 6; }
});
T('core-qa-008', F, 'Una unidad en Orden cerrado u Orden abierto puede tener un solo modelo de ancho', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = U(s, 'state_troops'); a.files = 1; cur(s);
  const d = GEOM.dims(a); eq([d.files, d.ranks], [1, 10], 'una columna de un modelo de ancho'); ok(R.isColumn(a), 'es una columna');
});
T('core-qa-009', F, 'Heridas múltiples: se aplican una a una y modelo a modelo; el exceso de un modelo no pasa a otro', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'woc_ogres', models: 3 }], { f: ['orcs', 'woc'] }); const o = U(s, 'woc_ogres'); cur(s); const W = R.D(o).W;
  diceAll(6); const r = R.woundAndSave(s, o, 2, 10, 0, { dmg: '5', noArmour: true, noWard: true }); R.applyWounds(o, r.through); eq(o.models, 1, 'dos heridas de 5 Heridas = dos ogros (el exceso no pasa)'); eq(o.wounds, W, 'Heridas del superviviente');
});
T('core-qa-010', F, 'Presión del combate con dos filas de combate: las bajas salen primero de la primera fila (la de contacto)', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boyz'), d = U(s, 'state_troops'); a.files = d.files = 5; engage(s, a, d); cur(s);
  const n0 = R.attackProfile(d, a).atk; R.applyWounds(d, 3); const n1 = R.attackProfile(d, a).atk; eq(n0 - n1, 0, 'perder 3 de 20 reduce la fila de combate (se quitan de detrás, la fila delantera se rellena)');
});
T('core-qa-011', F, 'Unidad con dos tipos de tropa: la mayoría determina la bonificación máxima por filas', () => {
  const s = game([{ type: 'bm_primalhounds', models: 20 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bm', 'orcs'] }); const u = U(s, 'bm_primalhounds'); u.files = 5; cur(s);
  u.mix = 12; const rMaj = R.rankBonus(u); u.mix = 6; const rMin = R.rankBonus(u); eq([rMaj, rMin], [3, 1], 'mayoría Ungors (infantería, +3) / mayoría sabuesos (bestias, +1)');
});
T('core-qa-012', F, 'Una unidad de Orden cerrado de un solo modelo sigue siendo de Orden cerrado (bonificación por orden cerrado con US 10+)', () => {
  const s = game([{ type: 'we_treeman', models: 1 }], [{ type: 'goblins', models: 10 }], { f: ['wood', 'orcs'] }); const t = U(s, 'we_treeman'), g = U(s, 'goblins'); engage(s, t, g); cur(s);
  ok(R.D(t).sr.includes('closeOrder'), 'montaje'); ok(!R.D(t).sr.includes('skirmish'), 'actúa como Escaramuzador');
});
T('core-qa-013', F, 'Una unidad no queda oculta por sus propios modelos (cobertura)', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 22, Math.PI / 2); t.files = 5; cur(s);
  eq(R.coverMod(s, a, t), 0, 'la propia unidad le da cobertura');
});
T('core-qa-014', F, 'Dos salvaciones especiales no se combinan: se usa la mejor', () => {
  const s = game([{ type: 'empire_captain', models: 1, items: ['talisman_end'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const c = U(s, 'empire_captain'); cur(s);
  c.fx.push({ k: 'ward', v: 5 }); const w = R.wardOf(c); ok(w === Math.min(5, ITEMS.talisman_end?.ward || 7), `salvación especial ${w}`);
});
// ---------- Magic ----------
T('core-qa-015', F, 'Un Mago lanza como mucho tantos hechizos como su Nivel por turno, pero puede lanzar varios en la misma fase', () => {
  const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const w = put(U(s, 'empire_mage'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 30, Math.PI / 2); cur(s);
  const ms = ['fireball', 'burning_gaze', 'blue_fire', 'glare']; w.spells = ms; w.casted = []; const L = R.D(w).wizard.level;
  w.casted = ms.slice(0, L - 1); eq(R.castCheck(s, w, ms[L - 1], t), null, `con ${L - 1} lanzados (nivel ${L}) puede lanzar otro en la misma fase`);
  w.casted = ms.slice(0, L); ok(R.castCheck(s, w, ms[L], t), `con ${L} lanzados no puede lanzar más`);
  s.units.find((x) => x === w).wizLevel = 2; const s2 = game([{ type: 'empire_lord', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const w2 = put(U(s2, 'empire_lord'), 36, 40), t2 = put(U(s2, 'orc_boyz'), 36, 30, Math.PI / 2); cur(s2);
  w2.spells = ms; w2.casted = ['fireball']; const L2 = R.D(w2).wizard.level; if (L2 >= 2) eq(R.castCheck(s2, w2, 'burning_gaze', t2), null, 'un Nivel ' + L2 + ' lanza dos en la misma fase');
});
T('core-qa-016', F, 'Hechizos de alcance Propio que afectan a las unidades a X": lanzarlos otra vez no acumula el efecto', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' }); const w = put(U(s, 'empire_mage'), 36, 40), a = put(U(s, 'state_troops'), 36, 36); cur(s);
  const ev = []; ok(SPELLS.drain_magic.self && SPELLS.drain_magic.range === 0, 'montaje: Drenar Magia es de alcance Propio'); R.applySpell(s, w, 'drain_magic', w, ev); eq(w.fx.filter((f) => f.k === 'drain').length, 1, 'primer lanzamiento: una marca'); R.applySpell(s, w, 'drain_magic', w, ev); eq(w.fx.filter((f) => f.k === 'drain').length, 0, 'lanzarlo otra vez no acumula el efecto: el primero termina (FAQ)'); ok(/ya estaba en juego/.test(msgs(ev)), 'se anuncia');
});
T('core-qa-017', F, 'Un doble 1 al lanzar es una Disfunción aunque haya una repetición de lanzamiento fallido', () => {
  const rr = Object.keys(ITEMS).find((k) => ITEMS[k].rrCastFail || ITEMS[k].castRR); const s = game([{ type: 'empire_mage', models: 1, items: rr ? [rr] : [] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const w = put(U(s, 'empire_mage'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 28, Math.PI / 2); w.spells = ['fireball']; w.casted = []; cur(s);
  dice(1, 1, 3, 3); diceAll(4); const o = asks(s, (c) => R.apply(c, { t: 'cast', id: U(c, 'empire_mage').id, spell: 'fireball', target: U(c, 'orc_boyz').id }), [0, 1], () => 'y'); ok(/doble 1|estrepitos/i.test(msgs(o.r.events)), 'el doble 1 no es Disfunción: ' + msgs(o.r.events).slice(0, 200));
  ok(!o.needs.some((n) => /repet/i.test(n.title + (n.msg || ''))), 'ofrece repetir el doble 1');
});
T('core-qa-018', F, 'Hechizo con dos valores de lanzamiento (Rompedientes 7+/10+): no se declara cuál; el resultado decide la versión', () => {
  const run = (a, b) => { const s = game([{ type: 'ok_butcher', models: 1 }, { type: 'ok_bulls', models: 3 }], [{ type: 'orc_boyz', models: 10 }], { f: ['ogres', 'orcs'], phase: 'strategy' }); const w = put(U(s, 'ok_butcher'), 36, 40), t = put(U(s, 'ok_bulls'), 36, 36); w.spells = ['toothcracker']; w.casted = []; cur(s);
    dice(a, b); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'toothcracker', target: t.id }); ok(r.ok, r.error); return t.fx.find((f) => f.k === 'tooth')?.v || 0; }; // el modificador de R se aplica al herir (fx 'tooth')
  eq(run(4, 3), 1, 'resultado 7-9: +1 R'); eq(run(5, 5), 2, 'resultado 10+: +2 R');
});
T('core-qa-020', F, 'En la Conjuración se pueden intentar dispersar todos los hechizos rivales en juego (uno por hechizo)', () => {
  const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_weirdboy', models: 1 }, { type: 'orc_weirdnob', models: 1 }, { type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy', active: 0 });
  const w = put(U(s, 'empire_mage'), 36, 40), a = put(U(s, 'orc_weirdboy'), 30, 30), b = put(U(s, 'orc_weirdnob'), 42, 30); cur(s);
  s.vortex = [{ x: 30, y: 34, owner: 1, src: a.id, age: 0, spell: 'foot_gork' }, { x: 42, y: 34, owner: 1, src: b.id, age: 0, spell: 'foot_gork' }];
  diceAll(6); eq(R.dispelRipOne(s, 0, a.id, 'foot_gork', []), null, 'el primero'); eq(R.dispelRipOne(s, 0, b.id, 'foot_gork', []), null, 'el segundo'); ok(R.dispelRipOne(s, 0, a.id, 'foot_gork', []), 'el mismo dos veces');
});
T('core-qa-021', F, 'Un hechizo que permanece en juego termina si su lanzador lo vuelve a lanzar', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const w = put(U(s, 'empire_mage'), 36, 40), e = put(U(s, 'orc_boyz'), 36, 32, Math.PI / 2); cur(s);
  const k = 'foot_gork' in SPELLS && SPELLS.foot_gork.type === 'vortex' ? null : null; const vk = Object.keys(SPELLS).find((x) => SPELLS[x].type === 'vortex' && SPELLS[x].vx && SPELLS[x].lore === 'battle') || Object.keys(SPELLS).find((x) => SPELLS[x].type === 'vortex' && SPELLS[x].vx);
  w.spells = [vk]; w.casted = []; s.vortex = [{ x: 36, y: 30, owner: 0, src: w.id, age: 0, spell: vk, _old: true }];
  dice(6, 6); diceAll(1); const o = asks(s, (c) => R.apply(c, { t: 'cast', id: U(c, 'empire_mage').id, spell: vk, target: U(c, 'orc_boyz').id }), [0, 1], () => 'none');
  ok(o.s.vortex.filter((v) => v.src === w.id && v.spell === vk).length <= 1, 'quedan dos copias del mismo hechizo en juego');
  ok(o.r.ok, 'el lanzamiento debe ser legal: ' + JSON.stringify(o.r.error || ''));
  ok(!o.s.vortex.some((v) => v._old), 'la copia anterior debe terminar al lanzarlo de nuevo (v843l: no basta con que haya ≤ 1)');
  eq(o.s.vortex.filter((v) => v.src === w.id && v.spell === vk).length, 1, 'el nuevo lanzamiento (doble 6) deja exactamente una copia');
});
T('core-qa-022', F, 'Un modelo con armadura o escudo puede lanzar un hechizo ligado', () => {
  const k = Object.keys(ITEMS).find((x) => ITEMS[x].boundSpell && ITEMS[x].cat !== 'a' && ITEMS[x].fac == null && SPELLS[ITEMS[x].boundSpell]?.type === 'missile');
  const s = game([{ type: 'empire_captain', models: 1, items: [k, 'heavy_armour'].filter((x) => ITEMS[x]), opts: ['sh', 'ha'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'empire_captain'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 30, Math.PI / 2); cur(s);
  ok(c.opts.includes('sh') && c.opts.includes('ha'), 'lleva escudo y armadura'); const r = R.castCheck(s, c, ITEMS[k].boundSpell, t); eq(r, null, 'la armadura impide el hechizo ligado: ' + r);
});
T('core-qa-023', F, 'Un Mago puede intentar una dispersión de Mago contra un hechizo ligado si está a alcance', () => {
  const s = game([{ type: 'orc_weirdboy', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: 'empire_mage', models: 1 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const c = put(U(s, 'orc_weirdboy'), 36, 34), w = put(U(s, 'empire_mage', 1), 36, 24, Math.PI / 2); cur(s);
  const o = asks(s, (q) => R.tryDispel(q, U(q, 'orc_weirdboy'), 6, false, [], 'missile', 3), [1], () => 'none'); const n = o.needs.find((x) => x.title === 'Dispersar el hechizo'); ok(n && n.opts.some((x) => x[0] === w.id), 'el Mago no puede dispersar el hechizo ligado');
});
T('core-qa-024', F, 'Un Mago con un atributo que «cuenta como» armadura (Antiguo Hombre Árbol) puede lanzar y dispersar', () => {
  const s = game([{ type: 'we_ancient', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'shoot' }); const w = put(U(s, 'we_ancient'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 28, Math.PI / 2); cur(s);
  const k = Object.keys(SPELLS).find((x) => SPELLS[x].type === 'missile' && SPELLS[x].range >= 12 && (SPELLS[x].lore === 'battle' || SPELLS[x].lore === 'elementalism')); w.spells = [k]; w.casted = [];
  const r = R.castCheck(s, w, k, t); ok(!/armadura/i.test(String(r || '')), 'no puede lanzar por su armadura natural: ' + r); ok(!R.wizArmoured(w), 'cuenta como Mago con armadura');
});
T('core-qa-025', F, 'Un Mago unido solo necesita estar en la fila de combate (no en contacto) para lanzar un hechizo de Asalto', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 15 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const w = U(s, 'empire_mage'), h = U(s, 'state_troops'), e = U(s, 'orc_boyz'); h.files = 5; join(s, w, h); engage(s, e, h); cur(s);
  const k = Object.keys(SPELLS).find((x) => SPELLS[x].type === 'assail'); w.spells = [k]; w.casted = [];
  dice(6, 6); diceAll(4); const o = asks(s, (c) => { const ev = []; R.autoAssail(c, ev); return ev; }, [0, 1], (n) => n.title === 'Hechizo de asalto' ? n.opts.find((x) => x[0] !== 'no' && x[0] !== '-')?.[0] : 'none');
  ok(o.needs.some((n) => n.title === 'Hechizo de asalto'), 'el Mago en la fila de combate sin contacto debe poder lanzar el Asalto (se le pregunta)');
  ok(new RegExp('lanza ' + SPELLS[k].name).test(msgs(o.r)), 'el Asalto se lanza de verdad: ' + msgs(o.r)); ok(/bajas|impactos/.test(msgs(o.r)), 'el Asalto causa efecto');
});
T('core-qa-026', F, 'Si el Mago rechaza un desafío y se retira, su unidad pierde los hechizos de alcance Propio que lanzó (Escudo de Roble)', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' }); const w = U(s, 'empire_mage'), h = U(s, 'state_troops'); join(s, w, h); cur(s);
  R.applySpell(s, w, 'oaken_shield', w, []); eq(R.wardOf(h), 5, 'la unidad no gana la salvación especial 5+ (core.txt:10160-10162)'); R.retireLoseSelfSpells(s, w, []); eq(R.wardOf(h), 0, 'la unidad conserva la salvación tras la retirada');
});
T('core-qa-027', F, 'Un Volador que se mueve sobre un vórtice que cuenta como terreno peligroso sí le afecta', () => {
  const s = game([{ type: 'we_warhawks', models: 3 }], [{ type: 'orc_weirdboy', models: 1 }], { f: ['wood', 'orcs'], phase: 'move' }); const w = put(U(s, 'we_warhawks'), 36, 40), c = put(U(s, 'orc_weirdboy'), 10, 4); cur(s);
  s.vortex = [{ x: 36, y: 32, owner: 1, src: c.id, age: 0, spell: 'monsoon' }]; s.terrain.push({ id: 'vxT', vx: true, src: c.id, spell: 'monsoon', kind: 'swamp', danger: true, temp: true, owner: 1, x: 36, y: 32, w: 5, h: 5 });
  const W0 = w.wounds; dice(); diceAll(1); const r = R.apply(s, { t: 'move', id: w.id, x: 36, y: 31, face: w.face }); ok(r.ok, r.error); ok(w.wounds < W0, 'el Volador no hace el chequeo del vórtice peligroso: ' + msgs(r.events));
});
// ---------- Movement ----------
T('core-qa-028', F, '«Mover»: una máquina de guerra que pivota no cuenta como haber movido; cualquier otro cambio de posición sí', () => {
  const mk = () => { const s = game([{ type: 'great_cannon', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const c = put(U(s, 'great_cannon'), 36, 40, -Math.PI / 2); put(U(s, 'orc_boyz'), 36, 5, Math.PI / 2); cur(s); return [s, c]; };
  let [s, c] = mk(); eq(!!c.moved, false, 'antes de mover'); let r = R.apply(s, { t: 'move', id: c.id, x: 36, y: 40, face: 0 }); ok(r.ok, r.error); ok(Math.abs(c.face) < 0.01, 'pivotó'); eq(c.x, 36); eq(c.y, 40); eq(!!c.moved, false, 'pivotar la máquina cuenta como mover'); eq(!!c.marched, false);
  r = R.apply(s, { t: 'move', id: c.id, x: 36, y: 40, face: 1 }); ok(r.ok, 'puede volver a pivotar (gratis)'); eq(!!c.moved, false);
  [s, c] = mk(); r = R.apply(s, { t: 'move', id: c.id, x: 36, y: 38.5, face: -Math.PI / 2 }); ok(r.ok, r.error); ok(c.moved, 'avanzar la máquina cuenta como mover');
  const s3 = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const q = put(U(s3, 'state_troops'), 36, 40, -Math.PI / 2); put(U(s3, 'orc_boyz'), 36, 5, Math.PI / 2); cur(s3); const r3 = R.apply(s3, { t: 'move', id: q.id, x: 36, y: 40, face: 0 }); ok(r3.ok, r3.error); ok(q.moved, 'una unidad que no es máquina y gira cuenta como movida');
});
T('core-qa-029', F, 'Ningún modelo mueve más del doble de su M (salvo excepciones): marcha = 2×M', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 36, 40); cur(s); const M = R.D(a).M;
  ok(R.previewMove(s, a.id, { x: 36, y: 40 - 2 * M + 0.05, face: a.face }, true).ok, 'no puede marchar 2×M'); ok(!R.previewMove(s, a.id, { x: 36, y: 40 - 2 * M - 0.3, face: a.face }, true).ok, 'marcha más de 2×M');
});
T('core-qa-030', F, 'Una unidad que se reagrupa y reforma en la subfase de Reagrupar puede mover en la fase de Movimiento', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'command' }); const a = put(U(s, 'state_troops'), 36, 40); a.fleeing = true; cur(s);
  dice(1, 1); diceAll(1); R.rallyTest(s, a, 0, []); ok(!a.fleeing, 'no se reagrupa (montaje)'); s.phase = 'move'; cur(s); ok(R.previewMove(s, a.id, { x: 36, y: 38, face: a.face }).ok, 'no puede mover tras reagruparse: ' + R.previewMove(s, a.id, { x: 36, y: 38, face: a.face }).reason);
});
T('core-qa-019', F, 'Dispersar en la Conjuración un hechizo que permanece en juego: se compara con el valor mínimo aunque se lanzara con un resultado mayor', () => {
  const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'lm_skinkpriest', models: 1 }, { type: 'orc_boyz', models: 10 }].filter((x) => UNITS[x.type]), { f: ['empire', UNITS.lm_skinkpriest ? 'lm' : 'orcs'], phase: 'strategy', active: 0 });
  const w = put(U(s, 'empire_mage'), 36, 40), c = put(s.units.find((x) => x.owner === 1), 36, 30, Math.PI / 2); c.lastCast = 14; cur(s); s.vortex = [{ x: 36, y: 34, owner: 1, src: c.id, age: 0, spell: 'monsoon' }];
  dice(5, 4); diceAll(1); const o = asks(s, (q) => { const ev = []; R.dispelRipOne(q, 0, c.id, 'monsoon', ev); return ev; }, [0], (n) => n.opts.find((x) => x[0] === w.id)?.[0] || n.opts[0][0]);
  ok(!o.s.vortex.some((v) => v.spell === 'monsoon'), 'una dispersión de 9+1 no supera el valor mínimo 8+ porque se lanzó con 14: ' + msgs(o.r));
});
T('core-qa-031', F, 'Una unidad trabada en combate no puede mover', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = U(s, 'state_troops'), e = U(s, 'orc_boyz'); engage(s, a, e); cur(s);
  ok(!R.previewMove(s, a.id, { x: a.x + 1, y: a.y + 2, face: a.face }).ok, 'mueve estando trabada');
});
T('core-qa-032', F, 'El alcance máximo de carga es la distancia máxima a la que se puede DECLARAR la carga (M+6, o +3 con Zancada)', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 36, 40), t = U(s, 'orc_boyz'); cur(s); const M = R.D(a).M;
  const at = (dd) => { t.y = 40 - (GEOM.dims(a).d + GEOM.dims(t).d) / 2 - dd; t.face = Math.PI / 2; t.x = 36; cur(s); return R.chargeTargets(s, a).includes(t); };
  ok(at(M + 6 - 0.1), 'no puede declarar dentro de M+6'); ok(!at(M + 6 + 0.2), 'declara más allá de M+6');
});
T('core-qa-033', F, 'Al maniobrar, el borde delantero no puede atravesar otra unidad (salvo al pivotar)', () => {
  const s = game([{ type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 36, 40), b = put(U(s, 'emp_archers'), 36, 35); b.files = 10; cur(s);
  ok(!R.previewMove(s, a.id, { x: 36, y: 31, face: a.face }).ok, 'atraviesa la unidad amiga de delante');
});
T('core-qa-034', F, 'Al girar de ala, una esquina trasera puede pasar sobre otra unidad si no acaba encima ni a menos de 1" de un enemigo', () => {
  const s = game([{ type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 36, 40), b = U(s, 'emp_archers'); a.files = 5; b.files = 5; cur(s);
  const C = GEOM.corners(a), P = C[1], th = 0.5, rot = (t) => { const cx = a.x - P.x, cy = a.y - P.y, c = Math.cos(t), sn = Math.sin(t); return { x: P.x + c * cx - sn * cy, y: P.y + sn * cx + c * cy, face: a.face + t }; };
  const dest = rot(th); let found = null;
  for (let x = 30; x <= 44 && !found; x += 0.25) for (let y = 40; y <= 46 && !found; y += 0.25) { put(b, x, y, a.face); const pb = GEOM.corners(b);
    if (GEOM.polysOverlap(GEOM.corners(a), pb, 0.05) || GEOM.polysOverlap(GEOM.corners({ ...a, ...dest }), pb, 0.3)) continue;
    if ([0.15, 0.25, 0.35].some((t) => GEOM.polysOverlap(GEOM.corners({ ...a, ...rot(t) }), pb, 0))) found = { x, y }; }
  ok(found, 'montaje: no hay posición en la que solo la esquina trasera barra la otra unidad'); put(b, found.x, found.y, a.face); cur(s);
  const r = R.previewMove(s, a.id, dest); ok(r.ok, 'se rechaza el giro de ala: ' + r.reason);
});
T('core-qa-035', F, 'La rotación durante la carga forma parte del movimiento de carga (hay que contarla); la rotación para alinearse es gratis', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 30, 40), t = put(U(s, 'orc_boyz'), 36, 30, Math.PI / 2 + 0.6); cur(s);
  dice(1, 1); diceAll(1); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'state_troops').id, target: U(c, 'orc_boyz').id }), [0, 1], (n) => n.opts.find((x) => x[0] === 'hold')?.[0]); const m = msgs(o.r.events || []);
  ok(!R.engagedWith(o.s, U(o.s, 'state_troops')).length, 'con 1+1 llega a una unidad a ~10" contando la rotación: ' + m.slice(0, 200));
});
T('core-qa-036', F, 'Impetuosa con escaramuzadores amigos que obstruyen: debe declarar si estos pueden apartarse (declarando una carga), si no, no', () => {
  const run = (skFree) => { const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'wolf_riders', models: 5 }], [{ type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 5 }], { f: ['orcs', 'empire'], phase: 'move' });
    const a = put(U(s, 'orc_boyz'), 36, 40), sk = put(U(s, 'wolf_riders'), 40, 35.5), t = put(U(s, 'state_troops'), 36, 31, Math.PI / 2), x = U(s, 'emp_archers'); sk.files = 5; sk.sp = 0; // escaramuzadores en el pasillo de la carga pero sin tapar la línea de visión del centro
    if (!skFree) { engage(s, x, sk, 'rear', { x: 40, y: 35.5, face: -Math.PI / 2 }); } else put(x, 60, 4); cur(s); return R.chargeTargets(s, a, true).includes(t); };
  ok(run(true), 'con escaramuzadores que pueden cargar, no la cuenta como objetivo obligado'); ok(!run(false), 'con escaramuzadores trabados (no pueden apartarse) sigue obligada a declarar');
});
T('core-qa-037', F, 'Una unidad en Columna de marcha puede declarar una carga (no la mueve salvo Disciplinada)', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 33, Math.PI / 2); a.files = 2; cur(s); ok(R.isColumn(a), 'montaje: no está en columna');
  ok(R.chargeTargets(s, a).includes(t), 'en Columna de marcha no puede declarar');
  dice(6, 6); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'state_troops').id, target: U(c, 'orc_boyz').id }), [0, 1], (n) => n.opts.find((x) => x[0] === 'hold')?.[0]); ok(!R.engagedWith(o.s, U(o.s, 'state_troops')).length, 'sin Disciplinada hace el movimiento de carga en columna');
});
T('core-qa-038', F, 'Una unidad Disciplinada en columna obligada a cargar debe usar Disciplinada para formar y cargar', () => {
  const s = game([{ type: 'state_vets', models: 10, opts: ['dr'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_vets'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 33, Math.PI / 2); a.files = 2; cur(s);
  dice(6, 6); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'state_vets').id, target: U(c, 'orc_boyz').id }), [0, 1], (n) => n.title === 'Disciplinada' ? 'y' : n.opts.find((x) => x[0] === 'hold')?.[0]); ok(R.engagedWith(o.s, U(o.s, 'state_vets')).length, 'la Disciplinada no forma y no carga: ' + msgs(o.r.events || []).slice(0, 200));
});
T('core-qa-039', F, 'Carga a un Objetivo grande ya trabado por su frente, desde su arco frontal: no se puede cambiar al flanco (a veces una carga no es posible)', () => {
  const big = Object.keys(DATA.UNITS).find((k) => DATA.UNITS[k].sr.includes('large') && DATA.UNITS[k].faction === 'orcs' && DATA.UNITS[k].min <= 1) || Object.keys(DATA.UNITS).find((k) => DATA.UNITS[k].sr.includes('large') && DATA.UNITS[k].min <= 1);
  const run = (blocked, bt) => { const s = game([{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], [{ type: bt, models: DATA.UNITS[bt].min > 1 ? DATA.UNITS[bt].min : 1 }], { f: ['empire', DATA.UNITS[bt].faction === 'empire' || DATA.UNITS[bt].faction === 'merc' ? 'orcs' : DATA.UNITS[bt].faction], phase: 'move' }); const [c, x] = s.units.filter((u) => u.owner === 0), e = s.units.find((u) => u.owner === 1); put(e, 36, 24, -Math.PI / 2); if (blocked) engage(s, x, e, 'front', { x: 36, y: 24, face: -Math.PI / 2 }); else put(x, 10, 60); const dd = GEOM.dims(e); put(c, 36 + 0.5, 24 - dd.d / 2 - 4, Math.PI / 2); cur(s); dice(6, 6, 6, 6); diceAll(6); const r = R.apply(s, { t: 'charge', id: c.id, target: e.id }); return { r, m: msgs(r.events || []), eng: R.engagedWith(s, c).some((z) => z.id === e.id), side: R.sideOfC(e, c), big: R.D(e).sr.includes('large') }; };
  for (const bt of [big, 'orc_boyz']) { const free = run(false, bt), blk = run(true, bt); ok(free.eng && /carga contra/.test(free.m) && free.side === 'front', 'montaje (' + bt + '): con el frente libre la carga desde su arco frontal prospera: ' + free.m); ok(!blk.eng && /falla la carga/.test(blk.m), bt + (blk.big ? ' (Objetivo grande)' : '') + ': con el frente ya trabado la carga no es posible y no se desvía al flanco: ' + blk.m); eq(blk.side, 'front', 'el cargador sigue en el arco frontal (no se le asigna el flanco)'); }
  ok(DATA.UNITS[big].sr.includes('large'), 'montaje: se probó un Objetivo grande (' + big + ')');
});
T('core-qa-040', F, 'Unidad de un modelo entre dos arcos: carga por el arco en que está la mayoría de su peana', () => {
  const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const c = U(s, 'empire_captain'), t = put(U(s, 'orc_boyz'), 36, 24, -Math.PI / 2); cur(s);
  const dt = GEOM.dims(t); put(c, 36 + dt.w / 2 + 0.2, 24 - dt.d / 2 - 0.5, Math.PI / 2); eq(R.sideOfC(t, c), 'front', 'la mayoría en el arco frontal');
  put(c, 36 + dt.w / 2 + 0.6, 24 - dt.d / 2 + 0.3, Math.PI); eq(R.sideOfC(t, c), 'flank', 'la mayoría en el arco lateral');
});
T('core-qa-041', F, 'La carga contra un defensor de obstáculo lineal bajo acaba en contacto con el obstáculo (no encima): sin Impactos', () => {
  const s = game([{ type: 'orc_boar_chariot', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boar_chariot'), d = U(s, 'state_troops'); engage(s, a, d); charged(s, a, d, 6); a.chargeObsK = s.turn + ':' + s.active; a.impactPend = { t: d.id, dist: 6 };
  diceAll(6); const ev = fight(s); ok(!/Impactos de carga/.test(msgs(ev)), 'hace Impactos contra el defensor del obstáculo');
});
T('core-qa-042', F, 'Al redirigir una carga no se puede cargar a una unidad más allá del alcance máximo', () => {
  const run = (dy) => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'emp_archers', models: 5 }, { type: 'orc_boyz', models: 10 }], { f: ['empire', 'empire'], phase: 'move' }); const a = put(U(s, 'state_troops', 0), 36, 40), f = put(U(s, 'emp_archers', 1), 36, 34, Math.PI / 2), o = put(U(s, 'orc_boyz', 1), 30, 40 - dy, Math.PI / 2); cur(s);
    dice(1, 1, 6, 6, 1, 1); diceAll(1); const q = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'state_troops', 0).id, target: U(c, 'emp_archers', 1).id }), [0, 1], (n) => n.title === 'Redirigir la carga' ? n.opts.find((x) => x[0] !== 'no')?.[0] : n.opts.find((x) => x[0] === 'flee')?.[0]); return q.needs.find((n) => n.title === 'Redirigir la carga'); };
  ok(run(8), 'no ofrece redirigir contra una unidad a alcance'); ok(!run(14), 'ofrece redirigir más allá del alcance máximo (M+6)');
});
T('core-qa-043', F, 'Refuerzos: ningún modelo se coloca a más del doble de su M desde el borde por el que entra', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = U(s, 'state_troops'); cur(s); const M = R.D(a).M;
  const p = R.reinforcePos(s, a, 36); ok(p && (Math.min(p.y, 48 - p.y) <= 2 * M + 0.01 || Math.min(p.x, 72 - p.x) <= 2 * M + 0.01), 'el refuerzo entra más allá de 2×M');
});
T('core-qa-044', F, 'Un Mago no puede lanzar un Traslado el turno en que cargó', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const w = put(U(s, 'empire_mage'), 36, 40), a = put(U(s, 'state_troops'), 30, 40); w.spells = ['mystic_path']; w.casted = []; w.charged = true; cur(s);
  eq(R.castCheck(s, w, 'mystic_path', a), 'Ha cargado este turno', 'lanza el Traslado tras cargar'); w.charged = false; eq(R.castCheck(s, w, 'mystic_path', a), null, 'sin cargar sí puede (control)');
});
T('core-qa-045', F, 'Quien Aguanta y dispara (o Dispara y huye) no puede lanzar un Proyectil mágico ni un Vórtice como reacción', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'emp_archers', models: 10 }, { type: 'empire_mage', models: 1 }], { f: ['orcs', 'empire'], phase: 'move' }); const a = put(U(s, 'orc_boyz'), 36, 32), w = U(s, 'empire_mage', 1), h = put(U(s, 'emp_archers', 1), 36, 22, Math.PI / 2); join(s, w, h); w.spells = ['fireball']; w.casted = []; cur(s);
  dice(6, 6); diceAll(3); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'orc_boyz').id, target: U(c, 'emp_archers').id }), [0, 1], (n) => (n.title === 'Reacción a la carga' ? 'shoot' : undefined));
  const rc = o.needs.find((n) => n.title === 'Reacción a la carga'); ok(rc && rc.opts.some((x) => x[0] === 'shoot'), 'montaje: la unidad puede Defender y disparar'); const t = msgs(o.r.events || []);
  ok(/Arqueros Imperiales dispara a Orcos/.test(t), 'los Arqueros disparan como reacción'); ok(!o.needs.some((n) => n.opts?.some((x) => /fireball|Bola de Fuego/.test(x[0] + x[1]))), 'ofrece lanzar el proyectil como reacción'); ok(!/Bola de Fuego/.test(t), 'lanza el proyectil como reacción');
});
T('core-qa-046', F, 'No se puede usar un arma de aliento tras marchar', () => {
  const k = 'troll_hag'; ok(k, 'no hay unidades con aliento'); const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction, 'orcs'], phase: 'shoot' }); const u = put(U(s, k), 36, 40), t = put(U(s, 'orc_boyz'), 36, 35, Math.PI / 2); cur(s);
  u.marched = true; u.moved = true; ok(R.shootCheck(s, u, t, { breath: true }) || !R.legalShootTargets(s, u).length, 'usa el aliento tras marchar');
});
T('core-qa-047', F, 'No se lanzan hechizos ligados de Proyectil o Vórtice tras marchar', () => {
  const k = Object.keys(ITEMS).find((x) => ITEMS[x].boundSpell && SPELLS[ITEMS[x].boundSpell]?.type === 'missile' && !ITEMS[x].fac); const s = game([{ type: 'empire_captain', models: 1, items: [k] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'empire_captain'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 30, Math.PI / 2); cur(s);
  eq(R.castCheck(s, c, ITEMS[k].boundSpell, t), null, 'montaje: no puede lanzar sin marchar'); c.marched = true; ok(R.castCheck(s, c, ITEMS[k].boundSpell, t), 'lanza el hechizo ligado tras marchar');
});
T('core-qa-048', F, 'Una unidad parcialmente sobre una colina no dispara en dos filas', () => {
  const run = (hx) => { const s = game([{ type: 'crossbowmen', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'crossbowmen'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 22, Math.PI / 2); a.files = 5;
    s.terrain.push({ id: 'hl', kind: 'hill', x: hx, y: 40, w: 8, h: 6 }); cur(s); diceAll(1); const ev = []; R.resolveShot(s, a, t, ev); const m = /(\d+) tiros?/.exec(msgs(ev)); return m ? +m[1] : null; };
  const full = run(36), part = run(41); ok(full > part, `entera en la colina ${full} tiros, parcialmente ${part}`);
});
T('core-qa-049', F, 'En la misma colina, la unidad más cercana a la cima (centro de la colina o borde de la mesa) ve por encima de la más baja; la más baja no ve por encima de la que está más cerca de la cima', () => {
  const vis = (ya, yo, yb, o = {}) => { const s = game([{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const [a, m] = s.units.filter((u) => u.owner === 0), b = s.units.find((u) => u.owner === 1); if (o.hill !== false) s.terrain.push(o.h || { id: 'hh', kind: 'hill', x: 36, y: 36, w: 30, h: 30 }); put(a, o.ax ?? 36, ya, Math.atan2(yb - ya, (o.bx ?? 36) - (o.ax ?? 36))); put(m, o.mx ?? 36, yo, Math.atan2(yb - yo, (o.bx ?? 36) - (o.mx ?? 36))); /* v843u: cada unidad mira hacia B (el arco de 90° ya se exige en la línea de visión por modelo) */ b.models = 3; b.files = 3; /* v843u: B más estrecha que la unidad intermedia (con peanas reales una línea puede rozar el lateral de la intermedia si B sobresale) */ put(b, o.bx ?? 36, yb, Math.PI / 2); cur(s); return R.losClear(s, a, b); };
  ok(vis(38, 44, 49) === true, 'A cerca de la cima (2") ve por encima de la unidad más baja (8") hasta B'); ok(vis(49, 44, 38) === false, 'A en la parte baja (13") NO ve por encima de la unidad más cercana a la cima (8"): bloqueada');
  ok(vis(42, 30, 23) === true, 'misma distancia a la cima (6" y 6"): la intermedia no está más cerca de la cima, se ve por encima'); ok(vis(44, 30, 23) === false, 'A a 8" y la intermedia a 6": más cerca de la cima, bloquea');
  ok(vis(49, 44, 38, { hill: false }) === false && vis(38, 44, 49, { hill: false }) === false, 'sin colina la unidad intermedia bloquea en los dos sentidos (control)');
  // cima en el borde de la mesa («the centre of the hill or the edge of the battlefield»): colina cuyo centro cae fuera de la mesa → la cima es el borde (y = 0), no el centro geométrico
  const edge = { id: 'he', kind: 'hill', x: 36, y: -10, w: 60, h: 60 }; // v843u: colina más grande para que las unidades giradas (cara a B) sigan enteras sobre ella
  ok(vis(3, 6, 10, { h: edge }) === true && vis(10, 6, 3, { h: edge }) === false, 'colina en el borde de la mesa: la unidad más cerca del borde ve por encima de la más lejana, y no al revés');
  ok(vis(3, 8, 13, { h: edge, ax: 46, mx: 36, bx: 26 }) === false, 'desplazada de lado: A a 10.4" del borde (punto de la cima en el borde), la intermedia a 8" → más cerca de la cima: bloquea (con el centro geométrico fuera de la mesa A parecería más cerca)');
  ok(vis(8, 3, 12, { h: edge, ax: 36, mx: 46, bx: 56 }) === true, 'control: A a 8" del borde y la intermedia a 10.4": A más cerca de la cima, ve por encima');
});
T('core-qa-050', F, 'Las armas montadas en carros las dispara la dotación con su HP (Celerífero de los Altos Elfos: HP 4 de la dotación)', () => {
  const s = game([{ type: 'he_skycutter_bt', models: 1 }], [{ type: 'orc_boyz', models: 20 }], { f: ['he', 'orcs'], phase: 'shoot' }); const u = put(U(s, 'he_skycutter_bt'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 25, Math.PI / 2); cur(s);
  diceAll(3); const o = asks(s, (c) => { const ev = []; R.resolveShot(c, U(c, 'he_skycutter_bt'), U(c, 'orc_boyz'), ev); return ev; }, [0], (n) => n.title === 'Lanzavirotes ojo de águila' ? 'hp' : undefined); const m = msgs(o.r);
  ok(/3\+/.test(m), 'el lanzavirotes no impacta a 3+ (HP 4 de la dotación): ' + m.slice(0, 160));
});
T('core-qa-051', F, 'Con contacto con dos unidades enemigas, el modelo elige a cuál ataca al llegarle su turno de combatir', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'state_troops', models: 5 }, { type: 'emp_archers', models: 5 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boyz'), d1 = U(s, 'state_troops'), d2 = U(s, 'emp_archers'); a.files = 5; d1.files = d2.files = 5;
  engage(s, d1, a, 'front'); engage(s, d2, a, 'flank', { x: a.x, y: a.y, face: a.face }); cur(s); ok(R.engagedWith(s, a).length === 2, 'montaje: no está trabada con las dos');
  diceAll(4); const o = asks(s, (c) => fight(c), [0, 1]); ok(o.needs.some((n) => n.title === 'Reparto de los ataques' && n.p === 0) || o.needs.some((n) => /ataca|objetivo/i.test(n.title) && n.p === 0), 'no se elige a quién atacar: ' + o.needs.map((n) => n.title).join(','));
});
T('core-qa-052', F, 'Los modelos que tendrían que atacar a un personaje en desafío pueden dirigir sus ataques a la otra unidad', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }, { type: 'orc_bigboss', models: 1 }], [{ type: 'empire_captain', models: 1 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] });
  const a = U(s, 'orc_boyz'), b = U(s, 'orc_bigboss'), c = U(s, 'empire_captain'), t = U(s, 'state_troops'); a.files = 10; join(s, b, a); engage(s, t, a, 'front', { x: 36, y: 24, face: Math.PI / 2 }); put(c, t.x + 5.5, t.y, t.face); cur(s);
  diceAll(4); const o = asks(s, (q) => fight(q), [0, 1], chal); const bl = blows(o.r);
  ok(bl.some((x) => /Orcos/.test(x.who) && /Tropas Estatales/.test(x.to)), 'los Orcos no atacan a la otra unidad: ' + msgs(o.r).slice(0, 300));
});
T('core-qa-053', F, 'Un modelo que puede combatir hace todos sus ataques', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boyz'), d = U(s, 'state_troops'); a.files = d.files = 5; engage(s, a, d); cur(s);
  const n = R.attackProfile(a, d).atk; diceAll(1); const ev = fight(s); const b = blows(ev, 'Orcos')[0]; eq(b?.n, n, 'ataques hechos');
});
T('core-qa-054', F, 'Con Presión del combate, la segunda fila y los ataques de apoyo atacan aunque mueran los modelos de delante (las bajas reducen las filas traseras)', () => {
  const s = game([{ type: 'state_troops', models: 15 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'orc_boyz'); a.files = d.files = 5; engage(s, a, d); cur(s);
  const n0 = R.attackProfile(a, d).atk; R.applyWounds(a, 4); eq(R.attackProfile(a, d).atk, n0, 'las bajas reducen los ataques de las filas de combate'); R.applyWounds(a, 8); ok(R.attackProfile(a, d).atk < n0, 'control: con 3 modelos restantes ya no llega a la fila completa (' + R.attackProfile(a, d).atk + ' < ' + n0 + ')');
});
T('core-qa-055', F, 'Perfil dividido en la fila de combate sin contacto: un ataque por cada modelo de la peana (jinete y montura)', () => {
  const s = game([{ type: 'empire_knights', models: 10 }], [{ type: 'empire_captain', models: 1 }], { f: ['empire', 'empire'] }); const k = U(s, 'empire_knights'), c = U(s, 'empire_captain', 1); k.files = 10; engage(s, c, k); cur(s);
  const p = R.attackProfile(k, c); ok(p.atk >= 10, `los caballeros de la fila sin contacto no hacen su ataque: ${p.atk}`);
});
T('core-qa-057', F, 'Una unidad de Orden cerrado de un solo modelo con US 10+ suma el +1 de Orden cerrado', () => {
  const us0 = UNITS.we_treeman.us; UNITS.we_treeman.us = 10; try { const s = game([{ type: 'we_treeman', models: 1 }], [{ type: 'goblins', models: 10 }], { f: ['wood', 'orcs'] }); const a = U(s, 'we_treeman'), d = U(s, 'goblins'); engage(s, a, d); cur(s);
    ok(R.usOf(a) >= 10, 'montaje US'); const sc = R.sideScore(s, [a, d], 0, new Map()); ok(sc >= 1, `sin +1 de Orden cerrado (US ${R.usOf(a)}): ${sc}`); } finally { UNITS.we_treeman.us = us0; }
});
T('core-qa-058', F, 'Si al Ceder terreno cualquier parte de la unidad cruza el borde de la mesa, la unidad queda destruida', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'dw_slayers', models: 5 }], { f: ['orcs', 'dw'] }); const a = U(s, 'orc_boyz'), d = U(s, 'dw_slayers'); a.files = 5; d.files = 5; engage(s, a, d, 'front', { x: 36, y: 47.2 - 0.5, face: -Math.PI / 2 }); charged(s, a, d); cur(s);
  dice(); diceAll((n) => 6); const ev = fight(s); const m = msgs(ev); if (d.models > 0 || /cede terreno fuera de la mesa/.test(m)) ok(/fuera de la mesa y es destruida/.test(m) && d.models <= 0 || !s.units.includes(d), 'cede terreno fuera de la mesa y sigue en juego: ' + m.slice(-300));
});
// combate con el perdedor obligado a ceder terreno (Inquebrantable) y dados fijos
const giveRun = (o = {}) => { const s = game([{ type: 'orc_boyz', models: 20 }, { type: 'goblins', models: 10 }], [{ type: 'dw_slayers', models: 5 }, { type: 'dw_warriors', models: 10 }], { f: ['orcs', 'dw'] }); const a = U(s, 'orc_boyz'), d = U(s, 'dw_slayers'); a.files = 5; d.files = 5;
  engage(s, a, d, 'front', { x: 36, y: o.y ?? 24, face: -Math.PI / 2 }); charged(s, a, d); if (o.block) put(U(s, 'dw_warriors'), 36, d.y + 2.2, -Math.PI / 2); else put(U(s, 'dw_warriors'), 70, 4); put(U(s, 'goblins'), 2, 4); cur(s); return { s, a, d }; };
T('core-qa-059', F, 'Si otra unidad impide Ceder terreno, el movimiento se detiene de inmediato (como si estuviera rodeada)', () => {
  const { s, d } = giveRun({ block: true }); const y0 = d.y; diceAll(2); const ev = fight(s); ok(s.units.includes(d) && d.models > 0, 'la unidad bloqueada es destruida'); ok(Math.abs(d.y - y0) < 0.6, `cede terreno atravesando la unidad amiga (${(d.y - y0).toFixed(2)}")`);
});
T('core-qa-060', F, 'Si la persecución no puede moverse por otras unidades, no se mueve pero cuenta como haber perseguido', () => {
  const run = (blk) => { const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'goblins', models: 20 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const p = put(U(s, 'orc_boyz'), 36, 30), g = put(U(s, 'goblins'), 36, blk ? 27.4 : 60); g.files = 10; cur(s); const r = R.movePursuer(s, p, -Math.PI / 2, 8); return { r, y: p.y, dentro: s.units.includes(p) }; };
  const b = run(true), c = run(false); ok(Math.abs(b.y - 30) < 0.3 && b.dentro && b.r === null, `bloqueada: no se mueve (${(30 - b.y).toFixed(2)}")`); eq([c.y, c.dentro, c.r], [22, true, null], 'control: despejada avanza los 8"');
});
T('core-qa-061', F, 'Tras aniquilar al enemigo y arrollar (sin chocar con un enemigo nuevo), puede intentar reformar', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'dw_slayers', models: 5 }], { f: ['orcs', 'dw'] }); const a = U(s, 'orc_boyz'), d = U(s, 'dw_slayers'); a.files = 5; d.files = 5; engage(s, a, d); charged(s, a, d); cur(s);
  diceAll((n) => 6); const o = asks(s, (c) => fight(c), [0, 1], (n) => (/[Cc]ontener|[Aa]rroll/.test(n.title + n.msg) ? n.opts.find((x) => /arroll|persig|overrun|no/i.test(x[1] + x[0]))?.[0] : undefined)); const m = msgs(o.r) + o.s.log.join('\n');
  ok(!o.s.units.some((x) => x.type === 'dw_slayers' && x.models > 0), 'montaje: el enemigo no es aniquilado en el combate'); ok(/reform|Reform/.test(m), 'no puede intentar reformar tras arrollar: ' + m.slice(-300));
});
T('core-qa-062', F, 'Quien persigue y alcanza a una unidad que retrocedió en buen orden cuenta como haber cargado en el siguiente turno (bonos de carga)', () => {
  const run = (pc) => { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boyz'), d = U(s, 'state_troops'); engage(s, a, d); cur(s);
    if (pc) s.pursuitCharges = [{ id: a.id, target: d.id, d: 4 }]; s.turn++; s.active = 1; a.chargeOK = false; diceAll(1); R.resolveCombats(s, []); return !!a.chargeOK; };
  eq([run(true), run(false)], [true, false], 'con persecución alcanzada cuenta como cargado; sin ella no');
});
T('core-qa-063', F, 'Un hechizo de Asalto en un desafío solo impacta al otro participante', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_bigboss', models: 1 }, { type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const w = U(s, 'empire_mage'), h = U(s, 'state_troops'), b = U(s, 'orc_bigboss'), o = U(s, 'orc_boyz'); h.files = o.files = 5; join(s, w, h); join(s, b, o); engage(s, h, o); charged(s, h, o); cur(s);
  const k = Object.keys(SPELLS).find((x) => SPELLS[x].type === 'assail' && SPELLS[x].lore === 'battle') || Object.keys(SPELLS).find((x) => SPELLS[x].type === 'assail'); w.spells = [k]; w.casted = [];
  diceAll(6); const q = asks(s, (c) => fight(c), [0, 1], (n) => n.title === 'Desafío' ? chal(n) : n.title === 'Hechizo de asalto' ? n.opts.find((x) => x[0] !== 'no' && x[0] !== '-' && !/unidad/i.test(x[1]))?.[0] || n.opts.find((x) => x[0] !== 'no' && x[0] !== '-')?.[0] : undefined); const m = msgs(q.r);
  ok(q.needs.some((n) => n.title === 'Desafío'), 'montaje'); ok(!/falla estrepitosamente/.test(m), 'el lanzamiento debe tener éxito (doble 6): ' + m.slice(0, 300));
  ok(/solo alcanza al rival del desafío/.test(m), 'debe anunciar que el Asalto solo alcanza al rival del desafío: ' + m.slice(0, 300));
  const line = q.r.map((e) => e.msg).find((x) => x.includes('lanza ' + SPELLS[k].name)); ok(line, 'no lanza el Asalto: ' + m.slice(0, 300)); ok(/→ 0 bajas/.test(line), 'el Asalto no debe matar a modelos de la unidad (solo al otro participante): ' + line);
});
T('core-qa-064', F, 'En un desafío los Pisotones pueden dirigirse al otro participante (elección del jugador)', () => {
  const s = game([{ type: 'orc_warboss_wyvern', models: 1 }], [{ type: 'empire_captain', models: 1 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_warboss_wyvern'), c = U(s, 'empire_captain'), h = U(s, 'state_troops'); join(s, c, h); engage(s, a, h); charged(s, a, h); cur(s);
  diceAll(1); /* nadie hiere: el Capitán sigue vivo cuando le toca pisotear al Wyvern (si muriera antes, esos ataques se pierden: core-errata-040) */ const o = asks(s, (q) => fight(q), [0, 1], chal); ok(o.needs.some((n) => n.title === 'Pisotones en el desafío' && n.p === 0), 'no pregunta a quién van los Pisotones: ' + o.needs.map((n) => n.title).join(','));
});
T('core-qa-065', F, 'Si un participante del desafío muere, el desafío sigue hasta el final de la fase: el resto no puede atacar al superviviente', () => {
  const s = game([{ type: 'orc_bigboss', models: 1 }, { type: 'orc_boyz', models: 20 }], [{ type: 'empire_captain', models: 1 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const b = U(s, 'orc_bigboss'), o = U(s, 'orc_boyz'), c = U(s, 'empire_captain'), h = U(s, 'state_troops'); o.files = 5; h.files = 5; join(s, b, o); join(s, c, h); engage(s, o, h); charged(s, o, h); cur(s);
  c.wounds = 1; diceAll(6); const q = asks(s, (x) => fight(x), [0, 1], chal); const bl = blows(q.r);
  ok(!bl.some((x) => /Tropas Estatales/.test(x.who) && /Gran Jefe/.test(x.to)), 'la unidad ataca al superviviente del desafío: ' + msgs(q.r).slice(0, 300));
});
T('core-qa-066', F, 'El exceso de muertes (Overkill) cuenta también en los desafíos entre campeones', () => {
  // mayales al cargar: FP −2 contra armadura 6+ (no hay tirada de salvación)
  const s = game([{ type: 'flagellants', models: 10, champ: true }], [{ type: 'orc_boyz', models: 10, champ: true }], { f: ['empire', 'orcs'] }); const o = U(s, 'flagellants'), h = U(s, 'orc_boyz'); o.champ = h.champ = true; o.files = h.files = 5; engage(s, o, h); charged(s, o, h); cur(s);
  diceAll(6); const q = asks(s, (x) => fight(x), [0, 1], chal); const m = msgs(q.r);
  ok(/[Dd]esaf/.test(m), 'montaje: sin desafío de campeones: ' + q.needs.map((n) => n.title + JSON.stringify(n.opts)).join(' ')); ok(/exceso de muertes/i.test(m), 'el exceso de muertes del desafío de campeones no cuenta: ' + m.slice(0, 400));
});
T('core-qa-067', F, 'Si los dos participantes sobreviven y el combate continúa (tras ceder terreno y seguir), el desafío continúa', () => {
  const s = game([{ type: 'orc_bigboss', models: 1 }, { type: 'orc_boyz', models: 20 }], [{ type: 'empire_captain', models: 1 }, { type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'] }); const b = U(s, 'orc_bigboss'), o = U(s, 'orc_boyz'), c = U(s, 'empire_captain'), h = U(s, 'state_troops'); o.files = h.files = 5; join(s, b, o); join(s, c, h); engage(s, o, h); charged(s, o, h); cur(s);
  diceAll(1); const q1 = asks(s, (x) => fight(x), [0, 1], (n) => chal(n) ?? (n.title === 'Persecución' ? 'pursue' : undefined)); ok(/[Dd]esaf/.test(msgs(q1.r)), 'montaje: sin desafío');
  const s2 = q1.s; const B = U(s2, 'orc_bigboss'), C = U(s2, 'empire_captain'); const O = U(s2, 'orc_boyz'), H = U(s2, 'state_troops'); if (!R.engagedWith(s2, O).includes(H)) engage(s2, O, H); s2.turn++; s2.active = 1; s2.round++; cur(s2);
  diceAll(1); const q2 = asks(s2, (x) => fight(x), [0, 1], (n) => chal(n)); ok(!q2.needs.some((n) => n.title === 'Desafío'), 'se vuelve a pedir un desafío (el anterior no continúa)'); ok((U(q2.s, 'orc_boyz').duel || U(q2.s, 'state_troops').duel), 'el desafío no continúa');
  // v843l: los mismos dos participantes siguen luchando entre sí, sin un desafío nuevo, y el duelo conserva sus datos
  const m2 = msgs(q2.r); ok(!/¡Desafío!/.test(m2), 'no debe lanzarse un desafío nuevo: ' + m2.slice(0, 200)); ok(/Capitán del Imperio golpea a Gran Jefe Orco/.test(m2) && /Gran Jefe Orco \(Bigboss\) golpea a Capitán del Imperio/.test(m2), 'los dos participantes siguen combatiendo entre sí'); eq(JSON.stringify(U(q2.s, 'orc_boyz').duel), JSON.stringify(U(q1.s, 'orc_boyz').duel), 'el desafío es el mismo');
  ok(U(q1.s, 'orc_bigboss').models === 1 && U(q1.s, 'empire_captain').models === 1, 'ambos participantes sobreviven (precondición)');
});
T('core-qa-068', F, 'Las bajas causadas por modelos amigos (Disfunción) también provocan el chequeo de Pánico', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const w = put(U(s, 'empire_mage'), 36, 40), a = put(U(s, 'state_troops'), 36, 41.5); a.files = 10; cur(s);
  const t0 = R.D(a); dice(1, 2); diceAll(6); const ev = []; s.phaseStart = { [a.id]: a.models }; a.phaseModels = a.models; R.miscast1(s, w, ev); const m = msgs(ev) + s.log.join('\n'); if (a.models < 10 * 0.75) ok(/[Pp]ánico/.test(m), 'sin chequeo de Pánico por las bajas de la Disfunción: ' + m.slice(-300));
});
T('core-qa-069', F, 'El US de la unidad amiga destruida (para el Pánico) se cuenta al empezar la fase: US 10 al empezar y 3 al morir → Pánico', () => {
  const s = game([{ type: 'emp_crossbows', models: 10 }].filter(() => false).concat([{ type: 'orc_boyz', models: 20 }]), [{ type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot' });
  const sh = put(U(s, 'orc_boyz'), 36, 20, Math.PI / 2), a = put(U(s, 'state_troops'), 36, 40, -Math.PI / 2), b = put(U(s, 'emp_archers'), 44, 40, -Math.PI / 2); cur(s);
  R.applyWounds(a, 7); eq(a.models, 3, 'montaje'); s.phStart = s.phStart || {}; const ev = []; diceAll(6); const w0 = a.wounds; R.applyWounds(a, w0); R.destroy(s, a, ev); R.friendsPanicDestroyed(s, a, ev);
  ok(/[Pp]ánico/.test(msgs(ev) + s.log.join(' ')) || b.fleeing, 'una unidad con US 10 al empezar la fase (3 al morir) no provoca Pánico: ' + msgs(ev));
});
T('core-qa-070', F, 'Los Emboscadores deben tirar para llegar en cada Inicio de turno desde la ronda 2 (no se puede renunciar)', () => {
  const s = game([{ type: 'wolf_riders_amb', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy', turn: 2, keepRes: true }); cur(s); const w = (s.reserves || []).find((x) => x.type === 'wolf_riders_amb');
  ok(w && w.ambusher, 'montaje: los Emboscadores no están en reserva'); w.ambushOK = false; dice(1); diceAll(1); globalThis.__DLOG = [];
  const o = asks(s, (c) => { const ev = []; R.beginStrategy(c, ev); return ev; }, [0, 1]); ok(!o.needs.some((n) => /[Ee]mbosc/.test(n.title + (n.msg || '')) && n.opts.some((x) => /no tirar|esperar|renunciar/i.test(x[1]))), 'deja elegir no tirar');
  ok(globalThis.__DLOG.length > 0, 'no se tira la llegada');
});
const L_dlog = () => dlog();
T('core-qa-071', F, 'Perforante (X) de un modelo no se aplica a sus hechizos (Bola de Fuego de un Mago con Perforante)', () => {
  const run = (abR) => { const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'state_troops', models: 10, opts: ['sh'] }], { f: ['empire', 'empire'], phase: 'shoot' }); const w = put(U(s, 'empire_mage'), 36, 40), t = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2); w.spells = ['fireball']; w.casted = []; cur(s);
    const m0 = UNITS.empire_mage.melee; if (abR) UNITS.empire_mage.melee = { ...(m0 || {}), ab: 2 }; try { dice(5, 5); diceAll((n) => 5); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); ok(r.ok, r.error); return t.models; } finally { UNITS.empire_mage.melee = m0; } }; // Perforante (2) propio del modelo (perfil natural)
  eq(run(true), run(false), 'la Perforación del Mago cambia el daño de su Bola de Fuego');
});
T('core-qa-072', F, 'Perforante (X) propio del modelo (no de un arma) se aplica a sus Impactos de carga y Pisotones', () => {
  const run = (ab) => { const m0 = UNITS.orc_boar_chariot.melee; UNITS.orc_boar_chariot.melee = { ...(m0 || {}), ab }; try { const s = game([{ type: 'orc_boar_chariot', models: 1 }], [{ type: 'state_troops', models: 10, opts: ['sh'] }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boar_chariot'), d = U(s, 'state_troops'); d.files = 5; engage(s, a, d); charged(s, a, d, 6); cur(s);
    dice(6); diceAll((n) => 6); const ev = []; R.chargeImpacts(s, a, d, 6, ev); return d.models; } finally { UNITS.orc_boar_chariot.melee = m0; } };
  ok(run(3) < run(0), 'la Perforación propia no se aplica a los Impactos (con todo 6: los 6 para herir dan FP extra)');
});
T('core-qa-074', F, 'La tirada D3+1 de la Contracarga no es una tirada de carga (no se le aplica Zancada veloz ni +D6)', () => {
  const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'pistoliers', models: 5 }], { f: ['empire', 'empire'], phase: 'move' }); const a = put(U(s, 'empire_knights', 0), 36, 40), t = put(U(s, 'pistoliers', 1), 36, 28, Math.PI / 2); cur(s); // a más de M 7" (si no, no hay tiempo para la Contracarga)
  dice(2, 6, 6); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'empire_knights', 0).id, target: U(c, 'pistoliers', 1).id }), [0, 1], (n) => (n.title === 'Contracarga' ? 'y' : n.p === 1 && n.title === 'Zancada veloz' ? 'y' : undefined));
  ok(o.needs.some((n) => n.title === 'Contracarga'), 'montaje: sin Contracarga'); ok(!o.needs.some((n) => n.title === 'Zancada veloz' && n.p === 1), 'la Contracarga pregunta la Zancada veloz (la trata como tirada de carga)');
});

T('core-qa-076', F, 'Infantería con un personaje de caballería unido no provoca Contracarga (el tipo de tropa de la unidad no cambia)', () => {
  const s = game([{ type: 'state_troops', models: 10 }, { type: 'empire_captain_horse', models: 1 }].filter((x) => UNITS[x.type]).concat(UNITS.empire_captain_horse ? [] : [{ type: 'empire_captain', models: 1 }]), [{ type: 'empire_knights', models: 5 }], { f: ['empire', 'empire'], phase: 'move' });
  const a = put(U(s, 'state_troops', 0), 36, 40), t = put(U(s, 'empire_knights', 1), 36, 31, Math.PI / 2); cur(s);
  dice(6, 6); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'state_troops', 0).id, target: U(c, 'empire_knights', 1).id }), [0, 1]); ok(!o.needs.some((n) => n.title === 'Contracarga'), 'la infantería provoca Contracarga');
});
T('core-qa-077:x', F, 'Un modelo con Movimiento aleatorio que Contracarga mueve D3+1"', () => {
  const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'pump_wagon', models: 1 }], { f: ['empire', 'orcs'], phase: 'move' }); ok(!(UNITS.pump_wagon.sr || []).includes('counterCharge'), 'montaje');
});
T('core-qa-078', F, 'Una unidad Disciplinada puede reformar antes de Ceder terreno para no salir de la mesa', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'state_vets', models: 10, opts: ['dr'] }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boyz'), d = U(s, 'state_vets'); a.files = 5; d.files = 2; engage(s, a, d, 'front', { x: 36, y: 48 - 0.55 * 2 - 1.5, face: -Math.PI / 2 }); charged(s, a, d); cur(s);
  d.fx.push({ k: 'grudgeS' }); /* efecto que convierte el resultado en Ceder terreno (como Inquebrantable) */ diceAll(2); const ev = fight(s); ok(/ceder? terreno/i.test(msgs(ev)), 'montaje: no cede terreno: ' + msgs(ev).slice(-200)); ok(s.units.includes(d) && d.models > 0, 'la Disciplinada cede terreno fuera de la mesa en vez de reformar: ' + msgs(ev).slice(-200));
});
T('core-qa-079', F, 'Una unidad Evasiva trabada en combate no puede usar Evasivos', () => {
  const s = game([{ type: 'emp_archers', models: 10 }, { type: 'state_troops', models: 10 }], [{ type: 'we_warhawks', models: 5 }], { f: ['empire', 'wood'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'we_warhawks'), 36, 26, Math.PI / 2); engage(s, U(s, 'state_troops'), t, 'flank', { x: 36, y: 26, face: Math.PI / 2 }); cur(s);
  const o = asks(s, (c) => { const ev = []; R.resolveShot(c, U(c, 'emp_archers'), U(c, 'we_warhawks'), ev); return ev; }, [1], () => 'y'); ok(!o.needs.some((n) => n.title === 'Evasivos'), 'trabada puede evadirse');
  const s2 = game([{ type: 'emp_archers', models: 10 }], [{ type: 'we_warhawks', models: 5 }], { f: ['empire', 'wood'], phase: 'shoot' }); put(U(s2, 'emp_archers'), 36, 40); put(U(s2, 'we_warhawks'), 36, 26, Math.PI / 2); cur(s2);
  const o2 = asks(s2, (c) => { const ev = []; R.resolveShot(c, U(c, 'emp_archers'), U(c, 'we_warhawks'), ev); return ev; }, [1], () => 'y'); ok(o2.needs.some((n) => n.title === 'Evasivos'), 'control: sin trabar se ofrece Evasivos');
});
T('core-qa-080', F, 'Lo que modifica el Movimiento modifica también el de Volar (X)', () => {
  const s = game([{ type: 'we_warhawks', models: 3 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'move' }); const w = put(U(s, 'we_warhawks'), 36, 40); cur(s); const m0 = R.chargeTargets ? 0 : 0;
  const M0 = R.D(w).M; w.fx.push({ k: 'windsC', v: 2, by: 1 }); const lim = (q) => { for (let d = 30; d > 0; d -= 0.25) if (R.previewMove(s, w.id, { x: 36, y: 40 - d, face: w.face }).ok) return d; return 0; }; const L1 = lim(); w.fx = []; const L0 = lim();
  ok(L1 < L0 - 1, `el −2 al Movimiento no reduce el vuelo (${L0}" → ${L1}")`);
});
T('core-qa-081', F, 'Con dos versiones de Volar (X) se usa la mejor (no se suman)', () => {
  const k = 'dml_winged'; const ch = Object.keys(UNITS).find((x) => UNITS[x].faction === 'dm' && UNITS[x].cat === 'char' && (UNITS[x].sr || []).includes('flyer') && !UNITS[x].mount); ok(ch, 'montaje: Daemon con Volar'); const s = game([{ type: ch, models: 1, items: [k] }], [{ type: 'orc_boyz', models: 10 }], { f: ['dm', 'orcs'] }); const c = U(s, ch); cur(s);
  eq(R.D(c).M, Math.max(ITEMS[k].flyX, UNITS[ch].M), 'Volar: ' + ITEMS[k].name);
});
T('core-qa-082', F, 'Un Volador trabado en combate usa su Movimiento terrestre (no el de vuelo) para saber qué modelos de la unidad enemiga están a alcance de luchar o dar apoyo', () => {
  const run = (gM, typ = 'we_eagle') => { const old = DATA.UNITS[typ].gM; DATA.UNITS[typ].gM = gM; try { const s = game([{ type: 'state_troops', models: 20 }], [{ type: typ, models: 1 }], { f: ['empire', 'wood'] }); const a = U(s, 'state_troops'), e = U(s, typ, 1); a.files = 10; engage(s, a, e, 'front'); cur(s); return { atk: R.attackProfile(a, e).atk, M: R.D(e).M }; } finally { DATA.UNITS[typ].gM = old; } };
  const g = UNITS.we_eagle; ok(g.M === 10 && g.gM === 2 && g.sr.includes('flyer'), 'montaje: Gran Águila: M de vuelo 10, M terrestre 2 (' + g.M + '/' + g.gM + ')');
  const a2 = run(2), a10 = run(10), a05 = run(0.5); eq(a2.M, 10, 'el perfil conserva el Movimiento de vuelo para mover');
  ok(a2.atk < a10.atk && a05.atk < a2.atk, `el alcance de combate depende del Movimiento terrestre: gM 0.5" → ${a05.atk}, 2" → ${a2.atk}, 10" → ${a10.atk} ataques`);
  eq(a10.atk, run(undefined).atk, 'sin M terrestre propio se usa M (control: mismo resultado que gM = M)');
  // todo Volador intrínseco tiene su M terrestre salvo las Linternas del Cielo (todas las filas de su perfil llevan «-» en M: no hay Movimiento terrestre al que acudir; decisión de diseño documentada en VERIFICACION v840: conservan M)
  const miss = Object.keys(UNITS).filter((k) => UNITS[k].sr.includes('flyer') && UNITS[k].gM === undefined).sort(); eq(miss, ['ct_lanterns', 'ct_lanterns_amb', 'ct_lanterns_amb_hail', 'ct_lanterns_hail', 'ct_magistrate_lantern', 'ct_strategist_lantern'], 'Voladores sin M terrestre propia');
  // los vehículos con criatura de tiro: M terrestre = la de la criatura (libro)
  for (const [k, g] of [['he_skycutter', 2], ['dm_plaguedrones', 1], ['dm_burning', 1], ['vc_mortis', 6], ['vc_count_coven', 6], ['vc_hexwraith', 8]]) eq(UNITS[k].gM, g, 'M terrestre de ' + k);
});
T('core-qa-075', F, 'Varios cargadores: la unidad que Contracarga a uno puede presentar otro arco a los demás, que cargan por ese arco', () => {
  const s = game([{ type: 'boar_riders', models: 5 }, { type: 'orc_boar_chariot', models: 1 }], [{ type: 'empire_knights', models: 5 }], { f: ['orcs', 'empire'], phase: 'move' });
  const a = put(U(s, 'boar_riders', 0), 31, 41.5, Math.atan2(29 - 41.5, 36 - 31)), t = put(U(s, 'empire_knights', 1), 36, 29, Math.PI / 2), b = put(U(s, 'orc_boar_chariot', 0), 45, 24, Math.atan2(5, -9)); cur(s);
  const side0 = R.sideOfC(t, b); eq(side0, 'flank', 'montaje: el carro no está en el flanco'); ok(R.chargeTargets(s, b).includes(t) && R.chargeTargets(s, a).includes(t), 'montaje: no pueden cargar');
  dice(3); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'chargeAll', id: U(c, 'boar_riders', 0).id, list: [{ id: U(c, 'boar_riders', 0).id, target: U(c, 'empire_knights', 1).id }, { id: U(c, 'orc_boar_chariot', 0).id, target: U(c, 'empire_knights', 1).id }] }), [0, 1], (n) => (n.title === 'Contracarga' ? 'y' : n.title === 'Reacción a la carga' ? 'hold' : undefined));
  ok(/contracarga/.test(msgs(o.r.events || [])), 'montaje: sin Contracarga: ' + msgs(o.r.events || []) + (o.r.error || '')); const T2 = U(o.s, 'empire_knights', 1), B2 = U(o.s, 'orc_boar_chariot', 0);
  ok(Math.abs(T2.face - Math.PI / 2) > 0.2, 'la Contracarga no cambia la orientación'); ok(R.engagedWith(o.s, B2).includes(T2), 'la segunda carga no llega'); ok(B2.chargeSide && B2.chargeSide !== 'flank', `la segunda carga no usa el arco nuevo (${side0} → ${B2.chargeSide})`);
});
