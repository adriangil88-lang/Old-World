// v835 — mecánicas nuevas (tarea D) y reglas implementadas en esta versión
import { T, N, R, DATA, GEOM, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, blows, join } from '../lib.mjs';
const { UNITS, ITEMS } = DATA;
const RH = 'rules/rh.txt';
const venomFight = (k, f, opts, ans) => { const s = game([{ type: k, models: 1, opts }], [{ type: 'state_troops', models: 20 }], { f: [f, 'empire'] }); const a = U(s, k), d = U(s, 'state_troops'); d.files = 5; engage(s, a, d); cur(s);
  diceAll(4); return asks(s, (q) => fight(q), [0, 1], (n) => (n.title.includes('Aguij') || n.title.includes('Oleada') ? ans : undefined)); };
for (const [k, f, opts, src] of [['tk_scorpion', 'tk', [], RH + ':6210-6212'], ['tk_necrosphinx', 'tk', [], RH + ':6328-6330'], ['tk_warsphinx', 'tk', ['es'], RH + ':6155,6166-6168']]) {
  T('v835-sting-' + k, src, `${UNITS[k].name}: Aguijón venenoso — popup cada turno; si se usa, UN ataque a Iniciativa 10 (Golpea primero), F del modelo, sin FP, envenenado`, () => {
    const o = venomFight(k, f, opts, 'y'); ok(o.needs.some((n) => /Aguij/.test(n.title) && n.p === 0), 'no se pregunta'); const b = blows(o.r, UNITS[k].name); ok(b[0] && b[0].n === 1, 'el primer golpe no es el ataque único del aguijón: ' + JSON.stringify(b));
    const o2 = venomFight(k, f, opts, 'n'); ok(!blows(o2.r, UNITS[k].name).some((x) => x.n === 1 && blows(o2.r, UNITS[k].name).indexOf(x) === 0), 'sin aguijón sigue haciendo el ataque a I10');
    const tot = (r) => blows(r, UNITS[k].name).reduce((t, x) => t + x.n, 0); eq(tot(o.r), tot(o2.r), 'el aguijón añade un ataque (debe ser uno de sus ataques)');
  });
}
T('v835-sting-warsphinx-opt', RH + ':6155', 'Esfinge de Guerra: la opción Aguijón venenoso cuesta +5 y sin ella no hay popup', () => {
  const o = UNITS.tk_warsphinx.opts.find((x) => x.id === 'es'); eq(o?.cost, 5, 'coste'); const q = venomFight('tk_warsphinx', 'tk', [], 'y'); ok(!q.needs.some((n) => /Aguij/.test(n.title)), 'sin la opción se pregunta el aguijón');
  eq(UNITS.tk_warsphinx.opts.find((x) => x.id === 'fr')?.cost, 20, 'Rugido ígneo +20');
});
T('v835-venom-arachnarok', RH + ':1522-1528', 'Arachnarok: Oleada de veneno — un ataque a I10, FP −2, Heridas múltiples (D6), envenenado; la dotación ataca aparte (8 × HA2 F3 I3)', () => {
  const o = venomFight('arachnarok', 'orcs', [], 'y'); ok(o.needs.some((n) => /Oleada/.test(n.title)), 'no se pregunta'); const b = blows(o.r, 'Araña'); eq(b.map((x) => x.n), [1, 5, 8], 'reparto de ataques (oleada, araña, dotación)');
  const s = game([{ type: 'arachnarok', models: 1 }], [{ type: 'woc_ogres', models: 3 }], { f: ['orcs', 'woc'] }); const a = U(s, 'arachnarok'), d = U(s, 'woc_ogres'); engage(s, a, d); cur(s);
  diceAll(6); const q = asks(s, (x) => fight(x), [0, 1], (n) => (/Oleada/.test(n.title) ? 'y' : undefined)); ok(d.models < 3 || U(q.s, 'woc_ogres').models < 3, 'la oleada no hace Heridas múltiples');
  eq(UNITS.arachnarok.opts.find((x) => x.id === 'sl')?.cost, 35, 'lanzador de seda +35');
});
T('v835-scorpion-msb', RH + ':6205-6208', 'Escorpión de la Tumba: pinzas con Golpe letal y Matamonstruos (el aguijón no)', () => { ok(UNITS.tk_scorpion.sr.includes('monsterSlayer'), 'sin Matamonstruos'); ok(UNITS.tk_scorpion.slots.find((x) => x.n === 'rest').msb, 'las pinzas sin Matamonstruos'); ok(UNITS.tk_scorpion.slots.find((x) => x.opt === 'sting').noKb, 'el aguijón con Golpe letal'); });
T('v835-reslot', 'rules/new/faq_core.txt:805-815 + core.txt (Core p.124)', 'Grupo de mando: solo se recoloca al desplegar, reformar o girar (no en cualquier momento)', () => {
  const s = game([{ type: 'state_troops', models: 10, std: true, mus: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const a = put(U(s, 'state_troops'), 36, 40); a.std = a.mus = true; cur(s);
  ok(!R.apply(s, { t: 'pref', id: a.id, k: 'slotFile', who: 'std', v: 0 }).ok, 'se recoloca sin reformar'); ok(!R.canReslot(s, a), 'canReslot sin reformar');
  const r = R.apply(s, { t: 'move', id: a.id, x: 36, y: 40, face: a.face, files: 4 }); ok(r.ok, 'reforma: ' + r.error); ok(R.apply(s, { t: 'pref', id: a.id, k: 'slotFile', who: 'std', v: 0 }).ok, 'no se puede recolocar tras reformar');
  s.phase = 'deploy'; const b = U(s, 'orc_boyz'); ok(R.canReslot(s, b), 'no se puede al desplegar');
});
T('v835-motley-reslot', 'rules/new/faq_core.txt:805-815', 'Banda variopinta: los modelos solo se recolocan al desplegar o reformar (mgArrange), no con las ranuras', () => {
  const k = Object.keys(UNITS).find((x) => (UNITS[x].sr || []).includes('motley') && UNITS[x].min >= 5 && UNITS[x].faction !== 'merc'); const s = game([{ type: k, models: 10, std: true }], [{ type: 'orc_boyz', models: 10 }], { f: [UNITS[k].faction, 'orcs'], phase: 'move' }); const a = U(s, k); a.std = true; cur(s);
  ok(!R.apply(s, { t: 'pref', id: a.id, k: 'slotFile', who: 'std', v: 0 }).ok, 'la Banda variopinta recoloca su grupo de mando fuera del despliegue/reforma');
});
T('v835-formation-ai', 'core.txt (Core p.183-184 Open Order / Skirmish) — lectura propia', 'IA: valoración de la formación al desplegar (fmScore): unidad de proyectiles → Escaramuza; unidad de combate con filas → Orden abierto', () => {
  const kS = Object.keys(UNITS).find((x) => (UNITS[x].sr || []).includes('openOrder') && (UNITS[x].sr || []).includes('skirmish') && UNITS[x].ranged && UNITS[x].min >= 5);
  const kM = Object.keys(UNITS).find((x) => (UNITS[x].sr || []).includes('openOrder') && (UNITS[x].sr || []).includes('skirmish') && !UNITS[x].ranged && UNITS[x].min >= 5 && UNITS[x].max >= 15);
  ok(kS && kM, `montaje: ${kS} / ${kM}`);
  const sS = game([{ type: kS, models: 10 }], [{ type: 'orc_boyz', models: 20 }], { f: [UNITS[kS].faction, 'orcs'] }); const uS = U(sS, kS); ok(R.fmScore(sS, uS, 'skirm') > R.fmScore(sS, uS, 'open'), `${kS}: no prefiere Escaramuza`);
  const sM = game([{ type: kM, models: 15 }], [{ type: 'orc_boyz', models: 20 }], { f: [UNITS[kM].faction, 'orcs'] }); const uM = U(sM, kM); uM.skirm = true; ok(R.fmScore(sM, uM, 'open') > R.fmScore(sM, uM, 'skirm'), `${kM}: no prefiere Orden abierto`);
});
