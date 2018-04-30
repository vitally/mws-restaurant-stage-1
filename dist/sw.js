/*eslint no-console: 0*/
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
				'/js/swhelper.js',
				'/img/1-large.jpg',
				'/img/1-medium.jpg',
				'/img/1-small.jpg',
				'/img/2-large.jpg',
				'/img/2-medium.jpg',
				'/img/2-small.jpg',
				'/img/3-large.jpg',
				'/img/3-medium.jpg',
				'/img/3-small.jpg',
				'/img/4-large.jpg',
				'/img/4-medium.jpg',
				'/img/4-small.jpg',
				'/img/5-large.jpg',
				'/img/5-medium.jpg',
				'/img/5-small.jpg',
				'/img/6-large.jpg',
				'/img/6-medium.jpg',
				'/img/6-small.jpg',
				'/img/7-large.jpg',
				'/img/7-medium.jpg',
				'/img/7-small.jpg',
				'/img/8-large.jpg',
				'/img/8-medium.jpg',
				'/img/8-small.jpg',
				'/img/9-large.jpg',
				'/img/9-medium.jpg',
				'/img/9-small.jpg',
				'/img/10-large.jpg',
				'/img/10-medium.jpg',
				'/img/10-small.jpg',
				'/img/icon.png'
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmVzbGludCBuby1jb25zb2xlOiAwKi9cclxuY29uc3Qgc3RhdGljQ2FjaGVOYW1lID0gJ3JyZXZpZXdzLXN0YXRpYy12MSc7XHJcblxyXG5jb25zdCBhbGxDYWNoZXMgPSBbXHJcblx0c3RhdGljQ2FjaGVOYW1lXHJcbl07XHJcblxyXG5cclxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBXaGVuIHNlcnZpY2Ugd29ya2VyIGJlY29tZXMgYWN0aXZlIHdlJ3JlIGdvaW5nIHRocm91Z2ggYWxsIHRoZSBjYWNoZXNcclxuICogY29tcGFyaW5nIHRvc2UgdG8gdGhlIG9uZXMgd2UgdXNlIGluIHRoZSBhcHAsIGFuZCByZW1vdmluZyB0aGUgb2xkIHZlcnNpb25zLlxyXG4gKi9cclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdhY3RpdmF0ZScsIGV2ZW50ID0+IHtcclxuXHRldmVudC53YWl0VW50aWwoXHJcblx0XHRjYWNoZXMua2V5cygpLnRoZW4oY2FjaGVOYW1lcyA9PiB7XHJcblx0XHRcdHJldHVybiBQcm9taXNlLmFsbChcclxuXHRcdFx0XHRjYWNoZU5hbWVzLmZpbHRlcihjYWNoZU5hbWUgPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGNhY2hlTmFtZS5zdGFydHNXaXRoKCdycmV2aWV3cy0nKSAmJlxyXG4gICAgICAgICAgICAhYWxsQ2FjaGVzLmluY2x1ZGVzKGNhY2hlTmFtZSk7XHJcblx0XHRcdFx0fSkubWFwKGNhY2hlTmFtZSA9PiB7XHJcblx0XHRcdFx0XHRyZXR1cm4gY2FjaGVzLmRlbGV0ZShjYWNoZU5hbWUpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdCk7XHJcblx0XHR9KVxyXG5cdCk7XHJcbn0pO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gV2Ugd2FudCB0byBjYWNoZSBzb21lIG9mIHRoZSB0aGluZ3MgaW5pdGlhbGx5LCBldmVuIGJlZm9yZSB0aGUgdXNlciBzdGFydHMgdG8gbmF2aWdhdGUgdGhlIHBhZ2VcclxuICovXHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIGV2ZW50ID0+IHtcclxuXHRldmVudC53YWl0VW50aWwoXHJcblx0XHRjYWNoZXMub3BlbihzdGF0aWNDYWNoZU5hbWUpLnRoZW4oY2FjaGUgPT4ge1xyXG5cdFx0XHRyZXR1cm4gY2FjaGUuYWRkQWxsKFtcclxuXHRcdFx0XHQnLycsXHJcblx0XHRcdFx0J3Jlc3RhdXJhbnQuaHRtbCcsXHJcblx0XHRcdFx0Jy9qcy9tYWluLmpzJyxcclxuXHRcdFx0XHQnL2pzL3Jlc3RhdXJhbnRfaW5mby5qcycsXHJcblx0XHRcdFx0Jy9jc3Mvc3R5bGVzLmNzcycsXHJcblx0XHRcdFx0Jy9qcy9zd2hlbHBlci5qcycsXHJcblx0XHRcdFx0Jy9pbWcvMS1sYXJnZS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzEtbWVkaXVtLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvMS1zbWFsbC5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzItbGFyZ2UuanBnJyxcclxuXHRcdFx0XHQnL2ltZy8yLW1lZGl1bS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzItc21hbGwuanBnJyxcclxuXHRcdFx0XHQnL2ltZy8zLWxhcmdlLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvMy1tZWRpdW0uanBnJyxcclxuXHRcdFx0XHQnL2ltZy8zLXNtYWxsLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvNC1sYXJnZS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzQtbWVkaXVtLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvNC1zbWFsbC5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzUtbGFyZ2UuanBnJyxcclxuXHRcdFx0XHQnL2ltZy81LW1lZGl1bS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzUtc21hbGwuanBnJyxcclxuXHRcdFx0XHQnL2ltZy82LWxhcmdlLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvNi1tZWRpdW0uanBnJyxcclxuXHRcdFx0XHQnL2ltZy82LXNtYWxsLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvNy1sYXJnZS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzctbWVkaXVtLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvNy1zbWFsbC5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzgtbGFyZ2UuanBnJyxcclxuXHRcdFx0XHQnL2ltZy84LW1lZGl1bS5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nLzgtc21hbGwuanBnJyxcclxuXHRcdFx0XHQnL2ltZy85LWxhcmdlLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvOS1tZWRpdW0uanBnJyxcclxuXHRcdFx0XHQnL2ltZy85LXNtYWxsLmpwZycsXHJcblx0XHRcdFx0Jy9pbWcvMTAtbGFyZ2UuanBnJyxcclxuXHRcdFx0XHQnL2ltZy8xMC1tZWRpdW0uanBnJyxcclxuXHRcdFx0XHQnL2ltZy8xMC1zbWFsbC5qcGcnLFxyXG5cdFx0XHRcdCcvaW1nL2ljb24ucG5nJ1xyXG5cdFx0XHRdKTtcclxuXHRcdH0pLmNhdGNoKGUgPT4ge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhlKTtcclxuXHRcdH0pXHJcblx0KTtcclxufSk7XHJcblxyXG5cclxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBoZXJlIHdlJ3JlIHRyeWluZyB0byBpZGVudGlmeSBpZiB3ZSBoYXZlIHNlZW4gdGhlIHJlcXVlc3QgYmVmb3JlLCBhbmQgdGhlcmVmb3JlIG5lZWQgdG8gc2VydmUgaXQgZnJvbSBjYWNoZVxyXG4gKiBvciBpZiB3ZSBlbmNvdW50ZXIgaXQgZmlyc3QgdGltZSwgc3RvcmUgaXQgaW4gdGhlIGNhY2hlLlxyXG4gKiBAcGFyYW0ge3JlcXVlc3R9IHJlcXVlc3QgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZnVuY3Rpb24gc2VydmVDYWNoZShyZXF1ZXN0KSB7XHJcblx0cmV0dXJuIGNhY2hlcy5vcGVuKHN0YXRpY0NhY2hlTmFtZSkudGhlbihjYWNoZSA9PiB7XHJcblx0XHRyZXR1cm4gY2FjaGUubWF0Y2gocmVxdWVzdC51cmwpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRpZiAocmVzcG9uc2UpIHJldHVybiByZXNwb25zZTtcclxuXHJcblx0XHRcdHJldHVybiBmZXRjaChyZXF1ZXN0KS50aGVuKG5ldHdvcmtSZXNwb25zZSA9PiB7XHJcblx0XHRcdFx0Y2FjaGUucHV0KHJlcXVlc3QudXJsLCBuZXR3b3JrUmVzcG9uc2UuY2xvbmUoKSk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldHdvcmtSZXNwb25zZTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gaGVyZSB3ZSBtYWtlIHN1cmUgd2UgcmVzcG9uZCBidXkgY2FsbGluZyB0aGUgY2FzaGUgbG9vcHVwIGZpcnN0XHJcbiAqL1xyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZldGNoJywgKGV2ZW50KSA9PiB7XHJcblx0ZXZlbnQucmVzcG9uZFdpdGgoc2VydmVDYWNoZShldmVudC5yZXF1ZXN0KSk7XHJcbn0pOyJdLCJmaWxlIjoic3cuanMifQ==
