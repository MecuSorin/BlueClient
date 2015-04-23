angular.module('starter.controllers', [])

.controller('ErrCtrl', function ($scope, ErrorsService) {
    $scope.Refresh = function() { $scope.Errors = ErrorsService.Errors; }
    $scope.Refresh();
})

.controller('DevicesCtrl', function ($scope, BluetoothDevicesService, ErrorsService) {
    var factory = BluetoothDevicesService;
    $scope.RefreshDevicesList = function () {
      $scope.pairedDevicesList =[];
      $scope.unpairedDevicesList=[];
      try {
        factory.listPairedDevices()
                .then(function(devices) { $scope.pairedDevicesList = devices; })
                .catch(function(reason) { ErrorsService.addError(reason); })
                .finally(function() { ErrorsService.addError("Done reading paired devices.")});
        factory.listUnPairedDevices()
              .then(function(devices) { $scope.unpairedDevicesList = devices; })
              .catch(function(reason) { ErrorsService.addError(reason); })
              .finally(function() { ErrorsService.addError("Done reading unpaired devices.")});
      }
      catch(err) {
        ErrorsService.addError(err.message);
      }
    };
})


.controller('BlueChatDetailCtrl', function ($scope, $stateParams, ErrorsService, BluetoothDevicesService, MessagesService) {
    var controller = {
      scope: $scope,
      connectVisible: true,
      messageText: "",
      device: BluetoothDevicesService.getDevice($stateParams.deviceId),
      messages: MessagesService.GetMessages($stateParams.deviceId)
    };

    controller.Connect = function(secure) { // secure is a bool that specifies what type of connection
        controller.connectVisible = false;
        var chatingStatus = MessagesService.StartListeningDevice(controller.device, secure);
        controller.scope.$on('$destroy', function() {
          chatingStatus.chatDeferrer.resolve();
        });

        var OnMessageReceived = function(message) {
          var a = controller.messages;
          controller.messages = [];
          controller.messages = a;
          if (!controller.scope.$$phase) { controller.scope.$apply();}
        };
        chatingStatus.chatDeferrer.promise.then(null, null, OnMessageReceived);
      };
    controller.SendMessage = function () {
        MessagesService.SendMessage( controller.device, controller.messageText);
        controller.messageText = "";
        if (!controller.scope.$$phase) { controller.scope.$apply();}
      };
    controller.GetMessageClass = function(message) {
      if(!message.mine) { return 'message-blue'; }
    };

    $scope.ctrl = controller;
});
