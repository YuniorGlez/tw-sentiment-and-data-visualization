(function () {
    'use strict';

    angular
        .module('TFG')
        .service('FireBaseService', FireBaseService);

    FireBaseService.$inject = [];

    function FireBaseService() {
        this.resolveCachedTexts = resolveCachedTexts;
        this.updateSentiment = updateSentiment;

        var fireDatabaseSpaTexts = firebase.database().ref('/texts/spa/');
        var fireDatabaseEngTexts = firebase.database().ref('/texts/eng/');
        ////////////////

        function resolveCachedTexts(lang, texts, tweets) {
            if (lang == 'Spa')
                return fireDatabaseSpaTexts.once('value')
                    .then((snapshot) => resolveCachedBasedInSnapshot(snapshot, tweets, texts))
            else if (lang == 'Eng')
                return fireDatabaseEngTexts.once('value')
                    .then((snapshot) => resolveCachedBasedInSnapshot(snapshot, tweets, texts));
        }

        function resolveCachedBasedInSnapshot(snapshot, tweets, texts) {
            var obj = snapshot.val();
            var prevTexts = _.values(obj);
            var copyToIterate = angular.copy(texts.text_list);
            copyToIterate.forEach((txt) => {
                var idx = _.findIndex(prevTexts, {'text': txt});
                if (~idx) {
                    findTweetAndExtendWithAttr(tweets, txt, {sentiment: prevTexts[idx].sentiment});
                    _.pull(texts.text_list, txt);
                }
            });
            return tweets;
        }

        function findTweetAndExtendWithAttr(tweets, trimmedText, attrs) {
            tweets.map((tw) => {
                if (tw.trimmedText == trimmedText) angular.extend(tw, attrs);
            });
        }

        function updateSentiment(lang, txt, sentiment) {
            var updateContent = {
                text: txt,
                sentiment: sentiment
            };
            if (lang == 'English')
                fireDatabaseEngTexts.push(updateContent);
             else if (lang == 'Spanish')
                fireDatabaseSpaTexts.push(updateContent);
        }


    }
})();