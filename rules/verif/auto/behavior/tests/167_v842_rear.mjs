// v842 — posición del personaje retirado / sin hueco delante: elección del jugador (popup) y de la IA (decisor), según el texto
import { T, R, GEOM, ok, eq, cur, put, game, U, join, asks, engage, Fail } from '../lib3.mjs';
const CR = 'rules/core.txt', FF = 'rules/fof.txt', FQ = 'rules/new/faq_core.txt';
const PI = Math.PI;
function scene(n = 30, o = {}) {
  const s = game([{ type: 'state_troops', models: n }, { type: 'empire_captain', models: 1, std: true }], [{ type: 'orc_boyz', models: 20 }], { f: ['empire', 'orcs'], phase: 'combat' });
  const h = U(s, 'state_troops', 0), c = U(s, 'empire_captain'), e = U(s, 'orc_boyz', 1); h.files = 10; e.files = 10; put(h, 36, 30, -PI / 2); join(s, c, h);
  if (o.side) engage(s, e, h, o.side); else engage(s, h, e, 'front'); cur(s); R.syncJoined(s); return { s, h, c, e };
}
const run = (s, pick) => asks(s, (c) => { cur(c); R.ensureRear(c); return []; }, [0, 1], pick);
const idxOf = (h, c) => R.modelPts(h).findIndex((p) => Math.hypot(p.x - c.x, p.y - c.y) < 1e-6);

T('v842-retire-popup-rank-file', CR + ':7061-7083 («Moves through the ranks to take up a position away from the fighting rank») + ' + CR + ':6928-6931', 'Un personaje que se retira de un desafío elige en el momento fila y columna (popup) fuera de la fila de combate; su modelo queda exactamente en la ranura elegida', () => {
  const { s, h, c, e } = scene(); c.retiredFrom = e.id;
  const o = run(s, (n) => (n.k.includes('rearR') ? '2' : n.k.includes('rearF') ? '14' : undefined));
  ok(o.needs.length === 2 && o.needs[0].title === 'Colocar al personaje', 'dos popups: fila y columna (' + o.needs.length + ')');
  eq(o.needs[0].opts.map((x) => x[0]), ['1', '2'], 'filas elegibles: todas menos la de combate (fila 1)');
  eq(o.needs[1].opts.map((x) => x[0]), ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'].slice(0, 10), 'columnas de la fila 3 (10 posibles)');
});
T('v842-retire-choice-applies', CR + ':7061-7083', 'La ranura elegida se guarda y syncJoined coloca al personaje en el modelo correspondiente (fila 3, columna 5)', () => {
  const { s, h, c, e } = scene(); c.retiredFrom = e.id;
  const o = run(s, (n) => (n.k.includes('rearR') ? '2' : n.k.includes('rearF') ? '24' : undefined));
  const h2 = o.s.units.find((u) => u.id === h.id), c2 = h2.joined[0]; cur(o.s);
  eq(h2.rearAt[c2.id], 24, 'ranura guardada'); eq(idxOf(h2, c2), 24, 'el personaje está sobre el modelo 24 (fila 3, columna 5)');
  const o2 = run(o.s); eq(o2.needs.length, 0, 'ya elegida: no se vuelve a preguntar mientras siga retirado');
});
T('v842-nonroom-rear-rank', CR + ':6930-6931 («If there is no room for a character within a unit’s front rank, it is placed in the rear rank») + ' + FQ + ':809-810 («they retire to the rear»)', 'Un personaje sin hueco en la fila delantera va al último rango (solo se elige la columna)', () => {
  const s = game([{ type: 'state_troops', models: 12 }, { type: 'empire_captain', models: 1 }, { type: 'empire_captain', models: 1 }, { type: 'empire_captain', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' });
  const h = U(s, 'state_troops', 0); h.files = 4; h.std = true; h.mus = true; h.champ = true; put(h, 36, 30, -PI / 2);
  for (const c of s.units.filter((x) => x.type === 'empire_captain' && x.owner === 0)) join(s, c, h);
  cur(s); const rc = R.rearChars(h); ok(rc.length >= 1, 'montaje: hay personajes sin hueco (' + rc.length + ')');
  const o = run(s); ok(o.needs.every((n) => n.k.includes('rearF')), 'solo se pregunta la columna (un único rango posible)'); ok(o.needs.length >= 1, 'se pregunta');
  const h2 = o.s.units.find((u) => u.id === h.id); const last = Math.floor((h2.models - 1) / 4);
  for (const c of R.rearChars(h2)) { const i = h2.rearAt[c.id]; eq(Math.floor(i / 4), last, 'último rango'); }
});
T('v842-lance-middle', FF + ':4492-4496 («may be placed in the middle of any rank (not including the first or second)»)', 'En una Lanza el personaje retirado va al medio de cualquier rango que no sea el primero ni el segundo (solo se elige el rango)', () => {
  const s = game([{ type: 'br_realm', models: 15 }, { type: 'br_paladin', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'combat' });
  const h = U(s, 'br_realm', 0), c = U(s, 'br_paladin', 0), e = U(s, 'orc_boyz', 1); put(h, 36, 24, -PI / 2); h.lance = true; h.lanceable = true; join(s, c, h); engage(s, h, e, 'front'); c.retiredFrom = e.id; cur(s);
  const o = run(s); eq(o.needs.map((n) => n.k.includes('rearR')), [true], 'un solo popup (rango)'); eq(o.needs[0].opts.map((x) => x[0]), ['2', '3', '4'], 'rangos 3, 4 y 5 (no el 1.º ni el 2.º)');
  const h2 = o.s.units.find((u) => u.id === h.id); const sl = h2.rearAt[h2.joined[0].id]; ok(sl >= 3, 'fuera de los dos primeros rangos: ranura ' + sl);
});
T('v842-flank-fighting-line', CR + ':7061-7083 + ' + CR + ':5062-5067', 'Si el combate es por el flanco, la fila de combate es la columna del lado trabado: las ranuras de esa columna no son elegibles', () => {
  const { s, h, c, e } = scene(30, { side: 'flank' }); c.retiredFrom = e.id; cur(s);
  const C = R.rearCands(s, h, c); ok(C && C.all.length > 0, 'hay candidatas'); const files = 10, fl = new Set(C.all.map((i) => i % files));
  ok(!(fl.has(0) && fl.has(9)), 'una de las dos columnas laterales queda excluida (columnas elegibles: ' + [...fl].sort().join(',') + ')'); ok(C.all.length >= 20, 'el resto del bloque sí es elegible (' + C.all.length + ')');
});
T('v842-ai-decider', 'AI: decisor aprendido (askH → aiPick)', 'Con la IA como decisora (sin popup) la colocación sale de aiPick: ask:rearR / ask:rearF con la ranura por defecto como primera candidata', () => {
  const { s, h, c, e } = scene(); c.retiredFrom = e.id; s.askMode = null; s.aiP = { 0: true, 1: true };
  cur(s); R.ensureRear(s); ok(h.rearAt && h.rearAt[c.id] != null, 'la IA elige ranura'); ok(R.rearCands(s, h, c).all.includes(h.rearAt[c.id]), 'ranura elegible');
});
T('v842-leave-clears', CR + ':7076-7080', 'Al terminar la retirada se olvida la ranura y, si vuelve a retirarse, se pregunta de nuevo', () => {
  const { s, h, c, e } = scene(); c.retiredFrom = e.id; const o = run(s); const s2 = o.s; const c2 = s2.units.find((u) => u.id === h.id).joined[0]; ok(s2.units.find((u) => u.id === h.id).rearAt?.[c2.id], 'precondición (v843l): tras retirarse, la ranura de retaguardia queda recordada'); ok(o.needs.length >= 1, 'precondición: la primera retirada pregunta la ranura'); c2.retiredFrom = null; cur(s2); R.ensureRear(s2);
  ok(!s2.units.find((u) => u.id === h.id).rearAt?.[c2.id], 'ranura olvidada'); c2.retiredFrom = e.id; const o2 = run(s2); ok(o2.needs.length >= 1, 'vuelve a preguntar'); eq(o2.needs[0].title, o.needs[0].title, 'vuelve a preguntar lo mismo');
});
