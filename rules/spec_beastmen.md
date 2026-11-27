# Spec Beastmen Brayherds (Warhammer: The Old World)

**Fuentes y convención de citas**
- **RH** = Ravening Hordes. Cito *página PDF* y entre paréntesis la *impresa* (= PDF-1). Sección Beastmen: **PDF 90-118** (imp. 89-117). Mapa verificado con `pdftotext` página a página.
- Unidades prestadas de Warriors of Chaos (WoC): RH PDF 65-67 (imp. 64-66); Marcas de Caos RH PDF 83 (imp. 82).
- **CR** = Core Rulebook (páginas *impresas* según su índice).
- Tablas verificadas visualmente cuando el texto extraído podía ser ambiguo (lista de composición PDF 92, Beastmen Chieftains PDF 93, carros PDF 104, Cockatrice PDF 107). El resto de tablas de perfil salieron limpias en la extracción.
- Todo es "tal cual impreso". Lo que no aparece se indica como **NO ESTÁ EN LAS FUENTES**. Los valores derivados (p. ej. AV final) se marcan como "derivado".

## 0. Avisos críticos
1. **RH no contiene ninguna Army of Infamy de Beastmen.** La lista de Allies cita "Any Beastmen Brayherds Army of Infamy composition list" y el Matched Play Guide menciona *Minotaur Blood Herd* y *Wild Herd* (y el personaje nombrado *Bray-Shaman Kralmaw*), pero sus reglas no están en ninguna fuente disponible (serían del Arcane Journal de Beastmen, no adjunto).
2. **No hay personajes nombrados** de Beastmen en RH.
3. La tabla de personajes llama "Beastmen Chieftains" a Beastlord/Wargor, "Beastmen Shamans" a Great Bray-Shaman/Bray-Shaman, "Minotaur Champions" a Doombull/Gorebull y "Centigor Chieftains" al **Warhoof** (único perfil; la lista de composición los llama "Centigor Chieftains").
4. Nombres de campeón: Bestigor → **Gouge-horn**; Gor → **True-horn**; Ungor → **Half-horn**; Minotaur → **Bloodkine**; Centigor → **Gorehoof**; Dragon Ogre → **Shartak**. Harpies, Chaos Warhounds y Razorgor Herds **no tienen** opciones de mando.
5. **Mutaciones del Caos** (§10): sistema propio de "dones" con coste, cada una **solo una vez por ejército**.
6. **Primal Fury** se testea al elegir el combate de la unidad (Step 1.1) cada fase de Combate; varias reglas (Foe Render, Blood Rage, Banner of Outrage, Horn of the First Beast) dependen de ella.
7. Armadura (CR): light 6+, heavy 5+, full plate 4+, escudo +1, sin armadura 7+, mejor AV posible 2+. **Armoured Hide (X)** mejora el AV en X (CR imp. 166). **Wizards & Armour** (CR imp. 221): los Bray-Shamans no tienen opción de armadura; su **Braystaff** da AV 5+ en modo defensivo (regla propia).
8. Tabla de puntos: coste por modelo; "+X" = suplemento. "Unit Size 5+" = mínimo 5, sin máximo. "0-X por 1.000 pts" = por cada 1.000 pts completos de tamaño de ejército (CR, Army Composition).

## 1. Composición del ejército (RH PDF 92 / imp. 91)

**Grand Army Composition List**
| Categoría | % | Unidades / límites |
|---|---|---|
| Characters | hasta 50% | **0-1 Beastlord, Great Bray-Shaman o Doombull por 1.000 pts**; Wargors, Bray-shamans, Gorebulls y Centigor Chieftains |
| Core | **al menos 25%** | **1+ Gor Herd** (obligatoria); Ungor Herds, Chaos Warhounds, Razorgor Herds y Tuskgor Chariots; si el General es **Beastlord o Wargor**, 0-1 Bestigor Herd como Core; si el General es **Doombull o Gorebull**, 0-1 Minotaur Herd como Core |
| Special | hasta 50% | Bestigor Herds, Harpies, Minotaur Herds, Centigor Herds, Dragon Ogres, Razorgor Chariots y Cockatrice; **Chaos Ogres** (ver lista WoC); si el General es **Great Bray-Shaman o Bray-Shaman**, 0-1 Jabberslythe **o** Cygor como Special; si el General es **Doombull o Gorebull**, 0-1 Ghorgon como Special |
| Rare | hasta 25% | Dragon Ogre Shaggoths, Jabberslythes, Cygors, Ghorgons y Chaos Giants; **Chaos Trolls y Chaos Spawn** (ver lista WoC) |
| Mercenaries | hasta 20% | (sin lista de mercenarios específica en RH; reglas generales CR imp. 173, 279) |
| Allies | hasta 25%, un solo contingente | Cualquier Army of Infamy de Beastmen Brayherds; o Grand Army de: Orc & Goblin Tribes (**Uneasy**), Warriors of Chaos (sin calificativo = Trusted según CR), Tomb Kings of Khemri (**Suspicious**) |

- **Battle Standard Bearer**: "A single Wargor in your army may be upgraded to be your Battle Standard Bearer for +25 points. In addition to their usual allowance of points to spend on magic items, a Battle Standard Bearer can purchase a single magic standard with no points limit." (Solo **Wargor**; no Beastlord, Gorebull ni Warhoof.)

## 2. Personajes (RH PDF 93-96)
Perfil: M WS BS S T W I A Ld, puntos. Unit Size 1 en todos.

| Unidad (RH pág PDF) | M | WS | BS | S | T | W | I | A | Ld | Pts | Tipo / Base | Equipo | AV base |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Beastlord (93) | 5 | 6 | 3 | 5 | 5 | 3 | 5 | 4 | 8 | 115 | Heavy infantry (character); 25x25 (min) 30x30 (max) | Hand weapon | 7+ |
| Wargor (93) | 5 | 5 | 3 | 4 | 5 | 2 | 4 | 3 | 7 | 55 | idem | idem | 7+ |
| Great Bray-Shaman (94), Wizard N3 | 5 | 5 | 3 | 4 | 5 | 3 | 4 | 2 | 8 | 150 | Regular infantry (character); 25x25 (min) 30x30 (max) | Braystaff | 7+ (5+ con Braystaff defensivo) |
| Bray-Shaman (94), Wizard N1 | 5 | 4 | 3 | 3 | 4 | 2 | 3 | 1 | 7 | 65 | idem | Braystaff | idem |
| Doombull (95) | 6 | 6 | 3 | 6 | 5 | 5 | 5 | 5 | 8 | 210 | Monstrous infantry (character); 50x50 | Hand weapon | 7+ |
| Gorebull (95) | 6 | 5 | 3 | 5 | 5 | 4 | 4 | 4 | 7 | 130 | idem | idem | 7+ |
| Warhoof (96) | 8 | 5 | 3 | 5 | 4 | 3 | 3 | 4 | 7 | 75 | Light cavalry (character); 30x60 | Hand weapon | 7+ |

(Warhoof: perfil único, sin perfil de montura separado.)

**Opciones y reglas especiales**
- **Beastmen Chieftains (Beastlord/Wargor)** (PDF 93): una de: additional hand weapon +3 / great weapon +4; una de: light armour +2 / heavy armour +4; shield +2; Chaos Mutations (§10) hasta **50 pts**; **0-1 por 1.000 pts** puede: tener **Ambushers +10** *o* ir montado en **Tuskgor Chariot** *o* **Razorgor Chariot** ("See page 103", §3). Objetos mágicos: Beastlord 100, Wargor 50. Wargor puede ser BSB (+25). Reglas: **Blood Rage, Brayhorn (General only), Foe Render, Gaze of the Gods, Mark of Chaos Undivided, Primal Fury, Warband**.
- **Beastmen Shamans** (PDF 94): Great Bray-Shaman = Level 3 Wizard (Level 4 +30; objetos 100). Bray-Shaman = Level 1 (Level 2 +30; objetos 50). Lores: **Daemonology, Dark Magic, Elementalism** (una de ellas). Chaos Mutations hasta 50; 0-1 por 1.000: Ambushers +10 *o* montura Tuskgor/Razorgor Chariot. Reglas: **Braystaff, Gaze of the Gods, Lore of Beasts, Mark of Chaos Undivided, Primal Fury, Warband**.
- **Minotaur Champions (Doombull/Gorebull)** (PDF 95): una de: additional hand weapon +3 / great weapon +4; una de: light armour **+3** / heavy armour **+6**; shield **+5**; Chaos Mutations hasta 50; objetos: Doombull 100, Gorebull 50. Sin opción de Ambushers ni de montura. Reglas: **Armour Bane (1), Blood Greed, Blood Rage, Bull-gors, Fear, Foe Render, Gaze of the Gods, Impact Hits (1), Mark of Chaos Undivided, Primal Fury, Slaughterer's Call, Warband**.
- **Warhoof** (PDF 96): una de: cavalry spear +2 / great weapon +4; una de: light armour +2 / heavy armour +4; una de: throwing axes +2 / javelins +2; shield +2; 0-1 por 1.000: Ambushers +10; Chaos Mutations hasta 50; objetos hasta 50. Reglas: **Drunken, Fast Cavalry, Gaze of the Gods, Mark of Chaos Undivided, Move through Cover, Primal Fury, Stomp Attacks (1), Swiftstride, Warband**.

**Brayhorn** (PDF 93): "From the beginning of round 2 onwards, if your General is on the battlefield during the Command sub-phase of their turn, they may attempt to sound the Brayhorn by making a Leadership test. If this test is passed, you may immediately roll again for each unit of Ambushers in the army that is held in reserve and that did not arrive during the Start of Turn sub-phase of this turn. Note that this special rule may only be used by a Beastlord or Wargor that has been selected to be the General of the army."
- *Juego:* desde ronda 2, fase de Mando, General Beastlord/Wargor en mesa → test de Ld; si pasa, nueva tirada de llegada (D6, 4+ llega, CR Ambushers) para cada unidad de Ambushers en reserva que no llegó en el Start of Turn de este turno. Se puede intentar cada turno (no dice "una vez por partida").

**Braystaff** (PDF 94): "When this model's combat is chosen during Step 1.1 of any Choose & Fight Combat sub-phase, it must choose to use its Braystaff offensively or defensively. Used offensively, a Braystaff counts as a great weapon. Used defensively, a Braystaff counts as a hand weapon and gives its wielder an Armour Value of 5+."
- *Juego:* elección por combate: ofensivo = great weapon (S+2, AP-2, Armour Bane (1), Requires Two Hands, Strike Last); defensivo = hand weapon y AV 5+. Fuera de combate (disparo/magia) no hay regla: AV 7+ (derivado).

**Slaughterer's Call** (PDF 95): "Whilst this model is Frenzied, any unit it has joined will also become Frenzied."

## 3. Monturas de personaje (RH PDF 93-94, 104)
- Solo Beastlord/Wargor y Great Bray-Shaman/Bray-Shaman pueden montar, y solo en **Tuskgor Chariot** o **Razorgor Chariot**, dentro del límite **0-1 por 1.000 pts** (compartido con la opción de Ambushers, son alternativas "Or:").
- "Character Mount: A Tuskgor Chariot or Razorgor Chariot may be included in your army as a character's mount. If so, its points are added to that of its rider." (PDF 104). Coste: Tuskgor Chariot 85 / Razorgor Chariot 120 (perfiles en §5).
- Doombull/Gorebull y Warhoof: sin monturas.

## 4. Infantería (RH PDF 97-100)

| Unidad (PDF) | Pts/modelo | Tam. | Base | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo base / AV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Bestigor** (97) Special (Core 0-1 con Beastlord/Wargor General) | 13 | 5+ | 30x30 | Heavy inf | 5 | 4 | 3 | 4 | 4 | 1 | 4 | 1 | 7 | Hand weapons, great weapons, heavy armour (5+) |
| Gouge-horn | +8 | | | | 5 | 4 | 3 | 4 | 4 | 1 | 4 | 2 | 8 | |
| **Gor** (98) Core (1+) | 7 | 5+ | 25x25 | Regular inf | 5 | 4 | 2 | 3 | 4 | 1 | 3 | 1 | 6 | Hand weapons (+ obligatorio: additional HW o shields) |
| True-horn | +7 | | | | 5 | 4 | 2 | 3 | 4 | 1 | 3 | 2 | 7 | |
| **Ungor** (99) Core | 5 | 10+ | 25x25 | Regular inf | 5 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 5 | Hand weapons y shields (6+) |
| Half-horn | +7 | | | | 5 | 3 | 3 | 3 | 3 | 1 | 3 | 2 | 6 | |
| **Harpy** (99) Special | 11 | 5+ | 25x25 | Regular inf | 5 | 3 | 0 | 3 | 3 | 1 | 5 | 2 | 6 | Claws (= hand weapons); 7+ |
| **Minotaur** (100) Special (Core 0-1 con Doombull/Gorebull General) | 47 | 2+ | 50x50 | Monstrous inf | 6 | 4 | 3 | 5 | 4 | 3 | 3 | 3 | 7 | Hand weapons y light armour (6+) |
| Bloodkine | +6 | | | | 6 | 4 | 3 | 5 | 4 | 3 | 3 | 4 | 7 | |

AV derivados (CR): Gor con shields 6+, con additional hand weapons 7+; Ungor con shortbows (sin escudo) 7+; Minotaur con shield 5+.

**Opciones por unidad**
- **Bestigor Herd** (PDF 97): Gouge-horn +8, standard bearer +6, musician +6 (por unidad); magic standard hasta 50; Gouge-horn: Chaos Mutations hasta 25 y objetos hasta 25; **0-1 unidad del ejército** puede: Stubborn +1/modelo, Veteran +1/modelo (impreso como dos líneas bajo "may:"; ver §14). Reglas: **Blood Rage, Close Order, Mark of Chaos Undivided, Primal Fury, Warband**.
- **Gor Herd** (PDF 98): **toda la unidad debe** tomar una: additional hand weapons (gratis) / shields (gratis); True-horn +7, standard +5, musician +5; True-horn puede cambiar un hand weapon o su escudo por great weapon (gratis) y objetos hasta 25; **0-1 unidad por 1.000 pts** puede: Ambushers +1/modelo; magic standard hasta 50. Reglas: **Bestial Charge, Blood Rage, Horde, Mark of Chaos Undivided, Move through Cover, Open Order, Primal Fury, Skirmishers, Warband**. (True-horn **sin** Chaos Mutations.)
- **Ungor Herd** (PDF 99): toda la unidad una de: thrusting spears +1/modelo / throwing spears +1/modelo; **o** reemplazar shields por shortbows (gratis); Half-horn +7, standard +5, musician +5; 0-1 unidad por 1.000: Ambushers +1/modelo. **Sin** magic standard, **sin** objetos para el Half-horn. Reglas: **Chariot Runners, Horde, Mark of Chaos Undivided, Move through Cover, Open Order, Primal Fury, Skirmishers, Warband**.
- **Harpies** (PDF 99): sin opciones. Reglas: **Fly (10), Move through Cover, Scouts, Skirmishers, Swiftstride**. (Sin Mark of Chaos Undivided ni Primal Fury.)
- **Minotaur Herd** (PDF 100): **cualquier modelo** una de: additional hand weapon +3/modelo / great weapon +4/modelo; cualquier modelo shield +2/modelo; Bloodkine +6, standard +6, musician +6; magic standard hasta 50; Bloodkine: Chaos Mutations hasta 25, objetos hasta 25; **0-1 unidad del ejército**: Ambushers +3/modelo. Reglas: **Blood Greed, Blood Rage, Bull-gors, Close Order, Fear, Foe Render, Impact Hits (1), Mark of Chaos Undivided, Motley Crew, Primal Fury, Warband**.

**Bestial Charge** (PDF 98): "During a turn in which it made a charge move of 3" or more, a model with this special rule gains a +1 modifier to its Strength characteristic."

## 5. Caballería, war beasts y carros (RH PDF 101-104)

| Unidad | Pts | Tam. | Base | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo / AV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Centigor** (101) Special | 19 | 5+ | 30x60 | Light cav | 8 | 4 | 3 | 4 | 4 | 1 | 2 | 1 | 6 | Hand weapons y shields (6+) |
| Gorehoof | +8 | | | | 8 | 4 | 3 | 4 | 4 | 1 | 2 | 2 | 7 | |
| **Dragon Ogre** (102) Special | 56 | 1-9 | 50x75 | Monstrous cav | 7 | 4 | 2 | 5 | 4 | 4 | 2 | 3 | 8 | Hand weapons y light armour; con Armoured Hide (2) = 4+ (derivado) |
| Shartak | +7 | | | | 7 | 4 | 2 | 5 | 4 | 4 | 2 | 4 | 8 | |
| **Chaos Warhound** (103) Core | 6 | 5+ | 25x50 | War beasts | 7 | 4 | 0 | 3 | 3 | 1 | 3 | 1 | 6 | Claws and fangs (= hand weapon); 7+ |
| **Razorgor** (103) Core | 52 | 1+ | 50x75 | War beasts | 7 | 3 | 0 | 5 | 5 | 3 | 2 | 4 | 6 | Tusks (= hand weapon), calloused hide (= light armour, 6+) |

Centigors y Dragon Ogres tienen **perfil único** (sin jinete/montura separados).

**Carros (PDF 104)** — Heavy chariot, base 50x100, Unit Size 1, **Armour Value 4+**.

| Tuskgor Chariot (Core) **85 pts** | M | WS | BS | S | T | W | I | A | Ld |
|---|---|---|---|---|---|---|---|---|---|
| Chariot | - | - | - | 5 | 4 | 4 | - | - | - |
| Bestigor Crew (x1) | - | 4 | 3 | 4 | - | - | 4 | 1 | 7 |
| Gor Crew (x1) | - | 4 | 3 | 3 | - | - | 3 | 1 | 7 |
| Tuskgor (x2) | 7 | 3 | - | 4 | - | - | 2 | 1 | - |

Equipo: Bestigor Crew hand weapon y great weapon; Gor Crew hand weapon y cavalry spear; Tuskgors tusks (= hand weapons). Reglas: **Close Order, First Charge, Impact Hits (D6+1), Mark of Chaos Undivided, Primal Fury, Razor Tusks, Warband**.

| Razorgor Chariot (Special) **120 pts** | M | WS | BS | S | T | W | I | A | Ld |
|---|---|---|---|---|---|---|---|---|---|
| Chariot | - | - | - | 5 | 5 | 4 | - | - | - |
| Bestigor Crew (x1) | - | 4 | 3 | 4 | - | - | 4 | 1 | 7 |
| Gor Crew (x1) | - | 4 | 3 | 3 | - | - | 3 | 1 | 7 |
| Razorgor (x1) | 7 | 3 | - | 5 | - | - | 2 | 4 | - |

Equipo: igual crew; Razorgor tusks (= hand weapon). Reglas: **Armour Bane (1, Razorgor only), Close Order, Fear, First Charge, Foe Render (Razorgor only), Impact Hits (D6+2), Mark of Chaos Undivided, Primal Fury, Razor Tusks**. (Sin Warband, a diferencia del Tuskgor Chariot.)

Ningún carro tiene opciones (ni mando ni estandarte).

**Opciones/reglas**
- **Centigor Herd** (PDF 101): toda la unidad una de: cavalry spears +1/modelo / throwing spears +1/modelo; **o** reemplazar shields por great weapons +1/modelo; toda la unidad una de: throwing axes +1/modelo / javelins +1/modelo; Gorehoof +8, standard +6, musician +6; Gorehoof objetos hasta 25 (sin mutaciones); **0-1 unidad del ejército** Ambushers +1/modelo; **0-1 unidad por 1.000** magic standard hasta 50. Reglas: **Drunken, Fast Cavalry, Horde, Mark of Chaos Undivided, Move through Cover, Open Order, Primal Fury, Skirmishers, Stomp Attacks (1), Swiftstride, Warband**.
- **Dragon Ogres** (PDF 102): toda la unidad una de: additional hand weapons +3 / great weapons +4 / halberds +3 (por modelo); light → heavy armour +3/modelo (AV derivado 3+); Shartak +7 (sin standard ni musician en la lista); Shartak: Chaos Mutations hasta 25 (sin referencia de página impresa), objetos hasta 25. Reglas: **Armour Bane (1), Armoured Hide (2), Close Order, Fear, Ensorcelled Weapons, Immune to Psychology, Stomp Attacks (2), The Quickening Storm**.
- **Chaos Warhounds** (PDF 103): cualquier unidad: Armoured Hide (1) +1/modelo; Poisoned Attacks +1/modelo; Vanguard +5/unidad. Reglas: **Loner, Move through Cover, Open Order, Swiftstride**.
- **Razorgor Herds** (PDF 103): sin opciones. Reglas: **Armour Bane (1), Fear, Foe Render, Impact Hits (D3), Loner, Open Order, Primal Fury, Razor Tusks, Swiftstride**.

## 6. Monstruos (RH PDF 105-111)
| Unidad (PDF) | Pts | M | WS | BS | S | T | W | I | A | Ld | Base | Tipo | AV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dragon Ogre Shaggoth** (105) Rare | 225 | 7 | 6 | 2 | 6 | 5 | 6 | 4 | 5 | 9 | 50x75 | Monstrous creature | light + Armoured Hide (2) = 4+ (derivado) |
| **Jabberslythe** (106) Rare (Special 0-1 con Shaman General) | 195 | 6 | 4 | 4 | 5 | 5 | 5 | 3 | 5 | 9 | 60x100 | Monstrous creature | scaly skin (= heavy, 5+) |
| **Cockatrice** (107) Special | 170 | 4 | 4 | 5 | 4 | 5 | 4 | 6 | 6 | 6 | 50x50 | Monstrous creature | scaly skin (= heavy, 5+) |
| **Cygor** (108) Rare (Special 0-1 con Shaman General) | 215 | 7 | 2 | 1 | 6 | 5 | 6 | 3 | 4 | 8 | 60x100 | Behemoth | calloused hide (= light, 6+) |
| **Chaos Giant** (109) Rare | 200 | 6 | 3 | 1 | 6 | 6 | 6 | 2 | * | 10 | 50x50 (min) 50x75 (max) | Behemoth | calloused hide (6+); scaly skin opcional (5+) |
| **Ghorgon** (111) Rare (Special 0-1 con Doombull/Gorebull General) | 245 | 7 | 4 | 0 | 6 | 6 | 6 | 4 | 5 | 9 | 60x100 | Behemoth | calloused hide (6+) |

Todos Unit Size 1.

- **Dragon Ogre Shaggoth** (PDF 105): equipo hand weapon y light armour. Opciones: additional hand weapon +3 / great weapon +4; light → heavy armour +6; Chaos Mutations hasta 50; objetos hasta 50. Reglas: **Armour Bane (2), Armoured Hide (2), Close Order, Ensorcelled Weapons, Immune to Psychology, Large Target, Stomp Attacks (D3+1), Storm Call, Terror, The Quickening Storm**.
  - **Storm Call** (Bound spell, **Power Level 1**, se puede lanzar **aunque esté trabado en combate**): Type **Magic Missile**; Casting Value **7+**; Range **Self**; Effect: "If this Bound spell is cast, all units within 6" of this model (friend or foe), including units engaged in combat and this model, suffer D3 Strength 4 hits, each with an AP of -1." (Ver Quickening Storm §8: quien recibe estos impactos queda Quickened.) Nota: Elementalism (CR) tiene un hechizo firma también llamado "Storm Call" (Hex 7+): son distintos; "Storm Call (see page 104)" en Quickening Storm se refiere a este bound spell.
- **Jabberslythe** (PDF 106): equipo wicked claws, slythey tongue, scaly skin (heavy). Sin opciones. Reglas: **Close Order, Fly (9), Large Target, Maddening Aura, Poisoned Attacks, Spurting Bile Blood, Stomp Attacks (D3), Swiftstride, Terror**.
  - Wicked claws: Combat, S, AP -2, sin reglas. Slythey tongue: **12", S5, AP -1, Move & Shoot, Quick Shot** (BS 4).
  - **Maddening Aura**: "During the Command sub-phase of its turn, any enemy unit that is within 8" of this model, including units that are fleeing or that are engaged in combat, must make a Leadership test. If this test is failed, the unit suffers D3 Strength 3 hits, with no armour or Regeneration saves permitted (Ward saves can be attempted as normal)."
  - **Spurting Bile Blood**: "For each Wound this model loses during the Combat phase, the attacking enemy unit suffers a Strength 4 hit, with an AP of -1."
- **Cockatrice** (PDF 107): equipo claws (hand weapon), petrifying gaze, scaly skin (heavy). Opciones: acidic vomit +20; Poisoned Attacks +10. Reglas: **Close Order, Fly (10), Large Target, Stomp Attacks (1), Stony Stare, Swiftstride, Terror**.
  - Petrifying gaze: **18", S2, AP N/A, Magical Attacks, Multiple Wounds (D3)**. "When making a roll To Wound for an attack made with this weapon, substitute the target's Toughness with its Initiative. No armour save is permitted against wounds caused by this weapon (Ward and Regeneration saves can be attempted as normal)." (Un disparo, BS 5; no indica Quick Shot/Move & Shoot.)
  - Acidic vomit: **R N/A, S3, AP -1, Breath Weapon**.
  - **Stony Stare**: "At the start of each Combat phase, enemy models in base contact with this model must make an Initiative test. If this test is failed, they suffer D3 Strength 2 hits, with no armour save permitted (Ward and Regeneration saves can be attempted as normal)." (Test por modelo en contacto.)
- **Cygor** (PDF 108): equipo claws (hand weapon), hurl attack, calloused hide (light). Sin opciones. Reglas: **Close Order, Ghostsight, Immune to Psychology, Large Target, Soul-eater, Stomp Attacks (D3), Stubborn, Terror, Timmm-berrr!**.
  - Hurl attack: **12-36", S4 (8), AP -1 (-3), Bombardment, Cumbersome, Multiple Wounds (D3+1)**. Notas: dispara como stone thrower con regla Bombardment y plantilla de **3"**; si sale **Misfire** en el dado de Artillería, el Cygor **pierde 1 Wound** (no se tira en tabla de Misfire); Multiple Wounds (D3+1) solo al modelo bajo el agujero central. (Valores entre paréntesis = modelo bajo el agujero central, como stone thrower CR imp. 224.) No lista "Move or Shoot".
  - **Ghostsight**: "During the Combat phase, a Cygor may re-roll any failed rolls To Hit made against enemy Wizards, enemy models or units equipped with any magic items, or enemy models or units with a Ward or Regeneration save."
  - **Soul-eater**: "Any enemy Wizard that wishes to cast a spell whilst within 12" of one or more Cygors must first make a Leadership test. If this test is failed, the Wizard has lost their nerve and, should they fail to cast the spell (i.e., should their casting result be less than the casting value of the spell), the spell has been miscast and the active player immediately rolls on the Miscast table to see what fate befalls the unfortunate Wizard. If this test is passed, the Wizard can continue with their casting attempt as normal."
- **Chaos Giant** (PDF 109-110): equipo Giant's club (R Combat, S *, AP *, reglas * según Giant Attacks), calloused hide (light). Opciones: scaly skin (= heavy armour) +10; Regeneration (6+) +20. Reglas: **Close Order, *Giant Attacks, Immune to Psychology, Large Target, *Pick Up And…, Stomp Attacks (D6), Terror, Timmm-berrr!, Unbreakable**. Attacks "*" = no ataca normalmente con perfil fijo; usa Giant Attacks / Pick Up And… (o "attacking normally", sin valor A impreso → ver §14).
  - **Giant Attacks** (PDF 109): "Instead of attacking normally during the Combat phase or making a Pick Up And… attack, a Giant may choose to make a 'Giant Attack'." Nomina una unidad enemiga trabada y tira D6:
    - **1 'Eadbutt**: un modelo de la fila de combate de una unidad enemiga trabada; es impactado y sufre **D3+1 wounds** sin armadura ni Regeneration (Ward sí).
    - **2 Belly Flop**: plantilla pequeña (3") con el agujero sobre el centro de la unidad objetivo; todo modelo (amigo o enemigo, excepto el Giant) bajo la plantilla arriesga 1 impacto con la **S del Giant, AP -2**.
    - **3-4 Mighty Swing**: el Giant tiene Random Attacks con **A = D6+1**; club **S+1, AP -2**.
    - **5 Thump With Club**: un modelo de la fila de combate; club **S+4, AP -4, Multiple Wounds (D6)**.
    - **6 Jump Up & Down**: no usa el club; la unidad objetivo sufre **D6+1 impactos** con la S del Giant, **sin armadura** (Ward y Regeneration sí).
  - **Pick Up And…** (PDF 110): "Instead of attacking normally during the Combat phase or making a Giant Attack, a Giant that is engaged in combat with one or more units whose troop type is 'regular infantry' or 'heavy infantry' may choose to make a 'Pick Up And…' attack." Nomina una unidad de regular/heavy infantry trabada; la unidad hace **test de Initiative**: falla → 1 modelo retirado como baja; pasa → sin efecto. Luego D6: **1-3** el Giant olvida y no hace más ataques; **4+** nuevo test de Initiative. Continúa hasta olvidar o destruir la unidad. "Enemy models removed from play are considered to have been removed from the fighting rank of the enemy unit."
- **Ghorgon** (PDF 111): equipo cleaver-limbs, calloused hide (light). Sin opciones. Reglas: **Blood Greed, Close Order, Frenzy, Large Target, Primal Fury, Regeneration (6+), Stomp Attacks (D3), Stubborn, Swallow Whole, Terror, Timmm-berrr!**.
  - Cleaver-limbs: **Combat, S, AP -2, Killing Blow, Monster Slayer**.
  - **Swallow Whole**: "During the Command sub-phase of its turn, a Ghorgon that is engaged in combat with one or more units of 'regular infantry' or 'heavy infantry' may choose to make a 'Swallow Whole' attack." Nomina unidad enemiga regular/heavy infantry trabada; test de Initiative: falla → 1 modelo retirado como baja; pasa → sin efecto. "Each time an enemy model is removed from play in this way, the Ghorgon recovers a single lost Wound." (Un solo intento por fase de Mando; no hay repetición como en Pick Up And….)
  - Con Frenzy + Blood Greed: +2 A mientras Frenzied (A 7) y Pursuit con 1D6.

## 7. Unidades tomadas de la lista de Warriors of Chaos
La composición remite a "see Warriors of Chaos army list". Se usan las entradas impresas en WoC:

| Unidad (RH PDF) | Cat. Beastmen | Pts | Tam. | Base | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Chaos Ogre** (65) | Special | 33 | 3-15 | 40x40 | Monstrous inf | 6 | 3 | 2 | 4 | 4 | 3 | 2 | 3 | 7 | Hand weapons y heavy armour (5+) |
| Champion | | +6 | | | | 6 | 3 | 2 | 4 | 4 | 3 | 2 | 4 | 7 | |
| **Chaos Troll** (66) | Rare | 41 | 1-9 | 40x40 | Monstrous inf | 6 | 3 | 1 | 5 | 4 | 3 | 2 | 3 | 4 | Hand weapons, Troll vomit, calloused hides (light, 6+) |
| **Chaos Spawn** (67) | Rare | 50 | 1-4 | 50x50 | Monstrous inf | 2D6 | 3 | 0 | 4 | 5 | 3 | 3 | D6 | 10 | Flailing appendages (hand weapons), scaly skin (heavy, 5+) |

- **Chaos Ogres**: toda la unidad: additional hand weapons +3 / great weapons +4 (por modelo); puede cambiar Mark of Chaos Undivided por Mark of Khorne/Nurgle/Slaanesh/Tzeentch +3/modelo; champion +6, standard +6, musician +6. Reglas: Armour Bane (1), Close Order, Fear, Impact Hits (1), Mark of Chaos Undivided, **Ogre Charge** ("The Armour Piercing characteristic of any Impact Hits caused by a model with this special rule is improved by the current Rank Bonus of its unit."). No hay opción de magic standard ni objetos para el champion.
- **Chaos Trolls**: toda la unidad: additional hand weapons +3 / great weapons +4. Reglas: Armour Bane (1), Close Order, Fear, Flammable, Regeneration (5+), Stupidity. Troll vomit: Combat, S3, AP -2; "A Chaos Troll that is in base contact with an enemy model may make one additional attack each turn with this weapon. This attack must be made last, after all other attacks have been made (including Stomp Attacks), but hits automatically."
- **Chaos Spawn**: toda la unidad puede ser: Spawn of Khorne +3 (Killing Blow) / Spawn of Nurgle +2 (Poisoned Attacks) / Spawn of Slaanesh +3 (Strike First) / Spawn of Tzeentch +1 (Flaming Attacks y Magical Attacks) por modelo. Reglas: Armour Bane (2), Fear, Immune to Psychology, Open Order, Random Attacks, Random Movement, Stomp Attacks (1), Unbreakable.
- **Marcas (RH PDF 83 / imp. 82)**: Khorne = Frenzy; Nurgle = enemigos que atacan al modelo en combate repiten To Hit de 6 natural; Slaanesh = +1 I en la primera ronda de cada combate y, si mayoría, pasa automáticamente Panic; Tzeentch = Flaming Attacks y Magic Resistance (-1) (+1 a Casting de Wizard Tzeentch unido a unidad Tzeentch US≥10). Un modelo solo una Marca; toda la unidad la misma; personaje con Marca de dios concreto solo se une a unidades de la misma Marca, de Undivided o sin Marca; Undivided se une a cualquiera. (Que estas opciones de Marca se puedan comprar en un ejército Beastmen no se dice expresamente: ver §14.)

## 8. Reglas especiales del ejército: texto exacto (RH PDF 116-117 / imp. 115-116)

**Blood Greed**: "Whilst Frenzied, this model has a +2 modifier to its Attacks characteristic (rather than the usual +1). However, such is this model's desperate need to feed upon flesh that it rolls only a single D6 when making a Pursuit roll (rather than the usual 2D6)."
- *Juego:* la penalización de Pursuit solo aplica mientras esté Frenzied (la frase va ligada a "Whilst Frenzied"; ver §14). Tienen: Doombull/Gorebull, Minotaurs, Ghorgon.

**Blood Rage**: "If, when testing to see if it becomes subject to Primal Fury (see page 116), this unit passes its Leadership test with any roll of a natural double, it will also become Frenzied. A unit with this special rule may become Frenzied in this way even if it has lost Frenzy earlier in the game."
- *Juego:* en el test de Primal Fury (2D6 vs Ld), si se pasa con un doble natural → además gana Frenzy (sin duración especificada: se mantiene hasta perderla por perder una ronda de combate, CR Frenzy). Tienen: Beastlord/Wargor, Doombull/Gorebull, Bestigor, Gor, Minotaurs.

**Bull-gors**: "Impact Hits caused by a model with this special rule have an Armour Piercing characteristic of -1."

**Drunken**: "During the Start of Turn sub-phase of each of your turns, roll on the Drunken table for each unit with this special rule that is not currently Frenzied, that is not engaged in combat and that is not fleeing:"
| D6 | Resultado |
|---|---|
| 1 | **Unsteady**: hasta su próximo Start of Turn, la unidad está sujeta a **Random Movement** y su **Movement pasa a ser D6+2**. |
| 2-5 | **Sobering Up**: sin efecto. |
| 6 | **Belligerent Drunks**: hasta su próximo Start of Turn, la unidad está sujeta a **Frenzy**. Puede quedar Frenzied así aunque haya perdido Frenzy antes. |
(Tienen: Warhoof y Centigors.)

**Ensorcelled Weapons**: "A hand weapon carried by a model with this special rule has the Magical Attacks special rule and an Armour Piercing characteristic of -1. Note that this special rule only applies to a single, non-magical hand weapon and does not apply to a model's mount (should it have one). If the model is using two hand weapons or any other sort of weapon, this special rule ceases to apply." (Dragon Ogres, Shaggoth.)

**Foe Render**: "Whilst subject to Primal Fury, a hand weapon carried by a model with this special rule has an Armour Piercing characteristic of -2. Note that this special rule only applies to a single, non-magical hand weapon and does not apply to a model's mount (should it have one). If the model is using two hand weapons or any other sort of weapon, this special rule ceases to apply." (Beastlord/Wargor, Doombull/Gorebull, Minotaurs, Razorgor Herds, Razorgor del Razorgor Chariot.)
- Nota: Razorgor Herds tienen Foe Render y Primal Fury; Razorgor del carro tiene Foe Render (solo Razorgor) y el carro tiene Primal Fury.

**Gaze of the Gods**: "During the Command sub-phase of their turn, a character with this special rule may choose to roll on the Gaze of the Gods table:"
| D6 | Resultado |
|---|---|
| 1 | **Damned by Chaos**: el modelo queda sujeto a **Stupidity** el resto de la partida. Si ya la tenía, **-1 Ld** (mín 2). |
| 2 | **Unnatural Quickness**: hasta tu próximo Start of Turn, **+1 I** (máx 10). |
| 3 | **Iron Skin**: hasta tu próximo Start of Turn, **+1 T** (máx 10). |
| 4 | **Murderous Mutation**: el resto de la partida, **+1 WS** (máx 10). |
| 5 | **Dark Fury**: el resto de la partida, **+1 A** (máx 10). |
| 6 | **Apotheosis**: el resto de la partida, **+1 S y +1 Ld** (máx 10). |
"Note that any benefits granted by the Gaze of the Gods apply only to the Champion, not to their mount (should they have one)." Opcional; sin límite de veces impreso (se puede tirar cada fase de Mando; los efectos permanentes se acumulan, ver §14). Tienen: todos los personajes.

**Mark of Chaos Undivided**: "Models with the Mark of Chaos Undivided can re-roll any failed Fear, Panic or Terror test."

**Primal Fury**: "When this unit's combat is chosen during Step 1.1 of any Choose & Fight Combat sub-phase, it must make a Leadership test. If this test is passed, the unit becomes subject to 'Primal Fury' until the end of this Combat phase. A unit subject to Primal Fury may re-roll any rolls To Hit of a natural 1."
- *Juego:* test obligatorio cada vez que se elige su combate; dura hasta fin de esa fase de Combate. Modificadores: Banner of Outrage (repetir el test), Horn of the First Beast (usar Ld del portador a 18"), Rune of the Beast Ascendant (+1 Ld a Bestigor/Gor/Ungor). Warband aplica su modificador de Ld (CR) también aquí (test de Ld normal).

**Razor Tusks**: "During a turn in which it charged, the Armour Piercing characteristic of a Tuskgor's or Razorgor's tusks (hand weapon) is improved by 1. Note that this special rule only applies to attacks made by a Tuskgor or Razorgor, not to a chariot or its crew."

**The Quickening Storm**: "A model with this special rule has a 5+ Ward save against any wounds suffered that were caused by a Magic Missile or a Magical Vortex spell. In addition, if a model with this special rule, or the unit it belongs to, suffers one or more hits from Storm Call (see page 104), it becomes 'Quickened'. A Quickened model has a +1 modifier to both its Initiative and Attacks characteristics. This Quickening lasts until your next Start of Turn sub-phase."
- *Juego:* aunque Storm Call es Magic Missile, el texto no exime al Shaggoth/Dragon Ogres de sufrir sus impactos; la Ward 5+ aplica a las heridas que cause (es un Magic Missile).

## 9. Reglas de unidad propias (resumen de §2-§6)
Brayhorn, Braystaff, Slaughterer's Call (§2); Bestial Charge (§4); Storm Call, Maddening Aura, Spurting Bile Blood, Stony Stare, Ghostsight, Soul-eater, Giant Attacks, Pick Up And…, Swallow Whole (§6); Ogre Charge, Troll vomit (§7, WoC).

## 10. Chaos Mutations (RH PDF 112 / imp. 111)
"Each Mutation may only be chosen once per army." Pueden comprarlas: Beastlord/Wargor, Shamans, Doombull/Gorebull, Warhoof, Shaggoth (hasta 50); Gouge-horn, Bloodkine, Shartak (hasta 25).

| Mutación | Pts | Restricción | Efecto |
|---|---|---|---|
| Slug-skin | 50 | — | Todo modelo enemigo que dirija ataques contra este modelo o la unidad a la que se ha unido en la fase de Combate sufre **-1 To Hit**. |
| Crown of Horns | 45 | Characters only | El personaje y la unidad a la que se una ganan **Stubborn**. |
| Muscular Monstrosity | 35 | — | **+1 S** (no la montura). |
| Pelt of Midnight | 35 | Characters only | Todo modelo enemigo que dispare a este personaje o a la unidad a la que se ha unido sufre **-1 To Hit adicional**. |
| Gouge-tusks | 30 | — | En la fase de Combate, el AP de cualquier arma usada por el modelo (no la montura) **mejora en 1**. |
| Rune of the Beast Ascendant | 25 | Beastman Chieftains only | Salvo que huya, Bestigor, Gor y Ungor Herds amigas en su Command range ganan **+1 Ld** (máx 10). |
| Many-limbed Fiend | 20 | — | **+1 A** (no la montura); ese ataque extra debe hacerse con un hand weapon ordinario. |
| Gnarled Hide | 15 | Models whose troop type is 'infantry' only | Gana **Armoured Hide (1)**. |
| Uncanny Senses | 10 | — | **+1 I** (no la montura). |

(9 mutaciones impresas.)

## 11. Magia
- **Lores de los Bray-Shamans**: Daemonology (CR imp. 322-323, firma **The Summoning**), Dark Magic (CR imp. 324-325, firma **Doombolt**), Elementalism (CR imp. 326-327, firma **Storm Call**). No transcritos aquí.
- **Lore of Beasts** (RH PDF 118 / imp. 117): "A Wizard with the 'Lore of Beasts' special rule may discard one of their randomly generated spells as normal. When they do so, they may select instead either the signature spell of their chosen Lore of Magic, or one of the spells listed below."

| Hechizo | Tipo | CV | Alcance | Efecto |
|---|---|---|---|---|
| **Viletide** | Magic Missile | 8+ | 15" | La unidad enemiga objetivo sufre **5D6 impactos de S1**, sin armadura (Ward y Regeneration sí). |
| **Devolve** | Magic Missile | 8+ | 15" | La unidad enemiga objetivo hace inmediatamente un **test de Ld**; si falla, **pierde tantas Wounds como la cantidad por la que falló** el test. |
| **Mantle of Ghorok** | Enchantment | 8+ | Self | Hasta fin de este turno, el lanzador gana **+D6 a S y A** (máx 10). **Si sale 6**, pierde el modificador y en su lugar **pierde 1 Wound**. |

- Bound spell **Storm Call** del Shaggoth: ver §6.

## 12. Objetos mágicos propios (RH PDF 113-115 / imp. 112-114)
Se compran como los objetos comunes (CR). (*) = extremely common.

**Magic Weapons**
| Objeto | Pts | Perfil | Efecto |
|---|---|---|---|
| Primeval Club | 60 | Combat, S *, AP -3; Hatred (Empire), Magical Attacks, Poisoned Attacks | **S = Leadership actual** del portador. |
| Axe of Men | 50 | Combat, S, AP -1; Killing Blow, Magical Attacks | Si el portador mata a un personaje enemigo (incluidos campeones) en un desafío, gana **Terror** el resto de la partida. |
| Mangelder | 40 | Combat, S+1, AP -1; Magical Attacks, Terror | El portador causa **Terror**. Toda unidad enemiga que sufra ≥1 herida no salvada del Mangelder sufre **-1 Ld** (mín 2) hasta fin de turno. |
| Hunter's Spear | 35 | **24", S6, AP -3**; Cumbersome, Magical Attacks, Multiple Wounds (2), Through & Through | Dispara como un bolt thrower usando Through & Through (CR imp. 223: 1 impacto por fila o por columna según arco, -1 S por cada impacto tras el primero). |

**Magic Armour**
| Objeto | Pts | Efecto |
|---|---|---|
| Pelt of the Dark Young | 40 | Se puede llevar con otra armadura. **Mejora el AV en 1** (máx 2+). El portador (y la unidad a la que se una) tiene **Magic Resistance (-2)**. |
| The Blackened Plate | 25 | Es una **full plate armour**. Además, **Ward 3+** contra heridas causadas por ataques con **Flaming Attacks**. |

**Talismans**
| Objeto | Pts | Efecto |
|---|---|---|
| Rune of the True Beast | 30 | Modelos enemigos de tipo 'monster' a 6" del portador sufren **-1 WS**. |
| Dark Heart* | 25 | **Single use**. En la fase de Mando de su turno, el portador lo consume y **recupera 1 Wound** perdida. |

**Magic Standards**
| Objeto | Pts | Efecto |
|---|---|---|
| Totem of Rust | 50 | Todo modelo (amigo o enemigo) a 6" del portador sufre **-1 a sus tiradas de Armour Save**. |
| Manbane Standard | 40 | Todas las unidades enemigas a 6" del portador sufren **-1 Ld** (mín 2). |
| Vitriolic Totem | 30 | La unidad portadora gana **Poisoned Attacks**. |
| Banner of Outrage | 25 | La unidad portadora puede **repetir su test de Ld de Primal Fury**. |

**Enchanted Items**
| Objeto | Pts | Efecto |
|---|---|---|
| Stone of Spite | 45 | **Single use**. Fase de Mando de su turno, si no está en combate. Hasta tu próximo Start of Turn, **todos los Wizards (amigos o enemigos) -2 a sus Casting rolls**. |
| Horn of the First Beast | 30 | Salvo que el portador huya, cualquier unidad amiga a **18"** puede usar **la Ld del portador** al testear Primal Fury. |
| Skin of Man | 15 | Solo Beastmen Chieftains y Beastmen Shamans de tipo 'infantry'. El portador gana **Scouts y Vanguard**. |

**Arcane Items**
| Objeto | Pts | Efecto |
|---|---|---|
| The Plague Chalice | 40 | Si el portador saca **cualquier doble natural** en un Casting roll (excepto doble 1), el hechizo se lanza como **perfect invocation** sin importar CV ni modificadores. Cada vez que lanza una perfect invocation sufre **1 impacto S4** sin armadura (Ward y Regeneration sí). |
| Hagtree Fetish | 30 | Cuando el portador lanza con éxito un **Magic Missile**, puede **repetir tiradas To Wound fallidas**. |
| Jagged Dagger | 15 | Solo un Wizard **unido a una unidad**. Antes de un Casting roll puede sacrificar **1 modelo de su unidad** (retirado como baja) y **sumar la W de ese modelo** al resultado. Es modificador al resultado: no anula un doble 1 natural. |

(18 objetos; solo Dark Heart es extremely common.)

## 13. Reglas núcleo clave (CR, para el motor)
- **Ambushers** (CR imp. 166): puede quedar en reserva. Desde la ronda 2, en cada Start of Turn propio, D6 por unidad en reserva: 1-3 retrasada; 4+ llega como refuerzo en Compulsory Moves, por cualquier borde elegido, no a 8" de enemigos. Las que sigan en reserva al inicio de la ronda 5 llegan automáticamente.
- **Chariot Runners** (CR imp. 167): carros amigos trazan línea de visión sobre/a través de ellos y pueden atravesarlos si están en Skirmish (se apartan lo mínimo); en Skirmish, carros amigos a 1" cuentan como parte de la unidad para coherencia.
- **First Charge** (CR imp. 169): si la primera carga de la partida de la unidad tiene éxito, el objetivo queda **Disrupted** hasta el final de esa fase de Combate.
- **Frenzy** (CR imp. 171-172): +1 A (no a montura / bestias de tiro / jinete de monstruo); si mayoría Frenzied pasa automáticamente Fear, Panic y Terror; si puede declarar carga, debe; si mayoría, no puede Flee como reacción ni hacer Restraint test. Se pierde al perder una ronda de combate.
- **Fly (X)** (CR imp. 170): mover volando X" pasando sobre modelos/terreno; puede marchar a 8" de enemigos sin test; empieza y termina en el suelo; personaje con Fly no se une a unidad sin Fly y viceversa.
- **Loner**: personaje con Loner no puede ser General ni unirse a unidad sin Loner; unidad con Loner no puede ser unida por personaje sin Loner.
- **Motley Crew**: permite equipos distintos por modelo (Minotaurs); en combate AV de la mayoría de la fila de combate; contra disparos, mayoría de la unidad; bajas repartidas.
- **Move through Cover**: sin modificadores de movimiento por terreno difícil/peligroso; repite 1s en Dangerous Terrain tests.
- **Scouts** (CR imp. 177): despliegue tras todas las unidades, a más de 12" de enemigos; si se despliegan así, no pueden declarar carga en su primer turno.
- **Vanguard**: tras el despliegue, movimiento Vanguard (mov. básico, sin marchar); alternan con roll-off.
- **Stubborn**: la primera vez que deba hacer Break test puede elegir no hacerlo y Fall Back in Good Order. Personaje Stubborn no lo usa en unidad no Stubborn; la unidad no lo gana por el personaje (salvo Crown of Horns, que lo concede expresamente).
- **Veteran**: si la mayoría lo tiene, repite cualquier test de Ld fallido (Break test no es test de Ld).
- **Warband** (CR): salvo huyendo, +Rank Bonus actual a Ld (máx 10), no en Restraint; si mayoría, repite Charge roll. Personaje sin Warband no se beneficia.
- **Horde** (CR imp. 172): +1 al Rank Bonus máximo.
- **Impact Hits (X)** (CR imp. 172): solo modelo que carga ≥3" y en contacto; I10, impactan automáticamente con S sin modificar. **Stomp Attacks (X)** (CR imp. 177): en contacto, I1, automáticos, S sin modificar.
- **Killing Blow / Monster Slayer** (CR imp. 172/173): 6 natural To Wound en combate; infantry/cavalry (KB) o monster (MS) sin armadura ni Regeneration; si no se salva, pierde todas las Wounds. No usable si hiere automáticamente.
- **Quick Shot**: sin -1 por mover y disparar; Stand & Shoot a cualquier distancia. **Move & Shoot**: dispara aunque haya marchado. **Breath Weapon**: una vez por ronda, plantilla de llama, no en Stand & Shoot ni en combate.
- **Terror/Fear, Immune to Psychology, Large Target, Timmm-berrr!, Unbreakable, Random Movement, Random Attacks, Regeneration, Poisoned Attacks, Swiftstride, Fast Cavalry, Skirmishers, Open/Close Order, Armour Bane, Magic Resistance, Multiple Wounds**: CR imp. 166-181 (no transcritas).
- **Armas CR** usadas: great weapon (S+2, AP-2, Armour Bane (1), Requires Two Hands, Strike Last); additional hand weapon (Extra Attacks (+1), Requires Two Hands); halberd (S+1, AP-1, Armour Bane (1), Requires Two Hands); cavalry spear (S+1, AP-1 solo al cargar, Fight in Extra Rank; cavalry/monster/chariot); thrusting spear (Fight in Extra Rank, solo infantry, +1 I contra carga frontal); throwing spear (Combat, S, Fight in Extra Rank, solo en turno de carga); javelin (12", S, Move & Shoot, Quick Shot); throwing axe (9", S+1, Quick Shot); shortbow (18", S3, Quick Shot, Volley Fire).

## 14. NO ESTÁ EN LAS FUENTES / ambigüedades
- **NO ESTÁN**: Armies of Infamy de Beastmen (*Minotaur Blood Herd*, *Wild Herd*, solo citadas por nombre en el Matched Play Guide), personajes nombrados (p. ej. Bray-Shaman Kralmaw, solo citado por nombre), Arcane Journal de Beastmen (no adjunto), mercenarios específicos de Beastmen. No hay Ungor Raiders como unidad separada (son Ungor Herd con shortbows) ni monturas de personaje distintas de los dos carros.
- **Límite 0-1 por 1.000 de personajes**: "0-1 per 1,000 points may: Ambushers +10 / Or: Tuskgor Chariot / Razorgor Chariot". Se interpreta que el 0-1/1.000 cubre las tres alternativas (contador común para Chieftains y Shamans no aclarado: ¿por entrada o global?). Sugerencia: contador por entrada de unidad (Chieftains por un lado, Shamans por otro).
- **Bestigor 0-1 unidad Stubborn/Veteran**: impreso bajo "0-1 unit in your army may:" como dos líneas sin "one of the following": no queda claro si pueden ser ambas. (Orcs: idem.)
- **Chaos Giant A "*"**: sin valor de Attacks impreso; "attacking normally" no tiene perfil definido. Implementar solo Giant Attacks / Pick Up And… (y Stomp Attacks D6).
- **Blood Greed**: la penalización de Pursuit (1D6) se lee ligada a "Whilst Frenzied"; no está explícito.
- **Gaze of the Gods**: sin límite de usos impreso; los efectos "for the remainder of the game" pueden acumularse (máx 10). Nada impide tirar cada turno.
- **Storm Call** (Shaggoth): Tipo Magic Missile con Range Self, impreso así. Afecta también a la propia unidad/modelo.
- **Cygor hurl attack**: no lista Move or Shoot (el stone thrower CR sí); usa Bombardment con plantilla 3". Cómo interactúa BS 1 con Bombardment: según la regla Bombardment del CR (imp. 224), no transcrita.
- **Cockatrice petrifying gaze**: no indica Quick Shot ni Move & Shoot; un único disparo (sin Multiple Shots).
- **Dragon Ogres**: sin standard ni musician en las opciones; Shartak "Chaos Mutations up to 25" sin referencia de página.
- **Minotaur Herd**: opciones de arma "Any model in the unit" (Motley Crew) → armas por modelo.
- **Unidades WoC (Chaos Ogres/Trolls/Spawn)**: la lista Beastmen solo dice "see Warriors of Chaos army list"; no aclara si pueden comprar las Marcas de dioses (Ogres) o tipos de Spawn. Por defecto del texto impreso de la entrada, sí.
- **Warband (CR)**: el texto CR no incluye pérdida de heridas extra (eso es Unstable); el resumen en spec_orcs.md §8 parece mezclar ambas reglas.
- **Harpies**: sin Mark of Chaos Undivided ni Primal Fury (no son Beastmen); Chaos Warhounds tampoco.
- **Hunter's Spear**: no indica "Move or Shoot"; dispara como bolt thrower solo en cuanto a Through & Through.
- **AV de Warhoof y Centigors**: perfil único de caballería ligera, sin barding; AV derivado del equipo (escudo/armadura).
