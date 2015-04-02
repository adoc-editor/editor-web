'use strict';
(function(){

    var module = angular.module('editAdoc.users.auth.service', []);

   /**
   * User Authentification with a provider (github, twitter...) by Firebase
   */
    module.service('UsersAuthService',["SyncAuth", "$q", "UsersPresence", "UsersService", function(SyncAuth, $q, UsersPresence, UsersService) {

        function auth(provider) {
            var deferred = $q.defer();
            var authObj =  new SyncAuth();

            authObj.$authWithOAuthPopup(provider, {
              //remember: "sessionOnly",
              scope: "user,repo"
                }).then(function(authData) {
                  deferred.resolve(authData);
                  UsersPresence.setUserConnectionAsAuthenticated(authData);
                  UsersService.listenToInvitationOnProject(authData);
                }).catch(function(error) {
                   deferred.reject(error)
                }
              );
            return deferred.promise;
        }

        function logout() {
          SyncAuth().$unauth();
        }

        this.auth = auth;
        this.logout = logout;

    }]);

})();
