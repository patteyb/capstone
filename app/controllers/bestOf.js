(function () {
    'use strict';

    angular
        .module('app')
        .controller('bestOfCtrl', function(dogsFactory, usersFactory, searchService, sessionService,  errorHandlerService, toastService, favoritesService, $mdSidenav, $state, $document, $stateParams, $anchorScroll, $location) {

        var vm = this;
        vm.page = 'Best Dogs';
        vm.listType = $stateParams.list;
        vm.currentUser = sessionService.getUser();
        vm.getBestOf = getBestOf;
        vm.toTop = toTop;
        vm.showBackToTop = true;
        vm.offset = 600;
        vm.height = window.innerHeight;
        vm.getDogDetail = getDogDetail;

        // list of breed objects to set up search box
        searchService.loadBreeds().then(function(results) {
            vm.dbBreeds = results;
        });

        // Set up the side navigation for smaller screen sizes
        vm.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };

        // Get the dogs that meet the specific best-of parameter
        if (vm.listType) {
            getBestOf(vm.listType).then(function(dogs) {
                vm.dogs = dogs.data;
                if (vm.currentUser.favorites.length !== 0) {
                    vm.dogs = favoritesService.markFavorites(vm.dogs, vm.currentUser.favorites);
                }
            });
        }

        // Get list selected from secondary menu
        vm.getList = function( list ) {
            vm.listType = list;
            dogsFactory.getBestOfDogs(list).then(function(dogs) {
                vm.dogs = dogs.data;
                if (vm.currentUser.favorites.length !== 0) {
                    vm.dogs = favoritesService.markFavorites(vm.dogs, vm.currentUser.favorites);
                }
            });
        };

        // User selected a breed to be marked and saved as favorite
        vm.toggleFavorite = function(id, breed) {
            favoritesService.toggleFavorite(id, breed);
        };

        function getBestOf( list ) {
            return new Promise(function(resolve, reject) {
                dogsFactory.getBestOfDogs(list).then(function(dogs) {
                    vm.dogs = dogs.data;
                    resolve(dogs);
                }, function() {
                    reject();
                });
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