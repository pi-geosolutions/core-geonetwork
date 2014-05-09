package fr.pigeosolutions.geoportal.services.layertree;

import java.sql.SQLException;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;

import org.fao.geonet.constants.Geonet;
import org.fao.geonet.constants.Params;
import org.jdom.Element;

//=============================================================================

/** Retrieves a particular user */

public class Get implements Service {
    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    public void init(String appPath, ServiceConfig params) throws Exception {
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
            
            String whereClause = "WHERE parentid=0 ORDER BY weight";
            loadNodes(dbms, layertreeXML, whereClause);
            
            // --- return data
            return response;
    }

    /*
     * Loads the child nodes of parentXML, using the where clause.
     * The where clause can be of the form : "WHERE parentid=0 ORDER BY weight" or anything suitable
     */
     
    private void loadNodes(Dbms dbms, Element parentXML, String where) throws SQLException {
        //lists child nodes
        java.util.List list = dbms.select("SELECT id, parentid, weight, isfolder, json, lastchanged FROM geoportal.nodes "+where).getChildren();
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            //loads the node itself
            String nodeId = node.getChildText("id"); 
            Element nodeXML = new Element("children");
            nodeXML.addContent(new Element("id").setText(nodeId));
            nodeXML.addContent(new Element("jsonextensions").setText(node.getChildText("json"))); //must not be the last item, as it may give way to parsing pbs (see layertree-2json.xsl)
            nodeXML.addContent(new Element("lastchanged").setText(node.getChildText("lastchanged")));
            nodeXML.addContent(new Element("weight").setText(node.getChildText("weight")));
            //load children if there are
            String cond = "WHERE parentid="+nodeId+" AND id<>"+nodeId+"ORDER BY weight";
            loadNodes(dbms, nodeXML, cond);
            
            parentXML.addContent(nodeXML);
        }
        return;
    }    
}