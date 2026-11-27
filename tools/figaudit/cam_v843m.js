// v843m — medición de la cámara 3D de «acercar a tu lado» (view.close) en iPhone 14 Pro (393x852, dsf 3) y PC (1280x800): px por pulgada, tamaño de la figura cercana y unidades fuera de plano, con el factor de zoom antes (móvil 2,0) y después (2,6), y a zoom máximo.
// node cam_v843m.js   (BASE=http://localhost:8765; el servidor de app/ se levanta solo si no responde)
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765';
(async () => {
  let srv = null; try { await fetch(BASE + '/index.html'); } catch { srv = require('child_process').spawn('python3', ['-m', 'http.server', String(new URL(BASE).port || 8765)], { cwd: __dirname + '/../../app', stdio: 'ignore' }); await new Promise(r => setTimeout(r, 1200)); }
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const out = {};
  for (const dev of ['iphone', 'pc']) {
    const opt = dev === 'iphone' ? { ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 } } : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };
    const ctx = await b.newContext({ ...opt, serviceWorkers: 'block' }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__TOW && window.__TOW.G !== undefined, null, { timeout: 120000 }); await p.waitForTimeout(1500);
    out[dev] = await p.evaluate(async (dev) => {
      const D = await import('/js/data.js'), RU = await import('/js/rules.js'), R = await import('/js/render.js'), T = window.__TOW, v = R.view;
      window.__TOW_NOACK = true;
      const s0 = RU.createGame({ seed: 7, armies: [D.PRESETS.empire[1500], D.PRESETS.orcs[1500]], factions: ['empire', 'orcs'], limit: 1500, alt: false, tmode: 'classic' });
      R.syncTable(s0); T.G.s = s0; T.G.mode = 'hot'; T.G.demo = false; T.G.curtain = false; T.G.aiBusy = true;
      document.querySelectorAll('.modal,.overlay,#title,#menuScreen,#menu').forEach(e => { e.hidden = true; e.style.display = 'none'; });
      // despliegue típico: mis unidades en filas a mi lado de la mesa
      { let i = 0; for (const u of s0.units.filter(q => q.owner === 0)) { u.x = 10 + (i % 5) * 12; u.y = s0.th - 8 - Math.floor(i / 5) * 8; u.face = -Math.PI / 2; i++; } }
      if (!v.m3) document.getElementById('z3d').click();
      v.m3 = 1; v.close = true; v.yaw = 0; R.fit();
      const us = s0.units.filter(q => q.owner === 0 && q.models > 0);
      const ref = us.find(x => /state_troops|halberd/.test(x.type)) || us[0];
      const meas = () => {
        const t = R.t3p(ref.x, ref.y, 1.15), g = R.t3p(ref.x, ref.y, 0), a = R.w2s({ x: ref.x - 0.5, y: ref.y }), c = R.w2s({ x: ref.x + 0.5, y: ref.y });
        let outn = 0; for (const q of us) { const w = R.w2s({ x: q.x, y: q.y }); if (w.x < 0 || w.y < 0 || w.x > v.w || w.y > v.h) outn++; }
        return { scale: +v.scale.toFixed(2), figPx: +Math.hypot(t.x - g.x, t.y - g.y).toFixed(1), pxPerInch: +Math.hypot(a.x - c.x, a.y - c.y).toFixed(2), unitsOutside: outn, nUnits: us.length, dpr: window.devicePixelRatio, vw: v.w, vh: v.h };
      };
      const r = { after_fit: meas() };
      if (dev === 'iphone') { // «antes» = mismo encuadre con factor 2,0 en vez de 2,6
        const th = R.TH, k = 2.0 / 2.6; v.scale *= k; v.py = -th * Math.sin(v.pitch) * v.scale * 0.11; r.before_z2_0 = meas(); R.fit(); }
      const sc0 = v.scale, px0 = v.px, py0 = v.py; R.zoomAt(v.w / 2, v.h / 2, 100); r.zoom_max = meas(); v.scale = sc0; v.px = px0; v.py = py0;
      return r;
    }, dev);
    console.log(dev, JSON.stringify(out[dev])); if (errs.length) console.log('errores', errs.slice(0, 3)); await ctx.close();
  }
  await b.close(); if (srv) srv.kill();
})();
