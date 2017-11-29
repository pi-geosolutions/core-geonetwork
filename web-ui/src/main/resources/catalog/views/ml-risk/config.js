(function() {

  goog.provide('gn_search_ml-risk_config');
  var module = angular.module('gn_search_ml-risk_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          viewerSettings.ui = {
            name: 'ml-risk',
            title: '',
            map: {
              center: [-500000, 2000000],
              zoom: 6,
              extent: [-2000000,600000,1000000,3500000]
            },
            auList: ['regions', 'cercles', 'communes'],
            geonamesCode: 'ML'
          }
        }]);
})();
