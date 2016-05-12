(function() {

  goog.provide('app.animator');

  var module = angular.module('app.animator', []);

  gn.animatorDirective = function() {
    return {
      restrict: 'E',
      scope: {
        list: '=appAnimatorList',
        onchangeFn: '&appAnimatorOnchange'
      },
      controller: 'AppAnimatorController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/niger/js/animation/animator.html'
    };
  };
  module.directive('appAnimator', gn.animatorDirective);

  gn.AnimatorController = function($http, $scope, $timeout) {
    this.$timeout = $timeout;
    this.playing = false;
    this.promise;

    $scope.$watch(function(){
      return this.list;
    }.bind(this), function(list) {
      this.index = 0;
    }.bind(this));

    $scope.$watch(function(){
      return this.index;
    }.bind(this), function(index) {
      this.onchangeFn({index: index});
    }.bind(this));

  };

  gn.AnimatorController.prototype.next = function() {
    if(++this.index >= this.list.length) {
     this.first();
    }
  };
  gn.AnimatorController.prototype.previous = function() {
    if(--this.index < 0) {
      this.last();
    }
  };
  gn.AnimatorController.prototype.last = function() {
    this.index = this.list.length-1;
  };
  gn.AnimatorController.prototype.first = function() {
    this.index = 0;
  };
  gn.AnimatorController.prototype.previous = function() {
    if(--this.index < 0) {
      this.last();
    }
  };

  gn.AnimatorController.prototype.play = function(backward) {
    this.modeBackward = backward;
    if(!this.playing) this.applyNextValue_();
    this.playing = true;
  };

  gn.AnimatorController.prototype.stop = function() {
    var promise = this.promise;
    this.playing = false;
    if (promise) {
      this.$timeout.cancel(promise);
      this.promise = undefined;
    }
  };

  gn.AnimatorController.prototype.applyNextValue_ = function() {
    if(this.modeBackward) this.previous();
    else this.next();
    this.promise = this.$timeout(this.applyNextValue_.bind(this), 1000);
  };

  module.controller('AppAnimatorController',
    gn.AnimatorController);

  gn.AnimatorController['$inject'] = [
    '$http', '$scope', '$timeout'
  ];

})();