(function() {
'use strict';

    angular
        .module('TFG')
        .service('SentimentAnalysis', SentimentAnalysis);

    SentimentAnalysis.$inject = ['$http'];
    function SentimentAnalysis($http) {
        this.evaluate = evaluate;
        this.evaluateTweets = evaluateTweets;

        ////////////////

        function evaluate(text) {
            var rand = Math.random();
            if (rand < 0.5) {
                return Math.round(-rand*100)/100;
            }
            else return Math.round(rand*100)/100;
        }

        function evaluateTweets(tweets) {
            // Removing trash due to performance the sentiment analysis
            tweets.forEach(function (tweet, idx) {
                tweets[idx].trimmedText = tweet.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
                tweets[idx].trimmedText = tweets[idx].trimmedText.replace(/(\.?@)\w*/g, '');
                tweets[idx].trimmedText = tweets[idx].trimmedText.replace(/(RT) *:/g, '');
            });

            //  Making the object to the clasiffier api in monkeylearn
            var texts = {
                text_list: tweets.map((tw) => tw.trimmedText)
            };

            // Request for sentiment
            return $http.post(
                'https://api.monkeylearn.com/v2/classifiers/cl_u9PRHNzf/classify/',
                texts,
                {
                    headers: {
                        'Authorization': 'Token cfbfbc1027280ee239c931823168b93030dac1ee',
                        'Content-Type': 'application/json'
                    }
                })
                .then(function (response) {
                    // Modifying the var .sentiment and adding the simbol or 0 is neutral
                    response.data.result.forEach((result, idx) => {
                        if (result[0].label == 'Positive') tweets[idx].sentiment = result[0].probability;
                        else if (result[0].label == 'Negative') tweets[idx].sentiment = -result[0].probability;
                        else tweets[idx].sentiment = 0;
                    })
                    return tweets;
                })
        }

        }
})();