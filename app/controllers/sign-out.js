(function() {

    'use strict';

    angular
        .module('app')
        .controller('signOutCtrl', function(authService, $location) {
            authService.signOut();
            $location.path('/');
    }); // End Controller
})();