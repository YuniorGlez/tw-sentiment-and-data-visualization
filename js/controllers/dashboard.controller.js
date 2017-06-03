(function () {
    'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['TwitterSearchEngine', 'ChartsFactory', 'MapsFactory', '$scope'];

    function DashboardController(TS, CF, MF, $scope) {
        var vm = this;
        vm.search = search;
        vm.changeSearch = changeSearch;
        vm.getUserInfo = getUserInfo;

        // FILTERS
        vm.relatedTweets = relatedTweets;
        vm.onlyPositive = onlyPositive;
        vm.onlyNegative = onlyNegative;

        vm.searchedParams = [];
        vm.actualSearch = '';
        vm.userSelected = null;
        vm.data = {};
        vm.ready = false;

        var allWordsToFind = [];
        activate();

        ////////////////

        function activate() {
            vm.optionDataSelected = 'Generales';
            vm.optionMapSelected = 'Sentimiento';
            // pasd.dasd();
        }

        function search() {
            vm.ready = false;
            vm.searchedParams.push(vm.searchParam);
            vm.actualSearch = vm.searchParam;
            allWordsToFind = vm.actualSearch.split(' ');
            vm.searchParam = '';
            vm.makingRequest = TS.search(vm.actualSearch)
                .then(successData, errorHandler);
        }

        function getUserInfo(idUser) {
            vm.makingRequest = TS.searchUserInfo(idUser)
                .then( (user) => {
                    if (!vm.userSelected)
                        vm.userSelected = user;
                    else
                        angular.extend(vm.userSelected, user);
                });
            TS.searchTweetsFromUser(idUser)
                .then( (tweets) => vm.userSelected.tweets = tweets);
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
            TS.search(vm.actualSearch)
                .then(successData, errorHandler);
        }


        /////////  FILTERS  ////////
        function onlyNegative(user) { return user.sentiment < 0; }
        function onlyPositive(user) { return user.sentiment > 0; }

        function relatedTweets(tweet) {
            var flag = true;
            var copyLower = tweet.text.toLowerCase();
            allWordsToFind.forEach( (word) => {
                if (copyLower.indexOf(word.toLowerCase()) == -1 ) flag = false;
            });
            return flag;
        }
        ////////  END FILTERS //////////////




        function errorHandler(err) {
            console.log(err);
        }

        function successData(data) {
            vm.data = data;
            console.log(data);
            vm.ready = true;
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
                ['Negativos', vm.data.stats.negativePercentage],
                ['Neutrales', vm.data.stats.neutralPercentage],
                ['Positivos', vm.data.stats.positivePercentage]
            ]);
            CF.createTimelineChart('timelineChart', vm.data.timeline);
        }
    }
})();