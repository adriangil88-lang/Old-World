// v839 — Objetos y estandartes de chequeos psicológicos y de ruptura (R.rollPsy / R.passPanic / resolveCombats del motor)
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, join, engage, charged, fight, by } from '../lib3.mjs';
import { FILE, muted } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const STD = { empire: 'state_troops', orcs: 'orc_boyz', wood: 'we_glade_guard', bm: 'bm_gor', bret: 'br_men_at_arms', he: 'he_spearmen', dw: 'dw_warriors', de: 'de_warriors', lm: 'lm_saurus', vc: 'vc_skeletons', ok: 'ok_gnoblars', ct: 'ct_jade', tk: 'tk_warriors' };
const FF = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
// unidad estándar u (jugador 0) con el objeto: estandarte en la unidad, o personaje unido
function psy(key, o = {}) {
  const it = ITEMS[key], std = it.cat === 's' || it.bn, fac = it.fac || 'empire', ut = o.ut || STD[fac], ct = std ? null : carrierOf(it), foe = fac === 'orcs' ? 'state_troops' : 'orc_boyz';
  const s = game([{ type: ut, models: 10, std: true }, ...(ct ? [{ type: ct, models: 1, items: o.no ? [] : [key] }] : [])], [{ type: foe, models: 10, std: true }], { f: [FF(ut), FF(foe)], phase: o.phase || 'move' });
  const u = U(s, ut, 0), e = U(s, foe, 1); if (std && !o.no) u.banner = key; put(u, 36, 20); put(e, 36, 50, Math.PI / 2);
  if (ct) { const c = U(s, ct, 0); join(s, c, u); R.syncJoined(s); }
  cur(s); return { s, u, e };
}
const ok2 = (r, a, b) => r[0] === a && r[1] === b;
// Miedo/Pánico/Reagrupar/Terror: repiten los chequeos fallados (tirada 11 contra Ld < 11)
// Reagrupar: la unidad (en huida) hace el chequeo con la cola q; devuelve si se reagrupa
function rally(k, expect, ctl) { const a = psy(k, { no: !!ctl }); a.u.fleeing = true; dice(6, 5, 1, 2); const r = R.rallyTest(a.s, a.u, 0, []); eq(r, !ctl, ctl ? 'control sin objeto: 6+5 falla' : 'Reagrupar fallado y repetido con éxito'); }
for (const k of ['ct_goldenlion', 'okl_lion']) TT(k, 'el portador y su unidad repiten los chequeos fallados de Miedo, Pánico, Reagrupar y Terror', () => {
  if (k === 'okl_lion') { const a = psy(k); dice(6, 5, 1, 2); const r = R.rollPsy(a.s, a.u); ok(ok2(r, 1, 2), `fallo (6+5) → repite: ${r}`); const b = psy(k); dice(1, 2, 6, 6); ok(ok2(R.rollPsy(b.s, b.u), 1, 2), 'si pasa a la primera no repite'); const c = psy(k, { no: true }); dice(6, 5, 1, 2); ok(ok2(R.rollPsy(c.s, c.u), 6, 5), 'control sin objeto: no repite'); }
  rally(k, true); rally(k, false, true);
  const d = psy(k); diceAll(6); ok(R.passPanic(d.s, d.u) === false, 'con dobles 6 el Pánico se falla aunque repita (6 natural)');
  const e = psy(k); dice(6, 5, 1, 2); ok(R.passPanic(e.s, e.u) === true, 'Pánico: falla y repite con éxito');
});
TT('vcl_screaming', 'los enemigos tiran un D6 extra y descartan el más bajo en los chequeos de Miedo causados por esta unidad', () => { const a = psy('vcl_screaming'); dice(1, 2, 6); const r = R.rollPsy(a.s, a.e, a.u); ok(ok2(r, 2, 6), `con el estandarte: ${r}`); const c = psy('vcl_screaming', { no: true }); dice(1, 2, 6); ok(ok2(R.rollPsy(c.s, c.e, c.u), 1, 2), 'control: 2D6'); });
TT('b_imperial', 'unidades amigas en el alcance de mando del portador: 3D6 en Miedo/Pánico/Terror y se descarta el más alto', () => {
  const a = psy('b_imperial'); const c2 = psy('b_imperial', { no: true }); dice(4, 5, 1); ok(ok2(R.rollPsy(a.s, a.u), 1, 4), 'el propio portador: 3D6 sin el más alto');
  const mk = (dx) => { const s = game([{ type: 'state_troops', models: 10, std: true }, { type: 'state_troops', models: 10, std: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' }); const us = s.units.filter((x) => x.owner === 0); us[1].banner = 'b_imperial'; put(us[0], 36, 20); put(us[1], 36 + dx, 20); put(s.units.find((x) => x.owner === 1), 36, 50, Math.PI / 2); cur(s); return { s, u: us[0] }; };
  const n = mk(14), f = mk(30); dice(4, 5, 1); ok(ok2(R.rollPsy(n.s, n.u), 1, 4), 'amigo cercano (≤12" de un portaestandarte de unidad): 3D6'); dice(4, 5, 1); ok(ok2(R.rollPsy(f.s, f.u), 4, 5), 'amigo lejano: 2D6');
});
TT('del_cold', 'un solo uso: en un chequeo de Ld tira un D6 extra y descarta el más alto', () => { const a = psy('del_cold'); dice(6, 5, 1); ok(ok2(R.rollPsy(a.s, a.u), 1, 5), 'falla (11): D6 extra y descarta el más alto'); dice(6, 5, 1); ok(ok2(R.rollPsy(a.s, a.u), 6, 5), 'ya usado: no se repite el efecto'); const b = psy('del_cold'); dice(1, 2, 6); ok(ok2(R.rollPsy(b.s, b.u), 1, 2), 'si pasa no gasta el uso'); });
TT('b_guff', 'repite una tirada de Pánico fallada', () => { const a = psy('b_guff'); dice(6, 5, 1, 2); ok(R.passPanic(a.s, a.u) === true, 'con el estandarte repite'); const b = psy('b_guff', { no: true }); dice(6, 5, 1, 2); ok(R.passPanic(b.s, b.u) === false, 'control: falla'); });
TT('b_gleaming', 'un solo uso: repite un chequeo de Liderazgo fallado', () => { const a = psy('b_gleaming'); dice(6, 5, 1, 2); ok(R.passPanic(a.s, a.u) === true, 'repite la primera vez'); dice(6, 5, 1, 2); ok(R.passPanic(a.s, a.u) === false, 'una sola vez'); });
// Ruptura: el perdedor es la unidad del jugador 1 (portador); el ganador (jugador 0) está mudo y tiene +rango
function brk(key, o = {}) {
  const it = key ? ITEMS[key] : null, std = it && (it.cat === 's' || it.bn), fac = (it && it.fac) || 'empire', ut = o.ut || STD[fac], ct = it && !std ? carrierOf(it) : null;
  const wt = muted('orc_boyz'); const s = game([{ type: wt, models: 20, std: true }], [{ type: o.keep ? ut : muted(ut), models: o.ln || 10 }, ...(ct ? [{ type: muted(ct), models: 1, items: [key] }] : [])], { f: ['orcs', FF(ut)], phase: 'combat', active: 1 });
  const w = U(s, wt, 0), l = U(s, o.keep ? ut : muted(ut), 1); if (std) l.banner = key; put(w, 36, 24, Math.PI / 2); put(l, 36, 20, -Math.PI / 2); if (ct) { join(s, U(s, muted(ct), 1), l); R.syncJoined(s); }
  engage(s, w, l); charged(s, w, l, 5); (o.setup || (() => {}))(s, w, l); cur(s); return { s, w, l };
}
const runB = (b, q) => { dice(...q); diceAll(1); const ev = fight(b.s); return msgs(ev); };
const bres = (m) => { const x = /chequeo de ruptura (\d+)\+(\d+) contra Ld (\d+) → (huye|retrocede en buen orden|cede terreno)/.exec(m); return x ? { nat: +x[1], diff: +x[2], ld: +x[3], res: x[4] } : null; };
const bk = (key, q, o) => { const b = brk(key, o); const m = runB(b, q); return { ...b, m, r: bres(m) }; };
TT('b_valorous', 'tira 3D6 en los chequeos de ruptura y descarta el más alto', () => { const a = bk('b_valorous', [6, 5, 1]); ok(a.r, "hay chequeo: " + a.m.slice(-200)); eq(a.r.nat, 6, '3D6 [6,5,1] sin el más alto = 1+5'); const c = bk(null, [6, 5, 1], { ut: 'state_troops' }); eq(c.r.nat, 11, 'control 2D6'); });
TT('b_duty', 'repite una tirada de reagrupar fallada', () => { rally('b_duty', true); rally('b_duty', false, true); });

const L = (m) => m.replace(/\n/g, ' | ').slice(-260);
T('v839-it-del_cold-rup', FILE, 'Estandarte de Sangre Fría: un solo uso: en un chequeo de Ld (también de Ruptura) tira un D6 extra y descarta el más alto', () => { const a = bk('del_cold', [6, 5, 1], { ut: 'state_troops' }); ok(a.r, L(a.m)); eq(a.r.nat, 6, 'ruptura: 2D6 6+5 fallado → D6 extra [1] y se descarta el más alto: 1+5'); });
TT('heaj_courage', 'un solo uso: en un test de ruptura el portador (y su unidad) tira un D6 extra y descarta el resultado más alto', () => { const a = bk('heaj_courage', [6, 5, 1], { ut: 'state_troops' }); ok(a.r, L(a.m)); eq(a.r.nat, 6, '[6,5,1] → 1+5'); });
TT('kv_stoicism', 'el portador y su unidad pueden repetir los 2D6 de un chequeo de ruptura', () => { const a = bk('kv_stoicism', [6, 5, 1, 2], { ut: 'state_troops' }); ok(a.r, L(a.m)); eq(a.r.nat, 3, 'repite 6+5 por 1+2'); const c = bk(null, [6, 5, 1, 2], { ut: 'state_troops' }); eq(c.r.nat, 11, 'control'); });
TT('okl_laurels', 'un solo uso: él y su unidad repiten el 2D6 de un test de ruptura', () => { const a = bk('okl_laurels', [6, 5, 1, 2], { ut: 'state_troops' }); ok(a.r, L(a.m)); eq(a.r.nat, 3, 'repite'); });
TT('aj_steadfast', 'si la unidad pierde un combate puede Retroceder en buen orden aunque la FU rival sea más del doble', () => { const mk = (key) => bk(key, [2, 2], { ut: 'state_troops', ln: 3, keep: false }); const a = mk('aj_steadfast'); ok(a.r, L(a.m)); const c = mk(null); ok(c.r, L(c.m)); ok(a.r.res !== 'huye' || c.r.res === 'huye', `con el estandarte ${a.r.res}; control ${c.r.res}`); });
