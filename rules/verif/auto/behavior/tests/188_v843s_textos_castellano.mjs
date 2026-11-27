// v843s (punto 9) — todo texto visible en castellano: las ventanas/tablas de las rutas principales y las citas «…» del código no contienen frases inglesas
import { T, R, game, U, ok, eq, cur, put, diceAll, bout } from '../lib2.mjs';
import fs from 'fs';
const APP = '/home/claude/tow/app/js/';
// detector sencillo de frases/palabras inglesas típicas (se permiten los nombres propios de libros)
const PROPIOS = /Matched Play Guide|Arcane Journal|Northern Crossroads|Core Rulebook|Ravening Hordes|Forces of Fantasy|Warhammer|The Old World/gi;
const EN_RX = /\b(the|your|may|then|instead|if you wish|must|which|their|would|should|until|unless|whenever|re-roll|roll-off|once (?:deployment|per|a)|in the case of|is complete|takes? the)\b/i;
const strs = (x, o = []) => { if (typeof x === 'string') o.push(x); else if (Array.isArray(x)) x.forEach((y) => strs(y, o)); else if (x && typeof x === 'object') Object.values(x).forEach((y) => strs(y, o)); return o; };
const hallar = (needs) => { const bad = []; for (const n of needs) for (const t of strs([n.title, n.msg, n.tbls])) { const c = t.replace(PROPIOS, ''); const m = EN_RX.exec(c); if (m) bad.push(`«${m[0]}» en «${t.slice(0, 90)}»`); } return bad; };
function ackRun(s, f, p = [0, 1]) {
  const needs = []; const ans = {};
  for (let k = 0; k < 600; k++) {
    const c = structuredClone(s); c.ans = { ...ans }; c.askMode = { ack: Object.fromEntries(p.map((x) => [x, true])) };
    try { const r = f(c); c.askMode = null; c.ans = null; return { r, s: c, needs }; } catch (e) { if (!e.need) throw e; needs.push(e.need); ans[e.need.k] = 'ok'; }
  }
  throw new Error('demasiados avisos');
}
T('v843s-textos-popups-castellano', 'v843s punto 9', 'Las ventanas previas de primer turno, tirada enfrentada, disparo, herida/salvaciones y combate no contienen frases inglesas', () => {
  let all = [];
  const s0 = game([{ type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'deploy' }); s0.rolloff = true; s0.preFirst = null; s0.firstReady = 0; s0.scn = 'glory'; s0.kurnous = [0, 0]; cur(s0);
  all.push(...ackRun(s0, (c) => { cur(c); c.rollW = null; c.rollWinner = null; R.firstRoll(c, []); }).needs);
  all.push(...ackRun(s0, (c) => R.rollOff(c)).needs);
  const sh = game([{ type: 'orc_boyz', models: 10 }], [{ type: 'emp_archers', models: 10 }], { f: ['orcs', 'empire'], phase: 'shoot', active: 1 });
  const a = U(sh, 'emp_archers', 1), t = U(sh, 'orc_boyz', 0); put(a, 36, 22, Math.PI / 2); put(t, 36, 40, -Math.PI / 2); cur(sh); diceAll(6);
  all.push(...ackRun(sh, (c) => { cur(c); R.resolveShot(c, c.units.find((x) => x.id === a.id), c.units.find((x) => x.id === t.id), []); }, [0]).needs);
  const r = bout('state_troops', {}, 'orc_boyz', {}, { noFight: true, charge: 4, fa: 'empire', fb: 'orcs' }); cur(r.s);
  all.push(...ackRun(r.s, (c) => { cur(c); R.resolveCombats(c, []); }).needs);
  ok(all.length >= 6, 'ventanas recogidas: ' + all.length);
  const bad = hallar(all); eq(bad, [], 'frases inglesas en ventanas');
});
T('v843s-citas-castellano', 'v843s punto 9', 'Ninguna cita «…» visible del código (main.js, rules.js, data.js, render.js) es una frase inglesa', () => {
  const EN = /\b(the|your|may|then|instead|once|must|each|which|when|that|with|its|their|any|cannot|this|from|into|until|only|and|of|to|is|are|you|has|have|will|can|not|for|if|or|an|by|be|it|on)\b/gi;
  const ES = /\b(el|la|los|las|de|del|que|una|un|en|se|con|por|para|su|sus|al|es|no|y|o|si|más|como|cada|este|esta|unidad|puede|hasta|donde|sobre)\b/gi;
  const bad = [];
  for (const f of ['main.js', 'rules.js', 'data.js', 'render.js']) fs.readFileSync(APP + f, 'utf8').split('\n').forEach((L0, i) => {
    if (/^\s*\/\//.test(L0)) return; let L = L0.replace(/\/\*[^]*?\*\//g, ' '); const ci = L.search(/\s\/\/\s/); if (ci >= 0) L = L.slice(0, ci);
    for (const m of L.matchAll(/«([^»]{14,})»/g)) { const t = m[1].replace(PROPIOS, ''), en = (t.match(EN) || []).length, es = (t.match(ES) || []).length; if (en >= 3 && es === 0) bad.push(`${f}:${i + 1} ${t.slice(0, 80)}`); }
  });
  eq(bad, [], 'citas inglesas');
  ok(!/Once deployment is complete|In the case of a tie|If you wish, your Wizard/.test(fs.readFileSync(APP + 'rules.js', 'utf8') + fs.readFileSync(APP + 'main.js', 'utf8').replace(/\/\/[^\n]*/g, '')), 'citas del primer turno y de la firma traducidas');
});
