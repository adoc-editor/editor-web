(function(){

    var module = angular.module("editAdoc.project.service", ["editAdoc.users.service"]);


  /**
   * Project service
   *
   */
  module.service('ProjectService',["Sync", "SyncProject", "UsersService", function(Sync, SyncProject, UsersService) {

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
     // var project =
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
          });
      });
      return pId;
    };

    /**
     * Add a new file to the project
     * @param projectId the project ID
     * @param file the file object to add to this project
     */
    function addFileToProject(projectId, file) {
       //TODO: check that the file object is correct (id...)
       var fileRef = SyncProject.syncFileAsArray(projectId, file.id).$loaded().then(function(list){
          list.$add( {"revision" : file});
           //list.child("revisions").push(file);

       });
    };

    /**
     * Get a project from Firebase
     * @param projectId the project id
     */
    function getProject(projectId) {
      return SyncProject.syncAsObject(projectId);
    };

    /**
     * Create a sample structured file with github provider
     * @return a sample file
     */
    function createSampleFile() {
      return {
        id: "file:" + this.guid(),
        name: "my-sample.adoc",
        asciidoc : "WELCOME to adoc-editor.io!",
        provider : "github",
        github : {
          path: 'sample.adoc',
          repo: '',
          sha: ''
        }
      }
    };

    /**
     * Create a sample blank asciidoc file without provider
     * @return a sample file
     */
    function createNewBlankFile(name) {
      return {
        id: "file:" + this.guid(),
        name: name,
        asciidoc : "= Asciidoctor FTW"
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
      var file = {
        id: this.guid(),
        name: name,
        asciidoc: content,
        provider: provider
      }
      if (provider === "github"){
        file.github = fileMetadatas;
      }
      return file;
    };

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
    this.getProject = getProject;
    this.createSampleFile = createSampleFile;
    this.createNewBlankFile = createNewBlankFile;
    this.createFile = createFile;
    this.guid = guid;

  }]);

})();
