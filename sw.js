const CACHE_NAME = 'cuponera-cache-v2.0.3';

const ASSETS = [
  '/Cuponera/index.html',
  '/Cuponera/app.js',
  '/Cuponera/manifest.webmanifest',
  '/Cuponera/img/background.png',
  '/Cuponera/img/cuponerita.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // resto: cache-first
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
