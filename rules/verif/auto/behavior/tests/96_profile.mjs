// v838 — Reglas que modifican perfil, salvaciones y resolución (comparadas A/B con el motor real)
import { T, N, R, DATA, game, pair, resolve, asked, msg, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, wsl, prof, fight, saveThr, castThr, caster } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
T('rule-precisionStrikes', RS('precisionStrikes'), 'Ataques de precisión: la unidad de Guardia del Mar unida mejora +1 la Penetración (FP) de sus armas', () => {
  const ap = (withChar) => { const s = game([{ type: 'he_seaguard', models: 10 }, ...(withChar ? [{ type: 'he_ishaya', models: 1 }] : [])], [{ type: 'state_troops', models: 10 }], { f: ['he', 'empire'] }); const u = U(s, 'he_seaguard', 0), e = U(s, 'state_troops', 1); if (withChar) join(s, U(s, 'he_ishaya', 0), u); engage(s, u, e); return prof(s, u, e).ap; };
  eq(ap(true) - ap(false), 1, 'FP +1 con el personaje unido');
});
T('rule-forgefire', RS('forgefire'), 'Fuego de forja: la unidad a la que se une gana Penetración de armadura (2) y Ataques flamígeros', () => {
  const p = (c) => { const s = game([{ type: 'dw_warriors', models: 20 }, ...(c ? [{ type: 'dw_runelord', models: 1 }] : [])], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'] }); const u = U(s, 'dw_warriors', 0), e = U(s, 'state_troops', 1); if (c) join(s, U(s, 'dw_runelord', 0), u); engage(s, u, e); return prof(s, u, e); };
  const a = p(true), b = p(false); ok(a.ab >= 2 && a.flaming, 'Perforación (2) y flamígeros con el Señor de las Runas: ' + JSON.stringify({ ab: a.ab, f: a.flaming })); ok(b.ab < 2 && !b.flaming, 'control');
});
T('rule-deathblow', RS('deathblow'), 'Último golpe: cuando un modelo muere en combate, la unidad que lo mató sufre un impacto de F3, FP −1', () => {
  const run = (strip) => { const f = () => { const { s, w, l } = pair('state_troops', { models: 20 }, 'dw_slayers', { models: 10 }, { side: 'rear' }); diceAll(6); const x = wsl(() => resolve(s)); return x.log.filter((e) => e.def.id === w.id && e.S === 3 && e.ap === 1); }; return strip ? withoutSr('dw_slayers', 'deathblow', f) : f(); };
  const a = run(false), b = run(true); ok(a.length > 0, 'con la regla el matador sufre impactos F3 FP−1'); ok(b.length === 0, 'control sin la regla: no los hay');
});
T('rule-parry', RS('parry'), 'Parada: con arma de mano o lanza asrai y escudo mejora su armadura en 1 en combate (FAQ Core p.196: máximo 3+)', () => {
  const sv = (strip, ctx, sh = true) => { const f = () => { const { s, w, l } = pair('orc_boyz', { models: 10 }, 'we_guardians', { models: 10, opts: sh ? ['sh'] : [] }); return saveThr(s, by(s, l), ctx, 3, 0); }; return strip ? withoutSr('we_guardians', 'parry', f) : f(); };
  const m = sv(false, { ranged: false }), r = sv(false, { ranged: true }), m0 = sv(true, { ranged: false }); ok(r - m === 1, `con escudo, en combate mejora 1 frente a disparos (${r} → ${m})`); ok(m0 > m || m0 === m, 'montaje: sin la regla no mejora más'); ok(sv(false, { ranged: false }, false) === sv(false, { ranged: true }, false), 'sin escudo no hay Parada');
});
T('rule-pelt', RS('pelt'), 'Piel de Charandis: +1 armadura trabado en combate y +2 (máx. 2+) contra disparos no mágicos', () => {
  const mk = () => { const { s, w, l } = pair('orc_boyz', { models: 10 }, 'he_korhil', {}); return { s, l }; };
  const eng = (strip) => { const f = () => { const { s, l } = mk(); return saveThr(s, l, { melee: true }, 3, 0); }; return strip ? withoutSr('he_korhil', 'pelt', f) : f(); };
  const sh = (strip) => { const f = () => { const { s, l } = mk(); l.fleeing = false; return saveThr(s, l, { ranged: true }, 3, 0); }; return strip ? withoutSr('he_korhil', 'pelt', f) : f(); };
  ok(eng(true) - eng(false) === 1 || eng(false) === 2, `trabado: +1 (${eng(true)} → ${eng(false)})`); ok(sh(true) - sh(false) >= 1 && sh(false) >= 2, `disparos: +2 con tope 2+ (${sh(true)} → ${sh(false)})`);
});
T('rule-lionCloak', RS('lionCloak'), 'Capa de león: mejora su armadura en 1 (máx. 2+) contra ataques de disparo no mágicos', () => {
  const sv = (strip, ctx) => { const f = () => { const { s, w, l } = pair('orc_boyz', { models: 10 }, 'he_lionguard', { models: 10 }); return saveThr(s, l, ctx, 3, 0); }; return strip ? withoutSr('he_lionguard', 'lionCloak', f) : f(); };
  const a = sv(false, { ranged: true }), b = sv(true, { ranged: true }); ok(a < b || a === 2, `contra disparos mejora (${b} → ${a})`); eq(sv(false, { melee: true }), sv(true, { melee: true }), 'en combate no cambia'); const m = sv(false, { ranged: true, magical: true }), m0 = sv(true, { ranged: true, magical: true }); eq(m, m0, 'no contra disparos mágicos');
});
T('rule-ithilmarArm', RS('ithilmarArm'), 'Armadura de ithilmar: repite los 1 en los chequeos de Terreno peligroso', () => {
  const lost = (strip) => { const f = () => { const s = game([{ type: 'he_swordmasters', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['he', 'empire'] }); const u = U(s, 'he_swordmasters', 0); cur(s); dice(1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6); diceAll(6); const m0 = u.models; R.dangerTest(s, u, ['trampas'], []); return m0 - u.models; }; return strip ? withoutSr('he_swordmasters', 'ithilmarArm', f) : f(); };
  const a = lost(false), b = lost(true); ok(b > a, `con la regla el 1 se repite (${a} bajas) y sin ella no (${b})`);
});
T('rule-sunBlade', RS('sunBlade'), 'Hoja Bendita de Ptra: el enemigo que sufre una herida sin salvar de esta arma sufre −1 para impactar el resto de la partida', () => {
  const { s, w, l } = pair('tk_settra', {}, 'state_troops', { models: 10 }); diceAll(6); const o = resolve(s); ok(by(o.s, l).sunBlind === true, 'el enemigo queda cegado'); ok(/Hoja Bendita de Ptra/.test(msg(o)), msg(o).slice(-200));
});
T('rule-sunCR', RS('sunCR'), 'Orden del Sol Ardiente: +1 punto de resultado de combate el turno en que carga (no acumulable)', () => {
  const score = (rule) => { const f = () => { const { s, w, l } = pair('state_troops', { models: 10 }, 'orc_boyz', { models: 10 }); diceAll(2); const o = resolve(s); const m = /Combate: .* (\d+) – (\d+) /.exec(msg(o)); return m ? +m[1] : null; }; return rule ? withSr('state_troops', 'sunCR', f) : f(); };
  eq(score(true) - score(false), 1, '+1 al resultado de combate del cargador');
});
T('rule-syphon', RS('syphon'), 'Fuerza absorbida: +1 a lanzar mientras esté a 3" de una unidad de Trolls amiga con FU 6+ que no huya', () => {
  const thr = (near, flee) => castThr(() => { const x = caster('orc_ogdruz', 'state_troops', { extra: [{ type: 'trolls', models: 6 }] }); const t = U(x.s, 'trolls', 0); put(t, 36, near ? 40 + 2.5 + 1.2 : 70, 0); t.fleeing = !!flee; cur(x.s); return x; });
  const a = thr(true, false), b = thr(false, false), c = thr(true, true); ok(a === b - 1, `cerca: umbral ${a} frente a ${b} lejos`); ok(c === b, 'si los Trolls huyen no cuenta');
});
