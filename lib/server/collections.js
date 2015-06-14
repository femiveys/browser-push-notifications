//////////////////
// Subscritopns //
//////////////////

bpSubscriptions = new Meteor.Collection('bp_subscriptions');

bpSubscriptions.attachSchema(new SimpleSchema({
  subscription_id: {
    type: String,
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return Meteor.userId();
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    },
    denyUpdate: true,
    optional: true,
  }
}));

bpSubscriptions.getSubscriptionIds = function(userIds) {
  var selector = {owner: { $in: userIds }};
  var options = {fields: {subscription_id: 1, _id: 0}};
  return bpSubscriptions.find(selector, options).map(function(subscription) {
    return subscription.subscription_id;
  });
};

bpSubscriptions.getOwners = function(subscriptionIds) {
  var selector = {subscription_id: { $in: subscriptionIds }};
  var options = {fields: {owner: 1, _id: 0}};
  return bpSubscriptions.find(selector, options).map(function(subscription) {
    return subscription.owner;
  });
};

bpSubscriptions.requestUsersPush = function(userIds) {
  bpSubscriptions.requestPush(bpSubscriptions.getSubscriptionIds(userIds));
};

bpSubscriptions.requestPush = function(registrationIds) {
  var key = BrowserPushNotifications.key;
  if(!key) {
    throw new Meteor.Error('key-error', 'You didn\'t set the Google API key. See server output.');
  }
  var url = 'https://android.googleapis.com/gcm/send';
  var options = {
    headers: {
      'Authorization': 'key=' + key,
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
};

bpSubscriptions.broadcast = function(notification) {
  // Get all the subscriptions in the DB
  subscriptionIds = bpSubscriptions.find().map(function(subscription) {
    return subscription.subscription_id;
  });

  // Insert a notificataion for all owners of the subscriptions
  bpSubscriptions.getOwners(subscriptionIds).forEach(function(userId) {
    bpNotifications.insert(_.extend(notification, {owner: userId}));
  });

  // Finally request a push for all the subscriptions
  bpSubscriptions.requestPush(subscriptionIds);
}

/**
 * Gets a list of all notifications that have not been requested for yet
 * @param  {string} subscriptionId
 * @param  {string} userId
 * @returns {[Object]}
 */
bpSubscriptions.getNotifications = function(subscriptionId, userId) {
  var subscription = bpSubscriptions.findOne({subscription_id: subscriptionId});

  if(!subscription) {
    throw new Meteor.Error('subscription not found',
           'Subscription with subscriptionId= ' + subscriptionId + 'not found');
  }

  // We should only be able to get our own unread notifications, so subscription
  // owner and userId should match
  if(subscription.owner === userId) {
    var selector = {owner: userId, callbackAt: null};
    var options = {sort: {createdAt: -1}};
    return bpNotifications.find(selector, options).fetch();
  } else {
    throw new Meteor.Error('access-denied',
     'The owner of the requested subscription differs from the logged in user');
  }
};


//////////////////
// Subscritopns //
//////////////////

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
