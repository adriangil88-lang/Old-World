import { createGame, apply, castCheck, spellTargets, D, alive } from '/home/claude/tow/app/js/rules.js';
import { dims } from '/home/claude/tow/app/js/geom.js';
import { PRESETS, SPELLS, UNITS } from '/home/claude/tow/app/js/data.js';
const FAC=Object.keys(PRESETS); let bad=[],okc=0;
const mk=(seed,f0,f1)=>{const s=createGame({seed,armies:[PRESETS[f0][1000],PRESETS[f1][1000]],factions:[f0,f1],limit:1000,scn:'glory',tmode:'random',sec:'none',gend:'fixed'});apply(s,{t:'ready',player:0});apply(s,{t:'ready',player:1});return s;};
const find=(s,o,pred)=>s.units.find(x=>x.owner===o&&x.models>0&&pred(x));
function setup(key,seed,{engage=false,wound=false}={}){
  const s=mk(seed,FAC[seed%17],FAC[(seed*5+3)%17]);
  const all=()=>s.units.flatMap(h=>[h,...(h.joined||[])]);
  let w=all().find(x=>x.owner===0&&D(x).cat==='char'&&x.models>0); if(!w) return null;
  if(!D(w).wizard) w.items=[...(w.items||[]),'wiz_hat']; w.spells=[key];
  const hh=s.units.find(h=>h===w||(h.joined||[]).includes(w));
  const en=find(s,1,x=>D(x).cat!=='char'&&!x.joined?.length)||find(s,1,()=>true);
  const dd=engage?0.05+(Math.max(hh.baseD,en.baseD)/25.4)/2+(Math.max(en.baseD)/25.4)/2:9;
  const gap=engage?dims(hh).d/2+dims(en).d/2+0.01:9; en.x=hh.x+Math.cos(hh.face)*gap; en.y=hh.y+Math.sin(hh.face)*gap; en.face=hh.face+Math.PI;
  s.active=0; return {s,w,hh,en};
}
function run(key,opts,check){
  let done=0,last='';
  for(let seed=1;seed<=30&&!done;seed++){
    const c=setup(key,seed,opts); if(!c) continue; const {s,w,hh,en}=c;
    s.phase=SPELLS[key].type==='missile'||SPELLS[key].type==='vortex'||SPELLS[key].type==='assail'?'shoot':'strategy';
    Object.assign(w,{x:hh.x,y:hh.y,face:hh.face}); if(opts.pre) opts.pre(c);
    let tg=[];try{tg=spellTargets(s,w,key);}catch(e){bad.push(key+' targets '+e.message);continue;}
    if(!tg.length) continue;
    for(let att=0;att<12;att++){ const cc=structuredClone(s); cc.rng=(cc.rng||0)+att*7919; const cw=[...cc.units,...cc.units.flatMap(h=>h.joined||[])].find(x=>x.id===w.id);
      // asegurar lanzamiento: sin MR
      let r; try{r=apply(cc,{t:'cast',id:cw.id,spell:key,target:tg[0].id});}catch(e){bad.push(key+' EXC '+e.stack.split('\n').slice(0,2).join('|'));break;}
      if(!r.ok) continue;
      if(cc.log.some(m=>/NaN|undefined|\[object/.test(m))) bad.push(key+' log '+cc.log.filter(m=>/NaN|undefined|\[object/.test(m))[0]);
      const res=check(cc,cw,tg[0]); if(res!==true){ last=res; continue;} okc++;done=1; break; }
  }
  if(!done) bad.push(key+': sin éxito en 30 semillas ('+last+')');
}
const T=(id,cc)=>[...cc.units,...cc.units.flatMap(h=>h.joined||[])].find(x=>x.id===id);
run('cacophonic',{pre:({en})=>{en.fx=[{k:'ward',v:5,by:0}]}},(cc,cw,t)=>{const e=T(t.id,cc);return e.fx.some(f=>f.k==='stupid')&&!e.fx.some(f=>f.k==='ward')||'sin estupidez/ward'});
run('gift_mut',{},(cc,cw,t)=>{const e=T(t.id,cc);const m=e.fx.find(f=>f.k==='mut');return (m&&(m.ws||m.s||m.t))?true:'sin mut'});
run('pink_fire',{},(cc,cw,t)=>cc.log.some(m=>/Fuego Rosa/.test(m))||'sin log');
run('curse_hashut',{pre:({en,s})=>{const ch=s.units.find(x=>x.owner===1&&x.models>0&&D(x).cat==='char'); if(ch){ch.x=en.x;ch.y=en.y+0}}} ,(cc,cw,t)=>cc.log.some(m=>/Maldición de Hashut/.test(m))||'sin log');
run('flames_hashut',{engage:true},(cc)=>cc.log.some(m=>/Llamas de Hashut/.test(m))||'sin log');
run('storm_ash',{},(cc,cw)=>T(cw.id,cc).fx.some(f=>f.k==='ashstorm')||'sin fx');
run('apotheosis',{pre:({w,hh})=>{const m=[hh,...(hh.joined||[])].find(x=>D(x).cat==='char'); if(m){m.wounds=Math.max(1,m.wounds-1);}}},(cc,cw,t)=>{const c=[t,...(T(t.id,cc).joined||[])].find(x=>x.fx?.some(f=>f.k==='apoF'));return c?true:'sin apoF'});
run('monsoon',{},(cc)=>(cc.vortex||[]).some(v=>v.spell==='monsoon')||'sin vórtice');
run('black_horror',{},(cc)=>(cc.vortex||[]).some(v=>v.spell==='black_horror')||'sin vórtice');
run('plague_wind',{},(cc)=>(cc.vortex||[]).some(v=>v.spell==='plague_wind')||'sin vórtice');
run('cloud_corruption',{},(cc)=>(cc.vortex||[]).some(v=>v.spell==='cloud_corruption')||'sin vórtice');
run('cursing_word',{},(cc,cw,t)=>T(t.id,cc).fx.some(f=>f.k==='cursew')||'sin fx');
run('hellish_vigour',{pre:({s})=>{for(const u of s.units) if(u.owner===0) u.type==='x'}},(cc)=>cc.log.some(m=>/Vigor Infernal/.test(m))||'sin log');
run('raise_dead',{},(cc,cw)=>cc.units.some(u=>u.raised&&u.models>=2)||'sin zombis');
run('danse_macabre',{},(cc,cw,t)=>T(t.id,cc).fx.some(f=>f.k==='danse')||'sin fx');
run('toothcracker',{},(cc,cw,t)=>T(t.id,cc).fx.some(f=>f.k==='tooth')||'sin fx');
run('trollguts',{},(cc,cw,t)=>T(t.id,cc).fx.some(f=>f.k==='regen')||'sin fx');
run('skitterleap',{pre:({hh,w})=>{}},(cc,cw,t)=>cc.log.some(m=>/Salto Escurridizo/.test(m))||'sin log');
run('warp_lightning',{},(cc)=>cc.log.some(m=>/Rayo de Disformidad/.test(m))||'sin log');
for(const k of ['rod_damned','storm_daemon']) run(k,{},(cc)=>cc.log.some(m=>m.includes(SPELLS[k].name))||'sin log');
for(const k of ['ring_fury','twice_blessed','hand_dust']) run(k,{engage:true},(cc)=>cc.log.some(m=>m.includes(SPELLS[k].name))||'sin log');
run('ring_taal',{},(cc,cw)=>T(cw.id,cc).fx.some(f=>f.k==='ward')||'sin ward');
run('scrying_pool',{},(cc,cw)=>cc.units.some(u=>u.owner===0&&u.fx?.some(f=>f.k==='djaf'))||'sin djaf');
console.log('OK',okc,'ERR',bad.length,[...new Set(bad)].slice(0,30));
// asaltos: se lanzan solos al resolver el combate
{
  const items={ring_fury:'ring_fury',twice_blessed:'twice_blessed',hand_dust:'hand_dust'}; let ok2=0,b2=[];
  for (const key of ['flames_hashut','ring_fury','twice_blessed','hand_dust']) { let done=false;
    for (let seed=1;seed<=40&&!done;seed++){ const c=setup(key,seed,{engage:true}); if(!c) continue; const {s,w,hh,en}=c;
      if(items[key]) {w.items=[...(w.items||[]),key]; if(!D(w).wizard) w.spells=undefined; else w.spells=[key];}
      Object.assign(w,{x:hh.x,y:hh.y,face:hh.face});
      for(let att=0;att<15&&!done;att++){ const cc=structuredClone(s); cc.rng=(cc.rng||0)+att*104729; cc.phase='shoot'; cc.active=0;
        try{ apply(cc,{t:'endPhase'}); }catch(e){ b2.push(key+' EXC '+e.stack.split('\n').slice(0,2).join('|')); break; }
        if(cc.log.some(m=>/NaN|undefined|\[object/.test(m))) b2.push(key+' log '+cc.log.find(m=>/NaN|undefined|\[object/.test(m)));
        if(cc.log.some(m=>m.includes(SPELLS[key].name)&&/lanza/.test(m))){done=true;ok2++;} } }
    if(!done) b2.push(key+': no se lanzó'); }
  console.log('ASALTOS OK',ok2,'ERR',b2);
}
