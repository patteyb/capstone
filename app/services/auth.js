(function () {
    'use strict';

    angular
        .module('app')
        .factory('authService', function(sessionService, validationService, usersFactory, $q) {

          var _this = this;

          /** authService.signIn ---------------------------------------------------- */
          _this.signIn = function(emailAddress, password) {
              var validationErrors = validationService.getValidationErrorsObject();

              // validate that we have an email address
              if (!emailAddress) {
                  validationService.addRequiredValidationError( validationErrors, 'emailAddress', 'Please provide an email address.');
              }

              // validate that we have a password
              if (!password) {
                  validationService.addRequiredValidationError(validationErrors, 'password', 'Please provide a password.');
              }

              // if we have validation errors, then short circuit this process
              if (validationService.hasValidationErrors(validationErrors)) {
                  return validationService.prepareErrorResponse(validationErrors);
              }

              // Fields are valid, continue with sign-in
              var currentUser = sessionService.getUser();

              // set the email address and password on the current user
              // so that the data service has access to these values
              currentUser.emailAddress = emailAddress;
              currentUser.password = password;

              // attempt to get the user from the data service
              return usersFactory.getUser(currentUser).then(
                  function(response) {
                    var user = response.data;

                    currentUser.isAuthenticated = true;
                    currentUser._id = user._id;
                    currentUser.fullName = user.fullName;
                    currentUser.favorites = user.favorites;
                    currentUser.password = user.password;
                    currentUser.rescues = user.rescues;
                    if (user.role === 'administrator') {
                      currentUser.isAdmin = true;
                    }

                    // return null to the caller indicating that there were no errors
                    //return $q.resolve(null);
                    return $q.resolve(null);
                  },
                  function() {
                    sessionService.resetSession();

                    // add a validation indicating that the login failed
                    var validationCodes = validationService.getValidationCodes();
                    validationService.addValidationError(
                        validationErrors, 'password',
                        validationCodes.loginFailure,
                        'The login failed for the provided email address and password.');

                    // return the validation errors to the caller
                    return validationService.prepareErrorResponse(validationErrors);
                });
          };

          /** authService.signUp ---------------------------------------------------- */
          _this.signUp = function(user) {
              var validationCodes = validationService.getValidationCodes();
              var validationErrors = validationService.getValidationErrorsObject();

              // Confirm that all fields are present
              if ((user.emailAddress === '' || user.emailAddress === undefined) ||
                (user.fullName === '' || user.fullName === undefined) ||
                (user.password === '' || user.password === undefined) ||
                (user.confirmPassword ===  '' || user.confirmPassword ===  undefined)) {
                  validationService.addValidationError(
                  validationErrors, 
                  'all_fields_required', 
                  validationCodes.allFieldsRequired,
                  'All fields are required.');
              }

              // confirm that two password fields match
              if (user.password !== user.confirmPassword) {
                  validationService.addValidationError(
                    validationErrors, 'password_mismatch', 
                    validationCodes.passwordMismatch,
                    'Passwords do not match.');
              }

              // Confirm that this is a unique user
              usersFactory.lookupUser({ emailAddress: user.emailAddress}, function(err, user, next) {
                  if (err) next(err);
                  if (user) {
                    validationService.addValidationError(
                    validationErrors, 
                    'existing_user',
                    validationCodes.existingUser,
                    'This email has an account already.');
                  }
              });

              // if we have validation errors, then short circuit this process
              if (validationService.hasValidationErrors(validationErrors)) {
                return validationService.prepareErrorResponse(validationErrors);
              }

              // attempt to create the user from the data service
              return usersFactory.createUser(user).then(
                  function(user) {
                    var newUser = user.data;
                    newUser.isAuthenticated = true;
                    sessionService.setUser(newUser);
                  
                    // return null to the caller indicating that there were no errors
                    return $q.resolve(null);
                  },
                  function() {
                    sessionService.resetSession();

                    // add a validation indicating that the login failed
                    validationService.addValidationError(
                        validationErrors, 
                        'existing_user',
                        validationCodes.existingUser,
                        'A user already exists for this email.');

                    // return the validation errors to the caller
                    return validationService.prepareErrorResponse(validationErrors);
              });
          };


          _this.signOut = function() {
            sessionService.resetSession();
          };

          return {
            signIn: _this.signIn,
            signUp: _this.signUp,
            signOut: _this.signOut
        };
      });
})();

