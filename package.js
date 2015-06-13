Package.describe({
  name: 'femiveys:chrome-push-notifications',
  version: '0.3.0',
  summary: 'Add Chrome to android push notifications',
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
  api.use('mrt:cookies');
  api.use('thepumpinglemma:cookies');
  api.use('force-ssl'); // TODO: make it a soft dependency

  api.addFiles(
  [
    'lib/both/constants.js',
    'lib/both/collections.js',
  ],
  both);

  api.addFiles(
  [
    'lib/client/serviceWorkerRegistration.js',
    'lib/client/subscriptionManager.js',
    'lib/client/views/cpNotifications/cpNotifications.html',
    'lib/client/views/cpNotifications/cpNotifications.js',
  ],
  'client');

  api.addFiles(
  [
    'lib/server/collections.js',
    'lib/server/methods.js',
    'lib/server/server.js',
    'lib/server/router.js',
  ],
  'server');

  api.addFiles('img/check.png', 'client', {isAsset: true});
  api.addFiles('img/error.png', 'client', {isAsset: true});
  api.addFiles('serviceWorker.js', 'client', {isAsset: true});

  // api.export('PnSubscriptions', 'server')
});

