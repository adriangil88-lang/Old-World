// v838 — Reglas de Catay y regimiento: escenarios con el motor real
import { T, N, R, DATA, game, pair, withLd, resolve, asked, msg, diceAll, dice, ok, eq, withSr, join, U, put, engage, charged, cur, fight, msgs, by, all, castThr, caster, asks, D } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const gap = (s, a, b, g) => { const A = R.D(a), B = R.D(b); void A; void B; put(a, 36, 24, -Math.PI / 2); const ha = GEOMd(a).d / 2, hb = GEOMd(b).d / 2; put(b, 36 + GEOMw(a) / 2 + GEOMw(b) / 2 + g, 24, -Math.PI / 2); void ha; void hb; };
import { GEOM } from '../lib3.mjs';
const GEOMd = (u) => GEOM.dims(u), GEOMw = (u) => GEOM.dims(u).w;
T('rule-detachment', RS('detachment'), 'Destacamento: 5+ modelos y como máximo la mitad de la regimental; sin mando; a 3" usa su Ld si es mayor y recibe Frenesí/Odio/Inmune a la psicología/Tozudez de ella', () => {
  const mk = (dm, g, pre) => { const s = game([{ type: 'state_troops', models: 20 }, { type: 'crossbowmen', models: dm, reg: 'state_troops' }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], join: false }); const p = U(s, 'state_troops', 0), d = U(s, 'crossbowmen', 0); pre?.(p, d); gap(s, p, d, g); cur(s); return { s, p, d }; };
  ok(D(U(mk(8, 2).s, 'state_troops', 0)).sr.includes('regimental'), 'montaje: regimental');
  ok(mk(8, 2).d.detOf === mk(8, 2).p.id, 'un destacamento de 8 (≤ mitad de 20) se asigna a su unidad regimental');
  ok(!mk(11, 2).d.detOf, 'más de la mitad de la regimental: no es destacamento'); ok(mk(4, 2).d.models >= 5, 'el destacamento tiene al menos 5 modelos');
  DATA.UNITS.crossbowmen.Ld = 5; const x = mk(8, 2); ok(x.d.std === false && x.d.mus === false && x.d.champ === false, 'sin mando (portaestandarte, músico, campeón)');
  const Ld = R.D(x.p).Ld, ownLd = R.D(x.d).Ld; ok(Ld > ownLd, 'montaje: la regimental tiene más Ld (' + Ld + ' > ' + ownLd + ')'); eq(R.ldOf(x.s, x.d), Math.max(Ld, ownLd), 'a 3" usa su Ld si es mayor'); const f = mk(8, 6); ok(R.ldOf(f.s, f.d) < Ld, 'a más de 3" usa el suyo');
  for (const r of ['frenzy', 'immunePsy', 'stubborn']) withSr('state_troops', r, () => { const a = mk(8, 2), b = mk(8, 6); if (r === 'stubborn') ok(R.has(a.p, r), 'montaje'); ok(R.has(a.d, r), r + ': el destacamento a 3" lo recibe'); ok(!R.has(b.d, r), r + ': a más de 3" no'); });
  withSr('state_troops', 'hatred', () => { const a = mk(8, 2); cur(a.s); const e = U(a.s, 'orc_boyz', 1); ok(R.attackProfile(a.d, e).hatred === true, 'Odio de la regimental a 3"'); const b = mk(8, 6); ok(R.attackProfile(b.d, U(b.s, 'orc_boyz', 1)).hatred !== true, 'a más de 3" no'); });
});
T('rule-detachmentSupport', RS('detachment'), 'Destacamento: cuando su unidad regimental es cargada, el destacamento a 3" puede prestar Fuego de apoyo o Carga de apoyo (se pregunta)', () => {
  const s = game([{ type: 'state_troops', models: 20 }, { type: 'crossbowmen', models: 8, reg: 'state_troops' }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'move', active: 1, join: false }); const p = U(s, 'state_troops', 0), d = U(s, 'crossbowmen', 0), o = U(s, 'orc_boyz', 1); gap(s, p, d, 2); put(o, 36, 36, -Math.PI / 2); p.x = 36; p.y = 24; cur(s);
  dice(6, 6, 6, 6); const r = asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'orc_boyz', 1).id, target: U(c, 'state_troops', 0).id }), [0, 1], () => 'fire'); ok(r.needs.some((n) => n.title === 'Acción de apoyo'), 'se pregunta la acción de apoyo: ' + r.needs.map((n) => n.title));
});
T('rule-cataphract', RS('cataphract'), 'Catafractos: si la mayoría tiene la regla y hace un movimiento de seguimiento, cuenta como que cargó (bonos de carga) en el turno siguiente', () => {
  const go = (type) => { const { s, w, l } = pair(type, { models: 10 }, 'state_troops', { models: 5 }, { side: 'rear' }); w.restrainPref = false; l.ldm = -6; diceAll(2); const r = resolve(s); return { r, w: by(r.s, w) }; };
  ok(DATA.UNITS.ct_lancers.sr.includes('cataphract') && !DATA.UNITS.empire_knights.sr.includes('cataphract'), 'montaje');
  const a = go('ct_lancers'), b = go('empire_knights'); ok(/cede terreno/.test(msg(a.r)), 'montaje: el enemigo cede terreno: ' + msg(a.r).slice(-120));
  ok(a.w.chargeOK === true, 'el catafracto que sigue cuenta como que ha cargado'); ok(b.w.chargeOK !== true, 'control: una caballería sin la regla no');
});
