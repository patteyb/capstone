(function() {

    'use strict';

    angular
        .module('app')
        .controller('signInCtrl', function(authService, searchService, errorHandlerService, $document, $scope, $http, usersFactory, $mdSidenav, $location, $state) {
            //var _this = this;
            var vm = this;

            vm.emailAddress = '';
            vm.password = '';
            vm.validationErrors = {};
            vm.hasValidationErrors = false;
            vm.signIn = signIn;
            vm.getDogDetail = getDogDetail;
            vm.height = window.innerHeight;

            // list of breed objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });
            
            function signIn() {
                authService.signIn(vm.emailAddress, vm.password).then(
                    function() {
                        $location.path('/');
                    },
                    function(response) {
                        errorHandlerService.handleError(response, displayValidationErrors);
                    });
            }

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

        }); // End Controller
})();