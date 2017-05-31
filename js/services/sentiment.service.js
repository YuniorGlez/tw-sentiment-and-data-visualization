(function () {
    'use strict';
    angular.module('TFG').service('SentimentAnalysis', SentimentAnalysis);

    SentimentAnalysis.$inject = ['$http'];

    function SentimentAnalysis($http) {
        this.evaluateTweets = evaluateTweets;
        var urlSpanishAPI = 'https://api.monkeylearn.com/v2/classifiers/cl_u9PRHNzf/classify/';
        var urlEnglishAPI = 'https://api.monkeylearn.com/v2/classifiers/cl_qkjxv9Ly/classify/?sandbox=1';
        var config = {};
        config.headers = {};
        config.headers['Authorization'] = 'Token cfbfbc1027280ee239c931823168b93030dac1ee';
        config.headers['Content-Type'] = 'application/json';

        var fireDatabaseSpaTexts = firebase.database().ref('/texts/spa/');
        var fireDatabaseEngTexts = firebase.database().ref('/texts/eng/');
        ////////////////

        function evaluateTweets(tweets) {
            // Removing trash due to performance the sentiment analysis
            tweets.forEach(function (tweet, idx) {
                tweets[idx].trimmedText = tweet.text.replace(/(https?|ftp):?(\/\/)?[\n\S]+/g, '');
                tweets[idx].trimmedText = tweets[idx].trimmedText.replace(/(\.?@)\w*/g, '');
                tweets[idx].trimmedText = tweets[idx].trimmedText.replace(/(RT) *:/g, '');
                tweets[idx].trimmedText = tweets[idx].trimmedText.replace(/&amp/g, 'and');
                tweets[idx].trimmedText = tweets[idx].trimmedText.trim();
                // tweets[idx].trimmedText = tweets[idx].trimmedText.replace(/[ ]*/g, ' ');
                if (tweets[idx].trimmedText.trim().length == 0) tweets[idx].trimmedText = 'Neutral';
            });

            //  Making the objects groupBy language to the clasiffier api in monkeylearn
            var englishTweets = tweets.filter(
                (tw) => (tw.lang != 'es' && tw.lang != 'und') ||
                (tw.lang == 'und' && tw.user.lang != 'es') ||
                (tw.lang == 'und' && tw.user.lang == 'und')
            )
            var englishTexts = {
                text_list: englishTweets.map((tw) => tw.trimmedText.trim())
            }

            var spanishTweets = tweets.filter((tw) => tw.lang == 'es' || (tw.lang == 'und' && tw.user.lang == 'es'));
            var spanishTexts = {
                text_list: spanishTweets.map((tw) => tw.trimmedText.trim())
            }
            // request to firebase for cached sentiments

            return fireDatabaseSpaTexts.once('value')
                .then((snapshotSpa) => {
                    var obj = snapshotSpa.val();

                    var prevTexts = _.values(obj);
                    var copyToIterate = angular.copy(spanishTexts.text_list);
                    copyToIterate.forEach((txt) => {
                        var idx = _.findIndex(prevTexts, { 'text': txt });
                        if ( idx != -1) {
                            // console.log(`The text ${txt} was previously anlized like ${prevTexts[idx].sentiment}`);
                            extendTweetsWithThisText(tweets, txt, { sentiment: prevTexts[idx].sentiment });
                            _.pull(spanishTexts.text_list, txt);
                        }
                    });

                    return fireDatabaseEngTexts.once('value')
                        .then((snapshotEng) => {
                            var obj = snapshotEng.val();
                            var prevTexts = _.values(obj);
                            var copyToIterate = angular.copy(englishTexts.text_list);
                            copyToIterate.forEach((txt) => {
                                var idx = _.findIndex(prevTexts, { 'text': txt });
                                if ( idx != -1) {
                                    // console.log(`The text ${txt} was previously anlized like ${prevTexts[idx].sentiment}`);
                                    extendTweetsWithThisText(tweets, txt, { sentiment: prevTexts[idx].sentiment });
                                    _.pull(englishTexts.text_list, txt);
                                }
                            });
                            return englishSentiment(tweets, englishTexts, spanishTexts);
                        })

                },
                (error) => {
                    console.log(error);
                    return [];
                });

            // Request for english sentiment before spanish
        }

        function englishSentiment(tweets, englishTexts, spanishTexts) {
            if (englishTexts.text_list.length > 0)
            
                return $http.post(urlEnglishAPI, englishTexts, config)
                    .then(function (response) {
                        userAPIResults(response, tweets, englishTexts, 'English');
                        return spanishSentiment(tweets, englishTexts, spanishTexts);
                    });
            else
                return spanishSentiment(tweets, englishTexts, spanishTexts);

        }

        function spanishSentiment(tweets, englishTexts, spanishTexts) {
            if (spanishTexts.text_list.length > 0)
                return $http.post(urlSpanishAPI, spanishTexts, config)
                    .then(function (response) {
                        userAPIResults(response, tweets, spanishTexts, 'Spanish');
                        return tweets;
                    });
            else
                return tweets;
        }

        function userAPIResults(response, tweets, texts, key) {
            response.data.result.forEach((result, idx) => {
                extendTweetsWithThisText(tweets, texts.text_list[idx], {
                    evaluatedIn: key
                });
                if (result[0].label == 'Positive' || result[0].label == 'positive') {
                    extendTweetsWithThisText(tweets, texts.text_list[idx], {
                        sentiment: result[0].probability
                    });
                    updateFireBaseTexts(key, texts.text_list[idx], result[0].probability);
                } else if (result[0].label == 'Negative' || result[0].label == 'negative') {
                    extendTweetsWithThisText(tweets, texts.text_list[idx], {
                        sentiment: -result[0].probability
                    });
                    updateFireBaseTexts(key, texts.text_list[idx], -result[0].probability);
                } else {
                    extendTweetsWithThisText(tweets, texts.text_list[idx], {
                        sentiment: 0
                    });
                    updateFireBaseTexts(key, texts.text_list[idx], 0);
                }
            });
        }

        function updateFireBaseTexts(lang, txt, sentiment) {
            if (lang == 'English') {
                fireDatabaseEngTexts.push({ text: txt, sentiment: sentiment });
            } else if (lang == 'Spanish') {
                fireDatabaseSpaTexts.push({ text: txt, sentiment: sentiment });
            }
        }

        function extendTweetsWithThisText(tweets, trimmedText, attrs) {
            tweets.map((tw) => {
                if (tw.trimmedText == trimmedText) angular.extend(tw, attrs);
            });
        }
    }
})();