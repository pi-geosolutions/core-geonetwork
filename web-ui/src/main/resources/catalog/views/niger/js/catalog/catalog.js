(function() {

  goog.provide('app.catalog');

  var module = angular.module('app.catalog', []);
  module.constant('unCatalogUrl', '../../catalog/views/niger/data/layertree.json');

  module.value('ngeoLayertreeTemplateUrl',
      '../../catalog/views/niger/js/catalog/layertree.html');

  gn.catalogDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=appCatalogMap'
      },
      controller: 'AppCatalogController',
      controllerAs: 'catalogCtrl',
      bindToController: true,
      template: '<div ngeo-layertree="catalogCtrl.tree" ' +
      'ngeo-layertree-map="catalogCtrl.map" ' +
      'ngeo-layertree-nodelayer="catalogCtrl.getLayer(node)" ' +
      'class="themes-switcher collapse in"></div>'
    };
  };
  module.directive('appCatalog', gn.catalogDirective);

  var layerCache_ = {};
  gn.AppCatalogController = function($http, unCatalogUrl, gnMap) {

    var $this = this;
    this.gnMap_ = gnMap;
    $http.get(unCatalogUrl).then(function(catalog) {
      $this.tree = catalog.data;
    });
  };

  gn.AppCatalogController.prototype.toggle = function(node) {
    var layer = this.getLayer(node);
    var map = this['map'];
    if (map.getLayers().getArray().indexOf(layer) >= 0) {
      map.removeLayer(layer);
    } else {
      map.addLayer(layer);
    }
  };

  gn.AppCatalogController.prototype.toggleNode = function(ctrl, evt) {
    if(ctrl.node.children && ctrl.depth > 1) {
      var el = $(evt.target);
      if(el.is('i')) {
        el = el.parent();
      }
      el.find('.fa').first().toggleClass('fa-minus-square')
          .toggleClass('fa-plus-square');
    }
  };

  gn.AppCatalogController.prototype.getLayer = function(node) {
    var layer, layerCacheKey;
    var type = node.type;
    if (type != 'wms') {
      return null;
    }

    node.name = node.text || node.layer;
    layerCacheKey = type + '_' + node['name'];
    if (layerCacheKey in layerCache_) {
      return layerCache_[layerCacheKey];
    }

    var layer = this.gnMap_.createOlWMS(this.map,
        {'LAYERS': node.layers},
        {label: node.name, url: node.url, metadata: node.metadataUrl});

    layer.set('cextent', node.cextent);
    layerCache_[layerCacheKey] = layer;
    return layer;
  };

  module.controller('AppCatalogController',
      gn.AppCatalogController);

  gn.AppCatalogController['$inject'] = [
    '$http',
    'unCatalogUrl',
    'gnMap'
  ];

})();