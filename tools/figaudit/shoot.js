// Captura WebGL real (swiftshader) de cada unidad de la facción, cerca y en 3/4 + lado. Uso:
// node shoot.js <pc|iphone> <fac> <outdir> [ids,coma] [views: 3q,side,top]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const [dev, FAC, OUT, ONLY, VIEWS] = [process.argv[2] || 'pc', process.argv[3], process.argv[4] || '/tmp/figtiles', process.argv[5] || '', (process.argv[6] || '3q,side').split(',')];
const TILE = parseInt(process.env.TILE || '300');
const BASE = process.env.BASE || 'http://localhost:8765';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const VPW = parseInt(process.env.VPW || '1280'), VPH = parseInt(process.env.VPH || '800');
  const opt = dev === 'iphone' ? { ...devices['iPhone 14 Pro'], viewport: { width: VPW === 1280 ? 393 : VPW, height: VPH === 800 ? 852 : VPH } } : { viewport: { width: VPW, height: VPH }, deviceScaleFactor: 1 };
  // v843m: el servidor estatico debe estar en BASE (python3 -m http.server 8765 en app/); si no responde se levanta aqui. El service worker se bloquea (sw.js cachea y retrasa/ensucia la carga en headless).
  let srv = null; try { await fetch(BASE + '/index.html'); } catch { srv = require('child_process').spawn('python3', ['-m', 'http.server', String(new URL(BASE).port || 8765)], { cwd: __dirname + '/../../app', stdio: 'ignore' }); await new Promise(r => setTimeout(r, 1200)); }
  const ctx = await b.newContext({ ...opt, serviceWorkers: 'block' });
  if (process.env.GFX) await ctx.addInitScript((g) => { try { localStorage.setItem('tow_gfx', g); } catch {} }, process.env.GFX);
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 400)); });
  await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__TOW && window.__TOW.G, null, { timeout: 120000 }).catch(e => { console.log('ARRANQUE FALLIDO', e.message.slice(0, 120), JSON.stringify(errs.slice(0, 5))); process.exit(2); });
  if (process.env.PITCH) await p.evaluate((v) => { window.__PITCH = parseFloat(v); }, process.env.PITCH);
  if (!process.env.KEEPUI) await p.addStyleTag({ content: '#tools,#top,#panel,#actions,#fab,#banner,#toast,#coach,#placebar,#dice,#rotHud,#sheetHandle,#tabs,#cv{display:none!important}' });
  if (process.env.DUMP) await p.evaluate(() => { window.__DUMP = 1; });
  if (process.env.YAW) await p.evaluate((y) => { window.__YAWENV = y; }, process.env.YAW);
  await p.waitForTimeout(2000);
  const audit = JSON.parse(fs.readFileSync(process.env.AUDIT || '/tmp/figaudit.json')); const AH = {}; for (const r of audit) if (!r.rear) AH[r.id] = r;
  const ids = await p.evaluate(async (fac) => { const D = await import('/js/data.js'); return D.ARMIES[fac].filter(k => !D.UNITS[k].legacy || 1); }, FAC);
  const sel = ONLY ? ONLY.split(',') : ids;
  const BATCH = parseInt(process.env.BATCH || '6');
  const t0 = Date.now(); const meta = [];
  for (let bi = 0; bi < sel.length; bi += BATCH) {
    const grp = sel.slice(bi, bi + BATCH);
    await p.evaluate(() => { if (window.__raf0) { window.requestAnimationFrame = window.__raf0; window.__raf0(() => 0); } });
    const info = await p.evaluate(async ([fac, grp]) => {
      const D = await import('/js/data.js');
      return grp.filter(type => D.UNITS[type]).map(type => { const d = D.UNITS[type]; const f = d.files || 5; let n = d.cat === 'char' || d.cat === 'mon' || d.cat === 'mach' || d.tt === 'behemoth' || d.tt === 'monCreature' ? (d.min || 1) : Math.min(d.max || 10, f * 2); n = Math.max(1, Math.min(n, 10)); return { type, n }; });
    }, [FAC, grp]);
    if (!process.env.NOSTUB) await p.evaluate(() => { window.__raf0 = window.__raf0 || window.requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; });
    if (process.env.DBG) console.log('  preload done', (Date.now() - t0) / 1000 | 0);
    for (const u of info) { u.H = (AH[u.type] && AH[u.type].H) || 2.0;
      for (const vw of VIEWS) {
        const url = await p.evaluate(async ([u, vw, TILE, rid, fac, first]) => {
          const T = window.__TOW; const R = await import('/js/render.js'); const G = T.G;
          if (first) {
            const RU = await import('/js/rules.js'); const D = await import('/js/data.js');
            if (window.__YAWENV) for (const kv of window.__YAWENV.split(',')) { const [k, v] = kv.split(':'); R.YAWFIX[k] = parseFloat(v); }
            const d0 = D.UNITS[u.type]; if (d0 && d0.sr) d0.sr = d0.sr.filter(x => !/ambush|flank|scout|reserve/i.test(x));
            const opp = fac === 'empire' ? 'orcs' : 'empire';
            const s0 = RU.createGame({ seed: 7, armies: [[{ type: u.type, models: u.n }], [{ type: opp === 'orcs' ? 'orc_boyz' : 'emp_halberds', models: 5 }]], factions: [fac, opp], limit: 1000 });
            s0.terrain = []; R.syncTable(s0); T.G.s = s0; T.G.mode = 'hot'; T.G.demo = false; T.G.curtain = false; T.G.aiBusy = true;
            document.querySelectorAll('.modal,.overlay,#title,#menuScreen,#menu').forEach(e => { e.hidden = true; e.style.display = 'none'; });
            if (!R.view.m3) document.getElementById('z3d').click();
            s0.units.filter(q => q.owner === 1).forEach(q => { q.x = 70; q.y = 44; });
          }
          const s = G.s;
          const mineU = s.units.find(q => q.owner === 0 && q.type === u.type); if (!mineU) return null; const uid = mineU.id;
          const us = s.units.filter(q => q.owner === 0);
          us.forEach(q => { if (q.id === uid) { q.x = 36; q.y = 24; q.face = vw === 'side' ? 0 : vw === 'top' ? Math.PI / 2 : Math.PI / 2 + 0.6; } else { q.x = -40; q.y = -40; } });
          const { dims } = await import('/js/geom.js'); const uu = s.units.find(q => q.id === uid); const dm = dims(uu);
          R.view.yaw = 0; R.view.close = true; R.fit(); R.view.pitch = window.__PITCH != null ? window.__PITCH : vw === 'top' ? 1.2 : 0.5; R.view.dcam = 40;
          T.UI.userZoom = true;
          const raf = () => new Promise(r => requestAnimationFrame(r));
          const H = Math.max(0.8, Math.min(14, u.H));
          const box = () => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const c = Math.cos(uu.face), sn = Math.sin(uu.face);
            for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const z of [0, H]) { const lx = sx * dm.d / 2, ly = sy * dm.w / 2; const p = R.t3p(36 + c * lx - sn * ly, 24 + sn * lx + c * ly, z); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); } return { x0, x1, y0, y1 }; };
          R.view.scale = 40; R.view.px = 0; R.view.py = 0; R.focus({ x: 36, y: 24 }, 40);
          const cvv = document.getElementById('cv'); const dw = () => { R.draw(cvv, { ...G.s }, T.UI, G); };
          { const dw0 = () => R.draw(document.getElementById('cv'), { ...G.s }, T.UI, G); const GL = await import('/js/gl3d.js'); let tries = 0;
            for (; tries < parseInt(window.__WAIT || 240); tries++) { dw0(); const rg = rid && GL.gl3.reg['m:' + rid]; if (!rid || (rg && rg.parts.every(q => q.tex && !q.flat === !q.flat))) break; await new Promise(r => setTimeout(r, 250)); }
            if (tries) await new Promise(r => setTimeout(r, 400)); }
          const sc = Math.max(8, Math.min(200, Math.min(R.view.w, R.view.h) * 0.8 / (Math.max(dm.w, dm.d) * 1.15 + 0.7 * H))); R.view.scale = sc; R.focus({ x: 36, y: 24 }, sc); R.view.py += sc * 0.2 * H;
          const c = document.getElementById('gl'), k = c.width / R.view.w;
          const snap = () => { const o = document.createElement('canvas'); o.width = c.width >> 2; o.height = c.height >> 2; const g = o.getContext('2d'); g.drawImage(c, 0, 0, o.width, o.height); return g.getImageData(0, 0, o.width, o.height).data; };
          dw(); const Afull = document.createElement('canvas'); Afull.width = c.width; Afull.height = c.height; Afull.getContext('2d').drawImage(c, 0, 0); const A = snap();
          uu.x = -40; uu.y = -40; dw(); const B = snap();
          uu.x = 36; uu.y = 24;
          if (window.__DUMP) console.error('DBGV', JSON.stringify({v: R.view, uu: [uu.x, uu.y, uu.face, uu.models], dm, H, sc})); if (window.__DUMP) window.__dumpA = Afull.toDataURL('image/jpeg', 0.6);
          const W4 = c.width >> 2; const xsA = [], ysA = [];
          for (let i = 0; i < A.length; i += 4) { const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]); if (d > 60) { xsA.push((i / 4) % W4); ysA.push(((i / 4) / W4) | 0); } }
          const pcq = (a, p) => { a.sort((u, v) => u - v); return a[Math.min(a.length - 1, Math.max(0, Math.floor(p * a.length)))]; };
          let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; if (xsA.length > 12) { x0 = pcq(xsA, 0.005); x1 = pcq(xsA, 0.995); y0 = pcq(ysA, 0.005); y1 = pcq(ysA, 0.995); }
          if (x1 < 0) { x0 = W4 / 2 - 20; x1 = W4 / 2 + 20; y0 = (c.height >> 2) / 2 - 20; y1 = (c.height >> 2) / 2 + 20; }
          const ccx = (x0 + x1) / 2 * 4, ccy = (y0 + y1) / 2 * 4, side = Math.max(x1 - x0, y1 - y0) * 4 * 1.15 + 16;
          const o = document.createElement('canvas'); o.width = TILE; o.height = TILE; const g = o.getContext('2d');
          g.fillStyle = '#222'; g.fillRect(0, 0, TILE, TILE); g.drawImage(Afull, ccx - side / 2, ccy - side / 2, side, side, 0, 0, TILE, TILE);
          return o.toDataURL('image/jpeg', 0.84);
        }, [u, vw, TILE, (AH[u.type] && AH[u.type].rid) || '', FAC, vw === VIEWS[0]]);
        if (process.env.DUMP) { const d = await p.evaluate(() => window.__dumpA); fs.writeFileSync(`${OUT}/dump_${u.type}_${vw}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
        if (!url) { console.log('  sin unidad', u.type); continue; }
        const tA = Date.now(); const fn = `${OUT}/${FAC}__${u.type}__${vw}.jpg`;
        fs.writeFileSync(fn, Buffer.from(url.split(',')[1], 'base64'));
        const tB = tA;
        meta.push(fn); if (process.env.DBG) console.log('  tile', u.type, (Date.now() - t0) / 1000 | 0, 'raf+wait', tB - tA, 'shot', Date.now() - tB);
      }
    }
    console.log(FAC, 'batch', bi, (Date.now() - t0) / 1000 | 0, 's');
  }
  console.log('errors:', JSON.stringify(errs.slice(0, 5))); await b.close(); if (srv) srv.kill();
})();
