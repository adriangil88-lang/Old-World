import { HDMAP, HDMESH, XMODELS, XHPACKS, XTEX, XTEXU } from './hdmap.js';
// Motor WebGL2 mínimo para la vista 3D: mesa, terreno y miniaturas (modelos reales del mod de TTS cuando existen,
// figuras procedurales en su defecto). Usa exactamente la misma cámara que render.js (t3p), para que las
// superposiciones 2D (aros, flechas, etiquetas) encajen al píxel.
import { MODELS } from './models.js';
import { FIG_ALIAS } from './data.js';
import { TERRAIN } from './terrain.js';
import { SCENERY } from './scenery.js';

const GLDCAM = 110;
export const gl3 = { ok: false, gl: null, cv: null };

const VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in vec2 aUV; layout(location=3) in vec4 aCol;
layout(location=4) in vec4 iA; layout(location=5) in vec4 iB; layout(location=6) in vec4 iC;
uniform vec4 uCam; uniform vec4 uView; uniform vec2 uPan; uniform vec2 uC0; uniform vec2 uWH; uniform mat4 uLVP; uniform mat4 uLVP2; uniform float uPass;
out vec2 vUV; out vec4 vCol; out vec3 vN; out vec4 vTint; out float vAlpha; out float vZ; out vec3 vV; out vec4 vLp; out vec4 vLp2; out vec3 vWP;
void main(){
  float cy = cos(iA.w), sy = sin(iA.w);
  vec3 l = aPos * iB.xyz; // x derecha, y arriba, z adelante
  vec3 wp = vec3(iA.x + l.x * (-sy) + l.z * cy, iA.y + l.x * cy + l.z * sy, iA.z + l.y);
  vec3 n = vec3(aNrm.x * (-sy) + aNrm.z * cy, aNrm.x * cy + aNrm.z * sy, aNrm.y);
  float ox = wp.x - uC0.x, oy = wp.y - uC0.y;
  float rx = uCam.x * ox - uCam.y * oy, ry = uCam.y * ox + uCam.x * oy;
  float X = rx, Y = ry * uCam.z - wp.z * uCam.w, dep = -ry * uCam.w - wp.z * uCam.z;
  float w = uView.w + dep;
  // profundidad en perspectiva estándar (lineal en clip space → interpolación correcta en triángulos grandes como la mesa)
  float dn = 1.0, df = uView.w + 260.0;
  gl_Position = vec4((uView.x * X * uView.w + uPan.x * w) * 2.0 / uWH.x, -(uView.x * Y * uView.w + uPan.y * w) * 2.0 / uWH.y, (df + dn) / (df - dn) * w - 2.0 * df * dn / (df - dn), w);
  vUV = aUV; vCol = aCol; vN = n; vTint = iC; vAlpha = iB.w; vZ = wp.z; vWP = wp - iA.xyz;
  vV = normalize(vec3(uCam.y * uCam.w, uCam.x * uCam.w, uCam.z)); // dirección hacia la cámara
  vLp2 = uLVP2 * vec4(wp, 1.0); vLp = uLVP * vec4(wp, 1.0); if (uPass > 0.5) gl_Position = vLp; // pasada de sombras: vista desde el sol
}`;
const FS = `#version 300 es
precision mediump float;
in vec2 vUV; in vec4 vCol; in vec3 vN; in vec4 vTint; in float vAlpha; in float vZ; in vec3 vV; in vec4 vLp; in vec4 vLp2; in highp vec3 vWP;
uniform sampler2D uTex; uniform float uBias; uniform float uSharp; uniform float uUseTex; uniform float uCut; uniform float uFx; uniform sampler2D uDet; uniform float uDetOn; uniform highp sampler2DShadow uSh; uniform float uShOn; uniform float uShTx; uniform highp sampler2DShadow uAO; uniform float uAOOn; uniform float uAOTx; uniform vec2 uRes;
float shadowAt(float nl) {
  if (uShOn < 0.5) return 1.0;
  vec3 p = vLp.xyz / vLp.w * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  float b = 0.0015 + 0.004 * (1.0 - nl), s = 0.0;
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += texture(uSh, vec3(p.xy + vec2(float(i), float(j)) * uShTx * 1.6, p.z - b));
  return s / 9.0;
}
// oclusión ambiental: mapa de profundidad visto desde arriba; la fracción de muestras alrededor tapadas por algo más alto oscurece el contacto con el tablero
float aoAt() {
  if (uAOOn < 0.5) return 1.0;
  vec3 p = vLp2.xyz / vLp2.w * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float a0 = ign * 6.2831853, s = 0.0;
  for (int i = 0; i < 12; i++) {
    float f = float(i), a = a0 + f * 2.3999632, r = (0.25 + 0.75 * sqrt((f + 0.5) / 12.0)) * 9.0;
    s += texture(uAO, vec3(p.xy + vec2(cos(a), sin(a)) * r * uAOTx, p.z - 0.0007));
  }
  return s / 12.0;
}
out vec4 o;
void main(){
  vec4 t = mix(vec4(1.0), texture(uTex, vUV, uBias), uUseTex); if (uSharp > 0.0) { vec3 tb = texture(uTex, vUV, uBias + 1.7).rgb, hp = t.rgb - tb; t.rgb = clamp(t.rgb + uSharp * hp / (1.0 + 7.0 * length(hp)), 0.0, 1.0); } // afinado con límite: donde la textura ya tiene mucho contraste fino se reduce solo (sin moteado)
  // recorte por alfa de las texturas reales del mod (hojas, juncos, hierba): sin él las láminas se ven como bloques macizos
  float cutA = 1.0; if (uCut > 0.5) { cutA = clamp((t.a - 0.35) / 0.25, 0.0, 1.0); if (cutA < 0.02) discard; t.a = 1.0; } // bordes de hoja suaves con alpha-to-coverage (MSAA)
  // faldón de las colinas: se funde con el tapete con un tramado fino en vez de acabar en un borde duro
  float fadeA = 1.0; if (uFx > 0.5 && uFx < 1.5) { fadeA = smoothstep(0.03, 0.34, vZ); if (fadeA < 0.01) discard; } // se funde con alpha-to-coverage (MSAA): sin puntos de tramado
  vec3 c = t.rgb * vCol.rgb;
  vec3 Nd = vec3(0.0);
  if (uDetOn > 4.5) { // miniaturas: grano de pintura muy fino (±4 %), solo se aprecia de cerca
    c *= 0.96 + 0.08 * texture(uDet, vUV * 26.0).g;
  } else if (uDetOn > 3.5) { // telas (banderas): trama suave de baja frecuencia, sin cuadrícula
    float h0 = texture(uDet, vUV * 2.3 + 0.13).r, h1 = texture(uDet, vUV * 7.0).g;
    c *= (0.88 + 0.24 * h0) * (0.95 + 0.10 * h1);
  } else if (uDetOn > 2.5) { // tapete: grano fino por encima de la textura 4K para que no se vea blando al acercar
    vec2 q = vUV * 170.0; float e = 0.004;
    float h0 = texture(uDet, q).r, hx = texture(uDet, q + vec2(e, 0.0)).r, hy = texture(uDet, q + vec2(0.0, e)).r;
    float h1 = texture(uDet, vUV * 37.0 + 0.2).g;
    c *= (0.95 + 0.10 * h0) * (0.97 + 0.06 * h1);
    Nd = vec3(h0 - hx, h0 - hy, 0.0) * 1.2;
  } else if (uDetOn > 1.5) { // modelo con color plano (sin textura original): grano, pinceladas y relieve suaves para que no parezca de plástico liso
    vec2 q = vUV * 14.0; float e = 0.004;
    float h0 = texture(uDet, q).r, hx = texture(uDet, q + vec2(e, 0.0)).r, hy = texture(uDet, q + vec2(0.0, e)).r;
    float h1 = texture(uDet, vUV * 47.0).g, h2 = texture(uDet, vUV * 3.0 + 0.37).b;
    c *= (0.74 + 0.5 * h0) * (0.88 + 0.24 * h1) * (0.86 + 0.28 * h2);
    Nd = vec3(h0 - hx, h0 - hy, 0.0) * 5.0;
  } else if (uDetOn > 0.5) { // textura de detalle para la escenografía del mod: grano fino, grietas y relieve que la textura original no tiene
    vec2 q = vUV * 9.0; float e = 0.004;
    float h0 = texture(uDet, q).r, hx = texture(uDet, q + vec2(e, 0.0)).r, hy = texture(uDet, q + vec2(0.0, e)).r;
    float h1 = texture(uDet, vUV * 31.0).g;
    c *= (0.70 + 0.55 * h0) * (0.86 + 0.28 * h1);
    c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 1.18); // un poco más de color
    Nd = vec3(h0 - hx, h0 - hy, 0.0) * 9.0;
  }
  vec3 Nr = vec3(0.0);
  if (uSharp > 0.0 && (uDetOn < 0.5 || uDetOn > 4.5)) { // miniaturas: relieve a partir del brillo de la textura (huesos, grabados, tela) y sombras levantadas en figuras oscuras
    vec3 hq = texture(uTex, vUV, uBias).rgb - texture(uTex, vUV, uBias + 1.7).rgb; float hh = dot(hq, vec3(0.299, 0.587, 0.114)) * 6.0 / (1.0 + 7.0 * length(hq));
    highp vec3 P = vWP, dpx = dFdx(P), dpy = dFdy(P), nn = normalize(vN);
    vec3 r1 = cross(dpy, nn), r2 = cross(nn, dpx); float dt = dot(dpx, r1);
    if (abs(dt) > 1e-12) { vec3 g = sign(dt) * (dFdx(hh) * r1 + dFdy(hh) * r2) / abs(dt); Nr = -g * 0.12; float ln = length(Nr); if (ln > 0.45) Nr *= 0.45 / ln; }
    float l0 = dot(c, vec3(0.299, 0.587, 0.114)); c += (1.0 - smoothstep(0.05, 0.26, l0)) * 0.035;
  }
  float tk = vTint.a > 1.5 ? 1.0 : vCol.a * vTint.a;
  c = mix(c, c * vTint.rgb * 1.25, tk);
  // iluminación tipo mesa de juego: sol cálido, cielo frío, brillo especular en metal y oclusión junto al tablero
  vec3 N = normalize(normalize(vN) + Nd + Nr), L = normalize(vec3(-0.45, -0.35, 0.82));
  float d = max(dot(N, L), 0.0);
  if (uCut > 0.5) { d = 0.35 + 0.65 * abs(dot(N, L)); N = normalize(mix(N, vec3(0.0, 0.0, 1.0), 0.5)); } // follaje: láminas a dos caras con luz envolvente
  float hemi = 0.5 + 0.5 * N.z;
  float shd = shadowAt(d);
  vec3 sun = vec3(1.0, 0.94, 0.82) * 0.66 * d * shd, sky = mix(vec3(0.30, 0.30, 0.34), vec3(0.50, 0.52, 0.58), hemi);
  vec3 V = normalize(vV), H = normalize(L + V);
  float lum = dot(c, vec3(0.299, 0.587, 0.114)), sat = max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
  float spec = pow(max(dot(N, H), 0.0), 28.0) * (0.10 + 0.55 * smoothstep(0.35, 0.75, lum) * (1.0 - smoothstep(0.08, 0.3, sat)));
  float ao = vZ < 0.02 ? 1.0 : mix(0.72, 1.0, smoothstep(0.1, 0.9, vZ));
  ao *= mix(0.55, 1.0, aoAt());
  vec3 col = (c * (sky * mix(0.82, 1.0, shd) + sun) + spec * vec3(1.0, 0.95, 0.85) * d * shd) * ao;
  float rim = vZ < 0.02 ? 0.0 : pow(1.0 - max(dot(N, V), 0.0), 3.0) * smoothstep(0.0, 0.5, hemi);
  col += rim * (uSharp > 0.0 && (uDetOn < 0.5 || uDetOn > 4.5) ? 0.26 : 0.16) * mix(vec3(0.50, 0.55, 0.70), vec3(1.0, 0.9, 0.75), 0.35) * (0.4 + 0.6 * shd);
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 1.12);
  col = clamp(col * 1.08, 0.0, 1.0); col = mix(col, col * col * (3.0 - 2.0 * col), 0.22); // curva en S suave: más contraste y profundidad
  if (uRes.x > 0.0) { vec2 vq = gl_FragCoord.xy / uRes - 0.5; col *= 1.0 - 0.22 * smoothstep(0.38, 0.82, length(vq * vec2(1.0, 0.85))); } // viñeta suave: centra la mirada en la mesa
  o = vec4(col, vAlpha * t.a * fadeA * cutA);
}`;

function sh(gl, type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }

// ---------- constructor de mallas procedurales ----------
function mb() { return { p: [], n: [], u: [], c: [], i: [] }; }
function mbV(m, p, n, u, c) { m.p.push(...p); m.n.push(...n); m.u.push(...u); m.c.push(...c); return m.p.length / 3 - 1; }
function mbBox(m, cx, cy, cz, sx, sy, sz, col, team = 0) {
  const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy, y1 = cy + sy, z0 = cz - sz / 2, z1 = cz + sz / 2;
  const F = [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]],
    [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]],
    [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]]];
  for (const f of F) { const b = m.p.length / 3; for (let k = 0; k < 4; k++) mbV(m, f[k], f[4], [k === 1 || k === 2 ? 1 : 0, k >= 2 ? 1 : 0], [...col, team]); m.i.push(b, b + 1, b + 2, b, b + 2, b + 3); }
}
function mbCyl(m, cx, cy, cz, r0, r1, h, seg, col, team = 0) {
  seg = Math.max(seg, 16); // figuras más redondeadas (antes 6-12 lados)
  const b = m.p.length / 3;
  for (let k = 0; k <= seg; k++) {
    const a = k / seg * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), sl = (r0 - r1) / Math.max(h, 1e-6);
    mbV(m, [cx + ca * r0, cy, cz + sa * r0], [ca, sl, sa], [k / seg, 0], [...col, team]);
    mbV(m, [cx + ca * r1, cy + h, cz + sa * r1], [ca, sl, sa], [k / seg, 1], [...col, team]);
  }
  for (let k = 0; k < seg; k++) { const a = b + k * 2; m.i.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  if (r1 > 0) { const t = mbV(m, [cx, cy + h, cz], [0, 1, 0], [0.5, 0.5], [...col, team]); for (let k = 0; k < seg; k++) { const a = b + k * 2 + 1; m.i.push(t, a + 2, a); } }
}
function mbBall(m, cx, cy, cz, r, col, team = 0) {
  const R = 10, S = 16, b = m.p.length / 3;
  for (let i = 0; i <= R; i++) for (let j = 0; j <= S; j++) {
    const th = i / R * Math.PI, ph = j / S * Math.PI * 2, x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
    mbV(m, [cx + x * r, cy + y * r, cz + z * r], [x, y, z], [j / S, i / R], [...col, team]);
  }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = b + i * (S + 1) + j, c = a + S + 1; m.i.push(a, c, a + 1, a + 1, c, c + 1); }
}

const SKIN = [0.85, 0.72, 0.58], STEEL = [0.66, 0.68, 0.72], WOOD = [0.45, 0.32, 0.2], DARK = [0.16, 0.15, 0.13], WHITE = [1, 1, 1], BROWN = [0.38, 0.27, 0.17], LEATHER = [0.3, 0.2, 0.12];
const ORC = [0.34, 0.54, 0.24], GOB = [0.5, 0.62, 0.27], TROLL = [0.5, 0.58, 0.46];
function mbLimb(m, a, b, r0, r1, col, team = 0, seg = 6) {
  seg = Math.max(seg, 10);
  const ax = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...ax) || 1, d = ax.map((v) => v / L);
  let up = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]]; const ul = Math.hypot(...u) || 1; u[0] /= ul; u[1] /= ul; u[2] /= ul;
  const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
  const base = m.p.length / 3;
  for (let k = 0; k <= seg; k++) {
    const an = k / seg * Math.PI * 2, c = Math.cos(an), s = Math.sin(an), n = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
    mbV(m, [a[0] + n[0] * r0, a[1] + n[1] * r0, a[2] + n[2] * r0], n, [k / seg, 0], [...col, team]);
    mbV(m, [b[0] + n[0] * r1, b[1] + n[1] * r1, b[2] + n[2] * r1], n, [k / seg, 1], [...col, team]);
  }
  for (let k = 0; k < seg; k++) { const q = base + k * 2; m.i.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
}
function mbCone(m, x, y, z, r, h, col, team = 0, seg = 8) { mbCyl(m, x, y, z, r, 0, h, seg, col, team); }
function mbSlab(m, cx, cy, cz, sx, sy, sz, col, team = 0, rotZ = 0) { // caja con giro alrededor del eje z (para hojas/escudos)
  const t0 = m.p.length; mbBox(m, 0, -sy / 2, 0, sx, sy, sz, col, team);
  const c = Math.cos(rotZ), s = Math.sin(rotZ);
  for (let i = t0; i < m.p.length; i += 3) { const x = m.p[i], y = m.p[i + 1]; m.p[i] = x * c - y * s + cx; m.p[i + 1] = x * s + y * c + cy; m.p[i + 2] += cz; const nx = m.n[i], ny = m.n[i + 1]; m.n[i] = nx * c - ny * s; m.n[i + 1] = nx * s + ny * c; }
}
// ---- personajes de a pie ----
function figInfantry(o) {
  const m = mb(), h = o.h, r = o.r;
  const leg = h * 0.34, torsoH = h * 0.38, y0 = leg;
  for (const sx of [-1, 1]) mbLimb(m, [sx * r * 0.38, 0.06, 0], [sx * r * 0.34, leg, 0], r * 0.2, r * 0.18, o.legs || DARK, 0, 5);
  mbCyl(m, 0, y0, 0, r * 0.82, r * 0.7, torsoH, 9, o.tunic || WHITE, o.tunic ? 0 : 1);
  if (o.armor) mbCyl(m, 0, y0 + torsoH * 0.25, 0, r * 0.88, r * 0.78, torsoH * 0.55, 9, o.armor, 0);
  if (o.belt !== false) mbCyl(m, 0, y0 + 0.01, 0, r * 0.84, r * 0.84, 0.07, 9, LEATHER, 0);
  // detalle extra: faldón del jubón, botas, cuello, hombreras y hebilla (silueta de miniatura en vez de muñeco)
  if (!o.robe) mbCyl(m, 0, leg * 0.55, 0, r * 0.95, r * 0.8, y0 - leg * 0.55 + 0.02, 10, o.tunic || WHITE, o.tunic ? 0 : 1);
  for (const sx of [-1, 1]) { mbCyl(m, sx * r * 0.38, 0.02, r * 0.05, r * 0.26, r * 0.22, leg * 0.32, 7, o.boots || [0.16, 0.12, 0.1], 0); mbBox(m, sx * r * 0.38, 0.02, r * 0.22, r * 0.36, r * 0.16, r * 0.42, o.boots || [0.16, 0.12, 0.1], 0); }
  mbCyl(m, 0, y0 + torsoH - 0.02, 0, r * 0.3, r * 0.28, r * 0.25, 7, o.skin || SKIN, 0);
  if (o.armor) for (const sx of [-1, 1]) mbBall(m, sx * r * 0.82, y0 + torsoH * 0.9, 0, r * 0.32, o.armor, 0);
  if (o.belt !== false) mbBox(m, 0, y0 - 0.005, r * 0.82, r * 0.22, 0.08, 0.03, [0.85, 0.7, 0.3], 0);
  const hy = y0 + torsoH + r * 0.35, hr = r * (o.headR || 0.5);
  if (!o.helm || o.helm === 'steel' || o.helm === 'plume') mbBall(m, 0, hy - hr * 0.05, r * (o.lean || 0) + hr * 0.92, hr * 0.2, o.skin || SKIN, 0); // nariz
  mbBall(m, 0, hy, r * (o.lean || 0), hr, o.skin || SKIN, 0);
  for (const sx of [-1, 1]) { mbLimb(m, [sx * r * 0.8, y0 + torsoH * 0.92, 0], [sx * r * 0.95, y0 + torsoH * 0.4, r * 0.18], r * 0.2, r * 0.16, o.sleeve || o.tunic || WHITE, o.tunic ? 0 : 1, 5); mbBall(m, sx * r * 0.95, y0 + torsoH * 0.36, r * 0.2, r * 0.15, o.skin || SKIN, 0); }
  if (o.helm === 'steel') { mbCyl(m, 0, hy + hr * 0.1, r * (o.lean || 0), hr * 1.08, hr * 0.82, hr * 0.85, 9, STEEL, 0); mbCyl(m, 0, hy + hr * 0.05, r * (o.lean || 0), hr * 1.25, hr * 1.25, 0.03, 9, STEEL, 0); }
  if (o.helm === 'hat') { mbCyl(m, 0, hy + hr * 0.5, 0, hr * 1.7, hr * 1.7, 0.04, 10, o.hat || BROWN, 0); mbCyl(m, 0, hy + hr * 0.52, 0, hr * 0.85, hr * 0.7, hr * 0.8, 9, o.hat || BROWN, 0); }
  if (o.helm === 'hood') mbCone(m, 0, hy - hr * 0.1, 0, hr * 1.2, hr * 2.0, o.hat || [0.12, 0.1, 0.12], 0, 8);
  if (o.helm === 'pointy') { mbCyl(m, 0, hy + hr * 0.6, 0, hr * 1.5, hr * 1.5, 0.03, 10, o.hat || BROWN, 0); mbCone(m, 0, hy + hr * 0.62, 0, hr * 0.95, hr * 2.4, o.hat || BROWN, 1, 9); }
  if (o.helm === 'horns') { mbCyl(m, 0, hy + hr * 0.1, r * (o.lean || 0), hr * 1.08, hr * 0.85, hr * 0.85, 9, [0.3, 0.28, 0.3], 0); for (const sx of [-1, 1]) { mbLimb(m, [sx * hr, hy + hr * 0.4, 0], [sx * hr * 1.9, hy + hr * 0.7, 0], hr * 0.2, hr * 0.1, [0.92, 0.9, 0.8], 0, 5); mbLimb(m, [sx * hr * 1.9, hy + hr * 0.7, 0], [sx * hr * 2.1, hy + hr * 1.7, hr * 0.2], hr * 0.1, hr * 0.03, [0.92, 0.9, 0.8], 0, 5); } }
  if (o.helm === 'plume') { mbCyl(m, 0, hy + hr * 0.1, 0, hr * 1.08, hr * 0.85, hr * 0.85, 9, STEEL, 0); mbLimb(m, [0, hy + hr * 0.9, 0], [0, hy + hr * 1.7, -hr * 1.2], hr * 0.28, hr * 0.12, o.plume || [0.9, 0.9, 0.9], 1, 5); }
  if (o.ears) for (const sx of [-1, 1]) mbLimb(m, [sx * hr * 0.9, hy, 0], [sx * hr * 2.1, hy + hr * 0.5, -hr * 0.4], hr * 0.28, hr * 0.06, o.skin || GOB, 0, 4);
  if (o.tusks) for (const sx of [-1, 1]) mbLimb(m, [sx * hr * 0.45, hy - hr * 0.5, hr * 0.8], [sx * hr * 0.5, hy + hr * 0.1, hr * 1.1], hr * 0.12, hr * 0.03, [0.95, 0.93, 0.85], 0, 4);
  if (o.shield) { const t0 = m.p.length / 3; void t0; mbSlab(m, -r * 1.1, y0 + torsoH * 0.55, r * 0.15, 0.07, r * 1.5, r * 1.25, o.shieldCol || WHITE, o.shieldCol ? 0 : 1, 0); mbBall(m, -r * 1.16, y0 + torsoH * 0.55 + r * 0.62, r * 0.15, r * 0.2, [0.75, 0.7, 0.55], 0); }
  const hx = r * 1.0, hz = r * 0.2;
  if (o.weapon === 'spear') mbLimb(m, [hx, 0.05, hz], [hx, h * 1.75, hz], 0.03, 0.025, WOOD, 0, 5), mbCone(m, hx, h * 1.7, hz, 0.06, 0.2, STEEL, 0, 5);
  else if (o.weapon === 'halberd') { mbLimb(m, [hx, 0.05, hz], [hx, h * 1.6, hz], 0.03, 0.026, WOOD, 0, 5); mbSlab(m, hx, h * 1.5, hz, 0.025, 0.2, 0.17, STEEL, 0, 0); mbCone(m, hx, h * 1.58, hz, 0.04, 0.2, STEEL, 0, 5); }
  else if (o.weapon === 'sword') { mbLimb(m, [hx, y0 + torsoH * 0.4, hz], [hx + 0.1, y0 + torsoH + h * 0.55, hz + 0.28], 0.03, 0.014, STEEL, 0, 4); }
  else if (o.weapon === 'greatsword') { mbLimb(m, [hx * 0.9, y0 + torsoH * 0.3, hz], [hx * 0.9, y0 + torsoH + h * 0.9, hz + 0.18], 0.045, 0.02, STEEL, 0, 4); }
  else if (o.weapon === 'cleaver') { mbLimb(m, [hx, y0 + torsoH * 0.4, hz], [hx + 0.08, y0 + torsoH + h * 0.35, hz + 0.2], 0.03, 0.03, WOOD, 0, 4); mbSlab(m, hx + 0.1, y0 + torsoH + h * 0.4, hz + 0.22, 0.03, 0.3, 0.16, [0.5, 0.5, 0.52], 0, 0.2); }
  else if (o.weapon === 'bow') { mbLimb(m, [hx, y0 + torsoH * 0.15, hz], [hx + 0.06, y0 + torsoH * 0.55, hz + 0.1], 0.025, 0.022, WOOD, 0, 4); mbLimb(m, [hx + 0.06, y0 + torsoH * 0.55, hz + 0.1], [hx, y0 + torsoH * 1.05, hz], 0.022, 0.02, WOOD, 0, 4); }
  else if (o.weapon === 'gun') { mbLimb(m, [r * 0.5, y0 + torsoH * 0.55, r * 0.15], [r * 0.5, y0 + torsoH * 0.62, r * 1.3], 0.05, 0.035, [0.25, 0.25, 0.28], 0, 5); mbLimb(m, [r * 0.5, y0 + torsoH * 0.55, r * 0.15], [r * 0.5, y0 + torsoH * 0.4, -r * 0.4], 0.05, 0.05, WOOD, 0, 5); }
  else if (o.weapon === 'crossbow') { mbLimb(m, [r * 0.5, y0 + torsoH * 0.6, r * 0.1], [r * 0.5, y0 + torsoH * 0.62, r * 0.9], 0.04, 0.035, WOOD, 0, 5); mbSlab(m, r * 0.5, y0 + torsoH * 0.62, r * 0.65, 0.5 * r, 0.04, 0.05, WOOD, 0, 0); }
  else if (o.weapon === 'hammer') { mbLimb(m, [hx, y0 + torsoH * 0.2, hz], [hx, y0 + torsoH + h * 0.75, hz + 0.12], 0.03, 0.028, WOOD, 0, 5); mbBox(m, hx, y0 + torsoH + h * 0.75, hz + 0.12, 0.3, 0.16, 0.16, STEEL, 0); }
  else if (o.weapon === 'club') { mbLimb(m, [hx, y0 + torsoH * 0.3, hz], [hx + 0.2, y0 + torsoH + h * 0.5, hz + 0.5], 0.08, 0.2, WOOD, 0, 6); }
  else if (o.weapon === 'staff') { mbLimb(m, [hx, 0.05, hz], [hx, h * 1.45, hz], 0.03, 0.028, WOOD, 0, 5); mbBall(m, hx, h * 1.5, hz, 0.09, [0.55, 0.8, 1], 0); }
  if (o.beard) mbLimb(m, [0, hy - hr * 0.25, hr * 0.55], [0, hy - hr * 1.9, hr * 0.75], hr * 0.75, hr * 0.12, o.beard, 0, 7);
  if (o.canopy) { const c = o.canopy; for (let i = 0; i < 5; i++) { const a = i * 1.256; mbCone(m, Math.cos(a) * hr * 0.9, hy + hr * 0.7, Math.sin(a) * hr * 0.9, hr * 0.7, hr * 1.9, c, 0, 6); } mbCone(m, 0, hy + hr * 0.8, 0, hr * 0.9, hr * 2.6, c, 0, 7); for (const sx of [-1, 1]) { mbLimb(m, [sx * r * 0.95, y0 + torsoH * 0.9, 0], [sx * r * 1.9, y0 + torsoH * 1.2, r * 0.3], r * 0.2, r * 0.07, o.skin, 0, 5); mbLimb(m, [sx * r * 1.9, y0 + torsoH * 1.2, r * 0.3], [sx * r * 2.2, y0 + torsoH * 1.9, r * 0.3], r * 0.07, r * 0.02, o.skin, 0, 4); } for (const sx of [-1, 1]) mbLimb(m, [sx * r * 0.4, leg, 0], [sx * r * 1.1, 0.02, r * 0.3], r * 0.12, r * 0.05, o.skin, 0, 4); }
  if (o.hair) for (let i = 0; i < 6; i++) { const a = i * 1.05; mbLimb(m, [Math.cos(a) * hr * 0.5, hy + hr * 0.7, Math.sin(a) * hr * 0.5], [Math.cos(a) * hr * 1.3, hy - hr * 0.2, Math.sin(a) * hr * 1.3], hr * 0.22, hr * 0.08, o.hair, 0, 4); }
  if (o.banner) { mbLimb(m, [-r * 0.9, 0.05, -r * 0.3], [-r * 0.9, h * 1.9, -r * 0.3], 0.03, 0.025, WOOD, 0, 5); mbSlab(m, -r * 0.9, h * 1.65, -r * 0.3, 0.03, h * 0.45, h * 0.4, o.bannerCol || WHITE, o.bannerCol ? 0 : 1, 0); }
  if (o.cape) mbSlab(m, 0, y0 + torsoH * 0.5, -r * 0.8, r * 1.5, torsoH * 1.15, 0.04, o.cape === true ? WHITE : o.cape, o.cape === true ? 1 : 0, 0);
  if (o.robe) mbCyl(m, 0, 0.02, 0, r * 1.15, r * 0.7, y0 + torsoH * 0.9, 10, o.robe, 1);
  return m;
}
// ---- monturas ----
function horseMesh(m, o) {
  const s = o.s || 1, col = o.col || [0.4, 0.28, 0.18];
  mbBox(m, 0, 0.55 * s, 0, 0.46 * s, 0.4 * s, 1.35 * s, col, 0);
  mbBox(m, 0, 0.52 * s, 0.15 * s, 0.5 * s, 0.1 * s, 0.95 * s, o.barding || [1, 1, 1], o.barding ? 0 : 1);
  mbLimb(m, [0, 0.8 * s, 0.6 * s], [0, 1.15 * s, 1.0 * s], 0.16 * s, 0.1 * s, col, 0, 6);
  mbBox(m, 0, 1.0 * s, 1.1 * s, 0.17 * s, 0.2 * s, 0.34 * s, col, 0);
  for (const [x, z] of [[0.15, 0.5], [-0.15, 0.5], [0.15, -0.5], [-0.15, -0.5]]) mbLimb(m, [x * s, 0.55 * s, z * s], [x * s, 0.02, z * s], 0.06 * s, 0.045 * s, col, 0, 5);
  mbLimb(m, [0, 0.8 * s, -0.65 * s], [0, 0.35 * s, -0.95 * s], 0.05 * s, 0.03 * s, [0.12, 0.1, 0.08], 0, 5);
  if (o.capar) { for (const sx of [-1, 1]) mbSlab(m, sx * 0.25 * s, 0.38 * s, 0.05, 0.03, 0.5 * s, 1.0 * s, o.caparCol || WHITE, o.caparCol ? 0 : 1, 0); mbBox(m, 0, 0.92 * s, 0.82 * s, 0.22 * s, 0.4 * s, 0.1 * s, STEEL, 0); mbBox(m, 0, 1.12 * s, 1.12 * s, 0.12 * s, 0.06 * s, 0.28 * s, STEEL, 0); }
  if (o.antlers) for (const sx of [-1, 1]) { mbLimb(m, [sx * 0.07 * s, 1.15 * s, 1.0 * s], [sx * 0.25 * s, 1.5 * s, 0.95 * s], 0.025 * s, 0.015 * s, [0.8, 0.72, 0.55], 0, 4); mbLimb(m, [sx * 0.2 * s, 1.4 * s, 0.97 * s], [sx * 0.12 * s, 1.65 * s, 1.1 * s], 0.015 * s, 0.01 * s, [0.8, 0.72, 0.55], 0, 4); }
  if (o.wings) for (const sx of [-1, 1]) { mbSlab(m, sx * 0.55 * s, 0.95 * s, -0.05, 0.9 * s, 0.03, 0.8 * s, [0.95, 0.95, 0.97], 0, sx * 0.35); }
  return 0.82 * s;
}
function figRider(o) {
  const m = mb(); const top = horseMesh(m, o);
  const r = 0.3, hy = top + 0.5;
  mbCyl(m, 0, top, -0.05, r * 0.7, r * 0.55, 0.45, 9, o.tunic || WHITE, o.tunic ? 0 : 1);
  if (o.armor) mbCyl(m, 0, top + 0.1, -0.05, r * 0.78, r * 0.62, 0.28, 9, o.armor, 0);
  mbBall(m, 0, hy + 0.05, -0.05, 0.15, o.skin || SKIN, 0);
  if (o.helm !== 'none') { mbCyl(m, 0, hy + 0.03, -0.05, 0.17, 0.14, 0.18, 9, STEEL, 0); }
  if (o.plume) mbLimb(m, [0, hy + 0.2, -0.05], [0, hy + 0.38, -0.3], 0.05, 0.02, o.plume, 1, 5);
  mbSlab(m, -0.27, top + 0.2, 0.05, 0.05, 0.42, 0.34, o.shieldCol || WHITE, o.shieldCol ? 0 : 1, 0);
  if (o.lance) { mbLimb(m, [0.28, top + 0.2, -0.55], [0.3, top + 0.35, 1.7], 0.03, 0.02, WOOD, 0, 5); mbSlab(m, 0.3, top + 0.4, 1.45, 0.02, 0.2, 0.34, WHITE, 1, 0); }
  if (o.spear) mbLimb(m, [0.28, top + 0.1, -0.4], [0.3, top + 0.55, 1.4], 0.025, 0.018, WOOD, 0, 5);
  if (o.sword) mbLimb(m, [0.25, top + 0.25, 0], [0.3, top + 0.75, 0.25], 0.03, 0.015, STEEL, 0, 4);
  if (o.cape) mbSlab(m, 0, top + 0.3, -0.4, 0.5, 0.5, 0.04, WHITE, 1, 0);
  if (o.banner) { mbLimb(m, [-0.2, top + 0.1, -0.5], [-0.2, top + 1.5, -0.5], 0.025, 0.02, WOOD, 0, 5); mbSlab(m, -0.2, top + 1.25, -0.5, 0.03, 0.4, 0.4, WHITE, 1, 0); }
  if (o.crest) mbLimb(m, [0, hy + 0.15, -0.05], [0, hy + 0.55, -0.35], 0.07, 0.02, o.crest, 1, 5);
  if (o.ears) { for (const sx of [-1, 1]) mbLimb(m, [sx * 0.15, hy + 0.05, -0.05], [sx * 0.34, hy + 0.12, -0.12], 0.05, 0.02, o.skin, 0, 4); }
  return m;
}
function figBeast(o) { // jabalí / lobo con jinete goblin u orco
  const m = mb(), col = o.col, s = o.s || 1;
  mbBox(m, 0, 0.35 * s, 0, 0.5 * s, 0.42 * s, 1.0 * s, col, 0);
  mbBox(m, 0, 0.42 * s, 0.6 * s, 0.32 * s, 0.34 * s, 0.4 * s, col, 0);
  mbBox(m, 0, 0.3 * s, 0.88 * s, 0.2 * s, 0.18 * s, 0.26 * s, o.snout || col, 0);
  if (o.tusks) for (const sx of [-1, 1]) mbLimb(m, [sx * 0.1 * s, 0.28 * s, 0.9 * s], [sx * 0.14 * s, 0.5 * s, 1.05 * s], 0.035 * s, 0.01, [0.95, 0.93, 0.85], 0, 4);
  for (const sx of [-1, 1]) mbCone(m, sx * 0.1 * s, 0.6 * s, 0.7 * s, 0.05 * s, 0.14 * s, col, 0, 4);
  for (const [x, z] of [[0.16, 0.35], [-0.16, 0.35], [0.16, -0.3], [-0.16, -0.3]]) mbLimb(m, [x * s, 0.3 * s, z * s], [x * s, 0.0, z * s], 0.06 * s, 0.045 * s, col, 0, 5);
  mbLimb(m, [0, 0.5 * s, -0.5 * s], [0, 0.65 * s, -0.8 * s], 0.04 * s, 0.015, col, 0, 4);
  if (o.wings) for (const sx of [-1, 1]) { mbLimb(m, [sx * 0.2 * s, 0.7 * s, 0.1 * s], [sx * 1.2 * s, 1.3 * s, -0.2 * s], 0.06 * s, 0.03 * s, o.wings, 0, 4); mbSlab(m, sx * 0.75 * s, 0.85 * s, -0.15 * s, 0.9 * s, 0.03, 0.6 * s, o.wings, 0, 0); }
  if (o.noRider) return m;
  const top = 0.56 * s, r = o.rr || 0.26;
  mbCyl(m, 0, top, 0, r * 0.7, r * 0.55, 0.36, 8, o.tunic || WHITE, o.tunic ? 0 : 1);
  mbBall(m, 0, top + 0.5, 0, 0.14, o.skin, 0);
  if (o.ears) for (const sx of [-1, 1]) mbLimb(m, [sx * 0.13, top + 0.52, 0], [sx * 0.32, top + 0.6, -0.08], 0.05, 0.02, o.skin, 0, 4);
  mbLimb(m, [0.22, top + 0.1, -0.3], [0.26, top + 0.4, 1.0], 0.025, 0.016, WOOD, 0, 5);
  mbSlab(m, -0.24, top + 0.18, 0.05, 0.04, 0.3, 0.28, WHITE, 1, 0);
  return m;
}
function figTrebuchet() {
  const m = mb();
  mbBox(m, 0, 0, 0, 1.2, 0.2, 2.0, WOOD, 0);
  for (const sx of [-0.45, 0.45]) { mbLimb(m, [sx, 0.15, -0.5], [sx * 0.2, 2.2, 0.0], 0.07, 0.05, WOOD, 0, 5); mbLimb(m, [sx, 0.15, 0.5], [sx * 0.2, 2.2, 0.0], 0.07, 0.05, WOOD, 0, 5); }
  mbLimb(m, [0, 2.3, 1.7], [0, 1.9, -0.9], 0.08, 0.06, WOOD, 0, 5);
  mbBox(m, 0, 1.2, -1.0, 0.7, 0.7, 0.5, [0.4, 0.4, 0.42], 0);
  mbCyl(m, 0, 2.0, 1.7, 0.15, 0.15, 0.1, 8, LEATHER, 0);
  return m;
}
function figCannon(big) {
  const m = mb(); const s = big ? 1.0 : 0.85;
  mbBox(m, 0, 0.35, 0, 0.9 * s, 0.14, 1.4 * s, WOOD, 0);
  for (const sx of [-1, 1]) mbCyl(m, sx * 0.52 * s, 0.0, -0.1, 0.42 * s, 0.42 * s, 0.1, 12, WOOD, 0);
  mbLimb(m, [0, 0.7 * s, -0.5 * s], [0, 0.75 * s, 1.4 * s], 0.24 * s, 0.18 * s, [0.55, 0.45, 0.28], 0, 10);
  mbLimb(m, [0, 0.35, -0.7], [0, 0.1, -1.4], 0.06, 0.05, WOOD, 0, 5);
  return m;
}
function figLobber() {
  const m = mb();
  mbBox(m, 0, 0.1, 0, 1.1, 0.22, 1.5, WOOD, 0);
  for (const sx of [-1, 1]) mbCyl(m, sx * 0.65, 0, 0.1, 0.4, 0.4, 0.1, 10, WOOD, 0);
  mbLimb(m, [0, 0.3, 0.1], [0, 1.4, -0.4], 0.07, 0.07, WOOD, 0, 5);
  mbLimb(m, [0, 1.4, -0.4], [0, 1.7, 1.1], 0.06, 0.04, WOOD, 0, 5);
  mbCyl(m, 0, 1.55, 1.1, 0.18, 0.28, 0.14, 8, LEATHER, 0);
  mbBall(m, 0, 1.75, 1.1, 0.16, [0.5, 0.5, 0.48], 0);
  return m;
}
// Carro: caja con ruedas, bestias de tiro delante y tripulación
function figChariot(o) {
  const m = mb(), W0 = o.wood || WOOD, n = o.beasts || 2;
  mbBox(m, 0, 0.55, -0.5, 1.0, 0.5, 1.0, W0, 0);
  mbBox(m, 0, 0.95, -0.92, 1.0, 0.35, 0.12, o.trim || W0, 0);
  for (const sx of [-1, 1]) { mbLimb(m, [sx * 0.58 - 0.05, 0.42, -0.55], [sx * 0.58 + 0.05, 0.42, -0.55], 0.42, 0.42, o.wheel || W0, 0, 16); /* v843o: rueda VERTICAL (eje transversal); antes era un disco tumbado en el suelo */ for (let a = 0; a < 3; a++) { const t = a * Math.PI / 3, dy = Math.sin(t) * 0.4, dz = Math.cos(t) * 0.4; mbLimb(m, [sx * 0.58, 0.42 - dy, -0.55 - dz], [sx * 0.58, 0.42 + dy, -0.55 + dz], 0.03, 0.03, o.trim || W0, 0, 5); } if (o.blades) mbLimb(m, [sx * 0.62, 0.42, -0.55], [sx * 1.05, 0.4, -0.55], 0.04, 0.01, STEEL, 0, 4); }
  mbLimb(m, [0, 0.45, 0], [0, 0.5, 1.4], 0.05, 0.05, W0, 0, 5);
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 0 : (i - (n - 1) / 2) * 0.5, s = o.bs || 0.8, col = o.beast || [0.4, 0.28, 0.18];
    mbBox(m, x, 0.5 * s + 0.1, 1.3, 0.38 * s, 0.42 * s, 1.0 * s, col, 0);
    mbBox(m, x, 0.75 * s + 0.12, 1.9 * s + 0.2, 0.26 * s, 0.3 * s, 0.4 * s, col, 0);
    for (const [lx, lz] of [[0.12, 0.35], [-0.12, 0.35], [0.12, -0.3], [-0.12, -0.3]]) mbLimb(m, [x + lx * s, 0.4 * s, 1.3 + lz * s], [x + lx * s, 0.0, 1.3 + lz * s], 0.05 * s, 0.04 * s, col, 0, 5);
    if (o.horns) for (const sx of [-1, 1]) mbLimb(m, [x + sx * 0.1, 0.95 * s, 2.0 * s + 0.2], [x + sx * 0.3, 1.2 * s, 2.15 * s + 0.2], 0.05, 0.015, [0.9, 0.88, 0.8], 0, 4);
  }
  for (const sx of [-0.25, 0.25]) {
    mbCyl(m, sx, 0.8, -0.45, 0.16, 0.13, 0.45, 8, o.crew || WHITE, o.crew ? 0 : 1);
    mbBall(m, sx, 1.4, -0.45, 0.12, o.skin || SKIN, 0);
    if (o.helm) mbCyl(m, sx, 1.43, -0.45, 0.13, 0.1, 0.12, 8, o.helm, 0);
    mbLimb(m, [sx + 0.12, 0.95, -0.4], [sx + 0.18, 1.8, 0.1], 0.02, 0.015, o.weap || STEEL, 0, 4);
  }
  for (let i = 2; i < m.p.length; i += 3) m.p[i] -= 0.55; // v843o: centra el carro (z de -1,0 a +2,05) en el centro de la peana; antes sobresalía por detrás
  return m;
}
function figOrgan() {
  const m = figCannon(false);
  for (const sx of [-0.3, -0.1, 0.1, 0.3]) mbLimb(m, [sx, 0.62, -0.4], [sx, 0.66, 1.2], 0.07, 0.06, [0.5, 0.42, 0.25], 0, 7);
  return m;
}
function figGyro() {
  const m = mb(), BR = [0.62, 0.48, 0.25], ST = [0.45, 0.46, 0.5];
  mbLimb(m, [0, 0.9, -0.6], [0, 0.95, 0.7], 0.32, 0.22, BR, 0, 10);
  mbLimb(m, [0, 0.95, -0.6], [0, 1.05, -1.4], 0.12, 0.06, ST, 0, 6);
  mbLimb(m, [0, 1.15, 0], [0, 1.7, 0], 0.05, 0.05, ST, 0, 5);
  mbSlab(m, 0, 1.72, 0, 2.6, 0.03, 0.16, [0.3, 0.3, 0.32], 0, 0); mbSlab(m, 0, 1.72, 0, 0.16, 0.03, 2.6, [0.3, 0.3, 0.32], 0, 0);
  mbBall(m, 0, 1.3, 0.15, 0.17, SKIN, 0); mbCyl(m, 0, 1.33, 0.15, 0.19, 0.15, 0.14, 9, ST, 0); mbLimb(m, [0, 1.25, 0.28], [0, 1.0, 0.36], 0.13, 0.04, [0.75, 0.55, 0.3], 0, 6);
  mbLimb(m, [0.32, 0.8, 0.3], [0.34, 0.8, 1.1], 0.06, 0.05, ST, 0, 6);
  for (const sx of [-1, 1]) mbLimb(m, [sx * 0.3, 0.7, 0], [sx * 0.42, 0.05, 0], 0.03, 0.03, ST, 0, 4);
  return m;
}
function figBolt() {
  const m = mb();
  mbBox(m, 0, 0.1, 0, 0.9, 0.2, 1.1, WOOD, 0);
  for (const sx of [-1, 1]) mbCyl(m, sx * 0.55, 0, -0.1, 0.34, 0.34, 0.1, 10, WOOD, 0);
  mbLimb(m, [0, 0.4, -0.3], [0, 0.55, 1.3], 0.07, 0.05, WOOD, 0, 5);
  mbSlab(m, 0, 0.55, 0.9, 1.3, 0.05, 0.07, WOOD, 0, 0);
  mbLimb(m, [0, 0.58, 0.2], [0, 0.6, 1.5], 0.02, 0.012, STEEL, 0, 4);
  return m;
}

// ---- figuras procedurales propias para unidades sin malla en los mods ----
function figSpider(o) { // araña gigante (Arachnarok / jinetes de araña): abdomen, cefalotórax, 8 patas articuladas, ojos y colmillos
  const m = mb(), s = o.s || 1, col = o.col, dk = o.dk || [0.08, 0.06, 0.06]; const lt = o.lat || 1;
  mbBall(m, 0, 0.62 * s, -0.5 * s, 0.5 * s, col, 0);
  mbBall(m, 0, 0.58 * s, 0.1 * s, 0.34 * s, col, 0);
  mbBall(m, 0, 0.6 * s, 0.42 * s, 0.2 * s, dk, 0);
  for (const sx of [-1, 1]) { mbBall(m, sx * 0.08 * s, 0.7 * s, 0.58 * s, 0.045 * s, o.eye || [0.9, 0.1, 0.08], 0); mbBall(m, sx * 0.13 * s, 0.64 * s, 0.56 * s, 0.03 * s, o.eye || [0.9, 0.1, 0.08], 0); mbLimb(m, [sx * 0.08 * s, 0.52 * s, 0.56 * s], [sx * 0.1 * s, 0.3 * s, 0.7 * s], 0.045 * s, 0.01, [0.85, 0.82, 0.7], 0, 4); }
  for (let i = 0; i < 4; i++) { const z = (0.32 - i * 0.2) * s, sp = (1 + i * 0.12) * s; for (const sx of [-1, 1]) { mbLimb(m, [sx * 0.22 * s, 0.6 * s, z], [sx * 0.75 * sp * lt, 1.0 * s, z + (i < 2 ? 0.18 : -0.18) * s], 0.055 * s, 0.04 * s, dk, 0, 5); mbLimb(m, [sx * 0.75 * sp * lt, 1.0 * s, z + (i < 2 ? 0.18 : -0.18) * s], [sx * 1.05 * sp * lt, 0.0, z + (i < 2 ? 0.3 : -0.3) * s], 0.04 * s, 0.015 * s, dk, 0, 5); } }
  if (o.rider) { const t = 0.88 * s; mbCyl(m, 0, t, -0.05 * s, 0.17 * s, 0.14 * s, 0.3 * s, 8, o.tunic || WHITE, o.tunic ? 0 : 1); mbBall(m, 0, t + 0.42 * s, -0.05 * s, 0.13 * s, GOB, 0); mbCyl(m, 0, t + 0.46 * s, -0.05 * s, 0.15 * s, 0.12 * s, 0.1 * s, 8, [0.35, 0.3, 0.3], 0); for (const sx of [-1, 1]) mbLimb(m, [sx * 0.12 * s, t + 0.44 * s, -0.05 * s], [sx * 0.36 * s, t + 0.52 * s, -0.12 * s], 0.04 * s, 0.015, GOB, 0, 4); mbLimb(m, [0.2 * s, t, -0.2 * s], [0.25 * s, t + 0.4 * s, 0.9 * s], 0.025 * s, 0.016, WOOD, 0, 5); }
  return m;
}
function figSquig(o) { // squig: bola con bocaza llena de dientes, ojos saltones y patas cortas
  const m = mb(), s = o.s || 1, col = o.col;
  mbBall(m, 0, 0.55 * s, 0, 0.55 * s, col, 0);
  mbBox(m, 0, 0.3 * s, 0.38 * s, 0.7 * s, 0.22 * s, 0.4 * s, o.mouth || [0.25, 0.05, 0.05], 0);
  for (let i = -3; i <= 3; i++) { mbCone(m, i * 0.095 * s, 0.5 * s, 0.56 * s, 0.03 * s, 0.14 * s, [0.95, 0.93, 0.85], 0, 4); mbCone(m, i * 0.095 * s, 0.3 * s, 0.56 * s, 0.03 * s, 0.1 * s, [0.95, 0.93, 0.85], 0, 4); }
  for (const sx of [-1, 1]) { mbBall(m, sx * 0.22 * s, 0.95 * s, 0.28 * s, 0.1 * s, [1, 0.95, 0.7], 0); mbBall(m, sx * 0.22 * s, 0.97 * s, 0.36 * s, 0.045 * s, [0.05, 0.05, 0.05], 0); mbLimb(m, [sx * 0.2 * s, 0.1 * s, 0.05 * s], [sx * 0.32 * s, 0.0, 0.18 * s], 0.1 * s, 0.07 * s, col, 0, 5); }
  if (o.spots) for (const [x, y, z] of [[0.3, 0.85, -0.1], [-0.3, 0.8, -0.2], [0, 1.05, -0.2]]) mbBall(m, x * s, y * s, z * s, 0.09 * s, o.spots, 0);
  return m;
}
function figHarpy(o) { // arpía: cuerpo emplumado, cabeza humana, alas desplegadas y garras
  const m = mb(), s = o.s || 1, col = o.col || [0.4, 0.3, 0.22];
  mbCyl(m, 0, 0.45 * s, 0, 0.17 * s, 0.1 * s, 0.5 * s, 8, col, 0);
  mbBall(m, 0, 1.02 * s, 0.04 * s, 0.13 * s, o.skin || [0.8, 0.7, 0.65], 0);
  for (let i = 0; i < 5; i++) { const a = i * 1.25; mbLimb(m, [Math.cos(a) * 0.1 * s, 1.08 * s, 0.02 * s + Math.sin(a) * 0.1 * s], [Math.cos(a) * 0.2 * s, 0.9 * s, -0.12 * s + Math.sin(a) * 0.2 * s], 0.04 * s, 0.01, [0.15, 0.1, 0.1], 0, 4); }
  for (const sx of [-1, 1]) { mbLimb(m, [sx * 0.12 * s, 0.8 * s, 0], [sx * 0.9 * s, 1.15 * s, -0.1 * s], 0.045 * s, 0.025 * s, col, 0, 5); mbSlab(m, sx * 0.55 * s, 0.95 * s, -0.12 * s, 0.85 * s, 0.03, 0.55 * s, o.wing || [0.28, 0.2, 0.16], 0, sx * 0.3); mbSlab(m, sx * 0.85 * s, 1.0 * s, -0.2 * s, 0.4 * s, 0.03, 0.4 * s, o.wing || [0.28, 0.2, 0.16], 0, sx * 0.3); mbLimb(m, [sx * 0.06 * s, 0.2 * s, 0.02 * s], [sx * 0.1 * s, 0.0, 0.14 * s], 0.035 * s, 0.015, [0.8, 0.75, 0.5], 0, 4); }
  mbLimb(m, [0, 0.2 * s, -0.05 * s], [0, 0.05 * s, -0.4 * s], 0.08 * s, 0.03 * s, col, 0, 5);
  return m;
}
function figShip(o) { // barco: casco con proa elevada, mástil y vela con los colores del jugador
  const m = mb(), s = o.s || 1;
  mbBox(m, 0, 0.15 * s, 0, 0.9 * s, 0.35 * s, 2.0 * s, o.hull || [0.55, 0.42, 0.3], 0);
  mbBox(m, 0, 0.5 * s, 0, 0.78 * s, 0.05 * s, 1.8 * s, [0.7, 0.58, 0.4], 0);
  mbLimb(m, [0, 0.3 * s, 1.0 * s], [0, 0.85 * s, 1.55 * s], 0.2 * s, 0.07 * s, o.hull || [0.55, 0.42, 0.3], 0, 6);
  mbBall(m, 0, 0.95 * s, 1.6 * s, 0.12 * s, o.trim || [0.85, 0.7, 0.3], 0);
  mbLimb(m, [0, 0.3 * s, -1.0 * s], [0, 0.7 * s, -1.4 * s], 0.15 * s, 0.06 * s, o.hull || [0.55, 0.42, 0.3], 0, 6);
  mbLimb(m, [0, 0.5 * s, 0.1 * s], [0, 2.4 * s, 0.1 * s], 0.05 * s, 0.035 * s, WOOD, 0, 5);
  mbSlab(m, 0, 1.55 * s, 0.1 * s, 0.03, 1.4 * s, 1.1 * s, WHITE, 1, 0);
  for (const sx of [-1, 1]) for (const z of [-0.5, 0, 0.5]) mbBall(m, sx * 0.47 * s, 0.4 * s, z * s, 0.12 * s, [0.8, 0.7, 0.3], 0);
  return m;
}
function figSerpent(o) { // serpiente marina (Merwyrm): cuerpo ondulante de esferas, cresta y cabeza con aletas
  const m = mb(), s = o.s || 1, col = o.col || [0.2, 0.5, 0.5];
  for (let i = 0; i < 9; i++) { const t = i / 8, z = (-1.2 + t * 2.0) * s, x = Math.sin(t * 6.3) * 0.3 * s, y = (0.45 + Math.sin(t * 5 + 1) * 0.12) * s, r = (0.34 - t * 0.14) * s; mbBall(m, x, y, z, r, i % 2 ? col : [col[0] * 0.8, col[1] * 0.85, col[2] * 0.9], 0); if (i % 2 === 0) mbCone(m, x, y + r * 0.8, z, r * 0.35, r * 1.1, [0.85, 0.35, 0.3], 0, 5); }
  const hx = Math.sin(6.3) * 0.3 * s;
  mbBall(m, hx, 0.5 * s, 0.9 * s, 0.22 * s, col, 0); mbBox(m, hx, 0.38 * s, 1.1 * s, 0.22 * s, 0.1 * s, 0.3 * s, col, 0);
  for (const sx of [-1, 1]) { mbBall(m, hx + sx * 0.14 * s, 0.6 * s, 1.0 * s, 0.045 * s, [1, 0.9, 0.3], 0); mbSlab(m, hx + sx * 0.28 * s, 0.55 * s, 0.82 * s, 0.03, 0.3 * s, 0.3 * s, [0.85, 0.35, 0.3], 0, sx * 0.5); }
  mbLimb(m, [Math.sin(0) * 0.3 * s, 0.45 * s, -1.2 * s], [0, 0.6 * s, -1.6 * s], 0.12 * s, 0.02, col, 0, 5);
  return m;
}
function figPackBeast(o) { // manadas de bestias silvanas: cuadrúpedo sin jinete, proporciones de cada especie
  const m = mb(), s = o.s || 1, col = o.col, L = o.len || 1.0, H = o.h || 0.4;
  mbBox(m, 0, (H * 0.6) * s, 0, o.w * s, H * s, L * s, col, 0);
  mbBox(m, 0, (H * 0.65) * s, (L * 0.55) * s, o.w * 0.85 * s, H * 0.85 * s, 0.3 * s, col, 0);
  mbBox(m, 0, (H * 0.55) * s, (L * 0.55 + 0.28) * s, o.w * 0.5 * s, H * 0.5 * s, 0.26 * s, o.snout || col, 0);
  mbBall(m, 0, (H * 0.65) * s, (L * 0.55 + 0.42) * s, 0.045 * s, [0.08, 0.06, 0.06], 0);
  for (const sx of [-1, 1]) mbCone(m, sx * o.w * 0.3 * s, (H * 1.2) * s, (L * 0.5) * s, 0.06 * s, o.ear * s, col, 0, 4);
  if (o.tusks) for (const sx of [-1, 1]) mbLimb(m, [sx * 0.1 * s, (H * 0.5) * s, (L * 0.55 + 0.38) * s], [sx * 0.16 * s, (H * 0.95) * s, (L * 0.55 + 0.5) * s], 0.035 * s, 0.01, [0.95, 0.93, 0.85], 0, 4);
  if (o.hump) mbBall(m, 0, (H * 1.25) * s, (L * 0.2) * s, o.w * 0.55 * s, col, 0);
  if (o.stripes) for (let i = 0; i < 4; i++) mbBox(m, 0, (H * 1.02) * s, (-0.35 + i * 0.22) * L * s, o.w * 1.04 * s, 0.03 * s, 0.07 * s, o.stripes, 0);
  const lw = o.leg || 0.07;
  for (const [x, z] of [[0.5, 0.38], [-0.5, 0.38], [0.5, -0.36], [-0.5, -0.36]]) mbLimb(m, [x * o.w * s, H * 0.55 * s, z * L * s], [x * o.w * s, 0.0, z * L * s], lw * s, lw * 0.7 * s, col, 0, 5);
  mbLimb(m, [0, H * 0.9 * s, -L * 0.5 * s], o.tailUp ? [0, H * 1.8 * s, -L * 0.8 * s] : [0, H * 0.7 * s, -L * 0.75 * s], 0.05 * s, 0.02 * s, col, 0, 4);
  return m;
}
function figBat(o) { // vampiro-murciélago (Vargheist / Terrorgheist): cuerpo encorvado, orejas, colmillos y alas de membrana
  const m = mb(), s = o.s || 1, col = o.col || [0.32, 0.3, 0.36], mem = o.mem || [0.22, 0.14, 0.2];
  mbCyl(m, 0, 0.35 * s, 0, 0.3 * s, 0.2 * s, 0.7 * s, 8, col, 0);
  mbBall(m, 0, 1.05 * s, 0.12 * s, 0.2 * s, [0.55, 0.52, 0.55], 0);
  mbBox(m, 0, 0.92 * s, 0.34 * s, 0.14 * s, 0.1 * s, 0.16 * s, [0.55, 0.52, 0.55], 0);
  for (const sx of [-1, 1]) { mbCone(m, sx * 0.13 * s, 1.2 * s, 0.1 * s, 0.07 * s, 0.28 * s, [0.55, 0.52, 0.55], 0, 4); mbCone(m, sx * 0.05 * s, 0.88 * s, 0.4 * s, 0.025 * s, 0.1 * s, [0.95, 0.93, 0.85], 0, 4); mbBall(m, sx * 0.08 * s, 1.1 * s, 0.28 * s, 0.03 * s, [0.9, 0.1, 0.1], 0);
    mbLimb(m, [sx * 0.25 * s, 0.75 * s, 0], [sx * 1.3 * s, 1.35 * s, -0.15 * s], 0.06 * s, 0.03 * s, col, 0, 5); mbSlab(m, sx * 0.8 * s, 0.95 * s, -0.25 * s, 1.1 * s, 0.03, 0.8 * s, mem, 0, sx * 0.25); mbSlab(m, sx * 1.15 * s, 1.1 * s, -0.3 * s, 0.4 * s, 0.03, 0.6 * s, mem, 0, sx * 0.25); mbLimb(m, [sx * 0.1 * s, 0.1 * s, 0], [sx * 0.14 * s, 0.0, 0.14 * s], 0.05 * s, 0.02 * s, col, 0, 4); }
  return m;
}
function figNaga(o) { // medusa / serpiente con torso humanoide: cola enroscada de esferas y busto con cabellera de serpientes
  const m = figSerpent({ s: o.s, col: o.col });
  const s = o.s || 1, sk = o.skin || [0.7, 0.75, 0.6];
  mbCyl(m, 0, 0.55 * s, 0.75 * s, 0.17 * s, 0.14 * s, 0.55 * s, 8, o.top || [0.4, 0.1, 0.12], 0);
  mbBall(m, 0, 1.25 * s, 0.75 * s, 0.13 * s, sk, 0);
  for (let i = 0; i < 6; i++) { const a = i * 1.05; mbLimb(m, [Math.cos(a) * 0.08 * s, 1.34 * s, 0.75 * s + Math.sin(a) * 0.08 * s], [Math.cos(a) * 0.22 * s, 1.2 * s, 0.75 * s + Math.sin(a) * 0.22 * s], 0.035 * s, 0.01, [0.3, 0.55, 0.3], 0, 4); }
  for (const sx of [-1, 1]) mbLimb(m, [sx * 0.16 * s, 1.05 * s, 0.75 * s], [sx * 0.3 * s, 0.85 * s, 0.95 * s], 0.045 * s, 0.03 * s, sk, 0, 4);
  return m;
}
function figCauldron(o) { // Caldero de Sangre: marmita de hierro con patas, líquido rojo, humo y la bruja encima
  const m = mb(), s = o.s || 1;
  mbCyl(m, 0, 0.35 * s, 0, 0.55 * s, 0.7 * s, 0.7 * s, 12, [0.18, 0.17, 0.19], 0);
  mbCyl(m, 0, 1.0 * s, 0, 0.72 * s, 0.7 * s, 0.08 * s, 12, [0.3, 0.28, 0.3], 0);
  mbCyl(m, 0, 1.05 * s, 0, 0.62 * s, 0.62 * s, 0.03 * s, 12, [0.7, 0.05, 0.08], 0);
  for (const [x, z] of [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]]) mbLimb(m, [x * s, 0.4 * s, z * s], [x * 1.1 * s, 0.0, z * 1.1 * s], 0.07 * s, 0.05 * s, [0.15, 0.14, 0.16], 0, 5);
  for (const sx of [-1, 1]) mbLimb(m, [sx * 0.7 * s, 0.9 * s, 0], [sx * 0.9 * s, 0.5 * s, 0], 0.04 * s, 0.03 * s, [0.3, 0.28, 0.3], 0, 4);
  mbCyl(m, 0, 1.1 * s, 0, 0.17 * s, 0.14 * s, 0.4 * s, 8, o.tunic || [0.25, 0.08, 0.3], 0); mbBall(m, 0, 1.62 * s, 0, 0.13 * s, o.skin || [0.82, 0.78, 0.82], 0);
  for (let i = 0; i < 6; i++) { const a = i * 1.05; mbLimb(m, [Math.cos(a) * 0.06 * s, 1.7 * s, Math.sin(a) * 0.06 * s], [Math.cos(a) * 0.2 * s, 1.4 * s, Math.sin(a) * 0.2 * s], 0.03 * s, 0.01, [0.1, 0.08, 0.1], 0, 4); }
  mbLimb(m, [0.15 * s, 1.35 * s, 0], [0.45 * s, 1.5 * s, 0.4 * s], 0.03 * s, 0.02 * s, STEEL, 0, 4);
  return m;
}
function figThrone(o) { // Trono de Sangre / carro de daemon: peana de bronce con respaldo y el Heraldo sentado
  const m = mb(), s = o.s || 1, col = o.col || [0.75, 0.55, 0.2], dm = o.skin || [0.72, 0.1, 0.08];
  mbBox(m, 0, 0.1 * s, 0, 1.1 * s, 0.3 * s, 1.5 * s, col, 0);
  mbBox(m, 0, 0.4 * s, -0.1 * s, 0.7 * s, 0.35 * s, 0.7 * s, o.seat || [0.5, 0.08, 0.08], 0);
  mbBox(m, 0, 0.75 * s, -0.42 * s, 0.7 * s, 0.9 * s, 0.1 * s, col, 0);
  for (const sx of [-1, 1]) { mbCone(m, sx * 0.3 * s, 1.65 * s, -0.42 * s, 0.07 * s, 0.35 * s, col, 0, 5); mbBox(m, sx * 0.32 * s, 0.4 * s, 0.4 * s, 0.14 * s, 0.4 * s, 0.14 * s, col, 0); }
  mbCyl(m, 0, 0.72 * s, -0.08 * s, 0.2 * s, 0.17 * s, 0.4 * s, 8, dm, 0); mbBall(m, 0, 1.2 * s, -0.08 * s, 0.14 * s, dm, 0);
  for (const sx of [-1, 1]) mbLimb(m, [sx * 0.08 * s, 1.28 * s, -0.08 * s], [sx * 0.2 * s, 1.5 * s, -0.08 * s], 0.04 * s, 0.01, [0.9, 0.85, 0.7], 0, 4);
  mbLimb(m, [0.2 * s, 0.9 * s, 0.05 * s], [0.3 * s, 1.4 * s, 0.5 * s], 0.035 * s, 0.02 * s, STEEL, 0, 4);
  return m;
}
function figShrine(o) { // Santuario Sangriento: altar de piedra con pilares, brasero rojo y estatua
  const m = mb(), s = o.s || 1, st = [0.35, 0.33, 0.36];
  mbBox(m, 0, 0.05 * s, 0, 1.6 * s, 0.25 * s, 1.6 * s, st, 0);
  mbBox(m, 0, 0.3 * s, 0, 1.2 * s, 0.2 * s, 1.2 * s, [0.28, 0.26, 0.3], 0);
  for (const [x, z] of [[0.55, 0.55], [-0.55, 0.55], [0.55, -0.55], [-0.55, -0.55]]) { mbCyl(m, x * s, 0.5 * s, z * s, 0.1 * s, 0.1 * s, 1.1 * s, 8, st, 0); mbCone(m, x * s, 1.6 * s, z * s, 0.12 * s, 0.25 * s, [0.5, 0.06, 0.08], 0, 5); }
  mbCyl(m, 0, 0.5 * s, 0, 0.3 * s, 0.2 * s, 0.3 * s, 10, [0.2, 0.18, 0.2], 0); mbBall(m, 0, 0.95 * s, 0, 0.2 * s, [0.95, 0.2, 0.1], 0);
  mbCone(m, 0, 1.1 * s, 0, 0.14 * s, 0.5 * s, [1, 0.5, 0.1], 0, 6);
  return m;
}
function figCart(o) { // carro de mercancías: plataforma, laterales, 2 ruedas, tiro de 2 ponis
  const m = mb(); const W = o.wood || [0.5, 0.34, 0.2];
  mbSlab(m, 0, 0.45, -0.3, 0.55, 0.06, 0.9, W, 0, 0);
  mbSlab(m, -0.28, 0.65, -0.3, 0.04, 0.35, 0.9, W, 0, 0); mbSlab(m, 0.28, 0.65, -0.3, 0.04, 0.35, 0.9, W, 0, 0);
  mbSlab(m, 0, 0.65, -0.74, 0.55, 0.35, 0.04, W, 0, 0);
  for (const sx of [-0.34, 0.34]) for (let a = 0; a < 4; a++) { const t = a * Math.PI / 4, dy = Math.sin(t) * 0.3, dz = Math.cos(t) * 0.3; mbLimb(m, [sx, 0.3 - dy, -0.3 - dz], [sx, 0.3 + dy, -0.3 + dz], 0.03, 0.03, [0.25, 0.18, 0.1], 0, 5); }
  for (const k of (o.load || [[-0.1, 0.9, -0.5], [0.12, 0.88, -0.2]])) mbBox(m, k[0], k[1], k[2], 0.22, 0.22, 0.22, o.cargo || [0.7, 0.55, 0.3], 1);
  mbLimb(m, [-0.12, 0.5, 0.15], [-0.12, 0.6, 0.9], 0.03, 0.03, W, 0, 5); mbLimb(m, [0.12, 0.5, 0.15], [0.12, 0.6, 0.9], 0.03, 0.03, W, 0, 5);
  mbBall(m, 0, 0.95, -0.9, 0.14, o.skin || [0.85, 0.7, 0.6], 0);
  return m;
}
function figPegasusRider(o) { // hechicera sobre pegaso: caballo con alas desplegadas y jinete con sombrero puntiagudo
  const m = mb(); const top = horseMesh(m, { s: o.horn ? 0.7 : 0.85, col: o.col, wings: !o.horn });
  if (o.horn) { mbCone(m, 0, 0.82, 0.78, 0.04, 0.4, [0.95, 0.85, 0.5], 0, 5); mbLimb(m, [0, 0.8, 0.7], [0, 1.0, 0.95], 0.04, 0.01, [0.95, 0.85, 0.5], 0, 4); }
  mbCyl(m, 0, top, -0.05, 0.2, 0.16, 0.45, 9, o.robe, 0); mbBall(m, 0, top + 0.55, -0.05, 0.14, o.skin, 0);
  if (o.hat) { mbCyl(m, 0, top + 0.6, -0.05, 0.3, 0.3, 0.03, 10, o.hat, 0); mbCone(m, 0, top + 0.62, -0.05, 0.17, 0.55, o.hat, 0, 8); } else mbBall(m, 0, top + 0.62, -0.05, 0.12, o.hair || [0.9, 0.9, 0.95], 0);
  mbLimb(m, [0.25, top + 0.05, -0.2], [0.3, top + 0.8, 0.3], 0.025, 0.02, WOOD, 0, 5); mbBall(m, 0.3, top + 0.85, 0.3, 0.07, [0.8, 0.3, 1], 0);
  return m;
}
function figTheropod(o) { // Carnosaurio: bípedo con cabezota dentuda, cola larga, brazos cortos y jinete saurio
  const m = mb(), s = o.s || 1, col = o.col || [0.3, 0.45, 0.25], bel = o.belly || [0.75, 0.7, 0.45];
  mbCyl(m, 0, 0.95 * s, -0.1 * s, 0.4 * s, 0.32 * s, 0.7 * s, 9, col, 0);
  mbBall(m, 0, 1.0 * s, 0.05 * s, 0.38 * s, col, 0);
  mbLimb(m, [0, 1.05 * s, -0.3 * s], [0, 0.75 * s, -1.6 * s], 0.28 * s, 0.03 * s, col, 0, 7);
  mbLimb(m, [0, 1.15 * s, 0.25 * s], [0, 1.55 * s, 0.6 * s], 0.2 * s, 0.17 * s, col, 0, 7);
  mbBox(m, 0, 1.45 * s, 0.85 * s, 0.34 * s, 0.3 * s, 0.6 * s, col, 0); mbBox(m, 0, 1.38 * s, 0.9 * s, 0.3 * s, 0.07 * s, 0.55 * s, bel, 0);
  for (let i = 0; i < 6; i++) { const z = 1.0 + i * 0.08; mbCone(m, (i % 2 ? 0.1 : -0.1) * s, 1.39 * s, z * s, 0.025 * s, 0.1 * s, [0.95, 0.93, 0.85], 0, 4); }
  for (const sx of [-1, 1]) { mbBall(m, sx * 0.14 * s, 1.62 * s, 0.85 * s, 0.045 * s, [0.95, 0.8, 0.2], 0); mbLimb(m, [sx * 0.34 * s, 0.9 * s, -0.1 * s], [sx * 0.4 * s, 0.45 * s, 0.05 * s], 0.2 * s, 0.14 * s, col, 0, 6); mbLimb(m, [sx * 0.4 * s, 0.45 * s, 0.05 * s], [sx * 0.34 * s, 0.0, 0.25 * s], 0.12 * s, 0.08 * s, col, 0, 6); mbLimb(m, [sx * 0.2 * s, 0.85 * s, 0.4 * s], [sx * 0.26 * s, 0.6 * s, 0.6 * s], 0.05 * s, 0.03 * s, col, 0, 4); }
  for (let i = 0; i < 5; i++) mbCone(m, 0, (1.35 - i * 0.07) * s, (0.1 - i * 0.28) * s, 0.06 * s, 0.14 * s, [0.8, 0.35, 0.15], 0, 4);
  if (o.rider) { const t = 1.3 * s; mbCyl(m, 0, t, -0.05 * s, 0.14 * s, 0.12 * s, 0.3 * s, 8, o.tunic || [0.2, 0.5, 0.6], 0); mbBall(m, 0, t + 0.38 * s, -0.05 * s, 0.11 * s, [0.3, 0.55, 0.3], 0); mbCone(m, 0, t + 0.45 * s, -0.05 * s, 0.1 * s, 0.25 * s, [0.9, 0.6, 0.1], 0, 6); mbLimb(m, [0.15 * s, t + 0.1 * s, 0], [0.2 * s, t + 0.7 * s, 0.4 * s], 0.025 * s, 0.015 * s, WOOD, 0, 4); }
  return m;
}
function figManticore(o) { // mantícora: cuerpo de león, alas de membrana, cola de escorpión y jinete
  const m = mb(), s = o.s || 1, col = o.col || [0.55, 0.3, 0.2], mem = o.mem || [0.35, 0.12, 0.2];
  mbBox(m, 0, 0.6 * s, 0, 0.6 * s, 0.55 * s, 1.4 * s, col, 0);
  mbBall(m, 0, 0.95 * s, 0.75 * s, 0.3 * s, col, 0); mbBall(m, 0, 1.0 * s, 0.7 * s, 0.38 * s, o.mane || [0.3, 0.15, 0.1], 0);
  mbBall(m, 0, 0.95 * s, 0.9 * s, 0.22 * s, [0.8, 0.65, 0.5], 0);
  for (const sx of [-1, 1]) { mbCone(m, sx * 0.2 * s, 1.35 * s, 0.7 * s, 0.05 * s, 0.25 * s, [0.9, 0.9, 0.8], 0, 4); mbCone(m, sx * 0.08 * s, 0.78 * s, 1.08 * s, 0.025 * s, 0.1 * s, [0.95, 0.93, 0.85], 0, 4);
    mbLimb(m, [sx * 0.3 * s, 1.0 * s, -0.1 * s], [sx * 1.4 * s, 1.7 * s, -0.4 * s], 0.06 * s, 0.03 * s, col, 0, 5); mbSlab(m, sx * 0.85 * s, 1.25 * s, -0.4 * s, 1.2 * s, 0.03, 0.9 * s, mem, 0, sx * 0.4);
    for (const z of [0.5, -0.5]) mbLimb(m, [sx * 0.22 * s, 0.5 * s, z * s], [sx * 0.24 * s, 0.0, z * s], 0.1 * s, 0.06 * s, col, 0, 5); }
  mbLimb(m, [0, 0.9 * s, -0.7 * s], [0, 1.5 * s, -1.2 * s], 0.09 * s, 0.05 * s, col, 0, 5); mbLimb(m, [0, 1.5 * s, -1.2 * s], [0, 1.9 * s, -0.7 * s], 0.05 * s, 0.03 * s, col, 0, 5); mbCone(m, 0, 1.9 * s, -0.7 * s, 0.05 * s, 0.25 * s, [0.8, 0.2, 0.1], 0, 5);
  if (o.rider) { const t = 0.88 * s; mbCyl(m, 0, t, 0.05 * s, 0.17 * s, 0.14 * s, 0.4 * s, 8, o.tunic, 0); mbBall(m, 0, t + 0.5 * s, 0.05 * s, 0.13 * s, o.skin, 0); mbCyl(m, 0, t + 0.52 * s, 0.05 * s, 0.15 * s, 0.13 * s, 0.14 * s, 8, [0.2, 0.2, 0.28], 0); mbLimb(m, [0.2 * s, t + 0.1 * s, 0], [0.25 * s, t + 0.8 * s, 0.4 * s], 0.025 * s, 0.015 * s, WOOD, 0, 4); }
  return m;
}
function figSpecial(d, r) {
  switch (d.id) {
    case 'arachnarok': return figSpider({ col: [0.16, 0.13, 0.14], s: 1.6, lat: 0.6, dk: [0.07, 0.05, 0.05], eye: [0.95, 0.5, 0.1], rider: true });
    case 'spider_riders': return figSpider({ col: [0.2, 0.16, 0.14], s: 0.7, lat: 0.45, rider: true, tunic: [0.35, 0.3, 0.22] });
    case 'squig_hoppers': return figSquig({ col: [0.85, 0.3, 0.2], s: 0.9, spots: [0.95, 0.75, 0.3] });
    case 'bm_harpies': return figHarpy({ s: 0.6 });
    case 'he_ship': return figShip({ s: 0.5 });
    case 'he_merwyrm': return figSerpent({ s: 1.05 });
    case 'we_pack_cats': case 'we_pack_cats_sk': return figPackBeast({ col: [0.78, 0.6, 0.3], snout: [0.9, 0.8, 0.6], w: 0.32, h: 0.38, len: 1.15, ear: 0.12, tailUp: true, stripes: [0.25, 0.15, 0.08], leg: 0.06, s: 0.75 });
    case 'we_pack_boars': case 'we_pack_boars_sk': return figPackBeast({ col: [0.32, 0.22, 0.16], snout: [0.25, 0.17, 0.13], w: 0.42, h: 0.5, len: 0.95, ear: 0.1, tusks: true, hump: true, leg: 0.07, s: 0.85 });
    case 'we_pack_bears': case 'we_pack_bears_sk': return figPackBeast({ col: [0.36, 0.26, 0.18], snout: [0.55, 0.42, 0.3], w: 0.6, h: 0.8, len: 1.1, ear: 0.09, hump: true, leg: 0.13, s: 0.85 });
    case 'vc_terrorgheist': return figBat({ s: 1.5, col: [0.4, 0.36, 0.34] });
    case 'vc_vargheists': return figBat({ s: 0.55 });
    case 'woc_skinwolves': return figPackBeast({ col: [0.45, 0.42, 0.4], snout: [0.35, 0.32, 0.3], w: 0.34, h: 0.5, len: 1.1, ear: 0.14, tailUp: false, leg: 0.07, s: 0.65 });
    case 'tk_necroserpent': return figSerpent({ s: 1.0, col: [0.8, 0.68, 0.35] });
    case 'de_medusa': return figNaga({ s: 0.5, col: [0.25, 0.3, 0.5] });
    case 'he_woodsmen': return figInfantry({ h: 1.2, r: r * 0.9, skin: [0.85, 0.72, 0.58], tunic: [0.25, 0.42, 0.25], legs: [0.35, 0.28, 0.2], helm: 'hood', hat: [0.2, 0.35, 0.2], weapon: 'bow', cape: [0.3, 0.45, 0.3] });
    case 'de_deathhag_cauldron': return figCauldron({ s: 0.85 });
    case 'dm_herald_khorne_throne': return figThrone({ s: 0.85 });
    case 'dm_herald_slaanesh_exalted': return figThrone({ s: 0.85, col: [0.75, 0.3, 0.6], seat: [0.35, 0.1, 0.4], skin: [0.75, 0.45, 0.7] });
    case 'de_shrine': return figShrine({ s: 0.9 });
    case 'de_sorceress_pegasus': return figPegasusRider({ col: [0.12, 0.1, 0.14], robe: [0.3, 0.1, 0.4], skin: [0.82, 0.78, 0.84], hat: [0.2, 0.08, 0.3] });
    case 'de_supreme_pegasus': return figPegasusRider({ col: [0.12, 0.1, 0.14], robe: [0.5, 0.08, 0.15], skin: [0.82, 0.78, 0.84], hat: [0.4, 0.06, 0.12] });
    case 'lm_oldblood_carno': return figTheropod({ s: 1.0, rider: true });
    case 'lm_scar_carno': return figTheropod({ s: 1.0, rider: true, col: [0.2, 0.35, 0.5], belly: [0.8, 0.75, 0.55], tunic: [0.6, 0.3, 0.15] });
    case 'de_dreadlord_manticore': return figManticore({ s: 0.7, rider: true, tunic: [0.22, 0.1, 0.32], skin: [0.78, 0.74, 0.82] });
    case 'de_beastmaster_manticore': return figManticore({ s: 0.7, rider: true, tunic: [0.3, 0.12, 0.12], skin: [0.78, 0.74, 0.82], col: [0.4, 0.3, 0.25] });
    case 'de_dreadlord_chariot': case 'de_master_chariot': case 'de_beastmaster_chariot': return figChariot({ wood: [0.13, 0.1, 0.17], trim: [0.55, 0.08, 0.15], beast: [0.22, 0.38, 0.32], bs: 0.85, crew: [0.78, 0.74, 0.82], helm: [0.2, 0.2, 0.28] });
    case 'he_stormweaver_uni': return figPegasusRider({ horn: true, col: [0.92, 0.92, 0.95], robe: [0.2, 0.4, 0.8], skin: [0.9, 0.78, 0.65], hat: null, hair: [0.85, 0.9, 0.95] });
    case 'br_elisse': return figRider({ s: 0.85, col: [0.95, 0.95, 0.97], skin: [0.92, 0.8, 0.7], tunic: [0.2, 0.3, 0.7], armor: [0.8, 0.8, 0.85], helm: 'none', cape: [0.2, 0.3, 0.7], sword: true });
    case 'dw_engineer': case 'dw_sapper': return figInfantry({ h: 1.0, r: r * 0.9, skin: [0.85, 0.65, 0.55], tunic: [0.4, 0.3, 0.2], legs: [0.3, 0.25, 0.2], armor: [0.5, 0.45, 0.4], helm: 'hood', hat: [0.45, 0.35, 0.2], weapon: 'axe', cape: d.id === 'dw_sapper' ? [0.35, 0.25, 0.15] : null });
    case 'goods_cart': case 'dw_cart': return figCart({});
    case 'dw_cart_miner': return figCart({ cargo: [0.35, 0.35, 0.4] });
    case 'he_ishaya': return figInfantry({ h: 1.3, r: r * 0.9, skin: [0.9, 0.78, 0.65], tunic: [0.95, 0.92, 0.85], legs: [0.9, 0.85, 0.75], robe: [0.95, 0.92, 0.85], armor: null, helm: 'none', hair: [0.95, 0.85, 0.5], weapon: 'staff', cape: [0.85, 0.7, 0.3] });
    case 'he_stormweaver': return figInfantry({ h: 1.3, r: r * 0.9, skin: [0.9, 0.78, 0.65], tunic: [0.2, 0.4, 0.75], legs: [0.2, 0.35, 0.65], robe: [0.2, 0.4, 0.8], armor: null, helm: 'none', hair: [0.85, 0.9, 0.95], weapon: 'staff', cape: [0.75, 0.85, 0.95] });
    case 'dm_bloodletters': return figInfantry({ h: 1.0, r: r * 1.0, skin: [0.72, 0.1, 0.08], tunic: [0.5, 0.07, 0.06], legs: [0.62, 0.1, 0.08], armor: [0.32, 0.28, 0.28], helm: 'horns', weapon: 'sword', belt: false });
    case 'vc_thrall': return figInfantry({ h: 1.2, r: r * 0.9, skin: [0.85, 0.86, 0.9], tunic: [0.14, 0.1, 0.17], legs: [0.1, 0.08, 0.12], armor: [0.3, 0.28, 0.32], helm: 'none', hair: [0.1, 0.1, 0.12], cape: [0.55, 0.06, 0.08], weapon: 'sword' });
    case 'de_dreadlord': case 'de_master': return figInfantry({ h: 1.3, r: r * 0.9, skin: [0.78, 0.74, 0.82], tunic: [0.22, 0.1, 0.32], legs: [0.12, 0.1, 0.16], armor: [0.2, 0.2, 0.28], helm: 'plume', plume: [0.6, 0.08, 0.12], cape: [0.3, 0.1, 0.4], weapon: d.id === 'de_master' ? 'sword' : 'spear' });
    case 'sk_greyseer': return figInfantry({ h: 1.1, r: r * 0.9, skin: [0.45, 0.4, 0.36], tunic: [0.4, 0.37, 0.33], legs: [0.3, 0.28, 0.26], robe: [0.45, 0.42, 0.38], helm: 'hood', hat: [0.38, 0.35, 0.32], weapon: 'staff', ears: true });
    default: return null;
  }
}
export function makeFigure(d) {
  { const sp0 = figSpecial(d, Math.min(d.baseW, d.baseD) / 25.4 * 0.33); if (sp0) return sp0; } // por id original (antes de resolver alias)
  if (FIG_ALIAS[d.id]) d = { ...d, id: FIG_ALIAS[d.id] };
  if (d.tt === 'monCreature' || d.tt === 'behemoth') {
    if (d.id === 'dw_gyrobomber') return figGyro();
    const C = { he_prince_griffon: [[0.75, 0.6, 0.35], [0.9, 0.85, 0.75]], he_prince_moon: [[0.75, 0.78, 0.85], [0.85, 0.88, 0.95]], he_archmage_moon: [[0.75, 0.78, 0.85], [0.85, 0.88, 0.95]], he_dragonmage: [[0.85, 0.55, 0.15], [0.9, 0.7, 0.3]],
      he_flamespyre: [[0.9, 0.4, 0.1], [1, 0.75, 0.2]], he_frostheart: [[0.6, 0.8, 0.95], [0.85, 0.95, 1]], woc_lord_manticore: [[0.55, 0.25, 0.2], [0.4, 0.15, 0.12]], woc_sorc_manticore: [[0.55, 0.25, 0.2], [0.4, 0.15, 0.12]], woc_lord_dragon: [[0.25, 0.2, 0.25], [0.45, 0.1, 0.1]],
      woc_chimera: [[0.5, 0.35, 0.2], [0.35, 0.25, 0.15]], tk_warsphinx: [[0.8, 0.72, 0.5], [0.85, 0.68, 0.25]], tk_scorpion: [[0.7, 0.6, 0.4], [0.5, 0.4, 0.25]], tk_colossus: [[0.75, 0.68, 0.5], [0.85, 0.68, 0.25]], tk_necrosphinx: [[0.75, 0.68, 0.5], [0.85, 0.68, 0.25]],
      orc_warboss_wyvern: [[0.3, 0.4, 0.25], [0.5, 0.3, 0.2]], arachnarok: [[0.15, 0.12, 0.12], [0.5, 0.15, 0.1]], mangler_squig: [[0.78, 0.22, 0.15], [0.9, 0.8, 0.6]], orc_giant: [[0.75, 0.6, 0.45], [0.45, 0.35, 0.25]],
      bm_shaggoth: [[0.45, 0.4, 0.35], [0.3, 0.3, 0.32]], bm_jabberslythe: [[0.35, 0.5, 0.3], [0.5, 0.6, 0.3]], bm_cockatrice: [[0.5, 0.6, 0.35], [0.8, 0.5, 0.2]], bm_cygor: [[0.6, 0.5, 0.4], [0.45, 0.38, 0.3]], tk_king_dragon: [[0.82, 0.78, 0.65], [0.55, 0.45, 0.25]], tk_hpriest_dragon: [[0.82, 0.78, 0.65], [0.55, 0.45, 0.25]], he_noble_sun: [[0.85, 0.55, 0.15], [0.9, 0.7, 0.3]], he_prince_sun: [[0.85, 0.55, 0.15], [0.9, 0.7, 0.3]], he_noble_eagle: [[0.45, 0.32, 0.2], [0.9, 0.75, 0.3]], he_mage_eagle: [[0.45, 0.32, 0.2], [0.9, 0.75, 0.3]], he_noble_griffon: [[0.75, 0.6, 0.35], [0.9, 0.85, 0.75]], he_prince_star: [[0.85, 0.88, 0.95], [0.6, 0.7, 0.95]], he_archmage_star: [[0.85, 0.88, 0.95], [0.6, 0.7, 0.95]], we_lord_dragon: [[0.32, 0.5, 0.28], [0.65, 0.55, 0.3]], we_lord_eagle: [[0.45, 0.32, 0.2], [0.9, 0.75, 0.3]], we_eagle: [[0.45, 0.32, 0.2], [0.9, 0.75, 0.3]] }[d.id] || [[0.5, 0.4, 0.3], [0.4, 0.3, 0.2]];
    const big = d.tt === 'behemoth' ? 1.9 : 1.5;
    if (['tk_colossus', 'bm_cygor', 'bm_shaggoth', 'bm_giant', 'orc_giant'].includes(d.id)) return figInfantry({ h: 2.6, r: 0.75, skin: C[0], tunic: C[1], legs: C[0], weapon: d.id === 'bm_cygor' ? 'club' : 'greatsword', headR: 0.45, lean: 0.12, helm: d.id === 'tk_colossus' ? 'steel' : 'horns', belt: true });
    return figBeast({ col: C[0], snout: C[1], s: big, skin: d.cat === 'char' ? SKIN : C[0], noRider: d.cat !== 'char' && d.id !== 'tk_warsphinx', wings: d.sr.includes('flyer') ? C[1] : null, tusks: /manticore|chimera|dragon|moon|star/.test(d.id), tunic: d.cat === 'char' ? C[1] : null, rr: 0.3 });
  }
  if (d.tt === 'lightChar' || d.tt === 'heavyChar') {
    const f = d.faction;
    if (f === 'he') return figChariot(d.id === 'he_lionchariot' ? { wood: [0.9, 0.88, 0.82], trim: [0.85, 0.7, 0.3], beast: [0.92, 0.9, 0.85], bs: 0.9, crew: [0.9, 0.88, 0.82], helm: [0.85, 0.7, 0.3], blades: true } : { wood: [0.9, 0.88, 0.82], trim: [0.2, 0.4, 0.75], beast: [0.9, 0.9, 0.9], crew: [0.2, 0.4, 0.75], helm: [0.78, 0.8, 0.86] });
    if (f === 'tk') return figChariot({ wood: [0.75, 0.6, 0.3], trim: [0.2, 0.35, 0.6], beast: [0.86, 0.82, 0.68], crew: [0.86, 0.82, 0.68], skin: [0.86, 0.82, 0.68], helm: [0.85, 0.68, 0.25] });
    if (f === 'woc') return figChariot({ wood: [0.22, 0.2, 0.22], trim: [0.5, 0.1, 0.08], beast: d.id === 'woc_gorechariot' ? [0.45, 0.25, 0.2] : [0.15, 0.12, 0.12], n: 0, beasts: d.id === 'woc_gorechariot' ? 1 : 2, bs: d.id === 'woc_gorechariot' ? 1.3 : 0.85, horns: d.id === 'woc_gorechariot', crew: [0.22, 0.2, 0.22], helm: [0.3, 0.28, 0.3], blades: true });
    if (d.id === 'steam_tank') { const m = mb(); mbCyl(m, 0, 0.2, 0, 1.0, 0.8, 1.2, 12, [0.55, 0.45, 0.25], 0); mbCyl(m, 0, 1.4, 0, 0.5, 0.15, 0.6, 10, [0.6, 0.5, 0.3], 0); mbLimb(m, [0, 0.9, 0.4], [0, 1.0, 1.6], 0.14, 0.12, [0.3, 0.3, 0.32], 0, 8); mbLimb(m, [0.3, 1.5, -0.3], [0.3, 2.4, -0.4], 0.1, 0.08, [0.2, 0.2, 0.2], 0, 6); for (const sx of [-1, 1]) mbCyl(m, sx * 0.95, 0.0, 0, 0.45, 0.45, 0.12, 12, [0.3, 0.3, 0.3], 0); return m; }
    if (f === 'empire') return figChariot({ wood: [0.75, 0.6, 0.25], trim: [0.85, 0.75, 0.3], beast: [0.9, 0.9, 0.88], crew: [0.85, 0.8, 0.7], helm: [0.85, 0.7, 0.3] });
    if (f === 'orcs') return figChariot(d.id === 'orc_boar_chariot' ? { wood: [0.4, 0.28, 0.18], trim: [0.5, 0.15, 0.1], beast: [0.38, 0.22, 0.16], bs: 0.8, crew: [0.42, 0.34, 0.24], skin: ORC, blades: true } : d.id === 'wolf_chariot' ? { wood: [0.45, 0.32, 0.2], trim: [0.2, 0.2, 0.2], beast: [0.42, 0.42, 0.44], crew: [0.3, 0.25, 0.2], skin: GOB } : { wood: [0.35, 0.3, 0.25], trim: [0.5, 0.45, 0.2], beasts: 0, crew: [0.4, 0.6, 0.3], skin: [0.4, 0.6, 0.3] });
    return figChariot({ wood: [0.4, 0.28, 0.18], trim: [0.3, 0.2, 0.15], beast: [0.38, 0.22, 0.16], beasts: d.id === 'bm_razorchariot' ? 1 : 2, bs: d.id === 'bm_razorchariot' ? 1.25 : 0.85, horns: true, crew: [0.42, 0.3, 0.2], skin: [0.55, 0.42, 0.3], blades: true });
  }
  const id = d.id, wood = d.faction === 'wood', orcs = d.faction === 'orcs', bret = d.faction === 'bret', emp = d.faction === 'empire';
  const r = Math.min(d.baseW, d.baseD) / 25.4 * 0.33;
  const mounted = d.cat === 'cav' || d.mount;
  const lanc = !!d.lance, hero = d.cat === 'char';
  if (d.faction === 'tk') {
    const BONE = [0.86, 0.82, 0.68], GOLD = [0.85, 0.68, 0.25], BLUE = [0.2, 0.35, 0.6];
    if (id === 'tk_catapult') return figLobber();
    if (id === 'tk_casket') { const m = mb(); mbBox(m, 0, 0.3, 0, 1.2, 0.6, 0.8, GOLD, 0); mbBox(m, 0, 0.75, 0, 0.9, 0.3, 0.6, BLUE, 0); for (const sx of [-1, 1]) mbLimb(m, [sx * 0.75, 0, -0.6], [sx * 0.75, 0.9, 0.6], 0.04, 0.04, WOOD, 0, 4); return m; }
    if (id === 'tk_swarm') return figBeast({ col: [0.25, 0.22, 0.15], snout: [0.4, 0.35, 0.2], s: 0.5, noRider: true });
    if (id === 'tk_stalkers') return figBeast({ col: [0.6, 0.5, 0.35], snout: [0.85, 0.68, 0.25], s: 1.5, skin: BONE, rr: 0.32 });
    if (id === 'tk_carrion') return figBeast({ col: [0.25, 0.2, 0.2], snout: [0.8, 0.75, 0.6], s: 0.9, skin: BONE, rr: 0.2 });
    if (id === 'tk_necroknights') return figBeast({ col: [0.25, 0.4, 0.35], snout: [0.3, 0.45, 0.4], s: 1.6, skin: BONE, rr: 0.32 });
    if (mounted || d.cat === 'cav') return figRider({ s: 1.0, skin: BONE, lance: false, spear: !!d.spear, helm: 'steel', plume: null, cape: hero, col: BONE, armor: GOLD, capar: hero, caparCol: BLUE });
    const big = d.tt === 'monInf';
    const o = { h: big ? 1.9 : 1.1, r: big ? 0.6 : r * 0.95, skin: BONE, tunic: BLUE, legs: BONE, armor: d.arm !== 'none' ? GOLD : null, helm: 'steel', weapon: d.ranged ? 'bow' : d.melee?.thrust ? 'spear' : d.melee?.sb ? 'halberd' : 'sword', shield: !!d.avOpt?.shield, shieldCol: GOLD, belt: true };
    if (d.wizard) Object.assign(o, { weapon: 'staff', robe: [0.85, 0.8, 0.6], helm: 'pointy', hat: BLUE });
    if (hero) Object.assign(o, { cape: BLUE, h: 1.35 });
    return figInfantry(o);
  }
  if (d.faction === 'he') {
    const WH = [0.92, 0.9, 0.85], BL = [0.2, 0.4, 0.75], SIL = [0.78, 0.8, 0.86], GOLD = [0.85, 0.7, 0.3];
    if (d.cat === 'mach') return figBolt();
    if (id === 'he_eagle') return figBeast({ col: [0.45, 0.32, 0.2], snout: [0.9, 0.75, 0.3], s: 1.3, skin: WH, rr: 0.01 });
    if (mounted || d.cat === 'cav') return figRider({ s: 1.0, skin: SKIN, lance: !!d.lance, spear: !!d.spear && !d.lance, helm: 'steel', plume: id === 'he_dragonprinces' ? [0.75, 0.15, 0.1] : WH, cape: hero, col: WH, armor: id === 'he_dragonprinces' ? GOLD : SIL, capar: !!d.avOpt?.barding, caparCol: id === 'he_dragonprinces' ? [0.6, 0.12, 0.1] : BL, tunic: BL });
    const o = { h: 1.2, r: r * 0.9, skin: SKIN, tunic: BL, legs: WH, armor: d.arm === 'none' ? null : SIL, helm: 'plume', plume: WH, robe: null,
      weapon: d.ranged && !d.melee?.thrust ? 'bow' : d.melee?.thrust && !d.melee?.sb ? 'spear' : d.melee?.thrust ? 'halberd' : d.melee?.sb ? 'greatsword' : 'sword', shield: !!d.avOpt?.shield, shieldCol: BL };
    if (id === 'he_whitelions') Object.assign(o, { cape: WH, helm: 'steel', weapon: 'cleaver' });
    if (id === 'he_phoenix') Object.assign(o, { cape: [0.75, 0.2, 0.1], armor: GOLD });
    if (id === 'he_shadow') Object.assign(o, { tunic: [0.15, 0.17, 0.2], legs: [0.12, 0.12, 0.14], helm: 'hood', hat: [0.1, 0.12, 0.15], armor: null });
    if (id === 'he_sisters' || id === 'he_handmaiden') Object.assign(o, { tunic: [0.3, 0.55, 0.3], helm: 'none', hair: [0.95, 0.85, 0.5], weapon: 'bow' });
    if (id.startsWith('he_seaguard')) o.tunic = [0.15, 0.35, 0.55];
    if (d.wizard) Object.assign(o, { weapon: 'staff', robe: WH, helm: 'none', hair: [0.95, 0.92, 0.85], armor: null });
    if (hero) Object.assign(o, { h: 1.4, cape: o.cape || BL });
    return figInfantry(o);
  }
  if (d.faction === 'dw') {
    const STD = [0.56, 0.57, 0.62], GRM = [0.36, 0.37, 0.42], BLUE = [0.18, 0.3, 0.55], RED = [0.55, 0.14, 0.1], BEARD = [0.72, 0.5, 0.28];
    if (id === 'dw_anvil') { const m = mb(); mbBox(m, 0, 0.2, 0, 1.4, 0.4, 1.4, [0.45, 0.45, 0.48], 0); mbBox(m, 0, 0.7, 0, 0.5, 0.6, 0.7, [0.3, 0.3, 0.33], 0); mbBox(m, 0, 1.1, 0, 0.9, 0.25, 0.5, [0.75, 0.6, 0.25], 0); return m; }
    if (id === 'dw_gyrobomber') return figGyro();
    if (d.cat === 'mach') return id === 'dw_cannon' ? figCannon(true) : id === 'dw_organ' ? figOrgan() : id === 'dw_grudge' ? figLobber() : id === 'dw_bolt' ? figBolt() : figCannon(false);
    if (id === 'dw_gyro') return figGyro();
    const slayer = /slayer/.test(id), gun = d.ranged && (d.ranged.ab === 1 || d.ranged.flaming || id === 'dw_engineer');
    const o = { h: 0.9, r: r * 1.25, skin: SKIN, headR: 0.56, beard: slayer ? [0.85, 0.35, 0.1] : ['dw_longbeards', 'dw_king'].includes(id) ? [0.88, 0.88, 0.86] : BEARD,
      tunic: slayer ? SKIN : BLUE, legs: slayer ? [0.35, 0.25, 0.18] : BLUE, armor: d.arm === 'none' ? null : ['dw_ironbreakers', 'dw_irondrakes'].includes(id) ? GRM : STD, helm: slayer ? 'none' : 'steel',
      weapon: d.ranged ? (gun ? 'gun' : 'crossbow') : id === 'dw_hammerers' ? 'hammer' : d.melee?.sb ? 'greatsword' : 'cleaver', shield: !!d.avOpt?.shield, shieldCol: [0.62, 0.5, 0.24] };
    if (slayer) o.hair = [0.9, 0.38, 0.1];
    if (id === 'dw_engineer') o.weapon = 'gun';
    if (d.runeLore) Object.assign(o, { weapon: 'staff', robe: [0.35, 0.2, 0.12] });
    if (hero) Object.assign(o, { h: 1.0, r: r * 1.35, cape: slayer ? null : RED, crest: null });
    if (id === 'dw_king') Object.assign(o, { helm: 'plume', plume: [0.85, 0.66, 0.2], weapon: 'hammer' });
    return figInfantry(o);
  }
  if (d.faction === 'woc') {
    const IRON = [0.22, 0.2, 0.22], FUR = [0.4, 0.3, 0.2];
    if (mounted || d.cat === 'cav') { if (id === 'woc_hounds') return figBeast({ col: [0.35, 0.22, 0.2], snout: [0.3, 0.2, 0.15], s: 0.95, skin: [0.6, 0.45, 0.4], tusks: true, rr: 0.2 }); return figRider({ s: 1.05, skin: SKIN, lance: !!d.lance, spear: !!d.spear, helm: 'steel', plume: null, crest: [0.55, 0.1, 0.1], cape: hero, col: id === 'woc_horsemen' ? [0.45, 0.32, 0.2] : [0.15, 0.13, 0.13], armor: id === 'woc_horsemen' ? null : IRON, capar: id !== 'woc_horsemen', caparCol: [0.35, 0.08, 0.08] }); }
    const marauder = /marauder/.test(id), big = d.tt === 'monInf' || d.us >= 3;
    const o = { h: big ? 1.8 : 1.15, r: big ? 0.62 : r * 1.1, skin: big ? [0.55, 0.45, 0.4] : SKIN, tunic: marauder ? FUR : IRON, armor: marauder ? null : IRON, legs: marauder ? FUR : IRON, helm: marauder ? 'steel' : 'horns', weapon: d.melee?.sb >= 2 ? 'greatsword' : d.melee?.sb === 1 ? 'halberd' : 'cleaver', shield: !!d.avOpt?.shield, shieldCol: [0.35, 0.08, 0.08] };
    if (id === 'woc_trolls') Object.assign(o, { skin: [0.35, 0.4, 0.45], tunic: [0.3, 0.25, 0.2], armor: null, helm: 'none', weapon: 'club', tusks: true });
    if (d.wizard) Object.assign(o, { weapon: 'staff', robe: [0.25, 0.1, 0.3] });
    if (hero) Object.assign(o, { cape: [0.4, 0.06, 0.06], h: big ? 2.0 : 1.4 });
    return figInfantry(o);
  }
  if (d.faction === 'bm') {
    const FUR = [0.42, 0.3, 0.2], HIDE = [0.55, 0.42, 0.3];
    if (mounted || d.cat === 'cav') return figBeast({ col: id === 'bm_hounds' ? [0.35, 0.22, 0.2] : FUR, snout: [0.3, 0.2, 0.15], s: id === 'bm_dragon_ogres' ? 1.5 : 1.05, skin: HIDE, ears: id !== 'bm_hounds', rr: 0.26, tusks: id === 'bm_hounds' });
    const big = d.tt === 'monInf' || d.us >= 3;
    const o = { h: big ? 1.8 : 1.1, r: big ? 0.6 : r * 1.05, skin: HIDE, tunic: FUR, legs: FUR, helm: 'horns', headR: 0.52, lean: 0.12, belt: true, weapon: d.melee?.sb ? 'greatsword' : d.ranged ? 'bow' : 'cleaver', shield: !!d.avOpt?.shield, armor: d.arm === 'heavy' ? [0.35, 0.33, 0.32] : null };
    if (id === 'bm_harpies') Object.assign(o, { h: 1.0, helm: 'none', weapon: null, cape: [0.3, 0.25, 0.25], skin: [0.6, 0.5, 0.45] });
    if (d.wizard) Object.assign(o, { weapon: 'staff', robe: [0.35, 0.28, 0.2] });
    if (hero) Object.assign(o, { cape: true, h: big ? 2.0 : 1.35 });
    return figInfantry(o);
  }
  if (d.cat === 'mach') { if (id === 'great_cannon') return figCannon(true); if (id === 'rock_lobber') return figLobber(); if (id === 'bolt_throwa') return figBolt(); if (id === 'br_trebuchet') return figTrebuchet(); return figCannon(false); }
  if (id === 'spider_riders') return figBeast({ col: [0.15, 0.12, 0.12], snout: [0.5, 0.15, 0.1], s: 1.0, skin: GOB, ears: true, rr: 0.2 });
  if (id === 'squig_hoppers') return figBeast({ col: [0.75, 0.2, 0.15], snout: [0.85, 0.75, 0.6], s: 0.85, skin: GOB, ears: true, rr: 0.2 });
  if (id === 'squig_herd') return figBeast({ col: [0.78, 0.22, 0.15], snout: [0.9, 0.8, 0.6], s: 0.6, noRider: true });
  if (id === 'snotlings') return figBeast({ col: [0.4, 0.6, 0.3], snout: [0.45, 0.65, 0.35], s: 0.45, noRider: true });
  if (id === 'doom_diver') return figLobber();
  if (id === 'wolf_riders') return figBeast({ col: [0.42, 0.42, 0.44], snout: [0.3, 0.3, 0.32], s: 0.95, skin: GOB, ears: true, rr: 0.2 });
  if (id === 'boar_boyz') return figBeast({ col: [0.38, 0.22, 0.16], tusks: true, s: 1.05, skin: ORC, rr: 0.28 });
  if (id === 'orc_warboss_boar') return figBeast({ col: [0.34, 0.2, 0.14], tusks: true, s: 1.15, skin: ORC, rr: 0.32 });
  if (mounted) {
    const o = { s: bret ? 1.05 : 1, skin: SKIN, lance: lanc, spear: !!d.spear, helm: 'steel', plume: bret || emp ? [0.95, 0.95, 0.95] : null, cape: hero, col: bret ? [0.9, 0.9, 0.88] : [0.45, 0.32, 0.2], barding: null };
    if (id === 'br_grail') o.col = [0.95, 0.95, 0.95];
    if (id === 'br_questing') o.sword = true;
    if (id === 'br_pegasus') { o.wings = true; o.col = [0.97, 0.97, 0.97]; }
    if (/^empire_.*_peg$/.test(id)) { o.wings = true; o.col = [0.97, 0.97, 0.97]; o.s = 1.15; }
    if (/^empire_.*_demi$/.test(id)) { o.col = [0.62, 0.48, 0.3]; o.s = 1.25; }
    if (id === 'empire_knights') o.armor = STEEL;
    if (bret || emp) o.armor = STEEL;
    if (id === 'empire_knights') Object.assign(o, { capar: true, s: 1.05, plume: [0.9, 0.2, 0.15] });
    if (id === 'empire_general_h') Object.assign(o, { capar: true, s: 1.12, banner: true, sword: true, crest: [0.9, 0.75, 0.2], col: [0.12, 0.1, 0.1] });
    if (id === 'br_duke' || id === 'br_baron' || id === 'br_paladin') Object.assign(o, { capar: true, s: id === 'br_duke' ? 1.18 : 1.12, banner: id !== 'br_paladin', crest: id === 'br_duke' ? [0.95, 0.8, 0.2] : [0.95, 0.95, 0.95], sword: true, lance: id === 'br_paladin' || id === 'br_baron' });
    if (bret && (id === 'br_knights' || id === 'br_questing' || id === 'br_grail')) o.capar = true;
    return figRider(o);
  }
  if (wood) {
    const LEAF = [0.22, 0.5, 0.3], BARK = [0.36, 0.26, 0.17];
    if (id === 'we_treeman' || id === 'we_ancient') return figInfantry({ h: 2.6, r: 0.75, skin: BARK, tunic: BARK, weapon: 'club', headR: 0.5, lean: 0.1, legs: BARK, belt: false, canopy: id === 'we_ancient' ? [0.28, 0.5, 0.2] : [0.2, 0.45, 0.22] });
    if (id === 'we_treekin') return figInfantry({ h: 1.9, r: 0.6, skin: BARK, tunic: BARK, weapon: 'club', headR: 0.42, lean: 0.15, legs: BARK, belt: false, canopy: [0.24, 0.48, 0.22] });
    if (id === 'we_dryads' || id === 'we_branchwraith') return figInfantry({ h: 1.2, r, skin: [0.45, 0.35, 0.22], tunic: [0.3, 0.55, 0.25], weapon: id === 'we_branchwraith' ? 'staff' : null, helm: 'none', cape: false, legs: [0.35, 0.28, 0.18], hair: id === 'we_branchwraith' ? [0.3, 0.55, 0.25] : [0.28, 0.42, 0.18] });
    if (/^we_pack_/.test(id)) { const PC = { we_pack_hounds: [[0.35, 0.3, 0.25], [0.5, 0.42, 0.3], 0.75], we_pack_cats: [[0.55, 0.45, 0.25], [0.3, 0.25, 0.15], 0.7], we_pack_boars: [[0.3, 0.22, 0.16], [0.85, 0.8, 0.7], 0.8], we_pack_bears: [[0.32, 0.22, 0.14], [0.45, 0.32, 0.2], 1.1] }[id]; return figBeast({ col: PC[0], snout: PC[1], s: PC[2], noRider: true, tusks: id === 'we_pack_boars' }); }
    if (id === 'we_orion') return figInfantry({ h: 2.2, r: 0.7, skin: [0.55, 0.4, 0.28], tunic: [0.3, 0.45, 0.22], weapon: 'spear', headR: 0.42, lean: 0.1, helm: 'horns', legs: [0.35, 0.28, 0.18], belt: true, cape: true });
    if (id === 'we_lord_stag' || id === 'we_captain_stag') return figRider({ s: 1.25, skin: SKIN, helm: 'none', plume: null, cape: true, col: [0.55, 0.4, 0.25], antlers: true, sword: true, spear: true });
    if (id === 'we_weaver_unicorn' || id === 'we_singer_unicorn') return figRider({ s: 1.15, skin: SKIN, helm: 'none', plume: null, cape: true, col: [0.95, 0.95, 0.92], antlers: false, sword: false, spear: true });
    if (id === 'we_captain_hawk') return figRider({ s: 1.1, skin: SKIN, helm: 'none', plume: null, cape: true, col: [0.62, 0.45, 0.3], armor: null, wings: [0.55, 0.4, 0.25], spear: true });
    if (id === 'we_sisters') return figRider({ s: 0.95, skin: SKIN, helm: 'none', plume: null, cape: false, col: [0.35, 0.3, 0.3], armor: null, spear: true });
    if (id === 'we_lord_h') return figRider({ s: 1.1, skin: SKIN, helm: 'none', plume: null, cape: true, col: [0.85, 0.82, 0.72], antlers: true, sword: true, spear: true });
    if (mounted) return figRider({ s: id === 'we_warhawks' ? 1.1 : 0.95, skin: SKIN, lance: !!d.lance, spear: false, helm: 'none', plume: null, cape: hero, col: id === 'we_warhawks' ? [0.62, 0.45, 0.3] : [0.82, 0.78, 0.7], armor: null, wings: id === 'we_warhawks' });
    const wb = { h: 1.15, r: r * 0.9, skin: SKIN, helm: 'hat', hat: [0.2, 0.42, 0.25], armor: null, tunic: LEAF, weapon: null };
    if (['we_glade_guard', 'we_lord', 'we_captain', 'we_scouts', 'we_waywatchers', 'we_waystalker'].includes(id)) wb.weapon = 'bow';
    if (id === 'we_scouts' || id === 'we_waywatchers' || id === 'we_waystalker') { wb.hat = [0.25, 0.3, 0.2]; wb.tunic = [0.3, 0.36, 0.24]; wb.cape = true; }
    if (id === 'we_araloth') { wb.weapon = 'spear'; wb.armor = [0.6, 0.62, 0.55]; }
    if (id === 'we_warden' || id === 'we_guardians') { wb.weapon = 'spear'; wb.armor = [0.55, 0.45, 0.25]; wb.shield = true; wb.hat = [0.45, 0.32, 0.15]; }
    if (id === 'we_eternal') { wb.weapon = 'spear'; wb.armor = [0.35, 0.5, 0.35]; }
    if (id === 'we_rangers') { wb.weapon = 'halberd'; wb.armor = [0.3, 0.38, 0.3]; }
    if (id === 'we_shadowdancer' || id === 'we_shadowdancer_w') { Object.assign(wb, { h: 1.35, weapon: 'spear', hat: [0.3, 0.15, 0.4], tunic: [0.35, 0.2, 0.45] }); return figInfantry(wb); }
    if (id === 'we_wardancers') { wb.weapon = 'sword'; wb.hat = [0.6, 0.2, 0.2]; wb.tunic = [0.6, 0.55, 0.2]; }
    if (hero) Object.assign(wb, { h: 1.35, cape: true, helm: 'plume', plume: [0.95, 0.85, 0.3], weapon: 'bow' });
    if (d.wizard) Object.assign(wb, { h: 1.3, robe: [0.2, 0.5, 0.35], helm: 'pointy', hat: [0.18, 0.4, 0.28], weapon: 'staff', cape: false });
    return figInfantry(wb);
  }
  if (id === 'trolls') return figInfantry({ h: 2.0, r: 0.62, skin: TROLL, tunic: [0.35, 0.28, 0.2], weapon: 'club', headR: 0.42, lean: 0.25, tusks: true, legs: TROLL, belt: false });
  const base = { h: 1.1, r, weapon: d.melee?.thrust ? 'spear' : null };
  if (orcs) {
    if (/goblin|^gob_|^ng_/.test(id) || id === 'goblins') { Object.assign(base, { h: 0.85, r: r * 0.85, skin: GOB, ears: true, headR: 0.62, helm: id === 'night_goblins' ? 'hood' : 'steel', hat: [0.12, 0.1, 0.14], tunic: id === 'night_goblins' ? [0.12, 0.1, 0.14] : null, shield: true, weapon: id === 'night_goblins' ? 'spear' : 'sword' }); }
    else Object.assign(base, { h: 1.15, r: r * 1.25, skin: ORC, tusks: true, lean: 0.12, headR: 0.5, weapon: id === 'orc_arrers' ? 'bow' : 'cleaver', armor: id === 'black_orcs' ? [0.2, 0.2, 0.24] : [0.42, 0.34, 0.24], tunic: id === 'black_orcs' ? [0.16, 0.16, 0.19] : null, helm: id === 'black_orcs' ? 'steel' : null, shield: id === 'orc_twin' });
    if (hero && orcs && !/gob|^ng_/.test(id)) Object.assign(base, { h: 1.4, r: r * 1.4, cape: true, weapon: 'greatsword', helm: 'horns', armor: id.startsWith('black') ? [0.18, 0.18, 0.22] : [0.45, 0.32, 0.2], banner: id.includes('warboss') });
    else if (hero) Object.assign(base, { h: 1.0, r: r * 1.0, cape: true, weapon: 'cleaver', helm: 'steel', banner: false });
    if (id === 'orc_boyz') { base.helm = 'horns'; base.shield = false; }
    if (id === 'orc_twin') base.helm = 'horns';
    if (id.includes('weird')) Object.assign(base, { h: 1.3, skin: ORC, robe: [0.25, 0.2, 0.32], helm: 'pointy', hat: [0.3, 0.22, 0.4], weapon: 'staff', cape: false, armor: null });
  } else {
    base.skin = SKIN; base.helm = 'steel'; base.armor = bret ? null : [0.5, 0.5, 0.55]; base.shield = id === 'state_swords' || id === 'state_spears' || id === 'br_men_at_arms' || id === 'br_pilgrims';
    if (id === 'state_halberds') base.weapon = 'halberd'; if (id === 'state_spears') base.weapon = 'spear'; if (id === 'state_swords') base.weapon = 'sword';
    if (id === 'crossbowmen') base.weapon = 'crossbow'; if (id === 'handgunners') { base.weapon = 'gun'; base.helm = 'hat'; base.hat = [0.25, 0.2, 0.15]; base.armor = null; }
    if (id === 'greatswords') { base.weapon = 'greatsword'; base.armor = STEEL; base.helm = 'plume'; base.tunic = [0.8, 0.55, 0.1]; base.plume = [0.8, 0.1, 0.1]; }
    if (id === 'br_men_at_arms') { base.weapon = 'halberd'; base.helm = 'hat'; base.hat = [0.55, 0.5, 0.4]; base.armor = [0.5, 0.42, 0.3]; base.r *= 1.0; base.shield = false; }
    if (id === 'br_bowmen') { base.weapon = 'bow'; base.helm = 'hat'; base.hat = [0.5, 0.42, 0.25]; base.armor = null; base.tunic = [0.4, 0.5, 0.3]; }
    if (id === 'br_squires') { base.weapon = 'bow'; base.helm = 'hat'; base.hat = [0.45, 0.35, 0.22]; base.armor = null; base.tunic = [0.35, 0.3, 0.2]; }
    if (id === 'br_pilgrims') { base.weapon = 'sword'; base.helm = 'hat'; base.hat = [0.8, 0.78, 0.72]; base.armor = null; base.tunic = [0.8, 0.78, 0.72]; base.shield = true; }
    if (hero) Object.assign(base, { h: 1.35, r: r * 1.15, cape: true, helm: 'plume', plume: emp ? [0.9, 0.2, 0.15] : [0.95, 0.95, 0.95], weapon: 'sword', armor: STEEL, shield: false, banner: id === 'empire_captain' });
    if (emp && id === 'state_halberds') { base.helm = 'hat'; base.hat = [0.55, 0.12, 0.12]; base.armor = [0.45, 0.45, 0.5]; }
    if (emp && id === 'state_spears') { base.helm = 'steel'; base.armor = [0.55, 0.5, 0.35]; }
    if (emp && id === 'crossbowmen') { base.helm = 'hat'; base.hat = [0.15, 0.3, 0.5]; base.armor = null; }
    if (d.wizard) Object.assign(base, { h: 1.3, robe: bret ? [0.9, 0.92, 0.95] : [0.4, 0.3, 0.55], helm: 'pointy', hat: bret ? [0.9, 0.92, 0.98] : [0.35, 0.26, 0.5], weapon: 'staff', cape: false, armor: null, shield: false });
  }
  return figInfantry(base);
}
function procBase(shape) { // peana: bandeja oscura con borde del color del bando
  const m = mb();
  if (shape === 'round') { mbCyl(m, 0, 0, 0, 0.5, 0.5, 0.12, 14, WHITE, 1); mbCyl(m, 0, 0.12, 0, 0.44, 0.44, 0.02, 14, [0.34, 0.29, 0.2], 0); }
  else { mbBox(m, 0, 0, 0, 1, 0.12, 1, WHITE, 1); mbBox(m, 0, 0.12, 0, 0.9, 0.02, 0.9, [0.34, 0.29, 0.2], 0); }
  return m;
}
// ---- Escenografía procedural de alto detalle (sustituye a los bosques y colinas de pocos polígonos del mod) ----
const nz2 = (x, y, sd = 0) => { const h = (a, b) => { const t = Math.sin(a * 127.1 + b * 311.7 + sd * 74.7) * 43758.5453; return t - Math.floor(t); }; const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v; };
const fbm = (x, y, sd = 0) => nz2(x, y, sd) * 0.55 + nz2(x * 2.1, y * 2.1, sd + 3) * 0.28 + nz2(x * 4.3, y * 4.3, sd + 7) * 0.17;
// colina: malla de 56x56 sobre una elipse unidad (alto 1), suave, con relieve y laderas rocosas por pendiente
function procHill(seed) {
  const m = mb(), N = 56, H = [];
  const hAt = (x, z) => { const r = Math.hypot(x * 2, z * 2) * (0.92 + 0.16 * fbm(x * 3 + 5, z * 3, seed)); if (r >= 1) return 0; const c = Math.cos(r * Math.PI / 2); return Math.pow(c, 1.35) * (0.82 + 0.3 * fbm(x * 4, z * 4, seed + 1)) + 0.04 * (fbm(x * 14, z * 14, seed + 2) - 0.5) * c; };
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) H.push(hAt(i / N - 0.5, j / N - 0.5));
  const b = m.p.length / 3, e = 1 / N;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const x = i / N - 0.5, z = j / N - 0.5, y = Math.max(0, H[i * (N + 1) + j]) * 0.999 + 0.001;
    const hx = (H[Math.min(N, i + 1) * (N + 1) + j] - H[Math.max(0, i - 1) * (N + 1) + j]) / (2 * e), hz = (H[i * (N + 1) + Math.min(N, j + 1)] - H[i * (N + 1) + Math.max(0, j - 1)]) / (2 * e);
    const nl = Math.hypot(hx * 0.35, 1, hz * 0.35), slope = Math.min(1, Math.hypot(hx, hz) * 0.45);
    const g = 0.85 + 0.25 * fbm(x * 9, z * 9, seed + 4), rock = Math.min(1, Math.max(0, slope * 1.3 - 0.25 + (fbm(x * 7, z * 7, seed + 9) - 0.5) * 0.6));
    const col = [g * (0.62 * (1 - rock) + 0.62 * rock), g * (0.78 * (1 - rock) + 0.58 * rock), g * (0.48 * (1 - rock) + 0.5 * rock)];
    mbV(m, [x, y, z], [-hx * 0.35 / nl, 1 / nl, -hz * 0.35 / nl], [x * 3 + 1.5, z * 3 + 1.5], [...col, 0]);
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = b + i * (N + 1) + j, c = a + N + 1; if (Math.max(H[i * (N + 1) + j], H[(i + 1) * (N + 1) + j], H[i * (N + 1) + j + 1], H[(i + 1) * (N + 1) + j + 1]) <= 0) continue; m.i.push(a, a + 1, c, a + 1, c + 1, c); }
  return m;
}
// esfera de copa desplazada por ruido (icosfera aproximada por latitud/longitud densa)
function mbBlob(m, cx, cy, cz, r, col, seed, sq = 1) {
  const R = 12, S = 18, b = m.p.length / 3;
  for (let i = 0; i <= R; i++) for (let j = 0; j <= S; j++) {
    const th = i / R * Math.PI, ph = j / S * Math.PI * 2, x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
    const d = 1 + 0.28 * (fbm(x * 2.2 + 3, z * 2.2 + y * 1.7, seed) - 0.5) + 0.1 * (nz2(x * 7 + y * 3, z * 7, seed + 5) - 0.5);
    const sh = 0.78 + 0.32 * (y * 0.5 + 0.5) + 0.12 * (nz2(x * 5, z * 5 + y * 5, seed + 11) - 0.5);
    mbV(m, [cx + x * r * d, cy + y * r * d * sq, cz + z * r * d], [x, y, z], [j / S * 2, i / R * 2], [col[0] * sh, col[1] * sh, col[2] * sh, 0]);
  }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = b + i * (S + 1) + j, c = a + S + 1; m.i.push(a, c, a + 1, a + 1, c, c + 1); }
}
// árbol frondoso: tronco curvado con ramas y 6-8 masas de hojas
function procTreeHD(seed) {
  const m = mb(), BARK = [0.36, 0.27, 0.19];
  let px = 0, pz = 0; const segs = 5;
  for (let k = 0; k < segs; k++) { const nx = px + (nz2(k, seed) - 0.5) * 0.12, nzz = pz + (nz2(k + 9, seed) - 0.5) * 0.12; mbLimb(m, [px, k * 0.24, pz], [nx, (k + 1) * 0.24, nzz], 0.13 - k * 0.018, 0.115 - k * 0.018, BARK, 0, 9); px = nx; pz = nzz; }
  for (let k = 0; k < 3; k++) { const a = seed * 2 + k * 2.1, y0 = 0.62 + k * 0.18; mbLimb(m, [px * 0.6, y0, pz * 0.6], [Math.cos(a) * 0.42, y0 + 0.35, Math.sin(a) * 0.42], 0.05, 0.025, BARK, 0, 6); }
  const G = [[0.2, 0.38, 0.14], [0.26, 0.44, 0.16], [0.18, 0.33, 0.13], [0.3, 0.46, 0.18]], n = 6 + Math.floor(nz2(seed, 3) * 3);
  for (let k = 0; k < n; k++) { const a = k / n * 6.28 + seed, rr = k === 0 ? 0 : 0.32 + 0.12 * nz2(k, seed + 2), y = 1.25 + (k === 0 ? 0.35 : 0.1 * Math.sin(k * 2.3)); mbBlob(m, px + Math.cos(a) * rr, y, pz + Math.sin(a) * rr, k === 0 ? 0.48 : 0.36 + 0.1 * nz2(k, seed + 4), G[(k + seed) % 4], seed * 10 + k, 0.85); }
  return m;
}
// conífera: tronco y 6 pisos de ramas cónicos con borde dentado
function procPineHD(seed) {
  const m = mb(); mbLimb(m, [0, 0, 0], [0, 1.9, 0], 0.09, 0.03, [0.33, 0.24, 0.16], 0, 8);
  for (let k = 0; k < 6; k++) {
    const y0 = 0.35 + k * 0.27, r = 0.62 - k * 0.09, hgt = 0.48, S = 22, b = m.p.length / 3, col = [0.13 + k * 0.012, 0.27 + k * 0.015, 0.16];
    mbV(m, [0, y0 + hgt, 0], [0, 1, 0], [0.5, 0], [col[0] * 1.25, col[1] * 1.25, col[2] * 1.25, 0]);
    for (let j = 0; j <= S; j++) { const a = j / S * 6.28, rr = r * (0.85 + 0.25 * (j % 2) + 0.12 * (nz2(j, seed + k) - 0.5)), dy = -0.06 * (j % 2); mbV(m, [Math.cos(a) * rr, y0 + dy, Math.sin(a) * rr], [Math.cos(a) * 0.7, 0.7, Math.sin(a) * 0.7], [j / S, 1], [col[0] * 0.8, col[1] * 0.8, col[2] * 0.8, 0]); }
    for (let j = 0; j < S; j++) m.i.push(b, b + 1 + j + 1, b + 1 + j);
  }
  return m;
}
// arbusto y suelo de bosque (hojarasca con borde irregular)
function procBushHD(seed) { const m = mb(); for (let k = 0; k < 4; k++) { const a = k * 1.7 + seed; mbBlob(m, Math.cos(a) * 0.22, 0.18, Math.sin(a) * 0.22, 0.26, [0.22 + 0.04 * k, 0.4, 0.16], seed * 7 + k, 0.7); } return m; }
function procForestFloor() {
  const m = mb(), S = 64, b = m.p.length / 3; mbV(m, [0, 0.01, 0], [0, 1, 0], [0.5, 0.5], [0.3, 0.27, 0.17, 0]);
  for (let j = 0; j <= S; j++) { const a = j / S * 6.28, r = 0.5 * (0.88 + 0.16 * fbm(Math.cos(a) * 2 + 4, Math.sin(a) * 2, 5)); mbV(m, [Math.cos(a) * r, 0.01, Math.sin(a) * r], [0, 1, 0], [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r], [0.26, 0.24, 0.15, 0]); }
  for (let j = 0; j < S; j++) m.i.push(b, b + 1 + j + 1, b + 1 + j);
  return m;
}
// pantano: charca oscura de borde irregular con orilla de barro, juncos y nenúfares
function procSwamp(seed) {
  const m = mb(), S = 72;
  const ring = (r0, y, col, fr) => { const b = m.p.length / 3; mbV(m, [0, y, 0], [0, 1, 0], [0.5, 0.5], [...col, 0]); for (let j = 0; j <= S; j++) { const a = j / S * 6.28, r = r0 * (0.86 + 0.2 * fbm(Math.cos(a) * 2 + seed, Math.sin(a) * 2, seed + fr)); mbV(m, [Math.cos(a) * r, y, Math.sin(a) * r], [0, 1, 0], [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r], [col[0] * 0.9, col[1] * 0.9, col[2] * 0.9, 0]); } for (let j = 0; j < S; j++) m.i.push(b, b + 1 + j + 1, b + 1 + j); };
  ring(0.5, 0.008, [0.36, 0.31, 0.2], 1); ring(0.4, 0.02, [0.16, 0.24, 0.2], 2);
  for (let k = 0; k < 70; k++) { const a = nz2(k * 1.3, seed) * 6.28 * 3, r = 0.3 + 0.17 * nz2(k, seed + 4), x = Math.cos(a) * r, z = Math.sin(a) * r, h = 0.25 + 0.3 * nz2(k, seed + 7); mbLimb(m, [x, 0, z], [x + (nz2(k, 2) - 0.5) * 0.08, h, z + (nz2(k, 5) - 0.5) * 0.08], 0.008, 0.003, [0.42 + 0.1 * nz2(k, 9), 0.5, 0.25], 0, 4); if (k % 5 === 0) mbCyl(m, x, h - 0.06, z, 0.012, 0.012, 0.07, 6, [0.3, 0.2, 0.12], 0); }
  for (let k = 0; k < 9; k++) { const a = k * 2.1 + seed, r = 0.18 * nz2(k, seed + 1); mbCyl(m, Math.cos(a) * r, 0.022, Math.sin(a) * r, 0.03, 0.03, 0.004, 10, [0.3, 0.48, 0.24], 0); }
  return m;
}
function procTree() {
  const m = mb();
  mbCyl(m, 0, 0, 0, 0.1, 0.07, 0.6, 6, WOOD, 0);
  mbCyl(m, 0, 0.4, 0, 0.62, 0.0, 1.0, 9, [0.17, 0.4, 0.2], 0);
  mbCyl(m, 0, 0.95, 0, 0.48, 0.0, 0.9, 9, [0.2, 0.46, 0.22], 0);
  mbCyl(m, 0, 1.5, 0, 0.32, 0.0, 0.8, 9, [0.24, 0.52, 0.25], 0);
  return m;
}
// Edificio procedural (casa de entramado del Imperio/Bretonia): cubo unidad; el caballete va a lo largo del eje Z
function mbQuad(m, a, b, c, d, col) { const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]; let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; const l = Math.hypot(...n) || 1; n = n.map((v) => v / l); const i = m.p.length / 3; [a, b, c, d].forEach((p, k) => mbV(m, p, n, [k === 1 || k === 2 ? 1 : 0, k >= 2 ? 1 : 0], [...col, 0])); m.i.push(i, i + 1, i + 2, i, i + 2, i + 3); }
function mbTri(m, a, b, c, col) { const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; const l = Math.hypot(...n) || 1; n = n.map((v) => v / l); const i = m.p.length / 3; [a, b, c].forEach((p) => mbV(m, p, n, [0, 0], [...col, 0])); m.i.push(i, i + 1, i + 2); }
function procHouse() {
  const m = mb(), STONE = [0.5, 0.48, 0.44], PLAS = [0.84, 0.78, 0.64], BEAM = [0.32, 0.21, 0.12], ROOF = [0.52, 0.24, 0.16], DARK = [0.12, 0.1, 0.1], GLOW = [0.95, 0.72, 0.32];
  mbBox(m, 0, 0, 0, 1.06, 0.08, 1.06, STONE);
  mbBox(m, 0, 0.08, 0, 1, 0.22, 1, STONE);
  mbBox(m, 0, 0.3, 0, 1, 0.3, 1, PLAS);
  for (const x of [-0.5, 0.5]) for (const z of [-0.5, -0.17, 0.17, 0.5]) mbBox(m, x, 0.08, z, 0.05, 0.52, 0.04, BEAM);
  for (const z of [-0.5, 0.5]) for (const x of [-0.5, 0, 0.5]) mbBox(m, x, 0.08, z, 0.04, 0.52, 0.05, BEAM);
  for (const y of [0.29, 0.58]) { mbBox(m, 0, y, 0.505, 1.04, 0.03, 0.02, BEAM); mbBox(m, 0, y, -0.505, 1.04, 0.03, 0.02, BEAM); mbBox(m, 0.505, y, 0, 0.02, 0.03, 1.04, BEAM); mbBox(m, -0.505, y, 0, 0.02, 0.03, 1.04, BEAM); }
  for (const sx of [-1, 1]) { mbBox(m, sx * 0.51, 0.08, 0, 0.02, 0.24, 0.16, BEAM); for (const z of [-0.33, 0.33]) mbBox(m, sx * 0.51, 0.38, z, 0.02, 0.12, 0.12, GLOW); }
  for (const sz of [-1, 1]) for (const x of [-0.25, 0.25]) mbBox(m, x, 0.38, sz * 0.51, 0.14, 0.12, 0.02, DARK);
  // tejado a dos aguas con alero
  const e = 0.6, o = 0.58, r = 1.0, L = 0.56;
  mbQuad(m, [o, e, L], [o, e, -L], [0, r, -L], [0, r, L], ROOF);
  mbQuad(m, [-o, e, -L], [-o, e, L], [0, r, L], [0, r, -L], ROOF);
  mbQuad(m, [-o, e, L], [-o, e, -L], [o, e, -L], [o, e, L], BEAM);
  for (const sz of [-1, 1]) mbTri(m, [-0.5, 0.6, sz * 0.5], [0.5, 0.6, sz * 0.5], [0, 0.97, sz * 0.5].map((v, k) => v), PLAS);
  for (const sz of [-1, 1]) { mbBox(m, -0.25, 0.6, sz * 0.505, 0.03, 0.22, 0.02, BEAM); mbBox(m, 0.25, 0.6, sz * 0.505, 0.03, 0.22, 0.02, BEAM); mbBox(m, 0, 0.72, sz * 0.51, 0.12, 0.1, 0.02, GLOW); }
  mbBox(m, 0, 0.985, 0, 0.06, 0.04, 1.14, BEAM);
  mbBox(m, 0.22, 0.7, 0.3, 0.12, 0.42, 0.12, STONE); mbBox(m, 0.22, 1.1, 0.3, 0.15, 0.04, 0.15, STONE);
  // ambos lados de la fachada (los triángulos se ven por las dos caras)
  for (const sz of [-1, 1]) mbTri(m, [0.5, 0.6, sz * 0.5], [-0.5, 0.6, sz * 0.5], [0, 0.97, sz * 0.5], PLAS);
  return m;
}
// Muro bajo de piedra: hiladas de sillares desalineados a lo largo de Z
function procStoneWall() {
  const m = mb(); let q = 7; const rnd = () => { q = (q * 16807) % 2147483647; return q / 2147483647; };
  const rows = 3;
  for (let r = 0; r < rows; r++) {
    let z = -0.5 + (r % 2 ? -0.04 : 0);
    while (z < 0.5) { const len = 0.07 + rnd() * 0.06, z1 = Math.min(0.5, z + len), zz = Math.max(-0.5, z); if (z1 > zz + 0.01) { const g = 0.42 + rnd() * 0.14; mbBox(m, (rnd() - 0.5) * 0.08, r / rows * 0.92, (zz + z1) / 2, 0.92 - r * 0.08, 0.92 / rows - 0.02, z1 - zz - 0.008, [g, g * 0.97, g * 0.9]); } z = z1; }
  }
  mbBox(m, 0, 0.9, 0, 0.7, 0.1, 1, [0.38, 0.4, 0.3]);
  return m;
}
function procBoxUnit(col, team = 0) { const m = mb(); mbBox(m, 0, 0, 0, 1, 1, 1, col, team); return m; }
function procQuad(col, tile) { const m = mb(); const b = 0; mbV(m, [-0.5, 0, -0.5], [0, 1, 0], [0, 0], [...col, 0]); mbV(m, [0.5, 0, -0.5], [0, 1, 0], [tile, 0], [...col, 0]); mbV(m, [0.5, 0, 0.5], [0, 1, 0], [tile, tile * 1.5], [...col, 0]); mbV(m, [-0.5, 0, 0.5], [0, 1, 0], [0, tile * 1.5], [...col, 0]); m.i.push(b, b + 2, b + 1, b, b + 3, b + 2); return m; }

const FIT = {}; // ajustes por tipo de unidad: { s: escala, yaw: giro, y: elevación }

export function glInit(canvas) {
  try {
    const gl = canvas.getContext('webgl2', { antialias: !MOBILE || HI, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) return false;
    try { if (localStorage.getItem('tow_nohd') === '1') gl3.noHD = true; } catch { /* */ }
    if (!canvas.__lostH) {
      canvas.__lostH = true;
      // si el sistema retira el contexto (falta de memoria de GPU, típico en iPhone), se recupera sin texturas HD
      // en calidad Alta primero se baja a Normal (la próxima vez); solo si vuelve a ocurrir en Normal se desactivan las texturas HD
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); gl3.ok = false; gl3.noHD = true; try { if (MOBILE && HI) localStorage.setItem('tow_gfx', 'normal'); else localStorage.setItem('tow_nohd', '1'); } catch { /* */ } }, false);
      canvas.addEventListener('webglcontextrestored', () => { hdQ.length = 0; hdBusy = 0; hdCount = 0; hdTex.clear(); glInit(canvas); gl3.dirty = true; }, false);
    }
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl, gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl3.gl = gl; gl3.cv = canvas; gl3.pr = pr; gl3.u = {};
    for (const n of ['uCam', 'uView', 'uPan', 'uC0', 'uWH', 'uTex', 'uBias', 'uSharp', 'uUseTex', 'uDet', 'uDetOn', 'uLVP', 'uPass', 'uSh', 'uShOn', 'uShTx', 'uLVP2', 'uAO', 'uAOOn', 'uAOTx', 'uRes', 'uCut', 'uFx']) gl3.u[n] = gl.getUniformLocation(pr, n);
    // mapa de sombras (luz del sol ortográfica sobre toda la mesa)
    try {
      const SH = Math.min(MOBILE && !HI ? 1024 : 4096, gl.getParameter(gl.MAX_TEXTURE_SIZE)), st = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, st);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SH, SH);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, st, 0);
      gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
      const okFb = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl3.sh = okFb ? { tex: st, fb, size: SH, lvp: lightMatrix() } : null;
    } catch (e) { gl3.sh = null; }
    gl3.ao = null;
    if (gl3.sh) try {
      const AS = Math.min(MOBILE && !HI ? 1024 : 2048, gl.getParameter(gl.MAX_TEXTURE_SIZE)), at = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, at);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, AS, AS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      const afb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, afb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, at, 0);
      gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
      const aok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl3.ao = aok ? { tex: at, fb: afb, size: AS, lvp: lightMatrix([0, 0, 1], [0, 1, 0]) } : null;
    } catch (e) { gl3.ao = null; }
    gl3.meshes = {}; gl3.inst = gl.createBuffer(); gl3.white = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gl3.white); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl3.reg = {};
    const reg = (id, m, tex) => { gl3.reg[id] = { parts: [upload(gl, m, tex)] }; };
    reg('base_round', procBase('round')); reg('base_sq', procBase('sq')); reg('tree', procTree());
    { // escenografía procedural de alto detalle + texturas de hojas y hierba
      const tc = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d')); return c; };
      let q = 3; const rn = () => { q = (q * 16807) % 2147483647; return q / 2147483647; };
      const leaf = tc((x) => { x.fillStyle = '#7d8f68'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 2600; i++) { const v = 90 + rn() * 120; x.fillStyle = `rgba(${v * 0.62 | 0},${v | 0},${v * 0.45 | 0},${0.35 + rn() * 0.5})`; x.beginPath(); x.ellipse(rn() * 256, rn() * 256, 2 + rn() * 4, 1 + rn() * 2, rn() * 3, 0, 7); x.fill(); } });
      const grass = tc((x) => { x.fillStyle = '#8f9a72'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 4000; i++) { const v = 110 + rn() * 110; x.strokeStyle = `rgba(${v * 0.75 | 0},${v | 0},${v * 0.55 | 0},${0.25 + rn() * 0.4})`; x.lineWidth = 1; const X = rn() * 256, Y = rn() * 256; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + (rn() - 0.5) * 3, Y - 2 - rn() * 5); x.stroke(); } for (let i = 0; i < 60; i++) { const v = 120 + rn() * 70; x.fillStyle = `rgba(${v},${v * 0.95 | 0},${v * 0.85 | 0},0.6)`; x.beginPath(); x.ellipse(rn() * 256, rn() * 256, 2 + rn() * 6, 1 + rn() * 4, rn() * 3, 0, 7); x.fill(); } });
      const litter = tc((x) => { x.fillStyle = '#6c5a3c'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 1800; i++) { const v = 70 + rn() * 110; x.fillStyle = `rgba(${v | 0},${v * 0.78 | 0},${v * 0.45 | 0},0.6)`; x.beginPath(); x.ellipse(rn() * 256, rn() * 256, 1.5 + rn() * 3.5, 1 + rn() * 2, rn() * 3, 0, 7); x.fill(); } for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(60,${90 + rn() * 60 | 0},40,0.5)`; x.fillRect(rn() * 256, rn() * 256, 2, 2); } });
      const tl = texFrom(gl, leaf, true), tg = texFrom(gl, grass, true), tf = texFrom(gl, litter, true);
      for (let k = 0; k < 3; k++) { reg('hillHD' + k, procHill(k + 1)); gl3.reg['hillHD' + k].parts[0].tex = tg; }
      for (let k = 0; k < 4; k++) { reg('treeHD' + k, procTreeHD(k + 1)); gl3.reg['treeHD' + k].parts[0].tex = tl; }
      for (let k = 0; k < 2; k++) { reg('pineHD' + k, procPineHD(k + 1)); gl3.reg['pineHD' + k].parts[0].tex = tl; }
      for (let k = 0; k < 2; k++) { reg('bushHD' + k, procBushHD(k + 1)); gl3.reg['bushHD' + k].parts[0].tex = tl; }
      for (let k = 0; k < 2; k++) reg('swampHD' + k, procSwamp(k + 2));
      reg('forestFloor', procForestFloor()); gl3.reg.forestFloor.parts[0].tex = tf;
    }
    reg('box', procBoxUnit(WHITE, 0)); reg('boxteam', procBoxUnit(WHITE, 1));
    { const sm = mb(); mbCyl(sm, 0, 0, 0, 0.5, 0.5, 0.001, 12, [0, 0, 0], 0); reg('shadow', sm); }
    reg('ruin', procBoxUnit([0.55, 0.53, 0.45], 0));
    { // tablero de madera: vetas procedurales a lo largo
      const wc = document.createElement('canvas'); wc.width = 1024; wc.height = 512; const x = wc.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#5a3c26'); g.addColorStop(0.5, '#4a301e'); g.addColorStop(1, '#583a24'); x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
      let q = 9; const rn = () => { q = (q * 16807) % 2147483647; return q / 2147483647; };
      for (let i = 0; i < 260; i++) { const y = rn() * 512, a = 0.04 + rn() * 0.12; x.strokeStyle = rn() < 0.5 ? `rgba(30,18,10,${a})` : `rgba(120,84,52,${a})`; x.lineWidth = 0.6 + rn() * 2.2; x.beginPath(); x.moveTo(0, y); for (let k = 0; k <= 16; k++) x.lineTo(k * 64, y + Math.sin(k * 0.9 + i) * (2 + rn() * 3)); x.stroke(); }
      for (let i = 1; i < 6; i++) { x.fillStyle = 'rgba(20,12,6,.45)'; x.fillRect(0, i * 85, 1024, 1.5); }
      reg('woodtable', procBoxUnit(WHITE, 0)); gl3.reg.woodtable.parts[0].tex = texFrom(gl, wc, true);
    }
    { // textura de detalle (ruido fractal en R: grano/grietas; en G: motas finas), en mosaico
      const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), im = x.createImageData(256, 256);
      const P = 256, per = (a, b, f, sd) => { const t = (i, j) => { const u = Math.sin(((i % f) + f) % f * 127.1 + (((j % f) + f) % f) * 311.7 + sd * 74.7) * 43758.5453; return u - Math.floor(u); }; const X = a / P * f, Y = b / P * f, xi = Math.floor(X), yi = Math.floor(Y), xf = X - xi, yf = Y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return (t(xi, yi) * (1 - u) + t(xi + 1, yi) * u) * (1 - v) + (t(xi, yi + 1) * (1 - u) + t(xi + 1, yi + 1) * u) * v; };
      for (let j = 0; j < P; j++) for (let i = 0; i < P; i++) {
        const r = per(i, j, 4, 1) * 0.45 + per(i, j, 8, 2) * 0.3 + per(i, j, 16, 3) * 0.15 + per(i, j, 32, 4) * 0.1, crack = Math.abs(per(i, j, 6, 7) - 0.5) < 0.025 ? 0.55 : 1;
        const g = per(i, j, 64, 5) * 0.6 + per(i, j, 32, 6) * 0.4, o = (j * P + i) * 4; im.data[o] = Math.min(255, r * crack * 255); im.data[o + 1] = g * 255; im.data[o + 2] = 128; im.data[o + 3] = 255;
      }
      x.putImageData(im, 0, 0); gl3.det = texFrom(gl, c, true);
    }
    reg('house', procHouse()); reg('stonewall', procStoneWall());
    // tablero (fieltro procedural)
    const tc = document.createElement('canvas'); tc.width = tc.height = 256; const x = tc.getContext('2d');
    x.fillStyle = '#3d5230'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5200; i++) { const a = Math.random(); x.fillStyle = `rgba(${a > 0.5 ? '90,120,60' : '25,40,20'},${0.10 + Math.random() * 0.12})`; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2); }
    reg('table', procQuad(WHITE, 1), null); gl3.reg.table.parts[0].tex = texFrom(gl, tc, true);
    // modelos escaneados
    for (const [id, md] of Object.entries(MODELS)) loadModel(gl, id, md);
    for (const [id, md] of Object.entries(TERRAIN)) {
      if (id === 'ground') { const t = md.parts[0].t; const put = (src, then) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.height; c.height = im.width; const q = c.getContext('2d'); q.translate(c.width / 2, c.height / 2); q.rotate(Math.PI / 2); q.drawImage(im, -im.width / 2, -im.height / 2); const old = gl3.reg.table.parts[0].tex; gl3.reg.table.parts[0].tex = texFrom(gl, c, true); if (old && then === undefined) gl.deleteTexture(old); gl3.dirty = true; if (then) then(); }; im.src = src; }; matApply = (k) => { const ms = MAT_SRC[k]; if (ms) put(ms[0], () => { if (view3HD() && !gl3.noHD) put(ms[1]); }); else if (t) put(t, () => { if (HDMAP['t_ground:0'] && view3HD() && !gl3.noHD) put(HDMAP['t_ground:0']); }); }; matApply(glMat()); continue; }
      loadModel(gl, 't_' + id, md);
    }
    for (const [id, md] of Object.entries(SCENERY)) loadModel(gl, 's_' + id, md);
    gl3.ok = true; return true;
  } catch (e) { console.warn('WebGL no disponible', e); gl3.ok = false; return false; }
}
function texFrom(gl, img, repeat) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); // nitidez en vista oblicua
  const w = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); return t;
}
function upload(gl, m, tex) {
  const n = m.p.length / 3, buf = new Float32Array(n * 12);
  for (let i = 0; i < n; i++) { buf.set(m.p.slice(i * 3, i * 3 + 3), i * 12); buf.set(m.n.slice(i * 3, i * 3 + 3), i * 12 + 3); buf.set(m.u.slice(i * 2, i * 2 + 2), i * 12 + 6); buf.set(m.c.slice(i * 4, i * 4 + 4), i * 12 + 8); }
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
  const st = 48; gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, st, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, st, 12);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, st, 24); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, st, 32);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(m.i), gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, count: m.i.length, tex: tex || null, ib };
}
function b64(s, T) { const bin = atob(s), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return new T(u8.buffer); }
// Texturas HD bajo demanda: solo las de los modelos que se dibujan, de una en una, y limitadas en móviles (memoria de GPU de iOS)
// Móvil o tablet (incluye iPad con iPadOS, que se identifica como Mac pero es táctil): memoria de GPU limitada
const MOBILE = (() => { try { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1; } catch { return false; } })();
// Gama baja detectada: pocos núcleos o poca memoria (donde el navegador lo informa)
const LOWEND = (() => { try { return (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 && MOBILE && !/iPhone|iPad|Macintosh/i.test(navigator.userAgent)); } catch { return false; } })();
// Calidad alta: ordenador, o móvil de gama alta (pantalla 3x). Se puede bajar desde el menú («Gráficos») y baja sola si el navegador pierde el contexto 3D
const HI = (() => { try { const g = localStorage.getItem('tow_gfx'); if (g === 'normal') return false; if (g === 'alta') return true; } catch { /* */ } if (LOWEND) return false; return !MOBILE || (typeof window !== 'undefined' && (window.devicePixelRatio || 1) >= 2); })(); // PC, iPad y móviles potentes: alta; gama baja: normal
// Ultra: solo ordenador (no móvil ni iPad) en calidad Alta: mallas completas del mod y texturas de hasta 4096 px (paquete hd/xu_*)
const DESKTOP = (() => { try { return !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && !(/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1); } catch { return false; } })();
const ULTRA = HI && DESKTOP; let xuBig = 0;
export const gfxUltra = () => ULTRA;
export const gfxHi = () => HI;
export const gfxMode = () => { try { if (localStorage.getItem('tow_nohd') === '1') return 'Básica'; } catch { /* */ } return HI ? (ULTRA ? 'Alta (Ultra PC)' : 'Alta') : 'Normal'; };
const hdQ = []; let hdBusy = 0, hdCount = 0, xtCount = 0; const hdTex = new Map();
// tapetes del mod (Old World Setup): piedra rúnica (el de siempre), pradera y tierra con rocas. Se elige en el menú y se guarda
const MAT_SRC = { prado: ['hd/mat_prado_lo.avif', 'hd/mat_prado.webp'], tierra: ['hd/mat_tierra_lo.avif', 'hd/mat_tierra.webp'] };
export const MAT_NAMES = { runas: 'Piedra rúnica', prado: 'Pradera', tierra: 'Tierra y rocas' };
export const glMat = () => { try { const k = localStorage.getItem('tow_mat'); if (k && MAT_NAMES[k]) return k; } catch { /* */ } return 'runas'; };
let matApply = null;
export function glSetMat(k) { try { localStorage.setItem('tow_mat', k); } catch { /* */ } if (matApply) matApply(k); gl3.dirty = true; }
const MAT4K = 'hd/mat4k.webp', MATLO = 'hd/3179f2a981.avif';
function hdRequest(gl, p, id = '') {
  p.hdReq = true;
  if (gl3.noHD || !view3HD()) return;
  const mat = p.hdp === MAT4K; if (mat) p.isMat = true; if (mat && !HI) p.hdp = MATLO;
  // tapete (compartido con colinas y bosques): 4096; escenografía: 2048; miniaturas: 1024 en móvil
  const xm = /^m:x_/.test(id) && HI; p.hdCap = mat && HI ? 4096 : /^m:[ts]_/.test(id) && (HI || !MOBILE) ? 2048 : xm ? (ULTRA && /\/xu_/.test(p.hdp || '') ? (xuBig++ < 20 ? 4096 : 2048) : 1536) : MOBILE ? 1024 : 2048; // Ultra: las 20 primeras texturas de unidad a 4096 px, el resto a 2048 (memoria de vídeo)
  if (xm && MOBILE) { if (xtCount >= 24) return; xtCount++; }
  const hit = hdTex.get(p.hdp); if (hit) { const old = p.tex; p.tex = hit; if (old && old !== hit) gl.deleteTexture(old); gl3.dirty = true; return; }
  if (hdCount >= (MOBILE ? (HI ? 72 : 48) : 400)) return;
  hdCount++; hdQ.push(p); hdPump(gl);
}
function hdPump(gl) {
  if (hdBusy >= 2 || !hdQ.length) return;
  const p = hdQ.shift(); hdBusy++;
  const im = new Image();
  im.onload = () => {
    hdBusy--; if (gl3.noHD || !gl3.ok) return;
    const url = p.hdp, hit = hdTex.get(url);
    if (hit) { const old = p.tex; p.tex = hit; if (old && old !== hit) gl.deleteTexture(old); gl3.dirty = true; hdPump(gl); return; }
    let src = im; const cap = Math.min(p.hdCap || 1024, gl.getParameter(gl.MAX_TEXTURE_SIZE));
    if (Math.max(im.width, im.height) > cap) { const c = document.createElement('canvas'); c.width = c.height = cap; c.getContext('2d').drawImage(im, 0, 0, cap, cap); src = c; }
    const old = p.tex; p.tex = texFrom(gl, src, true); hdTex.set(url, p.tex); if (old) gl.deleteTexture(old); gl3.dirty = true; hdPump(gl);
  };
  im.onerror = () => { hdBusy--; hdPump(gl); };
  im.src = p.hdp;
}
// matriz luz: vista ortográfica desde el sol sobre la mesa de 72"x48" (columna mayor)
const NOCAST = new Set(['table', 'shadow', 'woodtable']);
function lightMatrix(L = [-0.45, -0.35, 0.82], upv = [0, 0, 1]) {
  const n = Math.hypot(...L), d = L.map((v) => v / n), c = [36, 24, 0], e = c.map((v, i) => v + d[i] * 90);
  const f = d.map((v) => -v); let up = upv; let sx = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]]; const sl = Math.hypot(...sx); sx = sx.map((v) => v / sl);
  const u = [sx[1] * f[2] - sx[2] * f[1], sx[2] * f[0] - sx[0] * f[2], sx[0] * f[1] - sx[1] * f[0]];
  const V = [sx[0], u[0], -f[0], 0, sx[1], u[1], -f[1], 0, sx[2], u[2], -f[2], 0, -(sx[0] * e[0] + sx[1] * e[1] + sx[2] * e[2]), -(u[0] * e[0] + u[1] * e[1] + u[2] * e[2]), f[0] * e[0] + f[1] * e[1] + f[2] * e[2], 1];
  const hw = 46, hh = 36, nr = 20, fr = 170, P = [1 / hw, 0, 0, 0, 0, 1 / hh, 0, 0, 0, 0, -2 / (fr - nr), 0, 0, 0, -(fr + nr) / (fr - nr), 1];
  const M = new Float32Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let t = 0; for (let k = 0; k < 4; k++) t += P[k * 4 + j] * V[i * 4 + k]; M[i * 4 + j] = t; }
  return M;
}
const view3HD = () => { try { return typeof location === 'undefined' || location.protocol !== 'file:'; } catch { return true; } };
function buildGeom(gl, pt, mn, mx, smooth = false) {
  const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
  const q = typeof pt.p === 'string' ? b64(pt.p, Uint16Array) : pt.p, uq = typeof pt.u === 'string' ? b64(pt.u, Uint16Array) : pt.u, ix = typeof pt.i === 'string' ? b64(pt.i, Uint16Array) : pt.i, n = pt.n;
  const P = new Float32Array(n * 3), U = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) P[i * 3 + k] = mn[k] + q[i * 3 + k] / 65535 * (mx[k] - mn[k]); P[i * 3] -= cx; P[i * 3 + 1] -= mn[1]; P[i * 3 + 2] -= cz; U[i * 2] = uq[i * 2] / 65535 * 16 - 8; U[i * 2 + 1] = uq[i * 2 + 1] / 65535 * 16 - 8; }
  const N = new Float32Array(n * 3);
  for (let t = 0; t < ix.length; t += 3) {
    const a = ix[t], b = ix[t + 1], c = ix[t + 2];
    const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2], vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { N[k * 3] += nx; N[k * 3 + 1] += ny; N[k * 3 + 2] += nz; }
  }
  if (smooth) { // escenografía: normales suavizadas uniendo vértices en la misma posición (quita el aspecto facetado)
    const acc = new Map(), kf = (i) => `${Math.round(P[i * 3] * 400)},${Math.round(P[i * 3 + 1] * 400)},${Math.round(P[i * 3 + 2] * 400)}`;
    for (let i = 0; i < n; i++) { const k = kf(i); const a2 = acc.get(k); if (a2) { a2[0] += N[i * 3]; a2[1] += N[i * 3 + 1]; a2[2] += N[i * 3 + 2]; } else acc.set(k, [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]]); }
    for (let i = 0; i < n; i++) { const a2 = acc.get(kf(i)); N[i * 3] = a2[0]; N[i * 3 + 1] = a2[1]; N[i * 3 + 2] = a2[2]; }
  }
  const m = { p: Array.from(P), n: [], u: Array.from(U), c: [], i: Array.from(ix) };
  for (let i = 0; i < n; i++) { const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1; m.n.push(N[i * 3] / l, N[i * 3 + 1] / l, N[i * 3 + 2] / l); m.c.push(1, 1, 1, 0); }
  return upload(gl, m, null);
}
// mallas de alta resolución (hd/m_<id>.json): se cargan solo para los modelos que se dibujan y conservan sus texturas
// mallas HD por ejército en binario comprimido (hd/xh_<ejército>.dat.wasm): posiciones/UV/índices en planos con delta + zigzag, y todo en deflate
async function fetchXh(url) {
  try {
    if (typeof DecompressionStream === 'undefined') return null;
    const r = await fetch(url); if (!r.ok) return null;
    const raw = new Uint8Array(await new Response(r.body.pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
    const hl = raw[0] | raw[1] << 8 | raw[2] << 16 | raw[3] << 24, hdr = JSON.parse(new TextDecoder().decode(raw.subarray(4, 4 + hl)));
    let off = 4 + hl;
    const col = (n, out, k, st) => { const lo = raw.subarray(off, off + n), hi = raw.subarray(off + n, off + 2 * n); let a = 0; for (let i = 0; i < n; i++) { const z = lo[i] | hi[i] << 8; a = (a + ((z >>> 1) ^ -(z & 1))) & 65535; out[i * st + k] = a; } off += 2 * n; };
    for (const uid in hdr) for (let i = 0; i < hdr[uid].parts.length; i++) {
      const [n, ni] = hdr[uid].parts[i], p = new Uint16Array(n * 3), u = new Uint16Array(n * 2), ix = new Uint16Array(ni);
      for (let c = 0; c < 3; c++) col(n, p, c, 3); for (let c = 0; c < 2; c++) col(n, u, c, 2); col(ni, ix, 0, 1);
      hdr[uid].parts[i] = { n, p, u, i: ix };
    }
    return hdr;
  } catch (e) { return null; }
}
// Ultra PC: las mallas completas (hd/xu_<ejército>) sustituyen a las de detalle alto cuando existen
async function loadXh(pack) {
  const base = await fetchXh('hd/xh_' + pack + '.dat.wasm');
  if (!ULTRA) return base;
  const ul = await fetchXh('hd/xu_' + pack + '.dat.wasm');
  return ul ? { ...(base || {}), ...ul } : base;
}
const DETFLAT = new Set(['house', 'ruin', 'stonewall', 'box', 'woodtable', 'tree']); // piezas procedurales lisas: reciben grano y relieve
const hdMeshQ = new Set(); let hdMeshN = 0; const xhPacks = {};
function hdMeshRequest(gl, key, r) {
  r.hdmReq = true; const id = key.slice(2);
  if (/^x_/.test(id)) { // miniaturas de los packs: malla detallada por ejército (hd/xh_<ejército>.json), solo en calidad Alta
    const uid = id.slice(2), pack = XMODELS[uid];
    if (!pack || !HI || gl3.noHD || !view3HD() || !XHPACKS.includes(pack)) return;
    const pr = xhPacks[pack] || (xhPacks[pack] = loadXh(pack));
    pr.then((pk) => {
      const md = pk && pk[uid]; if (!md || !gl3.ok || gl3.noHD || gl3.reg[key] !== r || md.parts.length !== r.parts.length) return;
      md.parts.forEach((pt, i) => { const np = buildGeom(gl, pt, md.min, md.max, false), op = r.parts[i]; if (op.vao) gl.deleteVertexArray(op.vao); op.vao = np.vao; op.count = np.count; op.ib = np.ib; });
      gl3.dirty = true;
    });
    return;
  }
  const scn = /^s_/.test(id); // los árboles no cuentan para el límite del móvil: son 3 mallas compartidas por todos los bosques
  if (gl3.noHD || !view3HD() || !HDMESH.includes(id) || (!scn && hdMeshN >= (MOBILE ? 24 : 200))) return;
  if (!scn) hdMeshN++;
  fetch('hd/m_' + id + '.json').then((x) => (x.ok ? x.json() : null)).then((md) => {
    if (!md || !gl3.ok || gl3.noHD || md.parts.length !== r.parts.length) return;
    // se sustituye solo la geometría de cada parte: el objeto (y su textura, que puede estar cambiando a HD) es el mismo
    md.parts.forEach((pt, i) => { const np = buildGeom(gl, pt, md.min, md.max, /^[ts]_/.test(id)); const op = r.parts[i]; op.vao = np.vao; op.count = np.count; op.ib = np.ib; });
    gl3.dirty = true;
  }).catch(() => { /* sin malla HD: se queda la ligera */ });
}
function loadModel(gl, id, md) {
  const parts = [];
  const mn = md.min, mx = md.max;
  // figuras de pocos polígonos (esqueletos…): normales suavizadas para quitar el aspecto facetado sin cambiar la silueta
  const lowPoly = /^x_/.test(id) && md.parts.reduce((t, pt) => t + (typeof pt.i === 'string' ? pt.i.length * 3 / 4 / 6 : 0), 0) < 3500;
  let pk = 0;
  for (const pt of md.parts) {
    const hdp = HDMAP[id + ':' + pk] || (pt.tk ? (ULTRA && XTEXU[pt.tk]) || XTEX[pt.tk] : undefined); pk++;
    const part = buildGeom(gl, pt, mn, mx, /^[ts]_/.test(id) || lowPoly); part.cut = !!pt.a; parts.push(part);
    // textura ligera incrustada al instante; después, si existe, la original en alta resolución (carpeta hd/ junto a la página)
    if (pt.t) { const img = new Image(); img.onload = () => { part.flat = (img.naturalWidth || img.width) <= 64; part.tex = texFrom(gl, img, true); part.hdp = hdp; gl3.dirty = true; }; img.src = pt.t; }
  }
  const R = { parts, h: mx[1] - mn[1], w: Math.max(mx[0] - mn[0], mx[2] - mn[2]) };
  if (/^x_/.test(id)) { // centro de masa del cuerpo (parte baja) respecto al centro de la caja: las armas largas desplazan la caja y dejan el cuerpo descentrado en la peana
    try {
      const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, H0 = mx[1] - mn[1], ylim = mn[1] + H0 * 0.6; let sx = 0, sz = 0, nn = 0, nt = 0;
      for (const pt of md.parts) nt += pt.n;
      const lx = new Float32Array(nt), lz = new Float32Array(nt), ys = new Float32Array(nt); let nl = 0, ny = 0;
      for (const pt of md.parts) { const q = b64(pt.p, Uint16Array); for (let i = 0; i < pt.n; i++) { const y = mn[1] + q[i * 3 + 1] / 65535 * H0; ys[ny++] = y - mn[1]; if (y > ylim) continue; const px = mn[0] + q[i * 3] / 65535 * (mx[0] - mn[0]) - cx, pz = mn[2] + q[i * 3 + 2] / 65535 * (mx[2] - mn[2]) - cz; sx += px; sz += pz; lx[nl] = px; lz[nl] = pz; nl++; nn++; } }
      if (nn > 20) {
        R.off = [sx / nn * 0.7, sz / nn * 0.7];
        // v843h: tamaño del CUERPO (percentiles 3-97 % de la mitad baja, sin alas/lanzas/cañas), altura al 98 % de los vértices (sin la punta de astas) y apoyo (1 % inferior de los vértices): la escala de render.js no se deja engañar por alas extendidas ni astas y la figura se apoya en la peana por su cuerpo y no por un colgante
        const pc = (a, n, p) => Math.min(n - 1, Math.max(0, Math.floor(p * n)));
        const A = lx.subarray(0, nl).sort(), Bz = lz.subarray(0, nl).sort(), Y = ys.subarray(0, ny).sort();
        R.core = Math.max(A[pc(A, nl, 0.97)] - A[pc(A, nl, 0.03)], Bz[pc(Bz, nl, 0.97)] - Bz[pc(Bz, nl, 0.03)]); R.h98 = Y[pc(Y, ny, 0.98)]; R.p1 = Y[pc(Y, ny, 0.01)];
      }
    } catch (e) { /* sin ajuste */ }
  }
  gl3.reg['m:' + id] = R;
}
export function glFig(d) {
  const id = 'f:' + d.id; if (gl3.reg[id]) return id;
  const m = makeFigure(d); gl3.reg[id] = { parts: [upload(gl3.gl, m, null)] }; return id;
}
// miniaturas externas (hd/x_<id>.json, exportadas de los mods por ejército): se cargan al aparecer en la mesa
const xReq = new Set();
// las miniaturas externas van agrupadas por ejército (hd/xp_<ejército>.json): mallas + texturas incrustadas
const xPacks = {};
export function glExt(id, pack) {
  if (xReq.has(id) || !gl3.ok || !view3HD() || !pack) return; xReq.add(id);
  const pr = xPacks[pack] || (xPacks[pack] = fetch('hd/xp_' + pack + '.json').then((r) => (r.ok ? r.json() : null)).catch(() => null));
  pr.then((pk) => {
    const md = pk && pk.m[id]; if (!md || !gl3.ok) return;
    loadModel(gl3.gl, 'x_' + id, { ...md, parts: md.parts.map((pt) => ({ ...pt, tk: pt.t, t: pt.t ? pk.t[pt.t] : null })) }); gl3.dirty = true;
  });
}
// precarga con progreso: lee el pack en streaming y lo deja en la caché que usa glExt
export async function prefetchPack(pack, cb) {
  if (xPacks[pack]) { cb && cb(1); return xPacks[pack].then(() => 1); }
  const pr = (async () => {
    try {
      const r = await fetch('hd/xp_' + pack + '.json'); if (!r.ok) return null;
      const tot = +r.headers.get('content-length') || 0;
      if (!r.body || !r.body.getReader) { const j = await r.json(); cb && cb(1); return j; }
      const rd = r.body.getReader(), ch = []; let n = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; ch.push(value); n += value.length; if (cb && tot) cb(Math.min(0.99, n / tot)); }
      const j = JSON.parse(await new Blob(ch).text()); cb && cb(1); return j;
    } catch (e) { return null; }
  })();
  xPacks[pack] = pr; return pr;
}
export const glHas = (id) => !!(gl3.reg && gl3.reg['m:' + id]);
export const glFit = FIT;

// ---------- renderizado ----------
// cam: { c, s, sp, cp } ; view: { scale, w, h, px, py } ; draws: [{ id, list: Float32Array(x,y,z,yaw, sx,sy,sz,alpha, r,g,b,mix) }]
export function glDraw(cam, view, C0, draws, dpr) {
  const gl = gl3.gl, cv = gl3.cv;
  const W = Math.round(view.w * dpr), H = Math.round(view.h * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  gl.useProgram(gl3.pr);
  const sh = gl3.sh;
  if (sh) { gl.uniformMatrix4fv(gl3.u.uLVP, false, sh.lvp); gl.uniformMatrix4fv(gl3.u.uLVP2, false, (gl3.ao || sh).lvp); }
  gl.uniform1i(gl3.u.uAO, 3); gl.uniform1f(gl3.u.uAOOn, 0);
  gl.uniform1i(gl3.u.uSh, 1); gl.uniform1f(gl3.u.uShOn, 0);
  if (sh) {
    const runShPass = (S, M) => {
    gl.uniformMatrix4fv(gl3.u.uLVP, false, M);
    // pasada de profundidad (sol o cenital): solo objetos opacos que proyectan sombra
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, S.fb); gl.viewport(0, 0, S.size, S.size); gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.BLEND); gl.uniform1f(gl3.u.uPass, 1);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 3); gl.uniform1i(gl3.u.uTex, 0); gl.uniform1f(gl3.u.uFx, 0);
    for (const d of draws) {
      if (d.alpha === true || NOCAST.has(d.id)) continue;
      const r = gl3.reg[d.id]; if (!r || !d.n) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, gl3.inst); gl.bufferData(gl.ARRAY_BUFFER, d.list.subarray(0, d.n * 12), gl.DYNAMIC_DRAW);
      for (const p of r.parts) { gl.bindVertexArray(p.vao); gl.bindBuffer(gl.ARRAY_BUFFER, gl3.inst); for (const [loc, off] of [[4, 0], [5, 16], [6, 32]]) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 48, off); gl.vertexAttribDivisor(loc, 1); }
        const cut = p.cut && p.tex ? 1 : 0; gl.uniform1f(gl3.u.uCut, cut); gl.uniform1f(gl3.u.uUseTex, cut); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cut ? p.tex : gl3.white);
        gl.drawElementsInstanced(gl.TRIANGLES, p.count, gl.UNSIGNED_SHORT, 0, d.n); }
    }
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    runShPass(sh, sh.lvp); if (gl3.ao) runShPass(gl3.ao, gl3.ao.lvp);
    gl.uniformMatrix4fv(gl3.u.uLVP, false, sh.lvp);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sh.tex); gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(gl3.u.uShOn, 1); gl.uniform1f(gl3.u.uShTx, 1 / sh.size);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, (gl3.ao || sh).tex); gl.activeTexture(gl.TEXTURE0);
    if (gl3.ao) { gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, gl3.ao.tex); gl.activeTexture(gl.TEXTURE0); gl.uniform1f(gl3.u.uAOOn, 1); gl.uniform1f(gl3.u.uAOTx, 1 / gl3.ao.size); }
  }
  gl.uniform1f(gl3.u.uPass, 0);
  gl.uniform1i(gl3.u.uDet, 2); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, gl3.det || gl3.white); gl.activeTexture(gl.TEXTURE0);
  gl.uniform2f(gl3.u.uRes, W, H);
  gl.viewport(0, 0, W, H); gl.clearColor(0.09, 0.085, 0.075, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform4f(gl3.u.uCam, cam.c, cam.s, cam.sp, cam.cp); gl.uniform4f(gl3.u.uView, view.scale, view.w, view.h, view.dcam || GLDCAM);
  gl.uniform2f(gl3.u.uPan, view.px, view.py); gl.uniform2f(gl3.u.uC0, C0.x, C0.y); gl.uniform2f(gl3.u.uWH, view.w, view.h); gl.uniform1i(gl3.u.uTex, 0);
  for (const d of draws) {
    const r = gl3.reg[d.id]; if (!r || !d.n) continue;
    if (!r.hdmReq && d.id.startsWith('m:')) hdMeshRequest(gl, d.id, r);
    gl.uniform1f(gl3.u.uDetOn, d.id.startsWith('m:t_') || d.id.startsWith('m:s_') ? 1 : 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl3.inst); gl.bufferData(gl.ARRAY_BUFFER, d.list.subarray(0, d.n * 12), gl.DYNAMIC_DRAW);
    for (const p of r.parts) {
      if (p.hdp && !p.hdReq && p.tex) hdRequest(gl, p, d.id);
      gl.bindVertexArray(p.vao); gl.bindBuffer(gl.ARRAY_BUFFER, gl3.inst);
      for (const [loc, off] of [[4, 0], [5, 16], [6, 32]]) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 48, off); gl.vertexAttribDivisor(loc, 1); }
      if (p.isMat) gl.uniform1f(gl3.u.uDetOn, 3); else if (d.id.startsWith('m:flag_')) gl.uniform1f(gl3.u.uDetOn, 4); else if (d.id === 'base_sq' || d.id === 'base_round' || DETFLAT.has(d.id) || d.id.startsWith('f:')) gl.uniform1f(gl3.u.uDetOn, 2); else if (/^m:(?!t_|s_)/.test(d.id) && !p.flat) gl.uniform1f(gl3.u.uDetOn, 5); else if (p.flat && !(d.id.startsWith('m:t_') || d.id.startsWith('m:s_'))) gl.uniform1f(gl3.u.uDetOn, 2); else gl.uniform1f(gl3.u.uDetOn, d.id.startsWith('m:t_') || d.id.startsWith('m:s_') ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, p.tex || gl3.white); gl.uniform1f(gl3.u.uUseTex, p.tex ? 1 : 0);
      gl.uniform1f(gl3.u.uCut, p.cut && p.tex ? 1 : 0); gl.uniform1f(gl3.u.uFx, d.id === 'm:t_hill' ? 1 : 0); if (d.id === 'm:t_hill' || (p.cut && p.tex)) gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE); else gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
      { const fg = /^m:(?!t_|s_)/.test(d.id); gl.uniform1f(gl3.u.uBias, fg ? -0.4 : p.isMat ? -0.6 : p.cut ? -0.5 : 0); gl.uniform1f(gl3.u.uSharp, fg ? 0.25 : p.isMat ? 0.4 : p.cut ? 0.3 : 0); } // miniaturas más nítidas de lejos (menos desenfoque del mipmap)
      gl.depthMask(d.alpha !== true);
      gl.drawElementsInstanced(gl.TRIANGLES, p.count, gl.UNSIGNED_SHORT, 0, d.n);
    }
  }
  gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE); gl.depthMask(true); gl.bindVertexArray(null);
}
