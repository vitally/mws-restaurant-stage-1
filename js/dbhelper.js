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