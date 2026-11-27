// v839 — Objetos que cambian los hechizos conocidos (generación en createGame, popups/acciones de elección)
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, by } from '../lib3.mjs';
import { FILE } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS, LORES, SPELLS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
function wiz(key, o = {}) {
  const wt = o.type || (/^ct_/.test(key || o.like) ? 'ct_shugengan' : ITEMS[key || o.like].slann ? 'lm_slann' : carrierOf(ITEMS[key || o.like])); const f = F2(wt) === 'orcs' ? 'empire' : 'orcs';
  const s = game([{ type: wt, models: 1, items: key ? [key] : [], ...(o.e || {}) }], [{ type: 'orc_boyz', models: 10 }], { f: [F2(wt), f], phase: 'strategy', cg: { seed: o.seed || 7 } }); return { s, w: U(s, wt, 0), wt };
}
const SK = (u) => R.spellKeys(u);
const lvl = (u) => UNITS[u.type].wizard.level;
TT('ct_fengshi_l', 'conoce un hechizo más de lo normal para su Nivel', () => { for (const sd of [3, 7, 11]) { const a = wiz('ct_fengshi_l', { seed: sd }), c = wiz(null, { like: 'ct_fengshi_l', type: a.wt, seed: sd }); eq(SK(a.w).length, SK(c.w).length + 1, `semilla ${sd}`); eq(SK(c.w).length, lvl(c.w), 'control: tantos como su Nivel'); eq(lvl(a.w), lvl(c.w), 'no sube el Nivel'); } });
TT('wocaj_ogvold', 'en lugar de generar hechizos al azar, conoce los siete hechizos de su Saber (incluido el distintivo)', () => { const a = wiz('wocaj_ogvold'); const L = LORES[a.w.lore]; eq(SK(a.w).length, 1 + L.pool.length, 'distintivo + todo el Saber'); ok(SK(a.w).includes(L.sig) && L.pool.every((k) => SK(a.w).includes(k)), 'incluye todos: ' + SK(a.w)); eq(SK(a.w).length, 7, 'siete hechizos'); });
TT('ct_cloak', 'además de sus hechizos aleatorios, conoce los tres hechizos de la Lore de Yin o de Yang', () => { const a = wiz('ct_cloak'), c = wiz(null, { like: 'ct_cloak', type: a.wt }); const set = ['yin', 'yang'].map((y) => DATA.YY_SPELLS[y]).filter(Boolean); ok(set.some((g) => g.length === 3 && g.every((k) => SK(a.w).includes(k))), 'conoce los tres de una Lore: ' + SK(a.w)); ok(SK(c.w).every((k) => SK(a.w).includes(k)) || SK(a.w).length >= SK(c.w).length + 3, 'conserva los aleatorios'); ok(!set.some((g) => g.every((k) => SK(c.w).includes(k))), 'control: sin la Capa no los conoce'); const y = wiz('ct_cloak', { e: { yy: 'yin' } }); ok(DATA.YY_SPELLS.yin.every((k) => SK(y.w).includes(k)), 'a elección del jugador: Yin'); });
TT('wocaj_tome', 'solo Marca Indivisa: puede descartar los hechizos aleatorios que quiera y elegir hechizos del Saber del Caos (acción tomePick)', () => {
  const a = wiz('wocaj_tome', { e: { mark: 'undivided' } }); ok(a.w.tomeAlt && a.w.tomeAlt.pool.length >= 4, 'se ofrece la elección: ' + JSON.stringify(a.w.tomeAlt)); const sig = LORES[a.w.lore].sig; const rnd = a.w.spells.filter((k) => k !== sig); ok(rnd.length >= 1, 'hay hechizos tirados que descartar');
  a.s.phase = 'deploy'; a.s.ready = [false, false]; cur(a.s); const drop = rnd[0], take = a.w.tomeAlt.pool.find((k) => !a.w.spells.includes(k)); const r = R.apply(a.s, { t: 'tomePick', id: a.w.id, drop, take }); ok(r.ok, 'acción válida: ' + JSON.stringify(r.err || r.error || '')); ok(by(a.s, a.w).spells.includes(take) && !by(a.s, a.w).spells.includes(drop), 'sustituye el tirado por el elegido'); ok(by(a.s, a.w).spells.includes(sig), 'la firma no se toca');
  ok(!R.apply(a.s, { t: 'tomePick', id: a.w.id, drop: sig, take: a.w.tomeAlt.pool[0] }).ok, 'la firma no es un hechizo aleatorio');
  a.s.ready = [true, true]; a.s.phase = 'move'; a.s.turn = 3; ok(!R.apply(a.s, { t: 'tomePick', id: a.w.id, drop: rnd[0], take: a.w.tomeAlt.pool[1] }).ok, 'solo antes de empezar la batalla');
  const b = wiz('wocaj_tome', { e: { mark: 'tzeentch' } }); ok(!b.w.tomeAlt, 'con otra Marca no se ofrece (solo Indivisa)');
});
