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
 *  class = GeoportalChartLayer
 */
/** api: constructor 
 *  .. class:: GeoportalChartLayer(config)
 *
 *  Create a Chart layer helper class for the Geoportal
 *  to manage everything around the layer : edit, load, etc
 *
 */


GeoNetwork.layers.GeoportalChartLayer = Ext.extend(GeoNetwork.layers.GeoportalAbstractLayer, {
    template : {
		type:"chart",
		text:"new chart layer",
		opacity:1,
		cls:'',
		qcktip : 'here come your comments about the layer',
		extensions: '',
		url:'http://gm-risk.pigeo.fr/geoserver-prod/gm/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=500&outputFormat=application/json&typeName=',
		layers:'region_layer,district_layer,local_layer',
		changescales : '250000,100000,0',
		format:"geojson",
		legend : '',
		join_geofield : '',
		dbname : 'gm_risk_geodata',
		dbtables : 'reg_table,district_table,local_table',
		join_dbfield : '',
		values_dbfield : '',
		labels_dbfield : '',
		charttype : 'pie',
		colorcodes : '',
		chartsize : 30,
		checked:false,
		leaf:true
    },

    gpid:3,
    type: 'chart',
      
	
	/** private: method[constructor] 
     */
    constructor: function(config) {
    	GeoNetwork.layers.GeoportalChartLayer.superclass.constructor.call(this, config);
        Ext.apply(this, config);
        this.gpid = Math.round(Math.random() * 10000000);
    },
	
	/** private: method[initComponent] 
     */
   /* initComponent: function(config){
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.layers.GeoportalChartLayer.superclass.initComponent.call(this);
                
    },*/
    getForm: function(conf) {
    	if (this.form) this.form.destroy();
    	this.form = new GeoNetwork.layers.GeoportalChartLayerForm(conf);
    	return this.form;
    }

});

/** api: xtype = gn_layers_geoportalchartlayer */
Ext.reg('gn_layers_geoportalchartlayer', GeoNetwork.layers.GeoportalChartLayer);