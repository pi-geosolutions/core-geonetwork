(function() {
  goog.provide('gn_localisation_directive');

  var module = angular.module('gn_localisation_directive', [
  ]);

  /**
   * @ngdoc directive
   * @name gn_viewer.directive:gnLocalisationInput
   *
   * @description
   * Panel to load WMS capabilities service and pick layers.
   * The server list is given in global properties.
   */
  module.directive('gnLocalisationInput', [
    '$timeout',
    'gnGlobalSettings',
    'gnViewerSettings',
    function($timeout, gnGlobalSettings, gnViewerSettings) {
      return {
        restrict: 'A',
        require: 'gnLocalisationInput',
        replace: true,
        templateUrl: '../../catalog/components/viewer/localisation/' +
            'partials/localisation.html',
        scope: {
          map: '='
        },
        controllerAs: 'locCtrl',
        controller: ['$scope', '$http', 'gnGetCoordinate',
          function($scope, $http, gnGetCoordinate) {

            $scope.modelOptions =
                angular.copy(gnGlobalSettings.modelOptions);

            var zoomTo = function(extent, map) {
              map.getView().fit(extent, map.getSize());
            };
            this.onClick = function(loc, map) {
              zoomTo(loc.extent, map);
              $scope.query = loc.name;
              $scope.collapsed = true;
            };

            /**
             * Request geonames search. Trigger when user changes
             * the search input.
             *
             * @param {string} query string value of the search input
             */
            this.search = function(query) {
              if (query.length < 3) return;

              var coord = gnGetCoordinate(
                  $scope.map.getView().getProjection().getWorldExtent(), query);

              if (coord) {
                function moveTo(map, zoom, center) {
                  var view = map.getView();

                  view.setZoom(zoom);
                  view.setCenter(center);
                }
                moveTo($scope.map, 5, ol.proj.transform(coord,
                    'EPSG:4326', 'EPSG:3857'));
                return;
              }
              var formatter = function(loc) {
                var props = [];
                ['toponymName', 'adminName1', 'countryName'].
                    forEach(function(p) {
                      if (loc[p]) { props.push(loc[p]); }
                    });
                return (props.length == 0) ? '' : '—' + props.join(', ');
              };

              //TODO: move api url and username to config
              var url = 'http://api.geonames.org/searchJSON';
              $http.get(url, {
                params: {
                  lang: 'fr',
                  style: 'full',
                  type: 'json',
                  maxRows: 20,
                  name_startsWith: query,
                  username: 'pigeo_ilwac',
                  country: 'NE'
                }
              }).
                  success(function(response) {
                    var loc;
                    $scope.results = [];
                    for (var i = 0; i < response.geonames.length; i++) {
                      loc = response.geonames[i];
                      if (loc.bbox) {
                        $scope.results.push({
                          name: loc.name,
                          formattedName: formatter(loc),
                          extent: ol.proj.transformExtent([loc.bbox.west,
                            loc.bbox.south, loc.bbox.east, loc.bbox.north],
                          'EPSG:4326', 'EPSG:3857')
                        });
                      }
                    }
                  });
            };

            //specific pigeo
            var adminDepth = -1;
            var locs;
            gnViewerSettings.adminunitsPromise.then(function(){
              locs = gnViewerSettings.adminunits;
              this.adminUnits = [];
              angular.forEach(locs, function(value, key) {
                this.adminUnits.push({
                  choice: '',
                  name: key,
                  lvl: ++adminDepth,
                  values: value
                });
              }.bind(this));
            }.bind(this));

            this.filterLowerAdmin_ = function(unit) {
              if (unit.lvl < adminDepth) {
                for (var i = unit.lvl+1; i <= adminDepth; i++) {
                  var au = this.adminUnits[i];
                  au.values = locs[au.name].filter(function(item) {
                    return item['up' + (i - unit.lvl)] == unit.id;
                  });
                }
              }
            };

            this.adminSelect = function(adminUnit) {
              this.filterLowerAdmin_(adminUnit);
              zoomTo(adminUnit.extent, $scope.map);
              this.adminUnits.some(function(unit) {
                if(unit.lvl == adminUnit.lvl) {
                  unit.choice = adminUnit.name;
                  return true;
                }
              }.bind(this));
            };
            // end specific pigeo
          }],


        link: function(scope, element, attrs, ctrl) {

          /** localisation text query */
          scope.query = '';

          scope.collapsed = true;

          /** default localisation */
          scope.localisations = gnViewerSettings.localisations;

          /** Clear input and search results */
          scope.clearInput = function() {
            scope.query = '';
            scope.results = [];

          };

          // Bind events to display the dropdown menu
          element.find('input').bind('focus', function(evt) {
            scope.$apply(function() {
              ctrl.search(scope.query);
              scope.collapsed = false;
            });
          });

          element.on('keydown', 'input', function(e) {
            if (e.keyCode === 40) {
              $(this).parents('.search-container')
                .find('.dropdown-menu a').first().focus();
            }
          });

          element.on('keydown', 'a', function(e) {
            if (e.keyCode === 40) {
              var links = $(this).parents('.search-container')
                  .find('.dropdown-menu a');
              $(links[links.index(this)]).focus();
            }
          });

          ['click', 'pointerdrag'].forEach(function(event) {
            scope.map.on(event, function() {
              scope.$apply(function() {
                $(':focus').blur();
                scope.collapsed = true;
              });
            });
          });
        }
      };
    }]);
})();
