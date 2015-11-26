package org.fao.geonet.services.pigeosolutions.layertree;

import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;
import jeeves.server.dispatchers.ServiceManager;
import jeeves.server.sources.http.JeevesServlet;
import net.sf.json.JSONObject;
import org.fao.geonet.ApplicationContextHolder;
import org.fao.geonet.domain.Group;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.repository.GroupRepository;
import org.fao.geonet.utils.Xml;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;

/**
 * Created by fgravin on 21/11/2015.
 */

@Controller
public class GETMVC {

    @Autowired
    private DataSource dataSource;


    @RequestMapping(value = "/{lang}/testflo", produces= MediaType.APPLICATION_XML_VALUE)
    @ResponseBody
    public Element getLayerTree(
            @PathVariable String lang,
            @RequestParam(value = "withGroups", defaultValue = "false", required = false) String withGroups,
            HttpSession session) throws Exception {

        String appPath = session.getServletContext().getRealPath("/");
        File transformFile = new File(appPath, "xslt/pigeo/geoportal/layertree-2json.xsl");

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        //LayerTreeNodeRepository categoryRepository = appContext.getBean(LayerTreeNodeRepository.class);
        Connection con = dataSource.getConnection();
        Element layertreeXML = new Element("tree");

        Profile myProfile = Profile.Guest;
        String myUserId = null;
        Object tmp = session.getAttribute(JeevesServlet.USER_SESSION_ATTRIBUTE_KEY);

        if (tmp instanceof UserSession) {
            UserSession usrSess = (UserSession) tmp;
            myProfile = usrSess.getProfile();
            myUserId = usrSess.getUserId();
        }

        JSONObject result = new JSONObject();
        String selectClause="";
        String whereClause1 = "";
        String whereClause2 = "";

        if (myProfile == null) { // guest "all" user
            selectClause = "SELECT id, parentid, weight, isfolder, json, lastchanged FROM geoportal.nodes ";
            whereClause1 = "WHERE parentid=0 ";
            whereClause2 =                  " AND (id NOT IN (SELECT nodeid FROM geoportal.\"iNodeGroup\" WHERE groupid=1)) ORDER BY weight;";
            loadNodes(con, layertreeXML, null, selectClause, whereClause1, whereClause2);

        } else if (withGroups.equalsIgnoreCase("true") || myProfile == Profile.Administrator) {
            GroupRepository groupRepo = appContext.getBean(GroupRepository.class);
            List<Group> groups = groupRepo.findAll();
/*
            this.groupsXML = dbms.select("SELECT id, name FROM groups ORDER BY id;");
            this.groupsXML.setName("groupsAccessRules");
*/
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

        Element output = Xml.transform(layertreeXML, transformFile.toPath());
        String r = new XMLOutputter().outputString(output);
        result.put("success", true);
        return layertreeXML;
    }

    /*
     * Loads the child nodes of parentXML, using the where clause. The where clause can be of the form : "WHERE parentid=0 ORDER BY weight"
     * or anything suitable
     */

    private void loadNodes(Connection con, Element parentXML, List<Group> groups, String select, String where, String where_end) throws SQLException {

        Statement stmt = null;
        String query = select + where + where_end;

        try {
            stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery(query);
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
        } finally {
            if (stmt != null) { stmt.close(); }
        }
    }

    private ServiceContext createServiceContext(String lang, HttpServletRequest request) {
        final ServiceManager serviceManager = ApplicationContextHolder.get().getBean(ServiceManager.class);
        return serviceManager.createServiceContext("atom.service", lang, request);
    }

}
