
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

// Simple location search function
function getOnePlace(lat, long) {

    const coordinates = { lat: lat, lng: long };
    var request = {
        query: 'restaurant',
        openNow: "True",
        rankBy: "google.maps.places.RankBy.DISTANCE",
        fields: ['name', 'geometry', 'opening_hours', 'price_level', 'place_id', 'open_now']
    };

    const map = new google.maps.Map(
        document.getElementById('map'), { center: coordinates, zoom: 25 });


    var service = new google.maps.places.PlacesService(map);

    service.nearbySearch({ location: coordinates, radius: 25000, type: "restaurant" }, (results, status, opening_hours, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // chose a random place
            var i = getRandomArbitrary(0, results.length - 1)
            place = results[i]
            console.log(place.vicinity)
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
        }
    });
}

var getPlaceDetails = (placeid) => {
    service = new google.maps.places.PlacesService(map); // can refactor to only initialize this once...
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const placeDetails = service.getDetails(
                {
                    placeId: placeid,
                    fields: ['name', 'rating', 'website', 'reviews']
                },(placeDetails, status) => {
                    resolve(placeDetails)
                })
           
        }, 2000)

    })

}

var searchNearby = (location, radius) => {
    const map = new google.maps.Map(document.getElementById('map'), { center: location, zoom: 25 });
    var placesService = new google.maps.places.PlacesService(map);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const placesList = placesService.nearbySearch(
                {
                    location:location, 
                    radius:radius, 
                    type:"restaurant"
                }, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results)
                    }
                });
        }, 2000)
    })
}
const coordinates = { lat: 38.8726784, lng: -77.0899968 }

//helper functions below:


var getTravelTimes = (originPoint, destinationList, walking) => {
    var matrix = new google.maps.DistanceMatrixService();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (walking==true){
                const distanceData = matrix.getDistanceMatrix(
                    {
                        origins: [originPoint],
                        destinations: destinationList,
                        travelMode: 'WALKING',
                        unitSystem: google.maps.UnitSystem.IMPERIAL
                    });
                resolve(distanceData)
            } else if (walking == false ){
                const distanceData = matrix.getDistanceMatrix(
                    {
                        origins: [originPoint],
                        destinations: destinationList,
                        travelMode: 'DRIVING',
                        unitSystem: google.maps.UnitSystem.IMPERIAL
                    });
                resolve(distanceData)
            }
            reject('took too long')
            
        }, 2000)
    })
}


function wrap(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

function getRandomArbitrary(min, max) {
    return Math.round((Math.random() * (max - min) + min), 0);
}

async function main() {
    var position = await geoFindMe();
    var placesList = await searchNearby(coordinates, 25000)
    var randomNumber = await getRandomArbitrary(0, placesList.length-1)
    // set the place in the html
    document.getElementById('restaurant-name').innerHTML = placesList[randomNumber].name
    document.getElementById('restaurant-name').classList.toggle('loading-field')
    document.getElementById('restaurant-name').setAttribute('style', "width:auto")
    // update the address
    document.getElementById('vicinity').innerHTML = `at ${placesList[randomNumber].vicinity}`
    document.getElementById('vicinity').classList.toggle('loading-field')
    document.getElementById('at').remove()

    console.log(placesList)
    const travelTimeWalking = await getTravelTimes(originPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude), [placesList[randomNumber].vicinity], true)
    var tripinfo 
    var transportMode 
    // if walking takes less than 20 mins, do that. if longer, get driving directions and use that as the trip info
    if (travelTimeWalking.rows[0].elements[0].duration.value<2400){
        tripinfo = travelTimeWalking
        transportMode = "Walk"
    } else {
        tripinfo = await getTravelTimes(originPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude), [placesList[randomNumber].vicinity], false)
        transportMode = 'Drive'
    }
    //update the transport mode and time element
    document.getElementById('transportationMode').innerHTML = transportMode
    document.getElementById('transportationMode').classList.toggle('loading-field')
    document.getElementById('transportationMode').setAttribute('style', "width:auto")
    // time element set
    document.getElementById('travelTime').innerHTML =` ${Math.round(tripinfo.rows[0].elements[0].duration.value/60, 0)} `
    document.getElementById('travelTime').classList.toggle('loading-field')
    document.getElementById('travelTime').setAttribute('style', "width:auto")

    var placeSelection = placesList[randomNumber]
    var placeDetails = await getPlaceDetails(placeSelection.place_id)
    // Update the place text with a link to the website
    var restaurantLink = document.createElement('a')
    restaurantLink.setAttribute('style', "width:auto")
    restaurantLink.href = placeDetails.website
    wrap(document.getElementById('restaurant-name'), restaurantLink)

    // console.log(tripinfo.rows[0].elements[0].duration)
    // document.getElementById('restaurant-idea').innerHTML = ''
    // document.getElementById('restaurant-idea').removeChild('lds-ellipsis')
    // document.getElementById('restaurant-idea').innerHTML = `${transportMode} ${tripinfo.rows[0].elements[0].duration.text} to <a href='${placeDetails.website}'><i>${placeSelection.name}</i></a>`
    // console.log(tripinfo.rows[0].elements[0].distance.text)
    var navLink = document.createElement("a")
    navLink.href = `https://www.google.com/maps/dir/?api=1&origin=${coordinates.lat}+${coordinates.lng}&destination=${placeSelection.name}&travelmode=${(transportMode=='Walk' ? 'walking' : 'driving')}`
    navLink.innerHTML = " "
    wrap(document.getElementById('lets-go-button'), navLink)
    // getOnePlace(position.coords.latitude, position.coords.longitude)
    document.getElementById('info-circle').addEventListener('click', function (event) {
        document.getElementById('info-box').classList.toggle('invisible')
        document.getElementById('info-circle').classList.toggle('info-selected')
        // document.getElementById('info-box').setAttribute('visibility', 'visible')
    })
    document.getElementById('info-circle').addEventListener('mouseover', function (event) {
        document.getElementById('info-circle').classList.toggle('info-selected')
    })
    document.getElementById('info-circle').addEventListener('mouseout', function (event) {
        document.getElementById('info-circle').classList.toggle('info-selected')
    })
}
main()
