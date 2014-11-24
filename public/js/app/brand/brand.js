(function() {
	function getBrandList(BrandService, $scope, $filter) {
		return BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});
	};

	function getMyBrandList(BrandService, $scope, $filter) {
		return BrandService.getBrandList().then(function(items) {
			$scope.items = _.filter(items, function(item) {
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

			$scope.getStyleName = function() {
				if ($scope.item) {
					var text = "";
					_.each($scope.item.style, function(style, idx) {
						text += $scope.app.getStyleText(style);
						if (idx < $scope.item.style.length - 1) {
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

	app.controller('BrandExpandCityCtrl', ['$scope', 'BrandService', '$filter','$http',
		function($scope, BrandService, $filter,$http) {
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
					var newCity = {
						id: new Date().valueOf(),
						name: $scope.app.getProvinceCityText(city.province, city.city),
						lat: "",
						lon: ""
					};
					var url = "http://api.map.baidu.com/geocoder/v2/?ak=fxEBGc46DmIt6oK2yjk4GC57&output=json&address=%E5%8C%97%E4%BA%AC%E5%B8%82&callback=JSON_CALLBACK";

					$http.jsonp(url).success(function(data) {
						var location = data.result.location;
						newCity.lat = location.lat;
						newCity.lon = location.lng;
						$scope.item.expanding_cities.push(newCity);
						BrandService.updateBrand($scope.item);
					});
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

			$scope.editProduct = function(product, brand) {

				var modalInstance = $modal.open({
					templateUrl: 'productEditModal.html',
					controller: 'ProductEditModalCtrl',
					resolve: {
						product: function() {
							return product;
						},
						BrandService: function() {
							return BrandService;
						},
						brand: function() {
							return brand;
						},
						app: function() {
							return $scope.app;
						}
					}
				});
			};

			$scope.viewProduct = function(product) {

				var modalInstance = $modal.open({
					templateUrl: 'productViewModal.html',
					controller: 'ProductViewModalCtrl',
					resolve: {
						product: function() {
							return product;
						},
						app: function() {
							return $scope.app;
						}
					}
				});

			};
		}
	]);

	app.controller('ProductEditModalCtrl', ['$scope', '$modalInstance', 'product', 'brand', 'BrandService', 'app',
		function($scope, $modalInstance, product, brand, BrandService, app) {

			$scope.isNew = false;
			$scope.app = app;

			if (!product) {
				$scope.isNew = true;
				product = {
					decoration_styles: 1,
					category: 1,
					material_types: 1
				};
			}

			$scope.tempProduct = _.clone(product);

			$scope.save = function(updatedProduct) {
				if (updatedProduct.name) {
					if ($scope.isNew) {
						brand.productseries_set.push(updatedProduct);
					} else {
						product = _.extend(product, updatedProduct);
					}
					BrandService.updateBrand(brand);
					$modalInstance.close();
				}
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		}
	]);

	app.controller('ProductViewModalCtrl', function($scope, $modalInstance, product, app) {
		$scope.app = app;
		$scope.selectedProduct = product;

		$scope.cancel = function() {
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

	app.controller('BrandDetailCtrl', ['$scope', 'BrandService', '$filter', '$stateParams', '$modal',
		function($scope, BrandService, $filter, $stateParams, $modal) {
			$scope.brand = {};
			$scope.city = {};
			$scope.expandingCity = {};
			$scope.map = null;
			$scope.expandingCityMap = null;
			$scope.newComment = {
				rating: 5
			};

			BrandService.getBrand($stateParams.brandId).then(function(brand) {
				$scope.brand = brand;
				$scope.city = $scope.brand.selling_cities[0];
				if ($scope.city) {
					$scope.city.selected = true;
					$scope.map = new Map("baiduMap");
					_.each($scope.brand.selling_cities, function(city) {
						city.point = $scope.map.generatePoint(city, $scope.selectCity, $scope.viewProduct);
					});
					$scope.map.centerZoom();
					$scope.map.centerToPoint($scope.map.points[0]);
				}

				$scope.expandingCity = $scope.brand.expanding_cities[0];
				if ($scope.expandingCity) {
					$scope.expandingCity.selected = true;
					$scope.expandingCityMap = new Map("baiduMapForExpandingCity");
					$scope.expandingCityMap.zoomSize = 6;
					_.each($scope.brand.expanding_cities, function(city) {
						city.point = $scope.expandingCityMap.generatePoint(city, $scope.selectExpandingCity);
					});
					$scope.expandingCityMap.centerZoom(new BMap.Point(116.404, 39.915));
				}
			});

			$scope.openExpandingCity = function(){
				$scope.expandingCityMap.centerZoom(new BMap.Point(100.404, 39.915));
			};

			$scope.viewProduct = function() {
				var modalInstance = $modal.open({
					templateUrl: 'productViewModal.html',
					controller: 'ProductViewModalCtrl',
					resolve: {
						product: function() {
							return $scope.brand.productseries_set[0];
						},
						app: function() {
							return $scope.app;
						}
					}
				});
			};

			$scope.selectCity = function(city) {
				angular.forEach($scope.brand.selling_cities, function(city) {
					city.selected = false;
				});
				$scope.city = city;
				$scope.city.selected = true;
				$scope.map.centerToPoint(city.point);
			};

			$scope.selectExpandingCity = function(city) {
				angular.forEach($scope.brand.expanding_cities, function(city) {
					city.selected = false;
				});
				$scope.expandingCity = city;
				$scope.expandingCity.selected = true;
				$scope.expandingCityMap.centerToPoint(city.point);
			};

			$scope.addComment = function(comment, parent) { // parent could be brand or product
				comment.created_at = new Date();
				comment.created_by = $scope.currentUser.username;
				delete parent['$$hashKey'];
				if (!parent.comments) {
					parent.comments = [];
				}
				parent.comments.push(comment);
				$scope.newComment = {
					rating: 5
				};
				console.log($scope.brand);
				BrandService.updateBrand($scope.brand);
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


var Map = function(id) {
	this.map = new BMap.Map(id);
	this.map.enableScrollWheelZoom(true);
	this.zoomSize = 14;
	this.points = [];
	/*this.map.centerAndZoom(new BMap.Point(116.404, 39.915), this.zoomSize);  // 初始化地图,设置中心点坐标和地图级别
	this.map.addControl(new BMap.MapTypeControl());   //添加地图类型控件*/
	//this.map.setCurrentCity("北京");   
	//this.map.addControl(new BMap.NavigationControl());
};
Map.prototype.generatePoint = function(infoObj, selectCityFn, viewProductFn) {
	var that = this;
	var point = new BMap.Point(infoObj.lon, infoObj.lat);
	this.points.push(point);
	var marker = new BMap.Marker(point);
	point.marker = marker;

	var handlePointClick = function() {
		if(selectCityFn){
			selectCityFn(infoObj);
		}
		var $dataRow = $("#" + infoObj.id);
		var $table = $($dataRow.parent().parent());
		var thisOffsetTop = $dataRow.offset().top;
		$table.scrollTop(0);
		$table.scrollTop($dataRow.offset().top - $table.offset().top);
		if(viewProductFn){
			viewProduct()
		}
	};

	marker.addEventListener("click", function() {
		handlePointClick();
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
	point.labelAddress.addEventListener("click", function() {
		handlePointClick();
	});

	//this.map.addOverlay(point.labelAddress);

	return point;
};
Map.prototype.centerZoom = function(point) {
	if(!point && this.points.length > 0){
		point = this.points[0];
	}
	this.map.centerAndZoom(point, this.zoomSize);
};

Map.prototype.centerToPoint = function(point) {
	var that = this;
	this.map.panTo(point);
	$.each(this.points, function() {
		that.map.removeOverlay(this.labelAddress);
	})
	this.map.addOverlay(point.labelAddress);
};