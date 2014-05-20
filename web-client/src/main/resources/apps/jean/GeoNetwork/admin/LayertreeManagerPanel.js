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
 *  class = LayertreeManagerPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
/** api: constructor 
 *  .. class:: LayertreeManagerPanel(config)
 *
 *  Create a GeoNetwork layertree manager panel
 *  to view, order, edit or add nodes in the geoportal widget's layers tree
 *
 */
//Overrides
Ext.tree.TreePanel.nodeTypes.gx_layer = Ext.tree.TreeNode;
Ext.tree.TreePanel.nodeTypes.gx_baselayercontainer = Ext.tree.TreeNode;


GeoNetwork.admin.LayertreeManagerPanel = Ext.extend(Ext.Panel, {
    frame: false,
    defaultConfig: {
        title: OpenLayers.i18n('Manage Layertree'),
        defaultViewMode: 'simple',
        border: false,
        height: 800,
        layout:'border',
        autoWidth : true
    },
    catalogue:null,
    treeView:null,
    detailView:null,
    consoleView : null,
    tree:null, 
    tb:null,
    nodeForm:null,
    backupsListGrid:null,
    groups:null,
    useGroups:true,
    nodeFormFields : {
    	'chart':['gambia','id', 'type','text', 'uuid','legend','url', 'tablenames', 'changeScales', 'charting_fields', 'other_fields', 'format', 'cls', 'qtip', 'context', 'template', 'extensions'],    	
    	'wms':['gambia','id', 'type','text', 'uuid', 'legend', 'url', 'layers', 'format', 'TILED', 'cls', 'qtip', 'extensions'],
    	'folder':['gambia','id', 'type', 'text', /*'expanded', */'extensions']
    },
    fieldsOrder : ['id', 'type', 'uuid', 'text', 'url', 'layers', 'format', 'TILED','legend',
                   'tablenames', 'changeScales', 'charting_fields', 'other_fields','context', 'template',
                   //'expanded', //suppressed : will be managed in the tree panel
                   'cls', 'qtip', 'extensions'],    	
    
    /** private: method[initComponent] 
     *  Initializes the layertree manager panel.
     *  
     */
    initComponent: function(config){
    
        Ext.apply(this, config);
        Ext.applyIf(this, this.defaultConfig);
        GeoNetwork.admin.LayertreeManagerPanel.superclass.initComponent.call(this);
                
        // Build the layout
        this.detailView = new Ext.Panel({
            region: 'east',
            split: true,
            collapsible: true,
            collapsed: false,
            hideCollapseTool: true,
            collapseMode: 'mini',
            autoScroll: true,
            minWidth: 250,
            width: '50%',
            items: []
        });
        this.tb = this.getToolbar();
        this.treeView = new Ext.Panel({
                region: 'center',
                split: true,
                autoScroll: true,
                minHeigth: 300,
                items: null,
                tbar:this.tb
            });
        this.consoleView = new Ext.Panel({
                region: 'south',
                split: true,
                collapsible: true,
                collapsed: false,
                hideCollapseTool: true,
                collapseMode: 'mini',
                autoScroll: true,
                minHeight: 50,
                height: 100,
                html:"&gt; <b>Welcome in the Layertree Management Board</b><br />It allows you to view, edit, add, transform the layers and the structure<br />"
            });
        
        this.add(this.detailView);
        this.add(this.consoleView);
        this.add(this.treeView);
        
        this.tree = this.loadTree(null, false);
    	this.treeView.add(this.tree);

        this.createForm(this.nodeFormFields, this.fieldsOrder);
        
        this.backupsListGrid = this.createBackupsGrid();
        //this.detailView.add(this.backupsListGrid);
        window.lm = this;
    },
    /**
     * Load layertree data in an Ext.tree
     * 
     * TODO : 
     */
    loadTree: function(specificConfig,overwrite) { //default : specificConfig=null, overwrite=false
    	var treeConfig=null;
    	if (specificConfig!=null) {
    		treeConfig=specificConfig;
    	} else {
    		treeConfig = this.getFromDB();
    	}
    	if (treeConfig==null) return;
    	
    	var treeLoader = new Ext.tree.TreeLoader({ //KEEP IN SYNC WITH THE ONE IN lAYERTREE.JS
    		// this below is using the config attributes of the node to do
    		// some testing. The attr.has_events is coming from the loader in PHP
    		createNode: function(attr) {
				if (attr.layer && attr.text==null) { //deals with importing old-style layertree.js file
	    			attr.text = attr.layer;
	    			attr.leaf=true;
	    			if (attr.TILED==null && attr.type=="wms") attr.TILED=true;
	    		}
	    		if (attr.checked==null && attr.leaf==true) {
	    			attr.checked = false;
	    		}
	    		if (attr.type!='folder' && attr.type!=null) {
	    			attr.leaf=true;
	    		}
	    		if (attr.leaf!=true && attr.type==null) {
	    			//console.log(attr);
	    			attr.type='folder';
	    		}    	//fixes some node values
	    		
	    		if (overwrite==true) {
	    			attr.id = null;
	    		}

    			return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
    		}
		});
	    var treepanel = new Ext.tree.TreePanel({
	        title:'layerTree',
	        header:false,
	        id: "geoportalLayerTree",
	        enableDD: true,
	        autoScroll:true,
		    loader: treeLoader,
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
	        listeners: {
	            click: function(node, event){
	                this.editNode(node);
	            },
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
     * Builds the form dynamically using the nodeFormFields listed fields, 
     * in the order given by fieldsOrder array
     * 
     * TODO : 
     */
    createForm: function(nodeFormFields, fieldsOrder) {
    	var groupStore = null;
    	if (this.useGroups) groupStore=this.getGroups();
        this.nodeForm = new GeoNetwork.admin.LayerForm({
        	'nodeFormFields':nodeFormFields, 
        	'fieldsOrder':fieldsOrder,
        	'groupStore':groupStore});
        this.nodeForm.parent = this;
        this.detailView.add(this.nodeForm);
        this.detailView.doLayout();
    },
    /**
     * Gets the groups list, to use in the form, in order to define per-node group access rights
     * 
     * TODO : 
     */
    getGroups: function() {
        var lang = catalogue.lang;
        var groupStore = GeoNetwork.data.GroupStore(catalogue.services.getGroups);
        groupStore.load();
        return groupStore;
    },
    
    
    /**
     * Displays the layertree as text, in a popup window
     */
    tree2json: function() {
        var json = this.serializeTree();
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
     * Prompts for the content of a layertree.js and loads as the layertree
     */
    json2tree: function() {
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
	            	var newtree = this.treeReload(treeConfig, true);
	            	this.log("Loaded new tree config. Don't forget to <i>Save to DB</i> to apply the changes. You can revert last saved session using Tree->reload.");
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
    /**
     * Reloads the tree structure from DB
     */
    treeReload: function(specificConfig, overwrite) { //default : specificConfig=null, overwrite=false
    	var newtree = this.loadTree(specificConfig, overwrite);
    	if (newtree!=null) {
	    	this.treeView.remove(this.tree);
	    	this.tree.destroy();
	    	this.tree = newtree;
	    	this.treeView.add(newtree);
	    	this.treeView.doLayout();
	    	this.log("Layertree successfully reloaded");
	    	this.nodeForm.hide();
    	} else {
    		this.log("ERROR: couldn't reload the layertree. Please report to your administrator");
    	}
    },
    /**
     * Restores the tree structure from DB backup table
     */
    createBackupsGrid: function() {
    	var backupsListGrid = new GeoNetwork.admin.BackupGridManager({
    		serviceBaseUrl:this.serviceBaseUrl,
    		hidden:true,
    		parent:this
    	});
    	return backupsListGrid;
    },
    treeRestore: function() { 
    	this.nodeForm.hide(); //we hide the panel without destroying it
    	this.backupsListGrid.load();
    	if (!this.detailView.items.contains(this.backupsListGrid)) {
            this.detailView.add(this.backupsListGrid); //add only once. We had to wait for its store to be loaded, before appending to parent container
    	}
    	this.backupsListGrid.show();
    	this.detailView.doLayout()
        return true;
    },

    /**
     * Saves the tree structure on DB
     */
    treeSave: function(name,force) { //if not set, 'force' is 'false' by default
        var xml = this.XMLencapsulateTree(name);
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

                this.log(msg);
            	switch (code) { //see code values in geoportal.service.layertree.Set.java
            	case "1" : //success
            		this.log("Reloading the tree");
            		this.treeReload(null, false);
            		break;
            	case "-1" : //a row (at least) has been changed since last load. Forcing the update would remove changes made by someone else
            		Ext.MessageBox.show({
            			icon: Ext.MessageBox.WARNING,
                        title: OpenLayers.i18n("Database has changed !"), msg:
                        	OpenLayers.i18n("<b>WARNING : the database content has changed since the last time you loaded the layertree</b><br /><b>Proceeding will overwrite some data created by another user. Do you really want to proceed ?</b><br /><br /><i>Please cancel and refer to the docs if you don't know what to do</i>"),
                            buttons: Ext.MessageBox.YESNOCANCEL,
                            fn: function(btn) {
                            	if (btn=='yes') {
                            		this.treeSave(name, true);
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
    XMLencapsulateTree: function(name) {
    	var root = this.tree.getRootNode();
    	var tree_xml = '<tree>\n';
    	tree_xml += "<name>"+name+"</name>\n";
    	tree_xml += this.getChildrenAsXML(root);
    	tree_xml += "</tree>";
    	return tree_xml;
    },
    //used for recursion in the previous function
    getChildrenAsXML: function(root) {
    	if (root.loaded==false) {
    		//workaround to get hidden nodes (unfolded folder)
    		// by default, they are not loaded, thus not available for eachChild function
    		this.tree.getLoader().load(root); 
    	}
    	var children = "";
    	var index = 1;//will be used to determine the node's weight
        root.eachChild(function(node) {
        	var xml = "<children>\n";
        	var attr = this.clone(node.attributes); //to avoid affecting the layertree

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

    		//Encodes some special chars et special fields
    		/*if (attr.legend) {
    			attr.legend = this.encodeHTML(attr.legend);
    		}
    		if (attr.url) {
    			attr.url = this.encodeHTML(attr.url);
    		}
    		if (attr.layer) {
    			attr.layer = this.encodeHTML(attr.layer);
    		}
    		attr.text = this.encodeHTML(attr.text);
			//attr.text = encodeURIComponent(attr.text);
    		*/
    		Ext.iterate(attr, function(key, value) {
    			if ((typeof value )=="string")
    				attr[key] = this.encodeHTML(value);
    		}, this);
    		
    		
        	//remove {} for storage : we just keep the list of key:value pairs 
        	var json = new OpenLayers.Format.JSON().write(attr);
        	if (json.substr(0,1)=="{") {
        		json = json.substr(1, json.length-2);
        	}
        	xml +="<jsonextensions>"+json+"</jsonextensions>\n";
        	xml +="<weight>"+index+"</weight>\n";
        	
        	if (node.hasChildNodes()) {
        		xml += this.getChildrenAsXML(node, "children");
        	}
        	
        	xml += "</children>";

            children+=xml;
        	index++;
        }, this);
        return children;
    },
    /**
     * Builds the layertree as a json object, cleared of all extjs objects, just like plain old layertree.js
     */
    serializeTree: function() {
    	var root = this.tree.getRootNode();
        var treeConfig = this.getChildrenAttributes(root);//is still a js {object}
        var json = new OpenLayers.Format.JSON().write(treeConfig);//serialized is now a string
        return json;
    },
    //used for recursion in the previous function
    getChildrenAttributes: function(root) {
    	if (root.loaded==false) {
    		//workaround to get hidden nodes (unfolded folder)
    		// by default, they are not loaded, thus not available for eachChild function
    		this.tree.getLoader().load(root); 
    	}
    	var obj = {"children":[]};
    	//var index = 1;//will be used to determine the node's weight
        root.eachChild(function(node) {
        	var attr = this.clone(node.attributes); //to avoid affecting the layertree
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
        	attr.children = this.getChildrenAttributes(node).children;
        	if (attr.children.length==0) {
        		delete attr["children"];
        	} 
        	obj.children.push(attr);
        	//index++;
        }, this);
        return obj;
    },
    
    addFolder: function() {
    	var folder = {
    			type:"folder",
    			text:"new folder",
    			iconCls:folder,
    			leaf:false
    	};
    	this.addNode(folder);
    },
    
    addWMS: function() {
    	var wms = {
    			type:"wms",
    			text:"new wms layer",
    			url: "/geoserver-prod/wms?",
    			format:"image/png",
    			TILED:true,
    			checked:false,
    			leaf:true
    	};
    	this.addNode(wms);
    },
    
    addChart: function() {
    	var chart = {
			type:"chart",
			text:"new chart layer",
			url:"http://ilwac.ige.fr/geoportal-services/json_getChartData.php",
			format:"geojson",
			tablenames:'table1, table2, ...',
			changeScales:"2500000,0",
			checked:false,
			leaf:true
    	};
    	this.addNode(chart);
    },
    addNode: function(tpl) {
    	var node = this.tree.getSelectionModel().getSelectedNode();
    	if (node==null) {
    		Ext.Msg.alert('Add node', 'Please first select a parent node in the tree');
    		return false;
    	}
    	if (node.leaf) { //we can add a node only to a folder
    		node = node.parentNode;
    	}
    	var child = new Ext.tree.TreeNode(tpl);
     	node.appendChild(child);
     	//selects and loads the node in the edit form
     	this.tree.getSelectionModel().select(child);
        this.editNode(child);
    	return true;
    },
    editNode:function(node) {
    	this.backupsListGrid.hide();
    	this.nodeForm.show();
        this.nodeForm.editNode(node);
    },
    
    removeNode: function() {
    	var node = this.tree.getSelectionModel().getSelectedNode();
    	if (node==null) {
    		Ext.Msg.alert('You need to select a node, first');
    		return false;
    	}
    	var msg  ="You are about to delete the node "+node.text;
    	if (node.hasChildNodes()) {
    		msg += "<br /> <b>It will remove also all its child nodes. Be very careful !";
    	}
    	Ext.MessageBox.show({
    		icon: Ext.MessageBox.WARNING,
            title: OpenLayers.i18n("Delete node"), 
            msg: OpenLayers.i18n(msg),
            buttons: Ext.MessageBox.OKCANCEL,
            fn: function(btn) {
            	if (btn=='ok') {
            		node.remove(true);
            		this.log("Removed node "+node.text);
            	}
            },
            scope:this
        });
    	return true;
    },
    duplicateNode: function() {
    	var node = this.tree.getSelectionModel().getSelectedNode();
    	if (node==null) {
    		Ext.Msg.alert('You need to select a node, first');
    		return false;
    	}
    	var parent = node.parentNode;
    	var tpl = this.clone(node.attributes);
    	delete tpl.id; //it needs a new id, generated by extjs will be fine (as for added nodes)
    	tpl.text = tpl.text+" (copy)";
    	var child = new Ext.tree.TreeNode(tpl);
    	parent.appendChild(child);
     	//selects and loads the node in the edit form
     	this.tree.getSelectionModel().select(child);
        this.editNode(child);
    	
    	return true;
    },
    
    getToolbar: function() {
    	//TREE actions
       	var action_2json = new Ext.Action({
    		text:'Export as Json',
    		iconCls:'export',
    		handler: this.tree2json,
    	    itemId: 'tree2json',
    	    scope:this
    	});
       	var action_import = new Ext.Action({
    		text:'Import from Json',
    		iconCls:'import',
    		handler: this.json2tree,
    	    itemId: 'json2tree',
    	    scope:this
    	});
    	var action_save = new Ext.Action({
    		text:'Save to DB',
    		iconCls:'save',
    		handler: function() {
    			Ext.MessageBox.prompt('Name', 'Please give it a name:', function(btn, text) {
    				this.treeSave(text,false);
    			},this);
    		},
    	    itemId: 'treesave',
    	    scope:this
    	});
    	var action_reload = new Ext.Action({
    		text:'Reload',
    		iconCls:'reload',
    		handler: function() {
    			this.treeReload(null, false);
    		},
    	    itemId: 'treereload',
    	    scope:this
    	});
    	var action_restore = new Ext.Action({
    		text:'Restore previous version',
    		iconCls:'restore',
    		handler: this.treeRestore,
    	    itemId: 'treerestore',
    	    scope:this
    	});
        var tree_menu = new Ext.menu.Menu({
            id: 'mainMenu',
            items: [
                    action_save,
                    action_reload,
                    action_2json,
                    action_import,
                    action_restore
            ]
        });
        //ADD actions
    	var action_addfolder = new Ext.Action({
    		text:'Add folder',
    		iconCls:'folder',
    		handler: this.addFolder,
    	    itemId: 'addfolder',
    	    scope:this
    	});
    	var action_addwms = new Ext.Action({
    		text:'Add WMS layer (default)',
    		iconCls:'wms',
    		handler: this.addWMS,
    	    itemId: 'addwms',
    	    scope:this
    	});
    	var action_addchart = new Ext.Action({
    		text:'Add chart',
    		iconCls:'chart',
    		handler: this.addChart,
    	    itemId: 'addchart',
    	    scope:this
    	});
        var add_menu = new Ext.menu.Menu({
            id: 'mainMenu',
            items: [
                    action_addfolder,
                    action_addwms,
                    action_addchart
            ]
        });
        //REMOVE actions
    	var action_remove = new Ext.Action({
    		text:'Remove',
    		iconCls:'remove',
    		handler: this.removeNode,
    	    itemId: 'removenode',
    	    scope:this
    	});
        //DUPLICATE actions
    	var action_duplicate = new Ext.Action({
    		text:'Duplicate',
    		iconCls:'duplicate',
    		handler: this.duplicateNode,
    	    itemId: 'duplicatenode',
    	    scope:this
    	});



        var tb = new Ext.Toolbar();
        tb.add({
	            text:'Tree',
	            iconCls: 'tree',  // <-- icon
	            menu: tree_menu  // assign menu by instance
	        },{
	            text:'Add',
	            iconCls: 'add',  // <-- icon
	            menu: add_menu  // assign menu by instance
	        },
	        action_remove,
	        action_duplicate
        );
        return tb;
    },
    /**
     * Utils
     * */
    clone: function(obj) {
    	var newobj = {};
    	return Ext.apply(newobj, obj);
    },
    
    //logs messages in the south panel, used as a console
    log: function(msg) { //careful, it will work only if the class has fully loaded.
    	if (this.consoleView.body!=null) {
        	this.consoleView.body.dom.innerHTML+="<br />&gt; "+msg;
        	this.consoleView.body.scroll('b', Infinity);
    	}
    },
    encodeHTML: function(str) {
    	return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    },
    decodeHTML: function(str) {
    	return str.replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    }

});

/** api: xtype = gn_admin_LayertreeManagerPanel */
Ext.reg('gn_admin_layertreemanagerpanel', GeoNetwork.admin.LayertreeManagerPanel);