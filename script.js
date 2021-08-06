
//https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
async function geoFindMe() {
    return new Promise((resolve,reject) => {
        function error(err) {
            // console.log(err.code, err.message)ds
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.")
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.")
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.")
                    break;
                case error.UNKNOWN_ERROR:
                    alert("An unknown error occurred.")
                    break;
            }
        }

        // if (!navigator.geolocation) {
        //     console.log('Geolocation is not supported by your browser');
        // } else {
  
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(position)
            },
            (err) => {
                // Failed
                error(err)
                reject(err)
            })
   

    })


}

async function locationZip() {
    var zip = await prompt('please enter your ZIP')
    return zip
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

function zipToCoords(zip){
    return new Promise((resolve, reject) => {
        // const map = new google.maps.Map(document.getElementById('map'));
        const geocoder = new google.maps.Geocoder()
        var loc = [];
        geocoder.geocode({ 'address': zip }, function (results, status) {
            // and this is function which processes response
            if (status == google.maps.GeocoderStatus.OK) {
                loc[0] = results[0].geometry.location.lat();
                loc[1] = results[0].geometry.location.lng();

                resolve(loc); // the place where loc contains geocoded coordinates

            } else {
                reject("Geocode was not successful for the following reason: " + status);
            }
        // const geocoder = new google.maps.Geocoder()
        // geocoder
        //     .geocode({ address: zip })
        //     .then(({ results }) => {
        //         console.log(results)
        //         resolve(results[0]) })
        //     .catch((e) =>
        //         reject("Geocode was not successful for the following reason: " + e)
        //     );
    })
})

}


async function main() {
    var position
    try{
        position = await geoFindMe();
        position = { lat: position.coords.latitude, lng: position.coords.longitude}
    }catch{
        var zip = await locationZip();
        position = await zipToCoords(zip)
        console.log(position)
        position = { lat: position[0], lng: position[1] }
    }
    
    var placesList = await searchNearby(position, 25000)
    var randomNumber = await getRandomArbitrary(0, placesList.length-1)
    // set the place in the html
    document.getElementById('restaurant-name').innerHTML = placesList[randomNumber].name
    document.getElementById('restaurant-name').classList.toggle('loading-field')
    document.getElementById('restaurant-name').setAttribute('style', "width:auto")
    // update the address
    document.getElementById('vicinity').innerHTML = `at ${placesList[randomNumber].vicinity}`
    document.getElementById('vicinity').classList.toggle('loading-field')
    document.getElementById('at').remove()
    console.log(new google.maps.LatLng(position.lat, position.lng))
    const travelTimeWalking = await getTravelTimes(originPoint = position, [placesList[randomNumber].vicinity], true)
    var tripinfo 
    var transportMode 
    // if walking takes less than 20 mins, do that. if longer, get driving directions and use that as the trip info
    if (travelTimeWalking.rows[0].elements[0].duration.value<2400){
        tripinfo = travelTimeWalking
        transportMode = "Walk"
    } else {
        tripinfo = await getTravelTimes(originPoint = position, [placesList[randomNumber].vicinity], false)
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
    console.log(position.lat, position)
    var navLink = document.createElement("a")
    navLink.href = `https://www.google.com/maps/dir/?api=1&origin=${position.lat}+${position.lng}&destination=${placeSelection.name}&travelmode=${(transportMode=='Walk' ? 'walking' : 'driving')}`
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
