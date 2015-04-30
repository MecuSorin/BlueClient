/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class ErrCtrl {
		public static Alias="ErrCtrl";
		constructor($scope, ErrorsService) {
    		$scope.Refresh = function() { 
    			$scope.Errors = [];
    			$scope.Errors = ErrorsService.Errors; 
    		}
    		$scope.Refresh();
    	}
	}
	blueclientControllers.controller(ErrCtrl.Alias, ErrCtrl);
}