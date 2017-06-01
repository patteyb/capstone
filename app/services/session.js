(function () {
    'use strict';

    angular
        .module('app')
        .factory('sessionService', function() {

          var _this = this;
          _this.currentUser = {};

          _this.getUser = function() {
            return _this.currentUser;
          };

          _this.setUser = function(user) {
            _this.currentUser = user;
            return _this.currentUser;
          };

          _this.resetSession = function() {
             _this.currentUser = {
               isAuthenticated: false,
               _id: 0,
               fullName: '',
               emailAddress: '',
               password: '',
               favorites: [],
               rescues: [],
               zip: '20001',
               zipConfirmed: false,
               isAdmin: false
             };
          };

          init();

          function init() {
            _this.resetSession();
          }

      return {
        getUser: _this.getUser,
        setUser: _this.setUser,
        resetSession: _this.resetSession
      };
    });
})();

//module.exports = Session;
