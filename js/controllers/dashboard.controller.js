(function() {
'use strict';

    angular
        .module('TFG')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['TwitterSearchEngine'];
    function DashboardController(TS) {
        var vm = this;
        vm.search = search;
        vm.changeSearch = changeSearch;
        vm.searchedParams = [];
        vm.actualSearch = '';
        vm.data = {};
        vm.ready = false;
        activate();

        ////////////////

        function activate() {
            vm.title = 'Helo world ! ';
            vm.optionDataSelected = 'Generales';
        }


        function search() {
            vm.searchedParams.push(vm.searchParam);
            vm.actualSearch = vm.searchParam;
            vm.searchParam = '';
            TS.search(vm.actualSearch)
                .then(successData,
                      errorHandler);
        }

        function changeSearch(searchParam) {
            vm.actualSearch = searchParam;
        }
        function errorHandler(err) {
            console.log(err);
        }
        function successData(data) {
            vm.data = data;
            Highcharts.chart('chartPercentage', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false
                },
                title: {
                    text: 'Sentimiento',
                    align: 'center',
                    verticalAlign: 'middle',
                    y: 40
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: true,
                            distance: -50,
                            style: {
                                fontWeight: 'bold',
                                color: 'white'
                            }
                        },
                        startAngle: -90,
                        endAngle: 90,
                        center: ['50%', '75%']
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Porcentaje',
                    innerSize: '50%',
                    data: [
                        ['Negativos',   vm.data.stats.negativePercentage],
                        ['Neutrales',   vm.data.stats.neutralPercentage],
                        ['Positivos',   vm.data.stats.positivePercentage]
                        // {
                        //     name: 'Proprietary or Undetectable',
                        //     y: 0.2,
                        //     dataLabels: {
                        //         enabled: false
                        //     }
                        // }
                    ]
                }]
            });
            vm.ready = true;
        }
    }
})();