(function () {
    'use strict';

    angular
        .module('TFG')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['TwitterOauth'];

    function LoginController(TwitterOauth) {
        var vm = this;
        vm.signUp = signUp;

        activate();

        ////////////////

        function activate() {}

        function signUp() {
            TwitterOauth.signUp()
                .then(successSignUp, errorSignUp)
                .catch(errorSignUp);

        }

        function successSignUp(user) {
            console.log(user.token);
            window.location.href = '#!/home';
        }

        function errorSignUp(err) {

        }

    }
})();