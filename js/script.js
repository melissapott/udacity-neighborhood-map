//Model
var myLocations = [
	{
		name : 'Giant Food Store',
		type : 'grocery store',
		lat : 40.1784312,
		lng : -75.18228049999999,
		placeID : "ChIJKWIM6j6lxokRxAIn8qVa7rk",
		show : false
	},
	{
		name : 'Wegmans',
		type : 'grocery store',
		lat : 40.2307534,
		lng : -75.13206989999999,
		placeID : "ChIJkS5j9UmvxokRVFE_V8NlteI",
		show : true
	},
	{
		name : 'Aldi',
		type : 'grocery store',
		lat : 40.201349,
		lng : -75.1201384,
		placeID : "ChIJyUygAW2vxokRUGANhxrm1-I",
		show : true
	},
	{
		name : 'Dollar Tree',
		type : 'housewares',
		lat : 40.183174,
		lng : -75.1191456,
		placeID : "ChIJx58ADLCvxokRXpdu8bYWUoc",
		show : true
	},
	{
		name : 'Walmart',
		type : 'housewares',
		lat : 40.1585157,
		lng : -75.1391165,
		placeID : "ChIJXcVGReKvxokROLzx1KmMnVg",
		show : true
	},
	{
		name : 'Bed Bath & Beyond',
		type : 'housewares',
		lat : 40.2292837,
		lng : -75.23910910000001,
		placeID : "ChIJFd8Kgm2kxokR8HzxJPbmZyo",
		show : true
	},
	{
		name : 'Feedstore',
		type : 'restaurant',
		lat : 40.1564072,
		lng : -75.2179089,
		placeID : "8f17ed5344eca1f56e4a794df13ecdc735835fe1",
		show : true
	},
	{
		name: 'Iron Abbey',
		type : 'restaurant',
		lat : 40.1882702,
		lng : -75.1345472,
		placeID : "ChIJyyI9q5mvxokRPyAp_5HfonY",
		show : true
	},
	{
		name : 'Spring House Tavern',
		type : 'restaurant',
		lat : 40.1852133,
		lng : -75.2275401,
		placeID : "ChIJu9NtHL-kxokR4s-6HEy_MW8",
		show : true
	},
	{
		name : 'Bound Beverages',
		type : 'beer store',
		lat : 40.2216446,
		lng : -75.1403863,
		placeID : "ChIJM_4dekOvxokRblIuwGUn71s",
		show : true
	},
	{
		name : 'Ambler Beverage Exchange',
		type : 'beer store',
		lat : 40.1568061,
		lng : -75.2179367,
		placeID : "ChIJZRozHDq7xokR8pTm7_uvMmc",
		show : true
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
	self.show = data.show;

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

//this is part of the Google maps API and is called when authentication fails
//such as a bad API key
function gm_authFailure() {
	document.getElementById('mappy').innerHTML = mapError;
	document.getElementById('sidebar').innerHTML = "";
}



//View Model
var ViewModel = function(){
	var self=this;

	//build an array of location objects from the data model
	this.locationList = [];

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

	//variable to hold the value of selected filter option
	selectedType = ko.observable();

	//build an observable array to hold our list of filtered locations to display in sidebar
	this.filteredList = ko.computed(function(){
		//clean up any open infowindow, visible markers and marker animations
		infoWindow.close();
		for (var i = 0; i < self.locationList.length; i++) {
			self.locationList[i].marker.setVisible(false);
			self.locationList[i].marker.setAnimation(null);
		}

		if(selectedType() === undefined) {
			//if no location type filter has been selected, all locations should be in the filtered list
			//and all markers should be shown
			for (var i = 0; i < self.locationList.length; i++) {
				self.locationList[i].marker.setVisible(true);
				self.locationList[i].marker.setAnimation(google.maps.Animation.DROP);
			}
			return self.locationList;
		} else {
			for (var i = 0; i < self.locationList.length; i++) {
				//compare filter selection with location type, set marker visibility to true on a match
				if(self.locationList[i].type === selectedType()){
					self.locationList[i].marker.setVisible(true);
					self.locationList[i].marker.setAnimation(google.maps.Animation.DROP);
				}
			}
			//return a filtered list containing only locations matching location type filter
			return ko.utils.arrayFilter(self.locationList, function(location){
				return location.type === selectedType();
			});
		}

	});//end filteredList


	//function to simulate a click on a map marker if the location is
	//clicked from the list instead
	this.changeLocation = function() {
		google.maps.event.trigger(this.marker, 'click');
	};

};//end ViewModel




