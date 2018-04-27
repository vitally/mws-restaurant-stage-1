/*eslint no-console: 0*/
/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
let map;

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	fetchNeighborhoods();
	fetchCuisines();
});

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
	if(select){
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
	if(select){
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
	if(this.markers){
		this.markers.forEach(m => m.setMap(null));
	}
	this.markers = [];
	this.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = this.restaurants) {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.appendChild(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
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
	srcSmall.media = '(min-width: 500px)';
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
	image.src = picUrlSmall;
	picture.appendChild(image);

	const infoContainer = document.createElement('div');
	infoContainer.className = 'restaurant-info-container';
	infoContainer.appendChild(picture);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	infoContainer.appendChild(name);

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