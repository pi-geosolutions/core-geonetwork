(function() {

  goog.provide('app.query.polygon');

  var module = angular.module('app.query.polygon', []);

  var WPS_SERVER_URL = 'http://gm-risk.pigeo.fr//geoserver-prod/wps';

  gn.queryPolygonDirective = function() {
    return {
      restrict: 'E',
      scope: {
        map: '<appQueryPolygonMap',
        active: '=appQueryPolygonActive',
        vector: '<appQueryPolygonVector'
      },
      controller: 'AppQueryPolygonController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/niger/js/query/polygon.html'
    };
  };

  module.directive('appQueryPolygon', gn.queryPolygonDirective);

  gn.QueryPolygonController = function($http, $scope) {
    this.$http = $http;
    this.$scope = $scope;

    $scope.$watch(function() {
      return this.active;
    }.bind(this), function(drawActive) {
      if(angular.isDefined(drawActive)) {
        this.drawInteraction.setActive(drawActive);
        if(!drawActive) {
          this.vector.getSource().clear();
        }
      }
    }.bind(this));

    this.drawInteraction = new ol.interaction.Draw({
      type: 'Polygon',
      style: this.vector.getStyle(),
      source: this.vector.getSource()
    });
    this.map.addInteraction(this.drawInteraction);
    this.drawInteraction.setActive(false);

    this.drawInteraction.on('drawend', this.handleDrawEnd_.bind(this));
    this.drawInteraction.on('drawstart', this.handleDrawStart_.bind(this));
  };

  gn.QueryPolygonController.prototype.handleDrawEnd_ = function(e) {
    var format = new ol.format.GeoJSON();
    var geojson = format.writeFeatures([e.feature]);
    var geojsonO = JSON.parse(geojson);
    var projCode = this.map.getView().getProjection().getCode();
    var split = projCode.split(':');
    geojsonO.crs = {
      type: split[0],
      properties: {
        code: split[1]
      }
    };
    geojsonO.features[0].properties = {};

    this.callWpsRequest_(JSON.stringify(geojsonO));
  };

  gn.QueryPolygonController.prototype.handleDrawStart_ = function(e) {
    this.vector.getSource().clear();
  };

  gn.QueryPolygonController.prototype.callWpsRequest_ = function(geojson) {

    var body = formatWPSBody('gm:gm_1b1_srtm', geojson);
    this.loading = true;
    this.$http.post(WPS_SERVER_URL, body, {
      headers: {'Content-Type': 'application/xml'}
    }).then(function(response){
      this.result = response.data.features[0].properties;
    }.bind(this)).finally(function() {
      this.loading = false;
    }.bind(this));
  };

  gn.QueryPolygonController['$inject'] = [
    '$http', '$scope'
  ];

  module.controller('AppQueryPolygonController', gn.QueryPolygonController);

  // Note: prefer not to use JSONIX cause it would load a tons of useless bytes.
  // This way is much better for low connection issues.
  function formatWPSBody(layerName, geojson) {
    return '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" ' +
        'xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" ' +
        'xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" ' +
        'xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1"' +
        ' xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' +
        '  <ows:Identifier>ras:RasterZonalStatistics</ows:Identifier>' +
        '  <wps:DataInputs>' +
        '    <wps:Input>' +
        '      <ows:Identifier>data</ows:Identifier>' +
        '      <wps:Reference mimeType="image/tiff" xlink:href="http://geoserver/wcs" method="POST">' +
        '        <wps:Body>' +
        '          <wcs:GetCoverage service="WCS" version="1.1.1">' +
        '            <ows:Identifier>' + layerName + '</ows:Identifier>' +
        '            <wcs:DomainSubset>' +
        '              <gml:BoundingBox crs="http://www.opengis.net/gml/srs/epsg.xml#4326">' +
        '                <ows:LowerCorner>-16.825306042689 13.064180511176</ows:LowerCorner>' +
        '                <ows:UpperCorner>-13.797093842689 13.826650011176</ows:UpperCorner>' +
        '              </gml:BoundingBox>' +
        '            </wcs:DomainSubset>' +
        '            <wcs:Output format="image/tiff"/>' +
        '          </wcs:GetCoverage>' +
        '        </wps:Body>' +
        '      </wps:Reference>' +
        '    </wps:Input>' +
        '    <wps:Input>' +
        '      <ows:Identifier>zones</ows:Identifier>' +
        '      <wps:Data>' +
        '        <wps:ComplexData mimeType="application/json">' +
        '			<![CDATA[' + geojson + ']]>' +
        '		 </wps:ComplexData>' +
        '      </wps:Data>' +
        '    </wps:Input>' +
        '  </wps:DataInputs>' +
        '  <wps:ResponseForm>' +
        '    <wps:RawDataOutput mimeType="application/json">' +
        '      <ows:Identifier>statistics</ows:Identifier>' +
        '    </wps:RawDataOutput>' +
        '  </wps:ResponseForm></wps:Execute>';
  };
})();