/*eslint no-console: 0*/
/*eslint no-undef: 0*/
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		document.getElementById('styles').removeAttribute('disabled');

		/*if (document.querySelectorAll('#map').length > 0) {
			const js_file = document.createElement('script');
			js_file.type = 'text/javascript';
			js_file.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDZOJtKVTyEcz-RVVr4aePsebEPAP9JYaw&libraries=places&callback=initMap';
			document.getElementsByTagName('head')[0].appendChild(js_file);
		}*/
		if(window.location.href.indexOf('restaurant.html') == -1 ){
			navigator.serviceWorker.register('sw.js').then(() => {
				console.log('Service Worker Registerd');
			}).catch((e) => {
				console.error(e);
			});
		}
	});
	window.addEventListener('online', DBHelper.sendQueuedRequests, false);
}