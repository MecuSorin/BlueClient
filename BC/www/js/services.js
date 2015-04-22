// var devices = [{ name:'salut', id: "1", address:"some address"}, { name:'blue', id: "2", address: 'something here'}];
//     var bluetoothSerial = { 
//       list: function(a, b) { a(devices);},
//       discoverUnpaired: function(a,b) { a(devices); },
//       write: function(text, a, b) { a(); },
//       connect: function(id, a, b) { a(); },
//       subscribe: function(limiter, a, b) { /*b('fake subscribe error');*/setInterval(function(){  a(); }, 5000);  },
//       readUntil: function(limiter, a, b) { /*b('fake read error'); */a("fake read\n"); }
//      };

angular.module('starter.services', [])

.service('ErrorsService', function () {
    var errors = [];
    return { 
        Errors: errors,
        addError : function(err) {
            errors.push({ id: 1+errors.length, message: err});
        }
    };
})

.service('BluetoothDevicesService', function ($q) {
    var pairedList = [];
    var unpairedList=[];
    
    var findById = function(source, id) {
          for (var i = 0; i < source.length; i++) {
            if (source[i].id === id) {
              return source[i];
            }
          }
          throw "Couldn't find object with id: " + id;
        };
    return {
        listPairedDevices : function() {
          var deferred = $q.defer();
          try{
            bluetoothSerial.list(function(devicesFound) { deferred.resolve(devicesFound); pairedList = devicesFound; }, 
              function(reason) { deferred.reject(reason); pairedList = [];});
          }
          catch(err) {
            pairedList = [];
            deferred.reject(err.message);
          }
          return deferred.promise;
        },
        listUnPairedDevices : function() {
          var deferred = $q.defer();
          try{
            bluetoothSerial.discoverUnpaired(function(devicesFound) { 
              deferred.resolve(devicesFound); listUnPairedDevices = devicesFound; 
            },
            function(reason) { 
              deferred.reject(reason); unpairedList=[]; 
            });
          }
          catch(err) {
            unpairedList=[];
            deferred.reject(err.message);
          }
          return deferred.promise;
        },
        getDevice: function(deviceId) {
            try {
              return findById(pairedList, deviceId);
            }
            catch(err){
              return findById(unpairedList, deviceId);
            }
        }
    }
})

.service("MessagesService", function($q, ErrorsService) {
    var Messages = [];
    var GetMessagesWithDevice = function(pairId) {
      chatWithId = Messages[pairId];
      if(!chatWithId) {
        Messages[pairId] = chatWithId = [{
          id: 0,
          mine: true,
          text: "sample",
          status: 'fake'
        }];
      }
      return chatWithId;
    };
   
    var AddMessage = function(byMe, pairId, text) {
        chatWithId = GetMessagesWithDevice(pairId);
        var result = {
          id: Messages.length+1,
          mine: byMe,
          text: text,
          status: ((byMe) ? 'pending' : 'received')
        }
        chatWithId.push(result);
        return result;
    };
    var GetDeviceBluetoothIdentifier  = function(device) {
      return device.address;
    };

    return {
      SendMessage: function(device, text) { 
        var message = AddMessage(true, device.id, text + '\n'); 
        bluetoothSerial.write(text, 
          function() {
            message.status = 'sent';
          },
          function(error) {
            message.status = 'failed';
          });
      },
      GetMessages: function(device) {
        ErrorsService.addError("Getting messages for device ...");
        return GetMessagesWithDevice(device);
      },
      StartListeningDevice: function(device, refreshCallback) {
        var connectDeferrer = $q.defer();
        var chatDeferrer = $q.defer();
        var result = { 
          device: device, 
          connectPromise: connectDeferrer.promise, 
          chatDeferrer: chatDeferrer 
        };
        var deviceBlueeToothId = GetDeviceBluetoothIdentifier(device);
        bluetoothSerial.connect(deviceBlueeToothId, 
          function() {  //on connect
            connectDeferrer.resolve();
            ErrorsService.addError("Connected...");
            bluetoothSerial.subscribe('n', 
              function() { // on subscribe
                ErrorsService.addError("registered for data reading");
                if(chatDeferrer.promise.$$state.status === 0) { //pending
                  bluetoothSerial.readUntil('\n', 
                    function(data) { //on readuntil success
                      if(data) { 
                        ErrorsService.addError("received message");
                        var receivedMessage = AddMessage(false, device.id, data);
                        chatDeferrer.notify(receivedMessage); 
                      }
                    }, function(error) { //on readuntil error
                      ErrorsService.addError("Failed to read data");
                      chatDeferrer.reject(error);
                    });
                }
              },
              function(error) { //on subscribe error
                ErrorsService.addError("Failed to listen device");
                chatDeferrer.reject(error);
              }
            );
          }, 
          function(error) { //on connect error
            connectDeferrer.reject(error);
            chatDeferrer.reject(error);
          });
          return result;
      }
    }
});