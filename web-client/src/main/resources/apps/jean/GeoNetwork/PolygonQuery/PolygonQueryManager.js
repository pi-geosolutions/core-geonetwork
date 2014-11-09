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
Ext.namespace('GeoNetwork.PolygonQuery');


/** api: (define)
 *  module = GeoNetwork.PolygonQuery
 *  class = PolygonQueryManager
 */
/** api: constructor 
 *  .. class:: PolygonQueryManager(config)
 *
 *  Main Polygon Query class
 *
 */
GeoNetwork.PolygonQuery.PolygonQueryManager = Ext.extend(Object, {
	/*
	 * Private vars. Don't use directly
	 */
	map:null,
	layer:null,
	control:null,
	window:null,
    
    constructor: function(config){
    	GeoNetwork.PolygonQuery.PolygonQueryManager.superclass.constructor.call(this, config);
        Ext.apply(this, config);
    },
    
    
    
    
    /*
     * API
     */
    
    getLayer: function() {
    	if (this.layer==null && this.map!=null)
    	{
    		this.layer = new OpenLayers.Layer.Vector(OpenLayers.i18n('pqLayer'), {visibility: true, displayInLayerSwitcher:false});
    		this.map.addLayer(this.layer);
    	}
		return this.layer
    },
    getControl: function() {
    	var pqLayer = this.getLayer();
    	if (this.control==null && pqLayer!=null) {
    		this.control = new OpenLayers.Control.DrawFeature(pqLayer, OpenLayers.Handler.Polygon, {
    	        displayClass: 'olControlDrawFeaturePolygon',
    	        handlerOptions: {},
    	        eventListeners: {
    	        	featureadded: function(event) {
    	        		console.log('added Polygon');
    	            },
    	            activate: this.onActivate,
    	            deactivate: this.onDeactivate,
    	            scope: this
    	        }
    	    });
    	}
		return this.control;
    },
    
    onActivate: function() {
    	if (this.window==null) {
    		this.window = new GeoNetwork.PolygonQuery.PolygonQueryWindow();
    	}
    	this.window.show();
    },
    
    onDeactivate: function() {
    	this.window.hide();
    }
    
});