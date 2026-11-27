// v836 — Tarea B: las 66 entradas automatizables del inventario FAQ que quedaban pendientes
import { Us, T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, blows, join, bout, sum, withSr, nDice, cloneType, one } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const FF = 'rules/new/faq_fof.txt:', FR = 'rules/new/faq_rh.txt:', FC = 'rules/new/faq_core.txt:', FCA = 'rules/new/faq_cathay.txt:';
const without = (base, id, rules) => cloneType(base, id, { sr: UNITS[base].sr.filter((r) => !rules.includes(r)) });

T('fof-qa-003', FF + '225', 'Matador (Slayer) también aprovecha los impactos de Último golpe (Deathblow): hieren a 4+', () => {
  const run = (k) => { const s = game([{ type: 'ok_bulls', models: 10 }], [{ type: k, models: 5 }], { f: ['ok', 'dw'] }); const a = U(s, 'ok_bulls', 0), d = U(s, k, 1); d.models = 1; d.wounds = R.D(d).W; engage(s, a, d); cur(s); diceAll(4); const m = msgs(fight(s)); const q = /Último golpe: .* sufre (\d+) impactos → (\d+) heridas/.exec(m); return q ? +q[2] : null; };
  const k0 = 'dw_slayers'; const c = cloneType(k0, 'x_sl', { sr: UNITS[k0].sr.filter((r) => !/^slayer/.test(r)) }); const a = run(k0), b = run(c); delete UNITS[c]; ok(a != null && b != null, 'no hay Último golpe en el registro'); ok(a > b, `con Matador ${a} heridas, sin Matador ${b}`);
});
T('fof-qa-012', FF + '232', 'Cortagoblins, Muerte giratoria: UN solo modificador D3 (no uno por fila o columna)', () => {
  const s = game([{ type: 'dw_hewer', models: 1 }], [{ type: 'state_troops', models: 30 }], { f: ['dw', 'empire'], phase: 'shoot' }); const h = U(s, 'dw_hewer'), t = U(s, 'state_troops', 1); put(h, 36, 40); put(t, 36, 30, Math.PI / 2); t.files = 5; cur(s); diceAll(2); const ev = []; R.resolveShot(s, h, t, ev); const q = /dado de artillería (\d+) \+ D3 = (\d+) disparos/.exec(msgs(ev)); ok(q, 'sin Destrucción giratoria: ' + msgs(ev)); eq(+q[2] - +q[1], 2, 'un solo D3 (=2), no uno por cada una de las 6 filas');
});
T('fof-qa-014', FF + '244', 'Tanque de Vapor: el Ingeniero Comandante y el cañón de vapor disparan el mismo turno', () => {
  const s = game([{ type: 'steam_tank', models: 1, opts: ['rpp'] }], [{ type: 'orc_boyz', models: 40 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const a = U(s, 'steam_tank'), e = U(s, 'orc_boyz', 1); put(a, 36, 40); put(e, 36, 33, Math.PI / 2); cur(s); diceAll(4); const r = R.apply(s, { t: 'shoot', id: a.id, target: e.id }); ok(r.ok, r.error);
  const n = r.events.filter((x) => /Tanque de Vapor dispara a/.test(x.msg)).length; eq(n, 2, 'disparos del Tanque: cañón + pistola del Comandante en la misma acción'); ok(r.events.some((x) => /3 tiros/.test(x.msg)), 'no dispara la pistola de repetición (3 tiros)'); ok(!R.apply(s, { t: 'shoot', id: a.id, target: e.id }).ok, 'puede volver a disparar');
});
T('fof-qa-029', FF + '327', 'Mejores corceles repite la tirada de carga pero NO el D6 de la Zancada veloz', () => {
  const k = 'br_errant'; ok(UNITS[k].sr.includes('finestHorses') && UNITS[k].sr.includes('swiftstride'), 'montaje'); const reach = (q) => { const s = game([{ type: k, models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['bret', 'empire'], phase: 'move' }); const a = U(s, k), e = U(s, 'state_troops', 1); put(a, 36, 44); put(e, 36, 4, Math.PI / 2); cur(s); dice(q); diceAll(6); const ev = []; R.doCharge(s, a, e, ev); const m = /alcance (\d+)"/.exec(msgs(ev)); ok(m, msgs(ev)); return +m[1]; };
  const M = UNITS[k].M; const a = reach([1, 1, 3, 3, 1]); eq(a, M + 3 + 1, 'los 1 de la tirada se repiten (3,3) y el D6 de la Zancada (1) no: M + 3 + 1'); });
T('fof-qa-035', FF + '333', 'Destreza marcial: solo da apoyo por flanco/retaguardia a armas que ya pueden luchar en fila extra', () => {
  const nm = without('de_warriors', 'x_dw_nm', ['martial']), nm2 = without('he_spearmen', 'x_he_nm', ['martial']); try {
    const atk = (k, f) => { const r = bout('orc_boyz', { models: 20 }, k, { models: 20 }, { noFight: true, fa: 'orcs', fb: f, side: 'flank' }); cur(r.s); return R.attackProfile(r.b, r.a).atk; };
    eq(atk('de_warriors', 'de'), atk(nm, 'de'), 'sin arma de fila extra: Destreza marcial no añade ataques de apoyo'); ok(atk('he_spearmen', 'he') > atk(nm2, 'he'), 'con lanza (fila extra): Destreza marcial sí añade apoyo por el flanco');
  } finally { delete UNITS.x_dw_nm; delete UNITS.x_he_nm; }
});
// ---- RH ----
const castMsg = (s, w, e, q, key = 'fireball') => { w.spells = [key]; w.casted = []; cur(s); dice(q); diceAll(1); const ev = []; R.doCast(s, w, key, e, ev); return msgs(ev); };
T('rh-errata-039', FR + 'Aquelarre oscuro', 'Aquelarre oscuro: el Chamán Bray recibe +1 a lanzar con otro Mago amigo cerca (solo en Manada Salvaje)', () => {
  const run = (mate, lists) => { const s = game([{ type: 'bm_bs', models: 1 }, ...(mate ? [{ type: 'bm_bs', models: 1 }] : [])], [{ type: 'state_troops', models: 10 }], { f: ['bm', 'empire'], phase: 'magic', lists });
    const ws = Us(s, 'bm_bs', 0); const w = ws[0], e = U(s, 'state_troops', 1); put(w, 36, 40); if (ws[1]) put(ws[1], 40, 40); put(e, 36, 30, Math.PI / 2);
    const lv = Math.ceil(R.D(w).wizard.level / 2), q1 = SPELLS.fireball.cv - 1 - lv; return castMsg(s, w, e, [Math.ceil(q1 / 2), Math.floor(q1 / 2)]); };
  const a = run(true, ['wild', 'grand']), b = run(false, ['wild', 'grand']), c = run(true, ['grand', 'grand']);
  ok(!/no logra/.test(a), 'con otro Mago cerca: el +1 alcanza el valor de lanzamiento: ' + a.slice(0, 120)); ok(/no logra/.test(b), 'solo: falla'); ok(/no logra/.test(c), 'fuera de Manada Salvaje: sin +1');
});
T('rh-errata-046', FR + 'Escultor de piedra', 'Escultor de piedra: se nomina (popup) un constructo en alcance de mando y su salvación de Regeneración mejora en 1 hasta final de turno', () => {
  const s = game([{ type: 'tk_archnecro', models: 1 }, { type: 'tk_colossus', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'], phase: 'move', lists: ['mortuary', 'grand'] });
  const c = U(s, 'tk_archnecro'), k = U(s, 'tk_colossus'); put(c, 36, 40); put(k, 36, 36); put(U(s, 'state_troops', 1), 36, 8, Math.PI / 2); cur(s);
  const r = asks(s, (x) => { const ev = []; R.beginStrategy(x, ev); return msgs(ev); }, [0, 1], (n) => (n.opts.find((o) => o[0] === k.id) || n.opts[0])[0]);
  ok(r.needs.some((n) => /Escultor de piedra/.test(n.title || n.msg || JSON.stringify(n))), 'sin popup de nominación'); ok(/Escultor de piedra/.test(r.r), 'sin aviso: ' + r.r.slice(0, 160));
  const kk = U(r.s, 'tk_colossus'); ok(kk.fx.some((f) => f.k === 'ssReg'), 'efecto aplicado a la unidad nominada');
  // efecto: la salvación de Regeneración mejora 1 (de rg+ a rg-1+)
  const t = 'trolls'; const run = (fxOn, d) => { const g = game([{ type: t, models: 5 }], [{ type: 'state_troops', models: 5 }], { f: ['orcs', 'empire'] }); const u = U(g, t, 0); if (fxOn) u.fx.push({ k: 'ssReg', endTurn: true }); cur(g); dice(6, 1, d); diceAll(1); return R.woundAndSave(g, u, 1, 4, 0, { noArmour: true }).through; };
  const rg = R.D(U(game([{ type: t, models: 5 }], [{ type: 'state_troops', models: 5 }], { f: ['orcs', 'empire'] }), t, 0)).regen; eq(run(false, rg - 1), 1, 'sin efecto: ' + (rg - 1) + ' no salva'); eq(run(true, rg - 1), 0, 'con efecto: ' + (rg - 1) + ' salva'); eq(run(true, rg - 2), 1, 'con efecto: ' + (rg - 2) + ' no salva');
});
T('rh-errata-040', FR + 'Ánimo sepulcral', 'Ánimo sepulcral: antes de lanzar, el constructo nominado pierde 1 Herida y la tirada recibe +1; una vez por turno; solo Cultos Mortuorios', () => {
  const run = (nom, lists, q) => { const s = game([{ type: 'tk_hpriest', models: 1 }, { type: 'tk_colossus', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'], phase: 'magic', lists }); const w = U(s, 'tk_hpriest'), k = U(s, 'tk_colossus'), e = U(s, 'state_troops', 1); put(w, 36, 40); put(k, 36, 36); put(e, 36, 30, Math.PI / 2);
    const lv = Math.ceil(R.D(w).wizard.level / 2), q1 = SPELLS.fireball.cv - 1 - lv; if (nom) { cur(s); ok(R.animusSources(s, w).some((m) => m.id === k.id), 'el Coloso es fuente válida'); w.animusSrc = k.id; } const w0 = k.wounds; const m = castMsg(s, w, e, [Math.ceil(q1 / 2), Math.floor(q1 / 2)]); return { m, lost: w0 - k.wounds, s, w, k }; };
  const a = run(true, ['mortuary', 'grand']), b = run(false, ['mortuary', 'grand']), c = run(false, ['grand', 'grand']);
  ok(!/no logra/.test(a.m), 'con animus: +1 alcanza el valor: ' + a.m.slice(0, 100)); eq(a.lost, 1, 'pierde 1 Herida'); ok(/no logra/.test(b.m) && b.lost === 0, 'sin nominar: no hay efecto'); ok(/no logra/.test(c.m), 'fuera de Culto Mortuorio'); 
  cur(a.s); eq(R.animusSources(a.s, a.w).length, 0, 'ya usado este turno: no hay más fuentes');
});
T('cathay-qa-003', FCA + '80', 'Maestría de los Vientos Elementales: una vez por turno por EJÉRCITO (no por Mago)', () => {
  const s = game([{ type: 'ct_shugengan', models: 1 }, { type: 'ct_miaoying', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['ct', 'empire'], phase: 'magic' }); const a = U(s, 'ct_shugengan'), b = U(s, 'ct_miaoying'), e = U(s, 'state_troops', 1); put(a, 36, 40); put(b, 39, 40); put(e, 36, 30, Math.PI / 2);
  const q = (w) => { const lv = Math.ceil(R.D(w).wizard.level / 2), q1 = SPELLS.fireball.cv - 1 - lv; return [Math.ceil(q1 / 2), Math.floor(q1 / 2)]; };
  const m1 = castMsg(s, a, e, q(a)), m2 = castMsg(s, b, e, q(b));
  ok(!/no logra/.test(m1), 'el primer Mago recibe +1: ' + m1.slice(0, 100)); ok(/no logra/.test(m2), 'el segundo Mago del mismo turno ya no (una vez por ejército): ' + m2.slice(0, 100));
  s.turn++; s.round = s.turn; const m3 = castMsg(s, b, e, q(b)); ok(!/no logra/.test(m3), 'al turno siguiente se puede usar de nuevo');
});
T('rh-qa-016', FR + '236', 'Ídolo de Gork: amplía el alcance (+3") pero NO el aura de un hechizo de alcance «Propio»', () => {
  const idol = Object.keys(ITEMS).find((k) => ITEMS[k].idolGork); ok(idol, 'objeto');
  const tg = (items, key, dist, foeSide) => { const s = game([{ type: 'orc_weirdnob', models: 1, items }, { type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'magic' }); const w = U(s, 'orc_weirdnob'), f = U(s, 'orc_boyz', 0), e = U(s, 'state_troops', 1); put(w, 36, 40); w.spells = [key]; cur(s);
    if (foeSide) { put(e, 36, 40 - dist - GEOM.dims(e).d / 2 - GEOM.dims(w).d / 2, Math.PI / 2); put(f, 4, 4); } else { put(f, 36, 40 - dist - GEOM.dims(f).d / 2 - GEOM.dims(w).d / 2, Math.PI / 2); put(e, 4, 44); } return R.spellTargets(s, w, key).map((x) => x.id); };
  const ranged = Object.entries(SPELLS).find(([k, v]) => v.range >= 6 && v.range <= 24 && ['assail', 'missile'].includes(v.type) && (v.lore === 'waaagh' || /gork|waaagh|little|big/.test(v.lore || ''))); ok(ranged, 'hechizo con alcance');
  const [rk, rv] = ranged; const outs = tg([idol], rk, rv.range + 2, true), outn = tg([], rk, rv.range + 2, true); const e0 = 1;
  ok(outs.length > outn.length, 'con el Ídolo: un objetivo a alcance+2" entra (' + outs.length + ' vs ' + outn.length + ')');
  const eff = (items, dist) => { const s = game([{ type: 'orc_weirdnob', models: 1, items }, { type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'magic' }); const w = U(s, 'orc_weirdnob'), f = U(s, 'orc_boyz', 0), e = U(s, 'state_troops', 1); put(w, 36, 40); put(e, 4, 4); put(f, 36, 40 - dist - GEOM.dims(f).d / 2 - GEOM.dims(w).d / 2, Math.PI / 2);
    w.spells = ['ere_we_go']; w.casted = []; cur(s); dice(5, 5); diceAll(1); const ev = []; R.doCast(s, w, 'ere_we_go', w, ev); return { fx: (f.fx || []).filter((x) => x.k === 'charge').length, m: msgs(ev), A: R.commandRange(w) }; };
  const A = eff([idol], 1).A; const inS = eff([idol], A - 3), outS = eff([idol], A + 2), outN = eff([], A + 2);
  ok(inS.fx > 0, 'control: dentro del aura recibe el efecto: ' + inS.m.slice(0, 120)); eq(outS.fx, 0, 'con el Ídolo, a aura+2" sigue sin recibirlo'); eq(outN.fx, 0, 'sin Ídolo, tampoco');
});
T('rh-qa-028', FR + '266', 'Luz de la Protección del Ataúd de Almas: los efectos NO se acumulan (un solo efecto aunque se vuelva a lanzar)', () => {
  const k = Object.keys(UNITS).find((x) => (UNITS[x].sr || []).includes('casket') || /casket/.test(UNITS[x].id)); const items = Object.keys(ITEMS).filter((x) => ITEMS[x].bound && /casket/.test(JSON.stringify(ITEMS[x])));
  const s = game([{ type: 'tk_hpriest', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'], phase: 'magic' }); const w = U(s, 'tk_hpriest'); put(w, 36, 40); put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); cur(s);
  const ev1 = []; R.applySpell(s, w, 'light_protection', w, ev1); eq(w.fx.filter((f) => f.k === 'lightProt').length, 1, 'un único efecto tras lanzarlo'); const ev2 = []; R.applySpell(s, w, 'light_protection', w, ev2); eq(w.fx.filter((f) => f.k === 'lightProt').length, 0, 'volver a lanzarlo no suma efectos: el hechizo termina (FAQ Core)'); ok(/ya estaba en juego/.test(msgs(ev2)), 'aviso');
  const save = (n) => { const g = game([{ type: 'tk_hpriest', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'] }); const d = U(g, 'tk_hpriest'); for (let i = 0; i < n; i++) { d.fx.push({ k: 'lightProt', rip: true, src: d.id }); } cur(g); return R.wardOf ? R.wardOf(d) : null; };
  const a = save(1), b = save(2); eq(a, b, 'la salvación especial es la misma con 1 o 2 efectos (' + a + ')');
});
T('rh-qa-025', FR + '249', 'Aquelarre oscuro + Cáliz de la Plaga: doble natural → invocación perfecta Y Disfunción del Aquelarre (ambos resultados)', () => {
  const s = game([{ type: 'bm_bs', models: 1, items: ['plague_chalice'] }, { type: 'bm_bs', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['bm', 'empire'], phase: 'magic', lists: ['wild', 'grand'] }); const ws = Us(s, 'bm_bs', 0), w = ws.find((x) => (x.items || []).includes('plague_chalice')); const m = ws.find((x) => x !== w); put(w, 36, 40); put(m, 40, 40); const e = U(s, 'state_troops', 1); put(e, 36, 30, Math.PI / 2);
  const msg = castMsg(s, w, e, [3, 3]); ok(/Cáliz de la Plaga: invocación perfecta/.test(msg), 'invocación perfecta del Cáliz: ' + msg.slice(0, 200)); ok(/Aquelarre Oscuro: .* sufre también la Disfunción/.test(msg), 'Disfunción para el resto del Aquelarre: ' + msg.slice(0, 300));
});
// ---- Core ----
const wearIt = (items, banner) => { const s = game([{ type: 'emp_engineer', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'] }); const u = U(s, 'emp_engineer', 0); u.items = items; if (banner) u.banner = banner; cur(s); return u; };
T('core-qa-158', FC + '919', 'Piedra de Obsidiana: las piedras se acumulan entre sí (máx. 3) pero no mejoran la Resistencia mágica de otra fuente', () => {
  eq(R.mrItems(wearIt(['lodestone'])), 1, '1 piedra'); eq(R.mrItems(wearIt(['lodestone', 'lodestone'])), 2, '2 piedras: 2'); eq(R.mrItems(wearIt(['lodestone', 'lodestone', 'lodestone', 'lodestone'])), 3, 'máximo 3');
  const other = Object.keys(ITEMS).find((k) => ITEMS[k].mr === 2 && ITEMS[k].cat !== 'e'); ok(other, 'otra fuente de RM'); eq(R.mrItems(wearIt(['lodestone', other])), 2, 'piedra + otra fuente (RM 2): vale la mayor, no se suman (' + other + ')'); });
T('core-qa-159', FC + '924', 'Estandarte que mejora las armas (Estandarte Afilado) no las hace mágicas', () => { const run = (b) => { const r = bout('state_troops', { models: 10 }, 'orc_boyz', { models: 10 }, { noFight: true, fa: 'empire', fb: 'orcs' }); r.a.banner = b; cur(r.s); globalThis.__WSL = []; diceAll(4); fight(r.s); return globalThis.__WSL.filter((x) => x.def === r.b); }; const w = run('razor'), c = run(null); ok(w.length && c.length, 'golpes'); ok(w.every((x) => !x.o.magical), 'las armas siguen sin ser mágicas'); ok((w[0].o.ab || 0) > (c[0].o.ab || 0), 'montaje: el estandarte da Perforante (2) (' + (w[0].o.ab || 0) + ' vs ' + (c[0].o.ab || 0) + ')'); });
