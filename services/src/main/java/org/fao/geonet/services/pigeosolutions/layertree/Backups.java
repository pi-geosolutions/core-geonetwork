package org.fao.geonet.services.pigeosolutions.layertree;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.xml.sax.InputSource;

import javax.sql.DataSource;
import java.io.StringReader;
import java.nio.file.Path;
import java.sql.*;


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

    public void init(Path appPath, ServiceConfig params) throws Exception {
        String mode = params.getValue("mode");
        if (mode!=null) this.mode= Mode.valueOf(mode);
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {
        GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
        DataSource dataSource = gc.getBean(DataSource.class);
        Connection con = dataSource.getConnection();
        Element response = new Element(Jeeves.Elem.RESPONSE);

        switch (this.mode){
            case list :
                response.addContent(this.getBackupsList(con));
                break;
            case get :
                response.addContent(this.getBackup(params, con));
                break;
            case remove:
                boolean ok = this.removeBackup(params, con);
                Element el = new Element("removed");
                el.setText(String.valueOf(ok));
                response.addContent(el);
                break;
        }
        // --- return data
        return response;
    }

    private Element getBackup(Element params, Connection con) throws SQLException {
        String id = "";
        if (params.getName()=="id") {
            id = params.getText();
        } else {
            //TODO: id = Util.getParam(params, "id");
        }
        if (id==null) return new Element("failure");

        PreparedStatement pstmt = null;
        ResultSet rs = null;
        Element tree = null;

        try {
            pstmt = con.prepareStatement("SELECT id, name, layertree FROM geoportal.\"nodesBackups\" WHERE id =?;");
            pstmt.setInt(1, Integer.parseInt(id));
            rs = pstmt.executeQuery();
            while (rs.next()) {
                SAXBuilder sxb = new SAXBuilder();
                String tree_text = rs.getString("layertree");
                try
                {
                    Document document=sxb.build(new InputSource(new StringReader(tree_text)));
                    tree = document.detachRootElement();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return tree;

            }
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (pstmt != null) pstmt.close();
            if (rs != null) rs.close();
            if (con != null) con.close();
        }
        return new Element("failure");
    }

    private boolean removeBackup(Element params, Connection con) throws SQLException {
        if (params.getName()!="id") return false ; //bad POST data
        PreparedStatement pstmt = null;

        try {
            String id = params.getText();
            pstmt = con.prepareStatement("DELETE FROM geoportal.\"nodesBackups\" WHERE id =?;");
            pstmt.setInt(1, Integer.parseInt(id));
            return pstmt.execute();
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (pstmt != null) pstmt.close();
            if (con != null) con.close();
        }
    }

    private Element getBackupsList(Connection con) throws SQLException {
        Statement stmt = null;
        ResultSet rs = null;
        String query = "SELECT id, date, name FROM geoportal.\"nodesBackups\" ORDER BY date DESC LIMIT 50";
        Element list = new Element("list");

        try {
            stmt = con.createStatement();
            rs = stmt.executeQuery(query);
            while (rs.next()) {
                Element record = new Element("record");
                record.addContent(new Element("id").setText(rs.getString("id")));
                record.addContent(new Element("layertree").setText(rs.getString("layertree")));
                record.addContent(new Element("name").setText(rs.getString("name")));
                record.addContent(new Element("timestamp").setText(rs.getString("timestamp")));
                list.addContent(record);
            }
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
            if (con != null) con.close();
        }
        return list;
    }

    /*
     * Loads the child nodes of parentXML, using the where clause.
     * The where clause can be of the form : "WHERE parentid=0 ORDER BY weight" or anything suitable
     */

    private void loadNodes(Connection con, Element parentXML, String where) throws SQLException {

        //lists child nodes
        Statement stmt = null;
        ResultSet rs = null;
        String query = "SELECT id, parentid, weight, isfolder, json, lastchanged FROM geoportal.nodes "+where;

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
                //load children if there are
                String cond = "WHERE parentid=" + nodeId + " AND id<>" + nodeId + "ORDER BY weight";
                loadNodes(con, nodeXML, cond);

                parentXML.addContent(nodeXML);
            }
        }  catch (SQLException e ) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
            if (con != null) con.close();
        }
    }
}