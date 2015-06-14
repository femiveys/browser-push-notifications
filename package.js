Package.describe({
  name: 'femiveys:browser-push-notifications',
  version: '0.3.0',
  summary: 'Add browser push notifications. Currently Chrome to android',
  git: 'git@github.com:femiveys/browser-push-notifications.git',
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
    'lib/client/views.html',
    'lib/client/views.js',
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
});

