package fr.pigeosolutions.geoportal.services.layertree;

import java.sql.SQLException;
import java.util.Arrays;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;

import org.fao.geonet.constants.Geonet;
import org.jdom.Element;


//=============================================================================

/** Retrieves a particular user */

public class Get implements Service {
    private String withGroups = "false";
    private Element groupsXML;
    
    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    public void init(String appPath, ServiceConfig params) throws Exception {
        withGroups = params.getValue("withGroups");
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {
        Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);
        Element response = new Element(Jeeves.Elem.RESPONSE);
        Element layertreeXML = new Element("tree");
        response.addContent(layertreeXML);

        if (this.withGroups.equalsIgnoreCase("true")) {
            this.groupsXML = dbms.select("SELECT id, name FROM groups ORDER BY id;");
            this.groupsXML.setName("groupsAccessRules");
            String selectClause ="SELECT id, parentid, weight, isfolder, json, lastchanged, excludes, excludes_id FROM geoportal.\"vNodesWithExcludes\" "; 
            String whereClause = "WHERE parentid=0 ORDER BY weight";
            loadNodes(dbms, layertreeXML, selectClause, whereClause);
        } else {
            String selectClause ="SELECT id, parentid, weight, isfolder, json, lastchanged FROM geoportal.nodes "; 
            String whereClause = "WHERE parentid=0 ORDER BY weight";
            loadNodes(dbms, layertreeXML, selectClause, whereClause);
        }

        // --- return data
        return response;
    }

    /*
     * Loads the child nodes of parentXML, using the where clause.
     * The where clause can be of the form : "WHERE parentid=0 ORDER BY weight" or anything suitable
     */
     
    private void loadNodes(Dbms dbms, Element parentXML, String select, String where) throws SQLException {
        //Element groupsXML = dbms.select("SELECT id, name FROM groups;");
        
        //lists child nodes
        java.util.List list = dbms.select(select+" "+where).getChildren();
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            //loads the node itself
            String nodeId = node.getChildText("id"); 
            Element nodeXML = new Element("children");
            nodeXML.addContent(new Element("id").setText(nodeId));
            nodeXML.addContent(new Element("jsonextensions").setText(node.getChildText("json"))); //must not be the last item, as it may give way to parsing pbs (see layertree-2json.xsl)
            nodeXML.addContent(new Element("lastchanged").setText(node.getChildText("lastchanged")));
            nodeXML.addContent(new Element("weight").setText(node.getChildText("weight")));
            if (this.withGroups.equalsIgnoreCase("true")) {
                Element groups = (Element) this.groupsXML.clone();
                java.util.List groupsList = groups.getChildren();
                for (int j = 0; j < groupsList.size(); j++) {
                        Element group = (Element) groupsList.get(j);
                        boolean show = true;
                        //System.out.println(node.getChildText("excludes_id"));
                        String[] excludeIds = node.getChildText("excludes_id").split(",");
                        Arrays.sort(excludeIds);
                        int index =Arrays.binarySearch(excludeIds,  group.getChildText("id"));
                        show = (index < 0); //are listed in exclude the groups for which we want the node NOT to be shown
                                            //so, show is true if the binary Search is negative !
                        group.addContent(new Element("show").setText(String.valueOf(show)));
                        group.setName("group");
                        nodeXML.addContent((Element) group.clone());
                }
                //nodeXML.addContent(groups);
            }
            //load children if there are
            String cond = "WHERE parentid="+nodeId+" AND id<>"+nodeId+"ORDER BY weight";
            loadNodes(dbms, nodeXML, select, cond);
            
            parentXML.addContent(nodeXML);
        }
        return;
    }    
}