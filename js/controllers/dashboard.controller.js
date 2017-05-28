(function() {
'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['TwitterSearchEngine'];
    function DashboardController(TS) {
        var vm = this;
        vm.search = search;
        vm.changeSearch = changeSearch;
        vm.searchedParams = [];
        vm.actualSearch = '';
        vm.data = {};
        activate();

        ////////////////

        function activate() {
            vm.title = 'Helo world ! ';
            vm.optionDataSelected = 'Generales';
        }


        function search() {
            vm.searchedParams.push(vm.searchParam);
            vm.actualSearch = vm.searchParam;
            vm.searchParam = '';
            TS.search(vm.actualSearch)
                .then((data) => vm.data = data,
                      errorHandler);
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
        }
        function errorHandler(err) {
            console.log(err);
        }
    }
})();