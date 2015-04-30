/// <reference path="app.bootstrap.ts" />

// Ionic Starter App


angular.module('starter', ['ionic', 'blueclient.services', 'blueclient.controllers'])

.run(function ($ionicPlatform, $rootScope) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})




.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  .state('tab.devices', {
      url: '/devices',
      views: {
          'tab-devices': {
              templateUrl: 'templates/tab-devices.html',
              controller: 'DevicesCtrl'
          }
      }
  })
    

  .state('tab.blueChat-detail', {
      url: '/blueDeviceChat/:deviceId',
      views: {
          'tab-devices': {
              templateUrl: 'templates/blueChat-detail.html',
              controller: 'BlueChatDetailCtrl'
          }
      }
  })

  .state('tab.errors', {
    url: '/errors',
    views: {
        'tab-errors': {
            templateUrl: 'templates/tab-errors.html',
            controller: 'ErrCtrl'
        }
    }
    });

  // Each tab has its own nav history stack:
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/devices');

});
