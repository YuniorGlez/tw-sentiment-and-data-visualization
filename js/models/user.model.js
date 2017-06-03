(function() {
    'use strict';

    angular
        .module('TFG')
        .factory('UserModel', UserModel);

    UserModel.$inject = [];
    function UserModel() {
        var service = {
            User:User
        };

        return service;

        ////////////////
        function User(user) {
            if (!user) return null;
            return {
                created_at : user.created_at,
                description : user.description,
                favourites_count : user.favourites_count,
                followers_count : user.followers_count,
                friends_count: user.friends_count,
                sentiment : user.sentiment,
                geo_enabled : user.geo_enabled,
                id : user.id,
                id_str : user.id_str,
                lang : user.lang,
                location : user.location,
                name : user.name,
                profile_background_image_url : user.profile_background_image_url,
                profile_image_url : user.profile_image_url,
                screen_name : user.screen_name,
                statuses_count : user.statuses_count,
                time_zone : user.time_zone
            }
        }
    }
})();