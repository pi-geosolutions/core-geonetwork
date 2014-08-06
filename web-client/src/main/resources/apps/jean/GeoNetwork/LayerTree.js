/*
 * Copyright (C) 2013 Jean Pommier
 * jean.pommier@ige.fr
 */
/**
 * @include GeoExt/widgets/tree/TreeNodeUIEventMixin.js
 */
Ext.namespace('GeoNetwork.Geoportal');
//var activeIndex = 0;


//create application
GeoNetwork.Geoportal.LayerTree = function() {
	// private vars:
	var layertree, jsontree, map;

	// private functions

	/*
	 * Parses the tree config JSON data and creates the OL corresponding layers 
	 * for further load in a map
	 */
	function readLayers(mod) {
		var layers = new Array();

		//console.log(mod.length);
		for (var j=0 ; j < mod.length ; j++)
		{
			//console.log(mod[j]);
			if (mod[j].children!=null)
			{
				//console.log(mod[j].layer);
				var children = readLayers(mod[j].children);
				for (var i = 0 ; i < children.length ; i++)
					layers.push(children[i]);
			}
			else
			{
				var child = mod[j];
				var layer;
				//console.log(child.text);

				if (child.type==null || child.disabled)
					continue;

				var checked = false;
				if (child.checked===true)
					checked =true;	
				switch (child.type) {
				case "wms":
					//console.log("wms layer : "+child.layer);
					layer = new OpenLayers.Layer.WMS(child.layer, //sans s, c'est le nom, lisible, de la couche. Layers est le nom geoserver
							child.url, 
							{ 
						layers: child.layers, 
						format: child.format,
						TRANSPARENT:(child.format=="image/png"),
						TILED:(child.TILED==false?false:true) //if TILED is defined to false: false, else (to true or undefined): true.
						//,BGCOLOR: (child.bgcolor==null?'0x0033FF':child.bgcolor)
							},
							{
								isBaseLayer: false
								, transitionEffect: 'resize'
									, buffer: 0
									, visibility:checked
									, opacity : (child.opacity===null?'1.0':child.opacity)
									, isGeoportalNativeLayer : true
									, uuid : child.uuid //if set, links the layer with its metadata
									, legend : child.legend //if set, links the layer with an image legend
							}
					);
					layers.push(layer);
					break;
				case "chart":
					var overlay = new OpenLayers.Layer.Vector(child.text, {
						visibility:false,
						gpconfig:child,
						eventListeners: {
							'visibilitychanged': function(evt) {
								if ((this.visibility) && (!this.gpconfig.loaded))
									loadChart(this);

							}
						}
					});
					layers.push(overlay);
					break;
				default: 
					OpenLayers.Console.log("omitting invalid (non-wms, non-chart) layer : "+child.layer + ", "+child.type);
				break;
				}
			}
		}
		return layers;
	}

	/*
	 * Loads svg into the empty overlay chart layer.
	 */
	function loadChart(overlay) {
		console.log("loading chart");
		
		var color = d3.scale.ordinal()
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


		var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.area; });

		queue()
		.defer(d3.json, "http://gm-risk.pigeo.fr/geoserver-prod/gm/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gm:c_1c5_districts_pts&maxFeatures=500&outputFormat=application/json")
		.defer(d3.json, "http://localhost/d3dev/data_json.php")
		.await(function (error, geo, data){
			if (error) return console.log("there was an error loading the data: " + error);

			//console.log(overlay);
			//console.log(geo);
			//console.log(data);

			data.forEach(function(d) {
				d.ocsol_code = +d.ocsol_code;
				d.code = +d.code;
				d.area = +d.area;
			});
			var div = d3.selectAll("#" + overlay.div.id.replace(/\./g,'\\.'));
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
							.data(geo.features, function(d) {return d.properties.DCODE;});

			var graphics = features.enter()
									.append("g") 
									.attr("class", "pie")
									.attr("transform", function(d) { return "translate("+project(d.geometry.coordinates)[0]+","+project(d.geometry.coordinates)[1]+")"; })
									.each(makePies);


			map.events.register("moveend", map, reset);

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
				var point = map.getViewPortPxFromLonLat(new OpenLayers.LonLat(x[0], x[1])
								.transform("EPSG:4326", "EPSG:900913"));
				return [point.x, point.y];
			}


			function makePies(geo) {
				var g = d3.select(this).selectAll(".arc")
				.data(pie(data.filter(function(d) {
					//console.log(d);
					//console.log(parent);
					return d.code==geo.properties.DCODE})))
					.enter().append("g")
					.attr("class", "arc");

				g.append("path")
				.attr("d", d3.svg.arc()
						.outerRadius(function (d) {
							return Math.round(Math.sqrt(100 + geo.properties.SUM_HHS / 50))
						})
						.innerRadius(0))
						.style("fill", function(d) { return color(d.data.ocsol_code); });
			};

		});



		/*var url="http://gm-risk.pigeo.fr/geoserver-prod/gm/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gm:c_1c5_districts_pts&maxFeatures=500&outputFormat=application/json";
		d3.json(url, function(error, collection) {
            var div = d3.selectAll("#" + overlay.div.id.replace(/\./g,'\\.'));
            console.log(div);
            div.selectAll("svg").remove();
            var svg = div.append("svg");
            g = svg.append("g");

            var bounds = d3.geo.bounds(collection),
            path = d3.geo.path().projection(project);

            var feature = g.selectAll("path")
                .data(collection.features)
                .enter().append("path")
                .attr("d", path.pointRadius(10));

            map.events.register("moveend", map, reset);
            reset();

            function reset() {
                var bottomLeft = project(bounds[0]),
                    topRight = project(bounds[1]);
                svg.attr("width", topRight[0] - bottomLeft[0])
                    .attr("height", bottomLeft[1] - topRight[1])
                    .style("margin-left", bottomLeft[0] + "px")
                    .style("margin-top", topRight[1] + "px");
                g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
                feature.attr("d", path);
            }

            function project(x) {
                var point = map.getViewPortPxFromLonLat(new OpenLayers.LonLat(x[0], x[1])
                    .transform("EPSG:4326", "EPSG:900913"));
                return [point.x, point.y];
            }

            overlay.gpconfig.loaded=true;
        });*/
	}

	/*
	 * Loads layers from JSON config data
	 * and then loads the layers in the map
	 */
	function loadLayersFromConfigTree (treeconf) {
		//console.log("using treeconf");
		//console.log(treeconf);
		var layers = readLayers(treeconf);
		//console.log("read layers. Adding them to the map");
		//console.log(map);
		for (var i = 0 ; i < layers.length ; i++)
			map.addLayer(layers[i]);
	}


	// public space:
	return {
		init: function(treeconf, maptolink) {
			map = maptolink;
			jsontree = new OpenLayers.Format.JSON().write(treeconf);
			if (map===null || jsontree===null) {
				console.warn("unable to load the json tree (geoportal tree)");
			} else {
				// We need to load the layers in the map before making the tree (nodes are defined 
				// as gx_nodes, and thus have to be linked to an already existing map layer
				loadLayersFromConfigTree(treeconf);
				this.setTree();
			}

			/*setTimeout(function () {
	        	setTree(treeconf);
            }, 2000);*/
		},

		setTree: function() {

			var LayerNodeUI = Ext.extend(
					GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin() 
			);

			var mytreeloader = new Ext.tree.TreeLoader({//KEEP IN SYNC WITH THE ONE IN lAYERTREEMANAGERPANEL.JS
				// applyLoader has to be set to false to not interfer with loaders
				// of nodes further down the tree hierarchy
				applyLoader: false,
				uiProviders: {
					"layernodeui": LayerNodeUI //Ca n'a pas l'air d'être pris en compte : on n'a pas de TreeNodeUIEventMixin (pas d'evt onRenderNode)
				},
				// this below is using the config attributes of the node to do
				// some testing. The attr.has_events is coming from the loader in PHP
				createNode: function(attr) {
					if (attr.layer && attr.text==null) { //deals with importing old-style layertree.js file
						attr.text = attr.layer;
						attr.leaf=true;
						if (attr.TILED==null && attr.type=="wms") attr.TILED=true;
					}
					if (attr.checked==null && attr.leaf==true) {
						attr.checked = false;
					}
					if (attr.type!='folder' && attr.type!=null) {
						attr.leaf=true;
					} else {
						attr.leaf=false;
						if (attr.children==null) { //empty folder
							//console.log(attr.text);
							attr.loaded=true;
							attr.expanded=true;
							//attr.cls='grey x-tree-node-collapsed';
							attr.iconCls='emptyFolder';
						}
					}
					if (attr.leaf!=true && attr.type==null) {
						//console.log(attr);
						attr.type='folder';
					}    	//fixes some node values

					if (attr.type=="wms" || attr.type=="chart") {
						attr.nodeType="gx_layer";
					}
					return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
				}
			});
			layertree = new Ext.tree.TreePanel({
				title:'layerTree',
				header:false,
				id: "geoportalLayerTree",
				enableDD: false,
				autoScroll:true,
				loader: mytreeloader,
				//plugins don't work because UIEventMixin won't work properly for this tree (think it is a matter of not having found how to use 
				// "layernodeui" as uiprovider for the nodes, while loading them
				/*
		        plugins: [
		            		new GeoExt.plugins.FoldableLegendPlugin({}),
		            		new GeoExt.plugins.FixLegendURLPlugin({})
            	],*/
				root: {
					nodeType: "async",
					// the children property of an Ext.tree.AsyncTreeNode is used to
					// provide an initial set of layer nodes. We use the treeConfig
					// from above, that we created with OpenLayers.Format.JSON.write.
					children: Ext.decode(jsontree)
				},
				rootVisible: false,
				border: false,
				region: 'center'			
			});
		},

		getTree: function() {
			return layertree;
		}
	};
}; // end of app
