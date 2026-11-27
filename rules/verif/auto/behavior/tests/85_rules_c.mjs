// v837 — Reglas especiales sin prueba propia (lote C): restricciones de unión, psicología, combate
import { T, N, R, DATA, GEOM, game, U, ok, eq, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, join, blows } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const RS = (k) => `app/js/data.js (regla «${k}»)`;
// ---- Restricciones de unión (joinCheck): [regla, quién la lleva, mensaje esperado, cómo se resuelve]
const JOIN = [
  ['largelyInsig', 'host', /Largamente insignificante/, null], ['warpSpawned', 'char', /Engendro de la disformidad/, null], ['treeSpirit', 'char', /Espíritu arbóreo/, null],
  ['pantherOnly', 'char', /Caballeros Pantera/, (c, h) => { h.opts = [...(h.opts || []), 'ord_pan']; }], ['heartOnly', 'host', /Corazón Ardiente/, (c) => { c.opts = [...(c.opts || []), 'ord_heart']; }],
  ['zealot', 'char', /Fanático/, null], ['fanatZeal', 'host', /Celo Fanático/, null]];
for (const [rule, who, re, fix] of JOIN) T(rule === 'warpSpawned' ? 'rule-warpSpawned-join' : 'rule-' + rule, RS(rule), `${rule}: restricción de unión de personajes`, () => {
  const mk = (cRules, hRules) => withSr('empire_captain', cRules, () => withSr('state_troops', hRules, () => { const s = game([{ type: 'empire_captain', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move', active: 0 }); const c = U(s, 'empire_captain', 0), h = U(s, 'state_troops', 0); put(h, 36, 30); put(c, 36, 33); cur(s); return { s, c, h, r: R.joinCheck(s, c, h) }; }));
  const a = mk(who === 'char' ? [rule] : [], who === 'host' ? [rule] : []); ok(a.r && re.test(a.r), 'con la regla solo en ' + (who === 'char' ? 'el personaje' : 'la unidad') + ' no puede unirse: ' + a.r);
  if (fix) { withSr('empire_captain', who === 'char' ? [rule] : [], () => withSr('state_troops', who === 'host' ? [rule] : [], () => { const s = game([{ type: 'empire_captain', models: 1 }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move', active: 0 }); const c = U(s, 'empire_captain', 0), h = U(s, 'state_troops', 0); put(h, 36, 30); put(c, 36, 33); fix(c, h); cur(s); eq(R.joinCheck(s, c, h), null, 'cumpliendo la condición del texto sí puede unirse'); })); }
  else { const b = rule === 'zealot' || rule === 'fanatZeal' ? mk(['zealot'], ['fanatZeal']) : mk([rule], [rule]); eq(b.r, null, 'si ambos tienen la regla (o el par que el texto exige) sí puede unirse'); }
});
T('rule-cleave', RS('cleave'), 'Golpe hendiente: un 6 natural al herir en combate: infantería, caballería y bestias de guerra no pueden hacer salvación por armadura ni de Regeneración', () => {
  const go = (rules) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'state_troops', 1); b.files = 5; engage(s, a, b); cur(s); diceAll(6); const ev = fight(s); const bl = blows(ev, a.name); return { w: bl.reduce((t, x) => t + x.w, 0), h: bl.reduce((t, x) => t + x.h, 0) }; });
  const a = go(['cleave']), n = go([]); ok(a.h > 0 && a.w === a.h, `con 6 naturales al herir no hay salvaciones: ${a.h} impactos → ${a.w} heridas`); ok(n.w < n.h, `sin la regla la armadura salva con 6 (${n.h} impactos → ${n.w} heridas)`);
});
T('rule-ensorcelled', RS('ensorcelled'), 'Armas hechizadas: un arma de mano del modelo tiene Ataques mágicos y Penetración −1', () => {
  const go = (rules) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'orc_boyz', 1); engage(s, a, b); cur(s); return R.attackProfile(a, b); });
  const a = go(['ensorcelled']), n = go([]); eq(a.ap, n.ap + 1, 'Penetración −1 (FP +1)');
  const mg = (rules) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'orc_boyz', 1); engage(s, a, b); cur(s); globalThis.__WSL = []; diceAll(6); fight(s); return globalThis.__WSL.filter((x) => x.def === b || x.def?.type === 'orc_boyz').some((x) => x.o.magical); });
  ok(mg(['ensorcelled']), 'sus impactos son mágicos'); ok(!mg([]), 'sin la regla no lo son');
});
T('rule-slimy', RS('slimy'), 'Zancas viscosas: los enemigos que la ataquen en combate sufren −1 para impactar', () => {
  const go = (rules) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'orc_boyz', 1); engage(s, a, b); cur(s); diceAll(4); const ev = fight(s); return blows(ev, b.name).reduce((t, x) => t + x.h, 0); });
  ok(go([]) > 0, 'montaje: sin la regla los Orcos impactan con 4+'); eq(go(['slimy']), 0, 'con Zancas viscosas necesitan 5+: un 4 ya no impacta');
});
T('rule-eternalHatred', RS('eternalHatred'), 'Odio eterno: contra Altos Elfos su Odio se aplica en todas las rondas de combate, no solo en la primera', () => {
  const go = (fought, foeType) => { const s = game([{ type: 'de_dreadlord', models: 1 }], [{ type: foeType, models: 10 }], { f: ['de', foeType.startsWith('he_') ? 'he' : 'empire'] }); const a = U(s, 'de_dreadlord', 0), b = U(s, foeType, 1); engage(s, a, b); a.fought = fought; cur(s); return R.attackProfile(a, b).hatred; };
  const he = Object.keys(UNITS).find((k) => k.startsWith('he_') && UNITS[k].cat === 'inf' && !UNITS[k].wizard) || 'he_spearmen';
  ok(go(false, he), 'primera ronda: Odio contra Altos Elfos'); ok(go(true, he), 'rondas posteriores: sigue habiendo Odio contra Altos Elfos'); ok(!go(true, 'state_troops'), 'contra otros enemigos el Odio solo vale en la primera ronda');
});
T('rule-guardians', RS('guardians'), 'Guardianes del Bosque: en contacto con un enemigo que cause Miedo o Terror, +1 Ataque y Heridas múltiples (2)', () => {
  const go = (rules, foe) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: foe, models: foe === 'steam_tank' ? 1 : 10 }], { f: ['empire', foe === 'steam_tank' ? 'empire' : 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, foe, 1); engage(s, a, b); cur(s); const P = R.attackProfile(a, b); return { atk: P.atk, mw: P.mw }; });
  const base = go([], 'steam_tank'), g = go(['guardians'], 'steam_tank'); eq(g.atk, base.atk + 1, '+1 Ataque contra el que causa Terror'); eq(g.mw, 2, 'Heridas múltiples (2)'); eq(go(['guardians'], 'orc_boyz').atk, go([], 'orc_boyz').atk, 'contra un enemigo que no causa Miedo/Terror, nada');
});
T('rule-valour', RS('valour'), 'Valor de los Eones: los chequeos de Pánico fallados de la unidad pueden repetirse (una vez)', () => {
  const go = (rules) => withSr('state_troops', rules, () => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = U(s, 'state_troops', 0); cur(s); dice(6, 6, 1, 1); diceAll(6); return R.passPanic(s, u, null); });
  ok(go(['valour']), 'con la regla repite el 6+6 fallido y pasa'); ok(!go([]), 'sin la regla no');
});
T('rule-venerable', RS('venerable'), 'Venerables: salvo que huyan, las unidades amigas a 6" repiten los chequeos de Pánico fallados', () => {
  const go = (rules, dist, flee) => withSr('dw_longbeards', rules, () => { const s = game([{ type: 'state_troops', models: 10 }, { type: 'dw_longbeards', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = put(U(s, 'state_troops', 0), 36, 30), v = put(U(s, 'dw_longbeards', 0), 36, 30 + dist); v.fleeing = !!flee; cur(s); dice(6, 6, 1, 1); diceAll(6); return R.passPanic(s, u, null); });
  const near = go([], 5, false), far = go([], 14, false), fl = go([], 5, true); ok(near, 'veterano a 6": repite y pasa'); ok(!far, 'a más de 6" no'); ok(!fl, 'si huye no');
});
T('rule-nonCombatant', RS('nonCombatant'), 'No combatiente: no puede cargar, perseguir, arrollar ni seguir', () => {
  const s = game([{ type: 'bm_cart', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['bm', 'empire'], phase: 'move', active: 0 }); const a = put(U(s, 'bm_cart', 0), 36, 34), t = put(U(s, 'state_troops', 1), 36, 30, Math.PI / 2); cur(s); eq(R.chargeTargets(s, a).length, 0, 'no puede declarar cargas'); ok(R.restrains(s, a, []), 'no persigue (se contiene siempre)');
});
T('rule-noPursue', RS('noPursue'), 'No persigue: no puede perseguir ni hacer movimientos de arrollamiento ni de seguimiento', () => {
  const s = game([{ type: 'bm_wtroll', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'] }); const a = U(s, 'bm_wtroll', 0); cur(s); ok(R.restrains(s, a, []), 'se contiene siempre');
});
