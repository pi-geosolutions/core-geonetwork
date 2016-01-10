(function() {

  goog.provide('gn_search_niger');

  goog.require('gn_search');
  goog.require('gn_search_niger_config');
  goog.require('app.bglayer');
  goog.require('app.catalog');
  goog.require('app.layermanager');


  var module = angular.module('gn_search_niger',[
    'gn_search',
    'gn_search_niger_config',
    'app.bglayer',
    'app.catalog',
    'app.layermanager'
  ]);

  module.config(['$LOCALES',
    function($LOCALES) {
      $LOCALES.push('pigeo');
    }]);

  gn.MainController = function($scope, ngeoSyncArrays) {

    this.siteTitle = 'gam-dris';
    this.siteSubTitle = 'Risk Management Portal for Gambia';

    this.setMap_();

    this['selectedLayers'] = [];
    this.manageSelectedLayers_($scope, ngeoSyncArrays);

  };

  gn.MainController.prototype.setMap_ = function() {

    this.map = new ol.Map({
      view: new ol.View({
        center: [-1761109.131690461, 1540970.4902291533],
        zoom: 8
      }),
      controls: [
        new ol.control.Zoom({
          zoomInTipLabel: 'Zoom avant',
          zoomOutTipLabel: 'Zoom arrière'
        }),
        new ol.control.ZoomToExtent({
          extent: [-2091317.0938824224, 1267325.9289682223,
            -1430901.1694984995, 1814615.0514900843],
          tipLabel: 'Emprise globale',
          className: 'un-zoom-extent',
          label:$(
              '<span class="fa fa-globe"></span>')}),

        new ol.control.FullScreen({
          tipLabel: 'Plein écran',
          className: 'un-full-screen',
          label:$(
              '<span class="fa fa-arrows-alt"></span>')})
      ]
    });

    var map = this.map;
  };

  gn.MainController.prototype.manageSelectedLayers_ =
      function(scope, ngeoSyncArrays) {
        var map = this.map;
        ngeoSyncArrays(map.getLayers().getArray(),
            this['selectedLayers'], true, scope,
            function(layer) {
              return layer.displayInLayerManager;
            }
        );
      };

  gn.MainController.prototype.closeSidebar = function() {
    this.layersOpen = false;
    this.contextOpen = false;
    this.printOpen = false;
    this.drawOpen = false;
    this.importOpen = false;
  };
  gn.MainController.prototype.sidebarOpen = function() {
    return this.layersOpen || this.contextOpen || this.printOpen ||
        this.drawOpen || this.importOpen;
  };

  gn.MainController.prototype.showTab = function(selector) {
    $(selector).tab('show');
  };

  module.controller('MainController', gn.MainController);
  gn.MainController['$inject'] = [
    '$scope',
    'ngeoSyncArrays'
  ];

})();
