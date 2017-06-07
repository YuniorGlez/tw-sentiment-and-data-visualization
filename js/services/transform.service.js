(function () {
    'use strict';
    angular.module('TFG').service('TransformService', TransformService);

    TransformService.$inject = ['SentimentAnalysis', 'UserModel'];

    function TransformService(S, UserModel) {
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
            _.forOwn(groupedByUsername, (tweetsUser, username)  => {
                var temp = angular.copy(tweetsUser);
                let onlyPositive = temp.filter((tweet) => tweet.sentiment > 0);
                let positivePercentage = Math.round(onlyPositive.length / temp.length * 10000) / 100;
                let onlyNegative = temp.filter((tweet) => tweet.sentiment < 0);
                let negativePercentage = Math.round(onlyNegative.length / temp.length * 10000) / 100;
                let onlyNeutral = temp.filter((tweet) => tweet.sentiment == 0);
                let neutralPercentage = Math.round(onlyNeutral.length / temp.length * 10000) / 100;
                groupedByUsername[username] = angular.extend(new UserModel.User(tweetsUser[0].user) ,{
                    tweets: temp,
                    sentiment: _.sum(temp.map((tw) => tw.sentiment)) ||  0,
                    numberOfRTsReceived : _.sum(temp.map((tw) => tw.retweet_count)) || 0,
                    numberOfFavsReceived: _.sum(temp.map((tw) => tw.favorite_count)) ||  0,
                    positivePercentage : positivePercentage,
                    negativePercentage : negativePercentage,
                    neutralPercentage : neutralPercentage
                });
            })
            return orderByFollowers(_.values(groupedByUsername));
        }

        function orderByFollowers(users){
            return _.orderBy(users, (u) => -u.followers_count);
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