cpSubscriptions = new Meteor.Collection('cp_subscriptions');

cpSubscriptions.attachSchema(new SimpleSchema({
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

cpSubscriptions.getSubscriptionIds = function(userIds) {
  var selector = {owner: { $in: userIds }};
  var options = {fields: {subscription_id: 1, _id: 0}};
  return cpSubscriptions.find(selector, options).map(function(subscription) {
    return subscription.subscription_id;
  });
};

cpSubscriptions.getOwners = function(subscriptionIds) {
  var selector = {subscription_id: { $in: subscriptionIds }};
  var options = {fields: {owner: 1, _id: 0}};
  return cpSubscriptions.find(selector, options).map(function(subscription) {
    return subscription.owner;
  });
};

cpSubscriptions.requestUsersPush = function(userIds) {
  cpSubscriptions.requestPush(cpSubscriptions.getSubscriptionIds(userIds));
};

cpSubscriptions.requestPush = function(registrationIds) {
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
};

cpSubscriptions.broadcast = function(notification) {
  // Get all the subscriptions in the DB
  subscriptionIds = cpSubscriptions.find().map(function(subscription) {
    return subscription.subscription_id;
  });

  // Insert a notificataion for all owners of the subscriptions
  cpSubscriptions.getOwners(subscriptionIds).forEach(function(userId) {
    cpNotifications.insert(_.extend(notification, {owner: userId}));
  });

  // Finally request a push for all the subscriptions
  cpSubscriptions.requestPush(subscriptionIds);
}

/**
 * Gets a list of all notifications that have not been requested for yet
 * @param  {string} subscriptionId
 * @param  {string} userId
 * @returns {[Object]}
 */
cpSubscriptions.getNotifications = function(subscriptionId, userId) {
  var subscription = cpSubscriptions.findOne({subscription_id: subscriptionId});

  if(!subscription) {
    throw new Meteor.Error('subscription not found',
           'Subscription with subscriptionId= ' + subscriptionId + 'not found');
  }

  // We should only be able to get our own unread notifications, so subscription
  // owner and userId should match
  if(subscription.owner === userId) {
    var selector = {owner: userId, callbackAt: null};
    var options = {sort: {createdAt: -1}};
    return cpNotifications.find(selector, options).fetch();
  } else {
    throw new Meteor.Error('access-denied',
     'The owner of the requested subscription differs from the logged in user');
  }
};
