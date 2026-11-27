import { UNITS, FIG_ALIAS } from '/home/claude/tow/app/js/data.js';
for (const i of process.argv.slice(2)) { const u=UNITS[i]; console.log(i,'|',u&&u.name,'|',u&&`${u.cat}/${u.tt} base ${u.baseW}x${u.baseD} mount=${u.mount} models=${u.models||u.size||''} min=${u.min} max=${u.max}`,'| alias',FIG_ALIAS[i]||'-'); }
