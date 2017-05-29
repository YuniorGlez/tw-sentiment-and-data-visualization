(function () {
    'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['TwitterSearchEngine', 'ChartsFactory', 'MapsFactory'];

    function DashboardController(TS, CF, MF) {
        var vm = this;
        vm.search = search;
        vm.changeSearch = changeSearch;
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
            if (simulation) setTimeout(search,1500);
        }


        function search() {
            // vm.searchedParams.push(vm.searchParam);
            // vm.actualSearch = vm.searchParam;
            // vm.searchParam = '';
            if (simulation) {
                var data = JSON.parse(localStorage.getItem('data'));
                successData(data);
            }
            else {
                TS.search(vm.actualSearch)
                    .then(successData,
                        errorHandler);

            }
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
        }

        function errorHandler(err) {
            console.log(err);
        }

        function successData(data) {
            vm.data = data;
            localStorage.setItem('data', JSON.stringify(data));
            console.log('data **', data);
            vm.ready = true;
            createCharts();
            createMap();
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
            console.log(vm.data.timeline)
            CF.createTimelineChart('timelineChart', vm.data.timeline);
        }
    }
})();