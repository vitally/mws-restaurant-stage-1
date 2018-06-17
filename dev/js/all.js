/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
/*eslint no-console: 0*/
/*eslint linebreak-style: ["error", "windows"]*/
/**
 * Common database helper functions.
 */
class DBHelper {
	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_URL() {
		const port = 1337; // Change this to your server port
		return `http://localhost:${port}/`;
	}

	static get RESTAURANT_URL() {
		return `${this.DATABASE_URL}restaurants/`;
	}

	static get REVIEW_URL() {
		return `${this.DATABASE_URL}reviews/`;
	}


	static get database() {
		// If the browser doesn't support service worker,
		// we don't care about having a database
		if (!navigator.serviceWorker) {
			return Promise.resolve();
		}
		const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
		return indexedDB.open('rreviews', 1);
	}

	/**
	 * Fetch all restaurants.
	 */
	static fetchRestaurants(callback) {
		fetch(DBHelper.RESTAURANT_URL)
			.then(response => {
				return response.json();
			})
			.then(data => {
				//Got the data, now writting it in the database.
				DBHelper.storeRestaurantDataInIndexedDB(data);
				callback(null, data);
			})
			.catch(error => {
				DBHelper.getRestaurantDataFromIndexedDB().then(data => {
					callback(null, data);
				});
			});
	}

	static fetchRestaurantById(id, callback) {
		const reviewURL = `${this.REVIEW_URL}?restaurant_id=${id}`;
		const DBOpenRequest = DBHelper.database;
		DBHelper.upgadeIndexedDB(DBOpenRequest);
		if (DBOpenRequest) {
			DBOpenRequest.onsuccess = (event) => {
				const db = DBOpenRequest.result;
				const store = db.transaction(['rreviews'], 'readwrite').objectStore('rreviews');
				const index = store.index('id');

				index.openCursor().onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						if (cursor.value.id == id) {
							const restaurant = cursor.value;
							fetch(reviewURL)
								.then(response => {
									return response.json();
								})
								.then(data => {
									//Got the data, now writting it in the database.
									restaurant.reviews = data;
									db.transaction(['rreviews'], 'readwrite').objectStore('rreviews').put(restaurant);
									callback(null, restaurant);
								})
								.catch(error => {
									callback(null, restaurant);
								});
						} else {
							cursor.continue();
						}
					}
				};

			};
		}
	}

	static storeRestaurantDataInIndexedDB(data) {
		//Got the data, now writting it in the database.
		const DBOpenRequest = DBHelper.database;
		DBHelper.upgadeIndexedDB(DBOpenRequest);
		if (DBOpenRequest) {
			DBOpenRequest.onsuccess = event => {
				const db = DBOpenRequest.result;
				const tx = db.transaction('rreviews', 'readwrite');
				const store = tx.objectStore('rreviews');
				data.forEach((restaurant) => {
					store.put(restaurant);
				});
			};
		}
	}

	static setRestaurantFavorite(id, state) {
		//Got the data, now writting it in the database.
		//We could have just used response from PUT
		//method, but in case we're offline let's update the db first
		const DBOpenRequest = DBHelper.database;
		DBHelper.upgadeIndexedDB(DBOpenRequest);
		if (DBOpenRequest) {
			DBOpenRequest.onsuccess = (event) => {
				const db = DBOpenRequest.result;
				const index = db.transaction(['rreviews'], 'readwrite').objectStore('rreviews').index('id');
				const url = `${this.RESTAURANT_URL}${id}/?is_favorite=${state}`;
				index.openCursor().onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						if (cursor.value.id == id) {
							cursor.value.is_favorite = state;
							cursor.update(cursor.value);
							const req = new Request(url, {
								method: 'PUT'
							});
							fetch(req).catch(e => {
								if (!navigator.onLine) {
									this.addRequestToQueue({
										'url': url,
										'options': {
											method: 'PUT'
										}
									});
								}
							});
						} else {
							cursor.continue();
						}
					}
				};

			};
		}
	}

	static addRestaurantReview(data) {
		const req = new Request(this.REVIEW_URL, {
			body: JSON.stringify(data),
			method: 'POST'
		});
		fetch(req).then(response => {
			return response.json();
		}).then(review => {
			//do a refresh
			this.fetchRestaurantById(data.restaurant_id, {});
		}).catch(e => {
			if (!navigator.onLine) {
				this.addRequestToQueue({
					url: this.REVIEW_URL,
					options: {
						body: JSON.stringify(data),
						method: 'POST'
					}
				});
			}
			this.fetchRestaurantById(data.restaurant_id, (err, rst) => {
				rst.reviews.push(data);
				const DBOpenRequest = DBHelper.database;
				DBHelper.upgadeIndexedDB(DBOpenRequest);
				if (DBOpenRequest) {
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						db.transaction(['rreviews'], 'readwrite').objectStore('rreviews').put(rst);
					};
				}
			});
		});
	}

	static getRestaurantDataFromIndexedDB() {
		//It seems like we've got an error while trying to read from the server
		//So trying to get data from the indexedDB now
		return new Promise((resolve, reject) => {
			const DBOpenRequest = DBHelper.database;
			DBHelper.upgadeIndexedDB(DBOpenRequest);
			if (DBOpenRequest) {
				DBOpenRequest.onsuccess = event => {
					const db = DBOpenRequest.result;
					const store = db.transaction('rreviews', 'readonly').objectStore('rreviews');
					const data = [];
					store.openCursor().onsuccess = event => {
						const cursor = event.target.result;
						if (cursor) {
							data.push(cursor.value);
							cursor.continue();
						} else {
							resolve(data);
						}
					};
				};
			}
		});
	}

	static upgadeIndexedDB(DBOpenRequest) {
		DBOpenRequest.onupgradeneeded = function () {
			const db = DBOpenRequest.result;
			const store = db.createObjectStore('rreviews', {
				keyPath: 'id'
			});
			store.createIndex('name', 'name');
			store.createIndex('id', 'id', {
				unique: true
			});
			db.createObjectStore('requestqueue', {
				autoIncrement: true
			});
		};
	}

	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 */
	static fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter(r => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 */
	static fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(r => r.neighborhood == neighborhood);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
				if (cuisine != 'all') { // filter by cuisine
					results = results.filter(r => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') { // filter by neighborhood
					results = results.filter(r => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	static fetchNeighborhoods(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
				callback(null, uniqueNeighborhoods);
			}
		});
	}

	/**
	 * Fetch all cuisines with proper error handling.
	 */
	static fetchCuisines(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
				callback(null, uniqueCuisines);
			}
		});
	}

	/**
	 * Restaurant page URL.
	 */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
	 * Restaurant image URL.
	 */
	static imageUrlForRestaurant(restaurant) {
		return (`/img/${restaurant.photograph ? restaurant.photograph : restaurant.id}`);
	}

	/**
	 * Map marker for a restaurant.
	 */
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP
		});
		return marker;
	}

	static addRequestToQueue(request) {
		const DBOpenRequest = DBHelper.database;
		DBHelper.upgadeIndexedDB(DBOpenRequest);
		if (DBOpenRequest) {
			DBOpenRequest.onsuccess = event => {
				const db = DBOpenRequest.result;
				db.transaction('requestqueue', 'readwrite').objectStore('requestqueue').put(request);
			};
		}
	}
	static sendQueuedRequests() {
		const DBOpenRequest = DBHelper.database;
		DBHelper.upgadeIndexedDB(DBOpenRequest);
		if (DBOpenRequest) {
			DBOpenRequest.onsuccess = event => {
				const db = DBOpenRequest.result;
				const store = db.transaction('requestqueue', 'readwrite').objectStore('requestqueue');
				store.openCursor().onsuccess = event => {
					const cursor = event.target.result;
					if (cursor) {
						const request = new Request(cursor.value.url, cursor.value.options);
						fetch(request);
						cursor.delete();
						cursor.continue();
					}
				};
			};
		}
	}
}
/*! lazysizes - v4.0.3 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}(window,function(a,b){"use strict";if(b.getElementsByClassName){var c,d,e=b.documentElement,f=a.Date,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h],k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,d,e,f,g){var h=b.createEvent("CustomEvent");return e||(e={}),e.instance=c,h.initCustomEvent(d,!f,!g,e),a.dispatchEvent(h),h},w=function(b,c){var e;!g&&(e=a.picturefill||d.pf)?e({reevaluate:!0,elements:[b]}):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<d.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,c=0,e=d.throttleDelay,g=d.ricTimeout,h=function(){b=!1,c=f.now(),a()},i=m&&g>49?function(){m(h,{timeout:g}),g!==d.ricTimeout&&(g=d.ricTimeout)}:A(function(){k(h)},!0);return function(a){var d;(a=a===!0)&&(g=33),b||(b=!0,d=e-(f.now()-c),0>d&&(d=0),a||9>d?i():k(i,d))}},C=function(a){var b,c,d=99,e=function(){b=null,a()},g=function(){var a=f.now()-c;d>a?k(g,d-a):(m||e)(e)};return function(){c=f.now(),b||(b=k(g,d))}};!function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0,ricTimeout:0,throttleDelay:125};d=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in d||(d[b]=c[b]);a.lazySizesConfig=d,k(function(){d.init&&F()})}();var D=function(){var g,l,m,o,p,y,D,F,G,H,I,J,K,L,M=/^img$/i,N=/^iframe$/i,O="onscroll"in a&&!/glebot/.test(navigator.userAgent),P=0,Q=0,R=0,S=-1,T=function(a){R--,a&&a.target&&u(a.target,T),(!a||0>R||!a.target)&&(R=0)},U=function(a,c){var d,f=a,g="hidden"==x(b.body,"visibility")||"hidden"!=x(a,"visibility");for(F-=c,I+=c,G-=c,H+=c;g&&(f=f.offsetParent)&&f!=b.body&&f!=e;)g=(x(f,"opacity")||1)>0,g&&"visible"!=x(f,"overflow")&&(d=f.getBoundingClientRect(),g=H>d.left&&G<d.right&&I>d.top-1&&F<d.bottom+1);return g},V=function(){var a,f,h,j,k,m,n,p,q,r=c.elements;if((o=d.loadMode)&&8>R&&(a=r.length)){f=0,S++,null==K&&("expand"in d||(d.expand=e.clientHeight>500&&e.clientWidth>500?500:370),J=d.expand,K=J*d.expFactor),K>Q&&1>R&&S>2&&o>2&&!b.hidden?(Q=K,S=0):Q=o>1&&S>1&&6>R?J:P;for(;a>f;f++)if(r[f]&&!r[f]._lazyRace)if(O)if((p=r[f][i]("data-expand"))&&(m=1*p)||(m=Q),q!==m&&(y=innerWidth+m*L,D=innerHeight+m,n=-1*m,q=m),h=r[f].getBoundingClientRect(),(I=h.bottom)>=n&&(F=h.top)<=D&&(H=h.right)>=n*L&&(G=h.left)<=y&&(I||H||G||F)&&(d.loadHidden||"hidden"!=x(r[f],"visibility"))&&(l&&3>R&&!p&&(3>o||4>S)||U(r[f],m))){if(ba(r[f]),k=!0,R>9)break}else!k&&l&&!j&&4>R&&4>S&&o>2&&(g[0]||d.preloadAfterLoad)&&(g[0]||!p&&(I||H||G||F||"auto"!=r[f][i](d.sizesAttr)))&&(j=g[0]||r[f]);else ba(r[f]);j&&!k&&ba(j)}},W=B(V),X=function(a){s(a.target,d.loadedClass),t(a.target,d.loadingClass),u(a.target,Z),v(a.target,"lazyloaded")},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](d.srcsetAttr);(b=d.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,e,f){var g,h,j,l,o,p;(o=v(a,"lazybeforeunveil",b)).defaultPrevented||(e&&(c?s(a,d.autosizesClass):a.setAttribute("sizes",e)),h=a[i](d.srcsetAttr),g=a[i](d.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),o={target:a},p&&(u(a,T,!0),clearTimeout(m),m=k(T,2500),s(a,d.loadingClass),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(N.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,d.lazyClass),z(function(){(!p||a.complete&&a.naturalWidth>1)&&(p?T(o):R--,X(o))},!0)}),ba=function(a){var b,c=M.test(a.nodeName),e=c&&(a[i](d.sizesAttr)||a[i]("sizes")),f="auto"==e;(!f&&l||!c||!a[i]("src")&&!a.srcset||a.complete||r(a,d.errorClass)||!r(a,d.lazyClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,R++,aa(a,b,f,e,c))},ca=function(){if(!l){if(f.now()-p<999)return void k(ca,999);var a=C(function(){d.loadMode=3,W()});l=!0,d.loadMode=3,W(),j("scroll",function(){3==d.loadMode&&(d.loadMode=2),a()},!0)}};return{_:function(){p=f.now(),c.elements=b.getElementsByClassName(d.lazyClass),g=b.getElementsByClassName(d.lazyClass+" "+d.preloadClass),L=d.hFac,j("scroll",W,!0),j("resize",W,!0),a.MutationObserver?new MutationObserver(W).observe(e,{childList:!0,subtree:!0,attributes:!0}):(e[h]("DOMNodeInserted",W,!0),e[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend","webkitAnimationEnd"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ca():(j("load",ca),b[h]("DOMContentLoaded",W),k(ca,2e4)),c.elements.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;g>f;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),e=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width,d&&d!==a._lazysizesWidth&&c(a,f,e,d)))},f=function(){var b,c=a.length;if(c)for(b=0;c>b;b++)e(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(d.autosizesClass),j("resize",g)},checkElems:g,updateElem:e}}(),F=function(){F.i||(F.i=!0,E._(),D._())};return c={cfg:d,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}}});
/*eslint no-console: 0*/
/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	fetchNeighborhoods();
	fetchCuisines();
});

let map;

/*const observer = new IntersectionObserver(onIntersection, {
	rootMargin: '0px',
	threshold: 0.1
});

function onIntersection(entries) {
	// Loop through the entries
	entries.forEach(entry => {
		// Are we in viewport?
		if (entry.intersectionRatio > 0) {

			// Stop watching and load the image
			observer.unobserve(entry.target);
			loadImage(entry.target);
		}
	});
}

function loadImage(image) {
	const src = image.dataset.src;
	fetchImage(src).then(() => {
		image.src = src;
	});
}

function fetchImage(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = url;
		image.onload = resolve;
		image.onerror = reject;
	});
}

*/

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			console.error(error);
		} else {
			this.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
	const select = document.getElementById('neighborhoods-select');
	if (select) {
		neighborhoods.forEach(neighborhood => {
			const option = document.createElement('option');
			option.innerHTML = neighborhood;
			option.value = neighborhood;
			select.appendChild(option);
		});
	}
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			this.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines = this.cuisines) {
	const select = document.getElementById('cuisines-select');
	if (select) {
		cuisines.forEach(cuisine => {
			const option = document.createElement('option');
			option.innerHTML = cuisine;
			option.value = cuisine;
			select.appendChild(option);
		});
	}
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	if(typeof (google) !== 'undefined'){
		this.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: loc,
			scrollwheel: false
		});
	}
	updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	});
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
	// Remove all restaurants
	this.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	if (this.markers) {
		this.markers.forEach(m => m.setMap(null));
	}
	this.markers = [];
	this.restaurants = restaurants;
}
/*
function startObserver() {
	const images = document.querySelectorAll('.restaurant-img');
	images.forEach(image => {
		observer.observe(image);
	});
}*/

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = this.restaurants) {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.appendChild(createRestaurantHTML(restaurant));
	});
	//startObserver();
	if (typeof google !== 'undefined') {
		addMarkersToMap();
	}
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
	if (typeof restaurant.is_favorite === 'undefined') {
		restaurant.is_favorite = false;
	}
	const li = document.createElement('li');
	li.className = 'restaurant-card';

	const picture = document.createElement('picture'); //Here goes the new picture tag, that will include the <img>
	picture.className = 'restaurant-picture'; //that is how we will serve diferent sizes of images

	//next block prepares source tag for small images
	const srcSmall = document.createElement('source');
	srcSmall.className = 'lazyload source-small';
	let picUrlSmall = DBHelper.imageUrlForRestaurant(restaurant).concat('-small.jpg');
	let picUrlMedium = picUrlSmall.replace('small', 'medium');
	//srcSmall.srcset = picUrlSmall + ' 1x, ' + picUrlMedium + ' 2x';
	srcSmall.setAttribute('data-srcset',picUrlSmall + ' 1x, ' + picUrlMedium + ' 2x');
	picture.appendChild(srcSmall);

	//next block prepares source tag for large images
	const srcLarge = document.createElement('source');
	srcLarge.className = 'lazyload source-large';
	let picUrlLarge = picUrlSmall.replace('small', 'large');
	//srcLarge.srcset = picUrlMedium + ' 1x, ' + picUrlLarge + ' 2x';
	srcLarge.setAttribute('data-srcset', picUrlMedium + ' 1x, ' + picUrlLarge + ' 2x');
	srcLarge.media = '(min-width: 750px)';
	picture.appendChild(srcLarge);

	//creating img tag, and adding alt
	const image = document.createElement('img');
	image.className = 'lazyload restaurant-img';
	image.alt = 'Image of "' + restaurant.name + '" restaurant.';
	//image.src = picUrlSmall;
	image.setAttribute('data-src', picUrlSmall);
	picture.appendChild(image);

	const infoContainer = document.createElement('div');
	infoContainer.className = 'restaurant-info-container';
	infoContainer.appendChild(picture);

	
	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	infoContainer.appendChild(name);
	
	const favorite_icon = document.createElement('a');
	const fav_icon_aria_label = JSON.parse(restaurant.is_favorite) ? 'Remove restaurant ' + restaurant.name + 'from favorites.' : 'Add restaurant ' + restaurant.name + 'to favorites.';
	favorite_icon.className = 'tap-target top-right';
	favorite_icon.setAttribute('aria-label', fav_icon_aria_label);
	favorite_icon.setAttribute('role', 'button');
	favorite_icon.setAttribute('tabindex', '0');
	favorite_icon.setAttribute('data-restid', restaurant.id);
	favorite_icon.setAttribute('is-favorite', restaurant.is_favorite);
	favorite_icon.addEventListener('click', toggleFavorite, false);
	infoContainer.appendChild(favorite_icon);

	const favorite_symbol = document.createElement('i');
	favorite_symbol.className = 'material-icons favorite-icon';
	favorite_symbol.innerHTML = JSON.parse(restaurant.is_favorite) ? 'favorite' :'favorite_border';
	favorite_icon.appendChild(favorite_symbol);
	
	const addressContainer = document.createElement('div');
	addressContainer.className = 'address-container';

	const neighborhood = document.createElement('p');
	neighborhood.setAttribute('aria-describedby', 'restaurant-neighborhood-label');
	neighborhood.innerHTML = restaurant.neighborhood;
	addressContainer.appendChild(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	address.setAttribute('aria-describedby', 'restaurant-address-label');
	addressContainer.appendChild(address);

	infoContainer.appendChild(addressContainer);

	li.appendChild(infoContainer);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.className = 'tap-target restaurant-card-details';
	more.setAttribute('aria-label', 'Restaurant: ' + restaurant.name + ': view details.');
	more.setAttribute('role', 'button');
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.appendChild(more);

	return li;
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = this.restaurants) {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, this.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		this.markers.push(marker);
	});
}


function toggleFavorite(e) {
	if (!e)
		e = window.event;
	const sender = e.srcElement || e.target;
	const id = this.dataset.restid;
	//Inverting value in te next line
	let state = JSON.parse(this.getAttribute('is-favorite')) ? false : true;
	
	if(id){
		this.setAttribute('is-favorite',state);
		DBHelper.setRestaurantFavorite(id, state);
		if(sender == this){
			if(this.childNodes.length > 0){
				this.childNodes[0].innerHTML = state ? 'favorite' :'favorite_border';
			}
		}else{
			sender.innerHTML = state ? 'favorite' :'favorite_border';

		}
	}
}
/*eslint no-console: 0*/
/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/

let restaurant;

/**
 * Initialize Google map, called from HTML.
 */
window.initMapDetails = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			if(typeof google !== 'undefined'){
				self.map = new google.maps.Map(document.getElementById('map'), {
					zoom: 16,
					center: restaurant.latlng,
					scrollwheel: false
				});
				DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
			}
			fillBreadcrumb();
		}
	});
};

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback){
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant);
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		callback('No restaurant id in URL', null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			callback(null, restaurant);
		});
	}
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant){
  
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;
  
	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;
  
	const image = document.getElementById('restaurant-img');
	image.className = 'restaurant-img';
	let picUrlSmall = DBHelper.imageUrlForRestaurant(restaurant).concat('-small.jpg');
	//image.src = picUrlSmall;
	image.setAttribute('data-src', picUrlSmall);
	image.alt = 'Image of "' + restaurant.name + '" restaurant.';
  
	const srcSmall = document.getElementById('source-small');
	let picUrlMedium = picUrlSmall.replace('small','medium');
	srcSmall.srcset = picUrlSmall + ' 1x, ' + picUrlMedium + ' 2x';
  
	const srcLarge = document.getElementById('source-large');
	let picUrlLarge = picUrlSmall.replace('small','large');
	srcLarge.srcset = picUrlMedium + ' 1x, ' + picUrlLarge + ' 2x';

	//const picture = document.getElementById('restaurant-picture');

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML (operatingHours = self.restaurant.operating_hours){
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		day.className = 'table-day';
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		time.className = 'table-time';
		row.appendChild(time);

		hours.appendChild(row);
	}
}

/**
 * submitReview - submits a review to the database
 *
 */
function submitReview(e) {
	if (!e)
		e = window.event;
	const sender = e.srcElement || e.target;
	const id = sender.getAttribute('restaurant-id');
	const name = document.getElementById('review-name').value;
	const comment = document.getElementById('review-text').value;
	const rating = document.getElementById('review-rating').value;
	if(name && comment){
		const data = {
			'restaurant_id': id,
			'name': name,
			'rating': rating,
			'comments': comment,
			'createdAt': (new Date()).getTime()
		};
		const ul = document.getElementById('reviews-list');
		ul.appendChild(createReviewHTML(data));
		const review = DBHelper.addRestaurantReview(data);
	}
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews, id = self.restaurant.id) {
	const container = document.getElementById('reviews-container');
	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const button = document.getElementById('add-comment');
	button.setAttribute('restaurant-id', id);
	button.addEventListener('click', submitReview, false);
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review){
	const li = document.createElement('li');
	const name = document.createElement('p');
	name.innerHTML = review.name;
	li.appendChild(name);

	const date = document.createElement('p');
	//const createdDate = new Date(review.createdAt);
	date.innerHTML = new Date(review.createdAt).toLocaleDateString();
	li.appendChild(date);

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	li.appendChild(rating);

	const comments = document.createElement('p');
	comments.className = 'review-comments';
	comments.innerHTML = review.comments;
	li.appendChild(comments);

	return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant=self.restaurant) {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url){
	if (!url)
		url = window.location.href;
	name = name.replace(/[[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

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