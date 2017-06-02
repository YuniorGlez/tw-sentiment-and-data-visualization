(function () {
    'use strict';

    angular.module('TFG', ['ngRoute', 'cgBusy', 'vesparny.fancyModal'])
        .config(router);

    router.$inject = ['$routeProvider'];

    function router($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'LoginController',
                controllerAs: 'Login',
                templateUrl: 'views/login.html'
            })
            .when('/home', {
                controller: 'DashboardController',
                controllerAs: 'Board',
                templateUrl: 'views/dashboard.html'
            });
    }

})();