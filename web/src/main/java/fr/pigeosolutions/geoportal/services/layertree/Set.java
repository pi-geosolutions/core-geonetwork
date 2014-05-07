package fr.pigeosolutions.geoportal.services.layertree;

import java.io.File;
import java.sql.SQLException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamSource;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;

import org.fao.geonet.constants.Geonet;
import org.fao.geonet.constants.Params;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

//=============================================================================

/** Retrieves a particular user */

public class Set implements Service {
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
             if (!this.backup(dbms, context)) {
                 return new Element(Jeeves.Elem.RESPONSE).setText("error");
             }
             System.out.println("INFO : properly backed up the previous layertree structure");
            
            return new Element(Jeeves.Elem.RESPONSE).setText("ok2");
    }

    
     
    private boolean backup(Dbms dbms, ServiceContext context) throws SQLException {
        Element layertreeXML = new Element("tree");
        
        /* add baselayercontainer at the beginning of the layertree
         * {
         * nodeType    : 'gx_baselayercontainer'
         * ,text       : 'Fond de carte'
         * ,allowDrag  : false
         * ,allowDrop  : false
         * }
         */
        Element nodeXML = new Element("children");
        nodeXML.addContent(new Element("nodeType").setText("gx_baselayercontainer"));
        nodeXML.addContent(new Element("text").setText("Fond de carte"));
        nodeXML.addContent(new Element("allowDrag").setText("false"));
        nodeXML.addContent(new Element("allowDrop").setText("false"));
        layertreeXML.addContent(nodeXML);
        //loads the tree from DB
        String whereClause = "WHERE id=parentid ORDER BY weight";
        loadNodes(dbms, layertreeXML, whereClause);
        
        //transforms it to XML text (serializes the tree)
        XMLOutputter xmOut=new XMLOutputter(); 
        String tree = xmOut.outputString(layertreeXML);
        System.out.println("INFO : backing up the previous layertree structure");
        //and commits it to the DB's table nodeBackups
        //id and date will be inserted automatically
        int count = dbms.execute("INSERT INTO geoportal.\"nodesBackups\" (layertree) VALUES (?);"
                ,tree);
        return (count>0) ; //count should be =1 since it changed one and only one column
        
    }

    private void loadNodes(Dbms dbms, Element parentXML, String where) throws SQLException {
        java.util.List list = dbms.select("SELECT id, parentid, weight, isfolder, json FROM geoportal.nodes "+where).getChildren();
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            String nodeId = node.getChildText("id"); 
            Element nodeXML = new Element("children");
            nodeXML.addContent(new Element("id").setText(node.getChildText("id")));
            nodeXML.addContent(new Element("jsonextensions").setText(node.getChildText("json")));
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
        loadNodes(dbms, parentXML, "WHERE parentid="+id+" AND id<>"+id+"ORDER BY weight");
        return;
    }
}