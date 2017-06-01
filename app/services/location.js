(function () {
    'use strict';

    angular
        .module('app')
        .factory('locationService', function(sessionService, $mdDialog, $http, $q) {

        var _this = this;
        var currentUser = sessionService.getUser();

        // Get the location of the user from their browser
        // And then use google's api to compute the zip from the lat/long coordinates
        _this.getLocation = function() {
            var defer = $q.defer();
            var zip;
            if (currentUser.zipConfirmed) {
                defer.resolve(currentUser.zip);
            } else {
                if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(pos) {
                        var geoStr = pos.coords.latitude +", " + pos.coords.longitude;
                        var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + geoStr + "&key=AIzaSyC9fO8vW7pPyIRlafuzg9O4T-sm5TJ3kPo";

                        $http.get(googleURL).then(function(results) {
                            var addressArr = results.data.results[0].address_components;
                            for ( var i = 0; i < addressArr.length; i++) {
                                if (addressArr[i].types[0] === 'postal_code') {
                                    zip = addressArr[i].short_name;
                                    i = addressArr.length;
                                }
                            }
                            if (zip.length === 5) { 
                                currentUser.zip = zip;
                                currentUser.zipConfirmed = true;
                                sessionService.setUser(currentUser);
                                defer.resolve(zip);
                            } else {
                                currentUser.zip = '20001';
                                sessionService.setUser(currentUser);
                                defer.resolve(currentUser.zip);
                            }
                        }, function() {
                            currentUser.zip = '20001';
                            sessionService.setUser(currentUser);
                            defer.resolve(currentUser.zip);
                        });
                    });
                } else { 
                    currentUser.zip = '20001';
                    sessionService.setUser(currentUser);
                    defer.resolve(currentUser.zip);
                }
            }
            return defer.promise;
        };

        // Dialog to retrieve zip code from user
        _this.getZipCode = function() {
            return new Promise(function(resolve, reject) {
                var confirm = $mdDialog.prompt()
                    .title('Please enter your 5-digit zip code:')
                    .textContent("We need a zip code to find shelters in your area.")
                    .placeholder('Your zip code')
                    .ariaLabel('zip code')
                    .ok('Okay!')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function(result) {
                    // Check to maker sure it is a validly formatted zip code
                    if (/^\d{5}$/.test(result)) {
                        currentUser.zip = result;
                        currentUser.zipConfirmed = true;
                        sessionService.setUser(currentUser);
                        resolve( result );
                    } else {
                        reject();
                    }
                }, function() {
                    reject(); 
                });
            });
        };

        return {
            getLocation: _this.getLocation,
            getZipCode: _this.getZipCode
        };

    });
})();
