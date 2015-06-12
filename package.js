Package.describe({
  name: 'femiveys:chrome-push-notifications',
  version: '0.1.0',
  summary: 'Add push notifications for Chrome browsers',
  git: 'git@github.com:femiveys/chrome-push-notifications.git',
  // documentation: 'README.md'
});

both = ['client', 'server'];

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.1');
  api.use('templating');
  api.use('http');
  api.use('iron:router');
  api.use('mongo');
  api.use('aldeed:simple-schema');

  api.addFiles(
  [
    'lib/client/serviceWorkerRegistration.js',
    'lib/client/subscriptionManager.js',
    'lib/client/views/pushNotifications/pushNotifications.html',
    'lib/client/views/pushNotifications/pushNotifications.js',
  ],
  'client');

  api.addFiles(
  [
    'lib/server/methods.js',
    'lib/server/server.js',
  ],
  'server');

  api.addFiles(
  [
    'lib/both/collections.js',
    'lib/both/router.js',
  ],
  both);

  api.addFiles('img/check.png', 'client', {isAsset: true});
  api.addFiles('img/error.png', 'client', {isAsset: true});
  api.addFiles('serviceWorker.js', 'client', {isAsset: true});

  // api.export('PnSubscriptions', 'server')
});

