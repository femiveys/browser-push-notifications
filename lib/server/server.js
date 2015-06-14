// Export some settings
this.BrowserPushNotifications = {
  removeWhenArchived: false
}

Meteor.startup(function() {
  checkConfig();
  setHeader();

  function checkConfig () {
    // Check the configuration for the Google Cloud Messaging
    var error = 'push-notification: Meteor.settings';
    var msg = 'Start the Meteor instance with the --settings option. '
            + 'See "meteor help run" and "meteor help deploy".';

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
  }

  /**
   * Set the Service-Worker-Allowed HTTP header
   * https://github.com/slightlyoff/ServiceWorker/issues/604
   */
  function setHeader() {
    if (typeof __meteor_bootstrap__.app !== 'undefined') {
      connectHandlers = __meteor_bootstrap__.app;
    } else {
      connectHandlers = WebApp.connectHandlers;
    }
    connectHandlers.use(function(req, res, next) {
      res.setHeader('Service-Worker-Allowed', SW_FOLDER);
      next();
    });
  }
});
