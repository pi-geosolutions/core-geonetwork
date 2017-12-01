(function() {

  goog.provide('app.adminunits');

  var module = angular.module('app.adminunits', []);

  var SERVICE_URL = 'pigeo.adminunit/';

  gn.adminunitsDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=appAdminUnitsMap'
      },
      controllerAs: 'ctrl',
      bindToController: true,
      controller: 'AppAdminunitsController'
    };
  };
  module.directive('appAdminUnits', gn.adminunitsDirective);


  gn.AdminunitsController = function($http, $q, gnGlobalSettings, gnViewerSettings) {

    var loc = {};
    var promises = [];
    var adminUnitsNames = gnViewerSettings.ui.auList;

    adminUnitsNames.forEach(function(adminType, lvl) {
      var url = SERVICE_URL + adminType + '/';
      promises.push($http.get(url).then(function(response) {
        var values = [];
        response.data.forEach(function(au) {
          values.push({
            name: au.name,
            id: au.id,
            gid: au.gid,
            lvl: lvl,
            up: au.up_id,
            extent: ol.proj.transformExtent([
              au.xmin,
              au.ymin,
              au.xmax,
              au.ymax
            ], 'EPSG:4326', this.map.getView().getProjection())
          });
        }.bind(this));
        loc[adminType] = values;
      }.bind(this)));
    }.bind(this));

    gnViewerSettings.adminunitsPromise = $q.all(promises);
    gnViewerSettings.adminunits = loc;
  };

  module.controller('AppAdminunitsController',
      gn.AdminunitsController);

  gn.AdminunitsController['$inject'] = [
    '$http', '$q', 'gnGlobalSettings',
    'gnViewerSettings'
  ];

})();