/*eslint no-console: 0*/
/*eslint no-undef: 0*/
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		document.getElementById('styles').removeAttribute('disabled');
		if(window.location.href.indexOf('restaurant.html') == -1 ){
			navigator.serviceWorker.register('sw.js').then(() => {
				console.log('Service Worker Registerd');
			}).catch((e) => {
				console.error(e);
			});
			if (navigator.onLine === false) {
				initMap();
			}
		}else{
			if (navigator.onLine === false) {
				initMapDetails();
			}
		}
	});
	window.addEventListener('online', DBHelper.sendQueuedRequests, false);
}