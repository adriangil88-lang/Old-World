// v839 — Objetos de Mando con acción propia (R.apply)
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, by, join } from '../lib3.mjs';
import { FILE } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
const F2 = (t) => (UNITS[t].faction === 'merc' ? 'empire' : UNITS[t].faction);
TT('big_boss_at', 'en la fase de mando, test de Liderazgo: él y su unidad son Inquebrantables hasta tu próximo turno', () => {
  const mk = () => { const ct = carrierOf(ITEMS.big_boss_at); const s = game([{ type: 'orc_boyz', models: 20 }, { type: ct, models: 1, items: ['big_boss_at'] }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy', active: 0 }); const h = put(U(s, 'orc_boyz', 0), 36, 40), c = U(s, ct, 0); join(s, c, h); R.syncJoined(s); put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); cur(s); return { s, h, c }; };
  const a = mk(); dice(1, 2); const r = R.apply(a.s, { t: 'bigboss', id: a.h.id }); ok(r.ok && by(a.s, a.h).fx.some((f) => f.k === 'unbreak'), 'Ld superado: Inquebrantable: ' + msgs(r.events || []));
  const b = mk(); dice(6, 5); const f = R.apply(b.s, { t: 'bigboss', id: b.h.id }); ok(!(by(b.s, b.h).fx || []).some((x) => x.k === 'unbreak'), 'Ld fallado: no'); ok(!R.apply(b.s, { t: 'bigboss', id: b.h.id }).ok, 'solo una vez por turno');
});
TT('bm_dark_heart', 'un solo uso: en la subfase de Mando puede consumirlo y recupera de inmediato 1 Herida perdida', () => {
  const ct = carrierOf(ITEMS.bm_dark_heart); const s = game([{ type: ct, models: 1, items: ['bm_dark_heart'] }], [{ type: 'state_troops', models: 10 }], { f: ['bm', 'empire'], phase: 'strategy', active: 0 }); const c = put(U(s, ct, 0), 36, 40); put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); cur(s);
  const W = c.wounds; c.wounds = W - 2; const r = R.apply(s, { t: 'drink', id: c.id, k: 'bm_dark_heart' }); ok(r.ok, 'acción válida: ' + JSON.stringify(r.error || r.err || '')); eq(by(s, c).wounds, W - 1, 'recupera 1 Herida'); ok(!R.apply(s, { t: 'drink', id: c.id, k: 'bm_dark_heart' }).ok, 'un solo uso');
});
TT('vcl_p_night', 'Fase de Mando (Ld propio): una unidad de Murciélagos Funestos, Enjambres de Murciélagos o Lobos Funestos a 12" recupera D6 Heridas', () => {
  const ct = carrierOf(ITEMS.vcl_p_night); const mk = () => { const s = game([{ type: ct, models: 1, items: ['vcl_p_night'] }, { type: 'vc_direwolves', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'], phase: 'strategy', active: 0 }); const c = put(U(s, ct, 0), 36, 40), w = put(U(s, 'vc_direwolves', 0), 36, 46); put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); w.wounds -= 5; w.models = Math.ceil(w.wounds / UNITS.vc_direwolves.W); cur(s); return { s, c, w }; };
  const a = mk(), w0 = a.w.wounds; dice(1, 2, 4); const r = R.apply(a.s, { t: 'useItem', id: a.c.id, item: 'vcl_p_night' }); ok(r.ok, 'acción: ' + JSON.stringify(r.error || r.err || '') + msgs(r.events || [])); eq(by(a.s, a.w).wounds, w0 + 4, 'recupera D6 (4)');
  const b = mk(), w1 = b.w.wounds; dice(6, 5, 4); R.apply(b.s, { t: 'useItem', id: b.c.id, item: 'vcl_p_night' }); eq(by(b.s, b.w).wounds, w1, 'Ld fallado: nada');
});
TT('vcl_noirot', 'puede usar Invocación de Nehek dos veces por Fase de Mando; tira un D6 por cada uso: con 1 pierde una Herida', () => {
  const ct = 'vc_necromancer'; const mk = (key) => { const s = game([{ type: ct, models: 1, items: key ? [key] : [] }, { type: 'vc_zombies', models: 20 }], [{ type: 'state_troops', models: 10 }], { f: ['vc', 'empire'], phase: 'strategy', active: 0 }); const c = put(U(s, ct, 0), 36, 40), z = put(U(s, 'vc_zombies', 0), 36, 46); put(U(s, 'state_troops', 1), 36, 20, Math.PI / 2); z.wounds -= 8; z.models = Math.ceil(z.wounds / UNITS.vc_zombies.W); cur(s); return { s, c, z }; };
  const a = mk('vcl_noirot'); diceAll(2); const r1 = R.apply(a.s, { t: 'nehek', id: a.c.id, target: a.z.id }), r2 = R.apply(a.s, { t: 'nehek', id: a.c.id, target: a.z.id }), r3 = R.apply(a.s, { t: 'nehek', id: a.c.id, target: a.z.id }); ok(r1.ok && r2.ok && !r3.ok, 'dos usos y no un tercero');
  const b = mk('vcl_noirot'), W = b.c.wounds; dice(1); diceAll(2); R.apply(b.s, { t: 'nehek', id: b.c.id, target: b.z.id }); eq(by(b.s, b.c).wounds, W - 1, 'con 1 en el D6 pierde una Herida');
  const c = mk(null); diceAll(2); R.apply(c.s, { t: 'nehek', id: c.c.id, target: c.z.id }); ok(!R.apply(c.s, { t: 'nehek', id: c.c.id, target: c.z.id }).ok, 'control: solo una vez');
});
