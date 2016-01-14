(function() {

  goog.provide('app.admin.layertree');
  
  var module = angular.module('app.admin.layertree', []);

  gn.layertreeDirective = function($compile) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: '../../catalog/views/niger/js/admin/adminlayertree.html',
      controller: 'AdminLayertreeController',
      compile: 
          function(tElement, tAttrs) {
            var contents = tElement.contents().remove();
            var compiledContents;
            return (
                function(scope, iElement, iAttrs) {
                  if (!compiledContents) {
                    compiledContents = $compile(contents);
                  }
                  compiledContents(scope,
                      function(clone) {
                        iElement.append(clone);
                      });
                });
          }
    };
  };

  module.directive('adminLayertree', ['$compile', gn.layertreeDirective]);

  gn.LayertreeController = function($scope, $element, $attrs) {
  
    var isRoot = !goog.isDef($attrs['adminLayertreeNotroot']);
    this.isRoot = isRoot;

    this.layer = isRoot ? null :
        $scope.$eval(nodelayerExpr, {'node': this.node});

    var nodeExpr = $attrs['adminLayertree'];

    this.node = undefined;
  
    if (isRoot) {
      $scope.$watch(nodeExpr, goog.bind(function(newVal, oldVal) {
        this.node = newVal;
      }, this));
    } else {
      this.node = ($scope.$eval(nodeExpr));
    }
    
    var nodelayerExpr = $attrs['adminLayertreeNodelayer'];
    if (!goog.isDef(nodelayerExpr)) {
      var nodelayerexprExpr = $attrs['adminLayertreeNodelayerexpr'];
      nodelayerExpr = $scope.$eval(nodelayerexprExpr);
    }
  
    this.nodelayerExpr = nodelayerExpr;
    this.layer = isRoot ? null :
        ($scope.$eval(nodelayerExpr, {'node': this.node}));
    
    this.parentUid = $scope.$parent.uid;
    this.uid = goog.getUid(this);
    this.depth = isRoot ? 0 : $scope.$parent.depth + 1;
  
    $scope.uid = this.uid;
    $scope.depth = this.depth;
    $scope.layertreeCtrl = this;
  };

  gn.LayertreeController.prototype.toggleNode = function(evt) {
    if(this.node.children) {
      var el = $(evt.target);
      if(el.is('i')) {
        el = el.parent();
      }
      el.find('.fa').first().toggleClass('fa-minus-square')
          .toggleClass('fa-plus-square');

      el.find('.fa').last().toggleClass('fa-folder')
          .toggleClass('fa-folder-open');
    }
  };
    
  module.controller('AdminLayertreeController',
      gn.LayertreeController);

  gn.LayertreeController['$inject'] = [
    '$scope',
    '$element',
    '$attrs'
  ];

  /**
   * Backups list directive
   */
  module.directive('piBackupList', ['$http', '$translate' , function($http, $translate) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: '../../catalog/views/niger/js/admin/backuplist.html',
      link: function(scope) {

        var addToLog = scope.addToLog;

        var loadList = function() {
          return $http.get('pigeo.layertree.admin.backups.list@json').then(function(response) {
            scope.backuplist = response.data[0];
            addToLog('backuplistloadsuccess', 'success');
          }, function() {
            addToLog('backuplistloadfailure', 'danger');
          });
        };

        scope.removeBackup = function(id) {
          return $http.get('pigeo.layertree.admin.backups.remove@json', {
            params: {id: id}
          }).then(function(response) {
            if(response.data[0] == "true") {
              addToLog($translate('backupremovesuccess', {id:id}), 'success');
              loadList();
            }
            else {
              addToLog($translate('backupremovefailure', {id:id}), 'danger');
            }
          }, function() {
            addToLog($translate('backupremovefailure', {id:id}), 'danger');
          });
        };

        loadList();
      }
    };
  }]);

  module.directive('jsonText', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        function removeParent(node) {
          delete node.parent;
          if(node.children) {
            node.children.forEach(function(n) {
              removeParent(n);
            });
          }
        };
        function out(data) {
          var tree = angular.copy(data);
          removeParent(tree);
          return JSON.stringify(tree);
        }
        ngModel.$formatters.push(out);
      }
    };
  });

})();