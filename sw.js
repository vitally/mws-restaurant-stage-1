const staticCacheName = 'rreviews-static-v1';

const allCaches = [
  staticCacheName
];


/**
 * @description When service worker becomes active we're going through all the caches
 * comparing tose to the ones we use in the app, and removing the old versions.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('rreviews-') &&
            !allCaches.includes(cacheName);
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});


/**
 * @description We want to cache some of the things initially, even before the user starts to navigate the page
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        'restaurant.html',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
        '/js/swhelper.js'
      ]);
    }).catch(e => {
      console.log(e);
    })
  );
});


/**
 * @description here we're trying to identify if we have seen the request before, and therefore need to serve it from cache
 * or if we encounter it first time, store it in the cache.
 * @param {request} request 
 * @returns 
 */
function serveCache(request) {
  return caches.open(staticCacheName).then(cache => {
    return cache.match(request.url).then(response => {
      if (response) return response;

      return fetch(request).then(networkResponse => {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}


/**
 * @description here we make sure we respond buy calling the cashe loopup first
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(serveCache(event.request));
});