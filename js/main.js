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