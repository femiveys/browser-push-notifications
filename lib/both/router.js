Router.map(function() {
  this.route('pNotifications', {
    where: 'server',
    path: '/p_notifications/:subscription_id',
    action: function() {
      //Check the values in the cookies
      var cookies = new Cookies( this.request ),
         userId = cookies.get("meteor_user_id") || "",
         token = cookies.get("meteor_token") || "";

      //Check a valid user with this token exists
      var user = Meteor.users.findOne({
         _id: userId,
         'services.resume.loginTokens.hashedToken' : Accounts._hashLoginToken(token)
      });

      this.response.writeHead(200, {'Content-Type': 'application/json'});

      //If they're not logged in tell them
      if(!user) {
        this.response.statusCode = 401;
        this.response.end(JSON.stringify({error: "Not allowed"}));
      } else {
        var subscriptionId = decodeURIComponent(this.params.subscription_id);
        var notifications = Meteor.call('getNewPNotifications', subscriptionId, user._id);

        // We send the notifications in the response and as then the
        // notifictions have been requested, we can set the callback date so
        // they cannot be requested again
        this.response.end(
          JSON.stringify({notifications: notifications}),
          Meteor.bindEnvironment(function() {
            Meteor.call('archivePNotifications', notifications);
          })
        );
      }
    }
  });
});

