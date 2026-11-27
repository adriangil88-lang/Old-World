// v838 — Reglas que se resuelven al elegirse el combate (paso 1.1) y modifican el perfil de ataque
import { T, N, R, DATA, game, pair, resolve, asked, msg, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, charged, wsl, prof, fight } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const go = (wT, wX, lT, lX, v, o = {}) => { const { s, w, l } = pair(wT, wX, lT, lX, o); diceAll(v); const ww = wsl(() => resolve(s, o.ans || {})); return { s, w, l, o: ww.r, log: ww.log }; };
const mine = (x, k = 'w') => x.log.filter((e) => e.def.id === x.l.id);
T('rule-blessingChaos', RS('blessingChaos'), 'Bendiciones del Caos: al elegirse su combate 1-2 Ataques envenenados, 3-4 PA −2, 5-6 +1 R hasta el fin de la fase', () => {
  const r = (v) => go('bm_warped', {}, 'state_troops', { models: 10 }, v); const a = r(1), b = r(3), c = r(5);
  ok(/Bendición del Caos \(1\) → Púas venenosas/.test(msg(a.o)), msg(a.o).slice(0, 300)); ok(/\(3\) → Garras guadaña \(PA −2\)/.test(msg(b.o)), '3-4'); ok(/\(5\) → Piel quitinosa \(T\+1\)/.test(msg(c.o)), '5-6');
  ok(by(a.o.s, a.w).fx.some((f) => f.k === 'bcPoison') && by(b.o.s, b.w).fx.some((f) => f.k === 'bcAP') && by(c.o.s, c.w).fx.some((f) => f.k === 'bcHide'), 'efectos');
  const aps = (x) => Math.max(...mine(x).map((e) => e.ap)); ok(aps(b) > aps(a), 'PA −2 con 3-4: ' + aps(b) + ' vs ' + aps(a));
});
T('rule-rampant', RS('rampant'), 'Mutación desenfrenada: al elegir su combate tira 1D6: 1-2 Ataques envenenados, 3-4 FP −2, 5-6 Golpe mortal', () => {
  const r = (v) => go('woc_forsaken', {}, 'state_troops', { models: 10 }, v); const a = r(1), b = r(3), c = r(6);
  ok(/Mutación desenfrenada \(1\) — Colmillos venenosos/.test(msg(a.o)), msg(a.o).slice(0, 200)); ok(/\(3\) — Garras afiladas \(FP −2\)/.test(msg(b.o)), '3-4'); ok(/\(6\) — Garras decapitadoras \(Golpe mortal\)/.test(msg(c.o)), '5-6');
  ok(Math.max(...mine(b).map((e) => e.ap)) >= 2, 'FP −2 en los golpes con 3-4'); ok(Math.max(...mine(a).map((e) => e.ap)) < 2, 'control: con 1-2 no');
});
T('rule-loec', RS('loec'), 'Danzas de Loec: al elegirse su combate, el jugador elige Muerte Giratoria (FP +2), Tormenta de Hojas (+1 Ataque), Las Sombras se Enroscan (especial 4+) o Niebla Tejida (−1 para impactarle)', () => {
  const run = (v) => { const { s, w, l } = pair('we_wardancers', {}, 'state_troops', { models: 10 }); diceAll(2); return { o: resolve(s, { 'Danzas de Loec': v }), w }; };
  const a = run('x'); const need = a.o.needs.find((n) => n.title === 'Danzas de Loec'); ok(need, 'se pregunta al elegirse el combate'); const names = need.opts.map((x) => x[1]).join('|'); for (const nm of ['Muerte Giratoria', 'Tormenta de Hojas', 'Sombras', 'Niebla Tejida']) ok(new RegExp(nm).test(names), 'opción ' + nm + ': ' + names);
  const keys = need.opts.map((x) => x[0]); ok(keys.length === 4, '4 danzas'); const ws = (k) => { const { s, w, l } = pair('we_wardancers', {}, 'state_troops', { models: 10 }); diceAll(6); const x = wsl(() => resolve(s, { 'Danzas de Loec': k })); return x.log.filter((e) => e.def.id === l.id); };
  const base = keys.map((k) => ws(k)); const ap = base.map((l) => Math.max(...l.map((e) => e.ap))), hits = base.map((l) => l.reduce((t, e) => t + e.hits, 0)); ok(Math.max(...ap) >= Math.min(...ap) + 2, 'una de las danzas da FP +2: ' + ap); ok(Math.max(...hits) > Math.min(...hits), 'otra da un Ataque extra por modelo: ' + hits);
});
T('rule-braystaff', RS('braystaff'), 'Bastón de los brayes: al elegirse su combate elige ofensivo (arma a dos manos) o defensivo (arma de mano y armadura 5+)', () => {
  const run = (v) => { const { s, w, l } = pair('bm_gbs', {}, 'state_troops', { models: 10 }); diceAll(2); return { o: resolve(s, { 'Bastón de los brayes': v }), w }; };
  const a = run('x'); const n = a.o.needs.find((q) => q.title === 'Bastón de los brayes'); ok(n && n.opts.length === 2, 'se pregunta con dos opciones: ' + a.o.needs.map((q) => q.title)); const d = run('d'), of = run('o'); ok(by(d.o.s, d.w).bsDef === true, 'defensivo marca el uso defensivo'); ok(by(of.o.s, of.w).bsDef !== true, 'ofensivo no');
  const defV = R.D({ ...by(d.o.s, d.w) }); void defV;
});
T('rule-netters', RS('netters'), 'Lanzadores de redes: al elegirse su combate D6: con 2+ una unidad enemiga trabada sufre −1 F hasta el final de la fase; con 1, la propia unidad', () => {
  const run = (v) => { const { s, w, l } = pair('night_goblins_net', { models: 10 }, 'state_troops', { models: 10 }); diceAll(v); return { o: resolve(s, {}), w, l }; };
  const a = run(4), b = run(1); ok(a.o.needs.some((q) => q.title === 'Lanzadores de redes'), 'se pregunta'); ok(by(a.o.s, a.l).fx.some((f) => /net|red/i.test(f.k)) || /−1 F|redes/i.test(msg(a.o)), 'con 4 el enemigo sufre −1 F: ' + msg(a.o).slice(0, 250)); ok(by(b.o.s, b.w).fx.some((f) => /net|red/i.test(f.k)) || /se enredan/i.test(msg(b.o)), 'con 1 se enredan ellos: ' + msg(b.o).slice(0, 250));
});
T('rule-bloodGreed', RS('bloodGreed'), 'Avidez de sangre: mientras esté Frenético gana +2 Ataques en vez de +1', () => {
  const at = (type) => { const { s, w, l } = pair(type, { models: 3 }, 'state_troops', { models: 10 }); w.chargeOK = true; w.bfz = true; return prof(s, w, l).atk; };
  const g = at('bm_minotaurs'), c = withoutSr('bm_minotaurs', 'bloodGreed', () => at('bm_minotaurs')); eq(g - c, 3, 'con 3 modelos: +3 Ataques más que con Frenesí normal (+2 en vez de +1 por modelo)');
});
T('rule-foeRender', RS('foeRender'), 'Desgarrador de enemigos: con Furia primigenia, su arma de mano sencilla tiene FP −2', () => {
  const ap = (strip) => { const f = () => { const g = go('bm_wargor', {}, 'state_troops', { models: 10 }, 1); return { g, a: Math.max(...mine(g).map((e) => e.ap)) }; }; return strip ? withoutSr('bm_wargor', 'foeRender', f) : f(); };
  const a = ap(false), b = ap(true); ok(/Furia primigenia/i.test(msg(a.g.o)), 'montaje: supera Furia primigenia con Ld: ' + msg(a.g.o).slice(0, 200)); ok(a.a >= 2 && b.a < 2, `FP −2 con la regla (${a.a}) y no sin ella (${b.a})`);
});
