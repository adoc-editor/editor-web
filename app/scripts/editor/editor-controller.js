(function(){

    var module = angular.module('editAdoc.editor.controller', []);

    function EditorCtrl($rootScope, $scope, Editor, Storage) {
        var vm = this;

        vm.aceLoaded = Editor.aceLoaded;

        vm.aceChanged = function () {
            vm.onAceChange();
        };

        /**
         * When the editor is ready
         */
        Editor.ready(function () {
            if($rootScope.user) {
                Editor.setUser($rootScope.user.auth.uid);
            }
            Storage.load('fileRevision').then(function (data) {
              if (data){
                  //Check if there is already a file attach to the editor
                  if (!Editor.hasAlreadyFileRevisionAttached()){
                      //attach a file revision only if this file is associated to
                      // a project and a file
                      if (data.fileId && data.projectId){
                          Editor.attachFileRevision(data);
                      }
                  } else {
                      //a file revision is attached, load this asciidoc content
                      Editor.loadAsciidocFromAttachedFileRevision();
                  }
              }
            });
        });

        /**
         * Call on each change
         */
        vm.onAceChange = function (e) {
            if($rootScope.user) {
                Editor.setUser($rootScope.user.auth.uid);
            }

            //broadcast event for preview
            $rootScope.$broadcast('aceChangeEvent', {
                fileRevision : Editor.getFile()
            });
        }

        /**
        * A new content is loaded into the editor.
         * A backup is automatically done.
        */
        $scope.$on('aceLoadContentEvent', function (event, data) {
            if($rootScope.user) {
                Editor.setUser($rootScope.user.auth.uid);
            }
            Editor.attachFileRevision(data.fileRevision);

            //broadcast event for preview
            $rootScope.$broadcast('aceChangeEvent', {
                fileRevision : Editor.getFile()
            });
        });

    }

    module.controller('EditorCtrl', EditorCtrl);


})();
