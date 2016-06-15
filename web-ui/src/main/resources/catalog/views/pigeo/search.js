(function() {

  goog.provide('gn_search_pigeo');

  goog.require('gn_search');
  goog.require('gn_search_pigeo_config');
  goog.require('gn_solr');
  goog.require('gn_featurestable');
  goog.require('app.bglayer');
  goog.require('app.catalog');
  goog.require('app.geocatalog');
  goog.require('app.layermanager');
  goog.require('app.temporalfiles');
  goog.require('app.adminunits');
  goog.require('app.mouseposition');
  goog.require('app.scaleselector');
  goog.require('app.animation');
  goog.require('app.query.polygon');
  goog.require('app.measure');
  goog.require('app.auth');
  goog.require('app.chartlayer.service');


  var module = angular.module('gn_search_pigeo',[
    'gn_search',
    'gn_search_pigeo_config',
    'gn_solr', 'gn_featurestable',
    'app.bglayer',
    'app.catalog',
    'app.geocatalog',
    'app.layermanager',
    'app.temporalfiles',
    'app.mouseposition',
    'app.scaleselector',
    'app.animation',
    'app.adminunits',
    'app.measure',
    'app.query.polygon',
    'app.auth',
    'app.chartlayer.service'
  ]);

  module.config(['$LOCALES',
    function($LOCALES) {
      $LOCALES.push('pigeo');
    }]);

  gn.MainController = function($scope, gnPopup, ngeoSyncArrays, gnMdView,
                               chartlayerService, gnViewerSettings) {

    this.ui = gnViewerSettings.ui;
    console.log('ctrl');
    this.siteTitle = 'gam-dris';
    this.siteSubTitle = 'Risk Management Portal for Gambia';

    this.temporalActive = false;
    this.$scope = $scope;

    this.setMap_();

    this['selectedLayers'] = [];
    this.manageSelectedLayers_($scope, ngeoSyncArrays);
    this.gnPopup = gnPopup;

    this.temporalPopup;

    gnMdView.initFormatter('#map-container');

    this.markerStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: '../../catalog/views/pigeo/data/marker.png',
        anchorYUnits: 'pixels',
        anchor: [0.5, 50]
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255,0,0,1)',
        width: 2
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,0,0,0.3)'
      })
    });

    this.queryLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      map: this.map,
      style: this.markerStyle
    });

    this.initInteractions_();

    this.lang = $scope.lang;
    this.langs =  {eng: "en", fre: "fr"};

    // Hide Auth panel docuement click
    $(document).click(function(e){
      if(!$(e.target).hasClass('fa-user')) {
        $scope.$apply(function() {
          this.showAuth = false;
        }.bind(this));
      }
    }.bind(this));

    chartlayerService.init(this.map);

  };

  gn.MainController.prototype.setMap_ = function() {

    this.map = new ol.Map({
      view: new ol.View({
        center: this.ui.map.center,
        zoom: this.ui.map.zoom
      }),
      controls: [
        new ol.control.Zoom({
          zoomInTipLabel: 'Zoom avant',
          zoomOutTipLabel: 'Zoom arrière'
        }),
        new ol.control.ZoomToExtent({
          extent: this.ui.map.extent,
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

  gn.MainController.prototype.handleTemporalQuery_ = function(e) {
    if(true) {
      var coords = e.feature.getGeometry().getCoordinates();
      if(!this.temporalPopup || this.temporalPopup.destroyed) {
        this.temporalCoords = coords;
        this.temporalPopup = this.gnPopup.create({
          title: 'temporalFiles',
          content: '<app-temporal-files app-temporal-files-coords="mainCtrl.temporalCoords"></app-temporal-files>',
          className: 'temporal-popup',
          destroyOnClose: true
        }, this.$scope);
        this.$scope.$apply();
      }
    }
  };

  gn.MainController.prototype.initInteractions_ = function() {

    this.queryPointInteraction = new ol.interaction.Draw({
      type: 'Point',
      style: this.markerStyle,
      source: this.queryLayer.getSource()
    });

    var unbindDrawendKey;
    this.$scope.$watch(function(){
      return this.temporalActive;
    }.bind(this), function(active) {
      this.queryPointInteraction.setActive(active);
      if(active) {
        unbindDrawendKey = this.queryPointInteraction.on('drawend',
            this.handleTemporalQuery_.bind(this))
      } else {
        this.queryLayer.getSource().clear();
        this.queryPointInteraction.unByKey(unbindDrawendKey);
      }
    }.bind(this));

    this.queryPointInteraction.on('drawstart', function(e) {
      this.queryLayer.getSource().clear();
    }.bind(this));

    this.queryPointInteraction.setActive(false);
    this.map.addInteraction(this.queryPointInteraction);

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
    this.animationOpen = false;
    this.drawOpen = false;
    this.importOpen = false;
    this.geocatalogOpen = false;
    this.polygonQueryOpen = false;
  };

  gn.MainController.prototype.sidebarOpen = function() {
    return this.layersOpen || this.contextOpen || this.printOpen ||
        this.drawOpen || this.importOpen || this.geocatalogOpen ||
        this.animationOpen || this.polygonQueryOpen;
  };

  gn.MainController.prototype.showTab = function(selector) {
    $(selector).tab('show');
  };

  gn.MainController.prototype.switchLang = function(code) {
    if(code !== this.lang) {
      var url = location.href.split('/');
      url[5] = code;
      location.href = url.join('/');
      if (moment) {
        moment.lang(this.langs[code]);
      }
    }
  };

  module.controller('MainController', gn.MainController);
  gn.MainController['$inject'] = [
    '$scope',
    'gnPopup',
    'ngeoSyncArrays', 'gnMdView', 'chartlayerService', 'gnViewerSettings'
  ];

})();
