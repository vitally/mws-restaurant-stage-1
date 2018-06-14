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
