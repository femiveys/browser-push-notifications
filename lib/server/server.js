Meteor.startup(function() {
  // Check the configuration for the Google Cloud Messaging

  var error = 'push-notification: Meteor.settings';
  var msg = 'Start the Meteor instance with the --settings option. See "meteor help run" and "meteor help deploy".';

  // Make sure the configuration is correct
  if(typeof Meteor.settings === 'undefined') {
    throw new Meteor.Error(error, 'Meteor.settings is not set.\n' + msg);
  }

  if(typeof Meteor.settings.serviceConfigurations === 'undefined') {
    throw new Meteor.Error(error, 'Meteor.settings.serviceConfigurations is not set.\n' + msg);
  }

  if(typeof Meteor.settings.serviceConfigurations.google === 'undefined') {
    throw new Meteor.Error(error, 'Meteor.settings.serviceConfigurations.google is not set.\n' + msg);
  }

  if(typeof Meteor.settings.serviceConfigurations.google.key === 'undefined') {
    throw new Meteor.Error(error, 'Meteor.settings.serviceConfigurations.google.key is not set.\n' + msg);
  }

  pSubscriptions.getSubscriptionIds = function(userIds) {
    var selector = {owner: { $in: userIds }};
    var options = {fields: {subscription_id: 1, _id: 0}};
    return pSubscriptions.find(selector, options).map(function(subscription) {
      return subscription.subscription_id;
    });
  };
});

