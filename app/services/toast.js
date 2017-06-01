(function () {
    'use strict';

    angular
        .module('app')
        .factory('toastService', function($mdToast) {

        var _this = this;
        
        _this.showToast = function(message) {
               $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position( 'top right')
                    .hideDelay(3000) 
                    .theme('success-toast')             
              );
        };

        return{
            showToast: _this.showToast
          };
    });
})();

