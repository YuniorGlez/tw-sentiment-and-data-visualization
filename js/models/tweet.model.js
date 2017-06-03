(function() {
    'use strict';

    angular
        .module('TFG')
        .factory('TweetModel', TweetModel);

    TweetModel.$inject = ['UserModel'];
    function TweetModel(UserModel) {
        var service = {
            Tweet:Tweet
        };

        return service;

        ////////////////
        function Tweet(tweet) {
            if (!tweet) return null;
            return {
                coordinates : tweet.coordinates,
                created_at : tweet.created_at,
                current_user_retweet : tweet.current_user_retweet,
                favorite_count : tweet.favorite_count,
                favorited: tweet.favorited,
                sentiment : tweet.sentiment,
                id : tweet.id,
                id_str : tweet.id_str,
                in_reply_to_screen_name : tweet.in_reply_to_screen_name,
                in_reply_to_status_id : tweet.in_reply_to_status_id,
                in_reply_to_status_id_str : tweet.in_reply_to_status_id_str,
                in_reply_to_user_id : tweet.in_reply_to_user_id,
                in_reply_to_user_id_str : tweet.in_reply_to_user_id_str,
                lang : tweet.lang,
                place : tweet.place,
                quoted_status_id : tweet.quoted_status_id,
                quoted_status_id_str : tweet.quoted_status_id_str,
                quoted_status : new Tweet(tweet.quoted_status),
                retweet_count : tweet.retweet_count,
                retweeted : tweet.retweeted, // THE USER AUTHENTICATED RT this tweet
                retweeted_status : new Tweet(tweet.retweeted_status),
                text : tweet.text,
                user : new UserModel.User(tweet.user)
            }
        }
    }
})();