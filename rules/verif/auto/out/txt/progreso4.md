# progreso4 — v835 pruebas de comportamiento (reanudable)
Agente único. Reanudar: leer este archivo, `cd rules/verif/auto/behavior && ./run.sh`.

## Lote 0 — estado heredado (agente cortado el 20-nov 00:37)
- build + /tmp/pw.js: errors: [] (22-nov). Arnés previo: 98 pruebas, 98 pasan.
- Cambios sin informe del agente anterior (rules.js 00:34, data.js 00:37; notas en scratchpad v834_fixes.md), revisados contra el texto:
  - Vórtices al Inicio de turno: dispersión con dado de dispersión, «¡Impacto!» = no se mueve (core.txt:2774-2775 «If a ‘Hit!’ is rolled … the object does not move»; faq_core.txt:350-356). Correcto.
  - Lucero del alba (faq_core.txt:198 Morning Star): F+1 y Perforación (1) solo contra los cargados; FP −1 siempre. Correcto.
  - Mayal de los Reyes Conquistados (faq_rh.txt:148-151): por enemigo cargado. Correcto.
  - Bosques (faq_core.txt:250-256): parcial con más de la mitad dentro. Correcto.
  - infCavOnly en itemIssues (Yelmo Deslumbrante faq_core.txt:325, FAQ RH p.77). Correcto.
- Inventario (A): qa_extract.py comparado línea a línea con las 4 FAQ (columnas reconstruidas): todo el texto está en alguna entrada salvo cabeceras y UNA errata que faltaba: faq_rh.txt:100 «Badlands Ogre Bulls*: Under ‘Options’, change the cost … Crusher … +7» (verbo en minúscula) → rh-errata-050. Extractor corregido (verbo en minúscula tras «Under ‘X’,») y ahora conserva los ids anteriores. Total 459 entradas: Q/A 242 (core 170, fof 37, rh 32, cathay 3 = recuento de «Q:» en los archivos), erratas 213 (= recuento de verbos Change/Add/Delete…, contando las entradas con varios), notas 4.

## Lote 1 — erratas del Core: pruebas falsas sustituidas por pruebas de comportamiento
- 11 pruebas del agente anterior no ejecutaban el motor (leían su código con String(R.x) o `ok(true)`): core-errata-008, 017, 019, 024, 027, 029, 030, 034, 035, 040, 042, 047, 060 → reescritas montando la situación. run.mjs rechaza ahora cualquier prueba que inspeccione el código fuente.
- Correcciones del motor (rules.js):
  1. Volar (faq_core.txt:56-61, Fly (X) «Except when following up or pursuing…»): al perseguir/seguir el Volador se mueve por tierra → chequeos de terreno peligroso (antes se los saltaba). Los Etéreos no (core.txt:5333).
  2. applyWounds: el ajuste del borde de contacto tenía el signo invertido: al perder filas en contacto, el frente RETROCEDÍA una fila y la unidad dejaba de estar trabada. Visible sobre todo con los Impactos de carga: el carro mataba y el combate no se luchaba.
  3. Impactos de carga (faq_core.txt:73-78): se resuelven al elegir CADA combate (paso 1.1, antes de los desafíos), no todos al empezar la fase; y sus heridas cuentan para el resultado del combate (core.txt:4806-4812 «unsaved wounds it caused during this Combat phase»; antes no contaban).
  4. Arma de mano (core.txt:7210 «all models are assumed to be equipped with a hand weapon» + core.txt:7186-7191 / faq_core.txt:183-189 + faq_core.txt:867-873): nueva elección en el paso 1.1 «Arma de combate: su arma / arma de mano (y escudo)», solo si da un beneficio (evitar Ataca el último del arma a dos manos; Parada/escudo de la infantería con arma a dos manos o lanza). D(u) con u.hwOn. IA: aiPick 'handW'. (Mecánica nueva.)
- Build + /tmp/pw.js: errors: [].

## Lote 2 — FAQ Core Q/A 001-058 (tests/30_core_qa.mjs)
- Correcciones del motor:
  5. Dispersión fuera de la mesa (faq_core.txt:358-361 «any part of an object»): el vórtice se retira si CUALQUIER parte de la plantilla cruza el borde (antes solo el centro).
  6. Escudo de Roble (core.txt:10160-10162 «the caster and any unit they have joined»): la unidad del Mago también gana la salvación 5+ (antes solo el Mago).
  7. Retirada de un desafío (faq_core.txt:397-400): la unidad pierde TODOS los efectos de hechizos de alcance Propio del Mago (antes solo los que permanecen en juego). Cada efecto de hechizo lleva ahora sx/sk (lanzador/hechizo).
  8. Redirigir la carga (core.txt:3983-3996): objetivo = cualquier unidad contra la que pudo declarar la carga (arco, alcance máximo, visión, trabada o no); antes se exigía que estuviera más cerca que la unidad en huida y que no estuviera trabada.
  9. geom.js wheelPath: el giro de ala puro de ~8°-26° costaba ~30" (atan2(0,0) hacía dar una vuelta de más) → no se podía girar de ala ese ángulo. Corregido (coste = arco de la esquina exterior).
  10. Carga obligada (Impetuosa/Frenesí) y escaramuzadores amigos (faq_core.txt:475-482): no se declara si la obstruyen escaramuzadores amigos que no pueden apartarse (trabados, en huida, ya movidos o sin objetivo de carga). Mecánica nueva skObstructs.
- No automatizables: 002 (gesto físico de deshacer), 039 (prohibición sin decisión en el motor; cubierta por 040), 049 (el mapa no modela la cima/pendiente de las colinas), 056 (cubierta por 041).
- Build + /tmp/pw.js: errors: [].

## Lote 3 — FAQ Core Q/A 059-082 + tarea D + run.sh
- Correcciones del motor:
  11. Desafíos: el personaje solitario (monstruo) en desafío no hacía sus Pisotones (el camino del desafío salía antes) → ahora pisotea y puede dirigirlos al otro participante (faq_core.txt:593-596).
  12. Desafíos: con un solo enemigo trabado, los modelos que no están en el desafío atacaban al personaje solitario retado → sus ataques se pierden (faq_core.txt:548-555).
  13. Registro: los golpes de un personaje unido en desafío aparecían con el nombre de su unidad (cosmético).
- Tarea D:
  - Aguijón venenoso (Escorpión de la Tumba, Necroesfinge, opción +5 de la Esfinge de Guerra; rh.txt:6155, 6166-6168, 6210-6212, 6328-6330) y Oleada de veneno (Arachnarok, rh.txt:1522-1528): ranura opcional `opt` (un ataque por modelo, Golpea primero = paso de I 10 `sf`, envenenado, F del modelo, FP propio, Heridas múltiples D6 en la oleada, sin el Golpe letal del modelo `noKb`), popup por turno en el paso 1.1 (step11Weapons, aiPick 'slotOpt'). Mecánicas nuevas: ranuras opcionales (u.slotOff), sf, noKb, mw de dados en ranura, patch `slots` en las opciones.
  - Datos que faltaban: opciones de la Esfinge de Guerra (Aguijón venenoso +5, Rugido ígneo +20: aliento F4 FP −1 flamígero) y de la Arachnarok (lanzador de seda +35: bombardeo 12-48", F2 (4), FP 0 (−1), plantilla de 5", Aparatoso; Avería = pierde 1 Herida, `selfW`); perfil dividido de la dotación de la Arachnarok (8 × HA2 F3 I3) y de la Esfinge de Guerra (2 × HA3 F4 I3) con su propia HA e Iniciativa; Escorpión: Matamonstruos en las pinzas (rh.txt:6207).
  - Grupo de mando (Banda variopinta y cualquier unidad): solo se recoloca (ranuras ◀▶, slotFile/champFile) al desplegar, al reformar (también reforma gratuita), al girar 90°/180° o al unirse un personaje (canReslot; main.js oculta los botones fuera de esos momentos).
  - IA: valoración de la formación al desplegar (fmScore/fmBest, lectura propia documentada): primera candidata del decisor aprendido; el decisor no distinguía las dos formaciones (mismos rasgos al desplegar).
- run.sh creado (un comando, resumen al final). Build + /tmp/pw.js: errors: [].

## Lote 4 — FAQ de Forces of Fantasy (tests/31_fof.mjs erratas, 32_fof_qa.mjs Q/A)
- Correcciones:
  14. Arma de asta de Bretonia (faq_fof.txt Page 92 «when its combat is chosen during Step 1.1»): se elige en cada paso 1.1 (antes bloqueada desde la primera ronda según el texto del AJ, que la FAQ sustituye).
  15. Antiguo Hombre Árbol (faq_fof.txt:81-83 + fof.txt:4837-4840): elige Batalla o Elementalismo (antes podía elegir cualquier saber silvano: Alta Magia, Ilusión).
  16. Bastón del Mago (faq_fof.txt:83-84): 0-1 por Mago (faltaba).
  17. Guardián de los Lugares Sagrados (Caballero Verde, FAQ FoF AJ Bretonia p.37): no salta a plantillas de vórtice (terreno temporal); antes podía.
  18. Campeón de Martilladores (faq_fof.txt fof-qa-002): no puede llevar runas de arma en los grandes martillos (solo estaba para el Clan Real con grandes hachas).
- No automatizables con motivo: fof-note-001, 056, 062, qa-004, 022, 024, 026, 030, 031, 032, 037; pendientes (automatizables, no hechas): qa-003, 012, 014, 019, 029, 035.
- lib.mjs: N(id, motivo, fuente, pend) distingue «no automatizable» de «pendiente». Build + /tmp/pw.js: errors: [].

## Lote 5 — FAQ de Ravening Hordes, erratas (tests/33_rh.mjs)
- Correcciones / datos:
  19. Araña Gigante (rh.txt:690-748): faltaba la montura de Jefe de Guerra / Gran Jefe Goblin (+35, M7, +1 H, HA4 F4 I4 A3 envenenados, Piel acorazada 1, Caballería rápida, Zancada veloz, + Mover a través de cobertura por la FAQ). Nuevos gob_warboss_spider, gob_bigboss_spider. Mecánica: ataques envenenados solo de la montura (mountAtk.poison → ranura propia).
  20. Trolls (comunes, de río, de piedra, del Caos) (FAQ RH p.28/65): Banda variopinta y armas por modelo (cnt) en lugar de toda la unidad. Nota: listas guardadas con 'ahw'/'gw' cuentan ahora un modelo por cada aparición.
  21. ’Eadbuttin’ ’At (FAQ RH p.44): 0-1 por modelo.
  22. Da Skull Smasha de Kiknik (aj_orcs2.txt:911-916 + FAQ RH p.35): faltaba el perfil de pico (F, FP −2, Perforante 2, Heridas múltiples 2) y los Ataques mágicos; se elige en cada paso 1.1.
- Arnés: game() devuelve a la mesa las unidades que el despliegue dejó en reserva (keepRes para conservarlas).
- Pendientes: rh-errata-039, 040, 046. Build + /tmp/pw.js: errors: [].

## Lote 6 — Q/A de RH y Catay (34_rh_qa.mjs) y Q/A del Core 083-170 (35_core_qa2.mjs)
- Inventario cubierto entero: 459/459 entradas con prueba o listadas (no automatizable con motivo / pendiente).
- Sin correcciones nuevas del motor en este lote (las pruebas que se pudieron montar pasan); muchas Q/A de composición de listas, torneos, aliados y colocación física quedan como no automatizables (sin efecto en el motor) y otras como pendientes (automatizables, no hechas).
- Build + /tmp/pw.js: errors: [].

## Cierre (22-nov)
- run.sh: 364 pruebas, 364 pasan; inventario 459/459 cubierto (353 con prueba, 42 no automatizables, 66 pendientes). /tmp/ask_test.mjs: 4 partidas completas sin errores. Build + /tmp/pw.js: errors: [].
- VERIFICACION.md: sección «## v835 — pruebas de comportamiento».
- Siguiente lote (para reanudar): pendientes del inventario (N(..., true) en tests/*.mjs), revisión regla por regla de las reglas de ejército (empezar por out/sr_coverage.txt) y pruebas individuales de hechizos y objetos.
