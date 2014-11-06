(function() {
	function getBrandList(BrandService, $scope, $filter) {
		return BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});
	}

	app.controller('BrandManageCtrl', ['$scope', 'BrandService', '$filter',
		function($scope, BrandService, $filter) {
			getBrandList(BrandService, $scope, $filter);

			$scope.getMaterialName = function(){
				if($scope.item){
					var text = "";
					_.each($scope.item.material, function(material,idx){
						text += $scope.app.getMaterialText(material);
						if(idx < $scope.item.material.length -1){
							text += ",";
						}						
					});
					return text;
				}
			};

			$scope.getCategoryName = function(){
				if($scope.item){
					var text = "";
					_.each($scope.item.category, function(category,idx){
						text += $scope.app.getCategoryText(category);
						if(idx < $scope.item.category.length -1){
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
			$scope.newCity = {
				province: "100011",
				city: "110100"
			};
			$scope.province = $scope.app.provinceList[0];

			var self = this;

			$scope.changeProvince = function(){
				$scope.province = _.find($scope.app.provinceList, function(province){
					return province.code == $scope.newCity.province;
				});
				$scope.newCity.city = $scope.province.cities[0].code;
			}

			getBrandList(BrandService, $scope, $filter)

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
					$scope.item.expanding_cities.push($scope.app.getProvinceCityText(city.province,city.city));
				}
			};
		}
	]);

	app.controller('BrandSellingCityCtrl', ['$scope', 'BrandService', '$filter',
		function($scope, BrandService, $filter) {
			$scope.newStore = {};

			getBrandList(BrandService, $scope, $filter)

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

			getBrandList(BrandService, $scope, $filter)

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
				$scope.city.selected = true;
				$scope.map = new Map();
				_.each($scope.brand.selling_cities, function(city){
					city.point = $scope.map.generatePoint(city.lon, city.lat, city);
				});
				$scope.map.centerZoom();
				$scope.map.centerToPoint($scope.map.points[0]);
			});

			$scope.selectCity = function(city) {
				angular.forEach($scope.brand.selling_cities, function(city) {
					city.selected = false;
				});
				$scope.city = city;
				$scope.city.selected = true;
				$scope.map.centerToPoint(city.point);
			};

			$scope.addComment = function(comment){
				comment.created_at = new Date();
				comment.created_by = $scope.currentUser.username;
				$scope.brand.comment.push(comment);
				$scope.newComment = {};
			
			};
		}
	]);
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