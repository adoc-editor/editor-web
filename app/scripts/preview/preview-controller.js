(function(){

    var module = angular.module('editAdoc.preview.controller', []);

    function PreviewCtrl($scope, $location, Storage){
        var vm = this;

        vm.asciidoc = {};
        vm.asciidoc.options = Opal.hash2(['safe', 'attributes'], {'safe': 'unsafe', 'attributes': 'showtitle=@ icons=font sectanchors=@ source-highlighter=highlightjs@'});


        Storage.load('fileRevision').then(function (data) {
           if (data){
            vm.asciidoc.ascii = data.asciidoc;
           }
        });

        /**
         * Define Post processor to change html generated with asciidoc
         * @param  {angular.element} element [description]
         * @return {html} html updated
         */
        vm.asciidoc.postProcessor = function(element) {
            //highlight
            var elsH = element.find('code');
            angular.forEach(elsH, function(element){
                hljs.highlightBlock(element);
            });

          //TODO handle toc link
            return element;
        };

        $scope.$on('aceChangeEvent', function (event, data) {
            if (data.fileRevision){
                vm.asciidoc.ascii = data.fileRevision.asciidoc;
            }
        });

        $scope.$on('closeFileEvent', function (event, data) {
            vm.asciidoc.ascii = "  ";
        });
    }

    module.controller("PreviewCtrl", PreviewCtrl);

})();
