package fr.pigeosolutions.geoportal.services.featureinfos;

import java.sql.SQLException;
import java.util.Arrays;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;

import org.fao.geonet.constants.Geonet;
import org.jdom.Element;


//=============================================================================

/** Retrieves a particular user */

public class ListNodes implements Service {
    
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
        Element listXML = new Element("list");
        response.addContent(listXML);
        
        String query = "SELECT id, json, lastchanged FROM geoportal.nodes WHERE isfolder='n'";
        java.util.List list = dbms.select(query).getChildren();
        
        for (int i = 0; i < list.size(); i++) {
            //System.out.println(i);
            Element node = (Element) list.get(i);
            //loads the node itself
            String nodeId = node.getChildText("id"); 
            Element nodeXML = new Element("nodes");
            nodeXML.addContent(new Element("id").setText(nodeId));
            nodeXML.addContent(new Element("jsonextensions").setText(node.getChildText("json"))); //must not be the last item, as it may give way to parsing pbs (see layertree-2json.xsl)
            nodeXML.addContent(new Element("lastchanged").setText(node.getChildText("lastchanged")));
            listXML.addContent(nodeXML); 
        }
        // --- return data
        return response;
    }

}