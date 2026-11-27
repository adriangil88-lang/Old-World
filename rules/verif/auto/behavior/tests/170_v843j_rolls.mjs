// v843j — todas las tiradas con tabla/umbral propio, los chequeos de Liderazgo sueltos, los efectos automáticos solo registrados y el desglose de modificadores: aviso/tabla ANTES de actuar (popup + OK); mismo resultado con la misma semilla
import fs from 'node:fs';
import { T, R, DATA, game, U, ok, eq, bout, cur, put, diceAll, dlog, resetDice, msgs } from '../lib2.mjs';
import { AI } from '../engine.mjs';
const SRC = fs.readFileSync(new URL('../../../../../app/js/rules.js', import.meta.url), 'utf8');
const POL = JSON.parse(fs.readFileSync(new URL('../sites_policy.json', import.meta.url), 'utf8'));
const CORE = 'rules/core.txt';
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 600; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    const log0 = dlog().slice(); const n0 = log0.length;
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) {
      if (!e.need) throw e; ok(e.need.ack === true && e.need.opts[0][0] === 'ok', 'el aviso debe ser de tipo ack con botón OK');
      needs.push({ ...e.need, rolled: dlog().length - n0 }); ans[e.need.k] = 'ok'; globalThis.__DLOG = log0;
    }
  }
  throw new Error('demasiados avisos');
}
const sig = (s) => JSON.stringify([s.rng, s.units.map((u) => [u.id, u.x, u.y, u.models, u.wounds, u.fleeing])]);
const base = () => game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'move' });
const same = (s, f) => { const a = ackRun(s, f); const c = structuredClone(s); c.askMode = null; cur(c); f(c); eq(sig(a.s), sig(c), 'mismo resultado con y sin avisos'); return a; };

T('v843j-inv-static', 'rules/VERIFICACION.md v843j (inventario exhaustivo)', 'Inventario estático: ninguna llamada de dados queda fuera de un sitio de tirada con identificador; todo identificador tiene ficha (clase C/G/N) y todo grupo G tiene nombre de regla; toda clase C/N tiene motivo', () => {
  const body = SRC.slice(0, SRC.indexOf('// <<SITES')).split('\n');
  const ALLOWED = /^(const (d6|d3|roll2d6|r6|r3|r2|roll2d6q) =|function roll3Best|function rollExpr)/;
  const raw = []; let fn = '';
  body.forEach((l, i) => { const m = /^(?:export )?(?:async )?function\s+(\w+)/.exec(l); if (m) fn = m[1]; if (ALLOWED.test(l) || /^\s*(\/\/|\*)/.test(l)) return; if (/\b(d6|d3|roll2d6|roll3Best|rollExpr)\((s|CUR)\b/.test(l) && !['rollExpr', 'roll3Best'].includes(fn) && !/^const rz(D6|D3|D2|D3b|Expr) =/.test(l)) raw.push(i + 1 + ': ' + l.slice(0, 90)); });
  eq(raw, [], 'llamadas de dados sin sitio');
  const ids = [...new Set([...body.join('\n').matchAll(/\b(?:rzD6|rzD3|rzD2|rzD3b)\((?:s|CUR), '([A-Za-z0-9_$]+:\d+)'|\brzExpr\((?:s|CUR), '([A-Za-z0-9_$]+:\d+)'/g)].map((m) => m[1] || m[2]))];
  ok(ids.length > 450, 'pocos sitios: ' + ids.length);
  const site = Object.fromEntries([...SRC.matchAll(/^'([A-Za-z0-9_$]+:\d+)': \['([CGN])', '([^\n]*?)'(?:, '\w+')?\],$/gm)].map((m) => [m[1], [m[2], m[3]]]));
  eq(ids.filter((i) => !site[i]), [], 'sitios sin ficha'); eq(Object.keys(site).filter((i) => !ids.includes(i)), [], 'fichas sin sitio');
  const lab = Object.fromEntries([...SRC.matchAll(/^'([A-Za-z0-9_$]+)': '([^\n]+)',$/gm)].map((m) => [m[1], m[2]]));
  const noLab = [...new Set(ids.filter((i) => site[i][0] === 'G').map((i) => i.split(':')[0]))].filter((f) => !lab[f]);
  eq(noLab, [], 'funciones G sin nombre de regla');
  const cls = { C: 0, G: 0, N: 0 }; for (const i of ids) cls[site[i][0]]++;
  ok(cls.C > 100 && cls.G > 250, JSON.stringify(cls));
  const cNoWhy = ids.filter((i) => site[i][0] === 'C' && !(POL.idC[i] || POL.fnC.includes(i.split(':')[0]))); eq(cNoWhy, [], 'C sin motivo');
  ok(Object.values(POL.idC).every((v) => v.length > 10) && Object.values(POL.fnN).every((v) => v.length > 10), 'motivos vacíos');
});
T('v843j-inv-rnd', 'rules/VERIFICACION.md v843j (aleatoriedad que no es una tirada del libro)', 'Todo uso directo de rnd(s) está en una función catalogada con motivo (geometría/dirección de dispersión, elecciones al azar, muestreo estadístico interno): no hay dado del libro oculto', () => {
  const body = SRC.slice(0, SRC.indexOf('// <<SITES')).split('\n'); let fn = ''; const c = {};
  body.forEach((l) => { const m = /^(?:export )?(?:async )?function\s+(\w+)|^(?:export )?const\s+(\w+)\s*=\s*(?:\(|async|function|\w+\s*=>)/.exec(l); if (m) fn = m[1] || m[2]; if (/^(export function rnd|  let a = \(s\.rng|  let t = Math\.imul|  t = \(t|  return \(\(t \^)/.test(l) || /^const (d6|d3|r6|r3) /.test(l)) return; const n = (l.match(/\brnd\((s|CUR)\)/g) || []).length; if (n) c[fn] = (c[fn] || 0) + n; });
  const OK = ['spawnEdge', 'chaosCart', 'axeSetup', 'createGame', 'stirAuto', 'stirEntryPos', 'autoFlank', 'woundAndSave0', 'tplPlan', 'vanguardMoves', 'resolveShot0', 'flyHit', 'applySpell0', 'attackProfile0', 'handAlloc', 'handStrike', 'fightGroup', 'zzzzap', 'resolveCombats', 'beginStrategy', 'nomSetup', 'apply0', 'peekRollOff'];
  eq(Object.keys(c).filter((f) => !OK.includes(f)), [], 'rnd(s) en funciones no catalogadas');
  ok(Object.keys(c).length >= 18, 'inventario rnd demasiado corto');
});
T('v843j-wild-spores', 'rules/VERIFICACION.md v843j (Terreno salvaje; Battle March)', 'Terreno salvaje: la tabla de 6 resultados sale antes del D6 y las Esporas tóxicas muestran tu Resistencia resaltada antes de tirar; mismo resultado sin avisos', () => {
  const s = base(); const u = U(s, 'state_troops', 0); put(u, 20, 20); s.terrain = [{ id: 'f1', kind: 'forest', x: 20, y: 20, w: 10, h: 10, rot: 0 }]; cur(s); diceAll(4);
  const a = same(s, (c) => { cur(c); R.wildDiscover(c, c.units.find((x) => x.id === u.id), true, []); });
  const w = a.needs.find((n) => n.title === 'Terreno salvaje'); if (w) { eq(w.rolled, 0, 'dados antes del aviso'); eq(w.tbls[0].rows.map((r) => r[0]), ['1', '2', '3', '4', '5', '6']); ok(/Esporas/.test(w.tbls[0].rows[2][1]), 'cara 3 = Esporas tóxicas'); }
  const t = s.terrain[0]; t.wild = 3; diceAll(2);
  const b = ackRun(s, (c) => { cur(c); R.wildDiscover(c, c.units.find((x) => x.id === u.id), true, []); }); const sp = b.needs.find((n) => n.title === 'Esporas tóxicas');
  ok(sp, 'sin aviso de esporas'); eq(sp.rolled, 0); eq(sp.tbls[0].cols, [1, 2, 3, 4, 5, 6]); eq(sp.tbls[0].hc, Math.min(5, DATA.UNITS.state_troops.T)); ok(sp.tbls[0].rows[0].includes('Herida') && sp.tbls[0].rows[0][5] === 'Herida', 'el 6 natural siempre falla');
});
T('v843j-ogre-misfire', 'rules/VERIFICACION.md v843j (Averías de máquinas ogras; Legends Ogros)', 'Avería de máquinas ogras: tabla propia 1 / 2-3 / 4-6 antes de tirar (distinta de la de piedra/pólvora); la Avería normal avisa del −1 de Ligado al infierno', () => {
  const s = base(); const u = U(s, 'state_troops', 0); cur(s); diceAll(5);
  const a = same(s, (c) => { cur(c); R.ogreMisfire(c, c.units.find((x) => x.id === u.id), []); });
  const n = a.needs[0]; eq(n.title, 'Tabla de Averías (máquinas ogras)'); eq(n.rolled, 0); eq(n.tbls[0].rows.map((r) => r[0]), ['1', '2-3', '4-6']);
  const m = ackRun(s, (c) => { cur(c); R.misfire(c, c.units.find((x) => x.id === u.id), []); }); eq(m.needs[0].title, 'Tabla de Averías'); eq(m.needs[0].tbls[0].rows.map((r) => r[0]), ['1', '2-4', '5-6']); eq(m.needs[0].tbls[1].rows[0][0], 'Sin modificadores');
  const h = withHell(s, u); eq(h.needs[0].tbls[1].rows[0], ['Ligado al infierno', '−1']);
});
const withHell = (s, u) => { const c0 = structuredClone(s); const x = c0.units.find((q) => q.id === u.id); x.sr = [...(x.sr || []), 'hellbound']; const d = DATA.UNITS[x.type]; const had = d.sr.includes('hellbound'); if (!had) d.sr.push('hellbound'); try { return ackRun(c0, (c) => { cur(c); R.misfire(c, c.units.find((q) => q.id === u.id), []); }); } finally { if (!had) d.sr.splice(d.sr.indexOf('hellbound'), 1); } };
T('v843j-gaze-mercs-lumber', 'rules/VERIFICACION.md v843j (Mirada de los Dioses; Mercenarios errantes; Destrucción desmedida)', 'Mirada de los Dioses (6 resultados), Mercenarios errantes (mayor / empate) y Destrucción desmedida (1 = se detiene): cada tabla antes de tirar', () => {
  const s = base(); const u = U(s, 'state_troops', 0); cur(s); diceAll(4);
  const g = same(s, (c) => { cur(c); R.gazeRoll(c, c.units.find((x) => x.id === u.id), []); }); eq(g.needs[0].title, 'Mirada de los Dioses'); eq(g.needs[0].rolled, 0); eq(g.needs[0].tbls[0].rows.map((r) => r[0]), ['1', '2', '3', '4', '5', '6']); ok(/Apoteosis/.test(g.needs[0].tbls[0].rows[5][1]));
  const mc = ackRun(s, (c) => { cur(c); R.chaosMercs(c, []); }); eq(mc.needs[0].title, 'Mercenarios errantes'); eq(mc.needs[0].rolled, 0); eq(mc.needs[0].tbls[0].rows.map((r) => r[0]), ['Mayor', 'Empate']);
  const lb = same(s, (c) => { cur(c); R.lumberRoll(c, c.units.find((x) => x.id === u.id), []); }); eq(lb.needs[0].title, 'Destrucción desmedida'); eq(lb.needs[0].rolled, 0); eq(lb.needs[0].tbls[0].rows[0][0], '1');
});
T('v843j-ld-loose', CORE + ' (Leadership tests, p.97)', 'Chequeo de Liderazgo suelto (objeto/estandarte/regla): tabla de 2D6 con tu Liderazgo resaltado y los modificadores al resultado, antes de tirar; cada repetición lleva su propia ventana', () => {
  const s = base(); const u = U(s, 'state_troops', 0); cur(s); diceAll(3);
  const a = same(s, (c) => { cur(c); const x = c.units.find((q) => q.id === u.id); const r1 = R.rollLd(c, x, 8); const r2 = R.rollLd(c, x, 8, { mod: 2 }); return [r1, r2]; });
  eq(a.needs.length, 2); eq(a.needs[0].title, 'Chequeo de Liderazgo'); eq(a.needs[0].rolled, 0); eq(a.needs[0].tbls[0].cols[a.needs[0].tbls[0].hc], 8); eq(a.needs[1].tbls[0].cols[a.needs[1].tbls[0].hc], 6, 'Ld 8 con +2 al resultado = 6'); ok(/\+2 al resultado/.test(a.needs[1].msg));
  const who = DATA.UNITS.state_troops; ok(who.Ld > 0);
});
T('v843j-effect-hook', 'rules/VERIFICACION.md v843j (efectos solo registrados)', 'Efecto automático solo registrado (logE): aviso previo con OK; no avisan las líneas de resultado (hit/destroy/…) ni las que siguen a una tirada ya avisada con tabla; sin ack no hay aviso', () => {
  const s = base(); cur(s); diceAll(3);
  const a = ackRun(s, (c) => { cur(c); const ev = []; R.logE(ev, 'Prueba: la unidad gana una ficha', { k: 'hold', owner: 0 }); R.logE(ev, 'Resultado: 2 bajas', { k: 'hit', owner: 0 }); return ev; });
  eq(a.needs.length, 1); eq(a.needs[0].title, 'Efecto automático'); ok(/ficha/.test(a.needs[0].msg)); eq(a.r.length, 2, 'las dos líneas se registran');
  const b = ackRun(s, (c) => { cur(c); R.ackD(c, [0], 'k', 'Tabla', () => ['m', []]); R.rnd(c); R.logE([], 'Consecuencia de la tirada', { k: 'hold', owner: 0 }); });
  eq(b.needs.map((n) => n.title), ['Tabla'], 'consecuencia de una tirada ya avisada: sin segundo aviso');
  const c = ackRun(s, (c0) => { cur(c0); R.ackD(c0, [0], 'k', 'Tabla', () => ['m', []]); R.logE([], 'Efecto independiente', { k: 'hold', owner: 0 }); }); eq(c.needs.map((n) => n.title), ['Tabla', 'Efecto automático']);
  const d = structuredClone(s); d.askMode = null; cur(d); const ev = []; R.logE(ev, 'Sin ack', { k: 'hold', owner: 0 }); eq(ev.length, 1);
});
T('v843j-breakdown', CORE + ' (To Hit / To Wound / Ranged to hit)', 'Desglose regla por regla: impactar en melé muestra «Miedo +1», herir muestra el modificador a la Resistencia, disparo muestra «largo alcance +1»; el neto coincide con el número final', () => {
  const r = bout('state_troops', {}, 'orc_boyz', {}, { noFight: true, charge: 4, fa: 'empire', fb: 'orcs' }); const s = r.s; const a0 = U(s, 'state_troops', 0), b0 = U(s, 'orc_boyz', 1); a0.fearFrom = b0.id; (b0.fx ||= []).push({ k: 'whipT', perm: true }); cur(s);
  const a = ackRun(s, (c) => { cur(c); R.resolveCombats(c, []); });
  const h = a.needs.find((n) => n.title === 'Tirada para impactar'); const bk = h.tbls.find((t) => t.k === 'kv' && /Modificadores/.test(t.cap)); ok(bk, 'sin desglose de impactar');
  ok(bk.rows.some((x) => /Miedo/.test(x[0]) && x[1] === '+1'), JSON.stringify(bk.rows)); eq(bk.rows[bk.rows.length - 1][1], h.tbls[0].need, 'el resultado final coincide con el número resaltado');
  const w = a.needs.find((n) => n.title === 'Tirada para herir' && /Orcos →|→/.test(n.msg)); const wb = w.tbls.find((t) => t.k === 'kv' && /Resistencia efectiva/.test(t.cap)); ok(wb, 'sin desglose de herir');
  ok(wb.rows.some((x) => /Látigo/.test(x[0]) && x[1] === '−1'), JSON.stringify(wb.rows));
  const sh = game([{ type: 'emp_archers', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'shoot' }); const s0 = put(U(sh, 'emp_archers'), 36, 44), t0 = put(U(sh, 'orc_boyz', 1), 36, 22, Math.PI / 2); cur(sh); diceAll(1);
  const b = ackRun(sh, (c) => { cur(c); R.resolveShot(c, c.units.find((x) => x.id === s0.id), c.units.find((x) => x.id === t0.id), []); }); const n = b.needs.find((x) => /impactar/.test(x.title)); const sb = n.tbls.find((t) => t.k === 'kv' && /Modificadores/.test(t.cap));
  ok(sb && sb.rows.some((x) => /largo alcance/.test(x[0]) && x[1] === '+1'), JSON.stringify(sb && sb.rows));
});
T('v843j-auto-wounds', CORE + ' (Armour Saves; automatic wounds)', 'Heridas automáticas (sin tirada para herir): la ventana muestra las salvaciones antes de tirarlas', () => {
  const s = base(); const u = U(s, 'state_troops', 0), e = U(s, 'orc_boyz', 1); cur(s); diceAll(3);
  const a = same(s, (c) => { cur(c); return R.woundAndSave(c, c.units.find((x) => x.id === e.id), 3, 3, 0, { auto: true }); });
  const w = a.needs.find((n) => n.title === 'Salvaciones (heridas automáticas)'); ok(w, 'sin ventana de salvaciones: ' + a.needs.map((n) => n.title)); eq(w.rolled, 0); ok(w.tbls.some((t) => t.k === 'kv' && /Salvaciones/.test(t.cap)));
});
T('v843j-game-windows', 'rules/VERIFICACION.md v843j (inventario dinámico en partidas IA contra IA)', 'Partida completa con avisos: cada tirada ejecutada tiene su ventana confirmada en esa acción (ids G) o cubierta (C/N); aparecen ventanas de carga, Liderazgo, efectos y tablas; el estado tras cada acción es idéntico al de la partida sin avisos', () => {
  const P = DATA.PRESETS; const w = JSON.parse(fs.readFileSync(new URL('../../../../../app/weights.json', import.meta.url), 'utf8')).weights;
  const titles = {}; let rolls = 0, gRolls = 0, bad = 0, nAct = 0; const miss = [];
  const mk = () => R.createGame({ seed: 2, armies: [P.empire[1000], P.orcs[1000]], factions: ['empire', 'orcs'], limit: 1000 });
  const s = mk(), s2 = mk(); R.apply(s, { t: 'ready', player: 0 }); R.apply(s, { t: 'ready', player: 1 }); R.apply(s2, { t: 'ready', player: 0 }); R.apply(s2, { t: 'ready', player: 1 });
  const cfgs = [0, 1].map((i) => ({ weights: w, level: AI.LEVELS.medium, rng: AI.mkRng(2 * 7 + i) }));
  let seen = []; R.setRollCheck((st, dice, ss) => { seen.push([st, ss]); });
  try {
    let G = { s }, guard = 0;
    while (G.s.phase !== 'over' && guard++ < 200 && nAct < 140) {
      const stt = { done: new Set() }; const p = G.s.active;
      for (let g = 0; G.s.active === p && G.s.phase !== 'over' && g < 400 && nAct < 140; g++) {
        const a = AI.nextAction(G.s, cfgs[G.s.active], stt); let act = a, r, tries = 0, nAck = 0;
        for (;;) {
          G.s.askMode = null; const snap = structuredClone(G.s); seen = [];
          try { G.s.askMode = { 0: true, 1: true, ack: { 0: true, 1: true } }; r = R.apply(G.s, act); G.s.askMode = null; break; } catch (e) {
            G.s.askMode = null; if (!e.need) throw e; G.s = snap; titles[e.need.title] = (titles[e.need.title] || 0) + 1;
            const v = e.need.ack ? 'ok' : e.need.opts[tries % e.need.opts.length][0]; if (e.need.ack) { if (++nAck > 3000) throw new Error('bucle'); } else if (++tries > 30) throw new Error('bucle de preguntas');
            act = { ...act, ans: { ...(act.ans || {}), [e.need.k]: v } };
          }
        }
        for (const [st] of seen) { rolls++; if (st.cls === 'G') { gRolls++; if (!Object.keys(act.ans || {}).some((k) => k.endsWith(':ack:g:' + st.id))) miss.push(st.id); } }
        s2.askMode = null; R.apply(s2, act); nAct++;
        if (sig(G.s) !== sig(s2)) bad++;
        if (!r.ok) { R.apply(G.s, { t: 'endPhase' }); R.apply(s2, { t: 'endPhase' }); }
        if (a.t === 'endPhase') stt.done.clear();
      }
    }
  } finally { R.setRollCheck(null); }
  eq(bad, 0, 'estado distinto tras acciones con avisos'); eq(miss, [], 'tirada G sin su ventana'); ok(nAct >= 60, 'pocas acciones: ' + nAct);
  ok(titles['Tirada para impactar'] > 0 && titles['Tirada para herir'] > 0, JSON.stringify(titles).slice(0, 300));
  ok(Object.keys(titles).some((t) => /Tirada de carga|Chequeo de Liderazgo|Efecto automático|Tirada de dados/.test(t)), 'sin ventanas v843j: ' + JSON.stringify(titles).slice(0, 400)); ok(rolls > 20, 'sin tiradas observadas: ' + rolls);
});
