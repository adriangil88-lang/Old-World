// v839 — Objetos restantes: perfil de combate, desafíos, disparo con terreno, reacciones
import { T, N, R, DATA, ok, eq, cur, put, game, U, dice, diceAll, msgs, asks, by, join, engage, charged, fight, shotOf } from '../lib3.mjs';
import { FILE, profOf, meleeHits, holderFight, bearer, muted, joinedShooter, dispel } from './_it2.mjs';
import { carrierOf } from './_items.mjs';
const { ITEMS, UNITS } = DATA;
const TT = (key, desc, fn) => T('v839-it-' + key, FILE, `${ITEMS[key].name}: ${desc}`, fn);
// --- Virtud La Justa: repite heridas falladas con la lanza (solo el turno de carga; core.txt:7290)
DATA.UNITS.br_duke_l = { ...UNITS.br_duke, id: 'br_duke_l', lance: true };
TT('kv_joust', 'repite las heridas falladas con la lanza: solo en el turno en que carga (Lanza, core.txt:7290-7292)', () => {
  const a = profOf('kv_joust', { type: 'br_duke_l', charge: true }), b = profOf(null, { like: 'kv_joust', type: 'br_duke_l', charge: true }); ok(a.P.rrw === true, 'con carga: repite heridas (' + a.P.rrw + ')'); ok(!b.P.rrw, 'control sin Virtud');
  const c = profOf('kv_joust', { type: 'br_duke_l', charge: false }); ok(!c.P.rrw, 'sin carga no usa lanza: no repite');
});
TT('kv_confidence', 'siempre lanza y acepta desafíos y en desafío repite los fallos al impactar', () => {
  ok(ITEMS.kv_confidence.confid, 'datos'); const s = game([{ type: 'br_duke', models: 1, items: ['kv_confidence'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'combat' }); const d = U(s, 'br_duke', 0); cur(s);
  ok(R.mustDuel({ k: 'p', m: d }) === true, 'no puede rechazar: debe aceptar'); const s2 = game([{ type: 'orc_warboss', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'combat' }); cur(s2); ok(!R.mustDuel({ k: 'p', m: U(s2, 'orc_warboss', 0) }), 'control: sin Virtud sí puede');
});
T('v839-it-kv_confidence_rr', FILE, 'Virtud: Confianza: en un desafío repite los fallos al impactar (resuelto con dados forzados)', () => {
  const q = [1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6]; const run = (k) => { let i = 0; return holderFight(k, { like: 'kv_confidence', type: 'br_baron', foe: 'orc_warboss', foeN: 1, v: [1, 6, 1, 6, 1, 6, 1, 6, 1, 6], active: 1 }); }; const w = run('kv_confidence'), c = run(null);
  ok(/Desafío/.test(w.m), 'hay desafío: ' + w.m.slice(0, 120)); eq(w.h, w.n, `con Confianza todos los fallos se repiten (${w.h}/${w.n})`); ok(c.h < c.n, `control sin Virtud: ${c.h}/${c.n}`);
});
TT('gauntlet', 'los desafíos lanzados por el portador no pueden rechazarse', () => {
  const mk = (it) => { const s = game([{ type: 'br_sergeant', models: 1, items: it ? ['gauntlet'] : [] }, { type: 'br_realm', models: 5 }], [{ type: 'orc_boyz', models: 10 }], { f: ['bret', 'orcs'], phase: 'combat', active: 0 }); const j = U(s, 'br_sergeant', 0), k = U(s, 'br_realm', 0), e = U(s, 'orc_boyz', 1); put(k, 36, 24, -Math.PI / 2); put(e, 36, 20, Math.PI / 2); engage(s, k, e); join(s, j, k); cur(s); return { s, j, e }; };
  const a = mk(true), b = mk(false); ok(a.j.items.includes('gauntlet'), 'montaje'); const f = (x) => msgs(fight(x.s)); const ma = f(a), mb = f(b); ok(!/rechaz/i.test(ma) || !/rechaz.*Guantelete/i.test(ma), 'sin rechazo'); ok(!/rechaza el desaf/i.test(ma), 'con Guantelete no se rechaza: ' + ma.slice(0, 200)); ok(ITEMS.gauntlet.noRefuse === true && R.D(a.j).id === 'br_sergeant', 'datos');
});
TT('sp_netlings', 'en un desafío, su rival sufre −1 para impactar (+1 al valor necesario)', () => {
  const thr = (k) => { for (let v = 2; v <= 6; v++) { const r = meleeHits(k, { like: 'sp_netlings', foe: 'orc_warboss', foeN: 1, type: 'we_lord', mute: true, v, q: [] }); if (/Desafío/.test(r.m) && r.n != null) { const h = meleeHits(k, { like: 'sp_netlings', foe: 'orc_warboss', foeN: 1, type: 'we_lord', mute: true, v }); if (h.h > 0) return v; } } return 7; };
  const w = thr('sp_netlings'), c = thr(null); ok(c < 6, 'control: necesita ' + c + '+'); eq(w, c + 1, 'con Redecillas el rival necesita un punto más (' + c + '+ → ' + w + '+)');
  // fuera de desafío no aplica
  ok(ITEMS.sp_netlings.netlings, 'datos');
});
TT('sp_malevolents', 'el modelo impactado por su arco sufre además D3 impactos de F2, Perforante (1)', () => {
  const mk = (k) => { const s = game([{ type: 'we_lord', models: 1, items: k ? [k] : [], bow: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'shoot' }); const a = put(U(s, 'we_lord', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 28, Math.PI / 2); cur(s); return { s, a, t }; };
  const run = (k) => { const { s, a, t } = mk(k); globalThis.__WSL = []; diceAll(6); const ev = []; try { R.resolveShot(s, a, t, ev, {}); } catch (e) { ok(false, String(e)); } return { log: globalThis.__WSL.slice(), m: msgs(ev) }; };
  const w = run('sp_malevolents'), c = run(null); ok(/Malévolos/.test(w.m) || w.log.some((x) => x.S === 2), 'se aplican los impactos F2: ' + w.m.slice(0, 200)); ok(!/Malévolos/.test(c.m), 'control sin objeto');
});
TT('gf_ichor', 'por cada Herida que pierde durante un desafío su enemigo sufre un impacto de F4, FP −2 (v839: el desafío entre dos personajes solitarios no se marcaba como desafío)', () => {
  const Q = [6, 6, 6, 6, 6, 1, 1, 1, 6, 1, 1, 1, 6, 1, 1, 1, 6, 1, 1, 1, 6, 1, 1, 1];
  const a = meleeHits('gf_ichor', { foe: 'orc_warboss', foeN: 1, mute: true, v: 4, q: Q }), c = meleeHits(null, { like: 'gf_ichor', foe: 'orc_warboss', foeN: 1, mute: true, v: 4, q: Q });
  ok(a.wd >= 1 && /Desafío/.test(a.m), 'el portador pierde Heridas en un desafío: ' + a.m.slice(0, 160)); ok(new RegExp(`Icor ácido: .* sufre ${a.wd} impactos`).test(a.m), `un impacto por Herida perdida (${a.wd}): ` + a.m.slice(0, 300)); ok(!/Icor/.test(c.m), 'control sin el Don');
  const n = meleeHits('gf_ichor', { foe: 'orc_boyz', foeN: 5, mute: true, v: 4, q: Q }); ok(!/Icor/.test(n.m), 'sin desafío (unidad normal) no se aplica');
});
// --- Locus de Merciw: F del portador y del atacante no se modifican por armas (rules.js:5824)
TT('locus', 'la Fuerza del portador y la de quien lo ataque no se modifican por armas', () => {
  const a = profOf('locus', { type: 'we_lord', foe: 'empire_knights' }); const b = profOf(null, { like: 'locus', type: 'we_lord', foe: 'empire_knights' }); ok(a.P.S <= b.P.S, `con Locus la F del portador no supera la del control (${a.P.S} vs ${b.P.S})`);
  const e = profOf('locus', { type: 'we_lord', foe: 'empire_knights', charge: true }); const f = profOf(null, { like: 'locus', type: 'we_lord', foe: 'empire_knights', charge: true }); ok(e.P.S <= f.P.S, 'también en carga');
  // atacante enemigo con lanza de carga contra portador de Locus: su F no sube
  const s = game([{ type: 'we_lord', models: 1, items: ['locus'] }], [{ type: 'br_realm', models: 5 }], { f: ['wood', 'bret'], phase: 'combat', active: 1 }); const t = U(s, 'we_lord', 0), k = U(s, 'br_realm', 1); put(k, 36, 24, -Math.PI / 2); put(t, 36, 26, Math.PI / 2); engage(s, k, t); charged(s, k, t, 5); cur(s); const P = R.attackProfile(k, t); eq(P.S, UNITS.br_realm.S, 'la lanza no suma F contra el portador de Locus');
});
// --- helpers: clones sin armadura / salvaciones para controlar los dados
const bare = (type, id, o = {}) => { const nid = id; DATA.UNITS[nid] = { ...UNITS[type], id: nid, arm: 'none', ward: 0, regen: 0, T: o.T ?? UNITS[type].T, sr: UNITS[type].sr.filter((x) => !/ward|regen|chaosArmour/.test(x)).concat(o.sr || []), ...(o.x || {}) }; return nid; };
TT('r_breaking', 'un arma mágica enemiga cuyo portador sufre una herida no salvada de esta arma queda destruida', () => {
  const wk = Object.keys(ITEMS).find((k) => ITEMS[k].cat === 'w' && ITEMS[k].fac === 'empire');
  const run = (k) => { const foe = bare('empire_general', 'eg_bare'); return holderFight(k, { like: 'r_breaking', foe, foeN: 1, v: [6, 6, 6, 6, 6, 1, 6, 1, 6, 1, 6, 1], setup: (b) => { b.a.items = [wk]; } }); };
  const w = run('r_breaking'), c = run(null); ok(w.wd >= 1, 'el portador hiere: ' + w.m.slice(0, 200)); ok(!by(w.s, w.a).items.includes(wk), 'arma mágica destruida'); ok(/Quebrar/.test(w.m), 'se anuncia'); ok(by(c.s, c.a).items.includes(wk), 'control: sin la Runa se conserva');
});
TT('r_banish', 'los enemigos Engendros de la disformidad no pueden hacer salvaciones especiales contra sus impactos', () => {
  const run = (k) => { const foe = bare('orc_boyz', 'ob_sp', { sr: ['warpSpawned'], x: { ward: 5 } }); return holderFight(k, { like: 'r_banish', foe, foeN: 5, v: [5] }); };
  const w = run('r_banish'), c = run(null); ok(w.wd > c.wd, `con la Runa hiere más (${w.wd} vs ${c.wd})`); eq(c.wd, 0, 'control: la salvación especial 5+ lo salva todo');
  const run2 = (k) => { const foe = bare('orc_boyz', 'ob_ns', { x: { ward: 5 } }); return holderFight(k, { like: 'r_banish', foe, foeN: 5, v: [5] }); }; eq(run2('r_banish').wd, 0, 'un enemigo que no es Engendro conserva su salvación');
});
TT('bn_beastkiller', 'una vez por turno repite una tirada para herir fallida contra Objetivo Grande', () => {
  DATA.UNITS.ok_tyrant_a1 = { ...UNITS.ok_tyrant, id: 'ok_tyrant_a1', A: 1 };
  const run = (k, big) => { const foe = bare('orc_boyz', big ? 'ob_lg' : 'ob_sm', { sr: big ? ['large'] : [], x: { T: 4 } }); let i = 0; const L = [6, 1, 6, 6, 6, 6]; return holderFight(k, { like: 'bn_beastkiller', type: 'ok_tyrant_a1', foe, foeN: 3, v: L }); };
  const w = run('bn_beastkiller', true), c = run(null, true), n = run('bn_beastkiller', false); eq(w.wd, 1, 'la herida fallada (1) se repite y hiere'); eq(c.wd, 0, 'control sin el Nombre: la herida fallada se queda'); ok(n.wd <= c.wd, 'contra un objetivo que no es Grande no se repite');
});
// --- umbrales de dados / reglas de unidad mediante funciones del motor
const wardThr = (s, def, ranged) => { cur(s); for (let v = 1; v <= 6; v++) { diceAll(v); const r = R.woundAndSave(s, def, 1, 10, 10, { auto: true, ranged: !!ranged, noRegen: true }); if (r.through === 0) return v; } return 7; };
TT('r_grungni', 'la unidad tiene salvación especial 5+; las unidades amigas a 6" tienen 6+ contra disparos', () => {
  const mk = (near) => { const s = game([{ type: 'dw_warriors', models: 10, std: true }, { type: 'dw_warriors', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'], phase: 'combat' }); const a = U(s, 'dw_warriors', 0), b = s.units.filter((x) => x.owner === 0)[1]; a.banner = 'r_grungni'; put(a, 36, 40); put(b, near ? 36 : 36, near ? 43 : 60); cur(s); return { s, a, b }; };
  const n = mk(true); const sub = (x) => { x.b.type = DATA.UNITS.dw_warriors.id; return x; };
  eq(wardThr(n.s, n.a, false), 5, 'portadora: 5+ especial'); eq(wardThr(n.s, n.b, true), 6, 'amiga a 6" contra disparos: 6+'); eq(wardThr(n.s, n.b, false), 7, 'amiga en combate: sin salvación'); const f = mk(false); eq(wardThr(f.s, f.b, true), 7, 'amiga a más de 6": nada');
});
TT('r_passage', 'el portador y su unidad mueven a través de cobertura', () => {
  const mk = (it) => { const s = game([{ type: 'dw_warriors', models: 10 }, { type: 'dw_king', models: 1, items: it ? ['r_passage'] : [] }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'], phase: 'move' }); const u = U(s, 'dw_warriors', 0), k = U(s, 'dw_king', 0); put(u, 36, 40); cur(s); return { s, u, k }; };
  const a = mk(true); ok(R.has(a.k, 'mtCover'), 'el portador mueve a través de cobertura'); join(a.s, a.k, a.u); cur(a.s); ok(R.has(a.u, 'mtCover'), 'la unidad a la que se une también'); const c = mk(false); ok(!R.has(c.k, 'mtCover'), 'control');
});
TT('cdl_sigil', 'las unidades amigas a 9" pierden Levas', () => {
  const mk = (d) => { const s = game([{ type: 'cd_hobgoblins', models: 10 }, { type: 'cd_hobgoblins', models: 10, std: true }], [{ type: 'state_troops', models: 10 }], { f: ['cd', 'empire'], phase: 'move' }); const [a, b] = s.units.filter((x) => x.owner === 0); b.banner = 'cdl_sigil'; put(a, 36, 40); put(b, 36, 40 + d); cur(s); return a; };
  const a = mk(6), ha = R.has(a, 'levies'), c = mk(14), hc = R.has(c, 'levies'); ok(hc && !ha, `a 6": sin Levas; a 14": conserva (${ha}/${hc})`);
});
// --- generación de hechizos / Sabers disponibles
const wizOf = (key, o = {}) => { const ct = o.type || carrierOf(ITEMS[key]); const s = game([{ type: ct, models: 1, items: key ? [key] : [], ...(o.e || {}) }], [{ type: 'state_troops', models: 10 }], { f: [UNITS[ct].faction === 'merc' ? 'empire' : UNITS[ct].faction, 'empire'], phase: 'deploy', ...(o.g || {}) }); cur(s); return { s, w: U(s, ct, 0), ct }; };
TT('heartwood', 'el portador puede conocer hechizos del Lore de los Salvajes', () => {
  const a = wizOf('heartwood', { e: { lore: 'wilds' } }); eq(a.w.lore, 'wilds', 'con el Colgante elige el Saber de los Salvajes'); const c = wizOf(null, { type: a.ct, e: { lore: 'wilds' } }); ok(c.w.lore !== 'wilds', 'control sin el Colgante: ' + c.w.lore); ok(a.w.spells.length >= 1, 'tiene hechizos');
});
TT('bmaj_goretooth', 'además de sus Sabers normales, puede conocer hechizos del Saber de Magia Primigenia', () => {
  const a = wizOf('bmaj_goretooth', { e: { lore: 'primal' } }), c = wizOf(null, { type: a.ct, e: { lore: 'primal' } }); eq(a.w.lore, 'primal', 'con el Diente Sangriento: Magia Primigenia'); ok(c.w.lore !== 'primal', 'control sin el objeto no puede (' + c.w.lore + ')');
});
TT('lml_d_wander', 'en lugar de generar hechizos conoce cuatro hechizos de firma de distintos Saberes', () => {
  const a = wizOf('lml_d_wander', { type: 'lm_slann' }); const sigs = a.w.spells; eq(sigs.length, 4, 'cuatro hechizos'); const lores = sigs.map((k) => Object.keys(DATA.LORES).find((l) => DATA.LORES[l].sig === k)); ok(lores.every(Boolean) && new Set(lores).size === 4, 'cuatro firmas de Saberes distintos: ' + lores); ok(lores.every((l) => ['battle', 'daemonology', 'dark', 'elementalism', 'high', 'illusion', 'necro'].includes(l)), 'solo los Saberes permitidos');
});
// --- Liderazgo / persecución / reforma / apoyo / desafío varios
TT('dml_gaze', 'los enemigos trabados no pueden usar la Presencia inspiradora de su General', () => {
  DATA.UNITS.st_ld5 = { ...UNITS.state_troops, id: 'st_ld5', Ld: 5 };
  const mk = (k) => { const s = game([{ type: 'dm_herald_slaanesh', models: 1, items: k ? [k] : [] }], [{ type: 'st_ld5', models: 10 }, { type: 'empire_general', models: 1 }], { f: ['dm', 'empire'], phase: 'combat' }); const h = U(s, 'dm_herald_slaanesh', 0), t = U(s, 'st_ld5', 1), g = U(s, 'empire_general', 1); put(h, 36, 24, -Math.PI / 2); put(t, 36, 21, Math.PI / 2); put(g, 36, 14); engage(s, h, t); cur(s); return { s, t }; };
  const a = mk('dml_gaze'), la = R.ldOf(a.s, a.t), c = mk(null), lc = R.ldOf(c.s, c.t); eq(lc, 10, 'control: usa el Ld 10 del General'); eq(la, 5, 'con la Mirada Cautivadora: solo su propio Ld');
});
TT('lml_jaguar', 'en una persecución tira un D6 extra y descarta el más bajo', () => {
  const run = (bn) => { const s = game([{ type: 'lm_temple', models: 20, std: !!bn }], [{ type: 'state_troops', models: 30 }], { f: ['lm', 'empire'], phase: 'combat', active: 0 }); const a = U(s, 'lm_temple', 0), e = U(s, 'state_troops', 1); if (bn) a.banner = bn; put(a, 36, 24, -Math.PI / 2); put(e, 36, 20, Math.PI / 2); engage(s, a, e); s.phase = 'combat'; cur(s); globalThis.__DLOG = []; diceAll(6); const ev = fight(s); return { n: globalThis.__DLOG.length, m: msgs(ev) }; };
  const w = run('lml_jaguar'), c = run('lml_standard_dummy'); ok(/huye/.test(w.m) && /huye/.test(c.m), 'montaje: el rival huye'); eq(w.n - c.n, 1, 'un D6 extra (con el estandarte tira un dado más en la persecución)');
});
TT('tk_rakaph', 'salvo al cargar, la unidad puede hacer una reforma gratuita en cualquier momento de su movimiento', () => {
  const mk = (bn) => { const s = game([{ type: 'tk_warriors', models: 20, std: true }], [{ type: 'state_troops', models: 10 }], { f: ['tk', 'empire'], phase: 'move' }); const u = U(s, 'tk_warriors', 0); u.banner = bn; put(u, 36, 40); cur(s); return { s, u }; };
  const t = (bn) => { const { s, u } = mk(bn); const r1 = R.previewMove(s, u.id, { x: u.x, y: u.y - 4, face: u.face }); u.moved = true; u.y -= 4; const r2 = R.previewMove(s, u.id, { x: u.x, y: u.y, face: u.face + Math.PI / 2, files: 10 }); return r2; };
  const a = t('tk_rakaph'), c = t(null); ok(a.ok !== false, 'con el Icono: reforma gratuita tras mover: ' + JSON.stringify(a).slice(0, 150)); ok(c.ok === false, 'control: ya ha actuado');
});
TT('empaj_crystal', 'una vez por turno haces repetir a tu oponente una tirada para impactar o herir contra un personaje amigo dentro del alcance de mando del portador (v839: faltaba la tirada para herir)', () => {
  const mk = (it, far) => { const s = game([{ type: 'empire_general', models: 1 }, { type: 'empire_mage', models: 1, items: it ? ['empaj_crystal'] : [] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'combat', active: 1 }); const g = put(U(s, 'empire_general', 0), 36, far ? 70 : 40), m = put(U(s, 'empire_mage', 0), 36, 44); cur(s); return { s, g }; };
  const wound = (x, q) => { dice(...q); diceAll(1); return R.woundAndSave(x.s, x.g, 1, 10, 10, { noRegen: true, noWard: true, noArmour: true }).through; };
  const a = mk(true, false); eq(wound(a, [6, 1]), 0, 'tirada para herir con éxito (6) → se repite (1) → falla'); eq(wound(a, [6, 1]), 1, 'solo una vez por turno: la segunda no se repite');
  const c = mk(false, false); eq(wound(c, [6, 1]), 1, 'control sin la Bola'); const f = mk(true, true); eq(wound(f, [6, 1]), 1, 'fuera del alcance de mando del portador: no se repite');
});
for (const [key, type, fac] of [['brsaj_lucky', 'br_sergeant', 'bret'], ['dml_willT', 'dm_herald_tzeentch', 'dm']]) TT(key, 'una vez por ronda repite una tirada para impactar, herir o una salvación fallada (se pregunta en el momento)', () => {
  const mk = (it) => { const s = game([{ type, models: 1, items: it ? [key] : [] }], [{ type: 'orc_boyz', models: 10 }], { f: [fac, 'orcs'], phase: 'combat', active: 0 }); const u = put(U(s, type, 0), 36, 40); cur(s); return { s, u }; };
  const a = mk(true), ev = []; for (const k of ['hit', 'wound', 'save']) { const x = mk(true); const r1 = R.luckTry(x.u, k, ev), r2 = R.luckTry(x.u, k, ev); ok(r1 === true && r2 === false, `${k}: primera vez repite, la segunda en la misma ronda no (${r1}/${r2})`); }
  a.s.turn++; cur(a.s); ok(R.luckTry(a.u, 'hit', ev) === true, 'la ronda siguiente puede volver a usarla'); const c = mk(false); ok(R.luckTry(c.u, 'hit', ev) === false, 'control sin el objeto');
  const p = mk(true); const r = asks(p.s, (cc) => { cur(cc); return R.luckTry(by(cc, p.u), 'wound', []); }, [0, 1], (n) => (n.title.includes('Suerte') ? 'n' : undefined)); ok(r.needs.some((n) => n.title.includes('Suerte')) && r.r === false, 'se pregunta y si se rehúsa no se repite');
});
TT('skl_orb', 'un solo uso en lugar de atacar: una tirada para impactar y, si acierta, test de Iniciativa del modelo objetivo; si falla se retira como baja', () => {
  const mk = () => { const s = game([{ type: 'sk_clanrats', models: 20 }, { type: 'sk_warlord', models: 1, items: ['skl_orb'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['sk', 'orcs'], phase: 'combat', active: 0 }); const u = U(s, 'sk_clanrats', 0), ch = U(s, 'sk_warlord', 0), e = U(s, 'orc_boyz', 1); put(u, 36, 24, -Math.PI / 2); put(e, 36, 20, Math.PI / 2); engage(s, u, e); join(s, ch, u); cur(s); return { s, u, ch, e }; };
  const run = (q) => { const x = mk(); dice(...q); const r = R.apply(x.s, { t: 'orb', id: x.ch.id, target: x.e.id }); return { x, r, m: msgs(r.events || []) }; };
  const a = run([6, 6]); ok(a.r.ok, 'se puede usar: ' + JSON.stringify(a.r).slice(0, 100)); ok(by(a.x.s, a.x.e).models === 9, `I fallada (6): un modelo retirado (${by(a.x.s, a.x.e).models})`); ok(!by(a.x.s, a.x.ch).items.includes('skl_orb'), 'un solo uso');
  const b = run([6, 2]); eq(by(b.x.s, b.x.e).models, 10, 'I superada (2 ≤ I 2): sin bajas'); const c = run([1]); eq(by(c.x.s, c.x.e).models, 10, 'falla la tirada para impactar (1): sin test de I'); ok(/falla/.test(c.m), 'se anuncia: ' + c.m.slice(0, 120));
});
TT('dml_sirensong', 'un solo uso, al inicio de Declarar cargas del rival: una unidad enemiga que pueda cargarle hace un chequeo de Ld; si falla debe declarar carga contra él', () => {
  const mk = () => { const s = game([{ type: 'dm_herald_slaanesh', models: 1, items: ['dml_sirensong'] }], [{ type: 'orc_boyz', models: 10 }], { f: ['dm', 'orcs'], phase: 'move', active: 1 }); const h = put(U(s, 'dm_herald_slaanesh', 0), 36, 30), o = put(U(s, 'orc_boyz', 1), 36, 36, -Math.PI / 2); cur(s); return { s, h, o }; };
  const run = (q) => { const x = mk(); dice(...q); const ev = []; R.beginMove(x.s, ev); return { x, m: msgs(ev), engaged: R.isEngaged ? R.isEngaged(x.s, by(x.s, x.o)) : null }; };
  const a = run([1, 1, 6, 6]); ok(/Canto de Sirena/.test(a.m) && /debe cargar/.test(a.m), 'Ld fallado: debe cargar: ' + a.m.slice(0, 200)); ok(!by(a.x.s, a.x.h).items.includes('dml_sirensong'), 'objeto gastado'); ok(a.engaged || by(a.x.s, a.x.o).charged || /carga/.test(a.m), 'la unidad carga');
  const b = run([1, 1, 1, 2]); ok(/supera el chequeo/.test(b.m), 'Ld superado: no carga'); ok(!by(b.x.s, b.x.o).charged, 'sin carga forzada');
});
TT('tkaj_tapestry', 'un estandarte enemigo capturado por esta unidad vale 100 PV como trofeo de guerra', () => {
  const run = (bn) => { const s = game([{ type: 'tk_warriors', models: 20, std: true }], [{ type: 'orc_boyz', models: 3, std: true }], { f: ['tk', 'orcs'], phase: 'combat', active: 0 }); const a = U(s, 'tk_warriors', 0), e = U(s, 'orc_boyz', 1); a.banner = bn; e.banner = 'bn_dummy'; put(a, 36, 24, -Math.PI / 2); put(e, 36, 20, Math.PI / 2); engage(s, a, e); s.phase = 'combat'; cur(s); diceAll(6); fight(s); return { s, e: by(s, e) }; };
  const a = run('tkaj_tapestry'), c = run('tk_other'); ok(a.e.models <= 0 && a.e.trophy >= 1 && c.e.trophy >= 1, 'montaje: el estandarte enemigo es capturado'); const va = R.scoreVP(a.s, 0), vc = R.scoreVP(c.s, 0); eq(va - vc, 50, `con el Tapiz el estandarte vale 100 (50 + 50): ${va} vs ${vc}`);
});
TT('okl_runemaw', 'si un Mago enemigo elige a la unidad como objetivo, con 3+ (D6) su controlador debe elegir otro; si no hay otro viable no se lanza', () => {
  const mk = (bn) => { const s = game([{ type: 'ok_bulls', models: 5, std: true }], [{ type: 'empire_mage', models: 1 }], { f: ['ok', 'empire'], phase: 'shoot', active: 1 }); const t = U(s, 'ok_bulls', 0), w = U(s, 'empire_mage', 1); t.banner = bn; put(t, 36, 22, Math.PI / 2); put(w, 36, 40); w.spells = ['fireball']; w.casted = []; cur(s); return { s, t, w }; };
  const run = (bn, q) => { const x = mk(bn); dice(...q); diceAll(1); return R.apply(x.s, { t: 'cast', id: x.w.id, spell: 'fireball', target: x.t.id }); };
  const a = run('okl_runemaw', [3]); ok(a.ok === false && /Ojo del Drag/.test(a.error || a.reason || JSON.stringify(a)), 'con 3: debe elegir otro objetivo: ' + JSON.stringify(a).slice(0, 160)); const b = run('okl_runemaw', [2]); ok(b.ok !== false, 'con 2 el hechizo puede dirigirse a la unidad'); const c = run('okl_other', [3]); ok(c.ok !== false, 'control sin el Maw Rúnico');
});
TT('r_calm', 'hechizo atado (NP 2), 8+/11+: los magos enemigos a 18" (36" con 11+) suman +2 al valor de lanzamiento hasta tu próximo turno', () => {
  const run = (q) => { const s = game([{ type: 'dw_king', models: 1, items: ['r_calm'] }], [{ type: 'empire_mage', models: 1 }], { f: ['dw', 'empire'], phase: 'strategy', active: 0 }); const k = put(U(s, 'dw_king', 0), 36, 40); put(U(s, 'empire_mage', 1), 36, 20); cur(s); dice(...q); diceAll(1); R.beginStrategy(s, []); return by(s, k); };
  const a = run([3, 3]), b = run([5, 4]), c = run([2, 2]); const f = (x) => (x.fx || []).find((q) => q.k === 'calm'); eq(f(a)?.v, 18, '2D6+2 = 8: 18"'); eq(f(b)?.v, 36, '2D6+2 = 11: 36"'); ok(!f(c), '2D6+2 = 6: no se activa');
});
TT('heaj_lothern', 'si la unidad lleva lanzas de empuje, la mitad (redondeando arriba) de los modelos de la tercera fila hace ataques de apoyo', () => {
  const run = (bn, n) => { const s = game([{ type: 'he_spearmen', models: n, std: true }], [{ type: 'orc_boyz', models: 10 }], { f: ['he', 'orcs'], phase: 'combat', active: 1 }); const u = U(s, 'he_spearmen', 0), e = U(s, 'orc_boyz', 1); u.banner = bn; put(u, 36, 24, -Math.PI / 2); put(e, 36, 21, Math.PI / 2); engage(s, u, e); s.phase = 'combat'; cur(s); return R.attackProfile(u, e).atk; };
  const f = DATA.UNITS.he_spearmen.files || 5; const a = run('heaj_lothern', 18), c = run('heaj_other', 18); ok(a > c, `con el Estandarte hay más Ataques (${a} vs ${c})`); eq(a - c, 3, `la diferencia es la mitad redondeada hacia arriba de la tercera fila (5 modelos en la 3ª fila → 3)`);
  const d = run('heaj_lothern', 10), e2 = run('heaj_other', 10); eq(d, e2, 'sin tercera fila (10 modelos en 2 filas) no hay diferencia');
});
TT('tat_endless', 'el turno que carga, cada ataque que cause una herida no salvada permite un ataque adicional (los adicionales y los Impactos no repiten)', () => {
  DATA.UNITS.ob_bare = { ...UNITS.orc_boyz, id: 'ob_bare', arm: 'none', ward: 0, T: 1, sr: UNITS.orc_boyz.sr.filter((x) => !/ward|regen/.test(x)) };
  const run = (k, ch) => holderFight(k, { like: 'tat_endless', type: 'dw_king', foe: 'ob_bare', foeN: 30, v: [6], charge: ch });
  const a = run('tat_endless', true), c = run(null, true), n = run('tat_endless', false); eq(c.wd, 4, 'control: 4 Ataques → 4 heridas'); eq(a.wd, 8, 'con la Runa: un ataque adicional por cada herida no salvada (4 + 4), sin encadenar'); ok(n.wd <= c.wd, 'sin cargar no hay ataques adicionales');
});
TT('del_eye', 'un solo uso: el portador y su unidad repiten los impactos fallados en la Fase de Disparo (popup; v839: al rehusar se repetían igualmente)', () => {
  const run = (a) => { const x = joinedShooter('del_eye', { shooter: 'de_crossbows' }); let i = 0; diceAll(() => (i++ % 2 ? 6 : 1)); const r = asks(x.s, (c) => { cur(c); const ev = []; R.resolveShot(c, by(c, x.h), by(c, x.t), ev, {}); return ev; }, [0, 1], (n) => (n.title.includes('Ojo') ? a : undefined)); const m = msgs(r.r); return { r, h: +/(\d+) impactos/.exec(m)[1], x }; };
  const y = run('y'), n = run('n'); ok(y.r.needs.some((q) => q.title === 'Ojo Guía'), 'se pregunta'); eq(y.h, 10, 'con el Ojo: los 10 tiros fallados se repiten y aciertan'); eq(n.h, 5, 'si se rehúsa no se repite (5 de 10)'); ok(!by(y.r.s, y.x.ch).used?.eye === false || by(y.r.s, y.x.ch).used.eye === 1, 'se gasta');
  ok(!(by(n.r.s, n.x.ch).used || {}).eye, 'si se rehúsa no se gasta');
});
TT('dml_speater', 'solo Khorne: puede intentar disipar como Mago de nivel 2 (+1 a la tirada)', () => {
  const t = (key, q) => dispel(key, { like: 'dml_speater', type: 'dm_herald_khorne', q, total: 8 }).r;
  eq(t('dml_speater', [4, 4]), true, '4+4 +1 (Nivel 2) = 9 > 8: dispersa'); eq(t(null, [4, 4]), false, 'control sin el objeto: 8 no basta'); eq(t('dml_speater', [3, 4]), false, '3+4 +1 = 8: no basta');
});
TT('dml_sorcery', 'solo Horrores Rosas: los hechizos ligados se lanzan con un Nivel de Poder igual al doble de su bonus de fila', () => {
  const thr = (bn) => { for (let v = 1; v <= 6; v++) { const s = game([{ type: 'dm_pinkhorrors', models: 20, std: true }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'], phase: 'shoot', active: 0 }); const u = U(s, 'dm_pinkhorrors', 0), t = U(s, 'state_troops', 1); u.banner = bn; put(u, 36, 40); put(t, 36, 22, Math.PI / 2); cur(s); dice(v, v); diceAll(1); const r = R.apply(s, { t: 'cast', id: u.id, spell: u.scintSpell, target: t.id }); if (/impactos/.test(msgs(r.events || []))) return v; } return 7; };
  const cv = DATA.SPELLS.pink_fire.cv, rb = 2; eq(thr('x'), Math.ceil((cv - rb) / 2), `control: 2D6 + bonus de fila ${rb} ≥ ${cv}`); eq(thr('dml_sorcery'), Math.ceil((cv - 2 * rb) / 2), `con el Icono: 2D6 + ${2 * rb} (doble) ≥ ${cv}`);
});
TT('favour_gods', 'un solo uso: el portador puede repetir el D6 al tirar en la tabla de la Mirada de los Dioses (se pregunta en el momento)', () => {
  const run = (a, it) => { const s = game([{ type: 'woc_lord', models: 1, items: it ? ['favour_gods'] : [] }], [{ type: 'state_troops', models: 10 }], { f: ['woc', 'empire'], phase: 'strategy' }); const u = put(U(s, 'woc_lord', 0), 36, 40); cur(s); dice(1, 6); return asks(s, (c) => { cur(c); const ev = []; R.gazeRoll(c, by(c, u), ev); return ev; }, [0, 1], (n) => (n.title.includes('Favor') ? a : undefined)); };
  const y = run('y', true), n = run('n', true), c = run('y', false); ok(y.needs.some((q) => q.title.includes('Favor')), 'se pregunta'); ok(/Favor de los Dioses y repite la tirada \(1→6\)/.test(msgs(y.r)), 'repite el 1 y obtiene 6: ' + msgs(y.r).slice(0, 200)); ok(!by(y.s, by(y.s, y.s.units[0])).items?.includes('favour_gods') || !y.s.units.find((u) => u.type === 'woc_lord').items.includes('favour_gods'), 'objeto gastado'); ok(!/repite la tirada/.test(msgs(n.r)) && n.s.units.find((u) => u.type === 'woc_lord').items.includes('favour_gods'), 'si se rehúsa conserva el 1 y el objeto'); ok(!c.needs.some((q) => q.title.includes('Favor')), 'control sin objeto');
});
TT('bm_eye', 'el portador ignora los modificadores de cobertura parcial y total y, al determinar su línea de visión para disparar, ignora los bosques', () => {
  const mk = (k, terr) => { const s = game([{ type: 'emp_witchhunter', models: 1, items: k ? [k] : [] }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot', terrain: terr }); const a = put(U(s, 'emp_witchhunter', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 20, Math.PI / 2); cur(s); return { s, a, t }; };
  const wood = [{ id: 'f1', kind: 'forest', x: 36, y: 35, w: 30, h: 4 }]; const fire = (x) => R.apply(x.s, { t: 'shoot', id: x.a.id, target: x.t.id });
  const a = mk('bm_eye', wood), c = mk(null, wood); for (const x of [a, c]) put(x.t, 36, 29, Math.PI / 2); cur(a.s); const ra = fire(a); cur(c.s); const rc = fire(c); ok(rc.ok === false && /línea de visión/i.test(JSON.stringify(rc)), 'control: el bosque bloquea la línea de visión: ' + JSON.stringify(rc).slice(0, 120)); ok(ra.ok !== false, 'con el Ojo el bosque no la bloquea');
  const cov = [{ id: 'f2', kind: 'forest', x: 36, y: 28, w: 40, h: 4 }]; const need = (k) => { const x = mk(k, cov); diceAll(1); return shotOf(x.s, x.a, x.t).need; }; const nc = need(null), na = need('bm_eye'); eq(nc - na, 1, `cobertura ignorada: ${na}+ frente a ${nc}+ del control`);
});
TT('bm_wmap', 'cuando el portador (o su unidad) provoca una tirada en la tabla de Terreno salvaje, puedes repetir el D6 (popup al ver la tirada)', () => {
  const run = (it, a) => { const s = game([{ type: 'empire_general', models: 1, items: it ? ['bm_wmap'] : [] }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'], phase: 'move', scn: 'bm_pitched', terrain: [{ id: 'w1', kind: 'forest', x: 36, y: 36, w: 20, h: 20 }] }); const u = put(U(s, 'empire_general', 0), 36, 36); cur(s); dice(1, 5); return asks(s, (c) => { cur(c); const ev = []; R.wildDiscover(c, by(c, u), true, ev); return ev; }, [0, 1], (n) => (n.title.includes('Mapa') ? a : undefined)); };
  const y = run(true, 'y'), n = run(true, 'n'), c = run(false, 'y'); ok(y.needs.some((q) => q.title.includes('Mapa')), 'se pregunta'); ok(/Mapa de la Espesura: .* repite el D6 de Terreno salvaje \(1 → 5\)/.test(msgs(y.r)), 'repite el 1 y obtiene 5: ' + msgs(y.r).slice(0, 200)); ok(/descubre Zarzal/.test(msgs(n.r)), 'si se rehúsa conserva el 1'); ok(!c.needs.some((q) => q.title.includes('Mapa')), 'control sin el Mapa');
});
TT('bm_alma', 'si un personaje de tu ejército lo lleva, puedes repetir tu D6 al tirar en la tabla de Caos de guerra (popup al ver la tirada)', () => {
  const run = (it, a) => { const s = game([{ type: 'empire_general', models: 1, items: it ? ['bm_alma'] : [] }], [{ type: 'state_troops', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy', scn: 'bm_pitched', hap: 'chaos' }); s.hap = 'chaos'; s.turn = 2; s.first = 0; s.active = 0; cur(s); dice(1, 2, 5); diceAll(3); return asks(s, (c) => { cur(c); c.phase = 'strategy'; c.active = 0; c.first = 0; const ev = []; R.beginStrategy(c, ev); return ev; }, [0, 1], (n) => (n.title.includes('Almanaque') ? a : undefined)); };
  const y = run(true, 'y'), c = run(false, 'y'); ok(y.needs.some((q) => q.title.includes('Almanaque')), 'se pregunta: ' + y.needs.map((q) => q.title)); ok(/Almanaque Encantado: .* repite el D6 de Caos de guerra \(2 → 5\)/.test(msgs(y.r)), msgs(y.r).slice(0, 300)); ok(!c.needs.some((q) => q.title.includes('Almanaque')), 'control');
});
TT('dml_locus_war', 'solo Foco Demoníaco: las unidades demoníacas amigas en su alcance de mando reducen D3 las heridas adicionales por Inestabilidad', () => {
  const lose = (bn, d, q) => { const s = game([{ type: 'dm_bloodletters', models: 20 }, { type: 'dm_bloodletters', models: 10, std: true }], [{ type: 'state_troops', models: 10 }], { f: ['dm', 'empire'], phase: 'combat' }); const [l, b] = s.units.filter((x) => x.owner === 0); b.banner = bn; put(l, 36, 40); put(b, 36, 40 + d); cur(s); const w0 = l.wounds; dice(...q); diceAll(1); R.daemonicInstability(s, l, [], 0); return w0 - by(s, l).wounds; };
  const q = [5, 6, 6]; const c = lose('x', 6, q), a = lose('dml_locus_war', 6, q), far = lose('dml_locus_war', 40, q); ok(c >= 2, 'control: pierde heridas por Inestabilidad (' + c + ')'); const a2 = lose('dml_locus_war', 6, [5, 6, 2]); eq(a, Math.max(0, c - 1 - 3), 'con el Tótem a su alcance: se reducen D3 (D6=6 → 3) heridas además de la 1 del Foco que el propio Tótem constituye'); eq(a2, c - 1 - 1, 'D6=2 → D3=1: se reduce 1 + 1 (Foco)'); eq(far, c, 'fuera del alcance de mando: no se reduce');
});
TT('skl_globe', 'un solo uso, 9", mágico, Mover y disparar: apunta a un modelo; plantilla de 3" y test de I o pierde una Herida', () => {
  const run = (v, moved) => { const s = game([{ type: 'sk_warlord', models: 1, items: ['skl_globe'] }], [{ type: 'orc_boyz', models: 20 }], { f: ['sk', 'orcs'], phase: 'shoot', active: 0 }); const a = put(U(s, 'sk_warlord', 0), 36, 40), t = put(U(s, 'orc_boyz', 1), 36, 33, Math.PI / 2); a.moved = !!moved; cur(s); diceAll(v); const r = R.apply(s, { t: 'shoot', id: a.id, target: t.id }); return { s, r, a: by(s, a), t: by(s, t), m: msgs(r.events || []) }; };
  const x = run(5, false); ok(x.r.ok, 'dispara: ' + JSON.stringify(x.r).slice(0, 100)); ok(/Globo de la Muerte \((\d+) modelos, (\d+) fallan I\)/.test(x.m), 'plantilla de 3": ' + x.m.slice(0, 200)); const [, nt, nf] = /\((\d+) modelos, (\d+) fallan I\)/.exec(x.m); const bw = DATA.UNITS.orc_boyz.baseW / 25.4, bd = DATA.UNITS.orc_boyz.baseD / 25.4, exp = Math.min(20, Math.max(1, Math.round(Math.PI * 2.25 / (bw * bd)))); eq(+nt, exp, 'modelos bajo la plantilla de 3" (π·1,5² / área de peana): ' + exp); eq(+nf, +nt, 'con 5 > I fallan todos'); eq(20 - x.t.models, +nt, 'cada uno pierde su Herida'); ok(!x.a.items.includes('skl_globe'), 'un solo uso');
  const y = run(1, false); eq(20 - y.t.models, 0, 'con 1 natural (I superada) no pierde Heridas'); const z = run(5, true); ok(z.r.ok, 'Mover y disparar: se puede tras mover');
});
TT('scarab_brooch', 'Desde Debajo de las Arenas: la unidad invocada puede colocarse a 18" del Sacerdote Funerario en vez de 12"', () => {
  const run = (it, ring) => { const foes = ring ? Array.from({ length: 8 }, () => ({ type: 'state_troops', models: 5 })) : [{ type: 'state_troops', models: 5 }]; const s = game([{ type: 'tk_hpriest', models: 1, items: it ? ['scarab_brooch'] : [] }, { type: 'tk_swarm_amb', models: 5 }], foes, { f: ['tk', 'empire'], phase: 'strategy', turn: 2, keepRes: true, active: 0 }); const p = put(U(s, 'tk_hpriest', 0), 36, 24); const es = s.units.filter((x) => x.owner === 1); es.forEach((e, i) => { if (ring) { const a = i / 8 * Math.PI * 2; put(e, 36 + Math.cos(a) * 8, 24 + Math.sin(a) * 8, a + Math.PI); } else put(e, 36, 4, Math.PI / 2); }); cur(s); dice(1, 2); diceAll(3); const ev = []; R.beginStrategy(s, ev); const r = s.units.find((x) => x.type === 'tk_swarm_amb' && x.ambushOK); return { placed: !!r && /invoca/.test(msgs(ev)), d: r ? Math.hypot(r.x - p.x, r.y - p.y) : null }; };
  const a = run(true, true), c = run(false, true), o = run(false, false); ok(a.placed && a.d > 12 && a.d <= 18.01, `con el Broche y todo el radio de 12" ocupado: se coloca a ${a.d?.toFixed(1)}"`); ok(!c.placed, 'sin el Broche no cabe a 12"'); ok(o.placed && o.d <= 12.01, `control en campo abierto: a ${o.d?.toFixed(1)}" (≤ 12")`);
});
TT('bmaj_hunthorn', 'una vez por turno, tras tirar la llegada de una unidad con Emboscadores en reserva, si el portador está en el campo y no huye, +1 o −1 al resultado (popup)', () => {
  const run = (own, it, a, r) => { const mine = own ? [{ type: 'bm_beastlord', models: 1, items: it ? ['bmaj_hunthorn'] : [] }, { type: 'bm_gor_amb', models: 10 }] : [{ type: 'wolf_riders_amb', models: 5 }]; const foe = own ? [{ type: 'state_troops', models: 10 }] : [{ type: 'bm_beastlord', models: 1, items: it ? ['bmaj_hunthorn'] : [] }]; const s = game(mine, foe, { f: own ? ['bm', 'empire'] : ['orcs', 'bm'], phase: 'strategy', turn: 2, keepRes: true, active: 0 }); for (const u of s.units) if (u.type === 'bm_beastlord') put(u, 36, own ? 40 : 10); cur(s); const res = s.reserves.find((x) => x.ambusher); dice(r); diceAll(3); return asks(s, (c) => { cur(c); const ev = []; c.phase = 'strategy'; c.active = 0; R.beginStrategy(c, ev); return ev; }, [0, 1], (n) => (n.title.includes('Cuerno') ? a : undefined)); };
  const thr = (own) => { for (let r = 1; r <= 6; r++) { const x = run(own, false, 'y', r); if (/llegan por sorpresa/.test(msgs(x.r))) return r; } return 7; };
  const t = thr(true); ok(t >= 2 && t <= 6, 'umbral de llegada de control: ' + t + '+');
  const y = run(true, true, 'y', t - 1), n = run(true, true, 'n', t - 1); ok(y.needs.some((q) => q.title.includes('Cuerno')), 'se pregunta'); ok(/llegan por sorpresa/.test(msgs(y.r)), '+1 propio: llega con ' + (t - 1) + ': ' + msgs(y.r).slice(0, 160)); ok(/se retrasan/.test(msgs(n.r)), 'si se rehúsa se retrasa');
  const te = thr(false); const e = run(false, true, 'y', te); ok(/se retrasan/.test(msgs(e.r)) || e.needs.some((q) => q.title.includes('Cuerno')), 'el rival puede aplicar −1 a la llegada enemiga (' + te + ' → ' + (te - 1) + ')');
});
