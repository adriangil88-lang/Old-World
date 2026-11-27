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

const blockAt=(f,ln)=>B.find(b=>b.f.replace('new/','')===f&&b.hdr<=ln&&ln<=b.ln);
const ok=fs.readFileSync('/home/claude/tow/rules/verif/auto/out/comp_ok.txt','utf8').split('\n').filter(l=>/^(comp|mach|opt)\|/.test(l));
const EXP={undead:['fear','immunePsy','unbreakable','unstable'],daemonic:['fear','immunePsy','unbreakable','unstable','magical','warpSpawned'],ensorcelled:['magical']};
const lines=[];
for(const l of ok){const [kind,id,rest]=l.split('|');const d=UNITS[id];if(!d)continue;
  const bk=new Set(),unm=[];
  const first=rest.split(' ;; ')[0];
  for(const part of first.split(' + ')){const m=/@([\w.]+):(\d+)/.exec(part);if(!m)continue;const b=blockAt(m[1],+m[2]);if(!b||!b.sr)continue;for(const x of b.sr){const i=toId(x);if(i)bk.add(i);else unm.push(x)}}
  if(!bk.size&&!unm.length)continue;
  const ds=new Set(d.sr||[]);for(const k of [...bk])if(EXP[k])EXP[k].forEach(x=>bk.add(x));const dd=new Set(ds);for(const k of [...ds])if(EXP[k])EXP[k].forEach(x=>dd.add(x));
  const miss=[...bk].filter(x=>!dd.has(x)&&x!=='chaosArmour'&&x!=='daemonic'&&!(x==='ensorcelled'&&dd.has('magical')));
  const extra=[...dd].filter(x=>!bk.has(x)&&!(x==='magical'&&bk.has('ensorcelled')));
  if(miss.length||extra.length)lines.push(`${kind}|${id}|FALTA: ${miss.join(',')}|SOBRA: ${extra.join(',')}|sin id: ${unm.join(';').slice(0,160)}`);
}
console.log('comp/mach/opt con diferencias de reglas',lines.length,'de',ok.length);fs.writeFileSync('/home/claude/tow/rules/verif/auto/out/sr_comp_diff.txt',lines.join('\n'));
