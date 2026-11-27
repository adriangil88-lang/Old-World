// v834 — Carga del motor REAL para las pruebas de comportamiento.
// Copia app/js/*.js (sin cambios de lógica) a behavior/.eng/ y, solo en la copia de rules.js:
//  1) exporta también las funciones internas (fightGroup, woundAndSave, castCheck…) para montar situaciones mínimas;
//  2) engancha d6/d3 a una cola de dados fijados (globalThis.__DQ): si hay valores en la cola se usan en orden, si no, el RNG con semilla.
// Así cada prueba ejecuta exactamente el código de app/js con dados controlados.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../../../app/js');
const ENG = path.join(HERE, '.eng');
fs.mkdirSync(ENG, { recursive: true });
for (const f of fs.readdirSync(APP)) if (f.endsWith('.js') && !f.startsWith('_tmp')) {
  let src = fs.readFileSync(path.join(APP, f), 'utf8');
  if (f === 'rules.js') {
    const d6 = 'const d6 = (s) => 1 + Math.floor(rnd(s) * 6);', d3 = 'const d3 = (s) => 1 + Math.floor(rnd(s) * 3);';
    if (!src.includes(d6) || !src.includes(d3)) throw new Error('engine.mjs: no se encuentran d6/d3 en rules.js');
    src = src.replace(d6, 'const d6 = (s) => { const q = globalThis.__DQ; const v = q && q.length ? q.shift() : globalThis.__DF ? globalThis.__DF(6) : 1 + Math.floor(rnd(s) * 6); (globalThis.__DLOG ||= []).push(["d6", v]); return v; };')
      .replace(d3, 'const d3 = (s) => { const q = globalThis.__DQ; const v = q && q.length ? q.shift() : globalThis.__DF ? Math.min(3, globalThis.__DF(3)) : 1 + Math.floor(rnd(s) * 3); (globalThis.__DLOG ||= []).push(["d3", v]); return v; };');
    // v842 (modo --mutation): inversión de dados (7−d6, 4−d3) y neutralización de una regla en has()
    src = src.replace('(globalThis.__DLOG ||= []).push(["d6", v]); return v; };', 'const w = globalThis.__DINV ? 7 - v : v; (globalThis.__DLOG ||= []).push(["d6", w]); return w; };').replace('(globalThis.__DLOG ||= []).push(["d3", v]); return v; };', 'const w = globalThis.__DINV ? 4 - v : v; (globalThis.__DLOG ||= []).push(["d3", w]); return w; };');
    if (!src.includes('const has = (u, r) => { let v = has_(u, r);')) throw new Error('engine.mjs: no se encuentra has() en rules.js');
    src = src.replace('const has = (u, r) => { let v = has_(u, r);', 'const has = (u, r) => { let v = has_(u, r); if (globalThis.__MUTR === r) return false;');
    src = src.replace('export function woundAndSave(s, def, hits, S, ap, o = {}) {', 'export function woundAndSave(s, def, hits, S, ap, o = {}) { (globalThis.__WSL ||= []).push({ def, hits, S, ap, o });');
    const exported = new Set([...src.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]));
    for (const m of src.matchAll(/^export\s*\{([^}]*)\}/gm)) for (const n of m[1].split(',')) { const k = n.trim().split(/\s+as\s+/).pop(); if (k) exported.add(k); }
    const names = [...new Set([...src.matchAll(/^(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]))].filter((n) => !exported.has(n));
    // const con desestructuración o varias declaraciones en una línea: solo el primer nombre (suficiente)
    src += `\nexport { ${names.join(', ')} };\nexport const __setCUR = (s) => { CUR = s; CUR_EV = null; };\n`;
  }
  // v843 (modo --mutation, operador C): las declaraciones de nivel superior pasan de const a let y cada módulo exporta un eval directo (__ev) para sustituir una función por su versión mutada y restaurarla después (sin recargar el módulo)
  if (['rules.js', 'data.js', 'geom.js'].includes(f)) src = src.replace(/^(export )?const /gm, '$1let ') + '\nexport const __ev = (s) => eval(s);\n';
  fs.writeFileSync(path.join(ENG, f), src);
}
fs.copyFileSync(path.resolve(APP, '../weights.json'), path.join(ENG, 'weights.json'));
const RNS = await import(pathToFileURL(path.join(ENG, 'rules.js')).href);
// v842: en el modo --mutation, R.<fn> se puede sustituir por una versión que rompe lo que la función devuelve o deja en el estado (globalThis.__MUTF = nombre de la función)
const perturbState = (s) => { for (const u of [...(s.units || []), ...(s.units || []).flatMap((h) => h.joined || [])]) { u.models = (u.models || 0) + 1; u.fleeing = !u.fleeing; u.charged = !u.charged; u.x = (u.x || 0) + 0.37; if (Array.isArray(u.fx)) u.fx = [...u.fx, { k: 'mut', t: 1 }]; } for (const k of ['vp', 'objVP']) if (Array.isArray(s[k])) s[k] = s[k].map((v) => v + 1); };
const perturb = (r) => (typeof r === 'boolean' ? !r : typeof r === 'number' ? r + 1 : typeof r === 'string' ? r + '#' : Array.isArray(r) ? (r.length ? r.slice(1).concat([null]) : [null]) : r && typeof r === 'object' ? (Array.isArray(r.events) ? { ...r, ok: !r.ok, events: [] } : Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' ? v + 1 : typeof v === 'boolean' ? !v : v]))) : r);
export const R = new Proxy(RNS, { get(t0, k) { const t = globalThis.__RMOD || t0, f = t[k]; if (typeof f !== 'function' || globalThis.__MUTF !== k) return f; return function (...a) { const r = f.apply(this, a); for (const x of a) { if (x && typeof x === 'object' && Array.isArray(x.units)) perturbState(x); else if (Array.isArray(x) && x.every((e) => e && typeof e === 'object' && 'msg' in e)) x.length = 0; } return perturb(r); }; } });
const mkFnProxy = (ns, tag) => new Proxy(ns, { get(t, k) { const f = t[k]; if (typeof f !== 'function' || globalThis.__MUTF !== tag + '.' + String(k)) return f; return function (...a) { const r = f.apply(this, a); for (const x of a) if (Array.isArray(x) && x.length && x.every((e) => e && typeof e === 'object' && 'msg' in e)) x.length = 0; return perturb(r); }; } });
export const DATA = mkFnProxy(await import(pathToFileURL(path.join(ENG, 'data.js')).href), 'DATA');
export const GEOM = mkFnProxy(await import(pathToFileURL(path.join(ENG, 'geom.js')).href), 'GEOM');
export const AI = await import(pathToFileURL(path.join(ENG, 'ai.js')).href);
