app.controller('AdminCheckUserCtrl', ['$scope', '$http', '$filter',
	function($scope, $http, $filter) {
		$scope.oneAtATime = true;

		$http.get('js/app/admin/check_list.json').then(function(resp) {
			$scope.items = resp.data;
			$scope.brandAgentItems = $filter('filter')($scope.items, {type:'2'});
			$scope.salesAgentItems = $filter('filter')($scope.items, {type:'1'});

			$scope.approve = function(item, items){
				items.splice(items.indexOf(item),1);
			};

			$scope.reject = function(item, items){
				items.splice(items.indexOf(item),1);
			};
		});
	}
]);