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
    
    treeView:null,
    detailView:null,
    consoleView : null,
    tree:null, 
    nodeForm:null,
    nodeFormFields : {
    	'chart':['id', 'type','text', 'uuid','legend','url', 'tablenames', 'changeScales', 'charting_fields', 'other_fields', 'format', 'cls', 'qtip', 'context', 'template', 'extensions'],    	
    	'wms':['id', 'type','text', 'uuid', 'legend', 'url', 'layers', 'format', 'TILED', 'cls', 'qtip', 'extensions'],
    	'folder':['id', 'type', 'text', /*'expanded', */'extensions']
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
        this.treeView = new Ext.Panel({
                region: 'center',
                split: true,
                autoScroll: true,
                minHeigth: 300,
                items: null,
                tbar:this.getToolbar()
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
        
        this.load();
        this.createForm(this.nodeFormFields, this.fieldsOrder);
        window.lm = this;
    },
    /**
     * Load layertree data in an Ext.tree
     * 
     * TODO : 
     */
    load: function() {
    	var treeConfig = this.getFromDB();
    	if (treeConfig==null) return;
    	
    	var treeLoader = new Ext.tree.TreeLoader({
    		// this below is using the config attributes of the node to do
    		// some testing. The attr.has_events is coming from the loader in PHP
    		createNode: function(attr) {
/*	    		if (attr.layer && attr.text==null) {
	    			attr.text = attr.layer;
	    			if (attr.TILED==null && attr.type=="wms") attr.TILED=true;
	    		}
	    		if (attr.type!='folder' && attr.type!=null) {
	    			attr.leaf=true;
	    		}
	    		if (attr.checked==null && (attr.type!="folder" && attr.type!=null)) {
	    			attr.checked = false;
	    		}
	    		if (attr.type==null && attr.leaf!=true) {
	    			attr.type='folder';
	    		}    	//fixes somes node values
	    		if (attr.type=='folder' && attr.children==null) {
	    			attr.iconCls='folder';
	    			attr.leaf=true;
	    		}
*/
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
	    			attr.type='folder';
	    		}    	//fixes somes node values

    			return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
    		}
		});
	    this.tree = new Ext.tree.TreePanel({
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
	                this.nodeForm.editNode(node);
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
    	this.treeView.add(this.tree);
    	//console.log(this.tree.getRootNode().childNodes[2]);
    },
    /**
     * Gets the layertree as json data from the DB, via pigeo services
     * 
     * TODO :
     */
    getFromDB: function() {
        var request = OpenLayers.Request.GET({
            url: this.serviceBaseUrl + "/pigeo.layertree.get",
            async: false
        });

        var treeConfig = null;        
        if (request.responseText) {
        	OpenLayers.Console.log("loading Layertree from database");
        	var jsonTree = new OpenLayers.Format.JSON().read( request.responseText );
        	if (jsonTree.children!=null) {
        		treeConfig = jsonTree.children; //structure we get from DB (new version)
        	} else {
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
        this.nodeForm = new GeoNetwork.admin.LayerForm({'nodeFormFields':nodeFormFields, 'fieldsOrder':fieldsOrder});
        this.nodeForm.parent = this;
        this.detailView.add(this.nodeForm);
        this.detailView.doLayout();
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
     * Saves the tree structure on DB
     */
    treeSave: function() {
        var xml = this.XMLencapsulateTree();
        OpenLayers.Request.POST({
		    url: this.serviceBaseUrl + "/pigeo.layertree.set",
		    header:{"Content-Type":"text/plain"},
		    data: xml,
            success: function(response){
            	var xml = response.responseXML;
                if (xml.firstChild.textContent =="success") {
                	this.log("backed up old layertree");
                    this.log("Successfully saved the layertree to DB");
                } else if (xml.firstChild.textContent.startsWith("WARNING")) {
                    	this.log(xml.firstChild.textContent);
                } else {
                    this.log(xml.firstChild.textContent);
                    Ext.MessageBox.show({icon: Ext.MessageBox.ERROR,
                        title: OpenLayers.i18n("Save layertree"), msg:
                        OpenLayers.i18n("ERROR : couldn't save the layertree. Please contact your administrator."),
                        buttons: Ext.MessageBox.OK});
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
    XMLencapsulateTree: function() {
    	var root = this.tree.getRootNode();
    	var tree_xml = "<tree>\n";
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
        	
        	xml +="<weight>"+index+"</weight>\n";
        	var isfolder = "y";
        	if (attr.type!='folder' && attr.type!=null) {
        		isfolder = "n";
        	} 
        	xml +="<isfolder>"+isfolder+"</isfolder>\n";
        	
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

        	//remove {} for storage : we just keep the list of key:value pairs 
        	var json = new OpenLayers.Format.JSON().write(attr);
        	if (json.substr(0,1)=="{") {
        		json = json.substr(1, json.length-2);
        	}
        	xml +="<jsonextensions>"+json+"</jsonextensions>\n";
        	
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
     	node.appendChild(new Ext.tree.TreeNode(tpl));
    	console.log(node);
    	return true;
    },
    
    getToolbar: function() {
    	var action_2json = new Ext.Action({
    		text:'Export as Json',
    		iconCls:'save',
    		handler: this.tree2json,
    	    itemId: 'tree2json',
    	    scope:this
    	});
    	var action_save = new Ext.Action({
    		text:'Save',
    		iconCls:'save',
    		handler: this.treeSave,
    	    itemId: 'treesave',
    	    scope:this
    	});
        var tree_menu = new Ext.menu.Menu({
            id: 'mainMenu',
            items: [
                    action_2json,
                    action_save
                    /*,{
                    text: 'I like Ext'
                }*/
            ]
        });
        
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


        var tb = new Ext.Toolbar();
        tb.add({
            text:'Tree',
            iconCls: 'bmenu',  // <-- icon
            menu: tree_menu  // assign menu by instance
        },{
            text:'Add',
            iconCls: 'bmenu',  // <-- icon
            menu: add_menu  // assign menu by instance
        });
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
    }

});

/** api: xtype = gn_admin_LayertreeManagerPanel */
Ext.reg('gn_admin_layertreemanagerpanel', GeoNetwork.admin.LayertreeManagerPanel);