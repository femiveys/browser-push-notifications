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
  getPNotification: function(subscriptionId) {
    var subscription = pSubscriptions.findOne({subscription_id: subscriptionId});
    var selector = {owner: subscription.owner, callbackAt: null};
    var notification = pNotifications.findOne(selector, {sort: {createdAt: -1}});

    if(notification) {
      // Set the callback date and return the message so it can be shown
      pNotifications.update(notification._id, {$set: {callbackAt: new Date()}});
      return notification;
      // TODO: A cleanup of these messages should be done somewhere
    } else {
      throw new Meteor.Error('callback-error',
      'Error while trying to find the notification to be shown. Returned null');
    }
  },
});
