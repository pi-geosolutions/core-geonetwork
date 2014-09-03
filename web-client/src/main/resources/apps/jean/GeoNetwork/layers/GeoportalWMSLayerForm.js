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
    }
});

/** api: xtype = gn_layers_geoportalwmslayerform */
Ext.reg('gn_layers_geoportalwmslayerform', GeoNetwork.layers.GeoportalWMSLayerForm);