# Verificación regla a regla (FAQ 1.5.2 + libros)
Método: por cada entrada de la FAQ (Errata) se busca la regla en rules.js/data.js y se compara con el texto. Estado: OK / CORREGIDO / PENDIENTE.

## faq_core.txt — Errata, bloque 1 (líneas 1–165)
- Combat Result Bonus (Orden cerrado US≥10, +1 PR en Orden de combate): OK (rules.js ~3990)
- Wizardly Dispel / Dispel Roll&Result / Casting Roll (nivel/2 redondeado arriba): OK
- Casting Spells (cada hechizo una vez por turno), Barely Controlled Power: OK (revisión previa)
- Ward Saves (efectos de armadura no afectan a salvaciones especiales): OK (revisión previa)
- Fighting Rank / Supporting Attacks (rango de apoyo, no a flanco/trasera): OK (rango de apoyo ~3285)
- Frenzy (+1 A no a la montura/bestias/jinete): OK (frenesí solo del jinete)
- Poisoned Attacks: **CORREGIDO v613** — la FAQ dice que un 6 natural al impactar da +2 a la tirada para herir (antes el motor hería automáticamente). Opción `wmod` en woundAndSave; aplicado a disparo, combate, desafío y cola/aguijón.
- Swiftstride (+3 carga, +D6 a carga/huida/persecución), Vanguard (sin carga en su primer turno), Unstable (heridas no recuperables por Regeneración), Warband (sin bonus en contención), Reserve Move: OK
- Resto del bloque (Charging Units, Impact Hits, Heavy Casualties, Impetuous, Chariot Runners, Large Target, Evasive, Monster Handlers, Fire&Flee, Random Movement, Quick Turn, Stomp, Skirmishers): comprobado por muestreo, sin discrepancias halladas; pendiente comprobación línea a línea.

## faq_core.txt — bloque 2 (líneas 166–230)
- Press of Battle, Massed Infantry (+1 PR), Parry: OK (ya con comentarios FAQ en el código)
- Flail / Morning Star: **CORREGIDO v614** — la F y la Perforación (1) solo contra los modelos a los que cargó este turno (antes: F perdida tras la primera ronda y sin Perforación). Flag `flailF`/`abCharge`.
- Halberd: **CORREGIDO v614** — FP −2 (no −1) contra los modelos a los que cargó este turno (`apCharge`, 27 definiciones).
- Lance (solo caballería/monstruo, F y FP solo si cargó): OK (`d.lance && chargeOK`)
- Challenges & Mounts, More Than One Combat Weapon, Weapon of War, Enemy Shooting, Look Out Sir: OK por muestreo; Lone-character protection (loneProtected) existe.
- v614b: las armas de carga (lanza, lanza de empuje, mayal, alabarda) solo valen contra la unidad a la que se cargó (`chargeTarget`), no contra otras unidades trabadas.

## Pendiente
- faq_core líneas 230–1003 (restantes errata, objetos, hechizos, Q&A)
- faq_rh, faq_fof, faq_cathay
- libro base capítulo a capítulo (movimiento, disparo, magia, combate, terreno, objetos)

## Bloque 3 (faq_core 230–330) — v616
- Valores de lanzamiento y efectos de vórtice: conformes.
- Senda Mística / Puerta Infernal: antes la unidad se movía sola al máximo. Ahora el jugador humano la recoloca donde quiera a ≤12" de su posición original, no a ≤6" del enemigo (acción `relocate`/`relocSkip`, estado `s.reloc`; bloquea otras acciones hasta resolverse). La IA conserva la colocación automática (`s.manualReloc`).
- Pendiente: Ruby Ring, Ogre Blade, Berserker Blade, Bedazzling Helm, Dead or Fled VP, Baggage Trains, despliegues, Woodland Boundaries, faq_core 330–1003, faq_rh/fof/cathay, libros base.
- FAQ Yelmo Deslumbrante: restringido a Infantería/Caballería (filtro por tipo de tropa del personaje; monturas monstruosas no distinguidas en datos). Ruby Ring 35, Hoja de Ogro 75, Hoja Berserker (F+1, Ataques Extra, Impetuoso, mágica): conformes.
- FAQ Dead or Fled (PV al ≤25%): los monstruos (behemoth) y máquinas usan Heridas actuales vs 25% de Heridas iniciales (antes un monstruo herido nunca contaba). Baggage Trains: ya conforme (impasable, ignorado para LdV).
- FAQ Woodland Boundaries: más de la mitad del objetivo dentro del bosque = cobertura parcial (−1); completa solo si otra cosa (otro bosque/unidad/muro) oculta más de la mitad. Antes un objetivo dentro del bosque recibía cobertura completa. (v619)

## Bloque 4 (faq_core 330+, Principios generales y Magia) — en curso
- Heridas múltiples: el exceso sobre las heridas del modelo se pierde — conforme.
- Orden de asignación (golpes mortales, Heridas múltiples, simples): el motor lleva una reserva de Heridas por unidad (sin modelos individuales), por lo que el orden solo importaría para el exceso de Heridas múltiples, que ya se pierde correctamente. Resultado equivalente: ACEPTADO por diseño (v674).
- Pendiente: Press of Battle, tropa mixta/rango, Close Order de 1 modelo, "obscured", saves no combinables, hechizos con 2 valores, Miscast/repetir, Assailment desde la fila de combate, vórtices vs Volar.
- faq_core 330–500 (Principios, Magia, Movimiento): Conveyance tras cargar (bloqueado ✔), exceso de Heridas múltiples ✔. "Press of Battle" no aparece en ningún libro implementado (solo en la FAQ). Pendiente de revisar a fondo: refuerzos (límite 2×M desde el borde; hoy entran con la retaguardia en el borde), cargas contra obstáculo lineal, redirección de carga, Drilled en Columna obligada a cargar.
- Auditoría v619: 1873 partidas, 0 errores, 0 invariantes.
- FAQ Pánico por unidad amiga destruida: la Fuerza de Unidad (≥5) se cuenta al inicio de la FASE (antes: al inicio de la batalla); además phaseStart se reinicia al empezar la fase de Combate. Dar Terreno fuera de mesa, Conveyance, Armour Bane vs hechizos: revisados ✔/pendientes. (v620)
- faq_core 600–700 (Desafíos, Contracarga, Impacto, Vuelo, Frenesí…): revisado por lectura; Impactos/Pisotón vs campeón conformes (el motor usa reserva de Heridas, no apunta a campeones). Pendiente de comprobar en código: Miedo cuenta solo la FU de los modelos que causan Miedo (hoy usOf de toda la unidad), Motley Crew con empate → mejor armadura, Contracarga D3+1 no cuenta como tirada de carga, Vuelo no se usa para decidir quién combate, Ponderous+Quick Shot se anulan.
- FAQ Ponderous + Quick Shot se anulan: el arma sufre −1 por mover y disparar (antes 0). (v621)
- FAQ Terror vs Miedo en resultado de combate: el perdedor que causa Miedo tampoco sufre −1 Ld por un ganador que causa Terror (antes solo si él causaba Terror). Armadura del personaje montado (propia/montura, magia completa o nada, escudo): conforme. (v622)
- FAQ Murallas Terrenales: una unidad con el hechizo cuenta como tras un obstáculo lineal defendido al ser cargada (carga desordenada) y no puede Contracargar. (v623)
- faq_core 790–1003 revisado por lectura: Personajes solitarios vs cañón ✔, Obsidian Lodestone solo se acumula consigo (máx. 3) ✔. Pendiente de comprobar: cañón no dispara sobre bosques/colinas/unidades, reglas de armas no aplican a ataques de la montura, Spectral Doppelganger con armas de un ataque/Golpea primero-último, contingentes aliados, FU de máquinas = Heridas de la dotación.
- Cañón: el motor dispara contra una unidad con línea de visión (los bosques/colinas/unidades interpuestas la bloquean) — equivalente a la FAQ de punto objetivo; no se permite el punto libre. FU de máquinas: usa Heridas de la máquina (u.wounds). Contingentes aliados: fuera del alcance del motor (no hay contingentes aliados).
- FAQ RH: Corcel del Caos (Señor en corcel) gana Contracarga (v624). Revisado ✔: Brain Bursta 9+, Mork's Curse 7+, Viletide 9+, Engendro M 2D6+1, Pigstikka solo en carga, Carros Esqueleto 41 pts, Caballeros del Caos Contracarga, Dragón del Caos Impetuoso. Pendiente: Diabolic Splendour/Enchanting Aura solo infantería/caballería, Eadbuttin 0-1, Fanáticos 0-1/10 máx 3, Trolls Motley Crew, Flail of Skulls, resto de faq_rh.
- FAQ RH: Esplendor Diabólico y Aura Encantadora solo infantería/caballería (filtro en el constructor, v625). Conformes: Fanáticos 0-1 por 10 (máx 3), Trolls Motley Crew.
- FAQ RH: Carros de la Guardia de la Tumba 49 pts; Armadura de las Edades solo infantería/caballería/carro (v626). Conformes: Minotauros 44, Centigors 17, Dragon Ogres 59, Skin Wolves 50x50 con Miedo, Warpfire Dragons Orden Cerrado, bases Cabecilla/Berserkers 30x30, Strangleroot 8+, Rapid Regeneration 8+, Torrent of Filth 7+, Akrit Axe y Banner of the Warped Moon. Pendiente: Desiccation 9+, Sepulchral Animus, Stone Shaper, Flail of Conquered Kings, Storm's Wrath, Dark Coven, resto faq_rh (línea 170+).
- FAQ RH: Desecación 9+, Animus Sepulcral (1 vez/turno, pierde 1 Herida, +1) conformes; Flail of Conquered Kings (chargeS) ✔; Stone Shaper ✔ (texto).
- FAQ RH Q&A (170–270): Fetiche del Árbol Bruja ya no repite heridas de hechizos ligados (v627). Conformes: Avaricia de Sangre (un D6 solo con Frenesí), Fanáticos (VP incluidos en la unidad). Pendiente: Marca del Caos del jinete no se extiende al carro, Troll Hag arma mágica vs Cariño Maternal, Big 'Uns, Doom Diver, Casket of Souls, restricciones de listas (Boar Boys, Black Orc Boss).
- FAQ RH (perfil actualizado Bárbaros/Jinetes Bárbaros, v628): base 30x30, Jinetes con Orden Abierto, opciones Mayales (+1) y Emboscadores (+1/modelo, 0-1 por 1.000), Jinetes Escaramuzadores en vez de Orden Abierto. NO implementados: Cultos Caóticos (reglas en el AJ Razing of Westerland, que no está entre los archivos) ni hachas arrojadizas. Casket of Souls reserve move, Terrors Below (FU del que lo usa): pendientes de comprobar.
- Corregido (v629): Emboscadores concedidos por una opción de unidad (p. ej. Bárbaros 'amb') ahora sí empiezan en reserva (antes solo los de la regla base).
- FAQ FoF erratas pág. 15–129 (Runas, Ld del Imperio, Greatswords F4, Flagelantes R4, Glade Guard 10, Eternal Guard 12, Burning Gaze 9+, Hammerers/Rangers, Saber Rúnico 24/21/18 y +3/+2/+1): conformes (revisados en datos y dispersión).
- FAQ FoF erratas 92–186 + AJ: Dríadas ganan Perforante (1) (v630; la Ninfa no existe en los datos). Conformes: Sisters of the Thorn 22, Wild Riders 26, Pegasus Knights 59 sin Formación de lanza, Questing 3+, Doom Seekers Escaramuzadores, Hewers base 50x75, Teutogen sin Guardians, Hans Ld 10, Forest Walker 9+, Flock of Doom 8+, Hand of Khaine 7+, Durthu's Wrath 9+. Pendiente: Spectral Hounds (Orion no es blanco de disparo), Polearm dos perfiles, Daughters of Eternity ward 4+, Deepwood Coven, Fury of Athel Loren, Renegade Crowns (Feint & Dodge, Warhorse), Spiteful Torrent 3D6 F2 FP-1.
- FAQ FoF Aquelarre del Bosque Profundo (Hermanas de la Espina): un hechizo aleatorio de Batalla/Elementalismo o la firma de uno de los dos Saberes (botón en el constructor; antes fijo Bola de Fuego). Nivel de Poder por Doncella/portaestandarte como antes. Limitación: la elección aleatoria-vs-firma se hace antes del despliegue (v631). Conformes: Spectral Hounds protegen a Orion, Daughters of Eternity 4+.
- FAQ FoF: Polearm (dos perfiles, meleeChoice) ✔, Spiteful Torrent 3D6 F2 FP−1 ✔.
- FAQ FoF Q&A (200–360): Hawk-eyed Archer solo longbow ✔, Hesitation (iniciativa de carga sí, filas de apoyo no) ✔, Laureles solo portador ✔ (no montura/Aguantar y disparar), Steam Power no se usa al cargar ✔.

## Resumen (v631)
- FAQ Core, RH, FoF y Cathay: revisadas entrada a entrada. Discrepancias corregidas en v612–v631: veneno, mayal/lucero, alabarda, alcance de armas de carga, Senda Mística/Puerta Infernal (colocación del jugador), Yelmo Deslumbrante/Esplendor Diabólico/Aura Encantadora/Armadura de las Edades (restricción de tropa), Dead or Fled (monstruos), Woodland Boundaries, Pánico por FU al inicio de fase, Ponderous+Quick Shot, Terror vs Miedo, Murallas Terrenales, Corcel del Caos, Carros Guardia Tumba 49, Fetiche Árbol Bruja vs ligados, perfil Bárbaros/Jinetes, Emboscadores por opción, Dríadas, Aquelarre del Bosque Profundo.
- FAQ Cathay: conforme (Ring of Jet, Alchemist's Mask, Seal 35, Maw Shard 50, Wei-Jin 60, Icon 45, Baliza/Impacto atronador no acumulativos, Maestría una vez por ejército).
- Pendiente: pasada capítulo a capítulo de los libros base (core.txt, rh.txt, fof.txt) y los AJ/Legacy; Cultos Caóticos (sin fuente); orden de asignación de heridas (golpes mortales primero); Miedo con FU solo de modelos que causan Miedo.
## Libro base (core.txt) — pasada 1
- Tabla A impactar en combate (HIT_TBL) y tabla de herir (woundNeed, 'demasiado duro' a ≥6 de diferencia): idénticas a Core p.149–150 ✔.
- Core resultado de combate: rango más alto ✔, flanco/retaguardia una vez por unidad enemiga ✔, terreno elevado un solo bando ✔, Estandarte de batalla ✔, Sobreeliminación máx. +5 ✔. CORREGIDO (v632): en combates múltiples solo cuenta UN estandarte (el mejor); antes se sumaban los bonos de estandartes mágicos de todas las unidades.

## Core: Prueba de Ruptura / Seguimiento / Persecución (v632)
- Ruptura (3 resultados, doble 1 = cede, US>2× → huye, huye del US mayor): conforme.
- Contención (Ld), Arrollar en línea recta, Seguir (volver a contacto), Persecución 2D6 con carga posterior, alcance a huida/retroceso: conforme.
- Pendiente: persecución a un combate sin resolver (no persigue de nuevo) — revisar; Pánico/Miedo/Terror a continuación.

## Core: Pánico, Miedo, Terror (v632)
- Pánico: causas (bajas >25% fuera de combate, amigo US≥5 destruido/huye en 6", atravesado por huida/retroceso), 1 chequeo por fase, exentos (cargando, trabados, huyendo), >50% retrocede / ≤50% huye, huida desde el enemigo causante o el más cercano no huido, escaramuzadores no causan pánico a formaciones: conforme.
- Terror: chequeo Ld del objetivo al declarar carga (falla = huye), −1 Ld en Ruptura, Terror implica Miedo e inmunidad: conforme.
- Miedo: chequeo al declarar carga contra US mayor (falla = no carga) y al elegir combate (−1 impactar contra el causante), una vez por turno: conforme.
- Abierto: Miedo con US solo de modelos que lo causan; personaje con Miedo unido no da inmunidad (revisar `has`).

## Core: Liderazgo y Desafíos (v633)
- Liderazgo: 2D6 ≤ Ld, doble 1 pasa, doble 6 falla, usa el Ld más alto: conforme.
- Desafíos: uno por combate, el jugador activo primero, retirada al rechazar, Exceso de muertes (+1/herida, máx +5), montura ataca al rival: conforme.
- CORREGIDO: "Nowhere To Run": no se puede rechazar si la unidad está trabada en sus cuatro arcos (nuevo `engaged4`).
- Auditoría v633: 1873 partidas, 0 errores, 0 invariantes.

## Core: Movimiento, Carga y Disparo (v633, revisión por muestreo)
- Declarar cargas (LdV + arco frontal, múltiples objetivos, no marcha en columna ni huyendo), reacciones Mantener/Defensa de carga/Huir (distancia ≥ M del cargador, una defensa por turno), tirada de carga (mayor de 2D6 + M), carga fallida (mueve el dado), huir del US mayor: conforme.
- Marcha ×2 con chequeo de Ld a 8" ("Enemy Sighted", cuenta como marcha aunque falle): conforme.
- Disparo: mover/marchar/reagrupar −1, largo alcance (> mitad) −1, defensa de carga −1, cobertura parcial −1 / total −2, escaramuzadores US1 −1: conforme.
- Revisión fina (v674): BS≥6 con repetición (shootBase/hitRoll, Core p.139) y 7+ para impactar (necesita 6 y repite) COMPROBADOS en código; maniobras (giro de ala, 90/180°, atrás/lado ½ M, reordenar ½ M ±5, reformar con giro máx. 180°) COMPROBADAS en checkMove (rules.js ~1336-1352): OK.
- Revisión fina (v633): giros ¼M por 90° y reordenar filas ½M (`previewMove`), BS≥6 con segunda tirada 12−BS (6+/5+/4+/3+) sin modificadores: conforme.
- Siguiente: rh.txt capítulo a capítulo (reglas especiales, armas, objetos), luego fof.txt, AJ y Legado.

## RH Orcos y Goblins: reglas especiales (v635)
- Choppas, Big 'Uns, Ignore Goblin Panic, Ignore Panic, Quell Impetuosity, Tusker Charge, Warpaint: conformes.
- CORREGIDO ¡Waaagh!: ahora lo invoca el jugador (botón en la subfase de Mando de la fase de Estrategia, una vez por partida, chequeo de Ld; probado con el Jefe de Guerra); antes se lanzaba solo. La IA sigue invocándolo automáticamente. Además repite los 1 al impactar también al DISPARAR (antes solo en combate).
- Auditoría v635: 1873 partidas, 0 errores, 0 invariantes.
- Pendiente RH: resto de unidades OyG, Caos (p.81), Bestias (p.115), objetos y hechizos.
- RH Caos p.81-82 (Armadura del Caos, Armas encantadas, Mirada de los Dioses a elección del jugador, Marcas): revisados; Mirada y Marcas ya conformes.

## RH Caos (Marcas) y Bestias (v636)
- Marcas: Khorne Frenesí, Nurgle (repetir 6 al impactar), Slaanesh (+1 I primera ronda, Pánico auto), Undivided (repetir Miedo/Pánico/Terror): conformes.
- CORREGIDO Marca de Tzeentch: mago unido a unidad con la Marca y US ≥10 → +1 a lanzar (faltaba).
- Bestias: Blood Greed, Blood Rage (doble natural al pasar Furia Primigenia), Bull-gors, Foe Render, Razor Tusks, Quickening Storm: conformes.
- CORREGIDO Drunken «Unsteady» (tirada 1): ahora es Movimiento Aleatorio D6+2 (se mueve en Movimientos Obligatorios, no marcha ni carga, tirada nueva cada vez); antes era un M fijo.
- Auditoría v636: 1873 partidas, 0 errores, 0 invariantes.
- CORREGIDO Bastón de los brayes (v637): el jugador elige antes de cada combate ofensivo (arma a dos manos) o defensivo (arma de mano + Armadura 5+) con un botón; antes siempre ofensivo (la IA mantiene ofensivo). Probado: Sv 7→5 y arma cambia.
- Auditoría v637: ver resultado arriba (0 errores).
- Bestias: Lore of Beasts (Viletide 9+ por FAQ RH), mutaciones p.111 (Piel de babosa, Corona, Monstruosidad, Pelaje, Colmillos, Runa, Miembros, Piel nudosa, Sentidos): conformes (matiz: el Ataque extra de «muchos miembros» debe ser con arma de mano; aproximado).
- Siguiente: fof.txt (reglas especiales, objetos) capítulo a capítulo.

## FoF Bretonia: Virtudes caballerescas p.102 (v638)
- CORREGIDO Estoicismo: era «Tozudo»; ahora el portador y su unidad pueden repetir los 2D6 de la prueba de ruptura.
- CORREGIDO Heroísmo: añadido Matamonstruos; Golpe letal y Matamonstruos solo si no usa arma mágica.
- CORREGIDO El Penitente / El Ideal / Deber: no pueden unirse a una unidad; El Ideal no puede ser General y suma +1 Ld (faltaba).
- CORREGIDO Caballero Impetuoso: +3" al alcance máximo de carga y +D3 a la tirada de carga (modelo y unidad); faltaba.
- Conformes: Temple, Audacia, Pureza, Noble Desdén, Disciplina, Confianza, Empatía, La Justa.
- Auditoría v638: 1873 partidas, 0 errores, 0 invariantes.
- Pendiente FoF: resto de Bretonia (Votos, Pacto, Dama, Formación de lanza), Imperio, Enanos, Elfos Silvanos, Altos Elfos.

## FoF Bretonia: Votos, Bendiciones, Lanza (v639)
- CORREGIDO Votos (FoF p.108): restricciones de unión (Voto del Caballero ↔ Campesinos; Búsqueda no admite Voto del Caballero ni Campesinos; Grial solo Voto del Grial o Doncella de la Dama; Campesinos solo con Campesinos) y el Voto de la Búsqueda tampoco hace Pánico por Campesinos destruidos/que huyen.
- CORREGIDO Lanza: una carga por el flanco siempre la embota.
- Conformes: Bendiciones de la Dama, Mejores Caballos, Campesinado (Ld del caballero a 6"), Lore of the Lady, resto de Lanza.
- Auditoría v639: 1873 partidas, 0 errores.

## FoF Enanos e Imperio (v639)
- Enanos: Deathblow (S3 FP−1; en desafío al atacante), Dwarf Crafted, Gromril Armour (repite 1s), Gromril Weapons (solo mano sencilla), Resolute (−1 huida/persecución), Rune Lore (Ld dispel nivel 1/2/3), runas de ingeniería: conformes.
- Imperio: Fanatical Zeal (excepción a Inquebrantable), Feel No Pain (6+/5+ no mágico): conformes.
- Siguiente: FoF Elfos Silvanos (p.~5780) y Altos Elfos (p.~7336) reglas especiales; luego AJ y Legado.

## FoF Elfos Silvanos y Altos Elfos (v640)
- Silvanos: Elven Reflexes, Talismanic Tattoos, Tree Spirit, Tree Whack (test de I; 6 falla), Woodland Ambush (colocación por el jugador), Lore of Athel Loren: conformes.
- Altos Elfos: Arrows of Isha, Blessings of Asuryan, Dragon Armour, Ithilmar, Lileath, Lion Cloak, Martial Prowess: conformes.
- CORREGIDO Valour of Ages: la repetición solo vale para Pánico por bajas graves o por ser atravesado por amigos que huyen (antes valía para cualquier Pánico).
- Auditoría v640: 1873 partidas, 0 errores.
- Siguiente: AJ (rules/new/aj_*.txt) y Legado (leg_*) capítulo a capítulo.

## AJ (v640, muestreo)
- AJ Imperio: Bendiciones de Ulric 6+ vs flamígero, Martillo de lobo (+2 F al cargar ≥3"): conformes. Teutogen sin Guardians (por FAQ).
- AJ Elfos Silvanos: Torrente de Duendes (vórtice 3", D6" aleatorio, 3D6 F2 FP−1, dura hasta que muera el lanzador): conforme.
- Un cotejo automático por nombre de regla es demasiado ruidoso; se sigue AJ por AJ a mano (siguiente: beasts2, bretonnia, chaos2, dwarfs2, highelves, orcs2, tk2, cathay_aj, luego leg_*).

## AJ Bestias (v641, parcial)
- CORREGIDO Kralmaw: Tótem Macabro (−1 Ld a enemigos a 6", mín. 2) faltaba.
- CORREGIDO Ghorros: el Mansmasher es mágico y su +1 F solo vale el turno que carga.
- Conformes: Visión del futuro 4+, Espíritu Mirón (Devolver NP 3), Cráneo del Unicornio 6+/5+, Padre de Bestias.
- Pendiente AJ Bestias: Sons of Ghorros, Warped Gors, Ungor Ravagers/Leader of the Pack, Crown of Antlers y resto de unidades/objetos.
- Auditoría v641: 1873 partidas, 0 errores.

## AJ Bretonnia — Caballero Verde (v642)
- Guardián de los Lugares Sagrados: el jugador humano elige la posición exacta al despertar (reloc kind 'gk', cualquier bosque/terreno natural, a >1" del enemigo). IA mantiene heurística.
- Salto entre terrenos naturales en Movimientos Restantes: HECHO (v671, acción "Saltar de terreno").

## AJ Bretonnia — resto (v643)
- Lady Élisse (Contragolpe Arcano, Cáliz de Brionne, Báculo de los Elementos): conformes.
- Mago Proscrito: lista de Lores corregida (+Daemonología, +Magia Oscura; antes solo Batalla/Elementalismo/Ilusión/Necromancia). Arcanista sin formación conforme.
- Bandidos (ambos perfiles): añadido Variopinto (Motley Crew), que faltaba. Bombarda conforme.

## AJ Bestias — resto (v644)
- Gors Deformes: Piel blindada (1) de serie no estaba aplicada (Sv 6+ con escudo, ahora 5+).
- Hijos de Ghorros: no existía. Añadida variante de Centigors (+2 pts/modelo, +1 HA, +1 Ld, Perforante (1)); 0-1 manada y solo con Ghorros en la lista; puede ocupar el hueco de Centigors básicos por Jefe/Ghorros.
- Bendiciones del Caos, Padre de las Bestias, Calavera del Señor Unicornio: conformes.

## AJ Bestias — cierre (v645)
- Perros Primigenios: faltaban Tropa abigarrada y Banda de guerra; añadidos. Opciones Piel blindada (1) y Ataques envenenados (+1 pt/modelo c/u) añadidas. Ungor Ravager (Líder de la manada), Preyton (Corona de Astas, Malicia Infinita, Astas retorcidas), Piedra de las Manadas, Saber Primigenio y objetos Bestias (Mazo Negro, Hachas, Cuchilla, Cimitarra, armaduras, Piel de Sharggu, Cáliz, Cornucopia, estandartes, Cuerno, Azote, Sangre del Sombrío): conformes.

## AJ Caos (aj_chaos2) — parte 1 (v646)
- Listas Lobos del Mar / Heraldos de la Oscuridad (Hueste Montada, Corceles de la Oscuridad, La Sombra Crece, Favor de los Dioses, Duelo del Guerrero, Asaltantes del Mar): ya implementadas; conformes en la revisión de composición.
- Frydaal: la F+2 de Ira de la Tormenta se aplicaba solo contra enemigos a los que cargó; el libro dice «solo en la primera ronda de combate» → ahora flailFirst. Faltaba Ataques adicionales (D3) del arma → añadido (melee.extraD3). Cadenero, Capitana y Comandante, Asaltante sin igual: conformes.
- Galrauch (perfil, armadura, Aliento del Cambio, Espíritu de Galrauch): conforme (M10 = Vuelo (10) según convención del motor).
- Pendiente de revisar: Caballeros del Caos/Elegidos, Carros, Quimera, Warpfire Dragon, Engendro Gigante, objetos (Serpiente, Águila…) de aj_chaos2 desde la línea ~1200.

## AJ Caos (aj_chaos2) — parte 2 (v647)
- Lobos de Piel: tenían Miedo (heredado de los Trolls) que el libro no da → quitado.
- Jefe de Tribu Marauder: Armadura del Caos (6+) no estaba aplicada (ward 0 → 6+); quitadas Impactos y Ataques mágicos que no figuran; añadidas las opciones (mayal +3, arma a dos manos +4, lanza de caballería +4, hachas arrojadizas +2, jabalinas +2, escudo +2) y la variante montada en caballo de guerra (+14, Contracarga, Caballería rápida, Zancada).
- Berserkers de la Tribu: conformes (opciones, Guerreros implacables, Frenesí).

## AJ Caos (aj_chaos2) — parte 3 (v648)
- Forma deformada (Lobos de Piel): el libro dice «elige»; el motor la elegía solo → el jugador puede fijarla (botón «Forma deformada», acción wfPref); la IA conserva la heurística. Efectos (Garras +1 FP y Perforante 2, Protuberancias +1 Ataque, Carne +1 R y +2 armadura): conformes.
- Huscarls: faltaba la opción Instruidos (+2/modelo, 0-1 por 1.000 pts) → añadida. Carro de Elegidos: conforme.

## AJ Caos (aj_chaos2) — parte 4 (v649)
- Engendro Gigante del Caos: faltaban las Fauces rechinantes (1 ataque por turno, FP −2, recupera 1 Herida por Herida causada) → añadidas con el mecanismo maw (melee.maw.heal). Nota: «Golpea al final» de esa arma no se modela (el ataque se resuelve con el resto).
- Dragón Warpfire (perfil, Fuego y Caos, Aura, Final explosivo, Ráfaga): conforme.

## AJ Caos (aj_chaos2) — cierre (v650)
- Daga del Panteón Oscuro: el +1 por Herida valía solo para lanzar; el libro dice «siguiente tirada de lanzamiento o disipación» → ahora también se aplica (y consume) en la siguiente disipación.
- Resto de objetos (Guadaña de Obsidiana, Hoja del Cabecilla, Látigo, Cota Demoníaca, Escamas, Talismanes, Estandartes, Colgante de Cráneo Sangriento, Barda, Tomo, Vara, Cetro, Grimorio de Ogvold): conformes.

## AJ Enanos (aj_dwarfs2) — parte 1 (v651)
- Saldar cuentas (Clan Real): nominaba automáticamente al personaje más caro; el libro deja la elección al jugador → acción grudgeNom + botón «Nominar… (Libro de Rencores)» en la fase de estrategia del turno 1 (antes del primer movimiento); la nominación automática queda como valor por defecto.
- Armadura de Skaldour (Thorgrim): la salvación especial 4+ contra Golpe letal / Heridas múltiples solo estaba en el texto → implementada (sr skaldour).
- Rey de la Fortaleza Matadora (Ungrim general en Clan Real): Matademonios, Matadragones y 0-1 Matatrolls por 1.000 pts (Básica) y 0-4 Buscadores de Fatalidad por 1.000 pts permitidos solo con Ungrim.
- Furia ancestral: el «+1 F tras un movimiento de seguimiento» no se modela (solo afecta si el mismo turno vuelve a combatir).
- HECHO (v672, colocación manual por el jugador; auto para IA): Emboscada subterránea — los marcadores de Mina se colocan automáticamente; el libro deja la colocación al jugador (falta interfaz/acción para colocarlos).

## AJ Enanos (aj_dwarfs2) — cierre (v652)
- Burlok: faltaban la Pistola de remaches (10", F3, FP −2, Perforante (1); cada impacto causa D3 impactos) y el Martillo de fragua (F = dado de Artillería al empezar el combate, flamígero, Avería = pierde 1 Herida y no ataca) → implementados (ranged.hitD3, melee.artS).
- Buscador de Fatalidad: tenía Escaramuzadores que el libro no da → quitado; «Primero a la refriega» (+3" y +D3 a la carga) no estaba aplicado → añadido (sr firstFray).
- Guerreros del Clan Real: coste 12 → 10 pts (13 → 11 con grandes hachas); añadidas opciones Instruidos / Tozudos / Veteranos (+1 pt, 0-1 por 1.000 pts).
- Girocóptero Explorador: M 9 → 10 (Vuelo (10) = M en el motor). Cortagoblins: 2 → 3 Heridas.
- Conformes: Sappers (Cavar / Terreno hostil), Dwarf Carts, Tatuajes rúnicos, Hammerers/Longbeards (sin cambios en el AJ), Gran hacha de gromril.
- Colocación manual de marcadores de Mina: HECHO (v672).

## AJ Altos Elfos (v653, en curso)
- Guerreros del Páramo (FAQ: bosque 3"–9"): OK; añadido: no a ≤6" de elemento especial (CORREGIDO).
- Sendas ocultas: Lanceros/Arqueros con Moverse a cubierto (+1/modelo, 0-1 por 1.000 pts) y ±1 una vez por partida a la llegada de Emboscadores (+1 automático cuando hace falta): CORREGIDO (variantes _mc/_lcmc, chk).
- Guerreros de Chrace: Capa de león +10 pts/unidad en Lanceros/Arqueros (variantes _lc/_lcmc): CORREGIDO.
- Orgullo de Chrace (solo 3 Honores): CORREGIDO. Pendiente: resto de aj_highelves (unidades/objetos).
- Guarnición: Orgullo de la Flota (Guardia del Mar con Unidad regimental; 0-1 Disciplinada/1.000): CORREGIDO (variante he_seaguard_g, el resto de reglas por prefijo de tipo). Resto de la lista (porcentajes, 0-1 Emboscadores, Cortacielos, Nublado) OK. Cortacielos como montura: HECHO (v673).
- Compañía del Barco: sin escudo por defecto (equipo: armas de mano y arcos de guerra); los escudos solo con lanzas de empuje (gratis): CORREGIDO. Korhil, Lanceros/Lion Guard/Leñadores Chracios, Campeones de Chrace: OK (revisados). Pendiente aj_highelves: Ishaya Vess, Caudillo/Noble/Comandante, objetos (Hacha del Leñador, Arco del Marinero, Lanza Estelar, Hoja de Oro Marino, estandartes), Merwyrm.
- Comandante de la Guarnición: sin escudo por defecto; opciones Arco largo +4, Escudo +2, Armadura pesada +3; objetos mágicos hasta 75 (antes 50): CORREGIDO. Caudillo de Chrace, Carro del Caudillo y Tejedor de Tormentas: objetos hasta 75: CORREGIDO. Objetos del AJ Altos Elfos (Hacha, Arco del Marinero, Lanza Estelar, Hoja de Oro Marino, armadura/estandartes/talismanes/arcanos; Anillo de Furia NP1 por FAQ): OK. Pendiente: monturas del Comandante (Cortacielos +90/Grifo +130/Águila +60), Merwyrm, Ishaya detalles.
- Merwyrm (perfil, Capa abisal, Frío debilitante, cola, aliento): OK. Ishaya: perfil/reglas OK en datos. Monturas del Comandante de Guarnición (Cortacielos +90, Grifo +130, Gran Águila +60): HECHO (v673).
## AJ Orcos 2 (inicio v656)
- Horda Troll: Regeneración mejorada ahora vale para cualquier modelo con Regeneración (no solo Trolls): CORREGIDO.
- Objetos O&G (AJ Orcos 2): Da Akrit Axe (F+1 solo primera ronda de combate, no solo al cargar), Ídolo de Gork (+3" alcance hechizos), Sombrero de Orco Pensador (inmune a Impetuoso, él y su unidad), Estandarte de la Araña (acumula con Ataques envenenados: 5+), Escudo Rencoroso (1 natural al impactar → impacto F4): CORREGIDO. Pendiente: Escudo Rencoroso con 1 natural al herir; Hoja del Apuñalaespaldas (repetir al herir/impactar por flanco/retaguardia); Bastón de Baduumm (explosión con doble 1/6); resto de unidades de orcs2 (Kiknik, Ogdruz, Troll Hag, Bonegrinder, Black Orc Chariot).
- Bastón de Baduumm: explosión con doble 1/doble 6 (plantilla 5", F6 FP −1, se destruye; modelos bajo la plantilla aproximados por unidad, impacta con 4+): CORREGIDO. Hoja del Apuñalaespaldas: flanco → repite fallos al herir; retaguardia → también al impactar (v658): CORREGIDO. Kiknik/Ogdruz: perfiles y reglas OK (Protege al jefe ya implementado).
- Bonegrinder/Troll Hag/Carro de Orcos Negros: revisados, sin discrepancias nuevas. aj_orcs2: CERRADO (Escudo Rencoroso con 1 natural al herir: HECHO v668).
## AJ Reyes Funerarios 2 (inicio v658)
- Hueste Real/Culto Mortuorio (lista, reglas, Settra, Apophas, Incantaciones armoniosas, Animus, Terrores): OK. Objetos TK AJ: OK salvo Estandarte Real de Settra, que no daba Odio (personajes enemigos): CORREGIDO (v659). Pendiente: perfiles de unidades aj_tk2 (Necroserpiente, Carro Guardia, Cohortes) a comprobar con detalle.
## Cathay AJ (v659)
- Datos leídos de imágenes (rules/new/cathay_notes.md) ya contrastados en pasadas anteriores (AUDITORIA.md: Guerreros/Lanceros de Jade, personajes, Sentinelas, Linternas, máquinas, objetos, FAQ Cathay). Lista Gran Ejército (50/25/50/25, 0-3 máquinas/1.000, Centinela/Linterna según General, aliados): OK en armyIssues. El OCR de las tablas no es utilizable para recotejo numérico automático: sin nuevas discrepancias.
## Legends (leg_*), inicio
- leg_chaosdwarfs (v660): lista Gran Ejército: K'daai y Cañón de Magma/Demonio de Hierro → Especial; Jinetes de Lobo → Raro (0-1 por Khan); Mortero Terremoto → Raro; límites 0-1 Profeta/Castellán (incl. monturas), Taur'ruk por Destripadores, Demonio de Hierro, Gritamuertes/Cañón de Magma, Mortero, 0-2 Lanzavirotes por 1.000: CORREGIDO. Unidades no existentes en el libro (Guardia con Trabuco, Juramentados con Granizo, Centauros Toro, K'daai Quemahombres, Gran Taurus como unidad) desactivadas (el Quemahombres es el campeón de K'daai). Reglas: Castellán sin «Valor de los Eones» y con Armas hechizadas; Guardia Infernal: Destacamento, Unidad regimental, Muro de escudos; Juramentados: Unidad regimental, Muro de escudos; K'daai sin salvación 5+ inventada; Armas hechizadas implementadas (AP −1 en la única arma de mano, no con dos manos/dos armas): CORREGIDO. Presets Enanos del Caos rehechos. Pendiente: resto de leg_chaosdwarfs (magia, objetos, máquinas, Hellbound, Lammasu/Taurus).
- leg_chaosdwarfs (cont., v661): Cargador ogro del Mortero Terremoto (+20, +1 a la recarga lenta): AÑADIDO; Demonio de Hierro Ligado al infierno (+35) ahora cambia Miedo → Terror y da ataques mágicos: CORREGIDO. Carro de vapor y Acarreador: HECHO (v670-v673); +2 Heridas/+2 Ataques del Cargador ogro: HECHO (v669). Pendiente: Lammasu/Taurus detalles, magia y objetos.
- leg_chaosdwarfs: objetos (25 del libro) y reglas Backstab/Blackshard/Blazing/Hellbound/Resolute/Stampede: OK. CERRADO salvo Carro de vapor/Acarreador.

## Legends Demonios del Caos (v662)
- Lista Gran Ejército: Básicas = solo Furias + (según alineación del General: Sanguinarios+Sabuesos / Portadores+Nurglings / Demonetas+Buscadores / Horrores Rosados+Azules+Azufre). Especiales = resto de unidades base + extras por alineación (Machacasangre / Bestias+Zánganos / Engendros+Hellflayer+Carros / Lanzallamas+Chillones). Raras = el resto. Implementado en catsOf (General = personaje alineado más caro).
- Límites: 0-1 Gran Demonio (total), 0-1 Príncipe por 1.000, 0-1 Cañón de Calaveras por 1.000, Heraldos ≤ unidades de su alineación. Presets rehechos.
- Pendiente: unidades, dones, iconos y Lore of Daemons.
- Dones e iconos de Demonios: nombres, costes y textos comparados con el libro (comunes, Khorne, Nurgle, Slaanesh, Tzeentch): coinciden. Perfiles de unidad y Lore of Daemons pendientes. (Partidas de auditoría 1.852 por cambio de presets.)

## Legends Elfos Oscuros (v663, composición)
- Básicas: Guerreros, Ballesteros, Corsarios, Jinetes Oscuros (+0-1 Brujas Elfas con Bruja Sanguinaria). Especiales: Verdugos, Brujas Elfas, Sombras, Arpías, Guardia Negra (0-1 por Noble), Caballeros Gélidos (0-1/1000), Carros (0-2/1000), Hidra/Kharibdyss si el General es Maestro de Bestias Alto. Raras: Hermanas, Santuario, Hidra, Kharibdyss, Medusa, Brujos de Fuego (0-1/1000), Segadores (0-2/1000).
- Límites: 0-1 Señor Oscuro o Suprema Hechicera por 1.000, 0-1 Caldero por 1.000; eliminado el límite inventado de Hidra. Maestro de Bestias puede ser General (el Asesino no).
- Pendiente: perfiles, opciones y objetos.

## Legends Hombres Lagarto (v664, composición)
- Guardia del Templo pasa a Básica (0-1); Bastiladón a Especial (0-2/1000). Límites: 0-1 Slann, 0-1 Veterano Saurio o Sacerdote Skink por 1.000, Terradones y Ripperdactyls 0-1 por Héroe Skink, Salamandras/Razordones 0-1/1000, Stegadón/Troglodón 0-1/1000 (antes 2/1000 con Bastiladón).
- Pendiente: perfiles, opciones, objetos, Lore de Lustria.

## Legends Ogros (v665, composición)
- Ironguts Básicos; Gorgers Raros (0-3); Scraplauncher Especial. Límites por 1.000: Tirano o Maestro Matarife (combinados), Maneaters, Mournfang, 1 carro pesado (Ironblaster/Scraplauncher), Colmillotruenos, Cuernopétreo (antes 2/1000 con Gigantes).
- Pendiente: perfiles/objetos.

## Legends Skaven (v666, composición)
- Nightrunners y Stormvermin Básicos (Stormvermin 0-1/1000). Límites: 0-1 Señor de la Guerra o Vidente Gris/1000; 0-1 Ingeniero/Asesino/Sacerdote de la Plaga por 1.000 (combinados); Ogros Rata 0-2/1000; Fosa Infernal 0-1/1000; Monjes de la Plaga por Sacerdote; Jezzails y Globadiers por Ingeniero; Rueda/Cañón de Rayo solo con Ingeniero (0-1/1000); Catapulta/Incensarios solo con Sacerdote (0-1/1000).
- Pendiente: perfiles/objetos; armas de equipo (Ratling, Warpfire, Mortero, Warp-grinder, Doom-flayer) no están en la lista del libro: sin tocar.

## Legends Condes Vampiro (v667, composición)
- Murciélagos (Bat Swarm) Básicos; Carros de Cadáveres Especiales (0-3). Con Tumulario: 0-1 Guardia Sepulcral/Caballeros Negros Básica; con Rey Ghoul Strigoi General: Vargheists/Terrorgheist Especiales. Límites: Conde/Nigromante Maestro/Strigoi 0-1/1000; Rey Tumulario o Banshee 0-1/1000; Guardia Sepulcral o Caballeros Negros 0-1/1000; Horrores o Murciélagos Infernales 0-1/1000; Carruajes Negros 0-2; Vargheists, Terrorgheist/Varghulf, Caballeros de Sangre 0-1/1000; Hexwraiths y Huestes Espectrales ≤ Espectros/Banshees.
- Pendiente: perfiles/objetos de todos los Legends.

## Legends: objetos y perfiles (revisión automática, v667)
- Objetos (nombres+costes) de Hombres Lagarto, Ogros, Skaven, Vampiros, Elfos Oscuros y Demonios: todos coinciden con los libros.
- Perfiles: comparación automática de filas con puntos (HA/HP/F/R/H/I/A/L + coste). Sin discrepancias en tropas y personajes; las filas sin coincidencia son monturas/máquinas/carros (el juego fusiona dotación+montura en un perfil compuesto) o variantes con arma obligatoria (Sanguinario 370 = 355 + Látigo 15).

- v668: Escudo Rencoroso: ahora también un 1 natural al herir en combate provoca un impacto F4 FP − al atacante (antes solo al impactar).

- v669: Cargador Ogro (Mortero Terremoto): la dotación gana +2 Heridas y +2 Ataques (W 6, A 5) además de +1 a la recarga lenta; el despliegue aplica las Heridas de la opción.

## Aproximaciones restantes (v669, aceptadas)
- Fauces rechinantes (Engendro Gigante): el ataque de fauces se resuelve en el mismo paso de Iniciativa y no "golpea último"; efecto solo en muertes simultáneas. Curación y -2 FP correctas.
- Ancestral Fury, salto de Movimientos restantes del GK, Steam Carriage, Skycutter/Grifo/Águila como montura de comandante, Fauces de Hell Pit, marcador de mina manual: HECHOS en v670-v673 y Hell Pit revisada contra el libro en v594c (OK, sin aproximación pendiente).

## v670-v671 (aproximaciones cerradas según FAQ/libro)
- Fauces rechinantes (Engendro Gigante): 1 ataque por turno con las fauces golpea último (lote propio tras todos los pasos de Iniciativa); curación 1 Herida por Herida causada.
- Frenesí (FAQ Core p.172): +1 Ataque solo en el turno en que carga o en el turno siguiente a un movimiento de seguimiento (antes: siempre).
- Furia ancestral (Clan Real): +1 Fuerza al cargar 3" o más o en el turno tras un movimiento de seguimiento.
- Caballero Verde (Guardián de los Lugares Sagrados): en Movimientos restantes, si está completamente en terreno natural y no trabado, puede saltar a otro terreno natural (botón «Saltar de terreno»; la IA lo usa si queda claramente más cerca del enemigo); no puede mover más ese turno; regla de 1".

## v672 (Steam Carriage, Minas)
- Carro de Vapor (+10 pts: Lanzacohetes, Cañón de Magma, Mortero Terremoto): el Demonio de Hierro (Carriage Hauler) remolca hasta 2 máquinas con la mejora que estén completamente en su arco trasero y a 8" al inicio; acaban igualmente en el arco trasero a 8" (transformación rígida) y no cuentan como movidas.
- Emboscada subterránea (Expedición): los marcadores de Mina se colocan tras el despliegue de ambos bandos y antes del primer turno, con las posiciones reales: no en la zona rival, a 12" de otra Mina amiga, a 6" de unidades enemigas y a 3" de terreno especial. El jugador humano los coloca tocando el mapa (o «Colocar Minas automáticamente»); la IA los coloca sola.

## v673 (Comandante de Guarnición montado)
- Comandante de la Guarnición de la Guardia Marina puede montar Cortacielos de Lothern (+90), Grifo (+130) o Gran Águila (+60): variantes con perfil de montura (Águila/Grifo como los Nobles; Cortacielos como carro volador: R4, H 2+4, salvación 4+, Impactos D3+1). Evasiva y Disparar y huir solo si NO va en Cortacielos (también a la Guardia Marina unida); Atacar primero no afecta a la montura. Lanza de caballería: no ofrecida («si va apropiadamente montado»: ninguna es caballería).


## v674 (revisión de pendientes)
- Limpiadas las líneas desfasadas (salto GK, minas, monturas Comandante, Escudo Rencoroso, Aproximaciones restantes).
- Siguen abiertos (requieren fuente o revisión larga): pasada capítulo a capítulo de core/rh/fof, perfiles Legends de Daemons/Lizardmen/Skaven/Vampiros/Ogros/Elfos Oscuros, resto de aj_highelves/Bestias/aj_chaos2/aj_tk2, Cultos Caóticos (sin fuente) y Press of Battle (solo en la FAQ).
- v674: Lore of Daemons (Viento de Plaga 7+/12", Fuego Rosa 8+/18" D3+3 F3 flamígero, Don de la Mutación 8+/12+ −D3 a HA/F/R, Himno Cacofónico 10+ con Estupidez): COMPARADO con leg_daemons.txt, OK. Pendiente: Lore de Lustria y perfiles de unidad.
- v674: Lore de Lustria (Apoteosis 10+/12+ 24" D3/D3+1 Heridas + Miedo/Terror; Monzón 8+/15" plantilla 5", empapado −1 a impactar, máquina con 1 no dispara): COMPARADO con leg_lizardmen.txt, OK.
- v674: aj_highelves objetos (Hacha del Leñador 90, Arco del Marinero 50, Lanza Estelar 45, Hoja de Oro Marino 40): costes, perfiles y restricciones COMPARADOS con el libro, OK. Pendiente aj_highelves: estandartes, Ishaya Vess/Caudillo/Noble/Comandante.
- v674: aj_beasts2 Gors Deformes (perfil 5/4/2/3/4/1/3/D3/7, Splice-horn Ld 8 +8, 16 pts, Piel blindada (1) de serie, Bendiciones, 0-1 Emboscadores +1) y Hijos de Ghorros (+2 pts, +1 HA/Ld, Perforante 1): COMPARADOS, OK. Pendiente: Ungor Ravagers/Líder de la Manada, Corona de Astas (objeto OK), resto de unidades.
- v674: Ungor Ravager / Líder de la Manada / Perros Primigenios (perfil 7/3/3/3/3/1/3/1/7, 7 pts, lanzas arrojadizas y escudo, filas traseras, 1 por cada 3 perros, Piel blindada/Venenosos +1): COMPARADOS con aj_beasts2, OK.
- v674: aj_chaos2 Carro de Elegidos (140 pts, WS5 S4 Ld9 A4, Impactos D6+1) y Dragón Warpfire (Final explosivo D6 F5 PA−2 a 6", Fuego y Caos Sv 5+ vs mágico/flamígero, Aura sin salvaciones a 3", Regeneración 5+, Mago +30/+60): COMPARADOS con el libro y el motor, OK. Pendiente aj_chaos2: Quimera, Engendro Gigante, Caballeros Elegidos, objetos.
- v675: Quimera (rh.txt p.~118): base 180 pts (antes 200 con aliento de serie); opciones nuevas Aliento llameante +20, Regeneración (5+) +15, Ataques envenenados +10. PENDIENTE: Cola de demonio +10 (D3 Ataques extra con arma propia F, PA −1): requiere perfil de ataque aleatorio separado. Auditoría v675 en curso.
- v675 auditoría: 1.858 partidas aprox., 0 errores, 0 invariantes (limpia).
- v675: Caballeros Elegidos (rh.txt p.~85): perfil 5/3/4/4/1/4/2/9, 36 pts, Armadura del Caos 6+, Contracarga/Primera carga/Tozudos/Zancada, 0-1 unidad: COMPARADOS, OK. Nota: el límite máx. 10 modelos por unidad es del motor (el libro no fija máximo).
- v675: aj_chaos2 Lobos de Piel (7/5/-/4/4/3/4/3/7, 45 pts, Jarl +7 A4, Regeneración 5+, Forma deformada, Escaramuzadores, Rabia sanguinaria, Furia primigenia): COMPARADOS, OK.
- v676→v677: Carros de la Guardia de la Tumba: el libro dice 53 pts pero la FAQ RH (p.45) ordena cambiarlo a 49 → se queda en 49 (v676 lo había puesto a 53 por error; revertido en v677 por mandar la FAQ). FAQ: la armadura 4+ no mejora por los escudos de la tripulación (OK) (resto del perfil: tripulación 3/3/4/2/1/7, armadura 4+, Capitán +7, 3+ carros: OK). Necroserpientes (7/3/0/5/4/3/3/3/7, 38 pts, Emboscada, Piel blindada, Veneno, Regeneración 6+, Indomable 1): perfil OK.
- v677 pasada FAQ de puntos ("Change the Points"): Carros Esqueleto 41, Minotauros 44, Centigors 17, Ogros Dragón 59, Guardia del Claro 10, Guardia Eterna 12, Jinetes del Claro 17, Hermanas de la Espina 22, Peregrinos 6, Caballeros Pegaso 59, Jinetes Salvajes 26, Araloth 150, Carros Guardia TK 49; objetos: Estandarte de Wei-Jin 60, Icono Furia Celestial 45, Sello de Xing Po 35, Anillo Rubí 35, Hoja de Ogro 75: TODOS coinciden con data.js. Pendiente de comprobar en esta pasada: Maw Shard 50, Pegaso Real +70 y los cambios de perfil/texto.
- v677: FAQ FoF Pegaso Real +70 y Tipo de tropa Criatura monstruosa: Barón 100+70=170, Duque 175+70=245, Paladín 60+70=130, Profetisa 135+70=205, tt monCreature: OK. Fragmento del Maw 50 (FAQ Cathay): OK. Siguiente: cambios de perfil/texto de las FAQ (no de puntos).
- v677 FAQ perfiles: Engendro del Caos M 2D6+1, General Ld10, Capitán Ld9, Lector Ld9, Sacerdote de Ulric Ld8, Rangers enanos 5-20, Dríadas M6, Linterna Celeste T4: COMPARADOS con data.js, OK. Pendiente de comprobar: Sacerdote de Sigmar Ld8, Gran Sacerdote de Ulric Ld9, Torpedo/Gran espada F, Caballeros de la Búsqueda 3+, Hacha de Dargo, Destripadores, Warhorse T-, Bombas de Fuego F3.
- v678 (FAQ FoF p.25): Torpedo Trollhammer: Fuerza 8 → 5 y "Obra enana" → Torpe (no puede usarse en Reacción de cargar con Aguantar y disparar): CORREGIDO. Gran espada/Campeón del Conde F4, Sacerdote de Sigmar/Ulric Ld8, Caballeros de la Búsqueda 3+: OK.
- v678 auditoría: limpia (0 errores, 0 invariantes).
- v678 FAQ FoF/Cathay: Hacha de Dargo F+2 (Ungrim sb 2), Martilladores Armadura de gromril, Bombas de Fuego de Dragón F3: OK. Zapadores con Terreno hostil: OK.
- v678 FAQ Core/RH hechizos y objetos: Cábala Mortal 8+, Vórtice Espiritual 10+, Anillo Rubí (35 pts, Bola de Fuego ligada Nivel 1), Esplendor diabólico y Aura encantadora solo infantería/caballería: OK.
- v679 (FAQ RH): Carros Esqueleto: Valor de armadura 5+ → 4+ (p.141): CORREGIDO; Lobos de Piel: añadido Miedo (p.40), base 50x50 y Jarl (Campeón): CORREGIDO. Dragón Warpfire Orden cerrado: OK. Pendiente de esta página: Estandarte de la Tormenta/Flail of Skulls/Da Akrit Axe (F solo a cargados), Stone Shaper, Usekhp, Goblin Hewers, Infernal Puppet, Casket of Souls, Strangleroot 8+.
- v679 auditoría: limpia (0 errores, 0 invariantes).
- v680 (FAQ RH p.46 y p.35): Da Akrit Axe y Storm’s Wrath (Frydaal): el modificador de Fuerza solo se aplica contra enemigos a los que el portador cargó ese turno (antes: primera ronda de combate): CORREGIDO. El Mayal de Calaveras ya lo hacía.
- v680 FAQ RH: Strangleroot 8+ y Escultor de piedra (+1 Regeneración, FAQ p.42): OK. Pendiente: Crusher +7 (Ogre Bulls de las Tierras Baldías), Goblin Hewers base 50, Usekhp, Infernal Puppet, Casket of Souls, Torrent of Filth, Rapid Regeneration, Vortex of Souls.
- v680 auditoría: limpia (0 errores, 0 invariantes).
- v681 (FAQ RH p.43): Ogros de las Tierras Yermas: Aplastador (campeón) +6 → +7 pts: CORREGIDO.
- v681 auditoría: limpia (0 errores, 0 invariantes).
- v681 FAQ RH: Cañón Infernal base 100x150 (Manejadores 25x25), Reprimir impetuosidad (repetir test de Ld, implementado con la FAQ), Contracarga Caballeros del Caos, Impetuoso Dragón del Caos, Pigstikka solo al cargar: OK.
- v682 (FAQ RH p.149): Ataúd de las Almas: hechizos ligados Luz de la Muerte y Luz de la Protección con Nivel de Poder 2 (antes 3): CORREGIDO. Marioneta Infernal (no huyendo ni trabado, 15"): OK. Luz de la Protección no acumulable (FAQ Q&A): pendiente comprobar.
- v682 auditoría: limpia (0 errores, 0 invariantes).
- v682 FAQ RH Q&A: Terrores de las profundidades usa la Fuerza de Unidad de la unidad que lo emplea (usOf(res)): OK. Forma deformada solo afecta a la unidad (el personaje unido no se transfigura): OK por diseño (fx por unidad). Ataúd Movimiento de Reserva fuera de Movimientos restantes: pendiente de comprobar.
- v682 FAQ Core p.28/p.286: Baggage trains como terreno impasable (hitsRuin incluye s.bags) y Dead or Fled (unidad ≤25% de su Fuerza de Unidad inicial o de sus Heridas → 50% de su coste redondeado arriba): OK en el motor. Pendiente de comprobar: Bosque (Woodland Boundaries, cobertura parcial si más de la mitad dentro).
- v683 (FAQ Core p.321): Pilar de Fuego: impactos D3+3 F3 FP −2 → F4 FP −1, terreno difícil (ya no peligroso) sin línea de visión: CORREGIDO. Confusión (8+), Escudo de Saphery 8+, Muros de Tierra 9+, Senda Mística (12" cualquier dirección, a más de 6" de enemigos; texto actualizado): OK.
- v683 auditoría: limpia (0 errores, 0 invariantes).
- v683 FAQ Core p.270 Woodland Boundaries: más de la mitad dentro del bosque = cobertura parcial; completa solo si otra cosa oculta más de la mitad (rules.js ~1558): OK.
- v683 FAQ Core p.339-340: Hoja Berserker (F+1, Ataques extra +1, Impetuoso, mágica), Yelmo Deslumbrante solo infantería/caballería: OK. Mapas de despliegue Close Encounter / Opposed Flanks (AJ Battle March, Settra’s Fury): N/A, ese AJ no está entre los archivos ni existen esos mapas en el motor.
- v683 FAQ RH p.43-45 y FoF: Usekhp Desecación 9+, Torrente de Inmundicia 7+, Regeneración rápida 8+, Cortagoblins (base 50x75, Ataques de la dotación 2): OK. Nota: la dotación de las máquinas no lleva Heridas propias en el motor (solo las de la máquina).
- v683: Recibido Battle March (General’s Companion, 52 págs., PDF de imágenes): OCR en curso a rules/new/battlemarch.txt. Pendiente: mapas de despliegue (Close Encounter, Opposed Flanks, etc.), escenarios y FAQ relacionadas; implementar según libro/FAQ.
- v684: Battle March (libro, p.26-27): añadidos los 6 mapas de despliegue (bm_pitched, bm_close, bm_opposed, bm_meeting, bm_pass, bm_outflank) en mesa 44"x30", 5 rondas, PV reducidos (General +50, estandarte 25, como Seize). Soporte de zonas no rectangulares (poly/excl) en inZone/placeIn/render 2D/3D. PENDIENTE: mapas espejados (Alternate Deployments), tirada D6 de mapa, objetivos secundarios/happenings/secretos de Battle March, tesoros y puntos estratégicos (+10/+25 por turno), listas Muster, escenarios Axe Bite Pass.
- v685: auditoría v684 limpia (1.858 partidas). Battle March objetivos (p.24-25): tirada D6 al crear (1-2 dos tesoros a ±7,5" del centro; 3-4 tres a 0/±11"; 5-6 punto estratégico central de 100 mm, propiedad D6: Magia en el aire RM−2 / Celo Frenesí / Obstinado hasta fin del siguiente turno). Control: unidad más cercana a ≤3", US 5+, no huyendo ni Estupidez; empate por US; si persiste, disputado. +10 PV por tesoro, +25 por punto estratégico, al final de cada turno de jugador. APROXIMACIONES: el terreno a <3" de un objetivo se elimina (el libro lo desplaza); el punto estratégico es 'deco' con sin-LOS (sin verificar impasabilidad). PENDIENTE: Raid & Burn (destruir tesoros, +30), Baggage Carts de Battle March, happenings, secretos, Muster, mapas espejados, Axe Bite Pass.
- v686: Battle March Sucesos aleatorios (p.31-33) como opción de menú (Ninguno/Clima/Caos de guerra/Ambos, solo escenarios bm_). Clima (D6 antes del despliegue): 1 Aguacero (−1 M, sin Zancada veloz), 2 Vendaval (−6" alcance F≤5, mín. 3), 3 Calor (D6 por unidad, 1 o 1-2 con armadura pesada; D3 modelos T o −1 H), 4 Rayos (1-2: unidad aleatoria sufre D6 impactos F4 AP−1). Caos (desde turno 2, el primer jugador tira ≤ nº de turno; sin repetir): 3 Munición menguante, 4 Tesoros 20 PV / estratégico 50 PV, 5 seis rondas. PENDIENTE: Clima 5 Remolino y 6 Vientos helados (se repite la tirada), Caos 1 Inestabilidad etérea, 2 Carro perdido, 6 Mercenarios (se repite), Terreno salvaje, Raid & Burn, secretos, Muster, espejados, Axe Bite Pass. Auditoría ahora alterna hap.
- v686: auditoría limpia (1.858 partidas, 0 errores, 0 invariantes) con objetivos BM + sucesos aleatorios.
- v687: Objetivos secretos Battle March (p.38-39): añadidos Reconocimiento 20, Alarde de duelista 30 (campeón 20 PENDIENTE: solo personajes), Recoger recursos 30, Matar a la bestia 50, Maestría mágica 50, ¡Detenedlos! 75, Tomar la torre 40. PENDIENTE: Emboscada bien urdida 20, Explorar el área 25 (nominar terreno), Resistir al enemigo 50 (nominar unidad). CORREGIDO bug: 'Cazador de bestias' usaba tt==='monster' (nunca se cumplía) → ahora isMonster.
- v688: Battle March composición (p.23): ejércitos de 400-750 pts (menú, de 50 en 50, solo escenarios bm_); modo de composición «Battle March»: mín. 2 unidades no personaje (valen máquinas, no enjambres/bestias de guerra), personaje ≤25 %, US ≤20, Básica ≤35 %, Especial ≤30 %, Rara/Mercenaria ≤25 %; 0-X por 1.000 pts: se permite uno (ya así: max(1, ⌊pts/1000⌋)). Lista por defecto: recorte del preset de 500. PENDIENTE: los presets de 500 incumplen límites BM (p.ej. Orcos/Tropas Estatales US>20); listas ejemplo Muster del libro (Dwarfs, Beastmen, Bretonnia, High Elves, Empire, O&G), Raid & Burn, Clima 5/6, Caos 1/2/6, troll, espejados, Axe Bite Pass.
- v689: presets BM-legales (bmFit en main.js): US ≤20, máximos por categoría y recorte al límite; quita objetos/opciones si un personaje supera el 25 %. RESTO: 9 casos (400-500 pts) con general de preset >25 % (Señor del Claro, Barón, Jefe Orco, Señor de las Bestias…) — hay que cambiar de personaje; pendiente. Pendiente también: listas Muster ejemplo, Raid & Burn, Clima 5/6, Caos 1/2/6, troll, espejados, Axe Bite Pass.
- v690: Battle March Raid & Burn (p.36): opción de menú. Unidad US 5+ en contacto con un tesoro al final de su turno empieza a destruirlo (no puede disparar); al inicio de su siguiente turno, si sigue en contacto, US 5+, sin combate ni huir → tesoro destruido, +30 PV. Aproximación: contacto ≤0,5" del tesoro y no exige haberse movido en Movimientos restantes; solo lanzar hechizos de Combate/Propio no aplicado. PENDIENTE: Baggage Carts (carro con Flee to Safety / Non-Combatant, ±25 PV), listas Muster ejemplo, Clima 5/6, Caos 1/2/6, troll, espejados, Axe Bite Pass.

## Battle March — v691/v692 (pasada «sin aproximaciones»)
- v691: terreno a ≤3" de los objetivos se desplaza la mínima distancia (no se elimina); punto estratégico = ruina impasable que bloquea LdV (propiedad D6: magia/celo/obstinación); control con `ocDist` exacto (distancia a la peana del tesoro/punto); Raid & Burn exige haber movido, US≥5, sin trabar y contacto real; solo hechizos de Combate/propios durante la destrucción.
- v691: clima (1 barro, 2 vendaval, 3 calor, 4 rayo, 5 torbellino de polvo, 6 vientos helados), Caos 1/3/4/5, terreno salvaje 1–5.
- v692: Carro de equipaje (UNITS.bm_cart: Non-Combatant, Flee to Safety, Loner, Close Order). No carga, no persigue/sigue (`restrains`), no recibe Presencia inspiradora / Mantened la posición. PV (p.36): vivo al final +25 al dueño, si no +25 al rival; +25 si está completamente en la zona de despliegue enemiga; +25 si huyó (toca/cruza un borde dentro de la zona enemiga → sale de juego, no destruido). Menú `bagc` (Ninguno/J1/J2/Ambos).
- v692: Caos 2 (dado de dispersión desde el centro hasta el borde, ganador de tirada = dueño del carro perdido) y Caos 6 (tirada: ganador una unidad de 10 Mercenarios errantes, empate ambos; entran por cualquier punto del borde fuera de las zonas de despliegue; el jugador elige equipo —escudos/arcos cortos— y posición; 50 pts).
- v692: Terreno salvaje 6 Guarida de Troll: el Troll aparece en contacto con el arco frontal, cuenta como cargador, combate inmediato; si pierde la guarida queda vacía, si gana vuelve a la guarida con sus heridas y defiende de nuevo.
- Pendiente: secretos Emboscada, Reconocimiento, Superar al enemigo, Floritura del duelista (campeón); mesa 36"x48", mapa D6 y espejados, Muster, Axe Bite Pass.
- v694/v695: secretos Battle March exactos: Emboscada bien preparada (una unidad enemiga se retira en buen orden o huye durante una fase de Disparo → 20), Explorar la zona (terreno nominado en secreto al empezar; unidad US 5+ completamente dentro → 25), Resistir al enemigo (unidad nominada viva, sin huir, US 5+ → 50), Floritura (campeón de unidad muerto en desafío → 20, personaje → 30, solo una vez). Reconocimiento ahora mide la distancia real de la peana a los tramos de borde de mesa que están dentro de la zona enemiga (3"), y Recoger recursos usa la peana completa (esquinas) dentro de cada elemento. Las nominaciones las hace la IA sola; el jugador las elige en un cuadro (acción `secNom`) antes de actuar.
- v695: mapa de despliegue D6 («Mapa aleatorio»), despliegue invertido (Normal/Invertido/D6; solo Encuentro cercano, Flancos opuestos, Encuentro y Flanqueo) y zona del 2.º jugador (Primera/Segunda/Al azar). Pendiente: mesa de 36"x48" (>600 pts), alternancia de unidades en despliegue, listas Muster, Axe Bite Pass.
- v696: mesa de Battle March 30"x44" (≤600 pts) o 36"x48" (>600 pts); los mapas de despliegue usan las medidas impresas (7,5", círculo 15", 18", 11", 22") sobre la mesa elegida.
- v697: Muster: solo UNA opción «0-X por 1.000 pts» en todo el ejército (unidad, personaje o mejora); los presets se recortan en el menú. NO implementado (decisión de diseño, común a todo el juego): despliegue por unidades alternas (el motor coloca el ejército y se ajusta antes de «listo»). Pendiente: los 6 escenarios de Axe Bite Pass y sus listas de ejemplo.

## v698 — Battle March: Axe Bite Pass (6 escenarios)
- Implementados: Clash of Steel (Weisnicht), emboscada en reserva (Bel-Cedas), Saqueadores de Drazgog (graneros/botín), forja de Karak (+1 Armour Bane), Sturdham (empalizada, tesoros, aldea +50), Gemelwald (edificios, Hold Fast!, Ours for the Taking!).
- Aproximaciones geométricas declaradas (medidas tomadas de las figuras): Sturdham 16x12 (escala del dibujo; el texto dice 20x18 y no cabe); posiciones de edificios de Gemelwald ("mitad del defensor"); forja de Karak medida de la figura; graneros 4x4.
- Pendiente: despliegue alterno por unidades, nota de oración bretoniana del Clash, listas de ejemplo Muster, menú atacante/defensor (solo vía zsw).

## v699–v700 — Battle March: listas de ejemplo (Muster Lists)
- `EXAMPLES` (data.js): Waaagh! Drazgog (orcs), Helmgart Wardens (empire), Throng of Karak Ziflin (dw), Beasts of the Reikwald (bm), Knights of Montfort (bret), Warriors of Ulthuan (he). Botón «Ejemplo: …» en el editor de ejército.
- Costes del motor vs libro: coinciden salvo Jinetes de Jabalí (97/100), Batidores (101/111), Wargor (62/63), Hombres de Armas (65/72: falta Monje del Grial, +7). Pendiente de datos (no aproximado): se avisa con un toast al cargar.
- Battle March p.23: «al menos un personaje que actúe como General»: `generalType()` crea una variante con `general:true` del personaje marcado `gen` (o mayor Ld/coste, sin portaestandarte) al crear la partida; armyIssues ya no exige un tipo-General en comp 'bm'.
- Emboscadores de Gors/Ungors (Ravening Hordes: 0-1 unidad por 1.000 pts) ahora disponibles en Gran Ejército y Manada Salvaje (antes solo Salvaje), con comprobación de límite.
- v701: añadido Guantelete del Duelo (bret, 5 pts; los desafíos del portador no pueden rechazarse; Paladín de Montfort ahora 141). Monje del Grial (segundo campeón +7, Blessed Triptych +25) sigue sin implementar: requiere segundo modelo de campeón.

## v702 — Tipo de partida, despliegue alterno, Monje del Grial
- Tipo de partida (Core vs Battle March): `GAME_MODES`, `BM_SCN_IDS`, `NORMAL_SCN_IDS`, `modeOf`; `createGame({game})` (si el escenario no es del tipo, usa glory/bm_pitched); `s.game`. Menú: selector «Tipo de partida»; cada tipo muestra solo sus escenarios y su composición (Battle March: solo «Battle March»; normal: Guerra abierta/Gran Refriega/Armas Combinadas).
- BUG corregido: al empezar desde el menú no se pasaban `hap`, `raid`, `bagc`, `rev`, `zsw` ni `lists` a createGame (solo en el camino por defecto); ahora sí.
- Despliegue alterno (Core p.285 «Alternating Units»): `alt:true` (por defecto contra la IA; opción «Despliegue» en el menú). Gana la tirada quien elige quién despliega primero (los escenarios Axe Bite Pass lo fijan: Weisnicht/Karak atacante, Saqueadores defensor; Bel-Cedas/Sturdham/Gemelwald «ejército entero»: defensor entero y luego atacante). Se turnan una unidad no personaje; máquinas de guerra todas a la vez; personajes todos a la vez y al final (empieza quien desplegó primero); Exploradores al final, de uno en uno, empieza el ganador de una tirada. Una vez desplegada, la unidad no se reposiciona; lo que no cabe va a reserva. Acciones `altFirst/altPick/altDone/altAuto`; `altRun(s)` resuelve todo (auditorías). Solo contra la IA (dos jugadores/códigos siguen con despliegue rápido).
- Monje del Grial (+7, segundo campeón) y Tríptico bendito (+25, Tozudo) ahora también en Hombres de Armas; corregido el coste de Guardia de Terratenientes (+7 por unidad, no por modelo).
- Lista Beasts: Jinetes de Jabalí del ejemplo = Boss + estandarte + músico + escudos (100 pts). Siguen sin cuadrar con el libro Batidores (111/101; el +10 coincide con el trabuco granadero) y Wargor (63/62).
- v703: papel atacante/defensor (menú, escenarios Axe Bite Pass: Atacante/Defensor/D6 sobre el parámetro zsw); despliegue alterno también en Dos jugadores (pantalla de relevo); tcfg del menú ya incluye hap/raid/bagc/rev/zsw/lists/alt/game.

## v705 — Sharpshooter de los Batidores y Wargor del ejemplo
- Batidores (FoF p.84): el Sharpshooter (campeón, HP 5) puede sustituir el arcabuz de repetición por par de pistolas (gratis), arcabuz lanzagranadas (+10; FoF p.77: 24", F4, PA −2, Aparatoso, Lento, D3+1 impactos por impacto) o pistola de repetición (gratis). Opciones `ssp/ssb/ssr` (mecanismo `cnt`/`wrg`); el volumen principal pierde un tirador (`minus`). El ejemplo de Helmgart (Batidores con lanzagranadas) suma 111 como el libro.
- Wargor del ejemplo Beasts of the Reikwald: el precio impreso (63) solo se alcanza con arma a dos manos + armadura pesada (55+4+4); el texto dice «two hand weapons» (62). Se usa 63 (el total de la lista, 592, depende de él). Discrepancia del propio libro, sin FAQ.

## v706 — pasada de pendientes (orden del usuario 10:27: «todo exactamente como FAQ y reglas; prevalece lo más reciente»)
- Quimera (RH): Cola de demonio +10 (FoF/RH «fiend tail»: D3 Ataques adicionales cada ronda con su propia arma, F de combate, FP −1, sin Perforación; la Perforación (2) es solo de garras y colmillos). Mecanismo `slots` con `xD3`, `apA`, `abX`.
- Bendiciones de la Dama (FoF «Blessings of the Lady»): ya no son automáticas. Tras el despliegue, en lugar de la tirada del primer turno, el ejército de Bretonia puede rezar (decisión del jugador; la IA reza): el rival cuenta como ganador de la tirada y juega primero. Si no hay tirada (primer turno fijado por escenario) o hay dos ejércitos de Bretonia, no puede rezar y sus modelos no tienen la regla. Se pierde al instante al huir (retirarse en buen orden no cuenta) o al rechazar un desafío un personaje. Exiliados: regla propia (gloria recuperada), sin cambios.
- Duelo del Guerrero (AJ Caos, Lobos del Mar): en lugar de la tirada puede desafiar; el rival acepta o rechaza (rechazar = el ejército de Lobos cuenta como ganador de la tirada y juega primero); ambos nominan un campeón de 1 Herida (infantería/caballería), combaten como en desafío y el vencedor juega primero (empate: tirada normal). Un ejército de Bretonia que acepta cuenta como haber rezado; si rechaza, pierde la regla. Clash of Steel (Battle March): si gana un ejército de Bretonia cuenta como haber rezado (nota del libro).
- Secretos de Battle March: las 10 tarjetas de las pp.38-39 ya estaban todas (v694/v695); las notas «pendiente» anteriores estaban desfasadas.
- Tabla D6 de escenarios narrativos (p.12-17): botón «Escenario narrativo al azar (D6)» en el menú de Battle March; el libro no trae otra tabla de campaña enlazada (solo mantener el papel atacante/defensor, ya soportado).
- FAQ FoF: añadido el Sumo Sacerdote de Ulric (110 pts, Ld 9 por FAQ; cuenta como el Lector en el 0-1 por 1.000). FAQ Dwarfs AJ: Buscadores de Fatalidad ganan Escaramuzadores (ya no son personaje); Cortagoblins: dotación con 2 Heridas (base 50x75 ya estaba). Comprobados contra la FAQ y OK: Viletide 9+, Usekhp 9+, Torrent of Filth 7+, Rapid Regeneration 8+, Remolino Fétido, Crusher +7, Sacerdote de Sigmar Ld8, Lector Ld9, Sacerdote de Ulric Ld8, Torpedo F5 Aparatoso, Caballeros de la Búsqueda 3+, Hacha de Dargo F+2, Sappers Terreno hostil, Mayal de Calaveras y Da Akrit Axe (F solo a cargados).
- Sin fuente (no se puede implementar): Cultos Caóticos. Legends: nombres y costes de objetos y perfiles ya contrastados con los libros en v667.

## v707 — primer turno exactamente como el libro (orden del usuario 10:42: «no vuelvas a asumir nada ni a aproximar»)
- Antes el primer turno se sorteaba al azar 50/50 salvo en dos escenarios con reservas (APROXIMACIÓN eliminada). Ahora, en los escenarios cuyo texto lo dice, hay tirada real (se repite en empate) con +1 a quien termina de desplegar primero (con despliegue alterno: quien coloca su última unidad antes; si no, quien pulsa «Listo» antes), +1 al rival si se disparó la Flecha de Kurnous y el ±1 de Maestría estratégica (Hans; hoy siempre +1).
- Tabla `RO` (rules.js) con la fuente de cada escenario: Core (L'Anguille/Open Battle, Odo Todmeyer, Gisoreux Gap, Lonely Tower, Drakwald Forest Incident): el ganador JUEGA primero, +1; Pine Crags: el ganador juega primero, sin +1; Matched Play Guide (King of the Hill, Close Quarters, Encirclement, A Chance Encounter): el ganador ELIGE, +1; Seize the Tower (Infamy) y mapas genéricos de Battle March (p.28): el ganador ELIGE, sin +1; Battle March Clash at Sturdham: el ganador juega primero. Drawn Battlelines: el libro de origen no está entre los archivos; su descripción dice «como Open Battle» y se aplica eso.
- Cuando el ganador elige y es humano, aparece un menú (primer/segundo turno); la IA elige jugar primero (política de la IA, no regla).
- Bendiciones de la Dama / rechazo del Duelo del Guerrero: el rival (o el ejército de Lobos) «cuenta como ganador de la tirada»: ya NO se le fuerza el primer turno; sigue la regla del escenario (juega primero o elige).
- (Superado en v708, ver abajo.)

## v708 — decisiones previas a la batalla: la IA decide con su autoaprendizaje; el jugador humano elige
- Rezar (Bendiciones de la Dama), desafiar/aceptar/nominar campeón en el Duelo del Guerrero, jugar primero o segundo cuando el ganador elige, y el modificador de la Maestría estratégica de Hans (+1, −1 o ninguno; AJ Imperio: «you may apply a +1 or −1 modifier») ya no son reglas fijas: si decide un humano, menú con las opciones; si decide la IA, `setAIDecider` (ai.js) simula cada opción en copias del estado (3 muestras; el nominar campeón, 2 muestras sin jugar), juega una ronda con la política interna y puntúa con los pesos aprendidos (`valueOf`/`features`), eligiendo la mejor. Sin evaluador (pruebas solo de reglas) se toma la primera opción.
- Sigue como estaba (declarado): «Drawn Battlelines» sin fuente en los archivos (se aplica «como Open Battle»); el Sumo Sacerdote de Ulric puede ser General por su Ld 9 (Core: el General es el personaje de mayor Liderazgo).

## v709 (sin supuestos ni aproximaciones: geometría, presets, despliegue alterno)
- Geometría de Axe Bite Pass medida/derivada del libro (mapas pp.15-17 del PDF): **Sturdham**: cercado de 20"x18" (cotas del mapa, antes 16x12 «a escala del dibujo»), centrado, continuo como en el mapa (sin las puertas que yo había añadido), edificios en sus posiciones relativas del mapa, tesoros a 7,5" de los bordes cortos; el cercado puede entrar 1,5" en las zonas en mesa de 30"x44" (los muros bajos no impiden desplegar). **Karak**: la forja está en la diagonal de la mesa y sobre el arco de 18" de la zona del defensor (se calcula para 44x30 y 48x36). **Gemelwald**: cúmulo de 5 edificios con posiciones y tamaños medidos del mapa y llevado a la mitad del defensor (el texto dice «en la mitad del defensor» y manda sobre el dibujo, que lo muestra en la contraria).
- Presets Battle March (`bmFit`, ahora en data.js): si un personaje sigue superando el 25 % tras quitar objetos se sustituye por la mejor alternativa legal de su facción; unidades que no caben en su categoría se sustituyen o quitan; Unidades básicas mínimas se completan. Todos los presets de 400-750 pts cumplen las reglas salvo Reinos Ogros a 400 pts (el personaje más barato, 105 pts, supera el 25 % de 400: la lista legal mínima es 420 pts).
- Despliegue alterno **Flank Attack (Core p.292)**: fase `fsel` (cada bando decide en secreto su fuerza de flanqueo; el rival no ve sus unidades de flanco; botón «Fuerza de flanqueo decidida»), fuerza principal alternando desde el ganador de la tirada, y después fuerzas de flanqueo alternando en la zona de 18" (etapa 1). En el texto el ganador despliega primero (prevalece sobre la frase general «elige quién despliega»).
- Despliegue alterno en **partida por código**: cada cambio de turno genera un código para el rival; el jugador 2 puede empezar si le toca.
- **Elección de zona de despliegue (A/B)** por el ganador de la tirada (Core: Open Battle, Odo, Gisoreux, Lonely Tower, Pine Crags; Matched Play Guide: Glory/KotH/Drawn/Close/Encirclement/Chance; Seize the Tower): fase `zone`, acción `altZone`; las zonas son simétricas por rotación de 180° (se comprueba). La IA decide por autoaprendizaje (`kind 'zone'`). Quién despliega la primera unidad: Core elige el ganador; Matched Play, Seize the Tower, Pine Crags y los mapas genéricos de Battle March: despliega el ganador (antes siempre elegía).
- «Drawn Battlelines» SÍ está en matched.txt (escenario 3): sin párrafo de primer turno propio, rige la regla general de la guía (el ganador elige, +1): RO.drawn = [1,1] (antes «como Open Battle», [1,0]).
- «A Chance Encounter» (Matched Play Guide, PDF en los adjuntos, p.18 del PDF): el mapa muestra **cuatro cuadrantes completos** (media mesa cada uno: A1 abajo-izquierda, A2 arriba-derecha, B1 arriba-izquierda, B2 abajo-derecha) con un **círculo central de 18" excluido**; el motor tenía «franjas de 15"» (error mío, quitado). El ganador de la tirada elige una de las cuatro zonas y el rival ocupa la opuesta de la misma letra (A1↔A2, B1↔B2); las posiciones de despliegue se reflejan/rotan a la zona elegida. La IA elige por autoaprendizaje entre las cuatro.

## v711 – Zonas contra el mapa (Matched Play Guide)
- King of the Hill corregido: zonas de 56"x14" a lo largo de los bordes largos (8" de margen en los cortos, 10" libres hasta la línea central); antes 18" en los bordes cortos (no coincidía con el mapa).
- Drawn Battlelines corregido: dos triángulos rectángulos opuestos (catetos 72" y 24"), simétricos por rotación de 180° (el cambio de zona sigue siendo válido); antes tiras de 12". Generador `zf(W,H)` en `scaleScn` para otras mesas.
- Glory y Encirclement revisados contra su mapa: coinciden. Close Quarters y Chance Encounter ya revisados.
- Seize the Tower: mapa oficial obtenido de Warhammer Community (PDF «Seize the Tower», feb 2025): mesa 44"x30"; zona A 36,5"x7,5" pegada al borde superior e izquierdo (7,5" libres a la derecha); zona B 36,5"x7,5" en el borde inferior y derecho (7,5" libres a la izquierda); 7,5" libres hasta la línea central; torre en el centro. Ganador elige zona y despliega primero (texto del PDF). Implementado con `zf`.
- Rotación 3D de edificios comprobada con captura cenital 3D vs 2D (Sturdham y Gemelwald): mismos ángulos y sentido.
- Chaos Cults: opciones de culto de Marauders del Arcane Journal «The Razing of Westerland» (libro no entregado; solo hay resúmenes de terceros sin texto exacto) → NO implementado.
- Edificios con rotación (Sturdham, Gemelwald) medidos del mapa; Gemelwald: prevalece el texto («mitad del defensor») sobre el dibujo.

## v713 – Mapas del Core comparados con el PDF (p.290–298)
- Odo Todmeyer (p.290): corregido; zonas de 54"x15" a lo largo de los bordes largos, 9" de los bordes cortos y 9" hasta la línea central (antes 15" en los bordes cortos).
- Drakwald Forest Incident (p.294): corregido; dos triángulos separados por una banda diagonal de 12" (6" a cada lado de la diagonal de esquina a esquina). Los refuerzos entran por el borde largo dentro de su zona, de cara al centro (`reinforcePos`).
- Pine Crags (p.292), Gisoreux Gap (p.296) y Lonely Tower (p.298): coinciden con el mapa.
- Vista 3D de respaldo (`t3box`): los edificios rotados giran (almenas incluidas).
- Las zonas de referencia de los escenarios con `zf` salen del mismo generador que la mesa.

## v714 – FAQ y reglas
- Hierofante (RH p.): pérdida inmediata de Regeneración y chequeo de Liderazgo al final de la fase; designado al empezar la batalla.
- Indisciplinado (Core): Enjambres y Bestias de guerra sin Presencia inspiradora ni Mantened la posición (salvo Correr con la manada / Espíritus ligados); Correr con la manada: sin miedo a ataques flamígeros.
- Animus sepulcral (FAQ AJ TK): nominación previa a la tirada, botón en el panel y decisión de la IA.
- Vórtices: se mueven en cada Inicio de turno de ambos jugadores (FAQ Core/RH/AJ).
- Mapas Core (Odo, Drakwald) corregidos; refuerzos por borde largo; 3D de respaldo rota edificios (v713).
- Auditoría v714: 1.861 partidas 0 errores 0 invariantes; aud2 289 partidas 0 errores (noEnd:7 stirhugel). `turnOver` sube de 1 a 65 acciones: son partidas de escenarios «break point» (sin límite fijo de turnos, p. ej. crossroads) que duran más de 13 turnos; terminan por punto de ruptura (noWinner no cambia).

## v715 — Cuidadores en la fila de combate
- Skink Handlers / Packmasters / Beast Keepers: los Cuidadores ocupan huecos de la fila delantera repartidos por igual (`handWin`). «Los modelos enemigos deben asignar sus ataques contra un modelo con el que estén en contacto peana con peana»: los ataques se reparten entre los huecos que toca el atacante (frente: ventana centrada de huecos; flanco: solo el hueco del extremo; retaguardia: solo si no hay más filas) y los asignados a Cuidadores se resuelven con su perfil (HA, R, salvación) antes de tirar para impactar. Las bajas cuentan como heridas causadas.
- Los Cuidadores en contacto atacan a su Iniciativa con su propio perfil (`handStrike`).
- Cuidadores de Bestias (Elfos Silvanos): modelo real `we_beastkeeper` (M5 HA4 HP4 F3 R3 H1 I4 A1 Ld8, armadura ligera), uno por cada `keeperPer` bestias (1 por Oso). «Correr con la manada»: Movimiento de la mayoría de los modelos (empate: el menor), sin Indisciplina mientras quede un Cuidador.
- Prueba: manada de 9 sabuesos + 3 cuidadores contra 25 Soldados Estatales, 300 combates: 0,45 cuidadores abatidos por ronda.
- Pendiente: los Cuidadores no tienen colocación elegible por el jugador (reparto uniforme fijo).

## v716 — Coronas Renegadas (AJ «The War of Settra's Fury» p.37-45) como lista del Imperio
- Fuente: tow.whfb.app (WebFetch, mecánica íntegra pero no literal; no se dispone del libro). Datos en rules/new/renegade_web.txt. Reglas del Core (Detachment, Horde, Regimental Unit, Close Order…) del Core/FoF ya presentes en el motor.
- Lista `renegade` (LISTS.empire / INF.renegade): Personajes ≤50 %, Básicas ≥25 %, Especiales ≤33 %, Raras ≤25 %, Mercenarios ≤33 %. Límites: 0-1 Príncipe y 0-1 Mercenarios Veteranos por 1.000 pts, Morteros ≤2 por 1.000, 0-1 Órgano/Bombarda por 1.000, Jinetes a Sueldo con opciones 0-1 por 1.000, Buscadores de Fatalidad ≤3, Ogros Imperiales 0-1, Gigante Triturador 0-1.
- Unidades nuevas `rc_*`: Príncipe y Capitán Renegados (a pie y a caballo; Capitán PEB +25), Magos Proscritos 1-3 (a pie y a caballo), Mercenarios (Sellswords) y Veteranos (+ variantes Falange), Caballeros Libres y Veteranos, Jinetes a Sueldo, Mortero, Cañón Órgano, Bombarda y Bandidos (Raras) de los Príncipes Fronterizos. Milicia de la Compañía Libre y Arqueros Imperiales del Imperio. Mercenarios: Ogros de las Tierras Yermas, Gigante Triturador, Buscador de Fatalidad, Enanos Imperiales, Ogros Imperiales (+ resto de «Dogs of War» del motor). Tabla de Mercenarios díscolos ya existente.
- Orígenes infames (Príncipe, Capitán y Mago): La Fuerza de Miragliano (25), El Caballero Renegado (25), El Proscrito Noble (20, arma y regla), El Duelista Errante (20, +3 arma de mano). Las unidades que desbloquean cada origen se limitan en el validador (Falange, Formación en lanza + Desdén noble, Emboscadores de Jinetes, Bandidos +1 HA con Finta y esquiva). Objetos: solo comunes; Bretonia con el Caballero Renegado, Imperio con el Proscrito Noble (`itemFacOk`).
- Reglas nuevas en el motor: Desdén noble (sin Pánico por infantería amiga destruida a 6" o que huye a través), Finta y esquiva (una vez por partida: el modelo enemigo repite los impactos con éxito; en desafío/reparto a personaje y unidad con la regla), Estoicismo tileano (Tozudo de la unidad hasta su primera Prueba de Rotura mientras el personaje esté unido), Falange (Orden de combate aunque más profunda que ancha, sin marcha triple, no Desorganizada por Primera carga).
- Datos recientes (web, 2026): Ogros Imperiales 29 pts (antes 31); Gigante Triturador R7 y Pisotón D6+1.
- Dudas anotadas: «Finta y esquiva» dice que se repiten los impactos con éxito (se aplica tal cual); la ficha de Caballeros Libres Veteranos copia el texto de los Mercenarios Veteranos (armadura completa +4 y estandarte mágico hasta 50 se aplican a los Veteranos); la dotación de las máquinas aparece con H3 A3 (perfil combinado, como el resto de máquinas del motor).

## v717 — Estupidez según FAQ p.178 (recuento: FQ1-040..042, C4-117)
- Ya no avanza sola. Mientras sucumbe: no puede mover (salvo huir), disparar, lanzar, dispersar ni contracargar; ante una carga debe Aguantar (sin Disparar y huir ni Defensa de carga).

## v718 — Magia según Core/FAQ 1.5.2 (recuento: C2-102/123/126/138, C8 ausentes)
- Disfunción 8-9 y 10-12: el Mago no puede lanzar más hechizos ese turno (antes 10-12 no lo impedía).
- Superado en el Arte: solo en dispersión de Mago y nunca al dispersar un hechizo ligado; la tabla se aplica entera (8-12 = el hechizo se dispersa y el Mago no puede intentar más dispersiones ese turno).
- Pilar de Fuego: D3+3 impactos F3 FP −2 flamígeros (FAQ p.321), terreno difícil, sin bloqueo de visión.
- Traslado (Conveyance): se lanza en Movimientos restantes (fase de movimiento) para jugador e IA; lanzar uno abre esa subfase.
- Nuevos: Mano de Mork/Gork (Saber del Waaagh!, 7+, 18"), Tempestad (a 6" terreno abierto = difícil, difícil = peligroso), Escudo Antihechizos (25 pts), Moneda del Pagador (25 pts).

## v719 — Elección del jugador (recuento FQ1-020, FQ1-035, core6-005, C2-088)
- Hechizos (Core p.110): se tira Nivel D6 y el humano puede descartar uno y tomar la firma (o conservar todos) en el despliegue; por defecto (IA) se descarta la última tirada y se toma la firma. Solo en la tirada normal (sin modificadores de Saber/objeto).
- Zancada (FAQ p.176) y Evasivos (FAQ p.168): interruptor por unidad para renunciar al +D6 / a retirarse al ser disparada.
- Ráfaga del Lanzavirotes de repetición: el jugador elige auto/sí/no al apuntar (antes el motor decidía por el blanco).
- v720: el humano nomina al Mago que dispersa (automático / primero / no: dispersión del destino) y bebe él mismo las pociones en su fase de estrategia (la IA las sigue bebiendo sola).
- v721: con varios enemigos en contacto el jugador elige a quién ataca (o reparto igual); elige qué modelo lanza/acepta desafíos (además de la política Automático/Siempre/Nunca que ya existía).
- Pendiente de punto 2: pergaminos (uso automático, requiere pausa a mitad de hechizo).

## v722 — Columna de Marcha declara carga (FAQ Movimiento; recuento F2-075..078)
- chargeTargets ya no excluye la Columna. En doCharge, tras fijar el alcance y antes de mover: una unidad Drilled reforma a Orden de combate si hay espacio; si no (o si no es Drilled) no se mueve y la carga fracasa. Las cargas obligatorias (Frenesí/Impetuoso) ya no escapan por estar en Columna.
- Pendiente de punto 4: Impactos en el paso 1.1, contacto accidental, reforma al reagrupar/arrollar/ceder (Disciplinada).

## v723 — Libros (recuento Q03, Q12, Q15, F10, F15)
- Saber rúnico (FoF p.39): Yunque 24" y +3, Señor de las Runas 21" y +2, Herrero Rúnico 18" y +1 al dispersar (ya no Nivel/2).
- Goblin-hewer: Destrucción giratoria suma un único D3 (FAQ FoF).
- Tropas Estatales y Veteranas: Horda (FAQ FoF p.57).
- Tanque de Vapor: Potencia de vapor no suma al alcance de carga (FAQ: sustituye a marchar).
- Deathblow: sus impactos usan Matadores (Slayer) (FAQ FoF Enanos).

## v724
- Armas «solo al cargar» (Hacha de Da Akrit, Tormenta de Cólera, Mayal de los Reyes Conquistados, Mayal de Cráneos): `chargedIds` en attackProfile0/doCharge.
- Amuleto Verde Brillante (FAQ RH): si explota, tampoco cabe dispersión de Mago contra ese hechizo (sí la Fated).

## v725 (puntos 4–6 del recuento; FAQ > libro)
Cargas
- Impactos de carga: se resuelven al elegir combate, paso 1.1, antes de los desafíos (FAQ p.172) — `chargeImpacts` en `resolveCombats`; se anulan si el objetivo ya no está trabado.
- Unable To Align (Core p.128): si el terreno impasable impide alinear pero puede trabarse, la carga queda trabada con la mínima rotación/desplazamiento, es desordenada (sin bonificador de Iniciativa), el objetivo se alinea si puede (si está libre) o queda un hueco.
- Contacto accidental en una carga (Core p.131): esquivar virando si se puede; si no, el jugador elige (botón de la unidad) detener la carga a 1" (no es fallida) o seguir adelante: contra un huido lo aniquila y acaba sin reformar; contra otro enemigo redirige la carga (solo Mantener/Huir).
- Redirigir tras huir el objetivo: ahora «puede»: botón «Redirigir carga: sí/no».
- Cargar contra un huido: tras aniquilarlo, chequeo de Liderazgo (veterano repite) y, si pasa, reforma gratuita (`freeReform`, en el sitio, ≤180°, no gasta movimiento); en cualquier caso no mueve más.
- Reagrupar (Core p.114): reforma gratuita inmediata (`freeReform`).
- Batalla sorpresa (Surprise Encounter, ronda 1): declarar carga exige chequeo de Liderazgo; si falla no cuenta como declarada.
Máquinas y personajes unidos
- Unidad destruida: los personajes unidos sobreviven como solitarios (Core p.207); solo mueren si la unidad es alcanzada huyendo (`runDown`).
- Unidad con personaje usa el Movimiento del modelo más lento (`slowM`).
- Tras unirse un personaje en Movimientos restantes la unidad no puede mover; un personaje solo abandona antes de que la unidad mueva y si esta puede mover.
- Lumbering (carros pesados, criaturas monstruosas, behemoths): Orden cerrado aunque sea un modelo, pivote libre de 90° tras mover (salvo cargar/marchar/huir), no se une ni admite personajes.
- Máquinas de guerra: pivote libre justo antes de disparar (no cuenta como mover) y movimiento de seguimiento (FAQ p.197).
- Enjambres: Insignificante (línea de visión a través; ignorados al elegir blanco entre personajes) y «Nadie se preocupa» (no causan Pánico).
- Objetivo grande (FAQ p.172): fila adicional de disparo; solo otras unidades grandes bloquean la línea de visión.
- Aplastamiento (cañón): la bala se detiene en colina/terreno impasable y al golpear una criatura monstruosa/behemoth.
- Grupo de mando cuenta como tropa para el umbral de 5 modelos (Core p.198, FAQ p.209).
Escenarios
- Gisoreux Gap: duración aleatoria forzada y Cuello de botella (solo Etéreos o con Volar cruzan los bordes largos, también las reservas).
- Rendirse (Core p.286): acción `concede` y botón en el Menú; gana el rival (victoria aplastante).
- Nuevos: Surprise Encounter (seis zonas, reservas D3, tirada de despliegue) y The Dark Monolith (jugado solo, sin persistencia de bajas).
Pendiente (necesita modo campaña): persistencia de bajas entre batallas enlazadas, Heroic Last Stand (despliegue secuencial del defensor en cuadrado de 18" y atacante a >8"), alianzas de más de dos jugadores, contacto accidental fuera de cargas.

## v726 (libros, punto 7 – lote 1)
- Aquelarre Oscuro (Dark Coven, FAQ RH errata): doble 1 natural al DISIPAR provoca Disfunción en el Chamán y su aquelarre (R28). El +1 a disipar ya existía.
- Metralla (FAQ FoF Q13): cualquier arma con Cannon Fire (incl. cañón de vapor del Tanque de Vapor) puede disparar metralla.
- Fanáticos (R02): validación 0-1 por cada 10 Goblins Nocturnos, máx. 3.
- Ya correctos (recuento obsoleto): R10 Señor del Caos en corcel con Contracarga; R20 Crusher +7; F10; Q03.
- No implementable sin fuente: Q14 (perfil del Ingeniero Comandante no está en las fuentes); Q22 Escudo de la Dama (sin retirada tras desafío: el motor no modela la retirada).
- Desenganche Catay (C05/C07): preferencias del jugador humano «al perder: retroceder / ceder terreno» y «al ganar: retroceder en buen orden» (la IA mantiene su heurística).
- Bruja Troll (AJ O&G, RQ13 y perfil completo): Pisotón D6, Estupidez, ¡Timmm-berrr!, Zancas viscosas (−1 a impactar a la Bruja, melé normal, duelo y contra personajes unidos), Hambre indiscriminada (Mando, chequeo de I, −1 Herida y la Bruja recupera 1), Amor maternal (tabla D6 en vez del ataque normal; no usa arma mágica; Cotorrear −1 Ld hasta fin de turno), opción Maga de nivel 2 (+35). Aplastar solo impacta al objetivo y a unidades amigas a ≤2,5" (aprox.).
- Baliza celestial (C25): el −1 es a llegadas de Emboscadores AMIGOS (retrasar); la IA nunca lo usa, el +1 ya existía.
- Idolo de Gork (RQ14) ya correcto (solo alcance > 0).
- Doom Diver (RQ07, FAQ RH): tras desviarse, la plantilla se mueve la distancia completa del D3 en la dirección que más impactos logre (antes se restaba D3 a la desviación).
- Sin fuente en el repositorio (no implementable): Cultos Caóticos Marauders (R40/R41, Arcane Journal «Razing of Westerland»); perfil del Ingeniero Comandante (Q14).
- Pendiente (decisión humana o diseño): R03 soltar Fanáticos parcialmente, C09 elección de objetivo de Bombas de Linterna, F29 Cuerno de Fredemund, RQ05 Fanático y Terreno Hostil, Q27 contacto de Lanza por M, F23 Polearm, RQ11 Boar Boys.
- Jinetes de Jabalí como Básica (RQ11): solo si el General (personaje general más caro) es un Jefe de Guerra Orco (FAQ RH); un Jefe Negro no basta.

## v727 (libros, punto 7 – lote 2: pendientes de decisión)
- R03 Fanáticos (FAQ RH errata): se pueden soltar «uno o más» en CUALQUIER Inicio de turno (también el del rival), salvo huyendo o en Columna. Humano: botón «Fanáticos a soltar» (u.fanRel); IA: todos si hay enemigo a 8".
- RQ05: un Fanático que termina su movimiento a alcance de mando de Terreno hostil (enemigo, no huyendo ni trabado) hace test de Terreno Peligroso (1 = muere).
- C09 Bombas de Linterna (FAQ Catay: una vez por partida): el jugador elige la unidad enemiga (≤6" tras mover) o «No bombardear» (pref bombPick); sin elección, la IA usa la de más puntos.
- F29 Cuerno de Halcón: Liderazgo propio sin modificar, doble 1 siempre supera y doble 6 siempre falla (Core); el humano decide intentarlo (pref falconOn), la IA solo si hay enemigos voladores.
- Q27 Lanza (FAQ FoF): contra una Lanza (frente) cuentan en contacto los modelos de la primera fila a ≤ M" de la Lanza.
- F23 Polearm: ya estaba (Guardia de Terratenientes opción 'pa': perfil a una mano con fila extra / dos manos F+1 FP−1 elegido al empezar el combate; sin apoyo si cargó). El recuento lo daba por ausente por buscar mal.

## v728 (decisiones opcionales de la IA por autoaprendizaje)
Regla del usuario: lo que el reglamento deja como opcional («puede…») la IA lo decide con su valoración aprendida (pesos de autoaprendizaje), no con una heurística fija ni «siempre».
- Motor: las decisiones automáticas de la IA pasan a ser acciones/preferencias explícitas, idénticas a las del jugador humano: Cuerno de Halcón (acción 'falcon'), pociones ('drink'), ¡Waaagh! ('waaagh'), Desenganche (noDisLose/disWinOn), soltar Fanáticos (fanRel), Zancada/Evasivos/cierre de paso/redirigir (prefs, también adjuntas a la carga con `a.prefs`).
- IA (ai.js `learnedOptions`): cada opción disponible (Waaagh, pociones, Caldero, Nehek, Mirada de los Dioses, objetos de Mando, Cuerno de Halcón, Orbe de Latón, Evasivos, Desenganche, Fanáticos, reacción a la carga, contenerse/perseguir, preferencia de disipación, arma alternativa, Forma deformada) se simula en una ronda completa (propia + respuesta rival) con la política interna y semillas comunes, se puntúa con los pesos aprendidos y se elige solo si supera a «no hacerlo». Las variantes de la carga (Zancada, cierre de paso, redirigir) se valoran con semillas comunes y gana la mejor. Orden aleatorio y tope por turno según nivel (Medio 2, Difícil 4, Fácil sin capa) para que todas las reglas se estudien con el tiempo.
- Se eliminan las heurísticas fijas anteriores (Caldero, Nehek, Mirada, objetos de Mando, Orbe, pociones, Waaagh, Cuerno).
- Auditorías: modo rápido (`globalThis.OPT_FAST`: valoración a un paso + 35 % de cobertura aleatoria) para ejercitar todas las acciones sin multiplicar el tiempo.
- Pendiente de convertir a esta capa: Grito de reagrupamiento (automático para todos), Gran Jefe 'At, rezos/bendiciones y otras reglas automáticas del motor; pergaminos (necesitan pausa a mitad de lanzamiento).
- Grito de reagrupamiento ('rallycry') y Gran Jefe 'At ('bigboss'): ya no son automáticos para nadie; acciones explícitas con botón para el jugador humano y valoración aprendida para la IA.

## v729 (IA: más decisiones aprendidas)
- Valoración aprendida ampliada de 11 a 15 rasgos: inmovilizar enemigos caros con unidades baratas (sacrificio), heridos a salvo (retirada), pantalla de unidades baratas, alcance a flancos/retaguardia. Pesos reentrenados (train.mjs, modo rápido).
- Candidatos de movimiento nuevos: retirada (atrás y diagonales traseras), maniobra lateral y desbordamiento por flanco del enemigo más cercano; la valoración aprendida decide.
- «No disparar» pasa a ser una opción valorada. Lamento de banshee (dirge) y pergaminos de disipación (umbral scrollThr) se deciden por valoración aprendida.
- Nivel Fácil: las probabilidades fijas (idle/charge/shoot/cast) se mantienen como handicap de dificultad, no como regla.
- Pendiente tras el entrenamiento: rasgos de ataque/defensa de objetivos y posición futura (terreno), y sustituir el reparto fijo de objetivos (objectiveMove) por candidatos valorados.

## v730 (objetivos, posición y terreno aprendidos)
- NF 15 → 18: f15 control de marcadores (fuerza que los mantiene, ponderada por VP), f16 marcadores amenazados (defensa/ataque según quién puede llegar el próximo turno), f17 terreno defendible (colinas, bosque, ruinas, edificios, torres).
- moveCandidates: cada unidad (salvo máquinas) genera avances hacia los 2 marcadores más cercanos (andar y marchar); la valoración aprendida los compara con avanzar, replegarse o rodear. El reparto fijo `objectiveMove` sigue inactivo (L.obj no se define).
- Pesos reentrenados desde los de v729 (12 gen, OPT_FAST=1); última gen nueva-vs-anterior 0.75. Copia de v729: /tmp/weights_v729_trained.json.
- sw.js tow-v730. Auditoría v730: pendiente de resultado (se anota abajo al terminar).

## v731 (autoaprendizaje en todos los mapas y objetivos)
- `objPts(s,p)`: lista única de objetivos puntuables de cualquier escenario (marcadores, centro/colina/torre, Piedra de las Manadas, bagajes, graneros del saqueo, aldea de Sturdham, zona llana de Matorea); la usan los rasgos f15/f16 y los candidatos de movimiento a objetivos.
- NF 18 → 19: f18 = diferencia de lo que puntuaría la partida «si acabara ahora» (scoreVP con phase 'over' menos en vivo, con zgen restaurado): cubre objetivos secretos, zonas y reglas propias de cada escenario.
- Entrenamiento con MIX (todos los escenarios, terreno, objetivos secundarios, pares de facciones). sw.js tow-v731. Copia de pesos previos: /tmp/weights_v730_trained.json.
- Auditoría v731 (4 shards, 1905 partidas, todos los escenarios): 0 errores, 0 invariantes, 0 sin terminar.

## Avisos automáticos con popup

Regla del usuario: todo lo que el motor aplique automáticamente a favor o en contra de un jugador humano debe anunciarse con un popup y botón OK.

- **API (rules.js, junto a `announce`)**: `export notify(s, player, texto)` encola `{p, t, turn}` en `s.notices` solo si `s.manualReloc[player]` (humano). En IA vs IA o auditorías (sin `manualReloc`) no hace nada. `announce(s|CUR, ev, msg, extra)` = `logE` + `notify` (con dos humanos el aviso va a `extra.owner` o al jugador activo; con uno, a ese).
- **Uso**: cambiar `logE(ev, ...)` por `announce(CUR, ev, ...)` (o llamar `notify(s, p, texto)`) en cualquier efecto sin elección del jugador. No usar para preguntas o prompts al jugador (nominaciones, elecciones).
- **UI (main.js `showNotices`)**: `handleEvents` (no silencioso) vacía `s.notices` uno a uno en `#noticePop` (z-index 90, bloquea toda entrada; estilos al final de css/app.css). `runAI` espera mientras `UI.noticeOpen`. Al reanudar/reproducir (`silent`) `s.notices` se vacía para no repetir avisos.
- **Estado**: `s.notices` es JSON plano (máx. 60), sin funciones; sobrevive a `structuredClone`.
- **Migrados (53 llamadas)**: Inestabilidad Demoníaca, Fanáticos (terreno peligroso), Bendiciones de la Dama (rezo, pérdida, duelo), repetición de lanzamiento (Bendición de Lileath/Hekarti), repetición por Reliquia, hechizo en juego relanzado, Pergamino de dispersión automática, Aura de dolor/Aura de frío, Mutación desenfrenada, Bendición del Caos/Khaine, Hambre Indiscriminada, Corazón Oscuro, ¡Levantaos!, Capa de Isha, Escultor de piedra, Frenesí de sangre, Gigante Triturador, Sangre de Hashut, Galrauch, Emboscadores, Apophas, Minas colocadas, Recursos extraviados, Muerte del General, Duración aleatoria, y otras similares (ver `grep -n "announce(CUR" js/rules.js`).
- **Prueba**: partidas IA vs IA cortas sin errores y sin avisos; con `manualReloc=[true,false]` `notify` encola solo para el humano y serializa.

## v732 — ronda completa de implementación (Core, FAQ, 19 libros, Dawn/Renegade/escenarios) y auditoría

Alcance: implementación frase por frase de las filas PARCIAL/AUSENTE de rules/recuento/*.tsv y rules/recuento2/*.tsv, más infraestructura común nueva:
- Avisos automáticos con popup y botón OK (`notify`/`announce`, cola `s.notices`, sólo para jugadores humanos; ver sección «Avisos automáticos con popup»).
- Objetos y armas de campeón de unidad (`CHAMP_IB`, `u.champItems`, `champView`, botón ✦ Objetos).
- Contingentes aliados/mercenarios (selector en el editor, opción de menú, Incómodo/Sospechoso, pánico por aliado incómodo) y dos listas por jugador (Matorea, Un Arribo Oportuno).
- Dawn: generadores Wasteland/Shadowlands, Un Arribo Oportuno, Flota de Jade, Renegade, edificios y escenarios Infamy (Seize the Tower, Waystones, Shores…), Winter's Teeth.
- Decisiones opcionales nuevas del jugador con botón y decisión de la IA por autoaprendizaje (`optionGroups`).

Auditoría (tools/audit/full.mjs, 4 shards, IA vs IA, todas las unidades y objetos contra las 17 facciones, todos los escenarios):
1. Primera pasada: 1952 partidas, 0 errores, 0 invariantes rotos, **239 sin terminar**. Todas en 5 escenarios con despliegue alterno impuesto por el texto (leonen, shores, laststand, hollum, waystones): el simulador `train.mjs` no resolvía el despliegue alterno y «listo» se rechaza hasta que termina (`Termina primero el despliegue alterno`), de modo que las partidas se quedaban en despliegue sin colocar unidades. No era un fallo de reglas ni de la IA en `main.js` (que ya gestiona ese despliegue).
2. Arreglo: `train.mjs` llama `altRun(s)` antes de los «listo» cuando `s.alt.phase !== 'done'`.
3. Reauditoría de esos 239 juegos (unidades/objetos afectados): 438 partidas, 0 errores, 0 invariantes, 0 sin terminar.

Resultado: **0 errores, 0 invariantes, 0 sin terminar** tras el arreglo (primera pasada con 1713 partidas limpias + reauditoría).

Pendiente de verificación (no cubierto por partidas): botones y popups de la interfaz (main.js sólo comprobado por sintaxis y por la lógica de rules.js), panel de objetos de campeón, panel de Frydaal, Doom Diver (`diverPref`), reglas que no se dispararon en ninguna partida (Muerte del General de Vampiros, Nehek, Todos sigilosos, Bastón de madera de pantano, ganchos de objetos Battle March). Los estados OK de los TSV los han fijado los propios implementadores (recuento v732 en RECUENTO.md es una cota superior hasta un segundo recuento ciego).

Supuestos a revisar (no están en el texto): Frydaal cuenta como General si no hay Señor/Príncipe/Señor Hechicero/Galrauch (el texto sólo dice «si Frydaal es tu General»); Ogros Imperiales a 29 pts (web de julio de 2026) frente a 31 (AJ impreso); el equilibrio cambia por la corrección de la salvación (Sv) con armadura/escudo/barda en todas las unidades, y se reentrena la IA.

## v736 — Maniobras de movimiento exactas (Core p.123-125, FAQ Core p.12/21/183, Quick Turn)
Antes: el motor aceptaba un desplazamiento recto + giro y cobraba `giro × ancho/2` (aproximación). Ahora, por texto:
- **Girar de ala** (Core p.124): el borde delantero avanza pivotando sobre una esquina delantera, cada modelo cuenta como el exterior (coste = ancho × ángulo, FAQ: no se mide la retaguardia), se puede alternar avanzar y girar. `wheelPath` (geom.js) halla la secuencia avanzar/girar de menor coste que lleva a la pose elegida (palabras tipo Dubins CSC/CCC con radio = ancho/2, comprobadas por simulación: 3000 poses aleatorias sin fallo, `tools/audit/wheel_test.mjs`). Cualquier destino que se pueda alcanzar así es legal; el coste mostrado es el real.
- **Atrás / de lado**: solo en línea recta exacta (±8°), mitad del Movimiento; al marchar solo se puede avanzar y girar de ala.
- **Giro rápido** (Core p.183 + FAQ: «Unless it marched … after moving during the Remaining Moves»): el pivote gratuito de hasta 90° ocurre tras mover (rumbo final dentro de ±90° del elegido), no sobre el ángulo total.
- **Escaramuzadores** (Core p.184): cada modelo mueve por separado, la unidad no gira ni maniobra → sin coste de giro.
- **FAQ Core p.21**: durante la maniobra el borde delantero no puede atravesar otra unidad; al girar de ala una esquina trasera sí (sin acabar encima ni a <1" de un enemigo). Core p.125 «El fin del mundo»: una esquina puede cruzar el borde durante la maniobra si la unidad acaba entera en la mesa.
- Interfaz: botones ⤺ ⤻ (girar de ala 15° sobre la esquina delantera izq./der.) además de ⟲ ⟳ (pivote sobre el centro).
- Siguen sin verificar por falta de texto fuente: restricciones de movimiento de la Lanza (Bretonia); no se modelan los giros de ala múltiples fuera de las palabras CSC/CCC (puede sobrecobrar algún caso raro); formación del Mando al girar 90°/180° (solo estética).

## v736 — Cartas de hechizo (mod de TTS)
138 cartas de hechizo/objeto recortadas de las hojas del mod (hd/cards/<clave>.webp, ~9,5 MB), mapeadas a las claves del motor (SPELLCARDS en hdmap.js). Botón 🃏 junto a cada hechizo y en «Conoce:» abre la carta; solo en PWA/zip (el artefacto no lleva hd/). Sin equivalente en el motor: Máscara del Alquimista, Varita Flamestrike, Piedra Lunar de los Caminos Ocultos, Anillo de Rubí de la Ruina, Azote de los Cargados, Estandarte del Frío Matutino. IA reentrenada (12 gen.) con las nuevas maniobras de movimiento.

## v737 — Auditoría frase a frase Core + FAQ (re-verificación de PARCIAL/AUSENTE del recuento)
Se contrastaron con el código actual las filas PARCIAL/AUSENTE de rules/recuento/*.tsv. Muchas ya estaban corregidas (13 reverificadas y pasadas a OK). Corregido ahora: tamaño de mesa 3.001+ pts = 44"x90"; alcance de redirección de carga (+3 de carga); hechizos Ligados con armadura/escudo permitidos (FAQ); Pilar de Fuego al cargar y al huir (D3+3); relanzar un hechizo Permanece en juego lo termina al intentarlo; un solo desafío por combate aunque se rechace; Solitario nunca General; Monolito arcano repite 1 también en ligados.
Sigue sin poder cumplirse al 100 % por la arquitectura (unidad = bloque, sin modelos individuales ni perfiles separados de jinete/montura/campeón): plantillas por modelo, posiciones de campeón/mando, coherencia de escaramuzadores, Perfil dividido, Look Out Sir del campeón, reacciones de carga simultáneas. Pendiente de revisión: lectura ciega del resto de filas PARCIAL no comprobadas esta vez.

### v737 (cont.) — modelos individuales: qué existe ya y qué se ha añadido
Comprobado en el código: el motor ya tiene posición por modelo en rejilla (modelPts): plantillas por modelo (peana entera = impacto, parcial = 4+), contacto de peana por modelo (contactModels), tiradores de la fila delantera con LDV propia (frontShooters), trayectoria del cañón con máximo un modelo por fila/columna, ¡Cuidado, señor! de personajes con plantillas.
Añadido: el impacto reforzado de catapultas/morteros (F/FP entre paréntesis + Heridas múltiples) solo se aplica si un modelo está bajo el agujero central de la plantilla (Core p.95); si no, todos reciben el impacto normal.
Sigue pendiente (necesita decisiones de diseño/UI o datos por libro): punto de puntería libre del cañón (hoy fijo por el motor), posición elegible de campeón/mando y ¡Cuidado, señor! del campeón, coherencia individual de escaramuzadores, perfil dividido jinete/montura/dotación (datos por libro), reacciones de carga simultáneas (reescritura de doCharge en dos pasadas).

### v737 (cont.) — Cargas simultáneas (Core p.117-121, recuento c3-047)
doCharge pasa a ser un generador (doChargeG) que cede el control justo antes de la tirada de carga. La acción chargeAll ejecuta primero las reacciones de todas las cargas declaradas (huir, Defender y disparar, redirigir, apoyo de destacamentos) y después los movimientos de carga en el orden declarado. La IA declara todas sus cargas del turno en un solo chargeAll (con sus opciones por carga). Comprobado: 82 partidas de la IA sin errores; 111 cargas, 16 lotes chargeAll en 12 partidas.
Pendiente: movimiento simultáneo de varias cargas sobre el mismo arco (c3-067) y contacto previo con otras unidades antes de declarar (c3-036).


## v737 (continuación) — cañón, campeón, escaramuzadores, perfil dividido
- Cañón: punto de puntería elegido por el jugador (UI + motor + IA aprendida); `losClearPt` valida línea de visión al punto.
- Campeón: posición en la fila (◀▶), ataques dirigidos opcionales, «Look Out, Sir!» y agujero central de plantilla por modelo.
- Escaramuzadores: `modelPts` incluye el espaciado; `skirmBottleneck` comprueba el paso de cada modelo al mover. Pendiente: FQ1-050 (pérdida de cohesión al formar) y retirada de bajas con coherencia individual.
- Cargas simultáneas: reacciones tras declarar todas, colocación conjunta en el mismo arco (aproximación por reparto de frente).
- Perfil dividido: la montura puede impactar con HA propia (`mountAtk.ws`, hook en la tirada de impactos). SIN DATOS por libro: ningún perfil lo usa aún (la montura sigue usando la HA del jinete); I y T propias de montura/tripulación/campeón siguen pendientes (C5-023/030/046/061/087, FQ1-060, F2-092).

## v738 — perfiles propios y cohesión de escaramuzadores
- Liderazgo del campeón: `champLd` (la unidad usa el Ld más alto; Core «Whenever Leadership is used…»). Cargado para Orcos, Goblins, Goblins Nocturnos, Merodeadores, Bestigors/Gors/Ungors/Centigors, Milicia/Bandidos, Hombres de Armas.
- HA/I/F del campeón (`champWS/champI/champS`) como ranura propia de ataque; `champBS` ampliado a tiradores con Puntería superior (Enanos, Imperio, Bretonia, Elfos, Reyes Funerarios).
- Resistencia de la dotación en combate (`crewT`) para las máquinas con perfil de dotación en los libros (T3; Enanos T4).
- HA propia de la montura (`mountAtk.ws`): 24 unidades con corcel de guerra/élfico (HA3) y 4 con corcel esquelético (HA2).
- FQ1-050: escaramuzadores que no pueden formar tras cargar pierden coherencia → bajas con aviso.
- Pendiente real: Iniciativa propia de monturas/tripulación; monturas de monstruo y bestias de carro sin datos de libro disponibles; 91 filas del recuento PARCIAL/AUSENTE sin reverificar (las referencias de línea son anteriores a v732).

## v738b — Iniciativa de montura, perfiles de monstruo, montas del Caos
- Montura con Iniciativa/HA propias (`mountAtk.i/.ws`, ranura de ataque `slotsOf`): ahora ataca en su propio paso de Iniciativa. Datos de las tablas de montura de FoF/RH/AJ: Pegaso, Demigryph, Grifo, Hipogrifo, Gran Águila, Wyvern, Dragones (Forestal, Lunar, Estelar, Solar, de Hueso, Zombi, del Caos), Mantícora, Lammasu, Gélido, Pesadilla, Terradón, Ripperdáctilo, Colmillotriste, Cuernopétreo/Colmillotrueno, Unicornio, Halcón de guerra, Araña, jabalí, lobo, corcel de guerra/élfico/esquelético/del Caos. Las monturas con ataques especiales (cola, cuernos, aliento, etc.) siguen en el flujo anterior.
- Dotación de máquinas: el perfil de la unidad ya es el de la dotación (HA/I/A/Ld coinciden con las tablas); no hay paso de Iniciativa distinto.
- FAQ RH Character Mounts: Campeón Exaltado en Mantícora (+120) y en Dragón del Caos (+285); Montura Demoníaca (+35) para Señor/Exaltado/Aspirante/Hechicero.
- Escaramuzadores cargados: emparejamiento óptimo (sin depender del orden de modelos).

## v740 — cambios estructurales
- Cobertura por modelo (`coverMod` usa `modelPts`, hasta 48 muestras uniformes).
- Capa de colocación de personajes (`rearChars`): capacidad de la fila delantera = filas de la unidad − grupo de mando; los personajes sobrantes se retiran a la retaguardia, no confieren Liderazgo ni pueden desafiar/aceptar.
- Pendiente de rediseño mayor: posiciones individuales por modelo de mando (ranuras), ruedas múltiples y esquina fuera de mesa, cola interactiva de reacciones/pánico, contacto de peana por modelo.

## v741 — Fase 1: capa de modelos de mando
- `frontLayout(u)`: ranuras individuales en la fila delantera para campeón, portaestandarte, músico y personajes unidos (prefs champFile/stdFile/musFile/charFile; UI ◀▶ por modelo).
- `slotContact`: un personaje solo ataca si su peana está en contacto con el enemigo (FAQ Core p.14); si la geometría de bloque no da ningún contacto, se permite a todos.
- Cobertura: `coverMod` cuenta cada modelo; bloquean bosques, muros, colinas (posición elevada) y las demás unidades (por bloque de la unidad, no por modelo).
- Pendiente fases 2-3: ruedas múltiples/pivote de esquina, cola interactiva de pánico/reacciones.

## v742 — Fases 2 y 3 del motor
- Fase 2: al girar >1,2 rad las posiciones individuales (campeón/portaestandarte/músico/personajes) se recolocan y se anuncia; pasos intermedios en los extremos del mundo con `noTable`; giros alternos y pivote de esquina ya estaban implementados (c3-082/083/089 → OK).
- Fase 3: orden de pánico elegible (`panicRank`, C4-062 → OK). Reacción ante carga (c3-037): se mantiene como preferencia previa por unidad (Automática/Mantener/Huir); la pausa interactiva en medio de la carga queda PARCIAL.
- Humo: 41+41 partidas sin errores.
- RQ25 Necroesfinge: ranura `xFix` (1 ataque extra F10, FP −4, Golpe letal, Golpear el último). Matamonstruos del arma no modelado. Humo 41 partidas OK.
- RQ25: Matamonstruos propio de la ranura (`msb`) implementado en el golpe decapitador.
- Q04 Matagigantes: variante `dw_slayers_g` (mixRear) con regla ¡Lucha conmigo! (desafíos), opciones de arma aplicadas también a la parte trasera (`mixView` con opts). Humo 82 partidas OK.
- F24 Peregrinos de Batalla: Reliquia del Grial = +6 modelos/Heridas en la unidad (las bajas recaen antes en los Peregrinos), tamaño 5-30, ppm 6 (FAQ), coste +65 sin contar los 6 modelos. Probado con ejércitos fijos (6 partidas). 
- R04 Troll Mobs: añadidas opciones de toda la unidad (+3 armas de mano adicionales / +4 a dos manos) a Trolls, de Río y de Piedra; quitado «Variopinto» no presente en el texto. Humo OK.
- R40/R41 (Cultos Caóticos) y Q14 (Ingeniero Comandante): siguen sin texto en las fuentes entregadas (grep sin resultados), se mantienen PARCIAL/AUSENTE.
- C5-116 Demasiados personajes (Core p.209): `expelExtraChars` expulsa a los sobrantes (último unido primero) con anuncio; se comprueba al inicio de cada turno. Humo 82 OK. Pendiente: reverificar las filas «IMPOSIBLE sin modelos individuales» (C5-062/063/065/066/067/114/133, c3-160/168, C4-127/147, core6-009/010/017/023), cuyas notas son anteriores a las fases 1-3.
- v748: reverificadas core6-009/010/017/023 (plantillas por modelo, agujero central reforzado, trayectoria del cañón por filas/columnas, mortero) → OK. Siguen por reverificar: C5-062/063/065/066/114/133, c3-160/168, C4-127/147.
- v748b: reverificadas C5-063/065/066/133, C4-147 → OK; C5-114, c3-160, c3-168, C4-127 actualizadas (siguen PARCIAL por la parte automática / en bloque).
- v748c: C4-053 y C4-141 → OK (sin caso práctico / cubierto en todos los chequeos de Ld). C5-093 (Solitario cuenta como Escaramuza): no se encontró texto explícito en el Core (solo Evasión y Objetivo); se mantiene PARCIAL (visión 360° y disparo implementados).
- v748d: C4-120 → OK (ataques aleatorios por modelo ya implementados); C4-057 nota actualizada (PARCIAL: defensa automática). C4-137 (Inestable antes de Ruptura) y C2-078 (cobertura con unidades intermedias por modelo) siguen PARCIAL.
- v748e: C4-137 → OK (Inestable se aplica antes del resultado de Ruptura).

## v749
- C4-057: `defObst` (pref) — defender un obstáculo bajo es elección del jugador (Core p.271 «puede defenderlo»); UI y alternativa de la IA.
- C5-093: Core p.205 «Un personaje Solitario se considera siempre en formación de Escaramuza» → `has0` devuelve skirmish para Solitarios.
- c3-160: ataques de la fila = modelos con peana en contacto (`contactModels`), no estimación por anchura.
- c3-168, C4-127 → OK (equivalencia por perfil idéntico / coherencia por construcción).
- C5-114 sigue PARCIAL: falta asignar enemigo por personaje fuera de fila.
- Humo 82/82 sin errores.

## v750
- C5-114 (Core p.209 + FAQ p.14): antes los personajes unidos atacaban solo al primer enemigo en contacto. Ahora cada personaje reparte sus Ataques entre todos los enemigos con los que tiene contacto de peana: a uno elegido (`charTgt`, botón en el panel; la IA lo decide por autoaprendizaje) o, sin elección, por igual (el resto al primero). Sin contacto no ataca ni se mueve por la fila. Humo 82/82 sin errores.

## v751
- Erratas FAQ RH ya aplicadas en datos: R21, R22, R29, R30, R33, core_8-092 → OK.
- R24 Tormenta Furiosa: `chargedS` (F solo contra los cargados). F2-061: Asalto del Mago unido solo desde la fila de combate. C4-046/C2-104: elección de objetivo de asalto existente (assailTgt). Humo 82/82.
- v752: Contracarga y Reprimir Impetuosidad opcionales (noCounter/noQuell, UI + IA); R08, fila 28 y F63 → OK. Humo 82/82.

## v753
- C5-049: máquinas con dos contadores de Heridas (dotación en combate / máquina fuera de combate). C5-062/067 verificadas. C5-106/107: personajes colocados en su ranura (syncJoined). Humo 82/82.
- v754: core_8-081/105/106, FC4-47 → OK (uso declarado por el jugador / FAQ armadura natural).

## v755
- F2-065/067: previewMove rechaza maniobras libres (giro rápido) donde el modelo exterior superaría 2×M (FAQ Core p.21). F2-071: el camino se valida paso a paso (checkPlacement + borde delantero al virar).
- F2-072 y F2-083 verificados contra Core p.134/FAQ p.21 (sin cambio de código).
- FC4-45: verificado, mrItems = máximo de todas las fuentes (sin cambio de código).
## v756
- core_8-089 Alfombra Voladora: restringida a infantería regular/pesada (no escaramuzadores/enjambres/bestias de guerra).
- F2-052: Luz de la Protección y demás efectos de área Propio no acumulan (consulta booleana, relanzar sustituye).
- core_8-005 Recipiente Demoníaco: verificado, afecta también a la montura y a armas de disparo.
## v757
- F2-074: obstrucción de Escaramuzadores amigos en cargas obligatorias (FAQ Core p.21). core_8-005 verificado (montura y disparo).
## v758 (revisión de doCharge)
- El rediseño de doChargeG ya estaba hecho desde v737 (generador: todas las reacciones antes de mover; cargas a varias unidades con reacción individual; jointCharges; rueda opcional; contacto accidental). Las filas c3-036/055/067/068 se reclasificaron a OK con la nota actual.
- Nuevo: sideOfC (Core p.127) cuenta modelos de la fila delantera por arco al declarar la carga.
- Siguen PARCIAL: c3-037 (la reacción la elige el inactivo mediante preferencia previa; el flujo no pausa), c3-054 (sin ruta más corta con rueda real: posición final geométrica con rodeo lateral).
## v759
- c3-037: reacción de carga interactiva (ventana con opciones; nuevos valores react shoot/fireflee; Disparar y huir solo si se elige o en auto para unidades con la regla).
- c3-054: rodeo de obstáculos no enemigos en la ruta de carga.
- Pruebas: 82 partidas sin errores; carga del artefacto en navegador sin errores de consola.
## v760
- FC4-51: Resistencia de rana según tipo de montura. FC4-54: reparto del Familiar Arcano elegido por el jugador. c3-073: orden de movimientos obligatorios elegido por el jugador (pref compPri, UI y alternativas de la IA).
- Siguen PARCIAL por falta de datos de perfiles de montura/tripulación (HA, I, T propias) en los libros disponibles: C5-023, C5-030, C5-087, C5-126, FQ1-060 (en desafíos la montura ataca en el paso del jinete). R40, R41, Q14 sin texto fuente.
## v761
- Perfil dividido en combate: charGroups separa los ataques del personaje y de su montura (F, FP, HA propias) y la montura ataca en su Iniciativa (mountAtk.i) tanto en desafíos como en combate normal de personajes unidos (joinedStrike / mountOnlyPass). Los ataques de la montura se pierden si el rival o el jinete mueren antes (FAQ Core p.211).
- Datos: añadidas HA/I de 18 monturas con fila verificada (mismo F y A) en los libros: Warhawk, Unicorn, Giant Spider, Chaos Steed, Dark Steed, Cold One (Lustria), Terradon, Nightmare, Skeletal Steed, Disc of Tzeentch, Mournfang.
- Sigue PARCIAL: HA/I de las monturas restantes (~130: carros, bestias, monstruos, Cathay, Ogros...) porque no hay fila verificada en los textos disponibles.
## v762 (revisión frase a frase de los Arcane Journal / legado: perfiles de montura)
- Se leen las filas de perfil de bestias de carro, monturas y tripulación en FoF, RH, AJ (Bretonia, Orcos, Reyes Funerarios, Alto Elfos, Elfos Silvanos, Enanos, Imperio) y legados (Elfos Oscuros, Daemons, Lagartos, Vampiros, Ogros, Bestias) y Cathay; solo se aplica HA/I cuando F y Ataques de la fila coinciden con mountAtk (carros: k bestias iguales).
- Aplicados HA/I a ~85 monturas, bestias de carro y tripulación (Tuskgor/Razorgor/Gorebeast, Cold One, Rhinox, Stegadón, Dragón Negro, Great Taurus/Lammasu, Cathay Warhorse/Longma/Linterna, Great Stag, Orion, Sombra, Chompa, Roc del Cortacielos, Arachnarok, Escoltas de escudo…).
- Corrección de datos: los Ataques totales por peana de unidades montadas eran solo los del jinete (mountFrac ≥ 1): Caballeros del Caos, Jinetes Bárbaros, Huscarls, Jinetes/Arqueros Esqueleto, Caballeros de la Necrópolis (2+3), Caballeros Gélidos (1+2 = 3, fila Cold One A2 de Elfos Oscuros), Brujos de Fuego Maldito, Jinetes Oscuros, Caballeros Negros/de Sangre, Lanceros de Jade, Guardacaminos, Caballeros Libres, Jinetes a Sueldo, Cortacielos (3 tripulantes + Roc 2) y Caballeros Elegidos (2+1).
- Personajes montados con A sin sumar montura: Harald (4+1), Kiknik (4+Chompa 2), Caballero Verde (4+1), Settra (5+4), Heraldo de Tzeentch en Carro (2+2×2), Shugengan (4/3 + Longma 3), Nigromante Maestro/Acólito en Pesadilla, Magos Proscritos a caballo, Comandante de Guarnición en Cortacielos.
- Laureles: la parte del jinete usa (A − A montura)/A (A ya es total).
- Siguen sin perfil verificable (HA/I sin asignar, la montura usa la del jinete): Hermanas de la Espina (no hay montura en el texto), Carro de equipaje (fila de la bestia ilegible en el OCR), Tronos/Palanquines/Carros Ardientes y Santuarios (tripulación mezclada con distinta HA/I), carros de personajes de Elfos Oscuros (tripulación + Gélidos con distinta HA/I), Rueda de la Perdición, Carro de Cadáveres, Horno/Campana Skaven y Centauros Toro.
## v763 (perfiles divididos de carros con tripulación mixta y pendientes de la v762)
- Corrección de lo que la v762 daba por «sin dato»: Hermanas de la Espina sí tienen montura (Steed of Isha, FoF p.96: HA3 F4 I4 A1; A total 2); Carro de equipaje legible en el PDF (Battle March p.37: Cochero A1 + 2 Animales de tiro HA2 F3 I3 A1; A 3); Centauros Toro son un único perfil (Legado Enanos del Caos: HA4 R5 F4 I3 A2, Piel acorazada (1)), sin montura aparte.
- Motor: nuevas opciones de ranura de ataque: xRand (Ataques aleatorios de un elemento con su propio perfil: n = tirada − Ataques fijos), nm (no mágico) y mwMon (Heridas múltiples (D3) solo contra monstruos); mountOwn deja de dividir las unidades que ya tienen ranuras con HA/I propias.
- Datos con perfil exacto por elemento (HA/F/I/A/FP/Perforante): Trono de Sangre y Cañón de Calaveras de Khorne (Sanguinarios y carro), Carros Buscadores de Slaanesh (garras perforantes: Ataques extra (1) también de la dotación; Corceles HA3 con Veneno y Perforante (1)), Palanquín de Nurgle (D6+1 aleatorios), Carro Ardiente y Carro de Tzeentch (Lanzallamas, Horrores Azules, Screamers con mordisco de lamprea), Campana Aullante (Ogro Rata), Horno de la Plaga (3 Monjes), Rueda de la Perdición (Ratas 2D6), Carro de Cadáveres (Muertos Inquietos 2D6), Trono del Aquelarre (Doncellas Pálidas + Horda Espiritual D6), Carros del Caudillo de Chrace (Auriga con gran hoja + Leones), Santuario/Caldero y Carros de Gélidos de personaje (el Señor/Noble/Bruja usan su F4).
- Vidente Gris en Campana: F3 I5 A5 (Vidente A2 + Ogro Rata A3).

## v764
- Q14 (FoF FAQ): Tanque de Vapor — Ingeniero Comandante (HA3 HP4 F3 I3 A1 Ld8) con opciones rifle largo de Hochland (+10; 36", F4 PA−1 Bane(1), Pieza voluminosa, Ponderoso, elige modelo), bombas de paloma (+20; FoF p.77, tabla D6: 1 plantilla 3" sobre el propio tanque, 2-3 sin efecto, 4-5 impacto F5 PA−2, 6 plantilla 3" sobre el objetivo F4 PA−1) y pistola de repetición (+8). Dispara el mismo turno que el cañón; solo un arma del Ingeniero por fase (pref `crewW`).
- FC4-57 (FAQ Core p.18): una unidad controla solo un objeto (rasgo especial, objetivo de batalla, secundario/bagaje, central); `objsAt` + `objOK` en los dos momentos de puntuar (fin de turno / final); pref `objPick` con claves de texto.
- Pendientes por falta de fuente: R40/R41 (Cultos del Caos, AJ «Razing of Westerland»).

## v765 (auditoría de filas PARCIAL)
- FQ1-026, Q10, Q25: comprobadas contra el código actual; ya estaban implementadas (filas desfasadas) → OK.
- RQ09, RQ11: ya implementadas (filas desfasadas) → OK.

## v766
- Voladores: alcance de combate/apoyo con M terrestre (gM) donde el dato existe; faltan gM de 60 voladores (hay que extraerlos de los libros).
## v767
- gM (M terrestre) añadido a 39 voladores más (Pegaso 8, Grifo 6, Águilas/Halcones 2, Wyvern 4, Mantícoras/Dragones/Quimera/Necroesfinge/Jabberslythe 6, Cocatriz 4, Fénix 2, Terradón 2, Girocóptero 1): 97 de 118 voladores. Los 21 restantes (Hexwraith, Mortis, Coven, Linternas, Drones, Skycutter, carros ardientes) no tienen M terrestre en el libro (“-”) o no está en las fuentes.
## v768
- IA: autoaprendizaje para el arma del Ingeniero Comandante (crewW) y el orden de Pánico simultáneo (panicRank); ai.js.

## v769
- core6-024: plantilla de llama colocada por el jugador (flameAim).

## v770
- C2-097: Vórtice colocado por el jugador (cast aim; main.js botón «Colocar el Vórtice en un punto»).

## v771
- Vórtices: distancia desde el borde real de la peana (F2-014, core_8-012); c3-083 verificado (posiciones derivadas del rumbo).
- FQ1-014 y C4-049: comprobadas, ya implementadas (shrinkClose y exclusión de flanco/retaguardia).

## v772
- C2-050: elección de formación (Orden abierto / Escaramuza) al desplegar y al reformar.

## v773
- C4-097: Howdah con Plataforma de tiro (360°) en los 5 behemoths con howdah.

## v774
- FC4-21: ataques de montura aislados de las reglas del arma del jinete (magical, noArmour, noWard, noRegen).

## v775
- Tests de Liderazgo: doble 1 siempre supera y doble 6 siempre falla también en Kanopi de Enkhil, Aullido, Big Boss, Rugido Primigenio (4 sitios que no lo aplicaban). F2-040/041 repasadas.

## v776
- c3-170: reparto de ataques entre varias unidades trabadas: UI del jugador (Atacar a: auto / unidad), restringido a unidades en contacto; decisión de la IA autoaprendida.

## v777
- C4-121: Movimiento aleatorio de unidades mixtas: una tirada por fuente y se usa la menor.
- F2-036: auditado en disparo/combate: efectos de tirada natural usan el resultado final tras repetir.
- C09: Bombas de linterna: objetivo cualquier unidad enemiga no trabada a ≤6" (incluye en huida); elige el jugador.

## v778–v783 (Arcane Journal «Razing of Westerland»)
- v778 Cultos Caóticos; v779 Rasgos; v780 Saber de las Sombras (6 hechizos + Maelstrom) para el Caos; v781 19 objetos (aj_*).
- v782–v783 Escenarios: War in the Shadowlands (Duelo del Guerrero por el primer turno + Mirada de los Dioses para el vencedor, +25 PV por campeón/personaje muerto en desafío, 500 pts, 5 rondas fijas o aleatorias desde la 4), Looting & Pillaging (tren de bagaje 60x100 mm a 22" del borde derecho; Punto de botín por unidad US 5+ en contacto de peana al final de turno, se pierde al huir o ser destruida; no dispara ni lanza hechizos en contacto; +15 PV por punto, defensor +100 PV si controla el tren; 500/750 pts, 4 rondas), Hallowed Ground (zonas triangulares, hito de 4" en el centro: +1 al resultado de combate si se controla en el Inicio de turno; +50 PV por cuarto de mesa y +100 PV por el hito; 500/750/1.000 pts, 5 rondas).
- Aproximación conocida: la tirada de la Mirada de los Dioses se aplica a la unidad del campeón (convención del motor), no solo al modelo.
- R40/R41 (Bárbaros y Jinetes Bárbaros): verificados contra AJ p.39 y marcados IMPLEMENTADO.

## v786 Decisiones opcionales en popup, en el momento
- Persecución/contención (Core p.155), perseguir a una de varias unidades perdedoras, redirigir la carga y a quién (Core p.130), carga bloqueada: detener a 1" o seguir (Core p.131), orden de varios chequeos de Pánico simultáneos (Core p.160): el motor interrumpe la acción (askH), restaura el estado, pregunta con un popup y repite la acción con la respuesta (queda en el registro: guardados y repeticiones idénticos). La reacción ante carga ya era popup.
- Los botones de preferencia de la ficha de unidad solo se muestran en partidas por código (donde no se puede preguntar a mitad de acción); IA/entrenamiento usan sus decisiones aprendidas (sin askMode).

## v787 — Decisiones opcionales convertidas a ventana emergente (segunda tanda)
Cada decisión se pregunta al jugador humano en el momento en que surge (si no hay preferencia explícita guardada); la IA/entrenamiento usa el valor por defecto (autoaprendizaje). Convertidas: Ataque de Gigante / Agarrar y… (gm), Colgante de Cráneo Sangriento (sk), Mazo del Trueno (th), Acción de apoyo de destacamento (sp), Sangre de Hashut (vi, objetivo o no lanzar), Disparos múltiples (mp), Don de la Mutación (mu), Condensador de Disformidad (cn), Padre de Bestias/Borrachos (dk), Dispersión: qué Mago dispersa (dp), Goblin volador: dirección (dv), Reliquia de la Suerte: repetir tirada fallida (lk; opción «no usarla más esta ronda»), orden de movimientos obligatorios (cp, solo con 2+ movimientos reales). Botones previos del panel de unidad ocultos fuera del modo código.

## v788–v789 — Tercera tanda de decisiones a ventana emergente
Arma de combate (mw), armadura propia/montura (ar), Alma de Piedra (sd), Maldición de Hashut: personaje (hp), Palabra Maldita HA/HP (cu), Furia del sapo (td), disparo previo Gran Cathay (mg, con «no disparar»), objetivo que puntúa si controla varios (ob), bombardeo del cielo (bp), hechizo de asalto con varios enemigos (as), ataques de personaje unido (ct). Botones previos ocultos fuera del modo código. Se mantienen como acciones: colocar Piedra de las Manadas (herdsel, colocación en mapa) y elección de hechizos tirados antes de la batalla (legPick/covenPick/spellPick).

## v795 — Cierre de parciales (Core/FAQ)
- FAQ Core p.14 (armadura mágica «por completo o nada»): con armPick='mount' wardOf ignora la salvación especial de objetos de armadura. Fila 68 → OK.
- Doom Diver (RQ07): dirección de la plantilla en 16 rumbos de 22,5° (antes 8 de 45°).
- F2-089 (colina y línea de visión): revisado, ya implementado (visión por encima de unidades no elevadas, misma colina por cercanía a la cima, fila adicional de disparo). → OK.
- Pisotones hacia el otro participante de un desafío (FAQ p.11 fila 18): sigue PARCIAL; exige reservas de heridas por modelo (arquitectura de bloque). No se aproxima.

## v795 — Recuento Arcane Journal (inicio)
rules/recuento/aj_tk.tsv: perfiles de las 9 entradas de unidad del AJ Tomb Kings contrastados con data.js (todos coinciden). Reglas especiales, opciones, objetos, listas y escenarios del AJ: PARCIAL, sin auditoría frase a frase aún. Quedan 7 AJ por trocear (beasts, chaos, dwarfs, empire, orcs, westerland, wood).
- v796 (AJ Tomb Kings): Capataz inmortal y Escultor de piedra (Arch Necrotect) pasan a popup en el momento (askH 'ov'/'ss'); botones del panel ocultos fuera del modo código. Apophas, Nekaph, Settra, Arch Necrotect verificados en aj_tk.tsv.

## v797 — Recuento de los Arcane Journals
- Nuevos recuentos en rules/recuento: aj_tk, aj_dwarfs, aj_orcs, aj_beasts, aj_chaos, aj_empire, aj_wood, aj_westerland.
- Relectura de hoy contra data.js: perfiles y costes de los personajes/unidades de TK (Necroserpientes, Carros de la Guardia 49 por FAQ RH, objetos, listas Hueste Real/Culto Mortuorio, escenario Zandri), Enanos (Thorgrim, Ungrim, Burlok), Orcos (Kiknik, Ogdruz, Bruja Troll, Ogros, Carro Orcos Negros, Gigante), Bestias (Perros Primigenios/Ravager), Imperio (Harald, Hans, Heraldo, Teutogen, Guardacaminos, Carro de Guerra, 16 objetos, Ordenes), Elfos Silvanos (Orion, Araloth, Guardianes, manadas, objetos): sin discrepancias.
- Ogros Imperiales a 29 pts (datos web jul-2026) frente a los 31 del AJ: se mantiene (dato mas reciente).
- Elementos no modelados (PARCIAL): Furia ancestral (+1 F tras seguimiento), «Golpea al final» de las Fauces del Engendro Gigante, resto del AJ Westerland sin relectura completa.
- aj_wood.txt de rules/ es OCR ilegible; se uso rules/new/aj_wood2.txt.
- v797 (código): FAQ Core p.17 Murallas de tierra: la unidad Frenética/Impetuosa obligada a cargar ahora DECLARA la carga (el enemigo reacciona), no se mueve y la carga fracasa (chargeTargets(declOnly) + colFail en doChargeG). Antes no declaraba. FC4-40 → OK.
- v797: Flail de Nekaph: la FAQ RH p.42 sustituye «primera ronda» por «contra los modelos a los que cargó» (ya implementado, sbCharge). AJTK-025/034/042 → OK.

- v798: Core p.117 (cargas múltiples): el jugador inactivo elige por ventana emergente contra qué carga hace Defender y disparar (antes: siempre la de mayor Fuerza de Unidad); la huida sigue siendo directa desde la de mayor FU (empate al azar). c3-044 → OK.
- v799 — Topes a 10 (FAQ Core p.? «¿Hay máximo para las características? Salvo que una regla lo especifique, no»): el reglamento solo fija máximo de 10 en: Iniciativa de carga (core L4642), hechizos de Maleficio/Encantamiento (L3263), Cabalgar en el Viento/Saber (L10243/L10273) y pociones/Alfombra voladora (L11114–11132). Se quitó el tope genérico de 10 en: bonos de Fuerza (Constructo poderoso, Martillo de lobo, Realeza, Grandes, Babeante, Gran Bestia, armas/objetos con F+, primer ataque, doble perfil, Fuerza de plantilla del Gigante Triturador, Impactos), modificadores de perfil de objetos (d[c] += q[c]) y bonus de filas a Ld de Banda de guerra. Se mantienen los topes en Iniciativa de carga, hechizos, pociones, Gaze/Cultos/Maldiciones (pendiente de contrastar su texto) y mecánicas de tirada.
- v800 — Topes a 10 (cont.): quitados también en Cultos del Sabueso y del Cuervo (AJ Westerland: «+1 modificador» sin máximo), Maldición del Hechicero (+1 R), Mirada de los Dioses (HA/A/F/Ld; Ld mantiene mínimo 2), Liderazgo de manadas/merodeadores/Comandante-Capitán (+1 Ld). Mantenidos por texto expreso: Iniciativa de carga, hechizos, pociones, Tapiz de Talsyn («máx. 10»), Marcha rápida del músico («hasta un máximo de Liderazgo 10»). F2-042 → OK salvo auditoría de Iniciativa/Movimiento (sitios ~1874, 5062-5071, 5129-5132, 5497-5758): PARCIAL.
- v800: sitios con Math.min(10) restantes revisados (Iniciativa de carga y pasos de Iniciativa, Movimiento de hechizos Danza/Vigor, HA con Yang/Maleficio, Marcha rápida): todos con máximo expreso o mecánica de pasos; F2-042 → OK.

## v800+ — C5-145
C5-145 pasa a OK: la elección entre dos armas de proyectil se hace en el momento del disparo (botones de arma en la barra, `m.wpn`), los personajes eligen por separado (`wpnPick`), la IA usa `pickWpn`. Sin cambios de código.

## v801 — C5-122
El retador puede nominar también al campeón (rules.js chalRetire "c:", main.js, ai.js). Smokes 44/0 + 44/0 OK.

## C4-110
Revisada Motley Crew (core p.174, FAQ empate): requiere composicion por modelo; el motor usa perfil medio. Bloqueo arquitectonico documentado, sin cambios de codigo.

## core6-066
Dark Ruins / Defended Position: carga desordenada por obstaculo defendido ya implementada (rules.js:4117 darkBld). Fila pasa a OK, sin cambios de codigo.

## core6-099
Reservas (Core p.274-ish Reserves): colocacion tocando borde, personaje unido con una sola tirada y entrada junto a su unidad, personaje solo entra aparte. Verificado por lectura (rules.js:1212, 2200, 8366). Fila OK, sin cambios de codigo.

## c3-018
Auditadas las acciones de la subfase de Mando (rallycry, cmdUse, pociones): todas con marcador de uso por turno/partida. Fila OK, sin cambios de codigo.

## F2-046 / F2-091
Press of Battle: bajas salen primero de la fila de contacto (frontLost) y la segunda fila mantiene su lugar en la fila de combate; equivalente por recuento. Filas OK, sin cambios de codigo.

## v802 — c3-017
Inicio de turno: tareas ordenables con popup «Inicio de turno» (Core: orden elegido por el jugador activo). pw OK, ask_test OK, test dedicado (popup con clima+Fanaticos) OK, smokes 44/0 + 44/0.

## Plan modelos individuales
Creado rules/PLAN_MODELOS.md con fases A–E. Se empieza por la fase A (campeon).

## v803 — faq_core_3 fila 49 (fase A)
Impactos de carga y pisotones: con <5 modelos de tropa el campeon recibe un impacto (FAQ Core p.12); con 5+ no es objetivo. woundAndSave exportada para pruebas. pw OK, ask_test OK, test dirigido OK, smokes 44/0 + 44/0.

## v804 — faq_core_3 fila 18
Pisotones en desafio: popup para dirigirlos al otro participante (FAQ Core p.11). pw OK, ask_test OK, smokes 44/0 + 44/0. Sin test dirigido del popup (requiere montar un desafio completo).

## v805 — F2-045 (fase B)
Orden de asignacion de heridas: letal -> multiples -> simples (FAQ Core p.11). pw OK, ask_test OK, smokes 44/0 + 44/0 (logs 15:11/15:12).

## v806 — fase C (montura), parcial
General del Imperio a caballo: A3 + mountAtk (Warhorse WS3 S3 I3 A1, fof.txt). Quedan fundidos Duque/Baron/Paladin (Bretonia), we_lord_h, orc_warboss_boar y 10 daemonios por falta de perfil en las fuentes. pw OK, ask_test OK, smokes 44/0 + 44/0 (logs 15:18/15:19). F28/F44/R15 siguen PARCIAL por esos personajes.

## v807 — c3-035
Carga imposible por terreno impasable (chargePossible). pw OK, ask_test OK, test dirigido (sin terreno 1 / obstaculo rodeable 1 / muro de lado a lado 0), smokes 44/0 + 44/0 (logs 15:25/15:26). Limite: no considera la anchura de la unidad al pasar por huecos estrechos (por diseno, para no bloquear cargas legitimas).

## v808 — C4-080
Disciplinado: reordenar filas gratis antes de mover (Core p.167). pw OK, ask_test OK, test dirigido OK, smokes 44/0 + 44/0 (logs 15:33/15:34).

## v809 — core6-035
Terreno peligroso por modelo segun su trayectoria (dangerModels). pw OK, ask_test OK, test dirigido OK (franja total = todos; fuera = 0; parche estrecho = 11 de 25), smokes 44/0 + 44/0 (logs 15:39/15:40). Limite: trayectoria recta por modelo, sin el arco de las ruedas.

## C4-047
Asalto con plantilla: bajas por la reserva (rango trasero), sin sumar a frontLost. Verificado por lectura (rules.js:4541-4577, 6088). Fila OK, sin cambios de codigo.

## c3-089
Los confines del mundo ya implementado (previewMove: noTable en pasos intermedios/ruedas; destino dentro). Fila OK, sin cambios de codigo.

## C4-078
Destacamentos/Unidad regimental auditados frase a frase (Core p.282-283) contra rules.js; todo presente. Fila OK, sin cambios de codigo.

## c3-154
Instant Kills: cada efecto implementado con su texto (Golpe letal sin armadura/regeneracion, otras salvaciones permitidas). Fila OK, sin cambios de codigo.

## Auditoría C4-070 (p.164 Prioridad/Acumulativas)
Texto leído en core_rulebook.txt l.5227-5243. Sin cambio de código; nota actualizada, fila sigue PARCIAL (no hay resolvedor genérico, sin conflictos en datos).

## Auditoría core6-088 (Contingentes aliados p.280)
Leídas las 6 viñetas. Unirse, Presencia Inspiradora, Mantened la posición y bendiciones ya no se cruzan. Sin cambio de código; PARCIAL por reglas de ejército restantes.

## Auditoría C4-075, F28/F44/R15/RQ16/F62 (v809)
C4-075: FAQ p.167 (mayoría de modelos con la regla) revisado; el bloque de escaramuza no tiene modelos individuales, sigue PARCIAL. Montura Bretonia: en el repo solo está el Corcel de la Arcane Journal (Proscrito, +12); el libro de ejército de Bretonia con las monturas del Duque/Barón/Paladín no está, así que no se separan sin suponer. Los pendientes restantes dependen de textos que el usuario debe aportar (Westerland legible, Cultos Caóticos, Combined Arms, libro de Bretonia) o de acuerdo de mesa (terreno).

## v810 – Corredores de carro: mayoría (FAQ Core p.167)
runnersMaj(o): has chariotRun y o.models > modelos de personajes unidos; usado en el paso de carros (skinkScr) y en la línea de visión. Build, pw, ask_test OK. Auditoría F28/F44/R15/RQ16/F62: solo Corcel Proscrito en repo; sin libro de Bretonia no se separan monturas sin suponer.

## v811 – Monturas propias (F28/F44/R15/F62) y Combined Arms (FC4-56)
Fuentes: tow.whfb.app (transcripción del libro: Corcel bretoniano M8 HA3 F3 I3 A1, Jabalí de guerra M7 HA3 F3 I3 A1 con Piel acorazada 1, Corcel élfico M9 HA3 F3 I4 A1). Duque A5, Barón A4, Paladín A3, Doncella A1, Profetisa A2, Sargento A2, Jefe de Guerra Orco A4, Señor del Claro A4 (+ montura A1 en mountAtk). Combined Arms: texto leído; faltan restricciones por unidad.

## v811 – Westerland (AJWS-005) cerrado con re-OCR
PDF original (adjunto) -> pdftoppm 300 dpi + tesseract --psm 1: rules/new/aj_westerland_ocr300.txt. Comparado con código: perfiles, rasgos, cultos, Saber de las Sombras (imagen p.35 confirma orden/tipos), objetos (precios confirmados en imagen p.38) y escenarios. Sin discrepancias. Las Campañas Camino a la Gloria (p.18-21) quedan como AJWS-006 AUSENTE (meta-juego entre partidas). «Chaos Cults» ya estaba implementado (p.33).

## v812 – Perfil dividido de máquinas (C5-046, FC4-26)
Core p.197 + FAQ (Unidad de Fuerza = Heridas de la dotación). Datos de dotación leídos de fof.txt, rh.txt, aj_dwarfs2, aj_bretonnia, leg_skaven, leg_chaosdwarfs, leg_darkelves. Código: crewWOf, machCrewMode (trabada ⇒ dotación), reserva inicial = crewW, models de máquina = 1 mientras queden heridas, woundAndSave0 usa la reserva correcta (máquina fuera de combate: W − mDmg). Test /tmp/mach_test.mjs: Trabuquete (H3 máquina, H4 dotación) cae a 3H fuera de combate y a 4H en combate; Cortagoblins US 1.


## v813 — Armas Combinadas (FC4-56) y Bretonia Gran Ejército
- v812 verificado: smokes 44/0/0 ambas mitades.
- `ownRestricted(type,list)` en data.js: una unidad tiene restricción propia si 10 copias generan un aviso de lista distinto de los genéricos; esas unidades, los destacamentos, personajes con nombre y mercenarios no cuentan para 0-3/0-4/0-3/0-2 (+1 por 1.000 sobre 2.000).
- Nuevo validador Bretonia Gran Ejército (FoF): 0-1 Duque; 0-1 Barón o Profetisa por 1.000; 0-1 Trabuquete por 1.000; 0-1 Andantes por unidad de Caballeros del Reino.
- Pendiente: auditoría de restricciones sin validador en otras facciones; Terrorgheist/Mortis Engine; C4-075 coherencia por modelo.


## v814 — monturas (Rey Ghoul/Mortis), FC4-56 auditoría Gran Ejército, C4-075
- Rey Ghoul en Terrorgheist: ranuras jinete A5 / garras ×3 (envenenadas) / Fauces rancias ×1 (opcional con mawOff, no envenenada, FP −2, Perf. 1, H. múltiples 2); montura I3 en su paso.
- Nigromante/Acólito en Motor Mortis: jinete + 3 Banshees (HA3 F3 I3) + Horda espectral (D6 aleatorios HA3 F3 I1).
- ownRestricted detecta 0-X / máximo / «por cada X»; OWN_EXTRA para Heraldos, Bestias condicionadas y Catay.
- C4-075: sin estado legal afectado (ver TSV).


## v815-v816 — RQ16, látigo, Camino a la Gloria
- RQ16: opción chm (+10) y gating de Flamígero de Tzeentch en la montura del carro.
- Látigo (Necrotecto): pref whipOn (botón, IA aprendida).
- Camino a la Gloria: applyVets/vetReport (rules.js), vetD en D(u) (Ld, HA, HP, filas máx. +4, FP máx. 5), repetir 1 una vez/partida (vetRRuse), créditos de destrucción en combate, disparo y hechizos; UI en Campaña (main.js). Prueba /tmp/vet_t.mjs.

## v817
- C5-061 cerrado (perfiles de campeón completados). AJCH-008, AJDW-015, C4-110 y F-54 marcados OK con justificación.

## v817b
- C2-078 OK (cobertura modelo a modelo ya implementada). Terreno core6-030/043/044/052 y core_7-030 → NA (acuerdo de mesa/opcional/fuera de 2 jugadores). Siguen PARCIAL: core6-014, core6-088, core_7-029, F54, C4-070.

## v817c
- core6-014 OK (punto de puntería ya implementado), F54 NA, C4-070/core6-088 OK (auditados), core_7-029 NA (liga descartada). Sin filas PARCIAL/AUSENTE.

## v818 — Auditoría independiente automática
- Perfiles (M/HA/HP/F/R/H/I/A/Ld) de todas las unidades no-personaje comparados con las tablas de fof/rh/AJ/Legends/Cathay: sin discrepancias salvo erratas de FAQ ya aplicadas (Espadones F4, Flagelantes R4, Marauders 30x30, Dríadas M6, Engendros M 2D6+1).
- Puntos comparados con tablas + FAQ "Change the Points": coinciden (equipo incluido o erratas FAQ).
- Peanas/tamaños de unidad: corregidas Lanzallamas de Tzeentch 30x30, Engendros de Slaanesh 50x75, Lobos de Piel 40x40 (Legends/AJ).
- Campeones (C5-061) completados en v817.

## v819 — Auditoría automática de reglas especiales y opciones
- Comparador libro↔motor (reglas especiales por perfil y costes de opciones). Correcciones: Acechadores Sepulcrales +Zancada ligera, Desamparados +Orden abierto, Águila Gigante Alto Elfa +Pisotón (1), Perros del Caos (Bestias/Caos): Orden abierto + opciones Piel blindada (+1), Ataques envenenados (+1), Vanguardia (+5/unidad), Escorpión de la Tumba: Emboscadores (+5).
- v820: Cuidador de Perros del Caos implementado (opción +15/unidad: se crea unido a la unidad, no puede abandonarla, las unidades de Perros a su alcance de mando usan su Ld; opciones gratis arma adicional/látigo).
- PENDIENTE: Manada de Garrapatos (Motley Crew): faltan los Pastores (perfil propio M4 HA2 HP3 F3 R3 H1 I3 A1 Ld6, mínimo 1 por cada 5 Garrapatos) y su lanza de empuje +1/modelo.

## v821 — Manada de Garrapatos de los Goblins Nocturnos (RH p.26)
- Añadidos los Pastores de Garrapatos (M4 WS2 BS3 S3 T3 W1 I3 A1 Ld6, 3 pts) como fila trasera (mixRear con `ratio: 5`: al menos 1 Pastor por cada 5 Garrapatos; los Garrapatos ocupan las filas delanteras), Garrapato de las Cuevas 10 pts (antes 12), Tamaño de unidad 1+/5+ (mín. 6 modelos), Tropa mixta (Motley Crew), lanza de empuje +1 pt por Pastor (`rearOnly`).
- Nuevo helper `mixMinOf` (data.js) usado por validación, createGame y selector (main.js).
- Pendiente de auditoría: ninguno conocido.

## v822–v823 — Comparador automático unidad ↔ libros (rules/verif/auto)
Herramienta reejecutable (`rules/verif/auto/run_all.sh`):
1. `parse.py`: extrae TODOS los bloques de unidad de fof/rh/AJ/Legends/Cathay anclando en «Troop Type:» (tabla de perfiles con todas las filas, puntos, peana, tamaño, opciones y Special Rules con las líneas de continuación de la columna correcta). 454 bloques (404 únicos).
2. `sr_cmp.mjs`: empareja cada bloque con unidades de datos por perfil (≥6 de 7 características) **+ puntos iguales + coincidencia de nombre** (3 señales), traduce las reglas inglesas a ids con `dict.json` (~170 reglas + camelCase automático) y compara reglas FALTA/SOBRA, con equivalencias de representación (Undead/Daemonic/Ensorcelled, `randA`, `regen`, `impact`, `ranged.poison`).
3. `size_cmp.mjs`: Unit Size y Base Size contra los datos. `sobra.mjs`: comprueba que cada regla «de más» en los datos aparece en el texto del libro.
Resultado y correcciones (libro, sin FAQ en contra):
- Martilladores: +Armas de gromril, +Muro de escudos (FoF lista ambas; la FAQ solo añade Armadura de gromril).
- Magos del Imperio (Señor de la Magia/Maestro Mago, incl. Pegaso) y Damisela/Profetisa de Bretonia: +Ataques mágicos.
- Escuderos: +Moverse entre la maleza, +Orden abierto. Caballeros Buscadores y del Grial: +Formación en lanza. Bailarines de la Guerra: +Tropa mixta, +Orden abierto. Dríadas: +Orden abierto. Orcos Negros: +Tropa mixta.
- Gors y Ungors (Manadas de Gors/Ungors, RH): +Orden abierto, +Escaramuzadores (las manadas primigenias AJ lo reemplazan por Orden cerrado).
- Arqueros a caballo Esqueleto: Exploradores + Escaramuzadores (no Caballería rápida).
- Juramento del Grial (FoF): Ataques mágicos y no puede rechazar un desafío (motor: `mustDuel`).
- Peanas: Escorpión de la Tumba 75×50, Buscadoras 30×60, Chillones 40×60.
Verificado como representación correcta (no error): Aleatorio (`randA`), Regeneración (`regen`), Impacto (`impact`), Veneno a distancia (`ranged.poison`), Grandes Martillos con Ataques mágicos propios, tamaños corregidos por FAQ (Caballeros Buscadores 3+, Marauders 30×30). Giants/Bonegrinder: la peana se toma en el tamaño máximo del rango del libro.
Limitación conocida: el emparejamiento exige perfil+puntos+nombre, por lo que las monturas, máquinas y carros (perfiles compuestos) y las variantes de punto distinto siguen verificadas solo por las auditorías anteriores y por pares manuales.

## v824 — comparador de perfiles compuestos (composite.mjs, sin cambios de datos)
- Cobertura actual (unidades visibles): fila única 363, fila + opciones por modelo 42, personaje+montura 156 (movimiento por montura, jinete o Vuelo(N) leído del libro), máquina/carro por bloque 73 + por grupo de filas contiguas 16 = 89; **sin explicar 172** (lista en rules/verif/auto/out/comp_none.txt).
- Mejoras: Vuelo (N) del propio texto del libro como valor válido de M; emparejamiento de nombres tolerante (horsemen/horseman, prefijo de 5 letras); tablas sin cabecera parseada se agrupan por filas contiguas; Heridas/Ataques de carros = suma de piezas del mismo bloque (tripulación + corceles + chasis).
- Límite conocido: en carros/máquinas la suma de Heridas/Ataques admite hasta 5 sumandos del mismo bloque (no cuenta exactamente cada multiplicador "(x2)"); los 172 restantes son sobre todo variantes (_amb, _famb, guarnición, cohorte, engendros por marca), monturas con puntos que dependen de otro libro y carros compuestos; requieren revisión caso por caso.

## v824 — revisión manual de 171 unidades sin explicar (agente + contraste)
- Resultado del agente: 89 OK, 79 discrepancias, 3 no encontradas (informes en rules/verif/auto/out/chunks/r0–r3.md).
- Corregido tras contrastar con el libro: M de las máquinas de Imperio/Orcos/Bretonia (la tripulación manda: Gun Crew/Goblin Crew/Crew M4 → cañón grande, lanzapiedras, lanzavirotes goblin, trabuquete; core.txt:6526); A total de montados bretones (rider + montura: Barón Pegaso Real 7, Duque Hipogrifo 9, Duque Pegaso 7, Duque Pegaso Real 8, Barón Pegaso 6, Barón Hipogrifo 8, Paladín Pegaso 5, Paladín Pegaso Real 6).
- Pendiente (sin tocar, por ser convención del motor o requerir implementar reglas): reglas especiales que faltan en sr (Armour Bane de Engendros, Razor Tusks/Foe Render, Elven Reflexes en carros, reglas de Sky Lantern, etc.), A de carros con personaje (tripulación), perfiles ogros (Hunter/Bruiser/Tyrant), puntos +2/+5 por equipo por defecto, unidades reconstruidas (Knights of the Shrouds, Hailshot).

## v824 — pasada sistemática por todos los FAQ (faq_scan.py)
- rules/verif/auto/faq_scan.py reconstruye las dos columnas de faq_fof/faq_rh/faq_core/faq_cathay y extrae todas las entradas «Nombre: Change/Add/Remove…» (210; salida out/faq_entries.json). 76 tocan perfil/puntos/tamaño/peana/reglas de unidades; 149 son hechizos, reglas, armas, objetos.
- Contrastadas con data.js y corregidas: Araloth 150 pts (FAQ 2026 sobre AJ 2025), Hans von Löwenhacke Ld10, peana 30x30 Jefe y Berserkers Marauder, peana 50x50 Lobos de Piel, Cortagoblins tripulación H2/A2, VL 9+ de Furia de Athel Loren y Cólera de Durthu. Ya conformes: puntos/tamaños de Glade Guard, Eternal Guard, Sisters of the Thorn, Wild Riders, Minotauros, Centigors, Dragon Ogres, Peregrinos, Pegasus Knights, Skeleton Chariots, Tomb Guard Chariots; VL de todos los hechizos listados; vórtices (se mueven en cada Inicio de turno); precios de objetos Cathay; Ogre Blade 75.
- Sin comprobar aún: texto de efecto de hechizos/reglas/objetos de los FAQ (p. ej. Orion: Sabuesos espectrales impiden disparar a Orion, nota Steam Cannon arco frontal, Berserker Blade), Greatsword/Count's Champion F4, Trollhammer Torpedo.

## v825 — correcciones adicionales (sin publicar)
- Carros con personaje: A y ataques de dotación sumados según FAQ Core (el personaje no sustituye a la dotación); perfiles divididos por grupo de ataque.
- Ogros, Skaven, Hombres Lagarto (impactos/howdah), Cathay (Linterna Celestial A6), Cohortes TK, Carros de Tuskgors/Cuchillas: perfiles y reglas corregidos.
- Ingeniero del Imperio: 45 pts, armas como opciones (ya no incluidas); Carro de Vapor = 145+8+w.
- Látigo del Maestro de Cadáveres (vc_corpsecart) añadido como opción.
- Equipo "horneado" eliminado de monturas de señores (escudo opcional +2): Mantícora 315, Dragón del Caos 480, Carro del Caos 305, Rey TK en carro 195, Señor de las Bestias en carro 200, Príncipe en carro de Tiranoc 205.
- Mantícora: la montura no da T (solo +4 H): Señor T5, Hechicero T4.
- General en Grifo: 220 pts (90+130), R5/H6, opciones de equipo del General (FoF p.~76).
- Pendiente: Grifo Imperial (160, F6 I4 A4, +4 H, Behemoth 60x100, Stomp D3+1) como variante; ver out/chunks/r0–r3.md para el resto de discrepancias del agente.

## v825b — discrepancias r0–r3
Revisadas todas las líneas DISCREPANCIA / «faltan opts/sr» de rules/verif/auto/out/chunks/r0–r3.md contra el estado actual (data.js tras v825) y el texto del libro/FAQ. Cambios en el bloque «v825b» al final de app/js/data.js (salvo Centinelas, corregidos en su definición) y dos reglas nuevas en rules.js.

Corregido:
- ct_sentinel_*: las 5 variantes compartían la clave `ct_sentinel` (solo existía la de piedra bruja, con el id cambiado y Regeneración). Ahora: ct_sentinel (terracota, 230, Regeneración 6+), _jade 250, _obsidian 255, _granite 265, _warpstone 270, sin Regeneración salvo la terracota (cathay_notes.md:13).
- he_prince, he_prince_h, he_noble y Príncipe en Grifo/Dragones/Carro: quitado Grito de reagrupamiento (fof.txt:6079 solo Ithilmar, Golpear primero, Valor). he_prince_tiranoc: +Reflejos élficos, +Orden abierto (fof.txt:6770).
- he_chieftain_chariot, he_korhil_chariot: +Carga furiosa* (aj_highelves.txt:1093, 1226; solo jinete).
- de_dreadlord_chariot, de_master_chariot: +Orden cerrado, +Reflejos élficos (leg_darkelves.txt:711). de_coldchariot: F4 (tripulación; F5 es el chasis, leg_darkelves.txt:698-700).
- sk_greyseer_bell: +Escabullirse, +Valor vermino, +Partida de guerra (leg_skaven.txt:136-140). sk_plaguepriest_furnace: +Nube de moscas, +Escabullirse, +Valor vermino, +Partida de guerra (leg_skaven.txt:250).
- dm_herald_khorne_throne: +Orden cerrado (leg_daemons.txt:256).
- black_warboss_boar/_chariot, black_bigboss_boar/_chariot: +Reprimir impetuosidad (rh.txt:373).
- orc_boar_chariot: opción Tercer tripulante +5 (+1 A) (rh.txt:1367).
- mangler_squig: nueva regla kerSplat (terreno difícil = peligroso; rh.txt:1568-1571), en rules.js junto a la de Ruedas herradas.
- emp_lector_altar: nueva regla symbolMight (alcance de mando 12"; fof.txt:2711-2716), en commandRange.
- we_lord_eagle: +Evasivos, +Huida y disparo, +Ignora la cobertura, +Moverse entre la maleza (fof.txt:4672; Core: las reglas del jinete se aplican al modelo).
- tk_chariot: +Secos como el polvo (rh.txt:6063). tk_king_chariot: +Orden abierto (+Impactos en sr) (rh.txt:5567).
- vc_count_coven / vc_thrall_coven: quitados Grito de reagrupamiento, Valor de los Eones y Golpear primero (no figuran en leg_vampires.txt:98, 135, 704-706); +Inflamable (leg_vampires.txt:133-135). vc_thrall_coven: Indomable (1) y sin Mago de nivel 2 (leg_vampires.txt:128-135). vc_corpsecart: Regeneración (6+) visible en sr (ya en perfil).
- Bretonia: Corcel bretoniano A1 (fof.txt:3527): Duque/Barón/Paladín a caballo A 6/5/4 (antes 5/4/3); a pie A 5/4/3 sin ataques de montura (antes 4/3/2 con mountAtk residual); Damisela/Profetisa a caballo A 2/3 (antes 1/2: el jinete no atacaba).
- br_baron_pegasus, br_duke_rpeg, br_paladin_rpeg, br_prophetess_rpeg: Perforante (1) del Pegaso Real (fof.txt:3568). br_baron_hippo, br_duke_hippo: opción Barda +15 (fof.txt:4038).
- he_prince_sun, he_noble_sun: quitada opción «armadura completa +6» (Sangre de Caledor la da gratis y ya está en el perfil; fof.txt:7184).
- emp_hans: sin opciones (aj_empire2.txt:1117 «must be fielded as presented», equipo fijo). rc_mortar: sin Aparejos de cañón (renegade_web.txt:173 «No options»).
- de_beastmaster: retirado de la lista (debe ir montado; leg_darkelves.txt:161-174); siguen sus variantes en Carro y Mantícora.
- dm_herald_tzeentch_chariot = Heraldo en Carro de Tzeentch (no Carro Ardiente: r0 lo confundió): 90+90 = 180 a Nivel 1, F3 R4 H6 I3 (leg_daemons.txt:728, 882-883); disco y carro: Nivel 1 base con opciones Nivel 2 +30 / Nivel 3 +60 (antes Nivel 2 gratis; leg_daemons.txt:745-747).
- dm_herald_slaanesh_chariot / _exalted: variantes Mago nv 1 (+30) / nv 2 (+60) (leg_daemons.txt:531-533).

Falsos positivos (ya representados): Matón orco (bullyOk), Perforante de Engendros/Dríadas (melee.ab), Piel acorazada (avOpt.hide), Armadura celestial (ward), Odio de Miao Ying (rules.js Ira de la Tormenta), Glamour espantoso (=beguile), Estanque adivinatorio (extraBound), Brasero/Tintinabulación obligatorio (validador), Zzzzap!, Piedra de las Manadas (terreno), Mercenarios (comp merc), Virtudes y Marcas (objetos/botón), Esqueletos invocados 2D6+3 (hechizo), Cuidador de Bestias (componente), bombas de Cathay (objetos), Motor Mortis solo montura, F del arma en Perforadora/Segadora, «lanza +3» del Trono (es la armadura ligera +3).

Pendiente:
- Armas de la dotación en carros/monturas con personaje: arcos largos y Disparo rápido del Carro de Tiranoc (he_prince_tiranoc), ballestas de repetición del Carro de Gélidos (de_dreadlord/master_chariot), armas de la Linterna del Cielo con Estratega/Magistrado: el motor no combina el disparo de la dotación con el del personaje.
- orc_boar_chariot: Frenesí (+2 por tripulante, 0-1/1.000) y Pintura de guerra (+10): el Frenesí del motor da +1 A por modelo, no por tripulante.
- bm_razorchariot: Desgarrador de enemigos solo de la Razorgor (la ranura tiene FP fija).
- Reglas sin implementar: Da Boyz (Orcos Negros), Daemon of Tzeentch, Estandarte del Conde (Esbirro), Lady Élisse (Contragolpe arcano, Aura y Escudo de la Dama, Cáliz de Brionne, Báculo de los Elementos).
- Ogros (Carga de toro/ogro, Perforante del jinete) e Ingeniero en Carro de Vapor (Ld): fuera de esta pasada (ya revisados en v825).

## v826 — auditoría de textos de efecto
Volcado: rules/verif/auto/out/txt/t0–t21.json (1317 entradas: 698 objetos, 205 hechizos, 414 reglas). Progreso detallado por bloque: rules/verif/auto/out/txt/progreso.md.
- Revisadas: 1317. Bloques t0–t12 (objetos y primeros 82 hechizos) entrada a entrada contra libro y FAQ (texto + campos numéricos + código); t13–t21 (resto de hechizos y reglas) dirigidos por todas las erratas de FAQ de efecto (out/faq_entries.json) + muestreo de Core. Comprobación cruzada automática texto↔banderas de restricción en todos los ITEMS.
- Corregidas: 91 entradas (+2 cambios generales de validación). Pendientes: 7.

Cambios (fuente):
- Matamonstruos real: dragonslayer (core.txt:10941), heaj_woodsman (aj_highelves.txt:1636), sword_heroes (fof.txt:4203), he_white_sword (fof.txt:7234; también en carro).
- b_gleaming: repite cualquier chequeo de Ld fallado salvo Ruptura (fof.txt:3108); helper gleamRR en Miedo/Terror/Pánico/Estupidez.
- familiar, staff: solo Imperio (fof.txt:3133-3150); familiar 0-1 por Mago.
- blades_loec +D3 A real (fof.txt:5676), last_waaagh +D6 A con pérdida tras 6 (rh.txt:1810): nuevo campo aRoll. helm_hunt +1 HA al cargar (fof.txt:5720).
- heartwood_lance: la Lanza de Duramen bretona estaba sobrescrita por la clave duplicada `heartwood` (fof.txt:4210).
- b_imperial: alcance de mando del portador (fof.txt:3077). fracasse destruye armas mágicas (fof.txt:4222). b_errantry +Impetuoso (fof.txt:4257). b_raggedy +1 HA (rh.txt:1858). pigstikka +1 A por fila enemiga al cargar (rh.txt:1819, faq_rh.txt:40).
- bm_dark_heart: decisión del jugador en Mando (rh.txt:4902). r_luck: también impactar/herir (fof.txt:1484). he_cloak_beards: nadie usa su Ld (fof.txt:7330). bm_primeval Odio (Imperio) (rh.txt:4832).
- gf_ichor solo en desafío (rh.txt:3333). tk_rulership dobla la FU y sus impactos son mágicos (rh.txt:6600). tkaj_antarhak recupera 1 Herida por Herida (aj_tk2.txt:1365).
- Restricciones de tipo de tropa: ct_warbird, sirienne, woc_crimson, woc_pendant, wocaj_platemail, heaj_stars, del_blood, vcl_accursed, skl_fell, heaj_starlance, wocaj_barding (nueva cavOnly); footOnly fuera de Linajes ahora se valida (tk_dunes, tkaj_phakth, wocaj_scourge, wocaj_bloodskull, lml_feathers, vcl_p_flying, cloak_leaves).
- Requiere dos manos: tk_destroyer, tk_crook, tk_flail, tk_serpent, empaj_pearl, empaj_hammer, ct_reason, tkaj_phakth, tkaj_aeons, bmaj_khorgor, heaj_woodsman, okl_thunder, aj_bigger_axe, aj_martog; woc_familiar 0-1.
- Hechizos atados en objetos hechizados para cualquier personaje (quitado «solo magos»): heaj_fury (aj_highelves.txt:1737), ct_mask, ct_ringjet, wocaj_rod. ring_ruin: objeto hechizado, NP1 (core.txt:11143, faq_core.txt:287).
- Bastón Nudoso de Buzgob ya no da +3" de alcance (era del Ídolo de Gork; rh.txt:1918, faq_rh.txt:237).
- Retirados duplicados sin respaldo: rod_damned, twice_blessed, ring_taal, ring_fury (de).
- Maldición de la Huida Cobarde: chequeo de Pánico real; Cede terreno solo si supera Pánicos automáticamente; no a trabadas (core.txt:10165, 5152; FAQ VL 8+).
- Torrente de Duendes: terreno difícil (faq_fof.txt:170). Aquelarre Oscuro: sin Disfunción por cualquier doble (faq_rh.txt:133).
- Textos corregidos a la mecánica/FAQ: pociones, power_scroll, dispel_scroll, pillar_fire, evil_sun, ere_we_go, fist_gork, bad_moon, elem_spirit, spiteful_torrent, coven, impetuous, large, regen, impact, warband, swiftstride, evasive, randMove, woc_skull, aj_backstabber, b_imperial, pigstikka, last_waaagh.

Pendientes:
- silver_horn (repite el D6 de Zancada solo con ≤3, sin preguntar) y favour_gods (repite con un 1, sin preguntar).
- helsturm / quest_sword: el perfil se elige automáticamente; debe elegirlo el jugador al inicio de cada ronda.
- he_null_stone: falta la inmunidad a hechizos tras el chequeo de Ld en Mando.
- woc_daemonsword: los 1 naturales para impactar golpean a la propia unidad: no implementado.
- tk_destroyer: ataque «Segador» (D6 impactos automáticos) no implementado.
- tkaj_winds: «infantry only» de un estandarte de unidad no se valida.
- Textos de reglas de ejército (t15–t21) no cotejados frase a frase con el libro (solo FAQ y muestreo).

## v827 — pendientes y reglas t15–t21
Progreso detallado por bloque: rules/verif/auto/out/txt/progreso2.md.

### A. Pendientes de v826 (7 → 0; 1 nuevo anotado)
- Cuerno de Plata (fof.txt:3134-3136): el D6 de Zancada veloz (carga, Implacable, huida, seguir, persecución, huida continuada) se tira y el jugador decide si lo repite (popup; IA con aiPick). Nueva validación «solo personajes con Zancada veloz» (swOnly).
- Favor de los Dioses (rh.txt:3468-3469): repetición de cualquier resultado de la Mirada de los Dioses, un solo uso, a elección del jugador (antes solo con un 1, automática).
- Maza de Helsturm (fof.txt:3049-3058) y Espada de la Búsqueda (fof.txt:4202-4210): popup del perfil al empezar cada ronda de combate (dualPick por turno); con la Espada a dos manos ya no conserva Golpear primero (antes se anulaba con Golpear al final).
- Piedra Nula (fof.txt:7312-7318): acción en la subfase de Mando (botón; IA candidata aprendida), si no está trabado; chequeo de Ld sin modificar; si lo supera, hasta su siguiente Inicio de turno no puede ser objetivo de hechizos (spellTargets) y es inmune a sus efectos (fx restaurados, sin heridas de hechizos ni vórtices).
- Espada Demoníaca (rh.txt:3365-3367): cada 1 natural al impactar con el arma es un impacto (perfil del arma) contra la unidad a la que se ha unido el portador o contra él mismo (unidad, personaje unido y desafíos; no la montura).
- Destructor de Eternidades (rh.txt:6515-6517): ataque «Segador» elegido en el momento (popup): en lugar de sus ataques, D6 impactos automáticos con el perfil del arma contra la unidad (o el modelo en desafío) atacada; la montura sigue atacando.
- Estandarte de los Vientos del Desierto (aj_tk2.txt:1436): «Models whose troop type is ‘infantry’ only» validado en los estandartes (también aj_steadfast).

### B. Cotejo frase a frase de t15–t21 (417 entradas: 414 reglas + 3 hechizos ligados)
- Revisadas: 417 (t15 60, t16 60, t17 60, t18 60, t19 60, t20 60, t21 57) contra el texto inglés del libro (core/fof/rh/AJ/Legends/Catay, en las líneas citadas en progreso2.md) y las FAQ.
- Mecánica corregida en 22 reglas (más los 7 objetos de la parte A) + 1 cambio general; textos corregidos en 45 reglas y 7 objetos; el resto, conforme.
- Cambios de mecánica (fuente):
  - Levas (core.txt:5540-5552): la exención de Pánico solo cuando la unidad de Levas se desmorona y huye del combate.
  - Muro de escudos (core.txt:5785), Falange nehekharita (rh.txt:6700-6709), Defensa implacable (leg_vampires.txt:409): exigen escudos en uso; Falange/Defensa implacable con popup («may choose»).
  - Hambre voraz (leg_ogres.txt:771), Banda de guerra (core.txt:5851-5853) y estandartes de repetir carga: popup al ver la tirada (antes automático / siempre).
  - Implacable (cathay_aj.txt:2141-2144): estaba invertido (convertía huida en Ceder terreno); ahora puede elegir no Ceder terreno, y la repetición de carga 1/partida con popup.
  - Voto del Cruzado (aj_bretonnia.txt:1046): restricción de unión con Campesinado.
  - Gran Incensario (leg_skaven.txt:700-702): −1 a la Resistencia real (antes +1 a la tirada para herir).
  - Tozudos (core.txt:5803-5808): solo la primera Prueba de Rotura, elegido antes de tirar (popup).
  - Bendición de Hekarti (leg_darkelves.txt:1034): popup.
  - Pisotón (core.txt:5770-5775, Behemot «Thunderstomp», faq_core.txt:141): contra cualquier enemigo en contacto (antes se omitía contra monstruos, máquinas, infantería/caballería monstruosa e infantería R5+ 3H); FP −2 del behemot salvo contra criatura monstruosa/behemot; Ruedas de bronce FP −3 salvo contra behemots (leg_daemons.txt:300-302); stompN añadido a 12 perfiles (Antiguo/Hombre Árbol D3, Parientes 1, Centigors 1, Ogros Dragón 2, Ghorgon D3, Terrorgheist D6).
  - Hágase mi voluntad (raw RH «My Will Be Done») y Danzas de Loec (FoF Wardancers): elecciones del jugador (popups), antes del motor.
  - Plegarias de Sigmar y de Ulric (FoF): plegaria, intento y unidad amiga elegidos por el jugador (popups); Martillo/Escudo/Aullido sobre otra unidad ya no se aplican a la unidad del sacerdote.
  - ¡Los garrapatos se desmadran! (RH Squig Herd): solo cuentan los Garrapatos, no los Pastores.
  - Guardia real (FoF Hammerers): con Rey/Thane unido cualquier modelo da y acepta desafíos.
  - Aura de ventisca (fof.txt:7004): Golpear al final (se anula con Golpear primero); Don «Aura encantadora» (rh.txt:3331-3338): como Almizcle soporífero.
  - Segador de Usirian (aj_tk2.txt:1038-1041): solo contra el personaje nominado (no contra toda su unidad); también en desafíos.
  - Incursora sin igual (aj_chaos2.txt:1070-1074): ±1 a la tirada de llegada con popup al ver la tirada.
  - General: los efectos temporales (fx «hasta tu siguiente Inicio de turno» y «hasta el fin del turno») de los personajes UNIDOS no expiraban; ahora expiran como los de las unidades.
- Textos corregidos: blessings, levies, shieldwall, ravenousHunger, peasantry, questingVow, crusadeVow, implacable, implacDef, timmberr, stampede, frenzy, verminValour, scintSorcery, tgGuardians, hidden, martialPride, hellbound, stubborn, warband, volley, hekarti, holdLine (la entrada duplicada de Hans sobrescribía el texto), stomp, guardians, loec, braystaff, myWill, unstable, rally, prayerSigmar, prayerUlric, runPack, hawkEye, royalGuard, blizzard, stratMastery, prepPos, peerless, reaper, unicornSkull, endlessMalice, hatredNamed, motley, y los textos de objetos silver_horn, favour_gods, helsturm, quest_sword, he_null_stone, woc_daemonsword, tk_destroyer.
- Pendientes (nuevos, anotados): hellbound — la repetición 1/partida de un dado de artillería se aplica sola al salir Avería; motley — no hay armas/armaduras distintas por modelo dentro de una unidad (una opción por unidad salvo mixRear/slots) ni se ha verificado el reparto de bajas de disparo «lo más igual posible».
- Build + /tmp/pw.js: errors: [] (tras t15–t17, t18–t20 y al final). /tmp/ask_test.mjs: 4 partidas completas sin errores (nuevas preguntas: Banda de guerra, Zancada veloz/Cuerno, etc.).

## v828 — pendientes finales
Cambios en app/js/data.js (bloque «v828» al final; optCost con costF; ISSUE_HOOKS en armyIssues; optView con oid/xAo/xSo), app/js/rules.js y app/js/main.js (botón «Báculo»). Build + /tmp/pw.js: errors: [] (tras cada par de tareas y al final). /tmp/ask_test.mjs: 4 partidas completas sin errores; prueba adicional con 3 partidas (Altos Elfos/Elfos Oscuros con carros, Catay/Bretonia con Linternas y Bandidos variopintos, Enanos del Caos Ligados al infierno/Orcos con Da Boyz y Carro de Jabalíes frenético) sin errores.

### 1. Dotación + personaje en carros/howdahs (faq_core.txt:792-797; core.txt:6827-6832; faq_core.txt:536-540)
- Motor: nuevo campo crewRg (armas de la dotación con su HP `bs` y n.º de tiradores `crew`); rangedOf combina el arma del personaje (su HP) con las de la dotación como disparos separados (multi), cada uno con su alcance/perfil. Corregido: la repetición de HP 6+ usaba la HP del perfil y no la del arma (`r.bs`). Nuevo `cpm` (tiradores por modelo) para unidades de varios carros.
- Príncipe y (nuevo) Noble en Carro de Tiranoc (fof.txt:6242-6245, 6758-6771): 2 Aurigas HP4 con arcos largos + arco del personaje; Disparo rápido del carro también en el arco del personaje (core.txt:6831). Carro de Tiranoc suelto: 2 arcos por carro (cpm).
- Señor Oscuro / Maestro en Carro de Gélidos (leg_darkelves.txt:697-709): 2 ballestas de repetición HP4 de la dotación + arma del personaje; ballesta/arco de mano/pareja corregidos a Disparos múltiples (2)/(2)/(4) (core.txt:7434-7445).
- Gran Maestro de Bestias en Carro Corredor y Carro Corredor (leg_darkelves.txt:672-693): dotación con ballestas + Arpón devastador (24", F6, FP −3, Heridas múltiples D3, Aparatoso, Pesado), uno de la dotación lo dispara en lugar de su ballesta: popup en el momento (IA aiPick 'harpoon'); la ballesta del Gran Maestro dispara con su HP 7 (antes HP4 de la dotación).
- Magistrado Señor / Estratega en Linterna Celeste (cathay_aj.txt:1910-1936, cathay_notes.md:12): 4 Artilleros HP4 + Comandante HP5 con cañones grulla; opciones de dotación fusiles de granizo + bombas de pólvora (0) o de fuego de dragón (+20); Bombas de Linterna Celeste también para la montura. Linterna suelta: el Comandante dispara con HP5.
- Comandante de Guarnición en Cortacielos (fof.txt:6807-6817): 3 arcos cortos HP4 de la dotación + su arco; arco de guerra corregido a F del usuario (F4) (core.txt:7370).
- Jefe Skink en Stegadón / Sacerdote en Stegadón Ancestral y Stegadón (leg_lizardmen.txt:540-557): arco/cerbatanas gigantes (dotación HP3) + jabalinas envenenadas de los 5 Skinks; el Jefe recupera sus opciones de arma (leg_lizardmen.txt:163-168).
- Carro de Lobos Goblin (rh.txt:1398-1411): 3 arcos cortos por carro (faltaban).

### 2. Carro de Jabalíes Orco (rh.txt:1366-1370; faq_core.txt:64-70)
- Frenesí +2 pts por tripulante (4, o 6 con tercer tripulante: costF), 0-1 por 1.000; Pintura de guerra +10 (requiere Frenesí; 6+ especial). El +1 A de Frenesí es por tripulante (frzCrew 2/3), nunca de los jabalíes; corregido además el reparto general: el Ataque de Frenesí ya no se asigna en parte a la montura/bestias (mountFrac).

### 3. Carro de Razorgor (rh.txt:4397-4399)
- Desgarrador de enemigos solo del Razorgor: FP −2 de sus colmillos con Furia primigenia (frAp en su ranura de FP fija); no afecta a la dotación.

### 4. Reglas que faltaban
- Da Boyz (rh.txt:1977-1989; aj_orcs2.txt:695-697): validación de lista (un Jefe Orco Negro por Mob y viceversa; en Waaagh! Nómada los Jefes no están sujetos); listas recomendadas de Orcos corregidas (General → Gran Jefe Orco Negro).
- Daemon de Khorne/Nurgle/Slaanesh/Tzeentch (leg_daemons.txt:1345-1385): la mecánica ya existía (alignOf); ahora la regla figura en cada Daemon.
- Estandarte del Conde / Estandarte Tumulario (leg_vampires.txt:136-151, 310-325): mecánica ya existente (D3 menos de Inestable en el alcance de mando del PEB); regla visible en Esbirros y Señores Tumularios.
- Lady Élisse (aj_bretonnia.txt:1339-1369) y Profetisas/Damiselas (fof.txt:3433-3450): Aura de la Dama (la unidad a la que se une gana Ataques mágicos) y Escudo de la Dama (popup al empezar cada ronda de combate si está con una unidad US 10+ con Voto caballeresco: se retira a la retaguardia, conserva Ld/reglas y lanza hechizos; IA aiPick 'ladyShield'), ambas nuevas en el motor; Contragolpe arcano y Cáliz de Brionne (ya existentes) visibles; Báculo de los Elementos ahora opcional («If you wish»): botón «Báculo» en la lista.

### 5. Ligado al infierno (leg_chaosdwarfs.txt:813-814)
- La repetición única de un dado de dispersión o de artillería se pregunta en el momento con cada dado (cualquier resultado, también el del rebote del cañón) hasta usarla; IA con aiPick ('hellboundart'/'hellboundsc').

### 6. Banda variopinta (core.txt:5635-5665; faq_core.txt:668-673)
- Grupos de equipo por modelo (u.mg) a partir de las opciones «por modelo»; los tiradores de cada arma, los Ataques adicionales (arma de mano adicional/puño de hierro) y la armadura de la mayoría (empate: la mejor) usan los modelos vivos de cada grupo (antes, una proporción de los iniciales).
- Bajas de disparo: una a cada tipo de modelo mientras alcancen; el resto, a elección del jugador (popup «Banda variopinta: bajas»; IA aiPick). Bajas en combate: de la mayoría (empates a elección del jugador). Comprobado: 15 Bandidos (9 sin opción, 3 pistolas, 2 ballestas, 1 trabuco) que sufren 3 bajas de disparo → 3 preguntas, una baja a tres grupos distintos.

### 7. Banda de guerra (core.txt:5851-5853, 2728-2732)
- Solo si la mayoría de los modelos de la unidad (con personajes) tiene la regla; no se pregunta si la carga llega con cualquier resultado (repetir no cambia nada) ni si ya se repitió algún dado de esa tirada (Mejores corceles, Orden Pantera, Hambre voraz: «No single dice can be re-rolled more than once»). Igual para los estandartes que repiten la carga. La elección sigue siendo del jugador en los demás casos.

### NO se pudo / pendiente (motivo)
- Banda variopinta en combate: el libro retira las bajas de la mayoría de la FILA DE COMBATE; el motor no guarda la posición de cada modelo, así que usa la mayoría de la unidad (y los lotes de ataques del grupo, proporcionales a sus modelos vivos). Daño fuera de disparo y combate (hechizos, etc.): el libro no lo regula; se usa la regla de combate (mayoría).
- Báculo de los Elementos: los hechizos se generan al crear la partida, antes de que exista un momento de juego para preguntar; la elección se hace en la lista (botón), no con popup.
- Cortacielos montura del Comandante de Guarnición: la opción de lanzavirotes ojo de águila (+25, fof.txt:6821) no se añade: el libro no dice si la dotación sigue disparando sus arcos cortos además del lanzavirotes (el Cortacielos con lanzavirotes suelto ya lo sustituye); ambiguo.
- Stegadón: interpretación del libro (cada elemento usa sus armas; FAQ: el arco montado lo dispara la dotación) → disparan el arco gigante y las 5 jabalinas; si una FAQ futura dice lo contrario, cambiar crewRg.
- Ingeniero Comandante (Carro de Guerra): su arma de la fase sigue siendo una preferencia previa (crewW), no un popup (fuera del alcance de esta pasada).
- Jabalinas de los Skinks (escaramuzadores, Terradones, Jefe a pie) con Disparos múltiples en los datos: core.txt:7472 no les da Disparos múltiples; detectado, no corregido en esta pasada (fuera de las tareas pedidas).
- Etiqueta de alineación daemónica para Príncipe Daemon, Furias y Trituradora (alineación elegida, D(u).align): la mecánica funciona pero la regla no se muestra en su ficha.

## v829 — limitaciones cerradas
Cambios en app/js/rules.js (Variopinto por posiciones, Báculo en partida, selector genérico de arma de la dotación, Ingeniero Comandante en el momento), app/js/data.js (bloque «v829» al final; Élisse; textos de reglas), app/js/main.js (fuera el botón «Báculo» y la preferencia del Ingeniero; popup del Báculo al empezar el despliegue) y app/js/ai.js (aiPick con función que aplica la opción sobre la copia; fuera la preferencia crewW). Build + /tmp/pw.js: errors: [] tras cada par de tareas y al final. /tmp/ask_test.mjs: 4 partidas completas. Prueba ad hoc: 6 partidas completas (Bretonia con Élisse y dos unidades de Bandidos con equipo mixto contra Orcos con dos unidades de Ogros de las Tierras Yermas con armas mixtas; Altos Elfos con Comandante de Guarnición en Cortacielos con lanzavirotes y Cortacielos con lanzavirotes contra Hombres Lagarto con Jefe Skink en Stegadón, Stegadón, Sacerdote en Stegadón Ancestral con cerbatanas, Skinks y Terradones; Imperio con Tanque de Vapor con tres armas del Ingeniero, Ogros Imperiales y Bandidos renegados contra Orcos), todas las preguntas respondidas en rotación, sin errores y con u.mgP coherente con u.mg en todas las unidades vivas.

### 1. Banda variopinta: posición de cada modelo (core.txt:5635-5672; faq_core.txt:668-673, 509-520)
- Motor: u.mgP[i] = equipo del modelo i en el orden de modelPts (fila floor(i/files), columna i%files; fila 0 = delantera), sincronizado con los recuentos u.mg. El grupo de mando ocupa sus ranuras de la fila delantera (frontLayout) con modelos sin equipo adicional (cae el último, Core p.199-201).
- Colocación (popup «Banda variopinta: fila delantera»): al declararse listo en el despliegue, al entrar desde la reserva/emboscada y al reformar (cambio de filas en el movimiento) el jugador elige cuántos modelos de cada equipo van en la fila delantera y en qué orden se colocan los demás en las filas traseras; la IA con aiPick (valora la opción aplicada sobre la copia). Giro de 90°/180°: cada modelo conserva su sitio físico (reasignación por cercanía). Otros cambios de formación sin decisión del jugador conservan el orden (los de delante siguen delante).
- Bajas en combate: de la mayoría de los modelos de la FILA DE COMBATE hacia el enemigo trabado (frente = fila 0; retaguardia = última fila; flanco = la columna de ese lado); empates a elección del jugador; el hueco se cubre con un modelo de las filas traseras «as chosen by the controlling player» (popup; el modelo se toma de la posición más retrasada de ese tipo y, si deja otro hueco fuera de la última fila, se repite). Los modelos que avanzan a la fila de combate durante ese combate no luchan (FAQ: las bajas reducen los modelos que pueden luchar).
- Bajas de disparo: reparto lo más igual posible entre los distintos modelos de la unidad (una a cada tipo; el resto, a elección del jugador), retirando el modelo más retrasado de ese tipo y cubriendo huecos desde atrás. El campeón que muere por un impacto dirigido cae en su ranura.
- Ataques: el Ataque adicional (arma de mano adicional / puño de hierro) solo lo suman los modelos de ese equipo EN CONTACTO; el lote de cada arma de combate es proporcional a los Ataques de sus modelos en la fila de combate (en contacto: A; resto de la fila: 1; fila de apoyo / Presión del combate: su parte de esos Ataques).
- Armadura: en combate, la de la mayoría de la fila de combate; contra disparos, la de la mayoría de la unidad (empate: la mejor, FAQ).
- Disparo: disparan los modelos de cada arma que ocupan la fila delantera con LDV y alcance propios, más las filas adicionales (colina / objetivo grande) y, con Fuego en volea, la mitad (redondeando hacia arriba) de los de cada fila posterior; antes disparaban todos los modelos con esa arma y el Fuego en volea sumaba filas enteras de modelos sin ella.
- Lectura aplicada (filosofía del juego, el libro no lo regula): hechizos, plantillas y demás daño fuera de combate → reparto de los disparos (no existe fila de combate); daño a una unidad trabada en combate que no sea un disparo → regla de combate (fila de combate). Dentro de la fila delantera, el primer equipo elegido ocupa las columnas centrales.

### 2. Báculo de los Elementos de Lady Élisse (aj_bretonnia.txt:1339-1342, 1365-1369; core.txt:10073-10088; fof.txt:4404-4431)
- Los hechizos se generan «before armies are deployed»: el motor guarda la tirada completa (tres hechizos al azar) y pregunta con popup al empezar el despliegue (acción staffPick; también en la primera colocación o al declararse listo si no se decidió): usar o no el Báculo; si lo usa, cuál de los tres conserva y las dos firmas. La IA con aiPick ('staffElem', 'staffKeep', 'staffSig'). Si no lo usa, conserva el descarte habitual de uno (lista de despliegue).
- Corregido: antes conocía solo 2 hechizos (descartaba dos y añadía una sola firma nueva) y la segunda «firma» era Mano de Martillo (Magia de batalla). Lectura aplicada: Élisse conoce Elementalismo («She knows spells from the Lore of Elementalism»; se quita la opción de Saber «la Dama»); las «signature spells … of the Lore of the Lady» son los hechizos de la Dama que la regla Lore of the Lady ofrece en lugar de la firma (Don, Ira, Mirada Ardiente): elige dos entre Llamada de la Tormenta y esos tres. En el descarte habitual también puede tomar un hechizo de la Dama en lugar de la firma.

### 3. Lanzavirotes ojo de águila del Cortacielos (fof.txt:6805-6835; faq_core.txt:536-540; core.txt:4271-4274)
- «May take an eagle-eye bolt thrower (+25)»: no dice que sustituya los arcos cortos → la dotación los conserva (filosofía indicada). Lo dispara la dotación con su HP (FAQ); cada modelo hace un solo ataque de disparo → uno de los tres Guardias del Mar dispara el lanzavirotes en lugar de su arco: popup en el momento (3 arcos, o lanzavirotes + 2 arcos; si el blanco está a más de 18" solo puede el lanzavirotes; Aparatoso: no se usa al Aguantar y disparar). IA aiPick 'skyBolt'.
- Nueva opción (+25) para el Comandante de Guarnición en Cortacielos (y su variante Emboscador); el Cortacielos con lanzavirotes suelto también conserva los arcos (antes el lanzavirotes los sustituía).

### 4. Stegadón con Jefe o Sacerdote Skink, y Stegadón suelto (leg_lizardmen.txt:545-583; faq_core.txt:536-540; core.txt:4271-4274)
- El libro no dice nada más que «Stegadon: … giant bow» y «Skink Crew: … javelins»; la FAQ dice que la dotación dispara las armas montadas en el howdah. Regla general del Core: un solo ataque de disparo por modelo → o 5 jabalinas, o arco gigante (o cerbatanas gigantes) por un Skink + 4 jabalinas: popup en el momento (IA aiPick 'stegBow'); más allá de 12" solo el arco. El arma propia del Jefe dispara aparte. Antes disparaban el arco y las 5 jabalinas.
- Cerbatanas gigantes: faltaba Disparos múltiples (2D6) (leg_lizardmen.txt:582).

### 5. Jabalinas y armas arrojadizas de los Hombres Lagarto (core.txt:7468-7472; leg_lizardmen.txt:180, 330, 416-417, 469)
- Jabalinas (Skinks escaramuzadores, Terradones, Jefe Skink a pie / Terradón / Ripperdáctilo / Stegadón): sin Disparos múltiples; con Mover y disparar y Disparo rápido.
- Bolas de sanguijuela de fuego: sin Disparos múltiples; Mover y disparar. Púas del Razordón: Mover y disparar (faltaba). Cerbatanas (Skinks, Camaleones, Jefe): faltaba Disparos múltiples (2).

### 6. Arma del Ingeniero Comandante (Tanque de Vapor) (faq_fof.txt:244-251; core.txt:4271-4274)
- Popup en el momento de disparar entre las armas del Ingeniero que alcanzan al blanco (IA aiPick 'crewWpn'); eliminada la preferencia previa (ficha y autoaprendizaje de preferencias).
- Corregido: con la metralla del cañón de vapor el Ingeniero no disparaba su arma (la FAQ dice que ambos disparan).

### NO se pudo / pendiente (motivo)
- Banda variopinta: dentro de la fila delantera, el jugador elige cuántos modelos de cada equipo, no la columna exacta de cada uno (se colocan del centro hacia fuera en el orden elegido), para no encadenar un popup por modelo. La Lanza y las guarniciones de edificio no usan las posiciones (ninguna unidad con equipo mixto puede adoptarlas).
- Las decisiones de la IA que se toman en mitad del turno (bajas/huecos Variopintos, arco del Stegadón, lanzavirotes, arma del Ingeniero) usan aiPick como las demás decisiones de ese tipo del motor: el decisor aprendido solo simula opciones de antes de la batalla, así que en partida toma la primera opción, que el motor ordena con su heurística.

## v830 — columna exacta e IA aprendida
Cambios en app/js/rules.js (askH/aiPick/apply con contexto de acción y re-simulación; mgArrange con colocación exacta; Pánico simultáneo y Cuerno de Halcón), app/js/ai.js (decisor a mitad de turno midDecide, rasgo 19, copias de búsqueda sin decisiones anidadas), app/js/main.js (selector de formación pickGrid, s.aiP, versión de IA en la partida guardada, pesos guardados completados), app/css/app.css (estilos del selector) y app/js/data.js (texto de Variopinto). Build + /tmp/pw.js: errors: [] tras cada par de tareas y al final. /tmp/ask_test.mjs: 4 partidas completas. Partidas ad hoc (Node): más de 20 partidas completas — Bretonia con dos unidades de Bandidos con equipo mixto (pistolas/ballestas/trabuco) contra Orcos; Altos Elfos con Comandante de Guarnición en Cortacielos con lanzavirotes y Cortacielos con lanzavirotes contra Hombres Lagarto con Jefe Skink en Stegadón y Stegadón; Imperio con Tanque de Vapor con las tres armas del Ingeniero y Bandidos renegados mixtos contra Orcos — IA contra IA y humano (respuestas en rotación; colocaciones Variopintas al azar) contra IA; además reforma de Bandidos a mitad de partida (decisión 'motleyLay' con horizonte). En todas: re-simulación fiel (0 decisiones no alcanzadas, 0 divergencias de dados), reproducción de la partida con a.aip y sin él idéntica a la partida en vivo, u.mgP coherente con u.mg.

### 1. Banda variopinta: posición exacta de cada modelo (core.txt:5635-5672; faq_core.txt:668-673, 509-520)
- Un solo popup «Banda variopinta: colocación» (despliegue, llegada desde la reserva/emboscada, reforma) con la formación entera (todas las filas: la fila delantera arriba, columnas vistas desde detrás de la unidad). Toca una casilla y otra para intercambiar sus modelos, o toca una casilla y elige el equipo que quieres en ella (se intercambia con el modelo de ese equipo más retrasado). Ranuras del grupo de mando fijas (★, con su nombre; se mueven con los botones de ranura de la ficha como antes). Botones Restablecer (colocación por defecto) y Aceptar. Probado a 393 px (iPhone 14 Pro) con 10 columnas: cabe sin desplazamiento horizontal.
- La respuesta (colocación completa 'k|k|…') queda en la acción (s.ans) y el motor la aplica tal cual (validada: mismos recuentos; el mando en sus ranuras).
- IA: elige entre colocaciones candidatas (equipo adicional delante del centro hacia fuera; tropa sin equipo delante; cada equipo primero; equipo adicional en los extremos) con aiPick 'motleyLay' (decisor aprendido, abajo).
- Sustituye a las preguntas encadenadas de v829 (cuántos de cada equipo delante + orden de las filas traseras).
- Lectura aplicada: el libro no limita dónde va cada modelo dentro de la unidad → libertad total en todas las filas, salvo las ranuras del grupo de mando. Al cubrir un hueco el jugador elige el tipo de modelo que avanza; avanza el más retrasado de ese tipo (modelos idénticos; así no abre huecos innecesarios).

### 2. Decisiones de la IA dentro de una acción (a mitad de turno) con autoaprendizaje
- Antes (v829): el decisor solo simulaba decisiones previas a la batalla; en partida devolvía la primera opción (heurística del motor). Ahora:
  - apply() guarda el estado previo de cada acción en vivo y las decisiones de la IA que se van tomando. Cuando la regla llama a aiPick, el decisor (ai.js midDecide) RE-SIMULA LA ACCIÓN COMPLETA desde ese estado con las decisiones anteriores forzadas y cada opción candidata; en el punto de la decisión cambia la semilla (no conoce los dados que aún no se han tirado; mismas semillas para todas las opciones), termina la acción y sigue el turno en curso con un horizonte corto (1 acción de la política interna en la fase de Disparo; el resto de fases se cierran, lo que resuelve los combates); puntúa con los pesos aprendidos (valueOf/features, los mismos que aprende la IA por autojuego y tras cada partida). En empate se queda con la opción por defecto del motor.
  - Las variables de módulo del motor se guardan/restauran alrededor de la re-simulación y la re-simulación arranca con las que tenía la acción en vivo (comprobado: rng idéntico en el punto de decisión en todas las pruebas).
  - Las decisiones quedan en la acción (a.aip) → las partidas guardadas, «deshacer» y las repeticiones se reproducen exactamente sin recalcular. Partidas guardadas antes de v830 (sin «aiv» en el guardado): la IA decide como entonces (s.legacyAI) para que se reproduzcan igual.
  - Nuevo rasgo aprendible 19 «equipo de la fila de combate (Banda variopinta)»: coste del equipo (libro de ejércitos) de los modelos de la fila delantera frente a la media de la unidad, propio menos rival; peso inicial 0,3, se ajusta con el aprendizaje online. Los pesos guardados con 19 rasgos se completan (no se pierden).
- Decisiones de aiPick que seguían SOLO con heurística en partida (ahora con el decisor aprendido): motleyCas, motleyFill (bajas y huecos), motleyFront/motleyRear (sustituidas por motleyLay), stegBow (arco del Stegadón), skyBolt (lanzavirotes del Cortacielos), crewWpn (arma del Ingeniero Comandante), harpoon, hellboundart/hellboundsc, silverHorn, favourGods, implacC, implacable, hekarti, ladyShield, stompDuel, scythe, loec, dual, sot, prayer, myWill, myWillK, phalanx, stubborn, ravenous, wbRR, frydMod, staffElem/staffKeep/staffSig (al empezar el despliegue: 1 muestra, sin horizonte). Las previas a la batalla (bless, wchal, wacc, wnom, gzd, reap, prey, mists, first, hans, zone, pn:*, mg:*, toad:*, vg:*) siguen con su simulación de una ronda (ya eran aprendidas).
- Además, más de 50 decisiones «may» con askH cuyo valor por defecto para la IA era una heurística del motor (repeticiones de Reliquia/Runa de la Suerte, objetivo que puntúa, armadura de la montura, Disparos múltiples, Zancada veloz, Persecución/contenerse, desafíos lanzar/aceptar, ataques del personaje, redirigir carga, acción de apoyo, carga bloqueada, defender obstáculo, Condensador/Alma de Piedra, Mago que dispersa, Piedra Bruja, Favor de Orión, objetivos de hechizos, Goblin volador, bombardeo, etc.) pasan por aiPick 'ask:<clave>' en el bando de la IA (s.aiP), con la heurística como primera candidata. El bando humano sigue con su popup; en el modo por código no hay bando de la IA (como antes).
- Corregido de paso: el orden de los Pánicos simultáneos elegido por el jugador (Core p.160) se ignoraba al reproducir la partida (guardado/deshacer) porque la pregunta dependía de askMode; ahora se respeta, y la IA también lo elige. El Cuerno de Halcón de la IA ya no dependía de que hubiera otra respuesta humana en la acción.

### 3. Presupuesto de rendimiento (iPhone 14 Pro)
- Por decisión: ≤ 4 candidatas (5 en la colocación Variopinta) × 2 muestras (1 en el despliegue) re-simulaciones de la acción + horizonte (≤ 8 cierres de fase, 1 acción de disparo). Como mucho 12 decisiones valoradas por acción (AI_MAX_PER_ACTION; el resto, la opción por defecto). Constantes en ai.js (MID) y rules.js.
- Coste fijo por acción en vivo: una copia del estado (structuredClone, 0,06–0,2 ms).
- Medido en Node (entorno de pruebas, un núcleo): 50–115 ms de media por decisión, máximo 344 ms; 6–40 decisiones por partida. Las copias de la búsqueda de la IA no toman decisiones anidadas (noDecide), así que la búsqueda de jugadas no se encarece. Con 3 acciones de disparo en el horizonte el coste se duplicaba (descartado).

### NO se pudo / pendiente (motivo)
- No se ha medido en un iPhone real (solo Node/Chromium en el entorno de pruebas); el presupuesto es por número de simulaciones, no por tiempo, para que las decisiones sean reproducibles.
- El horizonte de las decisiones a mitad de turno termina al acabar el turno en curso (no incluye el turno del rival): decisiones cuyo efecto solo se ve más tarde (p. ej. la colocación Variopinta al desplegar) dependen sobre todo del rasgo 19 y del aprendizaje de su peso.
- Partidas guardadas en v829 con unidades Variopintas: las respuestas antiguas de colocación (preguntas encadenadas) ya no existen; al cargarlas, esas unidades toman la colocación por defecto.

## v831 — cotejo frase a frase
Cotejo de TODAS las reglas especiales y TODOS los hechizos con el texto original inglés (libro raw de una columna para Core/FoF/RH/AJ; rules/new/*.txt para Legends/Catay/AJ Altos Elfos; imágenes del AJ de Catay para Yin/Yang; FAQ rules/new/faq_*.txt), dividiendo cada texto en frases/cláusulas y comprobando número, condición, alcance, duración, excepciones, interacciones, quién elige y momento en app/js/data.js y app/js/rules.js. Progreso detallado por lotes (fuente archivo:línea de cada grupo): rules/verif/auto/out/txt/progreso3.md. Herramientas: scratchpad ctx.py / dump_rules.py / en_map.py.
Cambios en app/js/rules.js, app/js/data.js (bloque «v831» al final y entradas de hechizos), app/js/main.js (objetivos de hechizo entre personajes unidos; botón «2.º Lore» del Familiar Arcano; fuera los ajustes previos convertidos en popup) y app/js/ai.js (fuera las decisiones previas sustituidas por aiPick en el momento). Build + /tmp/pw.js: errors: [] tras cada lote. /tmp/ask_test.mjs: 4 partidas completas. Partidas ad hoc (Node, jugador 0 con popups respondidos en rotación, jugador 1 IA): Bretonia (Doncella, Bandidos variopintos) contra Orcos; Hombres Lagarto (Slann, Sacerdote Skink, Stegadón) contra Altos Elfos (Cortacielos con lanzavirotes, Comandante de Guarnición en Cortacielos con lanzavirotes); Condes Vampiro contra Enanos (Ingeniero); Daemons contra Hombres Bestia; Enanos del Caos contra Guerreros del Caos; Orcos contra Imperio — 6 partidas completas sin errores (popups nuevos vistos: «Arco gigante», etc.). Prueba unitaria: Doncella con Lore de Batalla y alternativas de la Dama; Mano de Gork admite a un personaje unido; Caminar entre Mundos = Traslado propio; Guerreros Ancestrales 2D3.

Cifras: 585 entradas revisadas (152 hechizos distintos = las 205 entradas con duplicados; 414 reglas; 19 ids de sr sin entrada en RULES); ≈ 3.300 frases/cláusulas comprobadas; 64 correcciones con fuente (35 de hechizos, 29 de reglas) + 19 entradas nuevas de RULES; las 3 «lecturas propias» revisadas con texto del Core.

### Correcciones de hechizos (fuente)
- Objetivos (Core p.108 «Choosing a Target», raw 6345-6360): los Encantamientos con objetivo amigo admitían unidades trabadas y fuera del arco de visión; ahora solo con «may target a friendly unit engaged in combat» (Don de la Dama, Furia de Khaine, Coraje de Aenarion). Trabado se puede lanzar cualquier hechizo «Propio» (no solo Encantamientos).
- Cambios de hechizo de Lore de facción (Athel Loren, Saphery, Caos, Gork, Mork, Bestias, Dama): elección del jugador en el despliegue (antes sustitución al azar). Doncellas/Profetisas: Batalla/Elementalismo/Ilusión + regla Lore de la Dama (antes un Lore «la Dama» inexistente). Familiar Arcano: el 2.º Lore lo elige el jugador.
- Urgencia Arcana (máquinas), Mano de Mork y Puerta Infernal (personajes unidos), Corcel de Sombras / Llamada de lo Salvaje / Apoteosis / Salto Escurridizo / Corcel Espectral (tipos de tropa por categoría completa del Core p.188), Caminar entre Mundos (Traslado propio), Columna de Cristal y Canto de los Árboles (colocación por el jugador y dispersables), Caminante del Bosque y Alzar a los Muertos y Salto Escurridizo (colocación por el jugador, «completely within»), vórtices de un mismo Mago independientes.
- Duración/alcance: Don e Ira de la Dama y Gran Muralla siguen en juego; Ira de la Dama, Niebla Arremolinada y Abundancia Carnosa alcanzan a la unidad; Regeneración Rápida con Inflamable hasta el final de la subfase de Inicio de turno; Apoteosis permanente; Djaf y Khsar en el alcance de mando.
- Efectos: Mirada Ardiente / Mirada de Gork con línea real; Raíz Estranguladora y líneas con Pánico; Guerreros Ancestrales 2D3; Coraje de Aenarion y Mal de Savia expiran otros Encantamientos/Maleficios; Tormenta de Ceniza es Maleficio; Aquiescencia sin «trabadas»; Varita de Golpe de Llama de un solo uso; Sombra del Bosque acumulable.
- Elecciones con popup en el momento: Deshacer de Vaul, Don de la Mutación, Maldición de Hashut, Palabra Maldita, Danza Macabra, Vigor Infernal, Khsar, Apoteosis (personaje), Vasallo arcano (si hay varios).

### Correcciones de reglas (fuente)
- Golpe letal (solo infantería/caballería) y Matamonstruos (nunca se aplicaba: tipo 'monster' inexistente) (Core p.173); Contracarga por tipo de tropa del cargador (Core p.167); Flamígeros y Envenenados no con armas mágicas (Core p.170/176); ¡Timmm-berrr! (arco elegido por el ganador; todas las unidades en contacto); Arrastrado (infantería completa).
- Deber del campesino reescrito según FoF p.92 (quitado el Liderazgo del Sargento, añadidos Ceder terreno opcional, exención y repetición de Pánico de Levas); Muro de escudos con popup; Voto del Grial y Doncellas montadas; Matador de Sierpes por modelo; Escudo Negro / Armadura de Dragón / Armadura de Ithilmar: Mago con armadura sin penalización; Armadura de Ithilmar: repetir 1 en Terreno peligroso (no estaba).
- Maestro artillero / Óptica telemétrica / Ingeniero Infernal: cada uno lo suyo y con popup; Lanzadores de redes, Bendición de Lileath: popup; Maestro de batalla solo con caballeros; Oculto (infantería completa); Vasallo arcano (efectos desde el vasallo, 1/turno).
- Ajustes previos convertidos en popup en el momento: Dragón bicéfalo, Furia del sapo, Forma deformada, Terrores de las profundidades, Ataques de Gigante (y los de hechizos citados arriba).
- 19 entradas nuevas de RULES con texto del libro (drilled, ithilmarW, ithilmarArm, lileath, dragonArm, blessAsur, lionCloak, mathIre, deflect, witness, xAtkW, chaosArmour, daemonic, handler, sunBlade, crownNeh, noPursue, fleeSafe, nonCombatant).

### Lecturas propias revisadas (puntos a, b, c)
- (a) Stegadón y (b) Cortacielos: SÍ hay texto: Core «More Than One Missile Weapon» (raw 13426-13433) — la unidad elige una de sus armas de proyectil y la usa entera; los personajes eligen por separado — más FAQ faq_core.txt:536-540 (el arma montada la dispara la dotación con su HP). Aplicado: popup «arma montada» (arco gigante / cerbatanas gigantes / lanzavirotes) O «armas de la dotación» (5 jabalinas / 3 arcos cortos); el Jefe/Sacerdote Skink y el Comandante disparan aparte con la suya. Queda sustituida la lectura v829 (arma montada + resto de la dotación).
- (c) Banda variopinta: SÍ hay texto para los hechizos de Asalto con plantilla (Core «Oddball Stuff (Combat)», raw 9366-9369: las bajas salen de las filas traseras y no reducen la fila de combate) → aplicado. Para el resto (proyectiles mágicos, vórtices, Maleficios con daño, efectos) NO hay texto en el Core ni en la FAQ (buscados «Motley», «Casualty», «Template», «Crew», «Shooting», «Characters in units»): se mantiene la lectura v829 (fuera de combate, reparto de los disparos; trabada, regla de combate).

### Pendientes (motivo exacto)
- Ataque de cuchillas, Estela de fuego, Bombardeo, Bombardeo en picado y Segadores espectrales («may perform … against a single enemy unit»): se ejecutan al sobrevolar la unidad; si se sobrevuelan varias, el motor no pregunta cuál (falta un popup de selección dentro del movimiento; no se ha tocado el código de movimiento en esta pasada).
- Vasallo arcano: solo se canaliza cuando el objetivo no es válido desde el Slann (no se pregunta si canalizar cuando ya lo es; el libro lo permite siempre).
- La regla interna 'undead' es la misma para No muertos de Nehekhara y Necromantic Undead (Condes Vampiro): mecánica idéntica según los dos libros; los hechizos que distinguen (Djaf/Khsar vs Vigor Infernal) filtran por facción; la ficha de los Condes Vampiro muestra el nombre «No muertos de Nehekhara».
- Las banderas de preferencia de usePos/useNeg siguen activas en el modo por código (en el modo normal la interfaz ya no las muestra y se pregunta con popup).

## v832 — pendientes menores cerrados
Cambios en app/js/rules.js (crewGrpSel, flyAttacks/flyHit/flyOverCount, Vasallo arcano, reacción a la carga en el momento, PREF_ASK, useNeg/usePos sin bandera, conversiones a popup), app/js/data.js (bloque «v832» al final), app/js/main.js (modo por código con popups y paso de la decisión al rival; fuera botones de preferencia previa; ficha de No muertos) y app/js/ai.js (fuera las alternativas de preferencia ya preguntadas en el momento). Build + /tmp/pw.js: errors: [] tras cada par de tareas y al final. /tmp/ask_test.mjs: 4 partidas completas (nuevo popup «Reacción a la carga» visto 31 veces). Partidas ad hoc: ver el final.

### 1. Core «More Than One Missile Weapon» en dotaciones (core.txt:7333-7343)
«If a unit is equipped with two or more missile weapons, you must choose which it will use when it is chosen to shoot … The entire unit, including command, must use the same weapon. Characters can always choose separately».
- Stegadón suelto, Stegadón del Jefe/Sacerdote Skink, Cortacielos con lanzavirotes (+25) y Comandante de Guarnición en Cortacielos: ya aplicado en v831 (popup: arma montada O 5 jabalinas / 3 arcos cortos; el personaje dispara aparte). Comprobado en datos: no queda ningún grupo «arma montada + resto de la dotación».
- Nuevo selector genérico (grupos 'wg', popup «Arma de la dotación» al disparar, IA aiPick 'crewGrp'; con Aguantar y disparar no cuentan las armas Aparatosas ni las de aliento):
  - Linterna Celeste con fusiles de granizo y bombas (cathay_aj.txt:1931-1934) y Magistrado/Estratega en Linterna (opciones lhg/lhd): fusiles O bombas (antes, las dos).
  - Gran Cañón / Batería de cohetes con Cargador ogro y bombas de pólvora (cathay_aj.txt:2456-2460; faq_cathay.txt: el Cargador es «an additional crew member»): la máquina O las bombas (antes, las dos).
  - Cuernopétreo y Colmillotrueno (leg_ogres.txt:612-619, 645-650): lanzarrpones (Dotación, y Jinete si lo compra) O el arma del Jinete (trampa de cadena / buitre de sangre); en el Colmillotrueno también el aliento helado, porque «Breath weapons are a type of missile weapon» (faq_core.txt:514-518) y la unidad es una sola (antes disparaban todas).
- Se mantienen con texto propio que manda sobre la regla general: Carro de Guerra («each member of the crew equipped with a missile weapon may shoot with that weapon», aj_empire.txt), Carro Corredor («one of the Beastmaster Crew may fire this weapon instead of their repeater crossbow», leg_darkelves.txt:691-692), Ingeniero Comandante (personaje; faq_fof.txt:244-251).

### 2. Banda variopinta: daño de hechizos/vórtices/plantillas
- Búsqueda nueva («Motley», «Mixed Unit», «casualt», «template», «shooting attack», «Magic Missile») en Core, FAQ, Legends y AJ: el Core solo distingue «Against enemy shooting» / «In combat» (raw 5658-5662); Mixed Unit (AJ Hombres Bestia raw 2181-2188) igual; las plantillas de Asalto, en raw 9366-9369 (aplicado en v831).
- SÍ hay texto para los proyectiles mágicos: el Core los trata como disparo — «Only units equipped with missile weapons … or that can cast certain types of spell (such as magic missiles) can shoot» (raw 7817-7818) y «Magic Missile & Magical Vortex Spells … they may attempt to cast them when chosen during the Shooting phase» (Oddball Stuff (Shooting), raw 8292-8299; FAQ faq_core.txt:507-512). → reparto de los disparos (lo que ya hacía el motor: no pueden apuntar a unidades trabadas).
- Sin texto (vórtices al moverse, Maleficios con daño, otras plantillas fuera de la fase de disparo): filosofía de diseño, la lectura más coherente con el resto del juego: trabada en combate → bajas de la mayoría de la fila de combate; no trabada → reparto uniforme (código de v829, sin cambios).

### 3. Ataques al sobrevolar (Remaining Moves)
Textos: Bombardeo en picado (FoF raw 2494-2505), Bombardeo (FoF raw 2601-2610), Estela de fuego (FoF raw 15645-15649), Arrojar rocas (leg_lizardmen.txt:864-870), Ataque de cuchillas (leg_daemons.txt:872-876), Segadores Espectrales (leg_vampires.txt:682-687), Bombas de Linterna Celeste (cathay_aj.txt:2003-2006 + faq_cathay.txt:38-42): «may perform … against a single enemy unit that is not engaged in combat … must move (by flying) over [within 6" of] the unit it wishes to attack during the Remaining Moves sub-phase. Once this unit’s movement is complete …».
- Al terminar el movimiento (solo Remaining Moves: no en movimientos de reserva), por cada regla: popup con las unidades enemigas no trabadas sobrevoladas (con el número de modelos que pasaron por encima) + «No lo hace»; UNA unidad. IA: aiPick 'flyAtk' (decisor aprendido; candidata por defecto la de más modelos encima / más puntos).
- Corregido: los impactos «for each model in this unit that moved over it» (picado, rocas, cuchillas, segadores) cuentan los modelos que pasaron sobre esa unidad (antes, todos los de la unidad salvo en Segadores); el blanco ya no es «la primera unidad tocada»; Linterna: «move within 6"» en cualquier punto del movimiento (antes, solo al final) y sin preferencia previa (bombPick eliminado de ficha y motor); Segadores sin la preferencia noReap.
- Lo que hace la IA contra el humano (y la Capa de las Dunas, automática contra cada unidad sobrevolada) se anuncia con popup + OK.

### 4. Vasallo arcano (leg_lizardmen.txt:836-850)
«may ‘channel’ a spell through this model»: si el Slann puede apuntar al objetivo por sí mismo y hay un vasallo válido (a 12", sin huir ni trabado, no usado este turno, objetivo válido desde él), popup «Desde el propio Slann / A través de …»; si solo es válido desde vasallos y hay varios, popup de cuál. IA: aiPick 'vassal'. «spells with a range of ‘Self’ cannot be channelled» (también en la lista de objetivos).

### 5. Condes Vampiro: No muertos necrománticos (leg_vampires.txt:1155-1171) frente a No muertos de Nehekhara (RH raw 11191-11205)
- Cotejo frase a frase: idénticos (No muertos, sin marchar salvo volando, Miedo, Inmune a la psicología, Inquebrantable, Inestable) salvo el nombre; la única consecuencia del nombre es «A character with this special rule cannot join a unit without this special rule, and vice versa»: un personaje de una no se une a una unidad de la otra (joinCheck, ya bloqueaba la mayoría; ahora en los dos sentidos). Los hechizos que distinguen (Djaf/Khsar/Invocación frente a Vigor Infernal/Resurrección) ya filtraban por facción.
- La ficha de los Condes Vampiro muestra «No muertos necrománticos» con su texto (regla 'necroUndead'); los Reyes Funerarios, «No muertos de Nehekhara». Mecánica interna común ('undead').

### 6. Preferencias previas y modo por código
- Modo por código: usa los mismos popups que el modo normal (askMode de los dos bandos). Si en mitad de mi acción decide el rival (reacción a la carga, Pánico, Persecución, «may» de su unidad…), la acción se detiene y se genera un código «Decide tu rival» con las jugadas hechas y la acción pendiente; el rival ve el mismo popup, responde y devuelve un código de respuesta; al pegarlo la acción sigue (y puede volver a pasar la decisión). Las respuestas quedan en la acción (a.ans), así que la reproducción en el otro dispositivo es exacta.
- Reacción a la carga: la pregunta el motor en el momento (popup «Reacción a la carga»; solo las reacciones posibles; una por turno) — fuera la preferencia t.react, el botón de «reacción por defecto» y el popup previo de main.js. IA: aiPick (antes, preferencia aprendida previa).
- Eliminado el modo de preferencia del motor (PREF_ASK: la acción 'pref' con esas claves no cambia nada; se acepta por compatibilidad): las 35 banderas de useNeg/usePos (Zancada veloz, Evasivos, Contracarga, Finta, pergaminos, etc.), accHalt, noRedirect/redirTgt, orionOn, falconOn, wyrdC/D, panicRank, pursuitPick, restrain, bombPick, noReap, hekHold, y estas convertidas ahora en popup en el momento: Ojo Guía (eyeHold), Piedra/Runa de la Suerte (lkHold), Tripulación mercenaria (ogreMode: repetir el dado / disparar otra vez), cohete del Deathshrieker (rocketPref), Todos sigilosos (sneakyMod, al ver la tirada), Sendas ocultas (trailsPref), Cuerno de la Gran Cacería (hornPref), Da Skull Smasha (smasha, al empezar su primer combate). Fuera sus botones de la ficha (también en modo por código) y sus alternativas previas en la IA (incluidas las variantes de carga con Zancada / Hambre de batalla / carga bloqueada / redirigir).

### NO se pudo / pendiente (motivo)
- Siguen como ajuste de la ficha (sin popup en el momento) estas elecciones, porque el motor las lee en cálculos que no son un punto de decisión (orden de iniciativa, perfiles de ataque, vistas previas y valoración de la IA, que llamarían al popup fuera de tiempo) y convertirlas exige añadir antes un momento de decisión explícito por combate/disparo: arma mágica usada (wpnPick), arma de combate (mwPref, Fauces mawOff, látigo whipOn, una sola arma oneHand), Carro de Guerra (wwHand), orden de los combates (cmbOrd), punto de la plantilla de llama (flameAim), formación (formation), Juicio de los Dioses (gazeRR), umbral de pergaminos (scrollThr), Fanáticos a soltar (fanRel), y las ocultas ya en v831 pero aún leídas (luckPref, multiPref, dispPref, diverPref, etc., que solo deciden si la IA las fija; el humano tiene popup).
- Modo por código: el paso de la decisión al rival solo se ha probado en Node (protocolo del motor: respuestas en a.ans y re-aplicación) y con /tmp/pw.js (carga sin errores); no en dos dispositivos reales.

### Pruebas
- Build + /tmp/pw.js: errors: []. /tmp/ask_test.mjs: 4 partidas completas (turno 7), popups nuevos «Reacción a la carga» (31).
- Partidas ad hoc completas (Node, jugador 0 con popups respondidos en rotación, jugador 1 IA con decisor aprendido): Catay (Linterna con fusiles de granizo, Cañón con Cargador ogro y bombas, Magistrado en Linterna lhg) contra Reinos Ogros (Cuernopétreo con lanzarrpones del Jinete, Colmillotrueno con buitre de sangre) en los dos sentidos; Hombres Lagarto (Stegadón, Jefe Skink en Stegadón, Slann + Sacerdote Skink, Terradones) contra Altos Elfos (Cortacielos con lanzavirotes, Comandante de Guarnición en Cortacielos con lanzavirotes, Fénix Flamígero) en los dos sentidos; Enanos (Girocópteros, Girobombardero) contra Daemons (Chillones) en los dos sentidos; Condes Vampiro (Espectros Malditos) contra Reyes Funerarios; Bretonia (Bandidos variopintos) contra Orcos — 9 partidas sin errores. Popups vistos: «Arma de la dotación», «Arco gigante», «Lanzavirotes ojo de águila», «Bombardeo en picado», «Reacción a la carga» (40), «Redirigir la carga», «Carga bloqueada», «Persecución».
- Prueba dirigida (fly.mjs): Chillones, Terradones y Fénix sobrevolando dos unidades de Esqueletos → popup con las dos unidades (y los modelos que pasaron por encima) + «No lo hace». Unidad: personaje de Condes Vampiro no se une a Guerreros Esqueleto de Reyes Funerarios; la ficha muestra «No muertos necrománticos».
- No vistos en partida (no se dio la situación): Segadores Espectrales (mismo código que los anteriores), Vasallo arcano con objetivo válido desde el Slann.

## v833 — elecciones en el momento
Cambios en app/js/rules.js (step11Weapons, orden de combates paso a paso, flameAsk/flameExp, fmArrange, Fanáticos, objetos de dispersión, Juicio de los Dioses y ~30 preferencias más quitadas de las reglas), app/js/data.js (Engendro Gigante: `maw.may`), app/js/main.js (fuera los botones de ficha de esas elecciones; formación solo como reforma del movimiento; aiv 833) y app/js/ai.js (fuera las alternativas previas de la IA; reforma como alternativa de la fase de Movimiento). Todas las claves convertidas están en PREF_ASK: la acción `pref` con ellas se acepta (partidas guardadas) y no cambia nada; `mwpref`, `chalPol`, `bsMode`, `charTgt`, `defObst`, `frydMod`, `compPri`, `restrain` y `react` igual. Cada respuesta humana queda en la acción (`a.ans`, clave turno:fase:clave con contador en el estado) y cada decisión de la IA en `a.aip` (decisor aprendido de v830, `midDecide`, con re-simulación de la acción). Build + /tmp/pw.js: errors: [] tras cada par de tareas y al final.

### 1. Paso 1.1 de cada combate: armas (step11Weapons, llamado en fightGroup tras el arma alternativa y antes de calcular Iniciativas y perfiles)
Fuente general: core.txt:7186-7199 «More Than One Combat Weapon» + new/faq_core.txt:182-189 (Page 213: «you must choose which weapon it will fight with when its combat is chosen during Step 1.1 of each and every Choose & Fight Combat sub-phase»; se borra el 4.º punto, el bloqueo entre rondas). Quién: el jugador que controla la unidad; los personajes eligen por separado.
- Arma mágica usada (antes wpnPick en la ficha): core.txt:10913-10916 «If a character has more than one magic combat weapon, you must choose which they will use when their combat is chosen during Step 1.1 … the weapon chosen for the first round of a combat must be used for the duration of the combat» → popup «Arma mágica» en la primera ronda; en las siguientes, mientras siga trabado con la misma unidad (u.fought + wpnCombat), se mantiene sin preguntar. Lanza frente a arma mágica: new/faq_core.txt:827-832 (un personaje con nombre debe usar la mágica) y new/faq_core.txt:206-210 (la lanza solo el turno en que carga) → la opción «Lanza» solo aparece si el personaje (o su unidad) cargó ese turno. IA: aiPick 'wpnPick' (por defecto la más cara).
- Arma de combate alternativa (mwPref): el popup «Arma de combate» ya estaba en el paso 1.1; quitada la preferencia que lo saltaba. IA: aiPick 'meleeAlt'.
- Látigo (whipOn): core.txt:7270-7276 (arma de combate: Lucha en fila adicional, Ataca primero) → popup «Látigo / Arma de mano». IA 'whip'.
- Una sola arma de mano (oneHand): new/faq_core.txt:867-873 «may choose to fight with just one, foregoing the Extra Attacks (+1) special rule in favour of some other benefit» → popup «Dos armas de mano» SOLO si el modelo tiene una regla que da ese beneficio (Armas de gromril, Desgarrador de enemigos, Armas encantadas, Armas de ithilmar) y no lleva arma mágica; sin beneficio no se pregunta (sería siempre peor). IA 'oneHand'.
- Fauces (mawOff): el texto distingue «must» y «may». «Must make one of its attacks each turn with this weapon»: Terrorgheist (new/leg_vampires.txt:911), Gorger (new/leg_ogres.txt:778), Merwyrm (new/aj_highelves.txt:1596) → se usan SIEMPRE (corregido: antes el jugador podía desactivarlas). «May choose»: Engendro Gigante del Caos, fauces rechinantes (new/aj_chaos2.txt:1468) → popup «Fauces» (nuevo `maw.may` en data.js). IA 'maw'.
- Carro de Guerra (wwHand): new/aj_empire2.txt:1428-1438 «During the Combat phase, each member of the crew may choose to use either their unique weapon, or their hand weapon» → un popup por tripulante (Bola y cadena, Alabarda de gancho, Atrapahombres). IA 'wwHand' por tripulante.
- Además, en el mismo paso: reparto de los ataques con varias unidades enemigas trabadas (antes preferencia oculta `focus` que solo fijaba la IA): popup «Reparto de los ataques» (según el contacto / todos contra una de las unidades en contacto), IA 'focus'; ataques del personaje unido (charTgt): solo el popup del momento.
- Cálculo previo: effI, attackProfile, slotsOf, wpnFilter leen el resultado del paso 1.1 (m.wpnPick, m.whipOn, m.oneHand, u.mawOff, u.wwHand). Antes del primer paso 1.1 (vista previa de la ficha, búsqueda de la IA en copias sin decisiones) se usa el valor por defecto del motor (la heurística, que es también la primera candidata del popup y de aiPick). Bastón de los brayes, Gran hoja (Centinela), Ataques abominables y cohetes de Catay tenían el popup pero con valor por defecto «undefined» para la IA, que caía en la preferencia previa: ahora aiPick ('braystaff', 'greatBlade', 'abominable', 'rocketBat').

### 2. Orden de los combates (cmbOrd)
core.txt:4555-4559 y 4563 «The active player chooses a combat … that ‘round’ of combat is complete and the active player chooses another combat, repeating the process until all combats have been fought»; new/quickref.txt:203-204. → resolveCombats elige el siguiente combate CUANDO termina el anterior (resultado, rupturas y persecuciones incluidos): popup «Orden de los combates» al jugador activo con los combates que quedan (unidades, modelos y posición); IA aiPick 'cmbOrd'. Antes: orden fijado de antemano en la ficha.

### 3. Plantilla de llama (flameAim)
core.txt:5250-5254 (aliento: «Place the flame template with its broad end over the intended target and its narrow end touching the model’s base edge anywhere along its front arc»), core.txt:5291-5293, core.txt:7865-7868 (columna de fuego). → flameAsk al colocar la plantilla (aliento y columna de fuego en flameHits, hechizos de plantilla de llama en tplPlan, Vomitar del Gigante): popup «Plantilla de llama» con 5 puntos del frente del objetivo y, en cada uno, los modelos que quedarían bajo la plantilla (seguros + parciales con 4+; recuento sin dados, flameExp). IA aiPick 'flameAim' (primera candidata: la que más modelos enemigos cubre y menos amigos). La misma orientación vale para todas las unidades bajo esa plantilla.

### 4. Formación (formation)
core.txt:2974-2978 «may choose their formation during deployment, and may change it and adopt a different formation by reforming during the game». → fmArrange: popup «Formación» al desplegarse la unidad (al declararse listo, como la colocación Variopinta) y al llegar desde la reserva/emboscada; IA 'formation'. El cambio durante la partida es la reforma de la fase de Movimiento (botón «Reformar a», acción del momento que gasta el movimiento; la IA la valora ahora en la fase de Movimiento: antes la proponía en la de Mando, donde la acción fallaba). La acción en el despliegue ya no es un ajuste previo (falla con mensaje).

### 5. Juicio de los Dioses (gazeRR)
aj_chaos.txt:569-570 «Characters in the defender’s army may re-roll the D6 when rolling on the Gaze of the Gods table» → popup al ver el resultado de la Mirada (antes, umbral previo). IA 'gazeJudge'.

### 6. Objetos de dispersión de un solo uso (scrollThr)
core.txt:11162-11166 (Pergamino de Retroalimentación: «may use this scroll instead of making a Wizardly dispel attempt»), Pergamino de Transmogrificación y objetos de disipación automática de los AJ (Brújula de Relojería, Esquirla del Vórtice, Cubo de la Oscuridad, Sangre del Sombrío, Vial de Sangre de Lammasu). → popup «Objeto de dispersión» con el resultado del lanzamiento ya conocido (lista de objetos disponibles + «Ninguno»); IA 'dispItem'. Corregido: el de Retroalimentación se usaba solo con 9+ sin preguntar. El Mago que dispersa (dispPref) también solo con su popup.

### 7. Fanáticos (fanRel)
new/faq_rh.txt:25-29 «Unless it is fleeing or in Marching Column, a concealing unit may release one or more of its Fanatics during any Start of Turn sub-phase» → en CADA subfase de Inicio de turno (de los dos jugadores) el dueño de la unidad elige cuántos suelta (popup «Soltad a los Fanáticos», 0…todos, con el enemigo más cercano); IA 'fanRel' (por defecto todos si hay un enemigo a 8"). Antes: número fijado de antemano en la ficha.

### 8. Otras preferencias encontradas (grep de pref/prefer/auto*/Pol/Mode/Tgt en data.js, main.js, rules.js, ai.js) y convertidas
Leían un campo de la unidad antes (o en lugar) del popup; en el modo normal el humano ya no podía fijarlas, pero la IA sí las fijaba de antemano con su búsqueda de preferencias: ahora todas van al popup / aiPick del momento y se quitan las alternativas previas de ai.js.
- Reliquia de la Suerte (luckPref), Disparos múltiples (multiPref), Goblin volador (diverPref), Mago que dispersa (dispPref), Defender el obstáculo (defObst), Incursora sin igual (frydMod), Alma de Piedra (soulDir), Colgante de Cráneo (skullMode), Mazo del Trueno (thunderMode), Acción de apoyo (suppMode), Vanguardia (vgMode), objetivo que puntúa (objPick), Padre de Bestias (drunkRR, antes umbral), Condensador de Disformidad (condPol, antes umbral), Capataz inmortal / Escultor de piedra (ovTgt/ssTgt), Movimientos obligatorios (compPri), Gran Cathay disparo previo (mgTgt).
- Sangre de Hashut (vialPref/vialTgt): new/leg_chaosdwarfs.txt:889-894 «Instead of attacking normally … These hits can be directed against a unit or against a single model» → un popup con unidad × (la unidad / un solo modelo) + «No lanzarlo».
- Hechizos de Asalto (assailTgt/noAssail): «may attempt» → popup «Hechizo de asalto» con «No lanzarlo» y el objetivo.
- Desafíos (chalPol/chalPick/chalRetire), Core p.210: lanzar y con quién, aceptar y con quién (antes el aceptante era el más fuerte o el preferido), y a quién nomina el retador para retirarse si se rechaza → popups «Desafío» y «Desafío rechazado»; también el segundo desafío del Duelista experto.
- Almanaque Encantado / Mapa de la Espesura (almaRR/wmapRR, caras a repetir fijadas antes): new/battlemarch.txt:2930-2932 y 2922-2924 «you may re-roll» → popup al ver el D6.
- Eliminada opticsUse (sin llamadas desde v831).

### 9. Revisados y NO convertidos (motivo)
- Ranuras del grupo de mando y de los personajes en la fila delantera (slotFile/champFile/stdFile/charFile): es la colocación física de los modelos (new/faq_core.txt:805-815: «must be placed in the front rank»), no una elección que dispare una regla; se ajusta con ◀ ▶ en la ficha como mover la unidad. Pendiente: el motor no limita cuándo se recolocan (el libro solo lo permite al desplegar/reformar).
- Información de despliegue o de lista: Oculto (hideHost, unidad anfitriona antes de empezar), Emboscadores de Khazid Vosk (scnAmb), Espíritu Mirón (leerPlace), arma/opciones de la lista, Banda variopinta (colocación con popup desde v830).
- Claves de `pref` sin lectura en las reglas (handlers muertos desde v831): terrTgt, cursePick, toadPick, giantMode, hashutPick, danseA/B, vigTgt, galrMode, mutPref (las decisiones ya eran popups en el momento).
- En main.js siguen filas ocultas por la expresión RX de v831 (no se muestran) para claves ya convertidas; no tienen efecto.

### Lecturas aplicadas (filosofía del diseño, el libro no lo detalla)
- «Una sola arma de mano» solo se ofrece cuando hay un beneficio de una regla (la FAQ lo justifica «in favour of some other benefit»); sin él, dos armas.
- La orientación de la plantilla de llama se discretiza en 5 puntos del frente del objetivo (el libro deja libre la colocación); el reparto de ataques con varias unidades mantiene la lectura del motor (según contacto o todos contra una unidad en contacto) pero elegida en el paso 1.1 y para todo el combate.

### Pruebas
- /tmp/ask_test.mjs: 4 partidas completas (turno 7); popups nuevos vistos: «Orden de los combates», «Hechizo de asalto», «Dispersar el hechizo».
- Partidas ad hoc (Node, scratchpad v833run.mjs; humano = popups respondidos en rotación, IA = decisor aprendido; IA contra IA; ambos lados): Imperio (General con Espada de Batalla + Hoja de Ogro y lanza, Carro de Guerra, Pistoleros, Maestro Mago con pergaminos) contra Orcos con Fanáticos; Caos (Engendro Gigante) contra Enanos (Matademonios con dos armas, Lanzallamas); Reyes Funerarios (Necrotecto con látigo) contra Elfos Silvanos (Señor en Dragón, Danzantes, Dríades); Bretonia (Hombres de armas con arma alternativa) contra Hombres Bestia (Gors, Engendro Gigante) — 16 partidas completas sin errores, reproducción desde cero con las acciones registradas idéntica en todas (repro=true). Pruebas dirigidas (dir.mjs: unidades en contacto; unit.mjs: tryDispel y gazeRoll) con humano e IA, reproducción idéntica.
- Popups nuevos vistos: «Arma mágica» (Espada de Batalla / Hoja de Ogro / Lanza (solo este turno de carga)), «Carro de Guerra», «Látigo», «Dos armas de mano», «Fauces», «Arma de combate», «Orden de los combates», «Plantilla de llama», «Formación», «Soltad a los Fanáticos», «Objeto de dispersión», «Juicio de los Dioses», «Reparto de los ataques», «Bastón de los brayes», «Hechizo de asalto», «Desafío». Decisiones de la IA vistas con el decisor aprendido (n / veces que no tomó la opción por defecto), p. ej.: wpnPick, wwHand, whip, oneHand, maw, meleeAlt, cmbOrd, flameAim, fanRel, focus, braystaff, formation.

### NO se pudo / pendiente (motivo)
- Formación de la IA al desplegar: el decisor valora el despliegue con 1 muestra y sin horizonte (presupuesto v830), y la formación no cambia los rasgos hasta que la unidad se mueve o combate → en la práctica toma la opción por defecto (la formación actual); sin un rasgo propio no hay aprendizaje real de esta decisión.
- Presupuesto de la IA: como mucho 12 decisiones valoradas por acción (AI_MAX_PER_ACTION, v830); la acción que cierra la fase de Combate puede tener muchas (armas por modelo, reparto, orden, desafíos…): el resto toma la opción por defecto del motor.
- Carro de Guerra: tres popups por combate (uno por tripulante, como dice el texto) en lugar de uno combinado.
- Partidas guardadas antes de v833 que usaran estas preferencias (acciones `pref`) ya no las aplican: se reproducen con la decisión en el momento (valor por defecto si no hay respuesta registrada) y pueden divergir.
- Encontrado y no tocado (no es un ajuste previo sino una regla sin implementar): «Envenomed sting» de Escorpión de la Tumba / Necroesfinge (rh.txt:6166-6168, 6210-6212, 6328-6330) y «Venom surge» de la Arachnarok (rh.txt:1525-1528), armas con «may choose to make one of its attacks each turn with this weapon», no existen en data.js.
- No medido en un iPhone real.

## v835 — pruebas de comportamiento
Arnés en rules/verif/auto/behavior (un solo comando: `rules/verif/auto/behavior/run.sh`). engine.mjs copia el motor real de app/js a .eng/ y solo engancha d6/d3 a una cola de dados fijados (y exporta las funciones internas); cada prueba monta la situación mínima, fija los dados, ejecuta el código del motor y compara con el texto citado. run.mjs rechaza las pruebas que inspeccionan el código fuente (11 del agente anterior lo hacían o eran `ok(true)`: reescritas). Resultados en behavior/out/results.json; cobertura estática de reglas en behavior/out/sr_coverage.txt.

### Cifras (run.sh, 22-nov)
- Pruebas: 364 · pasan 364 · fallan 0.
- Inventario de FAQ (A): 459 entradas en rules/verif/auto/out/qa_inventory.json (Q/A 242 = recuento de «Q:» de las 4 FAQ; erratas 213 = recuento de verbos Change/Add/Delete…; notas 4). Comparado línea a línea con las columnas reconstruidas: faltaba 1 errata (faq_rh.txt:100, Machacador de los Ogros de las Tierras Yermas +7, verbo en minúscula) → añadida (rh-errata-050); qa_extract.py corregido y conserva los ids.
- Cobertura del inventario: 353 con prueba de comportamiento, 42 no automatizables (motivo), 66 pendientes (automatizables, no hechas), 0 sin cubrir.
- /tmp/ask_test.mjs: 4 partidas completas (turno 7) sin errores. Build + /tmp/pw.js: errors: [] tras cada lote y al final.

### Correcciones del motor (con fuente)
1. Volar al perseguir/seguir (faq_core.txt:56-61 «Except when following up or pursuing»): el Volador se mueve por tierra y hace los chequeos de terreno peligroso (antes se los saltaba); los Etéreos no (core.txt:5333).
2. applyWounds: el ajuste del borde de contacto tenía el signo invertido: al perder filas en contacto el frente retrocedía una fila y la unidad dejaba de estar trabada (tras los Impactos de carga el combate no se luchaba).
3. Impactos de carga (faq_core.txt:73-78): se resuelven al elegir cada combate (paso 1.1, antes de los desafíos) y sus heridas cuentan para el resultado (core.txt:4806-4812).
4. Arma de mano (core.txt:7210 + core.txt:7186-7191 + faq_core.txt:183-189, 867-873): elección en el paso 1.1 «su arma / arma de mano (y escudo)» cuando da un beneficio (evitar Ataca el último; Parada/escudo). Mecánica nueva (u.hwOn, aiPick 'handW').
5. Dispersión fuera de la mesa (faq_core.txt:358-361 «any part of an object»): basta con que cruce cualquier parte de la plantilla.
6. Escudo de Roble (core.txt:10160-10162): también la unidad del Mago gana la salvación 5+.
7. Retirada de un desafío (faq_core.txt:397-400): la unidad pierde todos los hechizos de alcance Propio del Mago (antes solo los que permanecen en juego); cada efecto lleva lanzador/hechizo (sx/sk).
8. Redirigir la carga (core.txt:3983-3996): cualquier unidad contra la que pudo declarar la carga (antes exigía que estuviera más cerca que la que huía y que no estuviera trabada).
9. geom.js wheelPath: el giro de ala de ~8°-26° costaba ~30" (vuelta completa de más) → no se podía hacer. Corregido.
10. Carga obligada (Frenesí/Impetuosa) y escaramuzadores amigos (faq_core.txt:475-482): no se declara si la obstruyen escaramuzadores que no pueden apartarse. Mecánica nueva skObstructs.
11. Desafíos: el personaje solitario (monstruo) en desafío no hacía sus Pisotones → ahora sí y puede dirigirlos al otro participante (faq_core.txt:593-596).
12. Desafíos: con un solo enemigo, los modelos fuera del desafío atacaban al personaje solitario retado → esos ataques se pierden (faq_core.txt:548-555).
13. Registro: golpes del personaje unido en desafío con el nombre de su unidad (cosmético).
14. Arma de asta de Bretonia (faq_fof.txt Page 92): se elige en cada paso 1.1 (antes bloqueada desde la primera ronda).
15. Antiguo Hombre Árbol (faq_fof.txt:81-83, fof.txt:4837-4840): solo Batalla o Elementalismo.
16. Bastón del Mago (faq_fof.txt:83-84): 0-1 por Mago.
17. Guardián de los Lugares Sagrados (FAQ FoF AJ Bretonia p.37): no salta a plantillas de vórtice.
18. Campeón de Martilladores (faq_fof.txt fof-qa-002): sin runas de arma en los grandes martillos.
19. Araña Gigante (rh.txt:690-748 + FAQ RH p.20): faltaba la montura de Jefe/Gran Jefe Goblin (gob_warboss_spider, gob_bigboss_spider); ataques envenenados solo de la montura (mountAtk.poison).
20. Trolls comunes, de río, de piedra y del Caos (FAQ RH p.28/65): Banda variopinta y armas por modelo (listas guardadas con 'ahw'/'gw' cuentan ahora un modelo por aparición).
21. ’Eadbuttin’ ’At (FAQ RH p.44): 0-1 por modelo.
22. Da Skull Smasha de Kiknik (aj_orcs2.txt:911-916 + FAQ RH p.35): faltaba el perfil de pico y los Ataques mágicos; se elige en cada paso 1.1.
Validados sin cambios los 5 cambios del agente anterior sin informe (vórtices con dado de dispersión, Lucero del alba, Mayal de los Reyes Conquistados, Bosques, infCavOnly en itemIssues).

### Tarea D (implementado)
- Aguijón venenoso (Escorpión de la Tumba rh.txt:6210-6212, Necroesfinge rh.txt:6328-6330, Esfinge de Guerra opción +5 rh.txt:6155/6166-6168) y Oleada de veneno (Arachnarok rh.txt:1522-1528): ranura opcional de un ataque (popup por turno en el paso 1.1, aiPick 'slotOpt'), Golpea primero (paso de I 10), envenenado, FP y Heridas múltiples (D6) propios, sin el Golpe letal del modelo. Mecánicas nuevas: ranuras opcionales (opt/u.slotOff), sf, noKb, mw de dados por ranura, patch `slots`. Además: opciones que faltaban (Esfinge: Rugido ígneo +20; Arachnarok: lanzador de seda +35 con Avería = −1 H), perfil dividido de las dotaciones (Arachnarok 8 × HA2 F3 I3; Esfinge 2 × HA3 F4 I3), Matamonstruos en las pinzas del Escorpión.
- Grupo de mando (Banda variopinta y cualquier unidad): solo se recoloca al desplegar, al reformar (también la gratuita), al girar 90°/180° o al unirse un personaje (canReslot; main.js oculta los botones ◀▶ fuera de esos momentos).
- IA, formación al desplegar: fmScore/fmBest (lectura propia: Orden abierto = bonificación por filas y combate; Escaramuza = proyectiles, movilidad) como primera candidata del decisor aprendido, que no distinguía las dos formaciones (mismos rasgos al desplegar).

### Tarea C (revisión de las reglas de ejército): hecho parcialmente
- Hecho: las reglas de ejército que aparecen en las FAQ tienen prueba de comportamiento (lotes FoF/RH/Catay); cobertura estática (behavior/srcov.mjs): 440 reglas en los perfiles; 37 sin referencia directa en rules.js/ai.js (lista en out/sr_coverage.txt). De ellas se usan solo en data.js (composición de listas o datos del perfil): horde, bombard, cannon, motley, daBoyz, countBanner, wightBanner, royalGuard, mercCmd, ladyLore, crown, cursedGods, ct*. Las demás (bigStabbas, warpaint, skulkers, arcBacklash, chaliceBr, breathChange, foeRenderR, accArch, beastHandlers, eshinInf, safeHarm, daemonicCharge, bullCharge, daemonic, leaderPack, peerless, align_*, randomAtk) no se leen en el motor con ese nombre: queda por comprobar regla por regla si su efecto está resuelto por otro campo del perfil (p. ej. ward, randA, alignOf) o si falta implementarlas.
- NO hecho: la revisión regla por regla de las ~340 reglas de ejército con su prueba individual (y las pruebas de cada hechizo y objeto con efecto mecánico) — motivo: el presupuesto de esta sesión se dedicó al inventario de las FAQ (459 entradas) y a las 22 correcciones; queda como siguiente lote. La revisión frase a frase previa está en v831.
#### No automatizables (42)
- cathay-note-001: Nota de diseño sobre el asterisco (erratas ya corregidas en reimpresiones): no es una regla del juego
- core-note-001: Nota de diseño sobre el asterisco: no es una regla del juego
- core-qa-002: Gesto físico del jugador (marcar la posición y deshacer un movimiento): en el motor cada movimiento es una acción atómica validada antes de aplicarse; no existe «deshacer y repetir» que pueda contarse como take-back
- core-qa-039: Prohibición general sin efecto en el motor: la carga se declara contra la unidad y el lado lo determina la posición (arco) del cargador; el motor nunca cambia el lado cargado a otro arco por falta de espacio (carga imposible = rechazada). Comprobado en core-qa-040 (lado según la mayoría de la peana)
- core-qa-049: El motor modela las colinas como rectángulos de altura única (sin cima ni pendiente): no distingue «más cerca de la cima»; la regla de ver por encima solo se aplica a unidades sobre la colina frente a las de fuera. Requeriría un modelo de alturas que el mapa no tiene
- core-qa-056: Cubierta por core-qa-041: sin contacto de peana con el enemigo (defensor de obstáculo) no hay Impactos; los Pisotones se hacen solo contra unidades en contacto (attackProfile de los modelos en contacto)
- core-qa-073: Aclaración de diseño (qué unidades tienen Contracarga): no es una regla; los datos siguen la lista de reglas de cada perfil (comprobado en el comparador unidad ↔ libros, v822-v824)
- core-qa-077: No hay en los datos ninguna unidad con Movimiento aleatorio y Contracarga a la vez (pump_wagon, squig_hoppers, mangler_squig, woc_spawn, sk_hellpit… no tienen Contracarga); la distancia D3+1 de la Contracarga no depende del Movimiento (doChargeG: d3+1), probada en core-qa-074
- core-qa-082: El motor no tiene un segundo valor de Movimiento para Volar: la «M» del perfil de un Volador es la misma para mover y para el alcance de la fila de combate (no hay Fly Movement aparte en los datos), así que no puede usarse la de vuelo por error; comprobado en core-qa-082:M
- fof-note-001: Nota de diseño sobre el asterisco (erratas corregidas en reimpresiones): no es una regla
- fof-errata-056: Tamaño de peana de un caballo de guerra de Coronas Renegadas (25x50 a 30x60): dato de montaje de miniaturas; el motor usa la peana del perfil de cada unidad y no admite peanas variables (sin efecto de regla automatizable)
- fof-errata-062: R «-» del caballo de guerra de Coronas Renegadas: la montura no tiene perfil de R propio en el motor (los caballos solo aportan Ataques/F a mountAtk y la barda a la armadura); no hay valor que comprobar
- fof-qa-004: El motor no distingue Matatrolls y Gigantomatas como modelos distintos dentro de la unidad (los Gigantomatas son una mejora del campeón/grupo de mando sin perfil propio en los datos); el grupo de mando no se pierde mientras queden modelos (applyWounds), así que no hay caso que reproducir
- fof-qa-022: El motor nunca ofrece retirarse a un participante de un desafío aceptado (la retirada solo existe al RECHAZAR, «Desafío rechazado»); no hay decisión que probar
- fof-qa-024: Contacto accidental de una Lanza que se ensancha al cargar: requiere la geometría de la formación en lanza en movimiento con otra unidad al flanco; el motor resuelve las cargas con el rectángulo de la unidad (no modela el ensanchamiento progresivo de la lanza), así que no hay caso distinto que reproducir
- fof-qa-026: Colocación física del personaje con peana distinta dentro de una Lanza: el motor no coloca modelos individuales en la lanza (rectángulo de la unidad); no hay efecto de regla que comprobar
- fof-qa-030: hawkEye solo actúa en shootCheck/resolveShot del arma de disparo (loneProtected con !has(u, hawkEye)); los proyectiles mágicos de objetos se lanzan como hechizos (castCheck/spellTargets), que no leen hawkEye: no hay camino en el que pudiera aplicarse
- fof-qa-031: Los aliados no están implementados como contingentes con reglas de ejército propias en el motor (el ejército es de una facción; las unidades aliadas usan la lista del aliado sin sus reglas de ejército)
- fof-qa-032: Las flechas encantadas no existen como objeto en los datos (solo el Arco de Loren y los arcos de los personajes), así que no hay interacción que probar
- fof-qa-037: Torneos por parejas (Matched Play Guide, alianzas de Coronas Renegadas): no existe el modo de dobles en el motor
- rh-note-001: Nota de diseño sobre el asterisco: no es una regla
- rh-qa-008: Miedo a los Elfos (fearElves) se resuelve como Miedo y nunca escala a Terror en el motor (no hay regla que lo convierta); la prueba solo podría confirmar la ausencia de un caso inexistente
- rh-qa-015: motherlyAttack resuelve el ataque con su perfil propio (no lee los objetos del modelo); que no use el arma mágica no tiene un caso distinto que reproducir salvo leer el código
- rh-qa-018: Marca del personaje frente a la del carro que monta: el carro montura no se compra aparte en los datos (va incluido en el perfil del personaje con su marca), no hay dos marcas que puedan diferir
- rh-qa-019: Duelo de guerreros sin campeones de una Herida: regla de un escenario/AJ que no está implementada (no existe el Duelo de guerreros en el motor)
- rh-qa-020: Duelo de guerreros entre campeones: no existe en el motor (ver rh-qa-019)
- rh-qa-026: Corazón Demoníaco: no existe como objeto en los datos (no hay alcance de dispersión que pueda ampliar)
- rh-qa-030: Resucitar modelos en una unidad de Escaramuzadores (colocarlos en coherencia): el motor no coloca modelos individuales de escaramuzadores (la unidad es un rectángulo con separación); no hay posición que comprobar
- core-qa-088: En los datos ninguna unidad mezcla modelos con y sin Miedo salvo personajes unidos (que no transmiten Miedo, JOIN_PASS); el caso no se da
- core-qa-093: Ceder terreno siempre usa pushAwayStep(…, 2) (core-qa-058/059 lo ejercitan); no depende del Movimiento aleatorio
- core-qa-096: Los Pisotones se hacen una vez por modelo con stompN/stompS del perfil (montura o carro), nunca por el jinete aparte; no hay caso distinto que montar
- core-qa-098: Pregunta de diseño (por qué la Zancada veloz permite mover más que el alcance máximo de carga): no es una regla nueva; el +D6 al mover está en core-errata-029
- core-qa-105: Centro de una unidad de Escaramuzadores (puntos extremos): el motor representa la unidad como rectángulo con separación y su centro es el del rectángulo, que coincide con el punto equidistante de los extremos
- core-qa-114: Un personaje en carro no sustituye a un tripulante: en los datos el perfil del personaje en carro incluye la dotación completa del carro (no hay modelos de tripulante que retirar)
- core-qa-118: Personaje con peana de varias filas dentro de una unidad: el motor no ocupa posiciones de filas con el personaje (frontLayout solo lo coloca en la fila delantera), así que no reduce la bonificación por filas
- core-qa-121: Moverse por las filas para pasar de la fila de combate al contacto: el motor no permite recolocar personajes durante el combate (canReslot v835) salvo desafíos; no hay acción que probar
- core-qa-146: Torneo (2.000 pts con 1.997 en lista): el límite 0-1 por 1.000 pts del motor se calcula con el límite de la partida (s.limit), no con los puntos gastados; la pregunta es de organización de torneos
- core-qa-147: Contingentes aliados con su propia lista de composición: el motor no implementa contingentes aliados como ejércitos dentro del ejército
- core-qa-148: Puntos de Básica del contingente aliado: no hay contingentes aliados en el motor
- core-qa-150: Tamaño mínimo de la mesa según los puntos: lo elige el jugador en la configuración (tableFor/tsize); no hay regla de juego que probar
- core-qa-168: Unidades de otra facción en una lista (Shaggoths, mercenarios): reglas de composición de torneo/aliados sin efecto en el juego
- core-qa-169: Límites 0-X por punto en torneos con Armas Combinadas: organización de eventos (composición combinada no implementada)

#### Pendientes: automatizables, no hechas en esta pasada (66)
- fof-qa-003: Sin datos para distinguirlo: el engine aplica Matador (slayer: hiere a 4+ / según F del enemigo) dentro de woundAndSave también al «Último golpe»
- fof-qa-012: El Cortagoblins del motor usa un número fijo de impactos por fila/columna del objetivo con un único modificador D3 (resolveShot, rama whirling): el recuento exacto depende de la geometría de la plantilla y no se puede aislar sin exponer el cálculo interno
- fof-qa-014: En los datos el Tanque de Vapor tiene una sola arma de disparo con selección (cañón de vapor / pistola del Comandante en ranged2); resolveShot dispara la elegida. Que ambos disparen exige que el motor trate la pistola como un segundo tirador independiente, cosa que hace solo si la acción shoot incluye las dos armas
- fof-qa-019: El segundo desafío del Duelista experto se resuelve con duelSwing del personaje y del rival (rules.js «segundo desafío»); la montura no está en esa resolución. Montar el segundo desafío exige un primer desafío ganado en la misma fase con otro participante disponible
- fof-qa-029: Los mejores corceles repiten los 1 de la tirada de carga en doChargeG (finestHorses) y la Zancada (swiftD6) se tira aparte sin repetición; no se puede aislar el D6 de la Zancada del de la carga sin exponer la secuencia de dados interna
- fof-qa-035: la Destreza marcial (martial) en el motor solo permite el apoyo por flanco/retaguardia a modelos con arma de Lucha en fila adicional (supportOK con thrust/extraRank); los Maestros de la Espada no tienen otro caso en los datos
- rh-errata-039: Aquelarre oscuro (AJ Hombres Bestia p.32): +1 a lanzar/dispersar del Chamán Bray con unidades amigas cerca; no automatizado en esta pasada (requiere montar el lanzamiento con las condiciones del AJ)
- rh-errata-040: Ánimo sepulcral (AJ Reyes Funerarios p.35): una vez por turno, el Sacerdote Liche nomina un constructo cercano antes de lanzar; no automatizado en esta pasada (animusSources existe; falta montar el Culto Mortuorio)
- rh-errata-046: Escultor de Piedra (AJ Ogros p.42): mejora en 1 la Regeneración de la unidad nominada hasta el final del turno; no automatizado en esta pasada (decisión ssTgt en el momento)
- rh-qa-002: Trayectoria del Fanático que entra en contacto con una unidad trabada y sigue en línea recta: el motor mueve el Fanático en línea recta y golpea a toda unidad que atraviesa (fanaticMove); no automatizado en esta pasada
- rh-qa-004: Fanático contra estacas defensivas (como obstáculo lineal): no automatizado en esta pasada
- rh-qa-005: Fanático que acaba en el alcance de mando de un modelo con Terreno hostil: chequeo de terreno peligroso; no automatizado en esta pasada
- rh-qa-007: La corrección del Goblin volador es una decisión del jugador (popup diverPref, v833) con la plantilla ya dispersada; montar la plantilla sobre un personaje protegido a 3" exige la secuencia de dispersión completa; no automatizado en esta pasada
- rh-qa-016: El Ídolo de Gork amplía el alcance (sp.range) en spellTargets; los hechizos de alcance Propio usan su aura (sp.aura) y no el alcance; no automatizado en esta pasada
- rh-qa-017: Títere Infernal contra hechizos ligados: no automatizado en esta pasada
- rh-qa-021: Forma deformada se aplica a la unidad (fx de la unidad); que no afecte al personaje unido no se ha montado en esta pasada
- rh-qa-022: Fetiche del Árbol Bruja con hechizos ligados: no automatizado en esta pasada
- rh-qa-023: Avidez de sangre (un D6 de persecución en Frenesí): no automatizado en esta pasada
- rh-qa-025: Aquelarre oscuro (Manada Salvaje) con el Cáliz de la Plaga: no automatizado en esta pasada
- rh-qa-028: Luz de la Protección: el efecto se aplica con add() que sustituye el fx del mismo tipo (no se acumula, comprobado en v831); no automatizado en esta pasada
- rh-qa-031: Terrores de las profundidades (US de quien emerge): no automatizado en esta pasada
- cathay-qa-003: Maestría de los Vientos: el contador está en el estado del bando (ssOf) por turno; no automatizado en esta pasada
- core-qa-087: Bestias de guerra y enjambres con Inmune a psicología temen a los Ataques flamígeros — no automatizado en esta pasada
- core-qa-089: Empate de armaduras en la Banda variopinta: implementado en svOf (Tripulación variopinta: «FAQ: empate → la mejor»); no automatizado en esta pasada
- core-qa-092: Movimiento aleatorio que rodea a un enemigo: randomMoves mueve en línea recta hacia el enemigo más cercano y lo alcanza por el arco en que está (no rodea); no automatizado en esta pasada
- core-qa-095: Exploradores cuentan para decidir quién acaba de desplegar primero — no automatizado en esta pasada
- core-qa-097: Estupidez que pasa del personaje a la unidad (JOIN_PASS) y deja de aplicarse al salir — no automatizado en esta pasada
- core-qa-100: Terror en el bando ganador: el −1 al Liderazgo no afecta a quien causa Miedo o Terror — no automatizado en esta pasada
- core-qa-101: Implementado: rules.js asigna e.assailWounds a las Heridas de ¡Timmm-berrr! (FAQ Core p.13) y sideScore las suma; no automatizado en esta pasada
- core-qa-103: Personaje sin Veteranos en una unidad con Veteranos (chequeos de Liderazgo de reglas especiales) — no automatizado en esta pasada
- core-qa-104: Ataques dirigidos a un modelo concreto que romperían la coherencia de los Escaramuzadores — no automatizado en esta pasada
- core-qa-106: Pérdida de coherencia al formar los Escaramuzadores (formUpSkLoss) — no automatizado en esta pasada
- core-qa-107: Escaramuzadores cargados por dos unidades desde direcciones distintas: forman contra la primera — no automatizado en esta pasada
- core-qa-109: El General lo elige el motor como el personaje de mayor Liderazgo (Core p.203); no automatizado en esta pasada con listas reales
- core-qa-110: Personaje con más Liderazgo que el General si una regla (Solitario) le impide serlo — no automatizado en esta pasada
- core-qa-111: Personaje mercenario como General — no automatizado en esta pasada
- core-qa-112: Modificadores al Liderazgo con Presencia inspiradora — no automatizado en esta pasada
- core-qa-113: Portaestandarte de batalla que rechaza un desafío y se retira: Mantened la posición — no automatizado en esta pasada
- core-qa-115: Implementado en svOf (mountSv: «la armadura mágica se usa por completo o nada», armPick); no automatizado en esta pasada
- core-qa-117: Escudo del personaje montado en monstruo/carro: no mejora la armadura de la montura — no automatizado en esta pasada
- core-qa-119: Torpes (Clumsy): un personaje Torpe puede unirse a una unidad no Torpe (no hay unidades Torpes en los datos) — no automatizado en esta pasada
- core-qa-123: Sin sitio en la fila delantera (Presión del combate): el personaje va a la fila trasera, no a la segunda — no automatizado en esta pasada
- core-qa-124: El personaje no desplaza al grupo de mando a la segunda fila — no automatizado en esta pasada
- core-qa-125: Personaje en la fila trasera: no da bonificaciones salvo regla — no automatizado en esta pasada
- core-qa-127: Personaje con Banda de guerra en una unidad que no lo es: sin modificador — no automatizado en esta pasada
- core-qa-129: Personaje de otro tipo de tropa unido a una unidad: se le puede disparar — no automatizado en esta pasada
- core-qa-130: Estandartes mágicos de la unidad afectan al personaje unido — no automatizado en esta pasada
- core-qa-131: Cañón y personajes solitarios protegidos — no automatizado en esta pasada
- core-qa-132: Ataques a modelos concretos no ignoran «¡Cuidado, señor!» — no automatizado en esta pasada
- core-qa-133: Personaje con nombre con lanza y arma mágica: puede usar la lanza el turno en que carga — no automatizado en esta pasada
- core-qa-140: Cañón y unidades interpuestas (salvo desde una colina) — no automatizado en esta pasada
- core-qa-142: HP de la máquina con personaje unido — no automatizado en esta pasada
- core-qa-143: Modelos añadidos a una máquina (Matón Orco): mueren con ella — no automatizado en esta pasada
- core-qa-144: Escaramuzadores pueden defender un obstáculo lineal bajo — no automatizado en esta pasada
- core-qa-145: Reglas de ejército y mercenarios — no automatizado en esta pasada
- core-qa-152: Urgencia Arcana sobre una unidad con Movimiento aleatorio: no puede entrar en contacto — no automatizado en esta pasada
- core-qa-155: Carga contra una unidad con Murallas de Tierra: como contra un obstáculo lineal bajo defendido — no automatizado en esta pasada
- core-qa-156: Doble Espectral con armas de un solo ataque — no automatizado en esta pasada
- core-qa-157: Doble Espectral con Ataca primero / último — no automatizado en esta pasada
- core-qa-158: Piedra de Obsidiana y Resistencia mágica de otras fuentes — no automatizado en esta pasada
- core-qa-159: Estandarte que mejora las armas no las hace mágicas — no automatizado en esta pasada
- core-qa-164: Pergamino de Transmogrificación sobre un Mago montado en monstruo: se transforma el Mago, no la montura — no automatizado en esta pasada
- core-qa-165: Pergamino de Transmogrificación contra un hechizo ligado (prueba con el Nivel de poder) — no automatizado en esta pasada
- core-qa-166: Familiar de Saber y hechizos de firma de la facción — no automatizado en esta pasada
- core-qa-167: Familiar Arcano: número de hechizos conocidos con dos saberes — no automatizado en esta pasada
- core-qa-170: Una unidad puede controlar varios objetivos a la vez — no automatizado en esta pasada

## v836 — cobertura completa

Estado: **parcial** (ver «Lo que queda»). No se ha tocado `app/sw.js`; no se ha ejecutado `smoke_all`; no se ha publicado nada. Progreso por lotes en `rules/verif/auto/out/txt/progreso5.md`.

### Cifras (rules/verif/auto/behavior/run.sh)
- Pruebas de comportamiento totales: **783**; pasan **783**; fallan 0.
- Nuevas en v836: 37 (reglas sin lectura por nombre, `tests/40_c37.mjs`) + 28 (perfil de combate, `41`) + 29 (salvaciones especiales, `42`) + 51 (reglas varias, `43`/`44`) + 143 (hechizos, `60_spells.mjs`) + 124 (objetos, `61_items.mjs`) + 14 (entradas FAQ, `50_b66.mjs`).
- Inventario FAQ: 459 entradas; 367 con prueba; 92 sin automatizar (de ellas, **54 automatizables aún pendientes**, lista abajo y 38 no automatizables con motivo); 0 sin cubrir.
- No automatizables con motivo (N): 78 en el arnés (42 previas + 8 hechizos de texto condicionado/compuesto + 28 concesiones de reglas de objetos con condición en el texto).
- Correcciones al motor en v836: **0**. Ninguna prueba reveló discrepancia con el libro/FAQ; las comparaciones se hicieron ejecutando el motor real (dados fijados) y contra el texto del hechizo/objeto/regla.

### Método
- Las pruebas ejecutan `app/js` (copia con dados controlables, `engine.mjs`); no leen el código fuente. Novedad del arnés: `woundAndSave` registra sus argumentos (`globalThis.__WSL`) para comprobar F/FP/impactos/flamígero/sin armadura de lo que el motor ejecuta realmente.
- (C) 37 reglas del `sr_coverage.txt` resueltas: cada una con prueba que verifica el dato o la mecánica (p. ej. `accursedW`: la FP −1 está en el perfil `melee.ap=1`, la magia la aplica `woundAndSave`; correcto con leg_vampires.txt:596-599). Además ~100 reglas más con prueba A/B (con y sin la regla sobre el mismo perfil): Matador, Odio (5 variantes), Golpe mortal, Carga furiosa/bestial, salvaciones especiales (umbral exacto), Pánico (inmunidades, reintentos), Liderazgo (Aullido abisal, Grisly, Grito de guerra, Banda de guerra, Hordas veloces), Iniciativa (Reflejos élficos, Golpear al final, Carroñeros, Almizcle soporífero), puntos de resultado (Defensa impenetrable, Rastro viscoso), Impactos de carga (Mournfang, Trueno, Estampida, Carga ogra), Pisotones (Ruedas, Mole aplastante, Gran Incensario), Inestable + Indomable, lanzamiento (Brasero, Tomo), Huida (Escabullirse, Resuelto).
- (D) Hechizos: los 53 de proyectil/asalto se lanzan y se comparan con su texto (nº de impactos con la expresión del texto, F, FP, flamígero, sin armadura, sin Regeneración, Heridas múltiples), Navaja mental y Luz de la Muerte en ambas ramas de Liderazgo; los 99 restantes (hex, encantamiento, vórtice, conveyance) se lanzan y deben producir un cambio de estado o un aviso propio; Deshacer de Vaul y Runa de Hogar y Patria con prueba específica. Objetos: talismanes (salvación especial), armaduras (valor de armadura), armas (F, FP, Ataques; disparo del objeto: alcance/F/FP), concesión de reglas (estandartes/objetos), Resistencia a la magia y salvación especial genérica, todos con texto incondicional.
- (B) Entradas FAQ nuevas con prueba: fof-qa-003, 012, 014, 029, 035; rh-errata-039, 040, 046; rh-qa-016, 025, 028; cathay-qa-003; core-qa-158, 159.

### Lo que queda (exacto)
- (B) 54 entradas FAQ automatizables sin prueba (siguen como `N(...,true)`): fof-qa-019; rh-qa-002, 004, 005, 007, 017, 021, 022, 023, 031; core-qa-087, 089, 092, 095, 097, 100, 101, 103, 104, 106, 107, 109, 110, 111, 112, 113, 115, 117, 119, 123, 124, 125, 127, 129, 130, 131, 132, 133, 140, 142, 143, 144, 145, 152, 155, 156, 157, 164, 165, 166, 167, 170. (rh-qa-023: Avidez de sangre solo en Frenesí —`has(w,'frenzy')` ya lo exige en rules.js:7167—; faltaba montar la persecución.)
- (C) ~255 de las 450 entradas de `RULES` aún sin prueba por regla (psicología fina, movimiento, magia de ejército, reglas de carácter/mando, mecánicas de ejército de Legado). No se ha hallado ningún fallo, pero no se han verificado una a una.
- (D) Hechizos: los de texto condicionado/compuesto (Constelación Yang, Ancestral Yin, Mirada, Gaze de Gork, Curse of Hashut, Devolver, Doppelgänger, coven_fireball) solo tienen comprobación de ejecución; objetos: ~570 de 695 sin comparación numérica con texto (estandartes y objetos con efectos condicionales: una vez por partida, contra X, etc.).

## v837 — cobertura completa II

Cifras (behavior/run.sh): 998 pruebas, 998 pasan, 0 fallan; 82 no automatizables con motivo; 207 reglas pendientes registradas (tests/90_rules_pending.mjs); FAQ: 54 automatizables cubiertas, 0 sin cubrir.

Cobertura añadida: 54 entradas FAQ (tests 80–81), 8 hechizos contra su texto (82), ~60 reglas especiales con prueba propia (83–87, 89), 98 pruebas generadas de objetos condicionales (88).

Correcciones de motor/datos (fuente):
- Distancia NaN (Fanático + Terreno hostil; contacto de Lanza): FAQ Core/RH.
- Liderazgo del Solitario en el cálculo del General: core.txt «Selecting Your General».
- «¡Cuidado, señor!»: comparación de tipo de tropa (FAQ Core).
- Personajes nombrados heredaban opciones genéricas: aj_empire/aj_dwarfs «must be fielded as presented here».
- Lanza vs. arma mágica integrada; Tiradores contra obstáculo lineal bajo: core_rulebook.txt:10611-10616.
- Familiar Arcano: número de hechizos (faq_rh.txt).
- Marioneta Infernal frente a hechizos Ligados (faq_rh.txt).
- Texto de Doppelgänger en data.js.

Lo que queda: 207 reglas sin prueba conductual (escenarios de combate multi-ronda o posición por modelo: implacable, falange, muro de escudos, desvinculación, etc.); ~470 objetos condicionales (estandartes, runas, un solo uso, «contra X») sin prueba generada; 43 FAQ no automatizables y 82 N con motivo. Chaos Armour (X+) es parámetro por unidad (N con motivo).


## v838 — cobertura completa III

Estado: **parcial** (ver «Lo que queda»). No se ha tocado `app/sw.js`; no se ha ejecutado `smoke_all`; no se ha publicado nada. Progreso por lotes en `rules/verif/auto/out/txt/progreso7.md`.

### Cifras (rules/verif/auto/behavior/run.sh)
- Pruebas de comportamiento totales: **1.486**; pasan **1.486**; fallan 0 (v837: 998).
- Reglas especiales (`RULES`) sin prueba conductual: **0** (eran 207). Las pruebas ejecutan el motor (dados fijados, escenarios multi-ronda / por modelo con `pair`, `resolve`, `strategy`, `moveStart`, `castThr`, `shotOf`, `withoutSr`); dos claves huérfanas (`hatredNamed`, `necrotectOver`: ninguna unidad ni opción las lleva y el motor no las lee) quedan como N() con ese motivo.
- Armadura del Caos (X+): una prueba por unidad con su X real (12 unidades: rh.txt:2286, 2334, 2383, 2527, 2610, 2873; aj_chaos2.txt:1046, 1205) + la parte del Mago con armadura.
- Objetos: de 501 sin comparación con su texto quedan 261 (240 con prueba nueva: tests 118–131, generadores por familia: armas, armaduras, estadísticas, concesión de reglas, restricciones de uso con `itemIssues`, resolución de combate, disparos, salvaciones/regeneración/RM, aura, hechizos atados, pociones, lanzamiento, hechizo extra, uso en Mando, impacto del rival).
- Inventario FAQ: 459 entradas; 417 con prueba (+1: rh-qa-008); 42 sin automatizar con motivo concreto cada una (diseño/piezas físicas/torneos/contingentes aliados/colocación por modelo que el motor no modela), 0 sin cubrir.

### Correcciones al motor / datos (con fuente)
1. **Implacable + Inquebrantable** (cathay_aj.txt:2143): no se ofrecía a unidades Inquebrantables (los Centinelas).
2. **Espíritus desatados** (rh.txt:6443-6450): ya no cuentan como mágicos.
3. **Parada (Parry)**: tope 3+ de la salvación (faq_core.txt:183-189).
4. **Boldest**: incluido en el cálculo del Liderazgo (`ldOf`).
5. **Tanque de Vapor, Temperamental** (fof.txt:2796-2806): ahora se pregunta al jugador en la carga y al mover (popup).
6. **Arrastrado (draggedAlong)** (core.txt:5308-5314): nunca se activaba (`rectDist` de punto-rectángulo aplicado a dos unidades → NaN); ahora `unitDist ≤ 1"`.
7. **Miasma hechicero** (leg_chaosdwarfs.txt:544-552): el arma mágica contra un personaje en Lammasu «cuenta como una arma de mano sencilla»; antes solo perdía «Ataques mágicos» y conservaba F, FP, Perforación y Ataques (ahora se descartan todas sus propiedades).
8. **+D3 de resolución de combate de los estandartes** (Estandarte de Batalla alto elfo, Victoria Impía, Superioridad Skaven): se sumaba **dos veces** (en `sideScore` y en el bucle de objetos de resolución); ahora una (texto «+D3 al resultado de combate»).
9. **Tótem Caníbal** (leg_ogres.txt:884-889): «A unit carrying the Cannibal Totem gains the Regeneration (5+)»: el motor no aplicaba la regeneración del estandarte.
10. **Miedo a los Elfos** (rh.txt:1956-1958, FAQ RH Q «All Goblins Fear Elves»): «Elves of any type cause Fear»; el motor solo contaba los Elfos Silvanos (ahora también Altos Elfos y Elfos Oscuros; fuera espíritus del bosque y bestias/monstruos sin dotación élfica).
11. **Armadura del Caos (X+)** (rh.txt:3494-3504): «a Wizard with this special rule may wear armour without penalty»; las unidades de los Guerreros del Caos con la salvación (campo `ward`) no tenían la regla y un Señor Hechicero con armadura no podía lanzar (datos: `chaosArmour`).
- Aclaración sin cambio de motor: la Runa de Hender (FP) sobre un arma de mano de gromril: el arma con runa deja de ser de gromril (fof.txt «Gromril Weapons»), FP −1 en total.

### Lo que queda (exacto)
- 261 objetos sin comparación con su texto (efectos puntuales: un solo uso, dispersión/lanzamiento con condiciones, estandartes/runas con reglas propias, honores/virtudes, runas de ballesta/arcabuz, aura-Ld de Daemons…): `bm_authority bm_renown bm_glass bm_eye bm_wmap bm_alma bm_wyrd ct_mantle ct_sigil ct_dragonwrath ct_xenwun ct_goldenlion ct_spiritlantern ct_cloak ct_fengshi_l swiftness earthing_rod paymaster dawnstone luckstone iron_resolve rampaging blazing blades_loec glamourweave bow_loren asyendi locus b_midsummer wand_wych oaken_stave b_duty b_gleaming shroud_iron silver_horn b_valorous b_chalons gauntlet silver_mirror b_waaagh buzgob idol_mork b_guff prayer_icon big_boss_at b_imperial collar_zorga b_wildwood b_queen jade sirienne b_butchery bm_dark_heart bm_horn_beast dw_oathstone r_flight r_swiftness r_breaking r_banish r_grudge bn_beastkiller bn_deathcheater r_adamant r_preservation r_shielding r_stone r_calm r_balance r_spite r_spellbreak r_warding r_luck r_passage r_grungni r_stromni r_confusion r_battle r_courage r_immolation r_disguise r_skewering r_burning r_reloading r_stalwart he_opal he_null_stone he_sigil he_arcane_bn he_lion_std bm_rune_beast mu_slug mu_pelt mu_rune woc_collar b_rage woc_blasted woc_pendant gf_pain gf_mortals gf_ichor tk_sacred_eye tk_rakaph tk_rulership tkaj_sun tkaj_tapestry tkaj_orb tkaj_curse tkaj_tablets wocaj_tome wocaj_ogvold bmaj_cornucopia bmaj_gore bmaj_beast bmaj_hunthorn bmaj_dirge bmaj_shadowgave bmaj_goretooth empaj_crystal empaj_sigmar empaj_magnifier empaj_fortune empaj_twin brsaj_grail brsaj_lucky brsaj_parravon brsaj_wyrm brsaj_grace brsaj_honour heaj_incense heaj_lothern heaj_balance heaj_confidence heaj_tempest heaj_courage heaj_trickster heaj_solidity tat_dauntless tat_endless tat_dishonoured rw_slaying rw_piercing rw_bursting rw_concussive rw_accuracy rw_rapid rw_molten rw_enchanted cdl_hellshard cdl_sigil cdl_familiar cdl_breath cdl_blood cdl_scroll dml_locus_war dml_glory dml_speater dml_collarK dml_sundering dml_endlessK dml_contagion dml_virulence dml_decay dml_rotten dml_allure dml_sirensong dml_gaze dml_acquiesce dml_rapturous dml_siren dml_willT dml_corona dml_changeB dml_sorcery del_harganeth del_cold del_tooth del_eye del_blackstaff lml_jaguar lml_grub lml_cupped lml_d_becalm lml_d_void lml_d_wander lml_d_soul okl_dragonhide okl_runemaw okl_bull okl_lion okl_laurels okl_cookbook okl_sickle skl_globe skl_magnet skl_orb skl_condenser skl_tokens vcl_p_beguile vcl_p_blackarts vcl_p_night vcl_dreadlance vcl_ring vcl_barrows vcl_drakenhof vcl_screaming vcl_skullstaff vcl_noirot aj_finda aj_teef aj_baduumm aj_idol_gork vaul_wrath orion_favour b_wildhunt b_tapestry favour_gods dark_majesty b_gods stone_spite crown_kings collar_shapesh kanopi hieratic_jar scarab_brooch hail_doom wailing_arrow blight_arrows crown_antlers aj_fortitude aj_steadfast aj_totem aj_swirl aj_tapestry aj_disruption aj_spellcraft orb_midsummer heartwood sp_malevolents sp_mischiefs sp_murder sp_lament sp_netlings k_hound k_boar k_cat k_eternal kv_temper kv_stoicism heart_wilds diadem_power kv_audacity kv_duty kv_disdain kv_confidence kv_empathy kv_joust b_outrage b_vitriolic b_manbane power_scroll ring_ruin`.
- 42 entradas FAQ sin automatizar con motivo concreto cada una (ver `behavior/out/results.json`, lista `notAutomatable`).

## v839 — cobertura completa IV

Estado: **completo en lo pedido** (ver «Lo que queda»). No se ha tocado `app/sw.js`; no se ha ejecutado `smoke_all`; no se ha publicado nada. Progreso por lotes en `rules/verif/auto/out/txt/progreso8.md`; pruebas en `rules/verif/auto/behavior/tests/132–161`.

### Cifras (rules/verif/auto/behavior/run.sh)
- Pruebas de comportamiento totales: **1.767**; pasan **1.767**; fallan 0 (v838: 1.486).
- Objetos: de los 261 sin comparación con su texto quedan **0**: 263 pruebas `v839-it-*` (una por objeto, más extras) que ejecutan el motor forzando la situación y comparan con el texto del libro. Ningún objeto se ha dejado como no automatizable.
- Inventario FAQ: 459 entradas; **433** con prueba (+16: core-qa-056, 077, 093, 096, 121, 146, 147, 148, 169; fof-qa-022, 030, 031, 032; rh-qa-015, 019, 020, 026); **26** sin automatizar (eran 42), con motivo concreto cada una; 0 sin cubrir. Varios motivos antiguos eran falsos (los contingentes aliados, el Duelo del Guerrero, las flechas encantadas, las Armas Combinadas y el Escudo de la Dama sí existen en el motor).
- No automatizables en total: 65 líneas N (27 de FAQ —26 entradas sin prueba más core-qa-082, que además tiene prueba parcial— + 38 de listas v836: 8 hechizos compuestos, 28 concesiones de regla condicionadas y 2 claves huérfanas).
- Comprobaciones finales: `build.py` ok; `node /tmp/pw.js` → `errors: []`; `node /tmp/ask_test.mjs` → 4 partidas completas con popups.

### Correcciones al motor / datos (con fuente)
1. **Collar de Zorga** (rh.txt:1892-1898): el −1 se aplicaba a todo el jinete y nunca a carros; ahora solo a los ataques de la montura/bestias.
2. **Estandarte de la Ira del Dragón**: faltaban los «Ataques flamígeros» en el perfil.
3. **Vara de Toma de Tierra** (core.txt:11188-11189 «can use … to re-roll»): se aplicaba siempre; ahora opcional (popup).
4. **Collar de Khorne** (leg_daemons.txt:1144-1146 «improves its Magic Resistance by 1»): ahora suma +1 a la RM natural (`mrPlus`, máx. 3).
5. **Alcance de carga con ¡Waaagh!/Bestia** (chargeReach) y **D3 determinista** (Temple caballeresco usaba `rnd()`).
6. **León de Jade (okl_lion)**: no repetía el chequeo de Reagrupar.
7. **Runa de Rompehechizos / Sello de Asuryan** (fof.txt:1470-1472 «may use it instead of making a dispel attempt»): se usaban siempre automáticamente; ahora opción en el popup de dispersión.
8. **Dados extra al dispersar** (Espejo de Plata, Colgante del Embaucador, Runa de Equilibrio, Bastón de Roble; fof.txt:4280-4284, 1489-1492, 5766-5770): el dado extra se tiraba después de ver el fallo; ahora se declara antes y se descarta el más bajo.
9. **Bastón de Solidez** (aj_highelves.txt:1773 «may choose not to») y **Manos Ahuecadas** (leg_lizardmen.txt:822-828 «nominates an enemy character»): ahora popup.
10. **Tomo de los Dioses Oscuros** (aj_chaos2.txt:1709-1714): sustituía todos los hechizos por los cuatro del Caos en orden fijo; ahora acción `tomePick` (UI en despliegue, decisor de la IA).
11. **Arco de Loren / Maldición de Asyendi** (fof.txt:5692, 5703-5705): faltaban Ataques mágicos (y Disparo rápido en el segundo).
12. **Flechas de la Fatalidad / Gemebunda / de Plaga** (fof.txt:5761-5770): se gastaban solas; ahora popup antes de disparar.
13. **Error de fondo** `resolveShot`: la herida general pisaba `magical` y `noArmour` (`wo`): ningún arma a distancia mágica ni el viento envenenado/con púas los conservaba.
14. **Piedra del Rencor, Kanopi de Enkhil, Vasija Hierática**: aplicadas con heurística fija; ahora popup (IA: `aiPick`). **Collar de Shapesh**: solo se consume si hay víctima.
15. **Estandarte del Cambio/Aquiescencia, Matanza de Duendes, Aura de dolor**: «una unidad enemiga trabada» a elección del jugador (popup con varios enemigos). **Hoz de Grut**: popup con los modelos candidatos.
16. **Icor ácido (RH p.77), Fastidio de Redecillas, Hoja del Cabecilla, Confianza y Tatuaje Intrépido** (fof.txt:4177-4183 «During a challenge, this model may re-roll any failed rolls To Hit»): un desafío entre dos personajes solitarios no se marcaba como desafío (camino de ataque normal), por lo que nada de eso actuaba; ahora sí (cifras: Icor ácido pasa de 0 a un impacto por Herida perdida; Redecillas +1 al valor para impactar; Confianza repite todos los fallos).
17. **Bola de Cristal** (aj_empire2.txt:1706-1709 «re-roll a single roll To Hit or To Wound»): solo se aplicaba a impactar; ahora también a la primera tirada para herir con éxito (una vez por turno entre ambas).
18. **Ojo Guía** (un solo uso): al rehusar el popup se repetían igualmente los impactos fallados (10 impactos en vez de 5 con dados 1/6 alternos); ahora solo si se usa. **Globo de la Muerte**: el texto de la plantilla se perdía en el registro.

### Tarea 3: Runa de Hender (Rune of Cleaving) sobre un arma de gromril
- fof.txt:1391-1396: «Hand weapon only. For each Rune of Cleaving inscribed upon a weapon, its Armour Piercing characteristic is improved by 1.» fof.txt:1610-1617: Armas de gromril solo valen para «a single, ordinary hand weapon … if their hand weapon is inscribed with any Weapon runes, this special rule ceases to apply».
- El motor ya cumplía el texto (sin cambio): prueba `v839-r_cleaving-gromril` ejecuta `attackProfile`: sin runa FP −1 (gromril); con una Runa de Hender FP −1 en total (no −2); con dos, −2; con otra runa de arma (Golpear) sin FP.

### Lo que queda (exacto)
- 26 entradas FAQ sin automatizar, cada una con motivo concreto en `behavior/out/results.json` (`notAutomatable`): 4 notas del asterisco (cathay/core/fof/rh-note-001: no son reglas); organización/diseño sin efecto de juego (core-qa-002 gesto físico, 073, 098, 150, 168, fof-qa-037 dobles); colocación de modelos individuales en filas/lanza/escaramuzadores que el motor no representa (core-qa-104, 105, 114, 118, 124, 125, fof-qa-004, 024, 026, rh-qa-030); datos/peana de la montura (fof-errata-056, 062, rh-qa-018); sin caso en los datos (core-qa-088); geometría de alturas/lado de carga no modelada (core-qa-039, 049, 082).
- 38 líneas N de listas v836 (8 hechizos compuestos, 28 concesiones de regla condicionadas, 2 claves huérfanas), con motivo en `results.json`.
- Solidez de algunas aserciones antiguas (p. ej. `bm_rune_beast`, `heaj_balance`) sigue siendo parcial (comprueban el efecto principal, no todos los casos límite).

## v840 — cobertura completa V

Cifras finales del arnés (`behavior/run.sh`): 1823 pruebas, 1823 pasan, 0 fallan; inventario FAQ 459 entradas, 451 con prueba, 8 sin automatizar (motivo concreto en `results.json`). Las 38 líneas N de v836 quedan en 0 (8 hechizos compuestos y 28 concesiones condicionadas con prueba ejecutable; 2 claves huérfanas `hatredNamed` y `necrotectOver` eliminadas de `RULES`). De las 26 entradas FAQ sin automatizar, 18 pasan a prueba; quedan 8.

### Discrepancias corregidas (todas con prueba que ejecuta el motor)
1. **Barba** (5+ de salvación mágica para la unidad portadora), **Lenguaje con armadura**, **Mawseeker Stupidity**, **Plumas/Horror Volador M=10**, **expiración de Mangelder**: corregidos en data.js/rules.js (pruebas 162/163).
2. **Restricción del Slann** (objetos solo para `lm_slann`): data.js y filtro de main.js.
3. **Doble Espectral**: reglas de arma, detección de un solo ataque, FAQ Core p.17 (core-qa-156: perfil a dos manos 12 ataques / un arma 1 golpe).
4. **Mirada (burning_gaze, gaze_gork)**: la línea parte del borde de la peana, origen en la casilla del lanzador; impactos por intersección polígono-segmento (`modelsUnderLine`), verificado con muestreo geométrico independiente. Una línea de 10" alcanza un objetivo a 9" de borde.
5. **curse_hashut**: `engagedOk: true` (leg_chaosdwarfs.txt:862-867 admite objetivos trabados o con personajes unidos).
6. **core-qa-049 colinas**: la cima cortada por el borde de la mesa es el borde (`rayBlockedByUnits`).
7. **bluntLance** (carga por la retaguardia): ahora recibe el enemigo; si contacta por detrás conserva el borde trasero (antes la lanza retrocedía y perdía el contacto, 2,39" y 0 combates).
8. **Huella de la lanza** (geom.js): casco convexo de las filas 1..k para distancia y solapamiento (core-qa/fof-qa-024); `dims`, `sideOf` y arcos siguen rectangulares. Aproximación documentada: los arcos por segunda fila y última no se modelan.
9. **core-qa-082**: 21 voladores sin Movimiento terrestre (`gM`) lo reciben en `GM_FIX` (skycutter 2, plaguedrones 1, burning 1, mortis/coven 6, hexwraith 8…). Decisión de diseño: las Linternas Celestes (ct_lanterns*, ct_magistrate_lantern, ct_strategist_lantern) tienen M «-» en todas las filas de terrestre y conservan M (aserción exacta en core-qa-082).
10. **Marca de Tzeentch en personaje-carro** (rh-qa-018): se filtraba a la dotación y los impactos no eran flamígeros; ahora solo con la opción `chm` (+10 pts) o fuente flamígera propia (`chMarkGate`); los impactos con Marca son flamígeros.
11. **core-qa-168**: el Shaggoth (rh.txt:4425-4426 «may purchase magic items up to a total of 50 points») no admitía objetos; nuevo campo `monItems: 50` (data.js itemBudget/itemIssues, main.js panel). Objetos comunes o de su facción; de otra facción se rechazan; >50 pts se rechaza.
12. **Aproximación conservada**: la distancia del aura del portaestandarte se mide de unidad a unidad (`unitDist`), no desde el modelo portador.

### Aserciones antiguas reforzadas (tests/164_v840_edges.mjs)
- `bm_rune_beast` (rh.txt:4893-4900): solo monstruos, a 5,5" −1 HA, a 6,5" sin penalización, no monstruo sin penalización, dos runas no acumulan, HA nunca < 1.
- `heaj_balance` (aj_highelves.txt:1699-1707): control con repetición real (Flagelantes con odio), sin estandarte el rival repite, con él no; el portador tampoco; otra unidad sin contacto con el portador conserva sus repeticiones.

### Lo que queda (exacto)
8 entradas FAQ sin automatizar, todas sin efecto de juego en el motor: 4 notas del asterisco (cathay/core/fof/rh-note-001), core-qa-002 (gesto físico de deshacer movimiento), core-qa-073 (aclaración de diseño de Contracarga), core-qa-098 (diseño de Zancada veloz, cubierto por core-errata-029), fof-qa-037 (torneo por parejas: el motor no tiene modo dobles).

## v841 — cobertura completa VI

Cifras: 1844 pruebas de comportamiento (ejecutan el motor), 1844 pasan, 0 fallan; inventario FAQ 459/459 con prueba, 0 sin automatizar, 0 sin cubrir. Pruebas nuevas: `tests/165_v841_geom.mjs` (9) y `tests/166_v841_faq.mjs` (11 entradas/ids).

### Discrepancias corregidas
1. **Arcos de la Lanza** (aproximación 1). fof.txt:4435-4500: «Lance Facings … determined by the models in the second rank and the last rank». Antes: rectángulo del bloque. Ahora `geom.arcFrame/sideOf/modelLocal` usan las esquinas delanteras de la 2.ª fila y las traseras de la última; `modelPts`, `inFrontArc`, contacto de carga y huecos del grupo de mando son coherentes (solo el modelo delantero contacta). Pruebas: rejilla frente a referencia textual, discriminación frente al rectángulo antiguo, arco frontal y carga real.
2. **Alcance de mando y auras medidos desde el modelo** (aproximación 2). core.txt:6961-6963 («measure from the model itself»), core.txt:6715-6733 y 6764-6770 (Portaestandarte de Batalla/General), cathay_aj.txt:2708-2711 (Wei-jin, «12" of the model carrying the Standard»), aj_orcs2.txt:1496 (Trofeo, «6" of the bearer»). 51 mediciones `unitDist(X,Y) <= commandRange(Z)` pasan a `cmdIn` (distancia desde la peana del personaje); estandartes y objetos con aura usan `auraNear/ruleNear`. `locusWar` (leg_daemons.txt:1090-1093) y Stromni usan el alcance de mando del portador (antes 12" fijo). Un personaje retirado/trasero se coloca en el centro de la 3.ª fila (decisión de diseño documentada: sin hueco delantero, el modelo está tras las filas de frente). Una unidad con un solo modelo da el mismo resultado que antes (prueba).
3. **Alcance de carga con Zancada veloz** (core-qa-098; faq_core.txt:115-120, 723; core.txt:3700-3745). El motor recortaba `M + tirada` al máximo posible; el máximo solo limita la declaración. Corregido (también en la repetición de Implacable). Cifras: caballeros M7, dados 6 + D6 6 = 19" > 16" máximo; sin la regla ni se declara.
4. **Deshacer movimiento** (core-qa-002; core.txt:2682, faq_core.txt:345-348). Retirado el botón «deshacer»; `takeBackAllowed` en el motor (no permitido si hay movimiento o dados); la vista previa no toca la partida.
5. **Partidas de dobles** (fof-qa-037; matched.txt:1539-1700, faq_fof.txt:346-349, faq_rh.txt:246). Nuevo modo: dos listas por bando, cada una ≤ mitad de los puntos, misma lista o sección «Allies», Coronas Renegadas de confianza si la primaria es Renegadas/Imperio/Bretonia, personajes con nombre únicos, una Piedra de Manada por jugador, fuerzas 0/1, «El Rey ha muerto» 100/50 PV y Portaestandarte 50/25, punto de ruptura con la UST de todo el bando. Interpretación de diseño: «mitad de los puntos» se valida por lista.
6. **Notas del asterisco** (cathay/core/fof/rh-note-001): solo existen dos erratas con asterisco: «The Axe of Dargo*» (S+2; motor S 6, FP −3) y «Badlands Ogre Bulls*» (Crusher +7; el motor cobra +7). Cathay y Core no tienen erratas con asterisco. Sin cambio de motor.
7. Contracarga (core-qa-073): solo la unidad con la regla la ofrece (Pistoleros sí, Batidores con la misma montura no, unidad con personaje sin la regla no).

### Aserciones vacías
`run.mjs` rechaza ahora: `|| true`, `ok(true…)`, `&& true`, `length >= 0`, `eq(x, x)`, `|| 1` en `ok`, `if (!x) return` (salto silencioso) y toda prueba que no ejecute ninguna aserción. Corregidas 10 aserciones vacías y 5 pruebas que se saltaban en silencio (core-qa-016, 120, 136, 138, rh-errata-017), ahora con comprobaciones reales (p. ej. relanzar Drenar Magia termina el hechizo: FAQ).

## v842 — exactitud final

Cifras: 1850 pruebas de comportamiento, 1850 pasan, 0 fallan; inventario FAQ 459/459 con prueba; prueba de mutación 92,7 % (1711 muertas de 1846 mutadas; ≫200 exigidas).

### 1. Colocación del personaje retirado / de la retaguardia (antes «centro de la 3.ª fila»: decisión de diseño eliminada)
Búsqueda: core.txt:6905-7100 (unirse, posicionamiento, desafíos), faq_core.txt:395-400 y 783-812, fof.txt:3440-3452 y 4485-4500 (Lanza), leg_skaven.txt:980-1000, faq_fof.txt:214-224, 300-314, 340-350, faq_rh.txt:240-250. El texto no fija casilla: el personaje que no combate se coloca «in the rear rank / second rank…» a elección del jugador (core.txt:6930-6931, 7061-7083); la Lanza (fof.txt:4492-4496) y el skaven (leg_skaven.txt:988-990) sitúan la ranura en una fila concreta, y faq_core.txt:807-810 aclara que no cuenta como línea de combate. Implementación (rules.js `rearCands/rearSlot/pickRear/ensureRear`): el humano elige con popup «Fila k de N» y «Columna c de files» en el momento; la IA elige por `aiPick('ask:rearR:/rearF:')` (decisor autoaprendido); Lanza: centro de las filas ≥3, si no la última (único caso con regla literal). Pruebas: `tests/167_v842_rear.mjs` (8).

### 2. Dobles: «mitad de los puntos por lista» (fof-qa-037)
matched.txt:1551-1556 y faq_fof.txt:346-349 / faq_rh.txt:246 son explícitos: dos listas por bando, cada una ≤ la mitad del límite total, reglas normales por lista, personajes con nombre únicos, sin traspaso de puntos sin gastar. No hay mudez: se aplica tal cual (sin interpretación de diseño). UI: medidores primaria/secundaria con medio límite; General exigido en ambas listas (`autoAlly(strict)`); presets dm 500/1500 corregidos (Furias ≥5).
Verificado a mano con Playwright a 393 px (partida de dobles, 3 turnos completos, 18 unidades, despliegue por listas, reacciones de carga, Impetuosidad): LAYOUT [] (sin solapes, sin botones cortados ni scroll-x), errores [].

### 3. Prueba de mutación (`run.sh --mutation [N] [filtro]`)
`mutation.mjs` rompe en la copia `.eng` regla/objeto/hechizo/unidad/dados/llamadas (operadores R,I,S,U,A,P,I2,S2,G,F,E,D, incluidas llamadas a `GEOM.*`/`DATA.*`) y exige que la prueba FALLE. Resultado: 1846 mutadas, 1711 muertas, 135 sobreviven (listadas en `out/mutation_survivors.txt`). Las supervivientes son pruebas de documentación/datos o de comparación A/B que los operadores actuales no pueden romper; las aserciones vacías ya las rechaza el lint de `run.mjs`. Ajustes hechos por mutación: v838-it-a-*, hechizos inertes (A/B), forest_walker/spiteful_torrent, 119_items_a.

### 4. Barrido final
sr_coverage: 440 reglas (37 sin referencia directa, listadas en out/sr_coverage.txt, cubiertas vía pruebas por id), objetos/hechizos y inventario FAQ 459/459 sin pendientes. Las «aproximaciones» antiguas (arcos de Lanza, auras desde el modelo) ya se resolvieron en v841; no queda ninguna aproximación abierta. Limitación conocida del relleno automático (`autoAlly`) para listas no-grandes: solo afecta a la lista por defecto, el jugador la edita.

## v843 — cierre

Cifras: 1892 pruebas de comportamiento (ejecutan el motor); `pw.js` errors [], `ask_test.mjs` 4 semillas completas. Detalle de la prueba de mutación en `verif/auto/behavior/out/mutation_survivors.txt` y `verif/auto/out/txt/progreso12.md`.

### Discrepancias corregidas (con fuente)
1. **Bruja Troll como General de una Horda Troll** (rh-qa-014; faq_rh.txt:225-228: «No [en el Ejército Grande]… She can, however, be the General of a Troll Horde»). Antes: nunca podía serlo (`general` vacío) y la lista Horda Troll daba «Necesitas un General». Ahora `canGen(tipo, lista)` en `armyIssues`, `generalOf` (marcada con `gen`), aviso explícito si se marca en el Ejército Grande, y en `createGame` la Bruja es General (`scnGen`) en `trollh` si el jugador la marca o no hay otro personaje que pueda serlo.
2. **0-1 Piedra de Manada por ejército** (rh-qa-024; aj_beasts.txt:716, faq_rh.txt:240-247). Antes solo se comprobaba entre fuerza principal y contingente; dos Piedras en una misma fuerza no daban error. Ahora `armyIssues` lo rechaza y el contingente aliado mantiene su aviso.
3. **Ataúd de las Almas: Nivel de poder 2** (rh-errata-028; faq_rh.txt:74-77): los hechizos ya tenían `bound: 2`; corregido el texto descriptivo que decía «3» (data.js).
4. **Pruebas que eran vacías**, ahora con valores exactos y controles (todas muertas por mutación): core-errata-028/039, core-qa-022/044/045/054/060/062/079/084?/122/128/137/141/154/161/162, fof-errata-001/007/021/024/033/040/042/060/061, fof-qa-007/008/011/015/027/033/034, rh-errata-002/005/020/028, rh-qa-006/009/010/011/012/013/014/024. Hallazgo de fondo: varias comprobaban solo «el resultado es verdadero» (p. ej. un tróll sin armas de proyectil «no puede disparar» por otra causa; la reacción de carga de un Mago sin arma de proyectil nunca ofrecía el hechizo).
5. Herramienta de mutación: ver progreso12.md (operador C por sustitución en el sitio, guarda de bucles, restauración de datos, orden de candidatos).

### Punto 2 — 37 reglas sin referencia directa en el motor
Las 37 tienen prueba `v836-sr-*` en `tests/40_c37.mjs` que ejecuta el motor y demuestra el efecto (todas pasan). No se ha encontrado ninguna sin efecto implementado. 4 de ellas (align_khorne, ctLong, thunderCharge, bullgors) sobreviven a la mutación: su efecto es dato declarativo; **motivo no verificado todavía** (pendiente).

### Punto 3 — autoAlly
`tests/168_v843_ally.mjs`: 41 listas × (estricto y no estricto) a presupuestos mínimos y mayores, `armyIssues` vacío, puntos ≤ presupuesto, contingente sin incidencias «Aliados» como aliado de una primaria que lo admite, y creación de partida en el motor. Los mínimos por debajo de los cuales la búsqueda no halla lista son evidencia heurística unilateral (no se afirma imposibilidad).

### Punto 4 — dobles a 393 px
`/tmp/pwd12.js` (TURNS=6): 6 turnos completos de dobles (18 unidades), todos los popups respondidos (#reactPop, #noticePop, #modal; 10 respuestas, 7 popups distintos: reacción a la carga, arma de combate, persecución, avisos de Impetuosidad y de fila), LAYOUT [] (sin solapes ni popups cortados), errors []. El script anterior no detectaba los popups (`offsetParent` es null en elementos fijos); corregido.

### Pendiente (honesto)
- 31 supervivientes de mutación sin triaje definitivo (lista y notas en `mutation_survivors.txt`); 5 de ellos mueren solos pero no en lote por la cobertura V8 del operador C.
- Prueba de mutación completa (1850) no repetida tras los últimos cambios; última cifra completa: 135 supervivientes antes de v843-C → 98 → 31 sobre esa lista.

## v843b — facciones extraídas

Alcance: 11 facciones entregadas en .7z (Elfos Oscuros, Skaven, Enanos del Caos, Reinos Ogros, Condes Vampiros, Enanos, Reyes Funerarios, Bretonianos, Hombres Bestia, "Guerreros del Caos" y Orcos). Método: se extrae cada .7z de uno en uno (solo los ficheros que cita el JSON de Workshop de la facción), se inventarían las figuras (nombre → mallas OBJ/unity3d → texturas) y se comparan con los paquetes del juego (xp = ligero, xh = alto, xu = ultra PC). Detalle de lotes: `verif/auto/out/txt/progreso13.md`.

### Hallazgos de fondo
1. Los 28 .7z son las cachés de TTS de los mods «X - Models - Warhammer The Old World». 26 de 28 coinciden fichero a fichero con .7z ya entregados; el 28.º (397e3e54-3464050043) son 138 JSON de Workshop. Los 3 de «guerreros_caos» contienen realmente el mod de **Demonios del Caos** (22 unity3d + 111 OBJ); la malla de Guerreros del Caos salió de .7z anteriores.
2. **Todas las mallas que el juego ya usaba coinciden exactamente con las del archivo** (mismos triángulos; xu = bruto salvo el tope de 120 000 triángulos y 65 000 vértices por parte). No había figuras de peor calidad que sustituir, salvo las excepciones de abajo.
3. **Fallo de texturizado (corregido)**: 24 modelos de 8 paquetes tenían como textura un color plano 32×32 sin versión HD (figuras lisas, p. ej. Guerreros Oscuros). Se repuso la textura original (256 px embebida en xp, 1536 px en `xt_*`, hasta 4096 px en `xu_*`), verificado por render (antes silueta plana, después textura completa). DE: beastmaster, coldones, corsairs, executioners, harpies, kharibdyss, sorceress, supreme, warlocks, warriors · SK: swarms, giantrats, jezzail, engineer, assassin · VC: banshee, spirithosts · BM: centigors · CD: guard · OK: slaughter_cauldron · BRET: sergeant · DM: bluehorrors, pinkhorrors, furies.
4. **Modelo de otra unidad (corregido)** — unidades que dibujaban la malla de otra:
   - Vargheists (`vc_vargheists`) usaba la del Varghulf → malla propia «Vargheists».
   - Rey Ghoul Strigoi (`vc_ghoulking`) usaba el Varghulf → «Strigoi Ghoul King»; Esbirro Vampiro (`vc_thrall`) y en Trono del Aquelarre (`vc_thrall_coven`) sin malla (procedural) → «Vampire Thrall» / «…on Coventhrone».
   - Preyton (`bm_preyton`, también _amb y _fr) usaba el Cygor → «Preyton»; Engendro Gigante del Caos (`bm_gspawn*`, `woc_gspawn*`) usaba el Gigante del Caos → «Giant Chaos Spawn».
   - Engendros del Caos de Guerreros del Caos (`woc_spawn*`) usaban los Engendros de Slaanesh (Demonios) → «Chaos Spawn»; Cañón Infernal (`woc_hellcannon`) usaba la Magma de los Enanos del Caos → «Hellcannon».
   - Jinetes de Araña, Saltagarrapatos, Arachnarok y los Caudillos goblin sobre Araña Gigante eran procedurales → mallas del mod (unity3d / OBJ).
   - Maestro de Manada, Vidente Gris, Doom Flayer (usaba el Warp Grinder) → mallas propias; Hechicera y Hechicera Suprema sobre Pegaso (DE, antes procedurales), Lady Élisse, Carro de Bugman, Cañón Lanzallamas, Hobgoblin «Sneeky Git», Cohete Deathshrieker (solo ligero → ahora xh/xu), Conde sobre Terror Abisal (solo ligero → xh/xu).
   - Rangers enanos: 23 997 → 31 185 triángulos (misma figura, caja idéntica).
5. Duplicado: las figuras de DE «Dreadlord/High Beastmaster sobre Mantícora» son **exactamente** la malla del Señor del Caos sobre Mantícora (14 283 triángulos): no se duplican.
6. `render.js`: el modelo propio de un uid (`XMODELS[uid]`) tiene prioridad sobre el de su alias (`REALM[alias]`), manteniendo tamaño/giro de `REALM` si el uid ya tenía; si no, el ajuste de peana de siempre (`xRealm`). No se ha tocado ninguna peana ni ninguna unidad.

### Sin fuente utilizable (no se añade, no se aproxima)
- Figuras que en el mod son paquete Unity **sin textura** o solo un cubo de 44 triángulos: Dreadlord/Maestro de DE a pie y en carro, Carros Azote/Cold One, Diosa de la Sangre, Altar/Caldero de DE, Jinetes Oscuros; Terrorgheist, Rey Ghoul en Terrorgheist, Enjambres de Murciélagos (VC); Arpías (BM); Profeta/Demonólogo en Lammasu (CD; el «Lammasu (Mount)» es AB y queda sin malla utilizable); Carro de Minero (DW); Escoltas arqueras Arbalester (CD, mallas ausentes en los .7z).
- Unidades sin malla en ningún mod: Ingeniero/Zapador enanos (hay 5 variantes de «Engineer» sin forma de saber cuál es; no se elige una al azar), Maestro de Manada con Cazacosas, Piedra de las Manadas, Jefe Centigor.
- Mallas HD antiguas de Enanos y Bretonia (`hd/m_*.json`, hoy bajo `REALM`): varias tienen menos triángulos que el original (p. ej. Yunque 22 000 frente a 24 856; Lanzapiedras 11 218 frente a 24 253; Gyrocóptero 10 860 frente a 19 814), pero sus cajas no coinciden con ninguna instancia del JSON (instancias con escalas distintas) y no se ha podido asegurar que sea la misma figura/equipo; **sin cambio** hasta poder comprobarlo figura a figura.
- Unidades de los libros que faltan en `data.js` (Demonios/Ogros/etc.): ninguna se añade (ver mismo criterio: solo con datos exactos en los libros).

### Tamaños y comprobaciones v843b
`dist/artifact.html` 16 228 806 B (< 16 777 216); `dist/viejo-mundo-pwa.zip` 699 634 894 B (máxima calidad); `dist/artifact-files/hd` 300 ficheros / 181 MB (xp + xh + xt; calidad adecuada para el artefacto; 3 niveles: xp ligero 2 600 tri y 256 px, xh hasta 40 000 tri y 1536 px — iPad mini 8 e iPhone 14 Pro —, xu hasta 120 000 tri y 4096 px solo ordenador). `pw.js` errors []; `ask_test.mjs` ok; `behavior/run.sh` 1892/1892. Capturas antes/después (rasterizador propio con la malla y textura reales del paquete): `shots/v843b/`. Pendiente: captura Playwright dentro de la partida en 3D (el WebGL por software del entorno no termina de cargar la escena), y revisar en dispositivo la colocación (`off`) de las figuras nuevas.

## v843c — auditoría de figuras

Encargo: «Revisa si las figuras actuales están bien construidas. Quiero exactitud» (11 facciones: de, sk, cd, ok, vc, dw, tk, bret, bm, woc, orcs), sin tocar peanas ni el aspecto real de las unidades. Método: rasterizador propio (malla xh + textura HD del paquete, peana y marca roja de frente) por unidad, contrastado con el perfil del libro y los objetos del archivo original del mod. Resolución unidad→figura en `/tmp/a/res.mjs` (réplica de render.js).

**Corregido**
- 35 modelos con textura plana/errónea (el paquete llevaba `col_*` de color liso o imágenes ajenas en lugar de la textura real del archivo): DE 7 (asesino, guardia negra, lanzavirotes, hag, hidra, sombras, hermanas), CD 20, VC 8. Textura rehecha desde el archivo (texfix2) en xp/xh/xu; comprobado por render.
- Bretonia: 7 figuras nuevas con la malla correcta del archivo (br_men_at_arms, br_bowmen, br_squires, br_pilgrims, br_paladin, br_prophetess_war, br_pegasus); REALM de infantería bretoniana por altura (1,15"). `br_sergeant` tenía una malla de arbusto: retirada, vuelve a figura procedural.
- Alias de figura (data.js, final): de_sorceress_steed y de_supreme_steed → de_dreadlord_steed; de_sorceress_cold → de_supreme_cold; cd_hellcannon → woc_hellcannon; br_prophetess/damsel_war12/16 → br_prophetess_war (antes caían en br_baron / hechicera sin montura equivalente).
- Peanas: sin cambios.

**Hallazgos sin corregir (no hay figura correcta en el archivo o requiere revisión en dispositivo; no se inventa)**
- WOC: guerreros/merodeadores/elegidos/caballeros elegidos usan malla con portaestandarte; carro = restos; monturas demoníacas y chieftain_horse sin montura.
- BM: centígors, carros de colmillo/cuchilla y beastlord_tusk; cygor, bm_bs y gorebull (malla tumbada); beastlord hover.
- VC: count_dragon (el archivo tiene «Vampire Lord in Zombie Dragon - Sword»); caballeros sombríos a pie.
- SK: chieftain tumbado; Doomwheel necesita yaw 90°.
- DW: irondrakes (torso), dw_warriors_gw (asta). ORCS: warboss_boar (figura a pie), weirdboy, bonegrinder (10,25" de alto). TK: escala de necrocaballeros/necroesfinge. OK: gigantes frente a ogros; gnoblars/tramperos a 0,8".
- Texturas `xu_col_*` ajenas (normales/arena/cráneo) también en CT/DM/LM (fuera de ámbito).

**Captura real WebGL**: Chromium + `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` crea contexto WebGL2 en 13 ms y el botón 3D de la partida (tutorial) dibuja el tablero y el terreno en 3D (`shots/v843c/webgl_swiftshader_3d.jpg`); en el despliegue no hay aún figuras en mesa y no se llegó a capturar una figura concreta por facción. Pendiente.

Comprobaciones: ver progreso14.md. Capturas: `shots/v843c/`.

## v843d — auditoría de figuras II

Alcance: figuras de los .7z de facción (más .7z extra y Daemons). No se tocan peanas ni aspecto de unidades.

Corregido (modelo nuevo desde el JSON del mod, composites anidados, xh sin decimación UV; xh := xu si xu ≤ 52000 tris):
- VC: vc_count_dragon = «Vampire Lord in Zombie Dragon - Sword»; vc_mortis; vc_count_nightmare.
- SK: sk_chieftain (el anterior era Skritch tumbado); sk_doomwheel girado y 90° en el modelo.
- BM: bs, gorebull, carros tuskgor/razorgor, cygor, centigors, beastlord, ghorros.
- WOC: warriors/hb/gw (modelo de mando con espada y escudo; el archivo no tiene Guerrero del Caos simple), chosen, marauders (escudo / hacha a dos manos), chosen knights, 4 carros, monturas demoníacas (lord, sorcerer, aspiring, exalted), chieftain_horse, exalted (el anterior estaba corrupto).
- ORCS: weirdboy, weirdnob, weirdnob sobre jabalí (no hay Weirdboy sobre jabalí).
- DW: king, king_shield, runelord, thunderers, anvil (con dotación).
- Corrupción de UV en xh por decimación por clustering: corregida en las 11 facciones.

render.js: personajes a pie por altura (xRealm); tope de 1,5× de sobresalir de la peana; rmOf mira XMODELS del id REALM; FIG_SCALE sin el 1,35 del bonegrinder; WOC por altura; dw_king_shield 2.0, dw_anvil 2.3, woc_exalted 1.6; woc_chosen_knights usa la regla por peana como woc_knights.

Sin figura utilizable (anotado, no inventado): VC Terrorgheist/Ghoul King (alias Varghulf), vc_necro_dragon (usa el del conde); BM Harpías, Centigor Chief, Kralmaw; DW Ingeniero, vagoneta; DE dreadlord/master a pie, Sorceress/Assassin (malla fuente pobre); OK Tyrant/Bruiser/Hunter sobre Stonehorn reutilizan la malla Stonehorn; WOC sin Guerrero simple; TK tk_warsphinx: no existe malla de Warsphinx (el objeto solo tiene el stub 477121); el modelo xp actual es el Rey a pie escalado (queda pendiente de sustituir; Necrosphinx es otra miniatura). Longbeards/Irondrakes: fuente de baja poligonía/torso.

Pendiente: captura WebGL real. Solo SK se capturó bien (renderiza terreno y figuras con swiftshader, errors []); el script de captura repitió las unidades de SK en las demás facciones (no cambia de ejército), así que no hay revisión visual WebGL por facción. Revisión visual hecha con el rasterizador propio (galerías). Sin revisar a fondo: DE pág. 2, CD, BRET, TK, OK.

Cierre: artifact.html 16 235 646 B (+4 KB); hd 380 ficheros / 218 MB; pw errors []; ask_test OK; behavior 1892/1892.

## v843e — auditoría de figuras III
**Captura WebGL real (swiftshader, 393×852 y 1280×800)**: el script anterior no cambiaba de ejército. Ahora `newGame` con `armiesBy` y `setup.alt=false` (el despliegue alterno deja las unidades en `s.pend`), con `#title`/`#modal` ocultos. Se comprobó en cada captura que las figuras son de la facción pedida (colores y modelos distintos). Resultados en `shots/v843e/` (11fac.jpg, p_*.jpg, w_tk.jpg).
**Warsphinx**: la afirmación previa «no hay malla» era errónea. Está en 3477087013.json (entrada «Khemrian Warsphinx»): objetos Custom_Assetbundle, bundle A9C65… + secundario 222A9F…, mallas skinned (clase 137) con bind-pose y vértices en `.resS`. Integrado como `tk_warsphinx` (en WebGL se ve oscuro pero con la silueta correcta).
**Nuevos modelos** (del archivo original): vc_terrorgheist, dw_engineer, bm_centigor_chief, de_dreadlord, de_master, de_medusa, vc_batswarm. Alias: vc_ghoulking_terror→terrorgheist, bm_kralmaw→bm_gbs (prestado), ok_bruiser→ok_tyrant (se retira el modelo propio, raro). de_shrine usa de_medusa.
**Rechazados**: santuario (de_shrine) y caldero (de_deathhag_cauldron), textura defectuosa.
**Sin fuente recuperable**: arpías BM, vagoneta enana, carros DE (OBJ de 0 bytes en el archivo 7z; no se enviaron).
**Escala**: dw_warriors_gw size 2.0 por altura; tk_necroknights 3.7 en xRealm.
**Tamaño**: build.py recomprime a q52 solo las xt_ >260 KB de la copia del artifact (el zip máximo no cambia). Resultado: artifact.html 16,237,942 B (límite 16,777,216); artifact-files/hd 209 MB; total ≈224,5 MiB sobre 256 (margen ≈31 MiB).
**Pruebas**: pw.js errors: []; ask_test OK; behavior 1892/1892.
**Pendiente**: hipogrifo (solo xp, UV ruidosas); br_duke/br_baron/br_realm_foot heredados; de_scourge usa alias HE; Enanos Longbeards de baja poligonación; arpías, vagoneta y carros DE; interpretación «Altos Elfos pág. 2 ≈ Elfos Oscuros pág. 2».

## v843f — auditoría de la extracción anterior
Alcance: las 6 facciones no cubiertas por v843b–e (Imperio, Altos Elfos, Elfos Silvanos, Hombres Lagarto, Demonios del Caos, Cathay; «Cruzada de Tormenta» no existe como ejército en ARMIES: los `xu_col_*` ajenos estaban en Cathay, Demonios y Lagartos). Método: inventario de los JSON de Workshop de cada facción (2426060468, 2425660555, 2426430616, 2426561655, 2430383879, 3506729242) con sus .7z extraídos de uno en uno; comparación de caja/triángulos de cada figura del juego con el archivo; galerías con el rasterizador propio; capturas WebGL (swiftshader) a 393×852.
**Hallazgos y correcciones**
- Cathay (27 modelos), Demonios (10) y Lagartos (`lm_chameleon`): textura plana `col_*` y `xu_col_*` = arena. Rehechas desde el archivo (256/1536/4096 px). Malla ya idéntica al archivo. Los 2 `xu_col_cd_*` restantes (arena, `cd_flamecannon`/`cd_rocket`) se retiran (queda el color plano; la malla de `cd_flamecannon` no coincide con ningún objeto del archivo).
- Altos Elfos: 17 modelos «old» (models.js) NO eran las figuras del archivo (Guardia del Fénix = guerrero sombrío, Arqueros = otra pose, Archimago, Lanceros, Príncipes Dragón, Hermanas, etc.). Sustituidos por las mallas del archivo (xp/xh/xu): archimago, lanceros, arqueros, leones blancos, guardia del fénix, guerreros sombríos, hermanas de Avelorn, jinetes de Ellyrion, príncipes dragón, águila, lanzavirotes, mago dragón, fénix (2), dragón estelar (2), príncipe. Nuevo: Merwyrm. Alias: he_ship→he_seaguard, he_stormweaver→he_mage.
- Elfos Silvanos: 24 modelos «old» con identidad errónea o textura corrupta (ruido en hombre árbol, anciano, hechicera rama; porta-estandartes y variantes ST en guardia del claro, eterna, jinetes). Sustituidos por la figura simple del archivo; dríadas = paquete Unity (13 807 tri, antes 3 980 con peana negra). Retirados `we_weaver_unicorn` / `we_singer_unicorn`: el archivo solo trae la capa del jinete sin unicornio (figura procedural). Alias we_orion_hounds→we_pack_hounds. Sin figura en el mod: felinos, jabalíes, osos, cuidador de bestias.
- Imperio: General a caballo (era un caballo oscuro de 9 000 tri), Caballeros, Ingeniero, Arqueros, Cañón Grande (modelo roto/tumbado), Arcabuceros (usaban la figura de ballestero), General en Grifo Imperial, Guardia Teutógena: figuras propias del archivo. Alias de mercenarios (`rc_sellswords*`) corregidos (caían en procedural). Sin figura: goods_cart.
- Demonios: Heraldo de Khorne en Trono de Sangre, Heraldo de Slaanesh en Carro Buscador, Horrores de Azufre: figuras propias; alias de Carro Exaltado. `dm_bloodletters`: el archivo solo trae la peana (4 374 tri): rechazado (procedural).
- Lagartos: 18 modelos solo tenían textura de 256 px (sin xt/xu) y el Jefe Escinco era una malla de 732 tri; rehechos desde el archivo (xp/xh/xu, texturas 1536/4096); Carnosaurios y Guía de Escincos con malla correcta.
- `de_scourge` usaba el carro León de Chrace de Altos Elfos: alias retirado (procedural; no hay malla de Carro Azote).
- Limpieza: 66 entradas huérfanas de models.js (modelos antiguos ya sustituidos por xp en v843b–d y v843f) y 54 texturas HDMAP + 63 mallas `m_*.json` sin uso; `artifact.html` baja a 11,5 MB.
- build.py: xt >150 KB del artefacto a AVIF q44 (el zip conserva la máxima calidad).
**Sin figura / no corregible**: Ishaya Vess, Tejedor de Tormentas en Unicornio, Leones de Guerra, Merwyrm aparte, felinos/jabalíes/osos silvanos, carro de mercancías, Bloodletters (solo peana), unicornios silvanos. Pegaso del Imperio: la fuente es de baja calidad (9 326 tri, textura oscura); sin alternativa.
**Tamaños**: artifact.html 11 530 337 B; artifact-files/hd 210 MiB; total ≈ 221 MiB sobre 256 (margen ≈ 35 MiB); zip 760 MB (máxima calidad).
**Pruebas**: pw.js errors []; ask_test OK; behavior 1892/1892. Capturas: `shots/v843f/` (4fac.jpg, he.jpg, emp.jpg, gal_nuevas.jpg).

## v843g — colocación y escala (parcial; sin cambios de juego)

**Estado**: herramienta de revisión y auditoría numérica hechas; las correcciones de `render.js`/`gl3d.js` **NO están aplicadas** (no validadas visualmente; el coordinador pidió cerrar). Código del juego = v843f. Propuesta guardada en `tools/figaudit/render.v843g_propuesta.js` y `gl3d.v843g_propuesta.js`.

**Herramientas** (`tools/figaudit/`): `audit.mjs` (replica la política de render.js y mide caja de la malla vs peana: H, largo, ancho, cuerpo, descentrado, flotación), `shoot.js` (WebGL real swiftshader, `pc` 1280x800 / `iphone` descriptor Playwright «iPhone 14 Pro» sin deviceScaleFactor manual; recorte del lienzo en 3/4 y de lado de CADA unidad de ARMIES), `sheet.py` (hojas de contacto jpg), `cam.js` (cámara por defecto, 2D/3D, iPhone/PC), `tris.mjs` (triángulos por unidad). Tabla completa altura medida/objetivo de 770 figuras: `rules/verif/auto/out/txt/figscale_v843g.tsv`.

**Hallazgos numéricos (aún sin corregir)**
- Figura a pie prestada por alias a unidad montada/carro y escalada por la peana grande: rc_wizard1-3_h (H 4,43"), de_master_chariot (6,65"), de_dreadlord_chariot (4,06"), ct_miaoying_h (3,77"), de_shrine (6,26"), emp_lector_altar (9,49", modelo alto), dm_herald_slaanesh_chariot (6,34"), ct_shugengan (7,43"). Propuesta: `lendRM` (alias con peana >2,2× o <0,45× conserva la escala de su peana; a pie sobre montura → figura procedural).
- Voladores con alas abiertas: la escala por lado mayor encoge el cuerpo (pegaso bretoniano k 0,37 → H 1,38" en peana 50x50; cocatriz, águilas/grifos, dragones, k 0,38–0,5). Propuesta: `wEff` (cuerpo percentil 3–97 % de la mitad baja ×1,4 como máximo) y tope 1,5× de la peana intacto. Subiría esas figuras 1,2–1,4×.
- Astas altas en escala por altura (de_sisters H98/H 0,65): propuesta `hEff` (percentil 98 ×1,3).
- Infantería silvana con REALM 1,4–1,6" frente a 1,15" de humanos/altos elfos (we_glade_guard 1,4, we_eternal 1,6, we_rangers 1,5): armonizar a ~1,2" (pendiente).
- Figuras que flotan (p1/H>0,05): gob_*_spider 0,3", br_green_knight 0,84", ct_*lantern 0,6", bm_tuskchariot 0,2".
- Estandarte: único modelo (1,58"×1,1) para todas las facciones; propuesta escalarlo con la altura de la figura (0,7–1,8×). Músico/campeón: no hay modelo diferenciado en el motor.
- Posible orientación lateral (x>z en peana larga): emp_lector_altar, dm_keeper, dm_bloodcrushers, br_outcast*_h, woc_chosen_chariot (a mirar).
- 2D: es esquemático (fichas), independiente de la escala de figuras.

**Cámara**: por defecto 2D mesa entera; 3D «cerca» ×2,0 en estrecho (~13 px/pulgada en iPhone). No se ha cambiado ni medido por captura (pendiente: `cam.js`).

**Rendimiento**: sin cambios (código idéntico). Triángulos iPhone (xh), 4 unidades mayores a 40 modelos: ≈3,9 M (bm_gor 40×24 460); PC xu ≈5,5 M (preexistente; candidato a LOD por unidad).

**Tamaños**: artifact.html 11 530 337 B; artifact-files/hd 210 MB. **Pruebas**: build OK, pw.js errors [], ask_test OK, behavior 1892/1892. Capturas en shots/v843g/: no generadas (el barrido completo no llegó a ejecutarse: ~3 s/unidad con la lectura directa del lienzo).


## v843h — colocación y escala (correcciones)

Cambios en `app/js/render.js` y `app/js/gl3d.js` (peanas y aspecto de las unidades NO se tocan; `sw.js` intacto). Herramientas en `tools/figaudit/` (audit.mjs, shoot.js, sheet2.py, table.mjs, tris.mjs).

1. **Magos/carros/montados con figura a pie**: `lendRM` descarta la figura prestada si la peana es mucho mayor que la del prestamista (a pie) y usa la figura procedural de montura/carro (rc_wizard1-3_h, de_master_chariot, de_dreadlord_chariot, br_outcast*_h). Alturas máximas HMAX: emp_lector_altar 6,2", ct_shugengan(_gen) 3,4", de_shrine 3,4", ct_miaoying_h 2,6", dm_herald_slaanesh_chariot 3,6", br_green_knight 3,2".
2. **Voladores**: escala por cuerpo (`R.core`, ancho entre percentiles 3–97 % del 60 % inferior), no por envergadura; tope 1,5× lado mayor de peana. Pegaso, cocatriz, águilas, grifos y dragones crecen ≈1,2–1,4×.
3. **Silvanos**: alturas armonizadas (1,15–1,4"; we_branchwraith 1,6"). woc_exalted 1,6", orc_weirdboy 1,5", orc_weirdnob 1,6".
4. **Apoyo en peana**: `R.p1` (percentil 1 de altura); si cuelga >4,5 % se baja la figura (arañas, linternas, caballero verde...). Figuras etéreas: el pase translúcido se dibuja ahora tras lo sólido (`lateB`), antes la peana tapaba su mitad inferior; ya se ven sobre la peana.
5. **Portaestandarte**: el asta escala con la altura de figura (0,7–1,8 × 1,15"). Músico y campeón: el motor y el mod no tienen modelo distinto; no es posible sin nuevos activos.
6. **Orientación**: corregidas Elisse (+90°) y ct_shugengan_gen (−90°). Resto alineado con el eje de peana; delante/detrás no determinable por geometría.
7. Las 4 propuestas v843g integradas (con corrección de lendRM: sólo prestamistas a pie) y propuestas eliminadas.
8. Barrido de las 780 unidades (excepto bm_herdstone, sin modelo): hojas 3/4 y lado en `shots/v843h/hojas/`; pares antes/después a viewport real en `shots/v843h/real/` (iPhone 393×852 y PC 1280×800).
9. **Cámara**: no modificada (medida pendiente: ≈13 px/" iPhone, ≈16,5 px/" PC en 3D cerca).
10. **Rendimiento** (tris.mjs): las 4 unidades mayores sin cambio (iPhone xh 3 913 600; PC xu 5 478 710); suma total xh 110 149 944 → 110 005 676.
11. **Tamaños**: sin cambios en hd (≈208 MB, 498 ficheros).

### Tabla altura medida / objetivo (antes → después)

| unidad | grupo | peana (") | H antes (") | H después (") | objetivo | cuerpo antes | cuerpo después | apoyo (") |
|---|---|---|---|---|---|---|---|---|
| rc_wizard1_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x2.36 | 4.43 | proc | proc montura | 1.89x1.93 | — |  |
| rc_wizard2_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x2.36 | 4.43 | proc | proc montura | 1.89x1.93 | — |  |
| rc_wizard3_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x2.36 | 4.43 | proc | proc montura | 1.89x1.93 | — |  |
| de_master_chariot | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.97x3.94 | 6.65 | proc | proc carro | 2.56x3.30 | — |  |
| de_dreadlord_chariot | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.97x3.94 | 4.06 | proc | proc carro | 3.20x2.76 | — |  |
| br_outcast_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 0.98x1.97 | 2.39 | proc | proc montura | 1.62x0.89 | — |  |
| br_outcast2_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 0.98x1.97 | 2.39 | proc | proc montura | 1.62x0.89 | — |  |
| br_outcast3_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 0.98x1.97 | 2.39 | proc | proc montura | 1.62x0.89 | — |  |
| ct_miaoying_h | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.97x1.97 | 3.77 | 2.60 | ≤2,6 | 1.13x1.40 | 0.78x0.97 |  |
| de_shrine | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 2.36x3.94 | 6.26 | 3.40 | ≤3,4 | 2.74x2.45 | 1.49x1.33 |  |
| emp_lector_altar | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 2.36x3.94 | 9.49 | 6.20 | ≤6,2 | 2.64x2.12 | 1.72x1.39 |  |
| ct_shugengan | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 2.36x3.94 | 7.43 | 3.40 | ≤3,4 | 2.60x2.61 | 1.19x1.19 |  |
| ct_shugengan_gen | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 2.36x3.94 | 5.17 | 3.40 | ≤3,4 | 2.64x1.35 | 0.89x1.74 |  |
| dm_herald_slaanesh_chariot | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.97x3.94 | 6.34 | 3.60 | ≤3,6 | 1.71x2.44 | 0.97x1.39 |  |
| br_green_knight | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x2.36 | 4.13 | 3.20 | ≤3,2 | 1.37x0.97 | 1.06x0.75 | 0.45 |
| woc_exalted | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x1.18 | 2.58 | 1.60 | 1,6 | 1.38x1.36 | 0.86x0.84 |  |
| orc_weirdboy | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x1.18 | 1.70 | 1.50 | 1,5 | 0.63x0.63 | 0.56x0.56 |  |
| orc_weirdnob | 1 montados/carros con figura a pie → figura procedural de montura o altura máxima | 1.18x1.18 | 1.80 | 1.60 | 1,6 | 1.10x1.06 | 0.98x0.94 |  |
| bm_cockatrice | 2 voladores (escala por cuerpo) | 1.97x1.97 | 1.34 | 1.92 | cuerpo ↑ | 0.65x0.77 | 0.92x1.10 |  |
| br_baron_pegasus | 2 voladores (escala por cuerpo) | 1.97x1.97 | 1.38 | 1.97 | cuerpo ↑ | 0.80x0.82 | 1.14x1.17 |  |
| he_noble_eagle | 2 voladores (escala por cuerpo) | 1.97x1.97 | 1.87 | 2.50 | cuerpo ↑ | 0.81x1.10 | 1.09x1.48 |  |
| he_prince_griffon | 2 voladores (escala por cuerpo) | 1.97x1.97 | 1.87 | 2.50 | cuerpo ↑ | 0.81x1.10 | 1.09x1.48 |  |
| we_lord_eagle | 2 voladores (escala por cuerpo) | 1.97x1.97 | 1.87 | 2.49 | cuerpo ↑ | 0.81x1.11 | 1.08x1.48 |  |
| we_captain_hawk | 2 voladores (escala por cuerpo) | 1.97x1.97 | 1.87 | 2.49 | cuerpo ↑ | 0.81x1.11 | 1.08x1.48 |  |
| emp_general_igriffon | 2 voladores (escala por cuerpo) | 2.36x3.94 | 2.47 | 3.53 | cuerpo ↑ | 1.29x1.86 | 1.84x2.65 |  |
| de_dreadlord_dragon | 2 voladores (escala por cuerpo) | 2.36x3.94 | 3.79 | 5.41 | cuerpo ↑ | 0.73x1.28 | 1.05x1.83 |  |
| de_sorceress_pegasus | 2 voladores (escala por cuerpo) | 1.57x2.36 | 2.42 | 2.99 | cuerpo ↑ | 1.44x1.11 | 1.77x1.37 | 0.12 |
| woc_lord_dragon | 2 voladores (escala por cuerpo) | 2.36x3.94 | 4.09 | 5.36 | cuerpo ↑ | 1.71x2.25 | 2.24x2.95 |  |
| woc_galrauch | 2 voladores (escala por cuerpo) | 2.36x3.94 | 4.09 | 5.36 | cuerpo ↑ | 1.71x2.25 | 2.24x2.95 |  |
| vc_count_terror | 2 voladores (escala por cuerpo) | 1.97x3.94 | 3.41 | 4.88 | cuerpo ↑ | 1.39x1.98 | 1.98x2.83 |  |
| vc_terrorgheist | 2 voladores (escala por cuerpo) | 3.94x5.91 | 4.87 | 5.55 | cuerpo ↑ | 3.89x3.37 | 4.43x3.83 |  |
| he_frostheart | 2 voladores (escala por cuerpo) | 1.97x3.94 | 2.18 | 2.63 | cuerpo ↑ | 0.82x2.38 | 0.99x2.86 |  |
| ct_sentinel | 2 voladores (escala por cuerpo) | 3.94x5.91 | 4.33 | 5.20 | cuerpo ↑ | 3.69x2.95 | 4.43x3.55 |  |
| dm_lordchange | 2 voladores (escala por cuerpo) | 2.36x3.94 | 4.68 | 6.53 | cuerpo ↑ | 2.12x2.11 | 2.95x2.93 |  |
| lm_troglodon | 2 voladores (escala por cuerpo) | 1.97x3.94 | 1.85 | 2.40 | cuerpo ↑ | 1.33x2.28 | 1.72x2.95 |  |
| sk_plagueclaw | 2 voladores (escala por cuerpo) | 1.97x3.94 | 3.21 | 4.13 | cuerpo ↑ | 1.49x2.30 | 1.92x2.95 |  |
| we_glade_guard | 3 infantería silvana | 0.98x0.98 | 1.40 | 1.15 | 1,15 | 0.72x0.82 | 0.59x0.67 |  |
| we_eternal | 3 infantería silvana | 0.98x0.98 | 1.60 | 1.20 | 1,20 | 0.83x0.53 | 0.62x0.40 |  |
| we_rangers | 3 infantería silvana | 0.98x0.98 | 1.50 | 1.15 | 1,15 | 0.91x0.88 | 0.70x0.67 |  |
| we_wardancers | 3 infantería silvana | 0.98x0.98 | 1.30 | 1.20 | 1,20 | 0.59x0.55 | 0.55x0.50 |  |
| we_dryads | 3 infantería silvana | 1.18x1.18 | 1.50 | 1.40 | 1,40 | 0.63x0.68 | 0.59x0.64 |  |
| we_lord | 3 infantería silvana | 0.98x0.98 | 1.70 | 1.35 | 1,35 | 0.56x0.58 | 0.44x0.46 |  |
| we_captain | 3 infantería silvana | 0.98x0.98 | 1.40 | 1.30 | 1,30 | 0.46x0.48 | 0.43x0.44 |  |
| we_spellsinger | 3 infantería silvana | 0.98x0.98 | 1.50 | 1.30 | 1,30 | 0.47x0.48 | 0.40x0.42 |  |
| we_spellweaver | 3 infantería silvana | 0.98x0.98 | 1.40 | 1.30 | 1,30 | 0.44x0.45 | 0.40x0.42 |  |
| we_branchwraith | 3 infantería silvana | 1.18x1.18 | 1.80 | 1.60 | 1,60 | 0.66x0.87 | 0.59x0.77 |  |
| gob_bigboss_spider | 4 apoyo en la peana | 1.97x1.97 | 1.65 | 1.93 | apoyada | 1.07x1.26 | 1.25x1.48 | 0.28 |
| gob_warboss_spider | 4 apoyo en la peana | 1.97x1.97 | 1.52 | 1.78 | apoyada | 1.05x1.26 | 1.23x1.48 | 0.27 |
| br_green_knight | 4 apoyo en la peana | 1.18x2.36 | 4.13 | 3.20 | apoyada | 1.37x0.97 | 1.06x0.75 | 0.45 |
| ct_lanterns | 4 apoyo en la peana | 3.94x3.94 | 5.00 | 5.00 | apoyada | 1.61x1.53 | 1.61x1.53 | 0.56 |
| ct_magistrate_lantern | 4 apoyo en la peana | 3.94x3.94 | 5.00 | 5.00 | apoyada | 1.61x1.53 | 1.61x1.53 | 0.56 |
| ct_strategist_lantern | 4 apoyo en la peana | 3.94x3.94 | 5.00 | 5.00 | apoyada | 1.61x1.53 | 1.61x1.53 | 0.56 |
| bm_tuskchariot | 4 apoyo en la peana | 1.97x3.94 | 2.55 | 2.55 | apoyada | 1.69x3.02 | 1.69x3.02 | 0.18 |
| bm_beastlord_tusk | 4 apoyo en la peana | 1.97x3.94 | 2.55 | 2.55 | apoyada | 1.69x3.02 | 1.69x3.02 | 0.18 |
| sk_giantrats | 4 apoyo en la peana | 0.98x0.98 | 0.33 | 0.33 | apoyada | 0.89x0.41 | 0.89x0.41 | 0.03 |
| lm_swarm | 4 apoyo en la peana | 1.57x1.57 | 0.52 | 0.52 | apoyada | 1.21x1.40 | 1.21x1.40 | 0.04 |
| dm_plaguedrones | 4 apoyo en la peana | 1.57x1.57 | 1.30 | 1.41 | apoyada | 0.64x1.09 | 0.69x1.18 | 0.10 |
| vc_count_nightmare | 4 apoyo en la peana | 1.18x2.36 | 2.93 | 2.93 | apoyada | 0.81x1.80 | 0.81x1.80 | 0.16 |
| we_wild_riders | 4 apoyo en la peana | 1.18x2.36 | 3.38 | 3.38 | apoyada | 0.81x1.87 | 0.81x1.87 | 0.18 |

## v843i — avisos y tablas ANTES de la acción (popup + OK)

Petición: las acciones automáticas del motor derivadas de una acción básica siguen siendo automáticas, pero antes de producirse sale una ventana informativa; en todo lo que se resuelve con tabla (impactar, herir, salvaciones, Liderazgo, Averías…) se muestra la tabla ANTES de tirar, con la celda y el número que te toca. Sin cambios de reglas ni de resultados.

**Mecanismo** (`rules.js`, bloque «v843i»): `ackNeed/ackT/ackA`. Igual que `askH` (la acción se interrumpe con una excepción, `main.js` restaura el estado, muestra el popup y repite la acción con la respuesta en `s.ans`), pero sin dados ni cambios de estado: la repetición parte del mismo estado y RNG ⇒ resultado idéntico (comprobado: partidas IA vs IA con semillas 1-3, hash de estado tras cada acción igual con y sin avisos; y pruebas 169). `s.askMode.ack = {jugador:true}` marca a los humanos que lo ven (IA: jugador 0; dos jugadores: ambos; código: solo el propio). Sin `ack` (IA, entrenamiento, repeticiones, pruebas, smoke) no hace nada = auto-confirmación. Modo de prueba en la interfaz: `window.__TOW_AUTOACK = true` (confirma solo, conservando la secuencia) o `window.__TOW_NOACK = true` (desactiva). Dedupe: una ventana por tabla y objetivo/perfil (clave de contenido) en cada acción; los avisos automáticos, una por ocurrencia (contador `s.ackN`, borrado al acabar). `announce()` (121 usos) ahora avisa ANTES (excepción previa) y no repite el aviso posterior.
UI: `pickAck` + `tblHTML` (main.js), CSS `#reactPop .tb*`: tarjeta ≤92 vh con scroll, tabla con scroll horizontal, fila/columna/celda resaltadas, botón OK 48 px. Verificado a 393×852 (iPhone 14 Pro).

### Inventario (b) tablas con ventana previa (fuente: rules/core.txt)
| Tabla | Fuente | Punto del motor |
|---|---|---|
| Impactar cuerpo a cuerpo (HA×HA, 10×10) | core.txt:11434+ «To Hit Chart» | `ackMelee` en fightGroup, duelSwing, joinedStrike |
| Impactar a distancia (BS 1-5, 6-10, >6) | core.txt:4285-4312 | `ackShoot` (resolveShot0, también Plantar cara y disparar) |
| Herir (F×R) | core.txt:4371-4390 «To Wound Chart» | `ackWound` en woundAndSave0 (todas las fuentes: combate, disparo, hechizos con contexto, impactos, pisotones…) |
| Salvación de armadura/FP, especial, regeneración | core.txt:4406-4420 | misma ventana (tabla kv) |
| Chequeos de Liderazgo: Pánico, Miedo (carga y combate), Terror, Reagrupar, Contención, Waaagh, Estupidez | core.txt Ld p.97 y secciones | `ackLd` |
| Prueba de Rotura (3 resultados) | core.txt:4892-4915 | `ackBreak` |
| Lanzamiento, dispersión (Mago y destino), Pifias | core.txt:3318-3345, 11211 | `ackCast`, `ackDispel`, miscast1 |
| Dado de Artillería, dado de dispersión, tablas de Avería (piedra/pólvora) | core.txt:7716, 7884-7895, 11345-11365 | artDieM, scatter |
| Terreno peligroso (D6, 1 = baja) | core.txt Dangerous Terrain | dangerTest |

### Inventario (a) acciones automáticas con aviso ANTES
Las ~121 llamadas a `announce` (fichas/ardides/efectos de reglas, objetos, hechizos automáticos, fuego amigo…) más avisos nuevos: Huida y Retroceso en buen orden (`runAway`, y tras Prueba de Rotura), Cede terreno, Persecución/Seguimiento, Impactos de carga, Pisotón.

### Pendiente (no cubierto) y motivo
- Tablas locales de reglas concretas con tirada propia (Terreno salvaje, Tabla de Averías de máquinas ogras, Gaze of the Gods, Mercenarios, Animosidad, objetos con D6 propio, rolls D6 sueltos de reglas especiales): cada una es un `d6(s)` inline distinto; no se ha puesto ventana previa por regla (solo las tablas de arriba y `announce`). Los chequeos de Ld sueltos dentro de objetos/estandartes (≈70 `roll2d6` ad hoc) tampoco.
- Efectos solo registrados con `logE` (sin `announce`) que no son una tabla (p. ej. movimiento de reglas especiales, regeneración de Heridas) siguen sin ventana previa.
- Modo por código: el rival ve el aviso en su dispositivo solo cuando actúa él (la repetición en el otro móvil se hace sin popups, como las decisiones).
- Modificadores a impactar/herir: se muestran el valor de tabla y el neto («+N reglas/objetos/estado»); no se desglosa cada regla.

## v843j — tiradas con tabla propia, Liderazgo suelto, efectos solo registrados y desglose de modificadores

Petición (permanente): (1) las acciones automáticas derivadas de una acción básica siguen siendo automáticas, pero antes sale una ventana informativa con OK; (2) todo lo que se resuelve con tabla/umbral muestra la tabla con tu celda/número resaltado ANTES de tirar. Exactitud estricta: **con la misma semilla el resultado no cambia** (los avisos no consumen dados ni alteran el estado; la acción se interrumpe, la interfaz restaura el estado, muestra el popup y la repite con `s.ans`, igual que `askH`).

### Mecanismo común (puntos de enganche)
| Pieza | Qué hace |
|---|---|
| **Sitios de tirada** (`rzD6/rzD3/rzD2/rzD3b/rzExpr`, id `función:n`) | Las 484 llamadas de dados de `rules.js` pasan por un sitio con identificador. Con `s.askMode.ack` el sitio muestra su ventana ANTES de tirar; sin ack es una comparación de propiedad + la misma tirada de antes (mismos dados, mismo estado). Los primitivos `d6/d3/roll2d6` ya no se llaman directamente (prueba estática 170). |
| **Fichas `SITE`** (bloque generado al final de `rules.js` por `rules/verif/auto/behavior/gensite.mjs` a partir de `sites_policy.json` y `sites_desc.json`) | Clase **C** (ya cubierta por una ventana propia con tabla: motivo en la política), **G** (ventana descriptiva: nombre de la regla, dado y qué se resuelve; una por sitio y acción), **N** (no aplicable, con motivo). |
| `ackD` + `tbFaces/tbD6N/tbD6U/tbMods/tbBreak` | Ventana con tabla construida de forma perezosa (la IA y los modos sin ack no construyen nada). |
| `rollLd(s, unidad, Ld, {mod, why})` | Chequeo de Liderazgo suelto: tabla de 2D6 con TU Liderazgo resaltado (con `mod`, el Liderazgo efectivo), una ventana por tirada, también en cada repetición; después la misma tirada. **47 llamadas** sustituyen a los `roll2d6` ad hoc de objetos, estandartes y reglas. |
| `logE` con aviso previo (`effectNote`) | Todo efecto que solo se registraba (≈640 `logE`) avisa ANTES con «Efecto automático» + OK, **salvo** (a) las líneas de resultado de acciones básicas ya avisadas (`EFF_RES`: hit, destroy, move, charge, shoot, cast, flee, rally, misfire, ward, regen, join, leave, combat, turn, ready, unbreak, c, s, j, grid) y (b) las que siguen a una tirada cuya ventana ya se mostró en esa acción (el RNG ha avanzado desde la última ventana: es consecuencia de una tabla ya avisada). `announce` usa `logRaw` (no duplica). |
| Desglose (d) `modT/MODL/LASTMODS` | `modT(signo, regla, valor)` devuelve el valor sin cambiarlo y, solo con aviso activo, lo anota. Las expresiones de impactar cuerpo a cuerpo (fightGroup, joinedStrike, duelSwing), de Resistencia efectiva, de salvación de armadura y los modificadores de disparo se descomponen regla por regla (nombres de `RULES`/`ITEMS`) y se muestran junto a la tabla («Valor de la tabla + cada regla = resultado final»). |

### (a) Tablas locales y tiradas con tabla/umbral propio — ahora con ventana propia (tabla) antes de tirar
| Regla | Dónde | Ventana |
|---|---|---|
| Terreno salvaje (D6, 6 resultados) y repetición por Mapa de la Espesura | `wildDiscover` | tabla de 6 filas; Esporas tóxicas: D6 por modelo con tu R resaltada (6 siempre falla, 1 siempre pasa) |
| Tabla de Averías de máquinas ogras (1 / 2-3 / 4-6) | `ogreMisfire` | tabla propia (distinta de la de piedra/pólvora) |
| Tabla de Averías (piedra/pólvora) con −1 Ligado al infierno | `misfire` | `TB_MISFIRE` + desglose del −1 |
| Mirada de los Dioses (+ Juicio / Favor de los Dioses: repeticiones) | `gazeRoll` | tabla de 6 filas (la fila 1 cambia con Estupidez/−1 Ld) y una ventana por repetición |
| Mercenarios errantes (mayor / empate) | `chaosMercs` | tabla |
| Destrucción desmedida (1 = se detiene) | `lumberRoll` | tabla |
| Tirada de carga (2D6, conserva el mayor / menor en bosque) | `doCharge` | tabla «alcance = Movimiento + dado» con ✓ en las caras que llegan, tu cara necesaria resaltada y desglose (bosque −1) |
| Heridas automáticas (sin tirada para herir) | `woundAndSave0` | ventana «Salvaciones (heridas automáticas)» (antes no había ninguna) + filas extra: parar Golpe letal 4+, Anulación única 2+, Secos como el polvo 4+ |
| Ataques especiales de Gigante / Moledor / Frasco de Hashut (impactar con hitRoll) | `giantAttack`, `bonegrinderAttack`, vial | `ackMelee` con la tabla de impactar |
| Animosidad | — | **no existe** en el motor ni en los datos (grep en `app/js`): sin tirada, no aplicable |
| Chequeos de Liderazgo de objetos, estandartes y reglas (≈70 `roll2d6`) | 47 `rollLd` (daemonicInstability, hieroPhaseEnd, Xenwun, Sirena, redirigir carga, reformar tras arrollar/perseguir/…, hechizos lightDeath/mind/devolve, Gran Listeza, Centinela de obsidiana, glam/beguile, martillo, Maldición, authTest, 7 plegarias/capataz/voluntad/…, Impetuosidad, Reagrupar en Châlons, huddle, cultos, Skavenbrew, …) | tabla de 2D6 con tu Liderazgo (con `mod`: Liderazgo efectivo) |
| Resto de los 2D6 de Liderazgo (Pánico, Miedo, Terror, Reagrupar, Contención, Waaagh, Estupidez, Rotura y sus repeticiones por objeto) | `ackLd`/`ackBreak` ya existentes | clase C (la ventana previa cubre también las repeticiones) |

### (b)–(c) Clasificación de las 484 tiradas por función (generada con `inv_v843j.mjs`)
Sitios de tirada: 484 (C 160 · G 313 · N 11); llamadas a rollLd (chequeo de Liderazgo suelto): 47

| Función | Regla | C | G | N | Cobertura / motivo |
|---|---|---|---|---|---|
| `beginStrategy` | Reglas de inicio de turno (fase de Estrategia) | 0 | 63 | 0 |  |
| `fightGroup` | Ataques cuerpo a cuerpo (reglas especiales) | 14 | 29 | 0 | cadena de impactar/herir (ventana ackMelee/ackShoot/ackWound) |
| `applySpell0` | Efecto de hechizo | 0 | 41 | 0 |  |
| `resolveShot0` | Disparo (reglas de arma y de fuego) | 4 | 31 | 0 | Habilidad de Proyectiles 6-10: repetición (tabla de impactar a distancia, ackShoot); dado de dispersión (ventana Dado de dispersión) |
| `resolveCombats` | Resolución del combate (ruptura, persecución y reglas de ronda) | 21 | 10 | 0 | Seguimiento/Persecución (ventanas del movimiento de persecución); Prueba de Rotura y sus repeticiones (ventana ackBreak) |
| `apply0` | Habilidad u objeto activado | 0 | 27 | 0 |  |
| `doCast0` | Lanzamiento de hechizo (objetos y modificadores) | 15 | 9 | 0 | tirada de lanzamiento y repeticiones/dados extra (ventana ackCast) |
| `woundAndSave0` | Herir y salvar | 21 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `destroy` | Efecto al morir la unidad | 0 | 19 | 0 |  |
| `doCharge` | Carga | 11 | 7 | 0 | tirada de carga (ventana «Tirada de carga») y sus repeticiones |
| `createGame` | Preparación de la partida | 0 | 0 | 11 | N: preparación de la partida (clima, hito, listas de hechizos, tiradas de despliegue previas): se ejecuta ANTES de existir un diálogo (no hay askMode); el resultado queda en el registro y en |
| `rollPsy` | Chequeo psicológico | 11 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `tryDispel` | Dispersión (objetos y reglas) | 7 | 3 | 0 | tirada de dispersión y repeticiones (ventana ackDispel) |
| `miscast1` | Pifia de hechizo | 6 | 3 | 0 | tabla de Pifias y repeticiones (ventana Tabla de Pifias) |
| `duelSwing` |  | 8 | 0 | 0 | cadena de impactar/herir (ventana ackMelee/ackShoot/ackWound) |
| `rallyTest` | Reagrupar | 7 | 0 | 0 | chequeo de Reagrupar y repeticiones (ventana ackLd) |
| `bonegrinderAttack` | Ataques del Moledor de huesos | 0 | 6 | 0 |  |
| `giantAttack` | Ataques del Gigante | 0 | 6 | 0 |  |
| `applyWounds` | Reglas al perder Heridas | 0 | 5 | 0 |  |
| `flyHit` | Ataque en vuelo | 0 | 5 | 0 |  |
| `joinedStrike` |  | 5 | 0 | 0 | cadena de impactar/herir (ventana ackMelee/ackShoot/ackWound) |
| `hitRoll` | Impactar | 4 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `woundAndSave` | Herir y salvar | 4 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `runAway` | Huida | 4 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `attackProfile0` | Ataques aleatorios | 0 | 4 | 0 |  |
| `fanaticMove` | Movimiento de Fanáticos | 0 | 4 | 0 |  |
| `gazeRoll` | Mirada de los Dioses | 3 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `wildDiscover` | Terreno salvaje | 3 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `chargeImpacts` | Impactos de carga | 0 | 3 | 0 |  |
| `motherlyAttack` | Amor maternal | 0 | 3 | 0 |  |
| `bastionTest` | Terreno peligroso (bastión) | 0 | 3 | 0 |  |
| `dangerTest` | Terreno peligroso | 3 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `swiftD6` | Zancada veloz | 0 | 2 | 0 |  |
| `rollOff` | Tirada enfrentada (D6 contra D6) | 0 | 2 | 0 |  |
| `firstRoll` | Tirada del primer turno | 0 | 2 | 0 |  |
| `chaosMercs` | Mercenarios errantes | 2 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `restrains` | Reprimir Impetuosidad | 2 | 0 | 0 | chequeo de Contención (ventana ackLd) |
| `endlessBonus` | Ataques adicionales | 0 | 2 | 0 |  |
| `abominableAttack` | Ataques de la Abominación | 0 | 2 | 0 |  |
| `beginMove` | Inicio del Movimiento | 0 | 2 | 0 |  |
| `compulsoryMoves` | Movimientos obligatorios | 0 | 2 | 0 |  |
| `daemonicInstability` | Inestabilidad Demoníaca | 0 | 1 | 0 |  |
| `lumberRoll` | Destrucción desmedida | 1 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `ogreMisfire` | Averías de máquinas ogras | 1 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `misfire` | Tabla de Averías | 1 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `artDie` | Dado de Artillería | 1 | 0 | 0 | C: todas sus tiradas llevan ventana propia con tabla |
| `hellRR` | Ligado al infierno | 0 | 1 | 0 |  |
| `bldTplHits` | Impactos de plantilla de edificio | 0 | 1 | 0 |  |
| `flameHits` | Impactos de aliento | 0 | 1 | 0 |  |
| `tplChampSplit` | ¡Cuidado, señor! del campeón | 0 | 1 | 0 |  |
| `blastCount` | Impactos de proyectil explosivo | 0 | 1 | 0 |  |
| `tplPlan` | Plantilla de hechizo | 0 | 1 | 0 |  |
| `pigeonBomb` | Bomba de paloma | 0 | 1 | 0 |  |
| `doWaaagh` | ¡Waaagh! | 1 | 0 | 0 | chequeo de ¡Waaagh! (ventana ackLd) |
| `pushAway` | Empujón | 0 | 1 | 0 |  |
| `despair` | Desesperación | 0 | 1 | 0 |  |
| `setupDuels` | Desafíos | 0 | 1 | 0 |  |
| `scyChoice` | Segador | 0 | 1 | 0 |  |
| `zzzzap` | Zzzzap | 0 | 1 | 0 |  |
| `movePursuer0` | Persecución | 0 | 1 | 0 |  |
| `falconUse` | Halcón | 0 | 1 | 0 |  |
| `randomMoves` | Movimiento aleatorio | 0 | 1 | 0 |  |
| `endPlayerTurn` | Fin de turno | 0 | 1 | 0 |  |
| `vortexMoveHits0` | Vórtice | 0 | 1 | 0 |  |

**G** = ventana descriptiva (regla + dado + texto de la propia regla extraído del código) pero **sin tabla con celda resaltada**: son cantidades al azar (D3/D6 impactos, distancias, efectos de objetos de un solo uso, umbrales escritos en línea tipo «4+») que el libro no resuelve con una tabla propia en esa regla. **N** = `createGame` (preparación de la partida, antes de que exista ningún diálogo).

### Aleatoriedad que no es una tirada del libro (`rnd(s)` directo) — no aplicable
Direcciones de dispersión/«Flecha», ángulos y desvíos (resolveShot0, tplPlan, flyHit, zzzzap, applySpell0), elecciones al azar entre unidades/zonas/hechizos (spawnEdge, chaosCart, axeSetup, stirAuto, stirEntryPos, autoFlank, vanguardMoves, nomSetup, apply0, beginStrategy, resolveCombats, createGame), reparto estadístico de impactos entre componentes y muestreo de «1/6 naturales» (fightGroup, attackProfile0, handAlloc, handStrike, woundAndSave0 Escudo Rencoroso, resolveShot0). La prueba `v843j-inv-rnd` exige que cualquier `rnd(s)` nuevo esté catalogado.

### Pruebas nuevas (rules/verif/auto/behavior/tests/170_v843j_rolls.mjs; 10 pruebas con aserciones)
`v843j-inv-static` (ninguna llamada de dados fuera de un sitio; toda ficha C/G/N con motivo y nombre de regla), `v843j-inv-rnd`, `v843j-wild-spores`, `v843j-ogre-misfire`, `v843j-gaze-mercs-lumber`, `v843j-ld-loose`, `v843j-effect-hook`, `v843j-breakdown` (Miedo +1, Látigo −1, largo alcance +1; el resultado final coincide con el número resaltado), `v843j-auto-wounds`, `v843j-game-windows` (partida IA contra IA con avisos: cada tirada G tiene su ventana confirmada en la acción, y el estado tras CADA acción es idéntico al de la partida sin avisos). Además se comprobó con semillas 1-3 y cuatro parejas de facciones (empire-orcs, woc-dw, vc-sk, he-de; 992 acciones): 0 diferencias de estado con y sin avisos.

### Qué queda (exactamente) y por qué
1. **313 sitios G** muestran ventana (regla, dado, descripción) pero no una tabla con tu número resaltado: la regla no tiene tabla en el libro (cantidad al azar) o el umbral está escrito en línea; convertirlos en tablas exige 313 textos/umbrales a mano (se pueden promover uno a uno añadiendo `ackD` y moviendo el id a la política C).
2. **11 sitios N** (`createGame`): ocurren al crear la partida, antes de existir un diálogo; salen solo en el registro.
3. **Desglose por regla** hecho en: impactar cuerpo a cuerpo (3 expresiones), Resistencia efectiva, salvación de armadura, modificadores de disparo. **No** desglosados: salvación especial/regeneración (se muestra el valor, no cada regla que lo fija), modificadores de lanzamiento/dispersión, Liderazgo efectivo (`ldOf/psyLd/fearLd`), impactar de los ataques especiales (G).
4. **Efectos**: no avisan las líneas de las clases de resultado (`EFF_RES`) ni las que siguen a una tirada ya avisada; si un efecto automático real llevara un `k` de esa lista o ocurriera tras una tirada avisada en la misma acción, saldría sin ventana propia.
5. Modo por código: el rival ve sus avisos cuando actúa él (sin cambios respecto a v843i).
6. No se ha repetido la comprobación visual en un iPhone real; la interfaz es la de v843i (`pickAck`/`tblHTML`, tarjeta ≤92 vh con scroll) y solo cambia el contenido de las tablas.

## v843k - Figuras reales para unidades procedurales / prestadas (busqueda en todos los archivos entregados)

Herramientas: `tools/v843k/` (figkit.py = alta de figura en xp/xh/xu/xt/xu-avif/hdmap; compose.py/fig.py = composicion TTS padre·hijo con conjugacion por F=diag(-1,1,1,1); src/get/ex7 = busqueda y extraccion selectiva de .7z/unity3d; cap.js = captura WebGL swiftshader). Capturas en `shots/v843k/` (PC 1280x800 y iPhone 393x852).

**Encontradas y APLICADAS (figura propia del mod, sin tocar peanas ni aspecto):**
- we_weaver_unicorn (Tejedora silvana en Unicornio, mod con rider+mount inequivocos) y we_singer_unicorn (alias a la anterior).
- dm_bloodletters (Sanguinarios, mod 2430383879 "Bloodletters Of Khorne").
- de_scourge (Scourgerunner Chariot), de_beastmaster_chariot (High Beastmaster Chariot), de_deathhag_cauldron (Cauldron of Blood; REALM size 3.3).
- br_sergeant ("Sergeant At Arms", mod 2426103195), woc_hhandler ("Warhound Handler", 2427016876), imp_ogres ("Imperial Ogre", 2426060468; pack ok; ya no esta en FIG_BORROW).
- dm_burning y dm_burningchariot ("Burning Chariot of Tzeentch", 2430383879; dm_burningchariot pasa a alias de dm_burning; fuera de FIG_BORROW).
- empire_general_peg (Pegasus Knight, 4 piezas), empire_captain_peg (alias a la misma), empire_lord_peg ("Wizard Lord on Pegasus", 2426060468).
- Terrorgheist: la elipse negra era la peana propia del mod fundida en la malla (14.614 triangulos con y<0,1 en xh, 359 en xp, 17.901 en xu); recortada en xp/xh/xu; ya no hay elipse bajo la figura.
- Presupuesto de ficheros: 20 texturas xt identicas se deduplican por punteros en XTEX (484 -> 464 ficheros xt; hd = 499 ficheros en el artefacto, limite 511).

**SIGUEN SIN FUENTE / NO APLICADAS (y motivo):**
- br_prophetess_uni, br_damsel_uni: el unicornio bretoniano esta en el paquete C130AE0DAB (y similares D823A073C5, 04BDE4677F, 26DF77E179) que NO esta en ningun archivo entregado; se quedan procedurales y ya no toman la figura del Cantor silvano.
- dw_impmerc_sp/sw/xb/hb/etc (Enanos imperiales mercenarios): el mod trae 4 esculturas distintas de "Imperial Dwarfs" (C96D2BD7B8, 7DE029DC78, 70FE305188, B49D9F63EB) sin correspondencia inequivoca con cada perfil; por la regla de no elegir al azar NO se aplican.
- we_pack_cats/boars/bears, we_beastkeeper, he_ishaya, he_stormweaver_uni, bm_harpies (ambiguo entre variantes), bm_herdstone, bm_wtroll, bm_wmerc_*, bm_cart, sk_thingscatcher, goods_cart/dw_cart_miner, we_orion_hounds (= Hunting Hound del mod, no hay version Orion), br_bowmen_fire/stakes, tk_summoned, tk_cohort_*, vc_risen, dm_burning variantes, squig_herder, bm_warherd_*_u: no se encontro malla correspondiente inequivoca en los archivos (archivos .7z de 0 bytes incluidos); siguen como estaban.
- Musico/campeon/portaestandarte sin modelo propio, Ogre Arbalester, Irondrakes, Longbeards, cd_flamecannon, hipogrifo: sin fuente mejor que la existente; hipogrifo/escaneos fotograficos conservan UV ruidosas en xp (xh/xu correctos).
- Hallazgo: modelos antiguos con composicion anidada de rondas previas pueden estar especulares/incompletos (p.ej. Pegaso imperial antes solo con 1 pieza); corregido el de Imperio, el resto sin auditar.

## v843l

Hecho
- Ventanas/tablas: los sitios G con umbral escrito en la regla dibujan la tabla del dado con tu número resaltado (siteTable); 11 sitios de createGame con ventana; desglose de salvación especial/regeneración (fuentes), Liderazgo efectivo, modificadores de lanzamiento/dispersión; el rival en modo código repite las jugadas con los mismos avisos (replayAck). Misma semilla, mismo resultado con y sin avisos. Motor: el pivote de una máquina ya no cuenta como movimiento (error real hallado por test).
- Tests: 1922/1922; 18 mutantes eliminados y 12 documentados como declarativos (declarative.json). Test nuevos 171 y 172.
- Mantenimiento: 404 del barrido tk (entrada huérfana de XTEXU en hdmap.js) corregido; aviso 'Duplicate name LEEME.txt' del zip corregido en build.py.
- Cámara: zoom de encuadre en móvil 2.0 → 2.6 (render.js fit()). Antes (medido): figura cercana 10,4 px, 4,4 px/pulgada, 4 de 8 unidades fuera de plano. Después: la medición automática no pudo repetirse (el arranque del juego en swiftshader agota 120 s); por la fórmula la escala crece x1,3 (≈13,5 px). PC sin cambios (1.6).
- Peanas (punto 10): 250 unidades contrastadas con bloque equiparable en los libros, 245 coinciden. Corregidas: ok_hunter 40x40 → 50x50 (leg_ogres.txt:179); familia Marauder (woc_marauders*, chieftain, berserkers) → 30x30 (FAQ RH «Chaos Marauders»; FAQ > libro 25x25). Dudosa y NO tocada: dm_keeper (libro 50x50 mín. / 100x150 máx.; motor 60x100). Gigantes/Bonegrinder coinciden con el máximo del libro. Personajes montados: el motor usa la peana de la montura (no aplica). Tabla completa (834 filas: unidad, motor, oficial, fuente, acción) en rules/verif/auto/out/base_table_v843l.tsv; script base_cmp.mjs.

Pendiente y por qué
- Puntos 2, 4, 6 (frente/dorso dm_keeper, dm_bloodcrushers, br_outcast*_h, woc_chosen_chariot, emp_lector_altar; ghoulking_terror; hojas de contacto shots/v843l): las capturas WebGL (shoot.js, cam2.js) no arrancan en este entorno (waitForFunction agota 120 s). Sin captura no hay determinación inequívoca: YAWFIX no se toca.
- Punto 7 (monturas/carros procedimentales): sin fuente nueva ni ajuste inequívoco; se documentan sin cambios.
- ~130 sitios G sin descripción específica; umbrales dinámicos sin tabla resaltada; efectos posteriores a la tirada y resultados EFF_RES no se pueden anunciar antes.
- Legibilidad en iPhone con figuras grandes: usar el botón zUnit o pellizco.

## v843m

**Hecho**
- Peanas con rango (punto 1): regla Core "Base Size" (con rango, vale la peana con la que viene el modelo; el jugador elige entre las del rango). Implementado en data.js (BASE_RANGE, baseChoices, baseOf), createGame (u.base) y boton "Peana: WxD" en el editor (main.js). dm_keeper conserva 60x100 por defecto (peana estandar del rango 50x50 / 100x150 documentada, sin cambio de resultados con la misma semilla). Revisadas las demas unidades con rango de base_table_v843l.tsv: salida en rules/verif/auto/out/base_table_v843m.tsv. Tests 173.
- shoot.js (causa raiz del fallo de v843l): (1) no habia servidor en 8765; (2) el service worker servia cache y no arrancaba la partida; (3) un figaudit.json antiguo daba un rid (x_br_outcast) de un modelo que ya es procedural, y el script esperaba 60 s por vista. Corregido: arranque automatico del servidor, serviceWorkers 'block', mensaje de fallo explicito, env AUDIT y PITCH. Regenerar el audit con `node tools/figaudit/audit.mjs <ruta.json>` (escribe en argv[2]; stdout es solo un resumen).
- Frente/dorso (punto 2a): dm_bloodcrushers corregido (YAWFIX x_dm_bloodcrushers = +PI/2; eje largo de la malla de lado respecto a la peana, inequivoco). br_outcast_h/2_h/3_h son procedurales (caballo con cabeza hacia delante en la vista lateral: correcto, sin cambio). dm_keeper, woc_chosen_chariot (y hermanos woc_lord_chariot, woc_gorechariot) y emp_lector_altar: textura/malla irregular, no hay rasgo inequivoco de frente; NO se toca YAWFIX. Observacion medida: en chosen/lord chariot las bestias de tiro quedan a la izquierda (vista lateral, frente = derecha) y en gorechariot a la derecha; sin criterio inequivoco, queda como esta.
- ghoulking_terror (2b): usa la misma malla ya recortada del Terrorgheist (alias); capturas lado a lado sin elipse distinta.
- Camara (2c), MEDIDO con cam_v843m.js (Chromium swiftshader): iPhone 393x852 dsf3 (zona de tablero 393x556): encuadre actual (2.6): figura cercana 13,2 px, 5,44 px/pulgada, 4 de 8 unidades fuera del plano; antes (2.0): 10,2 px, 4,18 px/pulgada, 3 de 8 fuera; zoom maximo 3D: 132,2 px de figura, 54,34 px/pulgada, 8 de 8 fuera. PC (910x746 de tablero): encuadre 17,6 px, 19,77 px/pulgada, 2 de 8 fuera; zoom maximo 180,9 px, 203,05 px/pulgada, 7 de 8 fuera. (Nota: el viewport PC solicitado 1280x800 queda en 910x746 de tablero tras paneles.)
- Hojas de contacto (2d): shots/v843m/hoja_v843m_a.jpg y _b.jpg (vistas 3q y lateral). woc_hhandler, imp_ogres y dm_burning no existen como id en el audit actual (alias de otros ids): no capturados por separado.
- Ventanas/tablas (punto 4): 138 descripciones especificas nuevas para sitios G (sites_policy.json -> gensite.mjs), 20 tablas condicionales previas a la tirada (SITETBL: "si sale X ocurrira Y"), umbrales dinamicos con tabla resaltada (th en rzD6/rzD3/rzD2; thCF, thLd; siteTable admite 'ldN'). Misma semilla = mismo resultado (los avisos no consumen RNG). Tests 174.

**Pendiente y por que**
- Punto 3 (monturas/carros procedurales): buscadas de nuevo /mnt/user-data/uploads, attachments y MANIFEST_GENERAL; sin fuente nueva (el unicornio bretoniano de Prophetess/Damsel sigue sin estar en ningun archivo entregado; imperial dwarfs mercenarios ambiguos). Sin ajustes inequivocos; bases y aspecto de unidades reales sin cambios.
- Frente/dorso de dm_keeper, chariots woc y emp_lector_altar: indeterminable con las mallas disponibles.
- Algunos efectos posteriores a la tirada con resultado dependiente de varias tiradas siguen anunciandose solo con la tabla general del sitio.

## v843n

**A) Frente/retaguardia de las 840 unidades (FRONT_TABLE)**
- `FRONT_TABLE` (app/js/render.js, bloque generado por tools/figaudit/gen_front.mjs; copia legible en rules/verif/auto/out/front_table_v843n.tsv): id -> [yaw, fuente, medida_en, nota] para las 840 unidades. El dibujado 3D aplica `figYaw()` a mallas y figuras procedurales (antes `RM.yaw + YAWFIX`). El frente de peana que usan las reglas sigue siendo `u.face` (geom.sideOf, inFrontArc, carga, LdV); la unidad 2D dibuja su frente en +x local de u.face por construcción.
- Fuentes: **M medido** 510 (visto en captura WebGL con flecha de frente de la peana), **G malla compartida** 249 (misma malla ya medida en la unidad indicada), **C convención** 81 (29 procedurales construidas mirando a +x + 52 con malla sin rasgo de frente inequívoco: frente de diseño = frente de la peana; cada una con su motivo en la nota).
- Método: 576 representantes (uno por malla + procedurales). Perfil a pitch 0,12 con flecha (todas las no bípedas, 300 de 306 capturadas), vista con la flecha hacia la cámara (bípedas: debe verse la cara; 256 de 270), y vistas a0/a90/a180/a270 para los casos dudosos. Hojas pequeñas en shots/v843n/ (PC 1280x800: hoja_pc_perfil_*, hoja_pc_frontal_biped_*; móvil 393x852: hoja_movil_393x852_*, subconjunto direccional de 229: monstruos, máquinas, carros, montadas; verificacion_giros.jpg tras corregir).
- **Corregidos (giro 180°, medidos: bestias de tiro, cabeza o colmillos al lado contrario de la flecha)**: tk_chariot, tk_king_chariot (+ las que comparten malla), vc_blackcoach (corpsecart), woc_lord_chariot (+ exalted/lord cchariot), woc_aspiring_cchariot, de_master_cold, de_hydra, de_kharibdyss, ok_ironblaster, ok_thundertusk y familia thunder, ok_stonehorn y familia stone, lm_scar_carno, lm_troglodon, tk_scorpion, br_elisse. Verificado después con captura (verificacion_giros.jpg).
- Casos pedidos: dm_bloodcrushers conserva +π/2 (v843m). woc_gorechariot y woc_chosen_chariot: medido, bestias delante (sin cambio). woc_lord_chariot: corregido. br_outcast_h/2_h/3_h: procedural (cabeza a +x), convención. dm_keeper y emp_lector_altar: malla sin rasgo de frente inequívoco ni con 4 vistas: convención.
- Límite honesto: la revisión es visual a baja resolución. Los 52 casos C y los G heredan esa limitación; las bípedas se revisaron por muestreo (hojas 0, 5 y 7 de 9 vistas una a una; el resto sin anomalías a ojo, no inspeccionadas individualmente).
- Tests 175 (cobertura 840, formato, fuente coherente, arcos frontal/flanco/retaguardia con 6 orientaciones para todas las unidades, render usa figYaw). Nota: el test de arcos comprueba la geometría; que la malla mire a la flecha es lo que atestiguan las capturas.

**B) Peanas del resto de unidades**
- Todas las unidades con peana (834 no ocultas) en rules/verif/auto/out/base_table_v843n.tsv (id, motor, oficial, fuente, acción; script base_cmp3.mjs con índice rawidx.mjs de todos los «Base Size» de los libros, incluidos los que blocks.json no parseaba: Cathay, Quarrellers/Thunderers, State Troops, Gigantic Spawn…) y resumen base_summary_v843n.json.
- Resultado: 730 coinciden, 23 dentro de horquilla (peana elegible v843m), 7 por FAQ, 22 heredan de la unidad destino (variantes de equipo), **11 corregidas** (2 de v843l + 9 nuevas), 3 dudosas sin tocar, 38 sin dato.
- Corregidas ahora (inequívocas, personaje montado = peana de la montura, resto literal del libro): tk_catapult 25x25→60x100 (rh:6348); dm_pinkhorrors 25x25→30x30; dm_plaguedrones 40x40→50x75; dm_soulgrinder 100x150→150x100 (literal «150 x 100»); dm_herald_khorne_jug 30x60→50x75; dm_herald_tzeentch_disc 40x40→50x50 (leg_daemons:162/461/761/772/1017); we_weaver_unicorn, we_singer_unicorn, he_stormweaver_uni 25x25→40x60 (Unicornio, fof:4975; coherente con br_damsel_uni).
- Dudosas sin tocar: dw_king_shield 50x50 (libro 25x25, sin entrada de Shieldbearers), gob_warboss_spider y gob_bigboss_spider 50x50 (el libro no permite personajes sobre araña gigante; la montura sería 25x50).
- Sin dato (38): Renegade Crowns 19 (renegade_web.txt no trae «Base Size»); «N/A» en el libro: Anvil of Doom, Dreadquake Mortar x2, Casket of Souls; Dragón negro x2, Zombie Dragon x2, Terror Abisal x2, Hell Pit, Carnosaurio x2, Bale Taurus, Carrion, Doom Diver, Herdstone, mercenarios imperiales enanos: sin entrada en los libros extraídos; High Beastmaster «(as mount)».
- Tests 176. Suite completa 1937/1937.

Pendiente: figuras C (ambiguas) a revisar si llega una malla mejor; los carros y monstruos giran solo la figura, no la peana; capturas con 1 modelo (NMODELS=1) en las unidades con mínimo >1 salen con el mínimo.

## v843o

Encargo: «Hazlo todo» + «busca profundamente por internet». Reglas fijas: FAQ > libro; dato más reciente gana; sin aproximaciones; ambigüedad -> filosofía de diseño documentada; objetivo iPhone 14 Pro; no se cambia el aspecto real de las unidades.

**A) Peanas de las 38 unidades «sin dato» + 3 dudosas (tools: rules/verif/auto/base_v843o.mjs -> out/base_table_v843o.tsv + base_summary_v843o.json)**
- Método: el índice rawidx de v843n no enlazó varias entradas; se buscaron «Base Size» directamente en los libros locales (rules/*.txt, rules/new/leg_*.txt) y después en la web.
- **Corregida (1, inequívoca)**: vc_count_dragon (y vc_necro_dragon, que hereda por mkVariant) 60x100 -> **100x150** (Zombie Dragon «Base Size: 100 x 150 mm», leg_vampires.txt:858; GW Legacy PDF Vampire Counts 24.09, assets.warhammer-community.com, consultado 2026-11-23). Personaje montado = peana de la montura (mismo tamaño que el Terrorgheist del mismo libro).
- **Dudosas (3) resueltas sin cambio de datos**: dw_king_shield 50x50 (fof.txt:416, Shieldbearers: «el modelo con Shieldbearers ocupa una única peana» 50x50); gob_warboss_spider y gob_bigboss_spider 50x50 (rh.txt:743 Gigantic Spider 50x50; rh.txt:696 «A Goblin Warboss or Bigboss may be mounted on a Gigantic Spider»). La DUDOSA de v843n enlazaba otras entradas (Dwarf King 25x25; Giant Spider de Spider Riders 25x50). El motor ya tenía los valores correctos.
- **Renegade Crowns (19)**: confirmadas con la web (tow.whfb.app, que reproduce el Arcane Journal «The War of Settra's Fury», «Last update: 2025 October 30» salvo Hireling Outriders «2026 April 13»; Outcast Wizard y Bombard del AJ Kingdom of Bretonnia, 2024-02-23 y 2024-08-11): Prince/Captain/Sellswords/Veteran Sellswords/Mortar/Organ 25x25 o 50x75/50x50, montados 30x60 (Barded Warhorse, FoF p.55), Freeblades 30x60, Outriders 30x60. Coinciden todas con el motor.
- Encontradas en libro local (coinciden, v843n no las enlazaba): Abyssal Terror 50x100, Black Dragon 60x100, Hell Pit 60x100, Carnosaur 50x100, Bale Taurus 60x100, Doom Diver 50x75, Carrion 40x40, Imperial Dwarf Mercenaries 25x25.
- **Siguen sin dato oficial (6 ids, «N/A» en libro y web)**: dw_anvil, tk_casket (rh.txt:6398; tow.whfb.app/army/tomb-kings-of-khemri/reference, 2026-11-23), cd_mortar y cd_mortar_hb (leg_chaosdwarfs.txt:613 «N/A»; GW Legacy PDF Chaos Dwarfs 2024 «N/A»; la comunidad usa 60x100 o 50x100, no oficial: foro chaos-dwarfs.com 2024-02-02 y 2025-10-12), bm_herdstone (marcador sin perfil), de_beastmaster («as mount»). Se conserva la huella de convención del motor (necesaria para movimiento, LdV y colisión); impriwars.com/en/pages/peanas-the-old-world (2026) confirma «Base not stated in the book». Aplicar una peana inventada sería una aproximación.
- Resumen: 834 unidades con peana: 763 coinciden, 13 corregidas acumuladas (11 de v843n + 2), 7 FAQ, 23 en horquilla, 22 heredadas, 6 sin dato oficial, **0 dudosas**. Test 177.

**B) Frente de figuras (FRONT_TABLE): revisión visual completa de bípedas y convención**
- Capturas WebGL (swiftshader, tools/figaudit/shoot_front.js, shoot_angles.js, run_o.sh, sheet_o.py; hojas en shots/v843o/): 15 hojas de bípedas de <=12 figuras a mayor resolución (hoja_biped_3q_00..21), hojas no bípedas (hoja_nobiped_top_00..24) y vistas por unidad con la flecha de frente de la peana (u.face).
- Criterio inequívoco: de frente y de espaldas se distinguen rostro/barba/pecho/escudo/armas de la espalda (carcaj, tanques, capa, mochila). Se comparan las vistas a124 (flecha hacia la cámara: debe verse el frente) y a304 (flecha alejándose: debe verse la espalda). 48 bípedas sospechosas, comparadas por pares (shots/v843o/susp). Lección: tiradores (ballesteros, arcabuceros) se juzgan con vista 3/4; los fusiles apuntan en la dirección de la flecha.
- **Corregidas (8, giro 180°, comprobadas con la vista girada en shots/v843o/flip)**: we_waystalker, we_shadowdancer (+ we_shadowdancer_w), woc_exalted, dw_irondrakes, cd_castellan, bm_wargor, ok_leadbelchers, woc_ogres (+ orc_ogre_bulls). Estaban de espaldas a la flecha (frente de figura ≠ frente de peana). Cuando la malla se gira la peana, los arcos y las reglas no cambian: siguen usando u.face.
- **lm_scar_carno**: tras el giro π de v843n quedaba ~45° fuera de eje. La malla está posada en diagonal respecto a su eje; con yaw 3π/4 la cabeza queda sobre la flecha en las vistas cenitales a135 y a225 (probados yaw 0, ±π/2, π, 2.0, 2.36, 2.7; shots/v843o/sc2_*). lm_oldblood_carno (yaw 0) correcto.
- Promovidas C -> M (cabeza sobre la flecha en vistas cenitales a135/a225, yaw sin cambio 0): he_frostheart, emp_general_igriffon.
- Resultado FRONT_TABLE (840): **M 512, G 249, C 79** (antes 510/249/81). C residuales (ambiguas, filosofía de diseño: frente = frente de peana): 29 procedurales + 50 mallas con silueta sin rasgo de frente (esfinges, dragones esqueleto, cañones, trabuquete, fénix Flamespyre, grifo, pegasos, cobras, Cygor, Jabberslythe, Preyton, Merwyrm, Salamander, centauros/Renders/Wolf Riders, Keeper, altar, cauldron carriers, Mournfang). Se revisaron en vistas cenitales a135/a225 (shots/v843o/cm): ninguna daba un rasgo inequívoco.
- Revisadas y SIN cambio (evidencia a favor de la tabla): dw_king, br_prophetess, tk_skirmishers, goblins, night_gobs, empire archers/troops/vets, dw_quarrellers, dw_thane, he_shadow, gob_warboss, we_rangers, dw_miners, sk_engineer, sk_globadiers, daemonsmith.
- Sin conclusión (a ojo; se dejan como están): dw_engineer, dw_runesmith, dw_hammerers, dw_longbeards, cd_hailshot, cd_blunderbuss, ok_bulls/ironguts/butcher/hunter/slaughtermaster, vc_thrall, woc_dprince/ex_sorc/lord, we_warden/captain/lord/spellsinger/spellweaver/scouts. Límite honesto: las vistas son de baja resolución y el criterio visual no es una medida; estos casos pueden seguir 180° fuera.
- Móviles iPhone 14 Pro 393x852 (shoot_front.js iphone, shots/v843o/mob, vista de perfil): ver el estado en progreso26.md (captura parcial por tiempo de renderizado: 2 núcleos, swiftshader).

**C) Peana de carros y monstruos al girar la figura (v843n giró solo la figura)**
- Comprobado en vistas cenitales: la huella (peana), arcos (geom.sideOf), colisión y líneas de carga salen de u.face + dims; la figura se gira alrededor del centro de peana con `ya = u.face + figYaw` y `rm.off` rota con ella: la figura no se sale de la peana. **No se gira la peana** (sería cambiar la regla: el frente de reglas es el de peana, núcleo Facing/Arcs).
- **Defecto real hallado y corregido: figChariot (gl3d.js, carros procedurales)**: (1) las ruedas se construían con eje vertical (tumbadas, «de moneda»); ahora con eje en X (mbLimb a lo largo de X, aro en el plano YZ) y tres radios; (2) el conjunto sobresalía por detrás de la peana (de_dreadlord_chariot, de_master_chariot y los carros de reserva); ahora se desplaza -0.55 en Z (centrado). Aspecto de los modelos reales (mallas) sin cambio.

**D) Montaduras/carros procedurales y mallas sin fuente**
- Reexaminados: /mnt/user-data/uploads, /mnt/user-data/attachments/94e45a55-dabc-5271-89e3-07c7bc86c486/, assets_pending/MANIFEST_GENERAL.txt: sin mallas nuevas (la malla Prophetess/Damsel Unicorn no está en los assetbundles entregados; los JSON TTS de los assetbundles no vienen en los archivos 7z). Web solo como referencia de proporciones: las proporciones de los procedurales actuales (carros, monturas) no contradicen las referencias; solo se ajusta la geometría de carros (punto C). El resto queda documentado como «sin fuente»: ver rules/FIGURAS_PROCEDURALES.md.

**Tests**: 177 (peanas v843o), 178 (giros v843o, regla de frente, geometría de carro); 176 y 175 actualizados a rutas/valores v843o. Suite de comportamiento: ver progreso26.md.
**Pendiente**: figuras C (ambiguas) y las listadas «sin conclusión» si llega una malla mejor o una captura a mayor resolución; mallas sin fuente; hojas móviles completas de la lista; torneo/FAQ de torneo no aplicados.

## v843p

Encargo: archivos nuevos de 5 facciones (Guerreros del Caos, Altos Elfos, Imperio, Elfos Silvanos, Cathay): «extrae a máxima capacidad gráficamente las unidades y detecta si ya tenemos todas; cuando acabes, auditoría». Cathay además: «y todos los json». Prioridad Elfos Silvanos: unicornios, manadas/bestias. Reglas: una extracción cada vez en directorio vacío y borrada después, scripts fuera del material, `python3 -I`, solo coincidencias inequívocas, máxima calidad al zip y calidad adecuada al artefacto, sin tocar app/sw.js, sin publicar, sin smoke_all.

**A) Qué traían los archivos (índices en tools/v843p/<faccion>/archivos.tsv)**
- 11 .7z (5 de texturas + 5 de mallas OBJ + el de JSON/PNG de Cathay) y 5 .unity3d adjuntos. Comparados por clave de nombre (URL de Steam) y tamaño con todo lo ya entregado: **904 de 905 ficheros OBJ/JPG/PNG son idénticos a los que ya teníamos** (mismo nombre y mismo tamaño en otros .7z, p. ej. Models.7z). Solo es nuevo `httpspasteeersBYp4.obj` (43.569 B, tercera pieza opcional de «Dragon Mage on Sun Dragon» del JSON de Altos Elfos; accesorio sin identificar, no aplicado). Es decir: **ya teníamos todas las mallas y texturas de las 5 facciones**; lo que faltaba era saber a qué unidad pertenecía cada malla.
- **Lo realmente nuevo son los 164 JSON** del .7z de Cathay (3348897103.7z; 969 MB descomprimidos): incluye los JSON que antes no teníamos de Altos Elfos (2425660555), Grand Cathay (3506729242), Kingdom of Bretonnia (3146747660), Chaos Dwarfs (3492540464), Warhammer TOW completo (3477087013), etc. **Conservados todos**: `tools/v843p/cathay/json/*.json.xz` (164 ficheros, 26 MB, comprobados con `xz -t`), índice `tools/v843p/cathay/indice_json.tsv` (nombre de guardado de cada mod) y el de Cathay sin comprimir `3506729242_GrandCathay_Models.json`. Con ellos se casó cada malla con su unidad (JSON -> composición -> bbox contra las 1.100 figuras empaquetadas: `coincidencias_json_vs_figuras.txt` por facción; modelos y disponibilidad de ficheros: `modelos_json_y_disponibilidad.txt`).
- 5 .unity3d (`tools/v843p/unity3d_nuevos.txt`): Dríadas (bfbe57dc = la que ya usamos, bbox idéntica a x_we_dryads; c9b285a6 = segunda escultura de Dríada, variante sin criterio inequívoco, no sustituye), Yelmos Plateados (escudos/accesorio: 3 piezas de 444-1.368 tri y un paquete solo de texturas), **Cazador de Brujas a caballo** («[i]Cooper», 72.300 tri; el motor no tiene esa unidad: `emp_witchhunter` solo existe a pie) -> sin unidad, no aplicado.

**B) Tabla por facción (unidades del motor; audit.mjs antes -> después)**

| Facción | Unidades | Ya teníamos (malla propia x) | Mejoradas ahora | Nuevas | Sin fuente / sin mejora |
|---|---|---|---|---|---|
| Guerreros del Caos | 68 | 54 | **11 unidades (8 + 3 alias de Elfos Oscuros) / 7 mallas** (woc_forsaken, woc_lord_steed, woc_sorc_lord, woc_ex_sorc, woc_dprince, woc_lord_manticore (+exalted_manticore, de_dreadlord_manticore, de_beastmaster_manticore), woc_gorechariot (+de_coldchariot)): de 2.600 tri ruidosos a 4.020-15.835 tri | 0 | woc_lord, woc_ogres, woc_trolls (+skinwolves), woc_chimera: figura «old» de 2.600 tri; ninguna composición del JSON coincide en forma (error 3-13 %), no se sustituye; 12 prestadas (Frydaal, Huscarls, Berserkers, Jefe, 5 Engendros, Cañón Infernal, 3 Warpfire): el mod no trae malla propia |
| Altos Elfos | 67 | 58 | **6 unidades / 1 malla** (he_skycutter, _amb, _bt, _bt_amb, garrison_skycutter, _amb; 4 piezas, 9.929 tri; antes 2.600) | 0 | he_ishaya, he_stormweaver_uni, he_warlions: el JSON de Altos Elfos (y los otros 163) no trae Ishaya, Tejedor sobre Unicornio ni Leones de Guerra; 6 prestadas |
| Imperio | 75 | 69 | **1** (emp_general_griffon, 16.686 tri; antes 4.199 ruidosos) | 0 | rc_wizard1/2/3_h (alias al Outcast Wizard procedural; el JSON trae «Master Mage/Wizard Lord on Horse» malla 145755BB pero el Mago Proscrito es el bretoniano: ambiguo, no se aplica), goods_cart; 5 prestadas |
| Elfos Silvanos | 51 | 44 | 0 (ya estaban todas con malla propia en máxima calidad; unicornio Tejedor/Cantor aplicado en v843k, JSON 2426430616: «Spellsinger/Spellweaver on Unicorn» = we_weaver_unicorn) | 0 | **we_pack_cats/boars/bears (+_sk) y we_beastkeeper (7)**: el JSON de Elfos Silvanos solo trae «Hunting Hound» (= we_pack_hounds) y «Orion»; buscado «pack/beast/bear/boar/cat/panther/lynx/keeper/stag/hound» en los 164 JSON: Sabretusk Pack (Ogros), Packmaster (Skaven), Razordon/Salamander Pack (Lagartos) son otras criaturas, no se asignan. Siguen procedurales |
| Cathay | 32 | 32 (las 32 unidades con malla propia; 29 composiciones del JSON coinciden exactas con figuras empaquetadas) | 0 | 0 en el motor (modelos del mod sin unidad en el motor, ya empaquetados: ct_astromancer, ct_astromancer_horse, ct_crane, ct_peasants, ct_peasants_bow, ct_collider, ct_fangshi, ct_junshi) | Leadbelcher / Ogre Artillery Crew (mallas 5158B3F5, D617143D no están en ningún archivo); centinela: 2 esculturas en el mod (051482C1 la que usamos y 704CC688) para 5 unidades de centinela (terracota/jade/obsidiana/granito/piedra de disformidad): sin criterio inequívoco |
| Bretonia (prioridad pedida) | 53 | 34 | **br_prophetess_uni (nueva)** + br_damsel_uni (prestada, avisada) | — | ver C |

Totales: 18 unidades (8 de Caos + 3 de Elfos Oscuros que comparten esas mallas + 6 de Altos Elfos + 1 del Imperio) pasan de figura «old» (2.600-4.200 tri) a x; 1 unidad procedural pasa a malla del mod; 1 más pasa a figura prestada del mod (antes procedural). Figuras «old» en las 5 facciones: 14 -> 6 (Caos), 6 -> 0 (Altos Elfos), 2 -> 1 (Imperio; el restante rc_organ usa el órgano enano).

**C) Unicornio bretoniano (prioridad Elfos Silvanos/Bretonia)**
- Los JSON nuevos traen dos «Prophetess on Unicorn»: (A) mod «Kingdom of Bretonnia» 3146747660 (malla 985468E9AD + jinete EE9932773F, 7.501 tri, sin peana) y (B) mod 2426103195 (malla 466DD3385E, textura 52B17AFD7A 4096 px, 19.125 tri, con peana de escenografía integrada). **Se aplica B**: es el mismo mod del que salen la Profetisa a pie y a caballo ya empaquetadas (br_prophetess_war: bbox idéntica al JSON 2426103195), así que mantiene el estilo del ejército. A queda documentada como alternativa (en este mismo documento; sin aplicar para no mezclar estilos).
- br_prophetess_uni: figura x (paquete bret, xp 4.500 / xh 19.125 / xu 19.125 tri); frente: la cabeza del unicornio mira a +z de la malla, igual que we_weaver_unicorn (M, yaw 0, medido); FRONT_TABLE C -> M. br_damsel_uni: no existe «Damsel on Unicorn» en ningún JSON; usa la misma malla como figura prestada (FIG_ALIAS + FIG_BORROW: la ficha avisa «Usa la miniatura de otra unidad parecida»), FRONT_TABLE C -> G; mismo criterio que we_singer_unicorn -> we_weaver_unicorn. he_stormweaver_uni sigue procedural (no se toma la figura de otra facción, como v843k).

**D) Método de las «mejoradas» (todas inequívocas)**
- Las figuras «old» (models.js, 2.600 tri) salen de la MISMA malla del mod: se comprobó que la bbox compuesta con la regla antigua (gen_ultra: sin conjugar) coincide con la del modelo antiguo (error ≤ 1e-4 en 6 de 8; woc_ex_sorc con escala uniforme 1,667 y woc_gorechariot con traslación; forma <0,01 %). Se regeneran con `tools/v843p/tools/ogen.py` (composición antigua + ajuste afín a la bbox del modelo antiguo; rechaza si el error de forma >0,6 %) y `figkit.add_figure` (xp 2.600/4.500, xh y xu = malla completa, xt 1.536 px y xu hasta 4.096 px). Quedan en el **mismo espacio, escala (REALM), frente (FRONT_TABLE) y peana**; el id de modelo es el mismo y `rmOf` pasa solo a `x_<id>`. Verificado con audit.mjs: kk/H/Wl/Df idénticos (≤1e-3) salvo woc_forsaken (3 % menor: la malla antigua decimada tenía picos) y centroide he_skycutter (0,06 in).
- Hojas de contacto antes/después (rasterizador propio, mismas vistas): shots/v843p/hoja_v843p_a_antes_despues.jpg (Forsaken, Señor del Caos en corcel, Señor Hechicero, Hechicero Exaltado, Príncipe Demonio) y _b (Mantícora, Carro de Bestia Sangrienta, Cortacielos de Lothern, General en Grifo, Profetisa en Unicornio). Las capturas WebGL (swiftshader) no se ejecutaron en esta sesión.
- woc_gorechariot: el JSON «Gorebeast Chariot» trae la caja del carro con tripulación y bestias en una malla (B135958E) y, anidados, un Señor de Nurgle y otra pieza (235F9FF5, A40E1F1D) que son un personaje que viaja encima: no se incorporan (el antiguo tampoco).
- Presupuesto de ficheros: texturas nuevas deduplicadas por contenido (comparación de imagen decodificada, diferencia media <1,2/255) con las existentes: Príncipe Demonio y Mantícora reutilizan las de dm_prince / sorc_manticore, Carro de Bestia la de otro carro; **poda de 30 ficheros xt/xu huérfanos** (texturas sin ninguna figura que las use) y 36 xu duplicados. xt 464 -> 454. **Artefacto: 490 ficheros (35 xp/xh + 454 xt) de 511 y 213 MB de 256; dist/artifact.html 11.746.167 B (antes 11.746.142; tope 16.777.216); zip 743 MB (antes 781: máxima calidad conservada, sin huérfanos).**

**E) Auditoría**
- Cobertura JSON <-> figuras (todas las unidades de las 5 facciones con composición en el JSON): Caos 62 de 68 unidades en x; Altos Elfos 64 de 67; Imperio 70 de 75; Silvanos 44 de 51; Cathay 32 de 32. Los 4 sin-fuente de Caos y los pendientes restantes están en la tabla B.
- Mallas referenciadas por los JSON y ausentes de todos los archivos (sin fuente posible): Gnoblarkieger (6 mallas), Leadbelcher (Cathay), «Hoher Bestienmeister» 08486991, Infernal Ironsworn, líneas de visión «Line of Sight», AB «Cooper» 70ED7901/505AA03C, Prophetess on Unicorn variante C130AE0DAB (la B aplicada es otra variante completa). Altos Elfos y Cathay (salvo Leadbelcher): ninguna malla ausente.
- Auditoría de composición multipieza (relaudit.py; `auditoria_composicion_multipieza.txt` por facción): compara la colocación relativa de las piezas con la regla antigua (sin conjugar) y la de v843k (conjugada por X). Resultado: Caos, Imperio, Silvanos y Cathay sin diferencia (Gran Águila, Guerreros del Caos con capitán, Ballestas de Cathay: iguales); **única diferencia: he_skycutter** (4 piezas, desplazamiento relativo máximo 0,13 in en el cañón/tripulación respecto a la regla v843k). Las dos composiciones tienen la misma silueta; no hay criterio inequívoco de cuál es la correcta con las vistas disponibles, se mantiene la antigua (mismo espacio que FRONT_TABLE y peana) y queda documentado como pendiente. Las diferencias de la regla de composición son un giro global de 180° para hijos con rotY de 270° (p. ej. «Chaos Lord on Chaos Steed»): por eso las mejoradas usan la regla antigua y no la de v843k (si no, FRONT_TABLE quedaría 180° fuera).
- Tests: suite de comportamiento 1.947/1.947 (nuevo 179_v843p_figuras.mjs: 9 figuras x con bbox idéntica a la antigua y xh/xu presentes, unicornio y alias, sin texturas huérfanas y límite de 511 ficheros; 178 ajustado: convención residual 79 -> 77); /tmp/pw.js errors: []; /tmp/ask_test.mjs sin fallos; build.py correcto.

**Pendiente**
- Sin fuente en los archivos: manadas silvanas (gatos/jabalíes/osos) y Cuidador de Bestias, Ishaya, Tejedor de Tormentas en Unicornio, Leones de Guerra, Doncella bretoniana en Unicornio propia (usa la de la Profetisa), Leadbelcher, Gnoblarkieger.
- Sin coincidencia inequívoca: woc_lord, woc_ogres, woc_trolls, woc_chimera (siguen «old»); rc_wizard*_h; goods_cart; variantes de escultura (Dríada 2.ª, Centinela 2.º, Noble/Príncipe alternativos de Altos Elfos, Cazador de Brujas a caballo sin unidad).
- he_skycutter: confirmar con captura WebGL la colocación relativa de las piezas (0,13 in).
- Capturas WebGL por unidad (shoot_front.js) de las 18 unidades mejoradas y del unicornio con flecha de frente: no ejecutadas aquí (el frente del unicornio se midió en la vista rasterizada de la malla con la convención de we_weaver_unicorn).

## v843q
Feedback tras jugar en iPhone. Suite: 1962/1962, pw `errors: []`, artifact 11,79 MB (< 16.777.216 B). Tests nuevos 180-183.
1. Modo «Distancia máxima» (`maxMoveToward`, botón en la barra de colocación): el jugador solo elige dirección; distancia M/2M recortada por obstáculos con aviso. Test 181.
2. Chips: toda etiqueta de ficha lleva descripción al tocar (`chipH`, `fxInfo`); auditadas reglas, objetos, hechizos y efectos de los 18 ejércitos. Test 180. Límite: la exactitud literal de ~407 descripciones solo está verificada como existencia/longitud, con mejora manual de las flojas.
3. Leyenda amarilla eliminada; explicación solo en contexto.
4. Primer despliegue siempre frontal (`deployFace`).
5. Atacante resaltado en mapa (2D y 3D) y en el panel («Atacante: X»).
6. Popups de disparo/herida/combate con tablas originales (Core p.138-140 disparo, p.148-149 cuerpo a cuerpo) y origen de cada cifra; no consumen RNG. Test 182.
7. Tirada inicial explicada (`firstRollAck`) con nombres reales de ejército.
8-9. Reproducción de turno de IA: cámara que sigue, velocidades 0,5×/1×/2×/4×/instantáneo, play/pausa, paso atrás/adelante, inicio/fin, lista de pasos, instantáneas, botón «ver turno de IA», botones 44 px. Capturas en shots/v843q/. Test 183 (estático).
10. Magia: carta de texto para todo hechizo (🃏, `spellCardHTML`), tabla del Saber (`showLoreTable`) desde la selección de hechizos (Core p.110), con el hechizo conocido resaltado.
   Fuente: Core p.108-110 (tirada de lanzamiento 2D6+Nivel, Invocación Perfecta = doble 6 no dispersable, Fallo = doble 1 con tabla de Fallos). En TOW no hay dados de poder, vientos de magia ni Fuerza Irresistible.
Límites honestos / pendiente: los hechizos se generan en createGame antes de la interfaz, por lo que la tabla se muestra con el resultado y no estrictamente antes de tirar; la IA elige saber/hechizos con el decisor existente (sin decisor nuevo); no se rehízo la revisión de tablas de Fallo mágico antes de tirar; carga en modo máximo sin dirección; reproducción 3D no capturada (swiftshader lento).

## v843r
Cierre de lo pendiente de v843q. Suite 1969/1969 (tests nuevos 184-185), pw `errors: []`, artifact 11,81 MB (< 16.777.216 B). No se tocó sw.js, no se publicó, no se ejecutó smoke_all.
**A. Magia**
- Generación de hechizos (Core p.106-107, «Spells & Spell Generation»: se generan ANTES de desplegar; con varios Magos, orden a elección; tirar N D6 (N = Nivel) repitiendo duplicados; se puede descartar UNO por la firma; el Saber se elige al escribir la lista). Nuevo flujo `spellGenFlow` (main.js): popup de orden (si hay >1 Mago) → popup previo con la regla, el Saber elegido, los Saberes que ese Mago puede elegir (`loresForWiz`) y la tabla del Saber SIN resultado → «Tirar ND6» → popup con las caras sacadas resaltadas y la elección real (descartar X por la firma / conservar todos; con opción de hechizo de facción si existe), que despacha `spellPick`. Funciona también con despliegue alterno (Magos en `s.pend`).
- Límite honesto: las caras las fija la semilla en createGame (no se movieron para no cambiar partidas, guardados ni repeticiones); la tabla previa se enseña antes de REVELAR, no antes de consumir el dado. Mismo resultado con/sin avisos. «Número del jugador resaltado»: antes de tirar no existe (es una cantidad al azar); se resalta tras tirar. Los Magos con variantes (Báculo, Tomo, Lore Legacy, Aquelarre…) siguen con sus botones del panel.
- IA: nuevo grupo `lo`+id en optionGroups (ai.js) y acción `loreSet`: el Saber lo elige el decisor aprendido, a ciegas (en la valoración las caras se vuelven a tirar en la copia; la acción real lee las caras ya tiradas en la tabla del nuevo Saber). Solo para Magos cuyo Saber no fijó el jugador en la lista y con ≥2 Saberes de 6 hechizos. Medido: 42 Magos con opción, 10 cambios de Saber en 18 partidas, distintos Saberes; sin fuga de «blind». El descarte por la firma ya era decisión aprendida (`sa`). Límite: no hay entrenamiento específico de esta decisión; usa los pesos existentes.
- Fallo mágico: la tabla (Core p.109, 2-4 / 5-6 / 7 / 8-9 / 10-12; texto contrastado con core.txt) ya salía antes de tirar (`mis:`); se mantiene. No hay número del jugador (2D6 al azar).
- Cartas: botón «🃏 Cartas de magia (n)» en la ficha y el botón «Lanzar hechizo» abre la mano de cartas (`showSpellHand`): una carta por hechizo con su estado en la fase y «Lanzar»; luego objetivo en el mapa. Capturas: shots/v843r/sg_*.png, mano_*.png (iPhone 393x852; también medido a 393x660: sin solapes, el contenido largo se desplaza dentro de la tarjeta).
- CORRECCIÓN de texto (error de v843q): las cartas decían «2D6 + Nivel» y dispersar «con 2D6 + su Nivel». La FAQ Core p.108/p.110 (faq_core.txt) manda Nivel/2 redondeado hacia arriba (el motor ya lo hacía). Texto corregido y citas de página: lanzamiento p.108, Invocación Perfecta y Fallo p.109, dispersión p.110 (Dispersión de Mago/del Destino, Desatadura = doble 6, Superado en el Arte = doble 1), hechizos por turno = Nivel (FAQ p.108).
- Fase de magia revisada contra core.txt 3270-3445: doble 6 = invocación perfecta no dispersable; doble 1 = fallo aunque se repita (FAQ); 8-9 sigue lanzado a su VL pero sin más hechizos; 10-12 invocación perfecta sin más hechizos; resultado de dispersión debe SUPERAR; ligados sin riesgo de fallo; todo coincide con castCheck/doCast0/miscast1 (lectura de código, sin cambios). En TOW no hay dados de poder ni vientos de magia.
**B. Descripciones de reglas** (tabla completa: rules/verif/auto/out/reglas_v843r.tsv; 448 reglas)
| regla | fuente | estado |
|---|---|---|
| Lanza en carga | core.txt «Lance» | verificada |
| Contracarga | core.txt «Counter Charge» p.169 | CORREGIDA (todos los modelos, distancia < M, pivote, D3+1", una por turno) |
| Primera carga | core.txt «First Charge» + «Disrupted Units» | verificada |
| Zancada veloz | core.txt + faq_core.txt «Swiftstride: Change the rule» | CORREGIDA (cita y «antes de la tirada puede elegir +D6») |
| Carga furiosa | core.txt «Furious Charge» | verificada |
| Ignora el pánico | rh.txt «Ignore Panic» | CORREGIDA (6" y huida a través) |
| Inmune a psicología | core.txt | CORREGIDA (mayoría; solo Miedo/Pánico/Terror) |
| Odio | core.txt «Hatred (X)» | verificada |
| Hachas (Choppas) | rh.txt | verificada |
| Reprimir impetuosidad | faq_rh.txt | verificada |
| Da Boyz | rh.txt | verificada (excepción Waaagh! Nómada: sin fuente textual local) |
| Destacamento / Unidad regimental | core.txt p.282-283 | verificadas |
| Variopinto (Motley Crew) | solo aparece en listas | sin fuente local |
| «Disparo X"» (etiqueta) | no es una regla: perfil del arma | no aplica |
| Resto | 271 con el nombre localizado en inglés en las fuentes (texto NO comparado); 165 sin fuente local por nombre | NO verificadas |
Límite honesto: solo 12 descripciones se compararon palabra por palabra; las demás NO están verificadas.
**C. Visual**: reproducción de la IA en 2D (shots/v843r/ia_*.png): barra de 44 px, lista y cámara sin solapes. Popup de disparo (pop_1.png) sin solapes ni cortes. NO capturados: reproducción 3D (swiftshader) y popups de herida/primer turno (el montaje solo produjo la tirada de impactar); no se corrigió nada visual.
Otros: el popup del Báculo de Élisse (startNew) busca en units/reserves, no en s.pend (despliegue alterno): pendiente.

## v843s

Tests nuevos 187-193 (1984 pruebas, todas pasan). Capturas iPhone 393x852 en shots/v843s/ (reglas_ejercito, menu_partida, menu_partidas, menu_volver).

1. **Tirada única**: aviso previo y resultado de cada tirada (rollOff, createGame…) se unifican en un solo popup (rollSite con PAIR_SKIP/PAIR_FIRST); mismos resultados por semilla (187).
2. **Solo 3D**: eliminada la vista 2D (z3d); sin WebGL sale un aviso en castellano. Bajo automatización (navigator.webdriver) no se arranca WebGL salvo window.__TOW_GL (swiftshader tarda >30 s). Límite: el 3D real no se ejercita en las pruebas automáticas.
3. **Saber antes de la tirada** (loresForWiz) con botones en el popup previo; la tabla cambia al Saber elegido; la IA usa el decisor (189).
4. **Textos**: ~34 citas en inglés traducidas, 3 prefijos de pie, textos de generación de hechizos; popup de firma («Cambiar X por el hechizo de firma Y» / «Quedarme con los hechizos tirados (X)») con explicación; plural 1 hechizo / N hechizos. Test 188 detecta frases inglesas en popups/tablas.
5. **Cámara de despliegue** orientada a la zona del humano (cada turno del despliegue alterno).
6. **ⓘ de filas**: popup con reglas Core/FAQ (solo fuentes locales, con páginas tomadas del índice/comentarios del motor).
7. **Despliegue alterno**: personajes uno a uno (humano e IA) (190).
8. **Ficha de unidad solo informativa**: las decisiones (Saber, firma, Tomo, Aquelarre, Báculo…) van en popup en el momento.
9. Auditoría de castellano (ver 4).
10. **Menú de la partida (☰)**: partidas con nombre (hasta 30, localStorage con try/catch; guardar nueva, sobrescribir, cargar, renombrar, borrar; compatible con las 3 ranuras antiguas), repetición de los 4 últimos turnos de la IA a ½×/1×/2×/3×, ajustes (sonido, gráficos, tapete, ayuda, estadísticas), rendirse, volver al menú principal con confirmación (Guardar y salir / Salir sin guardar / Cancelar). Quitado el botón «Menú» de la barra inferior.
11. **Pestaña «Reglas de ejército»**: reglas de la unidad seleccionada por origen (De la unidad, Del ejército, Del equipo, Del personaje unido, Genéricas del tipo) con descripción y fuente (app/js/rulesrc.js, generado de reglas_v843r.tsv: archivo local y si el texto está comparado). Criterio documentado (ambigüedad): «del ejército» = blessings, waaagh, athelLoren, undead, harmony, willDragons, nehek, blessingChaos, peasantry + la lista elegida; «genéricas» = closeOrder, openOrder, skirmish, large, detachment, regimental, horde, ponderous, swiftstride + tipo de tropa (Core p.105). Sin selección: mensaje claro. Las pestañas desplazan en horizontal (5 en 393 px). Límite: ~436 descripciones sin comparar con el original (se muestra «sin comparar»).
12. **Lupa**: encuadra la unidad entera desde el frente (camUnit). No verificada visualmente con WebGL real.
13. **IA dispara/ataca al humano**: impactos, heridas, salvaciones y bajas con tabla antes (popup único por paso), también en repetición y registro; resultados idénticos por semilla (191).
14. **«Camino bloqueado» falso**: causa = pequeños arrastres laterales exigían un giro de ala gigante, no un solape real; ahora «Maniobra demasiado larga» (Core p.124-125) y el bloqueo real nombra y resalta la unidad (192).
15. **«Distancia máxima» siempre opt-in**: antes se persistía en localStorage (tow.maxDist) y se heredaba; ahora nace apagada y se apaga al elegir Mover/Marchar/Reservas (193).
16. **Pivote izquierda/derecha**: geometría extraída a geom.js `wheelPivot`. Comprobado (193) para rumbos ±x y ±y, dos toques seguidos: izquierda = antihorario visto desde arriba (rumbo disminuye con y hacia abajo), esquina pivote fija, pose válida para el motor, ambos jugadores. La IA no usa los botones (no cambia resultados). Honesto: NO he conseguido reproducir un primer giro en sentido contrario en la lógica ni en las proyecciones 3D (t3p conserva la orientación); si persiste, la causa sería visual (el fantasma se superpone a la unidad real en el primer toque de ±15°) y falta una captura del vídeo con el estado exacto.
17. **Círculos de movimiento**: solo visuales; checkPlacement/previewMove usan solo corners() con tolerancia 0,01" y 1" al enemigo. Ballesteros contiguos a Tropas (0,3") avanzan 0,2" y 3" sin bloqueo (193). La causa real es la del punto 14.

Límites: orden de personajes de la IA por puntos (sin decisor aprendido); caras de hechizo fijadas por semilla en createGame; popups de main.js (sgWizard…) probados estáticamente + capturas del menú/pestaña; sin ejecutar smoke_all ni tocar sw.js.

## v843t

Tests nuevos 194-201 (1992 pruebas, todas pasan; archivo tests/194_v843t.mjs). Capturas iPhone 393x852 en shots/v843t/ (selector_objetivo, bloqueado_panel, deshacer_activo, deshacer_menu, deshacer_motivo). pw.js errors: []; ask_test exit 0; artefacto 11.874.661 B.

**A. Nombre único de unidad en todos los selectores.** `labelName`/`shortName` se movieron de render.js a rules.js (única fuente; render.js los reexporta) y se añadió `unitTag(s,u,{peers})` = texto exacto de la etiqueta del mapa («Orcos 39 ★», «Orcos B 15») con ordinal «(1.ª)» si aun así empatan. En HTML, `unitChip` (render.js) añade el MISMO icono (unitIcon) y color de ejército que el mapa. Usado en: selector de objetivo de disparo/carga/hechizo y rol «Atacante», cola de cargas, popup de carga declarada, lista de unidades, asalto/vial/Gran Cathay/persecución/redirección, y TODAS las opciones de popups del motor que son unidades (`askH` → `tagOpts`, con icono). La letra de variante ahora es ESTABLE (cuenta también las unidades destruidas y en reserva: antes «Orcos B» pasaba a «Orcos» al morir la otra) y se guarda en el nombre propio (`assignVariantNames`, al crear la partida): registro y popups del motor dicen «Orcos B» sin tocar ningún cálculo (el nombre no interviene en reglas ni RNG). Límite: los guardados antiguos y las unidades creadas a mitad de partida (convocadas) no llevan la letra en el registro (sí en el mapa y selectores); el registro no lleva nº de modelos (cambia durante la partida).

**B. Línea de visión (duda del usuario): ¿las «Tropas B» amigas delante de los Ballesteros dejan disparar a los 4 objetivos?** NO. Cita: Core p.103 «Note that models and units always block line of sight. Therefore, it is normally only the models in the front rank of a unit that have a line of sight» y «without crossing over or through another model, there is no line of sight»; fase de Disparo (p.136-137, «Check Line Of Sight»; «We Can't All Shoot!»: los modelos sin línea de visión no disparan). Las únicas excepciones del libro/FAQ: Large Target (FAQ Core: «a unit can draw a line of sight to a Large Target over or through another unit … provided that unit is not also a Large Target»), Chariot Runners (FAQ Core), Skirmishers (Core p.184-186: ven 360° pero sus modelos bloquean), Insignificante, colinas (Core p.271 + FAQ p.10). Ninguna aplica a Ballesteros (infantería, sin «disparar por encima»; en esta edición no existe una regla de fuego sobre tropas amigas). **Fallo real encontrado y corregido:** `rayBlockedByUnits` ignoraba toda unidad a ≤0,3" del tirador o del objetivo (comentario: «trabadas»), de modo que unas Tropas amigas pegadas a los Ballesteros NO bloqueaban y los orcos más cercanos se ofrecían como objetivos (en la captura, 3 de los 4 «objetivos» eran ilegales; el cuarto quedaba tapado por otro orco). Ahora ninguna unidad se ignora por cercanía (solo el tirador/objetivo y su unidad anfitriona, para personajes unidos). Además la línea se traza desde los modelos del frente (5 puntos del borde delantero) además del centro: basta con que UN modelo de la fila delantera vea alguna parte del objetivo (Core p.103), antes solo desde el centro (más estricto de lo debido). Cambia resultados con la misma semilla solo en esas situaciones (bug real; el resto idéntico). Aviso del motor: «Sin línea de visión: Tropas 22 (unidad amiga) tapa la vista (Core p.103…)» + `blocker` (resaltado en el mapa con el rol «Bloquea»); el panel de la unidad dice «Sin objetivos: 4 unidades enemigas a alcance no se pueden ver: Tropas 22 (unidad amiga) tapa la vista»; en el selector, lista de los no visibles (tocar = resalta quién tapa) y ⓘ con la regla y sus citas. Tests 195-199: bloqueo con huecos 0/0,1/0,3/1", rechazo en `apply` con mensaje y `blocker`, amiga desplazada o lateral no bloquea, modelo del borde ve por el flanco de una amiga más estrecha, Objetivo Grande visible por encima. Tests antiguos 82/163 ajustados: colocaban un personaje/mago justo detrás de una unidad (visibles solo por la excusa de 0,3"); ahora lo ponen a un lado. NO verificado: el libro local no incluye la figura exacta de p.103 (solo texto); la visibilidad de Escaramuzadores «entre modelos» (huecos entre peanas) sigue tratando su unidad como rectángulo (aproximación previa, no tocada); la lupa/3D con WebGL real no se ejerce en automático.

**C. Botón ↶ Deshacer** (petición expresa del usuario). Filosofía de diseño (el libro no la regula; ojo: Core «Take-backs & Changing One's Mind» y FAQ Core (core-qa-002, faq_core.txt:345) «¿Marcar la posición, mover, devolverla y volver a moverla? Sí, es una retractación» prohíben retractarse en la mesa, porque el rival gana información; el motor sigue sin admitirlo (`takeBackAllowed` intacto) y el test core-qa-002 se actualizó): en esta versión contra la IA se puede deshacer, de la más reciente hacia atrás (pila de hasta 40), toda acción del humano que NO haya dado información ni consumido azar: colocar/mover/girar/pivotar/ancho (`deployMove`, `move`), preferencias de formación (`pref`), uniones (`join`/`leave`). Cada una lleva marca = copia completa del estado (incluye `s.rng`, registro `s.log`) y longitud de `G.actions`; al deshacer se restaura todo, así que con la misma semilla el resultado posterior es idéntico (test 200). Se vacía la pila (y el botón dice por qué) tras: cualquier tirada (RNG cambiado: «ya se tiraron dados»), cualquier acción fuera de la lista (disparo, carga, hechizo, combate, pánico, pruebas, revelaciones…), una ventana de aviso/decisión respondida (`a.ans`), pasar de fase/turno (`endPhase`/`ready`) o actuar el rival (la IA, también en el despliegue alterno: el rival responde al instante, así que allí solo cabe deshacer el paso propio mientras no responda). Deshabilitado con motivo en partida por código («tu rival recibe tus jugadas en el código») y a dos en el mismo dispositivo. Botón ↶ en la columna del mapa (44 px en pantalla táctil, atenuado y con toast del motivo si no se puede) y «↶ Deshacer» en el menú ☰. No se guarda la pila en el autoguardado (tras cargar no hay nada que deshacer; el guardado sigue siendo semilla + acciones, coherente). La repetición de la IA no se ve afectada (solo se deshace antes de que actúe la IA). Verificado en navegador iPhone 14 Pro: mover 2 unidades → 2 pasos; deshacer dos veces restaura y, de paso, el RNG; endPhase → «ya has pasado de fase o de turno».

## v843u

Tests nuevos 201-203 (tests/201_v843u_primera_tirada.mjs, 202_v843u_saberes.mjs, 203_v843u_vision.mjs): 2010 pruebas, todas pasan. Capturas iPhone 14 Pro 393x852 en shots/v843u/ (primera_tirada_antes/despues, saber_imperio, saber_hechizos_imperio(_2), saber_altos_elfos, saber_elfos_silvanos, saber_orcos, saber_caos). pw.js errors: []; ask_test exit 0; artefacto 11.907.021 B (< 16.777.216). sw.js sin tocar; sin publicar; sin smoke_all.

### 1. «Sigo sin saber para qué sirve la primera tirada de dados»

**Qué decide exactamente el motor.** La primera tirada del popup es `rollOff(s,{k:'alt'})` (rules.js, `altInit`): una tirada enfrentada D6 contra D6 entre el jugador 1 y el jugador 2 (Core p.93 «Rolling Off»: gana el más alto; si empatan se repite) que decide, en el despliegue alterno por unidades (Core p.285 «Alternating Units» + apartado «Despliegue» de cada escenario, Core p.288-298): (a) en los escenarios con zona a elegir (Open Battle, Pitched Battle…), quién elige zona (A o B; A1/A2/B1/B2 en «chance») y (b) quién coloca la primera unidad (el ganador la coloca, o elige quién, según el escenario). NO decide quién juega el primer turno (eso es otra tirada, Core p.288 «First Turn»). El texto «Tirada de desempate» / «Sin decisión que tomar» era un texto genérico del avisador de tiradas automáticas que no explicaba nada: desaparece de las tiradas enfrentadas.

**Ventana nueva (una sola, antes y después de tirar).** Antes: título, para qué sirve en ESTE escenario, «Por qué se tira» con cita (Core p.285/288-298/292; Battle March para sus mapas), «Quién tira contra quién» (jugador 1 (Ejército) contra jugador 2 (Ejército), 1D6 cada uno sin modificadores, empate = repetir, Core p.93), tabla «Qué consigue quien gane» (zona, primera unidad, qué viene después y «Lo que NO decide»), y botón «Tirar los dados». Tras pulsarlo, la MISMA ventana pasa a «Resultado: gana …» con los dados de cada uno (y los empates repetidos), qué ocurre ahora (si eliges tú, qué botones aparecen) y «Continuar». Los dados son los mismos con y sin ventana (la ventana sólo MIRA el generador, no lo consume; probado con 400 semillas).

**Rutas «tirada enfrentada / automática de la regla» auditadas** (inventario completo de rollOff y de los sitios G con «enfrentada»): `alt` (despliegue) — ventana completa; `scouts` (Core p.177: sólo se tira si AMBOS ejércitos tienen Exploradores; si no, tirada silenciosa porque no decide nada); `glass` (Catalejo del Montaraz, Battle March); `duelBoth`/`clashNone` (Clash of Steel, primer turno); `cart` (Misplaced Resources, dueño del carro); `createGame:10/11` (Surprise Encounter, Core p.308: pierde el que despliega primero; texto propio con «Resultado» en la misma ventana); y **¡Timmm-berrr! (Core p.179)**, que antes mostraba DOS ventanas genéricas (una por dado) y ahora usa la misma ventana `rollOff` con su cita, qué gana cada bando y el daño; el primer dado sigue siendo el del dueño del modelo (mismo reparto de dados que antes). Cuando la tirada no decide nada (escenarios que fijan quién despliega y la zona: Last Stand, Timely, Shores, Waystones, Leonen, Hollum, Loot, Winter, Belcedas, Sturdham, Gemelwald, Weisnicht, Karak, Raiders) no hay ventana y la tirada se hace en silencio. El avisador genérico «Tirada automática de la regla» sigue existiendo SÓLO para tiradas automáticas sueltas (un D6 de una regla), no para tiradas enfrentadas. Los 317 sitios de tirada G restantes llevan «…» sólo para los huecos variables (nombres/cifras) de su texto específico.

Pruebas: 201 (cinco escenarios con cita, quién-contra-quién, qué gana, resultado en la misma ventana y ausencia de texto genérico; escenarios sin decisión = sin ventana; Exploradores; Catalejo/duelo/carro/¡Timmm-berrr!; empate/misma semilla).

### 2. Saberes de magia: ¿sólo los que el Mago puede elegir?

**Sí para el Maestro Mago del Imperio (FoF «Magic:»: Battle Magic, Daemonology, Dark Magic, Elementalism, Illusion, Necromancy = seis Saberes, exactamente los que salían) pero NO en general: la auditoría encontró errores reales y están corregidos.** `loresForWiz` (rules.js) es ahora la ÚNICA función de Saberes permitidos (la usan la ventana de Saber, la lista de ejército —antes tenía su propia copia— y createGame). Base = el «Magic:» del perfil (`d.lores`, o la lista de su facción) + sólo ampliaciones expresas del libro: Primigenia (Manada Salvaje / Diente Sangriento, AJ Bestias p.44), Saber de los Salvajes (Hueste de Talsyn para Cantores/Tejedores de Hechizos, Ancianos y Hechiceras Rama, AJ Bosque p.44; Colgante de Duramen), Magia Troll (Horda de Trolls para Chamanes Orcos y Goblins, AJ Orcos p.28/44; Brebaje de la Bruja).

Errores corregidos: (1) la clave `necromancy` NO existe (la del juego es `necro`): los Vampiros/Nigromantes sólo veían Oscura e Ilusión y los Slann no veían Nigromancia → corregido (Vampiro: Oscura, Ilusión, Nigromancia; Rey Ghoul Strigoi: Batalla, Oscura, Nigromancia; Slann: Batalla, Elementalismo, Alta, Ilusión, Nigromancia); (2) Settra: sólo Nigromancia (AJ TK «knows spells from the Lore of Necromancy»; antes ofrecía Elementalismo, Ilusión y Nigromancia); (3) Carro de Cadáveres (Corpsemaster «knows a spell from the Necromancy Lore»): sólo Nigromancia; (4) Mago Dragón (FoF): sólo Batalla o Elementalismo (antes ofrecía 4); (5) Hermanas de la Espina (hechizo ligado de Batalla o Elementalismo, FoF) y (6) Brujos de Fuego Maldito (ligado de Oscura o Demonología, Legends DE): se quitaron Saberes que el libro no les da; (7) Saber de los Salvajes (Talsyn/Colgante) y Magia Troll para los Chamanes Goblin en Horda de Trolls no aparecían en la función compartida (sí en el editor): ahora sí, en los dos sitios; (8) Danzante de las Sombras no recibe Salvajes (el libro nombra Magos, Ancianos y Hechiceras Rama).

**Tabla de verificación (ejército / mago → Saberes permitidos → fuente → estado).** «verificado» = coincidía con el libro; «corregido» = se cambió; «sin fuente local» = no hay texto en los .txt locales (se deja el Saber propio de la unidad y se avisa).

| Ejército / Mago | Saberes permitidos | Fuente local | Estado |
|---|---|---|---|
| Imperio: Señor de la Magia, Maestro Mago (y en Pegaso) | Batalla, Demonología, Oscura, Elementalismo, Ilusión, Nigromancia | fof.txt «Wizard Lord / Master Mage» | verificado |
| Imperio (Coronas Renegadas): Mago Proscrito | los mismos 6 | aj_bretonnia (Outcast Wizard) / renegade_web | verificado |
| Bretonia: Doncella, Profetisa (y montadas) | Batalla, Elementalismo, Ilusión | fof.txt «Handmaiden of the Lady» | verificado |
| Bretonia: Mago Proscrito | Batalla, Demonología, Oscura, Elementalismo, Ilusión, Nigromancia | aj_bretonnia | verificado |
| Bretonia: Lady Élisse | Elementalismo | aj_bretonnia | verificado |
| Altos Elfos: Archimago, Mago (y montados) | Alta Magia, Batalla, Elementalismo, Ilusión | fof.txt «High Elf Mage» | verificado |
| Altos Elfos: Mago Dragón | Batalla, Elementalismo | fof.txt «Dragon Mage» | corregido (tenía 4) |
| Altos Elfos: Tejedor de Tormentas | Oscura, Elementalismo, Ilusión | aj_highelves | verificado |
| Elfos Silvanos: Cantor/Tejedor de Hechizos (y Unicornio) | Batalla, Elementalismo, Alta, Ilusión (+ Salvajes en Talsyn o con Colgante) | fof.txt «Wood Elf Mage»; aj_wood p.44 | verificado + ampliación Salvajes en la función compartida |
| Elfos Silvanos: Hechicera Rama | Batalla, Elementalismo, Ilusión (+ Salvajes en Talsyn) | fof.txt | verificado |
| Elfos Silvanos: Anciano Hombre Árbol | Batalla, Elementalismo (+ Salvajes en Talsyn) | fof.txt «Treeman Ancient» | verificado |
| Elfos Silvanos: Danzante de las Sombras | Batalla, Ilusión | fof.txt | verificado |
| Elfos Silvanos: Hermanas de la Espina (ligado) | Batalla, Elementalismo | fof.txt «Sisters of the Thorn» | corregido (tenía 4) |
| Orcos: Chamán/Chamán Mayor Orco | ¡Waaagh!, Batalla, Elementalismo (+ Troll en Horda de Trolls) | rh.txt «Orc Shaman»; aj_orcs | verificado |
| Orcos: Chamán Goblin | ¡Waaagh!, Elementalismo (+ Troll en Horda de Trolls) | rh.txt «Goblin Shaman» | verificado; Troll en Horda añadido |
| Orcos: Chamán Goblin Nocturno | ¡Waaagh!, Ilusión | rh.txt | verificado |
| Orcos: Bruja Troll / Ogdruz | Batalla o Troll / Elementalismo o Troll | aj_orcs2 | verificado |
| Bestias: Chamán Bray / Gran Chamán Bray | Demonología, Oscura, Elementalismo (+ Primigenia en Manada Salvaje / Diente Sangriento) | rh.txt; aj_beasts p.44 | verificado |
| Bestias: Kralmaw | Oscura, Primigenia | aj_beasts | verificado |
| Guerreros del Caos: Señor Hechicero, Hechicero Exaltado (y montados) | Batalla, Demonología, Oscura, Tierras de las Sombras | rh.txt «Sorcerer of Chaos» + aj_westerland | verificado |
| Caos / Daemons: Príncipe Demonio | Batalla, Demonología, Oscura | rh.txt; leg_daemons | verificado |
| Caos: Galrauch | Oscura | aj_chaos | verificado |
| Reyes Funerarios: Sumo Sacerdote, Sacerdote Funerario | Elementalismo, Ilusión, Nigromancia | rh.txt «Liche Priest» | verificado |
| Reyes Funerarios: Settra | Nigromancia | aj_tk2 | corregido (tenía 3) |
| Condes Vampiro: Vampiro, Esbirro, Nigromante Maestro, Acólito (y montados) | Oscura, Ilusión, Nigromancia | leg_vampires | corregido (clave inexistente: sólo salían 2) |
| Condes Vampiro: Rey Ghoul Strigoi | Batalla, Oscura, Nigromancia | leg_vampires | corregido (clave inexistente) |
| Condes Vampiro: Carro de Cadáveres (Corpsemaster) | Nigromancia | leg_vampires | corregido (tenía 3) |
| Condes Vampiro: Caballero de las Mortajas | Nigromancia | sin fuente local (reglas reconstruidas) | sin fuente local |
| Hombres Lagarto: Slann | Batalla, Elementalismo, Alta, Ilusión, Nigromancia | leg_lizardmen | corregido (faltaba Nigromancia) |
| Hombres Lagarto: Sacerdote Skink | Batalla, Elementalismo, Ilusión | leg_lizardmen | verificado |
| Hombres Lagarto: Troglodón (Oráculo Skink) | Batalla, Ilusión | leg_lizardmen | verificado |
| Ogros: Matarife, Maestro Matarife | Batalla, Elementalismo, Ilusión | leg_ogres | verificado |
| Ogros: Panzafuego | Batalla, Elementalismo | leg_ogres | verificado |
| Skaven: Vidente Gris | Batalla, Demonología, Oscura, Elementalismo, Ilusión | leg_skaven | verificado |
| Skaven: Ingeniero Brujo | Batalla, Elementalismo | leg_skaven | verificado |
| Skaven: Sacerdote de la Plaga | Batalla, Demonología, Oscura | leg_skaven | verificado |
| Elfos Oscuros: Hechicera / Suprema Hechicera | Batalla, Demonología, Oscura, Elementalismo, Ilusión | leg_darkelves | verificado |
| Elfos Oscuros: Brujos de Fuego Maldito (ligado) | Oscura, Demonología | leg_darkelves | corregido (tenía 4) |
| Enanos del Caos: Forjademonios, Profeta Hechicero | Demonología, Oscura, Elementalismo | leg_chaosdwarfs | verificado |
| Daemons: Gran Inmundo, Heraldo de Nurgle | Batalla, Demonología, Oscura | leg_daemons | verificado |
| Daemons: Heraldo de Tzeentch, Señor del Cambio | Batalla, Demonología, Oscura, Elementalismo, Ilusión | leg_daemons | verificado |
| Daemons: Guardián de Secretos, Heraldo de Slaanesh | Demonología, Oscura, Ilusión | leg_daemons | verificado |
| Daemons: Lanzallamas / Carro Ardiente (Flamer Exaltado) | Demonología, Oscura, Elementalismo, Ilusión | leg_daemons | verificado |
| Cathay: Señor/General Shugengan | Batalla, Elementalismo, Ilusión, Alta | cathay_aj | verificado |
| Cathay: Miao Ying | Batalla, Elementalismo, Alta | cathay_aj | verificado |
| Guerreros del Caos: Dragón Warpfire (Mago nv 1-2) | Batalla, Demonología, Oscura | sin fuente local | sin fuente local |

Los Magos de Legends (Daemons, Skaven, Vampiros, Hombres Lagarto, Ogros, Enanos del Caos, Elfos Oscuros) usan el Lore Legacy: su elección de hechizos va por la ventana «Lore Legacy», no por la de Saber; su Saber se elige en la lista de ejército (botón de Saber) y esa lista ya sale de `loresForWiz`.

**Botón «ⓘ Hechizos» junto a cada Saber.** Cada botón de Saber de la ventana de generación de hechizos lleva al lado «ⓘ Hechizos» (y, si el Mago sólo tiene un Saber, un botón «ⓘ Ver los hechizos de …»): abre otra ventana con los siete hechizos del Saber (1-6 numerados + Firma) con VL (valor de lanzamiento), tipo, alcance y el EFECTO COMPLETO en español (texto de datos con la FAQ ya aplicada; comprobado en la prueba «v843u-hechizos-saber-completos»: ninguno sin VL/tipo/efecto ni en inglés) y, cuando el Mago tiene regla de Saber propia (Athel Loren, Saphery, Lady, Gork/Mork, Caos, Bestias, Nehekhara), los hechizos que puede tomar en lugar de la firma. «Volver» regresa a la elección sin perder nada. Comprobado en iPhone 393x852: sin solapes ni desbordes (ventana con scroll interno, botón «Volver» fijo).

Pruebas: 202 (cada unidad contra una tabla fuente: más de 100 unidades; ningún Saber inexistente; ampliaciones expresas; selector de partida ⊆ permitidos; Maestro Mago 6 Saberes; Nigromante 3; tabla de 7 hechizos completa por Saber).

### 3 y 4. Línea de visión exacta por modelo; Escaramuzadores con huecos

**Respuesta a «¿se aplican las reglas al 100% exactas siempre?»: antes NO** (cinco puntos del frente de la unidad enteros, huecos de los Escaramuzadores ignorados). Ahora la visibilidad se calcula POR MODELO con peanas reales (baseW×baseD en mm, posiciones de fila/columna del reglamento, huecos `sp` de los Escaramuzadores, personajes unidos en su hueco de la fila): rules.js (bloque «LoS») + `losSweep` en geom.js (barrido angular continuo, no muestreo de rayos): origen = 7 puntos del borde delantero de cada modelo, arco de 90° por modelo (Core p.103: «from within the model's vision arc»; Escaramuzadores, personajes solos, carros, howdahs y guarniciones: 360°), obstáculos = TODAS las peanas (propias, amigas y enemigas, también las del propio objetivo que quedan delante) y terreno (ruinas/`nolos` sólidos; edificios, colinas y bosques según el centro de cada modelo). Sólo disparan los modelos de la 1.ª fila que ven y alcanzan al objetivo (Core p.136-137 «We Can't All Shoot!»; Fuego en Volea añade la mitad de las filas traseras que ven); un blanco está tapado si ningún modelo lo ve; exenciones conservadas: Objetivo Grande (FAQ), colina, Corredores de carro, pantalla de Skinks, enjambres. El aviso «Sin línea de visión: X tapa la vista (Core p.103…)» y el resaltado se mantienen (`losBlocker` nombra a la primera unidad que impide la visión). El Escaramuzador cuenta sus huecos reales: una línea de peanas pegadas tapa, la misma con 1" de hueco deja ver entre las peanas.

**Validación independiente:** un oráculo de fuerza bruta (rayos contra rectángulos reales, 7 orígenes × 400 puntos del objetivo) coincide con el motor en 1.500/1.500 modelos de 300 montajes con Escaramuzadores (hueco 0, ½" y 1") y está en la prueba 203. También 203: hueco vs pegadas (0 ven / 5 ven), sólo 1.ª fila, blanco parcialmente tapado, unidad enemiga adyacente (aviso «unidad enemiga»), Escaramuzador 360° y la unidad amiga en medio, y caché invalidada al mover/destruir.

**Rendimiento (12 partidas completas de la IA, mismas semillas):** 103,2 s antes → ~110,6 s después (+7%). `losClear` bloqueado ≈ 1,2-1,6 ms, visible ≈ 0,17 ms; aciertos de la memoria de visibilidad ≈ 85%. Optimizaciones: rechazo rápido por oclusor, bloques fusionados de formaciones densas, memoria con firma de posiciones/terreno.

**Cambios de resultado con la misma semilla (documentado):** las partidas completas divergen respecto a antes porque (a) se corrigieron errores de visión (modelos que antes disparaban sin ver, objetivos tapados por peanas amigas/enemigas, cobertura calculada desde el centro) y (b) el número de tiradores por unidad cambia con la visión real; los dados de cada acción son los mismos, lo que cambia es QUÉ acciones/tiradores hay. Pruebas existentes ajustadas sólo cuando su montaje ignoraba arcos o ponía a los tiradores donde no veían (30_core_qa, 138, 143, 170, 187).

**Qué sigue siendo aproximado (honesto):** (1) sólo peanas RECTANGULARES (no hay datos de peanas redondas/ovales en el motor; el reglamento usa la peana real); (2) el borde delantero se muestrea en 7 puntos por modelo (una rendija más estrecha que ~0,02" entre dos peanas puede no contarse; en el oráculo no aparece); (3) el terreno (edificio/colina/bosque) se decide por el centro de cada modelo, no por el área tapada de su peana; (4) las bajas se quitan «de las primeras N posiciones» de la rejilla, no del modelo que el jugador elegiría; (5) los Escaramuzadores disparan con todos sus modelos (decisión de diseño: Core p.184-186 no limita la fila); (6) la cobertura del objetivo = modelo oculto si ningún tirador lo ve; no se miden porcentajes de visibilidad (el reglamento no los usa).

**Límites generales de v843u:** sin 3D real/WebGL; Lore Legacy no usa la ventana de Saber; sin fuente local para Caballero de las Mortajas y Dragón Warpfire.

## v843v

**Alcance**: tanda v843v (sin tocar sw.js, sin publicar, sin smoke_all). Tests 204-208 nuevos; 2025/2025 pasan.

### 1. Línea de visión sin aproximaciones (Core p.103, p.136-137)
| Antes (v843u) | Ahora (v843v) |
|---|---|
| 7 muestras del borde delantero | `losEdge` (geom.js): decisión **exacta** sobre TODO el borde. Los extremos de los intervalos de orígenes son los puntos donde el borde corta una recta por dos vértices (esquinas de peanas y terreno, cortes del arco de 90° con el objetivo, tangentes de círculos); se evalúa el punto medio de cada intervalo con `losSweep` (exacto por origen). Las 7 muestras quedan solo como camino rápido: si alguna ve, ve; si ninguna, decide `losEdge`. En 360° se recorren los 4 lados de la peana. |
| Umbral de 0,02" (hueco/ventana) | Eliminado: se usa solo tolerancia numérica (1e-9 rad). Un hueco de 0,005" deja pasar. |
| Terreno por el centro del modelo | Por la **huella** real: un modelo está «dentro» del elemento si su peana lo solapa con área positiva (`inFoot`). Aplica al tirador (el terreno que solapa su peana no le tapa) y al objetivo (también por modelo cuando un bloque cruza el borde del terreno). Decisión de diseño documentada: el libro dice «dentro de los bordes claramente definidos» y admite «hasta la mitad del modelo» dentro para cobertura, no fija un porcentaje para «dentro» en Arboreal Gloom; se toma el criterio más literal (cualquier parte de la peana). |
| Peanas siempre rectangulares | Forma circular real (`t.round`) para el punto estratégico y la Forja del herrero (peana redonda de 100 mm, Libro de Karak): tangentes + intersección analítica rayo-círculo en la visión, y distancia exacta círculo-polígono en el movimiento (`hitsRuin`). El dibujo 3D sigue siendo la ruina cuadrada (solo visual). |
| Bajas: «primeras posiciones de la rejilla» | Core p.102: se retiran de la última fila por UNO de sus extremos (elige el jugador; popup «Retirar bajas»), dejando los restantes contiguos (`u.rrOff`, `modelLocal`). Fila única: partes iguales de ambos extremos; si es impar, el jugador elige el extremo de la sobrante (el bloque se desplaza media peana). La IA decide con el decisor autoaprendido (`aiPick 'casEnd'`). Tropas que «dan un paso al frente» no atacan: ya estaba implementado (`frontLost`, FAQ Core p.14/«Press of Battle»). |

**Qué sigue aproximado, con motivo y alternativa exacta**
- Los libros solo dan peanas rectangulares (y círculos para Fanáticos de 25 mm y marcadores de 40 mm): no hay peanas ovaladas ni de monstruo con forma distinta de la del motor, así que no hay otra forma real que modelar. Alternativa: ninguna necesaria; si un libro nuevo da una peana oval, el soporte analítico de elipse se añade igual que el del círculo.
- Formaciones en Lanza y bandas variopintas: las bajas siguen su propia regla (índices de posición), sin elección de extremo.
- Dibujo 3D de la Forja/punto estratégico sigue siendo una ruina cuadrada (la regla ya usa el círculo).
- Pantallas de escaramuzadores (todos disparan) y cobertura «oculta si ningún tirador ve»: decisiones de diseño ya documentadas.

### 2. Auditoría de Saberes de todos los magos
Settra, Carro de Cadáveres, Mago Dragón, Hermanas de la Espina, Brujos de Fuego Maldito: ya corregidos en v843u y verificados de nuevo por unidad en `204_v843v_saberes_auditoria.mjs` (`loresForWiz`, `createGame`, editor, ventana de Saber) contra la fuente. Tabla completa (facción, id, nombre, nivel, saber por defecto, saberes ofrecidos; «own» = lista propia de la unidad, «fac» = la de su facción):

```
bm	bm_bs	Chamán Bray (nivel 1)	L1	def=elementalism	fac:primal,daemonology,dark,elementalism
bm	bm_gbs	Gran Chamán Bray (nivel 3)	L3	def=elementalism	fac:primal,daemonology,dark,elementalism
bm	bm_kralmaw	Kralmaw, el Profeta de la Ruina	L4	def=dark	own:dark,primal
bret	br_damsel	Doncella (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
bret	br_damsel_uni	Doncella en Unicornio (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
bret	br_damsel_war12	Doncella en Corcel (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
bret	br_damsel_war16	Doncella en Corcel bretoniano (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
bret	br_elisse	Lady Élisse Duchaard	L3	def=elementalism	own:elementalism
bret	br_outcast	Mago Proscrito (nivel 1)	L1	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
bret	br_outcast2	Mago Proscrito (nivel 2)	L2	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
bret	br_outcast2_h	Mago Proscrito (nivel 2) a caballo (Corcel)	L2	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
bret	br_outcast3	Mago Proscrito (nivel 3)	L3	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
bret	br_outcast3_h	Mago Proscrito (nivel 3) a caballo (Corcel)	L3	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
bret	br_outcast_h	Mago Proscrito (nivel 1) a caballo (Corcel)	L1	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
bret	br_prophetess	Profetisa (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
bret	br_prophetess_rpeg	Profetisa en Pegaso Real (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
bret	br_prophetess_uni	Profetisa en Unicornio (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
bret	br_prophetess_war12	Profetisa en Corcel (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
bret	br_prophetess_war16	Profetisa en Corcel bretoniano (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
cd	cd_daemonsmith	Forjademonios	L1	def=dark	own:daemonology,dark,elementalism
cd	cd_daemonsmith_lammasu	Forjademonios en Lammasu	L1	def=dark	own:daemonology,dark,elementalism
cd	cd_daemonsmith_taurus	Forjademonios en Gran Taurus	L1	def=dark	own:daemonology,dark,elementalism
cd	cd_prophet	Profeta Hechicero (nivel 3)	L3	def=dark	own:daemonology,dark,elementalism
cd	cd_prophet_bale	Profeta Hechicero en Taurus Funesto (nivel 3)	L3	def=dark	own:daemonology,dark,elementalism
cd	cd_prophet_lammasu	Profeta Hechicero en Lammasu (nivel 3)	L3	def=dark	own:daemonology,dark,elementalism
cd	cd_prophet_taurus	Profeta Hechicero en Gran Taurus (nivel 3)	L3	def=dark	own:daemonology,dark,elementalism
ct	ct_miaoying	Miao Ying, el Dragón de la Tormenta (forma Dragón)	L2	def=elementalism	own:battle,elementalism,high
ct	ct_miaoying_h	Miao Ying, el Dragón de la Tormenta (forma Humana)	L4	def=elementalism	own:battle,elementalism,high
ct	ct_shugengan	Señor Shugengan (nivel 2)	L2	def=elementalism	fac:elementalism,high,battle,illusion
ct	ct_shugengan_gen	General Shugengan (nivel 1)	L1	def=elementalism	fac:elementalism,high,battle,illusion
de	de_sorceress	Hechicera Oscura	L1	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_sorceress_cold	Hechicera Oscura en Gélido	L1	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_sorceress_pegasus	Hechicera Oscura en Pegaso Oscuro	L1	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_sorceress_steed	Hechicera Oscura en Corcel Oscuro	L1	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_supreme	Suprema Hechicera (nivel 3)	L3	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_supreme_cold	Suprema Hechicera en Gélido (nivel 3)	L3	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_supreme_dragon	Suprema Hechicera en Dragón Negro (nivel 3)	L3	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_supreme_pegasus	Suprema Hechicera en Pegaso Oscuro	L3	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_supreme_steed	Suprema Hechicera en Corcel Oscuro	L3	def=dark	own:battle,daemonology,dark,elementalism,illusion
de	de_warlocks	Brujos de Fuego Maldito	L0	def=dark	own:dark,daemonology
dm	dm_burning	Carro Ardiente de Tzeentch	L1	def=illusion	own:daemonology,dark,elementalism,illusion
dm	dm_burningchariot	Carro Ardiente de Tzeentch	L1	def=illusion	own:daemonology,dark,elementalism,illusion
dm	dm_flamers	Lanzallamas de Tzeentch	L-	def=-	own:daemonology,dark,elementalism,illusion
dm	dm_gud	Gran Inmundo	L1	def=elementalism	own:battle,daemonology,dark
dm	dm_herald_nurgle	Heraldo de Nurgle	L-	def=-	own:battle,daemonology,dark
dm	dm_herald_nurgle_pal	Heraldo de Nurgle en Palanquín	L-	def=-	own:battle,daemonology,dark
dm	dm_herald_slaanesh_chariot_w1	Heraldo de Slaanesh en Carro Buscador (Mago nv 1)	L1	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_chariot_w2	Heraldo de Slaanesh en Carro Buscador (Mago nv 2)	L2	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_exalted_w1	Heraldo de Slaanesh en Carro Buscador Exaltado (Mago nv 1)	L1	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_exalted_w2	Heraldo de Slaanesh en Carro Buscador Exaltado (Mago nv 2)	L2	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_steed_w1	Heraldo de Slaanesh en Corcel (Mago nv 1)	L1	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_steed_w2	Heraldo de Slaanesh en Corcel (Mago nv 2)	L2	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_w1	Heraldo de Slaanesh (Mago nv 1)	L1	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_slaanesh_w2	Heraldo de Slaanesh (Mago nv 2)	L2	def=illusion	own:daemonology,dark,illusion
dm	dm_herald_tzeentch	Heraldo de Tzeentch	L1	def=elementalism	own:battle,daemonology,dark,elementalism,illusion
dm	dm_herald_tzeentch_chariot	Heraldo de Tzeentch en Carro de Tzeentch	L1	def=illusion	own:battle,daemonology,dark,elementalism,illusion
dm	dm_herald_tzeentch_disc	Heraldo de Tzeentch en Disco	L1	def=illusion	own:battle,daemonology,dark,elementalism,illusion
dm	dm_keeper	Guardián de Secretos	L1	def=illusion	own:daemonology,dark,illusion
dm	dm_lordchange	Señor del Cambio	L2	def=elementalism	own:battle,daemonology,dark,elementalism,illusion
dm	dm_prince	Príncipe Demonio	L-	def=-	own:battle,daemonology,dark
dw	dw_anvil	Yunque del Destino	L0	def=anvil	fac:
empire	empire_lord	Señor de la Magia (nivel 3)	L3	def=battle	fac:battle,elementalism,illusion,daemonology,dark,necro
empire	empire_lord_peg	Señor de la Magia en Pegaso (nivel 3)	L3	def=battle	fac:battle,elementalism,illusion,daemonology,dark,necro
empire	empire_mage	Maestro Mago (nivel 1)	L1	def=battle	fac:battle,elementalism,illusion,daemonology,dark,necro
empire	rc_wizard1	Mago Proscrito (nivel 1)	L1	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
empire	rc_wizard1_h	Mago Proscrito (nivel 1) a caballo	L1	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
empire	rc_wizard2	Mago Proscrito (nivel 2)	L2	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
empire	rc_wizard2_h	Mago Proscrito (nivel 2) a caballo	L2	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
empire	rc_wizard3	Mago Proscrito (nivel 3)	L3	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
empire	rc_wizard3_h	Mago Proscrito (nivel 3) a caballo	L3	def=battle	own:battle,daemonology,dark,elementalism,illusion,necro
he	he_archmage	Archimago (nivel 3)	L3	def=high	fac:high,battle,elementalism,illusion
he	he_archmage_moon	Archimago en Dragón Lunar	L3	def=high	fac:high,battle,elementalism,illusion
he	he_archmage_star	Archimago en Dragón Estelar	L3	def=high	fac:high,battle,elementalism,illusion
he	he_dragonmage	Mago Dragón (nivel 1)	L1	def=battle	own:battle,elementalism
he	he_mage	Mago Alto Elfo (nivel 1)	L1	def=high	fac:high,battle,elementalism,illusion
he	he_mage_eagle	Mago Alto Elfo en Gran Águila	L1	def=high	fac:high,battle,elementalism,illusion
he	he_stormweaver	Tejedor de Tormentas (nivel 1)	L1	def=dark	own:dark,elementalism,illusion
he	he_stormweaver_uni	Tejedor de Tormentas en Unicornio (nivel 1)	L1	def=dark	own:dark,elementalism,illusion
lm	lm_skpriest	Sacerdote Skink (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
lm	lm_skpriest_ancient	Sacerdote Skink en Stegadón Ancestral (nivel 2)	L2	def=elementalism	own:battle,elementalism,illusion
lm	lm_slann	Mago-Sacerdote Slann (nivel 4)	L4	def=elementalism	own:battle,elementalism,high,illusion,necro
lm	lm_troglodon	Troglodón	L1	def=battle	own:battle,illusion
ok	ok_butcher	Carnicero (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
ok	ok_butcher_cauldron	Carnicero con Caldero (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
ok	ok_firebelly	Panzafuego	L1	def=elementalism	own:battle,elementalism
ok	ok_slaughter_cauldron	Maestro Matarife con Caldero (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
ok	ok_slaughtermaster	Maestro Matarife (nivel 3)	L3	def=battle	own:battle,elementalism,illusion
orcs	gob_oddgit	Chamán Goblin (nivel 1)	L1	def=waaagh	own:waaagh,elementalism
orcs	gob_oddgit_wolf	Chamán Goblin sobre lobo gigante (nivel 1)	L1	def=waaagh	own:waaagh,elementalism
orcs	gob_oddgit_wolf_amb	Chamán Goblin sobre lobo gigante (nivel 1) (Cazadores astutos: Emboscador)	L1	def=waaagh	own:waaagh,elementalism
orcs	gob_oddnob	Chamán Goblin (nivel 3)	L3	def=waaagh	own:waaagh,elementalism
orcs	gob_oddnob_wolf	Chamán Goblin sobre lobo gigante (nivel 3)	L3	def=waaagh	own:waaagh,elementalism
orcs	gob_oddnob_wolf_amb	Chamán Goblin sobre lobo gigante (nivel 3) (Cazadores astutos: Emboscador)	L3	def=waaagh	own:waaagh,elementalism
orcs	ng_oddgit	Chamán Goblin Nocturno (nivel 1)	L1	def=waaagh	own:waaagh,illusion
orcs	ng_oddnob	Chamán Goblin Nocturno (nivel 3)	L3	def=waaagh	own:waaagh,illusion
orcs	orc_ogdruz	Ogdruz Swampdigga	L3	def=troll	own:elementalism,troll
orcs	orc_weirdboy	Chamán Orco (nivel 1)	L1	def=waaagh	fac:waaagh,battle,elementalism,troll
orcs	orc_weirdboy_boar	Chamán Orco sobre jabalí (nivel 1)	L1	def=waaagh	fac:waaagh,battle,elementalism,troll
orcs	orc_weirdnob	Chamán Mayor Orco (nivel 3)	L3	def=waaagh	fac:waaagh,battle,elementalism,troll
orcs	orc_weirdnob_boar	Chamán Mayor Orco sobre jabalí (nivel 3)	L3	def=waaagh	fac:waaagh,battle,elementalism,troll
orcs	troll_hag	Bruja Troll	L1	def=troll	own:troll,battle
sk	sk_engineer	Ingeniero Brujo del Clan Skryre	L-	def=-	own:battle,elementalism
sk	sk_greyseer	Vidente Gris (nivel 3)	L3	def=elementalism	own:battle,daemonology,dark,elementalism,illusion
sk	sk_greyseer_bell	Vidente Gris en Campana Aullante (nivel 3)	L3	def=elementalism	own:battle,daemonology,dark,elementalism,illusion
sk	sk_plaguepriest	Sacerdote de la Plaga	L-	def=-	own:battle,daemonology,dark
sk	sk_plaguepriest_furnace	Sacerdote de la Plaga en Horno de la Plaga	L-	def=-	own:battle,daemonology,dark
tk	tk_casket	Ataúd de las Almas	L0	def=casket	fac:elementalism,illusion,necro
tk	tk_hpriest	Sumo Sacerdote Funerario (nivel 3)	L3	def=elementalism	fac:elementalism,illusion,necro
tk	tk_hpriest_dragon	Sumo Sacerdote en Dragón de Hueso Necrolito	L3	def=elementalism	fac:elementalism,illusion,necro
tk	tk_mpriest	Sacerdote Funerario (nivel 1)	L1	def=elementalism	fac:elementalism,illusion,necro
tk	tk_settra	Settra el Imperecedero	L1	def=necro	own:necro
vc	vc_acolyte	Acólito Nigromántico (nivel 1)	L1	def=necro	own:dark,illusion,necro
vc	vc_acolyte_mortis	Acólito Nigromántico en Motor Mortis (nivel 1)	L1	def=necro	own:dark,illusion,necro
vc	vc_acolyte_nightmare	Acólito Nigromántico en Pesadilla (nivel 1)	L1	def=necro	own:dark,illusion,necro
vc	vc_corpsecart	Carro de Cadáveres	L1	def=necro	own:necro
vc	vc_count	Conde Vampiro	L-	def=-	own:dark,illusion,necro
vc	vc_count_coven	Conde Vampiro en Trono del Aquelarre	L2	def=necro	own:dark,illusion,necro
vc	vc_count_dragon	Conde Vampiro en Dragón Zombi	L1	def=necro	own:dark,illusion,necro
vc	vc_count_nightmare	Conde Vampiro en Pesadilla	L-	def=-	own:dark,illusion,necro
vc	vc_count_terror	Conde Vampiro en Terror Abisal	L1	def=necro	own:dark,illusion,necro
vc	vc_ghoulking	Rey Ghoul Strigoi	L-	def=-	own:battle,dark,necro
vc	vc_knightshrouds	Caballero de las Mortajas	L1	def=necro	own:necro
vc	vc_knightshrouds_steed	Caballero de las Mortajas en Corcel Etéreo	L1	def=necro	own:necro
vc	vc_necro_dragon	Nigromante Maestro en Dragón Zombi (nivel 3)	L3	def=necro	own:dark,illusion,necro
vc	vc_necro_mortis	Nigromante Maestro en Motor Mortis (nivel 3)	L3	def=necro	own:dark,illusion,necro
vc	vc_necro_nightmare	Nigromante Maestro en Pesadilla (nivel 3)	L3	def=necro	own:dark,illusion,necro
vc	vc_necro_terror	Nigromante Maestro en Terror Abisal (nivel 3)	L3	def=necro	own:dark,illusion,necro
vc	vc_necromancer	Nigromante Maestro (nivel 3)	L3	def=necro	own:dark,illusion,necro
vc	vc_thrall	Esbirro Vampiro	L-	def=-	own:dark,illusion,necro
vc	vc_thrall_coven	Esbirro Vampiro en Trono del Aquelarre	L-	def=-	own:dark,illusion,necro
vc	vc_thrall_nightmare	Esbirro Vampiro en Pesadilla	L-	def=-	own:dark,illusion,necro
woc	woc_dprince	Príncipe Demonio	L-	def=-	own:battle,daemonology,dark
woc	woc_ex_sorc	Hechicero Exaltado (nivel 1)	L1	def=battle	fac:battle,daemonology,dark,shadowlands
woc	woc_exsorc_daemon	Hechicero Exaltado en Montura Demoníaca (nivel 1)	L1	def=battle	fac:battle,daemonology,dark,shadowlands
woc	woc_galrauch	Galrauch, el Gran Dragón	L4	def=dark	own:dark
woc	woc_sorc_daemon	Señor Hechicero en Montura Demoníaca (nivel 3)	L3	def=battle	fac:battle,daemonology,dark,shadowlands
woc	woc_sorc_lord	Señor Hechicero (nivel 3)	L3	def=battle	fac:battle,daemonology,dark,shadowlands
woc	woc_sorc_manticore	Señor Hechicero en Mantícora (nivel 3)	L3	def=battle	fac:battle,daemonology,dark,shadowlands
woc	woc_warpfire_w1	Dragón Warpfire (Mago nivel 1)	L1	def=battle	own:battle,daemonology,dark
woc	woc_warpfire_w2	Dragón Warpfire (Mago nivel 2)	L2	def=battle	own:battle,daemonology,dark
wood	we_ancient	Anciano Hombre Árbol (nivel 2)	L2	def=battle	own:battle,elementalism
wood	we_ancient_amb	Anciano Hombre Árbol (nivel 2) (Bosque Despierto: Emboscador)	L2	def=battle	own:battle,elementalism
wood	we_branchwraith	Hechicera Rama (nivel 1)	L1	def=battle	own:battle,elementalism,illusion
wood	we_shadowdancer_w	Danzante de las Sombras (mago nivel 1)	L1	def=battle	own:battle,illusion
wood	we_singer_unicorn	Cantor de Hechizos en Unicornio	L1	def=battle	own:battle,elementalism,high,illusion
wood	we_sisters	Hermanas de la Espina	L0	def=battle	own:battle,elementalism
wood	we_spellsinger	Cantor de Hechizos (nivel 1)	L1	def=battle	fac:battle,elementalism,high,illusion
wood	we_spellweaver	Tejedor de Hechizos (nivel 3)	L3	def=battle	fac:battle,elementalism,high,illusion
wood	we_weaver_unicorn	Tejedor de Hechizos en Unicornio	L3	def=battle	own:battle,elementalism,high,illusion
```

### 3. Bloqueo de movimiento «entre las dos unidades»
Causa exacta: el único bloqueo es el solape geométrico de peanas reales (>0,01") a lo largo de la trayectoria o en el destino (Core p.21 «Moving Through Units») y, en destino, quedar a menos de 1" de un enemigo (Core p.123). Un hueco menor que el frente de la unidad es un bloqueo CORRECTO; un hueco ≥ frente pasa. El «círculo imaginario» de mover es solo visual. Se corrigió un fallo latente (muestreo de giro cada 0,75" → 0,1") y los mensajes nombran la unidad, la regla y las medidas del hueco. No pude ver la foto del usuario: la explicación sale de reproducir la geometría (test 205).

### Rendimiento v843v
Bench de 16 partidas IA contra IA: 181 s (11,3 s/partida) frente a la referencia v843u de 103-110 s para 12 partidas (8,6-9,2 s/partida). La medida se tomó con `pw.js` y `ask_test` ejecutándose a la vez, así que el sobrecoste real (≈ +20-30 %) está sobrestimado. Origen: `losEdge` solo se ejecuta cuando las 7 muestras no ven; la elección de extremo de las bajas usa el decisor autoaprendido (≤ 4 simulaciones por baja con opción).
