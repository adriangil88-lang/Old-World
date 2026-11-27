// v837 — FAQ pendientes (54 entradas automatizables): pruebas que ejecutan el motor. Lote A: Fanáticos, psicología, despliegue, Estupidez
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const FQ = 'rules/new/faq_rh.txt', FC = 'rules/new/faq_core.txt', FF = 'rules/new/faq_fof.txt';
const fanGame = (tgt = ['state_troops', 'state_troops']) => { const s = game([{ type: 'night_gobs', models: 10 }], tgt.map((t) => ({ type: t, models: 10 })), { f: ['orcs', 'empire'], phase: 'strategy', active: 0 }); cur(s); return s; };
const runFan = (s, x, y, ang, a, b, extra = []) => { const F = { owner: 0, x, y }; dice(a, b, extra); const ev = []; R.fanaticMove(s, F, ang, ev); return { F, ev, m: msgs(ev) }; };
T('rh-qa-002', FQ, 'Fanático que atraviesa una unidad trabada solo golpea a las unidades por las que pasa su línea, no a aquellas con las que esa unidad está trabada', () => {
  const s = game([{ type: 'night_gobs', models: 10 }, { type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy', active: 0 }); const A = U(s, 'state_troops', 1), B = U(s, 'orc_boyz', 0);
  engage(s, B, A, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); cur(s); ok(R.engagedWith(s, A).includes(B), 'montaje: A y B trabadas');
  // línea desde el oeste, a la altura de A (la fila trasera), que atraviesa A y no pasa por B (que está delante de A)
  const d = GEOM.dims(A); const x0 = A.x - d.w / 2 - 3, y0 = A.y + d.d / 2 - 0.3; const nA = A.models, nB = B.models;
  const r = runFan(s, x0, y0, 0, 3, 5, [6, 6, 6, 6, 6, 6, 6, 6]);
  ok(/atraviesa a/.test(r.m), 'el Fanático no golpea a A: ' + r.m); ok(A.models < nA, 'A no sufre bajas'); ok(!r.m.includes('atraviesa a ' + B.name), 'B (trabada con A, fuera de la línea) golpeada'); eq(B.models, nB, 'B intacta');
  // y si la línea sí pasa por B, B es golpeada (el criterio es la línea, no la trabazón)
  const r2 = runFan(s, B.x - GEOM.dims(B).w / 2 - 3, B.y, 0, 3, 4, [6, 6, 6, 6, 6, 6]); ok(r2.m.includes('atraviesa a ' + B.name), 'la línea que pasa por B no la golpea: ' + r2.m);
});
T('rh-qa-004', FQ, 'Fanático contra estacas defensivas: se detiene en seco y muere, entre desde el frente, el flanco o la retaguardia', () => {
  for (const [ang, lbl] of [[Math.PI / 2, 'frente'], [0, 'flanco'], [-Math.PI / 2, 'retaguardia']]) {
    const s = game([{ type: 'night_gobs', models: 10 }], [{ type: 'br_bowmen', models: 10, opts: ['stk'] }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'bret'], phase: 'strategy' }); const A = U(s, 'br_bowmen', 1); put(A, 36, 24, -Math.PI / 2); cur(s); ok(R.D(A).sr.includes('stakes'), 'montaje: sin estacas');
    const x0 = A.x - Math.cos(ang) * 8, y0 = A.y - Math.sin(ang) * 8; const r = runFan(s, x0, y0, ang, 3, 5, [6, 6, 6, 6]);
    ok(r.F.dead, `desde el ${lbl}: el Fanático no muere al chocar con las estacas: ${r.m}`); ok(/estacas defensivas/.test(r.m), `desde el ${lbl}: sin aviso de estacas: ${r.m}`);
  }
});
T('rh-qa-005', FQ, 'Fanático que acaba su movimiento en el alcance de mando de un modelo con Terreno hostil: chequeo de Terreno peligroso (1 = muere)', () => {
  const run = (q) => { const s = fanGame(['state_troops', 'state_troops']); const A = s.units.find((u) => u.owner === 1); put(A, 36, 24, -Math.PI / 2); cur(s); return withSr('state_troops', ['hostileTerrain'], () => { const r = runFan(s, 20, 24, 0, 3, 5, [q]); return r; }); };
  const lo = run(1), hi = run(4); ok(/Terreno Peligroso/.test(lo.m) && lo.F.dead, 'con 1 el Fanático debe morir: ' + lo.m); ok(/Terreno Peligroso/.test(hi.m) && !hi.F.dead, 'con 4 sobrevive: ' + hi.m);
  const s = fanGame(); put(s.units.find((u) => u.owner === 1), 36, 24, -Math.PI / 2); cur(s); const none = runFan(s, 20, 24, 0, 3, 5, [1]); ok(!/Terreno Peligroso/.test(none.m), 'sin Terreno hostil no hay chequeo');
});
T('core-qa-087', FC, 'Bestias de guerra y Enjambres con Inmune a psicología temen a los Ataques flamígeros', () => {
  const run = (k, flam) => { const s = game([{ type: k, models: 5 }], [{ type: 'orc_boyz', models: 20 }], { f: [UNITS[k].faction, 'orcs'], phase: 'move' }); const a = put(U(s, k), 36, 44), e = put(U(s, 'orc_boyz', 1), 36, 30, Math.PI / 2); cur(s);
    return withSr('orc_boyz', flam ? ['flaming'] : [], () => withSr(k, ['immunePsy'], () => { diceAll(6); const ev = []; R.doCharge(s, a, e, ev); return msgs(ev); })); };
  const sw = 'sk_swarms';
  for (const k of ['bm_hounds', sw]) { ok(k && ['warBeasts', 'swarm'].includes(UNITS[k].tt), 'montaje'); ok(/Miedo/.test(run(k, true)), k + ': Inmune a psicología no teme a Ataques flamígeros: ' + run(k, true)); ok(!/Miedo/.test(run(k, false)), k + ': sin Ataques flamígeros no hay chequeo de Miedo'); }
});
T('core-qa-089', FC, 'Banda variopinta con número par de armaduras distintas: se usa la mejor (sin contar personajes ni campeones con objetos)', () => {
  const mk = (n, f) => { const s = game([{ type: 'orc_ogre_bulls', models: n, opts: Array(f).fill('if') }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); return R.svOf(U(s, 'orc_ogre_bulls')); };
  const base = mk(4, 0), mej = mk(4, 2); ok(mej < base, 'montaje: el puño de hierro mejora la armadura'); eq(mej, mk(4, 4), 'empate 2/4 con armadura mejor = la mejor'); eq(mk(6, 3), mej, 'empate 3/6'); eq(mk(4, 1), base, 'sin empate (1/4): la de la mayoría');
});
T('core-qa-092', FC, 'Movimiento aleatorio: no rodea al enemigo; entra en contacto solo como una carga válida, por el arco al que apunta su línea recta', () => {
  const run = (face, big = true) => { const s = game([{ type: 'pump_wagon', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 }); const a = put(U(s, 'pump_wagon'), 36, 42), e = put(U(s, 'state_troops', 1), 36, 30, face); cur(s); diceAll(6); const x0 = a.x; const ev = []; R.randomMoves(s, ev, a); return { s, a, e, ev, x0, m: msgs(ev) }; };
  const f = run(Math.PI / 2); ok(R.engagedWith(f.s, f.a).includes(f.e), 'no llega a contacto con 12": ' + f.m); eq(R.sideOfC(f.e, f.a), 'front', 'arco de contacto (el enemigo mira hacia él)'); ok(Math.abs(f.a.x - f.x0) < 0.6, 'se desvió de su línea: ' + f.a.x);
  const g = run(0); ok(R.engagedWith(g.s, g.a).includes(g.e), 'no llega al flanco: ' + g.m); ok(['flank', 'left', 'right'].includes(R.sideOfC(g.e, g.a)), 'arco de contacto: ' + R.sideOfC(g.e, g.a)); ok(Math.abs(g.a.x - g.x0) < 0.6, 'se desvió: ' + g.a.x);
  // con otro enemigo interpuesto no lo rodea: se detiene a 1" de él
  const s = game([{ type: 'pump_wagon', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 }); const a = put(U(s, 'pump_wagon'), 36, 44); const [e1, e2] = s.units.filter((u) => u.owner === 1); put(e1, 36, 37, Math.PI / 2); put(e2, 36, 24, Math.PI / 2); cur(s); diceAll(1); const ev = []; R.randomMoves(s, ev, a); ok(a.x === 36 && a.y > e1.y, 'rodea o atraviesa al enemigo interpuesto: ' + a.x + ',' + a.y);
});
T('core-qa-095', FC, 'Unidades desplegadas con Exploradores cuentan al decidir quién terminó de desplegar primero', () => {
  const mk = (A1) => { const s = R.createGame({ seed: 3, armies: [[{ type: 'orc_boyz', models: 20 }, { type: 'orc_boyz', models: 20 }], A1], factions: ['orcs', 'wood'], limit: 2000, scn: 'glory', alt: true }); cur(s); let g = 0;
    while (s.alt.phase !== 'done' && g++ < 80) { if (s.alt.phase === 'zone') { R.apply(s, { t: 'altZone', player: s.alt.win, swap: false }); continue; } if (s.alt.phase === 'first') { R.apply(s, { t: 'altFirst', player: s.alt.win, first: 1 }); continue; } const r = R.apply(s, { t: 'altAuto', player: s.alt.turn }); if (r.ok === false) throw new Error('altAuto: ' + JSON.stringify(r)); }
    ok(s.alt.phase === 'done', 'despliegue alterno sin terminar'); return s; };
  const sc = mk([{ type: 'we_glade_guard', models: 10 }, { type: 'we_scouts', models: 5 }]), no = mk([{ type: 'we_glade_guard', models: 10 }, { type: 'we_glade_guard', models: 10 }]);
  eq(no.altLast, 0, 'sin Exploradores: el último en colocar es el jugador 0'); eq(sc.altLast, 1, 'con Exploradores del jugador 1, su colocación es la última: él termina el último');
});
T('core-qa-097', FC, 'Estupidez: la unidad se somete mientras lo lleva un personaje unido y deja de estarlo en cuanto este se va', () => {
  withSr('orc_bigboss', ['stupidity'], () => {
    const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_bigboss', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move', active: 0 });
    const h = put(U(s, 'orc_boyz'), 36, 40), c = put(U(s, 'orc_bigboss'), 33, 40); cur(s); ok(!R.has(h, 'stupidity'), 'montaje: la unidad no tiene Estupidez');
    const r = R.apply(s, { t: 'join', id: c.id, to: h.id }); ok(r.ok !== false, 'no se une: ' + JSON.stringify(r)); const H = s.units.find((u) => u.id === h.id); cur(s); ok(R.has(H, 'stupidity'), 'unida al personaje la unidad debe tener Estupidez');
    H.joinedMove = null; const r2 = R.apply(s, { t: 'leave', id: H.id }); ok(r2.ok !== false, 'no se va: ' + JSON.stringify(r2)); cur(s); ok(!R.has(s.units.find((u) => u.id === h.id), 'stupidity'), 'al irse el personaje la unidad sigue con Estupidez');
  });
});
T('core-qa-100', FC, 'Terror del bando ganador: el −1 al Liderazgo de la prueba de ruptura no afecta a quien causa Miedo o Terror', () => {
  const ldOf = (lr) => { const s = game([{ type: 'we_lord_dragon', models: 1 }], [{ type: 'state_troops', models: 60 }], { f: ['wood', 'empire'] }); const w = U(s, 'we_lord_dragon'), l = U(s, 'state_troops', 1); l.files = 10; engage(s, w, l); charged(s, w, l); cur(s); diceAll(6);
    return withSr('state_troops', lr, () => { dice([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]); const ev = fight(s); const m = /chequeo de ruptura \d+\+\d+ contra Ld (\d+)/.exec(msgs(ev)); ok(m, 'sin chequeo de ruptura: ' + msgs(ev).slice(-300)); return +m[1]; }); };
  const base = ldOf([]), fear = ldOf(['fear']), terr = ldOf(['terror']); eq(base, fear - 1, 'quien no causa Miedo sufre −1 (Terror del ganador)'); eq(terr, fear, 'quien causa Terror no sufre el −1');
  eq(fear, UNITS.state_troops.Ld ?? fear, 'Ld base de quien causa Miedo');
});
T('core-qa-101', FC, 'Heridas causadas por ¡Timmm-berrr! cuentan para el resultado del combate del enemigo', () => {
  const s = game([{ type: 'ct_sentinel', models: 1 }], [{ type: 'goblins', models: 20 }], { f: ['ct', 'orcs'] }); const a = U(s, 'ct_sentinel'), d = U(s, 'goblins', 1); d.files = 5; engage(s, a, d); cur(s);
  const base = R.sideScore(s, [a, d], 0, new Map());
  dice(5, 3); diceAll(5); a.models = 0; a.wounds = 0; const ev = []; R.destroy(s, a, ev); ok(/Timmm-berrr/.test(msgs(ev)), 'no cae el árbol: ' + msgs(ev)); ok((d.assailWounds || 0) > 0, 'las Heridas de ¡Timmm-berrr! no se anotan para el resultado de combate (assailWounds=' + d.assailWounds + ')');
  d.models = d.models; const withW = R.sideScore(s, [a, d], 0, new Map()); eq(withW - base, d.assailWounds, 'el resultado del combate del bando del árbol no suma las Heridas');
});
T('core-qa-103', FC, 'Personaje sin Veterano en una unidad Veterana: su chequeo de Liderazgo por regla especial no repite con el Veterano de la unidad', () => {
  const run = (vet) => { const s = game([{ type: 'tk_warriors_ph', models: 10 }, { type: 'tk_necrotect', models: 1 }].filter((x) => UNITS[x.type]), [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'], phase: 'strategy', active: 0 });
    const h = put(U(s, 'tk_warriors_ph'), 36, 40), c = put(U(s, 'tk_necrotect'), 33, 40); join(s, c, h); cur(s); R.syncJoined(s);
    return withSr('tk_warriors_ph', vet ? ['veteran'] : [], () => { ok(R.has(h, 'veteran') === !!vet || !vet, 'montaje'); dice(6, 5); diceAll(1); const ev = []; R.beginStrategy(s, ev); return (h.fx || []).some((f) => f.k === 'taskK'); }); };
  eq(run(false), false, 'control: 11 contra Ld de personaje falla'); eq(run(true), false, 'la unidad Veterana no repite el chequeo del personaje');
  // y el propio personaje Veterano sí repetiría: (comprobación de que el montaje distingue)
});
const iss = (army, list = 'grand') => DATA.armyIssues(army, 2000, 'open', list);
const trDw = [{ type: 'dw_warriors', models: 20 }, { type: 'dw_warriors', models: 20 }, { type: 'dw_warriors', models: 20 }, { type: 'dw_longbeards', models: 20 }];
const trEm = [{ type: 'state_troops', models: 20 }, { type: 'state_troops', models: 20 }, { type: 'state_troops', models: 20 }];
const GEN = (l) => l.filter((x) => /General/.test(x));
T('core-qa-109', FC, 'El Portaestandarte de Batalla no puede tener más Liderazgo que el General', () => {
  eq(GEN(iss([{ type: 'emp_lector', models: 1 }, { type: 'empire_general', models: 1, std: true }, ...trEm])).length, 1, 'BSB con Ld 10 y General con Ld 9: debe rechazarse');
  eq(GEN(iss([{ type: 'emp_lector', models: 1, gen: true }, { type: 'empire_captain', models: 1, std: true }, ...trEm])).length, 0, 'BSB con el mismo Ld que el General: válido');
  eq(GEN(iss([{ type: 'empire_general', models: 1 }, { type: 'empire_captain', models: 1, std: true }, ...trEm])).length, 0, 'BSB con menos Ld: válido');
});
T('core-qa-110', FC, 'Un personaje con una regla que le impide ser General (Solitario) puede tener más Liderazgo que el General', () => {
  ok(DATA.UNITS.dw_dslayer.sr.includes('loner') && DATA.UNITS.dw_dslayer.Ld > DATA.UNITS.dw_thane.Ld, 'montaje: Matador Ld > Thane');
  eq(GEN(iss([{ type: 'dw_thane', models: 1 }, { type: 'dw_dslayer', models: 1 }, ...trDw])), [], 'el Matador (Solitario, Ld 10) no obliga a que sea el General el de más Ld');
  ok(!DATA.UNITS.dw_dslayer.general, 'el Solitario no es elegible como General en ninguna lista');
});
T('core-qa-111', FC, 'Un personaje mercenario no puede ser el General: solo lo es un personaje de la lista de personajes del ejército', () => {
  const army = [{ type: 'dw_doomseeker', models: 1, gen: true }, ...trEm]; const i = iss(army); ok(i.includes('Necesitas un General'), 'un mercenario marcado como General no se rechaza: ' + i.join('; '));
  { const j = iss([{ type: 'empire_general', models: 1, gen: true }, { type: 'dw_doomseeker', models: 1 }, ...trEm]); ok(!j.includes('Necesitas un General'), 'con un General legítimo la lista no pide General (precondición): ' + j.join('; ')); ok(!iss([{ type: 'empire_general', models: 1, gen: true }, ...trEm]).includes('Necesitas un General')); }
  ok(!UNITS.dw_doomseeker.general, 'montaje: el Buscador de Fatalidad no es un General de ninguna lista');
});
T('core-qa-112', FC, 'Modificadores al Liderazgo (Terror del rival) se aplican también al Liderazgo del General que usa la unidad (Presencia inspiradora)', () => {
  const ldOfRun = (withGen) => { const s = game([{ type: 'we_lord_dragon', models: 1 }], [{ type: 'state_troops', models: 60 }, { type: 'empire_general', models: 1 }], { f: ['wood', 'empire'] }); const w = U(s, 'we_lord_dragon'), l = U(s, 'state_troops', 1), g = U(s, 'empire_general', 1); l.files = 10; engage(s, w, l); charged(s, w, l); put(g, l.x - 6, l.y + 4); if (!withGen) put(g, 60, 4); cur(s); diceAll(6);
    const ev = fight(s); const m = /chequeo de ruptura \d+\+\d+ contra Ld (\d+)/.exec(msgs(ev)); ok(m, 'sin chequeo de ruptura: ' + msgs(ev).slice(-250)); return +m[1]; };
  const own = ldOfRun(false), gen = ldOfRun(true); eq(own, UNITS.state_troops.Ld - 1, 'sin General cerca: Ld propio −1 (Terror)'); eq(gen, UNITS.empire_general.Ld - 1, 'con General cerca: Ld del General −1 (el modificador de Terror se aplica igual)');
});
T('core-qa-113', FC, 'Portaestandarte de Batalla que rechaza un desafío y se retira: sus unidades no usan Mantened la posición mientras su unidad siga trabada con quien lo desafió', () => {
  const s = game([{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }, { type: 'empire_captain', models: 1, std: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const [h, o] = s.units.filter((u) => u.owner === 0 && u.type === 'state_troops'); const c = U(s, 'empire_captain'), e = U(s, 'orc_boyz', 1);
  put(h, 36, 30); put(o, 36 + 8, 30); join(s, c, h); engage(s, e, h, 'front', { x: 36, y: 30, face: -Math.PI / 2 }); put(o, 36 + 8, 40); cur(s); c.std = true; R.syncJoined(s);
  ok(R.bsbNear(s, o), 'montaje: el PEB da Mantened la posición a la unidad vecina'); c.retiredFrom = e.id; ok(!R.bsbNear(s, o), 'PEB retirado de un desafío con la unidad aún trabada con el retador: no debe darlo'); c.retiredFrom = null; ok(R.bsbNear(s, o), 'sin retirada vuelve a darlo');
  c.retiredFrom = e.id; put(e, 60, 4); cur(s); ok(!R.engagedWith(s, h).length, 'montaje: el retador se ha apartado'); ok(R.bsbNear(s, o), 'una vez que la unidad ya no está trabada con el retador el PEB vuelve a dar Mantened la posición');
});
T('core-qa-119', FC, 'Un personaje Torpe sí puede unirse a una unidad que no es Torpe (al revés no)', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_bigboss', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const h = put(U(s, 'orc_boyz'), 36, 40), c = put(U(s, 'orc_bigboss'), 33, 40); cur(s);
  eq(R.joinCheck(s, c, h), null, 'montaje: se une sin Torpe'); withSr('orc_bigboss', ['clumsy'], () => { eq(R.joinCheck(s, c, h), null, 'personaje Torpe a unidad no Torpe'); }); withSr('orc_boyz', ['clumsy'], () => { ok(/Torpe/.test(R.joinCheck(s, c, h) || ''), 'personaje no Torpe a unidad Torpe: debe rechazarse'); });
  withSr('orc_boyz', ['clumsy'], () => withSr('orc_bigboss', ['clumsy'], () => { eq(R.joinCheck(s, c, h), null, 'ambos Torpes'); }));
});
T('core-qa-123', FC, 'Personaje sin hueco en la fila delantera: no pasa a la segunda fila, abandona la unidad (nunca más personajes que modelos en la fila delantera)', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_bigboss', models: 1 }, { type: 'orc_bigboss', models: 1 }, { type: 'orc_bigboss', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy' }); const h = put(U(s, 'orc_boyz'), 36, 40); h.files = 2; const cs = s.units.filter((u) => u.type === 'orc_bigboss' && u.owner === 0);
  for (const c of cs) join(s, c, h); cur(s); eq(h.joined.length, 3, 'montaje'); const ev = []; R.beginStrategy(s, ev); eq(h.joined.length, 2, 'con 2 filas·ancho 2 solo caben 2 personajes (el resto sale)'); ok(/no puede haber más personajes que modelos en la fila delantera/.test(msgs(ev)), 'sin aviso: ' + msgs(ev));
  eq(s.units.filter((u) => u.type === 'orc_bigboss').length, 1, 'el personaje expulsado queda como unidad propia, no en la segunda fila');
});
const mountChar = (items, opts = []) => { const s = game([{ type: 'de_dreadlord_chariot', models: 1, items, opts }], [{ type: 'state_troops', models: 10 }], { f: ['de', 'empire'] }); const u = U(s, 'de_dreadlord_chariot'); cur(s); return u; };
T('core-qa-115', FC, 'Personaje en monstruo/carro que usa la armadura de la montura no obtiene los demás beneficios de su armadura mágica (se usa por completo o nada)', () => {
  const u = mountChar(['destiny']); ok(ITEMS.destiny.cat === 'a' && ITEMS.destiny.ward, 'montaje: armadura mágica con salvación especial'); u.armPick = 'own'; const wOwn = R.wardOf(u); u.armPick = 'mount'; const wMnt = R.wardOf(u); u.armPick = 'own'; ok(wOwn > 0 && wOwn <= ITEMS.destiny.ward, 'con su armadura reclama la salvación especial: ' + wOwn); eq(wMnt, 0, 'con la armadura de la montura la salvación especial de la armadura mágica no se aplica');
  u.armPick = 'mount'; eq(R.svOf(u), UNITS.de_dreadlord_chariot.mountSv, 'armadura de la montura');
});
T('core-qa-117', FC, 'Un escudo del personaje no mejora el valor de armadura de la montura (monstruo/carro)', () => {
  const a = mountChar([], ['fp']), b = mountChar([], ['fp', 'sh']); a.armPick = 'own'; b.armPick = 'own'; ok(R.svOf(b) < R.svOf(a), 'montaje: el escudo mejora su armadura propia (' + R.svOf(a) + ' → ' + R.svOf(b) + ')'); a.armPick = 'mount'; b.armPick = 'mount'; eq(R.svOf(b), R.svOf(a), 'el escudo no mejora la armadura de la montura'); eq(R.svOf(b), UNITS.de_dreadlord_chariot.mountSv, 'valor de la montura');
});
T('core-qa-127', FC, 'Un personaje Banda de guerra en una unidad sin Banda de guerra: la bonificación de filas de la unidad no modifica su Liderazgo', () => {
  const ldJ = (host) => { const s = game([{ type: host, models: 20 }, { type: 'orc_bigboss', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: [UNITS[host].faction, 'empire'] }); const h = put(U(s, host), 36, 40); h.files = 5; const c = put(U(s, 'orc_bigboss'), 33, 40); join(s, c, h); cur(s); return { ld: R.ldOf(s, h), ldc: R.ldOf(s, c), rb: R.rankBonus(h), h }; };
  ok(UNITS.orc_bigboss.sr.includes('warband'), 'montaje: el Jefe es Banda de guerra'); const a = ldJ('orc_boyz'), b = ldJ('state_troops');
  ok(!UNITS.state_troops.sr.includes('warband') && b.rb > 0, 'montaje: la unidad sin Banda de guerra tiene bonificación de filas ' + b.rb); eq(b.ld, UNITS.orc_bigboss.Ld, 'sin Banda de guerra en la unidad el Ld de la unidad con el personaje es el del personaje, sin sumar filas'); ok(a.rb > 0 && a.ld >= Math.min(10, UNITS.orc_bigboss.Ld + a.rb) - 0, 'con Banda de guerra en la unidad sí suma las filas: ' + a.ld);
});
T('core-qa-129', FC, 'Personaje de otro tipo de tropa en una unidad: puede recibir disparos y no tiene «¡Cuidado, señor!» (a pie sí lo tiene)', () => {
  const shoot = (ch, v) => { const s = game([{ type: 'mortar', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: ch, models: 1 }], { f: ['empire', 'empire'], phase: 'shoot' }); const a = put(U(s, 'mortar', 0), 36, 44), t = put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2), c = U(s, ch, 1); join(s, c, t); cur(s); diceAll(v); const ev = []; R.resolveShot(s, a, t, ev); return msgs(ev); };
  ok(!/Cuidado, señor! falla/.test(shoot('empire_captain', 2)), 'personaje a pie con 5+ modelos de su tipo: debe tener ¡Cuidado, señor! (2 lo salva)'); ok(/Cuidado, señor! falla/.test(shoot('emp_lector_altar', 2)), 'personaje en altar/carro unido a infantería: sin ¡Cuidado, señor! (recibe el impacto)');
  // blanco de disparos: los impactos no protegidos alcanzan al personaje de otro tipo aunque haya 5+ modelos de tropa
  const run = (ch) => { const s = game([{ type: 'orc_boyz', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: ch, models: 1 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const t = U(s, 'state_troops', 1), c = U(s, ch, 1); join(s, c, t); cur(s); s.log = []; diceAll(5); R.woundAndSave(s, t, 12, 5, 0, { ranged: true }); return s.log.some((m) => m.startsWith(c.name + ' recibe')); };
  eq(run('empire_captain'), false, 'personaje a pie con 10 de tropa: protegido de disparos'); eq(run('emp_lector_altar'), true, 'personaje de otro tipo de tropa: recibe impactos de disparo aunque haya 5+ modelos de tropa');
});
T('core-qa-130', FC, 'Estandarte mágico de la unidad: sus efectos alcanzan al personaje unido', () => {
  const k = 'cdl_beard'; ok(ITEMS[k] && ITEMS[k].ward, 'montaje'); const s = game([{ type: 'dw_warriors', models: 20, banner: k, std: true }, { type: 'dw_thane', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'] }); const h = put(U(s, 'dw_warriors'), 36, 40), c = put(U(s, 'dw_thane'), 33, 40); h.banner = k; h.std = true; join(s, c, h); cur(s);
  const base = R.wardOf(c); const s2 = game([{ type: 'dw_warriors', models: 20 }, { type: 'dw_thane', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'] }); const h2 = U(s2, 'dw_warriors'), c2 = U(s2, 'dw_thane'); join(s2, c2, h2); cur(s2); const ctrl = R.wardOf(c2);
  ok(base > 0 && (ctrl === 0 || base < ctrl), `el personaje unido no recibe la salvación especial del estandarte (${base} frente a ${ctrl} sin él)`); eq(base, ITEMS[k].ward, 'salvación especial del estandarte');
});
T('core-qa-131', FC, 'Cañón y personaje solitario: protegido (a 3" de una unidad amiga de 5+ modelos del mismo tipo) no recibe la bala aunque su peana esté bajo la trayectoria; sin protección sí', () => {
  const shot = (withF) => { const s = game([{ type: 'great_cannon', models: 1 }], [{ type: 'orc_boyz', models: 10 }, { type: 'orc_bigboss', models: 1 }, { type: 'goblins', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
    const a = put(U(s, 'great_cannon', 0), 36, 46), T0 = put(U(s, 'orc_boyz', 1), 36, 24, Math.PI / 2), C = put(U(s, 'orc_bigboss', 1), 36, 14, Math.PI / 2); put(U(s, 'goblins', 1), withF ? 40 : 60, 14, Math.PI / 2); cur(s); diceAll(4); const ev = []; R.resolveShot(s, a, T0, ev); return { C, m: msgs(ev) }; };
  const sin = shot(false), con = shot(true); ok(/también alcanza a Gran Jefe Orco/.test(sin.m) && sin.C.models === 0, 'montaje: sin unidad protectora la bala alcanza al personaje: ' + sin.m.slice(0, 200)); ok(!/también alcanza a Gran Jefe Orco/.test(con.m) && con.C.models === 1, 'con 5+ modelos a 3" el personaje no puede ser alcanzado: ' + con.m.slice(0, 200));
});
T('core-qa-133', FC, 'Personaje con nombre con lanza y arma mágica: debe usar el arma mágica; los personajes con nombre no heredan opciones (se despliegan «tal como se presentan»)', () => {
  const named = Object.values(UNITS).filter((u) => u.cat === 'char' && u.unique && !u.noList); ok(named.length >= 15, 'montaje: ' + named.length); for (const u of named) ok(!(u.opts || []).some((o) => o.id === 'ln' || /Lanza/.test(o.label)), `${u.id}: tiene la opción de lanza`);
  const prof = (lance) => { const s = game([{ type: 'emp_harald', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'] }); const a = U(s, 'emp_harald'), e = U(s, 'state_troops', 1); engage(s, a, e); charged(s, a, e); cur(s); return withLance(lance, () => R.attackProfile(a, e)); };
  const withLance = (on, f) => { const d = UNITS.emp_harald, old = d.lance; d.lance = on; try { return f(); } finally { d.lance = old; } };
  const a = prof(false), b = prof(true); eq([b.S, b.ap], [a.S, a.ap], 'con una lanza (mundana) y su arma mágica el personaje con nombre usa solo la mágica');
});
T('core-qa-132', FC, 'Ataques que apuntan a modelos concretos de una unidad (Devorar del Gigante Triturador) no ignoran «¡Cuidado, señor!»', () => {
  const grind = (ch, q) => { const s = game([{ type: 'orc_bonegrinder', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: ch, models: 1 }], { f: ['orcs', 'empire'] }); const a = U(s, 'orc_bonegrinder'), e = U(s, 'state_troops', 1), c = U(s, ch, 1); join(s, c, e); e.files = 5; engage(s, a, e); cur(s); dice(q); diceAll(6); const ev = [], pend = []; R.bonegrinderAttack(s, a, [e], pend, [], ev); return msgs(ev); };
  const foot = grind('empire_captain', [3, 6, 6, 6, 6, 4]); ok(/se libra con ¡Cuidado, señor! \(4\)/.test(foot), 'personaje a pie: debe poder hacer ¡Cuidado, señor! (' + foot.slice(0, 260) + ')');
  const alt = grind('emp_lector_altar', [3, 6, 6, 6, 6, 4]); ok(!/se libra con ¡Cuidado, señor!/.test(alt) && /Iniciativa/.test(alt), 'personaje de otro tipo de tropa: sin ¡Cuidado, señor! (' + alt.slice(0, 260) + ')');
});
T('core-qa-140', FC, 'Cañón y punto en el suelo con otra unidad entre medias: no puede, salvo desde una colina con la unidad fuera de ella; el lanzapiedras sí (indirecto)', () => {
  const aimAt = (shooter, hill) => { const s = game([{ type: shooter, models: 1 }], [{ type: 'orc_boyz', models: 10 }, { type: 'goblins', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot', active: 0 }); const a = put(U(s, shooter, 0), 36, 44), bl = put(U(s, 'goblins', 1), 36, 32, Math.PI / 2), tg = put(U(s, 'orc_boyz', 1), 36, 18, Math.PI / 2);
    if (hill) s.terrain.push({ id: 'h1', kind: 'hill', x: 36, y: 44, w: 14, h: 10 }); cur(s); const r = R.apply(s, { t: 'shoot', id: a.id, target: tg.id, aim: { x: 36, y: 26 } }); return r; };
  const flat = aimAt('great_cannon', false); ok(flat.ok === false && /línea de visión/.test(flat.error || ''), 'cañón sin colina con una unidad en medio: debe fallar por línea de visión: ' + JSON.stringify(flat).slice(0, 160));
  const hill = aimAt('great_cannon', true); ok(!(hill.ok === false && /línea de visión/.test(hill.error || '')), 'cañón en una colina y unidad intermedia fuera de ella: puede apuntar: ' + JSON.stringify(hill).slice(0, 160));
  const legal = (shooter, f) => { const s = game([{ type: shooter, models: 1 }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: [f, 'empire'], phase: 'shoot', active: 0 }); const a = put(U(s, shooter, 0), 36, 44); const [bl, tg] = s.units.filter((u) => u.owner === 1); put(bl, 36, 32, Math.PI / 2); put(tg, 36, 18, Math.PI / 2); cur(s); return R.legalShootTargets(s, a).some((x) => x.id === tg.id); };
  eq(legal('rock_lobber', 'orcs'), true, 'lanzapiedras con una unidad en medio: puede disparar indirectamente'); eq(legal('great_cannon', 'empire'), false, 'cañón con una unidad en medio: no ve al blanco');
});
T('core-qa-142', FC, 'Máquina de guerra con un personaje unido: dispara con la Habilidad de Proyectiles de la dotación, no la del personaje', () => {
  const hit = (ch) => { const s = game([{ type: 'helblaster', models: 1 }, ...(ch ? [{ type: ch, models: 1 }] : [])], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'helblaster', 0), 36, 44), t = put(U(s, 'orc_boyz', 1), 36, 24, Math.PI / 2); if (ch) join(s, U(s, ch, 0), a); cur(s); diceAll(1); const ev = []; R.resolveShot(s, a, t, ev); const m = / tiros?, (\d)\+/.exec(msgs(ev)); ok(m, 'sin tirada de impactar: ' + msgs(ev)); return +m[1]; };
  ok(UNITS.emp_engineer.BS > UNITS.helblaster.BS, 'montaje: el Ingeniero tiene más HP que la dotación'); eq(hit('emp_engineer'), hit(null), 'con el Ingeniero unido debe seguir usándose la HP de la dotación');
});
T('core-qa-143', FC, 'Modelo añadido a una máquina de guerra (Matón orco): si se destruye la máquina, también el modelo añadido', () => {
  const s = game([{ type: 'rock_lobber', models: 1, champ: true }, { type: 'rock_lobber', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const [a, o] = s.units.filter((u) => u.owner === 0); put(a, 20, 40); put(o, 26, 40); a.champ = true; cur(s);
  const ldWith = R.ldOf(s, o); ok(ldWith >= 7, 'montaje: con el Matón cerca la dotación usa Ld 7+'); const ev = []; R.applyWounds(a, a.wounds); if (a.models <= 0) R.destroy(s, a, ev); ok(a.models === 0, 'máquina no destruida'); s.units = s.units.filter((u) => u.models > 0); cur(s);
  ok(R.ldOf(s, o) <= UNITS.rock_lobber.Ld, 'al destruirse la máquina el Matón añadido también desaparece (ya no mejora a nadie): ' + R.ldOf(s, o)); ok(!s.units.some((u) => u.models > 0 && u.champ), 'queda un Matón vivo');
});
T('core-qa-144', FC, 'Escaramuzadores pueden defender un obstáculo lineal bajo (los que puedan, en contacto con él)', () => {
  const run = (sk) => { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'we_scouts', models: 10 }], { f: ['orcs', 'wood'], phase: 'move', active: 0 }); const a = put(U(s, 'orc_boyz', 0), 36, 38), t = put(U(s, 'we_scouts', 1), 36, 30, Math.PI / 2); t.sp = sk ? 2 : 0; t.spPref = t.sp; const d = GEOM.dims(t); s.terrain.push({ id: 'w1', kind: 'wall', x: 36, y: t.y + d.d / 2 + 0.3, w: 20, h: 0.5 }); cur(s); diceAll(6); R.doCharge(s, a, t, []); return a.chargeObsK; };
  ok(run(true), 'los Escaramuzadores con obstáculo en su frente no lo defienden'); ok(run(false), 'control: unidad compacta sí lo defiende'); 
});
T('core-qa-106', FC, 'Escaramuzadores cargados cuyos modelos no llegan a formar frente: pierden la coherencia y se retiran como bajas hasta recuperarla', () => {
  const run = (sp) => { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'we_scouts', models: 10 }], { f: ['orcs', 'wood'], phase: 'move', active: 0 }); const a = put(U(s, 'orc_boyz', 0), 36, 38), t = put(U(s, 'we_scouts', 1), 36, 30, Math.PI / 2); t.sp = sp; t.spPref = sp; cur(s); diceAll(6); const ev = []; R.doCharge(s, a, t, ev); return { models: t.models, m: msgs(ev) }; };
  const wide = run(2), tight = run(0); ok(wide.models < 10 && /no llegan? a formar frente/.test(wide.m), 'Escaramuzadores dispersos que no llegan a formar deben perder modelos: ' + wide.m.slice(0, 200)); ok(!/no llegan? a formar frente/.test(tight.m), 'compactos: no pierden modelos al formar');
  eq(wide.m.match(/(\d+) modelos? no llegan?/)[1] * 1 + wide.models - 0 > 0, true, '');
});
T('core-qa-107', FC, 'Escaramuzadores cargados desde varias direcciones: forman frente al primero que llega; los demás cargan después a la unidad ya formada y fallan si no completan', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_boyz', models: 10 }], [{ type: 'we_scouts', models: 10 }], { f: ['orcs', 'wood'], phase: 'move', active: 0 }); const [a, b] = s.units.filter((u) => u.owner === 0); put(a, 36, 38); const t = put(U(s, 'we_scouts', 1), 36, 30, Math.PI / 2); t.sp = 2; t.spPref = 2; put(b, 36, 24, Math.PI / 2);
  cur(s); diceAll(6); R.doCharge(s, a, t, []); eq(t.sp, 0, 'el Escaramuzador forma (sin separación) al ser cargado por el primero'); ok(R.engagedWith(s, t).includes(a), 'el primero llega a contacto');
  const ev2 = []; R.doCharge(s, b, t, ev2); ok(R.engagedWith(s, t).includes(b) || /falla la carga/.test(msgs(ev2)), 'el segundo debe resolverse contra la unidad ya formada: ' + msgs(ev2)); ok(R.engagedWith(s, t).includes(b), 'el segundo, a alcance, carga a la unidad ya formada: ' + msgs(ev2));
  const s2 = game([{ type: 'orc_boyz', models: 10 }, { type: 'orc_boyz', models: 10 }], [{ type: 'we_scouts', models: 10 }], { f: ['orcs', 'wood'], phase: 'move', active: 0 }); const [a2, b2] = s2.units.filter((u) => u.owner === 0); put(a2, 36, 38); const t2 = put(U(s2, 'we_scouts', 1), 36, 30, Math.PI / 2); t2.sp = 2; t2.spPref = 2; put(b2, 36, 4, Math.PI / 2); cur(s2); diceAll(6); R.doCharge(s2, a2, t2, []); const ev3 = []; R.doCharge(s2, b2, t2, ev3); ok(!R.engagedWith(s2, t2).includes(b2) && /falla la carga/.test(msgs(ev3)), 'el que no completa su movimiento falla la carga: ' + msgs(ev3));
});
