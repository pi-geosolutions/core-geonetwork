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
      templateUrl: '../../catalog/views/niger/js/geocatalog/geocatalog.html',
      link: function(scope, element) {
        // Must trigger search to generate facet, but hide this first search
          var searchFormScope = angular.element(element.find('form')).scope();
          var unregisterFn = searchFormScope.$watch(
              'searchResults.count', function(n,o) {
            if(o <= 0) {
              searchFormScope.searchResults.records = [];
              searchFormScope.searchResults.count = 0;
            } else {
              this.showResult = true;
              unregisterFn();
            }
          }.bind(this));

      }
    };
  };
  module.directive('appGeoCatalog', gn.geoCatalogDirective);


  gn.AppGeoCatalogController = function($scope, $http, gnSearchSettings,
                                        suggestService, gnMap, appResultviewFns,
                                        $element, $timeout) {

    this.suggestService = suggestService;
    this.$http = $http;
    this.$scope = $scope;

    $scope.resultTemplate = gnSearchSettings.resultTemplate;
    $scope.searchObj = {
      params: {},
      sortbyValues: gnSearchSettings.sortbyValues,
      sortbyDefault: gnSearchSettings.sortbyDefault,
      hitsperpageValues: gnSearchSettings.hitsperpageValues,
      defaultParams: {
        'facet.q': '',
        resultType: gnSearchSettings.facetsSummaryType || 'details'
      },
      params: {
        'facet.q': '',
        resultType: gnSearchSettings.facetsSummaryType || 'details'
      }
    };

    this.facetsSummaryType = 'details';
    $scope.map = this.map;
    $scope.resultviewFns = appResultviewFns;
    this.geomRelations = ['within'];

  };

  gn.AppGeoCatalogController.prototype.getAnySuggestions = function(val) {
    var url = this.suggestService.getUrl(val, 'anylight',
        ('STARTSWITHONLY'));

    return this.$http.get(url, {
    }).then(function(res) {
      return res.data[1];
    });
  };

  gn.AppGeoCatalogController.prototype.setRelation = function(rel) {
    this.$scope.searchObj.params.relation = rel;
    this.$scope.$parent.triggerSearch();
  };

  gn.AppGeoCatalogController['$inject'] = [
    '$scope',
    '$http', 'gnSearchSettings',
    'suggestService', 'gnMap', 'appResultviewFns', '$element', '$timeout'
  ];
  module.controller('AppGeoCatalogController',
      gn.AppGeoCatalogController);

})();