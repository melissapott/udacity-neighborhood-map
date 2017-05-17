//Model
var myLocations = [
	{
		name : 'Giant Food Store',
		type : 'grocery store',
		lat : 40.1784312,
		lng : -75.18228049999999,
		placeID : "ChIJKWIM6j6lxokRxAIn8qVa7rk"
	},
	{
		name : 'Wegmans',
		type : 'grocery store',
		lat : 40.2307534,
		lng : -75.13206989999999,
		placeID : "ChIJkS5j9UmvxokRVFE_V8NlteI"
	},
	{
		name : 'Aldi',
		type : 'grocery store',
		lat : 40.201349,
		lng : -75.1201384,
		placeID : "ChIJyUygAW2vxokRUGANhxrm1-I"
	},
	{
		name : 'Dollar Tree',
		type : 'housewares',
		lat : 40.183174,
		lng : -75.1191456,
		placeID : "ChIJx58ADLCvxokRXpdu8bYWUoc"
	},
	{
		name : 'Walmart',
		type : 'housewares',
		lat : 40.1585157,
		lng : -75.1391165,
		placeID : "ChIJXcVGReKvxokROLzx1KmMnVg"
	},
	{
		name : 'Bed Bath & Beyond',
		type : 'housewares',
		lat : 40.2292837,
		lng : -75.23910910000001,
		placeID : "ChIJFd8Kgm2kxokR8HzxJPbmZyo"
	},
	{
		name : 'Feedstore',
		type : 'restaurant',
		lat : 40.1564072,
		lng : -75.2179089,
		placeID : "8f17ed5344eca1f56e4a794df13ecdc735835fe1"
	},
	{
		name: 'Iron Abbey',
		type : 'restaurant',
		lat : 40.1882702,
		lng : -75.1345472,
		placeID : "ChIJyyI9q5mvxokRPyAp_5HfonY"
	},
	{
		name : 'Spring House Tavern',
		type : 'restaurant',
		lat : 40.1852133,
		lng : -75.2275401,
		placeID : "ChIJu9NtHL-kxokR4s-6HEy_MW8"
	},
	{
		name : 'Bound Beverages',
		type : 'beer store',
		lat : 40.2216446,
		lng : -75.1403863,
		placeID : "ChIJM_4dekOvxokRblIuwGUn71s"
	},
	{
		name : 'Ambler Beverage Exchange',
		type : 'beer store',
		lat : 40.1568061,
		lng : -75.2179367,
		placeID : "ChIJZRozHDq7xokR8pTm7_uvMmc"
	}

];

var home = {
	name : 'Edgelawn',
	type : 'home',
	lat : 40.177173,
	lng : -75.204783,
	zoom : 12

};

//define global variables
var map;
var markers = [];
var mapError = "<h1>Sorry, there was a problem loading the map.  Please try again later :)</h1>";



//define a Location object which represents a place on the map
var Location = function(data) {
	var self = this;
	self.lat = data.lat;
	self.lng = data.lng;
	self.name = data.name;
	self.type = data.type;

	//get the four square data for the location
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=AAEHRQ0OHUCRJEZ2IU3ZHASMN522LNACV5VT3XD241HZ1XNG&client_secret=5SE0OHTQOULVTCVIRDDJ5DFQFTDW3KF4RHLSIAXQ404NI3FK&v=20170425&limit=1&ll=' ;
	foursquareURL += self.lat + ',' + self.lng + '&query=' + self.name;
	$.getJSON(foursquareURL, function(data){
		info = data.response.venues;
		self.fsData = info[0];
	})
	.fail(function() {
		self.fsError = true;
	});


	//create a map marker for the location
	self.marker = new google.maps.Marker({
		position: {lat: this.lat, lng: this.lng},
		title: this.name,
		map: map,
		animation: google.maps.Animation.DROP
	});

	//define behavior for the marker being clicked
	self.marker.addListener('click', function(){
		if (self.marker.getAnimation() !== null) {
			//if the marker has already been selected, a second click de-selects it
			self.marker.setAnimation(null);
			infoWindow.close();
		} else {
			//only one marker should be animated at a time, so make sure all other animation is off
			for(var i=0; i < markers.length; i++){
				markers[i].setAnimation(null);
			}
			//animate the selected marker and open an info window
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
			//build a string of HTML content for the infowindow
			contentStr = '<h1>' + self.name + '</h1><br>';
			//if we got an error retrieving Foursquare data, display an error message, otherwise display the returned data
			if (self.fsError){
				contentStr += "Sorry, unable to retrieve data from Foursquare";
			} else {
				if(self.fsData.contact.formattedPhone) {
					contentStr += self.fsData.contact.formattedPhone + '<br>';
				}
				if(self.fsData.url) {
					contentStr += '<a href="' + self.fsData.url + '">' + self.fsData.url + '</a><br>';
				}
				for(var i=0; i < self.fsData.location.formattedAddress.length-1; i++){
					contentStr += self.fsData.location.formattedAddress[i] + '<br>';
				}
				contentStr +=  '<br><a href="https://foursquare.com/v/' + self.fsData.id + '?ref=AAEHRQ0OHUCRJEZ2IU3ZHASMN522LNACV5VT3XD241HZ1XNG">View Details on Foursquare</a><br>';
			}
			infoWindow.setContent(contentStr);
			infoWindow.open(map, self.marker);
		}
	});

	//add the marker to an array of markers
	markers.push(self.marker);
}; //end Location function




function initMap() {
	var mapOK = false;

	try{
		//create a Google map object centered at the home location
		map = new google.maps.Map(document.getElementById('mappy'), {
			center: {lat: home.lat, lng: home.lng},
			zoom: home.zoom
		});

		//add a listener on the map that will fire when it has been loaded
		google.maps.event.addListener(map, 'tilesloaded', function(e) {
			google.maps.event.clearListeners(map, 'tilesloaded');
			mapOK = true;
			ko.applyBindings(new ViewModel());
		});

		//if the map hasn't loaded after 5 seconds, there's probably a network connection
		//issue, so display an error message.
		setTimeout(function(){
			if (!mapOK) {
				document.getElementById('mappy').innerHTML = mapError;
				document.getElementById('sidebar').innerHTML = "";
			}
		}, 5000);

		//create an infowindow object
		infoWindow = new google.maps.InfoWindow({
		content: ' ',
		});

	} catch(e) {
		//a map object was not able to be created, so display an error message
		document.getElementById('mappy').innerHTML = mapError;
		document.getElementById('sidebar').innerHTML = "";
	}

} //end initMap function


//catch errors if the Google maps API returns a 404 or similar error
mapLoadError = () => {
	document.getElementById('mappy').innerHTML = mapError;
	document.getElementById('sidebar').innerHTML = "";
};

//function to check for google maps authentication errors
function gm_authFailure() {
	document.getElementById('mappy').innerHTML = mapError;
	document.getElementById('sidebar').innerHTML = "";
}



//View Model
var ViewModel = function(){
	var self=this;

	this.locationList = ko.observableArray([]);

	//build the default list of locations
	myLocations.forEach(function(place){
		self.locationList.push(new Location(place));
	});


	//build an array with unique location type values from the locations array
	//to be used in the filtering function
	locationTypes = ko.observableArray([]);
	var distinctLocations =  [...new Set(myLocations.map(item => item.type))];
	for (var i=0; i < distinctLocations.length; i++){
		locationTypes.push(distinctLocations[i]);
	}

	self.selectedType = ko.observable();

	//filter option to allow user to limit results to certain types of places
	this.filterTypes = function() {
		//clear the markers from the map
		for(var i=0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		markers = [];

		//clear the location list
		this.locationList([]);

		//build a new location list with only those locations matching filter criteria
		for(var i=0; i < myLocations.length; i++){
			if(myLocations[i].type == self.selectedType() || self.selectedType() === undefined){
				this.locationList.push(new Location(myLocations[i]));
			}
		}
	}; //end filterTypes function

	this.changeLocation = function() {
		google.maps.event.trigger(this.marker, 'click');
	};
};//end ViewModel








