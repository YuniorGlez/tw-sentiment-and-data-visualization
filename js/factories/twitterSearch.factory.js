(function() {
'use strict';

    angular
        .module('TFG')
        .factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http'];
    function TwitterSearchEngine($http ) {


        ////////////////


        function search(param) {
            return $http.get('/data/tweetsFakes.json')
                .then((response) => response.data.map((tweet) => JSON.parse(tweet)));
        }

        return {
            search:search
        };
    }
})();