// v838 — Objetos que se usan en la Fase de Mando (acción useItem): el efecto del texto, con el chequeo de Liderazgo superado y con él fallado
import { T, N, R, DATA, game, ok, eq, cur, put, U, join, dice, diceAll, msgs, engage } from '../lib3.mjs';
import { wearAny, UNC } from './_items.mjs';
const { ITEMS } = DATA; const FILE = 'app/js/data.js (ITEMS: texto del objeto)';
// ejecuta useItem con el portador solo (o con el enemigo a distancia 14 para efectos de zona); roll = dados del chequeo
const use = (key, o = {}) => { const w = wearAny(key); const { s, u, e } = w; s.phase = 'strategy'; s.active = 0; put(u, 36, 40); if (!o.engaged) put(e, 36, 24, Math.PI / 2); else put(e, 36, 40 - 3.2, Math.PI / 2); if (o.engaged) engage(s, u, e); if (o.hurt) { u.wounds = Math.max(1, u.wounds - 1); } cur(s); dice(...(o.dice || [1, 1])); diceAll(o.d ?? 2); const r = R.apply(s, { t: 'useItem', id: u.id, item: key }); return { ...w, r, m: msgs(r.events || []), fail: r.ok === false ? (r.error || r.reason) : null }; };
const KIND = { hatchet: /Hacha del Explorador: él y su unidad ganan Moverse entre la maleza/, icon: /los enemigos no pueden usar Volar/, storm: /los enemigos no vuelan y disparan con −1/, chalice: /alcance enemigo a la mitad/, egg: /Resistencia 6 y aliento nocivo/, skalm: null, flask: null, summonSk: /surgen \d+ Guerreros Esqueleto|no hay sitio/, scourgeM: /azota a los suyos: \+\d Movimiento/, staffQ: /Bastón de Quietud|disipan|no hay hechizos/ };
for (const key of UNC()) {
  const it = ITEMS[key]; if (!it.cmdUse || !(it.cmdUse in KIND)) continue; const cu = it.cmdUse;
  T('v838-it-cu-' + key, FILE, `${it.name}: uso en la Fase de Mando (${cu})`, () => {
    const hurt = cu === 'skalm'; const a = use(key, { hurt }); ok(!a.fail, 'se puede usar: ' + a.fail);
    if (KIND[cu]) ok(KIND[cu].test(a.m), `efecto del texto: ${a.m.slice(0, 160)}`);
    if (cu === 'skalm') { ok(a.u.wounds >= 0, 'sin error'); ok((a.s.units.find((x) => x.id === a.u.id).fx || []).some((f) => f.k === 'potT') || /Herida|Resistencia/.test(a.m), 'recupera una Herida y +1 R: ' + a.m.slice(0, 120)); }
    if (cu === 'flask') { ok(/Frasco de Demonio|pánico/i.test(a.m) || a.r.ok, 'los enemigos en alcance de mando hacen Pánico: ' + a.m.slice(0, 120)); }
    if (['icon', 'scourgeM', 'summonSk'].includes(cu)) { const b = use(key, { dice: [6, 5] }); ok(/falla el chequeo de Liderazgo/.test(b.m) && !/ activa el Icono|surgen \d+ Guerreros|azota a los suyos: \+/.test(b.m), 'con el chequeo de Liderazgo fallado no surte efecto: ' + b.m.slice(0, 120)); }
    if (['hatchet', 'storm'].includes(cu) || it.single) { const w = a; w.s.phase = 'strategy'; cur(w.s); const r2 = R.apply(w.s, { t: 'useItem', id: w.u.id, item: key }); ok(r2.ok === false || /fail|no disponible|ya/i.test(String(r2.error || r2.reason || '')), 'no puede usarse dos veces: ' + JSON.stringify(r2).slice(0, 100)); }
  });
}
