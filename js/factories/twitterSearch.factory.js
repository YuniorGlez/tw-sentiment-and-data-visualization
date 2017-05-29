(function () {
    'use strict';

    angular
        .module('TFG')
        .factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http', 'TransformService'];

    function TwitterSearchEngine($http, T) {


        ////////////////


        function search(param) {
            return $http.get('/data/anotherFake.json')
                .then(successReadingTweets, errorHandler);
        }

        function successReadingTweets(response) {
            var tweetsParsed = response.data.map((tweet) => JSON.parse(tweet));
            return T.transformProcess(tweetsParsed)
                .then((tweets) => tweets);
        }

        function errorHandler(err) {
            console.log(err);
            return [];
        }

        return {
            search: search
        };
    }
})();