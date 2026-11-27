// v843s (punto 3) — el jugador elige el Saber ANTES de la tirada (loreSet con keep: puede cambiar varias veces); las caras de la semilla se leen en la tabla del Saber elegido; la decisión se cierra con spellPick
import { T, R, DATA, game, U, ok, eq } from '../lib2.mjs';
const wizId = () => Object.keys(DATA.UNITS).find((k) => DATA.UNITS[k].wizard && DATA.UNITS[k].faction === 'empire' && DATA.UNITS[k].wizard.level >= 2) || 'emp_wizard_l2';
T('v843s-saber-humano-varias-veces', 'rules.js loreSet (keep) + spellPick (done)', 'Con keep el Saber se puede cambiar varias veces antes de tirar; las caras son las mismas y la tabla cambia; al decidir la firma queda spellAlt.done', () => {
  const k = wizId(); const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.ready = [false, false];
  const u = U(s, k, 0); ok(u.loreAlt && u.loreAlt.opts.length > 1, 'hay varios Saberes');
  const faces = [...u.loreAlt.faces], [a, b, c] = [u.lore, ...u.loreAlt.opts.filter((l) => l !== u.lore)];
  for (const to of [b, c || a, a]) { const r = R.apply(s, { t: 'loreSet', id: u.id, lore: to, keep: 1 }); ok(r.ok, 'loreSet ' + to + ': ' + r.error); ok(u.loreAlt, 'sigue la elección abierta'); ok(u.lore === to && faces.every((f, i) => u.spellAlt.rolls[i] === DATA.LORES[to].pool[f - 1]), 'caras en la tabla de ' + to); }
  const r2 = R.apply(s, { t: 'spellPick', id: u.id, drop: 'sig' }); ok(r2.ok && u.spellAlt.done === 1, 'decisión cerrada');
  eq(u.spells, [...u.spellAlt.rolls], 'conserva las tiradas');
});
T('v843s-saber-orden-igual', 'rules.js loreSet', 'Elegir el Saber (keep) y luego descartar por la firma da lo mismo que decidirlo sin pasos intermedios', () => {
  const k = wizId(); const mk = () => { const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.ready = [false, false]; return s; };
  const s1 = mk(), u1 = U(s1, k, 0), to = u1.loreAlt.opts.find((l) => l !== u1.lore);
  R.apply(s1, { t: 'loreSet', id: u1.id, lore: to, keep: 1 }); R.apply(s1, { t: 'loreSet', id: u1.id, lore: u1.lore === to ? to : to, keep: 1 }); R.apply(s1, { t: 'spellPick', id: u1.id, drop: u1.spellAlt.rolls[0] });
  const s2 = mk(), u2 = U(s2, k, 0); R.apply(s2, { t: 'loreSet', id: u2.id, lore: to }); R.apply(s2, { t: 'spellPick', id: u2.id, drop: u2.spellAlt.rolls[0] });
  eq(u1.spells, u2.spells, 'mismos hechizos');
});
