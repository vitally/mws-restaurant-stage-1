/*eslint no-console: 0*/
/*eslint no-debugger: 0*/
/*eslint no-undef: 0*/

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
				'/js/all.js',
				'/css/styles.css',
				'/img/1-large.jpg',
				'/img/1-medium.jpg',
				'/img/1-small.jpg',
				'/img/2-large.jpg',
				'/img/2-medium.jpg',
				'/img/2-small.jpg',
				'/img/3-large.jpg',
				'/img/3-medium.jpg',
				'/img/3-small.jpg',
				'/img/icon.png',
				'/fonts/roboto-v18-latin-regular.woff2'
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
	if(event.request.url.startsWith('http://localhost:8080')){
		event.respondWith(serveCache(event.request));
	}else{
		event.respondWith(fetch(event.request));
	}

});