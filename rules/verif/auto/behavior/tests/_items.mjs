// utilidades para las pruebas de objetos (no es una prueba; run.mjs solo carga tests/NN_*.mjs)
import { R, DATA, game, U, cur, put, engage, charged, F, FOE } from '../lib3.mjs';
import fs from 'fs';
const { ITEMS, UNITS } = DATA;
const unc = JSON.parse(fs.readFileSync(new URL('../unc_items.json', import.meta.url), 'utf8'));
export const UNC = (cat) => unc.filter((k) => ITEMS[k] && (!cat || ITEMS[k].cat === cat));
const chars = (fac) => Object.values(UNITS).filter((u) => u.cat === 'char' && u.faction === fac);
export function carrierOf(it) {
  if (it.onlyT) return it.onlyT[0];
  const fac = it.fac || 'empire'; let c = chars(fac).filter((u) => !/_(chariot|dragon|wyvern|manticore|steed|pegasus|griffon|h)$|_(chariot|dragon|wyvern|manticore|steed|pegasus|griffon)|miaoying/.test(u.id));
  const mounted = c.filter((u) => u.mount || u.tt !== 'char'), foot = c.filter((u) => !u.mount && u.tt === 'char');
  const pool = (it.mountOnly || it.needMount || it.cavOnly || it.cavMonCh) ? (mounted.length ? mounted : c) : (foot.length ? foot : c);
  const nw = pool.filter((u) => !u.wizard); return (it.wiz ? pool.filter((u) => u.wizard) : nw)[0]?.id || pool[0]?.id || 'emp_engineer';
}
// v843: portador sin armadura propia (copia del perfil con armadura 'none'): la prueba de una armadura mágica no es vacua cuando el portador ya llevaba una igual o mejor
export function nakedType(type) { const id = type + '__nk'; if (!UNITS[id]) UNITS[id] = { ...UNITS[type], id, sr: [...UNITS[type].sr], arm: 'none', Sv: 7, avOpt: {} }; return id; }
export function wearItem(key, o = {}) {
  const it = key ? ITEMS[key] : ITEMS[o.like.key]; const type = o.like ? o.like.type : o.naked ? nakedType(carrierOf(it)) : carrierOf(it); const fac = UNITS[type].faction;
  const s = game([{ type, models: 1, items: key ? [key] : [] }], [{ type: o.foe || 'state_troops', models: 20 }], { f: [fac === 'merc' ? 'empire' : fac, fac === 'empire' ? 'orcs' : 'empire'] });
  const u = U(s, type, 0), e = U(s, o.foe || 'state_troops', 1); engage(s, u, e); cur(s); if (o.charge) { u.chargeOK = true; u.chargeTarget = e.id; u.chargeSide = 'front'; }
  const P = R.attackProfile(u, e); return { s, u, e, P, type, key };
}
// portador de cualquier categoría de objeto: estandarte (s) en una unidad de infantería; el resto en un personaje
export function wearAny(key, o = {}) {
  const it = ITEMS[key || o.likeKey], std = it.cat === 's';
  const type = std ? (o.stdType || 'dw_warriors') : (o.type || carrierOf(it)); const fac = UNITS[type].faction;
  const s = game([std ? { type, models: 20, std: true } : { type, models: 1, items: key ? [key] : [] }], [{ type: 'state_troops', models: 20 }], { f: [fac === 'merc' ? 'empire' : fac, fac === 'empire' ? 'orcs' : 'empire'] });
  const u = U(s, type, 0), e = U(s, 'state_troops', 1); if (std && key) u.banner = key; engage(s, u, e); cur(s); return { s, u, e, type };
}
