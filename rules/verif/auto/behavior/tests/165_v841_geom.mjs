// v841 — Dos aproximaciones eliminadas: (1) arcos de la Lanza por el segundo rango y el último (fof.txt «Lance Facings»); (2) auras medidas desde el modelo portador (core.txt «Command range»…)
import { T, N, R, DATA, GEOM, ok, eq, cur, put, game, U, dice, diceAll, dlog, join, by, all } from '../lib3.mjs';
const { UNITS, ITEMS } = DATA;
const FF = 'rules/fof.txt', CR = 'rules/core.txt';
const PI = Math.PI;

// ---------- (1) Lanza: arcos ----------
// Referencia escrita desde el texto (no desde el motor): «The front, flank and rear arcs of a unit in Lance formation are determined by the models in the second rank and the last rank»
// + core.txt:3069 «A model's front, flank and rear arcs extend out from the corners of its base at 45° angles, forming four 90° quadrants».
// Rangos de 1, 2, 3… modelos; el arco delantero parte de las esquinas delanteras exteriores del 2.º rango; el trasero, de las traseras exteriores del último rango.
const ranksOf = (n) => { const r = []; let left = n, k = 1; while (left > 0) { r.push(Math.min(k, left)); left -= k; k++; } return r; };
function arcsRef(n, bw, bd, f, l) { // f: adelante desde el centro del bloque; l: lateral
  const r = ranksOf(n), D = r.length * bd; l = Math.abs(l);
  const f2 = D / 2 - bd, h2 = r[1] * bw / 2, fL = -D / 2, hL = r[r.length - 1] * bw / 2;
  if (f >= f2 && f - f2 >= l - h2) return 'front';
  if (f <= fL && fL - f >= l - hL) return 'rear';
  return 'flank';
}
// el bloque rectangular de antes (rango más ancho × nº de rangos): arcos desde las cuatro esquinas del rectángulo
function arcsRect(n, bw, bd, f, l) { const r = ranksOf(n), D = r.length * bd, W = Math.max(...r.map((x, i) => (i === r.length - 1 ? Math.max(x, r.length - 1) : x))) * bw; l = Math.abs(l); if (f > D / 2 && f - D / 2 >= l - W / 2) return 'front'; if (f < -D / 2 && -f - D / 2 >= l - W / 2) return 'rear'; return 'flank'; }
const lanceUnit = (n) => { const s = game([{ type: 'br_realm', models: n }], [{ type: 'orc_bigboss', models: 1 }], { f: ['bret', 'orcs'], phase: 'move', active: 1 }); const a = put(U(s, 'br_realm', 0), 36, 24, -PI / 2); a.lance = true; a.lanceable = true; a.models = n; cur(s); return { s, a }; };
// punto en coordenadas locales (f adelante, l lateral) → mundo (la Lanza mira a −y: adelante = (0,−1), lateral = (1,0))
const W = (a, f, l) => { const c = Math.cos(a.face), sn = Math.sin(a.face); return { x: a.x + c * f - sn * l, y: a.y + sn * f + c * l }; };

T('v841-lance-arcs-geom', FF + ':4453-4455 (Lance Facings) + ' + CR + ':3069-3071', 'Los arcos de una Lanza salen de las esquinas del segundo rango (frente) y del último (retaguardia): sideOf coincide en toda la rejilla con la referencia del texto', () => {
  let discr = 0, cells = 0;
  for (const n of [3, 4, 5, 6, 7, 9, 10, 15]) {
    const { a } = lanceUnit(n); const bw = a.baseW / 25.4, bd = a.baseD / 25.4, r = ranksOf(n), D = r.length * bd, Wd = Math.max(...r) * bw;
    eq(GEOM.dims(a).ranks, r.length, `n=${n}: nº de rangos`);
    for (let f = -D / 2 - 5; f <= D / 2 + 5; f += 0.45) for (let l = -Wd / 2 - 5; l <= Wd / 2 + 5; l += 0.45) {
      if (Math.abs(f) <= D / 2 && Math.abs(l) <= Wd / 2) continue; // dentro del bloque que abarca la Lanza: contacto con sus modelos, no una cuestión de arcos
      { const r1 = ranksOf(n), D1 = r1.length * bd, f2 = D1 / 2 - bd, m1 = (f - f2) - (Math.abs(l) - r1[1] * bw / 2), m2 = (-D1 / 2 - f) - (Math.abs(l) - r1[r1.length - 1] * bw / 2); if (Math.abs(m1) < 1e-6 || Math.abs(m2) < 1e-6) continue; } // puntos justo sobre la línea de 45°: indiferentes
      const p = W(a, f, l), want = arcsRef(n, bw, bd, f, l), got = GEOM.sideOf(a, p);
      cells++; eq(got, want, `n=${n} punto (f=${f.toFixed(2)}, l=${l.toFixed(2)})`);
      if (arcsRect(n, bw, bd, f, l) !== want) discr++;
    }
  }
  ok(cells > 2000, 'rejilla suficiente: ' + cells);
  ok(discr > 200, 'la prueba discrimina: el bloque rectangular antiguo daba otro arco en ' + discr + ' puntos');
});

T('v841-lance-arcs-front-arc', FF + ':4453-4455', 'inFrontArc (carga/visión) de una Lanza usa las esquinas del segundo rango: un enemigo a la altura del frente pero lateral al segundo rango está dentro del arco frontal y uno a su costado no', () => {
  const { s, a } = lanceUnit(6); const bw = a.baseW / 25.4, bd = a.baseD / 25.4, D = 3 * bd;
  const foe = (f, l) => { const e = put(U(s, 'orc_bigboss', 1), 0, 0, PI / 2); const p = W(a, f, l); put(e, p.x, p.y, PI / 2); return e; };
  const f2 = D / 2 - bd, h2 = bw; // esquinas del segundo rango
  // referencia: algún punto del enemigo (esquinas o centro) en el cuadrante de 90° desde (f2, ±h2)
  const ref = (e) => [...GEOM.corners(e), { x: e.x, y: e.y }].some((p) => { const dx = p.x - a.x, dy = p.y - a.y, f = dx * Math.cos(a.face) + dy * Math.sin(a.face) - f2, l = Math.abs(-dx * Math.sin(a.face) + dy * Math.cos(a.face)) - h2; return f >= -0.05 && l <= f + 0.05; });
  let n1 = 0, n0 = 0, old = 0;
  for (let f = -2; f <= D / 2 + 6; f += 0.5) for (let l = 2; l <= 9; l += 0.5) { const e = foe(f, l); cur(s); const got = R.inFrontArc(a, e), want = ref(e); eq(got, want, `enemigo en (f=${f}, l=${l})`); if (want) n1++; else n0++; const dx = e.x - a.x, dy = e.y - a.y; const fo = dx * Math.cos(a.face) + dy * Math.sin(a.face) - D / 2, lo = Math.abs(-dx * Math.sin(a.face) + dy * Math.cos(a.face)) - 1.5 * bw; if ((fo >= -0.05 && lo <= fo + 0.05) !== want) old++; }
  ok(n1 > 20 && n0 > 20, 'hay casos dentro y fuera del arco: ' + n1 + '/' + n0); ok(old > 5, 'el arco rectangular antiguo discrepaba en ' + old + ' casos');
});

T('v841-lance-arcs-charge', FF + ':4453-4455 + ' + CR + ':3932-3952', 'Una unidad que carga a una Lanza desde la zona que el texto reparte entre arcos (esquinas del segundo rango) declara la carga contra el arco que dice el texto', () => {
  const pts = []; const bw0 = lanceUnit(6).a.baseW / 25.4, bd0 = lanceUnit(6).a.baseD / 25.4;
  for (const [f, l] of [[3 * bd0 / 2 + 0.6, 2.2 * bw0], [3 * bd0 / 2 + 0.6, -2.3 * bw0], [bd0, 3.2 * bw0], [0, 4.6 * bw0], [-3 * bd0 / 2 - 2.5, 2.6 * bw0], [-3 * bd0 / 2 - 3.5, 0], [3 * bd0 / 2 + 3, 0], [-bd0, -4 * bw0]]) pts.push([f, l]);
  let diff = 0;
  for (const [f, l] of pts) {
    const { s, a } = lanceUnit(6); const bw = a.baseW / 25.4, bd = a.baseD / 25.4, e = U(s, 'orc_bigboss', 1); const p = W(a, f, l);
    put(e, p.x, p.y, Math.atan2(a.y - p.y, a.x - p.x)); cur(s); const want = arcsRef(6, bw, bd, f, l); diceAll(6);
    const r = R.apply(s, { t: 'charge', id: e.id, target: a.id }); ok(r.ok, `la carga se declara desde (f=${f.toFixed(1)}, l=${l.toFixed(1)}): ` + JSON.stringify(r).slice(0, 120));
    eq(e.chargeSide, want, `lado de la carga desde (f=${f.toFixed(1)}, l=${l.toFixed(1)})`); if (arcsRect(6, bw, bd, f, l) !== want) diff++;
  }
  ok(diff >= 1, 'al menos un punto en que el bloque antiguo daba otro arco: ' + diff);
});

T('v841-lance-models', FF + ':4444-4447 (Forming The Lance)', 'Los modelos de una Lanza están en rangos de 1, 2, 3… (modelPts): un solo modelo en el frente, y el contacto de la carga lo hace solo ese modelo', () => {
  for (const n of [3, 6, 10]) {
    const { a } = lanceUnit(n); const pts = R.modelPts(a); eq(pts.length, n, `n=${n}: un punto por modelo`);
    const rows = {}; for (const p of pts) { const f = Math.round(((p.x - a.x) * Math.cos(a.face) + (p.y - a.y) * Math.sin(a.face)) * 100); (rows[f] ||= []).push(p); }
    eq(Object.keys(rows).map(Number).sort((x, y) => y - x).map((k) => rows[k].length), ranksOf(n), `n=${n}: modelos por rango`);
    const fr = Math.max(...Object.keys(rows).map(Number)); eq(rows[fr].length, 1, 'un modelo en el rango delantero');
  }
});

// ---------- (2) Auras medidas desde el modelo ----------
function bsbScene(slot, gap = 8, n = 20) {
  const s = game([{ type: 'state_troops', models: n }, { type: 'empire_captain', models: 1, std: true }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' });
  const [h, o] = s.units.filter((u) => u.owner === 0 && u.type === 'state_troops'), c = U(s, 'empire_captain');
  h.files = 10; o.files = 10; put(h, 36, 30, -PI / 2); join(s, c, h); c.std = true; h.charFile = { [c.id]: slot };
  const dh = GEOM.dims(h), dop = GEOM.dims(o); put(o, 36 + dh.w / 2 + gap + dop.w / 2, 30, -PI / 2); cur(s); R.syncJoined(s);
  return { s, h, o, c };
}
T('v841-bsb-model-hold-ground', CR + ':6764-6770 («within the Battle Standard Bearer Command range») + ' + CR + ':6961-6963 («measure from the model itself»)', 'Mantened la posición: el alcance de mando del PEB (12") se mide desde su propio modelo: con el PEB en el extremo lejano de su unidad la unidad vecina a 8" del borde NO está en alcance; con el PEB en el extremo cercano sí', () => {
  const far = bsbScene(0), near = bsbScene(9);
  ok(GEOM.unitDist(far.h, far.o) <= 12 && GEOM.unitDist(near.h, near.o) <= 12, 'montaje: de unidad a unidad la vecina estaría a ≤ 12" en ambos casos (' + GEOM.unitDist(far.h, far.o).toFixed(2) + '")');
  ok(R.commandRange(far.c) === 12, 'el PEB tiene alcance de mando 12"');
  const dFar = R.cmdDist(far.h, far.o, far.c), dNear = R.cmdDist(near.h, near.o, near.c);
  ok(dFar > 12 && dFar < 20, 'distancia desde el modelo del PEB lejano: ' + dFar.toFixed(2)); ok(Math.abs(dNear - 8) < 0.01, 'PEB en el extremo cercano: 8" (' + dNear.toFixed(2) + ')');
  eq(R.bsbNear(far.s, far.o), false, 'PEB lejano: fuera de alcance'); eq(R.bsbNear(near.s, near.o), true, 'PEB cercano: en alcance');
  eq(R.bsbNear(far.s, far.h), true, 'la propia unidad del PEB siempre está en su alcance');
  // efecto: un Pánico fallido se repite solo con el PEB en alcance (tirada de 2D6 = 6+6 fallan; el segundo intento aprueba con 1+1)
  const panicDice = (sc) => { const { s, o } = sc; cur(s); dice(6, 6, 1, 1); const ok1 = R.passPanic(s, o, null); return { ok1, used: dlog().length }; };
  const pf = panicDice(bsbScene(0)), pn = panicDice(bsbScene(9));
  eq(pf.ok1, false, 'PEB fuera de alcance: no repite el Pánico fallido'); eq(pn.ok1, true, 'PEB en alcance: repite el Pánico y lo supera'); ok(pn.used > pf.used, 'la repetición tira más dados: ' + pf.used + ' → ' + pn.used);
});

T('v841-banner-aura-model', 'rules/new/cathay_aj.txt:2708-2711 (Estandarte de Wei-jin: «within 12" of the model carrying the Standard»)', 'El Estandarte de Wei-jin resta 1 al Ld de Miedo/Pánico/Terror a los enemigos a 12" del MODELO que lo porta (el portaestandarte), no de la unidad', () => {
  const scene = (stdFile) => {
    const s = game([{ type: 'ct_jade', models: 20, std: true, banner: 'ct_weijin' }], [{ type: 'orc_boyz', models: 10 }], { f: ['ct', 'orcs'], phase: 'strategy' });
    const w = U(s, 'ct_jade', 0), e = U(s, 'orc_boyz', 1); w.files = 10; put(w, 36, 30, -PI / 2); w.stdFile = stdFile; const dw = GEOM.dims(w), de = GEOM.dims(e); e.files = 10;
    put(e, 36 + dw.w / 2 + 9 + de.w / 2, 30, PI / 2); cur(s); R.syncJoined(s); return { s, w, e };
  };
  const base = (() => { const { s, e } = scene(0); R.D(e); return R.ldOf(s, e); })(); // referencia: Ld del enemigo sin ningún efecto (el portaestandarte lejos)
  const far = scene(0), near = scene(9);
  ok(GEOM.unitDist(far.w, far.e) <= 12 && GEOM.unitDist(near.w, near.e) <= 12, 'montaje: a ≤ 12" de unidad a unidad');
  const a = R.psyLd(far.s, far.e), b = R.psyLd(near.s, near.e);
  eq(a, base, 'portaestandarte en el extremo lejano (> 12" del enemigo): sin −1'); eq(b, base - 1, 'portaestandarte en el extremo cercano: −1 Ld de psicología');
});

T('v841-char-item-aura-model', 'rules/new/aj_orcs2.txt:1496-1498 (Percha de Trofeos: «enemy units within 6" of the bearer»)', 'El Ld de los enemigos a 6" del portador (personaje unido a una unidad) se mide desde su modelo', () => {
  const key2 = 'aj_trophy'; ok(ITEMS[key2]?.ldAura, 'el objeto existe (Percha de Trofeos)');
  const scene = (slot) => {
    const s = game([{ type: 'orc_boyz', models: 20 }, { type: 'orc_bigboss', models: 1, items: [key2] }], [{ type: 'state_troops', models: 10 }], { f: ['orcs', 'empire'], phase: 'strategy' });
    const h = U(s, 'orc_boyz', 0), c = U(s, 'orc_bigboss', 0), e = U(s, 'state_troops', 1); h.files = 10; e.files = 10; put(h, 36, 30, -PI / 2); join(s, c, h); h.charFile = { [c.id]: slot };
    const dh = GEOM.dims(h), de = GEOM.dims(e); put(e, 36 + dh.w / 2 + 4 + de.w / 2, 30, PI / 2); cur(s); R.syncJoined(s); return { s, h, c, e };
  };
  const far = scene(0), near = scene(9);
  ok(GEOM.unitDist(far.h, far.e) <= 6 && GEOM.unitDist(near.h, near.e) <= 6, 'montaje: a ≤ 6" de unidad a unidad (' + GEOM.unitDist(far.h, far.e).toFixed(2) + '")');
  ok(R.cmdDist(far.h, far.e, far.c) > 6, 'el modelo del portador (extremo lejano) queda a más de 6"'); ok(R.cmdDist(near.h, near.e, near.c) <= 6, 'el modelo del portador (extremo cercano) queda a ≤ 6"');
  const l0 = R.ldOf(far.s, far.e), l1 = R.ldOf(near.s, near.e);
  eq(l0, UNITS.state_troops.Ld, 'extremo lejano: el enemigo conserva su Ld'); eq(l1, UNITS.state_troops.Ld - 1, 'extremo cercano: −1 Ld al enemigo (Percha de Trofeos)');
});

// ---------- aserción de que ya no se mide de unidad a unidad en el código que mide desde el portador: fixed-radius auras con el MISMO escenario ----------
T('v841-aura-single-model-equals-unit', CR + ':3088-3093 (distancias de peana a peana)', 'Con un único modelo (personaje solo) la distancia desde el modelo y de unidad a unidad es la misma', () => {
  const s = game([{ type: 'empire_captain', models: 1, std: true }, { type: 'state_troops', models: 10 }], [{ type: 'orc_boyz', models: 10 }], { f: ['empire', 'orcs'], phase: 'strategy' });
  const c = U(s, 'empire_captain', 0), t = U(s, 'state_troops', 0); put(c, 20, 20, -PI / 2); put(t, 20, 32, -PI / 2); cur(s);
  ok(Math.abs(R.cmdDist(c, t, c) - GEOM.unitDist(c, t)) < 1e-9, 'misma distancia'); eq(R.bsbNear(s, t), GEOM.unitDist(c, t) <= 12, 'PEB solo: alcance por distancia de peana');
});
