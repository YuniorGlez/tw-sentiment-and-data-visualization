(function () {
    'use strict';

    angular
        .module('TFG')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['TwitterOauth'];
    function LoginController(TwitterOauth) {
        var vm = this;
        vm.signUp = signUp;

        function signUp() {
            TwitterOauth.signUp()
                .then(successSignUp, errorSignUp)
                .catch((err) => console.log(err));

        }

        function successSignUp(user) {
            window.location.href = '#!/home';
        }
        function errorSignUp(err) {
            console.log(err)
        }

    }
})();