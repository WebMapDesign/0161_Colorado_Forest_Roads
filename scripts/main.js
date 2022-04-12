const keyAPI = "AIzaSyBnX5UeDfw19F7lpUEvhxYcTFCJIVrUiFA";

function initMap() {
  const center = { lat: 39.1738, lng: -106.8441 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 7,
    mapTypeControl: true,
    disableDoubleClickZoom: false,
    styles: [
      {
        featureType: "poi.business",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
    ],
  });

  // ------------ROADS LAYER------------------
  layerRoads = new google.maps.Data({ map: map });
  layerRoads.addGeoJson(geojsonRoads);
  layerRoads.setStyle({
    strokeColor: "#ec7632",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });
  layerRoads.setMap(map);

  const infoWindowRoad = new google.maps.InfoWindow();

  function showRoadInfo(event) {
    let latitudeClickedPoint = event.latLng.toJSON().lat;
    let longitudeClickedPoint = event.latLng.toJSON().lng;

    let locationUrl =
      "https://www.google.com/maps/place/" +
      latitudeClickedPoint.toString() +
      ",+" +
      longitudeClickedPoint.toString();

    let routeID = event.feature.getProperty("Route ID");
    let routeName = event.feature.getProperty("Route Name");
    let routeSeasonality =
      event.feature.getProperty("Open Dates") +
      " (" +
      event.feature.getProperty("Open") +
      ")";

    let routeForestDistrict = event.feature.getProperty("Forest District Name");
    let routeForestName = event.feature.getProperty("National Forest Name");

    let infoWindowRoadContent = "";

    if (routeName) {
      infoWindowRoadContent +=
        '<p class="info-window-title">' + routeName ?? "Unnamed" + "</p>";
    }

    if (routeID) {
      infoWindowRoadContent +=
        '<p class="route-other-info">Route ID: ' + routeID + "</p>";
    }

    if (routeForestDistrict) {
      infoWindowRoadContent +=
        '<p class="route-other-info">' + routeForestDistrict + "</p>";
    }

    if (routeForestName) {
      infoWindowRoadContent +=
        '<p class="route-other-info">Open: ' + routeForestName + "</p>";

      if (routeSeasonality) {
        infoWindowRoadContent +=
          '<p class="route-open">' + routeSeasonality + "</p>";
      }
    }

    infoWindowRoadContent +=
      '<a href="' +
      locationUrl +
      '"' +
      '" class="directions-button" target="_blank">' +
      latitudeClickedPoint.toFixed(6) +
      ", " +
      longitudeClickedPoint.toFixed(6) +
      "</a>";

    infoWindowRoad.setContent(infoWindowRoadContent);
    infoWindowRoad.setPosition(event.latLng);
    infoWindowRoad.setOptions({ pixelOffset: new google.maps.Size(0, 0) });
    infoWindowRoad.open(map);
  }

  // -------------SEARCH BOX------------------
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  searchBox.setBounds({ east: -101, west: -110, north: 41.5, south: 36.5 });

  let markers = [];

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(50, 50),
      };

      let markerFoundPoint = new google.maps.Marker({
        map,
        icon,
        title: place.name,
        position: place.geometry.location,
      });

      markers.push(markerFoundPoint);

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      let infoWindowFoundPlace = new google.maps.InfoWindow({
        position: place.geometry.location,
        pixelOffset: new google.maps.Size(-10, 0),
      });

      let infoWindowPlaceContent =
        '<p class="info-window-title">' +
        place.formatted_address +
        "</p>" +
        "Latitude: " +
        place.geometry.location.toJSON().lat +
        "<br>" +
        "Longitude: " +
        place.geometry.location.toJSON().lng;

      infoWindowFoundPlace.setContent(infoWindowPlaceContent);
      infoWindowFoundPlace.open(map, markerFoundPoint);
    });
    map.fitBounds(bounds);
  });

  layerRoads.addListener("click", showRoadInfo);
}
