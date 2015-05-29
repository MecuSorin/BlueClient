/// <reference path="../0_typings/angularjs/angular.d.ts" />
/// <reference path="interfaces.d.ts" />
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
    var DeviceStatusService = (function () {
        function DeviceStatusService($q) {
            var _this = this;
            this.CurrentStatus = "Unknown";
            this.deferredStatus = null;
            this.NotifyProtocolMessageReceived = function (message) {
                _this.CurrentStatus = message;
            };
            this.deferredStatus = $q.defer();
        }
        DeviceStatusService.prototype.RegisterForStatusUpdates = function () {
            return this.deferredStatus.promise;
        };
        DeviceStatusService.prototype.SignalUnknownState = function () {
            this.deferredStatus.notify("Unknown state");
        };
        DeviceStatusService.prototype.SignalKnownState = function (stateText) {
            if (stateText && stateText[stateText.length - 1] === blueclient.Message.MessageEndingChar) {
                var patternWarming = new RegExp(".*Warming the butter.");
                if (patternWarming.test(stateText)) {
                    this.deferredStatus.notify("Warming the butter");
                }
                var patternIddle = new RegExp(".*Recharging.");
                if (patternIddle.test(stateText)) {
                    this.deferredStatus.notify("Recharging");
                }
            }
        };
        DeviceStatusService.Alias = "DeviceStatusService";
        return DeviceStatusService;
    })();
    blueclient.DeviceStatusService = DeviceStatusService;
    blueclient.blueclientServices.service(DeviceStatusService.Alias, DeviceStatusService);
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
            this.addFunkyError = function (message) {
                _this.addError(JSON.stringify({ some: [123, 234], m: message, x: { a: 'a' } }));
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
        Message.pad = function (num, size) {
            var s = num + "";
            while (s.length < size)
                s = "0" + s;
            return s;
        };
        Message.ComposeMessage = function (selectedTime, selectedTemperature) {
            var temp = ["1", "2", "3"].indexOf(selectedTemperature);
            if (0 > temp) {
                return "";
            }
            if (!Message.isValidDate(selectedTime)) {
                return "";
            }
            return Message.MessageEndingChar
                + selectedTemperature
                + Message.MessageSeparatorChar
                + Message.pad(selectedTime.getHours(), 2)
                + Message.MessageSeparatorChar
                + Message.pad(selectedTime.getMinutes(), 2)
                + Message.MessageEndingChar;
        };
        Message.IsValidProtocol = function (messageText) {
            return 1 + 1 + 2 + 1 + 2 + 1 === messageText.length &&
                Message.MessageSeparatorChar === messageText[1] &&
                Message.MessageSeparatorChar === messageText[4] &&
                Message.MessageEndingChar === messageText[7];
        };
        Message.lastMessageId = 0;
        Message.FakeMessage = new Message(true, "fake", "fake");
        Message.MessageEndingChar = '|';
        Message.ReceivedMessageEnding = "|";
        Message.MessageSeparatorChar = '*';
        Message.StatusRequestSequence = "?|";
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
        function MessagesService($q, ErrorsService, DeviceStatusService, $timeout) {
            var _this = this;
            this.$q = $q;
            this.ErrorsService = ErrorsService;
            this.DeviceStatusService = DeviceStatusService;
            this.$timeout = $timeout;
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
            this.RequestStatus = function (device) {
                console.log("Requested the status");
                bluetoothSerial.write(Message.StatusRequestSequence, function () { }, function (error) { });
            };
            this.SendMessage = function (device, text) {
                var message = _this.AddMessage(true, device.id, text);
                console.log(message); //TODO to remove
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
                var deviceBlueToothId = MessagesService.GetDeviceBluetoothIdentifier(device);
                var connectMethod = (secure ? bluetoothSerial.connect : bluetoothSerial.connectInsecure);
                connectMethod(deviceBlueToothId, function () {
                    connectDeferrer.resolve();
                    _this.ErrorsService.addError("Connected...");
                    bluetoothSerial.subscribe(Message.ReceivedMessageEnding, function (data) {
                        if (MessagesService.IsPromisePending(chatDeferrer)) {
                            console.log(" BBB - Readed: " + data);
                            if (Message.IsValidProtocol(data)) {
                                console.log(" BBB - valid message");
                                _this.ErrorsService.addError("Readed message: [" + data + "]");
                                var properMessage = data.substring(0, data.length - 1);
                                var receivedMessage = _this.AddMessage(false, device.id, properMessage);
                                chatDeferrer.notify(receivedMessage);
                                _this.DeviceStatusService.NotifyProtocolMessageReceived("Programed the device ...");
                                _this.$timeout(function () { _this.RequestStatus(device); }, 3000);
                            }
                            else {
                                _this.DeviceStatusService.SignalKnownState(data);
                            }
                        }
                        else {
                            console.log(" BBB - Ignoring data from bluetooth");
                        }
                    }, function (error) {
                        _this.ErrorsService.addError("Failed to listen device");
                        chatDeferrer.reject(error);
                    });
                    _this.RequestStatus(device); // request status
                }, function (error) {
                    connectDeferrer.reject(error);
                    chatDeferrer.reject(error);
                });
                return result;
            };
        }
        MessagesService.ToString = function (text) {
            var out = "";
            for (var i = 0; i < text.length; i++) {
                out = out + String.fromCharCode(text[i]);
            }
            for (var i = 0; i < text.length; i++) {
                out = out + text[i];
            }
            out = out + ' caractere: ' + text.length;
            return out;
        };
        MessagesService.GetDeviceBluetoothIdentifier = function (device) {
            return device.address;
        };
        MessagesService.IsPromisePending = function (promiseDeferrer) {
            var untypedPromise = promiseDeferrer.promise;
            return 0 === untypedPromise.$$state.status;
        };
        MessagesService.Alias = "MessagesService";
        MessagesService.$inject = ['$q', blueclient.ErrorsService.Alias, blueclient.DeviceStatusService.Alias, '$timeout'];
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
                this.ceva = 1;
                this.list = function (a, b) { a(_this.devices); };
                this.discoverUnpaired = function (a, b) { a(_this.devices); };
                this.write = function (text, a, b) { a(); };
                this.connect = function (id, a, b) { a(); };
                this.connectInsecure = function (id, a, b) { a(); };
                this.subscribe = function (limiter, a, b) {
                    setInterval(function () {
                        a((1 === this.ceva % 2 ? "Recharging" : "1*12*34") + blueclient.Message.MessageEndingChar);
                        this.ceva += 1;
                    }, 5000);
                };
                this.readUntil = function (limiter, a, b) { a("Recharging" + blueclient.Message.MessageEndingChar); };
                this.subscribeRawData = function (s, f) { setInterval(function () { s(['f', 'a', 'K', '@']); }, 5000); };
            }
            return BluetoothSerialMock;
        })();
        mocks.BluetoothSerialMock = BluetoothSerialMock;
    })(mocks = blueclient.mocks || (blueclient.mocks = {}));
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var BlueChatDetailController = (function () {
        function BlueChatDetailController($scope, MessagesService, $stateParams, ErrorsService, BluetoothDevicesService, DeviceStatusService) {
            var _this = this;
            this.$scope = $scope;
            this.MessagesService = MessagesService;
            this.messageText = "";
            this.device = null;
            this.messages = [];
            this.selectedTime = new Date(new Date().setHours(0, 0, 0, 0));
            this.selectedTemperature = "2";
            this.deviceStatus = "";
            this.isDateValid = true;
            this.isConnected = false;
            this.RefreshScope = function () {
                if (!_this.$scope.$$phase) {
                    _this.$scope.$apply();
                }
            };
            this.UpdateDeviceStatus = function (status) {
                _this.deviceStatus = status;
                _this.RefreshScope();
            };
            this.UpdateSendState = function () {
                _this.isDateValid = blueclient.Message.isValidDate(_this.selectedTime);
            };
            this.OnMessageReceived = function (message) {
                console.log("Following message was received: " + message.text);
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
            this.SendMessage = function (temp) {
                _this.selectedTemperature = "" + temp;
                _this.messageText = blueclient.Message.ComposeMessage(_this.selectedTime, _this.selectedTemperature);
                console.log(_this.messageText);
                if (_this.messageText !== "") {
                    _this.MessagesService.SendMessage(_this.device, _this.messageText);
                    _this.messageText = "";
                    _this.RefreshScope();
                }
            };
            this.GetTemperatureClass = function (temp) {
                return "" + (("" + temp) == _this.selectedTemperature ? " selectedTemp" : "");
            };
            this.GetMessageClass = function (message) {
                if (!message.mine) {
                    return 'message-blue';
                }
            };
            this.device = BluetoothDevicesService.getDevice($stateParams.deviceId);
            this.messages = MessagesService.GetMessages($stateParams.deviceId);
            this.$scope.ctrl = this;
            this.$scope.UI.showInfoButton = true;
            this.$scope.$on('$destroy', function () { _this.$scope.UI.showInfoButton = false; });
            DeviceStatusService.RegisterForStatusUpdates().then(null, null, this.UpdateDeviceStatus);
            DeviceStatusService.SignalUnknownState();
        }
        BlueChatDetailController.Alias = "BlueChatDetailController";
        BlueChatDetailController.$inject = ['$scope', blueclient.MessagesService.Alias, '$stateParams', blueclient.ErrorsService.Alias, blueclient.BluetoothDevicesService.Alias, blueclient.DeviceStatusService.Alias];
        return BlueChatDetailController;
    })();
    blueclient.BlueChatDetailController = BlueChatDetailController;
    blueclient.blueclientControllers.controller(BlueChatDetailController.Alias, BlueChatDetailController);
})(blueclient || (blueclient = {}));
/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
var blueclient;
(function (blueclient) {
    var DevicesCtrl = (function () {
        function DevicesCtrl($scope, DevicesService, ErrorsService) {
            var _this = this;
            this.$scope = $scope;
            this.DevicesService = DevicesService;
            this.ErrorsService = ErrorsService;
            this.pairedDevicesList = [];
            this.unpairedDevicesList = [];
            this.RefreshScope = function () {
                if (!_this.$scope.$$phase) {
                    _this.$scope.$apply();
                }
            };
            this.LoadPairedDevices = function () {
                try {
                    _this.pairedDevicesList = [];
                    _this.DevicesService.listPairedDevices()
                        .then(function (devices) { return _this.pairedDevicesList = devices; })
                        .catch(function (reason) { return _this.ErrorsService.addError(reason); })
                        .finally(function () {
                        _this.ErrorsService.addError("Done reading paired devices.");
                        _this.RefreshScope();
                    });
                }
                catch (err) {
                    _this.ErrorsService.addError(err.message);
                }
            };
            this.RefreshDevicesList = function () {
                _this.LoadPairedDevices();
                _this.LoadUnpairedDevices();
            };
            $scope.devicesCtrl = this;
            this.LoadPairedDevices();
        }
        DevicesCtrl.prototype.LoadUnpairedDevices = function () {
            var _this = this;
            try {
                this.unpairedDevicesList = [];
                this.DevicesService.listUnPairedDevices()
                    .then(function (devices) { return _this.unpairedDevicesList = devices; })
                    .catch(function (reason) { return _this.ErrorsService.addError(reason); })
                    .finally(function () {
                    _this.ErrorsService.addError("Done reading unpaired devices.");
                    _this.RefreshScope();
                });
            }
            catch (err) {
                this.ErrorsService.addError(err.message);
            }
        };
        ;
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
                $scope.DebuggingSpace = [];
                $scope.DebuggingSpace = myVeryOwnDebuggingSpace;
            };
            $scope.ClearLogs = function () {
                ErrorsService.Errors = [];
                myVeryOwnDebuggingSpace = [];
                this.Refresh();
            };
            $scope.Refresh();
        }
        ErrCtrl.Alias = "ErrCtrl";
        return ErrCtrl;
    })();
    blueclient.ErrCtrl = ErrCtrl;
    blueclient.blueclientControllers.controller(ErrCtrl.Alias, ErrCtrl);
})(blueclient || (blueclient = {}));
//# sourceMappingURL=blueclient.js.map