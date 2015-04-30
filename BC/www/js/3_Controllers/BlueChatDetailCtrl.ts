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

  	public connectVisible: boolean = true;
  	public messageText: string = "";
  	public device: IBluetoothDevice = null;
  	public messages: IMessage[] = [];

  	private RefreshScope = () => {
  		if (!this.$scope.$$phase) { 
  			this.$scope.$apply();
  		}
  	}

  	private  OnMessageReceived = (message:IMessage) => {
    	var a = this.messages;
    	this.messages = [];
    	this.messages = a;
    	this.RefreshScope();
    };

  	public Connect = (secure:boolean) => { // secure is a bool that specifies what type of connection
    	this.connectVisible = false;
    	var messagesPipe = this.MessagesService.StartListeningDevice(this.device, secure);
    	this.$scope.$on('$destroy', function() {
      		messagesPipe.chatDeferrer.resolve();
    	});
		  messagesPipe.chatDeferrer.promise.then(null, null, this.OnMessageReceived);
    };
    
  	public SendMessage = () => {
      	this.MessagesService.SendMessage(this.device, this.messageText);
      	this.messageText = "";
      	this.RefreshScope();
		};
    
  	public GetMessageClass = (message) => {
    		if(!message.mine) { return 'message-blue'; }
  	};
  }

  blueclientControllers.controller(BlueChatDetailCtrl.Alias, BlueChatDetailCtrl);
}
