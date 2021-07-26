
//https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
async function geoFindMe() {
    return new Promise((position, error) => {
        // function success(position) {
        //     const latitude = position.coords.latitude;
        //     const longitude = position.coords.longitude;

        //     statusElement.textContent = `Success, Latitude: ${latitude}, Longitude: ${longitude}`
            
        // }

        // function error() {
        //         statusElement.textContent = 'Unable to retrieve your location';
        //     }

        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(position, error)
        }
    })


}
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
// function initMap(lat, long) {
//     // Create the map.

//     const coordinates = { lat: lat, lng: long};
//     const map = new google.maps.Map(document.getElementById("map"), {
//         center: coordinates,
//         zoom: 17,
//         mapId: "8d193001f940fde3",
//     });
//     // Create the places service.
//     const service = new google.maps.places.PlacesService(map);
//     let getNextPage;
//     const moreButton = document.getElementById("more");

//     moreButton.onclick = function () {
//         moreButton.disabled = true;

//         if (getNextPage) {
//             getNextPage();
//         }
//     };
//     // Perform a nearby search.
//     service.nearbySearch(
//         { location: coordinates, radius: 800, type: "restaurant" },
//         (results, status, pagination) => {
//             if (status !== "OK" || !results) return;
//             addPlaces(results, map);
//             moreButton.disabled = !pagination || !pagination.hasNextPage;

//             if (pagination && pagination.hasNextPage) {
//                 getNextPage = () => {
//                     // Note: nextPage will call the same handler function as the initial call
//                     pagination.nextPage();
//                 };
//             }
//         }
//     );
// }

// function addPlaces(places, map) {
//     const placesList = document.getElementById("places");

//     for (const place of places) {
//         if (place.geometry && place.geometry.location) {
//             const image = {
//                 url: place.icon,
//                 size: new google.maps.Size(71, 71),
//                 origin: new google.maps.Point(0, 0),
//                 anchor: new google.maps.Point(17, 34),
//                 scaledSize: new google.maps.Size(25, 25),
//             };
//             new google.maps.Marker({
//                 map,
//                 icon: image,
//                 title: place.name,
//                 position: place.geometry.location,
//             });
//             const li = document.createElement("li");
//             li.textContent = place.name;
//             placesList.appendChild(li);
//             li.addEventListener("click", () => {
//                 map.setCenter(place.geometry.location);
//             });
//         }
//     }
// }
// document.querySelector('#find-me').addEventListener('click', geoFindMe);

// Simple location search function
function getOnePlace(lat, long){

    const coordinates = { lat: lat, lng: long };

    var request = {
        query: 'restaurant',
        openNow: "True",
        rankBy: "google.maps.places.RankBy.DISTANCE",
        fields: ['name', 'geometry', 'opening_hours', 'price_level', 'place_id', 'open_now' ]
    };

    map = new google.maps.Map(
        document.getElementById('map'), { center: coordinates, zoom: 25 });

    var service = new google.maps.places.PlacesService(map);

    service.nearbySearch({ location: coordinates, radius: 1000, type: "restaurant" }, (results, status, opening_hours, pagination) =>{
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // for (let i = 0; i < results.length; i++) {
            //     console.log(results[i].opening_hours.open_now)
            //     console.log(i)
            // }
                var i = getRandomArbitrary(0, results.length)
                console.log(i, results.length)
                place = results[i]
                console.log(i, place, results)
                // Get place Details
                var detailsRequest = {
                    placeId: place.place_id,
                    fields: ['name', 'rating', 'website', 'reviews']
                }
                service = new google.maps.places.PlacesService(map);
                service.getDetails(detailsRequest, callback);
            // 
                function callback(detailedPlace, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        console.log(detailedPlace)
                        document.getElementById('restaurant-idea').innerHTML = `Go to <a href='${detailedPlace.website}'><i>${detailedPlace.name}</i></a>`
                        var navLink = document.createElement("a")
                        navLink.href = `https://www.google.com/maps/dir/?api=1&origin=${coordinates.lat}+${coordinates.lng}&destination=${detailedPlace.name}&travelmode=walking`
                        navLink.innerHTML = " "
                        wrap(document.getElementById('lets-go-button'), navLink)

                        
                    }
                }


            // }

        }
    });
}

function wrap(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

async function main() {
    var position = await geoFindMe();
    getOnePlace(position.coords.latitude, position.coords.longitude)
}
main()

function getRandomArbitrary(min, max) {
    return Math.round((Math.random() * (max - min) + min),0);
}