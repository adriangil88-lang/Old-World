// v843n — peanas de TODAS las unidades contrastadas con libros/FAQ: tabla completa, correcciones inequívocas y ninguna unidad sin acción documentada
import { T, DATA, ok, eq } from '../lib2.mjs';
import fs from 'fs';
const U0 = DATA.UNITS;
const REAL = (await import('/home/claude/tow/app/js/data.js')).UNITS; // datos reales de la app (el arnés añade unidades de prueba)
const TSV = '/home/claude/tow/rules/verif/auto/out/base_table_v843o.tsv';
const rows = fs.readFileSync(TSV, 'utf8').split('\n').slice(1).filter(Boolean).map((l) => l.split('\t'));
const SUM = JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/out/base_summary_v843o.json', 'utf8'));
T('v843n-peanas-tabla', 'Core «Base Size» + libros de ejército + FAQ (rules/verif/auto/out/base_table_v843o.tsv)', 'La tabla cubre exactamente las unidades con peana (id, motor, oficial, fuente, acción), la peana del motor es la que dice la tabla y toda fila tiene una acción documentada', () => {
  const ids = Object.keys(REAL).filter((k) => REAL[k].baseW && !REAL[k].hidden);
  eq(rows.length, ids.length, 'una fila por unidad con peana');
  const seen = new Set();
  for (const [id, eng, off, src, act] of rows) {
    ok(U0[id], 'unidad inexistente ' + id); ok(!seen.has(id), 'fila repetida ' + id); seen.add(id);
    eq(eng, U0[id].baseW + 'x' + U0[id].baseD, 'peana del motor distinta de la tabla: ' + id);
    ok(act && act.length > 5, 'sin acción: ' + id); ok(src && off, 'sin fuente/oficial: ' + id);
  }
  for (const id of ids) ok(seen.has(id), 'falta en la tabla: ' + id);
});
T('v843n-peanas-corregidas', 'leg_daemons.txt:162/219/461/761/772/1017, fof.txt:4975, rh.txt:6348', 'Peanas inequívocas corregidas contra el libro: personaje montado = peana de la montura; las demás con el «Base Size» literal', () => {
  const W = { tk_catapult: [60, 100], dm_pinkhorrors: [30, 30], dm_plaguedrones: [50, 75], dm_soulgrinder: [150, 100], dm_herald_khorne_jug: [50, 75], dm_herald_tzeentch_disc: [50, 50], we_weaver_unicorn: [40, 60], we_singer_unicorn: [40, 60], he_stormweaver_uni: [40, 60] };
  for (const [id, wd] of Object.entries(W)) eq([U0[id].baseW, U0[id].baseD], wd, id);
  // coherencia con la montura: Unicornio de Bretonia (mismo libro) tiene la misma peana
  eq([U0.br_damsel_uni.baseW, U0.br_damsel_uni.baseD], [40, 60]);
  eq([U0.we_weaver_unicorn.baseW, U0.we_weaver_unicorn.baseD], [U0.br_damsel_uni.baseW, U0.br_damsel_uni.baseD]);
});
T('v843n-peanas-faq', 'FAQ RH p.44/46, FAQ FoF AJ Dwarfen Mountain Holds p.46', 'Las peanas que dicta una FAQ (Hellcannon, Skin Wolves, Marauder Chieftain/Berserkers, Goblin Hewers) mandan sobre el libro', () => {
  eq([U0.woc_hellcannon.baseW, U0.woc_hellcannon.baseD], [100, 150]); eq([U0.woc_skinwolves.baseW, U0.woc_skinwolves.baseD], [50, 50]);
  eq([U0.woc_chieftain.baseW, U0.woc_chieftain.baseD], [30, 30]); eq([U0.woc_berserkers.baseW, U0.woc_berserkers.baseD], [30, 30]); eq([U0.dw_hewer.baseW, U0.dw_hewer.baseD], [50, 75]);
});
T('v843n-peanas-resumen', 'rules/verif/auto/out/base_summary_v843o.json', 'El resumen de categorías suma el total de unidades y las que no se pueden contrastar están todas explicadas', () => {
  const s = SUM.sum; let t = 0; for (const v of Object.values(s)) t += v; eq(t, SUM.total, 'las categorías suman el total');
  const sin = Object.entries(SUM.out).filter(([, o]) => o.cat === 'sin_dato'); eq(sin.length, s.sin_dato);
  for (const [id, o] of sin) ok(/sin dato|sin regla|N\/A|sin entrada/.test(o.act), 'sin_dato sin motivo: ' + id);
  for (const [id, o] of Object.entries(SUM.out)) if (o.cat === 'dudosa') ok(/DUDOSA|pendiente|DISTINTA/.test(o.act), 'dudosa sin explicación: ' + id);
});
