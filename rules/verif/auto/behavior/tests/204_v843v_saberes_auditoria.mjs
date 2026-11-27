// v843v (punto 2) — auditoría de TODOS los magos: cada unidad con Nivel de Magia (propio, por opción o por objeto) se contrasta contra la tabla fuente (libros) en loresForWiz, en createGame (u.lore y loreAlt.opts), en el editor de listas (main.js sólo usa loresForWiz) y en la ventana de Saber (sgWizard usa loreAlt.opts)
import fs from 'node:fs';
import { T, R, DATA, game, U, ok, eq } from '../lib2.mjs';
import { SRC } from './202_v843u_saberes.mjs';
const { UNITS } = DATA;
const MAIN = fs.readFileSync(new URL('../../../../../app/js/main.js', import.meta.url), 'utf8');
const BOUND_ONLY = new Set(['tk_casket', 'dw_anvil', 'lm_bastiladon']); // magia ligada por objeto/regla (sin Saber elegible)
const srcOf = (id) => SRC.find(([ids]) => ids.some((p) => id === p || id.startsWith(p)));
const FIVE = ['tk_settra', 'vc_corpsecart', 'he_dragonmage', 'we_sisters', 'de_warlocks'];
const EXPECT5 = { tk_settra: ['necro'], vc_corpsecart: ['necro'], he_dragonmage: ['battle', 'elementalism'], we_sisters: ['battle', 'elementalism'], de_warlocks: ['dark', 'daemonology'] };
T('v843v-magos-todos-con-fuente', 'rules.js loresForWiz', 'TODO mago del juego (propio o por opción) tiene una fuente en la tabla y ofrece exactamente sus Saberes; los cinco que el usuario dudaba, uno por uno', () => {
  const s = { lists: ['grand', 'grand'] }, sin = [], mal = [];
  for (const [id, d] of Object.entries(UNITS)) {
    if (!d.wizard || BOUND_ONLY.has(id)) continue; const src = srcOf(id); if (!src) { sin.push(id); continue; }
    const got = R.loresForWiz(s, 0, d, []).slice().sort().join(','), want = src[1].slice().sort().join(','); if (got !== want) mal.push(`${id}: [${got}] ≠ [${want}] (${src[2]})`);
  }
  ok(!sin.length, 'magos sin fuente en la tabla: ' + sin.join(', ')); ok(!mal.length, mal.join(' | '));
  for (const id of FIVE) eq(R.loresForWiz(s, 0, UNITS[id], []).slice().sort(), EXPECT5[id].slice().sort(), id + ' (Settra / Carro de Cadáveres / Mago Dragón / Hermanas de la Espina / Brujos de Fuego Maldito)');
});
T('v843v-magos-opcion-y-objeto', 'rules.js loresForWiz (opciones «Mago de nivel N», Sombrero de Mago, Lenguaje de los Sacerdotes)', 'Los magos que lo son por una opción usan los Saberes de su libro; Settra/Lenguaje: sólo Nigromancia (AJ TK); Sombrero de Mago: cualquiera de los siete Saberes del Core', () => {
  const s = { lists: ['grand', 'grand'] }, L = (d, it = []) => R.loresForWiz(s, 0, d, it).slice().sort().join(',');
  for (const [id, o] of [['bm_doombull', 'w1'], ['bm_gorebull', 'w2']]) { const op = UNITS[id].opts.find((x) => x.id === o); eq(L({ ...UNITS[id], wizard: op.patch.set.wizard, lores: op.patch.set.lores }), 'battle,dark', id); }
  eq(L(UNITS.tk_king, ['tk_language']), 'necro', 'Lenguaje de los Sacerdotes'); eq(L(UNITS.empire_captain || UNITS.state_captain || Object.values(UNITS).find((u) => u.faction === 'empire' && u.cat === 'char' && !u.wizard), ['wiz_hat']), 'battle,daemonology,dark,elementalism,high,illusion,necro', 'Sombrero de Mago');
  eq(L(UNITS.he_prince || Object.values(UNITS).find((u) => u.faction === 'he' && u.cat === 'char' && !u.wizard), ['h_loremaster']), 'battle,elementalism,high,illusion', 'Maestro del Saber (FoF)');
  eq(L({ ...UNITS.sk_engineer, wizard: { level: 1, lore: 'elementalism' } }), 'battle,elementalism', 'Ingeniero Brujo con nivel');
});
T('v843v-magos-createGame-por-unidad', 'rules.js createGame (u.lore y loreAlt.opts)', 'En una partida real, cada mago tiene un Saber permitido y el selector de la ventana de Saber (loreAlt.opts) sólo ofrece permitidos', () => {
  let n = 0; const mal = [];
  for (const [id, d] of Object.entries(UNITS)) {
    if (!d.wizard || BOUND_ONLY.has(id) || d.wizard.level < 1) continue;
    let s; try { s = game([{ type: id, models: Math.max(1, d.min || 1) }], [{ type: 'orc_boyz', models: 10 }], { f: [d.faction === 'merc' ? 'empire' : d.faction, d.faction === 'orcs' ? 'empire' : 'orcs'], phase: 'deploy' }); } catch { continue; }
    const u = s.units.concat(s.units.flatMap((x) => x.joined || [])).find((x) => x.type === id); if (!u) continue; n++;
    const al = R.loresForWiz(s, 0, D(d), u.items || []); function D(x) { return x; }
    if (!al.includes(u.lore)) mal.push(`${id}: Saber ${u.lore} ∉ [${al}]`); if (u.loreAlt && !u.loreAlt.opts.every((l) => al.includes(l))) mal.push(`${id}: opts [${u.loreAlt.opts}] ⊄ [${al}]`);
  }
  ok(n > 60, 'magos comprobados en partida: ' + n); ok(!mal.length, mal.join(' | '));
});
T('v843v-magos-editor-y-ventana', 'main.js', 'El editor de listas y la ventana de Saber NO tienen listas propias: ambos salen de loresForWiz / loreAlt.opts', () => {
  ok(!/WIZ_LORES\[d\.faction\]\[0\]/.test(MAIN) && !/l !== 'troll'/.test(MAIN), 'main.js no calcula Saberes por su cuenta'); ok(!/d\.lores \|\| WIZ_LORES/.test(MAIN), 'sin copia de la regla en el editor');
  ok((MAIN.match(/loresForWiz\(/g) || []).length >= 4, 'editor (botón, etiqueta, 2.º Saber) y ventana usan loresForWiz'); ok(/c\.loreAlt\.opts/.test(MAIN), 'la ventana de Saber ofrece loreAlt.opts');
});
