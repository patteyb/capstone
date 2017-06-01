(function () {
    'use strict';

    angular
        .module('app')
        .factory('favoritesService', function(usersFactory, sessionService, toastService) {
        
        var _this = this;
        var currentUser = sessionService.getUser();


        _this.toggleFavorite =  function(dogId, breed) {
               if (!currentUser.isAuthenticated) {
                   toastService.showToast("You need to be signed in to access your favorites list.");
                   return;
               }
               var element = document.getElementById(dogId);
               if ( currentUser.favorites.length !== 0 && currentUser.favorites.indexOf(dogId) !== -1 ) {
                   // Dog is in favorites List, so remove it
                   usersFactory.deleteFavorite(currentUser, dogId).then(function() {
                       toastService.showToast(breed + ' has been removed from your favorites list.');
                       if (element) {
                            element.className = 'paw fav-off';
                       } 
                       currentUser.favorites.splice(currentUser.favorites.indexOf(dogId), 1);
                       sessionService.setUser(currentUser);
                   });
               } else {
                   // Add dog to favorites list
                   usersFactory.addFavorite(currentUser, dogId, 'breeds', '').then(function() {
                       toastService.showToast(breed + ' has been added to your favorites list.');
                       if (element) {
                            element.className = 'paw fav-on';
                       } 
                       currentUser.favorites.push(dogId);
                       sessionService.setUser(currentUser);
                   });
               }  
           };

           _this.markFavorites = function(dogs, favList) {
               var arr = [];
               // Convert dogs to array if it is a singular dog from detail page
               if (!Array.isArray(dogs)) {
                   arr.push(dogs);
               } else {
                   arr = dogs;
               }
               for (var i = 0; i < arr.length; i++) {
                   if (favList.indexOf(arr[i]._id) !== -1) {
                       arr[i].favClass = 'paw fav-on';
                   } else {
                       arr[i].favClass = 'paw fav-off';
                   }
                }
                return arr;
            };

           return {
               toggleFavorite: _this.toggleFavorite,
               markFavorites: _this.markFavorites
           };
        });
})();
