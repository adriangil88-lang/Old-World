// Verificación exacta de perfiles: fila única, personaje/unidad + montura, máquinas y carros (chasis + tripulación + monturas),
// con erratas de FAQ (errata.json) y opciones por modelo que explican la diferencia de puntos.
import {UNITS} from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const OUT='/home/claude/tow/rules/verif/auto/out/';
const R=JSON.parse(fs.readFileSync(OUT+'rows.json'));
const BL=JSON.parse(fs.readFileSync(OUT+'blocks.json'));
const ERR=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/errata.json'));
const F=['M','WS','BS','S','T','W','I','A','Ld'];
const num=x=>/^\d+$/.test(x)?+x:(x==='-'||x==='*')?null:x;
let rows=R.map(r=>({...r,file:r.f.replace('new/',''),s:r.st.map(num),p:/^\+?\d+$/.test(r.pts)?+r.pts.replace('+',''):null,plus:r.pts.startsWith('+')}));
// FAQ tabla sustituye a la fila del libro con el mismo nombre
const faqNames=new Set(rows.filter(r=>/faq/.test(r.file)).map(r=>r.name));
rows=rows.filter(r=>/faq/.test(r.file)||!faqNames.has(r.name)||['Warhorse'].includes(r.name));
// erratas curadas
for(const r of rows){ if(/faq/.test(r.file))continue; for(const e of ERR){ if(r.name===e.name||r.name.endsWith(' '+e.name)&&0){ if(e.set)for(const [k,v] of Object.entries(e.set))r.s[F.indexOf(k)]=v; if(e.pts!=null)r.p=e.pts; r.err=e.src; } } }
// bloque que contiene cada fila → opciones por modelo
const blockOf0=r=>BL.find(b=>b.f.replace('new/','')===r.file&&b.hdr<=r.ln&&r.ln<=b.ln);
const blockOf=r=>r._b!==undefined?r._b:(r._b=blockOf0(r)||null);
const _pm=new Map();const perModel=b=>{if(_pm.has(b))return _pm.get(b);const o=perModel0(b);_pm.set(b,o);return o};const perModel0=b=>{const out=[];for(const l of (b?.opts||[])){if(/up to|per unit|total of/i.test(l))continue;let m=l.match(/\+(\d+) points?(?! per unit)/);if(m)out.push(+m[1]);else if(/\.{3,}\s*Free/.test(l))out.push(0)}return [...new Set(out)]};
const _sm=new Map();const sums=(arr,n=3)=>{const key=arr.join();if(_sm.has(key))return _sm.get(key);const o=sums0(arr,n);_sm.set(key,o);return o};const sums0=(arr,n=3)=>{let s=new Set([0]);for(let k=0;k<n;k++){const nx=new Set(s);for(const a of s)for(const c of arr)nx.add(a+c);s=nx}return s};
const bonus=x=>{const m=/^\(\+(\d+)\)$/.exec(x);return m?+m[1]:0};
const norm=s=>s.toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(x=>x.length>2).map(x=>x.replace(/men$/,'man').replace(/s$/,'').slice(0,5));
const z=x=>(typeof x==='number'?x:0);
const isMount=r=>typeof r.s[0]==='number'&&(r.s[4]==null||/^\(/.test(r.st[4]))&&(r.s[5]==null||/^\(/.test(r.st[5]))&&r.st[8]==='-'&&r.p!=null;
const flyOf=r=>{if(r.fly!==undefined)return r.fly;r.fly=null;const L=txt(r.file);for(let i=r.ln;i<Math.min(L.length,r.ln+70);i++){const q=/Fly\s*\((\d+)\)/.exec(L[i]);if(q){r.fly=+q[1];break}if(i>r.ln+3&&/^\s*\S.*\s\d+\s+\d+\s+[\d-]+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+/.test(L[i]))break}return r.fly};
const mounts=rows.filter(isMount);
const _tx={};const txt=f=>_tx[f]||(_tx[f]=fs.readFileSync('/home/claude/tow/rules/'+(/^(fof|rh|core)/.test(f)?'':'new/')+f,'utf8').split('\n'));
for(const m of mounts){flyOf(m);if(0){const L=txt(m.file);m.fly=null;for(let i=m.ln;i<Math.min(L.length,m.ln+70);i++){const q=/Fly\s*\((\d+)\)/.exec(L[i]);if(q){m.fly=+q[1];break}if(i>m.ln+3&&/^\s*\S.*\s\d+\s+\d+\s+[\d-]+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+/.test(L[i]))break}}}
const riders=rows.filter(r=>!isMount(r)&&r.s[1]!=null&&r.s[8]!=null);
const D=u=>F.map(k=>u[k]==null?0:u[k]);
const CL=[];{const byf={};for(const r of rows)(byf[r.file]??=[]).push(r);for(const f in byf){const a=byf[f].sort((x,y)=>x.ln-y.ln);let cur=[];for(const r of a){if(cur.length&&r.ln-cur[cur.length-1].ln>4){CL.push(cur);cur=[]}cur.push(r)}if(cur.length)CL.push(cur)}}
const statOk=(t,base,pool)=>t.every((v,i)=>{const vals=[base.s[i],...pool.map(p=>p.s[i])].filter(x=>typeof x==='number');if(i===0)for(const p of [base,...pool]){const f=flyOf(p);if(f)vals.push(f)}if(vals.includes(v)||v===0)return true;if(i===5||i===7){const s2=(base.s[i]||0)+pool.reduce((a,p)=>a+z(p.s[i]),0);if(s2===v)return true;const vs=[...new Set(vals.filter(x=>x>0))];let S=new Set([0]);for(let k=0;k<5;k++){const nx=new Set(S);for(const a of S)for(const c of vs)nx.add(a+c);S=nx}return S.has(v)}return false});
const res={single:[],opt:[],comp:[],mach:[],none:[]};
const U=Object.entries(UNITS).filter(([id,d])=>!d.hidden);
const tokOf=(id,r)=>{const idt=new Set(norm(id.replace(/_/g,' ')));return norm(r.name).filter(x=>idt.has(x)).length};
for(const [id,d] of U){
  const t=D(d);
  const eqRow=r=>t.every((v,i)=>i===0&&v===flyOf(r)?true:typeof r.s[i]==='number'?r.s[i]===v:(r.s[i]==null?v===0:(String(r.s[i])===String(v))));
  const single=rows.filter(r=>eqRow(r)&&r.p===d.ppm);
  if(single.length){res.single.push([id,single.map(r=>r.name+'@'+r.file+':'+r.ln+(r.err?' ['+r.err+']':''))]);continue}
  // fila única con opciones por modelo
  const so=[];for(const r of rows){ if(!eqRow(r)||r.p==null||r.plus)continue; const diff=d.ppm-r.p; if(diff<=0)continue; const pm=perModel(blockOf(r)); if(sums(pm).has(diff)) so.push({r,diff}); }
  if(so.length){const best=Math.max(...so.map(h=>tokOf(id,h.r)));const c=so.filter(h=>tokOf(id,h.r)===best);res.opt.push([id,c.slice(0,3).map(h=>`${h.r.name}@${h.r.file}:${h.r.ln} +${h.diff} (opciones por modelo)`),best]);continue}
  // jinete + montura
  const hits=[];
  for(const m of mounts){for(const r of riders){
    if(r.p==null||m.p==null)continue; const dd=d.ppm-r.p-m.p; if(dd<0||!sums(perModel(blockOf(r))).has(dd))continue;
    const rv=r.s.map(z),mv=m.s.map(z),bw=bonus(m.st[5]),bt=bonus(m.st[4]);
    const ok=[[mv[0],rv[0],m.fly].includes(t[0]),t[1]===rv[1]||t[1]===mv[1],t[2]===rv[2]||t[2]===mv[2],t[3]===rv[3]||t[3]===mv[3],t[4]===rv[4]||t[4]===mv[4]||t[4]===rv[4]+bt,[rv[5],rv[5]+bw,mv[5],rv[5]+mv[5],rv[5]+bw+mv[5]].includes(t[5]),t[6]===rv[6]||t[6]===mv[6],[rv[7],rv[7]+mv[7],mv[7]].includes(t[7]),t[8]===rv[8]||t[8]===mv[8]];
    if(ok.every(Boolean)) hits.push({r,m,tok:tokOf(id,r)+tokOf(id,m)});
  }}
  if(hits.length){const best=Math.max(...hits.map(h=>h.tok));res.comp.push([id,hits.filter(h=>h.tok===best).slice(0,3).map(h=>`${h.r.name}@${h.r.file}:${h.r.ln} + ${h.m.name}@${h.m.file}:${h.m.ln}`),best]);continue}
  // máquina / carro: fila base con puntos + tripulación y monturas del mismo bloque (puntos '-')
  const mh=[];
  for(const b of BL){ const f=b.f.replace('new/',''); const rs=rows.filter(r=>r.file===f&&r.ln>=b.hdr&&r.ln<=b.ln);
    const pms=sums(perModel(b)); const cand=rs.filter(r=>r.p!=null&&!r.plus&&pms.has(d.ppm-r.p)); const base=cand.sort((a,c)=>tokOf(id,c)-tokOf(id,a))[0];
    if(!base)continue; const pool=rs.filter(r=>r!==base);
    const ok=t.every((v,i)=>{const vals=[base.s[i],...pool.map(p=>p.s[i])].filter(x=>typeof x==='number');if(i===0)for(const p of [base,...pool]){const f=flyOf(p);if(f)vals.push(f)}if(vals.includes(v))return true; if(v===0)return true; if(i===5||i===7){const s2=(base.s[i]||0)+pool.reduce((a,p)=>a+z(p.s[i]),0);if(s2===v)return true;const vs=[...new Set(vals.filter(x=>x>0))];let S=new Set([0]);for(let k=0;k<5;k++){const nx=new Set(S);for(const a of S)for(const c of vs)nx.add(a+c);S=nx}return S.has(v)} return false});
    if(ok&&tokOf(id,base)+norm(b.rows[0].name).filter(x=>new Set(norm(id.replace(/_/g,' '))).has(x)).length>0) mh.push(`${base.name}@${f}:${base.ln}`);
  }
  if(mh.length){res.mach.push([id,[...new Set(mh)].slice(0,3),0]);continue}
  // máquina/carro por grupo de filas contiguas (sin bloque parseado)
  {const mh2=[];for(const cl of CL){const f=cl[0].file;const lines=txt(f.replace(/^/,''));const last=cl[cl.length-1].ln;
    const opts=[];for(let i=last;i<Math.min(lines.length,last+45);i++){const l=lines[i];if(/up to|per unit|total of/i.test(l))continue;const m=l.match(/\+(\d+) points?(?! per unit)/);if(m)opts.push(+m[1]);else if(/\.{3,}\s*Free/.test(l))opts.push(0)}
    const pms=sums([...new Set(opts)]);const cand=cl.filter(r=>r.p!=null&&!r.plus&&pms.has(d.ppm-r.p));const base=cand.sort((a,c)=>tokOf(id,c)-tokOf(id,a))[0];if(!base)continue;
    const pool=cl.filter(r=>r!==base);const ok=statOk(t,base,pool);
    if(ok&&tokOf(id,base)>0)mh2.push(`${base.name}@${f}:${base.ln} (grupo)`)}
   if(mh2.length){res.mach.push([id,[...new Set(mh2)].slice(0,3),0]);continue}}
  res.none.push([id,d.faction,d.name,t.join(','),d.ppm]);
}
console.log('fila única',res.single.length,'+opciones',res.opt.length,'montura',res.comp.length,'máquina/carro',res.mach.length,'SIN EXPLICAR',res.none.length);
fs.writeFileSync(OUT+'comp_none.txt',res.none.map(x=>x.join('|')).join('\n'));
fs.writeFileSync(OUT+'comp_ok.txt',['single','opt','comp','mach'].flatMap(k=>res[k].map(x=>k+'|'+x[0]+'|'+x[1].join(' ;; '))).join('\n'));
