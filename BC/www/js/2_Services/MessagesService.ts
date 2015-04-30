/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
  export class Message {
    private static lastMessageId: number = 0;
    constructor(public mine: boolean, public text: string, public status: string) {
      this.id = 1+ Message.lastMessageId;
      Message.lastMessageId +=1;
    }
    public id:number = 0;

    public static FakeMessage = new Message(true, "fake", "fake");

    public static MessageEndingChar = '\n';
  }

	export class MessagesPipe {
		constructor(public device: IBluetoothDevice, 
				public connectPromise: angular.IPromise<void>,  
      		public chatDeferrer: angular.IDeferred<IMessage>) {}

	}

	export class MessagesService {
		public static Alias="MessagesService";
    public static $inject = ['$q', ErrorsService.Alias];
    
		constructor(public $q:angular.IQService, public ErrorsService: ErrorsService) {}

		private Messages: IMessagesDictionary = {};

		private GetMessagesWithDeviceId = (deviceId: string): IMessage[] => {
      var chatWithId = this.Messages[deviceId];
      if(!chatWithId) {
      	this.Messages[deviceId] = chatWithId = [ Message.FakeMessage];
      }
      return chatWithId;
    };

  	private AddMessage = (byMe: boolean, deviceId:string, text: string): IMessage => {
      	var chatWithId = this.GetMessagesWithDeviceId(deviceId);
        var newMessageStatus =  (byMe) ? 'pending' : 'received';
      	var result = new Message(byMe, text, newMessageStatus);
      	chatWithId.push(result);
      	return result;
  	};

		public static GetDeviceBluetoothIdentifier(device: IBluetoothDevice): string {
      return device.address;
    }

    public SendMessage = (device: IBluetoothDevice, text: string) => { 
      var message = this.AddMessage(true, device.id, text + '\n'); 
      bluetoothSerial.write(text, () => { message.status = 'sent'; }, error => { message.status = 'failed'; });
    };

  	public GetMessages = (deviceId: string): IMessage[] => {
    	this.ErrorsService.addError("Getting messages for device ...");
    	return this.GetMessagesWithDeviceId(deviceId);
  	};

  	public StartListeningDevice = (device, secure): MessagesPipe => {  //bool that choose the type of connection
    	var connectDeferrer = this.$q.defer<void>();
    	var chatDeferrer = this.$q.defer<IMessage>();
    	var result = new MessagesPipe(device, connectDeferrer.promise, chatDeferrer);
    		
			var deviceBlueeToothId = MessagesService.GetDeviceBluetoothIdentifier(device);
        	var connectMethod = (secure ? bluetoothSerial.connect : bluetoothSerial.connectInsecure); 
        	connectMethod(deviceBlueeToothId, 
          		() => {  //on connect
            		connectDeferrer.resolve();
            		this.ErrorsService.addError("Connected...");
            	
            		bluetoothSerial.subscribe('n', 
              			() => { // on subscribe
                			this.ErrorsService.addError("registered for data reading");
                			var untypedChatDeferrerPromise = <any>chatDeferrer.promise;
                			if(0 === untypedChatDeferrerPromise.$$state.status) { //pending
                  				bluetoothSerial.readUntil(Message.MessageEndingChar, 
				                    data => { //on readuntil success
                      					if(data) { 
                        					this.ErrorsService.addError("received message");
                        					var receivedMessage = this.AddMessage(false, device.id, data);
                        					chatDeferrer.notify(receivedMessage); 
                  						}
                    				}, error => { //on readuntil error
                      					this.ErrorsService.addError("Failed to read data");
                      					chatDeferrer.reject(error);
                    				});
                			}
              			}, error => { //on subscribe error
                			this.ErrorsService.addError("Failed to listen device");
                			chatDeferrer.reject(error);
              			});
          		}, error => { //on connect error
 					connectDeferrer.reject(error);
            		chatDeferrer.reject(error);
          		});
        	return result;
      	}
    }

	blueclientServices.service(MessagesService.Alias, MessagesService);
}
