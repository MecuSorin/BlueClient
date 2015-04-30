/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class DevicesCtrl {
		public static Alias="DevicesCtrl";
        public static $inject=['$scope', BluetoothDevicesService.Alias, ErrorsService.Alias];
        
		constructor($scope: IDevicesCtrlScope, public DevicesService: BluetoothDevicesService, public ErrorsService: ErrorsService) {
            $scope.devicesCtrl = this;
        }

        public pairedDevicesList: IBluetoothDevice[] = [];
        public unpairedDevicesList: IBluetoothDevice[] = [];

        public RefreshDevicesList = () => {
            this.pairedDevicesList =[];
            this.unpairedDevicesList=[];
            try {
                this.DevicesService.listPairedDevices()
                    .then((devices:IBluetoothDevice[]) => this.pairedDevicesList = devices )
                    .catch(reason => this.ErrorsService.addError(reason) )
                    .finally(() => this.ErrorsService.addError("Done reading paired devices."));
                this.DevicesService.listUnPairedDevices()
                    .then((devices:IBluetoothDevice[]) => this.unpairedDevicesList = devices)
                    .catch(reason => this.ErrorsService.addError(reason))
                    .finally(() => this.ErrorsService.addError("Done reading unpaired devices."));
            }
            catch(err) {
                this.ErrorsService.addError(err.message);
            }
        };
	}

	blueclientControllers.controller(DevicesCtrl.Alias, DevicesCtrl);
}