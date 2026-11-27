# Recuento frase por frase (v716) — Core + FAQ

Método: 13 lectores de solo lectura recorrieron cada fuente cláusula a cláusula y contrastaron con rules.js/data.js. Detalle por fila en rules/recuento/*.tsv.
% exacto = OK / (OK+PARCIAL+AUSENTE). % ponderado = (OK + ½·PARCIAL) / (OK+PARCIAL+AUSENTE). NA (ambientación, mesa física) excluido.

| Fuente | OK | PARCIAL | AUSENTE | NA | % exacto | % ponderado |
|---|---|---|---|---|---|---|
| Core Rulebook (core_1..8) | 558 | 237 | 91 | 48 | 63,0 | 76,4 |
| FAQ Core (faq_core_1..4) | 157 | 91 | 46 | 11 | 53,4 | 68,9 |
| FAQ libros (FoF, RH) | 126 | 47 | 19 | 6 | 65,6 | 77,9 |
| **Global** | 841 | 375 | 156 | 65 | **61,3** | **75,0** |

Límites: no incluye libros de facción ni Cathay/Chaos Cults; algunas filas OK se apoyan en lectura de data.js; las referencias de línea son aproximadas.

## Huecos transversales (prioridad)
1. Estupidez: motor sigue regla antigua (avanza); FAQ: no mueve/dispara/lanza/dispersa y Aguanta.
2. Elección del jugador decidida por el motor: Evasiva, Swiftstride, arma con dos armas de mano, ráfaga repetidor, dispersión (quién/cuál), firma, asalto, pociones/pergaminos, reparto de ataques, desafíos.
3. Magia: Traslado/Conveyance solo en Estrategia; Disfunción 10-12; Superado en el Arte al dispersar ligado; fin voluntario de Remains in Play; Mano de Mork/Gork, Tempestad, Escudo Hechicero, Moneda del Pagador ausentes; Pilar de Fuego F3/AP-2; plantillas sin tirada p.95.
4. Cargas: contacto accidental, Unable to Align, reacciones simultáneas, Impactos en 1.1, reforma al reagrupar/arrollar/ceder, Columna de Marcha declara carga.
5. Máquinas: pivote previo al disparo, Crunch, Large Target, seguimiento.
6. Personajes unidos: destroy() los mata siempre, M del más lento, loneProtected, Press of Battle.
7. Elementos especiales del Core, aliados, rendición, batallas enlazadas (Surprise Encounter, Dark Monolith, Heroic Last Stand), Gisoreux (duración aleatoria, bordes).
8. Libros: Steam Tank (steamP en carga, metralla), Hewer D3 único, Deathblow+Slayer, Anvil +3, Horde Estatales, armas «solo cargados», Dark Coven, Polearm, Shield of the Lady, Giant Slayers, Marauders, alabarda FP-3.

## Recuento v732 (tras la ronda de implementación completa)

Método: igual que v716 (% exacto = OK / (OK+PARCIAL+AUSENTE); % ponderado = (OK + ½·PARCIAL) / (OK+PARCIAL+AUSENTE); NA excluido), pero **ahora incluye los 19 libros de facción** (rules/recuento2/*.tsv) y Dawn/Renegade/escenarios.
AVISO: los estados OK de esta tabla los han fijado los propios implementadores al corregir cada fila; no los ha vuelto a contrastar un lector independiente. Las cifras son una cota superior hasta que se haga un segundo recuento ciego.

| Bloque | OK | PARCIAL | AUSENTE | NA | % exacto | % ponderado |
|---|---|---|---|---|---|---|
| Core + FAQ (rules/recuento) | 1251 | 104 | 17 | 65 | 91,2 | 95,0 |
| Libros de facción + Dawn (rules/recuento2) | 3596 | 70 | 16 | 95 | 97,7 | 98,6 |
| **Global** | 4847 | 174 | 33 | 160 | **95,9** | **97,6** |

Comparación: v716 Core+FAQ 61,3 % exacto / 75,0 % ponderado (sin libros); antes de esta ronda, libros 68,2 % / 80,6 %.

Lo que queda (174 PARCIAL + 33 AUSENTE), por causa:
- Sin texto fuente en rules/new: Chaos Cults (R04, R09, R10, R40, R41), Peregrinos (F24), Giant Slayers (Q04), perfil del Comandante Ingeniero (Q14), Banner of the King, Timmm-berrr, Aura/Escudo de la Dama, perfil de Razorgors, lista de mercenarios de varios libros, Aspirante montado (Ravening Hordes).
- Límites del modelo del motor (bloques, sin modelos individuales ni perfil separado jinete/montura/dotación): posiciones de personajes en la unidad, coherencia de escaramuzadores, plantillas por modelo, Golpear primero solo del jinete, WS/I de la dotación, Howdah.
- Pendientes de implementación: recompensas entre batallas enlazadas Dawn (059, 071, 072, 081, 082), Leonen/Hollum prev, tesoros Dawn 113-125, editor de la segunda lista defensora, multijugador.

### Verificación ciega v732 (muestra de 1.000 filas OK, 20 lectores independientes)

Cada lector releyó la fuente y el código sin fiarse de la marca OK (rules/verif/in_NN.tsv → out_NN.tsv). Resultado sobre las 1.000 filas: CONFIRMA 791, PARCIAL 202, AUSENTE 3, NO_VERIFICABLE 4 → **precisión de las marcas OK = 79,4 %** (791/996).
Las 205 filas no confirmadas se han devuelto a PARCIAL/AUSENTE en los TSV (nota «VERIF v732: motivo»).

Extrapolación al resto de filas OK no muestreadas (3.847), asumiendo la misma precisión: ≈ 3.846 filas realmente OK sobre 5.054 → **≈ 76 % exacto, ≈ 87,5 % ponderado** (en lugar del 95,9 % / 97,6 % de la tabla anterior, que era una cota superior). Las 3.847 filas no muestreadas siguen sin verificar una a una; ≈ 780 de ellas serían PARCIAL.
