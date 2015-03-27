(function(){

    var module = angular.module('editAdoc.editor.controller', []);

    function EditorCtrl($rootScope, $scope, Editor, Storage, SyncProject) {
        var vm = this;

        vm.aceLoaded = Editor.aceLoaded;

        vm.aceChanged = function () {
            vm.onAceChange();
        };

        /**
         * When the editor is ready
         */
        Editor.ready(function () {
            Storage.load('file').then(function (data) {
              if (data){
                Editor.initFileInEditorFromBrowser(data);
              }
              Editor.updateAsciidoc();
            });
        });

        /**
         * Call on each change
         */
        vm.onAceChange = function (e) {
            Editor.updateAsciidoc();
            //Storage.save('asciidoc', value);

            //broadcast event for preview
            $rootScope.$broadcast('aceChangeEvent', {
                file : Editor.getFile()
            });
        }

        /**
        * A new content is loaded into the editor.
         * A backup is automatically done.
        */
        $scope.$on('aceLoadContentEvent', function (event, data) {
            Editor.setUser($rootScope.user.auth.uid);
            Editor.setValue(data.file);
            vm.onAceChange();
        });

    }

    module.controller('EditorCtrl', EditorCtrl);


})();
