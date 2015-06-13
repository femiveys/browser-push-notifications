Meteor.methods({
  // Subscriptions
  saveSubscription: function(subscriptionId) {
    var doc = {
      subscription_id: subscriptionId,
      owner: Meteor.userId()
    }
    return cpSubscriptions.upsert(doc, {$set: doc});
  },
  removeSubscription: function(subscriptionId) {
    return cpSubscriptions.remove({ subscription_id: subscriptionId })
  },
  requestPushNotification: function(userIds) {
    cpSubscriptions.requestUsersPush(userIds);
  },
  broadcastPushNotification: function(notification) {
    cpSubscriptions.broadcast(notification);
  },
});



