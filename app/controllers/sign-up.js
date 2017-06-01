(function() {

    'use strict';

    angular
        .module('app')
        .controller('signUpCtrl', function(usersFactory, authService, searchService, errorHandlerService, $document, $mdSidenav, $location, $state) {

            var vm = this;

            vm.fullName = '';
            vm.emailAddress = '';
            vm.password = '';
            vm.confirmPassword = '';
            vm.validationErrors = {};
            vm.hasValidationErrors = false;
            vm.signUp = signUp;
            vm.getDogDetail = getDogDetail;
            vm.height = window.innerHeight;

           // list of breed objects to set up search box
            searchService.loadBreeds().then(function(results) {
                vm.dbBreeds = results;
            });

             function signUp() {
                var user = {
                    fullName: vm.fullName,
                    emailAddress: vm.emailAddress,
                    password: vm.password,
                    confirmPassword: vm.confirmPassword
                };

                authService.signUp(user).then(
                    function() {
                        vm.currentUser = user;
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