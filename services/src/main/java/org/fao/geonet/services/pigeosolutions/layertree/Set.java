package org.fao.geonet.services.pigeosolutions.layertree;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.sql.DataSource;
import java.nio.file.Path;
import java.sql.*;

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

    public void init(Path appPath, ServiceConfig params) throws Exception {
        this.force = (params.getValue("force").equalsIgnoreCase("true"));
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {

        GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
        DataSource dataSource = (DataSource)context.getBean("jdbcDataSource");
        Connection con = dataSource.getConnection();

             if (!this.backup(con, params)) {
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
             int result = this.save(con, tree);
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
    private int save(Connection con, Element tree) throws SQLException {
        this.idslist = "";

        Statement stmt = null;
        String cleanRequest = "DELETE FROM geoportal.nodes WHERE id NOT IN ("+this.idslist +");"  ;

        try {
            con.setAutoCommit(false);
            stmt = con.createStatement();

            System.out.println("Saving the new tree structure...");
            System.out.println("BEGIN;");
            int result = this.saveChildren(tree, 0, con);
            this.idslist=this.idslist.substring(0, idslist.length()-1);//we remove the last trailing ','
            stmt.executeQuery(cleanRequest);

            if (result == 1) {
                con.commit();
                System.out.println("COMMIT;");
                System.out.println("done;");
            } else {
                con.rollback();
                System.out.println("ROLLBACK;");
                System.out.println("Error executing SQL requests;");
                return result;
            }
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            con.setAutoCommit(true);
        }
        return 1 ;
    }

    private int saveChildren(Element root, int parentid, Connection con) throws SQLException {
        int id=0; 
        java.util.List list = root.getChildren("children");

        for (int i = 0; i < list.size(); i++) {
            Element node = (Element) list.get(i);
            id = this.saveNode(parentid, node, con);
            if (id < 0) return id; //reports an error
            else idslist+=id+",";
            if (!node.getChildren("children").isEmpty()) {
                this.saveChildren((Element) node.clone(), id, con);
            }
        }
        return 1;
    }

    /*
     * Builds the request for creating/updating the node. Will be executed as a whole in the save function
     */
    private int saveNode(int parentid, Element node, Connection con) throws SQLException {
        String req="";
        String nodeid = node.getChildText("id");

        String isfolder = node.getChildText("isfolder");
        String lastchanged = node.getChildText("lastchanged");

        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {

            if (nodeid.startsWith("x")) { //it's a new node, we need to create it
            /*we'll have to get back the id of the inserted row, and use it as parentid for children
             * of this row, if it is a folder.
             */
                pstmt = con.prepareStatement("WITH row AS (INSERT INTO geoportal.nodes (parentid, weight, isfolder, json) VALUES (?, ?, ?, ?) RETURNING id ) SELECT id from row ;");
                pstmt.setInt(1, parentid);
                pstmt.setInt(2, Integer.parseInt(node.getChildText("weight")));
                pstmt.setString(3, isfolder);
                pstmt.setString(4, node.getChildText("jsonextensions"));
                rs = pstmt.executeQuery();
                while (rs.next()) {
                    nodeid = rs.getString("id");
                }
                System.out.println("recovered node id "+nodeid);

            } else { //it's an update of an existing node. We check if the node hasn't been changed meanwhile. If yes, we abort the commit

                pstmt = con.prepareStatement("WITH row AS (UPDATE geoportal.nodes SET (parentid, weight, isfolder, json, lastchanged) = (?, ? ,? ,?, (SELECT now()))  WHERE id=? RETURNING lastchanged ) SELECT lastchanged from row ;");
                pstmt.setInt(1, parentid);
                pstmt.setInt(2, Integer.parseInt(node.getChildText("weight")));
                pstmt.setString(3, isfolder);
                pstmt.setString(4, node.getChildText("jsonextensions"));
                pstmt.setInt(5, Integer.parseInt(nodeid));
                pstmt.execute();
                pstmt.close();

                if (!this.force) {
                    //we check if database content has changed since last load
                    //if it does, abort the transaction and warn the user
                    pstmt = con.prepareStatement("SELECT id, lastchanged FROM geoportal.nodes WHERE id=?;");
                    pstmt.setInt(1, Integer.parseInt(nodeid));
                    rs = pstmt.executeQuery();

                    String dbchangedate = null;
                    while (rs.next()) {
                        dbchangedate = rs.getString("lastchanged");
                    }

                    //System.out.println(dbchangedate);
                    //System.out.println(lastchanged);
                    //System.out.println(dbchangedate.compareTo(lastchanged));
                    if (dbchangedate != null && dbchangedate.compareTo(lastchanged)!=0) {
                        return -1; //will be the code to tell there is a changedate  error
                    }
                }
            }
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (pstmt != null) pstmt.close();
            if (rs != null) rs.close();
            if (con != null) con.close();
        }

        this.saveNodeGroupsRelations(nodeid, node, con);
        return Integer.parseInt(nodeid);
    }

    private void saveNodeGroupsRelations(String nodeid, Element node, Connection con) throws SQLException {
        //remove previous entries
        String req = "DELETE FROM geoportal.\"iNodeGroup\" WHERE nodeid="+nodeid+";";
        //Insert new entries
        //beware : this table lists groupes that are excluded from node view (much less
        //large than the contrary
        java.util.List groups = node.getChildren("group");
        for (int i = 0; i < groups.size(); i++) {
            Element group = (Element) groups.get(i);
            if (group.getChildText("show").equalsIgnoreCase("false")) {
                req+="INSERT INTO geoportal.\"iNodeGroup\" (nodeid, groupid) VALUES ("+nodeid+","+group.getChildText("id")+");";
            }
        }

        Statement stmt = null;
        ResultSet rs = null;

        try {
            stmt = con.createStatement();
            stmt.execute(req);
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
            if (con != null) con.close();
        }
    }

    /*
     * Gets the tree as an XML structure mixed with json for internal config (nodes config)
     * and saves it in the nodeBackups table, time-stamped
     * TODO : add restore function
     */
    private boolean backup(Connection con, Element tree_xml) throws SQLException {
        String name = tree_xml.getChildText("name");

        System.out.println("BACKUP : "+name);
        //transforms it to XML text (serializes the tree)
        XMLOutputter xmOut=new XMLOutputter(); 
        String tree = xmOut.outputString(tree_xml);
        System.out.println("INFO : backing up the previous layertree structure");
        //and commits it to the DB's table nodeBackups
        //id and date will be inserted automatically

        PreparedStatement pstmt = null;

        try {
            pstmt = con.prepareStatement("INSERT INTO geoportal.\"nodesBackups\" (layertree, name) VALUES (?, ?);");
            pstmt.setString(1, tree);
            pstmt.setString(2, name);

            //count should be =1 since it changed one and only one column
            return pstmt.execute();

        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (pstmt != null) pstmt.close();
            if (con != null) con.close();
        }
    }

    //TODO : mutualize with same function in Get class
    private void loadNodes(Connection con, Element parentXML, String where) throws SQLException {

        Statement stmt = null;
        ResultSet rs = null;
        String query = "SELECT id, parentid, weight, isfolder, json FROM geoportal.nodes "+where;

        try {
            stmt = con.createStatement();
            rs = stmt.executeQuery(query);
            while (rs.next()) {
                //loads the node itself
                String nodeId = rs.getString("id");
                Element nodeXML = new Element("children");
                nodeXML.addContent(new Element("id").setText(nodeId));
                nodeXML.addContent(new Element("jsonextensions").setText(rs.getString("json"))); //must not be the last item, as it may give way to parsing pbs (see layertree-2json.xsl)
                nodeXML.addContent(new Element("lastchanged").setText(rs.getString("lastchanged")));
                nodeXML.addContent(new Element("weight").setText(rs.getString("weight")));

                if (rs.getString("isfolder").equalsIgnoreCase("y")) {
                    String cond = "WHERE parentid="+nodeId+" AND id<>"+nodeId+"ORDER BY weight";
                    loadNodes(con, nodeXML, cond);
                } else {
                    nodeXML.addContent(new Element("leaf").setText("true"));
                }
                parentXML.addContent(nodeXML);
            }
        } catch (SQLException e ) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
            if (con != null) con.close();
        }
    }    
    
}