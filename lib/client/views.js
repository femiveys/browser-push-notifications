/////////////////////////////////
// Push notifications checkbox //
/////////////////////////////////
Template.bpNotificationsCheckbox.onRendered(function() {
  registerServiceWorker();
});

Template.bpNotificationsCheckbox.events({
  'click #push-button': function (evt) {
    var subscriptionManager = SubscriptionManager(evt.currentTarget);
    if (Session.get('isPushEnabled')) {
      subscriptionManager.unsubscribe();
    } else {
      subscriptionManager.subscribe();
    }
  }
})

Template.bpNotificationsCheckbox.helpers({
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


/////////////////////////////
// Push notifications test //
/////////////////////////////
Template.bpNotificationsTest.helpers({
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
    return Session.get('isPushEnabled');
  }
});

Template.bpNotificationsTest.events({
  "click button": function() {
    bpNotifications.send({
      title: "Push notification test",
      message: "Successful!",
      icon: PACKAGE_PATH + "/img/check.png"
    });
  },
});

