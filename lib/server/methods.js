Meteor.methods({
  // Subscriptions
  saveSubscription: function(subscriptionId) {
    var doc = {
      subscription_id: subscriptionId,
      owner: Meteor.userId()
    }
    return pSubscriptions.upsert(doc, {$set: doc});
  },
  removeSubscription: function(subscriptionId) {
    return pSubscriptions.remove({ subscription_id: subscriptionId })
  },


  // Notifications
  pushNotification: function(notification, userIds) {
    // If userIds is not set, default it to the current user
    if(!userIds) {
      userIds = [Meteor.userId()];
    }

    // If userIds is not an Array, we make it an array
    if(!Array.isArray(userIds)) {
      userIds = [userIds];
    }

    // We save the notification to be sent for every user in the db
    userIds.forEach(function(userId, index, array) {
      notification.owner = userId;
      pNotifications.insert(notification);
    });

    // Finally we send the push request to the cloud for all subscriptions
    // corresponding to the userIds
    var subscriptionIds = pSubscriptions.getSubscriptionIds(userIds);
    Meteor.call('requestPushNotification', subscriptionIds);
  },
  requestPushNotification: function(registrationIds) {
    var url = 'https://android.googleapis.com/gcm/send';
    var options = {
      headers: {
        'Authorization': 'key=' + Meteor.settings.serviceConfigurations.google.key,
        'Content-Type': 'application/json'
      },
      data: {
        registration_ids: registrationIds,
      }
    };

    HTTP.post(url, options, function (error, result) {
      if (error) {
        throw new Meteor.Error('api-error',
                        'Error while trying to contact google.' + error, error);
      }
    });
  },
  broadcastPushNotification: function() {
    subscriptionIds = pSubscriptions.find().map(function(subscription) {
      return subscription.subscription_id;
    });
    Meteor.call('requestPushNotification', subscriptionIds);
  },

  /**
   * Gets a list of all notifications that have not been requested for yet
   * @param  {string} subscriptionId
   * @returns {Array}
   */
  getNewPNotifications: function(subscriptionId, userId) {
    // We should only be able to get our own unread notifications
    var subscription = pSubscriptions.findOne({subscription_id: subscriptionId});

    if(!subscription) {
      throw new Meteor.Error('subscription not found',
           'Subscription with subscriptionId= ' + subscriptionId + 'not found');
    }

    if(subscription.owner === userId) {
      var selector = {owner: userId, callbackAt: null};
      var options = {sort: {createdAt: -1}};
      return pNotifications.find(selector, options).fetch();
    } else {
      throw new Meteor.Error('access-denied',
      'The owner of the requested subscription differs from the logged in user');
    }
  },
  /**
   * Makes sure notifications are not sent twice. Wde archive them
   * @todo  Maybe we need to remove them or clean them up somehow
   * @param  {Array} notifications
   * @returns { integer } Number of notifications updated
   */
  archivePNotifications: function(notifications) {
    notifications.forEach(function(notification, index, array) {
      var options = {$set: {callbackAt: new Date()}};
      return pNotifications.update(notification._id, options);
    });
  }
});
