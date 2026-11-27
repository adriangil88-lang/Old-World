// v838 — Objetos de aura: efectos sobre unidades cercanas (Liderazgo, Iniciativa, armadura, HA) con y sin el objeto
import { T, N, R, DATA, game, ok, eq, cur, put, U, join, diceAll, engage } from '../lib3.mjs';
import { carrierOf, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
// portador (jugador 0) y una unidad enemiga a «d» pulgadas; devuelve { s, c, e }
const setup = (key, d, std, type0, foe = 'state_troops') => { const it = ITEMS[key || '']; const type = std ? 'dw_warriors' : type0; const fac = DATA.UNITS[type].faction; const s = game([std ? { type, models: 20, std: true, ...(key ? { banner: key } : {}) } : { type, models: 1, ...(key ? { items: [key] } : {}) }], [{ type: foe, models: 10 }], { f: [fac, fac === 'empire' ? 'orcs' : 'empire'] }); const c = U(s, type, 0), e = U(s, foe, 1); if (std && key) c.banner = key; put(c, 36, 40); put(e, 36, 40 - d - 1.5, Math.PI / 2); cur(s); return { s, c, e }; };
const val = (f, key, d, std, type) => { const x = setup(key, d, std, type); cur(x.s); return f(x); };
const aura = (key, std, f, expect, why, far = true) => T('v838-it-au-' + key, FILE, `${ITEMS[key].name}: ${why}`, () => { const type = std ? null : carrierOf(ITEMS[key]); const va = val(f, key, 4, std, type), vb = val(f, null, 4, std, type); eq(vb - va, expect, `cerca: ${vb} → ${va}`); if (far) eq(val(f, key, 16, std, type), vb, 'a más de 6" no se aplica'); });
aura('wraithstone', false, ({ s, e }) => R.ldOf(s, e), 1, 'enemigos a 6": −1 Liderazgo');
aura('tkaj_centuries', true, ({ e }) => R.effI(e, []), 1, 'enemigos a 6": −1 Iniciativa');
aura('woc_doom', true, ({ s, e }) => R.ldOf(s, e), 1, 'enemigos con línea de visión: −1 Liderazgo', false);
// armadura del enemigo cercano: umbral de salvación por armadura de la unidad enemiga a 4" y a 16" del Tótem
const armThr = (x) => { for (let v = 2; v <= 6; v++) { cur(x.s); diceAll(v); if (R.woundAndSave(x.s, x.e, 1, 10, 0, { noRegen: true, noWard: true, auto: true }).through === 0) return v; } return 7; };
aura('bm_totem_rust', true, armThr, -1, 'todos los modelos a 6": −1 a sus salvaciones por armadura');
// HA de un monstruo enemigo contra el portador
const monWS = (key, d, contact) => { const it = ITEMS[key], type = carrierOf(it), fac = DATA.UNITS[type].faction; const s = game([{ type, models: 1, ...(key ? { items: [key] } : {}) }], [{ type: 'orc_ogre_bulls', models: 3 }], { f: [fac, fac === 'orcs' ? 'empire' : 'orcs'] }); const c = U(s, type, 0), m = U(s, 'orc_ogre_bulls', 1); put(c, 36, 40); put(m, 36, 40 - d - 1.5, Math.PI / 2); if (contact) engage(s, c, m); cur(s); return R.attackProfile(m, c).ws; };
T('v838-it-au-empaj_hourglass', FILE, `${ITEMS.empaj_hourglass.name}: los monstruos enemigos en contacto sufren −1 HA`, () => { const a = monWS('empaj_hourglass', 0.1, true); R.__setCUR(null); const b = (() => { const it = ITEMS.empaj_hourglass, type = carrierOf(it); const s = game([{ type, models: 1 }], [{ type: 'orc_ogre_bulls', models: 3 }], { f: [DATA.UNITS[type].faction, 'orcs'] }); const c = U(s, type, 0), m = U(s, 'orc_ogre_bulls', 1); put(c, 36, 40); put(m, 36, 38.4, Math.PI / 2); engage(s, c, m); cur(s); return R.attackProfile(m, c).ws; })(); eq(b - a, 1, `HA del monstruo ${b} → ${a}`); });
