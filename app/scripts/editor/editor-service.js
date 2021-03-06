'use strict';
(function(){

    var module = angular.module('editAdoc.editor.service', []);

    module.service('Editor', ["SyncProject", "SyncCollaborative", "Storage", function Editor (SyncProject, SyncCollaborative, Storage) {
        var editor = null
        var onReadyFns = [];
        var changeFoldFns = [];
        var that = this;

        /** Revision file loaded into the editor
         *  {
         *    $id: "-JID5410...."
         *    asciidoc: "= title 1",
         *    projectId: "project-XXXXXX",
         *    fileId: "file-XXX"
         *    label: "auto"
         *  }
         *
         */
        that.fileRevision =  null;

        that.syncFileRevision = null;

        /**
         * events on the document represented this file
         *
         */
        that.syncEvent = false;
        that.refFileRevisionEvent = null;
        that.refEventFromFirebase = null;
        that.onDataEvent = null;

        /** the userId connected to the app */
        that.user =  null;

        /** work with several users on the same revision file ?*/
        that.isCollaborativeMode = true;


        function clearAnnotation() {
            editor.getSession().clearAnnotations();
        }

        function aceLoaded(e) {

            // Assign class variable `editor`
            window.e = editor = e;

            //ace.config.set('basePath', 'bower_components/ace-builds/src-noconflict');

            // Set editor options
            editor.setOptions({
                enableSnippets: true,
                showPrintMargin: true,
                showGutter: true
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

        /**
         * Each time the Document changes by an user action or by the API.
         *
         * @param event the event on the Ace Document
         */
        function onChangeDocument(event) {

            initDocEventsForFile();
            //keep the local asciidoc up to date
            if (that.fileRevision) {
                that.fileRevision.asciidoc = that.getValue();
                that.syncFileRevision.$loaded().then(
                    function(data){
                        that.syncFileRevision.asciidoc = that.getValue();
                        if (that.syncFileRevision.fileId && that.syncFileRevision.projectId){
                            that.syncFileRevision.$save().then(function(data){
                                var fileRevToStore = {
                                    $id : that.syncFileRevision.$id,
                                    asciidoc : that.syncFileRevision.asciidoc,
                                    fileId: that.syncFileRevision.fileId,
                                    projectId: that.syncFileRevision.projectId
                                }
                                Storage.save("fileRevision", fileRevToStore);
                                //console.log("update asciidoc on firebase");
                            });

                        }
                    }
                );
            }

            //synchronize event on firebase if the user is connected
            //and if this event is not send by the server
            if (editor && editor.curOp && editor.curOp.command.name){
                //User change
                if (that.user != null){
                    //Try with a push
                    that.refFileRevisionEvent = SyncCollaborative.syncFileRevisionEvent(that.syncFileRevision.projectId, that.syncFileRevision.fileId, that.syncFileRevision.$id);
                    that.refFileRevisionEvent.push({
                        "user": that.user,
                        "event": event
                    }).setPriority(Firebase.ServerValue.TIMESTAMP);
                }
            } else {
                //API Change
                //console.log("doc : API change (don't fire event to firebase)");
                if (editor){
                    editor.getSession().setAnnotations([{
                        row: event.data.range.start.row,
                        column: event.data.range.end.column,
                        text: "a user is typing...",
                        type: "warning" // also warning and information
                    }]);
                }
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
        function initDocEventsForFile(newFileRevision){

            if(that.isCollaborativeMode == true) {
                if (that.fileRevision && (that.syncEvent == false || (newFileRevision && newFileRevision.$id != that.fileRevision.$id))) {
                    that.refEventFromFirebase = SyncCollaborative.syncFileRevisionEvent(that.syncFileRevision.projectId, that.syncFileRevision.fileId, that.syncFileRevision.$id);
                    that.syncEvent = true;
                    that.onDataEvent = that.refEventFromFirebase.startAt(Date.now()).on("child_added", function (snapshot) {
                        var collab = snapshot.val();
                        if (editor && that.user != null && collab.user != that.user) {
                            var events = [collab.event.data];
                            editor.getSession().getDocument().applyDeltas(events);
                        }
                    });
                }
            }
        }

        /**
         * Load a file from local storage
         * @param file
         */
        function initFileRevisionInEditor(fileRevision){
             setValue(fileRevision.asciidoc);
            initDocEventsForFile(fileRevision);

        }

        function setProjectId(projectId){
            that.fileRevision.projectId = projectId;
        }

        /**
         * Set the UID from the connected user
         * @param userUid
         */
        function setUser(userUid){
            that.user = userUid;
        }

        /**
         * Attac a file to this editor session
         * @param file
         */
        function attachFileRevision(fileRevision){

            resetDatasAndRef();

            if(fileRevision && fileRevision.projectId && fileRevision.fileId && fileRevision.$id) {
                that.fileRevision = fileRevision;
                that.syncFileRevision = SyncProject.syncFileRevisionAsObject(that.fileRevision.projectId, that.fileRevision.fileId, that.fileRevision.$id);
                that.syncFileRevision.$loaded().then(
                    function(){
                        initFileRevisionInEditor(fileRevision);
                    }
                );
            } else {
                console.log("[WARN] file revision not attached.")
            }
        }

        /**
         * Close a file, clear all sync references.
         */
        function closeCurrentFileRevision(){
            that.fileRevision =  null;
            resetDatasAndRef();

            if (editor){
             editor.getSession().setValue("");
            }
            Storage.reset();
        }

        function resetDatasAndRef(){
            if(that.refEventFromFirebase){
                that.refEventFromFirebase.off("child_added", that.onDataEvent);
                that.refEventFromFirebase = null;
            }
            if(that.syncFileRevision)
                that.syncFileRevision.$destroy();
            if(that.refFileRevisionEvent)
                that.refFileRevisionEvent = null;
            that.syncEvent = false;
        }

        /**
         * Set a string as a whole document to this editor session.
         *
         * @param content the string representing the whole document
         */
        function setValue(content) {

          //  if(that.isCollaborativeMode == false) {
                if (angular.isString(content) && editor) {
                    editor.getSession().setValue(content);
                    //that.file.document = editor.getSession().getDocument().getAllLines();
                }
           // }else{
                //initDocEventsForFile(fileRevision);
           // }
            //Storage.save("file", that.file);
        }

        function hasAlreadyFileRevisionAttached(){
            if(that.fileRevision && that.fileRevision.fileId && that.fileRevision.projectId){
                return true;
            } else{
                return false;
            }
        }

        function loadAsciidocFromAttachedFileRevision() {
              setValue(that.fileRevision.asciidoc);
        }

        function getFile() {
            return that.fileRevision;
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
        this.attachFileRevision = attachFileRevision;
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
        this.initFileRevisionInEditor = initFileRevisionInEditor;
        this.setUser = setUser;
        this.hasAlreadyFileRevisionAttached = hasAlreadyFileRevisionAttached;
        this.loadAsciidocFromAttachedFileRevision = loadAsciidocFromAttachedFileRevision;
        this.closeCurrentFileRevision = closeCurrentFileRevision;
    }]);


})();
