const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
  const reqs = []; p.on('response', r => { if (/\/hd\//.test(r.url())) reqs.push(r.status() + ' ' + r.url().split('/hd/')[1]); });
  p.on('console', m => { if (m.type() === 'error' || /xh|HD/.test(m.text())) console.log('CONSOLE', m.text().slice(0, 200)); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForFunction(() => window.__TOW && window.__TOW.G, null, { timeout: 120000 });
  await p.waitForTimeout(2000);
  const info = await p.evaluate(async () => { const G = await import('/js/gl3d.js'); return { ok: G.gl3.ok, noHD: G.gl3.noHD, ul: typeof DecompressionStream, mobile: navigator.userAgent.slice(0, 60) }; });
  console.log(JSON.stringify(info));
  const FAC = JSON.parse(process.argv[2]); const fac = Object.keys(FAC)[0];
  await p.evaluate(async ([fac, units]) => {
    const T = window.__TOW; const R = await import('/js/render.js'); const RU = await import('/js/rules.js');
    const s0 = RU.createGame({ seed: 7, armies: [units.map(([type, models]) => ({ type, models })), [{ type: 'emp_halberds', models: 5 }]], factions: [fac, 'empire'], limit: 1000 }); s0.terrain = []; R.syncTable(s0); T.G.s = s0; T.G.mode = 'hot'; T.G.demo = false; T.G.curtain = false;
    const us = s0.units.filter(u => u.owner === 0); us.forEach((u, i) => { u.x = 30 + i * 8; u.y = 24; u.face = -Math.PI / 2; }); s0.units.filter(u => u.owner === 1).forEach(u => { u.x = 60; u.y = 40; });
    T.G.aiBusy = true; document.querySelectorAll('.modal,.overlay,#title,#menuScreen').forEach(e => { e.hidden = true; e.style.display = 'none'; });
    if (!R.view.m3) document.getElementById('z3d').click(); R.view.yaw = 0.15; R.view.pitch = 0.55; R.view.close = true; R.fit();
  }, [fac, FAC[fac]]);
  await p.waitForTimeout(20000);
  console.log(JSON.stringify(await p.evaluate(async()=>{const G=await import('/js/gl3d.js');const out={};for(const k of Object.keys(G.gl3.reg)){if(/x_dm_blood|x_dm_blue/.test(k)){const r=G.gl3.reg[k];out[k]={hdm:!!r.hdmReq,parts:r.parts.map(q=>[q.count,!!q.tex,q.hdp||null,!!q.hdReq])}}}return {noHD:G.gl3.noHD,ok:G.gl3.ok,out};})));
  console.log(reqs.filter(x => !/xt_|xu_.*avif/.test(x)).join('\n'));
  await b.close();
})();
