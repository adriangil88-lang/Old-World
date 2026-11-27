// Interfaz y flujo de partida. Modos: contra la IA, dos jugadores (mismo dispositivo) y por turnos con código.
import { rankBonus, maxMoveToward, deployFace, canReslot, phaseInfo, nearWall, frontLayout, usOf, ctlObjects, pnInfo, linkedArmy, setTerrMax, frydGen, FRYD_RE, gsFor, ripPairs, commandRange, duelists, animusSources, gkCanJump, spMaxOf, clampSp, tableFor, setTable, scaledScn, garrisonOpts, SECRETS, SECRET_IDS, aiSecret, reinforcePos, rangedOf, SCENARIOS, SCN_IDS, BM_SCN_IDS, NORMAL_SCN_IDS, GAME_MODES, modeOf, genTerrain, objectiveOwner, createGame, apply, applyVets, vetReport, alive, spellKeys, fxList, RES_NAME, byId, D, previewMove, chargeTargets, legalShootTargets, shootBlocked, spellTargets, castCheck, canAct, canReserve, isColumn, isEngaged, PHASE_NAME, MAX_TURNS, curPts, unitPts, scoreVP, engagedWith, joinCheck, joinedLive, armyPoints, edgeOk, nomCands , anyById, loresForWiz } from './rules.js';
import { XMODELS, HDMESH, SPELLCARDS } from './hdmap.js';
import { TROOP, mixMinOf, champBudgetSpec, champEligible, champIssues, champItemsOf, SCN_REQ, scnIssues, scnFit, setItemCut, itemFacOk, bmFit, optList, normArmy, handN, FIG_PROC, FIG_GENERIC, FIG_BORROW, FIG_ALIAS, catsOf, compOf, MARKS, marksFor, cmdAllowed, WIZ_LORES, LORE_NAME, UNITS, SPELLS, LORES, yyOptions, FACTIONS, ARMIES, PRESETS, EXAMPLES, unitCost, armyIssues, LISTS, listAllows, mercsFor, RULES, ITEMS, ARROWS, hasBow, arrowCost, itemBudget, bannerBudget, itemsCost, spiteBudget } from './data.js';
import { RULE_SRC } from './rulesrc.js';
import { unitTag, assignVariantNames } from './rules.js';
import { unitChip, unitChipURL, labelName } from './render.js';
const unitChipURLimg = (x) => { const u = unitChipURL(G.s, x); return u ? `<img class="uic" alt="" src="${u}">` : ''; };
const UC = (u, peers) => unitChip(G.s, u, { peers }); // v843t: unidad en un selector = misma etiqueta que el mapa (icono, color, nombre, variante, nº de modelos)
import { fxInfo, baseChoices, allyOptions, doublesOptions, allyXo, allyName, autoAlly, ALLY_SCN, ALLY_MAX, ALLY_KIND } from './data.js';
import { unitDist, dims, angDiff, corners, wheelPivot } from './geom.js';
import { nextAction, mkRng, LEVELS, DEFAULT_WEIGHTS, features, learn, outcomeFor, FEATURE_NAMES, setWeightsGetter } from './ai.js';
import { glInit, gl3, prefetchPack, gfxMode, glMat, glSetMat, MAT_NAMES } from './gl3d.js';
import { sndPlay, sndToggle, sndEnabled } from './audio.js';
import { syncTable, TW, TH, view, fit, resize, adaptRes, draw, w2s, s2w, zoomAt, focus, unitAt, shortName, animActive, camZone, camUnit } from './render.js';

const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* */ } },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FNAME = { empire: 'Imperio', orcs: 'Orcos y Goblins', bret: 'Bretonia', wood: 'Elfos Silvanos' };
for (const k of Object.keys(FACTIONS)) if (!FNAME[k]) FNAME[k] = FACTIONS[k].short || FACTIONS[k].name;

let G = null; // partida
const UI = { maxDist: false, /* v843s: «Distancia máxima» siempre opt-in: apagada al elegir Mover/Marchar/Reservas y no persistente */ sel: null, mode: null, ghost: null, ghostOk: false, ghostMsg: '', showRival: true, rival: null, fx: [], targets: null, canActIds: new Set(), hints: true, tab: 'unit', hover: null, focusEv: null, lastSeenTurn: 0 };
const AI = { weights: DEFAULT_WEIGHTS.slice(), base: DEFAULT_WEIGHTS.slice(), games: 0, gens: 0 };
setWeightsGetter(() => AI.weights);
let setup = { lists: store.get('tow_lists', {}) || {}, mode: 'ai', level: 'medium', side: 'empire', opp: 'orcs', limit: 1000, armies: Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null])), join: false, joinCode: '', scn: 'glory', tmode: 'classic', terrain: null, sec: 'none', secret: 'none', gend: 'auto', comp: 'open' };

// ---------- utilidades de partida ----------
// Contingentes aliados (Core p.280): opciones por ejército y límites del escenario (Matorea / Un Arribo Oportuno: dos listas del defensor)
const allyOptsFor = (fac, lst, owner) => { if (setup.doubles) return doublesOptions(fac, lst); /* Dobles (Matched Play Guide): la misma lista o las de la sección «Aliados» (+ FAQ FoF: Coronas Renegadas) */ const S = ALLY_SCN[setup.scn]; if (S && S.owner === owner && !setup.scnFree0) { const o = []; for (const f of Object.keys(FACTIONS)) for (const l of Object.keys(LISTS[f] || { grand: 1 })) o.push({ key: f + ':' + l, label: allyName(f + ':' + l), kind: 'trusted' }); return o; } return allyOptions(fac, lst); };
const allyCtx = (f, owner) => { const k = armyFor(f).find((e) => e.ally && e.models)?.ally; return k ? allyXo(setup.scn, owner, f, (setup.lists || {})[f] || 'grand', k, !!setup.doubles) : null; };
// Rival de la IA con contingente aliado automático (Core p.280): ejército principal del preset más pequeño + contingente rellenado con el preset de la facción aliada
const aiAllyOn = (side) => !scnReq() && !/^bm_/.test(setup.scn) && (!!setup.doubles /* Dobles: las dos listas de cada bando se rellenan de partida (principal ≤ mitad + lista del compañero); se editan después */ || (!!setup.aiAlly && setup.mode === 'ai' && side === setup.opp));
const aiAllyKey = (side) => { const o = allyOptsFor(side, (setup.lists || {})[side] || 'grand', 1); return (o.find((x) => x.kind === 'trusted' && x.fac !== side) || o.find((x) => x.kind === 'trusted') || o[0])?.key || null; };
const AUTO_AL = {};
function withAutoAlly(side, limit, base) {
  if (!aiAllyOn(side)) return base;
  const lst = (setup.lists || {})[side] || 'grand', key = aiAllyKey(side), mainL = [500, 1000, 1500, 2000].filter((p) => p <= limit * (setup.doubles ? 0.5 : 0.75)).pop();
  const ownList = !!setup.doubles && lst !== 'grand'; // v843: en dobles con una lista que no es el Gran Ejército, la fuerza primaria se construye también con las reglas de esa lista (los preajustes son del Gran Ejército)
  if (!key || (!ownList && (!mainL || !PRESETS[side]?.[mainL]))) return base;
  const ck = [side, lst, limit, key, setup.scn].join('|'); if (AUTO_AL[ck]) return AUTO_AL[ck].map((e) => ({ ...e }));
  const main = ownList ? autoAlly(side + ':' + lst, Math.floor(limit * 0.5), true).map((e) => { const r = { ...e }; delete r.ally; return r; }) : PRESETS[side][mainL].map((e) => ({ ...e })); if (!main.length) return base; const mp = armyPoints(main), al = autoAlly(key, Math.min(Math.floor(limit * (setup.doubles ? 0.5 : ALLY_SCN[setup.scn]?.owner === 1 ? 0.3 : 0.25)), limit - mp), !!setup.doubles);
  if (!al.length || armyIssues([...main, ...al], limit, setup.comp, lst, allyXo(setup.scn, 1, side, lst, key, !!setup.doubles)).some((z) => !/^Necesitas|^Mínimo [23]|Unidades básicas|: al menos|requieren|exigen/.test(z.replace(/^Dobles \([^)]*\): /, '')))) return base;
  return (AUTO_AL[ck] = [...main, ...al]).map((e) => ({ ...e }));
}
const armyFor = (side, limit = setup.limit) => setup.armies[side] || withAutoAlly(side, limit, scnArmy(side, limit));
// Escenarios con listas, puntos y composición impuestos por su texto (Infamy / Dawn of the Storm Dragon)
const scnReq = () => (SCN_REQ[setup.scn] && !setup.scnFree ? SCN_REQ[setup.scn] : null);
function scnApply() {
  const R = scnReq();
  if (!R) { if (setup.comp === 'st') setup.comp = 'open'; const FR = SCN_REQ[setup.scn]; if (FR && setup.scnFree) { setup.limit = FR.limit; setup.armies = Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null])); return; } /* «cualquier par de ejércitos»: cada bando escribe una lista de los puntos que fija el escenario (p. ej. 3.000) */ if (!/^bm_/.test(setup.scn) && ![500, 1000, 1500, 2000].includes(setup.limit)) setup.limit = 2000; return; }
  if (!(R.limits || [R.limit]).includes(setup.limit)) setup.limit = R.limit; setup.comp = R.comp || 'open';
  const keep = R.either && R.sides.some((q) => q.fac === setup.side) ? setup.side : null;
  const f0 = keep ?? R.sides[0].fac, f1 = R.either ? R.sides.find((q) => q.fac !== f0).fac : R.sides[1].fac;
  setup.side = f0; setup.opp = f1; setup.lists = { ...(setup.lists || {}) };
  for (const f of [f0, f1]) { const q = R.sides.find((x) => x.fac === f); if (!q.lists.includes(setup.lists[f] || 'grand')) setup.lists[f] = q.lists[0]; }
  setup.armies = Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null]));
}
function scnArmy(side, limit) {
  const R = scnReq(), lst = (setup.lists || {})[side] || 'grand', src = PRESETS[side][limit] || (limit > 2000 ? PRESETS[side][2000] : PRESETS[side][500]);
  if (/^bm_/.test(setup.scn)) return bmFit(src, limit, lst).map((e) => ({ ...e }));
  if (R) { const q = R.sides.find((x) => x.fac === side); let a = src.map((e) => ({ ...e })); if (setup.comp === 'st') a = bmFit(a, limit, lst); return scnFit(a, limit, setup.comp, lst, q?.gen, q?.genOpt); }
  return src.map((e) => ({ ...e }));
}
const viewer = () => {
  if (!G) return 0;
  if (G.mode === 'ai') return 0;
  if (G.mode === 'code') return G.myOwner;
  return G.s.phase === 'deploy' ? G.deployPlayer : G.s.active;
};
const interactive = () => {
  if (!G || G.s.phase === 'over' || G.aiBusy || G.curtain || G.waiting) return false;
  if (G.s.phase === 'deploy') return !G.s.ready[viewer()];
  return G.s.active === viewer();
};
const fname = (o) => FNAME[G.s.factions[o]];

const SPELL_VIS = {
  flaming_sword: { c: '255,140,40', beam: '#ff8a3a', n: 9, big: 1.0 }, ring_fireball: { c: '255,120,40', beam: '#ff7a2a', n: 10, big: 1.3 }, fireball: { c: '255,120,40', beam: '#ff7a2a', n: 10, big: 1.3 },
  storm_call: { c: '110,140,190', beam: '#7fa8e8', n: 10, big: 1.5 }, plague_rust: { c: '190,105,45', beam: '#c4743a', n: 8, big: 1.1 },
  earthen_ramparts: { c: '135,105,65', beam: '#a07840', n: 8, big: 1.2, ring: '#a07840' }, wind_blast: { c: '225,235,245', beam: '#e8f0ff', n: 9, big: 1.0, trail: 1 },
  mystic_path: { c: '110,230,230', beam: '#6ee7e7', n: 8, big: 0.9, trail: 1, ring: '#6ee7e7' }, glittering_robe: { c: '255,170,230', beam: '#ffb0ec', n: 8, big: 0.9, ring: '#ffb0ec' },
  mind_razor: { c: '230,120,255', beam: '#e681ff', n: 7, big: 0.8 }, miasmic_mirage: { c: '150,220,160', beam: '#95e0a2', n: 10, big: 1.5 }, doppelganger: { c: '150,190,255', beam: '#9fc0ff', n: 8, big: 1.0 },
};
function spellFx(e, now) {
  const v = SPELL_VIS[e.spell]; if (!v || !e.to) return false;
  const a = e.from || e.to;
  for (let i = 0; i < v.n; i++) {
    const k = v.trail ? i / (v.n - 1) : 1, x = a.x + (e.to.x - a.x) * k, y = a.y + (e.to.y - a.y) * k, sp = v.trail ? 0.8 : 3;
    UI.fx.push({ pos: { x: x + (Math.random() - 0.5) * sp, y: y + (Math.random() - 0.5) * sp }, puff: v.c, size: v.big, t0: now + 150 + i * 60, ttl: 1300 });
  }
  if (v.ring) UI.fx.push({ at: e.to, color: v.ring, t0: now + 200, ttl: 1500 });
  UI.fx.push({ a, b: e.to, color: v.beam, t0: now, ttl: 1300 });
  return true;
}
function eventFx(e, now) {
  const msg = e.msg || '';
  if (/entra como refuerzo/.test(msg) && e.to) { UI.fx.push({ at: e.to, color: '#ffd76a', t0: now, ttl: 1600 }); for (let i = 0; i < 6; i++) UI.fx.push({ pos: { x: e.to.x + (Math.random() - 0.5) * 6, y: e.to.y + (Math.random() - 0.5) * 3 }, puff: '240,225,170', size: 1.3, t0: now + i * 70, ttl: 1500 }); }
  if (/pisotea/.test(msg) && e.at) for (let i = 0; i < 5; i++) UI.fx.push({ pos: { x: e.at.x + (Math.random() - 0.5) * 3, y: e.at.y + (Math.random() - 0.5) * 3 }, puff: '120,95,60', size: 1.1, t0: now + i * 80, ttl: 1200 });
  if (/Pergamino de Retroalimentaci/.test(msg) || /Transmogrificaci/.test(msg) || /vuelve a su forma normal/.test(msg)) {
    const u = G.s && byId(G.s, e.id); if (u) { const frog = /rana|vuelve/.test(msg); for (let i = 0; i < 8; i++) UI.fx.push({ pos: { x: u.x + (Math.random() - 0.5) * 3, y: u.y + (Math.random() - 0.5) * 3 }, puff: frog ? '110,210,90' : '255,90,70', size: 1.0, t0: now + i * 60, ttl: 1300 }); UI.fx.push({ at: { x: u.x, y: u.y }, color: frog ? '#6fd25a' : '#ff5a46', t0: now, ttl: 1400 }); }
  }
  if (/abre una Senda/.test(msg) && e.to) UI.fx.push({ at: e.to, color: '#6ee7e7', t0: now, ttl: 1500 });
}
// ---------- iconos de interfaz (SVG en línea, heredan el color del texto) ----------
const svg = (d, o = '') => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${o}>${d}</svg>`;
const IC = {
  plus: svg('<path d="M12 5v14M5 12h14"/>'), minus: svg('<path d="M5 12h14"/>'),
  fit: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), rot: svg('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  snd: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'), mute: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
  eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'), next: svg('<path d="M9 6l6 6-6 6"/>'),
  strategy: svg('<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.800-2.2z"/>'), move: svg('<path d="M5 12h13M13 6l6 6-6 6"/>'),
  shoot: svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'), combat: svg('<path d="M5 4l11 11M19 4L8 15M4 17l3 3M20 17l-3 3M6 14l4 4M18 14l-4 4"/>'),
  unit: svg('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.500-7-4.500-7-9V6z"/>'), log: svg('<path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/>'),
  army: svg('<path d="M5 21V4M5 5h12l-2.500 3.500L17 12H5"/>'), rules: svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 19v2H6"/>'), arules: svg('<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6zM9 12l2 2 4-4"/>'),
  play: svg('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
  k_sword: svg('<path d="M4 20L19 5M19 5h-4M19 5v4M6 14l4 4"/>'), k_spear: svg('<path d="M4 20L16 8M20 4l-1.500 5.500L14.500 5.500z" />'), k_axe: svg('<path d="M5 20L16 7"/><path d="M12 6c1-3 5-4 8-2l-3 4c-1.500-1-3-1-5-2z" fill="currentColor"/>'),
  k_bow: svg('<path d="M7 4c6 3 6 13 0 16M7 4v16M4 12h16M16 8l4 4-4 4"/>'), k_cav: svg('<path d="M6 19V11a6 6 0 0 1 12 0v8" stroke-width="3"/>'), k_mach: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.300 6.300l11.400 11.400M17.700 6.300L6.300 17.700"/>'),
  k_mon: svg('<path d="M7 4l2 16M12 4l1 16M17 4l0 16"/>'), k_char: svg('<path d="M12 3l2.700 6 6.300.700-4.700 4.300 1.300 6.200L12 17l-5.600 3.200 1.300-6.200L3 9.700 9.300 9z" fill="currentColor"/>'),
};
const kindOf = (u) => kindOfD(D(u));
const kindOfD = (d) => { return d.cat === 'char' ? 'char' : d.cat === 'mach' ? 'mach' : /^mon|behemoth/i.test(d.tt || '') ? 'mon' : d.cat === 'cav' ? 'cav' : d.ranged ? 'bow' : (d.melee?.thrust || d.spear || d.lance) ? 'spear' : d.melee?.twoHands ? 'axe' : 'sword'; };
const kindBadge = (u, big = false) => `<span class="ubadge${big ? ' big' : ''}" style="--c:${FACTIONS[G.s.factions[u.owner]].color}">${IC['k_' + kindOf(u)]}</span>`;
function toast(msg, cls = '') {
  const t = $('toast'); t.textContent = msg; t.className = cls; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 3600);
}
function splash(title, sub, color, icon) {
  let el = $('splash'); if (!el) { el = document.createElement('div'); el.id = 'splash'; $('stage').appendChild(el); }
  el.innerHTML = `<div class="sp" style="--c:${color}">${icon}<b>${esc(title)}</b><small>${esc(sub)}</small></div>`; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
}
function banner(html) { const b = $('banner'); if (!html) { b.hidden = true; return; } b.innerHTML = html; b.hidden = false; }

// ---------- crear / reanudar ----------
function newGame(opts) {
  const { mode, level, side, limit, seed = (Date.now() % 2147483647) | 0, myOwner = 0, armiesBy } = opts;
  const other = opts.opp || setup.opp;
  const tcfg = opts.tcfg || { tsize: setup.tsize, scn: setup.scn, tmode: setup.tmode, tdd: setup.tdd === 'danger' ? 'danger' : 'diff', terrain: setup.terrain, sec: setup.sec, hap: setup.hap || 'none', raid: !!setup.raid, herdRepl: !!setup.herdRepl, bagc: +setup.bagc || 0, rev: +setup.rev || 0, zsw: +setup.zsw || 0, alt: (mode === 'ai' || mode === 'hot' || mode === 'code') && setup.alt !== false, game: modeOf(setup.scn), lists: [(setup.lists || {})[side] || 'grand', (setup.lists || {})[other] || 'grand'] };
  const factions = [side, other];
  const armies = armiesBy || [armyFor(side, limit), armyFor(other, limit)];
  const pick = opts.tcfg ? tcfg.secretPick : setup.secret;
  if (!tcfg.secret && pick && pick !== 'none' && SECRETS[pick]) {
    const sec2 = [null, null]; sec2[myOwner] = pick; sec2[1 - myOwner] = aiSecret(armies[1 - myOwner], armies[myOwner], seed);
    tcfg.secret = sec2;
  }
  setTerrMax(/^bm_/.test(tcfg.scn || '') ? +setup.terrMax || 12 : 12); setItemCut(/^bm_/.test(tcfg.scn || '') ? +setup.itemCut || 0 : 0);
  // v843l: tiradas de preparación con ventana previa (clima, hito, despliegue…): createGame se repite con la respuesta hasta que no pida más (misma semilla = mismo resultado)
  const ackM = window.__TOW_NOACK ? null : mode === 'ai' ? { 0: true } : mode === 'hot' ? { 0: true, 1: true } : mode === 'code' ? { [myOwner]: true } : null;
  const build = (ans) => {
    let s0; try { s0 = createGame({ seed, armies, factions, limit, ...tcfg, ackMap: ackM, ackAns: ans }); } catch (e) { if (!e.need) throw e; return pickAck(e.need).then(() => build({ ...ans, [e.need.k]: 'ok' })); }
    return Promise.resolve(s0);
  };
  const first = (() => { try { return { s: createGame({ seed, armies, factions, limit, ...tcfg, ackMap: ackM, ackAns: {} }) }; } catch (e) { if (!e.need) throw e; return { e }; } })();
  if (first.e) { const ans = { [first.e.need.k]: 'ok' }; pickAck(first.e.need).then(() => build(ans)).then((s1) => startNew(s1)); return; }
  startNew(first.s);
  function startNew(s) {
  s.manualReloc = mode === 'ai' ? [true, false] : [true, true]; s.aiP = mode === 'ai' ? { 1: true } : {}; syncTable(s);
  G = { s, mode, level, limit, seed, factions, armies, tcfg, myOwner, aiv: 833, actions: [], synced: 0, log: [], cur: [], curOwner: undefined, deployPlayer: 0, aiBusy: false, curtain: false, waiting: false, record: [], recordH: [], lastCode: '', over: false };
  UI.sel = null; UI.mode = null; UI.rival = null; UI.targets = null; UI.ghost = null;
  if (mode === 'ai' && !s.stir && !s.alt) { const a1 = { t: 'ready', player: 1 }; apply(G.s, a1); G.actions.push(a1); } // v830: la misma acción (lleva las decisiones de la IA, a.aip)
  orient(); afterChange();
  if (mode !== 'code' && s.units.flatMap((h) => [h, ...(h.joined || [])]).concat(s.reserves || [], (s.pend || []).flatMap((h) => [h, ...(h.joined || [])])).some((c) => c.owner === 0 && c.staffAlt?.pend)) setTimeout(() => dispatch({ t: 'staffPick', player: 0 }), 0); else setTimeout(() => spellGenFlow(mode === 'code' ? myOwner : 0).catch(() => {}), 0); // v843r: generación de hechizos con tabla previa (el Báculo de Élisse tiene su propio popup) // v829: Báculo de los Elementos: popup al generar los hechizos, antes de desplegar
  if (mode === 'code' && myOwner === 1 && !(s.alt && altWho(s.alt) === 1)) { G.waiting = true; showCodeModal('wait'); } // con despliegue alterno, el jugador 2 puede empezar si le toca
  save();
  }
}
function saveCore() { return { aiv: G.aiv, mode: G.mode, level: G.level, limit: G.limit, seed: G.seed, factions: G.factions, armies: G.armies, tcfg: G.tcfg, myOwner: G.myOwner, actions: G.actions, synced: G.synced, deployPlayer: G.deployPlayer, pend: G.pend || null }; }
function save() {
  if (!G || G.tutorial) return;
  store.set('tow_save', { ...saveCore(), meta: metaNow() });
}
function resume(sv0) {
  const sv = sv0 || store.get('tow_save', null);
  if (!sv) return false;
  try {
    const s = createGame({ seed: sv.seed, armies: sv.armies, factions: sv.factions, limit: sv.limit, ...(sv.tcfg || {}) }); s.manualReloc = sv.mode === 'ai' ? [true, false] : [true, true]; s.aiP = sv.mode === 'ai' ? { 1: true } : {}; if (!sv.aiv) s.legacyAI = true; syncTable(s); // v830: partidas guardadas antes de v830: la IA decide como entonces (para reproducirlas igual)
    G = { s, aiv: sv.aiv, mode: sv.mode, level: sv.level, limit: sv.limit, seed: sv.seed, factions: sv.factions, armies: sv.armies, tcfg: sv.tcfg, myOwner: sv.myOwner, actions: [], synced: sv.synced || 0, pend: sv.pend || null, log: [], cur: [], curOwner: undefined, deployPlayer: sv.deployPlayer || 0, aiBusy: false, curtain: false, waiting: false, record: [], recordH: [], lastCode: '', over: false };
    for (const a of sv.actions) { const r = apply(s, a); if (r.ok) { G.actions.push(a); handleEvents(r.events, true); } }
    UI.sel = null; UI.mode = null; UI.rival = null; G.newTurn = false;
    orient(); afterChange();
    if (G.mode === 'hot' && G.s.phase !== 'over') { G.curtain = true; showCurtain(); }
    return true;
  } catch (e) { console.error(e); return false; }
}

// ---------- acciones y eventos ----------
// Decisiones opcionales del jugador humano en el momento en que se dan (persecución, redirigir carga, carga bloqueada, orden de Pánico…): el motor interrumpe la acción (rules.js askH), se restaura el estado, se pregunta con un popup y se repite la acción con la respuesta incluida (queda en el registro para las repeticiones y los guardados)
// v843i: tabla del libro como HTML compacto (la celda/fila que te toca resaltada)
function tblHTML(t) {
  const cap = t.cap ? `<div class="tbcap">${esc(t.cap)}</div>` : '';
  const need = t.need ? `<div class="tbneed">Necesitas: <b>${esc(t.need)}</b></div>` : '';
  const note = t.note ? `<div class="tbnote">${esc(t.note)}</div>` : '';
  if (t.k === 'grid') {
    const head = `<tr><th class="tbc">${esc(t.rh || '')}</th>${t.cols.map((c, j) => `<th class="${j === t.hc ? 'tbh hh' : 'tbh'}">${esc(c)}</th>`).join('')}</tr>`;
    const body = t.rows.map((r, i) => `<tr><th class="${i === t.hr ? 'tbr hh' : 'tbr'}">${esc(t.rhs ? t.rhs[i] : i + 1)}</th>${r.map((v, j) => `<td class="${i === t.hr && j === t.hc ? 'hi' : i === t.hr || j === t.hc ? 'hl' : ''}">${esc(v)}</td>`).join('')}</tr>`).join('');
    return `${cap}<div class="tbwrap"><table class="tbl">${t.ch ? `<caption>${esc(t.ch)}</caption>` : ''}<thead>${head}</thead><tbody>${body}</tbody></table></div>${need}${note}`;
  }
  if (t.k === 'list') {
    return `${cap}<div class="tbwrap"><table class="tbl tbllist"><thead><tr><th class="tbh">${esc(t.dice || '')}</th><th class="tbh">Resultado</th></tr></thead><tbody>${t.rows.map((r, i) => `<tr class="${[].concat(t.hi).includes(i) ? 'hi' : ''}"><th class="tbr">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>${need}${note}`;
  }
  return `${cap}<div class="tbwrap"><table class="tbl tbllist"><tbody>${t.rows.map((r, i) => `<tr class="${i === t.hi ? 'hi' : ''}"><th class="tbr">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>${need}${note}`;
}
function pickAck(need) {
  if (window.__TOW_AUTOACK) return Promise.resolve('ok');
  return new Promise((res) => {
    let el = $('reactPop'); if (!el) { el = document.createElement('div'); el.id = 'reactPop'; document.body.appendChild(el); }
    const hl = need.hl ? `<div class="atkline"><span class="rolechip">${esc(need.hl.role || 'Atacante')}</span> ${esc(need.hl.an)} <span class="arrow">→</span> <span class="rolechip tg">Objetivo</span> ${esc(need.hl.tn)}</div>` : '';
    if (need.hl) { UI.atkHi = need.hl; dirty = true; }
    const draw = (n, label) => { el.innerHTML = `<div class="card ncard tbcard" role="alertdialog" aria-modal="true"><div class="tbscroll">${hl}<p class="nmsg"><b>${esc(n.title)}</b><br>${esc(n.msg).replace(/\n/g, '<br>')}</p>${(n.tbls || []).map(tblHTML).join('')}</div><div class="nrow"><button class="btn primary tbok" id="ackOk">${esc(label)}</button></div></div>`; };
    draw(need, need.okLabel || 'OK');
    el.hidden = false;
    for (const ev of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(ev, (e) => e.stopPropagation());
    let shown = !need.after; // v843u: tiradas con resultado en la MISMA ventana: primero el aviso (para qué sirve, quién tira, qué gana el ganador) y, tras «Tirar los dados», el resultado y lo que ocurre ahora
    const go = () => { const ok = $('ackOk'); ok.focus(); ok.addEventListener('click', (e) => { e.stopPropagation(); if (!shown) { shown = true; draw(need.after, 'Continuar'); const sc = el.querySelector('.tbscroll'); if (sc) sc.scrollTop = 0; go(); return; } el.hidden = true; el.innerHTML = ''; UI.atkHi = null; dirty = true; res('ok'); }); };
    go();
  });
}
function pickChoice(need) {
  if (need.ack) return pickAck(need);
  if (need.grid) return pickGrid(need);
  return new Promise((res) => {
    let el = $('reactPop'); if (!el) { el = document.createElement('div'); el.id = 'reactPop'; document.body.appendChild(el); }
    el.innerHTML = `<div class="card ncard" role="dialog" aria-modal="true"><p class="nmsg"><b>${esc(need.title)}</b><br>${esc(need.msg)}</p><div class="nrow" style="flex-wrap:wrap;gap:6px">${need.opts.map(([v, l], i) => `<button class="btn ${i === 0 ? 'primary' : ''}" data-ci="${i}">${(() => { const x = G?.s && [...G.s.units, ...(G.s.reserves || [])].find((y) => y.id === v && l.startsWith(labelName(G.s, y))); return x ? unitChipURLimg(x) : ''; })()}${esc(l)}</button>`).join('')}</div></div>`;
    el.hidden = false;
    for (const ev of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(ev, (e) => e.stopPropagation());
    el.querySelectorAll('[data-ci]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); el.hidden = true; el.innerHTML = ''; res(need.opts[+b.dataset.ci][0]); }));
  });
}
// v830 Banda variopinta: selector de la posición exacta de cada modelo sobre la formación (un solo popup). Toca una casilla y después otra para intercambiar sus modelos, o elige el equipo
// que quieres en la casilla seleccionada (se intercambia con el modelo de ese equipo más retrasado). Las ranuras del grupo de mando están fijas. Devuelve la colocación ('k|k|…').
const MG_COL = ['#c9a14a', '#6aa0d8', '#d26a5c', '#7fbf6a', '#b07fd0', '#4fc1b7', '#d89a5c'];
function pickGrid(need) {
  return new Promise((res) => {
    let el = $('reactPop'); if (!el) { el = document.createElement('div'); el.id = 'reactPop'; document.body.appendChild(el); }
    const g = need.grid, F = g.files, n = g.n, lock = new Map(g.lock), gi = new Map(g.groups.map(([k], i) => [k, i])), let_ = (k) => String.fromCharCode(65 + (gi.get(k) ?? 25));
    let P = g.P.slice(), sel = -1;
    const cnt = (k) => P.filter((x, i) => x === k && !lock.has(i)).length; // sin los modelos de las ranuras del grupo de mando (★)
    const draw = () => {
      const R = Math.ceil(n / F), cw = `min(44px, calc((min(92vw, 460px) - 48px) / ${F} - 4px))`;
      let cells = '';
      for (let r = 0; r < R; r++) for (let c = 0; c < F; c++) { const i = r * F + c; if (i >= n) { cells += '<span></span>'; continue; }
        const k = P[i], L = lock.get(i), col = MG_COL[(gi.get(k) ?? 0) % MG_COL.length];
        cells += `<button class="mgc${i === sel ? ' sel' : ''}${L ? ' lk' : ''}" data-i="${i}" style="width:${cw};height:${cw};background:${L ? '#555' : col}" aria-label="Fila ${r + 1}, columna ${c + 1}: ${esc(L || g.groups[gi.get(k)]?.[1] || k)}" ${L ? 'disabled' : ''}>${L ? '★' : let_(k)}</button>`; }
      const info = sel < 0 ? 'Toca una casilla para seleccionarla.' : `Seleccionada: fila ${Math.floor(sel / F) + 1}, columna ${(sel % F) + 1} (${esc(g.groups[gi.get(P[sel])]?.[1] || P[sel])}). Toca otra casilla para intercambiarlas o elige abajo el equipo que quieres en ella.`;
      el.innerHTML = `<div class="card ncard mgpop" role="dialog" aria-modal="true"><p class="nmsg"><b>${esc(need.title)}</b><br>${esc(need.msg)}</p>
        <div class="mgfront">▲ frente ▲</div><div class="mggrid" style="grid-template-columns:repeat(${F}, auto)">${cells}</div>
        <p class="mginfo">${info}</p>
        <div class="mgleg">${g.groups.map(([k, lb], i) => `<button class="btn small mgk" data-k="${esc(k)}" ${sel < 0 ? 'disabled' : ''}><span class="mgsw" style="background:${MG_COL[i % MG_COL.length]}">${String.fromCharCode(65 + i)}</span> ${esc(lb)} (${cnt(k)})</button>`).join('')}${g.lock.length ? `<span class="muted mgsw2">★ ${esc(g.lock.map(([, l]) => l).join(', '))}</span>` : ''}</div>
        <div class="nrow" style="flex-wrap:wrap;gap:6px"><button class="btn" data-r="1">Restablecer</button><button class="btn primary" data-ok="1">Aceptar</button></div></div>`;
      el.querySelectorAll('.mgc[data-i]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const i = +b.dataset.i; if (lock.has(i)) return;
        if (sel < 0) sel = i; else if (sel === i) sel = -1; else { [P[sel], P[i]] = [P[i], P[sel]]; sel = -1; } draw(); }));
      el.querySelectorAll('.mgk').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const k = b.dataset.k; if (sel < 0 || P[sel] === k) return;
        let j = -1; for (let q = n - 1; q >= 0; q--) if (q !== sel && P[q] === k && !lock.has(q)) { j = q; break; } if (j < 0) { toast('No quedan modelos con ese equipo fuera de las ranuras de mando', 'bad'); return; }
        [P[sel], P[j]] = [P[j], P[sel]]; sel = -1; draw(); }));
      el.querySelector('[data-r]').addEventListener('click', (e) => { e.stopPropagation(); P = (g.dflt || g.P.join('|')).split('|'); sel = -1; draw(); });
      el.querySelector('[data-ok]').addEventListener('click', (e) => { e.stopPropagation(); el.hidden = true; el.innerHTML = ''; res(P.join('|')); });
    };
    el.hidden = false;
    for (const ev of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(ev, (e) => e.stopPropagation());
    draw();
  });
}
// ===== v843t — DESHACER =====
// Filosofía de diseño (el libro no la regula): se puede deshacer, de la más reciente hacia atrás, toda acción del jugador humano mientras NO haya aportado información nueva ni consumido azar. Cada acción deshacible lleva una marca: copia del estado completo (incluido el generador de números aleatorios s.rng, el registro s.log) y la longitud de G.actions, de modo que, con la misma semilla, lo que ocurra después es idéntico a no haber hecho la acción. Pila de varios pasos; se vacía al ocurrir cualquier cosa que no se pueda deshacer.
const UNDO_OK = new Set(['deployMove', 'move', 'pref', 'join', 'leave']); // colocar/mover/girar/pivotar/ancho en despliegue o movimiento, formación y uniones
const UNDO_EV = new Set(['move', 'ready']); // eventos sin información nueva
const UNDO_MAX = 40;
function undoBegin(a) {
  if (!G || G.mode !== 'ai' || G.replaying || !UNDO_OK.has(a.t) || a.ans) return { pre: null, rng0: G?.s?.rng, a0: G?.actions?.length, act0: G?.s?.active, ph0: G?.s?.phase };
  return { pre: structuredClone(G.s), rng0: G.s.rng, a0: G.actions.length, act0: G.s.active, ph0: G.s.phase };
}
function undoEnd(a, U0, r) {
  if (!G) return;
  const human = G.mode === 'ai' && !G.aiQuiet && (U0.ph0 === 'deploy' ? (a.t === 'deployMove' || UNDO_OK.has(a.t)) : U0.act0 === 0) && !G.replaying;
  const evOk = (r.events || []).every((e) => UNDO_EV.has(e.k));
  if (U0.pre && human && G.s.rng === U0.rng0 && !a.ans && evOk && a.t !== 'endPhase') {
    (G.undo ||= []).push({ pre: U0.pre, a0: U0.a0, a1: G.actions.length, t: a.t, ph: U0.ph0, label: a.t === 'move' ? 'movimiento' : a.t === 'deployMove' ? 'colocación' : a.t === 'pref' ? 'ajuste de la unidad' : 'unión de personaje' });
    if (G.undo.length > UNDO_MAX) G.undo.shift();
    G.undoWhy = null; return;
  }
  G.undo = [];
  G.undoWhy = a.t === 'endPhase' || a.t === 'ready' ? 'No se puede deshacer: ya has pasado de fase o de turno'
    : G.s.rng !== U0.rng0 ? 'No se puede deshacer: ya se tiraron dados'
    : a.ans ? 'No se puede deshacer: ya has visto información de una ventana de aviso o has decidido en ella'
    : !human ? 'No se puede deshacer: el rival ya ha actuado después'
    : !evOk || !UNDO_OK.has(a.t) ? 'No se puede deshacer: la última acción (disparo, carga, hechizo, combate…) ya ha dado información o consumido azar'
    : 'No se puede deshacer esta acción';
}
// motivo por el que no se puede deshacer ahora (null = se puede)
function undoWhy() {
  if (!G || !G.s) return 'No hay partida en curso';
  if (G.s.phase === 'over') return 'La partida ha terminado';
  if (G.mode === 'code') return 'No se puede deshacer en una partida por código: tu rival recibe tus jugadas en el código';
  if (G.mode === 'hot') return 'No se puede deshacer en una partida a dos en el mismo dispositivo: el rival ya podría haber visto tu jugada';
  if (G.replaying || G.waiting) return 'No se puede deshacer ahora';
  const t = (G.undo || [])[(G.undo || []).length - 1];
  if (!t) return G.undoWhy || 'No hay nada que deshacer';
  if (t.a1 !== G.actions.length) { G.undo = []; G.undoWhy = 'No se puede deshacer: el rival ya ha actuado después'; return G.undoWhy; }
  return null;
}
function undoLast() {
  const why = undoWhy(); if (why) { toast(why, 'bad'); renderUndo(); return false; }
  const e = G.undo.pop();
  G.s = e.pre; G.actions.length = e.a0; G.undoWhy = null;
  if (UI) { UI.mode = null; UI.targets = null; UI.ghost = null; UI.aimMark = null; UI.chargeQ = []; }
  save(); renderAll(); renderUndo(); toast(`Deshecho: ${e.label}`); return true;
}
function renderUndo() {
  const b = $('zUndo'); if (!b) return;
  const why = G ? undoWhy() : 'No hay partida en curso', n = (G?.undo || []).length;
  b.classList.toggle('off', !!why); b.setAttribute('aria-disabled', why ? 'true' : 'false');
  b.title = why ? `Deshacer — ${why}` : `Deshacer la última acción (${G.undo[G.undo.length - 1].label}); quedan ${n} paso${n === 1 ? '' : 's'}`;
}
function dispatch(a, popt) {
  const wasHuman = G.mode === 'ai' && a.t === 'endPhase' && G.s.active === 0 && G.s.phase === 'shoot';
  const am = G.replaying ? null : G.mode === 'ai' ? { 0: true } : G.mode === 'hot' || G.mode === 'code' ? { 0: true, 1: true } : null; // v832: el modo por código usa los mismos popups
  if (am && !window.__TOW_NOACK) am.ack = G.mode === 'ai' ? { 0: true } : G.mode === 'hot' ? { 0: true, 1: true } : { [G.myOwner]: true }; // v843i: avisos y tablas ANTES de la acción (popup + OK) para el/los humano(s) de este dispositivo; window.__TOW_NOACK desactiva, window.__TOW_AUTOACK los confirma solos (pruebas)
  G.s.askMode = null;
  const snap = am ? structuredClone(G.s) : null;
  const U0 = undoBegin(a);
  let r;
  try { G.s.askMode = am; r = apply(G.s, a); G.s.askMode = null; } catch (e) {
    G.s.askMode = null;
    if (!e.need) throw e;
    G.s = snap;
    const vsMe = !!(e.need.ack && e.need.hl && e.need.hl.tgt && (anyById(G.s, e.need.hl.tgt)?.owner === G.myOwner || (G.mode === 'ai' && anyById(G.s, e.need.hl.tgt)?.owner === 0))); // v843s: cuando el humano es el OBJETIVO (disparo, herir, salvaciones, combate) el aviso con la tabla sale como popup antes de las tiradas, también en el turno de la IA
    if (popt && popt.silentAck && e.need.ack && !vsMe) { popt.sink.push({ title: e.need.title, msg: e.need.msg, tbls: e.need.tbls, hl: e.need.hl }); return dispatch({ ...a, ans: { ...(a.ans || {}), [e.need.k]: 'ok' } }, popt); } // v843q: los avisos informativos de la IA no bloquean: se guardan en el paso (panel de tablas) y se contestan solos; no consumen dados
    if (G.mode === 'code' && e.need.p !== G.myOwner) { G.pend = { a: { ...a }, need: e.need }; G.waiting = true; save(); renderAll(); showCodeModal('pend'); return { ok: false, silent: true }; } // v832: decisión del rival en mitad de la acción: se le pasa por código y la acción sigue con su respuesta
    if (popt && popt.silentAck && e.need.ack && vsMe) popt.sink.push({ title: e.need.title, msg: e.need.msg, tbls: e.need.tbls, hl: e.need.hl });
    const wait = pickChoice(e.need).then((v) => { const r2 = dispatch({ ...a, ans: { ...(a.ans || {}), [e.need.k]: v } }); return r2.wait ? r2.wait : r2; });
    renderAll();
    return { ok: false, wait, silent: true };
  }
  if (r.ok && wasHuman) G.recordH.push(features(G.s, 0));
  if (!r.ok) { toast(r.error, 'bad'); if (r.blocker && UI) { UI.atkHi = { atk: a.id, tgt: r.blocker, role: 'Dispara', tgRole: 'Bloquea' }; dirty = true; } return r; }
  G.actions.push(a);
  undoEnd(a, U0, r);
  handleEvents(r.events, false);
  afterChange();
  save();
  return r;
}

function handleEvents(events, silent) {
  const now = performance.now();
  for (const e of events) {
    if (e.k === 'turn') {
      const prevOwner = G.curOwner, prev = G.cur;
      const viewerAfter = G.mode === 'ai' ? 0 : G.mode === 'code' ? G.myOwner : e.owner;
      if (prevOwner !== undefined && prevOwner !== viewerAfter) UI.rival = { owner: prevOwner, turn: e.turn, events: prev.filter((x) => ['move', 'charge', 'shoot', 'cast', 'combat', 'flee', 'destroy'].includes(x.k)) };
      else if (prevOwner !== undefined) UI.rival = null;
      G.cur = []; G.curOwner = e.owner; UI.focusEv = null; G.newTurn = true;
    }
    if (!G.pbReplay) { G.cur.push(e); G.log.push({ msg: e.msg, owner: e.owner, k: e.k, ev: e }); }
    if (silent) continue;
    if (e.k === 'shoot') sndPlay(/ca[ñn]ón|lanzapiedras|trabuquete|lanzavirotes|Lanza/i.test(e.msg || '') ? 'cannon' : 'shoot'); else if (e.k === 'cast') sndPlay('cast'); else if (e.k === 'charge' && e.ok) sndPlay('charge'); else if (e.k === 'move') sndPlay('move'); else if (e.k === 'combat') sndPlay('combat'); else if (e.k === 'destroy') sndPlay('destroy'); else if (e.k === 'flee') sndPlay('flee'); else if (e.k === 'turn' && e.owner === viewer()) sndPlay('turn'); else if (e.k === 'end') sndPlay('win');
    if (e.k === 'shoot' && e.from) { const big = /ca[ñn]ón|lanzapiedras|trabuquete|lanzavirotes|Lanza/i.test(e.msg || ''); for (let i = 0; i < (big ? 5 : 2); i++) UI.fx.push({ pos: { x: e.from.x + (Math.random() - 0.5) * 1.2, y: e.from.y + (Math.random() - 0.5) * 1.2 }, puff: '130,130,130', size: big ? 1.6 : 0.8, t0: now + i * 90, ttl: 1500 }); if (e.to) for (let i = 0; i < 3; i++) UI.fx.push({ pos: { x: e.to.x + (Math.random() - 0.5) * 2, y: e.to.y + (Math.random() - 0.5) * 2 }, puff: '255,150,60', size: 0.9, t0: now + 400 + i * 80, ttl: 900 }); }
    eventFx(e, now);
    floatFx(e, now);
    const spellDone = e.k === 'cast' && spellFx(e, now);
    if (e.k === 'cast' && e.to && !spellDone) for (let i = 0; i < 6; i++) UI.fx.push({ pos: { x: e.to.x + (Math.random() - 0.5) * 3, y: e.to.y + (Math.random() - 0.5) * 3 }, puff: '175,125,255', size: 0.7, t0: now + 200 + i * 70, ttl: 1100 });
    if (e.k === 'charge' && e.ok && e.to) for (let i = 0; i < 4; i++) UI.fx.push({ pos: { x: e.to.x + (Math.random() - 0.5) * 3, y: e.to.y + (Math.random() - 0.5) * 3 }, puff: '160,140,105', size: 1.2, t0: now + i * 100, ttl: 1400 });
    if (e.k === 'destroy') for (let i = 0; i < 5; i++) UI.fx.push({ pos: { x: e.x + (Math.random() - 0.5) * 3, y: e.y + (Math.random() - 0.5) * 3 }, puff: '90,80,70', size: 1.4, t0: now + i * 90, ttl: 1700 });
    if (e.k === 'shoot' || (e.k === 'cast' && !spellDone)) UI.fx.push({ a: e.from, b: e.to, color: e.k === 'cast' ? '#c79bff' : '#ff8a5a', t0: now, ttl: 1300 });
    if (e.k === 'charge') UI.fx.push({ a: e.from, b: e.to, color: '#ff6a5a', t0: now, ttl: 1300 });
    if (e.k === 'combat') UI.fx.push({ at: e.at, color: '#ff6a5a', t0: now, ttl: 1100 });
    if (e.k === 'destroy') UI.fx.push({ at: { x: e.x, y: e.y }, color: '#ffffff', t0: now, ttl: 900 });
  }
  if (!silent && !G.pbReplay) diceFor(events);
  if (G.pbReplay) { /* repetición: solo efectos visuales */ } else if (silent) { if (G.s) G.s.notices = []; } else if (G.aiQuiet) { if (G.s && G.s.notices?.length) { (PB.stepNow ? PB.stepNow.notes : []).push(...G.s.notices.map((n) => n.t)); G.s.notices = []; } } else showNotices();
  if (!silent && !G.pbReplay) {
    const lines = events.filter((e) => e.k !== 'turn' && e.k !== 'ready').map((e) => e.msg);
    if (G.aiQuiet) { /* la reproducción de la IA muestra el resultado sobre el tablero */ }
    else if (events.some((e) => e.k === 'combat') && !G.demo) combatSummary(events);
    else if (lines.length) toast(lines.slice(-3).join('\n'), events.some((e) => e.owner !== undefined && e.owner !== viewer()) ? 'rival' : '');
  }
}

function combatSummary(events) {
  document.querySelectorAll('.pvov.cs').forEach((x) => x.remove());
  const rows = events.filter((e) => e.msg && e.k !== 'turn' && e.k !== 'ready' && e.k !== 'move').map((e) => {
    if (e.k !== 'combat') return `<div class="pvr muted">${esc(e.msg)}</div>`;
    const win = e.ra === e.rb ? 'Empate' : (e.ra > e.rb ? 0 : 1) === viewer() ? '✔ Victoria' : '✘ Derrota';
    return `<div class="pvr"><b>${esc(e.msg)}</b> <span class="chip ${win[0] === '✔' ? 'ok' : win[0] === '✘' ? 'warn' : ''}">${win}</span></div>`;
  });
  const ov = document.createElement('div'); ov.className = 'pvov cs';
  ov.innerHTML = `<div class="card"><h1>Resumen del combate</h1>${rows.slice(-18).join('')}<div class="row"><button class="btn primary">Continuar</button></div></div>`;
  ov.onclick = (e) => { if (e.target === ov || e.target.tagName === 'BUTTON') ov.remove(); };
  document.body.appendChild(ov);
}

// ---------- ciclo ----------
function orient() {
  const base = viewer() === 1 ? 2 : 0;
  const sNorm = Math.min((view.w - 16) / TW, (view.h - 16) / TH), sRot = Math.min((view.w - 16) / TH, (view.h - 16) / TW);
  const portrait = view.w && sRot > sNorm * 1.12;
  view.k = (base + (portrait ? 1 : 0)) % 4;
  fit();
}

function stirDrive() {
  const s = G.s, d = s.stirDep; if (G.mode !== 'ai' || !d || s.phase !== 'deploy' || G.replaying) return;
  const ai = 1 - G.myOwner;
  if (d.phase !== 'done' && d.turn === ai) { const a = { t: 'stirAuto', player: ai }; if (apply(s, a).ok) G.actions.push(a); }
  if (d.phase === 'done' && !s.ready[ai]) { const a = { t: 'ready', player: ai }; if (apply(s, a).ok) G.actions.push(a); }
}
const altWho = (d) => (d.phase === 'fsel' ? (!d.ok[0] ? 0 : !d.ok[1] ? 1 : null) 
  : d.phase === 'first' || d.phase === 'zone' ? d.win : d.phase === 'done' ? null : d.turn); // a quién le toca actuar en el despliegue alterno
function altDrive() { // despliegue alterno contra la IA: ella elige/coloca en su turno y se declara lista al terminar
  const s = G.s, d = s.alt; if (G.mode !== 'ai' || !d || s.phase !== 'deploy' || G.replaying) return;
  const ai = 1 - G.myOwner;
  for (let g = 0; g < 4; g++) {
    if ((d.phase === 'fsel' && !d.ok[ai]) || ((d.phase === 'first' || d.phase === 'zone') && d.win === ai) || (d.phase !== 'first' && d.phase !== 'zone' && d.phase !== 'fsel' && d.phase !== 'done' && d.turn === ai)) { const a = { t: 'altAuto', player: ai }; if (apply(s, a).ok) G.actions.push(a); else break; } else break;
  }
  if (d.phase === 'done' && !s.ready[ai]) { const a = { t: 'ready', player: ai }; if (apply(s, a).ok) G.actions.push(a); }
}
// v843s: al empezar el despliegue (y en cada turno del despliegue alterno) la cámara 3D encuadra la zona del jugador humano desde su lado
function deployCam() {
  const s = G.s; if (!s) return;
  if (s.phase !== 'deploy') { if (UI.depCamKey) { UI.depCamKey = null; UI.userZoom = false; orient(); dirty = true; } return; }
  if (G.curtain || G.replaying) return;
  const who = viewer(), d = s.alt, key = who + '|' + (d ? d.phase + ':' + d.turn + ':' + (d.cur || []).join(',') : 'x') + '|' + (s.ready[who] ? 1 : 0);
  if (UI.depCamKey === key || s.ready[who]) return;
  UI.depCamKey = key; UI.userRot = false; orient(); if (camZone(s.zones[who])) { UI.userZoom = true; dirty = true; }
}
function afterChange() {
  stirDrive(); altDrive(); deployCam();
  if (G.mode === 'hot' && G.s.phase === 'deploy' && G.s.alt && !G.curtain) { // despliegue alterno entre dos jugadores: pantalla de relevo al cambiar quien actúa
    const d = G.s.alt, who = altWho(d);
    if (d.phase === 'done') { if (!G.altDoneSeen) { G.altDoneSeen = true; G.deployPlayer = 0; G.curtain = true; orient(); showCurtain(); } }
    else if (G.deployPlayer !== who) { G.deployPlayer = who; G.curtain = true; orient(); showCurtain(); }
  }
  if (G.mode === 'code' && G.s.phase === 'deploy' && G.s.alt && !G.replaying) { // despliegue alterno por código: cada cambio de turno pasa por el código del rival
    const d = G.s.alt, who = altWho(d);
    if (!G.waiting && who !== G.myOwner && G.actions.length > G.synced && !(d.phase === 'done' && G.s.ready[G.myOwner])) { G.waiting = true; showCodeModal('turn'); }
    else if (!G.waiting && who !== null && who !== G.myOwner) { G.waiting = true; showCodeModal('wait'); }
  }
  const s = G.s;
  UI.canActIds = new Set();
  if (interactive()) for (const u of alive(s, viewer())) if (s.phase !== 'deploy' && canAct(s, u)) UI.canActIds.add(u.id);
  if (UI.sel) { const u = byId(s, UI.sel); if (!u || u.models <= 0) { UI.sel = null; UI.mode = null; UI.targets = null; } }
  if (s.nomPick != null && interactive() && (viewer() === s.nomPick || G.mode === 'hot') && !UI.nomOpen) {
    UI.nomOpen = true; const k = s.secret?.[s.nomPick], cl = s.nomKind === 'clash', pk = s.nomKind === 'pn' ? pnInfo(s) : ({ wchal: ['Duelo del Guerrero', 'Lobos del Mar: puedes desafiar al rival a un Duelo del Guerrero en lugar de tirar para el primer turno.'], wacc: ['Duelo del Guerrero', 'El rival (Lobos del Mar) te desafía a un Duelo del Guerrero. Si lo rechazas, cuenta como ganador de la tirada.'], wnom: ['Duelo del Guerrero', 'Elige al campeón (1 Herida, infantería o caballería) que combatirá.'], gzd: ['Mirada de los Dioses', 'Has vencido en el Duelo del Guerrero: puedes tirar una vez en la tabla de la Mirada de los Dioses antes de volver a tu unidad (el resultado 1 es perjudicial).'], mists: ['Desde las Brumas', 'Tras el despliegue puedes retirar una unidad desplegada y recolocarla en cualquier punto de tu zona de despliegue (cerca o lejos del enemigo), o no usar la regla.'], reap: ['Segador de Usirian', 'Tras el despliegue, nomina a un personaje de la lista de ejército rival: Apophas repite los impactos y heridas fallados contra él y sus impactos son Mágicos.'], prey: ['Digno de Kurnous', 'Tras el despliegue, nomina a un personaje o monstruo enemigo como presa de la Cacería Salvaje: tus modelos repiten los 1 para impactar contra él y ganas 100 PV si muere, huye o está huyendo al final.'], first: ['Primer turno', 'Has ganado la tirada: elige quién juega el primer turno.'], hans: ['Maestría estratégica', 'Puedes sumar +1, restar 1 o no aplicar modificador a tu tirada para decidir el primer turno.'], bless: ['Bendiciones de la Dama', 'Tras el despliegue puedes arrodillarte y rezar: tus modelos con la regla ganan salvación especial 6+ (5+ contra F5 o más), pero el rival cuenta como ganador de la tirada del primer turno. Se pierde al huir o al rechazar un desafío.'] })[s.nomKind];
    openModal(`<h3>${pk ? pk[0] : cl ? 'Clash of Steel' : esc(SECRETS[k][0])}</h3><p class="muted">${pk ? pk[1] : cl ? 'Elige al modelo (1 Herida, infantería o caballería) que se batirá en duelo en el puente.' : k === 'bm_scout' ? 'Nomina en secreto un elemento de terreno.' : 'Nomina en secreto una unidad propia.'}</p><div class="col">${nomCands(s, s.nomPick).map((c) => `<button class="btn" data-nom="${c.id}">${esc(c.label)}</button>`).join('')}</div>`);
    document.querySelectorAll('[data-nom]').forEach((b) => { b.onclick = () => { const r = dispatch({ t: 'secNom', id: b.dataset.nom }); if (r.ok) { UI.nomOpen = false; closeModal(); } }; });
  }
  if (s.reloc && interactive() && viewer() === s.reloc.owner && !(UI.mode && UI.mode.reloc)) {
    const ru = byId(s, s.reloc.id);
    if (ru) { UI.sel = ru.id; UI.mode = { k: 'place', id: ru.id, reloc: true }; UI.ghost = { x: ru.x, y: ru.y, face: ru.face, files: ru.files, lance: ru.lance, sp: ru.spPref || 0, manual: false }; checkGhost(); toast('Recoloca la unidad a 12" o menos (no a 6" del enemigo)'); renderPlacebar(); }
  }
  renderAll();
  if (s.phase === 'over' && !G.over) { G.over = true; onGameOver(); return; }
  if (G.newTurn) {
    G.newTurn = false;
    if (G.mode === 'hot' && s.phase !== 'over' && !G.replaying) { G.curtain = true; showCurtain(); }
    if (G.mode === 'code') codeTurnHook();
    if (UI.rival && UI.rival.events.length && viewer() === s.active) {
      banner(`<b>El rival ha actuado</b><small>${UI.rival.events.length} acciones sombreadas en ámbar · toca 👁 para ocultarlas</small>`);
      setTimeout(() => banner(''), 6500);
      if (document.hidden) notifyBrowser('Tu turno', 'El rival ha movido.');
    }
  }
  if (G.mode === 'ai' && s.phase !== 'over' && s.phase !== 'deploy' && s.active === 1 && !G.aiBusy) runAI();
  if (G.mode === 'ai' && s.phase === 'deploy' && s.ready[0] === true && !G.started) { G.started = true; }
}

function notifyBrowser(title, body) {
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body }); } catch { /* */ }
}

// Reacciones de carga (Core p.117-121): al declararse una carga contra una unidad de un jugador humano, la elige él (Mantener, Defender y disparar, Huir, Disparar y huir) antes de resolverse la carga
function pickReaction(cu, t, opts) {
  return new Promise((res) => {
    let el = $('reactPop'); if (!el) { el = document.createElement('div'); el.id = 'reactPop'; document.body.appendChild(el); }
    el.innerHTML = `<div class="card ncard" role="dialog" aria-modal="true"><p class="nmsg"><b>${UC(cu)}</b> declara una carga contra <b>${UC(t)}</b> (a ${unitDist(cu, t).toFixed(1)}").<br>¿Qué reacción elige tu unidad?</p><div class="nrow" style="flex-wrap:wrap;gap:6px">${opts.map(([v, l]) => `<button class="btn ${v === opts[0][0] ? 'primary' : ''}" data-rv="${v}">${esc(l)}</button>`).join('')}</div></div>`;
    el.hidden = false;
    for (const ev of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(ev, (e) => e.stopPropagation());
    el.querySelectorAll('[data-rv]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); el.hidden = true; el.innerHTML = ''; res(b.dataset.rv); }));
  });
}
async function askReactions(a) {
  const s = G.s, restore = [];
  return restore; // v832: la reacción la pregunta el motor en el momento de resolver la carga (popup genérico; también en el modo por código)
  const human = (o) => G.mode === 'ai' ? o === 0 : G.mode === 'hot' ? o !== s.active : false, seen = new Set();
  for (const c of (a.t === 'chargeAll' ? a.list : [a])) {
    const cu = s.units.find((x) => x.id === c.id), t = s.units.find((x) => x.id === c.target);
    if (!cu || !t || seen.has(t.id) || t.models <= 0 || !human(t.owner) || t.fleeing || t.stupid || isEngaged(s, t)) continue;
    seen.add(t.id);
    const rg = rangedOf(t), opts = [['hold', 'Mantener la posición'], ...(rg ? [['shoot', 'Defender y disparar']] : []), ['flee', 'Huir'], ...(rg && D(t).sr.includes('fireFlee') ? [['fireflee', 'Disparar y huir']] : [])];
    const v = await pickReaction(cu, t, opts);
    restore.push({ t: 'react', id: t.id, v: t.react || 'auto' });
    dispatch({ t: 'react', id: t.id, v });
  }
  return restore;
}
// ===== v843q (puntos 8 y 9): reproducción del turno de la IA — cámara, efectos sobre el tablero, pasos y controles =====
// Es solo presentación: cada acción se aplica con el mismo apply() que antes (los avisos informativos no consumen dados), así que la partida con la misma semilla da el mismo resultado con o sin reproducción.
const PB = { hist: [], steps: [], p: 0, speed: 1, camOn: true, paused: false, viewS: null, listOpen: false, replaying: false, tok: 0, stepNow: null, live: false };
const PB_SPEEDS = [[0.5, '0,5×'], [1, '1×'], [2, '2×'], [3, '3×'], [4, '4×'], [0, '⚡']];
try { const sv = JSON.parse(localStorage.getItem('tow.pbSpeed') || 'null'); if (sv && PB_SPEEDS.some((x) => x[0] === sv.s)) PB.speed = sv.s; if (sv && sv.c === false) PB.camOn = false; } catch { /* sin almacenamiento */ }
const pbSave = () => { try { localStorage.setItem('tow.pbSpeed', JSON.stringify({ s: PB.speed, c: PB.camOn })); } catch { /* */ } };
const pbDelay = (ms) => (PB.speed === 0 ? Promise.resolve() : sleep(ms / PB.speed));
const unitsOf = (s, a) => { const ids = new Set(); const add = (v) => { if (v != null && (typeof v === 'string' || typeof v === 'number')) ids.add(String(v)); }; add(a.id); add(a.target); add(a.unit); add(a.cid); (a.list || []).forEach((x) => { add(x.id); add(x.target); }); return [...ids].map((id) => anyById(s, id) || byId(s, id)).filter((u) => u && u.models > 0); };
function pbFocusPts(s, a, r) { // puntos del tablero a mostrar: el lugar donde la IA hace la acción
  const pts = unitsOf(s, a).map((u) => ({ x: u.x, y: u.y })); if (a.x != null && a.y != null && a.t !== 'deployMove') pts.push({ x: a.x, y: a.y });
  for (const e of r?.events || []) { for (const k of ['from', 'to', 'at']) if (e[k] && e[k].x != null) pts.push({ x: e[k].x, y: e[k].y }); }
  return pts;
}
function pbTween(to, dur) {
  const tok = ++PB.tok, from = { scale: view.scale, px: view.px, py: view.py };
  if (!dur) { view.scale = to.scale; view.px = to.px; view.py = to.py; dirty = true; return Promise.resolve(); }
  return new Promise((res) => { const t0 = performance.now(); const step = (now) => { if (tok !== PB.tok) return res(); const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; view.scale = from.scale * Math.pow(to.scale / from.scale, e); view.px = from.px + (to.px - from.px) * e; view.py = from.py + (to.py - from.py) * e; dirty = true; if (k < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
}
function pbCamTo(pts) { // cámara suave hacia los puntos (zoom que los encuadra); respeta el modo 2D/3D (solo mueve px/py/escala)
  if (!PB.camOn || !pts.length || !G) return Promise.resolve();
  const cx = pts.reduce((q, p) => q + p.x, 0) / pts.length, cy = pts.reduce((q, p) => q + p.y, 0) / pts.length;
  let span = 0; for (const p of pts) for (const q of pts) span = Math.max(span, Math.hypot(p.x - q.x, p.y - q.y));
  const want = Math.max(4.5, Math.min(60, view.w * 0.8 / Math.max(14, span + 10))); // al menos un encuadre de 14" de ancho
  const save = { scale: view.scale, px: view.px, py: view.py }; view.scale = want; focus({ x: cx, y: cy }, 0); const to = { scale: view.scale, px: view.px, py: view.py }; view.scale = save.scale; view.px = save.px; view.py = save.py;
  UI.userZoom = true;
  return pbTween(to, PB.speed === 0 ? 0 : 520 / PB.speed);
}
function pbLabel(a, r) {
  const ev = (r?.events || []).filter((e) => e.msg && e.k !== 'turn' && e.k !== 'ready'); if (ev.length) return ev.slice(0, 2).map((e) => e.msg).join(' · ');
  const u = G && G.s ? byId(G.s, a.id) : null; return `${a.t}${u ? ' · ' + u.name : ''}`;
}
function pbShowP(p, fx) { // posición p = estado tras p acciones (0 = antes de todas); la última = estado real
  PB.p = Math.max(0, Math.min(PB.steps.length, p)); PB.viewS = PB.p >= PB.steps.length ? null : PB.steps[PB.p].pre; UI.atkHi = null;
  const st = PB.p > 0 ? PB.steps[PB.p - 1] : null;
  if (fx && st) { G.pbReplay = true; try { handleEvents(st.events || [], false); } finally { G.pbReplay = false; } if (st.hl) UI.atkHi = st.hl; }
  dirty = true; renderPbk();
}
async function pbPlayFrom(p0) { // reproduce los pasos desde p0 (botón ▶ / «ver otra vez»)
  if (PB.replaying) { PB.replaying = false; PB.tok++; return; }
  PB.replaying = true; PB.paused = false; const tok0 = PB.tok;
  try {
    for (let k = p0; k < PB.steps.length && PB.replaying; k++) {
      const st = PB.steps[k]; pbShowP(k, false); await pbCamTo(st.pts); if (!PB.replaying) break;
      pbShowP(k + 1, true); await pbDelay(900); while (PB.paused && PB.replaying) await sleep(120);
    }
  } finally { PB.replaying = false; renderPbk(); }
  void tok0;
}
function pbTablesModal(i) {
  const st = PB.steps[i]; if (!st) return; const tb = (st.tables || []).map((n) => `<div class="pbtb"><b>${esc(n.title)}</b><br><small>${esc(n.msg)}</small>${(n.tbls || []).map(tblHTML).join('')}</div>`).join('');
  openModal(`<div class="card spcard"><h3>Paso ${i + 1}: ${esc(st.label)}</h3>${(st.notes || []).map((x) => `<p class="muted">${esc(x)}</p>`).join('')}<div class="tbscroll" style="max-height:60vh;overflow:auto">${tb || '<p class="muted">Sin tablas en este paso.</p>'}</div><button class="btn primary" id="rtClose">Cerrar</button></div>`);
  $('rtClose').onclick = closeModal;
}
function renderPbk() {
  const el = $('pbk'); if (!el) return; const n = PB.steps.length;
  const show = n > 0 && (G?.aiBusy || PB.open);
  el.hidden = !show; $('zAI').hidden = !(n > 0 && !G?.aiBusy) || PB.open; if (!show) { PB.viewS = PB.open ? PB.viewS : null; return; }
  const cur = PB.p > 0 ? PB.steps[PB.p - 1] : null, sp = PB_SPEEDS.find((x) => x[0] === PB.speed) || PB_SPEEDS[1];
  const playing = PB.replaying || (G?.aiBusy && !PB.paused);
  el.innerHTML = `<div class="pbl1">${G?.aiBusy ? '<span class="spin"></span>' : '▶'} <b>IA</b> · paso ${PB.p}/${n}${cur ? ' · ' + esc(cur.label) : ' · inicio del turno'}</div>
  <div class="pbrow2"><button class="btn ic" id="pbkF" title="Al inicio del turno de la IA">⏮</button><button class="btn ic" id="pbkB" title="Paso anterior (restaura el estado previo)">◀</button><button class="btn ic primary" id="pbkP" title="${playing ? 'Pausa' : 'Reproducir'}">${playing ? '⏸' : '▶'}</button><button class="btn ic" id="pbkN" title="Paso siguiente">▶︎|</button><button class="btn ic" id="pbkE" title="Al final (estado real)">⏭</button><button class="btn ic" id="pbkS" title="Velocidad de reproducción">${sp[1]}</button><button class="btn ic ${PB.listOpen ? 'primary' : ''}" id="pbkL" title="Registro de pasos">☰</button><button class="btn ic" id="pbkX" title="Cerrar">✕</button></div>`;
  $('pbkF').onclick = () => { pbStop(); pbShowP(0, false); pbCamTo(PB.steps[0]?.pts || []); };
  $('pbkB').onclick = () => { pbStop(); pbShowP(PB.p - 1, false); const st = PB.steps[Math.max(0, PB.p)] || PB.steps[0]; if (st) pbCamTo(st.pts); };
  $('pbkN').onclick = () => { pbStop(); const st = PB.steps[PB.p]; if (!st) return; pbShowP(PB.p, false); pbCamTo(st.pts).then(() => pbShowP(PB.p + 1, true)); };
  $('pbkE').onclick = () => { pbStop(); pbShowP(PB.steps.length, false); };
  $('pbkP').onclick = () => { if (G?.aiBusy) { PB.paused = !PB.paused; renderPbk(); } else if (PB.replaying) { pbStop(); renderPbk(); } else pbPlayFrom(PB.p >= PB.steps.length ? 0 : PB.p); };
  $('pbkS').onclick = () => { const i = PB_SPEEDS.findIndex((x) => x[0] === PB.speed); PB.speed = PB_SPEEDS[(i + 1) % PB_SPEEDS.length][0]; pbSave(); renderPbk(); toast('Velocidad de la reproducción: ' + PB_SPEEDS.find((x) => x[0] === PB.speed)[1]); };
  $('pbkL').onclick = () => { PB.listOpen = !PB.listOpen; renderPbk(); };
  $('pbkX').onclick = () => { pbStop(); PB.open = false; PB.listOpen = false; PB.viewS = null; PB.p = PB.steps.length; renderPbk(); dirty = true; };
  const ls = $('pbl'); ls.hidden = !PB.listOpen;
  if (PB.listOpen) {
    ls.innerHTML = `<div class="pbh"><b>Turno de la IA</b><button class="btn small ${PB.camOn ? 'primary' : ''}" id="pbCam" title="La cámara sigue las acciones de la IA">🎥 Cámara ${PB.camOn ? 'sí' : 'no'}</button></div>` + PB.steps.map((st, i) => `<div class="pbs ${i === PB.p - 1 ? 'on' : ''}" data-i="${i}"><span class="n">${i + 1}</span><span class="t">${esc(st.label)}</span>${(st.tables && st.tables.length) || (st.notes && st.notes.length) ? `<button class="btn small" data-tb="${i}" title="Tablas y avisos de este paso">📊</button>` : ''}</div>`).join('');
    ls.querySelectorAll('.pbs').forEach((r) => (r.onclick = (e) => { if (e.target.closest('[data-tb]')) return; pbStop(); const i = +r.dataset.i; pbShowP(i, false); pbCamTo(PB.steps[i].pts).then(() => pbShowP(i + 1, true)); }));
    ls.querySelectorAll('[data-tb]').forEach((b) => (b.onclick = () => pbTablesModal(+b.dataset.tb)));
    $('pbCam').onclick = () => { PB.camOn = !PB.camOn; pbSave(); renderPbk(); };
    const on = ls.querySelector('.pbs.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  }
}
function pbStop() { PB.replaying = false; PB.tok++; }
async function runAI() {
  PB.camSave = { scale: view.scale, px: view.px, py: view.py }; G.aiBusy = true; PB.steps = []; PB.p = 0; PB.viewS = null; PB.open = false; PB.listOpen = false; PB.paused = false; renderAll();
  banner(`<span class="spin"></span><b>La IA piensa…</b><small>${LEVELS[G.level].name}</small>`);
  const cfg = { weights: AI.weights, level: LEVELS[G.level], rng: mkRng(Date.now() & 0xffffff) };
  const st = { done: new Set() };
  await sleep(450 / (PB.speed || 8));
  let guard = 0;
  while (G && G.s.active === 1 && G.s.phase !== 'over' && guard++ < 300) {
    const a = nextAction(G.s, cfg, st);
    const rst = (a.t === 'charge' || a.t === 'chargeAll') ? await askReactions(a) : [];
    if (!G) return;
    const step = { a, pre: structuredClone(G.s), tables: [], notes: [], events: [], label: '', pts: [] }; PB.stepNow = step;
    step.pts = pbFocusPts(G.s, a, null); const quiet = a.t !== 'endPhase';
    if (quiet) { PB.viewS = null; PB.p = PB.steps.length; renderPbk(); await pbCamTo(step.pts); while (PB.paused && G) await sleep(120); }
    G.aiQuiet = true; let r;
    try { r = dispatch(a, { silentAck: true, sink: step.tables }); if (r.wait) r = await r.wait; } finally { G.aiQuiet = false; }
    if (!G) return;
    for (const x of rst) dispatch(x);
    if (!r.ok) r = dispatch({ t: 'endPhase' });
    step.events = (r.events || []).filter((e) => e.k !== 'turn'); step.label = pbLabel(a, r); step.pts = pbFocusPts(G.s, a, r).concat(step.pts);
    if (a.t === 'endPhase') { st.done.clear(); G.record.push(features(G.s, 1)); } else { PB.steps.push(step); PB.p = PB.steps.length; const tu = unitsOf(G.s, a); step.hl = tu.length ? { atk: tu[0].id, tgt: tu[1]?.id, role: 'IA' } : null; UI.atkHi = step.hl; renderPbk(); }
    PB.stepNow = null;
    await pbDelay(a.t === 'endPhase' ? 300 : a.t === 'move' ? 420 : 680);
    UI.atkHi = null;
    while (UI.noticeOpen && G) await sleep(120); // pausa la IA mientras el humano lee una decisión
    while (PB.paused && G) await sleep(120);
    if (!G) return;
  }
  if (PB.steps.length) { (PB.hist ||= []).push({ turn: G.s.turn, steps: PB.steps }); while (PB.hist.length > 4) PB.hist.shift(); } // v843s: turnos de la IA repetibles desde el menú de la partida (los 4 últimos)
  G.aiBusy = false; banner(''); PB.open = false; UI.atkHi = null; PB.viewS = null; PB.p = PB.steps.length; renderPbk(); afterChange();
  if (PB.camOn && PB.camSave && PB.steps.length && G) { await pbDelay(500); if (G && !G.aiBusy) await pbTween(PB.camSave, PB.speed === 0 ? 0 : 600 / PB.speed); } // al acabar el turno de la IA la cámara vuelve a la vista que tenías
}

function onGameOver() {
  const s = G.s;
  let note = '';
  if (G.mode === 'ai') {
    // aprendizaje online con los estados de la IA (jugador 1) y de la persona (jugador 0)
    let w = AI.weights;
    if (G.record.length) w = learn(w, G.record, outcomeFor(s, 1), 0.04);
    if (G.recordH.length) w = learn(w, G.recordH, outcomeFor(s, 0), 0.02);
    AI.weights = w; AI.games++;
    store.set('tow_ai', { weights: w, games: AI.games, gens: AI.gens });
    note = `<div class="note">La IA ha aprendido de esta partida (${AI.games} partidas aprendidas en este dispositivo).</div>`;
  }
  if (!G.tutorial) store.del('tow_save');
  note += achNote(recordGame());
  note += campaignResult();
  const vp = s.vp;
  const me = G.mode === 'ai' ? 0 : G.mode === 'code' ? G.myOwner : null;
  const draw_ = s.winner === 'draw', title = draw_ ? 'Empate' : me === null ? `Gana ${fname(s.winner)}` : s.winner === me ? 'Victoria' : 'Derrota';
  const wc = draw_ ? 'var(--brass)' : FACTIONS[s.factions[s.winner]].color, why = s.endWhy === 'break' ? 'por punto de ruptura' : s.endWhy === 'random' ? `al final de la ronda ${s.turn}` : s.endWhy === 'turns' ? `tras ${s.turn - 1} rondas` : 'por aniquilación';
  const tv = Math.max(1, vp[0] + vp[1]), side = (o) => { const us = s.units.filter((u) => u.owner === o), alive_ = us.filter((u) => u.models > 0 && !u.fleeing).length; return `<div class="gos" style="--c:${FACTIONS[s.factions[o]].color}"><small>${fname(o)}</small><b>${vp[o]}</b><em>PV</em><span>${alive_}/${us.length} unidades en pie</span></div>`; };
  openModal(`<div class="card home go" style="--c:${wc}">
    <header class="hero gohero"><div class="emblem" style="background:${wc}">${draw_ ? IC.combat : IC.k_char}</div><div><h1>${title}</h1><p class="lead">${draw_ ? '' : esc(RES_NAME[s.result] || 'Victoria') + (me === null ? '' : ' de ' + esc(fname(s.winner))) + ' · '}${why}</p></div></header>
    <div class="hbody">
      <div class="goscore">${side(0)}<i>—</i>${side(1)}</div>
      <div class="gobar"><i style="width:${Math.round(100 * vp[0] / tv)}%;background:${FACTIONS[s.factions[0]].color}"></i><i style="width:${100 - Math.round(100 * vp[0] / tv)}%;background:${FACTIONS[s.factions[1]].color}"></i></div>
      <div class="gostats"><span><b>${Math.max(1, s.turn - (s.endWhy === 'turns' ? 1 : 0))}</b><small>rondas</small></span><span><b>${s.stats?.combats || 0}</b><small>combates</small></span><span><b>${s.stats?.charges || 0}</b><small>cargas</small></span><span><b>${s.stats?.shots || 0}</b><small>disparos</small></span><span><b>${s.stats?.spells || 0}</b><small>hechizos</small></span></div>
      ${note}
      <details class="adv" style="margin-top:12px"><summary><span>Supervivientes<small>Modelos que quedan de cada unidad</small></span>${IC.next}</summary><div class="grid2" style="margin-top:8px"><div><div class="lbl" style="margin-top:0">${fname(0)}</div>${survivors(0)}</div><div><div class="lbl" style="margin-top:0">${fname(1)}</div>${survivors(1)}</div></div></details>
    </div>
    <footer class="mfoot"><button class="btn primary cta" id="mNew">${IC.play}<span>Nueva partida</span></button><div class="mrow">${AXE_ORDER.indexOf(s.scn) >= 0 && AXE_ORDER.indexOf(s.scn) < AXE_ORDER.length - 1 ? `<button class="btn" id="mLink" title="Battle March, Escenarios enlazados: se juegan en orden y cada jugador mantiene su papel de atacante o defensor">Siguiente escenario enlazado</button>` : ''}${(s.scn === 'surprise' || s.scn === 'monolith') && G.mode === 'ai' && G.linkBase ? `<button class="btn" id="mLinked" title="Batallas enlazadas (Core p.269-273): las bajas de esta batalla afectan a los ejércitos de la siguiente">Siguiente batalla enlazada: ${s.scn === 'surprise' ? 'El Monolito Oscuro' : 'Última resistencia heroica'}</button>` : ''}<button class="btn" id="mAgain">Revancha</button><button class="btn" id="mView">Ver el campo</button></div></footer></div>`);
  if ($('mLinked')) $('mLinked').onclick = () => { // Batallas enlazadas: aplica las tablas de bajas / unidades destruidas a los ejércitos de la siguiente batalla
    const B = G.linkBase, d6f = () => 1 + Math.floor(Math.random() * 6), logs = [], cl = (a) => a.filter((e) => e.models > 0);
    let armies, nxt, zsw = 0;
    if (s.scn === 'surprise') { armies = [0, 1].map((o) => { const r = linkedArmy(s, o, B.armies[o], 2, d6f); logs.push(...r.log.map((t) => `${fname(o)}: ${t}`)); return cl(r.army); }); nxt = 'monolith'; }
    else { const w = s.winner === 'draw' ? (Math.random() < 0.5 ? 0 : 1) : s.winner; armies = [0, 1].map((o) => { if (o !== w) return B.orig[o].map((e) => ({ ...e })); const r = linkedArmy(s, o, B.armies[o], 3, d6f); logs.push(...r.log.map((t) => `${fname(o)}: ${t}`)); return cl(r.army); }); nxt = 'laststand'; zsw = w === 0 ? 1 : 0; }
    setup.scn = nxt; setup.zsw = zsw; setup.linked = { armies, orig: B.orig, stage: nxt === 'monolith' ? 2 : 3 };
    closeModal(); if (logs.length) toast(logs.slice(0, 6).join(' · '), 'ok'); startFromMenu();
  };
  if ($('mLink')) $('mLink').onclick = () => { setup.scn = AXE_ORDER[AXE_ORDER.indexOf(s.scn) + 1]; setup.zsw = s.atk === 1 ? 1 : 0; closeModal(); startFromMenu(); };
  if ($('mAgain')) $('mAgain').onclick = () => { closeModal(); startFromMenu(); };
  $('mNew').onclick = () => { closeModal(); showMenu(); };
  $('mView').onclick = closeModal;
  if ($('mCamp')) $('mCamp').onclick = campaignMenu;
  if ($('mPaint')) $('mPaint').onclick = () => { const c = store.get('tow_camp', null); if (c && c.kind === 'glory' && c.painted == null) { c.painted = true; if (c.g <= 2) c.cp += 1; store.set('tow_camp', c); toast(c.g <= 2 ? '+1 PC por jugar con el ejército pintado' : 'Sin PC: solo cuentan las dos primeras partidas de la fase', 'ok'); } $('mPaint').hidden = true; };
}
const AXE_ORDER = ['bm_weisnicht', 'bm_belcedas', 'bm_raiders', 'bm_karak', 'bm_sturdham', 'bm_gemelwald']; // Battle March p.22: escenarios enlazados de Axe Bite Pass, en el orden del libro
// ---------- campaña (Core Rulebook p.300: árbol de campaña y liga) ----------
const TREE = { meet: ['meet', 'flank', 'glory'], flank: ['flank', 'tower', 'gisoreux'], glory: ['glory', 'gisoreux', 'odo'], tower: ['tower', 'AM', 'Am'], gisoreux: ['gisoreux', 'Am', 'Bm'], odo: ['odo', 'Bm', 'BM'] };
const TREE_END = { AM: 'Victoria mayor del Jugador A', Am: 'Victoria menor del Jugador A', Bm: 'Victoria menor del Jugador B', BM: 'Victoria mayor del Jugador B' };
const PITCHED = ['glory', 'odo', 'flank', 'meet', 'gisoreux', 'tower'];
const scnName = (k) => (SCENARIOS[k]?.name || k).replace(/ \(.*\)/, '');
function campaignMenu() {
  const c = store.get('tow_camp', null);
  let body, foot, sub;
  const chip = (r) => `<span class="cres ${r === 'A' ? 'w' : r === 'B' ? 'l' : 'd'}">${r === 'A' ? 'Victoria' : r === 'B' ? 'Derrota' : 'Empate'}</span>`;
  if (!c) {
    sub = `${FNAME[setup.side]} · ${setup.limit} pts · contra la IA`;
    body = `<button class="ctile" id="cTree"><span class="ubadge big" style="--c:var(--brass)">${IC.move}</span><span><b>Árbol de campaña</b><small>Empieza en Encuentro. Cada resultado decide la siguiente batalla (Ataque de flanco, Batalla abierta, Mando y control, Paso de montaña, Punto de ruptura) hasta una victoria mayor o menor. Un empate repite la batalla.</small></span>${IC.next}</button>
    <button class="ctile" id="cLeague"><span class="ubadge big" style="--c:var(--brass)">${IC.army}</span><span><b>Liga</b><small>Una batalla contra cada uno de los demás ejércitos, con escenario por la tabla de Batalla Campal. Victoria aplastante 3 PC, victoria 2, empate 1, derrota 0; desempata el total de PV.</small></span>${IC.next}</button>
    <button class="ctile" id="cGlory"><span class="ubadge big" style="--c:var(--brass)">${IC.k_char}</span><span><b>Camino a la Gloria</b><small>Arcane Journal Westerland p.18-21: empiezas con 500 puntos y creces por fases; ganas Puntos de Campaña, Experiencia y Habilidades de veterano; las unidades y personajes pueden perderlas o morir.</small></span>${IC.next}</button>
    <div class="seg" id="cRounds" style="margin-top:10px">${[[1, 'Una vez contra cada ejército'], [2, 'Dos veces'], [3, 'Tres veces']].map(([v, t]) => `<button data-v="${v}" class="${(store.get('tow_lr', 1) || 1) === v ? 'on' : ''}">${t}</button>`).join('')}</div>
    <p class="muted" style="font-size:13px;margin:12px 2px 0">Las dos formas de enlazar batallas que propone el libro de reglas. Se juega con tu ejército actual.</p>`;
    foot = `<div class="mrow"><button class="btn" id="cBack">Volver</button></div>`;
  } else if (c.kind === 'tree') {
    const end = c.end; sub = `Árbol de campaña · ${FNAME[c.side]} contra ${FNAME[c.opp]}`;
    body = `<div class="ctl2">${c.hist.map((h) => `<div class="cstep done"><i></i><span><b>${esc(scnName(h.node))}</b>${chip(h.r)}</span></div>`).join('')}
      ${end ? `<div class="cstep end"><i></i><span><b>${TREE_END[end].replace('del Jugador A', 'tuya').replace('del Jugador B', 'de la IA')}</b></span></div>` : `<div class="cstep cur"><i></i><span><b>${esc(scnName(c.node))}</b><small>Siguiente batalla</small></span></div>
      <div class="cnext"><span>Si ganas<b>${TREE_END[TREE[c.node][1]] ? TREE_END[TREE[c.node][1]].replace(' del Jugador A', '').replace(' del Jugador B', ' de la IA') : esc(scnName(TREE[c.node][1]))}</b></span><span>Si pierdes<b>${TREE_END[TREE[c.node][2]] ? TREE_END[TREE[c.node][2]].replace(' del Jugador A', ' tuya').replace(' del Jugador B', ' de la IA') : esc(scnName(TREE[c.node][2]))}</b></span></div>`}</div>`;
    foot = `${end ? '' : `<button class="btn primary cta" id="cPlay">${IC.play}<span>Jugar ${esc(scnName(c.node))}</span></button>`}<div class="mrow"><button class="btn" id="cBack">Volver</button><button class="btn" id="cReset">Abandonar campaña</button></div>`;
  } else if (c.kind === 'glory') {
    const lim = 500 + (c.phase - 1) * c.inc, vs = Object.entries(c.vet).filter(([, r]) => r.abil.length || r.xp > 0), pend = c.pend || [];
    sub = `Camino a la Gloria · fase ${c.phase}/${c.phases} · ${lim} pts · ${FNAME[c.side]}`;
    body = `<div class="goscore"><div class="gos" style="--c:var(--brass)"><small>Puntos de campaña</small><b>${c.cp}</b><em>PC</em><span>${c.g} partida(s) esta fase${c.g >= 2 ? ' (ya no se ganan PC en esta fase)' : ''}</span></div></div>
      ${pend.length ? `<p class="muted" style="margin:10px 2px"><b>Tras la batalla</b>: gasta la Experiencia y resuelve las pérdidas.</p>${pend.map((q, i) => `<div class="crow"><span><b>${esc(q.name)}</b><small>${q.t === 'xp' ? `${q.xp} PX · ${q.isChar ? 'Comandante curtido' : 'Habilidades de veterano'}` : q.isChar ? 'Muerte y deshonra' : 'Pérdidas de batalla'}</small></span><button class="btn small" data-gl="${i}">${q.t === 'xp' ? 'Tirar' : 'Tirar D6'}</button></div>`).join('')}` : ''}
      ${vs.length ? `<p class="muted" style="margin:12px 2px 4px"><b>Veteranos</b></p>${vs.map(([k, r]) => `<div class="crow"><span><b>${esc(r.name)}</b><small>${esc(gloryTxt(r))}</small></span><em>${r.xp} PX</em></div>`).join('')}` : '<p class="muted" style="margin:12px 2px">Todavía no hay unidades con experiencia.</p>'}`;
    foot = `<button class="btn primary cta" id="cPlay">${IC.play}<span>Jugar (${lim} pts)</span></button><div class="mrow"><button class="btn" id="cBack">Volver</button><button class="btn" id="cPhase">${c.phase < c.phases ? 'Terminar fase' : 'Terminar campaña'}</button><button class="btn" id="cReset">Abandonar</button></div>`;
  } else {
    const done = c.i >= c.opps.length, tot = c.res.reduce((t, r) => t + r.cp, 0), vps = c.res.reduce((t, r) => t + r.vp, 0);
    sub = `Liga · ${FNAME[c.side]} · ${c.i}/${c.opps.length} batallas`;
    body = `<div class="goscore"><div class="gos" style="--c:var(--brass)"><small>Puntos de campaña</small><b>${tot}</b><em>PC</em><span>${c.res.reduce((t, r) => t + (r.pv ?? 0), 0)} PV totales (desempate) · ${vps >= 0 ? '+' : ''}${vps} de diferencia</span></div></div>
      <div class="bar" style="margin:10px 0 12px"><i style="width:${Math.round(100 * c.i / c.opps.length)}%;background:var(--brass)"></i></div>
      ${c.opps.map((o, i) => { const r = c.res[i]; return `<div class="crow ${i === c.i ? 'cur' : ''}"><i style="background:${FACTIONS[o].color}"></i><span><b>${esc(FNAME[o])}</b><small>${esc(scnName(c.scns[i]))}</small></span>${r ? `${chip(r.cp >= 2 ? 'A' : r.cp === 1 ? 'D' : 'B')}<em>${r.cp} PC</em>` : i === c.i ? '<em class="muted">siguiente</em>' : ''}</div>`; }).join('')}`;
    foot = `${done ? '' : `<button class="btn primary cta" id="cPlay">${IC.play}<span>Jugar contra ${esc(FNAME[c.opps[c.i]])}</span></button>`}<div class="mrow"><button class="btn" id="cBack">Volver</button><button class="btn" id="cReset">Abandonar liga</button></div>`;
  }
  openModal(`<div class="card home camp"><header class="hero"><div class="emblem">${IC.army}</div><div><h1>Campaña</h1><p class="lead">${sub}</p></div></header><div class="hbody">${body}</div><footer class="mfoot">${foot}</footer></div>`);
  const on = (id, fn) => { const e = $(id); if (e) e.onclick = fn; };
  on('cBack', showMenu);
  on('cTree', () => { store.set('tow_camp', { kind: 'tree', side: setup.side, opp: setup.opp, limit: setup.limit, node: 'meet', hist: [] }); campaignMenu(); });
  document.querySelectorAll('#cRounds button').forEach((b) => (b.onclick = () => { store.set('tow_lr', +b.dataset.v); campaignMenu(); }));
  on('cLeague', () => {
    let opps = Object.keys(FACTIONS).filter((k) => k !== setup.side); for (let i = opps.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opps[i], opps[j]] = [opps[j], opps[i]]; }
    { const n = store.get('tow_lr', 1) || 1, base = opps.slice(); opps = []; for (let r = 0; r < n; r++) opps.push(...base); } // Core p.300: cada participante juega contra cada otro una vez (o dos, o tres)
    store.set('tow_camp', { kind: 'league', side: setup.side, limit: setup.limit, opps, scns: opps.map(() => PITCHED[Math.floor(Math.random() * 6)]), i: 0, res: [] }); campaignMenu();
  });
  on('cGlory', () => { store.set('tow_camp', { kind: 'glory', side: setup.side, opp: setup.opp, phases: 4, inc: 500, phase: 1, g: 0, cp: 0, vet: {}, pend: [] }); campaignMenu(); });
  on('cPhase', async () => { const k = store.get('tow_camp', null); if (!k) return; if (k.phase >= k.phases) { openModal(`<div class="card"><h2>Camino a la Gloria terminado</h2><p>Puntos de campaña: <b>${k.cp}</b>. «Campeón de campeones» al participante con más PC.</p><div class="mrow"><button class="btn" id="gDone">Cerrar</button></div></div>`); $('gDone').onclick = () => { store.del('tow_camp'); campaignMenu(); }; return; } k.phase++; k.g = 0; store.set('tow_camp', k); toast(`Fase ${k.phase}: actualiza tu lista de muster (${500 + (k.phase - 1) * k.inc} pts)`, 'ok'); campaignMenu(); });
  document.querySelectorAll('[data-gl]').forEach((b) => (b.onclick = () => gloryRoll(+b.dataset.gl)));
  on('cReset', () => { store.del('tow_camp'); campaignMenu(); });
  on('cPlay', async () => {
    const k = store.get('tow_camp', null); if (!k) return;
    setup.mode = 'ai'; setup.side = k.side; setup.limit = k.limit;
    if (k.kind === 'glory') { setup.limit = 500 + (k.phase - 1) * k.inc; setup.comp = 'bm'; setup.opp = Object.keys(FACTIONS).filter((f) => f !== k.side)[Math.floor(Math.random() * (Object.keys(FACTIONS).length - 1))]; setup.scn = PITCHED[Math.floor(Math.random() * 6)]; }
    else if (k.kind === 'tree') { setup.opp = k.opp; setup.scn = TREE[k.node][0]; } else { setup.opp = k.opps[k.i]; setup.scn = k.scns[k.i]; }
    await startFromMenu(); if (G) { k.seed = G.s.seed; if (k.kind === 'glory') gloryStart(k, G.s); store.set('tow_camp', k); }
  });
}
// ---------- Camino a la Gloria (AJ Westerland p.18-21) ----------
const d6m = () => 1 + Math.floor(Math.random() * 6);
const GL_NAME = { ld: 'Veteranos curtidos (+1 Ld)', rr1: 'Guerreros experimentados (repetir 1 al impactar, una vez por partida)', ws: 'Maestros de armas (+1 HA)', bs: 'Maestros de armas (+1 HP)', rank: 'Formación de combate (+1 bonificación máxima por filas)', apM: 'Botín de guerra (+1 FP arma cuerpo a cuerpo)', apR: 'Botín de guerra (+1 FP arma de disparo)' };
const gloryTxt = (r) => r.abil.length ? r.abil.map((a) => GL_NAME[a]).join(' · ') : 'Sin habilidades';
function gloryStart(c, s) { // aplica las habilidades de veterano al ejército del jugador y la regla de Sangre fresca
  for (const [k, r] of Object.entries(c.vet)) {
    const u = s.units.find((x) => x.owner === 0 && x.selfKey === k);
    if (!u || u.type !== r.type) { if (!u && false) delete c.vet[k]; continue; }
    const us = u.startModels * (UNITS[u.type].us || 1);
    if (r.us != null && us - r.us >= 5 && r.abil.length && r.xp > 0) { const l = Math.min(r.xp, 1 + Math.floor(Math.random() * 3)); r.xp -= l; toast(`Sangre fresca: ${r.name} pierde ${l} PX`, 'ok'); }
    r.us = us;
  }
  for (const u of s.units) if (u.owner === 0 && c.vet[u.selfKey] && c.vet[u.selfKey].type !== u.type) delete c.vet[u.selfKey]; // Promoción: el personaje sustituido pierde todo
  applyVets(s, 0, c.vet);
}
function gloryEnd(c, s) {
  const r = s.winner === 'draw' ? 'D' : s.winner === 0 ? 'A' : 'B';
  let cp = r === 'A' ? (s.result === 'CV' ? 3 : 2) : r === 'D' ? 1 : 0; if (c.g >= 2) cp = 0; // CP solo por las dos primeras partidas de cada fase
  const rep = vetReport(s, 0); c.g++; c.pend = [];
  for (const q of rep) {
    const rec = c.vet[q.key] && c.vet[q.key].type === q.type ? c.vet[q.key] : (c.vet[q.key] = { type: q.type, name: q.name, xp: 0, abil: [], us: q.us, isChar: q.isChar });
    rec.name = q.name; rec.us = q.us; rec.isChar = q.isChar;
    if (!q.eligible) continue;
    rec.xp += q.xp;
    if (q.loss && rec.abil.length) c.pend.push({ t: 'loss', key: q.key, name: q.name, isChar: q.isChar });
    else if (!q.loss && rec.xp > 0) c.pend.push({ t: 'xp', key: q.key, name: q.name, isChar: q.isChar, xp: rec.xp });
  }
  c.cp += cp; c.pendCP = cp; c.painted = null;
  store.set('tow_camp', c);
  return `Camino a la Gloria: ${cp} PC por esta partida${c.g > 2 ? '' : ''}. <button class="btn small" id="mPaint">¿Ejército totalmente pintado? (+1 PC)</button>`;
}
function gloryChoose(title, opts) { return new Promise((res) => { openModal(`<div class="card"><h2>${esc(title)}</h2>${opts.map((o, i) => `<button class="ctile" data-gc="${i}"><span><b>${esc(o)}</b></span></button>`).join('')}</div>`); document.querySelectorAll('[data-gc]').forEach((b) => (b.onclick = () => res(+b.dataset.gc))); }); }
async function gloryRoll(i) {
  const c = store.get('tow_camp', null); if (!c || c.kind !== 'glory') return; const q = c.pend[i]; if (!q) return; const rec = c.vet[q.key];
  const lose = async () => { if (!rec.abil.length) return; const k = await gloryChoose(`${q.name}: elige la habilidad que pierde`, rec.abil.map((a) => GL_NAME[a])); rec.abil.splice(k, 1); };
  let msg;
  if (q.t === 'loss') {
    const r = d6m();
    if (q.isChar) { if (r <= 3) { msg = `Muerto: ${q.name} cae y pierde todas sus habilidades y PX. Retíralo de tu lista de muster.`; rec.abil = []; rec.xp = 0; rec.dead = true; } else if (r <= 5) { msg = 'Gravemente herido: pierde una habilidad.'; await lose(); } else { msg = 'Lección aprendida: +1 PX.'; rec.xp++; } }
    else if (r <= 3) { msg = 'Pérdidas insuperables: pierde todas sus habilidades y PX.'; rec.abil = []; rec.xp = 0; } else if (r === 4) { msg = 'Pérdidas terribles: pierde una habilidad.'; await lose(); } else if (r === 5) msg = 'Maltrecha: sin efecto.'; else { msg = 'Lección aprendida: +1 PX.'; rec.xp++; }
    msg = `D6 = ${r}. ${msg}`;
  } else {
    const dd = d6m(), tot = dd + rec.xp, ch = q.isChar; let res = null;
    if (ch) res = tot <= 6 ? 'none' : tot <= 11 ? 'ld' : tot <= 14 ? 'wb' : 'ap'; else res = tot <= 5 ? 'none' : tot <= 8 ? 'ld' : tot <= 10 ? 'rr1' : tot <= 12 ? 'wb' : tot <= 14 ? 'rank' : 'ap';
    const U = UNITS[rec.type], cnt = (a) => rec.abil.filter((x) => x === a).length;
    if (res === 'ld' && (U.Ld + cnt('ld') >= 10)) res = 'none';
    if (res === 'rank' && (U.maxRank == null || U.maxRank + cnt('rank') >= 4)) res = 'none';
    let txt = '';
    if (res === 'none') txt = ch ? 'Fanfarrón orgulloso: no gana habilidad y conserva sus PX.' : 'Guerreros reacios: no gana habilidad y conserva sus PX.';
    else {
      if (res === 'wb') { const o = []; if (U.WS + cnt('ws') < 10) o.push('ws'); if (U.BS > 0 && U.BS + cnt('bs') < 10) o.push('bs'); if (!o.length) res = 'none'; else { const k = o.length > 1 ? await gloryChoose(`${q.name}: Maestro de armas`, o.map((a) => GL_NAME[a])) : 0; res = o[k]; } }
      else if (res === 'ap') { const o = []; if ((U.melee?.ap || 0) + cnt('apM') < 5) o.push('apM'); if (U.ranged && (U.ranged.ap || 0) + cnt('apR') < 5) o.push('apR'); if (!o.length) res = 'none'; else { const k = o.length > 1 ? await gloryChoose(`${q.name}: Botín de guerra`, o.map((a) => GL_NAME[a])) : 0; res = o[k]; } }
      if (res === 'none') txt = 'Sin efecto (ya está al máximo): conserva sus PX.'; else { rec.abil.push(res); rec.xp = 0; txt = GL_NAME[res]; }
    }
    msg = `D6 = ${dd} + ${q.xp} PX = ${tot}. ${txt}`;
  }
  c.pend.splice(i, 1); store.set('tow_camp', c);
  openModal(`<div class="card"><h2>${esc(q.name)}</h2><p>${esc(msg)}</p><div class="mrow"><button class="btn primary" id="gOk">OK</button></div></div>`); $('gOk').onclick = campaignMenu;
}
function campaignResult() {
  const c = store.get('tow_camp', null), s = G.s;
  if (!c || c.seed !== s.seed) return '';
  c.seed = null;
  const r = s.winner === 'draw' ? 'D' : s.winner === 0 ? 'A' : 'B';
  let txt;
  if (c.kind === 'glory') txt = gloryEnd(c, s);
  else if (c.kind === 'tree') {
    c.hist.push({ node: c.node, r });
    if (r !== 'D') { const nx = TREE[c.node][r === 'A' ? 1 : 2]; if (TREE_END[nx]) c.end = nx; else c.node = nx; }
    txt = c.end ? `Campaña terminada: ${TREE_END[c.end]}.` : r === 'D' ? 'Empate: la batalla se repite.' : `Siguiente batalla: ${scnName(c.node)}.`;
  } else {
    const diff = s.vp[0] - s.vp[1], cp = r === 'A' ? (s.result === 'CV' ? 3 : 2) : r === 'D' ? 1 : 0;
    c.res.push({ opp: c.opps[c.i], scn: c.scns[c.i], cp, vp: diff, pv: s.vp[0] }); c.i++;
    txt = `+${cp} Puntos de Campaña (total ${c.res.reduce((t, x) => t + x.cp, 0)}).${c.i >= c.opps.length ? ' ¡Liga terminada!' : ''}`;
  }
  store.set('tow_camp', c);
  return `<div class="note">${txt} <button class="btn small" id="mCamp">Ver campaña</button></div>`;
}

function survivors(o) {
  return G.s.units.filter((u) => u.owner === o).map((u) => `<div class="muted">${esc(u.name)}: <b style="color:var(--ink)">${u.models}</b>/${u.startModels}</div>`).join('');
}

// ---------- modales ----------
function openModal(html) { const m = $('modal'); m.innerHTML = html; m.hidden = false; }
function closeModal() { $('modal').hidden = true; $('modal').innerHTML = ''; }
// ---------- cartas de hechizo (mod de TTS; solo en el PWA/zip con hd/cards) ----------
const SP_TYPE = { conveyance: 'Traslado (movimiento)', enchant: 'Encantamiento (aliados)', assail: 'Asalto (unidad trabada)', missile: 'Proyectil', buff: 'Mejora (aliados)', augment: 'Aumento (aliados)', hex: 'Maleficio (enemigos)', direct: 'Directo', vortex: 'Vórtice', remains: 'Permanece en juego' };
function cardBtn(k) { return (SPELLS[k] || ITEMS[k]) ? ` <span class="cardbtn" role="button" tabindex="0" title="Ver carta del hechizo" data-card="${k}">🃏</span>` : ''; }
// Carta de texto de un hechizo (libro: Core p.110 generación de hechizos; p.108-109 tirada de lanzamiento, Invocación Perfecta y Fallo)
function spellCardHTML(k, compact) {
  const sp = SPELLS[k]; if (!sp) return '';
  const lore = LORES[sp.lore]; const sigOf = lore && lore.sig === k;
  const rows = [['Saber', esc(loreName(sp.lore)) + (sigOf ? ' (hechizo de firma)' : '')], ['Valor de lanzamiento', sp.cv ? sp.cv + '+ (2D6 + Nivel/2 del mago, redondeado hacia arriba)' : 'ligado: ' + (sp.bound ? 'Nivel de Poder ' + sp.bound : '—')], ['Tipo', esc(SP_TYPE[sp.type] || sp.type || '—')], ['Alcance', sp.range ? sp.range + '"' : (sp.type === 'assail' ? 'unidad trabada' : 'el propio mago / unidad')]];
  if (sp.hits) rows.push(['Impactos', esc(String(sp.hits)) + (sp.s ? ' · F' + sp.s : '') + (sp.ap ? ' · FP −' + sp.ap : '') + (sp.flaming ? ' · flamígeros' : '')]);
  return `<div class="spell-txtcard"><h3>${esc(sp.name)}</h3><table class="kv">${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p style="white-space:pre-wrap;line-height:1.4">${esc(sp.text || '')}</p>${compact ? '' : '<p class="muted" style="font-size:.85em">Tirada de lanzamiento: 2D6 + Nivel/2 (redondeado hacia arriba; FAQ Core p.108, que sustituye al «+ Nivel» del libro) contra el valor de lanzamiento. Doble 6 natural: Invocación Perfecta (se lanza siempre y no se puede dispersar, Core p.109). Doble 1 natural: Fallo mágico (tabla de Fallos, Core p.109). Para dispersar: dispersión de Mago (2D6 + Nivel/2 del mago a su alcance, FAQ Core p.110) o dispersión del Destino (2D6 sin sumar), que debe SUPERAR el resultado del lanzamiento; doble 6 natural al dispersar = Desatadura; doble 1 con dispersión de Mago = Superado en el Arte (Core p.110).</p>'}</div>`;
}
function loreName(l) { return LORE_NAME[l] || ({ battle: 'Magia de Batalla', lady: 'Saber de la Dama', shadowlands: 'Tierras Sombrías', wilds: 'Saber de los Bosques', elementalism: 'Elementalismo' })[l] || String(l || '—'); }
function showLoreTable(cid) {
  const c = G.s.units[cid]; if (!c || !c.lore) return; const L = LORES[c.lore]; if (!L) return; const A = c.spellAlt;
  const pool = [...(L.pool || [])];
  const row = (k, i) => { const sp = SPELLS[k]; if (!sp) return ''; const got = c.spells.includes(k), rolled = A && A.rolls.includes(k); return `<tr${got ? ' class="hit"' : ''}><td>${i}</td><td>${esc(sp.name)}${cardBtn(k)}</td><td>${sp.cv ? sp.cv + '+' : 'lig.'}</td><td>${sp.range ? sp.range + '"' : '—'}</td><td>${got ? (rolled ? 'tirado' : 'firma') : ''}</td></tr>`; };
  openModal(`<div class="card spcard"><h3>${esc(loreName(c.lore))}</h3><p class="muted">Core p.106-107 (Spells & Spell Generation): el Mago de Nivel N tira N D6 en la tabla del Saber que eligió en su lista, repitiendo los resultados duplicados, y puede descartar UNO de los hechizos tirados para tomar el hechizo de firma de su Saber. Casilla resaltada: hechizo que conoce ${esc(c.name)}.</p><table class="kv"><tr><th>D6</th><th>Hechizo</th><th>VL</th><th>Alc.</th><th></th></tr>${row(L.sig, 'firma')}${pool.map((k, i) => row(k, i + 1)).join('')}</table><p class="muted" style="font-size:.85em">Toca 🃏 para ver la carta con el efecto completo.</p><button class="btn" id="spcClose">Cerrar</button></div>`);
  $('spcClose').onclick = closeModal;
}
function showSpellCard(k) {
  const sp = SPELLS[k] || ITEMS[k]; if (!sp) return;
  if (!SPELLS[k]) { showRuleText(sp.name, sp.text || ''); return; }
  const img = SPELLCARDS[k] ? `<img src="hd/cards/${k}.webp" alt="${esc(sp.name)}" onerror="this.remove()" style="max-width:100%;border-radius:6px;margin-bottom:6px">` : '';
  openModal(`<div class="card spcard">${img}${spellCardHTML(k)}<button class="btn" id="spcClose">Cerrar</button></div>`);
  $('spcClose').onclick = closeModal;
}
// v843s: ⓘ de filas: qué ganas y qué pierdes al cambiar el ancho de fila (solo reglas de Core/FAQ locales; cada punto con su página)
function showRowsInfo(u, delta, ghost) {
  const d = D(u), cur = ghost && ghost.files ? ghost.files : (u.lance ? dims(u).files : u.files);
  const info = (n) => { const x = { ...u, files: n, lance: false }, dm = dims(x), col = isColumn(x), rb = rankBonus(x), us = usOf(x), ps = ['regInf', 'heavyInf'].includes(d.tt) && !col && x.models > dm.files, fr = Math.min(dm.files, x.models); return { n, dm, col, rb, us, ps, fr, form: col ? 'Columna de marcha' : 'Orden de combate', co: !col && has(x, 'closeOrder') && !has(x, 'skirmish') && dm.files >= dm.ranks && us >= 10 }; };
  const opts = [['Ahora', cur], ...(cur > 1 ? [['− fila (más estrecho)', cur - 1]] : []), ...(cur < u.models ? [['+ fila (más ancho)', cur + 1]] : [])];
  const I = opts.map(([l, n]) => ({ l, ...info(n) })), a = I[0];
  const mx = d.maxRank ?? 0, mr = d.minRank ?? 0, f = (v) => String(v), yn = (v) => (v ? 'Sí' : 'No');
  const R = [['Modelos por fila (frente)', (x) => f(x.dm.files)], ['Filas', (x) => f(x.dm.ranks)], ['Frente × fondo', (x) => `${x.dm.w.toFixed(1)}" × ${x.dm.d.toFixed(1)}"`], ['Formación', (x) => x.form], ['Bonif. por filas (máx. +' + mx + '; cuenta con ' + mr + '+ modelos/fila)', (x) => '+' + x.rb], ['Combaten en la 1.ª fila', (x) => f(x.fr)], ['Pueden disparar (1.ª fila)', (x) => f(x.fr)], ['¿Puede cargar?', (x) => (x.col ? 'No' : 'Sí')], ['2.ª fila combate (Presión del combate)', (x) => yn(x.ps)], ['+1 resultado (Orden de combate, US 10+)', (x) => yn(x.co)]];
  const tb = { k: 'grid', cap: `Formación actual (${cur} modelos por fila) y las dos opciones`, rh: '', ch: 'Comparación', cols: I.map((x) => x.l), rows: R.map(([, g]) => I.map(g)), rhs: R.map((r) => r[0]), hr: -1, hc: 0, note: `${u.name}: ${u.models} modelos. Tipo de tropa: ${d.tt ? (TROOP[d.tt]?.name || d.tt) : '—'}.` };
  const eff = [];
  for (const b of I.slice(1)) {
    const dr = b.dm.ranks - a.dm.ranks, dw = b.dm.files - a.dm.files, t = [];
    t.push(dw > 0 ? `${b.l}: frente +${dw} modelo(s): más modelos combaten y disparan, ${dr} fila(s)` : `${b.l}: frente ${dw} modelo(s): menos modelos combaten y disparan, ${dr > 0 ? '+' : ''}${dr} fila(s)`);
    if (b.rb !== a.rb) t.push(`bonificación por filas ${a.rb > b.rb ? 'pierdes' : 'ganas'} ${Math.abs(b.rb - a.rb)} (de +${a.rb} a +${b.rb})`);
    if (b.col !== a.col) t.push(b.col ? 'pasa a Columna de marcha (sin bonificación ni carga; triplica el Movimiento al marchar, Core p.101)' : 'sale de la Columna de marcha (puede cargar y reclamar bonificación por filas, Core p.101)');
    eff.push(t.join('; ') + '.');
  }
  const rules = [
    ['Formación y filas (Core p.100-101)', 'Una unidad en Orden cerrado se coloca en filas (horizontales) y columnas (verticales); debe haber los mismos modelos en cada fila y solo la última puede tener menos.'],
    ['Orden de combate y Columna de marcha (Core p.101)', 'Más ancha que profunda, o cuadrada, es Orden de combate y puede reclamar bonificación por filas. Más profunda que ancha es Columna de marcha: sin bonificación por filas, no puede cargar, pero triplica su Movimiento al marchar.'],
    ['Bonificación por filas (Core p.101 y p.151)', `+1 de resultado de combate por cada fila tras la primera, hasta el máximo del tipo de tropa (aquí +${mx}); una fila solo cuenta con ${mr}+ modelos (tabla de tipos de tropa, p.105). Se puede reclamar con una última fila incompleta si tiene suficientes modelos. Una unidad Desorganizada no la reclama.`],
    ['Fila de combate (Core p.145-146; FAQ Core)', 'Pelean todos los modelos de la fila (o columna) con algún modelo en contacto de peana con el enemigo; cuanto más ancho el frente, más modelos pelean.'],
    ['Ataques de apoyo (Core p.145-146)', 'Un modelo con arma de apoyo ataca si está justo detrás de un amigo que está en la fila de combate; no se puede en flanco o retaguardia ni desde la propia fila de combate.'],
    ['Disparo y línea de visión (Core p.103 y p.136-137)', 'Normalmente solo disparan los modelos de la primera fila y debe trazarse línea de visión de cada uno al objetivo. Fuego en volea permite disparar a la mitad de cada fila trasera (redondeando hacia arriba).'],
    ['Redistribuir las filas (Core p.125)', 'Reformar para quitar o añadir hasta cinco modelos al frente cuesta la mitad del Movimiento.'],
    ['Presión del combate y Orden de combate (FAQ Core p.101 y p.190)', 'La infantería regular y pesada en Orden de combate (salvo el turno en que carga) tiene una segunda fila que también combate; con Fuerza de Unidad 10+ en Orden de combate se reclama +1 al resultado del combate.']].map(([t, x]) => `<p><b>${esc(t)}.</b> ${esc(x)}</p>`).join('');
  openModal(`<div class="card spcard rowsinfo"><h3>Filas de ${esc(u.name)}</h3><div class="tbwrap0">${tblHTML(tb)}</div><ul class="rw-eff">${eff.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${rules}<p class="muted" style="font-size:.85em">Solo se citan reglas del reglamento (Core) y sus FAQ locales; las páginas son las del libro.</p><button class="btn primary" id="rwClose">Cerrar</button></div>`);
  $('rwClose').onclick = closeModal;
}
// ---------- v843r: GENERACIÓN DE HECHIZOS ANTES DEL DESPLIEGUE (Core p.106-107) y MANO DE CARTAS DE MAGIA ----------
// Libro (Core p.106-107, «Spells & Spell Generation» = «Hechizos y generación de hechizos»): «Players randomly generate spells for each of their Wizards before armies are deployed. If your army contains more than one Wizard, you may generate spells for each in an order of your choosing. [...] roll a number of D6 equal to their Level of Wizardry, re-rolling any duplicate results. [...] If you wish, your Wizard may then discard one of these randomly generated spells and instead select the signature spell of their chosen Lore of Magic.» El Saber se elige al escribir la lista («you must choose one of these Lores when writing your muster list»).
// Presentación: las caras ya están decididas por la semilla (createGame no cambia: misma partida con/sin avisos, guardados y repeticiones idénticos); la ventana previa enseña la tabla del Saber SIN resultado y solo al pulsar «Tirar» se revelan las caras con su fila resaltada; la elección de descarte sí es una acción real (spellPick).
// v843u: lista completa de hechizos de un Saber (seis numerados + firma + los de la regla especial del Mago) con VL, tipo, alcance y efecto completo en español; se abre desde el botón «ⓘ Hechizos» junto a cada Saber
function loreSpellsHTML(c, lore, A) {
  const L = LORES[lore]; if (!L) return '';
  const rng = (sp) => (sp.range ? sp.range + '"' : sp.type === 'assail' ? 'cuerpo a cuerpo' : 'propio');
  const one = (lab, k) => { const sp = SPELLS[k]; if (!sp) return ''; return `<div class="spl"><div class="splh"><span class="spln">${esc(lab)}</span><b>${esc(sp.name)}</b></div><div class="splm">${sp.cv ? 'VL ' + sp.cv + '+' : 'Ligado'} · ${esc(SP_TYPE[sp.type] || sp.type || '—')} · Alcance: ${esc(rng(sp))}</div><div class="splt">${esc(sp.text || '')}</div></div>`; };
  const extra = (A?.neh || []).map((k) => one('Esp.', k)).join('');
  return `<p class="nmsg"><b>${esc(loreName(lore))}</b><br>Hechizos de este Saber para ${esc(c.name)}. VL = valor de lanzamiento (se necesita sacar ese número o más).</p>${L.pool.slice(0, 6).map((k, i) => one(String(i + 1), k)).join('')}${one('Firma', L.sig)}${extra ? `<p class="tbcap">Hechizos de su regla especial (se toman en lugar de la firma al descartar un hechizo, FAQ)</p>${extra}` : ''}`;
}
function sgInfo(html) {
  return new Promise((res) => {
    let el = $('spellPop'); if (!el) { el = document.createElement('div'); el.id = 'spellPop'; document.body.appendChild(el); }
    el.innerHTML = `<div class="card ncard tbcard sgcard spcardlist" role="dialog" aria-modal="true"><div class="tbscroll">${html}</div><div class="nrow sgrow"><button class="btn primary" data-close="1">Volver</button></div></div>`;
    el.hidden = false;
    for (const ev of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(ev, (e) => e.stopPropagation());
    el.querySelector('[data-close]').addEventListener('click', (e) => { e.stopPropagation(); el.hidden = true; el.innerHTML = ''; res(); });
  });
}
function sgPop(o) {
  return new Promise((res) => {
    let el = $('reactPop'); if (!el) { el = document.createElement('div'); el.id = 'reactPop'; document.body.appendChild(el); }
    // btns: [texto, principal, Saber-de-ayuda?, soloAyuda?]: con Saber se añade al lado «ⓘ Hechizos» (abre la lista sin resolver la ventana)
    const bt = o.btns.map(([l, p, inf, only], i) => only ? `<button class="btn sgi sgonly" data-sp="${esc(inf)}">${esc(l)}</button>` : inf ? `<div class="sgpair"><button class="btn${p ? ' primary' : ''}" data-i="${i}">${esc(l)}</button><button class="btn sgi" data-sp="${esc(inf)}" title="Ver los hechizos de este Saber">ⓘ Hechizos</button></div>` : `<button class="btn${p ? ' primary' : ''}" data-i="${i}">${esc(l)}</button>`).join('');
    el.innerHTML = `<div class="card ncard tbcard sgcard" role="dialog" aria-modal="true"><div class="tbscroll"><p class="nmsg"><b>${esc(o.title)}</b><br>${esc(o.msg)}</p>${(o.tbls || []).map(tblHTML).join('')}</div><div class="nrow sgrow">${bt}</div></div>`;
    el.hidden = false;
    for (const ev of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(ev, (e) => e.stopPropagation());
    el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); el.hidden = true; el.innerHTML = ''; res(+b.dataset.i); }));
    el.querySelectorAll('[data-sp]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); if (o.info) sgInfo(o.info(b.dataset.sp)); }));
  });
}
const spLine = (k, full) => { const sp = SPELLS[k]; if (!sp) return String(k); return `${sp.name} — ${sp.cv ? 'VL ' + sp.cv + '+' : 'ligado'} · ${SP_TYPE[sp.type] || sp.type || '—'} · ${sp.range ? sp.range + '"' : sp.type === 'assail' ? 'cuerpo a cuerpo' : 'propio'}${full ? '. ' + (sp.text || '') : ''}`; };
function loreTbl(c, hiIdx, full) {
  const L = LORES[c.lore]; const rows = [...L.pool.slice(0, 6).map((k, i) => [String(i + 1), spLine(k, full && hiIdx.includes(i))]), ['Firma', spLine(L.sig, full && hiIdx.includes(-1))]];
  return { k: 'list', cap: `Tabla del Saber: ${loreName(c.lore)} (seis hechizos numerados y uno de firma)`, dice: 'D6', rows, hi: hiIdx.map((i) => (i < 0 ? 6 : i)), note: hiIdx.length ? 'Filas resaltadas: los números que has sacado.' : 'Aún no has tirado: aquí se leerá el resultado de cada D6.' };
}
const pl1 = (n, one, many) => (n === 1 ? one : many.replace('{n}', n)); // concordancia 1 hechizo / N hechizos
async function sgWizard(c0) {
  const s = G.s, id = c0.id, find = () => [...s.units.flatMap((h) => [h, ...(h.joined || [])]), ...(s.reserves || []), ...(s.pend || []).flatMap((h) => [h, ...(h.joined || [])])].find((x) => x.id === id) || c0, nm = (k) => SPELLS[k]?.name || k;
  let c = find();
  const N = c.spellAlt.rolls.length, d = D(c);
  let alts = []; try { alts = loresForWiz(s, c.owner, d, c.items || []).filter((l) => LORES[l]); } catch { /* */ }
  // v843s: elección del Saber ANTES de la tirada, con botones en el propio popup (el libro la sitúa «al escribir la lista»; el motor no tiene ese paso: se ofrece aquí por la libertad de elección del jugador)
  for (let guard = 0; guard < 12; guard++) {
    c = find(); const A = c.spellAlt, L = LORES[c.lore], canPick = !!(c.loreAlt && c.loreAlt.opts.length > 1);
    const opts = canPick ? c.loreAlt.opts : [];
    const lorePart = canPick ? `Elige su Saber (Core p.106 lo sitúa al escribir la lista; el juego no tiene ese paso, así que se elige aquí). Actual: ${loreName(c.lore)}. Pulsa «ⓘ Hechizos» para ver los hechizos de cada Saber.` : `Su Saber, elegido al escribir la lista (Core p.106), es ${loreName(c.lore)}${alts.length > 1 ? '; Saberes que puede elegir este Mago: ' + alts.map(loreName).join(', ') : ''}.`;
    const btns = [...opts.map((l) => [(l === c.lore ? '✓ ' : '') + loreName(l), false, l]), [`Tirar ${N}D6 en ${loreName(c.lore)}`, true], ...(canPick ? [] : [[`ⓘ Ver los hechizos de ${loreName(c.lore)}`, false, c.lore, true]])];
    const r = await sgPop({ title: `Hechizos de ${c.name}`, msg: `Core p.106-107: los hechizos se generan al azar ANTES de desplegar. Nivel ${N}: tira ${N} D6 en la tabla del Saber (sin repetidos); cada número es un hechizo. ${lorePart} Después podrá descartar UNO de los tirados y tomar la firma (${nm(L.sig)}).`, tbls: [loreTbl(c, [], false)], btns, info: (lk) => loreSpellsHTML(c, lk, A) });
    if (r >= opts.length) break;
    if (opts[r] !== c.lore) dispatch({ t: 'loreSet', id, lore: opts[r], keep: 1 });
  }
  c = find(); const A = c.spellAlt, L = LORES[c.lore];
  const faces = A.rolls.map((k) => L.pool.indexOf(k)), hi = faces.filter((f) => f >= 0), sigN = nm(A.sig);
  const lst = A.rolls.map(nm).join(', ');
  const r = await sgPop({ title: `Resultado: ${c.name}`, msg: `Has sacado ${faces.map((f) => f + 1).join(', ')}${N > 1 ? ' (sin repetidos)' : ''}: ${lst}. ¿Qué haces? Core p.107: «Si lo deseas, tu Mago puede entonces descartar uno de estos hechizos generados al azar y, en su lugar, elegir el hechizo de firma de su Saber de Magia elegido.» El hechizo de firma es un hechizo propio de cada Saber: no se tira en la tabla y el Mago puede tomarlo en lugar de uno de los tirados (puedes hacerlo con cualquier Mago de tu ejército).`, tbls: [loreTbl(c, hi, true)], btns: [...A.rolls.map((k) => [`Cambiar ${nm(k)} por el hechizo de firma ${sigN}`, false]), [`Quedarme con ${pl1(N, 'el hechizo tirado', 'los {n} hechizos tirados')} (${lst})`, false]] });
  if (r < N) {
    const k = A.rolls[r]; let take = null;
    if ((A.neh || []).length) { const t = await sgPop({ title: `En lugar de ${nm(k)}`, msg: `El Saber de ${c.name} permite tomar, en lugar de la firma, otro hechizo (regla de su ejército). Elige cuál:`, tbls: [], btns: [[`La firma: ${nm(A.sig)}`, true], ...A.neh.map((n) => [nm(n), false])] }); take = t > 0 ? A.neh[t - 1] : null; }
    dispatch({ t: 'spellPick', id: c.id, drop: k, ...(take ? { take } : {}) });
  } else dispatch({ t: 'spellPick', id: c.id, drop: 'sig' });
}
// v843s: decisión pendiente sobre los hechizos de un Mago, siempre en un popup (Saber + firma; Lore Legacy; Aquelarre; Tomo de los Dioses Oscuros)
async function spDecide(cid) {
  const s = G.s, c = [...s.units.flatMap((h) => [h, ...(h.joined || [])]), ...(s.reserves || []), ...(s.pend || []).flatMap((h) => [h, ...(h.joined || [])])].find((x) => x.id === cid); if (!c || s.ready[c.owner]) return;
  const nm = (k) => SPELLS[k]?.name || k;
  if (c.spellAlt && !c.spellAlt.done) { G.sg = G.sg || {}; G.sg['d' + c.id] = 1; await sgWizard(c); renderAll(); return; }
  G.sg = G.sg || {}; if (!c.spellAlt) G.sg['x' + c.id] = 1; // decisión tomada: la ficha ya no la ofrece
  if (c.legAlt?.orig) { const A = c.legAlt, ks = A.orig.filter((k) => k !== A.repl), r = await sgPop({ title: `Lore Legacy: ${c.name}`, msg: `Hechizos tirados: ${A.orig.filter((k) => k !== A.repl || A.last === A.repl).map(nm).join(', ')}. Puedes descartar uno y tomar ${nm(A.repl)} (hechizo del Saber de tu facción), o conservar los tirados.`, tbls: [], btns: [...ks.map((k) => [`Cambiar ${nm(k)} por ${nm(A.repl)}`, false]), ['Conservar los hechizos tirados', true]] }); dispatch({ t: 'legPick', id: c.id, drop: r < ks.length ? ks[r] : 'none' }); renderAll(); return; }
  if (c.covenAlt) { const A = c.covenAlt, r = await sgPop({ title: `Aquelarre: ${c.name}`, msg: `Hechizo aleatorio: ${nm(A.rolled)}. FAQ de Fuego y Fe: tras verlo, puedes descartarlo y tomar el hechizo de firma de uno de los dos Saberes.`, tbls: [], btns: [[`Quedarme con ${nm(A.rolled)}`, true], ...A.sigs.map((k) => [`Cambiarlo por el hechizo de firma ${nm(k)}`, false])] }); dispatch({ t: 'covenPick', id: c.id, pick: r === 0 ? 'rolled' : A.sigs[r - 1] }); renderAll(); return; }
  if (c.tomeAlt) { const sig = LORES[c.lore]?.sig, opts = []; for (const k of c.spells.filter((x) => x !== sig)) for (const n of c.tomeAlt.pool.filter((x) => !c.spells.includes(x))) opts.push([k, n]);
    const r = await sgPop({ title: `Tomo de los Dioses Oscuros: ${c.name}`, msg: `Conoce: ${c.spells.map(nm).join(', ')}. Por cada hechizo que descartes, puedes tomar uno del Saber del Caos.`, tbls: [], btns: [...opts.map(([k, n]) => [`Cambiar ${nm(k)} por ${nm(n)}`, false]), ['No cambiar nada', true]] }); if (r < opts.length) dispatch({ t: 'tomePick', id: c.id, drop: opts[r][0], take: opts[r][1] }); renderAll(); }
}
async function spellGenFlow(owner) {
  if (!G || window.__TOW_NOACK || (window.__TOW_AUTOACK && !window.__TOW_SG)) return;
  G.sg = G.sg || {}; if (G.sg[owner]) return; G.sg[owner] = 1;
  const s = G.s, seen = new Set(), todo = () => [...s.units.flatMap((h) => [h, ...(h.joined || [])]), ...(s.reserves || []), ...(s.pend || [])].filter((c) => c.owner === owner && c.spellAlt && !c.spellAlt.done && c.lore && LORES[c.lore] && !G.sg['d' + c.id] && !seen.has(c.id) && (seen.add(c.id), true));
  let rest = todo(); if (!rest.length || s.phase !== 'deploy' || s.ready[owner]) return;
  while (rest.length) {
    let i = 0;
    if (rest.length > 1) i = await sgPop({ title: 'Orden de generación de hechizos', msg: `Core p.106: «Si tu ejército contiene más de un Mago, puedes generar los hechizos de cada uno en el orden que elijas.» Elige con qué Mago empiezas (${rest.length} Magos con hechizos por generar).`, tbls: [], btns: rest.map((c) => [`${c.name} (Nivel ${c.spellAlt.rolls.length}, ${loreName(c.lore)})`, false]) });
    const c = rest.splice(i, 1)[0]; G.sg['d' + c.id] = 1; await sgWizard(c); renderAll();
  }
}
// Mano de cartas de magia: una carta por hechizo del Mago (y de los personajes unidos) con su estado en esta fase y botón «Lanzar»
function showSpellHand(u) {
  const s = G.s, casters = [u, ...(u.joined || []).filter((j) => j.models > 0)].filter((c) => D(c).wizard || spellKeys(c).length), mine = u.owner === viewer();
  const cards = casters.flatMap((c) => spellKeys(c).map((k) => ({ c, k }))).filter((x) => SPELLS[x.k]);
  const html = cards.map(({ c, k }) => {
    const sp = SPELLS[k]; let why = '';
    if (!mine) why = 'No es tu unidad';
    else { const ts = spellTargets(s, c, k), ok = ts.filter((t) => !castCheck(s, c, k, t)); if (!ok.length) why = ts.length ? castCheck(s, c, k, ts[0]) || 'Sin objetivo válido' : (castCheck(s, c, k, null) || 'Sin objetivos válidos'); }
    return `<div class="hcard${why ? ' off' : ''}">${spellCardHTML(k, true)}<div class="hst">${esc(casters.length > 1 ? c.name + ' · ' : '')}${why ? esc(why) : 'Se puede lanzar ahora'}</div><button class="btn ${why ? '' : 'primary'}" data-hl="${c.id}|${k}" ${why ? 'disabled' : ''}>Lanzar ${esc(sp.name)}</button></div>`;
  }).join('');
  openModal(`<div class="card spcard hand"><h3>Cartas de magia — ${esc(u.name)}</h3><p class="muted">Cada carta es un hechizo que conoce. Se lanza con 2D6 + Nivel/2 (FAQ Core p.108) contra su valor de lanzamiento. Elige una carta y toca «Lanzar»; después eliges el objetivo en el mapa. Fase actual: ${esc(PHASE_NAME[s.phase] || s.phase)}.</p>${html || '<p class="muted">Esta unidad no conoce hechizos.</p>'}<button class="btn" id="spcClose">Cerrar</button></div>`);
  $('spcClose').onclick = closeModal;
  document.querySelectorAll('#modal [data-hl]').forEach((b) => (b.onclick = () => { const [cid, k] = b.dataset.hl.split('|'); closeModal(); UI.sel = u.id; unitAct('cast', cid === u.id ? k : cid + '|' + k); }));
}
// Habilidades, objetos y reglas de la ficha: al tocar una etiqueta se abre un popup con el texto de la regla
function showRuleText(name, text) {
  openModal(`<div class="card spcard"><h3>${esc(name)}</h3><p style="white-space:pre-wrap;line-height:1.45">${esc(text)}</p><button class="btn primary" id="rtClose">Cerrar</button></div>`);
  $('rtClose').onclick = closeModal;
}
document.addEventListener('click', (e) => {
  const t = e.target.closest && e.target.closest('#panelBody .chip[title]'); if (!t || e.target.closest('[data-card]')) return;
  const tx = t.getAttribute('title'); if (!tx) return; e.preventDefault(); e.stopPropagation();
  showRuleText(t.textContent.replace(/^[✦⚑⚔♪◈]\s*/, '').trim(), tx);
}, true);
document.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-card]'); if (!t) return; e.preventDefault(); e.stopPropagation(); showSpellCard(t.dataset.card); }, true);

// ---------- avisos automáticos (popup + OK): rules.js encola en s.notices vía notify()/announce() ----------
function showNotices() {
  const s = G && G.s; if (!s || !Array.isArray(s.notices) || !s.notices.length) return;
  if (UI.noticeOpen) return;
  const n = s.notices.shift(); UI.noticeOpen = true;
  let el = $('noticePop'); if (!el) { el = document.createElement('div'); el.id = 'noticePop'; document.body.appendChild(el); }
  const more = s.notices.length;
  el.innerHTML = `<div class="card ncard" role="alertdialog" aria-modal="true"><p class="nmsg">${esc(n.t)}</p><div class="nrow">${more ? `<small>${more} aviso${more > 1 ? 's' : ''} más</small>` : ''}<button class="btn primary" id="noticeOk">OK</button></div></div>`;
  el.hidden = false;
  const ok = $('noticeOk'); ok.focus();
  ok.addEventListener('click', (ev) => { ev.stopPropagation(); UI.noticeOpen = false; el.hidden = true; el.innerHTML = ''; showNotices(); });
  for (const t of ['pointerdown', 'touchstart', 'mousedown']) el.addEventListener(t, (ev) => ev.stopPropagation());
}
function showCurtain() {
  const who = G.s.phase === 'deploy' ? G.deployPlayer : G.s.active;
  openModal(`<div class="card curtain"><h1>${fname(who)}</h1><p class="lead">${G.s.phase === 'deploy' ? 'Despliega tu ejército' : `Turno ${G.s.turn}`}. Pasa el dispositivo y toca para continuar.</p><button class="btn primary" id="mGo">Soy ${fname(who)}</button></div>`);
  $('mGo').onclick = () => { G.curtain = false; closeModal(); orient(); afterChange(); if (G.s.phase === 'deploy') spellGenFlow(who); };
}

// ---------- menú ----------
function showMenu() {
  const hasSave = !!store.get('tow_save', null);
  const lv = setup.level;
  const e = armyFor(setup.side), o = armyFor(setup.opp);
  const pts = (a) => armyPoints(a);
  const sideBtn = (k) => `<button data-side="${k}" class="${setup.side === k ? 'on' : ''}" style="border-bottom:3px solid ${FACTIONS[k].color}">${FNAME[k]}<small>${ARMIES[k].length} tipos de unidad</small></button>`;
  openModal(`<div class="card home">
    <header class="hero"><div class="emblem">${IC.combat}</div><div><h1>El Viejo Mundo</h1><p class="lead">Batallas de regimientos por turnos</p></div>${G && !G.demo ? '<button class="hclose" id="mClose" aria-label="Volver a la partida">✕</button>' : ''}</header>
    <div class="hbody">
    ${G && !G.demo && G.s && G.s.phase !== 'over' && G.s.phase !== 'deploy' ? '<button class="btn danger" id="mConcede" title="Core p.286: si te rindes, la victoria es de tu rival">Rendirse (la victoria es del rival)</button>' : ''}
    ${hasSave ? `<button class="resume" id="mResume">${IC.play}<span><b>Continuar la partida</b><small>Retoma la batalla guardada</small></span>${IC.next}</button>` : ''}
    <div class="lbl">Modo</div>
    <div class="seg" id="sMode">
      <button data-v="ai" class="${setup.mode === 'ai' ? 'on' : ''}">Contra la IA<small>aprende de cada partida</small></button>
      <button data-v="hot" class="${setup.mode === 'hot' ? 'on' : ''}">Dos jugadores<small>mismo dispositivo</small></button>
      <button data-v="code" class="${setup.mode === 'code' ? 'on' : ''}">Por turnos con código<small>cada uno en su móvil</small></button>
    </div>
    ${setup.mode === 'ai' ? `<div class="lbl">Dificultad de la IA</div><div class="seg" id="sLevel">
      ${Object.entries(LEVELS).filter(([k]) => ['easy','medium','hard'].includes(k)).map(([k, v]) => `<button data-v="${k}" class="${lv === k ? 'on' : ''}">${v.name}<small>${k === 'easy' ? 'comete errores' : k === 'medium' ? 'sólida' : 'prueba más opciones'}</small></button>`).join('')}</div>` : ''}
    ${setup.mode === 'code' ? `<div class="seg" id="sJoin"><button data-v="0" class="${!setup.join ? 'on' : ''}">Crear partida</button><button data-v="1" class="${setup.join ? 'on' : ''}">Unirme con un código</button></div>` : ''}
    ${setup.mode === 'code' && setup.join ? `<div class="lbl">Código de partida</div><textarea class="code" id="joinCode" placeholder="Pega aquí el código que te ha enviado tu rival">${esc(setup.joinCode)}</textarea>` : `
    <div class="lbl">${setup.mode === 'hot' ? 'Jugador 1' : 'Tu ejército'}</div><select id="sSide" class="sel">${Object.keys(FACTIONS).filter((k) => !scnReq() || (scnReq().either ? scnReq().sides.some((q) => q.fac === k) : scnReq().sides[0].fac === k)).map((k) => `<option value="${k}" ${setup.side === k ? 'selected' : ''}>${FNAME[k]} · ${ARMIES[k].length} tipos de unidad</option>`).join('')}</select>
    <div class="lbl">${setup.mode === 'hot' ? 'Jugador 2' : 'Rival'}</div><select id="sOpp" class="sel">${Object.keys(FACTIONS).filter((k) => !scnReq() || (scnReq().either ? scnReq().sides.some((q) => q.fac === k) && k !== setup.side : scnReq().sides[1].fac === k)).map((k) => `<option value="${k}" ${setup.opp === k ? 'selected' : ''}>${FNAME[k]}</option>`).join('')}</select>
    ${!scnReq() && !/^bm_/.test(setup.scn) ? `<div class="lbl">Tipo de ejército (Guía de juego igualado)</div><div class="seg" id="sDoubles">${[[0, 'Un ejército por bando'], [1, 'Dobles (dos listas por bando)']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.doubles ? 1 : 0) === +v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    ${setup.mode === 'ai' && !scnReq() && !/^bm_/.test(setup.scn) && allyOptsFor(setup.opp, (setup.lists || {})[setup.opp] || 'grand', 1).length ? `<div class="lbl">Aliados del rival (Core p.280)</div><div class="seg" id="sAiAlly">${[[0, 'Sin aliados'], [1, 'Contingente aliado']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.aiAlly ? 1 : 0) === +v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    <div class="lbl">Puntos por ejército</div><select id="sLimit" class="sel">${[...(/^bm_/.test(setup.scn) ? [400, 450, 500, 550, 600, 650, 700, 750] : scnReq() ? (scnReq().limits || [scnReq().limit]) : [...new Set([500, 1000, 1500, 2000, ...(SCN_REQ[setup.scn] && setup.scnFree ? [SCN_REQ[setup.scn].limit] : [])])].sort((a, b) => a - b))].map((v) => `<option value="${v}" ${setup.limit === v ? 'selected' : ''}>${v} puntos</option>`).join('')}</select>
    <div class="lbl">Tamaño de mesa</div><div class="seg" id="sTbl">${['std', 'min'].map((v) => { const tb = tableFor(v, setup.limit); return `<button data-v="${v}" class="${(setup.tsize || 'std') === v ? 'on' : ''}">${v === 'std' ? 'Normal' : 'Reducida'}<small>${tb.h}"×${tb.w}"</small></button>`; }).join('')}</div>${setup.tsize === 'min' ? '<div class="note" style="margin:4px 0 6px">Mesa reducida (mínimo recomendado del reglamento): las zonas de despliegue conservan su fondo y la tierra de nadie se acorta.</div>' : ''}
    <div class="lbl">Tipo de partida</div><div class="seg" id="sGame">${Object.entries(GAME_MODES).map(([v, t]) => `<button data-v="${v}" class="${modeOf(setup.scn) === v ? 'on' : ''}">${t}<small>${v === 'bm' ? 'mesa reducida, 400-750 pts' : 'reglamento base, 500-2.000 pts'}</small></button>`).join('')}</div>
    <div class="lbl">Escenario</div><select id="sScn" class="sel">${(modeOf(setup.scn) === 'bm' ? BM_SCN_IDS : NORMAL_SCN_IDS).map((k) => `<option value="${k}" ${setup.scn === k ? 'selected' : ''}>${esc(SCENARIOS[k].name)}</option>`).join('')}</select>${modeOf(setup.scn) === 'bm' ? '<div class="row" style="margin:4px 0"><button class="btn small" id="sScnD6">🎲 Escenario narrativo al azar (D6)</button></div>' : ''}<div class="note" style="margin:4px 0 10px">${esc(SCENARIOS[setup.scn].desc)}</div>
    <details class="adv" id="mAdv" ${UI.advOpen ? 'open' : ''}><summary><span>Opciones avanzadas<small>Terreno, composición, duración y objetivos</small></span>${IC.next}</summary>
    <div class="lbl">Terreno</div><div class="seg" id="sTer">${[['classic', 'Clásico'], ['random', 'Según reglas'], ['waste', 'Wasteland 2D6'], ['shadow', 'Shadowlands 2D6'], ['custom', 'Personalizado']].map(([v, t]) => `<button data-v="${v}" class="${setup.tmode === v ? 'on' : ''}">${t}</button>`).join('')}</div>${setup.tmode === 'waste' || setup.tmode === 'shadow' ? `<div class="row" style="margin:-4px 0 12px"><label class="muted" style="font-size:12.5px">Rasgos de maleza/rocosos/pendientes <select id="sTdd"><option value="diff" ${setup.tdd !== 'danger' ? 'selected' : ''}>difíciles</option><option value="dang" ${setup.tdd === 'danger' ? 'selected' : ''}>peligrosos</option></select></label></div>` : ''}
    ${setup.tmode === 'custom' ? `<div class="row" style="margin:-4px 0 12px"><button class="btn small" id="edT">Editar terreno (${(setup.terrain || []).length} elementos)</button></div>` : setup.tmode === 'random' || setup.scn !== 'glory' ? '<div class="note" style="margin:-6px 0 10px">Se genera al empezar: 6 elementos, a 12" o más del centro y 3" o más entre sí, en parejas simétricas.</div>' : ''}
    ${SCN_REQ[setup.scn] ? `<div class="lbl">Listas del escenario</div><div class="seg" id="sFree">${[[0, 'Las del texto'], [1, 'Cualquier ejército']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.scnFree ? 1 : 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div><div class="note" style="margin:-6px 0 10px">${setup.scnFree ? 'Alternativa del texto: cualquier ejército a elección de los jugadores.' : 'El texto del escenario impone facciones, listas de ejército, puntos' + (SCN_REQ[setup.scn].comp === 'st' ? ' y composición (mínimo 2 unidades; personaje ≤25 %, Básica ≤35 %, Especial ≤30 %, Rara o Mercenaria ≤25 %)' : '') + (SCN_REQ[setup.scn].sides.some((q) => q.gen) ? ' y los Generales (Miao Ying / Frydaal)' : '') + '.'}</div>` : ''}
    <div class="lbl">Composición de ejército</div><div class="seg" id="sComp">${(/^bm_/.test(setup.scn) ? [["bm", "Battle March"]] : scnReq()?.comp === 'st' ? [["st", "Seize the Tower (Infamia)"]] : [["open", "Guerra abierta"], ["melee", "Gran Refriega"], ["combined", "Armas Combinadas"]]).map(([v, t]) => `<button data-v="${v}" class="${setup.comp === v ? "on" : ""}">${t}</button>`).join("")}</div>${setup.comp === "melee" ? '<div class="note" style="margin:-6px 0 10px">Ninguna unidad ni personaje puede costar más del 25 % del ejército; máximo un Mago de nivel 3 por cada 1.000 pts y uno de nivel 4 por cada 2.000.</div>' : setup.comp === "combined" ? '<div class="note" style="margin:-6px 0 10px">Como máximo 3 personajes, 4 unidades Básicas, 3 Especiales y 2 Singulares (+1 a cada uno por cada 1.000 pts completos por encima de 2.000).</div>' : ""}
    <div class="lbl">Duración de la partida</div><div class="seg" id="sGend">${[["auto", "Según escenario"], ["fixed", "6 rondas"], ["random", "Aleatoria"], ["break", "Punto de ruptura"]].map(([v, t]) => `<button data-v="${v}" class="${setup.gend === v ? "on" : ""}">${t}</button>`).join("")}</div>${setup.gend === "random" ? '<div class="note" style="margin:-6px 0 10px">Desde el final de la ronda 5, se tira 1D6 + nº de ronda al final de cada ronda: con 10+ la batalla termina.</div>' : setup.gend === "break" ? '<div class="note" style="margin:-6px 0 10px">Se lucha hasta que un ejército quede por debajo del 25 % de su Fuerza de Unidad inicial al empezar un turno (+500 PV a quien lo rompa; si ambos se rompen, como mucho victoria ajustada).</div>' : ""}
    ${['ai', 'hot', 'code'].includes(setup.mode) ? `<div class="lbl">Despliegue</div><div class="seg" id="sAlt">${[[1, 'Alterno (reglamento)'], [0, 'Rápido (todo a la vez)']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.alt !== false ? 1 : 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div><div class="note" style="margin:-6px 0 10px">${setup.alt !== false ? 'Core p.285: se turnan una unidad cada vez; máquinas de guerra juntas, personajes al final y Exploradores después.' : 'Tu ejército aparece ya colocado y lo reposicionas libremente antes de empezar.'}</div>` : ''}
    ${(setItemCut(/^bm_/.test(setup.scn) ? +setup.itemCut || 0 : 0), '')}${/^bm_/.test(setup.scn) ? `<div class="lbl">Evento (Battle March, juego organizado)</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><label class="muted" style="font-size:12.5px">Reducir objetos y runas <select id="sItemCut">${[0, 10, 20, 30, 40, 50].map((v) => `<option value="${v}" ${(+setup.itemCut || 0) === v ? 'selected' : ''}>${v ? '−' + v + ' %' : 'sin reducción'}</option>`).join('')}</select></label><label class="muted" style="font-size:12.5px">Terreno máximo <select id="sTerrMax">${[12, 8].map((v) => `<option value="${v}" ${(+setup.terrMax || 12) === v ? 'selected' : ''}>${v}"</option>`).join('')}</select></label></div>` : ''}
    <div class="lbl">Objetivo secreto (Matched Play Guide)</div><select id="sSecret" style="width:100%;margin-bottom:6px">${[["none", "Sin objetivos secretos"], ...(setup.secretPool || SECRET_IDS).map((k) => [k, SECRETS[k][0] + " · " + SECRETS[k][2] + " PV"])].map(([v, t]) => `<option value="${v}" ${setup.secret === v ? "selected" : ""}>${t}</option>`).join("")}</select><div style="margin:0 0 6px"><button class="btn small" id="sSecPool" title="Partidas informales (Battle March p.44): se genera al azar una reserva de tres objetivos secretos y se elige uno; si ninguno es posible, se sortea otra">${setup.secretPool ? 'Sortear otra reserva de 3' : 'Partida informal: sortear reserva de 3'}</button>${setup.secretPool ? ` <button class="btn small" id="sSecAll">Ver todos</button>` : ''}</div>${setup.secret && setup.secret !== "none" ? `<div class="note" style="margin:0 0 10px">${SECRETS[setup.secret][1]} El rival también elige uno en secreto; ambos se revelan al final.</div>` : ""}
    ${/^bm_/.test(setup.scn) ? `<div class="lbl">Objetivo secundario de Battle March</div><div class="seg" id="sRaid">${[[0, 'Ninguno'], [1, 'Raid & Burn']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.raid ? 1 : 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    ${SCENARIOS[setup.scn]?.feat ? `<div class="lbl">Rasgo especial del escenario (AJ Bestias: Piedra de las Manadas)</div><div class="seg" id="sHerd">${[[0, 'El del escenario'], [1, 'Sustituir por la Piedra']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.herdRepl ? 1 : 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    ${/^bm_/.test(setup.scn) ? `<div class="lbl">Despliegue invertido (Cercano / Flancos / Encuentro / Flanqueo)</div><div class="seg" id="sRev">${[[0, 'Normal'], [1, 'Invertido'], [2, 'D6']].map(([v, tt]) => `<button data-v="${v}" class="${(+setup.rev || 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div><div class="lbl">${SCENARIOS[setup.scn]?.axe ? 'Tu papel (atacante / defensor)' : 'Zona de despliegue del 2.º jugador'}</div><div class="seg" id="sZsw">${(SCENARIOS[setup.scn]?.axe ? [[0, 'Atacante'], [1, 'Defensor'], [2, 'D6']] : [[0, 'Primera'], [1, 'Segunda'], [2, 'Al azar']]).map(([v, tt]) => `<button data-v="${v}" class="${(+setup.zsw || 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    ${/^bm_/.test(setup.scn) ? `<div class="lbl">Carros de equipaje (Battle March)</div><div class="seg" id="sBag">${[[0, 'Ninguno'], [1, 'Jugador 1'], [2, 'Jugador 2'], [3, 'Ambos']].map(([v, tt]) => `<button data-v="${v}" class="${(+setup.bagc || 0) === v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    ${/^bm_/.test(setup.scn) ? `<div class="lbl">Sucesos aleatorios (Battle March)</div><div class="seg" id="sHap">${[['none', 'Ninguno'], ['weather', 'Clima'], ['wild', 'Terreno salvaje'], ['chaos', 'Caos de guerra'], ['all', 'Todos']].map(([v, tt]) => `<button data-v="${v}" class="${(setup.hap || 'none') === v ? 'on' : ''}">${tt}</button>`).join('')}</div>` : ''}
    <div class="lbl">Objetivo secundario</div><div class="seg" id="sSec">${[['none', 'Según escenario'], ['loc2', 'Puntos (2)'], ['loc', 'Puntos (3)'], ['loc4', 'Puntos (4)'], ['riches', 'Riquezas perdidas (3)'], ['dom', 'Dominio'], ['bag', 'Convoyes'], ['feat', 'Monolito arcano'], ['featm', 'Monumento de gloria'], ['featd', 'Ruinas oscuras'], ['featt', 'Torre']].map(([v, t]) => `<button data-v="${v}" class="${setup.sec === v ? 'on' : ''}">${t}</button>`).join('')}</div>
    ${['loc', 'loc2', 'loc4'].includes(setup.sec) ? `<div class="note" style="margin:-6px 0 10px">${setup.sec === 'loc2' ? '2 marcadores, a medio camino entre el centro y cada borde largo' : setup.sec === 'loc4' ? '4 marcadores, a medio camino entre el centro y cada borde' : '3 marcadores (centro y a 18" a cada lado)'}. Al final de cada turno de jugador, +30 PV por marcador controlado por una unidad Básica de US 10+ a 6".</div>` : setup.sec === 'feat' ? '<div class="note" style="margin:-6px 0 10px">Monolito arcano en el centro (Core p.273): lo controla por proximidad la unidad más cercana a 6" con FU 5+ que no huya; gana Resistencia a la Magia (-1) y su Mago repite un 1 natural al lanzar. Al final, +50 PV a quien lo controle. No se combina con escenarios que ya tienen un elemento central.</div>' : setup.sec === 'featm' ? '<div class="note" style="margin:-6px 0 10px">Monumento de gloria en el centro (Core p.273): lo controla por proximidad la unidad más cercana a 6" con FU 5+ que no huya; repite los chequeos de Pánico fallados, todo el ejército repite los de Reagrupar y gana Odio (todos). Al final, +50 PV a quien lo controle.</div>' : setup.sec === 'featd' ? '<div class="note" style="margin:-6px 0 10px">Ruinas oscuras en el centro (Core p.274): edificio que ocupa (sin cargar) una unidad de infantería de FU 20 o menos o un personaje de cualquier tropa; quien las ocupa las controla. Aura oscura (-1 Ld al Miedo/Terror que causa; si no causa ninguno, es inmune), no cede ni se retira, si rompe es destruida. Al final, +100 PV a quien las ocupe.</div>' : setup.sec === 'featt' ? '<div class="note" style="margin:-6px 0 10px">Torre en el centro (Core p.275): edificio que ocupa una unidad de infantería de FU 10 o menos o un personaje de infantería; solo la cargan infantería o unidades con Volar; el combate es en Escaramuza con 5 modelos como máximo; vistas panorámicas. Al final, +100 PV a quien la ocupe.</div>' : setup.sec === 'none' ? '<div class="note" style="margin:-6px 0 10px">Usa el objetivo que exige el escenario (Close Quarters: Puntos (2); Drawn Battlelines: Puntos (3); Encirclement: Puntos (4); A Chance Encounter: Elemento especial).</div>' : setup.sec === 'bag' ? '<div class="note" style="margin:-6px 0 10px">Cada bando tiene un convoy inmóvil al fondo de su zona. Al final, +100 PV por convoy controlado (unidad de US 10+ a 6"). Una unidad de US 5+ pegada al convoy enemigo que siga allí un turno completo, sin huir ni estar trabada, lo destruye: +250 PV.</div>' : setup.sec === 'dom' ? '<div class="note" style="margin:-6px 0 10px">Mesa dividida en 4 cuartos. Al final, +100 PV por cuarto con más US dentro (+50 si doble, +100 más si el rival no tiene nada).</div>' : ''}
    </details>
    <div class="grid2"><div><div class="lbl">${FNAME[setup.side]} · ${pts(e)} pts</div><button class="btn small" id="edA">Editar ejército</button></div>
    <div><div class="lbl">${FNAME[setup.opp]} · ${pts(o)} pts</div><button class="btn small" id="edB">${setup.mode === 'ai' ? 'Editar el de la IA' : 'Editar ejército'}</button></div></div>`}
    <div class="note">Perfiles, puntos y reglas según el reglamento oficial (Core Rulebook, Forces of Fantasy, Ravening Hordes; Bretonia y Elfos Silvanos: Forces of Fantasy y Arcane Journal). Simplificado: equipo fijo por unidad, portaestandarte opcional (+1 resolución, +10 pts); los magos no se unen a unidades.</div>
    <div class="muted" style="margin-top:10px;font-size:13px">IA: ${AI.gens} generaciones de autojuego · ${AI.games} partidas aprendidas aquí ${AI.games ? '<button class="btn small" id="mResetAI">Reiniciar aprendizaje local</button>' : ''}</div>
    </div>
    <footer class="mfoot">
      <button class="btn primary cta" id="mStart">${IC.play}<span>${setup.mode === 'code' && setup.join ? 'Unirme' : 'Configurar ejército'}</span>${setup.mode === 'code' && setup.join ? '' : IC.next}</button>
      <div class="mrow"><button class="btn" id="mSlots">Partidas</button><button class="btn" id="mStats">Estadísticas</button><button class="btn" id="mTut">Tutorial</button><button class="btn" id="mCampaign">Campaña</button><button class="btn" id="mHow">Cómo se juega</button><button class="btn" id="mPre" title="Descarga las miniaturas 3D de los dos ejércitos para jugar sin esperas">Precargar 3D</button><button class="btn" id="mGfx" title="Alta: suavizado de bordes, resolución completa y texturas más nítidas. Normal: más ligera">Gráficos: ${gfxMode()}</button><button class="btn" id="mMat" title="Cambia el tapete de la mesa">Tapete: ${MAT_NAMES[glMat()]}</button></div>
    </footer>
  </div>`);
  { const ad = $('mAdv'); if (ad) ad.addEventListener('toggle', () => { UI.advOpen = ad.open; }); const cd = document.querySelector('#modal .hbody'); if (cd) { cd.scrollTop = UI.menuScroll || 0; cd.addEventListener('scroll', () => { UI.menuScroll = cd.scrollTop; }, { passive: true }); } }
  const bind = (id, fn) => { const el = $(id); if (el) el.querySelectorAll('button').forEach((b) => (b.onclick = () => { fn(b.dataset.v ?? b.dataset.side); showMenu(); })); };
  bind('sMode', (v) => { setup.mode = v; });
  bind('sLevel', (v) => { setup.level = v; });
  bind('sAiAlly', (v) => { setup.aiAlly = +v === 1; });
  bind('sDoubles', (v) => { setup.doubles = +v === 1; setup.armies = Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null])); for (const k of Object.keys(AUTO_AL)) delete AUTO_AL[k]; }); // Dobles: cada bando son dos listas (primaria + secundaria del compañero), la mitad de los puntos como máximo cada una
  bind('sJoin', (v) => { setup.join = v === '1'; });
  const sd = $('sSide'); if (sd) sd.onchange = () => { setup.side = sd.value; if (scnReq()?.either) scnApply(); showMenu(); };
  if (document.getElementById('sFree')) bind('sFree', (v) => { setup.scnFree = +v === 1; scnApply(); showMenu(); });
  const sp = $('sOpp'); if (sp) sp.onchange = () => { setup.opp = sp.value; showMenu(); };
  document.querySelectorAll('#sGame button').forEach((b) => (b.onclick = () => { const m = b.dataset.v; if (modeOf(setup.scn) === m) return; setup.scn = m === 'bm' ? 'bm_pitched' : 'glory'; if (m === 'bm') { if (setup.limit > 750) setup.limit = 500; setup.comp = 'bm'; } else { if (setup.limit < 500) setup.limit = 500; if (setup.comp === 'bm') setup.comp = 'open'; } setup.armies = Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null])); scnApply(); showMenu(); }));
  const sd6 = $('sScnD6'); if (sd6) sd6.onclick = () => { const r = 1 + Math.floor(Math.random() * 6); setup.scn = ['bm_weisnicht', 'bm_belcedas', 'bm_raiders', 'bm_karak', 'bm_sturdham', 'bm_gemelwald'][r - 1]; if (setup.limit > 750) setup.limit = 500; if (setup.comp !== 'bm') setup.comp = 'bm'; toast(`D6: ${r} → ${SCENARIOS[setup.scn].name}`); showMenu(); };
  const sc = $('sScn'); if (sc) sc.onchange = () => { setup.scn = sc.value; if (/^bm_/.test(sc.value)) { if (setup.limit > 750) setup.limit = 500; if (setup.comp !== 'bm') setup.comp = 'bm'; } else { if (setup.limit < 500) setup.limit = 500; if (setup.comp === 'bm') setup.comp = 'open'; } setup.armies = Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null])); scnApply(); showMenu(); };
  bind('sSec', (v) => { setup.sec = v; });
  if (document.getElementById('sAlt')) bind('sAlt', (v) => { setup.alt = +v === 1; });
  if (document.getElementById('sRaid')) bind('sRaid', (v) => { setup.raid = +v === 1; });
  if (document.getElementById('sHerd')) bind('sHerd', (v) => { setup.herdRepl = +v === 1; });
  if (document.getElementById('sRev')) bind('sRev', (v) => { setup.rev = +v; });
  if (document.getElementById('sZsw')) bind('sZsw', (v) => { setup.zsw = +v; });
  if (document.getElementById('sBag')) bind('sBag', (v) => { setup.bagc = +v; });
  if (document.getElementById('sHap')) bind('sHap', (v) => { setup.hap = v; });
  bind('sGend', (v) => { setup.gend = v; });
  bind('sComp', (v) => { setup.comp = v; });
  { const el = document.getElementById('sSecret'); if (el) el.onchange = () => { setup.secret = el.value; showMenu(); }; }
  { const e1 = document.getElementById('sItemCut'); if (e1) e1.onchange = () => { setup.itemCut = +e1.value; showMenu(); }; const e2 = document.getElementById('sTerrMax'); if (e2) e2.onchange = () => { setup.terrMax = +e2.value; showMenu(); }; }
  { const b = document.getElementById('sSecPool'); if (b) b.onclick = () => { const a = [...SECRET_IDS]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } setup.secretPool = a.slice(0, 3); setup.secret = 'none'; showMenu(); }; const b2 = document.getElementById('sSecAll'); if (b2) b2.onclick = () => { setup.secretPool = null; showMenu(); }; }
  bind('sTbl', (v) => { setup.tsize = v; if (setup.terrain) setup.terrain = setup.terrain.filter((t) => t.x < tableFor(v, setup.limit).w && t.y < tableFor(v, setup.limit).h); });
  { const e3 = document.getElementById('sTdd'); if (e3) e3.onchange = () => { setup.tdd = e3.value === 'dang' ? 'danger' : 'diff'; showMenu(); }; }
  bind('sTer', (v) => { setup.tmode = v; if (v === 'custom' && !setup.terrain) setup.terrain = defaultTerrain(); });
  if ($('edT')) $('edT').onclick = terrainEditor;
  { const sl = $('sLimit'); if (sl) sl.onchange = () => { setup.limit = +sl.value; setup.armies = Object.fromEntries(Object.keys(FACTIONS).map((k) => [k, null])); showMenu(); }; }
  const jc = $('joinCode'); if (jc) jc.oninput = () => { setup.joinCode = jc.value; };
  if ($('edA')) $('edA').onclick = () => armyEditor(setup.side);
  if ($('edB')) $('edB').onclick = () => armyEditor(setup.opp);
  if ($('mResume')) $('mResume').onclick = () => { closeModal(); resume(); };
  if ($('mClose')) $('mClose').onclick = closeModal;
  if ($('mConcede')) $('mConcede').onclick = () => { if (!window.confirm('¿Seguro que quieres rendirte? La victoria será de tu rival.')) return; closeModal(); dispatch({ t: 'concede', p: viewer() }); };
  if ($('mHow')) $('mHow').onclick = showHow;
  if ($('mCampaign')) $('mCampaign').onclick = campaignMenu;
  if ($('mSlots')) $('mSlots').onclick = () => slotsMenu(showMenu); if ($('mStats')) $('mStats').onclick = statsMenu; if ($('mTut')) $('mTut').onclick = startTutorial;
  if ($('mGfx')) $('mGfx').onclick = () => { try { const md = gfxMode(); localStorage.removeItem('tow_nohd'); localStorage.setItem('tow_gfx', md === 'Alta' ? 'normal' : 'alta'); } catch { /* */ } location.reload(); };
  if ($('mMat')) $('mMat').onclick = () => { const ks = Object.keys(MAT_NAMES), k = ks[(ks.indexOf(glMat()) + 1) % ks.length]; glSetMat(k); $('mMat').textContent = 'Tapete: ' + MAT_NAMES[k]; };
  if ($('mPre')) $('mPre').onclick = async () => {
    const b = $('mPre'), packs = [...new Set([setup.side, setup.opp].flatMap((s) => armyFor(s).map((e) => XMODELS[e.type])).filter(Boolean))];
    if (!packs.length) { toast('Estos ejércitos no tienen miniaturas 3D extra', 'ok'); return; }
    b.disabled = true; const pr = {}; const upd = () => { b.textContent = 'Descargando ' + Math.round(100 * packs.reduce((t, p) => t + (pr[p] || 0), 0) / packs.length) + '%'; b.style.background = 'linear-gradient(90deg,var(--ok) ' + Math.round(100 * packs.reduce((t, p) => t + (pr[p] || 0), 0) / packs.length) + '%,var(--panel2) 0)'; };
    upd(); await Promise.all(packs.map((p) => prefetchPack(p, (v) => { pr[p] = v; upd(); }))); b.textContent = '✓ 3D listo'; b.style.background = '';
  };
  if ($('mResetAI')) $('mResetAI').onclick = () => { AI.weights = AI.base.slice(); AI.games = 0; store.del('tow_ai'); showMenu(); };
  $('mStart').onclick = () => { if (setup.mode === 'code' && setup.join) return startFromMenu(); startFlow(); };
}

async function startFromMenu() {
  try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch { /* */ }
  const { mode, level, side, limit } = setup;
  if (!(mode === 'code' && setup.join)) {
    for (const f of [side, setup.opp]) { const iss = armyIssues(armyFor(f), limit, setup.comp, (setup.lists || {})[f] || 'grand', allyCtx(f, f === side ? 0 : 1)); if (iss.length) { toast(`${FNAME[f]}: ${iss[0]}`, 'bad'); showMenu(); return; } }
    if (scnReq()) { const si = scnIssues(setup.scn, false, [side, setup.opp].map((f) => ({ fac: f, list: (setup.lists || {})[f] || 'grand', army: armyFor(f).filter((e) => !e.ally) })), limit); if (si.length) { toast(`${SCENARIOS[setup.scn].name}: ${si[0]}`, 'bad'); showMenu(); return; } }
  }
  if (mode === 'code' && setup.join) {
    try {
      const d = await decodeCode(setup.joinCode.trim());
      if (d.t !== 'setup') throw new Error('No es un código de partida');
      closeModal();
      newGame({ mode: 'code', level, side: d.factions[0], opp: d.factions[1], limit: d.limit, seed: d.seed, myOwner: 1, armiesBy: d.armies, tcfg: d.tcfg });
    } catch (e) { toast('Código no válido: ' + e.message, 'bad'); }
    return;
  }
  const other = setup.opp;
  const a0 = armyFor(side, limit), a1 = armyFor(other, limit);
  if (!a0.some((u) => u.models > 0) || !a1.some((u) => u.models > 0)) { toast('Cada ejército necesita al menos una unidad', 'bad'); return; }
  closeModal();
  const clean = (a) => a.filter((u) => u.models > 0);
  const lk = setup.linked; setup.linked = null; const arm0 = lk ? lk.armies : [clean(a0), clean(a1)]; // batallas enlazadas: ejércitos ya ajustados por las tablas de bajas
  newGame({ mode, level, side, opp: other, limit, myOwner: 0, armiesBy: arm0, tcfg: { tsize: setup.tsize, scn: setup.scn, tmode: setup.tmode, tdd: setup.tdd === 'danger' ? 'danger' : 'diff', sec: setup.sec, secretPick: setup.secret, gend: setup.gend === 'auto' ? null : setup.gend, terrain: setup.tmode === 'custom' ? setup.terrain : null, hap: setup.hap || 'none', raid: !!setup.raid, herdRepl: !!setup.herdRepl, bagc: +setup.bagc || 0, rev: +setup.rev || 0, zsw: +setup.zsw || 0, alt: (mode === 'ai' || mode === 'hot' || mode === 'code') && setup.alt !== false, game: modeOf(setup.scn), lists: [(setup.lists || {})[side] || 'grand', (setup.lists || {})[other] || 'grand'], doubles: !!setup.doubles } });
  if (G) G.linkBase = { armies: arm0.map((a) => a.map((e) => ({ ...e }))), orig: lk ? lk.orig : arm0.map((a) => a.map((e) => ({ ...e }))), stage: lk ? lk.stage : 1 };
  if (mode === 'hot') { G.curtain = true; showCurtain(); }
  if (mode === 'code') showCodeModal('setup');
}

// ---------- editor de terreno ----------
function defaultTerrain() {
  let q = (Date.now() >>> 0) || 7; const rg = () => { q = (Math.imul(q, 1664525) + 1013904223) >>> 0; return q / 4294967296; };
  const sc = scaledScn(setup.scn, setup.tsize, setup.limit), tb = tableFor(setup.tsize, setup.limit); setTable(tb.w, tb.h);
  return genTerrain(rg, sc.stir ? [] : sc.z, sc.feat, sc.terr, sc.extra);
}
function terrainEditor() {
  const T = (setup.terrain || defaultTerrain()).map((t) => ({ ...t }));
  let sel = -1, drag = null, nid = 1;
  const KIND = { forest: ['Bosque', '#2d5a2d', 8, 6], hill: ['Colina', '#8a6f45', 7, 5], swamp: ['Pantano', '#2f6663', 6, 5], ruin: ['Ruina', '#85816f', 5, 3], building: ['Edificio', '#7a5a40', 4, 3], wall: ['Muro bajo', '#9a927a', 6, 0.6], deco: ['Decorado', '#6a5acd', 4, 4] };
  const DECO_N = { bazaar1: 'Puesto de mercado', bazaar2: 'Carpa de mercado', bazaar3: 'Puesto pequeño', loonshrine: 'Santuario de la Luna Loca', crystal: 'Columna de cristal', dais: 'Estrado sigmarita', dragondais: 'Estrado del dragón', stormvault: 'Bóveda de tormenta', cairn: 'Túmulo', wyldwood: 'Bosque despertado', rubble: 'Escombros', venom: 'Matorral venenoso' };
  const Z = scaledScn(setup.scn, setup.tsize, setup.limit).z, TB = tableFor(setup.tsize, setup.limit), TWe = TB.w, THe = TB.h;
  openModal(`<div class="card home ted">
    <header class="hero"><div class="emblem">${IC.fit}</div><div><h1>Terreno</h1><p class="lead">${esc(SCENARIOS[setup.scn].name)}</p></div><button class="hclose" id="tCancel" aria-label="Cancelar">✕</button></header>
    <div class="hbody">
      <canvas id="tCv" width="900" height="600"></canvas>
      <div class="tsel" id="tSel"></div>
      <div class="lbl">Añadir elemento</div>
      <div class="tpal" id="tAdd">${Object.entries(KIND).filter(([k]) => k !== 'deco').map(([k, v]) => `<button data-k="${k}"><i style="background:${v[1]}"></i>${v[0]}</button>`).join('')}</div>
      <div class="lbl">Decorado (no afecta a las reglas)</div>
      <div class="tpal" id="tDeco">${Object.entries(DECO_N).map(([k, v]) => `<button data-p="${k}"><i style="background:${KIND.deco[1]}"></i>${v}</button>`).join('')}</div>
      <details class="adv" style="margin-top:12px"><summary><span>Qué hace cada elemento</span>${IC.next}</summary><p class="muted" style="margin:10px 0 2px">Bosque y pantano son terreno difícil. La colina bloquea la visión. La ruina bloquea el paso. El muro bajo es difícil de cruzar, da cobertura y hace desordenada la carga contra quien lo defiende. Toca un elemento para seleccionarlo y arrástralo para moverlo; el círculo punteado marca 12" desde el centro.</p></details>
    </div>
    <footer class="mfoot"><button class="btn primary cta" id="tOk">Guardar terreno</button><div class="mrow"><button class="btn" id="tRnd">Aleatorio según reglas</button><button class="btn" id="tClr">Vaciar</button></div></footer></div>`);
  const cv = $('tCv'), x = cv.getContext('2d'); cv.height = Math.round(cv.width * THe / TWe); const K = cv.width / TWe;
  const draw = () => {
    x.clearRect(0, 0, cv.width, cv.height); x.fillStyle = '#3a4d2e'; x.fillRect(0, 0, cv.width, cv.height);
    x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1; x.beginPath();
    for (let i = 6; i < TWe; i += 6) { x.moveTo(i * K, 0); x.lineTo(i * K, cv.height); } for (let i = 6; i < THe; i += 6) { x.moveTo(0, i * K); x.lineTo(cv.width, i * K); } x.stroke();
    [0, 1].forEach((o) => { const z = Z[o], c = FACTIONS[o === 0 ? setup.side : setup.opp].color; x.fillStyle = c + '33'; x.fillRect(z.x0 * K, z.y0 * K, (z.x1 - z.x0) * K, (z.y1 - z.y0) * K); x.strokeStyle = c + 'aa'; x.setLineDash([8, 6]); x.strokeRect(z.x0 * K, z.y0 * K, (z.x1 - z.x0) * K, (z.y1 - z.y0) * K); x.setLineDash([]); });
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(TWe / 2 * K, THe / 2 * K, 12 * K, 0, 7); x.setLineDash([4, 6]); x.stroke(); x.setLineDash([]);
    T.forEach((t, i) => {
      x.fillStyle = KIND[t.kind][1] + 'dd'; x.fillRect((t.x - t.w / 2) * K, (t.y - t.h / 2) * K, t.w * K, t.h * K);
      x.strokeStyle = i === sel ? '#ffd76a' : 'rgba(0,0,0,.5)'; x.lineWidth = i === sel ? 4 : 2; x.strokeRect((t.x - t.w / 2) * K, (t.y - t.h / 2) * K, t.w * K, t.h * K);
      x.fillStyle = 'rgba(255,255,255,.92)'; x.font = '700 19px system-ui, sans-serif'; x.textAlign = 'center'; if (t.w * K > 60) x.fillText(t.piece ? DECO_N[t.piece].split(' ')[0] : KIND[t.kind][0], t.x * K, t.y * K + 7);
    });
    x.strokeStyle = '#cfa94a'; x.lineWidth = 4; x.strokeRect(0, 0, cv.width, cv.height);
    const sp = $('tSel');
    sp.innerHTML = sel < 0 ? `<span class="muted">${T.length} elementos · toca uno para editarlo</span>` : `<b>${T[sel].piece ? DECO_N[T[sel].piece] : KIND[T[sel].kind][0]} ${T[sel].w}×${T[sel].h}"</b><span class="tgrp"><button data-a="w-" aria-label="Menos ancho">−</button><em>Ancho</em><button data-a="w+" aria-label="Más ancho">+</button></span><span class="tgrp"><button data-a="h-" aria-label="Menos alto">−</button><em>Alto</em><button data-a="h+" aria-label="Más alto">+</button></span><button data-a="rot">Girar</button><button data-a="mir">Espejo</button><button data-a="del" class="dng">Borrar</button>`;
    sp.querySelectorAll('button').forEach((b) => (b.onclick = () => {
      const t = T[sel], a = b.dataset.a;
      if (a === 'w-') t.w = Math.max(2, t.w - 1); if (a === 'w+') t.w = Math.min(18, t.w + 1);
      if (a === 'h-') t.h = Math.max(2, t.h - 1); if (a === 'h+') t.h = Math.min(18, t.h + 1);
      if (a === 'rot') { const w = t.w; t.w = t.h; t.h = w; }
      if (a === 'mir') { T.push({ ...t, id: 'e' + nid++, x: TWe - t.x, y: THe - t.y }); sel = T.length - 1; }
      if (a === 'del') { T.splice(sel, 1); sel = -1; }
      draw();
    }));
  };
  const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * TWe, y: (e.clientY - r.top) / r.height * THe }; };
  cv.onpointerdown = (e) => {
    const p = pos(e); let hit = -1;
    for (let i = T.length - 1; i >= 0; i--) if (Math.abs(p.x - T[i].x) <= T[i].w / 2 && Math.abs(p.y - T[i].y) <= T[i].h / 2) { hit = i; break; }
    sel = hit; drag = hit >= 0 ? { dx: p.x - T[hit].x, dy: p.y - T[hit].y } : null;
    if (drag) cv.setPointerCapture(e.pointerId); draw();
  };
  cv.onpointermove = (e) => {
    if (!drag || sel < 0) return; const p = pos(e), t = T[sel];
    t.x = Math.max(t.w / 2, Math.min(TWe - t.w / 2, Math.round((p.x - drag.dx) * 2) / 2)); t.y = Math.max(t.h / 2, Math.min(THe - t.h / 2, Math.round((p.y - drag.dy) * 2) / 2)); draw();
  };
  cv.onpointerup = () => { drag = null; };
  $('tDeco').querySelectorAll('button').forEach((b) => (b.onclick = () => { T.push({ id: 'e' + nid++, kind: 'deco', piece: b.dataset.p, x: TWe / 2, y: THe / 2, w: 4, h: 4 }); sel = T.length - 1; draw(); }));
  $('tAdd').querySelectorAll('button').forEach((b) => (b.onclick = () => { const k = KIND[b.dataset.k]; T.push({ id: 'e' + nid++, kind: b.dataset.k, x: 36, y: 24, w: k[2], h: k[3] }); sel = T.length - 1; draw(); }));
  $('tRnd').onclick = () => { T.length = 0; T.push(...defaultTerrain()); sel = -1; draw(); };
  $('tClr').onclick = () => { T.length = 0; sel = -1; draw(); };
  $('tOk').onclick = () => { setup.terrain = T; setup.tmode = 'custom'; showMenu(); };
  $('tCancel').onclick = () => showMenu();
  draw();
}

const OPEN = new Set();
let EDLIST = 'grand';
function optPanel(e, d) {
  const sel = e.opts || [], models = e.models || 0;
  return `<div class="muted" style="font-size:12.5px;margin-top:6px"><b>Opciones</b>${optList(d.id).filter((o) => !o.list || o.list === EDLIST).map((o) => { if (o.cnt) { const n = sel.filter((x) => x === o.id).length; return `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><span style="flex:1">${esc(o.label)} · +${o.cost}/${o.vial ? 'vial' : 'modelo'}</span><button class="btn small" data-t="${e.type}" data-d="opn" data-k="${o.id}" data-v="-1" aria-label="Menos">−</button><b style="min-width:18px;text-align:center">${n}</b><button class="btn small" data-t="${e.type}" data-d="opn" data-k="${o.id}" data-v="1" aria-label="Más">+</button></div>`; } const on = sel.includes(o.id), c = o.per === 'unit' ? o.cost : o.cost * models; return `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><button class="btn small ${on ? 'primary' : ''}" data-t="${e.type}" data-d="op" data-k="${o.id}" style="padding:2px 8px">${on ? '✓ ' : ''}${esc(o.label)} · +${c}</button>${o.text ? `<span style="flex:1">${esc(o.text)}</span>` : ''}</div>`; }).join('')}</div>`;
}
function arrowPanel(e) {
  return `<div class="muted" style="font-size:12.5px;margin-top:6px"><b>Flechas encantadas</b>${Object.entries(ARROWS).map(([k, a]) => `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><button class="btn small ${e.arrows === k ? 'primary' : ''}" data-t="${e.type}" data-d="ar" data-k="${k}" style="padding:2px 8px">${esc(a.name)} · +${arrowCost(e.type, e.models, k)}</button><span style="flex:1">${esc(a.text)}</span></div>`).join('')}</div>`;
}
function spitePanel(e, d) {
  const b = spiteBudget(e.type); if (!b) return '';
  const used = itemsCost((e.items || []).filter((k) => ITEMS[k]?.fspite));
  return `<div class="muted" style="font-size:12.5px;margin-top:6px"><b>Duendes del Bosque ${used}/${b} pts</b>${Object.entries(ITEMS).filter(([, i]) => i.fspite && (!i.noble || /^we_(lord|captain|waystalker)/.test(d.id))).map(([k, i]) => `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><button class="btn small ${(e.items || []).includes(k) ? 'primary' : ''}" data-t="${e.type}" data-d="it" data-k="${k}" style="padding:2px 8px">${esc(i.name)} · ${i.cost}</button><span style="flex:1">${esc(i.text)}</span></div>`).join('')}</div>`;
}
// Objetos mágicos / runas del campeón de unidad (presupuesto del libro): se guardan en e.opts como 'ci:<objeto>'; solo los lleva el campeón
function champPanel(e, d, key) {
  const sp = champBudgetSpec(e.type); if (!sp || !e.champ) return '';
  const ids = champItemsOf(e.opts), cnt = (k) => ids.filter((x) => x === k).length, spent = (f) => ids.reduce((t, k) => t + (ITEMS[k] && f(ITEMS[k]) ? ITEMS[k].cost : 0), 0);
  const head = d.faction === 'dw' ? ['w', 't'].filter((c) => sp[c] !== undefined).map((c) => `${c === 'w' ? 'runas de arma' : 'runas talismánicas'} ${spent((i) => i.cat === c)}/${sp[c]}`).join(' · ') : `objetos ${spent((i) => !i.vpow)}/${sp.n}${sp.vp ? ` · poderes vampíricos ${spent((i) => i.vpow)}/${sp.vp}` : ''}`;
  const pool = Object.keys(ITEMS).filter((k) => champEligible(e.type, k, setup.comp));
  return `<div class="muted" style="font-size:12.5px;margin-top:6px"><b>Campeón: ${head} pts</b>${pool.map((k) => { const i = ITEMS[k]; return `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><button class="btn small ${cnt(k) ? 'primary' : ''}" data-t="${key || e.type}" data-d="ci" data-k="${k}" style="padding:2px 8px">${cnt(k) ? '✓ ' : ''}${esc(i.name)} · ${i.cost}</button><span style="flex:1">${esc(i.text || '')}</span></div>`; }).join('')}</div>`;
}
function itemPanel(e, d, key) {
  const cp = champPanel(e, d, key);
  if (cp && d.cat !== 'char' && !d.monItems && !d.runeE && !e.std && !hasBow(e.type) && !spiteBudget(e.type)) return cp;
  return itemPanel0(e, d) + cp;
}
function itemPanel0(e, d) {
  if (d.cat !== 'char' && spiteBudget(e.type)) return (hasBow(e.type) ? arrowPanel(e) : '') + spitePanel(e, d);
  if (hasBow(e.type) && d.cat !== 'char') return arrowPanel(e) + (e.std ? itemPanelBody(e, d) : '');
  return (hasBow(e.type) ? arrowPanel(e) : '') + itemPanelBody(e, d) + spitePanel(e, d);
}
function itemPanelBody(e, d) {
  const dw = d.faction === 'dw', isChar = d.cat === 'char' || !!d.runeE || !!d.monItems;
  // Enanos: solo runas (FoF p.33), por categoría según la entrada; máquinas: runas de ingeniería
  const pool = Object.entries(ITEMS).filter(([, i]) => (!i.bm || setup.comp === 'bm') && (dw ? i.fac === 'dw' : itemFacOk(i, d, e.opts || [])) && (d.runeE ? i.cat === 'g' && (!i.boltOnly || d.id === 'dw_bolt') && (!i.cannonOnly || d.id === 'dw_cannon')
    : (d.cat === 'char' || d.monItems) ? i.cat !== 's' && i.cat !== 'g' && !i.fspite && (!i.onlyT || i.onlyT.includes(d.id)) && (!i.slann || d.id === 'lm_slann') && (!i.onlyRe || i.onlyRe.test(d.id)) && !(i.notRe && i.notRe.test(d.id)) && (!i.infCavCharOnly || (!/mon|behemoth|monster|machine/i.test(d.tt || '') && !/dragon|manticore|hydra|wyvern|griffon|pegasus|giant|terrorgheist|abomination|steg|mammoth|treeman/i.test(d.id || '') && d.cat !== 'mon' && d.cat !== 'mach')) && (!i.infCavOnly || (!/mon|behemoth|monster|chariot|machine|lightchar|heavychar/i.test(d.tt || '') && !/chariot|manticore|dragon|palanquin|hydra|wyvern|griffon|pegasus|giant|cart|carro|zombie_dragon|terrorgheist|abomination|steg|mammoth|war_?hydra|treeman|unicorn_?chariot/i.test(d.id || '') && d.cat !== 'mon' && d.cat !== 'mach')) && (!i.kindred || /^we_(lord|captain|spellweaver|spellsinger|weaver_|singer_)/.test(d.id)) && (!i.wiz || d.wizard) && (!i.nowiz || !d.wizard) && (!i.onFoot || !d.mount || (i.orChariot && (/lightChar|heavyChar|chariot/.test(d.tt || '') || /chariot/.test(d.id || '')))) && (!(i.infOnly || (i.footOnly && !i.kindred)) || (!d.mount && d.tt === 'char')) && (!dw || ((d.runeCats || '').includes(i.cat) && (!i.rsOnly || d.runeLore) && !(i.cat === 'a' && d.arm === 'none')))
    : i.cat === 's' && (!dw || (!!d.bnMax && i.cost <= d.bnMax && !i.bsbOnly))));
  const vpB = /^vc_count/.test(e.type) ? 100 : /^vc_thrall/.test(e.type) ? 50 : /^vc_ghoulking/.test(e.type) ? 75 : 0, vpU = isChar ? itemsCost((e.items || []).filter((k) => ITEMS[k]?.vpow)) : 0;
  const used = isChar ? itemsCost((e.items || []).filter((k) => !ITEMS[k]?.vpow && !ITEMS[k]?.fspite && !ITEMS[k]?.kindred && !ITEMS[k]?.mundane)) : (ITEMS[e.banner]?.cost || 0), bud = isChar ? itemBudget(e.type, (setup.lists || {})[d.faction] || 'grand') : bannerBudget(e.type, (setup.lists || {})[d.faction] || 'grand');
  const cnt = (k) => (e.items || []).filter((x) => x === k).length;
  return `<div class="muted" style="font-size:12.5px;margin-top:6px"><b>${dw ? "Runas" : "Objetos mágicos"} ${used}/${bud} pts${vpB ? ` · Poderes vampíricos ${vpU}/${vpB} pts` : ''}</b>${pool.map(([k, i]) => {
    const on = isChar ? cnt(k) : e.banner === k;
    return `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><button class="btn small ${on ? 'primary' : ''}" data-t="${e.type}" data-d="it" data-k="${k}" style="padding:2px 8px">${isChar && cnt(k) ? cnt(k) + '× ' : ''}${esc(i.name)} · ${i.cost}</button><span style="flex:1">${esc(i.text)}</span>${isChar && cnt(k) ? `<button class="btn small" data-t="${e.type}" data-d="ix" data-k="${k}" style="padding:2px 8px">−</button>` : ''}</div>`;
  }).join('')}</div>${isChar && e.std ? `<div class="muted" style="font-size:12.5px;margin-top:6px"><b>Estandarte mágico del Portaestandarte (sin límite de puntos)</b>${Object.entries(ITEMS).filter(([, i]) => i.bn && (!i.bm || setup.comp === 'bm') && (!i.fac || i.fac === d.faction)).map(([k, i]) => `<div style="margin:2px 0"><button class="btn small ${e.banner === k ? 'primary' : ''}" data-t="${e.type}" data-d="bn" data-k="${k}" style="padding:2px 8px">${esc(i.name)} · ${i.cost} pts</button></div>`).join('')}</div>` : ''}`;
}
const RECON = new Set(['de', 'lm', 'sk', 'vc', 'dm', 'ok', 'cd', 'ct']);
let EDF = 'all', EDQ = '';
const edFilter = () => `<div class="seg fil" id="edFil">${[['all', 'Todo'], ['sel', 'Elegidas'], ['char', 'Personajes'], ['core', 'Básicas'], ['special', 'Especiales'], ['rare', 'Singulares'], ['merc', 'Mercenarios']].map(([k, n]) => `<button data-v="${k}" class="${EDF === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
function unitPreview(t) {
  const d = UNITS[t], f = FACTIONS[d.faction] || {}, has = !FIG_PROC.has(t) && !FIG_GENERIC.has(t);
  const sr = d.sr.filter((r) => RULES[r] && RULES[r][1] && !(r === 'undead' && d.sr.includes('necroUndead'))).map((r) => `<div class="pvr"><b>${RULES[r][0]}.</b> ${esc(RULES[r][1])}</div>`).join('');
  const rg = d.ranged ? `<div class="pvr"><b>Disparo</b> ${d.ranged.range}" F${d.ranged.s}${d.ranged.ap ? ' −' + d.ranged.ap : ''}</div>` : '';
  const wz = d.wizard ? `<div class="pvr"><b>Mago nivel ${d.wizard.level}</b>${d.wizard.lore ? ' · ' + esc(LORE_NAME[d.wizard.lore] || d.wizard.lore) : ''}</div>` : '';
  const ov = document.createElement('div'); ov.className = 'pvov';
  ov.innerHTML = `<div class="card"><h1 style="color:${f.color || 'inherit'}">${esc(d.name)}</h1><p class="lead">${esc(f.name || '')} · ${d.ppm} pts${d.max === 1 ? '' : '/mod'} · ${d.min === d.max ? d.min : d.min + '–' + d.max} mod. · peana ${d.baseW}×${d.baseD} mm</p>
  ${RECON.has(d.faction) ? '<div class="chip arc">Reglas reconstruidas: sin libro oficial, perfil y reglas inferidos de la filosofía del juego</div>' : ''}
  ${statRow(d)}${rg}${wz}${sr}<p class="muted">${esc(d.blurb || '')}</p>
  <p class="muted">${has && FIG_BORROW.has(t) ? '≈ Usa la miniatura de otra unidad parecida (' + esc(UNITS[FIG_ALIAS[t]]?.name || FIG_ALIAS[t]) + '): no es la original' : has ? '✓ Miniatura 3D original del mod' : FIG_PROC.has(t) ? '⚠ Figura procedural aproximada (no es la miniatura original)' : 'Sin malla 3D propia: se muestra un modelo genérico'}</p>
  <div class="row"><button class="btn primary">Cerrar</button></div></div>`;
  ov.onclick = (e) => { if (e.target === ov || e.target.tagName === 'BUTTON') ov.remove(); };
  document.body.appendChild(ov);
}
function startFlow() {
  const sides = setup.mode === 'hot' ? [setup.side, setup.opp] : [setup.side];
  EDF = 'sel'; EDQ = '';
  const step = (i) => { if (i > 0) { EDF = 'sel'; EDQ = ''; } armyEditor(sides[i], { i, n: sides.length, next: () => (i + 1 < sides.length ? step(i + 1) : startFromMenu()) }); };
  step(0);
}
let PEND = null;
// Quita las entradas vacías y reasigna las claves de destacamento (tipo, tipo#2…) a la lista compactada
function packArmy(cur) {
  const keyList = (L) => { const seen = {}; return L.map((e) => { const n = seen[e.type] = (seen[e.type] || 0) + 1; return n > 1 ? e.type + '#' + n : e.type; }); };
  const live = cur.filter((e) => e.models > 0).sort((a, b) => (a.ally ? 1 : 0) - (b.ally ? 1 : 0)); // el contingente aliado va al final de la lista
  const full = keyList(cur), out = live.map((e) => ({ ...e })), nk = keyList(out), map = {};
  live.forEach((e, i) => { map[full[cur.indexOf(e)]] = nk[i]; });
  for (const e of out) if (e.reg) e.reg = map[e.reg] || null;
  return out;
}
function armyEditor(side, flow) {
  const cur = normArmy(armyFor(side)).map((e) => ({ ...e, opts: e.opts ? [...e.opts] : undefined, items: e.items ? [...e.items] : undefined }));
  const byType = {};
  const index = () => { for (const k of Object.keys(byType)) delete byType[k]; const seen = {}; for (const e of cur) if (!e.ally) { const n = seen[e.type] = (seen[e.type] || 0) + 1; byType[n > 1 ? e.type + '#' + n : e.type] = e; } const sa = {}; for (const e of cur) if (e.ally) { let n = (sa[e.type] = (sa[e.type] || 0) + 1) + 1; while (byType[e.type + '#' + n]) n++; byType[e.type + '#' + n] = e; } }; // las unidades del contingente aliado llevan siempre clave «tipo#n» (n≥2)
  index();
  UI.allyPick = UI.allyPick || {}; { const ex = cur.find((e) => e.ally && e.models); if (ex) UI.allyPick[side] = ex.ally; else if (!allyOptsFor(side, (setup.lists || {})[side] || 'grand', side === setup.opp && side !== setup.side ? 1 : 0).some((o) => o.key === UI.allyPick[side])) UI.allyPick[side] = null; }
  const ownerOf = () => (side === setup.opp && side !== setup.side ? 1 : 0), AK = () => UI.allyPick[side] || null, XO = () => { const k = AK(); return k || setup.doubles ? allyXo(setup.scn, ownerOf(), side, (setup.lists || {})[side] || 'grand', k, !!setup.doubles) : null; }; // Dobles: las reglas de la Guía (cada lista como mucho la mitad) valen también sin lista secundaria elegida
  // Solo se impide lo que rompe un máximo de la lista; los mínimos (Básicas, tropas, General…) se exigen al empezar la batalla
  const isMin = (x) => /^Necesitas|^Mínimo [23]|Unidades básicas|: al menos|requieren|exigen|^Aliados \([^)]*\): (el contingente necesita|Mínimo [23])/.test(x.replace(/^Dobles \([^)]*\): /, '')); // en dobles los avisos de la lista secundaria llevan el prefijo «Dobles (secundaria …): »
  const hardOf = () => armyIssues(cur, setup.limit, setup.comp, (setup.lists || {})[side] || 'grand', XO()).filter((x) => !isMin(x));
  let good = JSON.stringify(cur), goodIss = hardOf();
  const render = () => {
    { const now = hardOf(), bad = now.filter((x) => !goodIss.includes(x));
      if (bad.length) { const g = JSON.parse(good); cur.length = 0; cur.push(...g); index(); toast('No permitido por las reglas: ' + bad[0], 'bad'); }
      else { good = JSON.stringify(cur); goodIss = now; } }
    const lst = (setup.lists || {})[side] || 'grand'; EDLIST = lst;
    const CATN = { char: 'Personajes', core: 'Básicas', special: 'Especiales', rare: 'Singulares', merc: 'Mercenarios', ally: 'Contingente aliado' }, CORD = ['char', 'core', 'special', 'rare', 'merc'];
    const catOf = (t) => compOf(t, lst) || (UNITS[t].cat === 'char' ? 'char' : UNITS[t].comp) || 'core';
    const costOf = (e) => (e && e.models > 0 ? unitCost(e.type, e.models, e.std, e.mus, e.champ, e.items, e.banner, e.arrows, e.mark, e.mix, e.opts) : 0);
    const curM = cur.filter((e) => !e.ally), CM = catsOf(curM, lst), CATS = cur.map((e) => (e.ally ? 'ally' : CM[curM.indexOf(e)])); const catPts = {}; cur.forEach((e, i) => { if (e.models > 0) { const c = CATS[i]; catPts[c] = (catPts[c] || 0) + costOf(e); } });
    let keys = [...ARMIES[side], ...mercsFor(side, lst)].filter((t) => listAllows(t, lst) || byType[t]?.models).filter((t) => EDF === 'all' || (EDF === 'sel' ? byType[t]?.models > 0 : compOf(t, lst) === EDF)).filter((t) => !EDQ || UNITS[t].name.toLowerCase().includes(EDQ.toLowerCase())).flatMap((t) => [t, ...Object.keys(byType).filter((x) => x.startsWith(t + '#') && byType[x].models > 0 && !byType[x].ally)]);
    if (EDF === 'all' || EDF === 'sel') keys = keys.map((k, i) => [k, i]).sort((a, b) => (CORD.indexOf(catOf(a[0].split('#')[0])) - CORD.indexOf(catOf(b[0].split('#')[0]))) || a[1] - b[1]).map((x) => x[0]);
    const ak = AK(), aFac = ak ? ak.split(':')[0] : null, aLst = ak ? (ak.split(':')[1] || 'grand') : 'grand', qOk = (t) => !EDQ || UNITS[t].name.toLowerCase().includes(EDQ.toLowerCase());
    if (EDF === 'ally') { keys = []; if (aFac) { const seenA = new Set(); for (const k of Object.keys(byType)) if (byType[k].ally) { seenA.add(byType[k].type); if (qOk(byType[k].type)) keys.push(k); } for (const t of [...ARMIES[aFac], ...mercsFor(aFac, aLst)]) if (!seenA.has(t) && listAllows(t, aLst) && qOk(t)) { let n = 2; while (byType[t + '#' + n]) n++; keys.push(t + '#' + n); } } }
    else if (EDF === 'sel' || EDF === 'all') keys = [...keys, ...Object.keys(byType).filter((k) => byType[k].ally && byType[k].models > 0 && qOk(byType[k].type))];
    let lastCat = null;
    const rows = keys.map((k) => {
      const t = k.split('#')[0], d = UNITS[t], BK = byType[k] || { type: t, models: 0 }, m = BK?.models || 0, cat = (BK?.ally || EDF === 'ally') ? 'ally' : catOf(t);
      let sec = '';
      if ((EDF === 'all' || EDF === 'sel' || EDF === 'ally') && cat !== lastCat) { lastCat = cat; sec = `<div class="edsec"><span>${CATN[cat] || cat}</span><small>${catPts[cat] || 0} pts · ${Math.round(100 * (catPts[cat] || 0) / (setup.doubles ? Math.floor(setup.limit / 2) : setup.limit))}%</small></div>`; }
      return `${sec}<div class="edrow ${m > 0 ? 'on' : ''}" style="--c:${FACTIONS[side].color}"><span class="ubadge" style="--c:${m > 0 ? FACTIONS[side].color : '#4a5238'}">${IC['k_' + kindOfD(d)]}</span><div class="edmain"><b>${esc(d.name)}</b>${k.includes('#') && !BK?.ally && EDF !== 'ally' ? ' <span class="muted">(copia)</span>' : ''}${RECON.has(d.faction) ? ' <span class="chip arc" title="Sin libro oficial: reglas reconstruidas según la filosofía del juego">reconstruida</span>' : ''}<div class="muted edmeta">${d.ppm} pts${d.max === 1 ? '' : '/mod'}${d.min === d.max ? '' : ` · ${d.min}–${d.max} mod.`}</div>${m > 0 ? '' : `<div class="muted edblurb">${esc(d.blurb || '')}</div>`}</div>
      <div class="edside">${m > 0 ? `<b class="edcost">${costOf(BK)}<small> pts</small></b>` : ''}<div class="stp"><button data-t="${k}" data-d="-1" aria-label="Quitar">−</button><span>${m}</span><button data-t="${k}" data-d="1" aria-label="Añadir">+</button></div></div>
      <div class="edacts"><button data-t="${k}" data-d="pv" title="Ficha de la unidad">ⓘ Ficha</button>${m > 0 && d.baseRange ? (() => { const bc = baseChoices(t), cur = bc.find((o) => o.id === (BK.base || 'std')) || bc[0]; return `<button data-t="${k}" data-d="bz" title="Peana con horquilla (Core, Base Size): se usa la peana con la que viene tu miniatura, entre ${d.baseRange.min.join('x')} (mín.) y ${d.baseRange.max.join('x')} (máx.) mm. Toca para cambiar.">Peana: ${cur.w}x${cur.d}</button>`; })() : ''}${(BK.items || []).some((x) => ITEMS[x]?.arcfam) && d.wizard && d.wizard.level >= 2 ? `<button data-t="${k}" data-d="famN" title="Familiar Arcano (FAQ Core p.17): no aumenta el número de hechizos; eliges cuántos se tiran en cada Saber">Familiar: ${BK.famN1 ?? Math.ceil(d.wizard.level / 2)}+${d.wizard.level - (BK.famN1 ?? Math.ceil(d.wizard.level / 2))}</button>` : ''}${t0Jade(k) ? `<button data-t="${k}" data-d="jsp" title="Centinela de jade: un hechizo de Magia de batalla o Elementalismo (elegido antes del despliegue), lanzado como hechizo ligado de Nivel de Poder 3">Hechizo: ${SPELLS[BK.jsp]?.name || 'Bola de Fuego'}</button>` : ''}${d.sr.includes('coven') && d.faction === 'wood' ? `<button data-t="${k}" data-d="cvsw" title="Aquelarre del Bosque Profundo: hechizo aleatorio de Batalla/Elementalismo, o la firma de uno de los dos Saberes">Hechizo: ${SPELLS[BK.cvSp]?.name || 'aleatorio'}</button>` : ''}${(BK.items || []).includes('lml_d_wander') ? wanderBtns(BK, k) : ''}${d.sr.includes('covenCursed') ? `<button data-t="${k}" data-d="cvsp" title="Aquelarre maldito: el jugador elige el hechizo (Magia Oscura o Demonología) antes del despliegue">Hechizo: ${SPELLS[BK.cvSp]?.name || 'elegir'}</button>` : ''}${m > 0 && (d.sr.includes('detachment') || d.sr.includes('wteam')) && Object.keys(byType).some((kk) => kk !== k && byType[kk].models > 0 && UNITS[byType[kk].type].sr.includes(d.sr.includes('wteam') ? 'wtParent' : 'regimental') && !byType[kk].reg) || BK?.reg ? `<button data-t="${k}" data-d="reg" title="Asignar como destacamento de una unidad regimental">Destacamento: ${BK?.reg && byType[BK.reg] ? esc(UNITS[byType[BK.reg].type].name) + (BK.reg.includes('#') ? ' ' + BK.reg.split('#')[1] : '') : '—'}</button>` : ''}${m > 0 && (d.mixRear || d.handR) ? `<span class="muted" style="display:inline-flex;gap:4px;align-items:center">${esc((d.mixRear || d.handR).label)}: <button data-t="${k}" data-d="mxm" aria-label="Menos">−</button><b>${d.handR ? handN(d, m, BK.mix) : BK.mix || 0}</b><button data-t="${k}" data-d="mxp" aria-label="Más">+</button></span>` : ''}${m > 0 && d.wizard && (d.sr.includes('masteryStorm') || ['ct_shugengan', 'ct_shugengan_gen'].includes(d.id) || (BK.items || []).some((x) => x === 'ct_cloak' || x === 'ct_seal')) ? `${d.sr.includes('masteryStorm') ? '' : `<button data-t="${k}" data-d="yy" title="Elegir Saber de Yang o de Yin">Saber: ${BK.yy === 'yin' ? 'Yin' : 'Yang'}</button>`}${[0, 1].slice(0, d.sr.includes('masteryStorm') || (BK.items || []).includes('ct_seal') ? 2 : (BK.items || []).includes('ct_cloak') && !['ct_shugengan', 'ct_shugengan_gen'].includes(d.id) ? 0 : 1).map((i) => `<button data-t="${k}" data-d="yysp${i}" title="Hechizo de Yang/Yin que sustituye a uno aleatorio">${esc(SPELLS[BK.yySp?.[i]]?.name || 'Hechizo ' + (i + 1) + ': aleatorio')}</button>`).join('')}` : ''}${m > 0 && d.legacyLore && d.wizard ? `<button data-t="${k}" data-d="legsp" title="Lore of Hashut (y lores Legacy): descarta un hechizo aleatorio y elige la firma de tu Saber o un hechizo del lore de la facción">Cambiar hechizo: ${SPELLS[BK.legSp]?.name || 'al azar'}</button>` : ''}${m > 0 ? `<button data-t="${k}" data-d="dup" title="Duplicar unidad">⧉ Duplicar</button>` : ''}${m > 0 && (d.cat === 'char' || d.runeE || hasBow(t) || spiteBudget(t) || (BK.std && ['inf', 'cav'].includes(d.cat)) || (BK.champ && champBudgetSpec(t))) ? `<button data-t="${k}" data-d="i" class="${(BK.items?.length || BK.arrows || (BK.std && BK.banner) || champItemsOf(BK.opts).length) ? 'on' : ''}" title="Objetos mágicos (según el libro)">✦ Objetos</button>` : ''}${m > 0 && marksFor(t).length ? `<button data-t="${k}" data-d="mark" title="Marca del Caos">${MARKS[BK.mark || 'undivided']}</button>` : ''}${m > 0 && (d.wizard || (BK.items || []).some((k) => k === 'wiz_hat' || k === 'h_loremaster')) && WIZ_LORES[d.faction] ? `<button data-t="${k}" data-d="lore" title="Lore de magia">${esc(LORE_NAME[(() => { const o = loresForWiz({ lists: setup.lists || {} }, side, d, BK.items || []); return o.includes(BK.lore) ? BK.lore : o.includes(d.wizard?.lore) ? d.wizard.lore : o[0]; })()])}</button>${(BK.items || []).some((x) => ITEMS[x]?.arcfam) ? `<button data-t="${k}" data-d="lore2" title="Familiar Arcano (Core p.341): segundo Lore de Magia">2.º Lore: ${esc(LORE_NAME[BK.lore2] || '(por defecto)')}</button>` : ''}` : ''}${m > 0 && d.cat === 'char' && cmdAllowed(t).std ? `<button data-t="${k}" data-d="s" class="${BK.std ? 'on' : ''}" title="Portaestandarte de Batalla: +1 resolución de combate, repetir Pánico/Reagrupar/Ruptura en alcance de mando; estandarte mágico sin límite de puntos">⚑ Estandarte</button>` : ''}${m > 0 && d.bullyOk ? `<button data-t="${k}" data-d="c" class="${BK.champ ? 'on' : ''}" title="Matón orco (+10): las máquinas amigas a 7\" usan su Liderazgo 7">Matón</button>` : ''}${m > 0 && ['inf', 'cav'].includes(d.cat) && d.max > 1 ? `<button data-t="${k}" data-d="s" class="${BK.std ? 'on' : ''}" title="Portaestandarte: +1 a la resolución de combate (coste según el libro)">⚑ Estandarte</button><button data-t="${k}" data-d="m" class="${BK.mus ? 'on' : ''}" title="Músico: desempata combates igualados, +1 Ld al marchar cerca del enemigo y al reagruparse (coste según el libro)">♪ Músico</button><button data-t="${k}" data-d="c" class="${BK.champ ? 'on' : ''}" title="Campeón: +1 Ataque en el frente de la unidad (coste según el libro)">⚔ Campeón</button>` : ''}</div>${OPEN.has(t) && m > 0 ? `<div class="edopen">${itemPanel(BK, d, k)}</div>` : ''}${m > 0 && optList(d.id).length ? `<div class="edopen">${optPanel(BK, d)}</div>` : ''}</div>`;
    }).join('');
    const catCnt = {}; cur.forEach((e, i) => { if (e.models > 0) { const c = CATS[i]; catCnt[c] = (catCnt[c] || 0) + 1; } }); const nSel = cur.filter((e) => e.models > 0).length;
    const tot = cur.reduce((t, e) => t + costOf(e), 0);
    const issues = armyIssues(cur, setup.limit, setup.comp, lst, XO()), LIM = setup.doubles ? Math.floor(setup.limit / 2) : setup.limit, pPts = cur.filter((e) => !e.ally).reduce((t, e) => t + costOf(e), 0), sPts = tot - pPts, over = setup.doubles ? pPts > LIM || sPts > LIM : tot > setup.limit, nU = cur.filter((e) => e.models > 0).length; // Dobles (matched.txt:1551-1556): cada lista se construye al mismo límite, como mucho la mitad del total
    const keepScroll = document.querySelector('#modal .ed .hbody')?.scrollTop || 0;
    const aOpts = allyOptsFor(side, lst, ownerOf()), allyOn = aOpts.length > 0 || !!ak, xo = XO(), amax = xo?.max ?? ALLY_MAX, aPts = catPts.ally || 0, aKind = aOpts.find((o) => o.key === ak)?.kind || 'trusted';
    const allyBox = allyOn ? `<div class="lbl">${setup.doubles ? 'Lista del compañero (fuerza secundaria: como mucho la mitad de los puntos)' : `Contingente aliado (hasta ${Math.round(amax * 100)} %${xo?.min ? ', al menos ' + Math.round(xo.min * 100) + ' %' : ''} de los puntos)`}</div><select id="edAlly" class="sel" style="margin:0 0 6px"><option value="">Sin aliados</option>${aOpts.map((o) => `<option value="${o.key}" ${ak === o.key ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>${ak && setup.doubles ? `<div class="muted" style="font-size:12.5px;margin:0 0 8px">Fuerza secundaria ${esc(allyName(ak))}: <b>${aPts} / ${LIM} pts</b>. Cada lista tiene su propio General y sus porcentajes, los personajes con nombre son únicos entre las dos y los puntos sin gastar de una no pasan a la otra.${aKind !== 'trusted' ? ' Alianza ' + ALLY_KIND[aKind] + '.' : ''} <button class="btn small" id="edAllyAuto">Rellenar automáticamente</button></div>` : ak ? `<div class="muted" style="font-size:12.5px;margin:0 0 8px">Contingente ${esc(allyName(ak))}: <b>${aPts} pts · ${Math.round(100 * aPts / setup.limit)} %</b> (máx. ${Math.floor(setup.limit * amax)} pts). Es un ejército en miniatura: necesita su propio General y una unidad que no sea personaje, cumple los porcentajes de su lista con sus puntos y no puede incluir unidades «0-X por 1.000 pts» si es pequeño. Sus personajes solo se unen a sus unidades; no usa la Presencia inspiradora ni «Mantened la posición» del ejército principal (ni al revés).${aKind !== 'trusted' ? ' Alianza ' + ALLY_KIND[aKind] + ': sus unidades son Levas para el ejército principal y no son «amigas» para los hechizos' + (aKind === 'suspicious' ? '; si huyen a través de la otra fuerza hacen tests de Peligro y sufren −1 Ld a 6" de ella.' : '.') : ''} <button class="btn small" id="edAllyAuto">Rellenar automáticamente</button></div>` : ''}` : '';
    openModal(`<div class="card home ed ab" style="--c:${FACTIONS[side].color}">
      <header class="hero"><div class="emblem" style="background:${FACTIONS[side].color}">${IC.army}</div><div><h1>${flow ? (flow.n > 1 ? `Jugador ${flow.i + 1}: ` : '') + 'Tu ejército' : FNAME[side]}</h1><p class="lead">${flow ? FNAME[side] + ' · ' : ''}${nU} unidad${nU === 1 ? '' : 'es'} · ${setup.comp === 'melee' ? 'Gran Refriega' : setup.comp === 'combined' ? 'Armas Combinadas' : 'Guerra abierta'}</p></div><button class="hclose" id="edX" aria-label="Cerrar sin guardar">✕</button></header>
      <div class="edsum"><div class="edtot">${setup.doubles ? `<b class="${pPts > LIM ? 'bad' : ''}">${pPts}</b><small>/ ${LIM} primaria</small><b class="${sPts > LIM ? 'bad' : ''}" style="margin-left:10px">${sPts}</b><small>/ ${LIM} secundaria</small>` : `<b class="${over ? 'bad' : ''}">${tot}</b><small>/ ${setup.limit} pts</small><span class="${over ? 'bad' : tot === setup.limit ? 'good' : ''}">${over ? '+' + (tot - setup.limit) + ' de más' : (setup.limit - tot) + ' libres'}</span>`}</div>
        <div class="bar"><i style="width:${Math.min(100, Math.round(100 * (setup.doubles ? Math.max(pPts, sPts) : tot) / LIM))}%;background:${over ? 'var(--blood)' : 'var(--brass)'}"></i></div>
        <div class="edcats">${CORD.filter((c) => catPts[c] || c !== 'merc').map((c) => `<span><small>${CATN[c]}</small><b>${Math.round(100 * (catPts[c] || 0) / LIM)}%</b></span>`).join('')}${catPts.ally ? `<span><small>${setup.doubles ? 'Secundaria' : 'Aliados'}</small><b>${Math.round(100 * catPts.ally / LIM)}%</b></span>` : ''}</div>
        <details class="edval ${issues.length ? 'bad' : 'good'}" ${issues.length && UI.edValOpen !== false ? 'open' : ''} id="edVal"><summary>${issues.length ? `⚠ ${issues.length} ${issues.length === 1 ? 'aviso' : 'avisos'} en la lista` : '✓ Lista válida'}</summary>${issues.map((i) => `<div>${esc(i)}</div>`).join('')}</details>
      </div>
      <div class="hbody">${LISTS[side] ? `<div class="lbl" style="margin-top:0">Lista de ejército</div><div class="seg" id="edList" style="margin:0 0 10px">${Object.entries(LISTS[side]).map(([k, n]) => `<button data-v="${k}" class="${lst === k ? 'on' : ''}">${esc(n)}</button>`).join('')}</div>` : ''}${allyBox}<input id="edQ" class="edq" type="search" placeholder="Buscar unidad…" value="${esc(EDQ)}" autocomplete="off"><div class="seg fil" id="edFil">${[['sel', 'Mi lista', nSel], ...CORD.map((c) => [c, CATN[c], catCnt[c] || 0]), ...(allyOn ? [['ally', 'Aliados', catCnt.ally || 0]] : []), ['all', 'Todo', null]].map(([k, n, c]) => `<button data-v="${k}" class="${EDF === k ? 'on' : ''}">${n}${c ? ` <b>${c}</b>` : ''}</button>`).join('')}</div>${rows || (EDF === 'sel' && !EDQ ? `<div class="edempty"><b>Tu lista está vacía</b><p class="muted">Añade unidades por categoría:</p><div class="row">${CORD.map((c) => `<button class="btn small" data-go="${c}">+ ${CATN[c]}</button>`).join('')}</div></div>` : '')} ${rows ? '' : EDF === 'sel' && !EDQ ? '' :  '<p class="muted" style="text-align:center;margin:30px 0">Nada en este filtro.</p>'}</div>
      <footer class="mfoot"><button class="btn primary cta" id="edOk">${flow ? (flow.i + 1 < flow.n ? `Siguiente: ${esc(FNAME[setup.opp])} ▸` : IC.play + ' Empezar batalla') : 'Guardar ejército'}</button><div class="mrow">${flow ? '<button class="btn" id="edSave">Guardar y volver</button>' : ''}<button class="btn" id="edReset">Lista recomendada</button>${EXAMPLES[side] ? `<button class="btn" id="edEx" title="Muster List del Battle March General's Companion">Ejemplo: ${esc(EXAMPLES[side].name)}</button>` : ''}<button class="btn" id="edCopy">Copiar lista</button><button class="btn" id="edClear">Vaciar</button></div></footer></div>`);
    if (PEND) { const e2 = byType[PEND.k], nb = costOf(e2), dl = nb - PEND.b0; if (dl) toast(`${PEND.name}: ${dl > 0 ? '+' : ''}${dl} pts → unidad ${nb} pts · ejército ${tot}/${setup.limit}`, dl > 0 && tot > setup.limit ? 'bad' : undefined); PEND = null; }
    { const hb = document.querySelector('#modal .ed .hbody'); if (hb) hb.scrollTop = keepScroll; const dv = $('edVal'); if (dv) dv.addEventListener('toggle', () => { UI.edValOpen = dv.open; }); }
    $('edX').onclick = () => showMenu();
    if ($('edAlly')) $('edAlly').onchange = (ev2) => { const v = ev2.target.value || null; UI.allyPick[side] = v; for (let i = cur.length - 1; i >= 0; i--) if (cur[i].ally && cur[i].ally !== v) cur.splice(i, 1); index(); good = JSON.stringify(cur); goodIss = hardOf(); EDF = v ? 'ally' : 'sel'; render(); };
    if ($('edAllyAuto')) $('edAllyAuto').onclick = () => {
      const key = AK(), xo2 = XO(), mx = xo2?.max ?? ALLY_MAX, tgt = xo2 && xo2.min > 0 ? (xo2.min + mx) / 2 : mx, free = setup.limit - cur.filter((e) => !e.ally).reduce((t, e) => t + costOf(e), 0), budget = Math.min(Math.floor(setup.limit * tgt), free);
      const r = key ? autoAlly(key, budget, !!setup.doubles) : [];
      if (!r.length) { toast(`No cabe un contingente aliado con los ${Math.max(0, budget)} pts disponibles`, 'bad'); return; }
      for (let i = cur.length - 1; i >= 0; i--) if (cur[i].ally) cur.splice(i, 1);
      cur.push(...r.map((e) => ({ ...e }))); index(); good = JSON.stringify(cur); goodIss = hardOf(); EDF = 'ally'; render();
    };
    $('edClear').onclick = () => { for (const e of cur) e.models = 0; render(); };
    $('edCopy').onclick = async () => {
      const txt = `${FNAME[side]} · ${tot} pts\n` + CORD.map((c) => { const us = cur.filter((e) => e.models > 0 && catOf(e.type) === c); return us.length ? `\n${CATN[c]} (${catPts[c] || 0} pts)\n` + us.map((e) => `- ${e.models > 1 ? e.models + ' ' : ''}${UNITS[e.type].name}${[e.std && 'estandarte', e.mus && 'músico', e.champ && 'campeón', ...(e.items || []).map((k) => ITEMS[k]?.name), e.banner && ITEMS[e.banner]?.name].filter(Boolean).length ? ' (' + [e.std && 'estandarte', e.mus && 'músico', e.champ && 'campeón', ...(e.items || []).map((k) => ITEMS[k]?.name), e.banner && ITEMS[e.banner]?.name].filter(Boolean).join(', ') + ')' : ''} — ${costOf(e)} pts`).join('\n') : ''; }).join('\n');
      try { await navigator.clipboard.writeText(txt.trim()); $('edCopy').textContent = '✓ Copiada'; } catch { $('edCopy').textContent = 'No se pudo copiar'; }
    };
    document.querySelectorAll('.edrow button').forEach((b) => (b.onclick = () => {
      const k = b.dataset.t, t = k.split('#')[0], d = UNITS[t], dir = +b.dataset.d;
      if (b.dataset.d === 'pv') { unitPreview(t); return; }
      if (b.dataset.d === 'dup') { let n = 2; while (byType[t + '#' + n]) n++; const ne = { type: t, ...(byType[k]?.ally ? { ally: byType[k].ally } : {}), models: Math.max(d.min, 1), mix: d.mixRear && !d.mixRear.optional ? d.mixRear.min : 0 }; byType[t + '#' + n] = ne; cur.push(ne); render(); return; }
      let e = byType[k]; if (!e) { e = { type: t, models: 0, ...(EDF === 'ally' && AK() ? { ally: AK() } : {}) }; byType[k] = e; cur.push(e); }
      if (b.dataset.d === 'i') { OPEN.has(t) ? OPEN.delete(t) : OPEN.add(t); render(); return; }
      // Configurar algo en una unidad aún no incluida la añade automáticamente (sus puntos cuentan al instante)
      if (!e.models && !['-1', '1'].includes(b.dataset.d)) { e.models = Math.max(d.min || 1, 1); if (d.mixRear && !d.mixRear.optional) e.mix = d.mixRear.min; }
      PEND = { k, b0: costOf(e), name: d.name };
      if (b.dataset.d === 'ci') { const id = 'ci:' + b.dataset.k; e.opts = e.opts || []; if (e.opts.includes(id)) e.opts = e.opts.filter((x) => x !== id); else { e.opts.push(id); const iss = champIssues(e.type, e.opts, e.champ, setup.comp); if (iss.length) { e.opts.pop(); toast(iss[0], 'bad'); } } render(); return; }
      if (b.dataset.d === 'it') {
        const k = b.dataset.k;
        if (d.cat === 'char' || d.runeE || d.monItems || ITEMS[k].fspite) { e.items = e.items || []; if (ITEMS[k].maxN && e.items.filter((x) => x === k).length >= ITEMS[k].maxN) e.items = e.items.filter((x) => x !== k); else if (ITEMS[k].star || ITEMS[k].dup || !e.items.includes(k)) e.items.push(k); else e.items.splice(e.items.indexOf(k), 1); } else e.banner = e.banner === k ? null : k;
        render(); return;
      }
      if (b.dataset.d === 'jsp') { const JP = [LORES.battle.sig, ...LORES.battle.pool, LORES.elementalism.sig, ...LORES.elementalism.pool].filter((q) => SPELLS[q]), cur = JP.includes(e.jsp) ? e.jsp : 'fireball'; e.jsp = JP[(JP.indexOf(cur) + 1) % JP.length]; render(); return; }
      if (b.dataset.d === 'bz') { const bc = baseChoices(e.type), i = bc.findIndex((o) => o.id === (e.base || 'std')), nx = bc[(i + 1) % bc.length]; e.base = nx.id === 'std' ? undefined : nx.id; render(); return; }
      if (b.dataset.d === 'famN') { const lv = UNITS[e.type]?.wizard?.level || 2, cur = e.famN1 ?? Math.ceil(lv / 2); e.famN1 = cur >= lv - 1 ? 1 : cur + 1; render(); return; }
      if (b.dataset.d === 'cvsw') { const O = [undefined, LORES.battle.sig, LORES.elementalism.sig]; e.cvSp = O[(O.indexOf(e.cvSp) + 1) % O.length]; if (e.cvSp === undefined) delete e.cvSp; render(); return; }
      if (b.dataset.d === 'wander') { const lk = b.dataset.v, sl = e.wanderL || []; e.wanderL = sl.includes(lk) ? sl.filter((x) => x !== lk) : sl.length < 4 ? [...sl, lk] : sl; if (e.wanderDrop && !e.wanderL.includes(e.wanderDrop)) { e.wanderDrop = undefined; e.wanderLu = undefined; } render(); return; }
      if (b.dataset.d === 'wanderLu') { const sl = e.wanderL || [], opts = [[undefined, undefined], ...sl.flatMap((lk) => ['apotheosis', 'monsoon'].map((sp) => [lk, sp]))], ix = opts.findIndex(([a, c]) => a === e.wanderDrop && c === e.wanderLu); [e.wanderDrop, e.wanderLu] = opts[(ix + 1) % opts.length]; render(); return; }
      if (b.dataset.d === 'legsp') { const lkk = e.lore || d.wizard?.lore, P = [...new Set([...(UNITS[e.type].legacyLore || []), ...(LORES[lkk]?.sig ? [LORES[lkk].sig] : [])])].filter((q) => SPELLS[q]); e.legSp = [undefined, ...P][([undefined, ...P].indexOf(e.legSp) + 1) % (P.length + 1)]; render(); return; }
      if (b.dataset.d === 'cvsp') { const P = [...LORES.dark.pool, LORES.dark.sig, ...LORES.daemonology.pool, LORES.daemonology.sig].filter((q) => SPELLS[q]); e.cvSp = P[(P.indexOf(e.cvSp) + 1) % P.length]; render(); return; }
      if (b.dataset.d === 'yy') { e.yy = e.yy === 'yin' ? 'yang' : 'yin'; e.yySp = []; render(); return; }
      if (/^yysp\d$/.test(b.dataset.d)) { const i = +b.dataset.d.slice(4), o = [null, ...yyOptions(d.id, e.yy, null)], c = o.indexOf((e.yySp || [])[i] || null); e.yySp = [...(e.yySp || [])]; e.yySp[i] = o[(c + 1) % o.length]; render(); return; }
      if (b.dataset.d === 'mark') { const o = marksFor(t), c = e.mark || 'undivided'; e.mark = o[(o.indexOf(c) + 1) % o.length]; render(); return; }
      if (b.dataset.d === 'lore2') { const o = loresForWiz({ lists: setup.lists || {} }, side, d, e.items || []).filter((l) => l !== (e.lore || d.wizard?.lore)); if (!o.length) return; const i = o.indexOf(e.lore2); e.lore2 = o[(i + 1) % o.length]; render(); return; } // v831 Familiar Arcano: el jugador elige el segundo Lore (v843u: misma función que el resto)
      if (b.dataset.d === 'lore') { const o = loresForWiz({ lists: setup.lists || {} }, side, d, e.items || []), c = o.includes(e.lore) ? e.lore : o.includes(d.wizard?.lore) ? d.wizard.lore : o[0]; e.lore = o[(o.indexOf(c) + 1) % o.length]; render(); return; } // v843u: los Saberes salen de loresForWiz (rules.js), la misma función que usa la partida
      if (b.dataset.d === 'bn') {
        e.banner = e.banner === b.dataset.k ? null : b.dataset.k; render(); return;
      }
      if (b.dataset.d === 'opn') { const id = b.dataset.k, v = +b.dataset.v, cs = optList(e.type).filter((o) => o.cnt).map((o) => o.id); e.opts = e.opts || []; const tot = e.opts.filter((x) => cs.includes(x) && !optList(e.type).find((o) => o.id === x)?.vial).length; if (v > 0) { if (optList(e.type).find((o) => o.id === id)?.vial || tot < e.models) e.opts.push(id); else toast('Cada modelo solo puede llevar un arma', 'bad'); } else { const i = e.opts.indexOf(id); if (i >= 0) e.opts.splice(i, 1); } render(); return; }
      if (b.dataset.d === 'op') { const id = b.dataset.k, os = optList(e.type), o = os.find((x) => x.id === id); e.opts = e.opts || []; if (e.opts.includes(id)) e.opts = e.opts.filter((x) => x !== id); else { if (o?.group) e.opts = e.opts.filter((x) => os.find((y) => y.id === x)?.group !== o.group); e.opts.push(id); } e.opts = e.opts.filter((x) => { const y = os.find((z) => z.id === x); return !y?.req || y.req.every((r) => e.opts.includes(r)); }); render(); return; }
      if (b.dataset.d === 'ar') { e.arrows = e.arrows === b.dataset.k ? null : b.dataset.k; render(); return; }
      if (b.dataset.d === 'ix') { const k = b.dataset.k; e.items.splice(e.items.indexOf(k), 1); render(); return; }
      if (b.dataset.d === 's') { if (!cmdAllowed(e.type).std) return; e.std = !e.std; if (!e.std) e.banner = null; render(); return; }
      if (b.dataset.d === 'reg') { const opts = ['', ...Object.keys(byType).filter((kk) => kk !== k && !byType[kk].ally && !e.ally && byType[kk].models > 0 && UNITS[byType[kk].type].sr.includes(d.sr.includes('wteam') ? 'wtParent' : 'regimental') && (!byType[kk].reg) && (Object.values(byType).filter((x) => x.reg === kk).length < (d.sr.includes('wteam') ? 1 : 2) || e.reg === kk))]; const i0 = opts.indexOf(e.reg || ''); e.reg = opts[(i0 + 1) % opts.length] || null; if (e.reg && d.sr.includes('wteam')) { e.models = 1; } else if (e.reg) { e.std = e.mus = e.champ = false; e.banner = null; const par = byType[e.reg]; e.models = Math.max(Math.min(5, d.min), Math.min(e.models, Math.floor(par.models / 2))); } render(); return; }
      if (b.dataset.d === 'm') { e.mus = !e.mus; render(); return; }
      if (b.dataset.d === 'c') { e.champ = !e.champ; if (!e.champ && e.opts) e.opts = e.opts.filter((x) => !(typeof x === 'string' && x.startsWith('ci:'))); render(); return; }
      const fixMix = () => { if (d.handR) { e.mix = e.models ? handN(d, e.models, e.mix) : 0; return; } const mr = d.mixRear; if (!mr) return; if (!e.models) { e.mix = 0; return; } e.mix = mr.optional ? Math.max(0, Math.min(e.mix || 0, Math.floor(e.models / (mr.perFront + 1)))) : Math.max(mixMinOf(mr, e.models), Math.min(e.mix || mr.min, e.models - mr.minFront)); };
      if (b.dataset.d === 'mxp' || b.dataset.d === 'mxm') { const mr = d.mixRear; e.mix = (d.handR ? handN(d, e.models, e.mix) : e.mix || 0) + (b.dataset.d === 'mxp' ? 1 : -1); fixMix(); render(); return; }
      const step = d.max === 1 ? 1 : d.cat === 'cav' ? 1 : 5;
      const dmin = e.reg && d.sr.includes('detachment') ? Math.min(5, d.min) : d.min;
      if (dir > 0) e.models = e.models === 0 ? dmin : Math.min(d.max, e.models + step);
      if (dir > 0 && d.sr.includes('wteam') && !e.reg) { const pk = Object.keys(byType).find((kk) => kk !== k && byType[kk].models > 0 && UNITS[byType[kk].type].sr.includes('wtParent') && !byType[kk].reg && !Object.values(byType).some((x) => x.reg === kk)); if (pk) e.reg = pk; } // equipo de armas: se adjunta solo a una unidad matriz libre
      else e.models = e.models - step < dmin ? 0 : e.models - step;
      fixMix();
      render();
    }));
    $('edOk').onclick = () => {
      const army = packArmy(cur);
      if (!army.length) { toast('Añade al menos una unidad', 'bad'); return; }
      if (flow && issues.length) { toast('La lista no cumple las reglas: ' + issues[0], 'bad'); const dv = $('edVal'); if (dv) { dv.open = true; dv.scrollIntoView({ block: 'nearest' }); } return; }
      setup.armies[side] = army; if (flow) { closeModal(); flow.next(); } else showMenu();
    };
    if ($('edSave')) $('edSave').onclick = () => { setup.armies[side] = packArmy(cur); showMenu(); };
    document.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { EDF = b.dataset.go; render(); }));
    { const q = $('edQ'); if (q) { q.oninput = () => { EDQ = q.value; render(); const n = $('edQ'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }; } }
    document.querySelectorAll('#edFil button').forEach((b) => (b.onclick = () => { EDF = b.dataset.v; render(); }));
    document.querySelectorAll('#edList button').forEach((b) => (b.onclick = () => { setup.lists = { ...(setup.lists || {}), [side]: b.dataset.v }; store.set('tow_lists', setup.lists); render(); }));
    $('edReset').onclick = () => { setup.armies[side] = null; showMenu(); };
    if ($('edEx')) $('edEx').onclick = () => { const x = EXAMPLES[side]; setup.armies[side] = x.army.map((e) => ({ ...e, opts: e.opts ? [...e.opts] : undefined, items: e.items ? [...e.items] : undefined })); toast(`${x.name} cargada${x.note ? '. ' + x.note : ''}`); showMenu(); };
  };
  render();
}

function showHow() {
  openModal(`<div class="card"><h1>Cómo se juega</h1>
  <p class="lead">Seis turnos por bando. Gana quien más puntos de victoria obtenga destruyendo o poniendo en fuga a los regimientos enemigos (o rompiendo su ejército).</p>
  <p><b>Despliegue.</b> Arrastra tus unidades dentro de tu zona de despliegue (sombreada; depende del escenario) y pulsa «¡Listo!». Selecciona una unidad para girarla o cambiar su frente.</p>
  <p><b>Turno.</b> Estrategia (reagrupar huidos y lanzar hechizos) → Movimiento (mover, marchar o cargar) → Disparo → Combate (se resuelve solo).</p>
  <p><b>Mover.</b> Elige la unidad, pulsa Mover o Marchar y toca o arrastra el destino. El fantasma verde indica un movimiento válido. Marchar dobla el movimiento pero no se puede si hay enemigos a 8".</p>
  <p><b>Cargar.</b> Elige una unidad y un objetivo resaltado en rojo. La carga tiene éxito si la distancia es menor que M + el mayor de 2D6; cargar da Iniciativa extra. Atacar de flanco (+1) o de retaguardia (+2) da bonificación de resolución.</p>
  <p><b>Sombreado del rival.</b> Tras el turno del rival verás en ámbar de dónde partió cada unidad, flechas de movimiento y cargas, líneas de disparo y hechizos, y aros en las unidades afectadas. El ojo 👁 lo oculta; el Registro lo detalla.</p>
  <p><b>Vista 3D.</b> El juego se ve siempre en 3D (estilo mesa de juego). Arrastra el fondo para mover el mapa, usa ⤡ para inclinar la cámara (pulsa de nuevo para soltarlo), ⟳ para girar la mesa y ⤢ para alternar mesa entera / acercarse a tu lado; 🔊 activa o silencia los efectos de sonido.</p>
  <p><b>Reglas.</b> Perfiles, puntos y reglas del reglamento oficial de Warhammer: The Old World. Los personajes sin magia empiezan unidos a una unidad (★) y pueden separarse o unirse en el despliegue y el movimiento. Se simplifican las opciones de equipo y el despliegue alterno.</p>
  <p><b>Escenarios y terreno.</b> En el menú eliges uno de ocho escenarios de los libros (zonas, objetivo central o torre), el terreno (clásico, aleatorio según reglas o personalizado con el editor) y un objetivo secundario (puntos estratégicos o dominio de cuartos). Bosques y pantanos son terreno difícil; las colinas bloquean la visión; las ruinas bloquean el paso.</p>
  <p><b>Desafíos.</b> Al empezar cada combate, un personaje o campeón puede desafiar a uno enemigo: ambos luchan solo entre sí, el exceso de heridas suma hasta +5 a la resolución, y quien rechaza retira a un personaje a la retaguardia (no lucha ni presta su Liderazgo). En el panel de la unidad eliges si sus desafíos son automáticos, siempre o nunca.</p>
  <p><b>Mando.</b> En el editor de ejército, ⚑ añade portaestandarte (+1 resolución), ♪ músico (desempata combates igualados, +1 Ld al marchar y al reagruparse) y ⚔ campeón (+1 Ataque). Dos personajes unidos a unidades enfrentadas se desafían entre sí.</p>
  <div class="row"><button class="btn primary" id="hwOk">Entendido</button></div></div>`);
  $('hwOk').onclick = () => { closeModal(); if (!G) showMenu(); else showMenu(); };
}

// ---------- modo código ----------
async function encode(obj) {
  const raw = JSON.stringify(obj);
  try {
    if (typeof CompressionStream !== 'undefined') {
      const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(raw)); w.close();
      const buf = new Uint8Array(await new Response(cs.readable).arrayBuffer());
      return 'z:' + btoa(String.fromCharCode(...buf));
    }
  } catch { /* texto plano */ }
  return 'p:' + btoa(unescape(encodeURIComponent(raw)));
}
async function decodeCode(code) {
  const c = code.replace(/\s+/g, '');
  if (c.startsWith('z:')) {
    const bin = Uint8Array.from(atob(c.slice(2)), (ch) => ch.charCodeAt(0));
    const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); w.write(bin); w.close();
    return JSON.parse(await new Response(ds.readable).text());
  }
  if (c.startsWith('p:')) return JSON.parse(decodeURIComponent(escape(atob(c.slice(2)))));
  throw new Error('formato desconocido');
}
async function showCodeModal(kind) {
  let code = '', title = '', lead = '';
  if (kind === 'setup') {
    code = await encode({ t: 'setup', seed: G.seed, limit: G.limit, factions: G.factions, armies: G.armies, tcfg: G.tcfg });
    title = 'Invita a tu rival'; lead = 'Envíale este código (mensaje, correo…). Él debe elegir «Unirme con un código» en el menú. Mientras, despliega tu ejército y pulsa «¡Listo!».';
  } else if (kind === 'pend') { // v832: decisión del rival en mitad de mi acción (reacción a la carga, Pánico, Persecución…): le paso las jugadas hechas y la acción pendiente; me devolverá su respuesta
    code = await encode({ t: 'turn', from: G.synced, acts: G.actions.slice(G.synced), rng: G.s.rng, pend: G.pend.a });
    G.lastCode = code; G.synced = G.actions.length; save();
    title = 'Decide tu rival'; lead = `Tu rival debe decidir ahora: «${esc(G.pend.need.title)}». Envíale este código; cuando te devuelva su respuesta, pégala aquí y la acción seguirá.`;
  } else if (kind === 'ans') {
    code = G.ansCode; title = 'Tu respuesta'; lead = 'Envía este código a tu rival: su acción seguirá con tu decisión.';
  } else if (kind === 'turn') {
    code = await encode({ t: 'turn', from: G.synced, acts: G.actions.slice(G.synced), rng: G.s.rng });
    G.lastCode = code; G.synced = G.actions.length; save();
    title = 'Tu turno ha terminado'; lead = 'Envía este código a tu rival. Cuando juegue, te enviará el suyo.';
  } else if (kind === 'last') {
    code = G.lastCode; title = 'Esperando a tu rival'; lead = 'Este es tu último código (por si no le llegó). Pega aquí el código de su turno cuando lo tengas.';
  } else {
    title = 'Esperando a tu rival'; lead = 'Pega aquí el código de su turno.';
  }
  const paste = kind === 'setup' ? '' : `<div class="lbl">Código del rival</div><textarea class="code" id="inCode" placeholder="Pega aquí el código…"></textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="cApply">Aplicar código</button></div>`;
  openModal(`<div class="card"><h1>${title}</h1><p class="lead">${lead}</p>${code ? `<textarea class="code" id="outCode" readonly>${code}</textarea><div class="row" style="margin-top:8px"><button class="btn" id="cCopy">Copiar código</button></div>` : ''}${paste}
  <div class="row" style="margin-top:12px"><button class="btn" id="cClose">${kind === 'wait' ? 'Ver el tablero' : 'Cerrar'}</button></div></div>`);
  if ($('cCopy')) $('cCopy').onclick = async () => { try { await navigator.clipboard.writeText(code); toast('Código copiado'); } catch { $('outCode').select(); toast('Selecciónalo y cópialo'); } };
  if ($('cApply')) $('cApply').onclick = () => importTurn($('inCode').value);
  $('cClose').onclick = closeModal;
  renderPanel();
}
// v843l: modo por código: las jugadas del rival se repiten en mi dispositivo con los mismos avisos y tablas ANTES de cada tirada o efecto (solo los míos: los suyos ya los vio él); mismo estado final (los avisos no gastan dados)
async function replayAck(a0) {
  if (window.__TOW_NOACK || G.mode !== 'code') return apply(G.s, a0);
  const a = { ...a0, ans: { ...(a0.ans || {}) } };
  for (let i = 0; i < 600; i++) {
    const snap = structuredClone(G.s); G.s.askMode = { ack: { [G.myOwner]: true } };
    try { const r = apply(G.s, a); G.s.askMode = null; return r; } catch (e) {
      G.s.askMode = null; G.s = snap; if (!e.need || !e.need.ack) { if (!e.need) throw e; return apply(G.s, a0); }
      renderAll(); await pickAck(e.need); a.ans[e.need.k] = 'ok';
    }
  }
  return apply(G.s, a0);
}
async function importTurn(text) {
  try {
    const d = await decodeCode(text);
    if (d.t === 'ans') { // v832: respuesta del rival a una decisión en mitad de mi acción: la acción sigue con ella
      if (!G.pend) throw new Error('no hay ninguna decisión pendiente');
      if (d.from !== G.actions.length) throw new Error(`no continúa tu partida (esperaba la jugada ${G.actions.length}, recibí ${d.from})`);
      const a = { ...G.pend.a, ans: { ...(G.pend.a.ans || {}), ...(d.ans || {}) } }; G.pend = null; G.waiting = false; closeModal(); save();
      const r = dispatch(a); if (r && r.wait) await r.wait; return;
    }
    if (d.t !== 'turn') throw new Error('no es un código de turno');
    if (d.from !== G.actions.length) throw new Error(`no continúa tu partida (esperaba la jugada ${G.actions.length}, recibí ${d.from})`);
    G.replaying = true;
    for (const a of d.acts) { const r = await replayAck(a); if (!r.ok) throw new Error('jugada inválida: ' + r.error); G.actions.push(a); handleEvents(r.events, false); }
    G.replaying = false;
    G.synced = G.actions.length; G.waiting = false;
    if (d.rng !== G.s.rng) toast('Aviso: las partidas podrían estar desincronizadas', 'bad');
    closeModal(); afterChange(); save();
    if (d.pend) { G.waiting = true; await answerPend(d.pend); }
  } catch (e) { G.replaying = false; toast('Código no válido: ' + e.message, 'bad'); }
}
// v832: el rival me pasa su acción pendiente: respondo con los mismos popups las decisiones que me tocan (sin aplicar la acción: la termina él) y le devuelvo mis respuestas
async function answerPend(a0) {
  const a = { ...a0, ans: { ...(a0.ans || {}) } }, mine = {};
  for (let i = 0; i < 80; i++) {
    const snap = structuredClone(G.s); let need = null;
    try { G.s.askMode = { 0: true, 1: true }; apply(G.s, a); } catch (e) { if (!e.need) { G.s = snap; throw e; } need = e.need; }
    G.s.askMode = null; G.s = snap;
    if (!need || need.p !== G.myOwner) break;
    renderAll(); const v = await pickChoice(need); a.ans[need.k] = v; mine[need.k] = v;
  }
  G.ansCode = await encode({ t: 'ans', from: G.actions.length, ans: mine }); save(); renderAll(); showCodeModal('ans');
}
function codeTurnHook() {
  const s = G.s;
  if (s.phase === 'over') return;
  if (s.active !== G.myOwner && s.phase !== 'deploy') { G.waiting = true; showCodeModal(G.actions.length > G.synced ? 'turn' : 'wait'); }
}

// ---------- panel ----------
function renderAll() { if (!G) return; renderUndo(); G.s.hideFlank = G.s.alt && G.s.alt.phase === 'fsel' ? viewer() : null; G.s.objOwner = objectiveOwner(G.s); renderTop(); renderPanel(); renderPlacebar(); dirty = true; }

function renderTop() {
  const s = G.s;
  const act = s.phase === 'deploy' ? null : s.active;
  const tsuf = s.gend === 'fixed' || !s.gend ? '/' + MAX_TURNS : s.gend === 'random' ? '+' : '';
  $('turninfo').innerHTML = s.phase === 'deploy' ? `<span class="tbadge">Despliegue</span>` : s.phase === 'over' ? '<span class="tbadge">Fin de la batalla</span>'
    : `<span class="tbadge" title="Turno ${s.turn}"><small>T</small>${s.turn}<i>${tsuf}</i></span><span class="tplayer" style="--c:${FACTIONS[s.factions[act]].color}"><i></i><b>${fname(act)}</b>${G.mode === 'ai' ? `<em>${act === 0 ? 'tú' : 'IA'}</em>` : ''}</span>`;
  const names = [['strategy', 'Estrategia'], ['move', 'Movimiento'], ['shoot', 'Disparo'], ['combat', 'Combate']];
  const idx = names.findIndex((n) => n[0] === s.phase);
  $('phases').innerHTML = s.phase === 'deploy' || s.phase === 'over' ? '' : names.map((n, i) => `<span class="ph ${i === idx ? 'on' : i < idx ? 'done' : ''}" title="${n[1]}">${IC[n[0]]}<em>${n[1]}</em></span>`).join('');
  // rótulo de cambio de fase
  { const key = s.phase + ':' + s.turn + ':' + s.active; if (UI.phaseKey !== key) { const first = UI.phaseKey === undefined; UI.phaseKey = key; if (!first && idx >= 0 && !G.demo) splash(names[idx][1], `Turno ${s.turn} · ${fname(act)}`, FACTIONS[s.factions[act]].color, IC[names[idx][0]]); } }
  { const on = $('phases').querySelector('.on'); if (on) { const P = $('phases'); P.scrollLeft = Math.max(0, on.offsetLeft - P.offsetLeft - 8); } }
}

// Características que intervienen en la fase actual para esta unidad (se recuadran en amarillo), según su papel (activa / defensora) y su situación
function statHiInfo(u) {
  const s = G && G.s; if (!s || !u || u.models <= 0 || ['deploy', 'over'].includes(s.phase)) return { k: [], why: [] };
  const act = u.owner === s.active, eng = isEngaged(s, u), d = D(u), k = new Set(), why = [], add = (ks, w) => { ks.forEach((x) => k.add(x)); why.push(w); };
  if (s.phase === 'strategy') {
    if (act) { if (u.fleeing) add(['Ld'], 'Ld: reagrupar'); if (d.general || (u.joined || []).some((j) => D(j).general)) add(['Ld'], 'Ld: alcance de mando del General'); if (d.wizard && !eng) why.push('Mago: lanza hechizos (nivel, no una característica)'); }
    else if (!eng) add(['R', 'H', 'Sv'], 'R, H y Sv: defensa ante la magia del rival');
    if (!act && d.wizard && !eng) why.push('Mago: puede intentar dispersar');
  } else if (s.phase === 'move') {
    if (act) { if (!eng) add(['M'], 'M: mover, marchar o cargar'); if (u.fleeing) add(['M', 'Ld'], 'M y Ld: huida y reagrupar'); if (!eng) add(['Ld'], 'Ld: chequeos de Pánico, Miedo o Terror'); }
    else { add(['Ld'], 'Ld: reacción a la carga (chequeos de Miedo/Terror/Pánico)'); if (rangedOf(u)) add(['HP'], 'HP: Plantarse y disparar'); add(['R', 'H', 'Sv'], 'R, H y Sv: si es cargada'); if (!eng) add(['M'], 'M: Evadir/Huir como reacción'); }
  } else if (s.phase === 'shoot') {
    if (act) { if (rangedOf(u) && !eng) add(['HP'], 'HP: impactar al disparar'); add(['Ld'], 'Ld: Pánico si sufre bajas'); }
    else { add(['R', 'H', 'Sv'], 'R, H y Sv: defensa ante disparos'); add(['Ld'], 'Ld: Pánico por bajas'); }
  } else if (s.phase === 'combat') {
    if (eng) add(['HA', 'F', 'R', 'H', 'I', 'A', 'Sv', 'Ld'], 'Combate: HA/F/A atacan, I fija el orden, R/Sv/H defienden, Ld: chequeo de ruptura');
    else if (u.fleeing) add(['Ld'], 'Ld: reagrupar');
  }
  return { k: [...k], why };
}
const statHi = (u) => statHiInfo(u).k;
// v843q (punto 3): sin leyenda fija; la razón de una casilla resaltada se da solo al tocarla (en su contexto)
function statWhy(u, key) {
  const w = statHiInfo(u).why.filter((x) => { const pre = x.split(':')[0]; return pre === 'Combate' || pre.split(/,| y /).map((z) => z.trim()).includes(key); });
  return w.length ? w.map((x) => x.replace(/^Combate:\s*/, '')).join(' · ') : '';
}
document.addEventListener('click', (e) => { // v843q: la razón de una casilla resaltada solo se muestra al tocarla
  const c = e.target.closest && e.target.closest('table.stats .hl'); if (!c || !G) return;
  const tb = c.closest('table.stats'), idx = [...c.parentNode.children].indexOf(c), key = tb.rows[0].cells[idx].textContent.trim();
  const u = G.s.units.find((x) => x.id === UI.sel); if (!u) return; const w = statWhy(u, key); if (w) toast(`${key}: ${w}`);
});
function statRow(d, hi = []) {
  const sv = d.Sv >= 7 ? '—' : d.Sv + '+', H = (k) => (hi.includes(k) ? ' class="hl"' : '');
  return `<table class="stats"><tr>${['M', 'HA', 'HP', 'F', 'R', 'H', 'I', 'A', 'Ld', 'Sv'].map((h) => `<th${H(h)}>${h}</th>`).join('')}</tr><tr><td${H('M')}>${d.M}</td><td${H('HA')}>${d.WS}</td><td${H('HP')}>${d.BS}</td><td${H('F')}>${d.S}</td><td${H('R')}>${d.T}</td><td${H('H')}>${d.W}</td><td${H('I')}>${d.I}</td><td${H('A')}>${d.A}</td><td${H('Ld')}>${d.Ld}</td><td${H('Sv')}>${sv}</td></tr></table>`;
}

function chipH(cls, label, tip, extra = '') { return `<span class="chip${cls ? ' ' + cls : ''}" title="${esc(tip)}">${label}${extra}</span>`; }
const MARK_TXT = { undivided: 'Marca del Caos Indiviso: repite los chequeos fallidos de Miedo, Pánico y Terror.', khorne: 'Marca de Khorne: Frenesí (no puede ser Mago).', nurgle: 'Marca de Nurgle: los enemigos repiten los 6 naturales al impactarla en combate.', slaanesh: 'Marca de Slaanesh: inmune al Pánico y +1 Iniciativa mientras no haya luchado en la ronda.', tzeentch: 'Marca de Tzeentch: Resistencia mágica, ataques flamígeros y bonificador de hechicería (ver Magia).' };
function unitCard(u) {
  const d = D(u), f = FACTIONS[G.s.factions[u.owner]];
  const chips = [];
  if (u.fleeing) chips.push(chipH('warn', 'En huida', 'La unidad huye hacia su borde de mesa. No puede declarar cargas ni disparar; en su fase de Estrategia hace un chequeo de Liderazgo para reagruparse (Core, Flee / Rally).'));
  if (isEngaged(G.s, u)) chips.push(chipH('warn', 'Trabada en combate', 'Está en contacto de peana con una unidad enemiga: no puede mover ni disparar y lucha en la Fase de Combate.'));
  for (const f of fxList(u)) { const fi = fxInfo(f.k); chips.push(chipH('arc', esc(fi.name), fi.text || fi.name)); }
  if (u.stupid) chips.push(chipH('warn', 'Estúpida', RULES.stupidity[1]));
  for (const r of D(u).sr) if (RULES[r] && RULES[r][1] && !['closeOrder', 'ward5'].includes(r) && !(r === 'undead' && D(u).sr.includes('necroUndead'))) chips.push(`<span class="chip" title="${esc(RULES[r][1])}">${RULES[r][0]}</span>`);
  for (const j of joinedLive(u)) chips.push(`<span class="chip ok" title="El personaje combate con la unidad y recibe parte de las heridas">Con ${esc(j.name)} (${j.wounds}/${D(j).W} H)</span>`);
  for (const k of u.items || []) chips.push(`<span class="chip ok" title="${esc(ITEMS[k]?.text || ITEMS[k]?.name || k)}">✦ ${esc(ITEMS[k]?.name || k)}${cardBtn(k)}</span>`);
  if (u.banner) chips.push(`<span class="chip ok" title="${esc(ITEMS[u.banner].text)}">⚑ ${esc(ITEMS[u.banner].name)}</span>`);
  if (u.std) chips.push(`<span class="chip ok" title="+1 a la resolución de combate">⚑ Estandarte</span>`);
  if (u.champ) chips.push(`<span class="chip ok" title="+1 Ataque${(u.champItems || []).length ? " · " + (u.champItems || []).map((k) => ITEMS[k]?.name).filter(Boolean).join(", ") : ""}">⚔ Campeón${(u.champItems || []).length ? " ✦" : ""}</span>`);
  if (u.mus) chips.push(`<span class="chip ok" title="Desempata combates igualados; +1 Ld al marchar cerca del enemigo y al reagruparse">♪ Músico</span>`);
  if (d.general) chips.push(chipH('ok', 'General (Ld a 12")', 'General del ejército: las unidades amigas a 12" (alcance de mando) pueden usar su Liderazgo en vez del propio (Presencia Inspiradora, Core).'));
  if (d.wizard) chips.push(chipH('arc', `Mago nivel ${d.wizard.level}`, `Mago de nivel ${d.wizard.level}: lanza hechizos en la fase de Estrategia y dispersa los del rival; conoce un número de hechizos según su nivel (hechizo de firma + los elegidos de su Saber). Toca las cartas 🃏 para ver cada hechizo.`));
  if (u.mark) chips.push(chipH('', `Marca: ${MARKS[u.mark]}`, MARK_TXT[u.mark] || `Marca ${MARKS[u.mark]}`));
  if (d.lance) chips.push(chipH('', 'Lanza en carga', 'Lanza (Core, Armas): Combate, F+2, FP −2, Perforante (1). Solo para tipos de tropa caballería o monstruo, y solo en un turno en que el portador cargó; en turnos posteriores (o si no cargó) usa el arma de mano.'));
  if (u.spells) chips.push(`<span class="chip arc" title="Hechizos que conoce esta unidad (toca 🃏 para ver cada carta)">Conoce: ${u.spells.map((k) => SPELLS[k].name + cardBtn(k)).join(', ')}</span>`);
  { const rg = rangedOf(u); if (rg) chips.push(chipH('', `Disparo ${rg.range}" F${rg.s}${rg.ap ? ' −' + rg.ap : ''}`, `Arma de proyectiles: alcance ${rg.range}", Fuerza ${rg.s}${rg.ap ? ', Perforación −' + rg.ap : ''}. Alcance corto: a la mitad (${rg.range / 2}") o menos; largo alcance: −1 para impactar (Core p.138).`)); }
  const pct = Math.round(100 * u.models / u.startModels);
  const dm = dims(u);
  return `<div class="uhead">${kindBadge(u, true)}<div><h3>${esc(u.name)}</h3><div class="muted">${FNAME[G.s.factions[u.owner]]}${u.ally ? ' · ◈ aliado: ' + esc(G.s.allyInfo?.[u.owner]?.name || '') + (u.allyKind && u.allyKind !== 'trusted' ? (u.allyKind === 'suspicious' ? ' (sospechoso)' : ' (incómodo)') : '') : ''} · ${dm.files}×${dm.ranks} · ${curPts(u)} pts</div></div><div class="ucount"><b>${u.models}</b><small>/${u.startModels}</small></div></div><div class="bar"><i style="width:${pct}%;background:${pct < 50 ? 'var(--blood)' : 'var(--ok)'}"></i></div>${statRow(d, statHi(u))}<div>${chips.join('')}</div><p class="muted" style="margin:6px 0 0">${esc(d.blurb || '')}</p>`;
}

// Deliberaciones Errantes (Slann): el jugador elige los cuatro Saberes de firma y, opcionalmente, descarta una firma por un hechizo del Saber de Lustria
const WANDER_L = { battle: 'Batalla', daemonology: 'Demonología', dark: 'Magia Oscura', elementalism: 'Elementalismo', high: 'Alta Magia', illusion: 'Ilusión', necro: 'Nigromancia' };
function wanderBtns(e, k) {
  const sel = e.wanderL || [];
  return Object.entries(WANDER_L).map(([lk, nm]) => `<button data-t="${k}" data-d="wander" data-v="${lk}" title="Deliberaciones Errantes: Saber de firma (cuatro)">${sel.includes(lk) ? '✔ ' : ''}${nm}</button>`).join('') + `<button data-t="${k}" data-d="wanderLu" title="Descartar una firma por un hechizo del Saber de Lustria">Lustria: ${e.wanderDrop && e.wanderLu ? `${SPELLS[e.wanderLu]?.name || ''} por ${WANDER_L[e.wanderDrop]}` : 'no'}</button>`;
}
function renderPanel() {
  const s = G.s;
  const tabs = [['unit', 'Unidad'], ['log', 'Registro'], ['army', 'Ejércitos'], ['rules', 'Reglas'], ['arules', 'Reglas de ejército']];
  $('tabs').innerHTML = tabs.map(([k, n]) => `<button data-tab="${k}" class="${UI.tab === k ? 'on' : ''}">${IC[k]}<span>${n}</span></button>`).join('');
  $('tabs').querySelectorAll('button').forEach((b) => (b.onclick = () => { UI.tab = b.dataset.tab; renderPanel(); }));
  let html = '';
  if (UI.tab === 'unit') html = unitTab();
  else if (UI.tab === 'log') html = logTab();
  else if (UI.tab === 'army') html = armyTab();
  else if (UI.tab === 'arules') html = armyRulesTab();
  else html = rulesTab();
  const body = $('panelBody'); const keep = body.scrollTop; body.innerHTML = html; body.scrollTop = UI.tab === 'log' ? body.scrollHeight : keep;
  bindPanel();
  // acciones principales
  const act = $('actions'); act.innerHTML = '';
  const mk = (txt, cls, fn, dis) => { const b = document.createElement('button'); b.className = 'btn ' + cls; const nx = / ▸$/.test(txt); b.innerHTML = `<span>${esc(txt.replace(/ ▸$/, ''))}</span>${nx ? IC.next : ''}`; b.disabled = !!dis; b.onclick = fn; act.appendChild(b); };
  if (s.phase === 'over') mk('Nueva partida', 'primary', showMenu);
  else if (s.phase === 'deploy') {
    const who = G.mode === 'hot' ? G.deployPlayer : G.mode === 'code' ? G.myOwner : 0;
    if (s.alt && s.alt.phase !== 'done') {
      const d = s.alt;
      if (d.phase === 'fsel') mk(d.ok[who] ? 'Esperando al rival…' : 'Fuerza de flanqueo decidida ▸', 'primary', () => { cancelMode(); UI.sel = null; dispatch({ t: 'altFlankOk', player: who }); }, d.ok[who] || !interactive());
      else if (d.phase === 'zone') { if (d.win === who && s.scn === 'chance') { const cur = s.zoneName || ['A1', 'A2']; for (const nm of ['A1', 'A2', 'B1', 'B2']) mk(`Zona ${nm}${cur[who] === nm ? ' (la tuya ahora)' : cur[1 - who] === nm ? ' (la del rival ahora)' : ''}`, cur[who] === nm ? 'primary' : '', () => dispatch({ t: 'altZone', player: who, zone: nm }), !interactive()); } else if (d.win === who) { mk('Quedarme en mi zona de despliegue', 'primary', () => dispatch({ t: 'altZone', player: who, swap: false }), !interactive()); mk('Elegir la zona contraria', '', () => dispatch({ t: 'altZone', player: who, swap: true }), !interactive()); } else mk('Esperando la elección de zona del rival…', '', () => {}, true); }
      else if (d.phase === 'first') { if (d.win === who) { mk('Despliego yo primero', 'primary', () => dispatch({ t: 'altFirst', player: who, first: who }), !interactive()); mk('Que despliegue el rival primero', '', () => dispatch({ t: 'altFirst', player: who, first: 1 - who }), !interactive()); } else mk('Esperando la elección del rival…', '', () => {}, true); }
      else if (d.turn === who && d.cur.length) mk('Confirmar colocación ▸', 'primary', () => { cancelMode(); UI.sel = null; dispatch({ t: 'altDone', player: who }); }, !interactive());
      else mk(d.turn === who ? 'Elige qué desplegar' : 'Turno del rival…', '', () => {}, true);
    } else mk('¡Listo para la batalla!', 'primary', () => readyDeploy(who), !interactive());
    for (const ff of s.terrain.filter((t) => /^(amb|wow)\d$/.test(t.id) && +t.id.slice(-1) === viewer() && !s.ready[viewer()])) { // el jugador coloca su bosque adicional (Emboscada del bosque / Guerreros del Páramo)
      const nm = ff.id[0] === 'a' ? 'Bosque de emboscada' : 'Bosque de Guerreros del Páramo', mv = (dx, dy, dw, dh) => dispatch({ t: 'forestPlace', id: ff.id, x: ff.x + dx, y: ff.y + dy, w: ff.w + dw, h: ff.h + dh });
      mk(nm + ': ◀', '', () => mv(-1, 0, 0, 0), !interactive()); mk(nm + ': ▶', '', () => mv(1, 0, 0, 0), !interactive());
      mk(nm + ': ▲', '', () => mv(0, -1, 0, 0), !interactive()); mk(nm + ': ▼', '', () => mv(0, 1, 0, 0), !interactive());
      mk(nm + ': ancho +', '', () => mv(0, 0, 1, 0), !interactive()); mk(nm + ': ancho −', '', () => mv(0, 0, -1, 0), !interactive());
      mk(nm + ': alto +', '', () => mv(0, 0, 0, 1), !interactive()); mk(nm + ': alto −', '', () => mv(0, 0, 0, -1), !interactive());
    }
    if (s.axe === 'bel' && !s.ready[s.atk]) { // ¡Es una emboscada!: el atacante puede dejar unidades en reserva
      const su = UI.sel && byId(s, UI.sel);
      if (su && su.owner === s.atk && su.owner === viewer() && su.type !== 'bm_cart') mk('Dejar en reserva (emboscada)', '', () => dispatch({ t: 'resv', id: su.id, v: true }), !interactive());
      for (const ru of (s.reserves || []).filter((x) => x.owner === s.atk && x.owner === viewer())) mk(`Desplegar: ${ru.name}`, '', () => dispatch({ t: 'resv', id: ru.id, v: false }), !interactive());
    }
    { const su = UI.sel && byId(s, UI.sel); if (s.flankZ && su && su.owner === viewer() && (!s.alt || s.alt.phase === 'fsel')) {
      mk(su.flank === 'L' ? '✓ Flanco izquierdo' : 'Flanquear a la izquierda', '', () => dispatch({ t: 'flank', id: su.id, side: su.flank === 'L' ? null : 'L' }), !interactive());
      mk(su.flank === 'R' ? '✓ Flanco derecho' : 'Flanquear a la derecha', '', () => dispatch({ t: 'flank', id: su.id, side: su.flank === 'R' ? null : 'R' }), !interactive());
    } }
  } else {
    const label = { strategy: 'Pasar a movimiento ▸', move: 'Pasar a disparo ▸', shoot: 'Resolver combates y terminar turno ▸' }[s.phase];
    mk(label, 'primary', () => { cancelMode(); dispatch({ t: 'endPhase' }); }, !interactive());
  }
  if (G.mode === 'code' && !G.demo) mk(G.waiting ? 'Código del rival…' : 'Mis códigos', '', () => showCodeModal(G.lastCode ? 'last' : 'wait'));
  renderFab(); if (G.tutorial) tutTick();
}

function readyDeploy(who) {
  cancelMode();
  dispatch({ t: 'ready', player: who });
  if (G.s.phase === 'deploy' && G.s.ready[0] && G.s.ready[1] && G.s.minePend?.some((n) => n > 0)) { toast('Toca el mapa para colocar tus marcadores de Mina (zona permitida: fuera del despliegue rival, a 6" de enemigos y 12" entre Minas)'); const o = G.s.minePend[viewer()] > 0 ? viewer() : G.s.minePend.findIndex((n) => n > 0); if (G.mode === 'hot' && o !== viewer()) { G.deployPlayer = o; G.curtain = true; orient(); showCurtain(); } renderFab(); return; }
  if (G.mode === 'hot' && G.s.phase === 'deploy') { G.deployPlayer = 1; G.curtain = true; orient(); showCurtain(); }
  else if (G.mode === 'code' && G.s.phase === 'deploy') { G.waiting = true; showCodeModal('turn'); }
}

function stirPanel(s, my) {
  const d = s.stirDep, mine = d.turn === my;
  const zn = (z) => `${z % 3 + 1}${z < 3 ? 'A' : 'B'}`;
  let h = `<h3>Stirhügel · colocación alternada</h3><p class="muted">${d.phase === 'units' ? 'Coloca una unidad que no sea personaje, completa dentro de una zona libre (3 por bando).' : 'Cada bando puede unir un personaje a una de sus unidades desplegadas.'} ${mine ? '<b>Es tu turno.</b>' : 'Turno del rival…'}</p>`;
  const zones = [0, 1, 2, 3, 4, 5].map((z) => `<span class="muted">${zn(z)}: ${d.occ[z] === undefined ? 'libre' : d.occ[z] === my ? 'tuya' : 'rival'}</span>`).join(' · ');
  h += `<p>${zones}</p>`;
  if (!mine) return h;
  if (d.phase === 'units') {
    const cs = (s.reserves || []).filter((x) => x.owner === my && !x.detOf && D(x).cat !== 'char' && x.type !== 'goods_cart' && x.models > 0);
    h += cs.map((x) => `<div class="row"><b>${esc(x.name)}</b> (${x.models}) <button class="btn small${UI.stirSel === x.id ? ' on' : ''}" data-stirs="${x.id}">Elegir</button> ` + [0, 1, 2, 3, 4, 5].filter((z) => d.occ[z] === undefined).map((z) => `<button class="btn small" data-stirp="${x.id}:${z}">${zn(z)}</button>`).join('') + '</div>').join('') + '<p class="muted">Toca «Elegir» y luego la zona en el tablero (o usa los botones de zona: 1-3 de izquierda a derecha en el lado de abajo «A», arriba «B» en coordenadas de mesa).</p>';
  } else {
    const chs = (s.reserves || []).filter((x) => x.owner === my && D(x).cat === 'char');
    const hs = s.units.filter((x) => x.owner === my && x.models > 0);
    h += chs.map((c) => `<div class="row"><b>${esc(c.name)}</b> → ` + hs.map((u) => `<button class="btn small" data-stirc="${c.id}:${u.id}">${esc(u.name)}</button>`).join('') + '</div>').join('');
    h += `<div class="row"><button class="btn small" data-stirc="none">No desplegar personaje</button></div>`;
  }
  return h;
}
function altPanel(s, my) {
  const d = s.alt, mine = d.turn === my, nm = (p) => FNAME[s.factions?.[p]] || `Jugador ${p + 1}`;
  let h = `<h3>Despliegue alterno</h3>`;
  if (d.phase === 'fsel') return h + `<p class="muted">Fuerzas de flanqueo (Core p.292): hasta el 33 % de los puntos, al menos una unidad que no sea personaje, sin el General. Toca una de tus unidades y elige su flanco (izquierdo o derecho) o déjala en la fuerza principal; después pulsa <b>Fuerza de flanqueo decidida</b>. ${d.ok[my] ? 'Esperando al rival…' : ''}</p>`;
  if (d.phase === 'zone') return h + `<p class="muted">${d.win === my ? (s.scn === 'chance' ? 'Has ganado la tirada: elige tu zona entre A1, A2, B1 y B2; el rival ocupará la opuesta de la misma letra (A1↔A2, B1↔B2). A1 y B1 están en el lado izquierdo del mapa del libro, A1 y B2 abajo, A2 y B1 arriba.' : 'Has ganado la tirada: elige tu zona de despliegue (la zona que ves sombreada como tuya, o la contraria).') : 'El rival ha ganado la tirada y elige su zona de despliegue.'}</p>`;
  if (d.phase === 'first') return h + `<p class="muted">${d.win === my ? 'Has ganado la tirada: elige quién despliega la primera unidad (abajo).' : 'El rival ha ganado la tirada y elige quién despliega primero.'}</p>`;
  const ph = { units: 'Cada bando despliega una unidad que no sea personaje por turno (las máquinas de guerra, todas a la vez). Personajes y Exploradores, al final.', whole: 'Cada bando despliega su ejército entero, empezando por quien indica el escenario.', chars: 'Se despliegan los personajes de uno en uno: elige cuál colocar, llévalo al mapa y confirma; cuando hayas colocado todos los tuyos sigue el rival. Únelos a unidades con «Unir».', scouts: 'Los Exploradores se despliegan de uno en uno, más allá de 12" del enemigo.' }[d.phase] || '';
  h += `<p class="muted">${ph} ${mine ? '<b>Es tu turno.</b>' : 'Turno del rival…'}</p>`;
  if (!mine) return h;
  if (d.cur.length) return h + `<p>Arrastra y gira lo que acabas de desplegar y pulsa <b>Confirmar colocación</b>.</p>`;
  const cls = (u) => (D(u).cat === 'char' ? 'c' : D(u).sr.includes('scouts') ? 's' : 'u');
  const list = (s.pend || []).filter((x) => x.owner === my && !x.altDet && (x.altStage || 0) === (d.stage || 0) && (d.phase === 'whole' || cls(x) === (d.phase === 'chars' ? 'c' : d.phase === 'scouts' ? 's' : 'u')));
  const seen = new Set();
  h += list.filter((x) => (d.phase === 'whole') ? (seen.has('g') ? false : seen.add('g')) : (D(x).cat === 'mach' ? (seen.has('m') ? false : seen.add('m')) : true)).map((x) => `<div class="row"><b>${esc(d.phase === 'whole' ? 'Todo el ejército' : D(x).cat === 'mach' ? 'Máquinas de guerra' : x.name)}</b>${d.phase === 'units' && D(x).cat !== 'mach' ? ` (${x.models})` : ''} <button class="btn small" data-altp="${x.id}">Desplegar</button></div>`).join('');
  return h;
}
function phaseBadge(u) { // estado de participación de la unidad en la fase actual
  const pi = phaseInfo(G.s, u); if (!pi) return '';
  return `<div class="row"><span class="chip ${pi.can ? 'ok' : 'warn'}" title="Situación de esta ronda y fase">${pi.can ? '✓ Participa en esta fase' : '✗ No participa en esta fase'}</span><span class="muted">${esc(pi.txt)}</span></div>`;
}
function phaseList() { // unidades del jugador que pueden participar ahora (tocar para seleccionar)
  const s = G.s, my = viewer(); if (!interactive() || ['deploy', 'over'].includes(s.phase)) return '';
  const mine = s.units.filter((x) => x.owner === my && x.models > 0 && !x.garrison), rows = mine.map((x) => [x, phaseInfo(s, x)]).filter(([, p]) => p);
  const ok = rows.filter(([, p]) => p.can), no = rows.filter(([, p]) => !p.can);
  return `<h3>Participan en esta fase (${ok.length}/${rows.length})</h3>` + (ok.length ? ok.map(([x, p]) => `<button class="btn small" data-sel="${x.id}" title="${esc(p.txt)}">✓ ${esc(x.name)}</button>`).join(' ') : '<p class="muted">Ninguna de tus unidades puede participar ahora.</p>') + (no.length ? `<details><summary class="muted">No participan (${no.length})</summary>${no.map(([x, p]) => `<div class="row"><button class="btn small" data-sel="${x.id}">${esc(x.name)}</button><span class="muted">${esc(p.txt)}</span></div>`).join('')}</details>` : '');
}
function unitTab() {
  const s = G.s; const u = UI.sel ? byId(s, UI.sel) : null;
  if (!u) {
    const my = viewer();
    if (s.alt && s.alt.phase !== 'done' && s.phase === 'deploy') return altPanel(s, my);
    if (s.stirDep && s.stirDep.phase !== 'done' && s.phase === 'deploy') return stirPanel(s, my);
    const rsv = (s.reserves || []).filter((x) => x.owner === my && !x.detRes);
    const rsvHtml = rsv.length ? `<h3>Reservas</h3><p class="muted">${s.phase === 'move' && s.active === my && (s.turn >= 2 || s.stir) ? (s.stir ? 'Entran por una de tus zonas (la elige un D3); el botón fija la posición dentro de ella.' : 'Elige por dónde entra cada unidad (borde largo de tu zona).') : 'Entran en tu fase de movimiento a partir del turno 2.'}</p>` + rsv.map((x) => x.hiddenIn ? `<div class="row"><b>${esc(x.name)}</b> (oculto en ${esc((s.units.find((h) => h.id === x.hiddenIn) || {}).name || '?')})${s.phase === 'deploy' && !s.ready[x.owner] && x.owner === my ? `<button class="btn small" data-hide="${x.id}" title="Elige la unidad élfica oscura de infantería (Fuerza de Unidad 10+) en la que se oculta">Cambiar anfitrión</button>` : ''}${(s.phase === 'strategy' || s.phase === 'combat') && s.active === my ? `<button class="btn small" data-reveal="${x.id}">Revelar</button>` : ''}</div>` : `<div class="row"><b>${esc(x.name)}</b> (${x.models})${s.phase === 'move' && s.active === my && (s.turn >= 2 || s.stir) ? [['Izq.', 12], ['Centro', 36], ['Der.', 60]].map(([n, xx]) => `<button class="btn small" data-rsv="${x.id}:${xx}">${n}</button>`).join('') + (x.mineAmb ? (s.mines?.[x.owner] || []).map((mk, i) => `<button class="btn small" data-mine="${x.id}:${i}" title="Emboscada subterránea: a 6 pulgadas del marcador de Mina (${mk.x}, ${mk.y})">Mina ${i + 1}</button>`).join('') : '') : ''}</div>`).join('') : '';
    const windUi = s.phase === 'strategy' && s.active === my && s.winds?.[my] && s.units.some((x) => x.owner === my && x.models > 0 && [x, ...(x.joined || [])].some((c) => c.models > 0 && D(c).sr.includes('willDragons'))) ? `<h3>Voluntad de los Dragones</h3><div class="row"><span class="muted">Soplan los vientos de ${s.winds[my] === 'yang' ? 'Yang' : 'Yin'}:</span>${(s.winds[my] === 'yang' ? [['M', '+1 Movimiento'], ['I', '+1 Iniciativa']] : [['WS', '+1 Habilidad de armas'], ['Ld', '+1 Liderazgo']]).map(([k, n]) => `<button class="btn small ${s.windMod?.[my] === k ? 'primary' : ''}" data-wind="${k}">${n}</button>`).join('')}</div>` : '';
    const cmdUse = s.phase === 'strategy' && s.active === my ? s.units.filter((x) => x.owner === my && x.models > 0).flatMap((x) => [...(x.items || []), ...(x.banner ? [x.banner] : [])].filter((k2) => ITEMS[k2]?.cmdUse && !x.used?.['cu_' + k2]).map((k2) => `<div class="row"><b>${esc(x.name)}</b> ${esc(ITEMS[k2].name)}<button class="btn small" data-cuse="${x.id}|${k2}">Usar</button></div>`)).join('') : '';
    const orbUse = s.phase === 'combat' && s.active === my ? s.units.filter((x) => x.owner === my && x.models > 0).flatMap((h) => (h.joined || []).filter((j) => j.models > 0 && (j.items || []).includes('skl_orb')).flatMap((j) => engagedWith(s, h).flatMap((e) => [...joinedLive(e).map((c) => [c.id, c.name]), ...(e.champ && !D(e).champNoA ? [['champ', 'campeón']] : []), ['troop', 'modelo de tropa']].map(([mid, mn]) => `<div class="row"><b>${esc(j.name)}</b> Orbe de Latón → ${esc(e.name)} (${esc(mn)})<button class="btn small" data-orb="${j.id}|${e.id}|${mid}">Usar</button></div>`)))).join('') : '';
    const frUi = frydGen(s, my) ? (s.reserves || []).filter((x) => x.owner === my && x.ambusher && !x.ambushOK && x.models > 0 && FRYD_RE.test(x.type)).map((x) => `<div class="row"><b>${esc(x.name)}</b> Incursora sin igual (llegada): ${[[-1, '−1'], [0, 'Sin modificar'], [1, '+1']].map(([v, l]) => `<button class="btn small${(x.frydMod || 0) === v ? ' on' : ''}" data-frm="${x.id}|${v}">${l}</button>`).join('')}</div>`).join('') : '';
    const rsvHtml2 = rsvHtml + (frUi ? `<h3>Frydaal, General</h3>${frUi}` : '') + windUi + (cmdUse || orbUse ? `<h3>Objetos</h3>${cmdUse}${orbUse}` : '');
    return rsvHtml2 + phaseList() + `<h3>${s.phase === 'deploy' ? 'Despliegue' : PHASE_NAME[s.phase]}</h3><p class="muted">${hintFor()}</p>${s.phase === 'deploy' && !s.ready[my] && s.terrain.some((t) => t.herd && t.owner === my && !t.special) ? `<div class="row"><span class="muted">Piedra de las Manadas: fuera de la zona rival y a más de 6" del centro.</span><button class="btn small${UI.herdSel ? ' on' : ''}" data-act="herdsel" data-v="1">Colocar Piedra</button></div>` : ''}<div class="ulist">${s.units.filter((x) => x.owner === my).map(unitItem).join('')}</div>`;
  }
  let html = unitCard(u);
  const mine = u.owner === viewer() && interactive();
  if (mine) html += unitActions(u);
  return html;
}
const unitItem = (u) => `<button class="uitem ${u.models <= 0 ? 'dead' : ''} ${UI.sel === u.id ? 'sel' : ''}" data-sel="${u.id}">${kindBadge(u)}<span>${esc(unitTag(G.s, u))}${u.fleeing ? ' ⚑' : ''}</span><span class="muted">${u.models}/${u.startModels}</span></button>`;

function hintFor() {
  const s = G.s;
  if (s.phase === 'deploy') return 'Arrastra tus unidades dentro de tu franja y pulsa «¡Listo!». Toca una para girarla o cambiar su frente.';
  if (s.phase === 'strategy') return 'Los magos pueden lanzar un hechizo. Las unidades en huida intentan reagruparse al empezar el turno.';
  if (s.phase === 'move') return 'Elige una unidad: mover, marchar o cargar. Las unidades con aro punteado pueden actuar.';
  if (s.phase === 'shoot') return 'Elige una unidad con armas de proyectiles y un objetivo en su arco frontal.';
  return '';
}

function unitActions(u) {
  const s = G.s, d = D(u);
  let h = '<div style="margin-top:10px">' + phaseBadge(u);
  { const hk = [u, ...(u.joined || []).filter((j) => j.models > 0)].reduce((n, c) => n + (D(c).wizard || spellKeys(c).length ? spellKeys(c).length : 0), 0); if (hk) h += `<div class="row"><button class="btn small" data-act="hand" title="Cartas de los hechizos de este Mago: elige una para lanzarla">🃏 Cartas de magia (${hk})</button></div>`; } // v843r
  if (s.phase === 'deploy') {
    // v843s: la ficha solo INFORMA de los hechizos; la decisión (Saber, descartar por la firma, Tomo, Aquelarre, Lore Legacy) se toma en un popup en el momento, no con botones fijos
    for (const c of [u, ...(u.joined || [])]) {
      const nm = (k) => esc(SPELLS[k]?.name || k), pend = !s.ready[c.owner] && c.owner === viewer() && ((c.spellAlt && !c.spellAlt.done) || c.legAlt?.orig || c.covenAlt || c.tomeAlt) && !(G.sg && G.sg['x' + c.id]);
      if (!(c.spellAlt || c.legAlt?.orig || c.covenAlt || c.tomeAlt)) continue;
      h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted">${esc(c.name)} — conoce: ${(c.spells || []).map((k) => nm(k) + cardBtn(k)).join(', ') || '—'}.${pend ? ' Aún tienes una decisión pendiente sobre sus hechizos.' : ''}</span>${pend ? `<button class="btn small primary" data-act="spdecide" data-v="${c.id}">Decidir hechizos</button>` : ''}</div>`;
    }
    for (const c of [u, ...(u.joined || [])]) if (c.leering && c.models > 0 && !s.ready[c.owner]) h += `<div class="row"><span class="muted">Espíritu Mirón: marcador a más de 8" de todo enemigo (ahora en ${c.leerSet && c.leerPos ? Math.round(c.leerPos.x) + ',' + Math.round(c.leerPos.y) : 'Kralmaw'}).</span><button class="btn small${UI.leerSel === c.id ? ' on' : ''}" data-act="leer" data-v="${c.id}">Colocar marcador</button></div>`;
    h += `<div class="row"><button class="btn small" data-act="rot" data-v="-0.2618">⟲ Girar</button><button class="btn small" data-act="rot" data-v="0.2618">⟳ Girar</button>${u.models > 1 ? `<button class="btn small" data-act="files" data-v="-1">− fila</button><button class="btn small" data-act="files" data-v="1">+ fila</button><button class="btn small" data-act="filesinfo" title="Qué ganas y pierdes con más o menos filas" aria-label="Información sobre las filas">ⓘ</button>${spMaxOf(u) > 0 ? `<button class="btn small" data-act="sp" data-v="-0.5" title="Separación entre modelos (escaramuza)">⇥ Sep.</button><button class="btn small" data-act="sp" data-v="0.5" title="Separación entre modelos (máx ${spMaxOf(u)}&quot;)">⇤ Sep. ${u.spPref || 0}"</button>` : ''}${u.lanceable && u.models >= 3 ? `<button class="btn small ${u.lance ? 'primary' : ''}" data-act="lance" title="Formación en Lanza (cuña)">⛛ Lanza</button>` : ''}` : ''}</div>`;
  } else if (s.phase === 'strategy') {
    if (u.owner === s.active && s.manualReloc?.[u.owner]) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0)) for (const k of c.items || []) { // Pociones: las bebe el jugador
      const it = ITEMS[k]; if (!(it?.potion || (it?.darkHeart && c.wounds < c.startModels * D(c).W)) || (c.used || {})[k] || (it.potion && c.potK === s.turn + ':' + s.active)) continue;
      h += `<div class="row"><button class="btn small" data-act="drink" data-v="${c.id}|${k}" title="${esc(it.text || '')}">${it.darkHeart ? 'Consumir' : 'Beber'} ${esc(it.name)}${c === u ? '' : ' (' + esc(c.name) + ')'}</button></div>`;
    }
    if (u.owner === s.active && s.manualReloc?.[u.owner]) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && (c.items || []).some((k) => ITEMS[k]?.nullStone) && c.nullK !== s.turn + ':' + s.active)) h += `<div class="row"><button class="btn small" data-act="nullstone" data-v="${c.id}" title="Chequeo de Liderazgo (sin modificar): si lo supera, hasta tu siguiente Inicio de turno no puede ser objetivo de hechizos y es inmune a sus efectos. Solo si no está trabado.">Usar Piedra Nula${c === u ? '' : ' (' + esc(c.name) + ')'}</button></div>`; // Piedra Nula (fof.txt:7312)
    const casters = [u, ...(u.joined || []).filter((j) => j.models > 0)].filter((c) => D(c).wizard);
    for (const c of casters) for (const k of spellKeys(c)) {
      const sp = SPELLS[k]; if (sp.type === 'missile' || sp.type === 'vortex' || sp.type === 'conveyance') continue; // Traslado: en Movimientos restantes
      const dis = c.casted?.includes(k) || c.noMore || u.fleeing || isEngaged(s, u) || sp.type === 'assail';
      h += `<button class="btn spell" data-act="cast" data-v="${c === u ? k : c.id + '|' + k}" ${dis ? 'disabled' : ''}>${c === u ? '' : esc(c.name) + ': '}<b>${sp.name}</b>${cardBtn(k)} <span class="muted">(${sp.cv}+ · ${sp.range ? sp.range + '"' : sp.type === 'assail' ? 'cuerpo a cuerpo' : 'propio'})</span><div class="muted" style="font-size:12.5px">${sp.text}</div></button>`;
    }
    if (!casters.length) h += '<p class="muted">Esta unidad no lanza hechizos.</p>';
  } else if (s.phase === 'move') {
    const eng = isEngaged(s, u);
    const ct = chargeTargets(s, u);
    const why = u.fleeing ? 'En huida' : u.moved && !u.freeReform ? 'Ya ha actuado' : eng ? 'Trabada en combate' : '';
    h += `<div class="row"><button class="btn" data-act="move" ${why ? 'disabled' : ''}>Mover (${d.M}")</button><button class="btn" data-act="march" ${why || d.cat === 'mach' ? 'disabled' : ''}>Marchar (${d.M * (isColumn(u) ? 3 : 2)}")</button><button class="btn danger" data-act="charge" ${ct.length ? '' : 'disabled'}>Cargar${ct.length ? ` (${ct.length})` : ''}</button></div>`;
    { const mc = [u, ...(u.joined || []).filter((j) => j.models > 0)].filter((c) => D(c).wizard || spellKeys(c).length);
      for (const c of mc) for (const k of spellKeys(c)) {
        const sp = SPELLS[k]; if (!sp || sp.type !== 'conveyance') continue;
        const dis = c.casted?.includes(k) || c.noMore || u.fleeing || isEngaged(s, u) || u.charged;
        h += `<button class="btn spell" data-act="cast" data-v="${c === u ? k : c.id + '|' + k}" ${dis ? 'disabled' : ''}>${c === u ? '' : esc(c.name) + ': '}<b>${sp.name}</b>${cardBtn(k)} <span class="muted">(${sp.cv}+ · ${sp.range ? sp.range + '"' : 'propio'} · Movimientos restantes)</span><div class="muted" style="font-size:12.5px">${sp.text}</div></button>`;
      } }
    if (why) h += `<p class="muted">${why}.</p>`;
    else if (s.movesBegun === s.turn + ':' + s.active && !u.charged) h += '<p class="muted">Ya has movido otras unidades: las cargas se declaran antes que el resto de movimientos (p.116).</p>';
  } else if (s.phase === 'shoot') {
    const ts = legalShootTargets(s, u);
    h += `<div class="row"><button class="btn danger" data-act="shoot" ${ts.length ? '' : 'disabled'}>Disparar${ts.length ? ` (${ts.length} objetivos)` : ''}</button></div>`;
    { const bk = u.owner === viewer() && !u.shot ? shootBlocked(s, u) : []; if (bk.length) { const names = [...new Set(bk.map((x) => x.blocker).filter(Boolean))].map((id) => anyById(s, id)).filter(Boolean); h += `<p class="muted">${ts.length ? 'Además, ' : 'Sin objetivos: '}${bk.length === 1 ? 'una unidad enemiga a alcance no se puede ver' : bk.length + ' unidades enemigas a alcance no se pueden ver'}: ${names.length ? names.map((b) => `${esc(unitTag(s, b))} (${b.owner === u.owner ? 'unidad amiga' : 'unidad enemiga'})`).join(', ') + ' tapa' + (names.length > 1 ? 'n' : '') + ' la vista' : 'lo impide el terreno'} (Core p.103).</p>`; } }
    if (D(u).sr.includes('wailing') && !u.marched && u.dirgeK !== s.turn + ':' + s.active) {
      const fs = alive(s, 1 - u.owner).filter((e) => unitDist(u, e) <= 8);
      h += fs.map((e) => `<div class="row"><button class="btn small" data-act="dirge" data-v="${e.id}" title="Lamento: Liderazgo −2; si falla, tantas heridas como la diferencia (sin armadura ni Regeneración)">Lamento → ${esc(e.name)}</button></div>`).join('');
    }
    for (const c of [u, ...(u.joined || []).filter((j) => j.models > 0)].filter((c) => D(c).wizard || (c.items || []).includes('ring_ruin') || (c.items || []).includes('flamestrike'))) for (const k of spellKeys(c)) {
      const sp = SPELLS[k]; if (sp.type !== 'missile' && sp.type !== 'vortex') continue;
      const dis = c.casted?.includes(k) || c.noMore || u.fleeing || isEngaged(s, u);
      h += `<button class="btn spell" data-act="cast" data-v="${c === u ? k : c.id + '|' + k}" ${dis ? 'disabled' : ''}>${c === u ? '' : esc(c.name) + ': '}<b>${sp.name}</b>${cardBtn(k)} <span class="muted">(${sp.cv}+ · ${sp.range}")</span><div class="muted" style="font-size:12.5px">${sp.text}</div></button>`;
    }
    if (canReserve(s, u)) h += `<div class="row"><button class="btn" data-act="reserve">Movimiento de reserva (${d.M}")</button></div>`;
    if (!rangedOf(u)) h += d.wizard ? '' : '<p class="muted">Sin armas de proyectiles.</p>'; else if (u.shot) h += '<p class="muted">Ya ha disparado.</p>'; else if (!ts.length) h += '<p class="muted">Sin objetivos válidos (alcance, arco frontal o línea de visión).</p>';
  }
  if (s.phase === 'move' && u.owner === s.active) {
    const gb = garrisonOpts(s, u);
    if (gb.length) h += `<div class="row">${gb.map((b) => `<button class="btn small" data-act="garrison" data-v="${b.id}">Ocupar edificio</button>`).join('')}</div>`;
    if (u.garrison) h += `<div class="row"><button class="btn small" data-act="ungarrison" ${u.moved ? 'disabled' : ''}>Salir del edificio</button></div>`;
  }
  if ((s.phase === 'deploy' || s.phase === 'move')) {
    const live = joinedLive(u);
    if (live.length) h += `<div class="row">${live.map((j) => `<button class="btn small" data-act="leave" data-v="${j.id}">Separar a ${esc(j.name)}</button>`).join('')}</div>`;
    else if (d.cat === 'char' && !d.wizard) {
      const hosts = alive(s, u.owner).filter((x) => !joinCheck(s, u, x)).slice(0, 3);
      if (hosts.length) h += hosts.map((x) => `<div class="row"><button class="btn small" data-act="join" data-v="${x.id}">Unirse a ${esc(x.name)}</button></div>`).join('');
      else h += `<p class="muted">Acércate a una unidad aliada (${s.phase === 'deploy' ? 8 : 3}") para unirte a ella.</p>`;
    }
  }
  if (s.phase === 'strategy' && s.turn === 1 && !s.grudgeLock && s.lists?.[viewer()] === 'royal' && s.active === viewer() && u.owner !== viewer()) {
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).cat === 'char')) h += `<div class="row"><button class="btn small" data-act="grudgeNom" data-v="${c.id}" title="Saldar cuentas: nomina a este personaje en el Libro de Rencores (Odio hacia él; +75 PV si muere, huye o está huyendo al final)">${s.grudgeT?.[viewer()] === c.id ? '✔ ' : ''}Nominar a ${esc(c.name)} (Libro de Rencores)</button></div>`;
  }
  if (s.phase === 'strategy' && u.owner === viewer() && s.active === u.owner) {
    if (['ct_miaoying', 'ct_miaoying_h'].includes(u.type) && u.trfK !== s.turn + ':' + s.active && !(u.type === 'ct_miaoying_h' && u.noDragon))
      h += `<div class="row"><button class="btn small" data-act="transform" data-v="${u.id}" title="Transformación del Dragón (fase de Mando): cambia entre forma Humana y forma Dragón">Transformarse en ${u.type === 'ct_miaoying_h' ? 'Dragón' : 'forma Humana'}</button></div>`;
    if (D(u).mountSv != null && u.owner === s.active && s.phase !== 'combat' && !isEngaged(s, u)) h += `<div class="row"><button class="btn small" data-act="armpick" data-v="${u.id}" title="FAQ: el personaje montado en monstruo o carro puede usar su armadura (con escudo y objetos) o la de la montura (sin ellos). Alterna: la mejor → montura → propia">Armadura: ${(u.armPick || 'auto') === 'mount' ? 'de la montura' : u.armPick === 'own' ? 'propia' : 'la mejor'}</button></div>`;
    if (s.lists?.[u.owner] === 'mortuary' && animusSources(s, u).length) { const as = animusSources(s, u), cur = as.find((x) => x.id === u.animusSrc); h += `<div class="row"><button class="btn small" data-act="animus" data-v="${u.id}" title="Animus sepulcral (FAQ): antes de lanzar, una unidad nehekharana monstruosa a tu alcance de mando pierde 1 Herida y tu tirada de lanzamiento recibe +1. Una vez por turno.">Animus: ${cur ? esc(cur.name) : 'no'}</button></div>`; }
    if (D(u).sr.includes('incorpCoach') && u.incK !== s.turn + ':' + s.active) h += `<div class="row"><button class="btn small" data-act="incorp" data-v="${u.id}" title="Alterna entre corpóreo e incorpóreo (Etéreo y Vuelo 10, sin Impactos) hasta tu siguiente turno">${(u.fx || []).some((f) => f.k === 'incorp') ? 'Volverse corpóreo' : 'Volverse incorpóreo'}</button></div>`;
    if (s.phase === 'strategy' && s.active === u.owner && !u.fleeing && !engagedWith(s, u).length) {
      for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('rally') && c.rcK !== s.turn + ':' + s.active)) h += alive(s, c.owner).filter((f) => f.fleeing && f.id !== u.id && unitDist(u, f) <= commandRange(c)).map((f) => `<div class="row"><button class="btn small" data-act="rallycry" data-v="${f.id}" data-c="${c.id}" title="Subfase de Mando: llama a reagruparse a una unidad amiga en huida a tu alcance de mando">Grito de reagrupamiento: ${esc(f.name)}</button></div>`).join('');
      for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('khaineBless') && c.khK !== s.turn + ':' + s.active)) h += [['fury', 'Furia de Khaine (Carga furiosa)'], ['cleave', 'Fuerza de Khaine (Golpe hendiente)'], ['ward', 'Escudo de sangre (salvación 5+)']].map(([k, t]) => `<div class="row"><button class="btn small" data-act="khaine" data-v="${k}" data-c="${c.id}" title="Bendiciones de Khaine (hechizo vinculado NP2, VL 9+, lanzable trabado): una bendición para este modelo y las Brujas Sanguinarias, Brujas Elfas y Hermanas a tu alcance de mando hasta tu próximo turno">Bendiciones de Khaine: ${t}</button></div>`).join('');
      for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('goadBeast') && c.goadK !== s.turn + ':' + s.active)) h += alive(s, c.owner).filter((t) => ['monCreature', 'behemoth'].includes(D(t).tt) && (t.id === u.id || unitDist(u, t) <= commandRange(c))).map((t) => `<div class="row"><button class="btn small" data-act="goad" data-v="${t.id}" data-c="${c.id}" title="Aguijonear a la bestia (subfase de Mando): un monstruo amigo en tu alcance de mando gana +D3 Ataques (máx. 10) hasta el final del turno">Aguijonear: ${esc(t.name)}</button></div>`).join('');
      if ([u, ...(u.joined || [])].some((c) => c.models > 0 && (c.items || []).some((k) => ITEMS[k]?.bigboss)) && !(u.fx || []).some((f) => f.k === 'unbreak') && u.bbK !== s.turn + ':' + s.active) h += `<div class="row"><button class="btn small" data-act="bigboss" data-v="${u.id}" title="Subfase de Mando: chequeo de Liderazgo; si lo superas, la unidad es Inquebrantable">Ponerse el Big Boss 'At</button></div>`;
    }
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('digIn') && c.digK !== s.turn + ':' + s.active && !isEngaged(s, u) && !u.entrenched)) h += `<div class="row"><button class="btn small" data-act="digin" data-v="${c.id}" title="¡Atrincheraos! (subfase de Mando): chequeo de Liderazgo; si lo superas, el Zapador y su unidad quedan Atrincherados (cobertura parcial y obstáculo bajo defendido) hasta que se muevan">¡Atrincheraos!: ${esc(c.name)}</button></div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('grudgestone') && !c.stoneSet)) h += `<div class="row"><button class="btn small" data-act="grudgestone" data-v="${c.id}" title="Inquebrantable y sin pánico, pero no puede mover salvo reformar">Colocar la Piedra del Rencor: ${esc(c.name)}</button></div>`;
    for (const r of ripPairs(s)) h += `<div class="row"><button class="btn small" data-act="${r.owner === u.owner ? 'endRip' : 'dispelRip'}" data-v="${r.src}|${r.spell}" title="Core p.111: hechizo que permanece en juego. Dispersar: en la Conjuración, hay que superar su valor de lanzamiento mínimo. Terminar: el lanzador puede hacerlo al inicio de cualquier subfase">${r.owner === u.owner ? 'Terminar' : 'Intentar dispersar'}: ${esc(SPELLS[r.spell].name)}</button></div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).id === 'sk_greyseer_bell' && c.tollK !== s.turn + ':' + s.active)) h += `<div class="row"><button class="btn small" data-act="toll" data-v="${c.id}" title="Subfase de Mando: tirar 2D6 en la tabla de Tolling the Bell">Tañer la Campana: ${esc(c.name)}</button></div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('cauldron') && c.cauK !== s.turn + ':' + s.active)) h += `<div class="row"><button class="btn small" data-act="cauldron" data-v="${c.id}" title="Ofrenda al Gran Maw: chequeo de Liderazgo; Regeneración (5+) o pierde 1 Herida">Ofrenda del Caldero: ${esc(c.name)}</button></div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && (D(c).sr.includes('nehek') || (c.items || []).includes('vc_dark_acolyte')) && c.nehekK !== s.turn + ':' + s.active)) {
      const ts = alive(s, c.owner).filter((f) => f.models > 0 && D(f).faction === 'vc' && D(f).sr.includes('undead') && unitDist(u, f) <= 12 && (f.wounds < f.startModels * D(f).W || (f.joined || []).some((j) => j.models > 0 && j.wounds < j.startModels * D(j).W)));
      h += ts.map((f) => `<div class="row"><button class="btn small" data-act="nehek" data-v="${f.id}" data-c="${c.id}" title="Invocación de Nehek: chequeo de Liderazgo; recupera Heridas">Invocar Nehek: ${esc(f.name)}</button></div>`).join('');
    }
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('waaagh') && !c.fleeing && !(s.waaagh || {})[c.id])) h += `<div class="row"><button class="btn small" data-act="waaagh" data-v="${c.id}" title="Una vez por partida: chequeo de Liderazgo; si lo superas, repites 1 al impactar y +1 al resultado de combate hasta tu próximo turno">¡Waaagh!: ${esc(c.name)}</button></div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('gaze') && c.gazeK !== s.turn + ':' + s.active))
      h += `<div class="row"><button class="btn small" data-act="gaze" data-v="${c.id}" title="Tabla de la Mirada de los Dioses (D6): 1 Estupidez, 2 +1 I, 3 +1 R, 4 +1 HA, 5 +1 A, 6 +1 F y Ld">Mirada de los Dioses: ${esc(c.name)}</button></div>`;
  }
  if (u.owner === viewer() && s.phase !== 'deploy' && u.models > 0 && duelists(u, s).length > 1) { // Core p.210: el jugador elige qué modelo lanza o acepta el desafío
    const ds = duelists(u, s); h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted">Duelista:</span><button class="btn small${!u.chalPick ? ' on' : ''}" data-act="chalPick" data-v="">Automático</button>${ds.map((x) => `<button class="btn small${u.chalPick === x.key ? ' on' : ''}" data-act="chalPick" data-v="${esc(x.key)}">${esc(x.name)}</button>`).join('')}</div>`;
  }
  if (u.owner === viewer() && u.detOf && u.models > 0) { const SM = [['auto', 'Automática'], ['fire', 'Fuego de apoyo'], ['charge', 'Carga de apoyo'], ['none', 'Ninguna']]; h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted" title="Core p.283: cuando cargan a su unidad regimental, el destacamento declara una Acción de apoyo">Acción de apoyo:</span>${SM.map(([k, t]) => `<button class="btn small${(u.suppMode || 'auto') === k ? ' on' : ''}" data-act="suppMode" data-v="${k}">${t}</button>`).join('')}</div>`; }
  if (u.owner === viewer() && s.phase !== 'deploy' && isEngaged(s, u)) { const rj = engagedWith(s, u).flatMap((e) => (e.joined || []).filter((j) => j.models > 0 && D(j).cat === 'char')); const rc = engagedWith(s, u).some((e) => e.champ && e.models > 1 && !D(e).champHand); if (rj.length + (rc ? 1 : 0) > 1) h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted" title="Core p.210: si rechazan tu desafío, tú nominas qué personaje o campeón se retira">Si rechazan, se retira:</span><button class="btn small${!u.chalRetire ? ' on' : ''}" data-act="chalRetire" data-v="">Automático</button>${rj.map((j) => `<button class="btn small${u.chalRetire === 'j:' + j.id ? ' on' : ''}" data-act="chalRetire" data-v="j:${j.id}">${esc(j.name)}</button>`).join('')}${rc ? `<button class="btn small${u.chalRetire === 'c:' ? ' on' : ''}" data-act="chalRetire" data-v="c:">Campeón</button>` : ''}</div>`; }
  if (u.owner === viewer() && u.models > 0 && ctlObjects(s, u).length > 1) { const co = ctlObjects(s, u), ch = co.some((x) => x.i === u.objPick) ? u.objPick : co.slice().sort((a, b) => b.vp - a.vp || (a.i < b.i ? -1 : 1))[0].i; h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted" title="FAQ: una unidad solo controla un objeto">Controla:</span>${co.map((x) => `<button class="btn small${ch === x.i ? ' on' : ''}" data-act="objpick" data-v="${x.i}">${x.name} (${x.vp} PV)</button>`).join('')}</div>`; }
  if (u.owner === viewer() && s.phase === 'deploy' && u.models > 0 && (UNITS[u.type]?.sr || []).includes('vanguard')) { // Core p.180: la Vanguardia es opcional y puede maniobrar
    const VG = [['auto', 'Recto hasta M'], ['half', 'Medio movimiento'], ['left', 'Girar izq. 45° y avanzar'], ['right', 'Girar der. 45° y avanzar'], ['none', 'No moverse']]; h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted">Vanguardia:</span>${VG.map(([k, l]) => `<button class="btn small${(u.vgMode || 'auto') === k ? ' on' : ''}" data-act="vgMode" data-v="${k}">${l}</button>`).join('')}</div>`;
  }
  if (u.owner === viewer() && s.phase !== 'deploy' && u.models > 0 && isEngaged(s, u)) for (const c of [u, ...(u.joined || [])].filter((m) => m.models > 0 && (UNITS[m.type]?.wizard || m.scintSpell) && (m.spells || UNITS[m.type]?.wizard?.spells || []).some((k) => SPELLS[k]?.type === 'assail'))) { // Core p.158: el mago elige a quién lanza sus hechizos de asalto, o no los lanza
    const fs = engagedWith(s, u); h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted">Asalto ${esc(c.name)}:</span><button class="btn small${!c.noAssail && !c.assailTgt ? ' on' : ''}" data-act="assailTgt" data-v="${c.id}|">Auto</button>${fs.map((f) => `<button class="btn small${!c.noAssail && c.assailTgt === f.id ? ' on' : ''}" data-act="assailTgt" data-v="${c.id}|${f.id}">${UC(f, fs)}</button>`).join('')}<button class="btn small${c.noAssail ? ' on' : ''}" data-act="assailTgt" data-v="${c.id}|none">No lanzar</button></div>`;
  }
  if (u.owner === viewer() && s.phase !== 'deploy' && isEngaged(s, u) && engagedWith(s, u).length > 1) { // varios enemigos en contacto: el jugador elige a quién ataca
    const fs = engagedWith(s, u); h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted">Atacar a:</span><button class="btn small${u.focus == null ? ' on' : ''}" data-act="focus" data-v="">Repartir por igual</button>${fs.map((f) => `<button class="btn small${u.focus === f.id ? ' on' : ''}" data-act="focus" data-v="${f.id}">${esc(f.name)}</button>`).join('')}</div>`;
  }
  if (u.owner === viewer()) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && (c.items || []).some((k) => ITEMS[k]?.skullP))) { const sm = c.skullMode || 'auto', L = { auto: 'automático', on: 'usarlo al combatir', off: 'no usarlo' }, nx = { auto: 'on', on: 'off', off: 'auto' }[sm]; h += `<div class="row"><button class="btn small" data-act="skullMode" data-v="${c.id}|${nx}" title="En vez de atacar: un impacto F8 FP-1 con Golpe letal a cada enemigo en contacto">${esc(c.name)} — Colgante de Cráneo: ${L[sm]}</button></div>`; }
  if (u.owner === viewer()) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('fatherBeasts'))) { // Padre de Bestias: cuándo repetir el D6 de Borrachos de los Centigors
    const dr = c.drunkRR || 'one', L = { off: 'no repetir', one: 'repetir un 1', nosix: 'repetir salvo un 6' }, nx = { off: 'one', one: 'nosix', nosix: 'off' }[dr];
    h += `<div class="row"><button class="btn small" data-act="drunkRR" data-v="${c.id}|${nx}" title="Padre de Bestias: repetir el D6 de la tabla de Borrachos de los Centigors">${esc(c.name)} — Borrachos: ${L[dr]}</button></div>`;
  }
  if (u.owner === viewer()) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).wizard)) { // Core p.110: tú nominas al Mago que dispersa (o prefieres la dispersión del destino)
    const dp = c.dispPref || 'auto', L = { auto: 'Dispersa: automático (mayor Nivel)', first: 'Dispersa: este Mago primero', off: 'Dispersa: no (dispersión del destino)' }, nx = { auto: 'first', first: 'off', off: 'auto' }[dp];
    h += `<div class="row"><button class="btn small" data-act="dispPref" data-v="${c.id}|${nx}" title="Quién intenta dispersar los hechizos enemigos">${esc(c.name)} — ${L[dp]}</button></div>`;
  }
  if (u.owner === viewer() && u.models > 0) { // Hombres Lagarto: Rugido Primigenio, Furia del sapo, Alma de Piedra y Guardianes (decisiones del jugador)
    if (D(u).cult && !u.cultUsed && s.phase === 'strategy' && s.active === u.owner && !u.fleeing) h += `<div class="row"><button class="btn small" data-act="cult" data-v="${u.id}" title="Cultos Caóticos (AJ Westerland): una vez por partida, en la subfase de Mando; chequeo de Liderazgo">Alabar a los dioses</button></div>`;
    if (D(u).sr.includes('primRoar') && !u.roarUsed && s.phase === 'strategy' && s.active === u.owner && !u.fleeing && !isEngaged(s, u)) h += `<div class="row"><button class="btn small" data-act="roar" data-v="${u.id}" title="Una vez por partida, en Mando: test de Liderazgo; si lo supera, los Hombres Lagarto a 7\" ganan Carga Furiosa este turno">Rugido Primigenio</button></div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && (c.items || []).some((k) => ITEMS[k]?.soulStone))) { const cur = c.soulDir ?? 1, nxt = cur === 1 ? -1 : cur === -1 ? 0 : 1; h += `<div class="row"><button class="btn small" data-act="soulDir" data-v="${c.id}|${nxt}" title="Alma de Piedra: modifica el resultado de la tabla de percances en +1 (máx. 12), −1 (mín. 2) o nada">Alma de Piedra: ${cur === 1 ? '+1' : cur === -1 ? '−1' : 'sin modificar'} (cambiar)</button></div>`; }
    if (u.type === 'lm_temple') h += `<div class="row"><button class="btn small" data-act="pref" data-v="noGuard" title="Guardianes: si un Slann a 3\" sufre un impacto de disparo, con 2+ puedes transferirlo a esta unidad">Guardianes: ${u.noGuard ? 'NO transferir impactos' : 'transferir impactos al Slann'} (cambiar)</button></div>`;
  }
  if (u.owner === viewer()) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).wizard && D(c).sr.includes('sorcCurse'))) { const foes = s.units.filter((e) => e.owner !== viewer() && e.models > 0).flatMap((e) => [e, ...(e.joined || [])]).filter((m) => m.models > 0 && D(m).cat === 'char'); if (!foes.length) continue; const ix = foes.findIndex((m) => m.id === c.hashutPick), nx = foes[ix + 1]; h += `<div class="row"><button class="btn small" data-act="hashutPick" data-v="${c.id}|${nx ? nx.id : ''}" title="Maldición de Hashut (si la lanzas): personaje enemigo contra el que se dirige, aunque esté unido o trabado">${esc(c.name)} — Maldición de Hashut: ${ix >= 0 ? esc(foes[ix].name) : 'el de mayor coste (auto)'}</button></div>`; }
  for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && c.owner === viewer() && (c.items || []).some((k) => ITEMS[k]?.thunder))) { const tm = c.thunderMode || 'auto', TL = { auto: 'automático', on: 'siempre', off: 'nunca' }, tn = { auto: 'on', on: 'off', off: 'auto' }[tm]; h += `<div class="row"><button class="btn small" data-act="thunderMode" data-v="${c.id}|${tn}" title="Mazo del Trueno: en vez de atacar normalmente, una tirada para impactar y plantilla de 3\" sobre la unidad">${esc(c.name)} — Golpe de trueno: ${TL[tm]}</button></div>`; }
  if (u.owner === viewer()) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && (c.items || []).some((k) => ITEMS[k]?.condRR))) { const cp = c.condPol || 'harm', CL = { harm: 'repetir si sale 7 o menos', disaster: 'repetir si sale 6 o menos', off: 'no repetir' }, cn = { harm: 'disaster', disaster: 'off', off: 'harm' }[cp]; h += `<div class="row"><button class="btn small" data-act="condPol" data-v="${c.id}|${cn}" title="Condensador de Disformidad: puedes repetir el resultado de la tabla de percances; elige cuándo hacerlo">Condensador de Disformidad: ${CL[cp]}</button></div>`; }
  if (u.owner === viewer() && D(u).sr.includes('abominable')) { const am = u.abomMode || 'normal', AL = { normal: 'ataque normal', feed: 'Alimentarse', avalanche: 'Avalancha de carne' }, an = { normal: 'feed', feed: 'avalanche', avalanche: 'normal' }[am]; h += `<div class="row"><button class="btn small" data-act="prefv" data-v="abomMode|${an}" title="En vez de atacar normalmente puede Alimentarse (un modelo en contacto, D3 heridas sin armadura) o lanzar una Avalancha de carne (plantilla de 3\", F del modelo, FP -2, amigos y enemigos)">Ataques abominables: ${AL[am]}</button></div>`; }
  if (u.owner === viewer() && rangedOf(u)?.ms && !rangedOf(u).noPen) { const mp = u.multiPref || 'auto', ML = { auto: 'según probabilidad (auto)', multi: 'disparos múltiples (−1)', single: 'un solo disparo' }, mn = { auto: 'multi', multi: 'single', single: 'auto' }[mp]; h += `<div class="row"><button class="btn small" data-act="multiPref" data-v="${u.id}|${mn}" title="Disparos múltiples (X): un disparo normal o varios con −1 a impactar">Disparo: ${ML[mp]}</button></div>`; }
  if (u.owner === viewer() && D(u).ranged?.diver) { const dp = u.diverPref || 'auto', DL = ['auto', 'char', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'free'], nm = (v) => v === 'auto' ? 'más impactos en el blanco (auto)' : v === 'char' ? 'hacia un personaje enemigo cercano' : v === 'free' ? 'rumbo libre (indica los grados)' : v[0] === 'a' ? 'rumbo libre ' + v.slice(1) + '°' : 'rumbo ' + Number(v[1]) * 45 + '° (0° = este, sentido horario en pantalla)', nx = DL[(dp[0] === 'a' ? 10 : DL.indexOf(dp)) + 1 > 10 ? 0 : (dp[0] === 'a' ? 10 : DL.indexOf(dp)) + 1]; h += `<div class="row"><button class="btn small" data-act="diverPref" data-v="${u.id}|${nx}" title="FAQ RH: tras desviarse, la plantilla se mueve la distancia completa del D3\" que tires; tú eliges la dirección (incluso para alcanzar a un personaje cercano)">Plantilla D3\": ${nm(dp)}</button></div>`; }
  if (u.owner === viewer() && D(u).ranged?.dsRockets) { const rp = u.rocketPref || 'auto', RL = { auto: 'según el objetivo (auto)', demo: 'demolición', inc: 'incendiarios' }, rn = { auto: 'demo', demo: 'inc', inc: 'auto' }[rp]; h += `<div class="row"><button class="btn small" data-act="rocketPref" data-v="${u.id}|${rn}" title="Cada turno dispara un solo tipo de cohete: demolición (3\", F6 FP −3, Heridas múltiples D6) o incendiarios (5\", flamígeros, Pánico)">Cohetes: ${RL[rp]}</button></div>`; }
  if (u.owner === viewer() && D(u).sr.includes('lumberDest') && s.phase === 'move' && !u.moved) h += `<div class="row"><button class="btn small" data-act="lumber" data-v="${u.id}" ${u.lumberK === s.turn + ':' + s.active ? 'disabled' : ''} title="Destrucción desmedida: tira un D6 y suma el resultado a M; un 1 natural la inmoviliza este turno">Destrucción desmedida: tirar D6${u.lumberAdd ? ' (+' + u.lumberAdd + ')' : ''}</button><button class="btn small${u.lumberOn ? ' on' : ''}" data-act="pref" data-v="lumberOn" title="Tirar automáticamente el D6 al mover">Auto: ${u.lumberOn ? 'sí' : 'no'}</button></div>`;
  if (u.owner === viewer()) for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).vials)) { const vp = !c.vialPref || c.vialPref === 'auto' ? (c.vialPref === 'auto' ? 'unit' : 'off') : c.vialPref, VL = { unit: 'contra la unidad', model: 'contra un solo modelo', off: 'no lanzar' }, vn = { unit: 'model', model: 'off', off: 'unit' }[vp], fo = vp === 'off' ? [] : engagedWith(s, u).filter((e) => e.models > 0); if (fo.length > 1) { const ci = Math.max(0, fo.findIndex((e) => e.id === c.vialTgt)); h += `<div class="row"><button class="btn small" data-act="vialTgt" data-v="${c.id}|${fo[(ci + 1) % fo.length].id}" title="Sangre de Hashut: unidad enemiga contra la que se lanza el vial">${esc(c.name)} — vial contra: ${UC(fo[ci], fo)}</button></div>`; } h += `<div class="row"><button class="btn small" data-act="vialPref" data-v="${c.id}|${vn}" title="Sangre de Hashut: elige a quién lanzas el vial (unidad o un solo modelo) o si lo guardas">${esc(c.name)} — Sangre de Hashut: ${VL[vp]}</button></div>`; }
  if (u.owner === viewer() && u.models > 0 && G.s.phase === 'move' && isEngaged(G.s, u)) { const fo = engagedWith(G.s, u).filter((e) => e.models > 0); if (fo.length > 1) { const cur = fo.some((e) => e.id === u.focus) ? u.focus : ''; h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted" title="Core p.144-147: eliges a qué unidad en contacto diriges los ataques; sin elegir, se reparten según los modelos en contacto">Atacar a:</span><button class="btn small" data-act="prefv" data-v="focus|" ${cur === '' ? 'disabled' : ''}>Reparto automático</button>${fo.map((e) => `<button class="btn small" data-act="prefv" data-v="focus|${e.id}" ${cur === e.id ? 'disabled' : ''}>${esc(e.name)}</button>`).join('')}</div>`; } }
  if (u.owner === viewer() && u.models > 1 && D(u).sr.includes('openOrder') && D(u).sr.includes('skirmish') && G.s.phase === 'move' && !u.moved && !u.charged) { const cur = u.skirm === false ? 'open' : 'skirm'; /* v833: al desplegar se pregunta con popup al declararse listo; aquí, la reforma (acción del movimiento) */ h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted" title="Core p.125: reformar gasta el movimiento">Reformar a:</span>${[['skirm', 'Escaramuza'], ['open', 'Orden abierto']].map(([v, l]) => `<button class="btn small" data-act="prefv" data-v="formation|${v}" ${v === cur ? 'disabled' : ''}>${l}</button>`).join('')}</div>`; }
  for (const c of [u, ...(u.joined || [])].filter((m) => m.models > 0 && m.owner === viewer())) for (const [rk, pk, lab, ttl, flt] of [['overseer', 'ovTgt', 'Capataz inmortal', 'Mando: chequeo de Liderazgo; la unidad amiga elegida gana +D3 Iniciativa hasta tu próximo turno', (e) => D(e).cat !== 'char'], ['stoneShaper', 'ssTgt', 'Escultor de piedra', 'Mando: la unidad elegida mejora su Regeneración en 1 hasta el final del turno', (e) => /^tk_(ushabti|vushabti|colossus|necrosphinx)/.test(e.type)]]) if (D(c).sr.includes(rk)) {
    const fr = G.s.units.filter((e) => e.owner === c.owner && e.models > 0 && flt(e)), ids = ['auto', ...fr.map((e) => e.id), 'none'], cur = ids.includes(c[pk]) ? c[pk] : 'auto', nx = ids[(ids.indexOf(cur) + 1) % ids.length];
    h += `<div class="row"><button class="btn small" data-act="prefv" data-c="${c.id}" data-v="${pk}|${nx}" title="${ttl}">${lab}: ${cur === 'auto' ? 'la más valiosa' : cur === 'none' ? 'no usar' : (G.s.units.find((e) => e.id === cur)?.name || cur)}</button></div>`; }
  if (u.owner === viewer() && u.models > 0 && D(u).ogreLoader && !u.ogreUsed) { const om = u.ogreMode || 'twice', nx = { twice: 'reroll', reroll: 'off', off: 'twice' }[om]; h += `<div class="row"><button class="btn small" data-act="prefv" data-v="ogreMode|${nx}" title="Tripulación mercenaria (Cargador ogro): una vez por partida la máquina dispara dos veces en la fase de Disparo o repite un único dado de Artillería">Cargador ogro: ${{ twice: 'disparar dos veces', reroll: 'repetir un dado de Artillería', off: 'no usar' }[om]}</button></div>`; }
  if (u.owner === viewer() && u.type === 'ct_rockets') h += `<div class="row"><button class="btn small" data-act="pref" data-v="rocketBat" title="Cada turno dispara uno de los dos tipos de cohete: bastión (plantilla 3\", F4(5), FP −1(−3), Heridas múltiples D6 en el centro) o batería (plantilla 5\", F3(4), FP −1, flamígeros, Espíritus gimientes)">${u.rocketBat ? 'Cohetes: batería' : 'Cohetes: bastión'}</button></div>`;
  if (u.owner === viewer() && /^ct_sentinel/.test(u.type)) h += `<div class="row"><button class="btn small" data-act="pref" data-v="gbDeadly" title="Gran hoja: dos perfiles; elige el de cada ronda de combate (Golpe segador: F, FP −2, Perforación 1, +2D3 Ataques, Golpea último / Golpe mortal: F+1, FP −4, Golpe letal, Matamonstruos, Heridas múltiples D3)">${u.gbDeadly ? 'Gran hoja: Golpe mortal' : 'Gran hoja: Golpe segador'}</button></div>`;
  if (u.owner === viewer() && D(u).cat !== 'char' && s.units.some((g) => g.owner === u.owner && g.models > 0 && [g, ...(g.joined || [])].some((m) => m.models > 0 && D(m).sr.includes('grandStrategist')))) h += `<div class="row"><button class="btn small" data-act="pref" data-v="gsFallOn" title="Gran Estratega (Catay): una vez por turno, si ganas un combate dentro de su alcance de mando, puedes retirarte en buen orden en vez de seguir o perseguir">${u.gsFallOn ? 'Gran Estratega: retirarse al ganar (activado)' : 'Gran Estratega: retirarse al ganar (no)'}</button></div>`;
  if (u.owner === viewer()) for (const [rule, key, on, off, tip] of [['ctHung', 'noBatH', 'Hambre de batalla: +D3 a cargas y persecuciones (pulsa para renunciar)', 'Hambre de batalla: renunciada', 'Rasgo caótico: puedes aplicar el +D3 a la tirada de carga o persecución'], ['counterCharge', 'noCounter', 'Contracarga: se usará si te cargan (pulsa para renunciar)', 'Contracarga: renunciada', 'Core: puedes realizar el Movimiento de Contracarga (D3+1) cuando te cargan; es opcional'], ['quell', 'noQuell', 'Reprimir Impetuosidad: se usará (pulsa para renunciar)', 'Reprimir Impetuosidad: renunciado', 'Puedes repetir el chequeo de Liderazgo fallado de una unidad impetuosa a 6"'], ['motherly', 'noMother', 'Amor Maternal: atacar con la tabla (pulsa para renunciar)', 'Amor Maternal: renunciado (ataca normalmente)', 'En vez de atacar normalmente, la Bruja Troll puede hacer un ataque de Amor Maternal contra la unidad que elijas (selecciona al enemigo con «Atacar a»)'], ['indisHunger', 'noHunger', 'Hambre Indiscriminada: usar en Mando (pulsa para renunciar)', 'Hambre Indiscriminada: renunciada', 'En la subfase de Mando, trabada, nomina una unidad enemiga: chequeo de Iniciativa; si falla pierde 1 Herida y la Bruja recupera 1'], ['swiftstride', 'noSwift', 'Zancada: +D6 activado', 'Zancada: +D6 renunciado', 'FAQ p.176: puedes elegir sumar +1D6 a las tiradas de Carga, Huida y Persecución'], ['spectralReapers', 'noReap', 'Segadores Espectrales: atacar al sobrevolar (pulsa para renunciar)', 'Segadores Espectrales: renunciado', 'Al volar sobre una unidad enemiga no trabada: un impacto de F4 (sin armadura, flamígero, mágico) por modelo que pasó sobre ella'], ['evasive', 'noEvade', 'Evasivos: retirarse al ser disparados', 'Evasivos: no retirarse', 'FAQ p.168: una vez por turno, al ser objetivo de disparo, puedes retirarte en buen orden'], ['disengage', 'noDisLose', 'Desenganche al perder: retroceder en buen orden', 'Desenganche al perder: ceder terreno', 'FAQ Catay: si pierdes y cedes terreno, puedes retroceder en buen orden'], ['itRun', 'hitRunOn', 'Golpear y huir: retirarse en buen orden al ganar', 'Golpear y huir: renunciado (seguir/perseguir)', 'Si ganas un combate puedes retirarte en buen orden en vez de seguir o perseguir'], ['disengage', 'disWinOn', 'Desenganche al ganar: renunciado', 'Desenganche al ganar: retroceder en buen orden', 'FAQ Catay: si ganas y eliges contenerte y reformar, puedes retroceder en buen orden en vez de quedarte'], ['feintDodge', 'noFeint', 'Finta y esquiva: usar contra el primer ataque recibido (pulsa para reservarla)', 'Finta y esquiva: reservada (pulsa para usarla)', 'Una vez por partida, cuando un modelo enemigo dirige sus ataques contra este modelo, puedes obligarlo a repetir sus tiradas para impactar que hayan tenido éxito']]) if (D(u).sr.includes(rule)) h += `<div class="row"><button class="btn small" data-act="pref" data-v="${key}" title="${tip}">${u[key] ? off : on}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && (u.items || []).some((k) => ITEMS[k]?.glowy) && !(u.used && u.used.glowy)) h += `<div class="row"><button class="btn small" data-act="pref" data-v="noGlowy" title="FAQ RH: usar el Amuleto sustituye a la dispersión de Mago contra ese hechizo; elige cuál">${u.noGlowy ? 'Amuleto Verde: reservado (dispersa el Mago)' : 'Amuleto Verde: usar contra hechizos (pulsa para reservarlo)'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && G.s.lists?.[u.owner] && ((G.s.lists[u.owner] === 'jadefleet' && ['handgunners', 'crossbowmen'].includes(u.type)) || (G.s.lists[u.owner] === 'nuln' && u.type === 'handgunners')) && !u.drillUsed) h += `<div class="row"><button class="btn small" data-act="pref" data-v="noDrill" title="Instrucción de arcabuceros: una vez por partida la unidad dispara con una fila adicional (cuando hay filas traseras que puedan sumarse). Si la reservas, no se usará en este disparo">Instrucción de arcabuceros: ${u.noDrill ? 'reservada (pulsa para usarla)' : 'se usará en el próximo disparo (pulsa para reservarla)'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && (u.type === 'ct_lanterns_amb' || u.type === 'ct_lanterns_amb_hail') && !u.rrUsed) h += `<div class="row"><button class="btn small" data-act="pref" data-v="noBalloonRR" title="Globos de guerra: una vez por partida, una Linterna en reserva puede repetir el dado de llegada (si falla)">Globos de guerra: ${u.noBalloonRR ? 'no repetir la llegada' : 'repetir la llegada si falla'}</button></div>`;
  if (u.owner === viewer() && usOf(u) >= 10) for (const m of (u.joined || [])) if (m.models > 0 && D(m).sr.includes('verminValour')) h += `<div class="row"><button class="btn small" data-act="vvPref" data-v="${m.id}" title="Valor verminoso: sin desafío y en una unidad de Fuerza 10+, el personaje puede retirarse a la retaguardia (no ataca ni es atacado; la unidad usa su Liderazgo)">${esc(m.name)}: ${m.vvOn ? 'se retira a la retaguardia' : 'lucha en primera fila'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && D(u).wizard) for (const [it, key, nm] of [['power_scroll', 'pwOn', 'Pergamino de Poder (próximo lanzamiento: D6 extra)'], ['dispel_scroll', 'dsOn', 'Pergamino de Dispersión (próxima dispersión: D6 extra)']]) if ((u.items || []).includes(it) && !(u.used && u.used[it === 'power_scroll' ? 'power' : 'dispel'])) h += `<div class="row"><button class="btn small" data-act="pref" data-v="${key}">${nm}: ${u[key] ? 'sí' : 'no'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && D(u).wizard && ((u.items || []).includes('skl_tokens') || u.tokN)) h += `<div class="row"><button class="btn small" data-act="pref" data-v="tokOn" title="Fichas de Piedra Bruja: antes de lanzar puedes consumir una Ficha (+D3 al lanzamiento; con cada 1 natural pierdes una Herida)">Ficha de Piedra Bruja al lanzar: ${u.tokOn ? 'sí' : 'no'} (${(u.items || []).filter((k) => k === 'skl_tokens').length + (u.tokN || 0) - ((u.used && u.used.tok) || 0)})</button></div>`;
  if (u.owner === viewer() && u.models > 0 && s.scn === 'khazid' && u.owner === 1 && s.phase === 'deploy' && !s.ready[1]) h += `<div class="row"><button class="btn small ${u.scnAmb ? 'primary' : ''}" data-act="scnAmb" title="The Mountains Are Crawling: 0-6 unidades del defensor (0-3 de ellas personajes) pueden tener Emboscadores gratis">${u.scnAmb ? 'Emboscador (gratis): sí' : 'Emboscador (gratis): no'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && s.scn === 'leonen' && u.owner === 0 && D(u).cat === 'mach' && !s.turnStarted && s.phase !== 'over' && s.turn <= 1 && s.phase === 'deploy') h += `<div class="row" style="flex-wrap:wrap;gap:4px"><span class="muted">El poder de la Gran Cathay, objetivo previo a la batalla:</span>${s.units.filter((t) => t.models > 0 && t.owner !== u.owner).map((t) => `<button class="btn small ${u.mgTgt === t.id ? 'primary' : ''}" data-act="mgTgt" data-v="${t.id}">${UC(t)}</button>`).join('')}<button class="btn small" data-act="mgTgt" data-v="">Que decida la IA/valoración</button></div>`;
  if (u.owner === viewer() && u.models > 0 && u.garrison) h += `<div class="row"><button class="btn small" data-act="pref" data-v="bLeave" title="Si gana el combate, puede salir del edificio al seguir o perseguir al enemigo (su movimiento termina al colocarse junto al edificio)">Salir del edificio al perseguir/seguir: ${u.bLeave ? 'sí' : 'no'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && !u.garrison && D(u).cat === 'inf' && s.units.some((o) => o.models > 0 && o.garrison && o.owner !== u.owner && unitDist(u, o) <= 12)) h += `<div class="row"><button class="btn small" data-act="pref" data-v="occW" title="Si la unidad enemiga que ocupa el edificio rompe, queda atrapada y destruida; esta unidad vencedora ocupará el edificio vacío">Ocupar el edificio si queda vacío: ${u.occW ? 'sí' : 'no'}</button></div>`;
  if (u.owner === viewer() && u.models > 0 && s.lists?.[u.owner] === 'wolves' && D(u).cat !== 'char') h += `<div class="row"><button class="btn small" data-act="pref" data-v="noGazeTrophy" title="Lobos del Mar, Favor de los Dioses: si esta unidad captura el estandarte de una unidad enemiga puede tirar en la Mirada de los Dioses">Favor de los Dioses: ${u.noGazeTrophy ? 'no tirar al capturar estandarte' : 'tirar al capturar estandarte'}</button></div>`;
  if (u.owner === viewer() && u.models > 0) for (const m of [u, ...(u.joined || [])].filter((x) => x.models > 0 && (x.items || []).some((k) => ITEMS[k]?.eyeG) && !(x.used || {}).eye)) h += `<div class="row"><button class="btn small" data-act="eyeHold" data-v="${m.id}">${esc(m.name)}: ${m.eyeHold ? 'Ojo Guía reservado (pulsa para usarlo en el próximo disparo)' : 'Ojo Guía activo: repite impactos en el próximo disparo (pulsa para reservarlo)'}</button></div>`;
  if (u.owner === viewer() && u.models > 0) for (const m of [u, ...(u.joined || [])].filter((x) => x.models > 0 && D(x).sr.includes('hekarti') && !x.hekDone)) h += `<div class="row"><button class="btn small" data-act="hekHold" data-v="${m.id}">${esc(m.name)}: ${m.hekHold ? 'Bendición de Hekarti reservada (pulsa para usarla)' : 'Hekarti activa: repite el primer lanzamiento fallido (pulsa para reservarla)'}</button></div>`;
  if (u.owner === viewer() && u.models > 0) for (const m of [u, ...(u.joined || [])].filter((x) => x.models > 0 && (x.items || []).some((k) => ITEMS[k]?.luck))) h += `<div class="row"><button class="btn small" data-act="lkHold" data-v="${m.id}">${esc(m.name)}: ${m.lkHold ? 'Suerte reservada (pulsa para usarla)' : 'Suerte activa: repite la 1ª salvación fallada (pulsa para reservarla)'}</button></div>`;
  if (u.owner === viewer() && u.models > 0) for (const m of [u, ...(u.joined || [])].filter((x) => x.models > 0 && (x.items || []).some((k) => ITEMS[k]?.luckR))) { const lp = m.luckPref || 'auto'; h += `<div class="row"><span class="muted">${esc(ITEMS[(m.items || []).find((k) => ITEMS[k]?.luckR)]?.name || 'Reliquia de la Suerte')} (${esc(m.name)}): repetir</span>${[['auto', 'primera fallada'], ['hit', 'impactar'], ['wound', 'herir'], ['save', 'salvación']].filter(([k]) => k !== lp).map(([k, t]) => `<button class="btn small" data-act="luckPref" data-v="${m.id}|${k}">${t}</button>`).join('')}<span class="muted"> (ahora: ${({ auto: 'primera fallada', hit: 'impactar', wound: 'herir', save: 'salvación' })[lp]})</span></div>`; }
  if (u.owner === viewer() && u.models > 0 && u.type === 'gob_kiknik' && !u.fought) h += `<div class="row">${['hammer', 'pick'].filter((x) => x !== (u.smasha || 'hammer')).map((x) => `<button class="btn small" data-act="prefv" data-v="smasha|${x}" title="Da Skull Smasha: se elige al empezar la primera ronda de combate">Da Skull Smasha: ${x === 'pick' ? 'Pico (F, FP −2, Heridas múltiples 2)' : 'Martillo (F+2, FP −1)'}</button>`).join('')}<span class="muted"> (ahora ${u.smasha === 'pick' ? 'Pico' : 'Martillo'})</span></div>`;
  if (u.owner === viewer() && u.models > 0 && [u, ...(u.joined || [])].some((m) => m.models > 0 && (m.items || []).some((k) => ITEMS[k]?.hunthorn))) { const hp = (s.hornPref || {})[u.owner] ?? 1; h += `<div class="row">${[1, -1, 0].filter((x) => x !== hp).map((x) => `<button class="btn small" data-act="prefv" data-v="hornPref|${x}" title="Cuerno de la Gran Cacería: una vez por turno, tras la tirada de llegada de una unidad con Emboscadores en reserva, +1 o −1 al resultado">Cuerno: ${x > 0 ? '+1 a tus Emboscadores' : x < 0 ? '−1 a los Emboscadores rivales' : 'no usar'}</button>`).join('')}<span class="muted"> (ahora ${hp > 0 ? '+1 propio' : hp < 0 ? '−1 rival' : 'sin usar'})</span></div>`; }
  if (u.owner === viewer() && u.models > 0 && s.lists?.[u.owner] === 'chracia' && !(s.trailsUsed || {})[u.owner]) { const tp = (s.trailsPref || {})[u.owner] || 0; h += `<div class="row">${[1, -1, 0].filter((x) => x !== tp).map((x) => `<button class="btn small" data-act="prefv" data-v="trailsPref|${x}" title="Sendas ocultas: una vez por partida, +1 (a tus Emboscadores) o −1 (a los del rival) a la tirada de llegada; se aplica en la primera tirada en que cambia el resultado">Sendas ocultas: ${x > 0 ? '+1 a tus Emboscadores' : x < 0 ? '−1 a los Emboscadores rivales' : 'no usar'}</button>`).join('')}<span class="muted"> (ahora ${tp > 0 ? '+1 propio' : tp < 0 ? '−1 rival' : 'sin usar'})</span></div>`; }
  if (u.owner === viewer() && u.models > 0 && [u, ...(u.joined || [])].some((m) => m.type === 'gob_kiknik' && m.models > 0)) { const sm = u.sneakyMod ?? 1; h += `<div class="row">${[1, 0, -1].filter((x) => x !== sm).map((x) => `<button class="btn small" data-act="prefv" data-v="sneakyMod|${x}" title="Todos sigilosos: modificador a la tirada de llegada del mob de Jinetes de Lobo Emboscadores">Todos sigilosos: ${x > 0 ? '+1' : x < 0 ? '−1' : 'sin modificador'} a la llegada${x === 1 ? '' : ''}</button>`).join('')}<span class="muted"> (ahora ${sm > 0 ? '+1' : sm < 0 ? '−1' : '0'})</span></div>`; }
  if (u.owner === viewer() && G.s.phase === 'strategy' && G.s.active === u.owner && !u.fleeing) for (const c of [u, ...(u.joined || [])].filter((m) => m.models > 0)) {
    if (D(c).sr.includes('hornHunt') && !(c.used && c.used.horn)) h += `<div class="row"><button class="btn small" data-act="horn" data-v="${c.id}" title="Una vez por partida, en Mando: las unidades amigas en su alcance de mando ganan Frenesí hasta el final del turno">Sonar el Cuerno de la Cacería Salvaje</button></div>`;
    if (D(c).sr.includes('skaryn') && c.skK !== G.s.turn + ':' + G.s.active) for (const e of alive(G.s, 1 - u.owner).filter((x) => unitDist(u, x) <= 18)) h += `<div class="row"><button class="btn small" data-act="skaryn" data-v="${c.id}|${e.id}" title="Skaryn: D6, con 3+ un impacto F4 FP-1 al enemigo elegido a 18\"">Skaryn ataca a ${esc(e.name)}</button></div>`;
  }
  if (u.owner === viewer() && [u, ...(u.joined || [])].some((m) => m.models > 0 && (m.items || []).some((k) => ITEMS[k]?.orionF) && !(m.used && m.used.orion))) h += `<div class="row"><button class="btn small" data-act="pref" data-v="orionOn" title="Un solo uso: repite los impactos y heridas fallidos durante una fase de combate; se gasta en el siguiente combate de la unidad">Favor de Orión: ${u.orionOn ? 'se usará en el próximo combate' : 'no usar'}</button></div>`;
  if (u.owner === viewer()) { // Objetos de Battle March con elección del jugador
    const bmB = (k, label) => `<div class="row"><button class="btn small" data-act="pref" data-v="${k}">${label}</button></div>`, mem = [u, ...(u.joined || [])].filter((m) => m.models > 0);
    if (u.banner === 'bm_renown' && !(u.used && u.used.renown)) h += bmB('renownOn', `Estandarte del Renombre: ${u.renownOn ? 'se reclamará +1 de resolución en el próximo combate' : 'no usar'}`);
    if (mem.some((m) => (m.items || []).includes('bm_helm') && !(m.used && m.used.helmRR))) h += bmB('noHelm', `Yelmo del Valor: ${u.noHelm ? 'no repetir la Prueba de Ruptura' : 'repetirá la Prueba de Ruptura si falla'}`);
    if (mem.some((m) => (m.items || []).includes('bm_wyrd') && !(m.used && m.used.wyrd))) h += bmB('wyrdC', `Fragmento de Piedra Bruja: ${u.wyrdC ? 'se usará (+1) en la próxima tirada de lanzamiento' : 'no usar al lanzar'}`) + bmB('wyrdD', `Fragmento de Piedra Bruja: ${u.wyrdD ? 'se usará (+1) en la próxima dispersión' : 'no usar al dispersar'}`);
    for (const [it, pk, nm] of [['bm_alma', 'almaRR', 'Almanaque Encantado (Caos de guerra)'], ['bm_wmap', 'wmapRR', 'Mapa de la Espesura (Terreno salvaje)']]) if (mem.some((m) => (m.items || []).includes(it))) h += `<div class="row"><span class="muted">${nm}: repetir el D6 con</span> ${[1, 2, 3, 4, 5, 6].map((f) => { const cur = String(u[pk] || ''), on = cur.includes(String(f)); return `<button class="btn small" data-act="prefv" data-v="${pk}|${on ? cur.replace(String(f), '') : cur + f}">${f}${on ? ' ✓' : ''}</button>`; }).join(' ')}</div>`;
  }
  if (u.owner === viewer() && [u, ...(u.joined || [])].some((m) => m.models > 0 && (m.items || []).some((k) => ITEMS[k]?.falconHorn) && !(m.used && m.used.falcon))) h += `<div class="row"><button class="btn small" data-act="pref" data-v="falconOn" title="FAQ FoF: un solo uso; en la subfase de Mando, si no está trabado, test de Liderazgo propio sin modificar">Cuerno de Halcón: ${u.falconOn ? 'se intentará en Mando' : 'no usar'}</button></div>`;
  if (u.owner === viewer() && s.phase !== 'deploy') { const fs2 = engagedWith(s, u).filter((x) => x.models > 0); if (fs2.length > 1) for (const j of (u.joined || []).filter((x) => x.models > 0)) { const opts2 = [null, ...fs2.map((f) => f.id)], ci = Math.max(0, opts2.indexOf(j.tgt ?? null)), nx = opts2[(ci + 1) % opts2.length], nm = j.tgt ? (fs2.find((f) => f.id === j.tgt) ? unitTag(G.s, fs2.find((f) => f.id === j.tgt)) : 'enemigo') : 'dividir por igual'; h += `<div class="row"><button class="btn small" data-act="charTgt" data-c="${j.id}" data-v="${nx ?? ''}" title="Core p.209: el personaje dirige sus ataques contra un enemigo con el que esté en contacto de peana, o los divide entre ellos">${j.name}: ataca a ${nm}</button></div>`; } }
  if (s.phase !== 'deploy' && d.cat !== 'mach' && u.owner === viewer() && nearWall(s, u)) h += `<div class="row"><button class="btn small" data-act="defObst" data-v="${u.defObst === false ? 'yes' : 'no'}" title="Obstáculo lineal bajo defendido (Core p.271): la fila delantera en contacto con el obstáculo lo defiende y el que carga lo hace en desorden">Defender el obstáculo: ${u.defObst === false ? 'No' : 'Sí'}</button></div>`;
  if (s.phase !== 'deploy' && d.cat !== 'mach' && u.owner === viewer()) {
    const R = { auto: 'Automática', hold: 'Mantener', shoot: 'Defender y disparar', flee: 'Huir', fireflee: 'Disparar y huir' }, RC = ['auto', 'hold', 'shoot', 'flee', 'fireflee'], cur = u.react || 'auto';
    h += `<div class="row">${G.mode === 'code' ? `<button class="btn small" data-act="react" data-v="${RC[(RC.indexOf(cur) + 1) % RC.length]}" title="Reacción por defecto (solo para partidas por código): al ser cargada se te pregunta qué reacción elegir">Reacción ante carga: ${R[cur]}</button>` : ''}`;
    if (D(u).randM || u.cagedMove || u.pendFlee || (u.fx || []).some((f) => f.k === 'randMove')) { const cp = u.compPri ?? 0; h += `<button class="btn small" data-act="compPri" data-v="${(cp + 1) % 5}" title="Movimientos obligatorios (Core p.123): eliges el orden en que se resuelven (1 = primero)">Orden obligatorio: ${cp || 'auto'}</button>`; }
    const rp = u.restrainPref === undefined ? 'auto' : u.restrainPref ? 'try' : 'pursue', RR = { auto: 'Automática', try: 'Contenerse', pursue: 'Perseguir' };
    if (G.mode === 'code') h += G.mode !== 'code' ? '</div>' : `<button class="btn small" data-act="restr" data-v="${rp === 'auto' ? 'try' : rp === 'try' ? 'pursue' : 'auto'}" title="Si ganas el combate: intentar contenerse (test de Liderazgo) o perseguir / seguir adelante">Persecución: ${RR[rp]}</button></div>`;
    { const en = engagedWith(s, u); if (u.models > 0 && D(u).cat !== 'mach' && en.some((e) => e.champ && e.models > 1)) h += `<div class="row"><button class="btn small ${u.dirChamp ? 'on' : ''}" data-act="pref" data-v="dirChamp" title="Core p.199: los modelos en contacto de peana con el campeón enemigo pueden dirigir sus ataques contra él">${u.dirChamp ? '☑' : '☐'} Dirigir ataques al campeón enemigo</button></div>`; }
    if (G.mode === 'code' && u.models > 0 && u.owner === viewer() && u.panicRank !== undefined) h += `<div class="row"><span class="muted">Orden de chequeo de Pánico: ${u.panicRank}</span> <button class="btn small" data-act="panicRank" data-v="${Math.max(0, u.panicRank - 1)}">▲</button><button class="btn small" data-act="panicRank" data-v="${Math.min(99, u.panicRank + 1)}">▼</button> <button class="btn small" data-act="panicRank" data-v="50">Auto</button></div>`;
    else if (G.mode === 'code' && u.models > 0 && u.owner === viewer() && !u.fleeing) h += `<div class="row"><span class="muted">Pánico simultáneo: orden automático</span> <button class="btn small" data-act="panicRank" data-v="10">Elegir prioridad</button></div>`;
    if (u.models > 0 && dims(u).files > 1 && u.owner === viewer() && canReslot(s, u) /* v835: solo al desplegar, reformar o girar */ && (u.std || u.mus || joinedLive(u).length)) { // Ranuras de la fila delantera (FAQ Core p.14-15)
      const L = frontLayout(u), rows = [[u.std ? 'std' : null, 'Portaestandarte', L.std], [u.mus ? 'mus' : null, 'Músico', L.mus], ...joinedLive(u).map((j) => [L.chars[j.id] != null ? j.id : null, j.name, L.chars[j.id]])].filter((r) => r[0] && r[2] >= 0);
      for (const [who, nm, f] of rows) h += `<div class="row"><span class="muted">${nm}: ranura ${f + 1}/${L.nF}</span> <button class="btn small" data-act="slotFile" data-c="${who}" data-v="${Math.max(0, f - 1)}">◀</button><button class="btn small" data-act="slotFile" data-c="${who}" data-v="${Math.min(L.nF - 1, f + 1)}">▶</button></div>`;
    }
    if (u.champ && u.models > 1 && dims(u).files > 1 && u.owner === viewer() && canReslot(s, u)) { const nF = Math.min(dims(u).files, u.models), cf = Math.max(0, Math.min(nF - 1, u.champFile ?? Math.floor((nF - 1) / 2))); h += `<div class="row"><span class="muted">Posición del campeón: ${cf + 1}/${nF}</span> <button class="btn small" data-act="champFile" data-v="${Math.max(0, cf - 1)}">◀</button><button class="btn small" data-act="champFile" data-v="${Math.min(nF - 1, cf + 1)}">▶</button></div>`; }
    { const en = engagedWith(s, u); if (G.mode === 'code' && en.length > 1) { const ids = [null, ...en.map((e) => e.id)], ix = ids.indexOf(u.pursuitPick ?? null), nx = ids[(ix + 1) % ids.length]; h += `<div class="row"><button class="btn small" data-act="pursuitPick" data-v="${u.id}|${nx ?? ''}" title="Core p.155: si hay varias unidades perdedoras, declaras a cuál persigues">Perseguir a: ${u.pursuitPick ? (en.find((e) => e.id === u.pursuitPick) ? unitTag(G.s, en.find((e) => e.id === u.pursuitPick)) : 'auto') : 'automático'}</button></div>`; } }
    if (G.mode === 'code') h += `<div class="row"><button class="btn small" data-act="pref" data-v="accHalt" title="Core p.131: si otra unidad enemiga le cierra el paso al cargar y no puede esquivarla, detiene la carga a 1\" o sigue adelante">Si le cierran el paso: ${u.accHalt ? 'detener la carga' : 'seguir adelante'}</button><button class="btn small" data-act="pref" data-v="noRedirect" title="Core p.129: si el objetivo huye puedes intentar redirigir la carga (chequeo de Liderazgo)">Redirigir carga: ${u.noRedirect ? 'no' : 'sí'}</button>${(() => { const al = alive(s, 1 - u.owner).filter((e) => unitDist(u, e) <= 24); if (al.length < 2) return ''; const ids = [null, ...al.map((e) => e.id)], ix = ids.indexOf(u.redirTgt ?? null), nx = ids[(ix + 1) % ids.length]; return `<button class="btn small" data-act="redirTgt" data-v="${u.id}|${nx ?? ''}" title="Core p.129: si redirigís la carga, la unidad enemiga elegida (si es elegible) en vez de la más cercana">Nuevo objetivo: ${u.redirTgt ? (s.units.find((e) => e.id === u.redirTgt) ? unitTag(s, s.units.find((e) => e.id === u.redirTgt)) : '?') : 'más cercana'}</button>`; })()}</div>`;
    for (const c of [u, ...(u.joined || [])].filter((c) => c.models > 0 && D(c).sr.includes('braystaff'))) h += `<div class="row"><button class="btn small" data-act="bsMode" data-v="${c.id}" title="Bastón de los brayes: ofensivo = arma a dos manos; defensivo = arma de mano y Armadura 5+. Elígelo antes de cada combate">Bastón: ${c.bsDef ? 'defensivo (5+)' : 'ofensivo (dos manos)'}</button></div>`;
    if (d.cat === 'char' || joinedLive(u).length || u.champ) { const CP = { auto: 'Automáticos', always: 'Siempre', never: 'Nunca' }, cc = u.chalPol || 'auto'; h += `<div class="row"><button class="btn small" data-act="chalPol" data-v="${cc === 'auto' ? 'always' : cc === 'always' ? 'never' : 'auto'}" title="Lanzar y aceptar desafíos en combate: según la IA, siempre, o nunca (rechazarlos cuando se pueda)">Desafíos: ${CP[cc]}</button></div>`; }
  }
  // v833: el arma de combate se elige en el paso 1.1 de cada combate (popup), no en la ficha
  { // decisiones ya convertidas en ventanas emergentes: se preguntan en el momento en que surgen (no como ajustes previos). v832: también en el modo por código (mismos popups; la decisión del rival se le pasa por código)
    const RX = /data-act="(?:react|restr|panicRank|pursuitPick|redirTgt|eyeHold|hekHold|lkHold|rocketPref|vvPref|lumber|vgMode|armpick|assailTgt|bombPick|charTgt|cursepick|hashutPick|mgTgt|objpick|soulDir|toadPick|mwpref|dispPref|diverPref|luckPref|multiPref|mutPref|vialPref|vialTgt|condPol|drunkRR|giantMode|thunderMode|skullMode|suppMode|compPri|wfPref|chalPol|bsMode|focus)"|data-v="(?:hornPref|ogreMode|smasha|sneakyMod|trailsPref|accHalt|noRedirect|lumberOn|falconOn|renownOn|noHelm|noEvade|noSwift|noMother|noHunger|noDisLose|disWinOn|hitRunOn|ovTgt|ssTgt|noGuard|noDrill|noBatH|noBalloonRR|noGlowy|tokOn|bLeave|dirChamp|defObst|gbDeadly|gsFallOn|abomMode|orionOn|falconOn|noGazeTrophy|pwOn|dsOn|vvOn|noFeint|noQuell|noCounter|rocketBat|occW)(?=["|])/;
    h = h.replace(/<div class="row"[^>]*>(?:(?!<div)[\s\S])*?<\/div>/g, (m) => (RX.test(m) ? '' : m));
  }
  return h + '</div>';
}

const LOGF = [['all', 'Todo'], ['mine', 'Mío'], ['rival', 'Rival'], ['shoot', 'Disparo'], ['combat', 'Combate'], ['cast', 'Magia'], ['move', 'Movimiento']];
const LOGIC = { shoot: '🏹', combat: '⚔', charge: '🐎', cast: '✦', move: '➜', flee: '⚑', destroy: '☠', hit: '💥', rally: '✓' };
function logTab() {
  const f = UI.logF || 'all', my = viewer();
  const pass = (l) => {
    if (l.k === 'turn') return true;
    if (f === 'all') return true;
    if (f === 'mine') return l.owner === my;
    if (f === 'rival') return l.owner !== undefined && l.owner !== my;
    if (f === 'shoot') return l.k === 'shoot' || l.k === 'hit';
    if (f === 'combat') return ['combat', 'charge', 'flee', 'destroy'].includes(l.k);
    if (f === 'cast') return l.k === 'cast';
    if (f === 'move') return l.k === 'move' || l.k === 'charge';
    return true;
  };
  const rows = [];
  let pend = null;
  G.log.slice(-240).forEach((l, i, arr) => {
    const idx = G.log.length - arr.length + i;
    if (!pass(l)) return;
    if (l.k === 'turn') { pend = `<div class="logline turn">${esc(l.msg)}</div>`; return; }
    if (pend) { rows.push(pend); pend = null; }
    const clickable = l.ev && (l.ev.from || l.ev.at || l.ev.to || l.ev.x !== undefined);
    rows.push(`<div class="logline o${l.owner ?? 0} ${clickable ? 'click' : ''}" data-log="${idx}"><span class="li">${LOGIC[l.k] || '·'}</span>${esc(l.msg)}</div>`);
  });
  return `<div class="lgf" id="lgf">${LOGF.map(([k, n]) => `<button data-lf="${k}" class="${f === k ? 'on' : ''}">${n}</button>`).join('')}</div>` + (rows.join('') || '<p class="muted">Nada que mostrar con este filtro.</p>');
}
function armyTab() {
  const s = G.s;
  return [0, 1].map((o) => `<h3 style="color:${FACTIONS[s.factions[o]].color}">${fname(o)}</h3><div class="muted" style="margin-bottom:6px">${scoreVP(s, o)} PV ahora · ${s.units.filter((u) => u.owner === o && u.models > 0).reduce((t, u) => t + curPts(u), 0)} pts en pie</div><div class="ulist">${s.units.filter((u) => u.owner === o).map(unitItem).join('')}</div>`).join('<div style="height:14px"></div>');
}
// v843s: pestaña «Reglas de ejército»: TODAS las reglas aplicables a la unidad seleccionada, agrupadas por origen, con su descripción y su fuente
const ARMY_KEYS = ['blessings', 'waaagh', 'athelLoren', 'undead', 'harmony', 'willDragons', 'nehek', 'blessingChaos', 'peasantry']; // reglas que son del ejército/lista, no de una unidad (criterio documentado en VERIFICACION.md ## v843s)
const GEN_KEYS = ['closeOrder', 'openOrder', 'skirmish', 'large', 'detachment', 'regimental', 'horde', 'ponderous', 'swiftstride']; // reglas genéricas de la Tabla de tipos de tropa (Core p.105)
function ruleGroups(u) {
  const s = G.s, d = D(u), out = [];
  const src = (k) => { const r = RULE_SRC[k]; return r ? (r[0] ? `${r[0]} · ${r[1]}` : r[1]) : 'sin fuente local'; };
  const rr = (k, who) => RULES[k] ? { n: RULES[k][0], t: RULES[k][1] || '', f: src(k) + (who ? ` · ${who}` : '') } : null;
  const own = [], gen = [], army = [], eq = [], jn = [];
  const tt = TROOP[d.tt];
  if (tt) gen.push({ n: `Tipo de tropa: ${tt.name}`, t: `Filas mínimas para beneficiarse del orden: ${tt.minRank >= 99 ? 'no aplica' : tt.minRank}; bonificación máxima por filas: ${tt.maxRank}. Valor de unidad (US) por modelo: ${tt.us}. Tabla de tipos de tropa.`, f: 'Core p.105' });
  for (const k of d.sr) { const r = rr(k); if (!r) continue; (GEN_KEYS.includes(k) ? gen : ARMY_KEYS.includes(k) ? army : own).push(r); }
  const li = s.lists?.[u.owner], fac = s.factions[u.owner];
  if (li && LISTS[fac]?.[li]) army.unshift({ n: `Lista de ejército: ${LISTS[fac][li]}`, t: 'Lista elegida al crear el ejército: determina qué unidades, objetos y reglas de lista se pueden usar.', f: 'Libro de ejército' });
  for (const f of fxList(u)) { const fi = fxInfo(f.k); eq.push({ n: `${fi.name} (efecto activo)`, t: fi.text || fi.name, f: 'Efecto de hechizo, objeto o escenario en curso' }); }
  for (const k of u.items || []) if (ITEMS[k]) eq.push({ n: ITEMS[k].name, t: ITEMS[k].text || '', f: 'Objeto mágico / equipo (lista de ejército)' });
  if (u.banner && ITEMS[u.banner]) eq.push({ n: `Estandarte: ${ITEMS[u.banner].name}`, t: ITEMS[u.banner].text || '', f: 'Estandarte mágico (lista de ejército)' });
  if (u.std) eq.push({ n: 'Portaestandarte', t: '+1 a la resolución de combate (Core: grupo de mando).', f: 'Core · grupo de mando' });
  if (u.champ) eq.push({ n: 'Campeón', t: '+1 Ataque y puede lanzar o aceptar desafíos (Core: grupo de mando).', f: 'Core · grupo de mando' });
  if (u.mus) eq.push({ n: 'Músico', t: 'Desempata los combates igualados; +1 de Liderazgo al marchar cerca del enemigo y al reagruparse.', f: 'Core · grupo de mando' });
  if (u.mark) eq.push({ n: `Marca: ${MARKS[u.mark]}`, t: MARK_TXT[u.mark] || '', f: 'Libro de ejército (Caos)' });
  if (u.spells?.length) eq.push({ n: 'Hechizos que conoce', t: u.spells.map((k) => SPELLS[k]?.name).filter(Boolean).join(', '), f: 'Saber elegido antes del despliegue (Core p.106-107)' });
  for (const j of joinedLive(u)) {
    const jd = D(j), items = (j.items || []).filter((k) => ITEMS[k]);
    for (const k of jd.sr) { const r = rr(k, j.name); if (r) jn.push(r); }
    for (const k of items) jn.push({ n: ITEMS[k].name, t: ITEMS[k].text || '', f: `Objeto de ${j.name}` });
    if (!jd.sr.length && !items.length) jn.push({ n: j.name, t: 'Sin reglas especiales propias.', f: 'Personaje unido' });
  }
  out.push(['De la unidad', own], ['Del ejército', army], ['Del equipo', eq], ['Del personaje unido', jn], ['Genéricas del tipo de tropa', gen]);
  return out;
}
function armyRulesTab() {
  const u = UI.sel ? byId(G.s, UI.sel) : null;
  if (!u) return '<div class="empty"><b>Ninguna unidad seleccionada</b><br>Toca una unidad en el campo de batalla o en la lista para ver aquí todas sus reglas: de la unidad, del ejército, del equipo, del personaje unido y genéricas de su tipo de tropa.</div>';
  const d = D(u);
  return `<h3>${esc(u.name)}</h3><div class="muted">Reglas aplicables, por origen</div>` + ruleGroups(u).map(([g, l]) => `<h4 class="rg">${g} <span class="muted">(${l.length})</span></h4>${l.length ? l.map((r) => `<div class="rrow"><b>${esc(r.n)}</b><div>${esc(r.t) || '<i>Sin texto propio.</i>'}</div><small class="muted">Fuente: ${esc(r.f)}</small></div>`).join('') : '<p class="muted">Ninguna.</p>'}`).join('');
}
function rulesTab() {
  return `<h3>Resumen del turno</h3><p><b>Estrategia:</b> los que huyen intentan reagruparse (Ld; −1 por debajo del 50 %, sólo doble 1 por debajo del 25 %); se lanzan hechizos de maldición y mejora (2D6 + nivel ≥ dificultad; doble 6 = invocación perfecta; doble 1 = desastre mágico). El mago rival cercano puede dispersar.<br>
  <b>Movimiento:</b> mover M", marchar 2M" (con enemigos a 8" hay que superar Liderazgo). Carga: M + mayor de 2D6 (el menor se descarta; con bosque en medio, M−1 y se descarta el mayor). La carga da +1 de Iniciativa por pulgada completa (máx. +3, +4 por flanco o retaguardia). Quien es cargado puede aguantar y disparar si el cargador está más lejos que su M.<br>
  <b>Disparo:</b> BS 3 acierta con 4+. −1 si se movió, −1 a más de la mitad del alcance, −1 en bosque. Si una unidad pierde más del 25 % de modelos hace un test de pánico.<br>
  <b>Combate:</b> por orden de Iniciativa; impactos por HA contra HA, heridas por F contra R, armadura con AP. Resolución = heridas + filas (+1 cada fila con modelos suficientes, hasta +2) + flanco +1 / retaguardia +2 + orden de combate +1. El perdedor tira 2D6 + diferencia: si el dado sin modificar supera su Ld, huye; si sólo lo supera con la diferencia, retrocede en buen orden; si no, cede 2". Con más del doble de Fuerza de Unidad no hay «buen orden». El ganador persigue (2D6): si alcanza a un huido, lo aniquila.</p>
  <p class="muted">Puntos de victoria (Matched Play): unidad destruida o fuera de la mesa 100 % de sus puntos; huyendo 50 %; con ≤25 % de su fuerza 50 %; General muerto o huyendo +100; romper al rival (25 % de su fuerza) +500. Diferencia: de 0-100 empate, y más para victoria ajustada, clara o aplastante según el tamaño de la partida.</p>`;
}
function bindPanel() {
  document.querySelectorAll('[data-sel]').forEach((b) => (b.onclick = () => {
    selectUnit(b.dataset.sel); const u = byId(G.s, b.dataset.sel);
    if (u) { const sp = w2s({ x: u.x, y: u.y }); if (sp.x < 20 || sp.y < 20 || sp.x > view.w - 20 || sp.y > view.h - 20) focus({ x: u.x, y: u.y }, view.scale); }
    UI.tab = 'unit'; renderPanel(); dirty = true;
  }));
  document.querySelectorAll('[data-lf]').forEach((b) => (b.onclick = () => { UI.logF = b.dataset.lf; renderPanel(); }));
  document.querySelectorAll('[data-mine]').forEach((b) => (b.onclick = () => { const [id, i] = b.dataset.mine.split(':'); dispatch({ t: 'enter', id, mine: +i }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-wind]').forEach((b) => (b.onclick = () => dispatch({ t: 'windPick', k: b.dataset.wind })));
  document.querySelectorAll('[data-cuse]').forEach((b) => (b.onclick = () => { const [id, item] = b.dataset.cuse.split('|'); dispatch({ t: 'useItem', id, item }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-frm]').forEach((b) => (b.onclick = () => { const [id, v] = b.dataset.frm.split('|'); dispatch({ t: 'pref', id, k: 'frydMod', v: +v }); renderPanel(); }));
  document.querySelectorAll('[data-orb]').forEach((b) => (b.onclick = () => { const [id, target, model] = b.dataset.orb.split('|'); dispatch({ t: 'orb', id, target, model }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-hide]').forEach((b) => (b.onclick = () => { dispatch({ t: 'pref', id: b.dataset.hide, k: 'hideHost', v: 'next' }); renderPanel(); }));
  document.querySelectorAll('[data-reveal]').forEach((b) => (b.onclick = () => { dispatch({ t: 'reveal', id: b.dataset.reveal }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-stirs]').forEach((b) => (b.onclick = () => { UI.stirSel = b.dataset.stirs; toast('Toca la zona del tablero'); renderPanel(); }));
  document.querySelectorAll('[data-altp]').forEach((b) => (b.onclick = () => { const r = dispatch({ t: 'altPick', player: viewer(), id: b.dataset.altp }); if (r && r.ok) { const sel = G.s.alt.cur[0]; if (sel) UI.sel = sel; } renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-stirp]').forEach((b) => (b.onclick = () => { const [id, z] = b.dataset.stirp.split(':'); dispatch({ t: 'stirPick', player: viewer(), id, zone: +z }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-stirc]').forEach((b) => (b.onclick = () => { const v = b.dataset.stirc; const [id, host] = v === 'none' ? [null, null] : v.split(':'); dispatch({ t: 'stirChar', player: viewer(), id, host }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-rsv]').forEach((b) => (b.onclick = () => { const [id, x] = b.dataset.rsv.split(':'); dispatch({ t: 'enter', id, x: +x }); renderPanel(); dirty = true; }));
  document.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => unitAct(b.dataset.act, b.dataset.v, b.dataset.c)));
  document.querySelectorAll('[data-log]').forEach((b) => (b.onclick = () => {
    const l = G.log[+b.dataset.log]; const e = l?.ev; if (!e) return;
    const p = e.at || e.to || e.from || (e.x !== undefined ? { x: e.x, y: e.y } : null);
    if (p) { focus(p, 14); UI.fx.push({ at: p, color: '#ffcf5a', t0: performance.now(), ttl: 1400 }); dirty = true; }
  }));
}

// ---------- v211: acción contextual, deshacer, dados y números flotantes ----------
function castList(u, missile) {
  const out = [];
  for (const c of [u, ...(u.joined || []).filter((j) => j.models > 0)].filter((c) => D(c).wizard || (missile && ((c.items || []).includes('ring_ruin') || (c.items || []).includes('flamestrike'))) || (c.items || []).some((k) => ITEMS[k]?.boundSpell))) for (const k of spellKeys(c)) {
    const sp = SPELLS[k]; if (!sp) continue; const isM = sp.type === 'missile' || sp.type === 'vortex'; if (isM !== missile) continue;
    const dis = c.casted?.includes(k) || c.noMore || u.fleeing || isEngaged(G.s, u) || sp.type === 'assail';
    if (!dis) out.push({ v: c === u ? k : c.id + '|' + k, name: sp.name });
  }
  return out;
}
function renderFab() {
  const f = $('fab'); f.innerHTML = ''; UI.prev = null;
  if (!G || G.demo || !interactive() || UI.mode) return;
  const s = G.s;
  if (s.phase === 'deploy' && s.minePend?.[viewer()] > 0) { const b = document.createElement('button'); b.className = 'go'; b.innerHTML = '<span>Colocar Minas automáticamente</span>'; b.onclick = () => { dispatch({ t: 'autoMines', player: viewer() }); renderFab(); renderPanel(); dirty = true; }; f.appendChild(b); return; }
  if (s.phase === 'over' || s.phase === 'deploy') return;
  const u = UI.sel && byId(s, UI.sel); if (!u || u.owner !== viewer() || u.models <= 0 || s.active !== u.owner) return;
  const d = D(u); let main = null, sec = null, why = '';
  if (s.phase === 'move') {
    const eng = isEngaged(s, u), ct = chargeTargets(s, u);
    why = u.fleeing ? 'En huida: no puede mover' : u.moved && !u.freeReform ? 'Ya ha actuado este turno' : eng ? 'Trabada en combate: no puede mover' : '';
    if (ct.length) { main = { txt: 'Cargar', sub: `${ct.length} objetivo${ct.length > 1 ? 's' : ''}`, act: 'charge', danger: 1 }; if (!why) sec = { txt: 'Mover', act: 'move' }; }
    else if (!why) { main = { txt: 'Mover', sub: `${d.M}"`, act: 'move' }; if (d.cat !== 'mach') sec = { txt: 'Marchar', act: 'march' }; }
    if (gkCanJump(s, u)) { if (!main) main = { txt: 'Saltar de terreno', sub: 'Caballero Verde', act: 'gkjump' }; else sec = { txt: 'Saltar de terreno', act: 'gkjump' }; if (!main) why = ''; }
    if (!why && !main) why = 'Sin acciones disponibles';
    if (!why) UI.prev = 'move';
  } else if (s.phase === 'shoot') {
    const ts = legalShootTargets(s, u);
    if (ts.length) main = { txt: 'Disparar', sub: `${ts.length} objetivo${ts.length > 1 ? 's' : ''}`, act: 'shoot', danger: 1 };
    else why = d.cat === 'mach' && !rangedOf(u) ? 'Sin armas de proyectiles' : !rangedOf(u) ? '' : u.shot ? 'Ya ha disparado' : isEngaged(s, u) ? 'Trabada en combate: no dispara' : u.fleeing ? 'En huida: no dispara' : 'Sin objetivos: fuera de alcance, de arco frontal o sin línea de visión';
    const ms = castList(u, true);
    if (ms.length) { const m = ms[0]; if (!main) main = { txt: ms.length === 1 ? 'Lanzar ' + m.name : 'Lanzar hechizo', act: 'cast', v: m.v, many: ms.length > 1 }; else sec = { txt: ms.length === 1 ? m.name : 'Hechizo', act: 'cast', v: m.v, many: ms.length > 1 }; }
    if (rangedOf(u) && !u.shot) UI.prev = 'shoot';
  } else if (s.phase === 'strategy') {
    const cs = castList(u, false);
    if (cs.length) main = { txt: cs.length === 1 ? 'Lanzar ' + cs[0].name : 'Lanzar hechizo', act: 'cast', v: cs[0].v, many: cs.length > 1 };
    else if (d.wizard) why = 'Sin hechizos disponibles (ya lanzados, trabado o en huida)';
  }
  const go = (a) => () => { try { navigator.vibrate && navigator.vibrate(10); } catch { /* */ } if (a.many) { if (a.act === 'cast') { const uu = byId(G.s, UI.sel); if (uu) { showSpellHand(uu); return; } } if (UI.sheetTo) UI.sheetTo(2); UI.tab = 'unit'; renderPanel(); return; } unitAct(a.act, a.v); };
  if (why) { const w = document.createElement('div'); w.className = 'why'; w.textContent = why; f.appendChild(w); }
  if (sec) { const b = document.createElement('button'); b.className = 'sec'; b.textContent = sec.txt; b.onclick = go(sec); f.appendChild(b); }
  if (main) { const b = document.createElement('button'); b.className = 'go' + (main.danger ? ' danger' : ''); b.innerHTML = `<span>${esc(main.txt)}</span>${main.sub ? `<small>${esc(main.sub)}</small>` : ''}`; b.onclick = go(main); f.appendChild(b); }
}
// Core p.20 «Take-backs & Changing One's Mind» y FAQ Core («If I mark the position of a unit then proceed to move it before putting it back where it was and moving it again, does this count as a take-back? Yes, absolutely»):
// una vez movida una unidad o tirados los dados hay que atenerse a lo hecho (v843t: el botón ↶ Deshacer de la interfaz es una excepción pedida por el usuario solo mientras no haya información ni azar; ver undoLast). El motor no ofrece «deshacer» tras confirmar un movimiento (rules.takeBackAllowed lo rechaza);
// cambiar de idea es libre ANTES de confirmar: el fantasma de colocación y la vista previa (previewMove) no modifican la partida.
function floatFx(e, now) {
  if (!e.msg) return;
  let n = 0, col = '#ff6a5a';
  if (e.k === 'shoot') n = e.kills || 0;
  else { const m = /(?:→|,|:|sufre|causa)\s*(\d+)\s*bajas?/i.exec(e.msg); if (m) n = +m[1]; }
  if (e.k === 'destroy') { UI.fx.push({ txt: '☠', pos: { x: e.x, y: e.y }, color: '#ffffff', t0: now + 200, ttl: 2000 }); return; }
  const pos = e.to || e.at || (e.target && G.s && byId(G.s, e.target) ? (({ x, y }) => ({ x, y }))(byId(G.s, e.target)) : null);
  if (!pos) return;
  if (n > 0) UI.fx.push({ txt: '−' + n, pos: { x: pos.x, y: pos.y }, color: col, t0: now + 300, ttl: 2000 });
  else if (e.k === 'shoot' && e.hits === 0) UI.fx.push({ txt: 'Fallo', pos: { x: pos.x, y: pos.y }, color: '#c9c9c9', t0: now + 300, ttl: 1500 });
  else if (e.k === 'cast' && e.ok === false) UI.fx.push({ txt: e.miscast ? '¡Desastre!' : e.dispelled ? 'Dispersado' : 'Falla', pos: { x: pos.x, y: pos.y }, color: '#c79bff', t0: now + 100, ttl: 1800 });
}
let diceTm = null, diceIv = null;
function diceFor(events) {
  const box = $('dice'); if (!box || G.demo) return;
  const e = [...events].reverse().find((x) => (x.k === 'shoot' && x.hits !== undefined) || (x.k === 'combat' && x.ra !== undefined));
  if (!e) return;
  clearTimeout(diceTm); clearInterval(diceIv);
  const face = (ok) => (ok ? 4 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3));
  let title, dice, sum;
  if (e.k === 'shoot') {
    const h = Math.min(e.hits || 0, 16), w = Math.min(e.wounds || 0, h), k = Math.min(e.kills || 0, w);
    title = esc((e.msg || '').split(':')[0]);
    dice = Array.from({ length: Math.max(h, 1) }, (_, i) => ({ cls: !h ? 'miss' : i < k ? 'kill' : i < w ? 'hit' : 'miss', ok: h && i < w }));
    sum = `<span>Impactos <b>${e.hits || 0}</b></span><span>Heridas <b>${e.wounds || 0}</b></span><span>Bajas <b>${e.kills || 0}</b></span>`;
  } else {
    title = 'Resolución del combate';
    dice = [{ cls: e.ra > e.rb ? 'hit' : 'miss', v: e.ra, ok: 1 }, { cls: e.rb > e.ra ? 'hit' : 'miss', v: e.rb, ok: 1 }];
    sum = `<span>${esc(FNAME[G.s.factions[0]])} <b>${e.ra}</b></span><span>${esc(FNAME[G.s.factions[1]])} <b>${e.rb}</b></span>`;
  }
  box.hidden = false;
  const draw = (settled) => { box.innerHTML = `<div class="dt">${title}</div><div class="dr">${dice.map((d) => `<span class="die ${settled ? d.cls : 'roll'}">${settled ? (d.v !== undefined ? d.v : face(d.ok)) : 1 + Math.floor(Math.random() * 6)}</span>`).join('')}</div>${settled ? `<div class="dsum">${sum}</div>` : ''}`; };
  draw(false); let n = 0;
  diceIv = setInterval(() => { if (++n > 8) { clearInterval(diceIv); draw(true); diceTm = setTimeout(() => { box.hidden = true; }, 2600); } else draw(false); }, 75);
}

// ---------- selección y modos ----------
const t0Jade = (k) => k === 'ct_sentinel_jade';
function cancelMode() { UI.mode = null; UI.targets = null; UI.ghost = null; UI.aimMark = null; if (UI.atkHi && UI.atkHi.tgRole === 'Bloquea') UI.atkHi = null; renderPlacebar(); dirty = true; }
function selectUnit(id) { UI.sel = id; cancelMode(); renderPanel(); }

function unitAct(act, v, c2) {
  const s = G.s; const u = byId(s, UI.sel); if (!u) return;
  if (act === 'hand') { showSpellHand(u); return; }
  if (act === 'join') { const r = dispatch({ t: 'join', id: u.id, to: v }); if (r.ok) selectUnit(v); return; }
  if (act === 'leave') { dispatch({ t: 'leave', id: u.id, cid: v }); renderPanel(); return; }
  if (act === 'garrison' || act === 'ungarrison') { const r = dispatch({ t: act, id: u.id, bid: v }); if (!r.ok) toast(r.reason); renderPanel(); dirty = true; return; }
  if (act === 'waaagh') { dispatch({ t: 'waaagh', id: v }); renderPanel(); return; }
  if (act === 'dirge') { dispatch({ t: 'dirge', id: u.id, target: v }); renderPanel(); return; }
  if (act === 'animus') { const uu = G.s.units.find((x) => x.id === v); const as = uu ? animusSources(G.s, uu) : []; const i = as.findIndex((x) => x.id === uu.animusSrc); dispatch({ t: 'animus', id: v, src: i + 1 < as.length ? as[i + 1].id : null }); renderPanel(); return; }
  if (act === 'armpick') { const uu = G.s.units.find((x) => x.id === v); const nx = { auto: 'mount', mount: 'own', own: 'auto' }[uu?.armPick || 'auto']; dispatch({ t: 'armPick', id: v, v: nx }); renderPanel(); return; }
  if (act === 'incorp') { dispatch({ t: 'incorp', id: v }); renderPanel(); return; }
  if (act === 'digin') { dispatch({ t: 'digin', id: v }); renderPanel(); return; }
  if (act === 'grudgestone') { dispatch({ t: 'grudgestone', id: v }); renderPanel(); return; }
  if (act === 'dispelRip' || act === 'endRip') { const [src, sp] = v.split('|'); const r = dispatch({ t: act, src: G.s.units.some((x) => String(x.id) === src) || isNaN(+src) ? (G.s.units.find((x) => String(x.id) === src)?.id ?? src) : +src, spell: sp }); if (r && r.ok === false) toast(r.reason); renderPanel(); dirty = true; return; }
  if (act === 'toll') { dispatch({ t: 'toll', id: v }); renderPanel(); return; }
  if (act === 'cauldron') { dispatch({ t: 'cauldron', id: v }); renderPanel(); return; }
  if (act === 'cult') { dispatch({ t: 'cult', id: v }); renderPanel(); return; }
  if (act === 'roar') { dispatch({ t: 'roar', id: v }); renderPanel(); return; }
  if (act === 'toadPick') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'toadPick', v: nv ? Number(nv) : null }); renderPanel(); return; }
  if (act === 'soulDir') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'soulDir', v: Number(nv) }); renderPanel(); return; }
  if (act === 'rallycry') { dispatch({ t: 'rallycry', id: c2 || u.id, target: Number(v) }); renderPanel(); return; }
  if (act === 'khaine') { dispatch({ t: 'khaine', id: c2 || u.id, v }); renderPanel(); return; }
  if (act === 'goad') { dispatch({ t: 'goad', id: c2 || u.id, target: Number(v) }); renderPanel(); return; }
  if (act === 'bigboss') { dispatch({ t: 'bigboss', id: u.id }); renderPanel(); return; }
  if (act === 'horn') { dispatch({ t: 'horn', id: v }); renderPanel(); return; }
  if (act === 'skaryn') { const [cid, tid] = v.split('|'); dispatch({ t: 'skaryn', id: cid, target: tid }); renderPanel(); return; }
  if (act === 'nehek') { dispatch({ t: 'nehek', id: c2 || u.id, target: v }); renderPanel(); return; }
  if (act === 'transform') { const tu = byId(G.s, v); if (!tu) return; UI.mode = { k: 'place', id: tu.id, trf: true }; UI.ghost = { x: tu.x, y: tu.y, face: tu.face, manual: false }; checkGhost(); toast('Transformación: elige dónde colocar el nuevo modelo (a 6" o menos, a más de 1" de amigos y de 3" de enemigos)'); renderPlacebar(); dirty = true; return; }
  if (act === 'gaze') { dispatch({ t: 'gaze', id: v }); renderPanel(); return; }
  if (act === 'restr') { dispatch({ t: 'restrain', id: u.id, v }); renderPanel(); return; }
  if (act === 'compPri') { dispatch({ t: 'pref', id: u.id, k: 'compPri', v: +v || null }); renderPanel(); return; }
  if (act === 'charTgt') { dispatch({ t: 'pref', id: c2, k: 'charTgt', v: v || null }); renderPanel(); return; }
  if (act === 'defObst') { dispatch({ t: 'pref', id: u.id, k: 'defObst', v: v === 'yes' }); renderPanel(); return; }
  if (act === 'react') { dispatch({ t: 'react', id: u.id, v }); renderPanel(); return; }
  if (act === 'grudgeNom') { dispatch({ t: 'grudgeNom', id: v }); renderPanel(); return; }
  if (act === 'wfPref') { dispatch({ t: 'wfPref', id: u.id, v }); renderPanel(); return; }
  if (act === 'bsMode') { const c = [u, ...(u.joined || [])].find((x) => x.id === v); dispatch({ t: 'bsMode', id: v, v: !(c && c.bsDef) }); renderPanel(); return; }
  if (act === 'gkjump') { dispatch({ t: 'gkjump', id: u.id }); renderPanel(); return; }
  if (act === 'chalPol') { dispatch({ t: 'chalPol', id: u.id, v }); renderPanel(); return; }
  if (act === 'rot') { const r = dispatchDeploy(u, { face: u.face + +v }); return r; }
  if (act === 'filesinfo') { showRowsInfo(u, 0, null); return; }
  if (act === 'files') { dispatchDeploy(u, { files: Math.max(1, Math.min(u.models, dims(u).files + +v)), lance: false }); return; }
  if (act === 'lance') { dispatchDeploy(u, { lance: !u.lance }); return; }
  if (act === 'sp') { dispatchDeploy(u, { sp: clampSp(u, (u.spPref || 0) + +v) }); return; }
  if ((act === 'move' || act === 'march' || act === 'reserve') && UI.chargeQ?.length) { toast('Resuelve antes las cargas declaradas', 'bad'); return; }
  if (act === 'move' || act === 'march' || act === 'reserve') {
    UI.maxDist = false;
    UI.mode = { k: 'place', id: u.id, march: act === 'march', reserve: act === 'reserve' }; UI.ghost = { x: u.x, y: u.y, face: u.face, files: u.files, lance: u.lance, sp: u.spPref || 0, manual: false }; checkGhost(); toast('Toca o arrastra el destino'); renderPlacebar(); dirty = true;
  } else if (act === 'charge') {
    UI.mode = { k: 'charge', id: u.id }; UI.targets = chargeTargets(s, u).map((e) => e.id); toast('Elige el regimiento al que cargar'); renderPlacebar(); dirty = true;
  } else if (act === 'shoot') {
    UI.mode = { k: 'shoot', id: u.id }; UI.targets = legalShootTargets(s, u).map((e) => e.id); toast('Elige el objetivo'); renderPlacebar(); dirty = true;
  } else if (act === 'lumber') { dispatch({ t: 'lumber', id: v }); renderPanel(); return;
  } else if (act === 'thunderMode') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'thunderMode', v: nv }); renderPanel(); return;
  } else if (act === 'condPol') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'condPol', v: nv }); renderPanel(); return;
  } else if (act === 'giantMode') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'giantMode', v: nv }); renderPanel(); return;
  } else if (act === 'pursuitPick') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'pursuitPick', v: nv || null }); renderPanel(); return;
  } else if (act === 'redirTgt') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'redirTgt', v: nv || null }); renderPanel(); return;
  } else if (act === 'multiPref') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'multiPref', v: nv }); renderPanel(); return;
  } else if (act === 'diverPref') { const [cid, nv0] = String(v).split('|'); let nv = nv0; if (nv0 === 'free') { const g = Number(window.prompt('Rumbo de la plantilla en grados (0 = este, sentido horario en pantalla)', '0')); if (!Number.isFinite(g)) return; nv = 'a' + (((Math.round(g) % 360) + 360) % 360); } dispatch({ t: 'pref', id: cid, k: 'diverPref', v: nv }); renderPanel(); return;
  } else if (act === 'rocketPref') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'rocketPref', v: nv }); renderPanel(); return;
  } else if (act === 'hashutPick') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'hashutPick', v: nv || null }); renderPanel(); return;
  } else if (act === 'vialTgt') { const [cid, tg] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'vialTgt', v: tg || null }); renderPanel(); return;
  } else if (act === 'vialPref') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'vialPref', v: nv }); renderPanel(); return;
  } else if (act === 'mutPref') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'mutPref', v: nv }); renderPanel(); return;
  } else if (act === 'eyeHold' || act === 'hekHold') { const cm = G.s.units.flatMap((x) => [x, ...(x.joined || [])]).find((x) => x.id === v); dispatch({ t: 'pref', id: v, k: act, v: !cm?.[act] }); renderPanel(); return;
  } else if (act === 'lkHold') { const cm = G.s.units.flatMap((x) => [x, ...(x.joined || [])]).find((x) => x.id === v); dispatch({ t: 'pref', id: v, k: 'lkHold', v: !cm?.lkHold }); renderPanel(); return;
  } else if (act === 'luckPref') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'luckPref', v: nv }); renderPanel(); return;
  } else if (act === 'skullMode') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'skullMode', v: nv }); renderPanel(); return;
  } else if (act === 'drunkRR') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'drunkRR', v: nv }); renderPanel(); return;
  } else if (act === 'dispPref') { const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'dispPref', v: nv }); renderPanel(); return;
  } else if (act === 'nullstone') { dispatch({ t: 'nullStone', id: String(v) }); renderPanel(); return;
  } else if (act === 'drink') { const [cid, kk] = String(v).split('|'); dispatch({ t: 'drink', id: cid, k: kk }); renderPanel(); return;
  } else if (act === 'vvPref') { const mm = (u.joined || []).find((x) => x.id === v); if (mm) dispatch({ t: 'pref', id: mm.id, k: 'vvOn', v: !mm.vvOn }); renderPanel(); return;
  } else if (act === 'scnAmb') { dispatch({ t: 'pref', id: u.id, k: 'scnAmb' }); renderPanel(); return;
  } else if (act === 'mgTgt') { dispatch({ t: 'pref', id: u.id, k: 'mgTgt', v: v || null }); renderPanel(); return;
  } else if (act === 'bombPick') { dispatch({ t: 'pref', id: u.id, k: 'bombPick', v: v === '' ? null : Number(v) }); renderPanel(); return;
  } else if (act === 'objpick') { dispatch({ t: 'pref', id: u.id, k: 'objPick', v: v === '' ? null : String(v) }); renderPanel(); return;
  } else if (act === 'focus') { dispatch({ t: 'pref', id: u.id, k: 'focus', v: v || null }); renderPanel(); return;
  } else if (act === 'vgMode') { dispatch({ t: 'pref', id: u.id, k: 'vgMode', v }); renderPanel(); return;
  } else if (act === 'assailTgt') { const [cid, tg] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'assailTgt', v: tg || null }); renderPanel(); return;
  } else if (act === 'suppMode') { dispatch({ t: 'pref', id: u.id, k: 'suppMode', v }); renderPanel(); return;
  } else if (act === 'chalRetire') { dispatch({ t: 'pref', id: u.id, k: 'chalRetire', v: v || null }); renderPanel(); return;
  } else if (act === 'chalPick') { dispatch({ t: 'pref', id: u.id, k: 'chalPick', v: v || null }); renderPanel(); return;
  } else if (act === 'prefv') { const [pk, pv] = String(v).split('|'); dispatch({ t: 'pref', id: c2 || u.id, k: pk, v: pv }); renderPanel(); return;
  } else if (act === 'panicRank') { dispatch({ t: 'pref', id: u.id, k: 'panicRank', v: +v }); renderPanel(); return;
  } else if (act === 'slotFile') { dispatch({ t: 'pref', id: u.id, k: 'slotFile', who: c2, v: +v }); renderPanel(); return;
  } else if (act === 'champFile') { dispatch({ t: 'pref', id: u.id, k: 'champFile', v: +v }); renderPanel(); return;
  } else if (act === 'pref') { dispatch({ t: 'pref', id: u.id, k: v, v: !u[v] }); renderPanel(); return;
  } else if (act === 'herdsel') { UI.herdSel = true; toast('Toca el mapa para colocar la Piedra de las Manadas'); renderPanel(); return;
  } else if (act === 'leer') { UI.leerSel = String(v); toast('Toca el mapa para colocar el Espíritu Mirón (a más de 8" de los enemigos)'); renderPanel(); return;
  } else if (act === 'cursepick') {
    const [cid, nv] = String(v).split('|'); dispatch({ t: 'pref', id: cid, k: 'cursePick', v: nv }); renderPanel(); return;
  } else if (act === 'legpick') {
    const [cid, k] = String(v).split('|'); dispatch({ t: 'legPick', id: cid, drop: k }); renderPanel(); return;
  } else if (act === 'covenpick') {
    const [cid, k] = String(v).split('|'); dispatch({ t: 'covenPick', id: cid, pick: k }); renderPanel(); return;
  } else if (act === 'tomepick') {
    const [cid, k, tk] = String(v).split('|'); dispatch({ t: 'tomePick', id: cid, drop: k, take: tk }); renderPanel(); return;
  } else if (act === 'spdecide') { spDecide(String(v)); return;
  } else if (act === 'loretbl') { showLoreTable(v); return;
  } else if (act === 'spellpick') {
    const [cid, k, tk] = String(v).split('|'); dispatch({ t: 'spellPick', id: cid, drop: k, ...(tk ? { take: tk } : {}) }); renderPanel(); return;
  } else if (act === 'cast') {
    let cu = u; if (String(v).includes('|')) { const [cid, kk] = v.split('|'); cu = (u.joined || []).find((j) => j.id === cid) || u; v = kk; }
    const sp = SPELLS[v];
    if (sp.type === 'enchant' && !sp.friendRange) { dispatch({ t: 'cast', id: cu.id, spell: v, target: cu.id }); return; }
    UI.mode = { k: 'cast', id: cu.id, spell: v, friend: false };
    UI.targets = spellTargets(s, cu, v).filter((t) => !castCheck(s, cu, v, t)).map((t) => t.id);
    toast(UI.targets.length ? 'Elige el objetivo del hechizo' : 'Sin objetivos válidos'); if (!UI.targets.length) UI.mode = null; renderPlacebar(); dirty = true;
  }
}

function dispatchDeploy(u, patch) {
  const a = { t: 'deployMove', id: u.id, x: u.x, y: u.y, face: u.face, files: u.files, ...patch };
  const U0 = undoBegin(a);
  const r = apply(G.s, a);
  if (!r.ok) { toast(r.error, 'bad'); return r; }
  G.actions.push(a); undoEnd(a, U0, r); save(); renderAll(); return r;
}

function checkGhost() {
  const s = G.s; const m = UI.mode; if (!m || !UI.ghost) return;
  if (m.k === 'place' && m.trf) { const probe = JSON.parse(JSON.stringify(s)); const rr = apply(probe, { t: 'transform', id: m.id, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face }); UI.ghostOk = rr.ok; UI.ghostMsg = rr.ok ? 'Colocación válida (a 6" o menos del modelo actual)' : (rr.error || rr.reason || 'No válido'); return; }
  if (m.k === 'place' && m.reloc) {
    const rl = s.reloc, ru = byId(s, m.id);
    const far = rl && Math.hypot(UI.ghost.x - rl.from.x, UI.ghost.y - rl.from.y) > rl.r + 1e-6;
    let bad = rl && !far && ru ? checkPlacement(s, ru, { x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face, files: ru.files }, { enemyGap: rl.gap }) : null;
    if (!bad && rl && rl.kind === 'edge' && ru && !edgeOk(s, corners({ ...ru, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face }))) bad = 'Debe tocar el borde de la mesa fuera de las zonas de despliegue';
    UI.ghostOk = !!rl && !far && !bad; UI.ghostMsg = far ? 'Máximo 12" desde su posición original' : bad ? (bad.startsWith('A menos') ? 'No a 6" o menos del enemigo' : bad) : 'Colócala a 12" o menos del origen';
  } else if (m.k === 'place') {
    const r = previewMove(s, m.id, UI.ghost, m.march, m.reserve);
    UI.ghostOk = r.ok; UI.ghostMsg = r.ok ? `Coste ${r.cost.toFixed(1)}" de ${r.limit}"` : r.reason;
    if (r.blocker) UI.atkHi = { atk: m.id, tgt: r.blocker, role: 'Se mueve', tgRole: 'Bloquea' }; else if (UI.atkHi && UI.atkHi.tgRole === 'Bloquea') UI.atkHi = null; // v843s: se señala QUÉ unidad bloquea el giro de ala
    const mx = UI.maxDist && UI.ghost.mx; // v843q: modo «Distancia máxima»: el mensaje dice si se llega al máximo o se recorta, y por qué
    if (mx && r.ok) UI.ghostMsg = mx.clipped ? `⚠ Máximo legal ${r.cost.toFixed(1)}" de ${mx.limit}" (recortado: ${mx.reason || 'obstáculo'})` : `Distancia máxima: ${r.cost.toFixed(1)}" de ${r.limit}"`;
    else if (mx && !r.ok && mx.none) UI.ghostMsg = `No se puede avanzar en esa dirección: ${mx.reason || r.reason}`;
  } else if (m.k === 'deploy') {
    const u = byId(s, m.id);
    const t = { ...u, ...UI.ghost };
    const zoneOk = u.owner === 0 ? UI.ghost.y - dims(t).d / 2 >= 36 : UI.ghost.y + dims(t).d / 2 <= 12;
    const probe = JSON.parse(JSON.stringify(s)); const rr = apply(probe, { t: 'deployMove', id: u.id, x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face });
    UI.ghostOk = rr.ok; UI.ghostMsg = rr.ok ? '' : rr.error; void zoneOk;
  }
}

// Cargas declaradas (Core p.121-122): se declaran todas, luego se resuelven las reacciones y se mueven en el orden declarado
function queueCharge(id, target) {
  UI.chargeQ = (UI.chargeQ || []).filter((x) => x.id !== id).concat({ id, target });
  const u = byId(G.s, id), t = byId(G.s, target);
  cancelMode(); toast(`Carga declarada: ${u?.name} → ${t?.name}. Declara más o pulsa «Resolver cargas»`); renderPlacebar(); dirty = true;
}
function renderChargeQueue(pb) {
  const s = G.s;
  UI.chargeQ = (UI.chargeQ || []).filter((x) => { const u = byId(s, x.id), t = byId(s, x.target); return u && t && u.models > 0 && t.models > 0 && u.owner === s.active; });
  if (!UI.chargeQ.length || s.phase !== 'move') { UI.chargeQ = []; return false; }
  pb.hidden = false;
  pb.innerHTML = `<div class="msg good">Cargas declaradas: ${UI.chargeQ.map((x, i) => `${i + 1}. ${UC(byId(s, x.id))} → ${UC(byId(s, x.target))}`).join(' · ')}</div><div class="pbrow"><button class="btn primary" id="pbCgo">Resolver cargas</button><button class="btn" id="pbCclr">Borrar</button></div>`;
  $('pbCgo').onclick = async () => { const q = UI.chargeQ; UI.chargeQ = []; const act = { t: 'chargeAll', id: q[0].id, list: q }, rst = await askReactions(act); dispatch(act); for (const x of rst) dispatch(x); renderPlacebar(); renderPanel(); dirty = true; };
  $('pbCclr').onclick = () => { UI.chargeQ = []; renderPlacebar(); dirty = true; };
  return true;
}
function renderPlacebar() {
  const pb = $('placebar'); const m = UI.mode;
  renderFab();
  if (!m && renderChargeQueue(pb)) return;
  if (!m || (m.k !== 'place' && m.k !== 'charge' && m.k !== 'shoot' && m.k !== 'cast')) { pb.hidden = true; return; }
  pb.hidden = false;
  if (m.k !== 'place') {
    const src = byId(G.s, m.id) || anyById(G.s, m.id), tg = (UI.targets || []).map((id) => byId(G.s, id) || anyById(G.s, id)).filter(Boolean); // v831: también personajes unidos (Mano de Gork, Puerta Infernal)
    const odds = (t) => {
      if (!src) return '';
      const dist = unitDist(src, t);
      if (m.k === 'charge') { const need = Math.ceil(dist - D(src).M); const p = need <= 1 ? 1 : need > 6 ? 0 : 1 - ((need - 1) / 6) ** 2; return ` · ${dist.toFixed(1)}" · ~${Math.round(100 * p)}% de llegar`; }
      if (m.k === 'shoot') { const rg = rangedOf(src); return ` · ${dist.toFixed(1)}"${rg ? ' / alcance ' + rg.range + '"' + (dist <= rg.range / 2 ? ' (corto)' : '') : ''}`; }
      return ` · ${dist.toFixed(1)}"`;
    };
    const r2 = m.k === 'shoot' && D(src).ranged2 ? [D(src).ranged, D(src).ranged2] : null; pb.innerHTML = `<div class="msg">${src ? `<b class="rolechip">${m.k === 'charge' ? 'Cargador' : m.k === 'cast' ? 'Lanzador' : 'Atacante'}: ${UC(src)}</b> · ` : ''}${m.k === 'charge' ? 'Elige el objetivo de la carga' : m.k === 'shoot' ? 'Elige el objetivo del disparo' : 'Elige el objetivo del hechizo'}</div>${m.k === 'shoot' && D(src).ranged?.rapid ? [['a', 'Ráfaga: auto', undefined], ['y', 'Ráfaga: sí', true], ['n', 'Ráfaga: no', false]].map(([k, lb, v]) => `<button class="btn small${m.rapid === v ? ' on' : ''}" data-rp="${k}">${lb}</button>`).join('') : ''}${r2 ? [0, 1].map((w) => `<button class="btn small${m.wpn === w ? ' on' : ''}" data-wp="${w}">${w ? 'Arma 2' : 'Arma 1'} (${r2[w].range}")</button>`).join('') + `<button class="btn small${m.wpn === undefined ? ' on' : ''}" data-wp="a">Auto</button>` : ''}${tg.slice(0, 5).map((t, i) => `<button class="btn small" data-tg="${i}">${UC(t, tg)}${odds(t)}</button>`).join('')}<button class="btn" id="pbCancel">Cancelar</button>`;
    if (m.k === 'cast' && SPELLS[m.spell]?.type === 'vortex') { // Vórtice: el jugador coloca la plantilla en un punto (centro dentro del alcance, sin tocar peanas)
      const ab = document.createElement('button'); ab.className = 'btn small' + (m.aimPick ? ' on' : ''); ab.textContent = m.aimPick ? (m.aim ? `Punto del Vórtice ✓ (${m.aim.x.toFixed(0)}, ${m.aim.y.toFixed(0)})` : 'Toca el mapa para colocar el Vórtice') : 'Colocar el Vórtice en un punto';
      ab.onclick = () => { m.aimPick = !m.aimPick; if (!m.aimPick) { m.aim = null; UI.aimMark = null; } renderPlacebar(); dirty = true; }; pb.appendChild(ab);
      if (m.aim) { const gb = document.createElement('button'); gb.className = 'btn small danger'; gb.textContent = 'Lanzar al punto'; gb.onclick = () => { const near = tg.slice().sort((p, q) => Math.hypot(p.x - m.aim.x, p.y - m.aim.y) - Math.hypot(q.x - m.aim.x, q.y - m.aim.y))[0]; if (!near) return; const act = { t: 'cast', id: m.id, spell: m.spell, target: near.id, aim: { x: m.aim.x, y: m.aim.y } }; cancelMode(); dispatch(act); }; pb.appendChild(gb); }
    }
    if (m.k === 'shoot' && (rangedOf(src)?.cannon || D(src).ranged2?.cannon)) { // Cañón (Core, Cannon Fire): el jugador elige el punto objetivo
      const ab = document.createElement('button'); ab.className = 'btn small' + (m.aimPick ? ' on' : ''); ab.textContent = m.aimPick ? (m.aim ? `Punto de puntería ✓ (${m.aim.x.toFixed(0)}, ${m.aim.y.toFixed(0)})` : 'Toca el mapa para marcar el punto') : 'Elegir punto de puntería';
      ab.onclick = () => { m.aimPick = !m.aimPick; if (!m.aimPick) { m.aim = null; UI.aimMark = null; } renderPlacebar(); dirty = true; }; pb.appendChild(ab);
      if (m.aim) { const gb = document.createElement('button'); gb.className = 'btn small danger'; gb.textContent = 'Disparar al punto'; gb.onclick = () => { const near = tg.slice().sort((p, q) => Math.hypot(p.x - m.aim.x, p.y - m.aim.y) - Math.hypot(q.x - m.aim.x, q.y - m.aim.y))[0]; if (!near) return; const act = { t: 'shoot', id: m.id, target: near.id, wpn: m.wpn, rapid: m.rapid, aim: { x: m.aim.x, y: m.aim.y } }; cancelMode(); dispatch(act); }; pb.appendChild(gb); }
    }
    if (m.k === 'shoot' && src) { // v843t: unidades a las que NO se puede disparar porque otra unidad tapa la vista (qué unidad, resaltada al tocar) + regla en ⓘ
      const bl = shootBlocked(G.s, src); if (bl.length) {
        const d = document.createElement('div'); d.className = 'msg'; d.style.cssText = 'font-size:12px;opacity:.9';
        d.innerHTML = `Sin línea de visión: ${bl.map((x, i) => `<button class="btn small" data-blk="${i}">${UC(x.target)}</button>`).join(' ')} <button class="btn small ic" id="pbLosI" aria-label="Información sobre la línea de visión">ⓘ</button>`;
        pb.appendChild(d);
        d.querySelectorAll('[data-blk]').forEach((b) => (b.onclick = () => { const x = bl[+b.dataset.blk]; UI.atkHi = { atk: m.id, tgt: x.blocker, role: 'Dispara', tgRole: 'Bloquea' }; dirty = true; const bu = anyById(G.s, x.blocker); toast(`${unitTag(G.s, x.target)}: lo tapa ${bu ? unitTag(G.s, bu) : 'otra unidad'} (${bu && bu.owner === src.owner ? 'unidad amiga' : 'unidad enemiga'})`, 'bad'); }));
        $('pbLosI').onclick = () => openModal(`<div class="card ncard"><p class="nmsg"><b>Línea de visión al disparar</b><br>Un modelo solo ve lo que queda dentro de su arco de visión de 90° y a lo que puede trazar una línea recta sin cruzar otro modelo (Core p.103: «models and units always block line of sight», también las unidades amigas, aunque estén en contacto). Por eso normalmente solo ven los modelos de la fila delantera; basta con que UN modelo de la fila delantera vea alguna parte del objetivo (Core p.103 y fase de Disparo, p.136-137: «Check Line Of Sight»). Excepciones: los Objetivos Grandes se ven por encima o a través de otras unidades, salvo que estas también sean Objetivos Grandes (FAQ Core, Large Target); los Escaramuzadores ven en 360° (Core p.184-186) pero sus modelos también bloquean; los Insignificantes no bloquean; desde una colina se ve por encima de unidades que no están en ella (Core p.271).</p><div class="nrow"><button class="btn primary" id="losOk">Entendido</button></div></div>`), $('losOk').onclick = closeModal;
      }
    }
    pb.querySelectorAll('[data-rp]').forEach((b) => (b.onclick = () => { m.rapid = b.dataset.rp === 'a' ? undefined : b.dataset.rp === 'y'; renderPlacebar(); }));
    pb.querySelectorAll('[data-wp]').forEach((b) => (b.onclick = () => { m.wpn = b.dataset.wp === 'a' ? undefined : +b.dataset.wp; renderPlacebar(); }));
    pb.querySelectorAll('[data-tg]').forEach((b) => (b.onclick = () => { if (m.k === 'charge') { queueCharge(m.id, tg[+b.dataset.tg].id); return; } const act = m.k === 'shoot' ? { t: 'shoot', id: m.id, target: tg[+b.dataset.tg].id, wpn: m.wpn, rapid: m.rapid, aim: m.aim ? { x: m.aim.x, y: m.aim.y } : undefined } : { t: 'cast', id: m.id, spell: m.spell, target: tg[+b.dataset.tg].id, aim: m.aim ? { x: m.aim.x, y: m.aim.y } : undefined }; cancelMode(); dispatch(act); }));
    $('pbCancel').onclick = cancelMode; return;
  }
  pb.innerHTML = `<div class="msg ${UI.ghostOk ? 'good' : 'bad'}" id="pbMsg">${esc(UI.ghostMsg || '')}</div>
  <div class="pbrow"><button class="btn ic" id="pbL" title="Girar 15° a la izquierda">⟲</button><button class="btn ic" id="pbR" title="Girar 15° a la derecha">⟳</button><button class="btn ic" id="pbFace" title="Encarar al enemigo más cercano">⌖</button>${G.s.phase === 'move' || m.reserve ? `<button class="btn ic ${UI.maxDist ? 'primary' : ''}" id="pbMax" title="Distancia máxima: el movimiento usa siempre la mayor distancia legal (M, o 2M marchando) y tú solo eliges la dirección. ${UI.maxDist ? 'Activo' : 'Inactivo'}">⇥ Máx</button>` : ''}${G.s.phase === 'move' && !m.reloc && !m.trf ? '<button class="btn ic" id="pbWL" title="Girar de ala sobre la esquina delantera izquierda (15°): el coste es lo que recorre el modelo exterior">⤺</button><button class="btn ic" id="pbWR" title="Girar de ala sobre la esquina delantera derecha (15°): el coste es lo que recorre el modelo exterior">⤻</button>' : ''}
  ${byId(G.s, UI.mode.id)?.lanceable && byId(G.s, UI.mode.id).models >= 3 ? `<button class="btn ic ${UI.ghost.lance ? 'primary' : ''}" id="pbLance" title="Formación en Lanza (cuña): ${UI.ghost.lance ? 'activa' : 'inactiva'}">⛛</button>` : ''}${/^bm_wmerc_/.test(byId(G.s, UI.mode.id)?.type || '') && G.s.reloc ? `<button class="btn ic" id="pbMerc" title="Equipo de los mercenarios: ${byId(G.s, UI.mode.id).type === 'bm_wmerc_sb' ? 'arcos cortos' : 'escudos'} (toca para cambiar)">${byId(G.s, UI.mode.id).type === 'bm_wmerc_sb' ? '🏹' : '🛡'}</button>` : ''}<button class="btn ic" id="pbF1" title="Una fila menos de frente">◂▸</button><button class="btn ic" id="pbF2" title="Una fila más de frente">▸◂</button><button class="btn ic" id="pbFI" title="Información: qué ganas y pierdes con más o menos filas" aria-label="Información sobre las filas">ⓘ</button>${spMaxOf(byId(G.s, UI.mode.id)) > 0 ? `<button class="btn ic" id="pbS1" title="Separación entre modelos (escaramuza): ${(UI.ghost.sp || 0)}\" — menos">⇥</button><button class="btn ic" id="pbS2" title="Separación entre modelos (escaramuza): ${(UI.ghost.sp || 0)}\" (máx ${spMaxOf(byId(G.s, UI.mode.id))}\") — más">⇤</button>` : ''}
  <button class="btn primary ic" id="pbOk" title="Confirmar">✓</button><button class="btn ic" id="pbCancel" title="Cancelar">✕</button></div>`;
  const rot = (d) => { UI.ghost.face += d; UI.ghost.manual = true; if (UI.maxDist && UI.ghost.bearing != null) fitMaxGhost(UI.ghost.bearing); else checkGhost(); renderPlacebar(); dirty = true; };
  $('pbL').onclick = () => rot(-0.2618); $('pbR').onclick = () => rot(0.2618);
  const wheelG = (side) => { // Core p.124: el borde delantero avanza pivotando sobre una de sus esquinas delanteras
    const u = byId(G.s, m.id), g = UI.ghost, dm = dims({ ...u, files: g.files ?? u.files, lance: g.lance ?? u.lance }), W = wheelPivot(g, dm, side), C = W.C, a = W.a, vx = g.x - C.x, vy = g.y - C.y;
    const p0 = g.path || (g.path = []), last = p0[p0.length - 1] || { x: u.x, y: u.y }; if (Math.hypot(g.x - last.x, g.y - last.y) > 0.02) p0.push({ x: g.x, y: g.y }); // la línea de recorrido sigue el arco del pivote
    for (let k = 1; k <= 3; k++) { const ak = a * k / 3, ck = Math.cos(ak), sk = Math.sin(ak); p0.push({ x: C.x + vx * ck - vy * sk, y: C.y + vx * sk + vy * ck }); }
    g.x = W.x; g.y = W.y; g.face = W.face; g.manual = true; g.mx = null; checkGhost(); renderPlacebar(); dirty = true;
  };
  if ($('pbWL')) { $('pbWL').onclick = () => wheelG('L'); $('pbWR').onclick = () => wheelG('R'); }
  $('pbFace').onclick = () => {
    const u = byId(G.s, m.id); const en = alive(G.s, 1 - u.owner).sort((a, b) => unitDist(UI.ghost.x ? { ...u, x: UI.ghost.x, y: UI.ghost.y } : u, a) - unitDist({ ...u, x: UI.ghost.x, y: UI.ghost.y }, b))[0];
    if (en) { UI.ghost.face = Math.atan2(en.y - UI.ghost.y, en.x - UI.ghost.x); UI.ghost.manual = true; checkGhost(); renderPlacebar(); dirty = true; }
  };
  if ($('pbMax')) $('pbMax').onclick = () => { UI.maxDist = !UI.maxDist; const g = UI.ghost, u = byId(G.s, m.id); if (UI.maxDist) { g.mxToasted = false; const b = g.bearing ?? (Math.hypot(g.x - u.x, g.y - u.y) > 0.8 ? Math.atan2(g.y - u.y, g.x - u.x) : u.face); fitMaxGhost(b); toast('Distancia máxima: toca o arrastra en el mapa solo para elegir la dirección'); } else { g.mx = null; checkGhost(); } renderPlacebar(); dirty = true; };
  const fl = (d) => { const u = byId(G.s, m.id); UI.ghost.files = Math.max(1, Math.min(u.models, (UI.ghost.files || (u.lance ? dims(u).files : u.files)) + d)); UI.ghost.lance = false; checkGhost(); renderPlacebar(); dirty = true; };
  if ($('pbMerc')) $('pbMerc').onclick = () => { dispatch({ t: 'mercType' }); renderPlacebar(); dirty = true; };
  if ($('pbLance')) $('pbLance').onclick = () => { UI.ghost.lance = !UI.ghost.lance; checkGhost(); renderPlacebar(); dirty = true; };
  $('pbF1').onclick = () => fl(-1); $('pbF2').onclick = () => fl(1); $('pbFI').onclick = () => { const u = byId(G.s, m.id); showRowsInfo(u, 0, UI.ghost); };
  const spf = (d) => { const u = byId(G.s, m.id); UI.ghost.sp = clampSp(u, (UI.ghost.sp || 0) + d); toast(`Separación entre modelos: ${UI.ghost.sp}"`); checkGhost(); renderPlacebar(); dirty = true; };
  if ($('pbS1')) { $('pbS1').onclick = () => spf(-0.5); $('pbS2').onclick = () => spf(0.5); }
  $('pbOk').onclick = confirmPlace; $('pbCancel').onclick = m.reloc ? () => { if (dispatch({ t: 'relocSkip', id: m.id }).ok) cancelMode(); } : cancelMode;
}
function confirmPlace() {
  const m = UI.mode; if (!m || m.k !== 'place') return;
  if (!UI.ghostOk) { toast(UI.ghostMsg || 'Movimiento no válido', 'bad'); return; }
  const g = UI.ghost;
  if (m.trf) { const rt = dispatch({ t: 'transform', id: m.id, x: g.x, y: g.y, face: g.face }); if (rt.ok) { cancelMode(); renderPanel(); } return; }
  if (m.reloc) { const r0 = dispatch({ t: 'relocate', id: m.id, x: g.x, y: g.y, face: g.face }); if (r0.ok) cancelMode(); return; }
  const r = dispatch({ t: 'move', id: m.id, x: g.x, y: g.y, face: g.face, files: g.files, lance: g.lance, sp: g.sp, march: m.march, reserve: !!m.reserve });
  if (r.ok) cancelMode();
}

// ---------- entrada (puntero) ----------
const cv = $('cv'); let dirty = true;
const pts = new Map(); let drag = null; let pinch = null;
const localPos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

cv.addEventListener('pointerdown', (e) => {
  cv.setPointerCapture(e.pointerId);
  const p = localPos(e); pts.set(e.pointerId, { ...p, x0: p.x, y0: p.y, moved: false });
  if (pts.size === 2) { drag = null; const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, a: Math.atan2(b.y - a.y, b.x - a.x) }; return; }
  const w = s2w(p);
  const panBtn = e.button === 1 || e.button === 2 || e.shiftKey;
  drag = { pan: panBtn, kind: 'tap' };
  if (!G || panBtn) return;
  { const rec = pts.get(e.pointerId); rec.lp = setTimeout(() => { if (!rec.moved && pts.size === 1 && drag && drag.kind === 'tap' && G && !UI.mode) { const u = unitAt(G.s, w); if (u) { rec.long = true; selectUnit(u.id); UI.tab = 'unit'; renderPanel(); if (UI.sheetTo) UI.sheetTo(2); try { navigator.vibrate && navigator.vibrate(15); } catch { /* */ } dirty = true; } } }, 450); }
  if (UI.mode?.k === 'place') { drag.kind = 'place'; moveGhost(w, true); }
  else if (G.s.phase === 'deploy' && interactive()) {
    const u = unitAt(G.s, w, (x) => x.owner === viewer());
    if (u) { UI.lastTap = u.id; UI.sel = u.id; UI.mode = { k: 'deploy', id: u.id }; UI.ghost = { x: u.x, y: u.y, face: u.dpl ? u.face : deployFace(G.s, u) }; drag.kind = 'deploy'; drag.off = { x: u.x - w.x, y: u.y - w.y }; checkGhost(); renderPanel(); dirty = true; }
  }
});
cv.addEventListener('pointermove', (e) => {
  const p = localPos(e); const rec = pts.get(e.pointerId);
  if (!rec) { if (G) { const u = unitAt(G.s, s2w(p)); const id = u ? u.id : null; if (id !== UI.hover) { UI.hover = id; dirty = true; } } return; }
  const dx = p.x - rec.x, dy = p.y - rec.y; rec.x = p.x; rec.y = p.y;
  if (Math.hypot(p.x - rec.x0, p.y - rec.y0) > 6) rec.moved = true;
  if (pts.size === 2 && pinch) {
    const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    UI.userZoom = true; zoomAt(cx, cy, d / pinch.d); view.px += cx - pinch.cx; view.py += cy - pinch.cy;
    const an = Math.atan2(b.y - a.y, b.x - a.x); if (view.m3) { let da = an - pinch.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; view.yaw += da; }
    pinch = { d, cx, cy, a: an }; dirty = true; return;
  }
  if (!drag) return;
  if (drag.kind === 'place') moveGhost(s2w(p), false);
  else if (drag.kind === 'deploy' && rec.moved) { const w = s2w(p); UI.ghost.x = w.x + drag.off.x; UI.ghost.y = w.y + drag.off.y; checkGhost(); dirty = true; }
  else if (view.m3 && !drag.pan && rec.moved && drag.kind === 'tap' && UI.cam === 'tilt') { view.pitch = Math.max(0.32, Math.min(1.35, view.pitch - dy * 0.005)); dirty = true; } // 3D: solo con «Inclinar» activo el arrastre inclina
  else if (rec.moved || drag.pan) { view.px += dx; view.py += dy; dirty = true; } // en cualquier otro caso arrastrar mueve siempre el mapa
});
function endPointer(e) {
  const rec = pts.get(e.pointerId); pts.delete(e.pointerId);
  if (rec && rec.lp) clearTimeout(rec.lp);
  if (rec && rec.long) { if (pts.size === 0) drag = null; return; }
  if (pts.size < 2) pinch = null;
  if (!rec || !drag) return;
  const d = drag; if (pts.size === 0) drag = null;
  if (d.kind === 'deploy') {
    if (rec.moved && UI.ghostOk) { const u = byId(G.s, UI.mode.id); dispatchDeploy(u, { x: UI.ghost.x, y: UI.ghost.y, face: UI.ghost.face, mv: true }); }
    else if (rec.moved) toast(UI.ghostMsg || 'No se puede colocar ahí', 'bad');
    UI.mode = null; UI.ghost = null; dirty = true; renderPanel(); return;
  }
  if (d.kind === 'place') { renderPlacebar(); return; }
  if (!rec.moved && !d.pan && G) handleTap(s2w({ x: rec.x, y: rec.y }));
}
cv.addEventListener('pointerup', endPointer); cv.addEventListener('pointercancel', endPointer);
cv.addEventListener('contextmenu', (e) => e.preventDefault());
cv.addEventListener('wheel', (e) => { e.preventDefault(); UI.userZoom = true; const p = localPos(e); zoomAt(p.x, p.y, e.deltaY < 0 ? 1.15 : 1 / 1.15); dirty = true; }, { passive: false });

function fitMaxGhost(bearing) { // v843q: «Distancia máxima»: el jugador dirige; el motor da la mayor distancia legal en esa dirección
  const g = UI.ghost, m = UI.mode, u = byId(G.s, m.id);
  const r = maxMoveToward(G.s, m.id, bearing, { march: m.march, reserve: m.reserve, face: g.manual ? g.face : bearing, files: g.files, lance: g.lance, sp: g.sp });
  g.bearing = bearing; g.x = r.x; g.y = r.y; if (!g.manual) g.face = bearing; g.path = null; g.mx = { clipped: !!r.clipped, limit: r.limit, reason: r.reason, none: !!r.none };
  if (r.clipped && !g.mxToasted) { g.mxToasted = true; toast(r.none ? `No se puede avanzar en esa dirección: ${r.reason}` : `Recorte: el máximo de ${r.limit}" no es legal en esa dirección (${r.reason}); se usa el máximo legal`, r.none ? 'bad' : ''); }
  if (!r.clipped) g.mxToasted = false;
  checkGhost(); void u;
}
function moveGhost(w, first) {
  const g = UI.ghost, u = byId(G.s, UI.mode.id);
  const dist = Math.hypot(w.x - u.x, w.y - u.y);
  if (UI.maxDist && UI.mode.k === 'place' && !UI.mode.reloc && !UI.mode.trf) { if (dist > 0.8) fitMaxGhost(Math.atan2(w.y - u.y, w.x - u.x)); else if (g.bearing != null) fitMaxGhost(g.bearing); const mm = $('pbMsg'); if (mm) { mm.textContent = UI.ghostMsg; mm.className = 'msg ' + (UI.ghostOk ? 'good' : 'bad'); } dirty = true; return; }
  if (!g.manual && dist > 0.8) g.face = Math.atan2(w.y - u.y, w.x - u.x);
  else if (!g.manual) g.face = u.face;
  g.x = w.x; g.y = w.y; checkGhost(); const m = $('pbMsg'); if (m) { m.textContent = UI.ghostMsg; m.className = 'msg ' + (UI.ghostOk ? 'good' : 'bad'); } dirty = true; void first;
}

function handleTap(w) {
  if (PB.viewS) { toast('Estás viendo un paso anterior del turno de la IA: pulsa ⏭ para volver a la partida'); return; }
  const s = G.s;
  if (UI.herdSel && s.phase === 'deploy') { UI.herdSel = false; dispatch({ t: 'herdPlace', player: viewer(), x: w.x, y: w.y }); dirty = true; renderPanel(); return; } // Piedra de las Manadas
  if (UI.leerSel && s.phase === 'deploy') { const id = UI.leerSel; UI.leerSel = null; const r = dispatch({ t: 'leerPlace', id, x: w.x, y: w.y }); dirty = true; if (!r.ok) toast(r.err || r.msg || 'No se puede colocar ahí'); renderPanel(); return; } // Espíritu Mirón (Kralmaw)
  if (s.phase === 'deploy' && s.minePend?.[viewer()] > 0) { // Emboscada subterránea: colocar los marcadores de Mina tocando el mapa
    const me = viewer(); const r = dispatch({ t: 'placeMine', player: me, x: w.x, y: w.y }); dirty = true;
    if (r.ok && G.s.minePend && !(G.s.minePend[me] > 0) && G.s.phase === 'deploy' && G.mode === 'hot') { const o = 1 - me; if (G.s.minePend[o] > 0) { G.deployPlayer = o; G.curtain = true; orient(); showCurtain(); } }
    else if (r.ok && G.s.minePend?.[me] > 0) toast(`Quedan ${G.s.minePend[me]} marcador(es) de Mina`);
    return;
  }
  if (s.stirDep && s.stirDep.phase === 'units' && s.phase === 'deploy' && UI.stirSel && s.stirDep.turn === viewer() && w.x >= 0 && w.x < 72 && w.y >= 0 && w.y < 48) {
    const z = Math.floor(w.y / 24) * 3 + Math.floor(w.x / 24); const id = UI.stirSel; UI.stirSel = null;
    dispatch({ t: 'stirPick', player: viewer(), id, zone: z }); renderPanel(); dirty = true; return;
  }
  if ((UI.mode?.k === 'shoot' || UI.mode?.k === 'cast') && UI.mode.aimPick) { UI.mode.aim = { x: w.x, y: w.y }; UI.aimMark = { x: w.x, y: w.y }; renderPlacebar(); dirty = true; return; } // punto de puntería del cañón
  if (UI.mode && ['charge', 'shoot', 'cast'].includes(UI.mode.k)) {
    const u = unitAt(s, w, (x) => UI.targets.includes(x.id));
    if (u) {
      const m = UI.mode; if (m.k === 'charge') { queueCharge(m.id, u.id); return; } const act = m.k === 'shoot' ? { t: 'shoot', id: m.id, target: u.id, wpn: m.wpn, rapid: m.rapid } : { t: 'cast', id: m.id, spell: m.spell, target: u.id };
      cancelMode(); dispatch(act); return;
    }
    cancelMode(); return;
  }
  const u = unitAt(s, w);
  if (u) { UI.lastTap = u.id; selectUnit(u.id); UI.tab = 'unit'; renderPanel(); } else { UI.sel = null; cancelMode(); renderPanel(); }
  dirty = true;
}

// ---------- herramientas ----------
function bindTools() {
  for (const [id, ic] of [['zIn', 'plus'], ['zOut', 'minus'], ['zFit', 'fit'], ['zRot', 'rot'], ['zRival', 'eye'], ['btnMenu', 'menu']]) $(id).innerHTML = IC[ic];
  $('zIn').onclick = () => { zoomAt(view.w / 2, view.h / 2, 1.3); dirty = true; };
  $('zOut').onclick = () => { zoomAt(view.w / 2, view.h / 2, 1 / 1.3); dirty = true; };
  $('zUndo').onclick = undoLast;
  $('zFit').onclick = () => { UI.userZoom = false; if (view.m3) { view.close = !view.close; if (view.close) view.yaw = 0; else view.yaw = 0.42; } fit(); dirty = true; }; // en 3D alterna mesa entera ↔ acercarse a tu lado
  // acercar a la unidad seleccionada: centra la cámara y hace zoom hasta que la unidad ocupa casi todo el ancho; al pulsar otra vez vuelve a la vista anterior
  $('zUnit').onclick = () => {
    if (UI.zoomBack) { const z = UI.zoomBack; UI.zoomBack = null; view.scale = z.scale; view.px = z.px; view.py = z.py; if (z.yaw != null) { view.yaw = z.yaw; view.pitch = z.pitch; view.dcam = z.dcam; } $('zUnit').classList.remove('on'); dirty = true; return; }
    const u = G.s && (UI.sel || UI.lastTap) ? byId(G.s, UI.sel || UI.lastTap) : null;
    if (!u || u.models <= 0) { toast('Toca primero una unidad'); return; }
    const dm = dims(u); UI.zoomBack = { scale: view.scale, px: view.px, py: view.py, yaw: view.yaw, pitch: view.pitch, dcam: view.dcam }; UI.userZoom = true;
    if (view.m3 && camUnit(corners(u).map((p) => [p.x, p.y]), u.face)) { $('zUnit').classList.add('on'); dirty = true; return; } // v843s: 3D: unidad entera y de frente
    view.scale = Math.max(view.scale * 1.35, Math.min(170, view.w * 0.92 / Math.max(dm.w, dm.d * 0.8, 1.6))); // llena el ancho con la unidad; si ya estabas cerca, acerca un 35 % más
    focus({ x: u.x, y: u.y }, view.scale); $('zUnit').classList.add('on'); dirty = true;
  };
  $('zAI').onclick = () => { PB.open = true; PB.p = PB.steps.length; renderPbk(); };
  $('rhL').onclick = () => rotSel(-0.2618); $('rhR').onclick = () => rotSel(0.2618);
  $('zRot').onclick = () => { UI.userRot = true; view.k = (view.k + 1) % 4; fit(); dirty = true; };
  const setCam = (m) => { UI.cam = UI.cam === m ? null : m; $('zTilt').classList.toggle('on', UI.cam === 'tilt'); };
  $('zTilt').onclick = () => setCam('tilt'); // el desplazamiento del mapa ya no tiene botón: arrastrar siempre mueve
  const set3 = () => { // v843s: solo vista 3D (WebGL); sin WebGL se dibuja la mesa 3D simplificada y se avisa en castellano
    $('zTilt').hidden = !view.m3; if (!view.m3) { UI.cam = null; $('zTilt').classList.remove('on'); }
    const noGL = typeof navigator !== 'undefined' && navigator.webdriver && !window.__TOW_GL; // v843s: bajo automatización (pruebas) no se arranca WebGL (swiftshader tarda decenas de segundos): mesa 3D simplificada; window.__TOW_GL = true lo fuerza
    if (view.m3 && !gl3.tried) { gl3.tried = true; if (!noGL) glInit($('gl')); if (!gl3.ok && !noGL) setTimeout(() => toast('Tu navegador no admite WebGL: se muestra la mesa en 3D simplificado (sin miniaturas ni terreno detallados). Prueba con otro navegador o activa la aceleración por hardware.', 'bad'), 800); }
    view.glOn = !!(view.m3 && gl3.ok); $('gl').style.display = view.glOn ? 'block' : 'none';
  };
  set3();
  const sb = $('zSnd'); sb.innerHTML = sndEnabled() ? IC.snd : IC.mute; sb.onclick = () => { sb.innerHTML = sndToggle() ? IC.snd : IC.mute; sndPlay('turn'); };
  $('zRival').onclick = () => { UI.showRival = !UI.showRival; $('zRival').classList.toggle('on', UI.showRival); dirty = true; };
  $('btnMenu').onclick = () => (G && !G.demo && !G.tutorial ? gameMenu() : showMenu()); // v843s: en la batalla, el menú de la partida
  // Panel inferior (móvil en vertical): se arrastra por el asa entre tres alturas (mínimo, medio y grande); un toque alterna mínimo/medio
  {
    const panel = $('panel'), hd = $('sheetHandle'), app = $('app');
    const sizes = () => { const H = app.clientHeight; return [86, Math.round(H * 0.3), Math.round(H * 0.6)]; };
    const sheet = () => getComputedStyle(hd).display !== 'none';
    const refit = () => { resize(cv); if (!UI.userZoom) fit(); dirty = true; };
    const setH = (px, anim = true) => { panel.style.transition = anim ? '' : 'none'; panel.style.height = px + 'px'; panel.classList.toggle('min', px <= sizes()[0] + 4); };
    let st = store.get('tow_sheet', 1); if (![0, 1, 2].includes(st)) st = 1;
    const apply = (anim = true) => { if (!sheet()) { panel.style.height = ''; panel.classList.remove('min'); return; } setH(sizes()[st], anim); if (anim) setTimeout(refit, 230); else refit(); };
    UI.sheetApply = () => apply(false);
    UI.sheetTo = (n) => { if (!sheet()) return; st = n; try { store.set('tow_sheet', st); } catch { /* */ } apply(true); };
    let drag = null;
    const tabsEl = $('tabs');
    const down = (el, isHandle) => (e) => { if (!sheet() || (e.pointerType === 'mouse' && e.button !== 0)) return; drag = { y: e.clientY, h: panel.getBoundingClientRect().height, moved: false, handle: isHandle, el, id: e.pointerId, t0: e.timeStamp, ly: e.clientY, lt: e.timeStamp, v: 0 }; if (isHandle) { try { el.setPointerCapture(e.pointerId); } catch { /* */ } e.preventDefault(); } };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return; const dy = drag.y - e.clientY;
      if (!drag.moved && Math.abs(dy) > 5) { drag.moved = true; if (!drag.handle) { try { drag.el.setPointerCapture(e.pointerId); } catch { /* */ } } }
      if (e.timeStamp > drag.lt) { const v = (drag.ly - e.clientY) / (e.timeStamp - drag.lt); drag.v = drag.v * 0.5 + v * 0.5; drag.ly = e.clientY; drag.lt = e.timeStamp; }
      if (drag.moved) { const [a, , c] = sizes(); setH(Math.max(a, Math.min(c, drag.h + dy)), false); resize(cv); dirty = true; e.preventDefault(); }
    };
    const end = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return; const d = drag; drag = null;
      if (!d.moved) { if (d.handle) st = st === 0 ? 1 : 0; else return; }
      else { const h = panel.getBoundingClientRect().height, S = sizes(); st = S.reduce((bi, v, i) => (Math.abs(v - h) < Math.abs(S[bi] - h) ? i : bi), 0); if (Math.abs(d.v) > 0.4) st = Math.max(0, Math.min(2, (d.v > 0 ? Math.max(st, S.findIndex((v) => v > d.h + 4) < 0 ? 2 : S.findIndex((v) => v > d.h + 4)) : Math.min(st, S.map((v, i) => (v < d.h - 4 ? i : -1)).filter((i) => i >= 0).pop() ?? 0)))); }
      try { store.set('tow_sheet', st); } catch { /* */ } apply(true);
      if (d.moved && !d.handle) { const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; d.el.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => d.el.removeEventListener('click', stop, true), 50); }
    };
    for (const [el, isH] of [[hd, true], [tabsEl, false]]) { if (!el) continue; el.addEventListener('pointerdown', down(el, isH)); el.addEventListener('pointermove', move); el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); }
    apply(false);
  }
}

// Control de giro sobre la unidad seleccionada durante el despliegue: gira 15° sin abrir el panel
let rotHudKey = '';
function updateRotHud() {
  const h = $('rotHud'); if (!h) return;
  let show = false;
  if (G && G.s.phase === 'deploy' && !UI.mode && UI.sel && interactive()) {
    const u = byId(G.s, UI.sel);
    if (u && u.owner === viewer() && u.models > 0 && !G.s.ready?.[u.owner]) {
      const pts = corners(u).map((c) => w2s(c)); const x = pts.reduce((a, q) => a + q.x, 0) / pts.length, y = Math.min(...pts.map((q) => q.y)) - 8;
      const key = `${Math.round(x)},${Math.round(y)}`; if (key !== rotHudKey) { rotHudKey = key; h.style.left = Math.max(50, Math.min(view.w - 50, x)) + 'px'; h.style.top = Math.max(50, y) + 'px'; }
      show = true;
    }
  }
  if (h.hidden === show) h.hidden = !show;
}
function rotSel(d) { const u = G && byId(G.s, UI.sel); if (u) dispatchDeploy(u, { face: u.face + d }); }
let lastT = 0, lastDrew = false;
function loop(t) {
  if (G) UI.viewer = viewer();
  try { updateRotHud(); } catch { /* */ }
  const continuous = lastDrew; // el fotograma anterior también se dibujó: el intervalo mide el rendimiento real
  lastDrew = false;
  if (G && (dirty || gl3.dirty || animActive() || UI.fx.length || UI.targets || UI.rival || UI.mode)) {
    draw(cv, PB.viewS || G.s, UI, G); dirty = false; gl3.dirty = false; lastDrew = true;
    if (continuous && t && lastT && !document.hidden && adaptRes(t - lastT)) { resize(cv); dirty = true; } // gráficos adaptativos: ajusta la resolución según la potencia
  }
  lastT = t || 0;
  requestAnimationFrame(loop);
}

// ---------- v212: título, ranuras de guardado, estadísticas/logros y tutorial ----------
const fmtDate = (ts) => { try { return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
function metaNow() { return { ts: Date.now(), f: [G.factions[0], G.factions[1]], turn: G.s.turn, phase: G.s.phase, mode: G.mode, level: G.level, limit: G.limit }; }
const metaTxt = (m) => (m && m.f ? `${FNAME[m.f[0]]} vs ${FNAME[m.f[1]]} · ${m.phase === 'deploy' ? 'despliegue' : 'turno ' + m.turn} · ${m.limit || ''} pts · ${fmtDate(m.ts)}` : 'Partida guardada');
// v843s: varias partidas guardadas con nombre (hasta SLOT_MAX); compatible con las 3 ranuras antiguas. Se usa desde el menú de la partida (☰) y desde «Partidas» del menú principal
const SLOT_MAX = 30;
const slotList = () => { const a = store.get('tow_slots', null); return (Array.isArray(a) ? a : []).filter((x) => x && x.data).slice(0, SLOT_MAX); };
const slotSave = (list) => { store.set('tow_slots', list); return JSON.stringify(store.get('tow_slots', null) || []).length === JSON.stringify(list).length; };
const slotName = (d, i) => d.name || `Partida ${i + 1}`;
function slotsMenu(back = showMenu) {
  const act = !!(G && !G.demo && !G.tutorial && G.s.phase !== 'over' && G.mode !== 'code');
  const auto = store.get('tow_save', null), sl = slotList();
  const row = (i, d, title, auto0) => `<div class="slot"><div class="sm"><b>${esc(title)}</b><small>${d ? esc(metaTxt(d.meta)) : 'Vacía'}</small></div><div class="sb">${d ? `<button class="btn small primary" data-sl="load:${i}">Cargar</button>` : ''}${!auto0 && act ? `<button class="btn small" data-sl="save:${i}" title="Sustituye esta partida guardada por la actual">Sobrescribir</button>` : ''}${!auto0 && d ? `<button class="btn small" data-sl="ren:${i}" aria-label="Cambiar el nombre">✎</button><button class="btn small" data-sl="del:${i}" aria-label="Borrar">🗑</button>` : ''}</div></div>`;
  openModal(`<div class="card home"><header class="hero"><div class="emblem">${IC.army}</div><div><h1>Partidas guardadas</h1><p class="lead">${act ? 'Guarda la partida actual con un nombre o sobrescribe una existente' : 'Carga una partida guardada'}</p></div><button class="hclose" id="slX" aria-label="Cerrar">✕</button></header>
  <div class="hbody">${act ? `<div class="slot"><div class="sm"><b>Guardar partida nueva</b><input id="slName" type="text" maxlength="40" placeholder="Nombre (opcional)" aria-label="Nombre de la partida" style="width:100%;margin-top:4px"></div><div class="sb"><button class="btn small primary" data-sl="new:0">Guardar nueva</button></div></div>` : ''}${row(-1, auto && { meta: auto.meta || { f: auto.factions, phase: 'move', turn: '?', limit: auto.limit, ts: Date.now() } }, 'Autoguardado', true)}${sl.length ? sl.map((d, i) => row(i, d, slotName(d, i))).join('') : '<p class="muted">Aún no hay partidas guardadas con nombre.</p>'}${G && G.mode === 'code' && !G.demo ? '<p class="muted">Las partidas por código solo usan el autoguardado.</p>' : ''}</div>
  <footer class="mfoot"><button class="btn primary cta" id="slBack">Volver</button></footer></div>`);
  $('slX').onclick = $('slBack').onclick = () => back();
  document.querySelectorAll('[data-sl]').forEach((b) => (b.onclick = () => {
    const [op, i] = b.dataset.sl.split(':'); const n = +i, list = slotList();
    if (op === 'new') {
      if (list.length >= SLOT_MAX) { toast(`Máximo ${SLOT_MAX} partidas guardadas: borra alguna`, 'bad'); return; }
      const nm = ($('slName').value || '').trim() || `${FNAME[G.factions[0]]} vs ${FNAME[G.factions[1]]} · ${G.s.phase === 'deploy' ? 'despliegue' : 'turno ' + G.s.turn}`;
      list.push({ name: nm, meta: metaNow(), data: saveCore() }); if (!slotSave(list)) toast('No hay espacio de almacenamiento', 'bad'); else toast('Partida guardada: ' + nm); slotsMenu(back);
    } else if (op === 'save') {
      if (!window.confirm(`¿Sobrescribir «${slotName(list[n], n)}» con la partida actual?`)) return;
      list[n] = { name: list[n].name, meta: metaNow(), data: saveCore() }; if (!slotSave(list)) toast('No hay espacio de almacenamiento', 'bad'); else toast('Sobrescrita: ' + slotName(list[n], n)); slotsMenu(back);
    } else if (op === 'ren') { const nm = window.prompt('Nombre de la partida', slotName(list[n], n)); if (nm && nm.trim()) { list[n].name = nm.trim().slice(0, 40); slotSave(list); } slotsMenu(back); }
    else if (op === 'del') { if (!window.confirm(`¿Borrar «${slotName(list[n], n)}»?`)) return; list.splice(n, 1); slotSave(list); slotsMenu(back); }
    else { const sv = n < 0 ? store.get('tow_save', null) : list[n]?.data; if (!sv) return; if (G && !G.demo && G.s && G.s.phase !== 'over' && !window.confirm('Se perderá el progreso no guardado de la partida actual. ¿Cargar?')) return; closeModal(); if (!resume(sv)) { toast('No se pudo cargar la partida', 'bad'); showMenu(); } else store.set('tow_save', { ...sv, meta: metaNow() }); }
  }));
}
// v843s: MENÚ DE LA PARTIDA (☰ de la barra superior): guardar/cargar varias partidas, repetición de turnos de la IA, ajustes y volver al menú principal
function gameMenu() {
  if (!G || G.demo || G.tutorial) { showMenu(); return; }
  const over = G.s.phase === 'over', nh = (PB.hist || []).length + (PB.steps.length && !PB.hist?.some((h) => h.steps === PB.steps) ? 1 : 0);
  openModal(`<div class="card home gmenu"><header class="hero"><div class="emblem">${IC.menu}</div><div><h1>Menú de la partida</h1><p class="lead">${esc(FNAME[G.factions[0]])} vs ${esc(FNAME[G.factions[1]])} · ${G.s.phase === 'deploy' ? 'despliegue' : over ? 'fin de la batalla' : 'turno ' + G.s.turn}</p></div><button class="hclose" id="gmX" aria-label="Volver a la partida">✕</button></header>
  <div class="hbody"><button class="btn primary" id="gmSlots">💾 Guardar y cargar partidas</button>
  <button class="btn" id="gmReplay" ${nh ? '' : 'disabled'}>🎞 Repetición del turno del rival${nh ? '' : ' (aún no hay turnos de la IA)'}</button>
  <button class="btn" id="gmUndo"${undoWhy() ? ' disabled' : ''} title="${esc(undoWhy() || 'Deshace la última acción que no haya dado información ni consumido azar')}">↶ Deshacer${undoWhy() ? ' — ' + esc(undoWhy().replace(/^No se puede deshacer:? ?/, 'no disponible: ').replace(/^No hay nada/, 'no hay nada')) : ' la última acción'}</button>
  <div class="lbl">Ajustes</div><div class="mrow"><button class="btn" id="gmSnd">${sndEnabled() ? '🔊 Sonido: sí' : '🔇 Sonido: no'}</button><button class="btn" id="gmGfx" title="Recarga la partida guardada con otros gráficos">Gráficos: ${esc(gfxMode())}</button><button class="btn" id="gmMat">Tapete: ${esc(MAT_NAMES[glMat()])}</button><button class="btn" id="gmHow">Cómo se juega</button><button class="btn" id="gmStats">Estadísticas</button></div>
  ${!over && G.s.phase !== 'deploy' ? '<button class="btn danger" id="gmConcede" title="Core p.286: si te rindes, la victoria es de tu rival">Rendirse (la victoria es del rival)</button>' : ''}
  <div class="lbl">Salir</div><button class="btn" id="gmHome">⌂ Volver al menú principal</button></div>
  <footer class="mfoot"><button class="btn primary cta" id="gmBack">Volver a la partida</button></footer></div>`);
  $('gmX').onclick = $('gmBack').onclick = closeModal;
  $('gmSlots').onclick = () => slotsMenu(gameMenu);
  $('gmReplay').onclick = () => replayMenu();
  $('gmUndo').onclick = () => { closeModal(); undoLast(); };
  $('gmSnd').onclick = () => { sndToggle(); sndPlay('turn'); gameMenu(); $('zSnd').innerHTML = sndEnabled() ? IC.snd : IC.mute; };
  $('gmGfx').onclick = () => { save(); try { const md = gfxMode(); localStorage.removeItem('tow_nohd'); localStorage.setItem('tow_gfx', md === 'Alta' ? 'normal' : 'alta'); } catch { /* */ } location.reload(); };
  $('gmMat').onclick = () => { const ks = Object.keys(MAT_NAMES), k = ks[(ks.indexOf(glMat()) + 1) % ks.length]; glSetMat(k); $('gmMat').textContent = 'Tapete: ' + MAT_NAMES[k]; };
  $('gmHow').onclick = () => { closeModal(); showHow(); };
  $('gmStats').onclick = () => statsMenu();
  if ($('gmConcede')) $('gmConcede').onclick = () => { if (!window.confirm('¿Seguro que quieres rendirte? La victoria será de tu rival.')) return; closeModal(); dispatch({ t: 'concede', p: viewer() }); };
  $('gmHome').onclick = () => {
    openModal(`<div class="card ncard"><p class="nmsg"><b>Volver al menú principal</b><br>La partida en curso se queda en el autoguardado, pero puedes guardarla ahora con un nombre antes de salir.</p><div class="nrow" style="flex-wrap:wrap;gap:6px"><button class="btn primary" id="hmSave">Guardar y salir</button><button class="btn" id="hmOut">Salir sin guardar</button><button class="btn" id="hmCancel">Cancelar</button></div></div>`);
    $('hmCancel').onclick = gameMenu;
    $('hmOut').onclick = () => { closeModal(); showMenu(); };
    $('hmSave').onclick = () => { const list = slotList(); if (list.length >= SLOT_MAX) { toast(`Máximo ${SLOT_MAX} partidas guardadas: borra alguna`, 'bad'); return; } const nm = `${FNAME[G.factions[0]]} vs ${FNAME[G.factions[1]]} · ${G.s.phase === 'deploy' ? 'despliegue' : 'turno ' + G.s.turn}`; list.push({ name: nm, meta: metaNow(), data: saveCore() }); if (!slotSave(list)) { toast('No hay espacio de almacenamiento: no se ha guardado', 'bad'); return; } toast('Partida guardada: ' + nm); closeModal(); showMenu(); };
  };
}
// v843s: repetición de los turnos de la IA ya jugados (el visor de v843q): se elige el turno y la velocidad (½×, 1×, 2×, 3×)
function replayMenu() {
  const hist = [...(PB.hist || [])]; if (PB.steps.length && !hist.some((h) => h.steps === PB.steps)) hist.push({ turn: G.s.turn, steps: PB.steps });
  const sp = [[0.5, '½×'], [1, '1×'], [2, '2×'], [3, '3×']];
  openModal(`<div class="card home"><header class="hero"><div class="emblem">${IC.eye}</div><div><h1>Repetición del rival</h1><p class="lead">Elige un turno de la IA y la velocidad</p></div><button class="hclose" id="rpX" aria-label="Cerrar">✕</button></header>
  <div class="hbody"><div class="lbl">Velocidad</div><div class="seg" id="rpSpeed">${sp.map(([v, t]) => `<button data-v="${v}" class="${PB.speed === v ? 'on' : ''}">${t}</button>`).join('')}</div><div class="lbl">Turnos de la IA jugados</div>
  ${hist.length ? hist.slice().reverse().map((h, k) => `<div class="slot"><div class="sm"><b>Turno ${h.turn} de la IA</b><small>${h.steps.length} pasos · ${esc((h.steps[0]?.label || '').slice(0, 60))}</small></div><div class="sb"><button class="btn small primary" data-rp="${hist.length - 1 - k}">Ver</button></div></div>`).join('') : '<p class="muted">Aún no hay turnos de la IA.</p>'}</div>
  <footer class="mfoot"><button class="btn primary cta" id="rpBack">Volver</button></footer></div>`);
  $('rpX').onclick = $('rpBack').onclick = gameMenu;
  document.querySelectorAll('#rpSpeed button').forEach((b) => (b.onclick = () => { PB.speed = +b.dataset.v; pbSave(); replayMenu(); }));
  document.querySelectorAll('[data-rp]').forEach((b) => (b.onclick = () => { const h = hist[+b.dataset.rp]; if (!h) return; closeModal(); pbStop(); PB.steps = h.steps; PB.open = true; PB.listOpen = false; pbShowP(0, false); renderPbk(); pbPlayFrom(0); }));
}
// ---- estadísticas y logros ----
const ST0 = () => ({ games: 0, wins: 0, losses: 0, draws: 0, streak: 0, best: 0, byFac: {}, hist: [], ach: {}, tutorial: false, vp: 0 });
const getStats = () => ({ ...ST0(), ...(store.get('tow_stats', null) || {}) });
const ACH = [
  ['first', '⚔', 'Bautismo de fuego', 'Termina tu primera batalla', (st) => st.games >= 1],
  ['win1', '🏆', 'Primera victoria', 'Gana una batalla', (st) => st.wins >= 1],
  ['streak3', '🔥', 'Racha de tres', 'Gana tres batallas seguidas', (st) => st.best >= 3],
  ['games10', '📜', 'Veterano', 'Juega 10 batallas', (st) => st.games >= 10],
  ['games25', '🎖', 'Mariscal de campo', 'Juega 25 batallas', (st) => st.games >= 25],
  ['hard', '🧠', 'Domador de la IA', 'Vence a la IA en dificultad Difícil', (st, g) => g && g.res === 'W' && g.level === 'hard'],
  ['crush', '💥', 'Victoria aplastante', 'Consigue una victoria aplastante', (st, g) => g && g.res === 'W' && g.result === 'CV'],
  ['break', '⚡', 'Punto de ruptura', 'Gana rompiendo al rival', (st, g) => g && g.res === 'W' && g.why === 'break'],
  ['annih', '☠', 'Aniquilación', 'Gana sin que quede nadie en pie', (st, g) => g && g.res === 'W' && g.why !== 'break' && g.why !== 'turns' && g.why !== 'random'],
  ['fast', '⏱', 'Guerra relámpago', 'Gana en 4 rondas o menos', (st, g) => g && g.res === 'W' && g.rounds <= 4],
  ['fac5', '🛡', 'Cinco banderas', 'Gana con 5 facciones distintas', (st) => Object.values(st.byFac).filter((x) => x.w > 0).length >= 5],
  ['fac10', '👑', 'Señor de los ejércitos', 'Gana con 10 facciones distintas', (st) => Object.values(st.byFac).filter((x) => x.w > 0).length >= 10],
  ['tut', '🎓', 'Recluta instruido', 'Completa el tutorial', (st) => st.tutorial],
];
function unlockCheck(st, g) {
  const out = [];
  for (const [id, , , , f] of ACH) if (!st.ach[id] && f(st, g)) { st.ach[id] = Date.now(); out.push(id); }
  return out;
}
function recordGame() {
  const s = G.s, me = G.mode === 'ai' ? 0 : G.mode === 'code' ? G.myOwner : null;
  if (me === null || G.tutorial || G.demo || G.statDone) return [];
  G.statDone = true;
  const st = getStats(), res = s.winner === 'draw' ? 'D' : s.winner === me ? 'W' : 'L';
  const g = { ts: Date.now(), side: G.factions[me], opp: G.factions[1 - me], res, vp: [s.vp[me], s.vp[1 - me]], rounds: Math.max(1, s.turn - (s.endWhy === 'turns' ? 1 : 0)), level: G.mode === 'ai' ? G.level : 'human', limit: G.limit, why: s.endWhy, result: s.result };
  st.games++; if (res === 'W') { st.wins++; st.streak++; st.best = Math.max(st.best, st.streak); } else { st.streak = 0; if (res === 'L') st.losses++; else st.draws++; }
  const bf = st.byFac[g.side] || (st.byFac[g.side] = { g: 0, w: 0 }); bf.g++; if (res === 'W') bf.w++;
  st.vp += g.vp[0]; st.hist = [g, ...st.hist].slice(0, 30);
  const un = unlockCheck(st, g); store.set('tow_stats', st); return un;
}
const achNote = (ids) => (ids.length ? `<div class="note">🏅 ${ids.length > 1 ? 'Logros desbloqueados' : 'Logro desbloqueado'}: ${ids.map((i) => '<b>' + ACH.find((a) => a[0] === i)[2] + '</b>').join(', ')}</div>` : '');
function statsMenu() {
  const st = getStats(), pct = st.games ? Math.round(100 * st.wins / st.games) : 0;
  const fac = Object.entries(st.byFac).sort((a, b) => b[1].g - a[1].g).map(([f, v]) => `<div class="hrow"><span style="color:${FACTIONS[f]?.color || 'inherit'}">${esc(FNAME[f] || f)}</span><span>${v.w}/${v.g} victorias</span></div>`).join('');
  const hist = st.hist.slice(0, 10).map((g) => `<div class="hrow"><span>${esc(FNAME[g.side] || g.side)} vs ${esc(FNAME[g.opp] || g.opp)}</span><span class="${g.res === 'W' ? 'w' : g.res === 'L' ? 'l' : ''}">${g.res === 'W' ? 'Victoria' : g.res === 'L' ? 'Derrota' : 'Empate'} ${g.vp[0]}–${g.vp[1]}</span></div>`).join('');
  const n = Object.keys(st.ach).length;
  openModal(`<div class="card home"><header class="hero"><div class="emblem">${IC.combat}</div><div><h1>Estadísticas y logros</h1><p class="lead">${n} de ${ACH.length} logros</p></div><button class="hclose" id="stX" aria-label="Cerrar">✕</button></header>
  <div class="hbody"><div class="stgrid"><span><b>${st.games}</b><small>partidas</small></span><span><b>${st.wins}</b><small>victorias</small></span><span><b>${pct}%</b><small>acierto</small></span><span><b>${st.best}</b><small>mejor racha</small></span></div>
  <div class="lbl">Logros</div><div class="achg">${ACH.map(([id, ic, nm, ds]) => `<div class="ach ${st.ach[id] ? 'on' : ''}"><i>${ic}</i><div><b>${nm}</b><small>${ds}</small></div></div>`).join('')}</div>
  ${fac ? `<div class="lbl">Por facción</div>${fac}` : ''}${hist ? `<div class="lbl">Últimas batallas</div>${hist}` : '<p class="muted" style="margin-top:12px">Aún no has terminado ninguna batalla contra la IA o por código.</p>'}</div>
  <footer class="mfoot"><button class="btn primary cta" id="stBack">Volver</button><div class="mrow"><button class="btn" id="stReset">Borrar estadísticas</button></div></footer></div>`);
  $('stX').onclick = $('stBack').onclick = showMenu;
  $('stReset').onclick = () => { if ($('stReset').dataset.c) { store.del('tow_stats'); statsMenu(); } else { $('stReset').dataset.c = 1; $('stReset').textContent = 'Pulsa otra vez para confirmar'; } };
}
// ---- pantalla de título ----
function titleProg(p, label) { const t = $('title'); if (!t) return; const i = t.querySelector('.tbar i'); if (i) i.style.width = Math.round(p * 100) + '%'; const l = t.querySelector('.tlab'); if (l && label) l.textContent = label; }
function buildTitle() {
  const t = $('title'); t.hidden = false; t.classList.remove('out');
  t.innerHTML = `<div class="tlogo">⚔</div><div><h1>El Viejo Mundo</h1></div><div class="tsub">Batallas de regimientos por turnos</div><div class="tload"><div class="tbar"><i></i></div><div class="tlab">Preparando la mesa…</div></div>`;
}
function titleReady() {
  const t = $('title'); const auto = store.get('tow_save', null);
  const go = (fn) => () => { t.classList.add('out'); setTimeout(() => { t.hidden = true; }, 350); fn(); };
  t.innerHTML = `<div class="tlogo">⚔</div><div><h1>El Viejo Mundo</h1></div><div class="tsub">Batallas de regimientos por turnos</div>
  <div class="tmenu">${auto ? `<button class="btn primary" id="tCont">Continuar<small>${esc(metaTxt(auto.meta || { f: auto.factions, phase: 'move', turn: '', limit: auto.limit, ts: Date.now() }))}</small></button>` : ''}
  <button class="btn ${auto ? '' : 'primary'}" id="tNew">Nueva batalla</button><button class="btn" id="tTut">Tutorial guiado<small>Tu primera partida, paso a paso</small></button><button class="btn" id="tSlots">Partidas guardadas</button><button class="btn" id="tStats">Estadísticas y logros</button><button class="btn" id="tHow">Cómo se juega</button></div><div class="tver">v${(window.__TOW_VER__ || '212')}</div>`;
  if ($('tCont')) $('tCont').onclick = go(() => { if (!resume()) showMenu(); });
  $('tNew').onclick = go(showMenu); $('tTut').onclick = go(startTutorial); $('tSlots').onclick = go(() => slotsMenu(showMenu)); $('tStats').onclick = go(statsMenu); $('tHow').onclick = go(showHow);
}
// ---- tutorial guiado ----
const TUT_STEPS = [
  { t: 'Despliegue: tus regimientos azules ya están en su mitad. Puedes arrastrarlos o dejarlos. Pulsa «¡Listo para la batalla!».', hl: '#actions .btn.primary', done: (s) => s.phase !== 'deploy' },
  { t: 'Cada turno tiene cuatro fases: Estrategia, Movimiento, Disparo y Combate (arriba ves la actual). Pulsa «Pasar a movimiento».', hl: '#actions .btn.primary', done: (s) => s.phase === 'move' || s.phase === 'shoot' || s.turn > 1 },
  { t: 'Selecciona un regimiento tuyo: toca su recuadro en el mapa o su nombre en la lista de abajo.', hl: '#panelBody', done: () => !!(UI.sel && G.s.units.find((u) => u.id === UI.sel && u.owner === 0)), skipIf: (s) => s.phase !== 'move' },
  { t: 'Pulsa «Mover» en la ficha de la unidad (menú inferior), toca el mapa para elegir destino (círculo blanco: mover; dorado: marchar) y confirma con ✓.', hl: '[data-act="move"]', done: (s, n0) => G.actions.slice(n0).some((a) => a.t === 'move' || a.t === 'charge'), skipIf: (s) => s.phase !== 'move' },
  { t: 'Si te equivocas, ↶ (a la derecha) deshace el último movimiento. Cuando acabes de mover, pulsa «Pasar a disparo». (Las cargas contra el enemigo se hacen en esta fase con el botón «Cargar».)', hl: '#actions .btn.primary', done: (s) => s.phase === 'shoot' || s.turn > 1 || s.active === 1 },
  { t: 'En Disparo, los regimientos con arcos o máquinas eligen objetivo con «Disparar» y verás los dados. Si no hay nadie a tiro, pulsa «Resolver combates y terminar turno».', hl: '#actions .btn.primary', done: (s) => s.active === 1 || s.turn > 1 },
  { t: 'Ahora juega el rival. Cuando termine, sus movimientos quedan sombreados en ámbar (👁 los oculta) y el Registro cuenta lo ocurrido.', hl: '#tabs button[data-tab="log"]', done: (s) => s.active === 0 && s.turn >= 2 },
  { t: '¡Ya conoces el ciclo! Estrategia → Movimiento → Disparo → Combate. Sigue jugando esta batalla o vuelve al menú cuando quieras.', manual: 'Terminar tutorial', done: () => false },
];
function startTutorial() {
  const bak = { ...setup };
  Object.assign(setup, { mode: 'ai', level: 'easy', side: 'empire', opp: 'orcs', limit: 500, scn: 'glory', tmode: 'classic', terrain: null, sec: 'none', secret: 'none', gend: 'auto', comp: 'open', lists: {} });
  const cp = (f) => PRESETS[f][500].map((e) => ({ ...e, items: e.items ? [...e.items] : undefined }));
  closeModal();
  newGame({ mode: 'ai', level: 'easy', side: 'empire', opp: 'orcs', limit: 500, armiesBy: [cp('empire'), cp('orcs')] });
  Object.assign(setup, bak);
  G.tutorial = true; UI.tut = { i: 0, n0: 0 }; tutTick();
}
function tutEnd(done) {
  UI.tut = null; if (G) G.tutorial = false; const c = $('coach'); if (c) c.hidden = true;
  document.querySelectorAll('.tuthl').forEach((e) => e.classList.remove('tuthl'));
  if (done) { const st = getStats(); st.tutorial = true; const un = unlockCheck(st, null); store.set('tow_stats', st); toast(un.length ? '🏅 Logro: Recluta instruido' : 'Tutorial completado'); }
  if (G) save();
}
function tutTick() {
  if (!G || !G.tutorial || !UI.tut) { const c = $('coach'); if (c) c.hidden = true; return; }
  const s = G.s, T = UI.tut;
  while (T.i < TUT_STEPS.length - 1 && (TUT_STEPS[T.i].done(s, T.n0) || (TUT_STEPS[T.i].skipIf && TUT_STEPS[T.i].skipIf(s)))) { T.i++; T.n0 = G.actions.length; }
  const st = TUT_STEPS[T.i], c = $('coach');
  c.hidden = false;
  c.innerHTML = `<div class="cs"><span>Tutorial · paso ${T.i + 1} de ${TUT_STEPS.length}</span><button id="cMin" aria-label="Plegar">${UI.coachMin ? '▾' : '▴'}</button></div><p>${esc(st.t)}</p><div class="cb"><button class="btn" id="cSkip">Salir del tutorial</button>${st.manual ? `<button class="btn primary" id="cNext">${st.manual}</button>` : ''}</div>`;
  c.classList.toggle('min', !!UI.coachMin); $('cMin').onclick = () => { UI.coachMin = !UI.coachMin; tutTick(); };
  $('cSkip').onclick = () => tutEnd(false);
  if ($('cNext')) $('cNext').onclick = () => tutEnd(true);
  document.querySelectorAll('.tuthl').forEach((e) => e.classList.remove('tuthl'));
  if (st.hl) { const el = document.querySelector(st.hl); if (el && !el.disabled) el.classList.add('tuthl'); }
}

// Márgenes seguros (muesca, barra de inicio): si la página ya viene desplazada por su contenedor (p. ej. el visor de artefactos),
// no se vuelven a aplicar; así no se pierde pantalla con un margen duplicado
function safeArea() {
  const app = $('app'), root = document.documentElement;
  root.style.setProperty('--sat', '0px'); root.style.setProperty('--sab', '0px');
  const r = app.getBoundingClientRect(), vh = window.innerHeight || root.clientHeight;
  let framed = false; try { framed = window.self !== window.top; } catch { framed = true; }
  root.style.setProperty('--sat', framed || r.top > 8 ? '0px' : 'env(safe-area-inset-top, 0px)');
  root.style.setProperty('--sab', framed || vh - r.bottom > 8 ? '0px' : 'env(safe-area-inset-bottom, 0px)');
}
async function init() {
  buildTitle(); titleProg(0.1, 'Preparando la mesa…');
  safeArea();
  bindTools();
  resize(cv); fit();
  window.addEventListener('resize', () => { safeArea(); if (UI.sheetApply) UI.sheetApply(); resize(cv); if (G && !UI.userRot) orient(); dirty = true; });
  new ResizeObserver(() => { resize(cv); if (G && !UI.userRot && !UI.userZoom) orient(); dirty = true; }).observe(cv.parentElement);
  titleProg(0.3, 'Despertando a la IA…');
  // pesos de la IA: entrenados + aprendizaje local
  try {
    let base = window.__TOW_WEIGHTS__ || null;
    if (!base) { const r = await fetch('weights.json'); if (r.ok) base = await r.json(); }
    if (base) { while (base.weights.length < DEFAULT_WEIGHTS.length) base.weights.push(DEFAULT_WEIGHTS[base.weights.length]); AI.base = base.weights; AI.weights = base.weights.slice(); AI.gens = base.generations || 0; }
  } catch { /* se usan los pesos por defecto */ }
  const loc = store.get('tow_ai', null);
  if (loc && Array.isArray(loc.weights) && loc.weights.length <= AI.base.length && loc.weights.length >= AI.base.length - 2) { AI.weights = loc.weights.concat(AI.base.slice(loc.weights.length)); AI.games = loc.games || 0; } // v830: pesos guardados con menos rasgos: se completan con los base
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  titleProg(0.75, 'Levantando el campo de batalla…');
  // partida demo vacía detrás del menú
  const s = createGame({ seed: 5, armies: [PRESETS.empire[1000], PRESETS.orcs[1000]], factions: ['empire', 'orcs'], limit: 1000 }); syncTable(s);
  G = { s, mode: 'ai', level: 'medium', limit: 1000, seed: 5, factions: ['empire', 'orcs'], armies: [], myOwner: 0, actions: [], synced: 0, log: [], cur: [], deployPlayer: 0, aiBusy: false, curtain: true, waiting: false, record: [], recordH: [], demo: true };
  orient(); renderAll(); G.curtain = false;
  loop();
  titleProg(1, 'Listo'); await sleep(450); titleReady();
  window.__TOW = { get G() { return G; }, undoLast, undoWhy, dispatchDeploy, newGame, UI, AI, dispatch, setup, handleEvents, onGameOver, selectUnit, showSpellHand, spellGenFlow, pickAck };
}
init();
