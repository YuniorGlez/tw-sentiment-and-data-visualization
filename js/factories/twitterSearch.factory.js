(function () {
    'use strict';
    angular.module('TFG').factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http', 'TransformService'];
    function TwitterSearchEngine($http, T) {
        var api = 'https://tfg-yuniorglez.c9users.io/';
        var atp = 'access_token_key=';
        var ats = 'access_token_secret=';
        ////////////////

        function search(param) {
            if ('logged' in localStorage && 'tw_object' in localStorage) {
                var tw = JSON.parse(localStorage.getItem('tw_object'));
                var url = api + 'search?q=' + encodeURI(param);
                url += '&' + atp + tw.oauthToken + '&'+  ats + tw.clientSecret;
                return $http.get(url).then(successReadingTweets);
            }
            else $http.get('/data/anotherFake.json').then(successReadingFakeTweets);
        }


        function searchUserInfo(idUser){
            if ('logged' in localStorage && 'tw_object' in localStorage) {
                var tw = JSON.parse(localStorage.getItem('tw_object'));
                var url = api + 'search/user/' + idUser;
                url += '?'+ atp + tw.oauthToken + '&' + ats + tw.clientSecret;
                return $http.get(url).then(successc9Response, (e)=>{console.log(e);return[]});
            }
        }

        function searchTweetsFromUser(idUser){
            if ('logged' in localStorage && 'tw_object' in localStorage) {
                var tw = JSON.parse(localStorage.getItem('tw_object'));
                var url = api + 'search/user/tweets/' + idUser;
                url += '?'+ atp + tw.oauthToken + '&' + ats + tw.clientSecret;
                return $http.get(url).then(successc9Response, (e)=>{console.log(e);return[]});
            }
        }

        function successReadingTweets(response) {
            var data = response.data;
            var tweetsParsed = response.data;
            console.log('Respuesta del server ', response);
            return T.transformProcess(tweetsParsed).then((tweets) => tweets);
        }
        function successReadingFakeTweets(response) {
            successReadingTweets({ data: response.data.map((tw) => JSON.parse(tw)) });
        }

        function successc9Response(response){
            console.log('Respuesta del server ', response);
            return response.data;
        }
        return {
            search: search,
            searchUserInfo : searchUserInfo,
            searchTweetsFromUser : searchTweetsFromUser
        };
    }
})();