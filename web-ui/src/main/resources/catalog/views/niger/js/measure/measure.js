(function() {

  goog.provide('app.measure');

  var module = angular.module('app.measure', []);

  var WPS_SERVER_URL = 'http://gm-risk.pigeo.fr//geoserver-prod/wps';

  gn.measureToolsDirective = function() {
    return {
      restrict: 'E',
      scope: {
        map: '<appMeasureToolsMap',
        active: '=appMeasureToolsActive'
      },
      controller: 'AppMeasureController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/niger/js/measure/measure.html'
    };
  };

  module.directive('appMeasureTools', gn.measureToolsDirective);

  gn.MeasureController = function($sce, $scope, $translate, $compile,
                                  ngeoDecorateInteraction) {

    this.measureStartMsg = $sce.trustAsHtml($translate('measureStart'));
    this.measureLengthContinueMsg = $sce.trustAsHtml($translate('measureLengthContinue'));
    this.measureAreaContinueMsg = $sce.trustAsHtml($translate('measureAreaContinue'));
    this.measureAzimutContinueMsg = $sce.trustAsHtml($translate('measureZimutContinue'));

    // Create elements for the measure tools' tooltips.
    var measureStartMsg = angular.element(
        '<span ng-bind-html="ctrl.measureStartMsg"></span>');
    measureStartMsg = $compile(measureStartMsg)($scope);
    var measureLengthContinueMsg = angular.element(
        '<span ng-bind-html="ctrl.measureLengthContinueMsg"></span>');
    measureLengthContinueMsg = $compile(measureLengthContinueMsg)($scope);
    var measureAreaContinueMsg = angular.element(
        '<span ng-bind-html="ctrl.measureAreaContinueMsg"></span>');
    measureAreaContinueMsg = $compile(measureAreaContinueMsg)($scope);
    var measureAzimutContinueMsg = angular.element(
        '<span ng-bind-html="ctrl.measureAzimutContinueMsg"></span>');
    measureAzimutContinueMsg = $compile(measureAzimutContinueMsg)($scope);

    var style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    });

    var map = this.map;

    this.measureLength = new ngeo.interaction.MeasureLength({
      sketchStyle: style,
      startMsg: measureStartMsg[0],
      continueMsg: measureLengthContinueMsg[0]
    });

    var measureLength = this.measureLength;
    measureLength.setActive(false);
    ngeoDecorateInteraction(measureLength);
    map.addInteraction(measureLength);

    this.measureArea = new ngeo.interaction.MeasureArea({
      sketchStyle: style,
      startMsg: measureStartMsg[0],
      continueMsg: measureAreaContinueMsg[0]
    });

    var measureArea = this.measureArea;
    measureArea.setActive(false);
    ngeoDecorateInteraction(measureArea);
    map.addInteraction(measureArea);

    this.measureAzimut = new ngeo.interaction.MeasureAzimut({
      sketchStyle: style,
      startMsg: measureStartMsg[0],
      continueMsg: measureAzimutContinueMsg[0]
    });

    var measureAzimut = this.measureAzimut;
    measureAzimut.setActive(false);
    ngeoDecorateInteraction(measureAzimut);
    map.addInteraction(measureAzimut);

    $scope.$watch(function() {
      return this.active;
    }.bind(this), function(active) {
      if(active === false) {
        this.measureAzimut.setActive(false);
        this.measureArea.setActive(false);
        this.measureLength.setActive(false);
      }
    }.bind(this));
  };


  gn.MeasureController['$inject'] = [
    '$sce', '$scope', '$translate', '$compile', 'ngeoDecorateInteraction'
  ];

  module.controller('AppMeasureController', gn.MeasureController);

})();