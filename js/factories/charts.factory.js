(function () {
    'use strict';

    angular
        .module('TFG')
        .factory('ChartsFactory', ChartsFactory);

    ChartsFactory.$inject = [];

    function ChartsFactory() {
        var service = {
            createPercentageChart: createPercentageChart,
            createTimelineChart: createTimelineChart
        };

        return service;

        ////////////////
        function createPercentageChart(id, data) {
            Highcharts.chart(id, {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false
                },
                title: {
                    text: ''
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: false,
                            distance: -50,
                            style: {
                                fontWeight: 'bold',
                                color: 'black'
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Porcentaje',
                    innerSize: '70%',
                    data: data
                }]
            })
        }

        function createTimelineChart(id, data) {
            var days = Object.keys(data);
            days = _.sortBy(days, (day) => {
                var m1 = parseInt(day.split('/')[1]);
                var d1 = parseInt(day.split('/')[0]);
                return m1 * 31 + d1;
            });
            var inTheRealDaysOrder = [];
            days.forEach((k) => inTheRealDaysOrder.push(data[k]));
            var positivesByDay = inTheRealDaysOrder.map((day) => day.filter((tweet) => tweet.sentiment > 0).length);
            var negativeByDay = inTheRealDaysOrder.map((day) => day.filter((tweet) => tweet.sentiment < 0).length);
            var neutralByDay = inTheRealDaysOrder.map((day) => day.filter((tweet) => tweet.sentiment == 0).length);

            Highcharts.chart(id, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: `Últimos ${Object.keys(data).length} días`
                },
                xAxis: {
                    categories: days
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Número total de tweets'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    align: 'right',
                    x: -30,
                    verticalAlign: 'top',
                    y: 30,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        // color : ['green', 'grey', 'red'],
                        dataLabels: {
                            enabled: false,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    }
                },
                series: [{
                        name: 'Positivos',
                        data: Object.values(positivesByDay),
                        color: 'green'
                    },
                    {
                        name: 'Neutral',
                        data: Object.values(neutralByDay),
                        color: 'rgba(0,0,0,0.2)'
                    },
                    {
                        name: 'Negativos',
                        data: Object.values(negativeByDay),
                        color: 'red'
                    }
                ]
            });
        }
    }
})();