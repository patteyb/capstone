(function() {
    'use strict';

    angular
        .module("app")
        .factory('dogsFactory', function($http, $sce, $q) {

            function getDogs() {
                return $http.get('api/dogs');
            }

            function postDogs() {
                return $http.post('api/dogs/file');
            }

            function getDog(id) {
                return $http.get('api/dogs/detail?id=' + id);
            }

            function getDogByBreed(breed) {   
                return $http.get('api/dogs/detail?breed=' + breed);
            }

            function getBestOfDogs(list) {   
                return $http.get('api/dogs/bestOf?list=' + list);
            }

            function getVideos(breed) {
                var url = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyC9fO8vW7pPyIRlafuzg9O4T-sm5TJ3kPo&part=snippet&q=" + breed + "&maxResults=3";
                return $http.get(url);
            }

            function getFavorites(idArray) {
                var url = 'api/dogs/account/favorites';
                if (idArray.length !== 0) {
                    url += '?';
                    var last = idArray.length - 1;
                    for( var i =0; i < idArray.length; i++) {
                        url += 'id' + i + '=' + idArray[i];
                        if (i !== last) {
                            url += '&';
                        }
                    }
                    return $http.get(url);            
                }
            }

            function getRescues(idArray) {
                //var defer = $q.defer();
                var promises = idArray.map( function( id ) {
                    var url = 'https://api.petfinder.com/pet.get?key=d93ef8fff402f8bfe597a1e1613c9b4b&id=' + id + '&format=json';
                    return $http.jsonp(url);
                });
                return $q.all(promises);
            }

            function getRandomRescue(zip) {
                var url = 'https://api.petfinder.com/pet.getRandom?key=d93ef8fff402f8bfe597a1e1613c9b4b&animal=dog&location=' + zip + '&output=full&format=json';
                return $http.jsonp(url);
            }

            function getShelters(zip) {
                var url = 'https://api.petfinder.com/shelter.find?key=d93ef8fff402f8bfe597a1e1613c9b4b&animal=dog&location=' + zip + '&format=json';
                return $http.jsonp(url);
            }

            function getShelterPets(id) {
                var url = 'https://api.petfinder.com/shelter.getPets?key=d93ef8fff402f8bfe597a1e1613c9b4b&id=' + id + '&format=json';
                return $http.jsonp(url);
            }

            function  getDogToEdit(id) {          
                return $http.get('api/dogs/admin/' + id);
            }

            function saveDog(dog) {
                return $http.post('api/dogs', dog);
            }

            function saveEdit(dog) {
                return $http.put('api/dogs/admin', dog);
            }

            function deleteDog(dog) {
                console.log('In deleteDog()', dog._id);
                return $http.delete('api/dogs/admin/dogs/' + dog._id);
            }

            function getBreeds(letter) {
                return $http.get('api/dogs/breeds/' + letter);
            }


            function getBreedsFromPetfinder() {
                var url = 'https://api.petfinder.com/breed.list?key=d93ef8fff402f8bfe597a1e1613c9b4b&animal=dog&format=json';

                $http.jsonp(url).success(function(breedlist) {
                    return breedlist.petfinder.breeds.breed; 
                });
            } 

            function getDogInfo(breed) {
                return new Promise(function(resolve, reject) {
                    var dog = {};
                    getBreedHtml(breed).then(function(html) {
                        dog = getBreedInfoFromHtml(html);
                        resolve(dog);
                    }, function(err) {
                        err.message = ("Couldn't retrieve html for " + breed);
                        reject(err);
                    });
                });  
            }

            function getBreedHtml(breed) {
                return new Promise(function(resolve, reject) {
                    if (breed == null || breed == '') {
                        reject();
                    } else {
                        var breed1 = breed.replace(' ', '-');
                        var breed2 = breed1.replace(' ', '-');
                        var breed3 = breed2.replace(' ', '-');
                        var url = 'https://www.akc.org/dog-breeds/' + breed3 + '/';
                        resolve( $http.get(url) );
                    }
                });
            }

            function getFilteredDogs(filters) {
                var filterQry = '?';
                for (var key in filters) {
                    if ( filters[key] !== "" ) {
                        filterQry += key + '=' + filters[key] + '&';
                    }
                }
                if (filterQry.lastIndexOf('&') === filterQry.length-1) {
                    filterQry = filterQry.substr(0, filterQry.length-1);
                }
                return $http.get('api/dogs/filtered' + filterQry);
            }

            function getAdoptables(breed, zip) {
                return new Promise(function(resolve, reject) {   
                    var url = 'https://api.petfinder.com/pet.find?key=d93ef8fff402f8bfe597a1e1613c9b4b&animal=dog&breed=' + breed + '&location=' + zip + '&format=json';

                    $http.jsonp(url).then(function(adoptables) {
                        if (adoptables.data.petfinder.pets.pet) {
                            var petfinderDogs = adoptables.data.petfinder.pets.pet;
                            var dogs = [];
                            var castoffDogs = [];
                            var lcName;
                            // move dogs that are primarily the desired breed to the top of the list
                            for (var i = 0; i < petfinderDogs.length; i++) {
                                lcName = petfinderDogs[i].name.$t.toLowerCase();
                                if (!lcName.includes('pending')) {
                                    if (Array.isArray(petfinderDogs[i].breeds.breed)) {
                                        // Save if first breed listed in array matches our breed 
                                        if (petfinderDogs[i].breeds.breed[0].$t === breed) {
                                            dogs.push(petfinderDogs[i]);
                                        } else {
                                            castoffDogs.push(petfinderDogs[i]);
                                        }
                                    } else {
                                        // Dog has only one breed listed, so keep the dog
                                        dogs.push(petfinderDogs[i]);
                                    }
                                }
                            }
                            // Fill array so that there are ten dogs to show
                            if (dogs.length < 10) {
                                for ( i = dogs.length; i < 10; i++) {
                                    dogs.push(castoffDogs[i]);
                                }
                            }
                            resolve( dogs );
                        } else {
                            reject();
                        }
                    }, function() {
                        reject();
                    });
                });
            }

            function getBreedInfoFromHtml(html) {
                var dog = {};  
                var data = html.data;
                var index = data.indexOf('<div class="index-only">') + 24;
                data = data.slice(index).trim();
                index = data.indexOf('<img src="') + 10;
                data = data.slice(index).trim();
                index = data.indexOf('"');
                dog.imageURL = data.substring(0, index).trim();

                index = data.indexOf('<span class="energy_levels">') + 28;
                data = data.slice(index).trim();
                index = data.indexOf(' ');
                dog.energyLevel = data.substring(0, index).trim();
                dog.energyLevel = capitalize(dog.energyLevel);

                index = data.indexOf('<span class="size"><br />') + 26;
                data = data.slice(index).trim();
                index = data.indexOf(' ');
                dog.size = data.substring(0, index).trim();
                dog.size = capitalize(dog.size);

                index = data.indexOf('<div class="bigrank">') + 21;
                data = data.slice(index).trim();
                index = data.indexOf('<');
                dog.akcRank = data.substring(0, index).trim();

                index = data.indexOf('<span class="info">') + 19;
                data = data.slice(index).trim();
                index = data.indexOf('<');
                dog.shortDesc = data.substring(0, index).trim();

                index = data.indexOf('readonly" name="embed"><iframe src="') + 36;
                data = data.slice(index).trim();
                index = data.indexOf('"');
                dog.breedStandard = data.substring(0, index).trim();

                index = data.indexOf('<br />Grooming</h3>') + 19;
                data = data.slice(index).trim();
                data = data.slice(3);
                index = data.indexOf('</p>');
                dog.grooming = data.substring(0, index).trim();

                index = data.indexOf('<h3>Exercise</h3>') + 17;
                data = data.slice(index).trim();
                data = data.slice(3);
                index = data.indexOf('</p>') ;
                dog.exercise = data.substring(0, index).trim();

                index = data.indexOf('<h3>Health</h3>') + 15;
                data = data.slice(index).trim();
                data = data.slice(3);
                index = data.indexOf('</p>');
                dog.health = data.substring(0, index).trim();

                index = data.indexOf('<h3>National<br />Breed Club</h3>') + 33;
                data = data.slice(index).trim();
                index = data.indexOf('<h2><small>the</small>') + 22;
                data = data.slice(index);
                index = data.indexOf('</h2>');
                dog.club = data.substring(0, index).trim();

                index = data.indexOf('<a target="_blank" href=') + 25;
                data = data.slice(index).trim();
                index = data.indexOf('" class=');
                dog.clubURL = data.substring(0, index).trim();

                return dog;
            }

            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            
            return {
                getDogs: getDogs,
                postDogs: postDogs,
                getDog: getDog,
                getDogByBreed: getDogByBreed,
                getBestOfDogs: getBestOfDogs,
                getVideos: getVideos,
                getFavorites: getFavorites,
                saveDog: saveDog,
                saveEdit: saveEdit,
                deleteDog: deleteDog,
                getBreeds: getBreeds,
                getBreedsFromPetfinder: getBreedsFromPetfinder,
                getDogToEdit: getDogToEdit,
                getDogInfo: getDogInfo,
                getFilteredDogs: getFilteredDogs,
                getAdoptables: getAdoptables,
                getRescues: getRescues,
                getRandomRescue: getRandomRescue,
                getShelters: getShelters,
                getShelterPets: getShelterPets
            };
        });
})();