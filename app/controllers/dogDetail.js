
(function () {
    'use strict';

    angular
        .module('app')
        .controller('dogDetailCtrl', function(dogsFactory, usersFactory, sessionService, errorHandlerService, toastService, searchService, locationService, adoptableService, favoritesService, $document, $sce, $scope, $http, $mdDialog, $mdSidenav, $stateParams, $state, $location, $anchorScroll) {

            var vm = this;
            vm.currentUser = sessionService.getUser();
            vm.adoptables = [];
            vm.videos = [];
            vm.noRescues = false;
            vm.haveRescues = false;
            vm.height = window.innerHeight;

            // list of breed objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

            // Get dog from db by ID
            function getDog(id) {
                return new Promise(function(resolve, reject) {
                    dogsFactory.getDog(id).then(function(dog) {
                        dog = dog.data[0];
                        // Check to see if this dog is among the user's favorites
                        if (vm.currentUser.favorites.length !== 0) {
                            // favoritesService will return an array
                            var dogArr = favoritesService.markFavorites(dog, vm.currentUser.favorites);
                            dog = dogArr[0];
                        }
                        resolve(dog);
                    }, function() {
                        toastService('Unable to get dog info.');
                        reject();
                    });
                });
            }

            // Get dog from db by breed name
            function getDogByBreed(breed) {
                return new Promise(function(resolve, reject) {
                    dogsFactory.getDogByBreed(breed).then(function(dog) {
                        dog = dog.data[0];
                        // Check to see if this dog is among the user's favorites
                        if (vm.currentUser.favorites.length !== 0) {
                            // favoritesService will return an array
                            var dogArr = favoritesService.markFavorites(dog, vm.currentUser.favorites);
                            dog = dogArr[0];
                        }
                        resolve(dog);
                    }, function() {
                        toastService('Unable to get dog info.');
                        reject();
                    });
                });
            }

             // Get videos from youtube api relating to this dog breed
           function getVideos(breed) {
                dogsFactory.getVideos(breed).then(function(videos) {
                    vm.videos = videos.data.items;
                }, function() {
                    toastService('Found no videos for this breed.');
                });   
            }

            // Gets dogs from petfinder api 
            // Called from getAdoptables()
             function retrieveDogs(breed) {
                dogsFactory.getAdoptables(breed, vm.currentUser.zip).then(function(adoptables) {
                    if (adoptables.length === 0) {
                        vm.noRescues = true;
                    } else {
                        vm.haveRescues = true;
                        vm.adoptables = adoptables;
                        $scope.$apply();
                    }
                }, function() {
                    vm.adoptables = [];
                    vm.noRescues = true;
                    vm.haveRescues = false;
                    $scope.$apply();
                });
            }


            // Get dog by ID or by breed name
            if ($stateParams.id) {
                getDog($stateParams.id).then(function(dog) {
                    vm.dog = dog;
                    document.getElementById('longDesc').innerHTML = vm.dog.longDesc;
                    vm.page = 'Breed // ' + vm.dog.breed;
                    getVideos(vm.dog.breed);
                });
            } else if ($stateParams.breed) {
                getDogByBreed($stateParams.breed).then(function(dog) {
                    vm.dog = dog;
                    vm.page = 'Breed // ' + vm.dog.breed;
                    getVideos(vm.dog.breed);
                });
            }

            // User selected a breed to be marked and saved as favorite
            vm.toggleFavorite = function(id, breed) {
                favoritesService.toggleFavorite(id, breed);
                if (vm.dog.favClass === 'paw fav-on') {
                    vm.dog.favClass = 'paw fav-off';
                } else {
                    vm.dog.favClass = 'paw fav-on';
                }
            };

            // Set up the side navigation for smaller screen sizes
            vm.toggleLeft = function() {
                $mdSidenav('left').toggle();
            };

            // Returns you-tube source for embedded iframe video
            vm.getIframeSrc = function(videoId) {
                return 'https://www.youtube.com/embed/' + videoId;
            };

           // Enables user to see the standard for this breed
           vm.showStandard = function(event, dog) {
               var iframeSrc = $sce.trustAsResourceUrl(dog.breedStandard);

               $mdDialog.show({
                controller: ['$scope', 'src', function($scope, src) {
                    $scope.src = src;
                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };
                }],
                template: 
                    '<md-dialog class="std-dialog" aria-label="List dialog" flex="80">' +
                    '   <md-dialog-content>' +
                    '       <iframe src="{{ src }}" frameborder="0" width="100%" height="100%"></iframe>' +
                    '   </md-dialog-content>' +
                    '   <md-dialog-actions>' +
                    '       <md-button ng-click="closeDialog()" class="md-primary">' +
                    '          Close Dialog' +
                    '       </md-button>' +
                    '   </md-dialog-actions>' +
                    '</md-dialog>', 
                locals: { src: iframeSrc },
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                escapeToClose: true
               });
           };

           // Fetches adoptable dogs from petfinder api
           // Needs zip code to function 
           vm.getAdoptables = function(breed) {
                if (!vm.currentUser.zipConfirmed) {
                    locationService.getLocation().then(function(result) {
                        vm.currentUser.zip = result;
                        vm.currentUser.zipConfirmed = true;
                        sessionService.setUser(vm.currentUser);
                        retrieveDogs(breed, vm.currentUser.zip);
                    }, function() {
                        locationService.getZipCode().then(function(result) {
                            vm.currentUser.zip = result;
                            vm.currentUser.zipConfirmed = true;
                            sessionService.setUser(vm.currentUser);
                            retrieveDogs(breed, vm.currentUser.zip);
                        }, function() {
                            // Use default
                            vm.currentUser.zip = "20001";
                            sessionService.setUser(vm.currentUser);
                            retrieveDogs(breed, vm.currentUser.zip); 
                        });
                    });
                } else {
                    retrieveDogs(breed, vm.currentUser.zip);
                }
            };

            // Enables user to enter another zip code for the petfinder search
            vm.getNewZipCode = function(breed) {
                locationService.getZipCode().then(function(zip) {
                    vm.currentUser.zip = zip;
                    vm.currentUser.zipConfirmed = true;
                    sessionService.setUser(vm.currentUser);
                    retrieveDogs(breed, vm.currentUser.zip);
                });
            };

            // Enables user to get the detail on an adoptable dog
           vm.showAdoptable = function (event, adoptable) {
               adoptableService.showAdoptable(event, adoptable);
           };

            vm.getDogDetail = function(id) {
               $state.go('detail', {id: id, breed: null});
           };

            // Set up the back-to-top button
            vm.toTop = function() {
                $location.hash('top');
                $anchorScroll();
            };
    });
})();

             

    