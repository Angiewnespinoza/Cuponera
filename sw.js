const CACHE_NAME = 'cuponera-cache-v1';

const ASSETS = [
  '/Cuponera/index.html',
  '/Cuponera/app.js',
  '/Cuponera/manifest.webmanifest',
  '/Cuponera/img/background.png',
  '/Cuponera/img/cuponerita.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
