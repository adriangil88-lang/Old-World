// v843p — figuras de máxima calidad para Guerreros del Caos, Altos Elfos, Imperio, Elfos Silvanos y Cathay (archivos nuevos + todos los JSON de Cathay)
import { T, DATA, ok, eq } from '../lib2.mjs';
import fs from 'fs';
const HM = fs.readFileSync('/home/claude/tow/app/js/hdmap.js', 'utf8');
const XM = JSON.parse(HM.match(/export const XMODELS = (\{.*?\});\n/s)[1]);
const MOD = JSON.parse(fs.readFileSync('/home/claude/tow/app/js/models.js', 'utf8').match(/export const MODELS = (\{.*?\});\n/s)[1]);
const RSRC = fs.readFileSync('/home/claude/tow/app/js/render.js', 'utf8');
const xp = (pack) => JSON.parse(fs.readFileSync(`/home/claude/tow/app/hd/xp_${pack}.json`, 'utf8')).m;
const UP = { woc_forsaken: 'woc', woc_lord_steed: 'woc', woc_sorc_lord: 'woc', woc_ex_sorc: 'woc', woc_dprince: 'woc', woc_lord_manticore: 'woc', woc_gorechariot: 'woc', he_skycutter: 'he', emp_general_griffon: 'empire' };
T('v843p-old-a-maxima', 'tools/v843p (ogen.py + figkit); JSON 2427016876/2425660555/2426060468', 'Nueve figuras «old» (2600 triángulos) pasan a paquete x (xp/xh/xu) en el MISMO espacio que el modelo antiguo (misma malla del mod, bbox idéntica): no cambia escala, frente ni peana', () => {
  for (const [id, pack] of Object.entries(UP)) {
    eq(XM[id], pack, id + ' en XMODELS'); const m = xp(pack)[id]; ok(m, id + ' en xp_' + pack);
    const o = MOD[id]; ok(o, id + ' antiguo'); for (let k = 0; k < 3; k++) { ok(Math.abs(m.min[k] - o.min[k]) < 0.01 && Math.abs(m.max[k] - o.max[k]) < 0.01, `${id} bbox eje ${k}`); }
    ok(fs.existsSync(`/home/claude/tow/app/hd/xh_${pack}.dat.wasm`) && fs.existsSync(`/home/claude/tow/app/hd/xu_${pack}.dat.wasm`), 'xh/xu ' + pack);
  }
});
T('v843p-unicornio-bretoniano', 'JSON 2426103195 «Prophetess on Unicorn» (malla 466DD3385E, textura 52B17AFD7A 4096 px); FIG_ALIAS en data.js', 'La Profetisa en Unicornio usa la malla del mod (mismo mod que el resto de la Bretonia); la Doncella en Unicornio la toma prestada (avisado como figura prestada)', () => {
  eq(XM.br_prophetess_uni, 'bret'); ok(xp('bret').br_prophetess_uni.parts.length >= 1, 'xp');
  eq(DATA.FIG_ALIAS.br_damsel_uni, 'br_prophetess_uni'); ok(DATA.FIG_BORROW.has('br_damsel_uni'), 'borrow');
  const m = RSRC.match(/br_prophetess_uni: \[0, '(\w)'/); eq(m[1], 'M'); const d = RSRC.match(/br_damsel_uni: \[0, '(\w)', '(\w+)'/); eq([d[1], d[2]], ['G', 'br_prophetess_uni']);
});
T('v843p-sin-huerfanas', 'hdmap.js XTEX/XTEXU vs xp_*.json', 'No quedan texturas xt/xu huérfanas (sin ninguna figura que las use) ni referencias a ficheros inexistentes: ahorra ficheros del artefacto (límite 511)', () => {
  const XT = JSON.parse(HM.match(/export const XTEX = (\{.*?\});\n/s)[1]), XU = JSON.parse(HM.match(/export const XTEXU = (\{.*?\});\n/s)[1]);
  const used = new Set(); for (const f of fs.readdirSync('/home/claude/tow/app/hd').filter((x) => /^xp_.*\.json$/.test(x))) for (const m of Object.values(JSON.parse(fs.readFileSync('/home/claude/tow/app/hd/' + f, 'utf8')).m)) for (const p of m.parts) if (p.t) used.add(p.t);
  for (const k of Object.keys(XT)) ok(used.has(k), 'xt huérfana ' + k); for (const k of Object.keys(XU)) ok(used.has(k), 'xu huérfana ' + k);
  for (const v of [...Object.values(XT), ...Object.values(XU)]) ok(fs.existsSync('/home/claude/tow/app/' + v), 'falta ' + v);
  const nxt = fs.readdirSync('/home/claude/tow/app/hd').filter((x) => /^xt_/.test(x)).length; ok(nxt + 35 <= 511, 'ficheros del artefacto <= 511 (xt=' + nxt + ')');
});
