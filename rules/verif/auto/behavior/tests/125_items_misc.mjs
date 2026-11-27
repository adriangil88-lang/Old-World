// v838 — Objetos con hechizo atado y pociones: se comprueba lo que el texto promete contra el motor
import { T, N, R, DATA, ok, eq, cur, diceAll, game, U, put, engage } from '../lib3.mjs';
import { wearAny, carrierOf, UNC } from './_items.mjs';
const { ITEMS, SPELLS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
for (const key of UNC()) {
  const it = ITEMS[key], txt = it.text || '';
  if (it.boundSpell) { const pl = /Nivel de Poder (\d)/.exec(txt); T('v838-it-bs-' + key, FILE, `${it.name}: hechizo atado ${it.boundSpell}${pl ? ' (NP ' + pl[1] + ')' : ''}`, () => { const w = wearAny(key); ok(SPELLS[it.boundSpell] || DATA.SPELLS_LEGACY?.[it.boundSpell], 'el hechizo existe'); ok(R.spellKeys(w.u).includes(it.boundSpell), 'el portador dispone del hechizo atado: ' + R.spellKeys(w.u).join(',')); if (pl) eq(it.boundPL, +pl[1], 'Nivel de Poder del dato = texto'); const b = wearAny(null, { type: w.type, stdType: w.type, likeKey: key }); ok(!R.spellKeys(b.u).includes(it.boundSpell) || DATA.UNITS[w.type].wizard, 'control: sin el objeto no lo tiene'); }); }
  if (it.potion && /\+D3 (Ataques|a la Resistencia|a la Iniciativa)|recupera D3|Inmune a la psicología/.test(txt)) T('v838-it-pot-' + key, FILE, `${it.name}: poción ${it.potion}`, () => {
    const run = (drink) => { const w = wearAny(key); const { s, u, e } = w; s.phase = 'strategy'; s.active = 0; cur(s); if (it.potion === 'H') u.wounds = Math.max(1, u.wounds - 3); const w0 = u.wounds; if (drink) { diceAll(3); const r = R.apply(s, { t: 'drink', id: u.id, k: key }); ok(r.ok, 'beber: ' + (r.error || r.reason)); } cur(s); const P = R.attackProfile(u, e); return { atk: P.atk, I: R.effI(u, [e]), wounds: u.wounds, w0, fx: (u.fx || []).map((f) => f.k).join(), T: (() => { cur(s); diceAll(4); return R.woundAndSave(s, u, 1, 4, 10, { noArmour: true, noRegen: true, noWard: true }).through; })() }; };
    const a = run(true), b = run(false);
    if (it.potion === 'A') ok(a.atk - b.atk > 0 && a.atk - b.atk <= 3, `+D3 Ataques (${b.atk} → ${a.atk})`); else if (it.potion === 'I') ok(a.I - b.I > 0, `+D3 Iniciativa (${b.I} → ${a.I})`); else if (it.potion === 'H') ok(a.wounds > a.w0, `recupera heridas (${a.w0} → ${a.wounds})`); else if (it.potion === 'T') ok(a.T < b.T, `con +D3 R el impacto F4 ya no hiere (${b.T} → ${a.T})`); else if (it.potion === 'P') ok(/potP/.test(a.fx), 'queda el efecto de inmunidad: ' + a.fx);
  });
}
// «Conoce un hechizo más»: el portador (mago) tiene un hechizo más que sin el objeto
for (const key of UNC()) {
  const it = ITEMS[key], txt = it.text || ''; if (!(it.extraSpell || it.xspell) || !/[Cc]onoce un hechizo más/.test(txt) || !it.wiz) continue;
  const type = carrierOf(it); if (!DATA.UNITS[type].wizard) continue;
  T('v838-it-xs-' + key, FILE, `${it.name}: conoce un hechizo más`, () => { const a = wearAny(key), b = wearAny(null, { type, stdType: type, likeKey: key }); eq(a.u.spells.length - b.u.spells.length, 1, `hechizos ${b.u.spells.length} → ${a.u.spells.length}`); });
}
