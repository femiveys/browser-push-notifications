Router.map(function() {
  this.route('bpNotifications', {
    where: 'server',
    path: SW_FOLDER + '/bp_notifications/:subscription_id',
    action: function() {
      // Check the values in the cookies
      var cookies = new Cookies( this.request );
      var userId = cookies.get("meteor_user_id") || "";
      var token  = cookies.get("meteor_token")   || "";

      // Check a valid user with this token exists
      var user = Meteor.users.findOne({
        'services.resume.loginTokens.hashedToken' : Accounts._hashLoginToken(token),
        _id: userId,
      });

      // Prepare the response
      this.response.writeHead(200, {'Content-Type': 'application/json'});

      // If not logged in send an error JSON
      if(!user) {
        this.response.statusCode = 401;
        this.response.end(JSON.stringify({error: "Not allowed"}));
      } else {
        var subscriptionId = decodeURIComponent(this.params.subscription_id);
        var notifications = bpSubscriptions.getNotifications(subscriptionId, user._id);

        // We send the notifications in the response and as then the
        // notifictions have been requested, we can set the callback date so
        // they cannot be requested again
        this.response.end(
          JSON.stringify({notifications: notifications}),
          Meteor.bindEnvironment(function() {
            bpNotifications.archive(notifications);
          })
        );
      }
    }
  });
});
