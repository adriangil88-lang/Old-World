import { createGame, apply, castCheck, spellTargets, D, alive, SCN_IDS } from '/home/claude/tow/app/js/rules.js';
import { PRESETS, SPELLS } from '/home/claude/tow/app/js/data.js';
import { unitDist } from '/home/claude/tow/app/js/geom.js';
const FAC=Object.keys(PRESETS);let errs=[],res={},ok=0,tot=0;const never=[];
for (const key of Object.keys(SPELLS)) { const sp=SPELLS[key]; let any=false;
 for (let seed=1;seed<=10;seed++) {
  const fa=FAC[seed%17],fb=FAC[(seed*5+3)%17];
  const s=createGame({seed,armies:[PRESETS[fa][1000],PRESETS[fb][1000]],factions:[fa,fb],limit:1000,scn:'glory',tmode:'random',sec:'none',gend:'fixed'});
  apply(s,{t:'ready',player:0});apply(s,{t:'ready',player:1});
  const all=s.units.flatMap(h=>[h,...(h.joined||[])]);
  let wiz=all.find(x=>x.owner===0&&D(x).wizard); if(!wiz){wiz=all.find(x=>x.owner===0&&x.models>0&&D(x).cat==='char');if(!wiz)continue;wiz.items=[...(wiz.items||[]),'wiz_hat'];}
  wiz.spells=[key]; const hh=s.units.find(h=>h===wiz||(h.joined||[]).includes(wiz));
  const en=s.units.find(x=>x.owner===1&&x.models>0); en.x=hh.x+Math.cos(hh.face)*(8+seed%5*3); en.y=hh.y+Math.sin(hh.face)*(8+seed%5*3); en.face=hh.face+Math.PI;
  s.active=0; s.phase=(sp.type==='missile'||sp.type==='vortex'||sp.type==='assail')?'shoot':'strategy';
  for (const ph of s.phase==='shoot'?['shoot']:['strategy','shoot']) { s.phase=ph;
   let tg=[];try{tg=spellTargets(s,wiz,key);}catch(e){errs.push(key+' targets '+e.message);continue;}
   for (const t of (tg.length?tg.slice(0,3):[wiz])) { tot++;
    const c=structuredClone(s);const cw=[...c.units,...c.units.flatMap(h=>h.joined||[])].find(x=>x.id===wiz.id);
    try{ const r=apply(c,{t:'cast',id:cw.id,spell:key,target:t.id}); if(r.ok){ok++;any=true;}
      for(const u of [...c.units,...c.units.flatMap(h=>h.joined||[])]) for(const f of ['x','y','models','wounds','face']) if(typeof u[f]==='number'&&!Number.isFinite(u[f])) errs.push(`${key} NaN ${u.name}.${f}`);
      for(const m of c.log) if(/NaN|undefined|\[object/.test(m)) errs.push(`${key} log: ${m}`);
      if(r.ok){ const alive0=c.units.filter(u=>u.models<0); if(alive0.length) errs.push(key+' modelos<0'); }
    }catch(e){errs.push(`${key} EXC ${String(e.stack).split('\n').slice(0,2).join('|')}`);}
   }}
 }
 if(!any) never.push(key);
}
console.log('intentos',tot,'ok',ok,'errores',errs.length,[...new Set(errs)].slice(0,15));
console.log('sin lanzamiento válido',never.length,never.join(','));
