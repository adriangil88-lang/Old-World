import {UNITS} from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const BL=JSON.parse(fs.readFileSync('out/blocks.json'));
const F=['M','WS','BS','S','T','W','I','A','Ld'];
const num=x=>/^\d+$/.test(x)?+x:null;
const z=x=>typeof x==='number'?x:0;
for(const id of process.argv.slice(2)){
 const d=UNITS[id];const t=F.map(k=>d[k]==null?0:d[k]);
 console.log('##',id,d.name,t.join(','),'ppm',d.ppm,'opts',(d.opts||[]).map(o=>o.id+':'+o.cost).join(' '));
 let n=0;
 for(const b of BL){const rs=b.rows.map(r=>({...r,s:r.st.map(num)}));
  const ok=t.every((v,i)=>v===0||rs.some(r=>r.s[i]===v)||(i===5||i===7)&&rs.some(a=>rs.some(c=>z(a.s[i])+z(c.s[i])===v)));
  if(ok&&n++<4)console.log('  ',b.f,b.ln,b.rows.map(r=>r.name+'('+r.pts+')').join(' / '));
 }
}
