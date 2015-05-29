/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class DeviceStatusService {
		public static Alias="DeviceStatusService";
		constructor($q: angular.IQService) {
			this.deferredStatus = $q.defer<string>();
		}

		CurrentStatus = "Unknown";
		private deferredStatus : angular.IDeferred<string> = null;
		public RegisterForStatusUpdates(): angular.IPromise<string> {
			return this.deferredStatus.promise;
		}

		public SignalUnknownState() {
			this.deferredStatus.notify("Unknown state");
		}

		public SignalKnownState(stateText: string) {
			if(stateText && stateText[stateText.length-1]===Message.MessageEndingChar) {
				var patternWarming = new RegExp(".*Warming the butter.");
				if(patternWarming.test(stateText)) {
					this.deferredStatus.notify("Warming the butter");
				}
				var patternIddle = new RegExp(".*Recharging.");
				if(patternIddle.test(stateText)) {
					this.deferredStatus.notify("Recharging");
				}
			}
		}

		public NotifyProtocolMessageReceived = (message: string) => {
			this.CurrentStatus = message;
		}
	}
	blueclientServices.service(DeviceStatusService.Alias, DeviceStatusService);
}

