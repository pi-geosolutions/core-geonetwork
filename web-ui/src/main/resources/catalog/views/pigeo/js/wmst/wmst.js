(function() {

  goog.provide('app.wmst');

  var module = angular.module('app.wmst', []);


  /**
   * Directive
   *
   */
  gn.timesliderDirective = function() {
    return {
      restrict: 'E',
      scope: {
        layer: '<appTimesliderLayer'
      },
      controller: 'AppTimesliderController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/pigeo/js/wmst/slider.html'
    };
  };

  module.directive('appTimeslider', gn.timesliderDirective);

  /**
   * Controller
   * @constructor
   */
  gn.TimesliderController = function($scope, wmstService) {
    var timeP = wmstService.parseCap(this.layer);

    if(timeP.start) {
      this.type = 'interval';
      this.startUTC = getUTCDate(timeP.start);
      this.endUTC = getUTCDate(timeP.end);
      this.stepMs = timeP.step.as('milliseconds');
      this.dates = wmstService.getAllDatesAsIso(timeP.start, timeP.end, timeP.step);
    }
    else if (timeP.list) {
      this.type = 'list';
      this.dates = timeP.list;
    }

    $scope.$watch(function() {
      return this.curDateUTC;
    }.bind(this), function(date) {
      if(date) {
        this.onDateChange(date);
      }
    }.bind(this));

  };

  gn.TimesliderController.prototype.onDateChange = function(date) {
    this.curDateIso = new Date(parseInt(date)).toISOString();
    this.layer.getSource().updateParams({
      TIME:  this.curDateIso
    });
  };

  gn.TimesliderController.prototype.onAnimatorChange = function(index) {
    var dateISO = this.dates[index];
    this.layer.getSource().updateParams({
      TIME:  dateISO
    });

  };

  gn.TimesliderController['$inject'] = [
    '$scope',
    'wmstService'
  ];

  module.controller('AppTimesliderController', gn.TimesliderController);


  var ISO_DURATION_REGEX = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
  var getDuration = function(pattern) {
    var matches = pattern.match(ISO_DURATION_REGEX);
    return moment.duration({
      years: parseFloat(matches[3]),
      months: parseFloat(matches[5]),
      weeks: parseFloat(matches[7]),
      days: parseFloat(matches[9]),
      hours: parseFloat(matches[12]),
      minutes: parseFloat(matches[14]),
      seconds: parseFloat(matches[16])
    });
  };

  var getUTCDate = function(date) {
    return Date.UTC(
      date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  };

  /**
   * Service
   * @param $timeout
   * @constructor
   */
  gn.AppWmstService = function($timeout) {
  };


  gn.AppWmstService.prototype.parseCap = function(layer) {

    var timeSpec = layer.get('time');

    // list
    if(timeSpec.length > 1 || timeSpec[0].indexOf('/') < 0) {
      return {
        list: timeSpec
      };
    }

    // intervals
    timeSpec = timeSpec[0];
    if(timeSpec.indexOf('/') > 0) {
      var seq = timeSpec.split('/'),
        initDate, endDate, step;

      if(seq.length > 1) {
        initDate = new Date(seq[0]);
        endDate = new Date(seq[1]);
      }
      if(seq.length > 2) {
        step = getDuration(seq[2]);
      }
      return {
        start: initDate,
        end: endDate,
        step: step
      };
    }
  };

  gn.AppWmstService.prototype.getAllDatesAsIso = function(start, end, step) {
    var startUTC = getUTCDate(start);
    var endUTC = getUTCDate(end);
    var stepMs = step.as('milliseconds');
    var dates = [];
    while(startUTC < endUTC) {
      dates.push(new Date(startUTC).toISOString());
      startUTC += stepMs;
    }
    return dates;
  };

  gn.AppWmstService['$inject'] = [
    '$timeout'
  ];

  module.service('wmstService', gn.AppWmstService);

})();
