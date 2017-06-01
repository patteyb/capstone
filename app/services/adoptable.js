(function () {
    'use strict';

    angular
        .module('app')
        .factory('adoptableService', function(usersFactory, sessionService, toastService, $mdDialog) {
        
        var _this = this;
        var currentUser = sessionService.getUser();

        // Show the detail on an adoptable pet
        _this.showAdoptable = function(event, adoptable) {
                var dog = adoptable;
                var control = {
                    allowTracking: currentUser.isAuthenticated,
                    showTracking: currentUser.rescues.indexOf(adoptable.id.$t) === -1,
                    showUntracking: currentUser.rescues.indexOf(adoptable.id.$t) !== -1
                };
               

                // Format fields for display
                if (adoptable.sex.$t.toLowerCase() === 'm') {
                    dog.sex.$t = 'Male';
                } else {
                    dog.sex.$t = 'Female';
                }
                if (adoptable.options.option) {
                    for (var i = 0; i < adoptable.options.option.length; i++) {
                        if (adoptable.options.option[i].$t === 'housetrained') {
                            dog.options.option[i].$t = 'House-trained';
                        } else if (adoptable.options.option[i].$t === 'specialNeeds') {
                            dog.options.option[i].$t = 'Special needs';
                        } else if (adoptable.options.option[i].$t === 'noCats') {
                            dog.options.option[i].$t = 'Not good with cats';
                        } else if (adoptable.options.option[i].$t === 'noDogs') {
                            dog.options.option[i].$t = 'Not good with other dogs';
                        } else if (adoptable.options.option[i].$t === 'altered') {
                            dog.options.option[i].$t = 'Has been spayed/neutered';
                        } else if (adoptable.options.option[i].$t === 'hasShots') {
                            dog.options.option[i].$t = 'Vaccinations are up-to-date';
                        }
                    }
                }
                $mdDialog.show({
                controller: ['$scope', 'dog', 'control', function($scope, dog, control) {
                    $scope.control = control;
                    $scope.dog = dog;
                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };
                    $scope.trackAdoptable = function(dog) {
                        $scope.control.showUntracking = true; 
                        $scope.control.showTracking = false; 
                        trackDog(dog.id.$t, dog.name.$t);
                    };
                    $scope.untrackAdoptable = function(dog) {
                        $scope.control.showTracking = true; 
                        $scope.control.showUntracking = false; 
                        untrackDog(dog.id.$t, dog.name.$t);
                    };
                }],
                template: 
                    '<md-dialog class="std-dialog" aria-label="Adoptable dialog" layout-padding>' +
                    '   <md-dialog-content>' +
                    '       <div class="md-title teal" layout-padding>' +
                    '           {{ dog.name.$t }}' + 
                    '       </div>' +
                    '       <div layout="row" layout-padding>' +
                    '           {{ dog.description.$t }}' +
                    '       </div>' +
                    '       <div layout="row" layout-padding flex>' +
                    '           <div layout="column" flex="40">' +
                    '               <img ng-src="{{ dog.media.photos.photo[2].$t }}">' +
                    '           </div>' +
                    '           <div layout="column" flex="60">' +
                    '               <div layout="row">' +
                    '                   <span class="teal">Sex:&nbsp; </span> {{ dog.sex.$t }}' +
                    '                   &nbsp;&nbsp;&nbsp;<i class="mdi mdi-checkbox-multiple-blank-circle"></i>&nbsp;&nbsp;&nbsp;' +
                    '                   <span class="teal">Age:&nbsp; </span> {{ dog.age.$t }}' +
                    '                   &nbsp;&nbsp;&nbsp;<i class="mdi mdi-checkbox-multiple-blank-circle"></i>&nbsp;&nbsp;&nbsp;' +
                    '                   <span ng-if="dog.breeds.breed[0]"><span class="teal">Breeds:&nbsp; </span> {{ dog.breeds.breed[0].$t }}, {{ dog.breeds.breed[1].$t }} </span>' +
                    '                   <span ng-if="!dog.breeds.breed[0]"><span class="teal">Breed:&nbsp; </span> {{ dog.breeds.breed.$t }} </span>' +
                    '               </div>' +
                    '               <div layout-padding>' +
                    '                   <div ng-repeat="option in dog.options.option">' +
                    '                       <p><i class="mdi mdi-checkbox-multiple-marked-circle"></i>&nbsp; {{ option.$t }}</p>' +
                    '                   </div>' +
                    '               </div>' +
                    '               <div layout="row" layout-padding>' +
                    '                   <div>' +
                    '                       <p><span class="teal">Contact Email:</span> {{ dog.contact.email.$t }}</p>' +
                    '                       <p><span class="teal">Contact Phone:</span> {{ dog.contact.phone.$t }}</p>' +
                    '                   </div>' +
                    '               </div>' +
                    '           </div>' +
                    '       </div>' +
                    '   </md-dialog-content>' +
                    '   <md-dialog-actions layout="row">' +
                    '       <md-button ng-click="trackAdoptable(dog)" class="md-primary" ng-show="control.showTracking && control.allowTracking" ng-hide="control.showUntracking || !control.allowTracking">' +
                    '          Track {{ dog.name.$t }}' +
                    '       </md-button>' +
                    '       <md-button ng-click="untrackAdoptable(dog)" class="md-warn" ng-show="control.showUntracking && control.allowTracking" ng-hide="control.showTracking || !control.allowTracking">' +
                    '          UnTrack {{ dog.name.$t }}' +
                    '       </md-button>' +
                    '       <md-button ng-click="closeDialog()" class="md-primary">' +
                    '          Close Dialog' +
                    '       </md-button>' +
                    '   </md-dialog-actions>' +
                    '</md-dialog>',
                locals: { dog: dog, control: control },
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                escapeToClose: true
               });
           };

           // Save a rescue dog to a user's rescue list
           function trackDog(id, name) {
               // check to ensure this dog isn't already on list
               if (currentUser.rescues.indexOf(id) === -1) {
                    usersFactory.addRescue(id, currentUser._id).then(function(){
                        currentUser.rescues.push(id);
                        sessionService.setUser(currentUser);
                        document.getElementById(id).className = 'rescue-on';
                    }); 
               } else {
                   toastService.showToast(name + ' has already been added to your rescues list.');
               }
           }

           // Remove a rescue dog from a user's rescue list
            function untrackDog(id, name) {
                // check to ensure this dog is on list
               if (currentUser.rescues.indexOf(id) !== -1) {
                    usersFactory.deleteRescue(id, currentUser._id).then(function(){
                        toastService.showToast(name + ' has been removed from your rescues list.');
                        currentUser.rescues.splice(currentUser.rescues.indexOf(id), 1);
                        sessionService.setUser(currentUser);
                        document.getElementById(id).className = 'rescue-off';
                    });
               }
           }

           return {
               showAdoptable: _this.showAdoptable
           };
        });
})();