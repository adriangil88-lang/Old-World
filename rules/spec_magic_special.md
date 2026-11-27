# TOW: magia, reglas especiales, armas, máquinas, personajes, mando

Fuente: Core_Rulebook.pdf; páginas = FÍSICAS del PDF (no coinciden con las impresas). Ejércitos: fof.txt (Imperio) y rh.txt (Orcos y Goblins). Todo lo de abajo está leído del texto, salvo lo marcado (interp.). Rangos reales: magia 107-114, lores 320-336, reglas especiales 165-181, mando 199-202, personajes 203-212, armas/armadura 213-222, máquinas 223-230 (más 198).

## 0. Hallazgos clave
- NO existen Winds of Magic, dados de poder ni de dispersión de magia. Cada mago tira 2D6 + Nivel por hechizo (pp.108-110). No hay fase de magia: el tipo del hechizo fija cuándo se lanza.
- Dados especiales (p.94): Artillería (2, 4, 6, 8, 10, Misfire) y Dispersión (flechas y "Hit!"). D3 = D6/2 redondeando arriba.
- Plantillas (p.96): peana completa bajo la plantilla, o parcialmente bajo el agujero central de una blast = impacto automático; parcialmente bajo la plantilla = impacto con 4+. Dispersión: "Hit!" no mueve; flecha mueve la distancia indicada en esa dirección, ignorando terreno y unidades.
- Salvaciones (pp.141-142): armadura = D6 >= valor tras el AP (1 natural siempre falla; sin armadura = 7+; mejor posible 2+). Ward nunca la modifica el AP, se tira después de la armadura (solo la mejor Ward). Regeneration: no la modifica el AP, compatible con las otras, pero lo salvado cuenta en el resultado de combate. To Wound: 1 natural siempre falla; Fuerza 6+ por debajo de la Resistencia no hiere.

## A. MAGIA GENERAL (pp.107-114)

**Magos**: Niveles 1-4. Cada Lore: 6 hechizos numerados + 1 signature. Antes del despliegue, por mago se tiran D6 = Nivel (repitiendo duplicados) y esos son sus hechizos. Puede descartar UNO generado y tomar la signature de su Lore (cualquier número de magos). Un mago nunca repite hechizo; magos distintos sí. Un mago con armadura o escudo no puede lanzar ni dispersar (barding permitido). Un hechizo Bound no hace mago al modelo.

| Tipo | Cuándo se lanza | Reglas |
|---|---|---|
| Enchantment | Sub-fase Conjuration (Estrategia) propia | Solo unidad amiga (a veces afecta a enemigas). Repetir el mismo hechizo en la misma unidad el mismo turno no añade efecto |
| Hex | Conjuration | Solo unidad enemiga; mismo límite de repetición |
| Conveyance | Remaining Moves (Movimiento), en cualquier momento | Solo unidad amiga; la misma unidad no recibe el mismo Conveyance dos veces por turno |
| Magic Missile | Al elegir al mago en tu fase de Disparo | Solo enemigos; el mago necesita LoS; impacta automáticamente |
| Magical Vortex | Al elegir al mago en Disparo | Sin objetivo: plantilla redonda, sin tocar peanas, agujero dentro del alcance; permanece en juego. Si acaba un movimiento sobre una unidad, sigue en la misma dirección hasta poder colocarse |
| Assailment | Cuando el mago lucha, en cualquier Combate | Solo si el mago está trabado, contra la unidad con la que está trabado; impacta automáticamente |

- Bonos/penalizadores de Hex y Enchantment son acumulables, sin pasar de 10 ni bajar de 1.
- Cada mago intenta cada hechizo UNA vez por turno. Mago en huida no lanza. Trabado en combate solo lanza Assailment o alcance Self.
- Objetivo (salvo excepción del hechizo): dentro del arco de visión del mago (LoS no necesaria salvo Missile), dentro del alcance, y no una unidad trabada. Self = sin objetivo (puede tener "aura" medida desde el lanzador). Combat = solo la unidad con la que está trabado.
- **Lanzar**: 2D6 + Nivel (+/- modificadores) = resultado. Si >= CV, se lanza (aún dispersable); si menor, falla. **Magic Resistance (-X)**: modificador a la tirada de Casting de hechizos (también Bound) contra una unidad con ese modelo; no acumulable (el mayor). Los Wizards del Imperio tienen Magic Resistance (-1).
- **Perfect Invocation** (6-6 natural): se lanza sea cual sea el CV o los modificadores y no puede dispersarse en el momento. **Miscast** (1-1 natural): no se lanza y se tira en la tabla.

| Miscast 2D6 | Resultado |
|---|---|
| 2-4 | Dimensional Cascade: blast 5" sobre el mago; todo modelo (amigo o enemigo) bajo ella puede ser impactado: un impacto F10 AP-4 |
| 5-6 | Calamitous Detonation: blast 3" sobre el mago; un impacto F6 AP-2 |
| 7 | Careless Conjuration: el mago sufre un impacto F4 AP-1 |
| 8-9 | Barely Controlled Power: el hechizo se lanza (con su CV a efectos de dispersión) pero no hay más intentos ese turno |
| 10-12 | Power Drain: se lanza con Perfect Invocation pero no hay más intentos ese turno |

- **Bound**: si tiene Power Level se suma a la tirada; si no, la tirada es el resultado. Sin miscast ni Perfect Invocation. Dispersable (sin riesgo de "outclassed"). Un Bound por fase y modelo.
- **Dispel** (cuando el rival lanza, salvo Perfect Invocation): *Wizardly* = un mago propio dentro de Dispel range del lanzador (Niveles 1-2: 18"; 3-4: 24"; no trabado, no en huida, en el campo), tira 2D6 + Nivel. *Fated* = una vez por turno, sin mago o para evitar riesgo, 2D6 sin sumar. Si el resultado SUPERA el de lanzamiento (estrictamente) se dispersa; si es igual o menor, falla. **Unbinding**: 6-6 natural dispersa siempre (no a un Perfect Invocation). **Outclassed in the Art**: 1-1 natural en Wizardly dispel: ese mago tira en la tabla de Miscast (dispel por cast, unbinding por perfect invocation).
- **Duración**: instantánea, "hasta el final del turno" o "hasta tu próxima Start of Turn". **Remains in Play**: dura hasta que el lanzador muera, lo termine (al inicio de cualquier sub-fase) o salga del campo; el mago puede lanzar otros hechizos (no el mismo). El rival puede intentar dispersarlo en la Conjuration de cualquiera de SUS turnos siguientes (Fated o Wizardly) superando el CV mínimo del hechizo (no el resultado original). Un Perfect Invocation puede dispersarse así en turnos posteriores.

## B. LORES DE MAGIA (pp.320-336)

**Quién usa qué**: Imperio (Wizard Lord N3 [+30 pts a N4], Master Mage N1 [+30 pts a N2]; Magical Attacks, Magic Resistance (-1)): UN Lore de Battle Magic, Daemonology, Dark Magic, Elementalism, Illusion o Necromancy (no High Magic; no tiene Lore propio). O&G: Orc Shaman (Weirdnob N3 / Weirdboy N1): Battle Magic, Elementalism o Waaagh! Magic; Goblin Shaman (Oddnob/Oddgit): Elementalism o Waaagh! Magic; Night Goblin Shaman: Illusion o Waaagh! Magic. Waaagh! Magic es el único nombre del Lore de los chamanes. Troll Magic (Troll Hag/Ogdruz, aj_orcs.txt) no se incluye. "Impactos" se resuelven con To Wound y salvaciones normales (interp.). CV = Casting Value.

### Battle Magic (pp.321-322): Imperio y Orcos
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | Hammerhand | Assailment | 7+ | Combat | 2D3 impactos F4 AP-2 a la unidad trabada |
| 1 | Fireball | Missile | 8+ | 24" | 2D6 impactos F4 AP-, Flaming Attacks |
| 2 | Curse of Arrow Attraction | Hex | 7+ | 21" | Hasta tu próxima Start of Turn repites los To Hit de 1 natural al disparar a la unidad |
| 3 | Pillar of Fire | Vortex | 9+ | 12" | Remains in Play. Blast 3" dentro de 12"; terreno peligroso; se mueve D6" en dirección elegida por el lanzador cada Start of Turn; toda unidad (amiga o enemiga) que toque o cruce sufre D3+3 impactos F3 AP-2, Flaming |
| 4 | Arcane Urgency | Conveyance | 10+ | 15" | Unidad amiga no en huida que ya movió esta fase: mueve otra vez |
| 5 | Oaken Shield | Enchantment | 7+ | Self | Hasta tu próxima Start of Turn, lanzador y su unidad: Ward 5+ |
| 6 | Curse of Cowardly Flight | Hex | 9+ | 15" | La unidad hace Panic test inmediato; si pasaría automáticamente Panic, lo hace igual y si falla, Give Ground |

### Waaagh! Magic (pp.335-336): Orcos y Goblins
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | Fist of Gork (or Mork) | Assailment | 9+ | Combat | Blast 5" sobre el centro de la unidad trabada, dispersa D3"+1; cada modelo (amigo o enemigo) bajo ella puede ser impactado: un impacto F4 AP-1 |
| 1 | Vindictive Glare | Missile | 8+ | 21" | UN impacto F7, Multiple Wounds (D3), sin armadura (Ward y Regeneration sí). Puede apuntar a unidad trabada |
| 2 | Hand of Mork (or Gork) | Conveyance | 7+ | 18" | Solo personaje amigo (incluso trabado): se recoloca a 2D6" de su posición, a más de 3" de enemigos; con 1-1 pierde 1 Herida. Permite salir de combate |
| 3 | Bad Moon Rizin' | Hex | 10+ | 15" | Hasta el final del turno: -D3 a WS e Iniciativa (mín. 1) |
| 4 | Evil Sun Shinin' | Enchantment | 9+ | Self | Hasta tu próxima Start of Turn, unidades amigas en Rango de Mando del lanzador: repiten To Hit de 1 natural y +1 AP en sus armas |
| 5 | 'Ere We Go! | Enchantment | 9+ | Self | Unidades amigas en Rango de Mando del lanzador en Declare Charges: +3" al alcance máximo de carga y +D3 a la Charge roll |
| 6 | Foot of Gork (or Mork) | Vortex | 8+ | 15" | Remains in Play. Blast 5" dentro de 15"; terreno peligroso; se mueve 2D6" en dirección aleatoria cada Start of Turn; toda unidad (amiga o enemiga) que toque o cruce sufre D3+3 impactos F5 AP-1 |

**Lore of Gork (Orc Shaman) / Lore of Mork (Goblin Shamans)**, rh.txt: al descartar un hechizo generado, puede tomar la signature de su Lore o uno de estos:
| Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|
| Brain Bursta | Assailment | 10+ | Combat | UN modelo trabado sufre un impacto F6, Multiple Wounds (D3), sin armadura ni Regeneration (Ward sí) |
| Gaze of Gork | Missile | 9+ | 5D6" | Línea recta de 5D6" desde la peana del lanzador; todo modelo (amigo o enemigo) bajo ella: un impacto F5 AP-3 |
| Mork's Curse | Hex | 8+ | 18" | Remains in Play. La unidad repite las salvaciones de armadura de 6 natural |
| Itchy Nuisance | Hex | 9+ | 15" | Hasta tu próxima Start of Turn: -D3 a Toughness e Iniciativa (mín. 1) |

Mob Rule (Orc Shaman): unido a una unidad de Orcos/Black Orcs (toda de Orcos) con Unit Strength 10+: +1 a sus Casting rolls.

### Elementalism (pp.327-328): Imperio, Orcos, Goblins
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | Storm Call | Hex | 7+ | 12" | Hasta tu próxima Start of Turn: -1 a Movement e Iniciativa (mín. 1); expira cualquier otro Hex previo sobre la unidad |
| 1 | Flaming Sword | Assailment | 8+ | Combat | D6+1 impactos F3 AP-, Flaming |
| 2 | Plague of Rust | Hex | 9+ | 21" | Hasta tu próxima Start of Turn: -2 al valor de armadura. Puede apuntar a unidad trabada |
| 3 | Summon Elemental Spirit | Vortex | 9+ | 15" | Remains in Play. Blast 3" dentro de 15"; terreno peligroso sin LoS a través; se mueve D6" aleatorio cada Start of Turn; unidades ENEMIGAS que toque o cruce: D3+3 impactos F4 AP-1 |
| 4 | Earthen Ramparts | Enchantment | 10+ | 15" | Hasta tu próxima Start of Turn: Ward 5+ y cuenta como tras obstáculo lineal bajo defendido si es cargada; no puede marchar ni cargar |
| 5 | Wind Blast | Missile | 8+ | 15" | D3+3 impactos F5 AP-1; luego la unidad hace Give Ground |
| 6 | Travel Mystical Pathway | Conveyance | 10+ | 9" | Unidad amiga no en huida que no ha movido: se recoloca a 12" de su posición, a más de 6" de enemigos; no puede volver a mover esta fase |

### Illusion (pp.331-332): Imperio y Night Goblins
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | Glittering Robe | Enchantment | 8+ | Self | Hasta tu próxima Start of Turn: -1 al To Hit enemigo contra lanzador y su unidad; expira cualquier otro Enchantment previo sobre los afectados |
| 1 | Mind Razor | Missile | 7+ | 15" | Test de Liderazgo de la unidad: pasa = D3 impactos F3 AP-; falla = D3+3 impactos F4 AP-3 |
| 2 | Shimmering Dragon | Conveyance | 8+ | 12" | Solo personaje amigo no en huida que no ha movido: Fly (10) hasta el final del turno |
| 3 | Column of Crystal | Vortex | 10+ | 9" | Remains in Play. Blast 5" dentro de 9"; no se mueve; terreno impasable sin LoS a través |
| 4 | Confounding Convocation | Hex | 9+ | 9" | Remains in Play. La unidad tiene Stupidity |
| 5 | Spectral Doppelganger | Assailment | 9+ | Combat | 2D6 impactos con las características y reglas del lanzador y sus armas |
| 6 | Miasmic Mirage | Hex | 11+ | 15" | Hasta tu próxima Start of Turn: -2 Movement (mín. 1), no marcha ni carga; expira otro Hex previo |

### Daemonology (pp.323-324): Imperio
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | The Summoning | Missile | 9+ | 18" | 2D6 impactos F4 AP-1 |
| 1 | Steed of Shadows | Conveyance | 9+ | 15" | Solo unidad amiga "infantry" no en huida que no ha movido: Fly (12) hasta tu próxima Start of Turn |
| 2 | Gathering Darkness | Hex | 9+ | 12" | Hasta tu próxima Start of Turn: -2 Iniciativa (mín. 1), -2 Liderazgo (mín. 2), no usa Inspiring Presence. Puede apuntar a unidad trabada |
| 3 | Daemonic Familiars | Assailment | 8+ | Combat | 2D6 impactos F2, sin armadura (Ward y Regeneration sí) |
| 4 | Daemonic Vessel | Enchantment | 10+ | Self | Hasta el final del turno, lanzador, montura y unidad: +1 Fuerza y +1 Ataques (máx. 10), +1 AP en sus armas |
| 5 | Vortex of Chaos | Vortex | 8+ | 15" | Remains in Play. Blast 3" dentro de 15"; terreno peligroso; D6" aleatorio cada Start of Turn; unidades (amigas o enemigas): D6+1 impactos F3 AP- |
| 6 | Daemonic Vigour | Enchantment | 9+ | 15" | Hasta el final del turno: +1 Movement, Toughness e Iniciativa (máx. 10) |

### Dark Magic (pp.325-326): Imperio
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | Doombolt | Missile | 8+ | 24" | Blast 3" sobre el centro de la unidad; cada modelo enemigo bajo ella puede ser impactado: un impacto F3 AP-2 |
| 1 | Word of Pain | Hex | 10+ | 18" | Hasta tu próxima Start of Turn: -1 Fuerza y Toughness (mín. 1). Puede apuntar a unidad trabada |
| 2 | Stream of Corruption | Assailment | 8+ | Combat | Plantilla de llama (estrecho en la peana del lanzador, ancho sobre la unidad trabada); cada modelo (amigo o enemigo) bajo ella puede ser impactado: un impacto F3 AP-1 |
| 3 | Infernal Gateway | Conveyance | 10+ | 12" | Solo personaje amigo (incluso trabado) no en huida: se recoloca a 12", a más de 6" de enemigos. Permite salir de combate |
| 4 | Phantasmagoria | Vortex | 9+ | 12" | Remains in Play. Blast 3" dentro de 12"; no se mueve; terreno peligroso. Unidades enemigas que acaben su movimiento a 12" o menos: Panic test; las que fallan hacen Fall Back in Good Order o huyen alejándose; las que pasan son Impetuous mientras estén a 12" o menos |
| 5 | Battle Lust | Enchantment | 9+ | 12" | Hasta el final del turno: Frenzy y Hatred (all enemies) |
| 6 | Soul Eater | Assailment | 7+ | Combat | UN modelo trabado: un impacto F3, Multiple Wounds (3), sin armadura (Ward y Regeneration sí) |

### Necromancy (pp.333-334): Imperio
| # | Hechizo | Tipo | CV | Rng | Efecto |
|---|---|---|---|---|---|
| Sig | The Dwellers Below | Assailment | 7+ | Combat | Blast 3" sobre el centro de la unidad trabada, dispersa D3+1"; cada modelo ENEMIGO bajo ella puede ser impactado: un impacto F3 AP- |
| 1 | Deathly Cabal | Enchantment | 10+ | Self | Hasta tu próxima Start of Turn, lanzador y unidad: Ward 6+ contra heridas de ataques enemigos no mágicos, y Fear (si ya la tienen, Terror) |
| 2 | Unquiet Spirits | Missile | 8+ | 15" | 3D6 impactos F2, sin armadura (Ward y Regeneration sí) |
| 3 | Spiritual Vortex | Vortex | 11+ | 12" | Remains in Play. Blast 5" dentro de 12"; no se mueve; terreno peligroso. Unidades enemigas a 8" o menos: -1 Liderazgo (mín. 2) y sin Inspiring Presence |
| 4 | Curse of Years | Hex | 10+ | 15" | Hasta tu próxima Start of Turn: -1 Movement, WS y Toughness (mín. 1); expira otro Hex previo |
| 5 | Spectral Steed | Conveyance | 9+ | 12" | Remains in Play. Solo personaje amigo "infantry": Ethereal y Fly (10) mientras dure |
| 6 | Spirit Leech | Hex | 8+ | 18" | Hasta el final del turno: -2 Liderazgo (mín. 2), sin Inspiring Presence. Puede apuntar a unidad trabada |

## C. REGLAS ESPECIALES (pp.165-181)

Prioridad: única > ejército > universal/troop type. Los efectos sobre características o tiradas son acumulables (Armour Bane (2) + (1) = (3)). **NO existen como reglas universales**: Strider (equivale a Move Through Cover), Quick to Fire (es Quick Shot), Heavy Armour (es equipo), Stand & Shoot (reacción de carga, p.121), Ward Save (regla general). Ambush existe como Ambushers pero ninguna unidad de estas listas la usa (no se detalla). Stand & Shoot (p.121): con proyectiles y LoS al cargador; si la distancia es menor que el Movimiento del cargador, solo Hold o Flee.

| Regla | Efecto exacto |
|---|---|
| Armour Bane (X) | 6 natural al herir: el AP del arma mejora X |
| Armoured Hide (X) | Valor de armadura mejora X (también el del jinete); sin armadura = 7+ base |
| Close Order | Formación Close Order; si empieza a menos de 1" de unidad amiga de infantry no en huida con 10+ modelos, puede usar su Movimiento |
| Counter Charge | Solo unidades enteras. Al ser cargada por el frente por cavalry, chariot o monster y si la distancia es >= Movimiento del cargador: pivota hacia él y avanza D3+1"; ambas cuentan como cargadoras. No en huida ni trabada. Una vez por turno |
| Cumbersome | El arma no se usa en Stand & Shoot |
| Drilled | Redress the ranks gratis antes de mover; marcha a menos de 8" de enemigo sin test; personajes unidos también |
| Evasive | Una vez por turno, al ser objetivo de disparo: Fall Back in Good Order y luego el disparo sigue |
| Extra Attacks (+X) | +X Ataques |
| Fast Cavalry | Open Order con todos los modelos con la regla: Quick Turn aunque haya marchado |
| Fear | Si quiere cargar a enemigo con Fear y mayor Unit Strength: test de Liderazgo, si falla no carga (carga fallida). Trabada con él al elegir el combate: test; si falla, -1 To Hit contra él. Un test por turno; los que causan Fear son inmunes |
| Fight In Extra Rank | Ataque de apoyo: modelo directamente detrás de uno amigo que está en el rango de lucha (no flanco/retaguardia ni estando en el rango de lucha) (p.146) |
| Fire & Flee | Reacción de carga con proyectiles y LoS: Stand & Shoot y huye; la Flee roll es 2D6 descartando el menor. Si distancia < Movimiento del cargador: Hold o Flee |
| First Charge | Si la primera carga de la partida contacta, el objetivo queda Disrupted hasta el final del Combate |
| Flaming Attacks | Ataques/impactos flamígeros; causa Fear en war beasts y swarms |
| Flammable | Sin Regeneration contra heridas flamígeras |
| Fly (X) | Vuela hasta X": pasa sobre modelos y terreno, marcha a menos de 8" de enemigo sin test; no acaba sobre impasable/unidad ni a menos de 1" de enemigo; empieza y acaba en el suelo; no se une a no voladores |
| Frenzy | +1 Ataques (no a la montura). Mayoría: supera Fear/Panic/Terror automáticamente; si puede declarar carga, debe; no huye como reacción de carga ni hace Restraint. Se pierde al perder una ronda de combate |
| Furious Charge | +1 Ataques el turno que carga con movimiento de carga de 3"+ |
| Hatred (X) | Repite To Hit fallidos contra los odiados en la primera ronda de combate |
| Horde | Rank Bonus máximo +1 |
| Immune to Psychology | Mayoría: supera Fear, Panic y Terror automáticamente; no huye como reacción de carga |
| Impact Hits (X) | Solo si cargó 3"+ y en contacto: ataques automáticos a Iniciativa 10 con Fuerza sin modificar |
| Impetuous | Si puede declarar carga: D6, 1-3 debe declararla, 4+ normal |
| Killing Blow | 6 natural al herir en combate a infantry/cavalry: sin armadura ni Regeneration (Ward sí) y la herida quita todas las Heridas restantes; no con heridas automáticas |
| Large Target | Los enemigos nunca sufren modificadores de cobertura al dispararle; LoS sobre/a través de otros modelos (y viceversa) |
| Loner | No puede ser General; no se une a unidades sin Loner (y viceversa) |
| Magical Attacks | Ataques mágicos (los hechizos y objetos mágicos ya lo son) |
| Magic Resistance (-X) | Ver A |
| Move & Shoot | Puede usarse tras marchar |
| Move Or Shoot | No puede usarse si el modelo movió ese turno por cualquier motivo (incluido reformar/reagrupar) |
| Move Through Cover | Sin penalizador de Movimiento por terreno difícil/peligroso; repite 1s en tests de terreno peligroso |
| Multiple Shots (X) | Dispara 1 o X veces; con X disparos, -1 To Hit |
| Multiple Wounds (X) | Cada herida no salvada vale X Heridas (el exceso no pasa a otros modelos) |
| Open Order | Formación Open Order |
| Poisoned Attacks | 6 natural al To Hit = herida automática; no si necesita 7+ o es automático |
| Ponderous | -2 en vez de -1 al To Hit por mover y disparar |
| Quick Shot | Sin el -1 por mover y disparar; Stand & Shoot a cualquier distancia |
| Rallying Cry | En Command, personaje no trabado: una unidad amiga en huida en su Rango de Mando hace un Rally test inmediato (si falla, puede volver a intentarlo en Rally) |
| Random Attacks / Random Movement | Valor de dado en vez de característica, por modelo. Random Movement: mueve en Compulsory Moves, sin marchar ni cargar, solo wheel; al contactar cuenta como carga y la unidad cargada hace Hold; la unidad tira una vez (el menor) |
| Regeneration (X+) | Ver arriba |
| Requires Two Hands | Sin escudo en combate (sí contra disparo y magia) |
| Skirmishers | Formación Skirmish (p.184): sin arcos de flanco/retaguardia (360º de visión, carga y disparo); modelos a 1" o menos entre sí |
| Stomp Attacks (X) | En contacto: ataques automáticos a Iniciativa 1 con Fuerza sin modificar |
| Strike First / Strike Last | Iniciativa 10 / 1 en combate (antes de otros modificadores); se anulan entre sí |
| Stubborn | La primera vez que debe hacer Break test puede no hacerlo y Fall Back in Good Order |
| Stupidity | Si no está trabada, test de Liderazgo en Start of Turn; si falla avanza recto en Compulsory Moves, sin maniobras, marcha ni carga. Contagia a la unidad/montura de un personaje |
| Swiftstride | +3" al alcance máximo de carga y +D6 a Charge, Flee y Pursuit |
| Terror | También causa Fear. Al declarar carga, el objetivo hace test de Liderazgo; si falla, huye. Si su bando gana el combate, los perdedores aplican -1 Liderazgo al Break test |
| Timmm-berrr! | A 0 Heridas, el ganador de una tirada elige arco; unidades en ese arco y en contacto sufren D6 impactos con su Fuerza, AP-1 |
| Unbreakable | Al perder un combate no hace Break test: Give Ground automático |
| Veteran | Mayoría: repite tests de Liderazgo fallidos (no Break) |
| Volley Fire | Mitad (redondeo arriba) de cada rango tras el primero también dispara (no si movió ni en Stand & Shoot) |
| Warband | Salvo huida: +Rank Bonus actual a Liderazgo (máx. 10, no para Restraint); si la mayoría la tiene, repite la Charge roll |

Otras reglas universales leídas pero poco relevantes: Ambushers, Breath Weapon, Chariot Runners, Detachment, Ethereal, Feigned Flight, Howdah, Ignores Cover, Levies, Mercenaries, Monster Handlers, Monster Slayer, Motley Crew, Regimental Unit, Reserve Move, Scouts, Shieldwall, Unstable, Vanguard, Warp-spawned.

**Reglas de ejército (resumen)**. O&G (rh.txt): Choppas (turno de carga, armas no mágicas: repite To Wound de 1 natural y +1 AP; no monturas), Big 'Uns (+1 Fuerza y Armour Bane (1) en combate), Ignore Goblin Panic y Ignore Panic (sin Panic por Goblins/otros a 6" que mueren o rompen), Quell Impetuosity (a 6" pueden ignorar Impetuous), Fear of Elves, Tusker Charge (jabalí S+1 AP-1 en carga), Warpaint (Ward 6+, sin armadura), Waaagh! (una vez por partida, Command, test de Ld del Warboss: él, su montura y su unidad de Orcos repiten To Hit de 1 natural y +1 resultado de combate hasta tu próxima Start of Turn). Imperio (fof.txt): "Hold the Line!" (personaje y su unidad superan Panic automáticamente), Master of Battle (la unidad de caballeros gana Immune to Psychology). NO leídas: Prayers of Sigmar/Ulric, Clouds of Soot & Smoke, Master of Ballistics, Inner Circle, Steam Power y similares.

## D. ARMAS Y ARMADURA (pp.213-222)

Con varias armas de combate la unidad elige una al elegir el combate (toda igual, salvo Motley Crew; personajes y campeones eligen aparte) y no la cambia durante el combate. Igual con proyectiles al elegir el disparo.

| Arma de combate | S | AP | Reglas y notas |
|---|---|---|---|
| Hand weapon | S | - | Por defecto |
| Additional/two hand weapons | S | - | Extra Attacks (+1), Requires Two Hands |
| Flail | S+2 | -2 | Requires Two Hands; S+2 solo en la primera ronda |
| Great weapon | S+2 | -2 | Armour Bane (1), Requires Two Hands, Strike Last |
| Halberd | S+1 | -1 | Armour Bane (1), Requires Two Hands |
| Morning star | S+1 | -1 | S+1 solo en la primera ronda |
| Whip | S | - | Fight in Extra Rank, Strike First |
| Lance | S+2 | -2 | Armour Bane (1); solo cavalry/monster; solo el turno de carga (si no, hand weapon) |
| Cavalry spear | S+1 | -1 | Fight in Extra Rank; cavalry/monster/chariot; S+1 y AP-1 solo en carga; sin ataque de apoyo el turno que cargó |
| Throwing spear | S | - | Fight in Extra Rank; solo el turno de carga |
| Thrusting spear | S | - | Fight in Extra Rank; solo infantry; sin ataque de apoyo si cargó; si es cargado por el frente, +1 Iniciativa contra los cargadores |

| Proyectil | Alcance | S | AP | Reglas |
|---|---|---|---|---|
| Longbow | 30" | 3 | - | Armour Bane (1), Volley Fire |
| Shortbow | 18" | 3 | - | Quick Shot, Volley Fire |
| Warbow | 24" | S | - | Volley Fire |
| Handgun | 24" | 4 | -1 | Armour Bane (1), Ponderous |
| Pistol | 12" | 4 | -1 | Armour Bane (1), Quick Shot |
| Brace of pistols | 12" | 4 | -1 | Armour Bane (1), Multiple Shots (2), Quick Shot. En combate: S, AP-, Extra Attacks (+1), Requires Two Hands |
| Crossbow | 30" | 4 | - | Armour Bane (2), Ponderous |
| Repeater crossbow | 24" | 3 | - | Armour Bane (1), Multiple Shots (2) |
| Throwing weapon / Javelin / Sling / Throwing axe | 9" / 12" / 18" / 9" | S / S / 3 / S+1 | - | Multiple Shots (2), Move & Shoot, Quick Shot / Move & Shoot, Quick Shot / Multiple Shots (2) / Quick Shot |

Existen además repeater handgun/pistol y repeater handbow (p.218-219; no detalladas aquí).

**Armadura** (pp.221-222): light 6+, heavy 5+, full plate 4+; sin armadura 7+. Escudo: +1 al valor (light + escudo = 5+; sin armadura + escudo = 6+); no se usa en combate con Requires Two Hands. Barding: +1 al valor de la montura/jinete (heavy 5+ → 4+). Máximo 2+. Wizards no llevan armadura ni escudo.

## E. MÁQUINAS DE GUERRA (pp.198, 223-230)

**General (p.198)**: modelo único con perfil dividido máquina+dotación. En combate usa T y Heridas de la dotación; fuera de combate, las de la máquina. Cada Herida de dotación perdida = -1 Ataques. La salvación usa la armadura de la dotación. Si cualquiera llega a 0 Heridas, se retira el modelo. "We're Not Paid to Fight": si Rompe y huye, se destruye. Puede pivotar libre (no cuenta como mover) y hacer follow-up. No marcha, carga ni persigue; -1 a la Flee roll. Unit Strength = Heridas iniciales.

| Arma | Alcance | S | AP | Reglas |
|---|---|---|---|---|
| Cannon | 48" | 8 | -2 | Armour Bane (2), Cannon Fire, Cumbersome, Move or Shoot, Multiple Wounds (D3) |
| Great cannon (Imperio) | 60" | 10 | -3 | Igual, Multiple Wounds (D3+1) |
| Grapeshot | 12" | 4 | -1 | Cumbersome, Move or Shoot, Needs More Nails |
| Stone thrower (Rock Lobber) | 12-60" | 4 (8) | -1 (-3) | Cumbersome, Move or Shoot, Bombardment, Multiple Wounds (D3+1) solo al modelo bajo el agujero central |
| Mortar (Imperio) | 12-48" | 2 (6) | -2 (-3) | Armour Bane (1), Bombardment (blast 5"), Multiple Wounds (D3) al central |

No usan la BS de la dotación (salvo para restar en fuego indirecto). Great Cannon (fof.txt): T6, 3 Heridas, 125 pts, dotación BS3 Ld7 M4 WS3 S3 T3 W3 I3 A3, 50x75 mm, Skirmishers. Goblin Rock Lobber (rh.txt, p.41): equipo "Stone thrower"; T6, 4 Heridas, 75 pts; dotación Goblin M4 WS2 BS3 S3 T3 W4 I3 A3 Ld4; 60x100 mm; Fear of Elves, Skirmishers; puede llevar Orc Bully (+10 pts) que cede su Ld a las máquinas en su Rango de Mando.

**Cannon Fire** (pp.227-228): (1) elige un punto en LoS y alcance máximo (puede ser el suelo). (2) Dado de Artillería: Misfire = tabla; número = el punto se mueve esa distancia directamente alejándose del cañón (punto de impacto). (3) Otro dado de Artillería: Misfire = se entierra y se detiene; número = rebota esa distancia en línea recta alejándose. (4) Todo modelo bajo el punto de impacto o bajo la trayectoria del rebote es impactado automáticamente; en una unidad formada, máximo un modelo por rango (cañón en frente o retaguardia) o por fila (cañón en flanco). (5) Se detiene al golpear un monstrous creature o behemoth, terreno impasable o un obstáculo lineal alto. **Grapeshot**: tira dado de Artillería; número = impactos automáticos a la unidad objetivo; Misfire = tabla.

**Bombardment** (Stone Thrower / Mortar, p.225-226): (1) objetivo: unidad enemiga en LoS, entre alcance mínimo y máximo; blast con el agujero sobre su centro. (2) Dado de Artillería y de Dispersión: Misfire = tabla; "Hit!" = en el blanco (se ignora el número); flecha = mueve la plantilla el número de pulgadas en esa dirección. (3) Todo modelo bajo la plantilla puede ser impactado; UN modelo bajo el agujero central recibe F y AP entre paréntesis (y Multiple Wounds); los demás, F y AP normales (stone thrower: F4 AP-1, blast 3"). **Fuego indirecto** (declarar antes; sin LoS): flecha igual; "Hit!" = dispersa en la dirección de la flecha pequeña del Hit! una distancia = dado de Artillería menos la BS de la dotación (mín. 0).

**Misfire** (D6): Stone thrower: 1 destruida; 2-4 Malfunction (la dotación pierde 1 Herida, no dispara este turno ni hasta el final de la siguiente ronda); 5-6 Twang (no dispara este turno). Black Powder (cañón, mortero, organ gun, etc., p.230): 1 destruida; 2-4 Malfunction (igual); 5-6 Pffft (no dispara este turno).

Otros del Imperio (fof.txt): Helblaster (24", S5, AP-1, Armour Bane (2); tira 3 dados de Artillería = disparos; 1 Misfire = -1 To Hit; 2 = sin disparos y tabla; 3 = 30 disparos y se destruye), Helstorm (12-48", S3, AP-1, D3 blast de 3"), Organ gun (30", S5, AP-1, Armour Bane (2); 2 dados de Artillería = disparos).

## F. PERSONAJES Y GENERAL (pp.203-212)

- **Rango de Mando** = Liderazgo en pulgadas. General y Battle Standard Bearer: 12" siempre; 18" si ellos o su montura tienen Large Target.
- **General**: personaje con más Liderazgo (el jugador elige si hay empate; se declara antes de desplegar; no puede ser Loner). **Inspiring Presence**: si no huye, las unidades amigas en su Rango de Mando pueden usar su Liderazgo.
- **Battle Standard Bearer** (Imperio: Captain por +25 pts, un estandarte mágico sin límite): +1 resultado de combate aunque haya otro estandarte (dos BSB solo cuentan una vez); se pierde si muere el portador. **Hold Your Ground**: si no huye, unidades amigas en su Rango de Mando repiten Panic o Rally fallidos y pueden repetir los 2D6 del Break test (se acepta el segundo resultado).
- **Montados**: el modelo es del troop type de la montura; perfil dividido; Movimiento de la montura; cada parte usa sus WS, BS, S, I, A y armas; los To Hit enemigos usan el WS del personaje; Impact/Stomp usan la Fuerza de la montura; salvación con la mejor armadura entre ambos; si el personaje llega a 0 Heridas, se retira todo. Monstruos montados y carros pueden mejorar T y Heridas; en carros las Heridas del personaje se suman a las del carro y la T usada es la mayor.
- **Personaje solo** (infantry/cavalry no unido): siempre Skirmish. *Evade*: si va a ser contactado por una persecución (no huyendo ni trabado), test de Iniciativa; si pasa mueve hasta su Movimiento alejándose. *No puede ser objetivo* de disparos ni hechizos enemigos a menos de 3" de una unidad amiga (no en huida) con 5+ modelos del mismo troop type, salvo que sea el objetivo más cercano.
- **Unirse**: al desplegar, o en Remaining Moves entrando en contacto con unidad no trabada ni en huida (la unidad no puede mover tras ser unida; salir: mover fuera antes de que la unidad mueva). Suma su Unit Strength. Los hechizos de unidad afectan a ambos. Si la unidad huye, el personaje huye con ella; si es alcanzada, muere. Va al primer rango desplazando tropa; usa el Movimiento del más lento. Los personajes no se unen entre sí.
- **Disparo**: personaje y unidad con proyectiles disparan al mismo objetivo con sus características. Un personaje unido solo recibe disparos enemigos si la unidad tiene menos de 5 modelos de tropa (los impactos se reparten primero uno por modelo y luego por igual), si es objetivo de un ataque dirigido o si está bajo una plantilla. **Look Out, Sir!** (5+ modelos de tropa): D6, 1 = impactado el personaje; 2+ = otro miembro de la unidad.
- **Combate**: puede moverse a través de los rangos para unirse al rango de lucha; dentro de él ataca con sus Ataques a cualquier enemigo en contacto; solo recibe ataques dirigidos contra él por enemigos en contacto (Impact/Stomp solo si hay menos de 5 modelos de tropa). El exceso de heridas no pasa entre personaje y unidad. Si hay más personajes que modelos de tropa en el rango de lucha, los sobrantes se retiran (sin atacar, sin ser atacados, sin dar beneficios).
- **Desafíos**: al elegir el combate (paso 1.1); uno por combate; primero el jugador activo, si no, el inactivo. Retador y aceptante: personaje o campeón dentro o adyacente al rango de lucha. Si no se acepta, el retador elige a uno de los posibles aceptantes, que debe retirarse del combate y no vuelve mientras su unidad siga trabada con el retador. No se puede rechazar si no se forma parte de una unidad, si se es el último modelo o si la unidad está trabada por sus cuatro arcos. En el duelo ambos dirigen todos sus ataques uno contra otro por Iniciativa; nadie más les ataca. Si ambos sobreviven, continúa el siguiente turno. Las monturas (y dotación de un carro) deben atacar al rival. **Overkill**: el vencedor que mata y causa más heridas no salvadas que Heridas le quedaban al rival: +1 resultado de combate por exceso, máximo +5.

## G. GRUPOS DE MANDO (pp.199-202)

Champion, standard bearer y musician se compran como mejora de modelos de tropa y van en el primer rango (estandarte lo más al centro); si no caben, en el segundo; al girar o reformar vuelven al frente.
- **Campeón**: perfil algo mejor; mismo equipo que la unidad salvo opción; dispara al mismo objetivo con sus características. Como baja: no cuenta en disparo salvo si es el último modelo, objetivo de un ataque dirigido o está bajo plantilla; Look Out, Sir! (5+ de tropa, D6: 1 impactado, 2+ otro miembro). En combate no cuenta salvo si es el último o los enemigos en contacto dirigen ataques contra él; el exceso de heridas no pasa a la unidad. Si muere se sustituye por un modelo normal. Emite y acepta desafíos.
- **Portaestandarte**: mismas características y equipo; +1 resultado de combate. Si la unidad en huida es alcanzada o es destruida en combate por un enemigo, el estandarte se captura (puntos de victoria, p.286); no si muere por disparo. Si cae, otro modelo de tropa lo recoge, así que solo se pierde cuando es (con el campeón) uno de los dos últimos modelos (se retira antes que el campeón).
- **Músico**: mismas características y equipo. *Onwards to Victory!*: con el resultado de combate empatado, el bando con músico en el primer rango de una o más unidades obtiene +1 punto (se anula si ambos tienen). *Steadying Rhythm*: unidad en huida con músico, +1 Liderazgo al reagruparse (máx. 10). *Quick Time*: +1 Liderazgo (máx. 10) en el test para marchar a menos de 8" de un enemigo. Solo se pierde cuando es uno de los tres últimos modelos con estandarte y campeón (se retira antes que ellos).

## SIMPLIFICACIONES SUGERIDAS (motor 2D)

1. **Magia**: por mago, por hechizo y por turno, 2D6 + Nivel contra el CV; guardar solo los dobles naturales (6-6, 1-1). Implementar la tabla de Miscast completa (es corta) y el Dispel Wizardly automático con el mejor mago en rango (18"/24"); Fated dispel una vez por turno. Remains in Play: lista de efectos activos con CV mínimo para dispersar.
2. **Prioridad de implementación**: Battle Magic y Waaagh! Magic (más Lore of Gork/Mork) completas; Elementalism; luego Illusion, Daemonology, Dark Magic y Necromancy. IA por defecto: Imperio con Battle Magic (Hammerhand y Fireball) y chamanes orcos con Waaagh! Magic.
3. **Vortex**: círculo de radio 1.5" o 2.5" que se mueve por un ángulo aleatorio (interp.: el texto dice "dirección aleatoria" sin precisar el dado). Aplicar impactos a toda peana que toque o cruce el trayecto.
4. **Plantillas**: círculo/cono contra peanas: peana completa dentro (o solape con el agujero central) = impacto; solape parcial = 4+. Línea de Gaze of Gork como segmento de 5D6". Llama = cono de 8".
5. **Artillería**: d6 mapeado a dado de Artillería {2,4,6,8,10,Misfire} y dispersión {Hit!, 8 direcciones}; implementar Cannon Fire (rebote en línea con límite un modelo por rango/fila) y Bombardment con fuego indirecto (restar BS), más las dos tablas de misfire.
6. **Reglas**: primero las de la tabla C (Fear, Terror, Frenzy, Impact, Stomp, Swiftstride, Fire & Flee, Stubborn, Unbreakable, Choppas, Waaagh!, Mob Rule, Armour Bane, Multiple Wounds, Regeneration, Ward...). Diferir Ambushers, Scouts, Vanguard, Detachment, Motley Crew, Monster Handlers, Howdah y Levies.
7. **Personajes**: unirse a unidades solo al desplegar (v1), Look Out, Sir!, desafíos con IA simple (aceptar si el propio campeón/personaje tiene ventaja; no rechazable si es el último o la unidad está rodeada).
8. **Mando**: estandarte y músico como flags de la unidad; campeón como modelo especial con Look Out, Sir!.
9. **Pendiente**: Prayers of Sigmar/Ulric y otras reglas de ejército del Imperio, Troll Magic, fórmulas de combate/Break y Rank Bonus por troop type (tabla de la p.106).
