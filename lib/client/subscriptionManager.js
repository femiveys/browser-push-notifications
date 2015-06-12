SubscriptionManager = function(pushButton) {
  return {
    subscribe: function() {
      navigator.serviceWorker.ready
        .then(getPushManagerSubscription)
        .then(linkSubscriptionToUser)
        .then(setCookies)
        .catch(informSubscriptionError)
    },
    unsubscribe: function() {
      navigator.serviceWorker.ready
        .then(getPushManagerSubscription)
        .then(checkAndUnsubscribe)
        .then(removeSubscriptionFromServer)
        .then(updateUI)
        .catch(informUnsubscriptionError)
    }
  }

  function getPushManagerSubscription(serviceWorkerRegistration) {
    return serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true});
  }

  function linkSubscriptionToUser(subscription) {
    isPushEnabled = true;

    return sendSubscriptionToServer(subscription);

    function sendSubscriptionToServer(subscription) {
      return new Promise(function(resolve, reject) {
        Meteor.call('saveSubscription', subscription.subscriptionId, function(err, res) {
          if (err) {
            console.log(err);
            // reject(Error(err));
          } else {
            console.log('Subscription saved on server');
            console.log(subscription);
            resolve('Subscription saved on server.');
          }
        })
      })
    }
  }


  function setCookies() {
     //Update the cookie whenever they log in or out
     Cookie.set("meteor_user_id", Meteor.userId());
     Cookie.set("meteor_token", localStorage.getItem("Meteor.loginToken"));
  }

  function informSubscriptionError(e) {
    if (Notification.permission === 'denied') {
      // Push permission denied previously by the user.
      console.warn('Permission for Notifications was denied')
      pushButton.disabled = true
    } else {
      // A problem occurred with the subscription; common reasons
      // include network errors, and lacking gcm_sender_id and/or
      // gcm_user_visible_only in the manifest.
      console.error('Unable to subscribe to push.', e)
      pushButton.disabled = false
    }
  }

  function checkAndUnsubscribe(pushSubscription) {
    if (!pushSubscription) {
      return;
    }
    var subscriptionId = pushSubscription.subscriptionId
    pushSubscription.unsubscribe();
    return pushSubscription;
  }

  function updateUI() {
    console.warn('unsubscribed')
    pushButton.disabled = false
    isPushEnabled = false
  }

  function informUnsubscriptionError(e) {
    console.log('Unsubscription error: ', e)
    pushButton.disabled = false
  }


  function removeSubscriptionFromServer(subscription) {
    return new Promise(function(resolve, reject) {
      Meteor.call('removeSubscription', subscription.subscriptionId, function(err, res) {
        if (err) {
          reject(Error(err))
        } else {
          resolve(subscription)
        }
      })
    })
  }
}

