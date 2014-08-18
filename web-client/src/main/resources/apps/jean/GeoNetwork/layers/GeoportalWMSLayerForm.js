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
        collapsible:false,
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
        collapsible:false,
        defaults: {width: '90%', 'hidden':false, xtype : 'textfield'},
        //frame:true,
    	items	: 	[{
    		fieldLabel : 'WMS server URL',
    		name : 'url'
    	},{
    		fieldLabel : 'Layer\'s name',
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
	}],/*    nodeFormFields : {
    	}
	'chart':['gambia','id', 'type','text', 'uuid','legend','source', 'opacity', 'tablenames', 'changeScales', 'charting_fields', 'other_fields', 'format', 'cls', 'qtip', 'context', 'template', 'extensions'],    	
	'wms':['gambia','id', 'type','text', 'uuid', 'legend', 'url', 'layers', 'opacity', 'format', 'TILED', 'cls', 'qtip', 'extensions'],
	'folder':['gambia','id', 'type', 'text', 'cls', 'extensions']
},
fieldsOrder : ['id', 'type', 'uuid', 'text', 'url', 'source', 'layers', 'opacity', 'format', 'TILED','legend',
               'tablenames', 'changeScales', 'charting_fields', 'other_fields','context', 'template',
               //'expanded', //suppressed : will be managed in the tree panel
               'cls', 'qtip', 'extensions'],    	
*/  
    
    /** private: method[initComponent] 
     *  Initializes the form panel
     *  
     *  TODO : 
     */
    initComponent: function(config){
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.layers.GeoportalWMSLayerForm.superclass.initComponent.call(this);
    }
    
    /** private: method[Build] 
     *  Builds the form itself
     *  
     *  TODO : 
     */
/*    Build: function() {
    	var items = [];
    	var tmp = [];
		Ext.each(this.fieldsOrder, function (fname, index) {
			if (tmp.indexOf(fname) < 0 ) {
				tmp.push(fname); //used to remove eventual duplicates
				switch(fname) {
    				case 'id': //will use the next statement
    				case 'type':
    					items.push({
	    		            fieldLabel: fname,
	    		            name: fname,
	    		            disabled:true
	    		        });
    					break;
    				case 'checked': //will use the next statement
    				//case 'expanded': //will use the next statement
    				case 'leaf': 
    					items.push({
    			        	xtype: 'checkbox',
    			            fieldLabel: fname,
    			            //inputValue:true,
    			            name: fname,
    			            value:false
    			        });
    					break;
    				case 'TILED':
    					items.push({
    			        	xtype: 'checkbox',
    			            fieldLabel: fname,
    			            //inputValue:false,
    			            name: fname,
    			            value:true
    			        });
    					break;
					case 'extensions':
						items.push({
							xtype : 'textarea',
							fieldLabel : fname,
							name : fname
						});
						break;
					case 'format':
						items.push({
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
				            }, {
				                name: 'format',
				                inputValue: 'geojson',
				                boxLabel: 'GeoJSON'
				            }]
				        });
						break;
					default:
        				items.push({
    			            fieldLabel: fname,
    			            name: fname
    			        });
				}
			}
		}, this);
    	
    	this.add(items);
    },
    */

});

/** api: xtype = gn_layers_geoportalwmslayerform */
Ext.reg('gn_layers_geoportalwmslayerform', GeoNetwork.layers.GeoportalWMSLayerForm);