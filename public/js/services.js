'use strict';
/* Services */
// Demonstrate how to register services
(function() {
	var service_path = "http://121.40.72.71:8080/rest";
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
			var Mock_SignUpRsc = $resource('api/signup.json');
			var Mock_SignInRsc = $resource('api/login.json');

			var authService = {};

			authService.signup = function(userInfo) {
				return Mock_SignUpRsc.get().$promise.then(function(res) {
					Session.create(res.user.id, res.user.id, res.user.role);
					return res.user;
				});
			};

			authService.login = function(credentials) {
				return Mock_SignInRsc.get().$promise.then(function(res) {
					Session.create(res.id, res.id, res.type);
					return res;
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
			var BrandResource = $resource(getRestApiUrl('/brand'));
			var BrandFactoryResource = $resource(getRestApiUrl('/brand-factory'));

			var Mock_BrandResource = $resource('js/app/brand/brand.json');

			var brandService = {};

			brandService.getBrandList = function(){
				return Mock_BrandResource.get().$promise.then(function(res){
					return res.items;
				});
			};
			brandService.createBrand = function(){};
			brandService.updateBrand = function(){};

			return brandService;
		}
	]);

})();