/*
 * Copyright (C) 2014 Jean Pommier, PI-geosolutions
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 * 
 * Contact: jean.pommier@pi-geosolutions.fr
 */
Ext.namespace('GeoNetwork.layers');


/** api: (define)
 *  module = GeoNetwork.layers
 *  class = GeoportalChartLayer
 */
/** api: constructor 
 *  .. class:: GeoportalChartLayer(config)
 *
 *  Create a Chart layer helper class for the Geoportal
 *  to manage everything around the layer : edit, load, etc
 *
 */


GeoNetwork.layers.GeoportalChartLayer = Ext.extend(GeoNetwork.layers.GeoportalAbstractLayer, {
    template : {
		type:"chart",
		text:"new chart layer",
		opacity:1,
		cls:'',
		qcktip : 'here come your comments about the layer',
		extensions: '',
		url:'http://gm-risk.pigeo.fr/geoserver-prod/gm/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=500&outputFormat=application/json&typeName=',
		layers:'region_layer,district_layer,local_layer',
		changescales : '250000,100000,0',
		format:"geojson",
		legend : '',
		join_geofield : '',
		dbname : 'gm_risk_geodata',
		dbtables : 'reg_table,district_table,local_table',
		join_dbfield : '',
		values_dbfield : '',
		labels_dbfield : '',
		dbwhere : '',
		charttype : 'pie',
		colorcodes : '',
		chartsize : 30,
		checked:false,
		leaf:true
    },

    gpid:3,
    type: 'chart',
      
	
	/** private: method[constructor] 
     */
    constructor: function(config) {
    	GeoNetwork.layers.GeoportalChartLayer.superclass.constructor.call(this, config);
        Ext.apply(this, config);
        this.gpid = Math.round(Math.random() * 10000000);
    },
	
	/** private: method[initComponent] 
     */
   /* initComponent: function(config){
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.layers.GeoportalChartLayer.superclass.initComponent.call(this);
                
    },*/

    /*
     * Admin section : display the form and manage the config
     */
    getForm: function(conf) {
    	if (this.form) this.form.destroy();
    	this.form = new GeoNetwork.layers.GeoportalChartLayerForm(conf);
    	return this.form;
    },
    
    /*
     * OpenLayers (client) section : display the charts
     */
    svg:null,
    color : null,
    colorcodes : null,
    bounds:null,
    chartconfig:null,
    overlay:null,
    chartrep: null,
    chart_levels: null,
    
    setMap: function(map) {
    	this.map = map;
    },
    
    getMap: function(map) {
		return this.map;
    },
    
    getColor: function(idx) {
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
	},
    
    getOverlay: function(config) {
    	if (this.map==null) {
    		console.log("map is not set, can't load the chart"+ config.text);
    		return null;
    	}
    	this.chartconfig = config;
    	if (this.colorcodes==null) {
			if (config.colorcodes!="") {
				if (config.colorcodes.substring(0,1)!="(") { //an object must be surrounded by parenthesis to be properly eval(ed)
					if (config.colorcodes.substring(0,1)!="{") { //an object must be surrounded by parenthesis to be properly eval(ed)
						config.colorcodes = "{"+config.colorcodes+"}";
					}
					config.colorcodes = "("+config.colorcodes+")";
				}
				try {
					this.colorcodes = eval(config.colorcodes);
					
				} catch (err) {
					console.log(err);
				}
			}
    	}

    	var me = this;
    	if (this.overlay==null) {
	    	this.overlay = new OpenLayers.Layer.Vector(config.text, {
				visibility:false
				, gpconfig:config
				, visibility:(config.checked==true?true:false)
				, opacity : (config.opacity===null?'1.0':config.opacity)
				, isGeoportalNativeLayer : true
				, uuid : config.uuid //if set, links the layer with its metadata
				, legend : config.legend //if set, links the layer with an image legend
				, eventListeners: {
					'visibilitychanged': function(evt) {
						if ((this.visibility) && (!this.gpconfig.loaded))
							me.loadChart(this);
	
					}
				}
			});
    	}
    	return this.overlay;
    },
    
	/*
	 * Loads svg into the empty overlay chart layer.
	 */
	loadChart: function(overlay) {
		//console.log("loading chart");
		var params = overlay.gpconfig;

    	//console.log(this.chartconfig);
				
		var geo_url = params.url + params.layers;
		var data_url = "http://localhost:8080/geonetwork/srv/eng/pigeo.layers.getchartdata.json?source="+params.dbname+"&tables="+params.dbtables+"&where="+params.dbwhere+"&fields="+params.values_dbfield+","+params.join_dbfield+","+params.labels_dbfield;
		queue()
		.defer(d3.json, geo_url)
		.defer(d3.json, data_url)
		.await(this.buildCharts.bind(this)); //bind(this) assures the 'this' will refer to the current class
	},
	
	buildCharts: function (error, geo, dataset){
		var params = this.chartconfig;
		//console.log(this);
		
		var layers = params.layers.split(",");
		if (layers.length==1) {
			this.buildChartsSingle(error,geo,dataset);
			return true;
		}
		
		
		
		
		var me=this;
		if (error) return console.log("there was an error loading the data: " + error);

		var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d[params.values_dbfield]; });
		
		var div = d3.selectAll("#" + this.overlay.div.id.replace(/\./g,'\\.'));
		div.selectAll("svg").remove();
		this.svg = div.append("svg");
		g = this.svg.append("g")
				.attr("class", "pies")

		var bounds = d3.geo.bounds(geo),
		path = d3.geo.path().projection(this.project);
		var bufferedBounds = [[bounds[0][0] + 0.5*(bounds[0][0] - bounds[1][0]), bounds[0][1] + 0.5*(bounds[0][1] - bounds[1][1])],
		                      [bounds[1][0] + 0.5*(bounds[1][0] - bounds[0][0]), bounds[1][1] + 0.5*(bounds[1][1] - bounds[0][1])]];
		bounds = bufferedBounds;
		this.bounds = bufferedBounds;

		this.chart_levels = new Array();
		layers.forEach(function(layer,idx) {
			//filter the geojson features depending on the layer they come from (they came all together)
			var l = layer.replace("gm:",""); //trim the gm: prefix
			var fts = geo.features.filter(function(el, i, arr) {
				return (el.id.substr(0,l.length) == l);
			});
			
			var svgSublayer = new GeoNetwork.layers.ChartSvgSublayer();
			this.chart_levels.push(svgSublayer);
			svgSublayer.geofeatures = fts;
			/*
			 * prepare the datasets
			 */
			svgSublayer.data =  dataset.table[idx].features.record;
			
			svgSublayer.data.forEach(function(d) {
				d[params.values_dbfield] = +d[params.values_dbfield];
				d[params.labels_dbfield] = +d[params.labels_dbfield];
				d[params.join_dbfield] = +d[params.join_dbfield];
			});
			svgSublayer.svg_level = g.append("g")
				.attr("class", "pieslevel")
				.attr("id", l);
			svgSublayer.svg_features = svgSublayer.svg_level.selectAll("g.pie")
				.data(svgSublayer.geofeatures, function(d) {return d.properties[params.join_geofield];});
			
			svgSublayer.svg_graphics = svgSublayer.svg_features.enter()
				.append("g") 
				.attr("class", "pie")
				.attr("transform", function(d) { var xy = me.project(d.geometry.coordinates); return "translate("+xy[0]+","+xy[1]+")"; })
				.each(makePies);
			
			function makePies(geo) {
				var g = d3.select(this).selectAll(".arc")
					.data(pie(svgSublayer.data.filter(function(d) {
						//console.log(d);
						//console.log(parent);
						return d[params.join_dbfield]==geo.properties[params.join_geofield]})))
					.enter().append("g")
						.attr("class", "arc");

				g.append("path")
					.attr("d", d3.svg.arc()
						.outerRadius(function (d) {
							//return params.chartsize //Math.round(Math.sqrt(100 + geo.properties.SUM_HHS / 50))
							var size=10;
							try {
								size = eval(params.chartsize);
								if (isNaN(size)) throw "The expression could be resolved without explicit error but the result is NaN. Probably the fields used in the expression are not correctly specified";
							} catch (err) {
								size=30;
								console.log("error calculating 'size' expression : "+params.chartsize+"\nError msg: "+err);
							}
							return size;
						})
						.innerRadius(0))
						.style("fill", function(d) { return me.getColor(d.data[params.labels_dbfield]); });
			};
		}, this);

		this.map.events.register("moveend", this.map, this.reset.bind(this));

		this.reset();
	},	

	reset: function () {
		var bottomLeft = this.project(this.bounds[0]),
		topRight = this.project(this.bounds[1]);

		this.svg.attr("width", topRight[0] - bottomLeft[0])
			.attr("height", bottomLeft[1] - topRight[1])
			.style("margin-left", bottomLeft[0] + "px")
			.style("margin-top", topRight[1] + "px");
		
		g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
		console.log(this.chart_levels);
		
		this.chart_levels.forEach( function (level, idx) {
			var me = this;
			level.svg_graphics.attr("transform", function(d) { var xy = me.project(d.geometry.coordinates); return "translate("+xy[0]+","+xy[1]+")"; });
		}, this)
	},
	
	project: function(x) {
		var point = this.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(x[0], x[1])
						.transform("EPSG:4326", "EPSG:900913"));
		return [point.x, point.y];
	},

	
	buildChartsSingle: function (error, geo, dataset){
		console.log("loading single level chart");
		var me=this;
		if (error) return console.log("there was an error loading the data: " + error);

		var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d[params.values_dbfield]; });

		var params = this.chartconfig;
		console.log(this);
		//console.log(overlay);
		//console.log(geo);
		//console.log(data);
		data = dataset.table[0].features.record;
		
		data.forEach(function(d) {
			d[params.values_dbfield] = +d[params.values_dbfield];
			d[params.labels_dbfield] = +d[params.labels_dbfield];
			d[params.join_dbfield] = +d[params.join_dbfield];
		});
		var div = d3.selectAll("#" + this.overlay.div.id.replace(/\./g,'\\.'));
		div.selectAll("svg").remove();
		var svg = div.append("svg");
		g = svg.append("g")
				.attr("class", "pies")

		var bounds = d3.geo.bounds(geo),
		path = d3.geo.path().projection(project);
		var bufferedBounds = [[bounds[0][0] + 0.5*(bounds[0][0] - bounds[1][0]), bounds[0][1] + 0.5*(bounds[0][1] - bounds[1][1])],
		                      [bounds[1][0] + 0.5*(bounds[1][0] - bounds[0][0]), bounds[1][1] + 0.5*(bounds[1][1] - bounds[0][1])]];
		bounds = bufferedBounds;
		var features = g.selectAll("g.pie")
						.data(geo.features, function(d) {return d.properties[params.join_geofield];});

		var graphics = features.enter()
								.append("g") 
								.attr("class", "pie")
								.attr("transform", function(d) { return "translate("+project(d.geometry.coordinates)[0]+","+project(d.geometry.coordinates)[1]+")"; })
								.each(makePies);


		this.map.events.register("moveend", this.map, reset);

		reset();

		function reset() {

			var bottomLeft = project(bounds[0]),
			topRight = project(bounds[1]);

			svg.attr("width", topRight[0] - bottomLeft[0])
				.attr("height", bottomLeft[1] - topRight[1])
				.style("margin-left", bottomLeft[0] + "px")
				.style("margin-top", topRight[1] + "px");

			g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

			graphics.attr("transform", function(d) { return "translate("+project(d.geometry.coordinates)[0]+","+project(d.geometry.coordinates)[1]+")"; });
		}
		function project(x) {
			var point = me.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(x[0], x[1])
							.transform("EPSG:4326", "EPSG:900913"));
			return [point.x, point.y];
		}


		function makePies(geo) {
			var g = d3.select(this).selectAll(".arc")
			.data(pie(data.filter(function(d) {
				//console.log(d);
				//console.log(parent);
				return d[params.join_dbfield]==geo.properties[params.join_geofield]})))
				.enter().append("g")
				.attr("class", "arc");

			g.append("path")
			.attr("d", d3.svg.arc()
					.outerRadius(function (d) {
						//return params.chartsize //Math.round(Math.sqrt(100 + geo.properties.SUM_HHS / 50))
						var size=10;
						try {
							size = eval(params.chartsize);
							if (isNaN(size)) throw "The expression could be resolved without explicit error but the result is NaN. Probably the fields used in the expression are not correctly specified";
						} catch (err) {
							size=30;
							console.log("error calculating 'size' expression : "+params.chartsize+"\nError msg: "+err);
						}
						return size;
					})
					.innerRadius(0))
					.style("fill", function(d) { return me.getColor(d.data[params.labels_dbfield]); });
		};
	}

});

/*
 * Private
 */
GeoNetwork.layers.ChartSvgSublayer = Ext.extend(Ext.util.Observable, {
	geofeatures : null,
	data : null,
	graphics : null,
	svg_level:null,
	svg_features:null,
	svg_graphics:null
});



/** api: xtype = gn_layers_geoportalchartlayer */
Ext.reg('gn_layers_geoportalchartlayer', GeoNetwork.layers.GeoportalChartLayer);