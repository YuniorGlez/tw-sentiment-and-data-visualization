(function() {
'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = [];
    function DashboardController() {
        var vm = this;


        activate();

        ////////////////

        function activate() {
            vm.title = 'Helo world ! ';
        }
    }
})();