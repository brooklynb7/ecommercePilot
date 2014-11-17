'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('app', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngStorage',
		'ui.router',
		'ui.bootstrap',
		'ui.load',
		'ui.jq',
		'ui.validate',
		'oc.lazyLoad',
		'pascalprecht.translate',
		'app.filters',
		'app.services',
		'app.directives',
		'app.controllers'
	])
	.run(
		['$rootScope', '$state', '$stateParams', '$location', 'AuthService', 'AUTH_EVENTS',
			function($rootScope, $state, $stateParams, $location, AuthService, AUTH_EVENTS) {
				$rootScope.$state = $state;
				$rootScope.$stateParams = $stateParams;
				//Config login module
				$rootScope.$on('$stateChangeStart', function(e, nextState, currentState) {
					/*var authorizedRoles = nextState.data ? nextState.data.authorizedRoles : null;
					if (!AuthService.isAuthorized(authorizedRoles)) {
						if (AuthService.isAuthenticated()) {
							// user is not allowed
							//e.preventDefault();
							//$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
						} else {
							// user is not logged in
							if (nextState.name.indexOf('access') != 0) {
								e.preventDefault();
								$state.go('access.signin');
								//$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
							}
						}
					}*/
				});
			}
		]
	)
	.config(
		['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
			function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
				// lazy controller, directive and service
				app.controller = $controllerProvider.register;
				app.directive = $compileProvider.directive;
				app.filter = $filterProvider.register;
				app.factory = $provide.factory;
				app.service = $provide.service;
				app.constant = $provide.constant;
				app.value = $provide.value;


				$urlRouterProvider
					.otherwise('/app/home');
				$stateProvider
					.state('app', {
						abstract: true,
						url: '/app',
						templateUrl: 'tpl/app.html'
					})
					.state('app.home', {
						url: '/home',
						templateUrl: 'tpl/home.html'
					})
					.state('app.home.brand', {
						url: '/brand/{id:[0-9]{1,9}}',
						templateUrl: 'tpl/brand_list.html'
					})
					.state('app.mall', {
						url: '/mall',
						templateUrl: 'tpl/mall.html'
					})
					.state('app.agency', {
						url: '/agency',
						templateUrl: 'tpl/agency.html',
						// use resolve to load other dependences
						resolve: {
							deps: ['uiLoad',
								function(uiLoad) {
									return uiLoad.load(['js/app/agency/agency.js']);
								}
							]
						}
					})
					.state('app.agency.detail', {
						url:'/{agencyId:[0-9]{1,9}}',
						templateUrl: 'tpl/agency_detail.html'
					})
					.state('app.agency.workCenter', {
						url: '/workcenter',
						templateUrl: 'tpl/agency_work_center.html'
					})
					.state('app.brand', {
						url: '/brand',
						templateUrl: 'tpl/brand.html',
						resolve: {
							deps: ['uiLoad',
								function(uiLoad) {
									return uiLoad.load(['js/app/brand/brand.js']);
								}
							]
						}
					})
					.state('app.brand.create', {
						url: '/create',
						templateUrl: 'tpl/brand_create.html'
					})
					.state('app.brand.manage', {
						url: '/manage',
						templateUrl: 'tpl/brand_manage.html'
					})
					.state('app.brand.profile', {
						url: '/profile',
						templateUrl: 'tpl/brand_profile.html'
					})
					.state('app.brand.search', {
						url: '/search',
						templateUrl: 'tpl/brand_search.html'
					})
					.state('app.brand.list', {
						url: '/list',
						templateUrl: 'tpl/brand_list.html'
					})
					.state('app.brand.detail', {
						url: '/{brandId:[0-9]{1,9}}',
						templateUrl: 'tpl/brand_detail.html'
					})
					.state('app.brand.expandCity', {
						url: '/expand/city',
						templateUrl: 'tpl/brand_expand_city.html'
					})
					.state('app.brand.sellingCity', {
						url: '/selling/city',
						templateUrl: 'tpl/brand_selling_city.html'
					})
					.state('app.brand.productSeries', {
						url: '/product/series',
						templateUrl: 'tpl/brand_product_series.html'
					})
					.state('app.brand.workCenter', {
						url: '/workcenter',
						templateUrl: 'tpl/brand_work_center.html'
					})
					.state('app.system', {
						url: '/system',
						template: '<div ui-view class="fade-in-down"></div>'
					})
					.state('app.system.price', {
						url: '/price',
						templateUrl: 'tpl/page_price.html'
					})
					.state('app.page', {
						url: '/page',
						template: '<div ui-view class="fade-in-down"></div>'
					})
					.state('app.page.profile', {
						url: '/profile',
						templateUrl: 'tpl/page_profile.html'
					})
					.state('app.admin', {
						url: '/admin',
						template: '<div ui-view class="fade-in-down"></div>',
						resolve: {
							deps: ['uiLoad',
								function(uiLoad) {
									return uiLoad.load(['js/app/admin/admin.js']);
								}
							]
						}
					})
					.state('app.admin.checkUser', {
						url: '/user/check',
						templateUrl: 'tpl/admin_check_user.html'
					})
					.state('access', {
						url: '/access',
						template: '<div ui-view class="fade-in-right-big smooth"></div>'
					})
					.state('access.signin', {
						url: '/signin',
						templateUrl: 'tpl/page_signin.html'
					})
					.state('access.signup', {
						url: '/signup',
						templateUrl: 'tpl/page_signup.html'
					})
					.state('access.forgotpwd', {
						url: '/forgotpwd',
						templateUrl: 'tpl/page_forgotpwd.html'
					})
					.state('access.404', {
						url: '/404',
						templateUrl: 'tpl/page_404.html'
					})
			}
		])
		.config(function($resourceProvider) {
			$resourceProvider.defaults.stripTrailingSlashes = false;
		})
		.config(['$translateProvider', function($translateProvider) {
			// Register a loader for the static files
			// So, the module will search missing translation tables under the specified urls.
			// Those urls are [prefix][langKey][suffix].
			$translateProvider.useStaticFilesLoader({
				prefix: 'l10n/',
				suffix: '.js'
			});

			// Tell the module what language to use by default
			$translateProvider.preferredLanguage('cn_ZH');

			// Tell the module to store the language in the local storage
			$translateProvider.useLocalStorage();

		}
	])
	.constant('JQ_CONFIG', {
		easyPieChart: ['js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
		sparkline: ['js/jquery/charts/sparkline/jquery.sparkline.min.js'],
		plot: ['js/jquery/charts/flot/jquery.flot.min.js',
			'js/jquery/charts/flot/jquery.flot.resize.js',
			'js/jquery/charts/flot/jquery.flot.tooltip.min.js',
			'js/jquery/charts/flot/jquery.flot.spline.js',
			'js/jquery/charts/flot/jquery.flot.orderBars.js',
			'js/jquery/charts/flot/jquery.flot.pie.min.js'
		],
		slimScroll: ['js/jquery/slimscroll/jquery.slimscroll.min.js'],
		sortable: ['js/jquery/sortable/jquery.sortable.js'],
		nestable: ['js/jquery/nestable/jquery.nestable.js',
			'js/jquery/nestable/nestable.css'
		],
		filestyle: ['js/jquery/file/bootstrap-filestyle.min.js'],
		slider: ['js/jquery/slider/bootstrap-slider.js',
			'js/jquery/slider/slider.css'
		],
		chosen: ['js/jquery/chosen/chosen.jquery.min.js',
			'js/jquery/chosen/chosen.css'
		],
		TouchSpin: ['js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
			'js/jquery/spinner/jquery.bootstrap-touchspin.css'
		],
		wysiwyg: ['js/jquery/wysiwyg/bootstrap-wysiwyg.js',
			'js/jquery/wysiwyg/jquery.hotkeys.js'
		],
		dataTable: ['js/jquery/datatables/jquery.dataTables.min.js',
			'js/jquery/datatables/dataTables.bootstrap.js',
			'js/jquery/datatables/dataTables.bootstrap.css'
		],
		vectorMap: ['js/jquery/jvectormap/jquery-jvectormap.min.js',
			'js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
			'js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
			'js/jquery/jvectormap/jquery-jvectormap.css'
		],
		footable: ['js/jquery/footable/footable.all.min.js',
			'js/jquery/footable/footable.core.css'
		]
	})
	.constant('MODULE_CONFIG', {
		select2: ['js/jquery/select2/select2.css',
			'js/jquery/select2/select2-bootstrap.css',
			'js/jquery/select2/select2.min.js',
			'js/modules/ui-select2.js'
		]
	})
	.config(['$ocLazyLoadProvider',
		function($ocLazyLoadProvider) {
			// We configure ocLazyLoad to use the lib script.js as the async loader
			$ocLazyLoadProvider.config({
				debug: false,
				events: true,
				modules: [{
					name: 'ngGrid',
					files: [
						'js/modules/ng-grid/ng-grid.min.js',
						'js/modules/ng-grid/ng-grid.css',
						'js/modules/ng-grid/theme.css'
					]
				}, {
					name: 'toaster',
					files: [
						'js/modules/toaster/toaster.js',
						'js/modules/toaster/toaster.css'
					]
				}]
			});
		}
	])
	.constant('USER_ROLES', {
		all: '*',
		admin: 'admin',
		brand: 'brand',
		agency: 'agency',
		mall: 'mall'
	}).constant('AUTH_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized'
	});
