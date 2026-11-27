// Auditoría numérica de escala/colocación de figuras (replica la política de render.js). Uso: node audit.mjs > out.json
import fs from 'fs';
const A = '/home/claude/tow/app';
const { UNITS, ARMIES, FIG_ALIAS } = await import(A + '/js/data.js');
const { XMODELS } = await import(A + '/js/hdmap.js');
const { MODELS } = await import(A + '/js/models.js');
const R = fs.readFileSync(A + '/js/render.js', 'utf8');
const REALM = new Function('return ' + R.match(/const REALM = (\{.*?\});\n/s)[1])();
const YAWFIX = new Function('const Math2 = Math; return ' + (R.match(/export const YAWFIX = (\{.*?\});\n/s) || [0, '{}'])[1])();
const HMAX = new Function('return ' + (R.match(/const HMAX = (\{.*?\});\n/s) || [0, '{}'])[1])();
const FIG_SCALE = new Function('return ' + R.match(/const FIG_SCALE = (\{.*?\});\n/s)[1])();
const xRealmSrc = R.match(/const xRealm = \(id, d\) => \{.*?\n\};\n/s)[0].replace('const xRealm =', 'return');
const xRealm = new Function(xRealmSrc.replace(/^return /, 'return ') )();
const packs = {};
const getPack = (n) => packs[n] || (packs[n] = JSON.parse(fs.readFileSync(`${A}/hd/xp_${n}.json`)));
const b64 = (s, T) => { const b = Buffer.from(s, 'base64'); return new T(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const cache = {};
function stats(md) {
  const mn = md.min, mx = md.max, cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, H = mx[1] - mn[1], ylim = mn[1] + H * 0.6;
  const xs = [], zs = [], ys = [], lx = [], lz = []; let sx = 0, sz = 0, nn = 0, tris = 0; const nnl = () => 0;
  for (const pt of md.parts) {
    const q = typeof pt.p === 'string' ? b64(pt.p, Uint16Array) : pt.p; tris += (typeof pt.i === 'string' ? pt.i.length * 3 / 4 / 6 : (pt.i || []).length / 3);
    for (let i = 0; i < pt.n; i++) { const x = mn[0] + q[i * 3] / 65535 * (mx[0] - mn[0]) - cx, y = mn[1] + q[i * 3 + 1] / 65535 * H, z = mn[2] + q[i * 3 + 2] / 65535 * (mx[2] - mn[2]) - cz; xs.push(x); zs.push(z); ys.push(y - mn[1]); if (y <= ylim) { lx.push(x); lz.push(z); sx += x; sz += z; nn++; } }
  }
  const pc = (a, p) => { a.sort((u, v) => u - v); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
  const bx = lx.length > 20 ? [pc(lx, 0.03), pc(lx, 0.97)] : [mn[0] - cx, mx[0] - cx], bz = lz.length > 20 ? [pc(lz, 0.03), pc(lz, 0.97)] : [mn[2] - cz, mx[2] - cz];
  const H98 = pc(ys.slice(), 0.98), H90 = pc(ys.slice(), 0.90), core = nn > 20 ? Math.max(pc(lx.slice(), 0.97) - pc(lx.slice(), 0.03), pc(lz.slice(), 0.97) - pc(lz.slice(), 0.03)) : 0;
  return { P1: pc(ys.slice(), 0.01), P5: pc(ys.slice(), 0.05), core, H98, H90, H, X: mx[0] - mn[0], Z: mx[2] - mn[2], W: Math.max(mx[0] - mn[0], mz(mx, mn)), off: nn > 20 ? [sx / nn * 0.7, sz / nn * 0.7] : null, mean: nn > 20 ? [sx / nn, sz / nn] : [0, 0], bodyX: bx[1] - bx[0], bodyZ: bz[1] - bz[0], tris };
}
const mz = (mx, mn) => mx[2] - mn[2];
function model(rid) { // rid: 'x_uid' o id de models.js
  if (cache[rid] !== undefined) return cache[rid];
  let md = null;
  if (/^x_/.test(rid)) { const u = rid.slice(2), p = XMODELS[u]; if (p) md = getPack(p).m[u]; } else md = MODELS[rid];
  return (cache[rid] = md ? stats(md) : null);
}
const out = [];
const seen = new Set();
const rmOf = (q) => (REALM[q] ? (XMODELS[q] ? { ...REALM[q], id: 'x_' + q } : XMODELS[REALM[q].id] ? { ...REALM[q], id: 'x_' + REALM[q].id } : REALM[q]) : null);
const lendRM = (ut, d, RM) => {
  const lid = FIG_ALIAS[ut], L = lid && UNITS[lid]; if (!L || !d.baseW || !L.baseW) return RM;
  const ratio = (d.baseW * d.baseD) / (L.baseW * L.baseD);
  const foot = (L.cat === 'char' || L.cat === 'inf') && !L.mount && Math.max(L.baseW, L.baseD) <= 40 && ['char', 'regInf', 'heavyInf'].includes(L.tt);
  return ratio > (d.mount ? 1.3 : 2.2) && foot && d.cat !== 'inf' && (d.mount || d.cat !== 'char') ? null : RM;
};
const doUnit = (k, d, rear) => {
  const ut = k, XID = XMODELS[ut] ? ut : XMODELS[FIG_ALIAS[ut]] ? FIG_ALIAS[ut] : null;
  let via = '', RM = rmOf(ut); if (RM) via = 'REALM';
  if (!RM && XMODELS[ut]) { RM = xRealm(ut, d); via = 'xRealm'; }
  if (!RM) { RM = rmOf(FIG_ALIAS[ut]); if (RM) via = 'REALM(alias)'; }
  if (!RM && XID) { RM = xRealm(XID, d); via = 'xRealm(alias)'; }
  if (!process.env.BASELINE && RM && via.includes('alias')) { const R2 = lendRM(ut, d, RM); if (R2 !== RM) via += R2 ? '>lender' : '>proc'; RM = R2; }
  const rec = { id: k, rear, fac: d.faction, name: d.name, cat: d.cat, tt: d.tt, mount: !!d.mount, bw: d.baseW, bd: d.baseD, via, rid: RM && RM.id, size: RM && RM.size, by: RM && RM.by, yaw: (RM && RM.yaw || 0) + (RM && YAWFIX[RM.id] || 0), fs: FIG_SCALE[k] || 1 };
  if (!RM) { rec.src = 'proc'; return rec; }
  const st = model(RM.id); if (!st) { rec.src = 'missing'; return rec; }
  rec.src = /^x_/.test(RM.id) ? 'x:' + XMODELS[RM.id.slice(2)] : 'old'; rec.tris = st.tris; rec.mH98 = st.H98; rec.p1 = st.P1 / st.H; rec.p5 = st.P5 / st.H; rec.mH90 = st.H90;
  const bw = d.baseW / 25.4, bd = d.baseD / 25.4;
  const rot = Math.abs(Math.sin(rec.yaw)) > 0.7; // yaw ~90°: x<->z
  const X = rot ? st.Z : st.X, Z = rot ? st.X : st.Z, bX = rot ? st.bodyZ : st.bodyX, bZ = rot ? st.bodyX : st.bodyZ;
  const wmax = Math.max(st.X, st.Z);
  const wEff = process.env.BASELINE ? wmax : st.core ? Math.min(wmax, Math.max(st.core * 1.4, 1e-6)) : wmax, hEff = process.env.BASELINE ? st.H : st.H98 ? Math.min(st.H, Math.max(st.H98 * 1.3, 1e-6)) : st.H;
  const kRaw = RM.size / Math.max(RM.by === 'h' ? hEff : wEff, 1e-6) * (FIG_SCALE[k] || 1), kCap = 1.5 * Math.max(bw, bd) / Math.max(wmax, 1e-6);
  let kk = Math.min(kRaw, kCap); const hm = HMAX[k] || HMAX[FIG_ALIAS[k]]; if (!process.env.BASELINE && hm) kk = Math.min(kk, hm / Math.max(hEff, 1e-6));
  rec.fl = !process.env.BASELINE && st.P1 / st.H > 0.045 ? kk * st.P1 * 0.9 : 0; rec.Hb = kk * hEff;
  Object.assign(rec, { mH: st.H, mX: st.X, mZ: st.Z, kk, capped: kk < kRaw - 1e-9, H: kk * st.H, H98: kk * st.H98, Wl: kk * X, Df: kk * Z, bodyW: kk * bX, bodyD: kk * bZ, bwI: bw, bdI: bd, offOK: !!st.off && d.cat !== 'mach' });
  // descentrado residual del cuerpo respecto al centro de la peana (con la corrección 'off' ya aplicada)
  const res = st.off && d.cat !== 'mach' ? [st.mean[0] - st.off[0], st.mean[1] - st.off[1]] : st.mean; rec.resX = kk * (rot ? res[1] : res[0]); rec.resZ = kk * (rot ? res[0] : res[1]);
  return rec;
};
const ids = new Set(); for (const f in ARMIES) for (const k of ARMIES[f]) ids.add(k); for (const k in UNITS) ids.add(k); // v843n: las 840 unidades (incluye variantes que no figuran en ARMIES)
for (const k of ids) { const d = UNITS[k]; if (!d) continue; out.push(doUnit(k, d, false)); if (d.mixRear && UNITS[d.mixRear.type]) out.push(doUnit(d.mixRear.type, UNITS[d.mixRear.type], true)); }
fs.writeFileSync(process.argv[2] || '/tmp/figaudit.json', JSON.stringify(out));
const c = {}; for (const o of out) c[o.src.split(':')[0]] = (c[o.src.split(':')[0]] || 0) + 1; console.log(out.length, c);
