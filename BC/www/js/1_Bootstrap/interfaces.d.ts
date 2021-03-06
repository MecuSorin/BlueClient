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

	interface IBlueUI {
		showInfoButton: boolean;
		infoVisible: boolean;
	}

	interface IBlueScope  extends angular.IScope {
		UI: IBlueUI;
	}

	interface IBlueChatDetailCtrlScope extends IBlueScope {
		ctrl: GenericCtrl;
	}

	interface IDevicesCtrlScope extends IBlueScope {
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
		subscribeRawData(after: Function, fail: Function): void;
	}
}

declare var bluetoothSerial: blueclient.mocks.IBluetoothSerialMock;
declare var myVeryOwnDebuggingSpace: any;