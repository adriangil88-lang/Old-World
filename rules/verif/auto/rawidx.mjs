// v843n: índice crudo de TODAS las apariciones de «Base Size» en los libros: {f, ln, names (filas del perfil que lo precede), base}
import fs from 'fs';
const R = '/home/claude/tow/rules/';
const files = ['fof.txt', 'rh.txt', 'core.txt', 'aj_beasts.txt', 'aj_chaos.txt', 'aj_dwarfs.txt', 'aj_empire.txt', 'aj_orcs.txt', 'aj_tk.txt', 'aj_westerland.txt', 'aj_wood.txt', 'new/aj_bretonnia.txt', 'new/aj_highelves.txt', 'new/aj_wood2.txt', 'new/cathay_aj.txt', 'new/battlemarch.txt', 'new/leg_chaosdwarfs.txt', 'new/leg_daemons.txt', 'new/leg_darkelves.txt', 'new/leg_lizardmen.txt', 'new/leg_ogres.txt', 'new/leg_skaven.txt', 'new/leg_vampires.txt', 'new/faq_rh.txt', 'new/faq_fof.txt', 'new/renegade_web.txt', 'new/sc_shores.txt', 'new/sc_tower.txt', 'new/sc_waystones.txt'];
const out = [];
for (const f of files) {
  if (!fs.existsSync(R + f)) continue;
  const L = fs.readFileSync(R + f, 'utf8').split('\n');
  L.forEach((l, i) => {
    if (!/base\s*size/i.test(l)) return;
    const txt = [l, L[i + 1] || '', L[i + 2] || '', L[i + 3] || ''].join(' ');
    const bases = [...txt.matchAll(/(\d+)\s*(?:mm)?\s*x\s*(\d+)\s*(?:mm)?\s*(\(([^)]*)\))?/gi)].map(m => ({ v: m[1] + 'x' + m[2], label: (m[4] || '').toLowerCase() }));
    const names = []; let hdr = -1;
    for (let j = i; j > Math.max(0, i - 60); j--) { if (/\bW\s*S\b.*\bB\s*S\b|WS\s+BS/i.test(L[j])) { hdr = j; for (let k = j + 1; k < j + 7; k++) { const t = (L[k] || '').trim().replace(/^[^A-Za-z]+/, '').split(/\s{2,}|\s+[0-9-]+\s+[0-9-]+\s/)[0]; if (t && !/^(Troop|Base|Unit|Notes|Equipment)/i.test(t) && t.length < 60) names.push(t); } break; } }
    out.push({ f, ln: i + 1, names, bases });
  });
}
fs.writeFileSync(R + 'verif/auto/out/rawidx.json', JSON.stringify(out));
console.log(out.length);
