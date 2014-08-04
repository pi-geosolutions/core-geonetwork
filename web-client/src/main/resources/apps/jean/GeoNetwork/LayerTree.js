/*
 * Copyright (C) 2013 Jean Pommier
 * jean.pommier@ige.fr
 */
 /**
  * @include GeoExt/widgets/tree/TreeNodeUIEventMixin.js
  */
Ext.namespace('GeoNetwork.Geoportal');
//var activeIndex = 0;


// create application
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
	    				/*var url = "http://localhost:8080/geonetwork/srv/eng/pigeo.layers.getchartdata.json?";
	    				url+= "source="+child.source;
	    				url+= "&tables="+child.tablenames;
	    				url+= "&fields="+child.charting_fields;*/
	    				/*d3.xml(url, "application/xml", function(xml) {
	    					console.log(xml);
	    					return true;
	    				});*/
	    				var url="http://gm-risk.pigeo.fr/geoserver-prod/gm/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gm:c_1c5_districts_pts&maxFeatures=500&outputFormat=application/json";
	    				var overlay = new OpenLayers.Layer.Vector(child.text, {
							visibility:false,
							eventListeners: {
								'visibilitychanged': function(evt) {
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
					                });
								}
							}
	    				});
	    				layers.push(overlay);
	    				/*var context =  {
					    		                getSize: function(feature) {
					    		                	var size = 20;
					    		                    return size ;
					    		                },
					    		                getChartURL: function(feature) {
									                var values = "";      //we're going to list the fields defined in the "charting_fields" param
									                for (var i=0 ; i < child.charting_fields.length ; i++) {
									                	values += feature.attributes[child.charting_fields[i]] + ',';
									                }
									                values = values.substr(0, values.length-1); // we remove the last comma
									                var size = 100;
									                var charturl = 'http://chart.apis.google.com/chart?cht=p&chd=t:' + values + '&chs=' + size + 'x' + size + '&chf=bg,s,ffffff00';
									                return charturl;
									            }
				    		            };
	    				OpenLayers.Util.extend(context, child.context);
	    		    	var template = {
											pointRadius: "${getSize}",
											fillOpacity: 0.8,
											externalGraphic: "${getChartURL}"
		    		            		};
	    		    	OpenLayers.Util.extend(template, child.template );
	    		    	
	    		    	// We define scale-based rules to determine which level of data (region, circle, commune) will be displayed.
	    		    	// a Rule without any style additional info suffices : any item out of the rules is filtered away
	    		    	var the_rules = [];
	    		    	if (child.changeScales!==null) {
	    		    		for (var i = 0 ; i < child.changeScales.length; i++) {
	    		    			var r = new OpenLayers.Rule({
						             minScaleDenominator: child.changeScales[i],
						             filter : new OpenLayers.Filter.Comparison({
						            	 type: OpenLayers.Filter.Comparison.EQUAL_TO,
						            	 property: "table",
						            	 value: child.tablenames[i]
						             })
						         });
	    		    			if (i > 0) {
	    		    				r.maxScaleDenominator = child.changeScales[i-1];
	    		    			}
	    		    			the_rules.push(r);
	    		    		}
	    		    	}
	    		    	var style = new OpenLayers.Style(template, {context: context ,rules: the_rules});
	    		    	var m_styleMap = new OpenLayers.StyleMap({'default': style, 'select': {fillOpacity: 0.7}});
	    		    	
	    		    	var field_list = (child.charting_fields.concat(child.other_fields)).join(",");
	    		    	var tables_list = child.tablenames.join(",");
	    		    	var geom_field = child.geom_field || "the_geom";
	    		    	var url = child.url + "?tables="+tables_list+"&fields="+field_list+"&geom_field="+geom_field;
	    				
	    		    	layer = new OpenLayers.Layer.Vector( child.layer, {
	    						protocol: new OpenLayers.Protocol.HTTP({
	    		                    url: url
	    		                    ,format: new OpenLayers.Format.GeoJSON()
			    		    		//,format: OpenLayers.Format.GeoJSON
	    						})
		    		    		,styleMap: m_styleMap
		    		    		,isBaseLayer: false
								,visibility:checked
								,uuid:child.uuid
								,projection: new OpenLayers.Projection("EPSG:4326")
								, legend : child.legend //if set, links the layer with its legend (image)
	    		                ,strategies: [new OpenLayers.Strategy.Fixed()]
    					});
	    				layers.push(layer);*/
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
