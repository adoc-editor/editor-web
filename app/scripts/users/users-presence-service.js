(function(){

    var module = angular.module("editAdoc.users.presence", []);

  module.factory('UsersPresence', ['$rootScope', "SyncUserConnected", "SyncUser", "SyncUsersPresence",

      function($rootScope, SyncUserConnected, SyncUser, SyncUsersPresence) {
          var onlineUsers = 0;
          var that = this;

          // client connected (anonymous and auth)
          var connectedRef = SyncUserConnected.sync();

          // Create our references for authenticate users
          var presenceRef = SyncUsersPresence.sync();


          // Add ourselves to presence list when online.
          connectedRef.on('value', function(isOnline) {

              if (isOnline.val()) {
                  console.log("I'm online");

              } else {

                  // We need to catch anytime we are marked as offline and then set the correct status. We
                  // could be marked as offline 1) on page load or 2) when we lose our internet connection
                  // temporarily.
                  console.log("I'm offline");

              }
          });

          // Get the user count and notify the application
          presenceRef.on('value', function(snap) {
              onlineUsers = snap.numChildren();
              $rootScope.$broadcast('onOnlineUser', { nbAuthUsers : onlineUsers});
          });

          //new user connected
          presenceRef.on("child_changed", function(snapshot) {
              var newUserConnected = snapshot.val();
              if (newUserConnected.username && newUserConnected.username != null && newUserConnected.isOnline){
                $rootScope.$broadcast('onNewUserConnected', { user : newUserConnected})
              }

          });

          var setUserConnectionAsAuthenticated = function(authData) {
              var myPresenceRef = SyncUsersPresence.syncUser(authData.uid);
              var myConnectionsRef = SyncUsersPresence.syncUserConnections(authData.uid);
              var myLastOnlineRef = SyncUsersPresence.syncUserLastOnline(authData.uid);
              var myStatusOnlineRef = SyncUsersPresence.syncUserIsOnline(authData.uid);

              myPresenceRef.set({"username" : authData.github.username});
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
