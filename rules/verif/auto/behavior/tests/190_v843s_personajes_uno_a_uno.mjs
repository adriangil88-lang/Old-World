// v843s (punto 7) — despliegue alterno: los personajes se colocan de UNO en UNO (no todos a la vez en la zona)
import { T, R, ok, eq } from '../lib.mjs';
T('v843s-personajes-uno-a-uno', 'rules.js altDoPick/altNext (fase chars)', 'En la fase de personajes cada altPick coloca UN personaje; el jugador sigue hasta colocar todos los suyos y después le toca al rival', () => {
  const s = R.createGame({ seed: 11, armies: [[{ type: 'state_troops', models: 20 }, { type: 'empire_general', models: 1 }, { type: 'empire_mage', models: 1 }], [{ type: 'orc_boyz', models: 20 }, { type: 'orc_warboss', models: 1 }]], factions: ['empire', 'orcs'], limit: 4000, scn: 'glory', alt: true });
  ok(s.alt, 'despliegue alterno'); let g = 0;
  while (s.alt.phase !== 'chars' && s.alt.phase !== 'done' && g++ < 80) { const d = s.alt; let r; if (d.phase === 'fsel') r = R.apply(s, { t: 'altFlankOk', player: d.ok[0] ? 1 : 0 }); else if (d.phase === 'zone') r = R.apply(s, { t: 'altZone', player: d.win, swap: false }); else if (d.phase === 'first') r = R.apply(s, { t: 'altFirst', player: d.win, first: 0 }); else r = R.apply(s, { t: 'altAuto', player: d.turn }); if (!r.ok) break; }
  eq(s.alt.phase, 'chars', 'se llega a la fase de personajes');
  const p = s.alt.turn, mine = R.altPend(s, p).filter((u) => R.D(u).cat === 'char'); ok(mine.length >= 1, 'personajes por colocar');
  const before = s.units.length, r = R.apply(s, { t: 'altPick', player: p, id: mine[0].id }); ok(r.ok, r.error);
  eq(s.units.length, before + 1, 'solo UN personaje entra a la mesa'); eq(s.alt.cur.length, 1, 'un personaje en curso');
  R.apply(s, { t: 'altDone', player: p });
  if (mine.length > 1) eq(s.alt.turn, p, 'el mismo jugador sigue con sus personajes'); else ok(s.alt.turn !== p || s.alt.phase !== 'chars', 'pasa al rival');
});
