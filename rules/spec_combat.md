# SPEC COMBATE – Warhammer: The Old World (Core Rulebook)

Convención de páginas: se cita la página FÍSICA del PDF ("pf"). El número impreso del libro = pf − 1 (el texto interno remite a páginas impresas). Las pf 163-164 son solo ilustración (sin reglas). Todo lo marcado [NO CLARO] o [NO ENCONTRADO] es una laguna real del texto.

---
## 1. SECUENCIA DE COMBATE (pf 145-146)

Fase de Combate: el jugador activo elige un combate (grupo de unidades en contacto de peana) y se resuelven por completo sus 4 subfases; se repite hasta agotar todos los combates. Ninguna unidad en contacto puede negarse a pelear. Luego termina el turno.

1. **Choose & Fight** (1.1 elegir combate/quién pelea; 1.2 impactar; 1.3 herir + salvaciones; 1.4 retirar bajas; repetir 1.2-1.4 por cada valor de Iniciativa descendente).
2. **Calculate Combat Result.**
3. **Break Test** (cada unidad perdedora).
4. **Follow Up & Pursuit** (ganadores).

### 1.1 Quién pelea (pf 146-148)
- Unidades en contacto de peana con enemigo = "engaged". Un modelo en contacto con un enemigo puede pelear aunque sea en flanco/retaguardia o solo toque por la esquina.
- **Fighting rank** = fila o columna que tenga ≥1 modelo en contacto con el enemigo. TODOS los modelos de esa fila pelean (los no tocantes "rodean").
- **Fighting rank incompleto** (flanco/retaguardia o personaje que no encaja): se asume que tiene tantos modelos como la fila/columna más grande detrás de ella (pf 159).
- **Supporting attacks:** solo modelos con arma con regla *Fight in Extra Rank* (lanza arrojadiza/de empuje/de caballería, látigo; pf 170, 215-216), situados directamente detrás de un modelo amigo de la fighting rank. NO en flanco/retaguardia de la unidad ni modelos que ya estén en la fighting rank.
  - Lanza de empuje (thrusting spear, solo infantería) y lanza de caballería: no pueden hacer supporting attack en un turno en que cargaron.
  - Excess casualties reducen supporting attacks (pf 151).
- **Nº de ataques:** en contacto con enemigo = característica Attacks; peleando sin contacto (supporting o rodeando) = **1 ataque** sea cual sea su Attacks (pf 147).
- **Dividir ataques** (pf 148): modelo en contacto con varios enemigos elige objetivo y puede repartir sus ataques (declarar antes de tirar). Sin contacto: ataca a la unidad enemiga más cercana (empate: elige jugador). Si está en varias fighting ranks: prioriza enemigo en contacto. Unidad enfrentada por varios arcos tiene varias fighting ranks.
- **Armas** (pf 214): si hay 2+ armas de combate, se elige UNA para toda la unidad al elegir el combate; no se cambia entre rondas del mismo combate (salvo que el arma lo diga, p.ej. lanza). Personajes eligen aparte.
- Retos (challenges): se emiten al elegir combate (pf 211-212); fuera del núcleo; ver simplificaciones.
- Hechizos Assailment: el Mago puede lanzarlos cuando le toca pelear por su Iniciativa (pf 159).

### Orden de Iniciativa (pf 147)
- Se avanza de Iniciativa más alta a más baja. Mismo valor (tras modificadores) = simultáneo: **primero resuelve el jugador activo y luego el otro**; las bajas causadas por el activo NO reducen los ataques del rival con la misma I.
- Un modelo muerto antes de atacar por un enemigo de I mayor pierde sus ataques.
- Un modelo que "stepped forward" (rellenó un hueco de la fila de combate por una baja) NO puede atacar en esa fase (pf 103, 147).
- **Bono por carga** (todos los modelos de la unidad cargadora, lo que resta del turno, máximo I 10): +1 I por pulgada COMPLETA movida antes del contacto: carga a frente = máx +3; a flanco/retaguardia = máx +4. **Carga desordenada = sin bono.**
- Modificadores a I: Strike First → I = 10 antes de otros modificadores; Strike Last → I = 1 (se anulan entre sí); Stupidity (en combate) → I = 1 (se anula con Strike First); lanza de empuje: +1 I contra unidad(es) que le cargaron por el frente; Stomp Attacks siempre I 1 y Impact Hits siempre I 10, ambos aciertan automáticamente con la Fuerza sin modificar. Impact Hits (X): solo cargador que movió ≥3" y en contacto (pf 173, 178).
- Split profiles: cada conjunto de ataques se resuelve en su I; los ataques no hechos por muerte del modelo/sin objetivos se pierden (pf 159).
- Ataques 0 = no ataca; WS 0 = todos sus ataques fallan y los que recibe aciertan automáticamente (pf 159, 98).

### 1.2 Impactar – tabla (pf 149). Tirar D6 ≥ objetivo tras modificadores
Filas = WS atacante (1-10); columnas = WS objetivo (1-10).

| Att\Obj | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 4+ | 4+ | 5+ | 5+ | 5+ | 5+ | 5+ | 5+ | 5+ | 5+ |
| 2 | 3+ | 4+ | 4+ | 4+ | 5+ | 5+ | 5+ | 5+ | 5+ | 5+ |
| 3 | 2+ | 3+ | 4+ | 4+ | 4+ | 4+ | 5+ | 5+ | 5+ | 5+ |
| 4 | 2+ | 3+ | 3+ | 4+ | 4+ | 4+ | 4+ | 4+ | 5+ | 5+ |
| 5 | 2+ | 2+ | 3+ | 3+ | 4+ | 4+ | 4+ | 4+ | 4+ | 4+ |
| 6 | 2+ | 2+ | 3+ | 3+ | 3+ | 4+ | 4+ | 4+ | 4+ | 4+ |
| 7 | 2+ | 2+ | 2+ | 3+ | 3+ | 3+ | 4+ | 4+ | 4+ | 4+ |
| 8 | 2+ | 2+ | 2+ | 3+ | 3+ | 3+ | 3+ | 4+ | 4+ | 4+ |
| 9 | 2+ | 2+ | 2+ | 2+ | 3+ | 3+ | 3+ | 3+ | 4+ | 4+ |
| 10 | 2+ | 2+ | 2+ | 2+ | 3+ | 3+ | 3+ | 3+ | 3+ | 4+ |

- **1 natural = siempre falla; 6 natural = siempre acierta**, sean cuales sean los modificadores.
- Se tiran tantos dados como Attacks. Si hay lotes con distintos WS/Fuerza/arma/objetivo se tiran por lotes separados (pf 149).
- Modificadores a impactar de este bloque: Fear fallido −1 (ver §4). Hatred: repite fallos en la primera ronda de combate (pf 172). Poisoned Attacks: 6 natural al impactar hiere automáticamente (pf 176).

### 1.3 Herir – tabla (pf 150). Cada impacto se vuelve a tirar (D6 ≥ objetivo)
Filas = Fuerza del arma; columnas = Resistencia (T) del objetivo 1-10. "-" = imposible herir.

| S\T | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
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

Fórmula equivalente (deducida de la tabla, no escrita en el libro): d = T − S; d ≥ 6 → imposible; d = 2..5 → 6+; d = 1 → 5+; d = 0 → 4+; d = −1 → 3+; d ≤ −2 → 2+.
- **1 natural al herir = siempre falla** (no hay "6 siempre acierta" al herir). Armour Bane (X): 6 natural al herir mejora el AP en X (pf 167). Killing Blow: 6 natural al herir en combate; infantería/caballería enemiga sin salvación de armadura ni Regeneración (Ward sí) y pierde todas sus Heridas restantes (pf 173).
- **Modificadores de Fuerza por arma (pf 214-216, solo combate):** mano = S; Great weapon S+2, AP −2, Armour Bane(1), Strike Last, 2 manos; Halberd S+1, AP −1, Armour Bane(1), 2 manos; Flail S+2, AP −2, 2 manos, solo primera ronda; Morning star S+1, AP −1, solo primera ronda; Lance S+2, AP −2, Armour Bane(1), solo caballería/monstruo y solo si cargó (si no, mano); Cavalry spear S+1, AP −1 solo en turno de carga, Fight in Extra Rank; Throwing spear S, solo en turno de carga; Thrusting spear S, solo infantería; Two/additional hand weapon: Extra Attacks (+1), 2 manos; Whip: Fight in Extra Rank, Strike First. Extra Attacks(+X) suma a Attacks; Frenzy +1 A; Furious Charge +1 A si cargó ≥3".

### Salvaciones (pf 150, 142, 221-222)
- Por cada herida: tirar D6 vs armour value (**≥ valor = salvada**). **1 natural siempre falla.**
- AP es modificador NEGATIVO a la tirada de salvación (AP −1 vs 5+ requiere 6).
- Armadura: ligera 6+, pesada 5+, completa (plate) 4+; escudo −1 al objetivo (mejora 1); barding +1; sin armadura cuenta como 7+ para modificadores (escudo solo = 6+). **Nunca mejor de 2+.** Arma con Requires Two Hands: no se puede usar escudo en combate.
- Ward save: tirar tras la de armadura (si falla o es imposible), nunca modificada por AP; solo una, se usa la mejor. Regeneration (X+): no modificada por AP, se puede sumar a armadura y Ward; las heridas salvadas por Regeneración SIGUEN contando para el resultado de combate (pf 177).
- Multiple Wounds (X): cada herida no salvada causa X Heridas; el exceso sobre un modelo no pasa al siguiente (pf 176).

### 1.4 Bajas (pf 103, 151)
- Heridas no salvadas: se pierden Heridas de un modelo hasta 0 y luego el siguiente (no repartir para evitar bajas).
- Las bajas se quitan del FONDO (última fila, por un extremo) aunque hayan caído en la fila frontal ("stepping forward"/"closing in"); los modelos que se adelantan no pueden atacar esa fase. Las fighting ranks de un solo rango quitan bajas por ambos extremos.
- Recomendado: dejar las bajas al lado hasta el final del combate para contar Heridas perdidas y los que ya no pueden atacar.
- Excess casualties (más bajas que modelos en la fila): se quitan igual y reducen supporting attacks.
- Campeón/portaestandarte/músico: reglas de sustitución (pf 200-202): no se pierden hasta que solo quedan modelos de mando; campeón solo cuenta como baja en combate si es el último o fue atacado desde contacto.
- Encogimiento: si al quitar bajas las unidades pierden contacto, moverlas lo mínimo para reestablecerlo, sin cambiar encaramiento (pf 159). Si en combates múltiples una unidad ya no puede contactar, sale del combate al final del turno.

---
## 2. RESULTADO DE COMBATE (pf 152-154)

Si un bando queda totalmente aniquilado, el otro gana automáticamente. Se suma por bando:

| Concepto | Puntos |
|---|---|
| Heridas no salvadas infligidas (Heridas perdidas por el enemigo en la fase de Combate **más** las perdidas por Stand & Shoot de reacción a carga en este turno) | 1 por Herida |
| Rank Bonus | +1 por fila adicional tras la primera, hasta el máximo del tipo de tropa |
| Estandarte | +1 |
| Estandarte de Batalla | +1 (acumulable con estandarte normal) |
| Ataque de flanco | +1 |
| Ataque de retaguardia | +2 (acumulable con flanco) |
| Terreno elevado (high ground) | +1 |
| Overkill (reto) | +1 por herida excedente, máx +5 |
| Otros (p.ej. Combat Order +1) | según regla |

Detalles:
- Se cuentan **Heridas perdidas, no bajas**; un modelo eliminado de golpe cuenta las Heridas que le quedaban (pf 152).
- **Rank Bonus** (pf 106 tabla): modelos mínimos por fila para que cuente: Regular Inf 5 (máx +2), Heavy Inf 4 (+2), Monstrous Inf 3 (+2), Swarms no; Light Cav 5 (+1), Heavy Cav 4 (+1), Monstrous Cav 3 (+1), War Beasts 5 (+1); Light Chariot 3 (+1), Heavy Chariot no; Monstruos y War Machines no. La fila trasera incompleta cuenta si alcanza el mínimo. **Unidad Disrupted no cuenta Rank Bonus.** Horde: +1 al máximo. Un Marching Column no cuenta Rank Bonus (pf 102).
- **Combat Order** (formación cerrada más ancha que profunda o cuadrada): +1 de combate ("Other bonuses", pf 102, 153). Con varias unidades de ese tipo se cuenta una vez por unidad (pf 154).
- **Flanco/retaguardia:** según el arco del enemigo con el que estés en contacto. Solo una vez por unidad enemiga aunque la ataquen varias unidades por el mismo arco; flanco+retaguardia sí se acumulan.
- **High ground:** si tu fighting rank está más alta que la del enemigo. Solo una unidad por bando; empates en altura se anulan.
- **Combate múltiple (pf 154):** solo el MEJOR Rank Bonus de todas tus unidades; solo UN estandarte normal (a elegir si algunos dan extras); el Battle Standard siempre cuenta (+1 extra aunque haya estandarte); otros bonos se cuentan siempre salvo que la regla diga lo contrario.
- **Músico** ("Onwards to Victory", pf 202): si tras el cálculo hay **empate exacto** y un bando tiene músico en la fila frontal de alguna unidad, +1 (se anula si ambos tienen músico).
- **Unstable:** la unidad que pierde pierde 1 Herida extra por cada punto de diferencia, antes del Break (pf 181).
- **Ganador:** mayor puntuación. **Empate:** nadie rompe; unidades siguen trabadas hasta el siguiente turno para otra ronda (pf 153).
- Frenzy: la unidad (o modelo) que pierde una ronda pierde Frenzy inmediatamente (pf 171).

---
## 3. BREAK TEST (pf 155-156, 135)

Cada unidad del bando perdedor tira por separado (la diferencia es la de bandos, no de unidad). Excepción: no tira si el combate es empate.
1. Tirar 2D6. **Resultado modificado = 2D6 + (puntos del ganador − puntos del perdedor).** (El resumen final del libro dice "modificador negativo"; es equivalente a restar la diferencia a Liderazgo.)
2. Comparar con Liderazgo (Ld; en unidades mixtas, el más alto):
   - **Natural (sin modificar) > Ld → BREAKS: huye.**
   - Natural ≤ Ld pero modificado > Ld → **FALLS BACK IN GOOD ORDER.**
   - Modificado ≤ Ld, o **doble 1 natural** → **GIVES GROUND.**
3. **Superioridad numérica:** si el Unit Strength total del bando ganador (suma de sus unidades, calculado al final de la fase de Combate, tras las bajas) es **MÁS DEL DOBLE** que el del perdedor, cualquier unidad perdedora que obtendría Falls Back In Good Order **Breaks** en su lugar.
4. **Modificadores a Ld/tirada identificados:** Terror en el bando ganador: −1 Ld de cada unidad perdedora en el Break (pf 180). Warband: + Rank Bonus actual a Ld (máx 10), si no huye (pf 181). Hold Your Ground (Battle Standard, dentro de Command range): puede repetir los 2D6 del Break y aceptar el segundo resultado (pf 204). Inspiring Presence del General: usar el Ld del General (pf 204). Stubborn: la primera vez puede elegir no tirar y Falls Back In Good Order automáticamente, incluso con superioridad >2x (pf 179). **Unbreakable:** no tira; si pierde, Gives Ground automáticamente (pf 180). Shieldwall (1 vez/partida, solo en turno cargada, formación cerrada con escudos): Gives Ground en vez de Fall Back (pf 178). Veteran NO repite el Break (no es un test de Liderazgo, pf 181).
5. Aplicación de resultados:
   - **Breaks (flee, pf 133-134):** pivota sobre su centro para quedar de espaldas a la unidad ganadora con mayor Unit Strength (empate: al azar), tira **2D6** y avanza esa distancia en línea recta, abandonando formación.
   - **Falls Back in Good Order (pf 135):** igual que huir, pero tira 2D6 y **descarta el menor**; **rally automático** al terminar el movimiento (libre reform; ver §6).
   - **Gives Ground (pf 135-156):** mueve **2"** directamente alejándose de TODAS las unidades enemigas en contacto, sin girar ni pivotar, parándose si toca otra unidad o terreno o quedaría a <1" de otro enemigo. Si no puede romper contacto con algún enemigo (rodeado) se detiene y el combate sigue como empate.
   - Si tras moverse sigue en contacto, separar lo mínimo para mantener 1" (pf 155).
- **Unit Strength por modelo (pf 106):** Regular/Heavy Inf 1; Monstrous Inf 3; Swarms 3; Light/Heavy Cav 2; Monstrous Cav 3; War Beasts 1; Light Chariot 3; Heavy Chariot 5; Monstruos, Behemoths y War Machines = Heridas iniciales. US = modelos actuales × US/modelo.
- **Pocas miniaturas:** NO hay regla especial para Break test de unidades pequeñas en este tramo [NO ENCONTRADO]. Solo afectan: Rally (§6), Panic fall back/flee por umbral del 50% (§4), y la superioridad numérica por Unit Strength.
- Huida en combate: la unidad que huye de un combate y era US ≥5 causa Panic en amigos a 6" (§4). Si flee/fall back deja a enemigos aún trabados: la unidad ganadora que sigue en contacto no puede perseguir.
- Huir 2 veces en la misma fase: solo una huida por fase; una segunda huye 0" y no pivota (pf 134). Salir del tablero huyendo = unidad destruida (pf 133). Huir a través de unidades amigas: pasa libre; a través de enemigas: un Peril test por modelo (D6, 1-3 pierde 1 Herida); se detiene a 1" de enemigos (pf 134).

---
## 4. FOLLOW UP & PURSUIT (pf 157-158)

Se decide **después de los Break tests y antes** de que los perdedores muevan; los ganadores deben declarar (y si hay varios perdedores, a cuál persiguen) antes de cualquier tirada de huida.
- **Restrain & reform:** test de Liderazgo (Restraint). Superado: se queda y hace una reform gratis. Fallado: debe follow up o pursue. Frenzy mayoría: no puede hacer Restraint. Warband no usa su bono de Ld.
- **Follow Up** (enemigo Gives Ground): puede hacer antes un giro libre 90°/180°; se mueve para volver a contacto; combate trabado hasta el siguiente turno. No hay tirada de distancia.
- **Pursuit** (enemigo Falls Back o Flees): persigue a UNA unidad; pivota para encararla y tira **2D6**; avanza esa distancia directamente hacia ella. Swiftstride: +D6 al resultado. Se mueve DESPUÉS de que la perseguida termine su movimiento; el orden entre perseguidores lo elige el dueño.
  - Contacta con la perseguida: si huía → "hacked to pieces", eliminada (cuenta como destruida/estandarte trofeo); luego intenta reform. Si hizo Fall Back → quedan trabadas y en el siguiente turno el perseguidor cuenta como cargador.
  - Contacta con otra unidad enemiga: cuenta como carga (gira para alinear); la perseguida no es atrapada; si el otro enemigo huye de ese contacto fresco, ver pf 158. Si el nuevo combate aún no se había peleado este turno, pelea en él (cuenta como cargador) pero no puede perseguir otra vez: restrain & reform automático.
  - Termina contra amigos o terreno impasable: se detiene. Terreno normal le afecta. Sale del tablero: se retira sin destruirse y vuelve como refuerzo en su siguiente Compulsory Moves lo más cerca posible del punto de salida.
- **Overrun:** si aniquiló al enemigo antes del Break, puede restrain & reform o hacer movimiento de persecución recto, sin pivotar.
- No puede follow up/pursue una unidad todavía en contacto con un enemigo.

---
## 5. PSICOLOGÍA (pf 161-162, 172, 169-181, 98)

**Test de Liderazgo:** 2D6 ≤ Ld = pasa; doble 6 siempre falla; doble 1 siempre pasa (pf 98). Unidad mixta usa el Ld más alto.

**Panic test (pf 161-162):** test de Ld. Si falla:
- Si quedan **más del 50%** de los modelos iniciales de la batalla → **Fall Back in Good Order** (se aleja de la unidad causante).
- Si quedan **50% o menos** → **Flee**.
- Solo 1 Panic test por fase de juego. No se hace si: está cargando, está en combate, o ya huye sin haber reagrupado.
- Direcciones: huye de la unidad que causó las bajas; si no hay (o el motivo no es enemigo), del enemigo no huyendo más cercano.

**Causas habituales:**
1. **Bajas fuertes:** en una sola fase **que no sea Combate**, pierde más de 25% del Unit Strength que tenía al inicio de esa fase. (En pf 143, para Disparo, dice "modelos" en vez de Unit Strength: discrepancia menor [NO CLARO].) Las bajas de Combate no causan Panic.
2. **Amigo cercano destruido:** unidad con US ≥5 destruida → todas las amigas a 6" (medido desde la destruida, que se deja en el sitio).
3. **Amigo huye del combate:** unidad con US ≥5 pierde combate y, tras su Break, Breaks o Falls Back → amigas a 6" tiran Panic (no hace falta que sea huida completa). Levies que rompen no provocan esto a unidades sin Levies (pf 173).
4. **Fled Through:** una unidad por la que pasa otra amiga huyendo/retirándose tira Panic (tras resolver el movimiento). Puede encadenarse.
Si falla estos 2-4 huye alejándose del enemigo no huyendo más cercano.

**Reglas de psicología relevantes (core):**
- **Fear (pf 169):** al declarar carga contra un enemigo que cause Fear **y** tenga mayor Unit Strength: test de Ld; fallo = no carga (carga fallida, no se mueve). Si estás trabado con él al elegir combate: test de Ld; fallo = −1 al impactar de los modelos que ataquen al causante. Un test de Fear por turno. Quien causa Fear es inmune. Un personaje con Fear no se lo da a su unidad.
- **Terror (pf 180):** incluye Fear. Al declarar carga el objetivo hace test de Ld; fallo = debe Flee (si no puede huir, no tira). Si el bando ganador tiene unidad con Terror, −1 al Ld de cada unidad perdedora en el Break. Inmune quien causa Terror.
- **Frenzy (pf 171):** +1 Attacks (no a montura/crew); si la mayoría está Frenzied pasa automáticamente Fear/Panic/Terror; debe declarar carga si puede; no puede Flee como reacción ni hacer Restraint; se pierde al perder una ronda de combate.
- **Immune to Psychology (pf 172):** si la mayoría tiene la regla, pasa automáticamente Fear/Panic/Terror, pero no puede Flee como reacción a carga. No afecta a otros tests de Ld (Break, Rally, Restraint).
- **Stubborn** (pf 179), **Unbreakable** (pf 180), **Veteran** (repite tests de Ld fallidos si mayoría, pf 181), **Hatred** (pf 172): ver arriba. **Furious Charge, Impetuous, Stupidity, Unstable, Warband**: pf 173, 179, 181.
- **Fearless:** NO existe como regla universal en este PDF [NO ENCONTRADO]; las equivalentes son Immune to Psychology, Unbreakable y Frenzy. 

---
## 6. REAGRUPAR (RALLY) Y REFORM (pf 118, 126, 135)

- **Rally (Strategy phase, sub-fase 4, pf 118):** el jugador activo tira test de Ld por cada unidad que huye (puede ordenar; reagrupar primero al General). Fallo = sigue huyendo. Éxito = reagrupada.
  - −1 Ld si está **por debajo del 50%** de su tamaño inicial en modelos. Si está **por debajo del 25%**: solo reagrupa con doble 1 natural.
  - Músico en la unidad: +1 Ld al reagrupar (máx 10) (pf 202). Battle Standard (rango de mando): repetir test de Rally fallido (pf 204). Inspiring Presence: usar Ld del General (si no huye).
  - Rallied: reform libre (cualquier cambio de formación/orientación hasta 180°); **no puede cargar ese turno** y cuenta como movida para disparar; por lo demás actúa normal.
  - Rallying Cry (habilidad de personaje): test extra en Command sub-phase (pf 176).
- **Unidades que no reagrupan:** huyen en Compulsory Moves, al principio, continuando en línea recta en la misma dirección con 2D6 (pf 123, 133). Si salen del tablero quedan destruidas.
- **Fall Back In Good Order:** rally automático al acabar su movimiento "como en pf 118" [NO CLARO si incluye el reform gratis y la restricción de cargar: el texto remite a esa página; lo asumo sí].
- **Reform (pf 126):** sacrifica todo el movimiento; gira hasta 180° sobre su centro y reordena filas/columnas para cambiar formación.
- Redress the ranks: ±hasta 5 modelos de frente, usa la mitad del movimiento (pf 126).
- Cargadores que atrapan una unidad huyendo: test de Ld para reform libre (pf 130).

---
## 7. TERRENO Y COMBATE (pf 160, 102, 129) y casos raros (pf 159)

- **Disrupted:** pierde Rank Bonus. Se vuelve Disrupted si: es atacada en flanco/retaguardia por unidad con US ≥5 (no Skirmishers); termina movimiento con ≥25% de modelos en terreno difícil o a caballo de un obstáculo lineal bajo (<2"); al combatir con ≥25% en terreno difícil al inicio de la fase de Combate; carga que no puede alinear por terreno impasable y deja hueco; obstáculo lineal bajo atravesado. First Charge: objetivo Disrupted hasta fin de la fase (pf 170).
- **Terreno peligroso y bosque:** tratados como terreno difícil en combate. **Obstáculo lineal alto (≥2"):** impasable en combate. **Obstáculo bajo defendido:** la fila frontal defensora pegada al obstáculo; el cargador toca por el otro lado y su carga es **desordenada** (salvo Fly).
- Cargar a través de terreno difícil/peligroso/obstáculo bajo: descarta el 6 mayor de la tirada de carga y −1 al Movimiento (mín 1) (pf 129).
- Decoración <2" de ancho se ignora.
- Hills: high ground (+1, ver §2).
- Plantillas de Assailment impactan filas traseras (no reducen la fighting rank) (pf 159).
- Contacto accidental (pf 132): unidad contactada por el frente y no trabada puede comprometerse (ninguna cuenta carga) o Give Ground; por flanco/retaguardia o ya trabada: se desplaza lo mínimo manteniendo 1".

---
## 8. SIMPLIFICACIONES SUGERIDAS (motor 2D de bloques rectangulares)

1. **Contacto:** un bloque rectángulo por unidad con frente/flancos/retaguardia = 4 lados. Fighting rank = fila de modelos con contacto lateral con el enemigo; calcular el nº de modelos en contacto como min(ancho de contacto, modelos del lado) y completar hasta el ancho de la fila mayor (regla de rank incompleto). Evitar peanas individuales.
2. **Supporting attacks:** habilitar solo si el arma tiene Fight in Extra Rank: una fila extra detrás del frente (modelos × 1 ataque), solo cuando el contacto es por el frente.
3. **Bajas:** quitar modelos del fondo en bloque; la "fila frontal" se recalcula tras cada nivel de Iniciativa; guardar `steppedForward = bajas del frente`. Simplificar: quien reemplaza no ataca esa fase = restar del ataque de la fila las bajas de esa fase en la fighting rank.
4. **Iniciativa:** agrupar por valores de I efectivos (con bono de carga, Strike First/Last, cap 10). Simultáneos: activo primero y bajas del activo no reducen al otro.
5. **Dados:** usar tablas de impactar/herir como lookup directo (hit[WS_att][WS_obj], wound formula d=T−S). Lanzar por lotes (perfil de arma × objetivo).
6. **Disrupted:** como booleano; evitar solo si implementas terreno difícil; ignorar 25% parcial (usar "unidad en terreno ≥25% del área").
7. **Combate múltiple:** calcular bonos a nivel bando con el máximo Rank Bonus, un estandarte, flanco/retaguardia una vez por unidad enemiga, high ground uno por bando. Permitir como mucho 2 unidades por bando en una primera versión.
8. **Break:** implementar exactamente la regla de 3 resultados + doble de US. Una tirada por unidad perdedora. Huida: 2D6 en línea recta alejándose de la unidad ganadora de mayor US; Falls Back: 2D6 descartando el menor; Gives Ground: 2" sin girar. Para "rodeado" basta comprobar bloqueo del movimiento.
9. **Peril tests:** simplificar a Heridas aleatorias por solape (D6 1-3 pierde 1 Herida, por fila de modelos que cruza) o ignorarlos.
10. **Persecución:** pivotar el bloque para encarar y mover 2D6 (+D6 si Swiftstride). Resolver contacto: huyendo = destruida; Fall Back = trabadas; otra unidad = carga. Reform libre tras destruir al huido.
11. **Panic:** implementar umbral 25% de Unit Strength por fase (no Combate), vecino US ≥5 a 6", Fled Through; limitar a una prueba por fase y unidad.
12. **Rally:** Ld con −1 (<50%) y doble-1 (<25%); músico +1; sin Battle Standard en v1; reform libre pero sin cargar.
13. **Retos y personajes:** omitir retos/Overkill, unirse a unidades y Assailment en v1. Mantener Fear, Terror, Frenzy, Stubborn, Unbreakable, Immune to Psychology como banderas de la unidad.
14. **Armas:** un solo perfil activo por unidad por combate, con S/AP/special como datos; precalcular S+X en primera ronda/en carga con un flag `chargedThisTurn` y `roundNumber`.
15. **Arcos de carga:** definir flanco/retaguardia por el cuadrante desde el que se declaró la carga (se mide al declarar, no al contactar); en caso dudoso usar el arco menos ventajoso.
16. **Unit Strength:** usar tabla pf 106 como dato por tipo de tropa; calcular el US actual sobre la marcha tras cada baja.

---
## 9. LAGUNAS / AMBIGÜEDADES DETECTADAS
- Número mínimo de modelos para que la PRIMERA fila cuente en el Rank Bonus: no se dice; la tabla solo habla de filas que dan bono (detrás del frente).
- Ld modificado por Terror/Warband: el texto dice que modifica el Ld; asumo que la comparación del natural también usa el Ld modificado.
- Follow up: no dice si el seguidor cuenta como cargador en el siguiente turno (solo lo dice para Pursuit contra Fall Back).
- Unit Strength de Break "al final de la fase de Combate": se interpreta como tras las bajas de ese combate.
- Fall Back in Good Order: confirmación de reform libre/ no cargar tras rally automático (ver §6).
- Panic por bajas fuertes: pf 162 usa Unit Strength, pf 143 (Disparo) usa número de modelos.
- No encontrado: regla de Fearless, penalizadores a impactar por terreno, límite explícito de modificadores a tiradas para impactar/herir [NO ENCONTRADO en este tramo]. Challenges y characters en unidades solo referenciados.
