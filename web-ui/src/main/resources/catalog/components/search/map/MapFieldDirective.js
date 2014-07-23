(function() {
  goog.provide('gn_map_field_directive');

  angular.module('gn_map_field_directive', [
  ])
      .directive('gnMapField', [
        function() {
          return {
            restrict: 'A',
            templateUrl: '../../catalog/components/search/map/' +
                'partials/mapfield.html',
            scope: {
              map: '=gnMapField'
            },
            controller: ['$scope', 'goDecorateInteraction',
              function($scope, goDecorateInteraction) {
                var map = new ol.Map({
                  layers: [
                    new ol.layer.Tile({
                      source: new ol.source.OSM()
                    })
                  ],
                  view: new ol.View({
                    center: [-10997148, 4569099],
                    zoom: 1
                  })
                });
                $scope.map = map;
              }],
            link: function(scope, element, attrs) {

              scope.zoom = function(delta) {
                scope.map.getView().setZoom(scope.map.getView().getZoom()+ delta);
              };
              scope.maxExtent = function() {
                scope.map.getView().setZoom(0);
              }
            }
          };
        }])
      .directive('gnDrawBboxBtn', [
        'goDecorateInteraction',
        '$parse',
        'gnOlStyles',
        'gnMap',
        function(goDecorateInteraction, $parse, gnOlStyles, gnMap) {
          return {
            restrict: 'A',
            scope: true,
            controller: ['$scope', function($scope) {
              var dragbox = new ol.interaction.DragBox({
                style: gnOlStyles.bbox
              });
              goDecorateInteraction(dragbox, $scope.map);
              $scope.interaction = dragbox;
            }],
            link: function(scope, element, attrs) {

              // Assign drawn extent to given scope property
              var bboxGet = $parse(attrs['gnDrawBboxBtn']);
              var bboxSet = bboxGet.assign;

              // Create overlay to persist the bbox
              var feature = new ol.Feature();
              var featureOverlay = new ol.FeatureOverlay({
                style: gnOlStyles.bbox
              });
              featureOverlay.setMap(scope.map);
              featureOverlay.addFeature(feature);

              scope.interaction.on('boxend', function(mapBrowserEvent) {
                scope.$apply(function() {
                  feature.setGeometry(scope.interaction.getGeometry());

                  // Write the extent as 4326 WKT polygon
                  var lonlatFeat, writer, wkt;
                  lonlatFeat = feature.clone();
                  lonlatFeat.getGeometry().transform('EPSG:3857', 'EPSG:4326');
                  writer = new ol.format.WKT();
                  wkt = writer.writeFeature(lonlatFeat);
                  bboxSet(scope.$parent, wkt);
                });
              });

              // Remove the bbox when the interaction is not active
              scope.$watch('interaction.active', function(v){
                if(!v) {
                  feature.setGeometry(null);
                  bboxSet(scope.$parent, '');
                  scope.map.render();
                }
              })
            }
          };
        }])
})();
