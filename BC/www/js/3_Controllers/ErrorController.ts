/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module blueclient {
	export class ErrCtrl {
		public static Alias="ErrCtrl";
		constructor($scope, ErrorsService) {
    		$scope.Refresh = function() { 
    			$scope.Errors = [];
    			$scope.Errors = ErrorsService.Errors; 
                $scope.DebuggingSpace = [];
                $scope.DebuggingSpace = myVeryOwnDebuggingSpace; 
    		}
            $scope.ClearLogs = function() {
                ErrorsService.Errors = [];
                myVeryOwnDebuggingSpace = [];
                this.Refresh();
            }

    		$scope.Refresh();
    	}
	}
	blueclientControllers.controller(ErrCtrl.Alias, ErrCtrl);
}