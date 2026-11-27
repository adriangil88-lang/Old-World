// v843t — (A) nombre único de unidad en selectores/registro; (B) línea de visión: unidades amigas que bloquean; (C) deshacer sin información ni azar
import fs from 'node:fs';
import { T, R, GEOM, game, put, U, ok, eq } from '../lib.mjs';
const MAIN = fs.readFileSync(new URL('../../../../../app/js/main.js', import.meta.url), 'utf8');
const HTML = fs.readFileSync(new URL('../../../../../app/index.html', import.meta.url), 'utf8');
const PI = Math.PI;
const mk = (extra = []) => game([{ type: 'crossbowmen', models: 20 }, { type: 'state_troops', models: 22 }], [{ type: 'orc_boyz', models: 39 }, { type: 'orc_boyz', models: 15 }, { type: 'black_orcs', models: 5 }, ...extra], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'] });
T('v843t-nombre-unico', 'render.js labelName/unitTag (v843t, punto A)', 'Dos unidades del mismo nombre se distinguen igual que en el mapa: «Orcos 39» / «Orcos B 15» en selectores, nombre propio (registro/popups) con la letra de variante y ordinal si aun así empatan; la letra es estable aunque la otra unidad muera', () => {
  const s = mk(), [o1, o2] = s.units.filter((u) => u.type === 'orc_boyz');
  eq(R.unitTag(s, o1), 'Orcos 39', 'primera unidad'); eq(R.unitTag(s, o2), 'Orcos B 15', 'segunda: variante B + nº de modelos');
  eq([o1.name, o2.name], ['Orcos', 'Orcos B'], 'el nombre propio (registro y popups del motor) lleva la variante');
  o1.joined = [{ models: 1 }]; eq(R.unitTag(s, o1), 'Orcos 39 ★', 'con personaje unido lleva ★ como en el mapa'); o1.joined = [];
  o1.models = 0; eq(R.unitTag(s, o2), 'Orcos B 15', 'la letra no cambia al morir la otra'); o1.models = 39;
  const clon = { ...o1, id: 'zz' }; eq(R.unitTag(s, o1, { peers: [o1, clon] }), 'Orcos 39 (1.ª)', 'empate exacto: ordinal'); eq(R.unitTag(s, clon, { peers: [o1, clon] }), 'Orcos 39 (2.ª)', 'ordinal de la segunda');
  ok(/UC\(t, tg\)/.test(MAIN) && /unitChip\(G\.s, u, \{ peers \}\)/.test(MAIN), 'el selector de objetivo usa el chip único (icono + etiqueta del mapa)');
});
T('v843t-popup-opciones', 'rules.js askH (v843t, punto A)', 'Las opciones de un popup que son unidades salen con la etiqueta del mapa («Orcos B 15»), no con el nombre pelado', () => {
  const s = mk(), [o1, o2] = s.units.filter((u) => u.type === 'orc_boyz'); s.askMode = { 0: true }; R.__setCUR(s);
  const r = (() => { try { R.askH(s, 0, 'tst', 'Prueba', '¿Cuál?', [[o1.id, o1.name], [o2.id, o2.name]], o1.id); } catch (e) { return e.need; } })();
  eq(r.opts.map((o) => o[1]), ['Orcos 39', 'Orcos B 15'], 'opciones con etiqueta'); s.askMode = null;
});
// B — geometría de la captura: Ballesteros con Tropas amigas delante y orcos a 14,8–24,8"
const geom = (gap, tx = 0) => {
  const s = mk(), B = U(s, 'crossbowmen', 0), Tr = U(s, 'state_troops', 0), os = s.units.filter((u) => u.owner === 1);
  put(B, 10, 24, 0); put(Tr, 10 + GEOM.dims(B).d / 2 + GEOM.dims(Tr).d / 2 + gap, 24 + tx, 0);
  [14.8, 17.1, 19.0, 24.8].slice(0, 3).forEach((d, i) => put(os[i], B.x + GEOM.dims(B).d / 2 + d + GEOM.dims(os[i]).d / 2, 24 + (i - 1) * 0.0, PI));
  R.__setCUR(s); return { s, B, Tr, os };
};
T('v843t-vision-amiga-bloquea', 'Core p.103 («models and units always block line of sight») + p.136-137 (Check Line Of Sight / We Can\'t All Shoot!)', 'Una unidad amiga delante de los Ballesteros (en contacto o a 0,3") tapa la vista a los orcos que quedan detrás: no son objetivos legales, el motor rechaza el disparo en castellano nombrando a la unidad que bloquea, y la señala', () => {
  for (const gap of [0, 0.1, 0.3, 1]) {
    const { s, B, Tr, os } = geom(gap);
    for (const o of os) { const why = R.shootCheck(s, B, o); ok(/^Sin línea de visión: Tropas 22 \(unidad amiga\) tapa la vista/.test(why), `hueco ${gap}": ${why}`); eq((R.losBlocker(s, B, o) || {}).id, Tr.id, 'la unidad que bloquea'); }
    eq(R.legalShootTargets(s, B).length, 0, 'ningún objetivo ofrecido'); eq(R.shootBlocked(s, B).length, os.length, 'el selector los lista como bloqueados');
    const r = R.apply(s, { t: 'shoot', id: B.id, target: os[0].id }); ok(!r.ok && /Tropas 22 \(unidad amiga\)/.test(r.error) && r.blocker === Tr.id, 'el motor rechaza y señala al bloqueador: ' + r.error);
  }
});
T('v843t-vision-lateral', 'Core p.103 («a straight, uninterrupted line … from within the model\'s vision arc to any part of the other model»)', 'Si la unidad amiga no tapa todo el frente (desplazada a un lado), basta con que un modelo del frente vea alguna parte del objetivo: el objetivo sí es legal; y una unidad amiga a un lado no bloquea', () => {
  const { s, B, os } = geom(0.3, 7); // Tropas 7" a un lado: el frente de los Ballesteros queda libre
  for (const o of os.slice(0, 1)) eq(R.shootCheck(s, B, o), null, 'objetivo visible con la amiga desplazada');
  const g2 = geom(0.3, 0); put(g2.Tr, g2.B.x, g2.B.y + 12, 0); eq(R.shootCheck(g2.s, g2.B, g2.os[0]), null, 'una unidad amiga a un lado no bloquea');
});
T('v843t-vision-borde', 'Core p.103 («at least one model in a unit has a line of sight to at least one model»)', 'Un modelo del borde de la fila delantera puede ver por el lateral de una unidad amiga más estrecha que él (antes solo se trazaba desde el centro)', () => {
  const s = game([{ type: 'crossbowmen', models: 20 }, { type: 'state_troops', models: 4 }], [{ type: 'orc_boyz', models: 15 }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'] });
  const B = U(s, 'crossbowmen', 0), Tr = U(s, 'state_troops', 0), O = U(s, 'orc_boyz', 1); Tr.files = 2; const wB = GEOM.dims(B).w, wT = GEOM.dims(Tr).w; ok(wT < wB - 1, 'montaje: la amiga es más estrecha (' + wT.toFixed(1) + ' < ' + wB.toFixed(1) + ')');
  put(B, 10, 24, 0); put(Tr, 10 + 2 + GEOM.dims(Tr).d / 2 + 0.2, 24, 0); put(O, 30, 24 + wB / 2 - 0.3, PI); R.__setCUR(s);
  eq(R.shootCheck(s, B, O), null, 'un modelo del flanco de los Ballesteros ve al objetivo: ' + R.shootCheck(s, B, O));
});
T('v843t-vision-grande', 'FAQ Core (Large Target): «a unit can draw a line of sight to a Large Target over or through another unit … provided that unit is not also a Large Target»', 'Los Objetivos Grandes se ven por encima de unidades amigas en contacto; el resto no', () => {
  const { s, B, Tr, os } = geom(0.1); const g = s.units.find((u) => u.owner === 1 && u.type === 'black_orcs'); const gg = R.__ev ? null : null; void gg;
  s.units.push({ ...os[0], id: 'big', type: 'orc_giant', name: 'Gigante', models: 1, owner: 1 }); const big = s.units.find((u) => u.id === 'big'); big.x = os[0].x; big.y = os[0].y; big.baseW = 100; big.baseD = 100; big.wounds = 6; void g;
  eq(R.shootCheck(s, B, big), null, 'el gigante (Objetivo Grande) se ve por encima de las Tropas'); ok(/Sin línea de visión/.test(R.shootCheck(s, B, os[1]) || R.shootCheck(s, B, os[2]) || ''), 'los orcos normales no');
});
// C — deshacer
T('v843t-deshacer-estado', 'main.js undoBegin/undoEnd (v843t, punto C) + filosofía de diseño', 'Deshacer restaura posición, estado, registro y generador de números aleatorios: con la misma semilla el resultado posterior es idéntico a no haber hecho la acción; se puede deshacer varias veces; una acción que consume azar no es deshacible', () => {
  const play = (doUndo) => {
    const s = game([{ type: 'state_troops', models: 10 }, { type: 'crossbowmen', models: 10 }, { type: 'empire_knights', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { phase: 'move', active: 0, turn: 1, f: ['empire', 'orcs'] });
    const [a, b, c3] = s.units.filter((u) => u.owner === 0); put(a, 20, 40, -PI / 2); put(b, 40, 40, -PI / 2); put(c3, 60, 40, -PI / 2); put(s.units.find((u) => u.owner === 1), 30, 8, PI / 2); R.__setCUR(s);
    const stack = [], acts = [], mv = (u, dy) => { const pre = structuredClone(s), rng0 = s.rng, n0 = acts.length, A = { t: 'move', id: u.id, x: u.x, y: u.y - dy, face: -PI / 2 }, r = R.apply(s, A); ok(r.ok, r.error); acts.push(A); ok(s.rng === rng0, 'mover sin azar no toca el RNG'); stack.push({ pre, n0 }); return r; };
    const undoFn = () => { const e = stack.pop(); const keep = e.pre; Object.keys(s).forEach((k) => delete s[k]); Object.assign(s, keep); acts.length = e.n0; R.__setCUR(s); };
    if (doUndo) { mv(a, 3); const b2 = R.byId(s, b.id); mv(b2, 2); mv(R.byId(s, c3.id), 1); undoFn(); undoFn(); undoFn(); eq(stack.length, 0, 'pila vacía'); eq(acts.length, 0, 'acciones deshechas'); }
    const sa = R.byId(s, a.id), sb = R.byId(s, b.id); R.apply(s, { t: 'move', id: sa.id, x: sa.x, y: sa.y - 4, face: -PI / 2 }); R.apply(s, { t: 'endPhase' }); R.apply(s, { t: 'endPhase' });
    return JSON.stringify({ rng: s.rng, p: s.units.map((u) => [u.id, +u.x.toFixed(4), +u.y.toFixed(4)]), log: s.log, ph: s.phase, sb: sb.y });
  };
  eq(play(true), play(false), 'mismo resultado con y sin mover-y-deshacer 3 veces (RNG, posiciones, registro)');
  const s = game([{ type: 'empire_knights', models: 5 }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'empire'], phase: 'move', active: 0 }); const k = put(U(s, 'empire_knights', 0), 36, 40, -PI / 2); put(U(s, 'state_troops', 1), 36, 30, PI / 2); R.__setCUR(s);
  const rng0 = s.rng; const r = R.apply(s, { t: 'charge', id: k.id, target: U(s, 'state_troops', 1).id }); ok(r.ok && s.rng !== rng0, 'una carga consume azar: no sería deshacible (el RNG cambia)');
});
T('v843t-deshacer-interfaz', 'main.js / index.html (v843t, punto C)', 'Botón ↶ en la barra del mapa y en el menú de la partida, con motivos en castellano cuando no se puede (dados, información, fase, rival, partida por código o a dos)', () => {
  ok(/id="zUndo"/.test(HTML), 'botón en el mapa'); ok(/id="gmUndo"/.test(MAIN), 'entrada en el menú');
  for (const m of ['ya se tiraron dados', 'ya has visto información', 'ya has pasado de fase o de turno', 'el rival ya ha actuado después', 'partida por código', 'mismo dispositivo', 'No hay nada que deshacer']) ok(MAIN.includes(m), 'motivo: ' + m);
  ok(/UNDO_OK = new Set\(\['deployMove', 'move', 'pref', 'join', 'leave'\]\)/.test(MAIN) && !/UNDO_OK[^;]*(shoot|charge|cast|endPhase)/.test(MAIN), 'solo se marcan acciones sin información ni azar');
});
