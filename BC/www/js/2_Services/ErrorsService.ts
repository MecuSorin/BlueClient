/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class Error {
		private static lastId :number = 0;
		constructor(public message: any) {
			this.Id = Error.lastId+1;	// javascript is secvential so it is ok 
			Error.lastId += 1;			// no atomic wrapers are needed
		}
		public Id:number = 0;
	}

	export class ErrorsService {
		public static Alias="ErrorsService";
		public Errors: Error[] = [];
		public addError = (message: any) => {
			this.Errors.push( new Error(message));
		}
	}
	blueclientServices.service(ErrorsService.Alias, ErrorsService);
}

