# Especificación: Principios, Movimiento y Disparo (Warhammer: The Old World, Core Rulebook)

Convención de páginas: "pág. PDF" = página física del PDF. La numeración impresa del libro = PDF - 1 (el texto del reglamento cita números impresos; aquí siempre se da la física). Todo lo de abajo es literal del reglamento salvo lo marcado como "NO CLARO" o "SIMPLIFICACIÓN". Los perfiles de armas de proyectil (alcance, F, PA) están en la pág. impresa 216 (PDF 217), FUERA de este rango: no los he leído.

---
## 0. Principios generales (PDF 93-100)

- **Distancias** en pulgadas, medibles en cualquier momento; siempre entre los puntos más cercanos de las peanas (no de la bandeja). (93)
- **Mover "directamente hacia/lejos de"**: línea entre centros de las unidades; el centro de la unidad móvil se desplaza por esa línea. (93)
- Ninguna unidad puede atravesar otra, salvo excepciones (huida, esquinas durante maniobras). (93)
- **Dados** (94): D3 = D6 / 2 redondeando arriba. Fracciones al dividir siempre hacia arriba; modificadores se aplican DESPUÉS de dividir/multiplicar. Re-roll: un mismo dado nunca más de una vez; el resultado del re-roll es obligatorio; si se repite una tirada múltiple se repiten todos los dados salvo que se indique. Roll-off: gana el mayor; empate, repetir.
- **Test de característica** (98): D6 <= característica = pasa. Un 6 natural siempre falla, un 1 natural siempre pasa; característica 0 o "-" falla automáticamente. WS 0 = golpes contra él impactan automáticamente. F, R o H reducida a 0 = muerto. Si hay varios valores de la misma característica en la unidad, se usa el MÁS ALTO.
- **Test de Liderazgo** (98): 2D6 <= Ld = pasa. 12 natural (doble 6) siempre falla; 2 natural (doble 1) siempre pasa. Se usa el Ld más alto de la unidad.
- Modificadores a características: suma/resta; las de hechizos Hex/Enchantment son acumulativas pero no pueden llevar una característica por encima de 10 ni por debajo de 1 (108).
- **Plantillas** (96): blast 3" o 5" de diámetro; llama ~8". Modelo totalmente bajo la plantilla, o parcialmente bajo el agujero central de la blast = impacto automático; parcialmente bajo la plantilla = impacta con 4+. Dispersión: dado de dispersión; "Hit!" = no se mueve; flecha = se mueve la distancia de los otros dados en esa dirección ignorando terreno/unidades.
- **Perfil**: M, WS, BS, S, T, W, I, A, Ld (escala 0-10). Peanas cuadradas o rectangulares. (97, 99)

## 1. Formaciones, rangos y fuerza de unidad (PDF 101-106)

- Unidad = uno o más modelos (un personaje/monstruo solo es una unidad). Orden cerrado (Close Order): peanas en contacto lado a lado, todos mirando igual, en filas (rangos) y columnas (files). Mismo número por rango; si no es posible, el rango trasero es el incompleto. (101)
- **Combat Order**: más ancha que profunda o cuadrada (modelos por rango >= modelos por columna). Puede reclamar Rank Bonus y +1 de resultado de combate por Combat Order (nota 102: "Combat Result Bonus +1"; el desarrollo está en pág. impresa 151, fuera de mi rango). (102)
- **Marching Column**: más profunda que ancha. No reclama Rank Bonus, NO puede hacer movimiento de carga (sí declararla), puede TRIPLICAR M al marchar. (102, 120, 124)
- **Rank Bonus**: +1 por cada rango tras el primero, hasta el máximo del tipo de tropa; el rango cuenta solo si tiene el mínimo de modelos; el último rango incompleto cuenta si llega al mínimo. Unidad Disrupted no reclama Rank Bonus. (102, 106)
- **Disrupted** si: (a) es trabada por flanco o retaguardia por enemigo con Fuerza de Unidad >= 5; (b) termina el movimiento con >= 25% de sus modelos en terreno difícil o a caballo de un obstáculo lineal bajo. Skirmishers enemigos no causan Disrupted. (102)

**Tabla de tipos de tropa (PDF 106)**
| Tipo | Modelos mín. por rango | Máx. Rank Bonus | Fuerza de Unidad por modelo |
|---|---|---|---|
| Regular Infantry | 5 | +2 | 1 |
| Heavy Infantry | 4 | +2 | 1 |
| Monstrous Infantry | 3 | +2 | 3 |
| Swarms | - | - | 3 |
| Light Cavalry | 5 | +1 | 2 |
| Heavy Cavalry | 4 | +1 | 2 |
| Monstrous Cavalry | 3 | +1 | 3 |
| War Beasts | 5 | +1 | 1 |
| Light Chariots | 3 | +1 | 3 |
| Heavy Chariots | - | - | 5 |
| Monstrous Creatures / Behemoths | - | - | = Heridas iniciales |
| War Machines | - | - | = Heridas iniciales |
Unit Strength = nº modelos actuales x US por modelo.

- Heridas / bajas (103): cada herida no salvada quita 1 H. Con modelos multi-herida se pierden heridas de un modelo hasta matarlo antes de pasar al siguiente (no se reparte). Ej. Ogros H3 con 5 heridas: uno muere, otro queda con 1 H. Bajas se retiran de la fila trasera, por un extremo, manteniendo modelos adyacentes ("dar un paso adelante"); un modelo que dio un paso adelante NO puede atacar (disparo ni combate) en esa fase. Unidad de un solo rango: bajas repartidas por ambos extremos.
- Frentes (104): arcos frontal, flanco y retaguardia de 90° desde las esquinas de la peana (45°). Visión: 90° = arco frontal salvo regla contraria. Línea de visión (LdV): línea recta ininterrumpida desde el arco de visión a cualquier parte del otro modelo, sin cruzar otros modelos/unidades ni terreno. Modelos y unidades SIEMPRE bloquean LdV (normalmente solo ve el primer rango). Una unidad "ve" a otra si al menos un modelo ve al menos un modelo de la otra.
- **Cobertura** (104): objetivo totalmente visible = al descubierto; hasta la mitad oscurecida = cobertura parcial; más de la mitad oscurecida = cobertura total (visto desde el tirador).

## 2. Secuencia de turno (PDF 116-118)

Ronda = un turno de cada jugador. Turno = 4 fases, cada una con 4 sub-fases:
1. **Estrategia**: Inicio de turno -> Mando (habilidades de personajes) -> Conjuración (hechizos Enchantment/Hex; el inactivo puede disipar) -> **Rally Fleeing Troops**.
2. **Movimiento**: 1) Declarar cargas y reacciones 2) Movimientos de carga 3) Movimientos obligatorios 4) Movimientos restantes (+ hechizos de Conveyance).
3. **Disparo**: por cada unidad, secuencia completa: elegir unidad y objetivo -> tirar para impactar -> herir y salvar -> bajas y Panic.
4. **Combate** (fuera de mi rango; al final de la fase termina el turno).
Normalmente 6 rondas (puede ser 5 o 7 según escenario). El escenario decide quién empieza (normalmente roll-off).

### Rally (PDF 118)
- Por cada unidad en huida del jugador activo: test de Ld.
- Fallo: sigue huyendo. Éxito: reagrupa; puede hacer un reform libre; NO puede cargar este turno; cuenta como que se movió para disparar (-1 impactar), por lo demás actúa normal.
- **Insurmountable Losses**: unidad por debajo del 50% de modelos iniciales: Ld -1 al reagrupar. Por debajo del 25%: solo reagrupa con doble 1 natural.

## 3. Fase de Movimiento

### 3.1 Regla de 1" (PDF 119)
Salvo unidades trabadas en combate, ninguna unidad puede TERMINAR su movimiento a 1" o menos de una unidad enemiga. Puede pasar a menos de 1" durante el movimiento si al final hay 1". Si hace falta, se separan unidades por la mínima distancia.

### 3.2 Movimiento básico y marcha (PDF 124)
- Movimiento normal: hacia delante hasta M" en línea recta (salvo maniobra). Con varios M en la unidad se usa el del más lento. Distancia medida desde el frente de la peana.
- **Marcha**: M x 2 (x3 en Marching Column). Al marchar solo puede hacer "wheel" (ninguna otra maniobra) y NO puede disparar en la fase siguiente (ni lanzar Magic Missile/Vortex).
- **Enemy Sighted**: para iniciar marcha a menos de 8" de una unidad enemiga (ignorando huidas) hay que pasar un test de Ld. Si falla: se mueve normal pero se considera que marchó (no puede disparar), aunque no se mueva.

### 3.3 Maniobras (PDF 125-126)
Una sola maniobra por movimiento. Ningún modelo se mueve más de 2 x M.
1. **Wheel (giro en abanico)**: el borde delantero avanza pivotando sobre una esquina frontal. Cada modelo cuenta como habiéndose movido lo que el modelo exterior. Salvo cargando, puede hacerse varias veces alternando con avance.
2. **Turn (giro en sitio)**: 90° cuesta 1/4 de M; 180° cuesta 1/2 de M. Modelos en rangos completos giran; los del rango trasero incompleto van a la parte trasera de la nueva formación. Los modelos de mando pasan a la nueva primera fila (o a la segunda si no cabe).
3. **Mover hacia atrás**: M a la mitad.
4. **Mover de lado**: M a la mitad.
5. **Redress the ranks**: gasta 1/2 M; quita hasta 5 modelos del frente o añade hasta 5 (reordenando el resto; solo el rango trasero puede quedar incompleto).
6. **Reform**: sacrifica TODO el movimiento; pivota sobre su centro hasta 180° y reordena filas/columnas (cambiar de forma o de formación).
- **Pivot** (regla auxiliar): giro sobre el centro ignorando unidades y terreno.
- **Bordes**: una esquina puede salir del tablero durante una maniobra si la unidad acaba completamente dentro.
- Unidades sueltas (personajes, etc.) se mueven como unidades. Otras formaciones (skirmish, etc.) en otra sección (pág. impresa 182).

### 3.4 Declaración de cargas (PDF 120)
- La unidad activa declara una por una unidad cargadora y objetivo. Cargar es la ÚNICA manera de entrar en combate.
- Requisitos: al menos un modelo con LdV al objetivo y el objetivo al menos parcialmente en el arco frontal del cargador. Se puede medir antes.
- NO pueden declarar carga: trabadas en combate, en huida, reagrupadas este turno. Marching Column: puede declarar pero no mover la carga. Tampoco carga imposible: objetivo fuera del alcance máximo posible (M + 6), o obstrucciones que impiden el contacto (si la obstrucción es una unidad que podría apartarse antes, es posible).
- Si no se puede cargar al objetivo sin tocar otras unidades enemigas, se declara carga contra todas ellas; cada una declara su reacción.

### 3.5 Reacciones a la carga (PDF 121)
Las declara el jugador inactivo para cada objetivo, tras todas las declaraciones:
- **Hold**: aguanta. Huyendo NO puede. Ya trabada en combate DEBE aguantar. Si no declara, aguanta.
- **Stand & Shoot**: requiere armas de proyectil y LdV al cargador. Si la distancia entre ambas unidades es MENOR que el M del cargador, no puede (debe Hold o Flee). Si no, dispara aunque supere el alcance máximo (se asume que el cargador entró en alcance) con -1 a impactar (sin penalización extra por largo alcance); luego Hold. El cargador no hace test de pánico ("Charging units are not required to make Panic tests", pág. 121). Ni huyendo ni trabada pueden. Solo una S&S por turno aunque haya varios cargadores (elige a cuál dispara; contra el resto, Hold).
- **Flee**: cualquiera no trabada. Ya huyendo DEBE huir. Gira sobre su centro para quedar de espaldas al centro del cargador y hace movimiento de huida inmediato (3.9). Con varios cargadores huye del de mayor Fuerza de Unidad (empate: al azar).

### 3.6 Movimiento de carga (PDF 122, 127-129)
- **Tirada de carga**: 2D6, se descarta el MENOR (si iguales, uno cualquiera). Alcance de carga = M + resultado. Si no llega: **carga fallida**.
- **Carga fallida**: avanza hacia el objetivo una distancia igual al resultado de la tirada de carga (el dado mayor), haciendo wheel si es necesario. Ejemplo: M4, tirada 1 y 5, alcance 9", objetivo a 10" -> avanza 5".
- Orden: las cargas se resuelven una a una en el orden del jugador activo.
- **Reglas del movimiento de carga**: (1) llevar el máximo de modelos del primer rango a contacto de peana, (2) ruta más corta, (3) lo más recto posible, (4) al final, alineada contra el objetivo. Prohibidas: turn, mover atrás, de lado, redress, reform. Se permite UN solo wheel en cualquier punto de la carga para maximizar contacto (no es obligatorio completarlo si provoca fallo o impide otra carga declarada). Se detiene al contacto.
- **Alineación**: tras el contacto, un segundo wheel libre para quedar a ras del frente enemigo.
- **Frente/flanco/retaguardia** (128): según la posición del cargador en el arco del objetivo AL DECLARAR. Si está a caballo de dos arcos: contar modelos de su primer rango en cada arco; mayoría decide; empate/duda: el arco que le dé menos ventaja de resultado de combate (ej. flanco vs. retaguardia -> flanco).
- **Terreno** (129): si cualquier parte atraviesa terreno difícil/peligroso o cruza un obstáculo lineal bajo, se descarta el dado MAYOR en la tirada de carga y M sufre -1 (mínimo 1) en el movimiento de carga. Si acaba con >=25% de modelos en terreno difícil o a caballo de obstáculo bajo: Disrupted.
- **Carga desordenada** (129): contacto hecho pero imposible alinearse (algo estorba): el objetivo se alinea contra el cargador si puede; si no, se deja un hueco. El cargador pierde el modificador de Iniciativa por cargar (pág. impresa 146, fuera de mi rango). Con varios objetivos: si no puede alinearse con todos, los demás se alinean con él; la carga cuenta desordenada contra los que tuvieron que alinearse (no contra el objetivo principal).
- **Varios cargadores** a un mismo arco (131): se mueven simultáneamente, ambos maximizan contacto.
- **Cargar a un enemigo que huye** (130): opción A "run down" (arrollar): tras la huida del objetivo, el cargador mueve normal; si contacta con la unidad en huida, esta se elimina; el cargador puede intentar un reform libre con test de Ld (fallo: sin reform; en ambos casos no se mueve más). Si no contacta, avanza su alcance completo (no es carga fallida). Opción B "redirect": test de Ld; si pasa, declara carga contra un nuevo objetivo (uno que pudo declarar al principio o uno revelado por la huida). El nuevo objetivo no puede S&S (solo Hold o Flee; si huye no se redirige otra vez). Si falla el test, debe arrollar. Sin objetivo alternativo, no se puede redirigir.
- **Contacto accidental** (132): (a) unidad contactada por el frente y no trabada: se compromete (se alinea; ninguna cuenta como cargadora; combaten por Iniciativa) o hace Give Ground. (b) contactada por flanco/retaguardia o ya trabada: se aparta (y las enemigas con las que combate) lo mínimo para quedar a 1" y seguir trabada. (c) durante carga con objetivo que huye: si contacta con otra unidad, cuenta como redirección y la huidiza escapa; con varias, se trata como objetivos múltiples. (d) carga bloqueada por otra enemiga: si puede rodearla con wheel, debe hacerlo; si no, o si causa fallo, puede detenerse a 1" (no es fallida) o seguir: contra unidad en huida la arrolla y elimina (sin reform); contra una no huidiza, redirección.

### 3.7 Movimientos obligatorios y restantes (PDF 123)
- Unidades que no reagruparon siguen huyendo en Compulsory Moves, PRIMERO (antes de otros movimientos obligatorios, p.ej. M aleatorio o dirección forzada).
- Restantes: las unidades que no huyen, no cargaron y no se movieron en obligatorios pueden mover normalmente. Conveyance se lanza en cualquier momento de esta sub-fase.
- Refuerzos (135): entran en obligatorios, con la retaguardia pegada al borde y mirando al centro; no pueden marchar y cuentan como movidas para disparar; por lo demás mueven normal en restantes.
- Salvo huida y persecución, nadie puede salir del tablero.

### 3.8 Give Ground y Fall Back in Good Order (PDF 135)
- **Give Ground**: se mueve 2" directamente lejos de las enemigas que lo causaron, SIN girar ni cambiar de orientación; se detiene al contactar otra unidad/terreno o si seguir la dejaría a menos de 1" de un enemigo.
- **Fall Back in Good Order**: igual que huir con dos excepciones: tirada de huida = 2D6 descartando el menor; reagrupa automáticamente al final del movimiento (reform libre y efectos de rally de 3.x).

### 3.9 Flee (PDF 133-134)
- Dirección: pivota hasta mirar de espaldas al centro del enemigo y se mueve; si falla el rally en Estrategia continúa en línea recta en la dirección que ya tenía.
- **Tirada de huida**: 2D6 pulgadas. Avanza recto en la dirección de su frente, la distancia completa aunque salga del tablero. Solo puede pivotar para rodear terreno impasable.
- Si cualquier parte toca o cruza el borde: toda la unidad eliminada (cuenta como destruida).
- Por unidades amigas: las atraviesa sin parar; si acabaría encima, sigue hasta despejar y se detiene.
- Por enemigas: cada modelo que atravesó una unidad enemiga hace test de Peligro (D6: 4+ ok; 1-3 pierde 1 H); sin límite de tests. Si acabaría encima o a <=1" de un enemigo, sigue recto hasta quedar a 1" y para.
- Terreno: sin penalizadores a M, pero debe hacer tests de Terreno Peligroso. Impasable: pivota para rodear por la ruta más corta.
- Varios enemigos: huye del de mayor Fuerza de Unidad (empate al azar).
- **Límite**: solo una huida por fase; una segunda huida en la misma fase = 0" y sin pivotar.

### 3.10 Terreno y movimiento (PDF 136)
Siete categorías: terreno abierto, colinas, difícil, peligroso, impasable, obstáculos lineales (bajos/altos), bosques.
- Abierto y colinas (salvo acuerdo): sin efecto en el movimiento.
- **Difícil**: M -1 (mínimo 1) si cualquier parte de la unidad se mueve por él (empieza, pasa o acaba). Acabar con >=25% de modelos dentro = Disrupted.
- **Peligroso**: como difícil + test de Terreno Peligroso por cada modelo que empiece, pase o acabe en él: D6; 1 = pierde 1 H (2+ ok). Un test por cada elemento peligroso distinto en un movimiento.
- **Impasable**: hay que rodearlo. Obstáculo lineal ALTO (>=2") = impasable.
- Obstáculo lineal BAJO (<2"): como terreno difícil (a caballo al terminar = Disrupted).
- Bosque: difícil o peligroso, según acuerdo previo.
- Elementos decorativos de menos de 2" de ancho se atraviesan libremente.

## 4. Fase de Disparo (PDF 137-144)

Para cada unidad, una a una, las 4 sub-fases completas.

### 4.1 Elegir unidad y objetivo (PDF 138)
- Solo unidades con armas de proyectil / máquinas de guerra / lanzadores de Magic Missile o Vortex.
- NO puede disparar si: cargó o marchó en la fase de movimiento anterior, está trabada o huye. (Excepción: S&S.)
- Se comprueba alcance y LdV modelo a modelo. Normalmente solo el primer rango dispara. Los modelos sin LdV o fuera de alcance no disparan. No se puede dividir el disparo entre objetivos. Una unidad dispara una vez por fase; un modelo hace un solo disparo (A no cuenta).
- Normalmente no se puede disparar a unidades trabadas en combate (144; "excepto en casos raros").

### 4.2 Tirada para impactar (PDF 139-140)
| BS | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Impacta con | 6+ | 5+ | 4+ | 3+ | 2+ |

BS 6 o más: re-roll si falla (el re-roll usa el segundo valor, los modificadores solo se aplican a la primera tirada):
| BS | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|
| 1ª / 2ª | 2+/6+ | 2+/5+ | 2+/4+ | 2+/3+ | 2+/2+ |

Un 1 natural siempre falla.

**Modificadores (acumulativos, salvo que se indique)**
| Situación | Mod. |
|---|---|
| Mover y disparar (se movió por cualquier causa este turno, incluyendo rally y reform) | -1 |
| Largo alcance (más lejos que la mitad del alcance máximo del arma) | -1 |
| Stand & Shoot (sin penalización extra de largo alcance) | -1 |
| Objetivo en cobertura parcial | -1 |
| Objetivo en cobertura total | -2 |

**Resultado 7+ (140)**: se tira normal; cada 6 natural se vuelve a tirar: necesario 7 -> 4+; 8 -> 5+; 9 -> 6; 10 -> imposible.
Cuando unos modelos sufren modificadores y otros no, se resuelven como lotes separados (igual para H y salvaciones).

### 4.3 Herir y salvar (PDF 141-142)
**Tabla To Wound** (filas = Fuerza del arma, columnas = Resistencia del objetivo). Leída de la imagen:
| F \ R | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 4+ | 5+ | 6+ | 6+ | 6+ | 6+ | - | - | - | - |
| 2 | 3+ | 4+ | 5+ | 6+ | 6+ | 6+ | 6+ | - | - | - |
| 3 | 2+ | 3+ | 4+ | 5+ | 6+ | 6+ | 6+ | 6+ | - | - |
| 4 | 2+ | 2+ | 3+ | 4+ | 5+ | 6+ | 6+ | 6+ | 6+ | - |
| 5 | 2+ | 2+ | 2+ | 3+ | 4+ | 5+ | 6+ | 6+ | 6+ | 6+ |
| 6 | 2+ | 2+ | 2+ | 2+ | 3+ | 4+ | 5+ | 6+ | 6+ | 6+ |
| 7 | 2+ | 2+ | 2+ | 2+ | 2+ | 3+ | 4+ | 5+ | 6+ | 6+ |
| 8 | 2+ | 2+ | 2+ | 2+ | 2+ | 2+ | 3+ | 4+ | 5+ | 6+ |
| 9 | 2+ | 2+ | 2+ | 2+ | 2+ | 2+ | 2+ | 3+ | 4+ | 5+ |
| 10 | 2+ | 2+ | 2+ | 2+ | 2+ | 2+ | 2+ | 2+ | 3+ | 4+ |
Patrón: F=R: 4+; F=R+1: 3+; F>=R+2: 2+; F=R-1: 5+; F<=R-2: 6+; F <= R-6: imposible. Un 1 natural siempre falla. "Too tough to wound": F al menos 6 puntos por debajo de R = no puede herir.

**Salvación de armadura**: D6 >= valor de armadura = salvado. Un 1 natural siempre falla. Armadura ligera 6+; mejoras de equipo (escudo +1) hasta un máximo de 2+; sin armadura = 7+ a efectos de modificadores. **AP** es un modificador negativo a la tirada (ej. AP-1 contra 5+ requiere 6).
**Salvación especial (Ward)**: nunca modificada por AP; se tira tras fallar la armadura (o si no puede pasarla); solo una, la mejor; no se combinan.

### 4.4 Bajas y Panic (PDF 143)
- Cada herida no salvada = -1 H; se retiran modelos como en 1. Si hay multiples heridas por impacto: el exceso se pierde. Muertes instantáneas: sin salvación (salvo indicación) y sin importar las H del perfil.
- **Panic**: si en UNA fase de disparo la unidad pierde MÁS del 25% de los modelos que tenía al comenzar esa fase: test de Ld inmediato. Una sola prueba de pánico por fase de disparo aunque reciba disparos de varias unidades.
- Si falla: si conserva MÁS del 50% de sus modelos iniciales de la batalla = Fall Back in Good Order; con el 50% o menos = Flee. En ambos casos directamente lejos de la unidad cuyo disparo causó el test.

### 4.5 Otros (PDF 144)
- Impactos automáticos: sin tirada de impactar.
- Magic Missile / Vortex se lanzan cuando la unidad del mago es elegida en la fase de disparo.
- Rangos adicionales: en colina se dispara con un rango adicional; **Volley Fire**: la mitad (redondeando arriba) de los modelos de cada rango distinto del frontal (o los dos frontales en colina) disparan. El alcance se comprueba modelo a modelo.
- Efectos inflictivos en estrategia/movimiento se resuelven con sub-fases 3 y 4 del disparo.

## 5. NO CLARO / No encontrado

- Perfiles de armas (alcance, F, PA, reglas especiales como Move or Fire, Armour Piercing): pág. 217, no leída.
- Penalización exacta de cobertura de terreno concreto (bosques, etc.), colinas y LdV sobre ellas: capítulo de terreno, no leído.
- La frase "charging units are not required to make Panic tests" (121) es ambigua: probablemente significa que el cargador no hace Panic por bajas causadas por Stand & Shoot.
- Bonus de Iniciativa por cargar y resultado de combate: pág. 146/151, fuera de rango.
- Medidas exactas de peana por tipo: no aparecen en este rango.
- Si el movimiento de marcha en columna cuenta M x3 tras wheel: no se aclara más.
- Pivote de huida con un enemigo cuyo centro coincide: no tratado.

## SIMPLIFICACIONES SUGERIDAS (motor 2D de bloques rectangulares)

1. **Formación**: cada unidad = rectángulo (anchura x fondo) con atributos "modelos por rango" y "nº de rangos"; las bajas reducen el rango trasero. Calcular Rank Bonus y Combat Order directamente por proporciones, sin colocar modelos individuales.
2. **Medición**: usar distancia mínima entre rectángulos (borde a borde); ya coincide con la regla.
3. **Líneas de visión**: LdV entre unidades = rayo desde el centro del borde frontal al objetivo (o prueba de 3 rayos a esquinas/centro), bloqueada por otro rectángulo o terreno. Cobertura: fracción de rayos bloqueados (<=50% parcial, >50% total).
4. **Disparo "modelo a modelo"**: aproximar = nº de tiradores = ancho del primer rango (o el 100% si solo alcance largo/corto global). Usar un único alcance por unidad (mínimo de los modelos) y marcar la penalización de largo alcance por unidad.
5. **Wheel / maniobras**: modelar como giro continuo del rectángulo alrededor de una esquina; permitir solo "avance + un giro" con coste = distancia del modelo exterior. Turn/reform = rotación discreta con coste en M.
6. **Carga**: generar candidatos de contacto: calcular recorrido recto con un wheel opcional, elegir el que maximiza contacto de frente. Alineación = rotar para hacerla paralela a la cara enemiga (snap). Resolver el arco (frente/flanco/retaguardia) por la posición del centro del cargador.
7. **Carga desordenada, contacto accidental, redirigir, cargas múltiples**: reducir a un caso: si no cabe alineación, marcar "desordenada" (sin bonus de carga) y separar 1". Omitir cargas múltiples en la primera versión (solo un objetivo; si el rectángulo lo cruza, cancelar la carga). Redirección, arrollar a huidas: implementar solo "arrollar" (huida < alcance -> eliminada) sin reform.
8. **Huida**: pivotar 180° al enemigo, mover 2D6 en línea recta; si toca el borde, se elimina. Peligro por atravesar enemigos: aproximar con una tirada de 1 H por cada 5 modelos de ancho que cruzó (o D6 por modelo del ancho x fondo cruzado).
9. **Terreno**: solo polígonos rectangulares de tipo abierto/difícil/peligroso/impasable/obstáculo bajo-alto. "25% de modelos" = fracción del área solapada. Test peligroso: 1/6 de perder una herida por modelo en la fracción solapada.
10. **Give Ground y Fall Back**: movimiento lineal fijo de 2" o tirada de huida (con descarte), sin rotación.
11. **Empujones de 1"**: tras cada movimiento, empujar al rectángulo hacia atrás por la mínima distancia hasta quedar a >1" del enemigo (salvo trabados).
12. **Refuerzos, M aleatorio, Conveyance, Magic**: omitir en v1.
