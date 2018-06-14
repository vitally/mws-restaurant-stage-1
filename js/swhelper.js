/*eslint no-console: 0*/
/*eslint no-undef: 0*/
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('sw.js').then(() => {
			console.log('Service Worker Registerd');
		}).catch((e) => {
			console.error(e);	
		});
	});
}


window.addEventListener('online', DBHelper.sendQueuedRequests, false);