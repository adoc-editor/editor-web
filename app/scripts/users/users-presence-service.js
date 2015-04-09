(function(){

    var module = angular.module("editAdoc.users.presence", []);

  module.factory('UsersPresence', ['$rootScope', "defaults" ,"SyncUserConnected", "SyncUser", "SyncUsersPresence",

      function($rootScope, defaults, SyncUserConnected, SyncUser, SyncUsersPresence) {
          var onlineUsers = 0;
          var that = this;

          // client connected (anonymous and auth)
          var connectedRef = SyncUserConnected.sync();

          // Create our references for authenticate users
          var presenceRef = SyncUsersPresence.sync();


          // Get the user count and notify the application
          presenceRef.on('value', function(snap) {
              onlineUsers = snap.numChildren();
              $rootScope.$broadcast('onOnlineUser', { nbAuthUsers : onlineUsers});
          });

          //new user connected
          if (defaults.enableOnOnlineUserNotification){
              presenceRef.on("child_changed", function(snapshot) {
                  if ($rootScope.user){
                      var newUserConnected = snapshot.val();
                      if (newUserConnected.username && newUserConnected.username != null &&
                          newUserConnected.username != $rootScope.user.auth.github.username && newUserConnected.isOnline){
                        $rootScope.$broadcast('onNewUserConnected', { user : newUserConnected})
                      }
                  }

              });
          }

          var setUserConnectionAsAuthenticated = function(authData) {
              var myPresenceRef = SyncUsersPresence.syncUser(authData.uid);
              var myConnectionsRef = SyncUsersPresence.syncUserConnections(authData.uid);
              var myLastOnlineRef = SyncUsersPresence.syncUserLastOnline(authData.uid);
              var myStatusOnlineRef = SyncUsersPresence.syncUserIsOnline(authData.uid);

              myPresenceRef.set({"username" : authData.github.username, "avatar" : authData.github.cachedUserProfile.avatar_url });
              var con = myConnectionsRef.push(true);
              myStatusOnlineRef.set(true);
              // when I disconnect, remove this device
              con.onDisconnect().remove();
              // when I disconnect, update the last time I was seen online
              myStatusOnlineRef.onDisconnect().set(false);
              myLastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
          }


          return {
              setUserConnectionAsAuthenticated: setUserConnectionAsAuthenticated
          }
      }
  ]);

})();
