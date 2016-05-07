(function() {

  goog.provide('app.geocatalog');
  goog.require('app.mdextent');

  var module = angular.module('app.geocatalog', ['app.mdextent']);

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
                                        suggestService) {

    this.suggestService = suggestService;
    this.$http = $http;

    $scope.resultTemplate = gnSearchSettings.resultTemplate;
    $scope.searchObj = {
      params: {},
      sortbyValues: gnSearchSettings.sortbyValues,
      sortbyDefault: gnSearchSettings.sortbyDefault,
      hitsperpageValues: gnSearchSettings.hitsperpageValues
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
    'suggestService'
  ];
  module.controller('AppGeoCatalogController',
      gn.AppGeoCatalogController);

})();