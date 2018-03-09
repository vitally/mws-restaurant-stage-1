const staticCacheName = 'rreviews-static-v1';

const allCaches = [
  staticCacheName
];

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then( cacheNames => {
      return Promise.all(
        cacheNames.filter( cacheName => {
          return cacheName.startsWith('rreviews-') &&
            !allCaches.includes(cacheName);
        }).map( cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        'restaurant.html',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/css/styles.css'
      ]);
    }).catch(e => {
      console.log(e);
    })
  );
});

function serveCache(request) {
  return caches.open(staticCacheName).then( cache => {
    return cache.match(request.url).then( response => {
      if (response) return response;

      return fetch(request).then( networkResponse => {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

self.addEventListener('fetch', (event) => {
  event.respondWith(serveCache(event.request));
});