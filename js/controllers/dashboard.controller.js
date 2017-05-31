(function () {
    'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['TwitterSearchEngine', 'ChartsFactory', 'MapsFactory', '$scope'];

    function DashboardController(TS, CF, MF, $scope) {
        var vm = this;
        vm.search = search;
        vm.trick = trick;
        vm.changeSearch = changeSearch;
        vm.onlyPositive = onlyPositive;
        vm.onlyNegative = onlyNegative;
        vm.searchedParams = [];
        vm.actualSearch = '';
        vm.data = {};
        vm.ready = false;
        var simulation = false;

        activate();

        ////////////////

        function activate() {
            vm.optionDataSelected = 'Generales';
            vm.optionMapSelected = 'Sentimiento';
            // if (simulation) search();
        }

        function trick() {
            if (simulation) search();
        }

        function search() {
            vm.searchedParams.push(vm.searchParam);
            vm.actualSearch = vm.searchParam;
            vm.searchParam = '';
            if (simulation) {
                var data = JSON.parse(localStorage.getItem('data'));
                vm.ready = true;
                // setTimeout(() => successData(data),200);
                setTimeout(() => successData(data),200);
            }
            else {
                TS.search(vm.actualSearch)
                    .then(successData, errorHandler);
            }
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
            TS.search(vm.actualSearch)
                .then(successData, errorHandler);
        }

        function onlyNegative(user) {
            return user.sentiment < 0;
        }

        function onlyPositive(user) {
            return user.sentiment > 0;
        }

        function errorHandler(err) {
            console.log(err);
        }

        function successData(data) {
            vm.data = data;
            // $scope.$apply();
            // localStorage.setItem('data', JSON.stringify(data));
            // console.log('data **', data);
            vm.ready = true;
            createCharts(); createMap();
        }

        function createMap() {
            var tweetsWithGeo = vm.data.tweets.filter((tweet) => tweet.geolocation.X != 0);
            tweetsWithGeo = tweetsWithGeo.map((tweet) =>
                ({
                    lat : Math.floor(tweet.geolocation.Y),
                    lon: Math.floor(tweet.geolocation.X),
                    z : tweet.sentiment
                })
            );
            MF.createMap('map', tweetsWithGeo);
        }

        function createCharts() {
            CF.createPercentageChart('percentageChart', [
                        ['Negativos', vm.data.stats.negativePercentage],
                        ['Neutrales', vm.data.stats.neutralPercentage],
                        ['Positivos', vm.data.stats.positivePercentage]
            ]);
            CF.createTimelineChart('timelineChart', vm.data.timeline);
        }
    }
})();