(function () {
    'use strict';
    angular.module('TFG').service('SentimentAnalysis', SentimentAnalysis);

    SentimentAnalysis.$inject = ['$http', 'MonkeyData', 'FireBaseService', '$exceptionHandler', '$q'];

    function SentimentAnalysis($http, MonkeyData, FireBaseService, $exceptionHandler, $q) {
        // Public methods
        var service = {
            evaluateTweets: evaluateTweets
        };

        // Internal vars
        var urlSpanishAPI = MonkeyData.spaClasificator;
        var urlEnglishAPI = MonkeyData.engClasificator;
        var config = {
            headers: MonkeyData.headers
        };

        ////////////////

        function evaluateTweets(tweets) {
            // Removing trash due to perform the sentiment analysis
            tweets.forEach(function (tweet) {
                tweet.trimmedText = tweet.text.replace(/(https?|ftp):?(\/\/)?[\n\S]+/g, '');
                tweet.trimmedText = tweet.trimmedText.replace(/(\.?@)\w*/g, '');
                tweet.trimmedText = tweet.trimmedText.replace(/(RT) *:/g, '');
                tweet.trimmedText = tweet.trimmedText.replace(/&amp/g, 'and');
                tweet.trimmedText = tweet.trimmedText.trim();
                if (tweet.trimmedText.trim().length == 0) tweet.trimmedText = 'Neutral';
            });

            //  Making the objects groupBy language to the clasiffier api in monkeylearn
            var englishTweets = tweets.filter(
                (tw) => (tw.lang != 'es' && tw.lang != 'und') ||
                (tw.lang == 'und' && tw.user.lang != 'es') ||
                (tw.lang == 'und' && tw.user.lang == 'und')
            )
            var englishTexts = {
                text_list: englishTweets.map((tw) => tw.trimmedText)
            };
            var spanishTweets = tweets.filter((tw) => tw.lang == 'es' || (tw.lang == 'und' && tw.user.lang == 'es'));
            var spanishTexts = {
                text_list: spanishTweets.map((tw) => tw.trimmedText)
            };

            // request to firebase for cached sentiments
            return requestForCachedResultInFirebase(tweets, spanishTexts, englishTexts);
        }

        function requestForCachedResultInFirebase(tweets, spanishTexts, englishTexts) {
            var promises = [];
            promises.push(FireBaseService.resolveCachedTexts('Spa',spanishTexts,tweets));
            promises.push(FireBaseService.resolveCachedTexts('Eng',englishTexts,tweets));
            return $q.all(promises)
                .then(() => monkeySentiment(tweets, englishTexts, spanishTexts))
                .catch($exceptionHandler);
        }

        function monkeySentiment(tweets, englishTexts, spanishTexts) {
            if (englishTexts.text_list.length == 0 &&  spanishTexts.text_list.length == 0)
                return tweets;

            // Make parallel Calls divide by 100
            var allPromises = [], englishPromises = [], spanishPromises = [],
                englishPieces = _.chunk(englishTexts.text_list, 200),
                spanishPieces = _.chunk(spanishTexts.text_list, 200);

            var ite = 0;
            englishPieces.forEach((texts) => {
                var request = { text_list: texts };
                setTimeout(() =>
                    englishPromises.push(monkeyPromise(urlEnglishAPI, request, config, 'English', tweets))
                ,50*ite++);
            })
            spanishPieces.forEach((texts) => {
                var request = { text_list: texts };
                setTimeout(() =>
                    spanishPromises.push(monkeyPromise(urlSpanishAPI, request, config, 'Spanish', tweets))
                ,50*ite++);
            })

            allPromises = _.concat(englishPromises, spanishPromises);
            return $q.all(allPromises).then(() => { return tweets });
        }

        function monkeyPromise(url, texts, config, lang, tweets) {
            return $http.post(url, texts, config, lang)
                .then((response) => monkeyAPIResults(response, tweets, texts, lang));
        }

        function monkeyAPIResults(response, tweets, texts, lang) {
            response.data.result.forEach((result, idx) => {
                findTweetAndExtendWithAttr(tweets, texts.text_list[idx], {
                    evaluatedIn: lang
                });
                if (result[0].label == 'Positive' || result[0].label == 'positive') {
                    findTweetAndExtendWithAttr(tweets, texts.text_list[idx], {
                        sentiment: result[0].probability
                    });
                    FireBaseService.updateSentiment(lang, texts.text_list[idx], result[0].probability);
                } else if (result[0].label == 'Negative' || result[0].label == 'negative') {
                    findTweetAndExtendWithAttr(tweets, texts.text_list[idx], {
                        sentiment: -result[0].probability
                    });
                    FireBaseService.updateSentiment(lang, texts.text_list[idx], -result[0].probability);
                } else {
                    findTweetAndExtendWithAttr(tweets, texts.text_list[idx], {
                        sentiment: 0
                    });
                    FireBaseService.updateSentiment(lang, texts.text_list[idx], 0);
                }
            });
        }

        function findTweetAndExtendWithAttr(tweets, trimmedText, attrs) {
            tweets.map((tw) => {
                if (tw.trimmedText == trimmedText) angular.extend(tw, attrs);
            });
        }

        return service;
    }
})();