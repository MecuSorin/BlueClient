/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient.mocks {
	export class BluetoothSerialMock {
		private devices = [{ name:'salut', id: "1", address:"some address"}, { name:'blue', id: "2", address: 'something here'}];

		private ___a : Function = null;
		public list = (a, b) => { a(this.devices);};
      	public discoverUnpaired = (a,b) => { a(this.devices); };
      	public write = (text, a, b) => { a();  if(this.___a) this.___a();};
		public connect = (id, a, b) => { a(); };
		public connectInsecure = (id, a, b) => { a(); };
		public subscribe = (limiter, a, b) => { this.___a =a;/*b('fake subscribe error');*/setInterval(function(){  
				a(); 
		}, 5000);  };
		public readUntil = (limiter, a, b) => {  /*b('fake read error'); */a("fake read"+Message.MessageEndingChar); };
	}
}

module blueclient {
	//export var bluetoothSerial = new mocks.BluetoothSerialMock();
}
