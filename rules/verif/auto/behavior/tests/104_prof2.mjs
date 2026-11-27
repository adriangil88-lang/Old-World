// v838 — Reglas de perfil de combate y rasgos caóticos (lote 5)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, fight, prof, asks, asked } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
T('rule-ghostsight', RS('ghostsight'), 'Vista fantasmal: en combate repite los fallos al impactar contra magos, portadores de objetos mágicos y modelos con salvación especial o regeneración', () => {
  const g = (foe, x = {}) => { const { s, w, l } = pair('bm_cygor', {}, foe, x); cur(s); return prof(s, w, l).rrHit; };
  ok(g('empire_mage') === true, 'contra un mago repite'); ok(g('trolls') === true, 'contra regeneración (Trolls) repite'); ok(g('state_troops') === false, 'control: contra infantería corriente no'); ok(withoutSr('bm_cygor', 'ghostsight', () => g('empire_mage')) === false, 'sin la regla no repite');
});
T('rule-whirlDeath', RS('whirlDeath'), 'Torbellino de muerte: al herir, un resultado de 4+ siempre es éxito, sea cual sea la Resistencia del objetivo', () => {
  const w = (strip) => { const f = () => { const { s, w, l } = pair('dw_doomseeker', {}, 'orc_giant', {}); cur(s); return prof(s, w, l).wnd; }; return strip ? withoutSr('dw_doomseeker', 'whirlDeath', f) : f(); };
  eq(w(false), 4, 'contra R6 con F5 hiere con 4+'); ok(w(true) > 4, 'control: sin la regla se necesita más (' + w(true) + '+)');
});
T('rule-toadRage', RS('toadRage'), 'Furia del sapo: contra la unidad enemiga marcada los ripperdáctilos ganan +1 Ataque y repiten los 1 naturales al impactar', () => {
  const g = (mk) => { const { s, w, l } = pair('lm_ripperdactyls', {}, 'state_troops', {}); if (mk) l.toadMk = [w.owner]; cur(s); const p = prof(s, w, l); return p; };
  const a = g(true), b = g(false); ok(a.toadHit === true && !b.toadHit, 'repite los 1 solo contra la unidad marcada'); ok(a.atk > b.atk, `+Ataque contra la unidad marcada (${b.atk} → ${a.atk})`);
});
T('rule-bloodFrenzy', RS('bloodFrenzy'), 'Frenesí de sangre: cuando la montura causa una herida no salvada, queda sujeta a Frenesí; el jinete no gana +1 Ataque', () => {
  const { s, w, l } = pair('lm_oldblood_carno', {}, 'state_troops', {}); cur(s); const a0 = prof(s, w, l).atk; w.bfz = true; const a1 = prof(s, w, l).atk; ok(a1 > a0, `con la montura frenética aumentan sus ataques (${a0} → ${a1})`);
  const rider = D(w).A; const mount = D(w).mount?.A ?? 0; ok(a1 - a0 <= Math.max(1, mount), 'el +1 es solo de la montura (no del jinete): ' + (a1 - a0));
});
T('rule-ctRefl', RS('ctRefl'), 'Reflejos mejorados (rasgo caótico): los modelos con arma de mano sencilla ganan +2 a la Iniciativa; no con dos armas', () => {
  const I = (type, rule) => withSr(type, rule, () => { const { s, w, l } = pair(type, {}, 'state_troops', {}); cur(s); return R.effI(w, [l]); });
  const a = I('woc_marauders', 'ctRefl'), b = I('woc_marauders', []); eq(a, Math.min(10, b + 2), `+2 I (${b} → ${a})`);
});
T('rule-ctDark', RS('ctDark'), 'Corazones oscuros (rasgo caótico): si el bando ganador incluye una unidad con mayoría de modelos con el rasgo, cada unidad perdedora sufre −1 Liderazgo en la prueba de ruptura', () => {
  const run = (rule) => withSr('woc_marauders', rule, () => { const { s, w, l } = pair('woc_marauders', { models: 20 }, 'state_troops', { models: 10 }); cur(s); dice(1, 6); diceAll(4); const ev = fight(s); const m = msgs(ev); return /contra Ld (\d+)/.exec(m)?.[1]; });
  const a = run('ctDark'), b = run([]); ok(a && b && +a === +b - 1, `Ld de ruptura ${b} → ${a}`);
});
T('rule-ctHung', RS('ctHung'), 'Hambre de batalla (rasgo caótico): +2" al alcance máximo de carga y +D3 a la tirada de carga (se pregunta)', () => {
  const run = (rule) => withSr('woc_marauders', rule, () => { const s = game([{ type: 'woc_marauders', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['chaos', 'empire'], phase: 'move' }); const a = put(U(s, 'woc_marauders', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 32, Math.PI / 2); cur(s); dice(1, 1, 3, 3); diceAll(2); return asks(s, (c) => R.apply(c, { t: 'charge', id: U(c, 'woc_marauders', 0).id, target: U(c, 'state_troops', 1).id }), [0, 1], (n) => (n.opts?.some((o) => o[0] === 'y') ? 'y' : n.opts?.[0]?.[0])); });
  const a = run('ctHung'), b = run([]); ok(a.needs.some((n) => n.title === 'Hambre de batalla') && !b.needs.some((n) => n.title === 'Hambre de batalla'), 'se pregunta solo con el rasgo');
});
T('rule-trophyRack', RS('trophyRack'), 'Percha de Trofeos: en el turno en que carga, él y su unidad causan Miedo y suman +1 a la resolución del combate', () => {
  const { s, w } = pair('gob_kiknik', {}, 'state_troops', {}); cur(s); w.chargeOK = true; ok(R.causesFear(w) || R.has(w, 'fear'), 'al cargar causa Miedo'); w.chargeOK = false; ok(!R.has(w, 'fear'), 'si no ha cargado, no');
  const res = (strip) => { const f = () => { const q = pair('gob_kiknik', {}, 'state_troops', {}); cur(q.s); diceAll(1); const ev = fight(q.s); return /Combate: .*? (\d+) – (\d+)/.exec(msgs(ev)); }; return strip ? withoutSr('gob_kiknik', 'trophyRack', f) : f(); };
  const a = res(false), b = res(true); ok(a && b && +a[1] === +b[1] + 1, `+1 a la resolución (${b?.[1]} → ${a?.[1]})`);
});
T('rule-heraldDespair', RS('heraldDespair'), 'Heraldo de la Desesperación: los enemigos en contacto con Nekaph o su unidad tiran un D6 extra en Miedo/Terror y descartan el más bajo', () => {
  const { s, w, l } = pair('tk_nekaph', {}, 'state_troops', {}); cur(s); diceAll(1); eq(R.despair(s, w, [6, 5]).sort().join(), '5,6', 'D6 extra con 1: se descarta el 1'); diceAll(6); eq(R.despair(s, w, [6, 5]).sort().join(), '6,6', 'D6 extra con 6: se descarta el 5');
  eq(R.despair(s, l, [6, 5]).join(), '6,5', 'control: ante una unidad sin la regla no actúa');
});
T('rule-danceDeath', RS('danceDeath'), 'Danza de la muerte: si carga con éxito, el objetivo sufre −1 a su Rango máximo hasta el final de esa fase de Combate', () => {
  const run = (strip) => { const f = () => { const s = game([{ type: 'de_sisters', models: 10 }], [{ type: 'state_troops', models: 20 }], { f: ['de', 'empire'], phase: 'move' }); const a = put(U(s, 'de_sisters', 0), 36, 40), t = put(U(s, 'state_troops', 1), 36, 33, Math.PI / 2); cur(s); diceAll(6); const r = R.apply(s, { t: 'charge', id: a.id, target: t.id }); return { s, t: by(s, t), ok: r.ok }; }; return strip ? withoutSr('de_sisters', 'danceDeath', f) : f(); };
  const a = run(false), b = run(true); ok(a.t.dod && !b.t.dod, 'el objetivo queda marcado con −1 al Rango máximo'); 
});
