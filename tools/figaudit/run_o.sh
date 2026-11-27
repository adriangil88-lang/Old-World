#!/usr/bin/env bash
# v843o: capturas de revisión. Uso: run_o.sh <biped|nonbiped> <outdir> <views> [pitch]
grp=$1; out=$2; views=$3; pitch=${4:-}
export AUDIT=/tmp/figaudit_o.json TILE=${TILE:-400} BASE=${BASE:-http://localhost:8765}
[ -n "$pitch" ] && export PITCH=$pitch
cd "$(dirname "$0")"
python3 - "$grp" <<'P' > /tmp/fr/groups_$grp.json
import json,sys
a={r['id']:r for r in json.load(open('/tmp/figaudit_o.json')) if not r.get('rear')}
R=json.load(open('/tmp/fr/reps.json'))
B={('char','char',False),('inf','regInf',False),('inf','heavyInf',False),('inf','monInf',False),('char','monInf',False),('cav','monInf',False)}
want=sys.argv[1]=='biped'; allg=sys.argv[1]=='all'
out={}
for f,ids in R['reps'].items():
    l=[i for i in ids if allg or ((a[i]['cat'],a[i]['tt'],a[i]['mount']) in B)==want]
    if l: out[f]=l
print(json.dumps(out))
P
for fac in $(node -e 'console.log(Object.keys(JSON.parse(require("fs").readFileSync("/tmp/fr/groups_'$grp'.json"))).join(" "))'); do
  ids=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("/tmp/fr/groups_'$grp'.json"))["'$fac'"].join(","))')
  [ -f "$out/.done_$fac" ] && continue
  node shoot_front.js ${DEV:-pc} $fac $out "$ids" $views 2>&1 | tail -2 && touch "$out/.done_$fac"
done
