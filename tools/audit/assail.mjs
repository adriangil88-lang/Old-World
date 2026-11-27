import { createGame, apply, castCheck, spellTargets, D } from '/home/claude/tow/app/js/rules.js';
import { PRESETS, SPELLS } from '/home/claude/tow/app/js/data.js';
const keys=Object.keys(SPELLS).filter(k=>SPELLS[k].type==='assail');let errs=[],fired=0;const miss=[];
for(const key of keys){let any=false;
 for(let seed=1;seed<=8;seed++){const FAC=Object.keys(PRESETS);const fa=FAC[seed%17],fb=FAC[(seed*5+3)%17];
  const s=createGame({seed,armies:[PRESETS[fa][1000],PRESETS[fb][1000]],factions:[fa,fb],limit:1000,scn:'glory',tmode:'random',sec:'none',gend:'fixed'});
  apply(s,{t:'ready',player:0});apply(s,{t:'ready',player:1});
  const all=s.units.flatMap(h=>[h,...(h.joined||[])]);const wiz=all.find(x=>x.owner===0&&D(x).wizard);if(!wiz)continue;
  wiz.spells=[key];const hh=s.units.find(h=>h===wiz||(h.joined||[]).includes(wiz));const en=s.units.find(x=>x.owner===1&&x.models>0);
  const dd=(hh.baseD||25)/25.4/2+(en.baseD||25)/25.4/2+0.3; en.x=hh.x+Math.cos(hh.face)*3.2; en.y=hh.y+Math.sin(hh.face)*3.2; en.face=hh.face+Math.PI;
  s.active=0;s.phase='shoot';
  try{const r=apply(s,{t:'endPhase'});const msgs=s.log.join('|');if(msgs.includes(SPELLS[key].name)){any=true;fired++;}
   for(const u of s.units) for(const f of ['x','y','models','wounds']) if(!Number.isFinite(u[f])) errs.push(key+' NaN '+u.name+f);
   for(const m of s.log) if(/NaN|undefined/.test(m)) errs.push(key+' log '+m);}catch(e){errs.push(key+' EXC '+String(e.stack).split('\n').slice(0,2).join('|'))}
 }
 if(!any)miss.push(key);}
console.log('assail',keys.length,'disparos',fired,'errores',errs.length,[...new Set(errs)].slice(0,10),'sin disparar',miss.join(','));
