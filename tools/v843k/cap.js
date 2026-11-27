const { chromium } = require('playwright');
const FAC = JSON.parse(process.argv[2]); // {fac:[[type,models],...]}
const VP = process.argv[3] === 'm' ? { width: 393, height: 852 } : { width: 1280, height: 800 };
const OUT = process.argv[4] || '/tmp/a/shots';
const ZOOM = parseFloat(process.argv[5] || '0');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForFunction(() => window.__TOW && window.__TOW.G, null, { timeout: 120000 });
  await p.waitForTimeout(3000);
  for (const [fac, units] of Object.entries(FAC)) {
    const info = await p.evaluate(async ([fac, units, ZOOM]) => {
      const T = window.__TOW; const R = await import('/js/render.js');
      const opp = fac === 'empire' ? 'orcs' : 'empire';
      const A = units.map(([type, models]) => ({ type, models }));
      const RU = await import('/js/rules.js'); const B = [{ type: opp === 'orcs' ? 'orc_boyz' : 'emp_halberds', models: 5 }];
      const s0 = RU.createGame({ seed: 7, armies: [A, B], factions: [fac, opp], limit: 1000 }); s0.terrain = []; R.syncTable(s0); T.G.s = s0; T.G.mode = 'hot'; T.G.demo = false; T.G.curtain = false;
      const s = T.G.s; const us = s.units.filter(u => u.owner === 0);
      us.forEach((u, i) => { u.x = 30 + i * 6; u.y = 24; u.face = -Math.PI / 2; });
      s.units.filter(u => u.owner === 1).forEach(u => { u.x = 60; u.y = 40; });
      T.G.aiBusy = true; const t = document.getElementById('tNew'); 
      return us.map(u => u.type + ':' + u.models);
    }, [fac, units, ZOOM]);
    await p.evaluate(async (ZOOM) => {
      const R = await import('/js/render.js'); const T = window.__TOW; const s = T.G.s; R.syncTable && R.syncTable(s);
      const m = document.getElementById('menu'); if (m) m.hidden = true;
      document.querySelectorAll('.modal,.overlay,#title,#menuScreen').forEach(e => { e.hidden = true; e.style.display = 'none'; });
      if (!R.view.m3) document.getElementById('z3d').click();
      const us = s.units.filter(u => u.owner === 0); const cx = us.reduce((a, u) => a + u.x, 0) / us.length;
      R.view.yaw = 0.15; R.view.pitch = 0.55; R.view.close = true; R.fit && R.fit();
      if (ZOOM) { T.UI.userZoom = true; R.view.scale = ZOOM; R.focus({ x: cx, y: 24 }, ZOOM); }
    }, ZOOM);
    await p.waitForTimeout(parseInt(process.env.WAIT||"14000"));
    await p.screenshot({ path: `${OUT}_${fac}_${process.argv[3]}.png`, timeout: 150000 });
    console.log(fac, JSON.stringify(info));
  }
  console.log('errors:', JSON.stringify(errs.slice(0, 5))); await b.close();
})();
