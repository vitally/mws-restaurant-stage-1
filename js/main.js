let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('js/sw.js').then(() =>{
      console.log('Service Worker Registerd');
    }).catch(() =>{
      this.console.error('Service Worker registration failed');
    });
  });
}

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
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.appendChild(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.appendChild(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
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
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.appendChild(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = "restaurant-card";

  const picture = document.createElement('picture');
  picture.className = 'restaurant-picture';

  const srcSmall = document.createElement('source');
  srcSmall.className = 'source-small';
  let picUrlSmall = DBHelper.imageUrlForRestaurant(restaurant).replace(".", "-small.");
  let picUrlMedium = picUrlSmall.replace("small", "medium");
  srcSmall.srcset = picUrlSmall + " 1x, " + picUrlMedium + " 2x";
  srcSmall.media = '(min-width: 500px)';
  picture.appendChild(srcSmall);

  const srcLarge = document.createElement('source');
  srcLarge.className = 'source-large';
  let picUrlLarge = picUrlSmall.replace("small", "large");
  srcLarge.srcset = picUrlMedium + " 1x, " + picUrlLarge + " 2x";
  srcLarge.media = '(min-width: 750px)';
  picture.appendChild(srcLarge);

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
  neighborhood.setAttribute('aria-describedby','restaurant-neighborhood-label'); 
  neighborhood.innerHTML = restaurant.neighborhood;
  addressContainer.appendChild(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.setAttribute('aria-describedby','restaurant-address-label'); 
  addressContainer.appendChild(address);

  infoContainer.appendChild(addressContainer);

  li.appendChild(infoContainer);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.className = 'tap-target restaurant-card-details';
  more.setAttribute('aria-label','Restaurant: ' + restaurant.name + ': view details.');
  more.setAttribute('role','button');
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.appendChild(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}