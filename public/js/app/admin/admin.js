app.controller('AdminCheckUserCtrl', ['$scope', '$http', '$filter',
	function($scope, $http, $filter) {
		$http.get('js/app/admin/check_list.json').then(function(resp) {
			$scope.items = resp.data;
		});
	}
]);