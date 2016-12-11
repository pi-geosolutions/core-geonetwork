(function() {

  goog.provide('app.wmst');
  goog.require('app.wmst.imageloader');

  var module = angular.module('app.wmst', ['app.wmst.imageloader']);


  /**
   * Directive
   *
   */
  gn.timesliderDirective = function() {
    return {
      restrict: 'E',
      scope: {
        layer: '<appTimesliderLayer',
        map: '<appTimesliderMap'
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
  gn.TimesliderController = function($scope, wmstService, wmstImageLoader,
                                     gnUrlUtils) {
    this.$scope = $scope;
    this.wmstImageLoader = wmstImageLoader;
    this.gnUrlUtils = gnUrlUtils;

    window.map = this.map;

    this.loader = {
      current: {
        loaded: false,
        images: []
      },
      full: {
        loaded: false,
        images: []
      },
      isFull: false
    };

    this.wmsSource = this.layer.getSource();
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
    if(!this.loader.isFull) {
      this.layer.getSource().updateParams({
        TIME:  dateISO
      });
    }
    else if(this.loader.full.loaded) {
      var size = [291, 350];
      var sourceConfig = {
        size: size,
        url: this.loader.full.images[index].src,
        imageExtent: this.layer.get('cextent'),
        projection: this.map.getView().getProjection()
      };
      this.layer.setSource(new ol.source.ImageStatic(sourceConfig));
    }
  };

  gn.TimesliderController.prototype.loadImages = function(isFull) {

    var map = this.map,
      layer = this.layer,
      extent, loader;

    this.loader.isFull = isFull;
    this.imageLoaderProgress = 0;

    if(isFull) {
      loader = this.loader.full;
      extent = layer.get('cextent');

      if (!this.loader.full.url) {

        var image = this.wmsSource.getImage(
          extent,
          map.getView().getResolution(),
          1,
          map.getView().getProjection());

        var urlA = image.src_.split('?');
        var params = this.gnUrlUtils.parseKeyValue(urlA[1]);
        delete params.TIME;
        var size = [291, 350];
        angular.merge(params, {
          BBOX: this.layer.get('cextent').join(),
          WIDTH: size[0],
          HEIGHT: size[1]
        });
        this.loader.full.url = this.gnUrlUtils.append(urlA[0],
          this.gnUrlUtils.toKeyValue(params));
      }
    } else {
      loader = this.loader.current;
      extent = map.getView().calculateExtent(map.getSize());
      this.layer.setSource(this.wmsSource);
    }

    var loadCounter = this.dates.length;
    var unBindKey = this.layer.getSource().on('imageloadend', function(e) {
      this.$scope.$apply(function(){
        if(!--loadCounter) {
          loader.loaded = true;
          ol.Observable.unByKey(unBindKey);
        }
        this.imageLoaderProgress =
          (this.dates.length - loadCounter) * 100 / this.dates.length;

      }.bind(this));
    }.bind(this));

    this.dates.forEach(function(d) {
      if(!isFull) {
        this.wmsSource.updateParams({
          TIME:  d,
          FORMAT: 'image/png8'
        });

        var image = this.wmsSource.getImage(
          extent,
          map.getView().getResolution(),
          1,
          map.getView().getProjection());
        loader.images.push(image);
        image.load();
      }
      else {
        var img = new Image();
        img.src = this.loader.full.url + '&TIME=' + d;
        loader.images.push(img);
        img.onload = function() {
          this.$scope.$apply(function(){
            if(!--loadCounter) {
              loader.loaded = true;
              ol.Observable.unByKey(unBindKey);
            }
            this.imageLoaderProgress =
              (this.dates.length - loadCounter) * 100 / this.dates.length;

          }.bind(this));

        }.bind(this);
      }
    }.bind(this));

    if(!isFull) {
      map.getView().once(['change:center', 'change:resolution'], function(e) {
        console.log('change');
        loader.loaded = false;
        this.imageLoaderProgress = 0;
        this.$scope.$apply();
      }.bind(this));
    }
  };

  gn.TimesliderController['$inject'] = [
    '$scope',
    'wmstService',
    'wmstImageLoader',
    'gnUrlUtils'
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
