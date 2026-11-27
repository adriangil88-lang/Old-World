// v837 — Reglas especiales sin prueba propia (lote D): Odio, Resistencia mágica, personajes que transmiten reglas, Pánico
import { T, N, R, DATA, GEOM, game, U, ok, eq, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, join, blows } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const prof = (rules, foe, o = {}) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: foe, models: UNITS[foe].min > 1 ? 10 : 1 }], { f: ['empire', UNITS[foe].faction === 'empire' ? 'empire' : UNITS[foe].faction] }); const a = U(s, 'empire_captain', 0), b = U(s, foe, 1); engage(s, a, b); if (o.charge) charged(s, a, b, 6); if (o.fought) a.fought = true; cur(s); return { P: R.attackProfile(a, b), a, b, s, mr: R.mrOf(a) }; });
T('rule-hatredHeart', RS('hatredHeart'), 'Odio (Magos y Piel Verde): odio contra magos enemigos y Orcos y Goblins', () => {
  ok(prof(['hatredHeart'], 'orc_boyz').P.hatred, 'contra Orcos'); ok(prof(['hatredHeart'], 'orc_weirdboy').P.hatred, 'contra un Mago enemigo'); ok(!prof(['hatredHeart'], 'state_troops').P.hatred, 'contra otros no'); ok(!prof([], 'orc_boyz').P.hatred, 'sin la regla no hay Odio');
});
T('rule-ancestralGrudge', RS('ancestralGrudge'), 'Rencor ancestral: Odio a los personajes enemigos; lo comparte con los Barbaslargas o Martilladores a los que se une', () => {
  ok(prof(['ancestralGrudge'], 'orc_bigboss').P.hatred, 'Odio contra un personaje enemigo'); ok(!prof(['ancestralGrudge'], 'orc_boyz').P.hatred, 'no contra tropa');
  const s = game([{ type: 'dw_longbeards', models: 5 }, { type: 'dw_thane', models: 1 }], [{ type: 'orc_bigboss', models: 1 }], { f: ['dw', 'orcs'] }); const h = U(s, 'dw_longbeards', 0), c = U(s, 'dw_thane', 0), e = U(s, 'orc_bigboss', 1); join(s, c, h); engage(s, h, e); cur(s); ok(R.attackProfile(h, e).hatred, 'la unidad a la que se une comparte el Odio contra el personaje');
});
T('rule-witchHunt', RS('witchHunt'), '«No permitirás...»: la Bruja tiene Odio a los Magos enemigos y Resistencia mágica (−2)', () => {
  const go = (foe) => { const s = game([{ type: 'emp_witchhunter', models: 1 }], [{ type: foe, models: UNITS[foe].min > 1 ? 10 : 1 }], { f: ['empire', 'orcs'] }); const a = U(s, 'emp_witchhunter', 0), b = U(s, foe, 1); engage(s, a, b); cur(s); return { h: R.attackProfile(a, b).hatred, mr: R.mrOf(a) }; };
  ok(go('orc_weirdboy').h, 'Odio contra Magos'); ok(!go('orc_boyz').h, 'no contra otros'); eq(go('orc_boyz').mr, 2, 'Resistencia mágica (−2)');
});
T('rule-magRes3', RS('magRes3'), 'Resistencia mágica (−3): −3 a las tiradas de lanzamiento de hechizos enemigos que le apuntan', () => {
  eq(prof(['magRes3'], 'orc_boyz').mr, 3, 'modificador 3'); const go = (rules) => withSr('state_troops', rules, () => { const s = game([{ type: 'orc_weirdboy', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'], phase: 'shoot' }); const w = put(U(s, 'orc_weirdboy', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 26, Math.PI / 2); w.spells = ['fireball']; w.casted = []; cur(s); dice(4, 4, 1, 1, 3, 3); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); return !/no logra/.test(msgs(r.events || [])); });
  ok(go([]), 'montaje: 4+4+1 = 9 lanza Bola de fuego (8+)'); ok(!go(['magRes3']), 'con −3: 6 < 8, no se lanza');
});
T('rule-ladyAura', RS('ladyAura'), 'Aura de la Dama: cualquier unidad a la que se una este personaje gana Ataques mágicos', () => {
  const s = game([{ type: 'br_men_at_arms', models: 10 }, { type: 'br_damsel', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'] }); const h = U(s, 'br_men_at_arms', 0), c = U(s, 'br_damsel', 0); cur(s); ok(!R.has(h, 'magical'), 'montaje: sin la Doncella no son mágicos'); join(s, c, h); cur(s); ok(R.has(h, 'magical'), 'unida, la unidad gana Ataques mágicos');
});
T('rule-masterBattle', RS('masterBattle'), 'Maestro de batalla: la unidad de caballeros a la que se une es Inmune a la psicología', () => {
  const s = game([{ type: 'empire_knights', models: 5 }, { type: 'emp_chaptermaster', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const h = U(s, 'empire_knights', 0), c = U(s, 'emp_chaptermaster', 0); cur(s); const before = R.has(h, 'immunePsy'); join(s, c, h); cur(s); ok(!before && R.has(h, 'immunePsy'), 'unida, la unidad de caballeros es Inmune a la psicología');
});
T('rule-courageBeyond', RS('courageBeyond'), 'Coraje sin par: los Guardianes de Talsyn a los que se una son Inmunes a la psicología', () => {
  ok(UNITS.we_warden.sr.includes('courageBeyond'), 'montaje: Guardián con la regla'); const gu = 'we_guardians';
  const s = game([{ type: gu, models: UNITS[gu].min || 5 }, { type: 'we_warden', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'] }); const h = U(s, gu, 0), c = U(s, 'we_warden', 0); cur(s); const b0 = R.has(h, 'immunePsy'); join(s, c, h); cur(s); ok(R.has(h, 'immunePsy') && !b0, 'unida, la unidad es Inmune a la psicología');
});
T('rule-slayerKing', RS('slayerKing'), 'Rey de la Fortaleza Matadora: puede unirse a Martilladores o Matadores; los Martilladores que acompaña ganan Inmune a la psicología e Inquebrantables', () => {
  const s = game([{ type: 'dw_hammerers', models: 5 }, { type: 'dw_ungrim', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['dw', 'orcs'], phase: 'move', active: 0 }); const h = U(s, 'dw_hammerers', 0), c = U(s, 'dw_ungrim', 0); put(h, 36, 30); put(c, 36, 33); cur(s); eq(R.joinCheck(s, c, h), null, 'puede unirse a Martilladores'); join(s, c, h); cur(s); ok(R.has(h, 'immunePsy') && R.has(h, 'unbreakable'), 'Martilladores Inmunes a la psicología e Inquebrantables');
});
T('rule-quellPanic', RS('quellPanic'), 'Reprimir pánico: salvo en huida, las unidades amigas con Levas a 6" pueden repetir un chequeo de Pánico fallido', () => {
  const go = (dist, flee) => withSr('state_troops', ['levies'], () => withSr('cd_ironsworn', ['quellPanic'], () => { const s = game([{ type: 'state_troops', models: 10 }, { type: 'cd_ironsworn', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = put(U(s, 'state_troops', 0), 36, 30), q = put(U(s, 'cd_ironsworn', 0), 36, 30 + dist); q.fleeing = !!flee; cur(s); dice(6, 6, 1, 1); diceAll(6); return R.passPanic(s, u, null); }));
  ok(go(5), 'a 6": repite y pasa'); ok(!go(14), 'a más de 6" no'); ok(!go(5, true), 'si huye no');
});
T('rule-pureHeart', RS('pureHeart'), 'Puro de Corazón: las unidades amigas en su alcance de mando pueden usar su Liderazgo; él y su unidad superan los chequeos de Pánico', () => {
  const go = (rules) => withSr('empire_mage', rules, () => { const s = game([{ type: 'state_troops', models: 10 }, { type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const h = U(s, 'state_troops', 0), c = U(s, 'empire_mage', 0); join(s, c, h); cur(s); dice(6, 6, 6, 6); diceAll(6); return R.passPanic(s, h, null); });
  ok(go(['pureHeart']), 'con el personaje unido la unidad supera el Pánico aunque saque 6+6'); ok(!go([]), 'sin la regla falla');
});
