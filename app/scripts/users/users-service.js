(function(){

    var module = angular.module("editAdoc.users.service", []);

  /**
   * Users service
   *
   */
  module.service('UsersService',["SyncUser", "SyncProject", "SyncUsersPresence", "$q", "$rootScope", function(SyncUser, SyncProject, SyncUsersPresence, $q, $rootScope) {

    /**
    *  Add a listener to know when a user is attached on a project by an other user.
    * @param authData
    */
    function listenToInvitationOnProject(authData) {
        var refUserProjects = SyncUser.syncUserProjects(authData.uid);

        refUserProjects.on("child_added", function(snapshot) {
            if ($rootScope.user){
                var newProject = snapshot.val();
                if (newProject.owner == false){
                    $rootScope.$broadcast('notifyUserEvent', { message : "Congrats, You have been associated to the Project : " + newProject.name})
                }
            }
        });
    }

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
      var deferred = $q.defer();
      var p = SyncUser.syncUserProjectAsObject(userId, projectId);

      p.$loaded().then(function(data) {
          p.id = projectId;
          p.name = projectName;
          p.owner = owner;
          p.$save().then(function(){deferred.resolve(p)});
      });

      return deferred.promise;

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
     * @returns a list of projects for the userId
     */
    function getUserProjects(userId) {
      var user = getUser(userId);
      return user.projects;;
    };

    /**
    * Get the list of users attached on a project
     *
     * {
     *   userID : {
     *      id :
     *   }
     * }
    *
    * @param projectId
    * @returns a list of users for the projectId
    */
    function getUsersProject(projectId) {
      var deferred = $q.defer();
      var users = new Array();
      var list = SyncProject.syncUsersAsArray(projectId);

      list.$loaded().then(function(data) {
          angular.forEach(list, function(user) {
             SyncUsersPresence.syncUserAsObject(user.$id).$loaded().then(
                  function(data){
                      users.push(data);
                  }
              );

          });
          deferred.resolve(users);
      });
        return deferred.promise;
    };

    this.getUser = getUser;
    this.createOrUpdateUser = createOrUpdateUser;
    this.getUserProjects = getUserProjects;
    this.getUsersProject = getUsersProject;
    this.attachProjectToUser = attachProjectToUser;
    this.listenToInvitationOnProject = listenToInvitationOnProject;

  }]);



})();
