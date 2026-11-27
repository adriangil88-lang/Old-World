// v838 — Reglas de desafío y de unidad (elegibilidad por modelo, curación, terreno)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, asks } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const duelist = (type, n, x = {}) => { const s = game([{ type, models: n, ...x }], [{ type: 'state_troops', models: 10 }], { f: [F(type), F(type) === 'empire' ? 'orcs' : 'empire'] }); const u = U(s, type, 0); u.champ = false; cur(s); return { s, u, ds: R.duelists(u, s) }; };
const champRule = (rule, type, n, label) => T('rule-' + rule, RS(rule), label + ' (cualquier modelo puede dar y aceptar desafíos como un personaje; no puede rechazar el que uno de sus modelos pueda aceptar)', () => {
  const a = duelist(type, n); ok(a.ds.some((d) => d.key.startsWith('c:')), 'la unidad (sin campeón) ofrece un modelo como duelista: ' + JSON.stringify(a.ds)); if (rule === 'martialPride') ok(R.mustDuel({ k: 'c', m: a.u }), 'no puede rechazar un desafío que uno de sus modelos pueda aceptar'); else ok(!R.mustDuel({ k: 'c', m: a.u }), 'el texto no les impide rechazar');
  const b = duelist('state_troops', 10); ok(!b.ds.some((d) => d.key.startsWith('c:')), 'control: una unidad sin campeón ni la regla no tiene duelista');
  const one = duelist(type, 1, {}); if (DATA.UNITS[type].cat !== 'char') ok(!one.ds.some((d) => d.key.startsWith('c:')) || one.u.models > 1, 'con un solo modelo no hay "otro" que desafíe');
});
champRule('martialPride', 'vc_bloodknights', 5, 'Orgullo marcial');
champRule('fightMe', 'dw_slayers_g', 10, '¡Lucha conmigo!');
champRule('attentionSeeker', 'dm_beast', 3, 'Buscador de atención');
champRule('champChrace', 'he_lionguard', 10, 'Campeones de Chrace');
T('rule-tgGuardians', RS('tgGuardians'), 'Guardianes: dentro del Mando de un Slann cualquier modelo puede dar y aceptar desafíos como un personaje', () => {
  const mk = (near) => { const s = game([{ type: 'lm_temple', models: 5 }, { type: 'lm_slann', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['lm', 'empire'] }); const t = U(s, 'lm_temple', 0), sl = U(s, 'lm_slann', 0); t.champ = false; put(t, 36, 24); put(sl, near ? 36 : 70, near ? 30 : 5); cur(s); return R.duelists(t, s); };
  ok(mk(true).some((d) => d.key.startsWith('c:')), 'dentro del Mando del Slann: duelista'); ok(!mk(false).some((d) => d.key.startsWith('c:')), 'fuera del Mando: no');
});
T('rule-newlyDead', RS('newlyDead'), 'Los recién muertos: al resucitar caídos la unidad puede superar su tamaño inicial (sin pasar del máximo)', () => {
  const heal = (type, n) => { const s = game([{ type, models: n }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'] }); const t = U(s, type, 0); cur(s); const before = t.models; const h = R.necroHeal(t, 6); return { before, after: t.models, h, max: D(t).max, start: t.startModels }; };
  const z = heal('vc_zombies', 20), k = heal('vc_skeletons', 20); ok(z.after > z.start && z.after <= z.max, `Zombis superan el tamaño inicial (${z.start}→${z.after}, máx ${z.max})`); eq(k.after, k.start, 'control: los Esqueletos no pasan de su tamaño inicial');
});
T('rule-boundSpirits', RS('boundSpirits'), 'Espíritus ligados: a diferencia de otros enjambres no es Indisciplinado (puede usar Presencia inspiradora y Mantened la posición)', () => {
  const s = game([{ type: 'vc_spirithosts', models: 5 }, { type: 'vc_batswarm', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'] }); cur(s); const sp = U(s, 'vc_spirithosts', 0), bt = U(s, 'vc_batswarm', 0); ok(D(sp).tt === 'swarm' && D(bt).tt === 'swarm', 'montaje: ambos son enjambres');
  ok(R.undisc(bt) === true && R.undisc(sp) === false, 'el enjambre normal es Indisciplinado y los Espíritus ligados no');
});
T('rule-aquatic', RS('aquatic'), 'Acuático: sin penalizador al Movimiento en terreno difícil o peligroso designado como agua (pantano)', () => {
  const feats = (type) => { const s = game([{ type, models: 5 }], [{ type: 'state_troops', models: 10 }], { f: [F(type), FOE(type)], phase: 'move', terrain: [{ id: 'sw', kind: 'swamp', x: 36, y: 36, w: 20, h: 4 }] }); const u = put(U(s, type, 0), 36, 40); cur(s); return R.previewMove(s, u.id, { x: 36, y: 34, face: u.face }); };
  ok(DATA.UNITS.lm_skchief.sr.includes('aquatic') && !DATA.UNITS.lm_skirmishers.sr.includes('aquatic'), 'montaje'); const a = feats('lm_skchief'), b = feats('lm_skirmishers'); ok(b.feats.includes('sw'), 'control: sin la regla el pantano cuenta como terreno'); ok(!a.feats.includes('sw'), 'con Acuático el pantano no cuenta: ' + JSON.stringify(a));
});
T('rule-trapsSnares', RS('trapsSnares'), 'Trampas y lazos: quien termina su movimiento de carga en contacto con un modelo con la regla hace un chequeo de Terreno peligroso (cada 1 natural cuesta un modelo)', () => {
  const run = (rule) => { const go = () => { const s = game([{ type: 'state_troops', models: 20 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 36.2, Math.PI / 2); cur(s); diceAll(1); const r = R.apply(s, { t: 'charge', id: a.id, target: t.id }); return { m: msgs(r.events || []), r }; }; return rule ? withSr('orc_boyz', 'trapsSnares', go) : go(); };
  const w = run(true), n = run(false); ok(/terreno peligroso, \d+ bajas/.test(w.m), 'con la regla el cargador hace el chequeo y pierde modelos con 1s: ' + w.m.slice(-250)); ok(!/terreno peligroso/.test(n.m), 'control sin la regla: ningún chequeo: ' + n.m.slice(-150));
});
T('rule-hidden', RS('hidden'), 'Oculto: no se despliega; se oculta en una unidad élfica oscura de infantería con FU 10+ y se revela en el Inicio de turno o al comienzo de la fase de Combate', () => {
  const s = game([{ type: 'de_assassin', models: 1 }, { type: 'de_warriors', models: 20 }], [{ type: 'state_troops', models: 10 }], { f: ['de', 'empire'], keepRes: true }); const a = all(s).find((u) => u.type === 'de_assassin'); ok(a, 'montaje'); const w = all(s).find((u) => u.type === 'de_warriors'); ok(a.hiddenIn === w.id && (s.reserves || []).includes(a) && !s.units.includes(a), 'no se despliega: oculta en la unidad de Guerreros (FU 20)');

});
