(function() {

  goog.provide('gn_search_rdc-risk_config');
  var module = angular.module('gn_search_rdc-risk_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          viewerSettings.ui = {
            name: 'rdc-risk',
            title: '',
            map: {
              center: [2422163, -456127],
              zoom: 6,
              extent: [1359717,-1512113,3484609,599858]
            },
            auList: ['regions'],
            geonamesCode: 'CD'
          }
        }]);
})();
