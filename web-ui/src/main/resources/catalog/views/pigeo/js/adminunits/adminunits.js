(function() {

  goog.provide('app.adminunits');

  var module = angular.module('app.adminunits', []);

  var serviceUrl = 'pigeo.adminunit/';

  var getNodeText = function(htmlParentNode, nodeName) {
    var parent = $(htmlParentNode);
    return $(parent.find(nodeName)).text();
  };

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
    var adminUnitsNames = gnViewerSettings.auList;

    adminUnitsNames.forEach(function(adminType, lvl) {
      var url = serviceUrl + adminType + '/';
      promises.push($http.get(url).then(function(response) {
        var values = [];
        response.data.forEach(function(au) {
          values.push({
            name: au.name,
            id: au.gid,
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

/*
        var doc = ol.xml.parse(response.data);
        var nodes = doc.getElementsByTagName('emprise');
        for(var i = 0; i < nodes.length ; i ++) {
          var node = nodes.item(i);
          values.push({
            name: getNodeText(node, 'nom'),
            up: getNodeText(node, 'up'),
            up1: getNodeText(node, 'up1'),
            up2: getNodeText(node, 'up2'),
            id: node.getAttribute('id'),
            lvl: lvl,
            extent: ol.proj.transformExtent([
              parseFloat(getNodeText(node, 'xUL')),
              parseFloat(getNodeText(node, 'yLR')),
              parseFloat(getNodeText(node, 'xLR')),
              parseFloat(getNodeText(node, 'yUL'))
            ], 'EPSG:4326', this.map.getView().getProjection())
          });
        }
*/
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