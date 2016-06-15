(function() {

  goog.provide('app.formatter');

  var module = angular.module('app.formatter', []);

  var FORMATTER_URL = 'md.format.xml?xsl=pigeo_simple_view&uuid=';

  gn.formatterDirective = function() {
    return {
      restrict: 'A',
      scope: {
        md: '=appFormatterMd'
      },
      controller: 'AppFormatterController',
      controllerAs: 'ctrl',
      bindToController: true

    };
  };
  module.directive('appFormatter', gn.formatterDirective);


  gn.formatterController = function($element, $scope, $rootScope, $http, $compile, $sce,
                                    gnPopup, appGridService, appResultviewFns) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$compile = $compile;
    this.$sce = $sce;
    this.gnPopup = gnPopup;
    this.url = FORMATTER_URL + this.md.getUuid();

    $scope.md = this.md;
    appGridService.feedMd($scope);
    $scope.resultviewFns = appResultviewFns;

    $element.on('click', function(e) {
      e.preventDefault();
      this.load();
      $scope.$apply();
    }.bind(this))
  };

  gn.formatterController.prototype.load = function() {
    this.$rootScope.$broadcast('mdLoadingStart');

    var newscope = this.$scope.$new();
    var md = this.md;

    this.$http.get(this.url).then(function(response) {
      this.$rootScope.$broadcast('mdLoadingEnd');

      var mdHtml = this.$compile(angular.element(response.data))(this.$scope);

      var popup = this.gnPopup.create({
        title: md.title || md.defaultTitle,
        content: mdHtml.prop('outerHTML'),
        className: 'app-mdview'
      }, this.$scope);

      gnFormatter.formatterOnComplete();
      popup.element.on('click', function(e) {
        $('.app-mdview').css('z-index',  '10000');
        popup.element.css('z-index',  '10001');
      });

    }.bind(this), function() {
      this.$rootScope.$broadcast('mdLoadingEnd');
    }.bind(this));
  };
  gn.formatterController['$inject'] = ['$element',
    '$scope', '$rootScope', '$http', '$compile', '$sce', 'gnPopup',
    'appGridService', 'appResultviewFns'
  ];

  module.controller('AppFormatterController',
      gn.formatterController);

})();