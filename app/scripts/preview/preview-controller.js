(function(){

    var module = angular.module('editAdoc.preview.controller', []);

    function PreviewCtrl($scope, Storage){
        var vm = this;

        vm.asciidoc = {};
        vm.asciidoc.options = Opal.hash2(['safe', 'attributes'], {'safe': 'unsafe', 'attributes': 'showtitle showauthor icons=font@'});


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
          var els = element.find('a[href^="#"]');
          if (els.length > 0)
            element.find('a[href^="#"]').each(function() {
                var el = angular.element(this);
                el.on('click', function(){
                    $location.hash(el.attr('href'));
                    $anchorScroll();
                });
            });

            return element;
        };

        $scope.$on('aceChangeEvent', function (event, data) {
            if (data.fileRevision){
                vm.asciidoc.ascii = data.fileRevision.asciidoc;
            }
        });
    }

    module.controller("PreviewCtrl", PreviewCtrl);

})();
