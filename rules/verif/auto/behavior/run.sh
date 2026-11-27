#!/usr/bin/env bash
# v835 — Arnés de pruebas de comportamiento del motor (un solo comando).
# Uso: rules/verif/auto/behavior/run.sh [filtro]
#  - copia el motor real (app/js) a .eng/ con los dados controlables (engine.mjs) y ejecuta tests/*.mjs
#  - escribe out/results.json y muestra el resumen: pruebas, pasan, fallan, no automatizables, cobertura del inventario de FAQ
set -u
cd "$(dirname "$0")"
#  --mutation [N] [filtro]: prueba de mutación (v842). Rompe a propósito el comportamiento relacionado (regla/objeto/hechizo/unidad/dados) en la copia .eng del motor
#    para N pruebas (300 por defecto) y comprueba que FALLAN; las que siguen pasando son aserciones vacías. Escribe out/mutation.json
if [ "${1:-}" = "--mutation" ]; then shift; node --max-old-space-size=5500 --experimental-vm-modules --no-warnings mutation.mjs "$@"; exit $?; fi
node run.mjs "$@"
st=$?
[ -z "${1:-}" ] && node srcov.mjs 2>/dev/null
node -e '
const r = JSON.parse(require("fs").readFileSync("out/results.json", "utf8"));
console.log(`Resumen: ${r.total} pruebas · ${r.pass} pasan · ${r.fail} fallan · ${r.na} no automatizables (con motivo) · ${r.pend} pendientes · inventario FAQ: ${r.faqEntries} entradas, ${r.faqTested} con prueba, ${r.faqNA} sin automatizar, ${r.uncovered.length} sin cubrir`);
' 2>/dev/null || true
exit $st
