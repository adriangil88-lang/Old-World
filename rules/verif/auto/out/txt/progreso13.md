# progreso13 (v843b) — facciones extraídas (.7z) y figuras

Estado: lote por facción. Herramientas en /tmp/w (fetch.py extrae SOLO los ficheros que cita el JSON de la facción, de uno en uno, y se borra tras cada lote; inv.py inventaría figuras; match.py compara con xp/xh/xu por caja y nº de triángulos; texfix.py repone texturas planas; addfig.py añade figuras OBJ/AB nuevas; rmfig.py las retira).

## Hallazgo de fondo
- Los 28 .7z "nuevos" (12 en attachments + 16 en uploads) son las cachés de TTS de los mods "X - Models - Warhammer The Old World" (OBJ, JPG/PNG, unity3d) y un Workshop con 138 JSON (397e3e54-3464050043.7z). 26 de 28 coinciden fichero a fichero (nombre y tamaño) con otros .7z de uploads ya entregados antes; solo el de JSON trae 150 ficheros nuevos (JSON de otros mods: Kill Team, Star Wars, Blood Bowl…, no usados aquí) y 14+1+2+2+1 imágenes sueltas sin relación con Old World.
- Los .7z de "guerreros_caos" (3) contienen en realidad el mod "Daemon of Chaos - Models" (22 unity3d + 111 OBJ + 119 imágenes), no el de Guerreros del Caos; las mallas/texturas de Guerreros del Caos (JSON 2427016876) están repartidas en .7z de uploads anteriores y se han usado desde ahí.
- Las mallas que ya estaban en el juego (xp/xh/xu) coinciden exactamente con las fuentes (mismos triángulos): DE 24/24, SK 23/23, VC 29/29, OK 29/29, TK 29/29, BRET 9/9, CD 26/26, ORCS 34/34, WoC 9/9 (xu = bruto salvo tope de 120 000 y 65 000 vértices/parte). No había figuras "peores" que sustituir, salvo las listadas abajo.
- Fallo real encontrado: 24 modelos (8 paquetes) tenían como textura un color plano de 32×32 (placeholder col_*), sin versión HD → figuras lisas. Corregido con las texturas originales.

## Lote por facción (qué había / qué se hizo)
(ver tabla en VERIFICACION.md, sección "## v843b")

| Facción | Había | Se añadió / mejoró |
|---|---|---|
| Elfos Oscuros (DE) | 24 figuras = fuente exacta; 10 con textura plana | 10 texturas repuestas; +de_sorceress_pegasus, +de_supreme_pegasus; Dreadlord/Maestro a pie, carros, Caldero, Santuario, Jinetes Oscuros: unity3d sin textura (sin fuente) |
| Skaven | 23 = fuente; 5 planas | 5 texturas; +sk_packmaster, sk_greyseer, sk_doomflayer; Warpfire/Windmortar/Plague Furnace: cubo de 44 tri (sin fuente) |
| Enanos del Caos | 26 = fuente; 1 plana | cd_guard; +cd_sneakygits; cd_rocket (solo ligero) → xh/xu; Lammasu: sin fuente |
| Reinos Ogros | 29 = fuente | textura de ok_slaughter_cauldron; nada más |
| Condes Vampiros | 29 = fuente; 2 planas; vc_count_terror solo ligero | +vc_thrall, vc_thrall_coven, vc_ghoulking, vc_vargheists; vc_count_terror → xh/xu; Terrorgheist/Rey Ghoul-Terror/Murciélagos: sin fuente |
| Enanos | 6 xp + REALM antiguos | +dw_flame, dw_cart, dw_rangers (24k→31k); Ingeniero (5 variantes, ambiguo), Carro Minero (sin fuente); REALM antiguos sin cambio (cajas no comparables) |
| Reyes Funerarios | 29 = fuente | nada que cambiar |
| Bretonianos | 9 = fuente; br_sergeant plana | br_sergeant; +br_elisse |
| Hombres Bestia | 17 = fuente; bm_centigors plana | bm_centigors; +bm_preyton, bm_gspawn (alias de los 4 _k/_n/_s/_t y de woc_gspawn*); Arpías: sin fuente |
| "Guerreros del Caos" (Demonios en los .7z) | WoC 9 = fuente; DM 31 = fuente | +woc_spawn (+4 variantes por alias), woc_hellcannon; DM: 3 texturas planas repuestas |
| Orcos | 34 = fuente | +spider_riders, squig_hoppers, arachnarok (xu 59 991 de 70 726: tope 65 000 vértices), gob_warboss_spider, gob_bigboss_spider |

## Tamaños finales
- dist/artifact.html 16 228 806 B (límite 16 777 216; quedan 0,5 MB).
- dist/viejo-mundo-pwa.zip 699 634 894 B (máxima calidad: xp + xh + xu + xt + texturas 4096 px).
- dist/artifact-files/hd (soporte del artefacto: xp + xh + xt, calidad adecuada): 300 ficheros, 181 MB (límite 511 ficheros / 256 MB).
## Comprobaciones
build.py ok · pw.js errors [] · ask_test.mjs ok · behavior/run.sh: 1892/1892 · renders con rasterizador propio (antes/después) en shots/v843b/. Captura Playwright de la partida en 3D: no completada (WebGL por software se cuelga al cargar 3D en este entorno).
