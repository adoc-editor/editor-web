(function(){

    var module = angular.module("editAdoc.project.service", ["editAdoc.users.service"]);


  /**
   * Project service
   *
   */
  module.service('ProjectService',["$q", "Sync", "SyncProject", "UsersService", function($q, Sync, SyncProject, UsersService) {

    /**
     * Create a new project and attach the user to this project
     * @param projectName the project name
     * @param ownerId the user ID who ask to create this project
     * @param ownerUsername the username who ask to create this project
     */
    function createProject(projectName, ownerId, ownerUsername) {
      var pId = "project:" + this.guid();
      var user = {};
      user[ownerId] = ownerUsername;
      var settings = {};
      settings["save_auto"] = true;
      settings["save_interval"] = "120";
      var syncProject = SyncProject.syncAsObject(pId);
      syncProject.$loaded().then(function(data) {
          syncProject.id = pId;
          syncProject.settings = settings;
          syncProject.name = projectName;
          syncProject.owner = ownerId;
          syncProject.users = user;
          syncProject.$save().then(function (ref) {
              //when the project is added, then attach the project to the user
              UsersService.attachProjectToUser(ownerId, ref.key(), projectName, true);
          }, function (error) {
              console.log("Error: can't create the project.", error);
              //@TODO send an event with error message
          });
      });
      return pId;
    };

    /**
     * Add a new file to the project
     * @param projectId the project ID
     * @param theFile the file object to add to this project
     */
    function addFileToProject(projectId, theFile) {
      var file = SyncProject.syncFileAsObject(projectId, theFile.id);
      file.$loaded().then(function(data){
        file.id = theFile.id;
        file.name = theFile.name;
        file.$save().then(function(ref){
          var fileRevisionsRef = SyncProject.syncFileRevisions(projectId, ref.key());
          theFile.revision.projectId = projectId;
          fileRevisionsRef.push(theFile.revision);

            return file;

        });

      });
    };

    /**
     * Add a new revision to an existing file
     * @param projectId the project ID
     * @param theFile the file object with the revision to add
     */
    function addRevisionToFile(projectId, theFile) {
      var file = SyncProject.syncFileAsObject(projectId, theFile.id);
      file.$loaded().then(function(data){
          var fileRevisionsRef = SyncProject.syncFileRevisions(projectId, theFile.id);
          fileRevisionsRef.push(theFile.revision);
      });
    };



    /**
     * Create a sample structured file with github provider
     * @return a sample file
     */
    function createSampleFile() {
      var uid = this.guid();
      return {
        id: "file:" + uid,
        name: "my-sample.adoc",
        revision : {
            "asciidoc" : "WELCOME to adoc-editor.io!",
            "fileId" : "file:" + uid,
            "label" : "auto",
            "pdf_available" : false,
            "html5_available" : false
          },
        provider : "github",
        github : {
          path: 'sample.adoc',
          repo: '',
          sha: ''
        }
      }
    };

    /**
     * Create a sample structured revision file
     * @return a sample revision for a file
     */
    function createSampleRevisionForFile() {
        var uid = this.guid();
      return {
          "asciidoc" : "WELCOME to adoc-editor.io!",
          "label" : "auto",
          "fileId" : "file:" + uid,
          "pdf_available" : false,
          "html5_available" : false
      }
    };

    /**
     * Create a sample blank asciidoc file without provider
     * @return a sample file
     */
    function createNewBlankFile(name) {
        var uid = this.guid();
      return {
        id: "file:" + uid,
        name: name,
        revision : {
          "asciidoc" : "= Asciidoctor FTW",
          "fileId" : "file:" + uid,
          "label" : "auto",
          "pdf_available" : false,
          "html5_available" : false
        }
      }
    };


    /**
     * Create a file from a provider (github, dropbox...)
     * @param provider github, dropbox
     * @param name name of the file
     * @param content asciidoc content of the file
     * @param fileMetadatas provider metadatas for this file
     * @returns {{id: *, name: *, asciidoc: *, provider: *}}
     */
    function createFile(provider, name, content, fileMetadatas) {
        var uid = this.guid();
      var file = {
        id: "file:" + uid,
        name: name,
        revision : {
          "asciidoc" : content,
          "fileId" : "file:" + uid,
          "label" : "auto",
          "pdf_available" : false,
          "html5_available" : false
        },
        provider: provider
      }
      if (provider === "github"){
        file.github = fileMetadatas;
      }
      return file;
    };

      /**
       *
       * @param projectId
       * @param userId
       */
    function isOwner(projectId, userId){
          var deferred = $q.defer();
      var isOwner;
      var owner = SyncProject.syncOwnerAsObject(projectId);
      owner.$loaded().then(function(data){
          if (owner.$value === userId){
              isOwner = true;
          } else {
              isOwner = false;
          }
          deferred.resolve(isOwner)
      });
       return deferred.promise;
    }

    /**
     * UUID generator
     * @returns {string}
     */
    var s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    var guid = function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    this.createProject = createProject;
    this.addFileToProject = addFileToProject;
    this.createSampleRevisionForFile = createSampleRevisionForFile;
    this.createNewBlankFile = createNewBlankFile;
    this.createFile = createFile;
    this.createSampleFile = createSampleFile;
    this.guid = guid;
    this.isOwner = isOwner;

  }]);

})();
