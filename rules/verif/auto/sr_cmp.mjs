import {UNITS} from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const B=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/out/blocks.json'));
const DICT=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/dict.json'));
const n=x=>x==null||x==='-'||x==='*'?0:(isNaN(+String(x).replace('+',''))?String(x):+String(x).replace('+',''));
const camel=s=>{const w=s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);return w.map((x,i)=>i?x[0].toUpperCase()+x.slice(1):x).join('')};
const allIds=new Set();for(const d of Object.values(UNITS))(d.sr||[]).forEach(x=>allIds.add(x));
const idl=new Map([...allIds].map(i=>[i.toLowerCase(),i]));
const toId=s=>{const par=(s.match(/\(([^)]*)\)/)||[])[1];const base=s.replace(/\s*\(.*$/,'').replace(/\*/g,'').trim();
  if(base==='Magic Resistance'){const k=Math.abs(parseInt(par));return k===1?'magRes':'magRes'+k}
  if(base==='Indomitable'&&par) return 'indom'+parseInt(par);
  if(base==='Hatred'){const m={ 'all enemies':'hatred', 'Orcs & Goblins':'hatredOrcs','Dwarfs':'hatredDwarfs','High Elves':'hatredHE'}; if(m[par])return m[par];return undefined}
  if(DICT[base])return DICT[base];const c=camel(base).toLowerCase();return idl.get(c);};
const seen=new Map();for(const b of B){const k=b.rows.map(r=>r.name+r.st.join()+r.pts).join('|');if(!seen.has(k)||b.f.startsWith('new/'))seen.set(k,b)}
const blocks=[...seen.values()];
const norm=s=>s.toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(x=>x.length>2).map(x=>x.replace(/s$/,''));
const U=Object.entries(UNITS).filter(([id,d])=>!d.hidden);
const lines=[];let pairs=0;
for(const b of blocks){ if(!b.sr) continue;
  const bookIds=new Set(),unm=[];for(const s of b.sr){const i=toId(s);if(i)bookIds.add(i);else unm.push(s)}
  const r=b.rows[0];const t=r.st.map(n);const toks=norm(r.name);
  const hits=[];
  for(const [id,d] of U){
    if(d.cat==='char'&&b.rows.length>1&&0)continue;
    const dt=[d.M,d.WS,d.BS,d.S,d.T,d.W,d.I,d.A,d.Ld].map(x=>x==null?0:x);
    const idt=new Set(norm(id.replace(/_/g,' ')));const tok=toks.filter(x=>idt.has(x)).length;
    const eq=[1,2,3,4,5,6,8].filter(i=>dt[i]===t[i]).length;
    if(eq>=6&&+r.pts===d.ppm&&tok>0) hits.push(id);
  }
  for(const id of hits){pairs++;const d=UNITS[id];const ds=new Set(d.sr||[]);
    const EXP={undead:['fear','immunePsy','unbreakable','unstable'],daemonic:['fear','immunePsy','unbreakable','unstable','magical','warpSpawned'],ensorcelled:['magical']};
    const bk=new Set(bookIds);for(const k of [...bk])if(EXP[k])EXP[k].forEach(x=>bk.add(x));
    const dd=new Set(ds);for(const k of [...ds])if(EXP[k])EXP[k].forEach(x=>dd.add(x));
    const miss=[...bk].filter(x=>!dd.has(x)&&x!=='chaosArmour'&&!(x==='ensorcelled'&&dd.has('magical'))&&!(x==='daemonic')),extra=[...dd].filter(x=>!bk.has(x)&&!(x==='magical'&&bk.has('ensorcelled')));
    if(!miss.length&&!extra.length) continue;
    if(miss.length||extra.length) lines.push(`${id}|arm:${d.arm}|${r.name}@${b.f.replace('new/','')}:${b.ln}|FALTA en datos: ${miss.join(',')}|SOBRA en datos: ${extra.join(',')}|reglas libro sin id: ${unm.join(';')}`);
  }
}
console.log('pairs',pairs,'with diffs',lines.length);fs.writeFileSync('/home/claude/tow/rules/verif/auto/out/sr_diff.txt',lines.join('\n'));
