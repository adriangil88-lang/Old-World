# progreso5 — v836 cobertura completa (reanudar desde aquí)
Arnés: rules/verif/auto/behavior (run.sh). Nuevas utilidades: lib2.mjs (one, bout, cloneType, nDice). Pruebas nuevas: tests/40_c37.mjs, 41_rules_combat.mjs, ...
## Lote 1 — C: las 37 reglas sin lectura por nombre (tests/40_c37.mjs)
- 37/37 con prueba de comportamiento (horde, bombard, cannon, motley, daBoyz, bigStabbas, warpaint, skulkers, ladyLore, arcBacklash, chaliceBr, khopesh, breathChange, foeRenderR, royalGuard, accArch, beastHandlers, safeHarm, eshinInf, countBanner, wightBanner, align_*, daemonicCharge, randomAtk, bullCharge, daemonic, leaderPack, mercCmd, peerless, cursedGods, crown, ct*). Todas se resuelven en datos u otros campos (impact.ap, handR, xS, spellAlt, tipo de unidad) y el dato es exacto.
- Sin discrepancias en este lote.
## Lote 2 — C: reglas de perfil de ataque (41_rules_combat.mjs): 28 pruebas A/B (attackProfile y dados)
## Lote 3 — C: salvaciones especiales (42_rules_saves.mjs): 29 pruebas (umbral con dados [6,d])
## Lote 4 — B: 50_b66.mjs — fof-qa-003/012/014/029/035, rh-errata-039/040/046, rh-qa-016/025/028, cathay-qa-003 (12 entradas con prueba real; se retiran sus líneas N(...,true))
## Lote 5 — D hechizos (60_spells.mjs): proyectiles/asaltos con texto simple comparados con el motor vía gancho de woundAndSave (impactos, F, FP, flamígero, sin armadura/Regeneración, Heridas múltiples) + Navaja mental y Luz de la Muerte (ramas de Ld) + resto de tipos (hex/encantamiento/vórtice/conveyance) con efecto observable. Vaul y Hogar y Patria con prueba propia.
## Lote 6 — D objetos (61_items.mjs): talismanes (ward), armaduras (sv), armas (F/FP/Ataques, disparo del objeto), grants de reglas, Resistencia a la magia, salvación especial genérica.
## Lote 7 — C (43_rules_more.mjs): abyssalHowl, commandVoice, cloudFlies, backstab, imperviousDef, slimeTrail, enfeeblingCold, accursedW, warpSent, numbChill, defStance, grisly, cryOfWar, strikeLast, elvenRef, carrionFeeders, soporific, scurry, resolute, balefire, tome, impactos de carga (mournfang/thunder/stampede/bullgors/ogreCharge), pánico (ignorePanic, holdLine, unbreakable, immunePsy, ignoreGobPanic, votos, reintentos).
- Gancho añadido en engine.mjs (solo arnés): woundAndSave registra sus argumentos en globalThis.__WSL.
- Hallazgos de motor hasta ahora: ninguna discrepancia (0 correcciones). accursedW: la FP −1 está en el dato del perfil (melee.ap=1), la magia la aplica el motor; OK con el libro (leg_vampires.txt:596-599).
## Cierre (v836)
- Totales: 783 pruebas, 783 pasan; FAQ 367/459 con prueba; 54 pendientes automatizables (lista en VERIFICACION.md «v836 — cobertura completa»). 0 correcciones de motor.
- Final: run.sh OK, build.py OK, pw.js errors: [], ask_test OK.
