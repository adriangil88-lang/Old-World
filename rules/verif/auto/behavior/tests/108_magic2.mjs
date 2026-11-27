// v838 — Reglas de magia, mando y Liderazgo (lote 9)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, castThr, caster, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const near = (x, type, dx = 4, dy = 0) => { const u = by(x.s, U(x.s, type)) || U(x.s, type); return put(u, x.w.x + dx, x.w.y + dy); };
T('rule-covenant', RS('covenant'), 'Pacto de poder: los Sacerdotes funerarios amigos a 12" suman +1 a sus tiradas de lanzamiento', () => {
  const thr = (withC) => castThr(() => { const x = caster('tk_hpriest', 'state_troops', { extra: withC ? [{ type: 'tk_casket', models: 1 }] : [] }); if (withC) put(U(x.s, 'tk_casket', 0), 36, 46); cur(x.s); return x; });
  eq(thr(true), thr(false) - 1, 'umbral de lanzamiento −1 con el Cofre a 12"');
});
T('rule-witchBane', RS('witchBane'), 'Perdición de brujos: todos los Magos en su alcance de mando sufren −2 a lanzar', () => {
  const thr = (withL) => castThr(() => { const x = caster('empire_mage', 'state_troops', { foe: withL ? [{ type: 'emp_lector_altar', models: 1 }] : [] }); if (withL) put(U(x.s, 'emp_lector_altar', 1), 36, 45); cur(x.s); return x; });
  eq(thr(true), thr(false) + 2, 'umbral +2 con el Lector de Sigmar enemigo cerca');
  const fr = castThr(() => { const x = caster('empire_mage', 'state_troops', { extra: [{ type: 'emp_lector_altar', models: 1 }] }); put(U(x.s, 'emp_lector_altar', 0), 36, 45); cur(x.s); return x; }); eq(fr, thr(false) + 2, 'también afecta a los magos amigos (friend or foe, fof.txt:2727)');
});
T('rule-obsSent', RS('obsSent'), 'Centinela de obsidiana: los magos enemigos a 12" deben superar Liderazgo: si lo fallan −3 a la tirada de lanzamiento; si lo superan −1', () => {
  const thr = (withS, rest) => castThr(() => { const x = caster('empire_mage', 'state_troops', { foe: withS ? [{ type: 'ct_sentinel_obsidian', models: 1 }] : [] }); if (withS) put(U(x.s, 'ct_sentinel_obsidian', 1), 36, 46); cur(x.s); return x; }, 'fireball', rest);
  const base = thr(false, [1, 1, 3, 3, 3]); eq(thr(true, [1, 1, 3, 3, 3]), base + 1, 'Liderazgo superado: −1'); eq(thr(true, [6, 5, 3, 3, 3]), base + 3, 'Liderazgo fallado: −3');
});
T('rule-engineGods', RS('engineGods'), 'Motor de los Dioses: con 2+ Motores en el ejército, los magos amigos a 6" o menos suman +1 al lanzar', () => {
  const thr = (rules) => castThr(() => { const x = caster('empire_mage', 'state_troops', { extra: [{ type: 'state_troops', models: 5 }] }); put(U(x.s, 'state_troops', 0), 60, 60); cur(x.s); return x; });
  const one = withSr('empire_mage', 'engineGods', () => thr()), two = withSr('empire_mage', 'engineGods', () => withSr('state_troops', 'engineGods', () => thr())), none = thr(); eq(one, none, 'con un solo Motor no hay bonificación'); eq(two, none - 1, 'con dos Motores (el mago a menos de 6" de uno): +1');
});
T('rule-symbolMight', RS('symbolMight'), 'Símbolo de poder: el alcance de mando del Lector de Sigmar sobre el Altar de Guerra pasa de 8" a 12" (18" si es el General)', () => {
  const s = game([{ type: 'empire_general', models: 1 }, { type: 'emp_lector_altar', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' }); const c = U(s, 'emp_lector_altar', 0); cur(s); eq(R.commandRange(c), 18, 'como General (grande): 18"'); c.scnNoGen = true; const a = R.commandRange(c); eq(a, 12, 'sin ser el General: 12"'); ok(a > D(c).Ld, `el alcance (${a}") supera el que le daría su Liderazgo (${D(c).Ld}")`);
});
T('rule-cmdCaptain', RS('cmdCaptain'), 'Comandante y Capitán: Marauders, Jinetes, Huscarls y Berserkers amigos en su alcance de mando ganan +1 Liderazgo (máx. 10)', () => {
  const ld = (near, type) => { const s = game([{ type: 'woc_frydaal', models: 1 }, { type, models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['chaos', 'orcs'], phase: 'strategy' }); put(U(s, 'woc_frydaal', 0), 36, 40); put(U(s, type, 0), 36, near ? 46 : 70); cur(s); return R.ldOf(s, U(s, type, 0)); };
  eq(ld(true, 'woc_marauders'), ld(false, 'woc_marauders') + 1, '+1 Ld a los Marauders en su alcance de mando'); ok(ld(true, 'woc_warriors') === ld(false, 'woc_warriors'), 'control: otras unidades no');
});
T('rule-trollCalla', RS('trollCalla'), 'Llamador de Trolls: las unidades de Trolls amigas en su alcance de mando pueden usar su Liderazgo', () => {
  const ld = (near) => { const s = game([{ type: 'orc_ogdruz', models: 1 }, { type: 'trolls', models: 5 }], [{ type: 'empire_general', models: 1 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy' }); put(U(s, 'orc_ogdruz', 0), 36, 40); put(U(s, 'trolls', 0), 36, near ? 46 : 70); cur(s); return R.ldOf(s, U(s, 'trolls', 0)); };
  ok(ld(true) > ld(false), `Ld de los Trolls sube cerca del Llamador (${ld(false)} → ${ld(true)})`);
});
T('rule-holyFervour', RS('holyFervour'), 'Fervor sagrado: las unidades amigas a 6" superan los chequeos de Miedo y repiten el Pánico fallado', () => {
  const f = (near) => { const s = game([{ type: 'emp_lector_altar', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' }); put(U(s, 'emp_lector_altar', 0), 36, 40); put(U(s, 'state_troops', 0), 36, near ? 44 : 70); cur(s); return R.fervour(U(s, 'state_troops', 0)); };
  ok(f(true) === true && f(false) === false, 'actúa solo a 6" del Lector');
});
T('rule-untutored', RS('untutored'), 'Arcanista sin formación: en un Desastre mágico tira un dado más y descarta el mayor', () => {
  const run = (strip, d) => { const f = () => { const s = game([{ type: 'br_outcast', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bretonnia', 'orcs'], phase: 'shoot' }); const u = put(U(s, 'br_outcast', 0), 36, 40); cur(s); dice(d); diceAll(1); const ev = []; const r = R.miscast(s, u, ev); return { r, m: msgs(ev), q: (globalThis.__DQ || []).length }; }; return strip ? withoutSr('br_outcast', 'untutored', f) : f(); };
  const a = run(false, [6, 6, 1]), b = run(true, [6, 6, 1]); ok(a.q === 0 && b.q === 1, 'tira tres dados frente a dos'); ok(b.r >= 1 && !a.r, 'con 6+1 (7) sufre un retroceso; sin la regla 6+6 (12) es una invocación perfecta: ' + a.r + '/' + b.r);
});
T('rule-sorcCurse', RS('sorcCurse'), 'Maldición del Hechicero: si sufre una disfunción mágica hace un chequeo de Resistencia: si falla pierde 1 Herida y gana +1 R en lugar de tirar en la tabla; si lo supera tira normalmente', () => {
  const run = (d) => { const s = game([{ type: 'cd_daemonsmith', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['cd', 'orcs'], phase: 'shoot' }); const u = put(U(s, 'cd_daemonsmith', 0), 36, 40); cur(s); dice(d); diceAll(1); const ev = []; R.miscast(s, u, ev); return { u, m: msgs(ev), q: (globalThis.__DQ || []).length }; };
  const a = run([6]); ok(/Maldición del Hechicero/.test(a.m) && a.u.wounds === D(a.u).W - 1 && a.u.curseT === 1, 'si falla Resistencia pierde 1 Herida y gana +1 R: ' + a.m.slice(0, 120)); ok(!/Maldición del Hechicero/.test(run([1, 6, 6]).m), 'si lo supera tira en la tabla');
});
T('rule-soulEater', RS('soulEater'), 'Devoraalmas: un mago enemigo a 12" debe superar Liderazgo antes de lanzar; si falla y además falla el lanzamiento, sufre un Desastre', () => {
  const run = (near, d) => { const x = caster('empire_mage', 'state_troops', { foe: [{ type: 'bm_cygor', models: 1 }] }); put(U(x.s, 'bm_cygor', 1), 36, near ? 46 : 70); cur(x.s); dice(d); diceAll(1); return R.apply(x.s, { t: 'cast', id: x.w.id, spell: 'fireball', target: x.t.id }); };
  ok(/pierde los nervios ante el Cygor/.test(msgs(run(true, [1, 2, 6, 5, 3, 3]).events || [])), 'a 12" y con el Liderazgo fallado pierde los nervios'); ok(!/Cygor/.test(msgs(run(false, [1, 2, 6, 5, 3, 3]).events || [])), 'fuera de 12" no');
});
