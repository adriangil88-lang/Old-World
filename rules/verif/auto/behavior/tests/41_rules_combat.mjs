// v836 — Tarea C: reglas de combate (perfil de ataque attackProfile y resolución): A/B con y sin la regla sobre la misma unidad, ejecutando el motor
import { T, N, R, DATA, game, U, ok, eq, has, no, dice, diceAll, engage, charged, fight, cur, asks, put, msgs, blows, bout, sum, withSr, nDice, cloneType } from '../lib2.mjs';
const { UNITS, ITEMS } = DATA;
const CORE = 'rules/core.txt', FOF = 'rules/fof.txt', RH = 'rules/rh.txt';
// perfil de ataque del atacante (state_troops, 10 modelos en 5 filas) con y sin la regla; o.ch = distancia de carga; o.foe/o.fb = enemigo y su facción; o.def = perfil del defensor cargado
const prof = (rule, o = {}, add = true) => { const r = bout('state_troops', o.xa || {}, o.foe || 'orc_boyz', o.xb || {}, { noFight: true, charge: o.ch || 0, bcharge: o.bch || 0, fa: 'empire', fb: o.fb || 'orcs', side: o.side, setup: o.setup }); const f = () => { cur(r.s); return o.def ? R.attackProfile(r.b, r.a) : R.attackProfile(r.a, r.b); }; return add ? withSr(o.def ? (o.foe || 'orc_boyz') : 'state_troops', [rule], f) : f(); };
const AB = (rule, o) => ({ w: prof(rule, o, true), b: prof(rule, o, false) });
const rule = (id, src, desc, fn) => T('v836-r-' + id, src, desc, fn);
const FL = 'rules/new/faq_core.txt', LEG = 'rules/new/leg_';

rule('killingBlow', CORE + ' (Killing Blow)', 'Golpe mortal: el perfil de ataque lo marca', () => { const { w, b } = AB('killingBlow'); ok(w.kb && !b.kb, 'kb'); });
rule('furiousCharge', CORE + ' (Furious Charge)', 'Carga furiosa: +1 Ataque por modelo si carga 3" o más y nada con menos', () => { const a = AB('furiousCharge', { ch: 4 }), c = AB('furiousCharge', { ch: 2 }), q = AB('furiousCharge'); eq(a.w.atk - a.b.atk, 5, '+1 Ataque a los 5 modelos de la fila'); eq(c.w.atk, c.b.atk, 'carga de 2"'); eq(q.w.atk, q.b.atk, 'sin cargar'); });
rule('frenzy', CORE + ' (Frenzy)', 'Frenesí: +1 Ataque el turno en que cargó', () => { const a = AB('frenzy', { ch: 4 }), q = AB('frenzy'); eq(a.w.atk - a.b.atk, 5, '+1 Ataque'); eq(q.w.atk, q.b.atk, 'sin cargar no hay Ataque extra'); });
rule('choppas', 'rules/new/aj_orcs2.txt (Choppas)', 'Hachas: al cargar repite los 1 al herir y +1 a la penetración; sin cargar nada', () => { const a = AB('choppas', { ch: 4 }), q = AB('choppas'); eq(a.w.ap - a.b.ap, 1, 'FP +1'); ok(a.w.rr1 && !a.b.rr1, 'repite 1 al herir'); eq(q.w.ap, q.b.ap, 'sin cargar'); ok(!q.w.rr1 || q.b.rr1, 'sin cargar no repite'); });
rule('bigUns', 'rules/new/aj_orcs2.txt (Big \'Uns)', 'Big \'Uns: trabados en combate +1 Fuerza y Perforante (1)', () => { const a = AB('bigUns'); eq(a.w.S - a.b.S, 1, 'F+1'); eq(a.w.ab - a.b.ab, 1, 'Perforante (1)'); });
rule('bestialCharge', RH + ':4091 (Bestial Charge)', 'Carga bestial: +1 Fuerza si carga 3" o más', () => { const a = AB('bestialCharge', { ch: 4 }), c = AB('bestialCharge', { ch: 2 }); eq(a.w.S - a.b.S, 1, '+1 F'); eq(c.w.S, c.b.S, 'carga de 2"'); });
rule('slavering', LEG + 'ogres.txt/leg_daemons (Slavering Charge)', 'Carga babeante: +1 Fuerza el turno en que cargó', () => { const a = AB('slavering', { ch: 4 }), q = AB('slavering'); eq(a.w.S - a.b.S, 1, '+1 F'); eq(q.w.S, q.b.S, 'sin cargar'); });
rule('mightyConst', 'rules/new/aj_orcs2.txt (Mighty Constitution, Korhil)', 'Constitución poderosa: +1 F si carga 3" o más', () => { const a = AB('mightyConst', { ch: 4 }), c = AB('mightyConst', { ch: 2 }); eq(a.w.S - a.b.S, 1, '+1 F'); eq(c.w.S, c.b.S, 'carga de 2"'); });
rule('razorTusks', RH + ' (Razor Tusks)', 'Colmillos afilados: al cargar la FP mejora 1', () => { const a = AB('razorTusks', { ch: 4 }), q = AB('razorTusks'); eq(a.w.ap - a.b.ap, 1, 'FP'); eq(q.w.ap, q.b.ap, 'sin cargar'); });
rule('wolfHammer', 'rules/new/aj_orcs2.txt (Wolf Hammer)', 'Martillo de lobo: +1 F adicional al cargar 3" o más', () => { const a = AB('wolfHammer', { ch: 4 }), q = AB('wolfHammer'); eq(a.w.S - a.b.S, 1, '+1 F'); eq(q.w.S, q.b.S, 'sin cargar'); });
rule('poisoned', CORE + ' (Poisoned Attacks)', 'Ataques envenenados: el perfil lo marca (6 natural: +2 a herir)', () => { const a = AB('poisoned'); ok(a.w.poison && !a.b.poison); });
rule('flaming', CORE + ' (Flaming Attacks)', 'Ataques flamígeros', () => { const a = AB('flaming'); ok(a.w.flaming && !a.b.flaming); });
rule('slayer', CORE + ' (Slayer) / FoF', 'Matador: hiere siempre a 4+', () => { const a = AB('slayer'); eq(a.w.wnd, 4); eq(a.b.wnd, 7); });
rule('poisonManbane', 'rules/new/aj_orcs2.txt (Poison of Manbane)', 'Perdición del Hombre: al herir, 4+ siempre tiene éxito', () => { const a = AB('poisonManbane'); eq(a.w.wnd, 4); eq(a.b.wnd, 7); });
rule('slayerDaemons', FOF + ' (Slayer of Daemons)', 'Matademonios: hiere a 4+ y Heridas múltiples (D3) contra behemots y engendros de la disformidad', () => { const a = AB('slayerDaemons'); eq(a.w.wnd, 4); const m = AB('slayerDaemons', { foe: 'woc_gspawn', fb: 'woc' }); });
rule('slayerDragons', FOF + ' (Slayer of Dragons)', 'Matadragones: hiere a 4+', () => { const a = AB('slayerDragons'); eq(a.w.wnd, 4); });
rule('monsterSlayer', CORE + ' (Monster Slayer)', 'Matamonstruos: el perfil lo marca', () => { const a = AB('monsterSlayer'); ok(a.w.slayM && !a.b.slayM); });
rule('rr1WoundC', 'rules/new/aj_empire2.txt (Order of the Blazing Heart)', 'Orden del Corazón Ardiente: repite los 1 naturales para herir', () => { const a = AB('rr1WoundC'); ok(a.w.rr1 && !a.b.rr1); });
rule('gromrilW', FOF + ' (Gromril Weapons)', 'Armas de gromril: arma de mano normal con FP −1', () => { const a = AB('gromrilW'); eq(a.w.ap - a.b.ap, 1); });
rule('juicioMW', 'rules/new/aj_tk2.txt (Juicio)', 'Juicio: Heridas múltiples (2)', () => { const a = AB('juicioMW'); eq(a.w.mw, 2); eq(a.b.mw, 0); });
rule('extraRank', CORE + ' (Fight in Extra Rank)', 'Luchar en fila extra: una fila más ataca salvo el turno en que carga', () => { const a = AB('extraRank'), c = AB('extraRank', { ch: 4 }); eq(a.w.atk - a.b.atk, 5, '+5 ataques de la 2ª fila'); eq(c.w.atk, c.b.atk, 'en la carga no'); });
rule('xAtkW', 'rules/new/leg_darkelves.txt (Many Heads)', 'Muchas cabezas: Ataques adicionales iguales a las Heridas restantes', () => { const a = AB('xAtkW'); ok(a.w.atk > a.b.atk, 'sin ataques extra'); });
// ----- Odio (primera ronda) -----
const hateDice = (rule, foe, fb, fought, add = true) => { const r = bout('state_troops', {}, foe, {}, { noFight: true, fa: 'empire', fb }); r.a.fought = fought; const f = () => { cur(r.s); diceAll(1); const n0 = nDice(); fight(r.s); return nDice() - n0; }; return add ? withSr('state_troops', [rule], f) : f(); };
for (const [h, foe, fb, no_] of [['hatred', 'orc_boyz', 'orcs', null], ['hatredOrcs', 'orc_boyz', 'orcs', 'dw_warriors'], ['hatredDwarfs', 'dw_warriors', 'dw', 'orc_boyz'], ['hatredHE', 'he_spearmen', 'he', 'orc_boyz'], ['hatredChaos', 'woc_warriors', 'woc', 'orc_boyz'], ['hatredUndead', 'vc_zombies', 'vc', 'orc_boyz']])
  rule(h, CORE + ' (Hatred)', `${h}: repite los fallos al impactar solo en la primera ronda y solo contra el enemigo odiado`, () => {
    const on = hateDice(h, foe, fb, false) - hateDice(h, foe, fb, false, false); ok(on > 0, 'no repite al impactar en la primera ronda'); const r2 = hateDice(h, foe, fb, true) - hateDice(h, foe, fb, true, false); eq(r2, 0, 'repite en rondas posteriores');
    if (no_) { const o = hateDice(h, no_, UNITS[no_].faction, false) - hateDice(h, no_, UNITS[no_].faction, false, false); eq(o, 0, 'repite contra un enemigo que no odia (' + no_ + ')'); }
  });
