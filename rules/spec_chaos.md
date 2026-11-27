# Spec Warriors of Chaos (Warhammer: The Old World)

**Fuentes y convención de citas**
- **RH** = Ravening Hordes. Cito *página PDF* y entre paréntesis la *impresa* (= PDF-1). Sección Warriors of Chaos: PDF 54-84 (imp. 53-83). Texto de trabajo: rh.txt líneas ~2148-3660.
- Las referencias internas del libro ("See page 59", "see page 77", "See page 71"...) usan numeración **impresa** (p.ej. Gifts of Chaos "page 77" = PDF 78).
- **CR** = Core Rulebook (core.txt). Daemonology y Dark Magic: CR imp. 322-325 (según índice).
- Unidades de la lista que remiten al ejército **Beastmen Brayherds** (Dragon Ogres, Dragon Ogre Shaggoth, Chaos Giant): RH PDF 102, 105, 109-110, 117.
- Tablas verificadas visualmente (pdftoppm) cuando el texto extraído era ambiguo: Daemonic Mount (PDF 60), Manticore (PDF 74), Chaos Dragon (PDF 75), Hellcannon (PDF 77). Resto de perfiles: extracción `pdftotext -layout` con columnas limpias.
- Todo es "tal cual impreso". Lo que no aparece se indica como **NO ESTÁ EN LAS FUENTES**.

## 0. Avisos críticos
1. **No hay Armies of Infamy de Warriors of Chaos en RH.** La lista de Aliados menciona "Any Warriors of Chaos Army of Infamy composition list", pero ninguna está impresa en el libro (solo existe la Grand Army). Ver §12.
2. **Marcas de Chaos**: casi todo modelo trae de serie **Mark of Chaos Undivided** y puede *sustituirla* por Khorne/Nurgle/Slaanesh/Tzeentch con coste. **Sorcerers NO pueden tener Mark of Khorne** (no aparece en su lista). **Daemon Prince con Mark of Khorne no puede ser Wizard.** Unidades **sin** marca alguna (no tienen Mark of Chaos Undivided en sus reglas): Forsaken, Chaos Trolls, Chaos Spawn, Chaos Warhounds (el Handler sí tiene Undivided), Chimera, Hellcannon, y las monturas Chaos Steed/Manticore/Chaos Dragon (la Daemonic Mount tiene "Mark of Chaos (as rider)").
3. **Wizards con armadura**: Chaos Armour (X+) permite a un Wizard llevar armadura sin penalización (RH PDF 82). Sorcerer Lord (heavy armour), Exalted Sorcerer (light armour) y Daemon Prince (light/heavy) la llevan de serie.
4. Nombres: los "campeones" de unidad son "Champion" salvo Marauders (**Marauder Chieftain**), Marauder Horsemen (**Marauder Horsemaster**) y Dragon Ogres (**Shartak**). Los personajes se agrupan en el libro como **Champions of Chaos** (Chaos Lord, Exalted Champion, Aspiring Champion) y **Sorcerers of Chaos** (Sorcerer Lord, Exalted Sorcerer).
5. Convenciones: "Unit Size 5+" = mínimo 5, sin máximo. "0-X per 1,000 points" = por cada 1.000 pts completos (CR). Cuando una montura tiene perfil dividido, la tirada de armadura usa el AV del jinete (CR).
6. Armadura (CR): light 6+, heavy 5+, full plate 4+, escudo +1, barding +1, mejor AV posible 2+, sin armadura 7+. **Chaos Armour (X+) es un Ward save (X+)**, no armadura. Los AV derivados (marcados "deriv.") se calculan con CR, no están impresos.
7. Tabla de puntos: coste por modelo; "+X" = suplemento.

## 1. Composición del ejército (RH PDF 56 / imp. 55)

**Grand Army Composition List**
| Categoría | % | Unidades / límites |
|---|---|---|
| Characters | hasta 50% | **0-1 Chaos Lord o Daemon Prince** (total, no por 1.000); **0-1 Exalted Champion o Sorcerer Lord por 1.000 pts**; Aspiring Champions y Exalted Sorcerers (sin límite) |
| Core | **al menos 25%** | Chaos Warriors, Chaos Marauders, Forsaken, Chaos Knights, Marauder Horsemen y Chaos Warhounds |
| Special | hasta 50% | **0-1 unidad de Chosen Chaos Warriors**; **0-1 unidad de Chosen Chaos Knights**; Chaos Ogres, Chaos Trolls, Chaos Spawn, Chaos Chariots y Chimeras; Dragon Ogres (ver lista Beastmen Brayherds) |
| Rare | hasta 25% | Gorebeast Chariots; **0-1 Hellcannon por 1.000 pts**; **0-1 Dragon Ogre Shaggoth por unidad de Dragon Ogres** (ver lista Beastmen); **0-1 Chaos Giant por 1.000 pts** (ver lista Beastmen) |
| Mercenaries | hasta 20% | "Up to 20% of your army's points value may be spent on mercenaries." (no se enumeran unidades) |
| Allies | hasta 25%, un solo contingente | Cualquier Warriors of Chaos Army of Infamy (ninguna en RH); o una Grand Army de: Orc & Goblin Tribes (**Uneasy**), Beastmen Brayherds (**sin calificativo impreso**), Tomb Kings of Khemri (**Suspicious**) |

- **Battle Standard Bearer**: "A single Exalted Champion or Aspiring Champion in your army may be upgraded to be your Battle Standard Bearer for +25 points. In addition to their usual allowance of points to spend on magic items, a Battle Standard Bearer can purchase a single magic standard with no points limit." (Chaos Lord, Daemon Prince y Sorcerers NO pueden ser BSB.)
- Chaos Chariot, Gorebeast Chariot, Manticore y Chaos Dragon pueden ir como montura de personaje (sus puntos se suman al jinete). Manticore y Chaos Dragon **solo** como montura (no como unidad independiente).
- Gifts of Chaos: "Each Gift may only be chosen once per army." (RH PDF 78).

## 2. Personajes (RH PDF 57-59 / imp. 56-58)
Perfil: M WS BS S T W I A Ld, puntos. Tamaño de unidad: 1.

| Unidad (RH pág PDF) | M | WS | BS | S | T | W | I | A | Ld | Pts | Tipo / Base | Equipo | AV (Ward) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chaos Lord (57) | 4 | 7 | 3 | 5 | 5 | 4 | 6 | 5 | 9 | 195 | Heavy inf (char) 30x30 | Hand weapon, full plate armour | 4+ (Ward 5+) |
| Exalted Champion (57) | 4 | 6 | 3 | 5 | 4 | 3 | 5 | 4 | 8 | 125 | idem | Hand weapon, heavy armour | 5+ (Ward 5+) |
| Aspiring Champion (57) | 4 | 5 | 3 | 4 | 4 | 2 | 4 | 3 | 8 | 70 | idem | Hand weapon, heavy armour | 5+ (Ward 5+) |
| Daemon Prince (58) | 6 | 7 | 5 | 6 | 5 | 4 | 7 | 5 | 9 | 215 | Monstrous inf (char) 50x50 | Hand weapon, light armour | 6+ (Ward 4+) |
| Sorcerer Lord (N3) (59) | 4 | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 8 | 195 | Heavy inf (char) 30x30 | Hand weapon, heavy armour | 5+ (Ward 5+) |
| Exalted Sorcerer (N1) (59) | 4 | 4 | 3 | 4 | 4 | 2 | 3 | 2 | 8 | 90 | idem | Hand weapon, light armour | 6+ (Ward 5+) |

**Opciones y reglas especiales**
- **Champions of Chaos** (Chaos Lord / Exalted Champion / Aspiring Champion) (PDF 57):
  - Una de: Additional hand weapon +3 / Flail +3 / Great weapon +4 / Halberd +3 / Lance (si va montado apropiadamente) +4.
  - Shield +2.
  - Montura: ver §3 ("See page 59" = PDF 60).
  - Sustituir Mark of Chaos Undivided por Mark of Khorne / Nurgle / Slaanesh / Tzeentch: +10 cada una.
  - Gifts of Chaos hasta 50 pts (§9).
  - Objetos mágicos: Chaos Lord 100, Exalted Champion 75, Aspiring Champion 50.
  - BSB: solo Exalted o Aspiring Champion, +25 (§1).
  - Reglas: **Chaos Armour (5+), Ensorcelled Weapons, Gaze of the Gods, Mark of Chaos Undivided, Rallying Cry**.
- **Daemon Prince** (PDF 58):
  - Sustituir light armour por heavy armour +6.
  - Fly (9) +30.
  - Marcas Khorne/Nurgle/Slaanesh/Tzeentch +10 cada una.
  - "Unless it has the Mark of Khorne, a Daemon Prince may be a Wizard": Level 1 +25, Level 2 +50, Level 3 +75, Level 4 +100. Lores: **Battle Magic, Daemonology, Dark Magic**.
  - Gifts of Chaos hasta 50; objetos mágicos hasta 100.
  - **No tiene opción de montura** (no figura "May be mounted").
  - Reglas: **Chaos Armour (4+), Ensorcelled Weapons, Fear, Gaze of the Gods, Immune to Psychology, Lore of Chaos, Mark of Chaos Undivided, Regeneration (5+), Unbreakable, Unstable, Warp-spawned**. (No tiene Rallying Cry.)
- **Sorcerers of Chaos** (Sorcerer Lord / Exalted Sorcerer) (PDF 59):
  - Magia: "A Sorcerer Lord is a Level 3 Wizard. An Exalted Sorcerer is a Level 1 Wizard." Lores: **Battle Magic, Daemonology, Dark Magic**.
  - Montura: ver §3.
  - Marcas: **solo** Nurgle / Slaanesh / Tzeentch, +10 cada una (no Khorne).
  - Gifts of Chaos hasta 50.
  - Sorcerer Lord: Level 4 +30; objetos hasta 100. Exalted Sorcerer: Level 2 +30; objetos hasta 50.
  - **No tienen opciones de arma ni escudo.**
  - Reglas: **Chaos Armour (5+), Ensorcelled Weapons, Gaze of the Gods, Lore of Chaos, Mark of Chaos Undivided**. (No tienen Rallying Cry.)
- Nota: Daemon Prince tiene Unbreakable y Warp-spawned: según CR no puede unirse a unidades que no sean Unbreakable/Warp-spawned (en este ejército ninguna unidad tiene ambas; el Hellcannon es Unbreakable+Warp-spawned pero es Behemoth de 1 modelo). Interpretación derivada de CR.

## 3. Monturas de personaje (RH PDF 60 / imp. 59; 72-75)

**Quién puede montar qué** (PDF 60):
- Chaos Lord, Exalted Champion o Aspiring Champion: Chaos Steed +16; Daemonic Mount +35 (**solo Chaos Lords y Exalted Champions**); Chaos Chariot (ver PDF 72); Gorebeast Chariot (ver PDF 73); Manticore (**solo Chaos Lords**, PDF 74); Chaos Dragon (**solo Chaos Lords**, PDF 75).
- Sorcerer Lord o Exalted Sorcerer: Chaos Steed +16; Daemonic Mount +35; Chaos Chariot; Manticore (**solo Sorcerer Lords**); Chaos Dragon (**solo Sorcerer Lords**). **Sorcerers NO pueden ir en Gorebeast Chariot.**
- Daemon Prince: sin montura.

| Montura | Pts | M | WS | BS | S | T | W | I | A | Ld | Tipo / Base | Equipo | Reglas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chaos Steed (60) | +16 | 7 | 3 | - | 4 | - | - | 3 | 1 | - | Heavy cavalry, 30x60 | Iron-shod hooves (hand weapon) y barding | First Charge, Swiftstride |
| Daemonic Mount (60) | +35 | 8 | 4 | - | 5 | - | (+1) | 3 | 2 | - | Monstrous cavalry, 40x60 (min) / 50x75 (max) | Daemonic hooves (hand weapon) | Armour Bane (1, Daemonic Mount only), Fear, Magical Attacks, Mark of Chaos (as rider), Stomp Attacks (1), Swiftstride |
| Manticore (74) | +120 | 6 | 5 | - | 5 | - | (+4) | 5 | 4 | - | Monstrous creature, 60x100 | Wicked claws; scaly skin (heavy armour) | Close Order, Fly (9), Large Target, Stomp Attacks (D3), Swiftstride, Terror, Wilful Beast |
| Chaos Dragon (75) | +285 | 6 | 6 | - | 7 | (+1) | (+6) | 4 | 6 | - | Behemoth, 60x100 | Wicked claws, Dark Fire of Chaos, Fumes of Contagion; draconic scales (full plate) | Close Order, Fly (10), Large Target, Stomp Attacks (D6), Swiftstride, Terror, Two-headed Dragon |
| Chaos Chariot | ver §5 (110) | | | | | | | | | | | | puntos se suman al jinete |
| Gorebeast Chariot | ver §5 (135) | | | | | | | | | | | | idem |

- Notas impresas: Daemonic Mount "A character mounted on a Daemonic Mount has +1 Wound." Manticore "+4 Wounds." Chaos Dragon "+1 Toughness and +6 Wounds."
- Daemonic Mount: no tiene barding impreso; el jinete solo usa su propia armadura (+ la Daemonic Mount no da +1). Chaos Steed con barding: jinete heavy armour 5+ → 4+ (deriv.); Chaos Lord full plate 4+ → 3+ (deriv.); con escudo, otro +1 (deriv.).
- **Manticore** opción: **venomous tail +15**.
  - Wicked claws: Combat, S, AP -2.
  - Venomous tail: Combat, S, AP -, Poisoned Attacks, Strike First. "In combat, this model must make one of its attacks each turn with this weapon."
  - **Wilful Beast**: "During the Start of Turn sub-phase of each of their turns, this model must make a Leadership test (using its own unmodified Leadership). If this test is passed, the rider is able to keep control of their mount. If, however, this test is failed, the rider has lost control and their mount becomes subject to the Frenzy special rule until their next Start of Turn sub-phase. Note that this model's rider does not gain a +1 modifier to their Attacks characteristic." (Ojo: la Manticore tiene Ld "-"; "its own unmodified Leadership" → **ambiguo**: en perfil dividido el modelo usa el Ld del jinete (CR); interpretar como Ld sin modificar del jinete.)
  - "Character Mount: A Manticore may only be included in your army as a character's mount."
- **Chaos Dragon**:
  - Wicked claws: Combat, S, AP -2.
  - Dark Fire of Chaos: R N/A, S4, AP -1, Breath Weapon, Flaming Attacks, Magical Attacks.
  - Fumes of Contagion: R N/A, S2, AP N/A, Breath Weapon, Magical Attacks. "No armour save is permitted against wounds caused by this weapon (Ward and Regeneration saves can be attempted as normal)."
  - **Two-headed Dragon**: "A Chaos Dragon may use either Dark Fire of Chaos or Fumes of Contagion during the Shooting phase of its turn. It cannot use both during the same turn."
  - Solo como montura de personaje.

## 4. Infantería (RH PDF 61-67 / imp. 60-66)

| Unidad (PDF) | Pts/modelo | Tam. | Base | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo base / AV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Chaos Warrior** (61) Core | 13 | 5+ | 30x30 | Heavy inf | 4 | 5 | 3 | 4 | 4 | 1 | 4 | 1 | 8 | Hand weapons, heavy armour (5+) |
| Champion | +6 | | | | 4 | 5 | 3 | 4 | 4 | 1 | 4 | 2 | 8 | |
| **Chosen Chaos Warrior** (62) Special 0-1 | 17 | 5+ | 30x30 | Heavy inf | 4 | 5 | 3 | 4 | 4 | 1 | 4 | 2 | 9 | Hand weapons, heavy armour (5+); Ward 6+ |
| Champion | +7 | | | | 4 | 5 | 3 | 4 | 4 | 1 | 4 | 3 | 9 | |
| **Chaos Marauder** (63) Core | 6 | 5+ | 25x25 | Regular inf | 4 | 4 | 3 | 3 | 3 | 1 | 3 | 1 | 6 | Hand weapons (sin armadura, 7+) |
| Marauder Chieftain | +7 | | | | 4 | 4 | 3 | 3 | 3 | 1 | 3 | 2 | 7 | |
| **Forsaken** (64) Core | 19 | 5+ | 30x30 | Heavy inf | 5 | 4 | 0 | 4 | 4 | 1 | 3 | D3 | 8 | Mutated weapons (hand weapons), heavy armour (5+); Ward 5+ |
| **Chaos Ogre** (65) Special | 33 | 3-15 | 40x40 | Monstrous inf | 6 | 3 | 2 | 4 | 4 | 3 | 2 | 3 | 7 | Hand weapons, heavy armour (5+) |
| Champion | +6 | | | | 6 | 3 | 2 | 4 | 4 | 3 | 2 | 4 | 7 | |
| **Chaos Troll** (66) Special | 41 | 1-9 | 40x40 | Monstrous inf | 6 | 3 | 1 | 5 | 4 | 3 | 2 | 3 | 4 | Hand weapons, Troll vomit, calloused hides (light armour, 6+) |
| **Chaos Spawn** (67) Special | 50 | 1-4 | 50x50 | Monstrous inf | 2D6 | 3 | 0 | 4 | 5 | 3 | 3 | D6 | 10 | Flailing appendages (hand weapons), scaly skin (heavy armour, 5+) |

Forsaken y Chaos Spawn: sin campeón, estandarte ni músico (no figuran opciones de mando). Chaos Trolls: idem.

**Opciones por unidad**
- **Chaos Warriors** (61): toda la unidad una de: additional hand weapons +1/modelo / great weapons +2/modelo / halberds +1/modelo; shields +1/modelo; sustituir Undivided por Khorne/Nurgle/Slaanesh/Tzeentch +2/modelo; Champion +6, standard bearer +6, musician +6 (por unidad); magic standard hasta 50; Champion objetos hasta 25. Reglas: **Close Order, Ensorcelled Weapons, Mark of Chaos Undivided**.
- **Chosen Chaos Warriors** (62): mismas armas (+1/+2/+1) y escudos (+1); marcas +2/modelo; Champion +7, standard +7, musician +7; **magic standard hasta 100**; **sustituir heavy armour por full plate +2/modelo**; **Drilled +1/modelo**; Champion objetos 25. Reglas: **Chaos Armour (6+), Close Order, Ensorcelled Weapons, Mark of Chaos Undivided, Stubborn**.
- **Chaos Marauders** (63): toda la unidad una de: great weapons +2/modelo / flails +1/modelo; cualquiera de: light armour +1/modelo, shields +1/modelo; marcas **+1/modelo**; Marauder Chieftain +7, standard +5, musician +5; **0-1 unidad del ejército**: sustituir Close Order por Skirmishers (gratis) **o** por Open Order (gratis). **No hay opción de magic standard ni objetos para el Chieftain.** Reglas: **Close Order, Mark of Chaos Undivided, Shieldwall, Warband**.
- **Forsaken** (64): "The entire unit **must** be one of the following": Forsaken by Khorne → Hatred (all enemies); by Nurgle → Fear; by Slaanesh → Swiftstride; by Tzeentch → Magic Resistance (-3). (Sin coste; no son Marks of Chaos.) Reglas: **Chaos Armour (5+), Ensorcelled Weapons, Furious Charge, Immune to Psychology, Impetuous, Loner, Open Order, Rampant Mutation, Random Attacks, Stubborn**.
  - **Rampant Mutation**: "When this unit's combat is chosen during Step 1.1 of any Choose & Fight Combat sub-phase, roll on the table below to determine which mutation it is currently afflicted with:" D6: **1-2 Venomous Fangs**: hasta el final de esta fase de Combate, Poisoned Attacks. **3-4 Razor Talons**: hasta el final de esta fase de Combate, todos los ataques de la unidad AP -2. **5-6 Decapitating Claws**: hasta el final de esta fase de Combate, Killing Blow.
- **Chaos Ogres** (65): toda la unidad una de: additional hand weapons +3/modelo / great weapons +4/modelo; marcas +3/modelo; Champion +6, standard +6, musician +6. **Sin magic standard ni objetos.** Reglas: **Armour Bane (1), Close Order, Fear, Impact Hits (1), Mark of Chaos Undivided, Ogre Charge**.
  - **Ogre Charge**: "The Armour Piercing characteristic of any Impact Hits caused by a model with this special rule is improved by the current Rank Bonus of its unit."
- **Chaos Trolls** (66): toda la unidad una de: additional hand weapons +3/modelo / great weapons +4/modelo. Reglas: **Armour Bane (1), Close Order, Fear, Flammable, Regeneration (5+), Stupidity**.
  - **Troll vomit**: Combat, S3, AP -2. "A Chaos Troll that is in base contact with an enemy model may make one additional attack each turn with this weapon. This attack must be made last, after all other attacks have been made (including Stomp Attacks), but hits automatically."
- **Chaos Spawn** (67): toda la unidad puede ser una de: Spawn of Khorne +3/modelo (Killing Blow) / Spawn of Nurgle +2/modelo (Poisoned Attacks) / Spawn of Slaanesh +3/modelo (Strike First) / Spawn of Tzeentch +1/modelo (Flaming Attacks y Magical Attacks). Reglas: **Armour Bane (2), Fear, Immune to Psychology, Open Order, Random Attacks, Random Movement, Stomp Attacks (1), Unbreakable**.

## 5. Caballería, war beasts y carros (RH PDF 68-73 / imp. 67-72)

| Unidad | Pts | Tam. | Base | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo / AV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Chaos Knight** (68) Core | 27 | 4+ | 30x60 | Heavy cav | - | 5 | 3 | 4 | 4 | 1 | 4 | 1 | 8 | Hand weapons, heavy armour, shields; Steed barding → 3+ (deriv.) |
| Champion | +6 | | | | - | 5 | 3 | 4 | 4 | 1 | 4 | 2 | 8 | |
| Chaos Steed | - | | | | 7 | 3 | - | 4 | - | - | 3 | 1 | - | Iron-shod hooves (hand weapon), barding |
| **Chosen Chaos Knight** (69) Special 0-1 | 36 | 4+ | 30x60 | Heavy cav | - | 5 | 3 | 4 | 4 | 1 | 4 | 2 | 9 | idem Chaos Knight; 3+ (deriv.); Ward 6+ |
| Champion | +7 | | | | - | 5 | 3 | 4 | 4 | 1 | 4 | 3 | 9 | |
| Chaos Steed | - | | | | 7 | 3 | - | 4 | - | - | 3 | 1 | - | idem |
| **Marauder Horseman** (70) Core | 12 | 5+ | 30x60 | Light cav | - | 4 | 3 | 3 | 3 | 1 | 3 | 1 | 6 | Hand weapons, light armour (6+) |
| Marauder Horsemaster | +7 | | | | - | 4 | 3 | 3 | 3 | 1 | 3 | 2 | 7 | |
| Warhorse | - | | | | 8 | 3 | - | 3 | - | - | 3 | 1 | - | Iron-shod hooves (hand weapon) |
| **Chaos Warhound** (71) Core | 6 | 5+ | 25x50 | War beasts | 7 | 4 | 0 | 3 | 3 | 1 | 3 | 1 | 6 | Claws and fangs (hand weapon); sin armadura |
| **Chaos Warhound Handler** (71) | +15/unidad | 1 | 30x30 | Regular inf (char) | 5 | 5 | 3 | 4 | 4 | 1 | 4 | 1 | 8 | Hand weapon, heavy armour (5+) |
| **Chaos Chariot** (72) Special | 110 | 1 | 60x100 | Heavy chariot | - | - | - | 5 | 5 | 4 | - | - | - | **AV 3+** |
| Chaos Charioteer (x2) | - | | | | - | 5 | 3 | 4 | - | - | 4 | 1 | 8 | Hand weapons, halberds |
| Chaos Steed (x2) | - | | | | 7 | 3 | - | 4 | - | - | 3 | 1 | - | Iron-shod hooves |
| **Gorebeast Chariot** (73) Rare | 135 | 1 | 60x100 | Heavy chariot | - | - | - | 5 | 5 | 4 | - | - | - | **AV 3+** |
| Chaos Charioteer (x2) | - | | | | - | 5 | 3 | 4 | - | - | 4 | 1 | 8 | Hand weapons, halberds |
| Gorebeast (x1) | - | | | | 6 | 4 | - | 5 | - | - | 2 | 3 | - | Goring horns (hand weapon) |

**Opciones / reglas**
- **Chaos Knights** (68): lances +2/modelo (toda la unidad); marcas +2/modelo; Champion +6, standard +6, musician +6; magic standard hasta 50; Champion objetos 25. Reglas: **Close Order, Ensorcelled Weapons, First Charge, Mark of Chaos Undivided, Swiftstride**.
- **Chosen Chaos Knights** (69): lances +2/modelo; marcas +2/modelo; Champion +7, standard +7, musician +7; **magic standard hasta 100**; **heavy → full plate +3/modelo**; **Drilled +2/modelo**; Champion objetos 25. Reglas: **Chaos Armour (6+), Close Order, Counter Charge, Ensorcelled Weapons, First Charge, Mark of Chaos Undivided, Stubborn, Swiftstride**.
- **Marauder Horsemen** (70): toda la unidad una de: cavalry spears gratis / throwing spears gratis / flails +1/modelo; toda la unidad una de: throwing axes +1/modelo / javelins +1/modelo; shields +1/modelo; marcas **+2/modelo**; Marauder Horsemaster +7, standard +5, musician +5. Sin magic standard ni objetos. Reglas: **Fast Cavalry, Fire & Flee, Mark of Chaos Undivided, Open Order, Skirmishers, Swiftstride, Warband**.
- **Chaos Warhounds** (71): cualquier unidad puede tener: Armoured Hide (1) +1/modelo; Poisoned Attacks +1/modelo; Vanguard +5/unidad; acompañada por un Chaos Warhound Handler +15/unidad. Reglas: **Loner, Move through Cover, Open Order, Swiftstride**.
  - **Handler** (opciones): una de: additional hand weapon gratis / whip gratis ("May take one of the following" — sin dos puntos impresos). Reglas: **Handler, Loner, Mark of Chaos Undivided, Move through Cover, Vanguard**. Sin opción de cambiar marca.
  - **Handler** (regla): "A Chaos Warhound Handler is a special type of character that can be taken as an upgrade to accompany a unit of Chaos Warhounds. During deployment, position a Chaos Warhound Handler with its unit of Chaos Warhounds, as you would a character that has joined a unit. Once placed, a Chaos Warhound Handler cannot leave its unit. Unless this model is fleeing, friendly units of Chaos Warhounds that are within its Command range can use this model's Leadership instead of their own."
- **Chaos Chariot** (72): sustituir Undivided por Khorne/Nurgle/Slaanesh/Tzeentch +10 cada una. Reglas: **Close Order, Ensorcelled Weapons, First Charge, Impact Hits (D6+1), Mark of Chaos Undivided**. "Character Mount: A Chaos Chariot may be included in your army as a character's mount. If so, its points are added to that of its rider."
- **Gorebeast Chariot** (73): marcas +10 cada una (texto impreso: "Any **Chaos Chariot** may replace the Mark..." — errata evidente, se aplica al Gorebeast Chariot). Reglas: **Armour Bane (1, Gorebeast only), Close Order, Ensorcelled Weapons, First Charge, Impact Hits (D6+2), Killing Blow (Gorebeast only), Mark of Chaos Undivided**. Montura de personaje igual que el Chaos Chariot (solo Champions of Chaos, no Sorcerers).
- Ensorcelled Weapons en carros: los charioteers llevan hand weapons y halberds; la regla solo aplica si usan la hand weapon (ver §8).

## 6. Monstruos (RH PDF 76-77 / imp. 75-76)
| Unidad | Pts | M | WS | BS | S | T | W | I | A | Ld | Base | Tipo | AV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Chimera** (76) Special | 180 | 6 | 4 | 0 | 6 | 5 | 4 | 3 | 6 | 5 | 60x100 | Monstrous creature | scaly skin (heavy, 5+) |
| **Hellcannon** (77) Rare 0-1/1.000 | 215 | 3 | 4 | 3 | 5 | 6 | 5 | 1 | 5 | 4 | 100x150 | Behemoth | **AV 4+** |
| Chaos Dwarf Handlers (x3) | - | 3 | 4 | - | 3 | - | - | 2 | 1 | 9 | | | |

- **Chimera**: equipo claws and fangs (hand weapon), scaly skin. Opciones: **flaming breath +20** (R N/A, S4, AP -, Breath Weapon, Flaming Attacks); **fiend tail +10** (Combat, S, AP -1, Extra Attacks (D3); "In combat, a Chimera with a fiend tail may make an additional D3 attacks each turn, each of which must be made with this weapon."); **Regeneration (5+) +15**; **Poisoned Attacks +10**. Reglas: **Armour Bane (2, claws and fangs only), Close Order, Fly (10), Large Target, Stomp Attacks (1), Swiftstride, Terror**. Tamaño 1.
- **Hellcannon**: equipo Hellcannon: Doomfire y hand weapons; Handlers: hand weapons. Reglas: **Armour Bane (1), Caged Fury, Close Order, Ensorcelled Weapons, Immune to Psychology, Impact Hits (D6), Large Target, Monster Handlers, Regeneration (6+), Terror, Unbreakable, Warp-spawned**. Tamaño 1.
  - **Doomfire**: R 12-60", S 5 (10), AP -2 (-5), Bombardment, Cumbersome, Move or Shoot, Multiple Wounds (D3). "This weapon shoots like a stone thrower, using the 'Bombardment' special rule, a 3" blast template and the Hellcannon Misfire table. Any unit that suffers one or more unsaved wounds from this weapon must make a Panic test as if it had taken heavy casualties." (Valor entre paréntesis = modelo bajo el agujero central, como stone thrower de CR.)
  - **Caged Fury**: "During the Start of Turn sub-phase of each of your turns, make a Leadership test for this model. If this test is failed, roll immediately on the Hellcannon Misfire table."
  - **Hellcannon Misfire Table** (D6): **1 Free at Last!** "Every unit (friend or foe) within 3D6" suffers D6 Strength 5 hits, each with an AP of -1. Once these hits are resolved, the Hellcannon is removed from play as a casualty." **2-4 Chomp!** "Remove one of the Hellcannon's Chaos Dwarf Handlers." **5-6 Blooood!** "The Hellcannon breaks its chains, immediately moving 3D6" as if it were subject to the Random Movement special rule and as if this were the Compulsory Moves sub-phase."
  - **Monster Handlers** (CR): los handlers se colocan en contacto con el monstruo; en combate añaden sus ataques; si el monstruo sufre una herida no salvada, D6: 1-4 pierde el monstruo una Wound, 5+ la sufre un handler; si el monstruo es retirado, también los handlers.
  - Ambigüedad: Caged Fury con Ld 4 propio; no se indica si puede usar el Ld del General (Inspiring Presence). Aplicar reglas CR normales de tests de Liderazgo.

## 7. Unidades de la lista Beastmen Brayherds incluibles en la Grand Army WoC
(No son entradas del capítulo WoC; la composición remite a ellas. RH PDF 102, 105, 109-110, 117.)
| Unidad | Cat. WoC | Pts | Tam. | Base | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dragon Ogre** (102) | Special | 56 | 1-9 | 50x75 | Monstrous cav | 7 | 4 | 2 | 5 | 4 | 4 | 2 | 3 | 8 | Hand weapons, light armour |
| Shartak (champion) | | +7 | | | | 7 | 4 | 2 | 5 | 4 | 4 | 2 | 4 | 8 | |
| **Dragon Ogre Shaggoth** (105) | Rare, 0-1 por unidad de Dragon Ogres | 225 | 1 | 50x75 | Monstrous creature | 7 | 6 | 2 | 6 | 5 | 6 | 4 | 5 | 9 | Hand weapon, light armour |
| **Chaos Giant** (109) | Rare, 0-1/1.000 | 200 | 1 | 50x50 min / 50x75 max | Behemoth | 6 | 3 | 1 | 6 | 6 | 6 | 2 | * | 10 | Giant's club; calloused hide (light armour) |

- **Dragon Ogres**: una de: additional hand weapons +3 / great weapons +4 / halberds +3 por modelo; light → heavy armour +3/modelo; Shartak +7; Shartak: Chaos Mutations hasta 25, objetos hasta 25. **No hay opción de estandarte/músico ni Mark of Chaos.** Reglas: Armour Bane (1), Armoured Hide (2), Close Order, Fear, Ensorcelled Weapons, Immune to Psychology, Stomp Attacks (2), The Quickening Storm.
- **Shaggoth**: una de: additional hand weapon +3 / great weapon +4; light → heavy +6; Chaos Mutations hasta 50 (Beastmen "page 111"); objetos hasta 50. Reglas: Armour Bane (2), Armoured Hide (2), Close Order, Ensorcelled Weapons, Immune to Psychology, Large Target, Stomp Attacks (D3+1), Storm Call, Terror, The Quickening Storm.
  - **Storm Call**: Bound spell, Power Level 1, se puede lanzar en combate. Magic Missile, CV 7+, Range Self: "all units within 6" of this model (friend or foe), including units engaged in combat and this model, suffer D3 Strength 4 hits, each with an AP of -1."
  - **The Quickening Storm** (Beastmen PDF 117): Ward 5+ contra heridas de Magic Missile o Magical Vortex; si el modelo o su unidad sufre impactos de Storm Call queda 'Quickened': +1 Initiative y +1 Attacks hasta tu próximo Start of Turn.
- **Chaos Giant**: scaly skin (heavy armour) +10; Regeneration (6+) +20. Reglas: Close Order, *Giant Attacks, Immune to Psychology, Large Target, *Pick Up And…, Stomp Attacks (D6), Terror, Timmm-berrr!, Unbreakable. Tabla Giant Attacks (D6) y Pick Up And… idénticas a las del Giant O&G (ver spec_orcs.md §8): 1 'Eadbutt (D3+1 heridas, sin armadura ni Regeneration), 2 Belly Flop (plantilla 3", S del Giant AP -2), 3-4 Mighty Swing (Random Attacks, A=D6+1, S+1, AP -2), 5 Thump With Club (S+4, AP -4, Multiple Wounds (D6)), 6 Jump Up & Down (D6+1 impactos S del Giant, sin armadura).
- **Chaos Mutations** (tabla de la lista Beastmen, PDF 112 aprox.): NO transcrita en este spec (fuera del capítulo WoC). Los Gifts of Chaos de WoC NO son las Chaos Mutations.

## 8. Reglas especiales del ejército: texto exacto (RH PDF 82-83 / imp. 81-82)

**Chaos Armour (X+)** (82): "A model with this special rule has a Ward save against any wounds suffered. The armour value of this Ward save is shown in brackets after the name of this special rule (shown here as 'X+'). In addition, a Wizard with this special rule may wear armour without penalty."
- Valores: Champions y Sorcerers 5+; Daemon Prince 4+; Forsaken 5+; Chosen Warriors y Chosen Knights 6+.

**Ensorcelled Weapons** (82): "A hand weapon carried by a model with this special rule has the Magical Attacks special rule and an Armour Piercing characteristic of -1. Note that this special rule only applies to a single, non-magical hand weapon and does not apply to a model's mount (should it have one). If the model is using two hand weapons or any other sort of weapon, this special rule ceases to apply."
- *Juego:* solo si combate con UNA hand weapon no mágica (sola o con escudo). Con additional hand weapon, great weapon, halberd, flail, lance, etc. no aplica. No se transmite a la montura.

**Gaze of the Gods** (82): "During the Command sub-phase of their turn, a character with this special rule may choose to roll on the Gaze of the Gods table:"
| D6 | Resultado |
|---|---|
| 1 | **Damned by Chaos**: el modelo queda sujeto a **Stupidity** el resto de la partida. Si ya la tenía, -1 Ld (mínimo 2). |
| 2 | **Unnatural Quickness**: hasta tu próximo Start of Turn, +1 Initiative (máx 10). |
| 3 | **Iron Skin**: hasta tu próximo Start of Turn, +1 Toughness (máx 10). |
| 4 | **Murderous Mutation**: resto de la partida, +1 Weapon Skill (máx 10). |
| 5 | **Dark Fury**: resto de la partida, +1 Attacks (máx 10). |
| 6 | **Apotheosis**: resto de la partida, +1 Strength y +1 Leadership (máx 10). |
"Note that any benefits granted by the Gaze of the Gods apply only to the Champion, not to their mount (should they have one)."
- *Juego:* opcional, cada fase de Mando propia, cada personaje con la regla (todos los personajes WoC). Efectos permanentes acumulables (el texto no prohíbe repetir). Favour of the Gods permite repetir el D6 (una vez). Stupidity es contagiosa a la montura/unidad unida (CR).

**Marks of Chaos** (83):
- "A model cannot have more than one Mark of Chaos."
- "All models within a unit must have the same Mark of Chaos."
- "A character with the Mark of a specific Chaos god can only join a unit with the same Mark, with the Mark of Chaos Undivided, or with no Mark."
- "A character with the Mark of Chaos Undivided can join any unit as normal."
- "Note that, with the exception of Daemonic Mounts, the benefits granted by a Mark of Chaos apply only to its bearer, not to their mount (should they have one)."

| Marca | Efecto (texto) |
|---|---|
| **Mark of Chaos Undivided** | "Models with the Mark of Chaos Undivided can re-roll any failed Fear, Panic or Terror test." |
| **Mark of Khorne** | "Models with the Mark of Khorne have the Frenzy special rule." |
| **Mark of Nurgle** | "Any enemy model that directs its attacks against a model with the Mark of Nurgle during the Combat phase must re-roll any rolls To Hit of a natural 6." |
| **Mark of Slaanesh** | "Models with the Mark of Slaanesh have +1 Initiative during the first round of any combat. Additionally, if the majority of the models in a unit have the Mark of Slaanesh, the unit automatically passes any Panic tests it is required to make." |
| **Mark of Tzeentch** | "Models with the Mark of Tzeentch have the Flaming Attacks and Magic Resistance (-1) special rules. In addition, if a Wizard with the Mark of Tzeentch has joined a unit with the Mark of Tzeentch that has a Unit Strength of 10 or more, they may apply a +1 modifier to any Casting roll they make. Should they leave the unit for any reason, or should the unit's Unit Strength fall below 10, this modifier is lost." |

- Carros: la marca la tiene el modelo de carro (perfil combinado); el texto no aclara si los Chaos Steeds/Gorebeast del carro se benefician. **Ambiguo**; por filosofía (beneficio "only to its bearer, not to their mount" y el carro es un único modelo) aplicar al modelo carro completo (charioteers incluidos).

**Lore of Chaos** (84): "A Wizard with the 'Lore of Chaos' special rule may discard one of their randomly generated spells as normal. When they do so, they may select instead either the signature spell of their chosen Lore of Magic, or the spell that corresponds to their Mark of Chaos listed below." (Ver §11.)

**Reglas de unidad propias del capítulo** (transcritas en su sección): Rampant Mutation (Forsaken, §4), Ogre Charge (Chaos Ogres, §4), Handler (§5), Wilful Beast (Manticore, §3), Two-headed Dragon (§3), Caged Fury (§6), Spawn of Khorne/Nurgle/Slaanesh/Tzeentch (§4), Forsaken by Khorne/Nurgle/Slaanesh/Tzeentch (§4), Troll vomit (§4).

**Reglas núcleo clave (CR, para el motor)**
- **Unstable** (CR imp. 180): "If a unit with this special rule loses a round of combat, it loses one additional Wound for every combat result point by which it lost. These Wounds are lost after combat results have been calculated but before Break tests are made." (+ reparto con personajes Unstable.)
- **Warp-spawned** (CR): "A model with this special rule cannot make a Regeneration save against a wound caused by a Magical attack. In addition, characters that are not Warp-spawned cannot join units that are, and vice versa."
- **Shieldwall** (CR): "Once per game, during a turn in which it was charged, a unit with this special rule that is arrayed in a Close Order formation, and that is equipped with and chooses to use shields, may Give Ground rather than Fall Back in Good Order."
- **Drilled** (CR): redress gratis antes de mover (salvo huyendo) y puede marchar a 8" de enemigo sin test; personajes unidos también Drilled.
- **First Charge** (CR): si la primera carga de la partida de la unidad tiene éxito, el objetivo queda Disrupted hasta el final de esa fase de Combate.
- **Stubborn** (CR): el primer Break test puede ignorarse y Fall Back in Good Order automáticamente.
- **Warband** (CR imp. 181): +Rank Bonus al Ld (máx 10) salvo huyendo y no en Restraint; si la mayoría la tiene, puede repetir la Charge roll.
- **Frenzy** (Mark of Khorne): definida en CR (ver spec_orcs.md §8).
- Otras (Armour Bane, Fast Cavalry, Fire & Flee, Swiftstride, Regeneration, Flammable, Poisoned Attacks, Skirmishers, Open Order, Unbreakable, Vanguard, Loner, Terror, Fear, Stomp Attacks, Impact Hits, Random Attacks, Random Movement, Breath Weapon, Fly, Magic Resistance, Killing Blow, Hatred, Furious Charge, Impetuous, Immune to Psychology, Large Target, Counter Charge, Move through Cover, Magical/Flaming Attacks, Strike First/Last, Timmm-berrr!) están definidas en CR; no transcritas aquí.

## 9. Gifts of Chaos (RH PDF 78 / imp. 77)
Personajes que pueden tomarlos: Chaos Lord, Exalted Champion, Aspiring Champion, Daemon Prince, Sorcerer Lord, Exalted Sorcerer — **hasta 50 pts cada uno** (además de sus objetos mágicos). **Cada Gift solo una vez por ejército.**

| Gift | Pts | Efecto (resumen fiel) |
|---|---|---|
| **Dark Majesty** | 50 | Salvo que el personaje huya, toda unidad enemiga que deba hacer test de Fear o Terror estando dentro de su Command range lo hace con -1 adicional a Ld (mínimo 2). |
| **Daemon-flesh** | 45 | "This character cannot be wounded by a roll To Wound of 2, regardless of the Strength of the attack." |
| **Extra Arm** | 40 | El personaje (no su montura) +1 Attacks. |
| **Diabolic Splendour** | 35 | Todo modelo enemigo que dispare (fase de Disparo) contra este personaje o la unidad a la que se ha unido sufre -1 To Hit adicional. |
| **Enchanting Aura** | 35 | Las unidades enemigas en combate con este personaje no pueden usar Strike First. Los modelos enemigos sin Strike First quedan sujetos a Strike Last. |
| **Aura of Pain** | 30 | Una vez por partida, cuando se elige el combate del personaje en Step 1.1 del Choose & Fight Combat sub-phase, una unidad enemiga trabada con él sufre D6 impactos S3, sin armadura ni Regeneration (Ward sí). |
| **Master of Mortals** | 25 | Salvo huyendo, unidades amigas de Chaos Marauders y Marauder Horsemen a su Command range +1 Ld (máx 10). |
| **Acid Ichor** | 15 | Por cada Wound que el personaje pierda en un desafío, su enemigo sufre un impacto S4, AP -2. |
| **Poisonous Slime** | 15 | El personaje (no su montura) gana Poisoned Attacks. |

- Ambigüedad: el texto no dice si la limitación "Gifts" impide combinar 50 pts de Gifts con 2 gifts (p.ej. 35+15=50). Sí está permitido: el límite es "up to a total of 50 points".

## 10. Objetos mágicos propios (RH PDF 79-81 / imp. 78-80)
Se compran igual que los Common magic items (CR). "*" = extremely common.

**Magic Weapons**
| Objeto | Pts | Perfil | Efecto |
|---|---|---|---|
| **Daemonsword** | 75 | Combat, S+D3, AP -2, Extra Attacks (+D3), Magical Attacks, Strike First | Cada 1 natural To Hit = un impacto contra la unidad a la que se ha unido el portador (o contra el portador si no está unido). |
| **Chaos Runesword** | 45 | Combat, S+1, AP -1, Magical Attacks | Portador +1 WS y +1 I. |
| **Filth Mace** | 40 | Combat, S+1, AP -1, Magical Attacks | Modelo enemigo que sufra ≥1 herida no salvada hace test de Toughness; si falla, -1 T (mín 1) hasta el final del turno. |
| **Spellthieving Sword** | 20 | Combat, S, AP -1, Magical Attacks | Wizard enemigo que sufra ≥1 herida no salvada olvida un hechizo aleatorio el resto de la partida. |

**Magic Armour**
| Objeto | Pts | Efecto |
|---|---|---|
| **Armour of the Damned** | 70 | Full plate armour. En la fase de Combate, los enemigos deben repetir los To Hit exitosos contra el portador. |
| **Crimson Armour of Dargan** | 40 | Solo modelos con troop type 'infantry' o 'cavalry'. Heavy armour. Inmune a Multiple Wounds (X): una herida no salvada de un ataque con esa regla le quita una sola Wound. |

**Talismans**
| Objeto | Pts | Efecto |
|---|---|---|
| **Crown of Everlasting Conquest** | 40 | El portador gana "Regenerate (5+)" (sic; = Regeneration (5+)). |
| **Brazen Collar*** | 20 | Magic Resistance (-2). |

**Magic Standards**
| Objeto | Pts | Efecto |
|---|---|---|
| **Banner of the Gods** | 75 | La unidad ignora todos los modificadores negativos a su Leadership. |
| **Doom Totem** | 65 | Toda unidad enemiga que pueda trazar línea de visión al portador sufre -1 Ld. |
| **Blasted Standard** | 40 | La unidad puede repetir 1 naturales en tiradas de armadura contra heridas sufridas en la fase de Disparo. |
| **Banner of Rage** | 35 | La unidad gana Frenzy y no puede perderla. |

**Enchanted Items**
| Objeto | Pts | Efecto |
|---|---|---|
| **Pendant of Damnation** | 30 | Solo troop type 'infantry' o 'cavalry'. +1 Attacks por cada Wound que haya perdido. |
| **Helm of Many Eyes** | 20 | Portador (no montura) gana Strike First, pero queda sujeto a Stupidity. |
| **Favour of the Gods*** | 5 | Single use. Puede repetir el D6 de la tabla Gaze of the Gods. |

**Arcane Items**
| Objeto | Pts | Efecto |
|---|---|---|
| **Skull of Katam** | 60 | El portador y cualquier otro Wizard a 3" (amigo o enemigo) +1 a sus tiradas de Casting ("does not negate a roll of a natural double 1"). |
| **Infernal Puppet** | 50 | Salvo huyendo o en combate, cuando un Wizard enemigo a 24" hace una tirada de Casting, el propietario puede usarlo: el Wizard enemigo tira un D6 extra y descarta el más alto. (Sin límite de usos impreso.) |
| **Spell Familiar*** | 15 | 0-1 por Wizard. Conoce un hechizo más de lo normal para su nivel (no aumenta el nivel). |

Total: 18 objetos (4 armas, 2 armaduras, 2 talismanes, 4 estandartes, 3 encantados, 3 arcanos).

## 11. Magia

**Lores disponibles**: Sorcerers y Daemon Prince Wizard: **Battle Magic, Daemonology, Dark Magic** (CR) + regla **Lore of Chaos** (hechizo de su marca).

**Lore of Chaos** (RH PDF 84 / imp. 83) — sustituye un hechizo aleatorio descartado:
| Hechizo (marca) | Tipo | CV | Alcance | Efecto |
|---|---|---|---|---|
| **Winds of Chaos** (Undivided) | Hex | 7+/9+ | 21" | Resultado ≥7: la unidad enemiga -1 Movement (mín 1); resultado ≥9: -2 Movement (mín 1). Dura hasta tu próximo Start of Turn. |
| **Blue Fire** (Tzeentch) | Magic Missile | 9+ | 18" | La unidad enemiga sufre D6+3 impactos S4, AP -2, Flaming Attacks. |
| **Acquiescence** (Slaanesh) | Hex | 6+ | 12" | Hasta el final de la fase de Combate, la unidad enemiga queda sujeta a Strike Last. |
| **Fleshy Abundance** (Nurgle) | Enchantment | 7+ | Self | Remains in Play. El lanzador y la unidad a la que se ha unido +1 Toughness (máx 7). |
- **Mark of Khorne: no hay hechizo** (y solo el Daemon Prince podría tenerla, pero entonces no es Wizard).

**Daemonology** (CR imp. 322-323)
- Firma **The Summoning**: Magic Missile, 9+, 18": 2D6 impactos S4 AP -1.
- 1 **Steed of Shadows**: Conveyance, 9+, 15"; solo unidades amigas 'infantry' no huyendo y que no hayan movido esta fase: Fly (12) hasta tu próximo Start of Turn.
- 2 **Gathering Darkness**: Hex, 9+, 12"; hasta tu próximo Start of Turn: -2 I (mín 1), -2 Ld (mín 2), no puede usar Inspiring Presence; puede objetivar unidad en combate.
- 3 **Daemonic Familiars**: Assailment, 8+, Combat; una unidad enemiga trabada: 2D6 impactos S2 sin armadura (Ward/Regeneration sí).
- 4 **Daemonic Vessel**: Enchantment, 10+, Self; hasta fin de turno el lanzador, montura y unidad: +1 S y +1 A (máx 10) y +1 AP a sus armas.
- 5 **Vortex of Chaos**: Magical Vortex, 8+, 15"; Remains in Play; plantilla 3" con agujero a ≤15", terreno peligroso; se mueve D6" aleatorio cada Start of Turn; unidades que toca: D6+1 impactos S3 AP -.
- 6 **Daemonic Vigour**: Enchantment, 9+, 15"; hasta fin de turno la unidad amiga +1 M, T, I (máx 10).

**Dark Magic** (CR imp. 324-325)
- Firma **Doombolt**: Magic Missile, 8+, 24"; plantilla 3" centrada en la unidad; cada enemigo bajo ella arriesga 1 impacto S3 AP -2.
- 1 **Word of Pain**: Hex, 10+, 18"; hasta tu próximo Start of Turn -1 S y -1 T (mín 1); puede objetivar unidad en combate.
- 2 **Stream of Corruption**: Assailment, 8+, Combat; plantilla de llama desde la base del lanzador sobre unidad trabada; cada modelo (amigo o enemigo) bajo ella arriesga 1 impacto S3 AP -1.
- 3 **Infernal Gateway**: Conveyance, 10+, 12"; solo personajes amigos (puede en combate, no huyendo): recolocar a ≤12" y a ≥6" de enemigos; permite salir de combate.
- 4 **Phantasmagoria**: Magical Vortex, 9+, 12"; Remains in Play; plantilla 3" fija, terreno peligroso; unidades enemigas que terminen movimiento a ≤12" hacen Panic test: fallan → Fall Back in Good Order o huyen alejándose; pasan (o no deben testear) → Impetuous mientras estén a ≤12".
- 5 **Battle Lust**: Enchantment, 9+, 12"; hasta fin de turno la unidad amiga gana Frenzy y Hatred (all enemies).
- 6 **Soul Eater**: Assailment, 7+, Combat; un modelo enemigo trabado: 1 impacto S3, Multiple Wounds (3), sin armadura (Ward/Regeneration sí).

**Battle Magic**: definida en CR (no transcrita).

## 12. NO ESTÁ EN LAS FUENTES
- **Armies of Infamy de Warriors of Chaos**: ninguna en RH (solo se mencionan como opción de aliado).
- Hechizo de Lore of Chaos para **Mark of Khorne**.
- Unidades clásicas de WoC no presentes en RH: Chaos Warshrine, Skullcrushers, Gorebeast como unidad suelta, Mutalith Vortex Beast, Slaughterbrute, Chaos Familiars, Doombull (es Beastmen), Daemons de Chaos, personajes nombrados (Archaon, Galrauch, etc.). **No hay personajes nombrados WoC en RH.**
- Mercenarios concretos para WoC: la lista solo da el % (20%), sin enumerar unidades.
- Calificativo de alianza con Beastmen Brayherds (impreso sin "Uneasy"/"Suspicious"; según CR, ausencia de calificativo = aliados de confianza, por interpretación).
- Valor de Ld de la Manticore para Wilful Beast (perfil Ld "-"; ver §3).
- Opciones de mando/estandarte para Forsaken, Chaos Trolls, Chaos Spawn, Chaos Warhounds, Marauder Horsemen magic standard, Chaos Ogres magic standard: no existen.
- Armas genéricas (flail, halberd, lance, great weapon, throwing axes, javelins, cavalry/throwing spears, whip): perfiles en CR, no en RH.
- Tabla Chaos Mutations (Beastmen) para Shartak/Shaggoth: no transcrita aquí.
- Erratas impresas detectadas: "Any Chaos Chariot may replace..." en el Gorebeast Chariot; "Regenerate (5+)" en Crown of Everlasting Conquest; "May take one of the following" sin dos puntos en el Handler.
