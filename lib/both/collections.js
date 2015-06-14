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

/**
 * Makes sure notifications are not sent twice. We archive them
 * @todo  Maybe we need to remove them or clean them up somehow
 * @param  {Array} notifications
 * @param  {Boolean} [remove] If set true, we try to remove the notifications.
 *                            If this doesn't succeed, we fallback to the
 *                            default behavior where we set the callbackAt date
 * @returns { integer } Number of notifications updated
 */
bpNotifications.archive = function(notifications, remove) {
  remove = typeof remove === 'undefined' ? false : remove;
  options = {$set: {callbackAt: new Date()}};

  notifications.forEach(function(notification, index, array) {
    // If remove is true and we try to remove. We return when this succeeds
    if(remove && bpNotifications.remove(notification._id)) {
      return;
    }

    // If we don't have to remove or if we are unable to remove, we try to
    // update the notification by setting the callbackAt to now
    if(!bpNotifications.update(notification._id, options)) {
      throw new Meteor.Error('archive-error', 'Unable to archive the notification.');
    }
  });
}
