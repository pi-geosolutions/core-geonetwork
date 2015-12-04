package org.fao.geonet.services.pigeosolutions.layers;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.dbcp.BasicDataSource;
import org.fao.geonet.ApplicationContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.sql.DataSource;
import java.io.IOException;
import java.sql.*;
import java.util.List;

/**
 * Created by fgravin on 26/11/2015.
 */

@Controller
public class GetChartData  {

    private @Autowired
    List<BasicDataSource> datasources;

    @RequestMapping(value="/{lang}/pigeo.layers.listchartingdbs", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONArray list() throws IOException, SQLException {

        JSONArray ret = new JSONArray();
        for(BasicDataSource ds : datasources) {
            ret.add(ds.getUrl());
        }
        return ret;
    }


    @RequestMapping(value="/{lang}/pigeo.layers.getchartdata", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONArray get(
            @RequestParam String source,
            @RequestParam String tables,
            @RequestParam (required = false) String fields,
            @RequestParam(required = false) String where
    ) throws IOException, SQLException {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        BasicDataSource customDataSource = (BasicDataSource)appContext.getBean(source);
        Connection con = customDataSource.getConnection();
        JSONArray ret = new JSONArray();

        String[] tablesArray = tables.split(",");
        for(String table : tablesArray) {
            JSONObject o = new JSONObject();
            o.put("table", table);
            o.put("features", getFeatures(con, table, fields, where));
            ret.add(o);
        }

        return ret;
    }

    private JSONArray getFeatures(Connection con, String table, String fields, String where) throws SQLException {
        JSONArray ret = new JSONArray();
        String req = "SELECT " + this.quoteFields(fields) + " FROM " + this.quoteTable(table) + " ";
        if (where != "") {
            req += "WHERE " + where;
        }
        req += ";";
        System.out.println(req);

        Statement stmt = null;
        ResultSet rs = null;

        try {
            stmt = con.createStatement();
            rs = stmt.executeQuery(req);
            ResultSetMetaData rsmd = rs.getMetaData();

            while (rs.next()) {
                JSONObject o = new JSONObject();
                for (int i = 1; i <= rsmd.getColumnCount(); i++) {
                    o.put(rsmd.getColumnName(i), rs.getString(i));
                }
                ret.add(o);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
        }
        return ret;
    }

    private String quoteFields(String fields) {
        String fieldslist="";
        String[] tb = fields.split(",");
        for (int i=0 ; i  < tb.length ; i++) {
            fieldslist += "\""+tb[i]+"\",";
        }
        fieldslist = fieldslist.substring(0, fieldslist.length() -1); //trim last comma

        return fieldslist;
    }

    private String quoteTable(String tbname) {
        String quotedName="\""+tbname+"\"";
        //in case we use schemas names (schema distinct from public), we must split the schema name and the table name, and quote each
        quotedName = quotedName.replace(".", "\".\"");
        return quotedName;
    }

}