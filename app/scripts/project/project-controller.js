'use strict';
(function(){

    var module = angular.module('editAdoc.project.controller', []);

    function ProjectCtrl($scope, $rootScope, $location, $mdSidenav, $mdDialog, defaults, ProjectService, UsersService, Editor, Storage, SyncProject, SyncUsersPresence) {
        var vm = this;

        /** the backend project */
        vm.project;
        vm.projectUsers;

        /** object to bind with the input */
        vm.theProject ;
        vm.loadedProject = { id: '', value:''};
        vm.theNewFile;

        /** Current edited file */
        vm.refFile;

        /** handle revision for the file **/
        vm.revisionsAsArray;
        vm.theFileRevisionId;

        vm.isProjectLoaded = false;
        vm.isOwner = false;

        //settings
        vm.activeGitHubIntegration = defaults.enableGitHubIntegration;

        /**
         * Close this sidebar
         */
        vm.close = function() {
          $mdSidenav('project').close();
        };


      /**
       * EVENTS with others controllers
       * ------------------------------
       */

        /**
         * An external file (ex: github...) is added to the current project.
         */
        $scope.$on('addFileToProjectEvent', function (event, data) {
            vm.addFileToProject(data.file);
        });

        /**
         * The user closed the edited file.
         */
        $scope.$on('closeFileEvent', function (event, data) {
            //Clean sync references
            vm.refFile.$destroy();
            vm.revisionsAsArray.$destroy();
        });

        /**
         * A SHA value is updated for file after a commit to github.
         */
        $scope.$on('updateSHAEvent', function (event, data) {
          ProjectService.updateSHAForGitHubFile(vm.loadedProject.id, vm.refFile.$id, vm.theFileRevisionId, data);
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
            $location.path("/editor");
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
         * Send an object with breadcrumb infos
         * @param data
         */
        vm.sendUpdateBreadcrumbEvent = function(data){
            $rootScope.$broadcast('updateBreadcrumbEvent', data.breadcrumb);
        };

        /**
         * Send an event to clean all views when the file is closed.
         * @param data fileId
         */
        vm.sendCloseFileEvent = function(data){
            $rootScope.$broadcast('closeFileEvent', {
                fileId : data.fileId
            });
        }


        /**
         * ACTIONS
         * --------------------
         */

        /**
         * Create a new project on Firebase and add the user
         * to this project.
         */
        vm.newProject = function(){
            if (vm.theProject.name.trim() != "" && vm.theProject.name.length <= 30){
              var newId = ProjectService.createProject(vm.theProject.name, $rootScope.user.auth.uid, $rootScope.user.auth.github.username);
              vm.loadedProject.id = newId;
              vm.theProject.id = newId;
              vm.loadProject();
              vm.theProject.name = "";
            }
        };

        /**
         * Load a project in order to work on it
         */
        vm.loadProject = function(){
          vm.project = SyncProject.syncAsObject(vm.loadedProject.id);
          ProjectService.isOwner(vm.loadedProject.id, $rootScope.user.auth.uid).then(
              function(data){
                  vm.isOwner = data;
              }
          );
          vm.project.$loaded().then(function(){
              UsersService.getUsersProject(vm.loadedProject.id).then(
                  function(users){
                      vm.projectUsers = users;
                      vm.sendUpdateBreadcrumbEvent({breadcrumb : {project : vm.project.name , file : "", fileId: "", users: vm.projectUsers}});
                      vm.isProjectLoaded = true;
                      $location.path("/editor");
                  }
              );
          });
        };

        /*
         *  ACTIONS FOR USERS
         */

        /**
         * Add a user to an existing project.
         */
        vm.addUserToProject = function(userId, username){
            vm.tmpTheId = userId;
            vm.tmpTheUsername = username;

            //Add a reference to the project on the user
            UsersService.attachProjectToUser(userId, vm.project.$id, vm.project.name, false).then(
                function(data){
                    var listUsers = SyncProject.syncUsersAsArray(vm.project.$id);
                    listUsers.$loaded().then(function(data){
                        //TODO : find a better way to do that
                        listUsers[5] = {$id : vm.tmpTheId, $value: vm.tmpTheUsername};
                        listUsers.$save(5).then(

                            function(){
                                vm.tmpTheId =null;
                                vm.tmpTheUsername = null;
                                vm.loadProject();
                            }
                        )}
                    );
                }
            );

        };

        /*
        *  ACTIONS FOR FILES
         */

        /**
         * Create a new sample asciidoc file
         */
        vm.newBlankFile = function(){
            if (vm.theNewFile.name.trim() != "" && vm.theNewFile.name.length <= 30) {
                vm.addFileToProject(ProjectService.createNewBlankFile(vm.theNewFile.name));
                vm.theNewFile.name = "";
            }
        };

        /**
         * Close the current edit file
         */
        vm.closeFile = function(id){
            Storage.reset();
            vm.sendCloseFileEvent({fileId : id})
        };


        /**
         * Edit an existing file into the editor
         */
        vm.editFile = function(idFile){
          //vm.listenToBackendEvent(idFile);
            loadRevisionFileInEditor(idFile);
        };

        /**
         * Load a revision content in the editor and update the UI
         * @param idFile
         */
        function loadRevisionFileInEditor(idFile){
            vm.refFile = SyncProject.syncFileAsObject(vm.project.$id, idFile);
            vm.refFile.$loaded().then(
                function(){
                    vm.revisionsAsArray = SyncProject.syncFileRevisionsAsArray(vm.project.$id, idFile);
                    vm.revisionsAsArray.$loaded().then(function(data){
                        //store the file revision ID for Github SHA1 update
                        vm.theFileRevisionId = data[0].$id;
                        var tmpFileRevision = data[0];
                        tmpFileRevision.fileId = idFile;
                        tmpFileRevision.projectId = vm.project.$id;
                        vm.sendAceLoadContentEvent({
                            fileRevision: tmpFileRevision
                        });

                        vm.sendNotifyUserEvent({
                            file: vm.project.files[idFile],
                            message: "You're working on " + vm.project.files[idFile].name + " file."
                        });
                        vm.sendUpdateBreadcrumbEvent({breadcrumb : {project : vm.project.name, file : vm.project.files[idFile].name, fileId: idFile, users: vm.projectUsers}});

                    });
                }
            );
        }

      /**
       * Add a file to the backend, watch this file, load the content into the editor,
       * redirect to the editor view and notify the user.
       * @param data
       */
        vm.addFileToProject = function(newFile){

          ProjectService.addFileToProject(vm.project.$id, newFile).then(
              function(){
                  loadRevisionFileInEditor(newFile.id);
              }
          );

        };

        /**
         * Give the name for each project groups
         * @param isOwner
         * @returns {string}
         */
        vm.getRoleOnProject = function(isOwner){
            if (isOwner)
                return "My projects"
            else
                return "As invited"
        }

        vm.showUserToProjectDialog = function(ev) {
            $mdDialog.show({
                controller: "DialogUserToProjectCtrl",
                controllerAs: "dialog",
                templateUrl: 'views/layout/dialog-usertoproject-template.html',
                targetEvent: ev,
                locals: { users: SyncUsersPresence.syncUsersPresenceAsArray() },
                bindToController: true
            })
                .then(function(user) {
                    //broadcast event for push content
                    if(user.userId){
                        console.log(user.userId, user.username);
                        vm.addUserToProject(user.userId, user.username);
                    }
                }, function() {
                    console.log("add user to project error.")
                });
        };

    }

    /**
     * Controller for dialog box : attach user to project
     */
    function DialogUserToProjectCtrl($mdDialog, users) {
        var vm = this;

        users.$loaded().then(function() {
            vm.usersAvailable = users;
        });

        vm.hide = function() {
            $mdDialog.hide();
        };
        vm.cancel = function() {
            $mdDialog.cancel();
        };
        vm.answer = function(answer) {
            $mdDialog.hide();
        };
        vm.attachUserToProject = function(userId, username){
            console.log(userId, username);

            $mdDialog.hide({ userId : userId, username : username });
        }

    };

    module.controller('ProjectCtrl', ProjectCtrl);
    module.controller('DialogUserToProjectCtrl', DialogUserToProjectCtrl);
})();
