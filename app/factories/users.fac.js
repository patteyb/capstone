(function() {
    'use strict';

    angular
        .module("app")
        .factory('usersFactory', function($http) {

            function getUsers() {
                return $http.get('api/dogs/users');
            }

            function postUsers() {
                return $http.post('api/users/file');
            }

            function getUser(user) {
                var header = "Basic " + window.btoa(unescape(encodeURIComponent(user.emailAddress + ":" + user.password)));
                return $http.get('api/dogs/signin', {
                    headers: {
                        "Authorization": header
                    }
                });
            }

            function createUser(user) {
                return $http.post('api/dogs/signup', user);
            }

            function updateUser(key, user) {
                if (key === 'fullName') {
                    return $http.put('api/dogs/account/fullName', user);
                } else {
                    return $http.put('api/dogs/account/emailAddress', user);
                }
            }

            function deleteUser(user) {
                return $http.delete('api/dogs/admin/users/' + user._id);
            }

            function updatePassword(user) {
                return $http.put('api/dogs/account/password', user);
            }

            function lookupUser(user) {
                return $http.get('api/dogs/signup', user);
            }

            function getFavorites() {
                return $http.get('api/dogs/favorites');
            }

            function addFavorite(user, dogId) {
                return $http.put('api/dogs/fav/' + user._id + '/'  + dogId);
            }

            function deleteFavorite(user, dogId) {
                return $http.delete('api/dogs/fav/' + user._id + '/'  + dogId);
            }

            function addRescue(dogId, userId) {
                return $http.put('api/dogs/detail/rescue/' + userId + '/'  + dogId );
            }

            function deleteRescue(dogId, userId) {
                return $http.delete('api/dogs/detail/rescue/' + userId + '/'  + dogId );
            }

            return {
                getUsers: getUsers,
                postUsers: postUsers,
                getUser: getUser, 
                createUser: createUser,
                updateUser: updateUser,
                updatePassword: updatePassword,
                deleteUser: deleteUser,
                lookupUser: lookupUser,
                getFavorites: getFavorites,
                addFavorite: addFavorite,
                deleteFavorite: deleteFavorite,
                addRescue: addRescue,
                deleteRescue: deleteRescue
            };
        });
})();