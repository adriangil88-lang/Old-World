// v836 — Tarea D (hechizos): cada hechizo de daño (proyectil/asalto) se lanza en el motor con dados fijados y se compara con su TEXTO:
// nº de impactos (expresión del texto evaluada con el dado fijo), Fuerza, PA, flamígero, sin armadura/Regeneración, Heridas múltiples.
import { T, N, R, DATA, game, U, ok, eq, cur, put, engage, diceAll, dice, msgs } from '../lib2.mjs';
const { SPELLS } = DATA;
const FILE = 'app/js/data.js (SPELLS: texto del hechizo)';
const evalHits = (e, d) => { const m = /^(\d*)D(\d)(?:\+(\d+))?$/.exec(e); if (m) return (m[1] ? +m[1] : 1) * Math.min(+m[2], d) + (m[3] ? +m[3] : 0); return /^\d+$/.test(e) ? +e : null; };
const COND = /Chequeo|Test de|test de|con \d+\+|pasa|falla|Solo personajes|Alcance \d+D6/;
const CUSTOM = new Set(['mind_razor', 'light_death', 'anvil_hearth', 'vaul_unmaking', 'forest_walker', 'spiteful_torrent']);
for (const [key, sp] of Object.entries(SPELLS)) {
  if (CUSTOM.has(key)) continue;
  if (!['missile', 'assail'].includes(sp.type) || (!sp.hitsFn && sp.hits == null)) continue;
  const txt = sp.text || '';
  const mS = [...txt.matchAll(/\bF(\d)\b/g)].map((x) => +x[1]), mAp = [...txt.matchAll(/(?:(?:FP|PA|AP) [−-](\d)|[−-](\d) AP)/g)].map((x) => +(x[1] || x[2]));
  const mH = /(\d*D\d(?:\+\d+)?|\d+|Un) impactos?/.exec(txt); if (mH && mH[1] === 'Un') mH[1] = '1';
  const hf = !!sp.hitsFn;
  if (COND.test(txt) || mS.length !== 1 || (!mH && !hf)) { continue; /* v840: los hechizos compuestos se prueban rama por rama en tests/163_v840_spells.mjs (v840-sp-<clave>) */ }
  T('v836-sp-' + key, FILE, `Hechizo ${sp.name}: ${mH ? mH[1] : sp.hitsFn} impactos F${mS[0]}${mAp.length ? ' PA −' + mAp[0] : ''}${/sin salvación (de|por) armadura|sin armadura/.test(txt) ? ' sin armadura' : ''}${/flamíg/.test(txt) ? ' flamígero' : ''}`, () => {
    const s = game([{ type: 'orc_weirdnob', models: 1 }], [{ type: 'state_troops', models: 40 }], { f: ['orcs', 'empire'], phase: 'magic' }); const w = U(s, 'orc_weirdnob'), e = U(s, 'state_troops', 1); engage(s, w, e); cur(s);
    globalThis.__WSL = []; diceAll(3); const ev = []; R.applySpell(s, w, key, e, ev); const c = globalThis.__WSL.find((x) => x.def === e); ok(c, 'el hechizo no hirió a la unidad: ' + msgs(ev).slice(0, 160));
    if (!hf) eq(c.hits, evalHits(mH[1], 3), 'impactos (texto «' + mH[1] + '» con dados a 3)'); eq(c.S, mS[0], 'Fuerza'); eq(c.ap, mAp.length ? mAp[0] : 0, 'PA (FP/AP)');
    eq(!!c.o.flaming, /flamíg/.test(txt), 'flamígero'); eq(!!c.o.noArmour, /sin salvación (de|por) armadura|sin armadura/.test(txt), 'sin salvación de armadura'); eq(!!c.o.noRegen, /Regeneración/.test(txt) && /sin/.test(txt), 'sin Regeneración');
    const mw = /Heridas [Mm]últiples \((D?\d)\)/.exec(txt); if (mw) eq(String(c.o.dmg), mw[1], 'Heridas múltiples');
  });
}

// hechizos con chequeo de Liderazgo previo: se fuerza cada rama con los dados
const ldCast = (key, q, d) => { const s = game([{ type: 'orc_weirdnob', models: 1 }], [{ type: 'state_troops', models: 40 }], { f: ['orcs', 'empire'], phase: 'magic' }); const w = U(s, 'orc_weirdnob'), e = U(s, 'state_troops', 1); engage(s, w, e); cur(s); globalThis.__WSL = []; dice(q); diceAll(d); const ev = []; R.applySpell(s, w, key, e, ev); return globalThis.__WSL.find((x) => x.def === e); };
T('v836-sp-mind_razor', FILE, 'Navaja Mental: Liderazgo superado = D3 impactos F3; fallado = D3+3 impactos F4 −3 AP', () => {
  const p = ldCast('mind_razor', [1, 2], 3), f = ldCast('mind_razor', [6, 5], 3); ok(p && f, 'sin heridas'); eq([p.hits, p.S, p.ap], [3, 3, 0], 'pasa'); eq([f.hits, f.S, f.ap], [6, 4, 3], 'falla (D3+3)'); });
T('v836-sp-light_death', FILE, 'Luz de la Muerte: Liderazgo superado = D3 F3 PA −1; fallado = D6+3 F6 PA 0 sin armadura/Regeneración, Heridas múltiples (2)', () => {
  const p = ldCast('light_death', [1, 2], 3), f = ldCast('light_death', [6, 5], 3); ok(p && f, 'sin heridas'); eq([p.hits, p.S, p.ap], [3, 3, 1], 'pasa'); eq([f.hits, f.S, f.ap], [6, 6, 0], 'falla (D6+3)'); ok(f.o.noArmour && f.o.noRegen, 'sin armadura ni Regeneración'); eq(String(f.o.dmg), '2', 'Heridas múltiples (2)'); });

// resto de hechizos (hex, encantamiento, vórtice, conveyance): se lanzan en el motor sobre un objetivo válido y deben producir un efecto observable (efecto en una unidad, plantilla/vórtice, posición, heridas o aviso propio del hechizo)
const snap = (s) => JSON.stringify(s.units.flatMap((h) => [h, ...(h.joined || [])]).map((u) => [u.id, u.x, u.y, u.models, u.wounds, u.fx, u.face])) + JSON.stringify([s.vortex, s.chaos, s.winds, s.reloc, s.pending]);
for (const [key, sp] of Object.entries(SPELLS)) {
  if (['missile', 'assail'].includes(sp.type) || CUSTOM.has(key)) continue;
  T('v836-sp-' + key, FILE, `Hechizo ${sp.name} (${sp.type}${sp.effect ? ', ' + sp.effect : ''}): se resuelve en el motor y produce su efecto (distinto del del mismo hechizo sin efecto)`, () => {
    // v842: el efecto observado debe deberse al hechizo: se repite el lanzamiento con SPELLS[key] reducido a nombre/saber/tipo/valor/alcance (sin campos de efecto) y el resultado debe ser distinto
    const cast = (d, inert) => {
      const s = game([{ type: 'orc_weirdnob', models: 1 }, { type: 'orc_boyz', models: 10 }], [{ type: 'state_troops', models: 30 }, { type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'magic' });
      const w = U(s, 'orc_weirdnob'), fr = U(s, 'orc_boyz', 0), es = s.units.filter((u) => u.owner === 1), e = es[0]; put(w, 36, 40); put(fr, 36, 44); put(e, 36, 30, Math.PI / 2); put(es[1], 20, 30, Math.PI / 2); cur(s);
      const tgt = sp.self || sp.range === 0 && sp.type === 'enchant' ? w : (sp.type === 'enchant' || sp.type === 'conveyance' ? fr : e); if (sp.type === 'hex' && sp.range === 0) engage(s, w, e);
      const before = snap(s), orig = SPELLS[key]; if (inert) { const cp = {}; for (const f of ['name', 'lore', 'type', 'cv', 'range', 'text']) if (f in orig) cp[f] = orig[f]; SPELLS[key] = cp; }
      diceAll(d); const ev = []; let err = null; try { R.applySpell(s, w, key, tgt, ev); } catch (x) { err = x; } finally { SPELLS[key] = orig; }
      return { s, before, err, m: msgs(ev), after: snap(s) };
    };
    let last = '';
    for (const d of [3, 1, 6]) {
      const r = cast(d, false); ok(!r.err || r.err.need, 'error al lanzarlo: ' + (r.err && r.err.message)); last = r.m.slice(0, 140);
      const eff = r.after !== r.before || /lanza [^\n]*(:|, pero)/.test(r.m); // efecto propio explícito en el aviso del hechizo (p. ej. «no hay bosque libre», «movimiento de reserva para…»)
      if (!eff) continue;
      const q = cast(d, true);       ok(q.err || q.after !== r.after || q.m !== r.m, 'el resultado con el hechizo reducido a sus datos básicos es idéntico: el efecto observado no es del hechizo (' + r.m.slice(0, 80) + ')'); return;
    }
    ok(false, 'sin cambio de estado ni aviso propio: ' + last);
  });
}

T('v836-sp-vaul_unmaking', FILE, 'Deshacer de Vaul: un personaje enemigo pierde un objeto mágico para el resto de la partida', () => {
  const it = Object.keys(DATA.ITEMS).find((k) => DATA.ITEMS[k].fac === 'empire' && /^emp/.test(k) && DATA.ITEMS[k].cost); ok(it, 'objeto');
  const s = game([{ type: 'orc_weirdnob', models: 1 }], [{ type: 'emp_witchhunter', models: 1, items: [it] }], { f: ['orcs', 'empire'], phase: 'magic' }); const w = U(s, 'orc_weirdnob'), c = U(s, 'emp_witchhunter', 1); put(w, 36, 40); put(c, 36, 30, Math.PI / 2); cur(s); eq(c.items.length, 1, 'montaje'); R.applySpell(s, w, 'vaul_unmaking', c, []); eq(c.items.length, 0, 'el objeto se pierde'); });
T('v836-sp-anvil_hearth', FILE, 'Runa de Hogar y Patria: unidades enanas amigas a 21" son Inmunes a la psicología (hasta tu próximo turno); las no enanas no', () => {
  const s = game([{ type: 'dw_runesmith', models: 1 }, { type: 'dw_warriors', models: 10 }, { type: 'dw_longbeards', models: 10 }], [{ type: 'state_troops', models: 10 }], { f: ['dw', 'empire'], phase: 'magic' }); const w = U(s, 'dw_runesmith'), a = U(s, 'dw_warriors', 0), b = U(s, 'dw_longbeards', 0); put(w, 36, 40); put(a, 36, 44); put(b, 36 + 30, 44); cur(s);
  R.applySpell(s, w, 'anvil_hearth', w, []); ok(R.has(a, 'immunePsy'), 'dentro de 21": Inmune a la psicología'); ok(!R.has(b, 'immunePsy') || R.D(b).sr.includes('immunePsy'), 'a más de 21": sin efecto'); });

// v842: dos hechizos cuyo efecto no depende de campos de datos (lo resuelve el motor por tipo/nombre): se comprueba el efecto concreto del texto
T('v836-sp-forest_walker', FILE, 'Caminante del Bosque: un personaje élfico amigo dentro de un bosque pasa a otro bosque, a más de 6" de enemigos; sin bosque libre no se mueve', () => {
  const mk = (foeNear) => { const s = game([{ type: 'we_spellsinger', models: 1 }], [{ type: 'orc_boyz', models: 10 }], { f: ['wood', 'orcs'], phase: 'magic' }); const w = U(s, 'we_spellsinger'), e = U(s, 'orc_boyz', 1);
    s.terrain = [{ id: 'fA', kind: 'forest', x: 20, y: 40, w: 8, h: 8 }, { id: 'fB', kind: 'forest', x: 56, y: 40, w: 8, h: 8 }]; put(w, 20, 40); put(e, foeNear ? 56 : 36, foeNear ? 35 : 10, Math.PI / 2); cur(s); return { s, w }; };
  const a = mk(false); diceAll(3); const ev = []; R.applySpell(a.s, a.w, 'forest_walker', a.w, ev); eq([a.w.x, a.w.y], [56, 40], 'reaparece en el otro bosque'); ok(/reaparece en otro bosque/.test(msgs(ev)), 'aviso');
  const b = mk(true); diceAll(3); const ev2 = []; R.applySpell(b.s, b.w, 'forest_walker', b.w, ev2); eq([b.w.x, b.w.y], [20, 40], 'el otro bosque está a ≤ 6" de un enemigo: no se mueve'); ok(/no hay bosque libre/.test(msgs(ev2)), 'aviso sin bosque libre');
});
T('v836-sp-spiteful_torrent', FILE, 'Torrente de Duendes: vórtice de 3" que permanece en juego, terreno difícil', () => {
  const s = game([{ type: 'orc_weirdnob', models: 1 }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'magic' }); const w = U(s, 'orc_weirdnob'), e = U(s, 'state_troops', 1); put(w, 36, 40); put(e, 36, 30, Math.PI / 2); cur(s);
  const n0 = (s.terrain || []).length; diceAll(3); R.applySpell(s, w, 'spiteful_torrent', e, []);
  const tv = s.terrain.filter((x) => x.vx && x.spell === 'spiteful_torrent'); eq(tv.length, 1, 'una plantilla de vórtice en el terreno'); eq([tv[0].w, tv[0].h], [3, 3], 'plantilla de 3"'); ok(tv[0].diff, 'terreno difícil'); eq(s.terrain.length, n0 + 1, 'solo se añade esa plantilla');
  eq(s.vortex.filter((v) => v.spell === 'spiteful_torrent').length, 1, 'permanece en juego (vórtice)');
});
