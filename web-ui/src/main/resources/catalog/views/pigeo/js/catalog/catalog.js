(function() {

  goog.provide('app.catalog');


  var module = angular.module('app.catalog', []);
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
      template: '<div ngeo-layertree="::catalogCtrl.tree" ' +
      'ngeo-layertree-map="catalogCtrl.map" ' +
      'ngeo-layertree-nodelayer="catalogCtrl.getLayer(node)" ' +
      'class="themes-switcher collapse in"></div>'
    };
  };
  module.directive('appCatalog', gn.catalogDirective);

  var layerCache_ = {};
  gn.AppCatalogController =
    function($http, appCatalogUrl, gnMap, $scope,
             gnOwsCapabilities, ngeoDecorateLayer) {

      this.gnMap_ = gnMap;
      this.ngeoDecorateLayer = ngeoDecorateLayer;
      this.gnOwsCapabilities = gnOwsCapabilities;

      $http.get(appCatalogUrl).then(function(catalog) {
        this.tree = catalog.data;
        //this.loadCapPromise = this.updateLayersFromCap();

        // Apply text filter on the tree
        $scope.$watch(function() {
          return this.activeFilter;
        }.bind(this), function(filter) {
          if(angular.isDefined(filter)) {
            this.clearFilterNode_(this.tree);
            this.filterNode_(this.tree, filter);
          }
        }.bind(this));
      }.bind(this));
    };

  /**
   * Traverse tree and disable filter.
   * Mark all nodes as visible.
   * @param {TreeNode} node Node to traverse.
   * @private
   */
  gn.AppCatalogController.prototype.clearFilterNode_ = function(node) {
    delete node._matchFilter;
    if(node.children) {
      node.children.forEach(function(child) {
        this.clearFilterNode_(child);
      }.bind(this));
    }
  };

  /**
   * Filter a tree structure. Match filter text and `node.text` property.
   * All node that match are marked with `node._matchFilter = true`.
   * If a node match, then all children are visible.
   *
   * @param {TreeNode} node Node to traverse.
   * @param {string} text Filter text.
   * @returns {boolean}
   * @private
   */
  gn.AppCatalogController.prototype.filterNode_ = function(node, text) {
    var match = false;
    if(node.text && node.text.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
      match = true;
    }
    else {
      if(node.children) {
        node.children.forEach(function(child) {
          match = (this.filterNode_(child, text) || match);
        }.bind(this));
      }
    }
    node._matchFilter = match;
    return match;
  };

  gn.AppCatalogController.prototype.toggle = function(node) {
    var layer = this.getLayer(node);
    var map = this['map'];
    if (map.getLayers().getArray().indexOf(layer) >= 0) {
      map.removeLayer(layer);
    } else {
      this.feedLayer(layer, node);
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

    layerCacheKey = type + '_' + node['layers'];
    if (layerCacheKey in layerCache_) {
      return layerCache_[layerCacheKey];
    }

    var layer;

    // Create a wms layer
    if(type == 'wms') {
      var layerOpts = {
        label: node.text,
        url: node.url,
        metadata: node.metadataUrl
      };
      if(angular.isDefined(node.TILED)) {
        layerOpts.tiled = node.TILED;
      }
      layer = this.gnMap_.createOlWMS(this.map,
        {
          'LAYERS': node.layers,
          'FORMAT': node.format || 'image/png'
        }, layerOpts
      );
    }

    else if (type == 'chart') {
      layer = new ol.layer.Image({
        label: node.text,
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

    if(node.pq_rastertype_fields) {
      layer.set('queryablepolygon', {
        pq_bandnb: node.pq_bandnb,
        pq_header: node.pq_header,
        pq_layer: node.pq_layer,
        pq_rastertype_fields: node.pq_rastertype_fields,
        pq_round: node.pq_round
      });
    }

    layer.set('metadataUuid', node.uuid);
    layer.set('queryable', node.queryable);

    layerCache_[layerCacheKey] = layer;

    return layer;
  };


  /**
   * Feed layerTree layer with info from capabilities.
   * Link the layer to a md if defined.
   *
   * @param {ol.Layer} layer ol layer.
   * @param {TreeNode} node Layer tree node info.
   */
  gn.AppCatalogController.prototype.feedLayer = function(layer, node) {

    this.gnMap_.addWmsFromScratch(this.map, node.url, node.layers, true).
    then(
      function(tmpLayer) {
        // merge properties from layertree with getCapabilities
        for(var prop in tmpLayer.getProperties()) {
          if(!layer.get(prop) && tmpLayer.get(prop)) {
            layer.set(prop, tmpLayer.get(prop));
          }
        }
        return tmpLayer;
      }, function() {
        layer.set('errors', ['not found']);
      }).
    then(function(feedLayer) {
      if(feedLayer) {
        // Load metadata object
        var md = feedLayer.get('md');
        if(!md) {
          this.gnMap_.feedLayerMd(layer);
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
    '$scope',
    'gnOwsCapabilities',
    'ngeoDecorateLayer'
  ];

})();
