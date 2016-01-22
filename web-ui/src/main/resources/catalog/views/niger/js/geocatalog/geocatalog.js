(function() {

  goog.provide('app.geocatalog');

  var module = angular.module('app.geocatalog', []);

  gn.geoCatalogDirective = function() {
    return {
      restrict: 'E',
      scope: {
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