(function() {
	function getBrandList(BrandService, $scope, $filter) {
		return BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});
	};

	function getMyBrandList(BrandService, $scope, $filter){
		return BrandService.getBrandList().then(function(items){
			$scope.items = _.filter(items, function(item){
				return item.created_by == $scope.currentUser.username;
			});

			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		})
	};

	app.controller('BrandManageCtrl', ['$scope', 'BrandService', '$filter',
		function($scope, BrandService, $filter) {

			getMyBrandList(BrandService, $scope, $filter);

			$scope.getMaterialName = function() {
				if ($scope.item) {
					var text = "";
					_.each($scope.item.material, function(material, idx) {
						text += $scope.app.getMaterialText(material);
						if (idx < $scope.item.material.length - 1) {
							text += ",";
						}
					});
					return text;
				}
			};

			$scope.getCategoryName = function() {
				if ($scope.item) {
					var text = "";
					_.each($scope.item.category, function(category, idx) {
						text += $scope.app.getCategoryText(category);
						if (idx < $scope.item.category.length - 1) {
							text += ",";
						}
					});
					return text;
				}
			};

			$scope.selectItem = function(item) {
				angular.forEach($scope.items, function(item) {
					item.selected = false;
					item.editing = false;
				});
				$scope.item = item;
				$scope.item.selected = true;
			};

			$scope.deleteItem = function(item) {
				BrandService.deleteBrand(item);
				$scope.items.splice($scope.items.indexOf(item), 1);
				$scope.item = $filter('orderBy')($scope.items, 'first')[0];
				if ($scope.item) $scope.item.selected = true;
			};

			$scope.createItem = function() {
				var item = {};
				item.created_by = $scope.currentUser.username;
				item.id = Math.floor((Math.random() * 9900) + 100).toString();
				item.productseries_set = [];
				item.expanding_cities = [];
				item.selling_cities = [];
				$scope.items.push(item);
				BrandService.createBrand(item);
				$scope.selectItem(item);
				$scope.item.editing = true;
			};

			$scope.editItem = function(item) {
				if (item && item.selected) {
					item.editing = true;
				}
			};

			$scope.doneEditing = function(item) {
				BrandService.updateBrand(item);
				item.editing = false;
			};

		}
	]);

	app.controller('BrandExpandCityCtrl', ['$scope', 'BrandService', '$filter',
		function($scope, BrandService, $filter) {
			$scope.newCity = {
				province: "100011",
				city: "110100"
			};
			$scope.province = $scope.app.provinceList[0];

			var self = this;

			$scope.changeProvince = function() {
				$scope.province = _.find($scope.app.provinceList, function(province) {
					return province.code == $scope.newCity.province;
				});
				$scope.newCity.city = $scope.province.cities[0].code;
			};

			getMyBrandList(BrandService, $scope, $filter);

			$scope.selectItem = function(item) {
				angular.forEach($scope.items, function(item) {
					item.selected = false;
				});
				$scope.item = item;
				$scope.item.selected = true;
			};

			$scope.deleteCity = function(city) {
				$scope.item.expanding_cities.splice($scope.item.expanding_cities.indexOf(city), 1);
				BrandService.updateBrand($scope.item);
			};

			$scope.addCity = function(city) {
				if (city) {
					$scope.item.expanding_cities.push($scope.app.getProvinceCityText(city.province, city.city));
					BrandService.updateBrand($scope.item);
				}
			};
		}
	]);

	app.controller('BrandSellingCityCtrl', ['$scope', 'BrandService', '$filter',
		function($scope, BrandService, $filter) {
			$scope.newStore = {};

			getMyBrandList(BrandService, $scope, $filter);

			$scope.selectItem = function(item) {
				angular.forEach($scope.items, function(item) {
					item.selected = false;
				});
				$scope.item = item;
				$scope.item.selected = true;
			};

			$scope.deleteStore = function(store) {
				$scope.item.selling_cities.splice($scope.item.selling_cities.indexOf(store), 1);
				BrandService.updateBrand($scope.item);
			};

			$scope.addStore = function(store) {
				if (store.name && store.city && store.address) {
					$scope.item.selling_cities.push(store);
					BrandService.updateBrand($scope.item);
					$scope.newStore = {};
				}
			};
		}
	]);

	app.controller('BrandProductSeriesCtrl', ['$scope', 'BrandService', '$filter', '$modal',
		function($scope, BrandService, $filter, $modal) {
			$scope.newProduct = {
				decoration_styles: 1,
				category: 1,
				material_types: 1
			};

			getMyBrandList(BrandService, $scope, $filter);

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

			$scope.save = function(product) {
				if (product.name) {
					$scope.item.productseries_set.push(product);
					BrandService.updateBrand($scope.item);
				}
			};

			$scope.editProduct = function (product, brand) {

				var modalInstance = $modal.open({
					templateUrl: 'productEditModal.html',
					controller: 'ProductEditModalCtrl',
					resolve: {
						product: function () {
							return product;
						},
						BrandService: function () {
							return BrandService;
						},
						brand: function () {
							return brand;
						}
					}
				});
			}

			$scope.viewProduct = function (product) {

				var modalInstance = $modal.open({
					templateUrl: 'productViewModal.html',
					controller: 'ProductViewModalCtrl',
					resolve: {
						product: function () {
							return product;
						}
					}
				});

			};
		}
	]);

	app.controller('ProductEditModalCtrl',
		function ($scope, $modalInstance, product, brand, BrandService) {

		$scope.isNew = false;

		if(!product) {
			$scope.isNew = true;
			product = {
				decoration_styles: 1,
				category: 1,
				material_types: 1
			};
		}

		$scope.tempProduct = _.clone(product);

		$scope.save = function (updatedProduct) {
			if (updatedProduct.name) {
				if($scope.isNew){
					brand.productseries_set.push(updatedProduct);
				}
				else{
					product = _.extend(product, updatedProduct);
				}
				BrandService.updateBrand(brand);
				$modalInstance.close();
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss(	'cancel');
		};
	});

	app.controller('ProductViewModalCtrl', function ($scope, $modalInstance, product) {

		$scope.selectedProduct = product;

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});

	app.controller('BrandSearchCtrl', ['$scope', 'BrandService', '$filter',
		function($scope, BrandService, $filter) {
			$scope.searchKey = "";
			$scope.brandResults = [];

			$scope.searchBrand = function(searchKey) {
				BrandService.getBrandList().then(function(items) {
					$scope.brandResults = items;
				});
			};
		}
	]);

	app.controller('BrandDetailCtrl', ['$scope', 'BrandService', '$filter', '$stateParams',
		function($scope, BrandService, $filter, $stateParams) {
			$scope.brand = {};
			$scope.city = {};
			$scope.map = null;
			$scope.newComment = {};

			BrandService.getBrand($stateParams.brandId).then(function(brand) {
				$scope.brand = brand;
				$scope.city = $scope.brand.selling_cities[0];
				if ($scope.city) {
					$scope.city.selected = true;
					$scope.map = new Map();
					_.each($scope.brand.selling_cities, function(city) {
						city.point = $scope.map.generatePoint(city.lon, city.lat, city);
					});
					$scope.map.centerZoom();
					$scope.map.centerToPoint($scope.map.points[0]);
				}
			});

			$scope.selectCity = function(city) {
				angular.forEach($scope.brand.selling_cities, function(city) {
					city.selected = false;
				});
				$scope.city = city;
				$scope.city.selected = true;
				$scope.map.centerToPoint(city.point);
			};

			$scope.addComment = function(comment) {
				comment.created_at = new Date();
				comment.created_by = $scope.currentUser.username;
				if(!$scope.brand.comment){
					$scope.brand.comment = [];
				}
				$scope.brand.comment.push(comment);
				$scope.newComment = {};

			};
		}
	]);

	app.controller('CarouselCtrl', ['$scope', function($scope) {
		$scope.myInterval = 2000;
		var slides = $scope.slides = [];
		$scope.addSlide = function() {
			slides.push({
				image: 'img/furniture/1000' + (slides.length + 1) + '.jpg',
				text: ['description', 'description', 'description', 'description'][slides.length % 4]
			});
		};
		for (var i = 0; i < 4; i++) {
			$scope.addSlide();
		}
	}]);

}());


var Map = function() {
	this.map = new BMap.Map("baiduMap");
	this.map.enableScrollWheelZoom(true);
	this.zoomSize = 14;
	this.points = [];
	/*this.map.centerAndZoom(new BMap.Point(116.404, 39.915), this.zoomSize);  // 初始化地图,设置中心点坐标和地图级别
	this.map.addControl(new BMap.MapTypeControl());   //添加地图类型控件*/
	//this.map.setCurrentCity("北京");   
	//this.map.addControl(new BMap.NavigationControl());
};
Map.prototype.generatePoint = function(lng, lat, infoObj) {
	var that = this;
	var point = new BMap.Point(lng, lat);
	this.points.push(point);
	var marker = new BMap.Marker(point);
	marker.addEventListener("click", function() {

	});
	this.map.addOverlay(marker);

	point.labelAddress = new BMap.Label(infoObj.name, {
		position: point,
		offset: new BMap.Size(10, -30)
	});
	var labelStyle = {
		fontSize: "20px",
		color: "#0075c7"
	};
	point.labelAddress.setStyle(labelStyle);

	//this.map.addOverlay(point.labelAddress);

	return point;
};
Map.prototype.centerZoom = function() {
	if (this.points.length > 0) {
		this.map.centerAndZoom(this.points[0], this.zoomSize);
	}
};

Map.prototype.centerToPoint = function(point) {
	var that = this;
	this.map.panTo(point);
	$.each(this.points, function() {
		that.map.removeOverlay(this.labelAddress);
	})
	this.map.addOverlay(point.labelAddress);
};