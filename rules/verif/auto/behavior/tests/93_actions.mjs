// v838 — Reglas con acción propia (fase de Mando / Disparo): se ejecutan con R.apply y dados fijados
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, join, U, put, cur, msgs, by, all, D, F, FOE } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const ap = (s, a) => { cur(s); return R.apply(s, a); };
const M = (r) => msgs(r.events || []);
const strat = (A, B, f, o = {}) => { const s = game(A, B, { f, phase: 'strategy', active: 0, ...o }); return s; };

T('rule-nehek', RS('nehek'), 'Invocación de Nehek: en Mando, sin estar trabado, chequeo de Ld; si lo pasa una unidad No muerta a 12" recupera Heridas según su tipo y el nivel (infantería: nivel+D3; resto: según tipo)', () => {
  const run = (target, d, wounded = true, ld = [1, 2]) => { const s = strat([{ type: 'vc_necromancer', models: 1 }, { type: target, models: 10 }], [{ type: 'state_troops', models: 10 }], ['vc', 'empire']); const c = U(s, 'vc_necromancer', 0), t = U(s, target, 0); put(c, 36, 40); put(t, 36, 36); if (wounded) { t.models -= 8; t.wounds -= 8 * D(t).W; } const w0 = t.wounds; dice(...ld, ...d); const r = ap(s, { t: 'nehek', id: c.id, target: t.id }); return { r, t, w0, s }; };
  const lvl = D(U(strat([{ type: 'vc_necromancer', models: 1 }], [{ type: 'state_troops', models: 10 }], ['vc', 'empire']), 'vc_necromancer', 0)).wizard.level;
  for (const k of [1, 3]) { const x = run('vc_skeletons', [k]); ok(new RegExp(`recupera ${lvl + k} Heridas`).test(M(x.r)), `infantería: nivel (${lvl}) + D3 (${k}): ` + M(x.r)); }
  const f = run('vc_skeletons', [2], true, [6, 5]); ok(/falla la Invocación/.test(M(f.r)) && by(f.s, f.t).wounds === f.w0, 'si falla el chequeo de Liderazgo no cura');
  const tr = strat([{ type: 'vc_necromancer', models: 1 }, { type: 'vc_skeletons', models: 10 }], [{ type: 'state_troops', models: 10 }], ['vc', 'empire']); const c2 = U(tr, 'vc_necromancer', 0), t2 = U(tr, 'vc_skeletons', 0); put(c2, 36, 40); put(t2, 36, 14); ok(!ap(tr, { t: 'nehek', id: c2.id, target: t2.id }).ok, 'a más de 12" no se puede');
});
T('rule-khaineBless', RS('khaineBless'), 'Bendiciones de Khaine: hechizo vinculado NP2 (VL 9+), lanzable trabado; él y las Brujas/Hermanas de su alcance de mando ganan salvación especial 5+ hasta tu siguiente turno', () => {
  const mk = (d) => { const s = strat([{ type: 'de_deathhag_cauldron', models: 1 }, { type: 'de_witchelves', models: 10 }], [{ type: 'state_troops', models: 10 }], ['de', 'empire']); const c = U(s, 'de_deathhag_cauldron', 0), w = U(s, 'de_witchelves', 0); put(c, 36, 40); put(w, 36, 36); dice(...d); return { s, c, w }; };
  let x = mk([3, 3, 1, 1]); let r = ap(x.s, { t: 'khaine', id: x.c.id, v: 'ward' }); ok(/no logra/.test(M(r)), '3+3+2 = 8 < 9: no se lanza: ' + M(r)); x = mk([4, 3, 1, 1]); r = ap(x.s, { t: 'khaine', id: x.c.id, v: 'ward' }); ok(/Escudo de Sangre de Khaine/.test(M(r)), '4+3+2 = 9: se lanza: ' + M(r));
  const w1 = by(r.state || x.s, x.w), ws = (w1.fx || r.state?.units?.find?.((q) => q.id === x.w.id)?.fx || x.w.fx || []); ok((x.w.fx || []).some((f) => f.k === 'khaineW') || (all(r.state || x.s).find((q) => q.id === x.w.id).fx || []).some((f) => f.k === 'khaineW'), 'las Brujas reciben la bendición'); void ws;
});
T('rule-goadBeast', RS('goadBeast'), 'Aguijonear a la bestia: en Mando, un monstruo amigo en el rango de Mando gana +D3 Ataques (máx. 10) hasta el final del turno', () => {
  const s = strat([{ type: 'de_beastmaster', models: 1 }, { type: 'de_hydra', models: 1 }], [{ type: 'state_troops', models: 10 }], ['de', 'empire']); const c = U(s, 'de_beastmaster', 0), h = U(s, 'de_hydra', 0); put(c, 36, 40); put(h, 36, 36); const A0 = R.attackProfile(h, U(s, 'state_troops', 1)).A ?? null; dice(2); const r = ap(s, { t: 'goad', id: c.id, target: h.id }); ok(/\+2 Ataques/.test(M(r)), M(r));
  const h1 = all(r.state || s).find((q) => q.id === h.id); ok((h1.fx || []).some((f) => f.k === 'goadA' && f.v === 2 && f.endTurn), 'efecto +D3 hasta fin de turno'); ok(!ap(s, { t: 'goad', id: c.id, target: h.id }).ok, 'una vez por turno'); void A0;
});
T('rule-wailing', RS('wailing'), 'Lamento: en Disparo (si no marchó) un enemigo a 8" hace Ld −2; si falla sufre tantas heridas como la diferencia, sin armadura ni Regeneración', () => {
  const mk = () => { const s = game([{ type: 'vc_banshee', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'], phase: 'shoot' }); const b = U(s, 'vc_banshee', 0), t = U(s, 'state_troops', 1); put(b, 36, 30); put(t, 36, 24, Math.PI / 2); return { s, b, t }; };
  const x = mk(), ld = R.ldOf(x.s, x.t) - 2; const need = ld + 2; dice(Math.ceil(need / 2), Math.floor(need / 2)); let r = ap(x.s, { t: 'dirge', id: x.b.id, target: x.t.id }); ok(/falla por 2 → 2 bajas/.test(M(r)), `Ld−2=${ld}, tirada ${need}: falla por 2: ` + M(r));
  const y = mk(); dice(1, 2); r = ap(y.s, { t: 'dirge', id: y.b.id, target: y.t.id }); ok(/supera el chequeo/.test(M(r)), 'tirada baja: supera'); const z = mk(); z.b.marched = true; ok(!ap(z.s, { t: 'dirge', id: z.b.id, target: z.t.id }).ok, 'no si marchó'); const w = mk(); put(w.t, 36, 10, Math.PI / 2); ok(!ap(w.s, { t: 'dirge', id: w.b.id, target: w.t.id }).ok, 'a más de 8" no');
});
T('rule-lumberDest', RS('lumberDest'), 'Destrucción desmedida: antes de mover tira un D6 y lo suma a su Movimiento; con un 1 natural se detiene y no mueve más este turno; no puede marchar', () => {
  const mk = () => { const s = game([{ type: 'cd_ironDaemon', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['cd', 'empire'], phase: 'move' }); const u = U(s, 'cd_ironDaemon', 0); put(u, 36, 40); return { s, u }; };
  const a = mk(); dice(4); let r = ap(a.s, { t: 'lumber', id: a.u.id }); ok(/\+?4/.test(M(r)) && !/se detiene/.test(M(r)), 'con 4 suma 4: ' + M(r)); ok((all(a.s).find((q) => q.id === a.u.id).lumberK != null), 'tirada registrada');
  const b = mk(); dice(1); r = ap(b.s, { t: 'lumber', id: b.u.id }); ok(/se detiene|1 natural/i.test(M(r)) || (r.state?.units?.find((q) => q.id === b.u.id) || b.u).moved, 'con 1 natural se detiene: ' + M(r)); ok(R.has(a.u, 'noMarch') || DATA.UNITS.cd_ironDaemon.sr.includes('noMarch'), 'no puede marchar');
});
T('rule-primRoar', RS('primRoar'), 'Rugido primigenio: una vez por partida, en Mando, chequeo de Ld; si lo pasa, los Hombres Lagarto a 7" ganan Carga Furiosa este turno', () => {
  const mk = (d) => { const s = strat([{ type: 'lm_troglodon', models: 1 }, { type: 'lm_saurus', models: 10 }, { type: 'lm_saurus', models: 10 }], [{ type: 'state_troops', models: 10 }], ['lm', 'empire']); const [n, f] = s.units.filter((x) => x.type === 'lm_saurus'); const t = U(s, 'lm_troglodon', 0); put(t, 36, 40); put(n, 36, 36); put(f, 10, 8); dice(...d); return { s, t, n, f }; };
  const a = mk([1, 2]); const r = ap(a.s, { t: 'roar', id: a.t.id }); ok(/superado/.test(M(r)), M(r)); const st = r.state || a.s; const near = all(st).find((q) => q.id === a.n.id), far = all(st).find((q) => q.id === a.f.id); ok((near.fx || []).some((f) => f.k === 'primR') && !(far.fx || []).some((f) => f.k === 'primR'), 'solo a 7"'); ok(!ap(a.s, { t: 'roar', id: a.t.id }).ok, 'una vez por partida');
  const b = mk([6, 5]); ok(/fallido/.test(M(ap(b.s, { t: 'roar', id: b.t.id }))), 'si falla el Ld, nada');
});
T('rule-incorpCoach', RS('incorpCoach'), 'Carruaje espectral: en Mando puede volverse Incorpóreo hasta tu siguiente inicio de turno (Etéreo y Vuelo 10)', () => {
  const s = strat([{ type: 'vc_blackcoach', models: 1 }], [{ type: 'state_troops', models: 10 }], ['vc', 'empire']); const c = U(s, 'vc_blackcoach', 0); put(c, 36, 40); const r = ap(s, { t: 'incorp', id: c.id }); ok(/Incorpóreo: Etéreo y Vuelo \(10\)/.test(M(r)), M(r)); const c1 = all(s).find((q) => q.id === c.id); ok((c1.fx || []).some((f) => f.k === 'incorp'), 'efecto incorp'); cur(s); ok(R.has(c1, 'ethereal'), 'Etéreo mientras es incorpóreo'); ok(R.has(c1, 'flyer') || R.has(c1, 'fly'), 'Vuelo');
});
