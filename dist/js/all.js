class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static get database(){if(!navigator.serviceWorker)return Promise.resolve();return(window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB).open("rreviews",1)}static fetchRestaurants(e){fetch(DBHelper.DATABASE_URL).then(e=>e.json()).then(t=>{DBHelper.storeRestaurantDataInIndexedDB(t),e(null,t)}).catch(t=>{DBHelper.getRestaurantDataFromIndexedDB().then(t=>{e(null,t)})})}static storeRestaurantDataInIndexedDB(e){const t=DBHelper.database;DBHelper.upgadeIndexedDB(t),t&&(t.onsuccess=function(n){const r=t.result.transaction("rreviews","readwrite").objectStore("rreviews");e.forEach(e=>{r.put(e)})})}static getRestaurantDataFromIndexedDB(){return new Promise((e,t)=>{const n=DBHelper.database;DBHelper.upgadeIndexedDB(n),n&&(n.onsuccess=function(t){const r=[];n.result.transaction("rreviews","readonly").objectStore("rreviews").openCursor().onsuccess=function(t){const n=t.target.result;n?(r.push(n.value),n.continue()):e(r)}})})}static upgadeIndexedDB(e){e.onupgradeneeded=function(){e.result.createObjectStore("rreviews",{keyPath:"id"}).createIndex("name","name")}}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,a)=>{if(r)n(r,null);else{let r=a;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph?e.photograph:e.id}`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let map;document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()});const observer=new IntersectionObserver(onIntersection,{rootMargin:"0px",threshold:.1});function onIntersection(e){e.forEach(e=>{e.intersectionRatio>0&&(observer.unobserve(e.target),loadImage(e.target))})}function loadImage(e){const t=e.dataset.src;fetchImage(t).then(()=>{e.src=t})}function fetchImage(e){return new Promise((t,n)=>{const r=new Image;r.src=e,r.onload=t,r.onerror=n})}function fetchNeighborhoods(){DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(this.neighborhoods=t,fillNeighborhoodsHTML())})}function fillNeighborhoodsHTML(e=this.neighborhoods){const t=document.getElementById("neighborhoods-select");t&&e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.appendChild(n)})}function fetchCuisines(){DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(this.cuisines=t,fillCuisinesHTML())})}function fillCuisinesHTML(e=this.cuisines){const t=document.getElementById("cuisines-select");t&&e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.appendChild(n)})}function updateRestaurants(){const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,r=t.selectedIndex,a=e[n].value,s=t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(a,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}function resetRestaurants(e){this.restaurants=[],document.getElementById("restaurants-list").innerHTML="",this.markers&&this.markers.forEach(e=>e.setMap(null)),this.markers=[],this.restaurants=e}function startObserver(){document.querySelectorAll(".restaurant-img").forEach(e=>{observer.observe(e)})}function fillRestaurantsHTML(e=this.restaurants){const t=document.getElementById("restaurants-list");e.forEach(e=>{t.appendChild(createRestaurantHTML(e))}),startObserver(),addMarkersToMap()}function createRestaurantHTML(e){const t=document.createElement("li");t.className="restaurant-card";const n=document.createElement("picture");n.className="restaurant-picture";const r=document.createElement("source");r.className="source-small";let a=DBHelper.imageUrlForRestaurant(e).concat("-small.jpg"),s=a.replace("small","medium");r.srcset=a+" 1x, "+s+" 2x",r.media="(min-width: 500px)",n.appendChild(r);const o=document.createElement("source");o.className="source-large";let i=a.replace("small","large");o.srcset=s+" 1x, "+i+" 2x",o.media="(min-width: 750px)",n.appendChild(o);const l=document.createElement("img");l.className="restaurant-img",l.alt='Image of "'+e.name+'" restaurant.',l.setAttribute("data-src",a),n.appendChild(l);const c=document.createElement("div");c.className="restaurant-info-container",c.appendChild(n);const d=document.createElement("h2");d.innerHTML=e.name,c.appendChild(d);const u=document.createElement("a"),m=e.is_favorite?"Remove restaurant "+e.name+"from favorites.":"Add restaurant "+e.name+"to favorites.";u.className="tap-target top-right",u.setAttribute("aria-label",m),c.appendChild(u);const p=document.createElement("i");p.className="material-icons favorite-icon",p.innerHTML=e.is_favorite?"favorite":"favorite_border",u.appendChild(p);const h=document.createElement("div");h.className="address-container";const f=document.createElement("p");f.setAttribute("aria-describedby","restaurant-neighborhood-label"),f.innerHTML=e.neighborhood,h.appendChild(f);const g=document.createElement("p");g.innerHTML=e.address,g.setAttribute("aria-describedby","restaurant-address-label"),h.appendChild(g),c.appendChild(h),t.appendChild(c);const B=document.createElement("a");return B.innerHTML="View Details",B.className="tap-target restaurant-card-details",B.setAttribute("aria-label","Restaurant: "+e.name+": view details."),B.setAttribute("role","button"),B.href=DBHelper.urlForRestaurant(e),t.appendChild(B),t}function addMarkersToMap(e=this.restaurants){e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,this.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),this.markers.push(t)})}let restaurant;function fetchRestaurantFromURL(e){if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):e("No restaurant id in URL",null)}function fillRestaurantHTML(e=self.restaurant){document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img";let n=DBHelper.imageUrlForRestaurant(e).concat("-small.jpg");t.setAttribute("data-src",n),t.alt='Image of "'+e.name+'" restaurant.';const r=document.getElementById("source-small");let a=n.replace("small","medium");r.srcset=n+" 1x, "+a+" 2x";const s=document.getElementById("source-large");let o=n.replace("small","large");s.srcset=a+" 1x, "+o+" 2x",document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}function fillRestaurantHoursHTML(e=self.restaurant.operating_hours){const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,a.className="table-day",r.appendChild(a);const s=document.createElement("td");s.innerHTML=e[n],s.className="table-time",r.appendChild(s),t.appendChild(r)}}function fillReviewsHTML(e=self.restaurant.reviews){const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}function createReviewHTML(e){const t=document.createElement("li"),n=document.createElement("p");n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=e.date,t.appendChild(r);const a=document.createElement("p");a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const s=document.createElement("p");return s.className="review-comments",s.innerHTML=e.comments,t.appendChild(s),t}function fillBreadcrumb(e=self.restaurant){const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}function getParameterByName(e,t){t||(t=window.location.href),e=e.replace(/[[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}window.initMap=(()=>{this.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),window.initMapDetails=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").then(()=>{console.log("Service Worker Registerd")}).catch(e=>{console.error(e)})});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyplc2xpbnQgbm8tdW51c2VkLXZhcnM6IDAqL1xyXG4vKmVzbGludCBuby11bmRlZjogMCovXHJcbi8qZXNsaW50IGxpbmVicmVhay1zdHlsZTogW1wiZXJyb3JcIiwgXCJ3aW5kb3dzXCJdKi9cclxuLyoqXHJcbiAqIENvbW1vbiBkYXRhYmFzZSBoZWxwZXIgZnVuY3Rpb25zLlxyXG4gKi9cclxuY2xhc3MgREJIZWxwZXIge1xyXG5cdC8qKlxyXG5cdCAqIERhdGFiYXNlIFVSTC5cclxuXHQgKiBDaGFuZ2UgdGhpcyB0byByZXN0YXVyYW50cy5qc29uIGZpbGUgbG9jYXRpb24gb24geW91ciBzZXJ2ZXIuXHJcblx0ICovXHJcblx0c3RhdGljIGdldCBEQVRBQkFTRV9VUkwoKSB7XHJcblx0XHRjb25zdCBwb3J0ID0gMTMzNzsgLy8gQ2hhbmdlIHRoaXMgdG8geW91ciBzZXJ2ZXIgcG9ydFxyXG5cdFx0cmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vcmVzdGF1cmFudHNgO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldCBkYXRhYmFzZSgpIHtcclxuXHRcdC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzZXJ2aWNlIHdvcmtlcixcclxuXHRcdC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaGF2aW5nIGEgZGF0YWJhc2VcclxuXHRcdGlmICghbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIpIHtcclxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG5cdFx0fVxyXG5cdFx0Y29uc3QgaW5kZXhlZERCID0gd2luZG93LmluZGV4ZWREQiB8fCB3aW5kb3cubW96SW5kZXhlZERCIHx8IHdpbmRvdy53ZWJraXRJbmRleGVkREIgfHwgd2luZG93Lm1zSW5kZXhlZERCIHx8IHdpbmRvdy5zaGltSW5kZXhlZERCO1xyXG5cdFx0cmV0dXJuIGluZGV4ZWREQi5vcGVuKCdycmV2aWV3cycsIDEpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYWxsIHJlc3RhdXJhbnRzLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRzKGNhbGxiYWNrKSB7XHJcblx0XHRmZXRjaChEQkhlbHBlci5EQVRBQkFTRV9VUkwpXHJcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0XHQvL0dvdCB0aGUgZGF0YSwgbm93IHdyaXR0aW5nIGl0IGluIHRoZSBkYXRhYmFzZS5cclxuXHRcdFx0XHREQkhlbHBlci5zdG9yZVJlc3RhdXJhbnREYXRhSW5JbmRleGVkREIoZGF0YSk7XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZGF0YSk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChlcnJvciA9PiB7XHJcblx0XHRcdFx0REJIZWxwZXIuZ2V0UmVzdGF1cmFudERhdGFGcm9tSW5kZXhlZERCKCkudGhlbihkYXRhID0+IHtcclxuXHRcdFx0XHRcdGNhbGxiYWNrKG51bGwsIGRhdGEpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBzdG9yZVJlc3RhdXJhbnREYXRhSW5JbmRleGVkREIoZGF0YSkge1xyXG5cdFx0Ly9Hb3QgdGhlIGRhdGEsIG5vdyB3cml0dGluZyBpdCBpbiB0aGUgZGF0YWJhc2UuXHJcblx0XHRjb25zdCBEQk9wZW5SZXF1ZXN0ID0gREJIZWxwZXIuZGF0YWJhc2U7XHJcblx0XHREQkhlbHBlci51cGdhZGVJbmRleGVkREIoREJPcGVuUmVxdWVzdCk7XHJcblx0XHRpZiAoREJPcGVuUmVxdWVzdCkge1xyXG5cdFx0XHREQk9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0XHRcdGNvbnN0IGRiID0gREJPcGVuUmVxdWVzdC5yZXN1bHQ7XHJcblx0XHRcdFx0Y29uc3QgdHggPSBkYi50cmFuc2FjdGlvbigncnJldmlld3MnLCAncmVhZHdyaXRlJyk7XHJcblx0XHRcdFx0Y29uc3Qgc3RvcmUgPSB0eC5vYmplY3RTdG9yZSgncnJldmlld3MnKTtcclxuXHRcdFx0XHRkYXRhLmZvckVhY2goKHJlc3RhdXJhbnQpID0+IHtcclxuXHRcdFx0XHRcdHN0b3JlLnB1dChyZXN0YXVyYW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRSZXN0YXVyYW50RGF0YUZyb21JbmRleGVkREIoKSB7XHJcblx0XHQvL0l0IHNlZW1zIGxpa2Ugd2UndmUgZ290IGFuIGVycm9yIHdoaWxlIHRyeWluZyB0byByZWFkIGZyb20gdGhlIHNlcnZlclxyXG5cdFx0Ly9TbyB0cnlpbmcgdG8gZ2V0IGRhdGEgZnJvbSB0aGUgaW5kZXhlZERCIG5vd1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdFx0Y29uc3QgREJPcGVuUmVxdWVzdCA9IERCSGVscGVyLmRhdGFiYXNlO1xyXG5cdFx0XHREQkhlbHBlci51cGdhZGVJbmRleGVkREIoREJPcGVuUmVxdWVzdCk7XHJcblx0XHRcdGlmIChEQk9wZW5SZXF1ZXN0KSB7XHJcblx0XHRcdFx0REJPcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGRiID0gREJPcGVuUmVxdWVzdC5yZXN1bHQ7XHJcblx0XHRcdFx0XHRjb25zdCBzdG9yZSA9IGRiLnRyYW5zYWN0aW9uKCdycmV2aWV3cycsICdyZWFkb25seScpLm9iamVjdFN0b3JlKCdycmV2aWV3cycpO1xyXG5cdFx0XHRcdFx0Y29uc3QgZGF0YSA9IFtdO1xyXG5cdFx0XHRcdFx0c3RvcmUub3BlbkN1cnNvcigpLm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJzb3IgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG5cdFx0XHRcdFx0XHRpZihjdXJzb3IpIHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goY3Vyc29yLnZhbHVlKTtcclxuXHRcdFx0XHRcdFx0XHRjdXJzb3IuY29udGludWUoKTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShkYXRhKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyB1cGdhZGVJbmRleGVkREIoREJPcGVuUmVxdWVzdCkge1xyXG5cdFx0REJPcGVuUmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IGRiID0gREJPcGVuUmVxdWVzdC5yZXN1bHQ7XHJcblx0XHRcdGNvbnN0IHN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoJ3JyZXZpZXdzJywge1xyXG5cdFx0XHRcdGtleVBhdGg6ICdpZCdcclxuXHRcdFx0fSk7XHJcblx0XHRcdHN0b3JlLmNyZWF0ZUluZGV4KCduYW1lJywgJ25hbWUnKTtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUlkKGlkLCBjYWxsYmFjaykge1xyXG5cdFx0Ly8gZmV0Y2ggYWxsIHJlc3RhdXJhbnRzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG5cdFx0REJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zdCByZXN0YXVyYW50ID0gcmVzdGF1cmFudHMuZmluZChyID0+IHIuaWQgPT0gaWQpO1xyXG5cdFx0XHRcdGlmIChyZXN0YXVyYW50KSB7IC8vIEdvdCB0aGUgcmVzdGF1cmFudFxyXG5cdFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudCk7XHJcblx0XHRcdFx0fSBlbHNlIHsgLy8gUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZGF0YWJhc2VcclxuXHRcdFx0XHRcdGNhbGxiYWNrKCdSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0JywgbnVsbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSB0eXBlIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmUoY3Vpc2luZSwgY2FsbGJhY2spIHtcclxuXHRcdC8vIEZldGNoIGFsbCByZXN0YXVyYW50cyAgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBjdWlzaW5lIHR5cGVcclxuXHRcdFx0XHRjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcblx0ICovXHJcblx0c3RhdGljIGZldGNoUmVzdGF1cmFudEJ5TmVpZ2hib3Job29kKG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcclxuXHRcdC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG5cdFx0REJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIG5laWdoYm9yaG9vZFxyXG5cdFx0XHRcdGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xyXG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSBhbmQgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcblx0ICovXHJcblx0c3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZUFuZE5laWdoYm9yaG9vZChjdWlzaW5lLCBuZWlnaGJvcmhvb2QsIGNhbGxiYWNrKSB7XHJcblx0XHQvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGV0IHJlc3VsdHMgPSByZXN0YXVyYW50cztcclxuXHRcdFx0XHRpZiAoY3Vpc2luZSAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgY3Vpc2luZVxyXG5cdFx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChuZWlnaGJvcmhvb2QgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IG5laWdoYm9yaG9vZFxyXG5cdFx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYWxsIG5laWdoYm9yaG9vZHMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcblx0ICovXHJcblx0c3RhdGljIGZldGNoTmVpZ2hib3Job29kcyhjYWxsYmFjaykge1xyXG5cdFx0Ly8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcblx0XHREQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSB7XHJcblx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIEdldCBhbGwgbmVpZ2hib3Job29kcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG5cdFx0XHRcdGNvbnN0IG5laWdoYm9yaG9vZHMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLm5laWdoYm9yaG9vZCk7XHJcblx0XHRcdFx0Ly8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBuZWlnaGJvcmhvb2RzXHJcblx0XHRcdFx0Y29uc3QgdW5pcXVlTmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHMuZmlsdGVyKCh2LCBpKSA9PiBuZWlnaGJvcmhvb2RzLmluZGV4T2YodikgPT0gaSk7XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgdW5pcXVlTmVpZ2hib3Job29kcyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYWxsIGN1aXNpbmVzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XHJcblx0XHQvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG5cdFx0XHRcdGNvbnN0IGN1aXNpbmVzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5jdWlzaW5lX3R5cGUpO1xyXG5cdFx0XHRcdC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gY3Vpc2luZXNcclxuXHRcdFx0XHRjb25zdCB1bmlxdWVDdWlzaW5lcyA9IGN1aXNpbmVzLmZpbHRlcigodiwgaSkgPT4gY3Vpc2luZXMuaW5kZXhPZih2KSA9PSBpKTtcclxuXHRcdFx0XHRjYWxsYmFjayhudWxsLCB1bmlxdWVDdWlzaW5lcyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzdGF1cmFudCBwYWdlIFVSTC5cclxuXHQgKi9cclxuXHRzdGF0aWMgdXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XHJcblx0XHRyZXR1cm4gKGAuL3Jlc3RhdXJhbnQuaHRtbD9pZD0ke3Jlc3RhdXJhbnQuaWR9YCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXN0YXVyYW50IGltYWdlIFVSTC5cclxuXHQgKi9cclxuXHRzdGF0aWMgaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpIHtcclxuXHRcdHJldHVybiAoYC9pbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGggPyByZXN0YXVyYW50LnBob3RvZ3JhcGggOiByZXN0YXVyYW50LmlkfWApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWFwIG1hcmtlciBmb3IgYSByZXN0YXVyYW50LlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xyXG5cdFx0Y29uc3QgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdHBvc2l0aW9uOiByZXN0YXVyYW50LmxhdGxuZyxcclxuXHRcdFx0dGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcclxuXHRcdFx0dXJsOiBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLFxyXG5cdFx0XHRtYXA6IG1hcCxcclxuXHRcdFx0YW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUFxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbWFya2VyO1xyXG5cdH1cclxuXHJcbn1cclxuLyplc2xpbnQgbm8tY29uc29sZTogMCovXHJcbi8qZXNsaW50IG5vLXVudXNlZC12YXJzOiAwKi9cclxuLyplc2xpbnQgbm8tdW5kZWY6IDAqL1xyXG4vKipcclxuICogRmV0Y2ggbmVpZ2hib3Job29kcyBhbmQgY3Vpc2luZXMgYXMgc29vbiBhcyB0aGUgcGFnZSBpcyBsb2FkZWQuXHJcbiAqL1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50KSA9PiB7XHJcblx0ZmV0Y2hOZWlnaGJvcmhvb2RzKCk7XHJcblx0ZmV0Y2hDdWlzaW5lcygpO1xyXG59KTtcclxuXHJcbmxldCBtYXA7XHJcblxyXG5jb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihvbkludGVyc2VjdGlvbiwge1xyXG5cdHJvb3RNYXJnaW46ICcwcHgnLFxyXG5cdHRocmVzaG9sZDogMC4xXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gb25JbnRlcnNlY3Rpb24oZW50cmllcykge1xyXG5cdC8vIExvb3AgdGhyb3VnaCB0aGUgZW50cmllc1xyXG5cdGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XHJcblx0XHQvLyBBcmUgd2UgaW4gdmlld3BvcnQ/XHJcblx0XHRpZiAoZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gPiAwKSB7XHJcblxyXG5cdFx0XHQvLyBTdG9wIHdhdGNoaW5nIGFuZCBsb2FkIHRoZSBpbWFnZVxyXG5cdFx0XHRvYnNlcnZlci51bm9ic2VydmUoZW50cnkudGFyZ2V0KTtcclxuXHRcdFx0bG9hZEltYWdlKGVudHJ5LnRhcmdldCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRJbWFnZShpbWFnZSkge1xyXG5cdGNvbnN0IHNyYyA9IGltYWdlLmRhdGFzZXQuc3JjO1xyXG5cdGZldGNoSW1hZ2Uoc3JjKS50aGVuKCgpID0+IHtcclxuXHRcdGltYWdlLnNyYyA9IHNyYztcclxuXHR9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmV0Y2hJbWFnZSh1cmwpIHtcclxuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0Y29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdGltYWdlLnNyYyA9IHVybDtcclxuXHRcdGltYWdlLm9ubG9hZCA9IHJlc29sdmU7XHJcblx0XHRpbWFnZS5vbmVycm9yID0gcmVqZWN0O1xyXG5cdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyBhbmQgc2V0IHRoZWlyIEhUTUwuXHJcbiAqL1xyXG5mdW5jdGlvbiBmZXRjaE5laWdoYm9yaG9vZHMoKSB7XHJcblx0REJIZWxwZXIuZmV0Y2hOZWlnaGJvcmhvb2RzKChlcnJvciwgbmVpZ2hib3Job29kcykgPT4ge1xyXG5cdFx0aWYgKGVycm9yKSB7IC8vIEdvdCBhbiBlcnJvclxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMubmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHM7XHJcblx0XHRcdGZpbGxOZWlnaGJvcmhvb2RzSFRNTCgpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IG5laWdoYm9yaG9vZHMgSFRNTC5cclxuICovXHJcbmZ1bmN0aW9uIGZpbGxOZWlnaGJvcmhvb2RzSFRNTChuZWlnaGJvcmhvb2RzID0gdGhpcy5uZWlnaGJvcmhvb2RzKSB7XHJcblx0Y29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25laWdoYm9yaG9vZHMtc2VsZWN0Jyk7XHJcblx0aWYgKHNlbGVjdCkge1xyXG5cdFx0bmVpZ2hib3Job29kcy5mb3JFYWNoKG5laWdoYm9yaG9vZCA9PiB7XHJcblx0XHRcdGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRvcHRpb24uaW5uZXJIVE1MID0gbmVpZ2hib3Job29kO1xyXG5cdFx0XHRvcHRpb24udmFsdWUgPSBuZWlnaGJvcmhvb2Q7XHJcblx0XHRcdHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2ggYWxsIGN1aXNpbmVzIGFuZCBzZXQgdGhlaXIgSFRNTC5cclxuICovXHJcbmZ1bmN0aW9uIGZldGNoQ3Vpc2luZXMoKSB7XHJcblx0REJIZWxwZXIuZmV0Y2hDdWlzaW5lcygoZXJyb3IsIGN1aXNpbmVzKSA9PiB7XHJcblx0XHRpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuY3Vpc2luZXMgPSBjdWlzaW5lcztcclxuXHRcdFx0ZmlsbEN1aXNpbmVzSFRNTCgpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IGN1aXNpbmVzIEhUTUwuXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxsQ3Vpc2luZXNIVE1MKGN1aXNpbmVzID0gdGhpcy5jdWlzaW5lcykge1xyXG5cdGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdWlzaW5lcy1zZWxlY3QnKTtcclxuXHRpZiAoc2VsZWN0KSB7XHJcblx0XHRjdWlzaW5lcy5mb3JFYWNoKGN1aXNpbmUgPT4ge1xyXG5cdFx0XHRjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0b3B0aW9uLmlubmVySFRNTCA9IGN1aXNpbmU7XHJcblx0XHRcdG9wdGlvbi52YWx1ZSA9IGN1aXNpbmU7XHJcblx0XHRcdHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBHb29nbGUgbWFwLCBjYWxsZWQgZnJvbSBIVE1MLlxyXG4gKi9cclxud2luZG93LmluaXRNYXAgPSAoKSA9PiB7XHJcblx0bGV0IGxvYyA9IHtcclxuXHRcdGxhdDogNDAuNzIyMjE2LFxyXG5cdFx0bG5nOiAtNzMuOTg3NTAxXHJcblx0fTtcclxuXHR0aGlzLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCB7XHJcblx0XHR6b29tOiAxMixcclxuXHRcdGNlbnRlcjogbG9jLFxyXG5cdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXHJcblx0fSk7XHJcblx0dXBkYXRlUmVzdGF1cmFudHMoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgcGFnZSBhbmQgbWFwIGZvciBjdXJyZW50IHJlc3RhdXJhbnRzLlxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlUmVzdGF1cmFudHMoKSB7XHJcblx0Y29uc3QgY1NlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdWlzaW5lcy1zZWxlY3QnKTtcclxuXHRjb25zdCBuU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25laWdoYm9yaG9vZHMtc2VsZWN0Jyk7XHJcblxyXG5cdGNvbnN0IGNJbmRleCA9IGNTZWxlY3Quc2VsZWN0ZWRJbmRleDtcclxuXHRjb25zdCBuSW5kZXggPSBuU2VsZWN0LnNlbGVjdGVkSW5kZXg7XHJcblxyXG5cdGNvbnN0IGN1aXNpbmUgPSBjU2VsZWN0W2NJbmRleF0udmFsdWU7XHJcblx0Y29uc3QgbmVpZ2hib3Job29kID0gblNlbGVjdFtuSW5kZXhdLnZhbHVlO1xyXG5cclxuXHREQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QoY3Vpc2luZSwgbmVpZ2hib3Job29kLCAoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcblx0XHRpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlc2V0UmVzdGF1cmFudHMocmVzdGF1cmFudHMpO1xyXG5cdFx0XHRmaWxsUmVzdGF1cmFudHNIVE1MKCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBjdXJyZW50IHJlc3RhdXJhbnRzLCB0aGVpciBIVE1MIGFuZCByZW1vdmUgdGhlaXIgbWFwIG1hcmtlcnMuXHJcbiAqL1xyXG5mdW5jdGlvbiByZXNldFJlc3RhdXJhbnRzKHJlc3RhdXJhbnRzKSB7XHJcblx0Ly8gUmVtb3ZlIGFsbCByZXN0YXVyYW50c1xyXG5cdHRoaXMucmVzdGF1cmFudHMgPSBbXTtcclxuXHRjb25zdCB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50cy1saXN0Jyk7XHJcblx0dWwuaW5uZXJIVE1MID0gJyc7XHJcblxyXG5cdC8vIFJlbW92ZSBhbGwgbWFwIG1hcmtlcnNcclxuXHRpZiAodGhpcy5tYXJrZXJzKSB7XHJcblx0XHR0aGlzLm1hcmtlcnMuZm9yRWFjaChtID0+IG0uc2V0TWFwKG51bGwpKTtcclxuXHR9XHJcblx0dGhpcy5tYXJrZXJzID0gW107XHJcblx0dGhpcy5yZXN0YXVyYW50cyA9IHJlc3RhdXJhbnRzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydE9ic2VydmVyKCkge1xyXG5cdGNvbnN0IGltYWdlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yZXN0YXVyYW50LWltZycpO1xyXG5cdGltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcclxuXHRcdG9ic2VydmVyLm9ic2VydmUoaW1hZ2UpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGFsbCByZXN0YXVyYW50cyBIVE1MIGFuZCBhZGQgdGhlbSB0byB0aGUgd2VicGFnZS5cclxuICovXHJcbmZ1bmN0aW9uIGZpbGxSZXN0YXVyYW50c0hUTUwocmVzdGF1cmFudHMgPSB0aGlzLnJlc3RhdXJhbnRzKSB7XHJcblx0Y29uc3QgdWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudHMtbGlzdCcpO1xyXG5cdHJlc3RhdXJhbnRzLmZvckVhY2gocmVzdGF1cmFudCA9PiB7XHJcblx0XHR1bC5hcHBlbmRDaGlsZChjcmVhdGVSZXN0YXVyYW50SFRNTChyZXN0YXVyYW50KSk7XHJcblx0fSk7XHJcblx0c3RhcnRPYnNlcnZlcigpO1xyXG5cdGFkZE1hcmtlcnNUb01hcCgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHJlc3RhdXJhbnQgSFRNTC5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVJlc3RhdXJhbnRIVE1MKHJlc3RhdXJhbnQpIHtcclxuXHRjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcblx0bGkuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtY2FyZCc7XHJcblxyXG5cdGNvbnN0IHBpY3R1cmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwaWN0dXJlJyk7IC8vSGVyZSBnb2VzIHRoZSBuZXcgcGljdHVyZSB0YWcsIHRoYXQgd2lsbCBpbmNsdWRlIHRoZSA8aW1nPlxyXG5cdHBpY3R1cmUuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtcGljdHVyZSc7IC8vdGhhdCBpcyBob3cgd2Ugd2lsbCBzZXJ2ZSBkaWZlcmVudCBzaXplcyBvZiBpbWFnZXNcclxuXHJcblx0Ly9uZXh0IGJsb2NrIHByZXBhcmVzIHNvdXJjZSB0YWcgZm9yIHNtYWxsIGltYWdlc1xyXG5cdGNvbnN0IHNyY1NtYWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XHJcblx0c3JjU21hbGwuY2xhc3NOYW1lID0gJ3NvdXJjZS1zbWFsbCc7XHJcblx0bGV0IHBpY1VybFNtYWxsID0gREJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLmNvbmNhdCgnLXNtYWxsLmpwZycpO1xyXG5cdGxldCBwaWNVcmxNZWRpdW0gPSBwaWNVcmxTbWFsbC5yZXBsYWNlKCdzbWFsbCcsICdtZWRpdW0nKTtcclxuXHRzcmNTbWFsbC5zcmNzZXQgPSBwaWNVcmxTbWFsbCArICcgMXgsICcgKyBwaWNVcmxNZWRpdW0gKyAnIDJ4JztcclxuXHRzcmNTbWFsbC5tZWRpYSA9ICcobWluLXdpZHRoOiA1MDBweCknO1xyXG5cdHBpY3R1cmUuYXBwZW5kQ2hpbGQoc3JjU21hbGwpO1xyXG5cclxuXHQvL25leHQgYmxvY2sgcHJlcGFyZXMgc291cmNlIHRhZyBmb3IgbGFyZ2UgaW1hZ2VzXHJcblx0Y29uc3Qgc3JjTGFyZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcclxuXHRzcmNMYXJnZS5jbGFzc05hbWUgPSAnc291cmNlLWxhcmdlJztcclxuXHRsZXQgcGljVXJsTGFyZ2UgPSBwaWNVcmxTbWFsbC5yZXBsYWNlKCdzbWFsbCcsICdsYXJnZScpO1xyXG5cdHNyY0xhcmdlLnNyY3NldCA9IHBpY1VybE1lZGl1bSArICcgMXgsICcgKyBwaWNVcmxMYXJnZSArICcgMngnO1xyXG5cdHNyY0xhcmdlLm1lZGlhID0gJyhtaW4td2lkdGg6IDc1MHB4KSc7XHJcblx0cGljdHVyZS5hcHBlbmRDaGlsZChzcmNMYXJnZSk7XHJcblxyXG5cdC8vY3JlYXRpbmcgaW1nIHRhZywgYW5kIGFkZGluZyBhbHRcclxuXHRjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdGltYWdlLmNsYXNzTmFtZSA9ICdyZXN0YXVyYW50LWltZyc7XHJcblx0aW1hZ2UuYWx0ID0gJ0ltYWdlIG9mIFwiJyArIHJlc3RhdXJhbnQubmFtZSArICdcIiByZXN0YXVyYW50Lic7XHJcblx0Ly9pbWFnZS5zcmMgPSBwaWNVcmxTbWFsbDtcclxuXHRpbWFnZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJywgcGljVXJsU21hbGwpO1xyXG5cdHBpY3R1cmUuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xyXG5cclxuXHRjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0aW5mb0NvbnRhaW5lci5jbGFzc05hbWUgPSAncmVzdGF1cmFudC1pbmZvLWNvbnRhaW5lcic7XHJcblx0aW5mb0NvbnRhaW5lci5hcHBlbmRDaGlsZChwaWN0dXJlKTtcclxuXHJcblx0XHJcblx0Y29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XHJcblx0bmFtZS5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5hbWU7XHJcblx0aW5mb0NvbnRhaW5lci5hcHBlbmRDaGlsZChuYW1lKTtcclxuXHRcclxuXHRjb25zdCBmYXZvcml0ZV9pY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG5cdGNvbnN0IGZhdl9pY29uX2FyaWFfbGFiZWwgPSByZXN0YXVyYW50LmlzX2Zhdm9yaXRlID8gJ1JlbW92ZSByZXN0YXVyYW50ICcgKyByZXN0YXVyYW50Lm5hbWUgKyAnZnJvbSBmYXZvcml0ZXMuJyA6ICdBZGQgcmVzdGF1cmFudCAnICsgcmVzdGF1cmFudC5uYW1lICsgJ3RvIGZhdm9yaXRlcy4nO1xyXG5cdGZhdm9yaXRlX2ljb24uY2xhc3NOYW1lID0gJ3RhcC10YXJnZXQgdG9wLXJpZ2h0JztcclxuXHRmYXZvcml0ZV9pY29uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGZhdl9pY29uX2FyaWFfbGFiZWwpO1xyXG5cdGluZm9Db250YWluZXIuYXBwZW5kQ2hpbGQoZmF2b3JpdGVfaWNvbik7XHJcblxyXG5cdGNvbnN0IGZhdm9yaXRlX3N5bWJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcclxuXHRmYXZvcml0ZV9zeW1ib2wuY2xhc3NOYW1lID0gJ21hdGVyaWFsLWljb25zIGZhdm9yaXRlLWljb24nO1xyXG5cdGZhdm9yaXRlX3N5bWJvbC5pbm5lckhUTUwgPSByZXN0YXVyYW50LmlzX2Zhdm9yaXRlID8gJ2Zhdm9yaXRlJyA6J2Zhdm9yaXRlX2JvcmRlcic7XHJcblx0ZmF2b3JpdGVfaWNvbi5hcHBlbmRDaGlsZChmYXZvcml0ZV9zeW1ib2wpO1xyXG5cdFxyXG5cdGNvbnN0IGFkZHJlc3NDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRhZGRyZXNzQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdhZGRyZXNzLWNvbnRhaW5lcic7XHJcblxyXG5cdGNvbnN0IG5laWdoYm9yaG9vZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuXHRuZWlnaGJvcmhvb2Quc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgJ3Jlc3RhdXJhbnQtbmVpZ2hib3Job29kLWxhYmVsJyk7XHJcblx0bmVpZ2hib3Job29kLmlubmVySFRNTCA9IHJlc3RhdXJhbnQubmVpZ2hib3Job29kO1xyXG5cdGFkZHJlc3NDb250YWluZXIuYXBwZW5kQ2hpbGQobmVpZ2hib3Job29kKTtcclxuXHJcblx0Y29uc3QgYWRkcmVzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuXHRhZGRyZXNzLmlubmVySFRNTCA9IHJlc3RhdXJhbnQuYWRkcmVzcztcclxuXHRhZGRyZXNzLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsICdyZXN0YXVyYW50LWFkZHJlc3MtbGFiZWwnKTtcclxuXHRhZGRyZXNzQ29udGFpbmVyLmFwcGVuZENoaWxkKGFkZHJlc3MpO1xyXG5cclxuXHRpbmZvQ29udGFpbmVyLmFwcGVuZENoaWxkKGFkZHJlc3NDb250YWluZXIpO1xyXG5cclxuXHRsaS5hcHBlbmRDaGlsZChpbmZvQ29udGFpbmVyKTtcclxuXHJcblx0Y29uc3QgbW9yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuXHRtb3JlLmlubmVySFRNTCA9ICdWaWV3IERldGFpbHMnO1xyXG5cdG1vcmUuY2xhc3NOYW1lID0gJ3RhcC10YXJnZXQgcmVzdGF1cmFudC1jYXJkLWRldGFpbHMnO1xyXG5cdG1vcmUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ1Jlc3RhdXJhbnQ6ICcgKyByZXN0YXVyYW50Lm5hbWUgKyAnOiB2aWV3IGRldGFpbHMuJyk7XHJcblx0bW9yZS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYnV0dG9uJyk7XHJcblx0bW9yZS5ocmVmID0gREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KTtcclxuXHRsaS5hcHBlbmRDaGlsZChtb3JlKTtcclxuXHJcblx0cmV0dXJuIGxpO1xyXG59XHJcblxyXG4vKipcclxuICogQWRkIG1hcmtlcnMgZm9yIGN1cnJlbnQgcmVzdGF1cmFudHMgdG8gdGhlIG1hcC5cclxuICovXHJcbmZ1bmN0aW9uIGFkZE1hcmtlcnNUb01hcChyZXN0YXVyYW50cyA9IHRoaXMucmVzdGF1cmFudHMpIHtcclxuXHRyZXN0YXVyYW50cy5mb3JFYWNoKHJlc3RhdXJhbnQgPT4ge1xyXG5cdFx0Ly8gQWRkIG1hcmtlciB0byB0aGUgbWFwXHJcblx0XHRjb25zdCBtYXJrZXIgPSBEQkhlbHBlci5tYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIHRoaXMubWFwKTtcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgKCkgPT4ge1xyXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IG1hcmtlci51cmw7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMubWFya2Vycy5wdXNoKG1hcmtlcik7XHJcblx0fSk7XHJcbn1cclxuLyplc2xpbnQgbm8tY29uc29sZTogMCovXHJcbi8qZXNsaW50IG5vLXVudXNlZC12YXJzOiAwKi9cclxuLyplc2xpbnQgbm8tdW5kZWY6IDAqL1xyXG5cclxubGV0IHJlc3RhdXJhbnQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBHb29nbGUgbWFwLCBjYWxsZWQgZnJvbSBIVE1MLlxyXG4gKi9cclxud2luZG93LmluaXRNYXBEZXRhaWxzID0gKCkgPT4ge1xyXG5cdGZldGNoUmVzdGF1cmFudEZyb21VUkwoKGVycm9yLCByZXN0YXVyYW50KSA9PiB7XHJcblx0XHRpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNlbGYubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIHtcclxuXHRcdFx0XHR6b29tOiAxNixcclxuXHRcdFx0XHRjZW50ZXI6IHJlc3RhdXJhbnQubGF0bG5nLFxyXG5cdFx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0ZmlsbEJyZWFkY3J1bWIoKTtcclxuXHRcdFx0REJIZWxwZXIubWFwTWFya2VyRm9yUmVzdGF1cmFudChzZWxmLnJlc3RhdXJhbnQsIHNlbGYubWFwKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgY3VycmVudCByZXN0YXVyYW50IGZyb20gcGFnZSBVUkwuXHJcbiAqL1xyXG5mdW5jdGlvbiBmZXRjaFJlc3RhdXJhbnRGcm9tVVJMKGNhbGxiYWNrKXtcclxuXHRpZiAoc2VsZi5yZXN0YXVyYW50KSB7IC8vIHJlc3RhdXJhbnQgYWxyZWFkeSBmZXRjaGVkIVxyXG5cdFx0Y2FsbGJhY2sobnVsbCwgc2VsZi5yZXN0YXVyYW50KTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0Y29uc3QgaWQgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2lkJyk7XHJcblx0aWYgKCFpZCkgeyAvLyBubyBpZCBmb3VuZCBpbiBVUkxcclxuXHRcdGNhbGxiYWNrKCdObyByZXN0YXVyYW50IGlkIGluIFVSTCcsIG51bGwpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHREQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRCeUlkKGlkLCAoZXJyb3IsIHJlc3RhdXJhbnQpID0+IHtcclxuXHRcdFx0c2VsZi5yZXN0YXVyYW50ID0gcmVzdGF1cmFudDtcclxuXHRcdFx0aWYgKCFyZXN0YXVyYW50KSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlcnJvcik7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGZpbGxSZXN0YXVyYW50SFRNTCgpO1xyXG5cdFx0XHRjYWxsYmFjayhudWxsLCByZXN0YXVyYW50KTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSByZXN0YXVyYW50IEhUTUwgYW5kIGFkZCBpdCB0byB0aGUgd2VicGFnZVxyXG4gKi9cclxuZnVuY3Rpb24gZmlsbFJlc3RhdXJhbnRIVE1MKHJlc3RhdXJhbnQgPSBzZWxmLnJlc3RhdXJhbnQpe1xyXG4gIFxyXG5cdGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudC1uYW1lJyk7XHJcblx0bmFtZS5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5hbWU7XHJcbiAgXHJcblx0Y29uc3QgYWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LWFkZHJlc3MnKTtcclxuXHRhZGRyZXNzLmlubmVySFRNTCA9IHJlc3RhdXJhbnQuYWRkcmVzcztcclxuICBcclxuXHRjb25zdCBpbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LWltZycpO1xyXG5cdGltYWdlLmNsYXNzTmFtZSA9ICdyZXN0YXVyYW50LWltZyc7XHJcblx0bGV0IHBpY1VybFNtYWxsID0gREJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLmNvbmNhdCgnLXNtYWxsLmpwZycpO1xyXG5cdC8vaW1hZ2Uuc3JjID0gcGljVXJsU21hbGw7XHJcblx0aW1hZ2Uuc2V0QXR0cmlidXRlKCdkYXRhLXNyYycsIHBpY1VybFNtYWxsKTtcclxuXHRpbWFnZS5hbHQgPSAnSW1hZ2Ugb2YgXCInICsgcmVzdGF1cmFudC5uYW1lICsgJ1wiIHJlc3RhdXJhbnQuJztcclxuICBcclxuXHRjb25zdCBzcmNTbWFsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VyY2Utc21hbGwnKTtcclxuXHRsZXQgcGljVXJsTWVkaXVtID0gcGljVXJsU21hbGwucmVwbGFjZSgnc21hbGwnLCdtZWRpdW0nKTtcclxuXHRzcmNTbWFsbC5zcmNzZXQgPSBwaWNVcmxTbWFsbCArICcgMXgsICcgKyBwaWNVcmxNZWRpdW0gKyAnIDJ4JztcclxuICBcclxuXHRjb25zdCBzcmNMYXJnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VyY2UtbGFyZ2UnKTtcclxuXHRsZXQgcGljVXJsTGFyZ2UgPSBwaWNVcmxTbWFsbC5yZXBsYWNlKCdzbWFsbCcsJ2xhcmdlJyk7XHJcblx0c3JjTGFyZ2Uuc3Jjc2V0ID0gcGljVXJsTWVkaXVtICsgJyAxeCwgJyArIHBpY1VybExhcmdlICsgJyAyeCc7XHJcblxyXG5cdC8vY29uc3QgcGljdHVyZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LXBpY3R1cmUnKTtcclxuXHJcblx0Y29uc3QgY3Vpc2luZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LWN1aXNpbmUnKTtcclxuXHRjdWlzaW5lLmlubmVySFRNTCA9IHJlc3RhdXJhbnQuY3Vpc2luZV90eXBlO1xyXG5cclxuXHQvLyBmaWxsIG9wZXJhdGluZyBob3Vyc1xyXG5cdGlmIChyZXN0YXVyYW50Lm9wZXJhdGluZ19ob3Vycykge1xyXG5cdFx0ZmlsbFJlc3RhdXJhbnRIb3Vyc0hUTUwoKTtcclxuXHR9XHJcblx0Ly8gZmlsbCByZXZpZXdzXHJcblx0ZmlsbFJldmlld3NIVE1MKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgcmVzdGF1cmFudCBvcGVyYXRpbmcgaG91cnMgSFRNTCB0YWJsZSBhbmQgYWRkIGl0IHRvIHRoZSB3ZWJwYWdlLlxyXG4gKi9cclxuZnVuY3Rpb24gZmlsbFJlc3RhdXJhbnRIb3Vyc0hUTUwgKG9wZXJhdGluZ0hvdXJzID0gc2VsZi5yZXN0YXVyYW50Lm9wZXJhdGluZ19ob3Vycyl7XHJcblx0Y29uc3QgaG91cnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudC1ob3VycycpO1xyXG5cdGZvciAobGV0IGtleSBpbiBvcGVyYXRpbmdIb3Vycykge1xyXG5cdFx0Y29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuXHJcblx0XHRjb25zdCBkYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cdFx0ZGF5LmlubmVySFRNTCA9IGtleTtcclxuXHRcdGRheS5jbGFzc05hbWUgPSAndGFibGUtZGF5JztcclxuXHRcdHJvdy5hcHBlbmRDaGlsZChkYXkpO1xyXG5cclxuXHRcdGNvbnN0IHRpbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cdFx0dGltZS5pbm5lckhUTUwgPSBvcGVyYXRpbmdIb3Vyc1trZXldO1xyXG5cdFx0dGltZS5jbGFzc05hbWUgPSAndGFibGUtdGltZSc7XHJcblx0XHRyb3cuYXBwZW5kQ2hpbGQodGltZSk7XHJcblxyXG5cdFx0aG91cnMuYXBwZW5kQ2hpbGQocm93KTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYWxsIHJldmlld3MgSFRNTCBhbmQgYWRkIHRoZW0gdG8gdGhlIHdlYnBhZ2UuXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxsUmV2aWV3c0hUTUwocmV2aWV3cyA9IHNlbGYucmVzdGF1cmFudC5yZXZpZXdzKSB7XHJcblx0Y29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jldmlld3MtY29udGFpbmVyJyk7XHJcblx0Y29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xyXG5cdHRpdGxlLmlubmVySFRNTCA9ICdSZXZpZXdzJztcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG5cclxuXHRpZiAoIXJldmlld3MpIHtcclxuXHRcdGNvbnN0IG5vUmV2aWV3cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuXHRcdG5vUmV2aWV3cy5pbm5lckhUTUwgPSAnTm8gcmV2aWV3cyB5ZXQhJztcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChub1Jldmlld3MpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRjb25zdCB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXZpZXdzLWxpc3QnKTtcclxuXHRyZXZpZXdzLmZvckVhY2gocmV2aWV3ID0+IHtcclxuXHRcdHVsLmFwcGVuZENoaWxkKGNyZWF0ZVJldmlld0hUTUwocmV2aWV3KSk7XHJcblx0fSk7XHJcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHVsKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSByZXZpZXcgSFRNTCBhbmQgYWRkIGl0IHRvIHRoZSB3ZWJwYWdlLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlUmV2aWV3SFRNTChyZXZpZXcpe1xyXG5cdGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuXHRjb25zdCBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG5cdG5hbWUuaW5uZXJIVE1MID0gcmV2aWV3Lm5hbWU7XHJcblx0bGkuYXBwZW5kQ2hpbGQobmFtZSk7XHJcblxyXG5cdGNvbnN0IGRhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcblx0ZGF0ZS5pbm5lckhUTUwgPSByZXZpZXcuZGF0ZTtcclxuXHRsaS5hcHBlbmRDaGlsZChkYXRlKTtcclxuXHJcblx0Y29uc3QgcmF0aW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG5cdHJhdGluZy5pbm5lckhUTUwgPSBgUmF0aW5nOiAke3Jldmlldy5yYXRpbmd9YDtcclxuXHRsaS5hcHBlbmRDaGlsZChyYXRpbmcpO1xyXG5cclxuXHRjb25zdCBjb21tZW50cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuXHRjb21tZW50cy5jbGFzc05hbWUgPSAncmV2aWV3LWNvbW1lbnRzJztcclxuXHRjb21tZW50cy5pbm5lckhUTUwgPSByZXZpZXcuY29tbWVudHM7XHJcblx0bGkuYXBwZW5kQ2hpbGQoY29tbWVudHMpO1xyXG5cclxuXHRyZXR1cm4gbGk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgcmVzdGF1cmFudCBuYW1lIHRvIHRoZSBicmVhZGNydW1iIG5hdmlnYXRpb24gbWVudVxyXG4gKi9cclxuZnVuY3Rpb24gZmlsbEJyZWFkY3J1bWIocmVzdGF1cmFudD1zZWxmLnJlc3RhdXJhbnQpIHtcclxuXHRjb25zdCBicmVhZGNydW1iID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JyZWFkY3J1bWInKTtcclxuXHRjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcblx0bGkuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5uYW1lO1xyXG5cdGJyZWFkY3J1bWIuYXBwZW5kQ2hpbGQobGkpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGEgcGFyYW1ldGVyIGJ5IG5hbWUgZnJvbSBwYWdlIFVSTC5cclxuICovXHJcbmZ1bmN0aW9uIGdldFBhcmFtZXRlckJ5TmFtZShuYW1lLCB1cmwpe1xyXG5cdGlmICghdXJsKVxyXG5cdFx0dXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcblx0bmFtZSA9IG5hbWUucmVwbGFjZSgvW1tcXF1dL2csICdcXFxcJCYnKTtcclxuXHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFs/Jl0ke25hbWV9KD0oW14mI10qKXwmfCN8JClgKSxcclxuXHRcdHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcblx0aWYgKCFyZXN1bHRzKVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0aWYgKCFyZXN1bHRzWzJdKVxyXG5cdFx0cmV0dXJuICcnO1xyXG5cdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XHJcbn1cclxuXHJcbi8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xyXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG5cdFx0bmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJ3N3LmpzJykudGhlbigoKSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBSZWdpc3RlcmQnKTtcclxuXHRcdH0pLmNhdGNoKChlKSA9PiB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn0iXSwiZmlsZSI6ImFsbC5qcyJ9
