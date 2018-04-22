/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

(function() {
  goog.provide('gn_wmsimport');

  var module = angular.module('gn_wmsimport', [
  ]);

  var kmlimportTemplateURL = '../../catalog/components/viewer/wmsimport/' +
    'partials/kmlimport.html';
  module.value('kmlimportTemplateURL', kmlimportTemplateURL);

  /**
   * @ngdoc directive
   * @name gn_viewer.directive:gnWmsImport
   *
   * @description
   * Panel to load WMS capabilities service and pick layers.
   * The server list is given in global properties.
   */
  module.directive('gnWmsImport', [
    'gnOwsCapabilities',
    'gnMap',
    '$translate',
    '$timeout',
    'gnSearchManagerService',
    'Metadata',
    'gnViewerSettings',
    function(gnOwsCapabilities, gnMap, $translate, $timeout,
             gnSearchManagerService, Metadata, gnViewerSettings) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/components/viewer/wmsimport/' +
        'partials/wmsimport.html',
        scope: {
          map: '=gnWmsImportMap',
          url: '=?gnWmsImportUrl'
        },
        controller: ['$scope', function($scope) {

          /**
           * Transform a capabilities layer into an ol.Layer
           * and add it to the map.
           *
           * @param {Object} getCapLayer
           * @return {*}
           */
          this.addLayer = function(getCapLayer) {
            getCapLayer.version = $scope.capability.version;
            if ($scope.format == 'wms') {
              var layer = gnMap.addWmsToMapFromCap($scope.map, getCapLayer);
              gnMap.feedLayerMd(layer);
              return layer;
            } else if ($scope.format == 'wfs') {
              var layer = gnMap.addWfsToMapFromCap($scope.map, getCapLayer,
                $scope.url);
              gnMap.feedLayerMd(layer);
              return layer;
            } else if ($scope.format == 'wmts') {
              return gnMap.addWmtsToMapFromCap($scope.map, getCapLayer,
                $scope.capability);
            }
          };
        }],
        link: function(scope, element, attrs) {
          scope.loading = false;
          scope.format = attrs['gnWmsImport'] != '' ?
            attrs['gnWmsImport'] : 'all';
          scope.serviceDesc = null;
          scope.servicesList = gnViewerSettings.servicesUrl[scope.format];
          scope.catServicesList = [];
          var type = scope.format.toUpperCase();

          function addLinks(md, type) {
            angular.forEach(md.getLinksByType(type), function(link) {
              if (link.url) {
                scope.catServicesList.push({
                  title: md.title || md.defaultTitle,
                  uuid: md.getUuid(),
                  name: link.name,
                  desc: link.desc,
                  type: type,
                  url: link.url
                });
              }
            });
          };
          // Get the list of services registered in the catalog
          if (attrs.servicesListFromCatalog) {
            // FIXME: Only load the first 100 services
            gnSearchManagerService.gnSearch({
              fast: 'index',
              _content_type: 'json',
              from: 1,
              to: 100,
              serviceType: 'OGC:WMS or OGC:WFS or OGC:WMTS'
            }).then(function(data) {
              angular.forEach(data.metadata, function(record) {
                var md = new Metadata(record);
                if (scope.format === 'all') {
                  addLinks(md, 'wms');
                  addLinks(md, 'wfs');
                } else {
                  addLinks(md, scope.format);
                }
              });
            });
          }

          scope.setUrl = function(srv) {
            scope.url = angular.isObject(srv) ? srv.url : srv;
            type = angular.isObject(srv) && srv.type || type;
            scope.serviceDesc = angular.isObject(srv) ? srv : null;
            scope.load();
          };

          scope.load = function() {
            if (scope.url) {
              scope.loading = true;
              gnOwsCapabilities['get' + type.toUpperCase() +
              'Capabilities'](scope.url).then(function(capability) {
                scope.loading = false;
                scope.capability = capability;
              });
            }
          };

          // watch url as input
          scope.$watch('url', function(value) {
            if (value) {
              scope.setUrl({
                url: value,
                type: scope.format
              });
            }
          });
        }
      };
    }]);

  /**
   * @ngdoc directive
   * @name gn_viewer.directive:gnKmlImport
   *
   * @description
   * Panel to load KML and KMZ files. You could load them with file input or
   * drag & drop them in the map.
   */

  module.directive('gnKmlImport', [
    'ngeoDecorateLayer',
    'gnAlertService',
    'kmlimportTemplateURL',
    '$translate',
    'kmzService',
    function(ngeoDecorateLayer, gnAlertService, kmlimportTemplateURL,
             $translate, kmzService) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: kmlimportTemplateURL,
        scope: {
          map: '=gnKmlImportMap'
        },
        controllerAs: 'kmlCtrl',
        controller: ['$scope', '$http', '$translate',
          function($scope, $http, $translate) {

            /**
             * Create new vector Kml file from url and add it to
             * the Map.
             *
             * @param {string} url remote url of the kml file
             * @param {ol.map} map
             */
            this.addKml = function(url, map) {

              if (url == '') {
                $scope.validUrl = true;
                return;
              }

              $http.get(gnGlobalSettings.proxyUrl + encodeURIComponent(url)).
              then(function(response) {
                var kmlSource = new ol.source.Vector();
                kmlSource.addFeatures(
                  new ol.format.KML().readFeatures(
                    response.data, {
                      featureProjection: $scope.map.getView().getProjection(),
                      dataProjection: 'EPSG:4326'
                    }));
                var vector = new ol.layer.Vector({
                  source: kmlSource,
                  getinfo: true,
                  kml: true,
                  label: $translate.instant('kmlFile',
                    {layer: url.split('/').pop()})
                });
                $scope.addToMap(vector, map);
                $scope.url = '';
                $scope.validUrl = true;

              }, function() {
                $scope.validUrl = false;
              });
            };

            $scope.addToMap = function(layer, map) {
              ngeoDecorateLayer(layer);
              layer.displayInLayerManager = true;
              map.getLayers().push(layer);
              map.getView().fit(layer.getSource().getExtent(),
                map.getSize());

              gnAlertService.addAlert({
                msg: $translate.instant('layerAdded',
                  {layer: layer.get('label')}),
                type: 'success'
              });
            };
          }],
        link: function(scope, element, attrs) {

          /** Used for ngClass of the input */
          scope.validUrl = true;

          /** File drag & drop support */
          var dragAndDropInteraction =
            new ol.interaction.DragAndDrop({
              formatConstructors: [
                ol.format.GPX,
                ol.format.GeoJSON,
                ol.format.KML,
                ol.format.TopoJSON
              ]
            });

          var onError = function(msg) {
            gnAlertService.addAlert({
              msg: $translate.instant('mapImportFailure'),
              type: 'danger'
            });
          };

          scope.map.getInteractions().push(dragAndDropInteraction);
          dragAndDropInteraction.on('addfeatures', function(event) {
            if (!event.features || event.features.length == 0) {
              onError();
              scope.$apply();
              return;
            }

            var countF = 0;
            var countG = 0;
            var features = [];
            event.features.forEach(function(f) {
              var g = f.getGeometry();
              if(f.getGeometry()) {
                if(f.getGeometry().getCoordinates()) {

                  var c = g.getCoordinates();
                  if(!angular.isArray(c[0])) {
                    // g.setCoordinates([c]);
                  }
                  else {
                    countF++;
                  }

                  if(f.getId() == 'CIS73') {
                    features.push(f);
                    var img = 'https://www.google.fr/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
                    var style = f.getStyleFunction().bind(f)()[0];
                    style.getImage().getImage().src_ = img;
                    f.setStyle(style);

                    console.log(f.getStyle())


                  }
                }
                countG++;
              }
            });

            console.log('total ', event.features.length);
            console.log('geometries ', countF);
            console.log('geometries null ', countG);

            var vectorSource = new ol.source.Vector({
              features: features,
              projection: event.projection
            });

            var layer = new ol.layer.Vector({
              source: vectorSource,
              getinfo: true,
              kml: true,
              label: $translate.instant('localLayerFile',
                {layer: event.file.name})
            });
            scope.addToMap(layer, scope.map);
            scope.$apply();
          });


          var requestFileSystem = window.webkitRequestFileSystem ||
            window.mozRequestFileSystem || window.requestFileSystem;
          var unzipProgress = document.createElement('progress');
          var fileInput = element.find('input[type="file"]')[0];

          scope.onEntryClick = function(entry, evt) {
            kmzService.model.getEntryFile(entry, function(blobURL) {

              entry.loading = true;
              scope.$apply();
              var source = new ol.source.Vector();
              $.ajax(blobURL).then(function(response) {
                var format = new ol.format.KML({
                  showPointNames: false,
                  blobImages: kmzService.imageMapping
                });
                var features = format.readFeatures(response, {
                  featureProjection: scope.map.getView().getProjection()
                });
                source.addFeatures(features);
              });

              var vector = new ol.layer.Vector({
                label: $translate.instant('localLayerFile', {
                  layer: entry.filename
                }),
                getinfo: true,
                source: source,
                kml: true
              });

              var listenerKey = vector.getSource().on('change',
                function(evt) {
                  if (vector.getSource().getState() == 'ready') {
                    vector.getSource().unByKey(listenerKey);
                    scope.addToMap(vector, scope.map);
                    entry.loading = false;
                  }
                  else if (vector.getSource().getState() == 'error') {
                  }
                  scope.$apply();
                });
            }, function(current, total) {
              unzipProgress.value = current;
              unzipProgress.max = total;
              evt.target.appendChild(unzipProgress);
            });
          };

          angular.element(fileInput).bind('change', function(changeEvent) {
            if (fileInput.files.length > 0) {
              kmzService.model.getEntries(fileInput.files[0], function(entries) {
                scope.kmzEntries = kmzService.preProcessEntries(entries);
                scope.$apply();
              });
            }
            $('#kmz-file-input')[0].value = '';
          });
        }
      };
    }]);

  /**
   * @ngdoc directive
   * @name gn_wmsimport.directive:gnCapTreeCol
   *
   * @description
   * Directive to manage a collection of nested layers from
   * the capabilities document. This directive works with
   * gnCapTreeElt directive.
   */
  module.directive('gnCapTreeCol', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          collection: '='
        },
        template: "<ul class='list-group'><gn-cap-tree-elt " +
        "ng-repeat='member in collection' member='member'>" +
        '</gn-cap-tree-elt></ul>'
      };
    }]);

  /**
   * @ngdoc directive
   * @name gn_wmsimport.directive:gnCapTreeElt
   *
   * @description
   * Directive to manage recursively nested layers from a capabilities
   * document. Will call its own template to display the layer but also
   * call back the gnCapTreeCol for all its children.
   */
  module.directive('gnCapTreeElt', [
    '$compile',
    '$translate',
    'gnAlertService',
    function($compile, $translate, gnAlertService) {
      return {
        restrict: 'E',
        require: '^gnWmsImport',
        replace: true,
        scope: {
          member: '='
        },
        template: "<li class='list-group-item' ng-click='handle($event)' " +
        "ng-class='(!isParentNode()) ? \"leaf\" : \"\"'>" +
        "<i ng-show='layer.loading' class='fa fa-refresh fa-spin pull-right'></i>" +
        "<i ng-show='layer && !layer.loading' class='fa fa-check pull-right'></i>" +
        "<label>" +
        "   <span class='fa'  ng-class='isParentNode() ? \"fa-folder-o\" :" +
        "     \"fa-plus-square-o\"'></span>" +
        '   {{member.Title || member.title}}' +
        '</label>' +
        '</li>',
        link: function(scope, element, attrs, controller) {
          var el = element;
          var select = function() {
            scope.layer = controller.addLayer(scope.member);
            gnAlertService.addAlert({
              msg: $translate.instant('layerAdded', {layer:
                (scope.member.Title || scope.member.title)
              }),
              type: 'success'
            });
          };
          var toggleNode = function() {
            el.find('.fa').first().toggleClass('fa-folder-o')
              .toggleClass('fa-folder-open-o');
            el.children('ul').toggle();
          };
          if (angular.isArray(scope.member.Layer)) {
            element.append("<gn-cap-tree-col class='list-group' " +
              "collection='member.Layer'></gn-cap-tree-col>");
            $compile(element.contents())(scope);
          }
          scope.handle = function(evt) {
            if (scope.isParentNode()) {
              toggleNode();
            } else {
              select();
            }
            evt.stopPropagation();
          };
          scope.isParentNode = function() {
            return angular.isDefined(scope.member.Layer);
          };
        }
      };
    }]);
})();
