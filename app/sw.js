// Service worker: la app funciona sin conexión tras la primera carga.
const V = 'tow-v864';
const FILES = ['./', 'index.html', 'css/app.css', 'js/main.js', 'js/rules.js', 'js/ai.js', 'js/geom.js', 'js/data.js', 'js/render.js', 'weights.json', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { const copy = r.clone(); if (r.ok && new URL(e.request.url).origin === location.origin) caches.open(V).then((c) => c.put(e.request, copy)); return r; }).catch(() => hit)));
});
