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
 *  class = GeoportalWMSLayerForm
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: GeoportalWMSLayerForm(config)
 *
 *  Creates an specific form, for node attributes edition 
 *  (layer parameters' edition, actually)
 *
 */

GeoNetwork.layers.GeoportalWMSLayerForm = Ext.extend(GeoNetwork.layers.GeoportalAbstractLayerForm, {
    title: 'WMS node details', 
    nodeFormFields : [{
        xtype: 'fieldset',
        title: 'General features',
        autoHeight: true,
        layout: 'form',
        //border:false,
        collapsible:true,
        defaults: {width: '90%', 'hidden':false,xtype : 'textfield'},
        //frame:true,
    	items	: 	[{
    		fieldLabel : 'ID',
    		name : 'id',
            disabled:true
    	},{
    		fieldLabel : 'Type',
    		name : 'type',
            disabled:true
    	},{
    		fieldLabel : 'Text',
    		name : 'text'
    	},{
    		fieldLabel : 'Opacity',
    		xtype : 'spinnerfield',
    		name : 'opacity',
    		maxValue : 1.0,
    		minValue : 0,
        	allowDecimals: true,
        	decimalPrecision: 1,
        	incrementValue: 0.1,
        	alternateIncrementValue: 2.1,
        	accelerate: true
    	},{
    		fieldLabel : 'CSS class',
    		name : 'cls'
    	},{
    		fieldLabel : 'Comments',
    		xtype : 'textarea',
    		name : 'qcktip',
    		height:20,
    		grow:true,
    		growMin:20,
    		growMax:200
    	},{
    		fieldLabel : 'Extensions',
    		xtype : 'textarea',
    		name : 'extensions',
    		height:20,
    		grow:true,
    		growMin:20,
    		growMax:200
    	}]
    },{
        xtype: 'fieldset',
        title: 'WMS features',
        autoHeight: true,
        layout: 'form',
        //border:false,
        collapsible:true,
        defaults: {width: '90%', 'hidden':false, xtype : 'textfield'},
        //frame:true,
    	items	: 	[{
    		fieldLabel : 'WMS server URL',
    		name : 'url'
    	},{
    		fieldLabel : 'Layer(s) name(s)',
    		name : 'layers'
    	},{
            xtype: 'radiogroup',
            columns: [100, 100],
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
        	xtype: 'checkbox',
            fieldLabel: 'Tiled',
            //inputValue:false,
            name: 'TILED',
            value:true
    	},{
        	xtype: 'checkbox',
            fieldLabel: 'Queryable ?',
            //inputValue:false,
            name: 'queryable',
            value:true
    	},{
    		fieldLabel : 'Legend URL',
    		name : 'legend'
    	}]
	},{
        xtype: 'fieldset',
        title: 'Metadata reference',
        autoHeight: true,
        layout: 'form',
        //border:false,
        collapsible:true,
        defaults: {width: '90%', 'hidden':false, xtype : 'textfield'},
        //frame:true,
    	items	: 	[{
    		fieldLabel : 'UUID',
    		name : 'uuid'
    	}]
	},{
        xtype: 'fieldset',
    	id:'pq_form',
        title: 'Enable Polygon Query ? (available only for raster-type source data, hosted on a Geoserver WPS-enabled)',
        checkboxToggle:true,
        checkboxName:'pq_enable',
        autoHeight: true,
        layout: 'form',
        //border:false,
        //collapsible:false,
        collapsed: true,
        defaults: {width: '90%', hidden:false, xtype : 'textfield'},
        //frame:true,
        listeners: {
            collapse: function(p) {
            	//console.log("collapsed");
                p.items.each(function(i) {
                    i.disable();
                },
                this);
            },
            expand: function(p) {
            	//console.log("expand");
                p.items.each(function(i) {
                    i.enable();
                },
                this);
            }
        },
    	items	: 	[{/*
        	xtype: 'checkbox',
        	id:'pq.form.enable',
    		fieldLabel : 'Enable Polygon Query ?',
    		name : 'pq.enable',
            value:false
    	},{
            xtype: 'fieldset',
        	id:'pq.form.settings',
            hidden:true,
            title: 'Polygon Query settings',
            autoHeight: true,
            layout: 'form',
            //border:false,
            collapsible:false,
            defaults: {width: '90%', hidden:false, xtype : 'textfield'},
            //frame:true,
        	items	: 	[{*/
    		fieldLabel : 'WMS Layer to query',
    		name : 'pq_layer'
    	},{
    		xtype: 'numberfield',
    		fieldLabel : 'Band nb used to compute stats (integer)',
    		value:0,
    		name : 'pq_bandnb'
    	},{
    		fieldLabel : 'Header',
    		name : 'pq_header'
    	},{
        	xtype: 'checkbox',
    		fieldLabel : 'Multiply values by polygon area (density cases) ?',
    		id : 'pq_multiplyByArea',
    		name : 'pq_multiplyByArea',
            value:false,
            listeners: {
                check: function(event, checked) {
                	Ext.getCmp('pq_multiplyRatio').setVisible(checked);
                }
            }
    	},{
    		xtype: 'numberfield',
    		fieldLabel : 'Ratio (base unit is /km²)',
    		hidden:true,
    		id : 'pq_multiplyRatio',
    		name : 'pq_multiplyRatio'
    	}/*,{
                xtype: 'radiogroup',
                columns: [300],
                fieldLabel: 'Layer type',
                name:'pq.layertype', //necessary for hide/show procedures
                items: [{
                    name: 'pq.layertype',
                    inputValue: 'raster',
                    boxLabel: 'Raster'
                }, {
                    name: 'pq.layertype',
                    inputValue: 'polygons',
                    boxLabel: 'Vector (polygons)',
                    disabled:true
                }, {
                    name: 'pq.layertype',
                    inputValue: 'points',
                    boxLabel: 'Vector (points)',
                    disabled:true
                }]
            }*/,{
                xtype: 'checkboxgroup',
                columns: 3,
                fieldLabel: 'Stats to recover: ',
                id:'pq_rastertype_fields', 
                name:'pq_rastertype_fields', //necessary for hide/show procedures
                items: [{
                    name: 'count',
                    boxLabel: 'Nb of pixels covered'
                }, {
                    name: 'min',
                    boxLabel: 'Min value', 
                    checked: true
                }, {
                    name: 'max',
                    boxLabel: 'Max value', 
                    checked: true
                }, {
                    name: 'sum',
                    boxLabel: 'Sum', 
                    checked: true
                }, {
                    name: 'avg',
                    boxLabel: 'Average value', 
                    checked: true
                }, {
                    name: 'stddev',
                    boxLabel: 'Standard dev.', 
                    checked: true
                }]
            },{
	    		xtype: 'numberfield',
	    		fieldLabel : 'Round values ? (nb of decimals)',
	    		name : 'pq_round'
    	},]
	}],
    
    /** private: method[initComponent] 
     *  Initializes the form panel
     *  
     *  TODO : 
     */
    initComponent: function(){
        Ext.apply(this, this.config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.layers.GeoportalWMSLayerForm.superclass.initComponent.call(this);
        
        /*
        Ext.getCmp("pq.form.enable").on("change", this.togglePolygonqueryForm, this);
        console.log(Ext.getCmp("pq.form.enable"));*/
    }/*,
    
    togglePolygonqueryForm: function(scope, newval, oldval) {
    	console.log(newval);
    	var fieldset = Ext.getCmp("pq.form.settings");
    	console.log(fieldset);
    	fieldset.setVisible(newval);
    	this.doLayout();
    }*/,
    
	/**
	 * Loads node attributes in the form
	 * 
	 * TODO : 
	 */
	editNode: function(source) { 
		console.log(source);
        GeoNetwork.layers.GeoportalWMSLayerForm.superclass.editNode.call(this, source);
        this.loadPQData(source);
	},
	/**
     * Applies the changes in the form to the node attributes & display in the tree
     * 
     * TODO : 
     */
    applyChanges: function(button, event) {
        GeoNetwork.layers.GeoportalWMSLayerForm.superclass.applyChanges.call(this, button, event);
        
        
    	var node = this.currentNode;
    	var values= this.getForm().getFieldValues();
    	
		delete node.attributes.pq_rastertype_fields; //we'll set them by hand
		if (node!=null && values['pq_layer']!=null && values['pq_layer']!="") {
			//apply values for Polygon Query checkboxes, if it is set: 
			node.attributes.pq_rastertype_fields = {};
			
			Ext.each(Ext.getCmp("pq_rastertype_fields").items.items, function(item, index) {
				node.attributes.pq_rastertype_fields[item.name]=item.checked;
			});
		}
    },
    
	loadPQData: function(source) {
		var geoplayer = this.getGeoplayer(source);
		if (geoplayer==null) return;
		
		var node = geoplayer.getTreeNode();
		if (node==null) return;
		if (node.attributes.pq_layer==null || node.attributes.pq_layer=="") return;
		else  {
			//console.log("here goes the real stuff");
			//check the fieldset 
			window.pqfs = Ext.getCmp("pq_form");
			try {
				Ext.getCmp("pq_form").expand();
			} catch (err) {
				//The expand command will throw an error: probably a bug in the checkbox-fieldset thing
				//Doesn't seem to matter much
			}
			//console.log(node.attributes);
			var cbGroup = Ext.getCmp("pq_rastertype_fields").setValue(node.attributes.pq_rastertype_fields);
		}
	}
});

/** api: xtype = gn_layers_geoportalwmslayerform */
Ext.reg('gn_layers_geoportalwmslayerform', GeoNetwork.layers.GeoportalWMSLayerForm);