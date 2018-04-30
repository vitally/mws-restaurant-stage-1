class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static get database(){if(!navigator.serviceWorker)return Promise.resolve();return(window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB).open("rreviews",1)}static fetchRestaurants(e){fetch(DBHelper.DATABASE_URL).then(e=>e.json()).then(t=>{DBHelper.storeRestaurantDataInIndexedDB(t),e(null,t)}).catch(t=>{DBHelper.getRestaurantDataFromIndexedDB().then(t=>{e(null,t)})})}static storeRestaurantDataInIndexedDB(e){const t=DBHelper.database;DBHelper.upgadeIndexedDB(t),t&&(t.onsuccess=function(n){const r=t.result.transaction("rreviews","readwrite").objectStore("rreviews");e.forEach(e=>{r.put(e)})})}static getRestaurantDataFromIndexedDB(){return new Promise((e,t)=>{const n=DBHelper.database;DBHelper.upgadeIndexedDB(n),n&&(n.onsuccess=function(t){const r=[];n.result.transaction("rreviews","readonly").objectStore("rreviews").openCursor().onsuccess=function(t){const n=t.target.result;n?(r.push(n.value),n.continue()):e(r)}})})}static upgadeIndexedDB(e){e.onupgradeneeded=function(){e.result.createObjectStore("rreviews",{keyPath:"id"}).createIndex("name","name")}}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,a)=>{if(r)n(r,null);else{let r=a;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph?e.photograph:e.id}`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let map;document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()});const observer=new IntersectionObserver(onIntersection,{rootMargin:"0px",threshold:.1});function onIntersection(e){e.forEach(e=>{e.intersectionRatio>0&&(observer.unobserve(e.target),loadImage(e.target))})}function loadImage(e){const t=e.dataset.src;fetchImage(t).then(()=>{e.src=t})}function fetchImage(e){return new Promise((t,n)=>{const r=new Image;r.src=e,r.onload=t,r.onerror=n})}function fetchNeighborhoods(){DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(this.neighborhoods=t,fillNeighborhoodsHTML())})}function fillNeighborhoodsHTML(e=this.neighborhoods){const t=document.getElementById("neighborhoods-select");t&&e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.appendChild(n)})}function fetchCuisines(){DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(this.cuisines=t,fillCuisinesHTML())})}function fillCuisinesHTML(e=this.cuisines){const t=document.getElementById("cuisines-select");t&&e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.appendChild(n)})}function updateRestaurants(){const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,r=t.selectedIndex,a=e[n].value,s=t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(a,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}function resetRestaurants(e){this.restaurants=[],document.getElementById("restaurants-list").innerHTML="",this.markers&&this.markers.forEach(e=>e.setMap(null)),this.markers=[],this.restaurants=e}function startObserver(){document.querySelectorAll(".restaurant-img").forEach(e=>{observer.observe(e)})}function fillRestaurantsHTML(e=this.restaurants){const t=document.getElementById("restaurants-list");e.forEach(e=>{t.appendChild(createRestaurantHTML(e))}),startObserver(),addMarkersToMap()}function createRestaurantHTML(e){const t=document.createElement("li");t.className="restaurant-card";const n=document.createElement("picture");n.className="restaurant-picture";const r=document.createElement("source");r.className="source-small";let a=DBHelper.imageUrlForRestaurant(e).concat("-small.jpg"),s=a.replace("small","medium");r.srcset=a+" 1x, "+s+" 2x",r.media="(min-width: 500px)",n.appendChild(r);const o=document.createElement("source");o.className="source-large";let i=a.replace("small","large");o.srcset=s+" 1x, "+i+" 2x",o.media="(min-width: 750px)",n.appendChild(o);const l=document.createElement("img");l.className="restaurant-img",l.alt='Image of "'+e.name+'" restaurant.',l.setAttribute("data-src",a),n.appendChild(l);const c=document.createElement("div");c.className="restaurant-info-container",c.appendChild(n);const d=document.createElement("h2");d.innerHTML=e.name,c.appendChild(d);const u=document.createElement("div");u.className="address-container";const m=document.createElement("p");m.setAttribute("aria-describedby","restaurant-neighborhood-label"),m.innerHTML=e.neighborhood,u.appendChild(m);const p=document.createElement("p");p.innerHTML=e.address,p.setAttribute("aria-describedby","restaurant-address-label"),u.appendChild(p),c.appendChild(u),t.appendChild(c);const h=document.createElement("a");return h.innerHTML="View Details",h.className="tap-target restaurant-card-details",h.setAttribute("aria-label","Restaurant: "+e.name+": view details."),h.setAttribute("role","button"),h.href=DBHelper.urlForRestaurant(e),t.appendChild(h),t}function addMarkersToMap(e=this.restaurants){e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,this.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),this.markers.push(t)})}let restaurant;function fetchRestaurantFromURL(e){if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):e("No restaurant id in URL",null)}function fillRestaurantHTML(e=self.restaurant){document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img";let n=DBHelper.imageUrlForRestaurant(e).concat("-small.jpg");t.setAttribute("data-src",n),t.alt='Image of "'+e.name+'" restaurant.';const r=document.getElementById("source-small");let a=n.replace("small","medium");r.srcset=n+" 1x, "+a+" 2x";const s=document.getElementById("source-large");let o=n.replace("small","large");s.srcset=a+" 1x, "+o+" 2x",document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}function fillRestaurantHoursHTML(e=self.restaurant.operating_hours){const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,a.className="table-day",r.appendChild(a);const s=document.createElement("td");s.innerHTML=e[n],s.className="table-time",r.appendChild(s),t.appendChild(r)}}function fillReviewsHTML(e=self.restaurant.reviews){const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}function createReviewHTML(e){const t=document.createElement("li"),n=document.createElement("p");n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=e.date,t.appendChild(r);const a=document.createElement("p");a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const s=document.createElement("p");return s.className="review-comments",s.innerHTML=e.comments,t.appendChild(s),t}function fillBreadcrumb(e=self.restaurant){const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}function getParameterByName(e,t){t||(t=window.location.href),e=e.replace(/[[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}window.initMap=(()=>{this.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),window.initMapDetails=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").then(()=>{console.log("Service Worker Registerd")}).catch(e=>{console.error(e)})});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyplc2xpbnQgbm8tdW51c2VkLXZhcnM6IDAqL1xyXG4vKmVzbGludCBuby11bmRlZjogMCovXHJcbi8qZXNsaW50IGxpbmVicmVhay1zdHlsZTogW1wiZXJyb3JcIiwgXCJ3aW5kb3dzXCJdKi9cclxuLyoqXHJcbiAqIENvbW1vbiBkYXRhYmFzZSBoZWxwZXIgZnVuY3Rpb25zLlxyXG4gKi9cclxuY2xhc3MgREJIZWxwZXIge1xyXG5cdC8qKlxyXG5cdCAqIERhdGFiYXNlIFVSTC5cclxuXHQgKiBDaGFuZ2UgdGhpcyB0byByZXN0YXVyYW50cy5qc29uIGZpbGUgbG9jYXRpb24gb24geW91ciBzZXJ2ZXIuXHJcblx0ICovXHJcblx0c3RhdGljIGdldCBEQVRBQkFTRV9VUkwoKSB7XHJcblx0XHRjb25zdCBwb3J0ID0gMTMzNzsgLy8gQ2hhbmdlIHRoaXMgdG8geW91ciBzZXJ2ZXIgcG9ydFxyXG5cdFx0cmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vcmVzdGF1cmFudHNgO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldCBkYXRhYmFzZSgpIHtcclxuXHRcdC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzZXJ2aWNlIHdvcmtlcixcclxuXHRcdC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaGF2aW5nIGEgZGF0YWJhc2VcclxuXHRcdGlmICghbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIpIHtcclxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG5cdFx0fVxyXG5cdFx0Y29uc3QgaW5kZXhlZERCID0gd2luZG93LmluZGV4ZWREQiB8fCB3aW5kb3cubW96SW5kZXhlZERCIHx8IHdpbmRvdy53ZWJraXRJbmRleGVkREIgfHwgd2luZG93Lm1zSW5kZXhlZERCIHx8IHdpbmRvdy5zaGltSW5kZXhlZERCO1xyXG5cdFx0cmV0dXJuIGluZGV4ZWREQi5vcGVuKCdycmV2aWV3cycsIDEpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYWxsIHJlc3RhdXJhbnRzLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRzKGNhbGxiYWNrKSB7XHJcblx0XHRmZXRjaChEQkhlbHBlci5EQVRBQkFTRV9VUkwpXHJcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0XHQvL0dvdCB0aGUgZGF0YSwgbm93IHdyaXR0aW5nIGl0IGluIHRoZSBkYXRhYmFzZS5cclxuXHRcdFx0XHREQkhlbHBlci5zdG9yZVJlc3RhdXJhbnREYXRhSW5JbmRleGVkREIoZGF0YSk7XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZGF0YSk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5jYXRjaChlcnJvciA9PiB7XHJcblx0XHRcdFx0REJIZWxwZXIuZ2V0UmVzdGF1cmFudERhdGFGcm9tSW5kZXhlZERCKCkudGhlbihkYXRhID0+IHtcclxuXHRcdFx0XHRcdGNhbGxiYWNrKG51bGwsIGRhdGEpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBzdG9yZVJlc3RhdXJhbnREYXRhSW5JbmRleGVkREIoZGF0YSkge1xyXG5cdFx0Ly9Hb3QgdGhlIGRhdGEsIG5vdyB3cml0dGluZyBpdCBpbiB0aGUgZGF0YWJhc2UuXHJcblx0XHRjb25zdCBEQk9wZW5SZXF1ZXN0ID0gREJIZWxwZXIuZGF0YWJhc2U7XHJcblx0XHREQkhlbHBlci51cGdhZGVJbmRleGVkREIoREJPcGVuUmVxdWVzdCk7XHJcblx0XHRpZiAoREJPcGVuUmVxdWVzdCkge1xyXG5cdFx0XHREQk9wZW5SZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0XHRcdGNvbnN0IGRiID0gREJPcGVuUmVxdWVzdC5yZXN1bHQ7XHJcblx0XHRcdFx0Y29uc3QgdHggPSBkYi50cmFuc2FjdGlvbigncnJldmlld3MnLCAncmVhZHdyaXRlJyk7XHJcblx0XHRcdFx0Y29uc3Qgc3RvcmUgPSB0eC5vYmplY3RTdG9yZSgncnJldmlld3MnKTtcclxuXHRcdFx0XHRkYXRhLmZvckVhY2goKHJlc3RhdXJhbnQpID0+IHtcclxuXHRcdFx0XHRcdHN0b3JlLnB1dChyZXN0YXVyYW50KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRSZXN0YXVyYW50RGF0YUZyb21JbmRleGVkREIoKSB7XHJcblx0XHQvL0l0IHNlZW1zIGxpa2Ugd2UndmUgZ290IGFuIGVycm9yIHdoaWxlIHRyeWluZyB0byByZWFkIGZyb20gdGhlIHNlcnZlclxyXG5cdFx0Ly9TbyB0cnlpbmcgdG8gZ2V0IGRhdGEgZnJvbSB0aGUgaW5kZXhlZERCIG5vd1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdFx0Y29uc3QgREJPcGVuUmVxdWVzdCA9IERCSGVscGVyLmRhdGFiYXNlO1xyXG5cdFx0XHREQkhlbHBlci51cGdhZGVJbmRleGVkREIoREJPcGVuUmVxdWVzdCk7XHJcblx0XHRcdGlmIChEQk9wZW5SZXF1ZXN0KSB7XHJcblx0XHRcdFx0REJPcGVuUmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGRiID0gREJPcGVuUmVxdWVzdC5yZXN1bHQ7XHJcblx0XHRcdFx0XHRjb25zdCBzdG9yZSA9IGRiLnRyYW5zYWN0aW9uKCdycmV2aWV3cycsICdyZWFkb25seScpLm9iamVjdFN0b3JlKCdycmV2aWV3cycpO1xyXG5cdFx0XHRcdFx0Y29uc3QgZGF0YSA9IFtdO1xyXG5cdFx0XHRcdFx0c3RvcmUub3BlbkN1cnNvcigpLm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJzb3IgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG5cdFx0XHRcdFx0XHRpZihjdXJzb3IpIHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goY3Vyc29yLnZhbHVlKTtcclxuXHRcdFx0XHRcdFx0XHRjdXJzb3IuY29udGludWUoKTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShkYXRhKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyB1cGdhZGVJbmRleGVkREIoREJPcGVuUmVxdWVzdCkge1xyXG5cdFx0REJPcGVuUmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IGRiID0gREJPcGVuUmVxdWVzdC5yZXN1bHQ7XHJcblx0XHRcdGNvbnN0IHN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoJ3JyZXZpZXdzJywge1xyXG5cdFx0XHRcdGtleVBhdGg6ICdpZCdcclxuXHRcdFx0fSk7XHJcblx0XHRcdHN0b3JlLmNyZWF0ZUluZGV4KCduYW1lJywgJ25hbWUnKTtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUlkKGlkLCBjYWxsYmFjaykge1xyXG5cdFx0Ly8gZmV0Y2ggYWxsIHJlc3RhdXJhbnRzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG5cdFx0REJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zdCByZXN0YXVyYW50ID0gcmVzdGF1cmFudHMuZmluZChyID0+IHIuaWQgPT0gaWQpO1xyXG5cdFx0XHRcdGlmIChyZXN0YXVyYW50KSB7IC8vIEdvdCB0aGUgcmVzdGF1cmFudFxyXG5cdFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudCk7XHJcblx0XHRcdFx0fSBlbHNlIHsgLy8gUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZGF0YWJhc2VcclxuXHRcdFx0XHRcdGNhbGxiYWNrKCdSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0JywgbnVsbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSB0eXBlIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmUoY3Vpc2luZSwgY2FsbGJhY2spIHtcclxuXHRcdC8vIEZldGNoIGFsbCByZXN0YXVyYW50cyAgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBjdWlzaW5lIHR5cGVcclxuXHRcdFx0XHRjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcblx0ICovXHJcblx0c3RhdGljIGZldGNoUmVzdGF1cmFudEJ5TmVpZ2hib3Job29kKG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcclxuXHRcdC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG5cdFx0REJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikge1xyXG5cdFx0XHRcdGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIG5laWdoYm9yaG9vZFxyXG5cdFx0XHRcdGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xyXG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSBhbmQgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcblx0ICovXHJcblx0c3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZUFuZE5laWdoYm9yaG9vZChjdWlzaW5lLCBuZWlnaGJvcmhvb2QsIGNhbGxiYWNrKSB7XHJcblx0XHQvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGV0IHJlc3VsdHMgPSByZXN0YXVyYW50cztcclxuXHRcdFx0XHRpZiAoY3Vpc2luZSAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgY3Vpc2luZVxyXG5cdFx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChuZWlnaGJvcmhvb2QgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IG5laWdoYm9yaG9vZFxyXG5cdFx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYWxsIG5laWdoYm9yaG9vZHMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcblx0ICovXHJcblx0c3RhdGljIGZldGNoTmVpZ2hib3Job29kcyhjYWxsYmFjaykge1xyXG5cdFx0Ly8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcblx0XHREQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSB7XHJcblx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIEdldCBhbGwgbmVpZ2hib3Job29kcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG5cdFx0XHRcdGNvbnN0IG5laWdoYm9yaG9vZHMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLm5laWdoYm9yaG9vZCk7XHJcblx0XHRcdFx0Ly8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBuZWlnaGJvcmhvb2RzXHJcblx0XHRcdFx0Y29uc3QgdW5pcXVlTmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHMuZmlsdGVyKCh2LCBpKSA9PiBuZWlnaGJvcmhvb2RzLmluZGV4T2YodikgPT0gaSk7XHJcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgdW5pcXVlTmVpZ2hib3Job29kcyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYWxsIGN1aXNpbmVzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XHJcblx0XHQvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG5cdFx0XHRcdGNvbnN0IGN1aXNpbmVzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5jdWlzaW5lX3R5cGUpO1xyXG5cdFx0XHRcdC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gY3Vpc2luZXNcclxuXHRcdFx0XHRjb25zdCB1bmlxdWVDdWlzaW5lcyA9IGN1aXNpbmVzLmZpbHRlcigodiwgaSkgPT4gY3Vpc2luZXMuaW5kZXhPZih2KSA9PSBpKTtcclxuXHRcdFx0XHRjYWxsYmFjayhudWxsLCB1bmlxdWVDdWlzaW5lcyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzdGF1cmFudCBwYWdlIFVSTC5cclxuXHQgKi9cclxuXHRzdGF0aWMgdXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XHJcblx0XHRyZXR1cm4gKGAuL3Jlc3RhdXJhbnQuaHRtbD9pZD0ke3Jlc3RhdXJhbnQuaWR9YCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXN0YXVyYW50IGltYWdlIFVSTC5cclxuXHQgKi9cclxuXHRzdGF0aWMgaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpIHtcclxuXHRcdHJldHVybiAoYC9pbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGggPyByZXN0YXVyYW50LnBob3RvZ3JhcGggOiByZXN0YXVyYW50LmlkfWApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWFwIG1hcmtlciBmb3IgYSByZXN0YXVyYW50LlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xyXG5cdFx0Y29uc3QgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdHBvc2l0aW9uOiByZXN0YXVyYW50LmxhdGxuZyxcclxuXHRcdFx0dGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcclxuXHRcdFx0dXJsOiBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLFxyXG5cdFx0XHRtYXA6IG1hcCxcclxuXHRcdFx0YW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUFxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbWFya2VyO1xyXG5cdH1cclxuXHJcbn1cclxuLyplc2xpbnQgbm8tY29uc29sZTogMCovXHJcbi8qZXNsaW50IG5vLXVudXNlZC12YXJzOiAwKi9cclxuLyplc2xpbnQgbm8tdW5kZWY6IDAqL1xyXG4vKipcclxuICogRmV0Y2ggbmVpZ2hib3Job29kcyBhbmQgY3Vpc2luZXMgYXMgc29vbiBhcyB0aGUgcGFnZSBpcyBsb2FkZWQuXHJcbiAqL1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50KSA9PiB7XHJcblx0ZmV0Y2hOZWlnaGJvcmhvb2RzKCk7XHJcblx0ZmV0Y2hDdWlzaW5lcygpO1xyXG59KTtcclxuXHJcbmxldCBtYXA7XHJcblxyXG5jb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihvbkludGVyc2VjdGlvbiwge1xyXG5cdHJvb3RNYXJnaW46ICcwcHgnLFxyXG5cdHRocmVzaG9sZDogMC4xXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gb25JbnRlcnNlY3Rpb24oZW50cmllcykge1xyXG5cdC8vIExvb3AgdGhyb3VnaCB0aGUgZW50cmllc1xyXG5cdGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XHJcblx0XHQvLyBBcmUgd2UgaW4gdmlld3BvcnQ/XHJcblx0XHRpZiAoZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gPiAwKSB7XHJcblxyXG5cdFx0XHQvLyBTdG9wIHdhdGNoaW5nIGFuZCBsb2FkIHRoZSBpbWFnZVxyXG5cdFx0XHRvYnNlcnZlci51bm9ic2VydmUoZW50cnkudGFyZ2V0KTtcclxuXHRcdFx0bG9hZEltYWdlKGVudHJ5LnRhcmdldCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRJbWFnZShpbWFnZSkge1xyXG5cdGNvbnN0IHNyYyA9IGltYWdlLmRhdGFzZXQuc3JjO1xyXG5cdGZldGNoSW1hZ2Uoc3JjKS50aGVuKCgpID0+IHtcclxuXHRcdGltYWdlLnNyYyA9IHNyYztcclxuXHR9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmV0Y2hJbWFnZSh1cmwpIHtcclxuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0Y29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdGltYWdlLnNyYyA9IHVybDtcclxuXHRcdGltYWdlLm9ubG9hZCA9IHJlc29sdmU7XHJcblx0XHRpbWFnZS5vbmVycm9yID0gcmVqZWN0O1xyXG5cdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyBhbmQgc2V0IHRoZWlyIEhUTUwuXHJcbiAqL1xyXG5mdW5jdGlvbiBmZXRjaE5laWdoYm9yaG9vZHMoKSB7XHJcblx0REJIZWxwZXIuZmV0Y2hOZWlnaGJvcmhvb2RzKChlcnJvciwgbmVpZ2hib3Job29kcykgPT4ge1xyXG5cdFx0aWYgKGVycm9yKSB7IC8vIEdvdCBhbiBlcnJvclxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMubmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHM7XHJcblx0XHRcdGZpbGxOZWlnaGJvcmhvb2RzSFRNTCgpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IG5laWdoYm9yaG9vZHMgSFRNTC5cclxuICovXHJcbmZ1bmN0aW9uIGZpbGxOZWlnaGJvcmhvb2RzSFRNTChuZWlnaGJvcmhvb2RzID0gdGhpcy5uZWlnaGJvcmhvb2RzKSB7XHJcblx0Y29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25laWdoYm9yaG9vZHMtc2VsZWN0Jyk7XHJcblx0aWYgKHNlbGVjdCkge1xyXG5cdFx0bmVpZ2hib3Job29kcy5mb3JFYWNoKG5laWdoYm9yaG9vZCA9PiB7XHJcblx0XHRcdGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRvcHRpb24uaW5uZXJIVE1MID0gbmVpZ2hib3Job29kO1xyXG5cdFx0XHRvcHRpb24udmFsdWUgPSBuZWlnaGJvcmhvb2Q7XHJcblx0XHRcdHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogRmV0Y2ggYWxsIGN1aXNpbmVzIGFuZCBzZXQgdGhlaXIgSFRNTC5cclxuICovXHJcbmZ1bmN0aW9uIGZldGNoQ3Vpc2luZXMoKSB7XHJcblx0REJIZWxwZXIuZmV0Y2hDdWlzaW5lcygoZXJyb3IsIGN1aXNpbmVzKSA9PiB7XHJcblx0XHRpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuY3Vpc2luZXMgPSBjdWlzaW5lcztcclxuXHRcdFx0ZmlsbEN1aXNpbmVzSFRNTCgpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IGN1aXNpbmVzIEhUTUwuXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxsQ3Vpc2luZXNIVE1MKGN1aXNpbmVzID0gdGhpcy5jdWlzaW5lcykge1xyXG5cdGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdWlzaW5lcy1zZWxlY3QnKTtcclxuXHRpZiAoc2VsZWN0KSB7XHJcblx0XHRjdWlzaW5lcy5mb3JFYWNoKGN1aXNpbmUgPT4ge1xyXG5cdFx0XHRjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0b3B0aW9uLmlubmVySFRNTCA9IGN1aXNpbmU7XHJcblx0XHRcdG9wdGlvbi52YWx1ZSA9IGN1aXNpbmU7XHJcblx0XHRcdHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBHb29nbGUgbWFwLCBjYWxsZWQgZnJvbSBIVE1MLlxyXG4gKi9cclxud2luZG93LmluaXRNYXAgPSAoKSA9PiB7XHJcblx0bGV0IGxvYyA9IHtcclxuXHRcdGxhdDogNDAuNzIyMjE2LFxyXG5cdFx0bG5nOiAtNzMuOTg3NTAxXHJcblx0fTtcclxuXHR0aGlzLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCB7XHJcblx0XHR6b29tOiAxMixcclxuXHRcdGNlbnRlcjogbG9jLFxyXG5cdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXHJcblx0fSk7XHJcblx0dXBkYXRlUmVzdGF1cmFudHMoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgcGFnZSBhbmQgbWFwIGZvciBjdXJyZW50IHJlc3RhdXJhbnRzLlxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlUmVzdGF1cmFudHMoKSB7XHJcblx0Y29uc3QgY1NlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdWlzaW5lcy1zZWxlY3QnKTtcclxuXHRjb25zdCBuU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25laWdoYm9yaG9vZHMtc2VsZWN0Jyk7XHJcblxyXG5cdGNvbnN0IGNJbmRleCA9IGNTZWxlY3Quc2VsZWN0ZWRJbmRleDtcclxuXHRjb25zdCBuSW5kZXggPSBuU2VsZWN0LnNlbGVjdGVkSW5kZXg7XHJcblxyXG5cdGNvbnN0IGN1aXNpbmUgPSBjU2VsZWN0W2NJbmRleF0udmFsdWU7XHJcblx0Y29uc3QgbmVpZ2hib3Job29kID0gblNlbGVjdFtuSW5kZXhdLnZhbHVlO1xyXG5cclxuXHREQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QoY3Vpc2luZSwgbmVpZ2hib3Job29kLCAoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcblx0XHRpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJlc2V0UmVzdGF1cmFudHMocmVzdGF1cmFudHMpO1xyXG5cdFx0XHRmaWxsUmVzdGF1cmFudHNIVE1MKCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBjdXJyZW50IHJlc3RhdXJhbnRzLCB0aGVpciBIVE1MIGFuZCByZW1vdmUgdGhlaXIgbWFwIG1hcmtlcnMuXHJcbiAqL1xyXG5mdW5jdGlvbiByZXNldFJlc3RhdXJhbnRzKHJlc3RhdXJhbnRzKSB7XHJcblx0Ly8gUmVtb3ZlIGFsbCByZXN0YXVyYW50c1xyXG5cdHRoaXMucmVzdGF1cmFudHMgPSBbXTtcclxuXHRjb25zdCB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50cy1saXN0Jyk7XHJcblx0dWwuaW5uZXJIVE1MID0gJyc7XHJcblxyXG5cdC8vIFJlbW92ZSBhbGwgbWFwIG1hcmtlcnNcclxuXHRpZiAodGhpcy5tYXJrZXJzKSB7XHJcblx0XHR0aGlzLm1hcmtlcnMuZm9yRWFjaChtID0+IG0uc2V0TWFwKG51bGwpKTtcclxuXHR9XHJcblx0dGhpcy5tYXJrZXJzID0gW107XHJcblx0dGhpcy5yZXN0YXVyYW50cyA9IHJlc3RhdXJhbnRzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydE9ic2VydmVyKCkge1xyXG5cdGNvbnN0IGltYWdlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yZXN0YXVyYW50LWltZycpO1xyXG5cdGltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcclxuXHRcdG9ic2VydmVyLm9ic2VydmUoaW1hZ2UpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGFsbCByZXN0YXVyYW50cyBIVE1MIGFuZCBhZGQgdGhlbSB0byB0aGUgd2VicGFnZS5cclxuICovXHJcbmZ1bmN0aW9uIGZpbGxSZXN0YXVyYW50c0hUTUwocmVzdGF1cmFudHMgPSB0aGlzLnJlc3RhdXJhbnRzKSB7XHJcblx0Y29uc3QgdWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudHMtbGlzdCcpO1xyXG5cdHJlc3RhdXJhbnRzLmZvckVhY2gocmVzdGF1cmFudCA9PiB7XHJcblx0XHR1bC5hcHBlbmRDaGlsZChjcmVhdGVSZXN0YXVyYW50SFRNTChyZXN0YXVyYW50KSk7XHJcblx0fSk7XHJcblx0c3RhcnRPYnNlcnZlcigpO1xyXG5cdGFkZE1hcmtlcnNUb01hcCgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHJlc3RhdXJhbnQgSFRNTC5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVJlc3RhdXJhbnRIVE1MKHJlc3RhdXJhbnQpIHtcclxuXHRjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcblx0bGkuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtY2FyZCc7XHJcblxyXG5cdGNvbnN0IHBpY3R1cmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwaWN0dXJlJyk7IC8vSGVyZSBnb2VzIHRoZSBuZXcgcGljdHVyZSB0YWcsIHRoYXQgd2lsbCBpbmNsdWRlIHRoZSA8aW1nPlxyXG5cdHBpY3R1cmUuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtcGljdHVyZSc7IC8vdGhhdCBpcyBob3cgd2Ugd2lsbCBzZXJ2ZSBkaWZlcmVudCBzaXplcyBvZiBpbWFnZXNcclxuXHJcblx0Ly9uZXh0IGJsb2NrIHByZXBhcmVzIHNvdXJjZSB0YWcgZm9yIHNtYWxsIGltYWdlc1xyXG5cdGNvbnN0IHNyY1NtYWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XHJcblx0c3JjU21hbGwuY2xhc3NOYW1lID0gJ3NvdXJjZS1zbWFsbCc7XHJcblx0bGV0IHBpY1VybFNtYWxsID0gREJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLmNvbmNhdCgnLXNtYWxsLmpwZycpO1xyXG5cdGxldCBwaWNVcmxNZWRpdW0gPSBwaWNVcmxTbWFsbC5yZXBsYWNlKCdzbWFsbCcsICdtZWRpdW0nKTtcclxuXHRzcmNTbWFsbC5zcmNzZXQgPSBwaWNVcmxTbWFsbCArICcgMXgsICcgKyBwaWNVcmxNZWRpdW0gKyAnIDJ4JztcclxuXHRzcmNTbWFsbC5tZWRpYSA9ICcobWluLXdpZHRoOiA1MDBweCknO1xyXG5cdHBpY3R1cmUuYXBwZW5kQ2hpbGQoc3JjU21hbGwpO1xyXG5cclxuXHQvL25leHQgYmxvY2sgcHJlcGFyZXMgc291cmNlIHRhZyBmb3IgbGFyZ2UgaW1hZ2VzXHJcblx0Y29uc3Qgc3JjTGFyZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcclxuXHRzcmNMYXJnZS5jbGFzc05hbWUgPSAnc291cmNlLWxhcmdlJztcclxuXHRsZXQgcGljVXJsTGFyZ2UgPSBwaWNVcmxTbWFsbC5yZXBsYWNlKCdzbWFsbCcsICdsYXJnZScpO1xyXG5cdHNyY0xhcmdlLnNyY3NldCA9IHBpY1VybE1lZGl1bSArICcgMXgsICcgKyBwaWNVcmxMYXJnZSArICcgMngnO1xyXG5cdHNyY0xhcmdlLm1lZGlhID0gJyhtaW4td2lkdGg6IDc1MHB4KSc7XHJcblx0cGljdHVyZS5hcHBlbmRDaGlsZChzcmNMYXJnZSk7XHJcblxyXG5cdC8vY3JlYXRpbmcgaW1nIHRhZywgYW5kIGFkZGluZyBhbHRcclxuXHRjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdGltYWdlLmNsYXNzTmFtZSA9ICdyZXN0YXVyYW50LWltZyc7XHJcblx0aW1hZ2UuYWx0ID0gJ0ltYWdlIG9mIFwiJyArIHJlc3RhdXJhbnQubmFtZSArICdcIiByZXN0YXVyYW50Lic7XHJcblx0Ly9pbWFnZS5zcmMgPSBwaWNVcmxTbWFsbDtcclxuXHRpbWFnZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJywgcGljVXJsU21hbGwpO1xyXG5cdHBpY3R1cmUuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xyXG5cclxuXHRjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0aW5mb0NvbnRhaW5lci5jbGFzc05hbWUgPSAncmVzdGF1cmFudC1pbmZvLWNvbnRhaW5lcic7XHJcblx0aW5mb0NvbnRhaW5lci5hcHBlbmRDaGlsZChwaWN0dXJlKTtcclxuXHJcblx0Y29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XHJcblx0bmFtZS5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5hbWU7XHJcblx0aW5mb0NvbnRhaW5lci5hcHBlbmRDaGlsZChuYW1lKTtcclxuXHJcblx0Y29uc3QgYWRkcmVzc0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdGFkZHJlc3NDb250YWluZXIuY2xhc3NOYW1lID0gJ2FkZHJlc3MtY29udGFpbmVyJztcclxuXHJcblx0Y29uc3QgbmVpZ2hib3Job29kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG5cdG5laWdoYm9yaG9vZC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCAncmVzdGF1cmFudC1uZWlnaGJvcmhvb2QtbGFiZWwnKTtcclxuXHRuZWlnaGJvcmhvb2QuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5uZWlnaGJvcmhvb2Q7XHJcblx0YWRkcmVzc0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZWlnaGJvcmhvb2QpO1xyXG5cclxuXHRjb25zdCBhZGRyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG5cdGFkZHJlc3MuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5hZGRyZXNzO1xyXG5cdGFkZHJlc3Muc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgJ3Jlc3RhdXJhbnQtYWRkcmVzcy1sYWJlbCcpO1xyXG5cdGFkZHJlc3NDb250YWluZXIuYXBwZW5kQ2hpbGQoYWRkcmVzcyk7XHJcblxyXG5cdGluZm9Db250YWluZXIuYXBwZW5kQ2hpbGQoYWRkcmVzc0NvbnRhaW5lcik7XHJcblxyXG5cdGxpLmFwcGVuZENoaWxkKGluZm9Db250YWluZXIpO1xyXG5cclxuXHRjb25zdCBtb3JlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG5cdG1vcmUuaW5uZXJIVE1MID0gJ1ZpZXcgRGV0YWlscyc7XHJcblx0bW9yZS5jbGFzc05hbWUgPSAndGFwLXRhcmdldCByZXN0YXVyYW50LWNhcmQtZGV0YWlscyc7XHJcblx0bW9yZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnUmVzdGF1cmFudDogJyArIHJlc3RhdXJhbnQubmFtZSArICc6IHZpZXcgZGV0YWlscy4nKTtcclxuXHRtb3JlLnNldEF0dHJpYnV0ZSgncm9sZScsICdidXR0b24nKTtcclxuXHRtb3JlLmhyZWYgPSBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpO1xyXG5cdGxpLmFwcGVuZENoaWxkKG1vcmUpO1xyXG5cclxuXHRyZXR1cm4gbGk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgbWFya2VycyBmb3IgY3VycmVudCByZXN0YXVyYW50cyB0byB0aGUgbWFwLlxyXG4gKi9cclxuZnVuY3Rpb24gYWRkTWFya2Vyc1RvTWFwKHJlc3RhdXJhbnRzID0gdGhpcy5yZXN0YXVyYW50cykge1xyXG5cdHJlc3RhdXJhbnRzLmZvckVhY2gocmVzdGF1cmFudCA9PiB7XHJcblx0XHQvLyBBZGQgbWFya2VyIHRvIHRoZSBtYXBcclxuXHRcdGNvbnN0IG1hcmtlciA9IERCSGVscGVyLm1hcE1hcmtlckZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgdGhpcy5tYXApO1xyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbWFya2VyLnVybDtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5tYXJrZXJzLnB1c2gobWFya2VyKTtcclxuXHR9KTtcclxufVxyXG4vKmVzbGludCBuby1jb25zb2xlOiAwKi9cclxuLyplc2xpbnQgbm8tdW51c2VkLXZhcnM6IDAqL1xyXG4vKmVzbGludCBuby11bmRlZjogMCovXHJcblxyXG5sZXQgcmVzdGF1cmFudDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIEdvb2dsZSBtYXAsIGNhbGxlZCBmcm9tIEhUTUwuXHJcbiAqL1xyXG53aW5kb3cuaW5pdE1hcERldGFpbHMgPSAoKSA9PiB7XHJcblx0ZmV0Y2hSZXN0YXVyYW50RnJvbVVSTCgoZXJyb3IsIHJlc3RhdXJhbnQpID0+IHtcclxuXHRcdGlmIChlcnJvcikgeyAvLyBHb3QgYW4gZXJyb3IhXHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2VsZi5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwge1xyXG5cdFx0XHRcdHpvb206IDE2LFxyXG5cdFx0XHRcdGNlbnRlcjogcmVzdGF1cmFudC5sYXRsbmcsXHJcblx0XHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRmaWxsQnJlYWRjcnVtYigpO1xyXG5cdFx0XHREQkhlbHBlci5tYXBNYXJrZXJGb3JSZXN0YXVyYW50KHNlbGYucmVzdGF1cmFudCwgc2VsZi5tYXApO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCBjdXJyZW50IHJlc3RhdXJhbnQgZnJvbSBwYWdlIFVSTC5cclxuICovXHJcbmZ1bmN0aW9uIGZldGNoUmVzdGF1cmFudEZyb21VUkwoY2FsbGJhY2spe1xyXG5cdGlmIChzZWxmLnJlc3RhdXJhbnQpIHsgLy8gcmVzdGF1cmFudCBhbHJlYWR5IGZldGNoZWQhXHJcblx0XHRjYWxsYmFjayhudWxsLCBzZWxmLnJlc3RhdXJhbnQpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRjb25zdCBpZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnaWQnKTtcclxuXHRpZiAoIWlkKSB7IC8vIG5vIGlkIGZvdW5kIGluIFVSTFxyXG5cdFx0Y2FsbGJhY2soJ05vIHJlc3RhdXJhbnQgaWQgaW4gVVJMJywgbnVsbCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdERCSGVscGVyLmZldGNoUmVzdGF1cmFudEJ5SWQoaWQsIChlcnJvciwgcmVzdGF1cmFudCkgPT4ge1xyXG5cdFx0XHRzZWxmLnJlc3RhdXJhbnQgPSByZXN0YXVyYW50O1xyXG5cdFx0XHRpZiAoIXJlc3RhdXJhbnQpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0ZmlsbFJlc3RhdXJhbnRIVE1MKCk7XHJcblx0XHRcdGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHJlc3RhdXJhbnQgSFRNTCBhbmQgYWRkIGl0IHRvIHRoZSB3ZWJwYWdlXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxsUmVzdGF1cmFudEhUTUwocmVzdGF1cmFudCA9IHNlbGYucmVzdGF1cmFudCl7XHJcbiAgXHJcblx0Y29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LW5hbWUnKTtcclxuXHRuYW1lLmlubmVySFRNTCA9IHJlc3RhdXJhbnQubmFtZTtcclxuICBcclxuXHRjb25zdCBhZGRyZXNzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnQtYWRkcmVzcycpO1xyXG5cdGFkZHJlc3MuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5hZGRyZXNzO1xyXG4gIFxyXG5cdGNvbnN0IGltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnQtaW1nJyk7XHJcblx0aW1hZ2UuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtaW1nJztcclxuXHRsZXQgcGljVXJsU21hbGwgPSBEQkhlbHBlci5pbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkuY29uY2F0KCctc21hbGwuanBnJyk7XHJcblx0Ly9pbWFnZS5zcmMgPSBwaWNVcmxTbWFsbDtcclxuXHRpbWFnZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJywgcGljVXJsU21hbGwpO1xyXG5cdGltYWdlLmFsdCA9ICdJbWFnZSBvZiBcIicgKyByZXN0YXVyYW50Lm5hbWUgKyAnXCIgcmVzdGF1cmFudC4nO1xyXG4gIFxyXG5cdGNvbnN0IHNyY1NtYWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvdXJjZS1zbWFsbCcpO1xyXG5cdGxldCBwaWNVcmxNZWRpdW0gPSBwaWNVcmxTbWFsbC5yZXBsYWNlKCdzbWFsbCcsJ21lZGl1bScpO1xyXG5cdHNyY1NtYWxsLnNyY3NldCA9IHBpY1VybFNtYWxsICsgJyAxeCwgJyArIHBpY1VybE1lZGl1bSArICcgMngnO1xyXG4gIFxyXG5cdGNvbnN0IHNyY0xhcmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvdXJjZS1sYXJnZScpO1xyXG5cdGxldCBwaWNVcmxMYXJnZSA9IHBpY1VybFNtYWxsLnJlcGxhY2UoJ3NtYWxsJywnbGFyZ2UnKTtcclxuXHRzcmNMYXJnZS5zcmNzZXQgPSBwaWNVcmxNZWRpdW0gKyAnIDF4LCAnICsgcGljVXJsTGFyZ2UgKyAnIDJ4JztcclxuXHJcblx0Ly9jb25zdCBwaWN0dXJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnQtcGljdHVyZScpO1xyXG5cclxuXHRjb25zdCBjdWlzaW5lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnQtY3Vpc2luZScpO1xyXG5cdGN1aXNpbmUuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5jdWlzaW5lX3R5cGU7XHJcblxyXG5cdC8vIGZpbGwgb3BlcmF0aW5nIGhvdXJzXHJcblx0aWYgKHJlc3RhdXJhbnQub3BlcmF0aW5nX2hvdXJzKSB7XHJcblx0XHRmaWxsUmVzdGF1cmFudEhvdXJzSFRNTCgpO1xyXG5cdH1cclxuXHQvLyBmaWxsIHJldmlld3NcclxuXHRmaWxsUmV2aWV3c0hUTUwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSByZXN0YXVyYW50IG9wZXJhdGluZyBob3VycyBIVE1MIHRhYmxlIGFuZCBhZGQgaXQgdG8gdGhlIHdlYnBhZ2UuXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxsUmVzdGF1cmFudEhvdXJzSFRNTCAob3BlcmF0aW5nSG91cnMgPSBzZWxmLnJlc3RhdXJhbnQub3BlcmF0aW5nX2hvdXJzKXtcclxuXHRjb25zdCBob3VycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LWhvdXJzJyk7XHJcblx0Zm9yIChsZXQga2V5IGluIG9wZXJhdGluZ0hvdXJzKSB7XHJcblx0XHRjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG5cclxuXHRcdGNvbnN0IGRheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblx0XHRkYXkuaW5uZXJIVE1MID0ga2V5O1xyXG5cdFx0ZGF5LmNsYXNzTmFtZSA9ICd0YWJsZS1kYXknO1xyXG5cdFx0cm93LmFwcGVuZENoaWxkKGRheSk7XHJcblxyXG5cdFx0Y29uc3QgdGltZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblx0XHR0aW1lLmlubmVySFRNTCA9IG9wZXJhdGluZ0hvdXJzW2tleV07XHJcblx0XHR0aW1lLmNsYXNzTmFtZSA9ICd0YWJsZS10aW1lJztcclxuXHRcdHJvdy5hcHBlbmRDaGlsZCh0aW1lKTtcclxuXHJcblx0XHRob3Vycy5hcHBlbmRDaGlsZChyb3cpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhbGwgcmV2aWV3cyBIVE1MIGFuZCBhZGQgdGhlbSB0byB0aGUgd2VicGFnZS5cclxuICovXHJcbmZ1bmN0aW9uIGZpbGxSZXZpZXdzSFRNTChyZXZpZXdzID0gc2VsZi5yZXN0YXVyYW50LnJldmlld3MpIHtcclxuXHRjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmV2aWV3cy1jb250YWluZXInKTtcclxuXHRjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XHJcblx0dGl0bGUuaW5uZXJIVE1MID0gJ1Jldmlld3MnO1xyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXRsZSk7XHJcblxyXG5cdGlmICghcmV2aWV3cykge1xyXG5cdFx0Y29uc3Qgbm9SZXZpZXdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG5cdFx0bm9SZXZpZXdzLmlubmVySFRNTCA9ICdObyByZXZpZXdzIHlldCEnO1xyXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKG5vUmV2aWV3cyk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdGNvbnN0IHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jldmlld3MtbGlzdCcpO1xyXG5cdHJldmlld3MuZm9yRWFjaChyZXZpZXcgPT4ge1xyXG5cdFx0dWwuYXBwZW5kQ2hpbGQoY3JlYXRlUmV2aWV3SFRNTChyZXZpZXcpKTtcclxuXHR9KTtcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodWwpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHJldmlldyBIVE1MIGFuZCBhZGQgaXQgdG8gdGhlIHdlYnBhZ2UuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVSZXZpZXdIVE1MKHJldmlldyl7XHJcblx0Y29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG5cdGNvbnN0IG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcblx0bmFtZS5pbm5lckhUTUwgPSByZXZpZXcubmFtZTtcclxuXHRsaS5hcHBlbmRDaGlsZChuYW1lKTtcclxuXHJcblx0Y29uc3QgZGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuXHRkYXRlLmlubmVySFRNTCA9IHJldmlldy5kYXRlO1xyXG5cdGxpLmFwcGVuZENoaWxkKGRhdGUpO1xyXG5cclxuXHRjb25zdCByYXRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcblx0cmF0aW5nLmlubmVySFRNTCA9IGBSYXRpbmc6ICR7cmV2aWV3LnJhdGluZ31gO1xyXG5cdGxpLmFwcGVuZENoaWxkKHJhdGluZyk7XHJcblxyXG5cdGNvbnN0IGNvbW1lbnRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG5cdGNvbW1lbnRzLmNsYXNzTmFtZSA9ICdyZXZpZXctY29tbWVudHMnO1xyXG5cdGNvbW1lbnRzLmlubmVySFRNTCA9IHJldmlldy5jb21tZW50cztcclxuXHRsaS5hcHBlbmRDaGlsZChjb21tZW50cyk7XHJcblxyXG5cdHJldHVybiBsaTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCByZXN0YXVyYW50IG5hbWUgdG8gdGhlIGJyZWFkY3J1bWIgbmF2aWdhdGlvbiBtZW51XHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxsQnJlYWRjcnVtYihyZXN0YXVyYW50PXNlbGYucmVzdGF1cmFudCkge1xyXG5cdGNvbnN0IGJyZWFkY3J1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnJlYWRjcnVtYicpO1xyXG5cdGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuXHRsaS5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5hbWU7XHJcblx0YnJlYWRjcnVtYi5hcHBlbmRDaGlsZChsaSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgYSBwYXJhbWV0ZXIgYnkgbmFtZSBmcm9tIHBhZ2UgVVJMLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0UGFyYW1ldGVyQnlOYW1lKG5hbWUsIHVybCl7XHJcblx0aWYgKCF1cmwpXHJcblx0XHR1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuXHRuYW1lID0gbmFtZS5yZXBsYWNlKC9bW1xcXV0vZywgJ1xcXFwkJicpO1xyXG5cdGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWz8mXSR7bmFtZX0oPShbXiYjXSopfCZ8I3wkKWApLFxyXG5cdFx0cmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuXHRpZiAoIXJlc3VsdHMpXHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHRpZiAoIXJlc3VsdHNbMl0pXHJcblx0XHRyZXR1cm4gJyc7XHJcblx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcclxufVxyXG5cclxuLyplc2xpbnQgbm8tY29uc29sZTogMCovXHJcbmlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcblx0XHRuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3Rlcignc3cuanMnKS50aGVuKCgpID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIFJlZ2lzdGVyZCcpO1xyXG5cdFx0fSkuY2F0Y2goKGUpID0+IHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHR9KTtcclxufSJdLCJmaWxlIjoiYWxsLmpzIn0=
