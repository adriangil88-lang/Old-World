import {UNITS} from '/home/claude/tow/app/js/data.js';
import {D} from '/home/claude/tow/app/js/rules.js';
const bad={};
for(const [k,v] of Object.entries(UNITS)){const d=D({type:k,models:1,items:[]});
 for(const f of ['M','WS','BS','S','T','W','I','A','Ld','minRank','maxRank','baseW','baseD','pts','minM']){ if(d[f]===undefined||(typeof d[f]==='number'&&!Number.isFinite(d[f]))) (bad[f]??=[]).push(k);}}
for(const f in bad)console.log(f,bad[f].length,bad[f].slice(0,12).join(','));
