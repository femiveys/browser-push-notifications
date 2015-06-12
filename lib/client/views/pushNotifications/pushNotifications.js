// Push notifications checkbox
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

function manageSubscription(evt) {
  var subscriptionManager = SubscriptionManager(evt.currentTarget);
  if (isPushEnabled) {
    subscriptionManager.unsubscribe();
  } else {
    subscriptionManager.subscribe();
  }
}

// Push notifications test
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
    return true;
  }
});

Template.pushNotificationsTest.events({
  "click button": function() {
    pNotifications.push({
      title: "Push notifications test",
      message: "If you see this message, the push notifications work for you",
      icon: "/packages/femiveys_chrome-push-notifications/img/check.png"
    });
    console.log('Request for a push message has been sent.')
  },
});

