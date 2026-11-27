// v837 — Objetos con texto condicional o compuesto: la parte incondicional / numérica del texto se compara con el motor equipándolo a un portador
import { T, N, R, DATA, game, U, ok, eq, cur, put, engage, diceAll, dice, withSr } from '../lib2.mjs';
const { ITEMS } = DATA;
const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
const wear = (items, o = {}) => { const s = game([{ type: 'emp_engineer', models: 1, items }], [{ type: 'state_troops', models: 20 }], { f: ['empire', 'orcs'] }); const u = U(s, 'emp_engineer', 0), e = U(s, 'state_troops', 1); engage(s, u, e); cur(s); return { s, u, e }; };
const base = wear([]); const P0 = R.attackProfile(base.u, base.e);
// frases del texto hasta la primera condicional: lo que viene antes se aplica siempre al portador
const COND1 = /^(Si |Una vez|Un solo uso|Solo |Contra |Mientras|Cuando|Hasta|En el |En la |Al |Antes|Después|Cada |Por cada)/;
const uncond = (txt) => { const out = []; for (const sent of (txt || '').split(/(?<=\.)\s+/)) { if (COND1.test(sent.trim())) break; out.push(sent); } return out.join(' '); };
let nT = 0, nN = 0;
const NN = (id, why, key) => { nN++; N(id, why + ': ' + (ITEMS[key].text || '').slice(0, 90), FILE); };
for (const [key, it] of Object.entries(ITEMS)) {
  const txt = it.text || '', pre = uncond(txt); let did = false;
  const eqp = ['w', 'a', 't', 'e', 'x'].includes(it.cat);
  if (it.cat === 'w' && !it.rangedI && !it.vaulW && !it.dragonBow && !it.chS && !/Arco|Disparo|Arma de proyectil|\d+"/.test(pre)) {
    const mMw = /Heridas múltiples \((D3|D6|\d)\)/.exec(pre), mKb = /Golpe (mortal|letal)/.exec(pre), mFl = /Ataques flamígeros/.test(pre), mAb = /Perforación \((\d)\)/.exec(pre);
    const mAt = /Ataques adicionales \(\+(\d)\)|\+(\d) Ataques?\b/.exec(pre);
    if (mMw && !it.dual) { did = true; nT++; T('v837-it-mw-' + key, FILE, `${it.name}: Heridas múltiples (${mMw[1]})`, () => { const w = wear([key]), P = R.attackProfile(w.u, w.e); eq(String(P.mw), mMw[1], 'Heridas múltiples del perfil'); }); }
    if (mKb && !it.dual && !/\bcon \d\+|con un/.test(pre)) { did = true; nT++; T('v837-it-kb-' + key, FILE, `${it.name}: ${mKb[0]}`, () => { const w = wear([key]), P = R.attackProfile(w.u, w.e); ok(P.kb, 'Golpe mortal/letal en el perfil'); ok(!P0.kb, 'montaje: el portador sin objeto no lo tiene'); }); }
    if (mFl && !it.dual) { did = true; nT++; T('v837-it-fl-' + key, FILE, `${it.name}: Ataques flamígeros`, () => { const w = wear([key]), P = R.attackProfile(w.u, w.e); ok(P.flaming, 'flamígero'); ok(!P0.flaming, 'montaje'); }); }
    if (mAb && !it.dual) { did = true; nT++; T('v837-it-ab-' + key, FILE, `${it.name}: Perforación (${mAb[1]})`, () => { const w = wear([key]), P = R.attackProfile(w.u, w.e); ok(P.ab >= +mAb[1], `Perforación (${mAb[1]}) en el perfil (${P.ab})`); }); }
    if (mAt && !it.dual && !/D3|D6/.test(pre)) { did = true; nT++; T('v837-it-at-' + key, FILE, `${it.name}: +${mAt[1] || mAt[2]} Ataques`, () => { const w = wear([key]), P = R.attackProfile(w.u, w.e); eq(P.atk - P0.atk, +(mAt[1] || mAt[2]), 'Ataques adicionales'); }); }
  }
  const mMr = /Resistencia (?:a la )?magia \((?:−|-)(\d)\)/.exec(pre);
  if (mMr && eqp) { did = true; nT++; T('v837-it-mr-' + key, FILE, `${it.name}: Resistencia a la magia (−${mMr[1]})`, () => { const w = wear([key]); const mr = Math.max(R.mrOf(w.u), R.mrItems(w.u)); ok(mr >= +mMr[1], 'Resistencia a la magia efectiva = ' + mr); }); }
  const mRg = /Regeneración (\d)\+/.exec(pre);
  if (mRg && eqp) { did = true; nT++; T('v837-it-rg-' + key, FILE, `${it.name}: Regeneración ${mRg[1]}+`, () => { const run = (v) => { const w = wear([key]); cur(w.s); diceAll(v); return R.woundAndSave(w.s, w.u, 1, 10, 0, { noArmour: true, noWard: true }).through; }; eq(run(+mRg[1]), 0, 'con un ' + mRg[1] + ' regenera'); }); }
  const mW = /Salvación (?:especial )?(\d)\+(?: especial)?(?: contra ([^.;,]*))?/i.exec(pre);
  if (mW && (it.ward || it.wardFlame || it.wardMagic || it.wardShoot) && eqp) { const cond = (mW[2] || '').toLowerCase(); const ctx = /flam/.test(cond) ? { flaming: true } : /m[aá]gic|proyectiles m/.test(cond) ? { spellDmg: true, magical: true } : /disparo/.test(cond) ? { ranged: true, missile: true } : !cond || /cualquier/.test(cond) ? {} : null;
    if (ctx) { did = true; nT++; T('v837-it-wd-' + key, FILE, `${it.name}: salvación especial ${mW[1]}+${cond ? ' contra ' + cond : ''}`, () => { const run = (v) => { const w = wear([key]); cur(w.s); diceAll(v); return R.woundAndSave(w.s, w.u, 2, 10, 0, { ...ctx, noArmour: true, noRegen: true }).through; }; eq(run(+mW[1]), 0, 'con un ' + mW[1] + ' (' + JSON.stringify(ctx) + ') salva'); if (+mW[1] > 2) ok(run(+mW[1] - 1) > 0, 'con un ' + (+mW[1] - 1) + ' no salva'); }); } }
  const mCr = /\+(\d) puntos? adicionales? de resolución/.exec(pre);
  if (mCr && it.cat === 's') { did = true; nT++; T('v837-it-cr-' + key, FILE, `${it.name}: +${mCr[1]} resolución de combate`, () => eq(it.cr, +mCr[1], 'dato cr = texto')); }
  if (/Un solo uso|Una vez por partida|una vez por partida/.test(txt) && !did) { /* se resuelve abajo */ }
}

// Modificadores de perfil de objetos/estandartes (it.prof): «+N Fuerza/Resistencia/Iniciativa/HA/HP/Liderazgo/Heridas/Ataques» del texto = diferencia real en el perfil del portador
const PK = { Fuerza: 'S', Resistencia: 'T', Iniciativa: 'I', HA: 'WS', HP: 'BS', Liderazgo: 'Ld', Heridas: 'W', Herida: 'W', Ataque: 'A', Ataques: 'A' };
const unitWear = (key) => { const it = ITEMS[key]; const std = it.cat === 's'; const s = game([std ? { type: 'dw_warriors', models: 20, std: true, banner: key } : { type: 'emp_engineer', models: 1, items: [key] }], [{ type: 'state_troops', models: 20 }], { f: [std ? 'dw' : 'empire', 'orcs'] }); const u = U(s, std ? 'dw_warriors' : 'emp_engineer', 0); cur(s); return { s, u }; };
const unitBase = (std) => { const s = game([std ? { type: 'dw_warriors', models: 20 } : { type: 'emp_engineer', models: 1 }], [{ type: 'state_troops', models: 20 }], { f: [std ? 'dw' : 'empire', 'orcs'] }); const u = U(s, std ? 'dw_warriors' : 'emp_engineer', 0); cur(s); return { s, u }; };
for (const [key, it] of Object.entries(ITEMS)) {
  if (!it.prof || !['s', 'e', 'w', 'a', 't', 'x'].includes(it.cat)) continue;
  const pre = uncond(it.text || ''), ms = [...pre.matchAll(/\+(\d) (Fuerza|Resistencia|Iniciativa|HA|HP|Liderazgo|Heridas?|Ataques?)\b/g)].filter((m) => it.prof[PK[m[2]]] === +m[1]);
  if (!ms.length) continue;
  T('v837-it-prof-' + key, FILE, `${it.name}: ${ms.map((m) => '+' + m[1] + ' ' + m[2]).join(', ')}`, () => { const w = unitWear(key), b = unitBase(it.cat === 's'); for (const m of ms) { const k = PK[m[2]]; const d = (k === 'A' ? R.D(w.u).A : R.D(w.u)[k]) - R.D(b.u)[k]; ok(d === +m[1] || (+m[1] + R.D(b.u)[k] > 10 && d >= 0), `${k}: diferencia ${d}, el texto dice +${m[1]}`); } });
}
