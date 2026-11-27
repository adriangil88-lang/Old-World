# progreso8 — v839 cobertura completa IV

## Lote 1 (tests 132–135, helpers tests/_it2.mjs)
- Objetos: disparos (−1 adicional), salvaciones (armadura/especial/repeticiones/inmunidades), combate contra el portador, perfil de ataque.
- Correcciones de motor halladas:
  1. Collar de Zorga (rh.txt:1892-1898): el −1 se aplicaba a toda la unidad de caballería (jinete incluido) y nunca a carros (regex sobre `tt`); ahora solo a los ataques de la montura / bestias de tiro.
  2. Estandarte de la Ira del Dragón (ct_dragonwrath): «Ataques flamígeros» no estaban en el perfil; añadido.
  3. Temple caballeresco: D3 de Ataques con rnd() en vez de d3() (sin efecto en reglas; ahora determinista en pruebas).

## Lote 2–3 (tests 136–142)
- Más correcciones de motor:
  4. Vara de Toma de Tierra (core.txt:11188-11189 «can use … to re-roll»): se aplicaba siempre; ahora es opcional (popup en el momento; decisor con valor por defecto).
  5. Collar de Khorne (leg_daemons.txt:1144-1146 «improves its Magic Resistance by 1»): no mejoraba la RM natural (max); ahora suma +1 (`mrPlus`, máx. 3).

## Lote 4 (144-147): psicología/ruptura, dispersión, percances, hechizos
- 144_it_psy: León Dorado/León de Jade, Gemebundo, Imperial, Sangre Fría, Guff, Reluciente, Deber, Valeroso, Gema del Valor, Estoicismo, Laureles, Firmes.
- Corrección 7: Rally con León de Jade (okl_lion) no repetía el chequeo de Reagrupar (rallyTest solo miraba `rrPsy`): corregido.
- Corrección 8: Runa de Rompehechizos / Sello de Asuryan se usaban SIEMPRE automáticamente al primer intento (fof.txt:1470-1472 «may use it instead of making a dispel attempt»): ahora opción del popup «Objeto de dispersión» (IA: decisor aprendido).
- Corrección 9: Espejo de Plata, Colgante del Embaucador, Runa de Equilibrio, Bastón de Roble: el dado extra se tiraba DESPUÉS de ver la tirada fallida y descartando los dados originales (fof.txt:4280-4284, 1489-1492, 5766-5770); ahora se declara antes de tirar (popup Espejo/Colgante; Equilibrio/Roble automáticos y anunciados) y la tirada es 2D6+D6 descartando el menor, con la regla de dobles 1 solo en Espejo/Colgante.
- Corrección 10: Bastón de Solidez (aj_highelves.txt:1773 «may choose not to») y Manos Ahuecadas («nominates an enemy character», leg_lizardmen.txt:824): ahora popup.
- Corrección 11: Tomo de los Dioses Oscuros (aj_chaos2.txt:1709-1714): el motor sustituía todos los hechizos por los cuatro del Caos en orden fijo; ahora acción tomePick (UI en despliegue + IA aprendida) para descartar los que se quiera y elegir del Saber del Caos.
- 145_it_dispel2, 146_it_miscast, 147_it_spells: Rompehechizos, Sello, Sangre del Sombrío, Vial, Espejo, Colgante, Equilibrio, Cogitación, Disrupción, Roble; Vara, Solidez, Alma de Piedra, Manos Ahuecadas, Varita; Feng Shi Bo, Ogvold, Capa de Po Mei, Tomo.

## Lote 5 (148-157): disparo, melee, mando, últimas heridas, runas de máquina, inicio de combate
- Corrección 12 (importante): `resolveShot` pisaba `magical` y `noArmour` de `wopts` en la herida general (`wo = {...wopts, noArmour: !!r.noArmour, magical: arrow==='moon'}`): ningún arma a distancia mágica (Ira de Vaul, Runa Encantada, Diente de Hidra…) hería como mágica y la Runa de Ensartar/Viento Envenenado perdía «sin armadura». Corregido (se conservan los de wopts).
- Corrección 13: Arco de Loren y Maldición de Asyendi no tenían Ataques mágicos (ni Disparo rápido el segundo) en el perfil de `rangedOf` (fof.txt:5692, 5703-5705): añadido.
- Corrección 14: Flecha de la Fatalidad / Gemebunda / de Plaga se gastaban automáticamente al primer disparo con impactos; ahora popup antes de disparar (decisor aprendido en la IA).
- Corrección 15: Piedra del Rencor, Kanopi de Enkhil y Vasija Hierática se aplicaban con heurística fija del motor; ahora popup (IA: aiPick con la heurística como primera candidata). Collar de Shapesh ya no se gasta si no hay un modelo amigo que muera en su lugar.
- Corrección 16: Estandarte del Cambio/Aquiescencia, Matanza de Duendes, Aura de dolor: «una unidad enemiga trabada» a elección del jugador (popup con varios enemigos); el Aura de dolor ahora pide confirmar el uso (una vez por partida).
- Pruebas 148 (Loren, Asyendi, Vaul, Diente, Vuelo, flechas), 149 (Moneda, Fortuna, Orión, Rencor, Parravon, Túmulos, Tejido), 150 (Runa de la Verdadera Bestia, Equilibrio, Confianza, Himno, Toro, Rencor), 151-152 (Mando), 153 (últimas Heridas), 154 (runas de ingeniero), 155 (runas de máquina), 156 (inicio de combate), 157 (alientos, Autoridad).

## Lote 6 (158-161): resto de objetos, FAQ no automatizables, Runa de Hender
- 158_it_misc2 / 159_it_misc3: Hoz de Grut (popup con enemigos/amigos candidatos), Collar de Shapesh (solo se consume si hay víctima), popups de Piedra del Rencor/Kanopi/Vasija, etc. (ver lotes 4-5).
- 160_it_misc4: los últimos 40 objetos sin prueba (Justa, Confianza, Guantelete, Redecillas, Malévolos, Icor ácido, Locus, Quebrar, Destierro, Beastkiller, Grungni, Paso, Sigilo, Mirada Cautivadora, Jaguar, Rakaph, Maw Rúnico, Calma, Bola de Cristal, Reliquia/Voluntad, Orbe, Canto de Sirena, Tapiz, Lothern, Batalla Sin Fin, Ojo Guía, Devorador de Hechizos, Icono de Hechicería, Favor de los Dioses, Ojo de Numas, Mapa/Almanaque, Cuerno de la Gran Cacería, Tótem de la Guerra Eterna, Globo, Broche, Colgante de Duramen, Diente Sangriento, Deliberaciones Errantes). Quedan 0 objetos sin prueba (left.sh = 0).
- Corrección 17 (importante): un desafío entre dos personajes solitarios (me.k 's' contra foe.k 's') iba por el camino de ataque normal y sus golpes NO se marcaban como de desafío: Icor ácido (RH p.77) nunca actuaba, y Fastidio de Redecillas, Hoja del Cabecilla (duelHit), Confianza y Tatuaje Intrépido (repetir impactos en desafío) tampoco. Ahora el golpe lleva `duel` y las comprobaciones de desafío (impactar, repetir, Icor) también se aplican en ese camino.
- Corrección 18: Bola de Cristal (aj_empire2.txt:1706-1709 «re-roll a single roll To Hit or To Wound»): solo se aplicaba a las tiradas para impactar; ahora también a la primera tirada para herir con éxito contra un personaje amigo en el alcance de mando del portador (una vez por turno entre ambas).
- Corrección 19: Ojo Guía: si el jugador rehusaba el popup se repetían igualmente los impactos fallados (la variable no se anulaba); ahora solo se repite si se usa (y solo entonces se gasta).
- Corrección 20 (texto del registro): el texto del Globo de la Muerte se perdía al recomponer la línea de disparo.
- 161_faq_na: 16 entradas FAQ pasan de «no automatizable» a prueba (core-qa-056/077/093/096/121/146/147/148/169, fof-qa-022/030/031/032, rh-qa-015/019/020/026); varios motivos antiguos eran falsos (los aliados, el Duelo del Guerrero, las flechas encantadas y las Armas Combinadas SÍ existen en el motor). Quedan 26 con motivo concreto (4 notas del asterisco + 22).
- Tarea 3: prueba v839-r_cleaving-gromril (Runa de Hender sobre arma de gromril: FP −1 total, dos runas −2, otra runa de arma anula el gromril; fof.txt:1391-1396 y 1610-1617). El motor ya cumplía el texto.
- Resultado: 1.767 pruebas, 1.767 pasan, 0 fallan; N 65 (27 líneas FAQ + 38 de listas v836); build.py ok; pw.js errors: []; ask_test: 4 partidas completas.
