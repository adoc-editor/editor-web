'use strict';
(function(){

    var module = angular.module('editAdoc.project.controller', []);

    function ProjectCtrl($scope, $rootScope, $location, $mdSidenav, ProjectService, Editor, SyncProject) {
        var vm = this;

        /** the backend project */
        vm.project;
        /** object to bind with the input */
        vm.theProject = { id:'', name : "My AsciiDoc project"};
        vm.loadedProject = { id: '', value:''};
        vm.theNewFile = { id:'', name : "my-sample.adoc" };

        /** Current edited file */
        vm.refFile;

        /** handle revision for the file **/
        vm.revisionsAsArray;

      /**
         * Close this sidebar
         */
        vm.close = function() {
          $mdSidenav('project').close();
        };

      /**
       * EVENT with Backend (Firebase)
       * -----------------------------
       */
      vm.listenToBackendEvent = function(idFile){
        vm.refFile = SyncProject.syncFileAsObject(vm.project.$id, idFile);
        vm.revisionsAsArray = SyncProject.syncFileRevisionsAsArray(vm.project.$id, idFile);
      };

      /**
       * EVENTS with others controllers
       * ------------------------------
       */

        /**
         * A new file is added to the project.
         */
        $scope.$on('addFileToProjectEvent', function (event, data) {
            vm.addFileToProject(data);
        });

        /**
         * A SHA value is updated for file after a commit to github.
         */
        $scope.$on('updateSHAEvent', function (event, data) {
          vm.refFile.github.sha = data;
        });

        /**
         * Send an event to load a file into the editor
         * @param data
         */
        vm.sendAceLoadContentEvent = function(data){

          if ($location.path() == "/editor"){
              Editor.attachFileRevision(data.fileRevision);
          }
          //broadcast event for preview
          else {
            $rootScope.$broadcast('aceLoadContentEvent', data);
          }
        };

        /**
         * Send a message to notify the user
         * @param data
         */
        vm.sendNotifyUserEvent = function(data){
          $scope.$emit('notifyUserEvent', data);
        };


        /**
         * ACTIONS
         * --------------------
         */

        /**
         * Create a new project on Firebase and add the user
         * to this project.
         */
        vm.newProject = function(){
          var id = ProjectService.createProject(vm.theProject.name, $rootScope.user.auth.uid, $rootScope.user.auth.github.username);
          vm.project = SyncProject.syncAsObject(id);
          vm.theProject.name = "";
        };

        /**
         * Load a project in order to work on it
         */
        vm.loadProject = function(){
          vm.project = SyncProject.syncAsObject(vm.loadedProject.id);
        };

        /**
         * Create a new sample asciidoc file
         */
        vm.newBlankFile = function(){
          vm.addFileToProject({ newFile : ProjectService.createNewBlankFile(vm.theNewFile.name)});
          vm.theNewFile.name = "";
        };

        /**
         * Edit an existing file into the editor
         */
        vm.editFile = function(idFile){
          vm.listenToBackendEvent(idFile);

          vm.revisionsAsArray.$loaded().then(function(data){
            var tmpFileRevision = data[0];
            tmpFileRevision.fileId = idFile;
            tmpFileRevision.projectId = vm.project.$id;
            vm.sendAceLoadContentEvent({
              fileRevision: tmpFileRevision
            });

            $location.path("/editor");

            vm.sendNotifyUserEvent({
              file: vm.project.files[idFile],
              message: "You're working on " + vm.project.files[idFile].name + " file."
            });
          });

        };

      /**
       * Add a file to the backend, watch this file, load the content into the editor,
       * redirect to the editor view and notify the user.
       * @param data
       */
        vm.addFileToProject = function(newFile){

          ProjectService.addFileToProject(vm.project.$id, newFile.newFile);
          vm.listenToBackendEvent(newFile.newFile.id);
            vm.refFile.$loaded().then(function(d){
                vm.revisionsAsArray.$loaded().then(function(data){
                    newFile.newFile.revision.projectId = vm.project.$id;
                    vm.sendAceLoadContentEvent({
                        fileRevision: newFile.newFile.revision
                    });

                    $location.path("/editor");

                    vm.sendNotifyUserEvent({
                        file: newFile.newFile,
                        message: "You're working on " + newFile.newFile.name + " file."
                    });
                });
            });

        };

    }
    module.controller('ProjectCtrl', ProjectCtrl);
})();
