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
              name: 'Ifremer - Biologie',
              url: 'http://www.ifremer.fr/services/wms/biologie?'
            }, {
              name: 'Ifremer - Océanographie physique',
              url: 'http://www.ifremer.fr/services/wms/oceanographie_physique?service=WMS&request=GetCapabilities'
            }],

            wmts: [{
              name: 'Arcgisonline - Relief ombré',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }, {
              name: 'Arcgisonline - World Imagery',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }]
          };

          var bboxStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255,0,0,1)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.3)'
            })
          });
          searchSettings.olStyles = {
            drawBbox: bboxStyle,
            mdExtent: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 2
              })
            }),
            mdExtentHighlight: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,0,0.3)'
              })
            })

          };

          /*******************************************************************
           * Define maps
           */
          var mapsConfig = {
            center: [280274.03240585705, 6053178.654789996],
            zoom: 2,
            maxResolution: 9783.93962050256
          };

          var viewerMap = new ol.Map({
            controls: [],
            view: new ol.View(mapsConfig)
          });


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
            tplUrl: '../../catalog/components/search/resultsview/' +
            'partials/viewtemplates/grid.html',
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
        }]);
})();