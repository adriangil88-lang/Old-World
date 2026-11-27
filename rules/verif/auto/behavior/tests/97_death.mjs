// v838 — Efectos al perder la última Herida / al huir (se ejecuta destroy() y el flujo de combate con dados fijados)
import { GEOM, T, N, R, DATA, game, pair, resolve, asked, msg, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, wsl, prof, fight } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
// u (jugador 0) en contacto con un enemigo (jugador 1) y, opcionalmente, un amigo; luego muere
const dies = (type, o = {}) => { const { s, w: u, l: foe } = pair(type, { ...(o.X || {}) }, o.foeT || 'state_troops', { models: 10 }, { charge: false, ...(o.pair || {}), extra0: o.friend ? [{ type: o.friend, models: 10 }] : [] }); const fr = o.friend ? touch(s, U(s, o.friend, 0), u) : null; o.setup?.(s, u, foe); cur(s); if (o.q) dice(o.q); if (o.all != null) diceAll(o.all); const ev = []; const x = wsl(() => { u.models = 0; u.wounds = 0; R.destroy(s, u, ev); }); return { s, u, foe, ev, log: x.log, m: msgs(ev), fr }; };
const touch = (s, a, d) => { const dd = GEOM.dims(d), da = GEOM.dims(a); const g = d.face + Math.PI / 2, r = dd.w / 2 + da.d / 2; put(a, d.x + Math.cos(g) * r, d.y + Math.sin(g) * r, g + Math.PI); return a; };
const hitsOn = (x, who, S, ap) => x.log.filter((e) => e.def.id === who.id && e.S === S && e.ap === ap && e.hits > 0);
T('rule-infested', RS('infested'), 'Infestado: al perder su última Herida toda unidad en contacto de peana (amiga o enemiga) sufre D6 impactos de F2 y FP −1', () => {
  const x = dies('vc_terrorgheist', { all: 4 }); const h = hitsOn(x, x.foe, 2, 1); ok(h.length === 1 && h[0].hits === 4, 'el enemigo en contacto sufre D6 (=4) impactos F2 FP−1: ' + JSON.stringify(x.log.map((e) => [e.S, e.ap, e.hits])));
  const y = dies('vc_terrorgheist', { all: 4, friend: 'vc_zombies' }); ok(hitsOn(y, y.fr, 2, 1).length === 1, 'también la unidad amiga en contacto');
});
T('rule-explosiveDemise', RS('explosiveDemise'), 'Final explosivo: al perder su última Herida toda unidad (amiga o enemiga) a 6" sufre D6 impactos de F5 y PA −2', () => {
  const near = dies('woc_warpfire', { all: 3, setup: (s, u, f) => {} }); ok(hitsOn(near, near.foe, 5, 2).length === 1 && hitsOn(near, near.foe, 5, 2)[0].hits === 3, 'el enemigo en contacto (<6") sufre D6 impactos F5 FP−2');
  const far = dies('woc_warpfire', { all: 3, setup: (s, u, f) => { put(f, 36, 6, Math.PI / 2); put(u, 36, 40); } }); ok(hitsOn(far, far.foe, 5, 2).length === 0, 'a más de 6" no sufre nada');
});
T('rule-scarabPrince', RS('scarabPrince'), 'Príncipe Escarabajo: si pierde su última Herida, los enemigos a 2D6" sufren 2D6 impactos de F2, PA −1', () => {
  const mk = (gap) => dies('tk_apophas', { all: 4, setup: (s, u, f) => { put(u, 36, 40); put(f, 36, 40 - 2 - gap, Math.PI / 2); } });
  const a = mk(3), b = mk(14); const h = hitsOn(a, a.foe, 2, 1); ok(h.length === 1 && h[0].hits === 8, '2D6 (=8) impactos F2 FP−1 al enemigo a 2D6" (8"): ' + JSON.stringify(a.log.map((e) => [e.S, e.ap, e.hits]))); ok(hitsOn(b, b.foe, 2, 1).length === 0, 'fuera de 2D6" no');
});
T('rule-unboundSpirits', RS('unboundSpirits'), 'Espíritus desatados: al ser destruido, cada unidad (amiga o enemiga) a 12" sufre con 4+ D6 impactos F3 sin armadura ni Regeneración', () => {
  const a = dies('tk_casket', { all: 4 }), b = dies('tk_casket', { all: 3 }); const h = hitsOn(a, a.foe, 3, 0); ok(h.length === 1 && h[0].hits === 4 && h[0].o.noArmour && h[0].o.noRegen, 'con 4+: D6 impactos sin armadura ni Regeneración: ' + JSON.stringify(a.log.map((e) => [e.S, e.hits, e.o.noArmour]))); ok(hitsOn(b, b.foe, 3, 0).length === 0, 'con 3 no sufre nada'); ok(!h[0].o.magical, 'los impactos no son mágicos (el texto no lo dice)');
});
T('rule-ashes', RS('ashes'), 'De las cenizas: al perder su última Herida: 1-2 se retira; 3-5 explota (D6 impactos F3 FP −1 flamígeros a los enemigos en contacto); 6 renace con D3 Heridas', () => {
  const a = dies('he_flamespyre', { all: 1 }), b = dies('he_flamespyre', { all: 4 }), c = dies('he_flamespyre', { all: 6 });
  ok(a.log.length === 0, '1-2: se retira sin explotar'); const h = hitsOn(b, b.foe, 3, 1); ok(h.length === 1 && h[0].hits === 4 && h[0].o.flaming, '3-5: D6 impactos F3 FP−1 flamígeros'); ok(c.u.models === 1 && c.u.wounds === 3, `6: renace con D3 Heridas (${c.u.wounds})`);
});
T('rule-timber', RS('timber'), '¡Timmm-berrr!: al llegar a 0 Heridas el ganador de una tirada elige un arco; las unidades en ese arco en contacto sufren D6 impactos de su Fuerza, FP −1', () => {
  const x = dies('we_treeman', { q: [5, 2, 4] }); const S = D(x.u).S; const h = hitsOn(x, x.foe, S, 1); ok(h.length === 1 && h[0].hits === 4, `D6 (=4) impactos F${S} FP−1 al enemigo en el arco: ` + x.m.slice(0, 200));
});
T('rule-timmberr', RS('timmberr'), '¡Timmm-berrr! (Centinela): igual — D6 impactos de su Fuerza, FP −1, a las unidades en contacto en el arco elegido', () => {
  const x = dies('ct_sentinel', { q: [5, 2, 3] }); const S = D(x.u).S; const h = hitsOn(x, x.foe, S, 1); ok(h.length === 1 && h[0].hits === 3, `D6 (=3) impactos F${S} FP−1: ` + x.m.slice(0, 200)); ok(/Timmm-berrr/.test(x.m), 'anuncia la caída');
});
T('rule-tooHorrible', RS('tooHorrible'), 'Demasiado horrible para morir: la primera vez que pierde su última Herida: 1-3 muere; 4-5 muere y surge un Enjambre de Ratas; 6 se alza y recupera D3 Heridas', () => {
  const run = (v) => { const { s, w: u } = pair('sk_hellpit', {}, 'state_troops', { models: 10 }, { charge: false }); cur(s); diceAll(v); const W = D(u).W; u.wounds = W; u.models = 1; R.applyWounds(u, W); return { s, u, W }; };
  const a = run(2), b = run(5), c = run(6); ok(a.u.models <= 0 && !a.u.ratsOnDeath, '1-3: muere'); ok(b.u.ratsOnDeath === true, '4-5: muere y surge un Enjambre de Ratas (marcada para surgir al destruirse)'); ok(c.u.models >= 1 && c.u.wounds >= 1 && c.u.wounds <= 3, `6: se alza con D3 Heridas (${c.u.wounds})`); const d = run(1); d.u.tooH = true; const { s, w: u2 } = pair('sk_hellpit', {}, 'state_troops', { models: 10 }, { charge: false }); cur(s); diceAll(6); u2.tooH = true; u2.wounds = D(u2).W; u2.models = 1; R.applyWounds(u2, D(u2).W); ok(u2.models <= 0, 'solo la primera vez');
});
T('rule-curse', RS('curse'), 'Maldición de la Necrópolis: si muere por un ataque enemigo, la unidad atacante chequea Liderazgo; si falla sufre D3 impactos F2', () => {
  const run = (strip) => { const f = () => { const o7 = DATA.UNITS.tk_prince.Sv, w7 = DATA.UNITS.tk_prince.regen; DATA.UNITS.tk_prince.Sv = 7; DATA.UNITS.tk_prince.regen = 0; try { const { s, w, l } = pair('state_troops', { models: 20 }, 'tk_prince', {}, { charge: true }); l.wounds = 1; diceAll(6); const x = wsl(() => resolve(s)); return { x, w, l, s }; } finally { DATA.UNITS.tk_prince.Sv = o7; DATA.UNITS.tk_prince.regen = w7; } }; return strip ? withoutSr('tk_prince', 'curse', f) : f(); };
  const a = run(false), b = run(true); ok(!by(a.x.r.s, a.l) || by(a.x.r.s, a.l).models <= 0, 'montaje: el Príncipe muere: ' + msg(a.x.r).slice(-160)); const h = a.x.log.filter((e) => e.def.id === a.w.id && e.S === 2 && e.hits > 0); ok(h.length >= 1 && h[0].hits === 3, 'el atacante falla el Ld (12) y sufre D3 impactos F2: ' + JSON.stringify(a.x.log.map((e) => [e.def.name, e.S, e.hits]))); ok(!b.x.log.some((e) => e.def.id === b.w.id && e.S === 2 && e.hits > 0), 'control sin la regla');
});
T('rule-squigsWild', RS('squigsWild'), 'Garrapatos descontrolados: si la manada huye de un combate, cada unidad a 2D6" sufre D3 impactos F5 FP −1 y la manada se retira', () => {
  const { s, w, l } = pair('state_troops', { models: 20 }, 'squig_herd', { models: 10 }, { side: 'rear' }); l.ldm = 10; diceAll(2); const x = wsl(() => resolve(s)); const h = x.log.filter((e) => e.def.id === w.id && e.S === 5 && e.ap === 1 && e.hits > 0); ok(h.length >= 1 && h.every((e) => e.hits === 2), 'la unidad cercana sufre D3 (=2) impactos F5 FP−1: ' + msg(x.r).slice(-300)); ok(!by(x.r.s, l) || by(x.r.s, l).models <= 0, 'la manada se retira (se destruye)');
});
