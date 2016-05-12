(function() {

  goog.provide('app.animation');
  goog.require('app.animator');

  var module = angular.module('app.animation', ['app.animator']);

  var URL_CONFIG = 'pigeo.animations.list?_content_type=json';
  var URL_LIST = 'pigeo.animations.listfiles';
  var URL_IMAGE = 'pigeo.animations.getimage';

  gn.animationDirective = function() {
    return {
      restrict: 'E',
      scope: {
        map: '=appAnimationMap'
      },
      controller: 'AppAnimationController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/niger/js/animation/animation.html'
    };
  };
  module.directive('appAnimation', gn.animationDirective);

  gn.AnimationController = function($http, $scope) {

    this.$http = $http;
    this.mapProj_ = this.map.getView().getProjection();

    $scope.$watch(function() {
      return this.animation;
    }.bind(this), function(animation) {
      if(animation) {
        this.getFilesList();
      }
    }.bind(this));

    $http.get(URL_CONFIG).then(function(response) {
      this.animations = response.data[0];
      this.animation = this.animations.length && this.animations[0]
    }.bind(this));

  };

  gn.AnimationController.prototype.getFilesList = function() {
    this.$http.get(URL_LIST, {
      params: {
        dataName: this.animation.id
      }
    }).then(function(response) {
      this.filesList = response.data;
      this.storeLayerInfo_(this.animation, this.filesList);
    }.bind(this))
  };

  gn.AnimationController.prototype.storeLayerInfo_ = function(animation, list) {
    var bbox = animation.geographicbounds;
    var imagesize = animation.imagesize;
    var extent = ol.proj.transformExtent([
          parseFloat(bbox.minlon),
          parseFloat(bbox.minlat),
          parseFloat(bbox.maxlon),
          parseFloat(bbox.maxlat)],
        animation.SRS, this.mapProj_);
    var size = [parseInt(imagesize.width), parseInt(imagesize.height)];

    this.sourceConfig = {
      size: size,
      imageExtent: extent,
      projection: this.mapProj_
    };
    this.animLayer = new ol.layer.Image();
    this.map.addLayer(this.animLayer);
  };

  gn.AnimationController.prototype.onAnimatorChange = function(index) {
    this.sourceConfig.url = URL_IMAGE + '?path=' + this.filesList.path + '&fname=' +
        this.filesList.files[index];

    this.animLayer.setSource(new ol.source.ImageStatic(this.sourceConfig));

    //TODO wait for resfresh function
    // this.animLayer.getSource().refresh();
  };

  module.controller('AppAnimationController',
      gn.AnimationController);

  gn.AnimationController['$inject'] = [
    '$http', '$scope'
  ];

})();