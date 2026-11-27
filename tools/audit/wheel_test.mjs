import { wheelPath, wheelPoses } from '../../app/js/geom.js';
const w = 4;
const cases = [
 [{x:0,y:0,f:0},{x:10,y:0,f:0}],
 [{x:0,y:0,f:0},{x:10,y:3,f:0}],
 [{x:0,y:0,f:0},{x:6,y:4,f:Math.PI/4}],
 [{x:0,y:0,f:0},{x:2,y:2,f:Math.PI/2}],
 [{x:0,y:0,f:0},{x:0.5,y:0.5,f:Math.PI/6}],
 [{x:0,y:0,f:0},{x:0,y:3,f:Math.PI}],
 [{x:0,y:0,f:0},{x:-3,y:0,f:0}],
];
let bad = 0;
for (let k = 0; k < 3000; k++) { const a = {x:0,y:0,f:Math.random()*6.28-3.14}, b = {x:(Math.random()-.5)*30,y:(Math.random()-.5)*30,f:Math.random()*6.28-3.14}; const p = wheelPath(a,b,w); if (!p) bad++; else { const ps = wheelPoses(a,p); const e = ps[ps.length-1]; if (Math.hypot(e.x-b.x,e.y-b.y)>1e-2) { bad++; console.log('mismatch', e, b); } } }
console.log('random no-solution/mismatch', bad, '/3000');
for (const [a,b] of cases) { const p = wheelPath(a,b,w); console.log(JSON.stringify(b), p ? p.cost.toFixed(2)+' '+p.segs.map(([k,v])=>k+v.toFixed(2)).join(' ') : null); }
