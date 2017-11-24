(function() {

  goog.provide('gn_search_niger_config');
  var module = angular.module('gn_search_niger_config', []);

  module
      .run([
        'gnViewerSettings',
        function(viewerSettings) {

          viewerSettings.ui = {
            name: 'niger',
            title: '',
            map: {
              center: [927028.2790426177, 1920098.1505236274],
              zoom: 6,
              extent: [-639625.0526903549, 891561.4979182958, 2493681.61077559, 2948634.803128959]
            },
            geonamesCode: 'NE',
            auList: ['regions', 'communes']
          };

          viewerSettings.servicesUrl = {
            wms: [{
              name: 'Pigeo geoserver',
              url: 'http://ne-risk.pigeosolutions.fr/geoserver/wms'
            }, {
              name: 'Pigeo geoserver Niger',
              url: 'http://ne-risk.pigeosolutions.fr/geoserver/wms'
            }],
            wmts: [{
              name: 'Arcgisonline - Relief ombré',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }, {
              name: 'Arcgisonline - World Imagery',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }]
          };

        }]);
})();