(function () {
    'use strict';

    angular
        .module('app')
        .controller('dogsCtrl', function(dogsFactory, sessionService, searchService, locationService, adoptableService, toastService, errorHandlerService, $document, $mdSidenav, $scope, $state, $q, $location, $anchorScroll) {
            
            var vm = this;
            vm.page = 'Home';
            vm.currentUser = sessionService.getUser();
            vm.letter = 'A';                // This sets up for the breeds page
            vm.hideRescue = false;
            vm.height = window.innerHeight; // Used in back to top button
            vm.offset = 150;                // This establishes a content offset for Back to Top button
            vm.getDogDetail = getDogDetail;
            vm.getShelters = getShelters;
            vm.randomRescue = {};
            vm.getDogDetail = getDogDetail;

            // Retrieve a random rescue dog from petfinder api
            function getRandomRescue(zip) {
                var defer = $q.defer();
                dogsFactory.getRandomRescue(zip).then(function(dog) {
                    defer.resolve( dog.data.petfinder.pet );
                }, function(err) {
                    defer.reject();
                });
                return defer.promise;
            }
            
            // Get list of shelters from petfinder api
            function getShelters() {
                if (!vm.currentUser.zipConfirmed) {
                    locationService.getZipCode().then(function(zip) {
                        $state.go('shelters', { zip: vm.currentUser.zip }); 
                    }, function() {
                        toastService.showToast("You didn't enter a valid zip code.");
                    });     
                } else {
                    $state.go('shelters', { zip: vm.currentUser.zip }); 
                }
            }

            function getDogDetail(id) {
                $state.go('detail', {id: id, breed: null});
            }

            // list of breed value/display objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

            // Set up the back-to-top button
            vm.toTop = function() {
                $location.hash('top');
                $anchorScroll();
            };

            // Set up the side navigation for smaller screen sizes
            vm.toggleLeft = function() {
                $mdSidenav('left').toggle();
            };

            // Need valid zip code to retrieve a rescue dog from petfinder api
            // Either used currentUser's confirmed zip, get a zip from geolocation,
            // or use a default zip = 20001
            locationService.getLocation().then(function() {
                getRandomRescue(vm.currentUser.zip).then(function(rescue) {
                    if (rescue) {
                        if (Array.isArray(rescue.breeds.breed)) {
                            rescue.breedStr = rescue.breeds.breed[0].$t + ', ' + rescue.breeds.breed[1].$t;
                        } else {
                            rescue.breedStr = rescue.breeds.breed.$t;
                        }
                        vm.randomRescue = rescue;
                    } else {
                        vm.hideRescue = true;
                    }
                }, function() {
                    vm.hideRescue = true;
                });
            });


            // Show the rescue dog 
            vm.showAdoptable = function(event, adoptable) {
               adoptableService.showAdoptable(event, adoptable);
           };
    }); 
})();
