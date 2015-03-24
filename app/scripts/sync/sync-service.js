(function(){

    var module = angular.module("editAdoc.sync.service", []);

  module.factory("SyncAuth", ["FBURL", "$firebaseAuth", function(FBURL, $firebaseAuth){
    var ref = new Firebase(FBURL);
    return function() {
      return $firebaseAuth(ref);
    }
  }]);

  module.factory("Sync", ["FBURL", function(FBURL){
    var ref = new Firebase(FBURL);
    return function() {
      return ref;
    }
  }]);

  module.factory("SyncProject", ["FBURL", "$firebaseObject", "$firebaseArray", function(FBURL, $firebaseObject, $firebaseArray){
    var ref = new Firebase(FBURL+"/projects/");

    var syncAsObject = function(projectId) {
      return $firebaseObject(ref.child(projectId));
    }

    var syncFileAsObject = function(projectId, fileId) {
          return $firebaseObject(ref.child(projectId).child("files").child(fileId));
    }

      var syncFileAsArray = function(projectId, fileId) {
          return $firebaseArray(ref.child(projectId).child("files").child(fileId));
      }

    var sync = function() {
      return ref;
    }

    return {
      syncAsObject: syncAsObject,
      syncFileAsObject: syncFileAsObject,
      syncFileAsArray: syncFileAsArray,
      sync: sync
    }
  }]);

  module.factory("SyncUser", ["FBURL", "$firebaseObject", "$firebaseArray", function(FBURL, $firebaseObject, $firebaseArray){
      var ref = new Firebase(FBURL+"/users/");

      var syncUserAsObject = function(userid) {
        return $firebaseObject(ref.child(userid));
      }

      var syncUserAuthAsObject = function(userid) {
          return $firebaseObject(ref.child(userid).child("auth"));
      }

      var syncUserProjectAsObject = function(userid, projectId) {
          return $firebaseObject(ref.child(userid).child("projects").child(projectId));
      }

      var syncUsersAsObject = function() {
          return $firebaseObject(ref);
      }
      var sync = function() {
        return ref;
      }
        var syncUsersAsArray = function() {
          return $firebaseArray(ref);
        }

      return {
        syncUserAsObject: syncUserAsObject,
        syncUserAuthAsObject: syncUserAuthAsObject,
        syncUserProjectAsObject: syncUserProjectAsObject,
        syncUsersAsObject: syncUsersAsObject,
        sync: sync,
        syncUsersAsArray: syncUsersAsArray
      }
  }]);

  module.factory("SyncUserConnected", ["FBURL", function(FBURL){
    var ref = new Firebase(FBURL+"/.info/connected");

    var sync = function() {
      return ref;
    }

    return {
      sync: sync
    }
  }]);
})();
