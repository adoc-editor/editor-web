(function(){

    var module = angular.module("editAdoc.users.service", []);

  /**
   * Users service
   *
   */
  module.service('UsersService',["SyncUser", function(SyncUser) {

    /**
     * Create a new user
     * @param authData the authentification data from Firebase
     */
    function createOrUpdateUser(authData) {
      var user = getUser(authData.uid);

      user.$loaded().then(function(data) {
          user.auth = authData;
          user.$save();
      });
      return user;

    };

      /**
       * Attach a project to a user.
       *
       */
      function attachProjectToUser(userId, projectId, projectName, owner) {
          var p = SyncUser.syncUserProjectAsObject(userId, projectId);

          p.$loaded().then(function(data) {
              p.id = projectId;
              p.name = projectName;
              p.owner = owner;
              p.$save();
          });
          return p;

      };

    /**
     * Get a user by his firebase id
     * @param projectId the project id
     */
    function getUser(userId) {
      return SyncUser.syncUserAsObject(userId);
    };

    /**
     * Get an array of projects for a userId
     *
     * @param userId
     * @returns {$rootScope.user.projects|*|ProjectFilesCtrl.projects}
     */
    function getUserProjects(userId) {
      var user = getUser(userId);
      return user.projects;;
    };

    this.getUser = getUser;
    this.createOrUpdateUser = createOrUpdateUser;
    this.getUserProjects = getUserProjects;
    this.attachProjectToUser = attachProjectToUser;

  }]);



})();
