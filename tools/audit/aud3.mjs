import fs from 'node:fs';
import {unitDist} from '/home/claude/tow/app/js/geom.js';
import {rangedOf, createGame, apply, D, alive, MAX_TURNS, TABLE_W, TABLE_H, SCN_IDS, unitPts, scoreVP, isEngaged} from '/home/claude/tow/app/js/rules.js';
import {PRESETS} from '/home/claude/tow/app/js/data.js';
import {nextAction, mkRng, LEVELS} from '/home/claude/tow/app/js/ai.js';
const w=JSON.parse(fs.readFileSync('/home/claude/tow/app/weights.json')).weights;
const FACS=Object.keys(PRESETS);
const [,, A0='0', A1='272', LIM='1000', FZ='0'] = process.argv;
const FUZZ=FZ==='1';let frng=mkRng(12345);
const pairs=[];for(const a of FACS)for(const b of FACS)pairs.push([a,b]);
const viol={}, cov={}, errs=[];
const V=(k,msg)=>{(viol[k]??=[]);if(viol[k].length<4)viol[k].push(msg);viol[k].n=(viol[k].n||0)+1;};
const MIXS=['none','loc','feat','dom','bag','loc2','loc4','none'];
function inv(s,ctx){
  const all=[];
  for(const u of s.units){all.push(u);for(const j of u.joined||[])all.push(j);}
  for(const u of all){
    for(const k of ['x','y','models','wounds','face']) if(typeof u[k]==='number'&&!Number.isFinite(u[k])) V('nan',`${ctx} ${u.name}.${k}=${u[k]}`);
    if(u.models<0) V('negModels',`${ctx} ${u.name} ${u.models}`);
    if(u.models>(u.startModels||0)+0 && !u.raised) V('overModels',`${ctx} ${u.name} ${u.models}>${u.startModels}`);
    const d=D(u); 
    if(u.models>0&&typeof u.wounds==='number'&&u.wounds>u.models*d.W+0.001&&!u.joined) V('woundsOver',`${ctx} ${u.name} w${u.wounds} m${u.models} W${d.W}`);
    if(u.models>0&&u.wounds<=0&&!u.joined&&d.cat!=='mach') V('zeroWounds',`${ctx} ${u.name} w${u.wounds} m${u.models}`);
    if(u.models>0&&!u.reserved&&!u.off&&!u.inBuilding&&u.x!==undefined&&(u.x<-1||u.x>TABLE_W+1||u.y<-1||u.y>TABLE_H+1)) V('offTable',`${ctx} ${u.name} ${u.x.toFixed(1)},${u.y.toFixed(1)}`);
  }
  const ids=new Set();for(const u of all){if(ids.has(u.id))V('dupId',`${ctx} ${u.id}`);ids.add(u.id);}
  for(const h of s.units)for(const j of h.joined||[]) if(h.models<=0&&j.models>0&&h.joined.length&&false) V('orphan',ctx);
  for(const m of s.log.slice(-6)) if(/NaN|undefined|\[object|Infinity/.test(m)) V('badLog',`${ctx} ${m}`);
}
function ovl(s,ctx){
  const L=alive(s).filter(u=>!u.reserved&&!u.inBuilding&&u.x!==undefined);
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.owner===b.owner)continue;
    const dx=a.x-b.x,dy=a.y-b.y; if(Math.hypot(dx,dy)<0.8 && D(a).cat!=='mach'&&D(b).cat!=='mach') V('stack',`${ctx} ${a.name}/${b.name} d=${Math.hypot(dx,dy).toFixed(2)}`);}
}

function mkFuzz(s,p,R){
  const pick=a=>a[Math.floor(R()*a.length)];if(!s.units.length||!s.terrain.length)return null;
  const all=[];for(const u of s.units){all.push(u);for(const j of u.joined||[])all.push(j);}
  const mine=s.units.filter(u=>u.owner===p),any=all;
  const typ=pick(['join','leave','react','chalPol','restrain','move','move','charge','shoot','cast','enter','deployMove','gaze','garrison','flank','endPhase0']);
  const ch=any.filter(u=>D(u).cat==='char');
  switch(typ){
   case 'join':return ch.length?{t:'join',id:pick(ch).id,to:pick(s.units).id}:null;
   case 'leave':{const h=s.units.filter(u=>(u.joined||[]).length);return h.length?{t:'leave',id:pick(h).id}:null;}
   case 'react':return {t:'react',id:pick(any).id,v:pick(['auto','hold','flee','bad'])};
   case 'chalPol':return {t:'chalPol',id:pick(any).id,v:pick(['auto','always','never','x'])};
   case 'restrain':return {t:'restrain',id:pick(any).id,v:pick(['auto','try','pursue','z'])};
   case 'move':return {t:'move',id:pick(any).id,x:R()*80-4,y:R()*56-4,face:R()*6.3,march:R()<.5};
   case 'charge':return {t:'charge',id:pick(any).id,target:pick(any).id};
   case 'shoot':return {t:'shoot',id:pick(any).id,target:pick(any).id};
   case 'cast':{const w=any.filter(u=>D(u).wizard);if(!w.length)return null;const u=pick(w);const sp=D(u).wizard.spells||[];return {t:'cast',id:u.id,spell:sp.length?pick(sp):'x',target:pick(any).id};}
   case 'enter':{const r=s.reserves||[];return r.length?{t:'enter',id:pick(r).id,x:R()*72}:null;}
   case 'deployMove':return {t:'deployMove',id:pick(s.units).id,x:R()*72,y:R()*48,face:R()*6.3};
   case 'gaze':return {t:'gaze',id:pick(any).id};
   case 'garrison':return {t:'garrison',id:pick(mine).id,to:pick(s.terrain).id};
   case 'flank':return {t:'flank',id:pick(s.units).id,side:pick(['L','R','X',null])};
   default:return null;}
}
const dd=(a,b,p,o)=>{if(o.length>3)return;if(typeof a!=='object'||a===null||b===null||typeof b!=='object'){if(a!==b)o.push(p+':'+a+'→'+b);return;}for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(!['log','rng','seed'].includes(k))dd(a[k],b[k],p+'.'+k,o)};
let games=0,acts=0;
const t0=Date.now();
for(let g=+A0;g<Math.min(+A1,pairs.length);g++){
  const facs=pairs[g]; const seed=5000+g; const limit=+LIM;
  try{
    const armies=facs.map(f=>PRESETS[f][limit]);
    const s=createGame({seed,armies,factions:facs,limit,scn:SCN_IDS[seed%SCN_IDS.length],tmode:seed%3===0?'classic':'random',sec:MIXS[(seed>>3)%8],gend:['fixed','random','break'][seed%3]});
    for(const o of [0,1]){const pts=s.units.filter(u=>u.owner===o).reduce((t,u)=>t+unitPts(u),0);if(pts>limit*1.2+200)V('armyOver',`${facs[o]} ${pts}>${limit}`);}
    apply(s,{t:'ready',player:0});apply(s,{t:'ready',player:1});
    const cfgs=[{weights:w,level:LEVELS.medium,rng:mkRng(seed*7+1)},{weights:w,level:LEVELS.medium,rng:mkRng(seed*13+5)}];
    const st={done:new Set()};let guard=0,turnSeen=0,lastActive=-1;
    while(s.phase!=='over'&&guard++<3000){
      const p=s.active;const ph=s.phase;
      if(p!==lastActive){st.done.clear();lastActive=p;}
      let a=nextAction(s,cfgs[p],st);
      let fuzz=false;
      if(FUZZ&&frng()<0.3){const f=mkFuzz(s,p,frng);if(f){a=f;fuzz=true;}}
      const snap=fuzz?JSON.stringify(s,(k,v)=>k==='log'||k==='rng'||k==='seed'?undefined:k==='joined'?v.map(j=>j.id+':'+j.models+':'+j.wounds):v):null;const snapO=fuzz?JSON.parse(snap):null;
      const before=new Map();for(const u of alive(s))before.set(u.id,{x:u.x,y:u.y,m:u.models});
      const logN=s.log.length;
      const wb=new Map();for(const u of s.units){wb.set(u.id,u.wounds);for(const j of u.joined||[])wb.set(j.id,j.wounds);}
      const fleeB=new Set(alive(s).filter(u=>u.fleeing).map(u=>u.id));
      const dBefore=(a.t==='charge'||a.t==='shoot')?(()=>{const x=s.units.find(q=>q.id===a.id),y=s.units.find(q=>q.id===a.target);return x&&y?unitDist(x,y):null})():null;
      let r;try{r=apply(s,a);}catch(e){errs.push(`${facs} seed${seed} ${fuzz?'FUZZ ':''}${JSON.stringify(a)}: ${String(e.stack).split('\n').slice(0,3).join('|')}`);break;}
      if(fuzz){cov['fz:'+a.t+(r.ok?':ok':':no')]=(cov['fz:'+a.t+(r.ok?':ok':':no')]||0)+1;
        if(!r.ok){const sn2=JSON.stringify(s,(k,v)=>k==='log'||k==='rng'||k==='seed'?undefined:k==='joined'?v.map(j=>j.id+':'+j.models+':'+j.wounds):v);if(sn2!==snap){let i=0;while(snap[i]===sn2[i])i++;{const dl=[];dd(snapO,JSON.parse(sn2),'',dl);V('failMutates',dl.slice(0,3).join(' ; ')+' @@ '+`@${snap.slice(Math.max(0,i-60),i+40)} || ${sn2.slice(Math.max(0,i-60),i+40)} `+`${facs} s${seed} ${JSON.stringify(a)} -> ${r.error}`);}}}}
      acts++;
      cov['a:'+a.t]=(cov['a:'+a.t]||0)+1;
      if(!r.ok){if(!fuzz){const r2=apply(s,{t:'endPhase'});st.done.clear();}continue;}
      if(!fuzz&&a.t==='endPhase'&&ph!==s.phase)st.done.clear();
      const ctx=`${facs.join('v')} s${seed} T${s.turn} ${ph}/${a.t}`;
      // movimiento máximo
      if(a.t==='move'||a.t==='charge'){const u=s.units.find(x=>x.id===a.id);const b=before.get(a.id);
        if(u&&b&&u.models>0&&!u.reserved){const d=Math.hypot(u.x-b.x,u.y-b.y);const M=D(u).M||0;const lim=a.t==='charge'?Math.max(M*2,12)+3:Math.max(M*2,12)+3;
          if(d>lim+ (has2(u)?M:0)) V('moveTooFar',`${ctx} ${u.name} ${d.toFixed(1)} M${M}`);}}
      cov['pp:'+ph+'/'+a.t]=(cov['pp:'+ph+'/'+a.t]||0)+1;
      if(!fuzz){
        const okPh={charge:['move'],shoot:['shoot'],move:['move','deploy'],cast:['strategy','combat','move','shoot'],gaze:['strategy'],enter:['move'],garrison:['move'],ungarrison:['move']};
        if(okPh[a.t]&&!okPh[a.t].includes(ph))V('phaseAct',`${a.t} en ${ph}`);
        const msgs=s.log.slice(logN).join(' | ');
        for(const u of s.units.concat(s.units.flatMap(h=>h.joined||[]))){const b=wb.get(u.id);if(b!==undefined&&u.wounds>b+1e-9&&!/recupera|alza|regener|reagrup|invoca|levant|une|cura|vuelven|recobra|resucit|reanim|reclut|refuerz|devora|alimenta|sangre|toma|absorb|vigor|eleva|restaur|sana|Vorpal|crece|aumenta/i.test(msgs))V('woundsUp',`${ctx} ${u.name} ${b}→${u.wounds} :: ${msgs.slice(0,160)}`);}
        if(a.t==='shoot'&&dBefore!==null&&r.ok){const sh=s.units.find(q=>q.id===a.id);const rg=sh&&rangedOf(sh);if(rg&&dBefore>(rg.range||0)+0.6&&!/Cañón|Catapulta|Lanzaproyectiles|vuelo/i.test(msgs))V('shootRange',`${ctx} ${sh.name} d=${dBefore.toFixed(1)} R=${rg.range}`);}
        if(a.t==='charge'&&dBefore!==null){const ch=s.units.find(q=>q.id===a.id);if(ch&&dBefore>D(ch).M*2+13)V('chargeFar',`${ctx} ${ch.name} d=${dBefore.toFixed(1)} M${D(ch).M}`);
          cov['chargeResult:'+(/falla|fallida|no alcanza|corta/i.test(msgs)?'fail':'ok')]=(cov['chargeResult:'+(/falla|fallida|no alcanza|corta/i.test(msgs)?'fail':'ok')]||0)+1;}
        for(const e of r.events||[]) if(e.k==='combat'&&e.ids){cov['combats']=(cov['combats']||0)+1; if(e.ra===e.rb)cov['combatTie']=(cov['combatTie']||0)+1;
          const win=e.ra>e.rb?0:e.rb>e.ra?1:-1;
          for(const id of e.ids){const u=s.units.find(q=>q.id===id);if(!u||u.models<=0)continue;
            if(u.fleeing&&!fleeB.has(id)){ if(u.owner===win)V('winnerFlees',`${ctx} ${u.name} ${e.ra}-${e.rb} :: ${msgs.slice(0,200)}`); if(win===-1)V('tieFlees',`${ctx} ${u.name} ${e.ra}-${e.rb} :: ${msgs.slice(0,200)}`); if(u.owner!==win&&win>=0)cov['loserFlees']=(cov['loserFlees']||0)+1;}}}
      }
      // eventos del log -> cobertura
      for(const m of s.log.slice(logN)){const k=(m.match(/\b(psicolog|Pánico|Terror|Miedo|Frenesí|Estupidez|Furia asesina|Odio|Regener|Salvación especial|Ward|Disipa|Vórtice|Sangre|Emboscad|Huye|Reagrupa|persecu|Alcanza|Barrido|Rompe|Aniquil|Desborda|Choque|Carga|Lanza|Hechizo|Magia|Canaliz|Irresistible|Percance|Fallo|Explosi|Tirada|Cañón|Catapulta|Fuego|Veneno|Aliento|Impacto|Pisote|Ataques de Impacto|Sin retorno|Muerte instant|Rayo|Meteoro|Reserva|guarnic|edific|fortific|Objetivo|Escaramuz|Volador|Vuelo|Vuela|Gigante|Titán|Monstruo|Bestia|Carro|Inestable|Aturdid|Desmoraliza|Invoca|Desbandada)/gi)||[]);for(const x of k)cov['l:'+x.toLowerCase()]=(cov['l:'+x.toLowerCase()]||0)+1;}
      inv(s,ctx); if(s.phase!==ph) ovl(s,ctx);
      if(s.turn>(s.gend==='fixed'?MAX_TURNS:12)+1&&s.gend!=='random') V('turnOver',`${ctx} turn ${s.turn}`);
    }
    if(s.phase!=='over'){apply(s,{t:'endPhase'});if(s.phase!=='over')V('noEnd',`${facs} seed${seed} phase ${s.phase} T${s.turn} guard${guard}`);}
    if(s.winner===undefined||s.winner===null)V('noWinner',`${facs} seed${seed}`);
    games++;
    const v=[scoreVP(s,0),scoreVP(s,1)];cov['win:'+s.winner]=(cov['win:'+s.winner]||0)+1;
    if(v[0]>v[1]&&s.winner===1||v[1]>v[0]&&s.winner===0)V('winnerVsVP',`${facs} seed${seed} vp ${v} w${s.winner}`);
  }catch(e){errs.push(`${facs} seed${seed}: ${String(e.stack).split('\n').slice(0,3).join('|')}`);}
}
function has2(u){const d=D(u);return !!(d.sr&&(d.sr.includes('fly')||d.sr.includes('swift')||d.sr.includes('fast')));}
fs.writeFileSync(`/tmp/au/out_${A0}${FZ==='1'?'f':''}.json`,JSON.stringify({games,acts,errs,viol,cov,secs:(Date.now()-t0)/1000},null,1));
console.log('games',games,'acts',acts,'errs',errs.length,'viol',Object.keys(viol).map(k=>k+':'+viol[k].n).join(' '),(Date.now()-t0)/1000+'s');
