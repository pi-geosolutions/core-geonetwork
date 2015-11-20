(function() {

  goog.provide('gn_search_niger');

  goog.require('gn_search');
  goog.require('gn_search_niger_config');
  goog.require('app.bglayer');


  var module = angular.module('gn_search_niger',[
    'gn_search',
    'gn_search_niger_config',
    'app.bglayer'
  ]);

  gn.MainController = function($scope) {

    this.siteTitle = 'gam-dris';
    this.siteSubTitle = 'Risk Management Portal for Gambia';

    this.setMap_();
  };

  gn.MainController.prototype.setMap_ = function() {

    this.map = new ol.Map({
      view: new ol.View({
        center: [2081543.807860756, 1688640.2681711826],
        zoom: 6
      }),
      controls: [
        new ol.control.Zoom({
          zoomInTipLabel: 'Zoom avant',
          zoomOutTipLabel: 'Zoom arrière'
        }),
        new ol.control.ZoomToExtent({
          extent: this.defaultExtent_,
          tipLabel: 'Emprise globale',
          className: 'un-zoom-extent',
          label:$(
              '<span class="fa fa-globe"></span>')}),

        new ol.control.FullScreen({
          tipLabel: 'Plein écran',
          className: 'un-full-screen',
          label:$(
              '<span class="fa fa-arrows-alt"></span>')})
      ]
    });

    var map = this.map;
  };

  gn.MainController.prototype.closeSidebar = function() {
    this.layersOpen = false;
    this.contextOpen = false;
    this.printOpen = false;
    this.drawOpen = false;
    this.importOpen = false;
  };
  gn.MainController.prototype.sidebarOpen = function() {
    return this.layersOpen || this.contextOpen || this.printOpen ||
        this.drawOpen || this.importOpen;
  };

  gn.MainController.prototype.showTab = function(selector) {
    $(selector).tab('show');
  };

  module.controller('MainController', gn.MainController);
  gn.MainController['$inject'] = [
    '$scope'
  ];

})();
