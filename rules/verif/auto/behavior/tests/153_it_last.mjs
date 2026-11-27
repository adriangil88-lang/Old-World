// v839 — Objetos que cambian la pérdida de la última Herida y las salvaciones del portador
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, by, join } from '../lib3.mjs';
import { FILE, thr } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
function lone(key, o = {}) { const ct = o.type || carrierOf(ITEMS[key]); const s = game([{ type: ct, models: 1, items: key ? [key] : [] }, ...(o.mine || [])], [{ type: 'orc_boyz', models: 10 }], { f: [F2(ct), F2(ct) === 'orcs' ? 'empire' : 'orcs'], phase: 'combat', active: 1 }); const c = put(U(s, ct, 0), 36, 40); put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2); (o.setup || (() => {}))(s, c); cur(s); return { s, c }; }
for (const [k, N0] of [['vcl_ring', 2], ['brsaj_grail', 2]]) TT(k, 'un solo uso: al perder su última Herida tira D6; con 2+ no la pierde', () => {
  const a = lone(k, { type: k === 'vcl_ring' ? 'vc_count' : undefined }); a.c.wounds = 1; dice(1); R.applyWounds(a.c, 1); eq(by(a.s, a.c).models <= 0 || by(a.s, a.c).wounds <= 0, true, 'con 1 muere (D6 = 1 < 2)');
  const b = lone(k, { type: k === 'vcl_ring' ? 'vc_count' : undefined }); b.c.wounds = 1; dice(2); R.applyWounds(b.c, 1); ok(b.c.wounds === 1 && b.c.models > 0, 'con 2+ conserva la última Herida'); ok(b.c.used['ls_' + N0], 'gastado'); dice(6); R.applyWounds(b.c, 1); ok(b.c.wounds <= 0 || b.c.models <= 0, 'segunda vez: ya no protege');
  const c = lone(null, { type: k === 'vcl_ring' ? 'vc_count' : carrierOf(ITEMS[k]), like: k }); c.c.wounds = 1; dice(6); R.applyWounds(c.c, 1); ok(c.c.wounds <= 0 || c.c.models <= 0, 'control sin objeto');
});
TT('collar_shapesh', 'un solo uso: al perder su última Herida, con 4+ no la pierde y en su lugar muere un modelo amigo en su alcance de mando', () => {
  const mk = () => lone('collar_shapesh', { type: 'tk_king', mine: [{ type: 'tk_warriors', models: 20 }], setup: (s, c) => { put(s.units.find((x) => x.type === 'tk_warriors'), 36, 46); c.wounds = 1; } });
  const a = mk(), w = a.s.units.find((x) => x.type === 'tk_warriors'), m0 = w.models; dice(4); R.applyWounds(a.c, 1); ok(a.c.wounds === 1 && a.c.models > 0, 'con 4+ conserva la Herida'); eq(by(a.s, w).models, m0 - 1, 'muere un modelo amigo');
  const b = mk(); dice(3); R.applyWounds(b.c, 1); ok(by(b.s, b.c).models <= 0 || by(b.s, b.c).wounds <= 0, 'con 3 muere');
  const c = lone('collar_shapesh', { type: 'tk_king', setup: (s, x) => { x.wounds = 1; } }); dice(6); R.applyWounds(c.c, 1); ok(by(c.s, c.c).models <= 0 || by(c.s, c.c).wounds <= 0, 'sin modelo amigo en su alcance no puede usarse'); ok(c.c.items.includes('collar_shapesh') || by(c.s, c.c).models <= 0, 'y no se gasta');
});
TT('tat_dishonoured', 'solo Matademonios y Matadragones: con su última Herida gana salvación especial 3+', () => { const k = 'tat_dishonoured'; const a = lone(k, { type: 'dw_drslayer', setup: (s, c) => { c.wounds = 1; } }); eq(R.wardOf(a.c), 3, 'con 1 Herida: 3+'); const b = lone(k, { type: 'dw_drslayer', setup: (s, c) => { c.wounds = UNITS.dw_drslayer.W; } }); ok(R.wardOf(b.c) !== 3 || R.wardOf(b.c) === (UNITS.dw_drslayer.ward || 0), 'con todas sus Heridas no'); });
TT('vcl_drakenhof', 'mejora en 1 la regeneración de la unidad', () => { const t = (k) => thr('regen', k, { stdType: 'we_treeman_x' }); const mk = (withIt) => { const s = game([{ type: 'orc_boyz', models: 5 }], [{ type: 'trolls', models: 3, std: true }], { f: ['orcs', 'orcs'], phase: 'combat' }); const d = U(s, 'trolls', 1); if (withIt) d.banner = 'vcl_drakenhof'; cur(s); let best = 7; for (let v = 2; v <= 6; v++) { diceAll(v); const r = R.woundAndSave(s, d, 1, 10, 0, { auto: true, noArmour: true, noWard: true }); if (r.through === 0) { best = v; break; } } return best; }; const a = mk(true), c = mk(false); eq(c - a, 1, `regeneración ${c}+ → ${a}+`); });
