(function() {
'use strict';

    angular
        .module('TFG')
        .factory('MapsFactory', MapsFactory);

    MapsFactory.$inject = [];
    function MapsFactory() {
        var service = {
            createMap:createMap
        };

        return service;

        ////////////////
        function createMap(id, data) {
            Highcharts.mapChart(id, {
                chart: {
                    borderWidth: 1,
                    map: 'custom/world'
                },

                title: {
                    text: 'Tweets por localización'
                },

                subtitle: {
                    text: ''
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
                    data: data,
                    minSize: 4,
                    maxSize: '12%',
                    tooltip: {
                        pointFormat: '{point.code}: {point.z} thousands'
                    }
                }]
            })
        }
    }
})();