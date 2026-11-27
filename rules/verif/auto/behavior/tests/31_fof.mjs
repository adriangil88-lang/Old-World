// v835 — FAQ de Forces of Fantasy (rules/new/faq_fof.txt): erratas y Q/A
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, blows, join } from '../lib.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const F = 'rules/new/faq_fof.txt';
const fac = (k) => (UNITS[k].faction === 'merc' ? 'empire' : UNITS[k].faction);
const one = (k, x = {}) => { const s = game([{ type: k, models: Math.max(1, UNITS[k].min || 1), ...x }], [{ type: 'orc_boyz', models: 10 }], { f: [fac(k), 'orcs'] }); return { s, u: U(s, k, 0) }; };
const stat = (id, k, c, v) => T(id, F, `${UNITS[k].name}: ${c} ${v}`, () => eq(R.D(one(k).u)[c], v, k + '.' + c));
const pts = (id, k, v) => T(id, F, `${UNITS[k]?.name || ITEMS[k]?.name}: ${v} pts`, () => eq(UNITS[k] ? UNITS[k].ppm : ITEMS[k].cost, v, k));
const cv = (id, k, v) => T(id, F, `${SPELLS[k].name}: valor de lanzamiento ${v}+`, () => eq(SPELLS[k].cv, v, k));
const sr = (id, k, r, yes = true) => T(id, F, `${UNITS[k].name}: ${yes ? 'tiene' : 'no tiene'} ${r}`, () => (yes ? has : no)(R.D(one(k).u).sr, r, k));
const size = (id, k, a, b) => T(id, F, `${UNITS[k].name}: tamaño ${a}-${b ?? '+'}`, () => { eq(UNITS[k].min, a, 'mínimo'); if (b != null) eq(UNITS[k].max, b, 'máximo'); });
T('fof-errata-001', F, 'Yunque del Destino: sus hechizos ligados tienen nivel de poder 2', () => { const d = UNITS.dw_anvil; eq(d.boundSpells, ['anvil_oath', 'anvil_hearth', 'anvil_haste', 'anvil_wrath'], 'hechizos ligados del Yunque'); for (const k of d.boundSpells) eq(SPELLS[k].bound, 2, k + ': nivel de poder'); });
T('fof-errata-002', F, 'Runa de Juramento y Acero: 8+/11+; con 8+ la unidad repite las salvaciones de armadura fallidas', () => {
  eq(SPELLS.anvil_oath.cv, 8, 'valor'); const s = game([{ type: 'dw_warriors', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'] }); const u = U(s, 'dw_warriors'); cur(s); u.fx.push({ k: 'oathS', v: 0 });
  dice(6, 1, 6); diceAll(1); const r = R.woundAndSave(s, u, 1, 4, 0, {}); eq(r.through, 0, 'no repite la salvación fallida (1 → 6)');
});
cv('fof-errata-003', 'anvil_hearth', 8);
size('fof-errata-004', 'dw_rangers', 5, 20);
sr('fof-errata-005', 'dw_hammerers', 'gromrilArm');
T('fof-errata-006', F, 'Runas de Protección: salvación especial 6+ solo contra ataques enemigos NO mágicos', () => {
  const { s, u } = one('dw_ironbreakers', { models: 10 }); cur(s); dice(6, 6); diceAll(1); eq(R.woundAndSave(s, u, 1, 4, 10, {}).through, 0, 'sin salvación 6+ contra un ataque no mágico');
  dice(6, 6); diceAll(1); eq(R.woundAndSave(s, u, 1, 4, 10, { magical: true }).through, 1, 'salvación 6+ contra un ataque mágico');
});
T('fof-errata-007', F, 'Torpedo Martillo de Trolls: F5 y Aparatoso (no Hecho por Enanos)', () => { const o = Object.values(UNITS).flatMap((u) => u.opts || []).find((x) => /torped/i.test(x.label || '')); ok(o, 'no hay Torpedo'); const w = o.wrg || o.patch?.ranged || o.patch?.ranged2; eq(w.s, 5, 'F'); ok(w.cumbersome, 'sin Aparatoso'); no(w.sr || [], 'dwarfCrafted', 'Hecho por Enanos'); });
T('fof-errata-008', F, 'Saber rúnico: el Yunque dispersa a 24" con +3, el Señor de las Runas a 21" con +2, el Herrero a 18" con +1 (sin Nivel)', () => {
  for (const [k, rng, mod] of [['dw_anvil', 24, 3], ['dw_runelord', 21, 2], ['dw_runesmith', 18, 1]]) { if (!UNITS[k]) continue;
    const run = (d, a, b) => { const s = game([{ type: 'orc_weirdboy', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: k, models: 1 }], { f: ['orcs', 'dw'], phase: 'shoot' }); put(U(s, 'orc_weirdboy'), 36, 46); const w = put(U(s, k, 1), 36, 46 - d, Math.PI / 2); cur(s);
      dice(a, b); return { o: asks(s, (q) => R.tryDispel(q, U(q, 'orc_weirdboy'), 10, false, []), [1], (n) => n.opts.find((x) => x[0] === w.id)?.[0] || n.opts[0][0]), id: w.id }; };
    let { o, id } = run(rng - 1, 5, 6 - mod); ok(o.needs.some((n) => n.title === 'Dispersar el hechizo' && n.opts.some((x) => x[0] === id)), `${k}: no puede dispersar a ${rng - 1}"`); eq(o.r, true, `${k}: 5+${6 - mod}+${mod} = 11 no dispersa un 10`);
    ({ o, id } = run(rng - 1, 5, 5 - mod)); eq(o.r, false, `${k}: 5+${5 - mod}+${mod} = 10 dispersa un 10 (hay que superarlo)`);
    ({ o, id } = run(rng + 4, 6, 6)); ok(!o.needs.some((n) => n.opts?.some((x) => x[0] === id)), `${k}: dispersa más allá de ${rng}"`); }
});
stat('fof-errata-009', 'empire_general', 'Ld', 10); stat('fof-errata-010', 'empire_captain', 'Ld', 9); stat('fof-errata-011', 'emp_lector', 'Ld', 9); stat('fof-errata-012', 'emp_priest', 'Ld', 8); stat('fof-errata-013', 'emp_hulric', 'Ld', 9); stat('fof-errata-014', 'emp_ulric', 'Ld', 8);
T('fof-errata-015', F, 'Nubes de Hollín y Humo: el Ingeniero a pie, a 3" de una máquina de guerra amiga, está tras cobertura completa (−2 al impactar)', () => {
  const run = (dx) => { const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'emp_engineer', models: 1 }, { type: 'great_cannon', models: 1 }], { f: ['empire', 'empire'], phase: 'shoot' }); const a = put(U(s, 'emp_archers', 0), 36, 40), e = put(U(s, 'emp_engineer', 1), 36, 30, Math.PI / 2); put(U(s, 'great_cannon', 1), 36 + dx, 30, Math.PI / 2); cur(s); diceAll(1); const ev = []; R.resolveShot(s, a, e, ev); const m = / tiros?, (\d)\+/.exec(msgs(ev)); return m ? +m[1] : null; };
  const near = run(2.5), far = run(9); ok(near != null && far != null, 'montaje'); eq(near - far, 2, `a 3" de la máquina ${near}+, lejos ${far}+`);
});
sr('fof-errata-016', 'state_troops', 'horde');
stat('fof-errata-017', 'greatswords', 'S', 4);
T('fof-errata-018', F, 'Campeón del Conde (Espadones): F4', () => { const d = UNITS.greatswords; eq(d.champS ?? d.S, 4, 'F del campeón'); });
T('fof-errata-019', F, 'Flagelante y Profeta del Juicio Final: R4', () => { eq(UNITS.flagellants.T, 4, 'R'); eq(UNITS.flagellants.champT ?? UNITS.flagellants.T, 4, 'R del Profeta'); });
T('fof-errata-020', F, 'Cañón de vapor del Tanque: solo dispara a su arco frontal (sin visión de 360°)', () => {
  const s = game([{ type: 'steam_tank', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const t = put(U(s, 'steam_tank'), 36, 30, -Math.PI / 2), e = U(s, 'orc_boyz'); cur(s);
  put(e, 36, 42, Math.PI); ok(R.shootCheck(s, t, e, { wpn: 0 }), 'dispara el cañón a su espalda'); put(e, 36, 16, Math.PI / 2); cur(s); eq(R.shootCheck(s, t, e, { wpn: 0 }), null, 'no dispara al frente');
});
T('fof-errata-021', F, 'Grifo Imperial: sin Dos cabezas', () => { for (const k of Object.keys(UNITS).filter((x) => /griffon/.test(x) && UNITS[x].faction === 'empire')) no(UNITS[k].sr, 'twoHeads', k); });
T('fof-errata-022', F, 'Laureles de la Victoria: cada herida no salvada del portador vale 2 puntos de resultado', () => {
  const s = game([{ type: 'empire_captain', models: 1, items: ['laurels_v'] }], [{ type: 'snotlings', models: 6 }], { f: ['empire', 'orcs'] }); const c = U(s, 'empire_captain'), g = U(s, 'snotlings'); engage(s, c, g); charged(s, c, g); cur(s);
  dice(); diceAll(6); const ev = fight(s); const m = msgs(ev); const w = blows(ev, 'Capitán').reduce((t, b) => t + b.w, 0); const cr = /Combate: Imperio (\d+)/.exec(m); ok(w > 0 && cr, 'montaje: ' + m.slice(0, 200)); ok(+cr[1] >= 2 * w, `resultado ${cr[1]} con ${w} heridas del portador`);
});
T('fof-errata-023', F, 'Bastón del Mago: 0-1 por Mago', () => { ok(ITEMS.staff.zeroOne, 'sin 0-1'); const iss = DATA.itemIssues('empire_mage', ['staff', 'staff']); ok(iss.some((x) => /0-1/.test(x)), 'dos Bastones sin error: ' + iss.join('; ')); });
T('fof-errata-024', F, 'Pegaso Real: +70 pts y Criatura monstruosa', () => { for (const k of ['br_baron_pegasus', 'br_paladin_rpeg', 'br_duke_rpeg'].filter((x) => UNITS[x])) eq(UNITS[k].tt, 'monCreature', k); });
T('fof-errata-025', F, 'Arma de asta (Hombres de Armas): se elige el perfil en CADA paso 1.1 (no se bloquea desde la primera ronda)', () => {
  const s = game([{ type: 'br_men_at_arms', models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: ['bret', 'orcs'] }); const a = U(s, 'br_men_at_arms'), d = U(s, 'orc_boyz'); engage(s, a, d); cur(s);
  diceAll(1); const o1 = asks(s, (c) => fight(c), [0]); ok(o1.needs.some((n) => n.title === 'Arma de combate' && n.p === 0), 'no se elige en la primera ronda');
  const s2 = o1.s; s2.turn++; s2.round++; for (const u of s2.units) { u.fought = true; u.charged = false; u.chargeOK = false; } cur(s2); const o2 = asks(s2, (c) => fight(c), [0]); ok(o2.needs.some((n) => n.title === 'Arma de combate' && n.p === 0), 'en la segunda ronda sigue bloqueada');
});
T('fof-errata-026', F, 'Peregrinos de Batalla: 6 pts, 5-30', () => { eq(UNITS.br_pilgrims.ppm, 6, 'pts'); eq([UNITS.br_pilgrims.min, UNITS.br_pilgrims.max], [5, 30], 'tamaño'); });
size('fof-errata-027', 'br_questing', 3);
T('fof-errata-028', F, 'Caballeros Pegaso: 59 pts, sin Formación en lanza', () => { eq(UNITS.br_pegasus.ppm, 59, 'pts'); no(UNITS.br_pegasus.sr, 'lanceForm'); no(UNITS.br_pegasus.sr, 'lance'); });
T('fof-errata-029', F, 'Virtudes caballerescas: cada una solo una vez por ejército; no afectan a la montura', () => {
  const army = [{ type: 'br_paladin', models: 1, items: ['kv_heroism'] }, { type: 'br_paladin', models: 1, items: ['kv_heroism'] }, { type: 'br_realm', models: 6 }, { type: 'br_realm', models: 6 }];
  const iss = DATA.armyIssues(army, 2000, 'open', 'grand'); ok(iss.some((x) => /Virtud|Heroísmo|una vez|duplicad/i.test(x)), 'la misma Virtud dos veces sin error: ' + iss.slice(0, 3).join('; '));
});
cv('fof-errata-031', 'burning_gaze', 9);
T('fof-errata-032', F, 'Formación en lanza: +1 al resultado con US 5 o más', () => { const s = game([{ type: 'br_realm', models: 6 }], [{ type: 'goblins', models: 10 }], { f: ['bret', 'orcs'] }); const a = U(s, 'br_realm'), d = U(s, 'goblins'); a.lance = true; engage(s, a, d); cur(s); ok(R.usOf(a) >= 5, 'US'); ok(R.sideScore(s, [a, d], 0, new Map()) >= 1, 'sin +1 de la lanza'); });
T('fof-errata-033', F, 'Antiguo Hombre Árbol: elige uno de Batalla o Elementalismo (no otros saberes)', () => { eq(UNITS.we_ancient.lores, ['battle', 'elementalism'], 'saberes'); });
pts('fof-errata-034', 'we_glade_guard', 10); pts('fof-errata-035', 'we_eternal', 12);
T('fof-errata-036', F, 'Dríada y Ninfa: M6 y Perforante (1)', () => { eq(UNITS.we_dryads.M, 6, 'M'); ok((UNITS.we_dryads.melee || {}).ab >= 1 || UNITS.we_dryads.sr.includes('armourBane1'), 'sin Perforante (1)'); });
T('fof-errata-037', F, 'Jinetes del Claro: 17 pts, 4+', () => { eq(UNITS.we_glade_riders.ppm, 17, 'pts'); eq(UNITS.we_glade_riders.min, 4, 'mínimo'); });
pts('fof-errata-038', 'we_sisters', 22);
T('fof-errata-039', F, 'Hijas de la Eternidad: salvación especial 4+ contra cualquier herida', () => { const { s, u } = one('we_sisters', { models: 5 }); cur(s); eq(R.wardOf(u), 4, 'salvación especial'); });
T('fof-errata-040', F, 'Aquelarre del Bosque Profundo: un hechizo al azar de Batalla o Elementalismo; puede cambiarlo por la firma del saber', () => {
  const LO = DATA.LORES, pool = [...LO.battle.pool, ...LO.elementalism.pool], sigs = [LO.battle.sig, LO.elementalism.sig];
  const mk = (cv) => { const s = game([{ type: 'we_sisters', models: 5, ...(cv ? { cvSp: cv } : {}) }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'] }); return U(s, 'we_sisters'); };
  const a = mk(null); eq(a.spells.length, 1, 'un solo hechizo'); ok(pool.includes(a.spells[0]), 'al azar de Batalla o Elementalismo: ' + a.spells[0]); eq(a.covenAlt.sigs, sigs, 'puede descartarlo por la firma de cualquiera de los dos saberes'); eq(a.covenAlt.rolled, a.spells[0], 'guarda el hechizo sacado');
  for (const sg of sigs) { const b = mk(sg); eq(b.spells, [sg], 'firma elegida'); ok(!b.covenAlt, 'con la firma elegida no hay más cambio'); }
  const c = mk(LO.illusion.sig); ok(pool.includes(c.spells[0]), 'una firma de otro saber no vale: sale uno al azar de los dos saberes');
});
pts('fof-errata-041', 'we_wild_riders', 26);
T('fof-errata-042', F, 'Emboscada del Bosque: el bosque adicional mide de 3" a 9"', () => { const t = (w) => { const r = forestRun('amb', w); return [r.ok === true, r.error || null]; }; for (const w of [3, 6, 9]) eq(t(w), [true, null], w + '" vale'); for (const w of [2.5, 9.5, 10]) eq(t(w), [false, 'El bosque mide entre 3" y 9" por lado'], w + '" no vale'); });
cv('fof-errata-043', 'forest_walker', 9); cv('fof-errata-044', 'flock_doom', 8);
T('fof-errata-045', F, 'Hacha de Dargo (Ungrim): F+2', () => { eq(UNITS.dw_ungrim.melee.sb, 2, 'F'); });
sr('fof-errata-046', 'dw_sapper', 'hostileTerrain');
stat('fof-errata-047', 'emp_hans', 'Ld', 10);
sr('fof-errata-048', 'teutogen', 'guardiansTemple', false);
T('fof-errata-049', F, 'Guardián de los Lugares Sagrados: no salta a vórtices, terreno abierto, colinas ni construcciones', () => {
  const s = game([{ type: 'br_green_knight', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'move' }); const g = put(U(s, 'br_green_knight'), 10, 40); cur(s);
  s.terrain = [{ id: 'h1', kind: 'hill', x: 30, y: 24, w: 8, h: 6 }, { id: 'w1', kind: 'wall', x: 50, y: 24, w: 6, h: 0.5 }, { id: 'b1', kind: 'building', x: 60, y: 30, w: 4, h: 4 }, { id: 'v1', kind: 'swamp', vx: true, x: 20, y: 20, w: 3, h: 3 }, { id: 'f1', kind: 'forest', x: 40, y: 10, w: 6, h: 6 }];
  const p = R.gkJumpSpot(s, g); ok(p, 'no encuentra el bosque'); ok(Math.hypot(p.x - 40, p.y - 10) < 6, 'salta a un terreno no natural o excluido: ' + JSON.stringify(p));
});
sr('fof-errata-050', 'he_whitelions', 'furiousCharge');
T('fof-errata-051', F, 'Honores élficos: no afectan a la montura (Sangre de Caledor: +1 HA del jinete, no del grifo)', () => {
  const s0 = game([{ type: 'he_prince_griffon', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['he', 'orcs'] }), s1 = game([{ type: 'he_prince_griffon', models: 1, items: ['h_caledor'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['he', 'orcs'] });
  const a = R.D(U(s0, 'he_prince_griffon')), b = R.D(U(s1, 'he_prince_griffon')); eq(b.WS, a.WS + 1, 'HA del jinete'); eq(JSON.stringify(b.mountAtk), JSON.stringify(a.mountAtk), 'cambia la montura');
});
T('fof-errata-056', F, 'Caballo de guerra del Mago Proscrito (Bretonia): peana de 25 x 50 mm (mín.) a 30 x 60 mm (máx.): la peana del perfil montado está en ese intervalo y es la que usa la geometría', () => {
  const ks = ['br_outcast_h', 'br_outcast2_h', 'br_outcast3_h']; for (const k of ks) { const d = UNITS[k]; ok(d.baseW >= 25 && d.baseW <= 30 && d.baseD >= 50 && d.baseD <= 60, k + ': peana ' + d.baseW + 'x' + d.baseD + ' dentro de 25x50…30x60'); const u = one(k).u; const dm = GEOM.dims(u); eq([Math.round(dm.w / (u.files || 1) * 25.4), Math.round(dm.d * 25.4)], [d.baseW, d.baseD], k + ': la geometría usa la peana del perfil (' + d.baseW + 'x' + d.baseD + ')'); }
  ok(UNITS.br_outcast.baseD === 25 && UNITS.br_outcast_h.baseD > UNITS.br_outcast.baseD, 'el Mago a pie conserva su peana (25x25); montado usa la del caballo de guerra');
});
cv('fof-errata-052', 'hand_khaine', 7);
T('fof-errata-053', F, 'Buscadores de Fatalidad: no son personajes y son Escaramuzadores', () => { ok(UNITS.dw_doomseeker.cat !== 'char', 'personaje'); has(UNITS.dw_doomseeker.sr, 'skirmish'); });
T('fof-errata-054', F, 'Cortagoblins: dotación con H2 y A2; peana 50x75', () => { eq([UNITS.dw_hewer.baseW, UNITS.dw_hewer.baseD], [50, 75], 'peana'); });
T('fof-errata-055', F, 'Arcabuz Maravilloso de Von Trickschotte: Ataques mágicos', () => { const s = game([{ type: 'emp_engineer', models: 1, items: ['empaj_arquebus'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], lists: ['nuln', null] }); const u = U(s, 'emp_engineer'); cur(s); ok(R.rangedOf(u)?.magical, 'el disparo no es mágico'); });
const forestRun = (k, w) => { const s = game([{ type: 'we_glade_guard', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'deploy' }); s.ready = [false, false]; s.zones = s.zones || [{ x0: 0, x1: 72, y0: 36, y1: 48 }, { x0: 0, x1: 72, y0: 0, y1: 12 }]; s.terrain.push({ id: k + '0', kind: 'forest', x: 10, y: 40, w: 6, h: 6 }); cur(s); return R.apply(s, { t: 'forestPlace', id: k + '0', x: 10, y: 40, w, h: w }); };
sr('fof-errata-057', 'we_orion', 'fear', false);
T('fof-errata-058', F, 'Sabuesos espectrales: mientras quede algún Sabueso, Orión no puede ser objetivo de disparos enemigos', () => {
  const s = game([{ type: 'emp_archers', models: 10 }], [{ type: 'we_orion', models: 1 }], { f: ['empire', 'wood'], phase: 'shoot' }); const a = put(U(s, 'emp_archers'), 36, 40), o = put(U(s, 'we_orion'), 36, 26, Math.PI / 2); cur(s);
  ok(R.shootCheck(s, a, o), 'con Sabuesos se le puede disparar'); o.hounds = 0; ok(!R.shootCheck(s, a, o), 'sin Sabuesos no se le puede disparar');
});
pts('fof-errata-059', 'we_araloth', 150);
T('fof-errata-060', F, 'Guerreros de la Espesura (Chracia): el bosque adicional mide de 3" a 9"', () => { const t = (w) => { const r = forestRun('wow', w); return [r.ok === true, r.error || null]; }; for (const w of [3, 6, 9]) eq(t(w), [true, null], w + '" vale'); for (const w of [2.5, 9.5, 10]) eq(t(w), [false, 'El bosque mide entre 3" y 9" por lado'], w + '" no vale'); });
T('fof-errata-061', F, 'Coronas Renegadas: con caballo de guerra = caballería ligera; con barda = caballería pesada', () => { const k = Object.keys(UNITS).find((x) => /road_wardens$/.test(x)); ok(k, 'sin unidad'); ok(['lightCav', 'heavyCav'].includes(UNITS[k].tt), UNITS[k].tt); });
T('fof-errata-062', F, 'Caballo de guerra de Coronas Renegadas: Resistencia «-»: la R del modelo montado es la del jinete (la montura no aporta R)', () => {
  const pairs = [['rc_prince', 'rc_prince_h'], ['rc_captain', 'rc_captain_h'], ['rc_wizard1', 'rc_wizard1_h'], ['rc_wizard2', 'rc_wizard2_h'], ['rc_wizard3', 'rc_wizard3_h']];
  for (const [a, b] of pairs) eq(R.D(one(b).u).T, R.D(one(a).u).T, b + ': R igual que a pie (' + a + ')');
  for (const k of ['rc_freeblades', 'rc_vfreeblades', 'rc_outriders']) eq(R.D(one(k).u).T, 3, k + ': R 3 (la del jinete, sin sumar la del caballo)');
  // consecuencia en el motor: F3 contra R3 hiere con 4+ (con R mayor haría falta 5+): con dados a 4 hay heridas
  const w = (k, v = 4) => { const { s, u } = one(k); cur(s); diceAll(v); const r = R.woundAndSave(s, u, 20, 3, 0, { noArmour: true, noWard: true, noRegen: true, magical: true }); return r.through; };
  ok(w('rc_freeblades') > 0, 'F3 contra R3 (jinete) hiere con un 4: ' + w('rc_freeblades')); eq(w('rc_freeblades', 3), 0, 'con un 3 no hiere (R 3 del jinete, no más)');
});
cv('fof-errata-063', 'durthu_wrath', 9);
T('fof-errata-064', F, 'Torrente de Duendes: terreno difícil, se dispersa D6" en cada Inicio de turno y hace 3D6 impactos F2 FP −1', () => {
  const s = game([{ type: 'we_spellweaver', models: 1 }], [{ type: 'orc_boyz', models: 20 }], { f: ['wood', 'orcs'], phase: 'strategy', active: 1 }); const w = put(U(s, 'we_spellweaver'), 10, 44), e = put(U(s, 'orc_boyz'), 36, 24, Math.PI / 2); cur(s);
  s.vortex = [{ x: 36, y: 28, owner: 0, src: w.id, age: 0, spell: 'spiteful_torrent' }]; dice(4, 3); diceAll(4); const ev = []; R.beginStrategy(s, ev); const m = msgs(ev); ok(/desplaza 3"/.test(m), 'no se dispersa D6 en el Inicio de turno del rival: ' + m.slice(0, 200));
});
T('fof-errata-065', F, 'Cólera de Durthu: 9+', () => eq(SPELLS.durthu_rage.cv, 9));
T('fof-errata-066', F, 'Anillo de Furia: Mano de Hierro (Batalla) como hechizo ligado de nivel 1', () => { const i = ITEMS.heaj_fury; ok(i.boundSpell && /hammer|mano/i.test(i.boundSpell + (SPELLS[i.boundSpell]?.name || '')), 'hechizo ' + i.boundSpell); eq(i.boundPL, 1, 'nivel'); });
T('fof-errata-067', F, 'Finta y Esquiva: una vez por partida, al recibir impactos, el atacante repite sus impactos con éxito (popup)', () => {
  const k = 'empire_captain'; const s = game([{ type: 'orc_boyz', models: 10 }], [{ type: k, models: 1 }], { f: ['orcs', 'empire'] }); withSr(k, ['feintDodge'], () => {}); UNITS[k].sr.push('feintDodge'); const a = U(s, 'orc_boyz'), d = U(s, k, 1); engage(s, a, d); cur(s);
  diceAll(5); const o = asks(s, (q) => fight(q), [0, 1], (n) => (n.title === 'Finta y esquiva' ? 'y' : undefined)); UNITS[k].sr = UNITS[k].sr.filter((r) => r !== 'feintDodge'); ok(o.needs.some((n) => n.title === 'Finta y esquiva' && n.p === 1), 'no se pregunta Finta y esquiva (regla del Duelista Errante, Coronas Renegadas)');
});
T('fof-errata-030', F, 'Cuerno de Halcón: un solo uso, en la subfase de Mando, sin estar trabado, chequeo de Liderazgo', () => {
  const s = game([{ type: 'br_paladin', models: 1, items: ['falcon_horn'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'command' }); const p = U(s, 'br_paladin'); cur(s); ok(R.falconFor(s, p), 'libre no puede usarlo'); engage(s, U(s, 'orc_boyz', 1), p); cur(s); ok(!R.falconFor(s, p), 'trabado puede usarlo');
});
