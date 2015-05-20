declare module blueclient {
	interface IIdentified {
		Id: string;
	}

	interface IBluetoothDevice {
		id: string;
		address: string;
		class: string;
		name: string;
	}

	interface IMessage {
		id: number;
		mine: boolean;
		text: string;
		status: string;
	}

	interface IMessagesDictionary {
		[deviceId: string]: IMessage[];
	}

	interface GenericCtrl{}

	interface IBlueChatDetailCtrlScope extends angular.IScope {
		ctrl: GenericCtrl;
	}

	interface IDevicesCtrlScope extends angular.IScope{
		devicesCtrl: GenericCtrl;
	}
}

declare module blueclient.mocks {
	interface IBluetoothSerialMock {
		list(after: Function, fail: Function);
		discoverUnpaired(after: Function, fail: Function);
		write(text: string, after: Function, fail: Function);
		connect(idDevice: string, after: Function, fail: Function);
		connectInsecure(idDevice: string, after: Function, fail: Function);
		subscribe(messageEndDelimiter: string, after: Function, fail: Function);
		readUntil(messageEndDelimiter: string, after: Function, fail: Function);
		read(after: Function, fail: Function);
	}


}

declare var bluetoothSerial: blueclient.mocks.IBluetoothSerialMock;
