#!/bin/sh
# Auditoría automática unidad ↔ libros (v822): extrae bloques de unidad de los libros, empareja por perfil+puntos+nombre y compara reglas especiales, tamaño y peana.
cd "$(dirname "$0")" && mkdir -p out && python3 parse.py && node sr_cmp.mjs && node size_cmp.mjs > out/size_diff.txt && node sobra.mjs > out/sobra.txt && echo "ver out/sr_diff.txt, out/size_diff.txt, out/sobra.txt"
