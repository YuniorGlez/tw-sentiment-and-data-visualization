(function () {
    'use strict';

    angular.module('TFG', ['ngRoute'])
        .config(router)
        .constant('TWSecret', 'xsuboKctmcbYGB52h6cpyjO4KhhqoLOee3tkX2m1dY2LcCRnu4')
        .constant('TWPublic', 'zubZEDS6AG4yrQoDFPZx8ZBjp')
        .constant('TWToken', '247017729-nGAWynqDVPfnlgJ0HNCVGKWuOQ0dnQWj0tP2TWzt')
        .constant('TWID', '247017729');
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