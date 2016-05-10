
(function() {

  goog.provide('app.admin.geoportal');

  goog.require('app.admin.layertreemanager');

  var module = angular.module('app.admin.geoportal',
      ['app.admin.layertreemanager']);

  // add pigeo locale file for admin content
  module.config(['$LOCALES',
    function($LOCALES) {
      $LOCALES.push('pigeo');
    }]);

  /**
   * Geoportal admin main controller.
   * Manage the tab layout of the geoportal admin page.
   */
  module.controller('AppAdminGeoportalController', [
    '$scope',
    function($scope) {

      // Manage the admin tabs layout
      $scope.pageMenu = {
        folder: '../../views/niger/js/admin/',
        defaultTab: 'adminlayertreemanager',
        tabs: [{
          type: 'adminlayertreemanager',
          label: 'managelayertree',
          icon: 'fa-sitemap',
          href: '#/geoportal/adminlayertreemanager'
        }]
      };
    }]);

})();
