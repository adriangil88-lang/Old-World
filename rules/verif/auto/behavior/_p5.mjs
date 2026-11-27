import { R, GEOM, game, put, U } from './lib2.mjs';
const PI = Math.PI;
function mk(kM, sp, kOwner) {
  const s = game([{ type: 'crossbowmen', models: 10 }, { type: 'emp_archers', models: kM }], [{ type: 'orc_boyz', models: 1 }, { type: 'orc_boyz', models: kM }], { phase: 'shoot', active: 0, turn: 2, f: ['empire', 'orcs'] });
  const B = U(s, 'crossbowmen', 0), K = U(s, 'emp_archers', 0), [O, E2] = s.units.filter((u) => u.owner === 1); K.files = kM; K.sp = sp; O.models = 1; O.files = 1;
  put(B, 10, 24, 0); put(O, 30, 24, PI); put(K, 40, 24, 0); put(E2, 11.5 + GEOM.dims(E2).d / 2, 24, PI); E2.files = kM; R.__setCUR(s); return { s, B, K, O, E2 };
}
{ const { s, B, O, E2 } = mk(10, 0); console.log('E2 w', GEOM.dims(E2).w, GEOM.dims(E2).d, 'adj enemy blocks O:', R.shootCheck(s, B, O), '| E2 target:', R.shootCheck(s, B, E2), '| blocker', (R.losBlocker(s, B, O) || {}).name); }
{ const { s, B, K, O } = mk(5, 1); put(K, 30, 24, 0); put(O, 12, 24 + 6, 0); put(B, 20, 24, 0); R.__setCUR(s); console.log('F: K sees target behind', R.shootCheck(s, K, O), '| B (not skirm) toward', R.shootCheck(s, B, O)); put(B, 20, 24 + 6, 0); R.__setCUR(s); console.log('F2: B between', R.shootCheck(s, K, O), (R.losBlocker(s,K,O)||{}).name); }
