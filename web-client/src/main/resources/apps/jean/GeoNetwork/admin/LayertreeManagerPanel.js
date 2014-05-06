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
    nodeForm:null,
    nodeFormFields : {
    	'chart':['id', 'type','text', 'uuid','legend','url', 'tablenames', 'changeScales', 'charting_fields', 'other_fields', 'format', 'cls', 'qtip', 'context', 'template', 'extensions'],    	
    	'wms':['id', 'type','text', 'uuid', 'legend', 'url', 'layers', 'format', 'TILED', 'cls', 'qtip', 'extensions'],
    	'folder':['id', 'type', 'text', /*'expanded', */'extensions']
    },
    fieldsOrder : ['id', 'type', 'uuid', 'text', 'url', 'layers', 'format', 'TILED','legend',
                   'tablenames', 'changeScales', 'charting_fields', 'other_fields','context', 'template',
                   //'expanded', //suppressed : will be managed in the tree panel
                   'cls', 'qtip', 'extensions'],    	
    
    /** private: method[initComponent] 
     *  Initializes the layertree manager panel.
     *  
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
            items: []
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
                html:"&gt; <b>Welcome in the Layertree Management Board</b><br />It allows you to view, edit, add, transform the layers and the structure"
            });
        
        this.add(this.detailView);
        this.add(this.consoleView);
        this.add(this.treeView);
        
        this.load();
        this.createForm(this.nodeFormFields, this.fieldsOrder);
    },
    /**
     * Load layertree data in an Ext.tree
     * 
     * TODO : 
     */
    load: function() {
    	var treeConfig = this.getFromDB();
    	if (treeConfig==null) return;
    	
    	var treeLoader = new Ext.tree.TreeLoader({
    		// this below is using the config attributes of the node to do
    		// some testing. The attr.has_events is coming from the loader in PHP
    		createNode: function(attr) {
	    		if (attr.layer && attr.text==null) {
	    			attr.text = attr.layer;
	    			attr.leaf=true;
	    		}
	    		if (attr.checked==null && attr.leaf==true) {
	    			attr.checked = false;
	    		}
	    		if (attr.leaf!=true) {
	    			attr.type='folder';
	    		}
    			return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
    		}
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
	        layout:'fit',
	        listeners: {
	            click: function(node, event){
	                this.nodeForm.editNode(node);
	            },
	            expandnode: function(node){
	                node.attributes.expanded = node.isExpanded();
	            },
	            collapsenode: function(node){
	                node.attributes.expanded = node.isExpanded();
	            },
	            checkchange: function(node, checked){
	            	console.log(checked);
	                node.attributes.checked = checked;
	            },
	            scope : this
	        }
	    });
    	this.treeView.add(tree);
    },
    /**
     * Gets the layertree as json data from the DB, via pigeo services
     * 
     * TODO :
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
    
    /**
     * Builds the form dynamically using the nodeFormFields listed fields, 
     * in the order given by fieldsOrder array
     * 
     * TODO : 
     */
    createForm: function(nodeFormFields, fieldsOrder) {
        this.nodeForm = new GeoNetwork.admin.LayerForm({'nodeFormFields':nodeFormFields, 'fieldsOrder':fieldsOrder/*, 'buttons':buttons*/});
        
        this.detailView.add(this.nodeForm);
        this.detailView.doLayout();
    },
    /**
     * Builds the layertree as a json object, cleared of all extjs objects, just like plain old layertree.js
     * 
     * TODO : 
     */
    tree2json: function() {
        
    }

});

/** api: xtype = gn_admin_LayertreeManagerPanel */
Ext.reg('gn_admin_layertreemanagerpanel', GeoNetwork.admin.LayertreeManagerPanel);