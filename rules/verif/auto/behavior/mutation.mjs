// v842 — Prueba de mutación del arnés (run.sh --mutation [N] [filtro])
// Para cada prueba de la muestra se rompe a propósito el comportamiento relacionado en la COPIA del motor (.eng) y se comprueba que la prueba FALLA.
// Una prueba que sigue pasando con el comportamiento roto no está comprobando ese comportamiento (aserción vacía): sobrevive.
// Operadores (todos sobre datos o ganchos de la copia, nunca sobre app/js):
//  R  regla: se quita la regla r de todos los perfiles/objetos y has(u, r) devuelve falso (r = reglas que la prueba ha hecho efectivas o nombra)
//  I  objeto: ITEMS[k] pierde todos sus campos de efecto (se conservan fac, name, cost, cat, bn, rune, dup, star)
//  S  hechizo: SPELLS[k] pierde sus campos de efecto (daño, F, PA, impactos, efecto…)
//  U  unidad: UNITS[t].sr = [] (sin reglas especiales)
//  F  llamada: R.<fn> (que la prueba invoca) devuelve un valor alterado y deja alterado el estado/registro que recibe
//  P  perfil: UNITS[t] con todas sus características numéricas +1 · I2/S2 idem para objetos/hechizos · G objeto/estandarte ausente de las listas con que game() crea la partida
//  E  nombre: el identificador (objeto/hechizo/regla/unidad) desaparece de las comparaciones por nombre que hace rules.js (copia modificada de rules.js)
//  A  añadir: la regla r se añade a los perfiles que la prueba usa (mata las aserciones negativas)
//  D  dados: cada dado d6 pasa a 7−d6 y cada d3 a 4−d3
//  C  código (v843, último recurso): se mide con cobertura V8 qué trozos de rules.js ejecuta la prueba (menos lo que ya ejecuta montar una partida vacía) y se muta el código real ejecutado
//     (>=↔>, <=↔<, ===↔!==, &&↔||, +↔−, entero+1, true↔false, quitar «!») en una copia del módulo; hasta MUT_C (60) mutantes deterministas por prueba. Desactivable con MUT_NOC=1
// «Muere» solo si la prueba falla con una aserción (Fail) que no sea la comprobación de colocación de `engage()`; un fallo por excepción (TypeError…) no cuenta (no demuestra nada).
globalThis.OPT_FAST = 1;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const L = await import('./lib.mjs');
// integridad de los datos: una prueba que falla a mitad bajo un mutante puede dejar tablas de datos modificadas (no restauradas); se detecta y se restaura la copia original antes de la prueba siguiente
const DT = Object.entries(L.DATA).filter(([, v]) => v && typeof v === 'object');
const dsig = (v) => { try { return JSON.stringify(v, (k, x) => (typeof x === 'function' ? undefined : x)); } catch (e) { return null; } };
const dclone = (x, m = new WeakMap()) => { if (!x || typeof x !== 'object') return x; if (m.has(x)) return m.get(x); if (x instanceof Set) return new Set([...x].map((e) => dclone(e, m))); if (x instanceof Map) return new Map([...x].map(([k, v]) => [k, dclone(v, m)])); const o = Array.isArray(x) ? [] : Object.create(Object.getPrototypeOf(x)); m.set(x, o); for (const k of Object.keys(x)) o[k] = dclone(x[k], m); return o; };
const PRIS = DT.map(([k, v]) => [k, v, dsig(v), dclone(v)]);
let CORR = 0;
function integrity(id) { for (const [k, v, sg, cl] of PRIS) { if (sg === null) continue; if (dsig(v) === sg) continue; CORR++; if (process.env.MUT_DBG) console.error('datos restaurados tras', id, k); const c2 = dclone(cl); if (Array.isArray(v)) { v.length = 0; v.push(...c2); } else if (v instanceof Set || v instanceof Map) { v.clear(); for (const e of c2) v instanceof Set ? v.add(e) : v.set(e[0], e[1]); } else { for (const kk of Object.keys(v)) delete v[kk]; Object.assign(v, c2); } } }

const { R, DATA } = L;
const N_MAX = +process.argv[2] || 300, filt = process.argv[3] || '';
for (const f of fs.readdirSync(path.join(HERE, 'tests')).sort()) if (f.endsWith('.mjs')) await import(pathToFileURL(path.join(HERE, 'tests', f)).href);
const { UNITS, ITEMS, SPELLS, RULES } = DATA;
const KEEP_I = new Set(['fac', 'name', 'cost', 'cat', 'bn', 'rune', 'dup', 'star', 'text']);
const KEEP_S = new Set(['name', 'lore', 'type', 'cv', 'range', 'text']);
const clearCaches = () => { for (const k of ['GZ', 'DV', 'MXV', 'GRB', 'CRS', 'CULTD', 'VETV']) R[k]?.clear?.(); DATA.OPTV?.clear?.(); };
// ---- operadores: cada uno devuelve una función de restauración ----
const opRule = (r) => {
  const sv = []; globalThis.__MUTR = r;
  for (const u of Object.values(UNITS)) if (Array.isArray(u.sr) && u.sr.includes(r)) { sv.push([u, 'sr', u.sr]); u.sr = u.sr.filter((x) => x !== r); }
  for (const it of Object.values(ITEMS)) if (Array.isArray(it.grant) && it.grant.includes(r)) { sv.push([it, 'grant', it.grant]); it.grant = it.grant.filter((x) => x !== r); }
  clearCaches(); return () => { globalThis.__MUTR = null; for (const [o, k, v] of sv) o[k] = v; clearCaches(); };
};
const opItem = (k) => { const o = ITEMS[k], cp = {}; for (const f of KEEP_I) if (f in o) cp[f] = o[f]; ITEMS[k] = cp; clearCaches(); return () => { ITEMS[k] = o; clearCaches(); }; };
const opSpell = (k) => { const o = SPELLS[k], cp = {}; for (const f of KEEP_S) if (f in o) cp[f] = o[f]; SPELLS[k] = cp; clearCaches(); return () => { SPELLS[k] = o; clearCaches(); }; };
const opUnit = (t) => { const o = UNITS[t].sr; UNITS[t].sr = []; clearCaches(); return () => { UNITS[t].sr = o; clearCaches(); }; };
const NUMF = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Ld', 'ppm', 'min', 'max', 'files', 'Sv', 'ward', 'cost', 'cv', 'range', 's', 'ap', 'lvl', 'value', 'mr', 'ldMod'];
const perturbObj = (o) => { const log = []; const rec = (x, d) => { for (const [k, v] of Object.entries(x)) { if (typeof v === 'number') { log.push([x, k, v]); x[k] = v + 1; } else if (typeof v === 'boolean') { log.push([x, k, v]); x[k] = !v; } else if (v && typeof v === 'object' && d < 4 && !Array.isArray(v)) rec(v, d + 1); else if (Array.isArray(v) && d < 4 && v.some((e) => e && typeof e === 'object')) { for (const e of v) if (e && typeof e === 'object') rec(e, d + 1); } else if (typeof v === 'string' && !['name', 'label', 'txt', 'desc'].includes(k) && d < 4) { log.push([x, k, v]); x[k] = v + '~'; } else if (Array.isArray(v) && v.length && v.every((e) => typeof e === 'string') && d < 4) { log.push([x, k, v]); x[k] = [...v.slice(1), v[0] + '~']; } else if (Array.isArray(v) && v.length && v.every((e) => typeof e === 'number') && d < 3) { log.push([x, k, v]); x[k] = v.map((e) => e + 1); } } }; rec(o, 0); clearCaches(); return () => { for (const [x, k, v] of log.reverse()) x[k] = v; clearCaches(); }; };
const opAdd = (r, ts) => { const sv = []; for (const t of ts) if (UNITS[t] && Array.isArray(UNITS[t].sr) && !UNITS[t].sr.includes(r)) { sv.push([UNITS[t], UNITS[t].sr]); UNITS[t].sr = [...UNITS[t].sr, r]; } clearCaches(); return () => { for (const [u, v] of sv) u.sr = v; clearCaches(); }; }; // A: se añade la regla a los perfiles que la prueba usa (mata las aserciones negativas «no tiene r»)
const opProf = (t) => perturbObj(UNITS[t]), opItemV = (k) => perturbObj(ITEMS[k]), opSpellV = (k) => perturbObj(SPELLS[k]);
const opItemGone = (k) => { globalThis.__MUTITEM = k; return () => { globalThis.__MUTITEM = null; }; }; // game() crea las unidades sin ese objeto/estandarte
// E: el identificador k desaparece de las comparaciones por nombre del motor (cada “'k'” de rules.js pasa a “'k__x'”): se importa una copia modificada de rules.js y R.<fn> se redirige a ella durante la prueba
const RSRC = fs.readFileSync(path.join(HERE, '.eng', 'rules.js'), 'utf8'), RLIT = new Set([...RSRC.matchAll(/'([A-Za-z_][\w:]*)'/g)].map((m) => m[1]));
let EN = 0;
// v843: los mutantes del motor se cargan con vm.compileFunction (el módulo se convierte en una función que recibe los módulos importados y devuelve sus nombres): se recogen por el recolector,
// mientras que cada import() de un módulo ESM nuevo (y vm.SourceTextModule) queda retenido para siempre (~3 MB por mutante) y agotaba la memoria.
const NSX = {}; for (const m of ['data', 'geom', 'dawn']) NSX['./' + m + '.js'] = await import(pathToFileURL(path.join(HERE, '.eng', m + '.js')).href);
const R_NAMES = [...new Set([...[...RSRC.matchAll(/\bexport\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]), ...[...RSRC.matchAll(/^export\s*\{([^}]*)\}/gm)].flatMap((m) => m[1].split(',').map((x) => x.trim().split(/\s+as\s+/).pop()).filter(Boolean))])];
const toFn = (code) => code.replace(/^import\s*\{([^}]*)\}\s*from\s*'([^']+)';?\s*$/mg, (m, a, sp) => `const {${a}} = __NS['${sp}'];`).replace(/^export\s*\{[^}]*\};?\s*$/mg, '').replace(/\bexport\s+(?=(?:async\s+)?(?:function|const|let|class))/g, '') + '\nreturn {' + R_NAMES.join(',') + '};';
async function loadMutant(code, id) { return vm.compileFunction(toFn(code), ['__NS'], { filename: id })(NSX); }
const opEngine = async (k) => { globalThis.__RMOD = await loadMutant(RSRC.split(`'${k}'`).join(`'${k}__x'`), 'rules__m' + (++EN)); return () => { globalThis.__RMOD = null; }; };
const opCall = (f) => { globalThis.__MUTF = f; return () => { globalThis.__MUTF = null; }; };
const opDice = () => { globalThis.__DINV = true; return () => { globalThis.__DINV = false; }; };
// ---- operador C (v843): mutación del código ejecutado, sustituida en el sitio ----
// engine.mjs convierte las declaraciones de nivel superior de rules.js/data.js/geom.js en `let` y añade un eval directo (__ev) a cada módulo: una función mutada se instala con `NOMBRE = function …` dentro del módulo
// (los enlaces vivos de ESM hacen que el resto de módulos la vean) y se restaura al terminar. Sin recargar módulos: cada mutante cuesta milisegundos y no deja memoria.
import inspector from 'node:inspector';
const CF = {}; // por archivo: fuente, módulo, sitios mutables y declaraciones de funciones de nivel superior
for (const f of ['rules.js', 'data.js', 'geom.js']) {
  const file = path.join(HERE, '.eng', f), src = fs.readFileSync(file, 'utf8'), url = pathToFileURL(file).href;
  CF[f] = { f, src, url, mod: await import(url), sites: [], decls: [] };
}
const PUNCT = ['>>>=', '===', '!==', '>>>', '<<=', '>>=', '**=', '...', '=>', '>=', '<=', '==', '!=', '&&', '||', '??', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '>>', '<<', '**', '?.'];
function scanSites(src) { // posiciones mutables fuera de cadenas, comentarios, plantillas y expresiones regulares
  const out = []; const n = src.length; let i = 0, prev = ''; const tpl = []; const tk = []; // tk: fichas {a,b,t} para hallar el comienzo de la condición de un ternario
  const isId = (c) => /[A-Za-z0-9_$]/.test(c);
  let brace = 0;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2); i = i < 0 ? n : i + 2; continue; }
    if (c === '"' || c === "'") { tk.push({ a: i, t: 's' }); i++; while (i < n && src[i] !== c) { if (src[i] === '\\') i++; i++; } i++; prev = 'str'; continue; }
    if (c === '`') { i++; while (i < n && src[i] !== '`') { if (src[i] === '\\') i += 2; else if (src[i] === '$' && src[i + 1] === '{') { tpl.push(brace); brace++; i += 2; break; } else i++; } if (src[i] === '`') { i++; prev = 'str'; } continue; }
    if (c === '{') { brace++; i++; prev = '{'; continue; }
    if (c === '}') { brace--; i++; if (tpl.length && tpl[tpl.length - 1] === brace) { tpl.pop(); while (i < n && src[i] !== '`') { if (src[i] === '\\') i += 2; else if (src[i] === '$' && src[i + 1] === '{') { tpl.push(brace); brace++; i += 2; break; } else i++; } if (src[i] === '`') { i++; prev = 'str'; } } else prev = '}'; continue; }
    if (c === '/') {
      if (/^(=|\(|,|:|\[|!|&|\||\?|\{|\}|;|return|typeof|\+|-|\*|%|<|>|~|\^|)$/.test(prev) && prev !== 'id' && prev !== 'num' && prev !== ')' && prev !== ']') { i++; let cls = false; while (i < n && (src[i] !== '/' || cls) && src[i] !== '\n') { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; } i++; while (i < n && isId(src[i])) i++; prev = 'str'; continue; }
      i++; prev = '/'; continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    if (isId(c)) { tk.push({ a: i, t: 'w', w: (() => { let j2 = i; while (j2 < n && isId(src[j2])) j2++; return src.slice(i, j2); })() }); let j = i; while (j < n && isId(src[j])) j++; const w = src.slice(i, j); const before = src[i - 1];
      if (/^\d+$/.test(w) && before !== '.' && src[j] !== '.' && !(src[j] === 'e') && w.length <= 3) out.push({ at: i, len: w.length, k: 'num', to: String(+w + 1) });
      else if (w === 'if' && before !== '.') { // if (c) → if (!(c))
        let q = j; while (q < n && /\s/.test(src[q])) q++;
        if (src[q] === '(') { let dp = 0, z = q, qt = null; for (; z < n; z++) { const ch = src[z]; if (qt) { if (ch === '\\') z++; else if (ch === qt) qt = null; continue; } if (ch === '"' || ch === "'" || ch === '`') qt = ch; else if (ch === '(') dp++; else if (ch === ')') { dp--; if (dp === 0) break; } }
          if (z < n) out.push({ at: q + 1, len: 0, k: 'if', to: '!(', ed: [[q + 1, 0, '!('], [z, 0, ')']] }); }
      }
      else if (w === 'min' && src.slice(i - 5, i) === 'Math.') out.push({ at: i, len: 3, k: 'min', to: 'max' });
      else if (w === 'max' && src.slice(i - 5, i) === 'Math.') out.push({ at: i, len: 3, k: 'max', to: 'min' });
      else if ((w === 'true' || w === 'false') && before !== '.') out.push({ at: i, len: w.length, k: 'bool', to: w === 'true' ? 'false' : 'true' });
      prev = /^\d/.test(w) ? 'num' : /^(return|typeof|in|of|case|else|do|void|delete|throw|yield|await|new)$/.test(w) ? w : 'id'; i = j; continue; }
    let op = PUNCT.find((q) => src.startsWith(q, i)) || c;
    tk.push({ a: i, t: op });
    if (op === '?' && src[i + 1] !== '.' ) { // ternario: se niega la condición
      let dep = 0, k = tk.length - 2, st = -1;
      for (; k >= 0; k--) { const q = tk[k]; if (q.t === ')' || q.t === ']' || q.t === '}') dep++; else if (q.t === '(' || q.t === '[' || q.t === '{') { if (dep === 0) { st = k + 1; break; } dep--; } else if (dep === 0 && (q.t === '=' || q.t === ',' || q.t === ';' || q.t === ':' || q.t === '=>' || (q.t === 'w' && q.w === 'return') || /^(\+=|-=|\*=|\/=|\|\|=|&&=|\?\?=)$/.test(q.t))) { st = k + 1; break; } }
      if (st >= 0 && st < tk.length - 1) out.push({ at: tk[st].a, len: 0, k: '?:', to: '!(', ed: [[tk[st].a, 0, '!('], [i, 0, ')']] });
    }
    if (op === 'Math' ) {}
    const bin = prev === 'id' || prev === 'num' || prev === ')' || prev === ']' || prev === 'str';
    const MAP2 = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '*': '/', '/': '*', '===': '<' };
    if (op in MAP2 && bin && !(op === '/' && prev === 'str')) out.push({ at: i, len: op.length, k: op, to: MAP2[op] });
    const MAP = { '>=': '>', '>': '>=', '<=': '<', '<': '<=', '===': '!==', '!==': '===', '&&': '||', '||': '&&', '+': '-', '-': '+' };
    if (op in MAP && (bin || !'+-'.includes(op))) { if (!(op === '<' || op === '>') || bin) out.push({ at: i, len: op.length, k: op, to: MAP[op] }); }
    if (op === '!' && src[i + 1] !== '=') out.push({ at: i, len: 1, k: '!', to: '' });
    i += op.length; prev = op;
  }
  return out;
}
function scanDecls(src) { // declaraciones de nivel superior que son funciones (empiezan en la columna 0)
  const lines = src.split('\n'), starts = []; let off = 0;
  for (let k = 0; k < lines.length; k++) { const ln = lines[k]; if (/^[A-Za-z_$]|^\/\//.test(ln)) starts.push({ off, ln }); off += ln.length + 1; }
  const decls = [];
  for (let k = 0; k < starts.length; k++) {
    const { off: o, ln } = starts[k], end = k + 1 < starts.length ? starts[k + 1].off : src.length;
    let m = /^(?:export )?(async )?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/.exec(ln);
    if (m) { decls.push({ name: m[2], start: o, end, kind: 'fn', head: ln.slice(0, m[0].length) }); continue; }
    m = /^(?:export )?let\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.exec(ln) || /^(?:export )?let\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b/.exec(ln);
    if (m) decls.push({ name: m[1], start: o, end, kind: 'let' });
  }
  return decls;
}
for (const c of Object.values(CF)) { c.sites = scanSites(c.src); c.decls = scanDecls(c.src); }
// texto que se evalúa para instalar una declaración (con una mutación opcional ya aplicada al texto)
// guarda contra bucles infinitos de un mutante: while(c) → while(__lg(), c); for(a;b;c) → for(a;__lg(), b;c). __lg lanza al superar el presupuesto de iteraciones.
globalThis.__lgN = 0; globalThis.__lg = () => { if (++globalThis.__lgN > 3e6) throw new Error('mutante: bucle sin fin'); };
function guardLoops(t) {
  t = t.replace(/\bwhile\s*\(/g, 'while (__lg(), ');
  let out = '', i = 0; const re = /\bfor\s*\(/g; let m;
  while ((m = re.exec(t))) {
    let dpth = 1, j = m.index + m[0].length, parts = [j], q = null;
    for (; j < t.length && dpth > 0; j++) { const ch = t[j]; if (q) { if (ch === '\\') j++; else if (ch === q) q = null; continue; } if (ch === '"' || ch === "'" || ch === '`') q = ch; else if ('([{'.includes(ch)) dpth++; else if (')]}'.includes(ch)) dpth--; else if (ch === ';' && dpth === 1) parts.push(j); }
    if (parts.length === 3) { const a = parts[1] + 1, b = parts[2]; out += t.slice(i, a) + ' __lg(), (' + (t.slice(a, b).trim() || 'true') + ')'; i = b; }
  }
  return out + t.slice(i);
}
function evalText(d, text, guard) {
  if (guard) text = guardLoops(text);
  const t = text.replace(/^export /, '');
  if (d.kind === 'fn') return `${d.name} = ${t}`;
  return t.replace(/^let\s+/, '').replace(/^([A-Za-z_$][\w$]*)\s*=\s*/, `${d.name} = `).replace(/;\s*(\/\/[^\n]*)?\s*$/, ';');
}
const declAt = (c, at) => { let lo = 0, hi = c.decls.length - 1, r = -1; while (lo <= hi) { const mid = (lo + hi) >> 1; if (c.decls[mid].start <= at) { r = mid; lo = mid + 1; } else hi = mid - 1; } return r >= 0 && at < c.decls[r].end ? c.decls[r] : null; };
async function coverOf(fn) { // cobertura V8 por archivo: Uint8Array con 1 en cada carácter ejecutado
  const sess = new inspector.Session(); sess.connect();
  const post = (m, q) => new Promise((res, rej) => sess.post(m, q, (e, r) => (e ? rej(e) : res(r))));
  await post('Profiler.enable'); await post('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
  let r; try { await fn(); } catch (e) { /* la prueba puede fallar bajo cobertura: no importa */ } finally { r = await post('Profiler.takePreciseCoverage'); await post('Profiler.stopPreciseCoverage'); sess.disconnect(); }
  const out = {};
  for (const c of Object.values(CF)) {
    const cnt = new Uint8Array(c.src.length + 1); out[c.f] = cnt; const sc = r.result.find((x) => x.url === c.url); if (!sc) continue;
    const rg = []; for (const f of sc.functions) for (const q of f.ranges) rg.push(q);
    rg.sort((a, b) => a.startOffset - b.startOffset || b.endOffset - a.endOffset);
    for (const q of rg) cnt.fill(q.count > 0 ? 1 : 0, q.startOffset, Math.min(q.endOffset, cnt.length));
  }
  return out;
}
let SETUP_COV = null;
async function setupCov() { if (SETUP_COV) return SETUP_COV; SETUP_COV = await coverOf(async () => { L.resetDice(); L.game([L.E('state_troops', 5)], [L.E('orc_boyz', 5)]); L.resetDice(); }); return SETUP_COV; }
const MUT_C = +process.env.MUT_C || 1200;
async function opCode(t, runOnce2) { // devuelve la descripción del mutante que mata la prueba o null
  const base = await coverOf(async () => { L.resetDice(); globalThis.__STATES = []; L.AC.n = 0; try { await t.fn(L); } finally { L.resetDice(); } });
  const su = await setupCov();
  const excl = [], shared = []; for (const c of Object.values(CF)) for (const x of c.sites) if (base[c.f][x.at]) { const d = declAt(c, x.at); if (d) (su[c.f][x.at] ? shared : excl).push({ c, x, d }); } // primero el código que solo ejecuta esta prueba; luego el que también ejecuta el montaje básico
  let sd = 1234567 + t.id.length * 977; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let z = Math.imul(sd ^ (sd >>> 15), 1 | sd); z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z; return ((z ^ (z >>> 14)) >>> 0) / 4294967296; };
  const shuf = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }; const cand = [...shuf(excl), ...shuf(shared)];
  let tried = 0; if (process.env.MUT_DBG) console.error("C cand", t.id, cand.length);
  for (const { c, x, d } of cand) {
    if (tried >= MUT_C) break;
    const orig = c.src.slice(d.start, d.end), text = x.ed ? [...x.ed].sort((p, q) => q[0] - p[0]).reduce((tx, [at, ln, to]) => tx.slice(0, at - d.start) + to + tx.slice(at - d.start + ln), orig) : orig.slice(0, x.at - d.start) + x.to + orig.slice(x.at - d.start + x.len);
    try { c.mod.__ev(evalText(d, text, true)); } catch (e) { if (process.env.MUT_DBG) console.error('evalfail', d.name, String(e.message).slice(0,80)); continue; } // mutante que no compila: se descarta
    tried++; clearCaches(); globalThis.__lgN = 0; let r;
    try { r = await runOnce2(t); } finally { c.mod.__ev(evalText(d, orig)); clearCaches(); }
    if (process.env.MUT_DBG) console.error('r', d.name, x.k, JSON.stringify(r).slice(0,100));
    if (!r.ok && r.fail) { const ln = c.src.slice(0, x.at).split('\n').length; return `C:${c.f}:${ln} (${d.name}) «${x.k}»→«${x.to}»`; }
  }
  return null;
}
// ---- registro de los datos que lee cada prueba (UNITS/ITEMS/SPELLS: getters temporales) ----
const TRACK = [['U', UNITS], ['I', ITEMS], ['S', SPELLS]];
function track(on, rec) {
  for (const [tag, O] of TRACK) for (const k of Object.keys(O)) {
    if (on) { let v = O[k]; Object.defineProperty(O, k, { configurable: true, enumerable: true, get() { if (!globalThis.__MQUIET) rec[tag].add(k); return v; }, set(x) { v = x; } }); }
    else { const d = Object.getOwnPropertyDescriptor(O, k); if (d && d.get) { globalThis.__MQUIET = true; const v = d.get.call(O); globalThis.__MQUIET = false; delete O[k]; O[k] = v; } }
  }
}
// ---- ejecución de una prueba ----
async function runOnce(t) {
  L.resetDice(); globalThis.__STATES = []; L.AC.n = 0;
  try { await t.fn(L); if (L.AC.n === 0) return { ok: false, err: 'vacía', fail: true }; return { ok: true }; }
  catch (e) { return { ok: false, fail: e instanceof L.Fail && !/^engage:/.test(e.message || ''), err: e.message }; }
  finally { L.resetDice(); }
}
const tokOf = (t) => new Set([...(String(t.fn).match(/['"`]([A-Za-z_][\w:]*)['"`]/g) || []).map((x) => x.slice(1, -1)), ...t.id.split(/[^A-Za-z0-9_]+/), ...(String(t.fn).match(/\b[a-z][A-Za-z0-9]*_[A-Za-z0-9_]+\b/g) || [])]);
const sample = L.TESTS.filter((t) => !filt || filt.split(',').some((f) => process.env.MUT_EXACT ? t.id === f : t.id.includes(f)));
const DECL = JSON.parse(fs.readFileSync(path.join(HERE, 'declarative.json'), 'utf8')); // v843l: pruebas declarativas (datos/texto, sin código del motor que mutar) con su motivo: se listan aparte, no cuentan como supervivientes
const stat = { total: 0, applicable: 0, killed: 0, survived: [], noOp: [], byOp: {}, base: 0, decl: [] };
const t0 = Date.now();
// muestra determinista: se recorre toda la lista y se prueban las que tienen algún operador aplicable, hasta N_MAX
for (const t of sample) {
  integrity(t.id);
  if (stat.applicable >= N_MAX) break;
  if (/^(v835-)?(lint|meta)/.test(t.id)) continue;
  globalThis.__hc = {}; const rec = { U: new Set(), I: new Set(), S: new Set() }; track(true, rec); let b; try { b = await runOnce(t); } finally { track(false, rec); } if (!b.ok) continue; stat.base++; // las que ya fallan no se miden
  const hc = Object.keys(globalThis.__hc || {}); globalThis.__hc = null;
  const toks = tokOf(t), states = globalThis.__STATES || [];
  const inUse = { items: new Set(), spells: new Set(), types: new Set() };
  for (const s of states) for (const u of [...s.units, ...s.units.flatMap((h) => h.joined || []), ...(s.reserves || [])]) { inUse.types.add(u.type); for (const i of u.items || []) inUse.items.add(i); if (u.banner) inUse.items.add(u.banner); for (const sp of u.spells || []) inUse.spells.add(sp); }
  const dyn = (tag, n) => [...rec[tag]].slice(0, n);
  const rules = [...new Set([...hc, ...[...toks].filter((x) => RULES[x])])].slice(0, 14);
  const items = [...new Set([...[...toks].filter((x) => ITEMS[x]), ...inUse.items])].filter((x) => ITEMS[x]).concat(rec.I.size <= 14 ? dyn('I', 14) : []).filter((x, i, a) => a.indexOf(x) === i).slice(0, 12);
  const spells = [...new Set([...[...toks].filter((x) => SPELLS[x]), ...inUse.spells])].filter((x) => SPELLS[x]).concat(rec.S.size <= 10 ? dyn('S', 10) : []).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8);
  const units = [...new Set([...[...toks].filter((x) => UNITS[x]), ...inUse.types])].filter((x) => UNITS[x]?.sr?.length).slice(0, 8);
  const profs = [...new Set([...[...toks].filter((x) => UNITS[x]), ...inUse.types, ...dyn('U', 40)])].filter((x) => UNITS[x]).slice(0, 40);
  const callsR = [...new Set([...String(t.fn).matchAll(/\bR\.([A-Za-z_$][\w$]*)\(/g)].map((m) => m[1]))].filter((n) => typeof R[n] === 'function' && !/^(__|syncJoined$|createGame$)/.test(n)).slice(0, 10);
  const callsX = ['GEOM', 'DATA'].flatMap((ns) => [...new Set([...String(t.fn).matchAll(new RegExp('\\b' + ns + '\\.([A-Za-z_$][\\w$]*)\\(', 'g'))].map((m) => m[1]))].filter((n) => typeof L[ns][n] === 'function').map((n) => ns + '.' + n)).slice(0, 6);
  const calls = [...callsR, ...callsX];
  const ops = [...rules.map((r) => ['R', r, () => opRule(r)]), ...items.map((k) => ['I', k, () => opItem(k)]), ...spells.map((k) => ['S', k, () => opSpell(k)]), ...units.map((k) => ['U', k, () => opUnit(k)]), ...rules.filter((r) => RULES[r]).map((r) => ['A', r, () => opAdd(r, profs)]), ...profs.map((k) => ['P', k, () => opProf(k)]), ...items.flatMap((k) => [['I2', k, () => opItemV(k)], ['G', k, () => opItemGone(k)]]), ...spells.map((k) => ['S2', k, () => opSpellV(k)]), ...calls.map((f) => ['F', f, () => opCall(f)]), ['D', 'dados', opDice], ...['UNITS', 'ITEMS', 'SPELLS'].filter((tb) => new RegExp('Object\\.(values|keys|entries)\\(' + tb + '\\)').test(String(t.fn))).map((tb) => ['PA', tb, () => { const us = Object.values({ UNITS, ITEMS, SPELLS }[tb]).map(perturbObj); clearCaches(); return () => { for (const u of us.reverse()) u(); clearCaches(); }; }]), ...[...new Set([...rules, ...items, ...spells, ...units, ...profs])].filter((k) => RLIT.has(k)).slice(0, 14).map((k) => ['E', k, () => opEngine(k)])];
  if (process.env.MDBG) console.log('MDBG', t.id, 'rec', rec.U.size, rec.I.size, rec.S.size, 'ops', ops.map((o) => o[0] + ':' + o[1]).join(' '));
  stat.total++;
  let killedBy = null;
  for (const [kind, name, mk] of ops) {
    const undo = await mk(); let r; try { r = await runOnce(t); } finally { undo(); }
    if (process.env.MDBG) console.log('  op', kind, name, r.ok ? 'pasa' : (r.fail ? 'FALLA ' : 'ERR ') + (r.err || '').slice(0, 100));
    if (!r.ok && r.fail) { killedBy = kind + ':' + name; break; }
  }
  if (!killedBy && process.env.MUT_NOC !== '1') { const k = await opCode(t, runOnce); if (k) { killedBy = k; (stat.byC ||= []).push(t.id + '  ' + k); } }
  if (ops.length === 1 && !(rules.length || items.length || spells.length || units.length)) { stat.noOp.push(t.id); }
  stat.applicable++; if (process.env.MEMDBG) console.log('MEM', t.id, Math.round(process.memoryUsage().heapUsed / 1e6), Math.round(process.memoryUsage().rss / 1e6));
  if (killedBy) { stat.killed++; const k = killedBy.split(':')[0]; stat.byOp[k] = (stat.byOp[k] || 0) + 1; }
  else if (DECL[t.id]) stat.decl.push({ id: t.id, why: DECL[t.id] });
  else stat.survived.push({ id: t.id, ops: ops.map((o) => o[0] + ':' + o[1]).join(' ') });
}
const rate = stat.applicable ? (100 * stat.killed / stat.applicable).toFixed(1) : '0';
console.log(`\nMutación: ${stat.applicable} pruebas mutadas (de ${sample.length}; ${stat.base} pasan sin mutar) · muertas ${stat.killed} · sobreviven ${stat.survived.length} · tasa de muerte ${rate} % · ${Math.round((Date.now() - t0) / 1000)} s`);
if (stat.byC) console.log('Muertas por el operador C (' + stat.byC.length + '):\n  ' + stat.byC.join('\n  '));
console.log('Restauraciones de datos (una prueba bajo mutante dejó tablas alteradas):', CORR);
console.log('Muertas por operador:', JSON.stringify(stat.byOp), '· solo con el operador de dados (sin regla/objeto/hechizo/unidad relacionados):', stat.noOp.length);
for (const s of stat.survived) console.log(`SOBREVIVE ${s.id}  [${s.ops}]`);
for (const s of stat.decl) console.log(`DECLARATIVA ${s.id}: ${s.why}`);
fs.writeFileSync(path.join(HERE, 'out', 'mutation.json'), JSON.stringify({ when: new Date().toISOString(), mutated: stat.applicable, killed: stat.killed, survived: stat.survived, declarative: stat.decl, rate: +rate, byOp: stat.byOp, onlyDice: stat.noOp.length }, null, 1));
process.exitCode = stat.survived.length ? 1 : 0;
