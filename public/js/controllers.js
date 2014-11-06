'use strict';

(function() {

	var appController = angular.module('app.controllers', ['pascalprecht.translate', 'ngCookies']);

	appController.controller('AppCtrl', ['$scope', '$rootScope', '$state', '$translate', '$localStorage', '$window', 'USER_ROLES', 'UserService', 'AuthService', 'AUTH_EVENTS', 'TaxonomyService',
		function($scope, $rootScope, $state, $translate, $localStorage, $window, USER_ROLES, UserService, AuthService, AUTH_EVENTS, TaxonomyService) {
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
				decorationStyleList: []
			};

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
					$state.go('app.page.profile');
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
				"password": ""
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
})();