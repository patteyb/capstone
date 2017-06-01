(function () {
    'use strict';

    angular
        .module('app')
        .factory('validationService', function($q) {

        //function ValidationService($q) {
          var _this = this;

          _this.validationCodes = {
            required: 'required',
            allFieldsRequired: 'all_fields_required',
            loginFailure: 'login_failure',
            passwordMismatch: 'password_mismatch',
            existingUser: 'existing_user'
          };

          _this.addRequiredValidationError = function(validationErrors, key, message) {
            _this.addValidationError(validationErrors, key,
              _this.validationCodes.required, message);
          };

          _this.addValidationError = function(validationErrors, key, code, message) {
            if (!validationErrors.errors.hasOwnProperty(key)) {
              validationErrors.errors[key] = [];
            }

            var error = {
              code: code,
              message: message
            };

            validationErrors.errors[key].push(error);
          };

          _this.hasValidationErrors = function(validationErrors) {
            var hasValidationErrors = false;

            for (var key in validationErrors.errors) {
              if (validationErrors.errors.hasOwnProperty(key)) {
                hasValidationErrors = true;
                break;
              }
            }

            return hasValidationErrors;
          };

          _this.getValidationErrorsObject = function() {
            return {
              message: 'Validation Failed',
              errors: {}
            };
          };

          _this.prepareErrorResponse = function(validationErrors) {
            return $q.reject({ data: validationErrors, status: 400 });
          };

          _this.getValidationCodes = function() {
            return _this.validationCodes;
          };

          return{
            addRequiredValidationError: _this.addRequiredValidationError,
            addValidationError: _this.addValidationError,
            hasValidationErrors: _this.hasValidationErrors,
            getValidationErrorsObject: _this.getValidationErrorsObject,
            prepareErrorResponse: _this.prepareErrorResponse,
            getValidationCodes: _this.getValidationCodes
          };
    });
})();

