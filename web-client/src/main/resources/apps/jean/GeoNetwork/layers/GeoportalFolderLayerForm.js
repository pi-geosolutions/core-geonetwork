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
 *  class = GeoportalFolderLayerForm
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: GeoportalFolderLayerForm(config)
 *
 *  Creates an specific form, for node attributes edition 
 *  (layer parameters' edition, actually)
 *
 */

GeoNetwork.layers.GeoportalFolderLayerForm = Ext.extend(GeoNetwork.layers.GeoportalAbstractLayerForm, {
    title: 'Folder node details', 
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
    		fieldLabel : 'CSS class',
    		name : 'cls'
    	},{
    		fieldLabel : 'Extensions',
    		xtype : 'textarea',
    		name : 'extensions',
    		height:20,
    		grow:true,
    		growMin:20,
    		growMax:200
    	}]
	}],
    
    /** private: method[initComponent] 
     *  Initializes the form panel
     *  
     *  TODO : 
     */
    initComponent: function(config){
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.layers.GeoportalFolderLayerForm.superclass.initComponent.call(this);
    }
});

/** api: xtype = gn_layers_geoportalfolderlayerform */
Ext.reg('gn_layers_geoportalfolderlayerform', GeoNetwork.layers.GeoportalFolderLayerForm);