import {UNITS} from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const B=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/out/blocks.json'));
const DICT=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/dict.json'));
const rev={};for(const [en,id] of Object.entries(DICT))(rev[id]=rev[id]||[]).push(en);
const camel=s=>{const w=s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);return w.map((x,i)=>i?x[0].toUpperCase()+x.slice(1):x).join('')};
// every English rule name seen in any block -> id (via DICT or camel)
const allIds=new Set();for(const d of Object.values(UNITS))(d.sr||[]).forEach(x=>allIds.add(x));
const idl=new Map([...allIds].map(i=>[i.toLowerCase(),i]));
for(const b of B)for(const s of (b.sr||[])){const base=s.replace(/\s*\(.*$/,'').trim();const id=DICT[base]||idl.get(camel(base).toLowerCase());if(id&&!(rev[id]||[]).includes(base))(rev[id]=rev[id]||[]).push(base)}
rev.magRes=['Magic Resistance'];rev.magRes2=['Magic Resistance'];rev.magRes3=['Magic Resistance'];rev.hatredOrcs=['Hatred'];rev.hatredHE=['Hatred'];rev.hatredChaos=['Hatred'];rev.hatredDwarfs=['Hatred'];rev.indom1=['Indomitable'];rev.indom2=['Indomitable'];rev.indom3=['Indomitable'];
rev.undead=['Nehekharan Undead','Undead'];rev.flyer=['Fly'];rev.impact=['Impact Hits'];rev.stomp=['Stomp'];rev.killingBlow=['Killing Blow'];rev.deathblow=['Deathblow'];rev.unstable=['Unstable'];rev.unbreakable=['Unbreakable'];rev.terror=['Terror'];rev.fear=['Fear'];
const sr=JSON.parse(JSON.stringify(0));
const lines=fs.readFileSync('/home/claude/tow/rules/verif/auto/out/sr_diff.txt','utf8').split('\n').filter(Boolean);
const FILES={};const read=f=>FILES[f]||(FILES[f]=fs.readFileSync('/home/claude/tow/rules/'+(f.startsWith('aj_')&&!fs.existsSync('/home/claude/tow/rules/'+f)?'new/'+f:f),'utf8').split('\n'));
const out=[];
for(const l of lines){const [id,arm,name,miss,extra]=l.split('|');const m=name.match(/@(.+):(\d+)$/);const f=m[1];const ln=+m[2];
  const ex=(extra||'').replace('SOBRA en datos: ','').split(',').filter(Boolean);
  let txt;try{txt=read(f.startsWith('aj_')||f.startsWith('leg_')||f.startsWith('cathay')?(fs.existsSync('/home/claude/tow/rules/new/'+f)?'new/'+f:f):f).slice(Math.max(0,ln-40),ln+140).join('\n').toLowerCase()}catch(e){txt=''}
  const unsup=[];
  for(const x of ex){const names=rev[x];if(!names){unsup.push(x+'(?)');continue}
    if(!names.some(n=>txt.includes(n.toLowerCase()))) unsup.push(x)}
  if(unsup.length) out.push(`${id}|${name}|${unsup.join(',')}`);
}
console.log(out.length);console.log(out.join('\n'));
