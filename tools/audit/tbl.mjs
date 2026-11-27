import fs from 'node:fs';
import {createGame, apply, alive, SCN_IDS, D, unitPts, setTable, TABLE_W, TABLE_H} from '/home/claude/tow/app/js/rules.js';
import {PRESETS} from '/home/claude/tow/app/js/data.js';
import {nextAction, mkRng, LEVELS} from '/home/claude/tow/app/js/ai.js';
const w=JSON.parse(fs.readFileSync('/home/claude/tow/app/weights.json')).weights;
const FA=Object.keys(PRESETS);const res={};const errs=[];let n=0;
for(const scn of SCN_IDS)for(const [ts,lim] of [['min',500],['min',1000],['min',1500],['min',2000],['std',2000],['std',1000]]){
 for(let k=0;k<2;k++){const seed=100+k*7+n,fa=FA[(n*3)%17],fb=FA[(n*7+5)%17];n++;
  try{const s=createGame({seed,armies:[PRESETS[fa][lim],PRESETS[fb][lim]],factions:[fa,fb],limit:lim,scn,tmode:'random',sec:'none',gend:'fixed',tsize:ts});
   // zonas dentro de la mesa y sin solape; unidades dentro de zona
   for(const z of s.zones){if(z.x0<-1e-6||z.y0<-1e-6||z.x1>s.tw+1e-6||z.y1>s.th+1e-6||z.x1-z.x0<=0||z.y1-z.y0<=0)errs.push(`${scn} ${ts}${lim} zona fuera ${JSON.stringify(z)}`);}
   const [a,b]=s.zones;const ox=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),oy=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);if(ox>0&&oy>0)errs.push(`${scn} ${ts}${lim} zonas solapadas`);
   for(const t of s.terrain)if(t.x<0||t.y<0||t.x>s.tw||t.y>s.th)errs.push(`${scn} ${ts}${lim} terreno fuera ${t.kind} ${t.x},${t.y}`);
   const out=alive(s).filter(u=>u.x<-0.5||u.y<-0.5||u.x>s.tw+0.5||u.y>s.th+0.5);if(out.length)errs.push(`${scn} ${ts}${lim} unidades fuera: ${out.map(u=>u.name).join()}`);
   const unpl=s.units.filter(u=>u.models>0&&u.x===undefined);if(unpl.length)errs.push(`${scn} ${ts}${lim} sin colocar ${unpl.length}`);
   const r0=apply(s,{t:'ready',player:0}),r1=apply(s,{t:'ready',player:1});if(!r0.ok||!r1.ok)errs.push(`${scn} ${ts}${lim} ready: ${r0.error||r1.error}`);
   const cf=[{weights:w,level:LEVELS.medium,rng:mkRng(seed)},{weights:w,level:LEVELS.medium,rng:mkRng(seed+9)}];const st={done:new Set()};let g=0,last=-1;
   while(s.phase!=='over'&&g++<3000){if(s.active!==last){st.done.clear();last=s.active}const ph=s.phase;const a=nextAction(s,cf[s.active],st);const r=apply(s,a);if(!r.ok)apply(s,{t:'endPhase'});if(a.t==='endPhase'&&ph!==s.phase)st.done.clear();
     for(const u of alive(s))if(!Number.isFinite(u.x)||!Number.isFinite(u.y))errs.push(`${scn} NaN pos`);}
   if(s.phase!=='over')errs.push(`${scn} ${ts}${lim} no termina fase ${s.phase}`);
   res[scn+' '+ts+lim]=(res[scn+' '+ts+lim]||0)+1;
  }catch(e){errs.push(`${scn} ${ts}${lim} EXC ${String(e.stack).split('\n').slice(0,3).join('|')}`)}}}
console.log('partidas',n,'errores',errs.length);console.log([...new Set(errs)].slice(0,25).join('\n'));
