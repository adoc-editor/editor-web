(function(){

    var module = angular.module('editAdoc.layout.controller', []);

   function SidebarCtrl ($mdSidenav) {
        var vm = this;

        vm.close = function() {
            $mdSidenav('sidebar').close();
        };
    }

    /**
     * Controller for notification message
     */
    function ToastNotifyCtrl($mdToast) {
        var vm = this;

        vm.closeToast = function() {
            $mdToast.hide();
        };
    };

    /**
     * Controller for dialog boxes
     */
    function DialogCtrl($mdDialog, $rootScope) {
        var vm = this;

        vm.commit = { message : ''};

        vm.hide = function() {
            $mdDialog.hide();
        };
        vm.cancel = function() {
            $mdDialog.cancel();
        };
        vm.answer = function(answer) {
            $rootScope.commitMessage =  vm.commit.message;
            $mdDialog.hide(answer);
        };

    };

    module.controller('SidebarCtrl', SidebarCtrl);
    module.controller('DialogCtrl', DialogCtrl);
    module.controller('ToastNotifyCtrl', ToastNotifyCtrl);

})();
