var gn = {};

if(!goog) {
  var goog = {};
  goog.UID_PROPERTY_ = 'closure_uid_406936994';
  goog.uidCounter_ = 0;
  goog.getUid = function(obj) {
    return obj[goog.UID_PROPERTY_] ||
        (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
  };
}

(function() {

  goog.provide('gn_search_niger_config');
  window.gn = {};
  var module = angular.module('gn_search_niger_config', []);

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        function(searchSettings, viewerSettings) {

          // Load the context defined in the configuration
          viewerSettings.defaultContext =
              viewerSettings.mapConfig.viewerMap ||
              '../../map/config-viewer.xml';

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [];

          viewerSettings.servicesUrl = {
            wms: [{
              name: 'Pigeo geoserver',
              url: 'http://gm-risk.pigeo.fr/geoserver-prod/ows'
            }],
            wmts: [{
              name: 'Arcgisonline - Relief ombré',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }, {
              name: 'Arcgisonline - World Imagery',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }]
          };

          /*
           * Hits per page combo values configuration. The first one is the
           * default.
           */
          searchSettings.hitsperpageValues = [20, 50, 100];

          /* Pagination configuration */
          searchSettings.paginationInfo = {
            hitsPerPage: searchSettings.hitsperpageValues[0]
          };

          /*
           * Sort by combo values configuration. The first one is the default.
           */
          searchSettings.sortbyValues = [{
            sortBy: 'relevance',
            sortOrder: ''
          }, {
            sortBy: 'changeDate',
            sortOrder: ''
          }, {
            sortBy: 'title',
            sortOrder: 'reverse'
          }, {
            sortBy: 'rating',
            sortOrder: ''
          }, {
            sortBy: 'popularity',
            sortOrder: ''
          }, {
            sortBy: 'denominatorDesc',
            sortOrder: ''
          }, {
            sortBy: 'denominatorAsc',
            sortOrder: 'reverse'
          }];

          /* Default search by option */
          searchSettings.sortbyDefault = searchSettings.sortbyValues[0];

          /* Custom templates for search result views */
          searchSettings.resultViewTpls = [{
            tplUrl: '../../catalog/views/niger/templates/grid.html',
            tooltip: 'Grid',
            icon: 'fa-th'
          }];

          // For the time being metadata rendering is done
          // using Angular template. Formatter could be used
          // to render other layout

          // TODO: formatter should be defined per schema
          searchSettings.formatter = {
            // defaultUrl: 'md.format.xml?xsl=full_view&id='
            defaultUrl: 'md.format.xml?xsl=xsl-view&id=',
            list: [{
              //  label: 'inspire',
              //  url: 'md.format.xml?xsl=xsl-view' + '&view=inspire&id='
              //}, {
              //  label: 'full',
              //  url: 'md.format.xml?xsl=xsl-view&view=advanced&id='
              //}, {
              label: 'full',
              url: 'md.format.xml?xsl=full_view&id='
            }]
            // TODO: maybe formatter config should depends
            // on the metadata schema.
            // schema: {
            // iso19139: 'md.format.xml?xsl=full_view&&id='
            // }
          };

          // Set the default template to use
          searchSettings.resultTemplate =
              searchSettings.resultViewTpls[0].tplUrl;

          viewerSettings.contexts = ['france', 'italy', 'gb'];

          /** Facets configuration */
          searchSettings.facetsSummaryType = 'hits';

          viewerSettings.bingKey = 'AnElW2Zqi4fI-9cYx1LHiQfokQ9GrNzcjOh_' +
              'p_0hkO1yo78ba8zTLARcLBIf8H6D';

          viewerSettings.singleTileWMS = false;

        }]);
})();