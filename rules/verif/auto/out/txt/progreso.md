# Progreso — auditoría de textos de efecto (v826)

Formato: bloque · entradas revisadas · cambios (fuente) · pendientes.

## t0 (60 items: Battle March + Cathay)
- Revisadas 60. Fuentes: battlemarch.txt:2780-2965, cathay_dawn.txt:1199-1395, cathay_aj.txt:2593-2800, faq_cathay.txt.
- Cambios: ct_warbird (Armadura del Pájaro Guerrero) ahora restringida a infantería (infOnly+regHv; cathay_aj.txt:2652 «regular infantry or heavy infantry only»; antes no se validaba).
- Conformes: FAQ Cathay aplicadas (Wei-Jin 60, Icono 45 + chequeo Ld, Ojo del Dragón 4+, Maw 50, Máscara NP1, Anillo de Azabache NP1, Sello 35, Bombas de fuego F3).
- Pendientes: ninguno.

## t1 (60 items: comunes Core, Elfos Silvanos, Imperio, Bretonia)
- Revisadas 60. Fuentes: core.txt:10920-11200, faq_core.txt:314-326 y 919-984, fof.txt:3035-3150 (Imperio), 5667-5790 (Elfos Silvanos), 4241 (Bretonia).
- Cambios:
  - dragonslayer (Dragon Slaying Sword, core.txt:10941): tenía «repite heridas contra monstruos»; el libro da la regla Matamonstruos (core.txt:5579). rules.js: `i.slay` activa ahora el Golpe Matamonstruos (slayM). Arregla también heaj_woodsman (Hacha del Leñador, aj_highelves.txt:1636 «Monster Slayer»).
  - b_gleaming (Pendón Reluciente, fof.txt:3108): solo servía para Reagrupar; el libro: «re-roll a single failed Leadership test» (no Ruptura). Nuevo helper gleamRR en Miedo, Terror/psicología, Pánico, Estupidez (y Reagrupar ya existente), con aviso.
  - familiar / staff (Wizard's Familiar / Wizard's Staff, fof.txt:3133-3150): son objetos del Imperio; añadido fac:'empire' (antes los podía comprar cualquier ejército).
  - blades_loec (fof.txt:5676): +D3 Ataques real (nuevo campo aRoll, tirada al atacar) en vez de +2 fijo; requiere dos manos.
  - helm_hunt (fof.txt:5720): +1 HA además de +1 A el turno en que carga (nuevo chWS).
- Conformes: FAQ Core (Hoja de Ogro 75, Hoja Berserker Impetuoso +1A, Yelmo Deslumbrante solo inf/cab), Piedras de Obsidiana (FAQ: no mejoran otra RM).
- Pendientes: silver_horn — repite el D6 de Zancada automáticamente si sale ≤3 (decisión del jugador sin preguntar).

## t2 (60 items: Bretonia, Orcos y Goblins, Imperio, comunes, TK, Hombres Bestia, runas enanas)
- Revisadas 60. Fuentes: fof.txt:4190-4305 (Bretonia), 3035-3115 (Imperio), 1350-1420 (runas), 396 (Piedra de juramento); rh.txt:1808-1965 (O&G), 4873-4935 (HB); core.txt:11120-11135; faq_rh.txt:40-46, 186-195; faq_fof.txt.
- Cambios:
  - heartwood (Lanza de Duramen, Bretonia, fof.txt:4210) compartía clave con el Colgante de Duramen de los Elfos Silvanos y quedaba sobrescrita (no existía en el juego): renombrada a heartwood_lance.
  - b_imperial (fof.txt:3077): alcance = alcance de mando del portador (PEB 12", 18" si Grande) en vez de 12" fijo; texto corregido.
  - sword_heroes (fof.txt:4203): +Matamonstruos (slay). fracasse (fof.txt:4222): destruye el arma mágica del enemigo herido (breakW, como la Runa Maestra de Quebrar). sirienne (fof.txt:4280): solo infantería o caballería. b_errantry (fof.txt:4257): +Impetuoso.
  - last_waaagh (rh.txt:1810): +D6 Ataques reales (aRoll) con pérdida de la regla tras un 6 natural (al final de esa fase de Combate, con aviso) y requiere dos manos (antes +3 fijo).
  - pigstikka (rh.txt:1819 + faq_rh.txt:40): +1 Ataque por cada fila de la unidad enemiga el turno en que carga (faltaba).
  - b_raggedy (rh.txt:1858): +1 HA a la unidad (faltaba; solo tenía +1 RC).
  - bm_dark_heart (rh.txt:4902): se consume a elección del jugador en la subfase de Mando (acción 'drink', botón «Consumir», IA por valoración) en vez de automáticamente al inicio del turno.
- Conformes: FAQ RH (Pigstikka solo el turno de carga, 'Eadbuttin' 'At 0-1 por modelo, Amuleto Verde para no magos), runas (Matar Dragones solo behemot, Quebrar, Destierro, etc.), Piedra de juramento.
- Pendientes: helsturm / quest_sword — el perfil de dos armas se elige automáticamente según el enemigo; el libro dice que lo elige el jugador al inicio de cada ronda (requiere pregunta dentro del cálculo del perfil de ataque).

## t3 (60 items: Grandes Nombres ogros, Poder vampírico, runas enanas, Honores y objetos altos elfos)
- Revisadas 60. Fuentes: leg_ogres.txt:787-818, leg_vampires.txt:1001, fof.txt:1420-1595 (runas), 7140-7375 (Altos Elfos).
- Cambios:
  - r_luck (Rune of Luck, fof.txt:1484): también repite una tirada fallida para impactar o herir (antes solo armadura); pregunta al jugador (askH «Runa de la Suerte»), un uso por runa compartido con la salvación.
  - he_white_sword (fof.txt:7234): +Matamonstruos, requiere dos manos; se permite en carro («infantry or chariot only»: nuevo orChariot en el filtro de main.js).
  - he_cloak_beards (fof.txt:7330): ningún otro modelo puede usar el Liderazgo del portador (noLd para la unidad y noLdAny para Presencia inspiradora del General).
- Conformes: Grandes Nombres, Acólito Oscuro, runas de arma/armadura/talismán/estandarte/ingeniería, Honores (Ungido: Veterano engloba Valor de los Eones), Hoja del Oro Saltarín, Perdición del Enemigo, Armadura de Caledor, Yelmo Dragón, Capa del Maestro del Saber, Ópalo, Semilla.
- Pendientes: he_null_stone — falta la 2.ª parte (subfase de Mando, chequeo de Ld: hasta tu próximo Inicio de turno el portador no puede ser objetivo de hechizos y es inmune a sus efectos); requiere inmunidad por modelo dentro de la unidad.

## t4 (60 items: Altos Elfos, Hombres Bestia, Mutaciones, Guerreros del Caos y Dones, Reyes Funerarios, AJ TK)
- Revisadas 60. Fuentes: fof.txt:7300-7375; rh.txt:4769-4935 (HB), 3298-3460 (GdC), 6508-6625 (TK); aj_tk2.txt:1358-1395; faq_rh.txt:60-85.
- Cambios:
  - bm_primeval (rh.txt:4832): +Odio (Imperio) (hatredFac).
  - woc_crimson, woc_pendant (rh.txt:3418, 3447): solo infantería o caballería. woc_familiar (rh.txt:3470): 0-1 por Mago. woc_skull: texto (+1 también a los Magos a 3", ya implementado).
  - gf_ichor (Icor ácido, rh.txt:3333): solo las Heridas perdidas durante un desafío (antes en cualquier combate).
  - tk_rulership (Icono del Gobierno, rh.txt:6600): dobla la Fuerza de Unidad (3→6) en usOf y sus Impactos son mágicos (antes solo FP −2).
  - tkaj_antarhak (aj_tk2.txt:1365): recupera una Herida por cada Herida que pierde el enemigo (antes 1 por ataque).
  - tk_dunes, tkaj_phakth: «infantry only» ahora se valida (infOnly; footOnly solo se comprobaba en Linajes).
  - Requiere dos manos (twoH) en tk_destroyer, tk_crook, tk_flail, tk_serpent.
- Conformes FAQ RH: Esplendor diabólico y Aura encantadora solo inf/cab, Mayal de Calaveras F+3 solo contra los cargados, Armadura de las Eras inf/cab/carro.
- Pendientes: woc_daemonsword — los 1 naturales para impactar golpean a la propia unidad (o al portador): no implementado. tk_destroyer — ataque «Segador» opcional (D6 impactos automáticos): no implementado.

## t5 (60 items: AJ Reyes Funerarios, AJ Guerreros del Caos, AJ Hombres Bestia, AJ Imperio)
- Revisadas 60 (texto contra aj_tk2.txt:1358-1500, aj_chaos2.txt:1606-1700, aj_beasts2/aj_empire2.txt:1576-1700; FAQ RH/FoF de los AJ).
- Cambios:
  - wocaj_platemail (aj_chaos2.txt:1644): solo infantería o caballería (infCavOnly).
  - empaj_pearl, empaj_hammer: requieren dos manos (twoH).
  - General: el «Models whose troop type is ‘infantry’ only» marcado como footOnly fuera de los Linajes no se validaba (wocaj_scourge, wocaj_bloodskull, lml_feathers, vcl_p_flying, cloak_leaves, tk_dunes, tkaj_phakth): ahora se valida igual que infOnly (data.js armyIssues y filtro de main.js).
- Conformes FAQ: Estandarte de la Luna Distorsionada «un solo uso», Arcabuz de Von Trickschotte con Ataques mágicos (ARQUEBUS.magical), Martillo de Rectitud, Hoja de Acero Plateado y Escudo de la Gorgona solo Órdenes de Caballería.
- Pendientes: tkaj_winds — «infantry only» de un estandarte de unidad no se valida.

## t6 (60 items: AJ Imperio, AJ Bretonia, AJ Altos Elfos, tatuajes y runas de ingeniero enanas, Enanos del Caos)
- Revisadas 60 (aj_empire2.txt:1576-1720, aj_bretonnia.txt, aj_highelves.txt:1629-1760, aj_dwarfs2.txt; faq_fof.txt:183 Anillo de Furia NP1).
- Cambios:
  - heaj_fury (Ring of Fury, aj_highelves.txt:1737): objeto hechizado para cualquier personaje (quitado wiz:true; NP 1 por FAQ ya aplicado). Igual: ct_mask, ct_ringjet (cathay), wocaj_rod (aj_chaos2.txt:1692) — eran «solo magos» sin que el libro lo diga.
  - ring_ruin (Ruby Ring of Ruin, core.txt:11143 + faq_core.txt:287): categoría Objeto hechizado (estaba como arcano); texto: Bola de Fuego atado NP 1.
  - heaj_stars (aj_highelves.txt:1683): solo infantería o caballería. heaj_starlance (aj_highelves.txt:1660): solo caballería o monstruo (needMount).
- Conformes: resto (Lanza del Cruzado, Hacha de la Frontera, Armadura Ungida, Diadema de Atrazar, tatuajes, runas de ingeniero, Martillo Negro de Hashut).
- Pendientes: ninguno nuevo.

## t7 (60 items: Legends Enanos del Caos, Demonios del Caos, Elfos Oscuros)
- Revisadas 60 (leg_chaosdwarfs.txt, leg_daemons.txt:1085-1290, leg_darkelves.txt; sin FAQ para Legends).
- Comprobación cruzada automática texto↔banderas en todos los ITEMS (scratchpad cons.mjs): «requiere dos manos», «solo infantería/caballería», «0-1».
- Cambios:
  - twoH (requiere dos manos) en ct_reason, tkaj_phakth, tkaj_aeons, bmaj_khorgor, heaj_woodsman, okl_thunder.
  - del_blood, vcl_accursed (leg_vampires.txt:1071): solo infantería o caballería. skl_fell (leg_skaven.txt:869): solo personajes de infantería.
  - wocaj_barding (aj_chaos2.txt:1705): solo tipo caballería (nueva bandera cavOnly con su validación).
  - familiar (Wizard's Familiar): 0-1 por Mago (zeroOne).
- Conformes: Legends Demonios (Muchos Brazos, Túnicas, Infestación de Nurglings, Canto de Sirena, Bastón del Cambio, Voluntad de Tzeentch, Icono de Hechicería…), Enanos del Caos y Elfos Oscuros revisados por texto.
- Pendientes: ninguno nuevo.

## t8 (60 items: Legends Elfos Oscuros, Hombres Lagarto, Reinos Ogros, Skaven)
- Revisadas 60 (leg_darkelves.txt:940-1010, leg_lizardmen.txt:780-860, leg_ogres.txt:840-930, leg_skaven.txt:860-900).
- Cambios: ninguno adicional (del_blood «solo infantería o caballería» confirmado en leg_darkelves.txt:975; skl_fell ya corregido en t7).
- Pendientes: ninguno nuevo.

## t9 (60 items: Legends Skaven y Condes Vampiro, AJ Orcos y Goblins, AJ Elfos Silvanos)
- Revisadas 60 (leg_skaven.txt, leg_vampires.txt:1000-1100, aj_orcs2.txt:1402-1520, aj_wood2.txt:1573-1640; faq_rh.txt:106 Da Akrit Axe, faq_rh.txt:237 Ídolo de Gork).
- Cambios:
  - buzgob (Bastón Nudoso de Buzgob, rh.txt:1918): sumaba +3" al alcance de los hechizos porque compartía bandera con el Ídolo de Gork; ahora el +3" solo con aj_idol_gork (nuevo idolGork) y nunca al aura de un hechizo Personal (FAQ RH).
  - aj_bigger_axe, aj_martog (aj_orcs2.txt:1402-1418): requieren dos manos; textos (mágica). aj_backstabber: texto con las repeticiones por flanco/retaguardia (ya implementadas).
- Conformes: Da Akrit Axe (F solo contra los cargados, FAQ), Armadura Dead 'Ard, Escudo Rencoroso, Estandarte de la Araña, Ira de Vaul, Segadora de Daith, Poderes vampíricos.
- Pendientes: ninguno nuevo.

## t10 (60 items: AJ Elfos Silvanos, objetos comunes de RH (HB/GdC/TK), flechas, AJ Bretonia/Imperio genéricos, Duendes y Linajes)
- Revisadas 60 (aj_wood2.txt, rh.txt:4900-4935, 3440-3475, 6580-6625, fof.txt:5745-5765; faq_rh.txt:74-78 Títere Infernal 15", 226-231 Fetiche del Árbol Bruja no afecta a hechizos atados, 250-256 Cáliz de la Plaga; faq_fof.txt:323 Linaje de Jinetes Salvajes + yelmo).
- Cambios: ninguno (Títere 15", Fetiche excluye hechizos atados y Cáliz ya conformes).
- Pendientes: favour_gods — la repetición del D6 de la Mirada de los Dioses se aplica sola con un 1 (debería preguntarse al jugador).

## t11 (38 items + 22 hechizos: Virtudes, pociones, pergaminos, objetos ligados; Magia de Batalla, ¡Waaagh!, Dama)
- Revisadas 60 (fof.txt:4120-4190 Virtudes; core.txt:11100-11200 objetos comunes, 10128-10185 Magia de Batalla, 10765-10830 ¡Waaagh!; faq_core.txt:268-305).
- Cambios:
  - Retirados 4 objetos duplicados sin respaldo (bloque Object.assign al final de data.js): rod_damned (hechizo inventado 2D6 F4; el bueno es wocaj_rod = La Invocación), twice_blessed (inventado; el bueno es empaj_twice = Mano de Martillo), ring_taal (efecto distinto al libro; el bueno es empaj_taal = Escudo de Roble), ring_fury de Elfos Oscuros (no existe en leg_darkelves.txt).
  - Pociones (core.txt:11120-11140): texto «en la subfase de Mando de su turno; una poción por fase; no afecta a la montura» (decía «al inicio de tu turno»; la mecánica ya era la acción 'drink').
  - power_scroll / dispel_scroll: texto con la regla del doble 1 (ya implementada en roll3Best).
  - cowardly_flight (Maldición de la Huida Cobarde, core.txt:10165 + FAQ VL 8+): era «si falla, Cede terreno» siempre; ahora chequeo de Pánico real (passPanic → huye o retrocede en buen orden) y solo Cede terreno si la unidad supera automáticamente los Pánicos; las unidades trabadas o huyendo no chequean (core.txt:5152).
  - Textos: pillar_fire (se dispersa en cada Inicio de turno, FAQ), evil_sun y ere_we_go (alcance de mando del lanzador, ya implementado con commandRange), fist_gork (plantilla 5" que se desvía D3+1", amigo o enemigo), bad_moon.
- Conformes: Virtudes, Pergamino de Transmogrificación, Hechizos de Batalla (VL FAQ), Mano de Gork, Mirada Vengativa, Pie de Gork (FAQ).

## t12 (60 hechizos: Yin/Yang, Elementalismo, Ilusión, Nehekhara, Caos, Bestias, Yunque, Ataúd, Nigromancia, Gork/Mork, Troll, Alta Magia)
- Revisados 60 contra core.txt:10365-10730 (Elementalismo, Alta Magia, Ilusión, Nigromancia) y faq_core.txt:227-305 (VL y efectos de vórtices), faq_fof.txt:15-25 (Yunque), faq_rh.txt:73-100 (Ataúd, Remolino Fétido), faq_cathay.txt.
- Cambios: elem_spirit (Invocar Espíritu Elemental): texto según FAQ Core p.327 (terreno difícil sin visión, se dispersa D6" en cada Inicio de turno; la mecánica vx.diff/nolos ya era la del FAQ).
- Conformes: todos los VL corregidos por FAQ (Espada Flamígera 7+, Murallas de Tierra 9+, Convocación Confusa 8+, Espejismo Miasmático 10+, Vórtice Espiritual 10+, Maldición de los Años 9+, Runa de Juramento y Acero 8+/11+…), Senda Mística (FAQ), Remolino Fétido (FAQ RH).

## t13–t14 (120 hechizos: Saberes de la Dama, Lo Salvaje, Athel Loren, Daemonología, Magia Oscura, Nigromancia, Alta Magia, Legends)
- Revisados 120 contra las entradas de FAQ de hechizos (faq_entries.json: VL y efectos) y los saberes de core.txt:10181-10560 / fof / aj_wood2.txt:1500-1560.
- Cambios:
  - spiteful_torrent (Torrente de Duendes, aj_wood2.txt:1537 + faq_fof.txt:170): terreno difícil (era peligroso); texto según FAQ (se dispersa en cada Inicio de turno; enemigos que la atraviesan).
  - coven (Aquelarre del Bosque Profundo, faq_fof.txt:106): texto según FAQ (hechizo al azar de Batalla/Elementalismo o el distintivo; ya implementado en createGame).
  - Aquelarre Oscuro (Hombres Bestia, Manada Salvaje; faq_rh.txt:133): eliminadas las Disfunciones por cualquier doble natural al lanzar y al dispersar (regla anterior a la errata); queda solo el doble 1 aplicado también a los Magos del aquelarre.
- Conformes: Vórtice del Caos (FAQ: difícil, D6", D6+1 F3 a cualquiera), VL FAQ de Daemonología (Corcel de las Sombras 8+, Recipiente Demoníaco 9+, Portal Infernal 9+), Nigromancia (Cábala Mortal 8+, Vórtice Espiritual 10+).

## t15–t21 (414 reglas especiales + 3 hechizos ligados)
- Revisión dirigida por FAQ: todas las entradas «Change the rule / entry / sentence» de faq_core/faq_fof/faq_rh/faq_cathay que afectan a reglas especiales (out/faq_entries.json) contrastadas con el texto de RULES y con el código de rules.js; además muestreo de las reglas del Core (core.txt:5300-5900).
- Ya conformes en el motor (FAQ aplicada): Runas de protección 6+ no mágicos, Hijas de la Eternidad 4+, Finta y esquiva, Nubes de hollín, Reprimir impetuosidad, Soltad a los Fanáticos en cualquier Inicio de turno, Escultor de piedra, Saber rúnico (24"/+3, 21"/+2, 18"/+1), Desenganche, Bombardeo de la Linterna (objetivo no trabado), Impetuoso (chequeo de Ld), Objetivo grande (+1 fila de disparo), Ataques envenenados (+2 a herir), Cuidadores de monstruos (1-4/5+), Movimiento de reserva, Estupidez, Aquelarre del Bosque Profundo.
- Cambios (texto de RULES desfasado respecto a la FAQ; la mecánica ya era la correcta): impetuous, large, regen, impact, warband, swiftstride, evasive, randMove, coven.
- Pendientes: el resto de textos de reglas de ejército no se ha cotejado frase a frase con los libros (solo FAQ y muestreo).

## Resumen v826
- Revisadas 1317 entradas (698 objetos, 205 hechizos, 414 reglas): t0–t12 entrada a entrada contra libro+FAQ; t13–t21 dirigidas por FAQ + muestreo.
- Corregidas 91 entradas (más 2 cambios generales de validación: footOnly fuera de Linajes y cavOnly). Pendientes 7.
- Build + /tmp/pw.js: errors: [] (tras t4, t13 y al final). /tmp/ask_test.mjs: sin errores.
