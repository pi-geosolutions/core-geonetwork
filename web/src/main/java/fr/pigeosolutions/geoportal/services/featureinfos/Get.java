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
        Element translationsXML = new Element("list");
        response.addContent(translationsXML);
        
        String select = "SELECT layername, json FROM geoportal.\"fiLabels\" ";
        java.util.List list = dbms.select(select).getChildren();
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            Element nodeXML = new Element("children");
            nodeXML.addContent(new Element("layername").setText(node.getChildText("layername")));
            nodeXML.addContent(new Element("json").setText(node.getChildText("json")));
            translationsXML.addContent(nodeXML);
        }
        
        // --- return data
        return response;
    }

}