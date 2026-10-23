// PFC Fuel Tracker – ऐप की फ़ाइलें फ़ोन में रखता है ताकि बिना इंटरनेट के खुल सके।
// ऐप में बदलाव करने के बाद नीचे का version बदलें (v2, v3…)।
const CACHE = 'pfc-fuel-v5';
const FILES = ['./', './index.html', './manifest.json', './chart.min.js', './logo.png', './logo-white.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Google Sheet वाले sync request को कभी cache नहीं करना
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
