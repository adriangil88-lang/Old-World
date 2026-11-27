import { T, N, game, U, engage, charged, fight, dice, diceAll, msgs, blows, ok, eq, R } from '../lib.mjs';
T('smoke-combat', 'arnés', 'un combate 1 contra 1 se resuelve con dados fijados', (h) => {
  const s = game([h.E('spider_riders', 5)], [h.E('woc_warriors', 5, { mark: 'nurgle' })], { f: ['orcs', 'woc'] });
  const a = U(s, 'spider_riders'), d = U(s, 'woc_warriors');
  engage(s, a, d); charged(s, a, d);
  diceAll(4); // todos los dados valen 4
  const ev = fight(s); const sum = (l, k) => l.reduce((t, x) => t + x[k], 0), bl = blows(ev, 'Jinetes'), br = blows(ev, 'Guerreros');
  ok(/Combate:/.test(msgs(ev)), 'el combate no se resuelve'); ok(h.dlog().length > 0, 'no se usan los dados fijados');
  // cuentas exactas con 4 en todos los dados (core.txt: tabla de impactar/herir): Jinetes F3 contra R4 necesitan 5+ (0 heridas); Guerreros HA5 contra HA2 impactan con 3+, F4 contra R3 hieren con 4+, sin armadura enemiga: 5 impactos, 5 heridas
  eq(sum(bl, 'n'), 10, 'ataques de 5 Jinetes (jinete + araña)'); eq(sum(bl, 'w'), 0, 'F3 contra R4 con un 4: ninguna herida'); eq([sum(br, 'n'), sum(br, 'h'), sum(br, 'w')], [5, 5, 5], 'Guerreros: 5 ataques, 5 impactos, 5 heridas'); eq([a.models, d.models], [0, 5], 'la unidad de Jinetes queda destruida, los Guerreros intactos');
});
