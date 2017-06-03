(function () {
    'use strict';
    angular.module('TFG').service('TransformService', TransformService);

    TransformService.$inject = ['SentimentAnalysis'];

    function TransformService(S) {
        this.transformProcess = transformProcess;
        ////////////////

        function transformProcess(tweets) {
            return addSentimentData(tweets);
        }

        function addSentimentData(tweets) {
            return S.evaluateTweets(tweets)
                .then((tweetsEvaluated) =>
                    ({
                        tweets: applyBestGeoToTweets(tweetsEvaluated),
                        users: getUsersData(tweetsEvaluated),
                        stats: getStats(tweetsEvaluated),
                        timeline: groupTweetsByDays(tweetsEvaluated)
                    }));
        }

        function applyBestGeoToTweets(tweets) {
            return tweets.map((tweet) => angular.extend(tweet, {geolocation: calculateBestGeoPosition(tweet)}));
        }

        function calculateBestGeoPosition(tweet) {
            var geo = {X: 0, Y: 0};
            if (tweet.coordinates) {
                geo.X = tweet.coordinates.coordinates[0];
                geo.Y = tweet.coordinates.coordinates[1];
            }
            if (tweet.place != null) geo.place = tweet.place;
            if (tweet.place == null && tweet.user.location != null) geo.location = tweet.user.location;
            if (tweet.place == null && tweet.user.location == null && tweet.user.time_zone != null) geo.time_zone = tweet.user.time_zone;
            return geo;
        }

        function getUsersData(tweets) {
            var groupedByUsername = _.groupBy(tweets, (tw) => tw.user.screen_name);
            _.forOwn(groupedByUsername, (tweets, username)  => {
                var temp = angular.copy(tweets);
                groupedByUsername[username] = {
                    tweets: temp,
                    username: username,
                    id : tweets[0].user.id,
                    followers: tweets[0].user.followers_count,
                    sentiment: _.mean( tweets.filter((tw) => tw.sentiment != 0).map((tw) => tw.sentiment) )
                };
            })
            return orderByFollowers(_.values(groupedByUsername));
        }

        function orderByFollowers(users){
            return _.orderBy(users, (u) => -u.followers);
        }

        function getStats(tweets) {
            let onlyPositive = tweets.filter((tweet) => tweet.sentiment > 0);
            let positivePercentage = Math.round(onlyPositive.length / tweets.length * 10000) / 100;
            let onlyNegative = tweets.filter((tweet) => tweet.sentiment < 0);
            let negativePercentage = Math.round(onlyNegative.length / tweets.length * 10000) / 100;
            let onlyNeutral = tweets.filter((tweet) => tweet.sentiment == 0);
            let neutralPercentage = Math.round(onlyNeutral.length / tweets.length * 10000) / 100;
            let geoActivated = tweets.filter((tweet) => tweet.geo != null);
            let geoPercentage = Math.round(geoActivated.length / tweets.length * 10000) / 100;

            return {
                num: tweets.length,
                positivePercentage: positivePercentage,
                positiveTweets : onlyPositive,
                negativePercentage: negativePercentage,
                negativeTweets : onlyNegative,
                neutralPercentage: neutralPercentage,
                neutralTweets : onlyNeutral,
                geoPercentage: geoPercentage
            };
        }

        function groupTweetsByDays(tweets) {
            return _.groupBy(tweets, (tweet) => {
                var date = new Date(tweet.created_at);
                return date.getDate() + '/' + (date.getMonth() + 1);
            });
        }

    }
})();