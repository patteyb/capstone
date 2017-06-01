(function () {
    'use strict';

    angular
        .module('app')
        .controller('adminCtrl', function(dogsFactory, usersFactory, searchService, sessionService,  errorHandlerService, toastService, $document, $scope, $http, $state, $mdSidenav, $mdDialog, $anchorScroll, $location) {
            
            var vm = this;
            vm.page = 'Site Admin';
            vm.currentUser = sessionService.getUser();
            vm.users = [];
            vm.favorites = [];
            vm.energyLevel = ['Low', 'Medium', 'High'];
            vm.groomLevel = ['Low', 'Medium', 'High'];
            vm.exercise = ['Low', 'Medium', 'High'];
            vm.size = ['Small', 'Medium', 'Large'];
            vm.shedding = ['No', 'Low', 'Average', 'Profuse'];
            vm.function = ['Companion', 'Guard', 'Hunting', 'Herding', 'Working', 'Sled', 'Sporting'];
            vm.type = ['Bichon', 'Terrier', 'Hound', 'Toy', 'Shepherd', 'Spaniel', 'Retriever', 'Spitz', 'Mastiff', 'Gun dog'];
            vm.sort = "favorites.";
            vm.showForm = false;
            vm.showUserList = false;
            vm.showUserFavs = false;
            vm.editing = false;
            vm.validationErrors = {};
            vm.hasValidationErrors = false;
            vm.showBackToTop = true;
            vm.getDogDetail = getDogDetail;

             // list of breed value/display objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

            // Set up the side navigation for smaller screen sizes
            vm.toggleLeft = function() {
                $mdSidenav('left').toggle();
            };

            // Scrape breed info from AKC website and show it on the editing form
            vm.getBreedInfo = function(breed) {
                vm.showForm = true;
                vm.showUserFavs = vm.showUserList = vm.editing = false;
                dogsFactory.getDogInfo(breed).then(function(dog) {
                    vm.dog = dog;
                    vm.dog.breed = breed;
                    $scope.$apply();
                },
                    function(response) {
                        errorHandlerService.handleError(response, displayValidationErrors);
                });
            };

            // Get record from db and show it on the form to edit
            vm.getDog = function(id) {
                vm.showForm = true;
                vm.editing = true;
                vm.usersFavs = vm.showUserList = false;
                dogsFactory.getDogToEdit(id).then(function(dog) {
                    vm.dog = dog.data;
                });
            };

            vm.showEmptyForm = function() {
                vm.showForm = true;
                vm.editing = vm.usersFavs = vm.showUserList = false;
            };

            // Save new dog to database
            vm.saveDog = function(dog) {
                vm.hasValidationErrors = false;
                dogsFactory.saveDog(dog).then(function() {
                    toastService.showToast(vm.dog.breed + ' has been saved to the database.');
                    vm.showForm = false;
                    vm.dog = {};
                    // Refresh breeds for pull-down lists
                    searchService.loadBreeds().then(function(results) {
                        vm.dbBreeds = results;
                        //vm.apply();
                    });
                },
                    function(response) {
                        errorHandlerService.handleError(response, displayValidationErrors);
                });
            };

            // Update dog in database 
            vm.saveEdit = function(dog) {
                vm.hasValidationErrors = false;
                //check to make sure all required fields exist
                if( dog.breed && dog.energyLevel && 
                    dog.size && dog.shortDesc && 
                    dog.club && dog.clubURL && 
                    dog.grooming && dog.groomIcon && 
                    dog.exercise && dog.exerciseIcon && dog.health ) {

                    dogsFactory.saveEdit(dog).then(function(dog) {
                        vm.dog = dog.data;
                        toastService.showToast(vm.dog.breed + ' has been saved to the database.');
                        vm.showForm = false;
                        vm.editing = false;
                    },
                        function(response) {
                            errorHandlerService.handleError(response, displayValidationErrors);
                    });
                // Fields are missing
                } else {
                    var errorMessages = {
                        message: 'Validation Failed',
                        errors: {}
                    };
                    //errorMessages.status = 400;
                    errorMessages.errors['Missing Fields'] = [{
                        code: 400,
                        message: 'Fields highlighted in red must not be blank.'
                    }];
                    displayValidationErrors(errorMessages);                                        
                }
            };

            // Delete dog from database after confirming deletion
            vm.deleteDog = function(ev, dog) {
                 var confirm = $mdDialog.confirm()
                    .title('Warning: you are about to delete...')
                    .textContent('the ' + dog.breed + '.')
                    .ariaLabel('Delete a breed')
                    .targetEvent(ev)
                    .ok('Ok to delete')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function() {
                    console.log('dog.id: ', dog._id );
                    dogsFactory.deleteDog(dog).then(function() {
                        toastService.showToast(dog.breed + ' has been deleted.');
                        vm.showForm = false;
                        vm.editing = false;
                        vm.dog = {};
                        // Refresh breed list for pull-downs
                        searchService.loadBreeds().then(function(results) {
                            vm.dbBreeds = results;
                            //$scope.apply();
                        });
                    });
                });
            };

            // Create a JSON file containing all dogs in database 
            vm.createDogJSONFile = function() {
                dogsFactory.postDogs().then(function(fileName) {
                    vm.dogFileName = fileName.data;
                    $scope.$apply();
                },
                    function(response) {
                        errorHandlerService.handleError(response, displayValidationErrors);
                });
            };

            // Create a JSON file containing all users in database
            vm.createUserJSONFile = function() {
                usersFactory.postUsers().then(function(fileName) {
                    vm.userFileName = fileName.data;
                    $scope.$apply();
                },
                    function(response) {
                        errorHandlerService.handleError(response, displayValidationErrors);
                });
            };

            // Display all users on screen
            vm.listUsers = function() {
                vm.showUserList = true;
                vm.showForm = vm.showUserFavs = vm.editing = false;
                usersFactory.getUsers().then(function(users) {
                    vm.users = users.data;
                    vm.toTop();
                }, function() {
                    toastService.showToast('Unable to retrieve users.');
                });
            };

            // Show all favorites selected by users
            vm.showFavorites = function() {
                var tempFavs = {};
                    usersFactory.getUsers().then(function(users) {
                        vm.users = users.data;
                        // Compile the counts of favorite breeds
                        for (var i = 0; i < vm.users.length; i++) {
                            for (var j = 0; j < vm.users[i].favorites.length; j++) {
                                var breed = vm.users[i].favorites[j].breed;
                                if (tempFavs.hasOwnProperty(breed)) {
                                    tempFavs[breed] += 1;
                                } else {
                                    tempFavs[breed] = 1;
                                }
                            }
                        }
                        // Create the object to use in displaying info
                        for (var key in tempFavs) {
                            vm.favorites.push({breed: key, count: tempFavs[key]});
                        }
                        vm.showUserFavs = true;
                        vm.showForm = vm.showUserList = vm.editing = false;
                        vm.toTop();
                    });
            };

            // This enables dynamically sorting the favorites list by name or count
            vm.dynamicOrder = function(dogs) {
                var order = 0;
                order = dogs[vm.sort];
                return order;
            };

            // Delete user from database, but first check to make sure administrator is currentUser
            vm.deleteUser = function(ev, user) {
                if ( !vm.currentUser.isAdmin ) {
                    toastService.showToast('You are unauthorized to delete a user.');
                } else {
                    var confirm = $mdDialog.confirm()
                        .title('Warning: you are about to delete...')
                        .textContent(user.fullName + '.')
                        .ariaLabel('Delete a user')
                        .targetEvent(ev)
                        .ok('Ok to delete')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function() {
                        usersFactory.deleteUser(user).then(function() {
                            toastService.showToast(user.fullName + ' has been deleted.');
                            vm.listUsers();
                        }, function(response) {
                            errorHandlerService.handleError(response, displayValidationErrors);
                        });
                    });
                }
            };

            // Cancel out of editing
            vm.cancel = function() {
                vm.editing = false; 
                vm.showForm = false;
                vm.dog = {};
                resetValidationErrors();
            };

            // Set up the back-to-top button
            vm.toTop = function() {
                $location.hash('top');
                $anchorScroll();
            };

            function getDogDetail(id) {
               $state.go('detail', {id: id, breed: null});
           }

            function displayValidationErrors(validationErrors) {
                vm.validationErrors = validationErrors.errors;
                vm.hasValidationErrors = true;
            }

            function resetValidationErrors() {
                vm.validationErrors = {};
                vm.hasValidationErrors = false;
            }


        });
})();