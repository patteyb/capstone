(function() {

    'use strict';

    angular.module('app', ['ngSanitize', 'ngAnimate', 'ngAria', 'ngMaterial', 'ui.router']).config(function($mdThemingProvider, $stateProvider, $urlRouterProvider, $sceDelegateProvider) {

        $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://www.youtube.com/**', 'https://api.petfinder.com/**']);

        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('blue-grey')
            .backgroundPalette('grey', {'default': '200'});

        $mdThemingProvider.theme('dark-teal')
            .primaryPalette('teal')
            .accentPalette('cyan')
            .backgroundPalette('teal').dark();

        $mdThemingProvider.theme("success-toast");

        $urlRouterProvider.otherwise('/dogs');

        $stateProvider
        .state('index', {
            url: '/dogs',
            controller: 'dogsCtrl as vm',
            templateUrl: 'templates/home.html',
        })
        .state('breeds', {
            url: '/dogs/breeds/:letter',
            params: {
                letter: {
                    squash: false
                }
            },
            views: {
                '': { 
                    controller: 'breedsCtrl as vm',
                    templateUrl: 'templates/breeds.html'
                },
                'card@breeds': { 
                    templateUrl: 'templates/breeds-card.html'
                }
            }
        })
        .state('filtered', {
            url: '/dogs/filtered',
            controller: 'filteredCtrl as vm',
            templateUrl: 'templates/filtered.html',
        })
        .state('detail', {
            url: '/dogs/detail',
            params: {
                id: null,
                breed: null
            },
            controller: 'dogDetailCtrl as vm',
            templateUrl: 'templates/dog-detail.html'
        })
        .state('signin', {
            url: '/dogs/signin',
            controller: 'signInCtrl as vm',
            templateUrl: 'templates/sign-in.html'
        })
        .state('signup', {
            url: '/dogs/signup',
            controller: 'signUpCtrl as vm',
            templateUrl: 'templates/sign-up.html'
        })
        .state('signout', {
            url: '/dogs/signout',
            controller: 'signOutCtrl as vm',
        })
        .state('user', {
            url: '/#/user',
            controller: 'usersCtrl as vm',
            templateUrl: 'templates/sign-in.html'
        })
        .state('admin', {
            url: '/dogs/admin',
            controller: 'adminCtrl as vm',
            templateUrl: 'templates/admin.html'
        })
        .state('account', {
            url: '/dogs/account',
            controller: 'accountCtrl as vm',
            templateUrl: 'templates/account.html'
        })
        .state('account.usercreds', {
            //parent: 'account',
            url: '/usercreds',
            controller: 'accountCtrl as vm',
            templateUrl: 'templates/usercreds.html'
        })
        .state('account.favorites', {
            //parent: 'account',
            url: '/favorites',
            controller: 'accountCtrl as vm',
            templateUrl: 'templates/compare-favorites.html'
        })
        .state('account.rescues', {
            //parent: 'account',
            url: '/rescues',
            controller: 'accountCtrl as vm',
            templateUrl: 'templates/compare-rescues.html'
        })
        .state('bestOf', {
            url: '/bestOf',
            params: {
                list: null
            },
            views: {
                '': { 
                    controller: 'bestOfCtrl as vm',
                    templateUrl: 'templates/best-of.html'
                },
                'card@bestOf': { 
                    templateUrl: 'templates/best-of-card.html'
                }
            }
        })
        .state('shelters', {
            url: '/dogs/shelters',
            params: {
                zip: null
            },
            controller: 'sheltersCtrl as vm',
            templateUrl: 'templates/shelters.html'
        });
    });

})();


