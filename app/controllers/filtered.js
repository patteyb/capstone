(function () {
    'use strict';

    angular
        .module('app')
        .controller('filteredCtrl', function(dogsFactory, usersFactory, sessionService, searchService, errorHandlerService, toastService, favoritesService, $document, $state, $mdSidenav, $anchorScroll, $location) {
            
            var vm = this;
            vm.page = 'Dog Breeds // Filtered';
            vm.currentUser = sessionService.getUser();
            vm.filters = {};
            vm.isFilteredPage = true;
            vm.letter = 'A';
            vm.height = window.innerHeight;

            // list of breed objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

            dogsFactory.getDogs().then(function(dogs) {
                vm.dogs = dogs.data;
                if (vm.currentUser.favorites.length !== 0) {
                    vm.dogs = favoritesService.markFavorites(vm.dogs, vm.currentUser.favorites);
                }
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

            // User selected a breed to be marked and saved as favorite
            vm.toggleFavorite = function(id, breed) {
                favoritesService.toggleFavorite(id, breed);
            };

            // Set up the back-to-top button
            vm.toTop = function() {
                $location.hash('top');
                $anchorScroll();
            };

            // Retrieve dogs from db that fit the filters
            vm.getFilteredDogs = function(filters) {
                dogsFactory.getFilteredDogs(filters).then(function(dogs) {
                    vm.dogs = dogs.data;
                    // Mark dogs that are among the user's favorites
                    if (vm.currentUser.favorites.length !== 0) {
                        favoritesService.markFavorites(vm.dogs, vm.currentUser.favorites);
                    }
                });
            };

           // Clear all filters and display all dogs in db
           vm.clearFilters = function() {
               vm.filters = {};
               dogsFactory.getDogs().then(function(dogs) {
                    vm.dogs = dogs.data;
                    if (vm.currentUser.favorites.length !== 0) {
                        favoritesService.markFavorites(vm.dogs, vm.currentUser.favorites);
                    }
                });
           };

            vm.getDogDetail = function(id) {
               $state.go('detail', {id: id, breed: null});
           };

        });   
})();
           