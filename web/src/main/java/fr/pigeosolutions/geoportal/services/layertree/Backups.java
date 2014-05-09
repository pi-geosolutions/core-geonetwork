package fr.pigeosolutions.geoportal.services.layertree;

import java.io.StringReader;
import java.sql.SQLException;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;

import org.fao.geonet.constants.Geonet;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.xml.sax.InputSource;


//=============================================================================

/** Retrieves a particular user */

public class Backups implements Service {
    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    private enum Mode { //necessary for the switch statement since String can be used in switch statements only since 1.7
        list, get, remove;
    }
    private Mode mode = Mode.list;

    public void init(String appPath, ServiceConfig params) throws Exception {
        String mode = params.getValue("mode");
        if (mode!=null) this.mode=Mode.valueOf(mode);
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {
            Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);
            Element response = new Element(Jeeves.Elem.RESPONSE);
            
            switch (this.mode){
            case list : 
                response.addContent(this.getBackupsList(dbms));
                break;
            case get :
                response.addContent(this.getBackup(params, dbms));
                break;
            case remove: 
                boolean ok = this.removeBackup(params, dbms);
                Element el = new Element("removed");
                el.setText(String.valueOf(ok));
                response.addContent(el);
                break;
            }
            // --- return data
            return response;
    }

    private Element getBackup(Element params, Dbms dbms) throws SQLException {
        String id = "";
        if (params.getName()=="id") {
            id = params.getText();
        } else {
            id = Util.getParam(params, "id");
        }
        if (id==null) return new Element("failure");
        
        Element row = dbms.select("SELECT id, name, layertree FROM geoportal.\"nodesBackups\" WHERE id =?;", Integer.valueOf(id));
        String tree_text = row.getChild("record").getChildText("layertree");
        SAXBuilder sxb = new SAXBuilder();
        Element tree = null;
        try  
        {  
            Document document=sxb.build(new InputSource(new StringReader(tree_text)));
            tree = document.detachRootElement();
        } catch (Exception e) {  
            e.printStackTrace();  
        } 
        return tree;
    }

    private boolean removeBackup(Element params, Dbms dbms) throws SQLException {
        if (params.getName()!="id") return false ; //bad POST data
        String id = params.getText();
        dbms.execute("DELETE FROM geoportal.\"nodesBackups\" WHERE id =?;", Integer.valueOf(id));
        return true;
    }

    private Element getBackupsList(Dbms dbms) throws SQLException {
        Element list = new Element("list");
        list = dbms.select("SELECT id, date, name FROM geoportal.\"nodesBackups\" ORDER BY date DESC LIMIT 50");
        list.setName("list");
        return list;
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