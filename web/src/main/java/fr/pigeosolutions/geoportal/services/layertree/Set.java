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
        dbms.execute("BEGIN;");
        System.out.println("BEGIN;");
        boolean ok = this.saveChildren(tree, 0, dbms);
        if (ok) {
            dbms.execute("COMMIT;");
            System.out.println("COMMIT;");
        } else {
            dbms.execute("ROLLBACK;");
            System.out.println("ROLLBACK;");
        }
        /*try {
            dbms.execute(save_req);
        } catch (SQLException e) {
            return false; 
        }*/
        return true ; 
    }

    private boolean saveChildren(Element root, int parentid, Dbms dbms ) throws SQLException {
        int id=0;
        java.util.List list = root.getChildren("children");

        System.out.println(root.getChildText("id")+"has "+list.size()+" children");
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            id = this.saveNode(parentid, node, dbms);
            if (!node.getChildren("children").isEmpty()) {
                this.saveChildren((Element) node.clone(), id, dbms);
            }
        }
        return true;
    }

    /*
     * Builds the request for creating/updating the node. Will be executed as a whole in the save function
     */
    private int saveNode(int parentid, Element node, Dbms dbms) throws SQLException {
        String req="";
        String nodeid = node.getChildText("id");
        System.out.println("saving node  "+nodeid );
/*        if (parentid==null) {//then we assume the parent is the <tree> root node : all other node should have an id
            parentid=nodeid;
        }
 */       
        String isfolder = node.getChildText("isfolder");
        if (nodeid.startsWith("x")) { //it's a new node, we need to create it
            /*we'll have to get back the id of the inserted row, and use it as parentid for children 
             * of this row, if it is a folder. Like :
             * WITH row AS (INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES (2,6,'y','"text":"coucou"') RETURNING id )
                    INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES ((SELECT id FROM row),1,'n','"":"hibou"')
             */
            
            /*req = "WITH row AS (INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES (?, ?, ?, ?) RETURNING id ), parentid, node.node.getChildText('weight'), isfolder "
                            +"SELECT id from row ;";
                            +parentid+"," 
                            +node.getChildText("weight")+","
                            +"'"+isfolder+"',"
                            +"'"+node.getChildText("jsonextensions")+"') RETURNING id ) "
                            +"SELECT id from row ;";
*/
            //System.out.println(req);
            Element output = dbms.select("WITH row AS (INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES (?, ?, ?, ?) RETURNING id ) SELECT id from row ;", 
                    parentid,
                    Integer.parseInt(node.getChildText("weight")),
                    isfolder,
                    node.getChildText("jsonextensions"));
            nodeid = output.getChild(Jeeves.Elem.RECORD).getChildText("id");
            //node= output.
            System.out.println("recovered node id "+nodeid); 
            
        } else { //it's an update of an existing node
            /*req = "UPDATE geoportal.nodes SET (parentid, weight, isfolder, json) = ("
                    +parentid+","
                    +node.getChildText("weight")+","
                    +"'"+isfolder+"',"
                    +"'"+node.getChildText("jsonextensions")+"') WHERE id="+nodeid+";" ;

            System.out.println(req);*/
            dbms.execute("UPDATE geoportal.nodes SET (parentid, weight, isfolder, json) = (?, ? ,? ,?)  WHERE id=?;", 
                    parentid,
                    Integer.parseInt(node.getChildText("weight")),
                    isfolder,
                    node.getChildText("jsonextensions"), 
                    Integer.parseInt(nodeid)  );
        }
        return Integer.parseInt(nodeid);
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