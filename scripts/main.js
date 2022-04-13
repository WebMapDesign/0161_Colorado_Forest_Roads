const keyAPI = "AIzaSyBnX5UeDfw19F7lpUEvhxYcTFCJIVrUiFA";
let map;

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

  // -------------SEARCH BOX------------------
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  searchBox.setBounds({ east: -101, west: -110, north: 41.5, south: 36.5 });

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  loadRoadLayers();
}

// ------------ROADS LAYER------------------
function loadRoadLayers() {
  const roadStyleUnchanged = {
    strokeColor: "#ec7632",
    strokeOpacity: 1.0,
  };

  map.addListener("zoom_changed", () => {
    currentMapZoom = map.zoom;

    if (currentMapZoom > 9) {
      layerRoads.setStyle({
        ...roadStyleUnchanged,
        strokeWeight: 4,
      });
    } else if (currentMapZoom > 11) {
      layerRoads.setStyle({
        ...roadStyleUnchanged,
        strokeWeight: 6,
      });
    } else {
      layerRoads.setStyle({
        ...roadStyleUnchanged,
        strokeWeight: 2,
      });
    }
  });

  layerRoads = new google.maps.Data({ map: map });
  layerRoads.addGeoJson(geojsonRoads);
  layerRoads.setStyle({
    ...roadStyleUnchanged,
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
        '<p class="route-other-info">' + routeForestName + "</p>";

      if (routeSeasonality) {
        infoWindowRoadContent +=
          '<p class="route-open">Open: ' + routeSeasonality + "</p>";
      }
    }

    infoWindowRoadContent +=
      '<a href="' +
      locationUrl +
      '"' +
      '" class="directions-button" target="_blank">Save GPS Coordinates</a>';

    infoWindowRoad.setContent(infoWindowRoadContent);
    infoWindowRoad.setPosition(event.latLng);
    infoWindowRoad.setOptions({ pixelOffset: new google.maps.Size(0, 0) });
    infoWindowRoad.open(map);
  }

  let mapBounds = new google.maps.LatLngBounds();
  let pointSW = new google.maps.LatLng(37.048, -108.901);
  let pointNE = new google.maps.LatLng(41.0426, -104.9058);
  mapBounds.extend(pointSW);
  mapBounds.extend(pointNE);
  map.fitBounds(mapBounds);

  layerRoads.addListener("click", showRoadInfo);

  const infoWindowClickedPoint = new google.maps.InfoWindow();

  map.addListener("click", function (event) {
    let latitudeClickedPoint = event.latLng.toJSON().lat;
    let longitudeClickedPoint = event.latLng.toJSON().lng;

    let pointLocationUrl =
      "https://www.google.com/maps/place/" +
      latitudeClickedPoint.toString() +
      ",+" +
      longitudeClickedPoint.toString();

    let infoWindowClickedPointContent =
      '<a href="' +
      pointLocationUrl +
      '"' +
      '" class="directions-button" target="_blank">Save GPS Coordinates</a>';

    infoWindowClickedPoint.setContent(infoWindowClickedPointContent);
    infoWindowClickedPoint.setPosition(event.latLng);
    infoWindowClickedPoint.setOptions({
      pixelOffset: new google.maps.Size(0, 0),
    });
    infoWindowClickedPoint.open(map);
  });
}
