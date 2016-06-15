(function() {

  goog.provide('gn_search_senegal_config');
  var module = angular.module('gn_search_senegal_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          console.log('config');
          viewerSettings.ui = {
            name: 'senegal',
            title: '',
            map: {
              center: [-1761109.131690461, 1540970.4902291533],
              zoom: 7,
              extent: [-2192825.467445136, 1348654.9270636498, -1018752.712984829, 1895944.0495855117]

            }
          }


        }]);
})();