'use strict';
/* Services */
// Demonstrate how to register services
(function() {
	var service_path = "http://127.0.0.1:8000/rest";
	var getRestApiUrl = function(path) {
		return service_path + path;
	};

	var appService = angular.module('app.services', ['ngResource']);

	appService.service('Session', function() {
		this.create = function(sessionId, userId, userRole) {
			this.id = sessionId;
			this.userId = userId;
			this.userRole = userRole;
		};
		this.destroy = function() {
			this.id = null;
			this.userId = null;
			this.userRole = null;
		};
		return this;
	});

	appService.factory('AuthService', ['$resource', 'Session',
		function($resource, Session) {
			var SignUpResource = $resource(getRestApiUrl('/user/register/'), {},
				{signup: {method:'POST', params:{}}}
			);
			var SignInResource = $resource(getRestApiUrl('/user/login/'), {},
				{login: {method:'POST', params:{}}}
			);

			var authService = {};

			authService.signup = function(userInfo) {
				return SignUpResource.signup(userInfo).$promise.then(function(res) {
					//Session.create(userInfo.id, userInfo.id, userInfo.type);
					return userInfo;
				});
			};

			authService.login = function(credentials) {
				return SignInResource.login(credentials).$promise.then(function(res) {
					console.log("Service : " + credentials);
					var rst = {};
					if (credentials.name == 'test1') {
						rst = res[0];
					}
					if (credentials.name == 'test2') {
						rst = res[1];
					}
					if (credentials.name == 'test3') {
						rst = res[2];
					}
					if (credentials.name == 'test4') {
						rst = res[3];
					}
					if (credentials.name == 'admin') {
						rst = res[4];
					}
					Session.create(rst.id, rst.id, rst.type);
					return rst;
				});
			};

			authService.logout = function() {
				Session.destroy();
			};

			authService.isAuthenticated = function() {
				return !!Session.userId;
			};

			authService.isAuthorized = function(authorizedRoles) {
				if (!angular.isArray(authorizedRoles)) {
					authorizedRoles = [authorizedRoles];
				}
				return (authService.isAuthenticated() &&
					authorizedRoles.indexOf(Session.userRole) !== -1);
			};

			return authService;
		}
	]);

	appService.factory('UserService', ['$resource',
		function($resource) {
			var UserResource = $resource(getRestApiUrl('/user/:id'));

			var userService = {};

			userService.getUserList = function() {
				return UserResource.get().$promise.then(function(res) {
					return res.results;
				});
			};

			userService.getUser = function(id) {
				return UserResource.get({
					id: id
				}).$promise.then(function(res) {
					return res;
				});
			};

			return userService;
		}
	]);

	appService.factory('BrandService', ['$resource',
		function($resource) {
			var BrandResource = $resource(getRestApiUrl('/brand/:id',{id:"@id"}));
			var BrandFactoryResource = $resource(getRestApiUrl('/brand-factory'));

			var Mock_BrandResource = $resource('js/app/brand/brand.json');

			var brandService = {};

			brandService.getBrandList = function() {
				return Mock_BrandResource.get().$promise.then(function(res) {
					return res.items;
				});
			};
			brandService.getBrand = function(brandId){
				return Mock_BrandResource.get().$promise.then(function(res) {
					if(brandId == 1){
						return res.items[0];
					} else {
						return res.items[1];
					}
				});
			}


				/*
					return BrandResource.get({
						id: brandId
					}).$promise.then(function(res) {
						return res;
					});
				*/

			brandService.createBrand = function() {};
			brandService.updateBrand = function() {};

			return brandService;
		}
	]);

	appService.factory('TaxonomyService', ['$resource',
		function($resource) {
			var CategoryResource = $resource(getRestApiUrl('/category/?root=:root'),{root:'@root'});
			var ProvinceResource = $resource(getRestApiUrl('/province/?page=:page'),{page:'@page'});
			var MaterialResource = $resource(getRestApiUrl('/material-type/'));
			var DecorationStyleResource = $resource(getRestApiUrl('/decoration-style/?page=:page'), {page:'@page'});

			var taxonomyService = {};

			taxonomyService.getCategoryList = function(queries){
				return CategoryResource.get(queries).$promise.then(function(res){
					return res.results;
				});
			};

			taxonomyService.getProvinceList = function(queries){
				return ProvinceResource.get(queries).$promise.then(function(res){
					return res.results;
				});
			};

			taxonomyService.getMaterialList = function(queries){
				return MaterialResource.get(queries).$promise.then(function(res){
					return res.results;
				});
			};

			taxonomyService.getDecorationStyleList = function(queries){
				return DecorationStyleResource.get(queries).$promise.then(function(res){
					return res.results;
				});
			};

			return taxonomyService;
		}
	]);

})();