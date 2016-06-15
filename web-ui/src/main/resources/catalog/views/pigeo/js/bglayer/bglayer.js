(function() {

  goog.provide('app.bglayer');

  var module = angular.module('app.bglayer', []);

  var bgLayers = [{
    "layer": "mapquest",
    "name": "MapQuest"
  }, {
    "name": "Open Street Map",
    "layer": "osm"
  }, {
    "name": "Bing Aerial",
    "layer": "bing_aerial"
  }];

  gn.backgroundlayerDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=appBackgroundlayerMap'
      },
      templateUrl: '../../catalog/views/pigeo/js/bglayer/' +
      'bglayerdropdown.html',
      controllerAs: 'ctrl',
      bindToController: true,
      controller: 'AppBackgroundlayerController'
    };
  };
  module.directive('appBackgroundlayer', gn.backgroundlayerDirective);


  gn.BackgroundlayerController = function(gnMap, ngeoBackgroundLayerMgr) {

    this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;
    this.gnMap_ = gnMap;
    this['bgLayers'] = bgLayers;

    this.setLayer(bgLayers[0]);
  };

  gn.BackgroundlayerController.prototype.setLayer = function(layerSpec) {
    this['currentBgLayer'] = layerSpec;
    var layer = this.createLayer_(layerSpec['layer']);
    this.backgroundLayerMgr_.set(this['map'], layer);
  };

  gn.BackgroundlayerController.prototype.createLayer_ = function(layerName) {
    return this.gnMap_.createLayerForType(layerName);
  };

  module.controller('AppBackgroundlayerController',
      gn.BackgroundlayerController);

  gn.BackgroundlayerController['$inject'] = [
    'gnMap',
    'ngeoBackgroundLayerMgr'
  ];

})();