(function () {
    'use strict';

    angular
        .module('app')
        .controller('accountCtrl', function(dogsFactory, usersFactory, searchService, sessionService,  errorHandlerService, toastService, $mdSidenav, $state, $document, $anchorScroll, $location) {
            
            var vm = this;
            vm.page = 'Account';
            vm.currentUser = sessionService.getUser();
            vm.editPassword = false;
            vm.editFullName = false;
            vm.editEmailAddress = false;
            vm.password = '';
            vm.confirmPassword = '';
            vm.validationErrors = {};
            vm.hasValidationErrors = false;
            vm.favorites = vm.currentUser.favorites;
            vm.sort = 'fav.breed';
            vm.count = 0;
            vm.height = window.innerHeight; // Needed for back-to-top button
            vm.offset = 150;                // Needed for back-to-top button
            vm.getDogDetail = getDogDetail;
            vm.toTop = toTop;

            vm.switchPhoto = function(parentPhoto, photo) {
                vm.rescueDogs[parentPhoto].mainPhoto = vm.rescueDogs[parentPhoto].photos[photo];
                console.log(vm.rescueDogs[parentPhoto]);
            }; 

            // list of breed value/display objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

            // Set up the side navigation for smaller screen sizes
            vm.toggleLeft = function() {
                $mdSidenav('left').toggle();
            };

            // If user has favorites, get them
            if (vm.currentUser.favorites.length !== 0) {
                dogsFactory.getFavorites(vm.currentUser.favorites).then(function(dogs) {
                    if (dogs) {
                        vm.favDogs = dogs.data;
                    } else {
                        vm.favDogs = {};
                    } 
                });
            }
    
            // If user has rescues saved, get them and format them for display
            if (vm.currentUser.rescues.length !== 0) {
                dogsFactory.getRescues( vm.currentUser.rescues ).then(function(dogs) {
                    if (dogs.length !== 0) {
                        var list = [];
                        // Remove empty objects indicating a fail-to-find on Petfinder
                        for( var i = 0; i < dogs.length; i++) {
                            if (dogs[i].data.petfinder.pet) {
                                list.push( dogs[i].data.petfinder.pet );
                            } 
                        }
                        // Remove from user's list any dogs no longer in Petfinder's system
                        if ( list.length < vm.currentUser.rescues.length ) {
                            vm.count++;
                            removeDefunctRescues( list );
                        }
                        // Format fields for display
                        for( i = 0; i < list.length; i++ ) {
                            formatDog(list[i]);
                        }
                        vm.rescueDogs = list;
                    }
                }, function() {
                    toastService('Unable to get rescues at this time.');
                });
            }

            // This enables dynamically sorting the favorites list by user
            vm.dynamicOrder = function(dogs) {
                var order = 0;
                order = dogs[vm.sort];
                return order;
            };

            vm.openInputField = function(inputElement) {
                vm.fullName='true';
                document.getElementById(inputElement).focus();
            };

            // Updates user's name and/or email
            vm.updateUser = function(key, user) {
                resetValidationErrors();
                vm.currentUser[key] = user[key];
                usersFactory.updateUser(key, vm.currentUser).then(function() {
                    sessionService.setUser(vm.currentUser);
                    vm[key] = false;
                    if (key === 'fullName') {
                        key = 'name';
                    } else if (key === 'emailAddress') {
                        key = 'email address';
                    }
                    toastService.showToast('Your ' + key + ' has been updated');
                }, function(response){
                        errorHandlerService.handleError(response, displayValidationErrors);
                    });         
            };

            // Update user's password
            vm.updatePassword = function(password, confirmPassword) {
                resetValidationErrors();
                // If confirm password and password fields don't match, set up error message
                if (password !== confirmPassword) {
                    var errorMessage = {
                        message: 'Unmatched passwords',
                        errors: [{ 
                            code: 400,
                            message: 'Password and Confirm Password do not match.'
                        }]
                    };
                    var response = {
                        status: 400,
                        data: errorMessage
                    };
                    errorHandlerService.handleError(response, displayValidationErrors);
                // Passwords match => update record
                } else {
                    vm.currentUser.password = password;
                    usersFactory.updatePassword(vm.currentUser).then(function(user) {
                        sessionService.setUser(user);
                        vm.password = false;
                        toastService.showToast('Your password has been updated');
                    }, function(response){
                        errorHandlerService.handleError(response, displayValidationErrors);
                    });
                }
            };

            // Allows user to cancel out of editing their account info
            vm.cancel = function(drawer) {
                vm[drawer] = false;
            };

            // Remove favorite breed from user's list
            vm.deleteFavorite = function(dog) {
                // Need to delete from db and also currentUser
                usersFactory.deleteFavorite(vm.currentUser, dog._id, 'account', 'favorites').then(function() {
                    vm.currentUser.favorites.splice(vm.currentUser.favorites.indexOf(dog._id), 1);
                    var index = -1;
                    // Re-establish vm.favDogs to display on page
                    for (var i = 0; i < vm.favDogs.length; i++) {
                        if (vm.favDogs[i]._id === dog._id) {
                            index = i;
                            i = vm.favDogs.length;
                        }
                    }
                    vm.favDogs.splice(index, 1);
                    // Update currentUser 
                    sessionService.setUser(vm.currentUser);
                });
            };

            // Delete rescue dog from user's saved list
            // Need to delete from db and also currentUser, then update vm.rescueDogs for displaying to page
            vm.deleteRescue = function(dogId, removeFromDisplay ) {
                usersFactory.deleteRescue(dogId, vm.currentUser._id).then(function() {
                    vm.currentUser.rescues.splice(vm.currentUser.rescues.indexOf(dogId), 1);
                    if (removeFromDisplay) {
                        var index = -1;
                        for (var i = 0; i < vm.rescueDogs.length; i++) {
                            if (vm.rescueDogs[i].id.$t === dogId) {
                                index = i;
                                i = vm.rescueDogs.length;
                            }
                        }
                        vm.rescueDogs.splice(index, 1);
                    }
                    sessionService.setUser(vm.currentUser);
                });
            };

            function removeDefunctRescues( list ) {
                var count = 0;
                for (var i = 0; i < list.length; i++ ) {
                    if (vm.currentUser.rescues.indexOf(list[i]) === -1) {
                        count++;
                        vm.deleteRescue(list[i], false);
                    }
                }
                vm.count = count;
            }

            function formatDog(dog) {
                if (dog.status) {
                    var status = dog.status.$t;
                    if (status === 'A') {
                        status = 'Adoptable';
                    } else if (status === 'H') {
                        status = 'Hold';
                    } else if (status === 'P') {
                        status = 'Pending';
                    } else {
                        status = 'Adopted/Removed';
                    }
                    dog.status.$t = status;
                }
                if (dog.lastUpdate) {
                    var index = dog.lastUpdate.$t.indexOf('T');
                    if (index != -1) {
                        dog.lastUpdate.$t = dog.lastUpdate.$t.slice(0, index);
                    }
                }
                if (dog.options.option) {
                    dog.hasOptions = true;
                    if (!Array.isArray(dog.options.option)) {
                        // There is only one option stored as a string.
                        // Change format to be an Array
                        var obj = {
                            $t: dog.options.option.$t
                        };
                        dog.options.option = [];
                        dog.options.option.push(obj);
                    }
                    for (var j = 0; j < dog.options.option.length; j++) {
                        if (dog.options.option[j].$t === 'housetrained') {
                            dog.options.option[j].$t = 'House-trained';
                        } else if (dog.options.option[j].$t === 'specialNeeds') {
                            dog.options.option[j].$t = 'Special needs';
                        } else if (dog.options.option[j].$t === 'noCats') {
                            dog.options.option[j].$t = 'Not good with cats';
                        } else if (dog.options.option[j].$t === 'noDogs') {
                            dog.options.option[j].$t = 'Not good with other dogs';
                        } else if (dog.options.option[j].$t === 'altered') {
                            dog.options.option[j].$t = 'Has been spayed/neutered';
                        } else if (dog.options.option[j].$t === 'hasShots') {
                            dog.options.option[j].$t = 'Vaccinations are up-to-date';
                        }
                    }
                } else {
                    dog.hasOptions = false;
                }
                if (dog.media.photos.photo) {
                    var photoArray = [];
                    var mainPhoto = '';
                    var photo = {};
                    for (var k = 0; k < dog.media.photos.photo.length; k++) {
                        if (dog.media.photos.photo[k]['@size'] === 'x') {
                            if (mainPhoto === '') {
                                mainPhoto = dog.media.photos.photo[k].$t;
                            }
                            photoArray.push(dog.media.photos.photo[k].$t);
                        }
                    }
                    dog.mainPhoto = mainPhoto;
                    dog.photos = photoArray;
                }

                if (dog.breeds.breed) {
                    dog.breedArray = [];
                    if (!Array.isArray(dog.breeds.breed)) {
                        dog.breedArray.push(dog.breeds.breed.$t);
                    } else {
                        for (var i = 0; i < dog.breeds.breed.length; i++) {
                            dog.breedArray.push(dog.breeds.breed[i].$t);
                        }
                    }
                }

                if (dog.sex.$t && dog.sex.$t !== '') {
                    if ( dog.sex.$t.toUpperCase() === 'M') {
                        dog.sex.$t = "Male";
                    } else {
                        dog.sex.$t = 'Female';
                    }
                }

                if (dog.size.$t && dog.size.$t !== '') {
                    if (dog.size.$t.toUpperCase === 'S') {
                        dog.size.$t = "Small";
                    } else if (dog.size.$t.toUpperCase === 'M') {
                        dog.size.$t = 'Medium';
                    } else {
                        dog.size.$t = 'Large';
                    }
                }


            }

            function getDogDetail(id) {
                $state.go('detail', {id: id, breed: null});
            }


            // Error Handling
            function displayValidationErrors(validationErrors) {
                vm.validationErrors = validationErrors.errors;
                vm.hasValidationErrors = true;
            }

            // Error Handling
            function resetValidationErrors() {
                vm.validationErrors = {};
                vm.hasValidationErrors = false;
            }

            // Set up the back-to-top button
            function toTop() {
                $location.hash('top');
                $anchorScroll();
            }

    });
})();