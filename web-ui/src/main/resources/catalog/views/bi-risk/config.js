(function() {

  goog.provide('gn_search_bi-risk_config');
  var module = angular.module('gn_search_bi-risk_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          viewerSettings.ui = {
            name: 'bi-risk',
            title: '',
            map: {
              center: [3324000, -380000],
              zoom: 9,
              extent: [3226600,-495653, 3434560,-256278]
            },
            auList: ['provinces', 'communes', 'collines'],
            geonamesCode: 'BI'
          }
        }]);
})();
