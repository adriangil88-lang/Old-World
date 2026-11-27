// v838 — Reglas de armas, listas y opciones (lote 10)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked, castThr, caster, strategy } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
T('rule-asrai', RS('asrai'), 'Arco asrai: 32", Perforante (1), fuego de volea', () => {
  const s = game([{ type: 'we_glade_guard', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'shoot' }); const u = U(s, 'we_glade_guard', 0); cur(s); const r = R.rangedOf(u); eq(r.range, 32, 'alcance 32"'); ok(r.ap === 1 || r.ab === 1, 'Perforante (1)'); ok((r.sr || []).includes('volley'), 'fuego de volea');
});
T('rule-ancFury', RS('ancFury'), 'Furia ancestral: en un turno en que carga 3" o más (o sigue un combate), la unidad obtiene +1 a su Fuerza (Clan Real)', () => {
  const run = (list, dist) => { const { s, w, l } = pair('dw_royalwarriors', {}, 'state_troops', {}, { charge: false }); s.lists = [list, 'empire']; charged(s, w, l, dist); cur(s); return prof(s, w, l).S; };
  eq(run('royal', 5), run('royal', 2) + 1, 'carga de 5" frente a 2": +1 F'); eq(run('royal', 5), run('mountain', 5) + 1, 'solo con la lista del Clan Real');
});
T('rule-witchbrew', RS('witchbrew'), 'Brebaje de Bruja: este modelo, su montura y la unidad a la que se una no pueden perder Frenesí', () => {
  const f = (strip) => { const { s, w } = pair('empire_knights', {}, 'orc_boyz', {}); w.frenzyLost = true; cur(s); return R.has(w, 'frenzy'); };
  ok(withSr('empire_knights', ['frenzy', 'witchbrew'], () => f()) === true, 'con la regla conserva el Frenesí tras perderlo'); ok(withSr('empire_knights', 'frenzy', () => f()) === false, 'control: sin la regla lo pierde');
});
T('rule-nobleDisdain', RS('nobleDisdain'), 'Desdén noble: un modelo de Caballería con esta regla no hace Pánico cuando una unidad amiga de Infantería es destruida a 6" o menos', () => {
  const run = (rule) => withSr('empire_knights', rule, () => { const s = game([{ type: 'state_troops', models: 10 }, { type: 'empire_knights', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'combat', active: 1 }); const inf = put(U(s, 'state_troops', 0), 36, 40), kn = put(U(s, 'empire_knights', 0), 36, 46); cur(s); diceAll(6); inf.models = 0; inf.wounds = 0; const ev = []; R.friendsPanicDestroyed(s, inf, ev); return { fl: by(s, kn).fleeing, m: msgs(ev) }; });
  const a = run('nobleDisdain'), b = run([]); ok(b.fl === true, 'control: sin la regla huyen por Pánico'); ok(!a.fl, 'con la regla no hacen el chequeo');
});
