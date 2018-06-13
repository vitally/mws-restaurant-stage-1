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
		const port = 1337; // Change this to your server port
		return `${this.DATABASE_URL}restaurants/`;
	}

	static get REVIEW_URL() {
		const port = 1337; // Change this to your server port
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
		DBHelper.getRestaurantDataFromIndexedDB().then(data => {
			callback(null, data);
		});

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
				callback(error, null);
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

				index.openCursor().onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						if (cursor.value.id == id) {
							cursor.value.is_favorite = state;
							cursor.update(cursor.value);
							fetch(`${this.RESTAURANT_URL}/${id}/?is_favorite=${state}`, {
								method: 'PUT'
							});
						} else {
							cursor.continue();
						}
					}
				};

			};
		}
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
		};
	}

	/**
	 * Fetch a restaurant by its ID.
	 */
	/*static fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				const restaurant = restaurants.find(r => r.id == id);
				if (restaurant) { // Got the restaurant
					callback(null, restaurant);
				} else { // Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}*/

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

}
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

const observer = new IntersectionObserver(onIntersection, {
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
	this.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
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

function startObserver() {
	const images = document.querySelectorAll('.restaurant-img');
	images.forEach(image => {
		observer.observe(image);
	});
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = this.restaurants) {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.appendChild(createRestaurantHTML(restaurant));
	});
	startObserver();
	addMarkersToMap();
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
	srcSmall.className = 'source-small';
	let picUrlSmall = DBHelper.imageUrlForRestaurant(restaurant).concat('-small.jpg');
	let picUrlMedium = picUrlSmall.replace('small', 'medium');
	srcSmall.srcset = picUrlSmall + ' 1x, ' + picUrlMedium + ' 2x';
	picture.appendChild(srcSmall);

	//next block prepares source tag for large images
	const srcLarge = document.createElement('source');
	srcLarge.className = 'source-large';
	let picUrlLarge = picUrlSmall.replace('small', 'large');
	srcLarge.srcset = picUrlMedium + ' 1x, ' + picUrlLarge + ' 2x';
	srcLarge.media = '(min-width: 750px)';
	picture.appendChild(srcLarge);

	//creating img tag, and adding alt
	const image = document.createElement('img');
	image.className = 'restaurant-img';
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
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
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
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('sw.js').then(() => {
			console.log('Service Worker Registerd');
		}).catch((e) => {
			console.error(e);
			
		});
	});
}