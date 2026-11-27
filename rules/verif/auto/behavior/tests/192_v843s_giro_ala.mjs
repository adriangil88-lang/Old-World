// v843s (punto 14) — unidades amigas desplegadas contiguas pueden maniobrar; el desplazamiento diagonal NO es «camino bloqueado» sino maniobra ilegal; el bloqueo real nombra a la unidad
import { T, R, GEOM, ok, eq } from '../lib.mjs';
function setup(gap) {
  const s = R.createGame({ seed: 7, armies: [[{ type: 'state_troops', models: 25 }, { type: 'state_troops', models: 20 }], [{ type: 'orc_boyz', models: 25 }]], factions: ['empire', 'orcs'], limit: 4000, scn: 'glory' });
  for (const p of [0, 1]) R.apply(s, { t: 'ready', player: p });
  for (let g = 0; g < 30 && !(s.phase === 'move' && s.active === 0); g++) R.apply(s, { t: 'endPhase' });
  const [A, B] = s.units.filter((x) => x.owner === 0); B.y = A.y; B.face = A.face; B.x = A.x + GEOM.dims(A).w / 2 + GEOM.dims(B).w / 2 + gap; R.__setCUR?.(s);
  return { s, A, B };
}
const to = (u, dist, ang, df) => ({ x: u.x + Math.cos(u.face + ang * Math.PI / 180) * dist, y: u.y + Math.sin(u.face + ang * Math.PI / 180) * dist, face: u.face + df });
T('v843s-giro-unidades-contiguas', 'Core p.124 y FAQ Core p.21 (borde delantero no atraviesa unidades)', 'Dos unidades amigas pegadas (0,4") pueden avanzar en línea recta y ninguna maniobra legal sale como «Camino bloqueado»', () => {
  const { s, A, B } = setup(0.4);
  for (const u of [A, B]) { const r = R.previewMove(s, u.id, to(u, 3, 0, 0), false, false); ok(r.ok, 'avance recto de ' + u.id + ': ' + r.reason); }
  for (const u of [A, B]) for (const [d, a, f] of [[1, 0, 0.2], [2, 10, 0.1], [0.5, -10, -0.2]]) { const r = R.previewMove(s, u.id, to(u, d, a, f), false, false); ok(!/Camino bloqueado: al girar/.test(r.reason || ''), 'falso bloqueo ' + r.reason); }
});
T('v843s-giro-diagonal-excede', 'rules.js previewMove', 'Un desplazamiento lateral pequeño sin avanzar exige un giro de ala enorme: el mensaje es «Maniobra demasiado larga», no «Camino bloqueado»', () => {
  const { s, A } = setup(5);
  const r = R.previewMove(s, A.id, to(A, 0.5, -40, 0), false, false);
  ok(!r.ok && r.tooLong && /Maniobra demasiado larga/.test(r.reason) && /Core p\.124/.test(r.reason), r.reason);
});
T('v843s-giro-bloqueo-real', 'FAQ Core p.21', 'Si el borde delantero atraviesa de verdad a una unidad (solapada), el bloqueo nombra a esa unidad y la devuelve en `blocker`', () => {
  const { s, A, B } = setup(-0.05); let hit = null;
  for (const u of [A, B]) for (const dist of [2, 3]) for (let a = -20; a <= 20 && !hit; a += 10) for (const f of [-0.4, -0.2, 0, 0.2, 0.4]) { const r = R.previewMove(s, u.id, to(u, dist, a, f), false, false); if (r.blocker) { hit = { r, u }; break; } }
  ok(hit, 'debe existir algún giro bloqueado por la unidad vecina solapada');
  ok(hit.r.blocker && /atravesaría a «/.test(hit.r.reason) && /FAQ Core p\.21/.test(hit.r.reason), hit.r.reason);
  ok([A.id, B.id].includes(hit.r.blocker) && hit.r.blocker !== hit.u.id, 'el bloqueador es la otra unidad');
});
