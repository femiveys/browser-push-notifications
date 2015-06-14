this.bpNotifications = new Meteor.Collection('bp_notifications');

bpNotifications.attachSchema(new SimpleSchema({
  title: { type: String },
  message: {
    type: String,
    optional: true,
  },
  icon: {
    type: String,
    optional: true,
  },
  callbackAt: {
    optional: true,
    type: Date,
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if(!this.isSet) {
        if (this.isInsert) {
          return Meteor.userId();
        }
      }
    },
    denyUpdate: true,
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    },
    denyUpdate: true,
  }
}));


/**
 * Send a notification to self, one or more users
 * If userId is omitted, the notification will be pushed to the current user
 * @param  {Object} notification
 * @param  {string|string[]} [userIds]
 */
bpNotifications.send = function(notification, userIds) {
  check(notification, {
    title: String,
    message: String,
    icon: String,
  });

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
    bpNotifications.insert(_.extend(notification, {owner: userId}));
  });

  // Finally we send the push request to the cloud for all subscriptions
  // corresponding to the userIds
  Meteor.call('requestPushNotification', userIds);
}

/**
 * Send a push notification to all subscriptions.
 * DANGEROUS Has to be used with caution.
 * @param  {[type]}
 * @return {[type]}
 */
bpNotifications.broadcast = function(notification) {
  Meteor.call('broadcastPushNotification', notification);
}
