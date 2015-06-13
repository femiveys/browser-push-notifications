this.cpNotifications = new Meteor.Collection('cp_notifications');

var Schemas = {};

Schemas.cpNotification = new SimpleSchema({
  title: {
    type: String,
  },
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
});

cpNotifications.attachSchema(Schemas.cpNotification);

/**
 * Send a notification to self, one or more users
 * If userId is omitted, the notification will be pushed to the current user
 * @param  {Object} notification
 * @param  {string|string[]} [userIds]
 */
cpNotifications.send = function(notification, userIds) {
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
    cpNotifications.insert(_.extend(notification, {owner: userId}));
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
cpNotifications.broadcast = function(notification) {
  Meteor.call('broadcastPushNotification', notification);
}

/**
 * Makes sure notifications are not sent twice. Wde archive them
 * @todo  Maybe we need to remove them or clean them up somehow
 * @param  {Array} notifications
 * @returns { integer } Number of notifications updated
 */
cpNotifications.archive = function(notifications) {
  notifications.forEach(function(notification, index, array) {
    var options = {$set: {callbackAt: new Date()}};
    return cpNotifications.update(notification._id, options);
  });
}
