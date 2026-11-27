> **Histórico.** Lo pendiente vive ahora en `PENDIENTE_UNIFICADO.md`.

# TODO "sin aproximaciones" (orden del usuario 2026-11-12 20:47: "No hagas aproximaciones. Implementa todo tal y como dicen los libros y las FAQ")
Reglas de trabajo: NO publicar hasta que el usuario diga "Publica"; no avisar hasta acabar todo; tras cada lote: python3 build.py, node --check app/js/*.js, servidor `cd app && python3 -m http.server 8765` + python3 /tmp/chk5.py ([] True), node /tmp/legrun.mjs (ok 28 err 0), node /tmp/mix_t.mjs (sin ERR); reprogramar send_later.

## HECHO (v462+)
- Unidades mixtas reales: u.mix (modelos traseros), view front/rear, D(u) mixView, applyWounds por clase (mixPend), woundAndSave wrapper (disparo reparte por igual), attackProfile0 por clase, melee loop pasa front/rear, shooting rear, UI editor (mix stepper), render por modelo, coste exacto. Warherd (4 variantes), Primal Hounds + Ungor Ravager.
- Cathay objetos: brazen bz6, xenyang noRegenW, nangau hatredFac, mantle svShoot, banner impact1, xenwun, goldenlion rrPsy (lion()).

## PENDIENTE (en orden)
1. Cathay: quills (usar en combate, rr hit+wound solo jinete), fires (aliento 1 uso), compass, icon (noFly, sin test de Ld; arreglar texto), dragoneye (3+ elegir otro objetivo, arreglar 4+→3+), maw (doble natural => percance a 18" del portador), spirit lantern (repite 1 herir vs Daimónico/No muerto), scrolls/fengshi_l/seal/cloak po mei (spells extra + límite de lanzamientos = nivel), monkey (F10 fija: item setS), jade blade etc.
2. Cathay magia: Lore of Yang = constelación, gran bastión, 'Poder del Cielo y la Tierra' (9+/12+ self enchant: +1 HA y F, flamígero; 12+: unidades amigas en alcance de mando); Lore of Yin = Espíritus del Viento y la Sombra (hex 10+ 15" Movimiento aleatorio D6), Espejo Maldito (hex 9+ 15" engagedOk: 1 natural para impactar => impacto F3 FP-1 contra la propia unidad), Guerreros Ancestrales (asalto 7+/11+ 2D3 F2 / 2D6 F4 FP-1, Perforante(2)). storm_fury es solo de Miao Ying (Furia del Dragón de la Tormenta). Reglas especiales 'Lore of Yang/Yin' del mago (elige 1 al comprar) + Vientos: Yang +3" disipar y encantamientos, Yin +3" hex/proyectil; Vientos elegir +1M/+1I (Yang) o +1HA/+1Ld (Yin). Maestría de la Tormenta (Miao Ying descarta hasta 2 hechizos).
3. Objetos "(a mano)" restantes de AJs: tkaj_*, wocaj_*, bmaj_*, empaj_*, brsaj_*, heaj_*, aj_hagbrew (ver grep "(a mano)" en data.js líneas ~2400-2980).
4. Objetos Legends "(a mano)": okl_*, skl_*, dml_*, lml_*, vcl_*, tat_*, rw_*, del_*, cdl_*.
5. Reglas de unidad con "(a mano)" en data.js RULES (líneas ~100-130) y blurbs "aprox".
6. Aproximados: Goblin-Hewer ráfaga, Girocóptero ráfaga, Cañón Infernal tabla fallos, Chaos Spawn (movimiento/ataques aleatorios), Gors Deformes, Carro de Guerra Ogro, Carnosaurio Frenesí de sangre, Moondust...
7. Verificar FAQ Cathay (Sky Lantern T4 ya ok; Warhorse sin Primera Carga; Commander sin campeón; Disengage; Bombing Run; Cathayan Lance sólo carga; Dragon Fire Bombs F3).
8. (hecho)

## Estado v476
- Hecho: Carro de Guerra (armas exactas), Escamas Relucientes, Desenganche (FAQ), bombas Catay + Linterna Celeste, comentarios 'aprox' eliminados.
- Pendiente real: despliegue automático Stirhügel, Prophet Herdstone.

## Estado v488
- Hecho en esta tanda: Escaramuzadores por modelo (1"/2"/3"), dotaciones de máquinas, destacamentos en reserva/flanco/Stirhügel, Piedra de las Manadas, fuego indirecto + Ojo del Dragón, Evasión de personaje solitario.
- Pendiente conocido: Formación en Lanza: embotamiento si el modelo delantero no logra contacto, textos "(a mano)" de objetos listados arriba.

## Estado v490
- Embotamiento de la Lanza por falta de contacto del modelo delantero: implementado (la geometría de carga alinea el frente, así que rara vez se dispara).
- Textos "(a mano)" y blurbs "aprox": ya no quedan en data.js (0 coincidencias); las notas 3-5 de arriba están superadas.
- Pendiente real: ninguno de las listas anteriores.
