// Export some settings
this.BrowserPushNotifications = {
  removeWhenArchived: true,
  key: getSettingsKey(),
}

function getSettingsKey () {
  var error = 'push-notification: Meteor.settings';
  var msg = 'You will not be able to sent push messages from Chrome to Android.\n'
          + 'Set the Google API key in serviceConfigurations.google.key in a settings JSON file.\n'
          + 'See Meteor.settings: http://docs.meteor.com/#/full/meteor_settings.\n'
          + 'Start the Meteor instance with the --settings option. '
          + 'See "meteor help run" and "meteor help deploy".\n'
          + 'Altenatively, you can also set the Google API key in BrowserPushNotifications.key.';

  // Make sure the configuration is correct
  if(typeof Meteor.settings === 'undefined') {
    console.warn('Meteor.settings is not set.\n' + msg);
    return false;
  }
  if(typeof Meteor.settings.serviceConfigurations === 'undefined') {
    console.warn('Meteor.settings.serviceConfigurations is not set.\n' + msg);
    return false;
  }
  if(typeof Meteor.settings.serviceConfigurations.google === 'undefined') {
    console.warn('Meteor.settings.serviceConfigurations.google is not set.\n' + msg);
    return false;
  }
  if(typeof Meteor.settings.serviceConfigurations.google.key === 'undefined') {
    console.warn('Meteor.settings.serviceConfigurations.google.key is not set.\n' + msg);
    return false;
  }

  return Meteor.settings.serviceConfigurations.google.key
}


Meteor.startup(function() {
  setHeader();

  /**
   * Set the Service-Worker-Allowed HTTP header
   * https://github.com/slightlyoff/ServiceWorker/issues/604
   */
  function setHeader() {
    if(SW_FOLDER) {
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
  }
});

