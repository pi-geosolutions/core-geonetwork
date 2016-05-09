(function() {

  goog.provide('gn_search_niger');

  goog.require('gn_search');
  goog.require('gn_search_niger_config');
  goog.require('app.bglayer');
  goog.require('app.catalog');
  goog.require('app.geocatalog');
  goog.require('app.layermanager');
  goog.require('app.temporalfiles');
  goog.require('app.adminunits');
  goog.require('app.mouseposition');
  goog.require('app.scaleselector');


  var module = angular.module('gn_search_niger',[
    'gn_search',
    'gn_search_niger_config',
    'app.bglayer',
    'app.catalog',
    'app.geocatalog',
    'app.layermanager',
    'app.temporalfiles',
    'app.mouseposition',
    'app.scaleselector',
    'app.adminunits'
  ]);

  module.config(['$LOCALES',
    function($LOCALES) {
      $LOCALES.push('pigeo');
    }]);

  gn.MainController = function($scope, gnPopup, ngeoSyncArrays, gnMdView) {

    this.siteTitle = 'gam-dris';
    this.siteSubTitle = 'Risk Management Portal for Gambia';

    this.temporalActive = false;
    this.$scope = $scope;

    this.setMap_();
    this.initInteractions_();

    this['selectedLayers'] = [];
    this.manageSelectedLayers_($scope, ngeoSyncArrays);
    this.gnPopup = gnPopup;

    this.temporalPopup;

    gnMdView.initFormatter('#map-container');

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
  };

  gn.MainController.prototype.initInteractions_ =
      function() {

        // init temporal interaction
        this.map.on('click', function(evt) {
          if(this.temporalActive) {
            if(!this.temporalPopup || this.temporalPopup.destroyed) {
              this.temporalCoords = evt.coordinate;
              this.$scope.$apply();
              this.temporalPopup = this.gnPopup.create({
                title: 'temporalFiles',
                content: '<app-temporal-files app-temporal-files-coords="mainCtrl.temporalCoords"></app-temporal-files>',
                className: 'temporal-popup'
              }, this.$scope);
            }

          }
        }, this);
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
    this.geocatalogOpen = false;
  };
  gn.MainController.prototype.sidebarOpen = function() {
    return this.layersOpen || this.contextOpen || this.printOpen ||
        this.drawOpen || this.importOpen || this.geocatalogOpen;
  };

  gn.MainController.prototype.showTab = function(selector) {
    $(selector).tab('show');
  };

  module.controller('MainController', gn.MainController);
  gn.MainController['$inject'] = [
    '$scope',
    'gnPopup',
    'ngeoSyncArrays', 'gnMdView'
  ];

})();
