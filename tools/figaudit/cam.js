// Cámara por defecto en partida (despliegue y combate) en iPhone 14 Pro (descriptor Playwright, 393x852) y PC 1280x800, 3D y 2D.
// node cam.js <iphone|pc> <outprefix> [side] [opp]   (BASE=http://localhost:8765)
const { chromium, devices } = require('playwright');
const [dev, OUT, SIDE, OPP] = [process.argv[2] || 'iphone', process.argv[3] || '/tmp/cam', process.argv[4] || 'empire', process.argv[5] || 'orcs'];
const BASE = process.env.BASE || 'http://localhost:8765';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const opt = dev === 'iphone' ? { ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 } } : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };
  const ctx = await b.newContext(opt); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__TOW && window.__TOW.G !== undefined, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  await p.evaluate(([a, o]) => { const S = window.__TOW.setup; S.side = a; S.opp = o; S.limit = 1500; S.alt = false; }, [SIDE, OPP]);
  await p.evaluate(() => { document.getElementById('tNew')?.click(); }); await p.waitForTimeout(600);
  await p.evaluate(() => { document.getElementById('mStart')?.click(); }); await p.waitForTimeout(parseInt(process.env.WAIT || '9000'));
  const info = async (tag) => {
    const r = await p.evaluate(async () => {
      const R = await import('/js/render.js'); const T = window.__TOW; const s = T.G && T.G.s; const v = R.view;
      const us = s ? s.units.filter(u => u.owner === 0 && u.models > 0) : [];
      const pr = (x, y, z) => { const a = R.t3p ? R.t3p(x, y, z) : null; return a; };
      let m = {}; if (us[0]) { const u = us[0]; const a = R.w2s({ x: u.x - u.baseW / 50.8, y: u.y }), b2 = R.w2s({ x: u.x + u.baseW / 50.8, y: u.y }); m.basePx = Math.hypot(a.x - b2.x, a.y - b2.y); if (v.m3) { const t = R.t3p(u.x, u.y, 1.15), g = R.t3p(u.x, u.y, 0); m.figPx = Math.hypot(t.x - g.x, t.y - g.y); } }
      let out = 0; for (const u of us) { const q = R.w2s({ x: u.x, y: u.y }); if (q.x < 0 || q.y < 0 || q.x > v.w || q.y > v.h) out++; }
      return { scale: +v.scale.toFixed(2), m3: v.m3, k: v.k, close: !!v.close, w: v.w, h: v.h, dcam: v.dcam, phase: s && s.phase, units: us.length, outside: out, ...m };
    });
    console.log(tag, JSON.stringify(r)); return r;
  };
  await p.screenshot({ path: `${OUT}_2d.jpg`, type: 'jpeg', quality: 60, scale: 'css', timeout: 180000 }); await info('2D default');
  await p.evaluate(() => document.getElementById('z3d').click()); await p.waitForTimeout(4000);
  await p.screenshot({ path: `${OUT}_3d.jpg`, type: 'jpeg', quality: 60, scale: 'css', timeout: 180000 }); await info('3D default');
  await p.evaluate(() => document.getElementById('zFit').click()); await p.waitForTimeout(4000);
  await p.screenshot({ path: `${OUT}_3dclose.jpg`, type: 'jpeg', quality: 60, scale: 'css', timeout: 180000 }); await info('3D close');
  console.log('errors:', JSON.stringify(errs.slice(0, 3))); await b.close();
})();
