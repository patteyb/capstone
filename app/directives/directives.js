(function(angular) {

    'use strict';

    angular.module('app')
    .directive('bestOf', function(){
        return {
            templateUrl: 'templates/best-of.html',
            replace: false,
            controller: 'bestOfCtrl'
        };
    })
    .directive('compareFavorites', function(){
        return {
            templateUrl: 'templates/compare-favorites.html',
            replace: false,
            controller: 'accountCtrl'
        };
    })
    .directive('compareRescues', function(){
        return {
            templateUrl: 'templates/compare-rescues.html',
            replace: false,
            controller: 'accountCtrl'
        };
    })
    .directive('dogCard', function(){
        return {
            templateUrl: '/templates/dog-card.html',
            replace: false,
            controller: 'breedsCtrl'
        };
    })
    .directive('dogCardShort', function(){
        return {
            templateUrl: 'templates/dog-card-short.html',
            replace: false,
            controller: 'breedsCtrl'
        };
    })
    .directive('dogForm', function(){
        return {
            templateUrl: 'templates/dog-form.html',
            replace: false,
            controller: 'adminCtrl'
        };
    })
    .directive('footerBar', function(){
        return {
            templateUrl: '/templates/footer.html',
            replace: false
        };
    })
    .directive('elementSize', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.ready(function () {
                    scope.$watch(
                        function () { return element[0].clientHeight; },
                        function (newValue, oldValue) {
                            var height, width;
                            if (newValue !== oldValue) {
                                $timeout(function() {
                                    height  = element[0].clientHeight;
                                    width  = element[0].clientWidth;
                                    if (attrs.key) {
                                        scope[attrs.key] = {
                                            height: height,
                                            width: width
                                        };
                                    } else {
                                        scope.elementSize = {
                                            height: height,
                                            width: width
                                        };
                                    }
                                });
                            }
                        }
                    );  
                });
            }
        }; 
    })
    .directive('shelter', function(){
        return {
            templateUrl: '/templates/shelter.html',
            replace: false
        };
    })
    .directive('toolbar', function(){
        return {
            restrict: 'E',
            /*scope: {
                page: '@'
            },*/
            templateUrl: '/templates/toolbar.html',
            /*link: function($scope, elem, attrs) {
                $scope.page = attrs.page;
            },*/
            replace: false
        };
    })
    .directive('menu', function() {
        return {
            templateUrl: '/templates/menu.html',
            replace: false
        };
    })
    .directive('userFavorites', function(){
        return {
            templateUrl: 'templates/user-favorites.html',
            replace: false,
            controller: 'adminCtrl'
        };
    })
    .directive('userList', function(){
        return {
            templateUrl: 'templates/user-list.html',
            replace: false,
            controller: 'adminCtrl'
        };
    })
    .directive('validationErrors', function() {
        var controller = ['$scope', function($scope) {
            $scope.$watch('errors', function(newValue, oldValue) {
            var errorsToDisplay = [];

            if (newValue) {
                for (var key in newValue) {
                    if (newValue.hasOwnProperty(key)) {
                        errorsToDisplay = errorsToDisplay.concat(newValue[key]);
                    }
                }
            }

            $scope.errorsToDisplay = errorsToDisplay;
            });
        }];

        return {
            restrict: 'E',
            scope: {
            errors: '='
            },
            controller: controller,
                templateUrl: 'templates/validation-errors.html'
            };
    });

})(window.angular);