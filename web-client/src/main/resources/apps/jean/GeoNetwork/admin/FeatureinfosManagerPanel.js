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
 *  class = FeatureinfosManagerPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: FeatureinfosManagerPanel(config)
 *
 *  Create a GeoNetwork feature info manager panel
 *  to manage the translations of the layers' fields names
 *  (Gives pretty print while performing featureinfo requests)
 *
 */
//Overrides
Ext.tree.TreePanel.nodeTypes.gx_layer = Ext.tree.TreeNode;
Ext.tree.TreePanel.nodeTypes.gx_baselayercontainer = Ext.tree.TreeNode;


GeoNetwork.admin.FeatureinfosManagerPanel = Ext.extend(Ext.Panel, {
    frame: false,
    defaultConfig: {
    	title:OpenLayers.i18n('fi.manager.title'),
        defaultViewMode: 'simple',
        border: false,
        height: 800,
        layout:'border',
        autoWidth : true
    },
    catalogue:null,
    fieldsPanel:null,
    layersListPanel:null,
    gridView:null,
    detailView:null,
    consoleView : null,
    //deals with Layertree IO features : load, save, export...
    layertreeio : null,
    grid:null, 
    tb:null,
    nodeForm:null,
    currentLayer:null,
    currentLangCode:null,
    
    /** private: method[initComponent] 
     *  Initializes the layertree manager panel.
     *  
     */
    initComponent: function(config){
    
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.admin.FeatureinfosManagerPanel.superclass.initComponent.call(this);
                
        // Build the layout

        this.fieldsPanel = new Ext.FormPanel({
        	title:OpenLayers.i18n('fi.manager.fieldspanel'),
            region: 'center',
            autoScroll: true,
            disabled:true,
            flex: 1,
            items: []
        });
        this.layersListPanel = new Ext.Panel({
        	title:OpenLayers.i18n('fi.manager.wmslayers'),
            region: 'north',
            layout:'fit',
            split: true,
            collapsible: true,
            collapsed: false,
            autoScroll: true,
            disabled:true,
            height:100,
            width:300,
            items:[]
        });
        
        this.detailView = new Ext.Panel({
        	title:OpenLayers.i18n('fi.manager.details'),
            region: 'east',
            layout:'fit',
            split: true,
            collapsible: false,
            collapsed: false,
            autoScroll: true,
            minWidth: 450,
            width: '60%',
            items:[
                   this.fieldsPanel
            ]
        });
        //this.tb = this.getToolbar();
        this.gridView = new Ext.Panel({
                region: 'center',
		        layout:'fit',
                split: true,
                autoScroll: true,
                minHeigth: 300,
                items: null,
                tbar:this.tb
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
                html:"&gt; <b>Welcome in the feature infos Management Board</b><br />It allows you to translate the layers' field names, for pretty printing in the get feature info requests<br />"
            });
        
        this.add(this.detailView);
        this.add(this.consoleView);
        this.add(this.gridView);

        
        this.grid = this.loadGrid();
        if (this.grid!=null)
        	this.gridView.add(this.grid);
        this.gridView.doLayout();
        /*

    	if (this.useGroups) 
    		this.getGroups();*/
        
        window.lm = this;
        window.lays=[];
    },
    /**
     * Load layertree data in an Ext.tree
     * 
     * TODO : 
     */
    loadGrid: function() {
		var grid=this.getLayertreeIO().loadGrid();
		if (grid==null) {
			var errmsg = "ERROR : couldn't load the layertree. Some of the changes you recently made must cause the problem. "+
			"Most likely you have used improper characters, like doublequotes, where you weren't expected to. " +
			"You are advised to restore a previous backup and try again. If you can't solve it, please contact your administrator.\n";
			//console.log(errmsg);
			grid = new Ext.Panel({
		        border: false,
		        layout:'fit',
                html: errmsg
            });
			//setTimeout(function() {GeoNetwork.admin.Utils.log(this.consoleView, errmsg);}, 3000);
		} else {
			grid.setTitle(OpenLayers.i18n('fi.manager.gplayers'));
			grid.getStore().addListener('load', function(store, records, options) {
				store.filter({
					property     : 'type', 
					value        : 'wms'	}) ; //only 'wms' layers will be considered for now, as to getfeatureinfo requests translation
			});
			
			grid.addListener('rowclick', function(grid, rowIndex, event){
				var node = grid.getStore().getAt(rowIndex);
                this.readNode(node);
            }, this);
		}
	    return grid;
    },
    
    readNode: function(node) {
    	this.currentNode = node;
    	var layers = node.data.layers.split(","); 
    	/*var jsonLayersList = {
    			layers : []
    	};
    	Ext.each(layers, function(l, index) {
    			jsonLayersList.layers.push({'name':l});
    		});
    	this.layersListGrid = new Ext.grid.GridPanel({
            store: new Ext.data.JsonStore({
                // store configs
                autoDestroy: true,
                storeId: 'wmslayersStore',
                // reader configs
                idIndex: 0,  
                root : 'layers',
                idProperty: 'name',
                fields: ['name'],
                data : jsonLayersList
            }),
            columns: [
                {
                    id: 'name',
                    header   : 'Name', 
                    sortable : true, 
                    dataIndex: 'name',
                    width : 300
                }
            ],
            stripeRows: true,
            autoExpandColumn: 'name'
        });
    	console.log(layersListGrid);
    	this.layersListPanel.add(layersListGrid);
    	this.layersListPanel.doLayout();
    	this.layersListPanel.enable();*/
    	var layer = layers[0];
    	if (layer) {
    		this.editFields(layer);
    	}
    },
    
    editFields: function(layer) {
    	this.fieldsPanel.enable();
    	this.fieldsPanel.removeAll(true);
    	
    	this.loadLanguages(this.fieldsPanel);
    	this.currentLayer=layer;
    },
    
    loadLanguages: function(destination) {
    	if (GeoNetwork.Util.locales.length >0 && destination!=null) {
        	// simple array store
        	var store = new Ext.data.ArrayStore({
        	    fields: ['iso2', 'name', 'iso3'],
        	    data : GeoNetwork.Util.locales
        	});
        	
        	/*var combo = new Ext.form.ComboBox({
        	    store: store,
        	    fieldLabel:'Language',
        	    displayField:'name',
        	    value:store.getAt(0),
        	    typeAhead: true,
        	    autoSelect:true,
        	    forceSelection:true,
        	    mode: 'local',
        	    triggerAction: 'all',
        	    emptyText:'Select a language...',
        	    selectOnFocus:true
        	});	
        	combo.addListener('afterrender', function() {
        		console.log('done');
        		//combo.select(0);
        		var item = store.getAt(0).data;
        		window.st =store;
        		window.cb=combo;
        		//combo.setValue(item);
        	});

        	destination.add(combo);*/
        	
        	var list = new Ext.grid.GridPanel({
		        layout:'fit',
	            store: store,
	            columns: [
	                {
	                    id       :'iso3',
	                    header   : 'code', 
	                    dataIndex: 'iso3',
	                    width :40
	                },
	                {
	                    id: 'name',
	                    header   : 'Name', 
	                    sortable : true, 
	                    dataIndex: 'name',
	                    width : 500
	                }
	            ],
	            stripeRows: false,
	            autoExpandColumn: 'name',
	            title: 'Select active language',
	            height : 160,
	            selModel: new Ext.grid.RowSelectionModel({
	            					singleSelect:true,
	            					listeners : {
	            						'rowselect' : function(me, i, r) {
	            							//console.log(r);
	            							//console.log(this);
	            							langCode = r.get("iso3");
	            							this.loadText(langCode);
	            							this.currentLangCode = langCode;
	            						}, scope:this
	            					}
	            			}),
	            listeners : {
	            	'afterrender': function(me) {
	            		//needs timeout : if not, it is indeed selected, but not visibly (no outlined)
	            		setTimeout(function(){
	            			me.getSelectionModel().selectFirstRow();
	        			}, 100)
	            	}
	            }
	        });
        	/*list.addListener('afterrender', function() {
        		var me = this;
        		//needs timeout : if not, it is indeed selected, but not visibly (no outlined)
        		setTimeout(function(){
        			me.getSelectionModel().selectFirstRow();
    			}, 100);
        	});*/
        	destination.add(list);
        	destination.doLayout();
        	
        	
        	
        	
        	//combo.select(0);
    	}
    },
    
    loadText: function(langCode) {
    	console.log(langCode);
    	console.log(this.currentLayer);
    	//we call the service to recover the translated texts
    	//if nothing comes, then we load it from the getFeatureInfos
    	
    	
    },
    
    getLayertreeIO : function() {
    	if (!this.layertreeio) {
    		//deals with Layertree IO features : load, save, export...
            this.layertreeio = new GeoNetwork.admin.LayertreeIO({
            	serviceBaseUrl : this.serviceBaseUrl,
            	verbose:true,
            	logWindow:this.consoleView
            });
    	}
    	return this.layertreeio;
    }
    

});

/** api: xtype = gn_admin_featureinfosmanagerpanel */
Ext.reg('gn_admin_featureinfosmanagerpanel', GeoNetwork.admin.FeatureinfosManagerPanel);