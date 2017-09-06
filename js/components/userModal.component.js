(function () {
    'use strict';
    angular
        .module('TFG')
        .component('userModal', {
            templateUrl: 'js/components/userModal.html',
            controller: UserModalController,
            controllerAs: 'UserCtrl',
            bindings: {
                user: '='
            }
        });

    function UserModalController() {
        var UserCtrl = this;
        UserCtrl.cleanUser = () => UserCtrl.user = null;
        
        ////////////////

        UserCtrl.$onInit = function () {};
        UserCtrl.$onChanges = function (changesObj) {};
        UserCtrl.$onDestroy = function () { };

    }
})();