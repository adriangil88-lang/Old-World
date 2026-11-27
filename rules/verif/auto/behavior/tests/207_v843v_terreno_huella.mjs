// v843v (punto 1c) — terreno por la huella real de cada modelo (Core p.103 «Arboreal Gloom» y colinas), no por su centro
import { T, R, GEOM, game, put, U, ok, eq } from '../lib2.mjs';
const PI = Math.PI;
const mk = (fx0) => {
  const s = game([{ type: 'crossbowmen', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'], terrain: [{ id: 'f1', kind: 'forest', x: fx0 + 6, y: 24, w: 12, h: 14 }] });
  const A = U(s, 'crossbowmen', 0), B = s.units.find((u) => u.owner === 1); put(A, 10, 24, 0); put(B, 26, 24, PI); R.__setCUR(s); return { s, A, B };
};
T('v843v-terreno-huella-tirador', 'Core p.103 «Arboreal Gloom»: «if neither model is within the wood…»; «within» = dentro del borde del elemento', 'Un tirador cuyo CENTRO está fuera del bosque pero cuya peana lo solapa está dentro del bosque: el bosque no le tapa la vista. Si no lo toca, el bosque sí la tapa', () => {
  const d = GEOM.dims(mk(20).A).d / 2; // borde delantero del tirador = 10 + d
  const tocando = mk(10 + d - 0.3); // el bosque empieza (fx0+6-6) = 10+d-0.3: solapa 0,3" la peana
  const A = tocando.A; ok(A.x < 10 + d - 0.3, 'el centro del tirador queda fuera del bosque');
  eq(R.shootCheck(tocando.s, tocando.A, tocando.B), null, 'con la peana dentro del bosque ve al objetivo');
  const fuera = mk(10 + d + 0.3); ok(/bosque|Sin línea de visión/i.test(R.shootCheck(fuera.s, fuera.A, fuera.B) || ''), 'con la peana fuera, el bosque tapa: ' + R.shootCheck(fuera.s, fuera.A, fuera.B));
});
T('v843v-terreno-huella-objetivo', 'Core p.103 «Arboreal Gloom» (objetivo)', 'Un objetivo con parte de la peana dentro del bosque está «dentro» y se ve a través; un objetivo cuya peana no toca el bosque queda tapado', () => {
  const s0 = mk(16); const B = s0.B; const dB = GEOM.dims(B).d / 2;
  const f = s0.s.terrain[0]; // bosque x de 10+..; recolocamos el borde derecho para solapar 0,3" la peana trasera del objetivo
  f.x = B.x - dB + 0.3 - 6; R.__setCUR(s0.s); eq(R.shootCheck(s0.s, s0.A, B), null, 'peana del objetivo solapa el bosque: visible');
  f.x = B.x - dB - 0.3 - 6; R.__setCUR(s0.s); ok(R.shootCheck(s0.s, s0.A, B), 'peana fuera del bosque: tapado por el bosque');
});
