'use strict';
(function(){

    var module = angular.module('editAdoc.project.github.controller',[]);

   function GithubFilesCtrl($scope, $rootScope, $mdSidenav, $gh, ProjectService) {
        var vm = this;

        vm.repositories = [];
        vm.selectedRepository = {};
        vm.currentEditorFile = {};

     /**
      * EVENTS : listen to events and send events
      * ----------------------------------------
      */

        /**
         * @name githubLoadReposEvent
         * @desc suscribe to the event when repositories are loaded.
         */
        $scope.$on('githubLoadReposEvent', function (event, data) {
            vm.repositories = data.repositories;
            $mdSidenav('project').toggle();
        });

        /**
         * @name aceChangeEvent
         * @desc suscribe to the aceChangeEvent in order to have the content of the editor for write action.
         */
        $scope.$on('aceChangeEvent', function (event, data) {
            vm.currentEditorFile = data.file;
        });

       /**
        * @name pushContentEvent
        * @desc suscribe to the pushContentEvent in order commit the file to github
        */
       $scope.$on('pushContentEvent', function (event, data) {
         vm.pushContent(data.message);
       });

       vm.sendAceLoadContentEvent = function(data){
         $rootScope.$broadcast('aceLoadContentEvent', data);
       };

       /**
        * Send a message to notify the user
        * @param data
        */
       vm.sendNotifyUserEvent = function(data){
         $scope.$emit('notifyUserEvent', data);
       };

       /**
        * Send a event to add a file to the project
        * @param data
        */
       vm.sendAddFileToProjectEvent = function(data){
         $scope.$emit('addFileToProjectEvent', data);
       };

       /**
        * Send a event to update the sha of a file
        * @param data
        */
       vm.sendUpdateSHAEvent = function(content){
         console.log("New sha to update for this file :" +content.sha);
         vm.currentEditorFile.github.sha = content.sha;
         $scope.$emit('updateSHAEvent', content.sha);
       };

     /**
      * ACTIONS
      * ----------------------------------------
      */

        /**
         * @name getFiles
         */
        vm.getFiles = function(sha){
            $gh.setCreds($rootScope.user.auth.github.accessToken);
            $gh.getRepo($rootScope.user.auth.github.username, vm.selectedRepository.name)
                .then(function(repo) {
                    if (sha)
                        return repo.git.getTree(sha, {});
                    else
                        return repo.git.getTree('master', {});
                })
                .then(function(tree){
                    vm.selectedRepository.files = tree;
                });
        };

     /**
      * Add a file hosted to github to the current project.
      *
      * @param repoName
      * @param sha
      * @param path
      */
        vm.addToProject = function(repoName, sha, path) {
            if (repoName ==  null)
                repoName = vm.selectedRepository.name;

            $gh.setCreds($rootScope.user.auth.github.accessToken);

            $gh.getRepo($rootScope.user.auth.github.username, repoName)
                .then(function (repo) {
                    return repo.git.getBlob(sha);
                })
                .then(function (content) {
                    vm.currentEditorFile = ProjectService.createFile("github", path, content, {
                        path: path,
                        repo: repoName,
                        sha: sha
                      });

                    vm.sendAddFileToProjectEvent({
                      file: vm.currentEditorFile
                    });
                }).then(null, function (error) {
                    vm.sendNotifyUserEvent({
                      file: vm.currentEditorFile,
                      message: "An error occured with " + vm.currentEditorFile.name  + " file."
                    });
                });
        }

       /**
        * Push content to github with the commit message and
        * send an event to notify the user about the result.
        *
        * @param message the commit message
        */
        vm.pushContent = function(message) {
            $gh.setCreds($rootScope.user.auth.github.accessToken);

            $gh.getRepo($rootScope.user.auth.github.username, vm.currentEditorFile.github.repo)
                .then(function (repo) {
                    if (message == null){
                      message = "Update " + vm.currentEditorFile.github.path;
                    }
                    var encode = true;
                    return repo.git.
                      updateFile(vm.currentEditorFile.github.path, message, vm.currentEditorFile.github.sha, vm.currentEditorFile.asciidoc, encode);
                })
                .then(function (res) {
                  vm.sendUpdateSHAEvent(res.content);
                  vm.sendNotifyUserEvent({
                        message: ['Your work on ', vm.currentEditorFile.github.repo
                            ,'/' , vm.currentEditorFile.github.path , ' file has been successfully push.'].join('')
                    });

                }).then(null, function (error) {
                    console.log("Error :" + error);
                    vm.sendNotifyUserEvent({
                      message: ['ERROR ! Your work on ', vm.currentEditorFile.github.repo
                        ,'/' , vm.currentEditorFile.github.path , ' was NOT pushed to github.'].join('')
                    });
                });
        }

    };


    /**
     * @name GithubSearchFilesCtrl
     * @desc search github files based on user query.
     * @param {Object} $rootScope - the root scope of this application
     * @param {Object} $gh - the Github Client API based on Octokit
     */
    function GithubSearchFilesCtrl($rootScope, $gh){
        var vm = this;

        vm.query = "";
        vm.results = {};

        /**
         * @name searchAsciiDocFiles
         * @desc search AsciiDoc files into user github's repositories.
         * @returns {array} an array of files which filename macthes with thr query
         */
        vm.searchAsciiDocFiles = function(){
            $gh.setCreds($rootScope.authData.github.accessToken);

            var q = vm.query + '+in:path+language:asciidoc+user:'+$rootScope.authData.github.username;
            $gh.getSearch()
                .then(function(search){
                    return search.searchCode(q, 'indexed', 'asc');
                })
                .then(function(res){
                    vm.results = res;
                });
        };

    }

    module.controller('GithubFilesCtrl', GithubFilesCtrl);
    module.controller('GithubSearchFilesCtrl', GithubSearchFilesCtrl);

})();
