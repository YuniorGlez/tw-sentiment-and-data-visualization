(function () {
    'use strict';
    angular.module('TFG').service('SentimentAnalysis', SentimentAnalysis);

    SentimentAnalysis.$inject = ['$http', 'MonkeyData', '$exceptionHandler', '$q'];

    function SentimentAnalysis($http, MonkeyData, $exceptionHandler, $q) {
        this.evaluateTweets = evaluateTweets;
        var urlSpanishAPI = MonkeyData.spaClasificator;
        var urlEnglishAPI = MonkeyData.engClasificator;
        var config = { headers : MonkeyData.headers};

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
                            return monkeySentiment(tweets, englishTexts, spanishTexts);
                        })

                },
                $exceptionHandler
            );

            // Request for english sentiment before spanish
        }

        function monkeySentiment(tweets, englishTexts, spanishTexts) {
            if (englishTexts.text_list.length > 0 || spanishTexts.text_list.length > 0){

                // Make parallel Calls divide by 100
                // var defer = $q.defer();
                var englishPromises = [];
                var spanishPromises = [];
                var englishPieces = _.chunk(englishTexts.text_list, 100);
                var spanishPieces = _.chunk(spanishTexts.text_list, 100);

                englishPieces.forEach( (texts) => {
                    if (texts.length > 0)
                        englishPromises.push(monkeyPromise(urlEnglishAPI, { text_list : texts}, config, 'English'));
                })

                spanishPieces.forEach( (texts) => {
                    if (texts.length > 0)
                        spanishPromises.push(monkeyPromise(urlSpanishAPI, { text_list : texts}, config, 'Spanish'));
                })

                return $q.all(_.concat(englishPromises, spanishPromises)).then(() => {
                    // defer.resolve(tweets);
                    return tweets;
                })

                // return defer.promise;

                function monkeyPromise (url, texts, config, lang){
                    return $http.post(url, texts, config, lang)
                        .then((response) =>  monkeyAPIResults(response, tweets, texts, lang));
                }

            }
        else
            return tweets

        }

        function monkeyAPIResults(response, tweets, texts, key) {
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