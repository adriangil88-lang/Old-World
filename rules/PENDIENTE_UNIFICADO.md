# Pendiente unificado (v713, 2026-11-16)
Reúne todo lo pendiente de `AUDITORIA.md`, `PLAN_PENDIENTE.md`, `TODO_SIN_APROX.md` (y `gaps_core.md`, ya superado) más los límites declarados en esta sesión. Esos ficheros quedan como histórico: **este es el único documento vivo**.
Criterio: «confirmado» = comprobado hoy en el código; «por verificar» = la nota antigua lo da como abierto pero no lo he podido contrastar hoy; «cerrado» = nota antigua superada por otra posterior.
No hay recuento frase por frase de libros/FAQ contra el motor (ver sección 6).

## 1. Fuentes que faltan (no se puede implementar sin ellas)
- **Chaos Cults** (opciones de culto de Marauders; Arcane Journal «The Razing of Westerland»): SÍ implementado (v778-v780): están en el AJ Westerland p.33; verificado en v811 con el PDF original re-OCR.
- Textos de los libros que no dan regla: Engendro de la disformidad (el libro no da su texto), Ingeniero Zapador (sin regla de terreno hostil), generadores de terreno Wasteland/Shadowlands (solo ambientación).

## 2. Límites por regla o por prueba
- **Ogre Kingdoms a 400 pts**: ninguna lista legal (personaje mínimo 105 > 25 % de 400). Inherente a la regla.
- **Despliegue alterno en modo código**: probado en simulación, no entre dos dispositivos reales.
- **Gemelwald**: edificios en la mitad del defensor según el texto; el mapa los dibuja en el lado del atacante (prevalece el texto).
- **3D de respaldo sin GL** (`t3box`): rotación de edificios añadida en v713 sin verlo renderizado; el 3D normal sí está comprobado.
- **Escenarios**: mapas de Matched Play, Core (Odo, Pine Crags, Gisoreux, Lonely Tower, Drakwald) y Seize the Tower contrastados con su PDF. Siguen sin contrastar con mapa: Shores, Waystones y los de Dawn of the Storm Dragon (timely, leonen, hollum: «mapa exacto de despliegue, zonas A/B del defensor» pendiente según PLAN_PENDIENTE v348) y Axe Bite Pass/Karak/Gemelwald salvo lo medido.

## 3. Reglas de unidad (revisadas y corregidas en v714)
- `hierophant`: la regla ya existía (`s.hiero`), pero la Regeneración se perdía solo al inicio del turno del dueño y el primer chequeo de Liderazgo no se hacía «al final de la fase» (Ravening Hordes). v714: pérdida inmediata de Regeneración, chequeo al final de la fase en que cae y en cada Inicio de turno; el Hierofante se designa al empezar la batalla (Settra siempre).
- `runPack` (Arcane Journal Elfos Silvanos): **Indisciplinado no estaba implementado para ningún Enjambre/Bestia de guerra** (Core p.191). v714: no pueden usar la Presencia inspiradora ni Mantened la posición, salvo Correr con la manada (Cuidadores silvanos) y Espíritus ligados. Los Cuidadores silvanos no se modelan uno a uno (solo coste): la unidad conserva la regla mientras haya bestias. Sin miedo a flamígeros con Correr con la manada. Pendiente: «usar el Movimiento de la mayoría de los modelos» (los Cuidadores no existen como modelos). **v715: Correr con la manada aplicado con Cuidadores de Bestias como modelos reales (Movimiento de la mayoría; empate: el menor).**
- `beastHandlers` / `safeHarm`: **v715 hecho**: los Cuidadores ocupan huecos de la fila delantera, los ataques se asignan por contacto peana con peana y atacan a su Iniciativa (ver VERIFICACION v715). Limitación: el jugador no elige la colocación.
- Animus sepulcral (FAQ 1.5.2): corregido en v714. Se nomina ANTES de la tirada (botón «Animus» en el panel; la IA lo hace al lanzar hechizos de VL 8+); antes se decidía tras ver los dados.
- Vórtices (FAQ 1.5.2: «la plantilla se mueve D6" en cada subfase de Inicio de turno»): antes solo se movían en el turno de su dueño. v714: se mueven en el de ambos jugadores; los impactos son contra los enemigos del lanzador.
- Ya implementados (la nota antigua era errónea): Sabuesos de Orión protegen a Orión de los disparos, Carros de la Guardia 49 pts, Guerreros del Páramo, Piedra del Escultor, Buscadores de Fatalidad (no personaje, Escaramuzadores).
- Renegade Crowns: **v716 hecho** a partir de tow.whfb.app (sin el libro; reglas leídas como mecánica, no literal). Dudas anotadas en VERIFICACION v716.
- Parciales aún por verificar: `eyeDragon`, `masteryStorm`, `randMove`, `detachment`, `monsterHandlers`, `warpSpawned`.

## 4. Pendientes de las notas históricas (por verificar o confirmados abiertos)
FAQ 1.5.2 sin implementar (no localizados por nombre en data.js/rules.js: Sabuesos Espectrales de Orión, Finta y Esquiva de Renegados; resto por verificar):
- Sabuesos Espectrales de Orión (inmune a disparos mientras haya sabuesos); Piedra del Escultor (Regeneración +1; `stoneShaper` existe: verificar); Animus Sepulcral; Carros de la Guardia (49 pts); Guerreros del Páramo (bosque extra Chrace); Finta y Esquiva (Renegados); Buscadores dejan de ser personaje.
Magia y objetos Cathay (TODO_SIN_APROX, nota v490 dice «ninguno pendiente»; verificar contra faq_cathay.txt):
- Linterna/objetos: quills, fires, compass, icon, dragoneye, maw, spirit lantern, scrolls/fengshi/seal/cloak, monkey; Lore of Yang/Yin completas (Poder del Cielo y la Tierra, Espíritus del Viento, Espejo Maldito, Guerreros Ancestrales), Vientos Yang/Yin, Maestría de la Tormenta.
- FAQ Cathay por verificar: Warhorse sin Primera Carga, Commander sin campeón, Bombing Run, Lanza cathayana solo carga, Dragon Fire Bombs F3.
Objetos (~113 «(a mano)» en v417): la nota v490 dice que ya no quedan textos «(a mano)» en data.js (0 coincidencias hoy) y los ids llevan banderas de efecto (rowsA, rwRune, lionJ, globe…). Falta una auditoría objeto por objeto de que cada efecto funciona (lista de ids en PLAN_PENDIENTE.md, sección v417).
Legends/Legacy (AUDITORIA v363–v612): notas «REALMENTE abiertos» de v607b (Dones de Khaine, venenos, Carro Frío/Azote, Skaven) fueron cerradas en v608–v612. Siguen sin comprobar: perfiles/puntos/equipo de todas las unidades Legends contra el libro (solo se corrigieron algunos), Hidden/Infiltración Eshin (marcados hechos en v371), restricciones de alineamiento demoníaco, límites «una vez por ejército» de dones, Harmony tras reforma, selector Cursed Coven (cerrado en v608), marcadores de mina colocados automáticamente.
Pendientes menores anotados: Perros Primigenios + Ungor Ravagers (unidad mixta; hecho en v462: verificar), Carro de Guerra como montura de Ingeniero, Prophet Herdstone/despliegue automático Stirhügel (v476), Salto de barriga del Gigante (no golpea amigos bajo la plantilla), pánico por heridas del Lanzallamas (v609b: hecho), Terror Abisal/Ghoul King en Terrorgheist/Thrall en Coven Throne, Treno quejumbroso, Arca/Motor de los Dioses, Estegadón Ancestral, hechizo ligado de Doomfire Warlocks, Dones demoníacos del Flamer, Radiancia solar (hecho), Aquelarre (hecho).
Opciones de personajes/unidades (AUDITORIA v479–v612): quedan «pendiente motor»: Vuelo (9) +30 del Príncipe/mago (v533: hecho), prohibir mago con Marca de Khorne (v607b: hecho); revisar opciones de Desperados, Cohortes TK2, Huscarls/Berserkers, Guarnición/Chracia de Altos Elfos.

## 5. Núcleo (gaps_core.md, análisis del 2026-11-09)
Comprobado hoy en el código como YA hecho: H1 (bajas de la fila de combate, `frontLost`), H3 (magos que se unen / varios personajes: los mensajes de rechazo ya no existen), M3 (Disparos múltiples, Core p.174), M6 (dispersar hechizos que siguen en juego, `dispelRip`), edificios y cobertura.
Por verificar uno a uno con test dirigido: H2 (atacar a personajes unidos fuera de desafío), H4 (cargas con trayectoria/rueda), H5 (Terror), M1, M2 (redirección y múltiples objetivos de carga), M4 (cobertura por modelos intermedios), M5 (Volar), M7 (US con personajes unidos), M8 (¡Cuidado señor!), M9–M13, LOW.

## 6. Trabajo propuesto para cerrar el recuento
1. Trocear Core + FAQ + libros de facción en reglas individuales (una fila por frase con efecto).
2. Marcar cada una como implementada / parcial / ausente con enlace al código.
3. Calcular el % real por libro y priorizar los huecos (empezar por Core y FAQ 1.5.2).
4. Cada punto «por verificar» de arriba se resuelve o se cierra con un test dirigido.

## 7. Regla de publicación
No publicar ni actualizar el artefacto hasta que el usuario diga «Publica». Publicado: v612; local: v713.


## Recuento frase por frase (v716)
Ver rules/RECUENTO.md: global 61,3% exacto / 75,0% ponderado (Core 63,0/76,4; FAQ Core 53,4/68,9; FAQ libros 65,6/77,9). Pendiente: corregir AUSENTE/PARCIAL listados y segunda pasada con libros de facción.
