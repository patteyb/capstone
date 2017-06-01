(function () {
    'use strict';

    angular
        .module('app')
        .factory('searchService', function(dogsFactory, toastService, $q) {

        // Fill breed list for drop down menus
        function loadBreeds() {
            var defer = $q.defer();
            // Passing empty string = get all breeds
            dogsFactory.getBreeds('').then(function(breeds) {
                if (breeds) {
                    defer.resolve( breeds.data );
                } else {
                    toastService.showToast('Unable to get breeds list.');
                    defer.reject();
                }
            });
            return defer.promise;
        }

        return {
            loadBreeds: loadBreeds
        };
    });
})();
