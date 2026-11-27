// v835 — Q/A de la FAQ del Core 083-170 (rules/new/faq_core.txt)
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const F = 'rules/new/faq_core.txt';
const P = (id, why) => N(id, why + ' — no automatizado en esta pasada', F, true);
const issues = (army, list = 'grand', lim = 2000) => DATA.armyIssues(army, lim, 'open', list);
T('core-qa-083', F, 'Impactos de carga de un perfil dividido: los hace la montura/carro, no el jinete (salvo Impactos propios del jinete)', () => {
  const s = game([{ type: 'orc_boar_chariot', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_boar_chariot'), d = U(s, 'state_troops', 1); engage(s, a, d); charged(s, a, d, 6); cur(s);
  dice(3); diceAll(6); const ev = []; R.chargeImpacts(s, a, d, 6, ev); const m = msgs(ev); eq((m.match(/Impactos de carga/g) || []).length, 1, 'más de una tanda de Impactos');
});
T('core-qa-084', F, 'Impactos y Pisotones no se dirigen al campeón salvo que la unidad tenga menos de 5 modelos de tropa', () => {
  const run = (n) => { const s = game([{ type: 'orc_boar_chariot', models: 1 }], [{ type: 'state_troops', models: n, champ: true }], { f: ['orcs', 'empire'] }); const d = U(s, 'state_troops', 1); d.champ = true; d.models = d.wounds = d.startModels = n; cur(s); s.log = []; diceAll(6); const r = R.woundAndSave(s, d, n, 10, 6, { alloc: true }); return { champLog: /campeón/.test(s.log.join(' ')), through: r.through, champ: !!d.champ, models: d.models }; };
  const a10 = run(10), a4 = run(4);
  ok(!a10.champLog, 'con 10 modelos el campeón recibe un impacto'); ok(a4.champLog, 'con 4 modelos (menos de 5 de tropa) el campeón no recibe su impacto');
  // v843l: el efecto real, no solo el texto: con 10 modelos los 10 impactos pasan a la tropa y el campeón sigue vivo; con 4 modelos uno de los 4 lo absorbe el campeón (que cae) y a la tropa solo llegan 3
  eq(a10.through, 10, 'con 10 modelos todos los impactos van a la tropa'); ok(a10.champ, 'con 10 modelos el campeón sigue en la unidad'); eq(a4.through, 3, 'con 4 modelos un impacto lo recibe el campeón'); ok(!a4.champ, 'con 4 modelos el campeón recibe el impacto y cae');
});
T('core-qa-085', F, 'Frenesí/Impetuoso con dos M (Volar): debe usar la mayor para saber si está obligado a declarar', () => {
  const s = game([{ type: 'orc_warboss_wyvern', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const a = put(U(s, 'orc_warboss_wyvern'), 36, 44), t = U(s, 'state_troops', 1); cur(s); const M = R.D(a).M;
  t.x = 36; t.y = 44 - (GEOM.dims(a).d + GEOM.dims(t).d) / 2 - (M + 6 + 2); t.face = Math.PI / 2; cur(s); ok(R.chargeTargets(s, a, true).includes(t), 'con Volar no cuenta como posible carga obligada a M+6+3');
});
T('core-qa-086', F, 'Frenesí no acumulable: dos fuentes de Frenesí siguen dando +1 A', () => {
  const s = game([{ type: 'woc_berserkers', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'] }); const a = U(s, 'woc_berserkers'), d = U(s, 'state_troops', 1); engage(s, a, d); charged(s, a, d, 4); cur(s);
  ok(R.D(a).sr.includes('frenzy'), 'montaje: sin Frenesí'); const n0 = R.attackProfile(a, d).atk; a.fx.push({ k: 'lust', by: 0 }); const n1 = R.attackProfile(a, d).atk; eq(n1, n0, 'el segundo Frenesí suma ataques');
});
T('core-qa-088', F, 'Fuerza de Unidad para el Miedo: solo cuenta la de los modelos que causan Miedo (un personaje unido sin Miedo no suma; con Miedo, sí)', () => {
  const run = (ch, atkN) => { const s = game([{ type: 'tk_cohort', models: 5 }, { type: ch, models: 1 }], [{ type: 'state_troops', models: atkN }], { f: ['tk', 'empire'], phase: 'move' }); const H = U(s, 'tk_cohort', 0), C = U(s, ch, 0), A = U(s, 'state_troops', 1); put(H, 36, 24, Math.PI / 2); put(C, 36, 30); eq(R.joinCheck(s, C, H), null, 'montaje: ' + ch + ' puede unirse'); join(s, C, H); R.syncJoined(s); put(A, 36, 24 + GEOM.dims(H).d / 2 + 4 + GEOM.dims(A).d / 2, -Math.PI / 2); s.active = 1; cur(s); s.phase = 'move';
    const info = { fear: R.fearUS(H), total: R.usOf(H), host: H.models * R.D(H).us, ch: R.D(C).us, atk: R.usOf(A) }; dice(1, 1, 6, 6, 6, 6); diceAll(3); const r = R.apply(s, { t: 'charge', id: A.id, target: H.id }); return { info, ok: r.ok, tested: !!A.fearTested }; };
  ok(DATA.UNITS.tk_cohort.sr.includes('fear') && !DATA.UNITS.tk_archnecro.sr.includes('fear') && DATA.UNITS.tk_king.sr.includes('fear'), 'montaje: la Cohorte causa Miedo, el Archinecrotecto no, el Rey Funerario sí');
  const a = run('tk_archnecro', 20), b = run('tk_king', 20); eq(a.info.fear, a.info.host, 'personaje sin Miedo: la FU para el Miedo es solo la de la Cohorte (' + a.info.host + ' de ' + a.info.total + ')'); eq(b.info.fear, b.info.total, 'personaje con Miedo: la FU incluye al personaje'); eq([a.info.atk, b.info.atk], [20, 20], 'montaje: el cargador tiene FU 20');
  ok(a.ok && !a.tested, 'FU 20 no es menor que la del modelo que causa Miedo (20): no hace el chequeo de Miedo (con la FU total, 21, sí lo haría)'); ok(b.ok && b.tested, 'con el Rey Funerario (FU total 21 > 20) el cargador hace el chequeo de Miedo');
});
T('core-qa-090', F, 'Unidad con Mover a través de cobertura y personaje unido sin ella: se mueve a la velocidad del más lento', () => {
  const s = game([{ type: 'we_glade_guard', models: 10 }, { type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'empire'], phase: 'move' }); const g = put(U(s, 'we_glade_guard'), 36, 40); s.terrain.push({ id: 'f', kind: 'forest', x: 36, y: 34, w: 14, h: 14 }); cur(s);
  const lim = () => { for (let d = 12; d > 0; d -= 0.25) if (R.previewMove(s, g.id, { x: 36, y: 40 - d, face: g.face }).ok) return d; return 0; }; const L0 = lim(); join(s, U(s, 'empire_captain'), g); cur(s); const L1 = lim(); ok(L1 < L0, `el personaje sin Mover a través de cobertura no frena a la unidad (${L0}" → ${L1}")`);
});
T('core-qa-091', F, 'Arma con Pesada y Disparo rápido: se anulan, queda el −1 por mover y disparar', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 30, Math.PI / 2); cur(s);
  const need = (sr, moved) => { const r0 = UNITS.emp_archers.ranged, sr0 = r0.sr; r0.sr = sr; a.moved = moved; try { diceAll(1); const ev = []; R.resolveShot(s, a, t, ev); const m = / tiros?, (\d)\+/.exec(msgs(ev)); return m ? +m[1] : null; } finally { r0.sr = sr0; a.moved = false; } };
  eq(need(['ponderous', 'quickShot'], true) - need([], false), 1, 'Pesada + Disparo rápido al mover');
});
T('core-qa-094', F, 'Una unidad desplegada con Exploradores no puede hacer movimiento de Vanguardia', () => {
  const k = Object.keys(UNITS).find((x) => (UNITS[x].sr || []).includes('scouts') && (UNITS[x].sr || []).includes('vanguard')) || Object.keys(UNITS).find((x) => (UNITS[x].sr || []).includes('scouts'));
  const s = game([{ type: k, models: Math.max(5, UNITS[k].min) }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction, 'orcs'], phase: 'deploy' }); const u = U(s, k); u.scouted = true; withSr(k, ['vanguard'], () => { const ev = []; const y0 = u.y; R.vanguardMoves && R.vanguardMoves(s, ev); eq(u.y, y0, 'la unidad de Exploradores hace Vanguardia'); });
});
T('core-qa-099', F, 'Los que causan Terror causan Miedo a quienes causan Miedo', () => {
  const k = 'demigryph_knights'; const s = game([{ type: k, models: 2 }], [{ type: 'we_lord_dragon', models: 1 }], { f: ['empire', 'wood'] }); const a = U(s, k), d = U(s, 'we_lord_dragon', 1); engage(s, d, a); charged(s, d, a); cur(s); ok(R.usOf(a) < R.usOf(d), 'montaje US');
  dice(6, 6); diceAll(3); const ev = fight(s); ok(/[Mm]iedo|tiembla/.test(msgs(ev)), 'quien causa Miedo no teme al que causa Terror: ' + msgs(ev).slice(0, 160));
});
T('core-qa-102', F, 'Un personaje sin Vanguardia unido a una unidad con ella no puede hacer el movimiento de Vanguardia con ella', () => {
  const s = game([{ type: 'tk_skirmishers', models: 10 }, { type: 'tk_king', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'], phase: 'deploy', join: false }); const u = U(s, 'tk_skirmishers'), c = U(s, 'tk_king'); join(s, c, u); cur(s);
  ok(!(R.D(c).sr || []).includes('vanguard'), 'montaje'); const o = asks(s, (q) => { const ev = []; R.vanguardMoves(q, ev); return ev; }, [0, 1]); ok(!o.needs.some((n) => /[Vv]anguard/.test(n.title) && n.opts.some((x) => x[0] === U(o.s, 'tk_skirmishers').id)), 'la unidad con un personaje sin Vanguardia la hace');
});
T('core-qa-105', F, 'Centro de una unidad de Escaramuzadores: el punto equidistante de los extremos; con plantillas, el agujero central puede ponerse sobre el modelo más cercano al centro', () => {
  const k = Object.keys(UNITS).find((x) => UNITS[x].sr.includes('skirmish') && UNITS[x].min >= 6 && !UNITS[x].sr.includes('flyer')); const g = game([{ type: k, models: UNITS[k].min }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction === 'merc' ? 'empire' : UNITS[k].faction, 'orcs'] }); const u = put(U(g, k, 0), 36, 30); u.sp = 1; cur(g);
  const P = R.modelPts(u), ext = (f) => f(...P.map((p) => p.x)), eY = (f) => f(...P.map((p) => p.y)), mid = { x: (ext(Math.min) + ext(Math.max)) / 2, y: (eY(Math.min) + eY(Math.max)) / 2 }; ok(Math.hypot(mid.x - u.x, mid.y - u.y) < 0.2, 'montaje: el punto equidistante de los extremos es el centro del bloque (' + mid.x.toFixed(2) + ',' + mid.y.toFixed(2) + ' vs ' + u.x + ',' + u.y + ')');
  const tc = R.tplCenter(u), near = P.reduce((b, p) => (Math.hypot(p.x - mid.x, p.y - mid.y) < Math.hypot(b.x - mid.x, b.y - mid.y) ? p : b), P[0]); ok(P.some((p) => Math.hypot(p.x - tc.x, p.y - tc.y) < 1e-9), 'el centro de la plantilla es la posición de un modelo de la unidad'); eq([+tc.x.toFixed(3), +tc.y.toFixed(3)], [+near.x.toFixed(3), +near.y.toFixed(3)], 'es el modelo más cercano al centro');
  // unidad que no es de Escaramuzadores: el centro es el del bloque
  const o = U(g, 'orc_boyz', 1); put(o, 20, 10); eq([R.tplCenter(o).x, R.tplCenter(o).y], [o.x, o.y], 'una unidad sin Escaramuzadores usa el centro del bloque');
});
T('core-qa-108', F, 'Escaramuzadores trabados no tienen flanco ni retaguardia', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'emp_archers', models: 10 }], { f: ['empire', 'empire'] }); const a = U(s, 'state_troops'), d = U(s, 'emp_archers', 1); engage(s, a, d, 'rear'); cur(s); eq(R.sideOfC(d, a), 'front', 'tiene retaguardia');
});
T('core-qa-114', F, 'Personaje en carro: no sustituye a un tripulante; el carro conserva a toda su dotación (Ataques y Heridas del jinete + los del carro)', () => {
  for (const [c, b, m, f1, f2] of [['woc_lord_chariot', 'woc_lord', 'woc_chariot', 'woc', 'empire'], ['bm_beastlord_tusk', 'bm_beastlord', 'bm_tuskchariot', 'bm', 'empire']]) {
    eq([UNITS[c].A, UNITS[c].W], [UNITS[b].A + UNITS[m].A, UNITS[b].W + UNITS[m].W], `${UNITS[c].name}: A y Heridas = jinete + carro completo`);
    const s = game([{ type: c, models: 1 }], [{ type: 'state_troops', models: 10 }], { f: [f1, f2] }); const a = U(s, c, 0), d = U(s, 'state_troops', 1); engage(s, a, d); cur(s); const P = R.attackProfile(a, d), tot = P.parts.reduce((q, x) => q + x.n, 0), rider = P.parts.filter((x) => !x.crew).reduce((q, x) => q + x.n, 0), crew = P.parts.filter((x) => x.crew).reduce((q, x) => q + x.n, 0);
    eq([tot, rider, crew], [UNITS[c].A, UNITS[b].A, UNITS[m].A], `${UNITS[c].name}: ataques del jinete (${UNITS[b].A}) y de toda la tripulación y bestias (${UNITS[m].A}) por separado`);
  }
});
T('core-qa-116', F, 'Personaje con 6+ en un carro con 4+: elige la mejor (no está obligado a la del carro)', () => {
  const k = Object.keys(UNITS).find((x) => UNITS[x].cat === 'char' && UNITS[x].mountSv != null); ok(k, 'sin personaje en carro/monstruo con mountSv'); const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction === 'merc' ? 'empire' : UNITS[k].faction, 'orcs'] }); const u = U(s, k); cur(s); ok(R.svOf(u) <= Math.min(UNITS[k].mountSv, 7), 'no usa la mejor');
});
T('core-qa-118', F, 'Un personaje con peana de varias casillas dentro de una unidad no reduce su bonificación por filas', () => {
  for (const [h, n] of [['bm_ungor', 20], ['bm_warherd', 20]]) {
    const mk = (join_) => { const s = game([{ type: h, models: n }, { type: 'bm_doombull', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['bm', 'empire'], phase: 'move' }); const H = U(s, h, 0), C = U(s, 'bm_doombull', 0); H.files = 5; put(H, 36, 40); put(C, 36, 46); cur(s); if (join_) { eq(R.joinCheck(s, C, H), null, 'montaje: se une'); join(s, C, H); R.syncJoined(s); } return { H, rb: R.rankBonus(H), ranks: GEOM.dims(H).ranks, w: GEOM.dims(H).w }; };
    const a = mk(false), b = mk(true); ok(UNITS.bm_doombull.baseW >= 50 && UNITS[h].baseW <= 25, 'montaje: peana del personaje (' + UNITS.bm_doombull.baseW + ' mm) mayor que la de la tropa'); eq([b.rb, b.ranks], [a.rb, a.ranks], `${UNITS[h].name}: el bonus por filas (${a.rb}) y las filas (${a.ranks}) no cambian al unirse el personaje`);
  }
});
T('core-qa-120', F, 'Una unidad con un personaje de otro tipo de tropa no gana las reglas de ese tipo de tropa', () => {
  const s = game([{ type: 'state_troops', models: 10 }, { type: 'empire_general_peg', models: 1 }, { type: 'empire_general', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const u = put(U(s, 'state_troops'), 36, 40), peg = put(U(s, 'empire_general_peg'), 36, 44), c = put(U(s, 'empire_general'), 38, 44); cur(s); ok(/Volar/.test(R.joinCheck(s, peg, u)), 'el general alado no se une a una unidad sin Volar'); eq(R.joinCheck(s, c, u), null, 'montaje: el general a pie sí puede unirse'); const sr0 = R.D(u).sr.slice(); join(s, c, u); cur(s); eq(R.D(u).tt, 'regInf', 'la unidad sigue siendo infantería de regimiento'); eq(R.D(u).sr, sr0, 'las reglas de la unidad no cambian por unirse un personaje de otro tipo de tropa'); no(R.D(u).sr, 'rally'); no(R.D(u).sr, 'flyer');
});
T('core-qa-122', F, 'Un personaje puede colocarse entre el grupo de mando', () => { const s = game([{ type: 'state_troops', models: 10, std: true, mus: true, champ: true }, { type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); const u = U(s, 'state_troops'); u.std = u.mus = u.champ = true; const c = U(s, 'empire_captain'); join(s, c, u); cur(s); const L = R.frontLayout(u);
  eq(L, { nF: 5, champ: 2, std: 1, mus: 3, chars: { [c.id]: 0 }, at: {} }, 'el personaje ocupa un hueco de la fila delantera (posición 0) junto al grupo de mando (std 1, campeón 2, músico 3)'); const L0 = R.frontLayout(Object.assign(u, { joined: [] })); eq(L0.chars, {}, 'control: sin personaje unido no hay personajes en la fila'); });
T('core-qa-126', F, 'Personaje con Banda de guerra en una Banda de guerra con bonificación por filas: su Liderazgo (y su alcance de mando) aumentan', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }, { type: 'orc_bigboss', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const u = U(s, 'orc_boyz'), c = U(s, 'orc_bigboss'); u.files = 5; join(s, c, u); cur(s); ok(R.rankBonus(u) >= 1, 'montaje');
  const cr0 = R.commandRange(c); const L0 = UNITS.orc_bigboss.Ld; ok(cr0 > (L0 >= 9 ? 12 : L0 >= 8 ? 9 : 6) - 0.01, 'alcance de mando ' + cr0); ok(R.ldOf(s, u) > R.D(u).Ld, 'sin el +Ld de la Banda de guerra');
});
T('core-qa-128', F, 'Se puede disparar a un personaje solitario aunque otra unidad enemiga a más de 3" de él esté más cerca', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_bigboss', models: 1 }, { type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), c = put(U(s, 'orc_bigboss', 1), 36, 24, Math.PI / 2), o = put(U(s, 'orc_boyz', 1), 50, 34, Math.PI / 2); cur(s);
  eq(R.shootCheck(s, a, c), null, 'no puede disparar al personaje'); put(o, 36 + 2 + 3, 28, Math.PI / 2); cur(s); ok(/protegido/.test(R.shootCheck(s, a, c)), 'control: con la unidad de 5+ a 3" el personaje sí está protegido');
});
T('core-qa-134', F, 'Las reglas del arma del jinete no se aplican a los ataques de la montura', () => {
  const k = Object.keys(UNITS).find((x) => UNITS[x].faction === 'empire' && UNITS[x].cat === 'char' && UNITS[x].mountAtk); const s = game([{ type: k, models: 1, items: ['ogre_blade'].filter((x) => ITEMS[x]) }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = U(s, k), e = U(s, 'orc_boyz', 1); engage(s, u, e); cur(s);
  const p = R.attackProfile(u, e); eq(p.mS ?? R.D(u).mountAtk.S, R.D(u).mountAtk.S, 'la montura usa la F del arma del jinete');
});
T('core-qa-135', F, 'Armas de monstruo que hacen uno (o uno adicional) de sus ataques: no más de uno por turno', () => {
  const s = game([{ type: 'tk_necrosphinx', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['tk', 'empire'] }); const a = U(s, 'tk_necrosphinx'), d = U(s, 'state_troops', 1); d.files = 5; engage(s, a, d); cur(s);
  diceAll(4); const o = asks(s, (q) => fight(q), [0, 1], (n) => (/Aguij/.test(n.title) ? 'y' : undefined)); eq(blows(o.r, 'Necroesfinge').filter((x) => x.n === 1).length, 2, 'aguijón y golpe decapitador: uno cada uno');
});
T('core-qa-136', F, 'Un modelo con dos armas de mano puede luchar con una sola (si hay un beneficio)', () => {
  const k = Object.keys(UNITS).find((x) => (UNITS[x].melee || {}).extra > 0 && UNITS[x].cat !== 'char' && !(UNITS[x].sr || []).includes('gromrilW')); ok(k, 'montaje: una unidad con dos armas de mano'); const sr0 = UNITS[k].sr; UNITS[k].sr = [...sr0, 'gromrilW']; try { const s = game([{ type: k, models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction, 'orcs'] }); const a = U(s, k), d = U(s, 'orc_boyz', 1); engage(s, a, d); cur(s);
  diceAll(1); const o = asks(s, (q) => fight(q), [0]); ok(o.needs.some((n) => n.title === 'Dos armas de mano'), 'no se ofrece luchar con una sola'); } finally { UNITS[k].sr = sr0; }
  // sin ninguna regla que dé un beneficio por una sola arma, no se ofrece (no hay nada que ganar)
  { const s = game([{ type: k, models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction, 'orcs'] }); const a = U(s, k), d = U(s, 'orc_boyz', 1); engage(s, a, d); cur(s); diceAll(1); const o = asks(s, (q) => fight(q), [0]); ok(!o.needs.some((n) => n.title === 'Dos armas de mano'), 'sin beneficio no se pregunta'); }
});
T('core-qa-137', F, 'Un arma de proyectil no se usa en combate', () => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = U(s, 'emp_archers'), e = U(s, 'orc_boyz', 1); engage(s, e, a); cur(s); eq(R.shootCheck(s, a, e), 'Trabada en combate', 'dispara trabada en combate'); const s2 = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a2 = put(U(s2, 'emp_archers'), 36, 40), e2 = put(U(s2, 'orc_boyz', 1), 36, 30, Math.PI / 2); cur(s2); eq(R.shootCheck(s2, a2, e2), null, 'sin trabar dispara (control)'); });
T('core-qa-138', F, 'US de una máquina de guerra con Heridas distintas de las de su dotación: se usan las de la dotación', () => { const k = Object.keys(UNITS).find((x) => UNITS[x].cat === 'mach' && UNITS[x].crewW && UNITS[x].crewW !== UNITS[x].W); ok(k, 'montaje: una máquina con Heridas distintas a las de su dotación'); const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction, 'orcs'] }); eq(R.usOf(U(s, k)), UNITS[k].crewW, 'US'); });
T('core-qa-139', F, 'Un cañón no apunta por encima de bosques o colinas', () => {
  const s = game([{ type: 'great_cannon', models: 1 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'great_cannon'), 36, 44), t = put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2); s.terrain.push({ id: 'h', kind: 'hill', x: 36, y: 32, w: 10, h: 4 }); cur(s);
  ok(R.shootCheck(s, c, t, { wpn: 0 }), 'el cañón dispara por encima de la colina');
});
T('core-qa-141', F, 'Un cañón no dispara a una unidad enemiga trabada con una amiga', () => { const s = game([{ type: 'great_cannon', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'great_cannon'), 36, 44), t = U(s, 'orc_boyz', 1); engage(s, U(s, 'state_troops'), t, 'front', { x: 36, y: 20, face: Math.PI / 2 }); put(c, 36, 44); cur(s); eq(R.shootCheck(s, c, t, { wpn: 0 }), 'Objetivo trabado en combate', 'dispara al combate'); const s2 = game([{ type: 'great_cannon', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c2 = put(U(s2, 'great_cannon'), 36, 44), t2 = put(U(s2, 'orc_boyz', 1), 36, 20, Math.PI / 2); cur(s2); eq(R.shootCheck(s2, c2, t2, { wpn: 0 }), null, 'sin combate sí dispara (control)'); });
T('core-qa-149', F, 'Un hechizo sobre una Unidad regimental no afecta a sus Destacamentos (ni al revés)', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 20 }, { type: 'emp_archers', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' }); const w = put(U(s, 'empire_mage'), 36, 40), r = put(U(s, 'state_troops'), 36, 36), d = put(U(s, 'emp_archers'), 42, 36); d.detOf = r.id; cur(s);
  R.applySpell(s, w, 'oaken_shield', r, []); R.applySpell(s, w, 'shield_saph', r, []); eq(R.wardOf(d), 0, 'el destacamento recibe el hechizo de su regimiento');
});
T('core-qa-150', F, 'Tamaño de mesa: los mínimos (30"x44" hasta 1.000 pts, 44"x60" de 1.001 a 3.000, 44"x90" más) son recomendaciones; la mesa normal es 48"x72" y se puede usar siempre', () => {
  const mn = (l) => R.tableFor('min', l), sd = (l) => R.tableFor('std', l);
  eq([mn(500), mn(1000), mn(1001), mn(2000), mn(3000), mn(3001), mn(5000)].map((t) => [t.w, t.h]), [[44, 30], [44, 30], [60, 44], [60, 44], [60, 44], [90, 44], [90, 44]], 'tamaños mínimos por puntos');
  eq([500, 1000, 1500, 2000, 3000, 4000].map((l) => [sd(l).w, sd(l).h]), Array(6).fill([72, 48]), 'la mesa normal (4\' x 6\') no depende de los puntos');
  for (const [mode, l] of [['std', 1000], ['min', 1000], ['std', 3500], ['min', 3500]]) { const g = R.createGame({ seed: 1, armies: [DATA.PRESETS?.empire?.[1000] || [{ type: 'state_troops', models: 10 }], DATA.PRESETS?.orcs?.[1000] || [{ type: 'orc_boyz', models: 10 }]], factions: ['empire', 'orcs'], limit: l, tsize: mode }); const t = R.tableFor(mode, l); eq([g.tw, g.th], [t.w, t.h], `partida de ${l} pts con mesa ${mode}: ${t.w}x${t.h}`); }
});
T('core-qa-151', F, 'Al desplegar, las unidades deben quedar completamente dentro de su zona', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.ready = [false, false]; const u = U(s, 'state_troops'); cur(s); const Z = s.zones[0], zy = Z.y0 > 24 ? Z.y0 : Z.y1;
  const r = R.apply(s, { t: 'deployMove', id: u.id, x: 36, y: zy + (Z.y0 > 24 ? 0.3 : -0.3), face: u.face }); ok(!r.ok, 'se despliega sobresaliendo de la zona');
  const r2 = R.apply(s, { t: 'deployMove', id: u.id, x: 36, y: (Z.y0 + Z.y1) / 2, face: u.face }); ok(r2.ok, 'no se despliega dentro de la zona: ' + r2.error);
});
T('core-qa-153', F, 'Murallas de Tierra sobre una unidad obligada a cargar: debe declarar, pero no mueve y la carga fracasa', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const a = put(U(s, 'orc_boyz'), 36, 40), t = put(U(s, 'state_troops', 1), 36, 33, Math.PI / 2); a.fx.push({ k: 'ramparts', by: 1 }); cur(s);
  ok(R.chargeTargets(s, a, true).includes(t), 'no está obligada a declarar'); ok(!R.chargeTargets(s, a).includes(t), 'puede cargar normalmente');
});
T('core-qa-154', F, 'Murallas de Tierra: la unidad no puede Contracargar', () => {
  const s = game([{ type: 'boar_riders', models: 5 }], [{ type: 'empire_knights', models: 5 }], { f: ['orcs', 'empire'], phase: 'move' }); const a = put(U(s, 'boar_riders'), 36, 41.5), t = put(U(s, 'empire_knights', 1), 36, 29, Math.PI / 2); t.fx.push({ k: 'ramparts', by: 1 }); cur(s);
  dice(3); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'boar_riders').id, target: U(c, 'empire_knights', 1).id }), [0, 1], (n) => (n.title === 'Contracarga' ? 'y' : undefined)); ok(!o.needs.some((n) => n.title === 'Contracarga'), 'ofrece Contracarga con Murallas de Tierra');
  const s2 = game([{ type: 'boar_riders', models: 5 }], [{ type: 'empire_knights', models: 5 }], { f: ['orcs', 'empire'], phase: 'move' }); put(U(s2, 'boar_riders'), 36, 41.5); put(U(s2, 'empire_knights', 1), 36, 29, Math.PI / 2); cur(s2);
  dice(3); diceAll(6); const o2 = asks(s2, (c) => R.apply(c, { t: 'charge', id: U(c, 'boar_riders').id, target: U(c, 'empire_knights', 1).id }), [0, 1], (n) => (n.title === 'Contracarga' ? 'y' : undefined)); ok(o2.needs.some((n) => n.title === 'Contracarga'), 'control: sin Murallas de Tierra sí se ofrece Contracarga');
});
T('core-qa-160', F, 'Sombrero de Mago: el portador lanza con armadura', () => {
  const s = game([{ type: 'empire_captain', models: 1, items: ['wiz_hat', 'heavy_armour'].filter((x) => ITEMS[x]), opts: ['sh'] }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'empire_captain'), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 30, Math.PI / 2); cur(s);
  const d = R.D(c); ok(d.wizard, 'el Sombrero no le hace Mago'); const k = c.spells?.[0] || (DATA.LORES[d.wizard.lore]?.pool || [])[0]; c.spells = [k]; c.casted = []; ok(!/armadura/i.test(String(R.castCheck(s, c, k, t) || '')), 'la armadura le impide lanzar');
});
T('core-qa-161', F, 'Sombrero de Mago y un yelmo mágico a la vez (objeto encantado + armadura mágica)', () => { const hel = Object.keys(ITEMS).find((x) => ITEMS[x].cat === 'a' && ITEMS[x].helm && !ITEMS[x].fac) || 'bedazzle'; const iss = DATA.itemIssues('empire_captain', ['wiz_hat', hel].filter((x) => ITEMS[x])); ok(!iss.some((x) => /Sombrero|yelmo|categor/i.test(x)), 'no los admite juntos: ' + iss.join('; ')); const ar = Object.keys(ITEMS).filter((x) => ITEMS[x].cat === 'a' && !ITEMS[x].fac && !ITEMS[x].boundSpell); ok(DATA.itemIssues('empire_captain', [ar[0], ar[1]]).some((x) => /categor/i.test(x)), 'control: dos armaduras mágicas sí chocan por categoría'); ok(DATA.itemIssues('empire_captain', ['wiz_hat', 'wiz_hat']).some((x) => /Sombrero.*duplicado/.test(x)), 'control: dos sombreros chocan'); });
T('core-qa-162', F, 'Sombrero de Mago en un Mago: no aumenta su Nivel', () => { const s = game([{ type: 'empire_mage', models: 1, items: ['wiz_hat'] }], [{ type: 'orc_boyz', models: 5 }], { f: ['empire', 'orcs'] }); eq(R.D(U(s, 'empire_mage')).wizard.level, UNITS.empire_mage.wizard.level, 'Nivel'); const s2 = game([{ type: 'empire_captain', models: 1, items: ['wiz_hat'] }], [{ type: 'orc_boyz', models: 5 }], { f: ['empire', 'orcs'] }); eq(R.D(U(s2, 'empire_captain')).wizard.level, 1, 'control: en un no Mago concede Nivel 1'); });
T('core-qa-163', F, 'Las pociones no afectan a la montura', () => {
  const k = Object.keys(UNITS).find((x) => UNITS[x].faction === 'empire' && UNITS[x].cat === 'char' && UNITS[x].mountAtk); const s = game([{ type: k, models: 1, items: ['pot_str'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = U(s, k); cur(s); const m0 = JSON.stringify(R.D(u).mountAtk); u.fx.push({ k: 'potS', v: 1 }); eq(JSON.stringify(R.D(u).mountAtk), m0, 'la poción cambia la montura');
});
T('core-qa-168', F, 'Shaggoth (Ogro Dragón) compra objetos mágicos hasta 50 pts de la lista común o de su propia facción (RH p.104)', () => {
  const com = Object.keys(ITEMS).find((k) => !ITEMS[k].fac && ITEMS[k].cat !== 's' && ITEMS[k].cat !== 'g' && !ITEMS[k].mut && !ITEMS[k].gift && !ITEMS[k].vpow && !ITEMS[k].mundane && !ITEMS[k].honour && !ITEMS[k].virtue && !ITEMS[k].fspite && !ITEMS[k].kindred && !ITEMS[k].needMount && !ITEMS[k].onlyT && !ITEMS[k].onlyRe && !ITEMS[k].infOnly && !ITEMS[k].footOnly && !ITEMS[k].infCav && !ITEMS[k].infCavOnly && !ITEMS[k].noMonMount && ITEMS[k].cost > 0 && ITEMS[k].cost <= 50 && !DATA.itemIssues('bm_shaggoth', [k], null, false, 'grand').length);
  ok(com, 'ningún objeto común admitido');
  ok(DATA.itemBudget('bm_shaggoth', 'grand') === 50, 'presupuesto 50');
  const woc = Object.keys(ITEMS).find((k) => ITEMS[k].fac === 'woc');
  if (woc) ok(DATA.itemIssues('bm_shaggoth', [woc], null, false, 'grand').some((x) => /otro ejército/.test(x)), 'objeto de otra facción rechazado');
  const dear = Object.keys(ITEMS).filter((k) => !ITEMS[k].fac && ITEMS[k].cost > 0 && !DATA.itemIssues('bm_shaggoth', [k], null, false, 'grand').length && ITEMS[k].cost <= 50);
  ok(DATA.itemIssues('bm_shaggoth', dear.slice(0, 40), null, false, 'grand').some((x) => /pts/.test(x)), 'más de 50 pts rechazado');
  ok(DATA.itemIssues('bm_beastlord', [com], null, false, 'grand').every((x) => !/solo los personajes/.test(x)), 'personaje sin cambio');
  ok(DATA.itemIssues('bm_dragon_ogres', [com], null, false, 'grand').some((x) => /solo los personajes/.test(x)), 'unidad normal sigue sin objetos');
});
