(function() {

  goog.provide('app.chartlayer.service');

  var module = angular.module('app.chartlayer.service', []);

  var GETCHARTDATA_URL = 'pigeo.layers.getchartdata';
  var GEOSERVER_URL = 'http://gm-risk.pigeo.fr/geoserver-prod/gm/ows';
  GETCHARTDATA_URL =  '../../catalog/views/niger/data/getchartdata.json';

  module.service('chartlayerService', ['$http', '$q',
    function($http, $q) {

      this.colorFn = d3.scale.category20();

      this.init = function(map) {
        this.map = map;
        map.getLayers().on('add', function(e) {
          var layer = e.element;
          if(layer.get('chartconfig')) {
            this.displayChartLayer(layer);
          }
        }.bind(this));
      };

      this.getFeatures = function(layer) {
        return $http.get(GEOSERVER_URL, {
          params: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            maxFeatures: 500,
            outputFormat: layer.get('chartconfig').format == 'geojson' ?
                'application/json' : ''   ,
            typeName: layer.get('layers')
          }
        });
      };

      this.getChartData = function(layer) {
        var cfg = layer.get('chartconfig');

        return $http.get(GETCHARTDATA_URL, {
          params: {
            source: cfg.dbname,
            tables: cfg.dbtables,
            where: cfg.dbwhere,
            fields: [cfg.values_dbfield, cfg.join_dbfield,
              cfg.labels_dbfield].join('')
          }
        });
      };

      this.displayChartLayer = function(layer) {
        var cfg = layer.get('chartconfig');
        $q.all([this.getChartData(layer), this.getFeatures(layer)]).then(
            function(responses) {
              var tables, features;
              responses.forEach(function(response) {
                if(response.config.url == GETCHARTDATA_URL) {
                  tables = response.data;
                } else {
                  //features = new ol.format.GeoJSON().readFeatures(response.data);
                  features = response.data;
                }
              }.bind(this));
              this.buildCharts(cfg, features, tables);
            }.bind(this)
        );
      };

      this.buildCharts = function (layerConfig, geo, dataset){
        var params = layerConfig;
        this.chartconfig = layerConfig;
        var features = geo;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d[params.values_dbfield]; });

        var cc = params.colorcodes, colorCodes;
        if (cc) {
          if (cc.substring(0,1)!="(") {
            if (cc.substring(0,1)!="{") {
              cc = "{"+cc+"}";
            }
            cc = "("+cc+")";
          }
          try {
            colorCodes = eval(cc);
          } catch (err) {
            console.log(err);
          }
        }

        var chartLvls = [],
            scales = params.changescales ? params.changescales.split(',').map(Number) : null,
            layers = params.layers.split(",");

        scales.unshift(Infinity);
        layers.forEach(function(layer, idx) {
          var l = layer.replace("gm:", "");
          var fts = geo.features.filter(function (el, i, arr) {
            return (el.id.substr(0, l.length) == l);
          });

          var svgSublayer = {
            geofeatures: null,
            data: null,
            graphics: null,
            svg_level: null,
            svg_features: null,
            svg_graphics: null
          };

          chartLvls.push(svgSublayer);
          svgSublayer.geofeatures = fts;
          svgSublayer.data = dataset.table[idx].features.record;

          svgSublayer.data.forEach(function (d) {
            d[params.values_dbfield] = +d[params.values_dbfield];
            d[params.labels_dbfield] = d[params.labels_dbfield];
            d[params.join_dbfield] = +d[params.join_dbfield];
          });
        }.bind(this));

        var canvasFunction = function(extent, resolution, pixelRatio, size, projection) {
          var width = size[0],
              height = size[1];

          var canvas = d3.select(document.createElement('canvas'));
          canvas.attr('width', width)
              .attr('height', height);

          var context = canvas.node().getContext('2d');

          var d3Projection = d3.geo.mercator().scale(1).translate([0, 0]);
          var d3Path = d3.geo.path().projection(d3Projection);

          var pixelBounds = d3Path.bounds(features);
          var pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
          var pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];

          var geoBounds = d3.geo.bounds(features);
          var geoBoundsLeftBottom = ol.proj.transform(
              geoBounds[0], 'EPSG:4326', projection);
          var geoBoundsRightTop = ol.proj.transform(
              geoBounds[1], 'EPSG:4326', projection);
          var geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
          if (geoBoundsWidth < 0) {
            geoBoundsWidth += ol.extent.getWidth(projection.getExtent());
          }
          var geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

          var widthResolution = geoBoundsWidth / pixelBoundsWidth;
          var heightResolution = geoBoundsHeight / pixelBoundsHeight;
          var r = Math.max(widthResolution, heightResolution);
          var scale = r / (resolution / pixelRatio);

          var center = ol.proj.transform(ol.extent.getCenter(extent),
              projection, 'EPSG:4326');
          d3Projection.scale(scale).center(center)
              .translate([width / 2, height / 2]);

          d3Path = d3Path
              .projection(d3Projection)
              .context(context);

          d3Path(features);
          context.stroke();

          // compute current scale
          var units = projection.getUnits();
          var dpi = 25.4 / 0.28;
          var mpu = ol.proj.METERS_PER_UNIT[units];
          var scale = resolution * mpu * 39.37 * dpi;
          var zoomIdx = 0;

          scales.some(function(s, i, a) {
            if(scale < s && scale > a[i+1]) {
              zoomIdx = i;
              return true;
            }
          });

          var lvl = chartLvls[zoomIdx];

          lvl.geofeatures.forEach(function(f) {
            var pos = d3Projection(f.geometry.coordinates);
            var geo = f.properties;
            var data = pie(lvl.data.filter(function(d) {
                  return d[params.join_dbfield] == geo[params.join_geofield];
                }
            ));

            context.beginPath();
            data.forEach(function(arc) {
              var size = eval(params.chartsize);
              var color = colorCodes && colorCodes[arc.data.ocsol_code] ||
                  this.colorFn(arc.data.ocsol_code);

              context.fillStyle = color;
              context.lineWidth = 0;
              context.beginPath();
              context.moveTo(pos[0], pos[1]);
              context.arc(pos[0], pos[1], size, arc.startAngle, arc.endAngle);
              context.lineTo(pos[0], pos[1]);
              context.fill();
              context.closePath();
            }.bind(this));
          }.bind(this));

          return canvas[0][0];
        };

        var layer = new ol.layer.Image({
          source: new ol.source.ImageCanvas({
            canvasFunction: canvasFunction.bind(this),
            projection: 'EPSG:3857'
          })
        });
        this.map.addLayer(layer);
      };

      this.getColor = function(idx) {
        if (this.color==null) {
          this.color=d3.scale.category20();
        }
        if (this.colorcodes) {
          if (this.colorcodes[idx]) {
            return this.colorcodes[idx];
          }
        }
        //default
        return this.color(idx)
      };
    }]);
})();