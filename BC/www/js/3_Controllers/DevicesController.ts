/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class DevicesCtrl {
		public static Alias="DevicesCtrl";
        public static $inject=['$scope', BluetoothDevicesService.Alias, ErrorsService.Alias];
        public pairedDevicesList: IBluetoothDevice[] = [];
        public unpairedDevicesList: IBluetoothDevice[] = [];
		constructor(public $scope: IDevicesCtrlScope, 
            public DevicesService: BluetoothDevicesService, 
            public ErrorsService: ErrorsService) {
            $scope.devicesCtrl = this;
            this.LoadPairedDevices();
        }

        private RefreshScope = () => {
            if (!this.$scope.$$phase) { 
                this.$scope.$apply();
            }
        };
        
        private LoadPairedDevices = () => {
            try {
                this.pairedDevicesList =[];
                this.DevicesService.listPairedDevices()
                    .then((devices:IBluetoothDevice[]) => this.pairedDevicesList = devices )
                    .catch(reason => this.ErrorsService.addError(reason) )
                    .finally(() => {
                        this.ErrorsService.addError("Done reading paired devices.")
                        this.RefreshScope();
                    });
            }
            catch(err) {
                this.ErrorsService.addError(err.message);
            }
        };

        private LoadUnpairedDevices() {
            try {
                this.unpairedDevicesList=[];
                this.DevicesService.listUnPairedDevices()
                    .then((devices:IBluetoothDevice[]) => this.unpairedDevicesList = devices)
                    .catch(reason => this.ErrorsService.addError(reason))
                    .finally(() => {
                        this.ErrorsService.addError("Done reading unpaired devices.");
                        this.RefreshScope();
                    });
            }
            catch(err) {
                this.ErrorsService.addError(err.message);
            }
    
        };

        public RefreshDevicesList = () => {
            this.LoadPairedDevices();
            this.LoadUnpairedDevices();
        };

	}

	blueclientControllers.controller(DevicesCtrl.Alias, DevicesCtrl);
}