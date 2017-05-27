(function() {
'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = [];
    function DashboardController() {
        var vm = this;
        vm.search = search;
        vm.changeSearch = changeSearch;
        vm.searchedParams = [];
        vm.actualSearch = '';
        activate();

        ////////////////

        function activate() {
            vm.title = 'Helo world ! ';
        }


        function search() {
            vm.searchedParams.push(vm.searchParam);
            vm.actualSearch = vm.searchParam;
            vm.searchParam = '';
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
        }
    }
})();