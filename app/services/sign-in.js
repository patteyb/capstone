(function () {
    'use strict';

    angular
        .module('app')
        .factory('signInService', function(sessionService, validationService, usersFactory, $mdDialog) {

        function showPrompt(ev) {
            var status = '';
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .title('What would you name your dog?')
                .textContent('Bowser is a common name.')
                .placeholder('Dog name')
                .ariaLabel('Dog name')
                .initialValue('Buddy')
                .targetEvent(ev)
                .ok('Okay!')
                .cancel('I\'m a cat person');

            $mdDialog.show(confirm).then(function(result) {
                status = 'You decided to name your dog ' + result + '.';
            }, function() {
                status = 'You didn\'t name your dog.';
            });

            return status;
        }

        return {
                getshowPrompt: showPrompt,
            };
    });
})();
