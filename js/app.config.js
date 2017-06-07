(function() {
    'use strict';

    angular.module('TFG')
        .constant(
            'MonkeyData', {
                headers : {
                    "Authorization" : "Token f248b1c833085a81c571f47e4886edb9b3799571",
                    "Content-Type" : "application/json"
                },
                spaClassificator : 'https://api.monkeylearn.com/v2/classifiers/cl_u9PRHNzf/classify/',
                engClassificator : 'https://api.monkeylearn.com/v2/classifiers/cl_qkjxv9Ly/classify/?sandbox=1'
            });
})();