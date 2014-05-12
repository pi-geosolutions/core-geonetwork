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
 *  class = LayerForm
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: LayerForm(config)
 *
 *  Creates an specific form, for node attributes edition 
 *  (layer parameters' edition, actually)
 *
 */

GeoNetwork.admin.LayerForm = Ext.extend(Ext.form.FormPanel, {
    id: 'node-form',
    labelWidth:75,
    frame:true,
    labelAlign: 'left',
    title: 'node details', 
    defaultType: 'textfield',
    defaults: {width: '90%', 'hidden':true},
    autoHeight: true,
    border: false,
    hidden:true,
    
    nodeFormFields : null, //should be initialized by constructor. See LayertreeManager class
    fieldsOrder : null, //idem
    groupStore : null,
    currentNode:null,
    groupsForm:null,
    
    /** private: method[initComponent] 
     *  Initializes the form panel
     *  
     *  TODO : 
     */
    initComponent: function(config){
    	var me=this;
    	this.buttons = [{
            text: 'Apply',
            //iconCls:'icon-disk',
            handler:this.applyChanges,
            scope:this
        },{
            text: 'Cancel changes',
            handler: function(button, event) {
            	this.editNode(this.currentNode);
            },
            scope:this
        }];
    	
    	
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.admin.LayerForm.superclass.initComponent.call(this);
                
        if (this.nodeFormFields!=null) {
        	this.Build();
        }
    },
    
    /** private: method[Build] 
     *  Builds the form itself
     *  
     *  TODO : 
     */
    Build: function() {
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
    					/*items.push({
		            	xtype: 'combo',
		                fieldLabel: fname,
		                name: fname,
		                typeAhead: true,
		                triggerAction: 'all',
		                lazyRender:true,
		                mode: 'local',
		                store: new Ext.data.ArrayStore({
		                    id: 0,
		                    fields: [
		                        'value',
		                        'text'
		                    ],
		                    data: [[true, 'Yes'],[false, 'No']]
		                }),
		                valueField: 'value',
		                displayField: 'text'
		            });*/
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
    
    buildGroupsForm: function() {
    	if (this.groupStore==null) return null;
    	
    	var groups = [];
    	var checkGroup=null;
    	this.groupStore.sort("id");
    	this.groupStore.each( function(rec) {
    		groups.push({
	        	boxLabel: rec.data.name,
	            //inputValue:true,
	            name: "groups_"+rec.id,
	            checked:true
	        });
    	}, this);
    	checkGroup = new Ext.form.FieldSet({
    	        xtype: 'fieldset',
    	        title: 'Groups visibility',
    	        autoHeight: true,
    	        layout: 'form',
    	        frame:true,
    	        /*collapsed: false,   
    	        collapsible: true,*/
    	        hidden:false,
    	        items: [/*{
    	            xtype: 'textfield',
    	            name: 'txt-test3',
    	            fieldLabel: 'Groups : checked groups will be able to see the layer, others not',
    	            anchor: '95%'
    	        },*/{
    	            // Use the default, automatic layout to distribute the
					// controls evenly
    	            // across a single row
    	            xtype: 'checkboxgroup',
    	            fieldLabel: 'Groups',
    	            items: groups,
    	            name:'cbgroup'
    	        }]
    	    });
    	//we make the checkboxes always shown whatever the node type
    	Ext.iterate(this.nodeFormFields, function(type, index) {
    		this.nodeFormFields[type].push("cbgroup");
		},this);
    	return checkGroup;
    },

    /**
     * Loads node attributes in the form
     * 
     * TODO : 
     */
    editNode: function(node) {
    	if (this.hidden) this.show();
    	//builds the form structure corresponding to the node type
    	if (node.attributes.type) {
    		//console.log(node.attributes.type +"\t\t "+node.text);
    		this.initForm(node.attributes.type);
    	} else {
        	this.getForm().reset();
    	}
    	//adds the groups visibility checkbox fieldset
    	if (this.groupStore!=null && this.groupsForm==null) {
    		this.groupsForm = this.buildGroupsForm();
    		this.add(this.groupsForm);
    		this.groupsForm.show();
    		this.doLayout();
    	}
		this.groupsForm.items.items[0].setValue(Ext.pluck(node.attributes.group, "show"));
    	
    	//loads the node values in the form
    	this.log("loaded parameters for layer : <i>"+node.text+"</i>");
    	this.getForm().setValues(node.attributes);
    	//this.getForm().findField("gambia").setValue(node.attributes.group[3].show);
    	this.currentNode=node;
    },

    /**
     * Resets the form : 
     * - resets the content
     * - hides/shows the fields depending on the node type
     * 
     * TODO : 
     */
    initForm: function(type) {
     	this.getForm().reset();
     	
     	Ext.each(this.getForm().items.items, function(field,index) {
     		console.log(field.name);
     		if (this.nodeFormFields[type].indexOf(field.name)>=0) {
     			field.show();
     		} else {
         		field.hide();
     		}
     	}, this);
    },
    
    /**
     * Applies the changes in the form to the node attributes & display in the tree
     * 
     * TODO : 
     */
    applyChanges: function(button, event) {
    	var node = this.currentNode;
		if (node!=null) {
			var values = this.getForm().getFieldValues();
			//collect the relevant data
			var attr={};
			Ext.iterate(values, function(key, value) {
				if (this.nodeFormFields[node.attributes.type].indexOf(key)>=0) {
					attr[key]=value;
				}
			}, this)
			//specifics
			if (attr.format!=null) {
				attr.format = attr.format.inputValue;
			}
			attr.layer=attr.text;

			//specifics to group visibility management : 
			var checkedGroups = Ext.pluck(lm.nodeForm.groupsForm.items.items[0].items.items, "checked");
			Ext.each(node.attributes.group, function(grp, index) {
				grp.show  = checkedGroups[index];
			});
			delete attr.cbgroup;
			
			//apply on node
			Ext.apply(node.attributes,attr);
			
			node.setText(attr.text);

	    	this.log("layer <i>"+attr.text+"</i> successfully updated. Don't forget to save the tree when you are done.");
	    	console.log(node);
		}
    },
    
    log: function(msg) {
    	if (this.parent!=null) {
    		this.parent.log(msg);
    	}
    }
});

/** api: xtype = gn_admin_LayerForm */
Ext.reg('gn_admin_layerform', GeoNetwork.admin.LayerForm);