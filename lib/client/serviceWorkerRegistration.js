/**
 * Register a Service Worker
 * @return {null}
 */
registerServiceWorker = function() {
  if ('serviceWorker' in navigator) {
    // First check some precondition for push notifictaions
    checkPreconditions();

    navigator.serviceWorker.register(SW_FOLDER + '/serviceWorker.js')
    .then(waitForServiceWorkerToBeReady)
    .then(getPushSubscription)
    .then(setCheckbox)
    .catch(function(err) { console.error(err) });
  } else {
    console.warn('Service workers aren\'t supported in this browser.')
  }

  return;


  //////////////////////
  // Helper functions //
  //////////////////////
  /**
   * Check all preconditions related to push notifications
   * @throws {Meteor.Error}
   */
  function checkPreconditions() {
    var errorType = 'pNotifications';

    Cookie.set("meteor_user_id", Meteor.userId());
    Cookie.set("meteor_token", localStorage.getItem("Meteor.loginToken"));

    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      throw new Meteor.Error(errorType, 'Notifications are not supported.');
    }

    if (Notification.permission === 'denied') {
      throw new Meteor.Error(errorType, 'The user has blocked notifications.');
    }

    if (!('PushManager' in window)) {
      throw new Meteor.Error(errorType, 'Push messaging is not supported.');
    }

    if(!Cookie.get("meteor_user_id")) {
      throw new Meteor.Error(errorType, 'The meteor_user_id cookie is missing.');
    }

    if(!Cookie.get("meteor_token")) {
      throw new Meteor.Error(errorType, 'The meteor_token cookie is missing.');
    }
  }

  /**
   * Wait for Service Worker to be ready
   * @return {Promise.ServiceWorkerRegistration}
   */
  function waitForServiceWorkerToBeReady() {
    return navigator.serviceWorker.ready;
  }

  /**
   * Get the subscription from the pushManager and enable the checkbox on the way
   * @param  {ServiceWorkerRegistration} serviceWorkerRegistration
   * @return {Promise. PushSubscription}
   */
  function getPushSubscription(serviceWorkerRegistration) {
    // At this point the Service Worker is ready, so we can enable the checkbox
    $('#push-button').attr('disabled', false);

    // We return the subscription
    return serviceWorkerRegistration.pushManager.getSubscription()
  }

  function setCheckbox(subscription) {
    // If there is no subscription, we leave the checkbox as is
    // and make sure the isPushEnabled is false
    if (!subscription) {
      Session.set('isPushEnabled', false);
      return;
    }
    // If we have a subscription, we set the checkbox to checked
    // and make sure the isPushEnabled is true
    else {
      $('#push-button').attr('checked', 'checked')
      Session.set('isPushEnabled', true);
    }
  }
}

