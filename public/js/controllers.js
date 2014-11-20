'use strict';

(function() {

	var appController = angular.module('app.controllers', ['pascalprecht.translate', 'ngCookies']);

	appController.controller('AppCtrl', ['$scope', '$rootScope', '$state', '$translate', '$localStorage', '$window', 'USER_ROLES', 'UserService', 'BrandService','AuthService','AUTH_EVENTS', 'TaxonomyService','AgencyService', 'PublicationService',
		function($scope, $rootScope, $state, $translate, $localStorage, $window, USER_ROLES, UserService, BrandService,AuthService, AUTH_EVENTS, TaxonomyService,AgencyService, PublicationService) {
			// add 'ie' classes to html
			var isIE = !!navigator.userAgent.match(/MSIE/i);
			isIE && angular.element($window.document.body).addClass('ie');
			isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
			// config
			$scope.app = {
				name: '电子商务平台',
				version: '1.3.1',
				// for chart colors
				color: {
					primary: '#7266ba',
					info: '#23b7e5',
					success: '#27c24c',
					warning: '#fad733',
					danger: '#f05050',
					light: '#e8eff0',
					dark: '#3a3f51',
					black: '#1c2b36'
				},
				settings: {
					themeID: 1,
					navbarHeaderColor: 'bg-black',
					navbarCollapseColor: 'bg-white-only',
					asideColor: 'bg-black',
					headerFixed: true,
					asideFixed: false,
					asideFolded: true,
					asideDock: true,
					container: false
				},
				userType: [{
					'value': 'S',
					'text': '经销商'
				}, {
					'value': 'B',
					'text': '品牌公司'
				}],
				categoryList: [],
				provinceList: [],
				materialList: [],
				decorationStyleList: [],
				slidesImages: []
			};

			UserService.loadUsers();
			BrandService.loadBrands();
			AgencyService.loadAgencies();
			PublicationService.loadPublications();

			$scope.app.getProvinceCityText = function(provinceId, cityId){
				var provinceObj = _.find($scope.app.provinceList, function(province){
					return province.code == provinceId;
				});
				var cityObj = _.find(provinceObj.cities, function(city){
					return city.code == cityId;
				});

				return provinceObj.name + cityObj.name;
			};

			$scope.app.getMaterialText = function(id){
				var materialObj = _.find($scope.app.materialList, function(material){
					return material.id == id;
				});
				if(materialObj) {
					return materialObj.name;
				}
				return "";
			};

			$scope.app.getCategoryText = function(id){
				var categoryObj = _.find($scope.app.categoryList, function(category){
					return category.id == id;
				});
				if(categoryObj) {
					return categoryObj.name;
				}
				return "";
			};

			$scope.app.getStyleText = function(id){
				var styleObj = _.find($scope.app.decorationStyleList, function(style){
					return style.id == id;
				});
				if(styleObj) {
					return styleObj.name;
				}
				return "";
			};

			TaxonomyService.getCategoryList({
				//root:"True"
			}).then(function(categoryList) {
				$scope.app.categoryList = categoryList;
			});

			TaxonomyService.getProvinceList({
				//page: 1
			}).then(function(provinceList) {
				$scope.app.provinceList = provinceList;
			});

			TaxonomyService.getMaterialList().then(function(materialList) {
				$scope.app.materialList = materialList;
			});

			TaxonomyService.getDecorationStyleList({
				//page: 1
			}).then(function(decorationStyleList) {
				$scope.app.decorationStyleList = decorationStyleList;
			});

			$scope.currentUser = {};
			/*UserService.getUser(1).then(function(user) {
				$scope.setCurrentUser(user);
			});*/

			AuthService.login({
				username: "test2"
			}).then(function(user) {
				$scope.setCurrentUser(user);
			});

			AuthService.slides().then(function(image) {
				$scope.app.slidesImage = image.slides;
			});

			$scope.userRoles = USER_ROLES;
			$scope.isAuthorized = AuthService.isAuthorized;

			$scope.isBrandAgent = function() {
				return $scope.currentUser.type == 'B';
			};
			$scope.isSalesAgent = function() {
				return $scope.currentUser.type == 'S';
			};
			$scope.isAdmin = function() {
				return $scope.currentUser.type == 'A';
			};
			$scope.isApproved = function() {
				return $scope.currentUser.profile.approval == "A";
			};
			$scope.getApprovalText = function() {
				if ($scope.currentUser.profile.approval == "A") {
					return "已审核通过";
				}
				if ($scope.currentUser.profile.approval == "B") {
					return "待审核";
				}
				if ($scope.currentUser.profile.approval == "C") {
					return "初始状态";
				}
				if ($scope.currentUser.profile.approval == "D") {
					return "未通过审核";
				}
				return "待审核";
			};

			$scope.setCurrentUser = function(user) {
				$scope.currentUser = user;
			};

			var showLoginDialog = function() {
				$state.go('access.signin');
			};

			var showNotAuthorized = function() {
				alert("Not Authorized");
			}

			//listen to events of unsuccessful logins, to run the login dialog
			$rootScope.$on(AUTH_EVENTS.notAuthorized, showNotAuthorized);
			$rootScope.$on(AUTH_EVENTS.notAuthenticated, showLoginDialog);
			$rootScope.$on(AUTH_EVENTS.sessionTimeout, showLoginDialog);
			$rootScope.$on(AUTH_EVENTS.logoutSuccess, showLoginDialog);

			// save settings to local storage
			if (angular.isDefined($localStorage.settings)) {
				$scope.app.settings = $localStorage.settings;
			} else {
				$localStorage.settings = $scope.app.settings;
			}
			$scope.$watch('app.settings', function() {
				if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
					// aside dock and fixed must set the header fixed.
					$scope.app.settings.headerFixed = true;
				}
				// save to local storage
				$localStorage.settings = $scope.app.settings;
			}, true);

			// angular translate
			$scope.lang = {
				isopen: false
			};
			$scope.langs = {
				//en: 'English',
				cn_ZH: '中文'
			};
			$scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "中文";
			$scope.setLang = function(langKey, $event) {
				// set the current lang
				$scope.selectLang = $scope.langs[langKey];
				// You can change the language during runtime
				$translate.use(langKey);
				$scope.lang.isopen = !$scope.lang.isopen;
			};

			function isSmartDevice($window) {
				// Adapted from http://www.detectmobilebrowsers.com
				var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
				// Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
				return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
			}
		}
	]);

	appController.controller('SigninFormController', ['$scope', '$state', '$rootScope', 'AUTH_EVENTS', 'AuthService',
		function($scope, $state, $rootScope, AUTH_EVENTS, AuthService) {
			$scope.authError = null;
			$scope.credentials = {
				username: '',
				password: ''
			};
			$scope.login = function(credentials) {
				AuthService.login(credentials).then(function(user) {
					$scope.setCurrentUser(user);
					$state.go('app.home');
				}, function() {
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
				});
			};
		}
	]);

	appController.controller('SignupFormController', ['$scope', '$http', '$state', '$rootScope', 'AUTH_EVENTS', 'AuthService',
		function($scope, $http, $state, $rootScope, AUTH_EVENTS, AuthService) {
			$scope.authError = null;
			$scope.userInfo = {
				"id": new Date().valueOf(),
				"type": "S",
				"username": "",
				"email": "",
				"password": "",
				"profile": {
					"address": "",
					"phone": "",
					"approval": "B"
				}
			};

			$scope.signup = function(userInfo) {
				AuthService.signup(userInfo).then(function(user) {
					console.log(user);
					$scope.setCurrentUser(user);
					$state.go('app.page.profile');
				}, function() {
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
				});
			};
		}
	]);

	appController.controller('LogoutController', ['$scope', '$state', 'AuthService',
		function($scope, $state, AuthService) {
			$scope.logout = function() {
				AuthService.logout();
				$state.go('access.signin');
			};
		}
	]);

	appController.controller('ProfileController', ['$scope', 'UserService',
		function($scope, UserService) {
			//test apo
			UserService.getUserList().then(function(users) {});

		}
	]);

	appController.controller('HomeController', ['$scope',
		function($scope) {
			$scope.intervals = 2000;
			$scope.slides = [];
			$scope.addSlide = function() {
				for(var i = 0; i < $scope.app.slidesImage.length; i++){
					$scope.slides.push({
						image : $scope.app.slidesImage[i].logo,
							name : $scope.app.slidesImage[i].name
					});
				}
			};

			for (var a = 0; a < 1; a++) {
				$scope.addSlide();
			}
		}
	]);

	appController.controller('CategoryBrandController', ['$scope', '$http',
		function($scope, $http) {
			$scope.categoryResults = [];
			$http.get('js/app/brand/categorybrand.json').success(function(data){
				$scope.categoryResults = data;
			});
		}
	]);

	appController.controller('BrandListController', ['$scope', '$http', '$stateParams',
		function($scope, $http, $stateParams) {
			$scope.brandLists = [];
			var index = $stateParams.id;
			$http.get('js/app/brand/categorybrand.json').success(function(data){
				$scope.brandLists = data[index - 1].brands;
			});
		}
	]);

	appController.controller('ProductListController', ['$scope', '$http', '$stateParams',
		function($scope, $http, $stateParams) {
			$scope.products = [];
			$http.get('js/app/brand/products.json').success(function(data){
				$scope.products = data;
			});
		}
	]);

	appController.controller('PublicationController', ['$scope', 'PublicationService', '$interval', 'BrandService', 'toaster',
		function($scope, PublicationService, $interval, BrandService, toaster) {

			$scope.interval = 4000;
			$scope.publications = PublicationService.getPublications();

			var count = $scope.publications.length;
			$scope.currentPub = $scope.publications[0];

			for(var pub in $scope.publications){
				var brand = BrandService.findBrand($scope.publications[pub].brand);
				$scope.publications[pub].brand_name = brand.name;
				$scope.publications[pub].brand_url = "#app/brand/" + brand.id;
				//$scope.publications[pub].brand_name = currentBrand.name;
				//$scope.publications[pub].brand_url = "#app/brand/" + currentBrand.id;
			}

			var stop = $interval(nextPub, $scope.interval);

			function nextPub(){
				if($scope.currentPub == $scope.publications[count-1]){
					$scope.currentPub = $scope.publications[0];
				}
				else{
					$scope.currentPub =  $scope.publications[$scope.publications.indexOf($scope.currentPub)+1];
				}
			}

			$scope.save = function(brand){
				var today = new Date();
				var month_later = new Date();
				month_later.setMonth(today.getMonth()+1)
				var pub = {
					brand: brand.id,
					text: $scope.pub_text,
					created_at: today,
					valid_to: month_later
				};
				PublicationService.addPublication(pub);
				toaster.pop('success', brand.name, "招商消息已创建");
			}
		}
	]);

})();