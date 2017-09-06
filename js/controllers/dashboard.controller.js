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
        vm.getUserInfo = getUserInfo;

        // FILTERS
        vm.relatedTweets = relatedTweets;
        vm.onlyPositive = (user)  => user.sentiment > 0;
        vm.onlyNegative = (user) => user.sentiment < 0;

        vm.searchedParams = [];
        vm.actualSearch = '';
        vm.userSelected = null;
        vm.data = {};

        var allWordsToFind = [];

        ////////////////

        function search() {
            vm.searchedParams.push(vm.searchParam);
            vm.actualSearch = vm.searchParam;
            allWordsToFind = vm.actualSearch.split(' ');
            vm.searchParam = '';
            vm.makingRequest = TS.search(vm.actualSearch).then(successData, errorHandler);
        }

        function getUserInfo(user) {
            vm.userSelected = user;
            CF.createPercentageChart('user-chart-sentiment', [
                ['Negativos', user.negativePercentage],
                ['Neutrales', user.neutralPercentage],
                ['Positivos', user.positivePercentage]
            ]);
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
            TS.search(vm.actualSearch).then(successData, errorHandler);
        }


        /////////  FILTERS  ////////
        function relatedTweets(tweet)  {
            var flag = true;
            var copyLower = tweet.text.toLowerCase();
            allWordsToFind.forEach((word) => {
                if (copyLower.indexOf(word.toLowerCase()) == -1) flag = false;
            });
            return flag;
        }
        ////////  END FILTERS //////////////

        var errorHandler = (err) => console.log(err);

        function successData(data) {
            vm.data = data;
            createCharts();
            createMap();
        }

        function createMap() {
            var tweetsWithGeo = vm.data.tweets.filter((tweet) => tweet.geolocation.X != 0);
            tweetsWithGeo = tweetsWithGeo.map((tweet) =>
                ({
                    lat: Math.floor(tweet.geolocation.Y),
                    lon: Math.floor(tweet.geolocation.X),
                    z: tweet.sentiment
                })
            );
            MF.createMap('map', tweetsWithGeo);
        }

        function createCharts() {
            CF.createPercentageChart('percentageChart', [
                ['Negativos', vm.data.stats.negativeTweets.length],
                ['Neutrales', vm.data.stats.neutralTweets.length],
                ['Positivos', vm.data.stats.positiveTweets.length]
            ]);
            CF.createTimelineChart('timelineChart', vm.data.timeline);
        }
    }
})();