var app = angular.module('chirpApp', [ 'ui.router', 'ngResource', 'ngMaterial' ]).run(function($rootScope, $http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';

	$rootScope.signout = function() {
		$http.get('auth/signout');
		$rootScope.authenticated = false;
		$rootScope.current_user = '';
	};
});

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider) {
	$stateProvider.state('main', {
		url : '/',
		templateUrl : 'main.html',
		controller : 'mainController'
	}).state('login', {
		url : '/login',
		templateUrl : 'login.html',
		controller : 'authController'
	}).state('register', {
		url : '/register',
		templateUrl : 'register.html',
		controller : 'authController'
	});
	$urlRouterProvider.otherwise('/login');
	$mdThemingProvider.theme('default').primaryPalette('deep-orange').accentPalette('grey');
});

app.factory('postService', function($resource) {
	return $resource('/api/posts/:id');
});

app.controller('mainController', function(postService, $scope, $rootScope) {
	$scope.posts = postService.query();
	$scope.newPost = {
		created_by : '',
		text : '',
		created_at : ''
	};

	$scope.post = function() {
		$scope.newPost.created_by = $rootScope.current_user;
		$scope.newPost.created_at = Date.now();
		postService.save($scope.newPost, function() {
			$scope.posts = postService.query();
			$scope.newPost = {
				created_by : '',
				text : '',
				created_at : ''
			};
		});
	};
});

app.controller('authController', function($scope, $http, $rootScope, $state) {
	$scope.user = {
		username : '',
		password : ''
	};
	$scope.error_message = '';

	$scope.login = function() {
		$http({
			method : "POST",
			url : '/auth/login',
			headers : {
				"Content-Type" : "application/json"
			},
			data : $scope.user
		}).then(function(res) {
			var data = res.data;
			if (data.state == 'success') {
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user.username;
				$state.transitionTo('main');
			} else {
				$scope.error_message = data.message;
			}
		}, function(errorRes) {
			console.log("Error");
		});
	};

	$scope.register = function() {
		$http.post('/auth/signup', $scope.user).success(function(data) {
			if (data.state == 'success') {
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user.username;
				$location.path('/');
			} else {
				$scope.error_message = data.message;
			}
		});
	};
});