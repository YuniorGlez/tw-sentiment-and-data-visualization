(function() {
    'use strict';

    angular.module('TFG', ['ngRoute'])
        .config(router);

    router.$inject = ['$routeProvider'];
    function router($routeProvider) {
        $routeProvider.when('/', {
            controller: 'DashboardController',
            controllerAs: 'Board',
            templateUrl: '/views/dashboard.html'
        });
    }

})();