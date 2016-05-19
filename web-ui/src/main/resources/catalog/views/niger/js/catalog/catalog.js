(function() {

  goog.provide('app.catalog');

  var module = angular.module('app.catalog', []);
  module.constant('appCatalogUrl', '../../catalog/views/niger/data/layertree.json');
  //module.constant('appCatalogUrl', 'pigeo.layertree.get');

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
  gn.AppCatalogController = function($http, appCatalogUrl, gnMap,
                                     gnGlobalSettings) {

    var $this = this;
    this.gnMap_ = gnMap;
    this.gnGlobalSettings_ = gnGlobalSettings;

    $http.get(appCatalogUrl).then(function(catalog) {
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
    evt.preventDefault();
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
    if (type == 'folder') {
      return null;
    }

    node.name = node.text || node.layer;
    layerCacheKey = type + '_' + node['name'];
    if (layerCacheKey in layerCache_) {
      return layerCache_[layerCacheKey];
    }

    var layer;
    var $this = this;

    // Create a wms layer
    if(type == 'wms') {
      layer = this.gnMap_.createOlWMS(this.map,
          {'LAYERS': node.layers},
          {label: node.name, url: node.url, metadata: node.metadataUrl});
    }

    // load full WFS layer
    else if (type == 'chart') {
      var vectorFormat = node.format == 'geojson' ?
          new ol.format.GeoJSON() : new ol.format.WFS();
      var vectorSource = new ol.source.Vector({
        format: vectorFormat,
        url : $this.gnGlobalSettings_.proxyUrl +
          encodeURIComponent(node.url + node.layers),
        projection: this.map.getView().getProjection().getCode()
      });
      layer = new ol.layer.Vector({
        source: new ol.source.Cluster({
          distance: 40,
          source: vectorSource
        })
      });

      layer.set('layers', node.layers);
      layer.set('chartconfig', {
        changescales: node.changescales,
        layers: node.layers,
        chartsize: node.chartsize,
        charttype: node.charttype,
        colorcodes: node.colorcodes,
        dbname: node.dbname,
        dbtables: node.dbtables,
        dbwhere: node.dbwhere,
        format: node.format,
        join_dbfield: node.join_dbfield,
        join_geofield: node.join_geofield,
        labels_dbfield: node.labels_dbfield,
        values_dbfield: node.values_dbfield
      });
    }
    layer.set('metadataUuid', node.uuid);
    layer.set('queryable', node.queryable);
    layer.set('queryablepolygon', node.pq_rastertype_fields);

    this.gnMap_.feedLayerMd(layer);

    layerCache_[layerCacheKey] = layer;

    return layer;
  };

  module.controller('AppCatalogController',
      gn.AppCatalogController);

  gn.AppCatalogController['$inject'] = [
    '$http',
    'appCatalogUrl',
    'gnMap',
    'gnGlobalSettings'
  ];

})();