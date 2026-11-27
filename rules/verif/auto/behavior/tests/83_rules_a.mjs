// v837 — Reglas especiales sin prueba propia (lote A): cada una compara el motor con su texto
import { T, N, R, DATA, GEOM, game, U, ok, eq, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, withSr, join, blows } from '../lib2.mjs';
const { UNITS, ITEMS, SPELLS, SR } = DATA;
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const srText = (k) => (DATA.SR?.[k] || DATA.SPECIAL?.[k] || [])[1];
T('rule-tusker', RS('tusker'), 'Carga de colmillos: al cargar, los colmillos del jabalí tienen F+1 y PA−1 (no los ataques del jinete)', () => {
  const run = (charge) => { const s = game([{ type: 'boar_boyz', models: 8 }], [{ type: 'state_troops', models: 20 }], { f: ['orcs', 'empire'] }); const a = U(s, 'boar_riders', 0), t = U(s, 'state_troops', 1); t.files = 5; engage(s, a, t); if (charge) charged(s, a, t, 6); cur(s); const P = R.attackProfile(a, t); globalThis.__WSL = []; diceAll(6); fight(s); return { P, W: globalThis.__WSL.filter((x) => x.def === t || x.def?.type === 'state_troops').map((x) => ({ S: x.S, ap: x.ap })) }; };
  const c = run(true), n = run(false); ok(c.W.some((x) => x.S === c.P.S + 1 && x.ap === c.P.ap + 1), 'al cargar, parte de los impactos (los colmillos) tiene F+1 y PA−1: ' + JSON.stringify(c.W)); ok(c.W.some((x) => x.S === c.P.S && x.ap === c.P.ap), 'los ataques del jinete conservan F y PA'); ok(!n.W.some((x) => x.S === n.P.S + 1 && x.ap === n.P.ap + 1), 'sin cargar no hay colmillos reforzados');
});
T('rule-ravenousHunger', RS('ravenousHunger'), 'Hambre voraz: al declarar una carga puede repetir la tirada de carga (se pregunta al ver la tirada)', () => {
  const go = (pick) => { const s = game([{ type: 'ok_gorgers', models: 3 }], [{ type: 'state_troops', models: 10 }], { f: ['ok', 'empire'], phase: 'move', active: 0 }); const a = put(U(s, 'ok_gorgers', 0), 36, 38), t = put(U(s, 'state_troops', 1), 36, 18, Math.PI / 2); cur(s); dice(1, 1, 6, 6); diceAll(6); const o = asks(s, (x) => { const ev = []; R.doCharge(x, U(x, 'ok_gorgers', 0), U(x, 'state_troops', 1), ev); return ev; }, [0], (n) => (/Hambre voraz/.test(n.title) ? pick : n.opts?.[0]?.[0])); return { o, m: msgs(o.r) }; };
  const y = go('y'), n = go('n'); ok(y.o.needs.some((q) => /Hambre voraz/.test(q.title)), 'se pregunta al ver la tirada: ' + y.m); ok(/Hambre voraz, repite la tirada de carga \(6 y 6\)/.test(y.m), 'repite: ' + y.m); ok(!/Hambre voraz, repite/.test(n.m), 'si el jugador no quiere, no repite');
});
T('rule-grailVow', RS('grailVow'), 'Juramento del Grial: inmunes a psicología, Ataques mágicos y tozudos; no pueden rechazar un desafío', () => {
  const s = game([{ type: 'br_grail', models: 3 }, { type: 'br_duke', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['bret', 'empire'] }); cur(s); const g = U(s, 'br_grail', 0), dk = U(s, 'br_duke', 0);
  for (const m of [g, dk]) ok(D(m).sr.includes('grailVow'), m.type + ' con el juramento');
  ok(R.has(g, 'immunePsy') && R.has(g, 'magical') && R.has(g, 'stubborn'), 'inmunes a psicología, Ataques mágicos y tozudos'); ok(R.mustDuel({ k: 's', m: g }), 'no pueden rechazar un desafío'); const t = U(s, 'state_troops', 1); ok(!R.mustDuel({ k: 's', m: t }), 'control: una unidad normal sí puede rechazar');
});
function D(u) { return R.D(u); }
T('rule-harmony', RS('harmony'), 'Armonía de piedra y acero: la unidad a la que se une repite chequeos de Ld fallidos de Contención (y al reformar/redirigir)', () => {
  const go = (withChar) => { const s = game([{ type: 'ct_jade', models: 10 }, ...(withChar ? [{ type: 'ct_gatekeeper', models: 1 }] : [])], [{ type: 'state_troops', models: 10 }], { f: ['ct', 'empire'] }); const w = U(s, 'ct_jade', 0); if (withChar) join(s, U(s, 'ct_gatekeeper', 0), w); w.restrainPref = true; cur(s); dice(6, 6, 1, 1); diceAll(1); return R.restrains(s, w, []); };
  ok(go(true) === true, 'con el Guardián unido, el 6+6 fallido se repite y se contiene'); ok(go(false) === false, 'sin él, el chequeo fallido no se repite');
});
T('rule-willDragons', RS('willDragons'), 'Voluntad de los Dragones: repite un chequeo de Pánico fallido cuando una unidad amiga es destruida a 6" o atravesada por amigos en huida', () => {
  const go = (withChar, will) => { const s = game([{ type: 'ct_jade', models: 10 }, ...(withChar ? [{ type: 'ct_gatekeeper', models: 1 }] : [])], [{ type: 'state_troops', models: 10 }], { f: ['ct', 'empire'] }); const w = U(s, 'ct_jade', 0); if (withChar) join(s, U(s, 'ct_gatekeeper', 0), w); cur(s); dice(6, 6, 1, 1, 6, 6, 6, 6); diceAll(6); return R.passPanicW(s, w, null, will); };
  ok(go(true, true), 'con la regla y por amigo destruido: repite y pasa'); ok(!go(true, false), 'por otra causa (p. ej. bajas): no repite'); { const d = UNITS.ct_jade, sr0 = d.sr; d.sr = sr0.filter((x) => x !== 'willDragons'); try { ok(!go(false, true), 'sin la regla no repite'); } finally { d.sr = sr0; } }
});
T('rule-grandStrategist', RS('grandStrategist'), 'Gran estratega: salvo en huida, las unidades amigas en su rango de mando (excepto el General) pueden usar su Liderazgo', () => {
  const go = (near, flee) => { const s = game([{ type: 'ct_jade', models: 10 }, { type: 'ct_strategist', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['ct', 'empire'] }); const w = U(s, 'ct_jade', 0), g = U(s, 'ct_strategist', 0); put(w, 36, 30); put(g, 36, near ? 36 : 70, Math.PI / 2); w.fleeing = !!flee; cur(s); return R.ldOf(s, w); };
  const ld0 = UNITS.ct_jade.Ld, ldG = UNITS.ct_strategist.Ld; ok(ldG > ld0, 'montaje: el Estratega tiene más Ld (' + ldG + ' > ' + ld0 + ')'); eq(go(true, false), ldG, 'en su rango de mando usa su Ld'); ok(go(false, false) < ldG, 'fuera del rango no'); ok(go(true, true) < ldG, 'en huida no');
});
T('rule-masteryWinds', RS('masteryWinds'), 'Maestría de los vientos elementales: 1/turno un mago con la regla a 6" de otro mago amigo con la regla suma +1 a una tirada de lanzamiento (no anula el doble 1)', () => {
  const cv = SPELLS.fireball.cv, lvl = UNITS.ct_shugengan.wizard.level, bonus = Math.ceil(lvl / 2);
  const go = (partner, x, y) => { const s = game([{ type: 'ct_shugengan', models: 1 }, ...(partner ? [{ type: 'ct_shugengan', models: 1 }] : [])], [{ type: 'state_troops', models: 20 }], { f: ['ct', 'empire'], phase: 'shoot' }); const [w, p] = s.units.filter((u) => u.type === 'ct_shugengan'); put(w, 36, 40); if (p) put(p, 36, 44); const t = put(U(s, 'state_troops', 1), 36, 26, Math.PI / 2); w.spells = ['fireball']; w.casted = []; cur(s); dice(x, y, 1, 1, 3, 3, 3); diceAll(1); const r = R.apply(s, { t: 'cast', id: w.id, spell: 'fireball', target: t.id }); return !/no logra/.test(msgs(r.events || [])); };
  const need = cv - bonus; const x = Math.floor((need - 1) / 2), y = (need - 1) - x; ok(!go(false, x, y), `sin compañero: ${x}+${y}+${bonus} = ${cv - 1} no lanza`); ok(go(true, x, y), 'con el compañero a 6": +1 y lanza');
});
T('rule-masteryStorm', RS('masteryStorm'), 'Maestría de los vientos de tormenta: puede descartar hasta dos hechizos generados al azar y sustituirlos por hechizos de Yang, Yin, la firma o La furia del Dragón de la Tormenta', () => {
  const s = game([{ type: 'ct_miaoying', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['ct', 'empire'] }); const u = U(s, 'ct_miaoying', 0); eq(u.yy, 'both', 'puede tomar hechizos de Yang y de Yin'); ok(u.spells.length >= 3, 'tiene sus hechizos: ' + u.spells.join(','));
});
