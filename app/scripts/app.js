'use strict';

var EditAdocApp = angular.module('editAdoc', [
  'ui.router',
  'ui.ace',  // ace editor
  'firebase',  //firebase sync + auth
  'ngMaterial', //google material design
  'aql.asciidoc', //asciidoc -> html
  'ngStorage',  //local storage
  'octokit.adapter', //github api

  'editAdoc.layout.controller',

  'editAdoc.sync.service',
  'editAdoc.service.storage',

  'editAdoc.service.converter',

  'editAdoc.users.controller',
  'editAdoc.users.service',
  'editAdoc.users.auth.service',
  'editAdoc.users.presence',

  'editAdoc.project.controller',
  'editAdoc.project.github.controller',
  'editAdoc.project.service',



  'editAdoc.editor.controller',
  'editAdoc.editor.service',

  'editAdoc.preview.controller',
  'editAdoc.settings.controller'
]);


EditAdocApp.controller('AppCtrl', function($rootScope, $scope, $mdSidenav, $mdToast, $mdDialog) {

    var vm = this;

   //Datas into rootScope
   $rootScope.notifyUserMessage = {};
   $rootScope.commitMessage = ""; //TODO delete from $rootScope


    vm.toastPosition = {
      bottom: false,
      top: true,
      left: true,
      right: true
    };

    vm.toggleSidebar = function() {
        $mdSidenav('sidebar').toggle();
    };
    vm.toggleUsers = function() {
        $mdSidenav('users').toggle();
    };
    vm.toggleProject = function() {
        $mdSidenav('project').toggle();
    };

    $scope.$on('notifyUserEvent', function (event, data) {
        $rootScope.notifyUserMessage = data.message;
        vm.notifyUser();
    });

    vm.getToastPosition = function() {
        return Object.keys(vm.toastPosition)
            .filter(function(pos) { return vm.toastPosition[pos]; })
            .join(' ');
    };

    vm.notifyUser = function() {
        $mdToast.show({
            controller: "ToastNotifyCtrl",
            controllerAs: "toast",
            templateUrl: 'views/layout/toast-notify-template.html',
            hideDelay: 4000,
            position: vm.getToastPosition()
        });
    };

   vm.showPushDialog = function(ev) {
      $mdDialog.show({
        controller: "DialogCtrl",
        controllerAs: "dialog",
        templateUrl: 'views/layout/dialog-push-template.html',
        targetEvent: ev
      })
        .then(function(answer, message) {
          //broadcast event for push content
          if (answer === 'OK') {
            $rootScope.$broadcast('pushContentEvent', {
              message:  $rootScope.commitMessage
            });
          }
        }, function() {
          $rootScope.notifyUserMessage = "ERROR! The action was cancelled !";
          vm.notifyUser();
          console.log("push action cancelled")
        });
    };

});





