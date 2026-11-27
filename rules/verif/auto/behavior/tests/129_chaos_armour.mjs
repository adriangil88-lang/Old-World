// v838 — Armadura del Caos (X+): el parámetro X es de cada unidad (rh.txt / aj_chaos2.txt); se comprueba la salvación especial real de cada una
import { T, N, R, DATA, game, ok, eq, cur, put, U, diceAll, castThr, caster } from '../lib3.mjs';
const { UNITS } = DATA;
const TAB = [['woc_lord', 5, 'rh.txt:2286 (Señor del Caos)'], ['woc_lord_steed', 5, 'rh.txt:2286 (Señor del Caos a caballo)'], ['woc_exalted', 5, 'rh.txt:2286 (Campeón Exaltado)'], ['woc_aspiring', 5, 'rh.txt:2286 (Campeón Aspirante)'],
  ['woc_dprince', 4, 'rh.txt:2334 (Príncipe Daemon)'], ['woc_sorc_lord', 5, 'rh.txt:2383 (Señor Hechicero)'], ['woc_ex_sorc', 5, 'rh.txt:2383 (Hechicero Exaltado)'], ['woc_chosen', 6, 'rh.txt:2527 (Elegidos)'],
  ['woc_forsaken', 5, 'rh.txt:2610 (Réprobos)'], ['woc_chosen_knights', 6, 'rh.txt:2873 (Caballeros Elegidos)'], ['woc_frydaal', 5, 'aj_chaos2.txt:1046 (Frydaal)'], ['woc_chieftain', 6, 'aj_chaos2.txt:1205 (Cabecilla)']];
for (const [id, x, src] of TAB) {
  if (!UNITS[id]) { N('rule-chaosArmour-' + id, 'unidad no presente en el catálogo', src); continue; }
  T('rule-chaosArmour-' + id, src, `Armadura del Caos (${x}+): ${UNITS[id].name} tiene salvación especial ${x}+ contra cualquier herida`, () => {
    const thr = (ctx) => { for (let v = 2; v <= 6; v++) { const s = game([{ type: id, models: UNITS[id].min > 1 ? UNITS[id].min : 1 }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'] }); const u = U(s, id, 0); cur(s); diceAll(v); if (R.woundAndSave(s, u, 1, 10, 10, { noArmour: true, noRegen: true, auto: true, ...ctx }).through === 0) return v; } return 7; };
    eq(thr({}), x, 'contra un ataque normal'); eq(thr({ magical: true }), x, 'también contra uno mágico (es contra cualquier herida)');
  });
}
T('rule-chaosArmour', 'rh.txt:3494 (Chaos Armour (X+))', 'Armadura del Caos: un Mago con esta regla puede llevar armadura sin penalizador (un Mago sin la regla no puede lanzar con armadura)', () => {
  const chk = (type, items) => { const { s, w, t } = caster(type, 'state_troops', { wX: { items } }); return R.castCheck(s, w, 'fireball', t) || ''; };
  ok(!/armadura/.test(chk('woc_sorc_lord', ['silvered'])), 'el Señor Hechicero con armadura puede lanzar: ' + chk('woc_sorc_lord', ['silvered']));
  ok(!/armadura/.test(chk('woc_ex_sorc', ['silvered'])), 'el Hechicero Exaltado también');
  ok(/armadura/.test(chk('empire_mage', ['silvered'])), 'control: un Mago sin la regla con armadura no puede lanzar');
});
