(function() {
	function getBrandList(BrandService, $scope, $filter) {
		return BrandService.getBrandList().then(function(items) {
			$scope.items = items;
			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		});
	}

	function getMyBrandList(BrandService, $scope, $filter){
		return BrandService.getBrandList().then(function(items){
			$scope.items = _.filter(items, function(item){
				return item.created_by == $scope.currentUser.username;
			});

			$scope.item = $filter('orderBy')($scope.items, 'first')[0];
			$scope.item.selected = true;
		})
	}

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
						},
						app: function(){
							return $scope.app;
						}
					}
				});
			};

			$scope.viewProduct = function (product) {

				var modalInstance = $modal.open({
					templateUrl: 'productViewModal.html',
					controller: 'ProductViewModalCtrl',
					resolve: {
						product: function () {
							return product;
						},
						app: function(){
							return $scope.app;
						}
					}
				});

			};
		}
	]);

	app.controller('ProductEditModalCtrl', ['$scope', '$modalInstance', 'product', 'brand', 'BrandService', 'app',
		function ($scope, $modalInstance, product, brand, BrandService, app) {

			$scope.isNew = false;
			$scope.app = app;

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
		}
	]);

	app.controller('ProductViewModalCtrl', function ($scope, $modalInstance, product, app) {
		$scope.app = app;
		$scope.selectedProduct = product;

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});

	app.controller('SellingCityViewModalCtrl', function( $scope, $modalInstance, city, products){
		$scope.city = city;
		$scope.products = products;
		console.log($scope.products);
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

	app.controller('BrandDetailCtrl', ['$scope', 'BrandService', '$filter', '$stateParams','$modal',
		function($scope, BrandService, $filter, $stateParams, $modal) {
			$scope.brand = {};
			$scope.city = {};
			$scope.map = null;
			$scope.newComment = {
				rating: 5
			};

			BrandService.getBrand($stateParams.brandId).then(function(brand) {
				$scope.brand = brand;
				$scope.city = $scope.brand.selling_cities[0];
				if ($scope.city) {
					$scope.city.selected = true;
					$scope.map = new Map();
					_.each($scope.brand.selling_cities, function(city) {
						city.point = $scope.map.generatePoint(city, $scope);
					});
					$scope.map.centerZoom();
					$scope.map.centerToPoint($scope.map.points[0]);
				}
			});

			$scope.viewCity = function (selectedCity) {
				console.log($scope.brand.productseries_set);
				var modalInstance = $modal.open({
					templateUrl: 'sellingCityOnMapViewModal.html',
					controller: 'SellingCityViewModalCtrl',
					resolve: {
						city: function () {
							return selectedCity;
						},
						products: function() {
							return $scope.brand.productseries_set;
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

			$scope.addComment = function(comment, parent) { // parent could be brand or product
				comment.created_at = new Date();
				comment.created_by = $scope.currentUser.username;
				delete parent['$$hashKey'];
				if(!parent.comments){
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

	/*****************************************************************************************************************/
	app.controller('CategoryBrandsCtrl', ['$scope', '$stateParams', '$filter', 'BrandService',
		function($scope, $stateParams, $filter, BrandService) {
			var all_brands = [];
			$scope.categorys = [];
			BrandService.getCategoryBrandList().then(function(category) {
				$scope.categorys = category;
			});

			$scope.brands = [];
			BrandService.getBrandList().then(function(items) {
				$scope.brands = items;
				all_brands = items;
			});

			$scope.styles = [];
			BrandService.getStyleList().then(function(results) {
				$scope.styles = results;
			});

			$scope.materials = [];
			BrandService.getMaterialList().then(function(results) {
				$scope.materials = results;
			});

			$scope.searchCategoryBrands = function(category){
				$scope.brands = _.filter(all_brands, function(obj){
						return _.contains(obj.category, parseInt(category.id));
					}
				)
			};

			$scope.focusBrand = function(brandName){

				for(var b = 0; b < all_brands.length; b++){
					for(var bs = 0; bs < all_brands[b].style.length; bs++){
						var styleName = [];
						var styleFullids = all_brands[b].style.join(",");
						for(var s = 0; s < $scope.styles.length; s++){
							if(styleFullids.indexOf($scope.styles[s].id.toString()) > -1){
								styleName.push($scope.styles[s].name);
							}
						}
						all_brands[b]['style_text'] = styleName;
					}

					for(var bc = 0; bc < all_brands[b].category.length; bc++){
						var categoryName = [];
						var categoryFullids = all_brands[b].category.join(",");
						for(var c = 0; c < $scope.categorys.length; c++){
							if(categoryFullids.indexOf($scope.categorys[c].id.toString()) > -1){
								categoryName.push($scope.categorys[c].name);
							}
						}
						all_brands[b]['category_text'] = categoryName;
					}

					for(var bm = 0; bm < $scope.materials.length; bm++){
						var materialName = [];
						var materialFullids = all_brands[b].material.join(",");
						for(var m = 0; m < $scope.materials.length; m++){
							if(materialFullids.indexOf($scope.materials[m].id.toString()) > -1){
								materialName.push($scope.materials[m].name);
							}
						}
						all_brands[b]['material_text'] = materialName;
					}
				}

				/**************** test brands object values **************/
				for(var i = 0; i < $scope.brands.length; i++){
					console.log("brand name >> " + $scope.brands[i]);
				}
				/**************** test brands object values **************/

				if(brandName == ""){
					$scope.brands = all_brands;
				}
				else{
					$scope.brands = $filter('filter')(all_brands, brandName, false);
					/*if($scope.brands.length == 0){
						BrandService.getBrandList().then(function(items) {
							$scope.brands = items;
						});
					}*/
				}
			};
		}
	]);
	/*****************************************************************************************************************/

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
Map.prototype.generatePoint = function(infoObj, $scope) {
	var that = this;
	var point = new BMap.Point(infoObj.lon, infoObj.lat);
	this.points.push(point);
	var marker = new BMap.Marker(point);

	var handlePointClick = function(){
		$scope.selectCity(infoObj);
		var $dataRow = $("#" + infoObj.id);
		var $table = $($dataRow.parent().parent());
		var thisOffsetTop = $dataRow.offset().top;
		$table.scrollTop(0);
		$table.scrollTop($dataRow.offset().top - $table.offset().top);
		$scope.viewCity($scope.city);
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
	});
	this.map.addOverlay(point.labelAddress);
};