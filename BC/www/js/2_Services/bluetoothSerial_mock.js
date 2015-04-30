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
exports.bluetoothSerial = new blueclient.mocks.BluetoothSerialMock();
