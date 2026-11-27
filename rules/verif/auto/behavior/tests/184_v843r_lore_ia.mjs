// v843r (punto A.2) — el Saber del Mago de la IA es una decisión del decisor aprendido (acción loreSet, a ciegas) y se lee con las caras ya tiradas (Core p.106-107)
import { T, R, DATA, game, U, ok, eq } from '../lib2.mjs';
import fs from 'fs';
const AI = fs.readFileSync('/home/claude/tow/app/js/ai.js', 'utf8');
const mk = (lore) => { const s = game([{ type: 'emp_wizard_l2', models: 1, ...(lore ? { lore } : {}) }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.ready = [false, false]; return s; };
const wizId = () => Object.keys(DATA.UNITS).find((k) => DATA.UNITS[k].wizard && DATA.UNITS[k].faction === 'empire' && DATA.UNITS[k].wizard.level >= 2) || 'emp_wizard_l2';
T('v843r-lore-ia-decision-registrada', 'ai.js optionGroups', 'La elección de Saber de la IA está registrada como grupo del decisor aprendido (clave lo + id, acción loreSet a ciegas)', () => {
  ok(/key: 'lo' \+ c\.id/.test(AI) && /t: 'loreSet'/.test(AI) && /blind: 1/.test(AI), 'grupo lo en optionGroups');
  ok(/best\.blind \? \{ \.\.\.best, blind: undefined \}/.test(AI), 'la acción real no es a ciegas');
});
T('v843r-lore-ia-loreset', 'rules.js apply loreSet', 'loreSet cambia el Saber y lee las MISMAS caras tiradas en la tabla del nuevo Saber; a ciegas no usa las caras reales; nunca tras empezar a lanzar', () => {
  const k = wizId(); const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.ready = [false, false];
  const u = U(s, k, 0);
  ok(u.loreAlt && u.spellAlt?.faces, 'el Mago sin Saber fijado en la lista guarda las caras: ' + JSON.stringify(u.loreAlt));
  const faces = [...u.loreAlt.faces], from = u.lore, to = u.loreAlt.opts.find((l) => l !== from);
  const rolls0 = [...u.spellAlt.rolls];
  ok(faces.every((f, i) => DATA.LORES[from].pool[f - 1] === rolls0[i]), 'las caras reproducen las tiradas');
  const s2 = structuredClone(s), u2 = U(s2, k, 0);
  const r = R.apply(s2, { t: 'loreSet', id: u2.id, lore: to }); ok(r.ok, 'loreSet válido: ' + r.error);
  ok(u2.lore === to && faces.every((f, i) => u2.spellAlt.rolls[i] === DATA.LORES[to].pool[f - 1]), 'mismas caras en el nuevo Saber');
  ok(u2.spells[0] === DATA.LORES[to].sig && u2.spells.length === u.spells.length, 'firma del nuevo Saber + resto de tiradas (mismo número de hechizos)');
  ok(!u2.loreAlt, 'solo una vez');
  ok(!R.apply(s2, { t: 'loreSet', id: u2.id, lore: from }).ok, 'no se puede repetir');
  // a ciegas: tira caras nuevas en la copia (no las reales)
  const s3 = structuredClone(s), u3 = U(s3, k, 0), rr = R.apply(s3, { t: 'loreSet', id: u3.id, lore: to, blind: 1 }); ok(rr.ok, 'blind válido');
  ok(u3.spellAlt.faces.length === faces.length && new Set(u3.spellAlt.faces).size === faces.length, 'caras nuevas sin repetidos');
  // el Saber inválido o fijado por el jugador no se ofrece
  ok(!R.apply(structuredClone(s), { t: 'loreSet', id: u.id, lore: 'nonexistent' }).ok, 'Saber inválido');
  const sp = game([{ type: k, models: 1, lore: from }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); ok(!U(sp, k, 0).loreAlt, 'si el jugador fijó el Saber en la lista, no hay decisión');
});
T('v843r-lore-ia-orden-spellpick', 'rules.js loreSet+spellPick', 'La elección del Saber y del descarte (firma) no dependen del orden', () => {
  const k = wizId(); const mk2 = () => { const s = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s.ready = [false, false]; return s; };
  const a = mk2(), ua = U(a, k, 0), to = ua.loreAlt.opts.find((l) => l !== ua.lore), drop = ua.spellAlt.rolls[0];
  R.apply(a, { t: 'spellPick', id: ua.id, drop }); R.apply(a, { t: 'loreSet', id: ua.id, lore: to });
  const b = mk2(), ub = U(b, k, 0); R.apply(b, { t: 'loreSet', id: ub.id, lore: to }); const dropB = ub.spellAlt.rolls[0]; R.apply(b, { t: 'spellPick', id: ub.id, drop: dropB });
  eq(JSON.stringify(ua.spells), JSON.stringify(ub.spells), 'mismo resultado en cualquier orden');
});
T('v843r-lore-ia-semilla', 'rules.js createGame', 'Mismos dados: guardar las caras no cambia el estado de la partida (misma semilla = mismas unidades, hechizos y RNG)', () => {
  const k = wizId(), a = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }), b = game([{ type: k, models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' });
  eq(JSON.stringify(U(a, k, 0).spells), JSON.stringify(U(b, k, 0).spells), 'determinista'); eq(a.rng, b.rng, 'rng');
});
