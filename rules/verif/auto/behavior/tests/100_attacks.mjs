// v838 — Ataques especiales que sustituyen a los normales (se elige al combatir): combates reales con dados fijados
import { T, N, R, DATA, game, pair, resolve, asked, msg, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, wsl } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const fix = (v, n = 80) => { let c = 0; diceAll((f) => (c++ < n ? v : (c % 2 ? 5 : 2))); }; // v durante el combate; después alterna (evita bucles de tiradas empatadas)
const go = (wT, wX, lT, lX, v, ans = {}, o = {}) => { const { s, w, l } = pair(wT, wX, lT, lX, o); fix(v); const x = wsl(() => resolve(s, ans)); return { s, w, l, o: x.r, log: x.log, m: msg(x.r) }; };
T('rule-abominable', RS('abominable'), 'Ataques abominables: en vez de atacar elige Alimentarse (un modelo, D3 heridas automáticas sin armadura) o Avalancha de carne (plantilla de 3", un impacto de F por modelo, PA −2)', () => {
  const a = go('sk_hellpit', {}, 'state_troops', { models: 10 }, 6, { 'Ataques abominables': 'feed' }); ok(a.o.needs.some((n) => n.title === 'Ataques abominables' && n.opts.length === 3), 'se pregunta (normal / alimentarse / avalancha)'); ok(/Alimentarse de .*impacta: D3 heridas sin armadura/.test(a.m), a.m.slice(0, 300));
  const b = go('sk_hellpit', {}, 'state_troops', { models: 10 }, 6, { 'Ataques abominables': 'avalanche' }); ok(/Avalancha de carne sobre/.test(b.m), b.m.slice(0, 300)); ok(b.log.some((e) => e.def.id === b.l.id && e.ap === 2), 'impactos con FP −2');
  const c = go('sk_hellpit', {}, 'state_troops', { models: 10 }, 6, { 'Ataques abominables': 'normal' }); ok(!/Alimentarse|Avalancha/.test(c.m), 'normal: ni una ni otra');
});
T('rule-motherly', RS('motherly'), 'Amor maternal: en vez de atacar normalmente: Aplastar (plantilla 5"), Madre (un modelo, D3+1 Heridas) o Cotorrear (D6+1 impactos y −1 Ld)', () => {
  const a = go('troll_hag', {}, 'state_troops', { models: 10 }, 1), b = go('troll_hag', {}, 'state_troops', { models: 10 }, 3), c = go('troll_hag', {}, 'state_troops', { models: 10 }, 6);
  ok(/Amor Maternal — Aplastar/.test(a.m), '1-2 Aplastar: ' + a.m.slice(0, 200)); ok(/Amor Maternal — Madre \(D3\+1 Heridas, sin armadura ni Regeneración\)/.test(b.m), '3-4 Madre'); ok(/Amor Maternal — Cotorrear \(7 impactos, −1 Ld\)/.test(c.m), '5-6 Cotorrear D6+1 (=7) impactos y −1 Ld: ' + c.m.slice(0, 200)); ok(by(c.o.s, c.l).mitherK != null, '−1 Ld hasta el final del turno');
  ok(c.log.some((e) => e.def.id === c.l.id && e.hits === 7), 'D6+1 impactos');
});
T('rule-bonegrinder', RS('bonegrinder'), 'Ataques de Gigante Triturador: nomina una unidad enemiga trabada y tira un D6 en la tabla según su tipo de tropa (cosa pequeña/grande/más grande): Aplastar bajo el pie, Devorar, Vomitar, Gran barrido, Garrotazo o Cabezazo', () => {
  const kind = (foe, v) => { const r = go('orc_bonegrinder', {}, foe, { models: foe === 'state_troops' ? 10 : 1 }, v); const m = /Ataque de Gigante Triturador \(\d\) — ([^(]+?)( sobre | a |\s*\()/.exec(r.m); return m ? m[1].trim() : '?'; };
  const small = [1, 2, 3, 4, 5, 6].map((v) => kind('state_troops', v)); ok(/Aplastar/.test(small[0]) && /Aplastar/.test(small[1]) && /Devorar/.test(small[2]) && /Devorar/.test(small[3]) && /Vomitar/.test(small[4]) && /Vomitar/.test(small[5]), 'cosas pequeñas (infantería): 1-2 Aplastar, 3-4 Devorar, 5-6 Vomitar: ' + small.join(' | '));
  const big = [1, 2, 3, 4, 5, 6].map((v) => kind('vc_terrorgheist', v)); ok(/Garrotazo/.test(big[0]) && /Garrotazo/.test(big[1]) && /barrido/i.test(big[2]) && /barrido/i.test(big[3]) && /Cabezazo/.test(big[4]) && /Cabezazo/.test(big[5]), 'cosas más grandes (criatura monstruosa): 1-2 Garrotazo, 3-4 Gran barrido, 5-6 Cabezazo: ' + big.join(' | '));
});
T('rule-giant', RS('giant'), 'Ataques de gigante: en vez de atacar normalmente: Ataque de gigante (D6: cabezazo, panzazo, gran barrido, garrotazo, saltar) o Agarrar y… contra infantería', () => {
  const g = go('orc_giant', {}, 'state_troops', { models: 10 }, 1, { 'Gigante': 'giant' }); ok(g.o.needs.some((n) => /Gigante/.test(n.title)), 'se elige entre Ataque de Gigante y Agarrar y… contra infantería'); ok(/cabezazo/.test(g.m), '1: cabezazo: ' + g.m.slice(0, 250));
  const p = go('orc_giant', {}, 'state_troops', { models: 10 }, 1, { 'Gigante': 'pickup' }); ok(/Agarrar y…/.test(p.m), 'Agarrar y…: ' + p.m.slice(0, 250));
  const h = go('orc_giant', {}, 'vc_terrorgheist', { models: 1 }, 2, {}); ok(!h.o.needs.some((n) => /Gigante/.test(n.title)), 'contra algo que no es infantería no hay elección: ataque de gigante: ' + h.m.slice(0, 200));
});
T('rule-monsterHandlers', RS('monsterHandlers'), 'Cuidadores de monstruos: la bestia va acompañada de 2 Cuidadores que suman sus Ataques (F3). Cuando sufre una Herida no salvada se tira un D6: 1-4 pierde la Herida; 5+ cae un Cuidador en su lugar', () => {
  const at = (strip) => { const f = () => { const { s, w, l } = pair('de_hydra', {}, 'state_troops', { models: 10 }); return R.attackProfile(w, l).atk; }; return strip ? withoutSr('de_hydra', 'monsterHandlers', f) : f(); }; ok(at(false) > at(true), `los Cuidadores suman Ataques (${at(false)} frente a ${at(true)})`);
  const hurt = (v) => { const { s, w } = pair('de_hydra', {}, 'state_troops', { models: 10 }); cur(s); diceAll(v); const W0 = w.wounds; R.applyWounds(w, 1); return { h: w.handlers ?? 2, lost: W0 - w.wounds }; };
  const a = hurt(5), b = hurt(3); eq(a, { h: 1, lost: 0 }, '5+: cae un Cuidador y la bestia no pierde la Herida'); eq(b, { h: 2, lost: 1 }, '1-4: pierde la Herida');
  const { s, w } = pair('de_hydra', {}, 'state_troops', { models: 10 }); cur(s); w.handlers = 0; diceAll(6); const W0 = w.wounds; R.applyWounds(w, 1); eq(W0 - w.wounds, 1, 'sin Cuidadores no hay a quién sustituya');
});
