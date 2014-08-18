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
 *  class = LayertreeIO
 */
/** api: constructor 
 *  .. class:: LayertreeIO(config)
 *
 *  Input/output features for layertree
 *
 */
GeoNetwork.admin.LayertreeIO = Ext.extend(Object, {
    someProperty: 'something',
    serviceBaseUrl : null,
    verbose:false,//displays error and info messages : set it true on the admin side, false on the client side
    logWindow:null, //the place where to write logging (console)

  ////
 ////      IN 
////
    
    /**
     * Load layertree data in an Ext.tree
     * Params : specificConfig : default value should be null. Used if we want to load the tree from elsewhere than the DB (set it to the tree config you wanted)
     * 			doOverwrite : should default to false. If true, the nodes IDs are reset, causing the complete overwrite in the DB
     * TODO : 
     */
    loadTree: function(specificConfig,doOverwrite) { //default : specificConfig=null, overwrite=false
		var treepanel=null;
		try {
	    	var treeConfig=null;
	    	if (specificConfig!=null) {
	    		treeConfig=specificConfig;
	    	} else {
	    		treeConfig = this.getFromDB();
	    	}
	    	if (treeConfig==null) return;
	    	
	    	treepanel = new Ext.tree.TreePanel({
		        title:'layerTree',
		        header:false,
		        id: "geoportalLayerTree",
		        enableDD: true,
		        autoScroll:true,
			    loader: new GeoNetwork.admin.GeoportalTreeLoader({overwrite:doOverwrite}),
	        	root: {
		            nodeType: "async",
		            // the children property of an Ext.tree.AsyncTreeNode is used to
		            // provide an initial set of layer nodes. We use the treeConfig
		            // from above, that we created with OpenLayers.Format.JSON.write.
		            children: treeConfig,
		            expanded:true,
		            type:'folder',
		            id:0
		        },
		        rootVisible: true,
		        border: false,
		        layout:'fit',
		        listeners: {/*
		            click: function(node, event){
		                this.editNode(node);
		            },*/
		            expandnode: function(node){
		                node.attributes.expanded = node.isExpanded();
		            },
		            collapsenode: function(node){
		                node.attributes.expanded = node.isExpanded();
		            },
		            checkchange: function(node, checked){
		                node.attributes.checked = checked;
		            },
		            scope : this
		        }
		    });
    	} catch (err) {
	    	if (this.verbose) {
	    		var errormsg = "ERROR : couldn't load the layertree. Some of the changes you recently made must cause the problem. "+
				"Most likely you have used improper characters, like doublequotes, where you weren't expected to. " +
				"You are advised to restore a previous backup and try again. If you can't solve it, please contact your administrator."
				GeoNetwork.admin.Utils.log(this.logWindow,errormsg);
				Ext.MessageBox.show({
					icon: Ext.MessageBox.ERROR,
					title: OpenLayers.i18n("Load layertree"), msg:
					OpenLayers.i18n(errormsg),
					buttons: Ext.MessageBox.OK
				});
	    	}
		}
	    return treepanel;
    },
    /**
     * Gets the layertree as json data from the DB, via pigeo services
     * 
     * TODO :
     */
    getFromDB: function() {
        var request = OpenLayers.Request.GET({
            url: this.serviceBaseUrl + "/pigeo.layertree.admin.get",
            async: false
        });

        var treeConfig = null;
        treeConfig = [{
			nodeType    : 'gx_baselayercontainer'
				,text	    : 'Fond de carte'
				,allowDrag  : false
				,allowDrop  : false
			},
			
			{
				text        : 'Overlay folder',
				type		: 'folder'
			}];
        if (request.responseText) {
        	OpenLayers.Console.log("loading Layertree from database");
        	var jsonTree = new OpenLayers.Format.JSON().read( request.responseText );
        	if (jsonTree.children!=null) {
        		treeConfig = jsonTree.children; //structure we get from DB (new version)
        	} else if (jsonTree.treeConfig!=null){
            	treeConfig = jsonTree.treeConfig;//structure we get from old layertree files
        	} 
        } 
        return treeConfig;
    },    
    /**
     * Prompts for the content of a layertree.js and loads as the layertree
     */
    json2tree: function(callback, cbscope) {
    	var form = new Ext.form.FormPanel({
            baseCls: 'x-plain',
        	labelWidth:75,
            layout: {
                type: 'vbox',
                align: 'stretch'  // Child items are stretched to full width
            },
            labelAlign: 'left',
            title: 'Paste json code in this field',
            defaults: {
                xtype: 'textfield'
            },
            items: {
				xtype : 'textarea',
				fieldLabel : "json",
				name : "json",
	            hideLabel: true,
	            flex: 1  // Take up all *remaining* vertical space
			}
        });
            
        var win = new Ext.Window({
        	title:'Import from json',
            collapsible: true,
            maximizable: true,
        	layout:'fit',
            width:'70%',
            height:400,
            minWidth: 300,
            minHeight: 200,
            modal:true,
            closeAction:'close',
            bodyStyle: 'padding:5px;',
            buttonAlign: 'center',
            plain: true,
            items : form,
            buttons: [{
	            text: 'Apply',
	            handler:function(button, event) {
	            	var text = form.getForm().getFieldValues().json;
	            	var jsonTree = Ext.decode( text );
	            	if (jsonTree.children!=null) {
	            		treeConfig = jsonTree.children; //structure we get from DB (new version)
	            	} else {
	                	treeConfig = jsonTree.treeConfig;//structure we get from old layertree files
	            	}
	            	//var newtree = this.treeReload(treeConfig, true);
	            	callback.call(cbscope,treeConfig, true);
	            	GeoNetwork.admin.Utils.log(this.logWindow,"Loaded new tree config. Don't forget to <i>Save to DB</i> to apply the changes. You can revert last saved session using Tree->reload.");
	            	win.close();
	            },
	            scope:this
	        },{
	            text: 'Cancel',
	            handler: function(button, event) {
	            	win.close();
	            }
	        }]
        });
	    win.show(this);
    },
    
    
    

    ////
   ////      OUT
  ////

    
    /**
     * Displays the layertree as text, in a popup window
     */
    tree2json: function(tree) {
        var json = this.serializeTree(tree);
        var win = new Ext.Window({
        	title:'Layertree (JSON)',
        	layout:'border',
            width:'70%',
            height:400,
            modal:true,
            closeAction:'close',
            maximizable:true,
            plain: true,
            items : new Ext.Panel({
            	region:'center',
            	autoScroll:true,
                html:json
            })
        });
	    win.show(this);
    },

    /**
     * Builds the layertree as a json object, cleared of all extjs objects, just like plain old layertree.js
     */
    serializeTree: function(tree) {
    	var root = tree.getRootNode();
        var treeConfig = this.getChildrenAttributes(tree, root);//is still a js {object}
        var json = new OpenLayers.Format.JSON().write(treeConfig);//serialized is now a string
        return json;
    },
    //used for recursion in the previous function
    getChildrenAttributes: function(tree, root) {
    	if (root.loaded==false) {
    		//workaround to get hidden nodes (unfolded folder)
    		// by default, they are not loaded, thus not available for eachChild function
    		tree.getLoader().load(root); 
    	}
    	var obj = {"children":[]};
    	//var index = 1;//will be used to determine the node's weight
        root.eachChild(function(node) {
        	var attr = GeoNetwork.admin.Utils.clone(node.attributes); //to avoid affecting the layertree
        	delete attr["loader"]; //a bit of cleanup
        	delete attr["children"]; //a bit of cleanup
    		delete attr.leaf; //will be automatically generated
    		delete attr.weight; //will be automatically generated
    		if (attr.cls!=null) {
    			var nodecls = attr.cls;
    			attr.cls = nodecls.replace("x-tree-node-expanded","");
    			if (attr.cls.length == 0) delete attr.cls;
    		}
    		if (attr.type=='folder') {
    			delete attr.layer;
    		}
        	
        	//attr.weight = index;
        	attr.children = this.getChildrenAttributes(tree, node).children;
        	if (attr.children.length==0) {
        		delete attr["children"];
        	} 
        	obj.children.push(attr);
        	//index++;
        }, this);
        return obj;
    },
    
    /**
     * Saves the tree structure on DB
     */
    treeSave: function(tree, name,force, callback, cbscope) { //if not set, 'force' is 'false' by default
        var xml = this.XMLencapsulateTree(tree, "backup "+name);
        var serviceurl = this.serviceBaseUrl + "/pigeo.layertree.admin.set";
        if (force==true) { //we pass an additional parameter telling it not to care about eventual external changes in the DB
        	serviceurl= this.serviceBaseUrl + "/pigeo.layertree.admin.set_force";
        }
        OpenLayers.Request.POST({
		    url: serviceurl,
		    header:{"Content-Type":"text/xml"},
		    data: xml,
            success: function(response){
            	var xml = response.responseXML;
            	var status = xml.firstChild.getElementsByTagName("status")[0].textContent;
            	var code = xml.firstChild.getElementsByTagName("code")[0].textContent;
            	var msg = xml.firstChild.getElementsByTagName("message")[0].textContent;

                GeoNetwork.admin.Utils.log(this.logWindow,msg);
            	switch (code) { //see code values in geoportal.service.layertree.Set.java
            	case "1" : //success
            		GeoNetwork.admin.Utils.log(this.logWindow,"Reloading the tree");
//fix            		this.treeReload(null, false);

	            	callback.call(cbscope,null, false);
            		break;
            	case "-1" : //a row (at least) has been changed since last load. Forcing the update would remove changes made by someone else
            		Ext.MessageBox.show({
            			icon: Ext.MessageBox.WARNING,
                        title: OpenLayers.i18n("Database has changed !"), msg:
                        	OpenLayers.i18n("<b>WARNING : the database content has changed since the last time you loaded the layertree</b><br /><b>Proceeding will overwrite some data created by another user. Do you really want to proceed ?</b><br /><br /><i>Please cancel and refer to the docs if you don't know what to do</i>"),
                            buttons: Ext.MessageBox.YESNOCANCEL,
                            fn: function(btn) {
                            	if (btn=='yes') {
                            		this.treeSave(tree, name, true);
                            	}
                            },
                            scope:this
                    });
            		break;
            	default:
            		Ext.MessageBox.show({icon: Ext.MessageBox.ERROR,
                        title: OpenLayers.i18n("Save layertree"), msg:
                        OpenLayers.i18n("ERROR : couldn't save the layertree. Please contact your administrator."),
                        buttons: Ext.MessageBox.OK});
            		break;
            	}
            },
            failure: function(response){
            	Ext.MessageBox.show({icon: Ext.MessageBox.ERROR,
                    title: OpenLayers.i18n("Save layertree"), msg:
                    OpenLayers.i18n("ERROR : couldn't save the layertree. Please contact your administrator."),
                    buttons: Ext.MessageBox.OK});
            },
            scope : this
        });
    },    
    /**
     * Builds the layertree as a json object, cleared of all extjs objects, just like plain old layertree.js
     */
    XMLencapsulateTree: function(tree,name) {
    	var root = tree.getRootNode();
    	var tree_xml = '<tree>\n';
    	tree_xml += "<name>"+name+"</name>\n";
    	tree_xml += this.getChildrenAsXML(tree, root);
    	tree_xml += "</tree>";
    	return tree_xml;
    },
    //used for recursion in the previous function
    getChildrenAsXML: function(tree,root) {
    	if (root.loaded==false) {
    		//workaround to get hidden nodes (unfolded folder)
    		// by default, they are not loaded, thus not available for eachChild function
    		tree.getLoader().load(root); 
    	}
    	var children = "";
    	var index = 1;//will be used to determine the node's weight
        root.eachChild(function(node) {
        	var xml = "<children>\n";
        	var attr = GeoNetwork.admin.Utils.clone(node.attributes); //to avoid affecting the layertree

        	xml +="<id>"+attr.id+"</id>\n";
        	delete attr["id"]; //a bit of cleanup
        	
        	var isfolder = "y";
        	if (attr.type!='folder' && attr.type!=null) {
        		isfolder = "n";
        	} 
        	xml +="<isfolder>"+isfolder+"</isfolder>\n";
        	xml +="<lastchanged>"+attr.lastchanged+"</lastchanged>\n";
        	
        	delete attr["loader"]; //a bit of cleanup
        	delete attr["children"]; //a bit of cleanup
    		delete attr.lastchanged; //a bit of cleanup
    		delete attr.loaded; //a bit of cleanup
    		delete attr.iconCls; //a bit of cleanup
    		delete attr.leaf; //will be automatically generated
    		delete attr.weight; //will be automatically generated
    		if (attr.cls!=null) {
    			var nodecls = attr.cls;
    			attr.cls = nodecls.replace("x-tree-node-expanded","");
    			if (attr.cls.length == 0) delete attr.cls;
    		}
    		if (attr.type=='folder') {
    			delete attr.layer;
    		}
    		
    		//groups visibility management
    		Ext.each(attr.group, function (grp, idx) {
        		xml +="<group>\n<id>"+grp.id+"</id>\n";
        		xml +="<name>"+grp.name+"</name>\n";
        		xml +="<show>"+grp.show+"</show>\n</group>\n";
    		});
    		delete attr.group;

    		Ext.iterate(attr, function(key, value) {
    			if ((typeof value )=="string")
    				attr[key] = GeoNetwork.admin.Utils.encodeHTML(value);
    		}, this);
    		
    		
        	//remove {} for storage : we just keep the list of key:value pairs 
        	var json = new OpenLayers.Format.JSON().write(attr);
        	if (json.substr(0,1)=="{") {
        		json = json.substr(1, json.length-2);
        	}
        	xml +="<jsonextensions>"+json+"</jsonextensions>\n";
        	xml +="<weight>"+index+"</weight>\n";
        	
        	if (node.hasChildNodes()) {
        		xml += this.getChildrenAsXML(tree, node);
        	}
        	
        	xml += "</children>";

            children+=xml;
        	index++;
        }, this);
        return children;
    }
});