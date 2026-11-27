// v836 — Tarea D (objetos): cada objeto mágico/arma/armadura/talismán cuyo texto fija un efecto numérico incondicional se equipa a un portador
// en el motor y se compara el resultado (salvación especial, armadura, Fuerza, FP, Ataques) con lo que dice el TEXTO.
import { T, N, R, DATA, game, U, ok, eq, cur, put, engage } from '../lib2.mjs';
const { ITEMS } = DATA;
const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
const COND = /[Uu]na vez|Un solo uso|si |Si |contra|solo |Solo |cuando|Cuando|con 6|con un|con 1|mientras|Mientras|hasta|antes de|después|salvo|excepto|repit|en vez|además|por cada|por modelo|montura|monstruo|\bo\b.*\bo\b/;
const wear = (items, o = {}) => { const s = game([{ type: 'emp_engineer', models: 1, items }], [{ type: 'state_troops', models: 20 }], { f: ['empire', 'orcs'] }); const u = U(s, 'emp_engineer', 0), e = U(s, 'state_troops', 1); engage(s, u, e); cur(s); return { s, u, e }; };
const base = wear([]); const P0 = R.attackProfile(base.u, base.e), W0 = R.wardOf(base.u), V0 = R.svOf(base.u);
const SVT = { ligera: 6, pesada: 5, completa: 4 };
for (const [key, it] of Object.entries(ITEMS)) {
  const txt = it.text || '';
  if (!['w', 'a', 't'].includes(it.cat)) continue;
  const plain = !COND.test(txt);
  let did = false;
  if (it.cat === 't' && it.ward && !it.wardMagic && !it.wardShoot && !it.wardFlame) { // talismán: salvación especial
    const m = /Salvación especial (\d)\+/.exec(txt);
    if (m && plain) { did = true; T('v836-it-' + key, FILE, `${it.name}: salvación especial ${m[1]}+`, () => { const w = wear([key]); eq(R.wardOf(w.u), +m[1], 'wardOf del portador'); eq(it.ward, +m[1], 'dato ward = texto'); }); }
  } else if (it.cat === 'a' && (it.sv || it.svb) && plain) { // armadura
    const mt = /Armadura (ligera|pesada|completa)/.exec(txt), esc = /\bEscudo\b/.test(txt) || it.svb;
    if (it.sv && mt) { did = true; T('v836-it-' + key, FILE, `${it.name}: armadura ${mt[1]} (${SVT[mt[1]]}+)`, () => { const w = wear([key]); eq(R.svOf(w.u), SVT[mt[1]] - (esc && it.svb ? 1 : 0), 'svOf del portador sin otra armadura'); }); }
    else if (it.svb && !it.sv && /\+1 armadura/.test(txt)) { did = true; T('v836-it-' + key, FILE, `${it.name}: +1 a la armadura`, () => { const w = wear([key]), b = R.svOf(wear([]).u); eq(R.svOf(w.u), b - 1, 'armadura mejora 1'); }); }
  } else if (it.cat === 'w' && it.rangedI && !/mejora el /.test(txt)) { // arma de disparo del objeto
    const mR = /(\d+)"/.exec(txt), mS = /\bF(\d)\b/.exec(txt), mA = /FP [−-](\d)/.exec(txt);
    if (mR && mS && !COND.test(txt.replace(/contra[^,.;]*/g, ''))) { did = true; T('v836-it-' + key, FILE, `${it.name}: disparo ${mR[1]}" F${mS[1]}${mA ? ' FP −' + mA[1] : ''}`, () => { const w = wear([key]), r = R.rangedOf ? R.rangedOf(w.u) : null; ok(r, 'el portador no dispara con el objeto'); eq(r.range, +mR[1], 'alcance'); eq(r.s, +mS[1], 'Fuerza'); eq(r.ap || 0, mA ? +mA[1] : 0, 'FP'); }); }
  } else if (it.cat === 'w' && plain && !it.chS && !it.chAp) { // arma: F+N, FP −N, Ataques adicionales (+N)
    const mS = /F\+(\d)/.exec(txt), mA = /FP [−-](\d)/.exec(txt), mAt = /Ataques adicionales \(\+(\d)\)|\+(\d) Ataques?/.exec(txt);
    if (mS || mA || mAt) { did = true; T('v836-it-' + key, FILE, `${it.name}: ${mS ? 'F+' + mS[1] + ' ' : ''}${mA ? 'FP −' + mA[1] + ' ' : ''}${mAt ? '+' + (mAt[1] || mAt[2]) + ' Ataques' : ''}`, () => {
      const w = wear([key]), P = R.attackProfile(w.u, w.e); if (mS) eq(P.S - P0.S, +mS[1], 'Fuerza'); if (mA) eq(P.ap - P0.ap, +mA[1], 'FP'); if (mAt) eq(P.atk - P0.atk, +(mAt[1] || mAt[2]), 'Ataques'); });
    }
  }
}
// objetos que conceden reglas especiales («La unidad gana X» / «Causa X»): el motor debe tratar a la unidad/portador como si tuviera la regla
const unitWith = (key) => { const it = ITEMS[key]; const std = it.cat === 's'; const s = game([std ? { type: 'dw_warriors', models: 20 } : { type: 'emp_engineer', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: [std ? 'dw' : 'empire', 'orcs'] }); const u = U(s, std ? 'dw_warriors' : 'emp_engineer', 0); if (std) u.banner = key; else u.items = [key]; cur(s); return u; };
const ctrl = (key) => { const it = ITEMS[key]; const std = it.cat === 's'; const s = game([std ? { type: 'dw_warriors', models: 20 } : { type: 'emp_engineer', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: [std ? 'dw' : 'empire', 'orcs'] }); const u = U(s, std ? 'dw_warriors' : 'emp_engineer', 0); cur(s); return u; };
for (const [key, it] of Object.entries(ITEMS)) {
  if (!it.grant || !Array.isArray(it.grant) || !['s', 'e', 'w', 'a', 't', 'x'].includes(it.cat)) continue;
  if (/si |Si |una vez|Una vez|contra|solo |Solo |mientras|Mientras|hasta/.test(it.text || '')) { continue; /* v840: las concesiones condicionadas se prueban con su condición cumplida y no cumplida en tests/162_v840_grants.mjs */ }
  T('v836-it-grant-' + key, FILE, `${it.name}: concede ${it.grant.join(', ')}`, () => { const u = unitWith(key), c = ctrl(key); for (const r of it.grant) { ok(R.has(u, r), `con el objeto: ${r}`); if (!R.D(c).sr.includes(r)) ok(!R.has(c, r), `control sin objeto no tiene ${r}`); } });
}
// Resistencia a la magia / salvación especial genérica en objetos de cualquier categoría
const wearAny = (key) => { const it = ITEMS[key]; const std = it.cat === 's'; const s = game([std ? { type: 'dw_warriors', models: 20 } : { type: 'emp_engineer', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: [std ? 'dw' : 'empire', 'orcs'] }); const u = U(s, std ? 'dw_warriors' : 'emp_engineer', 0); if (std) u.banner = key; else u.items = [key]; cur(s); return u; };
for (const [key, it] of Object.entries(ITEMS)) {
  const txt = it.text || '';
  const mM = /Resistencia (?:a la )?[Mm]agia \([−-](\d)\)/.exec(txt);
  if (it.mr && mM && !/si |Si |una vez|contra|solo |Solo|hasta/.test(txt.replace(/\(hasta 3, se acumulan\)/, ''))) T('v836-it-mr-' + key, FILE, `${it.name}: Resistencia a la magia (−${mM[1]})`, () => { eq(it.mr, +mM[1], 'dato mr = texto'); const u = wearAny(key); eq(R.mrItems(u), +mM[1], 'mrItems del portador'); });
  const mW = /[Ss]alvación especial (\d)\+ contra cualquier herida/.exec(txt);
  if (mW && it.cat !== 't' && it.ward && !/si |Si |una vez|solo |Solo|hasta|mientras|Mientras/.test(txt)) T('v836-it-ward-' + key, FILE, `${it.name}: salvación especial ${mW[1]}+`, () => { const u = wearAny(key); eq(R.wardOf(u), +mW[1], 'wardOf'); });
}
