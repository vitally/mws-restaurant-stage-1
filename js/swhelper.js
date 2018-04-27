/*eslint no-console: 0*/

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register('/sw.js').then(() => {
			console.log('Service Worker Registerd');
		}).catch(() => {
		});
	});
}