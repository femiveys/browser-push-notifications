# Browser Push Notifications (for Meteor)
Send Browser Push Notifications in the most easy way.
Currently only from a Chrome browser to Android devices.

## How to use
### Installation
1. Add the package: `meteor add femiveys:browser-push-notifications`
2. Set the Google API key (see [Google API key](#api))
3. Copy the Service Worker to the `/public` of your application

## <a name="api"></a>Google API key
The preferred way to set your google API key is to use the `Meteor.settings` mechanism. See http://docs.meteor.com/#/full/meteor_settings.
Start the Meteor instance with the `--settings` option. See `meteor help run` and `meteor mhelp deploy`.
The packacge expects the key to be under `serviceConfigurations.google.key` in a settings JSON file. *I believe this should become the standard place to put API keys.*
This is the preferred way because you might want to use different keys for different environments.

Altenatively, you can also set the Google API key in `BrowserPushNotifications.key`. This has to be set in code that **only runs on the server** as you don't want this key to be visible or changeable on the client.

<a name="options"></a>## Options
Options can be set in the BrowserPushNotifications object. There are only 2 options:
- `key`: The Google API key. Defaults to `Meteor.settings.serviceConfigurations.google.key`. If you don't want to use `Meteor.settings` mechanism, you can override this key here. **This is not advised**.
- `removeWhenArchived`: Defaults to `true`. If set to `false`, notifications will not be removed from the server after they have been pushed.

**Options have to be set in code that only runs on the server**.

### Templates
Following templates are available:
- `{{> bpNotificationsCheckbox}}`
  - Renders a push notifications checkbox.
  - Takes following options:
    - `label`: The label of the checkbox. Defaults to `Enable Push notifications`.
    - `class`: The HTML `class` property to pass to the checkbox wrapper div.
  - Example: `{{> bpNotificationsCheckbox class="pull-left" label="Register push"}}`
- `{{> bpNotificationsTest}}`
  - Renders a push notifications test button.
  - This reactively only appears when push is available.
  - When clicking on the button a push notification is sent to the current user.
  - Takes following options:
    - `label`: The label of the button. Defaults to `Test push`.
    - `class`: The HTML `class` property to pass to the button.
  - Example: `{{> bpNotificationsTest class="pull-right btn btn-primary btn-xs"}}`

### Methods available
- `bpNotifications.send(notification, userIds)`: Sends a push notification.
  - `notification`: See [below](#notification).
  - `userIds`: Optional. String with Mongo `_id` of user or Array of Mongo `_id`s of users.
- `bpNotifications.broadcast(notification)`: Sends a push notification to all subscriptions.
  - `notification`: See [below](#notification).

<a name="notification"></a>A `notification` argument object can have following fields: 
- `title`: mandatory
- `message`: optional
- `icon`: optional: Path to the icon of the notification

### Example
```javascript
var notification = {
  title: "Notification title",
  message: "The body text of the notification",
  icon: "/img/smiley.png",
};

var userIds = ["HS7r7qhL2yrKtoZfs", "heN3BoGdKx7httKWB"];

bpNotifications.send(notification, userIds);
```

<a name="archiving"></a>## Archiving
By default we archive notifications by removing them.
In some cases it might be interesting to know when the notification has effectively been received. For this you need to use the `removeWhenArchived` option. See [Options](#options). This will update the notification, setting the `callbackAt` field to the current date. A notification is considered unread when `callbackAt = null`.

## How it works internally
As of Chrome version 42, the [Push API](http://w3c.github.io/push-api/) and [Notification API](https://notifications.spec.whatwg.org/) are available to developers.
This exactly what this package applies. It uses the techniques explained [here](http://updates.html5rocks.com/2015/03/push-notificatons-on-the-open-web).

As we cannot yet send a payload with the push, this is what we do to send a notification:
- We save the bpNotification on the server
- We request a push using the [Push API](http://w3c.github.io/push-api/)
- When we receive a Notification (using the [Notification API](https://notifications.spec.whatwg.org/)), we call an internal API (under `/bp_notifications/:subscription_id`) returning a JSON with **all** notifications that have not been shown yet.
- Every notification that has been requested through this API is archived so it cannot be shown again. See [Archiving](#archiving).
- Finally we show a push notification for every notification object returned by the API, using the data in the notification object.

## Cookies
When we use the API, this is a server side call, so we are not aware of the logged in user. To know the logged in user, we store his/her `meteor_user_id` in a cookie. There is another cookie that is set when the user logs in or out. On when his/her session is expired. This is maintained in the `meteor_token`.
To prevent an attacker could read notifications of other users, knowing someones `subscriptionId` use the `meteor_user_id` cookie. Only a notification to a user, matching his/hers `meteor_user_id` with the `subscriptionId`, can be read.
This means an attacker should know the `meteor_user_id` and the `subscriptionId` of the same user to read his/her notifications. This is not evident on an HTTPS connection. This is why the package depends on `force-ssl@1.0.4`.

## Service Worker considerations (only for experts)
In theory it should be possible to package the Service Worker so it resides under `/packages/femiveys_browser-push-notifications/serviceWorker.js`. This would prevent the annoying step to copy `serviceWorker.js` to `/public`.
All code is ready, but for me it didn't work (Chrome 43.0.2357.125).
If you want to test this, you can uncomment the last line in `lib/both/constants.js`. The will do the following:
- Change the scope of the ServiceWorker to: `/packages/femiveys_browser-push-notifications`
- Register `/packages/femiveys_browser-push-notifications/serviceWorker.js` when activating push. (This file is already set as an asset.)
- Make sure the route to the internal API is within the scope, more specifically: `/packages/femiveys_browser-push-notifications/bp_notifications/:subscription_id`
- Set the `Service-Worker-Allowed` HTTP header to `/packages/femiveys_browser-push-notifications` (see https://github.com/slightlyoff/ServiceWorker/issues/604).
 
If anybody knows how to make this to work, help is welcome.

### Credits
This code has been based on the code from https://github.com/taromero/meteor-chrome-push-notifications but has been seroiously adapted and completed.
