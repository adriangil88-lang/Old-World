// v837 — Reglas especiales sin prueba propia (lote B): comparación A/B (con y sin la regla) frente a su texto
import { T, N, R, DATA, GEOM, game, U, ok, eq, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, join, blows } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS } = DATA;
const RS = (k) => `app/js/data.js (regla «${k}»)`;
// Capitán imperial (A3) contra Orcos: cuenta impactos con una cola de dados fija
const hitsWith = (rules, q, o = {}) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'orc_boyz', 1); engage(s, a, b); if (o.charge) charged(s, a, b, 6); if (o.fought) a.fought = true; cur(s); dice(q); diceAll(1); const ev = fight(s); const bl = blows(ev, a.name); return { hits: bl.reduce((t, x) => t + x.h, 0), P: R.attackProfile(a, b), a, b, ev }; });
const RR = [1, 6, 1, 6, 1, 6, 1, 6, 1, 6]; // cada ataque: un 1 natural y, si se repite, un 6
for (const k of ['rr1HitC', 'guardTemple', 'chayal', 'innerCircle', 'ithilmarW']) T('rule-' + k, RS(k), `${k}: repite los 1 naturales para impactar en combate`, () => {
  const a = hitsWith([k], RR), n = hitsWith([], RR); ok(n.hits < a.hits, `con la regla se repiten los 1 (${n.hits} → ${a.hits} impactos)`); eq(a.hits, a.P.atk, 'todos los ataques del Capitán impactan tras repetir su 1');
});
T('rule-heartInit', RS('heartInit'), 'Orden del Corazón Ardiente: +1 Iniciativa durante la primera ronda de cualquier combate', () => {
  const i0 = hitsWith([], []).P ? null : null; const get = (rules, fought) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'orc_boyz', 1); engage(s, a, b); a.fought = fought; cur(s); return R.effI(a, [b]); });
  const base = get([], false); eq(get(['heartInit'], false), base + 1, 'primera ronda: +1 I'); eq(get(['heartInit'], true), base, 'después: sin bonificación');
});
T('rule-stoic', RS('stoic'), 'Defensores estoicos: en un turno en que son cargados, +1 Iniciativa y +1 Ataque', () => {
  const run = (rules, wasCh) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const a = U(s, 'empire_captain', 0), b = U(s, 'orc_boyz', 1); engage(s, a, b); b.charged = true; if (wasCh) { a.wasCharged = s.turn; a.wasChargedK = s.turn + ':' + s.active; } cur(s); return { I: R.effI(a, [b]), A: R.attackProfile(a, b).atk }; });
  const b0 = run([], true), c = run(['stoic'], true), d = run(['stoic'], false); eq(c.I, b0.I + 1, '+1 I al ser cargado'); eq(c.A, b0.A + 1, '+1 Ataque al ser cargado'); eq([d.I, d.A], [b0.I, b0.A], 'sin ser cargado, nada');
});
T('rule-firstFray', RS('firstFray'), 'Primero a la refriega: +D3 a la tirada de carga (y +3" al alcance máximo de carga)', () => {
  const go = (rules, gap) => withSr('empire_captain', rules, () => { const s = game([{ type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move', active: 0 }); const a = put(U(s, 'empire_captain', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 10, Math.PI / 2); cur(s); const dm = GEOM.dims(a), dt = GEOM.dims(t); t.y = a.y - dm.d / 2 - dt.d / 2 - gap; cur(s); dice(1, 1, 3); diceAll(1); const ev = []; R.doCharge(s, a, t, ev); return R.engagedWith(s, t).includes(a); });
  const M = UNITS.empire_captain.M; ok(go(['firstFray'], M + 1 + 3), 'con la regla: M + mayor dado (1) + D3 (3) alcanza'); ok(!go([], M + 1 + 3), 'sin la regla no alcanza'); ok(!go(['firstFray'], M + 1 + 3 + 0.5), 'ni un palmo más');
});
T('rule-blazingBody', RS('blazingBody'), 'Cuerpo ardiente: al inicio de cada fase de Combate, los modelos en contacto sin la regla sufren 1 impacto F3 flamígero (no cuenta para el resultado)', () => {
  const s = game([{ type: 'cd_taurus', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['cd', 'empire'] }); const a = U(s, 'cd_taurus', 0), b = U(s, 'state_troops', 1); engage(s, a, b); cur(s); globalThis.__WSL = []; diceAll(1); const ev = fight(s);
  const w = globalThis.__WSL.filter((x) => x.def.type === 'state_troops' && x.S === 3 && x.o.flaming); ok(w.length >= 1 && w[0].hits === 1, 'el enemigo en contacto sufre 1 impacto F3 flamígero: ' + msgs(ev).slice(0, 300));
});
T('rule-coldBlooded', RS('coldBlooded'), 'Sangre fría: en chequeos de Miedo, Pánico o Terror tira un D6 extra y descarta el más alto', () => {
  const go = (rules) => withSr('state_troops', rules, () => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const u = U(s, 'state_troops', 0); cur(s); dice(6, 6, 1); diceAll(1); return R.rollPsy(s, u); });
  eq(go(['coldBlooded']), [1, 6], 'con 6,6,1 descarta el más alto: queda 1+6'); eq(go([]), [6, 6], 'sin la regla: 6+6');
});
T('rule-warpSpawned', RS('warpSpawned'), 'Engendro de la disformidad: la Regeneración no puede usarse contra Heridas causadas por ataques mágicos', () => {
  const go = (rules, magical) => withSr('state_troops', rules, () => { const s = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'] }); const d = U(s, 'state_troops', 0); d.fx.push({ k: 'regen', v: 4 }); cur(s); diceAll(6); return R.woundAndSave(s, d, 4, 10, 0, { magical, noArmour: true, noWard: true }).through; });
  eq(go(['warpSpawned'], false), 0, 'ataque normal: la Regeneración (6 ≥ 4) salva todo'); eq(go(['warpSpawned'], true), 4, 'ataque mágico: no hay Regeneración'); eq(go([], true), 0, 'sin la regla, la Regeneración funciona también contra ataques mágicos');
});
