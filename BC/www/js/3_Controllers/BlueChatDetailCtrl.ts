/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class BlueChatDetailCtrl {
		public static Alias="BlueChatDetailCtrl";
    public static $inject = ['$scope', MessagesService.Alias, '$stateParams', ErrorsService.Alias, BluetoothDevicesService.Alias];
    
		constructor(public $scope: IBlueChatDetailCtrlScope, 
                public MessagesService: MessagesService,
                $stateParams, 
            		ErrorsService: ErrorsService, 
                BluetoothDevicesService: BluetoothDevicesService) {
  		this.device =  BluetoothDevicesService.getDevice($stateParams.deviceId);
  		this.messages = MessagesService.GetMessages($stateParams.deviceId);
  		this.$scope.ctrl = this;
  	}

  	public messageText: string = "";
  	public device: IBluetoothDevice = null;
  	public messages: IMessage[] = [];
    public selectedTime = new Date().setHours(0,0,0,0);
    public selectedTemperature: string = "2";

    public isDateValid: boolean = true;
    public isConnected: boolean = false;

  	private RefreshScope = () => {
  		if (!this.$scope.$$phase) { 
  			this.$scope.$apply();
  		}
  	};



    public UpdateSendState = ()=> {
      this.isDateValid = Message.isValidDate(this.selectedTime);
    };

  	private  OnMessageReceived = (message:IMessage) => {
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

  	public SendMessage = () => {
      this.messageText = Message.ComposeMessage(this.selectedTime, this.selectedTemperature);
      if(this.messageText !== "") {
        this.MessagesService.SendMessage(this.device, this.messageText);
      	this.messageText = "";
      	this.RefreshScope();
      }
		};
    
  	public GetMessageClass = (message) => {
    		if(!message.mine) { return 'message-blue'; }
  	};
  }

  blueclientControllers.controller(BlueChatDetailCtrl.Alias, BlueChatDetailCtrl);
}
