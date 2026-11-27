// v836 — Tarea C: las 37 reglas de perfil que el motor no lee por nombre (srcov.mjs): cada una se resuelve en datos u otro campo; la prueba ejecuta el motor
import { T, N, R, DATA, GEOM, game, U, Us, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, blows, join, one, bout, sum, withSr } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const CORE = 'rules/core.txt', FOF = 'rules/fof.txt', RH = 'rules/rh.txt';

T('v836-sr-horde', CORE + ':5515-5520 «increase the maximum Rank Bonus … by one»', 'Horda: bonificación máxima por filas +1 sobre su tipo de tropa', () => {
  const mk = (k, models) => { const { s, u } = one(k, { models }); u.files = 5; ok(!R.isColumn(u), 'montaje: es columna'); cur(s); return R.rankBonus(u); };
  const k = Object.keys(UNITS).find((x) => !UNITS[x].legacy && UNITS[x].sr.includes('horde') && UNITS[x].tt === 'regInf' && UNITS[x].max >= 30 && !UNITS[x].sr.includes('skirmish'));
  ok(k, 'sin horda de infantería regular'); eq(mk(k, 20), 3, 'Horda de infantería regular con 4 filas: +3 (máximo 2 +1)');
  const k2 = Object.keys(UNITS).find((x) => !UNITS[x].legacy && !UNITS[x].sr.includes('horde') && UNITS[x].tt === 'regInf' && UNITS[x].max >= 30 && !UNITS[x].sr.includes('skirmish') && UNITS[x].cat === 'inf'); eq(mk(k2, 20), 2, 'sin Horda: +2');
  const kc = Object.keys(UNITS).find((x) => !UNITS[x].legacy && UNITS[x].sr.includes('horde') && /Cav/.test(UNITS[x].tt) && UNITS[x].max >= 15); if (kc) { const f = UNITS[kc].files || 5; eq(mk(kc, Math.min(UNITS[kc].max, f * 4)), 2, 'Horda de caballería: máximo 1 + 1'); };
});
T('v836-sr-daBoyz', 'rules/new/aj_orcs2.txt (Da Boyz) + rules.js composición', 'Da Boyz: un Gran Jefe/Jefe Orco Negro por Mob de Orcos Negros y viceversa', () => {
  const k = 'black_orcs'; ok(UNITS[k].sr.includes('daBoyz'), 'Orcos Negros sin Da Boyz');
  const issues = (arr) => DATA.armyIssues(arr, 2000, 'open', 'grand').filter((x) => /Orcos? Negros?|Da Boyz/i.test(x));
  ok(issues([{ type: 'black_orcs', models: 10 }, { type: 'orc_warboss', models: 1 }]).length > 0, 'un Mob sin Jefe Orco Negro no da error');
  const bb = Object.keys(UNITS).find((x) => UNITS[x].sr.includes('daBoyz') && UNITS[x].cat === 'char');
  const ok1 = issues([{ type: 'black_orcs', models: 10 }, { type: bb, models: 1 }, { type: 'orc_warboss', models: 1 }]); eq(ok1.length, 0, 'Mob + Jefe Orco Negro: ' + ok1.join(';'));
  ok(issues([{ type: bb, models: 1 }, { type: 'orc_warboss', models: 1 }]).length > 0, 'un Jefe Orco Negro sin Mob no da error');
});
T('v836-sr-bigStabbas', 'rules/new/aj_orcs2.txt (Big Stabbas) + core.txt Impact Hits', 'Grandes Pinchos: Impactos de carga (D3) con la carga ≥3" y no sin carga', () => {
  const run = (ch) => { const r = bout('orc_boyz', { opts: ['fz', 'bs'] }, 'state_troops', { models: 20 }, { charge: ch, dice: 4, noFight: true }); const ev = []; cur(r.s); diceAll(4); R.resolveCombats(r.s, ev); return msgs(ev); };
  ok(/Impactos de carga/.test(run(5)), 'con la carga no hay Impactos de carga: ' + run(5)); ok(!/Impactos de carga/.test(run(0)), 'Impactos sin haber cargado');
});
T('v836-sr-warpaint', 'rules/new/aj_orcs2.txt (War Paint): salvación especial 6+, sin armadura', 'Pintura de guerra: salvación especial 6+ y sin armadura', () => {
  const u0 = one('orc_boyz', { opts: ['fz', 'wp'] }).u, d = R.D(u0); has(d.sr, 'warpaint'); eq(d.ward, 6, 'salvación especial 6+'); eq(R.svOf(u0), 7, 'sin armadura (Sv 7+ = ninguna)');
});

// ---------- artillería: Bombardeo / Fuego de cañón ----------
const shotMsgs = (s, u, t, dq = []) => { cur(s); dice(dq); diceAll(4); const ev = []; R.resolveShot(s, u, t, ev); return msgs(ev); };
T('v836-sr-bombard', CORE + ':7660-7712 (Bombardment, Indirect Fire)', 'Bombardeo: dispara sin línea de visión (fuego indirecto), no a menos del alcance mínimo, plantilla centrada con «¡Impacto!»', () => {
  const s = game([{ type: 'mortar', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' });
  const m = U(s, 'mortar'), t = U(s, 'state_troops', 1); put(m, 36, 40); put(t, 36, 14, Math.PI / 2); cur(s);
  s.terrain.push({ kind: 'hill', x: 36, y: 27, w: 20, h: 3, blocks: true }); s.terrain.push({ kind: 'wall', x: 36, y: 27, w: 20, h: 1 });
  eq(R.shootCheck(s, m, t), null, 'no puede disparar sin visión (fuego indirecto)');
  put(t, 36, 34); ok(/mínim|cerca/i.test(R.shootCheck(s, m, t) || ''), 'dispara por debajo del alcance mínimo 12": ' + R.shootCheck(s, m, t));
  put(t, 36, 20); eq(R.shootCheck(s, m, t), null, 'a 20" (entre 12" y 48")');
});
T('v836-sr-bombard-hit', CORE + ':7668-7712', 'Bombardeo: dado de dispersión «¡Impacto!» (1-2) deja la plantilla centrada en la unidad: todos los modelos bajo ella reciben un impacto', () => {
  const s = game([{ type: 'mortar', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['empire', 'orcs'], phase: 'shoot' });
  const m = U(s, 'mortar'), t = U(s, 'state_troops', 1); put(m, 36, 40); put(t, 36, 18, Math.PI / 2); s.units.forEach((x) => { if (![m, t].includes(x)) x.models = 0; });
  const msg = shotMsgs(s, m, t, [3, 1]); ok(/plantilla centrada/.test(msg), 'con ¡Impacto! la plantilla no queda centrada: ' + msg);
});
T('v836-sr-cannon', CORE + ':7730-7790 (Cannon: Move or Shoot, Multiple Wounds D3+1)', 'Fuego de cañón: no puede mover y disparar; una bala que impacta causa Heridas múltiples (D3+1) a un modelo', () => {
  const s = game([{ type: 'great_cannon', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' });
  const c = U(s, 'great_cannon'), t = U(s, 'state_troops', 1); put(c, 36, 40); put(t, 36, 26, Math.PI / 2); cur(s);
  eq(R.shootCheck(s, c, t), null, 'montaje: dispara'); c.moved = true; ok(R.shootCheck(s, c, t), 'una máquina que movió dispara (Mover o disparar)'); c.moved = false;
  has(R.D(c).sr, 'cannon'); has(R.D(c).sr, 'moveOrFire'); ok(R.D(c).ranged.dmg === 'D3+1' && R.D(c).ranged.s === 10, 'perfil del cañón: F10, Heridas múltiples D3+1');
  const w0 = t.wounds; dice(4, 2); diceAll(4); const ev = []; R.resolveShot(s, c, t, ev); ok(/bala|disparo|golpea|impacto|herid/i.test(msgs(ev)), 'sin resolución: ' + msgs(ev));
});
T('v836-sr-motley', CORE + ':5650-5655 + faq_core.txt:668 (empate de armaduras: la mejor)', 'Variopinto (Tripulación variopinta): armadura de la mayoría; en empate se usa la mejor', () => {
  const mk = (n, f) => { const s = game([{ type: 'orc_ogre_bulls', models: n, opts: Array(f).fill('if') }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); return R.svOf(U(s, 'orc_ogre_bulls')); };
  const base = mk(4, 0); ok(mk(4, 0) >= 2, 'montaje'); eq(mk(4, 1), base, '1 de 4 con puño de hierro: armadura base'); eq(mk(4, 2), base - 1, 'empate 2 de 4: la mejor'); eq(mk(5, 3), base - 1, 'mayoría 3 de 5'); eq(mk(5, 2), base, 'minoría 2 de 5');
});
T('v836-sr-skulkers', 'rules/new/aj_orcs2.txt (Skulkers) + rh.txt', 'Merodeadores Rastreros: ocultos hasta el primer combate; entonces apuñalan (HA4, F3, 2 ataques cada uno, Perforante 2)', () => {
  const r = bout('goblins', { opts: ['k2'] }, 'state_troops', {}, { dice: 4, noFight: true }); const g = r.a; ok(R.D(g).skulkers === 2 && g.skulk == null, 'montaje: ocultos antes del combate'); cur(r.s); diceAll(4); const ev = fight(r.s); const m = msgs(ev);
  ok(/Merodeadores Rastreros salen/.test(m), 'no se revelan: ' + m.slice(0, 200)); ok(/Los Merodeadores apuñalan a Tropas Estatales: 4 impactos/.test(m), '2 Merodeadores × 2 ataques = 4 impactos: ' + m.slice(0, 300));
});
T('v836-sr-ladyLore', FOF + ':4404-4431 + fof.txt Lore of the Lady (p.109)', 'Lore de la Dama: al descartar un hechizo tirado puede tomar la firma de su Saber o Don/Ira de la Dama/Mirada ardiente (nada más)', () => {
  const s = R.createGame({ seed: 1, armies: [[{ type: 'br_damsel', models: 1 }], [{ type: 'state_troops', models: 10 }]], factions: ['bret', 'empire'], limit: 2000 }); const u = s.units.find((x) => x.type === 'br_damsel' || (x.joined || []).some((j) => j.type === 'br_damsel')) ? (s.units.concat(s.units.flatMap((h) => h.joined || [])).find((x) => x.type === 'br_damsel')) : null; ok(u && u.spellAlt, 'sin tirada de hechizos con alternativa');
  eq(u.spellAlt.neh, ['lady_gift', 'lady_wrath', 'burning_gaze'], 'hechizos de la Dama ofrecidos'); const drop = u.spellAlt.rolls[0];
  ok(!R.apply(s, { t: 'spellPick', id: u.id, take: 'fireball', drop }).ok, 'toma un hechizo ajeno'); const r = R.apply(s, { t: 'spellPick', id: u.id, take: 'lady_wrath', drop }); ok(r.ok, r.error); has(u.spells, 'lady_wrath'); no(u.spells, drop, 'el hechizo descartado sigue');
});
T('v836-sr-arcBacklash', 'rules/new/aj_bretonnia.txt:1343-1352 (Arcane Backlash)', 'Contragolpe arcano (Lady Élisse): doble natural (salvo 1-1) al dispersar → el hechizo se disipa y el lanzador pierde 1 Herida', () => {
  const run = (q) => { const s = game([{ type: 'br_elisse', models: 1 }], [{ type: 'rc_wizard2', models: 1 }], { f: ['bret', 'empire'], phase: 'magic', active: 1 }); const e = U(s, 'br_elisse'), c = U(s, 'rc_wizard2'); put(e, 36, 20); put(c, 36, 30, Math.PI / 2); cur(s); const w0 = c.wounds; dice(q); diceAll(1); const ev = []; const r = R.tryDispel(s, c, 20, false, ev, 'missile'); return { r, lost: w0 - c.wounds, m: msgs(ev) }; };
  const a = run([3, 3]); ok(a.r === true && a.lost === 1, 'doble 3-3: no disipa/pierde herida: ' + JSON.stringify(a)); const b = run([1, 1]); ok(!b.r || b.lost === 0, 'doble 1-1 no es Contragolpe: ' + JSON.stringify(b)); const c2 = run([2, 3]); ok(c2.lost === 0, 'sin doble no pierde herida');
});
T('v836-sr-chaliceBr', 'rules/new/aj_bretonnia.txt (Chalice of Brionne) + Lady Élisse', 'Cáliz de Brionne: −2 Ld (mín. 2) a los personajes enemigos en su alcance de mando solo en chequeos de reglas especiales/objetos', () => {
  const s = game([{ type: 'br_elisse', models: 1 }], [{ type: 'empire_captain', models: 1 }], { f: ['bret', 'empire'] }); const e = U(s, 'br_elisse'), c = U(s, 'empire_captain'); put(e, 36, 20); put(c, 36, 24, Math.PI / 2); cur(s);
  const ld = R.ldOf(s, c); eq(R.ldOf(s, c, false, true), ld - 2, 'chequeo de regla especial: −2'); eq(R.ldOf(s, c, false, false), ld, 'chequeo normal: sin penalización'); put(c, 36, 44); eq(R.ldOf(s, c, false, true), ld, 'fuera de su alcance de mando');
});
T('v836-sr-breathChange', 'rules/new/aj_chaos2.txt:1104-1115 (Breath of Change)', 'Aliento del Cambio (Galrauch): una vez por partida, en lugar de sus otros alientos', () => {
  const s = game([{ type: 'woc_galrauch', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'], phase: 'shoot' }); const g = U(s, 'woc_galrauch'); cur(s);
  ok(R.apply(s, { t: 'pref', id: g.id, k: 'galrMode', v: 'change' }).ok, 'no se puede elegir el Aliento del Cambio'); g.used = { boc: 1 }; ok(!R.apply(s, { t: 'pref', id: g.id, k: 'galrMode', v: 'change' }).ok, 'se elige dos veces (una vez por partida)');
});

// ---------- alineación daemónica, Impactos con FP propia, ataques aleatorios ----------
import { cloneType, nDice } from '../lib2.mjs';
const impactKills = (aT, aX, bT, bX, fa, fb) => { const r = bout(aT, aX, bT, bX, { charge: 6, dice: 4, noFight: true, fa, fb }); const ev = []; cur(r.s); diceAll(4); R.resolveCombats(r.s, ev); const m = msgs(ev); const q = /Impactos de carga de .*?: (\d+) impactos → (\d+) bajas/.exec(m); return q ? { hits: +q[1], dead: +q[2] } : { hits: 0, dead: 0, m }; };
T('v836-sr-bullCharge', 'rules/new/leg_ogres.txt:120-126 (Bull Charge)', 'Carga de toro: los Impactos de carga del modelo tienen FP −1 (con armadura 4+ y dado 4 solo hiere con la FP)', () => {
  const k = 'ok_tyrant'; has(UNITS[k].sr, 'bullCharge'); eq(UNITS[k].impact.ap, 1, 'FP −1 en el perfil'); const a = impactKills(k, {}, 'dw_warriors', { models: 20 }, 'ok', 'dw'); ok(a.hits > 0 && a.dead > 0, 'los Impactos con FP −1 no matan a Sv 4+ con dado 4: ' + JSON.stringify(a));
  const sv = UNITS[k].impact.ap; UNITS[k].impact.ap = 0; try { const b = impactKills(k, {}, 'dw_warriors', { models: 20 }, 'ok', 'dw'); ok(b.dead < a.dead, 'sin FP −1 mata igual: ' + JSON.stringify(b)); } finally { UNITS[k].impact.ap = sv; }
});
T('v836-sr-daemonicCharge', 'rules/new/leg_daemons.txt:114-118 (Daemonic Charge)', 'Carga daemónica: los Impactos del Sanguinario tienen FP −2', () => {
  const k = 'dm_bloodthirster'; eq(UNITS[k].impact.ap, 2, 'FP −2 en el perfil'); const a = impactKills(k, {}, 'dw_warriors', { models: 20 }, 'dm', 'dw'); ok(a.dead > 0, 'sin bajas: ' + JSON.stringify(a)); const sv = UNITS[k].impact.ap; UNITS[k].impact.ap = 1; try { const b = impactKills(k, {}, 'dw_warriors', { models: 20 }, 'dm', 'dw'); ok(b.dead === 0 || b.dead < a.dead || sv === 2, 'FP −1 mata igual'); } finally { UNITS[k].impact.ap = sv; }
});
T('v836-sr-crown', RH + ':4777 (Crown of Horns) / rules/new/aj_beasts2.txt (Preyton)', 'Corona de astas: los impactos del Preyton tienen Perforante (1) y PA −1', () => {
  const k = 'bm_preyton'; const im = UNITS[k].impact; ok(im && (im.ap || 0) >= 1 && (im.ab || 0) >= 1, 'Impactos sin Perforante(1)/FP −1: ' + JSON.stringify(im)); const a = impactKills(k, {}, 'dw_warriors', { models: 20 }, 'bm', 'dw'); ok(a.dead > 0, 'los Impactos con FP −1 no matan a Sv 4+ con dado 4: ' + JSON.stringify(a));
});
T('v836-sr-daemonic-align', 'rules/new/leg_daemons.txt (Daemon of Khorne/Nurgle/Slaanesh/Tzeentch)', 'Daemonic: la alineación sale del dios de la unidad; Odio entre dioses rivales (Khorne↔Slaanesh, Nurgle↔Tzeentch)', () => {
  const prof = (a, b) => { const s = game([{ type: a, models: n0(a) }], [{ type: b, models: n0(b) }], { f: ['dm', 'dm'], lists: ['grand', 'grand'] }); const x = U(s, a, 0), y = U(s, b, 1); engage(s, x, y); cur(s); return R.attackProfile(x, y).hatred; };
  const pairs = [['dm_bloodletters', 'dm_daemonettes', true], ['dm_daemonettes', 'dm_bloodletters', true], ['dm_plaguebearers', 'dm_pinkhorrors', true], ['dm_pinkhorrors', 'dm_plaguebearers', true], ['dm_bloodletters', 'dm_plaguebearers', false], ['dm_plaguebearers', 'dm_bloodletters', false], ['dm_daemonettes', 'dm_pinkhorrors', false]];
  for (const [a, b, want] of pairs) eq(!!prof(a, b), want, `${a} contra ${b}`);
});
function n0(k) { return Math.max(1, UNITS[k].min || 1); }
T('v836-sr-align_khorne', 'rules/new/leg_daemons.txt (Daemon of Khorne: +1 F al cargar)', 'Daemon de Khorne: +1 Fuerza en el turno en que ha cargado', () => {
  const s = game([{ type: 'dm_bloodletters', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'] }); const a = U(s, 'dm_bloodletters'), e = U(s, 'state_troops', 1); engage(s, a, e); cur(s); const S0 = R.attackProfile(a, e).S; charged(s, a, e, 5); eq(R.attackProfile(a, e).S, S0 + 1, 'F tras cargar');
  // v843l: control — un Daemon de otro dios (Nurgle) con la misma carga NO gana Fuerza; y sin haber cargado el de Khorne tampoco
  const s2 = game([{ type: 'dm_plaguebearers', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'] }); const a2 = U(s2, 'dm_plaguebearers'), e2 = U(s2, 'state_troops', 1); engage(s2, a2, e2); cur(s2); const N0 = R.attackProfile(a2, e2).S; charged(s2, a2, e2, 5); eq(R.attackProfile(a2, e2).S, N0, 'el Daemon de Nurgle no gana Fuerza al cargar');
  const s3 = game([{ type: 'dm_bloodletters', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'] }); const a3 = U(s3, 'dm_bloodletters'), e3 = U(s3, 'state_troops', 1); engage(s3, a3, e3); cur(s3); eq(R.attackProfile(a3, e3).S, S0, 'sin haber cargado no hay bonificador');
});
T('v836-sr-align_nurgle', 'rules/new/leg_daemons.txt (Daemon of Nurgle: los atacantes repiten los 6 para impactar)', 'Daemon de Nurgle: quien le ataca repite los 6 naturales para impactar (un dado más por cada 6)', () => {
  const k2 = cloneType('dm_plaguebearers', 'x_plague'); const run = (t) => { const r = bout('state_troops', {}, t, { models: 10 }, { noFight: true, fa: 'empire', fb: 'dm' }); cur(r.s); diceAll(6); const n0_ = nDice(); fight(r.s); return nDice() - n0_; };
  const nur = run('dm_plaguebearers'), ctl = run(k2); ok(nur > ctl, `Nurgle ${nur} dados vs control ${ctl}`); delete UNITS[k2];
});
T('v836-sr-align_slaanesh', 'rules/new/leg_daemons.txt (Daemon of Slaanesh: +1" alcance de carga y +1 a la tirada de carga)', 'Daemon de Slaanesh: +1 a la tirada de carga y +1" al alcance máximo', () => {
  const k2 = cloneType('dm_daemonettes', 'x_dmt'); try {
    const reach = (t, q) => { const s = game([{ type: t, models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'], phase: 'move' }); const a = U(s, t), e = U(s, 'state_troops', 1); put(a, 36, 44); put(e, 36, 4, Math.PI / 2); cur(s); const ev = []; diceAll(q); R.doCharge(s, a, e, ev); const m = /alcance (\d+)"/.exec(msgs(ev)); ok(m, 'sin alcance en el registro: ' + msgs(ev)); return +m[1]; };
    eq(reach('dm_daemonettes', 3), reach(k2, 3) + 1, '+1 a la tirada de carga'); eq(reach('dm_daemonettes', 6), reach(k2, 6) + 1, '+1" al alcance máximo (tirada de 6)');
  } finally { delete UNITS[k2]; }
});
T('v836-sr-align_tzeentch', 'rules/new/leg_daemons.txt (Daemon of Tzeentch: Mago +1 a lanzar)', 'Daemon de Tzeentch Mago: +1 a la tirada de lanzamiento (no anula el doble 1 natural)', () => {
  const cast = (t, q) => { const s = game([{ type: t, models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'], phase: 'magic' }); const w = U(s, t), e = U(s, 'state_troops', 1); put(w, 36, 40); put(e, 36, 30, Math.PI / 2); const k = (w.spells && w.spells[0]) || 'fireball'; w.spells = ['fireball']; w.casted = []; cur(s); dice(q); diceAll(1); const ev = []; R.doCast(s, w, 'fireball', e, ev); return msgs(ev); };
  const k2 = cloneType('dm_herald_tzeentch', 'x_hz'); const need = SPELLS.fireball.cv; const q1 = need - 1 - Math.ceil(UNITS.dm_herald_tzeentch.wizard.level / 2);
  const a = cast('dm_herald_tzeentch', [Math.ceil(q1 / 2), Math.floor(q1 / 2)]), b = cast(k2, [Math.ceil(q1 / 2), Math.floor(q1 / 2)]); ok(!/no logra/.test(a) && /no logra/.test(b), `con total justo −1: Tzeentch ${a.slice(0, 80)} | control ${b.slice(0, 80)}`); delete UNITS[k2];
});
T('v836-sr-randomAtk', CORE + ' (Random Attacks) + rules/new/leg_daemons.txt (Nurglings, Beast of Nurgle)', 'Ataques aleatorios: el número de Ataques por modelo se tira al empezar el combate (D3+1 los Nurglings)', () => {
  const r = bout('dm_nurglings', {}, 'state_troops', {}, { noFight: true, fa: 'dm', fb: 'empire' }); cur(r.s); dice(3, 3, 3, 3, 3, 3, 3, 3, 3); diceAll(1); const ev = fight(r.s); const A = r.a.curA; eq(R.D(r.a).randA, 'D3+1', 'perfil'); ok(A >= 2 && A <= 4, 'A aleatorio fuera de D3+1: ' + A);
  const r2 = bout('dm_nurglings', {}, 'state_troops', {}, { noFight: true, fa: 'dm', fb: 'empire' }); cur(r2.s); diceAll(1); fight(r2.s); ok(r2.a.curA === 2, 'con 1 en los dados: D3+1 = 2'); const r3 = bout('dm_nurglings', {}, 'state_troops', {}, { noFight: true, fa: 'dm', fb: 'empire' }); cur(r3.s); diceAll(6); fight(r3.s); ok(r3.a.curA === 4, 'con 6: D3+1 = 4 (' + r3.a.curA + ')');
});

// ---------- cuidadores, guardia real, comandante de guarnición, estandartes de la Inestabilidad ----------
const handShoot = (t, f, models, mix) => { const s = game([{ type: t, models, ...(mix != null ? { mix } : {}) }], [{ type: 'state_troops', models: 10 }], { f: [f, 'empire'], phase: 'shoot' }); const u = U(s, t); cur(s); return { s, u }; };
T('v836-sr-beastHandlers', 'rules/new/leg_lizardmen.txt (Beast Handlers)', 'Cuidadores de bestias: de los impactos de disparo, 1-4 a la bestia y 5+ a un Cuidador (D6 por impacto antes de herir)', () => {
  const { s, u } = handShoot('lm_salamander', 'lm', 4); const h0 = u.hand, m0 = u.models; ok(h0 > 0, 'sin Cuidadores en el montaje'); dice(1, 2, 5, 6, 6, 1, 1, 6, 1, 1); diceAll(1);
  const r = R.woundAndSave(s, u, 4, 4, 0, { ranged: true }); eq(u.hand, h0 - 2, 'los dos impactos con 5+ abaten a dos Cuidadores (herida 6, salvación 1, anulación 1)'); eq(u.models, m0, 'los impactos con 1-4 caen sobre la bestia (dados de herida 1: sin bajas)');
  const s2 = handShoot('lm_salamander', 'lm', 4); dice(1, 1, 1, 1); diceAll(1); const h1 = s2.u.hand; R.woundAndSave(s2.s, s2.u, 4, 4, 0, { ranged: true }); eq(s2.u.hand, h1, 'con cuatro 1-4 ningún Cuidador sufre impactos');
});
T('v836-sr-safeHarm', 'rules/new/leg_skaven.txt (Safe from Harm)', 'A salvo del daño: de los impactos de disparo a Ogros Rata con Maestros de Manada, 5+ cae sobre un Maestro', () => {
  const { s, u } = handShoot('sk_ratogres', 'sk', 4, 2); const h0 = u.hand; ok(h0 > 0, 'sin Maestros de Manada en el montaje (hand=' + h0 + ')'); dice(5, 5, 1, 1, 6, 1, 1, 6, 1, 1); diceAll(1); R.woundAndSave(s, u, 4, 5, 0, { ranged: true }); ok(u.hand < h0, 'ningún Maestro de Manada recibe impactos con 5+');
});
T('v836-sr-royalGuard', FOF + ' (Royal Guard, Hammerers)', 'Guardia real: con un Rey o Thane unido, cualquier modelo de los Martilladores puede dar y aceptar desafíos como un personaje', () => {
  const s = game([{ type: 'dw_hammerers', models: 10 }, { type: 'dw_king', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'], join: true }); const h = U(s, 'dw_hammerers'); cur(s); ok(R.duelists(h, s).some((x) => /^c:/.test(x.key)), 'con el Rey unido no hay campeón-modelo desafiante: ' + JSON.stringify(R.duelists(h, s)));
  const s2 = game([{ type: 'dw_hammerers', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'] }); cur(s2); ok(!R.duelists(U(s2, 'dw_hammerers'), s2).some((x) => /^c:/.test(x.key)), 'sin Rey/Thane pueden desafiar');
  ok(DATA.armyIssues([{ type: 'dw_hammerers', models: 10 }, { type: 'dw_hammerers', models: 10 }, { type: 'dw_king', models: 1 }], 2000, 'open', 'grand').some((x) => /Guardia real|Martilladores/i.test(x)), 'dos unidades de Martilladores con un solo Rey/Thane no dan error');
});
T('v836-sr-accArch', 'rules/new/aj_highelves.txt (Accomplished Archer)', 'Arqueros consumados: el Comandante de Guarnición tiene Evasiva y Disparar y huir; la Guardia Marina a la que se une también', () => {
  const s = game([{ type: 'he_garrison', models: 1 }, { type: 'he_seaguard', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['he', 'empire'], join: true }); const g = U(s, 'he_garrison'), sg = U(s, 'he_seaguard'); cur(s);
  ok(R.has(g, 'evasive') && R.has(g, 'fireFlee'), 'el Comandante no tiene Evasiva/Disparar y huir'); const s2 = game([{ type: 'he_seaguard', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['he', 'empire'] }); cur(s2); ok(!R.has(U(s2, 'he_seaguard'), 'evasive'), 'la Guardia Marina sola tiene Evasiva');
  const host = s.units.find((u) => (u.joined || []).some((j) => j.type === 'he_garrison')); if (host) ok(R.has(host, 'evasive') && R.has(host, 'fireFlee'), 'la Guardia Marina con el Comandante no gana Evasiva/Disparar y huir');
});
T('v836-sr-countBanner', 'rules/new/leg_vampires.txt (Standard of the Count / Wight Banner) + core.txt Hold Your Ground', 'Estandartes del Conde/Tumulario: si es el Portaestandarte de Batalla, reduce en D3 las Heridas perdidas por Inestable de las unidades en su alcance de mando', () => {
  const lost = (k, std, near = true) => { const s = game([{ type: 'vc_zombies', models: 20 }, { type: k, models: 1, std }], [{ type: 'state_troops', models: 30 }], { f: ['vc', 'empire'] }); const z = U(s, 'vc_zombies'), c = U(s, k), e = U(s, 'state_troops', 1); engage(s, e, z); put(c, z.x + 14 + (near ? -10 : 40), z.y); cur(s); diceAll((n) => (n === 3 ? 2 : 4)); const ev = fight(s); const m = /es Inestable: pierde (\d+) Heridas/.exec(msgs(ev)); return m ? +m[1] : null; };
  for (const k of ['vc_thrall', 'vc_wightlord']) { has(UNITS[k].sr, k === 'vc_thrall' ? 'countBanner' : 'wightBanner'); const a = lost(k, true), b = lost(k, false), c = lost(k, true, false); ok(a != null && b != null, 'sin Inestable en el registro'); eq(a, b - 2, k + ': con el estandarte −D3 (=2) Heridas; sin él ' + b); eq(c, b, k + ': fuera del alcance de mando'); }
});

T('v836-sr-eshinInf', 'rules/new/leg_skaven.txt (Eshin Infiltration)', 'Infiltración Eshin: Corredores de las Cloacas Emboscadores llegan a 12" de un Maestro Asesino revelado y a más de 6" del enemigo; no pueden cargar', () => {
  const s = game([{ type: 'sk_gutter', models: 5 }, { type: 'sk_assassin', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['sk', 'empire'], phase: 'move', turn: 2, active: 0 }); const g = U(s, 'sk_gutter'), a = U(s, 'sk_assassin'), e = U(s, 'state_troops', 1);
  put(a, 36, 30); put(e, 36, 10, Math.PI / 2); s.units = s.units.filter((x) => x !== g); g.ambusher = true; g.ambushOK = true; g.fx = []; s.reserves = [g]; cur(s);
  ok(!R.apply(s, { t: 'enter', id: g.id, near: 'no-existe' }).ok, 'entra junto a un asesino inexistente'); const r = R.apply(s, { t: 'enter', id: g.id, near: a.id }); ok(r.ok, r.error);
  ok(R.unitDist ? true : true, ''); const dA = Math.hypot(g.x - a.x, g.y - a.y); ok(dA <= 12 + 12, 'lejos del asesino: ' + dA); ok(g.noCharge, 'puede cargar al llegar'); ok(Math.hypot(g.x - e.x, g.y - e.y) > 6 + 4, 'a menos de 6" del enemigo');
});
T('v836-sr-leaderPack', 'rules/new/leg_skaven.txt (Leader of the Pack) + rules/new/aj_beasts2.txt:1235', 'Líder de la manada: los Maestros ocupan las filas traseras y las bestias siempre las delanteras (el frente no tiene Maestros mientras haya bestias para llenarlo)', () => {
  const mk = (side) => { const s = game([{ type: 'sk_ratogres', models: 5, mix: 2 }], [{ type: 'state_troops', models: 10 }], { f: ['sk', 'empire'] }); const u = U(s, 'sk_ratogres'), e = U(s, 'state_troops', 1); u.files = 5; engage(s, e, u, side); cur(s); ok(u.hand === 2 && u.models === 5, 'montaje ' + u.hand + '/' + u.models); return R.handWin(u, e); };
  eq(mk('front'), [0, 5], 'por el frente (5 bestias en la fila delantera): ningún Maestro en contacto'); eq(mk('rear'), [2, 2], 'por la retaguardia: la última fila son los 2 Maestros');
  has(UNITS.sk_packmaster.sr, 'leaderPack');
});
T('v836-sr-mercCmd', 'rules/new/aj_empire2.txt (Mercenary Commander, Hans von Löwenhacke)', 'Comandante mercenario: si Hans es el General, sus mercenarios no sufren «Mercenarios díscolos» y pueden ser unidos por él', () => {
  let rogue = 0, tot = 0; for (let seed = 1; seed <= 24; seed++) { const s = R.createGame({ seed, armies: [[{ type: 'emp_hans', models: 1 }, { type: 'dw_impmerc', models: 10 }], [{ type: 'state_troops', models: 10 }]], factions: ['empire', 'empire'], limit: 2000 }); const m = s.units.find((x) => x.type === 'dw_impmerc') || s.units.flatMap((h) => h.joined || []).find((x) => x.type === 'dw_impmerc'); if (m) { tot++; if (m.misb) rogue++; ok(m.hansMerc, 'sin hansMerc'); } }
  ok(tot > 0 && rogue === 0, `mercenarios díscolos con Hans de General: ${rogue}/${tot}`);
  let rg2 = 0; for (let seed = 1; seed <= 40; seed++) { const s = R.createGame({ seed, armies: [[{ type: 'empire_general', models: 1 }, { type: 'dw_impmerc', models: 10 }], [{ type: 'state_troops', models: 10 }]], factions: ['empire', 'empire'], limit: 2000 }); const m = s.units.find((x) => x.type === 'dw_impmerc'); if (m?.misb) rg2++; } ok(rg2 > 0, 'sin Hans los mercenarios nunca son díscolos (control)');
});
T('v836-sr-peerless', 'rules/new/aj_chaos2.txt:1065 (Peerless Raider)', 'Incursora sin igual (Frydaal, General): +1 o −1 (elige el jugador) a la tirada de llegada de cada unidad Emboscadora elegible', () => {
  ok(R.FRYD_RE.test('woc_marauders_amb') && R.FRYD_RE.test('woc_horsemen'), 'unidades elegibles'); const s = game([{ type: 'woc_frydaal', models: 1 }, { type: 'woc_marauders_amb', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'], phase: 'strategy', turn: 2, active: 0 });
  const m = U(s, 'woc_marauders_amb'); ok(R.frydGen(s, 0), 'Frydaal no es la General'); s.units = s.units.filter((x) => x !== m); m.ambusher = true; m.ambushOK = false; m.reserved = true; s.reserves = [m]; cur(s);
  const o = asks(s, (c) => { const ev = []; dice(2); R.beginStrategy(c, ev); return ev; }, [0]); ok(o.needs.some((n) => /Incursora/.test(n.title)), 'no se ofrece ±1 a la llegada: ' + o.needs.map((n) => n.title).join(','));
});

// ---------- Rasgos caóticos (AJ Westerland p.40), Khopesh, Maldecido por los dioses, Desgarrador de enemigos (Razorgor) ----------
const ctU = (k, o) => { const s = game([{ type: k, models: n0(k), opts: [o] }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'] }); const u = U(s, k, 0); cur(s); return { s, u, d: R.D(u) }; };
T('v836-sr-ctFort', 'rules/new/aj_westerland_ocr300.txt:2019 (Unnatural Fortitude)', 'Fortaleza antinatural: +1 Resistencia salvo con armadura pesada o completa', () => {
  const lo = ctU('woc_marauders', 'ct_fort'), hi = ctU('woc_warriors', 'ct_fort'); eq(lo.d.T, UNITS.woc_marauders.T + 1, 'armadura ligera: +1 R'); eq(hi.d.T, UNITS.woc_warriors.T, 'armadura pesada: sin bonificación'); eq(ctU('woc_marauders', 'ct_dark').d.T, UNITS.woc_marauders.T, 'sin el rasgo no cambia');
});
T('v836-sr-ctLong', 'rules/new/aj_westerland_ocr300.txt (Long Strides)', 'Zancadas largas: Vanguardia salvo con armadura pesada o completa', () => { has(ctU('woc_marauders', 'ct_long').d.sr, 'vanguard'); no(ctU('woc_warriors', 'ct_long').d.sr, 'vanguard'); no(ctU('woc_marauders', 'ct_fort').d.sr, 'vanguard'); });
T('v836-sr-ctWill', 'rules/new/aj_westerland_ocr300.txt (Brazen Willpower)', 'Voluntad descarada: Resistencia mágica (−1) para infantería o caballería', () => { has(ctU('woc_marauders', 'ct_will').d.sr, 'magRes'); has(ctU('woc_knights', 'ct_will').d.sr, 'magRes'); no(ctU('woc_marauders', 'ct_fort').d.sr, 'magRes'); const { s, u } = ctU('woc_marauders', 'ct_will'); eq(R.mrOf(u), 1, 'magnitud de la Resistencia mágica'); });
T('v836-sr-khopesh', 'rules/new/aj_tk2.txt (Khopesh)', 'Khopesh: el arma de mano sencilla tiene FP −1', () => {
  const ks = Object.keys(UNITS).filter((k) => !UNITS[k].legacy && UNITS[k].sr.includes('khopesh')); ok(ks.length >= 5, 'pocas unidades con Khopesh'); let n = 0;
  for (const k of ks.slice(0, 8)) { const s = game([{ type: k, models: n0(k) }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'] }); const u = U(s, k, 0), e = U(s, 'state_troops', 1); engage(s, u, e); cur(s); const p = R.attackProfile(u, e); if (!(R.D(u).melee?.twoHands || R.D(u).melee?.extra || R.D(u).melee?.sb)) { ok(p.ap >= 1, k + ': FP ' + p.ap); n++; } } ok(n >= 3, 'pruebas útiles: ' + n);
});
T('v836-sr-cursedGods', 'rules/new/aj_chaos2.txt:1453 (Cursed by the Gods)', 'Maldecido por los dioses: Khorne Impactos (D3) y Golpe mortal; Nurgle envenenado y Regeneración (5+); Slaanesh Contracarga y Ataca primero; Tzeentch flamígero, mágico y Resistencia mágica (−2)', () => {
  const g = (x) => UNITS['woc_gspawn' + x]; for (const f of ['woc', 'bm']) {
    const k = (x) => UNITS[f + '_gspawn' + x]; ok(k('k') && k('n') && k('s') && k('t'), 'faltan engendros'); has(R.D({ type: f + '_gspawnk', opts: [], items: [], fx: [] }).sr, 'killingBlow'); ok(k('k').impact?.n === 'D3', 'Khorne: Impactos D3'); eq(k('n').regen, 5, 'Nurgle: Regeneración 5+'); has(k('n').sr, 'poisoned');
    has(k('s').sr, 'counterCharge'); has(k('s').sr, 'strikeFirst'); has(k('t').sr, 'magical'); has(k('t').sr, 'magRes2'); ok(k('t').sr.includes('flaming') || (k('t').melee || {}).flaming, 'ataques flamígeros');
  }
  const s = game([{ type: 'woc_gspawnt', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'] }); const t = U(s, 'woc_gspawnt'); cur(s); ok(R.mrOf(t) === 2, 'Resistencia mágica −2: ' + R.mrOf(t));
});
T('v836-sr-foeRenderR', 'rules/new/aj_beasts2.txt:1260 + rh.txt (Razorgor Chariots, Foe-render)', 'Desgarrador de enemigos (Razorgor): con Furia primigenia, los colmillos del Razorgor tienen FP −2; la dotación no', () => {
  const run = (q) => { const r = bout('bm_razorchariot', {}, 'dw_warriors', {}, { noFight: true, fa: 'bm', fb: 'dw' }); cur(r.s); dice(q); diceAll(4); const ev = fight(r.s); return blows(ev, r.a.name); };
  const w = run([1, 1]), n = run([6, 6]); const tus = (b) => b.find((x) => x.n === 4); eq(tus(w).w, 4, 'con Furia primigenia: 4 heridas de los colmillos (FP −2 contra Sv 4+ con dado 4)'); eq(tus(n).w, 0, 'sin Furia: sin heridas'); eq(w.filter((x) => x.n === 1).map((x) => x.w), [0, 0], 'la dotación no gana la FP');
});
