// v838 — Objetos mágicos: armaduras (valor de armadura efectivo del portador comparado con el texto)
import { T, N, R, DATA, ok, eq, cur, diceAll } from '../lib3.mjs';
import { wearItem, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
// mejor tirada con la que la salvación por armadura del portador falla (1..6): el valor de armadura efectivo es X+ si 1..X-1 fallan
const armour = (w, ctx = {}) => { for (let v = 2; v <= 6; v++) { cur(w.s); diceAll(v); const r = R.woundAndSave(w.s, w.u, 1, 10, 0, { noRegen: true, noWard: true, ...ctx }); if (r.through === 0) return v; } return 7; };
const WORD = { ligera: 6, pesada: 5, completa: 4 };
for (const key of UNC('a')) {
  const it = ITEMS[key], txt = it.text || ''; const mw = /Armadura (ligera|pesada|completa)/i.exec(txt), mn = /Armadura (\d)\+/i.exec(txt);
  const base = mw ? WORD[mw[1].toLowerCase()] : mn ? +mn[1] : null; const shield = /\+1 (?:a la )?armadura|Escudo|escudo/.test(txt) && it.svb;
  if (it.sv && base && it.sv === base) T('v838-it-a-' + key, FILE, `${it.name}: ${mw ? 'Armadura ' + mw[1] : 'Armadura ' + mn[1] + '+'} (${base}+)`, () => { const w = wearItem(key, { naked: true }), b = wearItem(null, { like: w }); const a = armour(w), a0 = armour(b); eq(a0, 7, 'montaje: el portador sin objeto no lleva armadura'); ok(a <= base, `la salvación del portador es ${a}+ (esperado ${base}+ o mejor; sin objeto ${a0}+)`); ok(a < a0 || a0 <= base, `el objeto mejora la armadura del portador (sin objeto ${a0}+, con objeto ${a}+)`); if (it.fixedSv) eq(a, base, 'no puede mejorarse'); });
  else if (it.svb && shield && !it.sv) T('v838-it-a-' + key, FILE, `${it.name}: +${it.svb} a la armadura`, () => { const w = wearItem(key, { naked: true }), b = wearItem(null, { like: w }); const a = armour(w), a0 = armour(b); ok(a === Math.max(2, a0 - it.svb) || a0 - it.svb < 2, `armadura ${a0}+ → ${a}+ (+${it.svb})`); });
}
