(function() {
'use strict';

    angular
        .module('TFG')
        .factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http'];
    function TwitterSearchEngine($http) {
        return {
            search:search
        };

        ////////////////
        function search(param) {
            console.log(`Let's go to search ${param} `);
            return $http.get()
                .then(  (data) => data,
                        (e) => e);
        }
    }
})();