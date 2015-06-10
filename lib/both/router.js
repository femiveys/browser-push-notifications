Router.map(function() {
  this.route('pNotifications', {
    where: 'server',
    path: '/p_notification/:subscription_id',
    action: function() {
      // TODO: Add support for multiple devices
      var subscriptionId = decodeURIComponent(this.params.subscription_id);
      var notification = Meteor.call('getPNotification', subscriptionId);

      if(notification) {
        this.response.writeHead(200, {'Content-Type': 'application/json'});
        this.response.end(JSON.stringify({
          notification : {
            title: notification.title,
            message: notification.message,
            icon: notification.icon || Config.pNotifications.icon,
          }
        }));
      } else {
        throw new Meteor.Error('pNotifications-error',
                                   'The notification was empty. Returned null');
      }

    }
  });
});
