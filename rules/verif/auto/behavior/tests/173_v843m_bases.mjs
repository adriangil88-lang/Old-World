// v843m — peanas con horquilla (Core Rulebook, Other Model Information / Base Size: «la peana con la que viene la miniatura es la correcta»)
import { T, R, DATA, game, ok, eq } from '../lib2.mjs';
const U0 = DATA.UNITS;
const mk = (type, base) => { const s = game([{ type, models: 1, ...(base ? { base } : {}) }], [{ type: 'orc_boyz', models: 5 }]); return s.units.find((u) => u.type === type && u.owner === 0); };
T('v843m-peana-horquilla-datos', 'leg_daemons.txt:103/318/492/699, rh.txt 1437/1606/2438/3821/3870/4613, fof.txt 4832/5569, leg_ogres.txt 674, aj_orcs2.txt 1203', 'Cada unidad con horquilla la declara, y la peana estándar del motor cae dentro de ella', () => {
  const B = DATA.BASE_RANGE; ok(B && Object.keys(B).length >= 22);
  for (const [id, r] of Object.entries(B)) { const d = U0[id]; ok(d, id); eq(d.baseRange, { min: r[0], max: r[1] }, id); const lo = Math.min(r[0][0], r[1][0]), hi = Math.max(r[0][0], r[1][0]), lo2 = Math.min(r[0][1], r[1][1]), hi2 = Math.max(r[0][1], r[1][1]); ok(d.baseW >= lo && d.baseW <= hi && d.baseD >= lo2 && d.baseD <= hi2, id + ' estándar fuera de la horquilla'); }
  eq(B.dm_keeper, [[50, 50], [100, 150]]); eq(B.dm_gud, [[50, 50], [150, 100]]);
});
T('v843m-peana-eleccion', 'Core Rulebook p.? Base Size', 'El jugador elige la peana: por defecto la estándar; min y max se aplican a la unidad y a su huella; sin horquilla se ignora', () => {
  const a = mk('dm_keeper'), b = mk('dm_keeper', 'min'), c = mk('dm_keeper', 'max');
  eq([a.baseW, a.baseD], [60, 100]); eq([b.baseW, b.baseD], [50, 50]); eq([c.baseW, c.baseD], [100, 150]);
  const g = game([{ type: 'dm_gud', models: 1, base: 'max' }], [{ type: 'orc_boyz', models: 5 }]); const gu = g.units.find((u) => u.type === 'dm_gud'); eq([gu.baseW, gu.baseD], [150, 100]);
  const w = mk('empire_general', 'max'); eq([w.baseW, w.baseD], [U0.empire_general.baseW, U0.empire_general.baseD]);
  const area = (u) => { const d = GEOMd(u); return d.w * d.d; };
  ok(area(c) > area(a) && area(a) > area(b));
});
T('v843m-peana-choices', 'main.js (botón Peana)', 'baseChoices ofrece estándar/min/max sin repetidos', () => {
  const ch = DATA.baseChoices('dm_keeper'); eq(ch.map((o) => o.id), ['std', 'min', 'max']);
  eq(DATA.baseChoices('pump_wagon').map((o) => o.id), ['std', 'max']); // estándar = mín.
  eq(DATA.baseChoices('empire_general'), []);
});
import { GEOM } from '../lib2.mjs';
const GEOMd = (u) => GEOM.dims(u);
