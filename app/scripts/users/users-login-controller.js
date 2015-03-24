(function(){

    var module = angular.module('editAdoc.users.controller');

    function UsersLoginCtrl($rootScope, UsersAuthService, UsersService, $gh) {
        var vm = this;
        vm.ref;

        vm.authentification = function(provider){

          UsersAuthService.auth(provider)
              .then(function(authData){
                if (authData){
                   //$rootScope.authData = authData;

                    vm.ref = UsersService.createOrUpdateUser(authData);
                    //bind the Firebase user to $rootScope user
                    vm.ref.$bindTo($rootScope, "user").then(function() {
                        console.log($rootScope.user);
                        //Handle Github Files
                        $gh.setCreds($rootScope.user.auth.github.accessToken);
                        $gh.getUser()
                            .then(function(user) {
                                return user.getRepos('owner', 'pushed', 'desc');
                            })
                            .then(function(repos) {
                                //broadcast event for github repos
                                $rootScope.$broadcast('githubLoadReposEvent', {
                                    repositories: repos
                                });
                            });
                    });
                }
                else{
                    console.log("error auth");
                }
              }
          );
        };

        vm.disconnect = function(provider){
            $rootScope.authData = null;
            UsersAuthService.logout(provider);
        };

    };

  module.controller('UsersLoginCtrl', UsersLoginCtrl);

})();
