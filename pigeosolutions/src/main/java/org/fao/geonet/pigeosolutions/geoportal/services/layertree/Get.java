package org.fao.geonet.pigeosolutions.geoportal.services.layertree;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.domain.Group;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.repository.GroupRepository;
import org.jdom.Element;

import javax.sql.DataSource;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;


//=============================================================================

/** Retrieves a particular user */

public class Get implements Service {
    private String withGroups = "false";

    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    public void init(Path appPath, ServiceConfig params) throws Exception {
        withGroups = params.getValue("withGroups");
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

        Element response = new Element(Jeeves.Elem.RESPONSE);
        Element layertreeXML = new Element("tree");
        response.addContent(layertreeXML);
        String selectClause="";
        String whereClause1 = "";
        String whereClause2 = "";

        UserSession usrSess = context.getUserSession();
        Profile myProfile = usrSess.getProfile();
        String myUserId = usrSess.getUserId();

        try {
            if (myProfile == null) { // guest "all" user
                selectClause = "SELECT id, parentid, weight, isfolder, json, lastchanged FROM geoportal.nodes ";
                whereClause1 = "WHERE parentid=0 ";
                whereClause2 =                  " AND (id NOT IN (SELECT nodeid FROM geoportal.\"iNodeGroup\" WHERE groupid=1)) ORDER BY weight;";
                loadNodes(con, layertreeXML, null, selectClause, whereClause1, whereClause2);
            } else if (this.withGroups.equalsIgnoreCase("true") || myProfile == Profile.Administrator) {
                GroupRepository groupRepo = gc.getBean(GroupRepository.class);
                List<Group> groups = groupRepo.findAll();
                selectClause = "SELECT id, parentid, weight, isfolder, json, lastchanged, excludes, excludes_id FROM geoportal.\"vNodesWithExcludes\" ";
                whereClause1 = "WHERE parentid=0 ";
                whereClause2 =                  " ORDER BY weight";
                loadNodes(con, layertreeXML, groups, selectClause, whereClause1, whereClause2);
            } else {// logged in user
                selectClause = "SELECT id, parentid, weight, isfolder, json, lastchanged FROM geoportal.nodes ";
                whereClause1 = "WHERE parentid=0 ";
                whereClause2 =                  " AND ((id NOT IN (SELECT DISTINCT nodeid FROM geoportal.\"iNodeGroup\")) OR (id IN (SELECT DISTINCT nodeid FROM geoportal.\"vNodeGroupIncludes\" WHERE groupid IN (SELECT DISTINCT id FROM Groups, UserGroups WHERE groupId=id AND userId="+myUserId+")))) ORDER BY weight;";
                loadNodes(con, layertreeXML, null, selectClause, whereClause1, whereClause2);
            }
        } catch (SQLException e ) {
            throw e;
        } finally {
            if (con != null) con.close();
        }
        return response;
    }

    /*
     * Loads the child nodes of parentXML, using the where clause. The where clause can be of the form : "WHERE parentid=0 ORDER BY weight"
     * or anything suitable
     */
     
    private void loadNodes(Connection con, Element parentXML, List<Group> groups, String select, String where, String where_end) throws SQLException {
        Statement stmt = null;
        ResultSet rs = null;
        String query = select + where + where_end;

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
                if (groups != null) { //if groupsXML==null, it's most probably we are accessing the admin interface without being logged in : abnormal situation case
                    for(Group group : groups) {
                        Element groupXML = new Element("groupsAccessRules");
                        boolean show = true;
                        String[] excludeIds = rs.getString("excludes_id").split(",");
                        Arrays.sort(excludeIds);
                        int index =Arrays.binarySearch(excludeIds,  group.getId());
                        show = (index < 0); //are listed in exclude the groups for which we want the node NOT to be shown
                        //so, show is true if the binary Search is negative !
                        groupXML.addContent(new Element("show").setText(String.valueOf(show)));
                        groupXML.setName("group");
                        groupXML.setName("group");
                        nodeXML.addContent(groupXML);

                    }
                }
                //load children if there are
                String cond = "WHERE parentid="+nodeId+" ";
                loadNodes(con, nodeXML, groups, select, cond, where_end);
                parentXML.addContent(nodeXML);
            }
        } catch (SQLException e ) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
        }
    }
}