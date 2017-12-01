(function() {

  goog.provide('gn_search_afo_config');
  var module = angular.module('gn_search_afo_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          viewerSettings.ui = {
            name: 'afo',
            title: '',
            map: {
              center: [2300000, 416000],
              zoom: 4,
              extent: [-2960500,-3371179, 7559192,4202705]
            },
            auList: ['regions'],
            geonamesCode: 'AFO'
          }
        }]);
})();
