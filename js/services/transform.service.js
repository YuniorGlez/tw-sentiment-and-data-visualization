(function() {
'use strict';

    angular
        .module('TFG')
        .service('TransformService', TransformService);

    TransformService.$inject = ['SentimentAnalysis'];
    function TransformService(S) {
        this.getUsersData = getUsersData;
        this.getStats = getStats;
        this.transformProcess = transformProcess;

        ////////////////

        function getUsersData(tweets) {
            return [];
        }

        function getStats(tweets) {
            var onlyPositive = (tweets.filter((tweet) => tweet.sentiment > 0));
            var onlyNegative = (tweets.filter((tweet) => tweet.sentiment < 0));
            var onlyNeutral = (tweets.filter((tweet) => tweet.sentiment == 0));
            var geoActivated = (tweets.filter((tweet) => tweet.geo != null));
            console.log('Tweets **', tweets);
            return {
                num: tweets.length,
                positivePercentage : Math.round( onlyPositive.length / tweets.length * 10000)/100,
                negativePercentage : Math.round( onlyNegative.length / tweets.length * 10000)/100,
                neutralPercentage : Math.round( onlyNeutral.length / tweets.length * 10000)/100,
                geoPercentage : Math.round( geoActivated.length / tweets.length * 10000)/100
            };
        }

        function addSentimentData(tweets) {
            return S.evaluateTweets(tweets)
                .then((tweetsEvaluated) =>
                    ({
                        tweets: tweetsEvaluated,
                        users: getUsersData(tweetsEvaluated),
                        stats: getStats(tweetsEvaluated)
                    }),
                (err) => { console.log(err);return [] })
        }

        function transformProcess(tweets) {
            return addSentimentData(tweets);
         }


    }


})();