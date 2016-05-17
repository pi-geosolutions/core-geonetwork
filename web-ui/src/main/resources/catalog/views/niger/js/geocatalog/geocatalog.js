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
                                        suggestService, gnMap, appResultviewFns) {

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
    $scope.resultviewFns = appResultviewFns;
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
    'suggestService', 'gnMap', 'appResultviewFns'
  ];
  module.controller('AppGeoCatalogController',
      gn.AppGeoCatalogController);

})();