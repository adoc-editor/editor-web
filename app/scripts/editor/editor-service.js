'use strict';
(function(){

    var module = angular.module('editAdoc.editor.service', []);

    module.service('Editor', [ "ProjectService", "SyncProject", "Storage", function Editor (ProjectService, SyncProject, Storage) {
        var editor = null
        var onReadyFns = [];
        var changeFoldFns = [];
        var that = this;

        /** file loaded into the editor */
        that.file =  ProjectService.createSampleRevisionForFile();

        /** The projectId of the edited file **/
        that.projectId;
        /** events on the document represented this file */
        that.docEvents = null;
        that.user =  null;

        that.collaborativeActivate = true;


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
            session.on('change', onChangeDocument);

            configureSession(session);
        }

        function onChangeDocument(event) {
            initDocEventsForFile();
            //synchronize event on firebase if the user is connected
            //and this event is not already into the array
            if (editor.curOp && editor.curOp.command.name){
                //User change
                console.log("user change (send to firebase)");
                if (that.user != null){
                    var collEvent = {
                        "user": that.user,
                        "event": event
                    }
                    that.docEvents.$add(collEvent);

                }

            } else {
                //API Change
                console.log("api change, don't fire event to firebase");

            }
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

        /**
         * init collaborative events on a file
         * @param file
         */
        function initDocEventsForFile(file){
            if(that.collaborativeActivate == true){
                if (that.projectId && that.file && (that.docEvents == null
                    || (file && file.$id != that.file.$id)) ){
                    that.docEvents = SyncProject.syncFileRevisionEventAsArray(that.projectId, that.file.id, that.file.$id);
                    //watch events to add event from other users
                    that.docEvents.$watch(function(event) {
                        if (editor && that.user != null && that.docEvents.$getRecord(event.key).user != that.user){
                            var events = [that.docEvents.$getRecord(event.key).event.data];
                            editor.getSession().getDocument().applyDeltas(events);
                            that.file.asciidoc = that.getValue();
                        }
                    })
                }
            }
        }

        /**
         * Load a file from local storage
         * @param file
         */
        function initFileInEditorFromBrowser(file){
            setValue(file);
            initDocEventsForFile(file);
        }

        function setProjectId(projectId){
            that.projectId = projectId;
        }

        /**
         * Set the UID from the connected user
         * @param userUid
         */
        function setUser(userUid){
            that.user = userUid;
        }

        function setValue(file) {

            that.file = file;
            that.projectId = file.projectId;

            if(that.collaborativeActivate == false) {
                if (angular.isString(file.asciidoc) && editor) {
                    editor.getSession().setValue(file.asciidoc);
                    that.file.document = editor.getSession().getDocument().getAllLines();
                }
            }else{
                initDocEventsForFile(file);
            }
            Storage.save("file", that.file);
        }

        function updateAsciidoc() {
              if(that.collaborativeActivate == false){
                  that.file.asciidoc = that.getValue();
                  if (editor) {
                      that.file.document = editor.getSession().getDocument().getAllLines();
                  }
              }
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
        this.setprojectId = setProjectId;
        this.initFileInEditorFromBrowser = initFileInEditorFromBrowser;
        this.setUser = setUser;
    }]);


})();
