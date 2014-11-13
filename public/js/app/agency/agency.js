app.controller('AgencyListCtrl', ['$scope', '$filter', 'AgencyService',
	function($scope, $filter, AgencyService) {
		$scope.searchKey = "";
		$scope.agencyList = [];

		AgencyService.getAgencyList().then(function(res) {
			$scope.agencyList = res;
		});

		$scope.searchAgency = function(searchKey) {

		};
	}
]);

app.controller("AgencyDetailCtrl", ['$scope', '$stateParams', 'AgencyService',
	function($scope, $stateParams, AgencyService) {
		$scope.agency = {};

		AgencyService.getAgency($stateParams.agencyId).then(function(agency) {
			$scope.agency = agency;
		});

		$scope.addComment = function(comment) {
			comment.created_at = new Date();
			comment.created_by = $scope.currentUser.username;
			if (!$scope.agency.comment) {
				$scope.agency.comment = [];
			}
			$scope.agency.comment.push(comment);
			AgencyService.addComment($scope.agency.id, comment);
			$scope.newComment = {};
		};
	}
]);