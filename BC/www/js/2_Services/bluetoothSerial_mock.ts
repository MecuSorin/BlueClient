/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient.mocks {
	export class BluetoothSerialMock {
		private devices = [{ name:'salut', id: "1", address:"some address"}, { name:'blue', id: "2", address: 'something here'}];
		private ceva = 1;
		public list = (a, b) => { a(this.devices);};
      	public discoverUnpaired = (a,b) => { a(this.devices); };
      	public write = (text, a, b) => { a(); };
		public connect = (id, a, b) => { a(); };
		public connectInsecure = (id, a, b) => { a(); };
		public subscribe = (limiter, a, b) => { /*b('fake subscribe error');*/setInterval(function(){  
				a((1===this.ceva%2 ? "Recharging" : "1*12*34")+ Message.MessageEndingChar); 
				this.ceva+=1;
		}, 5000);  };
		public readUntil = (limiter, a, b) => {  /*b('fake read error'); */a("Recharging"+Message.MessageEndingChar); };
		public subscribeRawData = (s, f) => { setInterval(function() { s(['f', 'a', 'K', '@']); }, 5000); };
	}
}

module blueclient {
	//export var bluetoothSerial = new mocks.BluetoothSerialMock();
}
