(function() {

  goog.provide('gn_search_ci-sgie_config');
  var module = angular.module('gn_search_ci-sgie_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          viewerSettings.ui = {
            name: 'ci-sgie',
            title: '',
            map: {
              center: [-575030, 591027],
              zoom: 8,
              extent: [-896623.80,435929.55, -253437.34,746126.71]
            },
            auList: ['regions', 'departements', 'sousprefectures'],
            geonamesCode: 'CI'
          }
        }]);
})();
