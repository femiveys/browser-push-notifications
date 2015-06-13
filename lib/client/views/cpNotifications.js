/////////////////////////////////
// Push notifications checkbox //
/////////////////////////////////
Template.cpNotificationsCheckbox.onRendered(function() {
  registerServiceWorker();
});

Template.cpNotificationsCheckbox.events({
  'click #push-button': function (evt) {
    var subscriptionManager = SubscriptionManager(evt.currentTarget);
    if (Session.get('isPushEnabled')) {
      subscriptionManager.unsubscribe();
    } else {
      subscriptionManager.subscribe();
    }
  }
})

Template.cpNotificationsCheckbox.helpers({
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
Template.cpNotificationsTest.helpers({
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

Template.cpNotificationsTest.events({
  "click button": function() {
    cpNotifications.send({
      title: "Push notification test",
      message: "Successful!",
      icon: PACKAGE_PATH + "/img/check.png"
    });
  },
});

