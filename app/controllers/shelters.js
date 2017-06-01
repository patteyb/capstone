(function () {
    'use strict';

    angular
        .module('app')
        .controller('sheltersCtrl', function(dogsFactory, sessionService, searchService, locationService, adoptableService, toastService, errorHandlerService, $document, $scope, $mdDialog, $stateParams, $state, $location, $anchorScroll) {
            
            var vm = this;
            vm.page = 'Shelters';
            vm.zip = $stateParams.zip;
            vm.currentUser = sessionService.getUser();
            vm.shelters = [];
            //vm.showBackToTop = true;
            vm.getshelters = getShelters;
            vm.getShelterPets = getShelterPets;
            vm.getDogDetail = getDogDetail;
            vm.getNewZipCode = getNewZipCode;
            vm.toTop = toTop;
            vm.height = window.innerHeight;
            vm.offset = 200;
            vm.getDogDetail = getDogDetail;

             // list of breed objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

            // Retrieve shelters from petfinder api
            getShelters(vm.currentUser.zip).then(function(shelters) {
                vm.shelters = shelters;
                $scope.$apply();
            }, function() {
                vm.shelters = [];
                $scope.$apply();
            });


           function getShelters(zip) {
               return new Promise(function(resolve, reject) {
                    dogsFactory.getShelters(zip).then(function(shelters) {
                        if (shelters.data.petfinder.shelters) {
                            resolve( shelters.data.petfinder.shelters.shelter );
                        } else {
                            reject();
                        }
                    }, function() {
                        toastService.showToast("Sorry, we're unable to find shelters at this time.");
                        reject();
                    });
                });
           }

           // Retrieve pets for a shelter from petfinder api
            function getShelterPets(event, shelterName, shelterId) {
                dogsFactory.getShelterPets(shelterId).then(function(pets) {
                    var animals = pets.data.petfinder.pets.pet;
                    showAnimals(event, shelterName, animals);  
                }, function() {
                    toastService.showToast("Sorry, we're unable to get pets at this time.");
                });
            }

            // Show animals that are associated with a shelter
            function showAnimals(event, shelterName, animals) {
               $mdDialog.show({
                controller: ['$scope', 'shelterName', 'animals', function($scope, shelterName, animals) {
                    $scope.animals = animals;
                    $scope.shelterName = shelterName;
                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };
                }],
                template: 
                    '<md-dialog class="std-dialog" aria-label="List dialog" flex="40">' +
                    '   <md-dialog-content layout-padding layout-margin layout-align="center center">' +
                    '       <div class="md-title">Animals at {{ shelterName }}</div>' +
                    '       <span ng-if="!animals">This shelter has no animals listed with Petfinder.com.</span>' +
                    '       <table ng-if="animals" class="fav-table">' +
                    '           <tr>' +
                    '               <th></th>' +
                    '               <th>Animal</th>' +
                    '               <th>Breeds</th>' +
                    '               <th>Name</th>' +
                    '               <th>Age</th>' +
                    '               <th>Sex</th>' +
                    '               <th>Size</th>' +
                    '           </tr>' +
                    '           <tr ng-repeat="animal in animals">' +
                    '               <td><img ng-src="{{animal.media.photos.photo[0].$t}}"></td>' +
                    '               <td>{{ animal.animal.$t }}</td>' +
                    '               <td class="center">' +
                    '                   <span ng-if="animal.breeds.breed.$t">{{ animal.breeds.breed.$t }}</span>' +
                    '                   <span ng-if="animal.breeds.breed[0].$t">{{ animal.breeds.breed[0].$t }}</span>' +
                    '                   <span ng-if="animal.breeds.breed[1].$t">, {{ animal.breeds.breed[1].$t }}</span>' +
                    '               </td>' +
                    '               <td class="center">{{ animal.name.$t }}</td>' +
                    '               <td class="center">{{ animal.age.$t }}</td>' +
                    '               <td class="center">{{ animal.sex.$t }}</td>' +
                    '               <td class="center">{{ animal.size.$t }}</td>' +
                    '           </tr>' +
                    '       </table>' +
                    '   </md-dialog-content>' +
                    '   <md-dialog-actions>' +
                    '       <md-button ng-click="closeDialog()" class="md-primary">' +
                    '          Close Dialog' +
                    '       </md-button>' +
                    '   </md-dialog-actions>' +
                    '</md-dialog>', 
                locals: { shelterName: shelterName, animals: animals },
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                escapeToClose: true
               });
           }

           // Enable user to enter a different zip code
           function getNewZipCode() {
               locationService.getZipCode().then(function(zip) {
                   getShelters(zip).then(function(shelters) {
                        vm.shelters = shelters;
                        $scope.$apply();
                    }, function() {
                        vm.shelters = [];
                        $scope.$apply();
                    });
               }, function() {
                   toastService.showToast('Action cancelled.');
               });
           }

            function getDogDetail(id) {
               $state.go('detail', {id: id, breed: null});
           }

           // Set up the back-to-top button
            function toTop() {
                $location.hash('top');
                $anchorScroll();
            }

        });
})();