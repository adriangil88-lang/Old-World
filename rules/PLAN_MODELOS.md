# Plan: modelos individuales (heridas, armas, armadura, montura y campeón por modelo)

Estado de partida: la unidad lleva `u.wounds` (reserva común) y `u.models = ceil(wounds / W)`. Montura fundida con jinete; campeón = bandera `u.champ`; perfil de unidad único.

Objetivo (frase a frase, FAQ > libro): cerrar F2-045, filas 18/49/54 (faq_core_3), C4-110, F28, F44, R15, RQ16, F62, C5-046, C5-061.

Fases (cada una: código mínimo + test dirigido + pw + ask_test + 2 smokes 44/0 + TSV + VERIFICACION):
- A. Reserva del campeón: `u.champW` (heridas restantes del campeón) separada de la reserva de tropa; los ataques dirigidos/pisotones del desafío usan el campeón; fuera de desafío nunca es objetivo salvo orden FAQ (filas 18, 49).
- B. Orden de asignación de heridas (F2-045): Golpe letal/Matamonstruos -> Heridas múltiples -> simples sobre la reserva con modelos parcialmente heridos (`u.partial`: heridas perdidas del modelo en curso); exceso se pierde.
- C. Montura propia del personaje: perfil de montura aparte (HA, T, heridas) con efectos de Virtudes/Honores/Dones/Marca que no la afectan (F28, F44, R15, RQ16, F62).
- D. Composición por modelo para Variopinto/Tripulación mixta: lista de `{tipo, armas, arm}` y mayoría/empate (C4-110, fila 54).
- E. Perfil de dotación de máquinas (C5-046, FC4-26) cuando haya datos legibles.
Bloqueos de datos: ver recuento (Westerland, Cultos, Combined Arms).
