import { UNITS, FIG_ALIAS } from '/home/claude/tow/app/js/data.js';
const re=new RegExp(process.argv[2],'i');
for (const [k,u] of Object.entries(UNITS)) if (re.test(k)||re.test(u.name||'')) console.log(k,'|',u.name,'|',u.cat+'/'+u.tt,u.baseW+'x'+u.baseD,'| alias',FIG_ALIAS[k]||'-');
