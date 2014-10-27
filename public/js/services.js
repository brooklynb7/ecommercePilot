'use strict';

/* Services */


// Demonstrate how to register services
angular.module('app.services', [])
	.service('Session', function() {
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
	})
	.factory('AuthService', function($http, Session) {
		var authService = {};

		authService.signup = function(userInfo) {
			return $http
				.get('../api/signup', userInfo)
				.then(function(res) {
					Session.create(res.data.id, res.data.user.id,
						res.data.user.role);
					return res.data.user;
				});
		};

		authService.login = function(credentials) {
			return $http
				.get('../api/login.json', credentials)
				.then(function(res) {
					console.log(res)
					Session.create(res.data.id, res.data.id, res.data.role);
					return res.data;
				});
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
	});