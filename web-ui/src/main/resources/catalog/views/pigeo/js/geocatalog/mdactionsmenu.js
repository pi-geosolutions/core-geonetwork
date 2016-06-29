(function() {

  goog.provide('app.mdactionsmenu');

  var module = angular.module('app.mdactionsmenu', []);


  module.directive('appMdActionsMenu', ['gnMetadataActions', '$http',
    '$location', 'Metadata',
    function(gnMetadataActions, $http, $location, Metadata) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/views/pigeo/js/geocatalog/mdactionsmenu.html',
        link: function linkFn(scope, element, attrs) {
          scope.mdService = gnMetadataActions;
          scope.md = scope.$eval(attrs.appMdActionsMenu);
          if (!scope.md) {
            var url = $location.url();
            var uuid = url.substring(url.lastIndexOf('/') + 1);
            $http.get('q?_uuid=' + uuid + '&fast=index&_content_type=json&buildSummary=false').success (function (resp) {
              scope.md = new Metadata(resp.metadata);
              //sxtService.feedMd(scope);
            });
          }
        }
      };
    }
  ]);
})();