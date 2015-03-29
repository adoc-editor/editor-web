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
    function UsersCtrl($mdSidenav, $scope, SyncUser, SyncUsersPresence) {
        var vm = this;
        vm.listUsers = {};

        vm.close = function() {
            $mdSidenav('users').close();
        };

        /**
         * Send a message to notify the user
         * @param data
         */
        vm.sendNotifyUserEvent = function(data){
            $scope.$emit('notifyUserEvent', data);
        };

        var list = SyncUsersPresence.syncUsersPresenceAsArray();
        list.$loaded().then(function() {
          vm.listUsers = list;
        });


        /**
         * A new user is connected .
         */
        $scope.$on('onNewUserConnected', function (event, data) {
            var e = new Object();
            e.message = data.user.username + " is online";
            vm.sendNotifyUserEvent(e);
        });

    };

    module.controller('UsersCtrl', UsersCtrl);
    module.controller('UserProfileCtrl', UserProfileCtrl);

})();
