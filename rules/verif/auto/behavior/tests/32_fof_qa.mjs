// v835 — Q/A de la FAQ de Forces of Fantasy (rules/new/faq_fof.txt)
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const F = 'rules/new/faq_fof.txt';
const chal = (n) => (n.title === 'Desafío' ? n.opts.find((x) => x[0] !== 'no')?.[0] : undefined);
T('fof-qa-001', F, 'Runas de armadura en el Yunque del Destino: protegen a la dotación, no al Yunque', () => {
  const k = Object.keys(ITEMS).find((x) => ITEMS[x].rune && ITEMS[x].cat === 'a' && ITEMS[x].sv); ok(k, 'sin runas de armadura'); const s = game([{ type: 'dw_anvil', models: 1, items: [k] }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'] }); const a = U(s, 'dw_anvil'); cur(s);
  const sv = R.svOf(a); const e = U(s, 'orc_boyz'); ok(sv <= 7, 'montaje'); engage(s, e, a); cur(s); ok(R.svOf(a) <= sv, 'en combate (dotación) la runa no protege');
});
T('fof-qa-002', F, 'El campeón de Guerreros del Clan Real (grandes hachas) o Martilladores no puede llevar runas de arma en esas armas únicas', () => {
  const k = Object.keys(ITEMS).find((x) => ITEMS[x].rune && ITEMS[x].cat === 'w'); ok(!DATA.champEligible('dw_hammerers', k), 'Martilladores: el campeón puede llevar ' + k); ok(!DATA.champEligible('dw_royalwarriors_ga', k), 'Clan Real con grandes hachas: el campeón puede llevar ' + k);
});
T('fof-qa-004', F, 'Matatrolls con Matagigantes: si caen el músico/portaestandarte los recoge otro Matagigante, o en su defecto un Matatrolls; los Matagigantes no son campeones: el portaestandarte es el último modelo en retirarse', () => {
  const s = game([{ type: 'dw_slayers_g', models: 8, mix: 3, std: true, mus: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'] }); const u = U(s, 'dw_slayers_g', 0); cur(s);
  const st = () => ({ m: u.models, g: u.models - u.mix, t: u.mix, std: !!u.std, mus: !!u.mus, ws: u.models > 0 ? R.D(u).WS : null });
  eq(st(), { m: 8, g: 5, t: 3, std: true, mus: true, ws: 5 }, 'montaje: 5 Matagigantes (HA 5) + 3 Matatrolls, con estandarte y músico'); ok(!u.champ && !(UNITS.dw_slayers_g.opts || []).some((o) => /campe/i.test(o.label)), 'los Matagigantes no son campeones (no hay campeón en la unidad)');
  R.applyWounds(u, 3); eq(st(), { m: 5, g: 2, t: 3, std: true, mus: true, ws: 5 }, 'caen Matagigantes delanteros: quedan 2; estandarte y músico los recoge otro Matagigante (se conservan)');
  R.applyWounds(u, 2); eq(st(), { m: 3, g: 0, t: 3, std: true, mus: true, ws: 4 }, 'sin Matagigantes: un Matatrolls ocupa su lugar (estandarte y músico se conservan; perfil de Matatrolls HA 4)');
  R.applyWounds(u, 1); eq(st(), { m: 2, g: 0, t: 2, std: true, mus: true, ws: 4 }, 'con 2 modelos quedan ambos (músico + portaestandarte)'); R.applyWounds(u, 1); eq(st(), { m: 1, g: 0, t: 1, std: true, mus: false, ws: 4 }, 'con 1 modelo: se pierde antes el músico; el portaestandarte es el último modelo en retirarse'); R.applyWounds(u, 1); ok(u.models <= 0, 'el último modelo (el portaestandarte) cae el último');
  // el estandarte se conserva mientras quede alguna miniatura (control con bandera propia)
  const s2 = game([{ type: 'dw_slayers_g', models: 6, mix: 2, std: true, mus: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'] }); const v = U(s2, 'dw_slayers_g', 0); v.banner = v.banner || null; cur(s2); R.applyWounds(v, 4); ok(v.std && v.models === 2, 'quedan 2 modelos con portaestandarte');
});
T('fof-qa-005', F, 'Runa Maestra de Vacilación: también contra quien persigue y alcanza a la unidad que retrocedió en buen orden (cuenta como carga: sin lanza)', () => {
  const run = (bn) => { const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'dw_warriors', models: 10, std: true, banner: bn }], { f: ['empire', 'dw'] }); const a = U(s, 'empire_knights'), d = U(s, 'dw_warriors'); d.std = true; d.banner = bn; engage(s, a, d); cur(s);
    s.pursuitCharges = [{ id: a.id, target: d.id, d: 4 }]; R.resolveCombats(s, [], new Set()); ok(a.chargeOK && a.chargeTarget === d.id, 'montaje: la persecución no cuenta como carga'); a.chargeSide = 'front'; return R.attackProfile(a, d).S; };
  ok(run(null) > run('r_hesitation'), 'con la Runa el perseguidor sigue usando la lanza (cuenta como cargar)');
});
T('fof-qa-006', F, 'Runa Maestra de Vacilación: la infantería que carga sigue sin poder usar Presión del combate', () => {
  const s = game([{ type: 'state_troops', models: 20 }], [{ type: 'dw_warriors', models: 10, std: true, banner: 'r_hesitation' }], { f: ['empire', 'dw'] }); const a = U(s, 'state_troops'), d = U(s, 'dw_warriors'); a.files = 5; d.std = true; d.banner = 'r_hesitation'; engage(s, a, d); charged(s, a, d, 4); cur(s);
  eq(R.attackProfile(a, d).atk, 5, 'la infantería que carga contra la Runa usa Presión del combate (2 filas)');
});
T('fof-qa-007', F, 'Runa Maestra de Vacilación: la infantería que carga sí gana la Iniciativa por cargar', () => {
  const run = (hes) => { const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'dw_warriors', models: 10, std: true, banner: hes ? 'r_hesitation' : undefined }], { f: ['empire', 'dw'] }); const a = U(s, 'empire_knights'), d = U(s, 'dw_warriors'); d.std = true; d.banner = hes ? 'r_hesitation' : null; engage(s, a, d); charged(s, a, d, 4); cur(s); const p = R.attackProfile(a, d); return { I: R.effI(a, [d]), w: [p.S, p.ap, p.ab, p.mS] }; };
  eq(run(true), { I: 6, w: [3, 0, 0, 1] }, 'con la Runa: conserva +3 de Iniciativa por cargar (3 → 6) pero sus armas y reglas no cuentan como cargando'); eq(run(false), { I: 6, w: [5, 2, 1, 3] }, 'sin la Runa: Iniciativa igual y armas de carga (lanza)');
});
T('fof-qa-008', F, 'Escaramuzadores atrincherados (Dug In) no pierden el estado al ser cargados', () => {
  const run = (rc) => { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'dw_sapper', models: 1 }, { type: 'dw_rangers', models: 10 }], { f: ['orcs', 'dw'], phase: 'move' }); const a = put(U(s, 'orc_boyz'), 36, 40), d = put(U(s, 'dw_rangers', 1), 36, 33, Math.PI / 2); join(s, U(s, 'dw_sapper', 1), d); d.entrenched = true; cur(s); dice(6, 6); diceAll(6);
    const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'orc_boyz').id, target: U(c, 'dw_rangers', 1).id }), [0, 1], (n) => (n.title === 'Reacción a la carga' ? rc : undefined)); const q = U(o.s, 'dw_rangers', 1); return [R.engagedWith(o.s, q).length, q.entrenched]; };
  eq(run('hold'), [1, true], 'cargados y trabados siguen atrincherados'); eq(run('flee'), [0, false], 'control: si huyen (se mueven) dejan de estarlo');
});
T('fof-qa-009', F, 'Una unidad atrincherada no pierde el estado porque un modelo acepte/rechace un desafío y se mueva por las filas', () => {
  const s = game([{ type: 'orc_bigboss', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: 'dw_thane', models: 1 }, { type: 'dw_warriors', models: 10 }].filter((x) => UNITS[x.type]), { f: ['orcs', 'dw'] }); const o = U(s, 'orc_boyz'), d = U(s, 'dw_warriors'); join(s, U(s, 'orc_bigboss'), o); if (UNITS.dw_thane) join(s, U(s, 'dw_thane'), d); engage(s, o, d); d.entrenched = true; cur(s);
  diceAll(3); const q = asks(s, (x) => fight(x), [0, 1], (n) => (n.title === 'Desafío' ? (n.p === 0 ? n.opts.find((x) => x[0] !== 'no')?.[0] : 'n') : n.title === 'Desafío rechazado' ? n.opts[0]?.[0] : undefined)); ok(U(q.s, 'dw_warriors').entrenched, 'pierde el atrincheramiento');
});
T('fof-qa-010', F, 'Las runas de las cuchillas giratorias del Buscador de Fatalidad se aplican a sus Impactos de carga', () => {
  const k = Object.keys(ITEMS).find((x) => ITEMS[x].rune && ITEMS[x].cat === 'w' && ITEMS[x].S); const s = game([{ type: 'dw_doomseeker', models: 1, items: [k] }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'] }); const a = U(s, 'dw_doomseeker'), d = U(s, 'state_troops'); engage(s, a, d); charged(s, a, d, 5); cur(s);
  const p = R.attackProfile(a, d); ok(p.S >= R.D(a).S + ITEMS[k].S, 'la runa no cambia el perfil de las cuchillas: ' + k);
});
T('fof-qa-011', F, 'Un Buscador de Fatalidad no puede unirse a una unidad de Matadores (no es personaje)', () => {
  const s = game([{ type: 'dw_doomseeker', models: 1 }, { type: 'dw_slayers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'], phase: 'move' }); const a = U(s, 'dw_doomseeker'), b = U(s, 'dw_slayers'); put(a, 36, 40); put(b, 36, 36); cur(s);
  eq(R.joinCheck(s, a, b), 'Solo los personajes pueden unirse', 'se une a los Matadores'); eq(UNITS.dw_doomseeker.cat, 'inf', 'montaje: no es de categoría personaje');
});
T('fof-qa-013', F, 'El cañón de vapor del Tanque puede disparar metralla', () => {
  const s = game([{ type: 'steam_tank', models: 1 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const t = put(U(s, 'steam_tank'), 36, 30, -Math.PI / 2), e = put(U(s, 'orc_boyz'), 36, 22, Math.PI / 2); cur(s);
  ok(R.D(t).ranged2?.grape || R.D(t).ranged?.grape, 'el cañón de vapor no tiene metralla'); dice(3); diceAll(4); const ev = []; R.resolveShot(s, t, e, ev, { wpn: R.D(t).ranged2?.grape ? 1 : 0 }); ok(/metralla/.test(msgs(ev)), 'no dispara metralla: ' + msgs(ev).slice(0, 150));
});
T('fof-qa-015', F, 'El Tanque de Vapor no usa Potencia de vapor para aumentar su Movimiento al cargar', () => {
  const s = game([{ type: 'steam_tank', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const t = put(U(s, 'steam_tank'), 36, 40); const e = U(s, 'orc_boyz'); cur(s);
  const reach = (dd) => { e.x = 36; e.y = 40 - (GEOM.dims(t).d + GEOM.dims(e).d) / 2 - dd; e.face = Math.PI / 2; cur(s); return R.chargeTargets(s, t).includes(e); }; const M = R.D(t).M;
  const r0 = [reach(M + 3.3), reach(M + 6.3)]; t.fx.push({ k: 'steamP', v: 6, by: 0 }); cur(s); eq([r0, [reach(M + 3.3), reach(M + 6.3)]], [[true, false], [true, false]], 'con +6" de Potencia de vapor el alcance de carga no cambia');
});
T('fof-qa-016', F, 'Laureles de la Victoria: las heridas de la montura del portador no valen doble', () => {
  const k = Object.keys(UNITS).find((x) => UNITS[x].faction === 'empire' && UNITS[x].cat === 'char' && UNITS[x].mountAtk && !UNITS[x].wizard); const s = game([{ type: k, models: 1, items: ['laurels_v'] }], [{ type: 'snotlings', models: 6 }], { f: ['empire', 'orcs'] }); const c = U(s, k), g = U(s, 'snotlings'); engage(s, c, g); charged(s, c, g); cur(s);
  dice(); diceAll(6); const ev = fight(s); const m = msgs(ev); const bl = blows(ev, UNITS[k].name); const rider = bl.filter((b) => !/montura/.test(b.who)).reduce((t, b) => t + b.w, 0), mount = bl.filter((b) => /montura/.test(b.who)).reduce((t, b) => t + b.w, 0); const cr = /Combate: Imperio (\d+)/.exec(m);
  ok(cr, 'montaje: ' + m.slice(0, 200)); ok(+cr[1] <= 2 * rider + mount + 6, `resultado ${cr[1]}: jinete ${rider}, montura ${mount}`);
});
T('fof-qa-017', F, 'Laureles de la Victoria: las heridas de Aguantar y disparar no valen doble', () => {
  const s = game([{ type: 'empire_captain', models: 1, items: ['laurels_v'] }, { type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const c = U(s, 'empire_captain'), a = U(s, 'emp_archers'); join(s, c, a); const e = U(s, 'orc_boyz'); engage(s, e, a); charged(s, e, a); a.sasWounds = 0; e.sasWounds = 3; cur(s);
  diceAll(1); const ev = fight(s); const cr = /Combate: Imperio (\d+)/.exec(msgs(ev)); ok(cr && +cr[1] < 3 * 2 + 0, `las heridas de Aguantar y disparar cuentan doble (${cr && cr[1]})`);
});
T('fof-qa-018', F, 'Estandarte del Grifo: +2 por cada fila adicional (dos filas adicionales = +4)', () => {
  const run = (bn) => { const s = game([{ type: 'state_troops', models: 15, std: true }], [{ type: 'goblins', models: 5 }], { f: ['empire', 'orcs'] }); const u = U(s, 'state_troops'), e = U(s, 'goblins'); u.std = true; u.banner = bn; u.files = 5; engage(s, u, e); cur(s); return R.sideScore(s, [u, e], 0, new Map()); };
  eq(run('b_griffon') - run(null), 2, 'con 2 filas adicionales el Estandarte suma +2 más (total +4)');
});
T('fof-qa-020', F, 'Guardacaminos con pistolas: el Capitán (campeón) no paga +2 extra si toda la unidad cambia', () => { eq(UNITS.road_wardens_p.ppm - UNITS.road_wardens.ppm, 1, 'diferencia por modelo'); const c0 = DATA.unitCost('road_wardens', 5, { champ: true }), c1 = DATA.unitCost('road_wardens_p', 5, { champ: true }); eq(c1 - c0, 5, 'el campeón paga más'); });
T('fof-qa-021', F, 'Bendición de la Dama: un ejército de Bretonia con aliados puede rezar; un contingente aliado bretoniano en otro ejército no', () => {
  const s = game([{ type: 'br_realm', models: 6 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'] }); ok(R.D(U(s, 'br_realm')).sr.includes('blessings'), 'Bretonia no tiene la Bendición');
});
T('fof-qa-023', F, 'Estacas defensivas: la unidad sí recibe Impactos de carga', () => {
  const s = game([{ type: 'orc_boar_chariot', models: 1 }], [{ type: 'br_bowmen_stakes', models: 10 }], { f: ['orcs', 'bret'] }); const a = U(s, 'orc_boar_chariot'), d = s.units.find((x) => x.owner === 1); ok(R.D(d).sr.includes('stakes') || (d.opts || []).length, 'montaje: sin estacas'); engage(s, a, d); charged(s, a, d, 6); a.impactPend = { t: d.id, dist: 6 }; cur(s);
  diceAll(6); const ev = fight(s); ok(/Impactos de carga/.test(msgs(ev)), 'sin Impactos contra las estacas: ' + msgs(ev).slice(0, 200));
});
T('fof-qa-024', F, 'Lanza que carga y ve su avance cerrado por una unidad enemiga a su flanco donde se ensancha: Contacto accidental (virar si puede; si no, detener la carga a 1" o seguir y redirigirla)', () => {
  const run = (gap, ans, one = false) => { const s = game([{ type: 'br_realm', models: 10 }], [{ type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 5 }, { type: 'emp_archers', models: 5 }], { f: ['bret', 'empire'], phase: 'move' }); const a = U(s, 'br_realm', 0), t = U(s, 'state_troops', 1), [e1, e2] = s.units.filter((u) => u.type === 'emp_archers'); a.lance = true; put(a, 36, 40, -Math.PI / 2); put(t, 36, 20, Math.PI / 2); const de = GEOM.dims(e1); put(e1, 36 + gap / 2 + de.w / 2, 32, Math.PI / 2); if (!one) put(e2, 36 - gap / 2 - de.w / 2, 32, Math.PI / 2); else put(e2, 5, 5, Math.PI / 2); cur(s); dice(6, 6, 6, 6); diceAll(6);
    const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'br_realm', 0).id, target: U(c, 'state_troops', 1).id }), [0, 1], (n) => (n.title.includes('bloqueada') ? ans : undefined)); const a2 = U(o.s, 'br_realm', 0); return { o, a2, es: o.s.units.filter((u) => u.type === 'emp_archers'), m: msgs(o.r.events || []), pop: o.needs.find((n) => n.title === 'Carga bloqueada'), s: o.s }; };
  // huella independiente de la Lanza (casco de los rangos 1,2,3,4 modelos): trapecio + rectángulo trasero, en el marco del cargador
  const hullDist = (a, es) => { const bw = a.baseW / 25.4, bd = a.baseD / 25.4, k = 4, d = k * bd, pts = [], P = (f, l) => ({ x: a.x + l * -Math.sin(a.face) * 1 + Math.cos(a.face) * f, y: a.y + l * Math.cos(a.face) + Math.sin(a.face) * f }); const E = [[bw / 2, d / 2], [k * bw / 2, d / 2 - (k - 1) * bd], [k * bw / 2, -d / 2]]; const poly = [[-bw / 2, d / 2], [bw / 2, d / 2], ...E.slice(1), [-k * bw / 2, -d / 2], [-k * bw / 2, d / 2 - (k - 1) * bd]].map(([l, f]) => P(f, l)); for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length]; for (let q = 0; q < 200; q++) pts.push({ x: A.x + (B.x - A.x) * q / 200, y: A.y + (B.y - A.y) * q / 200 }); }
    let m = 1e9; for (const e of es) { const dm = GEOM.dims(e), c = Math.cos(e.face), sn = Math.sin(e.face); for (const p of pts) { const dx = p.x - e.x, dy = p.y - e.y, f = dx * c + dy * sn, l = -dx * sn + dy * c; m = Math.min(m, Math.hypot(Math.max(0, Math.abs(f) - dm.d / 2), Math.max(0, Math.abs(l) - dm.w / 2))); } } return m; };
  // 1) hueco de 3.8" entre dos unidades (más ancho que 3 modelos de la Lanza, más estrecho que su rango más ancho de 4): no puede esquivar → popup «Carga bloqueada»
  const h = run(3.8, 'halt'); ok(h.o.r.ok && h.pop && h.pop.opts.map((x) => x[0]).join() === 'go,halt', 'se pregunta: seguir adelante / detener la carga a 1"'); ok(/detiene su carga a 1"/.test(h.m) && /no es una carga fallida/.test(h.m), 'detener la carga: no es una carga fallida: ' + h.m);
  const dist = hullDist(h.a2, h.es); ok(dist >= 0.98 && dist < 1 + 0.8, `la Lanza se detiene con su huella a ${dist.toFixed(2)}" de las unidades enemigas (1" ≤ d < 1.8")`);
  // la punta (modelo delantero) pasa entre las dos unidades: el avance se cierra donde la Lanza se ensancha, no en el modelo de punta
  const tip = h.a2.y + Math.sin(h.a2.face) * (4 * h.a2.baseD / 25.4 / 2); ok(tip < 32.49 - 0.5, `la punta (y = ${tip.toFixed(2)}) ha entrado entre las unidades flanqueantes (borde de ataque y = 32.49): la Lanza no se frena por su modelo delantero sino donde se ensancha`);
  // 2) seguir adelante: la carga se redirige contra la unidad que cierra el paso (Contacto accidental)
  const g = run(3.8, 'go'); ok(/choca con .* \(contacto accidental\) y redirige su carga/.test(g.m), 'seguir adelante: redirige la carga contra la unidad que cierra el paso: ' + g.m.slice(0, 200));
  // 3) con una sola unidad al flanco y espacio para virar: debe virar para esquivarla y completar la carga
  const w = run(3.8, 'halt', true); ok(/vira para esquivar/.test(w.m) && !w.pop, 'si la Lanza puede rodear a la unidad enemiga, debe hacerlo: ' + w.m.slice(0, 160));
});
T('fof-qa-025', F, 'Lanzavirotes contra una Lanza: tantos impactos como filas (1-2-3 = 3)', () => {
  const s = game([{ type: 'emp_bolt', models: 1 }].filter((x) => UNITS[x.type]).concat(UNITS.emp_bolt ? [] : [{ type: 'dw_bolt', models: 1 }]), [{ type: 'br_realm', models: 6 }], { f: [UNITS.emp_bolt ? 'empire' : 'dw', 'bret'], phase: 'shoot' }); const a = s.units.find((x) => x.owner === 0); put(a, 36, 44); const t = put(U(s, 'br_realm'), 36, 24, -Math.PI / 2); t.lance = true; cur(s);
  ok(R.D(a).ranged, 'el lanzavirotes tiene arma de proyectil'); diceAll(6); const ev = []; R.resolveShot(s, a, t, ev); const m = msgs(ev); const h = /(\d+) impactos?/.exec(m); ok(h && +h[1] <= 3, 'impactos del virote contra la lanza: ' + m.slice(0, 160));
});
T('fof-qa-026', F, 'Personaje con peana de montura distinta (Duque, Barón, Doncella…) que se une a una Lanza: se admite (al frente, dentro o la Doncella al fondo); no altera la formación', () => {
  const mk = (ch) => { const s = game([{ type: 'br_realm', models: 10 }, { type: ch, models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['bret', 'empire'], phase: 'move' }); const h = U(s, 'br_realm', 0), c = U(s, ch, 0); h.lance = true; put(h, 36, 40); put(c, 36, 40 + 6); cur(s); return { s, h, c }; };
  for (const ch of ['br_duke', 'br_baron', 'br_paladin', 'br_damsel_war12', 'br_damsel_war16', 'br_prophetess_war16']) { const { s, h, c } = mk(ch); eq(R.joinCheck(s, c, h), null, UNITS[ch].name + ' se puede unir a una Lanza' + (UNITS[ch].baseW !== UNITS.br_realm.baseW || UNITS[ch].baseD !== UNITS.br_realm.baseD ? ' (peana distinta ' + UNITS[ch].baseW + 'x' + UNITS[ch].baseD + ')' : '')); }
  const { s, h, c } = mk('br_duke'); const dm0 = GEOM.dims(h); join(s, c, h); R.syncJoined(s); ok(h.lance && GEOM.dims(h).lance, 'la unidad sigue en Formación en Lanza tras unirse el personaje'); eq([GEOM.dims(h).w, GEOM.dims(h).d], [dm0.w, dm0.d], 'el bloque de la Lanza no cambia (la peana mayor «hace muy poca diferencia»)');
  ok(UNITS.br_damsel_war12.sr.includes('ladyShield') && UNITS.br_damsel_war12.baseD !== UNITS.br_realm.baseD, 'la Doncella a caballo (peana distinta) tiene Escudo de la Dama (puede ir a la retaguardia)');
});
T('fof-qa-027', F, 'Lanza trabada: los modelos de la fila de combate enemiga a su M" de la lanza cuentan en contacto', () => {
  const s = game([{ type: 'br_realm', models: 6 }], [{ type: 'we_dryads', models: 10 }], { f: ['bret', 'wood'] }); const a = U(s, 'br_realm'), d = U(s, 'we_dryads'); a.lance = true; d.files = 5; engage(s, a, d); cur(s); eq(UNITS.we_dryads.A, 2, 'montaje: A2'); eq(R.attackProfile(d, a).atk, 10, 'los 5 modelos de la fila de combate (todos a ≤ M" de la lanza) cuentan en contacto: 5 × 2 Ataques');
});
T('fof-qa-028', F, 'Una Lanza que carga no se embota si el enemigo la Contracarga', () => {
  const s = game([{ type: 'br_realm', models: 6 }], [{ type: 'empire_knights', models: 5 }], { f: ['bret', 'empire'], phase: 'move' }); const a = put(U(s, 'br_realm'), 36, 43), t = put(U(s, 'empire_knights', 1), 36, 29, Math.PI / 2); a.lance = true; cur(s);
  dice(2, 6, 6); diceAll(6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'br_realm').id, target: U(c, 'empire_knights', 1).id }), [0, 1], (n) => (n.title === 'Contracarga' ? 'y' : undefined)); const m = msgs(o.r.events || []);
  ok(/contracarga/.test(m), 'montaje: sin Contracarga: ' + m.slice(0, 200)); ok(!/se embota/.test(m), 'la lanza se embota pese a la Contracarga');
});
T('fof-qa-033', F, 'Noble de la estirpe de Jinetes Salvajes: armadura ligera y además un yelmo mágico', () => {
  const c = 'we_captain_stag'; eq(DATA.itemIssues(c, ['k_wild', 'bm_helm']), [], 'armadura ligera + yelmo mágico'); eq(DATA.itemIssues(c, ['k_wild', 'bm_hauberk']), ['Capitán del Claro en Gran Ciervo: Linaje de los Jinetes Salvajes solo permite armadura ligera'], 'control: una armadura mágica de salvación 5+ sí choca');
});
T('fof-qa-034', F, 'Un Mago con el Honor Guardián de Saphery no puede comprar armadura mágica', () => { const a = Object.keys(ITEMS).find((x) => ITEMS[x].cat === 'a' && !ITEMS[x].fac && ITEMS[x].sv && !ITEMS[x].wizOk); const iss = DATA.itemIssues('he_mage', ['h_warden', a]); eq(iss, ['Mago Alto Elfo (nivel 1): un Mago con el Honor Guardián de Saphery no puede comprar armadura mágica (FAQ FoF)'], 'admite armadura mágica: ' + a); eq(DATA.itemIssues('he_mage', [a]), [], 'control: sin el Honor sí puede'); });
T('fof-qa-036', F, 'Korhil o un Caudillo de Chracia pueden unirse a los Leones Blancos', () => { const s = game([{ type: 'he_korhil', models: 1 }, { type: 'he_whitelions', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['he', 'orcs'], phase: 'move' }); const a = put(U(s, 'he_korhil'), 36, 40), b = put(U(s, 'he_whitelions'), 36, 37); cur(s); eq(R.joinCheck(s, a, b) || null, null, 'no puede unirse'); });
