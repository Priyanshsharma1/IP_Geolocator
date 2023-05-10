var myIp = $("#myIp");
var myLocation = $("#myLocation");
var myTimezone = $("#myTimezone");
var myIsp = $("#myIsp");

function showDetails(item) {           // Show details to user.
   myIp.text(item.ip);
   myLocation.text(item.city);
   myTimezone.text(item.timezone);
   myIsp.text(item.org);
}

function closeInfo() {                       // Close the info field for better view of map.
  $(".user_info").toggleClass("hideInfo");
  $("#close").toggleClass("rotateClose");
  $(".user_info div").toggleClass("hide");
}

function getLocation() {                // Get your Geolocation coordinates.
   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(findLocation);
   } else {
     console.log("Your browser doesn't supports this geoLocation.");
   }
}

function findLocation(position) {            // Mark your GPS location on map.
  newLocation = [position.coords.latitude, position.coords.longitude];
  myLocationList("My-GPS-Location", newLocation);
  mymap.flyTo(newLocation , 14, {duration: 2});
}

function showLocation(response) {             // Get User's IP information from ipinfo api.
  jQuery.get("https://ipinfo.io", function(response) {
  var lat = response.loc.split(",")[0];
  var long = response.loc.split(",")[1];
  showDetails(response);
  ipLocation = [lat, long];
  getMap(ipLocation);                          // Mark User's location according to his IP address.
  },"jsonp")
}

showLocation();

places = getList();           // List of places marked on map.

function deletePlace(list, rItem) {        // Deletes an item from place's list.
places = list.filter((item, index) => {
     return item.name !== rItem;
  })
  renderPlaces(places);
  saveList(places);      // Mark each item of place's list on map.
}
function getMap(i) {         // Initialise and get the map from leaflet.js
  mymap = L.map('myMap').setView(i, 10);
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Coded by Priyansh Sharma';
  const tileLayer = L.tileLayer(tileUrl, { attribution });
  tileLayer.addTo(mymap);
  myIcon = L.icon({
      iconUrl: 'images/icon-location.svg',
      iconSize: [36, 45],
  });
  placesGroup = L.layerGroup();
  myLocationList("My-IP-Location", i);
  newPlaceList();
  var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
      mqi = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnVuZWUiLCJhIjoiY2twMmMwaHp6MHlnZzJ1bnY3ajkyb2ZxdiJ9.MFhCgoXigWv6Kk_lUVLvIg")
  var baseMaps = {
      "Street view": osm,
      "Satellite view": mqi
  };
  L.control.layers(baseMaps,null, {position: 'topright'}).addTo(mymap);  // Add a layer with satellite view.
}

function newPlaceList() {          // trigger prompt to enter name when user clicks on map.
 var count = 1;
 mymap.on('click', function(e) {
var item = prompt("Enter name for this place.", "New-Place-"+count);
trimName(item);
if (checkDuplicate(places, listItem)) {        // check if name already exist in the places list.
  alert("Name already exist, use different name.");
  return;
}
var   place = {                   // Create new item and add in marked places list.
      name: listItem,
      coord: e.latlng
    }
    places.push(place);
    renderPlaces(places);
    saveList(places);
    count++
  });
}

function myLocationList(itemName, coords) {  // Generate user's location item.
  trimName(itemName)
  var   place = {
        name: listItem,
        coord: coords
      }
      places.push(place);
      renderPlaces(places);
}

function trimName(item) {        // Adjust name of places.
  if (item.includes(" ")) {
    return listItem = item.split(" ")[0]+"-"+item.split(" ")[1].substr(0, 18);
  } else if (item.includes("www")) {
    return listItem = item.split("www.")[1].substr(0, 20);
  } else {
    return listItem = item.substr(0, 18);
  }
}

function createList(name) {       // Create Unordered list to show in sideBar.
   div = document.createElement('div');
   li = document.createElement('li');
   a = document.createElement('a');
   del = document.createElement('img');
  del.setAttribute("src", "images/icon-cross.svg");
  div.appendChild(a);
  div.appendChild(del);
  li.appendChild(div);
  ul.appendChild(li);
  a.innerText = name;
  a.href = '#';
}

const ul = document.querySelector("#placeList");
function renderPlaces(i) {        // Render each list item on map.
  while (ul.hasChildNodes()) {
    ul.removeChild(ul.firstChild);
  }
  i.forEach((item) => {
    createList(item.name);
    del.classList.add(item.name);
    del.onclick = function () {
    placesGroup.clearLayers();
    deletePlace(i, this.className);
    return;
    };
var  markers = L.marker(item.coord, {icon: myIcon});
    renderThis(markers, item.name, placesGroup);
    markers.openPopup();
    a.addEventListener('click', () => {
      flyToPlace(item.coord, item.name);
      toggleMenu();
    });
  });
  placesGroup.addTo(mymap);
}

function flyToPlace(c, p) {           // Visit places on map by just a click.
  mymap.flyTo(c, 14, {duration: 3});
  setTimeout(() => {
    L.popup({ closeButton: false, offset: L.point(0, -17) })
   .setLatLng(c)
   .setContent(p)
   .openOn(mymap);
}, 3000);
}

function toggleMenu() {       // Open or Close the sideBar.
    $("#closeMenu").toggleClass("rotateClose2");
    $(".sideBar-container").toggleClass("hide_side_bar");
}

var recenter = $(".reCenter_container");
var isGPSon = false;              // Turns on the GPS for Geolocation.
recenter.on('click', function() {
  if (isGPSon) {
    mymap.flyTo(newLocation , 10, {duration: 3});
  } else {
    mymap.flyTo(ipLocation, 10, {duration: 3});
  }
});
recenter.on('dblclick', function(e) {
  if (!isGPSon) {
    getLocation();
    isGPSon = true;
  }
});

function renderThis(mark, popUp, group) {        // Renders each place list item on map.
  mark.bindPopup(popUp, { closeButton: false, offset: L.point(0, -17) }).openPopup();
  group.addLayer(mark);
  group.addTo(mymap);
  mark.on('dblclick', function(e) {
    flyToPlace(e.latlng, popUp);
  });
}

var inputBar = document.querySelector(".inputBar");

function findNew() {           // Get the details of user entered IP address.
    jQuery.get("https://ipinfo.io/"+inputBar.value, function(response) {
  console.log(response);
var  searchedLocation = [response.loc.split(",")[0], response.loc.split(",")[1]];
    myLocationList(response.org, searchedLocation);
    flyToPlace(searchedLocation, response.org);
    showDetails(response);
  },"jsonp")
}

function saveList(list) {         // Save place list in localstorage.
  str = JSON.stringify(list);
  localStorage.setItem("myList", str);
}

function getList() {              // Get saved place list from local storage.
  savedList = localStorage.getItem("myList");
  savedList = JSON.parse(savedList);
  if (!savedList) {
    return [];
  } else {
    deleteThis(savedList);
    console.log(savedList);
    return sList;
  }
}

function deleteThis(savedList) {        // Deletes GPS and IP location item from place's list to avoid duplicate items.
sList = savedList.filter((item, index) => {
     return item.name !== "My-IP-Location" && item.name !== "My-GPS-Location";
  })
  return sList;
}

function removeList() {               // Remove whole list saved in localStorage.
  localStorage.removeItem("myList");
}

function checkDuplicate(l, s) {       // Cheks duplicate items in places list.
  for (var i=0; i<l.length; i++) {
    if (l[i].name===s) {
      // alert("item aready exist.");
      return true;
    }
  }
  return false;
}