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
    private boolean force=false;
    private String idslist="";//we will list the saved nodes, in order to clean the table of its unused nodes

    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    public void init(String appPath, ServiceConfig params) throws Exception {
        this.force = (params.getValue("force").equalsIgnoreCase("true"));
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {
            Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);
             if (!this.backup(dbms, params)) {
                 return new Element(Jeeves.Elem.RESPONSE).setText("ERROR: backing up the tree");
             }
             System.out.println("INFO : properly backed up the previous layertree structure");
            
             Element response = new Element(Jeeves.Elem.RESPONSE);
             Element status = new Element("status");
             Element code = new Element("code");
             Element message = new Element("message");
             response.addContent(status);
             response.addContent(code);
             response.addContent(message);
             
             Element tree=params;
             int result = this.save(dbms, tree); 
             /*gets the output code
              * output codes are : 
              *      1 : successful outcome
              *     -1 : a row (at least) has been changed since last load. Forcing the update would remove changes made by someone else
              */             
             switch (result) {
             case 1 : 
                 //return new Element(Jeeves.Elem.RESPONSE).setText("success");
                 status.setText("success");
                 code.setText("1");
                 message.setText("Layertree successfully saved to DB");
                 break;
             case -1 : 
                 //return new Element(Jeeves.Elem.RESPONSE).setText("WARNING (output code -1): some data have been changed on the DB");
                 status.setText("error");
                 code.setText("-1");
                 message.setText("WARNING (output code -1): some data have been changed on the DB");
                 break;
             default:                 //return new Element(Jeeves.Elem.RESPONSE).setText("WARNING (output code -1): some data have been changed on the DB");
                 status.setText("unknown");
                 code.setText(String.valueOf(result));
                 message.setText("unknown result value");
                 break;
             }
             
             return response;
    }

    /*
     * Iterates through the tree and creates/updates the nodes in the DB
     */
    private int save(Dbms dbms, Element tree) throws SQLException {
        this.idslist = "";
        
        System.out.println("Saving the new tree structure...");
        dbms.execute("BEGIN;");
        System.out.println("BEGIN;");
        int result = this.saveChildren(tree, 0, dbms);
        this.idslist=this.idslist.substring(0, idslist.length()-1);//we remove the last trailing ','
        String cleanRequest = "DELETE FROM geoportal.nodes WHERE id NOT IN ("+this.idslist +");"  ;
        //System.out.println(cleanRequest);
        dbms.execute(cleanRequest);
        if (result == 1) {
            dbms.execute("COMMIT;");
            System.out.println("COMMIT;");
            System.out.println("done;");
        } else {
            dbms.execute("ROLLBACK;");
            System.out.println("ROLLBACK;");
            System.out.println("Error executing SQL requests;");
            return result;
        }
        /*try {
            dbms.execute(save_req);
        } catch (SQLException e) {
            return false; 
        }*/
        return 1 ; 
    }

    private int saveChildren(Element root, int parentid, Dbms dbms ) throws SQLException {
        int id=0; 
        java.util.List list = root.getChildren("children");

        //System.out.println(root.getChildText("id")+"has "+list.size()+" children");
        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            id = this.saveNode(parentid, node, dbms);
            if (id < 0) return id; //reports an error
            else idslist+=id+",";
            if (!node.getChildren("children").isEmpty()) {
                this.saveChildren((Element) node.clone(), id, dbms);
            }
        }
        return 1;
    }

    /*
     * Builds the request for creating/updating the node. Will be executed as a whole in the save function
     */
    private int saveNode(int parentid, Element node, Dbms dbms) throws SQLException {
        String req="";
        String nodeid = node.getChildText("id");
        //System.out.println("saving node  "+nodeid );
/*        if (parentid==null) {//then we assume the parent is the <tree> root node : all other node should have an id
            parentid=nodeid;
        }
 */       
        String isfolder = node.getChildText("isfolder");
        String lastchanged = node.getChildText("lastchanged");
        if (nodeid.startsWith("x")) { //it's a new node, we need to create it
            /*we'll have to get back the id of the inserted row, and use it as parentid for children 
             * of this row, if it is a folder.
             */
            Element output = dbms.select("WITH row AS (INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES (?, ?, ?, ?) RETURNING id ) SELECT id from row ;", 
                    parentid,
                    Integer.parseInt(node.getChildText("weight")),
                    isfolder,
                    node.getChildText("jsonextensions"));
            nodeid = output.getChild(Jeeves.Elem.RECORD).getChildText("id");
            //node= output.
            System.out.println("recovered node id "+nodeid); 
            
        } else { //it's an update of an existing node. We check if the node hasn't been changed meanwhile. If yes, we abort the commit
            Element output =dbms.select("SELECT id, lastchanged FROM geoportal.nodes WHERE id=?;", Integer.parseInt(nodeid));
            dbms.select("WITH row AS (UPDATE geoportal.nodes SET (parentid, weight, isfolder, json, lastchanged) = (?, ? ,? ,?, (SELECT now()))  WHERE id=? RETURNING lastchanged ) SELECT lastchanged from row ;", 
                    parentid,
                    Integer.parseInt(node.getChildText("weight")),
                    isfolder, 
                    node.getChildText("jsonextensions"), 
                    Integer.parseInt(nodeid)  );
           
            if (!this.force) { 
                //we check if database content has changed since last load
                //if it does, abort the transaction and warn the user
                String dbchangedate = output.getChild(Jeeves.Elem.RECORD).getChildText("lastchanged");
                //System.out.println(dbchangedate);
                //System.out.println(lastchanged);
                //System.out.println(dbchangedate.compareTo(lastchanged));
                if (dbchangedate.compareTo(lastchanged)!=0) {
                    return -1; //will be the code to tell there is a changedate  error
                }
            }
        }
        return Integer.parseInt(nodeid);
    }

    /*
     * Gets the tree as an XML structure mixed with json for internal config (nodes config)
     * and saves it in the nodeBackups table, time-stamped
     * TODO : add restore function
     */
    private boolean backup(Dbms dbms, Element tree_xml) throws SQLException {
        String name = tree_xml.getChildText("name");

        //System.out.println("BACKUP : "+name);
        //transforms it to XML text (serializes the tree)
        XMLOutputter xmOut=new XMLOutputter(); 
        String tree = xmOut.outputString(tree_xml);
        System.out.println("INFO : backing up the previous layertree structure");
        //and commits it to the DB's table nodeBackups
        //id and date will be inserted automatically
        dbms.execute("INSERT INTO geoportal.\"nodesBackups\" (layertree, name) VALUES (?, ?);"
                ,tree, name);
        return true ; //count should be =1 since it changed one and only one column
        
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