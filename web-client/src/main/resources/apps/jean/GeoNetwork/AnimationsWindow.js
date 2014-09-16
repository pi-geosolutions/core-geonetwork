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
 * Class: AnimationsWindow
 *      This window gives the necessary controls to run animations, like weather animation
 *
 * Inherits from:
 *  - {GeoNetwork.BaseWindow}
 */

/**
 * Constructor: GeoNetwork.AnimationsWindow
 * Create an instance of GeoNetwork.AnimationsWindow
 *
 * Parameters:
 * config - {Object} A config object used to set the 
 *     window's properties.
 */
GeoNetwork.AnimationsWindow = function(config) {
    Ext.apply(this, config);
    GeoNetwork.AnimationsWindow.superclass.constructor.call(this);
};

Ext.extend(GeoNetwork.AnimationsWindow, GeoNetwork.BaseWindow, {

	maximizable:false,
	
	config:null,
	closeAction: 'hide', 
	loader: {
		panel:null
	},
	progress: {
		panel:null,
		bar:null,
		emptyText: 'No dataset chosen...',
		steps:0,
		step:0
	},
	animator: {
		panel:null
	},
	selectedDataset:null, //will be affected an extjs record, issued from the combobox
	

    /**
     * Method: init
     *     Initialize this component.
     */ 
    initComponent: function() {
        GeoNetwork.AnimationsWindow.superclass.initComponent.call(this);

        window.dashboard = this;
        this.title = this.title || OpenLayers.i18n("dash_AnimationsWindow.windowTitle");

        this.width = 500;
        this.height = 400;
        this.layout ='fit';
        var content = new Ext.Panel({
        	id:'Anim_contentPanel',
        	layout:'vbox',
        	layoutConfig: {
        	    align : 'stretch',
        	    pack  : 'start',
        	},
        	items: [/*
        	    {id:'AnimPanel1',html:'panel 2', height:50},
        	    {id:'AnimPanel2',html:'panel 3', flex:1}*/
        	]
        });
    	this.add(content);
    	this.doLayout();
    	this.loader.panel=this.buildLoader({height:80});
    	content.add(this.loader.panel);

    	this.progress.bar = new Ext.ProgressBar({
        	text:this.progress.emptyText
	    });
    	this.progress.panel=new Ext.Panel({
		    		height:50,
		    		border:false,
			        bodyStyle:'padding:10px 10px',
			        items : this.progress.bar
    			});
    	content.add(this.progress.panel);
    	this.animator.panel = this.buildAnimator({flex:1});
    	content.add(this.animator.panel);
    },
    /*
     * TODO : 
     * 	- defer store loading at the moment we first open the window, not at page load
     * 	- build dynamically the URL
     */
	buildLoader: function(config) {
		var URL = "http://localhost:8080/geonetwork/srv/eng/pigeo.animations.list";
		var map_fields = [
				           // set up the fields mapping into the xml doc
				           {name: 'id'},
				           {name: 'label'},
				           {name: 'info'},
				           {name: 'timeextent'},
				           {name: 'timeunit'}
				       ];
		var mystore = new Ext.data.Store({
		    remoteSort    : false,
         	autoLoad    : { params:
                               {start:0, limit:2}
                            },
			proxy : new Ext.data.HttpProxy ({
					url : URL
				}),

		    // the return will be XML, so lets set up a reader
		    reader: new Ext.data.XmlReader({
		           // records will have an "emprise" tag
		           record: 'dataset',
		           id: 'id'
		       }, map_fields),
		    sortInfo : {field: "label", direction: "ASC"}
        });
    	mystore.load();
    	//console.log(mystore);
    	
    	var me=this;
		var loader = new Ext.FormPanel({
	        labelWidth: 75, // label settings here cascade unless overridden
	        autoScroll:true,
	        border:false,
	        bodyStyle:'padding:10px 5px 0',
	        items: [{
	        		xtype:'combo',
	        		id:'anim_cb_selector',
					store: mystore,
				  	displayField:'label',
				    valueField: 'id',
				  	width:300,
				  	listWidth:300,
				  	allowBlank:false,
					forceSelection: true,
					autoSelect:true,
					triggerAction: 'all',
					emptyText:'Select source of animation',
					selectOnFocus:true,
					mode:'local',//load store only once (manually, see mystore.load())
					lastQuery: '', //so that the first time dropdown will filter!!!!
					listeners : {
						'select' : function(combo, record, index) {
							me.selectedDataset = record;
						}
					},
					scope:this
			  	}
	        ],

	        buttons: [{
	            text: 'Load',
	            handler : this.loadAnimation.bind(me)
	        }/*,{
	            text: 'Cancel'
	        }*/]
	    });
		Ext.apply(loader,config);
		return loader;
	},
	buildAnimator: function(config) {
		var timeslider = new Ext.Slider({
	        width: '95%',
	        minValue: 0,
	        maxValue: 100
	    });
		var form = new Ext.form.FormPanel({
	        autoScroll:true,
	        //title   : 'Composite Fields',
	        autoHeight: true,
	        disabled:true,
	        border:false,
	        bodyStyle:'padding:20px 5px 0',
	        items   : [
	   	            timeslider,
		            {
		                xtype     : 'textfield',
		                name      : 'email',
		                fieldLabel: 'Email Address',
		                anchor    : '-20'
		            },
	            {
	                xtype: 'compositefield',
	                fieldLabel: 'Date Range',
	                msgTarget : 'side',
	                anchor    : '-20',
	                defaults: {
	                    flex: 1
	                },
	                items: [
	                    {
	                        xtype: 'datefield',
	                        name : 'startDate'
	                    },
	                    {
	                        xtype: 'datefield',
	                        name : 'endDate'
	                    }
	                ]
	            },
	            {
	                xtype: 'fieldset',
	                title: 'Details',
	                collapsible: true,
	                items: [
	                    {
	                        xtype: 'compositefield',
	                        fieldLabel: 'Phone',
	                        // anchor    : '-20',
	                        // anchor    : null,
	                        msgTarget: 'under',
	                        items: [
	                            {xtype: 'displayfield', value: '('},
	                            {xtype: 'textfield',    name: 'phone-1', width: 29, allowBlank: false},
	                            {xtype: 'displayfield', value: ')'},
	                            {xtype: 'textfield',    name: 'phone-2', width: 29, allowBlank: false, margins: '0 5 0 0'},
	                            {xtype: 'textfield',    name: 'phone-3', width: 48, allowBlank: false}
	                        ]
	                    },
	                    {
	                        xtype: 'compositefield',
	                        fieldLabel: 'Time worked',
	                        combineErrors: false,
	                        items: [
	                           {
	                               name : 'hours',
	                               xtype: 'numberfield',
	                               width: 48,
	                               allowBlank: false
	                           },
	                           {
	                               xtype: 'displayfield',
	                               value: 'hours'
	                           },
	                           {
	                               name : 'minutes',
	                               xtype: 'numberfield',
	                               width: 48,
	                               allowBlank: false
	                           },
	                           {
	                               xtype: 'displayfield',
	                               value: 'mins'
	                           }
	                        ]
	                    },
	                    {
	                        xtype : 'compositefield',
	                        anchor: '-20',
	                        msgTarget: 'side',
	                        fieldLabel: 'Full Name',
	                        items : [
	                            {
	                                //the width of this field in the HBox layout is set directly
	                                //the other 2 items are given flex: 1, so will share the rest of the space
	                                width:          50,


	                                xtype:          'combo',
	                                mode:           'local',
	                                value:          'mrs',
	                                triggerAction:  'all',
	                                forceSelection: true,
	                                editable:       false,
	                                fieldLabel:     'Title',
	                                name:           'title',
	                                hiddenName:     'title',
	                                displayField:   'name',
	                                valueField:     'value',
	                                store:          new Ext.data.JsonStore({
	                                    fields : ['name', 'value'],
	                                    data   : [
	                                        {name : 'Mr',   value: 'mr'},
	                                        {name : 'Mrs',  value: 'mrs'},
	                                        {name : 'Miss', value: 'miss'}
	                                    ]
	                                })
	                            },
	                            {
	                                xtype: 'textfield',
	                                flex : 1,
	                                name : 'firstName',
	                                fieldLabel: 'First',
	                                allowBlank: false
	                            },
	                            {
	                                xtype: 'textfield',
	                                flex : 1,
	                                name : 'lastName',
	                                fieldLabel: 'Last',
	                                allowBlank: false
	                            }
	                        ]
	                    }
	                ]
	            }
	        ],
	        buttons: [
	            {
	                text   : 'Load test data',
	                handler: function() {
	                    var Record = Ext.data.Record.create([
	                       {name: 'email',     type: 'string'},
	                       {name: 'title',     type: 'string'},
	                       {name: 'firstName', type: 'string'},
	                       {name: 'lastName',  type: 'string'},
	                       {name: 'phone-1',   type: 'string'},
	                       {name: 'phone-2',   type: 'string'},
	                       {name: 'phone-3',   type: 'string'},
	                       {name: 'hours',     type: 'number'},
	                       {name: 'minutes',   type: 'number'},
	                       {name: 'startDate', type: 'date'},
	                       {name: 'endDate',   type: 'date'}
	                    ]);
	                    
	                    form.form.loadRecord(new Record({
	                        'email'    : 'ed@extjs.com',
	                        'title'    : 'mr',
	                        'firstName': 'Abraham',
	                        'lastName' : 'Elias',
	                        'startDate': '01/10/2003',
	                        'endDate'  : '12/11/2009',
	                        'phone-1'  : '555',
	                        'phone-2'  : '123',
	                        'phone-3'  : '4567',
	                        'hours'    : 7,
	                        'minutes'  : 15
	                    }));
	                }
	            },
	            {
	                text   : 'Save',
	                handler: function() {
	                    if (form.form.isValid()) {
	                        var s = '';
	                    
	                        Ext.iterate(form.form.getValues(), function(key, value) {
	                            s += String.format("{0} = {1}<br />", key, value);
	                        }, this);
	                    
	                        Ext.example.msg('Form Values', s);                        
	                    }
	                }
	            },
	            
	            {
	                text   : 'Reset',
	                handler: function() {
	                    form.form.reset();
	                }
	            }
	        ]
		});
		Ext.apply(form,config);
		return form;
	},
	
	loadAnimation: function(btn) {	
		console.log(this.selectedDataset);	
		var URL = "http://localhost:8080/geonetwork/srv/eng/pigeo.animations.listfiles.json?dataName="+this.selectedDataset.data.id;
		var request = OpenLayers.Request.GET({
            url: URL,
            async: false
        });
		if (request.responseText) {
			var fileslist = new OpenLayers.Format.JSON().read( request.responseText );
			var imgs = new Array();
			console.log(fileslist);
			for (var i = 0 ; i < fileslist.record.length ; i++) {
				imgs.push("http://localhost:8080/geonetwork/srv/eng/pigeo.animations.getimage?path="+fileslist.path+"&name="+fileslist.record[i].name); //imgs will be an array of absolute paths to the images
			};
			//console.log(imgs);
			
			//initialize the progress bar if necessary
			this.progress.steps = fileslist.record.length;
			this.progress.step = 0;
			this.progress.bar.updateProgress(0,this.progress.emptyText);
			
			imageCache.pushArray(imgs, this.loadImageEvent.bind(this), this.loadAllEvent.bind(this));
        } 
		
	},
	loadImageEvent: function(e) {
		this.progress.step += 1/this.progress.steps;
		this.progress.bar.updateProgress(this.progress.step,Math.floor(this.progress.step *100)+"%");
		console.log(this.progress.step);
	},
	loadAllEvent: function() {
		this.progress.bar.updateProgress(1,"100%, ready to play!");
		this.animator.panel.enable();
	}

});


/**
 * imageCache.js - image caching framework.
 * Zoltan Hawryluk - http://www.useragentman.com/
 * MIT License.
 */
var imageCache = new function () {
	var me = this;
	var cache = [];
	var root = document.location.href.split('/');
	root.pop();
	root = root.join('/') + '/';
	me.push = function (src, loadEvent) {
		if (!src.match(/^http/)) {
			src = root + src;
		}
		var item = new Image();
		if (cache[src] && loadEvent) {
			loadEvent(src);
		} else {
			if (loadEvent) {
				item.onload = loadEvent;
				item.onerror = loadEvent;
			}
			cache[src]=item;
		}
		item.src = src;
	}
	me.pushArray = function (array, imageLoadEvent, imagesLoadEvent) {
		var numLoaded = 0;
		var arrayLength = array.length;
		for (var i=0; i<arrayLength; i++) {
			me.push(array[i], function (e) {
				if (imageLoadEvent) {
					imageLoadEvent(e);
				}
				numLoaded++;
				if (numLoaded == arrayLength) {
					setTimeout(function () {
						imagesLoadEvent(e);
					}, 1)
				}
			})
		}
	}
}
