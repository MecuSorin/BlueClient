/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {

	export class BluetoothDevicesService {
		public static Alias="BluetoothDevicesService";
    public static $inject = ['$q'];

		constructor(public $q:angular.IQService) {}

  	private pairedList = [];
  	private unpairedList=[];

		public listPairedDevices = ():angular.IPromise<IBluetoothDevice[]> => {
      var deferred = this.$q.defer<IBluetoothDevice[]>();
      try{
        bluetoothSerial.list((devicesFound: IBluetoothDevice[])=> { 
    		  deferred.resolve(devicesFound); 
    			this.pairedList = devicesFound; 
				}, reason => { 
					deferred.reject(reason); 
					this.pairedList = [];});
    	}
      catch(err) {
        this.pairedList = [];
        deferred.reject(err.message);
      }
      return deferred.promise;
    };

    public listUnPairedDevices = ():angular.IPromise<IBluetoothDevice[]> => {
      var deferred = this.$q.defer<IBluetoothDevice[]>();
      try{
        bluetoothSerial.discoverUnpaired((devicesFound: IBluetoothDevice[]) => { 
          deferred.resolve(devicesFound); 
          this.unpairedList = devicesFound; 
	      }, reason => { 
          deferred.reject(reason); 
	        this.unpairedList=[]; 
	      });
      }
      catch(err) {
        this.unpairedList=[];
        deferred.reject(err.message);
      }
      return deferred.promise;
    };

    public getDevice = (deviceId: string): IBluetoothDevice => {
      try {
        return this.findById(this.pairedList, deviceId);
      }
      catch(err){
        return this.findById(this.unpairedList, deviceId);
      }
    };


    private findById(source: IBluetoothDevice[], id: string): IBluetoothDevice {
      for (var i = 0; i < source.length; i++) {
        if (source[i].id === id) {
          return source[i];
        }
      }
      throw "Couldn't find object with id: " + id;
    }

  }
  
  blueclientServices.service(BluetoothDevicesService.Alias, BluetoothDevicesService);
}