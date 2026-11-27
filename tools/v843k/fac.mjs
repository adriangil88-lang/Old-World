import { UNITS } from '/home/claude/tow/app/js/data.js';
for (const i of process.argv.slice(2)) console.log(i, UNITS[i] && UNITS[i].faction);
