(function() {
    'use strict';

    angular
        .module('TFG')
        .factory('$exceptionHandler', ErrorHandler);

    ErrorHandler.$inject = ['$log' , '$injector'];
    function ErrorHandler($log, $injector)  {
        return function myExceptionHandler(e, cause) {
            var $fancyModal = $injector.get('$fancyModal');
            $fancyModal.open({
                template: `<p>${e.message}</p>`
            });
            $log.warn(e, cause);
        };
    }
})();