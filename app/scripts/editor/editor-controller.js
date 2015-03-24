(function(){

    var module = angular.module('editAdoc.editor.controller', []);

    function EditorCtrl($rootScope, $scope, Editor, Storage) {
        var vm = this;

        vm.aceLoaded = Editor.aceLoaded;

        vm.aceChanged = function () {
            //Storage.save('progress', 0);
            //debouncedOnAceChange();
            vm.onAceChange();
        };

        Editor.ready(function () {
            Storage.load('file').then(function (data) {
              if (data){
                Editor.setValue(data);
              }
              Editor.updateAsciidoc();
              //vm.onAceChange(vm.file);
            });

        });

        vm.onAceChange = function () {
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
            Editor.setValue(data.file);
            vm.onAceChange();

        });

    }

    module.controller('EditorCtrl', EditorCtrl);


})();
