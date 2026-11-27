// v843l: contraste de la peana de cada unidad del motor con los bloques de perfil del libro (blocks.json). Uso: node base_cmp.mjs [relajado]
import {UNITS} from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const B=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/out/blocks.json'));
const norm=s=>s.toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(x=>x.length>2).map(x=>x.replace(/s$/,''));
const n=x=>x==null||x==='-'||x==='*'?0:(isNaN(+String(x).replace('+',''))?String(x):+String(x).replace('+',''));
const relax=process.argv[2]==='relajado';
const res={}; // id -> {matches:[{bl,base}]}
for(const b of B){ const ms0=[...(b.base||'').matchAll(/(\d+)\s*x\s*(\d+)/g)]; const m=ms0[0]; if(!m) continue; const r=b.rows[0]; const t=r.st.map(n); const toks=norm(r.name);
  for(const [id,d] of Object.entries(UNITS)){ if(!d.baseW||d.hidden) continue;
    const idt=new Set(norm(id.replace(/_/g,' '))); const tok=toks.filter(x=>idt.has(x)).length; if(!tok) continue;
    const dt=[d.M,d.WS,d.BS,d.S,d.T,d.W,d.I,d.A,d.Ld].map(x=>x==null?0:x); const eq=[1,2,3,4,5,6,8].filter(i=>dt[i]===t[i]).length;
    const ok = eq>=6 && +r.pts===d.ppm || (relax && eq>=5 && tok>=1);
    if(!ok) continue; (res[id] ||= []).push({bl:`${r.name}@${b.f.replace('new/','')}:${b.ln}`,w:+m[1],d:+m[2],eq,all:ms0.map(x=>x[1]+'x'+x[2])}); } }
let same=0,diff=[]; for(const [id,ms] of Object.entries(res)){ const d=UNITS[id]; const good=ms.some(x=>x.all.includes(d.baseW+'x'+d.baseD)); if(good) same++; else diff.push(`${id}|motor ${d.baseW}x${d.baseD}|libro ${ms.map(x=>x.all.join('/')+' '+x.bl).join(' ; ')}`); }
console.log('unidades con peana contrastada:',Object.keys(res).length,'coinciden:',same,'difieren:',diff.length); console.log(diff.join('\n'));
fs.writeFileSync('/tmp/base_matched.json',JSON.stringify(Object.keys(res)));

// tabla completa
const FAQ={woc_marauders:'FAQ RH «Chaos Marauders» 30x30',woc_marauders_gw:'FAQ RH «Chaos Marauders» 30x30',woc_marauders_amb:'FAQ RH 30x30',woc_marauders_gw_amb:'FAQ RH 30x30',woc_marauders_famb:'FAQ RH 30x30',woc_marauders_gw_famb:'FAQ RH 30x30',woc_chieftain:'FAQ RH 30x30',woc_berserkers:'FAQ RH 30x30',woc_skinwolves:'FAQ RH 50x50',woc_hellcannon:'FAQ RH 100x150 (Hellcannon)',cd_hellcannon:'FAQ RH 100x150',dw_hewer:'FAQ FoF 50x75 (Goblin Hewers)',woc_chieftain_horse:'FAQ RH Warhorse 30x60'};
const FIXED={ok_hunter:'corregido 40x40 → 50x50 (leg_ogres.txt:179)',woc_marauders_gw:'corregido 25x25 → 30x30 (FAQ RH Chaos Marauders)',woc_marauders_amb:'corregido 25x25 → 30x30',woc_marauders_gw_amb:'corregido 25x25 → 30x30',woc_marauders_famb:'corregido 25x25 → 30x30',woc_marauders_gw_famb:'corregido 25x25 → 30x30'};
const AMB={dm_keeper:'AMBIGUA: el libro da una horquilla 50x50 (mín.) a 100x150 (máx.) según el modelo; el motor usa 60x100 (peana intermedia coherente con la figura). Sin dato inequívoco: no se toca.'};
const rows=['id\tpeana motor\tpeana oficial\tfuente\tacción'];
for(const [id,d] of Object.entries(UNITS)){ if(!d.baseW||d.hidden) continue; const ms=res[id]||[]; const eng=d.baseW+'x'+d.baseD; let off='—',src='—',act;
  if(ms.length){ off=[...new Set(ms.flatMap(x=>x.all))].join(' / '); src=ms.slice(0,2).map(x=>x.bl).join(' ; ');
    const good=ms.some(x=>x.all.includes(eng)); act=good?'coincide':(d.mount||/_(steed|boar|wolf|chariot|dragon|manticore|peg|uni|hippo|stone|thunder|cold|carno|disc|throne|jug|pal|exalted|star|moon|eagle|griffon|skycutter|lammasu|tusk|spider|war\d+|mtd|rpeg|w\d)/.test(id)?'montura/carro: el libro da la peana a pie del personaje; la del motor es la de la montura (no aplica)':'diferencia revisada (ver nota)'); }
  else act='sin bloque equiparable en los libros extraídos (se conserva)';
  if(FAQ[id]){src=FAQ[id]+(src==='—'?'':' ; '+src);act=FIXED[id]?FIXED[id]:'FAQ manda sobre el libro (motor = FAQ)';}
  if(FIXED[id]) act=FIXED[id]; if(AMB[id]) act=AMB[id];
  rows.push([id,eng,off,src,act].join('\t')); }
fs.writeFileSync('/home/claude/tow/rules/verif/auto/out/base_table_v843l.tsv',rows.join('\n')+'\n'); console.log('tabla',rows.length-1);
