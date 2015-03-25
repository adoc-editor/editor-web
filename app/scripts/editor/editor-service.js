'use strict';
(function(){

    var module = angular.module('editAdoc.editor.service', []);

    module.service('Editor', [ "ProjectService", "Storage", function Editor (ProjectService, Storage) {
        var editor = null
        var onReadyFns = [];
        var changeFoldFns = [];
        var that = this;

        /** file loaded to the editor */
        that.file =  ProjectService.createSampleRevisionForFile();


        function clearAnnotation() {
            editor.getSession().clearAnnotations();
        }

        function aceLoaded(e) {

            // Assign class variable `editor`
            window.e = editor = e;

            //ace.config.set('basePath', 'bower_components/ace-builds/src-noconflict');

            // Set editor options
            editor.setOptions({
                enableSnippets: true
            });

            // Editor is ready, fire the on-ready function and flush the queue
            onReadyFns.forEach(function (fn) {
                fn(that);
            });
            onReadyFns = [];

            var session = editor.getSession();

            // Hookup changeFold listeners
            session.on('changeFold', onChangeFold);

            configureSession(session);
        }

        function onChangeFold() {
            var args = arguments;
            changeFoldFns.forEach(function (fn) {
                fn.apply(editor, args);
            });
        }

        function configureSession(session) {
            session.setTabSize(2);
        }

        function setValue(file) {
            that.file = file;
            if (angular.isString(file.asciidoc) && editor) {
                editor.getSession().setValue(file.asciidoc);
            }
          Storage.save("file", that.file);
        }

      function updateAsciidoc() {
        that.file.asciidoc = that.getValue();
        Storage.save("file", that.file);
      }

        function getFile() {
            return that.file;
        }

        function getValue() {
            if (editor) {
                return editor.getSession().getValue();
            }
        }

        function resize() {
            editor.resize();
        }

        function ready(fn) {
            if (angular.isFunction(fn)) {
                onReadyFns.push(fn);
            }
        }

        function getAllFolds() {
            var session = editor.getSession();
            var folds = null;

            session.foldAll();
            folds = session.unfold();

            return Array.isArray(folds) ? folds : [];
        }

        function getLine(l) {
            return editor.session.getLine(l);
        }

        function onFoldChanged(fn) {
            changeFoldFns.push(fn);
        }

        function addFold(start, end) {
            if (editor) {
                editor.getSession().foldAll(start, end);
            }
        }

        function removeFold(start) {
            // TODO: Depth of unfolding is hard-coded to 100 but we need
            // to have depth as a parameter and/or having smarter way of
            // handling subfolds
            if (editor) {
                editor.getSession().unfold(start, 100);
            }
        }

        function gotoLine(line) {
            editor.gotoLine(line);
        }

        function lineInFocus() {
            if (!editor) {
                return null;
            }
            return editor.getCursorPosition().row;
        }

        this.getValue = getValue;
        this.updateAsciidoc = updateAsciidoc;
        this.getFile = getFile;
        this.setValue = setValue;
        this.aceLoaded = aceLoaded;
        this.resize = resize;
        this.ready = ready;
        this.clearAnnotation = clearAnnotation;
        this.getAllFolds = getAllFolds;
        this.getLine = getLine;
        this.onFoldChanged = onFoldChanged;
        this.addFold = addFold;
        this.removeFold = removeFold;
        this.gotoLine = gotoLine;
        this.lineInFocus = lineInFocus;
    }]);


})();
