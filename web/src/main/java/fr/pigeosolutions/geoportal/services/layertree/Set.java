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
             if (!this.backup(dbms)) {
                 return new Element(Jeeves.Elem.RESPONSE).setText("ERROR: backing up the tree");
             }
             System.out.println("INFO : properly backed up the previous layertree structure");
            
             Element tree=params;
             if (!this.save(dbms, tree)) {
                 return new Element(Jeeves.Elem.RESPONSE).setText("WARNING: No changes applied");
             }
             
            return new Element(Jeeves.Elem.RESPONSE).setText("success");
    }

    /*
     * Iterates through the tree and creates/updates the nodes in the DB
     */
    private boolean save(Dbms dbms, Element tree) throws SQLException {
        String save_req="BEGIN;";
        save_req+=this.saveChildren(tree);
        save_req+="COMMIT;";
        System.out.println(save_req);
        /*try {
            dbms.execute(save_req);
        } catch (SQLException e) {
            return false; 
        }*/
        return true ; 
    }

    private String saveChildren(Element root) {
        String req="";
        java.util.List list = root.getChildren("children");

        System.out.println(root.getChildText("id")+"has "+list.size()+" children");
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            req += this.saveNode(root.getChildText("id"), node);
            System.out.println(node.getChildText("id") );
            if (!node.getChildren("children").isEmpty()) {
                System.out.println("nodddddeid : "+node.getChildText("id"));

                System.out.println(node.getChildText("id")+"has "+node.getChildren("children").size()+" children");
                req+=this.saveChildren((Element) node.clone());
            }
        }
        return req;
    }

    /*
     * Builds the request for creating/updating the node. Will be executed as a whole in the save function
     */
    private String saveNode(String parentid, Element node) {
        String req="";
        String nodeid = node.getChildText("id");
        System.out.println("nodeid : "+nodeid );
        if (parentid==null) {//then we assume the parent is the <tree> root node : all other node should have an id
            parentid=nodeid;
        }
        String isfolder = "n";
        if (!node.getChildren("children").isEmpty()) {
            isfolder = "y";
        }
        if (nodeid.startsWith("x")) { //it's a new node, we need to create it
            /*we'll have to get back the id of the inserted row, and use it as parentid for children 
             * of this row, if it is a folder. Like :
             * WITH row AS (INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES (2,6,'y','"text":"coucou"') RETURNING id )
                    INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES ((SELECT id FROM row),1,'n','"":"hibou"')
             */
            
            req+= "WITH row"+nodeid+" AS (INSERT INTO geoportal.nodes ((SELECT id FROM row"+nodeid+"), weight, isfolder, json) VALUES ("
                            +parentid+","
                            +node.getChildText("weight")+","
                            +"'"+isfolder+"',"
                            +"'"+node.getChildText("jsonextensions")+"') RETURNING id;"  ;
            if (nodeid.startsWith("x")) {
                req+="UPDATE geoportal.nodes SET parentid= (SELECT id FROM row"+nodeid+") WHERE id = (SELECT id FROM row"+nodeid+");"  ;
            }
        } else { //it's an update of an existing node
            req+= "WITH row"+nodeid+" AS (UPDATE geoportal.nodes SET ((SELECT id FROM row"+nodeid+"), weight, isfolder, json) = ("
                    +parentid+","
                    +node.getChildText("weight")+","
                    +"'"+isfolder+"',"
                    +"'"+node.getChildText("jsonextensions")+"') WHERE id="+nodeid+") RETURNING id;"  ;
        }
        return req;
    }

    /*
     * Gets the tree as an XML structure mixed with json for internal config (nodes config)
     * and saves it in the nodeBackups table, time-stamped
     * TODO : add restore function
     */
    private boolean backup(Dbms dbms) throws SQLException {
        Element layertreeXML = new Element("tree");
        
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

    //TODO : mutualize with same function in Get class
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
                String cond = "WHERE parentid="+nodeId+" AND id<>"+nodeId+"ORDER BY weight";
                loadNodes(dbms, nodeXML, cond);
            } else {
                nodeXML.addContent(new Element("leaf").setText("true"));
            }
            parentXML.addContent(nodeXML);
        }
        return;
    }    
    
}