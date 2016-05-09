(function() {

  goog.provide('app.geocatalog');
  goog.require('app.mdextent');
  goog.require('app.formatter');
  goog.require('app.linksbtn');

  var module = angular.module('app.geocatalog', [
    'app.mdextent', 'app.formatter', 'app.linksbtn']);

  gn.geoCatalogDirective = function() {
    return {
      restrict: 'E',
      scope: {
        map: '=appGeoCatalogMap'
      },
      controller: 'AppGeoCatalogController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/niger/js/geocatalog/geocatalog.html'
    };
  };
  module.directive('appGeoCatalog', gn.geoCatalogDirective);


  gn.AppGeoCatalogController = function($scope, $http, gnSearchSettings,
                                        suggestService, gnMap) {

    this.suggestService = suggestService;
    this.$http = $http;

    $scope.resultTemplate = gnSearchSettings.resultTemplate;
    $scope.searchObj = {
      params: {},
      sortbyValues: gnSearchSettings.sortbyValues,
      sortbyDefault: gnSearchSettings.sortbyDefault,
      hitsperpageValues: gnSearchSettings.hitsperpageValues
    };

    var map = this.map;
    $scope.resultviewFns = {
      addMdLayerToMap: function(link, md) {

        var loadLayerPromise = gnMap.addWmsFromScratch(map,
            link.url, link.name, undefined, md).then(function(layer) {
          if(layer) {
            gnMap.feedLayerWithRelated(layer, link.group);
          }
        });
      },
      addAllMdLayersToMap: function (layers, md) {
        angular.forEach(layers, function (layer) {
          $scope.resultviewFns.addMdLayerToMap(layer, md);
        });
      }
    };

  };

  gn.AppGeoCatalogController.prototype.getAnySuggestions = function(val) {
    var url = this.suggestService.getUrl(val, 'anylight',
        ('STARTSWITHONLY'));

    return this.$http.get(url, {
    }).then(function(res) {
      return res.data[1];
    });
  };

  gn.AppGeoCatalogController['$inject'] = [
    '$scope',
    '$http', 'gnSearchSettings',
    'suggestService', 'gnMap'
  ];
  module.controller('AppGeoCatalogController',
      gn.AppGeoCatalogController);

})();