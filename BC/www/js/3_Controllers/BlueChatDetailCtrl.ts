/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class BlueChatDetailController {
		public static Alias="BlueChatDetailController";
    public static $inject = ['$scope', MessagesService.Alias, '$stateParams', ErrorsService.Alias, BluetoothDevicesService.Alias, DeviceStatusService.Alias];
    
		constructor(public $scope: IBlueChatDetailCtrlScope, 
                public MessagesService: MessagesService,
                $stateParams, 
            		ErrorsService: ErrorsService, 
                BluetoothDevicesService: BluetoothDevicesService,
                DeviceStatusService: DeviceStatusService) {
  		this.device =  BluetoothDevicesService.getDevice($stateParams.deviceId);
  		this.messages = MessagesService.GetMessages($stateParams.deviceId);
  		this.$scope.ctrl = this;
      this.$scope.UI.showInfoButton = true;
      this.$scope.$on('$destroy', ()=> { this.$scope.UI.showInfoButton = false; });
      DeviceStatusService.RegisterForStatusUpdates().then(null,null, this.UpdateDeviceStatus);
      DeviceStatusService.SignalUnknownState();
  	}

  	public messageText: string = "";
  	public device: IBluetoothDevice = null;
  	public messages: IMessage[] = [];
    public selectedTime = new Date( new Date().setHours(0,0,0,0));
    public selectedTemperature: string = "2";
    public deviceStatus: string = "";
    public isDateValid: boolean = true;
    public isConnected: boolean = false;

  	private RefreshScope = () => {
  		if (!this.$scope.$$phase) { 
  			this.$scope.$apply();
  		}
  	};

    private UpdateDeviceStatus = (status: string)=> {
      this.deviceStatus = status;
      this.RefreshScope();
    }

    public UpdateSendState = ()=> {
      this.isDateValid = Message.isValidDate(this.selectedTime);
    };

  	private  OnMessageReceived = (message:IMessage) => {
    	console.log("Following message was received: "+message.text)
      var a = this.messages;
    	this.messages = [];
    	this.messages = a;
    	this.RefreshScope();
    };

    private onConnection= () => { this.isConnected = true; };
    private onDisconnection = () => { this.isConnected = false };

  	public Connect = (secure:boolean) => { // secure is a bool that specifies what type of connection
    	this.isConnected= false;
    	var messagesPipe: MessagesPipe = this.MessagesService.StartListeningDevice(this.device, secure);
      messagesPipe.connectPromise.then(this.onConnection, this.onDisconnection);
    	this.$scope.$on('$destroy', function() {
      		messagesPipe.chatDeferrer.resolve();
    	});
		  messagesPipe.chatDeferrer.promise.then(this.onConnection, this.onDisconnection, this.OnMessageReceived);
    };

  	public SendMessage = (temp: number): void => {
      this.selectedTemperature = ""+temp;
      this.messageText = Message.ComposeMessage(this.selectedTime, this.selectedTemperature);
      console.log(this.messageText);
      if(this.messageText !== "") {
        this.MessagesService.SendMessage(this.device, this.messageText);
      	this.messageText = "";
      	this.RefreshScope();
      }
		};
    
    public GetTemperatureClass = (temp: number): string => {
      return "" + ((""+temp) == this.selectedTemperature ? " selectedTemp" : "");
    }

  	public GetMessageClass = (message) => {
    		if(!message.mine) { return 'message-blue'; }
  	};
  }

  blueclientControllers.controller(BlueChatDetailController.Alias, BlueChatDetailController);
}
