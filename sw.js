const CACHE_NAME = 'cuponera-cache-v1';

const ASSETS = [
  '/Cuponera/',
  '/Cuponera/index.html',
  '/Cuponera/styles.css',
  '/Cuponera/app.js',
  '/Cuponera/manifest.webmanifest',
  '/Cuponera/img/helado.png',
  '/Cuponera/img/pantallas.png',
  '/Cuponera/coupons.json',
  '/Cuponera/img/background.png'

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
