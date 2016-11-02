(function() {

  goog.provide('app.catalog');

  var PIGEO_GEOSERVER_URL = 'http://ne-risk.pigeo.fr/geoserver-prod/wms';

  var module = angular.module('app.catalog', []);
  //module.constant('appCatalogUrl', '../../catalog/views/pigeo/data/senegaltree.json');
  module.constant('appCatalogUrl', 'pigeo.layertree.get');

  module.value('ngeoLayertreeTemplateUrl',
    '../../catalog/views/pigeo/js/catalog/layertree.html');

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
  gn.AppCatalogController =
    function($http, appCatalogUrl, gnMap,
             gnOwsCapabilities, ngeoDecorateLayer) {

      this.gnMap_ = gnMap;
      this.ngeoDecorateLayer = ngeoDecorateLayer;
      this.gnOwsCapabilities = gnOwsCapabilities;

      $http.get(appCatalogUrl).then(function(catalog) {
        this.tree = catalog.data;
        this.updateLayersFromCap();
      }.bind(this));
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
    layerCacheKey = type + '_' + node['layers'];
    if (layerCacheKey in layerCache_) {
      return layerCache_[layerCacheKey];
    }

    var layer;

    // Create a wms layer
    if(type == 'wms') {
      layer = this.gnMap_.createOlWMS(this.map,
        {'LAYERS': node.layers},
        {label: node.name, url: node.url, metadata: node.metadataUrl});
    }

    else if (type == 'chart') {
      layer = new ol.layer.Image({
        label: node.name,
        layers: node.layers
      });
      this.ngeoDecorateLayer(layer);
      layer.displayInLayerManager = true;

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
    if(node.pq_rastertype_fields) {
      layer.set('queryablepolygon', {
        pq_bandnb: node.pq_bandnb,
        pq_header: node.pq_header,
        pq_layer: node.pq_layer,
        pq_rastertype_fields: node.pq_rastertype_fields,
        pq_round: node.pq_round
      });

    }

    this.gnMap_.feedLayerMd(layer);

    layerCache_[layerCacheKey] = layer;

    return layer;
  };

  gn.AppCatalogController.prototype.updateLayersFromCap = function() {

    this.gnOwsCapabilities.getWMSCapabilities(PIGEO_GEOSERVER_URL).then(
      function(capObj) {
        for(var p in layerCache_) {
          var l = layerCache_[p],
              layers = l.getSource().getParams().LAYERS,
              url = l.get('url'),
              capL;

          if(url.indexOf('http://ne-risk.pigeo.fr/geoserver-prod/wms') >= 0) {
            capL = this.gnOwsCapabilities.getLayerInfoFromCap(layers, capObj);
          }
          else if(url.indexOf('http://ne-risk.pigeo.fr/geoserver-prod/') >= 0) {
            var r = layers.match(/:(.*)/);
            if(r.length == 2) {
              capL = this.gnOwsCapabilities.getLayerInfoFromCap(r[1], capObj);
            }
          }

          if(capL) {
            var tmpLayer = this.gnMap_.createOlWMSFromCap(this.map, capL, url);
            for(var prop in tmpLayer.getProperties()) {
              if(!l.get(prop) && tmpLayer.get(prop)) {
                l.set(prop, tmpLayer.get(prop));
              }
            }
            if(tmpLayer.get('time')) {
              console.log(tmpLayer.get('time'));
            }
          }
        }
      }.bind(this));

    this.gnOwsCapabilities.getWMSCapabilities('http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?').then(
      function(capObj) {
        for(var p in layerCache_) {
          var l = layerCache_[p],
            layers = l.getSource().getParams().LAYERS,
            url = l.get('url'),
            capL;

            capL = this.gnOwsCapabilities.getLayerInfoFromCap(layers, capObj);

          if(capL) {
            var tmpLayer = this.gnMap_.createOlWMSFromCap(this.map, capL, url);
            for(var prop in tmpLayer.getProperties()) {
              if(!l.get(prop) && tmpLayer.get(prop)) {
                l.set(prop, tmpLayer.get(prop));
              }
            }
            if(tmpLayer.get('time')) {
              console.log(tmpLayer.get('time'));
            }
          }
        }
      }.bind(this));

  };

  module.controller('AppCatalogController',
    gn.AppCatalogController);

  gn.AppCatalogController['$inject'] = [
    '$http',
    'appCatalogUrl',
    'gnMap',
    'gnOwsCapabilities',
    'ngeoDecorateLayer'
  ];

})();
