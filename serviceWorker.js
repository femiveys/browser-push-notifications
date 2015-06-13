self.addEventListener('push', showNotification);
self.addEventListener('notificationclick', closeNotificationAndOpenWindow);

function showNotification(event) {
  console.log('Received a push message', event);

  event.waitUntil(
    event.target.registration.pushManager.getSubscription().then(function(subscription) {
      var endpoint = event.target.registration.scope + 'p_notifications/'
                   + encodeURIComponent(subscription.subscriptionId);

      // Since there is no payload data with the first version of push messages,
      // we'll grab some data from an API and use it to populate a notification
      fetch(endpoint, {credentials: 'include'}).then(function(response) {
        if (response.status !== 200) {
         console.log('Looks like there was a problem. Status Code: ' + response.status);
         throw new Error();
        }

        // Examine the text in the response
        return response.json().then(function(data) {
          if (data.error || !data.notifications) {
            console.error('The API returned an error.', data.error);
            throw new Error();
          }

          // Loop over all notifications to be sent
          var sequence = Promise.resolve();
          data.notifications.forEach(function(notification) {
            sequence = sequence.then(
              self.registration.showNotification(notification.title, {
                body: notification.message,
                icon: notification.icon,
              })
            );
          });
          return sequence;
        });
      }).catch(function(err) {
        console.error('Unable to retrieve data', err);
        return self.registration.showNotification('An error occurred', {
          body: 'We were unable to get the information for this push message',
          icon: '/packages/femiveys_chrome-push-notifications/img/error.png',
          tag: 'notification-error'
        });
      })
    }).catch(function(err) {
      console.error('Error during getSubscription()', err);
    })
  );
}


function closeNotificationAndOpenWindow(event) {
  console.log('event: ', event);
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close()

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i]
      if (client.url == '/' && 'focus' in client)
        return client.focus()
    }
    if (clients.openWindow)
      return clients.openWindow('/')
  }))
}
