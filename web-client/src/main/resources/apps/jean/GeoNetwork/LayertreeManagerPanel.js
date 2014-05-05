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
    	'folder':['id', 'type', 'text', 'expanded', 'extensions'],
    	'wms':['id', 'type','text','layers', 'url', 'legend', 'uuid', 'format', 'checked', 'TILED', 'cls', 'qtip', 'extensions'],
    	'chart':['id', 'type','text','url', 'legend', 'uuid',  'tablenames', 'changeScales', 'charting_fields', 'other_fields', 'format', 'checked', 'cls', 'qtip', 'context', 'template', 'extensions']    	
    },
    
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
                items: null
            });
        
        this.add(this.detailView);
        this.add(this.consoleView);
        this.add(this.treeView);
        
        this.load();
        this.createForm();
    },
    /**
     * Search and clean current editing and disabled toolbar
     * (no record selected). 
     * 
     * TODO : Add warning if on editing
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
	                this.editNode(node);
	            },
	            scope : this
	        }
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
    
    /**
     * Search and clean current editing and disabled toolbar
     * (no record selected). 
     * 
     * TODO : Add warning if on editing
     */
    createForm: function() {
       this.nodeForm = new Ext.FormPanel({
            id: 'node-form',
            labelWidth:75,
            frame:true,
            labelAlign: 'left',
            title: 'node details', 
            defaultType: 'textfield',
            defaults: {width: '90%'},
            autoHeight: true,
            border: false,
            items: [{
                fieldLabel: 'Id',
                name: 'id',
                disabled:true
            },{
            	xtype: 'combo',
                fieldLabel: 'type',
                name: 'type',
                typeAhead: true,
                triggerAction: 'all',
                disabled:true,
                lazyRender:true,
                mode: 'local',
                store: new Ext.data.ArrayStore({
                    id: 0,
                    fields: [
                        'name',
                        'displayText'
                    ],
                    data: [['folder', 'Folder'],['wms', 'WMS'], ['chart', 'Chart']]
                }),
                valueField: 'name',
                displayField: 'displayText'
            },{
                fieldLabel: 'Text',
                name: 'text'
            },{
                fieldLabel: 'layers',
                name: 'layers'
            },{
                fieldLabel: 'url',
                name: 'url'
            },{
                fieldLabel: 'Legend URL',
                name: 'legend'
            },{
                fieldLabel: 'UUID',
                name: 'uuid'
            },{
            	xtype: 'checkbox',
                fieldLabel: 'checked',
                name: 'checked'
            },{
                xtype: 'radiogroup',
                columns: 'auto',
                fieldLabel: 'Image format',
                name:'format', //necessary for hide/show procedures
                items: [{
                    name: 'format',
                    inputValue: 'image/png',
                    boxLabel: 'PNG'
                }, {
                    name: 'format',
                    inputValue: 'image/jpg',
                    boxLabel: 'JPG'
                }]
            },{
                fieldLabel: 'Is layer ?',
                name: 'leaf',
                disabled:true,
                value:false
            },{
            	xtype: 'checkbox',
                fieldLabel: 'Cacheable',
                name: 'TILED'
            },{
                fieldLabel: 'CSS class',
                name: 'cls'
            },{
                fieldLabel: 'Infos',
                name: 'qtip'
            },{
            	xtype:'textarea',
                fieldLabel: 'Additionnal parameters',
                name: 'extensions'
            }],


            buttons: [{
                text: 'Apply'
            },{
                text: 'Cancel'
            }]
        });
        this.nodeForm.getForm().applyToFields({hidden:true});
        this.detailView.add(this.nodeForm);
        this.detailView.doLayout();
    },

    /**
     * Search and clean current editing and disabled toolbar
     * (no record selected). 
     * 
     * TODO : Add warning if on editing
     */
    editNode: function(node) {
    	
    	if (node.attributes.type) {
        	this.initForm(node.attributes.type);
    	} else {
        	this.nodeForm.getForm().reset();
    	}
    	this.nodeForm.getForm().setValues(node.attributes);
    },

    /**
     * Search and clean current editing and disabled toolbar
     * (no record selected). 
     * 
     * TODO : Add warning if on editing
     */
    initForm: function(type) {
     	this.nodeForm.getForm().reset();
     	
     	Ext.each(this.nodeForm.getForm().items.items, function(field,index) {
     		if (this.nodeFormFields[type].indexOf(field.name)>=0) {
     			field.show();
     		} else {
         		field.hide();
     		}
     	}, this);//we hide the fields, since 'reset' doesn't do it
     	/*
     	for (var i = 0 ; i < this.nodeFormFields[type].length ; i++) {
    		var field = this.nodeForm.getForm().findField('#'+this.nodeFormFields[type][i]);
        	if (field!=null) field.show();
    	}*/
    }


});

/** api: xtype = gn_admin_LayertreeManagerPanel */
Ext.reg('gn_admin_layertreemanagerpanel', GeoNetwork.admin.LayertreeManagerPanel);