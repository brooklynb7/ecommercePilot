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

app.controller('BrandExpandCityCtrl', ['$scope', 'BrandService', '$filter',
	function($scope, BrandService, $filter) {
		$scope.newCity = "";

		BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});

		$scope.selectItem = function(item) {
			angular.forEach($scope.items, function(item) {
				item.selected = false;
			});
			$scope.item = item;
			$scope.item.selected = true;
		};

		$scope.deleteCity = function(city) {
			$scope.item.expanding_cities.splice($scope.item.expanding_cities.indexOf(city), 1);
		};

		$scope.addCity = function(city) {
			if (city) {
				$scope.item.expanding_cities.push(city);
				$scope.newCity = "";
			}
		};
	}
]);

app.controller('BrandSellingCityCtrl', ['$scope', 'BrandService', '$filter',
	function($scope, BrandService, $filter) {
		$scope.newStore = {};

		BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});

		$scope.selectItem = function(item) {
			angular.forEach($scope.items, function(item) {
				item.selected = false;
			});
			$scope.item = item;
			$scope.item.selected = true;
		};

		$scope.deleteStore = function(store) {
			$scope.item.selling_cities.splice($scope.item.selling_cities.indexOf(store), 1);
		};

		$scope.addStore = function(store) {
			if (store.name && store.city && store.address) {
				$scope.item.selling_cities.push(store);
				$scope.newStore = {};
			}
		};
	}
]);

app.controller('BrandProductSeriesCtrl', ['$scope', 'BrandService', '$filter',
	function($scope, BrandService, $filter) {
		$scope.newProduct = {
			decoration_styles: 1,
			category: 1,
			material_types: 1
		};

		BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});

		$scope.selectItem = function(item) {
			angular.forEach($scope.items, function(item) {
				item.selected = false;
			});
			$scope.item = item;
			$scope.item.selected = true;
		};

		$scope.deleteStore = function(store) {
			$scope.item.selling_cities.splice($scope.item.selling_cities.indexOf(store), 1);
		};

		$scope.addProduct = function(product) {
			if (product.name && product.short_description && product.description) {
				$scope.item.productseries_set.push(product);
				$scope.newProduct = {};
			}
		};
	}
]);