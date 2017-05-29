(function () {
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
            vm.optionMapSelected = 'Sentimiento';
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
            console.log('data **', data);
            createChart();
            createMap();
            vm.ready = true;
        }

        function createMap() {
            var tweetsWithGeo = vm.data.tweets.filter((tweet) => tweet.geolocation.X != 0);
            tweetsWithGeo = tweetsWithGeo.map((tweet) =>
                ({
                    lat : Math.floor(tweet.geolocation.Y),
                    lon: Math.floor(tweet.geolocation.X),
                    z : tweet.sentiment
                })
            );
            // console.log(tweetsWithGeo);
            Highcharts.mapChart('map', {
                chart: {
                    borderWidth: 1,
                    map: 'custom/world'
                },

                title: {
                    text: 'World population 2013 by country'
                },

                subtitle: {
                    text: 'Demo of Highcharts map with bubbles'
                },

                legend: {
                    enabled: false
                },

                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },

                series: [{
                    name: 'Countries',
                    // color: '#E0E0E0',
                    colorAxis: {
                        minColor: 'red',
                        maxColor: 'green'
                    },
                    enableMouseTracking: false
                }, {
                    type: 'mapbubble',
                    name: 'Population 2013',
                    joinBy: ['iso-a2', 'code'],
                    //            data: data,
                    data: tweetsWithGeo,
                    minSize: 4,
                    maxSize: '12%',
                    tooltip: {
                        pointFormat: '{point.code}: {point.z} thousands'
                    }
                }]
            });

        }

        function createChart() {
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
                        ['Negativos', vm.data.stats.negativePercentage],
                        ['Neutrales', vm.data.stats.neutralPercentage],
                        ['Positivos', vm.data.stats.positivePercentage]
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
        }
    }
})();