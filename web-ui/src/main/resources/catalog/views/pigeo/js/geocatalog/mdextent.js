(function() {

  goog.provide('app.mdextent');

  var module = angular.module('app.mdextent', []);

  function getRandomColor() {
    var color = [],
        min = 0, max = 255;
    for (var i = 0; i < 3; i++ ) {
      color.push(Math.floor(Math.random() * (max - min)) + min);
    }
    return color;
  }

  function setAlpha(color, alpha) {
    return [color[0], color[1], color[2], alpha];
  }

  function toRgb(color) {
    return 'rgb(' + color.join(',') + ')';
  }

  gn.mdExtentDirective = function(gnMap) {
    return {
      restrict: 'A',
      scope: {
        md: '=appMdExtentMd'
      },
      require: '^^appGeoCatalog',
      link: function(scope, element, attrs, geoCatctrl) {

        var fo = geoCatctrl.fo;
        var map = geoCatctrl.map;
        var md = scope.md;
        var proj = map.getView().getProjection();

        var mdColor = getRandomColor();
        md.extentColor = toRgb(mdColor);
        var style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: setAlpha(mdColor, 1),
            width: 2
          }),
          fill: new ol.style.Fill({
            color: setAlpha(mdColor, 0)
          })
        });


        if(!fo) {
          fo = new ol.layer.Vector({
            source: new ol.source.Vector(),
            map: map
          });
          geoCatctrl.fo = fo;
        }

        var feat = gnMap.getBboxFeatureFromMd(md, proj);
        feat.setStyle(style);
        fo.getSource().addFeature(feat);

        element.bind('mouseenter', function() {
          style.getFill().setColor(setAlpha(mdColor, 0.5));
          fo.changed();
        });

        element.bind('mouseleave', function() {
          style.getFill().setColor(setAlpha(mdColor, 0));
          fo.changed();
        });
        element.bind('dblclick', function() {
            map.getView().fit(
                feat.getGeometry().getExtent(),
                map.getSize());
        });

        scope.$on('aftersearch', function() {
          fo.getSource().clear();
        });
      }
    };
  };
  module.directive('appMdExtent', ['gnMap', gn.mdExtentDirective]);

})();