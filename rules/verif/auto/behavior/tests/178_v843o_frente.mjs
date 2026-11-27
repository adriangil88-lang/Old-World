// v843o — frente de figuras (revisión visual con flecha de frente, vistas 3/4 y cenitales) y geometría de carros procedurales.
import { T, DATA, GEOM, ok, eq } from '../lib2.mjs';
import fs from 'fs';
const APP = '/home/claude/tow/app/js/';
const RSRC = fs.readFileSync(APP + 'render.js', 'utf8');
const GSRC = fs.readFileSync(APP + 'gl3d.js', 'utf8');
const blk = RSRC.slice(RSRC.indexOf('// <FRONT_TABLE>'), RSRC.indexOf('// </FRONT_TABLE>'));
const FT = new Function('const exports = {}; ' + blk.replace('export const FRONT_TABLE =', 'return ').replace(/;\s*$/, ';'))();
const PI = Math.PI;
T('v843o-front-giros', 'shots/v843o/susp, flip, sc2_* (capturas con flecha de frente)', 'Giros medidos en v843o: ocho unidades que de espaldas a la flecha quedan 180° (Waystalker, Bailarina de sombras, Exaltado del Caos, Drakes de Hierro, Castellano, Wargor, Leadbelchers, Ogros del Caos) y el Carnosaurio Scar (malla posada a 45°: 3π/4)', () => {
  for (const id of ['we_waystalker', 'we_shadowdancer', 'woc_exalted', 'dw_irondrakes', 'cd_castellan', 'bm_wargor', 'ok_leadbelchers', 'woc_ogres']) { ok(FT[id], id); eq(FT[id][1], 'M', id + ' medida'); ok(Math.abs(FT[id][0] - PI) < 1e-3, id + ' giro 180°'); }
  ok(FT.we_shadowdancer_w && Math.abs(FT.we_shadowdancer_w[0] - PI) < 1e-3, 'alias hereda el giro');
  ok(FT.orc_ogre_bulls && Math.abs(FT.orc_ogre_bulls[0] - PI) < 1e-3, 'ogros (orcos) heredan el giro');
  ok(Math.abs(FT.lm_scar_carno[0] - 3 * PI / 4) < 1e-3, 'scar carno 3π/4'); eq(FT.lm_scar_carno[1], 'M', 'scar medido');
  ok(Math.abs(FT.lm_oldblood_carno[0]) < 1e-9, 'oldblood sin giro');
  for (const id of ['he_frostheart', 'emp_general_igriffon']) { eq(FT[id][1], 'M', id + ' promovida a medida'); ok(Math.abs(FT[id][0]) < 1e-9, id + ' yaw 0'); }
  const n = { M: 0, G: 0, C: 0 }; for (const k in FT) n[FT[k][1]]++; eq(n.M + n.G + n.C, 840, 'cobertura'); eq(n.C, 77, 'convención residual (v843p: br_prophetess_uni -> M y br_damsel_uni -> G; antes 79)');
});
T('v843o-front-regla', 'render.js figYaw + geom.sideOf', 'El giro de figura no altera el frente de reglas: u.face sigue siendo el frente de peana, arcos y colisión', () => {
  const d = DATA.UNITS ? DATA.UNITS.dw_irondrakes : null; ok(/const ya = u\.face \+ figYaw\(ut, RM\)/.test(RSRC), 'la malla usa figYaw');
  for (const th of [0, 1, PI]) { const u = { x: 0, y: 0, face: th, baseW: 50, baseD: 50, models: 5, files: 5, type: 'dw_irondrakes' }; const dm = GEOM.dims(u); eq(GEOM.sideOf(u, { x: Math.cos(th) * (dm.d / 2 + 4), y: Math.sin(th) * (dm.d / 2 + 4) }), 'front', 'frente con giro ' + th); }
});
T('v843o-carro-geometria', 'gl3d.js figChariot', 'Carros procedurales: ruedas verticales (eje X, aro en el plano YZ) con radios y el conjunto centrado en la peana (se desplaza −0.55 en Z)', () => {
  const i = GSRC.indexOf('function figChariot'); ok(i > 0, 'figChariot'); const body = GSRC.slice(i, i + 6000);
  ok(/mbLimb\(m, \[sx \* 0\.58 - 0\.05, 0\.42, -0\.55\], \[sx \* 0\.58 \+ 0\.05, 0\.42, -0\.55\]/.test(body), 'rueda con eje en X');
  ok(/for \(let a = 0; a < 3; a\+\+\)/.test(body), 'tres radios');
  ok(/m\.p\[i\] -= 0\.55/.test(body), 'carro centrado en la peana');
});
