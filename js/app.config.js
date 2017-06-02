(function() {
    'use strict';

    angular.module('TFG')
        .constant(
            'MonkeyData', {
                headers : {
                    "Authorization" : "Token cfbfbc1027280ee239c931823168b93030dac1ee",
                    "Content-Type" : "application/json"
                },
                spaClasificator : 'https://api.monkeylearn.com/v2/classifiers/cl_u9PRHNzf/classify/',
                engClasificator : 'https://api.monkeylearn.com/v2/classifiers/cl_qkjxv9Ly/classify/?sandbox=1'
            })
        .constant()
        .constant()
})();