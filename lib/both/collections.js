this.pSubscriptions = new Meteor.Collection('p_subscriptions');
this.pNotifications = new Meteor.Collection('p_notifications');

var Schemas = {};

Schemas.pSubscription = new SimpleSchema({
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
});

Schemas.pNotification = new SimpleSchema({
  title: {
    type: String,
  },
  message: {
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

pSubscriptions.attachSchema(Schemas.pSubscription);
pNotifications.attachSchema(Schemas.pNotification);

pNotifications.push = function(notification, userIds) {
  Meteor.call('pushNotification', notification, userIds);
}
