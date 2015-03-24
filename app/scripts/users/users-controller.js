(function(){

    var module = angular.module('editAdoc.users.controller', []);

    /**
     * Show User Profile information
     * @param $rootScope
     * @constructor
     */
    function UserProfileCtrl(UsersAuthService) {
      var vm = this;

      vm.logout = function() {
        UsersAuthService.logout();
      };
    };


    /**
     * Show users affected to the project
     *
     * @param $mdSidenav
     * @constructor
     */
    function UsersCtrl($mdSidenav, SyncUser) {
        var vm = this;

        vm.close = function() {
            $mdSidenav('users').close();
        };

        var listUsers = SyncUser.syncUsersAsArray();
        listUsers.$loaded().then(function() {
          vm.authors = listUsers;
        });

    };

    module.controller('UsersCtrl', UsersCtrl);
    module.controller('UserProfileCtrl', UserProfileCtrl);

})();
