app.controller('AdminCheckUserCtrl', ['$scope', '$http', '$filter', 'UserService',
	function($scope, $http, $filter, UserService) {
		$scope.oneAtATime = true;
		
		UserService.getToBeApprovedUsers().then(function(resp){
			$scope.items = resp;
			$scope.brandAgentItems = $filter('filter')($scope.items, {type:'B'});
			$scope.salesAgentItems = $filter('filter')($scope.items, {type:'S'});

			$scope.approve = function(item, items){
				items.splice(items.indexOf(item),1);
			};

			$scope.reject = function(item, items){
				items.splice(items.indexOf(item),1);
			};
		});
	}
]);