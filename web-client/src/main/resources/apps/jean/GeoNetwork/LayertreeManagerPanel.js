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
Ext.namespace('GeoNetwork.admin');


/** api: (define)
 *  module = GeoNetwork.admin
 *  class = LayertreeManagerPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: LayertreeManagerPanel(config)
 *
 *  Create a GeoNetwork layertree manager panel
 *  to view, order, edit or add nodes in the geoportal widget's layers tree
 *
 */
//Overrides
Ext.tree.TreePanel.nodeTypes.gx_layer = Ext.tree.TreeNode;
Ext.tree.TreePanel.nodeTypes.gx_baselayercontainer = Ext.tree.TreeNode;


GeoNetwork.admin.LayertreeManagerPanel = Ext.extend(Ext.Panel, {
    frame: false,
    defaultConfig: {
        title: OpenLayers.i18n('Manage Layertree'),
        defaultViewMode: 'simple',
        border: false,
        height: 800,
        layout:'border',
        autoWidth : true
    },
    
    treeView:null,
    detailView:null,
    consoleView : null,
    
    /** private: method[initComponent] 
     *  Initializes the layertree manager panel.
     *  
     *  TODO : Add a refresh action (after import)
     *  TODO : init type of directory by URL parameter
     */
    initComponent: function(config){
    
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.admin.LayertreeManagerPanel.superclass.initComponent.call(this);
        
        // Build the layout
        this.detailView = new Ext.Panel({
            region: 'east',
            split: true,
            collapsible: true,
            collapsed: false,
            hideCollapseTool: true,
            collapseMode: 'mini',
            autoScroll: true,
            minWidth: 250,
            width: '50%',
            items: null
        });
        this.treeView = new Ext.Panel({
                region: 'center',
                split: true,
                autoScroll: true,
                minHeigth: 300,
                items: null
            });
        this.consoleView = new Ext.Panel({
                region: 'south',
                split: true,
                collapsible: true,
                collapsed: false,
                hideCollapseTool: true,
                collapseMode: 'mini',
                autoScroll: true,
                minHeight: 50,
                height: 100,
                items: null
            });
        
        this.add(this.detailView);
        this.add(this.consoleView);
        this.add(this.treeView);
        
        this.load();
    },
    /**
     * Search and clean current editing and disabled toolbar
     * (no record selected). 
     * 
     * TODO : Add warning if on editing
     */
    load: function() {
    	treeConfig = this.getFromDB();
    	var treeConfig = [
    	              	{
    	            		text	    : 'Fond de carte'
    	            		,allowDrag  : false
    	            		,allowDrop  : false
    	            	},
    	            	
    	            	{
    	            		text        : 'ILWAC'
    	            		,expanded   : true
    	            		,cls 	    : 'ilwac'
    	            		,children   : [
    	            		    {
    	            		        layers      : 'ml_x_landsat_region' 
    	            		        ,layer       : "la couverture Landsat d'ILWAC" 
    	            		        ,url		: 'http://ilwac.ige.fr/geoserver-prod/wms?'
    	            		        ,format		: "image/png"
    	            		        ,type		: 'wms'
            							,"leaf":true
    	            		    },{
    	            				layers      : 'ml:ml_5d2_ocsol10'
    	            				,layer       : "Occupation des sols provisoire réalisée à partir des images Landsat 2010"
    	            				, qtip	: "Il s'agit de la version béta, améliorée par rapport à la 1ere verion en ligne. La version finale fournira des améliorations supplémentaires"
    	            				,legend		:"http://ilwac.ige.fr/legendes/cos_ilwac_legende.png"
    	            				//,uuid       : '62b236b3-23ca-4e02-a418-a5cd37b08d88'                         //***********************OK
    	            				,url		: 'http://ilwac.ige.fr/geoserver-prod/wms?'
    	            				,format		: "image/png"
    	            				,type		: 'wms'   
            							,"leaf":true           
    	            			},{
    	            				layers      : 'ml:ml_5d_ocsol_change'
    	            						,layer       : "Changements majeurs de l'Occupation du Sol entre 1990 et 2010 (version de travail)"
    	            						, qtip	: "Il s'agit d'une version provisoire, de travail, pas encore homogénéisée et finalisée"
    	            				,url		: 'http://ilwac.ige.fr/geoserver-prod/wms?'
    	            				,format		: "image/png"
    	            				,type		: 'wms'    
            							,"leaf":true          
    	            			} 
    	            		]
    	            	},
    	            	
    	            	{
    	            		text        : 'Donnés générales'
    	            		,expanded   : false
    	            		,children   : [
    	            		    {
    	            		        text        : 'Limites administratives (source DNH)'
    	            				,expanded   : true
    	            				,children   : [
    	            					{
    	            						layers      : 'ml:ml_1a3_communes'
    	            						,layer       : "Communes"
    	            						,url		: 'http://ilwac.ige.fr/geoserver-prod/wms?'
    	            						,format		: "image/png"
    	            						,type		: 'wms'     
    	            							,"leaf":true         
    	            					},{
    	            						layers      : 'ml:ml_1a2_cercles' 
    	            						,layer       : "Cercles" 
    	            						,url		: 'http://ilwac.ige.fr/geoserver-prod/wms?'
    	            						,format		: "image/png"
    	            						,type		: 'wms'
    	            							,"leaf":true
    	            					},{
    	            						layers      : 'ml:ml_1a1_regions' 
    	            						,layer       : "Régions" 
    	            						,url		: 'http://ilwac.ige.fr/geoserver-prod/wms?'
    	            						,format		: "image/png"
    	            						,type		: 'wms'
	            							,"leaf":true
    	            					}]
    	            		    }]
    	            	}
    	            	];

    	treeConfig = this.getFromDB();
    	var treeLoader = new Ext.tree.TreeLoader({
    		// this below is using the config attributes of the node to do
    		// some testing. The attr.has_events is coming from the loader in PHP
    		createNode: function(attr) {
	    		if (attr.layer && attr.text==null) {
	    			attr.text = attr.layer;
	    			attr.leaf=true;
	    		}
    			return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
    		}
		});
    	if (treeConfig==null) return;
    	var mytreeloader = new Ext.tree.TreeLoader({
            // applyLoader has to be set to false to not interfer with loaders
            // of nodes further down the tree hierarchy
            applyLoader: false/*,
            uiProviders: {
                "layernodeui": LayerNodeUI //Ca n'a pas l'air d'être pris en compte : on n'a pas de TreeNodeUIEventMixin (pas d'evt onRenderNode)
            }*/
        });
	    var tree = new Ext.tree.TreePanel({
	        title:'layerTree',
	        header:false,
	        id: "geoportalLayerTree",
	        enableDD: true,
	        autoScroll:true,
		    loader: treeLoader,
        	root: {
	            nodeType: "async",
	            // the children property of an Ext.tree.AsyncTreeNode is used to
	            // provide an initial set of layer nodes. We use the treeConfig
	            // from above, that we created with OpenLayers.Format.JSON.write.
	            children: treeConfig
	        },
	        rootVisible: false,
	        border: false,
	        layout:'fit'
	    });

    	this.treeView.add(tree);
    },
    /**
     * Search and clean current editing and disabled toolbar
     * (no record selected). 
     * 
     * TODO : Add warning if on editing
     */
    getFromDB: function() {
        var request = OpenLayers.Request.GET({
            url: this.serviceBaseUrl + "/pigeo.layertree.get",
            async: false
        });

        var treeConfig = null;        
        if (request.responseText) {
        	OpenLayers.Console.log("loading Layertree from database");
        	var jsonTree = new OpenLayers.Format.JSON().read( request.responseText );
        	treeConfig = jsonTree.treeConfig;
        } 
        return treeConfig;
    },
    
    


});

/** api: xtype = gn_admin_LayertreeManagerPanel */
Ext.reg('gn_admin_layertreemanagerpanel', GeoNetwork.admin.LayertreeManagerPanel);