// v834 — Erratas de las FAQ (rules/new/faq_*.txt): una prueba por entrada.
// Datos: el valor que usa el motor (perfil efectivo D(u), coste, valor de lanzamiento). Reglas: la situación mínima y su efecto.
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
export function prof(type, x = {}, foe = { type: 'orc_boyz', models: 10 }, o = {}) { const f = UNITS[type].faction === 'merc' ? 'empire' : UNITS[type].faction; const s = game([{ type, models: x.models || UNITS[type].min || 1, ...x }], [foe], { f: [f, 'orcs'], ...o }); const u = U(s, type, 0); return { s, u, d: R.D(u) }; }
const cv = (k, v, id, src) => T(id, src, `${SPELLS[k]?.name || k}: valor de lanzamiento ${v}+`, () => eq(SPELLS[k].cv, v, k + '.cv'));
const pts = (k, v, id, src) => T(id, src, `${UNITS[k]?.name || ITEMS[k]?.name || k}: ${v} puntos`, () => eq((UNITS[k] ? DATA.unitCost(k, 1) : ITEMS[k].cost), v, k));
const stat = (k, c, v, id, src) => T(id, src, `${UNITS[k]?.name}: ${c} ${v}`, () => eq(prof(k).d[c], v, k + '.' + c));
const srHas = (ks, r, id, src, yes = true) => T(id, src, `${[ks].flat().map((k) => UNITS[k]?.name).join(', ')}: ${yes ? 'tiene' : 'no tiene'} ${r}`, () => { for (const k of [ks].flat()) (yes ? has : no)(prof(k).d.sr, r, k); });
const size = (k, a, b, id, src) => T(id, src, `${UNITS[k]?.name}: tamaño de unidad ${a}-${b ?? '+'}`, () => { eq(UNITS[k].min, a, 'mínimo'); if (b != null) eq(UNITS[k].max, b, 'máximo'); });
const base = (k, w, d, id, src) => T(id, src, `${UNITS[k]?.name}: peana ${w}x${d} mm`, () => { eq([UNITS[k].baseW, UNITS[k].baseD], [w, d], 'peana'); });
const F = 'rules/new/faq_';
const wiz = (s, u, lvl, spells) => { u.spells = spells; u.casted = []; u.wizLevel = lvl; return u; };

// ================= Catay =================
T('cathay-errata-001', F + 'cathay.txt:16', 'Corcel cathayano: sin Primera carga', () => { for (const k of Object.keys(UNITS).filter((k) => /^ct_/.test(k))) no(UNITS[k].sr, 'firstCharge', k); });
stat('ct_lanterns', 'T', 4, 'cathay-errata-002', F + 'cathay.txt:20');
T('cathay-errata-003', F + 'cathay.txt:22', 'Linterna celeste: el Comandante no es campeón', () => ok(!DATA.cmdAllowed('ct_lanterns').champ, 'admite campeón'));
T('cathay-errata-004', F + 'cathay.txt:25', 'Linterna celeste: sin Inquebrantable, con Inflamable', () => { const d = prof('ct_lanterns').d; no(d.sr, 'unbreakable'); has(d.sr, 'flammable'); });
T('cathay-errata-005', F + 'cathay.txt:28', 'Desenganche: al ganar y contenerse puede retirarse en buen orden — lo decide su jugador (popup)', () => {
  const s = game([{ type: 'ct_lanterns', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['ct', 'orcs'] });
  const w = U(s, 'ct_lanterns'), l = U(s, 'orc_boyz'); engage(s, w, l); cur(s);
  const o = asks(s, (c) => { const ev = []; R.disWin(c, U(c, 'ct_lanterns'), U(c, 'orc_boyz'), ev); return ev; }, [0], (n) => 'y');
  ok(o.needs.length === 1 && o.needs[0].p === 0 && o.needs[0].title === 'Desenganche', 'no pregunta al dueño de la Linterna');
  ok(U(o.s, 'ct_lanterns').fleeing || /retrocede en buen orden/.test(msgs(o.r)), 'no retrocede en buen orden');
});
T('cathay-errata-006', F + 'cathay.txt:38', 'Bombas de Linterna Celeste: una vez por partida, contra una unidad enemiga NO trabada', () => {
  const s = game([{ type: 'ct_lanterns', models: 1, items: ['ct_skybombs'] }, { type: 'ct_jade', models: 10 }], [{ type: 'orc_boyz', models: 10 }, { type: 'orc_boyz', models: 10 }], { f: ['ct', 'orcs'], phase: 'move' });
  const L = U(s, 'ct_lanterns'); const [a, b] = s.units.filter((u) => u.type === 'orc_boyz'); const g = U(s, 'ct_jade');
  put(a, 30, 20); put(b, 40, 20); engage(s, g, b, 'front', { x: 40, y: 20 }); put(L, 35, 30);
  const from = { x: 35, y: 30, face: -Math.PI / 2 }, dest = { x: 35, y: 28, face: -Math.PI / 2 }; cur(s);
  const o = asks(s, (c) => { const ev = []; R.flyAttacks(c, U(c, 'ct_lanterns'), from, dest, ev); return ev; }, [0], (n) => '-');
  const q = o.needs.find((n) => /Linterna/.test(n.title)); ok(q, 'no ofrece el Bombardeo');
  const ids = q.opts.map((x) => x[0]); has(ids, a.id, 'la unidad libre'); no(ids, b.id, 'la unidad trabada'); has(ids, '-', 'opción de no hacerlo (may)');
});
T('cathay-errata-007', F + 'cathay.txt:45', 'Cargador ogro: no es personaje (va con la máquina)', () => { for (const k of ['ct_cannon_ogre', 'ct_rockets_ogre']) eq(UNITS[k].cat, 'mach', k); ok(!Object.values(UNITS).some((v) => /Cargador ogro/i.test(v.name) && v.cat === 'char'), 'existe como personaje'); });
T('cathay-errata-008', F + 'cathay.txt:47', 'Tripulación mercenaria: el Cargador es un tripulante más de la máquina (mejora de la máquina, no unidad aparte)', () => { ok(UNITS.ct_cannon_ogre.ogreLoader && UNITS.ct_rockets_ogre.ogreLoader, 'sin Cargador como tripulación'); });
pts('ct_weijin', 60, 'cathay-errata-009', F + 'cathay.txt:16');
T('cathay-errata-010', F + 'cathay.txt:18', 'Icono de la Furia Celestial: 45 pts; Ld propio sin modificar; si lo supera, los enemigos no pueden Volar hasta el próximo Inicio de turno', () => {
  eq(ITEMS.ct_icon.cost, 45, 'coste'); ok(ITEMS.ct_icon.single, 'no es de un solo uso');
});
T('cathay-errata-011', F + 'cathay.txt:27', 'Ojo del Dragón: con 4+ el Mago debe elegir otro objetivo', () => {
  eq(ITEMS.ct_dragoneye.deye, 4, 'umbral');
  for (const [r, blocked] of [[4, true], [3, false]]) {
    const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'ct_jade', models: 10, std: true, banner: 'ct_dragoneye' }], { f: ['orcs', 'ct'], phase: 'shoot' });
    const w = wiz(s, U(s, 'orc_weirdboy'), 1, ['gaze_gork']); const t = U(s, 'ct_jade'); put(w, 36, 30, -Math.PI / 2); put(t, 36, 18, Math.PI / 2); cur(s);
    dice(r, 1, 1); const res = R.apply(s, { t: 'cast', id: w.id, spell: 'gaze_gork', target: t.id });
    eq(!res.ok, blocked, `D6=${r}`);
  }
});
pts('ct_maw', 50, 'cathay-errata-012', F + 'cathay.txt:32');
T('cathay-errata-013', F + 'cathay.txt:34', 'Máscara del Alquimista: Plaga de Óxido, hechizo ligado de nivel de poder 1', () => { eq([ITEMS.ct_mask.boundSpell, ITEMS.ct_mask.boundPL], ['plague_rust', 1]); });
T('cathay-errata-014', F + 'cathay.txt:41', 'Saber del Yin: descarta uno de sus hechizos aleatorios «as normal» (por la firma)', () => { const L = DATA.LORES.yin; ok(L && L.sig && L.pool.includes(L.sig), 'el Saber del Yin no tiene firma para el descarte normal'); });
T('cathay-errata-015', F + 'cathay.txt:47', 'Lanza cathayana: solo caballería, monstruo o carro; F y FP solo contra los cargados ese turno', () => { const L = ITEMS.ct_longma; ok(L.cavMonCh && L.chS && L.chAp, 'Lanza del Espíritu Longma sin las restricciones'); });
T('cathay-errata-016', F + 'cathay.txt:52', 'Bombas de fuego de dragón: F3', () => { eq(ITEMS.ct_dfbombs.rangedI.s, 3, 'F'); });
T('cathay-errata-017', F + 'cathay.txt:59', 'Anillo de Azabache: Espíritus Inquietos (Nigromancia), hechizo ligado de nivel 1 (sin asterisco)', () => { eq([ITEMS.ct_ringjet.boundSpell, ITEMS.ct_ringjet.boundPL], ['unquiet', 1]); ok(!/\*/.test(ITEMS.ct_ringjet.name), 'sigue con asterisco'); });
pts('ct_seal', 35, 'cathay-errata-018', F + 'cathay.txt:66');

// ================= Core =================
T('core-errata-001', F + 'core.txt:95', 'Orden cerrado en Orden de combate con US 10+: +1 RC (no con US 9; no en Columna de marcha)', () => {
  const sc = (n, files) => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'goblins', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'goblins'); a.models = a.wounds = n; a.files = files; engage(s, a, d); cur(s); return R.sideScore(s, [a, d], 0, new Map()) - R.rankBonus(a); };
  eq(sc(10, 5), 1, 'US 10'); eq(sc(9, 5), 0, 'US 9'); eq(sc(10, 2), 0, 'en columna');
});
T('core-errata-002', F + 'core.txt:98', 'Vórtice que acaba sobre una unidad: se mueve la distancia mínima para no tocar peanas', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'] });
  const u = put(U(s, 'state_troops'), 36, 24, -Math.PI / 2); cur(s);
  const q = R.vortexClear(s, 36, 24, 1.5); const dm = DATA.UNITS.state_troops; ok(!(Math.abs(q.y - 24) < 1.5 + R.D(u).baseD / 25.4 * 2 && Math.abs(q.x - 36) < 1.5 + 5 * 25 / 25.4 / 2 - 0.05), 'sigue tocando la unidad');
  const dist = Math.hypot(q.x - 36, q.y - 24), need = 1.5 + Math.min(GEO_halfW(u), GEO_halfD(u)); ok(dist <= need + 0.6, `se aleja ${dist.toFixed(2)}" (mínimo ~${need.toFixed(2)}")`);
});
export const shotNeed = (ev) => { const m = / tiros?, (\d)\+/.exec(msgs(ev)); return m ? +m[1] : null; };
function GEO_halfW(u) { return (u.files || 5) * u.baseW / 25.4 / 2; }
function GEO_halfD(u) { return Math.ceil(u.models / (u.files || 5)) * u.baseD / 25.4 / 2; }
T('core-errata-003', F + 'core.txt:101', 'Lanzar hechizos: tantos como su Nivel por turno y cada hechizo solo una vez por turno', () => {
  const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
  const w = wiz(s, U(s, 'empire_mage'), 1, ['fireball', 'arrow_attraction']); const t = put(U(s, 'orc_boyz'), 36, 14, Math.PI / 2); put(w, 36, 30); cur(s);
  w.casted = ['fireball']; ok(/Ya lanzado/.test(R.castCheck(s, w, 'fireball', t) || ''), 'deja lanzar dos veces el mismo hechizo');
});
T('core-errata-004', F + 'core.txt:104', 'Resultado de lanzamiento: 2D6 + Nivel/2 redondeando arriba (Nivel 1: 1+6 = 8 lanza Bola de Fuego 8+; 1+5 = 7 no)', () => {
  for (const [a, b, okC] of [[1, 6, true], [1, 5, false]]) {
    const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
    const w = U(s, 'empire_mage'); eq(R.D(w).wizard.level, 1, 'nivel'); wiz(s, w, 1, ['fireball']); const t = put(U(s, 'orc_boyz'), 36, 14, Math.PI / 2); put(w, 36, 30); cur(s);
    dice(a, b, 1, 1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); ok(r.ok, r.error);
    eq(/no logra lanzar/.test(msgs(r.events)), !okC, `${a}+${b}`);
  }
});
T('core-errata-005', F + 'core.txt:44', '8-9 Poder apenas controlado: el Mago no puede intentar lanzar más hechizos en el resto del turno', () => {
  const s = game([{ type: 'empire_lord', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
  const w = U(s, 'empire_lord'); wiz(s, w, 3, ['fireball', 'wind_blast']); const t = put(U(s, 'orc_boyz'), 36, 14, Math.PI / 2); put(w, 36, 30); cur(s);
  const ev = []; dice(4, 4); const r = R.miscast1(s, w, ev); eq(r, 1, 'resultado 8 = Poder apenas controlado (se lanza)'); ok(/no puede lanzar más/i.test(R.castCheck(s, w, 'wind_blast', t) || ''), 'tras la Disfunción 8-9 aún puede lanzar');
});
// Mago (o Herrero rúnico) enemigo listo para dispersar a d" del lanzador
function dispSetup(dType = 'empire_mage', o = {}) {
  const s = game([{ type: 'orc_weirdboy', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: dType, models: 1, ...(o.dx || {}) }, { type: 'state_troops', models: 10 }], { f: ['orcs', UNITS[dType].faction], phase: 'shoot' });
  const c = U(s, 'orc_weirdboy'), w = U(s, dType); put(c, 36, 34); put(w, 36, 34 - (o.d ?? 10), Math.PI / 2); cur(s); return { s, c, w };
}
T('core-errata-006', F + 'core.txt:110', 'Dispersión de Mago: no se nomina a un Mago que huye; trabado, solo contra hechizos que le apuntan a él o a su unidad', () => {
  const pool = (q) => { const o = asks(q, (c) => R.tryDispel(c, U(c, 'orc_weirdboy'), 9, false, []), [1], () => 'none'); const n = o.needs.find((x) => x.title === 'Dispersar el hechizo'); return n ? n.opts.map((x) => x[0]) : []; };
  let { s, w } = dispSetup(); has(pool(s), w.id, 'Mago libre');
  ({ s, w } = dispSetup()); w.fleeing = true; no(pool(s), w.id, 'Mago que huye');
  ({ s, w } = dispSetup()); const e = U(s, 'orc_boyz'); engage(s, e, w, 'front', { x: 36, y: 24, face: Math.PI / 2 }); put(U(s, 'orc_weirdboy'), 36, 34); cur(s); no(pool(s), w.id, 'Mago trabado contra un hechizo que no le apunta');
});
T('core-errata-007', F + 'core.txt:113', 'Dispersión de Mago: 2D6 + Nivel/2 redondeando arriba; dispersa si SUPERA el resultado de lanzamiento', () => {
  // Hechicero (nivel 1): 4+4 +1 = 9 contra 9 → no; 4+5+1 = 10 > 9 → sí
  let { s, c } = dispSetup(); dice(4, 4); ok(!R.tryDispel(s, c, 9, false, []), 'empate dispersa');
  ({ s, c } = dispSetup()); dice(4, 5); ok(R.tryDispel(s, c, 9, false, []), '10 contra 9 no dispersa');
});
T('core-errata-008', F + 'core.txt:30', 'Dispersar un vórtice que permanece en juego: el Mago debe estar a alcance de dispersión del lanzador O de la plantilla', () => {
  const run = (tx, ty) => { const s = game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_weirdboy', models: 1 }, { type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy', active: 0 });
    const w = put(U(s, 'empire_mage'), 36, 40), c = put(U(s, 'orc_weirdboy'), 36, 4, Math.PI / 2); put(U(s, 'orc_boyz'), 60, 4); cur(s);
    s.vortex = [{ x: tx, y: ty, owner: 1, src: c.id, age: 0, spell: 'foot_gork' }];
    const o = asks(s, (q) => { const ev = []; R.dispelRipOne(q, 0, c.id, 'foot_gork', ev); return ev; }, [0], () => 'none'); const n = o.needs.find((x) => x.title === 'Dispersar el hechizo'); return n ? n.opts.map((x) => x[0]) : []; };
  has(run(36, 34), U(game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 1 }]), 'empire_mage').id, 'Mago junto a la plantilla (lanzador lejos)');
  no(run(10, 4), U(game([{ type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 1 }]), 'empire_mage').id, 'Mago lejos del lanzador y de la plantilla');
});
T('core-errata-009', F + 'core.txt:121', 'Salvación especial: no la modifican las reglas que afectan a la armadura (FP)', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'we_sisters', models: 5 }], { f: ['orcs', 'wood'] }); const d = U(s, 'we_sisters'); cur(s);
  // 1 impacto F10 FP −5 (sin armadura posible): herir 2+ (dado 6), especial 4+ (dado 4): se salva
  dice(6, 4); const r = R.woundAndSave(s, d, 1, 10, 5, {}); eq(r.through, 0, 'la FP afecta a la salvación especial');
});
T('core-errata-010', F + 'core.txt:124', 'Fila de combate: cualquier fila con un modelo en contacto; los modelos de esa fila a su M" del enemigo luchan', () => {
  const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'orc_boyz'); a.files = 10; d.files = 5; engage(s, a, d); cur(s);
  const n = R.attackProfile(a, d).atk; ok(n >= 5 && n <= 10, `atacan ${n}`);
});
T('core-errata-011', F + 'core.txt:127', 'Ataques de apoyo: no por el flanco ni la retaguardia', () => {
  const mk = (side) => { const s = game([{ type: 'state_troops', models: 20, opts: ['sp'] }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'orc_boyz'); a.files = 5; d.files = 5; engage(s, a, d, side); cur(s); return R.attackProfile(a, d).atk; };
  const f = mk('front'), fl = mk('flank'); ok(f > fl, `frente ${f} ataques, flanco ${fl}: el flanco no debe tener apoyo`);
});
T('core-errata-012', F + 'core.txt:130', 'Cargar: +1 I por pulgada completa (máx. +3 al frente, +4 flanco/retaguardia), hasta un máximo de 10', () => {
  const s = game([{ type: 'he_spearmen', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['he', 'orcs'] }); const a = U(s, 'he_spearmen'), d = U(s, 'orc_boyz'); engage(s, a, d); charged(s, a, d, 6); a.chargeSide = 'front'; cur(s);
  const I0 = R.D(a).I; eq(R.effI(a, [d]), Math.min(10, I0 + 3 + 1), 'frente (6", +3, + Reflejos élficos)'); a.chargeSide = 'flank'; a.fought = true; eq(R.effI(a, [d]), Math.min(10, I0 + 4), 'flanco (+4)');
});
T('core-errata-013', F + 'core.txt:133', 'Bajas graves: Pánico si pierde MÁS del 25% de los modelos con que empezó la fase (no en la fase de Combate)', () => {
  for (const [lost, test] of [[2, false], [3, true]]) {
    const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot', active: 1 }); const u = U(s, 'state_troops'); u.models = u.wounds = 8; cur(s);
    const b0 = 8; u.models = u.wounds = 8 - lost; dice(6, 6); const ev = []; R.panicFromLosses(s, u, null, b0, ev); eq(!!(u.fleeing || /pánico/i.test(msgs(ev))), test, `${lost} de 8`);
  }
});
T('core-errata-014', F + 'core.txt:136', 'Corredores de carro: los carros amigos ven a través de ellos si están en Escaramuza y la mayoría tiene la regla', () => {
  const vis = (runners) => { const s = game([{ type: 'orc_boar_chariot', models: 1 }, { type: runners, models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const c = put(U(s, 'orc_boar_chariot'), 36, 40), r = put(U(s, runners), 36, 32), t = put(U(s, 'state_troops'), 36, 20, Math.PI / 2); cur(s); return R.losClear(s, c, t); };
  ok(vis('wolf_riders'), 'no ve a través de los Jinetes de Lobo (Corredores de carro)'); ok(!vis('orc_boyz'), 've a través de una unidad normal');
});
T('core-errata-015', F + 'core.txt:139', 'Evasivos: una vez por turno, al ser objetivo en la fase de Disparo enemiga, puede retirarse en buen orden (lo elige su jugador); no trabada', () => {
  const run = (eng) => { const s = game([{ type: 'emp_archers', models: 10 }, { type: 'state_troops', models: 10 }], [{ type: 'we_wardancers', models: 10 }], { f: ['empire', 'wood'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'we_wardancers'), 36, 26, Math.PI / 2); if (eng) engage(s, U(s, 'state_troops'), t, 'flank', { x: 36, y: 26, face: Math.PI / 2 }); cur(s);
    return asks(s, (c) => { const ev = []; R.resolveShot(c, U(c, 'emp_archers'), U(c, 'we_wardancers'), ev); return ev; }, [1], () => 'y'); };
  const o = run(false); ok(o.needs.some((n) => n.title === 'Evasivos' && n.p === 1), 'no pregunta al dueño'); ok(U(o.s, 'we_wardancers').fleeing || /Evasivos/.test(msgs(o.r)), 'no se retira');
  const o2 = run(true); ok(!o2.needs.some((n) => n.title === 'Evasivos'), 'trabada puede evadirse');
});
T('core-errata-016', F + 'core.txt:142', 'Disparar y huir: reacción a la carga solo si la mayoría de los modelos tiene la regla (y armas de proyectil)', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'pistoliers', models: 5 }], { f: ['orcs', 'empire'], phase: 'move' }); const a = put(U(s, 'orc_boyz'), 36, 36), t = put(U(s, 'pistoliers'), 36, 26, Math.PI / 2); cur(s);
  const o = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'orc_boyz').id, target: U(c, 'pistoliers').id }), [1], () => 'hold');
  const q = o.needs.find((n) => /reacci|carga/i.test(n.title)); ok(q && q.p === 1, 'no pregunta la reacción al dueño de los Pistoleros'); ok(q.opts.some((x) => x[0] === 'fireflee'), 'no ofrece Disparar y huir');
});
T('core-errata-017', F + 'core.txt:56', 'Volar (X): al perseguir no vuela → hace el chequeo de terreno peligroso que atraviesa (el Etéreo no)', () => {
  for (const [type, eth, lost] of [['we_warhawks', false, 1], ['we_warhawks', true, 0]]) {
    const s = game([{ type, models: 3 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'] }); const w = put(U(s, type), 36, 30, -Math.PI / 2);
    s.terrain.push({ id: 'dz', kind: 'swamp', danger: true, x: 36, y: 25, w: 6, h: 2 }); cur(s); const d0 = R.D(w); if (eth) d0.sr.push('ethereal');
    const W0 = w.wounds; dice(1, 1, 1, 6, 6, 6); withSr(type, eth ? ['ethereal'] : [], () => R.movePursuer(s, w, -Math.PI / 2, 8));
    eq(W0 - w.wounds > 0 ? 1 : 0, lost, eth ? 'Etéreo' : 'Volador que persigue');
  }
});
T('core-errata-018', F + 'core.txt:148', 'Frenesí: +1 A el turno en que carga (o tras un seguimiento), no a la montura', () => {
  withSr('he_silverhelms', 'frenzy', () => {
    const s = game([{ type: 'he_silverhelms', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['he', 'orcs'] }); const a = U(s, 'he_silverhelms'), d = U(s, 'orc_boyz'); engage(s, a, d); cur(s);
    const p0 = R.attackProfile(a, d); charged(s, a, d, 2); const p1 = R.attackProfile(a, d);
    eq(p1.atk - p0.atk, 5, '+1 A por modelo'); eq(Math.round(p1.atk * p1.mountFrac), Math.round(p0.atk * p0.mountFrac), 'ataques de la montura');
  });
});
T('core-errata-019', F + 'core.txt:73', 'Impactos de carga: se resuelven al elegir el combate (paso 1.1), impactan solos, sus heridas cuentan para el resultado y la unidad sigue trabada', () => {
  const s = game([{ type: 'orc_boar_chariot', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'] });
  const a = U(s, 'orc_boar_chariot'), d = U(s, 'state_troops'); engage(s, a, d); charged(s, a, d, 6); a.impactPend = { t: d.id, dist: 6 };
  diceAll(6); const ev = fight(s); const m = msgs(ev);
  ok(/Impactos de carga de .*: \d+ impactos → 7 bajas/.test(m), 'impactos: ' + m.slice(0, 120));
  ok(/golpea a Tropas Estatales/.test(m), 'tras los impactos el combate no se lucha (la unidad dejó de estar en contacto)');
  ok(m.indexOf('Impactos de carga') < m.indexOf('golpea'), 'los impactos no van antes de los golpes');
  const cr = /Combate: Orcos (\d+)/.exec(m); ok(cr && +cr[1] >= 8, 'las heridas de los impactos no cuentan para el resultado: ' + (cr && cr[0]));
});
T('core-errata-020', F + 'core.txt:154', 'Impetuosa: si puede declarar una carga, chequeo de Ld; falla → debe cargar, supera → actúa con normalidad', () => {
  for (const [a, b, fail] of [[6, 6, true], [2, 2, false]]) {
    const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const u = put(U(s, 'orc_boyz'), 36, 34), t = put(U(s, 'state_troops'), 36, 26, Math.PI / 2); cur(s);
    dice(a, b); const ev = []; R.impetuousTests(s, ev); eq(!!u.impFail, fail, `${a}+${b}`);
  }
  { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const u = put(U(s, 'orc_boyz'), 10, 44), t = put(U(s, 'state_troops'), 60, 4, Math.PI / 2); cur(s); dice(6, 6); R.impetuousTests(s, []); ok(!u.impK, 'chequea sin poder cargar'); }
});
T('core-errata-021', F + 'core.txt:157', 'Objetivo grande: sin cobertura; se le ve a través de unidades que no son grandes; quien le dispara usa una fila más', () => {
  const s = game([{ type: 'emp_archers', models: 10 }, { type: 'state_troops', models: 10 }], [{ type: 'we_treeman', models: 1 }], { f: ['empire', 'wood'], phase: 'shoot' });
  const a = put(U(s, 'emp_archers'), 36, 40), blk = put(U(s, 'state_troops'), 36, 32), t = put(U(s, 'we_treeman'), 36, 20, Math.PI / 2); cur(s); ok(R.losClear(s, a, t), 'no ve al Hombre Árbol a través de infantería');
  s.terrain.push({ kind: 'forest', x: 36, y: 20, w: 8, h: 8 }); const ev = []; R.resolveShot(s, a, t, ev); eq(shotNeed(ev), 5, 'Objetivo grande en el bosque (4+ HP, +1 largo alcance, sin cobertura)');
  const s2 = game([{ type: 'emp_archers', models: 10 }], [{ type: 'we_glade_guard', models: 10 }], { f: ['empire', 'wood'], phase: 'shoot' }); const a2 = put(U(s2, 'emp_archers'), 36, 40), t2 = put(U(s2, 'we_glade_guard'), 36, 20, Math.PI / 2); s2.terrain.push({ kind: 'forest', x: 36, y: 20, w: 8, h: 8 }); cur(s2); const ev2 = []; R.resolveShot(s2, a2, t2, ev2); eq(shotNeed(ev2), 6, 'infantería en el bosque (control: +1 cobertura)');
});
T('core-errata-022', F + 'core.txt:160', 'Cuidadores de monstruos: por cada Herida no salvada, 1-4 la pierde el monstruo y 5+ cae un cuidador', () => {
  const s = game([{ type: 'de_hydra', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['de', 'orcs'] }); const h = U(s, 'de_hydra'); cur(s); const w0 = h.wounds, h0 = h.handlers ?? 2;
  dice(4, 5); R.applyWounds(h, 2); eq(w0 - h.wounds, 1, 'Heridas perdidas por el monstruo'); eq(h0 - h.handlers, 1, 'cuidadores perdidos');
});
T('core-errata-023', F + 'core.txt:163', 'Ataques envenenados: un 6 natural al impactar da +2 a la tirada para herir (no hiere automáticamente)', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'dw_warriors', models: 10 }], { f: ['orcs', 'dw'] }); const d = U(s, 'dw_warriors'); cur(s);
  // F3 contra R4: 5+; con +2 → 3+. Dado 2 falla, dado 3 hiere
  dice(2); eq(R.woundAndSave(s, d, 1, 3, 0, { wmod: 2, noArmour: true }).through, 0, 'un 2 hiere (veneno automático)');
  dice(3, 1); eq(R.woundAndSave(s, d, 1, 3, 0, { wmod: 2, noArmour: true }).through, 1, 'un 3 no hiere con +2');
});
T('core-errata-024', F + 'core.txt:116', 'Movimiento aleatorio: al mover se tiran los dados (2D6 del Carro Bomba) y ese es su movimiento máximo', () => {
  const s = game([{ type: 'pump_wagon', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'move' }); const u = put(U(s, 'pump_wagon'), 36, 40), e = put(U(s, 'state_troops'), 36, 4, Math.PI / 2); cur(s);
  dice(2, 3); diceAll(1); const ev = []; R.randomMoves(s, ev); const d = Math.hypot(u.x - 36, u.y - 40); ok(d > 0.5 && d <= 5 + 1e-6, `se mueve ${d.toFixed(2)}" con 2+3`);
});
T('core-errata-025', F + 'core.txt:169', 'Regeneración: la Herida recuperada cuenta para el resultado del combate', () => {
  const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'trolls', models: 3 }], { f: ['orcs', 'orcs'] }); const t = U(s, 'trolls'); cur(s);
  diceAll(6); const r = R.woundAndSave(s, t, 1, 5, 2, {}); eq([r.through, r.regen], [0, 1], 'herida regenerada');
  // combate: Orcos contra Trolls, todos los dados 6: los Trolls regeneran todo, pero las heridas cuentan para los Orcos
  const s2 = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'trolls', models: 3 }], { f: ['orcs', 'orcs'] }); const a2 = U(s2, 'orc_boyz'), t2 = U(s2, 'trolls'); engage(s2, a2, t2); charged(s2, a2, t2, 5); diceAll(6); const ev = fight(s2);
  const m = /Combate: .*? (\d+) – (\d+) /.exec(msgs(ev)); ok(m, 'sin resultado'); eq(t2.wounds, 9, 'los Trolls no regeneran'); ok(+m[1] >= 5, 'el resultado de los Orcos no cuenta las heridas regeneradas: ' + m[0]);
});
T('core-errata-026', F + 'core.txt:172', 'Movimiento de reserva: no si cargó, marchó o huyó; al final de la fase de Disparo', () => {
  const s = game([{ type: 'tk_horse_archers', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['tk', 'orcs'], phase: 'shoot' }); const u = put(U(s, 'tk_horse_archers'), 36, 34); cur(s);
  ok(R.canReserve(s, u), 'no puede'); u.marched = true; ok(!R.canReserve(s, u), 'tras marchar'); u.marched = false; u.charged = true; ok(!R.canReserve(s, u), 'tras cargar');
});
T('core-errata-027', F + 'core.txt:141', 'Pisotones: se hacen los últimos (tras todos los ataques, incluidos los de I 1) e impactan solos', () => {
  const s = game([{ type: 'we_treekin', models: 3 }], [{ type: 'goblins', models: 20 }], { f: ['wood', 'orcs'] }); const a = U(s, 'we_treekin'), d = U(s, 'goblins'); engage(s, a, d); charged(s, a, d);
  diceAll(4); const ev = fight(s), m = ev.map((e) => e.msg); const iS = m.findIndex((x) => /pisotea a/.test(x)), iG = m.map((x) => /golpea a/.test(x)).lastIndexOf(true);
  ok(iS > iG && iG >= 0, 'los pisotones no van después de todos los golpes: ' + m.slice(0, 6).join(' / '));
  const st = /pisotea a .* \((\d+) impactos\)/.exec(m[iS]); ok(st && +st[1] >= 1, 'sin impactos automáticos');
});
T('core-errata-028', F + 'core.txt:178', 'Estupidez: no trabada ni huyendo; Ld en el Inicio de turno; no mueve (salvo huir), no dispara, no lanza, no dispersa, Mantiene si la cargan', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'shoot' }); const u = put(U(s, 'emp_archers'), 36, 40); u.stupid = true; cur(s);
  const t = put(U(s, 'state_troops'), 36, 24, Math.PI / 2); ok(/Estúpida: no puede disparar/.test(R.shootCheck(s, u, t)), 'la unidad estúpida puede disparar'); u.stupid = false; eq(R.shootCheck(s, u, t), null, 'sin Estupidez sí puede disparar (control)');
  s.phase = 'move'; u.stupid = true; const m = R.previewMove(s, u.id, { x: 36, y: 36, face: u.face }); eq([m.ok, m.reason], [false, 'Estúpida: no puede mover (FAQ p.178)'], 'no mueve'); u.stupid = false; const m2 = R.previewMove(s, u.id, { x: 36, y: 36, face: u.face }); ok(m2.ok, 'sin Estupidez sí mueve (control): ' + m2.reason);
});
T('core-errata-029', F + 'core.txt:115', 'Zancada veloz: +3" al alcance máximo de carga (solo si toda la unidad la tiene) y +D6 opcional (popup)', () => {
  const reach = (dy, jn) => { const s = game([{ type: 'empire_knights', models: 5 }, { type: 'empire_captain', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'move' });
    const k = put(U(s, 'empire_knights', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 40 - dy, Math.PI / 2); if (jn) R.D(k).sr; cur(s); return R.chargeTargets(s, k).includes(t); };
  const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'move' }); const k = put(U(s, 'empire_knights', 0), 36, 40); const dk = R.GEOM ? 0 : 0;
  const t = put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); cur(s); const gap = (y) => { t.y = y; return GEOM.unitDist ? GEOM.unitDist(k, t) : null; };
  // distancia de borde a borde = M 7 + 6 + 3 = 16"
  const at = (dd) => { let lo = 0, hi = 60; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; t.y = m; if (40 - m - (GEOM.dims(k).d + GEOM.dims(t).d) / 2 > dd) lo = m; else hi = m; } t.y = hi; cur(s); return R.chargeTargets(s, k).includes(t); };
  ok(at(15.9), 'a 15,9" no se puede declarar (M7 + 6 + 3)'); ok(!at(16.2), 'a 16,2" se puede declarar');
  at(10); dice(3, 3, 6); const o = asks(s, (c) => R.apply(c, { t: 'charge', id: k.id, target: t.id }), [0, 1], (n) => n.title === 'Zancada veloz' ? 'y' : n.opts?.[0]?.[0]);
  ok(o.needs.some((n) => n.title === 'Zancada veloz' && n.p === 0), 'no pregunta la Zancada veloz al cargar');
});
T('core-errata-030', F + 'core.txt:122', 'Inestable: las Heridas perdidas por Inestable no se recuperan con Regeneración', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'tk_warriors', models: 10 }], { f: ['orcs', 'tk'] }); const a = U(s, 'orc_boyz'), d = U(s, 'tk_warriors'); d.files = 10; engage(s, a, d); charged(s, a, d);
  dice(); diceAll(6); const ev = fight(s); const m = msgs(ev); const r = /Inestable: pierde (\d+) Heridas \((\d+) bajas\)/.exec(m); ok(r, 'sin Inestable: ' + m.slice(0, 300));
  ok(+r[2] === +r[1], `pierde ${r[1]} Heridas pero solo ${r[2]} bajas (se regeneran)`); ok(!/regenera/i.test(m.slice(m.indexOf('Inestable'))), 'Regeneración tras Inestable');
});
T('core-errata-031', F + 'core.txt:187', 'Vanguardia: la unidad que hace el movimiento no puede declarar cargas en su primer turno', () => {
  const s = game([{ type: 'outriders', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'move', turn: 1 }); const u = put(U(s, 'outriders'), 36, 34), t = put(U(s, 'state_troops'), 36, 28, Math.PI / 2); cur(s);
  ok(R.chargeTargets(s, u).length > 0, 'sin objetivo de carga posible'); u.vgMoved = true; eq(R.chargeTargets(s, u).length, 0, 'tras la Vanguardia puede cargar en el turno 1');
});
T('core-errata-032', F + 'core.txt:190', 'Banda de guerra: sin el bonus al Ld en Contención ni en el chequeo de Impetuosidad', () => {
  const s = game([{ type: 'orc_boyz', models: 20 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const u = U(s, 'orc_boyz'); u.files = 5; cur(s);
  ok(R.ldOf(s, u) > R.ldOf(s, u, true), 'la Banda de guerra no suma al Ld normal'); eq(R.ldOf(s, u, true), R.D(u).Ld, 'Ld en Contención/Impetuosidad');
});
T('core-errata-033', F + 'core.txt:193', 'Giro rápido: sin marchar, una unidad en Orden abierto pivota gratis hasta 90° tras mover', () => {
  const pv = (type, march) => { const s = game([{ type, models: UNITS[type].min || 1 }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[type].faction, 'orcs'], phase: 'move' }); const u = put(U(s, type), 36, 34); cur(s); return R.previewMove(s, u.id, { x: 36, y: 31, face: 0 }, march); };
  const a = pv('tk_chariot', false), b = pv('tk_chariot', true), c = pv('state_troops', false);
  ok(a.ok && Math.abs(a.cost - 3) < 0.01, 'Orden abierto sin marchar: el giro de 90° no es gratis (' + JSON.stringify(a).slice(0, 120) + ')');
  ok(!b.ok || b.cost > 3.01, 'marchando también es gratis'); ok(!c.ok || c.cost > 3.01, 'Orden cerrado también gira gratis');
});
T('core-errata-034', F + 'core.txt:143', 'Escaramuzadores en combate: mantienen la formación cerrada mientras sigan trabados; al acabar el combate vuelven a separarse', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'goblins', models: 20 }], { f: ['empire', 'orcs'] }); const a = U(s, 'emp_archers'), d = U(s, 'goblins'); a.sp = 0; a.spPref = 1; engage(s, a, d); cur(s);
  R.reSpreadSk(s, a); eq(GEOM.dims(a).sp || 0, 0, 'se separa estando trabada');
  put(d, 60, 4); cur(s); R.reSpreadSk(s, a); ok((GEOM.dims(a).sp || 0) > 0, 'no se separa al acabar el combate');
});
T('core-errata-035', F + 'core.txt:152', 'Escaramuzadores: solo cargan a una unidad visible para MÁS de la mitad de sus modelos', () => {
  const run = (bw) => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'goblins', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'goblins'), 36, 30, Math.PI / 2); a.files = 10; a.sp = 0;
    s.terrain.push({ id: 'blk', kind: 'ruin', x: 36 - 6 + bw / 2, y: 35, w: bw, h: 1, impassable: true }); cur(s); return R.chargeTargets(s, a).includes(t); };
  ok(run(1) || run(0.5), 'con casi todos viendo no puede cargar'); ok(!run(9), 'con casi ninguno viendo puede cargar');
});
T('core-errata-036', F + 'core.txt:202', 'Infantería regular: Presión del combate (2 filas salvo al cargar), Infantería masiva (+1 RC con mayor US), Parada (+1 armadura con arma de mano y escudo, máx. 3+)', () => {
  const s = game([{ type: 'state_troops', models: 20, opts: ['sh'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'orc_boyz'); a.files = 5; d.files = 5; engage(s, a, d); cur(s);
  const n0 = R.attackProfile(a, d).atk; charged(s, a, d, 4); const n1 = R.attackProfile(a, d).atk; eq([n0, n1], [10, 5], 'Presión del combate (no cargando / cargando)');
  // Infantería masiva: 20 contra 10 → +1
  const g = [a, d]; a.chargeOK = false; const sc = R.sideScore(s, g, 0, new Map()) - R.rankBonus(a) - 1 /* orden cerrado */; eq(sc, 1, 'Infantería masiva');
  // Parada: armadura 5+ (ligera+escudo… la del perfil) mejora a 4+ en combate; no contra disparos
  diceAll((n) => 4); const sv0 = R.svOf(a);
  dice(6, 4, 1); const mel = R.woundAndSave(s, a, 1, 3, 0, {}).through; dice(6, 4, 1); const rng = R.woundAndSave(s, a, 1, 3, 0, { ranged: true }).through;
  ok(sv0 === 5 ? mel === 0 && rng === 1 : true, `Parada: combate ${mel} / disparo ${rng} con un 4 (armadura ${sv0}+)`);
});
T('core-errata-037', F + 'core.txt:205', 'Infantería pesada: también Presión del combate, Infantería masiva y Parada', () => {
  const s = game([{ type: 'dw_warriors', models: 20 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'] }); const a = U(s, 'dw_warriors'), d = U(s, 'orc_boyz'); a.files = 5; engage(s, a, d); cur(s);
  eq(R.D(a).tt, 'heavyInf', 'tipo'); eq(R.attackProfile(a, d).atk, 10, 'Presión del combate');
});
T('core-errata-038', F + 'core.txt:208', 'Arma de guerra: la máquina pivota libremente sobre su centro antes de disparar (puede disparar a un objetivo a su espalda; pivotar no es mover)', () => {
  const s = game([{ type: 'great_cannon', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const c = put(U(s, 'great_cannon'), 36, 40, Math.PI / 2), t = put(U(s, 'orc_boyz'), 36, 20, Math.PI / 2); cur(s);
  eq(R.shootCheck(s, c, t), null, 'no puede disparar a un objetivo a su espalda'); const ev = []; R.resolveShot(s, c, t, ev); ok(!c.moved, 'pivotar cuenta como mover');
});
T('core-errata-039', F + 'core.txt:211', 'Disparar a personajes: un Personaje a 3" de una unidad amiga de 5+ modelos del mismo tipo no puede ser blanco (salvo que sea el más próximo); con menos de 5 modelos o a más de 3" sí', () => {
  const sc = (nb, gap) => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_bigboss', models: 1 }, { type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
    const a = put(U(s, 'emp_archers'), 36, 40), b = put(U(s, 'orc_boyz'), 36, 28, Math.PI / 2), c = put(U(s, 'orc_bigboss'), 36 + 2 + gap, 26, Math.PI / 2); b.models = nb; cur(s); return { l: R.legalShootTargets(s, a).map((x) => x.id), c: c.id, why: R.shootCheck(s, a, c) }; };
  const p = sc(10, 3), q = sc(4, 3), r = sc(10, 6);
  no(p.l, p.c, '5+ modelos a 3": el personaje está protegido'); ok(/protegido/.test(p.why), 'motivo: ' + p.why);
  ok(q.l.includes(q.c) && q.why === null, 'con 4 modelos no lo protegen'); ok(r.l.includes(r.c) && r.why === null, 'a más de 3" no lo protege la unidad');
});
T('core-errata-040', F + 'core.txt:168', 'Desafíos y monturas: si un participante muere antes de que ataque su montura, los ataques de la montura se pierden', () => {
  const s = game([{ type: 'empire_general', models: 1, items: [] }], [{ type: 'orc_bigboss_boar', models: 1 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_general'), d = U(s, 'orc_bigboss_boar'); engage(s, a, d); charged(s, a, d);
  d.wounds = 1; dice(6, 6, 6, 6, 6, 6); diceAll(1); const o = asks(s, (c) => fight(c), [0, 1], (n) => (n.title === 'Desafío' ? n.opts.find((x) => x[0].startsWith('s:'))?.[0] : undefined));
  const m = msgs(o.r); ok(/desaf/i.test(m) || o.needs.some((n) => n.title === 'Desafío'), 'no hay desafío (montaje)');
  ok(U(o.s, 'orc_bigboss_boar').models === 0, 'el Gran Jefe no muere (montaje): ' + m.slice(0, 200));
  ok(!/Gran Jefe Orco sobre jabal[ií] golpea|Jabal[ií] golpea/i.test(m), 'el muerto o su montura atacan: ' + m.slice(0, 300));
});
T('core-errata-041', F + 'core.txt:217', 'Mayal: F+2, FP −2, Perforación (1), dos manos; F y Perforación solo contra los cargados este turno', () => {
  const s = game([{ type: 'woc_marauders', models: 10, opts: ['fl'] }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'] }); const a = U(s, 'woc_marauders'), d = U(s, 'state_troops'); engage(s, a, d); cur(s);
  const p0 = R.attackProfile(a, d); charged(s, a, d, 4); const p1 = R.attackProfile(a, d); eq([p0.S, p0.ap, p0.ab || 0], [3, 2, 0], 'sin cargar'); eq([p1.S, p1.ap, p1.ab], [5, 2, 1], 'cargando');
});
T('core-errata-042', F + 'core.txt:183', 'Varias armas de combate: se elige en el paso 1.1 de cada subfase de combate (popup en cada ronda, sin bloqueo entre rondas)', () => {
  // (el arma de asta de Bretonia también se elige en cada paso 1.1: FAQ FoF Page 92, prueba fof-errata-025)
  // Alabardas + escudo: arma de mano y escudo (Parada) o alabarda (core.txt:7210: todo modelo lleva arma de mano)
  const s = game([{ type: 'state_troops', models: 10, opts: ['hb', 'sh'] }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'orc_boyz'); engage(s, a, d); cur(s);
  diceAll(1); const o1 = asks(s, (c) => fight(c), [0]); ok(o1.needs.some((n) => n.title === 'Arma de combate' && n.p === 0), 'no pregunta el arma en la 1.ª ronda');
  const s2 = o1.s; s2.turn++; s2.round++; for (const u of s2.units) { u.fought = true; u.charged = false; u.chargeOK = false; } cur(s2); const o2 = asks(s2, (c) => fight(c), [0]);
  ok(o2.needs.some((n) => n.title === 'Arma de combate' && n.p === 0), 'no pregunta el arma en la 2.ª ronda (bloqueo entre rondas borrado por la FAQ)');
});
T('core-errata-043', F + 'core.txt:223', 'Alabarda: F+1, FP −1 (−2 contra los cargados este turno), Perforación (1), dos manos', () => {
  const s = game([{ type: 'state_troops', models: 10, opts: ['hb'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'state_troops'), d = U(s, 'orc_boyz'); engage(s, a, d); cur(s);
  const p0 = R.attackProfile(a, d); charged(s, a, d, 4); const p1 = R.attackProfile(a, d); eq([p0.S, p0.ap, p0.ab], [4, 1, 1], 'sin cargar'); eq([p1.S, p1.ap, p1.ab], [4, 2, 1], 'cargando');
});
T('core-errata-044', F + 'core.txt:226', 'Lucero del alba: F+1, FP −1, Perforación (1); F y Perforación solo contra los cargados este turno', () => {
  const chk = (type, opts, extra = {}) => { const s = game([{ type, models: UNITS[type].min || 1, opts, ...extra }], [{ type: 'state_troops', models: 10 }, { type: 'state_troops', models: 10 }], { f: [UNITS[type].faction, 'empire'], ...(extra.cg ? { cg: extra.cg } : {}) }); const a = U(s, type), [d, d2] = s.units.filter((x) => x.type === 'state_troops'); engage(s, a, d); cur(s);
    const S0 = R.D(a).S; const p0 = R.attackProfile(a, d); charged(s, a, d, 4); const p1 = R.attackProfile(a, d), p2 = R.attackProfile(a, d2);
    const sv = (p) => p.parts ? p.parts.map((x) => [x.S, x.ap, x.ab]) : [[p.S, p.ap, p.ab || 0]]; return { s0: sv(p0), s1: sv(p1), s2: sv(p2), S0 }; };
  let r = chk('br_duke_foot', ['ms']); eq(r.s0, [[r.S0, 1, 0]], 'Duque a pie sin cargar'); eq(r.s1, [[r.S0 + 1, 1, 1]], 'cargando'); eq(r.s2, [[r.S0, 1, 0]], 'contra otra unidad no cargada');
  r = chk('imp_ogres', ['ms', 'ms', 'ms']); ok(r.s1.some((x) => x[0] === r.S0 + 1 && x[2] === 1) && !r.s0.some((x) => x[0] === r.S0 + 1), 'Ogros Imperiales: ' + JSON.stringify(r));
});
T('core-errata-045', F + 'core.txt:229', 'Lanza: solo caballería o monstruo; solo el turno en que carga; F y FP solo contra los cargados ese turno', () => {
  const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_knights'), d = U(s, 'orc_boyz'); engage(s, a, d); cur(s);
  const p0 = R.attackProfile(a, d); charged(s, a, d, 4); const p1 = R.attackProfile(a, d); ok(p1.S > p0.S, `lanza: F ${p0.S} → ${p1.S}`);
});
T('core-errata-046', F + 'core.txt:232', 'Armadura máxima: infantería/caballería 2+; carro, monstruo o máquina 3+', () => {
  const s = game([{ type: 'empire_knights', models: 5 }, { type: 'steam_tank', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const k = U(s, 'empire_knights'), t = U(s, 'steam_tank'); cur(s);
  k.fx.push({ k: 'wfFlesh' }, { k: 'oathS', v: 1 }); t.fx.push({ k: 'wfFlesh' }); eq(R.svOf(k), 2, 'caballería'); eq(R.svOf(t), 3, 'carro');
});
T('core-errata-047', F + 'core.txt:244', 'Bala de cañón (Aplastamiento): si la trayectoria encuentra una colina se detiene y no golpea a más modelos', () => {
  const run = (hill) => { const s = game([{ type: 'great_cannon', models: 1 }], [{ type: 'state_troops', models: 10 }, { type: 'goblins', models: 10 }], { f: ['empire', 'empire'], phase: 'shoot' });
    const c = put(U(s, 'great_cannon'), 36, 44), t = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2), b = put(U(s, 'goblins', 1), 36, 21, Math.PI / 2); c.aimPt = { x: 36, y: 31 };
    if (hill) s.terrain.push({ id: 'h', kind: 'hill', x: 36, y: 25, w: 12, h: 2 }); cur(s); dice(1, 5); diceAll(6);
    const o = asks(s, (q) => { const ev = []; R.resolveShot(q, U(q, 'great_cannon'), U(q, 'state_troops', 1), ev, { wpn: 0 }); return ev; }, [0]); // arma elegida al declarar el disparo (bala)
    return U(o.s, 'goblins', 1).models; };
  ok(run(false) < 10, 'sin colina el rebote no golpea a la unidad de detrás (montaje)'); eq(run(true), 10, 'con colina la bala sigue');
});
T('core-errata-048', F + 'core.txt:246', 'Bosques: cobertura parcial si más de la mitad de los modelos está dentro', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'we_glade_guard', models: 10 }], { f: ['empire', 'wood'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'we_glade_guard'), 36, 20, Math.PI / 2); t.files = 10; cur(s);
  s.terrain.push({ kind: 'forest', x: 38, y: 20, w: 8, h: 6 }); const c1 = R.coverMod(s, a, t); s.terrain[0].x = 40.5; s.terrain[0].w = 6; const c2 = R.coverMod(s, a, t);
  eq(c1, 1, 'más de la mitad dentro'); eq(c2, 0, 'menos de la mitad dentro (y nada interpuesto)');
});
T('core-errata-049', F + 'core.txt:249', 'Muertos o huidos: reducida al 25% de su US inicial o menos (o de sus Heridas si US = Heridas) → 50% de su coste', () => {
  const vp = (left, type = 'state_troops', n = 20) => { const s = game([{ type: 'orc_boyz', models: 10 }], [{ type, models: n }], { f: ['orcs', 'empire'] }); const u = U(s, type, 1); const pts = R.unitPts(u); u.models = left; u.wounds = left * R.D(u).W; cur(s); return [R.scoreVP(s, 0), Math.ceil(pts / 2)]; };
  let [v, h] = vp(5); eq(v, h, '5 de 20'); [v] = vp(6); eq(v, 0, '6 de 20');
});
// vórtice en juego: se coloca la plantilla y se resuelve la subfase de Inicio de turno del jugador p con dados fijados
function vxRun(spell, o = {}) {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy', active: o.active ?? 0 });
  const w = put(U(s, 'empire_mage'), 10, 44), fr = put(U(s, 'state_troops'), 60, 40), e = put(U(s, 'orc_boyz'), 36, 24, Math.PI / 2); cur(s);
  s.vortex = [{ x: o.x ?? 36, y: o.y ?? 24, owner: 0, src: w.id, age: 0, spell }]; return { s, w, fr, e };
}
const vxHits = (spell, hitsExpr, S, ap, enemyOnly, id, src) => T(id, src, `${SPELLS[spell].name}: terreno difícil, se dispersa D6" cada Inicio de turno, ${hitsExpr} impactos F${S} FP −${ap} a ${enemyOnly ? 'unidades enemigas' : 'cualquier unidad'} que atraviese`, () => {
  const v = SPELLS[spell].vx; ok(v && v.diff, 'no es terreno difícil'); eq([v.hits, v.S, v.ap], [hitsExpr, S, ap], 'impactos'); eq(!v.all, enemyOnly, 'a quién afecta'); ok(!v.still, 'no se mueve');
  // con el dado de dispersión «¡Impacto!» no se mueve ni impacta (Core p.95): la unidad enemiga bajo la plantilla no recibe impactos
  const { s, e } = vxRun(spell); dice(1); const ev = []; R.beginStrategy(s, ev); ok(/no se mueve/.test(msgs(ev)), 'con «¡Impacto!» se mueve: ' + msgs(ev).slice(0, 160)); eq(e.models, 10, 'impacta sin moverse');
});
vxHits('pillar_fire', 'D3+3', 3, 2, true, 'core-errata-050', F + 'core.txt:299');
cv('arcane_urgency', 9, 'core-errata-051', F + 'core.txt:302'); cv('cowardly_flight', 8, 'core-errata-052', F + 'core.txt:305');
cv('dm_steed', 8, 'core-errata-053', F + 'core.txt:257'); cv('dm_vessel', 9, 'core-errata-054', F + 'core.txt:259');
vxHits('dm_vortex', 'D6+1', 3, 0, false, 'core-errata-055', F + 'core.txt:261');
cv('dk_gateway', 9, 'core-errata-056', F + 'core.txt:268'); cv('flaming_sword', 7, 'core-errata-057', F + 'core.txt:271');
vxHits('elem_spirit', 'D3+3', 4, 1, true, 'core-errata-058', F + 'core.txt:273');
cv('earthen_ramparts', 9, 'core-errata-059', F + 'core.txt:280');
T('core-errata-060', F + 'core.txt:257', 'Senda Mística: objetivo amigo que no huye ni ha movido en esta fase de Movimiento', () => {
  const s = game([{ type: 'empire_mage', models: 1 }, { type: 'state_troops', models: 10 }, { type: 'emp_archers', models: 10 }, { type: 'empire_knights', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' });
  const w = put(U(s, 'empire_mage'), 36, 40), a = put(U(s, 'state_troops'), 30, 40), b = put(U(s, 'emp_archers'), 42, 40), k = put(U(s, 'empire_knights'), 36, 34); b.moved = true; k.fleeing = true; w.spells = ['mystic_path']; cur(s);
  const tg = R.spellTargets(s, w, 'mystic_path'); has(tg, a, 'la unidad libre'); no(tg, b, 'la que ya movió'); no(tg, k, 'la que huye');
});
cv('shield_saph', 8, 'core-errata-061', F + 'core.txt:285'); cv('confound', 8, 'core-errata-062', F + 'core.txt:288'); cv('miasmic_mirage', 10, 'core-errata-063', F + 'core.txt:290');
cv('deathly_cabal', 8, 'core-errata-064', F + 'core.txt:292');
T('core-errata-065', F + 'core.txt:294', 'Vórtice Espiritual: 10+; enemigos a 8": −1 Ld (mín. 2) y sin la Presencia Inspiradora del General', () => {
  eq(SPELLS.spirit_vortex.cv, 10, 'VL');
  const { s, e } = vxRun('spirit_vortex', { x: 36, y: 31 }); const ld1 = R.ldOf(s, e); s.vortex = []; const ld0 = R.ldOf(s, e); eq(ld1, Math.max(2, ld0 - 1), 'Ld a 8" del vórtice');
});
cv('curse_years', 9, 'core-errata-066', F + 'core.txt:297'); cv('fist_gork', 8, 'core-errata-067', F + 'core.txt:299'); cv('ere_we_go', 8, 'core-errata-068', F + 'core.txt:302');
vxHits('foot_gork', 'D3+3', 5, 1, false, 'core-errata-069', F + 'core.txt:304');
T('core-errata-069:2D6', F + 'core.txt:304', 'Pie de Gork: se dispersa 2D6" (plantilla de 5")', () => eq([SPELLS.foot_gork.vx.dist, SPELLS.foot_gork.vx.size], ['2D6', 5]));
pts('ogre_blade', 75, 'core-errata-070', F + 'core.txt:310');
T('core-errata-071', F + 'core.txt:312', 'Hoja Berserker: F+1, Ataques adicionales (+1), Impetuoso, Ataques mágicos; el portador es Impetuoso', () => {
  const s = game([{ type: 'empire_captain', models: 1, items: ['berserker'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const c = U(s, 'empire_captain'), d = U(s, 'orc_boyz'); engage(s, c, d); cur(s);
  ok(R.has(c, 'impetuous'), 'no es Impetuoso'); const p = R.attackProfile(c, d); eq([p.S, p.atk], [R.D(c).S + 1, R.D(c).A + 1], 'F y A');
});
T('core-errata-072', F + 'core.txt:316', 'Yelmo Deslumbrante: solo infantería o caballería', () => {
  ok(ITEMS.bedazzling.infCavOnly, 'sin restricción'); const iss = DATA.itemIssues('emp_general_griffon', ['bedazzling'], null); ok(iss.some((x) => /infanter|caballer/i.test(x)), 'un General en Grifo puede llevarlo: ' + iss.join('; '));
});
T('core-errata-073', F + 'core.txt:318', 'Anillo Rubí de la Ruina: 35 pts; Bola de Fuego como hechizo ligado de nivel de poder 1', () => { eq(ITEMS.ring_ruin.cost, 35, 'coste'); eq(SPELLS.ring_fireball.bound, 1, 'nivel de poder'); });
T('core-errata-074', F + 'core.txt:320', 'Hoja de referencia: lanzar = 2D6 + Nivel/2 redondeando arriba', () => {
  const s = game([{ type: 'empire_lord', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const w = U(s, 'empire_lord'); const L = R.D(w).wizard.level; wiz(s, w, L, ['fireball']);
  const t = put(U(s, 'orc_boyz'), 36, 14, Math.PI / 2); put(w, 36, 30); cur(s); // nivel 3: +2 → 1+4+2 = 7 no lanza 8+; 1+5+2 = 8 sí
  dice(1, 4, 1, 1); let r = R.apply(structuredClone(s), { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); dice(1, 4, 1, 1); const c1 = structuredClone(s); cur(c1); r = R.apply(c1, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); ok(/no logra/.test(msgs(r.events)), 'nivel 3 con 5 lanza 8+');
  const c2 = structuredClone(s); cur(c2); dice(1, 5, 1, 1); r = R.apply(c2, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); ok(!/no logra/.test(msgs(r.events)), 'nivel 3 con 6 no lanza 8+');
});
T('core-errata-075', F + 'core.txt:323', 'Hoja de referencia: dispersar = 2D6 (+ Nivel/2 en la de Mago); se dispersa si el resultado SUPERA el de lanzamiento', () => {
  let { s, c } = dispSetup(); dice(4, 4); ok(!R.tryDispel(s, c, 9, false, []), '9 contra 9 dispersa'); ({ s, c } = dispSetup()); dice(4, 5); ok(R.tryDispel(s, c, 9, false, []), '10 contra 9 no dispersa');
});
T('core-errata-076', F + 'core.txt:330', 'Trenes de bagaje: impasables para mover, pero no bloquean la línea de visión', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), t = put(U(s, 'orc_boyz'), 36, 20, Math.PI / 2); s.bags = [{ owner: 1, x: 36, y: 30, dead: false, touchBy: null }]; cur(s);
  ok(R.losClear(s, a, t), 'el bagaje bloquea la visión'); ok(R.checkPlacement(s, a, { x: 36, y: 30, face: a.face }), 'se puede acabar encima del bagaje');
});
T('core-errata-077', F + 'core.txt:333', 'Mapa Close Encounter (Battle March): bordes cortos de 15"', () => { const z = R.SCENARIOS.bm_close.z; eq(z.map((q) => Math.min(q.x1 - q.x0, q.y1 - q.y0)), [15, 15]); });
T('core-errata-078', F + 'core.txt:335', 'Mapa Opposed Flanks (Battle March): 18" entre las zonas de despliegue', () => { const [z1, z2] = R.SCENARIOS.bm_opposed.z; const y1 = z1.poly.find((p) => p.x === 0 && p.y > 0).y, y2 = z2.poly.find((p) => p.x === 0).y, y3 = z2.poly.find((p) => p.x === 44 && p.y < 30).y; eq([y2 - y1, y3 - 0], [18, 18]); });
