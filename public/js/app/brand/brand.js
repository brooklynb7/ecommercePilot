app.controller('BrandCreateCtrl', ['$scope', 'BrandService', '$filter',
	function($scope, BrandService, $filter) {
		$scope.brandInfo = {
			"name": "",
			"description": "",
			"logo": "",
			"productseries_set": [],
			"brand_agent": $scope.currentUser.username,
			"web_site": "",
			"phone": '',
			"factory": '',
			"selling_cities": [],
			"expanding_cities": [],			
			"created_by": $scope.currentUser.username,
			"updated_by": $scope.currentUser.username
		};

		$scope.create = function() {
			console.log($scope.brandInfo);
		};
	}
]);

app.controller('BrandManageCtrl', ['$scope', 'BrandService', '$filter',
	function($scope, BrandService, $filter) {
		BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});

		$scope.selectItem = function(item) {
			angular.forEach($scope.items, function(item) {
				item.selected = false;
				item.editing = false;
			});
			$scope.item = item;
			$scope.item.selected = true;
		};

		$scope.deleteItem = function(item) {
			$scope.items.splice($scope.items.indexOf(item), 1);
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			if ($scope.item) $scope.item.selected = true;
		};

		$scope.createItem = function() {
			var item = {};
			$scope.items.push(item);
			$scope.selectItem(item);
			$scope.item.editing = true;
		};

		$scope.editItem = function(item) {
			if (item && item.selected) {
				item.editing = true;
			}
		};

		$scope.doneEditing = function(item) {
			item.editing = false;
		};

	}
]);