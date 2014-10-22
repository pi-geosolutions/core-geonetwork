/*
 * Copyright (C) 2009 GeoNetwork
 *
 * This file is part of GeoNetwork
 *
 * GeoNetwork is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GeoNetwork is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GeoNetwork.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @requires GeoNetwork/windows/BaseWindow.js
 */ 

Ext.namespace('GeoNetwork');

/**
 * Class: GeoNetwork.FieldsManager
 *      Window to manage a layer's fields (rename, show/hide them).
 *
 * Inherits from:
 *  - {GeoNetwork.BaseWindow}
 */

/**
 * Constructor: GeoNetwork.FieldsManager
 * Create an instance of GeoNetwork.FieldsManager
 *
 * Parameters:
 * config - {Object} A config object used to set the addwmslayer
 *     window's properties.
 */
GeoNetwork.FieldsManager = function(config) {
    Ext.apply(this, config);
    GeoNetwork.FieldsManager.superclass.constructor.call(this);
};

Ext.extend(GeoNetwork.FieldsManager, GeoNetwork.BaseWindow, {

		current: null,
		
		//value of a field label saying we don't want to display its information
		hideValue : "#hide#",

    /**
     * Method: init
     *     Initialize this component.
     */
    initComponent: function() {
        GeoNetwork.FieldsManager.superclass.initComponent.call(this);

        this.title = this.title || OpenLayers.i18n("fieldsManager.windowTitle");

        this.width = 600;
        this.height = 400;

        this.cls = 'popup-variant1';

       	//var fp = new GeoNetwork.FieldsManagerPanel();

        //this.add(fp);
        this.layout='border';
        this.fieldsPanel = new Ext.Panel({
        	region:'center',
        	//title: OpenLayers.i18n("fieldsManager.fieldsPanel"),
        	layout:'fit'
        });
        this.langPanel = new Ext.Panel({
        	region:'north',
        	//title: OpenLayers.i18n("fieldsManager.langPanel"),
        	height:100,
        	collapsible:false,
        	layout:'fit'
        });
        this.add(this.fieldsPanel);
        this.add(this.langPanel);
        
        this.loadLanguages(this.langPanel);

        this.doLayout();
    },
    
    loadLanguages: function(destination) {
    	if (GeoNetwork.Util.locales.length >0 && destination!=null) {
        	// simple array store
        	var store = new Ext.data.ArrayStore({
        	    fields: ['iso2', 'name', 'iso3'],
        	    data : GeoNetwork.Util.locales
        	});
        	var list = new Ext.grid.GridPanel({
		        layout:'fit',
	        	autoScroll:true,
	            store: store,
	            columns: [
	                {
	                    id       :'iso3',
	                    header   : OpenLayers.i18n("fieldsManager.langGrid.code"), 
	                    dataIndex: 'iso3',
	                    width :40
	                },
	                {
	                    id: 'name',
	                    header   : OpenLayers.i18n("fieldsManager.langGrid.name"), 
	                    sortable : true, 
	                    dataIndex: 'name',
	                    width : 500
	                }
	            ],
	            stripeRows: false,
	            autoExpandColumn: 'name',
	            title: OpenLayers.i18n("fieldsManager.langGrid.title"), 
	            height : 160,
	            selModel: new Ext.grid.RowSelectionModel({
	            					singleSelect:true,
	            					listeners : {
	            						'rowselect' : function(me, i, r) {
	            							//console.log(r);
	            							//console.log(this);
	            							langCode = r.get("iso3");
	            							this.loadFields(langCode);
	            							this.current.langCode = langCode;
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
        	destination.add(list);
        	destination.doLayout();
    	}
    },
    
    loadFields: function(langCode) {
    	//we call the service to recover the translated texts
    	//if nothing comes, then we load it from the getFeatureInfos
    	var layerid = this.current.layerid;
    	var feature = this.current.feature;
    	var fields = [];
    	for (var attr in feature.attributes) {
    		var row = [attr, this.fieldRename(attr, feature,layerid,langCode)/*, this.fieldShow(attr, feature, layerid,langCode)*/];
    		fields.push(row);
        }
    	console.log(fields);
    	
    	var fieldsStore = new Ext.data.ArrayStore({
    	    // store configs
    	    autoDestroy: true,
    	    storeId: 'fieldsStore',
    	    // reader configs
    	    idIndex: 0,  
    	    fields: [
    	       'field', 'label'
    	       //,{name: 'show', type: 'bool'}
    	    ]
    	});
    	fieldsStore.loadData(fields);
    	this.current.fieldsStore = fieldsStore;
    	
    	// shorthand alias
        var fm = Ext.form;

        // the column model has information about grid columns
        // dataIndex maps the column to the specific data field in
        // the data store (created below)
        var cm = new Ext.grid.ColumnModel({
            // specify any defaults for each column
            defaults: {
                sortable: true // columns are not sortable by default           
            },
            columns: [{
                id: 'field',
                header: OpenLayers.i18n("fieldsManager.fieldsGrid.field"),
                dataIndex: 'field',
                width: 130,
                // use shorthand alias defined above
                editor: new fm.TextField({
                    allowBlank: false
                })
            }, {
                id: 'label',
                header: OpenLayers.i18n("fieldsManager.fieldsGrid.label"), 
                dataIndex: 'label',
                width: 130,
                editor: new fm.TextField({
                    allowBlank: false
                }),
                listeners: {
                    'checkChange': this.onFieldChange
	            },
	            scope:this
            }/*, {
                xtype: 'checkcolumn',
                header: OpenLayers.i18n("fieldsManager.fieldsGrid.show"), 
                dataIndex: 'show',
                width: 55,
                listeners: {
                        'checkChange': this.onCheckChange
                },
                scope:this
            }*/]
        });
        
     // create the editor grid
        var grid = new Ext.grid.EditorGridPanel({
            store: fieldsStore,
            cm: cm,
            height:300,
            width:400,
            autoExpandColumn: 'label', // column with this id will be expanded
            title: OpenLayers.i18n("fieldsManager.fieldsGrid.title"), 
            frame: true,
            clicksToEdit: 1,
            bbar: [
             	       '->',
            	       {
            	    	   text : OpenLayers.i18n('fieldsManager.fieldsGrid.apply'),
            	    	   handler : this.applyChanges,
            	    	   scope:this
            	       },
            	       {
            	    	   text : OpenLayers.i18n('fieldsManager.fieldsGrid.save'),
            	    	   handler : function(){console.log("save");},
            	    	   scope:this
            	       }
    	       ]
        });
        this.fieldsPanel.removeAll();
        this.fieldsPanel.add(grid);
        this.fieldsPanel.doLayout();
    },
    
    //normally, it is affected from AdvancedFeatureinfoPanel, and overrides this
    fieldRename: function(attr, feature,layerid,langCode) {
    	return attr;
    },
    
    fieldShow: function(attr, feature,layerid, langCode) {
    	return this.fieldRename(attr, feature,layerid, langCode) != this.hideValue;
    },

    manage: function(data) {
        this.current = data;
        console.log(data.layerid);
    },
    
    applyChanges : function() {
    	console.log(this.current);
    	/*if (window.Geoportal.featureinfos.translations[lang][this.current.layerid]==null) {
    		window.Geoportal.featureinfos.translations[lang][this.current.layerid]={};
    	}
    	
    	window.Geoportal.featureinfos.translations[lang][this.current.layerid][]*/
    },
    
    onCheckChange: function(column, rowIndex, checked, eOpts) {
    	console.log('changed');
        var record = this.current.fieldsStore.getAt(rowIndex);   
        if (window.Geoportal.featureinfos.translations[lang][this.current.layerid]==null) {
    		this.initializeThisLayer();
    	} else { //we already have an entry for this layer : we will just update its content
    		window.Geoportal.featureinfos.translations[lang][this.current.layerid][record.id].show=record.get('show');
    	}
        console.log(window.Geoportal.featureinfos.translations[lang][this.current.layerid]);
    },
    
    initializeThisLayer: function() {
    	window.Geoportal.featureinfos.translations[lang][this.current.layerid]={};
    	this.current.fieldsStore.each(function(record) {
    		window.Geoportal.featureinfos.translations[lang][this.current.layerid][record.id] = {
    				label : record.get('label'),
    				show : record.get('show')
    		};
    	},this);
    	console.log('initialized');
    	console.log(window.Geoportal.featureinfos.translations[lang][this.current.layerid]);
    }
});
