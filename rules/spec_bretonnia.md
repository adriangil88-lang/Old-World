# Spec Kingdom of Bretonnia (Warhammer: The Old World) - datos exactos

**Fuentes y convención de citas**
- **AJ** = `Arcane Journal - Kingdom of Bretonnia` (PDF adjunto; cita = página IMPRESA). **El AJ NO contiene la lista principal de Bretonnia**: solo trae dos Armies of Infamy (Bretonnian Exiles, Errantry Crusade), 3 personajes nombrados, Outcast Wizard, Yeomen Guard, Border Princes Brigands, Border Princes Bombard y objetos mágicos extra (AJ remite a "Forces of Fantasy" para el resto).
- **FoF** = `Forces_of_Fantasy.pdf`, ya extraído en `/home/claude/tow/rules/fof.txt` (sección Kingdom of Bretonnia = líneas 3219-4505; págs. impresas citadas por el propio libro: reglas de ejército p.107, Knightly Virtues p.102, Chivalrous Vows p.108, Lore of the Lady p.109, Lance Formation p.110, monturas de personaje p.89). **Toda la tabla de unidades core/special/rare, personajes, monturas, Vows y Lore of the Lady de este documento sale de FoF** (el AJ no la repite). Las convenciones de armadura/armas/reglas básicas son las de `spec_empire.md` y Core Rulebook (`core.txt`).
- Marcas: `(†)` = dato derivado de reglas del Core (no impreso en el perfil); `[core]` = regla/arma definida en Core Rulebook. Todo lo demás es literal del libro. Lo que no existe en las fuentes se marca **falta el dato**.
- Perfil: M WS BS S T W I A Ld. En caballería la fila superior es el jinete (M "-") y la inferior la montura; el jinete usa su propio T/W.

## 0. Avisos críticos
1. No hay "Life" en esta edición para Bretonnia: la magia de las Handmaidens es **Battle Magic / Elementalism / Illusion** (Lores del Core, ver `spec_magic_special.md`) + el añadido **Lore of the Lady** (3 hechizos, sec. 7).
2. Los nombres exactos de la lista: **Men-at-Arms** (10+), **Peasant Bowmen** (10+), **Knights of the Realm** (a pie y montados), **Knights Errant**, **Questing Knights**, **Grail Knights** (Rare), **Pegasus Knights**, **Field Trebuchet**, **Duke / Baron / Paladin**, **Prophetess / Damsel** (Handmaidens of the Lady), **Sergeant-at-Arms**. No existe "Royal Pegasus Knights": el Royal Pegasus es solo montura de personaje.
3. Las caballerías llevan **lanza** (Knights Errant, Knights of the Realm, Grail Knights, Pegasus Knights) **excepto Questing Knights** (great weapon; su Questing Vow prohíbe equipar lanza).
4. Puntos de caballería: el coste por modelo ya incluye la montura (fila de la montura "-").
5. **Tamaño**: solo se imprimen mínimos ("5+", "10+", "3+"); único máximo impreso: **Battle Pilgrims 5-30**. Resto sin máximo (falta el dato).

## 1. Composición del ejército (FoF Army List, p.86 aprox.)
**Grand Army Composition List**
| Categoría | % puntos | Contenido y límites |
|---|---|---|
| Characters | hasta 50% | 0-1 Duke; 0-1 Baron **o** Prophetess por 1.000 pts; sin límite: Paladins, Damsels, Sergeants-at-Arms |
| Core | **al menos 25%** | 1+ unidad de Knights of the Realm a pie y/o montados; 1+ unidad de Men-at-Arms y/o Peasant Bowmen; 0-1 unidad de Knights Errant **por cada unidad** de Knights of the Realm (a pie o montados) tomada |
| Special | hasta 50% | Squires, Questing Knights, Pegasus Knights, Mounted Yeomen; 0-2 unidades de Battle Pilgrims por 1.000 pts |
| Rare | hasta 25% | Grail Knights; 0-1 Field Trebuchet por 1.000 pts |
| Mercenaries | hasta 20% | La lista no nombra unidades (falta el dato); reglas Mercenaries [core p.279] |
| Allies | hasta 25%, un solo contingente | Cualquier Army of Infamy de Bretonnia; o Grand Army de Dwarfen Mountain Holds (Suspicious), Empire of Man, High Elf Realms, Wood Elf Realms (Suspicious) |
- **Battle Standard Bearer**: un solo Paladin, **coste 0** en Bretonnia; además de sus objetos puede comprar un estandarte mágico sin límite de puntos ("The Lord's Banner").
- General obligatorio; mínimo 3 unidades no personaje [core p.276-277].
- **Objetos mágicos**: lista Common + lista Kingdom of Bretonnia (FoF p.4184+ en fof.txt; AJ p.46-48 añade más).

### Armies of Infamy (AJ)
| | **Bretonnian Exiles** (AJ p.30) | **Errantry Crusade** (AJ p.34) |
|---|---|---|
| Characters (≤50%) | 0-1 Baron por 1.000; 0-1 Damsel; Paladins, Outcast Wizards, Sergeants-at-Arms | 0-1 Duke; 0-1 Baron o Prophetess por 1.000; **1+ Paladin**; Damsels, Sergeants-at-Arms |
| Core | **≥25%**: 1+ Knights of the Realm a pie y/o montados; 1+ Yeoman Guard y/o Peasant Bowmen; 0-1 Knights Errant por 1.000; Men-at-Arms y Mounted Yeomen | **≥33%**: 1+ Knights Errant por 1.000; 0-1 Battle Pilgrims; Knights of the Realm a pie, Squires, Knights of the Realm montados |
| Special | ≤33%: Squires, Pegasus Knights; 0-1 Battle Pilgrims por 1.000 | ≤50%: Men-at-Arms, Peasant Bowmen, Battle Pilgrims, Questing Knights, Pegasus Knights |
| Rare | ≤33%: Questing Knights, Border Princes Brigands; 0-1 Field Trebuchet por 1.000; 0-1 Border Princes Bombard por 1.000 | ≤33%: Grail Knights, Mounted Yeomen; 0-1 Field Trebuchet |
| Mercenaries | ≤25%: Free Company Militia, Empire Archers (Empire list) | ≤25%: Empire Knights, Inner Circle Knights (Empire list) |
- Ambas: Battle Standard como arriba; objetos Common + Kingdom of Bretonnia; mercenarios ganan Mercenaries [core p.279].
- **Exiles**: Barons/Paladins **no pueden tener Grail Vow**; Baron, Paladin, Knights of the Realm a pie, Knights Errant, Knights of the Realm montados y Pegasus Knights pueden cambiar Knight's Vow por **Exile's Vow** gratis. Reglas: Banished Lords, Reclaimed Glory (no pueden rezar al inicio; ver 5).
- **Errantry Crusade**: ganan **Crusader's Zeal**; pueden cambiar Knight's Vow por **Crusader's Vow** gratis: Baron, Paladin, Knights of the Realm a pie, Battle Pilgrims, Knights Errant, Knights of the Realm montados, Questing Knights, Grail Knights, Pegasus Knights, Mounted Yeomen. Regla Earn Your Spurs (ver 5).

## 2. Convenciones de armadura y armas
- Armadura [core p.221]: ligera 6+, pesada 5+, coraza completa 4+, sin armadura 7+; escudo mejora 1; montura con barding mejora 1; nunca mejor que 2+. Wizards no pueden llevar armadura ni escudo (barding de la montura sí).
- AV derivados (†): Knight of the Realm/Questing/Grail/Errant montados = pesada + escudo + barding = **3+**; Knights of the Realm a pie = pesada + escudo = **4+**; Men-at-Arms = ligera + escudo = **5+**; Peasant Bowmen = **7+** (ligera +1 pt = 6+); Battle Pilgrims = ligera + escudo = **5+**; Pegasus Knights = pesada + escudo + barding = **3+**; Squires **7+**; Mounted Yeomen **7+** (ligera +2 = 6+, +escudo +1 = 5+); Sergeant-at-Arms ligera **6+** (con escudo 5+); Duke/Baron/Paladin pesada **5+** (con escudo 4+; con Warhorse barded 3+/ con Barded Pegasus 3+ (†)); Prophetess/Damsel **7+** (sin armadura; montura barded mejora 1, Unicorn con Armoured Hide (1) mejora 1 (†)).
- Armas [core]: hand weapon (S, AP-); **lance** (Combat S+2, AP-2, Armour Bane (1); solo caballería/monstruo, solo en turno de carga, si no usa hand weapon); great weapon (S+2, AP-2, Armour Bane (1), Requires Two Hands, Strike Last); morning star (S+1, AP-1); halberd (S+1, AP-1, Armour Bane (1), Requires Two Hands); additional hand weapon (+1 A, Requires Two Hands); **cavalry spear** (S+1, AP-1, Fight in Extra Rank; solo caballería/monstruo; bonos solo en turno de carga; no apoyo si cargó); thrusting spear (S, AP-, Fight in Extra Rank); **longbow** (30", S3, AP-, Armour Bane (1), Volley Fire); **shortbow** (18", S3, AP-, Quick Shot, Volley Fire).
- **Polearm** (Men-at-Arms; AJ p.43 / FoF): dos perfiles, elegir en la 1ª ronda de combate: single-handed Combat S, AP-, Fight in Extra Rank; double-handed Combat S+1, AP-1, Requires Two Hands. No hace ataque de apoyo si cargó.

## 3. Personajes (todos Regular infantry (character), base 25x25, unidad 1; equipo por defecto: mano + armadura pesada salvo Handmaidens/Sergeant)
| Unidad | Pts | M | WS | BS | S | T | W | I | A | Ld | Equipo / AV | Reglas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Duke (0-1) | 175 | 4 | 7 | 3 | 5 | 4 | 4 | 5 | 5 | 9 | mano + pesada (5+) | Blessings of the Lady, Rallying Cry, **Grail Vow** |
| Baron | 100 | 4 | 6 | 3 | 4 | 4 | 3 | 5 | 4 | 9 | ídem | Blessings of the Lady, Rallying Cry, Knight's Vow |
| Paladin | 60 | 4 | 6 | 3 | 4 | 4 | 2 | 4 | 3 | 8 | ídem | Blessings of the Lady, Rallying Cry, Knight's Vow |
| Prophetess (Nivel 3) | 135 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 8 | mano; sin armadura (7+) | Aura of the Lady, Blessings of the Lady, Lore of the Lady, Magical Attacks, Magic Resistance (-2), Shield of the Lady |
| Damsel (Nivel 1) | 60 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 1 | 7 | ídem | ídem |
| Sergeant-at-Arms | 45 | 4 | 4 | 2 | 4 | 3 | 2 | 4 | 2 | 7 | mano + ligera (6+) | Levies, Peasant's Duty, Peasantry, Warband |

Opciones:
- **Duke/Baron/Paladin**: una de: morning star +3, great weapon +4, lance +4 (si montado); escudo +2; montado (sec. 3.1). **Baron o Paladin** pueden cambiar Knight's Vow por **Questing Vow +15** o **Grail Vow +20**. Un Knightly Virtue (sec. 6). Objetos mágicos: Duke 100, Baron 75, Paladin 50. Paladin = BSB posible (0 pts).
- **Prophetess/Damsel**: Lore = Battle Magic, Elementalism o Illusion (+ Lore of the Lady). Prophetess: Nivel 4 +30, objetos 100. Damsel: Nivel 2 +30, objetos 50. Montables.
- **Sergeant-at-Arms**: una de: halberd +2, additional hand weapon +2, cavalry spear +2 (si montado); escudo +2; Warhorse +12; objetos 25.

### 3.1 Monturas de personaje (FoF p.89)
| Montura | Pts | Quién | Tipo / base | M | WS | BS | S | T | W | I | A | Reglas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Bretonnian Warhorse | +16 | Duke, Baron, Paladin, Prophetess, Damsel | Heavy cavalry 30x60 | 8 | 3 | - | 3 | - | - | 3 | 1 | Counter Charge, Finest Warhorses, First Charge, Swiftstride; barding, cascos = mano |
| Warhorse | +12 | Prophetess, Damsel, Sergeant | Light cavalry 25x50 | 8 | 3 | - | 3 | - | - | 3 | 1 | Fast Cavalry, Swiftstride |
| Barded Pegasus | +30 | Duke, Baron, Paladin | Monstrous cavalry 40x60 | 7 | 3 | - | 4 | - | (+1) | 4 | 2 | Counter Charge, First Charge, Fly (10), Swiftstride; barding |
| Royal Pegasus | +60 | Duke, Baron, Paladin, Prophetess | Monstrous cavalry 50x50 | 8 | 4 | - | 5 | (+1) | (+1) | 5 | 3 | Armour Bane (1, solo Royal Pegasus), Counter Charge, First Charge, Fly (10), Stomp Attacks (2), Swiftstride; barding |
| Unicorn | +35 | Prophetess, Damsel | Monstrous cavalry 40x60 | 10 | 4 | - | 4 | - | (+1) | 5 | 2 | Armour Bane (2, solo Unicorn), Armoured Hide (1), Beguiling Aura, Counter Charge, Magical Attacks, Stomp Attacks (1), Swiftstride; hooves and horn = mano |
| Hippogryph | +120 (+15 barding) | Duke, Baron | Monstrous creature 50x50 | 7 | 5 | - | 5 | (+1) | (+3) | 5 | 4 | Close Order, Counter Charge, Fly (9), Large Target, Stomp Attacks (D3), Swiftstride, Terror; wicked claws (Combat, S, AP-2), serrated maw (Combat, S, AP-, Armour Bane (2), Multiple Wounds (2); 1 ataque/turno obligatorio), griffonic pelt = armadura pesada |
- (+N) = el personaje montado gana +N a esa característica (Pegasus/Unicorn +1 W; Royal Pegasus +1 T y +1 W; Hippogryph +1 T y +3 W). Hippogryph solo como montura (puntos sumados al jinete).

## 4. Infantería (base 25x25 salvo indicación)
| Unidad | Pts/mod | Tamaño | Tipo | M | WS | BS | S | T | W | I | A | Ld | Equipo y AV | Reglas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Men-at-Arms | 4 | 10+ | Regular infantry | 4 | 2 | 2 | 3 | 3 | 1 | 3 | 1 | 5 | mano + polearm + ligera + escudo = 5+ | Close Order, Horde, Levies, Peasantry, Shieldwall, Warband |
| Yeoman (champion) | +7/unidad | | | 4 | 2 | 2 | 3 | 3 | 1 | 3 | 2 | 6 | | |
| Grail Monk (champion) | +7/unidad | | | 4 | 2 | 2 | 3 | 3 | 1 | 2 | 2 | 6 | | Blessed Triptych +25 (unidad gana Stubborn) |
| Peasant Bowmen | 5 | 10+ | Regular infantry | 4 | 2 | 3 | 3 | 3 | 1 | 3 | 1 | 7 | mano + longbow, sin armadura 7+ | Close Order, Levies, Peasantry |
| Villein (champion) | +7/unidad | | | 4 | 2 | 4 | 3 | 3 | 1 | 3 | 1 | 7 | | |
| Squire | 7 | 5+ | Regular infantry | 4 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 7 | mano + longbow, sin armadura | Move through Cover, Open Order, Peasantry, Skirmishers, Vanguard |
| Esquire (champion) | +7/unidad | | | 4 | 3 | 4 | 3 | 3 | 1 | 3 | 2 | 7 | | |
| Knight of the Realm on Foot | 11 | 5+ | Heavy infantry | 4 | 4 | 2 | 3 | 3 | 1 | 3 | 1 | 8 | mano + pesada + escudo = 4+ | Blessings of the Lady, Close Order, Furious Charge, Knight's Vow |
| First Knight (champion) | +6/unidad | | | 4 | 4 | 2 | 3 | 3 | 1 | 3 | 2 | 8 | | |
| Battle Pilgrim | 8 | 5-30 | Heavy infantry | 4 | 2 | 2 | 3 | 3 | 1 | 3 | 1 | 8 | mano + ligera + escudo = 5+ | Close Order, Hatred (All Enemies), Levies, Peasantry, Stubborn |
| Grail Reliquae | +65 | (1 por cada pers./unidad con Grail Vow) | Heavy infantry 50x75 | 4 | 2 | 2 | 3 | 3 | **6** | 3 | **6** | 8 | | Blessings of the Lady, Close Order, Grail Reliquae, Hatred (All Enemies), Levies, Peasantry, Retinue of the Saints, Stubborn |
- Costes de mando (por unidad): **Men-at-Arms**: Yeoman +7, Grail Monk +7, estandarte +5, músico +5. **Peasant Bowmen**: Villein +7, estandarte +5, músico +5; toda la unidad luz. armadura +1/mod; defensive stakes +10/unidad **o** burning braziers +20/unidad (longbows ganan Flaming Attacks) **o** cambiar Close Order por Skirmishers gratis. **Squires**: Esquire +7, estandarte +5, músico +5; Fire & Flee +1/mod; Scouts +1/mod. **Knights on Foot**: toda la unidad great weapons +2/mod, **o** cambiar escudos por great weapons +1/mod; First Knight +6, estandarte +6, músico +6, estandarte mágico hasta 25, First Knight objetos hasta 25. **Battle Pilgrims**: solo se menciona Grail Reliquae +65 (champion/estandarte/músico: falta el dato).
- **Defensive stakes**: la unidad desplegada los coloca en contacto con su arco frontal; se pierden si la unidad se mueve. El enemigo que carga al frente hace disordered charge (Disrupted) y la caballería/carros hacen Dangerous Terrain test al terminar en contacto.
- **Grail Reliquae**: ocupa 6 huecos (2 por fila en 3 filas), centro de la fila frontal; no pierde Wounds mientras queden Battle Pilgrims; cuenta como estandarte y músico; a ≤12" de modelo propio con Grail Vow no huyendo, la unidad gana Immune to Psychology y Unbreakable.
- **Mounted Yeomen** (Special, Light cavalry 25x50, 5+): Mounted Yeoman 13 pts M-/WS3 BS3 S3 T3 W1 I3 A1 Ld6; Warden +5 (A2); Warhorse M8 WS3 S3 I3 A1; mano, cavalry spear, shortbow; ligera +2/mod, escudo +1/mod; Feigned Flight +2/mod; Warden +5, estandarte +5, músico +5. Reglas: Fast Cavalry, Fire & Flee, Levies, Open Order, Peasantry, Reserve Move, Skirmishers, Swiftstride.

## 5. Caballería (todas: base 30x60 salvo indicación; jinete M "-", montura Bretonnian Warhorse M8 WS3 BS- S3 T- W- I3 A1 Ld-, barding, cascos = mano)
| Unidad | Pts/mod | Tipo / tamaño | M | WS | BS | S | T | W | I | A | Ld | Equipo / AV | Reglas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Knight Errant | 19 | Heavy cav, 5+ | - | 3 | 2 | 3 | 3 | 1 | 3 | 1 | 7 | mano, lanza, pesada, escudo + barded horse = 3+ | Blessings of the Lady, Close Order, Finest Warhorses, First Charge, Impetuous, Lance Formation, Swiftstride, Knight's Vow |
| Gallant (champion) | +6 | | - | 3 | 2 | 3 | 3 | 1 | 3 | 2 | 7 | | |
| Knight of the Realm (montado) | 24 | Heavy cav, 5+ | - | 4 | 2 | 3 | 3 | 1 | 3 | 1 | 8 | ídem = 3+ | Blessings of the Lady, Close Order, Counter Charge, Finest Warhorses, First Charge, Lance Formation, Swiftstride, Knight's Vow |
| First Knight (champion) | +7 | | - | 4 | 2 | 3 | 3 | 1 | 3 | 2 | 8 | | |
| Questing Knight | 26 | Heavy cav, 5+ | - | 5 | 2 | 4 | 3 | 1 | 4 | 1 | 8 | mano, **great weapon**, pesada, escudo (3+) | Blessings of the Lady, Close Order, Finest Warhorses, First Charge, Lance Formation, Swiftstride, **Questing Vow** |
| Paragon (champion) | +7 | | - | 5 | 2 | 4 | 3 | 1 | 4 | 2 | 8 | | |
| Grail Knight (Rare) | 38 | Heavy cav, 3+ | - | 6 | 2 | 4 | 4 | 1 | 5 | 2 | 9 | mano, lanza, pesada, escudo (3+) | Blessings of the Lady, Close Order, Counter Charge, Finest Warhorses, First Charge, Lance Formation, **Living Saints**, Swiftstride, **Grail Vow** |
| Grail Guardian (champion) | +7 | | - | 6 | 2 | 4 | 4 | 1 | 5 | 3 | 9 | | |
| Pegasus Knight | 55 | Monstrous cav 40x60, 3+ | - | 4 | 2 | 4 | 4 | 2 | 3 | 1 | 8 | mano, lanza, pesada, escudo (3+) | Blessings of the Lady, Counter Charge, Dispersed Formation, First Charge, Fly (10), Furious Charge (Pegasus Knights y First Knight), Lance Formation, Skirmishers, Swiftstride, Knight's Vow |
| First Knight (champion) | +7 | | - | 4 | 2 | 4 | 4 | 2 | 3 | 2 | 8 | | |
| Barded Pegasus (montura) | - | | 7 | 3 | - | 4 | - | - | 4 | 2 | - | cascos, barding | |
- Estandarte/músico: Knights Errant +6/+6; Knights of the Realm +7/+7; Questing +7/+7; Grail +7/+7; Pegasus +7/+7. Estandarte mágico hasta: Errant 25, Realm 25, **Questing 100**, **Grail 100**, Pegasus 50. Objetos del champion: Realm 25, **Paragon**: un Knightly Virtue + objetos 25; **Grail Guardian**: un Knightly Virtue + objetos 50; Errant/Pegasus: sin objetos de champion listados (falta el dato).
- Todos tienen Lance (Pegasus y Realm/Errant/Grail) salvo Questing (great weapon). Tamaños: Errant/Realm/Questing 5+, Grail Knights 3+, Pegasus Knights 3+.

## 6. Máquinas de guerra y objetos de unidad
| Unidad | Pts | Tipo / base | Perfil | Reglas |
|---|---|---|---|---|
| Field Trebuchet (0-1 por 1.000, Rare) | 100 | War machine 60x100, crew 25x25, unidad 1 | Máquina T7 W3; Peasant crew M4 WS2 BS2 S3 T3 W4 I3 A4 Ld6 | Levies, Peasantry, Skirmishers; arma: 12-72", S5 (10), AP-1 (-4), Bombardment, Cumbersome, **Immovable Object**, Move or Shoot, Multiple Wounds (D3+1) (solo al modelo bajo el agujero central); plantilla 3", tabla Stone Thrower Misfire [core] |
| Border Princes Bombard (AJ p.45) | 100 | War machine 50x50, crew 25x25 | Máquina T7 W3; crew M4 WS3 BS3 S3 T3 W3 I3 A3 Ld7 | Levies, Skirmishers; 48", S8, AP-3, Armour Bane (2), Cannon Fire, Cumbersome, Move or Shoot, Multiple Wounds (D3+1); tabla propia Bombard Misfire (1 destruida; 2-3 pierde 1 W de crew y no dispara; 4-5 no dispara; 6 dispara como Artillery dice "2" y no puede disparar en la siguiente ronda) |

**Knightly Virtues** (p.102; cada una solo una vez por ejército; Duke/Baron/Paladin, Paragon, Grail Guardian): Knightly Temper 70 (turno de carga: Extra Attacks (+D3) y Hatred (all enemies)); Heroism 60 (sin arma mágica: Killing Blow y Monster Slayer); Stoicism 55 (repite 2D6 de Break test, también su unidad); The Penitent 50 (Unbreakable; no puede unirse a unidades; solo Duke/Baron/Paladin); The Ideal 45 (+1 WS, I, A, Ld; no General ni unirse a unidad; solo Duke/Baron/Paladin); Impetuous Knight 40 (Impetuous, +3" a rango máximo de carga y +D3 a la tirada de carga); Audacity 35 (repite To Hit fallidos contra WS superior); Purity 30 (siempre Blessings of the Lady y Ward 5+); Duty 25 (+1 de resultado de combate si el General sigue vivo; no General ni unirse); The Joust 20 (repite To Wound fallidos con lanza); Confidence 15 (debe aceptar/lanzar desafíos; repite To Hit en desafío); Noble Disdain 10 (repite To Hit fallidos en 1ª ronda contra enemigos con armas de proyectiles); Discipline 5 (puede marchar a ≤8" del enemigo sin test de Ld); Empathy 5 (puede unirse a unidades Peasantry; solo Duke/Baron/Paladin).

## 7. Reglas especiales con texto (FoF p.107-110; Lore of the Lady p.109)
**Blessings of the Lady**: Terminado el despliegue, en vez de la tirada para decidir quién juega primero, el ejército bretón puede rezar de rodillas; si lo hace, el oponente cuenta como ganador de la tirada y todos los modelos con esta regla obtienen **Ward 6+** contra cualquier herida y **Ward 5+** contra heridas causadas por ataques de S5 o más. No se puede rezar si no hay tirada previa (p.ej. escenarios) ni si ambos ejércitos son bretones. **Se pierde** si el modelo/unidad huye (Fall Back in Good Order no cuenta) o si un personaje rechaza un desafío.
**Finest Warhorses**: la unidad puede repetir cualquier dado con resultado natural 1 al hacer Charge, Flee o Pursuit roll, antes de descartar los que deba descartar.
**Lance Formation (p.110)**: unidad de modelos con esta regla puede adoptar formación en lanza: filas de 1, 2, 3... modelos en contacto de peana; solo el de delante necesita contacto con el enemigo; todos los modelos exteriores cuentan como fila de combate; **Rank Bonus +1 por cada fila completa y +1 punto de resultado de combate**; no puede girar ni redistribuir filas (sí wheel, retroceder, lateral, reform); wheel medido desde la segunda fila; bajas se quitan de mitad de la última fila. Se **embota (blunted)** y pasa a Close Order si: el modelo delantero no puede hacer contacto, hace disordered charge, o es cargada y no hace Counter Charge. Cargada de flanco: se alinea contra su fila más ancha y se embota. Skirmishers no pueden embotarla. Personajes que se unen van a la parte exterior.
**Peasantry**: si está a ≤6" de un modelo propio con Knight's/Questing/Grail Vow que no huya, la unidad puede usar el Ld de ese modelo; sus estandartes no cuentan como trofeo; un personaje Peasantry solo puede unirse a unidades Peasantry.
**Peasant's Duty (Sergeant-at-Arms)**: el personaje y su unidad pueden Give Ground en vez de Fall Back in Good Order; no hacen Panic test si una unidad Levies propia se rompe/huye a ≤6"; las unidades Levies propias en su Command range pueden repetir un Panic test fallido (si no huye).
**Aura of the Lady**: la unidad a la que se une gana Magical Attacks. **Shield of the Lady**: si se une a una unidad con Unit Strength ≥10 y con Chivalrous Vow, puede retirarse a la retaguardia (no ataca ni es atacada, pero da Ld/reglas y lanza hechizos).
**Living Saints (Grail Knights)**: cada modelo puede lanzar y aceptar desafíos como un personaje.
**Dispersed Formation (Pegasus Knights)**: en Skirmish cada modelo debe estar a ≤2" de otro de la unidad (en vez de 1").
**Chivalrous Vows (p.108)**
- **Knight's Vow**: sin Panic test si una unidad Peasantry propia es destruida a ≤6" o huye a través de ella. Una unidad con este Vow no puede ser unida por un personaje Peasantry; un personaje con este Vow no puede unirse a unidad Peasantry.
- **Questing Vow**: **Stubborn**; repite Fear, Panic y Terror fallidos; sin Panic test por Peasantry (igual que Knight's Vow); **no puede llevar lanza** (mundana ni mágica). Unidad con este Vow no puede ser unida por personajes con Knight's Vow o Peasantry; el personaje no puede unirse a Peasantry.
- **Grail Vow**: **Immune to Psychology, Magical Attacks, Stubborn**; siempre disfruta de Blessings of the Lady sin rezar; **no puede rechazar desafíos**. Solo puede ser unida por personaje con Grail Vow o una Handmaiden of the Lady; el personaje no puede unirse a Peasantry.
- **Exile's Vow (AJ p.31)**: Stubborn y Veteran; sin Panic test por unidades Levies/Peasantry propias (igual que Knight's Vow). **Crusader's Vow (AJ p.33)**: Veteran; sin Panic test por Peasantry; no puede ser unida por personajes Peasantry ni unirse a ellos.
- **Crusader's Zeal (Errantry Crusade)**: +1" al rango máximo de carga, +1 a la tirada de Charge, y gana Impetuous. **Earn Your Spurs**: estandarte capturado por Knights Errant vale 100 VP; Knights Errant a ≤6" de modelo con Grail Vow o de cualquier Lord of Bretonnia repiten To Hit natural 1.
- **Banished Lords / Reclaimed Glory (Exiles, AJ p.31)**: ver sec. 1; no pueden rezar al inicio, pero una unidad con Blessings que haga overrun / contacte un enemigo huyendo en carga o persecución la obtiene como si hubiera rezado, y un personaje con Blessings que mate a un personaje enemigo en desafío la obtiene (él y su unidad); si se pierde, no se recupera.

### Lore of the Lady (p.109; Wizard con "Lore of the Lady": al descartar un hechizo generado puede tomar la signature de su Lore o uno de estos)
| Hechizo | Tipo | Cast Value | Rango | Efecto |
|---|---|---|---|---|
| **The Lady's Gift** | Enchantment | 7+ / 10+ | 12" | Remains in Play. Con resultado ≥7 la unidad amiga objetivo gana **Regeneration (6+)**; con ≥10 gana **Regeneration (5+)**. Puede apuntar a una unidad en combate |
| **The Lady's Wrath** | Enchantment | 9+ | Self | Remains in Play. Mientras dure: el lanzador, su montura y la unidad a la que se ha unido ganan **+1 S** (máx. 10) y mejoran en 1 el AP de sus armas |
| **Burning Gaze** | Magic Missile | 10+ | 5D6" | Se traza línea recta de 5D6" desde el borde de la peana; todo modelo enemigo bajo ella sufre 1 impacto **S4 sin salvación de armadura** (Ward y Regeneration sí) |
- Lores base de las Handmaidens (Battle Magic, Elementalism, Illusion): hechizos en `spec_magic_special.md`. **Lady Élisse** (AJ p.41) usa Lore of Elementalism y puede descartar dos hechizos generados para tomar dos signature de Elementalism y/o Lore of the Lady.
- Objetos de hechizo AJ: Heart of the Wilds (+1 Casting en terreno natural), Diadem of Power (+1 Casting a Vortex/Magic Missile/Assailment, solo Crusade), Flamestrike Wand (Fireball Bound Power 3, solo Exiles).

## 8. Personajes nombrados y unidades de Armies of Infamy (AJ)
| Unidad (pág. AJ) | Pts | Tipo / base | M | WS | BS | S | T | W | I | A | Ld | Reglas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| The Green Knight (36) | 275 | Heavy cav (named) 30x60, cualquier lista | - | 7 | 3 | 4 | 4 | 4 | 6 | 4 | 9 | Aura of the Fay, Blessed Knight (Ward 5+), Ethereal, Guardian of the Sacred Sites, Immune to Psychology, Loner, Move through Cover, Rallying Cry, Terror, Unbreakable, Unstable. Arma: Dolorous Blade (Rapid strikes: Combat S, AP-1, Extra Attacks (D6), Magical Attacks; Deadly blows: S+2, AP-1, Armour Bane (1), Magical Attacks, Multiple Wounds (2)). Shadow Steed M8 WS4 S4 I4 A1. No se despliega: se despierta con D6 3+ (auto en ronda 5); al morir, vuelve con -1 al dado y -1 W |
| Sir Cecil Gastonne (39) | 165 | Regular infantry (named) 25x25, Baron | 4 | 7 | 3 | 4 | 4 | 3 | 5 | 4 | 9 | Blessings of the Lady, Rallying Cry, The Wyrm Slayer (Terror tras matar monstruo), Exile's Vow; Sorrow's End (S+1, AP-1, Magical Attacks, Monster Slayer, Multiple Wounds (2)); Dragonhide Cloak (AP de armas no mágicas -2; inmune a Killing Blow y Multiple Wounds; Ward 3+ vs Flaming); heavy armour + shield |
| Lady Élisse Duchaard (41) | 225 | Monstrous cav (named) 40x60, Prophetess Nivel 3 | - | 4 | 3 | 3 | 4 | 5 | 3 | 2 | 8 | Arcane Backlash, Armour Bane (2, solo Ariandir), Armoured Hide (1), Aura of the Lady, Beguiling Aura, Blessings of the Lady, Counter Charge, Lore of the Lady, Magical Attacks, Magic Resistance (-2), Shield of the Lady, Stomp Attacks (1), Swiftstride; Chalice of Brionne (-2 Ld a personajes enemigos en su Command range para reglas con test de Ld), Staff of the Elements. Ariandir M10 WS4 S4 I5 A2 |
| Outcast Wizard (42) | 45 | Regular infantry (character) 25x25 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 1 | 7 | Nivel 1 (+30 N2, +60 N3), Lores: Battle Magic, Daemonology, Dark Magic, Elementalism, Illusion, Necromancy; Warhorse +12; objetos 75; Magical Attacks, Magic Resistance (-1), Untutored Arcanist (Miscast: tira D6 extra y descarta el mayor) |
| Yeoman Guard (43) | 5 | Regular infantry, 10+ | 4 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 6 | mano + ligera + escudo (5+); toda la unidad: halberds gratis / polearms +1 / thrusting spears gratis; Warden +6 (A2), Grail Monk +7, estandarte +6, músico +6, estandarte mágico 25; Close Order, Horde, Peasantry, Shieldwall, **Veteran**, Warband |
| Border Princes Brigands (44) | 4 | Regular infantry, 10+ | 4 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 6 | mano + ligera; additional hand weapon +2 o escudo +1; pistol +2 / blunderbuss +4 (12", S3, AP-1, Multiple Shots (D3), Volley Fire) / crossbow +3; Desperado +7 (A2, Ld7), estandarte +5, músico +5; Horde, Impetuous, Levies, Motley Crew, Open Order, Warband |
- El AJ no cambia los perfiles/puntos de FoF.

## 9. Lista de ejemplo, 1.000 pts (Grand Army, 996 pts)
| Categoría | Unidad | Detalle | Pts |
|---|---|---|---|
| Character (General) | Baron | mano, pesada, escudo +2, lanza +4, Bretonnian Warhorse +16, Knight's Vow | 122 |
| Character | Paladin (Battle Standard Bearer, 0 pts) | escudo +2, lanza +4, Bretonnian Warhorse +16, Knight's Vow | 82 |
| Character | Damsel Nivel 1 (Battle Magic o Elementalism) | a pie | 60 |
| Core | 6 Knights of the Realm (montados) | 6x24 = 144 + First Knight 7 + estandarte 7 + músico 7 | 165 |
| Core | 5 Knights Errant | 5x19 = 95 + Gallant 6 | 101 |
| Core | 18 Men-at-Arms | 18x4 = 72 + Yeoman 7 + estandarte 5 + músico 5 | 89 |
| Core | 15 Peasant Bowmen | 15x5 | 75 |
| Special | 5 Questing Knights | 5x26 = 130 + Paragon 7 | 137 |
| Special | 3 Pegasus Knights | 3x55 | 165 |
| **Total** | | | **996** |
- Porcentajes: Characters 264 (26,5%) ≤50%; Core 430 (43,2%) ≥25%; Special 302 (30,3%) ≤50%; Rare 0%. 1 unidad de Knights Errant para 1 unidad de Knights of the Realm (límite 0-1 por unidad cumplido). 6 unidades no personaje (mín. 3); 1 Baron por 1.000 pts; Paladin BSB gratis. Sobran 4 pts.

## 10. Datos que faltan o son dudosos
1. El AJ adjunto **no contiene** la lista principal; los datos core salen de `fof.txt` (FoF). Páginas impresas exactas de cada entrada del army list de FoF no se citan (solo las que el propio libro referencia).
2. Mercenaries (20%): no se nombran unidades. Errantry/Exiles: sus mercenarios se nombran en el AJ (Empire list).
3. Tamaño máximo de unidad: no impreso salvo Battle Pilgrims 5-30.
4. Battle Pilgrims: no se listan champion/estandarte/músico.
5. Opciones de equipo: Knights Errant/Pegasus Knights sin objetos de champion listados.
6. AV de montura con barding para Wizards (†): barding de la montura mejora el AV del jinete según [core]; no hay línea que lo confirme para Handmaidens.
7. Lista de ejemplo: suma comprobada 264 + 430 + 302 = 996.
