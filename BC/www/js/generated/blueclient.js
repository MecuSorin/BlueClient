/*/// <reference path="../0_typings/angularjs/angular.d.ts" />
/// <reference path="interfaces.d.ts" />
*/
var blueclient;
(function (blueclient) {
    blueclient.blueclientServices = angular.module('blueclient.services', []);
    blueclient.blueclientControllers = angular.module('blueclient.controllers', []);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var BluetoothDevicesService = (function () {
        function BluetoothDevicesService($q) {
            var _this = this;
            this.$q = $q;
            this.pairedList = [];
            this.unpairedList = [];
            this.listPairedDevices = function () {
                var deferred = _this.$q.defer();
                try {
                    bluetoothSerial.list(function (devicesFound) {
                        deferred.resolve(devicesFound);
                        _this.pairedList = devicesFound;
                    }, function (reason) {
                        deferred.reject(reason);
                        _this.pairedList = [];
                    });
                }
                catch (err) {
                    _this.pairedList = [];
                    deferred.reject(err.message);
                }
                return deferred.promise;
            };
            this.listUnPairedDevices = function () {
                var deferred = _this.$q.defer();
                try {
                    bluetoothSerial.discoverUnpaired(function (devicesFound) {
                        deferred.resolve(devicesFound);
                        _this.unpairedList = devicesFound;
                    }, function (reason) {
                        deferred.reject(reason);
                        _this.unpairedList = [];
                    });
                }
                catch (err) {
                    _this.unpairedList = [];
                    deferred.reject(err.message);
                }
                return deferred.promise;
            };
            this.getDevice = function (deviceId) {
                try {
                    return _this.findById(_this.pairedList, deviceId);
                }
                catch (err) {
                    return _this.findById(_this.unpairedList, deviceId);
                }
            };
        }
        BluetoothDevicesService.prototype.findById = function (source, id) {
            for (var i = 0; i < source.length; i++) {
                if (source[i].id === id) {
                    return source[i];
                }
            }
            throw "Couldn't find object with id: " + id;
        };
        BluetoothDevicesService.Alias = "BluetoothDevicesService";
        BluetoothDevicesService.$inject = ['$q'];
        return BluetoothDevicesService;
    })();
    blueclient.BluetoothDevicesService = BluetoothDevicesService;
    blueclient.blueclientServices.service(BluetoothDevicesService.Alias, BluetoothDevicesService);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var Error = (function () {
        function Error(message) {
            this.message = message;
            this.Id = 0;
            this.Id = Error.lastId + 1; // javascript is secvential so it is ok 
            Error.lastId += 1; // no atomic wrapers are needed
        }
        Error.lastId = 0;
        return Error;
    })();
    blueclient.Error = Error;
    var ErrorsService = (function () {
        function ErrorsService() {
            var _this = this;
            this.Errors = [];
            this.addError = function (message) {
                _this.Errors.unshift(new Error(message));
            };
        }
        ErrorsService.Alias = "ErrorsService";
        return ErrorsService;
    })();
    blueclient.ErrorsService = ErrorsService;
    blueclient.blueclientServices.service(ErrorsService.Alias, ErrorsService);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var Message = (function () {
        function Message(mine, text, status) {
            this.mine = mine;
            this.text = text;
            this.status = status;
            this.id = 0;
            this.id = 1 + Message.lastMessageId;
            Message.lastMessageId += 1;
        }
        Message.isValidDate = function (date) {
            if (Object.prototype.toString.call(date) !== "[object Date]")
                return false;
            return !isNaN(date.getTime());
        };
        Message.ComposeMessage = function (selectedTime, selectedTemperature) {
            var temp = ["1", "2", "3"].indexOf(selectedTemperature);
            if (0 > temp) {
                return "";
            }
            if (!Message.isValidDate(selectedTime)) {
                return "";
            }
            return Message.MessageStartingChar
                + selectedTemperature
                + Message.MessageSeparatorChar
                + selectedTime.getHours()
                + ":"
                + selectedTime.getMinutes()
                + Message.MessageEndingChar;
        };
        Message.lastMessageId = 0;
        Message.FakeMessage = new Message(true, "fake", "fake");
        Message.MessageEndingChar = '#';
        Message.MessageStartingChar = '*';
        Message.MessageSeparatorChar = '_';
        return Message;
    })();
    blueclient.Message = Message;
    var MessagesPipe = (function () {
        function MessagesPipe(device, connectPromise, chatDeferrer) {
            this.device = device;
            this.connectPromise = connectPromise;
            this.chatDeferrer = chatDeferrer;
        }
        return MessagesPipe;
    })();
    blueclient.MessagesPipe = MessagesPipe;
    var MessagesService = (function () {
        function MessagesService($q, ErrorsService) {
            var _this = this;
            this.$q = $q;
            this.ErrorsService = ErrorsService;
            this.Messages = {};
            this.GetMessagesWithDeviceId = function (deviceId) {
                var chatWithId = _this.Messages[deviceId];
                if (!chatWithId) {
                    _this.Messages[deviceId] = chatWithId = [Message.FakeMessage];
                }
                return chatWithId;
            };
            this.AddMessage = function (byMe, deviceId, text) {
                var chatWithId = _this.GetMessagesWithDeviceId(deviceId);
                var newMessageStatus = (byMe) ? 'pending' : 'received';
                var result = new Message(byMe, text, newMessageStatus);
                chatWithId.unshift(result);
                return result;
            };
            this.SendMessage = function (device, text) {
                var message = _this.AddMessage(true, device.id, text + '\n');
                bluetoothSerial.write(text, function () { message.status = 'sent'; }, function (error) { message.status = 'failed'; });
            };
            this.GetMessages = function (deviceId) {
                _this.ErrorsService.addError("Getting messages for device ...");
                return _this.GetMessagesWithDeviceId(deviceId);
            };
            this.StartListeningDevice = function (device, secure) {
                var connectDeferrer = _this.$q.defer();
                var chatDeferrer = _this.$q.defer();
                var result = new MessagesPipe(device, connectDeferrer.promise, chatDeferrer);
                var deviceBlueeToothId = MessagesService.GetDeviceBluetoothIdentifier(device);
                var connectMethod = (secure ? bluetoothSerial.connect : bluetoothSerial.connectInsecure);
                connectMethod(deviceBlueeToothId, function () {
                    connectDeferrer.resolve();
                    _this.ErrorsService.addError("Connected...");
                    bluetoothSerial.subscribe('n', function () {
                        _this.ErrorsService.addError("registered for data reading");
                        var untypedChatDeferrerPromise = chatDeferrer.promise;
                        if (0 === untypedChatDeferrerPromise.$$state.status) {
                            bluetoothSerial.readUntil(Message.MessageEndingChar, function (data) {
                                if (data) {
                                    _this.ErrorsService.addError("received message");
                                    var receivedMessage = _this.AddMessage(false, device.id, data);
                                    chatDeferrer.notify(receivedMessage);
                                }
                            }, function (error) {
                                _this.ErrorsService.addError("Failed to read data");
                                chatDeferrer.reject(error);
                            });
                        }
                    }, function (error) {
                        _this.ErrorsService.addError("Failed to listen device");
                        chatDeferrer.reject(error);
                    });
                }, function (error) {
                    connectDeferrer.reject(error);
                    chatDeferrer.reject(error);
                });
                return result;
            };
        }
        MessagesService.GetDeviceBluetoothIdentifier = function (device) {
            return device.address;
        };
        MessagesService.Alias = "MessagesService";
        MessagesService.$inject = ['$q', blueclient.ErrorsService.Alias];
        return MessagesService;
    })();
    blueclient.MessagesService = MessagesService;
    blueclient.blueclientServices.service(MessagesService.Alias, MessagesService);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var mocks;
    (function (mocks) {
        var BluetoothSerialMock = (function () {
            function BluetoothSerialMock() {
                var _this = this;
                this.devices = [{ name: 'salut', id: "1", address: "some address" }, { name: 'blue', id: "2", address: 'something here' }];
                this.list = function (a, b) { a(_this.devices); };
                this.discoverUnpaired = function (a, b) { a(_this.devices); };
                this.write = function (text, a, b) { a(); };
                this.connect = function (id, a, b) { a(); };
                this.connectInsecure = function (id, a, b) { a(); };
                this.subscribe = function (limiter, a, b) {
                    setInterval(function () {
                        a();
                    }, 5000);
                };
                this.readUntil = function (limiter, a, b) { a("fake read\n"); };
            }
            return BluetoothSerialMock;
        })();
        mocks.BluetoothSerialMock = BluetoothSerialMock;
    })(mocks = blueclient.mocks || (blueclient.mocks = {}));
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var BlueChatDetailCtrl = (function () {
        function BlueChatDetailCtrl($scope, MessagesService, $stateParams, ErrorsService, BluetoothDevicesService) {
            var _this = this;
            this.$scope = $scope;
            this.MessagesService = MessagesService;
            this.messageText = "";
            this.device = null;
            this.messages = [];
            this.selectedTime = new Date();
            this.selectedTemperature = "2";
            this.isDateValid = true;
            this.isConnected = false;
            this.RefreshScope = function () {
                if (!_this.$scope.$$phase) {
                    _this.$scope.$apply();
                }
            };
            this.UpdateSendState = function () {
                _this.isDateValid = blueclient.Message.isValidDate(_this.selectedTime);
            };
            this.OnMessageReceived = function (message) {
                var a = _this.messages;
                _this.messages = [];
                _this.messages = a;
                _this.RefreshScope();
            };
            this.onConnection = function () { _this.isConnected = true; };
            this.onDisconnection = function () { _this.isConnected = false; };
            this.Connect = function (secure) {
                _this.isConnected = false;
                var messagesPipe = _this.MessagesService.StartListeningDevice(_this.device, secure);
                messagesPipe.connectPromise.then(_this.onConnection, _this.onDisconnection);
                _this.$scope.$on('$destroy', function () {
                    messagesPipe.chatDeferrer.resolve();
                });
                messagesPipe.chatDeferrer.promise.then(_this.onConnection, _this.onDisconnection, _this.OnMessageReceived);
            };
            this.SendMessage = function () {
                _this.messageText = blueclient.Message.ComposeMessage(_this.selectedTime, _this.selectedTemperature);
                if (_this.messageText !== "") {
                    _this.MessagesService.SendMessage(_this.device, _this.messageText);
                    _this.messageText = "";
                    _this.RefreshScope();
                }
            };
            this.GetMessageClass = function (message) {
                if (!message.mine) {
                    return 'message-blue';
                }
            };
            this.device = BluetoothDevicesService.getDevice($stateParams.deviceId);
            this.messages = MessagesService.GetMessages($stateParams.deviceId);
            this.$scope.ctrl = this;
        }
        BlueChatDetailCtrl.Alias = "BlueChatDetailCtrl";
        BlueChatDetailCtrl.$inject = ['$scope', blueclient.MessagesService.Alias, '$stateParams', blueclient.ErrorsService.Alias, blueclient.BluetoothDevicesService.Alias];
        return BlueChatDetailCtrl;
    })();
    blueclient.BlueChatDetailCtrl = BlueChatDetailCtrl;
    blueclient.blueclientControllers.controller(BlueChatDetailCtrl.Alias, BlueChatDetailCtrl);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var DevicesCtrl = (function () {
        function DevicesCtrl($scope, DevicesService, ErrorsService) {
            var _this = this;
            this.DevicesService = DevicesService;
            this.ErrorsService = ErrorsService;
            this.pairedDevicesList = [];
            this.unpairedDevicesList = [];
            this.RefreshDevicesList = function () {
                _this.pairedDevicesList = [];
                _this.unpairedDevicesList = [];
                try {
                    _this.DevicesService.listPairedDevices()
                        .then(function (devices) { return _this.pairedDevicesList = devices; })
                        .catch(function (reason) { return _this.ErrorsService.addError(reason); })
                        .finally(function () { return _this.ErrorsService.addError("Done reading paired devices."); });
                    _this.DevicesService.listUnPairedDevices()
                        .then(function (devices) { return _this.unpairedDevicesList = devices; })
                        .catch(function (reason) { return _this.ErrorsService.addError(reason); })
                        .finally(function () { return _this.ErrorsService.addError("Done reading unpaired devices."); });
                }
                catch (err) {
                    _this.ErrorsService.addError(err.message);
                }
            };
            $scope.devicesCtrl = this;
        }
        DevicesCtrl.Alias = "DevicesCtrl";
        DevicesCtrl.$inject = ['$scope', blueclient.BluetoothDevicesService.Alias, blueclient.ErrorsService.Alias];
        return DevicesCtrl;
    })();
    blueclient.DevicesCtrl = DevicesCtrl;
    blueclient.blueclientControllers.controller(DevicesCtrl.Alias, DevicesCtrl);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var ErrCtrl = (function () {
        function ErrCtrl($scope, ErrorsService) {
            $scope.Refresh = function () {
                $scope.Errors = [];
                $scope.Errors = ErrorsService.Errors;
            };
            $scope.Refresh();
        }
        ErrCtrl.Alias = "ErrCtrl";
        return ErrCtrl;
    })();
    blueclient.ErrCtrl = ErrCtrl;
    blueclient.blueclientControllers.controller(ErrCtrl.Alias, ErrCtrl);
})(blueclient || (blueclient = {}));
