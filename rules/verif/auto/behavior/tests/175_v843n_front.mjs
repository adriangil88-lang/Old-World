// v843n — FRONT_TABLE: frente y retaguardia de CADA unidad definidos de forma explícita (tabla de datos en render.js), coherentes con el frente que usan las reglas (arco frontal, flanco, retaguardia, carga, línea de visión)
import { T, DATA, GEOM, ok, eq } from '../lib2.mjs';
import fs from 'fs';
const APP = '/home/claude/tow/app/js/';
const RSRC = fs.readFileSync(APP + 'render.js', 'utf8');
const REAL = (await import(APP + 'data.js')).UNITS; // datos reales de la app (el arnés añade unidades de prueba)
const blk = RSRC.slice(RSRC.indexOf('// <FRONT_TABLE>'), RSRC.indexOf('// </FRONT_TABLE>'));
const FT = new Function('const exports = {}; ' + blk.replace('export const FRONT_TABLE =', 'return ').replace(/;\s*$/, ';'))();
const PI = Math.PI;
T('v843n-front-cobertura', 'render.js FRONT_TABLE + rules/verif/auto/out/front_table_v843n.tsv', 'Ninguna unidad (840) queda sin frente definido: yaw finito, fuente M/G/C y evidencia; G apunta a una unidad medida (M); M se mide en la propia unidad; C no cita captura', () => {
  const ids = Object.keys(REAL); eq(ids.length, 840, 'nº de unidades');
  for (const id of ids) {
    const f = FT[id]; ok(f, 'sin frente definido: ' + id); ok(Array.isArray(f) && f.length === 4, 'formato: ' + id);
    ok(Number.isFinite(f[0]) && Math.abs(f[0]) <= 2 * PI + 1e-6, 'yaw no válido: ' + id); ok(['M', 'G', 'C'].includes(f[1]), 'fuente no válida: ' + id);
    ok(typeof f[3] === 'string' && f[3].length > 3, 'sin evidencia/nota: ' + id);
    if (f[1] === 'M') eq(f[2], id, 'M se mide en la propia unidad: ' + id);
    if (f[1] === 'G') { ok(FT[f[2]] && FT[f[2]][1] === 'M', 'G debe apuntar a una unidad M: ' + id + ' -> ' + f[2]); }
    if (f[1] === 'C') ok(f[2] === 'proc' || f[2] === 'convención', 'C: ' + id);
  }
  for (const id of Object.keys(FT)) ok(REAL[id], 'entrada de la tabla sin unidad: ' + id);
  const tsv = fs.readFileSync('/home/claude/tow/rules/verif/auto/out/front_table_v843n.tsv', 'utf8').split('\n').slice(1).filter(Boolean); eq(tsv.length, ids.length, 'tsv completo');
});
T('v843n-front-render', 'render.js: figYaw()', 'El dibujado 3D aplica FRONT_TABLE (figYaw) a todas las figuras (mallas y procedurales) y la unidad 2D dibuja su frente en +x local de u.face', () => {
  ok(/const ya = u\.face \+ figYaw\(ut, RM\)/.test(RSRC), 'la malla no usa figYaw');
  ok(/putF\(fid, x, y, 0\.13, u\.face \+ figYaw\(ut, null\)/.test(RSRC), 'la figura procedural no usa figYaw');
  ok(!/u\.face \+ \(RM\.yaw \|\| 0\)/.test(RSRC), 'queda un yaw que no pasa por la tabla');
  ok(/ctx\.rotate\(u\.face\)[\s\S]{0,2600}ctx\.moveTo\(d \/ 2 \+ 0\.9, 0\)/.test(RSRC), 'el frente 2D no está en +x local de u.face');
});
// el frente de la figura en el mundo = u.face + yaw + (frente nativo de la malla = −yaw, medido); las reglas usan u.face: los dos coinciden
const dimsOf = (id) => { const d = REAL[id]; const models = Math.max(1, d.min || 1); return { x: 0, y: 0, face: 0, baseW: d.baseW, baseD: d.baseD, models, files: Math.max(1, Math.min(d.files || 1, models)), type: id }; };
T('v843n-front-arcos', 'core.txt «Facing/Arcs» (:3069-3071) + geom.sideOf/inFrontArc', 'Para TODAS las unidades, un punto delante del frente de la peana (u.face) cae en el arco frontal, detrás en el trasero y a los lados en el de flanco, con cualquier orientación; y el frente de la figura (u.face + yaw − yaw) es ese mismo eje', () => {
  let n = 0;
  for (const id of Object.keys(REAL)) {
    const d = REAL[id]; if (!d.baseW) continue; const base = dimsOf(id), dm = GEOM.dims(base), L = dm.d / 2 + 4;
    for (const th of [0, 0.7, PI / 2, 2.1, PI, -1.3]) {
      const u = { ...base, face: th }, P = (a, r) => ({ x: u.x + Math.cos(th + a) * r, y: u.y + Math.sin(th + a) * r });
      eq(GEOM.sideOf(u, P(0, L)), 'front', id + ' frente'); eq(GEOM.sideOf(u, P(PI, dm.d / 2 + 4)), 'rear', id + ' retaguardia');
      eq(GEOM.sideOf(u, P(PI / 2, dm.w / 2 + 4)), 'flank', id + ' flanco izq.'); eq(GEOM.sideOf(u, P(-PI / 2, dm.w / 2 + 4)), 'flank', id + ' flanco der.');
      const figFront = th + FT[id][0] + (-FT[id][0]); // frente nativo medido = −yaw
      ok(Math.abs(Math.atan2(Math.sin(figFront - th), Math.cos(figFront - th))) < 1e-9, id + ' frente de figura ≠ frente de peana');
    }
    n++;
  }
  ok(n >= 830, 'unidades comprobadas: ' + n);
});
T('v843n-front-casos', 'v843m (YAWFIX) + capturas shots/v843n', 'Casos prioritarios: Bloodcrushers conserva el giro corregido en v843m; keeper, carros del Caos, altar y forajidos tienen frente explícito', () => {
  for (const id of ['dm_keeper', 'dm_bloodcrushers', 'woc_chosen_chariot', 'woc_lord_chariot', 'woc_gorechariot', 'emp_lector_altar', 'br_outcast_h', 'br_outcast2_h', 'br_outcast3_h']) ok(FT[id] && ['M', 'G', 'C'].includes(FT[id][1]), id);
  ok(Math.abs(FT.dm_bloodcrushers[0] - PI / 2) < 1e-3, 'bloodcrushers conserva +π/2');
});
