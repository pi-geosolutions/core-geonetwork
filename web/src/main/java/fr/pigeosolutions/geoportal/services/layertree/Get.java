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
            Element layertreeXML = new Element(Jeeves.Elem.RESPONSE);
            
            /* add baselayercontainer at the beginning of the layertree
             * {
             * nodeType    : 'gx_baselayercontainer'
             * ,text       : 'Fond de carte'
             * ,allowDrag  : false
             * ,allowDrop  : false
             * }
             */
            Element nodeXML = new Element("treeConfig");
            nodeXML.addContent(new Element("nodeType").setText("gx_baselayercontainer"));
            nodeXML.addContent(new Element("text").setText("Fond de carte"));
            nodeXML.addContent(new Element("allowDrag").setText("false"));
            nodeXML.addContent(new Element("allowDrop").setText("false"));
            layertreeXML.addContent(nodeXML);
            
            String whereClause = "WHERE id=parentid ORDER BY weight";
            loadNodes("treeConfig",dbms, layertreeXML, whereClause);
            
            // --- return data
            return layertreeXML;
    }

    
     
    private void loadNodes(String nodename, Dbms dbms, Element parentXML, String where) throws SQLException {
        java.util.List list = dbms.select("SELECT id, parentid, weight, isfolder, jsonextensions FROM geoportal.nodes "+where).getChildren();
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            String nodeId = node.getChildText("id"); 
            //Element nodeXML = new Element("node").setText(node.getChildText("json")).setAttribute("id", nodeId).setAttribute("weight", node.getChildText("weight")).setAttribute("isfolder", node.getChildText("isfolder")) ;
            //Element nodeXML = new Element("children").setAttribute("id", nodeId).setAttribute("weight", node.getChildText("weight")).setAttribute("isfolder", node.getChildText("isfolder")) ;
            Element nodeXML = new Element(nodename);
            nodeXML.addContent(new Element("id").setText(node.getChildText("id")));
            nodeXML.addContent(new Element("jsonextensions").setText(node.getChildText("jsonextensions")));
            nodeXML.addContent(new Element("weight").setText(node.getChildText("weight")));
            if (node.getChildText("isfolder").equalsIgnoreCase("y")) {
                loadChildNodes(dbms, Integer.valueOf(nodeId), nodeXML);
            } else {
                nodeXML.addContent(new Element("leaf").setText("true"));
            }
            parentXML.addContent(nodeXML);
        }
        return;
    }    
    
    private void loadChildNodes(Dbms dbms, int id, Element parentXML) throws SQLException {
        loadNodes("children",dbms, parentXML, "WHERE parentid="+id+" AND id<>"+id+"ORDER BY weight");
        return;
    }
}