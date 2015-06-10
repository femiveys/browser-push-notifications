Template.pushNotificationsCheckbox.onRendered(function() {
  registerServiceWorker();
});

Template.pushNotificationsCheckbox.events({
  'click #push-button': manageSubscription
})

Template.pushNotificationsCheckbox.helpers({
  label: function() {
    if(this.label) {
      return this.label;
    } else {
      return "Enable Push notifications";
    }
  },
  classes: function() {
    if(this.class) {
      return this.class;
    } else {
      return;
    }
  }
});

Template.pushNotificationsTest.helpers({
  label: function() {
    if(this.label) {
      return this.label;
    } else {
      return "Test push";
    }
  },
  classes: function() {
    if(this.class) {
      return this.class;
    } else {
      return "btn btn-primary";
    }
  },
  show: function() {
    // TODO: Make this work
    console.log(this.isPushEnabled);
    return true;
  }
});

Template.pushNotificationsTest.events({
  "click button": function() {
    pNotifications.push({
      title: "Push notifications test",
      message: "If you see this message, the push notifications work for you"
    });
    console.log('Request for a push message has been sent.')
  },
});

function manageSubscription(evt) {
  var subscriptionManager = SubscriptionManager(evt.currentTarget);
  if (isPushEnabled) {
    subscriptionManager.unsubscribe();
  } else {
    subscriptionManager.subscribe();
  }
}
