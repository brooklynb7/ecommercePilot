'use strict';

(function() {
	//var service_path = "http://127.0.0.1:8000/rest";
	var service_path = "http://121.40.72.71:8080/rest";
	var getRestApiUrl = function(path) {
		return service_path + path;
	};
	var _setLocalStorage = function(field, json){
		localStorage.setItem(field, JSON.stringify(json));
	};
	var _getLocalStorage = function(field){
		return JSON.parse(localStorage.getItem(field));
	};

	var dataStorage = {
		getUsers: function(){
			return _getLocalStorage("users");
		},
		setUsers: function(usersJson){
			_setLocalStorage("users", usersJson);
		},
		getBrands: function(){
			return _getLocalStorage("brands");	
		},
		setBrands: function(brandsJSON){
			_setLocalStorage("brands", brandsJSON);
		},
		getAgencies: function(){
			return _getLocalStorage("agencies");
		},
		setAgencies: function(agenciesJSON){
			_setLocalStorage("agencies", agenciesJSON);
		}
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
			var SignUpResource = $resource(getRestApiUrl('/user/register/'), {}, {
				signup: {
					method: 'POST',
					params: {}
				}
			});
			var SignInResource = $resource(getRestApiUrl('/user/login/'), {}, {
				login: {
					method: 'POST',
					params: {}
				}
			});

			var authService = {};

			authService.signup = function(userInfo) {
				return SignUpResource.signup(userInfo).$promise.then(function(res) {
					var users = dataStorage.getUsers();
					users.push(userInfo);
					dataStorage.setUsers(users);
					//Session.create(userInfo.id, userInfo.id, userInfo.type);
					return userInfo;
				});
			};

			authService.login = function(credentials) {
				return Mock_SignInRsc.query(credentials).$promise.then(function(res) {
					var rst = {};
					if (credentials.username == 'test1') {
						rst = res[0];
					}
					if (credentials.username == 'test2') {
						rst = res[1];
					}
					if (credentials.username == 'test3') {
						rst = res[2];
					}
					if (credentials.username == 'test4') {
						rst = res[3];
					}
					if (credentials.username == 'admin') {
						rst = res[4];
					}
					Session.create(rst.id, rst.id, rst.type);
					return rst;
				});

				/*	remote
					return SignInResource.login(credentials).$promise.then(function(res) {
						Session.create(res.url, res.url, res.type);
					return res;
				});
				*/
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
			var Mock_UserResource = $resource('api/login.json');

			var userService = {};

			userService.loadUsers = function(){
				if(!dataStorage.getUsers()){
					Mock_UserResource.query().$promise.then(function(res) {
						dataStorage.setUsers(res);
					});
				}
			};

			userService.getUserList = function() {
				return UserResource.get().$promise.then(function(res) {
					return dataStorage.getUsers();
					//return res.results;
				});
			};

			userService.getUser = function(id) {
				return UserResource.get({
					id: id
				}).$promise.then(function(res) {
					return res;
				});
			};

			userService.getToBeApprovedUsers = function(){
				return UserResource.get().$promise.then(function(res) {
					var users = dataStorage.getUsers();
					return _.filter(users, function(user){
						return user.profile && user.profile.approval == "B";
					});
				});
			};

			return userService;
		}
	]);

	appService.factory('BrandService', ['$resource',
		function($resource) {
			var BrandResource = $resource(getRestApiUrl('/brand/:id', {
				id: "@id"
			}));
			var BrandFactoryResource = $resource(getRestApiUrl('/brand-factory'));

			var Mock_BrandResource = $resource('js/app/brand/brand.json');

			var brandService = {};

			brandService.loadBrands = function(){
				if(!dataStorage.getBrands()){
					Mock_BrandResource.get().$promise.then(function(res) {
						dataStorage.setBrands(res.items);
					});
				}
			};

			brandService.getBrandList = function() {
				return Mock_BrandResource.get().$promise.then(function(res) {
					return dataStorage.getBrands();
					//return res.items;
				});
			};
			brandService.getBrand = function(brandId) {
				return Mock_BrandResource.get().$promise.then(function(res) {
					var brands = dataStorage.getBrands();
					return _.find(brands, function(brand){
						return brand.id == brandId;
					});
				});
			};

			brandService.createBrand = function(brand) {
				var brands = dataStorage.getBrands();
				var newBrand = {};
				jQuery.extend(true, newBrand, brand);
				delete newBrand['selected'];
				delete newBrand['editing'];
				delete newBrand['$$hashKey'];
				brands.push(newBrand);
				dataStorage.setBrands(brands);
			};

			brandService.updateBrand = function(updatedBrand) {
				var brands = dataStorage.getBrands();
				for(var i in brands){
					if(brands[i].id == updatedBrand.id){
						delete updatedBrand['selected'];
						delete updatedBrand['editing'];
						delete updatedBrand['$$hashKey'];
						jQuery.extend(true, brands[i], updatedBrand);
						break;
					}
				}
				dataStorage.setBrands(brands);
			};

			brandService.deleteBrand = function(deletedBrand){
				var brands = dataStorage.getBrands();
				for(var j in brands){
					if(brands[j].id == deletedBrand.id){
						brands.splice(j, 1);
						dataStorage.setBrands(brands);
						break;
					}
				}
			};

			return brandService;
		}
	]);

	appService.factory('AgencyService', ['$resource',
		function($resource) {
			var Mock_AgencyResource = $resource('js/app/agency/agency.json');
			var agencyService = {};

			agencyService.loadAgencies = function(){
				if(!dataStorage.getAgencies()){
					Mock_AgencyResource.get().$promise.then(function(res) {
						dataStorage.setAgencies(res.items);
					});
				}
			};

			agencyService.getAgencyList = function(){
				return Mock_AgencyResource.get().$promise.then(function(res) {
					return dataStorage.getAgencies();
				});
			};

			agencyService.getAgency = function(agencyId) {
				return Mock_AgencyResource.get().$promise.then(function(res) {
					var agencies = dataStorage.getAgencies();
					return _.find(agencies, function(agency){
						return agency.id == agencyId;
					});
				});
			};

			agencyService.addComment = function(agencyId, commentJSON){
				var agencies = dataStorage.getAgencies();
				var agency = _.find(agencies, function(agency){
					return agency.id == agencyId;
				});
				if(!agency.comment){
					agency.comment = [];
				}
				agency.comment.push(commentJSON);
				dataStorage.setAgencies(agencies);
				return commentJSON;
			};

			return agencyService;
		}
	]);

	appService.factory('TaxonomyService', ['$resource',
		function($resource) {
			var CategoryResource = $resource(getRestApiUrl('/category/?root=:root'), {
				root: '@root'
			});
			var ProvinceResource = $resource(getRestApiUrl('/province/?page=:page'), {
				page: '@page'
			});
			var MaterialResource = $resource(getRestApiUrl('/material-type/'));
			var DecorationStyleResource = $resource(getRestApiUrl('/decoration-style/?page=:page'), {
				page: '@page'
			});

			var taxonomyService = {};

			taxonomyService.getCategoryList = function(queries) {
				return CategoryResource.get(queries).$promise.then(function(res) {
					return res.results;
				});
			};

			taxonomyService.getProvinceList = function(queries) {
				return ProvinceResource.get(queries).$promise.then(function(res) {
					return res.results;
				});
			};

			taxonomyService.getMaterialList = function(queries) {
				return MaterialResource.get(queries).$promise.then(function(res) {
					return res.results;
				});
			};

			taxonomyService.getDecorationStyleList = function(queries) {
				return DecorationStyleResource.get(queries).$promise.then(function(res) {
					return res.results;
				});
			};

			return taxonomyService;
		}
	]);
})();