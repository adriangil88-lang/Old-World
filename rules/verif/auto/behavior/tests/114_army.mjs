// v838 — Reglas de creación del ejército: hechizos generados, Aquelarres, Báculo (lote 15)
import { T, N, R, DATA, game, pair, ok, eq, dice, diceAll, withSr, withoutSr, join, U, put, cur, msgs, by, all, D, F, FOE, engage, asks, asked } from '../lib3.mjs';
const RS = (k) => `app/js/data.js (regla «${k}»)`;
const dep = (type, fac, n = 5) => { const s = game([{ type, models: n }], [{ type: 'orc_boyz', models: 10 }], { f: [fac, 'orcs'], phase: 'deploy' }); s.ready = [false, false]; cur(s); return { s, u: U(s, type, 0) }; };
T('rule-athelLoren', RS('athelLoren'), 'Lore de Athel Loren: puede descartar un hechizo generado al azar y elegir Canto de los Árboles, Caminante del Bosque o Bandada de la Perdición', () => {
  const a = dep('we_spellsinger', 'wood'); eq(a.u.spellAlt.neh.join(), 'tree_singing,forest_walker,flock_doom', 'ofrece los tres hechizos'); const r = R.apply(a.s, { t: 'spellPick', id: a.u.id, drop: a.u.spellAlt.rolls[0], take: 'forest_walker' }); ok(r.ok && by(a.s, a.u).spells.includes('forest_walker') && !by(a.s, a.u).spells.includes(a.u.spellAlt.rolls[0]), 'sustituye el hechizo tirado: ' + JSON.stringify(by(a.s, a.u).spells));
  ok(!R.apply(a.s, { t: 'spellPick', id: a.u.id, drop: a.u.spellAlt.rolls[0], take: 'wind_blast' }).ok, 'no se puede elegir otro hechizo distinto de los tres');
  const c = dep('empire_mage', 'empire'); ok(!(c.u.spellAlt?.neh || []).includes('tree_singing'), 'control: un mago de otro ejército no los ofrece');
});
T('rule-coven', RS('coven'), 'Aquelarre del Bosque Profundo: la unidad conoce un hechizo generado al azar de Batalla o Elementalismo (puede cambiarlo por el hechizo distintivo; FAQ FoF) y lo lanza como hechizo atado', () => {
  const a = dep('we_sisters', 'wood'); eq(a.u.spells.length, 1, 'conoce un único hechizo'); ok(a.u.covenAlt?.sigs.join() === 'hammerhand,storm_call', 'puede cambiarlo por la firma de Batalla o Elementalismo'); ok(R.apply(a.s, { t: 'covenPick', id: a.u.id, pick: 'storm_call' }).ok && by(a.s, a.u).spells[0] === 'storm_call', 'el cambio se aplica'); ok(!R.apply(a.s, { t: 'covenPick', id: a.u.id, pick: 'plague_rust' }).ok, 'otros hechizos no');
});
T('rule-covenCursed', RS('covenCursed'), 'Aquelarre maldito: conoce un hechizo de Magia Oscura o Demonología, lanzado como hechizo atado', () => {
  const a = dep('de_warlocks', 'de'), L = DATA.LORES, P = [...L.dark.pool, L.dark.sig, ...L.daemonology.pool, L.daemonology.sig]; eq(a.u.spells.length, 1, 'un solo hechizo'); ok(P.includes(a.u.spells[0]), 'de Magia Oscura o Demonología: ' + a.u.spells[0]);
});
T('rule-scintSorcery', RS('scintSorcery'), 'Hechicería centelleante: la unidad conoce un hechizo de su alineamiento (elegido antes del despliegue) y lo lanza como hechizo ligado', () => {
  const a = dep('dm_pinkhorrors', 'dm'); const L = DATA.LORES.dm_tzeentch; ok([L.sig, ...L.pool].includes(a.u.scintSpell), 'el hechizo es del alineamiento de Tzeeentch: ' + a.u.scintSpell);
  const s = game([{ type: 'dm_pinkhorrors', models: 10, scint: 'pink_fire' }], [{ type: 'orc_boyz', models: 10 }], { f: ['dm', 'orcs'], phase: 'deploy' }); eq(U(s, 'dm_pinkhorrors', 0).scintSpell, 'pink_fire', 'respeta la elección del jugador en el ejército');
});
T('rule-staffElem', RS('staffElem'), 'Báculo de los Elementos: en lugar del descarte habitual, descarta dos hechizos generados y elige dos firmas de Elementalismo y/o de la Dama (se pregunta al generar los hechizos)', () => {
  const a = dep('br_elisse', 'bret', 1); ok(a.u.staffAlt?.pend === true, 'queda pendiente de decidir'); const o = asks(a.s, (c) => { R.staffResolve(c, 0); return null; }, [0, 1], (n) => (n.title === 'Báculo de los Elementos' && /¿Usa el Báculo/.test(n.msg) ? 'y' : undefined));
  ok(asked(o, 'Báculo de los Elementos'), 'se pregunta'); const sp = by(o.s, U(o.s, 'br_elisse', 0)).spells; eq(sp.length, 3, 'conoce dos firmas y un hechizo generado'); ok(sp.slice(0, 2).every((k) => a.u.staffAlt.sigs.includes(k)), 'las dos primeras son firmas de Elementalismo/la Dama: ' + sp.join());
});
