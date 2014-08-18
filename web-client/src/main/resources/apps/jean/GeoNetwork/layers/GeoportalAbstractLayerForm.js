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
 *  class = GeoportalAbstractLayerForm
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: GeoportalAbstractLayerForm(config)
 *
 *  Creates an specific form, for node attributes edition 
 *  (layer parameters' edition, actually)
 *
 */

GeoNetwork.layers.GeoportalAbstractLayerForm = Ext.extend(Ext.form.FormPanel, {
    labelWidth:100,
    frame:true,
    labelAlign: 'left',
    title: 'Node details', 
    defaultType: 'textfield',
    defaults: {width: '90%', 'hidden':false},
    autoHeight: true,
    border: false,

    logWindow:null,
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
    		xtype : 'numberfield',
    		name : 'opacity',
    		value : 1.0,
    		maxValue : 1.0,
    		minValue : 0
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
    }],
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
        GeoNetwork.layers.GeoportalAbstractLayerForm.superclass.initComponent.call(this);
                
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
    	Ext.each(this.nodeFormFields, function (set, index) {
        	var fset = new Ext.form.FieldSet(set);
        	this.add(fset);
    	}, this);
    	window.fm = this;
    },
    
    buildGroupsForm: function() {
    	if (this.groupStore==null) return null;
    	
    	var groups = [];
    	var checkGroup=null;
    	//this.groupStore.sort("id");
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
    	        collapsible:false,
    	        layout: 'form',
    	    	defaults: {width: '90%', 'hidden':false, xtype : 'textfield'},
    	        items: [{
    	            // Use the default, automatic layout to distribute the
					// controls evenly
    	            // across a single row
    	        	id:'groupscbg',
    	            xtype: 'checkboxgroup',
    	            fieldLabel: 'Groups',
    	            items: groups,
    	            name:'cbgroup'
    	        }]
    	    });
    	return checkGroup;
    },

    /**
     * Loads node attributes in the form
     * 
     * TODO : 
     */
    editNode: function(geoplayer) {
    	var node = geoplayer.getTreeNode();
    	if (this.hidden) this.show();
    	//adds the groups visibility checkbox fieldset
    	if (this.groupStore!=null && this.groupsForm==null) {
    		this.groupsForm = this.buildGroupsForm();
    		this.add(this.groupsForm);
    		this.groupsForm.show();
    		this.doLayout();
    	}
		this.groupsForm.items.items[0].setValue(Ext.pluck(node.attributes.group, "show"));
    	
    	//loads the node values in the form
    	GeoNetwork.admin.Utils.log(this.logWindow,"loaded parameters for layer : <i>"+node.text+"</i>");
    	this.getForm().setValues(node.attributes);
    	//this.getForm().findField("gambia").setValue(node.attributes.group[3].show);
    	this.currentNode=node;
    },

    /**
     * Resets the form : 
     * - resets the content
     * 
     * TODO : 
     */
    initForm: function(type) {
     	this.getForm().reset();
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
			window.galf = this;
			Ext.apply(attr, this.getForm().getFieldValues());
			/*Ext.iterate(values, function(key, value) {
				if (this.nodeFormFields[node.attributes.type].indexOf(key)>=0) {
					attr[key]=value;
				}
			}, this)*/
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
			
			attr.qtip = attr.qcktip;
			
			//apply on node
			Ext.apply(node.attributes,attr);
			
			node.setText(attr.text);

	    	GeoNetwork.admin.Utils.log(this.logWindow,"layer <i>"+attr.text+"</i> successfully updated. Don't forget to save the tree when you are done.");
	    }
    },
    
    log: function(msg) {
    	if (this.logHandler!=null) {
    		this.logHandler.log(msg);
    	}
    }
});

/** api: xtype = gn_layers_geoportalabstractlayerform */
Ext.reg('gn_layers_geoportalabstractlayerform', GeoNetwork.layers.GeoportalAbstractLayerForm);