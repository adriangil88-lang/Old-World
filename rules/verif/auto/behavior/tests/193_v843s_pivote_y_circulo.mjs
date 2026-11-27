// v843s (puntos 15, 16 y 17) — sentido de los botones de pivote, «Distancia máxima» opt-in y los círculos de movimiento son solo visuales
import fs from 'node:fs';
import { T, R, GEOM, ok, eq } from '../lib.mjs';
const MAIN = fs.readFileSync(new URL('../../../../../app/js/main.js', import.meta.url), 'utf8');
const dm = { w: 10, d: 4 };
const cross = (a, b) => Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b);
T('v843s-pivote-sentido', 'Core p.124 (giro de ala) · geom.js wheelPivot', 'Izquierda = antihorario visto desde arriba (la izquierda de la unidad) desde el primer toque, mirando a +x, −x, +y y −y; el pivote es la esquina delantera del lado pulsado y no se mueve', () => {
  for (const face of [0, Math.PI, Math.PI / 2, -Math.PI / 2]) for (const side of ['L', 'R']) {
    let g = { x: 20, y: 20, face };
    for (let k = 0; k < 2; k++) { // dos toques seguidos: el primero ya gira bien
      const W = GEOM.wheelPivot(g, dm, side), turn = cross(g.face, W.face);
      // eje y hacia abajo: sin(Δ) < 0 = el rumbo disminuye = antihorario visto desde arriba = izquierda
      ok(side === 'L' ? turn < 0 && W.face < g.face : turn > 0 && W.face > g.face, `${side} desde rumbo ${face} toque ${k + 1}: Δ=${(W.face - g.face).toFixed(3)}`);
      const before = GEOM.corners({ ...g, ...dm, files: undefined }), fwd = { x: Math.cos(g.face), y: Math.sin(g.face) };
      const left = { x: Math.sin(g.face), y: -Math.cos(g.face) }; // izquierda de la unidad
      const Cv = { x: W.C.x - g.x, y: W.C.y - g.y };
      ok((Cv.x * left.x + Cv.y * left.y > 0) === (side === 'L'), 'el pivote está en el lado ' + side + ' de la unidad');
      ok(Cv.x * fwd.x + Cv.y * fwd.y > 0, 'el pivote es una esquina delantera');
      // la esquina pivote no se mueve
      const C2 = { x: W.x + Math.cos(W.face) * dm.d / 2 - Math.sin(W.face) * (side === 'L' ? -1 : 1) * dm.w / 2, y: W.y + Math.sin(W.face) * dm.d / 2 + Math.cos(W.face) * (side === 'L' ? -1 : 1) * dm.w / 2 };
      ok(Math.hypot(C2.x - W.C.x, C2.y - W.C.y) < 1e-9, 'la esquina del pivote queda fija'); void before;
      g = { x: W.x, y: W.y, face: W.face };
    }
  }
});
T('v843s-pivote-motor', 'rules.js previewMove', 'La pose que dibuja el botón de pivote izquierdo/derecho es válida para el motor en terreno libre y gira hacia el lado correcto, para ambos jugadores', () => {
  const s = R.createGame({ seed: 7, armies: [[{ type: 'state_troops', models: 25 }], [{ type: 'orc_boyz', models: 25 }]], factions: ['empire', 'orcs'], limit: 4000, scn: 'glory' });
  for (const p of [0, 1]) R.apply(s, { t: 'ready', player: p });
  for (let g = 0; g < 30 && !(s.phase === 'move' && s.active === 0); g++) R.apply(s, { t: 'endPhase' });
  s.terrain = []; R.__setCUR?.(s);
  const u = s.units.find((x) => x.owner === 0);
  for (const face of [u.face, u.face + Math.PI]) for (const side of ['L', 'R']) {
    u.face = face; u.x = 36; u.y = 24;
    const W = GEOM.wheelPivot({ x: u.x, y: u.y, face }, GEOM.dims(u), side), r = R.previewMove(s, u.id, { x: W.x, y: W.y, face: W.face }, false, false);
    ok(r.ok, `${side} rumbo ${face.toFixed(2)}: ${r.reason}`);
    ok(side === 'L' ? W.face < face : W.face > face, 'sentido');
  }
});
T('v843s-maxdist-optin', 'main.js (punto 15)', 'El modo «Distancia máxima» nace apagado, no se lee de localStorage y se apaga al elegir Mover/Marchar/Reservas', () => {
  ok(/const UI = \{ maxDist: false/.test(MAIN), 'UI.maxDist arranca en false');
  ok(!/tow\.maxDist/.test(MAIN), 'ya no se persiste');
  ok(/if \(act === 'move' \|\| act === 'march' \|\| act === 'reserve'\) \{\s*UI\.maxDist = false;/.test(MAIN), 'se apaga al elegir mover');
});
T('v843s-circulos-visuales', 'rules.js checkPlacement/previewMove (punto 17)', 'El círculo de alcance es solo visual: la validez solo depende de la huella real de las peanas; unas Tropas contiguas a Ballesteros (a 0,3") no bloquean un avance corto ni uno recto aunque queden dentro del radio de movimiento', () => {
  const s = R.createGame({ seed: 7, armies: [[{ type: 'crossbowmen', models: 20 }, { type: 'state_troops', models: 22 }], [{ type: 'orc_boyz', models: 25 }]], factions: ['empire', 'orcs'], limit: 4000, scn: 'glory' });
  for (const p of [0, 1]) R.apply(s, { t: 'ready', player: p });
  for (let g = 0; g < 30 && !(s.phase === 'move' && s.active === 0); g++) R.apply(s, { t: 'endPhase' });
  s.terrain = []; const [A, B] = s.units.filter((x) => x.owner === 0); B.y = A.y; B.face = A.face; B.x = A.x + GEOM.dims(A).w / 2 + GEOM.dims(B).w / 2 + 0.3; R.__setCUR?.(s);
  for (const [u, d] of [[A, 0.2], [A, 3], [B, 0.2], [B, 3]]) { const r = R.previewMove(s, u.id, { x: u.x + Math.cos(u.face) * d, y: u.y + Math.sin(u.face) * d, face: u.face }, false, false); ok(r.ok, `${u.name} avanza ${d}": ${r.reason}`); eq(r.blocker, undefined); }
  ok(!/unitDist|moveRadius|circ/i.test((R.checkPlacement.toString().match(/for \(const o of s\.units\)[\s\S]*?\n  \}/) || [''])[0].replace(/unitDist\(t, o\) < enemyGap/, '')), 'checkPlacement no usa radios de movimiento');
});
