(function() {
'use strict';

    angular
        .module('TFG')
        .factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http', 'TransformService'];
    function TwitterSearchEngine($http, T) {


        ////////////////


        function search(param) {
            return $http.get('/data/tweetsFakes.json')
                .then((response) =>
                    T.transformProcess(response.data.map(
                        (tweet) => JSON.parse(tweet)
                    ))
                    .then((tweets) => tweets)
                );
        }

        return {
            search:search
        };
    }
})();