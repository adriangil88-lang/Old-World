// v843r — flujo de generación de hechizos con tabla previa, mano de cartas y descripciones corregidas
import { T, DATA, ok } from '../lib2.mjs';
import fs from 'fs';
const MAIN = fs.readFileSync('/home/claude/tow/app/js/main.js', 'utf8');
T('v843r-flujo-hechizos-ui', 'main.js spellGenFlow (Core p.106-107)', 'La generación de hechizos enseña la tabla del Saber antes de tirar, revela las caras resaltadas y deja descartar uno por la firma; orden libre entre Magos; también Magos sin desplegar (s.pend)', () => {
  ok(/async function spellGenFlow/.test(MAIN) && /async function sgWizard/.test(MAIN), 'funciones');
  ok(/Tirar \$\{N\}D6/.test(MAIN) && /Aún no has tirado/.test(MAIN) && /hi: hiIdx/.test(MAIN), 'tabla previa y resultado resaltado');
  ok(/order of your choosing/.test(MAIN) && /s\.pend/.test(MAIN), 'orden y despliegue alterno');
  ok(/t: 'spellPick'/.test(MAIN) && /loresForWiz/.test(MAIN), 'acción real y saberes disponibles');
});
T('v843r-mano-cartas', 'main.js showSpellHand', 'Mano de cartas de magia accesible desde la ficha y desde «Lanzar hechizo»; el lanzamiento parte de la carta elegida', () => {
  ok(/data-act="hand"/.test(MAIN) && /act === 'hand'/.test(MAIN) && /a\.act === 'cast'/.test(MAIN) && /unitAct\('cast'/.test(MAIN), 'accesos');
  ok(/Nivel\/2/.test(MAIN) && !/2D6 \+ Nivel del mago/.test(MAIN), 'FAQ: Nivel/2, no «+ Nivel»');
});
T('v843r-descripciones-reglas', 'data.js RULES vs core.txt/rh.txt/faq', 'Descripciones corregidas: Contracarga, Ignora el pánico, Inmune a psicología, Zancada veloz', () => {
  const R = DATA.RULES;
  ok(/D3\+1/.test(R.counterCharge[1]) && /TODOS los modelos/.test(R.counterCharge[1]), 'contracarga');
  ok(/6"/.test(R.ignorePanic[1]) && /a través/.test(R.ignorePanic[1]), 'ignora el pánico');
  ok(/mayoría/.test(R.immunePsy[1]), 'inmune a psicología');
  ok(/antes de hacer una tirada/.test(R.swiftstride[1]), 'zancada veloz (FAQ)');
});
