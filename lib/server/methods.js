Meteor.methods({
  // Subscriptions
  saveSubscription: function(subscriptionId) {
    var doc = {
      subscription_id: subscriptionId,
      owner: Meteor.userId()
    }
    return bpSubscriptions.upsert(doc, {$set: doc});
  },
  removeSubscription: function(subscriptionId) {
    return bpSubscriptions.remove({ subscription_id: subscriptionId })
  },
  requestPushNotification: function(userIds) {
    bpSubscriptions.requestUsersPush(userIds);
  },
  broadcastPushNotification: function(notification) {
    bpSubscriptions.broadcast(notification);
  },
});



