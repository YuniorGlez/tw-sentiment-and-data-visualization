(function () {
    'use strict';
    angular.module('TFG').factory('TwitterSearchEngine', TwitterSearchEngine);

    TwitterSearchEngine.$inject = ['$http', 'TransformService', 'TweetModel'];
    function TwitterSearchEngine($http, T, TweetModel) {
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
                return $http.get(url).then(successc9TweetsResponse, (e)=>{console.log(e);return[]});
            }
        }
        function roughSizeOfObject( object ) {

            var objectList = [];
            var stack = [ object ];
            var bytes = 0;

            while ( stack.length ) {
                var value = stack.pop();

                if ( typeof value === 'boolean' ) {
                    bytes += 4;
                }
                else if ( typeof value === 'string' ) {
                    bytes += value.length * 2;
                }
                else if ( typeof value === 'number' ) {
                    bytes += 8;
                }
                else if
                (
                    typeof value === 'object'
                    && objectList.indexOf( value ) === -1
                )
                {
                    objectList.push( value );

                    for( var i in value ) {
                        stack.push( value[ i ] );
                    }
                }
            }
            return bytes;
        }

        function successReadingTweets(response) {
            var data = response.data;
            var tweetsParsed = response.data;
            tweetsParsed  = tweetsParsed.map((tw) => new TweetModel.Tweet(tw));
            return T.transformProcess(tweetsParsed).then((tweets) => tweets);
        }
        function successReadingFakeTweets(response) {
            successReadingTweets({ data: response.data.map((tw) => JSON.parse(tw)) });
        }

        function successc9Response(response){
            console.log('Respuesta del server ', response);
            return response.data;
        }

        function successc9TweetsResponse(response){
            console.log('Respuesta del server ', response);
            var tweets = response.data.map((tweet) => new TweetModel.Tweet(tweet));
            return tweets;
        }
        return {
            search: search,
            searchUserInfo : searchUserInfo,
            searchTweetsFromUser : searchTweetsFromUser
        };
    }
})();