(function() {

  goog.provide('app.layermanager');

  var module = angular.module('app.layermanager', []);

  gn.layermanagerDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=appLayermanagerMap',
        'layers': '=appLayermanagerLayers'
      },
      controller: 'UnLayermanagerController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/niger/js/layermanager/' +
      'layermanager.html'
    };
  };

  module.directive('appLayermanager', gn.layermanagerDirective);

  gn.LayermanagerController = function($scope, ngeoSyncArrays) {
    var $this = this;
    this['uid'] = goog.getUid(this);
    this.opacities_ = {};
    this.selectedLayers = this.layers;
  };


  gn.LayermanagerController.prototype.removeLayer = function(layer) {
    this['map'].removeLayer(layer);
  };

  gn.LayermanagerController.prototype.changeVisibility = function(layer) {
    var currentOpacity = layer.getOpacity();
    var newOpacity;
    var uid = goog.getUid(layer);
    if (currentOpacity === 0) {
      if (angular.isDefined(this.opacities_[uid])) {
        newOpacity = this.opacities_[uid];
      } else {
        newOpacity = 1;
      }
      // reset old opacity for later use
      delete this.opacities_[uid];
    } else {
      this.opacities_[uid] = currentOpacity;
      newOpacity = 0;
    }
    layer.setOpacity(newOpacity);
  };

  gn.LayermanagerController.prototype.zoomToExtent = function(layer) {
    this['map'].getView().fit(layer.get('cextent'),
        this['map'].getSize());
  };


  gn.LayermanagerController['$inject'] = [
    '$scope',
    'ngeoSyncArrays'
  ];

  module.controller('UnLayermanagerController', gn.LayermanagerController);

})();