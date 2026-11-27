# progreso7 — v838 cobertura completa III

## Lote 1 — reglas multi-ronda / posición por modelo (en curso)
- Arnés nuevo: behavior/lib3.mjs (pair, withLd, resolve con popups, castThr, saveThr, strategy=beginStrategy con popups, wsl=registro de woundAndSave, withoutSr).
- Tests nuevos: 91_break, 92_cathay, 93_actions, 94_duel_misc, 95_combat_start, 96_profile, 97_death, 98_command, 99_fly, 100_attacks, 101_misc2.
- Correcciones de motor halladas: Implacable no se ofrecía a unidades Inquebrantables (Centinelas); Espíritus desatados no son mágicos; Parada con tope 3+ (FAQ Core p.196).
- Lote 2: tests 102_misc3 (Potencia de vapor/Temperamental con popup, ¡Ker-splat!, Objetivo grande), 103_cmd2 (Caldero, ¡Atrincheraos!, Borrachos, Cuerno, Skaryn, Plegarias, La Sed, Hekarti, Lileath, Furia primigenia, Rabia de sangre), 104_prof2 (Vista fantasmal, Torbellino, Furia del sapo, rasgos caóticos, Percha, Heraldo, Danza), 105_undead, 106_nehek2 (¡Levantaos!, Settra, Corona, Indómito 3), 107_misc4, 108_magic2 (Pacto, Perdición de brujos, Centinela de obsidiana, Motor, Símbolo, Cmdte., Llamador, Fervor, Arcanista, Maldición, Devoraalmas), 109_misc5, 110_misc6 (Estupidez, Mov. aleatorio, Volea, Terror, Pisotón…), 111_misc7 (Mirada, Relicario, Forma deformada, Impacto atronador), 112_misc8 (Maestro artillero, Óptica, Ing. Infernal, Baliza, Desenganche, Fuga fingida, Huir a lugar seguro, Arrastrado).
- Corrección de motor: Arrastrado (draggedAlong) nunca se activaba (usaba rectDist de punto-rectángulo con dos unidades → NaN); ahora unitDist ≤ 1" (core.txt:5308-5314).

## Lote 3 (pruebas 113-131)
- Pruebas 113-117: reglas pendientes restantes (0 pendientes; 2 claves huérfanas como N con motivo).
- Pruebas 118-128, 130-131: generadores por familia de objetos (armas, armaduras, estadísticas, concesión de reglas, restricciones, resolución, disparos, salvaciones, auras, hechizos atados, pociones, mando).
- Prueba 129: Armadura del Caos por unidad (X+) + mago con armadura.
- Correcciones de motor/datos: ver VERIFICACION.md "v838 — cobertura completa III".
- Cifras: 1486 pruebas, 1486 pasan, 0 fallan, 82 N, 0 pendientes, FAQ 417/459 con prueba (42 no automatizables con motivo).
- Quedan 261 objetos sin prueba individual (lista en VERIFICACION.md).
- Comprobaciones finales: run.sh OK, build.py OK, pw.js errors: [], ask_test sin errores.
