import {UNITS} from '/home/claude/tow/app/js/data.js';
import fs from 'fs';
const B=JSON.parse(fs.readFileSync('/home/claude/tow/rules/verif/auto/out/blocks.json'));
const n=x=>x==null||x==='-'||x==='*'?0:(isNaN(+String(x).replace('+',''))?String(x):+String(x).replace('+',''));
const norm=s=>s.toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(x=>x.length>2).map(x=>x.replace(/s$/,''));
const seen=new Map();for(const b of B){const k=b.rows.map(r=>r.name+r.st.join()+r.pts).join('|');if(!seen.has(k)||b.f.startsWith('new/'))seen.set(k,b)}
const blocks=[...seen.values()];const U=Object.entries(UNITS).filter(([id,d])=>!d.hidden);
const out=[];
for(const b of blocks){const r=b.rows[0];const t=r.st.map(n);const toks=norm(r.name);
 for(const [id,d] of U){
  const dt=[d.M,d.WS,d.BS,d.S,d.T,d.W,d.I,d.A,d.Ld].map(x=>x==null?0:x);
  const idt=new Set(norm(id.replace(/_/g,' ')));const tok=toks.filter(x=>idt.has(x)).length;
  const eq=[1,2,3,4,5,6,8].filter(i=>dt[i]===t[i]).length;
  if(!(eq>=6&&+r.pts===d.ppm&&tok>0)) continue;
  const prob=[];
  const bs=(b.base||'').match(/(\d+)\s*x\s*(\d+)/);
  if(bs&&d.baseW){ if(+bs[1]!==d.baseW||+bs[2]!==d.baseD) prob.push(`base libro ${bs[1]}x${bs[2]} / datos ${d.baseW}x${d.baseD}`)}
  const sz=(b.size||'').match(/^(\d+)(\+|-(\d+))?/);
  if(sz&&d.cat!=='char'&&d.cat!=='mach'){ const mn=+sz[1];const mx=sz[3]?+sz[3]:null;
    // 'N+' => min N, '(M+ if a detachment)' allowed lower
    const det=(b.size||'').match(/\((\d+)\+ if a detachment/); 
    if(d.min!==mn&&!(det&&d.min===+det[1])) prob.push(`mín libro ${b.size} / datos ${d.min}`);
    if(mx!=null&&d.max!==mx) prob.push(`máx libro ${mx} / datos ${d.max}`);
  }
  if(prob.length) out.push(`${id}|${r.name}@${b.f.replace('new/','')}:${b.ln}|${prob.join('; ')}`);
 }}
console.log(out.length);console.log(out.join('\n'));
