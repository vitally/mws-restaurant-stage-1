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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmVzbGludCBuby1jb25zb2xlOiAwKi9cclxuLyplc2xpbnQgbm8tZGVidWdnZXI6IDAqL1xyXG4vKmVzbGludCBuby11bmRlZjogMCovXHJcblxyXG5jb25zdCBzdGF0aWNDYWNoZU5hbWUgPSAncnJldmlld3Mtc3RhdGljLXYxJztcclxuXHJcbmNvbnN0IGFsbENhY2hlcyA9IFtcclxuXHRzdGF0aWNDYWNoZU5hbWVcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gV2hlbiBzZXJ2aWNlIHdvcmtlciBiZWNvbWVzIGFjdGl2ZSB3ZSdyZSBnb2luZyB0aHJvdWdoIGFsbCB0aGUgY2FjaGVzXHJcbiAqIGNvbXBhcmluZyB0b3NlIHRvIHRoZSBvbmVzIHdlIHVzZSBpbiB0aGUgYXBwLCBhbmQgcmVtb3ZpbmcgdGhlIG9sZCB2ZXJzaW9ucy5cclxuICovXHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignYWN0aXZhdGUnLCBldmVudCA9PiB7XHJcblx0ZXZlbnQud2FpdFVudGlsKFxyXG5cdFx0Y2FjaGVzLmtleXMoKS50aGVuKGNhY2hlTmFtZXMgPT4ge1xyXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXHJcblx0XHRcdFx0Y2FjaGVOYW1lcy5maWx0ZXIoY2FjaGVOYW1lID0+IHtcclxuXHRcdFx0XHRcdHJldHVybiBjYWNoZU5hbWUuc3RhcnRzV2l0aCgncnJldmlld3MtJykgJiZcclxuICAgICAgICAgICAgIWFsbENhY2hlcy5pbmNsdWRlcyhjYWNoZU5hbWUpO1xyXG5cdFx0XHRcdH0pLm1hcChjYWNoZU5hbWUgPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGNhY2hlcy5kZWxldGUoY2FjaGVOYW1lKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQpO1xyXG5cdFx0fSlcclxuXHQpO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gV2Ugd2FudCB0byBjYWNoZSBzb21lIG9mIHRoZSB0aGluZ3MgaW5pdGlhbGx5LCBldmVuIGJlZm9yZSB0aGUgdXNlciBzdGFydHMgdG8gbmF2aWdhdGUgdGhlIHBhZ2VcclxuICovXHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIGV2ZW50ID0+IHtcclxuXHRldmVudC53YWl0VW50aWwoXHJcblx0XHRjYWNoZXMub3BlbihzdGF0aWNDYWNoZU5hbWUpLnRoZW4oY2FjaGUgPT4ge1xyXG5cdFx0XHRyZXR1cm4gY2FjaGUuYWRkQWxsKFtcclxuXHRcdFx0XHQnLycsXHJcblx0XHRcdFx0J3Jlc3RhdXJhbnQuaHRtbCcsXHJcblx0XHRcdFx0Jy9qcy9hbGwuanMnLFxyXG5cdFx0XHRcdCcvY3NzL3N0eWxlcy5jc3MnLFxyXG5cdFx0XHRcdCcvaW1nLzEtbGFyZ2UuanBnJyxcclxuXHRcdFx0XHQnL2ltZy8xLW1lZGl1bS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzEtc21hbGwuanBnJyxcclxuXHRcdFx0XHQnL2ltZy8yLWxhcmdlLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvMi1tZWRpdW0uanBnJyxcclxuXHRcdFx0XHQnL2ltZy8yLXNtYWxsLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvMy1sYXJnZS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzMtbWVkaXVtLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvMy1zbWFsbC5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nL2ljb24ucG5nJyxcclxuXHRcdFx0XHQnL2ZvbnRzL3JvYm90by12MTgtbGF0aW4tcmVndWxhci53b2ZmMidcclxuXHRcdFx0XSk7XHJcblx0XHR9KS5jYXRjaChlID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coZSk7XHJcblx0XHR9KVxyXG5cdCk7XHJcbn0pO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gaGVyZSB3ZSdyZSB0cnlpbmcgdG8gaWRlbnRpZnkgaWYgd2UgaGF2ZSBzZWVuIHRoZSByZXF1ZXN0IGJlZm9yZSwgYW5kIHRoZXJlZm9yZSBuZWVkIHRvIHNlcnZlIGl0IGZyb20gY2FjaGVcclxuICogb3IgaWYgd2UgZW5jb3VudGVyIGl0IGZpcnN0IHRpbWUsIHN0b3JlIGl0IGluIHRoZSBjYWNoZS5cclxuICogQHBhcmFtIHtyZXF1ZXN0fSByZXF1ZXN0IFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmZ1bmN0aW9uIHNlcnZlQ2FjaGUocmVxdWVzdCkge1xyXG5cdHJldHVybiBjYWNoZXMub3BlbihzdGF0aWNDYWNoZU5hbWUpLnRoZW4oY2FjaGUgPT4ge1xyXG5cdFx0cmV0dXJuIGNhY2hlLm1hdGNoKHJlcXVlc3QudXJsKS50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0aWYgKHJlc3BvbnNlKSByZXR1cm4gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRyZXR1cm4gZmV0Y2gocmVxdWVzdCkudGhlbihuZXR3b3JrUmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRcdGNhY2hlLnB1dChyZXF1ZXN0LnVybCwgbmV0d29ya1Jlc3BvbnNlLmNsb25lKCkpO1xyXG5cdFx0XHRcdHJldHVybiBuZXR3b3JrUmVzcG9uc2U7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIGhlcmUgd2UgbWFrZSBzdXJlIHdlIHJlc3BvbmQgYnV5IGNhbGxpbmcgdGhlIGNhc2hlIGxvb3B1cCBmaXJzdFxyXG4gKi9cclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIChldmVudCkgPT4ge1xyXG5cdGlmKGV2ZW50LnJlcXVlc3QudXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcpKXtcclxuXHRcdGV2ZW50LnJlc3BvbmRXaXRoKHNlcnZlQ2FjaGUoZXZlbnQucmVxdWVzdCkpO1xyXG5cdH1lbHNle1xyXG5cdFx0ZXZlbnQucmVzcG9uZFdpdGgoZmV0Y2goZXZlbnQucmVxdWVzdCkpO1xyXG5cdH1cclxuXHJcbn0pOyJdLCJmaWxlIjoic3cuanMifQ==
