(function () {
    'use strict';

    angular
        .module('app')
        .controller('breedsCtrl', function(dogsFactory, usersFactory, searchService, sessionService, errorHandlerService, toastService, favoritesService, $document, $stateParams, $mdSidenav, $state, $location, $anchorScroll) {
            
            var vm = this;
            var pageTemplate = 'Breeds // ';
            vm.currentUser = sessionService.getUser();
            vm.filters = {};
            vm.isBreedsPage = true;
            vm.height = window.innerHeight;
            vm.offset = 400;
            vm.letter = $stateParams.letter;
            vm.getBreedsByLetter = getBreedsByLetter;
            vm.toTop = toTop;
            vm.getDogDetail = getDogDetail;

            // Set up the side navigation for smaller screen sizes
            vm.toggleLeft = function() {
                $mdSidenav('left').toggle();
            };

            // list of breed objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });


            vm.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V-Z'];

            // User selected a breed to be marked and saved as favorite
            vm.toggleFavorite = function(id, breed) {
                favoritesService.toggleFavorite(id, breed);
            };

            getBreedsByLetter(vm.letter);


            function getBreedsByLetter(letter) {
                vm.letter = letter;
                if (letter === '') {
                    vm.page = pageTemplate + 'All Breeds';
                } else {
                    vm.page = pageTemplate + letter;
                }
                dogsFactory.getBreeds(letter).then(function(dogs) {
                    vm.dogs = dogs.data;
                    // Note which dogs are favorites of user
                    if (vm.currentUser.favorites.length !== 0) {
                        vm.dogs = favoritesService.markFavorites(vm.dogs, vm.currentUser.favorites);
                    }
                });
            }

            // Set up the back-to-top button
            function toTop() {
                $location.hash('top');
                $anchorScroll();
            }

            function getDogDetail(id) {
               $state.go('detail', {id: id, breed: null});
           }

        });   
})();
          