(function(){

    var module = angular.module('editAdoc.layout.controller', []);

   function SidebarCtrl ($mdSidenav) {
        var vm = this;

        vm.close = function() {
            $mdSidenav('sidebar').close();
        };
    }

    function SubheaderCtrl ($rootScope, $scope, $location, Storage) {
        var vm = this;

        vm.breadcrumb = {
            project: "Select a project",
            file: "then edit a file !",
            fileId: "",
            users: new Array("one")
        };

        vm.isActive = function() {
            if ($location.path() == "/editor" || $location.path() == "/preview" || $location.path() == "/realtime"){
               return true;
            }
            return false;
        };

        vm.closeFile = function(){
            Storage.reset();
            $rootScope.$broadcast('closeFileEvent', {
                fileId : vm.breadcrumb.fileId
            });
            vm.breadcrumb.fileId = "";
            vm.breadcrumb.file = "Choose a file to edit."
        }


        //Update breadcrumb
        $scope.$on('updateBreadcrumbEvent', function (event, data) {
            vm.breadcrumb = data;
        });

        $scope.$on('closeFileEvent', function (event, data) {
            vm.breadcrumb.fileId = "";
            vm.breadcrumb.file = "Choose a file to edit."
        });

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
     * Controller for dialog box : commit to github
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
    module.controller('SubheaderCtrl', SubheaderCtrl);
    module.controller('DialogCtrl', DialogCtrl);
    module.controller('ToastNotifyCtrl', ToastNotifyCtrl);

})();
