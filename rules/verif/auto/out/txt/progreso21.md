# progreso21 — v843j tiradas con tabla propia, Liderazgo suelto, efectos solo registrados y desglose
Hecho (detalle e inventario en rules/VERIFICACION.md, «## v843j»):
- Punto de enganche común: las 484 llamadas de dados de rules.js son «sitios de tirada» con id (rzD6/rzD3/rzD2/rzD3b/rzExpr) y ficha C/G/N; con aviso previo cada una muestra su ventana antes de tirar (propia con tabla, o descriptiva). Sin ack no cambia nada (misma semilla, mismo estado; verificado tras cada acción en ≈1000 acciones IA vs IA).
- Tablas locales con ventana propia: Terreno salvaje (+ Esporas, + repetición del Mapa), Averías de máquinas ogras y de piedra/pólvora, Mirada de los Dioses (+ Juicio/Favor), Mercenarios errantes, Destrucción desmedida, Tirada de carga, salvaciones de heridas automáticas, ataques especiales de Gigante/Moledor/Frasco. Animosidad: no existe en el motor.
- 47 chequeos de Liderazgo sueltos (objetos, estandartes, reglas) pasan por rollLd (tabla 2D6 con tu Ld, una por tirada y repetición).
- Efectos solo registrados (logE): aviso previo «Efecto automático» + OK (no avisan las líneas de resultado ya avisadas).
- Desglose regla por regla: impactar melé, Resistencia efectiva, salvación de armadura, modificadores de disparo.
- Pruebas: tests/170_v843j_rolls.mjs (10, sin aserciones vacías) + ajuste menor de 169 (busca la tabla de salvaciones por título).
Pendiente: ver «Qué queda» en VERIFICACION.md v843j (313 sitios G sin tabla resaltada, 11 N en createGame, desglose parcial de especiales/lanzamiento/Ld, comprobación visual en iPhone real).
