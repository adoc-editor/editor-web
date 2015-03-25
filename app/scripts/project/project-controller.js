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
        vm.unwatchRefFile;
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

        vm.unwatchRefFile = vm.refFile.$watch(function(data){
          //TODO : define a workflow between users
          //console.log("file changed!");
        });

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
         * @name aceChangeEvent
         * @desc subscribe to the aceChangeEvent in order to have save the content on change.
         */
        $scope.$on('aceChangeEvent', function (event, data) {
          if(vm.project !== undefined && vm.project.files !== undefined){
            if (vm.project.files[data.file.id] === undefined){
              vm.project.files[data.file.id] = {};
            }
            vm.revisionsAsArray[0].asciidoc = data.file.asciidoc;
            //if no three way binding, then $save
            vm.revisionsAsArray.$save(0);
          }
        });

        /**
         * Send an event to load a file into the editor
         * @param data
         */
        vm.sendAceLoadContentEvent = function(data){
          //broadcast event for preview
          if ($location.path() != "editor"){
            Editor.setValue(data.file);
            Editor.updateAsciidoc();
          } else {
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
          vm.project = ProjectService.getProject(id);
          vm.theProject.name = "";
        };

        /**
         * Load a project in order to work on it
         * @param projectId
         */
        vm.loadProject = function(){
          vm.project = ProjectService.getProject(vm.loadedProject.id);
        };

        /**
         * Create a new sample asciidoc file
         * @param projectId
         */
        vm.newBlankFile = function(){
          vm.addFileToProject({ file : ProjectService.createNewBlankFile(vm.theNewFile.name)});
          vm.theNewFile.name = "";
        };

        /**
         * Edit an existing file into the editor
         */
        vm.editFile = function(idFile){
          vm.listenToBackendEvent(idFile);

          vm.revisionsAsArray.$loaded().then(function(data){
            var tmpFile = data[0];
            tmpFile.id = idFile;
            vm.sendAceLoadContentEvent({
              file: tmpFile
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
        vm.addFileToProject = function(data){
          var projectId = vm.project.$id;
          ProjectService.addFileToProject(projectId, data.file);
          vm.listenToBackendEvent(data.file.id);
          vm.sendAceLoadContentEvent(data);
          $location.path("/editor");
          vm.sendNotifyUserEvent({
            file: data.file,
            message: "You're working on " + data.file.name + " file."
          });
        };

    }
    module.controller('ProjectCtrl', ProjectCtrl);
})();
