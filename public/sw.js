// Minimal PWA service worker for Sayayin Radar offline caching
const CACHE_NAME = 'sayayin-radar-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser fetch normally with fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
