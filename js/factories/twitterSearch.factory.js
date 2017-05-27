(function() {
'use strict';

    angular
        .module('TFG')
        .factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http' , 'TWSecret', 'TWPublic'];
    function TwitterSearchEngine($http , TWSecret, TWPublic) {
        var consumerKey = encodeURIComponent(TWPublic);
        var consumerSecret = encodeURIComponent(TWSecret);

        var credentials = btoa(consumerKey + ':' + consumerSecret);
        console.log(credentials);
        // Twitters OAuth service endpoint
        $http.post(
            'https://api.twitter.com/oauth2/token',
            // "grant_type=client_credentials",
            {
                    'grant_type' : 'client_credentials'
            } ,{
                headers: {
                    'Authorization': 'Basic ' + credentials,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                }
            })
            .then((response) => console.log(response)
                , (response) => console.log("error ", response)
            )


        ////////////////


        function search(param) {
            console.log(`Let's go to search ${param} `);
            return TW.searchTweets(param)
                .then((data) => {
                    console.log('Inside factory ', data);
                    return data
                })
                .catch((err) => err);
        }

        return {
            search:search
        };
    }
})();