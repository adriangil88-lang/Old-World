// v843q (puntos 8-10) — reproducción de la IA y cartas de hechizo
import { T, DATA, ok } from '../lib2.mjs';
import fs from 'fs';
const MAIN = fs.readFileSync('/home/claude/tow/app/js/main.js', 'utf8');
const CSS = fs.readFileSync('/home/claude/tow/app/css/app.css', 'utf8');
const HTML = fs.readFileSync('/home/claude/tow/app/index.html', 'utf8');
T('v843q-cartas-hechizo-texto', 'main.js spellCardHTML + data.js SPELLS', 'Todo hechizo tiene carta de texto (nombre, saber, valor de lanzamiento, tipo, alcance, efecto) y botón 🃏 siempre disponible', () => {
  const { SPELLS } = DATA; let n = 0;
  for (const [k, sp] of Object.entries(SPELLS)) { ok(sp.name && sp.text, 'hechizo incompleto ' + k); n++; }
  ok(n >= 30, 'hechizos ' + n);
  ok(/function spellCardHTML\(k, compact\)/.test(MAIN) && /Valor de lanzamiento/.test(MAIN) && /Invocación Perfecta/.test(MAIN), 'carta de texto');
  ok(/function cardBtn\(k\) \{ return \(SPELLS\[k\] \|\| ITEMS\[k\]\)/.test(MAIN), 'botón de carta para todo hechizo');
  ok(/function showLoreTable/.test(MAIN) && /act === 'loretbl'/.test(MAIN) && /function loreTbl/.test(MAIN), 'tabla del Saber desde la selección (v843s: ya no hay botón en la ficha; sale en el popup previo)');
});
T('v843q-reproduccion-ia-controles', 'main.js/index.html/app.css', 'La barra de reproducción tiene play/pausa, paso atrás/adelante, inicio/fin, lista de pasos y botones de 44 px', () => {
  ok(/id="pbk"/.test(HTML) && /id="pbl"/.test(HTML) && /id="zAI"/.test(HTML), 'elementos de reproducción');
  ok(/#pbk/.test(CSS) && /44px/.test(CSS), 'estilos 44px');
  ok(/PB\.viewS/.test(MAIN), 'estado visual por instantáneas');
  ok(/0\.5/.test(MAIN) && /instant/i.test(MAIN), 'velocidades');
});
