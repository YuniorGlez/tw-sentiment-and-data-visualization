
(function () {
    'use strict';

    angular
        .module('TFG')
        .service('TwitterOauth', TwitterOauth);

    TwitterOauth.$inject = [];

    function TwitterOauth() {
        var service = {
            signUp: signUp
            // logIn: logIn,
            // logOut: logOut
        };

        var provider = new firebase.auth.TwitterAuthProvider();
        ////////////////

        function signUp() {
            return firebase.auth().signInWithPopup(provider).then(function (result) {
                // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
                // You can use these server side with your app's credentials to access the Twitter API.
                var token = result.credential.accessToken;
                var secret = result.credential.secret;
                // The signed-in user info.
                var user = result.user;
                localStorage.setItem('logged', true);
                var tw_object = {
                    clientSecret: secret,
                    oauthToken: token
                };
                localStorage.setItem('tw_object', JSON.stringify(tw_object));
                return {
                    user: user,
                    token: token,
                    secret: secret
                };
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                console.log(error);
                // ...
                return error;
            });
        }

        return service;
    }
})();