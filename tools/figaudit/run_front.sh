#!/usr/bin/env bash
# v843n: capturas laterales con flecha de frente de TODAS las unidades (840). Uso: run_front.sh <pc|iphone> <outdir> [puerto]
dev=$1; out=$2; port=${3:-8765}
export AUDIT=${AUDIT:-/tmp/figaudit_n.json} TILE=${TILE:-200} BASE=http://localhost:$port
cd "$(dirname "$0")"
for fac in $(node -e 'const a=JSON.parse(require("fs").readFileSync(process.env.AUDIT));console.log([...new Set(a.map(r=>r.fac))].join(" "))'); do
  ids=$(node -e 'const r=JSON.parse(require("fs").readFileSync(process.env.REPS||"/tmp/fr/reps.json")).reps;console.log((r["'$fac'"]||[]).join(","))')
  [ -z "$ids" ] && continue
  [ -f "$out/.done_$fac" ] && continue
  node ${SHOOT:-shoot_front.js} $dev $fac $out "$ids" ${VIEWS:-side} 2>&1 | tail -3 && touch "$out/.done_$fac"
done
