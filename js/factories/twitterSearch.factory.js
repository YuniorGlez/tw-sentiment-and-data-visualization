(function () {
    'use strict';

    angular
        .module('TFG')
        .factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http', 'TransformService'];

    function TwitterSearchEngine($http, T) {
        var api = 'https://tfg-yuniorglez.c9users.io/';
        var atp = '&access_token_key=';
        var ats = '&access_token_secret=';
        ////////////////

        function search(param) {
            if ('logged' in localStorage && 'tw_object' in localStorage) {
                var tw = JSON.parse(localStorage.getItem('tw_object'));
                var url = api + 'search?q=' + encodeURI(param);
                url += atp + tw.oauthToken + ats + tw.clientSecret;
                return $http.get(url)
                    .then(successReadingTweets, errorHandler);
            }

            // return $http.get('/data/anotherFake.json')
            //     .then(successReadingTweets, errorHandler);
        }

        function successReadingTweets(response) {
            var data = response.data;
            var tweetsParsed = response.data;
            // var tweetsParsed = response.data.map((tw) => JSON.parse(tw));
            console.log('Respuesta del server ', response);
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