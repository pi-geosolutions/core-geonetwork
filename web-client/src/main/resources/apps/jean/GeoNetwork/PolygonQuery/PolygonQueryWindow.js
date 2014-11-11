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

Ext.namespace('GeoNetwork.PolygonQuery');

/**
 * Class: GeoNetwork.PolygonQuery.PolygonQueryWindow
 *      PolygonQuery main Window
 *
 * Inherits from:
 *  - {GeoNetwork.BaseWindow}
 */

/**
 * Constructor: GeoNetwork.PolygonQuery.PolygonQueryWindow
 * Create an instance of GeoNetwork.PolygonQuery.PolygonQueryWindow
 *
 * Parameters:
 * config - {Object} 
 */
GeoNetwork.PolygonQuery.PolygonQueryWindow = function(config) {
    Ext.apply(this, config);
    GeoNetwork.PolygonQuery.PolygonQueryWindow.superclass.constructor.call(this);
};

Ext.extend(GeoNetwork.PolygonQuery.PolygonQueryWindow, GeoNetwork.BaseWindow, {
	headerPanel:null,
	resultsPanel:null,
	
	closeAction:'hide',

    /**
     * Method: init
     *     Initialize this component.
     */
    initComponent: function() {
        GeoNetwork.PolygonQuery.PolygonQueryWindow.superclass.initComponent.call(this);

        this.title = this.title || OpenLayers.i18n("polygonQueryWindow.windowTitle");

        this.x=10;
        this.y = 10;
        this.width = 300;
        this.height = 600;

        this.cls = 'pqwindow';

       	var pq = new Ext.Panel({
       		//layout:'border',
       		layout:'vbox',
       		layoutConfig: {
       		    align : 'stretch',
       		    pack  : 'start',
       		},
       		items: [
       		        this.getHeaderPanel(),
       		        this.getResultsPanel()
	        ]
       	});
        this.add(pq);
        

        this.doLayout();
        console.log(this);
    },

    getHeaderPanel: function() {
  	  if (this.headerPanel==null) {
  		  this.headerPanel = new Ext.Panel({
  			  title: OpenLayers.i18n('polygonQueryWindow.header.title'),
  			  //region: 'north',
  			  collapsible:false,
  			  autoScroll:true,
  			  height: 220,
  			  border:false,
  			  html: OpenLayers.i18n('polygonQueryWindow.header.text')
  		  });
  	  }
	  return this.headerPanel;
    },

    getResultsPanel: function() {
  	  if (this.resultsPanel==null) {
  		  this.resultsPanel = new Ext.Panel({
  			  //region:'center',
  			  flex:1,
  			  border:false,
  			  html: OpenLayers.i18n('polygonQueryWindow.resText.empty')
  		  });
  	  }
	  return this.resultsPanel
    },
    
    setTargetName: function(name) {
    	var dest = this.getHeaderPanel();
    	dest.update(OpenLayers.i18n('polygonQueryWindow.header.text') +
    			'<br /><br /><div class="pqTarget"> <h3>'+
    			OpenLayers.i18n('polygonQueryWindow.target')+
    			"</h3><p class='pqTargetName'>"+
    			name+
    			"</p></div>");
    },
    
    setResults: function(content) {
    	var dest = this.getResultsPanel();
    	dest.update(content);
    }

});
